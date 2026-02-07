import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import axios, { type Method } from "axios";
import type { Input, Output } from "./schemas";

function getErrText(err: any, def = ""): string {
  const msg: string =
    typeof err === "string"
      ? err
      : err?.response?.data?.message ||
        err?.response?.message ||
        err?.message ||
        err?.response?.data?.msg ||
        err?.response?.msg ||
        err?.msg ||
        def;
  return msg;
}

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve("");
    }, ms);
  });

const htmlTable2Md = (content: string): string => {
  return content.replace(/<table>[\s\S]*?<\/table>/g, (htmlTable) => {
    try {
      // Clean up whitespace and newlines
      const cleanHtml = htmlTable.replace(/\n\s*/g, "");
      const rows = cleanHtml.match(/<tr>(.*?)<\/tr>/g);
      if (!rows) return htmlTable;

      // Parse table data
      const tableData: string[][] = [];
      let maxColumns = 0;

      // Try to convert to markdown table
      rows.forEach((row, rowIndex) => {
        if (!tableData[rowIndex]) {
          tableData[rowIndex] = [];
        }
        let colIndex = 0;
        const cells = row.match(/<td.*?>(.*?)<\/td>/g) || [];

        cells.forEach((cell) => {
          while (tableData[rowIndex]?.[colIndex]) {
            colIndex++;
          }
          const colspan = parseInt(
            cell.match(/colspan="(\d+)"/)?.[1] || "1",
            10,
          );
          const rowspan = parseInt(
            cell.match(/rowspan="(\d+)"/)?.[1] || "1",
            10,
          );
          const content = cell.replace(/<td.*?>|<\/td>/g, "").trim();

          for (let i = 0; i < rowspan; i++) {
            for (let j = 0; j < colspan; j++) {
              if (!tableData[rowIndex + i]) {
                tableData[rowIndex + i] = [];
              }
              const row = tableData[rowIndex + i];
              if (row) {
                row[colIndex + j] = i === 0 && j === 0 ? content : "^^";
              }
            }
          }
          colIndex += colspan;
          maxColumns = Math.max(maxColumns, colIndex);
        });

        for (let i = 0; i < maxColumns; i++) {
          if (!tableData[rowIndex][i]) {
            tableData[rowIndex][i] = " ";
          }
        }
      });
      const chunks: string[] = [];

      const headerCells = (tableData[0] || [])
        .slice(0, maxColumns)
        .map((cell) => (cell === "^^" ? " " : cell || " "));
      const headerRow = `| ${headerCells.join(" | ")} |`;
      chunks.push(headerRow);

      const separator = `| ${Array(headerCells.length).fill("---").join(" | ")} |`;
      chunks.push(separator);

      tableData.slice(1).forEach((row) => {
        const paddedRow = row
          .slice(0, maxColumns)
          .map((cell) => (cell === "^^" ? " " : cell || " "));
        while (paddedRow.length < maxColumns) {
          paddedRow.push(" ");
        }
        chunks.push(`| ${paddedRow.join(" | ")} |`);
      });

      return chunks.join("\n");
    } catch (_error) {
      return htmlTable;
    }
  });
};

type ApiResponseDataType<T = any> = {
  code: string;
  msg?: string;
  data: T;
};

const useDoc2xServer = ({ apiKey }: { apiKey: string }) => {
  // Init request
  const instance = axios.create({
    baseURL: "https://v2.doc2x.noedgeai.com/api",
    timeout: 60000,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  // Response check
  const checkRes = (data: ApiResponseDataType) => {
    if (data === undefined) {
      return Promise.reject("服务器异常");
    }
    return data;
  };
  const responseError = (err: any) => {
    if (!err) {
      return Promise.reject({ message: "[Doc2x] Unknown error" });
    }
    if (typeof err === "string") {
      return Promise.reject({ message: `[Doc2x] ${err}` });
    }
    if (typeof err.data === "string") {
      return Promise.reject({ message: `[Doc2x] ${err.data}` });
    }
    if (err?.response?.data) {
      return Promise.reject({
        message: `[Doc2x] ${getErrText(err?.response?.data)}`,
      });
    }
    if (typeof err.message === "string") {
      return Promise.reject({ message: `[Doc2x] ${err.message}` });
    }

    return Promise.reject({ message: `[Doc2x] ${getErrText(err)}` });
  };
  const request = <T>(
    url: string,
    data: any,
    method: Method,
  ): Promise<ApiResponseDataType<T>> => {
    // Remove empty data
    for (const key in data) {
      if (data[key] === undefined) {
        delete data[key];
      }
    }

    return instance
      .request({
        url,
        method,
        data: ["POST", "PUT"].includes(method) ? data : undefined,
        params: !["POST", "PUT"].includes(method) ? data : undefined,
      })
      .then((res) => checkRes(res.data))
      .catch((err) => responseError(err));
  };

  const parsePDF = async (fileBuffer: Buffer) => {
    // 1. Get pre-upload URL first
    const {
      code,
      msg,
      data: preupload_data,
    } = await request<{ uid: string; url: string }>(
      "/v2/parse/preupload",
      {},
      "POST",
    );
    if (!["ok", "success"].includes(code)) {
      return Promise.reject(`[Doc2x] Failed to get pre-upload URL: ${msg}`);
    }
    const upload_url = preupload_data.url;
    const uid = preupload_data.uid;

    // 2. Upload file to pre-signed URL with binary stream
    const blob = new Blob([fileBuffer as any], { type: "application/pdf" });
    const response = await axios
      .put(upload_url, blob, {
        headers: {
          "Content-Type": "application/pdf",
        },
      })
      .catch((error) => {
        return Promise.reject(
          `[Doc2x] Failed to upload file: ${getErrText(error)}`,
        );
      });
    if (response.status !== 200) {
      return Promise.reject(
        `[Doc2x] Upload failed with status ${response.status}: ${response.statusText}`,
      );
    }

    await delay(5000);

    // 3. Get the result by uid
    const checkResult = async () => {
      // 10 minutes
      let retry = 120;

      while (retry > 0) {
        try {
          const {
            code,
            data: result_data,
            msg,
          } = await request<{
            progress: number;
            status: "processing" | "failed" | "success";
            result: {
              pages: {
                md: string;
              }[];
            };
          }>(`/v2/parse/status?uid=${uid}`, null, "GET");

          // Error
          if (!["ok", "success"].includes(code)) {
            return Promise.reject(
              `[Doc2x] Failed to get result (uid: ${uid}): ${msg}`,
            );
          }

          // Process
          if (["ready", "processing"].includes(result_data.status)) {
            await delay(5000);
          }

          // Finish
          if (result_data.status === "success") {
            return {
              text: result_data.result.pages
                .map((page) => page.md)
                .join("")
                .replace(/\\[()]/g, "$")
                .replace(/\\[[\]]/g, "$$")
                .replace(
                  /<img\s+src="([^"]+)"(?:\s*\?[^>]*)?(?:\s*\/>|>)/g,
                  "![img]($1)",
                )
                .replace(/<!-- Media -->/g, "")
                .replace(/<!-- Footnote -->/g, "")
                .replace(/<!-- Meanless:[\s\S]*?-->/g, "")
                .replace(/<!-- figureText:[\s\S]*?-->/g, "")
                .replace(
                  /\$(.+?)\s+\\tag\{(.+?)\}\$/g,
                  "$$$1 \\qquad \\qquad ($2)$$",
                )
                .replace(
                  /\\text\{([^}]*?)(\b\w+)_(\w+\b)([^}]*?)\}/g,
                  "\\text{$1$2\\_$3$4}",
                )
                .trim(),
              pages: result_data.result.pages.length,
            };
          }
        } catch (_error) {
          // Just network error
          await delay(500);
        }

        retry--;
      }
      return Promise.reject(
        `[Doc2x] Failed to get result (uid: ${uid}): Process timeout`,
      );
    };

    const { text, pages } = await checkResult();

    const formatText = htmlTable2Md(text);

    return {
      pages,
      text: formatText,
    };
  };

  return {
    parsePDF,
  };
};

export async function handler(
  input: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const { apikey, files } = input;

  if (!apikey) {
    return Promise.reject(`API key is required`);
  }
  const successResult: string[] = [];
  const failedResult: string[] = [];

  const doc2x = useDoc2xServer({ apiKey: apikey });

  //Process each file one by one
  for (const url of files) {
    try {
      //Fetch the pdf and check its content type
      const PDFResponse = await axios
        .get(url, {
          responseType: "arraybuffer",
          proxy: false,
          timeout: 20000,
        })
        .catch((error) => {
          throw new Error(
            `[Fetch PDF Error] Failed to fetch PDF: ${getErrText(error)}`,
          );
        });

      if (PDFResponse.status !== 200) {
        throw new Error(
          `[Fetch PDF Error] Failed with status ${PDFResponse.status}: ${PDFResponse.data}`,
        );
      }

      const contentType = PDFResponse.headers["content-type"];
      if (!contentType || !contentType.startsWith("application/pdf")) {
        continue;
      }

      const result = await doc2x.parsePDF(Buffer.from(PDFResponse.data));
      successResult.push(result.text);
    } catch (error) {
      failedResult.push(getErrText(error));
    }
  }

  return {
    result: successResult.join("\n------\n"),
    error: failedResult.join("\n------\n"),
    success: failedResult.length === 0,
  };
}

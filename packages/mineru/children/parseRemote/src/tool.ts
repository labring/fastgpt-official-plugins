import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import JSZip from "jszip";
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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryFn<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
    }
  }
  throw new Error("retryFn: should not reach here");
}

interface FileType {
  is_ocr: boolean;
  url: string;
  data_id?: string;
}

interface BatchPayloadType {
  enable_formula: boolean;
  enable_table: boolean;
  language: string;
  model_version: string;
  extra_formats: string[];
  files: FileType[];
}

interface ApiResponseDataType<T> {
  code:
    | 0
    | "A0202"
    | "A0211"
    | "-500"
    | "-10001"
    | "-10002"
    | "-60001"
    | "-60002"
    | "-60003"
    | "-60004"
    | "-60005"
    | "-60006"
    | "-60007"
    | "-60008"
    | "-60009"
    | "-60010"
    | "-60011"
    | "-60012"
    | "-60013"
    | "-60014"
    | "-60015"
    | "-60016";
  msg: string;
  trace_id: string;
  data: T;
}

type BatchResponseDataType = ApiResponseDataType<{
  batch_id: string;
}>;

type ExtractResultItemType = {
  file_name: string;
  state:
    | "done"
    | "waiting-file"
    | "pending"
    | "running"
    | "failed"
    | "converting";
  err_msg: string;
  full_zip_url: string;
};
type ExtractBatchType = ApiResponseDataType<{
  batch_id: string;
  extract_result: ExtractResultItemType[];
}>;

interface ParsedItemType {
  filename: string;
  errorMsg?: string;
  content?: string;
  html?: string;
}

type PropsType = Input;
interface InnerPropsType extends PropsType {
  headers: Record<string, string>;
}

const ErrorCodeMap: Record<string, string> = {
  A0202: "Token 错误",
  A0211: "Token 过期",
  "-500": "传参错误",
  "-10001": "服务异常",
  "-10002": "请求参数错误",
  "-60001": "生成上传 URL 失败",
  "-60002": "获取匹配的文件格式失败",
  "-60003": "文件读取失败",
  "-60004": "空文件",
  "-60005": "文件大小超出限制",
  "-60006": "文件页数超过限制",
  "-60007": "模型服务暂时不可用",
  "-60008": "文件读取超时",
  "-60009": "任务提交队列已满",
  "-60010": "解析失败",
  "-60011": "获取有效文件失败",
  "-60012": "找不到任务",
  "-60013": "没有权限访问该任务",
  "-60014": "删除运行中的任务",
  "-60015": "文件转换失败",
  "-60016": "文件转换为指定格式失败",
};

async function fetchWithTimeout(
  input: string | URL | Request,
  init: RequestInit = {},
  timeoutMs = 30000,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function replaceImageUrl(content: string, images: Record<string, string>) {
  for (const [key, value] of Object.entries(images)) {
    content = content.replace(new RegExp(`images/${key}`, "g"), value);
  }
  return content;
}

async function batchParse(props: InnerPropsType): Promise<string> {
  const {
    base_url,
    headers,
    files,
    is_ocr,
    enable_formula,
    enable_table,
    language,
    model_version,
    extra_formats,
  } = props;
  const url = new URL(base_url);
  const batchUrl = `${url.origin}/api/v4/extract/task/batch`;
  const payload: BatchPayloadType = {
    enable_formula,
    enable_table,
    language,
    model_version,
    extra_formats,
    files: files.map((file) => ({
      url: file,
      is_ocr,
    })),
  };
  const res = await fetchWithTimeout(
    batchUrl,
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    },
    30000,
  );
  const data: BatchResponseDataType = await res.json();

  if (data.code !== 0) {
    throw new Error(
      data.msg || ErrorCodeMap[String(data.code)] || "Unknown error",
    );
  }

  return data.data.batch_id;
}

async function extractResult(
  batchId: string,
  props: InnerPropsType,
  _ctx: ToolContextType,
): Promise<ParsedItemType[]> {
  async function extractFromZip(zipUrl: string) {
    const zipResponse = await fetchWithTimeout(
      zipUrl,
      {
        method: "GET",
      },
      60000,
    );

    if (!zipResponse.ok) {
      return Promise.reject(
        `[MinerU][extractFromZip] download zip failed: ${zipResponse.status} ${zipResponse.statusText}`,
      );
    }

    const arrayBuffer = await zipResponse.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    const result: {
      images: Record<string, string>;
      content: string;
      html: string;
    } = {
      images: {},
      content: "",
      html: "",
    };

    // Upload images (collect tasks)
    const imageUploadTasks: Promise<void>[] = [];
    zip.folder("images")?.forEach((relativePath, file) => {
      imageUploadTasks.push(
        (async () => {
          const image = await file.async("base64");
          const { accessUrl } = await _ctx.emitter.uploadFile({
            base64: image,
            defaultFilename: file.name,
          });
          result.images[relativePath] = accessUrl;
        })(),
      );
    });
    await Promise.all(imageUploadTasks);

    // Process files (collect tasks)
    const fileProcessTasks: Promise<void>[] = [];
    zip.forEach((_, file) => {
      if (file.dir) return;

      if (file.name.endsWith(".md")) {
        fileProcessTasks.push(
          (async () => {
            result.content = await file.async("text");
          })(),
        );
      } else if (file.name.endsWith(".html")) {
        fileProcessTasks.push(
          (async () => {
            result.html = await file.async("text");
          })(),
        );
      }
    });
    await Promise.all(fileProcessTasks);

    // Replace image URLs in markdown content after images are uploaded
    if (result.content) {
      result.content = replaceImageUrl(result.content, result.images);
    }

    return result;
  }

  const { base_url, headers } = props;
  const MAX_RETRIES = 100;
  const DELAY_MS = 5000;
  const url = new URL(base_url);

  let parseResult: ExtractResultItemType[] = [];

  const checkResult = async () => {
    const extractResultUrl = `${url.origin}/api/v4/extract-results/batch/${batchId}`;
    const res = await fetchWithTimeout(
      extractResultUrl,
      {
        method: "GET",
        headers,
      },
      30000,
    );
    const data: ExtractBatchType = await res.json();

    if (data.code !== 0) {
      return Promise.reject(
        data.msg || ErrorCodeMap[String(data.code)] || "Unknown error",
      );
    }

    return data.data.extract_result;
  };

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      parseResult = await checkResult();

      const isFinished = parseResult.every(
        (item) => item.state === "done" || item.state === "failed",
      );

      if (isFinished) {
        break;
      }

      await delay(DELAY_MS);
    } catch (error) {
      await delay(DELAY_MS);
    }
  }

  const parseZipResult: ParsedItemType[] = await Promise.all(
    parseResult.map(async (item) => {
      if (item.state === "done") {
        try {
          const result = await retryFn(() => extractFromZip(item.full_zip_url));
          return {
            filename: item.file_name,
            content: result.content,
            html: result.html,
          };
        } catch (error) {
          return {
            filename: item.file_name,
            errMsg: getErrText(error),
          };
        }
      }

      return {
        filename: item.file_name,
        errMsg: item.err_msg,
      };
    }),
  );

  return parseZipResult;
}

export async function handler(
  props: PropsType,
  _ctx: ToolContextType,
): Promise<Output> {
  const { base_url, token } = props;

  const innerProps: InnerPropsType = {
    ...props,
    base_url: base_url || "https://mineru.net",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      source: "fastgpt",
    },
  };

  const batchId = await batchParse(innerProps);
  const result = await extractResult(batchId, innerProps, _ctx);

  return {
    result,
  };
}

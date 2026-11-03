import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineTool,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({
  baseUrl: z.string().meta({
    title: "Base URL",
    description:
      "SoMark API base URL for Mainland China, overseas, or self-hosted deployments.",
    "x-i18n": {
      title: { en: "Base URL", "zh-CN": "服务地址" },
      description: {
        en: "Mainland China: https://somark.cn/api/v1 | Outside Mainland China: https://somark.ai/api/v1 | Self-hosted: local URL",
        "zh-CN":
          "中国大陆：https://somark.cn/api/v1；海外：https://somark.ai/api/v1；私有化部署：本地地址。",
      },
    },
    isSecret: false,
  }),
  apiKey: z
    .string()
    .optional()
    .meta({
      title: "API Key",
      description:
        "Required for the public API. Purchase at somark.cn/workbench/purchase in Mainland China or somark.ai/studio/purchase overseas; private deployments do not require it.",
      "x-i18n": {
        title: { en: "API key", "zh-CN": "API 密钥" },
        description: {
          en: "Required for the public API. Purchase at https://somark.cn/workbench/purchase (Mainland China) or https://somark.ai/studio/purchase (outside Mainland China). Not required for self-hosted deployments.",
          "zh-CN":
            "使用公共 API 时必填（以 sk- 开头）。可在 https://somark.cn/workbench/purchase（中国大陆）或 https://somark.ai/studio/purchase（海外）购买；私有化部署无需填写。",
        },
      },
      isSecret: true,
    }),
});

const inputSchema = defineInputSchema({
  file: {
    type: z.array(z.string()),
    title: { en: "Files", "zh-CN": "文件" },
    description: {
      en: "One or more PDF, image, or Office file URLs to parse, processed in order.",
      "zh-CN":
        "待解析的文件 URL 数组，支持 PDF、图片、Office 格式，可传入一个或多个文件。",
    },
    isToolParam: true,
  },
  outputFormats: {
    type: z.array(z.enum(["json", "markdown"])).optional(),
    title: { en: "Output formats", "zh-CN": "输出格式" },
    description: {
      en: "Choose JSON and/or Markdown output. Defaults to both formats.",
      "zh-CN":
        "选择解析结果的输出格式，支持 JSON 和 Markdown。默认同时输出两种格式。",
    },
    isToolParam: true,
  },
  imageFormat: {
    type: z.enum(["url", "base64", "none"]).optional(),
    title: { en: "Image format", "zh-CN": "图片格式" },
    description: {
      en: "Image element format; defaults to URL.",
      "zh-CN": "选择图片元素的返回格式，默认为 URL 格式。",
    },
    isToolParam: true,
  },
  formulaFormat: {
    type: z.enum(["latex", "mathml", "ascii"]).optional(),
    title: { en: "Formula format", "zh-CN": "公式格式" },
    description: {
      en: "Formula format; defaults to LaTeX.",
      "zh-CN": "选择公式元素的返回格式，默认为 LaTeX 格式。",
    },
    isToolParam: true,
  },
  tableFormat: {
    type: z.enum(["markdown", "html", "image"]).optional(),
    title: { en: "Table format", "zh-CN": "表格格式" },
    description: {
      en: "Table format; defaults to HTML.",
      "zh-CN": "选择表格元素的返回格式，默认为 HTML 格式。",
    },
    isToolParam: true,
  },
  chemicalStructureFormat: {
    type: z.enum(["image"]).optional(),
    title: { en: "Chemical structure format", "zh-CN": "化学结构式格式" },
    description: {
      en: "Chemical structure format; currently only Image is supported.",
      "zh-CN": "选择化学结构式元素的返回格式，目前仅支持 Image 格式。",
    },
    isToolParam: true,
  },
  enableTextCrossPage: {
    type: z.boolean().optional(),
    title: { en: "Join text across pages", "zh-CN": "文字跨页拼接" },
    description: {
      en: "Merge text spanning multiple pages into continuous paragraphs.",
      "zh-CN": "跨页文字段合并为连续段落。",
    },
    isToolParam: true,
  },
  enableTableCrossPage: {
    type: z.boolean().optional(),
    title: { en: "Join tables across pages", "zh-CN": "表格跨页拼接" },
    description: {
      en: "Merge tables spanning multiple pages into complete tables.",
      "zh-CN": "跨页表格合并为完整表格。",
    },
    isToolParam: true,
  },
  enableTitleLevelRecognition: {
    type: z.boolean().optional(),
    title: { en: "Recognize heading levels", "zh-CN": "标题层级识别" },
    description: {
      en: "Recognize the document heading hierarchy.",
      "zh-CN": "识别文档标题层级结构。",
    },
    isToolParam: true,
  },
  enableInlineImage: {
    type: z.boolean().optional(),
    title: { en: "Return inline images", "zh-CN": "返回文中图" },
    description: {
      en: "Return images embedded in text paragraphs.",
      "zh-CN": "返回文字段落中的图片。",
    },
    isToolParam: true,
  },
  enableTableImage: {
    type: z.boolean().optional(),
    title: { en: "Return table images", "zh-CN": "返回表格图" },
    description: {
      en: "Return images inside table cells.",
      "zh-CN": "返回表格单元格内的图片。",
    },
    isToolParam: true,
  },
  enableImageUnderstanding: {
    type: z.boolean().optional(),
    title: { en: "Understand images", "zh-CN": "图片理解" },
    description: {
      en: "Generate semantic understanding and structured descriptions of document images.",
      "zh-CN": "对文档内图片进行语义理解和结构化描述。",
    },
    isToolParam: true,
  },
  keepHeaderFooter: {
    type: z.boolean().optional(),
    title: { en: "Keep headers and footers", "zh-CN": "保留页眉页脚" },
    description: {
      en: "Keep header and footer content in the output.",
      "zh-CN": "开启后保留页眉页脚内容。",
    },
    isToolParam: true,
  },
});

const outputSchema = defineOutputSchema({
  results: {
    type: z
      .array(
        defineOutputSchema({
          markdown: {
            type: z.string().default(""),
            title: { en: "Markdown", "zh-CN": "Markdown 内容" },
            description: {
              en: "Markdown output for this file.",
              "zh-CN": "当前文件的 Markdown 解析结果。",
            },
          },
          json: {
            type: z.record(z.string(), z.any()).default({}),
            title: { en: "JSON content", "zh-CN": "JSON 内容" },
            description: {
              en: "Structured JSON output for this file.",
              "zh-CN": "当前文件的结构化 JSON 解析结果。",
            },
          },
          error: {
            type: z.string().optional(),
            title: { en: "Error", "zh-CN": "错误信息" },
            description: {
              en: "Parsing error for this file, when present.",
              "zh-CN": "当前文件的解析错误（如有）。",
            },
          },
        }),
      )
      .default([]),
    title: { en: "Parsing results", "zh-CN": "解析结果" },
    description: {
      en: "Results in input order, one per file; each includes Markdown and JSON fields.",
      "zh-CN":
        "每个输入文件对应一个结果，按输入顺序返回。每项包含 markdown 和 json 字段。",
    },
  },
});

const handler = createToolHandler({
  inputSchema,
  outputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await InputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await toolCb(parsedInput);
    return OutputType.parseAsync(output);
  },
});

const tool = defineTool({
  manifest: {
    pluginId: "SoMarkDocumentParser",
    name: {
      en: "SoMark Document Parser",
      "zh-CN": "SoMark 文档解析",
    },
    description: {
      en: "Convert documents into structured Markdown or JSON using SoMark Document Parser.",
      "zh-CN":
        "使用 SoMark 文档解析工具将 PDF、图片、Office 等文档转换为结构化 Markdown 或 JSON。",
    },
    version: "0.1.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "初始版本，支持多文件串行解析、格式配置和 QPS 退避重试。",
    },
    tags: ["tools"],
  },
  handler,
});

export default tool;

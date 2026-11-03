import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
  type SecretSchemaMetaType,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as parseLocalInputType,
  OutputType as parseLocalOutputType,
  tool as parseLocalTool,
} from "./children/parseLocal";
import {
  InputType as parseRemoteInputType,
  OutputType as parseRemoteOutputType,
  tool as parseRemoteTool,
} from "./children/parseRemote";

const secretSchema = z.object({
  base_url: z
    .string()
    .optional()
    .meta({
      title: "Base URL（SaaS 无需填写）",
      description: "Example: https://mineru.net, http://127.0.0.1:8000",
      isSecret: false,
      "x-i18n": {
        title: {
          en: "Base URL (not required for SaaS)",
          "zh-CN": "Base URL（SaaS 无需填写）",
        },
        description: {
          en: "Example: https://mineru.net, http://127.0.0.1:8000",
          "zh-CN": "例如：https://mineru.net、http://127.0.0.1:8000",
        },
      },
    } satisfies SecretSchemaMetaType),
  token: z
    .string()
    .optional()
    .meta({
      title: "API Token",
      description:
        "官方在线 MinerU 解析服务的 API Token，可在 https://mineru.net/apiManage/docs 申请获取",
      isSecret: true,
      "x-i18n": {
        title: { en: "API token", "zh-CN": "API Token" },
        description: {
          en: "API token for the hosted MinerU parsing service. Apply at https://mineru.net/apiManage/docs.",
          "zh-CN":
            "官方在线 MinerU 解析服务的 API Token，可在 https://mineru.net/apiManage/docs 申请获取",
        },
      },
    } satisfies SecretSchemaMetaType),
});

const parsedFileOutputSchema = defineOutputSchema({
  filename: {
    type: z.string(),
    title: { en: "Filename", "zh-CN": "文件名" },
    description: { en: "Name of the parsed file.", "zh-CN": "解析文件名" },
  },
  markdown: {
    type: z.string(),
    title: { en: "Markdown content", "zh-CN": "Markdown 内容" },
    description: {
      en: "Markdown content parsed from this file.",
      "zh-CN": "当前文件解析后的 Markdown 内容",
    },
  },
  html: {
    type: z.string().optional(),
    title: { en: "HTML content", "zh-CN": "HTML 内容" },
    description: {
      en: "HTML content parsed from this file, if available.",
      "zh-CN": "当前文件解析后的 HTML 内容（如有）",
    },
  },
  images: {
    type: z.array(z.string()).optional(),
    title: { en: "Image URLs", "zh-CN": "图片链接" },
    description: {
      en: "URLs of images parsed from and uploaded for this file.",
      "zh-CN": "当前文件解析并上传后的图片链接列表",
    },
  },
  contentList: {
    type: z.array(z.any()).optional(),
    title: { en: "Structured content", "zh-CN": "结构化内容" },
    description: {
      en: "Structured content list parsed from this file.",
      "zh-CN": "当前文件解析后的结构化内容列表",
    },
  },
  errorMsg: {
    type: z.string().optional(),
    title: { en: "Error message", "zh-CN": "错误信息" },
    description: {
      en: "Error returned when parsing this file fails.",
      "zh-CN": "当前文件解析失败时的错误信息",
    },
  },
});
const parserOutputSchema = defineOutputSchema({
  result: {
    type: z.string(),
    title: { en: "Markdown result", "zh-CN": "Markdown 结果" },
    description: {
      en: "Markdown merged in input-file order, separated by horizontal rules.",
      "zh-CN": "按输入文件顺序合并后的 Markdown 内容，多个文件之间用分隔线分隔",
    },
  },
  files: {
    type: z.array(parsedFileOutputSchema),
    title: { en: "File parsing results", "zh-CN": "文件解析结果" },
    description: {
      en: "Parsing result for each input file, including filename, Markdown, images, HTML, structured content, or errors.",
      "zh-CN":
        "每个输入文件对应一个解析结果，包含文件名、Markdown、图片、HTML、结构化内容或错误信息",
    },
  },
});

const parseLocalSecretSchema = z.object({});
const parseLocalInputSchema = defineInputSchema({
  files: {
    type: z.array(z.string()),
    title: { en: "Files", "zh-CN": "文件" },
    description: {
      en: "URLs of files to parse. Supports PDF, PNG, JPG, and JPEG.",
      "zh-CN": "需要解析的文件 URL 数组，支持 PDF、PNG、JPG、JPEG 等格式",
    },
    isToolParam: true,
  },
  parse_method: {
    type: z.enum(["auto", "ocr", "txt"]).optional(),
    title: { en: "Parsing method", "zh-CN": "解析方法" },
    description: {
      en: "Parsing method; defaults to auto.",
      "zh-CN": "解析方法，默认 auto",
    },
    isToolParam: true,
  },
  formula_enable: {
    type: z.boolean().optional(),
    title: { en: "Enable formula recognition", "zh-CN": "开启公式识别" },
    description: {
      en: "Whether to enable formula recognition; defaults to true.",
      "zh-CN": "是否启动公式识别功能，默认 true",
    },
    isToolParam: true,
  },
  table_enable: {
    type: z.boolean().optional(),
    title: { en: "Enable table recognition", "zh-CN": "开启表格识别" },
    description: {
      en: "Whether to enable table recognition; defaults to true.",
      "zh-CN": "是否启动表格识别功能，默认 true",
    },
    isToolParam: true,
  },
  return_content_list: {
    type: z.boolean().optional(),
    title: { en: "Return structured JSON", "zh-CN": "返回结构化 JSON" },
    description: {
      en: "Whether to return structured JSON; defaults to false.",
      "zh-CN": "是否返回结构化 JSON，默认 false",
    },
    isToolParam: true,
  },
  lang_list: {
    type: z.string().optional(),
    title: { en: "Document languages", "zh-CN": "文档语言" },
    description: {
      en: "Comma-separated document language codes. Defaults to ch; when the list length differs from the file count, the first entry is used. See PaddleOCR supported languages for other values.",
      "zh-CN":
        "指定文档语言，默认 ch，长度跟文件数量一致，否则取第一个，按逗号分隔；其他可选值详见 PaddleOCR 支持语言列表",
    },
    isToolParam: true,
  },
  backend: {
    type: z
      .enum([
        "pipeline",
        "vlm-transformers",
        "vlm-sglang-engine",
        "vlm-sglang-client",
        "vllm-async-engine",
        "vllm-engine",
        "http-client",
      ])
      .optional(),
    title: { en: "Parsing backend", "zh-CN": "解析后端" },
    description: {
      en: "MinerU parsing backend; defaults to pipeline.",
      "zh-CN": "MinerU 解析后端，默认 pipeline",
    },
    isToolParam: true,
  },
  sglang_server_url: {
    type: z.string().optional(),
    title: { en: "SGLang server URL", "zh-CN": "SGLang 服务地址" },
    description: {
      en: "SGLang server URL; required when backend is vlm-sglang-client.",
      "zh-CN": "SGLang 服务地址，当 backend 为 vlm-sglang-client 时必填",
    },
    isToolParam: true,
  },
});
const parseLocalOutputSchema = parserOutputSchema;

const parseLocalHandler = createToolHandler({
  inputSchema: parseLocalInputSchema,
  outputSchema: parseLocalOutputSchema,
  secretSchema: parseLocalSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await parseLocalInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await parseLocalTool(parsedInput, ctx);
    return parseLocalOutputType.parseAsync(output);
  },
});

const parseRemoteSecretSchema = z.object({});
const parseRemoteInputSchema = defineInputSchema({
  files: {
    type: z.array(z.string()),
    title: { en: "Files", "zh-CN": "文件" },
    description: {
      en: "URLs of files to parse. Supports PDF, Word, PowerPoint, PNG, JPG, and JPEG.",
      "zh-CN":
        "需要解析的文件 URL 数组，支持 PDF、Office 文档、PNG、JPG、JPEG 等格式",
    },
    isToolParam: true,
  },
  is_ocr: {
    type: z.boolean().optional(),
    title: { en: "Enable OCR", "zh-CN": "开启 OCR" },
    description: {
      en: "Whether to force OCR parsing; defaults to false.",
      "zh-CN": "是否强制使用 OCR 解析，默认 false",
    },
    isToolParam: true,
  },
  enable_formula: {
    type: z.boolean().optional(),
    title: { en: "Enable formula recognition", "zh-CN": "开启公式识别" },
    description: {
      en: "Whether to enable formula recognition; defaults to true.",
      "zh-CN": "是否开启公式识别，默认 true",
    },
    isToolParam: true,
  },
  enable_table: {
    type: z.boolean().optional(),
    title: { en: "Enable table recognition", "zh-CN": "开启表格识别" },
    description: {
      en: "Whether to enable table recognition; defaults to true.",
      "zh-CN": "是否开启表格识别，默认 true",
    },
    isToolParam: true,
  },
  language: {
    type: z.string().optional(),
    title: { en: "Document language", "zh-CN": "文档语言" },
    description: {
      en: "Document language code; defaults to ch.",
      "zh-CN": "指定文档语言，默认 ch",
    },
    isToolParam: true,
  },
  extra_formats: {
    type: z.array(z.enum(["html"])).optional(),
    title: { en: "Additional output formats", "zh-CN": "额外输出格式" },
    description: {
      en: "Additional file formats to return; html is supported.",
      "zh-CN": "额外返回的文件格式；可选 html",
    },
    isToolParam: true,
  },
  model_version: {
    type: z.enum(["pipeline", "vlm"]).optional(),
    title: { en: "Model version", "zh-CN": "模型版本" },
    description: {
      en: "Parsing model version; defaults to pipeline.",
      "zh-CN": "解析模型版本，默认 pipeline",
    },
    isToolParam: true,
  },
});
const parseRemoteOutputSchema = parserOutputSchema;

const parseRemoteHandler = createToolHandler({
  inputSchema: parseRemoteInputSchema,
  outputSchema: parseRemoteOutputSchema,
  secretSchema: parseRemoteSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await parseRemoteInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await parseRemoteTool(parsedInput, ctx);
    return parseRemoteOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "mineru",
    name: {
      en: "MinerU",
      "zh-CN": "MinerU",
    },
    description: {
      en: "MinerU is a tool that can convert FILES to machine-readable formats (such as markdown, json).",
      "zh-CN":
        "MinerU 是一款可以在本地部署的将文件转化为机器可读格式的工具（如 markdown、json ）。",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "初始版本",
    },
    tags: ["productivity"],
    permission: ["file-upload:allow"],
    author: "gary-Shen",
  },
  secretSchema,
  children: [
    {
      id: "parseLocal",
      name: {
        en: "Local Deployment Parse",
        "zh-CN": "本地部署解析",
      },
      description: {
        en: "Parse the file using the local MinerU api v2, support pdf, png, jpg, jpeg, and other formats",
        "zh-CN":
          "使用本地部署的 MinerU api v2 解析文件，支持 pdf、png、jpg、jpeg 等多种格式",
      },
      handler: parseLocalHandler,
    },
    {
      id: "parseRemote",
      name: {
        en: "MinerU Saas Parse",
        "zh-CN": "MinerU Saas 解析",
      },
      description: {
        en: "Parse files using the official MinerU Sass, support .pdf, .doc, .docx, .ppt, .pptx, .png, .jpg, .jpeg",
        "zh-CN":
          "使用 MinerU 官方的 Saas 解析文件，支持.pdf、.doc、.docx、.ppt、.pptx、.png、.jpg、.jpeg",
      },
      handler: parseRemoteHandler,
    },
  ],
});

export default toolSet;

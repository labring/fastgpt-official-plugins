import {
  createToolHandler,
  defineToolSet,
  type InputSchemaMetaType,
  type OutputSchemaMetaType,
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
      title: "Base url(Saas 服务不需要填写)",
      description: "Example: https://mineru.net, http://127.0.0.1:8000",
      isSecret: false,
    } satisfies SecretSchemaMetaType),
  token: z
    .string()
    .optional()
    .meta({
      title: "API Token",
      description:
        "官方在线 MinerU 解析服务的 API Token，可在 https://mineru.net/apiManage/docs 申请获取",
      isSecret: true,
    } satisfies SecretSchemaMetaType),
});

const parsedFileOutputSchema = z.object({
  filename: z.string().meta({
    title: "文件名",
    description: "解析文件名",
  } satisfies OutputSchemaMetaType),
  markdown: z.string().meta({
    title: "Markdown 内容",
    description: "当前文件解析后的 Markdown 内容",
  } satisfies OutputSchemaMetaType),
  html: z
    .string()
    .optional()
    .meta({
      title: "HTML 内容",
      description: "当前文件解析后的 HTML 内容",
    } satisfies OutputSchemaMetaType),
  images: z
    .array(z.string())
    .optional()
    .meta({
      title: "图片链接",
      description: "当前文件解析并上传后的图片链接列表",
    } satisfies OutputSchemaMetaType),
  contentList: z
    .array(z.any())
    .optional()
    .meta({
      title: "结构化内容",
      description: "当前文件解析后的结构化内容列表",
    } satisfies OutputSchemaMetaType),
  errorMsg: z
    .string()
    .optional()
    .meta({
      title: "错误信息",
      description: "当前文件解析失败时的错误信息",
    } satisfies OutputSchemaMetaType),
});

const parserOutputSchema = z.object({
  result: z.string().meta({
    title: "Markdown 结果",
    description:
      "按输入文件顺序合并后的 Markdown 内容，多个文件之间用分隔线分隔",
  } satisfies OutputSchemaMetaType),
  files: z.array(parsedFileOutputSchema).meta({
    title: "文件解析结果",
    description:
      "每个输入文件对应一个解析结果，包含文件名、Markdown、图片、HTML、结构化内容或错误信息",
  } satisfies OutputSchemaMetaType),
});

const parseLocalSecretSchema = z.object({});
const parseLocalInputSchema = z.object({
  files: z.array(z.string()).meta({
    title: "files",
    description: "需要解析的文件（支持.pdf、.png、.jpg、.jpeg 多种格式）",
    toolDescription: "需要解析的文件 URL 数组，支持 PDF、PNG、JPG、JPEG 等格式",
  } satisfies InputSchemaMetaType),
  parse_method: z
    .enum(["auto", "ocr", "txt"])
    .optional()
    .meta({
      title: "解析方法",
      description: "解析方法，默认 auto",
    } satisfies InputSchemaMetaType),
  formula_enable: z
    .boolean()
    .optional()
    .meta({
      title: "开启公式识别",
      description: "是否启动公式识别功能，默认 true",
    } satisfies InputSchemaMetaType),
  table_enable: z
    .boolean()
    .optional()
    .meta({
      title: "开启表格识别",
      description: "是否启动表格识别功能，默认 true",
    } satisfies InputSchemaMetaType),
  return_content_list: z
    .boolean()
    .optional()
    .meta({
      title: "返回结构化 json",
      description: "是否返回结构化 json，默认 false",
    } satisfies InputSchemaMetaType),
  lang_list: z
    .string()
    .optional()
    .meta({
      title: "文档语言",
      description:
        "指定文档语言，默认 ch，长度跟文件数量一致，否则取第一个，按逗号分隔，其他可选值列表详见：https://www.paddleocr.ai/latest/en/version3.x/algorithm/PP-OCRv5/PP-OCRv5_multi_languages.html#4-supported-languages-and-abbreviations",
    } satisfies InputSchemaMetaType),
  backend: z
    .enum([
      "pipeline",
      "vlm-transformers",
      "vlm-sglang-engine",
      "vlm-sglang-client",
      "vllm-async-engine",
      "vllm-engine",
      "http-client",
    ])
    .optional()
    .meta({
      title: "解析后端",
      description: "mineru 解析后端，默认pipeline。",
    } satisfies InputSchemaMetaType),
  sglang_server_url: z
    .string()
    .optional()
    .meta({
      title: "sglang 服务地址",
      description: "sglang 服务地址，当 backend 为 vlm-sglang-client 时必填。",
    } satisfies InputSchemaMetaType),
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
const parseRemoteInputSchema = z.object({
  files: z.array(z.string()).meta({
    title: "files",
    description:
      "需要解析的文件（支持 .pdf、.doc、.docx、.ppt、.pptx、.png、.jpg、.jpeg 多种格式）",
    toolDescription:
      "需要解析的文件 URL 数组，支持 PDF、Office 文档、PNG、JPG、JPEG 等格式",
  } satisfies InputSchemaMetaType),
  is_ocr: z
    .boolean()
    .optional()
    .meta({
      title: "开启 OCR",
      description: "是否强制使用 OCR 解析，默认 false",
    } satisfies InputSchemaMetaType),
  enable_formula: z
    .boolean()
    .optional()
    .meta({
      title: "开启公式识别",
      description: "是否开启公式识别，默认 true",
    } satisfies InputSchemaMetaType),
  enable_table: z
    .boolean()
    .optional()
    .meta({
      title: "开启表格识别",
      description: "是否开启表格识别，默认 true",
    } satisfies InputSchemaMetaType),
  language: z
    .string()
    .optional()
    .meta({
      title: "文档语言",
      description: "指定文档语言，默认 ch",
    } satisfies InputSchemaMetaType),
  extra_formats: z
    .array(z.enum(["html"]))
    .optional()
    .meta({
      title: "额外输出格式",
      description: "额外返回的文件格式；可选 html",
    } satisfies InputSchemaMetaType),
  model_version: z
    .enum(["pipeline", "vlm"])
    .optional()
    .meta({
      title: "模型版本",
      description: "解析模型版本，默认 pipeline",
    } satisfies InputSchemaMetaType),
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
      "zh-CN": "Initial version",
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

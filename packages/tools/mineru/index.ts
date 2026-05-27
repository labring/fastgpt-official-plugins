import { createToolHandler, defineToolSet } from '@fastgpt-plugin/sdk-factory';
import z from 'zod';
import { InputType as parseLocalInputType, OutputType as parseLocalOutputType, tool as parseLocalTool } from './children/parseLocal';
import { InputType as parseRemoteInputType, OutputType as parseRemoteOutputType, tool as parseRemoteTool } from './children/parseRemote';

const secretSchema = z.object({
  "base_url": z.string().optional().meta({
    title: "Base url(Saas 服务不需要填写)",
    description: "Example: https://mineru.net, http://127.0.0.1:8000"
  }),
  "token": z.string().optional().meta({
    title: "API Token",
    description: "官方在线 MinerU 解析服务的 API Token，可在 https://mineru.net/apiManage/docs 申请获取",
    isSecret: true,
  })
});

const parseLocalSecretSchema = z.object({});
const parseLocalInputSchema = z.object({
  "files": z.array(z.string()).meta({
    title: "files",
    description: "需要解析的文件（支持.pdf、.png、.jpg、.jpeg 多种格式）"
  }),
  "parse_method": z.enum(["auto","ocr","txt"]).optional().meta({
    title: "解析方法",
    description: "解析方法，默认 auto"
  }),
  "formula_enable": z.boolean().optional().meta({
    title: "开启公式识别",
    description: "是否启动公式识别功能，默认 true"
  }),
  "table_enable": z.boolean().optional().meta({
    title: "开启表格识别",
    description: "是否启动表格识别功能，默认 true"
  }),
  "return_content_list": z.boolean().optional().meta({
    title: "返回结构化 json",
    description: "是否返回结构化 json，默认 false"
  }),
  "lang_list": z.string().optional().meta({
    title: "文档语言",
    description: "指定文档语言，默认 ch，长度跟文件数量一致，否则取第一个，按逗号分隔，其他可选值列表详见：https://www.paddleocr.ai/latest/en/version3.x/algorithm/PP-OCRv5/PP-OCRv5_multi_languages.html#4-supported-languages-and-abbreviations"
  }),
  "backend": z.enum(["pipeline","vlm-transformers","vlm-sglang-engine","vlm-sglang-client","vllm-async-engine","vllm-engine","http-client"]).optional().meta({
    title: "解析后端",
    description: "mineru 解析后端，默认pipeline。"
  }),
  "sglang_server_url": z.string().optional().meta({
    title: "sglang 服务地址",
    description: "sglang 服务地址，当 backend 为 vlm-sglang-client 时必填。"
  })
});
const parseLocalOutputSchema = z.object({
  "result": z.array(z.record(z.string(), z.unknown())).meta({
    title: "解析结果",
    description: "解析后的数据"
  })
});

const parseLocalHandler = createToolHandler({
  inputSchema: parseLocalInputSchema,
  outputSchema: parseLocalOutputSchema,
  secretSchema: parseLocalSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await parseLocalInputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await parseLocalTool(parsedInput, ctx);
    return parseLocalOutputType.parseAsync(output);
  }
});

const parseRemoteSecretSchema = z.object({});
const parseRemoteInputSchema = z.object({});
const parseRemoteOutputSchema = z.object({});

const parseRemoteHandler = createToolHandler({
  inputSchema: parseRemoteInputSchema,
  outputSchema: parseRemoteOutputSchema,
  secretSchema: parseRemoteSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await parseRemoteInputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await parseRemoteTool(parsedInput, ctx);
    return parseRemoteOutputType.parseAsync(output);
  }
});

const toolSet = defineToolSet({
  manifest: {
  "pluginId": "mineru",
  "name": {
    "en": "MinerU",
    "zh-CN": "MinerU"
  },
  "description": {
    "en": "MinerU is a tool that can convert FILES to machine-readable formats (such as markdown, json).",
    "zh-CN": "MinerU 是一款可以在本地部署的将文件转化为机器可读格式的工具（如 markdown、json ）。"
  },
  "version": "0.0.1",
  "versionDescription": {
    "en": "Initial version",
    "zh-CN": "Initial version"
  },
  "tags": [
    "productivity"
  ],
  "permission": ["file-upload:allow"],
  "author": "gary-Shen"
},
  secretSchema,
  children: [
    {
      id: "parseLocal",
      name: {
  "en": "Local Deployment Parse",
  "zh-CN": "本地部署解析"
},
      description: {
  "en": "Parse the file using the local MinerU api v2, support pdf, png, jpg, jpeg, and other formats",
  "zh-CN": "使用本地部署的 MinerU api v2 解析文件，支持 pdf、png、jpg、jpeg 等多种格式"
},
      handler: parseLocalHandler
    },
    {
      id: "parseRemote",
      name: {
  "en": "MinerU Saas Parse",
  "zh-CN": "MinerU Saas 解析"
},
      description: {
  "en": "Parse files using the official MinerU Sass, support .pdf, .doc, .docx, .ppt, .pptx, .png, .jpg, .jpeg",
  "zh-CN": "使用 MinerU 官方的 Saas 解析文件，支持.pdf、.doc、.docx、.ppt、.pptx、.png、.jpg、.jpeg"
},
      handler: parseRemoteHandler
    }
  ]
});

export default toolSet;

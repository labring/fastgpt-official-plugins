import { createToolHandler, defineTool } from '@fastgpt-plugin/sdk-factory';
import z from 'zod';
import { InputType, OutputType, tool as toolCb } from './src';

const secretSchema = z.object({
  baseUrl: z.string().meta({
    title: 'Base URL',
    description:
      '中国大陆: https://somark.cn/api/v1 | 海外: https://somark.ai/api/v1 | 私有化: 本地地址',
    toolDescription:
      '中国大陆使用请填写 https://somark.cn/api/v1；中国大陆以外（包括中国台湾、中国香港、中国澳门及海外）使用请填写 https://somark.ai/api/v1；私有化部署请填写本地部署地址。' +
      'Mainland China: https://somark.cn/api/v1 | Outside Mainland China (including Taiwan, China; Hong Kong, China; Macau, China; and overseas): https://somark.ai/api/v1 | Self-hosted: local URL'
  }),
  apiKey: z.string().optional().meta({
    title: 'API Key',
    description:
      '在 somark.cn/workbench/purchase (大陆) 或 somark.ai/studio/purchase (海外) 购买后获取，以 sk- 开头。',
    toolDescription:
      '使用 SoMark 公共 API 时需要填写（以 sk- 开头）。购买地址：https://somark.cn/workbench/purchase（中国大陆）或 https://somark.ai/studio/purchase（海外）。私有化部署无需填写。' +
      'Required for public API. Purchase at https://somark.cn/workbench/purchase (Mainland China) or https://somark.ai/studio/purchase (outside Mainland China).',
    isSecret: true
  })
});

const inputSchema = z.object({
  file: z.array(z.string()).meta({
    title: '文件',
    description: '待解析的文件，支持 PDF、图片、Office 格式。可上传多个文件，工具会按顺序逐个解析。',
    toolDescription:
      '待解析的文件 URL 数组，支持 PDF、图片、Office 格式，可传入一个或多个文件。'
  }),
  outputFormats: z.array(z.enum(['json', 'markdown'])).optional().meta({
    title: '输出格式',
    description: '选择解析结果的输出格式，支持 JSON 和 Markdown。默认同时输出两种格式。'
  }),
  imageFormat: z.enum(['url', 'base64', 'none']).optional().meta({
    title: '图片格式',
    description: '选择图片元素的返回格式，默认为 URL 格式。'
  }),
  formulaFormat: z.enum(['latex', 'mathml', 'ascii']).optional().meta({
    title: '公式格式',
    description: '选择公式元素的返回格式，默认为 LaTeX 格式。'
  }),
  tableFormat: z.enum(['markdown', 'html', 'image']).optional().meta({
    title: '表格格式',
    description: '选择表格元素的返回格式，默认为 HTML 格式。'
  }),
  chemicalStructureFormat: z.enum(['image']).optional().meta({
    title: '化学结构式格式',
    description: '选择化学结构式元素的返回格式，目前仅支持 Image 格式。'
  }),
  enableTextCrossPage: z.boolean().optional().meta({
    title: '文字跨页拼接',
    description: '跨页文字段合并为连续段落。'
  }),
  enableTableCrossPage: z.boolean().optional().meta({
    title: '表格跨页拼接',
    description: '跨页表格合并为完整表格。'
  }),
  enableTitleLevelRecognition: z.boolean().optional().meta({
    title: '标题层级识别',
    description: '识别文档标题层级结构。'
  }),
  enableInlineImage: z.boolean().optional().meta({
    title: '返回文中图',
    description: '返回文字段落中的图片。'
  }),
  enableTableImage: z.boolean().optional().meta({
    title: '返回表格图',
    description: '返回表格单元格内的图片。'
  }),
  enableImageUnderstanding: z.boolean().optional().meta({
    title: '图片理解',
    description: '对文档内图片进行语义理解和结构化描述。'
  }),
  keepHeaderFooter: z.boolean().optional().meta({
    title: '保留页眉页脚',
    description: '开启后保留页眉页脚内容。'
  })
});

const outputSchema = z.object({
  results: z.array(z.record(z.string(), z.unknown())).meta({
    title: '解析结果',
    description:
      '每个输入文件对应一个结果，按输入顺序返回。每项包含 markdown 和 json 字段。'
  })
});

const handler = createToolHandler({
  inputSchema,
  outputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await InputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await toolCb(parsedInput);
    return OutputType.parseAsync(output);
  }
});

const tool = defineTool({
  manifest: {
    pluginId: 'SoMarkDocumentParser',
    name: {
      en: 'SoMark Document Parser',
      'zh-CN': 'SoMark 文档解析'
    },
    description: {
      en: 'Convert documents into structured Markdown or JSON using SoMark Document Parser.',
      'zh-CN': '使用 SoMark 文档解析工具将 PDF、图片、Office 等文档转换为结构化 Markdown 或 JSON。'
    },
    version: '0.1.1',
    versionDescription: {
      en: 'Initial version',
      'zh-CN': '初始版本，支持多文件串行解析、格式配置和 QPS 退避重试。'
    },
    toolDescription:
      'A precise document parser that converts PDF, images, and Office files into clean structured Markdown or JSON while preserving layout and content hierarchy.',
    tags: ['tools']
  },
  handler
});

export default tool;

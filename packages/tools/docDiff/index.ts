import { createToolHandler, defineTool } from "@fastgpt-plugin/sdk-factory";
import { InputType, OutputType, tool as toolCb } from "./src";
import z from "zod";

const secretSchema = z.object({});
const inputSchema = z.object({
  "originalText": z.string().meta({
    title: "原始文档",
    description: "原始的 Markdown 格式文档内容",
    toolDescription: "The original markdown document content to compare"
  }),
  "originalTitle": z.string().optional().meta({
    title: "原始文档标题",
    description: "原始文档的标题，将在对比界面中显示"
  }),
  "modifiedText": z.string().meta({
    title: "修改后文档",
    description: "修改后的 Markdown 格式文档内容",
    toolDescription: "The modified markdown document content to compare"
  }),
  "modifiedTitle": z.string().optional().meta({
    title: "修改后文档标题",
    description: "修改后文档的标题，将在对比界面中显示"
  }),
  "title": z.string().optional().meta({
    title: "对比报告标题",
    description: "生成的 HTML 对比报告的标题"
  })
});
const outputSchema = z.object({
  "htmlUrl": z.string().meta({
    title: "HTML 对比报告连接",
    description: "生成的 HTML 对比报告的访问连接"
  }),
  "diffs": z.array(z.record(z.string(), z.unknown())).meta({
    title: "差异结果数组",
    description: "过滤后的文档差异数组，包含新增、删除、修改的变更"
  })
});
const handler = createToolHandler({
  inputSchema,
  outputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await InputType.parseAsync(input);
    const output = await toolCb(parsedInput, ctx);
    return OutputType.parseAsync(output);
  },
});

const tool = defineTool({
  manifest: {
    pluginId: "docDiff",
    name: {
      en: "DocDiff",
      "zh-CN": "文档对比工具",
    },
    description: {
      en: "Compare differences between two Markdown documents and generate visual HTML comparison report",
      "zh-CN": "对比两个 Markdown 文档的差异，生成可视化的 HTML 对比报告",
    },
    version: "1.1.1",
    versionDescription: {
      en: "Fix version - Remove diff tags and add document titles support",
      "zh-CN": "Fix version - Remove diff tags and add document titles support",
    },
    toolDescription:
      "A tool that compares two markdown documents and generates a visual HTML diff report showing differences section by section",
    tags: ["tools"],
  },
  secretSchema,
  handler,
});

export default tool;

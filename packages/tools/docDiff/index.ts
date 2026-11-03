import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineTool,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({});
const inputSchema = defineInputSchema({
  originalText: {
    type: z.string(),
    title: { en: "Original document", "zh-CN": "原始文档" },
    description: {
      en: "Original Markdown document content to compare.",
      "zh-CN": "用于对比的原始 Markdown 文档内容。",
    },
    isToolParam: true,
  },
  originalTitle: {
    type: z.string().optional(),
    title: { en: "Original document title", "zh-CN": "原始文档标题" },
    description: {
      en: "Title shown for the original document in the comparison view.",
      "zh-CN": "在对比界面中显示的原始文档标题。",
    },
    isToolParam: true,
  },
  modifiedText: {
    type: z.string(),
    title: { en: "Modified document", "zh-CN": "修改后文档" },
    description: {
      en: "Modified Markdown document content to compare.",
      "zh-CN": "用于对比的修改后 Markdown 文档内容。",
    },
    isToolParam: true,
  },
  modifiedTitle: {
    type: z.string().optional(),
    title: { en: "Modified document title", "zh-CN": "修改后文档标题" },
    description: {
      en: "Title shown for the modified document in the comparison view.",
      "zh-CN": "在对比界面中显示的修改后文档标题。",
    },
    isToolParam: true,
  },
  title: {
    type: z.string().optional(),
    title: { en: "Comparison report title", "zh-CN": "对比报告标题" },
    description: {
      en: "Title of the generated HTML comparison report.",
      "zh-CN": "生成的 HTML 对比报告标题。",
    },
    isToolParam: true,
  },
});
const outputSchema = defineOutputSchema({
  htmlUrl: {
    type: z.string(),
    title: { en: "HTML comparison report URL", "zh-CN": "HTML 对比报告链接" },
    description: {
      en: "URL of the generated HTML comparison report.",
      "zh-CN": "生成的 HTML 对比报告访问链接。",
    },
  },
  diffs: {
    type: z.array(
      defineOutputSchema({
        type: {
          type: z.enum(["added", "removed", "modified"]),
          title: { en: "Change type", "zh-CN": "变更类型" },
          description: {
            en: "Whether the change adds, removes, or modifies content.",
            "zh-CN": "表示内容新增、删除或修改。",
          },
        },
        original: {
          type: z.string().optional(),
          title: { en: "Original text", "zh-CN": "原始文本" },
          description: {
            en: "Original text for a removed or modified paragraph, when present.",
            "zh-CN": "被删除或修改段落的原始文本（如有）。",
          },
        },
        modified: {
          type: z.string().optional(),
          title: { en: "Modified text", "zh-CN": "修改后文本" },
          description: {
            en: "Modified text for an added or modified paragraph, when present.",
            "zh-CN": "新增或修改段落的修改后文本（如有）。",
          },
        },
        lineNumber: {
          type: z.number(),
          title: { en: "Line number", "zh-CN": "行号" },
          description: {
            en: "Line number associated with the change.",
            "zh-CN": "该变更对应的行号。",
          },
        },
      }),
    ),
    title: { en: "Document differences", "zh-CN": "文档差异结果" },
    description: {
      en: "Filtered document changes, including additions, deletions, and modifications.",
      "zh-CN": "过滤后的文档差异，包含新增、删除和修改的内容。",
    },
  },
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
      en: "Compare two Markdown documents section by section and generate a visual HTML diff report.",
      "zh-CN": "逐段对比两个 Markdown 文档的差异，并生成可视化 HTML 对比报告。",
    },
    version: "1.1.1",
    versionDescription: {
      en: "Fix version - Remove diff tags and add document titles support",
      "zh-CN": "Fix version - Remove diff tags and add document titles support",
    },
    tags: ["tools"],
    permission: ["file-upload:allow"],
  },
  handler,
});

export default tool;

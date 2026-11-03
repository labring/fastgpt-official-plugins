import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineTool,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({
  databaseType: z.enum(["MySQL", "PostgreSQL", "Microsoft SQL Server"]).meta({
    title: "数据库类型",
    "x-i18n": { title: { en: "Database type", "zh-CN": "数据库类型" } },
    isSecret: false,
  }),
  host: z.string().meta({
    title: "host",
    "x-i18n": { title: { en: "Host", "zh-CN": "主机地址" } },
    isSecret: false,
  }),
  port: z.string().meta({
    title: "数据库连接端口号",
    "x-i18n": { title: { en: "Database port", "zh-CN": "数据库连接端口号" } },
    isSecret: false,
  }),
  databaseName: z.string().meta({
    title: "数据库名称",
    "x-i18n": { title: { en: "Database name", "zh-CN": "数据库名称" } },
    isSecret: false,
  }),
  user: z.string().meta({
    title: "数据库账号",
    "x-i18n": { title: { en: "Database username", "zh-CN": "数据库账号" } },
    isSecret: false,
  }),
  password: z.string().meta({
    title: "数据库密码",
    "x-i18n": { title: { en: "Database password", "zh-CN": "数据库密码" } },
    isSecret: true,
  }),
});
const inputSchema = defineInputSchema({
  sql: {
    type: z.string(),
    title: { en: "SQL statement", "zh-CN": "SQL 语句" },
    description: {
      en: "SQL statement to execute directly.",
      "zh-CN": "可直接执行的 SQL 语句。",
    },
    isToolParam: true,
  },
});
const outputSchema = defineOutputSchema({
  result: {
    type: z.union([z.array(z.unknown()), z.record(z.string(), z.unknown())]),
    title: { en: "Result", "zh-CN": "结果" },
    description: { en: "Execution result.", "zh-CN": "执行结果。" },
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
    pluginId: "databaseConnection",
    name: {
      en: "Database Connection",
      "zh-CN": "数据库连接",
    },
    description: {
      en: "Can connect to common databases and execute sql",
      "zh-CN": "可连接常用数据库，并执行sql",
    },
    version: "0.1.2",
    versionDescription: {
      en: "Modify output type to Object",
      "zh-CN": "修改输出结果类型为 Object",
    },
    tags: ["tools"],
  },
  handler,
});

export default tool;

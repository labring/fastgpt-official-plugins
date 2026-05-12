import { createToolHandler, defineTool } from "@fastgpt-plugin/sdk-factory";
import {
  InputType,
  LegacyOutputType,
  OutputType,
  legacyTool,
  tool as toolCb,
} from "./src";
import z from "zod";

const secretSchema = z.object({
  databaseType: z.enum(["MySQL", "PostgreSQL", "Microsoft SQL Server"]).meta({
    title: "数据库类型",
  }),
  host: z.string().meta({
    title: "host",
  }),
  port: z.string().meta({
    title: "数据库连接端口号",
  }),
  databaseName: z.string().meta({
    title: "数据库名称",
  }),
  user: z.string().meta({
    title: "数据库账号",
  }),
  password: z.string().meta({
    title: "数据库密码",
  }),
});
const inputSchema = z.object({
  sql: z.string().meta({
    title: "sql",
    description: "sql语句，可以传入sql语句直接执行",
    toolDescription: "sql语句，可以传入sql语句直接执行",
  }),
});
const outputSchema = z.object({
  result: z
    .union([z.array(z.unknown()), z.record(z.string(), z.unknown())])
    .meta({
      title: "结果",
      description: "执行结果",
    }),
});
const legacyOutputSchema = z.object({
  result: z.string().meta({
    title: "结果",
    description: "执行结果",
  }),
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

const legacyHandler = createToolHandler({
  inputSchema,
  outputSchema: legacyOutputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await InputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await legacyTool(parsedInput);
    return LegacyOutputType.parseAsync(output);
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

const toolv1 = defineTool({
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
    version: "0.1.1",
    versionDescription: {
      en: "Default version",
      "zh-CN": "Default version",
    },
    tags: ["tools"],
  },
  handler: legacyHandler,
});

export default tool;
// export default toolv1;

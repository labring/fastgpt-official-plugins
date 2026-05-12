import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as clickhouseInputType,
  OutputType as clickhouseOutputType,
  tool as clickhouseTool,
} from "./children/clickhouse";
import {
  InputType as mysqlInputType,
  OutputType as mysqlOutputType,
  tool as mysqlTool,
} from "./children/mysql";
import {
  InputType as oracleInputType,
  OutputType as oracleOutputType,
  tool as oracleTool,
} from "./children/oracle";
import {
  InputType as postgresqlInputType,
  OutputType as postgresqlOutputType,
  tool as postgresqlTool,
} from "./children/postgresql";
import {
  InputType as sqlserverInputType,
  OutputType as sqlserverOutputType,
  tool as sqlserverTool,
} from "./children/sqlserver";

const secretSchema = z.object({
  database: z.string().meta({
    title: "数据库名称",
  }),
  host: z.string().meta({
    title: "主机地址",
  }),
  port: z.number().meta({
    title: "端口",
  }),
  username: z.string().meta({
    title: "数据库账号",
  }),
  password: z.string().meta({
    title: "数据库密码",
  }),
  maxConnections: z.string().optional().meta({
    title: "最大连接数",
  }),
  connectionTimeout: z.string().optional().meta({
    title: "连接超时时间",
  }),
});
const clickhouseInputSchema = z.object({
  sql: z.string().meta({
    title: "SQL",
    description: "SQL 语句，可以传入 SQL 语句直接执行",
    toolDescription: "SQL 语句，可以传入 SQL 语句直接执行",
  }),
});
const clickhouseOutputSchema = z.object({
  result: z.string().meta({
    title: "结果",
    description: "执行结果",
  }),
});
const clickhouseHandler = createToolHandler({
  inputSchema: clickhouseInputSchema,
  outputSchema: clickhouseOutputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await clickhouseInputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await clickhouseTool(parsedInput, ctx);
    return clickhouseOutputType.parseAsync(output);
  },
});

const mysqlInputSchema = z.object({
  sql: z.string().meta({
    title: "SQL",
    description: "SQL 语句，可以传入 SQL 语句直接执行",
    toolDescription: "SQL 语句，可以传入 SQL 语句直接执行",
  }),
});
const mysqlOutputSchema = z.object({
  result: z.string().meta({
    title: "结果",
    description: "执行结果",
  }),
});
const mysqlHandler = createToolHandler({
  inputSchema: mysqlInputSchema,
  outputSchema: mysqlOutputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await mysqlInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await mysqlTool(parsedInput);
    return mysqlOutputType.parseAsync(output);
  },
});

const oracleInputSchema = z.object({
  sql: z.string().meta({
    title: "SQL",
    description: "SQL 语句，可以传入 SQL 语句直接执行",
    toolDescription: "SQL 语句，可以传入 SQL 语句直接执行",
  }),
});
const oracleOutputSchema = z.object({
  result: z.string().meta({
    title: "结果",
    description: "执行结果",
  }),
});
const oracleHandler = createToolHandler({
  inputSchema: oracleInputSchema,
  outputSchema: oracleOutputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await oracleInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await oracleTool(parsedInput);
    return oracleOutputType.parseAsync(output);
  },
});

const postgresqlInputSchema = z.object({
  sql: z.string().meta({
    title: "SQL",
    description: "SQL 语句，可以传入 SQL 语句直接执行",
    toolDescription: "SQL 语句，可以传入 SQL 语句直接执行",
  }),
});
const postgresqlOutputSchema = z.object({
  result: z.string().meta({
    title: "结果",
    description: "执行结果",
  }),
});
const postgresqlHandler = createToolHandler({
  inputSchema: postgresqlInputSchema,
  outputSchema: postgresqlOutputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await postgresqlInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await postgresqlTool(parsedInput);
    return postgresqlOutputType.parseAsync(output);
  },
});

const sqlserverInputSchema = z.object({
  sql: z.string().meta({
    title: "SQL",
    description: "SQL 语句，可以传入 SQL 语句直接执行",
    toolDescription: "SQL 语句，可以传入 SQL 语句直接执行",
  }),
});
const sqlserverOutputSchema = z.object({
  result: z.string().meta({
    title: "结果",
    description: "执行结果",
  }),
});
const sqlserverHandler = createToolHandler({
  inputSchema: sqlserverInputSchema,
  outputSchema: sqlserverOutputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await sqlserverInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await sqlserverTool(parsedInput);
    return sqlserverOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "dbops",
    name: {
      en: "Database Operations",
      "zh-CN": "数据库操作",
    },
    description: {
      en: "Database Operations Tool Set, including MySQL, PostgreSQL, Microsoft SQL Server, Oracle, ClickHouse database operations functionality",
      "zh-CN":
        "数据库操作工具集，包含 MySQL、PostgreSQL、Microsoft SQL Server、Oracle、ClickHouse 数据库操作功能",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
    },
    tags: ["tools"],
  },
  secretSchema,
  children: [
    {
      id: "clickhouse",
      name: {
        en: "ClickHouse",
        "zh-CN": "ClickHouse",
      },
      description: {
        en: "Intelligent database connection tool powered by ClickHouse with multiple output formats",
        "zh-CN": "基于 ClickHouse 数据库的智能数据库连接工具，支持多种格式输出",
      },
      handler: clickhouseHandler,
    },
    {
      id: "mysql",
      name: {
        en: "MySQL",
        "zh-CN": "MySQL",
      },
      description: {
        en: "Intelligent database connection tool powered by MySQL with multiple output formats",
        "zh-CN": "基于 MySQL 数据库的智能数据库连接工具，支持多种格式输出",
      },
      handler: mysqlHandler,
    },
    {
      id: "oracle",
      name: {
        en: "Oracle",
        "zh-CN": "Oracle",
      },
      description: {
        en: "Intelligent database connection tool powered by Oracle with multiple output formats",
        "zh-CN": "基于 Oracle 数据库的智能数据库连接工具，支持多种格式输出",
      },
      handler: oracleHandler,
    },
    {
      id: "postgresql",
      name: {
        en: "PostgreSQL",
        "zh-CN": "PostgreSQL",
      },
      description: {
        en: "Intelligent database connection tool powered by PostgreSQL with multiple output formats",
        "zh-CN": "基于 PostgreSQL 数据库的智能数据库连接工具，支持多种格式输出",
      },
      handler: postgresqlHandler,
    },
    {
      id: "sqlserver",
      name: {
        en: "Microsoft SQL Server",
        "zh-CN": "Microsoft SQL Server",
      },
      description: {
        en: "Intelligent database connection tool powered by Microsoft SQL Server with multiple output formats",
        "zh-CN":
          "基于 Microsoft SQL Server 数据库的智能数据库连接工具，支持多种格式输出",
      },
      handler: sqlserverHandler,
    },
  ],
});

export default toolSet;

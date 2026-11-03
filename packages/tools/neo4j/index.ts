import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as readInputType,
  OutputType as readOutputType,
  tool as readTool,
} from "./children/read";
import {
  InputType as writeInputType,
  OutputType as writeOutputType,
  tool as writeTool,
} from "./children/write";

const secretSchema = z.object({
  uri: z.string().meta({
    title: "Neo4j Connection URI",
    description:
      "Neo4j connection URI, such as neo4j://host:7687, neo4j+s://host:7687, or bolt://host:7687.",
    "x-i18n": {
      title: { en: "Neo4j Connection URI", "zh-CN": "Neo4j 连接地址" },
      description: {
        en: "Neo4j connection URI, such as neo4j://host:7687, neo4j+s://host:7687, or bolt://host:7687.",
        "zh-CN":
          "Neo4j 连接 URI，例如 neo4j://host:7687、neo4j+s://host:7687 或 bolt://host:7687。",
      },
    },
    isSecret: false,
  }),
  username: z.string().meta({
    title: "Username",
    description: "Username used to authenticate with Neo4j.",
    "x-i18n": {
      title: { en: "Username", "zh-CN": "用户名" },
      description: {
        en: "Username used to authenticate with Neo4j.",
        "zh-CN": "用于连接 Neo4j 的用户名。",
      },
    },
    isSecret: false,
  }),
  password: z.string().meta({
    title: "Password",
    description: "Password used to authenticate with Neo4j.",
    "x-i18n": {
      title: { en: "Password", "zh-CN": "密码" },
      description: {
        en: "Password used to authenticate with Neo4j.",
        "zh-CN": "用于连接 Neo4j 的密码。",
      },
    },
    isSecret: true,
  }),
  database: z
    .string()
    .optional()
    .meta({
      title: "Database Name",
      description:
        "Neo4j database name; leave empty to use the default database.",
      "x-i18n": {
        title: { en: "Database Name", "zh-CN": "数据库名称" },
        description: {
          en: "Neo4j database name; leave empty to use the default database.",
          "zh-CN": "Neo4j 数据库名称；留空时使用默认数据库。",
        },
      },
      isSecret: false,
    }),
  connectionTimeout: z
    .string()
    .optional()
    .meta({
      title: "Connection Timeout",
      description: "Connection timeout in milliseconds; defaults to 10000.",
      "x-i18n": {
        title: { en: "Connection Timeout", "zh-CN": "连接超时时间" },
        description: {
          en: "Connection timeout in milliseconds; defaults to 10000.",
          "zh-CN": "连接超时时间，单位毫秒，默认 10000。",
        },
      },
      isSecret: false,
    }),
  maxTransactionRetryTime: z
    .string()
    .optional()
    .meta({
      title: "Maximum Transaction Retry Time",
      description:
        "Maximum transaction retry time in milliseconds; defaults to 30000.",
      "x-i18n": {
        title: {
          en: "Maximum Transaction Retry Time",
          "zh-CN": "最大事务重试时间",
        },
        description: {
          en: "Maximum transaction retry time in milliseconds; defaults to 30000.",
          "zh-CN": "最大事务重试时间，单位毫秒，默认 30000。",
        },
      },
      isSecret: false,
    }),
});

const inputSchema = defineInputSchema({
  cypher: {
    type: z.string(),
    title: { en: "Cypher Query", "zh-CN": "Cypher 查询" },
    description: {
      en: "Cypher statement to execute.",
      "zh-CN": "要执行的 Cypher 语句。",
    },
    isToolParam: true,
  },
  parameters: {
    type: z.string().optional(),
    title: { en: "Query Parameters", "zh-CN": "查询参数" },
    description: {
      en: 'A JSON object string used for parameterized Cypher queries, for example {"name":"Ada"}.',
      "zh-CN":
        '用于 Cypher 参数化查询的 JSON 对象字符串，例如 {"name":"Ada"}。',
    },
    isToolParam: true,
  },
});

const outputSchema = defineOutputSchema({
  rows: {
    type: z.array(z.record(z.string(), z.unknown())),
    title: { en: "Result Rows", "zh-CN": "结果行" },
    description: {
      en: "Records returned by the Cypher query.",
      "zh-CN": "Cypher 查询返回的记录数组。",
    },
  },
  summary: {
    type: z.record(z.string(), z.unknown()),
    title: { en: "Execution Summary", "zh-CN": "执行摘要" },
    description: {
      en: "Query type, counters, and timing information returned by Neo4j.",
      "zh-CN": "Neo4j 返回的查询类型、计数器和耗时信息。",
    },
  },
});

const readHandler = createToolHandler({
  inputSchema,
  outputSchema,
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await readInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await readTool(parsedInput);
    return readOutputType.parseAsync(output);
  },
});

const writeHandler = createToolHandler({
  inputSchema,
  outputSchema,
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await writeInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await writeTool(parsedInput);
    return writeOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "neo4j",
    name: {
      en: "Neo4j Operations",
      "zh-CN": "Neo4j 操作",
    },
    description: {
      en: "Execute read and write Cypher operations against a Neo4j graph database, with JSON parameter support.",
      "zh-CN": "连接 Neo4j 图数据库并执行 Cypher 读写操作，支持 JSON 参数。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial release",
      "zh-CN": "初始版本",
    },
    tags: ["tools"],
  },
  secretSchema,
  children: [
    {
      id: "read",
      name: {
        en: "Read Cypher",
        "zh-CN": "读取 Cypher",
      },
      description: {
        en: "Execute read-only Cypher queries against Neo4j. Use MATCH/RETURN-style queries and provide parameters as a JSON object string.",
        "zh-CN":
          "执行 Neo4j 只读 Cypher 查询。使用 MATCH/RETURN 等查询，并以 JSON 对象字符串提供参数。",
      },
      handler: readHandler,
    },
    {
      id: "write",
      name: {
        en: "Write Cypher",
        "zh-CN": "写入 Cypher",
      },
      description: {
        en: "Execute write Cypher operations against Neo4j, including CREATE, MERGE, SET, and DELETE.",
        "zh-CN":
          "执行 Neo4j 写入类 Cypher 操作，包括 CREATE、MERGE、SET 和 DELETE。",
      },
      handler: writeHandler,
    },
  ],
});

export default toolSet;

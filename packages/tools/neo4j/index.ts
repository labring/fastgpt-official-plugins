import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
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
    title: "Neo4j 连接地址",
    description:
      "例如 neo4j://host:7687、neo4j+s://host:7687 或 bolt://host:7687",
  }),
  username: z.string().meta({
    title: "用户名",
  }),
  password: z.string().meta({
    title: "密码",
    isSecret: true,
  }),
  database: z.string().optional().meta({
    title: "数据库名称",
    description: "Neo4j database 名称，留空时使用默认数据库",
  }),
  connectionTimeout: z.string().optional().meta({
    title: "连接超时时间",
    description: "单位毫秒，默认 10000",
  }),
  maxTransactionRetryTime: z.string().optional().meta({
    title: "事务重试时间",
    description: "单位毫秒，默认 30000",
  }),
});

const inputSchema = z.object({
  cypher: z.string().meta({
    title: "Cypher",
    description: "要执行的 Cypher 语句",
    toolDescription: "The Cypher query to execute",
  }),
  parameters: z.string().optional().meta({
    title: "查询参数",
    description: 'JSON 对象字符串，例如 {"name":"Ada"}，用于 Cypher 参数化查询',
    toolDescription: "A JSON object string for Cypher parameters",
  }),
});

const outputSchema = z.object({
  rows: z.array(z.record(z.string(), z.unknown())).meta({
    title: "结果行",
    description: "Cypher 查询返回的记录数组",
  }),
  summary: z.record(z.string(), z.unknown()).meta({
    title: "执行摘要",
    description: "Neo4j 返回的查询类型、计数器和耗时信息",
  }),
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
      en: "Execute read and write Cypher operations against a Neo4j graph database",
      "zh-CN": "连接 Neo4j 图数据库并执行 Cypher 读写操作",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
    },
    toolDescription:
      "A Neo4j graph database toolset for executing read-only Cypher queries and write Cypher operations with parameter support.",
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
        en: "Execute read-only Cypher queries against Neo4j",
        "zh-CN": "执行只读 Cypher 查询",
      },
      toolDescription:
        "Execute MATCH/RETURN style Cypher queries. Use parameters as a JSON object string.",
      handler: readHandler,
    },
    {
      id: "write",
      name: {
        en: "Write Cypher",
        "zh-CN": "写入 Cypher",
      },
      description: {
        en: "Execute write Cypher operations against Neo4j",
        "zh-CN": "执行写入类 Cypher 操作",
      },
      toolDescription:
        "Execute CREATE, MERGE, SET, DELETE and other mutating Cypher operations. Use parameters as a JSON object string.",
      handler: writeHandler,
    },
  ],
});

export default toolSet;

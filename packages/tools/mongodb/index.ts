import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as aggregateInputType,
  OutputType as aggregateOutputType,
  tool as aggregateTool,
} from "./children/aggregate";
import {
  InputType as deleteInputType,
  OutputType as deleteOutputType,
  tool as deleteTool,
} from "./children/delete";
import {
  InputType as findInputType,
  OutputType as findOutputType,
  tool as findTool,
} from "./children/find";
import {
  InputType as insertInputType,
  OutputType as insertOutputType,
  tool as insertTool,
} from "./children/insert";
import {
  InputType as updateInputType,
  OutputType as updateOutputType,
  tool as updateTool,
} from "./children/update";

const secretSchema = z.object({
  connectionUri: z.string().meta({
    title: "MongoDB 连接串",
    description:
      "MongoDB connection URI，例如 mongodb://user:password@host:27017",
    isSecret: true,
  }),
  database: z.string().meta({
    title: "数据库名称",
    description: "MongoDB database name",
  }),
  connectTimeoutMS: z.number().optional().meta({
    title: "连接超时时间",
    description: "连接超时时间，单位毫秒",
  }),
  socketTimeoutMS: z.number().optional().meta({
    title: "Socket 超时时间",
    description: "Socket 读写超时时间，单位毫秒",
  }),
});

const resultOutputSchema = z.object({
  result: z.unknown().meta({
    title: "结果",
    description: "MongoDB 操作结果",
  }),
});

const collectionInputSchema = z.object({
  collection: z.string().meta({
    title: "集合名称",
    description: "MongoDB collection name",
    toolDescription: "MongoDB collection name",
  }),
});

const findInputSchema = collectionInputSchema.extend({
  filter: z.string().default("{}").meta({
    title: "查询条件",
    description: "MongoDB filter JSON，支持 Extended JSON",
    toolDescription:
      "MongoDB filter JSON object. Use {} to match all documents.",
  }),
  projection: z.string().optional().meta({
    title: "返回字段",
    description: 'MongoDB projection JSON，例如 {"name":1,"_id":0}',
    toolDescription: "Optional MongoDB projection JSON object.",
  }),
  sort: z.string().optional().meta({
    title: "排序",
    description: 'MongoDB sort JSON，例如 {"createdAt":-1}',
    toolDescription: "Optional MongoDB sort JSON object.",
  }),
  limit: z.number().optional().meta({
    title: "返回数量",
    description: "最多返回 1000 条，默认 100",
    toolDescription: "Maximum number of documents to return, default 100.",
  }),
  skip: z.number().optional().meta({
    title: "跳过数量",
    description: "跳过的文档数量，默认 0",
    toolDescription: "Number of documents to skip, default 0.",
  }),
});

const findHandler = createToolHandler({
  inputSchema: findInputSchema,
  outputSchema: resultOutputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await findInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await findTool(parsedInput);
    return findOutputType.parseAsync(output);
  },
});

const insertInputSchema = collectionInputSchema.extend({
  documents: z.string().meta({
    title: "文档",
    description: "要插入的 JSON object 或 JSON object 数组，支持 Extended JSON",
    toolDescription: "JSON object or array of JSON objects to insert.",
  }),
});

const insertHandler = createToolHandler({
  inputSchema: insertInputSchema,
  outputSchema: resultOutputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await insertInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await insertTool(parsedInput);
    return insertOutputType.parseAsync(output);
  },
});

const updateInputSchema = collectionInputSchema.extend({
  filter: z.string().meta({
    title: "匹配条件",
    description: "MongoDB filter JSON",
    toolDescription: "MongoDB filter JSON object for documents to update.",
  }),
  update: z.string().meta({
    title: "更新内容",
    description: 'MongoDB update JSON，例如 {"$set":{"status":"done"}}',
    toolDescription:
      "MongoDB update JSON object using operators such as $set, $inc or $unset.",
  }),
  multi: z.boolean().optional().meta({
    title: "更新多条",
    description: "true 时执行 updateMany，默认 updateOne",
    toolDescription: "Whether to update multiple matching documents.",
  }),
  upsert: z.boolean().optional().meta({
    title: "不存在时插入",
    description: "MongoDB upsert option",
    toolDescription:
      "Whether to insert a document when no document matches the filter.",
  }),
  allowEmptyFilter: z.boolean().optional().meta({
    title: "允许空条件",
    description: "显式允许空 filter 执行全量更新",
    toolDescription:
      "Set true only when an empty filter should update the whole collection.",
  }),
});

const updateHandler = createToolHandler({
  inputSchema: updateInputSchema,
  outputSchema: resultOutputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await updateInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await updateTool(parsedInput);
    return updateOutputType.parseAsync(output);
  },
});

const deleteInputSchema = collectionInputSchema.extend({
  filter: z.string().meta({
    title: "删除条件",
    description: "MongoDB filter JSON",
    toolDescription: "MongoDB filter JSON object for documents to delete.",
  }),
  multi: z.boolean().optional().meta({
    title: "删除多条",
    description: "true 时执行 deleteMany，默认 deleteOne",
    toolDescription: "Whether to delete multiple matching documents.",
  }),
  allowEmptyFilter: z.boolean().optional().meta({
    title: "允许空条件",
    description: "显式允许空 filter 执行全量删除",
    toolDescription:
      "Set true only when an empty filter should delete the whole collection.",
  }),
});

const deleteHandler = createToolHandler({
  inputSchema: deleteInputSchema,
  outputSchema: resultOutputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await deleteInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await deleteTool(parsedInput);
    return deleteOutputType.parseAsync(output);
  },
});

const aggregateInputSchema = collectionInputSchema.extend({
  pipeline: z.string().meta({
    title: "聚合管道",
    description: "MongoDB aggregation pipeline JSON array",
    toolDescription: "MongoDB aggregation pipeline as a JSON array.",
  }),
  limit: z.number().optional().meta({
    title: "返回数量",
    description: "最多返回 1000 条，默认 100",
    toolDescription:
      "Maximum number of aggregation results to return, default 100.",
  }),
  allowDiskUse: z.boolean().optional().meta({
    title: "允许使用磁盘",
    description: "MongoDB allowDiskUse option",
    toolDescription:
      "Whether MongoDB can write temporary aggregation data to disk.",
  }),
});

const aggregateHandler = createToolHandler({
  inputSchema: aggregateInputSchema,
  outputSchema: resultOutputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await aggregateInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await aggregateTool(parsedInput);
    return aggregateOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "mongodb",
    name: {
      en: "MongoDB Operations",
      "zh-CN": "MongoDB 操作",
    },
    description: {
      en: "Independent MongoDB operations toolset for querying, inserting, updating, deleting and aggregating documents",
      "zh-CN":
        "独立的 MongoDB 操作工具集，支持查询、插入、更新、删除和聚合文档",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
    },
    toolDescription:
      "MongoDB operations toolset. Use it to query, insert, update, delete and aggregate documents in MongoDB collections with JSON or Extended JSON parameters.",
    tags: ["tools"],
  },
  secretSchema,
  children: [
    {
      id: "find",
      name: {
        en: "Find Documents",
        "zh-CN": "查询文档",
      },
      description: {
        en: "Find documents from a MongoDB collection",
        "zh-CN": "从 MongoDB 集合查询文档",
      },
      toolDescription:
        "Find documents from a MongoDB collection using a filter JSON object.",
      handler: findHandler,
    },
    {
      id: "insert",
      name: {
        en: "Insert Documents",
        "zh-CN": "插入文档",
      },
      description: {
        en: "Insert one or multiple documents into a MongoDB collection",
        "zh-CN": "向 MongoDB 集合插入一个或多个文档",
      },
      toolDescription:
        "Insert one JSON document or an array of JSON documents into a collection.",
      handler: insertHandler,
    },
    {
      id: "update",
      name: {
        en: "Update Documents",
        "zh-CN": "更新文档",
      },
      description: {
        en: "Update one or multiple documents in a MongoDB collection",
        "zh-CN": "更新 MongoDB 集合中的一个或多个文档",
      },
      toolDescription:
        "Update documents in a MongoDB collection with a filter and update operators.",
      handler: updateHandler,
    },
    {
      id: "delete",
      name: {
        en: "Delete Documents",
        "zh-CN": "删除文档",
      },
      description: {
        en: "Delete one or multiple documents from a MongoDB collection",
        "zh-CN": "从 MongoDB 集合删除一个或多个文档",
      },
      toolDescription:
        "Delete documents from a MongoDB collection using a filter JSON object.",
      handler: deleteHandler,
    },
    {
      id: "aggregate",
      name: {
        en: "Aggregate Documents",
        "zh-CN": "聚合文档",
      },
      description: {
        en: "Run an aggregation pipeline on a MongoDB collection",
        "zh-CN": "在 MongoDB 集合上执行聚合管道",
      },
      toolDescription: "Run a MongoDB aggregation pipeline on a collection.",
      handler: aggregateHandler,
    },
  ],
});

export default toolSet;

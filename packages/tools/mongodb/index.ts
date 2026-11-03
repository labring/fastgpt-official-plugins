import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
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
    title: "MongoDB Connection URI",
    description:
      "MongoDB connection URI, for example mongodb://user:password@host:27017.",
    "x-i18n": {
      title: { en: "MongoDB Connection URI", "zh-CN": "MongoDB 连接串" },
      description: {
        en: "MongoDB connection URI, for example mongodb://user:password@host:27017.",
        "zh-CN": "MongoDB 连接 URI，例如 mongodb://user:password@host:27017。",
      },
    },
    isSecret: true,
  }),
  database: z.string().meta({
    title: "Database Name",
    description: "Name of the MongoDB database.",
    "x-i18n": {
      title: { en: "Database Name", "zh-CN": "数据库名称" },
      description: {
        en: "Name of the MongoDB database.",
        "zh-CN": "MongoDB 数据库名称。",
      },
    },
    isSecret: false,
  }),
  connectTimeoutMS: z
    .number()
    .optional()
    .meta({
      title: "Connection Timeout",
      description: "Connection timeout in milliseconds.",
      "x-i18n": {
        title: { en: "Connection Timeout", "zh-CN": "连接超时时间" },
        description: {
          en: "Connection timeout in milliseconds.",
          "zh-CN": "连接超时时间，单位毫秒。",
        },
      },
      isSecret: false,
    }),
  socketTimeoutMS: z
    .number()
    .optional()
    .meta({
      title: "Socket Timeout",
      description: "Socket read/write timeout in milliseconds.",
      "x-i18n": {
        title: { en: "Socket Timeout", "zh-CN": "Socket 超时时间" },
        description: {
          en: "Socket read/write timeout in milliseconds.",
          "zh-CN": "Socket 读写超时时间，单位毫秒。",
        },
      },
      isSecret: false,
    }),
});

const resultOutputSchema = defineOutputSchema({
  result: {
    type: z.unknown(),
    title: { en: "Result", "zh-CN": "结果" },
    description: {
      en: "Result returned by the MongoDB operation.",
      "zh-CN": "MongoDB 操作返回的结果。",
    },
  },
});

const collectionInputFields = {
  collection: {
    type: z.string(),
    title: { en: "Collection Name", "zh-CN": "集合名称" },
    description: {
      en: "Name of the MongoDB collection to use.",
      "zh-CN": "要操作的 MongoDB 集合名称。",
    },
    isToolParam: true,
  },
};

const findInputSchema = defineInputSchema({
  ...collectionInputFields,
  filter: {
    type: z.string().default("{}"),
    title: { en: "Filter", "zh-CN": "查询条件" },
    description: {
      en: "MongoDB filter JSON object in Extended JSON format. Use {} to match all documents.",
      "zh-CN":
        "MongoDB filter JSON 对象，支持 Extended JSON；使用 {} 匹配所有文档。",
    },
    isToolParam: true,
  },
  projection: {
    type: z.string().optional(),
    title: { en: "Projection", "zh-CN": "返回字段" },
    description: {
      en: 'Optional MongoDB projection JSON object, for example {"name":1,"_id":0}.',
      "zh-CN": '可选的 MongoDB projection JSON 对象，例如 {"name":1,"_id":0}。',
    },
    isToolParam: true,
  },
  sort: {
    type: z.string().optional(),
    title: { en: "Sort", "zh-CN": "排序" },
    description: {
      en: 'Optional MongoDB sort JSON object, for example {"createdAt":-1}.',
      "zh-CN": '可选的 MongoDB sort JSON 对象，例如 {"createdAt":-1}。',
    },
    isToolParam: true,
  },
  limit: {
    type: z.number().optional(),
    title: { en: "Result Limit", "zh-CN": "返回数量" },
    description: {
      en: "Maximum number of documents to return; defaults to 100 and is capped at 1000.",
      "zh-CN": "最多返回的文档数量，默认 100，最多 1000 条。",
    },
    isToolParam: true,
  },
  skip: {
    type: z.number().optional(),
    title: { en: "Skip Count", "zh-CN": "跳过数量" },
    description: {
      en: "Number of documents to skip; defaults to 0.",
      "zh-CN": "要跳过的文档数量，默认 0。",
    },
    isToolParam: true,
  },
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

const insertInputSchema = defineInputSchema({
  ...collectionInputFields,
  documents: {
    type: z.string(),
    title: { en: "Documents", "zh-CN": "文档" },
    description: {
      en: "JSON document or array of JSON documents to insert, in Extended JSON format when needed.",
      "zh-CN":
        "要插入的 JSON 文档或 JSON 文档数组，必要时可使用 Extended JSON。",
    },
    isToolParam: true,
  },
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

const updateInputSchema = defineInputSchema({
  ...collectionInputFields,
  filter: {
    type: z.string(),
    title: { en: "Filter", "zh-CN": "匹配条件" },
    description: {
      en: "MongoDB filter JSON object selecting documents to update.",
      "zh-CN": "用于筛选待更新文档的 MongoDB filter JSON 对象。",
    },
    isToolParam: true,
  },
  update: {
    type: z.string(),
    title: { en: "Update Document", "zh-CN": "更新内容" },
    description: {
      en: 'MongoDB update JSON object using operators such as $set, $inc, or $unset; for example {"$set":{"status":"done"}}.',
      "zh-CN":
        '使用 $set、$inc 或 $unset 等操作符的 MongoDB update JSON 对象，例如 {"$set":{"status":"done"}}。',
    },
    isToolParam: true,
  },
  multi: {
    type: z.boolean().optional(),
    title: { en: "Update Multiple Documents", "zh-CN": "更新多条文档" },
    description: {
      en: "When true, use updateMany; otherwise use updateOne.",
      "zh-CN": "为 true 时执行 updateMany，否则执行 updateOne。",
    },
    isToolParam: true,
  },
  upsert: {
    type: z.boolean().optional(),
    title: { en: "Insert If Missing", "zh-CN": "不存在时插入" },
    description: {
      en: "Whether to insert a document when no document matches the filter.",
      "zh-CN": "没有文档匹配筛选条件时，是否插入新文档。",
    },
    isToolParam: true,
  },
  allowEmptyFilter: {
    type: z.boolean().optional(),
    title: { en: "Allow Empty Filter", "zh-CN": "允许空条件" },
    description: {
      en: "Explicitly allow an empty filter to update the entire collection.",
      "zh-CN": "显式允许使用空 filter 更新整个集合。",
    },
    isToolParam: true,
  },
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

const deleteInputSchema = defineInputSchema({
  ...collectionInputFields,
  filter: {
    type: z.string(),
    title: { en: "Filter", "zh-CN": "删除条件" },
    description: {
      en: "MongoDB filter JSON object selecting documents to delete.",
      "zh-CN": "用于筛选待删除文档的 MongoDB filter JSON 对象。",
    },
    isToolParam: true,
  },
  multi: {
    type: z.boolean().optional(),
    title: { en: "Delete Multiple Documents", "zh-CN": "删除多条文档" },
    description: {
      en: "When true, use deleteMany; otherwise use deleteOne.",
      "zh-CN": "为 true 时执行 deleteMany，否则执行 deleteOne。",
    },
    isToolParam: true,
  },
  allowEmptyFilter: {
    type: z.boolean().optional(),
    title: { en: "Allow Empty Filter", "zh-CN": "允许空条件" },
    description: {
      en: "Explicitly allow an empty filter to delete the entire collection.",
      "zh-CN": "显式允许使用空 filter 删除整个集合。",
    },
    isToolParam: true,
  },
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

const aggregateInputSchema = defineInputSchema({
  ...collectionInputFields,
  pipeline: {
    type: z.string(),
    title: { en: "Aggregation Pipeline", "zh-CN": "聚合管道" },
    description: {
      en: "MongoDB aggregation pipeline encoded as a JSON array.",
      "zh-CN": "以 JSON 数组编码的 MongoDB aggregation pipeline。",
    },
    isToolParam: true,
  },
  limit: {
    type: z.number().optional(),
    title: { en: "Result Limit", "zh-CN": "返回数量" },
    description: {
      en: "Maximum number of aggregation results to return; defaults to 100 and is capped at 1000.",
      "zh-CN": "最多返回的聚合结果数量，默认 100，最多 1000 条。",
    },
    isToolParam: true,
  },
  allowDiskUse: {
    type: z.boolean().optional(),
    title: { en: "Allow Disk Use", "zh-CN": "允许使用磁盘" },
    description: {
      en: "Whether MongoDB may write temporary aggregation data to disk.",
      "zh-CN": "是否允许 MongoDB 将临时聚合数据写入磁盘。",
    },
    isToolParam: true,
  },
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
      en: "Query, insert, update, delete, and aggregate MongoDB documents using JSON or Extended JSON parameters.",
      "zh-CN":
        "使用 JSON 或 Extended JSON 参数查询、插入、更新、删除和聚合 MongoDB 文档。",
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
      id: "find",
      name: {
        en: "Find Documents",
        "zh-CN": "查询文档",
      },
      description: {
        en: "Find documents in a MongoDB collection using a filter, optional projection, sort, limit, and skip.",
        "zh-CN":
          "使用筛选条件查询 MongoDB 集合中的文档，并可指定返回字段、排序、数量上限和跳过数量。",
      },
      handler: findHandler,
    },
    {
      id: "insert",
      name: {
        en: "Insert Documents",
        "zh-CN": "插入文档",
      },
      description: {
        en: "Insert one JSON document or an array of JSON documents into a MongoDB collection.",
        "zh-CN": "向 MongoDB 集合插入一个 JSON 文档或 JSON 文档数组。",
      },
      handler: insertHandler,
    },
    {
      id: "update",
      name: {
        en: "Update Documents",
        "zh-CN": "更新文档",
      },
      description: {
        en: "Update matching MongoDB documents with update operators, optionally allowing multiple matches or upsert.",
        "zh-CN":
          "使用更新操作符修改匹配的 MongoDB 文档，并可选择更新多条文档或启用 upsert。",
      },
      handler: updateHandler,
    },
    {
      id: "delete",
      name: {
        en: "Delete Documents",
        "zh-CN": "删除文档",
      },
      description: {
        en: "Delete matching documents from a MongoDB collection, with explicit support for multiple matches.",
        "zh-CN": "从 MongoDB 集合删除匹配的文档，并显式支持删除多条文档。",
      },
      handler: deleteHandler,
    },
    {
      id: "aggregate",
      name: {
        en: "Aggregate Documents",
        "zh-CN": "聚合文档",
      },
      description: {
        en: "Run a MongoDB aggregation pipeline on a collection with optional result limits and disk use.",
        "zh-CN":
          "在 MongoDB 集合上运行聚合管道，并可设置结果数量上限和是否使用磁盘。",
      },
      handler: aggregateHandler,
    },
  ],
});

export default toolSet;

import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as delInputType,
  OutputType as delOutputType,
  tool as delTool,
} from "./children/del";
import {
  InputType as getInputType,
  OutputType as getOutputType,
  tool as getTool,
} from "./children/get";
import {
  InputType as setInputType,
  OutputType as setOutputType,
  tool as setTool,
} from "./children/set";

const secretSchema = z.object({
  redisUrl: z.string().meta({
    title: "Redis Connection URL",
    description:
      "Redis connection URL, such as redis://host:port or redis://user:password@host:port/db.",
    "x-i18n": {
      title: { en: "Redis Connection URL", "zh-CN": "Redis 连接串" },
      description: {
        en: "Redis connection URL, such as redis://host:port or redis://user:password@host:port/db.",
        "zh-CN":
          "Redis 连接地址，例如 redis://host:port 或 redis://user:password@host:port/db。",
      },
    },
    isSecret: true,
  }),
});
const delSecretSchema = z.object({});
const delInputSchema = defineInputSchema({
  key: {
    type: z.string(),
    title: { en: "Cache Key", "zh-CN": "缓存键" },
    description: {
      en: "Name of the Redis key to delete.",
      "zh-CN": "要删除的 Redis 键名。",
    },
    isToolParam: true,
  },
});
const delOutputSchema = defineOutputSchema({
  deleted: {
    type: z.boolean(),
    title: { en: "Deleted", "zh-CN": "是否删除" },
    description: {
      en: "Whether the key was deleted; false if the key did not exist.",
      "zh-CN": "键是否已删除；如果键不存在则为 false。",
    },
  },
});
const delHandler = createToolHandler({
  inputSchema: delInputSchema,
  outputSchema: delOutputSchema,
  secretSchema: delSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await delInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await delTool(parsedInput);
    return delOutputType.parseAsync(output);
  },
});

const getSecretSchema = z.object({});
const getInputSchema = defineInputSchema({
  key: {
    type: z.string(),
    title: { en: "Cache Key", "zh-CN": "缓存键" },
    description: {
      en: "Name of the Redis key to retrieve.",
      "zh-CN": "要读取的 Redis 键名。",
    },
    isToolParam: true,
  },
});
const getOutputSchema = defineOutputSchema({
  value: {
    type: z.string().nullable(),
    title: { en: "Cache Value", "zh-CN": "缓存值" },
    description: {
      en: "Cached data returned for the key; null when the key does not exist.",
      "zh-CN": "该键对应的缓存数据；如果键不存在则为 null。",
    },
  },
  exists: {
    type: z.boolean(),
    title: { en: "Exists", "zh-CN": "是否存在" },
    description: {
      en: "Whether the key exists in Redis.",
      "zh-CN": "该键是否存在于 Redis 中。",
    },
  },
});
const getHandler = createToolHandler({
  inputSchema: getInputSchema,
  outputSchema: getOutputSchema,
  secretSchema: getSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await getInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await getTool(parsedInput);
    return getOutputType.parseAsync(output);
  },
});

const setSecretSchema = z.object({});
const setInputSchema = defineInputSchema({
  key: {
    type: z.string(),
    title: { en: "Cache Key", "zh-CN": "缓存键" },
    description: {
      en: "Name of the Redis key to set.",
      "zh-CN": "要设置的 Redis 键名。",
    },
    isToolParam: true,
  },
  value: {
    type: z.string(),
    title: { en: "Cache Value", "zh-CN": "缓存值" },
    description: {
      en: "String data to store in Redis.",
      "zh-CN": "要存储到 Redis 的字符串数据。",
    },
    isToolParam: true,
  },
  ttl: {
    type: z.number().optional(),
    title: { en: "Expiration (Seconds)", "zh-CN": "过期时间（秒）" },
    description: {
      en: "Expiration time in seconds; 0 means the value never expires.",
      "zh-CN": "数据过期时间，单位为秒；0 表示永不过期。",
    },
    isToolParam: true,
  },
});
const setOutputSchema = defineOutputSchema({
  success: {
    type: z.boolean(),
    title: { en: "Set Succeeded", "zh-CN": "设置成功" },
    description: {
      en: "Whether the value was successfully stored.",
      "zh-CN": "是否成功设置缓存值。",
    },
  },
});
const setHandler = createToolHandler({
  inputSchema: setInputSchema,
  outputSchema: setOutputSchema,
  secretSchema: setSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await setInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await setTool(parsedInput);
    return setOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "redis",
    name: {
      en: "Redis Cache",
      "zh-CN": "Redis 缓存",
    },
    description: {
      en: "Manage Redis cache values with GET, SET, and DELETE operations, including optional time-to-live support.",
      "zh-CN":
        "通过 GET、SET 和 DELETE 操作管理 Redis 缓存，支持设置可选的生存时间。",
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
      id: "del",
      name: {
        en: "Delete Cache",
        "zh-CN": "删除缓存",
      },
      description: {
        en: "Delete a Redis key and its cached value.",
        "zh-CN": "删除 Redis 键及其缓存值。",
      },
      handler: delHandler,
    },
    {
      id: "get",
      name: {
        en: "Get Cache",
        "zh-CN": "获取缓存",
      },
      description: {
        en: "Retrieve a cached value from Redis by key; the result is null when the key does not exist.",
        "zh-CN": "根据键名从 Redis 获取缓存值；如果键不存在，结果为 null。",
      },
      handler: getHandler,
    },
    {
      id: "set",
      name: {
        en: "Set Cache",
        "zh-CN": "设置缓存",
      },
      description: {
        en: "Store a value in Redis with an optional time-to-live in seconds.",
        "zh-CN": "将值存储到 Redis，并可选设置以秒为单位的生存时间。",
      },
      handler: setHandler,
    },
  ],
});

export default toolSet;

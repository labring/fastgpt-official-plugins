import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
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
  "redisUrl": z.string().meta({
    title: "Redis 连接串",
    description: "Redis 连接地址 (格式: redis://host:port 或 redis://user:password@host:port/db)"
  })
});
const delSecretSchema = z.object({});
const delInputSchema = z.object({
  "key": z.string().meta({
    title: "缓存键",
    description: "Redis 键名",
    toolDescription: "The Redis key to delete"
  })
});
const delOutputSchema = z.object({
  "deleted": z.boolean().meta({
    title: "是否删除",
    description: "键是否被删除 (如果键不存在则为 false)"
  })
});
const delHandler = createToolHandler({
  inputSchema: delInputSchema,
  outputSchema: delOutputSchema,
  secretSchema: delSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await delInputType.parseAsync(input);
    const output = await delTool(parsedInput, ctx);
    return delOutputType.parseAsync(output);
  },
});

const getSecretSchema = z.object({});
const getInputSchema = z.object({
  "key": z.string().meta({
    title: "缓存键",
    description: "Redis 键名",
    toolDescription: "The Redis key to retrieve"
  })
});
const getOutputSchema = z.object({
  "value": z.string().meta({
    title: "缓存值",
    description: "获取到的缓存数据,如果键不存在则为 null"
  }),
  "exists": z.boolean().meta({
    title: "是否存在",
    description: "键是否存在"
  })
});
const getHandler = createToolHandler({
  inputSchema: getInputSchema,
  outputSchema: getOutputSchema,
  secretSchema: getSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await getInputType.parseAsync(input);
    const output = await getTool(parsedInput, ctx);
    return getOutputType.parseAsync(output);
  },
});

const setSecretSchema = z.object({});
const setInputSchema = z.object({
  "key": z.string().meta({
    title: "缓存键",
    description: "Redis 键名",
    toolDescription: "The Redis key to set"
  }),
  "value": z.string().meta({
    title: "缓存值",
    description: "要存储的数据",
    toolDescription: "The value to cache"
  }),
  "ttl": z.number().optional().meta({
    title: "过期时间 (秒)",
    description: "数据过期时间,单位秒。0 表示永不过期",
    toolDescription: "Time to live in seconds (0 = no expiration)"
  })
});
const setOutputSchema = z.object({
  "success": z.boolean().meta({
    title: "设置成功",
    description: "是否成功设置"
  })
});
const setHandler = createToolHandler({
  inputSchema: setInputSchema,
  outputSchema: setOutputSchema,
  secretSchema: setSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await setInputType.parseAsync(input);
    const output = await setTool(parsedInput, ctx);
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
      en: "Provides basic Redis cache operations including get, set and delete",
      "zh-CN": "提供 Redis 缓存的基本操作功能,包括获取、设置和删除",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
    },
    toolDescription:
      "A Redis caching toolset with GET, SET, DELETE operations. Use these tools to manage cached data in Redis with TTL support.",
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
        en: "Delete cached data from Redis",
        "zh-CN": "从 Redis 删除缓存数据",
      },
      toolDescription: "Delete a key and its value from Redis.",
      handler: delHandler,
    },
    {
      id: "get",
      name: {
        en: "Get Cache",
        "zh-CN": "获取缓存",
      },
      description: {
        en: "Get cached data from Redis",
        "zh-CN": "从 Redis 获取缓存数据",
      },
      toolDescription:
        "Get cached value from Redis by key. Returns null if key does not exist.",
      handler: getHandler,
    },
    {
      id: "set",
      name: {
        en: "Set Cache",
        "zh-CN": "设置缓存",
      },
      description: {
        en: "Set Redis cache data with optional TTL",
        "zh-CN": "设置 Redis 缓存数据,支持过期时间",
      },
      toolDescription:
        "Set a value in Redis with optional expiration time (TTL in seconds).",
      handler: setHandler,
    },
  ],
});

export default toolSet;

import { defineToolSet, ToolTagEnum } from "@fastgpt-plugin/helpers";

export default defineToolSet({
  name: {
    "zh-CN": "Redis 缓存",
    en: "Redis Cache",
  },
  tags: [ToolTagEnum.tools],
  description: {
    "zh-CN": "提供 Redis 缓存的基本操作功能,包括获取、设置和删除",
    en: "Provides basic Redis cache operations including get, set and delete",
  },
  toolDescription:
    "A Redis caching toolset with GET, SET, DELETE operations. Use these tools to manage cached data in Redis with TTL support.",

  // Shared secret config - all child tools share this
  secretInputConfig: [
    {
      key: "redisUrl",
      label: "Redis 连接串",
      description:
        "Redis 连接地址 (格式: redis://host:port 或 redis://user:password@host:port/db)",
      required: true,
      inputType: "secret",
    },
  ],
});

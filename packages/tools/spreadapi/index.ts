import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as executeCalculationInputType,
  tool as executeCalculationTool,
} from "./children/executeCalculation";
import {
  InputType as getServiceInfoInputType,
  tool as getServiceInfoTool,
} from "./children/getServiceInfo";

const secretSchema = z.object({
  spreadapiApiKey: z
    .string()
    .optional()
    .nullable()
    .meta({
      title: "SpreadAPI API key",
      description:
        "Optional API key sent as an Authorization: Bearer token when calling published services.",
      isSecret: true,
      "x-i18n": {
        title: { en: "SpreadAPI API key", "zh-CN": "SpreadAPI API Key" },
        description: {
          en: "Optional API key sent as an Authorization: Bearer token when calling published services.",
          "zh-CN":
            "可选的 SpreadAPI API Key，填写后将作为 Authorization: Bearer 发送。",
        },
      },
    }),
  serviceUrl: z
    .string()
    .url()
    .meta({
      title: "Service URL",
      description:
        "Published SpreadAPI service URL: a /d/{id} share URL, service metadata URL, or execute endpoint.",
      isSecret: false,
      "x-i18n": {
        title: { en: "Service URL", "zh-CN": "服务 URL" },
        description: {
          en: "Published SpreadAPI service URL: a /d/{id} share URL, service metadata URL, or execute endpoint.",
          "zh-CN":
            "SpreadAPI 发布的服务 URL，支持 /d/{id} 分享地址、服务详情 URL 或 execute endpoint。",
        },
      },
    }),
});

const spreadApiCommonInputSchema = {
  query: {
    type: z.record(z.string(), z.any()).optional().default({}),
    title: { en: "Query parameters", "zh-CN": "查询参数" },
    description: {
      en: "Optional query parameters object appended to the service request URL.",
      "zh-CN": "附加到服务请求 URL 的可选 query 参数对象。",
    },
    isToolParam: true,
  },
  timeout: {
    type: z.number().int().positive().optional().default(30000),
    title: { en: "Timeout", "zh-CN": "超时时间" },
    description: {
      en: "Request timeout in milliseconds.",
      "zh-CN": "请求超时时间，单位毫秒。",
    },
    isToolParam: true,
  },
  serviceToken: {
    type: z.string().optional().nullable(),
    title: { en: "Service token", "zh-CN": "服务 Token" },
    description: {
      en: "Optional SpreadAPI service-level token, sent according to includeTokenMode.",
      "zh-CN":
        "可选的 SpreadAPI 服务级 Token，可按 includeTokenMode 设置发送方式。",
    },
    isToolParam: true,
  },
};
const executeCalculationOutputSchema = defineOutputSchema({
  result: {
    type: z.any(),
    title: { en: "Calculation result", "zh-CN": "计算结果" },
    description: {
      en: "Calculated result returned by the published service.",
      "zh-CN": "已发布服务返回的计算结果。",
    },
  },
  status: {
    type: z.number(),
    title: { en: "HTTP status", "zh-CN": "HTTP 状态码" },
    description: {
      en: "HTTP response status code.",
      "zh-CN": "HTTP 响应状态码。",
    },
  },
  data: {
    type: z.any(),
    title: { en: "Response data", "zh-CN": "响应数据" },
    description: {
      en: "Raw response data returned by the service.",
      "zh-CN": "服务返回的原始响应数据。",
    },
  },
});
const getServiceInfoOutputSchema = defineOutputSchema({
  info: {
    type: z.any(),
    title: { en: "Service information", "zh-CN": "服务信息" },
    description: {
      en: "Metadata returned by the published service.",
      "zh-CN": "已发布服务返回的元信息。",
    },
  },
  status: {
    type: z.number(),
    title: { en: "HTTP status", "zh-CN": "HTTP 状态码" },
    description: {
      en: "HTTP response status code.",
      "zh-CN": "HTTP 响应状态码。",
    },
  },
  data: {
    type: z.any(),
    title: { en: "Response data", "zh-CN": "响应数据" },
    description: {
      en: "Raw response data returned by the service.",
      "zh-CN": "服务返回的原始响应数据。",
    },
  },
});

const executeCalculationHandler = createToolHandler({
  inputSchema: defineInputSchema({
    ...spreadApiCommonInputSchema,
    method: {
      type: z.enum(["POST", "GET"]).default("POST"),
      title: { en: "HTTP method", "zh-CN": "请求方法" },
      description: {
        en: "Use POST or GET to call the service.",
        "zh-CN": "调用服务时使用 POST 或 GET。",
      },
      isToolParam: true,
    },
    inputs: {
      type: z.record(z.string(), z.any()).optional().default({}),
      title: { en: "Input values", "zh-CN": "输入值" },
      description: {
        en: "Input values object passed to the published spreadsheet calculation service.",
        "zh-CN": "传给已发布表格计算服务的输入值对象。",
      },
      isToolParam: true,
    },
    includeTokenMode: {
      type: z.enum(["none", "query", "body"]).default("none"),
      title: { en: "Service token delivery", "zh-CN": "服务 Token 发送方式" },
      description: {
        en: "Choose whether serviceToken is omitted, sent as a query parameter, or included in the POST body.",
        "zh-CN":
          "控制 serviceToken 不发送、作为 query 参数发送或包含在 POST 请求体中。",
      },
      isToolParam: true,
    },
  }),
  outputSchema: executeCalculationOutputSchema,
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await executeCalculationInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await executeCalculationTool(parsedInput);
    return executeCalculationOutputSchema.parseAsync(output);
  },
});

const getServiceInfoHandler = createToolHandler({
  inputSchema: defineInputSchema({
    ...spreadApiCommonInputSchema,
    infoPath: {
      type: z.string().optional().default(""),
      title: { en: "Info path", "zh-CN": "信息路径" },
      description: {
        en: "Path appended to serviceUrl to fetch service metadata; leave empty for the default endpoint.",
        "zh-CN":
          "获取服务元信息时附加到 serviceUrl 的路径；留空时使用默认接口。",
      },
      isToolParam: true,
    },
    includeTokenMode: {
      type: z.enum(["none", "query"]).default("none"),
      title: { en: "Service token delivery", "zh-CN": "服务 Token 发送方式" },
      description: {
        en: "Choose whether serviceToken is omitted or sent as a query parameter.",
        "zh-CN": "控制 serviceToken 不发送或作为 query 参数发送。",
      },
      isToolParam: true,
    },
  }),
  outputSchema: getServiceInfoOutputSchema,
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await getServiceInfoInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await getServiceInfoTool(parsedInput);
    return getServiceInfoOutputSchema.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "spreadapi",
    name: {
      en: "SpreadAPI Spreadsheet Calculation",
      "zh-CN": "SpreadAPI 表格计算",
    },
    description: {
      en: "Call published SpreadAPI Excel REST APIs to execute calculations and get service info.",
      "zh-CN":
        "调用 SpreadAPI 发布的 Excel REST API,执行表格计算并获取服务信息。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "初始版本",
    },
    author: "FastGPT Team",
    tags: ["tools"],
  },
  secretSchema,
  children: [
    {
      id: "executeCalculation",
      name: {
        en: "Execute Calculation",
        "zh-CN": "执行表格计算",
      },
      description: {
        en: "Execute a published SpreadAPI spreadsheet calculation service",
        "zh-CN": "执行 SpreadAPI 发布的表格计算服务",
      },
      handler: executeCalculationHandler,
    },
    {
      id: "getServiceInfo",
      name: {
        en: "Get Service Info",
        "zh-CN": "获取服务信息",
      },
      description: {
        en: "Get metadata from a published SpreadAPI service",
        "zh-CN": "获取 SpreadAPI 发布服务的元信息",
      },
      handler: getServiceInfoHandler,
    },
  ],
});

export default toolSet;

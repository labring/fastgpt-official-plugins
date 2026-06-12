import {
  createToolHandler,
  defineToolSet,
  type InputSchemaMetaType,
  type OutputSchemaMetaType,
  type SecretSchemaMetaType,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";

const DEFAULT_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3";

const secretSchema = z.object({
  apiKey: z
    .string()
    .min(1)
    .meta({
      title: "API Key",
      description: "火山方舟 API Key，用于调用 Seedance 视频生成 API。",
      isSecret: true,
    } satisfies SecretSchemaMetaType),
  baseUrl: z
    .string()
    .url()
    .optional()
    .meta({
      title: "Base URL",
      description: `默认值：${DEFAULT_BASE_URL}`,
      isSecret: false,
    } satisfies SecretSchemaMetaType),
});

const videoStatusSchema = z.enum([
  "queued",
  "running",
  "cancelled",
  "succeeded",
  "failed",
  "expired",
]);

const taskSchema = z.object({
  id: z.string(),
  model: z.string().optional(),
  status: videoStatusSchema,
  error: z
    .object({
      code: z.string().optional(),
      message: z.string().optional(),
    })
    .nullable()
    .optional(),
  created_at: z.number().optional(),
  updated_at: z.number().optional(),
  content: z
    .object({
      video_url: z.string().optional(),
      last_frame_url: z.string().optional(),
    })
    .optional(),
  seed: z.number().optional(),
  resolution: z.string().optional(),
  ratio: z.string().optional(),
  duration: z.number().optional(),
  frames: z.number().optional(),
  framespersecond: z.number().optional(),
  generate_audio: z.boolean().optional(),
  usage: z
    .object({
      completion_tokens: z.number().optional(),
      total_tokens: z.number().optional(),
    })
    .optional(),
});

type ArkTask = z.infer<typeof taskSchema>;
type ArkSecret = z.infer<typeof secretSchema>;
type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
type RequestArkOptions = {
  apiKey: string;
  baseUrl?: string;
  path: string;
  method: "GET" | "POST";
  body?: unknown;
};
type ArkTextContent = {
  type: "text";
  text: string;
};
type ArkImageContent = {
  type: "image_url";
  image_url: {
    url: string;
  };
  role: "first_frame" | "last_frame" | "reference_image";
};
type ArkContent = ArkTextContent | ArkImageContent;

const createTaskResponseSchema = z.object({
  id: z.string(),
});

const createTaskOutputSchema = z.object({
  taskId: z.string().meta({
    title: "任务 ID",
    description: "创建成功后返回的视频生成任务 ID。",
  } satisfies OutputSchemaMetaType),
});

const arkTaskOutputSchema = z.object({
  taskId: z.string().meta({
    title: "任务 ID",
    description: "视频生成任务 ID。",
  } satisfies OutputSchemaMetaType),
  status: videoStatusSchema.meta({
    title: "任务状态",
    description: "queued、running、cancelled、succeeded、failed 或 expired。",
  } satisfies OutputSchemaMetaType),
  videoUrl: z
    .string()
    .optional()
    .meta({
      title: "视频 URL",
      description: "任务成功后返回的 mp4 视频 URL，有效期以火山方舟返回为准。",
    } satisfies OutputSchemaMetaType),
  lastFrameUrl: z
    .string()
    .optional()
    .meta({
      title: "尾帧 URL",
      description: "启用返回尾帧后，任务成功时返回的尾帧图片 URL。",
    } satisfies OutputSchemaMetaType),
  errorCode: z
    .string()
    .optional()
    .meta({
      title: "错误码",
    } satisfies OutputSchemaMetaType),
  errorMessage: z
    .string()
    .optional()
    .meta({
      title: "错误信息",
    } satisfies OutputSchemaMetaType),
  model: z
    .string()
    .optional()
    .meta({
      title: "模型",
    } satisfies OutputSchemaMetaType),
  createdAt: z
    .number()
    .optional()
    .meta({
      title: "创建时间",
    } satisfies OutputSchemaMetaType),
  updatedAt: z
    .number()
    .optional()
    .meta({
      title: "更新时间",
    } satisfies OutputSchemaMetaType),
  usageTotalTokens: z
    .number()
    .optional()
    .meta({
      title: "总 Token 用量",
    } satisfies OutputSchemaMetaType),
});

const createTaskInputSchema = z.object({
  model: z
    .string()
    .min(1)
    .meta({
      title: "模型 ID",
      description:
        "火山方舟视频生成模型 ID 或 Endpoint ID，例如 doubao-seedance-1-5-pro-251215。",
      toolDescription:
        "The Volcengine Ark video generation model ID or Endpoint ID.",
    } satisfies InputSchemaMetaType),
  prompt: z
    .string()
    .min(1)
    .meta({
      title: "视频提示词",
      description: "描述期望生成的视频内容。",
      toolDescription: "The text prompt describing the video to generate.",
    } satisfies InputSchemaMetaType),
  firstFrameImageUrl: z
    .string()
    .optional()
    .meta({
      title: "首帧图片 URL",
      description: "可选。公网图片 URL、Base64 图片或火山素材 ID。",
    } satisfies InputSchemaMetaType),
  lastFrameImageUrl: z
    .string()
    .optional()
    .meta({
      title: "尾帧图片 URL",
      description: "可选。与首帧图片一起使用时，作为尾帧。",
    } satisfies InputSchemaMetaType),
  ratio: z
    .enum(["16:9", "9:16", "1:1", "4:3", "3:4"])
    .optional()
    .meta({
      title: "宽高比",
      description: "按火山方舟文档作为请求体顶层 ratio 字段传入。",
    } satisfies InputSchemaMetaType),
  resolution: z
    .enum(["480p", "720p", "1080p"])
    .optional()
    .meta({
      title: "分辨率",
      description: "按火山方舟文档作为请求体顶层 resolution 字段传入。",
    } satisfies InputSchemaMetaType),
  duration: z
    .number()
    .int()
    .positive()
    .optional()
    .meta({
      title: "时长",
      description: "单位：秒。按火山方舟文档作为请求体顶层 duration 字段传入。",
    } satisfies InputSchemaMetaType),
  seed: z
    .number()
    .int()
    .optional()
    .meta({
      title: "随机种子",
      description: "按火山方舟文档作为请求体顶层 seed 字段传入。",
    } satisfies InputSchemaMetaType),
  cameraFixed: z
    .boolean()
    .optional()
    .meta({
      title: "固定镜头",
      description: "按火山方舟文档作为请求体顶层 camera_fixed 字段传入。",
    } satisfies InputSchemaMetaType),
  watermark: z
    .boolean()
    .optional()
    .meta({
      title: "水印",
      description: "按火山方舟文档作为请求体顶层 watermark 字段传入。",
    } satisfies InputSchemaMetaType),
  generateAudio: z
    .boolean()
    .optional()
    .meta({
      title: "生成音频",
      description: "控制输出视频是否包含同步声音。",
    } satisfies InputSchemaMetaType),
  returnLastFrame: z
    .boolean()
    .optional()
    .meta({
      title: "返回尾帧",
      description: "是否在查询结果中返回生成视频的尾帧图片。",
    } satisfies InputSchemaMetaType),
  callbackUrl: z
    .string()
    .url()
    .optional()
    .meta({
      title: "回调 URL",
      description: "任务状态变化时，火山方舟会向该地址推送结果。",
    } satisfies InputSchemaMetaType),
  safetyIdentifier: z
    .string()
    .max(64)
    .optional()
    .meta({
      title: "安全标识",
      description: "终端用户唯一标识，用于协助火山方舟做安全检测。",
    } satisfies InputSchemaMetaType),
  priority: z
    .number()
    .int()
    .min(0)
    .max(9)
    .optional()
    .meta({
      title: "优先级",
      description: "仅部分 Seedance 2.0 模型支持，取值 0-9。",
    } satisfies InputSchemaMetaType),
});

const queryTaskInputSchema = z.object({
  taskId: z
    .string()
    .min(1)
    .meta({
      title: "任务 ID",
      description: "创建视频生成任务返回的 ID。",
      toolDescription: "The video generation task ID to query.",
    } satisfies InputSchemaMetaType),
});

const createSeedanceVideoGenerationTaskHandler = createToolHandler({
  inputSchema: createTaskInputSchema,
  outputSchema: createTaskOutputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const secrets = secretSchema.parse(ctx.secrets);
    const response = await requestArk<z.infer<typeof createTaskResponseSchema>>(
      buildRequestOptions(secrets, {
        path: "/contents/generations/tasks",
        method: "POST",
        body: buildCreateTaskBody(input),
      }),
    );

    const task = createTaskResponseSchema.parse(response);
    return {
      taskId: task.id,
    };
  },
});

const querySeedanceVideoGenerationTaskHandler = createToolHandler({
  inputSchema: queryTaskInputSchema,
  outputSchema: arkTaskOutputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const secrets = secretSchema.parse(ctx.secrets);
    const taskId = encodeURIComponent(input.taskId);
    const response = await requestArk<ArkTask>(
      buildRequestOptions(secrets, {
        path: `/contents/generations/tasks/${taskId}`,
        method: "GET",
      }),
    );

    const task = taskSchema.parse(response);
    return toTaskOutput(task);
  },
});

export default defineToolSet({
  secretSchema,
  manifest: {
    pluginId: "seedanceVideoGeneration",
    name: {
      en: "Seedance Video Generation",
      "zh-CN": "Seedance 视频生成",
    },
    description: {
      en: "Create and query Volcengine Ark Seedance video generation tasks.",
      "zh-CN": "创建并查询火山方舟 Seedance 视频生成任务。",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version with task creation and query tools.",
      "zh-CN": "初始版本，支持创建和查询视频生成任务。",
    },
    author: "FastGPT",
    tags: ["multimodal"],
    permission: [],
  },
  children: [
    {
      id: "createSeedanceVideoGenerationTask",
      name: {
        en: "Create Seedance Video Generation Task",
        "zh-CN": "创建 Seedance 视频生成任务",
      },
      description: {
        en: "Submit a text-to-video or image-to-video task to Volcengine Ark.",
        "zh-CN": "向火山方舟提交文生视频或图生视频任务。",
      },
      toolDescription:
        "Create a Volcengine Ark Seedance video generation task and return its task ID.",
      handler: createSeedanceVideoGenerationTaskHandler,
    },
    {
      id: "querySeedanceVideoGenerationTask",
      name: {
        en: "Query Seedance Video Generation Task",
        "zh-CN": "查询 Seedance 视频生成任务",
      },
      description: {
        en: "Query a Volcengine Ark video generation task by task ID.",
        "zh-CN": "根据任务 ID 查询火山方舟视频生成任务状态和结果。",
      },
      toolDescription:
        "Query a Volcengine Ark Seedance video generation task and return status, video URL, error, and usage fields.",
      handler: querySeedanceVideoGenerationTaskHandler,
    },
  ],
});

function buildCreateTaskBody(input: CreateTaskInput) {
  const content: ArkContent[] = [{ type: "text", text: input.prompt }];

  if (input.firstFrameImageUrl) {
    content.push({
      type: "image_url",
      image_url: { url: input.firstFrameImageUrl },
      role: input.lastFrameImageUrl ? "first_frame" : "reference_image",
    });
  }

  if (input.lastFrameImageUrl) {
    content.push({
      type: "image_url",
      image_url: { url: input.lastFrameImageUrl },
      role: "last_frame",
    });
  }

  const optionalFields = {
    callback_url: input.callbackUrl,
    return_last_frame: input.returnLastFrame,
    generate_audio: input.generateAudio,
    resolution: input.resolution,
    ratio: input.ratio,
    duration: input.duration,
    seed: input.seed,
    camera_fixed: input.cameraFixed,
    watermark: input.watermark,
    safety_identifier: input.safetyIdentifier,
    priority: input.priority,
  };

  return dropUndefined({
    model: input.model,
    content,
    ...optionalFields,
  });
}

function toTaskOutput(task: ArkTask) {
  return {
    taskId: task.id,
    status: task.status,
    videoUrl: task.content?.video_url,
    lastFrameUrl: task.content?.last_frame_url,
    errorCode: task.error?.code,
    errorMessage: task.error?.message,
    model: task.model,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    usageTotalTokens: task.usage?.total_tokens,
  };
}

function buildRequestOptions(
  secrets: ArkSecret,
  options: Omit<RequestArkOptions, "apiKey" | "baseUrl">,
): RequestArkOptions {
  return {
    apiKey: secrets.apiKey,
    ...options,
    ...(secrets.baseUrl === undefined ? {} : { baseUrl: secrets.baseUrl }),
  };
}

async function requestArk<T>({
  apiKey,
  baseUrl,
  path,
  method,
  body,
}: RequestArkOptions) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const requestOptions: RequestInit = {
      method,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    };

    const response = await fetch(
      `${baseUrl ?? DEFAULT_BASE_URL}${path}`,
      requestOptions,
    );

    const data = await readResponse(response);
    if (!response.ok) {
      throw new Error(formatUpstreamError(response.status, data));
    }

    return data as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Volcengine Ark request timed out after 60 seconds.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function readResponse(response: Response) {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function formatUpstreamError(status: number, data: unknown) {
  if (typeof data === "object" && data !== null) {
    const error = "error" in data ? data.error : data;
    if (typeof error === "object" && error !== null) {
      const code =
        "code" in error && typeof error.code === "string"
          ? error.code
          : undefined;
      const message =
        "message" in error && typeof error.message === "string"
          ? error.message
          : undefined;
      return [
        `Volcengine Ark request failed with status ${status}.`,
        code,
        message,
      ]
        .filter(Boolean)
        .join(" ");
    }
  }

  return `Volcengine Ark request failed with status ${status}.`;
}

function dropUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined),
  ) as Partial<T>;
}

import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
  type SecretSchemaMetaType,
} from "@fastgpt-plugin/sdk-factory";

import z from "zod";

const DEFAULT_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3";

const secretSchema = z.object({
  apiKey: z
    .string()
    .min(1)
    .meta({
      title: "Volcengine Ark API key",
      description: "API key used to call the Seedance video generation API.",
      isSecret: true,
      "x-i18n": {
        title: { en: "Volcengine Ark API key", "zh-CN": "火山方舟 API Key" },
        description: {
          en: "API key used to call the Seedance video generation API.",
          "zh-CN": "用于调用 Seedance 视频生成 API 的火山方舟 API Key。",
        },
      },
    } satisfies SecretSchemaMetaType),
  baseUrl: z
    .string()
    .url()
    .optional()
    .meta({
      title: "Base URL",
      description: `Optional API base URL. Defaults to ${DEFAULT_BASE_URL}.`,
      isSecret: false,
      "x-i18n": {
        title: { en: "Base URL", "zh-CN": "基础 URL" },
        description: {
          en: `Optional API base URL. Defaults to ${DEFAULT_BASE_URL}.`,
          "zh-CN": `可选 API 基础地址，默认值：${DEFAULT_BASE_URL}`,
        },
      },
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

const createTaskOutputSchema = defineOutputSchema({
  taskId: {
    type: z.string(),
    title: { en: "Task ID", "zh-CN": "任务 ID" },
    description: {
      en: "ID returned after successful video task creation.",
      "zh-CN": "创建成功后返回的视频生成任务 ID。",
    },
  },
});

const arkTaskOutputSchema = defineOutputSchema({
  taskId: {
    type: z.string(),
    title: { en: "Task ID", "zh-CN": "任务 ID" },
    description: {
      en: "Video generation task ID.",
      "zh-CN": "视频生成任务 ID。",
    },
  },
  status: {
    type: videoStatusSchema,
    title: { en: "Task status", "zh-CN": "任务状态" },
    description: {
      en: "queued, running, cancelled, succeeded, failed, or expired.",
      "zh-CN": "queued、running、cancelled、succeeded、failed 或 expired。",
    },
  },
  videoUrl: {
    type: z.string().optional(),
    title: { en: "Video URL", "zh-CN": "视频 URL" },
    description: {
      en: "MP4 video URL returned on success; validity is determined by Volcengine Ark.",
      "zh-CN": "任务成功后返回的 MP4 视频 URL，有效期以火山方舟返回为准。",
    },
  },
  lastFrameUrl: {
    type: z.string().optional(),
    title: { en: "Last-frame URL", "zh-CN": "尾帧 URL" },
    description: {
      en: "Last-frame image URL returned on success when enabled.",
      "zh-CN": "启用返回尾帧后，任务成功时返回的尾帧图片 URL。",
    },
  },
  errorCode: {
    type: z.string().optional(),
    title: { en: "Error code", "zh-CN": "错误码" },
  },
  errorMessage: {
    type: z.string().optional(),
    title: { en: "Error message", "zh-CN": "错误信息" },
  },
  model: {
    type: z.string().optional(),
    title: { en: "Model", "zh-CN": "模型" },
  },
  createdAt: {
    type: z.number().optional(),
    title: { en: "Created at", "zh-CN": "创建时间" },
  },
  updatedAt: {
    type: z.number().optional(),
    title: { en: "Updated at", "zh-CN": "更新时间" },
  },
  usageTotalTokens: {
    type: z.number().optional(),
    title: { en: "Total token usage", "zh-CN": "总 Token 用量" },
  },
});

const createTaskInputSchema = defineInputSchema({
  model: {
    type: z.string().min(1),
    title: { en: "Model ID", "zh-CN": "模型 ID" },
    description: {
      en: "The Volcengine Ark video generation model ID or Endpoint ID, e.g. doubao-seedance-1-5-pro-251215.",
      "zh-CN":
        "火山方舟视频生成模型 ID 或 Endpoint ID，例如 doubao-seedance-1-5-pro-251215。",
    },
    isToolParam: true,
  },
  prompt: {
    type: z.string().min(1),
    title: { en: "Video prompt", "zh-CN": "视频提示词" },
    description: {
      en: "Text describing the video to generate.",
      "zh-CN": "描述期望生成的视频内容。",
    },
    isToolParam: true,
  },
  firstFrameImageUrl: {
    type: z.string().optional(),
    title: { en: "First-frame image URL", "zh-CN": "首帧图片 URL" },
    description: {
      en: "Optional public image URL, base64 image, or Volcengine asset ID.",
      "zh-CN": "可选。公网图片 URL、Base64 图片或火山素材 ID。",
    },
    isToolParam: true,
  },
  lastFrameImageUrl: {
    type: z.string().optional(),
    title: { en: "Last-frame image URL", "zh-CN": "尾帧图片 URL" },
    description: {
      en: "Optional ending frame used together with the first-frame image.",
      "zh-CN": "可选。与首帧图片一起使用时，作为尾帧。",
    },
    isToolParam: true,
  },
  ratio: {
    type: z.enum(["16:9", "9:16", "1:1", "4:3", "3:4"]).optional(),
    title: { en: "Aspect ratio", "zh-CN": "宽高比" },
    description: {
      en: "Passed as the top-level ratio field in the request body per Volcengine Ark documentation.",
      "zh-CN": "按火山方舟文档作为请求体顶层 ratio 字段传入。",
    },
    isToolParam: true,
  },
  resolution: {
    type: z.enum(["480p", "720p", "1080p"]).optional(),
    title: { en: "Resolution", "zh-CN": "分辨率" },
    description: {
      en: "Passed as the top-level resolution field in the request body per Volcengine Ark documentation.",
      "zh-CN": "按火山方舟文档作为请求体顶层 resolution 字段传入。",
    },
    isToolParam: true,
  },
  duration: {
    type: z.number().int().positive().optional(),
    title: { en: "Duration", "zh-CN": "时长" },
    description: {
      en: "Duration in seconds; passed as the top-level duration field per Volcengine Ark documentation.",
      "zh-CN": "单位：秒。按火山方舟文档作为请求体顶层 duration 字段传入。",
    },
    isToolParam: true,
  },
  seed: {
    type: z.number().int().optional(),
    title: { en: "Random seed", "zh-CN": "随机种子" },
    description: {
      en: "Passed as the top-level seed field per Volcengine Ark documentation.",
      "zh-CN": "按火山方舟文档作为请求体顶层 seed 字段传入。",
    },
    isToolParam: true,
  },
  cameraFixed: {
    type: z.boolean().optional(),
    title: { en: "Fixed camera", "zh-CN": "固定镜头" },
    description: {
      en: "Passed as the top-level camera_fixed field per Volcengine Ark documentation.",
      "zh-CN": "按火山方舟文档作为请求体顶层 camera_fixed 字段传入。",
    },
    isToolParam: true,
  },
  watermark: {
    type: z.boolean().optional(),
    title: { en: "Watermark", "zh-CN": "水印" },
    description: {
      en: "Passed as the top-level watermark field per Volcengine Ark documentation.",
      "zh-CN": "按火山方舟文档作为请求体顶层 watermark 字段传入。",
    },
    isToolParam: true,
  },
  generateAudio: {
    type: z.boolean().optional(),
    title: { en: "Generate audio", "zh-CN": "生成音频" },
    description: {
      en: "Whether the output video includes synchronized sound.",
      "zh-CN": "控制输出视频是否包含同步声音。",
    },
    isToolParam: true,
  },
  returnLastFrame: {
    type: z.boolean().optional(),
    title: { en: "Return last frame", "zh-CN": "返回尾帧" },
    description: {
      en: "Whether to return the generated video's last-frame image in query results.",
      "zh-CN": "是否在查询结果中返回生成视频的尾帧图片。",
    },
    isToolParam: true,
  },
  callbackUrl: {
    type: z.string().url().optional(),
    title: { en: "Callback URL", "zh-CN": "回调 URL" },
    description: {
      en: "Volcengine Ark sends task updates to this URL when status changes.",
      "zh-CN": "任务状态变化时，火山方舟会向该地址推送结果。",
    },
    isToolParam: true,
  },
  safetyIdentifier: {
    type: z.string().max(64).optional(),
    title: { en: "Safety identifier", "zh-CN": "安全标识" },
    description: {
      en: "Unique end-user identifier to help Volcengine Ark perform safety checks.",
      "zh-CN": "终端用户唯一标识，用于协助火山方舟做安全检测。",
    },
    isToolParam: true,
  },
  priority: {
    type: z.number().int().min(0).max(9).optional(),
    title: { en: "Priority", "zh-CN": "优先级" },
    description: {
      en: "Supported by some Seedance 2.0 models only; range 0–9.",
      "zh-CN": "仅部分 Seedance 2.0 模型支持，取值 0-9。",
    },
    isToolParam: true,
  },
});

const queryTaskInputSchema = defineInputSchema({
  taskId: {
    type: z.string().min(1),
    title: { en: "Task ID", "zh-CN": "任务 ID" },
    description: {
      en: "Video generation task ID returned when the task was created; ID of the Volcengine Ark task to query.",
      "zh-CN": "创建视频生成任务返回的 ID。",
    },
    isToolParam: true,
  },
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
        en: "Create a Volcengine Ark Seedance video generation task and return its task ID. Submit a text-to-video or image-to-video task.",
        "zh-CN": "向火山方舟提交文生视频或图生视频任务，并返回任务 ID。",
      },
      handler: createSeedanceVideoGenerationTaskHandler,
    },
    {
      id: "querySeedanceVideoGenerationTask",
      name: {
        en: "Query Seedance Video Generation Task",
        "zh-CN": "查询 Seedance 视频生成任务",
      },
      description: {
        en: "Query a Volcengine Ark Seedance video generation task by task ID and return status, video URL, errors, and usage.",
        "zh-CN":
          "根据任务 ID 查询火山方舟视频生成任务，并返回状态、视频 URL、错误及用量信息。",
      },
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

import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as createPresignedUrlInputType,
  OutputType as createPresignedUrlOutputType,
  tool as createPresignedUrlTool,
} from "./children/createPresignedUrl";
import {
  InputType as getObjectTextInputType,
  OutputType as getObjectTextOutputType,
  tool as getObjectTextTool,
} from "./children/getObjectText";
import {
  InputType as listObjectsInputType,
  OutputType as listObjectsOutputType,
  tool as listObjectsTool,
} from "./children/listObjects";
import {
  InputType as uploadTextObjectInputType,
  OutputType as uploadTextObjectOutputType,
  tool as uploadTextObjectTool,
} from "./children/uploadTextObject";

const secretSchema = z.object({
  endpoint: z
    .string()
    .url()
    .meta({
      title: "Endpoint",
      description: "S3-compatible endpoint URL.",
      "x-i18n": {
        title: { en: "Endpoint", "zh-CN": "服务端点" },
        description: {
          en: "S3-compatible endpoint URL, for example https://s3.amazonaws.com or https://oss-cn-hangzhou.aliyuncs.com.",
          "zh-CN":
            "S3 兼容服务地址，例如 https://s3.amazonaws.com 或 https://oss-cn-hangzhou.aliyuncs.com。",
        },
      },
      isSecret: false,
    }),
  region: z
    .string()
    .min(1)
    .meta({
      title: "Region",
      description: "Object storage region.",
      "x-i18n": {
        title: { en: "Region", "zh-CN": "区域" },
        description: {
          en: "Object storage region, for example us-east-1 or oss-cn-hangzhou.",
          "zh-CN": "对象存储区域，例如 us-east-1 或 oss-cn-hangzhou。",
        },
      },
      isSecret: false,
    }),
  accessKeyId: z
    .string()
    .min(1)
    .meta({
      title: "Access Key ID",
      description: "Object storage access key ID.",
      "x-i18n": {
        title: { en: "Access Key ID", "zh-CN": "访问密钥 ID" },
        description: {
          en: "Object storage access key ID.",
          "zh-CN": "对象存储访问密钥 ID。",
        },
      },
      isSecret: true,
    }),
  secretAccessKey: z
    .string()
    .min(1)
    .meta({
      title: "Secret Access Key",
      description: "Object storage secret access key.",
      "x-i18n": {
        title: { en: "Secret Access Key", "zh-CN": "访问密钥 Secret" },
        description: {
          en: "Object storage secret access key.",
          "zh-CN": "对象存储访问密钥 Secret。",
        },
      },
      isSecret: true,
    }),
  bucket: z
    .string()
    .min(1)
    .meta({
      title: "Bucket",
      description: "Default bucket name.",
      "x-i18n": {
        title: { en: "Bucket", "zh-CN": "存储桶" },
        description: {
          en: "Default bucket name.",
          "zh-CN": "默认访问的存储桶名称。",
        },
      },
      isSecret: false,
    }),
  forcePathStyle: z
    .boolean()
    .optional()
    .meta({
      title: "Force Path Style",
      description:
        "Enable path-style addressing for MinIO and compatible services.",
      "x-i18n": {
        title: { en: "Force Path Style", "zh-CN": "强制路径样式" },
        description: {
          en: "Enable path-style addressing for MinIO and compatible services.",
          "zh-CN": "使用 MinIO 等兼容服务的 path-style endpoint 时启用。",
        },
      },
      isSecret: false,
    }),
});

const maxTextSizeSchema = z
  .number()
  .int()
  .positive()
  .optional()
  .default(1048576);

const listObjectsOutputSchema = defineOutputSchema({
  objects: {
    type: z.array(
      defineOutputSchema({
        key: {
          type: z.string(),
          title: { en: "Object Key", "zh-CN": "对象 Key" },
          description: {
            en: "Key of the listed object.",
            "zh-CN": "列出对象的 key。",
          },
        },
        size: {
          type: z.number(),
          title: { en: "Object Size", "zh-CN": "对象大小" },
          description: {
            en: "Object size in bytes.",
            "zh-CN": "对象大小，单位为字节。",
          },
        },
        lastModified: {
          type: z.string().nullable(),
          title: { en: "Last Modified", "zh-CN": "最后修改时间" },
          description: {
            en: "Object last-modified timestamp, or null when unavailable.",
            "zh-CN": "对象最后修改时间；不可用时为 null。",
          },
        },
        eTag: {
          type: z.string().nullable(),
          title: { en: "Entity Tag", "zh-CN": "实体标签" },
          description: {
            en: "Object entity tag, or null when unavailable.",
            "zh-CN": "对象实体标签；不可用时为 null。",
          },
        },
        storageClass: {
          type: z.string().nullable(),
          title: { en: "Storage Class", "zh-CN": "存储类型" },
          description: {
            en: "Object storage class, or null when unavailable.",
            "zh-CN": "对象存储类型；不可用时为 null。",
          },
        },
      }),
    ),
    title: { en: "Objects", "zh-CN": "对象列表" },
    description: {
      en: "Objects returned from the configured bucket.",
      "zh-CN": "从已配置存储桶中返回的对象。",
    },
  },
  isTruncated: {
    type: z.boolean(),
    title: { en: "Results Truncated", "zh-CN": "结果是否截断" },
    description: {
      en: "Whether additional objects remain beyond this result page.",
      "zh-CN": "当前结果页之后是否还有更多对象。",
    },
  },
  nextContinuationToken: {
    type: z.string().nullable(),
    title: { en: "Next Continuation Token", "zh-CN": "下一页续传令牌" },
    description: {
      en: "Token for requesting the next page, or null when there is no next page.",
      "zh-CN": "用于请求下一页的令牌；没有下一页时为 null。",
    },
  },
});

const uploadTextObjectOutputSchema = defineOutputSchema({
  key: {
    type: z.string(),
    title: { en: "Object Key", "zh-CN": "对象 Key" },
    description: {
      en: "Key of the uploaded object.",
      "zh-CN": "已上传对象的 key。",
    },
  },
  bucket: {
    type: z.string(),
    title: { en: "Bucket", "zh-CN": "存储桶" },
    description: {
      en: "Bucket that contains the uploaded object.",
      "zh-CN": "包含已上传对象的存储桶。",
    },
  },
  size: {
    type: z.number(),
    title: { en: "Object Size", "zh-CN": "对象大小" },
    description: {
      en: "Uploaded object size in bytes.",
      "zh-CN": "已上传对象的大小，单位为字节。",
    },
  },
  eTag: {
    type: z.string().nullable(),
    title: { en: "Entity Tag", "zh-CN": "实体标签" },
    description: {
      en: "Object entity tag, or null when unavailable.",
      "zh-CN": "对象实体标签；不可用时为 null。",
    },
  },
  versionId: {
    type: z.string().nullable(),
    title: { en: "Version ID", "zh-CN": "版本 ID" },
    description: {
      en: "Object version identifier, or null when versioning is unavailable.",
      "zh-CN": "对象版本标识；未提供版本控制时为 null。",
    },
  },
});

const getObjectTextOutputSchema = defineOutputSchema({
  key: {
    type: z.string(),
    title: { en: "Object Key", "zh-CN": "对象 Key" },
    description: {
      en: "Key of the retrieved object.",
      "zh-CN": "读取对象的 key。",
    },
  },
  bucket: {
    type: z.string(),
    title: { en: "Bucket", "zh-CN": "存储桶" },
    description: {
      en: "Bucket that contains the retrieved object.",
      "zh-CN": "包含读取对象的存储桶。",
    },
  },
  text: {
    type: z.string(),
    title: { en: "Text Content", "zh-CN": "文本内容" },
    description: {
      en: "Object contents decoded as UTF-8 text.",
      "zh-CN": "以 UTF-8 文本解码的对象内容。",
    },
  },
  contentType: {
    type: z.string().nullable(),
    title: { en: "Content Type", "zh-CN": "内容类型" },
    description: {
      en: "Object content type, or null when unavailable.",
      "zh-CN": "对象内容类型；不可用时为 null。",
    },
  },
  size: {
    type: z.number(),
    title: { en: "Object Size", "zh-CN": "对象大小" },
    description: {
      en: "Object size in bytes.",
      "zh-CN": "对象大小，单位为字节。",
    },
  },
  lastModified: {
    type: z.string().nullable(),
    title: { en: "Last Modified", "zh-CN": "最后修改时间" },
    description: {
      en: "Object last-modified timestamp, or null when unavailable.",
      "zh-CN": "对象最后修改时间；不可用时为 null。",
    },
  },
  eTag: {
    type: z.string().nullable(),
    title: { en: "Entity Tag", "zh-CN": "实体标签" },
    description: {
      en: "Object entity tag, or null when unavailable.",
      "zh-CN": "对象实体标签；不可用时为 null。",
    },
  },
});

const createPresignedUrlOutputSchema = defineOutputSchema({
  key: {
    type: z.string(),
    title: { en: "Object Key", "zh-CN": "对象 Key" },
    description: {
      en: "Key of the object referenced by the URL.",
      "zh-CN": "URL 所指向对象的 key。",
    },
  },
  bucket: {
    type: z.string(),
    title: { en: "Bucket", "zh-CN": "存储桶" },
    description: {
      en: "Bucket that contains the object.",
      "zh-CN": "包含该对象的存储桶。",
    },
  },
  url: {
    type: z.string(),
    title: { en: "Presigned URL", "zh-CN": "预签名 URL" },
    description: {
      en: "Read-only, time-limited URL for accessing the object.",
      "zh-CN": "用于读取对象且具有时效限制的 URL。",
    },
  },
  expiresIn: {
    type: z.number(),
    title: { en: "Expiration (Seconds)", "zh-CN": "过期时间（秒）" },
    description: {
      en: "Presigned URL lifetime in seconds.",
      "zh-CN": "预签名 URL 的有效期，单位为秒。",
    },
  },
});

const listObjectsHandler = createToolHandler({
  inputSchema: defineInputSchema({
    prefix: {
      type: z.string().optional().nullable(),
      title: { en: "Object Prefix", "zh-CN": "对象前缀" },
      description: {
        en: "Optional object key prefix used to filter the list; it is normalized according to object-key rules.",
        "zh-CN": "用于筛选对象列表的可选 key 前缀；会按对象 key 规则归一化。",
      },
      isToolParam: true,
    },
    maxKeys: {
      type: z.number().int().min(1).max(1000).optional().default(100),
      title: { en: "Maximum Objects", "zh-CN": "返回数量" },
      description: {
        en: "Maximum number of objects to return, from 1 to 1000.",
        "zh-CN": "最多返回的对象数量，范围为 1–1000。",
      },
      isToolParam: true,
    },
  }),
  outputSchema: listObjectsOutputSchema,
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await listObjectsInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await listObjectsTool(parsedInput);
    return listObjectsOutputType.parseAsync(output);
  },
});

const uploadTextObjectHandler = createToolHandler({
  inputSchema: defineInputSchema({
    key: {
      type: z.string().min(1),
      title: { en: "Object Key", "zh-CN": "对象 Key" },
      description: {
        en: "Relative object key to upload. Empty keys, absolute paths, and keys containing a .. path segment are rejected.",
        "zh-CN":
          "要上传的相对对象 key；拒绝空 key、绝对路径以及包含 .. 路径段的 key。",
      },
      isToolParam: true,
    },
    text: {
      type: z.string(),
      title: { en: "Text Content", "zh-CN": "文本内容" },
      description: {
        en: "UTF-8 text content to upload.",
        "zh-CN": "要上传的 UTF-8 文本内容。",
      },
      isToolParam: true,
    },
    contentType: {
      type: z.string().optional().nullable(),
      title: { en: "Content Type", "zh-CN": "Content-Type" },
      description: {
        en: "Optional object content type; defaults to text/plain; charset=utf-8.",
        "zh-CN":
          "可选的对象 Content-Type；默认值为 text/plain; charset=utf-8。",
      },
      isToolParam: true,
    },
    maxTextSize: {
      type: maxTextSizeSchema,
      title: { en: "Maximum Text Size", "zh-CN": "最大文本大小" },
      description: {
        en: "Maximum text size in bytes; defaults to 1 MiB.",
        "zh-CN": "文本最大大小，单位为字节，默认 1 MiB。",
      },
      isToolParam: true,
    },
  }),
  outputSchema: uploadTextObjectOutputSchema,
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await uploadTextObjectInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await uploadTextObjectTool(parsedInput);
    return uploadTextObjectOutputType.parseAsync(output);
  },
});

const getObjectTextHandler = createToolHandler({
  inputSchema: defineInputSchema({
    key: {
      type: z.string().min(1),
      title: { en: "Object Key", "zh-CN": "对象 Key" },
      description: {
        en: "Relative object key to download as text. Empty keys, absolute paths, and keys containing a .. path segment are rejected.",
        "zh-CN":
          "要作为文本下载的相对对象 key；拒绝空 key、绝对路径以及包含 .. 路径段的 key。",
      },
      isToolParam: true,
    },
    maxTextSize: {
      type: maxTextSizeSchema,
      title: { en: "Maximum Text Size", "zh-CN": "最大文本大小" },
      description: {
        en: "Maximum text size in bytes; defaults to 1 MiB.",
        "zh-CN": "文本最大大小，单位为字节，默认 1 MiB。",
      },
      isToolParam: true,
    },
  }),
  outputSchema: getObjectTextOutputSchema,
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await getObjectTextInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await getObjectTextTool(parsedInput);
    return getObjectTextOutputType.parseAsync(output);
  },
});

const createPresignedUrlHandler = createToolHandler({
  inputSchema: defineInputSchema({
    key: {
      type: z.string().min(1),
      title: { en: "Object Key", "zh-CN": "对象 Key" },
      description: {
        en: "Relative object key for which to create a read-only presigned URL.",
        "zh-CN": "要创建只读预签名 URL 的相对对象 key。",
      },
      isToolParam: true,
    },
    expiresIn: {
      type: z.number().int().positive().optional().default(900),
      title: { en: "Expiration (Seconds)", "zh-CN": "过期时间（秒）" },
      description: {
        en: "Presigned URL lifetime in seconds; the maximum is 604800 seconds.",
        "zh-CN": "预签名 URL 有效期，单位为秒，最长为 604800 秒。",
      },
      isToolParam: true,
    },
  }),
  outputSchema: createPresignedUrlOutputSchema,
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await createPresignedUrlInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await createPresignedUrlTool(parsedInput);
    return createPresignedUrlOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "objectStorage",
    name: {
      en: "Object Storage",
      "zh-CN": "对象存储",
    },
    description: {
      en: "Safely list objects, upload and read text, and create read-only presigned URLs for S3-compatible storage. Unsafe object keys are rejected and text size limits are enforced.",
      "zh-CN":
        "安全地列出对象、上传和读取文本，并为 S3 兼容存储创建只读预签名 URL；拒绝不安全的对象 key 并强制执行文本大小限制。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial release",
      "zh-CN": "初始版本",
    },
    tutorialUrl: "https://docs.aws.amazon.com/AmazonS3/latest/API/Welcome.html",
    author: "FastGPT Team",
    tags: ["tools"],
  },
  secretSchema,
  children: [
    {
      id: "listObjects",
      name: {
        en: "List Objects",
        "zh-CN": "列出对象",
      },
      description: {
        en: "List objects from the configured S3-compatible bucket using an optional key prefix.",
        "zh-CN": "使用可选 key 前缀列出已配置 S3 兼容存储桶中的对象。",
      },
      handler: listObjectsHandler,
    },
    {
      id: "uploadTextObject",
      name: {
        en: "Upload Text Object",
        "zh-CN": "上传文本对象",
      },
      description: {
        en: "Upload UTF-8 text content to a safe relative object key.",
        "zh-CN": "将 UTF-8 文本内容上传到安全的相对对象 key。",
      },
      handler: uploadTextObjectHandler,
    },
    {
      id: "getObjectText",
      name: {
        en: "Get Object Text",
        "zh-CN": "读取文本对象",
      },
      description: {
        en: "Download an object as UTF-8 text with a configurable maximum size.",
        "zh-CN": "以 UTF-8 文本形式下载对象，并可配置最大文本大小。",
      },
      handler: getObjectTextHandler,
    },
    {
      id: "createPresignedUrl",
      name: {
        en: "Create Presigned URL",
        "zh-CN": "创建预签名 URL",
      },
      description: {
        en: "Create a time-limited, read-only presigned URL for an object.",
        "zh-CN": "为对象创建具有时效限制的只读预签名 URL。",
      },
      handler: createPresignedUrlHandler,
    },
  ],
});

export default toolSet;

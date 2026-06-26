import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
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
  endpoint: z.string().url().meta({
    title: "Endpoint",
    description:
      "S3/OSS 兼容服务地址，例如 https://s3.amazonaws.com 或 https://oss-cn-hangzhou.aliyuncs.com",
    toolDescription: "S3-compatible endpoint URL.",
    isSecret: false,
  }),
  region: z.string().min(1).meta({
    title: "Region",
    description: "对象存储区域，例如 us-east-1 或 oss-cn-hangzhou",
    toolDescription: "Object storage region.",
    isSecret: false,
  }),
  accessKeyId: z.string().min(1).meta({
    title: "Access Key ID",
    description: "对象存储访问密钥 ID",
    toolDescription: "Object storage access key ID.",
    isSecret: true,
  }),
  secretAccessKey: z.string().min(1).meta({
    title: "Secret Access Key",
    description: "对象存储访问密钥 Secret",
    toolDescription: "Object storage secret access key.",
    isSecret: true,
  }),
  bucket: z.string().min(1).meta({
    title: "Bucket",
    description: "默认访问的 bucket 名称",
    toolDescription: "Default bucket name.",
    isSecret: false,
  }),
  forcePathStyle: z.boolean().optional().meta({
    title: "Force Path Style",
    description: "兼容 MinIO 等 path-style endpoint 时开启",
    toolDescription:
      "Enable path-style addressing for MinIO and compatible services.",
    isSecret: false,
  }),
});

const maxTextSizeSchema = z
  .number()
  .int()
  .positive()
  .optional()
  .default(1048576)
  .meta({
    title: "最大文本大小",
    description: "上传或下载文本的最大字节数，默认 1 MiB",
    toolDescription: "Maximum text size in bytes. Defaults to 1 MiB.",
  });

const listObjectsHandler = createToolHandler({
  inputSchema: z.object({
    prefix: z.string().optional().nullable().meta({
      title: "对象前缀",
      description: "只列出指定前缀下的对象。会按对象 key 规则归一化",
      toolDescription:
        "Optional object key prefix used to filter listed objects.",
    }),
    maxKeys: z.number().int().min(1).max(1000).optional().default(100).meta({
      title: "返回数量",
      description: "最多返回的对象数量，范围 1-1000",
      toolDescription: "Maximum number of objects to return, from 1 to 1000.",
    }),
  }),
  outputSchema: listObjectsOutputType,
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await listObjectsInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await listObjectsTool(parsedInput, ctx);
    return listObjectsOutputType.parseAsync(output);
  },
});

const uploadTextObjectHandler = createToolHandler({
  inputSchema: z.object({
    key: z.string().min(1).meta({
      title: "对象 Key",
      description: "对象存储 key。禁止空 key、绝对路径和 .. 路径段",
      toolDescription:
        "Relative object key to upload. Empty, absolute, and parent-directory-like keys are rejected.",
    }),
    text: z.string().meta({
      title: "文本内容",
      description: "要上传的 UTF-8 文本内容",
      toolDescription: "UTF-8 text content to upload.",
    }),
    contentType: z.string().optional().nullable().meta({
      title: "Content-Type",
      description: "对象 Content-Type，默认 text/plain; charset=utf-8",
      toolDescription: "Optional object content type.",
    }),
    maxTextSize: maxTextSizeSchema,
  }),
  outputSchema: uploadTextObjectOutputType,
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await uploadTextObjectInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await uploadTextObjectTool(parsedInput, ctx);
    return uploadTextObjectOutputType.parseAsync(output);
  },
});

const getObjectTextHandler = createToolHandler({
  inputSchema: z.object({
    key: z.string().min(1).meta({
      title: "对象 Key",
      description: "对象存储 key。禁止空 key、绝对路径和 .. 路径段",
      toolDescription:
        "Relative object key to download as text. Empty, absolute, and parent-directory-like keys are rejected.",
    }),
    maxTextSize: maxTextSizeSchema,
  }),
  outputSchema: getObjectTextOutputType,
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await getObjectTextInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await getObjectTextTool(parsedInput, ctx);
    return getObjectTextOutputType.parseAsync(output);
  },
});

const createPresignedUrlHandler = createToolHandler({
  inputSchema: z.object({
    key: z.string().min(1).meta({
      title: "对象 Key",
      description: "对象存储 key。禁止空 key、绝对路径和 .. 路径段",
      toolDescription:
        "Relative object key to create a read-only presigned URL for.",
    }),
    expiresIn: z.number().int().positive().optional().default(900).meta({
      title: "过期时间",
      description: "预签名 URL 有效期，单位秒。最大 604800 秒",
      toolDescription:
        "Presigned URL expiration in seconds. Maximum is 604800.",
    }),
  }),
  outputSchema: createPresignedUrlOutputType,
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await createPresignedUrlInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await createPresignedUrlTool(parsedInput, ctx);
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
      en: "Operate S3-compatible object storage with safe text upload, text download, object listing and read-only presigned URLs.",
      "zh-CN":
        "操作 S3 兼容对象存储，支持安全文本上传、文本下载、对象列举和只读预签名 URL。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
    },
    toolDescription:
      "A safe S3-compatible object storage toolset. Use it to list objects, upload text content, read text objects, and create read-only presigned URLs. It rejects unsafe object keys and enforces text size limits.",
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
        en: "List objects in the configured bucket by prefix",
        "zh-CN": "按前缀列出配置 bucket 中的对象",
      },
      toolDescription:
        "List objects from the configured S3-compatible bucket by optional prefix.",
      handler: listObjectsHandler,
    },
    {
      id: "uploadTextObject",
      name: {
        en: "Upload Text Object",
        "zh-CN": "上传文本对象",
      },
      description: {
        en: "Upload UTF-8 text content to an object key",
        "zh-CN": "将 UTF-8 文本内容上传到对象 key",
      },
      toolDescription:
        "Upload UTF-8 text content to a safe relative object key.",
      handler: uploadTextObjectHandler,
    },
    {
      id: "getObjectText",
      name: {
        en: "Get Object Text",
        "zh-CN": "读取文本对象",
      },
      description: {
        en: "Read an object as UTF-8 text with a size limit",
        "zh-CN": "按大小限制读取对象文本",
      },
      toolDescription:
        "Download an object as UTF-8 text with a configurable maximum size.",
      handler: getObjectTextHandler,
    },
    {
      id: "createPresignedUrl",
      name: {
        en: "Create Presigned URL",
        "zh-CN": "创建预签名 URL",
      },
      description: {
        en: "Create a read-only presigned URL for an object",
        "zh-CN": "为对象创建只读预签名 URL",
      },
      toolDescription:
        "Create a time-limited read-only presigned URL for an object.",
      handler: createPresignedUrlHandler,
    },
  ],
});

export default toolSet;

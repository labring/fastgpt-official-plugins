import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as getAuthTokenInputType,
  OutputType as getAuthTokenOutputType,
  tool as getAuthTokenTool,
} from "./children/getAuthToken";
import {
  InputType as getDraftListInputType,
  OutputType as getDraftListOutputType,
  tool as getDraftListTool,
} from "./children/getDraftList";
import {
  InputType as publishDraftInputType,
  OutputType as publishDraftOutputType,
  tool as publishDraftTool,
} from "./children/publishDraft";
import {
  InputType as uploadMarkdownToDraftInputType,
  OutputType as uploadMarkdownToDraftOutputType,
  tool as uploadMarkdownToDraftTool,
} from "./children/uploadMarkdownToDraft";
import {
  InputType as uploadPermanentMaterialInputType,
  OutputType as uploadPermanentMaterialOutputType,
  tool as uploadPermanentMaterialTool,
} from "./children/uploadPermanentMaterial";

const secretSchema = z.object({
  appId: z
    .string()
    .optional()
    .meta({
      title: "AppID",
      description: "微信公众号开发者 ID（AppID）",
      "x-i18n": {
        title: { en: "App ID", "zh-CN": "AppID" },
        description: {
          en: "WeChat Official Account developer ID (AppID).",
          "zh-CN": "微信公众号开发者 ID（AppID）。",
        },
      },
      isSecret: false,
    }),
  secret: z
    .string()
    .optional()
    .meta({
      title: "AppSecret",
      description: "微信公众号开发者密钥（AppSecret）",
      "x-i18n": {
        title: { en: "App secret", "zh-CN": "AppSecret" },
        description: {
          en: "WeChat Official Account developer secret (AppSecret).",
          "zh-CN": "微信公众号开发者密钥（AppSecret）。",
        },
      },
      isSecret: true,
    }),
});
const getAuthTokenSecretSchema = z.object({});
const getAuthTokenInputSchema = defineInputSchema({});
const getAuthTokenOutputSchema = defineOutputSchema({
  access_token: {
    type: z.string(),
    title: { en: "Access token", "zh-CN": "访问令牌" },
    description: {
      en: "WeChat Official Account API access token.",
      "zh-CN": "微信公众号 API 访问令牌。",
    },
  },
  expires_in: {
    type: z.number(),
    title: { en: "Expiration time (seconds)", "zh-CN": "过期时间（秒）" },
    description: {
      en: "Number of seconds until the WeChat Official Account API access token expires.",
      "zh-CN": "微信公众号 API 访问令牌过期前的剩余秒数。",
    },
  },
});
const getAuthTokenHandler = createToolHandler({
  inputSchema: getAuthTokenInputSchema,
  outputSchema: getAuthTokenOutputSchema,
  secretSchema: getAuthTokenSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await getAuthTokenInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await getAuthTokenTool(parsedInput);
    return getAuthTokenOutputType.parseAsync(output);
  },
});

const getDraftListSecretSchema = z.object({});
const getDraftListInputSchema = defineInputSchema({
  accessToken: {
    type: z.string().optional(),
    title: { en: "Access token", "zh-CN": "访问令牌" },
    description: {
      en: "Optional WeChat Official Account API token; use this or provide an App ID and secret.",
      "zh-CN":
        "可选的微信公众号 API 访问令牌；使用此令牌或提供 AppID 和 AppSecret。",
    },
    isToolParam: false,
  },
  appId: {
    type: z.string().optional(),
    title: { en: "App ID", "zh-CN": "AppID" },
    description: {
      en: "WeChat Official Account App ID used with the secret, or use an access token instead.",
      "zh-CN": "微信公众号 AppID，与 AppSecret 配合使用；也可改用访问令牌。",
    },
    isToolParam: false,
  },
  secret: {
    type: z.string().optional(),
    title: { en: "App secret", "zh-CN": "AppSecret" },
    description: {
      en: "WeChat Official Account AppSecret used with the App ID, or use an access token instead.",
      "zh-CN": "微信公众号 AppSecret，与 AppID 配合使用；也可改用访问令牌。",
    },
    isToolParam: false,
  },
  offset: {
    type: z.number().optional(),
    title: { en: "Offset", "zh-CN": "偏移量" },
    description: {
      en: "Pagination offset from the full material list; 0 starts at the first item and is the default.",
      "zh-CN": "全部素材列表的分页偏移量；0 表示从第一项开始，也是默认值。",
    },
    isToolParam: true,
  },
  count: {
    type: z.number().optional(),
    title: { en: "Item count", "zh-CN": "返回数量" },
    description: {
      en: "Number of items to return, from 1 to 20; defaults to 20.",
      "zh-CN": "返回素材数量，范围为 1 到 20，默认为 20。",
    },
    isToolParam: true,
  },
  noContent: {
    type: z.number().optional(),
    title: { en: "Omit article content", "zh-CN": "不返回内容" },
    description: {
      en: "Set to 1 to omit article content or 0 to include it; defaults to 0.",
      "zh-CN": "设为 1 表示不返回文章内容，设为 0 表示返回；默认为 0。",
    },
    isToolParam: true,
  },
});
const getDraftListOutputSchema = defineOutputSchema({
  total_count: {
    type: z.number().optional(),
    title: { en: "Total draft count", "zh-CN": "草稿总数" },
    description: {
      en: "Total number of drafts in the draft box.",
      "zh-CN": "草稿箱中的草稿总数量。",
    },
  },
  item_count: {
    type: z.number().optional(),
    title: { en: "Returned item count", "zh-CN": "本次返回数量" },
    description: {
      en: "Number of drafts returned in this response.",
      "zh-CN": "本次响应返回的草稿数量。",
    },
  },
  item: {
    type: z.array(z.any()).optional(),
    title: { en: "Draft list", "zh-CN": "草稿列表" },
    description: {
      en: "Draft article information, including media IDs and article details.",
      "zh-CN": "草稿文章信息，包括 media_id 和文章详情。",
    },
  },
  error_message: {
    type: z.string().optional(),
    title: { en: "Error message", "zh-CN": "错误信息" },
    description: {
      en: "Error details from processing the request, if any.",
      "zh-CN": "请求处理过程中产生的错误信息（如有）。",
    },
  },
});
const getDraftListHandler = createToolHandler({
  inputSchema: getDraftListInputSchema,
  outputSchema: getDraftListOutputSchema,
  secretSchema: getDraftListSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await getDraftListInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await getDraftListTool(parsedInput);
    return getDraftListOutputType.parseAsync(output);
  },
});

const publishDraftSecretSchema = z.object({});
const publishDraftInputSchema = defineInputSchema({
  accessToken: {
    type: z.string().optional(),
    title: { en: "Access token", "zh-CN": "访问令牌" },
    description: {
      en: "Optional WeChat Official Account API token; use this or provide an App ID and secret.",
      "zh-CN":
        "可选的微信公众号 API 访问令牌；使用此令牌或提供 AppID 和 AppSecret。",
    },
    isToolParam: false,
  },
  mediaId: {
    type: z.string(),
    title: { en: "Draft media ID", "zh-CN": "草稿媒体 ID" },
    description: {
      en: "Draft media_id to publish, obtained when creating a draft or listing drafts.",
      "zh-CN":
        "要发布的草稿 media_id，可从创建草稿或获取草稿列表的结果中取得。",
    },
    isToolParam: true,
  },
});
const publishDraftOutputSchema = defineOutputSchema({
  publishId: {
    type: z.string().optional(),
    title: { en: "Publication task ID", "zh-CN": "发布任务 ID" },
    description: {
      en: "Publication task ID that can be used to query publishing status.",
      "zh-CN": "用于查询发布状态的发布任务 ID。",
    },
  },
  msgDataId: {
    type: z.string().optional(),
    title: { en: "Message data ID", "zh-CN": "消息数据 ID" },
    description: {
      en: "Identifier of the published message.",
      "zh-CN": "用于标识已发布消息的 ID。",
    },
  },
});
const publishDraftHandler = createToolHandler({
  inputSchema: publishDraftInputSchema,
  outputSchema: publishDraftOutputSchema,
  secretSchema: publishDraftSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await publishDraftInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await publishDraftTool(parsedInput);
    return publishDraftOutputType.parseAsync(output);
  },
});

const uploadMarkdownToDraftSecretSchema = z.object({});
const uploadMarkdownToDraftInputSchema = defineInputSchema({
  accessToken: {
    type: z.string().optional(),
    title: { en: "Access token", "zh-CN": "访问令牌" },
    description: {
      en: "Optional WeChat Official Account API token; use this or provide an App ID and secret.",
      "zh-CN":
        "可选的微信公众号 API 访问令牌；使用此令牌或提供 AppID 和 AppSecret。",
    },
    isToolParam: false,
  },
  markdownContent: {
    type: z.string(),
    title: { en: "Markdown content", "zh-CN": "Markdown 内容" },
    description: {
      en: "Markdown article content, or an array of Markdown documents to upload as articles.",
      "zh-CN":
        "要转换的 Markdown 格式文章内容，支持单个字符串或字符串数组（多篇文档）。",
    },
    isToolParam: true,
  },
  coverImage: {
    type: z.string(),
    title: { en: "Cover image", "zh-CN": "封面图" },
    description: {
      en: "Cover image URL or media ID; URLs are uploaded as permanent material. Accepts one value or an array for multiple articles.",
      "zh-CN":
        "封面图片 URL 或 media_id；URL 会自动上传为永久素材。支持单个值或为多篇文章提供数组。",
    },
    isToolParam: true,
  },
  title: {
    type: z.string(),
    title: { en: "Article title", "zh-CN": "文章标题" },
    description: {
      en: "Title of the article or an array of article titles; extracted from Markdown when omitted.",
      "zh-CN":
        "图文消息的标题，支持单个字符串或字符串数组；未填写时将尝试从 Markdown 中提取。",
    },
    isToolParam: true,
  },
  author: {
    type: z.string().optional(),
    title: { en: "Author", "zh-CN": "作者" },
    description: {
      en: "Author name or an array of author names.",
      "zh-CN": "文章作者信息，支持单个字符串或字符串数组。",
    },
    isToolParam: true,
  },
  digest: {
    type: z.string().optional(),
    title: { en: "Article summary", "zh-CN": "文章摘要" },
    description: {
      en: "Optional summary under 120 characters per article; extracted from the content when omitted. Accepts one value or an array.",
      "zh-CN":
        "文章摘要，每篇不超过 120 个字符；未填写时将从内容中提取。支持单个字符串或字符串数组。",
    },
    isToolParam: true,
  },
  contentSourceUrl: {
    type: z.string().optional(),
    title: { en: "Original article URL", "zh-CN": "原文链接" },
    description: {
      en: "Original article URL or an array of URLs.",
      "zh-CN": "原文阅读链接地址，支持单个字符串或字符串数组。",
    },
    isToolParam: true,
  },
  needOpenComment: {
    type: z.number().optional(),
    title: { en: "Enable comments", "zh-CN": "开启评论" },
    description: {
      en: "Set to 0 to disable comments or 1 to enable them; accepts one number or an array of numbers.",
      "zh-CN":
        "是否开启评论功能，0 表示关闭，1 表示开启；支持单个数字或数字数组。",
    },
    isToolParam: true,
  },
  onlyFansCanComment: {
    type: z.number().optional(),
    title: { en: "Comments from followers only", "zh-CN": "仅粉丝评论" },
    description: {
      en: "Set to 0 to allow everyone to comment or 1 to allow followers only; accepts one number or an array of numbers.",
      "zh-CN":
        "是否仅允许粉丝评论，0 表示所有人可评论，1 表示仅粉丝可评论；支持单个数字或数字数组。",
    },
    isToolParam: true,
  },
});
const uploadMarkdownToDraftOutputSchema = defineOutputSchema({
  media_id: {
    type: z.string().optional(),
    title: { en: "Media ID", "zh-CN": "素材 ID" },
    description: {
      en: "Media ID of the article in the draft box.",
      "zh-CN": "草稿箱中图文消息的媒体标识符。",
    },
  },
  error_message: {
    type: z.string().optional(),
    title: { en: "Error message", "zh-CN": "错误信息" },
    description: {
      en: "Error details from processing the request, if any.",
      "zh-CN": "请求处理过程中产生的错误信息（如有）。",
    },
  },
});
const uploadMarkdownToDraftHandler = createToolHandler({
  inputSchema: uploadMarkdownToDraftInputSchema,
  outputSchema: uploadMarkdownToDraftOutputSchema,
  secretSchema: uploadMarkdownToDraftSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await uploadMarkdownToDraftInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await uploadMarkdownToDraftTool(parsedInput);
    return uploadMarkdownToDraftOutputType.parseAsync(output);
  },
});

const uploadPermanentMaterialSecretSchema = z.object({});
const uploadPermanentMaterialInputSchema = defineInputSchema({
  type: {
    type: z.enum(["image", "voice", "video"]),
    title: { en: "Material type", "zh-CN": "素材类型" },
    description: {
      en: "Type of material to upload: image, voice, or video.",
      "zh-CN":
        "要上传的素材类型：image（图片）、voice（语音）或 video（视频）。",
    },
    isToolParam: true,
  },
  mediaUrl: {
    type: z.string(),
    title: { en: "Media file URL", "zh-CN": "媒体文件 URL" },
    description: {
      en: "URL of the media file to upload.",
      "zh-CN": "要上传的媒体文件 URL。",
    },
    isToolParam: true,
  },
  title: {
    type: z.string().optional(),
    title: { en: "Material title", "zh-CN": "素材标题" },
    description: {
      en: "Title of the material; required for video uploads.",
      "zh-CN": "素材标题，上传视频素材时必填。",
    },
    isToolParam: true,
  },
  introduction: {
    type: z.string().optional(),
    title: { en: "Material introduction", "zh-CN": "素材简介" },
    description: {
      en: "Introduction for the material; required for video uploads.",
      "zh-CN": "素材简介，上传视频素材时必填。",
    },
    isToolParam: true,
  },
  accessToken: {
    type: z.string().optional(),
    title: { en: "Access token", "zh-CN": "访问令牌" },
    description: {
      en: "Optional WeChat Official Account API token; use this or provide an App ID and secret.",
      "zh-CN":
        "可选的微信公众号 API 访问令牌；使用此令牌或提供 AppID 和 AppSecret。",
    },
    isToolParam: false,
  },
});
const uploadPermanentMaterialOutputSchema = defineOutputSchema({
  media_id: {
    type: z.string().optional(),
    title: { en: "Media ID", "zh-CN": "媒体 ID" },
    description: {
      en: "Media file ID returned after a successful upload.",
      "zh-CN": "上传成功后返回的媒体文件 ID。",
    },
  },
  url: {
    type: z.string().optional(),
    title: { en: "File URL", "zh-CN": "文件 URL" },
    description: {
      en: "URL returned for an image material.",
      "zh-CN": "图片素材返回的 URL 地址。",
    },
  },
  success: {
    type: z.boolean(),
    title: { en: "Upload status", "zh-CN": "上传状态" },
    description: {
      en: "Whether the upload succeeded.",
      "zh-CN": "素材是否上传成功。",
    },
  },
  message: {
    type: z.string().optional(),
    title: { en: "Response message", "zh-CN": "响应消息" },
    description: {
      en: "Description of the operation result.",
      "zh-CN": "操作结果说明。",
    },
  },
  error_message: {
    type: z.string().optional(),
    title: { en: "Error message", "zh-CN": "错误信息" },
    description: {
      en: "Error details from processing the request, if any.",
      "zh-CN": "请求处理过程中产生的错误信息（如有）。",
    },
  },
});
const uploadPermanentMaterialHandler = createToolHandler({
  inputSchema: uploadPermanentMaterialInputSchema,
  outputSchema: uploadPermanentMaterialOutputSchema,
  secretSchema: uploadPermanentMaterialSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await uploadPermanentMaterialInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await uploadPermanentMaterialTool(parsedInput);
    return uploadPermanentMaterialOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "wechatOfficialAccount",
    name: {
      en: "WeChat Official Account Tool Set",
      "zh-CN": "微信公众号工具集",
    },
    description: {
      en: "WeChat Official Account API tools for managing permanent materials, drafts, and article publishing.",
      "zh-CN": "用于管理微信公众号永久素材、草稿和文章发布的 API 工具集。",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "初始版本",
    },
    tags: ["social"],
  },
  secretSchema,
  children: [
    {
      id: "getAuthToken",
      name: {
        en: "Get WeChat Official Account Auth Token",
        "zh-CN": "获取微信公众号鉴权信息",
      },
      description: {
        en: "Get a WeChat Official Account access token using an App ID and AppSecret for API authentication. The token is valid for 7200 seconds and should be refreshed before it expires.",
        "zh-CN":
          "使用 AppID 和 AppSecret 获取微信公众号 access_token，用于后续 API 调用认证。令牌有效期为 7200 秒，请在过期前重新获取。",
      },
      handler: getAuthTokenHandler,
    },
    {
      id: "getDraftList",
      name: {
        en: "Get Draft List",
        "zh-CN": "获取草稿箱文章列表",
      },
      description: {
        en: "Get paginated drafts from the WeChat Official Account draft box, including article details and an option to omit full content.",
        "zh-CN":
          "分页获取微信公众号草稿箱中的文章，可设置偏移量、每页数量和是否返回完整文章内容；结果包含标题、作者、摘要、封面图等信息。",
      },
      handler: getDraftListHandler,
    },
    {
      id: "publishDraft",
      name: {
        en: "Publish WeChat Official Account Draft",
        "zh-CN": "发布微信公众号草稿",
      },
      description: {
        en: "Publish a draft to the WeChat Official Account using an access token or App ID and AppSecret. Returns publication IDs for status queries.",
        "zh-CN":
          "使用 access_token 或 AppID / AppSecret 将草稿发布到微信公众号。成功后返回 publish_id 和 msg_data_id，可用于查询发布状态。",
      },
      handler: publishDraftHandler,
    },
    {
      id: "uploadMarkdownToDraft",
      name: {
        en: "Upload Markdown to Draft",
        "zh-CN": "上传 Markdown 到草稿箱",
      },
      description: {
        en: "Convert Markdown content to WeChat Official Account articles, upload images and cover images, and save the drafts with optional title, author, and summary metadata.",
        "zh-CN":
          "将 Markdown 内容转换为微信公众号图文消息，自动处理图片及封面图上传后保存为草稿，并支持自定义标题、作者和摘要。",
      },
      handler: uploadMarkdownToDraftHandler,
    },
    {
      id: "uploadPermanentMaterial",
      name: {
        en: "Upload Permanent Material",
        "zh-CN": "上传永久素材",
      },
      description: {
        en: "Upload permanent image, voice, or video materials to WeChat Official Account. Supports file paths, base64 data, and URLs; uploaded materials remain available for future articles and broadcasts.",
        "zh-CN":
          "上传永久素材到微信公众号素材库，支持图片、语音、视频及缩略图，并支持文件路径、Base64 和 URL。素材会永久保存，可用于后续图文消息和群发消息。",
      },
      handler: uploadPermanentMaterialHandler,
    },
  ],
});

export default toolSet;

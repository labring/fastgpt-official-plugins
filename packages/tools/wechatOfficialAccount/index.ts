import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
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
  "appId": z.string().optional().meta({
    title: "AppID",
    description: "微信公众号开发者ID(AppID)"
  }),
  "secret": z.string().optional().meta({
    title: "AppSecret",
    description: "微信公众号开发者密钥(AppSecret)"
  })
});
const getAuthTokenSecretSchema = z.object({});
const getAuthTokenInputSchema = z.object({});
const getAuthTokenOutputSchema = z.object({
  "access_token": z.string().meta({
    title: "AccessToken",
    description: "微信公众号 API 访问令牌"
  }),
  "expires_in": z.number().meta({
    title: "ExpiresIn",
    description: "微信公众号 API 访问令牌过期时间（秒）"
  })
});
const getAuthTokenHandler = createToolHandler({
  inputSchema: getAuthTokenInputSchema,
  outputSchema: getAuthTokenOutputSchema,
  secretSchema: getAuthTokenSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await getAuthTokenInputType.parseAsync(input);
    const output = await getAuthTokenTool(parsedInput, ctx);
    return getAuthTokenOutputType.parseAsync(output);
  },
});

const getDraftListSecretSchema = z.object({});
const getDraftListInputSchema = z.object({
  "accessToken": z.string().optional().meta({
    title: "访问令牌",
    description: "微信公众号 API 访问令牌（可选，与 appId/secret 二选一）"
  }),
  "appId": z.string().optional().meta({
    title: "AppID",
    description: "微信公众号 AppID（与 secret 配合使用，或使用 accessToken）"
  }),
  "secret": z.string().optional().meta({
    title: "AppSecret",
    description: "微信公众号 AppSecret（与 appId 配合使用，或使用 accessToken）"
  }),
  "offset": z.number().optional().meta({
    title: "偏移量",
    description: "从全部素材的该偏移位置开始返回，0 表示从第一个素材返回，默认为 0",
    toolDescription: "offset for pagination, 0 means start from the first item"
  }),
  "count": z.number().optional().meta({
    title: "返回数量",
    description: "返回素材的数量，取值范围在 1 到 20 之间，默认为 20",
    toolDescription: "number of items to return, between 1 and 20"
  }),
  "noContent": z.number().optional().meta({
    title: "不返回内容",
    description: "是否不返回文章内容字段，1 表示不返回，0 表示返回，默认为 0",
    toolDescription: "1 means no content field returned, 0 means content field returned"
  })
});
const getDraftListOutputSchema = z.object({
  "total_count": z.number().optional().meta({
    title: "草稿总数",
    description: "草稿箱中的草稿总数量"
  }),
  "item_count": z.number().optional().meta({
    title: "本次返回数量",
    description: "本次返回的草稿数量"
  }),
  "item": z.record(z.string(), z.unknown()).optional().meta({
    title: "草稿列表",
    description: "草稿文章列表数组，每个元素包含 media_id 和文章信息"
  }),
  "error_message": z.string().optional().meta({
    title: "错误信息",
    description: "处理过程中的错误信息"
  })
});
const getDraftListHandler = createToolHandler({
  inputSchema: getDraftListInputSchema,
  outputSchema: getDraftListOutputSchema,
  secretSchema: getDraftListSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await getDraftListInputType.parseAsync(input);
    const output = await getDraftListTool(parsedInput, ctx);
    return getDraftListOutputType.parseAsync(output);
  },
});

const publishDraftSecretSchema = z.object({});
const publishDraftInputSchema = z.object({
  "accessToken": z.string().optional().meta({
    title: "访问令牌",
    description: "微信公众号 API 访问令牌（可选，与 appId/appSecret 二选一）"
  }),
  "mediaId": z.string().meta({
    title: "草稿媒体ID",
    description: "要发布的草稿media_id（从创建草稿或获取草稿列表中获得）",
    toolDescription: "Draft media_id to be published"
  })
});
const publishDraftOutputSchema = z.object({
  "publishId": z.string().optional().meta({
    title: "发布任务ID",
    description: "发布任务ID，可用于查询发布状态"
  }),
  "msgDataId": z.string().optional().meta({
    title: "消息数据ID",
    description: "消息数据ID，用于标识发布的消息"
  })
});
const publishDraftHandler = createToolHandler({
  inputSchema: publishDraftInputSchema,
  outputSchema: publishDraftOutputSchema,
  secretSchema: publishDraftSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await publishDraftInputType.parseAsync(input);
    const output = await publishDraftTool(parsedInput, ctx);
    return publishDraftOutputType.parseAsync(output);
  },
});

const uploadMarkdownToDraftSecretSchema = z.object({});
const uploadMarkdownToDraftInputSchema = z.object({
  "accessToken": z.string().optional().meta({
    title: "访问令牌",
    description: "微信公众号 API 访问令牌（可选，与 appId/appSecret 二选一）"
  }),
  "markdownContent": z.string().meta({
    title: "Markdown 内容",
    description: "要转换的 Markdown 格式文章内容，支持单个字符串或字符串数组（多篇文档）",
    toolDescription: "markdown format content or array of markdown contents"
  }),
  "coverImage": z.string().meta({
    title: "封面图",
    description: "封面图片 URL 或 media_id，如果是 URL 将自动上传为永久素材。支持单个字符串或字符串数组（多篇文档对应多个封面图）",
    toolDescription: "cover image url or media_id or array of cover images"
  }),
  "title": z.string().meta({
    title: "文章标题",
    description: "图文消息的标题，支持单个字符串或字符串数组。如果不填写将尝试从 Markdown 中提取",
    toolDescription: "article title or array of article titles"
  }),
  "author": z.string().optional().meta({
    title: "作者",
    description: "文章作者信息，支持单个字符串或字符串数组",
    toolDescription: "article author or array of authors"
  }),
  "digest": z.string().optional().meta({
    title: "文章摘要",
    description: "文章摘要信息，如果不填写将自动从内容中提取。支持单个字符串或字符串数组",
    toolDescription: "article digest or array of digests, optional, less than 120 characters each"
  }),
  "contentSourceUrl": z.string().optional().meta({
    title: "原文链接",
    description: "原文阅读链接地址，支持单个字符串或字符串数组",
    toolDescription: "original article link or array of links"
  }),
  "needOpenComment": z.number().optional().meta({
    title: "开启评论",
    description: "是否开启评论功能，0 表示关闭，1 表示开启。支持单个数字或数字数组"
  }),
  "onlyFansCanComment": z.number().optional().meta({
    title: "仅粉丝评论",
    description: "是否仅允许粉丝评论，0 表示所有人可评论，1 表示仅粉丝可评论。支持单个数字或数字数组"
  })
});
const uploadMarkdownToDraftOutputSchema = z.object({
  "media_id": z.string().optional().meta({
    title: "素材ID",
    description: "草稿箱中图文消息的媒体标识符"
  }),
  "error_message": z.string().optional().meta({
    title: "错误信息",
    description: "处理过程中的错误信息"
  })
});
const uploadMarkdownToDraftHandler = createToolHandler({
  inputSchema: uploadMarkdownToDraftInputSchema,
  outputSchema: uploadMarkdownToDraftOutputSchema,
  secretSchema: uploadMarkdownToDraftSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await uploadMarkdownToDraftInputType.parseAsync(input);
    const output = await uploadMarkdownToDraftTool(parsedInput, ctx);
    return uploadMarkdownToDraftOutputType.parseAsync(output);
  },
});

const uploadPermanentMaterialSecretSchema = z.object({});
const uploadPermanentMaterialInputSchema = z.object({
  "type": z.enum(["image","voice","video"]).meta({
    title: "素材类型",
    description: "要上传的素材类型",
    toolDescription: "Material type to upload"
  }),
  "mediaUrl": z.string().meta({
    title: "媒体文件 URL",
    description: "媒体文件的 URL 地址",
    toolDescription: "Media file content (Base64, file path or URL)"
  }),
  "title": z.string().optional().meta({
    title: "素材标题",
    description: "素材标题，视频素材必填",
    toolDescription: "Material title (required for video)"
  }),
  "introduction": z.string().optional().meta({
    title: "素材简介",
    description: "素材简介，视频素材必填",
    toolDescription: "Material introduction (required for video)"
  }),
  "accessToken": z.string().optional().meta({
    title: "访问令牌",
    description: "微信公众号访问令牌（可选，与 appId/appSecret 二选一）",
    toolDescription: "WeChat API access token (optional, alternative to appId/appSecret)"
  })
});
const uploadPermanentMaterialOutputSchema = z.object({
  "media_id": z.string().optional().meta({
    title: "媒体 ID",
    description: "上传成功后返回的媒体文件 ID"
  }),
  "url": z.string().optional().meta({
    title: "文件 URL",
    description: "图片素材返回的 URL 地址"
  }),
  "success": z.boolean().meta({
    title: "上传状态",
    description: "是否上传成功"
  }),
  "message": z.string().optional().meta({
    title: "响应消息",
    description: "操作结果说明"
  }),
  "error_message": z.string().optional().meta({
    title: "错误信息",
    description: "处理过程中的错误信息"
  })
});
const uploadPermanentMaterialHandler = createToolHandler({
  inputSchema: uploadPermanentMaterialInputSchema,
  outputSchema: uploadPermanentMaterialOutputSchema,
  secretSchema: uploadPermanentMaterialSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput =
      await uploadPermanentMaterialInputType.parseAsync(input);
    const output = await uploadPermanentMaterialTool(parsedInput, ctx);
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
      en: "WeChat Official Account materials, drafts and publishing management tool set",
      "zh-CN": "微信公众号素材管理、草稿管理和发布工具集",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
    },
    toolDescription:
      "WeChat Official Account API tools for managing materials, drafts and publishing articles",
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
        en: "Get WeChat Official Account access_token using AppID and AppSecret for subsequent API authentication",
        "zh-CN":
          "通过 AppID 和 AppSecret 获取微信公众号的 access_token，用于后续 API 调用认证",
      },
      toolDescription:
        "获取微信公众号的 access_token。需要提供微信公众号的 AppID 和 AppSecret。返回的 access_token 有效期为 7200 秒，请在过期前重新获取。",
      handler: getAuthTokenHandler,
    },
    {
      id: "getDraftList",
      name: {
        en: "Get Draft List",
        "zh-CN": "获取草稿箱文章列表",
      },
      description: {
        en: "Get the list of draft articles in WeChat Official Account draft box with pagination support",
        "zh-CN": "获取微信公众号草稿箱中的文章列表，支持分页查询",
      },
      toolDescription:
        "获取微信公众号草稿箱中的文章列表。支持分页查询，可设置偏移量和每页数量。返回的草稿信息包括标题、作者、摘要、封面图等基本信息，可选择是否返回完整的文章内容。",
      handler: getDraftListHandler,
    },
    {
      id: "publishDraft",
      name: {
        en: "Publish WeChat Official Account Draft",
        "zh-CN": "发布微信公众号草稿",
      },
      description: {
        en: "Publish created WeChat Official Account draft to the official account",
        "zh-CN": "发布已创建的微信公众号草稿到公众号",
      },
      toolDescription:
        "将指定的草稿media_id发布到微信公众号，支持使用access_token或appId/appSecret进行认证。发布成功后返回publish_id和msg_data_id，可用于后续的状态查询。",
      handler: publishDraftHandler,
    },
    {
      id: "uploadMarkdownToDraft",
      name: {
        en: "Upload Markdown to Draft",
        "zh-CN": "上传 Markdown 到草稿箱",
      },
      description: {
        en: "Convert Markdown content to news article and upload to WeChat Official Account draft box",
        "zh-CN": "将 Markdown 格式的内容转换为图文消息并上传到微信公众号草稿箱",
      },
      toolDescription:
        "将 Markdown 内容转换为微信公众号图文消息格式，自动处理图片上传和封面图，然后保存到草稿箱。支持标题、作者、摘要等信息的自定义配置。",
      handler: uploadMarkdownToDraftHandler,
    },
    {
      id: "uploadPermanentMaterial",
      name: {
        en: "Upload Permanent Material",
        "zh-CN": "上传永久素材",
      },
      description: {
        en: "Upload permanent materials to WeChat Official Account, supporting images, voice, video and thumbnails",
        "zh-CN": "上传永久素材到微信公众号，支持图片、语音、视频和缩略图等类型",
      },
      toolDescription:
        "上传永久素材到微信公众号素材库。支持图片、语音、视频和缩略图等类型。素材上传后会永久保存在公众号素材库中，可用于后续的图文消息和群发消息。支持文件路径、Base64编码和URL三种输入方式。",
      handler: uploadPermanentMaterialHandler,
    },
  ],
});

export default toolSet;

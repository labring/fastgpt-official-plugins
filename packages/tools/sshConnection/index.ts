import {
  createToolHandler,
  defineTool,
  type InputSchemaMetaType,
  type OutputSchemaMetaType,
  type SecretSchemaMetaType,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({
  host: z.string().meta({
    title: "SSH 主机地址",
    description: "目标服务器 IP 或域名",
    isSecret: false,
  } satisfies SecretSchemaMetaType),
  port: z
    .union([z.string(), z.number()])
    .optional()
    .meta({
      title: "SSH 端口",
      description: "默认 22",
      isSecret: false,
    } satisfies SecretSchemaMetaType),
  username: z.string().meta({
    title: "用户名",
    description: "SSH 登录用户名",
    isSecret: false,
  } satisfies SecretSchemaMetaType),
  password: z
    .string()
    .optional()
    .meta({
      title: "密码",
      description: "使用账号密码登录时填写",
      isSecret: true,
    } satisfies SecretSchemaMetaType),
  privateKey: z
    .string()
    .optional()
    .meta({
      title: "私钥",
      description: "PEM/OpenSSH 私钥内容，支持换行或 \\n",
      isSecret: true,
    } satisfies SecretSchemaMetaType),
  passphrase: z
    .string()
    .optional()
    .meta({
      title: "私钥密码",
      description: "加密私钥的 passphrase",
      isSecret: true,
    } satisfies SecretSchemaMetaType),
});

const inputSchema = z.object({
  command: z.string().meta({
    title: "远程命令",
    description: "需要在远程主机执行的 shell 命令",
    toolDescription: "The shell command to execute on the remote SSH host",
  } satisfies InputSchemaMetaType),
  cwd: z
    .string()
    .optional()
    .meta({
      title: "工作目录",
      description: "可选。执行命令前切换到该目录",
      toolDescription: "Optional working directory before running the command",
    } satisfies InputSchemaMetaType),
  timeout: z
    .number()
    .optional()
    .meta({
      title: "命令超时(毫秒)",
      description: "默认 30000，最大 300000",
      toolDescription: "Command timeout in milliseconds",
    } satisfies InputSchemaMetaType),
  connectionTimeout: z
    .number()
    .optional()
    .meta({
      title: "连接超时(毫秒)",
      description: "默认 10000，最大 60000",
      toolDescription: "SSH connection timeout in milliseconds",
    } satisfies InputSchemaMetaType),
});

const outputSchema = z.object({
  stdout: z.string().meta({
    title: "标准输出",
    description: "远程命令 stdout",
  } satisfies OutputSchemaMetaType),
  stderr: z.string().meta({
    title: "错误输出",
    description: "远程命令 stderr",
  } satisfies OutputSchemaMetaType),
  exitCode: z
    .number()
    .nullable()
    .meta({
      title: "退出码",
      description: "远程命令退出码",
    } satisfies OutputSchemaMetaType),
  signal: z
    .string()
    .nullable()
    .meta({
      title: "终止信号",
      description: "远程命令被信号终止时返回信号名",
    } satisfies OutputSchemaMetaType),
  durationMs: z.number().meta({
    title: "执行耗时(毫秒)",
    description: "从开始建立连接到命令结束的耗时",
  } satisfies OutputSchemaMetaType),
});

const handler = createToolHandler({
  inputSchema,
  outputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await InputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await toolCb(parsedInput);
    return OutputType.parseAsync(output);
  },
});

const tool = defineTool({
  manifest: {
    pluginId: "sshConnection",
    name: {
      en: "SSH Command",
      "zh-CN": "SSH 远程命令",
    },
    description: {
      en: "Connect to a remote server over SSH and execute shell commands",
      "zh-CN": "通过 SSH 连接远程服务器并执行 shell 命令",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
    },
    toolDescription:
      "Use SSH to execute a command on a remote server. Supports password authentication and private key authentication.",
    tags: ["tools"],
  },
  handler,
});

export default tool;

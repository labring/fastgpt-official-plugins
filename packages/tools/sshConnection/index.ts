import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineTool,
  type SecretSchemaMetaType,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({
  host: z.string().meta({
    title: "SSH 主机地址",
    description: "目标服务器 IP 或域名",
    "x-i18n": {
      title: { en: "SSH host address", "zh-CN": "SSH 主机地址" },
      description: {
        en: "IP address or domain name of the target server.",
        "zh-CN": "目标服务器 IP 或域名。",
      },
    },
    isSecret: false,
  } satisfies SecretSchemaMetaType),
  port: z
    .union([z.string(), z.number()])
    .optional()
    .meta({
      title: "SSH 端口",
      description: "默认 22",
      "x-i18n": {
        title: { en: "SSH port", "zh-CN": "SSH 端口" },
        description: {
          en: "SSH port; defaults to 22.",
          "zh-CN": "SSH 端口，默认为 22。",
        },
      },
      isSecret: false,
    } satisfies SecretSchemaMetaType),
  username: z.string().meta({
    title: "用户名",
    description: "SSH 登录用户名",
    "x-i18n": {
      title: { en: "Username", "zh-CN": "用户名" },
      description: {
        en: "Username for SSH login.",
        "zh-CN": "SSH 登录用户名。",
      },
    },
    isSecret: false,
  } satisfies SecretSchemaMetaType),
  password: z
    .string()
    .optional()
    .meta({
      title: "密码",
      description: "使用账号密码登录时填写",
      "x-i18n": {
        title: { en: "Password", "zh-CN": "密码" },
        description: {
          en: "Fill in when using password authentication.",
          "zh-CN": "使用账号密码登录时填写。",
        },
      },
      isSecret: true,
    } satisfies SecretSchemaMetaType),
  privateKey: z
    .string()
    .optional()
    .meta({
      title: "私钥",
      description: "PEM/OpenSSH 私钥内容，支持换行或 \\n",
      "x-i18n": {
        title: { en: "Private key", "zh-CN": "私钥" },
        description: {
          en: "PEM/OpenSSH private key content; line breaks or \\n are supported.",
          "zh-CN": "PEM/OpenSSH 私钥内容，支持换行或 \\n。",
        },
      },
      isSecret: true,
    } satisfies SecretSchemaMetaType),
  passphrase: z
    .string()
    .optional()
    .meta({
      title: "私钥密码",
      description: "加密私钥的 passphrase",
      "x-i18n": {
        title: { en: "Private key passphrase", "zh-CN": "私钥密码" },
        description: {
          en: "Passphrase for an encrypted private key.",
          "zh-CN": "加密私钥的 passphrase。",
        },
      },
      isSecret: true,
    } satisfies SecretSchemaMetaType),
});

const inputSchema = defineInputSchema({
  command: {
    type: z.string(),
    title: { en: "Remote command", "zh-CN": "远程命令" },
    description: {
      en: "Shell command to run on the remote host.",
      "zh-CN": "需要在远程主机执行的 shell 命令。",
    },
    isToolParam: true,
  },
  cwd: {
    type: z.string().optional(),
    title: { en: "Working directory", "zh-CN": "工作目录" },
    description: {
      en: "Optional directory to change to before running the command.",
      "zh-CN": "可选，执行命令前切换到该目录。",
    },
    isToolParam: true,
  },
  timeout: {
    type: z.number().optional(),
    title: { en: "Command timeout (ms)", "zh-CN": "命令超时（毫秒）" },
    description: {
      en: "Command timeout in milliseconds; defaults to 30000 and is limited to 300000.",
      "zh-CN": "命令超时时间，单位为毫秒，默认为 30000，最大为 300000。",
    },
    isToolParam: true,
  },
  connectionTimeout: {
    type: z.number().optional(),
    title: { en: "Connection timeout (ms)", "zh-CN": "连接超时（毫秒）" },
    description: {
      en: "SSH connection timeout in milliseconds; defaults to 10000 and is limited to 60000.",
      "zh-CN": "SSH 连接超时时间，单位为毫秒，默认为 10000，最大为 60000。",
    },
    isToolParam: true,
  },
});

const outputSchema = defineOutputSchema({
  stdout: {
    type: z.string(),
    title: { en: "Standard output", "zh-CN": "标准输出" },
    description: {
      en: "Standard output (stdout) from the remote command.",
      "zh-CN": "远程命令的标准输出（stdout）。",
    },
  },
  stderr: {
    type: z.string(),
    title: { en: "Error output", "zh-CN": "错误输出" },
    description: {
      en: "Standard error (stderr) from the remote command.",
      "zh-CN": "远程命令的标准错误输出（stderr）。",
    },
  },
  exitCode: {
    type: z.number().nullable(),
    title: { en: "Exit code", "zh-CN": "退出码" },
    description: {
      en: "Exit code returned by the remote command.",
      "zh-CN": "远程命令返回的退出码。",
    },
  },
  signal: {
    type: z.string().nullable(),
    title: { en: "Termination signal", "zh-CN": "终止信号" },
    description: {
      en: "Signal name if the remote command was terminated by a signal.",
      "zh-CN": "远程命令被信号终止时返回的信号名称。",
    },
  },
  durationMs: {
    type: z.number(),
    title: { en: "Execution time (ms)", "zh-CN": "执行耗时（毫秒）" },
    description: {
      en: "Time from starting the connection until the command finishes.",
      "zh-CN": "从开始建立连接到命令结束的耗时。",
    },
  },
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
      en: "Connect to a remote server over SSH and execute shell commands. Supports password and private-key authentication.",
      "zh-CN":
        "通过 SSH 连接远程服务器并执行 shell 命令，支持密码和私钥身份验证。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "初始版本",
    },
    tags: ["tools"],
  },
  handler,
});

export default tool;

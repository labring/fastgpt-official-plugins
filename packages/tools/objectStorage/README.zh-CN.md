# 对象存储 (Object Storage)

面向 FastGPT 官方插件的 S3 兼容对象存储工具集（支持 AWS S3、MinIO、阿里云 OSS 等）。

## 核心功能

- 列出指定存储桶（Bucket）中的对象文件。
- 将 UTF-8 文本内容直接上传为存储对象。
- 下载并读取对象为 UTF-8 文本（支持配置大小上限）。
- 生成用于安全下载对象的只读预签名链接（Presigned URL）。

## 连接配置与密钥 (Secrets)

| 配置项 | 必填 | 说明 |
| :--- | :---: | :--- |
| `endpoint` | 是 | S3/OSS 兼容的服务端点 URL，例如 `https://s3.amazonaws.com`、`https://oss-cn-hangzhou.aliyuncs.com` 或私有 MinIO 端点。 |
| `region` | 是 | 存储区域标识，例如 `us-east-1` 或 `oss-cn-hangzhou`。 |
| `accessKeyId` | 是 | 访问密钥 ID（加密存储）。 |
| `secretAccessKey` | 是 | 安全访问密钥（加密存储）。 |
| `bucket` | 是 | 所有子工具默认使用的存储桶名称。 |
| `forcePathStyle` | 否 | 是否启用 Path-Style 寻址（使用 MinIO 等私有部署服务时需开启）。 |

## 子工具列表

### 1. 列出对象 (`listObjects`)

列出指定存储桶中的对象列表。
- `prefix`：可选的对象 Key 前缀过滤。
- `maxKeys`：可选的最大返回数量（1~1000，默认为 100）。

### 2. 上传文本对象 (`uploadTextObject`)

将传入的 UTF-8 文本直接保存为存储对象（不读取本地文件）。
- `key`：目标对象相对路径 Key。
- `text`：待上传的文本内容。
- `contentType`：可选的 Content-Type，默认为 `text/plain; charset=utf-8`。
- `maxTextSize`：可选的最大字节数上限，默认为 1 MiB。

### 3. 读取文本对象 (`getObjectText`)

将指定的存储对象作为 UTF-8 文本下载并读取。
- `key`：目标对象 Key。
- `maxTextSize`：可选的最大读取字节上限，默认为 1 MiB。

### 4. 生成预签名下载链接 (`getPresignedDownloadUrl`)

为指定对象生成带签名的临时只读下载直链。
- `key`：目标对象 Key。
- `expiresIn`：链接有效期（秒），默认为 900 秒（15 分钟），最大支持 604800 秒（7 天）。

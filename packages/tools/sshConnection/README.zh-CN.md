# sshConnection

通过 SSH 连接远程服务器并执行 shell 命令。

## 支持的连接方式

- 账号密码：配置 `host`、`port`、`username`、`password`
- 私钥：配置 `host`、`port`、`username`、`privateKey`
- 加密私钥：在私钥连接基础上额外配置 `passphrase`

## 输入

- `command`：需要执行的远程命令
- `cwd`：可选，执行命令前切换到指定目录
- `timeout`：可选，命令超时时间，默认 30000 毫秒，最大 300000 毫秒
- `connectionTimeout`：可选，连接超时时间，默认 10000 毫秒，最大 60000 毫秒

## 输出

- `stdout`：标准输出
- `stderr`：错误输出
- `exitCode`：命令退出码
- `signal`：终止信号
- `durationMs`：执行耗时

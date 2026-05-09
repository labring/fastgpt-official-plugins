# CPU 压力测试

运行可配置的 CPU 密集型计算，用于压测 FastGPT 插件运行环境。

该插件只适合内部压测环境。阻塞模式会真实占用当前 Node.js worker 的 CPU，并阻塞 event loop。

## 输入

- `durationMs`: 压测时长，范围 10-30000，默认 1000
- `batchSize`: 每批同步计算的迭代次数，范围 1000-5000000，默认 100000
- `yieldEveryMs`: 让步间隔，范围 0-1000，默认 0。设为 0 时完全阻塞 event loop
- `seed`: 随机种子，范围 1-2147483647，默认 1

支持中文别名：`压测时长`、`批大小`、`让步间隔`、`随机种子`。

## 输出

- `elapsedMs`: 实际耗时，单位毫秒
- `iterations`: 实际执行的迭代次数
- `checksum`: 计算校验值
- `opsPerSecond`: 每秒迭代数
- `yieldedCount`: 主动让出 event loop 的次数

## 示例

```json
{
  "durationMs": 1000,
  "batchSize": 100000,
  "yieldEveryMs": 0,
  "seed": 1
}
```

## 开发

```bash
pnpm install
pnpm run build
pnpm run test
```

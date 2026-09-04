# 04 · 证据与脱敏

静态守卫：`scripts/e2e-platform/secret-redaction.mjs`。

## 回执

`scripts/local-e2e-receipt.mjs` 只写元数据：退出码、时长、断言数、源码 SHA-256、迁移清单摘要。不写 stdout、stderr、prompt、答案、令牌、连接串。`releaseEvidence` 恒为 false。

## 子进程输出

隔离 runner 对 api/worker 的 stdout/stderr 只保留字节计数（`E2E_PROCESS_OUTPUT_WITHHELD`）。不要加 preview 或短哈希，以免成为离线 oracle。

## helpers 禁止

- `console.log` / `console.error` 打印 `token`、`Authorization`、`audioBase64`、`contentBase64`、`MODEL_API_KEY`、`PAY_PROVIDER_SECRET`。
- 把简历原文、完整答案、音频写入回执或 CI 摘要。
- 提交 `.env`、真实简历、录音。

断言文案可以写 status / error code / 计数。语音 helper 只允许打印 HTTP status 与截断后的 `error` 字段。HTTP 客户端的 `✓/✗` 行仍转发到终端（操作者要对断言），不得把 token / 音频 / 简历原文写进断言文案。守卫由 `scripts/e2e-platform/secret-redaction.mjs` 机械执行，红则不得写 PASS_WITH_GAPS。

## 本地产物

`.tmp/e2e-receipts/` 与 `.tmp/` 工单不提交。需要给人看的结论写在 PR / 交付文档，并带 `releaseEvidence=false`。

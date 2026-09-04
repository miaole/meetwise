---
id: GT-05
status: partial
subject: mechanism
---

# GT-05 · 模型输出非法 JSON → validator 拒绝

- **策略来源**：第一批第 5 条。
- **status**：`partial`（schema 失败拒绝入库已有门；非法 JSON **文本**与策略「重试」未覆盖）。
- **已映射**：`pnpm model-op00-usage-reconciler:prove` — 结构化产出对不上 schema 时写 `schema_validation_failed`，invocation `failed`，不进业务 value。
- **相关但不覆盖**：`pnpm runtime:prove` 证明业务校验拦截与确定性拒绝不重试，**不断言** `schema_validation_failed` 或非法 JSON 文本。
- **当前运行时**：供应商标量非法 JSON 时，`model-client` 的 `JSON.parse` 抛错后记 `unknown`，不进入 `doubleValidate`。派发后的 schema/业务失败**不自动重试**、不换模型。见 `agent-runtime.md`。
- **负向**：非法 JSON 若被 `JSON.parse` 后静默当对象用，本任务失败。
- **禁止**：把 `runtime:prove` 绿写成“非法 JSON 已验收”；为了让策略句子字面成立而打开自动 repair 重打。

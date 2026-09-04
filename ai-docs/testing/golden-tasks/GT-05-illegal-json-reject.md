---
id: GT-05
status: mapped
---

# GT-05 · 模型输出非法 JSON → validator 拒绝

- **策略来源**：第一批第 5 条。
- **status**：`mapped`（拒绝入库）；策略原文“并重试”与**当前运行时不一致**。
- **已映射**：`pnpm runtime:prove`；`invoke` 在 schema 失败时写 `schema_validation_failed`，结果不进业务投影。
- **当前运行时**：派发后的 schema/业务失败**不自动重试**、不换模型。见 `agent-runtime.md`。策略里的“重试”不得写成已实现。
- **负向**：非法 JSON 若被 `JSON.parse` 后静默当对象用，本任务失败。
- **禁止**：为了让策略句子字面成立而打开自动 repair 重打。

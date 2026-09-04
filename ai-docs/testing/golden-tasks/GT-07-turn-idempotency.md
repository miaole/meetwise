---
id: GT-07
status: partial
subject: mechanism
---

# GT-07 · 同 turn 不同答案 → 不同幂等键；同答案重放 → 不重打模型

- **策略来源**：第一批第 7 条。
- **status**：`partial`（covering 命令已登记；本修订未实跑隔离 prove，不得标 `mapped`）。
- **已映射**：`pnpm turn-idempotency:prove` — 同 HTTP 体并发重放只落一个 answer job，ledger 绑定第一次 identity/hash。`pnpm neg:interview` — 已消费 identity 后再提交不同 `answerId`/hash → `409 stale_question`，不覆盖先到答案。`pnpm scoring-integrity:prove` — `evaluateAnswer` 同答重放缓存且模型只打 1 次；换答走不同 answer SHA-256 幂等键。
- **相关但不覆盖**：`pnpm e2e:isolated` 已消费 identity 重放 → 409。
- **缺口**：HTTP `/turn` → worker 消费 → `evaluateAnswer` 缓存的单条组合测；隔离三门未在本修订重跑。
- **禁止**：用“重放也是 202”代替 job 计数=1；未实跑 covering 门就标 `mapped`。

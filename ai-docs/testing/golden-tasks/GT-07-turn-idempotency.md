---
id: GT-07
status: partial
---

# GT-07 · 同 turn 不同答案 → 不同幂等键；同答案重放 → 不重打模型

- **策略来源**：第一批第 7 条。
- **status**：`partial`。
- **已映射**：`pnpm turn-idempotency:prove` — 同 HTTP 体并发重放只落一个 answer job，ledger 绑定第一次 identity/hash。
- **缺口**：未单独立项证明「同 turn 换不同 answer 必须不同幂等键且不得覆盖」。HTTP E2E 每题新 `answerId`。
- **禁止**：用“重放也是 202”代替 job 计数=1。

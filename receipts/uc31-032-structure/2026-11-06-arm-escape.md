# UC-031-032-STRUCTURE-01 · Arm-ESC（escape 结构基础）收据 · 2026-11-06

- CMD：`pnpm uc031-032:structure:prove`（隔离壳 `scripts/run-e2e-isolated.mjs` · 隔离 PG `pgvector/pgvector:pg16` 容器真迁移链）· **EXIT=0**（终态 fresh run 2026-11-05T17:21:48Z · 48 断言 0 FAIL 全卷口径 · 本臂 12 断言（纠偏断言计入））
- proof：`apps/worker/test/uc-e2e-031-032-structure.proof.ts`（NON-UI · tsx 形沿 `prove:diagnosis` 同族）
- **release_evidence=false** · **est live=0**（零模型零网络零 key·零外呼零 secrets）· **actualSpendCny=null**

## 断言面（本臂 12·纠偏断言计入）

（post-prove 勘误 2026-11-06·登记源=两份 post-prove 复审：分臂计数亲数 Arm-ESC 12/Arm-REJ① 12/Arm-REJ② 24·总 48 不变——本收据原记「15 断言+纠偏承引 1 行」系记账误·逐项 ×PASS 点数合计恰 12·总读数零变化。）

①注入五式逐式命中（domain `INJECTION` 五正则 · `packages/domain/src/index.ts:24`）→ `blocked(suspected_injection)`（`:60`）且不进结构化（注入行 facts/experience/skills 全空=注入即拦不喂模型）：
- 式1 忽略指令形 / 式2 ignore previous 形 / 式3 给满分形 / 式4 伪造 system 回合形 / 式5 你现在是形 —— 各恰 1 条 `reason === 'suspected_injection'`（严格等值）×5 PASS
- 五式混合简历结构化面全空 ×1 PASS

②评分操纵剥离（`stripScoringManipulation` · `packages/domain/src/adaptive-interview.ts:311`）：
- `score=100` → detected=true 且剥空 ×1 PASS
- `"score":100`（IT-03 容差形 · `:295`）→ detected=true 且剥空 ×1 PASS
- 真答案+操纵尾巴 → 只去操纵句、真内容逐字保留（不整行 nuke）×1 PASS

③调用序只读断言（`apps/worker/src/adaptive-interview-service.ts:803`→`:831`/`:848` · 只断言不改动）：
- 剥离先于评分消费（`promptAnswer: clean`）×1 PASS
- 剥离先于摘要派生（`answerSummary: boundedTextSlice(clean`·先剥离后截取禁倒置）×1 PASS
- 纠偏原文逐字在树（`e2e-scenarios.md:399`）×1 PASS；原文承引：~~"分数不被拉满 = 模型抗注入"~~ **移出 e2e → ai-eval**：fake-model 无论是否被注入都返回 fixture，e2e 无法证明模型抵抗。

## 诚实框

- **本臂=结构面收据**：只证「既有确定性机制在树且行使为拒」，**≠模型抗注入率/不造假率**（归二期 ai-eval 判定指标）；**≠covered**（状态词 `gap(e2e)`/`partial(eval)` 零动·coveredCount=8 不变）；本绿≠全链路 E2E。
- **AUDIT-OBSERVATION: absent** — Arm-ESC GuardrailHit 落库腿：产品零接线（全仓 0 emit 点·升格权在协调方）。TC 需求句「+GuardrailHit 落库」该腿不入断言、不造 stub、不冒充已实现。
- GuardrailHit 表/API 设计=二期红门（产品裁决前置 `open-decisions.md:46` + harness §1b-6）。

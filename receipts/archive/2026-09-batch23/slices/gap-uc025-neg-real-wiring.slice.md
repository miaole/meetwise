# Slice — **GAP-UC025-NEG-01 real wiring**（刀 B'' · docs-only REQUEST · **`draft:awaiting_pre_exec_dual`** · EXIT 契约前 1 后 0）

**Status**: **`draft:awaiting_pre_exec_dual`** · docs REQUEST only · not coding permission · not a proof edit · not a prove run · pre-exec dual PASS ≠ coding；coding 由协调方在双审 PASS 后另行授权 · Ban self-approve
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-03（刀 B''）
**Base**: `origin/feat/mysql-schema-skeleton` **`f3cf84c`** / full `f3cf84ccbd6ff0341fe198aa4cadd8cff417e69b`（B' FINAL **`76d2bc3`** / `76d2bc3fb5fb15b5a08aa5f769fc19cfa6a09a77` 之后）
**Authority**: meetwise — L0 docs only · 本 commit 不改任何代码 · 不跑 prove · 不 push
**Worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-b2`（branch `line/b2-uc025-wiring` · 一切 git 写操作只在独立 worktree 内）

## One-line

B' `76d2bc3` 只钉门锁（`pnpm uc025:nhp-neg:prove` EXIT 1 until real wiring）≠ 接线授权。刀 B'' 申请的下一步是**真接线**：interview begin 真接入 quiz artifact（`acceptsQuiz` 真路径）+ stale quiz 真拒绝（`realStaleReject` 真路径，抛真实 `HttpException`）。prove 契约：接线前 EXIT 1（诚实未接线标记），真接线落地后预期诚实 EXIT 0；**EXIT 0 ≠ covered ≠ nail ≠ SSOT flip**。Ban 仅靠改 proof 正则/布尔洗绿。Ban covered。Ban 写 `coveredCount ≠ 8`。`GAP-UC025-NEG-01` 未自关（post-prove dual）之前保持 **OPEN**；`UC-E2E-025` 行未满足 covered 准则（FAULT/BOUND/ADV not-run）之前保持 **gap**——诚实，不升格。Not UC-018 · Not UC-052 · Not UC-004 · Not FAULT/BOUND/ADV.

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-uc025-neg-real-wiring.md` |
| Pre-exec dual stub `mw-rag-route` | `reviews/REQUEST-2026-10-03-gap-uc025-neg-real-wiring-mw-rag-route.md` |
| Pre-exec dual stub `mw-e2e-ha` | `reviews/REQUEST-2026-10-03-gap-uc025-neg-real-wiring-mw-e2e-ha.md` |
| B' FINAL（门锁，只读不动） | `gap-uc025-neg-product-wiring.slice.md` · `harness/gap-uc025-neg-product-wiring.md` @ `76d2bc3` |
| 旧 proof / receipt（只读不动） | `apps/api/test/uc-e2e-025-nhp-neg.proof.mjs` · `receipts/uc-e2e-025-nhp/2026-10-02-uc025-nhp-neg-prove.md` |

旧 PASS/FAIL/PENDING review 文件一律不覆写。

## 真接线范围（一句话）

改 `interview.controller.ts begin()`（真收 quiz 工件入参并透传）+ `interview.service.ts begin()`（owner-scoped 取 `resume_quiz` 工件、对持久化新鲜度锚点校验、过期即抛真实 `HttpException({error:'stale_quiz'}, CONFLICT/GONE)` 于 begin 体前段、扣额度/入队之前）+ `0007_resume_quiz.sql`（非破坏补 `resume_quiz` 过期锚点列，镜像 `sql/20_resume_quiz.sql`）；`packages/contracts` 可选登记错误码。**proof 一字不改。**

## Prove EXIT 契约

| 阶段 | CMD | EXIT | 语义 |
|------|-----|------|------|
| 真接线落地前（现状，本刀不改） | `pnpm uc025:nhp-neg:prove` | **1** | 未接线标记（诚实）。非产品拒绝、非 covered。 |
| 真接线落地后（授权 coding 且实现完成后） | `pnpm uc025:nhp-neg:prove` | **0（预期诚实）** | 两真路径均存在。case pass ≠ covered ≠ nail ≠ FAULT/BOUND/ADV。receipt 记实际 EXIT，不预claim。 |

接线必须**不改 proof** 而使翻绿成立；若发现必须改 proof 才能绿，即说明接线不真——停手上报，禁改 proof。

## Ban 列表

Ban coding（本回合）· Ban prove run（本回合）· Ban push · Ban 改 `apps/api/test/uc-e2e-025-nhp-neg.proof.mjs`（**仅靠改 proof 正则/布尔洗绿 = Ban**）· Ban stub/死旗标 throw/只为命中正则插串/布尔翻 true（皆 wash-green）· Ban covered · Ban SSOT edit · Ban 写 `coveredCount ≠ 8` · Ban 动 UC-018（partial）/ UC-052（partial）/ UC-004 / flake 行 · Ban FAULT/BOUND/ADV 扩围 · Ban 把 begin 的 quiz 工件改成强制入参（widen）· Ban 把旧 `uc025:stale-quiz-expiry:prove` EXIT 0 记成本案通过 · Ban secrets/`.env*` · Ban force-push · Ban self-approve（alone ≠ dual · dual PASS ≠ coding ≠ nail ≠ covered）。

## 行保持（诚实）

- **`GAP-UC025-NEG-01` 保持 OPEN**，直至其自身 post-prove dual 关闭；本 REQUEST 不关。
- **`UC-E2E-025` 行保持 gap**（§1.0.1 NEG 列），直至行自身 covered 准则满足；FAULT/BOUND/ADV 保持 not-run，ADV 保持 blind。接线后即使 prove 绿，行也不自动升格。
- Pins 原值全抄不改口。

*Slice · GAP-UC025-NEG-01 real wiring · draft:awaiting_pre_exec_dual · EXIT 1 → (real wiring) → EXIT 0 · not coding authorization · STOP*

# 审查 — GAP-UC025-NEG-01 wiring revise · pre-exec · mw-e2e-ha

**角色**: `mw-e2e-ha`（证据诚实 · 对抗）· **不代签** `mw-rag-route` · **不代签** `mw-privacy-int`
**轮次**: Line B' PRE-EXEC revision · docs-only · 未跑 prove · 未起 Postgres · 未改产品 · 未改证明
**审的 REQUEST**: `3ee28d3` / `3ee28d376a3031fcb064d3b7ca05e103d799eb81`
**父提交**（`git rev-parse 3ee28d3^`）: `ad37bbb` / `ad37bbb3115e5836f79c9b2c4dde0420e250de61`
**本轮 diff**（`git diff-tree --name-only -r 3ee28d3`）仅四份 docs：
- `ai-docs/delivery/harness/gap-uc025-neg-product-wiring.md`
- `ai-docs/delivery/gap-uc025-neg-product-wiring.slice.md`
- `ai-docs/delivery/reviews/REQUEST-2026-10-02-gap-uc025-neg-wiring-revise-mw-e2e-ha.md`（当时 stub **PENDING**）
- `ai-docs/delivery/reviews/REQUEST-2026-10-02-gap-uc025-neg-wiring-revise-mw-rag-route.md`（仍 **PENDING** · 不代签）
**docs-only**: **yes**（无 `.ts` · 无 proof 改动 · 矩阵 / backlog / checklist 未进 diff）

本结论只覆盖修订后的 docs 锁句。PASS ≠ coding ≠ covered ≠ nail ≠ HA。本 PASS 不授权改证明，不授权实现产品接线。

---

## 1. 锁句 — 达到先前 FAIL 要求

先前 FAIL `6fe3bfd` / `6fe3bfd62a15e3ea3396c3e506d7123969f20f95`（`reviews/REQUEST-2026-10-02-uc025-wiring-spec-pre-mw-e2e-ha.md`）挡住的是：第一版 spec 没有写 NEG prove 保持 EXIT 1，直到 `acceptsQuiz` 与 `realStaleReject` 都是真产品接线，而不是 stub 或布尔翻成 true。当时最近的句子只禁 wash-green，并把 until 停在日后的 dual PASS。本修订承认该 FAIL，并替换那句，而不是假装第一版已经够用。

`ai-docs/delivery/harness/gap-uc025-neg-product-wiring.md:27`：

> The prior spec sentence that treated a later dual PASS as the point where `acceptsQuiz` / `realStaleReject` merely stop being the unwired false pair is **not** the lock. That wording is why mw-e2e-ha pre-exec **FAIL** `6fe3bfd` / `6fe3bfd62a15e3ea3396c3e506d7123969f20f95`. It is retained above only as the failed REQUEST text's historical miss description. This revised spec replaces it.

锁句 `ai-docs/delivery/harness/gap-uc025-neg-product-wiring.md:31`：

> `pnpm uc025:nhp-neg:prove` (`uc-e2e-025-nhp-neg`) **STAYS EXIT 1** until `acceptsQuiz` and `realStaleReject` are both real product wiring, not a stub and not a boolean flipped to true.

同文件 L34 把「真接线」说成产品行为，并明确 stub / 布尔 / 正则命中都不算：

> Real wiring means interview begin actually accepts a quiz artifact and a stale quiz is actually rejected. A regex hit, a stub, or a boolean set to true is not that wiring.

L33 说明为什么要锁退出码：证明在两条正则都命中时会 EXIT 0，所以禁止靠翻布尔洗绿。slice 首段复述同一把锁。until 停在真产品接线，不再停在 dual PASS。

## 2. 不授权改证明，不授权本 REQUEST 做产品接线

`ai-docs/delivery/harness/gap-uc025-neg-product-wiring.md:3`：

> this commit does not authorize editing the proof and does not authorize implementing the product wiring

同文件 L37：

> This revised REQUEST does not authorize editing the proof (including `apps/api/test/uc-e2e-025-nhp-neg.proof.mjs`). It does not authorize implementing the product wiring. It does not run `pnpm uc025:nhp-neg:prove`. It does not add a command.

slice 头同样写明 this commit does not authorize editing the proof and does not authorize product wiring。没有「本审查通过即可改证明 / 即可接线」的句子。本 PASS 也不授予这两项。

抽查同一 SHA、本 diff 未改的证明 `apps/api/test/uc-e2e-025-nhp-neg.proof.mjs`：

- L58 `acceptsQuiz` 是 `quiz-id|quizId|sourceQuiz|source_quiz` 对 begin 签名的正则
- L59 `realReject = STALE_THROW_RE.test(region)`（日志 L68 的标签才是 `realStaleReject`）
- L71 `if (acceptsQuiz && realReject)` 则 L76 `process.exit(0)`，否则 L84 `process.exit(1)`

两个布尔仍是源码正则。spec 现在写明正则命中或把布尔置 true 不是接线，并且不授权改这份证明。这补上了 `6fe3bfd` 点名的洞。

## 3. 行保持 gap；不改 UC-018 / UC-052

- L1 / L10：`UC-E2E-025` NEG column only · row stays **gap**
- L23：Do not claim UC-025 closed. Ban wash-green. Do not write covered.
- L35：Ban covered. Ban writing SSOT as covered. 即便日后诚实 EXIT 0，仍不是 covered，仍不是 SSOT 翻转。
- L36：Not UC-018. Not UC-052. UC-052 stays **partial**. Do not flip UC-018. FAULT / BOUND / ADV stay out of this REQUEST.
- L56：row stays gap

没有把行标成 covered。本 diff 没有矩阵、backlog、checklist，也没有 UC-018 或 UC-052 行。

## 4. `b191881` 是什么 · alone ≠ dual

`git show --stat b191881`：

- 全哈希 `b191881c4474c2b3e34a243d69ccf9da31dbafd0`
- Author `mw-rag-route <mw-rag-route@meetwise.local>`（committer 同人）
- 说明：`review(gap-uc025-neg-wiring): mw-rag-route pre-exec PASS`
- 只新增一份：`ai-docs/delivery/reviews/REQUEST-2026-10-02-gap-uc025-neg-product-wiring-mw-rag-route.md`（+47）
- 正文自称 docs-only，gap 仍开、行仍 gap、EXIT 1 unwired，不是编码授权，不是 nail

这是**第一版** wiring spec 的单方 pre-exec PASS，已在 origin `feat/mysql-schema-skeleton` 上。它不是本修订的审查，也不是 dual。

本修订没有把它当成 dual。harness L42：

> mw-rag-route `b191881` / `b191881c4474c2b3e34a243d69ccf9da31dbafd0` was a **PASS** but alone is not a dual. Overall **not pass**.

L11、L43、L49–L50：本修订状态仍是 `draft:awaiting_pre_exec_dual`，双方 stub 在该 SHA 上仍是 PENDING。`6fe3bfd` 是 FAIL，文件保留、不覆盖。本文件不代签 `mw-rag-route`。单方 PASS 不是 dual。

## 5. 抽查（非阻塞）

- begin 仍无 quiz artifact。`interview.controller.ts` L22：`begin(@Param('id') id: string, @Req() req: any, @Headers('resume-id') resumeId: string)`。`interview.service.ts` L178：`begin(principal: string, id: string, resumeId: string, requestId?: string)`。`git diff --stat 58c0031 3ee28d3 -- apps/api/src/modules/interview apps/api/test/uc-e2e-025-nhp-neg.proof.mjs` 为空。
- harness L6 的 revision base `ad37bbb` 与 `3ee28d3^` 一致。L7 仍把「Base / parent tip」写成更早的 `58c0031`。那不是本 commit 的父，也不是 prove tip。产品 begin 签名相对 `58c0031` 未变，不削弱锁句。
- 旧 pin `pnpm uc025:stale-quiz-expiry:prove` 在 L37 被明确排除。证明 L81 同旨。未把旧绿当成 NHP-NEG 通过。
- H nail `c100f22` 与 dual `04f6d33` / `86228ac` 仍被写成 failed-prove honesty nail，不是 close。本审查不重跑、不洗掉那次 EXIT 1。

## 6. 销钉

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503

harness L4 与 L56 与上列一致。未翻销钉。

## 7. 条件

- 本 PASS 只表示修订后的 harness 写明了 EXIT 1 锁，达到 pre-exec 文字门槛。
- 不授权编辑证明，包括 `apps/api/test/uc-e2e-025-nhp-neg.proof.mjs`。
- 不授权实现 `acceptsQuiz` / `realStaleReject` 的产品接线。stub、正则命中、或把这两个布尔翻成 true，都不算接线，也不把 prove 洗成 EXIT 0。
- `pnpm uc025:nhp-neg:prove` 在 begin 真的收下 quiz artifact 且真的拒绝 stale quiz 之前，保持 EXIT 1。
- UC-E2E-025 行保持 gap。不得写成 covered。不得改 UC-018 行或 UC-052 行。UC-052 保持 partial。不得翻 UC-018。
- alone ≠ dual。`b191881` 不是 dual。本修订的 `mw-rag-route` stub 仍 PENDING。本文件不代签 peer。
- PASS ≠ coding ≠ covered ≠ nail ≠ HA。销钉保持第 6 节所列。

## 8. 阻塞

无阻塞

Verdict: PASS

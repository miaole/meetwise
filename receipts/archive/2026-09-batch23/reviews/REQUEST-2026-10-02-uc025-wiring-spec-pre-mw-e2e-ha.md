# 审查 — GAP-UC025-NEG-01 product wiring spec · pre-exec · mw-e2e-ha

**角色**: `mw-e2e-ha`（证据诚实 · 对抗）· **不代签** `mw-rag-route` · **不代签** `mw-privacy-int`
**轮次**: Line B' PRE-EXEC · docs-only · 未跑 prove · 未起 Postgres · 未改产品代码 · 未发 live/model
**审的 REQUEST**: `59bdbdf` / `59bdbdfa2818017d7e11cfab5773d7e72020c9a8`
**父提交（`git rev-parse 59bdbdf^`）**: `031ad36` / `031ad36f7db01189e9754fd8e37a4b9fff5c6dd2`
**本轮 diff**（`git diff-tree --name-only -r 59bdbdf`）仅四份 docs：
- `ai-docs/delivery/harness/gap-uc025-neg-product-wiring.md`
- `ai-docs/delivery/gap-uc025-neg-product-wiring.slice.md`
- `ai-docs/delivery/reviews/REQUEST-2026-10-02-gap-uc025-neg-product-wiring-mw-e2e-ha.md`
- `ai-docs/delivery/reviews/REQUEST-2026-10-02-gap-uc025-neg-product-wiring-mw-rag-route.md`
**docs-only**: **yes**（无 `.ts` · 无 proof 改动 · 矩阵/backlog/checklist 未进 diff）

alone ≠ dual。本 FAIL 不是编码授权，不是 nail，不是 covered，不是 HA。stub 仍 PENDING。本文件不代签 peer。

---

## 1. 缺口：没有把 NEG prove 钉在 EXIT 1，直到产品接线是真的 — 不通过

要求：spec 必须写明 `pnpm uc025:nhp-neg:prove` 保持 EXIT 1，直到产品接线存在，且 `acceptsQuiz` 与 `realStaleReject` 都来自真接线，而不是把 stub 翻成 true。

`git show 59bdbdf:ai-docs/delivery/harness/gap-uc025-neg-product-wiring.md` 里和 EXIT 有关的只有历史记录与一句禁洗绿：

L17：

> `pnpm uc025:nhp-neg:prove` **EXIT 1** at code `0271ee4` / `0271ee4649b1b94b833587f2f900b22f80863f32`. Receipt commit `f47f155`.

L19：

> EXIT 1 is the unwired mark, not a product refusal.

L22：

> Do not claim UC-025 closed. Ban wash-green. Do not write covered.

L26：

> The product-wiring spec, for a later dual PASS and not for this commit, is only the miss already named: interview begin takes a quiz artifact, and a stale quiz is rejected by a stale-quiz HttpException, so `acceptsQuiz` / `realStaleReject` are no longer the unwired false pair recorded above. Until that later dual PASS, this REQUEST does not authorize coding.

slice L11 把 `EXIT 1` 写成当前事实，与「begin 不收 quiz、不抛 stale-quiz」并列，没有「直到接线完成之前保持 EXIT 1」。

这些句子没有写：

- prove **保持** EXIT 1，直到 begin 真的收下 quiz artifact 并且真的抛 stale-quiz HttpException
- 禁止把 `acceptsQuiz` / `realStaleReject` 的 stub 或证明布尔翻成 true 来换 EXIT 0
- 即便日后诚实的 EXIT 0，在上述产品行为落地之前仍然不是 covered

L22 的 `Ban wash-green` 禁止把已记录的红洗成绿，但不是「命令保持 EXIT 1 直到两个信号都是真接线」。L26 的 until 停在「later dual PASS / 不授权编码」，不是停在产品接线。dual PASS 之后这段 spec 不再锁住 prove 的退出码。L26 把成功定义成两个 flag「不再是 unwired false pair」，又没有禁止改 `apps/api/test/uc-e2e-025-nhp-neg.proof.mjs` 让正则或布尔变真。

抽查同一 SHA 的证明（本 diff 未改它）`apps/api/test/uc-e2e-025-nhp-neg.proof.mjs`：

- L58 `acceptsQuiz = /quiz-id|quizId|sourceQuiz|source_quiz/.test(ctrlBegin + svcBegin)`
- L59 `realReject = STALE_THROW_RE.test(region)`
- L71 `if (acceptsQuiz && realReject)` 则 L76 `process.exit(0)`，否则 L84 `process.exit(1)`

两个布尔是源码正则，不是产品行为证明。签名里塞进 `quizId`、或在 begin 窗口里放一个匹配正则的 throw，就可以 EXIT 0，而不必真的收下 quiz artifact。spec 没有堵住这条。

## 2. 其余条款（不把 FAIL 扩大成这些）

Gap 仍是 gap，这一点 spec 写了，不是本 FAIL 的原因：

- harness L8：`GAP-UC025-NEG-01`（stays **OPEN** · H nail `c100f22`）
- harness L9：row stays **gap**
- stub L23：`stays **OPEN**` · `UC-E2E-025` stays gap · `Do not claim UC-025 closed`
- slice L11：`GAP-UC025-NEG-01` stays OPEN. Row stays gap.

没有把行写成 covered。没有指示把 EXIT 1 改记成 0。没有把本 docs commit 说成产品修复。harness L3：`this commit is not coding authorization`。L11：`Ban SSOT edit`。L28：

> Do not edit the UC-018 row or the UC-052 row. UC-052 stays **partial**. Do not flip UC-018.

本 diff 没有矩阵、backlog、checklist，也没有 UC-018 / UC-052 行。

没有声称接线已经存在。harness L18：

> Interview begin does not take a quiz artifact and does not throw a stale-quiz HttpException (`acceptsQuiz=false` · `realStaleReject=false`).

抽查同一 SHA 产品（未跑 prove）：

- `apps/api/src/modules/interview/interview.controller.ts` L22 `begin(@Param('id') id, @Req() req, @Headers('resume-id') resumeId)` — 签名无 quiz artifact
- `apps/api/src/modules/interview/interview.service.ts` L178 `begin(principal, id, resumeId, requestId?)` — 同样无 quiz 参数
- 矩阵 `e2e-requirement-coverage-matrix.md` L125：`UC-E2E-025` 仍是 **gap / gap / gap / blind**，NEG 列写 EXIT 1、GAP-UC025-NEG-01 OPEN、Ban wash-green、do not write covered。本 diff 没改这一行。

销钉未翻：harness L4 / stub 表 L14–L21 · haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503。

## 3. 抽查（非阻塞，不单独构成 FAIL）

- harness L6 与 stub L7 写 parent tip `58c0031`。`git rev-parse 59bdbdf^` 是 `031ad36`。`58c0031` 是更早的 Line F nail，不是本 commit 的父。产品树相对 `58c0031` 只多了 docs `031ad36`，begin 签名结论不受影响。头上的 parent tip 是错的，不得当成 prove tip。
- harness L21 把 dual 记成 mw-rag-route `04f6d33` 与 mw-e2e-ha `86228ac`，并写明那是 failed-prove honesty nail，不是 close。本审查不重跑 `86228ac`，也不把那次 EXIT 1 洗掉。
- harness L30：旧 pin `pnpm uc025:stale-quiz-expiry:prove` 不是本 miss。证明 L81 同旨。未把旧绿当成 NHP-NEG 通过。
- rag-route stub 仍 PENDING。不代签。

## 4. 条件

本 FAIL 不授权编码，不授权改证明去换 EXIT 0，不授权改矩阵。若重开 REQUEST，至少要补上并保持：

1. `pnpm uc025:nhp-neg:prove` 在 begin 真的收下 quiz artifact 且真的抛 stale-quiz HttpException 之前，保持 EXIT 1。两个布尔必须来自该产品行为，禁止把 stub / 正则 / 布尔翻成 true。
2. 即便将来诚实 EXIT 0，在该产品行为落地并另有证据之前，行仍是 gap，不得 covered，不得 SSOT/矩阵翻转。EXIT 1 不得洗成 0。
3. 不得改 UC-018 行或 UC-052 行。UC-052 保持 partial。不得翻 UC-018。
4. 销钉保持：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503。
5. alone ≠ dual。本文件不是 `mw-rag-route` 的签名。docs 变更不是产品修复。

## 5. 阻塞

阻塞：spec 没有写明 NEG prove 保持 EXIT 1，直到 `acceptsQuiz` 与 `realStaleReject` 都是真产品接线，而不是 stub 翻真。L26 把 flag 变真写成 spec 的结果，又没有锁住证明与退出码。

Verdict: FAIL

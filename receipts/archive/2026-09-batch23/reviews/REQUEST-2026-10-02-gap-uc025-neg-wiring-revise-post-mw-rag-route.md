# REQUEST — **GAP-UC025-NEG-01 wiring revise** · post-prove · mw-rag-route

**Status**: post-prove · 2026-10-02 (~22:35 PT)
**Expert**: `mw-rag-route` · alone ≠ dual · 不代签 peer · 不 nail
**审查对象**: nail `e57d0cc` / `e57d0cc4e960a5bc25fdd32254e1de86c01aefdc` · `post_pre_exec_dual_pass`
**origin tip**: `3811cf1` / `3811cf1b47d3c3a939c2077b9c7386ab036069e6`（`review(e2e): flake oneshot post-prove FAIL @0da63bf`，不是本刀）。`e57d0cc` 是该 tip 的祖先。tip 相对 nail 只多这一份无关 review，没有改 harness、slice、证明或矩阵。
**预执行半**: 本角色 `80bf022` / `80bf022fdf9f3ab48cb523a788d86c3bcb30993e`（`reviews/REQUEST-2026-10-02-gap-uc025-neg-wiring-revise-mw-rag-route.md`）。那是 pre-exec，不是本 post。peer 预执行 `5403c2b` 不代签。
**保留的 FAIL**: `6fe3bfd` / `6fe3bfd62a15e3ea3396c3e506d7123969f20f95` 仍在历史里，`git cat-file -t` 为 commit，末行仍是 `Verdict: FAIL`。本收据不改那个文件。

## 实际命令

`node apps/api/test/uc-e2e-025-nhp-neg.proof.mjs`（`pnpm uc025:nhp-neg:prove`）**EXIT 1**。stdout：`acceptsQuiz=false` `realStaleReject=false`，`GAP-UC025-NEG-01`，`ROW_STILL_GAP`。证明 blob `0e4d10d9f92f9e7f3905b43f1aeb49180a534991` 在 `e57d0cc` 与 tip 相同。未跑 `pnpm uc025:stale-quiz-expiry:prove`。

## 事实

`git show --stat e57d0cc` 只有两份 docs：`ai-docs/delivery/harness/gap-uc025-neg-product-wiring.md`、`ai-docs/delivery/gap-uc025-neg-product-wiring.slice.md`。没有产品代码，没有 `apps/api/test/uc-e2e-025-nhp-neg.proof.mjs`，没有 evaluator，没有矩阵 / checklist / backlog。

门锁还在：

- harness `:31` 与 `:71`：`pnpm uc025:nhp-neg:prove` 保持 EXIT 1，直到 `acceptsQuiz` 与 `realStaleReject` 都是真接线，不是 stub，也不是把布尔翻成 true。
- harness `:33-35`、`:37`：禁止靠翻布尔洗绿；禁止 covered；不授权改证明，不授权实现接线。`:62` 写明本 PASS 不是 coding permission，不是 proof edit，不是 product wiring。
- harness `:36`、`:73`：不是 UC-018 / UC-052。FAULT / BOUND / ADV 不在本 REQUEST。行保持 gap。`GAP-UC025-NEG-01` 保持 OPEN。
- slice `:7`、`:11`、`:27`、`:31-33` 同旨。
- 矩阵 `e2e-requirement-coverage-matrix.md:125`：`UC-E2E-025` 仍是 **gap / gap / gap / blind**，NEG 列仍写 EXIT 1、未接线、禁止写 covered。本 nail 不改这一行。
- pins harness `:56`、`:75`：NOT_HA、releaseEvidence=false、claimProductionHA=false、coveredCount=8、gR45Closed=true、ms3EqualsR4Closed=false、DELETE=503、PG-retained。

上文 `:43` 仍留着旧状态短语 `draft:awaiting_pre_exec_dual`，`:49-50` 的 stub 表仍写 PENDING。nail `:77` 说除状态短语外修订正文保留。这不是新的编码授权，也不改门锁。

## 条件

1. 在 begin 真的收下 quiz 工件并抛出 stale-quiz HttpException 之前，`pnpm uc025:nhp-neg:prove` 必须保持 EXIT 1。禁止改证明或翻布尔洗绿。
2. 行保持 gap/blind。FAULT / BOUND / ADV 保持 not_run。不得写 covered。不得把旧 `uc025:stale-quiz-expiry:prove` EXIT 0 算进本缺口。
3. 不改 UC-018 / UC-052。UC-018 与 §1.1 保持 partial。
4. `6fe3bfd` 继续保留。`80bf022` 只是预执行半。本 post 不代签 `5403c2b`。本 PASS 不授权编码。
5. 本 PASS ≠ coding ≠ covered ≠ nail ≠ HA。alone ≠ dual。

Verdict: PASS

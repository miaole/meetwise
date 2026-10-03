# REQUEST — **UC-018 flip-ban honesty** · post-prove · mw-rag-route

**Status**: post-prove · 2026-10-02 (~22:22 PT)
**Expert**: `mw-rag-route` · alone ≠ dual · 不代签 peer · 不 nail
**审查对象**: nail `ad37bbb` / `ad37bbb3115e5836f79c9b2c4dde0420e250de61`
**与 origin 的关系**: 审查时该 SHA 是 origin 祖先。抽查跑在随后的 tip 工作树 `5372c39`。`scripts/lib/uc-covered-evaluator.mjs` blob `ec62c4c247a8add58777d17b10284ae5bfab5f43` 在 `0807d27`、`ad37bbb`、`3ee28d3`、`5372c39` 相同。历史 UI.json blob `4921edaafb2c2960bcb930367581689d6ef4b814` 在 `ad37bbb` 与该 tip 相同。
**前判**: 预执行 PASS `83fd6d0` / `83fd6d0edb7ea12ba979bbab776344674c64c590`。本文件是新收据，不改那一份。

## 实际命令

- `node scripts/eval-harness-matrix-cite.proof.mjs` **EXIT 0**。输出含 `pins canHonestlyFlip=false`、`matrix: UC-E2E-018 is partial (not covered)`、`UC-018 equality: **partial**`。本绿 ≠ 翻转，≠ HA。
- 未跑 `pnpm uc018:covered-criterion:prove`。该命令会复制收据到临时目录，不是本 nail 点名的证明。本 nail 未改 evaluator，用 blob 与源码抽查代替。

## 事实

`git show --stat ad37bbb` 只有五份 docs：矩阵、checklist、backlog、harness、slice。**没有** `scripts/lib/uc-covered-evaluator.mjs`，没有 flip 逻辑，没有历史 UI.json。

- harness `:53`：`canHonestlyFlip` stays false，coveredCount=8，UC-018 与 §1.1 stay partial。`:55`：禁止编辑 evaluator；禁止把 `ai-docs/delivery/receipts/uc018-receipt-backfill/UI.json` 在 `e88d386` 的 exit 1 改成 0。`:44`：本 PASS 不是日后翻转刀的 dual，不授权 flip。
- 矩阵 `e2e-requirement-coverage-matrix.md:123`：`UC-E2E-018` 仍是 **partial**（FAULT case-only）。文末 D' 注只追加，不改该行。
- 历史 UI.json 在 `ad37bbb`：`exit` = 1，`exits["uc018:ui:prove"]` = 1，`targetSha` = `e88d386ea946918668d8e073edc7f33521fe33d9`，`waitingUser` = `MISSING-EVIDENCE`，`haStatus` = NOT_HA，`coveredCountRetained` = 8。没有被洗成 0。
- evaluator `evaluate()` `:282-288` 不是常量 false：六列都 meet 且 §1.1 为 covered 时真分支可达。这是既有 criterion 形状，本 nail 没改它。真实矩阵行仍是 partial，cite prove 仍钉 `canHonestlyFlip=false`。本刀没有把翻转结果变成 true，也没有改 coveredCount。

## 条件

1. `canHonestlyFlip` 对真实 UC-018 保持 false。coveredCount 保持 8。禁止编辑 `scripts/lib/uc-covered-evaluator.mjs` 来制造翻转。
2. 禁止把历史 `receipts/uc018-receipt-backfill/UI.json` 的 exit 1 洗成 0。
3. UC-018 与 §1.1 保持 partial。以后的翻转刀没有新的 dual 仍不能 flip。本 PASS 不是那次 dual，不授权编码翻转。
4. pins：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · gR45Closed=true · ms3EqualsR4Closed=false · DELETE=503 · PG-retained。本 PASS ≠ coding ≠ covered ≠ nail ≠ HA。alone ≠ dual。不代签 peer。

Verdict: PASS

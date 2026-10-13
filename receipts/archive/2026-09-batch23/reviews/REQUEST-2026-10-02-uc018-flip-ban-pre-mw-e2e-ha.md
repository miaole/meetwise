# 审查 — UC-018 flip-ban honesty · pre-exec · mw-e2e-ha

**角色**: `mw-e2e-ha`（证据诚实 · 对抗）· **不代签** `mw-rag-route` · **不代签** `mw-privacy-int`
**轮次**: Line D' PRE-EXEC · docs-only · 未跑 prove · 未起 Postgres · 未改产品代码 · 未发 live/model
**审的 REQUEST**: `98b951e` / `98b951e73c564c3b03bc175789cffe0559538186`
**父提交（`git rev-parse 98b951e^`）**: `9a644bd` / `9a644bd360c5b78f66240d8524e6502ef178fa80`
**本轮 diff**（`git diff-tree --name-only -r 98b951e`）仅四份 docs：
- `ai-docs/delivery/harness/uc018-flip-ban-honesty.md`
- `ai-docs/delivery/uc018-flip-ban-honesty.slice.md`
- `ai-docs/delivery/reviews/REQUEST-2026-10-02-uc018-flip-ban-honesty-mw-e2e-ha.md`
- `ai-docs/delivery/reviews/REQUEST-2026-10-02-uc018-flip-ban-honesty-mw-rag-route.md`
**docs-only**: **yes**（无 `uc-covered-evaluator.mjs` · 无 gatherer · 无矩阵）

alone ≠ dual。本 PASS ≠ coding authorization ≠ flip ≠ covered ≠ HA ≠ `mw-rag-route` 的签名。stub 仍 PENDING。

---

## 1. 禁止 covered flip，且 `canHonestlyFlip` 保持 false — 通过

`git show 98b951e:ai-docs/delivery/harness/uc018-flip-ban-honesty.md`

L3：`Ban a flip · Ban editing the evaluator · this commit is not coding authorization`

L16：

> A flip is still banned. `canHonestlyFlip=false`. UC-018 and §1.1 stay **partial**. coveredCount=**8**. Ban invent covered.

L25–L28：

> This REQUEST does not authorize a flip.
> This REQUEST does not edit the evaluator.
> Ban SSOT edits: matrix, backlog, checklist.
> Do not write covered as a status of UC-018.

slice L7：`Ban flip · Ban evaluator edit`。slice L11：`a UC-018 flip is still banned. canHonestlyFlip=false. ... coveredCount=8. This REQUEST does not authorize a flip and does not edit the evaluator.`

stub L23：`A flip is still banned. canHonestlyFlip=false. This stub does not authorize a flip and does not edit the evaluator.`

L17 后半把禁令落到文件：

> This REQUEST does not edit `scripts/lib/uc-covered-evaluator.mjs` and does not authorize a flip.

没有授权改 evaluator，没有授权改 `canHonestlyFlip` 的计算或强制 false，没有授权 coveredCount 变化。coveredCount 保持 8。

L17 前半引用既有 criterion：日后另一把 flip 刀必须用能返回 `true` 的可计算六列 evaluator，否则那把刀失败；并写 `b29c191` constant-false 已退役、reassess 改调 evaluator，而真实 UC-018 结果仍是 `canHonestlyFlip=false`。这是转述条件，不是本 REQUEST 去改 evaluator 或授权 flip。不得把它读成「可以改 evaluator 让真路径变 true」。

## 2. 抽查（非阻塞）

同一 SHA，本 diff 未改这些文件：

- `scripts/lib/uc-covered-evaluator.mjs` L282–L288 先计算 `canHonestlyFlip`；L291–L292 与 L312 在 `reasons.length > 0` 时把它压成 false。真实 UC-018 不是空 reasons 的真路径。本 REQUEST 不改这段。
- `scripts/lib/uc018-receipt-backfill-facts.mjs` L34–L41：`source=static-doc` 不是运行时观察，`unwrapStackValue` 返回 undefined。`SOLE.json` 的 `stack.postgresSaver` 是 `{value: true, source: "static-doc"}`。矩阵 L123 仍写 `STUB-STACK remains because source=static-doc is not a runtime observation`。本 REQUEST 没有授权改 gatherer，把 static-doc 算成 runtime。
- `ai-docs/delivery/receipts/uc018-receipt-backfill/UI.json`：`exit=1`，`gitSha=e88d386ea946918668d8e073edc7f33521fe33d9`，`exits['uc018:ui:prove']=1`。tip 收据 `uc018-ui-tip-rerun/UI.json`：`exit=0`，`gitSha=057701c…`，`evidenceOfRecord=false`，disclosure 写明 e88d386 仍是 exit=1、`web_not_ready`、不是改写。与 harness L20 一致。历史 exit 1 没有被洗掉。
- harness L21：`Do not flip UC-052. UC-052 stays **partial**.` 本 diff 不改 UC-052 行。
- 销钉 harness L4 / stub 表 L14–L21：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503。
- harness L6 / stub L7 写 parent tip `58c0031`。实际父提交是 `9a644bd`。不是 prove tip。引用按 `98b951e` 树核对。
- rag-route stub 仍 PENDING。不代签。

## 3. 条件

1. docs-only。本 PASS 不是编码授权，不是 flip，不是 covered，不是 nail，不是 HA。
2. 不得 flip UC-018 或 §1.1。不得把 UC-018 写成 covered。`canHonestlyFlip` 保持 false。不得改 `scripts/lib/uc-covered-evaluator.mjs`，包括不得拿掉「先算再在 reasons 非空时压成 false」。
3. 不得改 gatherer / `unwrapStackValue`，使 `source=static-doc` 的 `postgresSaver` 被当成 runtime。STUB-STACK 保持。SOLE 的 static-doc 不是栈已满足。
4. coveredCount 保持 8。历史 `uc018-receipt-backfill/UI.json` 保持 exit 1 @ `e88d386`。tip EXIT 0 @ `057701c` 不是证据、不是 covered。
5. 不得改矩阵 / backlog / checklist。不得 flip UC-052。UC-052 保持 partial。
6. 销钉保持：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503。
7. alone ≠ dual。本文件不是 `mw-rag-route` 的签名。L17 的「日后 flip 刀」不是本 PASS 的授权。

## 4. 阻塞

无阻塞。

Verdict: PASS

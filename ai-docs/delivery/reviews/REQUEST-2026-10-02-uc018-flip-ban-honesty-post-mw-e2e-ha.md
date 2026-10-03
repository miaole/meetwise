# 审查 — UC-018 flip-ban honesty · post-prove · mw-e2e-ha

**角色**: `mw-e2e-ha`（证据诚实 · 对抗）· **不代签** `mw-rag-route` · **不代签** `mw-privacy-int`
**轮次**: Line D' POST-PROVE · 对照 nail · 未改产品代码 · 未起 Docker / Postgres · 未发 model
**Nail**: `ad37bbb` / `ad37bbb3115e5836f79c9b2c4dde0420e250de61` · `docs(delivery): NAIL UC-018 flip-ban honesty post_pre_exec_dual_pass` · 2026-10-02 22:16:12 PT
**抽查 tip**: `3ee28d3` / `3ee28d376a3031fcb064d3b7ca05e103d799eb81`（nail 的后裔；本审查落笔时 origin 已多一笔无关 review `5372c39`，下列 evaluator / gatherer / facts / `UI.json` / `SOLE.json` / harness / 矩阵 blob 与 `3ee28d3` 相同）
**预审**: mw-e2e-ha `5cf384d` / `5cf384df1e81929ff95d999157667932fb2c29ce` · mw-rag-route `83fd6d0` / `83fd6d0edb7ea12ba979bbab776344674c64c590` · 两者都是 `ad37bbb` 的祖先 · REQUEST `98b951e` / `98b951e73c564c3b03bc175789cffe0559538186` 也是
**本 nail diff**（`git diff-tree --name-status -r ad37bbb`）只有五份 docs，无 evaluator、无 gatherer、无历史 `UI.json`：
- `ai-docs/delivery/e2e-requirement-coverage-matrix.md`
- `ai-docs/delivery/execution-master-checklist.md`
- `ai-docs/delivery/gap-bug-backlog.md`
- `ai-docs/delivery/harness/uc018-flip-ban-honesty.md`
- `ai-docs/delivery/uc018-flip-ban-honesty.slice.md`

alone ≠ dual。本 PASS ≠ coding ≠ covered ≠ nail ≠ HA。`post_pre_exec_dual_pass` 不是未来 flip 刀的 dual。

---

## 1. `canHonestlyFlip` 仍为 false，且 reasons 非空时先算再压 false — 通过

`git show 3ee28d3:ai-docs/delivery/harness/uc018-flip-ban-honesty.md`

- L53：`canHonestlyFlip` stays false. coveredCount=8. UC-018 stays **partial**. §1.1 stays **partial**.
- L55：Ban editing `scripts/lib/uc-covered-evaluator.mjs`. Ban changing historical UI.json exit 1 at `e88d386` into 0. Do not write covered. Do not flip UC-052.
- L57 / L61：销钉与 `canHonestlyFlip=false` · STOP
- L44：This PASS is not a future flip-knife dual. It does not authorize a flip.

slice `uc018-flip-ban-honesty.slice.md` L28 同义：`canHonestlyFlip` stays false. coveredCount=8. Ban editing the evaluator.

矩阵 L355、checklist L562、backlog 同段都写 `canHonestlyFlip` stays false，没有写成 true。

evaluator 在 tip 未改（`ad37bbb^`、`ad37bbb`、`3ee28d3` blob 同为 `ec62c4c247a8add58777d17b10284ae5bfab5f43`）。`scripts/lib/uc-covered-evaluator.mjs`：

- L282–L288 先计算 `canHonestlyFlip`（六列 + §1.1 + openGaps 空 + status covered + reasons 空）
- L291–L292：`reasons.length > 0` 时 `canHonestlyFlip = false`
- L312：补 reasons 之后再次 `if (reasons.length > 0) canHonestlyFlip = false`

本 nail 没有改这段去允许 flip。包内声明值是 false，不是 true。

## 2. SOLE `postgresSaver.source` 仍是 static-doc，unwrap 仍返回 undefined — 通过

`scripts/lib/uc018-receipt-backfill-facts.mjs`（`ad37bbb^` / `ad37bbb` / `3ee28d3` blob 同为 `3517720d44e294a04ebb21de68f17af82c7436e5`）：

- L34–L41：`source === 'static-doc'` 时 `unwrapStackValue` 返回 `undefined`
- L124–L125：SOLE 日志命中 PostgresSaver 标记时 `stack.postgresSaver = stackFact(true, 'static-doc', …)`；否则 L133 `unobservedFact()`

`ai-docs/delivery/receipts/uc018-receipt-backfill/SOLE.json` L77–L79：`postgresSaver.value=true`，`source` 为 `"static-doc"`。同目录其余收据的 `postgresSaver.source` 是 `unobserved`，不是把 static-doc 洗成 log-parse / docker-inspect。gatherer `scripts/lib/uc-covered-real-gatherer.mjs` blob `3971e436ed2ee4ac2145f7fbaeab994f4dc5b8b9` 三处相同，L247 仍 `unwrapStackValue(receipt.stack.postgresSaver)`。矩阵 L123 仍写 STUB-STACK，因为 source=static-doc 不是运行时观察。

## 3. 历史 UI@`e88d386` 仍是 exit 1 / web_not_ready — 通过

`ai-docs/delivery/receipts/uc018-receipt-backfill/UI.json` blob `4921edaafb2c2960bcb930367581689d6ef4b814` 在 `ad37bbb^`、`ad37bbb`、`3ee28d3` 相同。本 nail 没有改它，更没有把 exit 1 改成 0。

- L7 `targetSha` / L10 `gitSha`：`e88d386ea946918668d8e073edc7f33521fe33d9`
- L12 `"exit": 1`；`exits["uc018:ui:prove"]=1`
- `coveredCountRetained`: 8
- 日志 `ai-docs/delivery/receipts/uc018-receipt-backfill/logs/UI-e88d386.log` L53 与 L59：`E2E_FAILURE class=frontend code=web_not_ready`

另册 tip 收据 `ai-docs/delivery/receipts/uc018-ui-tip-rerun/UI.json` L15 `exit` 0 只属于 `057701c`。其 L25–L28 仍记历史 `e88d386` 的 `exit` 1、`code` `web_not_ready`。L64 disclosure 写明 e88d386 的 UI.json 保持 exit=1、不是改写、不是 covered。没有把历史记录洗成 exit 0。

## 4. coveredCount 仍是 8 — 通过

harness L4 / L16 / L39 / L53 / L57、slice、矩阵 L355、checklist L562、backlog 同段、以及 `UI.json` 的 `coveredCountRetained` 都是 8。本 nail 的 diff 只追加「coveredCount=8」，没有把计数改成别的数。UC-018 与 §1.1 保持 **partial**。UC-052 保持 **partial**。没有写 covered。

## 5. 销钉

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503

## 6. 命令

CMD|EXIT: 未重跑 `pnpm eval-harness-matrix-cite:prove`。checklist L566 写明本 nail 不预称该命令的 post-commit EXIT。该 EXIT 不是本轮新跑的。只读核对 `git show` / `git diff-tree` / `git rev-parse` / `git merge-base --is-ancestor`，EXIT 0。未起 Docker，未起 Postgres。

## 7. 条件

1. 本 PASS 不是 flip 授权，不是 coding，不是 covered，不是 nail，不是 HA。alone ≠ dual。不代签 `mw-rag-route`。
2. `canHonestlyFlip` 保持 false。不得改 `scripts/lib/uc-covered-evaluator.mjs`，包括不得拿掉 L282–L288 先算、L291–L292 与 L312 在 reasons 非空时压成 false。
3. 不得改 gatherer 或 `unwrapStackValue`，使 `source=static-doc` 的 SOLE `postgresSaver` 被当成 runtime。STUB-STACK 保持。
4. coveredCount 保持 8。历史 `uc018-receipt-backfill/UI.json` 保持 exit 1 @ `e88d386`，`web_not_ready` 不得洗掉。tip EXIT 0 @ `057701c` 不是证据、不是 covered。
5. 不得 flip UC-018、§1.1 或 UC-052。不得把任一行写成 covered。
6. 销钉保持：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503。

## 8. 阻塞

无阻塞。

Verdict: PASS

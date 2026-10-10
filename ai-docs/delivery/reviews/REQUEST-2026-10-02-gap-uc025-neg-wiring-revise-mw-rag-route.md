# REQUEST — **GAP-UC025-NEG-01 wiring revise** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（revised stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Knife**: `harness/gap-uc025-neg-product-wiring.md` · slice `gap-uc025-neg-product-wiring.slice.md`
**Revision base**: `ad37bbb` / `ad37bbb3115e5836f79c9b2c4dde0420e250de61`（not a prove tip）
**Date**: 2026-10-02 (~22:30 PT)

## What failed last time（not a dual）

- mw-e2e-ha PRE-EXEC **FAIL** `6fe3bfd` / `6fe3bfd62a15e3ea3396c3e506d7123969f20f95` · `reviews/REQUEST-2026-10-02-uc025-wiring-spec-pre-mw-e2e-ha.md`（kept · not overwritten）.
- mw-rag-route **PASS** `b191881` / `b191881c4474c2b3e34a243d69ccf9da31dbafd0` · `reviews/REQUEST-2026-10-02-gap-uc025-neg-product-wiring-mw-rag-route.md`（kept · not overwritten）. Alone is not a dual. Overall **not pass**.

## Lock to review

`pnpm uc025:nhp-neg:prove` / `uc-e2e-025-nhp-neg` **STAYS EXIT 1** until `acceptsQuiz` and `realStaleReject` are both real product wiring, not a stub and not a boolean flipped to true. Current interview begin has no quiz artifact. The proof exits 0 when both regexes hit, so the spec forbids washing green by flipping those booleans, and locks EXIT 1 until the real wiring exists.

Ban wash-green. Ban covered. Ban turning red into green. Ban writing SSOT as covered. Not UC-018. Not UC-052. UC-E2E-025 row stays **gap**. `GAP-UC025-NEG-01` stays **OPEN**.

This stub does not authorize editing the proof and does not authorize implementing the product wiring. Implementer does not self-approve.

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |

Dual PASS ≠ coding ≠ nail ≠ covered · No proof edit and no product wiring is authorized by this stub.

---

*Stub · revised REQUEST · awaiting expert pre-exec dual · STOP*


---

## 预执行审 · 修订门锁 · `3ee28d3` · 2026-10-02 (~22:22 PT)

**Expert**: `mw-rag-route` · alone ≠ dual · 不代签 peer · 只追加 stub · 不 nail
**审查对象**: `3ee28d3` / `3ee28d376a3031fcb064d3b7ca05e103d799eb81`（修订 REQUEST，不是产品接线的 post-prove）
**与 origin 的关系**: 请求发出时它是 tip。落笔时 origin 已到 `5372c39`，该提交只多一份无关 review。本修订四文件自 `3ee28d3` 起未再改。按 `3ee28d3` 审。
**保留的 FAIL**: mw-e2e-ha `6fe3bfd` / `6fe3bfd62a15e3ea3396c3e506d7123969f20f95`，文件 `reviews/REQUEST-2026-10-02-uc025-wiring-spec-pre-mw-e2e-ha.md`，末行 `Verdict: FAIL`。不删、不改。
**旧 PASS 不是本修订的 dual**: `b191881` / `b191881c4474c2b3e34a243d69ccf9da31dbafd0`。alone ≠ dual。总评当时不是 pass。

## 实际命令

- `node apps/api/test/uc-e2e-025-nhp-neg.proof.mjs`（`pnpm uc025:nhp-neg:prove`）**EXIT 1**。stdout：`acceptsQuiz=false` `realStaleReject=false`，`GAP-UC025-NEG-01`，`ROW_STILL_GAP`。证明脚本 blob `0e4d10d9f92f9e7f3905b43f1aeb49180a534991` 在 `3ee28d3` 与跑证明的 tip 相同。
- 未跑 `pnpm uc025:stale-quiz-expiry:prove`。修订把它标成另一枚 mark-red pin，不是本缺口。

## 门锁（计划本身）

修订替换了被 `6fe3bfd` 否掉的「later dual PASS 之后 flag 不再是 unwired false pair」那句。

- harness `:31`：`pnpm uc025:nhp-neg:prove` **保持 EXIT 1**，直到 `acceptsQuiz` 与 `realStaleReject` 都是真产品接线，不是 stub，也不是把布尔翻成 true。
- harness `:33-34`：证明在两条正则命中时会 EXIT 0；因此禁止靠翻布尔洗绿。真接线是 begin 真的收下 quiz 工件并且真的拒绝过期 quiz。正则命中、stub、布尔设 true 都不是接线。
- harness `:35`：禁止洗绿、禁止 covered、禁止把红写成绿、禁止把 SSOT 写成 covered。即便日后诚实 EXIT 0，仍不是 covered，仍不是 SSOT 翻转。
- harness `:36`：不是 UC-018 / UC-052。FAULT / BOUND / ADV 不在本 REQUEST。
- harness `:37`：本修订不授权改证明（点名 `apps/api/test/uc-e2e-025-nhp-neg.proof.mjs`），不授权实现产品接线，不跑该 prove，不加命令。旧 `uc025:stale-quiz-expiry:prove` 不是本 miss。
- slice `:7`、`:11` 同旨。矩阵 `e2e-requirement-coverage-matrix.md:125` 的 `UC-E2E-025` 仍是 gap / gap / gap / blind，NEG 列仍写 EXIT 1。本 diff 不改该行。
- diff 四文件：修订后的 harness、slice、两份新 stub。没有产品代码，没有证明脚本。

计划守住门锁。它没有授权改证明，没有叫人把 prove 改成 EXIT 0，也没有把行抬成 covered。

## 条件

1. 在 begin 真的收下 quiz 工件并抛出 stale-quiz HttpException 之前，`pnpm uc025:nhp-neg:prove` 必须保持 EXIT 1。禁止靠翻 `acceptsQuiz` / `realStaleReject` 或改证明脚本洗绿。
2. 行保持 gap/blind。FAULT / BOUND / ADV 保持 not_run。GAP-UC025-NEG-01 保持 OPEN。不得写 covered。
3. 不改 UC-018 / UC-052。不得把旧 `uc025:stale-quiz-expiry:prove` EXIT 0 算进本缺口。
4. `6fe3bfd` 的 FAIL 继续保留。`b191881` 单独不算 dual。本 PASS 不授权编码、不授权改证明。
5. pins 保持 NOT_HA、releaseEvidence=false、claimProductionHA=false、coveredCount=8、gR45Closed=true、ms3EqualsR4Closed=false、DELETE=503、PG-retained。本 PASS ≠ coding ≠ covered ≠ nail ≠ HA。alone ≠ dual。不代签 peer。

Verdict: PASS

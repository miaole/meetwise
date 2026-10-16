# Review — GAP-UC025-NEG-01 wiring revise · post-prove docs nail · mw-e2e-ha

**Expert**: `mw-e2e-ha` only. 不代签 `mw-rag-route`。alone ≠ dual。
**审查对象**: docs nail `e57d0cc` / `e57d0cc4e960a5bc25fdd32254e1de86c01aefdc`（parent `0652a082c25228d85d8e4f21da4934ba41b14f50`）。
**标签**: 他们使用的 `post_pre_exec_dual_pass` **不是证据**。本审不把该标签当成 `pnpm uc025:nhp-neg:prove` 已绿。
**本审前的 pre-exec PASS**: `5403c2b` / `5403c2b678d60e031ba235f989bd33b25a5e866a`，对象是 harness `ai-docs/delivery/harness/gap-uc025-neg-product-wiring.md`（当时 tip `3ee28d3`）。
**本审不做**: 不跑 `pnpm uc025:nhp-neg:prove`，不启 Postgres，不改证明，不改产品。EXIT 1 仍是真实接线出现之前的要求状态。本 PASS ≠ coding ≠ covered ≠ nail ≠ HA。本 PASS 不授权接线。

## 门锁（仍在，未削弱）

引用 `e57d0cc` 上的 `ai-docs/delivery/harness/gap-uc025-neg-product-wiring.md`。行号相对已接受的 pre-exec 文本未移动。

- L31: `` `pnpm uc025:nhp-neg:prove` (`uc-e2e-025-nhp-neg`) **STAYS EXIT 1** until `acceptsQuiz` and `realStaleReject` are both real product wiring, not a stub and not a boolean flipped to true. ``
- L34: `Real wiring means interview begin actually accepts a quiz artifact and a stale quiz is actually rejected. A regex hit, a stub, or a boolean set to true is not that wiring.`
- L27: 仍点名 FAIL `6fe3bfd` / `6fe3bfd62a15e3ea3396c3e506d7123969f20f95`，并写明旧的 “later dual PASS” 措辞 **not the lock**。
- L3: 状态短语改成了 `post_pre_exec_dual_pass`，但同一句仍写 `this PASS is not coding permission, not a proof edit, and not product wiring`。不授权证明编辑，不授权产品接线。
- L37: `This revised REQUEST does not authorize editing the proof (including apps/api/test/uc-e2e-025-nhp-neg.proof.mjs). It does not authorize implementing the product wiring. It does not run pnpm uc025:nhp-neg:prove.`
- L42: `mw-rag-route b191881 / b191881c4474c2b3e34a243d69ccf9da31dbafd0 was a PASS but alone is not a dual. Overall not pass.`
- L71 复述同一把锁: `Lock, unchanged: pnpm uc025:nhp-neg:prove STAYS EXIT 1 until acceptsQuiz and realStaleReject are both real product wiring, not a stub and not a boolean flipped to true.`
- L77: `A green cite does not wire the product and does not turn EXIT 1 into 0.`

slice 同锁仍在 `ai-docs/delivery/gap-uc025-neg-product-wiring.slice.md` 修订段（`STAYS EXIT 1` until real wiring），并写明 `b191881` PASS alone is not a dual。

## 本 nail 碰到的文件

`git diff-tree --name-status -r e57d0cc4e960a5bc25fdd32254e1de86c01aefdc` 只有：

- `M ai-docs/delivery/gap-uc025-neg-product-wiring.slice.md`
- `M ai-docs/delivery/harness/gap-uc025-neg-product-wiring.md`

证明是否被改: **no**（`apps/api/test/uc-e2e-025-nhp-neg.proof.mjs` 不在本提交）。
产品 begin/quiz 接线是否被改: **no**（无产品路径）。
UC-018 / UC-052: 未改。文本仍是 Not UC-018. Not UC-052. UC-052 stays partial. Do not flip UC-018（harness L36、L73）。

## 行状态与 wash-green

- 行仍是 **gap**，不是 covered。Harness L1 标题 `row stays gap`；L10 `row stays gap`；L21 `The row stays gap`；L56 `row stays gap`；L73 `The UC-E2E-025 row stays gap`。`GAP-UC025-NEG-01` stays **OPEN**（L9、L73）。
- wash-green 仍被禁止。L23 `Ban wash-green. Do not write covered.` L35 `Ban wash-green. Ban covered. Ban turning red into green. Ban writing SSOT as covered.` L73 `Ban wash-green. Ban covered.`
- `post_pre_exec_dual_pass` 被用作 docs status nail 的短语，并被同一段否定为接线或 EXIT 0。没有把它写成 prove 已绿。

## alone ≠ dual

- 旧的单独 PASS `b191881` 在 L42 / L52 仍是 alone is not a dual。slice 修订段同样写 overall not pass。
- 新段 L64–L67 把 `80bf022` / `80bf022fdf9f3ab48cb523a788d86c3bcb30993e` 与 `5403c2b` / `5403c2b678d60e031ba235f989bd33b25a5e866a` **并列为** 对 `3ee28d3` 的 pre-exec，而不是把 `80bf022` 单独当成 dual。
- 抽查（不代签）: `80bf022` 的 review 末行是 PASS，对象是 `3ee28d3`，且该文件自己写 alone ≠ dual、不代签 peer。本审不签署 `mw-rag-route`。
- 抽查: `5403c2b` 末行是 PASS。那是本专家先前的 pre-exec，不是本 post-prove，也不是 prove 绿灯。

## 阻塞

无阻塞

抽查: 门锁 L31/L34/L37 与 pre-exec 接受文本逐字仍在；diff 仅两份 docs；pins 未改；未跑 NEG prove；EXIT 1 未被写成 0。

## 条件

- PASS ≠ coding ≠ covered ≠ nail ≠ HA。本文件不授权实现 `acceptsQuiz` / `realStaleReject`，不授权改证明，不授权把行写成 covered。
- Harness L43 仍写 `Status of this revision: draft:awaiting_pre_exec_dual`。这是「Prior pre-exec is not a dual」段里的残留状态句，不是门锁削弱。当前状态以 L1/L3 与 L60–L77 为准，且那些句子明确 EXIT 1 保持。
- Review stubs 表 L49–L50 仍标 **PENDING**。dual 的引用在追加段 L64–L67，不在这张表。表滞后不是 close，也不是 prove 绿灯。
- 标签 `post_pre_exec_dual_pass` 不是 `uc025:nhp-neg:prove` 的证据。下一次才是真实接线之后的 post-prove dual；本 nail 写明它没有执行那一步。在真实接线之前，要求状态仍是 EXIT 1。
- 不编辑 UC-018，不编辑 UC-052。

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503

Verdict: PASS

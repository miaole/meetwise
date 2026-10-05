# Harness — **GAP-PRIV-AUTHZ-PROVE-FLAKE · rootcause/repro ledger**（Line X · NAIL · **`post_prove_dual_pass`** · flake stays OPEN mitigated/cause-unknown）

**Status**: **`post_prove_dual_pass`**（Line X nail · docs ledger only · L1–L6 retained · POST dual BOTH PASS · **PASS ≠ fixed ≠ closed ≠ root-caused ≠ HA** · Ban claim fixed · Ban forge PROCESS_EXIT · Ban coding product · Ban principal.ts · Ban Meridian · Ban secrets · Ban force-push · Ban closing backlog `:68` · Ban self-approve beyond this authorized nail）

> **REQUEST-era note（historical · retained）**: this file began as REQUEST `draft:awaiting_pre_exec_dual`. Ledger tip **`b3e0f41`** · post dual mw-e2e-ha `424c7f0` + mw-privacy-int `2974d45` BOTH PASS. Lifecycle advanced to **`post_prove_dual_pass`** by Line X nail only. Gap stays **OPEN** mitigated/cause-unknown.
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-05
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`6a79946`** / full `6a79946ae5bb4b2148e0d63d3b7f66d64a1e51df`
**Knife**: **GAP-PRIV-AUTHZ-PROVE-FLAKE rootcause/repro ledger**（docs/harness 可复现账本 ONLY · 不关 gap · 不修根因）
**Gap id**: **`GAP-PRIV-AUTHZ-PROVE-FLAKE`**（backlog `:68` stays **OPEN** · **mitigated/cause-unknown**）
**Experts**: `mw-privacy-int` + `mw-e2e-ha`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban secrets / `.env*` · Ban force-push · Ban push · Ban SSOT edit · Ban coding · **Ban `principal.ts` 产品改写**（本刀不 scope 产品 rewrite）

## 立场（先读）

本刀 = **可复现事实账本 REQUEST**：把已落 oneshot / FAIL / FINAL honesty / teed attempt-2 的 SHA、JSON/log 同意性、两类失败形态钉成一张 ledger，供后续根因刀引用。**不**宣称 fixed / closed / root-caused。**不**跑 prove。**不** forge `PROCESS_EXIT` 到旧 log。未来「从第一字节 tee 的 first-run」若仍需（相对 attempt-1 证据缺陷），**须独立新 REQUEST**（A' FINAL / teed harness 原钉）。

## 既有 oneshot 事实链（必须引用 · 禁止改写 blob）

| 角色 | SHA / 路径 | 事实 |
|------|------------|------|
| prove SHA（attempt-1 跑时 HEAD） | **`5b6e693`** / `5b6e693e5e8b253da6c889a46aee331a8a6f5ccd` | receipt JSON `proveSha` 字段钉此值 |
| receipt commit | **`0da63bf`** / `0da63bf…` | `docs(privacy): … oneshot attempt 1 EXIT 0` |
| e2e-ha post-prove **FAIL** | **`3811cf1`** / `3811cf1b47d3c3a939c2077b9c7386ab036069e6` | JSON `"exit":0` vs log **无** `EXIT=` / **无** `PROCESS_EXIT` / **无** `ELIFECYCLE` → JSON 与 log **不同意**；oneshot 不满足 post-prove |
| FINAL HONEST CLOSE（docs） | **`f3cf84c`** / `f3cf84ccbd6ff0341fe198aa4cadd8cff417e69b` | docs-only · gap stays OPEN · Ban forge PROCESS_EXIT · 未来 teed first-run 须新 REQUEST |
| teed oneshot attempt-2（后继刀已落） | subject `0c0ab16` 链 · log 末行字面 **`PROCESS_EXIT=0`** · JSON `"exit":0` 三角一致 | **单次绿 ≠ 关 flake**；两类历史失败仍在；gap stays OPEN mitigated/cause-unknown |

**attempt-1 同意性缺陷（保留，Ban 补写）**：

- JSON `receipts/gap-priv-authz-prove-flake/oneshot-attempt-1.json`：`"exit": 0`
- log `…/oneshot-attempt-1.log`：成功横幅有，**无**可引用进程退出码行
- **Ban forge `PROCESS_EXIT` onto the old log** · Ban 修改 attempt-1 JSON/log blob

## 根因状态（诚实 · 未钉死）

backlog `:68` 原文两类失败保留：

1. **cold** `ECONNREFUSED 127.0.0.1:33047`（+ `ISOLATED_POSTGRES_OUTPUT_WITHHELD … state_bytes=29`）
2. **warm** SQLSTATE **23505** `interview_pkey`（复用已存在行）

v2 20/20 绿 / teed attempt-2 EXIT=0 **不是**根因、**不是** close。status = **mitigated/cause-unknown** · **OPEN**.

## Ledger 表（本 REQUEST 要钉的可复现面）

| # | 复现项 | 如何引用 | 不得写成 |
|---|--------|----------|----------|
| L1 | attempt-1 JSON/log 不同意 | `0da63bf` + FAIL `3811cf1` + 两文件路径 | 「已补 PROCESS_EXIT」 |
| L2 | prove SHA 锚 | `5b6e693` = JSON `proveSha` | 「prove SHA = receipt SHA」混淆 |
| L3 | FINAL honesty 停刀 | `f3cf84c` | 「gap closed」 |
| L4 | teed attempt-2 三角一致 | log `PROCESS_EXIT=0` + JSON exit 0 + receipt | 「root-caused / fixed」 |
| L5 | 两类失败 class | backlog `:68` cold ECONNREFUSED / warm 23505 | 「单一根因已定位」 |
| L6 | 未来 teed first-run | 须**新 REQUEST** | 「本 ledger 已授权再跑」 |

## prove 方案

**本刀 Ban prove 执行。** 无 CMD。无 attempt。账本是 docs。若双审后协调方要「根因修复刀」或「再跑 teed」，各自新 REQUEST。

## Ban 列表

- Ban coding · Ban prove 执行 · Ban push · Ban force-push · Ban secrets / `.env*`
- **Ban claim fixed / closed / root-caused**
- **Ban forge PROCESS_EXIT** 到 attempt-1 或任何旧 log
- **Ban `principal.ts` / checkpoint-principal 产品改写**（本刀不 scope）
- Ban 改 oneshot-attempt-1.json/log · Ban retry-to-green 叙事 · Ban wash teed 绿成 close
- Ban Meridian · Ban HA cloud buy · Ban SSOT status 翻写 · Ban self-approve · Ban self-nail
- Ban 碰 UC-025 / UC-004 / UC-018 行借刀

## Non-claims

Not fixed · not closed · not root-caused · not a prove · not teed first-run authorization · not product rewrite · not HA · OPEN mitigated/cause-unknown · alone ≠ dual

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · GAP-PRIV-AUTHZ-PROVE-FLAKE stays OPEN · STOP

## Line X ledger 执行（协调方授权 docs-only · retained）

- **PRE dual BOTH PASS**：mw-privacy-int `8f28151` / `8f281511f81f7900b2610218029eb4d1971ed2eb` + mw-e2e-ha `9b8f748` / `9b8f748e2682019e27d5357bad728d2cb330b902`（REQUEST `5773243`）。
- **执行产物**：`receipts/gap-priv-authz-prove-flake/2026-10-05-rootcause-ledger.md`——L1–L6 逐行落证（blob / 行号 / SHA 可达性）+ 失败 class 账（cold ECONNREFUSED ×2 份 log · warm 23505 ×1）+ 全部已记录 attempt EXIT 账 + blob 锚。
- **CMD**：无。**本刀零 prove · 零重跑 · 零 forge**；EXIT 全为引用（attempt-1 JSON 0 vs log 无退出码 → 不同意保留；attempt-2 `PROCESS_EXIT=0` 三角一致 ≠ close；历史 EXIT=1 ×3 保留）。
- **可达性**：`0c0ab16` / `6673042` 本 clone 不可达，以 `606677d` 树内 blobs 为准（PRE e2e-ha C-7）；`9b39a20`（jsonl L29 tip）存在但非分支祖先——如实披露。
- 零产品 · 零 `principal.ts` / `checkpoint-principal.ts` · attempt-1/2 blobs 零漂移。
- Gap stays **OPEN** · **mitigated/cause-unknown** · Not fixed · Not closed · Not root-caused · coveredCount=**8**。

---

## Line X NAIL lifecycle（`post_prove_dual_pass` · 2026-10-05 · additive）

- Lifecycle on this harness/slice/ledger: **`post_prove_dual_pass`**.
- Evidence tip NAILED TO: `b3e0f4172e188f23dbcc34aac0bae82e571a10dc`（docs ledger · **No CMD · no new prove**）.
- POST dual BOTH PASS: mw-e2e-ha `424c7f06f7438a5a83688e5d14e9c25603e8c2e6` + mw-privacy-int `2974d45741d1009c26a36e24a43d051b1fb93a70`.
- Receipt cross-ref: `receipts/gap-priv-authz-prove-flake/2026-10-05-rootcause-ledger.md`.
- **L1–L6 retained** · blob 锚零漂移 · attempt-1 JSON≠log 仍立 · Ban forge PROCESS_EXIT · teed attempt-2 `PROCESS_EXIT=0` 三角一致 ≠ close.
- **CITE_EXIT**: **0**（引用 teed attempt-2 · 非本 nail 新跑 · 非关 flake）。
- **STILL_OPEN**: **GAP-PRIV-AUTHZ-PROVE-FLAKE stays OPEN mitigated/cause-unknown** · Not fixed · Not closed · Not root-caused · canHonestlyFlip=false · UC-052 stays **partial** · coveredCount=**8** · public DELETE=**503**.
- Pins unchanged: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503.
- Zero product · Ban principal.ts · Ban Meridian · Ban secrets · Ban force-push · Ban closing backlog `:68` · Ban HA claim. Sibling Y/W nails stay as written.

---

*Harness · GAP-PRIV-AUTHZ-PROVE-FLAKE rootcause/repro ledger · Line X NAIL · 2026-10-05 · lifecycle post_prove_dual_pass · tip b3e0f41 · post dual 424c7f0+2974d45 PASS · CITE_EXIT 0 · L1–L6 retained · OPEN mitigated/cause-unknown · PASS≠fixed≠HA · releaseEvidence=false · STOP*

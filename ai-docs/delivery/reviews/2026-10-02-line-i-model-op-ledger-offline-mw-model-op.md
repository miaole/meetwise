# PRE-EXEC · mw-model-op · MODEL-OP spend-ledger offline（docs-only）

**Verdict**: **PASS**（docs-only honest open · **不够**关闭账本 · **不够**授权下一刀编码 · **≠** cutover · **≠** MODEL-OP-00 closed）  
**Role**: `mw-model-op`  
**Date**: 2026-10-02 (~21:10 PT)  
**REQUEST tip**: `dfd8443cc9484d776d8fa23adb5c80ed0801b761`  
**Immediate parent**: `a05c48596cb58f2a97cb3eecf52c257223a4fbba`（`docs(e2e): REQUEST UC-E2E-025 NHP`）  
**Stub “parent tip”**: `315870e502210ac54a4068ac33aeb12721a64766` 是祖先，不是本 commit 的父（非 blocker）  
**Branch**: `feat/mysql-schema-skeleton`  
**Kind**: offline docs pre-exec · 本审 **未**跑 live · **未**跑任何 prove（REQUEST **没有**点名可执行脚本）  

**Pins**: `NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained**

---

## 哪本账

本刀正文写的是 **G7 跨进程 NDJSON 跑次封顶账**（`G7_RUN_COST_LEDGER_PATH` / `readG7SharedLedger` / `buildG7ReceiptFields`），**不是** usage/cost/calibration 生产账。

`apps/worker/src/main.ts` 会启动 `runUsageCalibrationReconciler` 与 `runModelInvocationReconciler`，但既有 slice/eval（`model-op-real-reconciler-wiring`）明文 **≠ cutover · ≠ MODEL-OP closed**。本 REQUEST **未**引用那份 eval，也 **未**声称那两条 reconciler 已生产切换。标题里的 “MODEL-OP spend-ledger” 与正文的 G7 封顶文件是**命名并列**，不是把校准账说成已切。

---

## 1. Docs-only

`git show --stat dfd8443` / `git diff --name-status dfd8443^ dfd8443`：**4 个 markdown，+146，无代码 / migration / script**。

| Path |
|------|
| `ai-docs/delivery/harness/model-op-spend-ledger-offline.md` |
| `ai-docs/delivery/model-op-spend-ledger-offline.slice.md` |
| `ai-docs/delivery/reviews/REQUEST-2026-10-02-model-op-spend-ledger-offline-mw-model-op.md` |
| `ai-docs/delivery/reviews/REQUEST-2026-10-02-model-op-spend-ledger-offline-mw-e2e-ha.md` |

**无** eval 文件被本 REQUEST 点名。

## 2. Outbound main chain

本 commit 相对父 **未**改 `packages/ai-runtime`（model-client / invoke / guard / interceptor）、`apps/api`、`apps/worker` main、embed/rerank/voice。Harness 明文禁止改这些路径。Line C FR2 仍 OPEN；本切片没有碰它们。

## 3. Named offline proves

Harness / slice / stub **没有** `pnpm`、`prove:` 或 eval 脚本名。离线计划写成 **Line C nail 之后**的**新**脚本，**不是本 open**。

| CMD | EXIT |
|-----|------|
| （无点名脚本） | **not_run** |
| 需 PG 的 prove | **not_run**（未把缺库当 pass） |
| Live model / billing | **not_run** |

因此本审 **不能**用 EXIT 0 证明：ledger schema、fail-closed、无 silent fallback、无跨模校准、actual model 落账、无伪造成本。这些是计划条目，不是已跑证据。

## 4. 引用与诚实（对照现码，只读）

与代码一致、且文档没有说成已切：

- `buildG7ReceiptFields`（`g7-freetier-reprove-guard.ts` ~312）写死 `actualSpendCny: null`，`estimatedCostCny` 取进程内 `runningCostCny`。`priceBookCitation` 是常量文案，不是控制台发票。
- 空 `G7_RUN_COST_LEDGER_PATH` → `resolveG7LedgerPath` 抛 `g7_cost_ledger_path_missing`。路径已设但文件不存在时 `readG7SharedLedger` 返回 running **0**（空文件 ≠ 缺路径）。
- 该文件 **无 HMAC**（gap GN-SPEND-LEDGER-FILE 成立）。可写 NDJSON **不是**已认证花费账。
- `invoke.ts` 的 `priceRevision` 在出站计划上。本 commit **未改**该文件。
- 文档自陈：`draft:awaiting_pre_exec_dual` · Ban coding · Dual PASS ≠ MODEL-OP closed · `actualSpendCny` 本 open 保持 null · `haStatus=NOT_HA` · `releaseEvidence=false`。**未**声称账本已 wired / cut over / HA。**Ban** MODEL-OP-00 closed。

## 5. 够不够授权下一刀编码

**不够。** Harness + 零个已点名离线 prove **不能**授权下一刀写代码，也 **不能**关闭 MODEL-OP 账本或当作 cutover。Stub 自己写了 “No coding is authorized by this stub” / “until Line C is nailed”。本 PASS 只表示：这是一份诚实的 docs-only pre-exec，范围与禁令与树一致。

下一刀若要写 prove，必须另开授权，且脚本必须是**新**离线夹具，仍不得改出站主链；并须分开证明 G7 封顶账 vs usage/calibration reconciler，禁止把 G7 `estimatedCostCny` 写成 `actualSpendCny`。

## Blockers

无（本 pre-exec 范围内）。

## Non-claims

Not enough to close the ledger · not a cutover · not MODEL-OP-00 closed · not next-slice coding auth · not HA · not `releaseEvidence=true` · not suite green · G7 NDJSON ≠ usage calibration ledger · Dual PASS ≠ nail · Line C outbound chain untouched and still banned

---

Verdict: PASS

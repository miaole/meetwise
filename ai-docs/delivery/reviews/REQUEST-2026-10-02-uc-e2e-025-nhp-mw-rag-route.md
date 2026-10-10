# REQUEST — **UC-E2E-025 NHP** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）  
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`  
**Knife**: `harness/uc-e2e-025-nhp.md` · slice `uc-e2e-025-nhp.slice.md`  
**Parent tip**: `315870e`（series open · not a prove tip）  
**Date**: 2026-10-02 (~21:00 PT)

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

Row id **`UC-E2E-025`** stays gap/blind. Ban edits to the UC-018 and UC-052 rows.

Dual PASS ≠ coding ≠ covered ≠ nail · No coding is authorized by this stub.

---

*Stub · awaiting expert pre-exec dual · STOP*


---

## 预执行审 · `a05c485` · 2026-10-02 (~21:07 PT)

**Expert**: `mw-rag-route` · alone ≠ dual · 不代签 peer · 只追加 · 不改 harness  
**审的 SHA**: `a05c485`（UC-E2E-025 NHP · L0 docs）· 祖先于 origin  
**分支已前移**: 点名 tip `5cd6cbc` 是祖先，不是当前 tip（`49ef158`）。本文件自 `a05c485` 后无再改。  
**性质**: pre-exec only · 不接线产品 reject · 不跑新 prove

### 对照禁令

禁止碰 UC-018 或 UC-052。文件清单或验收漏进这两个用例则 FAIL。

### 计划是否守禁

- diff 仅四文件：`harness/uc-e2e-025-nhp.md`、`uc-e2e-025-nhp.slice.md`、两份 PENDING 审 stub。没有 UC-018 / UC-052 路径。  
- 行号写死 **UC-E2E-025**。§1.0.1 为 NEG/FAULT/BOUND **gap**、ADV **blind**；§1.1 仍 **gap**。与当前矩阵 `e2e-requirement-coverage-matrix.md:117` 与 `:175` 一致。  
- 正文出现 018/052 只为禁改（「Ban edits to the UC-E2E-018 row and the UC-E2E-052 / UC-E2E-050–052 row」）以及声明「Not UC-E2E-018. Not UC-E2E-052」。不是把验收做进那两行。  
- Honesty：本 open 不改矩阵、gap backlog、execution checklist。现有 `pnpm uc025:stale-quiz-expiry:prove` 仍是诚实钉，EXIT 0 ≠ covered。产品 reject 是后续编码刀。  
- Ban skip-ahead 把本行写成 partial 或 covered。Ban fake-model pass。  
- pins：NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false。

### 裁定

**PASS**（条件化）。范围停在 025。提到 018/052 是禁令，不是泄漏。

### Conditions

1. 后续文件与验收不得改 UC-E2E-018 或 UC-E2E-052（含 050–052）行、harness 或收据。  
2. `pnpm uc025:stale-quiz-expiry:prove` EXIT 0 仍 ≠ covered，不得升 partial。  
3. 本刀不改矩阵。025 保持 gap/blind，直到另一次被授权的 prove 与 nail。  
4. 产品 reject 接线不属于本 REQUEST。  
5. coveredCount 保持 8。pins 不改口。UC-018 与 §1.1 仍 **partial**（本刀不动它们）。  
6. EXIT=0 ≠ 产品绿 ≠ HA。Dual PASS ≠ coding ≠ nail ≠ covered。

### signature

**mw-rag-route** · 2026-10-02 (~21:07 PT) · UC-E2E-025 NHP pre-exec **PASS** @ `a05c485`（条件化）

Verdict: PASS


---

## 事后审 · `0271ee4` / `f47f155` · 2026-10-02 (~21:33 PT)

**Expert**: `mw-rag-route` · alone ≠ dual · 只追加 · 不改实现 · 不 nail  
**代码**: `0271ee4` 增加 `pnpm uc025:nhp-neg:prove` → `apps/api/test/uc-e2e-025-nhp-neg.proof.mjs`，并改 025 harness/slice 与两个 package.json。不含矩阵、evaluator、UC-018、UC-052、审者文件。  
**收据**: `f47f155` 只加 `ai-docs/delivery/receipts/uc-e2e-025-nhp/2026-10-02-uc025-nhp-neg-prove.md`。  
点名 SHA 是 origin 祖先。按这两笔审。

### 本审重跑

干净 worktree @ `0271ee4`：

| CMD | 本审 EXIT |
|-----|-----------|
| `pnpm uc025:nhp-neg:prove` | **1** |

输出：`acceptsQuiz=false` `realStaleReject=false` `GAP-UC025-NEG-01` `ROW_STILL_GAP`。并写明非 0 不是产品拒绝（拒绝未实现），也不是旧的 `uc025:stale-quiz-expiry:prove` EXIT 0。

### 对照

- 收据写 **EXIT 1**，SHA `0271ee4`，行仍是 gap。没有写成 exit 0。  
- `e2e-requirement-coverage-matrix.md` 在 `0271ee4^` 与 `f47f155` 的 blob 相同。§1.0.1 行仍是 NEG/FAULT/BOUND **gap**、ADV **blind**；§1.1 仍 **gap**。  
- harness 状态字改成 `coded:neg_gap_unwired`，正文仍写「the row is still gap」，没有把行升成 partial/covered。  
- 文件清单没有 UC-E2E-018 / UC-E2E-052。pins 原文保持 NOT_HA、releaseEvidence=false、claimProductionHA=false、gR45Closed=true、coveredCount=8、ms3EqualsR4Closed=false。

### 裁定

**PASS**（诚实钉，不是产品通过）。EXIT 1 被如实记下，行仍 gap，没有洗绿。不 nail。

### 仍有效的条件

产品 reject 仍未接线。FAULT/BOUND/ADV 未跑。EXIT 1 ≠ covered。旧 mark-red EXIT 0 ≠ 本用例通过。UC-018 / §1.1 仍 partial（本刀未碰）。

### signature

**mw-rag-route** · 2026-10-02 (~21:33 PT) · UC-025 NEG post-prove **PASS** @ `0271ee4` / `f47f155` · 本审 EXIT 1 · 行仍 gap · 不 nail

Verdict: PASS

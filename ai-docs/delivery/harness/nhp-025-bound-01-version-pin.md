# Harness — **NHP-025-BOUND-01 · UC-025 next non-NEG face = BOUND**（Line W · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · row stays gap）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove 执行 · Ban push · Ban self-approve · Ban flip row · Ban wash B'' NEG）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-05
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`6a79946`** / full `6a79946ae5bb4b2148e0d63d3b7f66d64a1e51df`
**Knife**: **NHP-025-BOUND-01（Line W）· UC-E2E-025 BOUND 列 · resumeVersion / 版本 pin 失配 · blind→case/prove 显式化**
**Gap id**: **`GAP-UC025-BOUND-01`**（本刀新具名 · 对应 scenarios TC-E2E-025-version-mismatch / E-简历变更；不改名 B'' `GAP-UC025-NEG-01`）
**Case id**: **`NHP-025-BOUND-01`**（NHP 矩阵今日仅有 `NHP-025-NEG-01`；本刀新增 BOUND case 名，**不**编辑 NHP 矩阵 status 行——登记留 nail）
**Row**: **`UC-E2E-025`** BOUND 列 · not UC-E2E-018 · not UC-E2E-052 · not UC-E2E-004 · **Ban 碰 B'' 已关 NEG wash**
**Experts**: `mw-rag-route` + `mw-e2e-ha`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban secrets / `.env*` · Ban force-push · Ban push · Ban SSOT edit · Ban coding · Ban prove 执行 · **Ban 编辑 interview begin quiz 产品路径**（docs only）

## 选面（FAULT vs BOUND · 诚实裁决 · 本刀钉死 BOUND）

矩阵 `e2e-requirement-coverage-matrix.md:125`：UC-E2E-025 NEG 格长注 B'' 真接线（`stale_quiz` 409 @`interview.service.ts:209` · `GAP-UC025-NEG-01` **CLOSED（wired）**）· **FAULT gap · BOUND gap · ADV blind** · 行 stays **gap** · coveredCount=8。

P1-8（矩阵 `:274`）：「仍缺 **resumeVersion pin** + 重押题入口」。

scenarios `e2e-scenarios.md:331-347`：E-简历变更「关联 `resumeVersion` 不匹配 → 失配守卫」；验收 A2；**TC-E2E-025-version-mismatch**。

产品读码（本树）：`begin(..., sourceQuizId?)`（`interview.service.ts:192-222`）仅查 `resume_quiz.status` + `expires_at` → `stale_quiz`；**无** `resumeVersion` / 简历变更失配守卫字段消费——B'' 关的是 **NEG 过期面**，不是 BOUND 版本 pin。

| 候选 | 理由 | 裁决 |
|------|------|------|
| **FAULT** | 矩阵 FAULT=gap；无具名 NHP-025-FAULT case；scenarios 无独立「故障注入」用例（异常流已并入过期/失配） | 证据缺口更模糊；本刀**不选** |
| **BOUND** | P1-8 + TC-E2E-025-version-mismatch + E-简历变更 **明文**；NEG 已关后最清晰的下一证据缺口；blind→case 可显式化 | **本刀选择** |

**选择声明**：Line W = **BOUND**（`NHP-025-BOUND-01` / resumeVersion pin / version-mismatch）。FAULT 留后续独立刀。

## Quoted from the files

`e2e-requirement-coverage-matrix.md:125`：FAULT **gap** · BOUND **gap** · ADV **blind**；B'' NEG CLOSED（wired）；行 stays gap · coveredCount=8。

`e2e-requirement-coverage-matrix.md:274` P1-8：「仍缺 resumeVersion pin + 重押题入口」。

`e2e-scenarios.md:340-347`：E-简历变更 / A2 / TC-E2E-025-version-mismatch。

`interview.service.ts:209-222`：B'' stale/expires_at 守卫（NEG）；**无** resumeVersion 比较。

`non-happy-path-perf-load-case-matrix.md:84`：仅 `NHP-025-NEG-01`（无 BOUND 行——本刀 case 名新增，矩阵行登记留 nail）。

## blind→case/prove 显式化（本 REQUEST 的产物）

| 阶段 | 状态 | 本刀做什么 |
|------|------|------------|
| 今日 | BOUND **blind**（无 case 名 / 无 prove） | — |
| 本 REQUEST | docs：具名 case + harness + dual stubs | **blind→case 显式**（docs） |
| 授权后 prove | 拟 `pnpm uc025:nhp-bound:prove` | case→prove；**Ban** 本 turn 写码 |
| nail | 协调方 | 才可讨论 BOUND 列状态；**Ban self-nail** |

## prove 方案（授权后 · 本 commit 不写码）

- **拟 CMD**：`pnpm uc025:nhp-bound:prove`（隔离壳三层；形态对齐 `uc025:nhp-neg:prove`）。
- **注入**：源押题工件绑定的 resumeVersion（或等价 pin）与当前 resume **失配** → begin 必须拒（可解释错误码）+ **Interview 未误入 active** + **未扣额度**（先于 reserve）。
- **诚实路径**：若产品仍无 version-pin 字段/守卫 → EXIT1 保留 BOUND gap（类比 NEG 接线前）；**Ban** 改 `interview.service.ts` begin quiz 路径冒充（属独立 wiring 刀，且本 REQUEST **Ban 编辑该产品路径**）。
- **EXIT0 ≠ covered** · 行 stays gap · coveredCount=8 · Ban wash B'' NEG 关账成 BOUND/整行 covered。

## 行语义（冻结）

- `UC-E2E-025` stays **gap** · FAULT stays gap · ADV stays blind · NEG B'' CLOSED（wired）**不动、不洗**。
- coveredCount=**8** · Ban invent covered · Ban SSOT edit 本 turn。

## Ban 列表

- Ban coding · Ban prove 执行 · Ban push · Ban force-push · Ban secrets / `.env*`
- **Ban 触碰 B'' 已关 NEG wash**（不改 NEG 列叙事、不重跑洗绿、不借 NEG EXIT0 关 BOUND）
- **Ban 编辑 interview begin quiz 产品路径**（`interview.service.ts` begin / quiz-id 区段本 REQUEST 零触碰）
- Ban flip UC-025 covered · Ban coveredCount · Ban SSOT status 行翻写 · Ban Meridian · Ban HA cloud buy · Ban self-approve · Ban self-nail

## Non-claims

Not a pass · not run · not covered · not BOUND partial · not FAULT knife · not NEG re-open · not product wiring · not HA · alone ≠ dual

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · row stays gap · BOUND choice documented · STOP

*Harness · NHP-025-BOUND-01 · UC-025 BOUND version-pin · awaiting_pre_exec_dual · gap · STOP*

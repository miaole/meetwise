# Harness — **NHP-025-FAULT-01 · UC-025 next non-BOUND face = FAULT**（Line AA · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · row stays gap）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove 执行 · Ban self-approve · Ban flip row · Ban wash B'' NEG · Ban wash W BOUND）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`f43bea1`** / full `f43bea12fc7f2e28e7bb0052b6a80811eac47e91`
**Knife**: **NHP-025-FAULT-01（Line AA）· UC-E2E-025 FAULT 列 · missing/NULL `expires_at` fail-closed · Ban treating absent as fresh · blind→case/prove 显式化**
**Gap id**: **`GAP-UC025-FAULT-01`**（本刀新具名 · 对应 NHP 序 FAULT 面；**不**改名 B'' `GAP-UC025-NEG-01` · **不**改名 W `GAP-UC025-BOUND-01`）
**Case id**: **`NHP-025-FAULT-01`**（NHP 矩阵今日仅有 `NHP-025-NEG-01` + REQUEST-era BOUND 名；本刀新增 FAULT case 名，**不**编辑 NHP 矩阵 status 行——登记留 nail）
**Row**: **`UC-E2E-025`** FAULT 列 · not UC-E2E-018 · not UC-E2E-052 · not UC-E2E-004 · **Ban 碰 B'' NEG wash · Ban 碰 W BOUND wash**
**Experts**: `mw-rag-route` + `mw-e2e-ha`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban secrets / `.env*` · Ban force-push · Ban SSOT edit · Ban coding · Ban prove 执行 · Ban 编辑 NEG stale / BOUND version-pin 产品路径（docs only）

## 选面（FAULT · 诚实裁决 · 本刀钉死 FAULT · next non-BOUND）

矩阵 `e2e-requirement-coverage-matrix.md:125`：UC-E2E-025 · NEG B'' `stale_quiz` **CLOSED（wired）frozen Ban wash** · **FAULT gap** · BOUND **gap**（W nail `2af0640` 真证据已落但仍 gap · EXIT0≠covered · in-process+fake-db ≠ isolated PG/HTTP）· ADV **blind** · 行 stays **gap** · coveredCount=8。

Line W REQUEST `73b9d85` / nail `2af0640`：当时选 **BOUND**（非 FAULT）；明确「FAULT 留后续独立刀」。本 Line AA = 该后续刀。

`harness/uc-e2e-025-nhp.md` NHP 序：

| Order | Item |
|-------|------|
| 1 NEG | Stale / expired quiz → reject · `NHP-025-NEG-01` · **B'' CLOSED frozen Ban wash** |
| 2 FAULT | **Missing expiry field fails closed · Ban treating absent `expires_at` as fresh** ← **本刀** |
| 3 BOUND | Version mismatch · `NHP-025-BOUND-01` · **W nailed `2af0640` Ban wash** |
| 4 ADV | Replayed quiz id cross-user · 非本刀 |

### W nail honesty（必引 · Ban invent covered）

Line W nail tip **`2af0640`** / `2af0640ac510c2d09c35dc47a817a7d7e8bf0d1d`（`docs(delivery): NAIL NHP-025-BOUND-01 … post_prove_dual_pass`）：

- Prove tip `e8fa74c` · code `6853e17` · `pnpm uc025:nhp-bound:prove` EXIT=0 · 409 `resume_version_mismatch`
- POST dual mw-e2e-ha `9aad765` + mw-rag-route `c048533` BOTH PASS
- **Evidence layer MUST**：in-process `InterviewService.begin` + fake DB · shape aligned to nhp-neg · **≠ isolated Postgres/HTTP E2E**
- **STILL_GAP**：row stays **gap** · **BOUND column stays gap** · EXIT0≠covered · coveredCount=**8** · canHonestlyFlip=**false** · NEG B'' frozen · **FAULT gap** · ADV blind

本刀 **不**借 BOUND EXIT0 / NEG EXIT0 关 FAULT 或整行。

### 产品读码（FAULT 缺口事实 · 本 REQUEST 时点）

`interview.service.ts:209-222`（B'' NEG 块 · **Ban 本 turn 编辑**）：

- `expires_at != null && expires_at <= now` → `stale_quiz` 409（NEG 已关）
- 注释与实现明言：**`expires_at` 为 NULL（0135 前旧工件/无锚点）不得当过期拒**
- 即：absent/NULL `expires_at` **当前按非过期放行**（不 fail-closed）——与 NHP FAULT 意图「Missing expiry field fails closed · Ban treating absent as fresh」**相反**

BOUND 块 `:225-248`（W · Ban 本 turn 编辑）：`resume_version_mismatch` 409 · 与 FAULT 正交。

| 候选 | 理由 | 裁决 |
|------|------|------|
| **FAULT** | NHP 序 #2 明文；矩阵 FAULT=gap；产品 NULL `expires_at` 不 fail-closed = 可具名证据缺口；与 NEG（有锚且过期拒）/ BOUND（version pin）**正交** | **本刀选择** |
| ADV | 仍 blind；跨用户 replay | 非本刀 |
| 重洗 NEG/BOUND | 已 CLOSED/nailed | **Ban** |

**选择声明**：Line AA = **FAULT**（`NHP-025-FAULT-01` / missing-expiry fail-closed）。Ban wash NEG/BOUND。

## Quoted from the files

`e2e-requirement-coverage-matrix.md:125`：FAULT **gap** · BOUND gap（W evidence · still gap）· ADV blind；B'' NEG CLOSED；行 stays gap · coveredCount=8。

`e2e-requirement-coverage-matrix.md:274` P1-8：B'' + Line W 已记；仍缺重押题入口等（REGEN 另刀 · **≠** 本 FAULT 改名）。

`harness/uc-e2e-025-nhp.md`：FAULT = Missing expiry field fails closed。

`interview.service.ts:210-220`：NULL `expires_at` 不拒（当前产品语义）。

`non-happy-path-perf-load-case-matrix.md:84`：仅 `NHP-025-NEG-01`（无 FAULT 行——本刀 case 名新增，矩阵行登记留 nail）。

## blind→case/prove 显式化（本 REQUEST 的产物）

| 阶段 | 状态 | 本刀做什么 |
|------|------|------------|
| 今日 | FAULT **blind**/unnamed（无 case 名 / 无 prove） | — |
| 本 REQUEST | docs：具名 case + harness + dual stubs | **blind→case 显式**（docs） |
| 授权后 prove | 拟 `pnpm uc025:nhp-fault:prove` | case→prove；**Ban** 本 turn 写码 |
| nail | 协调方 | 才可讨论 FAULT 列状态；**Ban self-nail** |

## prove 方案（授权后 · 本 commit 不写码）

- **拟 CMD**：`pnpm uc025:nhp-fault:prove`（隔离壳三层；形态对齐 `uc025:nhp-neg:prove` / `uc025:nhp-bound:prove`）。
- **注入**：源押题工件 **`expires_at` IS NULL**（或缺新鲜度锚）作 begin quiz 输入 → 必须 **fail-closed 拒**（可解释错误码）+ **Interview 未误入 active** + **未扣额度**（先于 reserve）；**Ban** 把 NULL 当 fresh 放行。
- **诚实路径**：若产品仍按「NULL 不拒」→ EXIT1 保留 FAULT gap；**Ban** 改 NEG stale 块或 BOUND version-pin 块冒充 FAULT 绿。
- **EXIT0 ≠ covered** · 行 stays gap · FAULT column stays gap until nail · coveredCount=8 · Ban wash NEG/BOUND。

## 行语义（冻结）

- `UC-E2E-025` stays **gap** · FAULT stays gap（本 REQUEST 不翻）· BOUND stays gap（W honesty）· ADV stays blind · NEG B'' CLOSED **不动、不洗**。
- coveredCount=**8** · Ban invent covered · Ban SSOT edit 本 turn。

## Ban 列表

- Ban coding · Ban prove 执行 · Ban force-push · Ban secrets / `.env*`
- **Ban 触碰 B'' 已关 NEG wash**（不改 NEG 列叙事、不重跑洗绿、不借 NEG EXIT0 关 FAULT）
- **Ban 触碰 W BOUND wash**（不改 BOUND 列叙事、不借 BOUND EXIT0 / nail `2af0640` 关 FAULT/整行）
- **Ban 编辑 NEG stale / BOUND version-pin 产品路径**（`interview.service.ts` 对应区段本 REQUEST 零触碰）
- Ban flip UC-025 covered · Ban coveredCount · Ban SSOT status 行翻写 · Ban Meridian · Ban HA cloud buy · Ban self-approve · Ban self-nail

## Non-claims

Not a pass · not run · not covered · not FAULT partial · not NEG re-open · not BOUND re-open · not product wiring · not HA · alone ≠ dual · not REGEN-entry knife · not invent covered

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · row stays gap · FAULT choice documented · W nail `2af0640` honesty cited · STOP

*Harness · NHP-025-FAULT-01 · UC-025 FAULT missing-expiry fail-closed · awaiting_pre_exec_dual · gap · STOP*

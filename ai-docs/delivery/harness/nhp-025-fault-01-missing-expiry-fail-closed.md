# Harness — **NHP-025-FAULT-01 · UC-025 next non-BOUND face = FAULT**（Line AA · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · row stays gap）

**Status**: **`authorized:coding_prove`**（Line AA · PRE dual BOTH PASS · coding+prove AUTHORIZED · Ban self-nail · Ban wash NEG/BOUND · Ban invent covered · Ban flip row · Ban HA · Ban live · Ban Meridian · Ban secrets · Ban force-push · row stays gap · coveredCount=8）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-06
**Base / REQUEST tip**: `448a33e2460f919b15af1db6c9c44497dc585b62` · PRE BOTH PASS mw-e2e-ha `fbd47ac8076d2ccd0a948b88630cb397789e3ef7` + mw-rag-route `986260120f5910606043b03fb66c6a742636f219`（ignore empty `454d6e9`）
**Knife**: **NHP-025-FAULT-01（Line AA）· UC-E2E-025 FAULT 列 · missing/NULL `expires_at` fail-closed · Ban treating absent as fresh · blind→case/prove 显式化**
**Gap id**: **`GAP-UC025-FAULT-01`**（本刀新具名 · 对应 NHP 序 FAULT 面；**不**改名 B'' `GAP-UC025-NEG-01` · **不**改名 W `GAP-UC025-BOUND-01`）
**Case id**: **`NHP-025-FAULT-01`**（本刀新增 FAULT case 名，**不**编辑 NHP 矩阵 status 行——登记留 nail）
**Row**: **`UC-E2E-025`** FAULT 列 · not UC-E2E-018 · not UC-E2E-052 · not UC-E2E-004 · **Ban 碰 B'' NEG wash · Ban 碰 W BOUND wash**
**Experts**: `mw-e2e-ha` PRE PASS `fbd47ac` + `mw-rag-route` PRE PASS `9862601` · Ban self-approve · alone ≠ dual · post dual still needed after prove
**Authority**: meetwise — coding+prove AUTHORIZED · Ban secrets / `.env*` · Ban force-push · Ban SSOT edit · Ban wash NEG/BOUND · Ban self-nail · Ban claiming covered / coveredCount bump

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

## C-1 处置（授权 coding 前 MUST · supersede）

旧 e2e-ha **C-1**「`expires_at` 为 NULL（0135 前旧工件/无锚点）**不得当过期拒**」→ 产品注释曾据此 **fail-OPEN**（NULL 当 fresh 放行）。与 NHP FAULT「Missing expiry field fails closed · Ban treating absent as fresh」**方向相反**。

| 维度 | 处置 |
|------|------|
| **裁决** | **supersede**（非 silent flip） |
| **窄保留** | NULL **仍不得**抛 `stale_quiz`（NULL ≠ 有锚且过期）；NEG 块 `stale_quiz` 语义与正则 `negBlockIntact` **逐字节冻结** |
| **supersede 行为** | begin 携带 `quiz-id` 且 `expires_at` IS NULL / 缺新鲜度锚 → **fail-closed** 抛独立错误（下表），**禁止**当 fresh 放行 |
| **旧工件** | 0135 前缺锚工件须经迁移/回填 `expires_at` 后方可 begin；未回填 → 预期拒绝（本刀披露） |
| **写入** | 本段 + receipts；产品注释同步指向本 supersede |

## NaN / illegal date 策略（本刀钉死）

| 策略 | **fail-closed**（fold into same guard） |
|------|----------------------------------------|
| 触发 | `expires_at != null` 但 `Date(...).getTime()` 为 **NaN**（不可解析/非法日期） |
| 行为 | 与 NULL 同口 **fail-closed**（无可用新鲜度锚） |
| 错误 | 同下表 HTTP + error code（不另开码） |
| 披露 | harness + prove 正控/负控均覆盖；**不** excluded |

## HTTP status + named error code（本刀钉死 · PRE 条件兑现）

| 项 | 值 |
|----|----|
| HTTP status | **409 CONFLICT** |
| Body | `{ "error": "missing_quiz_expiry" }` |
| Trigger | begin 携带 `quiz-id` 且源押题 `expires_at` IS NULL，或解析后为 NaN |
| Ordering | 独立 FAULT 块；抛点先于 resume bind / `reserveEntitlement` / `enqueueInterviewJob`；顺序 = NEG `stale_quiz` → FAULT `missing_quiz_expiry` → BOUND `resume_version_mismatch` |
| 正交 | **≠** `stale_quiz` · **≠** `resume_version_mismatch` |
| 无 quiz-id | 整块跳过，行为不变 |

## Evidence shape（harness:81 choose-one · 本刀钉死）

| 选择 | **in-process**（对齐 Line W BOUND） |
|------|-------------------------------------|
| 形态 | static inventory **S** + in-process `InterviewService.begin` + recording **fake DB** **R** |
| CMD | `pnpm uc025:nhp-fault:prove`（**不**走 `run-e2e-isolated` 三层壳） |
| 诚实 | **≠** isolated Postgres/HTTP E2E · **≠** covered · EXIT0≠covered · Ban 把 in-process 叙事成隔离 PG/HTTP/covered |
| 三层隔离壳 | 本刀 **NOT run**（soft/aspirational · not blocker）；PG/HTTP 级 FAULT 须 separate knife |

## prove 方案（授权 coding+prove）

- **CMD**：`pnpm uc025:nhp-fault:prove`
- **注入**：源押题 **`expires_at` IS NULL**（及 NaN 非法日期）→ **409 `missing_quiz_expiry`** + Interview 未入 active + 未扣额度（先于 reserve）。
- **正控**：未来非空合法 `expires_at` → 越过本 FAULT 检查（可到 bind sentinel / 下一守卫）。
- **回归**：同 tip `pnpm uc025:nhp-neg:prove` + `pnpm uc025:nhp-bound:prove` 仍 **EXIT0**；**Ban** 改 NEG/BOUND 脚本迁就。
- **接线前**：同脚本无 FAULT throw → **EXIT1** + `GAP-UC025-FAULT-01`（诚实保留 gap）。
- **EXIT0 ≠ covered** · 行 stays gap · FAULT column stays gap until nail · coveredCount=8 · Ban wash NEG/BOUND。

## 行语义（冻结）

- `UC-E2E-025` stays **gap** · FAULT stays gap（本 REQUEST 不翻）· BOUND stays gap（W honesty）· ADV stays blind · NEG B'' CLOSED **不动、不洗**。
- coveredCount=**8** · Ban invent covered · Ban SSOT edit 本 turn。

## Ban 列表

- Ban force-push · Ban secrets / `.env*` · Ban live · Ban buy cloud · Ban HA · Ban Meridian
- **Ban 触碰 B'' 已关 NEG wash**（不改 NEG 列叙事、不重跑洗绿、不借 NEG EXIT0 关 FAULT；NEG `stale_quiz` 块 SELECT+throw 逐字节冻结）
- **Ban 触碰 W BOUND wash**（不改 BOUND 列叙事、不借 BOUND EXIT0 / nail `2af0640` 关 FAULT/整行；不改 BOUND proof 迁就）
- Ban flip UC-025 covered · Ban coveredCount bump · Ban claiming covered · Ban SSOT status 行翻写 · Ban self-approve · Ban self-nail

## Non-claims

EXIT0 ≠ covered · not FAULT column flip · not NEG re-open · not BOUND re-open · not HA · alone ≠ dual · post dual still needed · not REGEN-entry knife · not invent covered · Ban self-nail

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · row stays gap · FAULT choice documented · W nail `2af0640` honesty cited · STOP

*Harness · NHP-025-FAULT-01 · UC-025 FAULT missing-expiry fail-closed · authorized coding+prove · C-1 supersede · NaN fail-closed · 409 missing_quiz_expiry · evidence in-process · gap · coveredCount=8 · Ban self-nail · STOP*

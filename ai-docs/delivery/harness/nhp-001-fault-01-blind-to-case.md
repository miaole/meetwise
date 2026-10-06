# Harness — **NHP-001-FAULT-01 · UC-001 FAULT blind→case evidence**（Line AI · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · case ≠ covered · row UC-E2E-001 stays honest）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove · EXIT0≠covered · Ban wash Y NEG `ff74522` / AB BOUND `f8cdc82` / AG ADV · Ban self-approve · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`71ad2a7`** / full `71ad2a7fccaa3dd43b47e2c54b9823890aaabdf9`（wave AI–AM start · includes Line AE nail `3409862` / `340986214ad2a32b1cb678caa612c6a50f305861` as ancestor · tip advanced past AE by Line AG re-PRE2 review commits only · Ban touch AG）
**Wave**: Lines **AI–AM** REQUEST wave（5 independent docs REQUEST commits stacked sequentially · this = Line **AI**）
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban SSOT edit · Ban coding · Ban self-nail · status `draft:awaiting_pre_exec_dual`
**Knife**: **NHP-001-FAULT-01（Line AI）· 黄金路径 FAULT · blind→case 显式化**（report worker 注入失败 → Interview 可终态 · report 非阻塞死胡同）
**Gap id**: **`GAP-UC001-FAULT-01`**（本刀具名 · 服务 NHP-001-FAULT-01；不发明 covered · 本 REQUEST 不登记进 matrix/backlog）
**Case id**: **`NHP-001-FAULT-01`**
**Row**: **`UC-E2E-001`** FAULT 列 only · not NEG（Line Y）· not BOUND（Line AB）· not ADV（Line AG）

## 0. 为何新开文件

NEG（`harness/nhp-001-neg-01-blind-to-case.md` · Line Y NAIL）/ BOUND（`harness/nhp-001-bound-01-blind-to-case.md` · Line AB NAIL）已 `post_prove_dual_pass` 封存；ADV（Line AG）re-PRE 进行中 —— **Ban 碰其文件**。本刀镜像 NEG/BOUND **REQUEST-era** 结构，新开 FAULT 文件；旧文件只读引用。

## 1. Quoted from the files（只读 @ `71ad2a7` · 零改写）

- `e2e-requirement-coverage-matrix.md:112` UC-E2E-001 行 FAULT 列 **逐字读数 = `**partial**`**；行尾读法：「FAULT partial 仅因 isolated worker 注入下 report 未必 ready」·「happy-only 绿=假绿」· ≠ covered。
- `non-happy-path-perf-load-case-matrix.md:37`：**NHP-001-FAULT-01**「report worker 注入失败 | Interview 可终态；report 非阻塞死胡同 | **partial** | isolated worker 注入旁证」。

**诚实张力声明（FAULT 列 honesty）**：矩阵 FAULT 列写的是 **partial**（来源 = isolated worker 注入 **旁证**），而 **具名 case NHP-001-FAULT-01 无 UC-001 专用 FAULT prove 收据**（`package.json` 仅有 `uc001:nhp-neg:prove` / `uc001:nhp-bound:prove` · 无 `uc001:nhp-fault:prove`）。本刀「blind→case」指 **具名 case 证据层仍 blind**，**不是** 把 `:112` FAULT 列从 partial 改写为 blind，也 **不是** 升格。**Ban flip statuses（任一方向）** · 列文字由未来 nail + 协调方授权决定。

## 2. blind→case 显式化

| 今日 | 本 REQUEST | 授权后（拟 · 未授权） |
|------|------------|------------------------|
| FAULT 列 partial = 旁证；无 NHP-001-FAULT-01 专用 CMD+EXIT 收据 | docs：具名 gap `GAP-UC001-FAULT-01` + harness + 注入合同 + dual stubs | 拟 `pnpm uc001:nhp-fault:prove`（`run-e2e-isolated.mjs` 隔离壳 · **Ban live** · 不加载 `MODEL_API_KEY`） |

## 3. 注入合同（FAULT 一 case · 拟）

| id | 注入 | 观察（结构） |
|----|------|--------------|
| **F1 report worker 失败** | 隔离 worker 内 report 生成步注入确定性失败（throw / 拒绝） | Interview 仍达可终态；report 状态显式失败/降级（非 pending 永挂）；无双扣 |
| **F2 非阻塞死胡同** | F1 后读 Interview / report 查询口 | 主链不阻塞；错误可解释；Ban 静默吞错 |
| **F3 旁证分离** | NEG/BOUND 收据只读对照（不重跑） | 本 case 收据 **独立**；Ban 用 Y NEG / AB BOUND / AG ADV 绿替代 FAULT |

注入点、文件路径、断言数在 PRE dual 中由专家裁定；本 REQUEST **不** 指定改动哪个产品文件 · Ban coding 本 turn。

## 4. prove 方案（授权后 · Ban live）

- **EXIT0** = F1–F3 case 证据；**EXIT0≠covered** · ≠ suite green · ≠ FAULT 列升格 · row UC-E2E-001 stays honest · coveredCount=8。
- **EXIT1** = 诚实保留；Ban retry-to-green · Ban 记 flake · Ban 改断言洗绿。
- 预声明 attempts（拟 1 正式 + 全记录）· CMD+EXIT+起止（Asia/Shanghai）+ code SHA。

## 5. 行语义（冻结）

- UC-E2E-001 行与 FAULT 列 **逐字不动**（partial 保留 · 不改 blind · 不升 covered）· NHP `:37` partial 不动 · coveredCount=8 · canHonestlyFlip=false。
- 本 REQUEST 零 matrix/backlog/checklist edit。

## 6. Ban 列表

- **Ban wash Y NEG**（`ff74522` / `ff74522ac4db4ad661e72265e50ad8d860a68812`）· **Ban wash AB BOUND**（`f8cdc82` / `f8cdc82748922a15f668993fe742411052cf21fd`）· **Ban wash AG ADV**（in-flight · Ban 碰其文件）
- Ban wash isolated worker 旁证为 case 收据 · Ban live · Ban fake-green suite · Ban invent covered · Ban flip FAULT 列/行
- Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban SSOT edit of matrix/backlog（REQUEST = zero matrix/backlog edits）· Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban 碰 Line AG `nhp-001-adv-01*` / `REQUEST-2026-10-06-nhp-001-adv*` 文件 · Ban 改写既有 nailed harness 的 nail 状态 · Ban product/infra code

## 7. Non-claims

Not a pass · not run · not covered · not FAULT 列 flip · not nail · not HA · not `releaseEvidence=true` · EXIT0≠covered · alone ≠ dual

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · canHonestlyFlip=false · row UC-E2E-001 unchanged · STOP

*Harness · NHP-001-FAULT-01 · UC-001 FAULT blind→case evidence · Line AI · 2026-10-06 · draft:awaiting_pre_exec_dual · Ban coding until PRE BOTH PASS + AUTHORIZE · alone ≠ dual · STOP*

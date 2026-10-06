# Harness — **NHP-025-ADV-01 · UC-025 ADV blind→case evidence**（Line AK · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · row UC-E2E-025 stays gap · ADV stays blind until case）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove · EXIT0≠covered · canHonestlyFlip=false · Ban wash B'' NEG / AA FAULT / W BOUND + FAULT-ISOLATED · Ban self-approve · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`71ad2a7`** / full `71ad2a7fccaa3dd43b47e2c54b9823890aaabdf9`（wave AI–AM start · includes Line AE nail `3409862` / `340986214ad2a32b1cb678caa612c6a50f305861` as ancestor · tip advanced past AE by Line AG re-PRE2 review commits only · Ban touch AG）
**Wave**: Lines **AI–AM** REQUEST wave（5 independent docs REQUEST commits stacked sequentially · this = Line **AK**）
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban SSOT edit · Ban coding · Ban self-nail · status `draft:awaiting_pre_exec_dual`
**Knife**: **NHP-025-ADV-01（Line AK）· UC-025 押题过期 ADV · blind→case 显式化**
**Gap id**: **`GAP-UC025-ADV-01`**（本刀具名 · 服务 NHP-025-ADV-01；不发明 covered · 本 REQUEST 不登记进 matrix/backlog）
**Case id**: **`NHP-025-ADV-01`**（**拟名** · 见 §1 登记缺口）
**Row**: **`UC-E2E-025`** ADV 列 only

## 0. 为何新开文件

NEG（B'' · `GAP-UC025-NEG-01` CLOSED wired · frozen）/ BOUND（Line W · `harness/nhp-025-bound-01-version-pin.md`）/ FAULT（Line AA · `harness/nhp-025-fault-01-missing-expiry-fail-closed.md`）/ FAULT-ISOLATED（Line W · `GAP-UC025-FAULT-ISOLATED-01`）均已 nail 封存；本刀新开 ADV 文件，旧文件只读引用 · 零改写。

## 1. Quoted from the files（只读 @ `71ad2a7` · 零改写）

- `e2e-requirement-coverage-matrix.md:125` UC-E2E-025 行：NEG=**gap**（B'' 接线 frozen）· FAULT=**gap**（AA in-process + W isolated · EXIT0≠covered）· BOUND=**gap**（W）· **ADV=`**blind**`** · 行尾：「ADV blind · ≠ covered · coveredCount=8」；NEG 单元格内并注「行状态保持 gap：FAULT/BOUND/ADV not-run、ADV blind」。
- `non-happy-path-perf-load-case-matrix.md`：NHP-025-* 仅 `:84` **NHP-025-NEG-01** 一行；**无 NHP-025-ADV-01 登记行**（登记缺口 · 本 REQUEST **不** 补 · 补行属未来授权 SSOT 编辑）。

## 2. blind→case 显式化

| 今日 | 本 REQUEST | 授权后（拟 · 未授权） |
|------|------------|------------------------|
| ADV=blind · 无具名 case · 无 CMD+EXIT | docs：具名 gap `GAP-UC025-ADV-01` + 拟 case `NHP-025-ADV-01` + 对抗合同 + dual stubs | 拟 `pnpm uc025:nhp-adv:prove`（隔离 · **Ban live**） |

## 3. 对抗合同（ADV 一 case · 拟 · 专家 PRE 中裁定）

| id | 对抗注入 | 观察（结构） |
|----|----------|--------------|
| **A1 quiz-id 伪造/跨用户** | begin 携他人或不存在的 quiz-id header | 结构拒（4xx 可解释）· 不扣额度 · 不入队 · 无跨用户泄露 |
| **A2 过期锚篡改** | 客户端声称未过期 / 篡改 expiry 相关输入 | 服务端以存储锚为准 · 篡改无效 · fail-closed |
| **A3 版本 pin 绕过** | 构造 resumeVersion / quiz 版本组合绕过 409 守卫 | 仍拒 · 不改 confirmed 账 |

旁证（B'' NEG `stale_quiz` 409 · W BOUND `resume_version_mismatch` 409 · AA/W FAULT `missing_quiz_expiry` 409）**≠** ADV 收据；Ban 借其绿。

## 4. prove 方案（授权后）

- **EXIT0** = A1–A3 case 证据；**EXIT0≠covered** · ADV 列由 blind 变化 **仅** 经 prove + POST dual + nail + 协调方授权 · 行 stays **gap**。
- **EXIT1** = 诚实保留（含产品未接线红）· Ban retry-to-green · Ban 改断言洗绿。

## 5. 行语义（冻结）

- UC-E2E-025 行 stays **gap** · ADV stays **blind** until case · canHonestlyFlip=false · coveredCount=8。
- 本 REQUEST 零 matrix/backlog/checklist edit（含不补 NHP-025-ADV-01 行）。

## 6. Ban 列表

- **Ban wash B'' NEG** · **Ban wash AA FAULT**（`3a6ec52` / `a8b98fc`）· **Ban wash W BOUND**（`e8fa74c` / `6853e17`）+ **FAULT-ISOLATED**（`e8d8a91` / `cce33ba`）
- Ban flip ADV 列 / 行 off gap · Ban invent covered · Ban live · Ban fake-green suite
- Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban SSOT edit of matrix/backlog（REQUEST = zero matrix/backlog edits）· Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban 碰 Line AG `nhp-001-adv-01*` / `REQUEST-2026-10-06-nhp-001-adv*` 文件 · Ban 改写既有 nailed harness 的 nail 状态 · Ban product/infra code

## 7. Non-claims

Not a pass · not run · not covered · ADV not case-evidenced · not nail · not HA · not `releaseEvidence=true` · EXIT0≠covered · alone ≠ dual

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · canHonestlyFlip=false · row UC-E2E-025 stays gap · ADV blind · STOP

*Harness · NHP-025-ADV-01 · UC-025 ADV blind→case evidence · Line AK · 2026-10-06 · draft:awaiting_pre_exec_dual · Ban coding until PRE BOTH PASS + AUTHORIZE · alone ≠ dual · STOP*

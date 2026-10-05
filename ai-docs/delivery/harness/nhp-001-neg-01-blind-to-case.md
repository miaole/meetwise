# Harness — **NHP-001-NEG-01 · UC-001 NEG blind→case**（Line Y · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · 主链 stays blind · ≠ covered）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove 执行 · Ban live · Ban fake-green suite · Ban push · Ban self-approve）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-05
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`6a79946`** / full `6a79946ae5bb4b2148e0d63d3b7f66d64a1e51df`
**Knife**: **NHP-001-NEG-01（Line Y）· 黄金路径 NEG · blind→case/prove 显式化**（无额度/鉴权失败开面）
**Gap id**: **`GAP-UC001-NEG-01`**（本刀具名 · 服务 NHP-001-NEG-01；不发明 covered）
**Case id**: **`NHP-001-NEG-01`**
**Row**: **`UC-E2E-001`** NEG 列 · not UC-E2E-003（本刀未选 i18n）· not UC-E2E-018/052/025/004
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban secrets / `.env*` · Ban force-push · Ban push · Ban SSOT edit · Ban coding · Ban live · Ban fake-green suite

## 选刀（NHP-001-NEG-01 vs NHP-003 / UC-003 · 诚实裁决）

| 候选 | 矩阵读法 | 优先级 | 裁决 |
|------|----------|--------|------|
| **NHP-001-NEG-01** | 矩阵 `:112` NEG=**blind**/case-only；NHP `:36` case-only（主链仍 blind）；UC-001=**典型快乐盲区主叙事**；P0-3 | 黄金路径 P0 | **本刀选择** |
| UC-003 / i18n blind | 矩阵 `:114` NEG=**gap** · FAULT blind · ADV blind；P1-6；无 NHP-003-* 行 | i18n P1 | 本刀**不选**（留给后续；静态 S1–S3 已 partial） |

**选择声明**：Line Y = **NHP-001-NEG-01**（golden-path NEG blind→case）。理由：快乐路径假绿风险是北星主叙事；P0 > P1；已有 case 名但主链仍 blind——需要 **prove 显式化** 合同，而不是再扩 i18n 静态面。

## Quoted from the files

`e2e-requirement-coverage-matrix.md:112`：UC-E2E-001 NEG **blind**/case-only ·「黄金路径主叙事 = 典型快乐盲区」·「happy-only 绿=假绿」· ≠ covered。

`non-happy-path-perf-load-case-matrix.md:36`：**NHP-001-NEG-01**「无额度 / 鉴权失败开面 | 业务拒 + 可解释错误码；不落 active Interview | **case-only**（主链仍 blind）| 委派 011/017/neg:auth；≠ 001 covered」。

`e2e-requirement-coverage-matrix.md:170` / `:263` P0-3：live blocked（无 Key）；`uc001:live-blocked:prove` EXIT=0 **仅**钉 blocked ≠ live covered。

`e2e-scenarios.md:48` UC-E2E-001 黄金路径主流程。

## blind→case/prove 显式化

| 今日 | 本 REQUEST | 授权后 |
|------|------------|--------|
| NEG=blind/case-only；委派 011/017/neg:auth；无 UC-001 专用 NEG prove 收据 | docs：具名 harness + 注入合同 + dual stubs | 拟 `pnpm uc001:nhp-neg:prove`（隔离 · **Ban live**） |

## 注入合同（NEG 一 case）

| id | 注入 | 观察 |
|----|------|------|
| **N1 无额度开面** | 零 entitlement / 已耗尽 principal 调 begin（或等价开面口） | 业务拒 + 可解释错误码；**不落 active Interview**；额度账本无双扣 |
| **N2 鉴权失败开面** | 无/错凭证调开面口 | 拒（401/403 族可解释）；无 Interview 行泄露创建 |

旁证（`neg:auth` / UC-011/017）**≠** 本 case 专用收据；本刀要求 **UC-001 主链面**可引用 CMD+EXIT，Ban 只甩旁证绿。

## prove 方案（授权后 · Ban live）

- **拟 CMD**：`pnpm uc001:nhp-neg:prove`（`run-e2e-isolated.mjs`；**不加载 MODEL_API_KEY** · Ban live 模型调用）。
- **EXIT0** = N1+N2 真证据；**≠ covered** · **≠** 假绿 suite（`g7SuiteGreen` 不因本刀讨论）· 主链快乐路径仍可 blind。
- **EXIT1** = 诚实保留；Ban retry-to-green · Ban 记 flake · Ban 改断言洗绿。
- **Ban fake-green suite**：本刀任何绿 **不得**叙述为 `e2e:isolated` suite green / trio green / UC-001 covered。

## 行语义（冻结）

- UC-E2E-001 stays 其矩阵读法（partial/blocked 叙事保留）；NEG 升格仅经 prove+dual+nail；**Ban invent covered** · coveredCount=8。
- Ban 碰 UC-003 行借刀 · Ban SSOT status 翻写本 turn。

## Ban 列表

- Ban coding · Ban prove 执行 · Ban push · Ban live · **Ban fake-green suite**
- Ban invent covered · Ban wash 旁证成 001 NEG covered · Ban secrets / `.env*` · Ban Meridian · Ban HA cloud buy
- Ban self-approve · Ban self-nail · Ban force-push · Ban SSOT edit

## Non-claims

Not a pass · not run · not covered · not live · not suite green · not trio green · not UC-003 knife · not HA · alone ≠ dual

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · Ban live · Ban fake-green suite · STOP

*Harness · NHP-001-NEG-01 · UC-001 NEG blind→case · awaiting_pre_exec_dual · STOP*

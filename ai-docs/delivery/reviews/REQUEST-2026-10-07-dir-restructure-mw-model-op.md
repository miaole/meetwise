# REQUEST — DIR-1 · 目录与文件位置重构设计刀（docs-only · per-batch pure-move 迁移计划）· pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-model-op`
**Knife**: `harness/dir-restructure.md` · slice `dir-restructure.slice.md`
**Parent tip**: `0fe96fca`（fetch 后 origin tip 实测 · docs 基线 · not a prove tip）
**Date**: 2026-10-07

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
| `g7SuiteGreen` | **false**（retained） |
| `r1Closed` | **false**（retained） |

## 请审什么（mw-model-op 视角）

同刀 docs-only REQUEST（写完即停）。从 model-op / 派发预算 / reconciler / Key-live 诚实视角请审：

1. **model-op 落面清单是否被误伤**：本刀后续批将移动 `packages/db/src/{model-invocation,model-operation-admission,usage-calibration}.ts`（→ `model-op/` 域文件夹）· `apps/worker/src/{model-cost-governance,model-invocation-reconcile,usage-calibration-reconcile}.ts` · `packages/ai-runtime/src/{model-operation-binding,model-operation-registry,operation-binding,usage-calibration-reconciler}.ts`（B5，后置至 TOKSTREAM nail）。确认 REQUEST §4 通用律保证这些文件**只 mv + import 行改**，`actualSpendCny=null` 语义 / 绑定围栏 / 准入逻辑零字节变化；B5 未 nail 前禁动 ai-runtime。
2. **usage 家族近名混乱是否如实登记**（§2.3）：`usage-calibration.ts`（db）· `usage-calibration-reconcile.ts`（worker）· `usage-calibration-reconciler.ts`（ai-runtime）三拼法散三包——REQUEST 是否如实登记且**未**在本刀内改名（改名=内容刀面，B7 单列原则外禁）。
3. **wakeup / reconciler 主链零触碰**：`worker-job-wakeup.ts`（db）与 `worker-job-wakeup-redis.ts`（worker）在 B1/B3 移动面内——确认 PG LISTEN 唤醒语义零改（纯 mv），Redis 另评叙事不因本刀变化；`apps/worker/src/checkpoint-principal.ts` 被 B3 显式排除（隐私主线在飞）。
4. **B6 scripts 移动的 prove 资产安全**：38 个根 `*.proof.mjs`（含 `interview-dispatch-prove.proof.mjs` / `mysql-stack.*` 11 个）移入子目录须同步 248 处 `node scripts/` package.json 路径——model-op 视角确认 prove CMD 别名（`pnpm <x>:prove`）迁移后仍解析到同一脚本字节（`--find-renames` R100），无静默换脚本 / 无 prove 面缩水。
5. **预算与零调用**：本 docs-only 批零 model 调用 / 零 Key / 零 `.env*` / `actualSpendCny=null`；不发明 spend；后续各迁移批同样零模型调用（纯文件移动）。
6. **诚实边界**：批绿 ≠ 重构完成 ≠ reconcile 语义已验证 ≠ HA；SSOT（矩阵/backlog）零触碰留 nail；`releaseEvidence=false` / `g7SuiteGreen=false` 不动。

末行严格 `Verdict: PASS` 或 `Verdict: FAIL`。本 stub 不授权 coding / mv / prove / push；pre-exec dual PASS 后由协调方授权后续批次。

---

*Stub · awaiting expert pre-exec dual · STOP*

---

（pre-exec 审查体由 mw-model-op 于独立 worktree 追加；实现方禁自批 · alone ≠ dual）

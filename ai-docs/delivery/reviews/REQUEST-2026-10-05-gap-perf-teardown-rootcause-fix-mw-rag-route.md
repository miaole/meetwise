# REQUEST — **C-PERF-TEARDOWN 根因刀 · PERF-LOAD teardown 根因判定 + 复跑验证/关闭证据** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF/LOAD stays local partial · capacityRepresentative=false · canHonestlyFlip=false
**Expert**: `mw-rag-route`
**Knife**: `harness/gap-perf-teardown-rootcause-fix.md` · slice `gap-perf-teardown-rootcause-fix.slice.md`
**Parent tip**: `377e7fc`（series open · not a prove tip）
**Date**: 2026-10-05

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
| PERF/LOAD | **local partial**（stays） · capacityRepresentative=false |
| `canHonestlyFlip` | **false** |

## 请审什么（mw-rag-route 视角）

1. **触碰面与产品零触碰（本刀第一审点）**：两分支触碰面 = Branch A 零码改（prove 产物 + receipt + docs）/ Branch B 仅 prove 基建（`scripts/uc018-perf-load-capped-child.mjs` · `scripts/run-e2e-isolated.mjs` 相关面 + 测试）。**Ban 碰产品 `packages/db/src/principal.ts`**（P 线 `56fc1ea` CLOSED-fixed，backlog `:359` 原钉）；Ban 借刀改任何 outbound 主链（HTTP client / ai-graphs / **qdrant / rag-control** / redis）；Ban 动 worker/rag/saver 路径。请审 REQUEST 对触碰面的自证是否完备、Branch B 触发条件是否可能被用来扩大触碰面。
2. **同族不同 scope 的边界（Ban 互借）**：本缺陷属 prove 基建层，与 P 线产品池缺陷 `GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER`（CLOSED-fixed）同族不同 scope（M 线钉死、P 线 backlog `:359` 复钉「C-PERF-TEARDOWN 不互借」）。请审：本刀复用 P 线**读码事实**（pg@8.22.0/pg-pool@3.14.0 发射语义、崩溃帧同形）是否合法、而复用 P 线**关闭结论**（宣称本条件已闭）是否越界——REQUEST 的立场（事实可引、关闭须自证复跑）是否守住。
3. **根因判定独立性**：REQUEST 判定「proof 进程全部 pg 面走 `createPool()`（`db.service.ts:7`）→ P 修复结构覆盖」须 file:line 复核（wrapper `uc018-perf-load-capped-child.mjs:1-204` 零 pg · proof `h.pool` 唯一 pg 面 · `apps/api/src` 无独立 Client/Pool · abandon 同池 `interview.service.ts:494-513`/`commerce.ts:243-251` · saver 仅 worker 且包 createPool DbPool `checkpoint-principal.ts:128-131`）；残余面 `run-e2e-isolated.mjs:1889-1890` HOST_SQL_PROBE 是否如实披露且其「非 attempt1 签名」论证成立。Ban 未复核即采信。
4. **隔离与安全**：prove 走 `run-e2e-isolated.mjs` 既有隔离壳（fresh 隔离 PG · per-run 随机容器 · 动态端口 · attestation · caps 经 capped-child `_caps-evidence.json`）零放宽；frozen-lockfile；committed SHA 钉死；Ban secrets/`.env*` 入树入 receipt；receipt 脱敏沿用 `uc-e2e-018-perf-load.proof.ts:114-124` 红act 惯例（连接串/凭据/PGPASSWORD/Bearer）；`releaseEvidence=false`。
5. **attempt 台账与复跑诚实**：≥3 attempts one-shot 全记录（EXIT + 时间戳 + machine receipt）；**Ban retry-to-green**、Ban 弃 attempt、Ban 把 attempt1（`b29c191`，P 修复前的真实缺陷证据）洗成 flake——attempt2=0 不洗 attempt1（`README.md:39-41` 原钉口径）。任一 attempt 仍现 unhandled crash → EXIT1 诚实保留 + 根因重新钉（Branch B），不得迁就复跑绿。
6. **行冻结与 SSOT**：backlog `:35` `C-PERF-TEARDOWN` stays CONDITION OPEN（canHonestlyFlip=false）；**Ban 互借关闭 `C-IMAGE-DIGEST`**（其修复已落 `8b07308`、待真实 emit 实证，归它自己的条件链）；Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 / UC-014·026 任何行/文件；Ban 翻任何 SSOT 行；PERF/LOAD **stays local partial**（local ≠ capacity ≠ HA · capacityRepresentative=false）；coveredCount=8 不变；EXIT=0 ≠ 翻行 ≠ covered ≠ 条件关闭（还须 post-prove dual PASS + 协调方授权）。
7. **非本域越界检查（rag-route 视角）**：本刀不触 Qdrant/RAG 面任何 prove、配置、fixture（PERF/LOAD 本就 Ban MySQL/Qdrant fixtures，proof 头注 `uc-e2e-018-perf-load.proof.ts:9` 原钉）；若 Branch B 基建修复波及 `run-e2e-isolated.mjs` 公共路径，须证明对其余 prove 目标零行为改变（或逐项披露）。

Row `C-PERF-TEARDOWN` stays CONDITION OPEN. **Ban covered** · **Ban 碰产品 principal.ts** · **Ban 互借关闭 C-IMAGE-DIGEST** · **Ban retry-to-green · attempts 全记录**。

本 stub 不授权 coding / prove / push。pre-exec dual PASS 后由协调方授权 prove；implementer 不自批。Dual PASS ≠ coding ≠ nail（≠ 条件关闭）。

---

*Stub · awaiting expert pre-exec dual · STOP*

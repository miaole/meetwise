# Slice — **C-PERF-TEARDOWN 根因刀**（Line S · docs REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · backlog `:35` stays CONDITION OPEN · canHonestlyFlip=false）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF/LOAD stays local partial · capacityRepresentative=false
**Date**: 2026-10-05
**Base**: `origin/feat/mysql-schema-skeleton` · `377e7fc4fa1b35b85ebf524b668469caf66de2bc`
**Authority**: meetwise — L0 docs only · Ban coding · Ban prove 执行 · Ban push · Ban self-approve

## One-line

PERF-LOAD@`b29c191` 双审复跑 attempt1=1（prove **内部** pg Client unhandled `Connection terminated unexpectedly`，mid-prove 崩溃于 run2 后/run3+SUMMARY 前；退出路径 `scripts/uc018-perf-load-capped-child.mjs:202-204`）· attempt2=0 → **FAIL-UNREPRODUCED-ON-FIRST，条件 C-PERF-TEARDOWN 保留**（backlog `:35` · correction dual `0d42e2c` §2 `:369-397` · RE-REVIEW `07823b5` §5 `:475-481`）。根因判定（file:line 实证）：capped-child wrapper 本身零 pg 依赖（`:1-204`），崩溃进程 = docker 容器内 `apps/api/test/uc-e2e-018-perf-load.proof.ts`，其唯一 pg 面 `h.pool` 经 `_neg-harness.ts:43/:56-58` → `db.service.ts:7` **`createPool()`**——attempt1 时（2026-09-23，早于 P 修复）该工厂**零 error 监听** ⇒ unhandled ⇒ 崩；base tip `377e7fc` 已含 P 修复 `f19ecba`（=P 线 `56fc1ea` 同 patch：`principal.ts:928-931` 池级+per-client 观测，WeakSet 去重），产品 abandon 路径同池直连 SQL（`interview.service.ts:494-513` · `commerce.ts:243-251`），worker/saver 不在 proof 进程且 saver 亦包 createPool DbPool。**结论：P 修复已结构性覆盖 attempt1 崩溃路径（Branch A）——本刀转为复跑验证 + 关闭证据刀**（committed SHA `pnpm uc018:perf-load:prove` 多 attempt，frozen-lockfile，fresh 隔离 PG，attempts 全记录，Ban retry-to-green）；备用 Branch B（复跑仍崩则基建层 fail-closed 观测，Ban 碰产品 principal.ts）。残余披露：`run-e2e-isolated.mjs:1889-1890` HOST_SQL_PROBE 独立 Client 为唯一未走 createPool 面（boot 期短命子进程探针，非 attempt1 签名）+ P 线 residual P-1/P-3 随链。

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-perf-teardown-rootcause-fix.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-05-gap-perf-teardown-rootcause-fix-mw-e2e-ha.md` |
| Dual `mw-rag-route` | `reviews/REQUEST-2026-10-05-gap-perf-teardown-rootcause-fix-mw-rag-route.md` |

## Scope / Not

只做 backlog `gap-bug-backlog.md:35` **C-PERF-TEARDOWN**（P1 · CONDITION OPEN）的根因判定 + 复跑验证/基建修复 REQUEST。执行触碰面：Branch A = prove 产物 + receipt + docs（零码改）；Branch B = `uc018-perf-load-capped-child.mjs` / `run-e2e-isolated.mjs` 相关基建 + 测试；两分支 **Ban 碰产品 `packages/db/src/principal.ts`**（P 线 CLOSED-fixed）。Ban 互借关闭 `C-IMAGE-DIGEST`（其修复已落 `8b07308`、待真实 emit 实证，归它自己的条件链）；Ban 互借 P 线成果宣称「已关闭」。Not UC-018 翻行刀：**PERF/LOAD stays local partial**（P 线已钉口径）· local ≠ capacity ≠ HA · `capacityRepresentative=false` · `haStatus=NOT_HA` 不变 · coveredCount=8 不变。

诚实条款：attempt1 是 P 修复落地前的真实缺陷证据——**Ban 洗成 flake**、attempt2=0 不洗 attempt1（`README.md:39-41` 口径「Do not claim the second exit washes the first」原样）。关闭只能由本刀自己的复跑证据（attempts 全录 + unhandled crash 零复现 + 错误观测路径成立）+ post-prove dual PASS + 协调方授权产生；**canHonestlyFlip=false**，backlog `:35` 在此之前 stays CONDITION OPEN。

## Ban

Ban coding · Ban prove 执行（pre-exec dual PASS 后由协调方授权）· Ban push · Ban covered · Ban 翻任何 SSOT 行 · Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 / UC-014·026 任何行/文件 · Ban 碰产品 principal.ts · Ban 互借关闭 C-IMAGE-DIGEST · Ban 把 attempt1 洗成 flake · Ban retry-to-green · Ban 弃 attempt · Ban 吞错/伪装成功/静默重试 · Ban 全局 uncaughtException 兜底 · Ban 观测面发明健康叙事（NOT_HA 不变）· Ban self-approve（alone ≠ dual）。

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · PERF/LOAD stays local partial · capacityRepresentative=false · canHonestlyFlip=false.

*Slice · C-PERF-TEARDOWN · rootcause + re-run/close-evidence knife · awaiting_pre_exec_dual · OPEN · STOP*

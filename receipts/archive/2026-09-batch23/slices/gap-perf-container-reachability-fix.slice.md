# Slice — **perf-load 双容器可达性修复刀**（Line SS · REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs-only REQUEST · Ban coding · Ban prove 执行 · Ban push · Ban self-approve · alone ≠ dual · pre-exec dual PASS 后由协调方授权 coding）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF/LOAD stays **local partial** · capacityRepresentative=**false** · canHonestlyFlip=**false**
**Date**: 2026-10-05
**Base**: `origin/feat/mysql-schema-skeleton` · `4766d4fc2a9d06f2d95a7ab7759430c4cc494bfc`（fetch 网络超时，以本地实际 ref 为准 · 满足预期 ≥`4766d4fc`）
**Authority**: meetwise — L0 docs only · Ban coding · Ban prove 执行 · Ban push · Ban self-approve

## One-line

S 线 C-PERF-TEARDOWN Branch A 关闭复跑被**新基建缺陷**阻断：`uc018:perf-load:prove` 是双容器刀（隔离 PG `-p 127.0.0.1::5432` 发布 + API 容器 `meetwise-uc018-perf-api-*` `--network=host`，capped-child `scripts/uc018-perf-load-capped-child.mjs:18/:136-157/:202`），API 容器内 proof 进程启动期 `assertIsolatedTestTarget` → `assertIsolatedTestEnvironment` 强制 `PGHOST==='127.0.0.1'`（`packages/db/src/isolated-test-target.ts:62`，`destructive_proof_loopback_target_required`；台账引 `:59` 为行漂移）以 `127.0.0.1:<PG发布端口>` 连 PG——Docker Desktop/macOS `--network=host` = VM 网络栈语义下**宿主 loopback 发布端口在容器内不可达** → ECONNREFUSED → `docker start -a` exit 1 → ELIFECYCLE 1。共 **7 次全 EXIT=1**（S 台账 `receipts/2026-10-05-c-perf-teardown-branch-a-blocked-ledger.md`，commit `44154aa5` 已推；前 4 次归因陈旧 node_modules，正式 attempt-1/2/3 全 ECONNREFUSED 同点）；宿主→发布端口 HOST-CONNECT-OK、PG 容器内 pg_isready OK → 缺陷定位于容器拓扑而非 PG 本体。**本刀 = 修复方案 REQUEST**：候选 1（bridge + `host.docker.internal` + PGHOST 注入，assert 两值字面白名单最小放宽——实现方倾向）；候选 2（双容器同网 + PG 不发布 + 容器 DNS，assert 等值锚定 `E2E_TEST_CONTAINER`——触碰面最大）；候选 3（socat sidecar，assert 零改但邻接 C-IMAGE-DIGEST + 沉默失败面——不推荐）。共同硬约束：fail-closed assert 语义不得静默放松（nonce 绊线 `:65/:73-77` 不动）、Ban 全局 uncaughtException 兜底、Ban 碰产品 principal.ts、错误必被观测。prove 契约：`pnpm uc018:perf-load:prove` ≥3 attempts（frozen-lockfile · fresh 隔离 PG · 全台账 Ban retry-to-green），PERF/LOAD stays local partial · capacityRepresentative=false，阈值未达 EXIT=1 诚实保留；关闭判据三分复用 S 线 Branch A 口径（零 unhandled crash + run3/SUMMARY 完整到达 + `db_pool_error` 诚实判）——**本刀 prove 通过即同时产出 C-PERF-TEARDOWN（backlog `:35`）Branch A 关闭证据（经 post-dual + nail 全链，Ban 本刀自关）**。

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-perf-container-reachability-fix.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-05-gap-perf-container-reachability-fix-mw-e2e-ha.md` |
| Dual `mw-privacy-int` | `reviews/REQUEST-2026-10-05-gap-perf-container-reachability-fix-mw-privacy-int.md` |

## Scope / Not

只做 perf-load 双容器可达性缺陷（`C-PERF-CONTAINER-REACHABILITY` · 登记编号由协调方裁决）的判定 + 修复方案 REQUEST。执行触碰面：`scripts/uc018-perf-load-capped-child.mjs` + `scripts/run-e2e-isolated.mjs` 相关容器编排 +（仅候选 1/2 且双审批准）`packages/db/src/isolated-test-target.ts` assert 白名单 + 测试；**Ban 碰其他 prove 的容器编排**（除非共享函数改动且逐项披露零行为变化）；**Ban 碰产品 `packages/db/src/principal.ts`**（P 线 CLOSED-fixed）；**Ban 关 C-IMAGE-DIGEST**（其条件链归它自己，候选 3 镜像变更须另开授权）。Not UC-018 翻行刀：**PERF/LOAD stays local partial** · local ≠ capacity ≠ HA · `capacityRepresentative=false` · `haStatus=NOT_HA` 不变 · coveredCount=8 不变。Ban 互借 P 线成果（backlog `:359`）与 C-PERF-TEARDOWN 已有 nail（backlog `:423-429`，post_prove_dual_pass · CONDITION OPEN retained）宣称新缺陷已修或条件已关——关闭只能由本刀自己的 prove 证据 + post-prove dual BOTH PASS + 协调方产生；**canHonestlyFlip=false**。

## Ban

Ban coding · Ban prove 执行（pre-exec dual PASS 后由协调方授权 coding）· Ban push · Ban covered · Ban 翻任何 SSOT/backlog 行 · Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 / UC-014·026 任何行/文件 · Ban 碰产品 principal.ts · Ban 关 C-IMAGE-DIGEST · Ban 碰其他 prove 容器编排（共享函数改动须逐项披露零行为变化）· Ban 放松 fail-closed assert（nonce 绊线不动 · 白名单须最小化且双审批准）· Ban 开放任意 host · Ban 云分支（`assertCloudPrivateTestEnvironment`）联动放宽 · Ban 全局 uncaughtException/unhandledRejection 兜底 · Ban 吞错/伪装成功/静默重试 · Ban 观测面发明健康叙事（NOT_HA 不变）· Ban retry-to-green · Ban 弃 attempt · Ban 洗 7 次 EXIT=1 台账 · Ban secrets / `.env*` · Ban force-push · Ban self-approve（alone ≠ dual）。

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · PERF/LOAD stays local partial · capacityRepresentative=false · canHonestlyFlip=false.

*Slice · C-PERF-CONTAINER-REACHABILITY · dual-container reachability fix knife · REQUEST awaiting pre-exec dual · OPEN · STOP*

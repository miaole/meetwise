# REQUEST — **perf-load 双容器可达性修复刀 · 缺陷判定 + 修复方案候选裁决 + prove 契约** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF/LOAD stays local partial · capacityRepresentative=false · canHonestlyFlip=false
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-perf-container-reachability-fix.md` · slice `gap-perf-container-reachability-fix.slice.md`
**Parent tip**: `4766d4fc`（`4766d4fc2a9d06f2d95a7ab7759430c4cc494bfc` · series open · not a prove tip）
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

## 请审什么（mw-e2e-ha 视角）

本刀为 S 线 C-PERF-TEARDOWN Branch A 复跑被双容器可达性缺陷阻断（7 次全 EXIT=1，台账 commit `44154aa5`）求修复方案裁决与 prove 授权。请审：

1. **缺陷判定的可复核性（本刀核心）**：REQUEST 断言「API 容器（`--network=host`）内 proof 进程以 `127.0.0.1:<发布端口>` 连 PG 在 Docker Desktop/macOS 下不可达」——请逐条核 file:line：双容器拓扑（PG `run-e2e-isolated.mjs:2124-2131` `-p 127.0.0.1::5432` + 动态端口 `:2133-2137` + baseEnv `:1805-1816`；API 容器 `uc018-perf-load-capped-child.mjs:18/:136-157` `--network host` + `docker start -a` `:202`）；assert 强制 `PGHOST==='127.0.0.1'`（`packages/db/src/isolated-test-target.ts:62`，台账引 `:59` 为行漂移——请核断言文本逐字一致）；阻断证据链（7 次 EXIT=1 · attempt-1/2/3 ECONNREFUSED 同点 · HOST-CONNECT-OK 对照 · pg_isready exec 对照）。**请独立验证判定，Ban 采信实现方读码而不复核**。
2. **候选方案裁决（≥2 交双审）**：候选 1（bridge + `--add-host=host.docker.internal:host-gateway` + 注入 `PGHOST=host.docker.internal`；assert 白名单放宽为**仅两字面量** `'127.0.0.1'|'host.docker.internal'`）vs 候选 2（双容器同 user-defined 网络 + PG 不发布 + 容器 DNS；assert 等值锚定 `E2E_TEST_CONTAINER`）vs 候选 3（socat sidecar · assert 零改但邻接 C-IMAGE-DIGEST + 新增沉默失败面——不推荐）。请裁：assert 放宽面是否最小、fail-closed 是否不破坏、触碰面/回归面评估是否成立。
3. **fail-closed 语义（双审核心裁定点）**：destructive 证明真正绊线 = `E2E_ISOLATED==='1'` + `DATABASE_URL` 禁用（`:61`）+ `E2E_TEST_CONTAINER`/`E2E_TEST_TARGET_TOKEN` attestation（`:65`）+ 服务端 nonce 比对（`:73-77`）；`PGHOST` 字面 loopback（`:62`）为 belt。请验证：两值/等值白名单**不开放任意目标、不触碰 nonce 绊线、宿主侧主链 `PGHOST:'127.0.0.1'`（`run-e2e-isolated.mjs:1812`）与其余 prove 目标零行为变化**；Ban 云分支（`assertCloudPrivateTestEnvironment` `:24-46`）联动放宽；Ban 前缀/正则/环境变量开关式白名单。
4. **prove 契约**：`pnpm uc018:perf-load:prove` @ coding commit SHA（frozen-lockfile · fresh 隔离 PG per attempt · caps 证据 `_caps-evidence.json` 不变）≥3 attempts one-shot 全台账；关闭判据三分复用 S 线 Branch A 口径：(a) 零 unhandled crash/`Unhandled 'error' event` (b) 每次至 run3+`SUMMARY` 完整到达 (c) 真实连接断 → `db_pool_error` 结构化日志可见 + errorRate/missReasons 诚实 FAIL/PASS。可达性关闭目标 = 零 `ECONNREFUSED 127.0.0.1:<port>` @ assert 点。任一 attempt 仍现可达性崩溃 → EXIT1 诚实保留 + 根因重新钉；**Ban retry-to-green · Ban 弃 attempt · Ban 洗 7 次 EXIT=1 台账**。
5. **阈值正交性**：run 级阈值（p50/p95/p99/err/caps）与可达性缺陷正交——阈值 miss → EXIT=1 诚实保留，不是本刀失败条件、Ban 洗成关闭证据；本刀关闭证据 Ban 外推为阈值面转绿。
6. **PERF/LOAD 行冻结**：PERF/LOAD stays **local partial** · `capacityRepresentative=false` · prove EXIT=0 不构成 UC covered、不翻 §1.1、不动 coveredCount=8；backlog `:35` C-PERF-TEARDOWN stays CONDITION OPEN——本刀 prove 通过仅**产出** Branch A 关闭证据，关闭须经 post-prove dual BOTH PASS + 协调方 nail 全链，**Ban 本刀内自关**。
7. **触碰面纪律**：仅 `uc018-perf-load-capped-child.mjs` + `run-e2e-isolated.mjs` 相关容器编排 +（候选 1/2 且批准）`isolated-test-target.ts` assert 白名单 + 测试；**Ban 碰其他 prove 的容器编排**（共享函数改动须逐项披露零行为变化）；**Ban 碰产品 `packages/db/src/principal.ts`**（P 线 CLOSED-fixed，`backlog :359`）；**Ban 关 C-IMAGE-DIGEST**。
8. **Ban 全局 `uncaughtException`/`unhandledRejection` 兜底** · 错误必被观测（结构化日志）· Ban 吞错/伪装成功/静默重试 · Ban 观测面发明健康叙事（haStatus=NOT_HA 不变）。

Row `C-PERF-TEARDOWN` stays CONDITION OPEN · new `C-PERF-CONTAINER-REACHABILITY` 登记编号由协调方裁决。**Ban covered** · **Ban 翻任何 SSOT/backlog 行** · **Ban secrets / `.env*` · Ban push · Ban force-push**。

本 stub 不授权 coding / prove / push。pre-exec dual PASS 后由协调方授权 coding；implementer 不自批。Dual PASS ≠ coding ≠ prove ≠ nail（≠ 条件关闭）。

---

*Stub · awaiting expert pre-exec dual · STOP*

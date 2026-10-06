# REQUEST — **perf-load 双容器可达性修复刀 · 缺陷判定 + 修复方案候选裁决 + prove 契约** · pre-exec · mw-privacy-int

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF/LOAD stays local partial · capacityRepresentative=false · canHonestlyFlip=false
**Expert**: `mw-privacy-int`
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

## 请审什么（mw-privacy-int 视角 · assert 语义涉 privacy 授权根域邻接）

`packages/db/src/isolated-test-target.ts` 是 destructive proof 的 fail-closed 目标闸——其语义属 privacy/授权根域邻接面（destructive SQL 只能落在已 attest 的隔离靶上，是"数据只被授权路径触碰"根域的基建前提）。本刀拟动该文件 `:62` 白名单，请以 fail-closed 根域守护者身份审：

1. **assert 放宽的 fail-closed 论证（本刀核心裁定点）**：REQUEST 拆解 assert 为「belt（`PGHOST` 字面 loopback `:62`）+ suspenders（`E2E_ISOLATED==='1'` + `DATABASE_URL` 禁用 `:61` + `E2E_TEST_CONTAINER`/`E2E_TEST_TARGET_TOKEN` attestation `:65` + 服务端 nonce 比对 `:73-77`）」——请独立验证：任一候选的白名单放宽**不触碰 nonce 绊线、不开放任意 host、不引入"从开发者 shell 推断目标"的新通道**；`PGHOST=host.docker.internal`（候选 1）或 `PGHOST===E2E_TEST_CONTAINER`（候选 2）是否仍能被"无 attestation 的任意进程"利用绕过（攻击面推演：非 isolated 进程伪造两个白名单值能否连上生产/开发库——请给否定论证或否决）。
2. **白名单形态最小性**：候选 1 = 仅两字面量；候选 2 = 名称等值锚定 attestation 容器名。请裁哪个形态对 fail-closed 语义破坏面更小；**Ban 前缀/正则/环境变量开关/任意 host**；**Ban 云分支（`assertCloudPrivateTestEnvironment` `:24-46`，含 `privateIpv4`/TLS attestation 面）联动放宽**。
3. **错误观测与诚实失败**：修复后 assert 失败/连接失败仍必须显式抛错并被观测（结构化日志），**Ban 全局 `uncaughtException`/`unhandledRejection` 兜底、Ban 吞错/伪装成功/静默重试**——可达性修复 Ban 演变成"连不上就换路连"的静默降级。
4. **数据面零外溢**：本刀只动 prove 容器编排 + assert 白名单，**Ban 碰产品 `packages/db/src/principal.ts`**（P 线 CLOSED-fixed）· Ban 改连接参数语义（TLS/角色/GUC）· Ban 碰 `DATABASE_SSL_MODE`/`DATABASE_URL` 禁令 · 隔离 PG 生命周期惯例（per-run 随机容器 + token GUC + teardown）不变。
5. **prove 契约复核**：≥3 attempts（frozen-lockfile · fresh 隔离 PG · 全台账 Ban retry-to-green · Ban 洗 7 次 EXIT=1 台账）；关闭判据三分复用 S 线 Branch A 口径（零 unhandled crash + run3/SUMMARY 完整到达 + `db_pool_error` 诚实判）；阈值 miss → EXIT=1 诚实保留（Ban 洗成关闭证据）。
6. **行冻结与隐私面**：PERF/LOAD stays **local partial** · `capacityRepresentative=false` · coveredCount=8 不变；backlog `:35` C-PERF-TEARDOWN stays CONDITION OPEN（本刀 prove 通过仅产出 Branch A 关闭证据，关闭经 post-dual + 协调方，Ban 自关）；UC-050-052 privacy-erasure 及 `privacy-authorization` prove 链零触碰；**Ban 关 C-IMAGE-DIGEST**；new `C-PERF-CONTAINER-REACHABILITY` 登记编号由协调方裁决。
7. **触碰面纪律**：仅 `uc018-perf-load-capped-child.mjs` + `run-e2e-isolated.mjs` 相关容器编排 +（候选 1/2 且批准）`isolated-test-target.ts` + 测试；Ban 碰其他 prove 的容器编排（共享函数改动须逐项披露零行为变化）。

**Ban covered** · **Ban 翻任何 SSOT/backlog 行** · **Ban secrets / `.env*` · Ban push · Ban force-push**。

本 stub 不授权 coding / prove / push。pre-exec dual PASS 后由协调方授权 coding；implementer 不自批。Dual PASS ≠ coding ≠ prove ≠ nail（≠ 条件关闭）。

---

*Stub · awaiting expert pre-exec dual · STOP*

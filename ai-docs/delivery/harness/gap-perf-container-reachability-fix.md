# Harness — **perf-load 双容器可达性修复刀**（Line SS · REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs-only REQUEST · Ban coding · Ban prove · Ban push · pre-exec dual PASS 后由协调方授权 coding · Ban self-approve · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF/LOAD stays **local partial** · capacityRepresentative=**false** · canHonestlyFlip=**false**
**Date**: 2026-10-05
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`4766d4fc`** / full `4766d4fc2a9d06f2d95a7ab7759430c4cc494bfc`（fetch 网络超时，以本地实际 ref 为准，满足预期 ≥`4766d4fc`）
**Knife**: **perf-load 双容器可达性修复刀**（Line SS · 新基建缺陷）——`uc018:perf-load:prove` 双容器拓扑在 Docker Desktop/macOS 下 API 容器不可达宿主 loopback 发布端口的缺陷判定 + 修复方案候选（≥2 交双审裁）+ prove 契约；不是 P 线借刀、不是 UC-018 翻行刀、不是 C-IMAGE-DIGEST 刀
**Gap id**: **`C-PERF-CONTAINER-REACHABILITY`**（新基建缺陷签名 · 登记/backlog 编号由协调方裁决 · 本 REQUEST 只提交判定与方案，Ban 自翻任何行）
**关联条件**: `C-PERF-TEARDOWN`（backlog `:35` · **stays CONDITION OPEN**）——本刀 prove 通过即同时产出其 Branch A 关闭证据（经 post-dual + nail 全链）；**Ban 本刀内自关**。
**Experts**: `mw-e2e-ha` + `mw-privacy-int`（stubs PENDING · Ban self-approve · alone ≠ dual；assert 语义涉 privacy 授权根域邻接 → privacy-int 入 dual）
**Authority**: meetwise — docs REQUEST only · Ban secrets / `.env*` · Ban force-push · Ban push · Ban SSOT edit · Ban coding

## 缺陷如实陈述（证据链全引 · 全部本机 tip `4766d4fc` 实码锚点）

`uc018:perf-load:prove` 是**双容器刀**：三层链 `package.json:126-127`（runner → `:raw` → capped-child）。

1. **隔离 PG 容器**：`scripts/run-e2e-isolated.mjs:2124-2131` `docker run --rm -d … --cpus 2 --memory 4g … -p 127.0.0.1::5432 <image> postgres -c meetwise.e2e_run_token=<token>`——端口**仅发布到宿主 loopback**；`:2133-2137` `docker port` 解析得动态 `PGPORT`；`:1805-1816` baseEnv 注入 `E2E_ISOLATED:'1'` · `E2E_TEST_CONTAINER`（`:1809`）· `E2E_TEST_TARGET_TOKEN`（`:1810`）· `PGHOST:'127.0.0.1'`（`:1812`）。
2. **API 容器**：`scripts/uc018-perf-load-capped-child.mjs:18` `meetwise-uc018-perf-api-*`；create 形态 `:136-157`（`--network host` `:141`）→ inspect → `docker start -a` `:202`；`--network=host` 意在 caps 度量同栈（`--cpus=2 --memory=4g` `:137-138`）；passEnv `:89-103` 透传 `PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE` 等（**无 DATABASE_URL**——assert 禁）。
3. **崩溃点**：API 容器内 proof 进程（`node --import @swc-node/register/esm-register test/uc-e2e-018-perf-load.proof.ts`，capped-child `:151-157`）启动期 `assertIsolatedTestTarget`（`packages/db/src/isolated-test-target.ts:70-78`）→ `assertIsolatedTestEnvironment` **强制 `PGHOST === '127.0.0.1'`**（`:62`，错误码 `destructive_proof_loopback_target_required`）→ 以 `127.0.0.1:<PG发布端口>` 连 PG。
4. **根因**：Docker Desktop/macOS（29.1.3）`--network=host` = **VM 网络栈**语义（容器共享的是 Docker VM 的网络命名空间，非 macOS 宿主）→ 宿主 loopback 发布端口在 API 容器内**不可达** → ECONNREFUSED → `docker start -a` exit 1（capped-child `:202-204` 透传）→ ELIFECYCLE 1。
5. **阻断证据**：S 台账 `receipts/2026-10-05-c-perf-teardown-branch-a-blocked-ledger.md`（commit **`44154aa5`** 已推）：共 7 次全 EXIT=1（前 4 次归因陈旧 node_modules 缺 workspace 链接；正式 attempt-1/2/3 全部 `ECONNREFUSED 127.0.0.1:<port>` @ assert 点，receipt `bc195ca5…`/`ea57a86a…`/`30476649…`，日志 `.tmp/s-attempt-{1,2,3}.log`）。
6. **对照实证（缺陷定位于容器拓扑而非 PG 本体）**：宿主 → 已发布端口连通性 OK（throwaway 容器 HOST-CONNECT-OK）；PG 容器内 `pg_isready` OK（就绪检查走 exec，不经网络发布面）。
7. **台账行号漂移披露**：台账引 assert 点为 `isolated-test-target.ts:59`，tip `4766d4fc` 实码该断言在 `:62`（后续提交致行漂移，断言文本与错误码逐字一致，判定不受影响）。

**性质**：容器可达性缺陷 = **新基建缺陷签名**，超出 S 线预授权 Branch B（观测修复）范围 → 开本刀（Line SS）。与 P 线 `GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER`（backlog `:359` CLOSED-fixed）同族不同 scope，**Ban 互借**；与 C-PERF-TEARDOWN（backlog `:35`，Line S nail `post_prove_dual_pass` 后仍 CONDITION OPEN，backlog `:423-429` 原钉）是"新缺陷阻断关闭证据复跑"关系，**Ban 混同**。

## 修复方案候选（≥2 · 列利弊交双审裁 · 本 commit 不写码）

**共同硬约束（违反任一 = 执行层 FAIL）**：`assertIsolatedTestEnvironment` 的 `PGHOST=127.0.0.1` **fail-closed assert 语义不得静默放松**（任何放宽须双审批准 + 最小化 + 论证不破坏 fail-closed）；**Ban 全局 `uncaughtException`/`unhandledRejection` 兜底**；**Ban 碰产品 `packages/db/src/principal.ts`**（P 线 CLOSED-fixed）；错误必被观测（结构化日志，Ban 吞错/伪装成功/静默重试）；观测 = 故障观测非健康证明。

**fail-closed 语义拆解（两候选共同的裁定基础）**：destructive 证明真正的绊线是——`E2E_ISOLATED==='1'` + `DATABASE_URL` 禁用（`:61`）+ `E2E_TEST_CONTAINER`/`E2E_TEST_TARGET_TOKEN` attestation（`:65`）+ **服务端 custom setting nonce 比对**（`:73-77`，`assertIsolatedTestTarget` 只读查询 `meetwise.e2e_run_token`）。`PGHOST` 字面 loopback（`:62`）是防"开发者 shell 目标误连"的 belt；**放宽 PGHOST 白名单不触碰 nonce 绊线**，fail-closed 主干保持。

### 候选 1：API 容器改 docker bridge + `host.docker.internal`（实现方倾向 · 推荐）

capped-child 去掉 `--network host`（`:111`/`:141`），改默认/user-defined bridge + `--add-host=host.docker.internal:host-gateway`；注入 `PGHOST=host.docker.internal`（覆盖 baseEnv 透传值，仅 perf 目标）。

- **利**：单点触碰（仅 capped-child docker 参数 + env 注入）；PG 侧编排零改动（`-p 127.0.0.1::5432` 发布惯例、`docker port` 解析、token GUC 全不变）；Docker Desktop/macOS 官方语义（`host.docker.internal` 可达宿主 loopback 发布端口）；caps 证据链不变（仍 create→inspect→start -a，`_caps-evidence.json` 结构不变）。
- **弊 / assert 影响**：与 `:62` 字面断言冲突 → **须同步最小放宽 assert**：白名单**仅两个字面量** `'127.0.0.1' | 'host.docker.internal'`（Ban 前缀/正则/环境变量开关/任意 host；Ban 云分支 `:24-46` 联动放宽）。fail-closed 论证：两值均非任意目标——宿主侧 prove 主链仍恒 `127.0.0.1`（baseEnv `:1812` 不变，其余 50+ prove 目标零行为变化）；`host.docker.internal` 仅容器内可解析且仅出现在 perf 双容器刀内，仍受 `E2E_ISOLATED` + attestation + nonce 绊线约束。错误码建议保留原码或新增专用码（如 `destructive_proof_loopback_or_hostgateway_required`），由双审裁。
- **测试面**：`packages/db` assert 单测新增两值边界 + 非白名单值仍拒绝（fail-closed 反证）。

### 候选 2：双容器同 docker 网络 + PG 不发布宿主端口，容器 DNS 直连

perf 目标下 PG 容器加入 user-defined bridge 网络、去掉 `-p` 发布；capped-child API 容器同网络，`PGHOST=<PG容器名>`（容器 DNS 直连）。

- **利**：零宿主发布面（最小攻击面）；无 host-gateway 依赖。
- **弊 / assert 影响**：触碰面最大——`run-e2e-isolated.mjs` PG 编排须按目标分支（`-p` 移除 → `docker port` 解析 `:2133-2137` 失效）、`waitForPostgres`（`:2013/:2138` 宿主探针不可达容器网络 → 须改 docker exec `pg_isready` 或网内探针）、capped-child 网络 flag 三处；assert 放宽面更大：`PGHOST === env.E2E_TEST_CONTAINER` 等值锚定（名称等值校验 vs 两值字面量，语义面更宽）。共享函数（`waitForPostgres` 等）改动须**逐项披露零行为变化**（其余目标路径逐字节不变），否则 Ban。
- **裁定提示**：若双审认"零发布面"优先级更高可裁此路，但实现方评估回归面 > 候选 1。

### 候选 3：socat / 端口转发 sidecar（列出但不推荐）

API 容器内 socat 转发或第三容器把宿主 loopback 发布端口转发进容器网络，容器内保持 `127.0.0.1:<port>` 字面。

- **利**：assert **零改动**（`:62` 原样）。
- **弊**：`node:20-bookworm` 无 socat → 须 apt 层装或自定义镜像 → **邻接 C-IMAGE-DIGEST 条件链（Ban 借本刀触碰，须另开授权）**；或三容器编排（capped-child 复杂度与失败面陡增）；转发器自身故障 = 新增沉默失败面，与"错误必被观测"要求正面冲突。**不推荐**，仅备案。

**决策**：交 pre-exec dual（mw-e2e-ha + mw-privacy-int）裁决；实现方倾向**候选 1**。若裁候选 1/2，`isolated-test-target.ts` assert 白名单改动随 coding commit 落地；若双审裁零码方案（如候选 3 变体），另行披露。

## prove 方案（授权后才执行）

- **CMD**：`pnpm uc018:perf-load:prove` @ coding commit SHA（候选 1/2 落码后）· `pnpm install --frozen-lockfile` · fresh 隔离 PG per attempt（per-run 随机容器 + 动态端口 + attestation 惯例不变）· caps 证据经 capped-child `_caps-evidence.json` 不变。
- **多 attempt 契约**：≥3 attempts（每次 fresh 隔离 PG 全新 prove，one-shot）；**attempts 全台账**（EXIT + 时间戳 + machine receipt），Ban 弃单、Ban retry-to-green。
- **预期（诚实契约）**：可达性修复后 perf 本体断言如实——**PERF/LOAD stays local partial · `capacityRepresentative=false`**；run 级阈值（p50/p95/p99/err/caps）与可达性缺陷正交——阈值未达 → EXIT=1 **诚实保留**（不是本刀失败条件，Ban 洗成关闭证据）；本刀唯一关闭目标 = **容器可达性缺陷不再复现**（零 `ECONNREFUSED 127.0.0.1:<port>` @ assert 点、零 assert 抛错、API 容器内进程真实连上隔离 PG）。
- **关闭判据三分（复用 S 线 Branch A 口径）**：全部 attempts (a) 零 unhandled crash / `Unhandled 'error' event`；(b) 每次运行至 run3 + `SUMMARY` 行完整到达；(c) 若真实发生连接断：`{"event":"db_pool_error",…}` 结构化日志可见 + 受影响 run 按 errorRate/missReasons **诚实 FAIL**（或阈值内诚实 PASS）——两种都入账。
- **C-PERF-TEARDOWN 联动（非互借）**：本刀 prove 通过 + post-prove dual BOTH PASS + 协调方 nail 全链 → 同时构成 C-PERF-TEARDOWN（backlog `:35`）Branch A 的关闭证据；**关闭动作只能由协调方执行，本刀 Ban 自翻行**（canHonestlyFlip=false）。若本刀 prove 仍 EXIT=1（可达性或其他）→ C-PERF-TEARDOWN stays OPEN，根因如实重新钉。
- **receipt 落点**：`ai-docs/delivery/receipts/`（拟 `2026-10-XX-gap-perf-container-reachability-fix-prove.md`）+ machine receipts 落 `.tmp/`。

## 边界 / Scope

- **执行触碰面**：`scripts/uc018-perf-load-capped-child.mjs` + `scripts/run-e2e-isolated.mjs` 相关容器编排 +（仅候选 1/2 且双审批准）`packages/db/src/isolated-test-target.ts` assert 白名单 + 对应测试。
- **Ban 碰其他 prove 的容器编排**（除非共享函数改动且逐项披露零行为变化）；宿主侧 baseEnv `PGHOST:'127.0.0.1'`（`:1812`）与其余 50+ prove 目标路径零行为变化。
- **Ban 碰产品** `packages/db/src/principal.ts`（P 线 CLOSED-fixed）· Ban 借刀改其他 outbound 主链。
- **Ban 关 C-IMAGE-DIGEST**（候选 3 若被裁需镜像变更，须另开授权，Ban 借本刀）。
- **Ban 翻行**：backlog `:35` C-PERF-TEARDOWN stays CONDITION OPEN；`C-PERF-CONTAINER-REACHABILITY` 登记/backlog 编号由协调方裁决；coveredCount=8 不变；PERF/LOAD 不翻行。
- Ban secrets / `.env*` · Ban force-push · **Ban push** · Ban Meridian · **Ban self-approve（alone ≠ dual）** · Ban 互借 P 线成果宣称本缺陷已修（关闭只能由本刀自己的 prove 证据 + post-dual + 协调方产生）。

## Pins

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · public DELETE=**503** · PERF/LOAD stays **local partial** · capacityRepresentative=**false** · canHonestlyFlip=**false** · backlog `:35` stays CONDITION OPEN · STOP

*Harness · C-PERF-CONTAINER-REACHABILITY · dual-container reachability fix knife · REQUEST `draft:awaiting_pre_exec_dual` · OPEN · STOP*

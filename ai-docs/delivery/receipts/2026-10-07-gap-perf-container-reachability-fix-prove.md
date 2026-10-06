# Prove receipt — **perf-load 双容器可达性修复刀**（Line SS · C-PERF-CONTAINER-REACHABILITY）

**Status**: prove executed · awaiting **post-prove dual**（mw-e2e-ha + mw-privacy-int · 协调方另派 · Ban self-approve · alone ≠ dual）
**Coding commit**: `f59c4d20`（branch `line/ss-container-reachability` · base = origin tip `017a178d` rebase 后 · 旧 REQUEST `7c523fb8` 与主线 `71ac2d44` 同补丁 rebase 自动 drop）
**Date**: 2026-10-07（UTC 时间戳 2026-10-06T17:xx）
**Executor**: mw-core（实现方 · 禁自批）
**Pins（原值 · 本 receipt 不改）**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · PERF/LOAD stays **local partial** · capacityRepresentative=**false** · canHonestlyFlip=**false** · backlog `:35` C-PERF-TEARDOWN **stays CONDITION OPEN**

## 1. Prove 契约执行

- **CMD**: `pnpm uc018:perf-load:prove` @ coding commit `f59c4d20`（工作树 tracked 面在全部 attempts 期间与 `f59c4d20` 逐字节一致；`git status` 空）。
- **安装**: `pnpm install --frozen-lockfile`（pnpm v10.18.0）。
- **fresh 隔离 PG per attempt**: 每 attempt 由 `scripts/run-e2e-isolated.mjs` 新建一次性 PG 容器（per-run 随机名 `meetwise-e2e-<pid>-<ts>` + `-p 127.0.0.1::5432` 动态发布端口 + `-c meetwise.e2e_run_token=<randomUUID>` GUC attestation，惯例零改动）。
- **caps 证据**: capped-child `_caps-evidence.json` 结构不变（`enforced=true` · pg/api NanoCpus=2000000000 · Memory=4294967296）。
- **machine receipts**: 每 attempt 由 runner 写 `LOCAL_ISOLATED_PROOF_RECEIPT`（含全 source sha256 digests，含修改后 `scripts/uc018-perf-load-capped-child.mjs`）。

## 2. Attempts 全台账（Ban 弃单 · Ban retry-to-green · Ban 洗账）

| # | 开始（UTC） | EXIT | 结果 | 隔离 PG（容器 · 端口） | machine receipt（sha256） | 失败类 |
|---|-------------|------|------|------------------------|---------------------------|--------|
| attempt-1 | 2026-10-06T17:07:22.161Z | **1** | failed | `meetwise-e2e-29235-1791306442159` · 57178 | `88cc807d18911bb09a1edbd8f3887f09968dc400f468f1bb6a0339bbeb6f1440` | **env 准备缺陷**（非可达性类，见下） |
| attempt-2 | 2026-10-06T17:16:22.976Z | **0** | passed | `meetwise-e2e-31027-1791306982975` · 58244 | `51eabff785e5d7f7cf7871f6c49b79ef0ef728de0897cc8b5211a29bb804ef8f` | — |
| attempt-3 | 2026-10-06T17:17:09.316Z | **0** | passed | `meetwise-e2e-31525-1791307029315` · 58375 | `88a72b82a267314f7b115850298d9ea54c5b8691eae2fad47a4126b6a03f27d2` | — |
| attempt-4 | 2026-10-06T17:17:44.279Z | **0** | passed | `meetwise-e2e-31953-1791307064278` · 58449 | `2666d69849751cf7e2a25928f27c8ee57661459035d6b9b8acad40a0ea4f9a2a` | — |

attempt-1 归因（如实 · 全文日志留存于 `.tmp/ss-attempt-1.log`，`.tmp` 设计性易失 · hash 上表）：API 容器内 proof 进程在**模块加载期**崩溃——`Cannot find module '@oxc-resolver/binding-linux-arm64-gnu'`（容器 bind-mount 宿主 node_modules，宿主 pnpm store 仅含 darwin 可选绑定）。发生在 `assertIsolatedTestTarget` **之前**，属 env 层缺陷（与 S 台账前 4 次"陈旧 node_modules"同类），**非本刀可达性缺陷类**（零 ECONNREFUSED）。

**env 层修复（untracked · 不入 commit · 全披露）**：

```
cp pnpm-workspace.yaml .tmp/pnpm-workspace.yaml.orig
printf 'supportedArchitectures:\n  os:\n    - darwin\n    - linux\n  cpu:\n    - arm64\n    - x64\n' >> pnpm-workspace.yaml
pnpm install --frozen-lockfile        # 1m54s · 新增 linux 可选绑定（oxc-resolver / @swc/core 等）
cp .tmp/pnpm-workspace.yaml.orig pnpm-workspace.yaml   # 立即还原
```

修复后 `git status` 空（tracked 面零残留）、workspace 链接（`@meetwise/ai-graphs` 等）在位。S 线先例：env 层修复如实披露、不计 coding（台账 `44154aa5` "重装修复（env 层）"）。

## 3. 关闭判据三分（复用 S 线 Branch A 口径 · 对 attempts 2/3/4 全部成立；attempt-1 为 (a) 的被观测硬失败）

- **(a) 零 unhandled crash / `Unhandled 'error' event`**：attempts 2/3/4 日志 grep `Unhandled|unhandledRejection|uncaughtException` = **0**（attempt-1 的模块加载失败为同步 throw 的显式观测崩溃：完整堆栈打印 + EXIT=1 + machine receipt `failed`——被观测、非吞没、非静默）。
- **(b) 每次运行至 run3 + `SUMMARY` 行完整到达**：attempts 2/3/4 均见 `PERF run1/2/3` + `LOAD run1/2/3` 全 passed + `SUMMARY allPass=true capsEnforced=true`。
- **(c) 真实连接断诚实判**：attempts 2/3/4 零 `db_pool_error` 事件（零真实断连 → 该判据空满足；若发生则按 errorRate/missReasons 诚实 FAIL/PASS 入账）。

## 4. 本刀唯一关闭目标：容器可达性缺陷不再复现

- **零 `ECONNREFUSED 127.0.0.1:<port>` @ assert 点**：全部 4 attempts 日志 grep `ECONNREFUSED` = **0**。S 台账 7×EXIT=1 的同点崩溃（receipt `bc195ca5…`/`ea57a86a…`/`30476649…` 历史，**原样保留不洗**）不再复现。
- **API 容器内进程真实连上隔离 PG**：attempts 2/3/4 PERF/LOAD 六组 run 均为真实 PG 往返延迟量测（p50≈23-31ms PERF / 40-62ms LOAD，err=0 timeout=0）——容器内 proof 进程经 `host.docker.internal` 命中宿主 loopback 发布端口。
- **机制正证探针**（对应 S 台账 HOST-CONNECT-OK 口径）：`docker run --rm --add-host=host.docker.internal:host-gateway node:20-bookworm node -e "fetch('http://host.docker.internal:58999/')…"`（宿主 `127.0.0.1:58999` python http.server）→ **`BRIDGE-GATEWAY-REACH-OK status=200`**。
- **attempt-1 非反证**：其失败在 assert 点之前（模块加载期），不构成可达性复现。

## 4b. 阈值面（正交 · 如实）

attempts 2/3/4 run 级阈值（p50/p95/p99/err/timeout/caps）**本地全过**（EXIT=0）——按 prove 契约此为**正交事实**：本绿 ≠ capacity ≠ HA，PERF/LOAD stays **local partial** · `capacityRepresentative=false` · 不构成 UC covered、不翻 §1.1、coveredCount=8 不变。EXIT=0 不外推为阈值面/容量面任何叙事。

## 5. 诚实披露 / 修正条款

- **F-1（mw-e2e-ha C-9）行号叙事修正**：S 台账引 assert 点 `isolated-test-target.ts:59` 系**静态 off-by-3 引误**（执行树中该断言当时已在 `:62`），非"后续提交致行漂移"。本 coding commit `f59c4d20` 后该检查位于 `:72-73`（docstring 扩展所致 +10 行）。
- **本 tip（`017a178d`）行号漂移披露**：双审所引 `run-e2e-isolated.mjs` 锚点 `:1805-1816`（baseEnv，PGHOST `:1812`）/`:2124-2137`（docker run/port 解析）现位于 `:1914-1921`（PGHOST `:1920`）/`:2225-2245`（`-p 127.0.0.1::5432` `:2238` · token GUC `:2239` · port 解析 `:2243-2245`）。**该文件在本刀 coding commit 零 diff**（host 侧主链零行为变化 · e2e-ha C-3 / privacy C-5）。
- **F-2 durable machine-receipt 哈希**：§2 表所列 4 条 sha256 为本次 attempts machine receipts 的存世锚点；receipt 本体（各 1582 B，含全 source digests）嵌入于本 receipt §7。
- **attempt-1 与 env 修复**：如实归因 env 层（untracked 操作，未入 commit），不洗为 flake、不弃单。
- **`gitSha: 'unknown'`（pre-existing）**：容器内 `git rev-parse HEAD` 失败（proof `apps/api/test/uc-e2e-018-perf-load.proof.ts:39` try/catch 回退，commit `b29c1915` 引入，本刀零触碰；worktree `.git` gitfile 指向宿主主仓路径，容器内不可达）——日志中 `fatal: not a git repository` 行即此，非致命、非本刀引入。
- **R5-MARKED-RED narration**：`E2E_PG_IMAGE=pgvector/pgvector:pg16` legacy fixture 标注照常出现——isolated test infra narration，非 stack truth。
- **两镜像均本地命中**（`node:20-bookworm` sha256:8f693eaa… · `pgvector/pgvector:pg16` sha256:7b822b0a…），零镜像源依赖（`docker.m.daocloud.io` 未使用）。
- **teardown**：每 attempt 后零残留容器（`docker ps` 空）；PG 容器 `--rm` 惯例不变。

## 6. 条件自评（实现方自评 · 不构成审查签名；最终由 post-prove dual 裁定）

**mw-e2e-ha C-1…C-9**：C-1 ✅ 白名单恰为两字面量严格相等（`f59c4d20` `isolated-test-target.ts:72-73`）。C-2 ✅ nonce 绊线（`:73-77` 旧号）与云分支（`:24-46` 旧号）、`:60-61/:63-64/:65` 旧号零语义改动——本 commit 对该文件可执行面仅动 `:62` 一处检查。C-3 ✅ `run-e2e-isolated.mjs` 零 diff。C-4 ✅ 触碰面 = capped-child + isolated-test-target.ts + 测试；principal.ts 零 diff；死代码 `dockerArgs`/`createArgs` 清理作零行为披露（commit message）；C-IMAGE-DIGEST 未触碰。C-5 ✅ assert 保持显式抛错（新专用码，无 catch-fallback）。C-6 ✅ 两值接受 + 第三值/伪造变体拒绝 + 云分支邻接不回归 + 变异测试证明加第三值/前缀化即失败（EXIT=1 实测）。C-7 ✅ prove 契约照钉（≥3 fresh attempts 全台账 · 三分判据 · 阈值正交 · 关闭目标达成）。C-8 ✅ 行冻结全数原值（§Pins）。C-9 ✅ F-1 已落字（§5）· F-2 durable 哈希已收（§2/§7）· 7×EXIT=1 历史原样引用。
**mw-privacy-int C-1…C-10**：C-1 ✅ 恰好两字符串字面量，无归一化。C-2 ✅ **选择新增专用码 `destructive_proof_loopback_or_hostgateway_required`**（倾向形态；本 commit message 披露），assert 硬 throw。C-3 ✅ nonce 字节不变。C-4 ✅ 云分支字节不变、无共享 PGHOST 常量（两 profile 各自内联检查）。C-5 ✅ 注入仅 capped-child 一处（`create.push('-e', 'PGHOST=host.docker.internal')`），host baseEnv 恒 `'127.0.0.1'`（该文件零 diff 为证）。C-6 ✅ `:61` 字节不变；passEnv 无新增连接串通道（PGHOST 移出透传列表、改单点显式注入，仍无 DATABASE_URL）。C-7 ✅ 反证集覆盖 `''`/`::1`/`localhost`/`10.0.0.5`/`host.docker.internal.evil`/`xhost.docker.internal`/`evil.host.docker.internal`/缺省 + 两值通过 + 错误码精确匹配。C-8 ✅ 有效域定界落 docstring（Docker Desktop/macOS；plain Linux/CI 须诚实重验；无双 PGHOST 试连换路）。C-9 ✅ 7×EXIT=1 台账原样引用；attempts 全台账（EXIT+UTC 时间戳+machine receipt 哈希）；阈值 miss → EXIT=1 诚实保留口径执行（本次阈值本地全过但零外推）。C-10 ✅ 本 receipt 零 C-PERF-TEARDOWN / C-IMAGE-DIGEST 关闭宣称——本刀 prove 通过仅**产出** Branch A 关闭证据；关闭须 post-prove dual BOTH PASS + 协调方 nail 全链；`canHonestlyFlip=false`。

## 7. Machine receipts（durable 嵌入 · hash 见 §2）

```json
{"schemaVersion":1,"class":"local_untrusted_isolated_proof_receipt","target":"uc018:perf-load:prove:raw","outcome":"failed","exitCode":1,"durationMs":3175,"startedAt":"2026-10-06T17:07:22.161Z","finishedAt":"2026-10-06T17:07:25.336Z"}
```
（attempt-1 · 全文含 sourceDigests 同构于下，sha256 `88cc807d…6f1440`）

```json
{"schemaVersion":1,"class":"local_untrusted_isolated_proof_receipt","target":"uc018:perf-load:prove:raw","outcome":"passed","exitCode":0,"durationMs":9349,"startedAt":"2026-10-06T17:16:22.976Z","finishedAt":"2026-10-06T17:16:32.325Z","sourceDigests":{"scripts/run-e2e-isolated.mjs":"sha256:eddf453a11585e2498e2eb8fd99c6e9ab7eb2fb1b7a93654ab81e2b6d33adbeb","scripts/bounded-command.mjs":"sha256:3710dacb029505851b15f6d059bb94449b8318a8eb5c3d72c26a9a29c720f582","scripts/uc018-perf-load-capped-child.mjs":"sha256:5a2a9a26849fb83552314a2dcb91610b70a2b5ac5ecf4e8f7a1a3a28f393293c","apps/api/test/uc-e2e-018-perf-load.proof.ts":"sha256:fadb1cfd41ba33bb408b22d0ad90cba511c5819e62d51ed9756a354ffcd73cf2","apps/api/test/_neg-harness.ts":"sha256:7687c5a9decd08d2789d1e2c0be3c2c44eed8d2e47ae02a45e0cc0b46f38279e","apps/api/src/modules/interview/interview.controller.ts":"sha256:06dd229a60eb44153b4145718e86064670569d4998e441bd26b09d4d7bc335f7","apps/api/src/modules/interview/interview.service.ts":"sha256:4b5e1be95be278f3b469373c3b8db49f8590466a7f8dd351634443d0e1cdcb8d","packages/db/src/commerce.ts":"sha256:8c71b620bd465a43324573fe4797c80b122b897456ea26c04c1bdeb5cfb6dab7"},"schemaMigrationManifest":{"count":140,"latest":"0140_privacy_external_vendor_purge_evidence.sql","digest":"sha256:0dae426c13993b50fd9556d3fada8aba3ce967173347f08bd9d7058df0fd7ff3"},"dataHandling":"no_output_prompt_answer_token_endpoint_or_connection_string_persisted","releaseEvidence":false}
```
（attempt-2 · sha256 `51eabff7…4ef8f`；attempt-3 `88a72b82…f27d2` · durationMs 8467 · finishedAt 2026-10-06T17:17:17.783Z；attempt-4 `2666d698…4f9a2a` · durationMs 8380 · finishedAt 2026-10-06T17:17:52.659Z——三份同 schema，仅时间戳/时长不同）

```json
{"enforced":true,"method":"docker --cpus=2 --memory=4g","declared":{"cpus":2,"memoryGiB":4},"pg":{"container":"meetwise-e2e-31953-1791307064278","HostConfig":{"NanoCpus":2000000000,"Memory":4294967296},"ok":true},"api":{"container":"meetwise-uc018-perf-api-32144-1791307066531","HostConfig":{"NanoCpus":2000000000,"Memory":4294967296},"ok":true},"expected":{"NanoCpus":2000000000,"Memory":4294967296},"blocker":null}
```
（`_caps-evidence.json` @ attempt-4 · 每attempt覆盖写，结构不变 · pg/api caps 均 enforced）

## 8. STOP

本 receipt 不自审、不自批。post-prove dual（mw-e2e-ha + mw-privacy-int）由协调方另派。PERF/LOAD stays local partial · backlog `:35` stays CONDITION OPEN · canHonestlyFlip=false · Ban push。

*Prove receipt · C-PERF-CONTAINER-REACHABILITY · coding `f59c4d20` · 4 attempts（1 env-blocked + 3 green）· 关闭目标达成 · awaiting post-prove dual · STOP*

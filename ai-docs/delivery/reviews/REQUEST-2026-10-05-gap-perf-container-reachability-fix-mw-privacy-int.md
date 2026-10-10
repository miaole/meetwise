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

---

# PRE-EXEC dual 审查段 — **mw-privacy-int**（独立审 · append-only · 2026-10-07）

**Reviewer**: `mw-privacy-int`（独立审查方 · 禁自批 · alone ≠ dual · 不代签 peer）
**被审 REQUEST**: `45e1ac4241e8f4d4a0227b9eeeeeef105efd257e`（`docs(e2e): REQUEST perf container reachability fix (pre_dual)`，author `mw-core`，2026-10-06 13:31:25 +0800）
**Worktree**: `meetwise-rv-ss2-privacy-int`（branch `rv/ss2-privacy-int`，review commit 落于被审 REQUEST 之上）
**Peer 状态（仅元数据 · 未读原文）**：mw-e2e-ha PRE-EXEC dual PASS @`260a272e`（subject 披露 candidate 1 authorized · C-1..C-9；其 C 编号原文不可见，本文 Conditions 为 mw-privacy-int 独立编号，由协调方对账）。旧 `rv/ss-privacy-int` @`4256d7ef` 系针对孪生 REQUEST `7c523fb`（line/ss-container-reachability 链）的 review commit，本文不采纳其内容、不构成对 45e1ac42 的签名——本审为 45e1ac42 链独立补席。

## 0. 审查基础（命令 + EXIT + 可复现证据 · 全部本 worktree 实测）

- **docs-only 验证**：`git diff-tree --name-status -r 45e1ac42` = 4 个新增 `.md`（slice + harness + 双 stub），198 insertions / 0 deletions / 0 code。✅
- **链位如实披露**：`git merge-base --is-ancestor 45e1ac42 71713718`（origin/feat/mysql-schema-skeleton 远端与本地 tip 同为 `71713718`，`git ls-remote` 复核）→ **exit=1，非祖先**；`45e1ac42` 直系落于 `416b6a5b`（`git merge-base --is-ancestor 416b6a5b 71713718` = YES，origin 链上 Line W nail 段），与 `4766d4fc`（REQUEST 文档所引 parent tip，`line/w-nail` 工作线 tip）为**平行孪生**（互不为祖先；两 base 树 diff 共 53 文件、`grep -v '^ai-docs/'` = 空，即**纯 ai-docs 差异、代码树零差异**）。REQUEST 文档 "满足预期 ≥`4766d4fc`" 在 origin 链镜像侧系孪生记账近似（OB-1）。孪生 REQUEST `7c523fb`（`line/ss-container-reachability`）与本审对象 patch **逐字节一致**（`git diff 45e1ac42^ 45e1ac42` vs `git diff 7c523fb^ 7c523fb` diff -q = IDENTICAL）。本审所有代码锚点均对 `45e1ac42` 实树独立复核，两链通用。✅
- **缺陷链条锚点逐项实码复核**（只读）：`scripts/run-e2e-isolated.mjs:2124-2131` `docker run --rm -d … -p 127.0.0.1::5432 … postgres -c meetwise.e2e_run_token=${targetToken}`、`:1805` `targetToken = randomUUID()`（per-run 随机）、`:1812` baseEnv `PGHOST:'127.0.0.1'`、`:2133-2137` `docker port` 解析 `127\.0\.0\.1:(\d+)`；`scripts/uc018-perf-load-capped-child.mjs:18` API 容器名、`:89-103` passEnv **13 项无 `DATABASE_URL`**、`:141` `--network host`、`:202` `docker start -a`；`package.json:126-127` 三层链；`apps/api/test/uc-e2e-018-perf-load.proof.ts:24` `boot` ← `apps/api/test/_neg-harness.ts:58` `await assertIsolatedTestTarget(db.pool)`（启动期闸门路径成立）；`apps/api/test/uc-e2e-018-perf-load.proof.ts` 在 `-w apps/api` 下以 `test/…` 相对路径引用一致。✅
- **闸门本体**（`packages/db/src/isolated-test-target.ts` 全文只读）：`:24-46` 云分支（`assertCloudPrivateTestEnvironment`：`:25` 隔离 profile 冲突、`:36` `privateIpv4(PGHOST)`、`:41-42` TLS attestation）；`:55-67` `assertIsolatedTestEnvironment`（`:60` `E2E_ISOLATED!=='1'` throw、`:61` `DATABASE_URL` 禁、**:62 `PGHOST!=='127.0.0.1'` throw `destructive_proof_loopback_target_required`**、`:63-64` TLS 受控、`:65` attestation 双变量）；`:70-78` `assertIsolatedTestTarget`（**:73 只读 nonce 查询 `current_setting('meetwise.e2e_run_token', true)`、:74-77 比对 + `destructive_proof_isolated_target_attestation_mismatch`**）；`:48-54` docstring 根语义「destructive proofs never allowed to infer their target from a developer shell + 服务端 custom setting nonce，ordinary local or cloud databases do not have」。台账所引 `:59` 行漂移属实（实码 `:62`，断言文本与错误码逐字一致）。✅
- **台账/SSOT 锚点**：`receipts/2026-10-05-c-perf-teardown-branch-a-blocked-ledger.md` 在树内（7 次 EXIT=1 = 前 4 次陈旧 node_modules 归因 + 正式 attempt-1/2/3 全 `ECONNREFUSED 127.0.0.1:<port>` @ assert 点，receipt `bc195ca5…`/`ea57a86a…`/`30476649…`）；backlog `:35` C-PERF-TEARDOWN = disclosed OPEN、`:359` P 线 CLOSED（fixed）链完整、`:423-429` Line S nail `post_prove_dual_pass` + CONDITION OPEN retained + attempt1@`b29c191` Ban wash。✅

## 1. assert 放宽边界裁决（授权根焦点 · 核心裁定）

**根语义**（闸门 docstring `:48-54`）：破坏性证明不得从开发者 shell 推断目标；真绊线 = 服务端 nonce。分层：belt = `PGHOST` 字面白名单（`:62`，廉价无网络性质）；suspenders = `E2E_ISOLATED==='1'`（`:60`）+ `DATABASE_URL` 禁（`:61`）+ TLS 受控（`:63-64`）+ attestation 双变量（`:65`）+ **服务端 nonce 比对（`:73-77`，硬底）**。

**候选 1（bridge + `host.docker.internal` + 两字面白名单）→ 裁定：授权（附 Conditions C-1~C-10）**。否定论证（针对 stub §1 攻击面推演）：

1. **`host.docker.internal` 能否被滥用指向真实 DB → 否**。该名仅解析到宿主/VM host-gateway，不解析到攻击者任选目标；且 assert 通过要求对端服务器 `current_setting('meetwise.e2e_run_token', true)` === 声称 token（`:73-77`）。该 GUC 仅由 `run-e2e-isolated.mjs:2124-2131` 容器启动命令注入（`-c meetwise.e2e_run_token=<randomUUID>`，per-run 随机）；真实 dev/staging/prod 库无此 setting → `missing_ok` 返回 NULL → NULL ≠ token → 硬 throw。**只有隔离容器注入该设置 → 绊线是硬底**。
2. **「从 shell 推断目标」通道未重开**。环境伪造（`E2E_ISOLATED=1` + attestation 全套）在改动**之前**对 `PGHOST=127.0.0.1` 即已可能——belt 从来不是防伪造进程的，是防 shell 意外继承的。放宽后增量可达面仅为「宿主自身 loopback 发布端口」，仍被 nonce 硬底兜住；`PGHOST=<其他任意 host/IP/前缀>` 仍被 `:62` 白名单 fail-closed 拒绝。
3. **白名单最小性**：两精确字面量严格相等 = 最小放宽形态；REQUEST 自带 Ban 前缀/正则/环境变量开关/任意 host。空值/undefined/大小写变形均不匹配 → throw（fail-closed）。
4. **云分支零联动**：`E2E_CLOUD_ISOLATED==='1'` 在 `:56-59` 先行分流；云分支 `:36` 要求 `privateIpv4(PGHOST)`，`host.docker.internal` 非 IPv4 → 云路径不受影响；REQUEST Ban 触碰 `:24-46`。
5. **爆炸半径**：宿主侧 baseEnv `:1812` `PGHOST:'127.0.0.1'` 不变 → 其余 50+ prove 目标零行为变化；`host.docker.internal` 注入仅限 perf API 容器路径。

**候选 2（容器名等值锚定 `PGHOST===E2E_TEST_CONTAINER`）→ 裁定：不授权优先**。风险：(a) **belt 退化为自指比较**——等式两端均为进程可注入的 env 变量，belt 不再约束目标类（任意名称只要两变量相等即过），防线坍缩为仅剩 nonce 单层，破坏 belt/suspenders 独立冗余结构——对授权根语义的破坏面**大于**候选 1 的封闭两字面集；(b) 触碰面最大：`-p` 移除使 `:2133-2137` `docker port` 解析失效、`waitForPostgres` 宿主探针不可达、共享函数改动需逐项零行为披露，跨 prove 回归面 &gt; 候选 1。其「零宿主发布面」优点真实但不补偿 belt 独立性损失。

**候选 3（socat sidecar）→ 裁定：不推荐成立，本刀禁用**。(a) `node:20-bookworm` 无 socat → 镜像层变更**邻接 C-IMAGE-DIGEST 条件链**（Ban 借本刀，须另开授权）；(b) 转发器自身故障 = 新增沉默失败面（挂起/超时归因模糊），与「错误必被观测」正面冲突；(c) 三容器编排复杂度陡增。「assert 零改动」优点不足以抵偿。

## 2. 七项必保核查（任一候选必须保住 · 逐项判定）

| # | 不变量 | 判定 |
|---|--------|------|
| 1 | nonce 强制查询（`:73-77`） | ✅ REQUEST 未触碰；C-3 钉死字节不变 |
| 2 | Ban `DATABASE_URL`（`:61`） | ✅ 未触碰；passEnv 实核 13 项无 DATABASE_URL；C-6 |
| 3 | Ban 云分支联动放宽（`:24-46`） | ✅ 未触碰；`privateIpv4` 天然拒非 IP 值；C-4 |
| 4 | 白名单最小化 | ✅ 两字面量、无前缀/正则/开关；C-1 |
| 5 | 错误必被观测（结构化日志） | ✅ Ban 吞错/伪装成功/静默重试；关闭判据 (c) `db_pool_error` 诚实判；C-2/C-8 |
| 6 | Ban 全局 `uncaughtException`/`unhandledRejection` | ✅ harness `:29` + slice Ban 段 + stub §3 三处一致 |
| 7 | Ban 碰产品 `principal.ts` | ✅ harness `:71` + slice `:23` + stub §4 三处一致 |

## 3. Fail-trigger audit（触发即 FAIL 项 · 本审逐项过筛 = 零触发）

1. docs-only 违规 → 实测 4 md / 0 code，未触发。
2. REQUEST 内嵌码或预设放宽既成事实 → REQUEST 仅提交判定 + 候选，明确「本 commit 不写码」，未触发。
3. Pins 漂移 → stub/slice/harness 三文件 Pins 逐字一致（见 §5），未触发。
4. C-PERF-TEARDOWN 自关或互借 → stays CONDITION OPEN、关闭链 = 本刀 prove + post-dual BOTH + 协调方 nail、Ban 互借 P 线（`:359`）/ Ban 混同 S 线 nail（`:423-429`），未触发。
5. C-IMAGE-DIGEST 借道 → Ban 关闭 + 候选 3 镜像变更须另开授权，未触发。
6. 洗 7×EXIT=1 台账 / retry-to-green / 弃 attempt → 全台账契约 + Ban 三连 + prove 契约 ≥3 attempts frozen-lockfile fresh PG，未触发。
7. 阈值 miss 洗成关闭证据 → EXIT=1 诚实保留 + 关闭判据三分复用 S 线 Branch A 口径，未触发。
8. 触碰面越界 → 仅 capped-child + run-e2e-isolated 编排 +（候选 1/2 且双审批准）isolated-test-target.ts + 测试；Ban 其他 prove 编排（共享函数逐项零行为披露），未触发。
9. 观测面发明健康叙事（NOT_HA→HA）→ PERF/LOAD stays local partial · capacityRepresentative=false · 观测=故障观测非健康证明，未触发。

## 4. Blockers / Conditions

**Blockers（执行层阻断项）**：无。

**Conditions（mw-privacy-int 独立编号 · 违反任一 = coding/prove/post-dual 审查 FAIL；与 peer C-1..C-9 由协调方对账，不互代签）**：

- **C-1**: 白名单实现 = 恰好两个字符串字面量严格相等（`'127.0.0.1'` / `'host.docker.internal'`）；Ban 前缀/正则/环境开关/trim·lowercase 等归一化（归一化 = 新推断通道）。
- **C-2**: 错误码裁决：**倾向新增专用码 `destructive_proof_loopback_or_hostgateway_required`**（诚实归因——host-gateway 类拓扑失败与 loopback 误配是不同故障类）；若保留原码，则结构化日志必须携带观测到的 PGHOST 值类。两者皆须在 coding commit 披露；assert 保持硬 throw，Ban 调用点 catch-and-fallback。
- **C-3**: nonce 绊线字节不变：`assertIsolatedTestTarget :73-77` 查询与比对、`-c meetwise.e2e_run_token=` 注入与 per-run `randomUUID()` 惯例零改动。
- **C-4**: 云分支 `:24-46` 字节不变；Ban 重构出两分支共享的「PGHOST 检查常量」（两 profile 不得共享被放宽的常量）。
- **C-5**: `PGHOST=host.docker.internal` 注入仅限 perf API 容器路径（capped-child）；宿主 baseEnv `:1812` 恒 `'127.0.0.1'`；其余 prove 目标零行为变化，coding commit 须以 diff 级披露证明。
- **C-6**: `:61` DATABASE_URL 禁令字节不变；passEnv 不得新增 DATABASE_URL 或任何连接串通道。
- **C-7**: assert 单测须含：两白名单值通过边界 + 非白名单拒绝反证（至少 `''`、`'::1'`、`'localhost'`、`'10.0.0.5'`、`'host.docker.internal.evil'`、`'xhost.docker.internal'`——字面伪装变体必须仍被拒，证明严格相等而非匹配）。
- **C-8**: 可达性契约诚实定界：候选 1 有效域 = Docker Desktop/macOS（本缺陷环境；S 台账 throwaway 容器 HOST-CONNECT-OK 为容器→宿主 loopback 发布端口可达的实证旁证）。若拓扑迁至 plain Linux/CI，`--add-host=host.docker.internal:host-gateway` + `127.0.0.1`-only bind 的可达性须诚实重验（host-gateway 拨桥 IP ≠ 宿主 loopback）；**Ban 双 PGHOST 依序试连等任何静默换路降级**。
- **C-9**: 7×EXIT=1 S 台账原样保留并在 prove receipt 引用；attempts 全台账（EXIT + 时间戳 + machine receipt）；Ban retry-to-green / 弃单 / 洗账；阈值 miss → EXIT=1 诚实保留。
- **C-10**: 互借禁令：coding commit 与 prove receipt 内不得出现 C-PERF-TEARDOWN 或 C-IMAGE-DIGEST 的关闭宣称；C-PERF-TEARDOWN 关闭须 prove + post-dual BOTH PASS + 协调方 nail 全链；`canHonestlyFlip=false`。

## 5. Pins 原值确认（stub/slice/harness 三处一致 · 本审不改）

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · Stack=**PG-retained** · public DELETE=**503**（stays）· PERF/LOAD=**local partial**（stays）· capacityRepresentative=**false** · canHonestlyFlip=**false** · backlog `:35` C-PERF-TEARDOWN **stays CONDITION OPEN** · C-IMAGE-DIGEST **不关** · `C-PERF-CONTAINER-REACHABILITY` 登记编号由协调方裁决。✅ 全数原值。

## 6. 观察项（不阻断 · 留协调方）

- **OB-1**: base 记账漂移——REQUEST 引 parent tip `4766d4fc`，origin 链镜像 `45e1ac42` 实落 `416b6a5b`（二者为平行孪生，53 文件纯 ai-docs 差异、代码树零差异）；「满足预期 ≥`4766d4fc`」在镜像侧为孪生近似。协调方同步链时应对平 later series docs（c-perf-teardown-condition-residual / g7-key-blocked-residual-honest / uc011 covered-lift-reassess 等）。对本刀技术裁定零影响（全部代码锚点两链一致实测）。
- **OB-2**: 旧 `rv/ss-privacy-int` @`4256d7ef` 对孪生 REQUEST `7c523fb` 已有 PRE review commit（subject 元数据）；其与 peer `260a272` 非 sibling-dual 关系（分别审 7c523fb / 45e1ac42 内容孪生）。本审后 45e1ac42 链的 dual 完整性由协调方裁定；本文不追溯采纳或否认旧审内容。

## 7. 结论（中文三行）

1. 候选 1 两字面白名单放宽不破坏「破坏性证明不得从 shell 推断目标」根语义：belt 仍封闭、宿主可达面仅增量于自身 loopback 发布端口，nonce 硬底（`:73-77` + 容器启动 GUC 注入）对任何伪造 env 的进程恒拒真实库——否定论证成立，授权候选 1，否决候选 2（belt 自指退化）与候选 3（沉默失败面 + C-IMAGE-DIGEST 邻接）。
2. REQUEST docs-only 四 md 实测成立，缺陷链全部代码锚点（`-p 127.0.0.1::5432` + token GUC + `--network host` + passEnv 无 DATABASE_URL + assert `:62/:73-77`）逐项实码复核属实；七项必保、互借禁令（C-PERF-TEARDOWN prove+post-dual+nail 全链 · C-IMAGE-DIGEST 不互借）、Pins 原值十项三处一致——fail-trigger audit 零触发，Blockers 无。
3. alone ≠ dual：本 PASS 仅 mw-privacy-int 席位，≠ coding 授权 ≠ prove 执行 ≠ 条件关闭；peer `260a272` 原文未读、其 C-1..C-9 不代签不背书，dual 完成与 coding 授权由协调方裁定。

Verdict: PASS

---

## 8. POST-PROVE dual 审查（mw-privacy-int · 2026-10-07 · 包 `ce31d7f2` / coding `f59c4d20`）

审查方式：独立 worktree `rv/ssp-privacy-int` @ `ce31d7f2`（分支 `line/ss-container-reachability`）。全部裁决基于本 worktree 实码逐行核对 + 恰一次白名单套件实测 + 审方自做变异咬合。peer mw-e2e-ha 的并行审未读、不代签、不背书。本段 append-only，PRE 段（§1–§7）原样不动。

### 8.1 条件裁决表（C-1..C-10 · 全部本 worktree 实测证据）

| 条款 | 裁决 | 证据 |
|---|---|---|
| C-1 无归一化 | ✅ | `packages/db/src/isolated-test-target.ts:72-73` 恰两封闭字面量 `'127.0.0.1'` / `'host.docker.internal'` 严格 `!==` 比较；零 trim / lowercase / 前缀 / 正则 / env 开关。审方自做 `endsWith` 前缀放宽变异 → 套件 **EXIT=1**（`host.docker.internal.evil` 被误放行咬合），实证非前缀匹配；变异后 `git checkout --` 字节还原（`grep endsWith` 零残留）。 |
| C-2 错误码形态 | ✅ | 新专用码 `destructive_proof_loopback_or_hostgateway_required`（`:73`），assert 保持硬 throw、零 catch-fallback；旧码 `destructive_proof_loopback_target_required` 全仓（packages/apps/scripts/test，除 node_modules）零残留引用；coding commit message 披露符合 C-2 首选形态。 |
| C-3 nonce 链字节不变 | ✅ | `017a178d..ce31d7f2` 对该文件 diff 中含 attestation/nonce/cloud 字样的增删行仅 1 行且为 docstring 注释；`assertIsolatedTestTarget :81-89`（旧 :73-77 行漂移）`SELECT current_setting('meetwise.e2e_run_token', true)` + 比对 + `attestation_mismatch` throw 逐字节原样；`-c meetwise.e2e_run_token=` 注入（`run-e2e-isolated.mjs:2239`）与 per-run `randomUUID()`（`:1913`）所在文件零 diff。 |
| C-4 云分支字节不变 + 无共享放宽常量 | ✅ | `assertCloudPrivateTestEnvironment :24-46` 零增删；放宽字面量为 isolated 分支内联比较，未提炼任何两分支共享常量；云分支拒 `host.docker.internal`（`privateIpv4` → `isIP !== 4`）由套件实测：仍抛 `destructive_proof_cloud_private_ip_required`。 |
| C-5 注入单点 + 宿主恒 `'127.0.0.1'` | ✅ | 全仓显式 `PGHOST=` 注入恰一处：`scripts/uc018-perf-load-capped-child.mjs:143`（perf API 容器路径 only）；`run-e2e-isolated.mjs` 在 `f59c4d20^..ce31d7f2` 零提交触碰（`git log -- <file>` 空），`:1920` `PGHOST: '127.0.0.1'` 恒在；`:2153` sole 路径 `delete soleEnv.PGHOST` 为既有行为不动。 |
| C-6 DATABASE_URL 禁令 + passEnv | ✅ | `:71` `destructive_proof_database_url_forbidden` 字节不变；passEnv 现为 12 项、无 DATABASE_URL、无任何连接串通道；PGHOST 移出透传列表改单点显式注入（计数小疵见 OB-3）。 |
| C-7 反证全集实测 | ✅ | 本 worktree 恰一次执行 `packages/db/test/isolated-test-target.proof.ts`（主仓 tsx 二进制，import 相对解析 → 执行本 worktree 副本）：**EXIT=0**。两 admitted 值通过 + 九拒绝（`''` / `::1` / `localhost` / `10.0.0.5` / `8.8.8.8` / `host.docker.internal.evil` / `xhost.docker.internal` / `evil.host.docker.internal` / 缺省，错误码 regex 精确匹配 `/^Error: destructive_proof_loopback_or_hostgateway_required$/`）+ 云邻接不回归 + 放宽路径上 nonce mismatch 仍 throw。 |
| C-8 定界落 docstring + Ban 双 PGHOST 静默换路 | ✅ | docstring `:55-63` 诚实定界有效域（Docker Desktop/macOS；plain Linux/CI 须诚实重验 host-gateway ≠ 宿主 loopback）；全文件零 try/catch、零依序试连、零双 PGHOST 换路——单值不符即 throw。 |
| C-9 7×EXIT=1 历史台账保全 | ✅ | `receipts/2026-10-05-c-perf-teardown-branch-a-blocked-ledger.md:7-9` 三 attempt（`bc195ca5…` / `ea57a86a…` / `30476649…`）原样；新 prove receipt `receipts/2026-10-07-gap-perf-container-reachability-fix-prove.md` §4 明文「原样保留不洗」并给出 4 attempts 全台账（EXIT + UTC 时间戳 + machine receipt sha256）。 |
| C-10 零关闭宣称 | ✅ | `ai-docs/delivery/gap-bug-backlog.md:35` C-PERF-TEARDOWN 仍 **OPEN** CONDITION（未翻、未洗）；prove receipt 零 C-PERF-TEARDOWN / C-IMAGE-DIGEST 关闭宣称（仅「产出 Branch A 关闭证据 · awaiting post-prove dual」）；`canHonestlyFlip=false` 原值。 |

### 8.2 对抗推演（放宽后攻击者控制进程 env 的最坏情形）

**推演 1 — `PGHOST=host.docker.internal` + 伪造 nonce（最坏全控 env）**：env 廉价检查全过（`E2E_ISOLATED=1` 可伪造、PGHOST 为白名单字面量、`E2E_TEST_TARGET_TOKEN` 任填）；但随后 `:84` 的服务端查询 `current_setting('meetwise.e2e_run_token', true)` 在**数据库进程内**取值——真实 dev/staging/prod 库不携带该 GUC，`missing_ok=true` 使其返回 NULL → `NULL !== 伪造token` → `:88` 硬抛 `destructive_proof_isolated_target_attestation_mismatch`。唯一携带该 GUC 的库是 run-e2e-isolated 每轮以 `randomUUID()`（`run-e2e-isolated.mjs:1913`）生成、容器启动时 `-c` 注入（`:2239`）的一次性 throwaway 容器——仅控客户端 env 的攻击者不可知其值。**结论：nonce 绊线对全控 env 恒硬 throw，放宽零新增可及破坏目标。**（nonce mismatch 在放宽字面量路径上的行为已由套件实测覆盖。）

**推演 2 — 宿主进程直接跑 prove 时 `host.docker.internal` 解析行为**：plain macOS 宿主默认无该 hosts 项（Docker Desktop 仅在 VM/容器侧 DNS 解析）→ `getaddrinfo` ENOTFOUND / 连接失败发生在任何查询之前 → **诚实失败（EXIT=1），非绕过**：响亮可观测崩溃，非静默降级。

**推演 3 — 容器内最坏情形**：bridge 网络内 `host.docker.internal` → host-gateway → 仅命中宿主 loopback 发布面（`-p 127.0.0.1::5432`）背后的 throwaway PG；即便连上，伪造 token → attestation_mismatch 硬 throw（同推演 1）。assert 本体仅一条只读 SELECT（`:84`），自身无写面。

**否定论证维持**：belt 仍封闭（恰两字面量）、宿主可达面仅增量于自身 loopback 发布端口、nonce 硬底对任何伪造 env 恒拒真实库——PRE 段 §7.1 的授权理由在 POST-PROVE 实证下成立。

### 8.3 观察项（不阻断）

- **OB-3**： coding commit message 称 passEnv "13 items"——post-fix 实为 **12** 项（13 为含 PGHOST 的 pre-fix 计数）。安全相关断言（无 DATABASE_URL、无新连接串通道）两版本均成立，零行为影响。
- **OB-4**： 本审 fresh worktree 无 node_modules，套件经主仓 tsx 二进制执行本 worktree 文件；执行目标确为本 worktree 副本由变异咬合自证——变异仅存在于本 worktree 即观测到 EXIT=1，排除误跑主仓树。

### 8.4 Blockers / Conditions

**Blockers：无。**

**Conditions（不阻断本 PASS · 违反即后续审查 FAIL）**：
- **CD-1**： 拓扑迁至 plain Linux/CI 时，host-gateway 准入（`--add-host=host.docker.internal:host-gateway` + `127.0.0.1`-only bind）须诚实重验后方可依赖（docstring 已定界；执行属流程层）。
- **CD-2**： alone≠dual：本 PASS 仅为 mw-privacy-int 席位 POST-PROVE 裁决；peer mw-e2e-ha 并行审未读、不代签；dual 完成与任何 nail 由协调方裁定。
- **CD-3**： C-PERF-TEARDOWN 关闭链未启动：本刀 prove 仅**产出** Branch A 关闭证据；关闭仍须 prove + post-dual BOTH PASS + 协调方 nail 全链；backlog `:35` stays CONDITION OPEN。

### 8.5 结论（中文三行）

1. POST-PROVE 实证收口：C-1~C-10 十项全过——两字面白名单严格相等实码核对、白名单套件本 worktree 恰一次 **EXIT=0**、审方自做前缀放宽变异咬合 **EXIT=1**、nonce 链/云分支/宿主 baseEnv 字节不动、注入全仓单点、7×EXIT=1 台账与 backlog `:35` OPEN 原样保全。
2. 对抗推演：全控 env 伪造 nonce 仍被服务端 GUC 绊线硬 throw（真实库无 `meetwise.e2e_run_token`）；宿主直跑 `host.docker.internal` 解析失败 = 诚实失败非绕过——放宽零新增可及破坏目标，PRE 授权否定论证维持。
3. alone≠dual：本 Verdict 仅为 mw-privacy-int 席位 POST-PROVE 裁决；peer 判定、dual 完成、nail 与条件关闭由协调方裁定；`canHonestlyFlip=false`。

Verdict: PASS

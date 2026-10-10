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

---

# PRE-EXEC dual 审查 — **mw-e2e-ha**（adversarial evidence-honesty · 2026-10-02 本机复核）

**审查基线（环境事实 · 如实记录）**：独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-ss-e2e-ha`，branch `rv/ss-e2e-ha` @ tip `62ef52bb`。github 443 当前不通：`origin/feat/mysql-schema-skeleton` = `ebf48b6`，本地领先**恰好 3 个 docs 提交**（`45e1ac42`（=本 REQUEST）· `496d275a` · `62ef52bb`），协调方经 bundle 旁路推。被审 commit `7c523fb8`（parent `4766d4fc2a9d06f2d95a7ab7759430c4cc494bfc` = `line/w-nail` tip）**不是**当前 tip 的 git 祖先；其与 tip 链上 `45e1ac42` **patch-id 相同**（`14dfa3927b5bdc2e6c669b951ae15aa726cf357b`，两 commit 四文件内容逐字节一致）——审查对象即该 patch，无内容分歧。本审查只 append 本文件，零 coding / 零 prove / 零 push / 零 SSOT 触碰；不代签 mw-privacy-int（其审并行，本审不可见、不需要可见）。

## 1. 独立复核检查表（Ban 采信实现方读码 · 全部本机实码逐行核）

| # | 论断 | 核验结果 |
|---|------|---------|
| 1 | 双容器拓扑：PG `-p 127.0.0.1::5432` + 动态端口 + baseEnv | ✅ `run-e2e-isolated.mjs:2130`（`-p 127.0.0.1::5432`）· `:2131`（token GUC）· `:2133-2137`（`docker port` 解析）· `:1806-1816`（baseEnv：`E2E_ISOLATED:'1'` `:1808` · `E2E_TEST_CONTAINER` `:1809` · `E2E_TEST_TARGET_TOKEN` `:1810` · `DATABASE_SSL_MODE:'disable'` `:1811` · **`PGHOST:'127.0.0.1'` `:1812`**）· caps `:2118-2120` |
| 2 | API 容器 `--network host` + start -a 透传 | ✅ `uc018-perf-load-capped-child.mjs:18`（容器名）· `:111`/`:141`（两处 `--network host`）· `:136-157`（create→inspect）· `:202-204`（`docker start -a` + `process.exit(start.status ?? 1)`）· `:89-103` passEnv **无 DATABASE_URL**（`:88` 注释明示 assert 禁）· `:23` 镜像 `node:20-bookworm` |
| 3 | 崩溃点 = assert 强制 `PGHOST==='127.0.0.1'` | ✅ `isolated-test-target.ts:62` 原文逐字：`if (env.PGHOST !== '127.0.0.1') throw new Error('destructive_proof_loopback_target_required')`；perf 链路：proof → `_neg-harness.ts:58` `await assertIsolatedTestTarget(db.pool)` 启动期触发 |
| 4 | fail-closed 拆解（belt + suspenders） | ✅ `:60`（`E2E_ISOLATED!=='1'` 拒绝）· `:61`（DATABASE_URL 禁）· `:63-64`（TLS 模式受控）· `:65`（attestation env 缺失拒）· `:73-77`（服务端 nonce 只读查询 + 等值比对，不匹配即 `destructive_proof_isolated_target_attestation_mismatch`）；云分支 `:24-46`（`assertCloudPrivateTestEnvironment`，含 `privateIpv4`/TLS attestation）独立、不受本刀白名单影响 |
| 5 | 根因 = Docker Desktop/macOS `--network=host` = VM 栈 | ✅ 本机 `docker version`：Server `linux/arm64 29.1.3`（宿主 darwin/arm64）——容器共享 VM 网络栈、宿主 loopback 发布端口不可达的语义成立；HOST-CONNECT-OK / pg_isready-exec 对照见台账 `44154aa5`（见 F-2 证据留存注记） |
| 6 | 台账 7 次 EXIT=1 | ✅ commit `44154aa5` 在库（subject：7 attempts · container-reachability root-cause · coordinator-executed）；前 4 次陈旧 node_modules + 正式 attempt-1/2/3 ECONNREFUSED 同点（receipt `bc195ca5…`/`ea57a86a…`/`30476649…` 为 `.tmp` machine-receipt 文件哈希、非 git 对象） |
| 7 | 台账引 `:59` 行漂移 | ⚠️ **修正（F-1）**：在台账自述执行树 `line/s-perf-teardown-rootcause @ 6b878da` 实码中该 assert **已在 `:62`**（非漂移后的 tip 才是）——`:59` 为台账**静态 off-by-3 引误**，harness §7「后续提交致行漂移」解释不准确；断言文本/错误码逐字一致 → **判定不受影响**，行号叙事须按 F-1 更正 |
| 8 | 触碰面 / 回归面论断 | ✅ 候选 2 触碰面最大论断属实：`waitForPostgres`（`:1975`，共享函数，调用点 `:2013/:2138/:2148/:2159`，内含宿主探针 `probeHostSql` `:1990`）+ 共享 docker run 块（`:2124-2132` 全 target 共用）+ `docker port` 解析 + capped-child 三处 network flag；候选 3 沉默失败面论断属实（`node:20-bookworm` 无 socat `:23` → 须镜像变更 → 邻接 C-IMAGE-DIGEST）；assert 影响面 = `assertIsolatedTestTarget` 被 15+ proof 文件引用（`grep -rl` 实测），候选 1 两值白名单对 `PGHOST='127.0.0.1'` 主链零行为变化 |
| 9 | Pins 原值 | ✅ stub/harness/slice 三文档一致且与本审钉值逐一相符（见 §5） |

**P 线互斥核**：`backlog :359` `GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER` = CLOSED(fixed)（`isolated-test-target.ts:2` 对 principal.ts 仅 type-only import，本刀改 :62 白名单不触 product principal.ts）；`backlog :35` C-PERF-TEARDOWN = disclosed OPEN；`backlog :423-429` Line S nail = `post_prove_dual_pass` · CONDITION OPEN retained · attempt1@`b29c191`（`b29c1915` 实证在库）Ban wash。全部与 REQUEST 叙事一致。

## 2. 候选裁决（双审裁定 · 本节为授权依据）

**裁候选 1（bridge + `--add-host=host.docker.internal:host-gateway` + 注入 `PGHOST=host.docker.internal` + assert 白名单放宽为且仅为两个字面量 `'127.0.0.1' | 'host.docker.internal'`）——授权**：

- **fail-closed 保住（核心裁定点，独立论证）**：destructive 证明真正绊线（`E2E_ISOLATED==='1'`+DATABASE_URL 禁 `:60-61`、attestation `:65`、服务端 nonce `:73-77`）全部不动；`PGHOST` 白名单放宽**不产生任何"无 attestation 进程可达新目标"通道**——`host.docker.internal` 在容器内仅指向宿主 loopback 发布面（即 per-run 随机端口的临时隔离 PG），与已允许字面量 `'127.0.0.1'` 同一信任域；宿主侧主链 `baseEnv PGHOST:'127.0.0.1'`（`:1812`）不变，其余 50+ prove 目标走同一条 assert 分支、零行为变化。白名单为**封闭可枚举两值**：Ban 前缀/正则/环境变量开关/任意 host/**Ban 候选 2 的变量等值锚定形态**；Ban 云分支（`:24-46`）任何联动放宽。
- **触碰面最小**：理想实现仅 `uc018-perf-load-capped-child.mjs`（network flag + env 注入）+ `packages/db/src/isolated-test-target.ts`（:62 白名单）+ 测试；`run-e2e-isolated.mjs` PG 编排（`:2124-2137`）应零 diff（capped-child 侧覆盖透传值即可，不回写 baseEnv）。
- **错误码**：建议新增专用码（如 `destructive_proof_loopback_or_hostgateway_required`）以诚实区分失败分支；若保留原码须在 coding commit 披露。两形态均 fail-closed 显式抛错，无静默降级。

**候选 2（同网络 + PG 不发布 + 容器 DNS）——本 PASS 不授权**：`PGHOST === E2E_TEST_CONTAINER` 等值锚定 = 白名单 admit 一个**无界变量值**（`meetwise-e2e-<pid>-<ts>`，`:1669`），语义面宽于封闭两值；且回归面论断经实码证实为最大（共享 docker run 块 / `waitForPostgres` 共享函数 / `docker port` 解析三处牵动）。若 coding 期遇真实技术阻断须回协调方重新裁决，**Ban 静默切换候选**。

**候选 3（socat sidecar）——否决**：镜像变更邻接 C-IMAGE-DIGEST（Ban 借刀）+ 转发层沉默失败面与"错误必被观测"正面冲突。仅备案，与 harness 处置一致。

## 3. Fail-trigger audit（以下任一发生 = 本 PASS 作废 / 执行层 FAIL）

1. assert 白名单超出两字面量（前缀/正则/env 开关/变量等值/任意 host）或触碰 nonce 绊线/云分支/`:63-64` TLS 受控检查。
2. 触碰 product `packages/db/src/principal.ts` 或其他 prove 的容器编排（共享函数改动无逐项零行为披露）。
3. 全局 `uncaughtException`/`unhandledRejection` 兜底、静默重连/换路连、吞错、伪装成功。
4. retry-to-green、弃 attempt、洗 7 次 EXIT=1 台账或 attempt1@`b29c191` 历史。
5. prove 无 frozen-lockfile / attempts 复用同一 PG 容器 / caps 证据面变更。
6. 阈值 miss 被洗成本刀关闭证据、或可达性关闭被外推为阈值面/PERF/LOAD 行/covered 翻转。
7. 未经协调方重新裁决切换至候选 2/3。
8. 任何 SSOT/backlog 行翻转（coveredCount=8、PERF/LOAD local partial、backlog `:35`、C-IMAGE-DIGEST）。

## 4. Blockers

**无**。缺陷判定独立复核成立、候选方案 fail-closed 论证成立、prove 契约完整、行冻结完备——pre-exec dual（mw-e2e-ha 侧）可放行至协调方授权 coding。

## 5. Conditions（C-1…C-9 · coding/prove 期约束 · 违反任一 = post-prove dual 必 FAIL）

- **C-1**：候选 1 白名单形态 = 且仅为两个字面量 `'127.0.0.1'`、`'host.docker.internal'`；候选 2/3 形态不在本 PASS 授权内。
- **C-2**：`isolated-test-target.ts` 的 `:60-61/:63-64/:65/:73-77` 与云分支 `:24-46` 零语义改动（nonce 绊线字节级不动）。
- **C-3**：宿主侧主链零行为变化：`run-e2e-isolated.mjs` PG 编排（`:2124-2137`/`baseEnv :1805-1816`）零 diff；如确需触碰共享函数，逐项披露零行为变化，否则 Ban。
- **C-4**：触碰面 = `uc018-perf-load-capped-child.mjs` + `packages/db/src/isolated-test-target.ts` + 测试；Ban principal.ts（backlog `:359`）· Ban 其他 prove 编排 · Ban 关 C-IMAGE-DIGEST。附注（F-3）：capped-child `dockerArgs`（`:105-115`）与 `createArgs`（`:134`）为 create 路径重构后的死代码，去 `--network host` 须覆盖执行路径 `:141` 并对 `:111` 死路径清理作零行为披露。
- **C-5**：assert 失败保持显式抛错（错误码处置见 §2）；Ban 任何静默降级/重试路径。
- **C-6**：测试面：两值边界接受 + 第三值拒绝（fail-closed 反证）+ 云分支邻接面不回归；测试须在加入第三值时失败。
- **C-7**：prove 契约照钉：`pnpm uc018:perf-load:prove` @ coding SHA · `--frozen-lockfile` · fresh 隔离 PG per attempt · ≥3 attempts one-shot 全台账；关闭判据三分复用 S 线 Branch A 口径（零 unhandled crash + run3/SUMMARY 完整到达 + `db_pool_error` 结构化可见并按 errorRate/missReasons 诚实判）；本刀唯一关闭目标 = 零 `ECONNREFUSED 127.0.0.1:<port>` @ assert 点；阈值 miss → EXIT=1 诚实保留（正交 · 不是本刀失败条件 · Ban 洗成关闭证据）。
- **C-8**：行冻结：PERF/LOAD stays local partial · `capacityRepresentative=false` · coveredCount=8 · haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · backlog `:35` stays CONDITION OPEN · `canHonestlyFlip=false`——本刀 prove 通过仅**产出** C-PERF-TEARDOWN Branch A 关闭证据，关闭须经 post-prove dual BOTH PASS + 协调方 nail 全链，Ban 本刀内自关。
- **C-9**：诚实留存：(F-1) harness §7 行号叙事按本审修正（`:59` = 台账静态引误，非漂移）于 coding commit 或 prove receipt 落字；(F-2) 本次复核时台账所引 raw 证据（`.tmp/s-attempt-{1,2,3}.log`、machine receipts `bc195ca5…/ea57a86a…/30476649…`）已不在盘上（`.tmp` 设计性易失，committed ledger `44154aa5` 为存世锚点）——prove receipt 必须收录本次 attempts 的 durable machine-receipt 哈希；attempt1@`b29c191` 与 7 次 EXIT=1 历史原样不洗。

## 6. 中文摘要（3 行）

1. 缺陷判定独立复核成立：双容器拓扑、assert `:62` 字面绊线、`--network=host`=VM 栈不可达宿主 loopback（本机 Docker linux/arm64 29.1.3 实证）、7 次 EXIT=1 台账在库，全部 file:line 逐字核过，Ban 采信实现方读码已做到。
2. 裁候选 1：两值封闭字面白名单是 fail-closed 最小放宽（nonce 绊线 `:65/:73-77` 不动、宿主主链 `:1812` 零行为变化、15+ 引用 proof 零回归），候选 2 等值锚定语义面更宽不授权、候选 3 沉默失败面否决。
3. 无 Blockers，C-1…C-9 随 coding/prove 执行；两处诚实修正（F-1 行号叙事、F-2 raw 证据易失须 durable 哈希）已入条件；alone ≠ dual，不代签 mw-privacy-int，翻转须 post-dual + 协调方 nail。

Verdict: PASS

---

# POST-PROVE dual 审查 — **mw-e2e-ha**（adversarial evidence-honesty · fresh re-run + 条件裁决）

**审查对象**：branch `line/ss-container-reachability` @ tip `ce31d7f2`（parent = origin tip `017a178d`）· coding `f59c4d20` + receipts `cf897e6e`/`ce31d7f2` · REQUEST `71ac2d44`。pre-exec dual：mw-e2e-ha @`260a272`（C-1~C-9）+ mw-privacy-int @`55c8d5d`（C-1~C-10，并行不可见不代签）。
**审查基线（环境事实 · 如实记录）**：独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-ssp-e2e-ha`，branch `rv/ssp-e2e-ha` @ `ce31d7f229784aa0b99b0cb2a39341198088a498`。本机 Docker Server `linux/arm64 29.1.3`（Docker Desktop/macOS = 本刀宿主网关拓扑域）；`node:20-bookworm`（sha256 镜像 ID `8f693eaa…`）与 `pgvector/pgvector:pg16`（`7b822b0a…`）两镜像本地在库，零镜像源拉取（`docker.m.daocloud.io` 未使用）。本审查只 append 本文件；零 push；零 SSOT/backlog 触碰。

## 1. 包完整性（恰 3+7 申报 · 逐文件核）

- `f59c4d20`（coding）= 恰 3 文件：`scripts/uc018-perf-load-capped-child.mjs` + `packages/db/src/isolated-test-target.ts` + `packages/db/test/isolated-test-target.proof.ts`（`git diff --name-status 017a178d f59c4d20` 实测）。
- `ce31d7f2`（receipts）= 恰 7 uc018-perf-load receipt JSON（M）+ 1 prove receipt md（A）；`cf897e6e` 为 prove receipt 落字。两 commit 合计 = 11 文件，与申报一致，无超面文件。
- **零 diff 红线实测**：`run-e2e-isolated.mjs` = 0 diff 行（宿主主链红线）· `principal.ts` = 0 diff 行 · `gap-bug-backlog.md` / `e2e-covered-path-backlog.md` / `REMAINING-NORTH-STAR-QUEUE.md` = 0 diff 行（禁碰 UC 行/SSOT 行零触碰；变更集内无任何 SSOT/backlog 文件）。
- **绊线字节级核验**（`git diff 017a178d ce31d7f2 -- packages/db/src/isolated-test-target.ts` 逐行）：可执行面唯一改动 = 旧 `:62` 一处检查；云分支（旧 `:24-46`，含 `privateIpv4`/TLS attestation）与 nonce 绊线函数（`assertIsolatedTestTarget` 全函数：`meetwise.e2e_run_token` 只读查询 + 等值比对）经两 revision 分区逐字节 diff = **byte-identical**；`:60-61`（E2E_ISOLATED/DATABASE_URL 禁用）、`:63-64`（TLS 受控）、`:65`（attestation env 对）全为未触碰上下文。白名单恰为**两封闭字面量严格相等**（`env.PGHOST !== '127.0.0.1' && env.PGHOST !== 'host.docker.internal'`），零归一化/前缀/正则/env 开关/共享常量（C-1/C-2 成立）；新专用错误码 `destructive_proof_loopback_or_hostgateway_required`（C-5：显式硬抛，无 catch-fallback）。
- capped-child：`--network host` 两处全除（执行路径 `create` 改默认 bridge + `--add-host=host.docker.internal:host-gateway`）；`PGHOST` 移出 passEnv + 单点注入 `create.push('-e', 'PGHOST=host.docker.internal')`（唯一注入点，无双 `-e PGHOST`、无 DATABASE_URL 通道）；死代码 `dockerArgs` 数组 + env 循环 + `createArgs` filter 行整体移除、零残留（`grep dockerArgs` 实测仅 docstring 注释）、commit message 已作零行为披露（C-4 成立）；`node --check` PASS（本机复验）。

## 2. Fresh re-run（C-DUAL-FROM-FRESH · 恰一次 · Ban retry）

- **环境准备**：`pnpm install --frozen-lockfile`（pnpm 10.18.0 · Done 4s）。env 层预备（untracked · 不入 commit · 全披露 · 复刻实现方 receipt §2 同型 recipe）：临时 append `supportedArchitectures`（darwin/linux · arm64/x64）→ `pnpm install --frozen-lockfile`（补 linux-arm64 可选绑定 18 包）→ 立即还原 yaml；随后 `git status` = 空（tracked 面与 `ce31d7f2` 逐字节一致）。
- **CMD**: `pnpm uc018:perf-load:prove` @ `rv/ssp-e2e-ha` 工作树（= `ce31d7f2` tracked 面）· 恰好执行一次 · 零重试。
- **EXIT = 0**（2026-10-06T17:54:50Z→17:55:00Z UTC · 全日志留档 `/tmp/rv-ssp-fresh-prove.log` · sha256 `0671a145efb6626646f63e15959cee874fcf44c3f735f61c3038f6a0d7d35342`）。
- **本刀唯一关闭目标达成**：全日志 grep `ECONNREFUSED` = **0**（断言点零复现）；`Unhandled|unhandledRejection|uncaughtException|db_pool_error` = **0**。API 容器（`meetwise-uc018-perf-api-41375-1791309293629`）内 proof 进程经 `host.docker.internal` 真实命中宿主 loopback 发布的隔离 PG（`meetwise-e2e-41177-1791309291317` · `127.0.0.1:62521`），六组 run 全为真实 PG 往返量测：PERF run1/2/3 p50=29.0/27.3/24.8ms err=0 timeout=0；LOAD run1/2/3 p50=65.1/46.9/43.1ms err=0 timeout=0 dblRel=0 stuck=0。`SUMMARY allPass=true capsEnforced=true`；`_caps-evidence.json` 结构不变（enforced=true · pg/api NanoCpus=2000000000 · Memory=4294967296）；teardown 后 `docker ps -a` 零残留容器。
- **源一致性交叉证实**：本次 machine receipt（`.tmp/isolated-proof-receipts/2026-10-06T17-55-00-338Z-41177-00aab66d-3fe0-4169-94d0-5df7cf0feff8.json` · sha256 `d7121f5d8c9b08c1b9856a1545fd631c2bf1c3328ad8a917ce3deb15c7726a5f`）的 `sourceDigests`：`scripts/uc018-perf-load-capped-child.mjs` = `sha256:5a2a9a26…393293c`、`scripts/run-e2e-isolated.mjs` = `sha256:eddf453a…`、`apps/api/test/uc-e2e-018-perf-load.proof.ts` = `sha256:fadb1cfd…` —— 与实现方 prove receipt §7 attempts 2/3/4 所嵌 digest **逐项一致**：审查方 fresh run 与实现方 prove 跑的是同一份源字节。
- **阈值正交性（如实）**：本次 run 级阈值本地全过（EXIT=0）——按 C-7 口径为正交事实，**零外推**：本绿 ≠ capacity ≠ HA ≠ UC covered；PERF/LOAD stays local partial · `capacityRepresentative=false` · coveredCount=8 不变。
- **如实归因披露**：日志含 `fatal: not a git repository` 一行 = receipt §5 已披露的 pre-existing `gitSha:'unknown'` 容器内 git 元数据限制（`b29c1915` try/catch 回退 · 本刀零触碰 · summary.json 同值），非致命、非本刀引入。receipts uc018-perf-load/* 为 proof-owned tracked 面被本 CMD 按设计重写——审查证据以本节文本 + machine receipt 哈希为 durable 锚点，7 个 JSON 已还原至 `ce31d7f2` 原状（审查 commit 只含本文件，前例 `260a272e`/`a272b723` 同口径）。

## 3. 条件裁决（pre-exec C-1…C-9 · 违反任一即 FAIL）

| C | 内容 | 裁决 | 证据 |
|---|------|------|------|
| C-1 | 白名单且仅为两字面量 | ✅ PASS | `:72-73` 严格相等两封闭字面量；无归一化/前缀/正则/env 开关/变量等值（逐字节读码 + 两次变异探针） |
| C-2 | nonce 绊线/云分支字节不动 | ✅ PASS | 云分支与 nonce 函数两 revision 分区 diff = byte-identical；`:60-61/:63-64/:65` 上下文未动 |
| C-3 | 宿主主链零 diff | ✅ PASS | `run-e2e-isolated.mjs` 0 diff 行；baseEnv `PGHOST:'127.0.0.1'` 原值 |
| C-4 | 触碰面 + 死代码零行为 | ✅ PASS | 恰 3 code 文件；`principal.ts` 0 diff；`dockerArgs`/`createArgs` 零残留 + commit message 零行为披露；C-IMAGE-DIGEST 未触碰 |
| C-5 | assert 显式抛错 | ✅ PASS | 硬 throw + 专用码 `destructive_proof_loopback_or_hostgateway_required`；无静默降级/重试路径 |
| C-6 | 反证 + 变异咬合复验 | ✅ PASS（附 1 项非 gating 观察） | 基线测试 EXIT=0（两值接受 + 9 伪造变体精确错误码拒绝 + 云邻接不回归 + nonce mismatch 硬抛）；变异 1（加第三值 `::1`）→ **EXIT=1 咬合**（`rejects IPv6 loopback`）；变异 2（host-gateway `startsWith` 前缀化）→ **EXIT=1 咬合**（`rejects host-gateway suffix forgery`）；变异后均逐字节还原（sha256 复验一致）。观察：loopback 字面量前缀化变异（`startsWith('127.0.0.1')`）测试集**未咬合**（EXIT=0）——拒绝集无 `'127.0.0.1'` 前缀伪造用例（如 `127.0.0.1.evil`）；实现码为严格相等、C-6 字面要求（加第三值须失败）满足，故非 gating，留作测试加固 residual |
| C-7 | prove 契约 | ✅ PASS | `--frozen-lockfile` · fresh 隔离 PG（per-run 随机名+动态端口+token GUC）· 实现方 4 attempts 全台账（1 env 类 EXIT1 如实归因 + 3×EXIT=0）· 审查方 fresh 单次复跑 EXIT=0 · 关闭判据三分（零 unhandled crash + run3/SUMMARY 到达 + `db_pool_error` 诚实口径）· 关闭目标达成 · 阈值正交不外推 · Ban retry 已守（恰一次） |
| C-8 | 行冻结 | ✅ PASS | backlog `:35` stays CONDITION OPEN（文件 0 diff）· PERF/LOAD local partial · capacityRepresentative=false · coveredCount=8 · haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · canHonestlyFlip=false —— receipt Pins 全数原值 |
| C-9 | F-1/F-2 修正落实 | ✅ PASS | F-1（`:59` = 静态 off-by-3 引误非漂移；现 `:72-73`）已落 receipt §5；F-2 durable machine-receipt sha256 ×4 收录 §2 + §7 嵌入本体；7×EXIT=1 台账与 attempt1@`b29c191` 历史原样引用不洗 |

## 4. Blockers

**无**。白名单形态、绊线字节、宿主主链、触碰面、fresh 复跑、行冻结、诚实修正全部核过；实现方 4 attempts 台账（含 attempt-1 env 类 EXIT=1 如实归因）与审查方 fresh 单次 EXIT=0 相互印证（源 digest 逐项一致）。

## 5. Conditions（非 gating · 留档）

1. **测试加固 residual（非 gating）**：拒绝集可补 `'127.0.0.1'` 前缀伪造用例（如 `127.0.0.1.evil`）以咬合 loopback 字面量前缀化变异——C-6 字面要求已满足，此项为加固建议，不阻本裁决。
2. `gitSha:'unknown'`（容器内 git 元数据限制）为 pre-existing 已披露限制，非本刀引入，留作 infra residual。
3. 审查方 env 层预备（`supportedArchitectures` 临时 append + 还原）为 untracked 操作、逐字披露于 §2，复刻实现方同型 recipe（S 线先例），不计 coding、不洗入 prove 证据。
4. 本裁决仅关闭**本刀关闭目标**（容器可达性缺陷不再复现）。C-PERF-TEARDOWN Branch A 关闭仍须：post-prove dual BOTH PASS（本审 + mw-privacy-int）→ 协调方 nail 全链 → 方可翻转 `:35`；Ban 本审内自关、Ban covered/HA/capacity 任何外推、Ban 洗 7×EXIT=1 历史、Ban secrets/push/force-push。alone ≠ dual：不代签 mw-privacy-int。

## 6. 中文摘要（3 行）

1. fresh re-run 恰一次 EXIT=0：零 ECONNREFUSED @ 断言点、六 run 全过全真实量测、SUMMARY allPass=true capsEnforced=true，machine receipt 源 digest 与实现方 attempts 2/3/4 逐项一致——可达性修复独立复现成立。
2. 包完整性全过：恰 3+7 申报文件、宿主主链/SSOT/禁碰行零 diff、云分支与 nonce 绊线字节级不动、白名单恰两封闭字面量、死代码零残留零行为披露，C-1~C-5/C-7~C-9 全 PASS。
3. C-6 复验：加第三值与 host-gateway 前缀化两变异均咬合（EXIT=1）；loopback 字面量前缀化变异未咬合留为非 gating 加固 residual——无 Blockers，mw-e2e-ha 侧 PASS，CONDITION 关闭仍待 dual BOTH + 协调方 nail。

Verdict: PASS

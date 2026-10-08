# Harness / REQUEST — GODFN-1 · GAP-DEBT-BE-GODFN 拆解刀（W3 前置 · 债行在卷）

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（docs-only · 本刀只拆解不改码 · Ban self-approve）
**Date**: 2026-10-07 · **Base tip**: `9028eb70`（`origin/feat/mysql-schema-skeleton` fetch 后实测 tip）
**Worktree**: `meetwise-line-godfn` · branch `line/be-godfn`
**Line**: **GODFN**（Wave 3 · P1 结构债）
**releaseEvidence=false** · **NOT_HA** · 本刀零产品码 · docs-only · 拆解计划 ≠ 授权 coding

---

## 0. 存在性依据（不改写 · 只引用）

- 债行：`ai-docs/delivery/gap-bug-backlog.md:880` — **GAP-DEBT-BE-GODFN · P1 · OPEN**（本刀不翻 backlog 状态）。
- SOP：`ai-docs/engineering/TASK-SOP-REFACTOR.md` 第 10 行（Wave 3 · GAP-DEBT-BE-GODFN invoke 拆解/G7 卫兵出运行时/AppError 统一）。
- SSE 三胞胎已由 SSE-PUSH 治理 ✅（`harness/sse-push-notify.md` · 单一 `apps/api/src/platform/sse-pump.ts` 97 行 · quiz/interview/diagnosis 三 controller 共用）——债行该项**不在本拆解范围**。
- 上游在卷：G7K/G7R（`harness/gap-g7k-api-reds-fix.md` 族）已钉 invoke 链结构面事实，本刀复用其引证纪律。

## 1. 现状实测（本 REQUEST 落盘前亲测 · 债行口径校准表）

| # | 债行口径 | 本 base `9028eb70` 实测 | 判 |
|---|---------|------------------------|----|
| 1 | invoke() 372 行 8 职责 5-6 层嵌套 | `packages/ai-runtime/src/invoke.ts:403-774` = **372 行整**（blob `6668eff7`）；8 职责相位亲分（§2.1）；最深嵌套 try→asPrincipal 回调→守卫 if→内层 if/await ≈ **5-6 层**（`:575-607` 派发事务） | **吻合** |
| 2 | bootstrap() 325 行 | `apps/worker/src/main.ts:391-715` = **325 行整**（blob `793c1547`）；localRetrieve 闭包 `:524-587` = **64 行**（含它的 `adaptive` 字面量 `:513-608` = 96 行 ≈ 债行「~90 行」口径）；SIGTERM handler `:713` **单行 789 字符**，teardown 调用 **19 个**（12 `.stop()` + 3 `.close()` + 3 `.end()` + 1 `.shutdown()`；债行「14 stop」为近似） | **吻合（计数校准）** |
| 3 | interview.service.ts 954 行 30 方法 | `apps/api/src/modules/interview/interview.service.ts` = **955 行**（blob `d43a569c`）；类方法实测 **32 个**（25 public + 7 private · 债行 30 为近似）；`begin()` = `:193-356` = **164 行** | **吻合（计数校准）** |
| 4 | begin() 同 SQL 查 2 遍 + 3 守卫考古堆积 | 同一 SQL 字节级两遍：`:218-221` ≡ `:236-239`（`SELECT status, expires_at FROM resume_quiz WHERE id=$1 AND owner_user_id=$2`）；三守卫块 = NEG-01 stale_quiz `:217-228` / FAULT-01 missing_quiz_expiry `:235-248` / BOUND-01 resume_version_mismatch `:256-273`（三刀考古各自「逐字节冻结」堆积） | **吻合** |
| 5 | G7 freetier 卫兵 641 行焊进生产运行时 | `g7-freetier-reprove-guard.ts` = **641 行整**（blob `4e75fae7`）+ `g7-outbound-interceptor.ts` **155 行**（blob `d2ffe9cc`）+ `g7-bootstrap.ts` 副作用模块 **10 行**（blob `84ff0147`）；焊点：`apps/api/src/main.ts:2` 与 `apps/worker/src/main.ts:9` **无条件首行 import** + `model-client.ts:379` 二次 install + 8 个生产文件内 g7 感知点（§2.2） | **吻合** |
| 6 | monkey-patch http/ws 13 处 as any | interceptor 写点 = **7 装 + 7 卸**（fetch / globalThis.WebSocket / http.request / http.get / https.request / https.get / ws.WebSocket）；`(x as any)` **4 处**（`:92`/`:120`/`:137`/`:145`）+ `any[]` 签名 8 处（债行 13 为合并近似） | **吻合（计数校准）** |
| 7 | 价格表出自聊天口述 | guard `:5` 注释 + `:18` `G7_PRICE_BOOK_CITATION = 'console-reported by user via coordinator 2026-09-23'`（**非独立核价** · 诚实钉在案 · 本刀不改此口径） | **吻合** |
| 8 | 错误码双轨（message vs code） | code 轨 **13 处** `e?.code ===`（insufficient_entitlement/23505/idempotency_key_conflict/legacy_resume_reference_unresolved/graph_fence_lost…）；message 轨亲证：`invoke.ts:200`（`error.message === 'model_circuit_half_open'` · isHalfOpenFollower 门）· `model-client.ts:517`（`startsWith('g7_')`）· `voice.ts:453`（`=== 'asr_malformed'`）· cloud-* helpers（`startsWith('cloud_*')`） | **吻合** |
| 9 | 26 处 catch(e:any) | `catch (<ident>: any)` 全变体 prod src（apps/api/src + apps/worker/src + apps/worker/smoke + packages/db/src + packages/ai-runtime/src）= **30 处 / 18 文件**（含 smoke 1 处；核心生产 29 处）；分布：interview-consumer 6 · interview.service 5 · payment 2 · resume.service 2 · voice 2 · 其余 12 文件各 1（债行 26 为近似） | **吻合（计数校准）** |
| 10 | SSE 三胞胎 | 已治（§0）——单实现 `sse-pump.ts` | **不在范围** |

**新观察（本刀只登记零处置）**：`vectorPlaneErasureLoop`（`apps/worker/src/main.ts:686` 定义）**未入 SIGTERM handler `:713` teardown 串**——19 个 teardown 调用不含它（`privacyErasureLoop?.stop()` 有、vector 面无）。行为变更属 Ban，登记为 GODFN-1b EXEC 期候选修正项（须协调方另裁，本刀零动作）。

## 2. 四子刀并陈（可分批授权 · 每子刀独立走 REQUEST→双审→EXEC→post-dual→nail 全链）

> 总门（四子刀共同）：**行为等价重构**。prove = 触面既有 prove **全复跑**（§5 矩阵）+ 每子刀新增断言（下分述）。SOP 硬规则：每刀 prove 对表 `NEXT-NODE-BEST-PRACTICES.md`。

### 2.1 GODFN-1a · invoke() 按 phase 拆私有函数

**范围**：`packages/ai-runtime/src/invoke.ts` 唯一文件。把 `:403-774` 的 `invoke()` 按既有相位拆为同文件私有函数，主函数只编排：

| phase 函数（候选名） | 现行位 | 职责（亲测） |
|---|---|---|
| resolve+prepare | `:404-461` | 逻辑键解析（resolvedLogicalNodeKey + resolveModelOperation）→ preparePlan → costPolicyError → digest |
| claim | `:463-482` | durable claim 轮询（for(;;) + claimModelInvocation + follower 20ms 真轮询 + deadline） |
| admit | `:487-500` + `:506-570` | 共享准入（admitSharedModelOperation）+ 本地 admission + 半开 follower 路由重试（routeRetry×2 + cost-policy 冻结） |
| reserve+dispatch | `:572-629` | 隐私围栏 + reserveAiTextCost + markModelInvocationDispatched + markAiCostDispatched（单事务） |
| execute+settle | `:631-773` | 执行（withAbortTimeout）→ 四路结算（known_not_executed 拒 / unknown / usage 非法 / settle+complete+trace）+ breaker 释放 |

**不动**：模块级辅助（`releaseSharedAdmissionBestEffort` `:209-217`、`isHalfOpenFollower` `:199-201`、`persistTraceBestEffort`、ALS/REQID 等）原样；导出面签名零变（`invoke` / types）；跨相位状态经显式参数对象传递，禁闭包共享可变态。
**Ban（1a 特有）**：Ban 改任何错误码字符串与返回语义（含 `model_failover_cost_policy_mismatch` 特例口 `:557-559`）；Ban 改 sleep(20)/deadline/60s lease 常量；Ban 合并/重排 SQL 事务边界；Ban 动 `asPrincipal` 包裹层；Ban 触 `text-endpoint-config.ts` 与 `run-e2e-isolated.mjs`（§3 三钉）。
**证明**：触面既有 prove 全复跑（§5 1a 列）+ **关键路径新增断言**（新增 test 只加不断言不改旧断言）：① follower joined→cached 短路 ② admission 拒→claim failed+槽释放 ③ half-open 路由重试跨 cost policy→`model_failover_cost_policy_mismatch` ④ privacy fence→`privacy_fenced_pre_dispatch` ⑤ reserve 拒→`cost_<decision>` ⑥ settle 失败→`settlement_or_record_failed` 留 reservation。行为等价证明 = 复跑全绿 + 断言零改写。

### 2.2 GODFN-1b · G7 freetier 卫兵移组合根

**范围**：
- **移出运行时包**：`g7-outbound-interceptor.ts`（monkey-patch 本体）+ `g7-bootstrap.ts`（副作用入口）→ test-only 位置（`packages/ai-runtime/test/` 或独立 test-support 面 · EXEC 定）；`packages/ai-runtime/src/index.ts:221-222` 的 interceptor 导出随迁。
- **开关接口注入**：生产文件内的测试态感知点收敛为**组合根注入的谓词/接口**（运行时包不 import 测试态）：`model-client.ts`（g7 局部变量 `:220`/`:376` + 20 余分支 + `withG7OutboundAllow` 派发票 `:440`）· `context-budget.ts:26/:278-286` · `voice.ts:430/:474` · `voice-stream.ts:54/:79/:138` · `embedder.ts:31` · `reranker.ts:26`。
- **组合根落位**：`apps/api/src/main.ts:2` 与 `apps/worker/src/main.ts:9` 的无条件 import 改为按注入开关装配；e2e runners（`run-e2e.mjs:46-47` · `run-e2e-ui.mjs:51-52` · `e2e-live-capability-env.mjs:27-29` · `run-e2e-isolated.mjs:58/:2065/:2075`）激活路径同迁。
- **guard 本体**（价格表/账本/配额断言族）随组合根面迁或留 src 但**经接口注入、零 process.env 直读**——EXEC 定型，双审裁。

**Ban（1b 特有）**：Ban 改价格表数值与 `G7_PRICE_BOOK_CITATION` 口径（聊天口述诚实钉**原样保留**·核价是另刀）；Ban 改 `G7_FREETIER_REPROVE` 激活语义（=1 才活）；Ban 松动任何 fail-closed 门（`assertG7UnguardedPathDisabled` 8 调用点语义不变）；Ban 改 cost/token/call cap 缺省；Ban 借迁移把 interceptor 装回生产路径；vectorPlaneErasureLoop SIGTERM 缺位（§1 新观察）**本刀零处置**只登记。
**证明**：`prove:g7-freetier-reprove-guard` · `g7-freetier-reprove-client` · `g7-freetier-reprove-paths` · `g7-freetier-fix-round2` · `native-fail-closed` · `dashscope-native-config` · `text-endpoint-config` · `interview-voice-seams` 全复跑绿 + 新增断言：**生产构建零 g7-bootstrap import**（静态扫描门）+ G7 off 时运行时包行为字节级等价。

### 2.3 GODFN-1c · interview.service 域拆 + begin() 守卫合并

**范围**：`apps/api/src/modules/interview/` 目录内拆分（**32 方法 → 域子服务** · 控制器路由面零变）：

| 域子服务（候选） | 方法（亲测 32 个全分派） |
|---|---|
| voice | voiceGate · speak · speakStreamPrepare · speakStreamChunks · transcribe（5） |
| report | report · retryReport · exportReport · transcript（4） |
| assessment | generateAssessment · getAssessment · generateCareerPath · getCareerPath（4） |
| learning | generateLearningPlan · getLearningPlan · completeLearningItem（3） |
| core 会话 | begin · turn · submitPreviewAnswer · questionFeedback · abandon · create · list · get · events · answer（10） |
| 共享私有守卫 | denyPublicPreviewWrite · requirePublicPreviewControlWrite · mapAnswerLedgerError · answerableError · assertAnswerable · guardInterviewPrivacy（6） |

**begin() 守卫合并**：三守卫块（`:217-228`/`:235-248`/`:256-273`）合并为**单 SELECT 单查**（status+expires_at+pin JOIN 一查询回）+ **抛序保持**（stale_quiz → not_found → missing_quiz_expiry → NaN fold → resume_version_mismatch 的现行精确顺序逐字节保持 · 两遍同 SQL `:218`/`:236` 归一）。
**Ban（1c 特有）**：Ban 改任何 HttpException 状态码/错误码/抛序；Ban 改 advisory lock / FOR UPDATE / 事务结构；Ban 改幂等键语义（start job 幂等查询 `:313-329` 原样）；Ban 控制器与路由契约面；Ban 借拆分改 `supplyCandidateProfileRoute` 供给语义（`:338-342`）。
**证明**：触面既有 prove 全复跑（§5 1c 列）+ 新增断言：守卫合并后三错误码（stale_quiz/missing_quiz_expiry/resume_version_mismatch）**同 SQL 单查**下抛序等价 + resume_quiz 查询次数 3→1 计数断言。

### 2.4 GODFN-1d · AppError{code} 统一（26 消费方影响清单 EXEC 落）

**范围**：新 `AppError extends Error { code }` 类型域（落位 EXEC 定 · 候选 `packages/db/src/errors.ts` 或 contracts 面）；**30 处 `catch (<ident>: any)` 逐处 narrow**（`unknown` + `instanceof AppError` / PG code 探测）；双轨收敛——code 轨 13 处保持 + message 轨位点（`invoke.ts:200` · `model-client.ts:517` · `voice.ts:453` · cloud-* helpers）迁移到 code 判定（**错误码字符串本体零变**·只换判定通道）。
**26 消费方影响清单**：本 REQUEST 钉文件级分布（§1 #9：interview-consumer 6 · interview.service 5 · payment 2 · resume.service 2 · voice 2 · 12 单点文件），**行级清单 = EXEC 前置交付物**（落 `receipts/godfn-decompose/1d-consumers.md` 后方可动码）。
**Ban（1d 特有）**：Ban 改任何对外错误码/HTTP 状态映射（收敛判定通道 ≠ 改码）；Ban 把 g7_ 前缀族错误改码（guard 抛出语义 §2.2 冻结）；Ban 顺手修 `c:any`/`req:any` 热点（§6 余量 · 另刀）；Ban 动 invoke 内 `model_failover_cost_policy_mismatch` 特例口（1a 冻结面交叉）。
**证明**：双轨位点各自触面 prove 全复跑（§5 1d 列）+ 新增断言：narrow 后 13 处 `e?.code` 行为零变（负测 proves 即断言面）。

## 3. 全局 Ban（违者整刀作废）

1. **Ban 行为变更**：四子刀皆行为等价重构；错误码/抛序/SQL 语义/事务边界/时序常量零变。
2. **Ban RLS**：零 SQL 策略/角色/授权面触碰（含 `asPrincipal` 语义）。
3. **Ban 幂等键**：idempotencyKey 生成/digest/claim 语义零触碰。
4. **Ban secrets**：Key 只经进程环境 loader；Ban 写 `.env*`；Ban Key 值/fingerprint 入树/入收据（name-only）。
5. **Ban 三钉 blob（invoke 相关）**：
   - `scripts/run-e2e-isolated.mjs`（本 base blob `796b12e4`）——stderr withhold 契约 `:2162-2163`（永不转存回显）**零触碰**；
   - `packages/ai-runtime/src/text-endpoint-config.ts`（blob `005c68cc`）——默认配对 proof test-enshrined（`text-endpoint-config.proof.ts:31-36`）**零触碰**；
   - `apps/api/src/modules/interview/interview.service.ts`（blob `d43a569c`）——1c 拆分本体必触：允许**结构搬移**，但行为等价门全过 + EXEC 收据登记 **blob 演进对照（旧 `d43a569c` → 新）**。
6. Ban SSOT/backlog 状态翻转（GAP-DEBT-BE-GODFN 保持 P1 OPEN 至各子刀 nail 后协调方另翻）；Ban push-before-dual；Ban self-approve；alone ≠ dual。
7. Ban 借刀夹带（超出 §2 各子刀范围的一切顺手改）；Ban 为绿改断言/洗红（预存红零回归口径沿 E5 惯例）。

## 4. Pins 十值（retained · 本刀不改口）

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
| `g7SuiteGreen` | **false**（至三绿+post-dual+nail · Ban flip） |
| `r1Closed` | **false** |

（沿：`actualSpendCny=null` · GAP-DEBT-BE-GODFN **P1 OPEN** 保持。）

## 5. prove 矩阵（每子刀 = 触面既有 prove 全复跑 · EXIT=0 或 base 同红零回归）

| 子刀 | 触面既有 prove（复跑清单） | 新增断言面 |
|------|---------------------------|-----------|
| 1a | `model-op02:prove` · `breaker:prove` · `failover:prove` · `failover-price-policy:prove` · `prove:claim-join-orphan` · `prove:model-cost-governance` · `prove:estimate-threading-invoke` · `prove:usage-estimate-threading` · `prove:usage-calibration-reconciler` · `interview-dispatch:prove`(+gate/unit) · `adaptive:prove` 族 | §2.1 六关键路径 |
| 1b | `prove:g7-freetier-reprove-guard` · `g7-freetier-reprove-client` · `g7-freetier-reprove-paths` · `g7-freetier-fix-round2` · `prove:native-fail-closed` · `prove:dashscope-native-config` · `prove:text-endpoint-config` · `prove:interview-voice-seams` | 生产构建零 g7-bootstrap import 静态门 + G7-off 等价 |
| 1c | `neg:interview` · `prove:uc025-stale-quiz-expiry/nhp-neg/nhp-bound/nhp-fault/nhp-fault-isolated/nhp-adv` · `prove:uc018-abandon-http/adv` · `prove:uc011-report-refund-http` · `prove:uc019-report-regenerate-http` · `prove:uc004-career-path-fault` · `prove:last-event-id` · `prove:int-transcript-preview-submit-http` · `prove:public-preview-write-gate` · `prove:sse-principal-slot` + e2e trio（G7 trio 协议口径） | 抛序等价 + 查询次数 3→1 |
| 1d | commerce/auth/resume/quiz/diagnosis 各 proves · worker 四 consumer proves · payment 触面 proves · `neg:*` 族 | 13 处 `e?.code` 行为零变 |

**收据**：逐 CMD 实录 EXIT 落 `receipts/godfn-decompose/<子刀>/`；预存红记 base≡red（零回归）；三钉 blob 对照（如触）。

## 6. 范围外余量登记（债行项 · 本拆解不覆盖 · 零静默丢弃）

债行 `:880` 余项不在四子刀内，**保持登记**待后续拆解或显式豁免：
- **HMAC 验签×3**（commerce/privacy/db 多文件 createHmac 面）——独立子刀候选 GODFN-1e 或另线；
- **any 热点 `req:any` 24 处 / `c:any` 13 处**（债行口径；本 base 实测 `(c: any` 13 处吻合，`(req: any` 3 处为窄口径）——1d 只收敛 catch 面，参数面余量另刀；
- bootstrap() 拆分（localRetrieve 闭包外提/SIGTERM 串函数化/vectorPlaneErasureLoop 缺位处置）——登记为 GODFN-1b 附带面或独立 GODFN-1f，须协调方另裁。

## 7. 授权协议（分批）

1. 本 REQUEST（拆解刀本体）= docs-only，**写完即停**；不授权任何 coding。
2. 四子刀**可分批授权**：每子刀单独 REQUEST 细化（或以本文件为据直接立项）→ 预执行双审（mw-model-op + mw-e2e-ha BOTH PASS）→ 协调方 EXEC 授权 → prove 收据 → post-dual → nail。
3. 子刀间依赖：1a 先于 1d（invoke 冻结面交叉）；1b 与 1a/1c 可并行；1c 与 1d 的 interview.service 5 处 catch 位**同文件冲突 → 串行**（先 1c 后 1d）。
4. 双审分工：**mw-model-op** 首责 1a/1b/1d 码域（invoke 状态机/卫兵边界/错误码域）；**mw-e2e-ha** 首责 prove 矩阵完备性/trio 口径/隔离 runner 纪律/docs-only 完整性。

## 8. 状态

- [x] 债行与 SOP 依据登记（§0）
- [x] 现状十项实测校准（§1 · 计数偏差如实披露）
- [x] 四子刀范围/Ban/证明并陈（§2 · 可分批授权）
- [x] 全局 Ban + 三钉 blob 钉死（§3）
- [x] Pins 十值 retained（§4）
- [x] prove 矩阵（§5）+ 余量登记（§6）+ 授权协议（§7）
- [ ] 预执行双审（mw-model-op + mw-e2e-ha）
- [ ] 各子刀 REQUEST→EXEC→post-dual→nail（另案）
- [x] **STOP**

---

*GODFN-1 REQUEST · 2026-10-07 · base `9028eb70` · docs-only 拆解刀 · 四子刀可分批授权 · awaiting pre-exec dual · Ban self-approve · STOP*

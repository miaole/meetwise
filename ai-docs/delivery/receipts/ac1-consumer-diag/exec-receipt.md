# AC-1 adaptive-consumer 排空环调查刀 — EXEC 收据 · 定谳报告

- 席位：mw-core（EXEC）· REQUEST @37b5ed50 唯一蓝本 · 双席预审 BOTH PASS（两 Conditions 并入本授权）
- worktree `/Users/miaole/Desktop/golucky/meetwise-line-ac1` · 分支 `line/adaptive-consumer-diag` · HEAD=37b5ed50（=REQUEST commit，base 同红原值 retained，未重跑 base）
- 判：**纯诊断零修复零产品码** · apps/packages src **零 diff** · **proof 夹具零改**（C-2 补钉兑现）· runner 零 diff · 恰 **1** 次 prove 调用 · est **0** live（mock 模型面）· Key name-only
- harness lifecycle：`draft:awaiting_pre_exec_dual` → `exec:awaiting_post_prove_dual` · 本收据后 STOP · Ban self-approve · alone≠dual

---

## 1. run 面（C-1 :raw 面落地）

- 授权字面命令 `pnpm --filter @meetwise/worker adaptive-consumer:prove:raw` **无法在 worker 包落地**：该脚本名只存在于 root（package.json:451，本身是转发器 `pnpm -C apps/worker prove:adaptive-consumer`）。亲测探测（a1，零执行零 DB）：`None of the selected packages has a "adaptive-consumer:prove:raw" script`。
- **:raw 面落地面** = runner 自己的 isolatedCommand 子命令（`scripts/run-e2e-isolated.mjs:1877-1878`）：`pnpm -C apps/worker prove:adaptive-consumer`（≡ `pnpm run prove:adaptive-consumer` → `tsx test/adaptive-consumer.proof.ts`）。这正是 root 包裹器内部经 `runRedactedProof`（runner :2191-2226，stdout/stderr 全部只进内存、永不回显——即 1a 只能看到分类类看不见 stderr 诊断行的设计根源）拉起的同一 child。本刀按 C-1 以双流可见方式直跑该 child，**runner 脚本零改动**。
- 隔离环境按 runner 同配方自备（非 prove 调用）：`docker run --rm -d pgvector/pgvector:pg16` + 服务端 nonce `meetwise.e2e_run_token` + host/container 双探 ready×3 + `pnpm -C packages/db migrate`（**152 applied / 0 skipped**，migrate.log）。child env = runner baseEnv 同面（E2E_ISOLATED=1 · E2E_TEST_CONTAINER · E2E_TEST_TARGET_TOKEN · PGHOST=127.0.0.1 · PGUSER/PGPASSWORD/PGDATABASE · DATABASE_SSL_MODE=disable · 动态 PGPORT）；MODEL_API_KEY/DASHSCOPE env 计数 **0**（name-only）。
- **THE run**：EXIT=1 · 2071ms · 2026-10-09T03:48:03Z · manifest 见 `run-manifest.txt`（注：manifest 内 `run=1` 为生成脚本 sed 锚漏的标签缺陷；权威身份 = 目录 run2 + 容器名 `meetwise-e2e-ac1diag-r2-*` + 上述时间戳）。

### base≡red 签名配对（同值 retained）

按 runner `runRedactedProof` 同口径从捕获双流重建：

```
ISOLATED_PROOF_SUMMARY target=adaptive-consumer:prove:raw exit=1 pass_count=4 fail_count=4 failure_class=child_exit_nonzero stage=NORMAL_ANSWER_DRAIN code=UNKNOWN
```

与 GODFN-1a §2.2#18 登记（head/base 双侧 `4/4 child_exit_nonzero NORMAL_ANSWER_DRAIN UNKNOWN`）**逐字段同类全等**——base≡red 预存红原值 retained，本刀零新红零翻绿。

## 2. 双流全量（席2 处方：stdout FAIL 行=三向判别主证据；stderr=根因定谳主证据）

**stdout**（`prove-stdout.raw` 全量 807B）：

```
PASS  消费者使用已 provision 的低权 runtime login（运行时登录）        ← proof :49
PASS  双 worker 同一 graph:第二个拿不到 fence(无并发 resume)           ← proof :90
PASS  首 worker 释放后正常完成 fence callback                          ← proof :92
FAIL  消费 start job → 自适应路径(返回 start)                          ← proof :119（startDrain!=='start'）
PASS  正常 v64 start 只读画像授权门、不解密简历原文                    ← proof :120（resumeDecryptions===0）
FAIL  start 后发首题 question_ready(经队列→消费者→自适应图)            ← proof :122
FAIL  低置信 RAG 在真实 consumer→graph 路径走有界 deepResearch，未落回浅层 seam ← proof :123（deepCalls=0）
FAIL  深检索正文以不可信信封进入出题 prompt，系统明确禁止执行来源指令   ← proof :124（askRequests=[]）
```

**stderr**（`prove-stderr.raw` 全量 157B）：

```
adaptive-consumer start diagnostic: { status: 'failed', last_error: 'adaptive_role_route_missing' }   ← proof :114-117 start 诊断查询
ADAPTIVE_CONSUMER_STAGE=NORMAL_ANSWER_DRAIN CODE=UNKNOWN                                              ← proof :409 banner
```

## 3. 失败链逐环（码面 chain × run 证据逐环对账）

| # | 环 | 码面（apps/worker/src/interview-consumer.ts 除注明外） | 本 run 证据 | 判 |
|---|---|---|---|---|
| 1 | 入队 start | proof :110 `enqueueInterviewJob(start,{},0)`（v64 helper 派生 typed reference） | job 存在且最终 status='failed'（非 queued/idle） | ✅ 落队成功 |
| 2 | claim | :179-181 `claimNextInterviewJob`（tx1） | markJobFailed 只在 claim 后可达 → status='failed' 即 claim 发生 | ✅ |
| 3 | 隐私闸 | :188 `assertInterviewPrivacyActive` | 未走 :194 requeue/'retry'（last_error 非 privacy 面） | ✅ 通过 |
| 4 | v64 引用门 | :202 `hasCurrentResumeReference`（:107-153）；失败则 :203-207 落 `interview_resume_reference_missing_or_mismatched` | 观测 last_error='adaptive_role_route_missing' ≠ 该值 → **门已通过** | ✅ 通过 |
| 5 | payload 读 | :211-212 requestId（start 无 answer payload :215-220） | 无 retry 面 | ✅ |
| 6 | start 前置读 | :320-331 画像元数据只读（**不解密**） | proof :120 PASS（resumeDecryptions===0，失败路径下依然成立） | ✅ 契约保持 |
| 7 | **角色供给门（根因环）** | :352-357 `isTechRoleFailClosedEnabled()` **默认 ON**（adaptive-role-resolve.ts:36-40，env 未设→on）→ `getInterviewRouteSnapshotForAdaptiveRole`（candidate-route.ts:113-122：recruiter snapshot 无行且 `candidate_profile_route_snapshot` 无行 → **return null**）；:358-361 `resolveAdaptiveInterviewRole({roleFromRouteSnapshot:undefined, roleFromDeps:'后端工程师'})` → **throw `adaptive_role_route_missing`**（adaptive-role-resolve.ts:53-61；类型文档 :31-35 明文：fail-closed 下 deps 注入**不足以**过门） | **stderr 诊断行 last_error='adaptive_role_route_missing'（status='failed'）**；:123/:124 FAIL（deepCalls=0、askRequests=[]，图与模型面零进入——:362 `startAdaptiveInterview` 从未被调用，planCompetencies 亦未达） | ❌ **在此断** |
| 8 | 失败收尾 | :376-387 catch：`errCode(e)`≠'graph_fence_lost' → :386 `failClaimedInterviewJob`（:156-169）→ markJobFailed（interview-jobs.ts:214-218，last_error=error.message≡code 串）→ :163 `terminalizeUnsettledInterview` → `failInterviewAndRelease`（配对释放 1.0）+ :94 `interview_unavailable` 终态事件 → return 'failed'（:387） | diagnostic status='failed'；:119 FAIL（'failed'≠'start'） | ✅ 按现契约干净终态 |
| 9 | markJobDone | :372 | 从未达 | ⛔ 未达（因 #7） |
| 10 | **排空环（溃点）** | proof :127 stage='NORMAL_ANSWER_DRAIN' → :128 环 → :129-130 查 `interview_question … status='issued'` → **0 行 → q===undefined** → :132 `q.question_id` **TypeError（无 .code 的裸逃逸）** → proof :397-409 main catch：rawCode=''、message 不中任何 regex → CODE=UNKNOWN → banner → exit 1 | banner `NORMAL_ANSWER_DRAIN UNKNOWN`；环内 :133-137 全部未达 | ❌ 观测崩溃面（夹具侧） |

## 4. 溃点 vs 根因环区分（C-2）

- **溃点（可观测逃逸面）**：proof **:132** —— `:127` 环内 q 未定义型无码抛（TypeError reading 'question_id'）。**纯夹具侧代码**，零产品码参与；它只是把上游缺题转写成 exit 1 + UNKNOWN 码。
- **根因环（上游 start/首题环）**：consumer 角色供给门 **:352-361** + resolver fail-closed 默认 → start job `failed` → 无 issued 题 → 喂给溃点。逐环证据（§3 #7/#8：stderr 诊断 last_error + :119-:124 FAIL/PASS 面 + 模型面零进入）已全部落本收据后方下修复方向（§6）。
- 判别式成立性：若根因在 v64 门或隐私闸，last_error 应为 `interview_resume_reference_missing_or_mismatched`/privacy 面——观测值排除；若 start 成功而事件/题面漂移，:119 应 PASS 且 :132 不会以 q undefined 崩——观测 4 PASS/4 FAIL 的构成（唯一 PASS 在 :120）唯一指向「start 失败 + 无题」。

## 5. 三向判读

1. **夹具债 — 命中（主判）**：fixture 最后实质更新 3d88cb64（2026-09-04），其建面方式=裸 SQL 插 `interview`（proof :71/:73，**无任何 route snapshot 供给行**）+ 依赖 `adaptive.role:'后端工程师'` deps 注入（proof :105）。而 g-r4-3 R1 product-close（72233a08，2026-09-23）把 `MEETWISE_TECH_ROLE_FAIL_CLOSED` 翻为**默认 ON** 且明文「deps 注入不再满足门」（防 silent 技术岗回注），g7s（939f1b44，2026-10-08）补 `candidate_profile_route_snapshot` fallback 读。fixture 未随契约升级 → NEGCOMM-1 同族先例。
2. **产品回归 — 排除**：零产品崩溃；观测到的失败是**确定性的契约执行**（fail-closed 拒绝恰是现行文档化产品意图），且失败收尾链（job failed + interview_unavailable 终态 + 配对释放 + 零解密/零模型/零题副作用）逐环按设计走完。v64 门、隐私闸、只读画像门在失败路径下依然全部保持（:120 PASS 为直接证据）。
3. **契约演进 — 成立（机制框架，非缺陷类）**：v64/G-R4-3/G7S 角色供给契约（0142_candidate_profile_route.sql 起）晚于 fixture 建面，属「夹具未跟上契约演进」，与 1 同时成立、互为因果。

**GODFN-1a 时代只能登记类别（4/4 child_exit_nonzero）的原因即 C-1 所指**：root 包裹器 `runRedactedProof` 按设计 withhold child 双流，stderr 里的 start 诊断行（本刀根因定谳主证据）在包裹器面不可见。:raw 直跑零改 runner 即补齐。

## 6. 修复方向建议（**仅方向·修复刀另立全链**·本刀零修复）

- **方向 A（优先建议）**：夹具升级——为 fixture interview 供给真实 route snapshot（走生产 begin 同源供给面 / `candidate_profile_route_snapshot` 行，primary leaf 给定如『后端工程师』leaf track），使 fail-closed 门在 **ON 态生产等价条件**下被行使，保门诚实度。涉及面仅 `apps/worker/test/adaptive-consumer.proof.ts`（夹具刀）。
- **方向 B（弱替代，仅当该刀范围必须排除角色门）**：以 `MEETWISE_TECH_ROLE_FAIL_CLOSED=0` 显式 legacy opt-out 跑本 proof——门不被测试，须在刀面显式登记 scope 让步。
- 溃点 hygiene（可选、非必需）：proof :129-132 环首可加「无 issued 题→显式 FAIL 而非 TypeError」防 字面崩溃——start 修复后不触发；若做，仍须夹具刀内进行。
- **产品侧：本证据链零修复指示**（g7s 已备 fallback 读；begin 面供给已落 939f1b44）。

## 7. pins 十一值（照抄）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false + 脚注 **actualSpendCny=null**（est live=0：mock 模型面、图未进入、MODEL_API_KEY/DASHSCOPE env 计数=0；free-tier wiring 口径无计价数据源，Ban invented spend）

## 8. Non-claims

本刀 ≠ 修复（修复刀另立全链）≠ adaptive 面全部 ≠ G7 面 ≠ g7SuiteGreen 翻转 ≠ 角色门产品语义裁定（门语义本身属已 close 刀的管辖）。attempts 全账（含 a2 launcher 缺陷零证明体进入）见 `attempts.md`。

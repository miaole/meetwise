# Harness — F-F · **interview_job last_error 甄别刀**（Line F-F · docs REQUEST · **`draft:awaiting_re_pre_exec_dual`** · G7R post-dual 双 PASS 后 model-op 交付的一步甄别器 · ≠ 修复 ≠ trio 翻绿）

**Status**: **`draft:awaiting_re_pre_exec_dual`**（rewrite 轮（re_pre）· round-1 pre-dual 双审 mw-model-op **PASS** 附 C-MO-P1/P2 + mw-e2e-ha **FAIL** 附 B-FF-1/B-FF-2·C-HA-FF-1~5（两审段随卷 append-only 保留于 reviews 双 stub）→ 本 commit 恰限处方面改写（B-FF-1/B-FF-2/C-HA-FF-1~3/C-MO-P1/C-MO-P2·OB-MO-1/OB-FF-1·OB-FF-2 继承）· **Ban 实现方 self-write 任何 PASS verdict** · docs REQUEST only · Ban coding · Ban prove 执行 · Ban 实跑 · Ban live（本 turn 零调用零 Key 加载零 DB 连接）· Ban push · Ban fake green · Ban `g7SuiteGreen=true` · Ban 洗绿/Ban retry-to-green · Ban 改 withhold 机制 · Ban 为绿改产品（甄别=只读诊断，修复另刀）· Ban 碰 `:68`/`:70`/`:71` 已清面 · Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT）
**Date**: 2026-10-07
**Line**: **F-F**（G7R post-dual BOTH PASS `bfd868e0` 之后的甄别 EXEC 刀；G7R 三红 EXIT 1/1/1 与 GAP-G7K-API-REDS P1 OPEN retained）
**授权链（re_pre 轮）**：round-1 REQUEST（`1dd1e630`，与 origin tip `0b18169c` 同父同树孪生）→ round-1 pre-dual 双审（**mw-model-op PASS** 附 C-MO-P1/P2·OB-MO-1/OB-MO-2 · **mw-e2e-ha FAIL** 附 B-FF-1/B-FF-2 + C-HA-FF-1~5·OB-FF-1/OB-FF-2；两审段 append-only 随卷保留）→ 本 rewrite commit（恰限两审处方面，Ban 静默换范围）→ **RE-PRE 双审 mw-e2e-ha + mw-model-op 重走 BOTH PASS** → 协调方授权 EXEC（含甄别 run 面裁定：ui-isolated 首选 / iso 备选，keep-container 变体仅限协调方显式批准）→ 才允许在独立 worktree 仪器化重跑 ×1（备选 +1）。**RE-PRE 双审 PASS ≠ EXEC 授权；本 commit 不预claim 任何 post-commit EXIT。**
**输入事实（只读在案引用）**：
- **残余候选排序（G7R post-dual，origin `REQUEST-2026-10-07-gap-g7k-api-reds-fix-mw-model-op.md` POST 段 §3.4）**：**H0-alt-5（结构性 pre-model throw）最强**——观测 SSE `interview_unavailable{kind:start,reason:job_failed}` 是 throw 路径签名（`apps/worker/src/interview-consumer.ts:93` appendEvent `{reason,kind}` + `:162` `failClaimedInterviewJob` 触达），而 provider chat 失败在本码基优雅降级不抛（`generation_*`，无 `kind` 字段）；**一步甄别器 = 失败 run 的 `interview_job.last_error`**（`markJobFailed` 持久化 `error.message.slice(0,500)`，`packages/db/src/interview-jobs.ts:214-217` 亲读）。
- **H0-alt-1 出局（协调方 Key 直探 · 输入事实引用）**：F-A-1 配对（`dashscope-cn-beijing` × `qwen-plus`）直探 **HTTP 200 成功**；错配面 **401 复现** → Key provenance=百炼成立、G7R EXEC 所用值面对 provider 可达 → H0-alt-1（Key 非百炼/无权限）出局，原 H0 值面（F-A-1 配对致 provider 拒）同出局。**注意 401/404 在 invoke 层扁平化为同一 `provider_rejected`（`model-client.ts:515-516`），DB 账本单看仍不可分 401/404——本刀判读表对 `provider_rejected` 值域保留此不可分注记。**
- **H0-alt-2 驳回（G7R post-dual §3.1 code-face 级）**：registry embedding `wired:false` 行零生产调用点、即便假设传入也降级不抛、start-job chat ops（competency-planning/question-generation/route-classify）全 `wired:true`——仅留 F-B backlog 注记。**可证伪性随卷（C-MO-P1）**：若 EXEC 读数（`last_error` 或 `ai_model_invocation.error_code`）现 embedding-build/embedding-query/rerank 签名（registry `:148/:153/:158` `wired:false`），即「零生产调用点」前提被证伪 = **推翻本驳回**——判读表 §1.4 已设显式证伪分支，Ban 扫入基建 catch-all、Ban 就地 reinterpret，须如实记矛盾并回协调方。
**Knife 定位**：G7R EXEC 收据+DB 面均不可分红的 provider 侧细节，且 prove 容器 `--rm` 即毁（`scripts/run-e2e-isolated.mjs:2296` `docker run --rm -d` + `:2367` finally `docker rm -f`）——DB 状态随容器消失，G7R EXEC 期的隔离 PG 工件已不可回读。**F-F = 仪器化重跑授权**：重跑失败路径一次，在容器拆除**前**从隔离 PG 只读 `interview_job.last_error` 等三面读数，对 H0-alt-5 的子面（结构门 / invoke 内部态 / 基建 throw）一步定谳。**读 DB 不破 wrapper stderr withhold 契约**（读的是 DB 不是子进程 stderr；G7R post-dual mw-model-op 已确认此路径合法，§3.4-C 原文「不破 stderr withhold `:2093`（读 DB 不读子进程 stderr）」）。
**Pins（原值全抄 · 未动）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503**
**Retained（本刀零翻转）**: **`g7SuiteGreen=false`** · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · Disclosure-1 **OPEN** · trio **OPEN**（EXIT 1/1/1 真实业务红）· GAP-G7K-API-REDS **P1 OPEN**（`0c6c3287` 登记 · 本刀不翻 backlog 状态）· **`actualSpendCny=null`**
**Base**: `origin/feat/mysql-schema-skeleton` **`0b18169c`** / full `0b18169c78f20b0d2b8c5105d388b23d6d9cc865`（**2026-10-08 rewrite turn `git fetch` 成功后 rebase 重钉**：本分支 round-1 REQUEST `1dd1e630` 与 origin tip `0b18169c` 为同父同树孪生（tree `b910a6da…` 全等 · round-1 双审 OB-FF-1/OB-MO-2 如实登记），rebase 按 patch-id 自动 skip 孪生、本分支落 tip `0b18169c`；全部码面锚已按 tip 逐一重核全中（DDL `05_interview_jobs.sql`/`0001_baseline.sql`/`0037`/`0088` + §1.4 全锚 + wrapper blob `13dbfc43` 全等），round-1 注记行号 @`bfd868e0` 与 tip 树全等等价）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-ff` · branch `line/ff-last-error`

---

## 0. 本 turn 只读纪律声明（Ban coding/Ban prove 的证据来源披露）

本 REQUEST 的设计**零实跑、零 live 调用、零 Key 加载、零 DB 连接**，证据全部来自只读：**(a)** 本 worktree git 只读源码亲读（行号一律 @`0b18169c`——rebase 重钉 tip 后 rewrite turn 全锚重核；round-1 引用 @`bfd868e0` 与 tip 树全等）；**(b)** G7R REQUEST/harness/双审 post-dual 段（同树在案）引用；**(c)** 协调方 Key 直探结果按任务单作为**输入事实引用**（本 turn 未复跑、未读取任何 Key 值）；**(d)** round-1 双审段（mw-model-op PASS / mw-e2e-ha FAIL）随卷 append-only 保留于 reviews 双 stub，本 rewrite 恰限其处方面。不发明任何未在案的明细。

## 1. 甄别实验设计（范围 = 甄别，非修复）

### 1.1 重跑面（首选 → 备选）

| 序 | 面 | CMD | 甄别对象 | 取舍 |
|---|---|---|---|---|
| **首选** | **uc018-abandon UI 面**（红②） | `pnpm e2e:ui:isolated`（wiring `package.json` `e2e:ui:isolated`，G7R @`3767f783` 实测 `:279`；EXEC 按当 tip 重核） | start job throw 全链：begin 202 → worker 领 job → 抛 → `markJobFailed` → `interview_unavailable{kind:start,reason:job_failed}` → abandon 409。G7R 观测 SSE throw 签名正是此面 | 失败确定性 ×2 project 复现（1.8/1.9s 秒抛），last_error 必落 |
| **备选（仅当首选 run 查询成功且确实未捕获 failed 行——查询报错≠空读，C-HA-FF-3）** | iso HTTP 面（红③主 drive + begin 链） | `pnpm e2e:isolated`（`:278`） | 同一 start-job 链 + 主面试 drive 0 题 fast-fail | 第二 attempt，独立记账，Ban 借它重试到绿 |

**Ban 候选面（本轮明确不做）**：recruiting-bound bind 面（红①）——其因果链在 `interview_job` **入队之前**即断（无 route binding → start 409 fail-closed——**start job 未入队**：`POST /` 的 interview 壳行已创建，四道 fail-closed 409 门 `interview.service.ts:278-279/:284-285/:304-305/:323-324` 全部先于 `:337` `enqueueInterviewJob` 入队（round-1 OB-MO-1/C-MO-P2 措辞精确化：Ban 沿用「interview 从不创建」简写）），`last_error` 甄别器在该面无对象；红①面甄别属后续 route 侧另刀。keep-container 变体同理仅作读取窗口兜底（§1.2-B），不改变重跑面选择。

### 1.2 DB 读取窗口机制（核心技术难点：容器 `--rm` 即毁）

**首选机制 A —— run 内 sidecar 直读（零 wrapper diff · 零产品码）**：

1. wrapper 在 spawn e2e 子进程**之前**即打印 `E2E isolated PostgreSQL: <container> on 127.0.0.1:<PGPORT>`（`run-e2e-isolated.mjs:2310` 亲读），PG 端口动态映射 `-p 127.0.0.1::5432`（`:2301`）。
2. EXEC 机制：wrapper stdout tee 到 worktree `.tmp/ff-<runid>.log`（不入 git）；**sidecar 只读探针**监测该 log 命中端口行后，经宿主 TCP 连 `127.0.0.1:<PGPORT>` 轮询（间隔 300ms），凭据与 runner 自身 `HOST_SQL_PROBE` 同面（`PGUSER=meetwise`/`PGPASSWORD` 容器固定值/`PGDATABASE=meetwise`，`:2298-2300` + `:2119` probe 亲读；`meetwise.e2e_run_token` 系 server GUC 标记非连接门，runner 自身 probe 即裸 `SELECT 1`）。
3. **窗口保证**：轮询自端口行起、贯穿整个 run（G7R 在案实测 CMD 时长 34.5-35.6s 量级——round-1 OB-FF-2 注记如实继承：先例文档 38.5s 上界本树未复现；job 秒级抛），在 wrapper `finally` `docker rm -f`（`:2367`）**之前**预期得数十至数百次采样（**该预期以 sidecar 自身健康为前提**，非必然性断言；窗口意外错失走 §1.2-B 兜底）；每次采样将 §1.3 读数快照追加 `.tmp/ff-lasterror-snapshots.log`（时间戳 + **四查询逐条执行状态 ok/error（含报错摘要，C-HA-FF-3）** + 全部 SELECT 行），**容器拆除后最后一份成功快照即证据**。
4. **withhold 契约零触碰论证**：探针只读 DB、从不接触子进程 stderr；wrapper 代码零 diff（`run-e2e-isolated.mjs` 零改动；本树 blob hash-object 亲算 = `13dbfc43` **与 G7R 冻结钉全等**；withhold 冻结函数体 `runFullE2E` 本树实测起 `:2082`、`:2088` `child.stderr.on('data', () => {})`——先例文档 `:2084-2098`/`:2093` 行号注记与本树实测有偏差，**blob 全等即内容零漂移，以 blob+实测为准，偏差如实登记**）；探针输出经「无 Key 值」自查后 name-only 摘录入收据，原文留 `.tmp/` 不入 git。
5. **隐私纪律**：探针 SELECT 列白名单 = `id/kind/status/attempts/last_error/created_at` 等标量（`interview_job` 无 `updated_at` 列——B-FF-1 修复随行：DDL 仅 `created_at`），**Ban SELECT `interview_job.payload`**（answer 明文虽经 `markJobDone`/`markJobFailed` 的 `payload=payload-'answer'` 剥除（`interview-jobs.ts:211/:215` 亲读），仍按最小读面执行）；`ai_invocation_trace.output` 列同样不选。

**兜底机制 B —— keep-container 变体（仅协调方显式批准 · prove 契约偏差）**：若 A 的窗口意外错过（如 wrapper 早于端口行崩溃），可由协调方批准以**同一 docker run 参数**手动起隔离 PG（同 flags 同 GUC）+ 内层 e2e 带 `PGPORT` 直跑，run 后容器保留供回读。**弱点如实登记**：绕过 wrapper 收据面，provenance 弱于 A；单 attempt 记账；Ban 借 B 重跑冲销 A 的红 EXIT。

### 1.3 读取清单（全部 SELECT-only · name-only 收据）

**逐查询执行状态纪律（C-HA-FF-3 · round-1 mw-e2e-ha 处方）**：**查询报错 ≠ 查询成功且零行**——任一查询执行报错（列不存在/连接失败/超时等仪器错误）**不得**记作「无 failed 行可读」，**不得据此触发备选 iso attempt**（备选触发条件唯一性不得被仪器错误污染）；sidecar 快照 log 须对四查询**逐条独立记录执行状态（ok/error + 报错摘要）**；仪器错误如实登记并回协调方（机制 A 窗口健康性复核），Ban 把仪器错误读成空结果。

```sql
-- (1) 甄别主读：失败 job 一步定谳
--     排序键=created_at（B-FF-1 修复：interview_job 无 updated_at 列——DDL 05_interview_jobs.sql
--     `created_at timestamptz NOT NULL DEFAULT now()` / 内嵌 0001_baseline.sql:266 同款；
--     全库唯一 ADD COLUMN updated_at 仅 app_setting@0003，0058:227 updated_at 目标为
--     privacy_erasure_request 非本表，全局 grep 机检排除补列）。
--     语义注记（C-HA-FF-1）：created_at=入队时刻；failed 行系首因写入（本刀观测面为秒抛首败，
--     非多 attempt 续写），其 created_at 即首因失败时刻，「最近失败优先」排序语义与失败时刻排序等价。
SELECT id, kind, status, attempts, last_error, created_at
  FROM interview_job ORDER BY created_at DESC LIMIT 20;
-- (2) attempt 全 outcome 账本分布（含 provider_rejected / deterministic_refusal / unknown）
--     列名=error_code（B-FF-2 修复：DDL 0037_ai_model_invocation_durable_claim.sql:14
--     `error_code text`，无 error 列；后续 ALTER 全局 grep 仅 RLS enable/force 无补列）。
--     值域注记（C-HA-FF-2）：0088:113 约束 `^[A-Za-z0-9._:-]{1,120}$` 可容
--     provider_rejected / deterministic_refusal，值域判读不受列名修复影响。
SELECT service, status, error_code, count(*)
  FROM ai_model_invocation GROUP BY 1,2,3 ORDER BY 4 DESC LIMIT 30;
-- (3) success-only 完成计数（persistTrace 仅 !error 时落，invoke.ts:348-352）
SELECT count(*) FROM ai_invocation_trace;
-- (4) 面试终态分布（旁证：failed 占比与 throw 签名互证）
SELECT status, count(*) FROM interview GROUP BY 1;
```

### 1.4 判读表（`last_error` 值域 → 根因归类 · 逐值域映射）

| `interview_job.last_error` 值域 | 归类 | 码面依据（@`0b18169c` 亲读 · rebase 落 tip 后 rewrite turn 全锚重核全中） |
|---|---|---|
| `interview_resume_reference_missing_or_mismatched` | **H0-alt-5·a resume-reference 结构门** | `interview-consumer.ts:200-206`（`hasCurrentResumeReference`=false → `failClaimedInterviewJob`） |
| `interview_resume_reference_missing` | **H0-alt-5·a′ start locator 门** | `interview-consumer.ts:313-314`（resumeId/epoch 标量校验 throw） |
| `model_invocation_admission_state` | **H0-alt-5·b invoke 准入内部态** | `packages/ai-runtime/src/invoke.ts:494`/`:562` |
| `model_execution_aborted` | **H0-alt-5·b invoke 中止态** | `invoke.ts:524` |
| `model_invocation_dispatch_state` | **H0-alt-5·b invoke 派发内部态** | `invoke.ts:601` |
| `model_cost_unknown_state` | **H0-alt-5·b invoke 成本内部态** | `invoke.ts:662`/`:683` |
| checkpoint/SQL/连接类错误原文（PostgresSaver 写失败、enrollCheckpointThread/`withInterviewGraphFence`/投影 SQL 异常 message、`ECONNREFUSED`、`relation … does not exist` 等） | **H0-alt-5·c checkpoint/fence/投影基建 throw** | `interview-consumer.ts:294-295`（enroll+fence）经 catch-all `:370-381` → `failClaimedInterviewJob` |
| `legacy_interview_graph_disabled` | 配置面（非三红预期候选 · 如实记） | `interview-consumer.ts:176` |
| `reaped:worker_died` | **非 throw 路径**：reaper 收割（卡 running + lease 过期 + attempts 耗尽）→ 与「秒抛」观测矛盾 → 收据须如实记矛盾并改判挂起面（worker 崩溃/租约丢失） | `packages/db/src/interview-jobs.ts:251` |
| 无 failed 行 / last_error 为 NULL | **H0-alt-5 削弱**：未走 `markJobFailed` → 转以读数 (2) 判读：有 `provider_rejected` 行 → 红面在 provider/准入（原 H0 残余值面回升；**401/404 扁平化不可分注记随行**）；有 `deterministic_refusal` → 准入/成本门拒；三面全空 → job 未入队（begin 面即死，非本刀对象）。**「三面全空」仅在四查询逐条执行状态均 ok（C-HA-FF-3）时方可判读；任一查询报错 = 仪器缺陷非空读，如实登记回协调方** | `interview-jobs.ts:214-217` · `invoke.ts:646`（`completeModelInvocation` error 落库）· `packages/db/src/model-invocation.ts:139-155` |
| `last_error` 或 `ai_model_invocation.error_code` 现 embedding-build/embedding-query/rerank 签名（`qbank.embedding-build.v1`/`qbank.embedding-query.v1`/`qbank.rerank.v1` 相关 message/code） | **显式证伪分支（C-MO-P1 · round-1 mw-model-op 处方）：推翻 H0-alt-2 驳回**——registry 该三操作 `wired:false` 零生产调用点系 H0-alt-2 驳回的承重前提，读数现签名即前提被打破；处置=如实记矛盾 + **回协调方**，**Ban 扫入 c 行基建 catch-all、Ban 就地 reinterpret**（与 §5.2「未覆盖值域」兜底不同：此系显式证伪语义，非未覆盖） | `model-operation-registry.ts:148/:153/:158`（embedding-build/embedding-query/rerank `wired:false` 冻结契约）· `invoke.ts:317-319`（`!resolved.ok → return undefined` 降级不抛） |
| `graph_fence_lost` | **不可能出现**于 last_error（该路径走 `requeueInterviewJob` 归还不落 failed）——若出现即收据矛盾，如实记 | `interview-consumer.ts:374-377` |

**交叉互证规则**：(1) 主读与 (2)(3) 必须联合判读——`last_error` 命中结构门但 (2) 有 dispatch 行 = 混合面矛盾，收据如实记「throw 发生在派发之后」；`ai_invocation_trace` 计数 =0 佐证「零成功 provider 完成」（G7R 预期）。**任何单一读数不得单独定谳；定谳段按 G7R C-MO-2 措辞纪律（「与 X 一致」≠「X 已证」）。**

## 2. 边界（Ban 清单）

- **读 DB 不破 stderr withhold**：`run-e2e-isolated.mjs` 全文件零 diff（withhold 冻结函数体 `runFullE2E` 起 `:2082` · `:2088` stderr 丢弃行 · blob `13dbfc43` 与 G7R 冻结钉全等）；**Ban 改 wrapper 输出机制**（Ban 为取明细开假面/回显 stderr/落盘子进程输出）；探针=纯 DB SELECT 旁路，与子进程 stdio 零接触。
- **Ban 为绿改产品**：甄别=只读诊断；无论读数命中的门是什么，修复一律**另刀**（产品刀边界沿 G7R C-MO-11：结构门/内部态/基建各自独立 REQUEST + 双审 + EXEC 授权）；本刀 EXEC 期顺手修 = 违纪。
- **Ban 碰 `:68`/`:70`/`:71` 已清面**：`packages/ai-runtime/src/model-operation-registry.ts` start-job chat 操作注册面（`:68-71` question-generation `wired:true`/admission/fallbackAction 块及相邻 competency-planning `:63-67`）系 G7R post-dual 已裁决 `wired:true` 清面——零触碰、零「加固」、零重接线。
- **Ban SSOT/backlog 翻转**：GAP-G7K-API-REDS P1 OPEN 状态行不翻（`0c6c3287` 登记）；trio OPEN 保持；covered 矩阵零触碰（nail 阶段才改）。
- **Ban 洗绿 / retry-to-green / flake 记法**：甄别 run 红 EXIT 不冲销、不重跑冲销、Ban 只留绿 attempt；备选 run 仅限「首选未捕获 failed 行」一种触发，且须在收据如实登记触发原因。
- **Ban Key 物料**：本刀读数全部零 Key 依赖（DB 直读用容器固定测试凭据，非模型 Key）；模型 Key 若 EXEC 期在环境（G7R loader）name-only 探针即可，Ban 值/fingerprint 入树入据；Ban 写任何 `.env*`。
- **Ban self-approve / alone ≠ dual**：pre-dual = mw-e2e-ha + mw-model-op 两方独立签署；本 REQUEST 即被审对象。

## 3. prove 方案（EXEC 期 · 授权后方可行）

1. **前置**：RE-PRE 双审 BOTH PASS（round-1 双审 1 PASS + 1 FAIL 已按处方 rewrite）→ **协调方 EXEC 显式授权**（甄别 run 面裁定：首选 ui-isolated / 是否预备备选 iso / 机制 B 是否预批 · committed SHA 重钉含重新 fetch）。
2. **环境**：fetch 重钉后独立 worktree（本刀 worktree `/Users/miaole/Desktop/golucky/meetwise-line-ff` · branch `line/ff-last-error`）→ `pnpm install --frozen-lockfile`（EXIT 记录）。
3. **甄别 run 契约（CMD+EXIT）**：`pnpm e2e:ui:isolated` × 恰一次，sidecar 探针随 run 启停（§1.2-A）。**甄别目的是取 `last_error`，非翻绿**——EXIT 如实：预期 EXIT=1（三红 retained），红 EXIT ≠ 甄别失败；**甄别成功的判据 = 快照捕获 §1.3 读数**（捕获成功 ≠ e2e pass ≠ trio 翻绿）。子进程内部既有重试按自身契约算一次 attempt。
4. **七字段逐 attempt 全记录**：CMD 原文 + EXIT 原值 + 起止时间戳 + 实跑 code SHA（receipt commit ≠ 实跑 SHA）+ worktree/branch + 环境探针（docker/pnpm/node + `.env*` ABSENT presence + `MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` name-only set 探针 + sidecar 探针端口行命中时刻/采样次数）+ 读数快照结果（§1.3 四查询的 name-only 摘要 + **逐查询执行状态 ok/error（C-HA-FF-3）** + 判读表归类 + **embedding/rerank 签名显式负检查（C-MO-P1：四查询读数逐条核对无 `qbank.embedding-*`/`qbank.rerank` 签名，有则按 §1.4 证伪分支处置）**）。`EXIT`/`E2E_FAILURE_CLASS`/machine receipt（`.tmp/e2e-receipts/*.json`）/快照 log 四来源交叉一致才可引用。
5. **attempt 纪律**：首选 run ×1；仅当**「查询成功且确实无 failed 行可读」**（四查询逐条执行状态 ok 且零 failed 行——**查询报错/仪器故障不算空读、不触发备选**，C-HA-FF-3）才启备选 iso run ×1（第二次 attempt）；两次均不绿不重跑；机制 B 仅协调方显式批准时启用并独立记账。**全部 attempt 全记录，Ban 删除/覆盖任何 attempt 记录。**
6. **预算与 live 面**：沿 G7R 授权口径**上限 ≤200 次 live 调用内报备**。诚实结构估：若 H0-alt-5（pre-model throw）成立，run 大概率**零 live 调用**（G7R EXEC 实测面 <50 佐证失败未达 provider）；若读数反证红面在 provider/准入，则 live 面与 G7R CMD 同量级。**超限即停如实记中止（不洗 not_run）；`actualSpendCny=null`**（无协调方计价依据 Ban invented spend）。voice/OCR/ASR/TTS 无 DASHSCOPE key → honest capability skip = 0 调用。
7. **收据落点**：`ai-docs/delivery/receipts/g7r-ff-last-error-discriminator/`——per-run 收据 + `SUMMARY.md`（§1.3 读数 + §1.4 判读归类 + **根因定谳段**（H0-alt-5 子面 a/a′/b/c 之一，或如实记「判读表未覆盖/矛盾」）+ Pins/Retained 原值 + `g7SuiteGreen=false` 保持声明 + evidenceOfRecord/SSOT 登记**留 nail 阶段**）。G7R 收据（`receipts/gap-g7k-api-reds-fix/`）零改写。
8. **EXIT 后路由**：读数定谳 H0-alt-5 子面 → 修复走对应产品刀（另 REQUEST）；读数反证 provider/准入面 → 回协调方（值迭代须新 EXEC，沿 C-MO-7 纪律）；trio OPEN / GAP P1 OPEN 保持至修复落地 + 三绿 + post-dual + nail 全链。

## 4. Pins（原值）+ Retained

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

**Retained**: `g7SuiteGreen=false`（翻转 = 三绿 + post-dual BOTH + 协调方 nail）· `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · Disclosure-1 OPEN · trio OPEN（EXIT 1/1/1 真实业务红）· GAP-G7K-API-REDS P1 OPEN（`0c6c3287`）· `actualSpendCny=null`

## 5. 诚实条款（硬钉）

1. EXIT 全部如实；**EXIT=0 ≠ covered ≠ suite green ≠ HA ≠ SLO/LOAD ≠ 0 BUG ≠ fixed ≠ R1 closed ≠ G6 closed**；not_run ≠ pass；skip ≠ pass；**甄别读数 ≠ 修复 ≠ 定谳本身之外任何翻转**。
2. 判读表是**判读表**：值域映射系码面亲读的机械归类，非根因断言；收据定谳段按证据强度措辞；「判读表未覆盖值域」是合法收据结论（如实记原值 + 三面交叉读数）。**例外（C-MO-P1）**：embedding-build/embedding-query/rerank 签名不属「未覆盖值域」兜底——系 §1.4 显式证伪分支，命中即按「推翻 H0-alt-2 驳回」处置并回协调方，Ban 扫入基建 catch-all、Ban 就地 reinterpret。
3. H0-alt-1 出局与 H0 值面出局系**协调方直探输入事实**，本 turn 未独立复证；若 EXEC 期读数与之矛盾（如 `provider_rejected` 行重现），矛盾如实登记并回协调方，Ban 掩盖。
4. 本 commit（REQUEST）不预claim 任何 post-commit EXIT；收据在授权实跑后由被授权执行另行落盘，本文档零预填。
5. ERRATUM 措辞冻结沿用：FreeTierOnly 观察=`3424dc1` · 消除轮=`82981ff` · Ban shorthand `quota-403=82981ff`。

## 6. Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not fixed · not root-cause-proven（H0-alt-5 仍为最强候选非定谳）· not suite green · not trio green · not family green · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not SLO/LOAD · not covered · not `releaseEvidence=true` · not nail · not SSOT flip（GAP P1 OPEN 不翻）· not new evidence（本 turn 只读）· not live（本 turn）· not coordinator authorize（待 pre-dual + EXEC）· Key set ≠ auto green · DB 读数 ≠ 产品修复 · `g7SuiteGreen=false` · `r1Closed=false` · trio OPEN · `actualSpendCny=null` · alone ≠ dual

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · Disclosure-1 OPEN · trio OPEN · GAP-G7K-API-REDS P1 OPEN · `actualSpendCny=null` · STOP（awaiting pre-dual mw-e2e-ha + mw-model-op + 协调方 EXEC 授权）

---

*Harness · F-F interview_job last_error 甄别刀 · Line F-F · 2026-10-08（round-1 2026-10-07）· draft:awaiting_re_pre_exec_dual（rewrite 轮：round-1 双审 mw-model-op PASS/mw-e2e-ha FAIL 后恰限处方面改写 · 两审段随卷 append-only）· docs REQUEST only · 甄别器=interview_job.last_error（markJobFailed :214 ≤500 字符持久化）· 重跑面首选 uc018-abandon UI / 备选 iso（触发=查询成功且确实零 failed 行 · 查询报错≠空读 C-HA-FF-3）· 读取窗口=run 内 sidecar 直读隔离 PG（容器拆除前 · 零 wrapper diff）/ keep-container 仅协调方预批兜底 · 读数=interview_job kind/status/last_error/created_at（B-FF-1：无 updated_at · created_at=入队时刻排序语义等价 C-HA-FF-1）+ ai_model_invocation (service,status,error_code) 分布（B-FF-2 @0037:14 · 值域 0088:113 可容 C-HA-FF-2）+ ai_invocation_trace 计数 · 逐查询执行状态 ok/error 随快照（C-HA-FF-3）· 判读表逐值域映射（结构门/invoke 内部态/基建/配置/reaper/NULL + **embedding 证伪分支 C-MO-P1**）· 红①排除=**start job 未入队**（壳行存在、四道 409 门先于 :337 入队 · C-MO-P2 措辞）· H0-alt-1 出局（协调方 Key 直探 200+401 输入事实）· H0-alt-2 已驳回（可证伪：embedding/rerank 签名即推翻，回协调方）· base 重钉 `0b18169c`（rebase drop 孪生 `1dd1e630` · 全锚 tip 重核）· Ban 改 withhold/为绿改产品/碰 :68-71 已清面/retry-to-green · 预算 ≤200 内报备 · actualSpendCny=null · STOP*

# G7FIX-4 EXEC 收据 — 产品面 finalize 契约增补刀（generation 族对称标记+mark-then-recover）

- 席位：mw-core（EXEC）· 协调方授权 EXEC · 蓝本 = REQUEST rev3 @ea3e38a7（ai-docs/delivery/harness/g7fix4-contract.md，唯一蓝本）
- base = 主线 c17804a5 · 分支 `line/g7fix4-contract` · worktree /Users/miaole/Desktop/golucky/meetwise-line-g7fix4
- 作者：`git -c user.name=mw-core -c user.email=mw-core@meetwise.local`
- 终态：**STOP @ exec:awaiting_post_prove_dual · Ban self-approve**（本收据不得作为本刀 PASS 判据）

## 1. diff 面（产品码恰两文件·零 e2e 改·零 migrations·零 SSOT·零 G7 判定面）

| 文件 | 性质 | 变更 |
|---|---|---|
| `apps/worker/src/adaptive-lifecycle.ts` | 产品码 | `writeGenerationUnavailable`：`failInterviewAndRelease` 之后同事务同 client 增 `markApplicationAssessmentUnavailable`；事件分流对齐 consumer.ts:91-95（updated/replayed→`assessment_unavailable` 事件·unbound→`interview_unavailable`（键 `interview_unavailable:terminal` 字节零改）·stale 不补事件=consumer.ts:90 同形） |
| `packages/db/src/recruiter.ts` | 产品码 | `startApplicationInterview` :385 面 mark-then-recover 单触点：reused 面字节零改；reused 不中→三闸（resume 恒等镜像 `resumeId===row.resume_id` + FOR UPDATE 行锁下四元绑定 `status='failed'` 验证 + mark 恒等 `updated`）→同事务先 mark→落回既有 :393-434 恢复通路原样行进；任一闸不中→`binding_invalid` fail-closed（错误语义零变） |

prove 面（测试/注册，非产品码）：`apps/worker/test/adaptive-lifecycle.proof.ts`（G7FIX-4 段 +13 断言）、`apps/api/test/g7fix4-finalize-contract.proof.ts`（新·7 断言）、`scripts/run-e2e-isolated.mjs`（新 key 四点注册：key allowlist/migrate allowlist/receipt sources/命令回退面）、根 `package.json`（+2 script 行）。全量逐字节见 fixture.diff。

## 2. prove 全键终态（api/worker 触面·全绿或 base≡red）

| 键 | base | 终态（含本刀改动） | 判定 |
|---|---|---|---|
| `adaptive-life:prove`（worker·真图+真隔离 PG） | 绿 exit=0 | 绿 exit=0·G7FIX-4 段 **13/13 PASS** | 全绿 |
| `g7fix4:finalize:prove`（api·新 key·真 ApplicationsService） | —（新） | 绿 exit=0·**7/7 PASS** | 全绿 |
| `neg:bend`（api 回归） | 绿 120/120 | 绿 120/120 | 全绿·零回归 |
| `recruiter:prove`（db） | **红**：setup recruiter-depth.proof.ts:42 `interview_event_raw_answer_fenced`（P0001·先于一切断言·历史性红，该 proof 早于 0104 路由闸/interview_event 围栏时代未跟进） | **红·同一闸同一行**（:42，改后复跑坐实位移为零） | **base≡red**（REQUEST §2 豁免面；恢复/重试/finalize-DB 断言已由 adaptive-life G7FIX-4 段全量承载，非红面裸奔） |

G7FIX-4 段 13 断言（adaptive-life，全 PASS）：rule-classify 前置 · attempt=1 绑定 · bound 面 generation 失败零 question_ready · **对称标记（application=assessment_unavailable·score=NULL·interview=failed·预留 released）** · **终态事件恰一且键=`assessment_unavailable:generation_*`·零 interview_unavailable** · finalize DB 面 assessment_unavailable · finalize ≠replayed（:204 replayed 面为 completed 专有） · assessment_unavailable 重试恢复形 attempt=2 · 卡死态复现（in_progress+failed） · 卡死态 finalize=not_ready（409 死路面） · 异 resume→binding_invalid 零 mark（恒等镜像闸） · **mark-then-recover 同 resume→started 新 attempt=3·旧 interview 保 failed·score=NULL** · attempts 全账（1 failed/2 failed/3 created）。

finalize 服务面 7 断言（g7fix4:finalize:prove，全 PASS）：**200 形（零 HttpException）+ outcome='assessment_unavailable' + replayed:false**（recruiter.ts:205 · applications.service.ts:82-88）· 幂等重放同形 · 卡死态复现 · 卡死态 finalize→409 cannot_finalize（fail-closed 不变） · mark-then-recover→started · 恢复后 finalize→409（created/in_progress 不谎报 200）。

est live = **0**（≤25 ✓：classify 全走 rule 路径 modelClassify 恒 throw·模型全 scriptedModelClient·零 MODEL 供应商调用）。Key name-only（RAG_JOB_ROUTE_INPUT_HASH_KEY 测试键·零真实 Key·零 .env 触碰）。

## 3. attempts 台账（prove 跑次全账·恰 1 次终绿逐修零 retry 原则）

| # | 时刻(UTC) | 键 | 树状态 | 终态 | 说明 |
|---|---|---|---|---|---|
| 1 | 07:33-07:44 | adaptive-life / neg:bend / recruiter（base 三键） | **base（stash 下）** | 绿/绿/红 | recruiter 红于 setup:42 围栏=base≡red 基线 |
| 2 | 07:52 | adaptive-life:prove | 改动+新段 | **绿 exit=0** | 13/13 新断言首跑即绿 |
| 3 | 07:53 | neg:bend | 改动 | **绿 120/120** | 回归零变 |
| 4 | 07:56 | g7fix4:finalize:prove | 改动 | 红 `seed_start_not_started:resume_not_ready` | 夹具疏漏①：seed 漏插 resume 行 → 补 INSERT resume |
| 5 | 07:57 | g7fix4:finalize:prove | 改动 | 红 `insufficient_entitlement` | 夹具疏漏②：漏 entitlement_bucket → 补 INSERT bucket |
| 6 | 07:57 | g7fix4:finalize:prove | 改动 | **绿 exit=0** | 7/7 PASS（逐修两夹具·断言面零弱化） |
| 7 | 07:59 | recruiter:prove | 改动 | 红（setup:42 同闸） | base≡red 双向坐实（改后复跑·位移为零） |

## 4. 双席 EXEC 附注（落字）

**席1 附注（event key 先例）**：分流先例=interview-consumer.ts `terminalizeUnsettledInterview`：:90 `stale` 提前返回不补任何事件（本刀 lifecycle 侧同形——stale worker 绝不给已推进的下一 attempt 追加旧终态）；:91-95 `updated/replayed→assessment_unavailable` · else（unbound）→`interview_unavailable`。事件键先例=:92 `assessment_unavailable:${reason}`；generation 族 reason 恒 `generation_*` 前缀（adaptive-lifecycle.ts `generationFailureOf` 两分支保证），与既有固定键 `assessment_unavailable:no_eligible_scored_answer` / `assessment_unavailable:evaluation_unscored` 零碰撞（无 generation 前缀撞键面）。消费面复核：interview.controller.ts:261 SSE 终态谓词同时收 `assessment_unavailable` 与 `interview_unavailable`（两 kind 同终态，分流零破坏）；web/lib/recruiter/surface.ts:13/23 `assessment_unavailable` 有既有展示位。unbound 臂事件键保持 `interview_unavailable:terminal` 字节零改（错误语义零变）。

**席2 附注（0144 行码引用校对** · 以工作树 0144_db_trigfam_unify.sql 实测行码为准）：
- 状态机规则表：`('in_progress','assessment_unavailable')` = **0144:58**（REQUEST §1.2 引 "0144:57" → 校对 +1，:57 为 invited→declined）；`('assessment_unavailable','in_progress')` 恢复规则 = **0144:59**。
- binding_immutable 恢复例外 = **0144:99-100**（REQUEST rev3 §1.2d 写 97-98 → 校对 +2；:98 为 IF 边界）。
- attempt+1 恢复形 = **0144:119-121**（REQUEST 写 114-117 → 校对；114-117 是 invited 首启臂）。
- `job_application_recovery_requires_next_bound_attempt` 守卫 = **0144:129-134**（REQUEST 写 146-152 → 错位勘正）。
- `job_application_start_requires_bound_interview`（新 interview status='created' 命中面）= **0144:138-146**（REQUEST 写 157-167 → 错位勘正）。
- assessment_unavailable 落标守卫（bound interview `IN ('failed','completed')` + score NULL）= **0144:154-166**（任务书引 ":155-167" → 校对 -1）。
- 结论：mark（in_progress→assessment_unavailable）与恢复 UPDATE（assessment_unavailable→in_progress·新绑定·attempt+1）在 0144 终端体全链合法，零 migration 为真；rev2 双触点 ：431 加宽作废正确（DB 层触发器先拦）。

## 5. pins 十一值照抄 + 脚注

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 **actualSpendCny=null**。

## 6. Non-claims 与后验键归属

- 本刀 ≠ duplicate re-roll 根因刀（另立）≠ G7 收官 ≠ trio（trio 再跑另立）。
- **「driver 臂回改后 e2e:isolated 恰 1 run 绿」= 协调方后验键（本刀外·零 e2e 改）**；臂回改形状=200+outcome='assessment_unavailable'+cand assessment_unavailable/score NULL+retry started 新 id（非 completed+整数分）。
- recruiter-depth.proof.ts 的历史性红（setup:42 围栏+缺 0104 链）不在本刀修复范围（其载体职能已由 adaptive-life G7FIX-4 段接替）；如需复活另立刀。
- 本地 prove 绿 ≠ RAG 迁移 ≠ HA ≠ releaseEvidence（[R5-MARKED-RED] 原文见各 log）。

## 7. 收据清单

`exec-receipt.md`（本件）· `fixture.diff`（全量 diff）· `base-adaptive-life.log` / `base-neg-bend.log` / `base-recruiter.log`（base 基线三键）· `final-adaptive-life.log`（13/13）· `final-g7fix4-finalize.log`（红·夹具①）/ `final2-g7fix4-finalize.log`（红·夹具②）/ `final3-g7fix4-finalize.log`（绿 7/7）· `final-neg-bend.log`（120/120）· `final-recruiter.log`（base≡red 复跑）· `2026-10-09T07-44-30-*.json`（recruiter base 红隔离收据）· `2026-10-09T07-56-52/07-57-27/07-57-50-*.json`（finalize 三跑隔离收据 红/红/绿）· `2026-10-09T07-59-17-*.json`（recruiter 改后复跑红同闸）。

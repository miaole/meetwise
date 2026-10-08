# Harness — **Line P0-CB-01 · GAP-PROD-02 首面：申请↔面试不可替代绑定（REQUEST · coding+prove 立卷 · 本卷零执行）**

> **Draft-era status**: **`draft:awaiting_pre_exec_dual`**（empty review stubs · Ban self-approve · alone ≠ dual · 本卷零 coding · 零 prove 执行 · 零 live · 零 SSOT · 预执行双审 PASS 后由 meetwise 授权方可进入 coding+prove）
**Pins（原值全抄 · retained 写死）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503** · `g7SuiteGreen=false` · `actualSpendCny=null`
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）
**Base**: `origin/feat/mysql-schema-skeleton` · **`fe218b7a`** / `fe218b7aecaebda92f3f1ede7dd3b77eb6059cd9`（fetch 后 origin tip · G7V nail）
**Branch**: `line/p0cb01-application-binding`（worktree `meetwise-line-p0cb01`）
**Wave**: Line **P0-CB-01**——backlog `GAP-PROD-02`（`ai-docs/delivery/gap-bug-backlog.md:78` · **OPEN**）首面；内序 **P0-CB-01→02→03** 写死（audit §6 原文 + SCOR 卷 §2c 顺序合同继承）。**一刀一行：本刀只做 P0-CB-01；CB-02（目的限定同意/撤回）与 CB-03（三主体浏览器矩阵进 CI）归后续各自 REQUEST，Ban 顺手做。**
**Experts**: `mw-e2e-ha` + `mw-privacy-int`（SCOR 卷 §1b 域选审继承：GAP-PROD-02 归属域 product/e2e——绑定验收面与浏览器链裁决权在 mw-e2e-ha；「不可替代」snapshot/consent 语义面与 DELETE=503 冻结裁决权在 mw-privacy-int；**非默认审、不降级、不换默认**）
**前置依赖（顺序合同 · 写死）**: 「SCOR then P0-CB」（SCOR 卷 `harness/gap-scor-p0cb-inventory.md` §2c/§3 queue `:43-44` 口径）——本刀 coding+prove 的执行授权**额外**以「S-SCOR-0…4 包启动门已过」为前置；协调方授权时须核验该门，未过门则授权不发或范围按 D1 逃生门先例以未来 REQUEST 重立。本 REQUEST 立卷本身不受该门约束（docs-only）。

## 0. 流程声明（本刀全程 · 七步）

**REQUEST（本卷 · docs-only）→ 预执行双审（mw-e2e-ha + mw-privacy-int · empty stubs）→ meetwise 授权 → coding+prove（一次优先 · attempts 全录）→ post-prove 双审（同席）→ meetwise 授权 nail。**

本卷 = 第 1 步。零执行：零产品码、零 migrations、零 scripts/`package.json`、零 prove 运行、零容器、零远程环境、零 secrets 读取。

## 1. 缺陷面（现状码面锚 @`fe218b7a` 全部亲算 · blob 亲算非转述）

### 1.0 缺陷一句话

**「不可替代绑定」的基底（DB 约束 + 绑定路径 + 反查收口）在 tip 实存，其审计级语义（immutable `CandidateEvaluationSnapshot` + `consent_version` 事务绑定）产品码 0 hit。并发 20 绑定与换绑拒已由 prove 底座 named 覆盖（`recruiter-depth.proof.ts` §①② + `neg-bend.proof.ts` HTTP 面——锚见 §1.2 G-3），audit 验收表（`product-readiness-c-b-audit.md:112-115`）作为验收面仍无 named prove 收据，真残差=①reserve 计数断言面（恰 1 次 reserve）②HTTP 层跨岗位完成会话重放 named 收据③快照幂等（结构性依赖 G-1，成立）④浏览器刷新/双击/断网分支（成立）——「跨申请重放/换绑 fail-closed」在 DB/HTTP 底座有实现有断言，「完成事件恰一次写不可变快照」与「浏览器全链路覆盖」仍是实现/覆盖缺口。缺口重心=验收证据面（SCOR §9 D1 裁决继承 · erratum E-1…E-4 口径继承），本刀即该面的实现 REQUEST。

### 1.1 基底实存面（亲算锚 · 本刀 Ban 动摇其约束语义）

| 锚 | 文件:行 | blob（`git ls-files -s` @`fe218b7a`） |
|----|---------|------|
| 双 partial UNIQUE（application↔interview 一对一 · interview↔application 反向一对一） | `packages/db/migrations/0028_application_bound_interview.sql:11-14` | `ef940e2630a556436fe499ff78fe52d678a0fad8` |
| CHECK 三态完整绑定 + 三 FK + `fk_job_application_resume_binding` | 同上 `:17-36` | 同上 |
| 完成自动收口 trigger（同事务回填 `job_application`，五元映射逐项复核） | 同上 `:42-75`（fn `:42-70` · trg `:73-75`） | 同上 |
| 绑定不可变 trigger（INSERT 后 application_id/job_id/resume_id 不可改） | 同上 `:78-92` | 同上 |
| application 侧绑定/状态机/分数铁面 trigger（换绑拒 `job_application_interview_binding_immutable` · 伪造绑定拒 `_invalid` · 分数未收口不可变） | 同上 `:95-142` | 同上 |
| `startApplicationInterview`：行锁同事务「看绑定→建/复用 interview→CAS 回写」，attempt 单调递增，未决路由 fail-closed `interview_ineligible_route`（不创建 interview） | `packages/db/src/recruiter.ts:354-434`（`FOR UPDATE` `:357-358` · 拒启 `:410` · INSERT `:414-421` · attempt `:413`） | `d06b4f4933414853b3ff574c2f6dad2292824d92` |
| `finalizeApplication`：不接受客户端 interviewId，五向 JOIN 反查 `application↔interview↔job↔resume↔owner`，不一致/未完成 → `not_ready`；hold 下收口恒 `score=NULL, status='assessment_unavailable'` | 同上 `:182-215`（反查 `:184-194` · scoreless 收口 `:203-206`） | 同上 |
| HTTP start / finalize（strict DTO） | `apps/api/src/modules/jobs/applications.controller.ts:22-24/:33-38` · `apps/api/src/modules/jobs/applications.service.ts:35-63/:66-83`（`:71` `not_ready`→409 `cannot_finalize`） | `d0b779952514c36417b98242ca1412c78be4685c` / `9a17cfe4546aec7542ebe49a43d3b18978ea422a` |
| `FinalizeApplicationDto = z.object({}).strict()`（客户端 interviewId/score 一律 DTO 拒）· `StartApplicationDto` 仅 `resumeId` | `packages/contracts/src/index.ts:327/:339`（注释 `:335-338`） | `d44768f91ce3f011447ee251d8213661a61457dc` |
| web 终态自动 finalize 消费者 + 同源代理（浏览器只给 applicationId） | `apps/web/components/InterviewPanel.tsx:88/:99-114`（fetch `:103`）· `apps/web/app/api/applications/[id]/finalize/route.ts:6-18` | `ec9b3fe168e4e9c98a782f0f78ef5f89e4d1ba85` / `c558e82e169a8465289bcb4d977a82343140ec72` |
| B 端数值暂停（calibration hold · score=NULL 恒定投影） | `packages/db/migrations/0082_b_side_score_calibration_hold.sql` | `2b4d4f66dd6d53d278655ff7e7f6be5694881f39` |

### 1.2 缺口面（本刀要闭合的 · 亲算 0 hit / 0 收据）

| # | 缺口 | 亲算证据 @`fe218b7a` |
|---|------|----------------------|
| G-1 | **immutable `CandidateEvaluationSnapshot` 不存在**——audit `:97-107` 要求完成事件写不可变快照（score、rubric/model/prompt/qbank 版本、evidence hash），B 端只读该快照；tip 完成链只回填 `job_application.score/status` 两列，无版本化/evidence-hash 化的独立不可变证据关系 | `git grep -icE 'candidate_evaluation\|evaluation_snapshot\|application_snapshot' -- ':!ai-docs'` = **0 hit**（rc=1 亲测） |
| G-2 | **`consent_version` 事务绑定面 0 hit**——audit `:97-99` 要求创建事务绑定 `consent_version`；tip 绑定四元组为 application/job/resume/owner，无 consent 维度（该面语义终裁按 SCOR C-EH-3 冻结归本刀执行阶段）；**C-EH-3 执行期终裁必答四问（本卷不裁）**：①体系关系——`consent_version` 挂既有同意体系哪一套：baseline 不可撤回 `consent_record`（`packages/db/sql/13_privacy.sql:5-16` · INSERT-only）vs 可撤回 `memory_consent`（`packages/db/migrations/0093_memory_governance.sql:102-121` · revision+privacy_epoch fence）vs 独立第三套 application 域体系 ②版本指向（policy_version/consent_revision 语义对齐哪套、由谁递增）③旧行缺省值（存量 application 无 consent_version 时缺省何值、fail-closed 还是有界放行）④迁移语义（additive 回填 vs NULL 拒绑定的边界与回滚面） | `git grep -icE 'consent_version\|consentVersion' -- ':!ai-docs'` = **0 hit**（rc=1 亲测） |
| G-3 | **验收表 `:112` 并发项残差**——并发 20 绑定与换绑拒**已由底座 named 覆盖**；真残差=①reserve 计数断言面（恰 1 次 reserve）②HTTP 层跨岗位完成会话重放 named 收据③快照幂等（结构性依赖 G-1，成立）④浏览器刷新/双击/断网分支（成立） | `recruiter-depth.proof.ts`（blob `8579cc70a3000fe52fb36d230a50495f70fd11ed`）§① `:60-71`：20 路并发 startApplicationInterview→同一 interviewId（`:67`）+ 四元绑定完整（`:69`）+ 每 application 恰一 interview（`:70`）；§② `:73-80`：换绑 DB 拒（`:75`/`:78`）+ 本人历史会话不能 finalize（`:79-80`）· `neg-bend.proof.ts`（blob `6b38d536fb4381f5536722b8012f38c0f2c30ce8` · `apps/api/test/`）HTTP 层：strict DTO 400（`:270-271`）/finalize 空对象 409（`:269`）/跨用户 finalize 409+score NULL（`:251-252`）——reserve 计数断言与 HTTP 层跨岗位完成会话重放收据无；浏览器分支缺（=G-6） |
| G-4 | **验收表 `:113` 错配 409 残差**——错配拒绝面已由底座覆盖（strict DTO 400 / finalize 空对象 409 / 跨用户 finalize 409+score NULL / DB 换绑拒，锚同 G-3）；真残差=「本人**已完成**会话对跨岗位申请收口」的 HTTP 层 named 收据（底座断言覆盖未完成态与跨用户态，未覆盖完成会话跨岗位重放态=残差②） | 同 G-3 证据锚（`neg-bend.proof.ts:269-271`/`:251-252` 在树亲读）——完成会话跨岗位重放态无 named 收据 |
| G-5 | **验收表 `:114` 重放恰一次残差**——CandidateEvaluationSnapshot 幂等重放收据**结构性依赖 G-1**（快照关系不存在，不可证——成立=残差③）；完成重放幂等底座仅断言 scoreless 收口重放（`recruiter-depth.proof.ts` §③ `:84-85`），snapshot/消费确认逐项恰 1 断言无 | 同 G-1 + `0028:42-75` trigger 仅回填两列 |
| G-6 | **验收表 `:115` 浏览器全链路覆盖不足（=残差④，成立）**——要求覆盖**刷新、双击、断网后恢复**及 B 端最小化展示；`recruiting-bound.spec.ts`（blob `2b232748a034f39e634c911cce962dcb5dbb61b8` · `:142-255`）有单链路 C→B + B 端 reload 最小化断言（`:244-255`），**无 C 端刷新/双击/断网恢复分支** | spec 全文亲读 @`fe218b7a` |
| G-7 | **practice 面域与 application 域的隔离——拒绝面已 named 覆盖，重放态残差同②**——practice 入口 `apps/web/app/interviews/actions.ts:9-21`（仅 resumeId · blob `bbc8bde144cedba8412af379787da4f03a037260`）+ `POST /interview` 空壳创建 `apps/api/src/modules/interview/interview.controller.ts:156-160`（service `create` `:589`）合法存在；practice（历史普通）会话的换绑拒/移花接木拒已由底座 named（G-3 §② 锚）+ HTTP strict DTO（G-3 neg-bend 锚）覆盖；真残差=完成态 practice 会话跨岗位 HTTP 重放收据（=残差②） | E-2 口径（erratum 继承）+ G-3/G-4 锚 |

**缺陷面结论**：现状不是 audit 2026-08-02 审查时的「无绑定」（erratum 已更正该 4 条为 stale），而是**「绑定基底实存、验收证据面有真残差」**——并发 20 绑定与换绑拒已在 DB/HTTP 底座 named 断言（§1.2 G-3 锚），真残差=①reserve 计数断言②HTTP 层跨岗位完成会话重放收据③快照幂等（结构性依赖 G-1）④浏览器刷新/双击/断网分支；完成收口没有不可变快照证据层。`GAP-PROD-02` `:78` 因此 **stays OPEN**，翻转权归协调方 nail，本刀在任何结果下都不翻行。

### 1.3 期望语义（audit `:97-107` 验收原文语义 · 本刀目标态）

```text
JobApplication + ApplicationSnapshot + CandidateEvaluationSession
  创建事务中绑定 job_id、candidate、resume_snapshot_version、competency_snapshot、consent_version。

start(applicationId, idempotencyKey)
  → 唯一创建/复用 application-scoped interviewId → 返回 interviewId → 浏览器跳转 /interview/:interviewId

完成事件
  → 仅由该 application-scoped interviewId 触发服务端 finalize
  → 写 immutable CandidateEvaluationSnapshot（score、rubric/model/prompt/qbank 版本、evidence hash）
  → B 端只读该 snapshot。
```

fail-closed 形态（目标态逐条）：跨申请重放（拿 A 岗完成会话对 B 岗收口）→ 拒 · 换绑（改任何一侧绑定指针）→ 拒 · 无申请上下文的会话进入 application 收口域 → 拒 · 快照缺失/不一致 → B 端只获最小投影（评分暂不可用），永不出现数值分 · 全部拒绝路径可观测（错误码 + attempt 账面）。

## 2. 设计候选（≥2 对比 · 推荐 A 交双审）

| 维度 | **方案 A（推荐）· additive 快照关系 + 复用 `0028` 绑定基底** | 方案 B · 快照 embed 进 `job_application`（JSONB 列） | 方案 C · 中间表 `application_interview_binding` 重构绑定面 |
|------|----------------------------------------------|----------------------------------------------|----------------------------------------------|
| 形态 | 新 additive migration 建 `candidate_evaluation_snapshot`（application_id 唯一 FK + interview_id FK + score/rubric/model/prompt/qbank 版本列 + evidence_hash + created_at），INSERT-only trigger 封死 UPDATE/DELETE；**RLS 写死**：带 `owner_user_id`（随 `0028` 体系：`interview.owner_user_id=candidate_user_id`，`0028:103/:117`）+ `ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY` + owner policy（`current_setting('app.principal_user')` 口径）+ `REVOKE ALL ON candidate_evaluation_snapshot FROM PUBLIC, app_role` + GRANT 收窄（仅授权面 INSERT/SELECT）；完成链（DB trigger 同事务）恰一次写入（幂等重放：conflict-then-read-back 返回同一行）；`consent_version` 列 additive 挂绑定面（语义终裁随执行落卷 · 关系四问见 G-2）；prove 层新增验收表四项 named proves | `job_application` 加 `evaluation_snapshot jsonb + evaluation_snapshot_hash` 列，由完成 trigger 写入同表 | 新建独立绑定关系表，interview/job_application 上的绑定列与 `0028`/`0046` trigger 全部迁移重写 |
| 对现有链破坏面 | **零改写**：`0028`/`0046`/`0082` 约束与 trigger 语义原样；`startApplicationInterview`/`finalizeApplication` 现有行为原样（finalize 仍 scoreless hold 收口）；只增不改 | 中：`job_application` 已挂两层重 BEFORE trigger（`0028:95-142`/`0046`），同表再藏可变 JSONB 需追加列级防篡改 trigger，行级 immutability 只靠约定；其他写路径（status CAS/attempt）与快照列共行，误覆盖面变大 | **最大**：重写全部绑定面（migrations×2 + recruiter.ts 全部查询 + finalize 反查 + e2e spec），直接抵触 SCOR S-CB-1 触碰面 Ban「Ban 动摇 `0028` 既有约束语义」 |
| 迁移面 | 恰 1 个 additive migration（CREATE TABLE + trigger + 既有行零回填；旧申请无快照保持 fail-closed 最小投影） | additive 列但落在热表上；旧行 NULL 语义与 hash 基线含混 | 全量重迁移 + 数据搬迁，回归面不可控 |
| 不可替代性强度 | **最强**：独立 INSERT-only 关系 + evidence hash，不可变是结构性质非约定性质；B 端只读投影有唯一权威源 | 弱：hash 覆盖的对象本身住在可变行里，「不可替代」降级为 trigger 约定 | 与 A 等价但推倒重来，纯成本 |
| fail-closed 形态 | 快照缺失/不一致 → B 端最小投影；重放 conflict-read-back 恰 1 行；绑定拒绝面原样继承 `0028` 三 trigger + 反查 | 同左但快照一致性须额外自证 | 同左但全部拒绝面须从零重证 |
| 验收表映射 | `:112`（并发 20 → 残差①prove）/`:113`（409 → 残差②prove）/`:114`（重放恰 1 → snapshot 表幂等直证，依赖 G-1）/`:115`（spec 扩分支=残差④）逐项可 named | `:114` snapshot 项证明绕行（同表行级），收据弱 | 逐项可 named 但代价是全链重证 |
| 审查关注点 | INSERT-only 封口是否彻底（app_role 全路径）· consent_version 语义终裁落卷 · hold 期间 B 端投影仍 scoreless | 行级防篡改完备性 · hash 基线 | ——（不建议进入执行） |

> **擦除面登记（additive · 转裁决 · 本刀不裁）**：`candidate_evaluation_snapshot` 为**擦除面新 sink 候选**——INSERT-only 与 subject-erase 互斥，未裁是否入擦除范围；如入，机制对齐 `0125_memory_vector_chunk_erasure.sql`/`0141_vector_plane_erasure_receipt_fence.sql` purge-transaction fence 先例 → 转协调方/`GAP-PRIV-04` 线裁决；**本刀不裁、不碰 erasure 链**。

**推荐：方案 A。** 理由：唯一同时满足「Ban 动摇 `0028` 既有约束语义」（SCOR S-CB-1 触碰面写死）+ 审计级不可变证据（INSERT-only 关系）+ 迁移面最小三条的方案；B 在 immutability 上先天弱一档，C 直接违约。**本推荐 ≠ 执行授权**：方案终采与 `consent_version` 语义终裁（C-EH-3 冻结）由 coding 阶段落卷、双审复核；若终裁判「DB 绑定 ≠ 审计意义不可替代」且 A 的 snapshot 层不足以闭合，范围按 D1 逃生门先例以未来 REQUEST 重立。

## 3. Prove 方案（named · 本卷零执行 · 授权后方跑）

### 3.1 NEG 面（绑定生效 · 期望全拒）

| # | 场景 | 断言 | 期望 |
|---|------|------|------|
| N1 | 跨申请重放：候选人持有 A 岗已完成绑定会话，对 B 岗申请（不同 job）finalize，body 携带 `interviewId=A` | strict DTO 拒（`FinalizeApplicationDto={}.strict()`）；body `{}` 时反查不一致 → `not_ready` | HTTP 4xx/409 · `job_application(B).score IS NULL` 恒成立 · 无任何写 |
| N2 | 换绑：对已绑定 interview UPDATE `application_id/job_id/resume_id` 任一列；对已绑定 `job_application.interview_id` 改指他场 | DB trigger 拒 | exception `interview_application_binding_immutable` / `job_application_interview_binding_immutable` · 行无变化 |
| N3 | 无申请上下文进 application 域：路由未决岗位 start；对无绑定申请 finalize | start → `interview_ineligible_route` 且 **interview 行 0 新增**；finalize → `cannot_finalize` | 409 · `unresolved_route_start_count=0` 语义等价可测 · score 仍 NULL |
| N4 | 快照不可变（方案 A 落地后）：app_role 路径 UPDATE/DELETE `candidate_evaluation_snapshot`；快照缺失时 B 端读；**异主读快照 → 0 行** | DB trigger 拒写删；RLS 拒跨 owner 读；读侧最小投影 | exception · 异主 0 行（授权根口径=PG RLS + `asPrincipal`+`set_config('app.principal_user')` 唯一——`gap-priv-01-tenant-rls.slice.md:14` · Ban 应用层 tenant 原型代授权根）· B 端永不见数值分（hold 投影不变） |
| N5 | 伪造归属：异主/异租户对他人申请 start/finalize | RLS + owner 反查 | 0 行 · 409/noop 族（底座实况：跨用户 finalize 409 `cannot_finalize`、start 不存在 noop、decline 他人 noop、列表 RLS 0 行——`neg-bend.proof.ts:247-258`） |

### 3.2 HP 面（正常绑定流 · 期望全过）

| # | 场景 | 断言（audit 验收表映射） |
|---|------|------|
| H1 | invited → start(本人已摄取 resume) → 答题至完成 → finalize 确认 | `started` + interviewId + `redirectTo`；完成自动收口；finalize 返回 `replayed/assessment_unavailable` 恒 scoreless（`:112` 前置正常流） |
| H2 | 同一 application 并发 20 次 start | **恰 1** interview、**1** 次 reserve、成功响应同一 interviewId（`:112`；底座 §① 已断言恰 1 interview/同一 interviewId，本刀补 reserve 计数=残差①） |
| H3 | 同一岗位会话 completion 重放 | CandidateEvaluationSnapshot / 人才库分数 / 消费确认各**恰 1** 次（`:114`；snapshot 项依赖 G-1 落地） |
| H4 | 真实浏览器 C→B 全链路 | **1 条必过**，覆盖刷新、双击、断网后恢复 + B 端最小化展示（`:115`；在 `recruiting-bound.spec.ts` 既有单链路上**扩展分支，不替换不删既有断言**） |

### 3.3 命令 + 期望 EXIT + attempt 纪律

| Command | 状态 | 期望 EXIT | 说明 |
|---------|------|-----------|------|
| `pnpm recruiter:prove`（`package.json:194` → `packages/db/package.json:19` → `tsx test/recruiter-depth.proof.ts`） | 在树 | 0 | 底座保持绿（`recruiter-depth.proof.ts` **39 处 `A()` 断言** · `rg -c "A\('" @fe218b7a 亲测`）；回绿失败即基底回归，判 fail |
| `pnpm neg:bend`（`package.json:98` → `apps/api/test/neg-bend.proof.ts`） | 在树 | 0 | HTTP 拒绝底座保持绿 |
| `pnpm openapi:prove`（`package.json:275`） | 在树 | 0 | 契约面（strict DTO 变更若有时）保持绿 |
| `pnpm cb01-binding:prove`（**拟名** · coding 阶段经 scripts/`package.json` 落地 · 终名随 exec 卷） | 待建 | 0 | NEG N1/N2/N3/N4/N5 + HP H2/H3 · 真实隔离 PG（`run-e2e-isolated.mjs` 族）· Ban mock API/DB |
| `pnpm e2e`（`recruiting-bound.spec.ts` 扩展后定向跑该 spec） | 在树 + 扩展 | 0 | HP H4（含 H1 全链）· 真实浏览器 |

- **attempt 纪律（写死）**：每条命令每次运行全账（Asia/Shanghai 时间窗 · 代码 SHA · EXIT 值 · 失败与成功同列入账）；**一次优先**（fixture 唯一后缀 + fresh 容器，设计期消灭可复现失败）；**Ban retry-to-green**（GAP-PRIV-AUTHZ-PROVE-FLAKE `:68` 先例：EXIT≠0 → 判 fail 入账，任何后续单绿不得擦除失败记录、不得作为重试成功的证据）。
- **EXIT 契约**：EXIT0 ≠ P0-CB-01 已闭 ≠ `:78` 可翻 ≠ covered ≠ `releaseEvidence=true` ≠ HA ≠ g7SuiteGreen；post-prove 双审通过 + 协调方 nail 前一切状态原值。

## 4. Ban 列表（硬 · 全程含 coding+prove 阶段）

- **Ban 碰 settlement/early-stop 语义**：`adaptive-lifecycle.ts` / `commerce.ts` 及其结算/早停控制流、文案臂（`recruiting-bound.spec.ts` 中 `settlementFaces`/`EARLY_STOP_COPY` 等既有断言只读沿用，Ban 改判）——G7V/G7U 链归其位，本刀零触碰。
- **Ban 碰公开 DELETE=503 / privacy 主链 / `checkpoint-principal.ts`**；Ban 开 DELETE（W3 freeze remains）；Ban INT-TRANSCRIPT-01 blocked 摘除。
- **Ban 改共享 SSOT**：backlog `GAP-PROD-02 :78` 行翻转**归协调方 nail**；matrix/checklist/queue/audit 原文/W6 链/MOP 链/AN 系列零触碰；本刀执行期只允许触碰 §6 触碰面白名单。
- **Ban 顺手做 CB-02/03**：目的限定同意/撤回（`ShareGrant`/撤回面）与三主体浏览器矩阵进 CI 归各自后续 REQUEST（内序写死 01→02→03）；本刀 consent 面仅限 `consent_version` 事务绑定列与终裁落卷，**不得**实现 ShareGrant/撤回 worker/矩阵。
- **Ban secrets**：prove 全部本地隔离环境；若需 live Key 一律 name-only（Ban 读 `.env*`、Ban 写入任何 key 值）；Ban buy cloud / Meridian；`actualSpendCny=null` 保持。
- **Ban 动摇 `0028`/`0046`/`0082` 既有约束语义**（S-CB-1 触碰面继承）；Ban B 端数值分恢复/排序/自动决策（hold 保持至校准 release）。
- **Ban retry-to-green** · Ban force-push · Ban self-approve（alone ≠ dual）· Ban 审降级/换默认（dual = mw-e2e-ha + mw-privacy-int 写死）。

## 5. 触碰面白名单（coding+prove 执行期唯一允许 · 超出即违约）

additive migration（新文件 · `packages/db/migrations/`）· `packages/db/src/recruiter.ts`（additive 快照写路径 + 反查不动既有分支）· `apps/api/src/modules/jobs/applications.service.ts` / `applications.controller.ts`（如需错误码扩面）· `packages/contracts/src/index.ts`（additive schema）· `apps/web` finalize/申请面（如快照只读投影需要）· `apps/web/e2e-ui/recruiting-bound.spec.ts`（**只增分支**）· `scripts/` + `package.json`（仅新增 prove 命令行）· `ai-docs/delivery/`（本刀卷 + 审 stub + exec 卷 + receipts）。其余一切文件零触碰。

## 6. Products（本卷交付）

| Role | Path |
|------|------|
| Harness（REQUEST 正文） | `ai-docs/delivery/harness/p0cb01-application-binding.md` |
| Slice 摘要 | `ai-docs/delivery/p0cb01-application-binding.slice.md` |
| Dual `mw-e2e-ha` stub | `ai-docs/delivery/reviews/REQUEST-2026-10-07-p0cb01-mw-e2e-ha.md` |
| Dual `mw-privacy-int` stub | `ai-docs/delivery/reviews/REQUEST-2026-10-07-p0cb01-mw-privacy-int.md` |

## 7. Non-claims

docs-only REQUEST 立卷 · not P0-CB-01 closed · not `:78` flip · not 绑定验收通过 · not snapshot/consent_version 已建 · not named proves 已跑 · not covered · not HA · not `releaseEvidence=true` · not g7SuiteGreen · `actualSpendCny=null` · PG-retained · 公开 DELETE=503 · alone ≠ dual · PASS ≠ AUTHORIZE ≠ 状态翻转 · 方案 A 为推荐非终裁 · snapshot 为擦除面新 sink 候选（INSERT-only 与 subject-erase 互斥 · 未裁是否入擦除范围）→ 转协调方/GAP-PRIV-04 线裁决 · 本刀不裁、不碰 erasure 链 · consent 体系关系四问列 C-EH-3 执行期终裁必答（本卷不裁）。

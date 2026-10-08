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

**「不可替代绑定」的基底（DB 约束 + 绑定路径 + 反查收口）在 tip 实存，但其审计级语义（immutable `CandidateEvaluationSnapshot` + `consent_version` 事务绑定）产品码 0 hit，且 audit 验收表（`product-readiness-c-b-audit.md:110-115`）四项**全部零 named prove 收据**——面试可脱嵌于申请上下文存在（practice 面域）在设计上合法，但「跨申请重放/换绑 fail-closed」与「完成事件恰一次写不可变快照」两条**只有代码实现、没有验收证据**。缺口重心=验收证据面（SCOR §9 D1 裁决继承 · erratum E-1…E-4 口径继承），本刀即该面的实现 REQUEST。

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
| HTTP start / finalize（strict DTO） | `apps/api/src/modules/jobs/applications.controller.ts:22-24/:36-39` · `apps/api/src/modules/jobs/applications.service.ts:35-63/:66-92`（`:71` `not_ready`→409 `cannot_finalize`） | `d0b779952514c36417b98242ca1412c78be4685c` / `9a17cfe4546aec7542ebe49a43d3b18978ea422a` |
| `FinalizeApplicationDto = z.object({}).strict()`（客户端 interviewId/score 一律 DTO 拒）· `StartApplicationDto` 仅 `resumeId` | `packages/contracts/src/index.ts:327/:339`（注释 `:335-338`） | `d44768f91ce3f011447ee251d8213661a61457dc` |
| web 终态自动 finalize 消费者 + 同源代理（浏览器只给 applicationId） | `apps/web/components/InterviewPanel.tsx:88/:99-114`（fetch `:103`）· `apps/web/app/api/applications/[id]/finalize/route.ts:5-17` | `ec9b3fe168e4e9c98a782f0f78ef5f89e4d1ba85` / `c558e82e169a8465289bcb4d977a82343140ec72` |
| B 端数值暂停（calibration hold · score=NULL 恒定投影） | `packages/db/migrations/0082_b_side_score_calibration_hold.sql` | `2b4d4f66dd6d53d278655ff7e7f6be5694881f39` |

### 1.2 缺口面（本刀要闭合的 · 亲算 0 hit / 0 收据）

| # | 缺口 | 亲算证据 @`fe218b7a` |
|---|------|----------------------|
| G-1 | **immutable `CandidateEvaluationSnapshot` 不存在**——audit `:97-107` 要求完成事件写不可变快照（score、rubric/model/prompt/qbank 版本、evidence hash），B 端只读该快照；tip 完成链只回填 `job_application.score/status` 两列，无版本化/evidence-hash 化的独立不可变证据关系 | `git grep -icE 'candidate_evaluation\|evaluation_snapshot\|application_snapshot' -- ':!ai-docs'` = **0 hit**（rc=1 亲测） |
| G-2 | **`consent_version` 事务绑定面 0 hit**——audit `:97-99` 要求创建事务绑定 `consent_version`；tip 绑定四元组为 application/job/resume/owner，无 consent 维度（该面语义终裁按 SCOR C-EH-3 冻结归本刀执行阶段） | `git grep -icE 'consent_version\|consentVersion' -- ':!ai-docs'` = **0 hit**（rc=1 亲测） |
| G-3 | **验收表 `:110` 并发项零收据**——「同一 applicationId+startIdempotencyKey 并发 20 次 → 恰 1 interview、1 次 reserve、同一 interviewId」无 named prove；现有隔离底座（`recruiter:prove`）不含并发 20 绑定场景 | `package.json:194`（recruiter:prove · 29 项底座口径）无该断言；`apps/web/e2e-ui/recruiting-bound.spec.ts` 单链路无双击/并发分支 |
| G-4 | **验收表 `:111` 错配 409 零收据**——「任意本人但非该岗位 interviewId finalize → 409 且 score 仍 NULL」无 named prove（实现面存在：strict DTO + 反查；证据面空） | `neg:bend`（`package.json:98`）为 B 端底座、无跨申请重放用例收据 |
| G-5 | **验收表 `:112` 重放恰一次零收据**——「同一岗位会话 completion 重放 → CandidateEvaluationSnapshot/人才库分数/消费确认各恰 1 次」无 named prove（G-1 缺失导致 snapshot 项结构性不可证） | 同 G-1 + `0028:42-75` trigger 仅回填两列 |
| G-6 | **验收表 `:114` 浏览器全链路覆盖不足**——要求覆盖**刷新、双击、断网后恢复**及 B 端最小化展示；`recruiting-bound.spec.ts`（blob `2b232748a034f39e634c911cce962dcb5dbb61b8` · `:142-255`）有单链路 C→B + B 端 reload 最小化断言（`:244-255`），**无 C 端刷新/双击/断网恢复分支** | spec 全文亲读 @`fe218b7a` |
| G-7 | **practice 面域与 application 域的隔离只有实现无收据**——practice 入口 `apps/web/app/interviews/actions.ts:9-21`（仅 resumeId · blob `bbc8bde144cedba8412af379787da4f03a037260`）+ `POST /interview` 空壳创建 `apps/api/src/modules/interview/interview.controller.ts:156-160`（service `create` `:589`）合法存在；practice 会话不可被 finalize 移花接木到岗位（反查兜底）须以 NEG prove 收据化，而非仅凭码面注释 | E-2 口径（erratum 继承）+ G-4 |

**缺陷面结论**：现状不是 audit 2026-08-02 审查时的「无绑定」（erratum 已更正该 4 条为 stale），而是**「绑定基底实存、不可替代性证据为零」**——跨申请重放/换绑在 DB 层 fail-closed（trigger + 反查 + strict DTO），但没有一条 named prove 证明它在并发/对抗/重放条件下真的拒得干净；完成收口没有不可变快照证据层。`GAP-PROD-02` `:78` 因此 **stays OPEN**，翻转权归协调方 nail，本刀在任何结果下都不翻行。

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
| 形态 | 新 additive migration 建 `candidate_evaluation_snapshot`（application_id 唯一 FK + interview_id FK + score/rubric/model/prompt/qbank 版本列 + evidence_hash + created_at），INSERT-only trigger 封死 UPDATE/DELETE；完成链（DB trigger 同事务）恰一次写入（幂等重放：conflict-then-read-back 返回同一行）；`consent_version` 列 additive 挂绑定面（语义终裁随执行落卷）；prove 层新增验收表四项 named proves | `job_application` 加 `evaluation_snapshot jsonb + evaluation_snapshot_hash` 列，由完成 trigger 写入同表 | 新建独立绑定关系表，interview/job_application 上的绑定列与 `0028`/`0046` trigger 全部迁移重写 |
| 对现有链破坏面 | **零改写**：`0028`/`0046`/`0082` 约束与 trigger 语义原样；`startApplicationInterview`/`finalizeApplication` 现有行为原样（finalize 仍 scoreless hold 收口）；只增不改 | 中：`job_application` 已挂两层重 BEFORE trigger（`0028:95-142`/`0046`），同表再藏可变 JSONB 需追加列级防篡改 trigger，行级 immutability 只靠约定；其他写路径（status CAS/attempt）与快照列共行，误覆盖面变大 | **最大**：重写全部绑定面（migrations×2 + recruiter.ts 全部查询 + finalize 反查 + e2e spec），直接抵触 SCOR S-CB-1 触碰面 Ban「Ban 动摇 `0028` 既有约束语义」 |
| 迁移面 | 恰 1 个 additive migration（CREATE TABLE + trigger + 既有行零回填；旧申请无快照保持 fail-closed 最小投影） | additive 列但落在热表上；旧行 NULL 语义与 hash 基线含混 | 全量重迁移 + 数据搬迁，回归面不可控 |
| 不可替代性强度 | **最强**：独立 INSERT-only 关系 + evidence hash，不可变是结构性质非约定性质；B 端只读投影有唯一权威源 | 弱：hash 覆盖的对象本身住在可变行里，「不可替代」降级为 trigger 约定 | 与 A 等价但推倒重来，纯成本 |
| fail-closed 形态 | 快照缺失/不一致 → B 端最小投影；重放 conflict-read-back 恰 1 行；绑定拒绝面原样继承 `0028` 三 trigger + 反查 | 同左但快照一致性须额外自证 | 同左但全部拒绝面须从零重证 |
| 验收表映射 | `:110`（并发 20 → prove）/`:111`（409 → prove）/`:112`（重放恰 1 → snapshot 表幂等直证）/`:114`（spec 扩分支）逐项可 named | `:112` snapshot 项证明绕行（同表行级），收据弱 | 逐项可 named 但代价是全链重证 |
| 审查关注点 | INSERT-only 封口是否彻底（app_role 全路径）· consent_version 语义终裁落卷 · hold 期间 B 端投影仍 scoreless | 行级防篡改完备性 · hash 基线 | ——（不建议进入执行） |

**推荐：方案 A。** 理由：唯一同时满足「Ban 动摇 `0028` 既有约束语义」（SCOR S-CB-1 触碰面写死）+ 审计级不可变证据（INSERT-only 关系）+ 迁移面最小三条的方案；B 在 immutability 上先天弱一档，C 直接违约。**本推荐 ≠ 执行授权**：方案终采与 `consent_version` 语义终裁（C-EH-3 冻结）由 coding 阶段落卷、双审复核；若终裁判「DB 绑定 ≠ 审计意义不可替代」且 A 的 snapshot 层不足以闭合，范围按 D1 逃生门先例以未来 REQUEST 重立。

## 3. Prove 方案（named · 本卷零执行 · 授权后方跑）

### 3.1 NEG 面（绑定生效 · 期望全拒）

| # | 场景 | 断言 | 期望 |
|---|------|------|------|
| N1 | 跨申请重放：候选人持有 A 岗已完成绑定会话，对 B 岗申请（不同 job）finalize，body 携带 `interviewId=A` | strict DTO 拒（`FinalizeApplicationDto={}.strict()`）；body `{}` 时反查不一致 → `not_ready` | HTTP 4xx/409 · `job_application(B).score IS NULL` 恒成立 · 无任何写 |
| N2 | 换绑：对已绑定 interview UPDATE `application_id/job_id/resume_id` 任一列；对已绑定 `job_application.interview_id` 改指他场 | DB trigger 拒 | exception `interview_application_binding_immutable` / `job_application_interview_binding_immutable` · 行无变化 |
| N3 | 无申请上下文进 application 域：路由未决岗位 start；对无绑定申请 finalize | start → `interview_ineligible_route` 且 **interview 行 0 新增**；finalize → `cannot_finalize` | 409 · `unresolved_route_start_count=0` 语义等价可测 · score 仍 NULL |
| N4 | 快照不可变（方案 A 落地后）：app_role 路径 UPDATE/DELETE `candidate_evaluation_snapshot`；快照缺失时 B 端读 | DB trigger 拒写删；读侧最小投影 | exception · B 端永不见数值分（hold 投影不变） |
| N5 | 伪造归属：异主/异租户对他人申请 start/finalize | RLS + owner 反查 | 0 行 / 404 族 · 与既有 B 端隔离底座一致 |

### 3.2 HP 面（正常绑定流 · 期望全过）

| # | 场景 | 断言（audit 验收表映射） |
|---|------|------|
| H1 | invited → start(本人已摄取 resume) → 答题至完成 → finalize 确认 | `started` + interviewId + `redirectTo`；完成自动收口；finalize 返回 `replayed/assessment_unavailable` 恒 scoreless（`:110` 前置正常流） |
| H2 | 同一 application 并发 20 次 start | **恰 1** interview、**1** 次 reserve、成功响应同一 interviewId（`:110`） |
| H3 | 同一岗位会话 completion 重放 | CandidateEvaluationSnapshot / 人才库分数 / 消费确认各**恰 1** 次（`:112`） |
| H4 | 真实浏览器 C→B 全链路 | **1 条必过**，覆盖刷新、双击、断网后恢复 + B 端最小化展示（`:114`；在 `recruiting-bound.spec.ts` 既有单链路上**扩展分支，不替换不删既有断言**） |

### 3.3 命令 + 期望 EXIT + attempt 纪律

| Command | 状态 | 期望 EXIT | 说明 |
|---------|------|-----------|------|
| `pnpm recruiter:prove`（`package.json:194`） | 在树 | 0 | 底座保持绿（29 项口径）；回绿失败即基底回归，判 fail |
| `pnpm neg:bend`（`package.json:98`） | 在树 | 0 | HTTP 拒绝底座保持绿 |
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

docs-only REQUEST 立卷 · not P0-CB-01 closed · not `:78` flip · not 绑定验收通过 · not snapshot/consent_version 已建 · not named proves 已跑 · not covered · not HA · not `releaseEvidence=true` · not g7SuiteGreen · `actualSpendCny=null` · PG-retained · 公开 DELETE=503 · alone ≠ dual · PASS ≠ AUTHORIZE ≠ 状态翻转 · 方案 A 为推荐非终裁。

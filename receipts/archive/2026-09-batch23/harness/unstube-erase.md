# Harness — **UNSTUB-ERASE 刀**（删除三桩可用化 · S1 软删层先行 + S2 异步清除登记 · EXTREV-6/EXTREV-7 · REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual`**（REQUEST docs-only · 双 stub PENDING · Ban self-approve · alone ≠ dual · **Ban coding · Ban prove · Ban push**）
**Pins（十一值照抄 · 本 REQUEST 期原值零翻转）**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · r1Closed=false
**本刀申请 pin supersession（§3）**: 「公开 DELETE=503」→「公开 DELETE=202 软删受理（mode=logical · purge_pending=true · 物理清除完成仍禁宣称）」——仅在 pre-exec dual BOTH PASS + meetwise 授权后由 EXEC 生效；立法意图继承详见 §3.0。**本 REQUEST 期 pin 行原值不动。**
**Date**: 2026-10-07
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`5e1e7fde`**（本 worktree `line/unstub-erase`）
**Knife**: **UNSTUB-ERASE**（EXTREV-6 首批刀之二 · SOP `extreview-fix-campaign-SOP.md:84`；**经 EXTREV-7 铁律 1（SOP :89）重定义**：「删除类一律软删先行（deleted_at+查询过滤+立即停止处理与访问=对用户即真实可用），物理清除走已建 PRIV 链异步补完+回执——UNSTUB-ERASE 按此重定义，『假可用禁令』由『软删语义如实』满足」）
**依据**: ①EXTREV-7 铁律 1（SOP :86-89 · 用户裁定 2026-10-09）；②UNSTUB-INV 盘点 @ `89e3575e`（分支 `origin/line/unstub-inventory` · `ai-docs/delivery/harness/unstub-inventory.md`——**本分支不含该文件，审席读法 `git show 89e3575e:ai-docs/delivery/harness/unstub-inventory.md`**；P-04/P-05/P-06/P-07/P-09 档案+§3 已建 12 件 vs 缺口 10 项对账+§4.1 四子阶段草案）；③503-pin 在卷面全量取证（§3.2 表）。
**Gap ids**: UNSTUB-INV P-04（简历单删）/P-05（全量删）/P-06（面试擦除）+ P-07（账户注销·S1 面）+ P-09（回执披露文案·随能力退役）
**Experts**: `mw-privacy-int` + `mw-e2e-ha`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: docs REQUEST only · Ban coding · Ban prove · Ban push · pre-exec dual BOTH PASS 后由协调方授权 EXEC（coding+prove）；SSOT（NORTH-STAR §1 pins 行/矩阵行/backlog）**仅 nail 期**由协调方授权触碰（§6）

---

## 0. Why this knife（现状锚点复核 · 全部 @5e1e7fde 亲读 · 非转抄盘点行号）

| 锚 | 现状（read-only · 本 REQUEST 零修改） |
|----|------|
| **P-04 API 桩** | `apps/api/src/modules/resume/resume.service.ts:278-280` `remove(_principal,_id): never` → 503 `resume_erasure_migration_in_progress`（:272-277 桩因注释：「Keep the route fail-closed until the per-resume asynchronous erasure state machine replaces it; a 200 here would falsely represent a privacy guarantee」）；`resume.controller.ts:41-45` `@Delete(':id')` `@HttpCode(OK)` |
| **P-05 API 桩** | `apps/api/src/modules/privacy/privacy.service.ts:65-68` `deleteResumeData(_principal): never` → 503 同错误码（:59-64 桩因注释：同步全量删除会伪称完成）；`privacy.controller.ts:57-61` `@Delete('resume-data')` `@HttpCode(SERVICE_UNAVAILABLE)` |
| **P-06 API 桩** | `privacy.service.ts:53-57` `eraseInterviewData(...): never` → 503 `interview_erasure_authorization_not_available`（:46-52 桩因注释：`app.principal_user` 是路由 GUC 非不可伪造身份，需授权快照签发器）；`privacy.controller.ts:51-55` `@Delete('interview-data/:id')` `@HttpCode(503)` + `Idempotency-Key` 头已收未用 |
| **UI 文案** | `apps/web/app/resume/page.tsx:38`（「完整删除与撤回流程尚未开放」）/:47（同意卡「完整删除、撤回与跨存储回执流程尚未开放」）/:53；:93-94 disabled 按钮「删除功能暂未开放」+`title="完整删除与跨存储回执流程尚未开放"`；`faq/page.tsx:17-18`（「完整的删除、撤回与跨存储回执流程尚未开放…这不是生产删除完成」）；`legal/page.tsx:44`（未开放事项 bullet）；`settings/page.tsx:88-96`（P-07：「账户注销暂未开放」:89/:91/:95 disabled） |
| **文案静态 pin** | `apps/web/test/public-copy.proof.mjs:128-131` **钉死现状**——:128 `forbid(resume,['deleteResumeAction','pendingLabel="删除中…"'])`、:129 `requireText(resume,'删除功能暂未开放')`、:130 `forbid(settings,['deactivateAction',…])`、:131 `requireText(settings,'账户注销暂未开放')`；:136/:170 faq/legal 同形。**文案退役=本 proof 同刀翻转（§3.2-#6）** |
| **行为 pin（API）** | `apps/api/test/validate.ts:542-555`（单删 503×2+全量 503+「503 后行数不变」）；`apps/api/test/privacy-erasure-http.proof.ts`（503-pin 文档的执行体 · P1-P8 断言 :61-64/:72-81/:91-101/:111-122/:197-201 + **dormant 202 早退门 :243-246** + dormant 202 harness :248-367）；`apps/api/test/neg-resume.proof.ts` B2 :226-248 / B3 :260-305（NEGRESFIX 已 nail 的 503 回和形制） |
| **软删机械·已建（interview 轨道）** | `packages/db/src/checkpoint-privacy.ts:72` `beginCheckpointErasure`（幂等键 HMAC→`privacy_erasure_request`+targets·replayed 语义·fence epoch）；围栏判定 `interview_privacy_active(text)`（0058 定义/0076 现版 :88-115：**存在任一状态的 erasure request+checkpoint target 即 fenced**）；`apps/api/src/modules/interview/interview.service.ts:151-162` `guardInterviewPrivacy`→410 `interview_privacy_fenced`（owner 404/fenced 410 分立）；**:561-562 列表查询 WHERE 已含 `interview_privacy_active(i.id)`**（fenced 即从列表消失）；预览路径已把该 begin 用于 scope=interview_data（`privacy.service.ts:97-146`·`beginPrivacyPreviewErasure`，preview 回执 status=`local_fenced`） |
| **软删机械·已建（resume 轨道地基）** | `resume.ts:9` 状态枚举已含 `erasure_fenced|erased`；0060 已建：partial dedup 索引 `uq_resume_content_active`（fenced 行不再是去重目标→**删后同文重传=新行，天然支持**）、`privacy_epoch` 列、status CHECK；0061 derivative guard；**0063 `resume_blob`/`resume_profile` active-read RLS**（父行 `status='ingested'` 才可读→**fence 翻转后 profile/原文读取即 0 行=404，读路径零改**）；0047 `privacy_erasure_request` 账本 scope 已含 `resume_data|account_data` 三域+幂等唯一。**缺口**：0060 trigger `enforce_resume_tombstone_foundation`（:53-85）把 fenced 转移钉死为 `resume_privacy_lifecycle_not_available`（P0001）——begin 函数须新迁移在受审函数内放行（§2.5-D1） |
| **软删机械·已建（account 轨道）** | `apps/api/src/platform/principal.guard.ts:28-58`：status≠`active`→401 `account_inactive`（注释明言「禁用/注销即时失效」）+ pwd_epoch 代次失配→401 `session_revoked` + `evictPrincipalStatus` 即时逐缓存；`auth.service.ts:50` login 要求 `status==='active'`；`user_account` CHECK ('active','disabled')（baseline :365）+ `pwd_epoch`（0015）。**注销即时生效的机械全在，缺端点+deleted_at 列+UI** |
| **账户注销零服务端面** | `apps/api/src/modules/auth/`+`profile/` grep 亲证：仅 `@Post('signup')`/`@Post('login')`，无任何 DELETE/注销路由（UNSTUB-INV P-07 同判） |

**为什么是现在**：SOP EXTREV-6 指令定性（:69「诚实 503 是过渡态不是终态」）+ EXTREV-7 铁律 1（:89）把 UNSTUB-INV §5 的「跨存储擦除真实完成+回执可证后才翻」红线**重定义为软删先行**——「停止处理与访问」对用户即真实可用，物理清除异步补完。三桩的停止访问机械（RLS 读门/围栏判定/列表过滤/worker 谓词/账户状态门）**已建在库**，S1 是把它们接到公开 DELETE 的接线刀+两个小迁移，不是重造。

## 1. Residual statement（frozen · disclosed）

| Residual | Status | Note |
|----------|--------|------|
| P-04/P-05/P-06/P-07（UNSTUB-INV §1 行） | **OPEN** | 本刀 S1 EXEC+nail 后按「软删可用·物理清除 pending」新口径登记；**Ban 本 REQUEST 期翻行** |
| 物理清除（跨存储 sweep 执行器/§4.2 缺口/INT01 六门） | **OPEN → S2**（§4） | S1 交付不阻 S2；S2 未完成前 purge_pending=true 恒真 |
| GAP-PRIV-02（backlog A） | **OPEN** | 「保持 503；放开须 issuer/lease+逐 sink receipt」→ 本刀 §3 supersession 改写其语义口径（nail 期） |
| GAP-PRIV-03/04、INT01 六门、§4.2（user_memory/trace/备份/外部云端） | **OPEN 零触碰** | 归 S2/后续刀；**Ban 借 S1 宣称任何物理清除完成** |
| coveredCount | **8** | 本刀 Ban covered flip · Ban invent coveredCount |
| 0091 预览回执面（0129） | **可用·零改** | `productionSloClaimed=false`/`preview_incomplete` 三钉原值；**Ban 把预览 202 改写成生产完成态** |

## 2. Scope — S1 软删层（本刀主体 · 立即可用面 · EXEC 授权后实施）

### 2.1 三端点翻真（响应统一形：202 + `{mode:'logical', purgePending:true, …}`；错误码 `resume_erasure_migration_in_progress`/`interview_erasure_authorization_not_available` 随桩退役）

| 端点 | S1 改法（提案 · 细节交双审） |
|----|------|
| **DELETE /resume/:id**（P-04） | `remove()` 翻真：同事务内①owner+uuid+`status IN ('uploaded','ingesting','ingested','failed')` 校验（不存在/越权→404 不分叉，沿 `profile()` :283 形制）②调新 fence 函数（§2.5-D1）：`status→'erasure_fenced'`+`erasure_requested_at` 时间戳+`privacy_erasure_request` 落账（scope=`resume_data`）③返回 202 `{resumeId, mode:'logical', deletedAt, purgePending:true, requestId}`。**幂等=状态幂等**：再删已 fenced 行→202 同态（`alreadyFenced:true`·同 requestId），不建新账（D2：是否补收 `Idempotency-Key` 头交双审裁——状态幂等已足） |
| **DELETE /privacy/resume-data**（P-05） | `deleteResumeData()` 翻真：遍历 owner 全部 active 态 resume→逐份走 P-04 fence 函数（同一事务或逐份子事务交双审）+ OCR 派生痕迹（`ai_invocation_trace`/`ai_model_invocation` 的 `resume.vision` 面）**登记不删**（S2 清除）；返回 202 `{mode:'logical', purgePending:true, resumesFenced:n, requestId}`。空集（无 active 简历）→202 `resumesFenced:0` 同形 |
| **DELETE /privacy/interview-data/:id**（P-06） | `eraseInterviewData()` 翻真：**直接复用 `beginCheckpointErasure`**（`checkpoint-privacy.ts:72`·预览路径已同形在用）——owner+存在校验（404 不分叉）→ fence（epoch+账本+targets）→ 202 `{mode:'logical', purgePending:true, requestId, replayed}`。`Idempotency-Key` 必收（缺失→400，dormant harness :251 已有此形）；同键重放→202 `replayed:true` 同 requestId。**fence 即时生效面全部已在库**：列表过滤（`interview.service.ts:561-562`）、guard 410 族（:151-162）、worker 谓词（§2.2-C） |
| **DELETE /auth/account**（P-07·新增端点） | 注销 S1=软删账户+登出+数据进待清除态：①密码复核（body `{password}`·`verifyPassword` 常量时间比对，错→401——高危操作二次确认）②`user_account`：`status→'disabled'`+`deleted_at`（§2.5-D5 新列）+`pwd_epoch+1`+`evictPrincipalStatus(uid)`（**全部现存机械即刻吊销所有令牌**：旧 Bearer→401 `account_inactive`/`session_revoked`·login→401）③owner 的 resume/interview 轨道批量进 fence（复用 P-04/P-06 函数·逐轨道 best-effort 落账）④202 `{mode:'logical', purgePending:true, deletedAt}`。**同 email 重注册在 S1 不可**（行仍在·unique）——UI 确认框如实披露（§2.4），匿名化/物理删归 S2 |

### 2.2 S1 消费查询清单（亲读定案：「读路径零改」与「显式过滤」分列）

**A. 读面已免改（既有 RLS/状态谓词已覆盖 fence——S1 零触碰，prove 断言即可）**：

| 消费查询 | 覆盖机制 |
|----|----|
| `resume.service.ts:282-289` profile() | 0063 `p_resume_profile_active_read`（父 `status='ingested'` 才可见）→fence 后 0 行→404 |
| `resume.service.ts:235-270` reparse()（`decryptResumeBlob` :242） | 0063 `p_resume_blob_active_read`→`resume_blob_not_found_or_forbidden`→既有 catch→404 |
| `apps/api/src/modules/roles/roles.service.ts:24`（resume_profile 读） | 0063 active-read RLS |
| `apps/worker/src/adaptive-lifecycle.ts:151`（profile hydration） | 同上（RLS 兜底·其外层 :139 已有 `r.status='ingested'` 谓词） |
| interview 全 guard 族（`interview.service.ts` get/turn/report/transcript/assessment/learning-plan/voice 等 :151-162 调用点） | `interview_privacy_active`=false→410 `interview_privacy_fenced` |
| `interview.service.ts:561-562` 列表 | WHERE `interview_privacy_active(i.id)` 已滤 |

**B. 停止处理（后续 begin/turn/worker 对已软删资源——S1 零改，prove 断言即可）**：

| 处理路径 | 既有拒绝谓词 |
|----|----|
| begin 绑定简历（`interview.service.ts:250-269`） | `AND r.status='ingested'`（:265）→fenced 简历→409 `interview_resume_binding_unavailable` |
| begin 幂等复查（:272-284） | `AND r.status='ingested'`（:282） |
| 队列准入（`packages/db/src/interview-jobs.ts:40/:193`） | `r.status='ingested'`+`privacy_epoch` 匹配+`interview_privacy_active` |
| worker start/answer 谓词（`apps/worker/src/interview-consumer.ts:127`） | 同上三元组 |
| worker 简历画像装载（`interview-consumer.ts:323`） | `r.status='ingested' AND r.privacy_epoch=$3` |
| 自适应轨道（`adaptive-lifecycle.ts:139`） | 同上 |
| quiz/diagnosis epoch 守卫（`quiz.service.ts:42`/`diagnosis.service.ts:44`） | `status='ingested'` |
| 候选路由（`candidate-route.ts:53`）/recruiter 绑定（`recruiter.ts:377/:420`） | `status='ingested'` |
| turn/作答（面试侧） | `guardInterviewPrivacy`→410（A 表） |

**C. S1 需显式过滤的读面（仅 2 处——resume 表本体是 owner-RLS 无状态门）**：

| 查询 | 改法 |
|----|----|
| `resume.service.ts:217-224` list() | WHERE 追加 `AND r.status NOT IN ('erasure_fenced','erased')`（fenced 即从「我的简历」消失） |
| `privacy.service.ts:38-41` export() | resumes/interviews 两查同步滤除 fenced（数据可携不含已删数据；`consent_record` 照旧——同意史是审计面） |

### 2.3 UI 文案退役（四页 + 常量 · 能力与文案同刀）

| 面 | 改法 |
|----|----|
| `resume/page.tsx:93-94` | disabled 按钮→真删除 action（`deleteResumeAction`：Server Action→DELETE /resume/:id+确认对话框「删除后立即从你的账号中移除并停止一切处理；后台清除稍后完成（不影响你的使用与隐私隔离）」+结果 toast 含 `purgePending` 如实态）；:38/:47/:53「尚未开放」句改「删除即时生效；跨存储清除回执稍后在隐私页可查」口径 |
| `settings/page.tsx:88-96` | 注销卡翻真：密码确认对话框（高危二次确认）+「注销后立即登出且无法再登录；关联数据停止一切处理与访问，后台清除稍后完成；清除完成前同一邮箱无法重新注册」如实披露 → action 调 DELETE /auth/account |
| `faq/page.tsx:17-18` | 删除 QA 改「可删除简历/面试数据并注销账户：删除/注销即时生效（立即停止处理与访问）；跨存储物理清除与回执为后台异步流程，完成前状态可在删除回执中查看」 |
| `legal/page.tsx:44` + `legal.controller.ts:15` dataRights 常量 | 「尚未开放」bullet 退役→「删除/撤回/回执：删除即时生效，跨存储清除回执异步完成」；`retentionDays:0` 保留 |
| `privacy/page.tsx`（0129 预览回执面） | **零改**（§非范围）；软删受理回执是否在隐私页列出=S2 回执聚合面，本刀不做 |

### 2.4 契约/类型面

`packages/contracts` 增补三端点响应 DTO（`mode:'logical'` 字面量型+`purgePending:true` 字面量型——类型层钉死「不得漂移成完成态」）；账户注销请求 DTO（password）。前端 `ResumeList` 等既有 zod 契约零破坏（additive）。

### 2.5 迁移面（2 个小迁移 · 全 additive · 编号顺延）

| # | 内容 | 关键点 |
|---|------|--------|
| **D1 resume fence 函数** | 新迁移：①`resume` 加 `erasure_requested_at timestamptz` 列 ②`CREATE FUNCTION privacy_begin_resume_soft_delete(p_owner,p_resume_id)` SECURITY DEFINER OWNER privacy_api_owner：校验 owner+active 态→`status='erasure_fenced'`+时间戳+落 `privacy_erasure_request`（scope=`resume_data`·幂等键=内部派生）③**0060 trigger 放行改造**：`enforce_resume_tombstone_foundation` 现把任何 fenced 转移钉死 P0001（:71-73）——改为仅当 `pg_current_user()`/调用上下文为 privacy_api_owner 系函数路径时放行 fenced 转移（app_role 直写仍钉死·**不放松 0060 立法**）；`privacy_epoch` 自增同函数内（pinned 引用即刻失配） | 复用 0060 预留表示法；**Ban 引入 app_role DELETE 能力**（0060 REVOKE 原值） |
| **D5 账户注销列** | 新迁移：`user_account` ADD `deleted_at timestamptz`（CHECK：`status='disabled'` 或 `deleted_at IS NULL` 一致性弱约束交双审裁——status 既有 CHECK 不动） | 最小面；物理删/匿名化归 S2 |

### 2.6 Ban touch（S1 内）

| 面 | 禁止 |
|----|------|
| 0091 issuer/JWS 面（`privacy-authorization.ts`） | **零改**——S1 不接线 issuer（EXTREV-7 简化优先：PrincipalGuard 已是足够授权根；六门归 S2）；`x-privacy-authorization` 头继续被忽略（非必需非特权·§3.2-#3-P4 新语义） |
| `privacy.service.ts:97-146` 预览族+0129 三钉 | 零改 |
| 0058/0059/0063/0076 RLS+触发器族 | 零改（S1 受益者非修改者）；D1 trigger 改造仅限 fenced 转移放行条款 |
| worker 擦除执行器（`privacy-erasure-worker.ts`） | 零改（S2 面） |
| 外部 sink/Qdrant/向量面 | 零触碰 |

## 3. Pin supersession（本刀核心申报 · 逐 proof 改法）

### 3.0 立法意图继承（先读）

旧 pin「公开 DELETE /privacy/interview-data/:id = 503」的立法意图（`privacy-erasure-http-503-pin.md` §0/§3）：**不得虚称删除/擦除已完成**——「任何『删除已闭环/erasure complete』叙事均为假绿」；诚实 503 是该意图下的过渡态选择，不是意图本体。新语义 **202+`{mode:'logical',purgePending:true}`+回执后置** 满足同一意图：受理即真（停止处理与访问对用户即时成立·可 prove），而**物理清除完成仍禁宣称**（`purgePending:true` 恒真直至 S2 逐 sink 回执闭合·`productionSloClaimed=false` 口径继承）。**语义不违背原 pin 立法意图，故可 supersede；supersede 须经本刀 pre-exec dual BOTH PASS + meetwise 授权，EXEC 前任何文件零改。**

### 3.1 SSOT 层（nail 期 · 协调方授权 · 本刀/EXEC 期 Ban 触）

| 文件 | 改法 |
|----|------|
| `NORTH-STAR-EXECUTION-LOOP.md` §1 pins | 「公开 DELETE /privacy/interview-data/:id = 503」→「公开 DELETE（interview-data/resume-data/resume/:id/account）= 202 软删受理 · purge_pending · 物理完成禁宣称」（十一值计数不变·替换其一） |
| `harness/privacy-erasure-http-503-pin.md`（pin 文档） | 头部加 superseded 注记（指向本刀+nail SHA·**不删原文**——沿 marked-red 保留史惯例）；§1.1 P1-P8 表标注 S1 改版 |
| `gap-bug-backlog.md` GAP-PRIV-02 / 矩阵 UC-E2E-050-052 | additive：503-pin→软删受理语义进展 cite；covered 判定仍归六门/S2 |

### 3.2 Proof 层（EXEC 期同刀改 · 逐文件列法——NEGRESFIX B2/B3 形制=先行模板：逐断言列改法·种子护栏保留·禁裸空真）

| # | 文件 | 现断言 | 改法（软删语义） |
|---|------|--------|------|
| 1 | `apps/api/test/privacy-erasure-http.proof.ts` | :61-64 P5 全量删→503；:72-81 P1/P2 面试删→503×2；:91-95 P3 JWS 冒充 Bearer→401；:96-101 P4 合法 Bearer+JWS 头→503；:111-122 副作用=零账本；:197-201 P7 预览后再删→503；:243-246 dormant 早退门 | P1/P2/P5/P7 → **202**+`mode='logical'`+`purgePending===true`+`replayed` 语义（首删 false/重放 true 同 requestId）；P3 **原值保留**（401·认证层与删除语义无关）；P4 → 202 同受理（JWS 头既非必需也无特权——「issuer 未接线」不再是拒绝理由，改为「JWS 不改变受理语义」）；:111-122 副作用断言改**恰建 1 request+N targets 且 purge/pending 态**（Ban 复用旧「零账本」断言）；:243-246 早退门**反转**（`if (paused.status === 202) …` 或按软删删改写）——dormant :248-367 段中「物理 purge 完成态」断言（五 target `erased`/`retention_pending` 终值族）**改 S1 真值**：本地 fence 态+`purge_pending`；worker 物理清除断言归 S2 保留 dormant |
| 2 | `apps/api/test/validate.ts` | :542-548 单删 503×2（userB 自有+userA 越权同 503 不分叉）；:552-555 全量删 503+`beforeDel===afterDel` 行数不变 | :546 → 202+`mode`/`purgePending`+**物理行仍在**（`db.pool.query` 直查 `resume` 行 `status='erasure_fenced'`——S1 不撒谎断言）；:548 越权 → **404**（不再恒 503·「不泄漏存在性」意图由 404 不分叉继承）；:553 → 202+`resumesFenced>0`；:555 → `afterDel < beforeDel`（列表收缩·软删即时可见）**且物理行数不变**（列表过滤≠物理删除·两断言并列） |
| 3 | `apps/api/test/neg-resume.proof.ts`（B2 :226-248 / B3 :260-305） | B2 六断言全 503（不存在/越权/自有首删/二次幂等同码）；B3 四断言 503+「OCR trace/invocation 行数 503 后不变（种子护栏 before>0）」 | B2：不存在→404（沿 :229 reparse 同形）；越权→404+`resumeExists(RA)` 保留；自有首删→202+`purgePending`+fence 后 `resumeVisible(RD)===false`（新 helper·列表+profile 双面）；二次→202 同态幂等（`alreadyFenced`/同 requestId·**不建第二份账**）；B3：自有全量删→202+`resumesFenced>=1`；「行数不变」种子护栏**改形保留强度**：列表/导出面行数收缩>0（禁裸 `after<before` 空真——须种子护栏 `before>0`）**且物理行不变**（S1 不撒谎） |
| 4 | `apps/api/test/neg-interview.proof.ts` | 无删除断言（grep 亲证） | **additive**：面试软删 NEG 族（越权 404/缺 Idempotency-Key 400/重放同 requestId/fence 后列表不可见+turn 410）——若 #1 已覆盖同面可裁并入 #1，交双审 |
| 5 | `apps/web/test/public-copy.proof.mjs` | :128-131 钉死「暂未开放」文案+forbid 真 action；:136/:170 faq/legal | **翻转**：:129/:131 requireText 改真删除/注销入口文案；:128/:130 forbid 改 forbid 旧文案（「删除功能暂未开放」「账户注销暂未开放」不得回潮）；faq/legal requireText 改新口径；**披露先行原则延续**：新文案必须滞后于 #1-#3 行为面同刀落地（同 commit） |
| 6 | pin 头机械面（30 文件·仅头注/console pin 行文字·零行为） | `godfn-1c-begin-guard-merge.proof.ts:16/:41`、`uc-e2e-001-nhp-{neg,bound,fault,adv}.proof.ts`、`uc-e2e-011-{adv-,}refund-callback{,-mouth,-adv}.proof.ts`、`uc-e2e-014-026-webhook-adv.proof.ts`、`uc-e2e-025-nhp-{adv,bound,fault,fault-isolated}.proof.ts`+`uc-e2e-025-nhp-neg.proof.mjs`、`uc-e2e-028-nhp-fault.proof.ts`、`packages/db/test/{rag03-hnsw-completeness,rag03c-exactk-observe,uc052-checkpoint-physical,uc052-external-sink-async-purge,uc052-external-sink-retention,uc052-internal-erasure,vector-plane-erasure}.proof.ts`、`packages/db/test/tenant-wiring.manifest.ts`、`packages/domain/test/memory-vector-chunk-deletion.proof.ts`、`packages/qdrant-store/test/qdrant-store.g5-{erasure,ledger-map}.proof.ts`、`scripts/conn-stack/mysql-stack{,.m2-tenant}.skeleton.proof.mjs`、`scripts/{eval-harness-matrix-cite.proof.mjs,uc018-waiting-user-tip-run.mjs}` | pin 行文字 `DELETE=503`/`公开 DELETE=503`/`public DELETE stays 503` → `DELETE=202 软删受理(purge_pending)` 同义缩写；**逐文件 diff 限于 pin 行**（Ban 触断言/Ban 顺带重构）；全清单闭卷（grep `DELETE=503|公开 DELETE|public DELETE` 复核=0 残留入收据） |

**执行序**：#1-#5 与 S1 产品码同 commit（行为+文案+proof 一体翻转）；#6 随同刀单独 commit（机械面·低风险）；§3.1 SSOT 归 nail。

## 4. S2 异步清除登记（另刀 · 不阻 S1 · 依赖排序）

UNSTUB-INV §3.2 十项缺口按 S1 后紧需排序（登记不实施）：

| 序 | 缺口 | 依赖 |
|---|------|------|
| S2-a | resume 轨道 claim/purge worker 函数（对齐 checkpoint 形制·消费 S1 落的 `privacy_erasure_request` resume_data 域） | D1 |
| S2-b | 外部 sink 确认执行器（oss/redis/langfuse `retention_pending`→云端真删回执·0137/0140 有表无执行器） | 门2 |
| S2-c | §4.2 缺口（user_memory 正文/ai_invocation_trace.output/备份留存语义） | S2-b |
| S2-d | INT 向量作用域键+Qdrant 登记为可证擦除 sink（门3） | — |
| S2-e | 账户级聚合（级联面清单定谳+孤儿检测·P-07 完全体） | S1+E1-E3 同构 |
| S2-f | INT01 六门合同（issuer HTTP 接线若双审裁 S1 后仍需/JWS 透传面）+开关合同独立 prove+四专家审 | 全前序 |
| — | 回执升格（P-09 完全面：`preview_incomplete`→`productionSloClaimed` 可言真=逐 sink 真组合根回执齐） | S2-b/c/d |

**S1 不等 S2 任何一项**；S2 各项立项时 §非范围 引本刀 nail SHA。

## 5. Prove 方案（EXEC 授权后执行 · 本 REQUEST 期零执行）

### 5.1 CMD+EXIT 契约（named-only）

| CMD | 期望 EXIT | 说明 |
|-----|-----------|------|
| `pnpm unstube-erase:prove`（新注册·root package.json additive → `scripts/run-e2e-isolated.mjs unstube-erase:prove:raw` → `pnpm -C apps/api prove:unstube-erase`） | **0**（主证） | 新 proof `apps/api/test/unstube-erase.proof.ts`：§5.2 全列断言（isolated PG+全迁移链+低权登录·沿 `privacy-erasure-http.proof.ts` 形制） |
| `pnpm api:validate` | 0 | §3.2-#2 改版后全绿 |
| `pnpm neg:resume` | 0 | §3.2-#3 改版后全绿（NEGRESFIX 回和面） |
| `pnpm privacy-erasure:http:prove` | 0 | §3.2-#1 改版后全绿（含 dormant 段改写） |
| `pnpm neg:interview` | 0 | additive 面或零改（双审裁） |
| `pnpm -C apps/web prove:public-copy` | 0 | §3.2-#5 翻转后全绿 |
| `pnpm privacy-erasure-preview:prove` | 0 | **邻接复核·断言一字不动**（0129 零改自证） |
| `pnpm prove:begin-guard-merge`（godfn-1c） | 0 | 邻接复核·仅 pin 行文字改·断言零触碰自证 |

### 5.2 断言列（主 proof · 六列口径）

| 列 | 断言 |
|----|------|
| **NEG** | 越权删（resume/interview/account）→404/401 不分叉不泄漏；未认证→401；interview 缺 Idempotency-Key→400；**软删后读面**：GET /resume 列表不含/GET profile 404/GET interview 列表不含（`interview_privacy_active` 滤）/guard 族 410 `interview_privacy_fenced`；注销后旧 Bearer→401 `account_inactive`、login→401 |
| FAULT | fence 事务中途失败→无部分态（无账本无状态翻转·事务原子性）；账户注销密码错→401 且零副作用 |
| BOUND | 同 Idempotency-Key 重放→同 requestId `replayed:true` 不重复建账；二次单删→202 同态不建第二账；并发双删恰一 winner（advisory lock 既有） |
| ADV | JWS 冒充 Bearer→401（P3 原值）；`x-privacy-authorization` 头不改变受理语义（P4 新义）；**注入/G7 面零触**（prompt/脱敏/围栏面零 diff 亲证） |
| **S1 不撒谎（核心）** | **物理行仍在**：软删后 admin 直查 `resume` 行 `status='erasure_fenced'` 且 `erasure_requested_at` 非空；interview 行仍在+fence 由账本行表达；`user_account` 行仍在 `status='disabled'`+`deleted_at` 非空；`purgePending===true` 在三端点响应在卷；list 收缩与物理行不变**双断言并列**（种子护栏 `before>0`·禁裸空真——NEGRESFIX B3 形） |
| **PERF/LOAD** | PERF：结构面不适用（无模型调用·标注）；LOAD **显式 blind**（Ban 借并发断言冒充） |

### 5.3 诚实失败路径

红名 EXIT1 保留·attempts 全录 `receipts/unstube-erase/attempt-ledger.txt`（沿 rag-03 形制）；Ban retry-to-green/Ban 删断言/Ban 弱化其余断言；EXIT1≠flake。零 live 零 Key（无模型面）；双 fresh（实现+post-prove 双审各复跑恰一次）。

### 5.4 EXIT0 ≠

主 CMD EXIT0 ≠ 物理清除完成（`purgePending:true` 恒真）≠ GAP-PRIV-02/03/04 CLOSED ≠ INT01 六门过 ≠ §4.2 闭合 ≠ P-04..07 UNSTUB-INV 行 CLOSED（行状态归 nail 期新口径登记）≠ covered flip ≠ HA ≠ `releaseEvidence=true` ≠ 生产删除 SLO。

## 6. Closing criteria + SSOT touch policy

| # | Closing criterion | Evidence class | Ban |
|---|-------------------|----------------|-----|
| CC-1 | 三端点+注销 202 软删受理·`mode:'logical'`+`purgePending:true` 类型钉死 | proof EXIT0 | Ban 200/Ban 完成态字段/Ban `productionSloClaimed` 漂移 |
| CC-2 | 软删后读面 404/不可见+处理面 410/409/谓词拒绝（§2.2 全表抽样） | proof 断言 | Ban 只断 HTTP 码不断行为面 |
| CC-3 | **物理行仍在**（S1 不撒谎）三轨在卷 | proof admin 直查 | Ban 把列表过滤当物理删除宣称 |
| CC-4 | 重放幂等（同键同 requestId/二次删同态） | proof | Ban 重复建账 |
| CC-5 | §3.2 #1-#6 全清单落地·pin 残留 grep=0 | 收据+grep | Ban 逐文件外顺带改·Ban 断言弱化 |
| CC-6 | 邻接证明全绿（preview/godfn-1c/neg:interview）断言 byte-intact | CMD+EXIT | Ban 触邻接断言 |
| CC-7 | 0129 预览面零 diff | git diff 亲证 | Ban 预览 202 改生产完成态 |
| CC-8 | SSOT（§3.1）仅 nail 期 additive | nail diff | 本刀 EXEC 期零触碰 |

## 7. Ban list

- 本 REQUEST 期：Ban coding · Ban prove · Ban push · Ban 产品码/迁移/proof 任何字节
- Ban 假可用残余：Ban 宣称物理清除完成/跨存储回执完成（`purgePending` 不得翻 false·S2 前）·Ban 把 202 写成无保留成功·Ban 预览回执面（0129）任何改写
- Ban 0060 立法回退：Ban 恢复 app_role 对 resume/resume_blob/resume_profile 的 DELETE·Ban trigger 放行扩大到 app_role 直写
- Ban 触 0091 issuer/JWS 签发面（S2 六门域）·Ban 触 worker 擦除执行器/外部 sink/Qdrant/向量面（S2）
- Ban 顺带翻 P-01/02/03（VOICE）/P-08（ROUTE-DICT）/P-10（COMMERCE）/P-11（OCR）/P-12（部署态）任一桩——**本刀只做删除族**
- Ban 触 UC-018/052/025/004/011/014/026/002/001/028/016/017 行为断言（§3.2-#6 仅 pin 行文字）
- Ban retry-to-green · Ban 把 EXIT1 洗成 flake · Ban secrets/.env · Ban MySQL/Qdrant 业务切流叙事 · Ban buy cloud · Ban Meridian · Ban force-push · Ban self-approve（alone ≠ dual）· Ban self-nail
- Ban 覆写 UNSTUB-INV @89e3575e 盘点原文（他线文件·引不改）

## 8. Non-claims

Not run · not built · not closed · not covered · not HA · not `releaseEvidence=true` · **软删 ≠ 物理清除完成**（purge_pending 恒真直至 S2 逐 sink 回执）· ≠ GAP-PRIV-02/03/04 CLOSED · ≠ INT01 六门过 · ≠ §4.2 闭合 · ≠ 生产删除 SLO · ≠ P-04..07 行翻 CLOSED（nail 期新口径登记）· ≠ 注销匿名化/同邮箱可重注册（S2）· ≠ issuer/JWS 已接线（S1 明确不接·授权根=PrincipalGuard）· ≠ 预览回执升格 · coveredCount=8 不变 · alone ≠ dual · pin supersession 未生效（dual BOTH PASS+meetwise 授权前）

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（**supersession 申报中·§3**） · g7SuiteGreen=false · actualSpendCny=null · r1Closed=false · STOP

*Harness · UNSTUB-ERASE · 2026-10-07 · draft:awaiting_pre_exec_dual · base 5e1e7fde · docs-only REQUEST · Ban coding · Ban prove · Ban push · 软删先行（EXTREV-7 铁律 1）· 物理清除禁宣称 · alone ≠ dual · STOP*

## rev2 范围重定（2026-10-10 · 席1 六处方全并 + 产品审计 D6 合规最低集瘦身·协调方落方）

**范围重定**：本刀收窄为 D6 最低集=①账户级删除接通②简历删除接通③注销（deactivate→发起账户级删除）——**interview-data DELETE 维持关闭**（审计批 4 原文「interview-data 的 DELETE 维持关闭」胜过 rev1 的三端点接线设计）；#242（隐私页移除「一份面试」删除预览入口·PreviewErasureForm 路径亲读重定位）并入本刀（从源头去掉误围栏触发点）。

**席1 六处方逐条并入**：
1. **R1 入口改指**：P-06 段整段作废（interview DELETE 关闭）——42501 入口风险随之消解；`interview_projection_begin_erasure` 仍作为账户级删除的面试面实现引用（0096:323/:450·0129 预览同形），dormant 断言按 4-target projection 形状，:118-122 ACL 子句原值保留。
2. **R2 账户注销吸收既有端点**：POST /profile/deactivate（profile.controller.ts:43-47·status='disabled'+evict）扩展=+密码复核+pwd_epoch+1+deleted_at+发起账户级删除（#236 语义）+UI 解锁——「UI 称未开放而端点已通」倒挂由本刀收口。
3. **R3 迁移面**：两迁移 0152/0153（0060 两处拦截同步放行：fenced :71-73+epoch 不可变 :65-67·app_role 直写仍钉死）；放行判别=current_user='privacy_api_owner' AND session_user<>privacy_api_owner（防 SET ROLE 伪造）·rollback down 面落卷·「全 additive」改「additive 列+新函数+trigger 修订」。
4. **R4 三读面补过滤**：profile.service.ts:63 growth()/privacy.service.ts:40 export() 第三查/memory-store.ts:50 historicalWeakDimensions 补 interview_privacy_active 过滤（app_role EXECUTE 已有）——账户级删除后成长档案/导出/弱项偏置零泄漏；quiz/diagnosis 派生读面=随账户删除（不单独过滤·D6 最低集裁定）。
5. **R5 pin 翻转集 30→39**：全清单闭卷（39 文件·含 gap-rag05-classifier.proof.ts:22+8 源文件注释）；privacy/page.tsx:57 句+public-copy :126/:127/:172 随账户/简历翻转同刀改；grep=0 断言按 39 清单域执行。
6. **R6 grep 口径**：CC-5 改「39 清单域 grep=0+清单外逐件排除理由登记」。
**prove 增补**：账户级删除默认 compose 推进 completed（审计批 4 验收）·growth/export/memory 弱项三面删除后不可见断言·deactivate 后登录拒绝。
Status: `draft_rev2:pre_exec_dual_FAIL_absorbed_and_rescoped`（席1 六处方全并+D6 重定范围·协调方裁定后 EXEC 授权·蓝本=本 rev2；原 rev1 的 interview DELETE 面作废归档）。
→ exec:EXEC 完成（mw-unstube-exec · 2026-10-07 · 蓝本=本 rev2 逐字）— commits `52cb6d8a`（impl·产品码+两迁移 0152/0153+proof 翻转+新主证 unstube-erase.proof 46 断言）+ `eb695d30`（#6 pin 翻转集 39 文件机械面·闭卷 grep=0）· §5.1 八键+邻接（preview 0129 byte-intact/godfn-1c/foundation PRES·neg:interview 零改）+ uc052×4/vector-plane/rag03×2/tenant-wiring-e5/domain/qdrant-ledger/gap-rag05/eval-harness/conn-stack 全 EXIT=0（prove-ledger.txt）· 账户级+简历删除推进 completed·三读面不可见·deactivate 登录拒·重放幂等·物理行仍在三轨在卷 · interview DELETE 维持 503 关闭 · 收据 receipts/unstube-erase/2026-10-07/ · est live=0 → awaiting_post_prove_dual

## rev2 nail 段（2026-10-10 · 回填席 mw-coordinator 落卷 · 前任回填席于 checklist 落卷前因磁盘事故中断·本席补卷 · docs-only+纯注释·零行为 SQL）

**落线四提交亲读核验**（主线 `feat/mysql-schema-skeleton`）：impl `f9383f76`（≡EXEC 记 `52cb6d8a`·32 文件 +1301/−104·两迁移+三端点翻真+deactivate+三读面过滤+文案退役+主证 46 断言）/ pin `c9200502`（≡`eb695d30`·实改 **38 文件** +82/−80 仅 pin 行）/ docs `217dde27`（EXEC 收据+状态行）/ chore `c47b5523`（席2 处方①·单文件）。四提交均 HEAD 祖先亲证；后续 `91c686d9`+`c51c792d`（trial-grant 刀）撞号回填 0152→`0154` 与本刀零冲突。

**双席 post-dual BOTH PASS**（记录号 `bd5f6ad0`/`1f85e170` 随磁盘事故未落本 repo·结论由协调方转交补录；本席逐项技术实证如下）：

| 席 | 裁定 | 三勘误/两处方与本 nail 履行 |
|----|------|------|
| 席1 | **PASS** | ①**38vs39 计数**：`c9200502` git stat 实改 38 文件，收据 §4 对表按 glob 算术编号至 39（uc-e2e-025 族 glob 展开恰 4 文件占 10-14 五号）——对表编号误差，清单覆盖无缺（闭卷 grep=0 在卷·本席复核仍=0）；②**.sql 4 token 未逐件登记**：`0125:16`/`0129:7`/`0137:24`/`0141:30` 四个历史迁移注释含旧 token（「公开 DELETE…503」形），EXEC 闭卷 grep 仅覆盖 `--include=*.ts --include=*.mjs` 故漏记——本 nail 补登记为**清单外排除件**（排除理由：已应用历史迁移 append-only 禁改·注释属立卷时点语境·0129 另有 CC-7 零 diff 钉·supersession 语义由本 nail SSOT 三件承载）；③**DEBUG 钩子中间态**：EXEC 调试期 `scripts/run-e2e-isolated.mjs` 遗留 `DEBUG_SHOW_PROOF` 临时钩子两行（E2E_PREMIGRATED 提前注入面） |
| 席2 | **PASS** | 处方①**DEBUG_SHOW_PROOF 钩子还原**：已由 `c47b5523` 落主线（本席 diff 亲证：两行删·还原 `if (target === 'api:validate') env.E2E_PREMIGRATED = '1';` 原形·现树与 `c47b5523` 一致零再触碰）；处方②**0152 头注 SET ROLE 表述修正**：`c47b5523` 未含（仅触 run-e2e-isolated.mjs 单文件）→ **本 nail 补落**（纯注释·零 SQL 语义·零行为 token）：原头注「direct connect **or SET ROLE forgery** → session_user='privacy_api_owner' → pinned」表述不实——SET ROLE 改 `current_user` 而永不改 `session_user`，成员伪造若可达将现 `current_user='privacy_api_owner' AND session_user=<login>` 恰似判别式放行路径；实际防线在上游=`privacy_api_owner` **NOLOGIN NOINHERIT（0048 亲证）+ 全库零成员授予**（`GRANT privacy_api_owner TO …` grep=0 亲证）→ `SET ROLE privacy_api_owner` 对一切会话 42501 不可达；`session_user` 子句实捕面=以 owner 角色直连（纵深防御）。头注三态表+trigger 函数体内注释两处同步修正，成员授予 ban 明文入注（0060 法延伸） |

**0152/0153 摘要**（`f9383f76` diff 亲读）：`0152_resume_soft_delete_fence.sql`=resume.erasure_requested_at 列 + privacy_begin_resume_soft_delete(p_owner,p_resume_id)（SECURITY DEFINER OWNER privacy_api_owner·FORCE RLS p_owner 租户域不放松·幂等键 sha256('resume_soft_delete':owner:id)·并发恰一 winner·23505→409）+ 0060 双拦截受审放行（trigger 转 SECURITY INVOKER·判别式见上·app_role 直写仍钉死 PRES002 自证·INSERT branch 全钉）+ down 面注释落卷；`0153_account_deletion_column.sql`=user_account.deleted_at + 弱一致 CHECK（deleted_at IS NULL OR status='disabled'）+ down 面。

**39 清单闭卷**：`grep -rn "DELETE=503|公开 DELETE|public DELETE" --include=*.ts --include=*.mjs apps packages scripts` = **0**（`grep-closure.txt` 空文件在卷·本席复核=0）；清单外排除件补登记=席1 勘误②四 .sql 历史迁移件（理由如上）。

**SSOT 三件落位**（rev2 §3.1 · 本 commit · additive·零改写原语义）：① `NORTH-STAR-EXECUTION-LOOP.md` §1 pins 代码块**原值零改**（抄写面不污染），块后 append superseded 注记（简历/账户轨 202+purgePending·interview-data 仍 503·四 SHA+授权链引用）；② `harness/privacy-erasure-http-503-pin.md` 头部 SUPERSCEEDED 注记（原文逐字保留·指向本刀+nail tip）+ §1.1 表 S1 改版标注（P5 已翻 202 形·P1/P2/P4/P7 interview 面仍真·P3/P6/P8/P9 原值）；③ `gap-bug-backlog.md` `:58` GAP-PRIV-02 行本体零改写 + append-only 登记注（行 P0 OPEN 维持·covered 仍归六门/S2·目标列原语义不动）。**检查器亲和亲证**：`eval-harness-matrix-cite.proof.mjs` mustPin 正则（`DELETE…503` 原文保留故仍命中·「本绿≠产品删除闭环」等未触）零破坏；`qdrant-store.g5-erasure.proof.ts` 对 503-pin 文档仅 existsSync 断言。

**Erratum 三件闭卷**：① 38vs39 计数（对表 glob 算术误差·非清单缺件·实改 38）；② .sql 4 token 历史迁移注释残留未逐件登记（本注补登记+排除理由）；③ DEBUG 钩子中间态（EXEC 调试遗留→席2 处方①→`c47b5523` 还原·现树亲证原形）。

**Non-claims**：软删 ≠ 物理清除完成（purgePending 恒真直至 S2 逐 sink 回执）· ≠ GAP-PRIV-02/03/04 CLOSED · ≠ INT01 六门过 · ≠ UC-052 flip（stays partial）· ≠ P-04..07 行翻 CLOSED（UNSTUB-INV @`89e3575e` 他线文件零触碰·引不改）· ≠ 注销匿名化/同邮箱可重注册（S2）· coveredCount=8 不变 · HA/releaseEvidence 不变 · 本 nail=docs+纯注释补卷·零产品码零行为 SQL·本落卷不洗白任何 EXIT1（无 prove 执行·est live=0）。

Status: `nail:post_dual_both_pass_ssot_landed`（2026-10-10 · mw-coordinator · 蓝本 rev2 @`40e31da9` · 主线四提交 `f9383f76`/`c9200502`/`217dde27`/`c47b5523` + 本 nail commit）

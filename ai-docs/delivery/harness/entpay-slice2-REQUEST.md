# B271 ENTERPRISE-PAY 片2 EXEC REQUEST — 扣费路由（S5-Slice-2·0157·任务书细化起草·docs-only 零码动）

**Status**: **`draft:awaiting_pre_exec_dual`**（片2 任务书细化起草·总档 §1.2 清单级 → 本档 file:line 级·docs-only 零码动 · **EXEC 前置=0-b 闸+协调方授权 双条款**（§8·缺一不得开工）· Ban self-approve · alone≠dual · 隔离库前置闸不过即停）
**Date**: 2026-10-10
**Base**: 主线 `feat/mysql-schema-skeleton` @`bcd3bfcf`（片1 merge `68e66f18` + 片1 nail `bcd3bfcf` 已落主线·本席 `git log`/`git merge-base` 亲证后 `--ff-only` 对齐 `line/enterprise-pay` 工作树 `meetwise-line-entpay`·本档全部行号 **@`bcd3bfcf` 实测亲读**）
**总档**: `ai-docs/delivery/harness/b271-entpay-REQUEST.md` §1.2 片2 S2-C1~C7（清单级授权面·本档=其细化·冲突时以总档为准·本档只增不弱·片级修订 append-only）
**前置状态（亲证 @`bcd3bfcf`）**: 0-a 片1 已落主线（0156 在树·片1 nail `slice1_nail:closed`）✅；0-b **现不满足**（B110 post-dual 双审收口在飞·裁决席未回·E4 口径）；0-c 隔离库预验证未跑（0157 零字节·`ls packages/db/migrations/` 亲证 max=0156）。
**Honesty**: 本档全部 file:line 为本席在 `bcd3bfcf` 实树逐文件亲读（禁臆测）；总档行号系 @`a03b9371` 实测，两 base 间漂移在 §3 全登记（interview.service +8·adaptive-lifecycle -3·jobs/actions 重排等）；上游审计文档不在本 base 实树（引文以总档誊录为准）；总档 §1.2 **无候选人知情同意面定义**（`grep 同意|知情|consent` 零命中·本席亲证）——授权链固化见 §0.2·如实登记不臆造。

---

## §0 立靶（片2 位置·授权链·跨主体边界）

### 0.1 片2 是什么

片1 已交付企业桶（kind='enterprise'）与充值（线上 CAS 入账 `payment.ts:65-105` + 对公三受控函数 0156:174-292）；**扣费侧仍是断链现状**：岗位面试 begin 一律 `reserveEntitlement(c, owner=候选人, …)`（`apps/api/src/modules/interview/interview.service.ts:312`·对 `application_id` 非空无分支）——候选人被扣、可重复扣（assessment_unavailable 重开→再 begin 再扣·`packages/db/src/recruiter.ts:371/:416` 拦截面）、全链零企业扣费路由。片2 = 修法②③④⑤（总档 §0.2 逐字授权面）：预留/确认/释放/对账改记 `job_application.recruiter_user_id` 的企业桶，候选人零扣，重试只扣企业一次，start+begin 合一。

### 0.2 授权链固化（跨主体扣费的"凭什么"·本席亲读固证）

**主体链**：0155 审批制已落（`gateway_require_active_recruiter` = approved 招聘方门·`packages/db/sql/23_api_gateway.sql:63`·0156:15 同认）→ **审核通过招聘方=企业付费主体**（片1 nail 复认）。
**指向链**：付费主体指向在**投递/邀请时刻**已固化——`job_application.recruiter_user_id text NOT NULL`（`packages/db/migrations/0005_job_application.sql:23`·写入点 `packages/db/src/recruiter.ts:142-143` applyToJob INSERT·冗余列设计「多方 RLS + 招聘方查，无需 join job_posting」原文注记）→ 片2 扣费路由的 payer 派生**零新跨表 join**：begin 事务内 `interview.application_id`（:185 已 SELECT）→ `job_application.recruiter_user_id` 单跳。
**候选人知情面（如实登记）**：总档 §1.2 无「候选人投递时知情同意」定义字段（`job_application` DDL 0005:20-31 无 consent 列·总档 grep 同意/知情/consent 零命中）；候选人的知情承载=**修法⑥ /jobs 文案「本场由企业支付，不消耗你的额度」**，总档已裁**归片3**（S3-C2）。⇒ 片2 EXEC 至片3 落地之间存在**文案知情窗**：候选人暂见「该岗位面试暂不可用，请联系招聘方」拒因（S2-C4·修法③候选人文案片2 即交付）而费用文案未上——**此为总档既定切片序的已知事实，本档登记不翻案**；片2 的零感知断言以「零扣费+零 402」为界（§7 Non-claims 同口径），「零感知」一词在 prove 面禁用（不可断言未交付的文案面）。

### 0.3 跨主体安全边界（最高优先·本刀的存在理由）

1. **RLS 面事实（E1 后权威口径）**：`entitlement_bucket`/`entitlement_consumption` 等**四表自仓初档即 ENABLE+FORCE RLS + p_owner**（`0001_baseline.sql:152-163` DO 块·`USING/WITH CHECK owner_user_id=current_setting('app.principal_user',true)`）——候选人 principal 会话内对企业桶（owner=招聘方）**SELECT/写皆零行零权**（RLS 拦·非应用层拦）。这是候选人零扣的结构性保证，也是片2 必须走受控 SECURITY DEFINER 函数的原因（总档修法②原文：「begin 在候选人 asPrincipal 下看不到企业桶，需受控 SECURITY DEFINER 函数」）。
2. **DEFINER 函数族纪律**：照 0156 对公三函数样板（`0156:174-198` 形制）——`LANGUAGE plpgsql`+`SECURITY DEFINER`+`SET search_path = pg_catalog, public` 逐字声明+具名具因 RAISE EXCEPTION+`admin_audit` 留痕面按需+REVOKE/GRANT 显式最小 EXECUTE（0156:318-326·照 `0041:139-161` 纪律）。**REVOKE 先于 GRANT、FROM PUBLIC/app_role/app_gateway_role 全列**。
3. **镜像承重墙（S1-C2 同款）**：0157 的一切 DDL/函数须同步 `packages/db/sql/` 镜像（consumption 列→`02_commerce.sql`；网关前缀函数→`23_api_gateway.sql`·0156 先例即落 23 号镜像）——neg-harness 直载镜像 `01-22`（`apps/api/test/_neg-harness.ts:65` 亲证），不落则片2 全部 neg/prove 不可执行。
4. **五(+一)件事预验证先行（§1.0-c）**：任何码面动工前隔离库全 PASS，任一 FAIL=STOP 手上报，Ban 带伤上码（审计原话局限兑现·总档 §1.2.0-c 逐字）。

---

## §1 范围（S2-C1~C7 file:line 固化·+S2-C8 追加）

### 1.0 强制前置闸（总档 §1.2.0 逐条承袭·0-b/0-c 现状如实）

- **0-a** 片1 已落主线且 prove 收口 —— ✅（0156 在树·`slice1_nail:closed`）。
- **0-b** B110 post-dual 双审 BOTH PASS+nail 收口（E4 口径：不得以「已落」替代双审）—— **现不满足·闸未开**。
- **0-c** 隔离库预验证 PASS（本地临时实例·零生产 DSN/零生产 Key/零凭据值落盘·E3 附款）——五件事（总档原文）+第⑥件（本档追加·只增不弱）：
  1. 新增受控 SECURITY DEFINER 预留函数在 app_role 上下文（候选人 principal 会话内调用）可对 RLS 企业桶写入；
  2. `entitlement_consumption` payer 列+幂等唯一约束在跨主体行上行为正确（总档判据原文：「owner=招聘方·key=interviewId 重放收敛单行」；两候补形状 D-1 **双测**·见下）；
  3. RLS 下候选人 principal **不可见**企业桶（SELECT 零行）；
  4. begin 现事务形状（advisory 锁 `interview.service.ts:184` + reserveEntitlement 抛→402 映射 `:310-317`）在 DEFINER 换路后**回滚语义不变**（预检抛/预留抛/入队抛任一点失败=整事务回滚零悬账）；
  5. S2-C3 owner 路由改企业后，对账 sweeper（`apps/worker/src/commerce-reconcile.ts:26-27/:46/:56`）的 owner 传参与 RLS 上下文重验证；
  6. **（本档追加）** 预留租约续约连续性：所选 D-1 形状下 `apps/worker/src/interview-consumer.ts:224`（主路）与 `:233`（心跳同拍）的 `renewReservationLease(c, owner, job.interviewId, …)` 在长面试全程**不因 owner 形状选择而断供**（活会话绝不被 sweeper 误扫·亲读锚：续约注释「活会话绝不被 commerce reconcile 当孤儿回收」:221-223）。

**D-1 设计决断点（消费行 owner 语义·两候补形状·预验证即裁决）**：总档存在两处表述——S2-C1「consumption 增 `payer_user_id`（NULL=C 端本人·非 NULL=企业单记招聘方）」与 0-c②「owner=招聘方·key=interviewId 重放收敛单行」。两形状：
- **形状甲**：消费行 `owner_user_id=候选人`+`payer_user_id=招聘方`——租约续约（interview-consumer :224/:233 以候选人 owner 续）零改；sweeper 枚举（`gatewayDispatchOwners`·interview-consumer :426）按候选人照旧；桶操作全走 DEFINER。**与 0-c② 字面（owner=招聘方）不符**。
- **形状乙**：消费行 `owner_user_id=招聘方`（=0-c② 字面）——租约续约/sweeper 判支/abandon 全链须同步换 owner 语境（interview-consumer :224/:233、commerce-reconcile :39/:46/:56、interview.service :526），worker 触面显著增大，且 interview 行（owner=候选人）在招聘方 RLS 语境不可见（`05_interview_jobs` p_owner owner-only）→ 面试终态操作仍须 DEFINER 或双语境。
**裁决规则（写死）**：EXEC 席在隔离库对两形状各跑 0-c①-⑥ 全判据，**取全 PASS 者写入 0157 头注**；两形状均不全 PASS ⇒ **STOP 手上报协调方**（Ban 择劣上码）。裁决记录+全量输出入 `ai-docs/delivery/receipts/enterprise-pay/slice2/preverify/`。

### 1.1 S2-C1~C7 逐条固化（现状=亲读 @`bcd3bfcf`·总档行号 @`a03b9371` 漂移见 §3）

| # | 码面 | 现状（亲读 file:line） | 目标（照单开工级） |
|---|---|---|---|
| S2-C1 | `packages/db/migrations/0157_billing_payer_route.sql`（新增·编号亲证 0156 已占·`ls` max=0156） | consumption 无 payer 维度（`0001_baseline.sql:109-124` DDL·幂等唯一键 `:122` `UNIQUE(owner_user_id,idempotency_key)`）；镜像 `02_commerce.sql:33-45` 同构无 payer；全仓 enterprise 扣费路由零命中 | consumption 增 `payer_user_id`（expand-only `ADD COLUMN IF NOT EXISTS`·NULL=C 端本人·非 NULL=企业单·形状按 D-1 裁决）；**受控 DEFINER 函数族**：`预留（企业路由）`/confirm/release/对账对偶（sweep 租约回收 payer 化）——形制逐条照 0156:174-198 样板（SECURITY DEFINER+SET search_path+具名拒绝 `insufficient_entitlement` 语义保留）；RLS **不重建**·在位 fail-closed 断言照 0156:55-72 同形；REVOKE/GRANT 照 0156:318-326；`SET LOCAL lock_timeout='2s'`+脏值检测 DO 块照 0156:34-45；**镜像同步承重墙**（§0.3-3）；kind='enterprise' 零再动（0156:52-53 已落） |
| S2-C2 | `apps/api/src/modules/interview/interview.service.ts` begin | `:179` `owner=requireOwnerUserId(principal,'interview.begin')`；`:182` `asPrincipal(owner,…)`；`:185` `SELECT status,resume_id,resume_privacy_epoch,application_id … FOR UPDATE`（application_id 已在读取面）；`:305` `application_id==null` 分支**已存在**（C 端 route 供给）；`:312` `reserveEntitlement(c, owner, id, 'mock_interview', 1.0)` **对岗位面试无分支=改造点**；`:314/:317` insufficient→402 映射；`:321` enqueueInterviewJob | `application_id` 非空 ⇒ 改调 S2-C1 DEFINER 预留函数（payer=`job_application.recruiter_user_id`·单跳派生见 §0.2）；`application_id` IS NULL ⇒ **C 端原路径逐字节零改**（:312 现行调用即 C 端唯一路径·Ban 触）；402 映射语义内移：企业不足不再映射候选人 402（分码见 S2-C4）·C 端 insufficient 402 映射 `:314/:317` 零改 |
| S2-C3 | worker 确认/释放/对账/租约·全调用面 | 确认：`apps/worker/src/adaptive-lifecycle.ts:435/:441` `completeInterviewAndConfirm(c, d.owner, d.interviewId)` ×2（总档锚 :438/:444 @a03b9371→本 base **-3 漂**·§3）；失败释放：`adaptive-lifecycle.ts:55` `failInterviewAndRelease(c, d.owner, …)`；对账 sweeper：`apps/worker/src/commerce-reconcile.ts:26` `asPrincipal(pool, owner)`·`:27` `reconcile(c, owner)`·`:39` `SELECT application_id` 判支·`:46` `failInterviewAndRelease`（B 端支）·`:56` `abandonInterviewAndRelease`（C 端支）；候选人 abandon：`interview.service.ts:511-535`（`:514` owner=候选人·`:526` `abandonInterviewAndRelease(c, owner, id)`——总档 rev2 E2 漏点二·**不同步改=0 行 no-op→企业预留泄漏**）；**租约续约（本档新固化·E2 清单外）**：`interview-consumer.ts:224`（主路）/`:233`（心跳）`renewReservationLease(c, owner, …)`·`:426` `gatewayDispatchOwners(pool,'interview')` 枚举 | B 端确认/释放经 payer 路由（按消费行 payer/D-1 形状结算企业桶·候选人桶零读写）；**abandon 释放路由同步改**（E2 漏点二兑现·防 reserved 悬挂）；sweeper `:46/:56` owner 语境按 D-1 裁决形状适配（0-c⑤）；租约续约按 D-1 形状适配（0-c⑥）；**C 端五调用点零触清点（E2 清单·本 base 复验同位）**：`quiz.service.ts:56`/`diagnosis.service.ts:59`/`resume.service.ts:98`（reserveEntitlement）·`quiz-lifecycle.ts:50`/`diagnosis-lifecycle.ts:55`（confirmConsumption）——五处 application_id 恒 NULL·Ban 触·零触断言入 §4-5 |
| S2-C4 | start 前企业额度预检+拒绝语义·#227 合一 | start=`packages/db/src/recruiter.ts:361-465` `startApplicationInterview`（`:371` completed/declined 拦·`:443-449` INSERT interview owner=候选人·`:450-457` CAS `status IN ('invited','assessment_unavailable')`→in_progress·`:459` snapshotInterviewRoute）；begin=`interview.service.ts:170-324` 独立事务；两跳现状 `apps/web/app/jobs/actions.ts:23`（start）→`:36`（begin）；#227 缺陷=begin 402 后申请悬停 in_progress 无预留 | **start+begin 服务端动作合一**（企业预留与申请状态迁移同一事务·修法⑤）：合一形状由 EXEC 席择一（a. applications.service.start 内联 begin 预留段·b. start 事务直调 begin 语义函数）——择型依据=0-c④ 回滚语义判据；**企业额度不足 ⇒ start 前拒绝**（DEFINER 预检读或预留抛前移·不产生 in_progress 空申请·`recruiter.ts:450-457` CAS 不触）；拒因分码：候选人见 `application_enterprise_pay_unavailable`（映射「该岗位面试暂不可用，请联系招聘方」）·招聘方面子码 `enterprise_insufficient_balance`（「企业额度不足，请充值」·招聘方触面卡片归片3·本片只交付 API 分码）——修法③ |
| S2-C5 | 重试路由 | `recruiter.ts:371` 只拦 completed/declined；`:416` assessment_unavailable+resume 绑定校验后允许新 attempt；`:444` `nextAttempt=…+1`；`:450-457` CAS 放行 → 再 begin 再扣候选人（现状扣候选人）；入口现状 `apps/web/app/jobs/page.tsx:128` `startable` 含 assessment_unavailable（「继续岗位面试」入口） | 重试（仅 evaluation_unscored 系统失败·预留已释放）新 attempt 预留**只扣企业 1 次**；幂等键=interviewId（`interview.service.ts:312` 第三参=id·uq `0001:122` 背书）——同 attempt 网络重放零重复扣（幂等断言入 §4-3）；「正常面完不再提供继续岗位面试」入口收敛**随 #218 另刀零字节**（本片只保证其重试若发生走企业桶） |
| S2-C6 | web 分码接线 | `apps/web/app/jobs/actions.ts:18` 注释「候选人用自己额度」（**已失实·随本刀改正**）；`:25` start 402→redirect `?error=interview_credits_unavailable`；`:38` begin 402 同跳；渲染点 `apps/web/app/jobs/page.tsx:59`；409 子码白名单 `apps/web/lib/jobs/application-start-error.ts` `APPLICATION_START_CONFLICT_SUBCLASSES`（四值） | actions 合一后新错误分码接线：`application_enterprise_pay_unavailable` 候选人面（入白名单+稳定消息）；现行 `interview_credits_unavailable` C 端 402 跳转**零改**（C 端 begin 402 语义保留）；`:18` 注释改「岗位面试=企业支付（片2 起）·练习面试=候选人额度」；费用文案（修法⑥）归片3 零字节 |
| S2-C7 | neg/e2e 断言面 | `apps/api/test/neg-interview.proof.ts:262-264` 现行 C 端无额度 402 用例（回归锚）；`neg-bend.proof.ts:26-28` 自灌 17/18/22 表先例；`_neg-harness.ts:65` sql 01-22 全量镜像载入；`neg-commerce.proof.ts`（84 断言=片1 终态基线） | §4 全断言落码：新 proof `apps/api/test/entpay-s2.proof.ts`（判据 1-4 落槽·具名见 §4）+既有三 neg 段回归；隔离 runner 注册照 role-input/report-retry 先例（`scripts/run-e2e-isolated.mjs` 新 target+白名单） |
| S2-C8（**追加·本席建议归本刀**） | 片1 席1 观2 遗留：pay CAS channel 守卫 | `packages/db/src/payment.ts:74-83` CAS **无 channel 过滤**——持 `PAY_PROVIDER_SECRET` 者技术可绕双人确认直置 offline 单 paid（片1 nail 亲证原文「无跨主体风险·当前信任根=平台自身」·裁决「归片2/片3」） | **建议归本刀（可裁撤项·pre-exec 双审终裁）**：CAS WHERE 增 `AND channel='online'`（`:77` 单谓词·choke 单点覆盖 `payCallback` commerce.service.ts:91 与 `payWebhook` :119 两调用点·两调用点零改）；对公确认 CAS（0156:227-235）零触；C 端零行为变化（channel DEFAULT 'online'·0156:75）；负例断言=offline 单持有效签名直调 payWebhook ⇒ 拒·订单滞 created·桶零入账（§4-6）。归本刀理由：绕过窗暴露最短+单谓词触碰面最小+与 §4-1 回归同证明面；若双审判归片3 亦不阻本刀其余项 |

---

## §2 非范围（承总档 §2 逐条·片2 视角复述）

1. #218 定性输出/状态区分/「继续岗位面试」入口收敛零字节（S2-C5 只管重试付费主体）；
2. #224 费用文案尾巴=S3-C2 片3（S2-C6 只接线分码不落文案字面）；
3. **C 端路径零触**：gift/trial/paid 个人桶全链+C 端五调用点（§1.1 S2-C3 清单）+C 端 begin/quiz/diagnosis/OCR 402 语义+pricing/billing 预览封闭——`application_id IS NULL` 分支逐字节不改面；
4. #229 退款产品化零字节（红冲过滤片1 已落·本片零触 `payment.ts:118-185`）；
5. 真实 PSP/对公到账自动化/开票回填（S3-C1）/招聘方企业余额挂件（片1 nail 席2 归片3）零触；
6. 迁移历史 0001-0156 零字节（checksum 守卫）；存量 job_application/interview 零回填；组织实体/多席位零建；
7. turbo/CI/CLAUDE.md/SSOT 台账零字节。

---

## §3 锚点亲读对账表（base `bcd3bfcf` 实测·总档 @`a03b9371` 漂±全登记）

| 锚 | 总档/审计行号 | 本 base 实测 | 漂 | 亲读内容 |
|---|---|---|---|---|
| interview.service.ts begin | :171,:174,:304,:307 | **:179,:182,:312,:314/:317** | **+8（consent-min 刀 #259 targetRole 段 :174-177 增行）** | owner 提取/asPrincipal/reserveEntitlement 无分支/402 映射 |
| interview.service.ts abandon | :511 | **:511-535**（:526 调用点） | 无（区块起点同） | abandonInterviewAndRelease(c, owner, id)·owner=候选人 |
| interview.service.ts application_id 分支 | （总档未单列） | **:185 读取·:305 分支** | — | `SELECT …application_id FOR UPDATE`·`if (application_id==null)` C 端供给分支已存在 |
| adaptive-lifecycle.ts confirm ×2 | :438,:444 | **:435,:441** | **-3（sse/resilience 后刀删 3 行）** | completeInterviewAndConfirm(c, d.owner, …) 双调用点·失败释放 :55 |
| commerce-reconcile.ts sweeper | :46,:56 | **:46,:56** | 无 | :26 asPrincipal(owner)·:27 reconcile·:39 判支·:46 fail+release·:56 abandon+release |
| recruiter.ts(db) start 拦截 | :371,:416 | **:371,:416** | 无 | completed/declined 拦·assessment_unavailable 绑定守卫 |
| recruiter.ts(db) INSERT interview | :446-448 | **:443-449**（INSERT :446-448） | 无（±1 语境） | owner_user_id=候选人（owner 变量=候选人 :362）·application_attempt :444 |
| job_application.recruiter_user_id | （DDL） | **0005:23**（写入 recruiter.ts:142-143） | — | text NOT NULL 冗余列·投递时刻固化 |
| 0001 consumption DDL/uq | :109-121 | **:109-124**（uq :122） | +3 | 无 payer 维度·UNIQUE(owner_user_id,idempotency_key) |
| 0001 RLS DO 块 | :152-163 | **:150-163**（GRANT :150·DO :152-163） | 无 | 四表 ENABLE+FORCE+p_owner（E1 权威口径） |
| payment.ts CAS/入账 | :60-93/:85 | **:65-105**（CAS :74-83·INSERT :95-97） | 片1 EXEC 后参数化形状 | markOrderPaidAndCredit(bucket 参数化)·**CAS 无 channel 过滤（席1 观2 面）** |
| commerce.service.ts pay 面 | :56-76 | **:84-124**（payCallback :84/:91·payWebhook :102/:119·bucketForOrder :78-82） | 片1 落线后重排 | HMAC fail-closed+gateway_payment_order_owner(:109)·两调用点共享同一 CAS |
| jobs/actions.ts | :22,:28,:40 | **:18,:25,:38** | 重排（sse/ensure-ok 刀） | 失实注释/start 402 跳/begin 402 跳 |
| jobs/page.tsx startable | :113 | **:128**（入口 :141·渲染 :59） | +15（多刀累积） | startable 含 assessment_unavailable |
| C 端五调用点（E2） | quiz:56/diag:59/ocr:98/ql:50/dl:55 | **同位全验证** | 无 | 五处 reserve/confirm owner=本人·application_id 恒 NULL |
| interview-consumer.ts 租约/枚举 | （总档未列·本档补） | **:224,:233,:426** | — | renewReservationLease 双路+gatewayDispatchOwners（0-c⑥ 依据） |
| _neg-harness 镜像载入 | （总档未列·本档补） | **:65** | — | sql 01-22 全量载入（0157 镜像=承重墙依据） |
| 0156 对公函数样板/ACL | —（片1 产物） | **:174-198 形制·:318-326 ACL·:52-53 kind·:55-72 RLS 断言·:34-45 脏检** | — | S2-C1 形制四样板全在片1 迁移内 |

---

## §4 prove（验收矩阵·全离线本地·est live=0·EXIT=0 一次过·Ban retry-to-green）

收据落 `ai-docs/delivery/receipts/enterprise-pay/slice2/`（EXIT 原值+断言 diff+preverify 全卷+sha256·入 git）。**判据→断言落槽具名**：

| # | 判据（总档 §4.2 承袭） | 断言落槽（具名） |
|---|---|---|
| 1 | **候选人零扣**：候选人额度 0 也能完成岗位面试（无 402）；前后候选人桶 `units_reserved/units_consumed` **不变** ∧ 企业桶 `units_consumed` **+1**（双断言） | `entpay-s2.proof.ts` 判据1 |
| 2 | **start 前拒**：企业额度 0 ⇒ start 被拒·**不产生 in_progress 空申请**（`recruiter.ts:450-457` CAS 零触断言）；候选人/招聘方两分码各见对应语义（分码断言） | `entpay-s2.proof.ts` 判据2 |
| 3 | **重试一次**：系统失败（evaluation_unscored）重试只扣企业 1 次；同 attempt 网络重放幂等键=interviewId 收敛单行（uq `0001:122`） | `entpay-s2.proof.ts` 判据3 |
| 4 | **RLS 纵深**：候选人 principal 下 SELECT 企业桶=0 行（0-c③ 生产复验）；候选人/他招聘方读不到对方企业扣费面 | `entpay-s2.proof.ts` 判据4 |
| 5 | **C 端回归（零触证明）**：`neg:interview`（:262-264 现行 402 用例保持）·`neg:commerce`（84 基线）·`neg:bend` 全绿·uc-e2e-011·C 端五调用点零 diff | apps/api 三 neg 段+worker `prove:interview` |
| 6 | **（S2-C8 若归本刀）** offline 单持有效签名直调 payWebhook/payCallback ⇒ 拒·订单滞 created·桶零入账；online 单回归零变化 | `entpay-s2.proof.ts` 判据5（或独立小 proof） |

停止条件（任一即停手上报）：锚点形状与本档 §1/§3 不符·需触 §2 范围外·est live>0·0-b 闸未开·0-c 任一件 FAIL·prove 红。

---

## §5 Ban（片2 补充·总档 §5 十条全量承袭）

1. Ban 无 0-c 六件全 PASS 直上任何 0157/路由码面（总档 §5.2 加严面：六件>五件·只增不弱）；
2. Ban D-1 两形状均未全 PASS 时择一上码（§1.0 裁决规则）；
3. Ban 触 C 端五调用点与 `application_id IS NULL` 分支任何字节（§2.3）；
4. Ban abandon/sweeper/租约续约三漏点漏改（E2+本档 0-c⑥——任一漏改=企业预留泄漏或活会话误扫）；
5. Ban 候选人 402 面残留：企业不足任何路径不得映射候选人 402（修法③·C 端本人不足的既有 402 零关）；
6. Ban DEFINER 函数面弱化：REVOKE 缺席/GRANT 超最小/search_path 省略/具名拒绝改泛 500——任一即 FAIL；
7. Ban「零感知」宣称（§0.2 知情窗·prove 面以零扣费断言为界）。

---

## §6 pins（十一值照抄总档 §6·零翻转）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（interview-data 行按 UNSTUB-ERASE supersession 现值照抄·interview-data 面仍 503 关闭·原值行代码块内零改） · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零模型外呼·零消耗）

---

## §7 Non-claims（片2 增补）

本刀 ≠ B 端付费上线 ≠ 「候选人知情同意已交付」（文案面归片3·§0.2 知情窗如实存在）≠ 企业扣费生产验证（隔离库 PASS≠生产·预览/生产差异另行）≠ sweeper/租约全异常谱系清零（prove 以 §4 判据为界）；「候选人零扣」以断言面为界（未列路径不构成无副作用声明）；D-1 裁决形状仅经隔离库验证（两形状均未验证前无权威形状）；存量已被扣候选人不退不溯（零回填）。

---

## §8 STOP

**STOP · `draft:awaiting_pre_exec_dual` · docs-only 零码动 · alone≠dual。** 本档为任务书细化起草：写完即停·零迁移·零码面·零 proof 文件。**片2 EXEC 双条款（缺一不得开工）**：①**EXEC 前置=0-b 闸**——B110 post-dual 双审 BOTH PASS+nail 收口（E4 口径·现不满足·在飞裁决席回卷前本刀闸不开）；②**协调方明示片2 EXEC 授权**——本档与总档均≠EXEC 授权·Ban self-approve。两条款满足后仍须：pre-exec 双审两外席 PASS（对本档+总档）→ 0-c 隔离库六件全 PASS（含 D-1 裁决落卷）→ 方可 EXEC。Ban retry-to-green；prove 红即停手上报协调方；片级修订 append-only。

---

*B271 ENTERPRISE-PAY 片2 EXEC REQUEST（细化起草） · 2026-10-10 · b271-slice2-draft 席 · base `feat/mysql-schema-skeleton` @`bcd3bfcf`（=line/enterprise-pay ff 对齐后同点） · 总档 §1.2 清单级→本档 file:line 级 · S2-C1~C7+追加 S2-C8（channel 守卫·建议归本刀·双审终裁） · 0157（编号亲证未占） · D-1 两形状预验证即裁决 · C 端五调用点零触 · markers=0 · est live=0 · pins 十一值零翻转 · ⛔push ⛔动主线仓 ⛔触其他工作树 · alone≠dual*

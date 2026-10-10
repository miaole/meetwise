# B271 ENTERPRISE-PAY EXEC REQUEST 总档 — #271 企业充值/企业付费刀（S5 按建议拆三片·P0 断链最后一刀·docs-only）

**Status**: **`draft_rev1:pre_exec`**（总档起草·docs-only 零码动·三片各自独立 REQUEST-EXEC-nail 循环·每片 EXEC 须预执行双审两外席 PASS + meetwise 明示授权 · **Ban self-approve** · **alone≠dual** · 片2 带强制隔离库前置闸（§1.2.0）·验证不过即停）
**Date**: 2026-10-10
**Base**: 主线 `feat/mysql-schema-skeleton` @`a03b9371` · 分支 `line/enterprise-pay`（工作树 `meetwise-line-entpay`·track origin/feat/mysql-schema-skeleton）
**蓝本**: 上游审计 #271 全条（`Meetwise产品审计-更正版/issues-master.md:190`·修法①-⑦ 逐字亲读誊录）+ fix-roadmap 第 3 批 #271 节（`fix-roadmap.md:104-115`）+ D4/D5 已决与渠道已决（`fix-roadmap.md:7-8,224,283-288`）——**审计文档不在本 base 实树**（上游事实源 `/Users/miaole/Documents/Meetwise产品审计-更正版/`·仓外路径·如实登记），引文逐字誊录；仓内锚点全部本 base 实树亲读（§3 漂±全登记）。
**Honesty**: 审计行号按本 base 实测逐一对账，漂移处 §3 如实登记（行号错=审席 FAIL）；蓝本引文逐字誊录；本档为**总档**——三片各自的细节修订在片级 EXEC 前 append（append-only·不改写已审段落）。

---

## §0 立靶

### 0.1 为什么是本刀：四断链的最后一条（P0 断链收口链）

审计定性的用户旅程断链族，前三条已收口或在飞，本刀是最后一条：

| 断链 | 状态（campaign-LEDGER @本 base 实读） | 本刀关系 |
|---|---|---|
| #228 C 端第一公里（新用户零额度源→signup 即 402） | TRIAL-GRANT ✅（迁移 0154 已落主线） | 已收口·C 端体验额度轨=本刀 **Ban 触面**（§5.1） |
| #40 评分事实链（评分卡恒空→报告/评估/成长全空） | S1 ✅ `fe412948`·S2 EXEC 已落（本 base tip `a03b9371` 即 S2 冲突解）·S3 收尾另刀 | 前置链·零依赖冲突 |
| #204 成长链（三区块恒空） | GROWTH-GEN 起草在派（`line/growth-gen`）·LEDGER:117「唯一零开工断链·今日立项」 | 平行刀·零依赖 |
| **#271 B 端付费链**（扣候选人·可重复扣·全仓无企业账户） | **❌ 零开工·LEDGER:64「最大单刀」·硬依赖 #110** | **本刀**·D5 已决企业付费 |

D5 已决（`fix-roadmap.md:224` 逐字）：「**已决（2026-10-09）：企业充值、企业付费（企业账户扣款，候选人不扣）。**」充值渠道已决（`:288` 逐字）：「线上支付，同时支持对公转账；对公转账需运营/财务人工确认入账，并收集开票信息。」#110 审核制已落主线（迁移 `0155_recruiter_approval_gate.sql` 实读：approve=「企业付费主体诞生时刻（#271 硬依赖挂点）」）→ **前置已就位，本刀可行**。现状直接违背已决付费规则且候选人每次重试被重复扣费（金钱路径缺陷，审计 P2→P1）。

### 0.2 审计 #271 原文（issues-master.md:190 逐字誊录·授权面）

- **定级/域**：#271 · P1 · 用例偏差 · B端-面试与结果。来源：由 #224 拆分（#224 留 /jobs 静默 402·#271 为付费主体与重试再扣）并吸收 #218 原「重试再预留额度」部分。
- **问题（锚点列从略·全列 §3）**：「B 端岗位面试扣的是候选人自己的额度（与 D5 已决"企业充值、企业付费、候选人不扣"相反），且可被重复扣：begin 预留的 owner 是候选人（recruiter.ts:446-448 面试归候选人，interview.service.ts:171,304 对岗位面试无分支），全仓没有企业账户/企业额度；面完即被 0082 收口为 assessment_unavailable，而 recruiter.ts:371 只拦 completed/declined，assessment_unavailable 允许重新 start（attempt+1）→ 再 begin 再预留 1.0，候选人被引导"继续岗位面试"重复付费」。
- **修法①-⑦（授权面逐字·摘干）**：
  ① **企业额度账户**：以审核通过的招聘方（#110）为持有人建企业额度桶（entitlement_bucket 增 kind 或新表）；企业充值=线上支付复用 createOrder（payment.ts:8-44）→ payWebhook（commerce.service.ts:56-76）→ markOrderPaidAndCredit 的 CAS（payment.ts:63-82），只把入账落桶 payment.ts:84-86 从写死 kind=paid 改为参数化落企业桶；对公转账订单停 created，admin 录入银行流水号与到账金额，经新增受控 SECURITY DEFINER 函数（照 gateway_admin_disable 0041:107-120：require_active_admin + 写 admin_audit）校验金额一致后以流水号作 provider_txn 复用同一 CAS 入账，金额不符拒绝转人工，建议录入与确认双人分离，逾期未到账置 failed；开票=企业开票资料（RLS 仅招聘方本人可读写）与开票申请（仅 paid 订单）；企业订单复用 markOrderRefunded 红冲（payment.ts:129-135）前须加桶类型过滤；开放招聘方企业充值页与企业商品（commerce.service.ts:11-14 现只有 C 端套餐）。
  ② **扣费路由**：application_id 非空的岗位面试，预留/确认/释放/对账改记到 job_application.recruiter_user_id 的企业桶（entitlement_consumption 增 payer 列；begin 在候选人 asPrincipal 下看不到企业桶，需受控 SECURITY DEFINER 函数），C 端路径不变。
  ③ **候选人零扣费**：岗位面试路径不读写候选人桶，企业额度不足时在 start 前拒绝（候选人见「该岗位面试暂不可用，请联系招聘方」，招聘方见「企业额度不足，请充值」），不出现候选人 402。
  ④ **重试**：正常面完（0082 hold）不再提供「继续岗位面试」（随 #218）；仅系统失败（evaluation_unscored，预留已释放）允许重试，重试扣企业 1 次，同一 attempt 网络重放不重复扣（现有幂等键=interviewId）。
  ⑤ **与 #227 合一**：企业预留放进 start 事务。
  ⑥ **文案**：/jobs「本场由企业支付，不消耗你的额度」。
  ⑦ **验收**：线上回调重放返回 already、企业桶只入账一次，同 provider_txn 指向另一单 409；对公确认前企业桶与订单状态不变，非 admin 确认被拒，金额不符被拒且不入账，同一流水号确认第二单 conflict，确认成功写 admin_audit（操作人、订单、流水号、金额），双人模式下录入人=确认人被拒；开票申请仅 paid 可提交，候选人与其他招聘方读不到企业订单与开票资料（RLS）。
- **审计自认局限（本刀前置闸的法律来源）**：「2026-10-09 用户决策更新：payment.ts 复用边界为读码结论，**企业入账/人工确认/开票方案未在隔离库验证**」——片2 跨主体扣费开工前必须先隔离库验证（§1.2.0）。

### 0.3 S5 拆三片（用户建议值·本档结构）

**片1 企业桶+充值 → 片2 扣费路由 → 片3 开票+收尾**；每片独立 REQUEST-EXEC-nail 循环（本总档=授权面·片级修订 append-only）；片间硬依赖：片2 前置=片1 已落线+#110 已落（0155✅）；片3 前置=片2 已落线（文案与开票验收依赖企业扣费在链）。

---

## §1 范围与三片切片表

### 1.0 形态裁决（先做·两处·EXEC 落码前钉死并登记）

| 裁决点 | ✅ 采用（推荐+理由） | ❌ 否决 |
|---|---|---|
| 企业桶形态 | **entitlement_bucket kind CHECK 增 `'enterprise'` 值**（同表·owner_user_id=审核通过招聘方 user id·到期沿 365 天惯例）：桶单表三 kind（gift/trial/paid）已同构，FIFO 预留/confirm/release/对账/容量约束（0001:94-121）全复用；审计①原文明列「增 kind 或新表」两可 | 新建独立企业账户表：reserve/confirm/release/对账全链重写，prove 面翻倍，违简化优先；且 #228 trial 已给「kind 扩值+同表」先例（0154） |
| 对公转账载体 | **payment_order 增 `channel` 列（`'online'｜'offline'`·DEFAULT 'online'·存量零回填）+ 侧表 `offline_remit_record`（order_id 唯一·bank_ref·amount_cents·entered_by/entered_at·confirmed_by/confirmed_at）**：录入/确认双记录天然支撑双人分离审计比对；银行流水号入账时作 provider_txn 走既有 CAS（0020:20-21 全局唯一防一笔流水入两单） | 只在 payment_order 上加散列：双人分离无载体（同一行改两列无从比对录入人≠确认人）；bank_ref 直接写 provider_txn 而无录入暂存：金额不符时无「拒绝入账、转人工」的中间态 |

### 1.1 片1 企业桶+充值（S5-Slice-1·独立 EXEC·迁移 0156 起）

**面**：企业额度账户 + 线上/对公充值 + 开票资料与申请（表+RLS+提交门）+ 企业商品 + 企业充值页。

| # | 码面 | 现状（亲读 @`a03b9371`） | 目标 |
|---|---|---|---|
| S1-C1 | `packages/db/migrations/0156_enterprise_bucket_billing.sql`（新增·编号=ls 亲证最小未占·expand-only·lock_timeout） | 最大号 0155（B110）；bucket kind CHECK 仅 `('gift','trial','paid')`（0001:95）；**entitlement_bucket 无任何 RLS**（全仓 grep 亲证：仅 GRANT 0001:150+0154 trial 部分索引·RLS 唯一命中=payment_order 0001:418） | kind CHECK 换约束增 `'enterprise'`（沿 0154 先例）；**企业桶 RLS**（`USING/WITH CHECK owner_user_id=current_setting('app.principal_user',true)`·FORCE·照 payment_order 0001:418-422 形——RLS 落地后全桶 owner 可见性收紧须逐面回归：app 层 reserve/confirm/refund 均经 `asPrincipal(owner)` 同 owner 通行·零破坏预期但片1 prove 全量回归桶链）；`channel` 列+`offline_remit_record` 表（§1.0 裁决）；`invoice_profile`（抬头/税号/地址电话/开户行账号/收票邮箱·recruiter 本人 RLS）+`invoice_request`（order_id 唯一·状态机 submitted→issued/rejected·**仅 paid 订单可 INSERT 的 CHECK/门**）；对公三受控函数（S1-C4）；REVOKE/GRANT 照 0041:139-161 纪律 |
| S1-C2 | `packages/db/sql/` 镜像（23_api_gateway.sql 等） | 现态镜像（0155 回填先例：源=真源·迁移=部署车） | 与 0156 同步——**承重墙**：neg-harness 直载镜像，不落则片1 prove 全不可执行（B110 §9.2 同型教训） |
| S1-C3 | `packages/db/src/payment.ts:85` | `"INSERT INTO entitlement_bucket(...) VALUES ($1,'paid',$2, now()+interval '365 days')"` 写死 kind/owner | 入账落桶参数化（bucket 形参：kind+owner 由订单 channel/商品类型派生·线上企业单落 `('enterprise', 下单招聘方)`）；createOrder（:8-44）与 CAS（:63-82）**原样复用零改** |
| S1-C4 | 0156 内对公三函数（照 `gateway_admin_disable` 0041:107-120 样板：`PERFORM gateway_require_active_admin()`+admin_audit INSERT 0019:7-16） | admin 无任何改单/入账函数（admin.service.ts:17-20 只读 `gateway_admin_orders()`） | `gateway_admin_offline_remit_entry`（录 bank_ref+到账金额·audit action='offline_remit_entry'）；`gateway_admin_offline_remit_confirm`（require_active_admin+金额==订单 amount_cents 校验·不符拒且不入账·**录入人==确认人拒**·以 bank_ref 作 provider_txn 复用同一 CAS·audit action='offline_remit_confirm' detail={order,bank_ref,amount,actor}）；`gateway_admin_offline_remit_fail`（逾期置 failed+audit） |
| S1-C5 | `packages/db/src/payment.ts:129-135` 红冲 | FIFO 扫 owner 全部桶无 kind 过滤（:131） | 企业订单红冲加桶类型过滤（只减 enterprise 桶·C 端桶零触）；`markOrderRefunded` 其余语义零改 |
| S1-C6 | `apps/api/src/modules/commerce/commerce.service.ts:11-14` | `PRODUCTS` 仅 `pack_10/pack_30` C 端 | 增企业套餐商品（enterprise 域 id·下单人须 approved recruiter·复用 createOrder 幂等）；webhook 入口 `payWebhook`（:56-76·HMAC fail-closed+`gateway_payment_order_owner` 0041:38-41）零改复用 |
| S1-C7 | `apps/api/src/modules/admin/admin.service.ts:17-20`+controller+`apps/web/app/admin/page.tsx` | 订单只读 | 对公录入/确认/置败三端点（AdminGuard+函数内 require_active_admin 双层照 B110 先例）+admin 台账卡片（remit 队列+audit 留痕可见） |
| S1-C8 | `apps/web/app/billing/actions.ts:4-7`+企业充值页 | `createOrderAction` 写死拒绝「预览环境未开放」 | 招聘方企业充值页（企业商品+线上下单/对公收款账户+备注订单号指引+开票资料维护+开票申请入口·仅 paid 单可提交）；C 端 pricing/billing 面零触（预览封闭语义对 C 端不变） |

### 1.2 片2 扣费路由（S5-Slice-2·独立 EXEC·迁移 0157 起）

**强制前置闸（§0.2 审计局限兑现·不满足不得 EXEC）**：
- **0-a**：片1 已落主线且 prove 收口；
- **0-b**：#110 已落（0155✅·本 base 已含）；
- **0-c**：**隔离库预验证 PASS**——临时隔离库实跑四件事：①新增受控 SECURITY DEFINER 预留函数在 app_role 上下文（候选人 principal 会话内调用）可对 RLS 企业桶写入；②`entitlement_consumption` payer 列+幂等唯一约束在跨主体行上行为正确（owner=招聘方·key=interviewId 重放收敛单行）；③RLS 下候选人 principal **不可见**企业桶（SELECT 零行）；④begin 现事务形状（advisory 锁+reserveEntitlement 抛→402 映射）在 DEFINER 换路后回滚语义不变。**验证脚本+输出入收据；任一 FAIL=STOP 手上报协调方，Ban 带伤上码**（审计原话：「跨主体扣费未经隔离库验证」）。

| # | 码面 | 现状（亲读） | 目标 |
|---|---|---|---|
| S2-C1 | `packages/db/migrations/0157_billing_payer_route.sql`（新增） | consumption 无 payer 维度（0001:109-121·唯一键 `(owner_user_id,idempotency_key)`）；全仓 enterprise/payer/billing_account 零命中（亲证） | consumption 增 `payer_user_id`（NULL=C 端本人·非 NULL=企业单记招聘方）；受控 DEFINER 函数族：`ent_reserve_for_application`（预留 recruiter 企业桶·不足抛 `insufficient_entitlement`）+confirm/release/对账对偶（对账租约回收 payer 化）·照 §1.2.0 预验证形 |
| S2-C2 | `apps/api/src/modules/interview/interview.service.ts:304` | `reserveEntitlement(c, owner, id, 'mock_interview', 1.0)` 对岗位面试无分支（:171 owner=候选人·:174 asPrincipal(owner)） | `application_id` 非空 → 改调 S2-C1 DEFINER 函数（记 payer=job_application.recruiter_user_id）；`application_id` IS NULL → **C 端原路径逐字节零改**（§5.1）；402 映射语义内移（企业不足不再映射候选人 402·见 S2-C4） |
| S2-C3 | `apps/worker/src/adaptive-lifecycle.ts:438,:444` + 失败释放路 | `completeInterviewAndConfirm(c, d.owner, …)` ×2（**审计锚 :359,:365 漂+79·S2 score-writer 落线文件增长·§3 登记**）·confirm 恒对 d.owner（候选人） | B 端确认/释放经 payer 路由（按 consumption 行 payer 结算企业桶·候选人桶零读写）；C 端 confirm 零触 |
| S2-C4 | start 前企业额度预检+拒绝语义（`recruiter.ts` start 链+`interview.service.ts:238-300`） | start 只置 in_progress（#227：begin 402 后申请悬停 in_progress 无预留） | **#227 合一**：start+begin 服务端动作合一，企业预留与申请状态迁移同一事务；企业额度不足 → start 前拒绝（不产生 in_progress 空申请）；候选人见「该岗位面试暂不可用，请联系招聘方」·招聘方见「企业额度不足，请充值」（修法③） |
| S2-C5 | 重试路由（`recruiter.ts:371,:416`+jobs 面） | :371 只拦 completed/declined；assessment_unavailable 可新 attempt（:416）→ 再 begin 再扣候选人 | 重试（仅 evaluation_unscored 系统失败·预留已释放）新 attempt 预留**只扣企业 1 次**；幂等键=interviewId（同 attempt 网络重放零重复扣·uq 约束背书）；「正常面完不再提供继续岗位面试」入口收敛**随 #218 另刀**（§2.1·本片只保证其重试若发生走企业桶） |
| S2-C6 | `apps/web/app/jobs/actions.ts:22,:28,:40`+page | :22 注释「候选人用自己额度」；:28/:40 两跳 402 redirect（**#224 静默 402 本体已第 0 批 #250 修·余量=文案**） | actions 合一后的新错误分码接线（企业不足面）；费用文案归片3（§1.3）；402→候选人可见语义按修法③ |
| S2-C7 | neg/e2e 断言面 | neg-bend/commerce/interview 现状断言 | §4.2 全断言落码（候选人零扣+企业桶扣+重试一次+RLS 不可见+C 端回归） |

### 1.3 片3 开票+收尾（S5-Slice-3·独立 EXEC·原则零迁移）

**面**：开票状态机收口 + 财务回填 + 收尾文案与全链验收。

| # | 码面 | 现状 | 目标 |
|---|---|---|---|
| S3-C1 | 开票申请 paid 门+财务回填 | 片1 已建表/RLS/提交门（S1-C1·提交端点出厂即带仅-paid 门——**禁半开门**） | 财务回填端点（admin：发票号/状态 issued·rejected+理由·audit 留痕照 0041:107-120 样板）+web 财务卡片；对公确认时付款户名 vs 开票抬头核对提示面（审计①） |
| S3-C2 | `apps/web/app/jobs/page.tsx` 文案 | 现展示「继续岗位面试」等（:110-133 区·含 #218 待另刀的入口问题） | **修法⑥**：/jobs 费用文案改「本场由企业支付，不消耗你的额度」；企业不足候选人文案与 S2-C4 一致 |
| S3-C3 | RLS/越权验收面 | — | 候选人与其他招聘方读不到企业订单与开票资料（RLS 断言）；开票申请仅 paid 可提交（负例断言） |
| S3-C4 | 全链收尾回归 | — | §4.3 全判据+三片合并回归（neg:all 桶/商业段+C 端 uc-e2e-011） |

---

## §2 非范围

1. **#218 定性输出另刀**（B-DELIVERABLE·🔒#40c·LEDGER:65）：能力画像/证据摘录/「已面完·待校准」与失败的状态区分、正常面完撤「继续岗位面试」入口——**全部零字节**（修法④前半随 #218；本刀只管重试的付费主体）。
2. **#224/#227 归片2（在范围内·非非范围）**：#227 start+begin 合一=S2-C4；#224 的 /jobs 静默 402 本体已第 0 批 #250 修，其费用文案尾巴=S3-C2——两号在本刀内**有归属地**，不外溢。
3. **C 端路径零触**：gift/trial/paid 个人桶逻辑（0154 trial 发放·C 端 begin/quiz/diagnosis/OCR reserve 链·C 端 pricing/billing 预览封闭）零字节；application_id IS NULL 分支为**逐字节不改面**。
4. **#229 退款产品化另刀**：本刀只交付红冲桶类型过滤（S1-C5·审计①硬前提），完整退款/红冲产品面零触。
5. **真实 PSP 对接零触**：线上支付复用现 HMAC 模拟渠道安全模型（PAY_PROVIDER_SECRET·fail-closed）——接真实支付网关另刀（§7 如实披露）。
6. **组织/多主体体系零建**：企业=审核通过招聘方本人（0155 主体），org 实体/角色/多席位零字节（#110 审计同认全仓无组织实体）。
7. **迁移历史零改**：0001-0155 零字节（migrate.ts checksum 守卫）；全部变更走 0156+ expand-only。
8. turbo/CI/CLAUDE.md/SSOT 台账零字节（SSOT 仅各片 nail 期由协调方授权触碰）；存量 job_application/interview 零回填（刀后新面试走企业扣费·存量已扣不退不溯·§7）。

---

## §3 锚点亲读对账表（base `a03b9371` 实测·漂±全登记）

| 审计锚 | 实测 | 内容（亲读） | 漂 |
|---|---|---|---|
| `recruiter.ts:446-448` | :446-448 无漂 | :446 `INSERT INTO interview(id,owner_user_id,…)` —岗位面试 owner=候选人；:454-460 申请 CAS `status IN ('invited','assessment_unavailable')` 允许重开 | 无 |
| `interview.service.ts:171,304` | :171,:174,:304 | :171 `owner=requireOwnerUserId(principal,'interview.begin')`；:174 `asPrincipal(owner,…)`；:304 `reserveEntitlement(c,owner,id,'mock_interview',1.0)` 对 application_id 非空无分支；:307 insufficient→402 映射 | 无 |
| `adaptive-lifecycle.ts:359,365` | **:438,:444** | `completeInterviewAndConfirm(c, d.owner, d.interviewId)` 两处（unscored=0&&eligible>0 完成确认 / no_eligible_score 路径）——S2 score-writer 落线后文件增长，审计行现落 SCOR-02 注释区 | **+79 漂·如实登记**（形状未变·双调用点仍是本刀 S2-C3 面） |
| `0001_baseline.sql:93-96` | :94-96 | bucket DDL：`kind text CHECK (kind IN ('gift','trial','paid'))` 无 enterprise；`owner_user_id` 单主体；consumption :109-121 唯一键 `(owner_user_id,idempotency_key)` 无 payer | 无（DDL :94 起·±1） |
| `payment.ts:8-44` | :8-44 无漂 | createOrder 幂等：owner+idempotency_key ON CONFLICT·幂等键绑定 productId/amount/units 三项 | 无 |
| `payment.ts:63-82` | :60-93 | markOrderPaidAndCredit：SAVEPOINT+23505→conflict；CAS `created→paid WHERE NOT EXISTS 同 provider_txn`；:85 入账 INSERT 写死 `'paid'`/365 天/落 owner 个人池；:89-93 already/conflict 判定 | 边界±3 如实（函数 :60 起） |
| `payment.ts:129-135` | :129-135 | markOrderRefunded 红冲 FIFO 扫 owner 全桶**无 kind 过滤**（:131 FROM entitlement_bucket） | 无 |
| `commerce.service.ts:11-14` | :11-14 | PRODUCTS 仅 pack_10/pack_30（C 端） | 无 |
| `billing/actions.ts:4-7` | :4-7 | createOrderAction 写死拒绝 | 无 |
| `0041:107-120` | :107-120 无漂 | gateway_admin_disable：require_active_admin+UPDATE+admin_audit INSERT（actor/action/target）——对公函数样板 | 无 |
| `0041:38-41` | :38-41 | gateway_payment_order_owner（SECURITY DEFINER owner 解析·webhook 信任根） | 无 |
| `0019:7-14` | :7-16 | admin_audit 表（id/actor/action/target/detail jsonb） | ±2 如实 |
| `0020:20-21` | :20-21 | `uq_payment_order_provider_txn` partial UNIQUE（provider_txn 全局唯一） | 无 |
| `commerce-webhook.controller.ts:12-16` | :12-16 | POST pay/:id 无登录态 webhook | 无 |
| `admin.service.ts:17-20` | :17-20 | orders() 只读 gateway_admin_orders()——admin 无改单面 | 无 |
| `commerce.ts:59-65,163-165` | :59-65,:163 | reserveEntitlement FIFO 只扫 `owner_user_id=$1` 桶；:163 completeInterviewAndConfirm→confirmConsumption(c,owner,interviewId,1) | 无 |
| `recruiter.ts:371,412-417` | :371,:416 | :371 只拦 completed/declined；:416 assessment_unavailable+resume 绑定校验后允许新 attempt | 无（:416 为绑定守卫·:412-415 注释） |
| `0082_b_side_score_calibration_hold.sql:9-25` | :9-25 | finalize_bound…触发器：completed→job_application 收口 assessment_unavailable | 无 |
| `jobs/actions.ts:22-24,39` | :22,:28,:40 | :22 注释「候选人用自己额度」；:28 start 402 redirect；:40 begin 402 redirect | ±1（:39→:40） |
| `jobs/page.tsx:110-112,132` | :110-113,:125-133 | :110-112 评注（scoreless 终态/重试语义）；:113 `startable` 含 assessment_unavailable（「继续岗位面试」入口） | ±1-3 |
| `interview.service.ts:238-300`（#227） | :238-300 | begin 绑定更新与 start 分离（start=recruiter.ts 起·begin=interview.service 起）·两次独立调用 | 无 |
| `0001:409,420-422` | :409,:418-422 | payment_order RLS p_owner（USING/WITH CHECK app.principal_user）·FORCE——**全仓唯一桶域 RLS 先例** | ±1 |
| 0155（主线现状·前置） | 全文件 | B110 审批门已落：approval_status+approve/reject+admin_audit；「approve=企业付费主体诞生时刻（#271 硬依赖挂点）」 | 前置✅ |

旁证（同 base 亲读）：迁移最大号 **0155** → 新迁移 **0156 起**（历史双 0152/双 0143 并存=已知·B110 §9.2 同款事实）；`entitlement_bucket` 无 RLS（grep 全 migrations 仅 0001:150 GRANT+0154 部分索引）；`git grep -li "organization|enterprise|payer|billing_account"` 于 apps/packages 非测试=**零命中**；`invoice|发票|开票|tax_id` 仅两命中=纯文案/注释（billing/page.tsx:20·0155 头注释）——与审计「零字段」同认；webhook 安全模型=HMAC 绑订单+txn·密钥缺失 fail-closed（commerce.service.ts:56-63 亲读）。

---

## §4 prove（每片判据·全离线本地·est live=0·EXIT=0 一次过·Ban retry-to-green）

### 4.1 片1（充值面·审计⑦前半）
1. **线上幂等**：回调重放返回 `already`·企业桶只入账一次；同 provider_txn 指向另一单 → `conflict`→409（复用 CAS 语义回归）。
2. **对公防重+门**：确认前企业桶与订单状态不变；非 admin 调确认被拒（guard+函数双层）；金额不符被拒且不入账；同一银行流水号确认第二单 → conflict；确认成功写 admin_audit（操作人/订单/流水号/金额四元断言）；**录入人=确认人被拒**（双人分离）。
3. **红冲过滤**：企业订单退款只减 enterprise 桶（C 端桶 units 前后相等断言）。
4. **开票门+RLS**：invoice_profile 仅本人读写（他招聘方/候选人 SELECT 零行）；invoice_request 仅 paid 订单可提交（created/refunded 负例拒绝）。
5. **零弱化回归**：C 端 paid 单入账/红冲语义回归绿；neg:commerce 段全绿。

### 4.2 片2（扣费路由·审计⑦中段+fix-roadmap:115）
1. **候选人零扣**：候选人额度为 0 也能完成岗位面试（不 402）；前后候选人 bucket units_reserved/units_consumed 不变、企业桶 consumed +1（**双断言**）。
2. **start 前拒**：企业额度 0 → start 被拒、不产生 in_progress 申请；候选人/招聘方各见对应文案（分码断言）。
3. **重试一次**：系统失败（evaluation_unscored）重试只扣企业 1 次；同 attempt 网络重放不重复扣（幂等键=interviewId 断言）。
4. **RLS 纵深**：候选人 principal 下 SELECT 企业桶=0 行（隔离库预验证③的生产复验）。
5. **C 端回归**：C 端 begin 与 uc-e2e-011 通过（零触证明）；neg:all 桶/商业/面试段绿（预存红按既有对账登记·不 retry-to-green）。

### 4.3 片3（开票+收尾·审计⑦尾）
1. 开票申请仅 paid 可提交（负例复验）；财务回填后状态 issued+发票号可见（本人视点）·audit 留痕。
2. 候选人与其他招聘方读不到企业订单与开票资料（RLS 断言）。
3. /jobs 文案=「本场由企业支付，不消耗你的额度」（字面断言）。
4. 三片合并回归：修法①-⑦逐条对账表+全链 prove 收据。

收据各片落 `ai-docs/delivery/receipts/b271-entpay-sliceN/`（EXIT 原值+断言 diff+隔离库验证卷+sha256·入 git）；**验证不过即停手上报**（停止条件：锚点形状不符/需触范围外/est live>0/片2 前置闸 FAIL）。

---

## §5 Ban（全列）

1. **Ban 动 C 端桶逻辑**：gift/trial/paid 个人桶（含 0154 trial 发放·C 端四消费面）零字节；application_id IS NULL 分支逐字节不改（§2.3）。
2. **Ban 无验证直上跨主体扣费**：片2 前置闸 §1.2.0-c 隔离库验证不过即停·Ban 带伤上码·Ban「先上后补验」。
3. **Ban Key name-only**：PAY_PROVIDER_SECRET 等零凭据值落盘；staged 过 secret gate。
4. **Ban 改历史迁移**：0001-0155 零字节（checksum 守卫）；0156+ expand-only·lock_timeout。
5. **Ban #218 蔓延**：定性输出/状态区分/入口收敛零字节（§2.1）。
6. **Ban #229 蔓延**：退款产品化零字节（只许 S1-C5 过滤一处）。
7. **Ban 弱化**：HMAC fail-closed/CAS exactly-once/admin 双层/RLS FORCE 语义只增不弱；幂等键与 provider_txn 唯一性零松。
8. **Ban 虚称**：不称「已接真实支付」「自动到账」「税务合规完成」（§7）；pins 十一值零翻转。
9. **Ban 冲突标记**：push 前 `grep '^<<<<<<< $|^=======$|^>>>>>>> '` 全仓=0。
10. **Ban self-approve · Ban retry-to-green**：每片双审两外席·作者≠审者·跨席互审。

---

## §6 pins（十一值照抄·零翻转）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（**interview-data 行按 UNSTUB-ERASE supersession 现值照抄**：`NORTH-STAR-EXECUTION-LOOP.md:46` 注记——简历/账户轨=202 软删受理·purgePending=true 恒真直至 S2 逐 sink 回执·物理清除完成禁宣称；**interview-data 面仍 503 关闭**·原值行代码块内零改） · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零模型外呼·零消耗）

---

## §7 Non-claims

**本刀 ≠ 真实支付上线 ≠ B 端上线 ≠ 金钱路径合规声明**。线上支付=现 HMAC 模拟渠道同形复用（真实 PSP/商户号/结算对账另刀）；对公转账=人工确认入账台账（**非自动到账**·双人分离为流程约束≠组织级权限系统）；开票=资料采集+申请+回填台账（**非税务合规声明**·线下开票责任面归财务/法务）；企业桶=招聘方个人主体持有（0155 审批主体·**非法人实体核验**）；红冲过滤≠退款产品化（#229 另刀）；存量已被扣候选人不退不溯（零回填·如实披露）；片2 隔离库验证 PASS ≠ 生产验证（预览/生产差异面另行）；「候选人零扣」以 prove 断言面为界（未列路径不构成无副作用声明）；审计行号 @`a03b9371` 实测·后续 base 漂移须重对账（adaptive-lifecycle +79 已示范）；审计「未在隔离库验证」局限由 §1.2.0 兑现后才解除；批 3 验收全量以 fix-roadmap 第 3 批验收节（:115）为准，三片全收口前不满足。

---

## §8 STOP

**STOP · `draft_rev1:pre_exec` · docs-only · alone≠dual。** 本档写完即停零码动；三片各自独立 REQUEST-EXEC-nail 循环，每片 EXEC 须预执行双审两外席 PASS + meetwise 明示授权方可行使（本总档≠任何一片的 EXEC 授权）；片2 另受 §1.2.0 三前置闸（片1 落线+#110+隔离库验证）约束，**验证不过即停**；Ban self-approve；Ban retry-to-green；prove 红即停手上报协调方。片级修订 append-only（不改写已审段落·片号小节追加）。

---

*B271 ENTERPRISE-PAY EXEC REQUEST 总档 · 2026-10-10 · draft_rev1:pre_exec · base `feat/mysql-schema-skeleton` @`a03b9371` · 分支 `line/enterprise-pay` · 蓝本=上游审计 #271（issues-master.md:190 修法①-⑦）+ fix-roadmap 批3 #271 节+D5/渠道已决 · 三片=企业桶+充值（0156）/扣费路由（0157·隔离库前置闸）/开票+收尾 · 形态裁决=kind 增 enterprise+offline_remit_record 侧表（§1.0）· C 端零触·Ban 无验证直上跨主体扣费·Key name-only·pins 十一值零翻转 · Dual PASS ≠ 开工 · alone≠dual*

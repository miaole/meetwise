# B271 ENTPAY 片3 打磨刀（I1 组 · 批3 残留 · S 体量 · EXEC REQUEST 起草）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席 `s3-draft` · docs-only 零码动 · Ban self-approve · alone≠dual · 待预执行双审两外席 PASS + meetwise 明示授权后才派 EXEC coding · Dual PASS ≠ 开工）
**Date**: 2026-10-10
**审计项**: 蓝本 `batch-residual-plan.md:107` I1 行＝**ENTPAY-片3 打磨刀**（#271 残面·S 体量·「以登记卷为范围蓝本·不重开七修法」）· 上游授权面=`b271-entpay-REQUEST.md`（主线 nail @`df12a054`）：§1.3 片3 段（:95-104）+ 片1 nail 随卷勘误与归档（:291 ①②③）+ 片2 nail 片3 登记（:309）
**Base**: 主线 `feat/mysql-schema-skeleton` @`9f6edf8f`（主线最新 tip·HA-1 nail 后）· 分支 `line/entpay-slice3`（工作树 `meetwise-s3d`·新建）
**拟用迁移号**: **0159**（`TASK-SOP-v2.md:16` 开工即 claim·先登记者胜；现最大号 0158_score_card_insert_guard.sql 亲证已占·仅 §1 P2 首选形需要——若双审裁 P2 备选形则本刀零迁移·0159 释放回注）
**蓝本可及性注记**: `batch-residual-plan.md` 不在本 base 实树（`line/batch1-residual` @`ab02d499` 独支·读取来源=工作树 `meetwise-line-entpay`）；`b271-entpay-REQUEST.md` 在本 base 实树亲读（nail 链 @`bcd3bfcf`/`@f632e289`/`@df12a054` 全在 tip 祖先·`git log` 亲证）。全部代码锚行号=本席实树 @`9f6edf8f` 亲读（EXEC 立项照例重 pin）。
**Honesty**: 六条清单=协调方批3 派单给定·本席逐条亲读实树后**如实固化**（含一条**蓝本勘误**：派单①前提「G4 已落 application_enterprise_pay_unavailable·本刀补渲染面」与实树 blame 不符——见 §0 勘误·渲染链实为片2 S2-C4/C6 已全落·本刀只余修法⑥文案+招聘方卡片触面两处真缺口）；零实跑零 prove（本刀=REQUEST 起草·prove 判据见 §4 待 EXEC 兑现）；est live=0（全部六条零模型外呼·纯渲染/只读/注释/归档面）。

---

## §0 立靶与蓝本勘误

### 0.1 现状一句话

#271 片1（企业桶+充值 @`68e66f18`）+片2（扣费路由 @`f632e289`）已 nail 双审 BOTH PASS、#271 全通、P0 四链全通（b271 REQUEST:309-311）；片3=登记在案的**后继打磨刀·非闭环阻塞**（:309）——候选人文案知情窗/招聘方产品打磨/channel 观察归档/片1 双审观察收尾。本刀把六条打磨项落完。

### 0.2 蓝本勘误（派单①前提 vs 实树 blame·如实登记·交双审核对）

| 派单前提 | 实树亲证 @`9f6edf8f` | 判定 |
|---|---|---|
| 「G4 已落 `application_enterprise_pay_unavailable`——本刀补渲染面」 | `git blame` 亲证四锚全为 **entpay-slice2-exec `5ff5f96d`**（非 G4 `b70d7d81`·G4 仅触 action-error.ts:47 常量补 export）：①API 402 分码=`apps/api/src/modules/jobs/applications.service.ts:8-11,:59-61`（S2-C4·`enterprise_insufficient_balance`→候选人 `application_enterprise_pay_unavailable` 402）；②分码注册表+文案单源=`apps/web/lib/jobs/application-start-error.ts:16-23`（:22 文案「该岗位面试暂不可用，请联系招聘方」）；③jobs 页域映射=`apps/web/lib/errors/action-error.ts:76-77,:101-102`（S2-C6）；④渲染消费面=`apps/web/app/jobs/page.tsx:59-72`（errmsg 刀 `b004033bc` 既有 #224 渲染块·`actionErrorMessage('jobs',0,error)` 已接新码）·写入面=`apps/web/app/jobs/actions.ts:25-30`（402 redirect 携码） | **修法③候选人文案渲染链已由片2 全数落线**——本刀对该链**零新码面**，只做验收复验（§4-1）；片3 文案族真缺口=修法⑥ /jobs 费用文案（`application-start-error.ts:19`+`action-error.ts:101` 两处「归片3」明文）+ `enterprise_insufficient_balance` 招聘方卡片触面（`applications.service.ts:9`「卡片触面归片3」明文·G3 REQUEST `g3-begin-guard-REQUEST.md:41` 显式归 I1 组）——本刀 P1 兑付 |

### 0.3 六条清单固化（派单原文→本刀条目映射）

| 派单条 | 本刀条目 | 性质 |
|---|---|---|
| ①修法③候选人文案（渲染面） | **P1**（§0.2 勘误后收窄：③链复验零码 + 修法⑥文案 P1-a + 招聘方卡片触面 P1-b） | 渲染/文案 |
| ②招聘方自服对公订单状态列表（created→entered→confirmed） | **P2** | 只读产品面（含一枚条件迁移） |
| ③企业余额挂件（availableUnits 展示） | **P3** | 只读挂件 |
| ④开票申请 paid 单下拉（替代手填订单号） | **P4** | 只读+表单替换 |
| ⑤pay CAS channel='online' 守卫（片1 席1 观察2·只增不弱） | **P5** | 归档闭环·零新码（守卫片2 S2-C8 已落·blame 亲证） |
| ⑥p_user_account_self 注释更正（片1 勘误①一行） | **P6** | 纯注释一行（含勘误之勘误·待双审裁定） |

---

## §1 范围（六条 · EXEC 依此实现 · 现状全锚 @`9f6edf8f` 亲读）

### P1 文案知情窗收尾（修法⑥ + 招聘方卡片触面 · 修法③链复验零码）

**现状（亲读）**：
- 修法③候选人链：§0.2 四锚（已全落·片2）。
- 修法⑥缺口明文：`application-start-error.ts:19`「费用文案（修法⑥「本场由企业支付」）归片3·本文件零含」+`action-error.ts:101`「费用文案（修法⑥）归片3」。
- /jobs 现状：`apps/web/app/jobs/page.tsx:114-118`（我的投递卡头）·`:126-128`（startable 判定注释与三态）·`:141-157`（开始/继续按钮区·:148 文案「开始面试」/「继续岗位面试」）——**零企业支付告知**。
- 招聘方卡片现状：`apps/web/app/recruiter/jobs/[id]/applications/[applicationId]/page.tsx:101-133`（申请状态卡 dl 四行：候选人/来源/状态/评估）——**零企业支付语境·零额度不足指引**。

**目标（EXEC 依此实现）**：
1. **P1-a 修法⑥字面落位**：/jobs 我的投递卡 startable 岗位行补静态费用知情行，文案**逐字**=`本场由企业支付，不消耗你的额度`（b271 REQUEST:44 修法⑥原文·:102 S3-C2·§4.3-3 判据同文）。落点建议=按钮邻位（:148 SubmitButton 同行或其下 text-xs 行）·EXEC 择位不改文案。
2. **P1-b 招聘方卡片触面**：申请状态卡（:105-133 CardContent）补一行企业支付知情+指引（文案提案·双审可微调）：「候选人开始本场面试由贵司企业额度支付；额度不足时候选人将无法开始」+「企业额度不足，请充值」链接 → `/recruiter/billing`（修法③招聘方半句「企业额度不足，请充值」=b271 REQUEST:41/:90 明文）。**静态知情行·零新 API 零查询**——失败 start 事务整体回滚无持久信号（`applications.service.ts:49-52` 亲读），卡片**不假装知道实时余额**（如实措辞·非状态位渲染）。〖rev2-裁定⑤→§9-2：「企业额度不足，请充值」逐字保留·措辞微调不放大·/recruiter/billing 目标面已存在（落卷席亲证 `apps/web/app/recruiter/billing/page.tsx` 在树）〗
3. **修法③链零码复验**：P1 改动不得触碰 §0.2 四锚任何一行（既有文案/映射/redirect 零字节）。

### P2 招聘方自服对公订单状态列表（created→entered→confirmed）

**现状（亲读）**：
- 无任何本人订单列表端点：`apps/api/src/modules/commerce/commerce.controller.ts` 仅 `@Get('orders/:id')`（:41）·`@Get('entitlement')`（:47）·开票三口（:54-76）。
- 对公可见性现状只在 admin 面：`apps/api/src/modules/admin/admin.controller.ts:51-69`（offline-remits 四口）+`apps/web/app/admin/page.tsx:190-243`（RemitsSection·admin 专用）。
- `offline_remit_record` **零 GRANT**（`packages/db/migrations/0156_enterprise_bucket_billing.sql:80-83` 访问纪律「不授 app_role 任何表权限」·表 DDL :84-96·status 机 entered→confirmed|failed :95）→ 招聘方 principal 会话内不可直读，**无法区分 created 与 entered**；`payment_order` 有 GRANT+RLS（`0001_baseline.sql:415` GRANT SELECT·:416-421 p_owner FORCE）但只有 created/paid/failed/refunded 四态（:410）。

**目标（EXEC 依此实现·形制待双审裁定）**：
- **首选形（本席推荐·需 0159）**：0159 新增受控 SECURITY DEFINER 读函数 `gateway_entpay_my_offline_orders()`——照 `gateway_admin_offline_remit_queue`（0156:295-317）同形，**去 admin 门·改本人行作用域**（`payment_order.owner_user_id = current_setting('app.principal_user', true)`）·LEFT JOIN offline_remit_record 派生三态（无 remit 行=created·remit status entered=entered·confirmed=confirmed·failed=failed）·REVOKE/GRANT 照 0156:318-326 纪律（REVOKE ALL FROM PUBLIC,app_role,app_gateway_role + GRANT EXECUTE TO app_role）·**镜像 `packages/db/sql/11_commerce.sql` 同步**（承重墙·neg:commerce 直载镜像·S1-C2 同款教训·镜像现态 :3-5/:14/:42/:55 亲证已含 0156 面）。新端点 `GET /commerce/offline-orders`（PrincipalGuard+`APPROVED_RECRUITER_SQL` 门复用·`commerce.service.ts:28-30,:213-218` 既有谓词）·contracts 注册（`packages/contracts/src/index.ts:1204-1210` commerce registry 家族同构追加）·web 新 OrdersSection 卡挂 `apps/web/app/recruiter/billing/page.tsx`（只读表：订单号/商品/金额/下单时间/状态徽标 created→entered→confirmed（failed=destructive）·**无操作口**·镜像 admin 卡列式但删三按钮）。〖rev2-RX-3→§9-1：镜像条款改指 `packages/db/sql/23_api_gateway.sql`（照 queue+ACL 同位追加·queue 函数 CREATE 起 :388/offline ACL 段 :439-446 落卷席亲证）·0159 仅含函数则 11_commerce.sql 零改〗
- **备选形（零迁移·若双审裁定蓝本「原则零迁移」优先）**：只列 `payment_order` 本人 offline 行（RLS p_owner 直读·created/paid/failed 原值徽标）——**entered 态不可见**·与派单「created→entered→confirmed」三态要求不符·须双审明示接受降级并在 REQUEST 片级修订登记。

### P3 企业余额挂件（availableUnits 展示）

**现状（亲读）**：`GET /commerce/entitlement` 既有（controller :47-50 · service `commerce.service.ts:161-164`）→ `availableUnits`=**全 kind 桶**未过期可用和（`packages/db/src/commerce/commerce.ts:396-402`·零 kind 过滤）；招聘方侧**无任何余额展示面**（recruiter/billing/page.tsx 全文亲读零余额行）。

**目标（EXEC 依此实现·口径待双审裁定）**：`recruiter/billing/page.tsx` 首屏（h1 区之下、ProductsSection 之上）新增余额挂件卡（BalanceSection·`serverGet('/commerce/entitlement')`·「企业可用额度 N 次面试」+「候选人岗位面试由企业额度支付」语境行）。口径二择一：
- **形 A（本席推荐）**：`availableUnits` 增**可选** kind 形参（`commerce.ts:396` 签名扩参·缺省 undefined → SQL 谓词 `$2::text IS NULL OR kind=$2` 恒真·**既有 C 端调用行为逐值不变**·沿 markOrderRefunded 桶过滤同形先例 `payment.ts:155`）·挂件传 `kind:'enterprise'`·返回值改名或并列 `enterpriseAvailableUnits`（响应形状只增不改）。〖rev2-裁定②→§9-2：形 A 照准·落点修正=entitlement **恒并列** `enterpriseAvailableUnits`（一次调用双算·响应只增）·勿在共享 C 端点引 query 分叉·挂件零参调用读并列值〗
- **形 B（零 API 改动）**：全桶口径直展（招聘方桶当前唯一入账源=enterprise 充值·如实注记「含个人桶若有」）。
- C 端 billing/pricing 面零触（§2）。

### P4 开票申请 paid 单下拉（替代手填订单号）

**现状（亲读）**：`apps/web/app/recruiter/billing/RechargeForms.tsx:100-111` `InvoiceRequestForm`——订单号为**手填 Input**（:103-105 `<Input id="inv-order" name="orderId" placeholder="ord-…" required>`）；无本人订单列表端点可喂下拉（同 P2 现状第一条）。

**目标（EXEC 依此实现）**：
1. 新端点 `GET /commerce/orders`（本人订单列表·`service` 新 `listMyOrders`：`asPrincipal` 下 `SELECT id, product_id, amount_cents, units, status, channel, created_at FROM payment_order WHERE owner_user_id=$1 ORDER BY created_at DESC LIMIT 50`——**零迁移**：GRANT SELECT 0001:415 + RLS p_owner 0001:416-421 已覆盖本人行）·controller `@Get('orders')`（置于 :41 `@Get('orders/:id')` 邻位·Nest 静态段/参数段不冲突）·contracts registry 追加（response=`OrderList`·:1204 家族同构）。
2. `InvoiceRequestForm` 手填 Input 改 **select 下拉**：数据源=上端点 `status==='paid'` 行（option 文案=`{orderId} · ¥{amount/100} · {created_at}`）·`submitInvoiceRequestAction` 零改（`apps/web/app/billing/actions.ts:54-68`·DB 仅-paid 具名门 `invoice_request_order_not_paid` 0156:155 仍在=端点+触发器双层不弱）。
3. **空 paid 表回退形态待双审裁定**（本席推荐：下拉禁用+提示「暂无已支付订单」·不保留手填口——手填他人/未支付单必 409 既有负例面 commerce.service.ts:204-207 已兜）。〖rev2-裁定③→§9-2：定值=下拉禁用+「暂无已支付订单」**不保留手填**（>50 单窗口外老 paid 单不可选=如实登记边界非缺陷）〗

### P5 pay CAS channel 守卫归档（零新码·只增不弱的兑现确认）

**现状（亲读）**：守卫**已在**——`packages/db/src/commerce/payment.ts:69-71`（S2-C8 注释：「CAS 增 `AND channel='online'` 单谓词——对公（offline）单不得经线上签名回调直置 paid…offline 单误入 → 0 行 → conflict 409」）+ **:81** 谓词本体 `AND channel='online'`（CAS 全谓词 :80-86）。落卷=片2 EXEC `5ff5f96d`·片2 nail「C8 channel 守卫成立：CAS 单谓词 :81·offline 持有效 HMAC 直调 webhook→409 滞 created 桶零入账断言在 proof」（b271 REQUEST:305·双审 BOTH PASS）。

**目标（EXEC 依此实现）**：**零新码面**。①本 REQUEST 登记 **片1 席1 观2**（b271 REQUEST:291 ②「归片2/片3：pay CAS 增 channel='online' 守卫（只增不弱）」）**正式关闭=片2 S2-C8 已兑现**；②§4-6 复验既有 offline-reject 断言在卷（复跑既有 proof 段）；③若复验发现断言缺失/漂移——**如实登记停手上报**，Ban 现场补写（守卫本体与注释零字节）。

### P6 p_user_account_self 注释更正（片1 勘误①一行·勘误之勘误·待双审裁定）

**现状（亲读）**：
- 片1 勘误①（b271 REQUEST:291 ①）：「收据 :21 与 commerce.service.ts:27 注释「user_account p_user_account_self FORCE RLS」引用失实（**user_account 实无 RLS**…注释更正归后刀）」——片2 已以 S2-C9 落入 `apps/api/src/modules/commerce/commerce.service.ts:26`（「勘误①·B271 片2 S2-C9：**user_account 实无 RLS**——此为应用层自身行显式谓词校验…」）。
- **本席反证（实树四锚·与「实无 RLS」表述冲突）**：`packages/db/migrations/0041_api_runtime_least_privilege.sql:14-19`（`ALTER TABLE user_account ENABLE/FORCE ROW LEVEL SECURITY` + `CREATE POLICY p_user_account_self … FOR ALL TO app_role USING/WITH CHECK id=current_setting('app.principal_user',true)`）+ 镜像 `packages/db/sql/09_auth.sql:23-27` + `packages/db/src/principal.ts:948`（`asPrincipal` 内 `SET LOCAL ROLE app_role`→该 RLS 对门查询生效）+ `git log -S "ALTER TABLE user_account ENABLE ROW LEVEL SECURITY"` 亲证自初档 `d9394e91` 在位从未移除。即：**RLS 在位且生效**，「实无 RLS」为失准表述（片1 勘误①自身失准·片2 S2-C9 把失准表述写进了产品注释）。门安全性结论两说等价（显式三键谓词 `commerce.service.ts:28-30` 在自身行可见域内收窄·candidate/pending/rejected 自行零行→403·判定不变）——纯注释事实面·零语义差。
- 收据面 `ai-docs/delivery/receipts/enterprise-pay/slice1/slice1-exec-prove.md:21` 同句系历史卷·**append-only 零改**（Ban 改收据）。

**目标（EXEC 依此实现·待双审裁定）**：`commerce.service.ts:26` 注释**一行更正**（勘误之勘误·纯注释零语义零码行为）：恢复事实态——「user_account p_user_account_self FORCE RLS 在位（0041:14-19·镜像 09_auth.sql:23-27）·asPrincipal app_role 会话内生效（principal.ts:948）·门判定=RLS 自身行可见性 × 显式三键谓词双重收窄（candidate/pending/rejected 自行零行→403 不变）」。若双审裁定「实无 RLS」另有依据（本席未见）→ 照裁定落或撤销本条·Ban 席面自裁。〖rev2-裁定④→§9-2：双审裁定**按四锚更正**+席1 第五锚 0001:372 GRANT 加固·勘误①自引收据 :21 与结论自相矛盾·机制描述事实更正非翻案·slice1 收据 append-only 零改〗

---

## §2 非范围（全列 · 越界即废）

1. **扣费语义零触（片2 已闭环）**：`packages/db/src/commerce/commerce.ts` 全文件、0157 面全文件、`adaptive-lifecycle`/`commerce-reconcile`/`interview.service` 扣费路径零字节（P5 仅只读归档·payment.ts CAS 零字节）。
2. **新支付渠道零加**：无新 PSP/无新 channel 值/无新 webhook 面（payCallback/payWebhook/refundWebhook 零触·HMAC 模型零变）。
3. **S3-C1 财务回填不在本刀**：admin 发票号/issued/rejected 回填端点+web 财务卡片+「对公确认付款户名 vs 开票抬头核对提示面」（b271 REQUEST:101）——派单六条未列·`invoice_request` UPDATE 授权零加（现 GRANT 仅 SELECT,INSERT 0156:126）·LEDGER 残留另立。
4. **S3-C3 新增 RLS 断言面/S3-C4 三片合并全链回归车不在本刀**：本刀 prove=既有段复验+本刀触面断言（§4）·不新造回归车。
5. **C 端零触**：pricing/billing 页、C 端桶逻辑（gift/trial/paid）、`action-error.ts:26-34` CREDITS_402 家族既有行、jobs 页 402 家族渲染（:59-72 块）、`jobs/actions.ts` 既有行——零字节（P1-a 只**增**知情行）。
6. **admin 面零触**：admin/page.tsx 全部卡片、admin.controller/service 零字节（P2 只做招聘方自服镜像面）。
7. **#218 入口收敛（「继续岗位面试」撤除）/#229 退款产品化/真实 PSP/组织实体**：既有 Ban 延续（b271 §2.1/.4/.5/.6）·P1 不动 :148 按钮文案族。
8. **est live=0**：六条零模型外呼·零新 secrets·零生产操作。
9. **历史卷零改**：b271 REQUEST 既有段落（append-only 片级修订仅可追加）、slice1/slice2 收据、LEDGER——零字节。

---

## §3 迁移修订登记（蓝本「原则零迁移」·append-only）

b271 REQUEST:95 片3 标注「原则零迁移」。本刀 **P2 首选形需一枚 0159**（expand-only·lock_timeout 照 0156/0157 纪律·自包含 REVOKE/GRANT·镜像同步）——**append-only 修订登记于此·不改写已审段落**·SOP:16 开工即 claim（本 REQUEST 文首已声明）。若双审裁 P2 备选形 → 蓝本原则维持·本刀零迁移·0159 释放回注。〖rev2-裁定①→§9-2：双审裁定**首选形**（决定性实锚=offline_remit_record 全库零 GRANT·备选形已录台账显示 created 有重复打款风险）·0159 维持 claim·释放条款不再触发〗

---

## §4 prove（判据 · 全离线本地 · est live=0 · EXIT=0 一次过 · Ban retry-to-green）

1. **修法③链复验（零码证明）**：既有 web-logic.proof 分码断言绿（`application-start-error.ts:22` 文案逐字）+ jobs 页渲染块静态接线（page.tsx:60-72 read-file 断言·沿 G4 静态接线先例）+ §0.2 四锚 `git diff` 零触证明。〖rev2-RX-2→§9-1：引址重写——修法③**既有面**=entpay:s2 **28/28**（entpay-s2.proof.ts:133/:152·slice2-exec-report.md:78 收据）+ web-logic **ERRMSG-MAP 既有段复跑**；「:22 文案逐字」「page.tsx :60-72 静态接线」两项 read-file 断言=**本刀新增断言**（§2.4 已允许新触面断言）·勿称「既有」〗
2. **修法⑥字面断言**：「本场由企业支付，不消耗你的额度」在 /jobs 渲染面（proof read-file/纯函数断言·b271 §4.3-3 同文）。〖rev2-RX-1→§9-1：本条补 **P1-b 槽**——招聘方申请状态卡知情行+「企业额度不足，请充值」→`/recruiter/billing` 链接 **read-file 静态断言**（文案与裁定⑤定稿**逐字绑定**）+ 卡片区既有四行**零字节锚**（detail page :101-133 区·dl 四行起 :106 落卷席亲证）〗
3. **P2**：①函数本人行作用域负例（他招聘方 offline 单 SELECT 零行·探针逐字镜像生产 SQL+错配反例留痕）；②三态可视（created 行无 remit→created·remit entered→entered·confirmed→confirmed·failed→failed）；③app_role 直读 offline_remit_record 被拒（permission denied）断言；④镜像逐字节同文（neg:commerce 直载验证·S1-C2 承重墙判据）；⑤他人单端点 403/零行不可区分面。〖rev2-RX-3→§9-1：④镜像指名 `packages/db/sql/23_api_gateway.sql`（23=受控函数族+ACL 镜像·零表 DDL 亲证；11=表/列/触发器镜像·0159 仅含函数则 11 零改）〗
4. **P3**：形 A 则 availableUnits 缺省行为逐值不变断言（既有 C 端调用点前后相等）+enterprise 过滤断言；挂件渲染静态断言。形 B 则注记在卷。
5. **P4**：下拉数据源仅 paid（status 过滤断言）+手填 Input 零残留+`submitInvoiceRequestAction` 既有 409/403 面回归；neg:commerce 既有段复跑（84/84 基线·预存红如实对账）。
6. **P5**：既有 offline-reject 断言复验在卷（复跑·零新断言·缺失即停手上报）。
7. **P6**：`git diff` 断言仅注释行（零语义）·TS 门清洁·delta 与触面零交集（pristine 对照先例）。
8. **门禁**：web typecheck+prove · api validate · neg:commerce ·（若 0159）部署车幂等——EXIT 原值入收据 `ai-docs/delivery/receipts/enterprise-pay/slice3/`。验证不过即停手上报。

---

## §5 Ban（全列）

1. **Ban 动扣费语义**：§2.1 面零字节·CAS/幂等/RLS/门判定零松（b271 §5.7 延续）。
2. **Ban 动 C 端与 admin 既有面**：§2.5/§2.6 零字节。
3. **Ban 新支付渠道/webhook/秘钥面**：§2.2·Key name-only·staged 过 secret gate。
4. **Ban 改历史迁移**：0001-0158 零字节（checksum 守卫）；0159 expand-only+lock_timeout+自包含 ACL。
5. **Ban 改收据/已审卷段落**：append-only 纪律·历史行不抹改。
6. **Ban 弱化**：invoice 仅-paid 触发器门/RLS FORCE/approved-recruiter 门/对公双人分离只增不弱；P2 函数必须本人行作用域+负例断言（越权零行）·禁无作用域全表读。
7. **Ban #218/#229/S3-C1 蔓延**：§2.3/§2.7 零字节。
8. **Ban markers**：本刀触面与收据任务占位标记族（未完词面）grep=0——本 REQUEST 自身词面零含（ Ban 行以「未完词面」指称·不落字面）。
9. **Ban 虚称**：不称「开票合规完成」「自动到账」「退款开放」；P6 注释更正≠安全判定变更（门行为零变如实声明）。
10. **Ban self-approve · Ban retry-to-green**：预执行双审两外席·作者≠审者；prove 红即停手上报协调方。
11. **⛔push ⛔动主线仓 ⛔触其他工作树**。

---

## §6 pins（十一值照抄 b271 §6 · 零翻转）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（interview-data 行按 UNSTUB-ERASE supersession 现值照抄：`NORTH-STAR-EXECUTION-LOOP.md:46` 注记——简历/账户轨=202 软删受理·purgePending=true 恒真直至 S2 逐 sink 回执·物理清除完成禁宣称；interview-data 面仍 503 关闭·原值行代码块内零改） · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零模型外呼·零消耗）

---

## §7 Non-claims

本刀 ≠ 财务/开票合规（S3-C1 未做·开票仍=资料采集+申请台账）≠ 自动到账（对公仍=人工确认·本刀只做状态可视）≠ 退款产品化 ≠ 实时余额承诺（P3 为读时快照·P1-b 为静态知情行非状态位）≠ 渠道上线（HMAC 模拟渠道语义零变）· P6=注释事实面更正（门判定零变·两 nail 勘误链勘误之勘误如实入账非翻案宣言）· P5 归档=观察闭环（守卫兑现主体=片2 S2-C8·本刀零功自居）· prove EXIT=0 ≠ DONE（claimDone=false·完成判定走双审+nail）。

---

## §8 STOP

**STOP · `draft:awaiting_pre_exec_dual` · docs-only · alone≠dual。** 本 REQUEST 写完即停零码动；预执行双审两外席 PASS + meetwise 明示授权后方可派 EXEC coding；EXEC 不得改 §1 修法口径与 §5 Ban，漂移须回 REQUEST 补审；prove 红即停手上报。**待双审裁定项**：①P2 形制（0159 DEFINER 本人行读函数=首选 vs 零迁移降级三态不可视·本席推荐首选）；②P3 口径（kind 可选形参=形 A vs 全桶直展=形 B·本席推荐 A）；③P4 空 paid 表回退形态（下拉禁用+提示 vs 保留手填·本席推荐禁用）；④P6 勘误之勘误（「实无 RLS」更正按本席四锚证据链 vs 双审另证·本席推荐更正）；⑤P1-b 卡片文案措辞（提案在 §1·双审可微调·语义面=静态知情+充值指引不放大）。任何越 §2 冲动=停手上报，不借机修。〖rev2→§9-2：五裁定已定值（P2=0159 首选形/P3=形 A 并列/P4=下拉禁用/P6=四锚+第五锚更正/P1-b=语义批逐字绑定）·待复审确认〗

---

## §9 rev2 双审落卷（席1 PASS + 席2 FAIL 窄口径三处方 · 取严合并 · append-only · 原文零改 · 改正处附 〖rev2-*〗 注记）

**双审台账**：draft 预执行双审=席1 **PASS**（五裁定+第五锚加固）+ 席2 **FAIL 窄口径**（三处方=引址/锚面修正级·非范围级）——按**取严合并**落卷为本节；**五裁定两席高度一致**·定值随卷（§9-2）。落卷席全部新增锚点实物亲证（grep/sed/awk 实测·base 同 `c7d2440e` 树）：`apps/api/test/entpay-s2.proof.ts:133/:152`、`ai-docs/delivery/receipts/enterprise-pay/slice2/slice2-exec-report.md:78`、`apps/web/test/web-logic.proof.ts:4-5/:76`、`packages/db/sql/23_api_gateway.sql:388/:439-446`、`packages/db/migrations/0001_baseline.sql:372/:409/:416/:418-422`、`ai-docs/delivery/receipts/enterprise-pay/slice1/slice1-exec-prove.md:21`、`apps/web/app/recruiter/billing/page.tsx` 在树、recruiter 申请卡 dl 起 `:106`。落卷性质=docs-only 零码动；落卷后状态转 `draft_rev2:pre_exec_dual`（本档末状态行）·**待复审确认后协调方行使 EXEC 授权**。

### §9-1（席2 三处方落卷 · RX-1/RX-2/RX-3 · 正文已附 〖rev2-*〗 注记）

- **RX-1（§4-2 补 P1-b 槽）**：§4-2 现文只载修法⑥ /jobs 面断言·P1-b 判据槽缺失——补：招聘方申请状态卡知情行 + 「企业额度不足，请充值」→`/recruiter/billing` 链接 **read-file 静态断言**（文案与裁定⑤定稿**逐字绑定**）+ 卡片区既有四行**零字节锚**（detail page `:101-133` 区·dl 四行起 `:106` 亲证）——既有四行（候选人/来源/状态/评估）零字节=P1 改动不触卡区既有面。
- **RX-2（§4-1 重写引址 · 勿称「既有」）**：修法③链**既有面**=**entpay:s2 28/28**（`apps/api/test/entpay-s2.proof.ts:133` 判据2 候选人 402 `application_enterprise_pay_unavailable` + `:152` 判据2d reused 复用路同分码·`slice2-exec-report.md:78`「`entpay:s2:prove` **28/28 EXIT 0**」收据亲证）+ **web-logic ERRMSG-MAP 既有段复跑**（`apps/web/test/web-logic.proof.ts:4-5` 映射刀设计注·`:76` S2-C6 jobs 域专属行既有）；「`application-start-error.ts:22` 文案逐字」（:21-23 注册表亲证·:22 文案行）与「page.tsx `:60-72` 静态接线」两项 read-file 断言=**本刀新增断言**（§2.4 已允许新触面断言）——**勿称「既有」**。
- **RX-3（§1 P2 镜像条款改指 + §4-3④ 同步指名）**：首选形镜像条款「镜像 `packages/db/sql/11_commerce.sql` 同步」改指 **`packages/db/sql/23_api_gateway.sql`**——23=受控函数族+ACL 镜像住地（**零表 DDL·grep 亲证**；0156 `gateway_admin_offline_remit_queue` 函数镜像 CREATE 起 `:388`·offline 函数 ACL 段 `:439-446` 逐行亲证）·0159 新函数照 queue+ACL **同位追加**；11=表/列/触发器镜像（唯一函数=invoice 触发器门 `enforce_invoice_request_paid_order` :96-117 属触发器面）——0159 **仅含函数**（零表零列零触发器）则 `11_commerce.sql` **零改**；§4-3④「镜像逐字节同文」**同步指名 23_api_gateway.sql**（neg 判据载体随之）。

### §9-2（五裁定定值 · 两席高度一致 · 取严合并）

- **裁定① P2 形制 → 0159 首选形（受控 SECURITY DEFINER 本人行读函数）**：席1 决定性实锚=`offline_remit_record` **全库零 GRANT**（落卷席全仓 grep 亲证零命中·0156:80-83 访问纪律「不授 app_role 任何表权限」）——招聘方 principal 会话内物理不可直读；备选形只能读 `payment_order`·**已录台账（有 remit 行=已 entered/confirmed）在 payment_order 仍显 `created`** → 招聘方误判未入账→**重复打款风险**。裁定=首选形落 0159·备选形撤销（§3 释放条款不再触发·正文已附注记）。
- **裁定② P3 口径 → 形 A · entitlement 恒并列 `enterpriseAvailableUnits`**：一次调用双算（`availableUnits` 全桶和 + `enterpriseAvailableUnits` 企业桶和**并列返回**·响应形状只增不改）；**勿在共享 C 端点引 query 分叉**（`/commerce/entitlement` 为 C 端共用·零 kind 入参分叉·service 层可选形参扩参照 §1 形 A·挂件零参调用读并列值）。
- **裁定③ P4 空表回退 → 下拉禁用+「暂无已支付订单」·不保留手填**：>50 单（LIMIT 50 窗外）老 paid 单不可选登记=**如实边界非缺陷**；手填口撤除·他人/未支付单 409 兜底仍由 `commerce.service.ts:204-207` 既有负例面 + 0156:155 仅-paid 具名门双层承（不弱）。
- **裁定④ P6 → 按四锚更正 + 席1 第五锚加固**：四锚（0041 ENABLE/FORCE+`p_user_account_self`·镜像 09_auth.sql:23-27·principal.ts `SET LOCAL ROLE app_role` :949·`git log -S` 初档 `d9394e91` 在位）更正照 §1 P6 目标行落；席1 **第五锚=`0001_baseline.sql:372`** `GRANT SELECT, INSERT, UPDATE ON user_account TO app_role`（落卷席亲证）——表级 GRANT 在位再证 app_role 会话可达该表；**勘误①自引收据 `slice1-exec-prove.md:21` 本身即载「`p_user_account_self` FORCE RLS…零行→403」——与「实无 RLS」结论自相矛盾**（引证支持反向结论）；定性=机制描述**事实更正非翻案**（门判定零变·§7 同口径）·slice1 收据 append-only 零改。
- **裁定⑤ P1-b 文案 → 语义批 · 「企业额度不足，请充值」逐字保留**：语义面=静态知情+充值指引·**措辞微调允许·不放大**（非状态位/非实时余额承诺）；`/recruiter/billing` **目标面已存在**（`apps/web/app/recruiter/billing/page.tsx` 亲证在树）；文案定稿与 RX-1 断言**逐字绑定**。

### §9-3（微漂六处尾账 · draft 引址 → 实树实值 · append-only）

1. `principal.ts` `SET LOCAL ROLE app_role` 实落 **:949**（draft 书 :948）。
2. `0041` `p_user_account_self` 策略段实落 **:17-20**（draft 书 :14-19——:14-15 实为 ENABLE/FORCE·策略 WITH CHECK 收于 :20·席1 记「policy :20」）。
3. `0001` payment_order 实锚 **:409**（status 四态 CHECK）/:416（GRANT SELECT,INSERT,UPDATE）/:418-422（ENABLE/FORCE+`p_owner` USING/WITH CHECK）（draft 书 :410/:415/:416-421）。
4. `0156` queue 函数实落 **:295-315**/ACL 段 **:318-325**（draft 书 :295-317/:318-326）。
5. `contracts` commerce registry 家族实落 **:1202-1209**（`listProducts` 起 :1202·`submitInvoiceRequest` 止 :1209）（draft 书 :1204-1210）。
6. `11_commerce` offline_remit_record status 行实落 **:53**（draft 书 :55——:55 实为 CREATE INDEX ix_offline_remit_status）/recruiter 申请卡 dl 四行起 **:106**（卡区 :101-133 维持·CardContent :105·dl :106）。

落卷席实物抽查（sed/awk 亲证）：上列**起锚值全数命中**（principal.ts:949·0001:409/:416/:418-422·0156 queue 起 :295/ACL 起 :318·contracts :1202-1209·11_commerce:53·recruiter dl :106）；range 止值照席1 记录入账·EXEC 立项照例重 pin（本档「蓝本可及性注记」既有条款）。

### §9-4（状态行）

尾部 append 状态行（见本档末行·头部 Status 行与 §8 为起草时点快照·原文零改）：`draft_rev2:pre_exec_dual（席1 PASS+席2 FAIL 窄口径三处方落卷·五裁定定值（P2=0159 首选形/P3=形 A 并列/P4=下拉禁用/P6=四锚+第五锚更正/P1-b=语义批定稿绑定）·微漂六处入账·待复审确认后协调方行使 EXEC 授权）`

---

*B271 ENTPAY 片3 打磨刀 EXEC REQUEST · 2026-10-10 · draft:awaiting_pre_exec_dual · 起草席 s3-draft · base 主线 `feat/mysql-schema-skeleton` @`9f6edf8f` · 分支 `line/entpay-slice3`（工作树 `meetwise-s3d`）· 蓝本=b271-entpay-REQUEST.md（nail @df12a054）§1.3+:291+:309 + batch-residual-plan.md:107 I1 行 + 片1 席1 观1/观2 + 片2 nail 片3 登记 + G3 REQUEST:41 归 I1 面 · 六条=P1 文案知情窗/P2 自服对公单列表/P3 余额挂件/P4 开票 paid 下拉/P5 channel 守卫归档/P6 注释勘误之勘误 · 拟用迁移 0159（仅 P2 首选形·备选形零迁移）· 扣费语义零触·新渠道零加·C 端/admin 零触·est live=0 · pins 十一值零翻转 · markers=0 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · ⛔push*

draft_rev2:pre_exec_dual（席1 PASS+席2 FAIL 窄口径三处方落卷·五裁定定值（P2=0159 首选形/P3=形 A 并列/P4=下拉禁用/P6=四锚+第五锚更正/P1-b=语义批定稿绑定）·微漂六处入账·待复审确认后协调方行使 EXEC 授权）

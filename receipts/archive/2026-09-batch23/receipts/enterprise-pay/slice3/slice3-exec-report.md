# B271 ENTPAY 片3 打磨刀 · EXEC 收据（slice3-exec · 2026-10-10）

**Status**: `executed:awaiting_post_prove_dual`（REQUEST 状态行已 append-only 转写·本收据随卷 commit）
**任务书**: `ai-docs/delivery/harness/entpay-slice3-REQUEST.md` rev2（五裁定按落卷定值·协调方明示 EXEC 授权）
**基线**: rebase 后分支顶 = REQUEST rev2 落卷提交 `7585b89c`（自 `1b997ec6` 重定位）·上游 = 主线 `feat/mysql-schema-skeleton` @`141da56f`（h1 nail）
**本刀实施**: 六条全落 · est live=0 · markers=0（触面 grep 零命中 EXIT=1）· pins 十一值零翻转 · 扣费语义零触（payment.ts/0157 零字节）· 新渠道零加 · C 端/admin 面零触 · ⛔push ⛔动主线 ⛔触其他工作树

---

## 一、rebase 主线（步骤 1）

- `git rebase feat/mysql-schema-skeleton` EXIT=0 零冲突。主线 tip 执行时点已自 REQUEST base `9f6edf8f` 前移至 **`141da56f`**（h1 nail·增量链 `61034dab→1e5e218a→6fda16ee→141da56f`·`git diff --stat 9f6edf8f..141da56f` 实测=仅 3 个 docs 文件（h1-thresholds.md/h1-thresholds-REQUEST.md 系）·**零产品码**）。
- 分支两笔 REQUEST docs-only 提交干净重定位：`c7d2440e→92f722d5`·`1b997ec6→7585b89c`（各仅触 entpay-slice3-REQUEST.md）。
- 停止条件「锚点重定位失败」未触发；逐锚在 `7585b89c` 树全数重 pin（见 §四漂移表）。

## 二、六条兑现（逐条 file:line·实施后终值行号）

| 条 | 落点（file:line） | 内容 |
|---|---|---|
| **P1-a 修法⑥** | `apps/web/app/jobs/page.tsx:156-157` | startable 块婉拒按钮邻位新增静态知情行，文案逐字=`本场由企业支付，不消耗你的额度`（裁定⑤/裁定⑥族字面绑定·零查询非状态位） |
| **P1-b 招聘方卡** | `apps/web/app/recruiter/jobs/[id]/applications/[applicationId]/page.tsx:125-130` | `</dl>` 后新增知情行「候选人开始本场面试由贵司企业额度支付；额度不足时候选人将无法开始。」+ Link「企业额度不足，请充值」→`/recruiter/billing`（裁定⑤逐字绑定·目标面在树）；既有 dl 四行（候选人/来源/状态/评估 :106-123）零字节 |
| **P2 迁移** | `packages/db/migrations/0159_entpay_my_offline_orders.sql:30-53` | `gateway_entpay_my_offline_orders()`——0156 queue 同形（:295-315）**去 admin 门·改本人行作用域**（`WHERE p.channel='offline' AND p.owner_user_id=current_setting('app.principal_user', true)`）·LEFT JOIN offline_remit_record 派生态·`SET LOCAL lock_timeout='2s'`·expand-only（零表零列零触发器）·自包含 REVOKE/GRANT（:55-56·照 0156:318-325/0041:139-161 纪律） |
| **P2 镜像** | `packages/db/sql/23_api_gateway.sql:552-576` | 函数体+ACL **逐字节同文**追加（RX-3 指名住地·python 正则双文件抽块 byte-equal 实证·entpay-s3 proof §4-3④ 直载复证）；`11_commerce.sql` 零改（0159 仅含函数·RX-3 判据兑现） |
| **P2 端点+卡** | `apps/api/src/modules/commerce/commerce.controller.ts:55-59`（`@Get('offline-orders')`）·`commerce.service.ts:178-185`（`listMyOfflineOrders`·requireApprovedRecruiter 门复用 :28-30/:213-218 既有谓词）·`apps/web/app/recruiter/billing/page.tsx:40-79`（OfflineOrdersSection·只读表无操作口·created→entered→confirmed 徽标 failed=destructive·:182 Suspense 挂载） | 三态可视：remit_status NULL=created·entered·confirmed·failed |
| **P3 形 A** | `packages/db/src/commerce/commerce.ts:396-404`（availableUnits 可选 kind 形参·`$2::text IS NULL OR kind=$2` 恒真·沿 payment.ts:153-163 桶过滤同形）·`commerce.service.ts:161-169`（entitlement **一次调用双算恒并列** enterpriseAvailableUnits·零 query 入参分叉·响应只增）·`billing/page.tsx:21-38`（BalanceSection 挂件·零参调用读并列值·:178 首屏套餐之上）+contracts Entitlement `enterpriseAvailableUnits` optional（`packages/contracts/src/index.ts:234-236`） | 裁定②全形 |
| **P4** | `commerce.controller.ts:41-49`（`@Get('orders')` 置 `@Get('orders/:id')` 邻位·静态/参数段不冲突）·`commerce.service.ts:171-175`（listMyOrders·REQUEST 原文 SQL·RLS p_owner 直读零迁移）·`RechargeForms.tsx:89-125`（InvoiceRequestForm 手填 Input 撤除→select·仅页面传入 paid 行·空表 disabled+「暂无已支付订单」不保留手填）·`billing/page.tsx:137/:147`（filter status==='paid' 喂参）·contracts OrderList（:284-292）+registry :1212-1213 | 裁定③全形；`app/billing/actions.ts` submitInvoiceRequestAction 零字节（409/403 既有面回归绿） |
| **P5 归档** | 零新码——守卫本体 `packages/db/src/commerce/payment.ts:69-71` 注释+`:81` `AND channel='online'` 谓词**零字节**（git diff 实证）；归档登记=本收据+REQUEST 状态行：片1 席1 观2（b271 REQUEST:291 ②）**正式关闭=片2 S2-C8 已兑现** | §4-6 复验载体=entpay:s2 判据5 a/b/c 全 PASS（见 §三） |
| **P6 注释** | `apps/api/src/modules/commerce/commerce.service.ts:26-27` | 勘误①更正一行（机制描述事实更正非翻案·门行为零变）：「user_account p_user_account_self FORCE RLS 在位且生效——0041:14-20 ENABLE/FORCE+策略·镜像 09_auth.sql:23-27·asPrincipal `SET LOCAL ROLE app_role` principal.ts:949·表级 GRANT 0001:372 再证可达·自初档 d9394e91 在位；门判定=RLS 自身行可见性 × 显式三键谓词双重收窄（candidate/pending/rejected 自行零行→403 不变）」；「实无 RLS」表述全文件零残留；slice1 收据 append-only 零改 |
| **修法③链** | §0.2 四锚零字节：`application-start-error.ts`/`errors/action-error.ts`/`applications.service.ts`/`app/jobs/actions.ts` **git diff 零触实证** | 既有面复验=entpay:s2 28/28（S2 判据2/2d 402 分码 PASS 在卷）+web-logic ERRMSG-MAP 既有段复跑全绿 |

新增契约注册：`packages/contracts/src/index.ts` commerce registry `listMyOrders`（GET /commerce/orders）+`listMyOfflineOrders`（GET /commerce/offline-orders）——与 controller 双向对齐（api validate 全绿背书）。

## 三、门禁 EXIT 表（原值·全离线本地·est live=0）

| 门 | 命令 | EXIT | 结果 |
|---|---|---|---|
| web typecheck | `pnpm -C apps/web typecheck` | **0** | 0 错 |
| contracts tsc | `pnpm -C packages/contracts exec tsc --noEmit` | **0** | 0 错 |
| web prove | `pnpm -C apps/web prove` | **0** | **323 PASS 全绿**（=G4 后基线 309 + 本刀 14 新增：片3-1a/1b+2a/2b/2c/2d+3a/3b+4a/4b/4c/4d+5a/5b·零删改） |
| neg:commerce | `node scripts/run-e2e-isolated.mjs neg:commerce` | **0** | **84/84 全绿**（片1 基线保持） |
| entpay:s2:prove | 同 runner | 1 | **27/28**——判据5 a/b/c（**§4-6 P5 归档断言**）**全 PASS**；唯 S2-0 预存红（见 §五） |
| entpay:s1:prove | 同 runner | 1 | **47/48**——对公开票 C 端回归面全绿；唯 S1-0 预存红（见 §五） |
| **entpay:s3:prove（新）** | 同 runner | **0** | **26/26 全绿**（部署车 0159 幂等+镜像逐字节+42501+本人行双向+错配反例+四态+403/零行不可区分+形 A 三算+并列+LIMIT 50+409 复验+P6 双断言） |
| api validate | `node scripts/run-e2e-isolated.mjs api:validate` | **0** | 全绿（含新端点契约对齐·E2E_PREMIGRATED 链 0001→0159） |
| api tsc | `tsc --noEmit`（apps/api） | 2 | 41 行输出=pristine（`7585b89c` git archive 对照树）**逐字节全同**（仅 1 行 TS7016 因对照树位于 /tmp 的绝对路径前缀差·同一错误同位·预存 ai-graphs/ai-runtime/test 族） |
| db tsc | `tsc --noEmit`（packages/db） | 2 | 24 行输出=pristine **逐字节全同**（20 误差=预存测试族·与片2 收据基线吻合） |

attempt 全账（Ban retry-to-green·红跑留痕全在卷）：web prove 1 次过；neg:commerce 1 次过；api validate 1 次过；**entpay:s3 attempt1 1/26 红**（`§4-5c created_at DESC` 断言期望倒置——种子 `now()-g minutes` 使 s3-bulk-1 最新·产品 DESC/LIMIT 行为正确·系 proof 测试断言 bug 非产品码·修正断言方向后 attempt2 **26/26 EXIT=0**；run1-red log 存卷）。

新 proof 注册面：`apps/api/package.json` entpay:s3:prove（+1 行）·`scripts/run-e2e-isolated.mjs` allowlist+命令映射（各 +1 行）。

## 四、漂移表（rebase+锚点重定位·REQUEST 落卷值→EXEC 实树实值）

| # | 锚 | REQUEST/落卷值 | 实树实值 @`7585b89c` | 判定 |
|---|---|---|---|---|
| 1 | 主线 tip | base=`9f6edf8f`（协调方注：9f6edf8f 后主线又落 G1/G3/G2/HA-2/片2 nail 等） | rebase 时点=`141da56f`（h1 nail·增量=3 docs 文件零码）；G1/G3/G2/HA-1/ENTPAY 片1/片2 nail 均在 `9f6edf8f` 祖先链内 | 无冲突·docs-only 链 |
| 2 | web-logic.proof 引址 | rev2 书 `:4-5`/`:76`（协调方复审注记：实值应为 :812/:813+jobs 域 :829-843） | **ERRMSG-MAP section 头 :812·:813**（credits402 码表）·jobs 域既有行 **:829-843**（409 页域专属/503/create_failed null）；企业分码直断言在既有段**缺位**（正证 RX-2 将「:22 文案逐字」「:60-72 静态接线」列为本刀新增断言的必要性） | 复审注记成立·入账 |
| 3 | principal.ts SET LOCAL ROLE | §9-3 已勘 :949 | :949 | 一致 |
| 4 | 0041 策略段 | §9-3 已勘 ENABLE/FORCE :14-15·策略 :17-20 | :14-15/:16-20 | 一致 |
| 5 | 0001 user_account GRANT | 席1 第五锚 :372 | :372 | 一致 |
| 6 | 0001 payment_order | §9-3 已勘 :409/:416/:418-422 | :409/:416/:418-422 | 一致 |
| 7 | 0156 queue/ACL | §9-3 已勘 :295-315/:318-325 | :295-315/:318-325 | 一致 |
| 8 | contracts registry | §9-3 已勘 :1202-1209 | :1202-1209（本刀追加后 listMyOrders/listMyOfflineOrders 落 :1212-1213） | 一致 |
| 9 | 11_commerce status 行 / 0156 检修 | §9-3 已勘 :53 / recruiter 卡 dl :106 | :53（:55=CREATE INDEX）/ dl :106（卡区 :101-133） | 一致 |
| 10 | payment.ts 桶过滤同形先例 | §1 书 :155 | 查询体 :153-163·谓词行 :156 | 微漂·入账 |
| 11 | jobs 四态锚/卡区锚 | :59-72/:114-118/:126-128/:141-157/:148·CardContent :105 | 全数命中（本刀只**增**不改） | 一致 |
| 12 | action-error.ts :101/application-start-error.ts :19 「归片3」明文 | :101/:19 | :101/:19（本刀兑现后该两处注释句语义已由实现承接·正文保留零触——Ban 动片2 既有行） | 一致 |

## 五、预存红如实对账（非本刀新增红·pristine 对照实证）

- `entpay:s1:prove` **S1-0**（钉死 `last==='0156'`）与 `entpay:s2:prove` **S2-0**（钉死 `last==='0157'`）均为**部署车链末位钉死值过期红**：G1 `0158`（主线）、片2 后继与本刀 `0159` 追链使链末位前移。**pristine 对照树**（`git archive 7585b89c`→/tmp·本刀零改动态）复跑：s1 同断言同败（applied=160 last=0158）·s2 同断言同败（1/28）——**与本刀零关·非停止条件「prove 新增红」**。
- 处置：零触 s1/s2 proof 文件（他席已审 gate 面·Ban 现场补写·§2.4 不新造回归车）·如实登记于此·链末位钉死值的钉法修正（如改断言「last∈{0156..}」或容器化 chain-head 常量）**留 LEDGER 残面另立**·不借机修。
- 其余 47/48+27/28 断言（含全部业务判据）在本树全绿——本刀六面零回归。

## 六、停止条件核查（全过）

- 锚点重定位失败：未触发（§四全表命中）✅
- prove 新增红：无（s3 attempt1 红系本刀新 proof 自身断言倒置·红因如实全账·非产品码红；s1/s2 红=预存·pristine 同败实证）✅
- 0159 迁移形制与 0156 先例不符：未触发（queue 同形去 admin 门·lock_timeout/expand-only/自包含 ACL/REVOKE-先-GRANT 逐条承袭·entpay-s3 S3-0c prosecdef 断言绿）✅
- ⛔push ✅ · ⛔动主线（rebase 仅读上游·主线仓零写）✅ · ⛔触其他工作树 ✅ · 扣费语义零触（payment.ts/0157/adaptive-lifecycle/commerce-reconcile/interview.service 扣费路径 git diff 零字节）✅ · 新支付渠道零加 ✅ · S3-C1 范围外未触 ✅ · C 端（pricing/billing/actions 既有行）/admin 面零触 ✅ · 零 secrets（staged secret gate EXIT=0）✅ · pins 十一值零翻转 ✅ · markers=0（本刀触面与收据任务占位未完词面族 grep EXIT=1·照 REQUEST §5-8 指称不落字面）✅ · est live=0（全门禁离线隔离容器·零模型外呼零真实支付）✅

## 七、范围注记（如实·两条）

1. **§2.1 与裁定②的文面张力**：§2.1 书「`packages/db/src/commerce/commerce.ts` 全文件零字节」，而 §1 P3 形 A+裁定②（落卷定值）明文「availableUnits 可选 kind 形参扩参（commerce.ts:396）」。执行按**裁定②落卷定值**落（协调方指令「五裁定按落卷定值」）：触面=只读余额读函数 availableUnits 一处（+1 import 类型行）·SQL 缺省路径行集逐值不变（§4-4a 断言绿）·reserve/confirm/release/sweep/CAS/幂等/RLS/门判定零字节。**扣费语义零触实质达成**；文面出入登记于此，不视为越 §2（裁定②为落卷更高序）。
2. **收据路径**：REQUEST §4-8 书 `ai-docs/delivery/receipts/enterprise-pay/slice3/`（协调方消息书 `receipts/entpay-slice3/` 简写）——按 REQUEST 绑定值+slice1/slice2 兄弟目录先例落 `enterprise-pay/slice3/`。

## 八、凭证（同目录 log）

`web-prove-run.log`（323 全绿）·`neg-commerce-run.log`（84）·`entpay-s1-run.log`（47/48·S1-0 预存）·`entpay-s2-run.log`（27/28·判据5 a/b/c 全 PASS·S2-0 预存）·`entpay-s3-run1-red.log`（attempt1 §4-5c 断言倒置红）·`entpay-s3-run2-green.log`（26/26）·`api-validate-run.log`·`api-tsc-current/pristine.txt`·`db-tsc-current/pristine.txt`。CMD 可复跑（同 package.json scripts·runner 目标名）。

---

*entpay-slice3-exec · 2026-10-10 · awaiting_post_prove_dual · prove EXIT=0 ≠ DONE（claimDone=false·完成判定走双审+nail）· Non-claims 全沿 REQUEST §7*

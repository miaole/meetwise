# B271 片2 EXEC 收据 — 扣费路由（0157·S2-C1~C9）

**席**: entpay-slice2-exec（B271 #271 片2 EXEC）· **分支**: line/enterprise-pay（rebase 主线 6799544f 后落卷）· **日期**: 2026-10-10
**任务书**: ai-docs/delivery/harness/entpay-slice2-REQUEST.md（rev2·锚 @bcd3bfcf 固化）· **双前置收口**: pre-exec 双审（席1 PASS+席2 处方兑现 rev2 复审 PASS）+ 0-b 闸 @79aeb04b + 协调方明示授权片2 EXEC

---

## 一、锚点路径漂移表（任务书锚 @bcd3bfcf → rebase 后实树 @6799544f·逐锚 rg/sed 实测）

DIR-B2 域文件夹化（8262d976·65 文件 pure-mv）+ 断链修复（6799544f）+ fence-reflow（fd57a6fc）落主线后的全锚重定位：

| 任务书锚（旧） | 新锚（实测） | 漂 | 语义形状 |
|---|---|---|---|
| `packages/db/src/commerce.ts` 八函数 :36/:96/:138/:163/:198/:265/:341/:384 | `packages/db/src/commerce/commerce.ts` **八锚全同位** | 路径级（B2 纯 mv 零行变） | reserveEntitlement/confirm/release/complete/fail/abandon/sweep/reconcile 逐函数亲证 |
| `packages/db/src/payment.ts` CAS :74-83（WHERE :77） | `packages/db/src/commerce/payment.ts` CAS :75-84（WHERE :77 同位） | +1 行 | markOrderPaidAndCredit CAS 无 channel 过滤（S2-C8 改造点） |
| `packages/db/src/recruiter.ts` :142-143/:361/:371/:373-387/:416/:443-449/:450-457/:459 | `packages/db/src/recruiting/recruiter.ts` **全同位** | 路径级 | applyToJob 写入/startApplicationInterview 全锚（含 reused :373-387） |
| `commerce-reconcile.ts` :26/:27/:39/:46/:56 | 同路径 :35/:36/:58/:65/:75 | **+9/+19**（主线 fence-reflow F3 围栏先检插入·非 B2） | asPrincipal/reconcile/判支(SELECT application_id FOR UPDATE)/fail 支/abandon 支语义形状完好 |
| `interview.service.ts` begin :179/:182/:185/:305/:312/:314/:317/:321·abandon :511-535(:526) | 同位全验证 | 0 | begin 体实施时模块化为 `beginInterviewCore`（同文件导出·锚语义逐字保持） |
| `adaptive-lifecycle.ts` :55/:435/:441/:456 | 同位 | 0 | worker 确认/释放全调用面 |
| `interview-consumer.ts` :81/:163/:224/:233/:426 | 同位 | 0 | terminalizeUnsettledInterview/租约续约双路/gatewayDispatchOwners |
| web `actions.ts` :18/:25/:38·`page.tsx` :59/:128/:141·`application-start-error.ts` :24-29 | 同位 | 0 | 实施按单改 |
| 处方「action-error.ts :24-29」 | `apps/web/lib/errors/action-error.ts`（B2 已域化 errors/·非任务书所记 lib/ 根） | 路径级 | CREDITS_402_CODES :24-29 同位 |
| `0001_baseline.sql` :109-124(uq :122)/:150-163·`0005` :23·`0156` :10/:34-45/:52-53/:55-72/:174-198/:227-235/:318-326 | 同位全验证 | 0 | 四样板全在 |
| 镜像 `02_commerce.sql` :33-45·`23_api_gateway.sql` :63 | 同位 | 0 | 23 尾=0156 offline 函数族+ACL（0157 函数族追加其后） |
| `_neg-harness.ts` :65 | 同位 | 0 | 镜像载入 01-22 **+23**（boot 实证）·镜像承重墙可承重 |
| `neg-interview.proof.ts` :262-264·`neg-bend.proof.ts` :29-31 | 同位 | 0 | 回归锚 |
| C 端五调用点 quiz:56/diag:59/resume:98/ql:50/dl:55 | 同位 **零 diff**（git status 实证） | 0 | §2.3 Ban 面零触 |
| runner `interview:prove:raw` 收据白名单 | scoring/×3·interview/interview-question·transcript/int-transcript 五处 DIR-B2 漂移 | 路径级 | 本刀回归所需·已按语义重定位修复（回归过闸必需）；同文件 `unstub-erase:prove:raw` 白名单同类漂移属他刀 prove 面=**观察登记零触**（超本片回归集） |

**STOP 条款核查**：锚点语义重定位全部成功（无失败）；无一处需触 §2 范围外（runner 白名单/脚本注册=收据基础设施+本刀 prove 注册面）。

## 二、0-c 前置闸（第一道硬闸·「形状×判据」矩阵·D-1 裁决）

探针卷按 rev2-R1/R2 兑现：参数化双形状（原 PV-1c 形状乙写死破除）+ §9-1 ⑤扩面（reconcileOwner B 端支路判支行为验证+错配 owner 反例留痕）+ §9-2 第⑥件（:224/:233 双路续约 rowCount）+ §9-5 ④b（B 端 abandon 零悬账面并入 ④·二择一已写死）。

| 形状\判据 | ①预留跨RLS | ②幂等单行 | ③RLS纵深 | ④回滚+④b零悬账 | ⑤sweeper B支 | ⑥租约续约 |
|---|---|---|---|---|---|---|
| **甲**(owner=候选人+payer=招聘方) | PASS | PASS | PASS | PASS | **PASS** | **PASS** |
| 乙(owner=招聘方) | PASS | PASS | PASS | PASS | **FAIL** | **FAIL** |

- 全卷 24 断言/形状·12 格留痕·缺格=裁决无效（全 log：`preverify/preverify-final-tree-run.log`）。
- **乙⑤ FAIL 实证**：判支 `SELECT interview WHERE owner_user_id=行 owner` 在招聘方 RLS 语境必 0 行 → B 端行静默误入 C 端 abandon 支（§9-1 预言复现·05_interview_jobs p_owner owner-only）。
- **乙⑥ FAIL 实证**：renewReservationLease 以 dispatch owner（=候选人）语境续约 owner=招聘方行 → rowCount=0 → 活会话断供；行 owner 语境续约可通但需 :224/:233 每 renewal 先解析消费行 owner（新增 plumbing·INFO 行留痕）。
- **D-1 裁决（写死入 0157 头注）= 形状甲**：消费行 `owner_user_id`=候选人·`payer_user_id`=招聘方（取全 PASS 者·乙 4/6 不过）。
- 闸执行序合规：闸跑于 0157 书写**之前**（隔离 runner·零生产 DSN·本地临时 PG）；终树复跑同矩阵（PV-0 双态兼容 0156 前态/0157 终态）。

## 三、0157 迁移（S2-C1）

`packages/db/migrations/0157_billing_payer_route.sql`：payer_user_id expand-only（NULL=C 端本人）→ 脏值检测（0156:34-45 形·存量零回填 fail-loud）→ RLS 在位 fail-closed 断言（0156:55-72 同形·对象=entitlement_consumption）→ 受控 DEFINER 函数族 `gateway_entpay_reserve`（owner=principal 派生·payer=job_application 单跳派生·授权链 0005:23+0155·幂等占坑/FIFO CAS/insufficient_entitlement 具名抛全同 reserveEntitlement 形）+ `gateway_entpay_apply_allocation`（allocation 作用域守卫·Ban 任意桶挪账）→ REVOKE 先于 GRANT FROM PUBLIC/app_role/app_gateway_role 全列+最小 EXECUTE TO app_role（0156:318-326·照 0041:139-161）。
**镜像承重墙**：`sql/02_commerce.sql` payer 列；`sql/23_api_gateway.sql` 函数族+ACL（0156 先例位）——neg-harness 直载可执行（neg:commerce 84 全绿实证）。

## 四、S2-C1~C9 实施对照

| # | 落点 | 状态 |
|---|---|---|
| C1 | 0157+镜像+commerce.ts 路由函数（reserveEntitlementForApplication/payer 感知 confirm/release/sweep·applyAllocationDelta 具名 rethrow 保 ⑤不静默 rowcount 码面） | ✅ |
| C2 | beginInterviewCore：application_id 非空 ⇒ DEFINER 企业预留（payer 单跳）·IS NULL ⇒ reserveEntitlement **逐字节零改**；企业不足 ⇒ 409 enterprise_insufficient_balance（Ban-5 无候选人 402）·C 端 402 零改 | ✅ |
| C3 | worker 面零改（形状甲红利·0-c⑤⑥ 背书）：确认/释放/abandon/sweeper/租约全走 commerce.ts 内部路由；sweeper 判支在候选人语境天然可见（:58）·桶退还经 applier；C 端五调用点零 diff | ✅ |
| C4 | applications.service.start 合一（形状 a：start 事务内联 beginInterviewCore·reqId 透传）·企业不足整事务回滚=CAS 零触（判据2a 实证）·分码 application_enterprise_pay_unavailable 402（候选人面·修法③文案） | ✅ |
| C5 | 幂等键=interviewId（uq 背书）·同 attempt 重放收敛单行（判据3d）·失败重试净扣 1 次（判据3a-c）·#218 入口收敛零字节 | ✅ |
| C6 | actions.ts 合一单调用+注释更正（:18）+402 分码接线（未知回落 legacy interview_credits_unavailable 零改）·application-start-error.ts 第二白名单 APPLICATION_START_REDIRECT_ERRORS+稳定消息（§9-8）·errors/action-error.ts jobs 页域渲染行 | ✅ |
| C7 | `entpay-s2.proof.ts` 新 proof（28 断言）+runner 注册（allowlist+命令映射+双 package.json 脚本） | ✅ |
| C8 | payment.ts CAS 增 `AND channel='online'` 单谓词（:77 区）·两调用点零改·判据5 a/b/c 全绿（offline 有效签名 webhw 409·订单滞 created·桶零入账·online credited 回归） | ✅ |
| C9 | commerce.service.ts :27 注释更正一行（user_account 实无 RLS·勘误①口径·零行为） | ✅ |

## 五、验收矩阵七判据 EXIT 全账（全离线本地·est live=0·EXIT=0）

| 判据 | 载体 | 结果 |
|---|---|---|
| 1 候选人零扣 | entpay:s2:prove 判据1a-e（双断言·真实 InterviewService/ApplicationsService 实例） | ✅ 5/5 |
| 2 start 前拒（+reused 零余额同拒·R8） | 判据2/2a-2e | ✅ 6/6 |
| 3 重试一次+幂等 | 判据3/3a-3e | ✅ 6/6 |
| 4 RLS 纵深 | 判据4 | ✅ |
| 5 C 端回归 | neg:interview **97 绿**·neg:commerce **84 绿**（片1 基线保持）·neg:bend **157 绿**·worker interview:prove:raw 全绿+收据 exit=0·C 端五调用点零 diff | ✅ |
| 6（槽位5）C8 channel 守卫 | 判据5/5b/5c | ✅ 3/3 |
| 7（槽位6）B 端 abandon 泄漏回归 | 判据6/6a/6b（企业桶回补∧行 released∧候选人桶零变∧sweeper 零扫·真实 abandon :526 面） | ✅ 3/3 |

**全账**：`entpay:s2:prove` **28/28 EXIT 0**（log：`entpay-s2-prove-run.log`）；preverify EXIT 0；三 neg 段+worker prove EXIT 0。
**uc-e2e-011 live 面**：B110 起 e2e:isolated 冻结（est live=0·归协调方排程）——离线等价=neg:commerce 84（refund/pay 拒面全含）·如实登记。

## 六、TS 三门

| 门 | 结果 |
|---|---|
| contracts | **0 错** |
| web | **0 错** |
| api | 30 错=pristine HEAD **逐字节全同**（diff 空·预存 ai-graphs/ai-runtime/test 族） |
| db | 20 错=pristine HEAD **逐字节全同**（与 6799544f 头注「db tsc 20 误差=预存测试族」吻合） |

## 七、如实登记（诚实面）

1. **gateway 抛错 JS 面归一化**：0157 RAISE 的 pg 错误 `.code`=SQLSTATE('P0001')，与 reserveEntitlement 的 JS 惯例（code='insufficient_entitlement'）异形——`reserveEntitlementForApplication` 包装层单点归一 rethrow（beginInterviewCore catch 一判据两路径）。
2. **判据2d 路径形状**：reused 复用路零余额同拒经「行已存在→duplicate→core `rr.status!=='reserved'` 分支→409→映射 402」产生——与 C 端 :317 同构 lumping（C 端 duplicate 同映射 402）·登记不改。
3. **C 端 begin 体模块化**：begin() 事务体逐字搬移为 beginInterviewCore（同文件导出·C 端路径语义零变·neg:interview 97 绿背书）——签名/this 语义零变（dbid1 Object.create 冒烟形保持）。
4. **run-e2e-isolated.mjs 触面**：本刀注册面（entpay:s2:prove）+ interview:prove:raw 白名单 DIR-B2 五处重定位（回归必需）；unstub-erase:prove:raw 白名单同类漂移=他刀面零触（观察登记）。
5. **preverify 终树复跑**：PV-0 双态兼容（0156 前态/0157 终态）·矩阵同·闸记录以 EXEC 前态跑为准（0-c 协议序）+ 终树复跑为回归态。

## 八、停止条件核查

- 锚点语义重定位：全成功（漂移表全登记）✅
- 0-c 六件：形状甲全 PASS（乙不过=非 STOP·裁决规则取全 PASS 者）✅
- 隔离库零生产 DSN/零凭据落盘 ✅ · est live=0 ✅ · prove 无红（28/28 一次过末态）✅
- ⛔push ✅ · ⛔动主线 ✅ · ⛔触其他工作树 ✅ · 片3 零开工 ✅ · 零 secrets ✅ · pins 十一值零翻转 ✅ · markers=0（冲突标记 grep 零命中）✅

*entpay-slice2-exec · 2026-10-10 · 本收据随卷 commit（hash 见 commit message）· awaiting_post_prove_dual*

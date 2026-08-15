---
id: requirements_uc_commerce
name: 用例 · 交易 支付·通知幂等·退款·对账·grandfather
description: 交易 支付·通知幂等·退款·对账·grandfather 业务用例与测试用例（正常/异常/特殊/逃逸/并发/复杂/刁钻七类，38 UC / 62 TC）。
type: reference
scope: shared
level: spec
status: active
owner: product
related:
  - ./README.md
  - ../use-case-conventions.md
  - ../../testing/conventions/test-authoring.md
---

# Commerce 领域 · 最终用例与测试用例文档（评审收口版）

> **🔎 实现状态（对齐真实代码 · 2026-07）** — 本文是 TARGET 规格。**✅ 已实现+接线**：共享额度池 + FIFO 先到期先扣、no-oversell 结算 saga（`FOR UPDATE`+CAS 防超卖、exactly-once 结算账本、reserve→confirm→release、部分/降级按比例、租约心跳 TOCTOU 修复、reclaim/reconcile 对账已接线）；commerce:prove 44 断言、两轮审计。**🟠 部分 / ⬜ 未建**：真实支付渠道（微信/支付宝回调）、退款自动审批阈值、Subscription/Invoice、grandfather、兑换码等多为规格与 PIN；支付入口当前是抽象接口/本地 seed，非接通真实收单。核心不超卖/幂等/退款结算不变量已生效。

> 顺序铁律：用例 → 契约 → 状态机 → 测试 → 代码。本文为评审后定稿，已修复"承重对象漏状态机、退款链断裂、可退金额不可测、C 端子域缺失"四类硬伤。
> 货币一律以**整数分（minor unit, `int`）** 表示，禁用浮点；点数（credit）以**整数 unit** 表示。所有改状态路径必须落在四原语（CAS / 幂等键 / RLS / 持久有序事件日志）之一。

## 0. 七类 case 图例与全局口径

标签：`[正常] [异常] [特殊] [逃逸] [并发] [复杂] [刁钻]`。每条 UC 在标题行声明覆盖到的类。

### 0.1 状态机增补（本次新增/补边，作为 status-machine.md 的 delta，见 openDecisions）

**PaymentOrder**（钱路径 SERIALIZABLE）枚举定稿：
`created · pending · paid · fulfilled · fulfill_failed · refunding · refunded · closed · expired`
- 既有边保留。**新增补边**：`closed→refunding`、`expired→refunding`（"无主收款"：订单已被用户取消/超时关单，但渠道侧实际扣款成功的迟到回调 → 走独立自动退款链，封堵"已关单却实付却无合法迁移"的断裂，对应 UC-25）。
- `created/pending` 两态均可 `→closed`（用户主动取消）或 `→expired`（系统超时）；二者都是未支付终态，仅审计来源不同。

**EntitlementAccount**（本次新建，消除 UC-16 冻结悬空）枚举：`active · frozen · closed`
| from | to | 触发 | 守卫 | 失败动作 |
|---|---|---|---|---|
| active | frozen | 对账不平 / 风控命中 / 运营手动 | 操作者具运营角色（RLS） | — |
| frozen | active | 运营复核通过 / 申诉成立 | 不平差额已勾平且留痕 | 复核拒绝 → 维持 frozen |
| active·frozen | closed | 账号注销 | 余额清算完毕 | — |
- 新增字段：`balance`(可用)、`reserved`(已预留)、`refund_hold`(退款审批期冻结)、`version`。`frozen` 时所有**扣减类**（reserve / refund_debit）被业务校验拒绝，**回补类**（release / credit）允许，避免把用户锁成 dead-end。

**RefundOrder**（本次补全节点）枚举：`requested · approved · rejected · refunding · refunded · failed · manual_pending`
| from | to | 触发 | 守卫 | 失败动作 |
|---|---|---|---|---|
| requested | approved | 自动阈值命中 / 人工批准 | 命中 refund_hold 成功（未消耗已冻结） | — |
| requested | rejected | 不可退（已全额消耗 / 规则拒） | — | 终态，释放 refund_hold |
| approved | refunding | 调用渠道退款 | 持幂等键 | — |
| refunding | refunded | 渠道退款成功回调 | 金额复核 + 权益回收 CAS | — |
| refunding | failed | 渠道返回不可退 | 原路不可达 | → manual_pending |
| failed | manual_pending | 转人工打款 / 改方式 | — | 人工台账接管 |
| manual_pending | refunded | 人工打款确认 | 运营双签 | — |

**ConsumptionRecord**（锁定唯一部分交付规则）枚举：`reserved · confirmed · released · partial_confirmed`
- **唯一规则（锁定，取消"或"）**：部分交付一律走 `partial_confirmed`，并落两列 `confirmed_units` / `released_units`，强约束 `confirmed_units + released_units == reserved_units`（DB CHECK）。不允许"整单 release 二选一"，规则确定可测。

### 0.2 数值口径（定稿阈值，可调项见 openDecisions）
- 支付 TTL `created/pending→expired` = **15min**；reserve TTL = **72h**；补单窗口 T = **24h**；回调时间戳时钟漂移容差 = **±5min**；退款审批自动阈值 = 单笔 **≤ 20000 分** 且 未消耗占比 = 100% → 自动 approve，否则人工。
- 金额精度：折扣计算在分级别 **half-up** 四舍五入，单测覆盖 `0.5 分` 进位边界；折后存 `final_amount`(int 分) 快照。
- 多币种：下单时 `currency` + `fx_rate` 快照入库；**退款按原币原额，永不重算汇率**。
- 点数来源标记：`entitlement_ledger.source ∈ {paid, gift, trial}`，`source_order_id`、`unit_price`(实付单价分)。**消费扣减优先级（锁定默认）**：`gift → trial → paid(按 grant_at FIFO)`；`gift/trial` 不可退现金。
- 可退金额归集口径（UC-30 锁定）：**按订单分桶 + 实付单价折算**。`refundable(order) = remaining_paid_units(order) × unit_price(order)`，`remaining_paid_units` = 该订单 credit 入账 units − 已 FIFO 分摊到该订单的 confirm/refund_debit units。算法确定，可写属性断言。
- **勾稽恒等式（修正 UC-16 量纲）**：`balance + reserved + refund_hold == Σcredit − Σconfirm_debit − Σrefund_debit`（全部 units 量纲一致）。

---

## 1. 既有用例（评审通过项，定稿微调）

### UC-COMMERCE-01 · 创建充值订单 `[正常][特殊]`
- **角色**：求职者　**前置**：已登录，定价表 active。**触发**：选套餐下单。
- **主流程**：1) RLS principal 入上下文 2) 读 active 定价，**快照** `currency/fx_rate/list_amount/discount/final_amount` 入 `payment_order` 3) 状态 `created` 4) 返回订单号。
- **备选 A1**：带折扣码 → 校验码有效性后写 `final_amount` 快照。
- **异常 E3 越权**：非属主读单 → RLS 0 行 → 404。
- **特殊**：首单/多语言——计费币种取**用户 locale 对应区域定价并快照**，UI 文案 i18n 不影响快照值。
- **后置**：`payment_order=created`；写定价快照 + `domain_event(order_created)`。
- **验收**：下单后 `final_amount` 为快照常量，后续定价改动不影响本单。
- **关联**：契约 `POST /commerce/orders`；状态机 PaymentOrder；原语 RLS；安全：金额服务端计算，禁信前端传入金额。
- **TC**：
  - `TC-COMMERCE-01-i18n`（**集成**，修正：原标"单元"不足）：以 zh/en locale 下单 → **落库**断言 `currency` 快照值正确且后续定价变更不回写本单。
  - `TC-COMMERCE-01-amount`（单元）：折扣 `0.5 分` 边界 half-up 断言。
  - `TC-COMMERCE-01-rls`（集成）：userB 读 userA 订单 → 404、0 行。

### UC-COMMERCE-02 · 未支付订单超时关单 `[正常][并发][刁钻]`
- **角色**：系统（定时）　**触发**：`created/pending` 超 15min。
- **主流程**：CAS `created/pending→expired WHERE status=$from AND version=$v`。
- **异常 E1/E2 关单 vs 迟到回调竞态**：关单与"支付成功回调"并发 → 二者均为 CAS，**恰一个赢**；若回调先赢则单进 `paid`，关单 CAS 返回 0 行回查放弃；若关单先赢、回调后到且渠道实扣 → 转 UC-25 无主收款退款链。
- **刁钻（时钟漂移）**：回调时间戳超 `±5min` 容差 → 标记可疑、人工复核，不直接入账。
- **后置**：`expired`；写 `domain_event(order_expired)`。
- **验收**：并发关单/回调 → 终态唯一且账实一致。
- **关联**：状态机 PaymentOrder；原语 CAS。
- **TC**：
  - `TC-COMMERCE-02-race`（**集成/Testcontainers 并发**，修正：原标"graph/集成"，与 graph 无关，纯 DB CAS）：并发触发关单+回调 → 断言恰一态、无双账。
  - `TC-COMMERCE-02-skew`（单元）：时间戳 +6min → 判可疑。

### UC-COMMERCE-03 · 拉起支付渠道 `[正常][逃逸]`
- **主流程**：`created→pending`，向渠道下预支付单，返回支付参数。
- **逃逸**：渠道不可用 → 不改单态，返回可重试错误，用户可在"我的订单"重试（UC-17）。
- **TC**：`TC-COMMERCE-03-down`（集成）：渠道 5xx → 订单仍 `pending` 可重试。

### UC-COMMERCE-04 · 支付异步通知回调 `[正常][异常][并发][刁钻]`
- **角色**：渠道→系统　**触发**：异步通知。
- **主流程**：1) **验签**（服务端密码学）2) 幂等键 `(order_no, channel_seq)` UNIQUE 去重 3) **金额复核** `notify_amount == order.final_amount && currency 一致` 4) 乱序守卫（仅 `pending/created` 可入 `paid`）5) CAS `→paid` 6) 事务性 outbox 派生履约事件。
- **异常 E4 金额不符**：告警、不入账、不改单。
- **刁钻 badsig**：验签失败 → 拒绝、记安全事件，**不暴露原因细节**。
- **并发 E1 重复回调**：同幂等键二次 → `ON CONFLICT DO NOTHING`，副作用仅一次。
- **后置**：`paid`；写 `payment_notify_ledger`、`domain_event(order_paid)`。
- **验收**：重复/乱序/篡额/伪签四类各自被对应机制拦截，恰一次入账。
- **关联**：状态机 PaymentOrder；原语 幂等键+CAS；安全：验签+金额复核。
- **TC**：
  - `TC-COMMERCE-04-idem`（集成）：同通知发 2 次 → 一条 paid 账。
  - `TC-COMMERCE-04-badsig`（**验签函数单元 + 拒绝集成**，修正：原标"契约+集成"，Zod 测不了签名）：伪签 → 单元断言验签 false；集成断言 401/不入账。
  - `TC-COMMERCE-04-amount`（集成）：篡额回调 → 不入账+告警。

### UC-COMMERCE-05 · 权益履约发放 `[正常][异常][复杂]`
- **主流程**：`paid→fulfilled`；向 `entitlement_account` credit（source=paid, source_order_id, unit_price）CAS 增 balance；写 `entitlement_ledger(credit)`。
- **异常 E4 发放 CAS 失败**：→ `fulfill_failed`。
- **复杂**：履约与回调跨表，靠 outbox 最终一致（见 UC-34）。
- **后置**：`fulfilled` + ledger credit。
- **验收**：一笔 paid 恰一条 credit ledger（幂等键=order_no）。
- **TC**：`TC-COMMERCE-05-once`（集成）：重放履约事件 → credit 仅一条。

### UC-COMMERCE-06 · 履约失败重试 `[异常][逃逸]`
- **主流程**：`fulfill_failed→fulfilled` 重试（幂等键防重发）；超重试 → `refunding`（逃逸到自动退款）。
- **TC**：`TC-COMMERCE-06-retry`（集成）：重试不重复发权益；超阈 → refunding。

### UC-COMMERCE-07 · 启动消费占用权益（reserve）`[正常][异常][并发]`
- **主流程**：按扣减优先级 `gift→trial→paid(FIFO)` 计算可用；CAS 扣 balance、增 reserved；`INSERT consumption_record(reserved, idempotency_key) ON CONFLICT DO NOTHING`。
- **异常**：额度不足 → 拒绝启动（不改任何账）。
- **并发 E2**：同会话双击 → 幂等键唯一，仅一次预留。
- **后置**：`reserved`；balance↓ reserved↑。
- **TC**：`TC-COMMERCE-07-idem`（集成）；`TC-COMMERCE-07-insufficient`（集成）。

### UC-COMMERCE-08 · 消费结算 confirm / release / 部分交付 `[正常][异常][复杂]`
- **主流程**：面试 completed → `reserved→confirmed`（reserved→0，写 `confirm_debit` ledger，按 FIFO 分摊到来源订单）；failed/abandoned → `reserved→released`（回补 balance）。
- **复杂（部分交付，规则锁定）**：会话部分完成 → `reserved→partial_confirmed`，落 `confirmed_units`(已交付) + `released_units`(剩余回补)，DB CHECK `两者之和==reserved_units`。**不再二选一**。
- **后置**：confirmed/released/partial_confirmed + 对应 ledger。
- **验收**：`Σconfirmed_units + Σreleased_units == reserved_units`（部分交付恒等）。
- **TC**：
  - `TC-COMMERCE-08-partial`（**集成**，断言两列和=预留 + ledger）。
  - `TC-COMMERCE-08-cancel`（**集成为主 + e2e 仅验交互**，修正：原标"e2e"难断言账本）：集成断言 release 回补 balance，e2e 仅验取消按钮交互。

### UC-COMMERCE-09 · reserve TTL 到期自动 release `[特殊][逃逸][并发]`
- **主流程**：reserved 超 72h → 系统 CAS `reserved→released` 回补。
- **并发**：TTL release 与正常 confirm 竞态 → CAS 恰一赢。
- **TC**：`TC-COMMERCE-09-ttl`（集成）：超时自动回补；与 confirm 并发恰一态。

### UC-COMMERCE-10 · 发起退款 `[正常][异常]`
- **主流程**：用户/运营发起 → 创建 `refund_order(requested)`，关联 payment_order（PAID/FULFILLED），按 UC-30 算 `refundable`，并**冻结未消耗权益到 refund_hold**（UC-27）。
- **异常**：订单非可退态 → 拒绝。
- **后置**：`refund_order=requested` + refund_hold 占用。
- **TC**：`TC-COMMERCE-10-create`（集成）。

### UC-COMMERCE-11 · 可退金额计算与拒退 `[异常][复杂]`
- **主流程**：按 UC-30 归集口径算 `refundable`；全额未消耗 → 走自动审批；已全消耗 → `requested→rejected`（终态，释放 refund_hold）。
- **复杂**：跨订单/含折扣 → 按分桶单价折算。
- **验收**：`refundable` 由确定算法给出，可写等值断言；拒退后 refund_order 停在 `rejected`（明确终态）。
- **关联**：UC-26/UC-30。
- **TC**：`TC-COMMERCE-11-calc`（**属性测试/集成**，基于修正后归集算法）：随机消费序列 → refundable == 期望。`TC-COMMERCE-11-reject`（集成）：全消耗 → rejected 终态。

### UC-COMMERCE-12 · 退款完成回调 `[正常][异常][并发][特殊]`
- **主流程**：渠道退款成功 → `refunding→refunded`；金额复核（原币原额）；权益回收 CAS（扣 refund_hold/对应 units）；payment_order `→refunded`。
- **特殊（币种）**：按原币原额，禁汇率重算。
- **并发 E1**：重复退款回调幂等键去重。
- **TC**：`TC-COMMERCE-12-idem`（集成）；`TC-COMMERCE-12-currency`（集成）：原币原额。

### UC-COMMERCE-13 · 退款失败重试转人工 `[异常][逃逸]`
- **主流程**：`refunding→failed→manual_pending`，转人工台账。
- **逃逸**：见 UC-37 原路不可达细化。
- **TC**：`TC-COMMERCE-13-manual`（集成）：失败 → manual_pending。

### UC-COMMERCE-14 · 对账（ledger 勾稽）`[正常][复杂]`
- **主流程**：批量按账户跑勾稽等式（见 0.2 修正式）。
- **后置**：平 → 记对账通过；不平 → 触发 UC-16。
- **验收**：`balance+reserved+refund_hold == Σcredit−Σconfirm_debit−Σrefund_debit` 全账户成立。
- **TC**：`TC-COMMERCE-14-sum`（**属性测试**，基于**修正后等式**作 oracle）：随机生成 credit/confirm/refund/reserve 序列 → 等式恒成立。

### UC-COMMERCE-15 · 补单 `[异常][特殊]`
- **主流程**：渠道已收款本地无单，24h 内主动查询补建 paid 单并履约。
- **TC**：`TC-COMMERCE-15-recon`（集成）：渠道有/本地无 → 补 paid 并履约一次。

### UC-COMMERCE-16 · 对账不平冻结账户 `[异常][刁钻]`
- **主流程**：勾稽不平 → `entitlement_account active→frozen`（运营 RLS），记差额。
- **后置**：`frozen`；解冻走 UC-24（消除 dead-end）。
- **验收**：冻结后扣减类被拒、回补类仍允许；勾稽等式用**修正式**作 oracle。
- **关联**：状态机 EntitlementAccount；原语 CAS。
- **TC**：`TC-COMMERCE-16-balance`（**属性测试**，修正 oracle）：注入 1 分差 → 检出并冻结；冻结后 reserve 被拒、release 允许。

### UC-COMMERCE-17 · 余额/我的订单查询（前端兜底逃逸）`[正常][逃逸][特殊]`
- **角色**：求职者　**触发**：进"我的订单/钱包"。
- **逃逸（SSE/页面断连兜底）**：支付成功但前端未收到推送 → 用户**主动轮询/拉取订单状态**（commerce↔SSE 边界：SSE 无业务状态，真相在订单表）→ 看到到账，消除"付了看不到"死路。
- **特殊**：空钱包/首次无订单 → 空态引导。
- **后置**：只读，不改状态。
- **TC**：`TC-COMMERCE-17-poll`（**集成**）：回调已入账但无推送 → 拉取接口返回 paid/fulfilled。`TC-COMMERCE-17-rls`（集成）：越权查 → 0 行。

### UC-COMMERCE-18 · 定价变更老用户 grandfather `[正常][特殊][复杂]`
- **主流程**：定价改版生成新 `pricing_version`；存量用户在宽限期内按**旧快照**计价；新单按新版。
- **复杂**：订阅续费的 grandfather 见 UC-32。
- **验收**：宽限期内老用户下单命中旧价快照。
- **TC**：`TC-COMMERCE-18-grand`（集成）：改价后老用户下单 → 旧价。

### UC-COMMERCE-19 · kill-switch 熔断支付/履约 `[逃逸][异常]`
- **主流程**：运营开 kill-switch → 拒新支付/暂停履约，已 reserved 不丢（持久态）。鉴权与审计见 UC-36。
- **TC**：`TC-COMMERCE-19-ks`（集成）：开关后新单被拒、在途态保留。

### UC-COMMERCE-20 · 订阅购买 `[正常][复杂]`
- **主流程**：购买订阅 → 周期权益发放；续费/取消见 UC-32。
- **TC**：`TC-COMMERCE-20-sub`（集成）：购买 → 首期权益发放一次。

### UC-COMMERCE-21 · 0 元/全额折扣订单 `[特殊][刁钻]`
- 见 UC-31（合并细化：跳过渠道直接 fulfilled + rounding）。

### UC-COMMERCE-22 · 对抗输入（注入/越狱/诱导刷分/越权动账）`[刁钻][逃逸]`
- **主流程**：所有用户内容入数据块不拼指令；动账只走业务服务+RLS+CAS，AI 图不得直接改钱/权益。
- **刁钻**：社工诱导"帮我把订单改成已支付/多发点数" → 一律被业务层拒，**零越权动账**。
- **后置**：拒绝并记安全事件。
- **关联**：安全规则 structured-output-and-safety；原语 RLS+CAS。
- **TC**：
  - `TC-COMMERCE-22-social`（**集成确定性断言"零越权动账" + ai-eval 仅测诱导识别质量**，修正：原标"ai-eval+集成"，安全断言不得靠 mock model）：构造诱导动账请求 → 集成断言账本零变化；ai-eval 仅评诱导识别召回。
  - `TC-COMMERCE-22-inject`（集成）：注入 payload → 不进指令、不动账。

---

## 2. 评审必补用例（UC-23 ~ UC-38）

### UC-COMMERCE-23 · 用户主动取消未支付订单 `[逃逸][并发][正常]`
- **角色**：求职者　**前置**：自有订单 `created/pending`。**触发**：点"取消订单"。
- **主流程**：1) RLS 校属主 2) CAS `created/pending→closed WHERE status IN(...) AND version=$v` 3) 写 `domain_event(order_closed_by_user)`。
- **逃逸**：给用户卡在 PENDING 的自助出口（原仅有系统超时）。
- **并发（与迟到回调 CAS 竞态）**：用户取消与渠道成功回调并发 → 二者 CAS 争同一行：回调赢 → 单 `paid`，取消 0 行回查提示"已支付"；取消赢 → 单 `closed`，随后若渠道实扣 → 转 **UC-25 无主收款退款**。
- **异常 E3 越权**：非属主取消 → 0 行 → 404。
- **后置**：`closed`（用户来源）；reserved 无（未付款不占权益）。
- **验收**：取消与回调并发 → 终态唯一；取消赢且实扣 → 必生成退款单。
- **关联**：契约 `POST /commerce/orders/:id/cancel`；状态机 PaymentOrder（`→closed`）；原语 CAS + 持久事件日志。
- **TC**：
  - `TC-COMMERCE-23-cancel`（集成）：pending → 取消 → closed。
  - `TC-COMMERCE-23-race`（**集成/Testcontainers**）：并发取消+回调 → 恰一态；取消赢+实扣 → 触发退款链。
  - `TC-COMMERCE-23-rls`（集成）：越权取消 → 404、0 行。

### UC-COMMERCE-24 · 账户冻结后的解冻/申诉/运营复核恢复 `[逃逸][异常][特殊]`
- **角色**：求职者（发起申诉）/ 运营（复核）　**前置**：`entitlement_account=frozen`（UC-16）。
- **主流程**：1) 用户提交申诉（写 `appeal` 记录）2) 运营复核差额来源 3) 勾平差额并留痕 4) CAS `frozen→active`。
- **逃逸**：消除"冻结=永久无法消费"的 dead-end（C 端定位 + demo no-dead-ends）。
- **异常**：复核不成立 → 维持 frozen + 给用户可解释结论与下一步。
- **特殊（i18n）**：申诉结论文案中英双语。
- **刁钻（越权解冻）**：非运营尝试解冻 → RLS 拒（仅运营角色）。
- **后置**：`active`（成功）或 `frozen`（维持）；写运营审计（操作人/原因/差额）。
- **验收**：冻结账户存在一条可达的恢复路径；解冻必须运营角色 + 留痕。
- **关联**：契约 `POST /commerce/accounts/:id/unfreeze`、`/appeals`；状态机 EntitlementAccount（`frozen→active`）；原语 CAS + RLS + 持久事件日志。
- **TC**：
  - `TC-COMMERCE-24-unfreeze`（集成）：运营复核 → active，扣减恢复可用。
  - `TC-COMMERCE-24-rls`（集成）：非运营解冻 → 拒、0 行。
  - `TC-COMMERCE-24-deadend`（e2e）：冻结用户界面存在申诉入口（无死路）。

### UC-COMMERCE-25 · CLOSED/EXPIRED 订单实付的"无主收款"自动退款链 `[异常][刁钻][复杂]`
- **角色**：渠道→系统　**前置**：订单已 `closed/expired`，迟到回调显示渠道实扣。
- **主流程**：1) 验签+幂等键 2) 金额复核 3) 识别单已是未支付终态 → **不入账、不发权益** 4) 走补边 `closed→refunding` / `expired→refunding` 5) 创建 `refund_order(approved, reason=orphan_charge)` 6) 原路退款。
- **刁钻（状态机断裂修复）**：原"已关单却实付"在状态机无合法迁移边 → 本 UC 补边封堵。
- **异常 E1 重复迟到回调**：幂等键去重，仅一次退款。
- **复杂**：跨 PaymentOrder↔RefundOrder 链路衔接。
- **后置**：`refunding→refunded`；权益不发放（从未 fulfilled）；写 `domain_event(orphan_charge_refunded)`。
- **验收**：关单后实扣 → 必走退款且不发权益；重复回调仅退一次。
- **关联**：状态机补边 `closed/expired→refunding`；原语 幂等键 + CAS。
- **TC**：
  - `TC-COMMERCE-25-orphan`（集成）：closed 单收实扣回调 → 自动退款、零权益。
  - `TC-COMMERCE-25-idem`（集成）：重复回调 → 退款一次。

### UC-COMMERCE-26 · 退款审批环节 + 拒绝终态 `[异常][复杂]`
- **角色**：系统（自动）/ 运营（人工）　**前置**：`refund_order=requested`。
- **主流程**：1) 命中自动阈值（≤20000 分 且 未消耗占比 100%）→ CAS `requested→approved` 2) 否则进人工队列，运营双签 → `approved` 3) 不可退 → `requested→rejected`（终态）。
- **复杂**：审批前必须先成功占用 refund_hold（UC-27），否则不得 approve。
- **异常**：审批期外部状态变化（用户又消费）→ refund_hold CAS 失败 → 退回人工。
- **后置**：`approved`/`rejected`；写审批审计（规则/操作人/阈值命中）。
- **验收**：自动/人工两路都有明确落点；拒退停在 `rejected`，不再悬空。
- **关联**：状态机 RefundOrder（补 `approved`/`rejected`）；原语 CAS + 持久事件日志。
- **TC**：
  - `TC-COMMERCE-26-auto`（集成）：小额全未消耗 → 自动 approved。
  - `TC-COMMERCE-26-manual`（集成）：大额 → 入人工队列、双签 approved。
  - `TC-COMMERCE-26-reject`（集成）：已消耗 → rejected 终态。

### UC-COMMERCE-27 · 退款申请期未消耗权益冻结（refund_hold）`[刁钻][高并发][复杂]`
- **角色**：系统　**前置**：退款 `requested`。
- **主流程**：1) 计算未消耗 units 2) **CAS 从 balance 移入 refund_hold**（`balance-=u, refund_hold+=u WHERE balance>=u AND version=$v`）3) 此后消费可用额不含 refund_hold。
- **刁钻/并发（双花窗口封堵）**：原 `requested→approved` 之间用户继续消费 = 真实双花窗口；本 UC 用 refund_hold 在**发起即冻结**，CAS 保证"冻结"与"消费扣减"互斥——并发时恰一个赢，退款拒绝 → 释放 hold 回 balance。
- **异常**：冻结时余额已被消费掉部分 → 仅冻结剩余可冻额，refundable 相应下调（与 UC-30 一致）。
- **后置**：refund_hold 占用；勾稽式含 refund_hold 项。
- **验收**：退款发起后并发消费 → 不能动用 refund_hold 内 units（无双花）。
- **关联**：原语 CAS（balance↔refund_hold 互斥）；勾稽恒等式新增 refund_hold 项。
- **TC**：
  - `TC-COMMERCE-27-hold`（**集成/Testcontainers 并发**）：退款发起后并发 reserve → reserve 拿不到 hold 内额度，断言无双花。
  - `TC-COMMERCE-27-release`（集成）：拒退 → hold 释放回 balance。

### UC-COMMERCE-28 · 部分交付结算 `[复杂][异常]`
- **角色**：系统　**前置**：会话部分完成、`consumption_record=reserved`。
- **主流程（锁定唯一规则）**：`reserved→partial_confirmed`，写 `confirmed_units`(已交付) + `released_units`(回补)，DB CHECK 和=`reserved_units`；confirmed 部分写 confirm_debit ledger，released 部分回补 balance（CAS）。
- **异常**：和不等于 reserved → DB CHECK 拒绝，事务回滚。
- **复杂**：与 FIFO 来源分摊联动（confirm 优先扣 gift/trial）。
- **后置**：`partial_confirmed`；两类 ledger 各一。
- **验收**：`confirmed_units+released_units==reserved_units` 恒成立；不存在既 confirmed 又 released 的单条记录。
- **关联**：状态机 ConsumptionRecord（补 `partial_confirmed`）；原语 CAS + DB CHECK。
- **TC**：
  - `TC-COMMERCE-28-partial`（集成）：交付 60% → confirmed_units/released_units 比例正确、和=预留。
  - `TC-COMMERCE-28-invariant`（集成）：构造和≠预留 → DB 拒。

### UC-COMMERCE-29 · 赠送/试用点数来源与退款隔离 `[特殊][复杂][刁钻]`
- **角色**：系统/求职者　**前置**：账户含 gift/trial/paid 混合 ledger。
- **主流程**：1) credit 入账标 `source` 2) 消费扣减按 `gift→trial→paid(FIFO)` 3) 退款仅对 paid 剩余 units 计现金，gift/trial 不退现。
- **特殊（有效期）**：gift/trial 带 `expire_at`，到期 CAS 作废（写 `expire_debit` ledger，不计可退）；paid 默认不过期（可调，见 openDecisions）。
- **刁钻（刷可退）**：用户先消费 paid 留 gift 想多退？扣减优先级固定为 gift 先扣，杜绝"留高价 paid 套退款"。
- **复杂**：可退金额基数仅含 paid 桶（UC-30）。
- **后置**：ledger 带 source；可退基数排除 gift/trial。
- **验收**：消费扣减顺序确定；退款金额仅基于 paid 剩余。
- **关联**：原语 CAS（扣减/作废）+ 业务校验（来源隔离）。
- **TC**：
  - `TC-COMMERCE-29-priority`（集成）：混合余额消费 → 先扣 gift。
  - `TC-COMMERCE-29-norefund`（集成）：仅剩 gift → refundable=0。
  - `TC-COMMERCE-29-expire`（集成）：gift 到期 → 作废、不入可退。

### UC-COMMERCE-30 · 可退金额归集口径 `[复杂]`
- **角色**：系统　**前置**：跨多订单充值、含折扣单。
- **主流程（确定算法，使 UC-11/14 可测）**：按订单分桶；`remaining_paid_units(order) = credit_units(order) − Σ分摊到该单的(confirm_debit+refund_debit) units`（消费 FIFO 分摊到来源订单）；`refundable(order) = remaining_paid_units(order) × unit_price(order)`（unit_price 为含折扣后实付单价）。
- **复杂**：多单不同单价、含折扣 → 分桶折算，禁混算。
- **后置**：只读计算，输出确定值。
- **验收**：给定消费序列，refundable 为确定函数，可写等值/属性断言。
- **关联**：业务规则 + 属性测试。
- **TC**：`TC-COMMERCE-30-bucket`（**属性测试/集成**）：随机多单+消费 → refundable == 引用实现期望，且 ≤ 该单实付额。

### UC-COMMERCE-31 · 0 元/全额折扣订单 + 金额精度 `[特殊][边界][刁钻]`
- **角色**：求职者　**前置**：折后 `final_amount==0`。
- **主流程**：`final_amount==0` → **跳过渠道**，直接 `created→fulfilled`（无 paid 回调），发权益（标 source=paid, unit_price=0）。
- **特殊/边界（rounding）**：折扣计算 half-up 到分；`final_amount` 为 int 分快照；`0.5 分` 进位有确定结果。
- **刁钻**：滥用全额码批量 0 元刷量 → 由风控（UC-35）限频，但本 UC 保证账务正确（0 元单不可退现金、可退 units=0）。
- **后置**：`fulfilled`，无渠道账。
- **验收**：0 元单不经渠道直接发权益且 refundable=0；rounding 边界确定。
- **关联**：状态机补 `created→fulfilled`（仅 amount=0）；原语 CAS + 约束。
- **TC**：
  - `TC-COMMERCE-31-zero`（集成）：0 元单 → 直接 fulfilled、无 paid。
  - `TC-COMMERCE-31-round`（单元）：rounding 0.5 分 half-up。

### UC-COMMERCE-32 · 订阅自动续费 `[异常][复杂][并发]`
- **角色**：系统（定时扣款）/ 求职者（取消）　**前置**：active 订阅。
- **主流程**：1) 周期到 → 幂等键 `(subscription_id, period)` 发起续费扣款 2) 成功 → 发周期权益 + grandfather 续费按签约时旧价 3) 用户取消 → 标 `cancel_at_period_end`，到期不再扣。
- **异常（续费扣款失败）**：渠道失败 → 重试预算内重试；超阈 → 降级为过期/宽限期，通知用户，不发权益。
- **并发**：定时器重复触发 → 幂等键保证一期仅扣一次。
- **复杂**：续费回调幂等 + grandfather 价格快照随订阅走。
- **后置**：续费成功（新周期 fulfilled）/ 失败（grace/expired）/ 取消（到期终止）。
- **验收**：一期恰一次扣款；取消后不再扣；续费命中签约旧价。
- **关联**：原语 幂等键 + CAS；状态机（订阅周期态，作为 openDecision 新增对象）。
- **TC**：
  - `TC-COMMERCE-32-renew`（集成）：一期一扣，幂等。
  - `TC-COMMERCE-32-fail`（集成）：扣款失败 → grace、不发权益。
  - `TC-COMMERCE-32-cancel`（集成）：取消 → 到期停扣。
  - `TC-COMMERCE-32-grand`（集成）：续费用旧价。

### UC-COMMERCE-33 · 发票/开票与退款红冲 `[特殊][合规][复杂]`
- **角色**：求职者（申请开票）/ 系统　**前置**：已支付订单。
- **主流程**：1) 申请开票 → 生成发票记录（金额=实付）2) 已开票订单退款 → **红冲/作废原票**再退款 3) 部分退款 → 部分红冲。
- **特殊/合规**：国内 C 端充值开票必需；红冲留痕。
- **复杂**：发票状态 ↔ 退款状态联动（已开票必先红冲后退）。
- **后置**：发票 `issued→reversed`；退款继续。
- **验收**：已开票订单退款必触发红冲，红冲金额=退款金额。
- **关联**：状态机（Invoice 新增对象）；原语 持久事件日志。
- **TC**：
  - `TC-COMMERCE-33-reverse`（集成）：已开票退款 → 红冲一致。
  - `TC-COMMERCE-33-partial`（集成）：部分退 → 部分红冲。

### UC-COMMERCE-34 · outbox/domain_events 投递失败 `[异常][复杂][刁钻]`
- **角色**：系统（outbox 投递器/消费者）　**前置**：业务事务已提交、outbox 有待投递事件。
- **主流程**：1) 投递器按 `seq` 有序拉取 2) 投递成功标记 3) 消费者按事件幂等键去重处理。
- **异常（投递失败）**：投递失败 → 退避重试；超阈 → 进**死信队列**，告警，不丢事件。
- **复杂（顺序保证）**：同聚合事件按 `seq` 顺序投递，乱序到达由消费者幂等 + 顺序守卫处理。
- **刁钻（消费者重复消费）**：同事件重投 → 幂等键保证副作用一次（不重复履约/不双扣）。
- **后置**：事件 exactly-once 生效；死信可重放。
- **验收**：投递失败不丢事件；重投不产生重复副作用；同聚合顺序保持。
- **关联**：原语 持久有序事件日志 + 幂等键；事务性 outbox（业务表唯一真相）。
- **TC**：
  - `TC-COMMERCE-34-retry`（集成）：投递失败 → 重试成功，不丢。
  - `TC-COMMERCE-34-dlq`（集成）：超阈 → 死信、可重放。
  - `TC-COMMERCE-34-idem`（集成）：重投 → 履约副作用一次。
  - `TC-COMMERCE-34-order`（集成）：乱序到达 → 顺序守卫纠正。

### UC-COMMERCE-35 · 支付业务风控 `[异常][刁钻]`
- **角色**：系统（风控）　**前置**：下单/支付请求。
- **主流程**：1) 单日累计限额校验 2) 疑似盗刷规则（异地/高频/异常金额）拦截 3) 未成年人限制（实名+年龄）。
- **异常**：命中规则 → 拒绝下单/支付，记风控事件，可解释提示。
- **刁钻（对抗）**：高频小额试探、0 元码刷量 → 限频拦截。
- **后置**：拒绝或放行；写 `risk_event` 审计。
- **验收**：超单日限额/命中盗刷规则的请求被确定性拒绝。
- **关联**：业务校验 + 持久事件日志（风控审计）。
- **TC**：
  - `TC-COMMERCE-35-limit`（集成）：超单日限额 → 拒。
  - `TC-COMMERCE-35-fraud`（集成）：高频异地 → 拦截。
  - `TC-COMMERCE-35-minor`（集成）：未成年 → 限制。

### UC-COMMERCE-36 · kill-switch 鉴权与审计 `[刁钻][安全]`
- **角色**：运营　**前置**：UC-19 kill-switch。
- **主流程**：1) 开关操作仅运营角色（RLS）2) 每次开关写审计（操作人/时间/原因/范围）3) 关闭后恢复。
- **刁钻（越权熔断 DoS）**：非运营尝试开 kill-switch → RLS 拒，杜绝以熔断做拒绝服务攻击。
- **安全**：开关变更不可篡改审计。
- **后置**：开关态变更 + 审计。
- **验收**：仅运营可操作；每次变更有不可丢审计。
- **关联**：原语 RLS + 持久事件日志。
- **TC**：
  - `TC-COMMERCE-36-rls`（集成）：非运营开关 → 拒、0 行。
  - `TC-COMMERCE-36-audit`（集成）：开关 → 审计一条。

### UC-COMMERCE-37 · 原路退款不可达 `[异常][逃逸]`
- **角色**：系统/运营　**前置**：`refund_order` 渠道返回原路不可达（卡注销/支付方式失效）。
- **主流程**：`refunding→failed→manual_pending`；提供"改退款方式"或运营人工打款分支，运营双签确认 → `refunded`。
- **逃逸**：避免退款卡死（原 UC-13 仅重试转人工，无改方式/人工打款落地）。
- **异常**：人工打款金额需复核（原币原额）。
- **后置**：`refunded`（人工）或保持 `manual_pending`。
- **验收**：原路失败有人工兜底闭环，不卡死。
- **关联**：状态机 RefundOrder（`failed→manual_pending→refunded`）；人工接管 + 持久事件日志。
- **TC**：
  - `TC-COMMERCE-37-manual`（集成）：原路不可达 → manual_pending → 双签 refunded。
  - `TC-COMMERCE-37-amount`（集成）：人工打款金额=原币原额。

### UC-COMMERCE-38 · 同账户 reserve/refund_debit/expire 三方并发 `[高并发][复杂]`
- **角色**：系统　**前置**：同账户同时发生 reserve（消费占用）、refund_debit（退款扣回）、expire（赠送到期作废）。
- **主流程**：三类均对 `balance/reserved/refund_hold` 做 CAS；任意交错下 `balance>=0` 且勾稽恒等式成立。
- **高并发（三方）**：补齐原仅两两竞态的覆盖；属性测试随机交错。
- **复杂**：跨 reserve↔refund_hold↔expire 三聚合争同一账户。
- **后置**：账户态一致，无负余额、无双花。
- **验收**：任意并发交错 → `balance>=0` 且 `balance+reserved+refund_hold==Σcredit−Σconfirm_debit−Σrefund_debit`。
- **关联**：原语 CAS；勾稽恒等式作 oracle。
- **TC**：`TC-COMMERCE-38-3way`（**属性测试/Testcontainers 并发**）：随机交错三方操作 → 断言 balance≥0 且勾稽恒等。

---

## 3. 评审修订落实清单（self-check）
- ① 七类补齐：逃逸（UC-17/23/24/37）、特殊（UC-29/31/12 币种）、复杂归集（UC-30）、三方并发（UC-38）、订阅异常（UC-32）。
- ② 机制落地：CLOSED→REFUNDING（UC-25）、partial_confirmed（UC-28）、账户状态机（UC-16/24）、退款审批+REJECTED（UC-26）、refund_hold 封堵双花（UC-27）、kill-switch 鉴权审计（UC-36）、outbox 死信/幂等/顺序（UC-34）、金额精度 rounding（UC-31）。
- ③ 可测：可退口径算法（UC-30）、UC-28 锁定唯一规则、**勾稽等式量纲修正**（0.2 / UC-16）、阈值给定数值（0.2）。
- ④ 业务补全：发票红冲（UC-33）、风控（UC-35）、赠送退款隔离（UC-29）、订阅（UC-32）、用户取消（UC-23）、原路不可达（UC-37）。
- ⑤ 测试层修正：TC-04-badsig→验签单元+拒绝集成；TC-22-social→集成确定性+ai-eval 仅识别质量；TC-02-race→纯集成；TC-01-i18n→集成落库；TC-08-cancel→集成为主+e2e 仅交互；TC-16/14→属性测试基于**修正等式**。
---
id: requirements_interview_question_bank_reliability_security
name: 专家级训练库：可靠性、安全、隐私与 Agent Runtime
description: 面向 Staff/Principal 后端、支付平台、AI Runtime、SRE/安全岗位的结构化训练问题；以 Meetwise 已实现契约与已识别生产边界为证据，统一题面、评分和追问口径。
type: requirement
scope: shared
level: use-case
status: active
owner: product-architecture
version: 1
tags:
  - interview
  - reliability
  - security
  - privacy
  - commerce
  - agent-runtime
related:
  - ../../architecture/backend/commerce-saga.md
  - ../../architecture/backend/rls-isolation.md
  - ../../architecture/ai/agent-harness.md
  - ../../rules/global/production-invariants.md
  - ../../testing/strategy/test-strategy.md
---

# 专家级训练库：可靠性、安全、隐私与 Agent Runtime

## 缩略语阅读卡

本页中英文缩写先给中文含义再简称；完整术语表见 [统一术语](/ai-docs/product/glossary.md)。`AI（人工智能；本页指模型辅助能力）`、`LLM（大语言模型；外部、非事务性依赖）`、`SRE（站点可靠性工程；以服务目标和演练保障可靠性）`、`DB（数据库；订单和账本事实源）`、`CAS（比较并交换；并发安全的条件更新）`、`PSP（支付服务提供商；至少一次回调的外部渠道）`、`KMS（密钥管理服务；保存和轮换加密密钥）`、`PII（个人可识别信息；隐私数据）`、`RLS（行级安全；数据库逐行授权）`、`SSE（服务器发送事件；流式会话恢复协议）`、`HTTP（超文本传输协议；请求/回调协议）`、`SQL（结构化查询语言；事务更新语言）`、`DNS（域名解析系统；网络出口需防止解析被替换）`、`DLQ（死信队列；无法安全处理事件的去向）`、`SLI/SLO/SLA（服务水平指标/目标/对外承诺；依次是测量、内部目标和合同承诺）`、`RPO/RTO（恢复点/恢复时间目标；限制可丢失数据和恢复时长）`、`P95/P99（第 95/99 百分位延迟；衡量长尾慢请求）`与`E2E（端到端测试；真实全链路验证）`。

**适用岗位**：Staff/Principal 后端、支付平台、AI Runtime、SRE/安全负责人。

**建议时长**：15 题 × 8–12 分钟；总分 150。

**使用规则**：候选人回答必须给出状态机、原子边界、幂等键作用域、失败后行为和至少一个可执行验证指标；仅说“加锁 / 加 Redis / 上消息队列”计 0 分。

## 评分总规则

- 每题 10 分：0–2 分为术语罗列；3–5 分能说主路径；6–8 分能说出并发、崩溃和重试；9–10 分能给出可验证的不变量、边界与降级动作。
- 若把“数据库事务”说成可以覆盖支付渠道或 LLM 外部调用，或把“100% 高可用”当成可承诺数字，该题最高 2 分。
- 关键否决项（任意出现即本模块不通过）：重复支付/重复退款未给全局幂等策略；将用户输入拼进 system prompt；把 B 端候选人原始面试内容默认开放给招聘方；用内存状态作为扣费或 SSE 恢复真相。

---

## 1. 支付成功回调如何避免“一笔渠道流水给两张订单充值”？（P0，10 分）

**场景**：渠道重放回调、订单号被错误复用，或攻击者携带同一 `providerTxn` 请求两个订单。现有实现仅以 `payment_order` 的 `created→paid` CAS 防单订单重复。实测把同一 `providerTxn` 用于两张订单时，得到 `credited=2`、总发放 `20` 点。

**90 秒可口述完整答案**：我不会把“订单从 created 变 paid”当成唯一幂等边界，因为它只保护单张订单，不能证明同一真实支付没有被两张订单消费。收到回调后，先以渠道 `event_id` 建不可变接收记录，防同一通知重放；再以 `(provider, provider_txn)` 的全局唯一约束代表一笔真实付款只能归属一个订单。短数据库事务内锁定订单，重新核验验签后的订单号、金额、币种、商户和成功状态，才条件更新订单、写账本和权益事件。唯一冲突不是简单报错：同一事件要返回第一次处理结果，不同订单争同一流水要进入安全拒绝和对账。渠道确认永远在事务外，因此我还会把无法判定的超时留为可对账状态，并用“每 10,000 次重放的重复入账数为 0、账本差额为 0”而不是“永不重复”作为发布门。

**考察点**：渠道事件全局唯一性、金额/币种/商户校验、订单状态 CAS、权益入账与回调去重的原子性、重复请求返回语义。

**量化评分锚点**：

- 0–2：回答“查到 paid 就不处理”。
- 3–5：提出订单级幂等，但没有全局 `(provider, provider_txn)` 或 `(provider, event_id)` 唯一约束。
- 6–8：事务中完成回调去重、订单状态与权益账本；重复回调返回首次结果。
- 9–10：明确区分 `event_id`（回调去重）和 `provider_txn`（支付事实唯一）；校验 `amount/currency/merchant/order`；给出并发与崩溃测试，`duplicate credit = 0/10,000`。

**标准答案**：先持久化渠道事件，`UNIQUE(provider,event_id)`；同一支付流水还要有 `UNIQUE(provider,provider_txn)`（允许 NULL 时用 partial unique index）。在一个短 DB 事务内锁定订单、核验渠道查询结果/签名中的订单号、金额、币种、商户号和成功态，再 CAS 写 `paid`、写不可变资金账本、发权益、记录处理结果。事件已存在时返回先前处理结果的 2xx，不能“静默吞掉”。渠道确认与本地事务之间只能做到 `at-least-once delivery + idempotent fulfillment`，不能声称分布式事务。

```sql
BEGIN;
INSERT INTO psp_event(provider,event_id,payload_hash)
VALUES ($p,$event,$hash) ON CONFLICT DO NOTHING RETURNING event_id;
-- 未插入：读取既有处理结果并返回 2xx
SELECT * FROM payment_order WHERE id=$order FOR UPDATE;
-- 校验 amount/currency/merchant/provider_txn
UPDATE payment_order SET status='paid', provider_txn=$txn
 WHERE id=$order AND status='created';
INSERT INTO entitlement_ledger(...); -- 与上句同一事务
COMMIT;
```

**追问**：若渠道在本地提交成功后重试 100 次、或在关单后才通知已扣款，状态机分别如何落点？

**常见错误**：只把 `provider_txn` 设为订单内字段；把 HMAC 验签等同于金额核验；回调重复时返回 409 导致渠道无限重试。

**仓库证据**：`packages/db/src/payment.ts:34-48`；`packages/db/sql/11_commerce.sql:5-17`（当前 `provider_txn` 唯一约束数为 `0`）；`apps/api/src/modules/commerce/commerce.service.ts:56-67`。现有 `neg:commerce` 覆盖同订单重放和同订单并发，但“同流水→两订单”用例数为 `0`。

## 2. 设计可上线的 PSP webhook 鉴权与订单核验（P0，10 分）

**场景**：现有 webhook 使用 `HMAC(orderId:providerTxn:paid)`，不覆盖金额、币种、商户、事件时间、回调事件 ID。

**90 秒可口述完整答案**：webhook 不是用户请求，绝不能继承浏览器身份或相信 body 自带的 owner。处理器先在原始 body 上按渠道规定验证签名和时间窗，选择当前或上一把轮换密钥；再以本地订单反查 owner，并核对商户、订单号、整数最小货币单位金额、币种、交易号与支付终态。验签成功只是“来自渠道”，不是“这笔钱属于这张订单”，所以高风险或未知状态仍需向渠道查单。原文卡号、签名和密钥不进日志，只保存必要事件 hash、验签版本和处理结论。重放走事件幂等，关单后迟到的实扣款走人工/无主收款流程，而不能再次发权益；验签失败或金额不一致的入账数必须长期为 0。

**考察点**：原始请求体、渠道签名规范、重放窗口、密钥轮换、主动查单、日志脱敏。

**量化评分锚点**：

- 0–2：只说“验签”。
- 3–5：验签覆盖字段不完整，或接受客户端传入的 owner/金额。
- 6–8：校验官方签名、timestamp/nonce、事件去重与数据库订单快照。
- 9–10：使用渠道 SDK/证书或官方算法验证**原始 body**；证书轮换与时钟容忍有明确参数；签名通过但订单字段不一致的入账数 `0`；所有原始支付载荷日志脱敏率 `100%`。

**标准答案**：webhook 必须无登录态、无客户端 principal；从已验签的官方 payload 取 event/order/transaction，owner 只由本地订单查询得到。签名必须绑定原始 body 或渠道规定的 canonical form；校验 merchant/app id、amount（整数最小货币单位）、currency、order id、paid status，并对高风险/未知事件主动向渠道查单。保留事件摘要、hash、验签版本和处理结果，不记录卡号、完整签名或密钥。密钥/证书使用 KMS/secret manager 轮换并有双 key 过渡窗口。

**追问**：如果渠道重试的 event ID 相同但 payload hash 不同，你返回什么、告警什么、是否自动入账？

**常见错误**：在浏览器“支付成功页”完成入账；接受前端金额；只根据 URL `orderId` 认定成功；把签名写进 error log。

**仓库证据**：`apps/api/src/modules/commerce/commerce-webhook.controller.ts:4-16`；`apps/api/src/modules/commerce/commerce.service.ts:56-64`。

## 3. 面试额度的 reserve→confirm/release 怎样在崩溃、并发与部分交付下守恒？（P0，10 分）

**场景**：用户开始面试时预留 1 次额度；worker 可能重复消费任务、面试完成与超时回收竞争、报告生成失败但面试已完成。

**90 秒可口述完整答案**：额度不能放在图 state 或缓存里，而要以可审计账本和消费记录为真相。开始服务时我在短事务里用 `available >= requested` 的条件更新把额度从 available 转为 reserved，并写入带 interview ID 的唯一消费记录；同一用户双击只能读回同一 reservation。模型运行、浏览器断线和 worker 重试都在事务外。真正完成交付时，带消费 ID 的 outbox 事件把 reserved 条件转为 confirmed；取消、失败或租约过期只能转 released，部分交付则使用显式 partial_confirmed，不能用模糊状态。reconciler 回收前再次核验 lease，完成和回收以 version/CAS 竞争，输的一方重读终态。我会按 reservation 老化、超租约未结算数、同消费 ID 双确认数和账本守恒差额监控，任一重复确认或守恒差额非 0 都阻断发布。

**考察点**：余额守恒、行锁/CAS、source allocation、租约、outbox、对账、部分交付。

**量化评分锚点**：

- 0–2：读余额再减余额。
- 3–5：只提出 `SELECT FOR UPDATE`，没有超时/回收竞争处理。
- 6–8：reserve/confirm/release 是互斥状态迁移；完成事件走 outbox；有 sweeper。
- 9–10：给出账户守恒式和属性测试；`concurrent reserve` 恰一成功；`confirmed + released = reserved`；对账差额发现时有冻结、告警和人工路径。

**标准答案**：额度是账本/桶，不是面试图里的变量。用同一事务的条件更新或行锁保证 `available≥requested` 才能 reserve；`reserved` 只能转 `confirmed`、`released` 或显式 `partial_confirmed`。面试业务事务完成时写 `settlement_proposed` outbox；消费方以 `consumption_id` 或 `(interviewId,transition)` 幂等入结算账。租约过期回收必须在 `UPDATE … WHERE lease_expires_at < now()` 中复核，心跳成功与回收不能同时赢。报告失败不应反转已交付面试。

**追问**：你如何证明退款/回补后没有“多退 0.01”或“已确认又释放”？请说一个随机序列属性测试 oracle。

**常见错误**：把 AI graph 直接调用成扣费服务；把定时 sweeper 当主一致性机制；confirm 后仍允许普通 release。

**仓库证据**：`ai-docs/architecture/backend/commerce-saga.md:20-64`；`packages/db/src/commerce.ts`；`packages/db/test/commerce-saga.proof.ts`。

## 4. 退款、拒付与“已交付后退款”怎样避免死锁和重复退款？（P0，10 分）

**场景**：用户已完成面试后发生退款；或订单已经 closed/expired 但渠道晚到一条真实扣款回调。

**90 秒可口述完整答案**：退款是独立聚合，不是把原订单状态直接改回 created。服务端创建带退款原因和序号的 refund_order，并以原支付订单和渠道退款号作为幂等边界；短事务只写退款意图、账本与 outbox，向渠道请求退款由可重试消费者执行。渠道超时不代表失败，所以消费者先查询既有退款状态或等待对账，不能重新出款。退款成功与权益回收是两个事实：用户依法应得退款时，权益回收失败只能标坏账并进入人工复核，不能把退款卡死；迟到付款、拒付和已交付服务则进入明确的人工状态机。验证重点是相同退款命令和渠道回调重放 10,000 次时外部退款与本地账本均只出现一次，以及任何未知渠道状态都有可见对账出口。

**考察点**：支付退款和权益回收解耦、refund idempotency、人工复核、拒付/坏账、会计不可变性。

**量化评分锚点**：

- 0–2：直接把 `payment_order.status` 改为 `refunded`。
- 3–5：有退款状态但无渠道退款 idempotency key/回调处理。
- 6–8：退款单、渠道请求、回调和权益回收分开建模；重复事件不重复退款。
- 9–10：渠道退款成功率/处理时延有 SLO；已交付无法回收权益时对客退款不阻塞、进入 `refunded_uncollectible/manual_review`；重复退款事件 `0` 次二次出款。

**标准答案**：创建独立 `refund_order` 和不可变 ledger。一次退款动作用 `(payment_order_id, refund_reason, sequence)` 或渠道 refund id 做幂等，并把“向 PSP 发退款”做为可重试 outbox 命令。付款退款成功不能依赖权益回收成功：已消费权益标坏账/人工复核，但不得扣住用户退款。closed/expired 后确认实扣须走“无主收款退款”状态边，永不发权益。拒付必须能关联到原 transaction、冻结后续权益和人工处理，不得删除历史账。

**追问**：渠道退款请求超时，无法知道是否已受理时你如何重试？

**常见错误**：以 HTTP timeout 当渠道失败；退款和回收写成一个不可补偿的长事务；删除支付订单以“回滚”。

**仓库证据**：`ai-docs/architecture/backend/commerce-saga.md:93-122`；`ai-docs/requirements/use-cases/commerce.md` 的 UC-COMMERCE-12/25/27；当前 `payment_order` 仅有状态字段见 `packages/db/sql/11_commerce.sql:5-17`。

## 5. 为什么 LLM 调用不能仅靠本地数据库承诺 “exactly once”？（P0，10 分）

**场景**：模型供应商已生成答案并扣费，但进程在写 `ai_invocation_trace` 前被杀；重试后又调用一次。

**90 秒可口述完整答案**：我会明确说这不是单个数据库事务能解决的问题：数据库无法和任意模型 HTTP 服务原子提交。可控制的是本地结果至多提交一次：先写包含稳定 idempotency key、输入 hash、模型版本和 in_flight 状态的 invocation ledger；外呼时携带同一幂等键，返回后先做 schema/业务校验，再条件提交结果和用量。第二个相同请求看到 in_flight 不会盲目再调，而是等待、查询供应商或交给 reconciler；供应商不支持幂等或查询时，只能诚实地按至少一次外部执行设计，并限制成本和人工复核。验收要分别统计“本地结果重复提交 0”和“供应商重复调用未知/可观测”，绝不能把前者包装成 external exactly-once。

**考察点**：外部副作用原子边界、provider idempotency、in-flight ledger、结果可复用、诚实的语义表述。

**量化评分锚点**：

- 0–2：说“用数据库事务包住 HTTP 调用就 exactly once”。
- 3–5：只有本地唯一键，无法解释“外呼成功、本地未提交”的窗口。
- 6–8：说明至多一次本地提交与至少一次外呼的差别，并设计 in-flight 对账。
- 9–10：指出仅当 provider 也接受同一幂等键并提供查询/结果重放时，才能把**有效模型执行**压到至多一次；否则必须记录为 at-least-once external call，成本预算按最坏重复计。

**标准答案**：本地 DB 无法与任意 HTTP provider 做原子提交。先短事务写 `invocation_ledger(key,state=in_flight,request_hash)`；调用 provider 时传稳定 idempotency key；成功后短事务写已校验 output/usage 并 `committed`。看到 in-flight 的并发请求不得盲目重调，需等待、查询 provider 或由 reconciler 判定。provider 不支持幂等/查询时，只能保证本地事实“恰一次提交”，外部执行是至少一次；需在产品、成本和告警中如实表达。

**追问**：节点重放时 `turnId` 如果用 `Date.now()`/UUID 新生成，具体破坏了什么？

**常见错误**：`INSERT … ON CONFLICT DO NOTHING` 后仍返回本次模型输出；把缓存命中和 provider 执行一次混为一谈；在失败时无限重试。

**仓库证据**：`packages/ai-runtime/src/invoke.ts:51-103`；`ai-docs/architecture/ai/agent-harness.md` §3.2–3.4。

## 6. 如何既防 LLM 并发双调，又不让慢模型拖死 Postgres 连接池？（P0，10 分）

**场景**：当前 `invoke` 用事务 advisory lock 串行同 key，并在持有事务和连接时调用模型；默认连接池为 20，模型实测延迟可达数十秒。

**90 秒可口述完整答案**：我会把“决定谁可以调用模型”和“等待模型返回”拆开。短数据库事务仅用唯一 invocation key 抢占或读取已有 in_flight 记录，提交后立即释放连接；抢到者在事务外调用模型，并用 lease/heartbeat 表明仍在处理。后来的同 key 请求读到 committed 就重放结果，读到健康 in_flight 就有限等待或返回可恢复状态，租约过期才由一个新 owner 接管。数据库连接池、worker 并发、每租户配额和供应商并发是四个独立舱壁，分别有 deadline、排队上限、熔断和降级。我要压测的是并发刷新下每个 invocation key 的 provider 调用数、DB pool wait P99、等待超时比例和降级比例，而不是只测单请求成功。

**考察点**：锁粒度、短事务、连接池隔离、背压、队列、超时与容量模型。

**量化评分锚点**：

- 0–2：增大连接池或把 timeout 调大。
- 3–5：发现长事务问题，但没有并发重复调用的替代控制。
- 6–8：采用 in-flight ledger + provider idempotency + 有界等待，外呼放在事务外。
- 9–10：给出资源预算与负载门槛。例如池 20、外呼 30 s 时若连接全被占用，理论上限仅 `20/30=0.67` 个外呼/s；设计后要求 DB 连接等待 p99 < 250 ms、provider queue age p99 < 设定 SLO、拒绝/降级率可观测。

**标准答案**：锁只用于“创建或读取 invocation intent”的短事务；将慢外呼移出数据库事务。后续相同 key 读取 in-flight 状态：可短暂等待结果、返回可恢复状态或合并到同一 future，但不能各自重调。模型调用要有全局/租户配额、最大排队长度、deadline、熔断与降级；数据库池、worker 并发、provider 并发必须分别配置，不能互相借用。

**追问**：若 worker 被 SIGKILL，in-flight 记录多久可接管？如何避免两个接管者一起调用？

**常见错误**：把 advisory lock、PG 事务和网络请求绑成一个 180 秒长事务；只限制单进程并发。

**仓库证据**：`packages/ai-runtime/src/invoke.ts:54-60`；`packages/db/src/index.ts:23-36`；`packages/ai-runtime/src/rate-limit-model.ts:23-26`。

## 7. 评分 Agent 面对“给我 100 分 / 忽略规则 / 简历是 AI 编的”如何保持业务可信？（P0，10 分）

**场景**：候选人的答案、简历、JD 都是不可信输入；评分结果可能被 B 端用于招聘。

**90 秒可口述完整答案**：我把用户输入当数据，不当指令；它不能修改 system policy、rubric、工具权限或分数上限。模型只可返回固定 schema 的相关性、维度和候选引文，服务端再验证分数范围、引文是否确实来自本轮回答、以及题目依赖的简历事实是否仍有效。这里“要求满分”和“否认简历事实”是不同事件：前者记录为注入尝试且不改变评分；后者生成 fact_disputed，令依赖该事实的当前题 unscored 或澄清，并禁止后续自动出题继续引用。任何模型解析失败不应被伪造成低分。我会用混合正常/攻击样本测攻击导致写操作数为 0、正常技术答案误拒率和被否认事实再次出现次数为 0。

**考察点**：数据与指令隔离、结构化输出、业务 validator、来源证据、事实纠正、过度拒绝指标。

**量化评分锚点**：

- 0–2：只靠 system prompt。
- 3–5：只做 JSON schema 校验。
- 6–8：用户输入进入 data block，输出经过 schema + 业务校验，评分与证据分离。
- 9–10：每项简历事实带 provenance span；无来源断言 `0/N`；安全集泄露 `0/≥200`、合法答案误拒有独立上限；用户否认事实后下一题重复该前提 `0/N`。

**标准答案**：用户文本绝不拼进 system instruction；“给满分”等内容是数据，不能授权模型或工具。模型只产生受限 schema，服务端再校验分数区间、枚举、敏感内容及每一条候选人事实的来源 span。候选人纠正简历时产生明确的 `fact_disputed`/澄清状态，后续问题不得继续把该事实当真；不能因为拒绝注入而把正常技术答案也全部拒绝。

**追问**：为什么“JSON 合法”仍可能导致对候选人的实质歧视或虚假评价？

**常见错误**：让模型自行判断是否安全；把模型自评作为 grounding 证据；把拒绝率当安全率。

**仓库证据**：`ai-docs/rules/ai/structured-output-and-safety.md`；`ai-docs/rules/ai/safety-defense-in-depth.md`；`packages/ai-runtime/src/invoke.ts:81-100`。

## 8. Agent 工具调用怎样避免 SSRF、越权查人和“LLM 直接扣钱”？（P0，10 分）

**场景**：将来可能开放网页检索、题库、退款查询等工具；现有 Web allowlist 默认空，属于关闭态。

**90 秒可口述完整答案**：我不会把网页、查人、退款和删除能力交给模型自由选择。工具目录必须是服务端静态 allowlist，每个工具有输入 schema、调用预算、审计事件和最小权限；模型最多给出候选意图，不能拼 URL、SQL 或越过资源 owner。网络工具只允许固定域和协议，解析 DNS 后及每次重定向前都拒绝私网、回环和链路本地地址，并限制端口、响应字节和 deadline；网页返回内容仍是不可执行的数据。查人必须重新按当前 principal 做资源授权。退款和删除属于高影响业务命令，只能由确定性 API 在状态、金额、同意、幂等和人工审批都通过后执行。负向测试必须证明所有提示注入、任意 URL 和越权 ID 的真实副作用数为 0。

**考察点**：工具能力最小化、网络出口控制、DNS rebinding、工具结果不可信、支付工具的业务服务边界。

**量化评分锚点**：

- 0–2：用 prompt 限制工具。
- 3–5：只做域名白名单。
- 6–8：工具注册表、参数 schema、allowlist、超时、响应大小上限、审计。
- 9–10：同时防私网 IP、重定向、DNS rebinding 和 metadata endpoint；有 egress policy；钱和隐私动作经独立鉴权/CAS/幂等服务，Agent 仅能提交受审计 proposal。

**标准答案**：工具由服务端 registry 决定，不由模型自由拼 URL/SQL。网络工具在连接前后解析并拒绝私网/loopback/link-local，逐跳校验 redirect，限制方法、端口、DNS、字节数和 deadline；网络策略只允许 provider/tool 固定出口。工具返回值也当不可信 data block。`refund/credit/delete` 不能作为 LLM 可执行工具，只能由确定业务 API 在重新鉴权、状态校验、幂等和审计后执行。

**追问**：为什么只检查请求 URL 的 hostname 无法防 DNS rebinding？

**常见错误**：模型“不会调用”当控制；allowlist 写 `*.example.com`；让工具返回内容拼回 system prompt。

**仓库证据**：`ai-docs/architecture/ai/agent-harness.md` §3.6、§7.1；`apps/worker/src/main.ts`（`WEB_ALLOWLIST` 默认关闭）。

## 9. RLS 怎样在 HTTP、worker、checkpointer 与 B/C 端之间真正 fail-closed？（P0，10 分）

**场景**：C 端简历/面试原文只能归候选人；B 端可看经授权的申请状态/缓存评分；后台 worker 也会读写数据。

**90 秒可口述完整答案**：RLS 的价值只在每个读取路径都带着不可伪造的身份进入数据库。HTTP 和 worker 都应通过统一 asPrincipal 事务设置 app_role 与 principal；高权 dispatcher 只能枚举最小任务集合，真正处理每个 owner 时仍切回受 RLS 限制的连接。没有 owner 的 checkpoint 不能被“内部表”豁免：要么由 thread 映射回 interview owner 后授权读取，要么把 owner 写进可强制过滤的结构。B 端也不是管理员视图，而是经同意、岗位和用途限定后的最小投影，默认不含回答原文。我要用跨用户、跨 tenant、worker 重放、checkpoint 恢复四类 E2E 测试，要求越权返回数和 trace 中越权原文数均为 0。

**考察点**：`SET LOCAL`、事务池、FORCE RLS、app role、principal 传播、BYPASSRLS 最小化、checkpoint 例外。

**量化评分锚点**：

- 0–2：应用层 `WHERE owner_id`。
- 3–5：会写 RLS policy，但不谈连接池/GUC 生命周期。
- 6–8：每个事务绑定 principal；无 principal 返回 0 行；app 角色无 `BYPASSRLS`。
- 9–10：覆盖 HTTP、异步 job、缓存、trace、SSE、checkpointer；多角色矩阵越权读/写 `0/N`，成员撤销后访问失效窗口有明确目标。

**标准答案**：使用 `asPrincipal` 一类包装器，在事务内 `SET LOCAL ROLE app_role`、参数化 `set_config(..., true)`，事务结束自动清理。应用 DB role 既非表 owner 也没有 BYPASSRLS；高权 dispatcher 只能枚举必要 owner，逐条工作重新回到受 RLS 约束的 principal。checkpointer 若没有 owner 列无法天然套 RLS，必须以 thread→interview owner 反查授权或改变表结构；不能因为“内部表”而裸读。B 端只给基于授权/同意的投影，不给 transcript 原文。

**追问**：在 PgBouncer session mode 下为什么 `SET LOCAL`/长连接仍可能出事故？如何做集成测试？

**常见错误**：允许 worker 用超级用户处理整批用户；RLS 只测 SELECT、不测 INSERT/UPDATE/DELETE；把 404/空集误认为不需要审计。

**仓库证据**：`packages/db/src/index.ts:39-49`；`ai-docs/architecture/backend/rls-isolation.md:26-79`；`packages/db/test/recruiter-depth.proof.ts:78-121`。

## 10. 简历、答案和 B 端评分的 PII 生命周期应如何设计？（P0，10 分）

**场景**：简历需要被模型处理、保存在数据库、导出/删除；招聘方需要有限结论但不该默认看到原文和面试录音。

**90 秒可口述完整答案**：我先按用途和可识别性分层，而不是笼统说“数据库加密”。原简历、录音和答案属于高敏感原件，使用信封加密和独立密钥版本；评分、脱敏 profile、事件、模型 trace 和 B 端投影是不同对象，分别设置最短保留期和可见者。任何共享必须有 subject、purpose、policy version、recipient、范围、过期和撤回时间；B 端默认只读岗位必要的最小摘要，原文和录音需要额外、可审计的授权。撤回会停止新的共享、检索和模型处理，并异步传播到对象、索引、缓存和备份删除计划。我要量化导出/删除完成率、撤回后新增读取数、跨主体原文泄露数和各存储层的删除 SLA，而不是只展示一张“已同意”表。

**考察点**：数据分类、同意的目的/版本/撤回、加密和 KMS、最小化、保留期、删除级联、B 端授权与审计。

**量化评分锚点**：

- 0–2：说“数据库加密”。
- 3–5：只记录“已同意”，没有 purpose/version/revocation/retention。
- 6–8：原文加密、派生 profile 脱敏、trace 不存 PII、导出/删除有 RLS。
- 9–10：明确数据目录与删除 SLA；候选人可撤回针对 B 端共享的授权；招聘方读取每条都可审计；跨主体原文泄露 `0/N`；恢复备份中的删除策略明确。

**标准答案**：把原始简历、结构化脱敏资料、评分、事件、模型 trace、B 端投影分层。原文使用 envelope encryption/KMS key version；密钥不作为通用 SQL/日志参数暴露。consent 至少有 subject、purpose、policy version、granted/revoked time、scope/recipient、retention；撤回后停止新的共享和模型处理，历史法定留存走可解释策略。B 端默认只读最小投影；原文/答案/录音必须有显式授权、范围、过期与审计。删除任务要覆盖对象存储、派生索引、缓存和备份生命周期。

**追问**：加密 blob 已删除，但向量索引、模型 trace 和灾备快照分别怎么处理？

**常见错误**：把掩码手机号写入长期 trace；把“导出不含原文”误说成已满足所有可携权；删除主表却保留可逆派生数据。

**仓库证据**：`packages/db/src/resume.ts:10-30,41-61,74-113`；`apps/api/src/modules/privacy/privacy.service.ts:12-47`；`packages/db/sql/13_privacy.sql:5-21`。

## 11. SSE 在断线、重连、双实例和乱序下如何保证用户看到一致会话？（P1，10 分）

**场景**：浏览器在收到 question 后断网；API 实例重启；用户同时开多个页签；worker 正在写新事件。

**90 秒可口述完整答案**：我把 SSE 当作视图传输，不当业务真相。每个 interview stream 的业务事件在短事务内追加单调 seq，浏览器重连时带 Last-Event-ID，只读取更大的 seq，客户端也只应用未见过的 seq。首次加载的快照必须携带同一一致读中的 watermark，之后只补 `seq > watermark`，否则会出现快照与重放重叠或缺口。socket 关闭不代表会话结束，终态由持久事件和查询接口定义；慢消费者、连接时长、队列字节和单流 backlog 必须有上限。E2E 要覆盖断线、双页签、实例切换和重复/乱序帧，并断言 missing、duplicate-applied、out-of-order-applied 都为 0。

**考察点**：持久事件账本、per-stream 单调序号、Last-Event-ID、快照水位、客户端幂等应用、终态、背压。

**量化评分锚点**：

- 0–2：使用 EventSource 自动重连。
- 3–5：有重连但事件仅在内存/Redis pubsub。
- 6–8：DB append-only seq、`Last-Event-ID` 重放、客户端按 id 去重。
- 9–10：快照响应带 watermark，随后只重放 `seq>watermark`；断流/实例切换/重复帧的 `missing=0, duplicate-applied=0, out-of-order-applied=0`；每连接/每流的字节、时长和队列有上限。

**标准答案**：SSE 只是视图传输，业务真相是事件账本和业务表。事务内分配单调 `seq`，连接以 Last-Event-ID 拉取 `seq > last`，客户端只应用更大的 seq。快照和水位必须来自一致读，避免“快照比事件新/旧”裂缝。终态由持久事件定义，不应只靠 socket close；连接到期/故障后给 HTTP 查询/重连出口。输出必须是业务事件而非未经校验的模型 token。

**追问**：`MAX(seq)+1` 在多个 writer 时的竞态如何避免？为什么同一个 stream 的 advisory lock 需在事务内？

**常见错误**：以 Redis pubsub 作唯一记录；只依赖前端数组 append；断线后新建面试以绕过状态恢复。

**仓库证据**：`packages/db/src/index.ts:58-65`；`apps/api/src/modules/interview/interview.controller.ts:200-237`；`apps/web/lib/stream/interview-stream.ts:27-77`。

## 12. 多实例时如何让限流、SSE 槽位、模型并发和会话租约仍然有效？（P1，10 分）

**场景**：API 从 1 个副本扩到 R 个；当前 `RateLimitService` 将桶和 SSE slot 存在进程 `Map`，每实例最多 5 个连接。

**90 秒可口述完整答案**：每进程 Map 只能保护单机，扩容后会把“5 个连接”的产品承诺放大为 5×副本数。我会区分本机舱壁和全局配额：本机限制 CPU/内存，全局令牌桶或信号量放在 Redis Lua、数据库条件更新或专门限流服务中，key 包含环境、principal、tenant、资源类型和窗口。slot 获取、续租和释放是原子的，短 TTL 防崩溃泄漏，连接关闭立即释放；模型并发与数据库池同样分开管理。Redis 分区时普通 SSE 可以明确降级或拒绝新连接，支付回调不能因为限流存储故障静默丢失，必须走可审计队列或安全失败。两实例压测下我会验证全局 slot 仍不超过设定值，并报告拒绝率、租约泄漏和 provider queue age。

**考察点**：全局与局部配额、Redis/DB 原子操作、租约 TTL、断连清理、模型/DB 资源隔离。

**量化评分锚点**：

- 0–2：每个实例各限 5 条即可。
- 3–5：说“换 Redis”，没有原子算法、TTL 或 key 设计。
- 6–8：分布式令牌桶/信号量，principal+tenant+endpoint 作用域，TTL 防泄漏。
- 9–10：两实例压测时全局 SSE 上限仍是 `5`（不是 `5×R`）；worker/provider 全局并发不超过配置；Redis 失效时有 fail-closed 或明确降级策略与告警。

**标准答案**：区分每实例保护（防本机资源耗尽）与全局产品配额。全局 bucket/slot 需用 Redis Lua、DB 条件更新或专门 rate-limit 服务保证原子 acquire/release；连接 slot 带短 TTL 并心跳续约，close 立即释放。模型 provider 配额同理，不得只用每进程 semaphore。所有 key 至少包含环境、principal/tenant、资源类型，防跨环境或跨用户碰撞。

**追问**：Redis 网络分区时，支付回调和普通 SSE 限流分别该 fail-open 还是 fail-closed？为什么？

**常见错误**：把 IP 当唯一身份；只有 release 没有 TTL；全局限流与 DB 连接池共用一个无界队列。

**仓库证据**：`apps/api/src/platform/rate-limit.service.ts:3-34`；`apps/api/src/modules/interview/interview.controller.ts:206-236`；`packages/ai-runtime/src/rate-limit-model.ts`。

## 13. Worker at-least-once 消费怎样避免同一面试并发推进、漏退额度或“尸体会话”？（P1，10 分）

**场景**：worker 在模型调用后、`markJobDone` 前崩溃；租约过期被另一 worker 重领；第一个 worker 又恢复并试图写失败事件/退款。

**90 秒可口述完整答案**：我从至少一次消费出发，不假设队列给 exactly-once。claim 用条件更新写入 running、lease owner、过期时间和 attempts，同一 interview 不允许有两个未过期推进者；完成、失败、心跳和补偿都必须带同一个 lease owner/fencing token。模型调用在事务外，回写前重新验证租约和父会话状态，所以醒来的旧 worker 即使拿到结果也没有写权。reaper 只原子接管已过期任务，重试有上限，毒丸进入可见失败终态并触发对应补偿；模型、图、结算各有独立幂等键。我会在 claim 后、外呼后、业务提交后和 done 前分别 kill worker，断言有效推进者最多 1、终态事件最多 1、额度只落一个终态。

**考察点**：claim lease、按会话保序、lease owner fencing、heartbeats、reaper、失败终态、幂等副作用。

**量化评分锚点**：

- 0–2：消息队列会保证 exactly-once。
- 3–5：有 lease 但没有 owner fencing/心跳。
- 6–8：claim/renew/done/failed 均带 lease owner，reaper 重排或终结。
- 9–10：故障点矩阵至少覆盖 claim 后、外呼后、业务提交后、done 前；每个点断言同一 interview 的有效推进者至多 1、终态事件至多 1、额度最终仅处于一个终态。

**标准答案**：队列语义按 at-least-once 设计。claim 原子更新 `running, lease_owner, lease_expires_at, attempts`；同一 interview 不允许存在未过期 running sibling。完成/失败必须以 lease owner 条件更新做 fencing，失租 worker 禁止发失败事件、退款或覆盖新 worker 的结果。心跳只续自己的 lease；reaper 对过期 job 原子复核，重排有上限，毒丸进入可见终态并补偿/告警。每个 graph/模型/结算副作用再有自己的 idempotency key。

**追问**：为什么“收到 SIGTERM 后尽量等模型返回”仍不能替代 lease/reaper？

**常见错误**：用进程内 mutex；reaper 先查再更新；worker 失败一律退款而不检查已 confirm。

**仓库证据**：`packages/db/src/interview-jobs.ts:11-85`；`apps/worker/src/interview-consumer.ts:32-118`；`apps/worker/src/drain-loop.ts:1-21`。

## 14. 将“100% 高可用”改写成可运营的 SLO、架构与演练计划（P0，10 分）

**场景**：产品要求“生产 100% 高可用”，当前生产 compose 是单机单 PostgreSQL、单 Redis、单 API、单 worker，且无备份/恢复编排。

**90 秒可口述完整答案**：我会先拒绝“100% 高可用”这个不可验证承诺，并把用户可感知的服务拆成可测 SLI/SLO：例如历史浏览、开始付费面试、支付账务和异步报告各有不同成功条件与错误预算。30 天 99.9% 也允许 43.2 分钟不可用，是否接受必须按业务成本批准；账务正确性不应和网页可打开混成一个指标。架构上要消除单点：多实例 API/worker、跨可用区数据库与可验证恢复、Redis/对象存储冗余、独立 webhook 入口、模型多 provider/区域和明确降级。供应商故障时可以浏览历史但暂停新的付费开局。每季度用故障演练实测 RPO/RTO、切换、错误迁移和 worker 全杀后的数据完整性；没有实测就只能称为目标设计。

**考察点**：不可达承诺识别、SLO/error budget、依赖分层、RPO/RTO、单点、优雅降级、容量与演练。

**量化评分锚点**：

- 0–2：承诺 100%，或只说“多部署几个副本”。
- 3–5：有 replicas，没有数据恢复和依赖故障策略。
- 6–8：能定义 API/异步任务/支付三类 SLO，提出多 AZ、备份和 failover。
- 9–10：给出测量定义、error budget、RPO/RTO、容量 headroom、演练频率及自动阻断阈值；明确不同路径的降级（例如可浏览历史、不可新开付费面试）。

**标准答案**：100% 是不可验证承诺，应拆为 SLI/SLO。例如 30 天：99.9%=43.2 分钟、99.95%=21.6 分钟、99.99%=4.32 分钟可用性预算；数值须按业务成本审批。支付“账务正确性”和“前台可用性”应是不同 SLO。生产至少消除单主机单副本：多实例 API/worker、托管 PostgreSQL 多可用区与 PITR、跨 AZ Redis、对象存储版本化、可验证备份恢复、独立 webhook ingress、模型多 provider/区域策略。每季度演练主库故障、错误迁移、worker 全杀、供应商超时和恢复；演练通过条件含 RPO/RTO 实测值而非“服务重新启动”。

**追问**：模型 provider 全挂时，哪些请求应 200 降级、哪些应 503/排队、哪些必须拒绝新交易？

**常见错误**：用 Docker healthcheck 等同 HA；把 Redis/LLM 失败都自动重试；没有恢复演练却声称有备份。

**仓库证据**：`docker/compose.prod.yml:25-107`；`ai-docs/architecture/devops/local-demo-deployment.md:100-140`；`docker/monitoring/alert.rules.yml:1-155`。

## 15. 如何建立“真实而非 happy-path”的可靠性、安全与 Agent 评测发布门？（P0，10 分）

**场景**：CI 有大量确定性 proof，但安全真实模型评测仍在 TODO；线上问题往往来自乱序、重复、超时、脏输入和依赖局部故障。

**90 秒可口述完整答案**：发布门必须把“绝不能发生”与“需要统计估计”分开。资金守恒、越权读取、重复副作用、取消后继续提交等是确定性硬门，我用数据库计数、并发重放和故障注入要求失败数为 0；模型的接地、拒答、指代和正常答案误拒是统计质量，必须冻结带版本的数据集，报告样本数、分母、置信区间、语言/输入类型切片和模型/提示词/语料版本。正常用户的怪表达要和攻击样本一起进分母，不能只扩 happy path。每个 P0 项还要有 owner、阈值、告警和自动阻断动作；任何硬门失败、攻击突破或正常对照大规模误杀都让命令非零退出，不能用平均分掩盖。

**考察点**：测试金字塔之外的 fault injection、属性测试、真实模型评测、对抗语料、生产演练、不可伪造指标。

**量化评分锚点**：

- 0–2：HTTP 200 或 mock green 即发布。
- 3–5：只添加更多正常 E2E。
- 6–8：并发/重放/故障注入/真实模型分层，指出不稳定样本的统计处理。
- 9–10：每个 P0 不变量有最小样本、阈值、数据集版本、owner 和阻断动作；测试覆盖断点矩阵并输出可复算证据。

**标准答案**：把测试分为确定性硬不变量与统计性模型质量。硬不变量：重复 webhook、同 key 双击、cancel-vs-callback、confirm-vs-release、worker kill、SSE reconnect、跨租户越权均以数据库/事件计数判定。模型层：至少覆盖指代、省略、错别字、跑题、注入、事实否认、混合语言、长文本、多轮矛盾；安全泄露、事实接地、正常答案误拒三类指标必须同时报告。每项记录 N、分母、置信区间、模型/提示词/语料版本；任何攻击突破、任何资金守恒失败、任何 RLS 越权、任何正常对照误杀都让 gate 非零退出。

**追问**：对“0 泄露/0 双扣”这种 0 失败结果，怎样避免用 N=1 宣称上线安全？

**常见错误**：以 fake model 证明真实模型安全；红队脚本即使失败仍 exit 0；把指标均值掩盖 p99 和长尾。

**仓库证据**：`ai-docs/testing/strategy/test-strategy.md`；`.github/workflows/ci.yml:53-143`；`ai-docs/rules/ai/safety-defense-in-depth.md:53-79`。

## 16. 用户取消与 worker 收尾并发时，如何保证“交付状态”和“点数状态”只落一个合法组合？（P0，10 分）

**场景**：用户请求 abandon 时，worker 可能刚完成最后一道题并进入 `confirmConsumption`。实测交错结果为 `abandonRead=active`、`confirm=confirmed`、`release=already_confirmed`、最终 `interview=abandoned + consumption=confirmed`。这是非法组合：交付已结算，用户侧会话却被标记已放弃。取消后已经 queued 的 start/answer job 也不应继续花模型成本或写业务事件；当前 parent 已 `abandoned` 时，claim 仍会领取 answer job。

**90 秒可口述完整答案**：取消与完成不是两个可以各自成功的按钮，而是一个跨 Interview 与 Consumption 的联合状态机。模型调用仍在事务外，但 worker 回写时必须携带开始时读到的 interview version 和 fencing token；完成与 abandon 用同一锁顺序先锁 Interview 再锁 Consumption，并以相同预期版本做 CAS。完成赢，才在同一短事务确认额度、写 completed 和 outbox；取消赢，才 release、写 abandoned，并把未领取任务 tombstone。CAS 落败者绝不补写，而是读取最终组合；claim 也必须验证父会话仍 active。我要用 100 次受控交错验证只存在 `(completed, confirmed)` 或 `(abandoned, released)`，取消后模型调用、非法组合和重复终态事件全为 0。

**考察点**：跨聚合状态机、fencing token、统一锁序、CAS、取消传播、队列 tombstone、模型调用的事务外边界。

**量化评分锚点**：

- 0–2：以“最后写入覆盖”为准，或只在 UI 禁用取消按钮。
- 3–5：只给 `consumption` 加锁，未给 Interview 终态转移加前态/version 守卫。
- 6–8：abandon 与 complete 均以同一 Interview 版本做 CAS；消费 confirm/release 和终态写入同一短事务，失败后回查重判。
- 9–10：同时设计 queue cancellation fencing；100 次受控交错中只允许 `(completed, confirmed)` 或 `(abandoned, released)`，非法组合 `(completed, released)`、`(abandoned, confirmed)`、重复终态事件和取消后模型执行均为 `0/100`。

**标准答案**：模型/图运行在事务外，但其提交结果必须带开始时读取的 `interview.version` 或 job fencing token。完成与取消在同一锁顺序内处理（先锁 Interview，再锁 Consumption），并使用 `WHERE status IN (...) AND version=$expected` 的 CAS：完成赢则确认额度、写 completed、投报告；取消赢则 release、写 abandoned、将未领取 job 标为 cancelled/tombstoned。CAS 失败时必须回查最终状态，不得用 `status <> 'completed'` 或无状态条件的 UPDATE 覆盖终态。worker claim 还要验证父 Interview 未取消且 job fencing token 仍有效；已失效 worker 不得写事件、评分、报告或补偿。

```text
queued/running job ── cancel wins ──> cancelled (禁止模型/事件提交)
Interview active ── complete wins ──> completed + Consumption confirmed
Interview active ── abandon wins ──> abandoned + Consumption released
```

**追问**：为什么不能在长达 30 秒的模型调用期间持有 Interview 行锁？如果调用结束后发现 cancel 已赢，模型输出和成本如何处置、如何避免把结果展示给用户？

**常见错误**：只让 `confirmConsumption`/`releaseConsumption` 互斥，却允许 Interview 状态被另一事务覆盖；取消只改页面状态不取消队列；worker 已失租或已取消后仍发 `interview_unavailable`。

**仓库证据**：`apps/api/src/modules/interview/interview.service.ts:191-204`；`apps/worker/src/adaptive-lifecycle.ts:74-86`；`packages/db/src/interview-jobs.ts:25-44`；`apps/worker/src/interview-consumer.ts:69-85`。现有专门的 complete-vs-abandon、abandoned-parent-vs-claim 测试均为 `0`。

## 17. 同一用户并发重试下单，怎样让相同幂等键重放“首次成功结果”而不是抛唯一键冲突？（P0，10 分）

**场景**：浏览器重传、移动端网络抖动或双设备同时发同一个购买请求。当前 `createOrder` 先 `SELECT` 再 `INSERT`；强制两个事务同时以相同 `(owner,idempotency_key)` 建单时，第一事务成功，第二事务抛 PostgreSQL `23505`。这没有重复订单，但不满足“相同请求重放同一首次结果”的幂等契约。

**90 秒可口述完整答案**：唯一键只能防重复行，不能自动给用户正确的重放语义。我会把权威商品、金额、币种和数量归一化为 request fingerprint，与 client idempotency key 和第一次响应一起在短事务持久化。请求先用 `INSERT ... ON CONFLICT DO NOTHING RETURNING` 原子抢占：抢到者创建订单并保存结果；没有抢到就读取既有行，fingerprint 相同则返回同一 order ID、金额和状态，fingerprint 不同则返回明确冲突，绝不能默默复用旧订单。支付回调和退款使用不同作用域的幂等键，避免误去重。验证不是只看 order_count=1，还要在 100 次双并发同请求中让 200 次响应都返回同一 order ID；同 key 不同指纹的 100 次必须全是冲突且原订单不变。

**考察点**：read-miss race、请求指纹、唯一约束、原子 upsert、结果重放、冲突语义、HTTP 契约。

**量化评分锚点**：

- 0–2：捕获 `23505` 后直接返回 500 或“请重试”。
- 3–5：只做先查后插，或对任何同 key 请求都返回原订单。
- 6–8：依靠 `(owner,idempotency_key)` 唯一约束，冲突后读取原订单；同 key 不同请求显式 409。
- 9–10：将 request fingerprint、首次 HTTP 结果和业务副作用在一个事务内持久化；100 次双并发同请求中 `order_count=1`、`HTTP 200 same_order_id=200/200`；100 次同 key 不同 fingerprint 中 `409=100/100`、原订单不变。

**标准答案**：不要用裸 `SELECT→INSERT` 判幂等。订单保存不可变请求指纹（例如权威 `productId/amount/units/currency` 的 hash）与可重放响应。使用 `INSERT … ON CONFLICT DO NOTHING RETURNING` 抢占；未抢到则在同一事务读取已存在行、比较 fingerprint：相同则返回首个 `orderId/amount/status`，不同才返回 `idempotency_key_conflict`。唯一约束保护数据不重复，但“冲突后的重放语义”必须由代码显式实现。支付回调、渠道出款和下单分别使用不同作用域的幂等键。

```sql
INSERT INTO payment_order(id, owner_user_id, idempotency_key, request_hash, ...)
VALUES ($id, $owner, $key, $hash, ...)
ON CONFLICT (owner_user_id, idempotency_key) DO NOTHING
RETURNING id, request_hash;
-- 未返回时读取既有行；hash 相同重放，hash 不同返回 409。
```

**追问**：若第一个事务已插入订单但 HTTP 响应在网络中丢失，第二次请求怎样稳定返回相同结果？若商品价格已更新，重放旧 key 应使用哪个价格？

**常见错误**：把数据库唯一键异常当作完整幂等；同 key 不同商品静默返回原单；将支付回调的 provider event id 与下单客户端 key 混用。

**仓库证据**：`packages/db/src/payment.ts:6-21`；`packages/db/sql/11_commerce.sql:5-17`；`apps/api/src/modules/commerce/commerce.service.ts:24-36`。现有 `neg:commerce` 并发测试只要求“无 5xx、成功 order id 至多 1 个”，未要求两个同请求都重放同一 `orderId`。

---

## 面试官收口题（可选，5 分）

“请从以上题目中任选一个 P0 风险，写出：唯一真相表、状态机、幂等键、事务边界、重试/补偿、3 个故障注入点和 3 条生产指标。”

**通过线**：至少写出 6/7 项；若把外部调用称为本地事务的 exactly-once，或没有可执行的失败验证，判不通过。

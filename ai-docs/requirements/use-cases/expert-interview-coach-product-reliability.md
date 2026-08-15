---
id: requirements_expert_interview_coach_product_reliability
name: 专家面试教练：C/B 产品系统设计与高可用
description: 面向 Staff/Principal 面试的可口述 C/B 产品系统设计教材。每个主题提供 90 秒答案、三层深追、状态机或代码、量化 SLO、反例，以及已实现与外部阻断的事实边界。
type: requirement
scope: shared
level: use-case
status: active
owner: product-architecture
version: 1
tags:
  - interview-coach
  - reliability
  - c-b-product
  - availability
  - privacy
  - agent
related:
  - ./commerce.md
  - ./bend-recruiting.md
  - ./interview-modality.md
  - ../../architecture/backend/commerce-saga.md
  - ../../architecture/backend/rls-isolation.md
  - ../../architecture/ai/agent-harness.md
  - ../../architecture/ai/voice-capability-boundary.md
  - ../../architecture/frontend/frontend-blueprint.md
  - ../../testing/strategy/scoring-evaluation-protocol.md
---

# 专家面试教练：C/B 产品系统设计与高可用

## 缩略语阅读卡（先读这一张，再读答案）

本页第一次接触术语时按“英文缩写（中文全称；在这里的用途）”理解，后文为便于口述只写简称；完整定义见 [统一术语](/ai-docs/product/glossary.md)。`C 端（面向个人用户）`与`B 端（面向企业客户）`是产品分层，不是技术缩写。核心技术词为：`HTTP（超文本传输协议；浏览器或支付渠道发请求的协议）`、`DB（数据库；订单、账本和授权的事实源）`、`PSP（支付服务提供商；外部支付渠道）`、`CAS（比较并交换；并发下仅在预期状态更新）`、`SQL（结构化查询语言；执行事务更新）`、`SLO（服务等级目标；量化延迟和错误预算）`、`P99（第 99 百分位延迟；99% 请求不超过的耗时）`、`DLQ（死信队列；无法安全处理时的人工可见去向）`、`RLS（行级安全；数据库逐行隔离权限）`、`SSE（服务器发送事件；服务端向浏览器的流式推送）`、`ASR（自动语音识别；语音转写）`与`E2E（端到端测试；真实链路验证）`。

> **使用方式**：先完整口述每题的“90 秒答案”，再接受三层深追。每个回答必须落到“谁是事实源、原子边界在哪里、失败如何收敛、用什么指标证明”。只说“加 Redis、上消息队列、加分布式锁”不构成答案。

> **高可用的诚实定义**：不能承诺“100% 高可用”。可以承诺的是：已知命令的重复副作用为 0、权限拒绝为 0 泄露、故障在有界时间内到达成功/可重试/降级/人工处理之一，并用可复现数据报告可用性。模型、支付渠道、浏览器麦克风和网络是外部依赖，必须有降级与量化 SLO，不能伪装为本地事务可完全控制的能力。

## 0. 事实标签与面试回答规则

| 标签 | 含义 | 可对外说什么 | 不能说什么 |
| --- | --- | --- | --- |
| ✅ 已实现且有代码/测试证据 | 主链路已接线，并有命令可验证 | “当前实现能证明该不变量” | “因此全量生产容量/模型质量已经达标” |
| 🟡 已实现机制，仍需运营数据或依赖配置 | 代码存在，但默认关闭、未接入某产品流或缺真实数据集 | “具备受控试运行前提” | “已作为用户能力全面发布” |
| ⛔ 外部阻断或未实现 | 需要供应商、合规审批、真实数据集或尚未接线的领域能力 | “现在不开放，满足准入门后才评估” | “假装支持/以 fake model 数据外推” |

**通用答题模板**：先界定资源与 principal；再给状态机及唯一键；指出一个 DB 事务不能覆盖的外部副作用，改用 outbox、幂等消费或对账；最后给分桶 SLO、告警和反例。C 端训练数据与 B 端招聘评估必须分别说明处理目的和可见字段，不能用“用户都登录了”替代授权。

---

## 1. 支付、点数与幂等：如何保证不重复扣费、不重复入账

### 90 秒口语答案

我会把“支付成功”“点数到账”“开始面试扣一次额度”拆成三个独立事实，不会把它们塞进一个 HTTP 请求或一个长事务。支付渠道是至少一次回调，所以先用渠道事件 ID 去重，再用 `provider_txn` 全局唯一地绑定一张本地订单；验签之后还必须核对订单号、金额、币种和商户，不能相信前端或 URL。点数是真实账本：开始面试只做 `available → reserved`，完成面试由 outbox 驱动 `reserved → confirmed`，失败或超时才 `released`。每个状态迁移都有条件更新和业务作用域的幂等键，重试返回第一次结果。数据库事务只覆盖本地订单、账本和 outbox；它不能覆盖 PSP 或模型调用，因此渠道通知、结算消费者和对账任务都要按至少一次投递设计。我的上线指标不是“从不失败”，而是同一渠道流水的二次入账数、同一面试的二次扣点数都必须为 0，同时监控 webhook 验签失败、预留超时和账本差额。

### 深追三层

1. **领域层**：为什么点数不能只是 Redis 计数器？因为 Redis 不能提供不可变审计、资金对账和崩溃恢复；缓存只能限流，账本才是权益真相。
2. **并发层**：两个标签页抢最后一点额度怎么办？在短事务内锁定桶或条件更新 `available >= amount`；一个 `reserve` 成功，另一个得到 402，不能先读余额再在应用内 `-1`。
3. **外部副作用层**：PSP HTTP 超时是否代表退款/扣款失败？不代表。记录 `in_flight` 命令，以稳定渠道幂等键查询或重放；未知状态进入对账/人工处理，绝不盲目再次出款。

### 状态机与 SQL 例子

```text
PaymentOrder: created → paid → refunded
                      ↘ closed/late_payment_review
Consumption:  granted → reserved → confirmed
                         ├→ released
                         └→ refunded_uncollectible → manual_review
```

```sql
BEGIN;
-- 同一渠道支付事实只能属于一张订单；重复回调读取既有结果并返回 2xx。
UPDATE payment_order
   SET status = 'paid', provider_txn = $1
 WHERE id = $2
   AND status = 'created'
   AND amount_minor = $3
   AND currency = $4;

INSERT INTO entitlement_ledger(owner_user_id, source_order_id, units, event_type)
VALUES ($5, $2, $6, 'credit');
COMMIT;
-- DB 另有 partial UNIQUE(provider_txn)；同一流水不能给两张订单入账。
```

### 量化 SLO、验证与反例

| 指标 | 发布门/目标 | 如何测 |
| --- | ---: | --- |
| 同一 `provider_txn` 跨订单二次入账 | 0 / 10,000 重放 | 并发 webhook 集成测试 + 唯一索引监控 |
| 同一消费幂等键二次 reserve/confirm | 0 | 20 并发请求，账本/消费行均为 1 |
| reserved 超过租约仍未结算 | 0 个超过 `reconcileWindow` 未告警 | 30 秒 reconciler 指标 + DLQ |
| DB 连接等待 p99 | < 250 ms（容量压测目标） | 分离外呼 worker 与短事务池 |
| webhook 验签或金额不匹配入账 | 0 | 合同/负向 HTTP 测试 |

**反例**：只在 `payment_order.status='paid'` 上做 CAS。它能挡住“同订单重复回调”，却挡不住同一 `provider_txn` 被错误用于两张订单，从而产生两次点数。另一个反例是在持有 Postgres 锁时等待 PSP 或 LLM 30 秒：连接池会先耗尽，随后正常读写一并超时。

**事实边界**：✅ `provider_txn` partial unique、权益 reserve/confirm/release、outbox 结算和 30 秒对账/回收已接线，`commerce:prove` 为真 Postgres 证明。⛔ 渠道证书轮换、真实 PSP 延迟分布、拒付规则和财务对账 SLA 依赖签约的支付服务、密钥管理与运营流程，未用本地 fake webhook 宣称已验证。

---

## 2. C→B 岗位绑定：如何防止把历史高分冒充岗位评估

### 90 秒口语答案

岗位申请不是“用户的任意一场面试加一个 jobId”，而是一个新的受目的限制的评估会话。用户开始申请面试时，服务端在一个事务中读取该申请、岗位和已摄取简历，创建或复用唯一的 application-bound interview，并把 `applicationId、jobId、resumeId、candidate` 固化。客户端只收到服务端返回的 interview ID 和跳转地址，不能提交一个自选历史 interview ID。面试完成后，数据库触发器和 finalize 命令都只从这条绑定关系反查分数，并再次校验候选人、岗位、简历和 completed 状态；招聘方只看最小化评分摘要，而不是逐题回答。这样刷新、双击、断网重试都收敛到同一场会话，历史训练分数无法跨用途回填。关键不是前端藏参数，而是数据库的一对一唯一约束、不可变绑定字段、服务端派生评分和浏览器 E2E 一起证明。

### 深追三层

1. **数据建模层**：为什么必须绑定 resume snapshot，而不是只绑定 candidate？候选人可能在投递后更新简历；招聘评分必须可追溯到当时被授权、用于该岗位的版本。
2. **完成竞态层**：worker 完成与浏览器 finalize 同时发生怎么办？完成路径以绑定 interview 的 `completed` 状态和 `JobApplication` CAS 收口；浏览器 finalize 只是幂等确认，不拥有分数真相。
3. **产品边界层**：招聘方能不能看 C 端历史训练 transcript？不能。岗位分数只能来自该岗位绑定会话的 allow-list 摘要；RLS 是底线，目的限定同意与撤回仍需要单独的 ShareGrant/清理闭环。

### 状态机与 SQL 例子

```text
JobApplication: invited → in_progress → completed
                     └→ declined
BoundInterview:  created → active → completed
                                    └→ abandoned/degraded
```

```sql
-- 数据库层不能只依赖前端路由或 service if 判断。
CREATE UNIQUE INDEX uq_interview_application_binding
  ON interview(application_id) WHERE application_id IS NOT NULL;

CREATE UNIQUE INDEX uq_job_application_interview_binding
  ON job_application(interview_id) WHERE interview_id IS NOT NULL;

-- 绑定字段一经创建不可改；完成时只允许同 application/job/resume/candidate 的面试回填。
-- finalize 请求没有 interviewId 字段，服务端按 application_id 反查。
```

### 量化 SLO、验证与反例

| 指标 | 发布门/目标 | 如何测 |
| --- | ---: | --- |
| 同一 application 并发 20 次 start | 恰 1 个 interview、1 条绑定 | 真 Postgres 并发证明 |
| 本人历史但非岗位绑定的 interview finalize | 409，申请 score 保持 NULL | 真 HTTP/DB 负向测试 |
| 完成事件与浏览器 finalize 重放 | application 完成与分数快照各 1 次 | worker + browser E2E |
| 招聘方读取逐题 transcript | 0 行 | RLS 多主体测试 |
| 生产构建 C→B 浏览器链路 | 6 / 6 常规案例通过（当前隔离集群证据） | 两个浏览器身份、真 API/DB/SSE |

**反例**：让 `/applications/:id/finalize` 接收 `{ interviewId }`，即使校验“属于当前用户”，候选人仍能把三个月前的训练高分回填到任何岗位。另一个反例是只做浏览器跳转，不做 `UNIQUE(application_id)`；双击后会出现两场面试、两次权益预留和不可解释的招聘结果。

**事实边界**：✅ application/interview 一对一索引、绑定字段不可变、完成触发自动回填、strict finalize DTO、真实浏览器 C→B 闭环和 20 并发绑定验证已实现。⛔ purpose-bound `ShareGrant`、撤回时取消在途 worker、缓存/向量/checkpoint/trace 的删除传播、企业 tenant/席位/DSAR 尚未形成可发布的完整闭环；因此当前 B 端只能作为人工辅助的 alpha/beta 能力，不能表述为完整 ATS 或自动化招聘决策系统。

---

## 3. 隐私、同意与 C/B 隔离：如何让“不能看”可验证

### 90 秒口语答案

我把隐私设计成可执行的授权图，而不是页面上一个勾选框。每条受控数据都有 owner principal，所有数据库读写在事务中用绑定参数设置 principal，RLS 在 principal 缺失时返回 0 行。C 端训练默认是候选人私有数据；B 端只消费岗位绑定评估产生的最小化摘要，不能因为 recruiter 认识候选人就读取历史训练、简历原文或模型 trace。处理目的、接收方、字段 allow-list、版本、到期时间和撤回都应被持久化；撤回不是把按钮置灰，而是让新的读取、检索、模型调用和 worker resume fail-closed，并对缓存、向量、checkpoint、SSE 和 trace 做可审计的删除/失效。生产上我会把“越权读取为 0”作为硬门，同时把同意撤回的传播时延和未清理数据面数列为 SLO。RLS 很重要，但它不是企业多租户、数据保留和 DSAR 的全部答案。

### 深追三层

1. **连接池层**：为什么 `SET LOCAL` 必须在事务内？连接会被复用；会话级 `SET` 可能把上一个用户的 principal 带给下一个请求，形成静默越权。没有 principal 应该坏在安全侧，即 0 行。
2. **用途层**：RLS 只回答“谁可读”，不回答“为什么可读”。招聘用途需要独立同意快照和字段 allow-list，不能用 C 端训练同意推导 B 端招聘同意。
3. **撤回层**：为什么删除 DB 行不够？异步 worker、向量索引、缓存和已有 SSE 连接可能继续处理旧上下文；必须给每个数据面清理事件、版本栅栏和审计结果。

### TypeScript/SQL 例子

```ts
// 每次受控查询都在短事务中绑定 principal；不拼接 SQL/GUC。
await tx(async (c) => {
  await c.query("SELECT set_config('app.principal_user', $1, true)", [principalId]);
  return c.query('SELECT * FROM interview WHERE id = $1', [interviewId]);
});

// 目的限定授权的目标形态：读路径不只判断 owner，还要判断 consent revision。
if (grant.status !== 'active' || grant.expiresAt <= now || grant.purpose !== 'recruiting') {
  throw new ForbiddenError('purpose_grant_inactive');
}
```

```text
ShareGrant: draft → active → revoked
                       └→ expired
active + worker-resume race → terminated_consent（禁止新评分/新报告）
```

### 量化 SLO、验证与反例

| 指标 | 发布门/目标 | 如何测 |
| --- | ---: | --- |
| 跨 principal 的 DB 读/写 | 0 | 多用户/招聘方/无 principal 真库矩阵 |
| recruiter 读取 C 端训练 transcript | 0 行 | DB/RLS + HTTP + 浏览器测试 |
| revoke 后新检索/新模型调用 | 0 | revoke 与 resume 竞争注入 |
| revoke 传播到全部数据面 | 100%，并报告 p95 时延 | DB、缓存、向量、checkpoint、SSE、trace 审计 |
| 日志中的简历、录音、密钥明文 | 0 条 | 日志扫描/采样审计 |

**反例**：只在 API controller 写 `WHERE owner_user_id = ?`，worker、缓存或直接 SQL 路径一漏就越权；或者将 JWT principal 用字符串拼接到 `SET LOCAL`，把隔离边界变成 GUC 注入面。还有一种危险反例是“招聘方看不到 transcript，所以不需要招聘同意”——用途合法性并不由字段数量自动推出。

**事实边界**：✅ `asPrincipal` + RLS fail-closed、招聘方对候选人逐题事件 0 行的测试、httpOnly cookie 和服务端权限校验已实现。⛔ purpose-bound 同意授权、撤回后跨缓存/向量/checkpoint/trace 的 100% 清理证明、企业成员撤权和 DSAR SLA 仍是发布阻断，不应宣称已达成。

---

## 4. 语音：单人语音输入与双人电话为什么必须是两种产品

### 90 秒口语答案

当前语音能力我会准确称为“经用户明确同意的单人本机麦克风录音，转写为可编辑文字后提交”。浏览器先显示同意范围，用户同意才请求麦克风；音频以 allow-list MIME 和大小限制经过同源 API 转给 ASR，响应明确标记 `not_diarized` 和 `wordTimestamps: not_available`。麦克风拒绝、ASR 失败或 TTS 失败都必须立即回到文字作答，不能把用户困在语音流程。所谓双人电话则完全不同：需要远端媒体轨或经过批准的说话人分离、双方关于目的/接收方/保留期的可撤回同意、媒体加密与删除传播，以及按语言、口音、噪声和重叠说话分桶报告 WER、DER、说话人归因和端到端延迟。在这些外部数据、供应商和隐私门完成以前，我不会把单麦克风波形或 ASR 文本称作电话记录，更不会给“面试官/候选人”标签。

### 深追三层

1. **契约层**：为什么把 `capture.mode` 设成字面量而不是一个自由字符串？因为 API 必须在调用 ASR 前拒绝 `two_participant_call`，能力声明本身是安全边界。
2. **体验层**：为什么“在听”动效不应每个音频帧 setState？音频通常几十毫秒一帧，逐帧 React commit 会拖慢输入和 SSE；电平可节流到 80 ms、动画帧批处理，并在 reduced motion 下保留文字状态。
3. **评测层**：WER 高是否等于可用？不等于。双人场景还要 DER、speaker attribution、重叠语音和错误归因后的隐私伤害；单人基准不能外推到通话。

### 状态机与契约例子

```text
consent_required → connecting → speaking → listening → transcribing → submitting
       ├→ text_mode                 ├→ text_mode（mic denied）
       └→ text_mode（取消）          └→ text_mode（ASR unavailable）
```

```ts
const TranscribeDto = z.object({
  audioBase64: z.string().max(13_500_000),
  mimeType: z.enum(['audio/webm', 'audio/wav']),
  capture: z.object({
    mode: z.literal('single_local_microphone'),
    consent: z.literal(true),
    policyVersion: z.literal('voice_ephemeral_v1'),
  }),
});
// “two_participant_call” 不匹配 schema，在 ASR 调用前拒绝。
```

### 量化 SLO、验证与反例

| 指标 | 发布门/目标 | 如何测 |
| --- | ---: | --- |
| 无同意/伪双人声明仍调用 ASR | 0 | 负向 HTTP 验证，计 provider call 数 |
| 单人动效更新频率 | ≤ 12.5 Hz（80 ms） | 浏览器性能标记/React profiler |
| 一次 VAD 视觉条数 | 28，非业务真相 | UI 单测 + reduced-motion E2E |
| ASR/Mic 失败后文字出口 | 100% 可达 | 浏览器拒绝权限/注入 5xx |
| 双人 WER/DER/归因/延迟 | 无签字基准前为“不成立” | 授权、去标识双轨真实集 |

**反例**：用混音单轨音频给每一句贴“面试官/候选人”标签；这既没有 diarization 证据，也可能把错误内容归因给另一位参与者。另一个反例是同意前就 `getUserMedia()`，即便用户最终取消也已发生不必要的设备访问。

**事实边界**：✅ 单人本机录音、显式同意、单轨转写、文字降级、TTS 降级和 12.5 Hz/28 条“在听”动效已实现并有契约/负向测试。⛔ PSTN/WebRTC 远端媒体、双人录音、diarization、双人 WER/DER 数据集、KMS 媒体保留/删除与真实双人 E2E 均未满足，产品文案不得越过此门。

---

## 5. SSE 与前端性能：几万上下文/事件如何不把浏览器渲染拖垮

### 90 秒口语答案

我不会把模型 token 当作面试事实流到前端，也不会为每个 chunk 做一次 React render。服务端把分数、题目、报告等事实先持久化，再通过带单调 event ID 的业务 SSE 事件发布；连接随时可断，客户端用同一个 `resultId`、`Last-Event-ID` 和服务端 checkpoint 重连。前端只接受经过 schema 校验的业务事件，重复或倒退 ID 不再归约。渲染侧把同一动画帧内的多次状态更新合并为最后一个快照，组件卸载时取消待执行帧；长会话窗口化，例如 10,000 轮历史只挂载最近 80 轮，再按页加载，避免 DOM 随会话线性增长。对于不可恢复的流错误，不能无限 spinner：要么自动有界重连，要么明确展示可重试、返回列表或报告暂不可用。我要报告的不是“流式很快”，而是事件解析失败率、重连成功率、p95 重连时间、每帧 commit 数、DOM 节点上限、长会话的 INP/内存和业务事件漏失率。

### 深追三层

1. **协议层**：为什么 `question_ready` 必须有持久化身份而非仅题目文本？回答提交要带 `questionId/stateVersion/turn`，否则重连/重放后客户端可能把答案写到错误题次。
2. **渲染层**：为什么不能“每 stream chunk render 一次”？高频 token/chunk 会触发布局、GC 和 React 调度风暴；业务事实事件低频且可合帧，展示性文本才允许在围栏安全条件下渐进。
3. **恢复层**：为什么 SSE 不是状态真相？连接、CDN、标签页和 serverless 都可能中断；只有服务端事件账本/checkpoint 能把新旧客户端收敛到同一状态。

### TypeScript 例子

```ts
// 同一动画帧只提交最后一个视图；事件账本仍保留每条事实，不能靠这个合并丢业务事件。
let pending: InterviewView | undefined;
let frame = 0;
function scheduleView(next: InterviewView, commit: (v: InterviewView) => void) {
  pending = next;
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    const latest = pending;
    pending = undefined;
    if (latest) commit(latest);
  });
}

// 重连只应用严格更新的事件；事实由服务端存储和重放。
if (event.id > view.lastEventId) view = applyEvent(view, event);
```

### 量化 SLO、验证与反例

| 指标 | 发布门/目标 | 当前可复现证明 |
| --- | ---: | --- |
| 同一动画帧 3 次业务更新 | 1 次 React commit | `web:prove` |
| 10,000 轮会话的挂载历史 | 80 轮，窗口固定 | `web:prove` |
| CRLF、分块、心跳、重复 event ID | 0 个错误归约/重复题目 | `web:prove` |
| 非终态断线 | 有界重连；耗尽后 100% 有用户出口 | `web:prove` |
| 生产 SLO（需压测） | reconnect p95、INP p95、heap、事件丢失率分别设阈值 | 真实设备/网络压测后签字 |

**反例**：前端仅靠内存数组累计所有 messages，刷新/断线就成为第二真相，10,000 轮后 DOM 和内存线性增长。另一个反例是把后端新增 `grounded` 题型视为“无关字段”而收窄前端 schema：整个 `question_ready` 帧会被拒绝，页面永久停在 connecting。该真实契约漂移已通过扩展题型枚举和回归证明修复。

**事实边界**：✅ SSE CRLF/心跳/分块解码、Last-Event-ID 重连、有界退化、动画帧合并和 10,000→80 窗口化已有代码与证明。🟡 真实设备上的 INP、内存、十万消息、弱网和多标签压测尚需独立性能基线；不能用单机浏览器 proof 宣称容量 SLO 已达标。

---

## 6. Agent、RAG、Web/Deep Research 与 Skills：什么时候需要，如何避免图设计失控

### 90 秒口语答案

我先区分“面试长会话 agent”“检索增强”和“自主研究 agent”，它们不是同一件事。面试主图是可恢复的 LangGraph：生成问题、持久化问题、interrupt 等用户回答、评估回答，再按条件边继续、完成或降级；等待只由 checkpoint 表达，不能靠内存 Promise 或 SSE 连接。模型调用统一走 invoke 关口，使用稳定的 `threadId:nodeId:turnId` 幂等键，输出先过 schema 和业务校验，再写结果；支付和权益永远不让图节点直接改。RAG 也不是所有场景都需要 intent classifier：单知识库问答直接检索、重排、引用和 abstain 就够；只有跨知识域或可能触发工具时才需要路由，路由也只能建议 handoff，不能直接退款或扣款。当前本地题库检索已可用，受 allow-list 的 Web/Deep Research 和 skills 入口已有受控实现，但 E2E 可显式关闭外网；这说明外网不是主事实源。自主研究图必须有工具 allow-list、token/步骤/超时预算、注入隔离和降级，不能让“多 agent”变成无限循环或未审计的网络出口。

### 深追三层

1. **图重放层**：为什么 `interrupt()` 前不能做模型调用？恢复时节点从开头重跑；如果前面有外呼且 key 不稳定，用户一次 resume 就可能二次出题/二次花费。
2. **路由层**：什么时候意图分类是冗余？一个安全边界、一个语料库、只读问答时，额外 LLM 分类会增加时延和误路由面。跨 `tech/billing/job` 域或工具能力不同才路由；低置信应澄清或默认安全帮助。
3. **工具层**：Web/Deep Research 与内部 skills 有何不同？skills 是受注册表、参数 schema、权限和预算约束的能力；Web 是不可信外部材料，必须 allow-list、SSRF 防护、提取/引用隔离，永远不能拼入 system instruction。

### 图与 TypeScript 例子

```text
START → genQuestion → persistQuestion → awaitAnswer(interrupt) → evalAnswer
          ↑                                                    ├→ continue → genQuestion
          └────────────────────────────────────────────────────┤
                                                               ├→ finish → finalize → END
                                                               └→ degrade → END
report 由 finalize 出图后投递独立 job；不作为同步 subgraph 拖住面试。
```

```ts
type Route =
  | { action: 'retrieve'; corpus: 'qbank' | 'public_tech'; confidence: number }
  | { action: 'clarify'; reason: 'ambiguous_referent' | 'low_confidence' }
  | { action: 'handoff'; domain: 'billing' | 'jobs'; confidence: number };

function execute(route: Route, principal: Principal) {
  if (route.action === 'handoff') return supportCase.create(principal, route.domain);
  // handoff 不是退款、扣点或读取任意资源的授权。
}
```

### 量化 SLO、验证与反例

| 指标 | 发布门/目标 | 如何测 |
| --- | ---: | --- |
| 同一 `(thread,node,turn)` 外呼的已提交结果 | 1 个，重放逐字节一致 | ledger/graph 重放测试 |
| graph recursion / tool budget | 100% 有上限并收敛到 finish/degrade | 属性/故障注入 |
| allow-list 外 Web 请求与私网 SSRF | 0 | Web explore 安全测试 |
| 路由到特权动作 | 0 | `misroute_to_privileged_action` 指标 |
| 模型连接池等待 p99 | < 250 ms（压测目标） | 外呼在事务外、池与 worker 分离 |
| RAG/研究输出无引用时的事实断言 | 0 | grounding/abstain 评测 |

**反例**：节点内写 `while (!done) await model.invoke()`，或者把 `awaitAnswer` 和外呼混在同一个 interrupt 节点；两者都会损失 LangGraph durable resume 并放大重放副作用。另一个反例是让 classifier 的 `billing` 标签直接执行退款；分类不是权限、订单校验或幂等性。

**事实边界**：✅ 自适应面试图、interrupt/resume、业务事件、invoke 双校验、稳定调用账本、本地检索、allow-list Web/Deep Research seam 与 research skills 已存在；默认运行可通过 `WEB_ALLOWLIST=''` 关闭外网且只用本地题库。🟡 跨供应商 failover 代码存在但默认单端点，长期记忆未接线。⛔ 自主研究 supervisor 扇出图尚非当前产品实例；真实 Web 质量、来源许可、域名治理和生产 egress policy 需要平台配置与持续评测，不能以接口存在宣称已交付。

---

## 7. 评分与招聘决策：怎样让“分数”成为证据化辅助而非伪精确自动淘汰

### 90 秒口语答案

我会把评分链路正确性和模型评分有效性分开报告。链路正确性要求答案 hash 幂等、评分范围合法、证据引用必须是本次答案的连续片段、模型失败进入 `unscored` 或 clarify，不能偷偷给 0 分；这些可以用确定性测试做到零已知违规。模型是否真正理解技术答案则必须用冻结金标、红队输入、语言/岗位切片和双盲人工标注来测，报告样本数和 Wilson 置信下界，不能拿 3/3 或 fake model 说准确率 100%。在 B 端，分数只能是人工复核的排序辅助：每一个非降级维度都要带至少一个证据 span 和 question/rubric/model/prompt 版本；没有证据就 `inconclusive`。不提供自动 reject/hire API，申诉产生新 assessment version，而不是覆盖旧记录。这样候选人能看到与自己答案相关的解释和改进方向，但看不到题库答案、隐藏 rubric 或模型链式推理。

### 深追三层

1. **输入层**：用户说“上面那个方案”或“简历那段是 AI 编的”怎么办？不完整指代不能假装是技术作答；事实纠正优先于评分，原题应失效或澄清，不把用户纠正记 0 分。
2. **证据层**：为什么模型说有 evidence 不够？业务校验要验证 quote 是当前答案的连续子串，并保存 offset/hash/version；否则模型可编造引用，B 端就会得到不可审计分数。
3. **决策层**：为什么不能按 `<60` 自动拒绝？当前没有岗位/语言/群体的绝对校准、公平性和招聘结果因果证据；把训练分数直接改成雇佣决策会把统计不确定性变成现实伤害。

### 状态机与例子

```text
Answer: received → sanitised → evaluating → scored
                             ├→ clarify（指代/事实纠正/证据修复耗尽）
                             └→ unscored（provider/schema 故障）
Assessment: v1 → superseded_by_v2（申诉/重算不覆盖旧版本）
Decision: draft → human_confirmed（没有自动 reject/hire 边）
```

```ts
function validateEvidence(answer: string, evidence: { quote: string; start: number }) {
  return answer.slice(evidence.start, evidence.start + evidence.quote.length) === evidence.quote;
}

if (!validateEvidence(answer, output.evidence)) {
  return { kind: 'clarify' as const, reason: 'evidence_quote_not_in_answer' };
}
```

### 量化 SLO、验证与反例

| 指标 | 发布门/目标 | 当前协议口径 |
| --- | ---: | --- |
| 非相邻质量档严格单调性 | ≥ 36 对且 Wilson 95% 下界 ≥ 0.90 | 样本不足即 `inconclusive` |
| 跑题/指代相关性 | ≥ 36 条 model-route，Wilson 下界 ≥ 0.90 | 当前小样本不构成发布通过 |
| 措辞扰动稳定性 | median SD ≤ 8，p90 ≤ 12，max ≤ 15 | 分桶报告，不能只报均值 |
| 注入尾巴剥离 | 8/8 精确剥离，分差 ≤ 15 | deterministic + 真模型双层 |
| 无证据的 B 端“有效分” | 0 | 无 evidence span 则 `inconclusive` |
| 自动 reject/hire API | 0 个 | 人工 append-only DecisionRecord |

**反例**：把 “relevant=false” 当成 0 分并进入能力均分；用户的指代、噪声或事实纠正会被系统性惩罚。另一个反例是输出模型完整推理来解释 42 分：既泄露题库/攻击面，也不能证明推理真实可靠；应展示可验证的用户答案证据而非隐式推理。

**事实边界**：✅ 答案 hash、评分/报告完整性、quote 连续子串校验、评分故障降级和金标结构检查已被证明。🟡 当前真实模型只有小样本和分片证据，协议明确其为 inconclusive。⛔ 双盲人工校准、岗位/语言/群体公平性、申诉与统一重算的完整业务闭环、长期招聘结果研究未完成，因此不允许自动雇佣/淘汰或对外宣传绝对评分准确率。

---

## 8. 架构取舍与发布：如何把高可用设计变成可运营的系统

### 90 秒口语答案

我不会追求每个模块同步成功，而是明确同步边界和异步补偿边界。用户写命令走短事务：认证/授权、CAS 状态迁移、不可变事件和 outbox 一起提交；worker 用 lease、`SKIP LOCKED` 和幂等消费者领取任务，模型/支付/报告等慢外呼都放在事务外。面试主路径和报告分离：报告失败不能卡住已完成面试，前端收到 `report_unavailable` 要有出口；额度结算由 completed 事件驱动 outbox，不能让 LangGraph 节点直接改支付。容量上把 API DB 池、worker 并发、模型 provider 并发和 SSE 连接分别限流；例如 20 条 DB 连接若被每个 30 秒模型调用占住，理论吞吐只有 0.67 调用/秒，所以这不是“把连接池调大”能解决的问题。发布时使用命令级 gate、隔离 E2E、SLO 仪表盘、kill switch、DLQ 和人工升级路径。能解释降级不是失败的掩饰：它是把不可控依赖的错误转成用户可理解、可恢复、可对账的状态。

### 深追三层

1. **事务边界层**：为什么 outbox 比“DB 成功后再发消息”可靠？进程可能在 commit 后、发送前崩溃；同事务写 outbox 后，relay 至少一次投递，消费者用幂等键收敛。
2. **舱壁层**：为什么报告必须独立 run/job？报告模型慢或失败不应该占住面试 interrupt/resume 的主路径；同步 subgraph 会把父 run 一起拖住。
3. **运行层**：为什么“部署多副本”不等于高可用？没有 readiness、migration 顺序、RLS principal 恢复、queue lease、熔断、观测和灾难演练，多副本只会并发放大重复副作用。

### 状态机与例子

```text
Interview: active → completed → settlement_proposed(outbox) → report_pending
                         │                                      ├→ report_ready
                         │                                      └→ report_unavailable
                         └→ abandoned → entitlement_released

Outbox: pending → claimed → relayed
                    └→ retrying → dlq → manual_review
```

```ts
// 外呼不占 DB 事务；claim 和 finalize 均短事务，且均有条件状态迁移。
const job = await claimNextJobWithLease();       // FOR UPDATE SKIP LOCKED + commit
const result = await modelCallWithDeadline(job); // 事务外
await finalizeIfLeaseStillOwned(job.id, result); // CAS；stale worker 不发事件
```

### 量化 SLO、验证与反例

| 指标 | 发布门/目标 | 如何运营 |
| --- | ---: | --- |
| 重复状态副作用（事件、扣点、报告） | 0 | 幂等键冲突、ledger 重放、outbox lag 仪表盘 |
| outbox/DLQ | pending age p99、DLQ 数量均有阈值和告警 | 30 秒 reconciler + 人工 runbook |
| 业务终态 | 100% 进入 ready/degraded/error/abandoned 之一 | 无 spinner 死胡同测试 |
| 模型/ASR/PSP 依赖 | 成功率、timeout、fallback、成本按 provider 分桶 | circuit breaker + kill switch |
| 发布验证 | docs、契约、真 DB、负向、浏览器 E2E 均通过 | CI 串行 gate，保留证据 |
| 容灾/容量 | RTO/RPO、负载、故障演练目标须由运营签字 | 不能由本地 proof 推导 |

**反例**：在 API 请求内同步执行“面试完成 → 报告 → 支付确认 → 通知”，任一外部依赖慢就拖垮用户请求并产生未知重试状态。另一个反例是用 global in-memory `Map` 防重复：水平扩容、重启和 worker 重领都会绕过它。

**事实边界**：✅ worker reconciliation、lease 续约/回收、outbox 幂等结算、报告舱壁、SSE 降级、isolated production-build 浏览器 E2E 已具备验证路径。🟡 多 provider failover、真实 egress policy 和全面 SLO 仪表盘仍需环境配置与长期运行数据。⛔ 跨可用区容灾、正式 RTO/RPO、峰值压测容量、真实 PSP/模型故障演练和 24×7 运营值守必须由基础设施、供应商与业务负责人共同签字，不能由代码仓单独保证。

---

## 9. 面试官速查：如何判断回答是否达到专家级

| 维度 | 初级回答 | 专家级回答 |
| --- | --- | --- |
| 幂等 | “前端禁用按钮” | 命令作用域唯一键、首结果重放、DB CAS、外部调用对账 |
| 高可用 | “多副本/Redis/消息队列” | 明确事实源、同步/异步边界、降级终态、SLO、DLQ、人工路径 |
| C/B 数据 | “有 RLS” | principal 事务绑定、用途授权、最小化快照、撤回传播、全数据面审计 |
| Agent | “用 LangGraph + RAG” | interrupt 重放语义、稳定 key、条件边、预算、工具权限和验证关口 |
| SSE 性能 | “流式输出更快” | 事件账本、重连、合帧、窗口化、内存/INP/漏事件指标 |
| 语音 | “接 ASR” | 单人/双人能力门、同意、说话人归因边界、文字降级、WER/DER 基准 |
| 评分 | “模型给 0–100 分” | 证据 span、版本、`inconclusive`、置信区间、人工决策、反事实评测 |

## 10. 训练与发布清单

1. 每个主题先录音口述 90 秒；检查是否出现“谁是事实源、幂等键、失败终态、指标”四项。
2. 让同伴随机加入：双击、断网、同一 PSP 流水、历史面试 ID、撤回同意、指代性 prompt、ASR 拒绝、报告超时、worker 被杀。
3. 回答必须给出**一个反例**，说明它在并发、重放、越权或外部依赖故障时如何失败。
4. 所有当前证据应以命令重跑为准：`pnpm commerce:prove`、`pnpm recruiter:prove`、`pnpm neg:bend`、`pnpm web:prove`、`pnpm e2e:ui:isolated`、`pnpm scoring-integrity:prove`。
5. 对真实模型、真实支付、双人语音、容量、RTO/RPO 只报告样本、分桶、置信区间和未满足门；不得把 fake fixture、单次通过或设计文档升级成生产承诺。

---

## 11. 系统设计模拟面试实战

这一章不是面试官评分表，而是一套给初学者反复练习的脚本。每一组都按同一节奏练：先在九十秒内讲清主线；面试官连续三层施压时不要重新发明架构，而是回到“事实源、状态机、原子边界、唯一键、失败终态、指标”；最后用错误答案诊断自己的盲区。建议第一次照读，第二次只看小标题口述，第三次把状态机画在白板上并让同伴随机插入“用户双击、网络超时、进程被杀、越权请求、外部依赖已成功但本地未知”中的一个。

### 11.1 白板的通用画法

面对任何系统设计题，先画五个框，顺序不能颠倒：

```text
人/浏览器 ──命令──> API/鉴权 ──短事务──> 业务表 + 不可变事件 + outbox
    ↑                     │                         │
    │                     │                         └──至少一次──> worker/外部依赖
    └──SSE/查询/降级───────┴──权限、幂等、CAS──────────────────────────────┘
```

第一框回答“谁在请求、谁被授权”；第二框回答“命令的幂等键是什么”；第三框回答“哪个状态迁移必须原子”；第四框回答“数据库无法与哪个外部系统一起提交”；第五框回答“用户看见的成功、可重试、降级和人工处理分别是什么”。如果一开始只画 Redis、Kafka、模型或数据库名，却没有画资源和状态，通常意味着没有真正回答题目。

每个案例里都应该主动说三句防守性语言：

1. “这个数字是发布门/目标值，不是我凭空承诺已经达到的线上事实。”
2. “本地数据库只能保证本地事实的一次提交；对支付渠道和模型供应商只能做到至少一次投递加幂等/对账。”
3. “我会把正常路径和重复、超时、重放、越权、撤回五种非理想路径一起设计。”

---

## 实战一：支付成功了两次通知，点数会不会重复到账？

### 训练问题

用户购买 10 点面试额度。支付渠道可能在 10 分钟内重试同一个回调 100 次，也可能错误地把相同 `providerTxn` 送到两张不同订单。用户同时打开两个标签页开始面试，最后只剩 1 点。请设计支付、点数、开始面试和对账，要求不能重复入账、不能重复扣点，且外部渠道超时不能把用户卡死。

### 第一轮：90 秒首答（可直接口述）

我会把支付订单、渠道支付事实和权益消费拆开建模。支付订单记录本地商品、金额、币种和用户；渠道回调先做官方签名验证和订单字段核验，再用渠道事件 ID 去重，用 `(provider, providerTxn)` 的全局唯一约束保证一笔真实支付最多归属一张订单。订单从 `created` 用条件更新到 `paid` 的同一短事务里，写不可变的点数账本和 outbox；重复回调读出第一次处理结果并返回 2xx，不能返回 409 让渠道继续轰炸。开始面试不是直接减余额，而是以 `owner + interviewId + transition` 为作用域做 `available → reserved`；面试完成以后 worker 消费 outbox，把它幂等地 `reserved → confirmed`，中断或租约过期才 `released`。最后一份点数被两个标签抢时，数据库条件更新只允许一个 reserve 成功，另一个返回 402。数据库事务不包支付渠道或模型调用，所以支付回调、本地提交、报告生成和结算都按至少一次设计，并有 reconciler 扫描卡住的预留、outbox 和未知渠道状态。我的验收不只看 HTTP 200，而是看同一渠道流水二次入账为零、同一消费二次确认为零、账本守恒和对账延迟。

### 白板图与状态机

```text
浏览器创建订单 ──> PaymentOrder(created)
                         │
PSP webhook(至少一次) ───┼──> 验签/金额币种/商户核验
                         │       │
                         │       ├──重复 event/txn：读首结果，2xx
                         │       └──新支付事实：paid + ledger credit + outbox（同事务）
                         ▼
                 EntitlementBucket(available)
                         │ start interview, CAS
                         ▼
Consumption(granted → reserved → confirmed)
                    └──────────→ released
```

```text
PaymentOrder: created → paid → refunding → refunded
                    ├→ closed
                    └→ late_payment_review（关单后真实扣款，不能直接发点）

Consumption: granted → reserved → confirmed
                         ├→ released
                         └→ refunded_uncollectible → manual_review
```

这里要解释两个看似相似但不能混用的键。`provider_event_id` 是“这一条通知”唯一，阻止同一 webhook 重放；`provider_txn` 是“这笔真实支付事实”唯一，阻止两条不同通知或两张订单争抢同一流水。消费侧的键又不同：`interviewId:reserve`、`interviewId:completed` 代表业务状态迁移，不能拿渠道流水代替。

### 关键 SQL 与 TypeScript

```sql
-- 迁移阶段：支付事实全局唯一，允许 created 订单还没有流水号。
CREATE UNIQUE INDEX uq_payment_order_provider_txn
  ON payment_order(provider_txn)
  WHERE provider_txn IS NOT NULL;

BEGIN;
-- 先落渠道事件摘要；冲突时读取既有处理结果，绝不再发点。
INSERT INTO payment_event(provider, event_id, payload_hash, received_at)
VALUES ($1, $2, $3, now())
ON CONFLICT (provider, event_id) DO NOTHING;

SELECT id, status, amount_minor, currency, merchant_id
  FROM payment_order
 WHERE id = $4
 FOR UPDATE;

-- 服务端把已验签 payload 与本地订单逐项比较后才允许迁移。
UPDATE payment_order
   SET status = 'paid', provider_txn = $5, paid_at = now()
 WHERE id = $4 AND status = 'created';

INSERT INTO entitlement_ledger(owner_user_id, source_order_id, units, event_type)
VALUES ($6, $4, 10, 'credit');

INSERT INTO commerce_outbox(kind, aggregate_id, idempotency_key, payload)
VALUES ('payment_credited', $4, concat('payment:', $4, ':paid'), $7::jsonb);
COMMIT;
```

```ts
// 伪代码：短事务只做本地事实；网络调用绝不夹在 FOR UPDATE 与 COMMIT 中间。
async function reserveForInterview(input: {
  owner: string; interviewId: string; units: number;
}) {
  const key = `${input.owner}:${input.interviewId}:reserve`;
  return asPrincipal(pool, input.owner, async (c) => {
    const previous = await findConsumptionByKey(c, key);
    if (previous) return { kind: 'replay' as const, consumption: previous };

    const updated = await c.query(
      `UPDATE entitlement_bucket
          SET available = available - $1, reserved = reserved + $1
        WHERE owner_user_id = $2 AND available >= $1
        RETURNING id`,
      [input.units, input.owner],
    );
    if (updated.rowCount !== 1) throw new InsufficientEntitlement();
    return createConsumption(c, { key, status: 'reserved', ...input });
  });
}
```

### 第二轮：压力追问 1——“HMAC 验签成功，为什么还要校验金额？”

**初学者常见回答**：“签名正确就说明是支付平台发的，所以把订单改成 paid 就行。”

**错误诊断**：签名只能证明 payload 的来源和完整性，不证明 URL 中的订单、前端声称的套餐、数据库当前订单与 payload 中的金额/币种/商户完全一致。拿错订单 ID、环境错配、部分退款、货币单位错 100 倍、测试商户回调到生产订单，签名仍然可能合法。更糟糕的是，如果 API 用客户端传入的 userId 给点数，合法渠道通知会被利用来给别的用户入账。

**专家重答**：验签通过只是进入本地核验的前置条件。服务端只能由本地 `orderId` 找出 owner、预期 `amountMinor/currency/merchant/product`，再和渠道已验签 payload 以及必要时主动查单结果逐项比较。金额要用最小货币单位整数，不用浮点；商品、商户和 paid 状态也要一致。字段不一致时不发点，不把错误默认为重试成功，而是把 payload hash、订单、原因落到 quarantine/人工核对队列，返回符合渠道规范的响应并告警。这样“签名合法但业务不一致”的入账数目标仍是 0。

**可以画的失败分支**：

```text
verified webhook
  ├─ event 已处理 ───────────────> replay 2xx
  ├─ txn 已被另一订单占用 ───────> quarantine + security alert + 2xx/按渠道规范
  ├─ amount/currency/merchant 不匹配 ─> no credit + manual review
  └─ 全部匹配 ───────────────────> paid + ledger + outbox
```

### 第三轮：压力追问 2——“渠道请求超时，你凭什么不再试一次退款？”

**初学者常见回答**：“超时就是失败，重试到 3 次；每次都带同一个数据库事务。”

**错误诊断**：超时只说明客户端没有拿到响应，不说明渠道没有受理。若第一次渠道已创建退款、响应在路上丢失，第二次不同幂等键会真的再退一次。事务也无法覆盖 HTTP：持锁 30 秒会把连接池占满，回滚本地事务无法回滚已发出的退款。

**专家重答**：创建独立 `refund_order`，其本地状态为 `requested → in_flight → provider_accepted → refunded`，并让 `(paymentOrderId, refundSequence)` 唯一。向渠道发送退款时使用稳定的 provider idempotency key；超时后优先按该 key/退款号查单，不知道结果就保持 `in_flight` 并由有 deadline 的 reconciler 接管，而不是重新生成退款命令。用户退款与权益回收解耦：权益已 confirmed 时记 `refunded_uncollectible/manual_review`，但不能因为收不回已消费点数而长期卡住对客退款。

### 第四轮：压力追问 3——“怎么证明最后 1 点不会超卖？”

**初学者常见回答**：“在 Node 里用 mutex，或者先读余额，余额大于零就减一。”

**错误诊断**：单进程 mutex 在多实例、重启、worker 重领时失效；读后写会发生竞态。Redis 锁也不能自动让 Postgres 中的余额与消费记录原子一致，锁超时还会出现双持有者。

**专家重答**：把余额条件放进同一条数据库更新或行锁事务，且消费记录的幂等键在同一事务内创建。例如 `UPDATE bucket SET available=available-1 WHERE owner=? AND available>=1 RETURNING id`，只有 rowCount 为 1 才能创建 `reserved`。同一键的重试先读到已有消费并返回首结果；不同键并发争最后一点时恰好一个更新成功。随后用 property test 生成 reserve/confirm/release/replay/crash 序列，验证所有桶的 `available + reserved + confirmed + refunded` 与不可变账本总额守恒。

### SLO、压测方法与量化接受阈值

| 场景 | 压测方法 | 接受阈值 | 失败后的动作 |
| --- | --- | ---: | --- |
| 同一 webhook 100 次重放 | 同 eventId、同 txn 并发发 100 请求 | credit 行数 = 1；二次入账 = 0 | 返回首结果，记录 replay 指标 |
| 同 txn 打到两订单 | 2 订单各 20 并发通知 | `provider_txn` 归属 = 1；另一笔无点数 | quarantine + P0 告警 |
| 最后 1 点并发开始 | 20 个不同 command key 并发 reserve | 成功 = 1，402 = 19，负余额 = 0 | 失败端展示额度已占用 |
| worker 崩溃 | reserve 后 kill worker，等待 lease 过期 | 孤儿 reserved 在窗口内 release 或 confirm；悬挂 = 0 | reconciler/DLQ/人工 |
| 渠道超时 | 注入“渠道已受理但无响应” | 二次退款 = 0 | 查单、in_flight 对账 |

建议初学者最后用一句收尾：“我不把目标说成 100% 不出故障；我把重复资金副作用要求为零，把未知外部状态放进可观测、可重试、可人工收口的状态机。”

**当前事实与外部阻断**：✅ 当前仓库已具备 `provider_txn` 部分唯一索引、权益 reserve/confirm/release、outbox 结算、lease 心跳和 reconciler；真库证明覆盖同流水跨订单与并发 reserve。⛔ 真实 PSP 的证书轮换、争议/拒付、清结算文件、财务核账和退款 SLA 必须由支付供应商、密钥管理、财务流程和线上演练提供证据，不能从本地 HMAC fixture 推导。

---

## 实战二：把 C 端训练与 B 端招聘接起来，怎样不泄露和不串分？

### 训练问题

招聘方邀请候选人参加“高级后端工程师”岗位面试。候选人已经做过很多 C 端练习，且其中一场分数很高。请设计从邀请、候选人开始、岗位专属面试、完成回填到招聘方查看结果的全链路；候选人撤回同意时也要说明。要求招聘方看不到历史训练正文，候选人不能把任意历史分数塞给岗位。

### 第一轮：90 秒首答（可直接口述）

我会把岗位评估定义为独立聚合，不把它视为“普通面试加一个标签”。招聘方创建岗位和邀请后，候选人看到该岗位的处理目的、最小化字段范围和期限；开始时服务端以 application 为入口，在一个事务里验证候选人、申请状态和已摄取简历，然后创建或复用唯一的 application-bound interview，冻结 `applicationId、jobId、resumeId、candidateId`，并返回可信的跳转地址。客户端不能把自选 interviewId 传到 finalize。面试完成后，worker 或数据库触发器从这个绑定会话的服务端事件计算岗位分数，写 application 的完成状态；浏览器的 finalize 只是可重试确认。招聘方查询走 recruiter principal 和 RLS，只能得到岗位申请状态、分数和允许展示的摘要，不能读取 C 端训练 transcript、简历原文或模型 trace。隐私上，RLS 解决“谁能读”，但不解决“为什么能读”，所以生产版还需要 purpose-bound grant、同意版本、到期与撤回传播；撤回后不能启动新检索或新评分，在途 worker 必须收敛到 `terminated_consent`。验证上我会做 20 并发 start、历史 interview 注入、三主体越权和真实浏览器 C→B E2E。

### 白板图与状态机

```text
Recruiter ─创建岗位/邀请─> JobApplication(invited)
Candidate ─接受目的/选简历─> start(applicationId, resumeId)
                                    │ 短事务
                                    ├─ 读取 application/job/resume/owner
                                    ├─ 创建或读回 BoundInterview
                                    └─ application.in_progress
Candidate ─真实面试/SSE─> BoundInterview(completed)
                                    │
                                    └─ 服务器反查绑定，派生 score，application.completed
Recruiter ─最小化查询─> status + score + authorized summary
```

```text
JobApplication: invited → in_progress → completed
                     ├→ declined
                     └→ terminated_consent（目标状态，需同意闭环）

EvaluationSession: creating → active → completed → immutable_snapshot
                       ├→ degraded
                       └→ terminated_consent

ShareGrant: draft → active → revoked/expired
```

这里要在白板旁边写两条一对一不变量：`application_id -> interview_id` 唯一，`interview_id -> application_id` 也唯一。只有单向唯一会留下串岗入口；只在 API 内验证而不在 DB 约束，会被后台脚本、迁移 bug 或新服务绕过。

### SQL 与服务端命令例子

```sql
ALTER TABLE interview
  ADD COLUMN application_id text,
  ADD COLUMN job_id text,
  ADD COLUMN resume_id uuid;

CREATE UNIQUE INDEX uq_interview_application_binding
  ON interview(application_id)
  WHERE application_id IS NOT NULL;

CREATE UNIQUE INDEX uq_job_application_interview_binding
  ON job_application(interview_id)
  WHERE interview_id IS NOT NULL;

ALTER TABLE interview ADD CONSTRAINT ck_bound_interview_complete_key
  CHECK (
    (application_id IS NULL AND job_id IS NULL AND resume_id IS NULL)
    OR
    (application_id IS NOT NULL AND job_id IS NOT NULL AND resume_id IS NOT NULL)
  );
```

```ts
// client 不给 finalize 选择 interview；所有关键关系在服务器反查。
async function finalizeApplication(principal: string, applicationId: string) {
  return asPrincipal(pool, principal, async (c) => {
    const bound = await c.query(`
      SELECT ja.id, ja.job_id, ja.resume_id, ja.interview_id,
             i.owner_user_id, i.status, i.application_id, i.job_id AS interview_job_id
        FROM job_application ja
        JOIN interview i ON i.id = ja.interview_id
       WHERE ja.id = $1
       FOR UPDATE`, [applicationId]);

    const row = bound.rows[0];
    if (!row || row.owner_user_id !== principal || row.status !== 'completed'
      || row.application_id !== row.id || row.interview_job_id !== row.job_id) {
      throw new CannotFinalize();
    }
    // score 从这场绑定会话的 answer_evaluated 事件派生；不是客户端 body。
    return finalizeOnceFromBoundEvents(c, row);
  });
}
```

### 第二轮：压力追问 1——“前端不显示历史 interview 下拉框还不够吗？”

**初学者常见回答**：“够了，用户在页面上看不到就选不了。”

**错误诊断**：浏览器永远不是权限边界。用户可以改请求 body、重放旧请求、直接调用 API；另外移动端、后台任务和未来的新客户端也不会自动继承这段 UI 限制。即使前端无漏洞，只要 finalize 接收任意本人 interviewId，业务关联仍可伪造。

**专家重答**：UI 可以减少误操作，但服务端契约要直接禁止该输入：finalize 使用 strict 空命令体，只接受 application ID。数据库在申请和 interview 两边都维护唯一绑定，绑定字段不可变；finalize 再次验证 candidate、job、resume、application 和 completed 状态。这样即使有人构造历史 interviewId，它也没有被解释的字段，返回 400/409 并保持 application score 为 NULL。真正的安全性来自“用户不能表达非法关联”，而不是“用户不容易找到按钮”。

### 第三轮：压力追问 2——“RLS 已经隔离了，为什么还要同意和用途？”

**初学者常见回答**：“招聘方只能查自己的岗位，所以隐私问题已经解决。”

**错误诊断**：RLS 回答的是“这个 principal 能否读一行数据”，它不描述候选人是否知道数据会被用于招聘、哪些字段可以给某企业、多久失效、撤回后 worker 如何停止。把 C 端训练同意默认为 B 端招聘同意，会把不同处理目的混成一个权限位。

**专家重答**：要存储可审计的 ShareGrant 或等价授权快照：candidate、recipient tenant、purpose、allowed field set、consent version、created/expiry/revoked 时间和关联 application。B 端只读取 application snapshot 中的 allow-list 字段；C 端历史 transcript 即使同一用户拥有，也不自动共享。撤回是分布式状态变化：API 新读、新检索、新模型调用必须 fail-closed，worker 在 checkpoint resume 前复核 grant revision，缓存、向量、SSE、trace 要接受失效/删除任务。RLS 仍是数据层底座，但不是合规闭环的替代。

### 第四轮：压力追问 3——“撤回和 worker 正在评分同时发生，谁赢？”

**初学者常见回答**：“撤回后把 application.status 改成 cancelled，worker 下次自然会看到。”

**错误诊断**：`worker 下次` 没有原子性。它可能已经读取了旧上下文、正在调用模型，甚至即将写回分数。仅改 application 状态还可能留下缓存、已排队报告和已经打开的 SSE。

**专家重答**：撤回命令应增加不可逆 consent revision，并在同一事务内写取消事件/outbox；所有可产生新数据的消费者在 claim、模型调用前和 finalize 前都比较 revision。已 claim 的 job 只能把当前结果丢弃并转 `terminated_consent`，不能写新 score 或 report。对无法同步取消的 provider 调用，要记录其已经发送但其结果不可再落库；缓存键包含 grant revision 并主动失效，向量和 trace 清理以异步任务和审计记录闭环。压测时用 20 路撤回与 resume 竞争，目标是最终 20/20 都终止、0 个撤回后新评分事件。

### SLO、压测方法与量化接受阈值

| 场景 | 压测方法 | 接受阈值 | 失败后的动作 |
| --- | --- | ---: | --- |
| 同一申请双击/刷新 start | 20 并发 `start(application,resume)` | interview = 1；绑定 = 1；重复 reserve = 0 | 全部返回同一可信 ID |
| 历史高分注入 | 本人已完成历史 interview + 任意 finalize body | 非绑定回填 = 0；score 仍 NULL | 400/409，安全审计 |
| recruiter 越权 | 三个 recruiter principal 互相查询/修改 | 跨主体读写 = 0 | 404/0 行，不泄露存在性 |
| C 端正文泄露 | recruiter 查询 DB、API、SSE、trace 投影 | transcript 字段/行 = 0 | P0 告警与发布阻断 |
| revoke 与 resume | 20 对并发撤回/worker resume | `terminated_consent` = 20；新评分 = 0 | 停止队列，清理任务，人工核验 |
| 端到端体验 | 两个独立浏览器身份跑全链路 | 正常、双击、刷新、拒绝、撤回、越权均通过 | 保留 trace/截图，不以 mock API 替代 |

**当前事实与外部阻断**：✅ 当前实现已把 application/job/resume/candidate 四元绑定落到 DB，20 并发 start 收敛到 1，finalize 不接收客户端 interviewId，招聘方不读逐题 transcript，隔离生产构建浏览器 C→B 路径已通过。⛔ 目的限定的 ShareGrant、撤回传播到向量/缓存/checkpoint/trace、企业多租户成员和席位、DSAR、人工决策记录仍需要独立领域模型、基础设施任务和合规负责人验收；这些缺口不能被“已有 RLS”掩盖。

---

## 实战三：产品说“做双人电话面试”，如何不把单人 ASR 冒充成电话能力？

### 训练问题

产品经理看到单人麦克风转写后，希望本周上线“AI 同时听招聘方和候选人的电话，并自动生成逐句纪要、谁说了什么、双人评分”。请你在不阻断已有单人语音体验的前提下，说明能上线什么、不能上线什么、状态机、性能和隐私门槛。

### 第一轮：90 秒首答（可直接口述）

我会先把需求拆成两个产品。当前可安全上线的是：用户明确同意后，浏览器采集单人本机麦克风片段，经同源接口转写成可编辑文字，用户确认后仍走原有文本答题。响应必须明确写 `single_local_microphone`、`not_diarized`、`wordTimestamps:not_available`；TTS、麦克风和 ASR 任一失败都回到文字模式。不能把本机电平动画或混音单轨称为电话、会议或“面试官/候选人”归因。双人电话需要额外的远端媒体轨或经批准的 diarization，双方按参与者记录可撤回同意、目的、接收方和保留期，并设计媒体加密、访问审计、删除传播、租户隔离、预算和 provider 降级。上线前还必须在授权去标识双人样本上按语言、口音、噪声和重叠说话分桶报告 WER、DER、说话人归因准确率、首字和最终字延迟。没有这些数据和签字门，产品文案只能说单人语音输入，双人电话能力必须关闭。

### 白板图与状态机

```text
单人已实现链路：
consent_required → connecting → speaking → listening → transcribing → editable_text → submitting
       ├→ text_mode（用户取消）                 ├→ text_mode（ASR 不可用）
       └→ text_mode（拒绝麦克风）               └→ text_mode（空文本）

双人目标链路：
two_party_consent → track_verified → encrypted_capture → diarize/transcribe
     → attribution_validated → editable_review → permitted_summary
     └→ text_mode / stop_processing / deletion_propagation
```

需要向面试官主动指出：第二条不是把第一条多加一个 `speaker` 字段。它增加了媒体来源、双方授权、归因正确性和更高敏感度的数据生命周期。一个错误的 speaker label 可能造成招聘歧视、隐私投诉或错误评分，因此必须以 capability gate 控制，而不是用 prompt “尽量区分说话人”。

### TypeScript 契约与动效例子

```ts
// 当前允许的输入边界：在到达 ASR provider 前就拒绝非法 capture。
const TranscribeDto = z.object({
  audioBase64: z.string().max(13_500_000),
  mimeType: z.enum(['audio/webm', 'audio/wav']),
  capture: z.object({
    mode: z.literal('single_local_microphone'),
    consent: z.literal(true),
    policyVersion: z.literal('voice_ephemeral_v1'),
  }),
});

function acceptTranscription(body: unknown) {
  const valid = TranscribeDto.safeParse(body);
  if (!valid.success) throw new BadRequest('capture_not_supported');
  return valid.data;
}
```

```ts
// 音频分析可以高频，React 视觉状态不能高频提交。
const LEVEL_INTERVAL_MS = 80; // ≤12.5Hz；业务状态仍由 SSE/服务端决定。
function publishLevel(level: number, now: number) {
  if (now - lastPublished < LEVEL_INTERVAL_MS) return;
  lastPublished = now;
  setUiLevel(level); // reduced-motion 下只更新“正在聆听”文字。
}
```

### 第二轮：压力追问 1——“用户点了同意，不就能录双方了吗？”

**初学者常见回答**：“用户同意了，所以把通话录下来交给 ASR。”

**错误诊断**：谁同意？本机用户能同意自己本地麦克风，不代表远端参与者同意被采集、转写、存储、给企业使用。即使电话参与者都口头同意，也需要能审计的目的、接收方、保留期、版本和撤回路径。更重要的是，浏览器本机麦克风并不自动拿到远端媒体轨；录到扬声器回声也不能证明归因。

**专家重答**：单人模式的同意是 `single_local_microphone` 的最小授权。双人模式必须在会话开始前让每位参与者建立自己的 consent record，包含 participantId、purpose、recipient、retention、policyVersion、timestamp 和 revoke URL；采集层只接受获授权的独立轨，或使用经过评估和批准的 diarization provider。缺任一参与者同意、轨道身份不明、策略版本不匹配都 fail-closed 到文字模式。撤回时立即停止新的处理，并让存储、队列、缓存和导出进入删除/冻结流程。

### 第三轮：压力追问 2——“ASR 给了一个文本，为什么不能直接按谁说的评分？”

**初学者常见回答**：“模型可以自己根据语气和上下文判断说话人。”

**错误诊断**：这把未经验证的模型猜测升级成招聘事实。双人场景的错归因不仅是普通 WER 错字，还会把招聘方的提问算作候选人的能力回答，或者把候选人的敏感表述归给招聘方。语言模型的自信文本不是来源证据。

**专家重答**：评分输入必须带可验证的 `trackId`、单调时钟区间、speaker attribution confidence 和模型/diarization version。只有通过阈值、且用户可校正的候选人 utterance 才能进入评分；不确定片段标 `unattributed`，不能自动计分。评价指标至少分开看：转写 WER、分离 DER、speaker attribution accuracy、重叠语音切片、不同语言/口音/噪声切片。只有经产品、隐私和质量负责人确认阈值，才允许改变 capability gate；没有真实双人基准时答案是“不支持”，不是“算法应该可以”。

### 第四轮：压力追问 3——“实时字幕要每 20ms 更新，页面会卡怎么办？”

**初学者常见回答**：“每拿到一帧音频就 setState，React 自己会优化。”

**错误诊断**：音频帧、ASR partial、VAD 电平和业务事件的频率不同。把所有帧写入 React state 会造成 layout/GC/渲染风暴，移动端尤其明显；更危险的是把 partial 文本当成可计分事实，网络重连后可能重复或撤销。

**专家重答**：音频处理留在 Web Audio/Worker；视觉电平做节流和 animation frame 合并，当前单人动效 80ms 最多 12.5Hz、28 条波形即可表达“在听”。字幕 partial 只作为易失展示，不写业务账本、不触发评分；最终文本需有稳定 utterance ID 和可编辑确认，提交后才进入原有幂等答题命令。页面还必须尊重 `prefers-reduced-motion`，改为静态状态文字。性能验收看每秒 commit、INP、长任务、heap 和移动端掉帧，不仅看桌面机听起来是否流畅。

### SLO、压测方法与量化接受阈值

| 场景 | 压测/评测方法 | 接受阈值 | 失败后的动作 |
| --- | --- | ---: | --- |
| 无同意或双人伪造 | 调用 transcribe API，计 ASR provider 调用 | ASR 调用 = 0 | 400 + 文字入口 |
| 单人 VAD 动效 | 模拟 60fps 音频输入，记录 React commit | UI level ≤12.5Hz，28 bars | 合帧/节流，非逐帧 setState |
| ASR/Mic/TTS 故障 | 拒绝权限、注入 provider 5xx、TTS exception | 100% 可切回文字 | 展示原因与重试 |
| 双人转写质量 | 授权去标识双轨集，分语言/口音/噪声/重叠 | WER、DER、归因、p95 延迟均需签字阈值 | 不达标关闭双人 gate |
| 双人删除与撤回 | 撤回后检查对象、缓存、队列、导出 | 新处理 = 0；删除传播 100% 可审计 | 停止会话、告警、人工核验 |

**当前事实与外部阻断**：✅ 单人本机录音、显式同意、单轨转写、可编辑文本、TTS/ASR/Mic 的文字降级、80ms/28 条“在听”动效已有实现与负向测试。⛔ 远端媒体/PSTN/WebRTC 通话、双人轨、diarization provider、双人基准集、WER/DER 签字阈值、媒体 KMS 和删除传播尚未完成；因此双人电话不能以任何 UI 文案或数据字段暗示已可用。

---

## 实战四：SSE、React 与恶意流：十万上下文怎样既不卡又不被注入？

### 训练问题

一次面试可能持续数小时，服务端不断推送进度、题目、评分和报告事件。产品又希望实时展示“讲解流”。用户网络会断、浏览器会后台节流、模型可能输出极长文本或 HTML 注入，历史记录可能达到数万轮。请设计协议、前端状态、性能策略和安全边界。

### 第一轮：90 秒首答（可直接口述）

我会把 SSE 视为可丢弃的投影连接，而不是会话事实源。服务端先把题目、答题、评分、报告等业务事实持久化到事件账本/checkpoint，再按单调 event ID 发送 `question_ready`、`waiting_user`、`answer_evaluated`、`report_ready` 等强类型事件；客户端只应用 ID 大于 `lastEventId` 的合法 schema 事件，断线后带同一个 resultId 和 `Last-Event-ID` 重连，服务端重放使状态收敛。题目事件必须含 `questionId/stateVersion/turn`，避免重连后把回答提交到旧题。渲染方面，业务事件在同一 animation frame 内合并成最后一个视图，长历史做窗口化/虚拟化，例如 10,000 轮只挂载 80 轮；SSE parser 要处理 CRLF、分块、心跳、坏 JSON 和事件大小上限。展示性讲解流与业务事实分离，不能把裸模型 token 当分数或状态；Markdown 经 sanitize，未闭合围栏或不可信 HTML 不直接进 DOM。断线重连有限次数，耗尽时进入 degraded 并提供返回、重试或稍后恢复，不允许永久 spinner。性能与安全门同时报告：事件漏失/重复、重连 p95、每帧 commit、DOM 节点、INP、heap、长任务和 XSS 成功数。

### 白板图与状态机

```text
业务真相：API/worker → event ledger + checkpoint → SSE replay
                                         │
浏览器：connecting → question → waiting_user → answered → report_ready
     │                 │                                      ├→ closed
     └─流断────────────┴→ reconnecting → 同 ID 重放 ───────────┤
                                                   └→ exhausted → degraded/error

展示性文本：token/markdown partial → fence/sanitize → requestAnimationFrame view
业务事实：question/score/report     → schema/ID/状态机 → server-truth-wins
```

这张图的关键是两条线不能混：模型 token 可以丢、可以重排、可以完全关闭；题目身份、分数、面试状态和扣点只能来自持久业务事件。若把 token 直接 append 到“最终报告”，恶意输出、断线和重复 replay 都会变成业务错误。

### TypeScript 例子：解析、去重与合帧

```ts
type BusinessEvent =
  | { event: 'question_ready'; id: number; data: { question: string; questionId: string; stateVersion: number; turn: number } }
  | { event: 'waiting_user'; id: number; data: Record<string, never> }
  | { event: 'answer_evaluated'; id: number; data: { score: number } }
  | { event: 'report_ready'; id: number; data: { overall: number } }
  | { event: 'report_unavailable'; id: number; data: { reason: string } };

function acceptEvent(view: View, event: BusinessEvent): View {
  if (!Number.isInteger(event.id) || event.id <= view.lastEventId) return view;
  // schema 已在边界验证；这里仅做纯归约，不写订单/评分等业务事实。
  return applyEvent(view, event);
}

let pending: View | undefined;
let raf: number | undefined;
function commitLatest(next: View, commit: (v: View) => void) {
  pending = next;
  if (raf !== undefined) return;
  raf = requestAnimationFrame(() => {
    const latest = pending;
    pending = undefined;
    raf = undefined;
    if (latest) commit(latest);
  });
}
```

```ts
// 组件卸载必须取消尚未提交的帧，避免已卸载组件 setState。
function dispose() {
  if (raf !== undefined) cancelAnimationFrame(raf);
  raf = undefined;
  pending = undefined;
  abortController.abort();
}
```

### 第二轮：压力追问 1——“为什么不让服务端每生成一个 token 就 SSE 一次？”

**初学者常见回答**：“流式 token 体验最好，所以越细越好。”

**错误诊断**：体验和事实必须分开。token 频率高、可撤销、易重复，浏览器和网关承受的帧数会线性增长；更关键的是模型在 token 阶段尚未通过 schema、引用、业务规则和安全验证。若分数或题目结构从裸 token 产生，用户会看到后端最终拒绝的内容，甚至把注入内容作为 UI 指令。

**专家重答**：事实链路只推已持久化、强 schema 的业务事件；这类事件数量按题次/状态而非 token 数增长。讲解或非事实文本可以单独推增量，但要有字节上限、seq、围栏状态和 sanitize，且关闭这条流不能影响面试状态。前端使用背压：同一帧只 commit 最后一个展示快照，必要时按字符/时间批处理；服务器对慢客户端可丢弃可重建展示增量，但不能丢业务账本事件。这样既能保持感知流畅，又不让视觉协议成为评分和状态机的旁路。

### 第三轮：压力追问 2——“断线后为什么不直接从前端 localStorage 继续？”

**初学者常见回答**：“把 messages 和当前分数保存到 localStorage，刷新就恢复。”

**错误诊断**：这会创造第二真相。服务器可能已完成评分但浏览器没收到，或者浏览器缓存了用户已经撤回/过期的会话；多个标签页会彼此分叉。localStorage 也不适合保存敏感 transcript 和 token。

**专家重答**：URL 中的 `resultId` 是恢复句柄，服务端 checkpoint 和事件账本才是权威状态。客户端只保留易失 UI 信息，如输入草稿、动画开关和最后已确认 event ID；重连携带 `Last-Event-ID`，服务端重放之后将客户端归约到一致状态。若重放缺口、权限失效或服务端进入终态，前端无条件按 server-truth-wins 收敛。草稿若要保存，也应单独加密/最小化并且绝不作为提交身份或分数来源。

### 第四轮：压力追问 3——“模型在讲解里输出 `<img onerror=...>` 或一段 50MB 文本怎么办？”

**初学者常见回答**：“React 默认会转义，所以没问题；长度大一点用户会自己关掉。”

**错误诊断**：有的 Markdown/富文本路径、插件、链接和图片会重新引入 HTML 或 URL 风险；50MB 即使不执行脚本也能耗尽内存、阻塞 parser、压垮移动端。只依赖前端转义还忽略了 SSE 帧、代理、日志和存储的资源消耗。

**专家重答**：在服务端和客户端都限制事件/消息体大小、累计 buffer、单场展示长度和重连次数；超限写可观察的 `degraded`/`report_unavailable`，不是继续 append。所有模型/用户 Markdown 走 allow-list sanitizer，禁用 raw HTML 或严格过滤属性、协议和图片来源；未闭合代码围栏等不完整片段延迟渲染。链接/图片有域名白名单，绝不 `dangerouslySetInnerHTML`。安全测试要真的注入 `script`、`onerror`、截断标签、重复 event ID、恶意超大帧和 CRLF 分块，而不是只检查普通字符串。

### SLO、压测方法与量化接受阈值

| 场景 | 压测方法 | 接受阈值 | 失败后的动作 |
| --- | --- | ---: | --- |
| 同帧高频事件 | 1 个 animation frame 注入 3 次视图更新 | React commit = 1 | 合并最后快照 |
| 长历史 | 构造 10,000 轮/大量消息 | 同时挂载 ≤80 轮；DOM 不线性增长 | 窗口化/虚拟化 |
| 断线/重放 | 在帧中间切断，重复/乱序 ID 重发 | 漏业务事件 = 0；重复归约 = 0 | 从 last confirmed ID 重放 |
| 重连 | 注入网络失败、后台切换、服务端关闭 | 有界重试；耗尽后 100% 有出口 | degraded + 手动恢复 |
| 恶意内容 | XSS payload、50MB 声明、坏 JSON、CRLF 分块 | script/onerror 执行 = 0；超限不崩溃 | 丢弃展示帧，记录安全指标 |
| 真实性能 | 真机/弱网跑 1h 会话 | 需签字的 INP p95、heap、长任务、reconnect p95 | 未达标不宣称容量 |

**当前事实与外部阻断**：✅ 当前前端已验证 CRLF/心跳/分块解析、重复 ID 去重、Last-Event-ID 重连、重连耗尽降级、同帧三更新一 commit、10,000 轮窗口 80、组件卸载取消和真实 `grounded` 题型消费。🟡 十万消息、低端 Android、真实弱网、多标签和长期 heap/INP 没有足够生产压测证据；这需要性能实验室和 RUM 数据，不能用单次浏览器 E2E 外推。

---

## 实战五：容量、高可用与灾备——“上多副本”为什么不等于可用？

### 训练问题

系统由 Next.js Web、NestJS API、Postgres、worker、LangGraph、模型/ASR/支付供应商组成。老板要求“100% 高可用，任何失败都不能影响用户”。请给出诚实的容量模型、故障隔离、发布和灾备方案；解释 API、worker、数据库、SSE、模型和支付分别如何降级。

### 第一轮：90 秒首答（可直接口述）

我会先拒绝“100% 高可用”的不可验证承诺，并把目标拆成可测 SLO：本地重复副作用为零、权限泄露为零、核心命令在依赖可用时的成功率和延迟、依赖故障时的有界降级、恢复时间和数据恢复点。架构上，API 只做鉴权、契约校验和短事务：状态 CAS、事件和 outbox 同时提交；worker 用 `FOR UPDATE SKIP LOCKED` 和 lease 领取任务，慢模型、ASR、支付和报告都在事务外执行，完成后通过 lease/CAS 再写回，过期 worker 无权发事件。面试主图可 interrupt/resume，报告是独立 job，报告失败不阻塞面试完成；支付/额度结算由 outbox 和 reconciler 完成，不能由图节点直接扣款。容量要分别算 DB pool、API 并发、worker 并发、provider 并发和 SSE 连接：例如 20 个 DB 连接若每个被 30 秒模型请求占住，理论上只剩约 0.67 调用每秒，所以必须让外呼不占事务连接，并做队列、deadline、熔断和限额。发布用 migration、readiness、灰度、kill switch、证据化 E2E 和回滚；灾备则要明确 RTO/RPO、备份恢复演练和跨可用区依赖，未演练前不能只因有多副本就宣称达标。

### 白板图与状态机

```text
Web ───────> API ─短事务─> Postgres: aggregate + event + outbox
 │              │                              │
 │              └──SSE replay <────────────────┤
 │                                             at least once
 └────用户可见降级<────── worker claim/lease <──┘
                                 │
               ┌─────────────────┼──────────────────┐
               ▼                 ▼                  ▼
            Model/ASR         Report             PSP
          deadline/circuit   independent job   webhook/reconcile

Job: pending → claimed(lease) → running → succeeded
                  │                ├→ retryable → pending
                  │                ├→ degraded
                  │                └→ failed → DLQ → manual_review
                  └→ lease_expired → reclaim（旧 worker 失去写权）
```

解释时要强调：多副本只解决某个进程消失，不解决重复领取、重复扣费、schema 不兼容、数据库主库故障、供应商全局不可用、错误配置或权限串户。真正可用的系统要求副本之间通过租约、幂等键、状态 CAS 和事件账本收敛，而非“谁先跑完谁覆盖”。

### TypeScript/SQL 例子：claim、舱壁和回写栅栏

```sql
-- 多 worker 领取：同一 job 只被一个活租约持有；网络调用发生在 commit 后。
WITH candidate AS (
  SELECT id
    FROM worker_job
   WHERE status IN ('pending', 'retryable')
     AND next_run_at <= now()
   ORDER BY next_run_at, id
   FOR UPDATE SKIP LOCKED
   LIMIT 1
)
UPDATE worker_job j
   SET status = 'claimed',
       lease_owner = $1,
       lease_expires_at = now() + interval '60 seconds',
       attempt = attempt + 1
  FROM candidate
 WHERE j.id = candidate.id
RETURNING j.*;
```

```ts
async function processJob(job: Job) {
  const result = await callProviderWithDeadline(job); // DB 事务外；可超时/熔断/降级
  const saved = await db.query(
    `UPDATE worker_job
        SET status=$1, result_hash=$2, lease_owner=NULL, lease_expires_at=NULL
      WHERE id=$3 AND status='claimed' AND lease_owner=$4 AND lease_expires_at > now()`,
    [result.kind, result.hash, job.id, workerId],
  );
  if (saved.rowCount !== 1) {
    // lease 已被回收：绝不补发 SSE、绝不确认额度；结果丢弃或交 reconciler。
    metrics.increment('stale_worker_write_rejected');
  }
}
```

```text
面试完成后的两条线：
Interview.active → completed + settlement_proposed(outbox)
                  ├→ report_pending → report_ready/report_unavailable
                  └→ commerce consumer: reserved → confirmed

报告失败不逆转已完成面试；支付/模型/报告任一外部依赖失败都不能让用户停在无终态 spinner。
```

### 第二轮：压力追问 1——“把模型调用包在数据库事务里不就能 exactly once 吗？”

**初学者常见回答**：“事务开始，调模型，写评分，事务提交；失败就 rollback。”

**错误诊断**：数据库事务不能回滚一个已经发出的 HTTP 请求，也不能退回模型供应商已产生的 token 费用。如果模型成功返回后进程崩溃在 commit 前，重试可能再次调用模型。更现实的问题是，慢模型把数据库连接和锁占几十秒：默认池 20 时，30 秒一次外呼的理论上限只有 `20 / 30 ≈ 0.67` 次/秒，正常读写会被连带拖死。

**专家重答**：在短事务里写 `invocation_ledger(key, request_hash, state=in_flight)` 并提交；模型调用携带稳定 provider idempotency key，发生在事务外。并发看到同 key 的 `committed` 直接重放已验证结果，看到 `in_flight` 先等待有限时间、查 provider 或交 reconciler，而不是盲调。返回后在第二个短事务里写 schema+业务校验后的结果和 usage，并将 ledger 迁移为 committed。若 provider 不支持幂等查询，只能诚实称为“本地结果恰一次提交、外部调用至少一次”，成本预算按最坏重复计算。连接池、worker 并发和 provider 并发分别限流，DB 等待 p99 是硬指标。

### 第三轮：压力追问 2——“报告失败，为什么不把整场面试回滚并退点？”

**初学者常见回答**：“报告失败说明面试没有完成，所以全部回滚比较一致。”

**错误诊断**：面试问答和报告是两个不同交付物。候选人已经作答、评分事件可能已持久化；回滚业务事实会制造审计空洞，也可能让用户重复消耗时间。将报告子图同步嵌入主图会让一个慢报告阻塞用户交互，甚至导致重复面试。

**专家重答**：主面试完成即冻结已完成的核心事实，并通过 outbox 提议结算；报告独立 job 有自己的 lease、重试和舱壁。报告失败发布 `report_unavailable`，前端退出等待并提供稍后重试/联系支持，不能无限转圈。是否退款依据产品合同和实际交付定义，不由技术异常自动决定；若需要补偿，创建独立补偿/退款状态机，不能删除 completed interview 或把 confirmed 消费直接改回 available。这样主路径的可用性和报告可用性分别计量。

### 第四轮：压力追问 3——“数据库主库不可用、模型供应商 429、SSE 网关重启时，用户到底看到什么？”

**初学者常见回答**：“我们有 Kubernetes 多副本，会自动重启。”

**错误诊断**：重启没有回答用户命令是否提交、租约是否还活着、事件是否丢失、写入是否重复，也没有解决外部 provider 429 或主库不可写。对用户而言“正在加载”无限旋转比一个明确的可重试状态更糟。

**专家重答**：逐依赖写降级契约。数据库不可写时，创建/提交命令 fail-closed 返回可重试 503，不能本地排队假装成功；已建立的 SSE 可断，客户端凭 resultId 重连，若重连耗尽进入 degraded。模型 429/超时走 deadline、有限退避、tenant 配额和 circuit breaker，返回 `report_unavailable` 或等待状态但不重复扣点；若有经验证的 backup provider 才允许 failover，否则如实降级。worker 重启由 lease 过期后安全接管，旧 worker 回写被 CAS 拒绝。SSE 网关重启不拥有事实，恢复后从 event ledger replay。所有这些状态都要可观测，并用故障注入验证。

### SLO、压测方法与量化接受阈值

| 场景 | 压测/演练方法 | 接受阈值 | 失败后的动作 |
| --- | --- | ---: | --- |
| DB 事务与模型隔离 | 20 连接池、模型延迟 30 秒、并发递增 | DB wait p99 < 250ms；业务读不被长事务耗尽 | 外呼移出事务，限 worker/provider |
| 多 worker 重领 | claim 后 kill、等待 lease、启动 N worker | 重复评分/结算/事件 = 0；stale 写 = 0 成功 | lease reclaim + CAS 栅栏 |
| outbox | commit 后模拟 relay 崩溃/重复投递 | 业务结算 = 1；outbox 可重放 | reconciler、DLQ、人工 |
| 报告舱壁 | 注入报告模型超时/坏 schema | 面试终态可达 = 100%；spinner 死胡同 = 0 | `report_unavailable` + 重试 |
| provider 429/5xx | 逐依赖注入 429、timeout、DNS error | 有界重试；成本/队列不无限增长 | breaker、quota、降级 |
| 发布/迁移 | 滚动发布中持续提交/恢复 | schema 兼容窗口内命令错误率符合 SLO；无 RLS 串户 | expand/contract、回滚、readiness |
| 灾备 | 定期恢复备份、区域故障桌面演练 | RTO/RPO 由业务签字；未演练 = 不成立 | runbook、演练复盘 |

### 初学者的最终收尾话术

“我不会把可用性简化为副本数。对每一条用户命令，我会说明它是否已提交、可否重试、幂等键是什么；对每个外部依赖，我会说明超时后是查单、重试、降级还是人工；对每个异步任务，我会说明谁持有 lease、旧 worker 如何失去写权；对每个用户界面，我会说明终态和恢复入口。这样得到的是可量化、可演练的高可用，而不是不可验证的 100% 承诺。”

**当前事实与外部阻断**：✅ 当前仓库有短事务/外呼分离的目标实现、worker lease、`SKIP LOCKED`、outbox/reconciler、报告独立 worker、SSE 重连和降级、隔离浏览器 E2E 证据。🟡 跨 provider failover 代码存在但默认单端点，真实生产 egress 策略和全量 SLO 仪表盘仍需环境配置。⛔ 多可用区数据库切换、正式备份恢复演练、已签字 RTO/RPO、真实峰值压测、供应商区域故障和 24×7 值守流程不能从仓库代码推导，必须在正式环境中演练和记录。

---

## 12. 五组实战的复盘卡片

把下面五张卡片写在纸上。任何追问都先找到对应卡片，再展开细节；这样不会被“再加一个 Redis”“模型能不能自己判断”“多副本就好了”带偏。

| 题目 | 一句话核心 | 必画状态 | 最不能犯的错误 | 最终指标 |
| --- | --- | --- | --- | --- |
| 支付/点数 | 账本是真相，渠道至少一次 | paid、reserved、confirmed/released | 用订单级 CAS 代替全局流水唯一 | 重复入账/扣点 = 0 |
| C/B 招聘 | 岗位评估是专属新会话 | application ↔ bound interview | 接受任意历史 interviewId finalize | 非绑定回填 = 0 |
| 语音 | 单人录音不等于双人电话 | consent、text fallback | 混音单轨猜 speaker | 无同意 ASR = 0 |
| SSE/React | 连接可丢，事实不可丢 | reconnect/degraded | token 当业务事实、每 chunk render | 漏/重事件 = 0 |
| 高可用 | 短事务 + outbox + lease + 降级 | claim/lease/DLQ | 长事务包外呼、用副本数替代设计 | 用户无终态 = 0 |

最后一次模拟时，请让同伴只问一句“如果现在 kill 掉一个进程呢？”你应该能在每一题中回答：支付看 event/txn 与对账；申请看一对一绑定与重放；语音回文字；SSE 用 resultId 重连；worker 用 lease 接管；而不是回答“应该不会发生”。

---

## 实战六：综合白板题——从一次邀请到一次可解释的招聘辅助结论

### 训练问题

现在不要分模块讲。请你在四十五分钟内设计这样一次完整用户旅程：招聘方发布“支付平台后端工程师”岗位并邀请候选人；候选人阅读处理说明、选择已摄取简历、购买或使用已有点数、进行三轮文字或单人语音面试；期间网络断一次、用户说“上面那道我没做过，是简历自动写错的”；最后招聘方只看到可解释的辅助信号。面试官会不断追问：你的图在哪里、何处扣点、何处记录同意、谁能看到答案、模型不可靠时如何不伤害候选人？

### 第一轮：90 秒首答（把所有模块串起来）

我会先把这条旅程拆成五个独立但可追溯的聚合：岗位和邀请、目的限定的申请、权益订单与消费、岗位绑定面试、评分报告和招聘摘要。招聘方只能创建自己 principal 下的岗位并邀请候选人；候选人不是一点击就共享全部历史，而是先看到岗位、处理目的、接收方、最小字段、期限和撤回入口。开始时 API 在短事务中验证申请、同意、简历版本和权益，创建或读回唯一的岗位绑定面试，记录同意/岗位/简历快照和消费预留，再用 outbox 让 worker 出首题。浏览器拿到 resultId 后订阅业务 SSE；网络断了用 Last-Event-ID 重放，单人语音失败则回到文字。候选人纠正简历事实时，本轮不计低分，而是写事实纠正/问题失效事件，下一题改为通用基础题或请求澄清。完成时评分只在答案、题目、rubric 和 evidence 都校验后持久化；报告是独立任务，失败显示暂不可用但不制造无限等待。岗位申请只从绑定会话派生最小化评分摘要，招聘方看不到 C 端训练正文和原始模型推理；无 evidence 或质量门未过时状态是 inconclusive，不能自动拒绝或录用。支付、模型、语音和网络都被当成外部依赖：用幂等键、outbox、lease、deadline 和降级收敛，而不是承诺它们永不失败。

### 一张应当画出来的总图

```text
招聘方 principal
  │ create job / invite
  ▼
JobPosting ─────> JobApplication(invited)
                         │ candidate 读 purpose notice / accept
候选人 principal          ▼
ResumeSnapshot + ConsentGrant(active) + Entitlement(available)
                         │ start(applicationId, resumeId, commandId)
                         │ [短事务：RLS + CAS + binding + reserve + outbox]
                         ▼
BoundInterview(active) ──> event ledger/checkpoint ──> SSE browser projection
      │                       │       │                         │
      │                       │       │                         ├─断线：Last-Event-ID
      │                       │       └─语音失败：text fallback
      │                       └─事实纠正：invalidate question
      ▼ completion
EvaluationSnapshot(score/evidence/version) ──> JobApplication(completed)
      │                                                   │
      └─独立 report job                                 └─Recruiter allow-list view
```

图旁必须标出四条横线。第一条是权限线：每个表和查询都带 candidate/recruiter principal，未设置 principal 的查询返回零行。第二条是目的线：C 端训练资源不因为 candidate 相同而自动变成 B 端资源，B 端只取授权快照。第三条是事务线：短事务结束在 `binding + reserve + outbox`，模型、ASR、支付网络都在线外。第四条是事实线：业务事件与 checkpoint 是真相，SSE、动画、页面缓存只是投影。

### 第二轮：压力追问 1——“用户已经有点数，为什么还要 reserve？直接在 completed 时扣不就没有退款了吗？”

**初学者常见回答**：“完成时再扣，失败就不用退，逻辑最简单。”

**错误诊断**：这样会使系统先交付高成本模型服务，再在完成时发现用户没有余额；并发多个面试时都可能认为余额足够，最后一起完成而超卖。反过来，一开始直接 confirmed 又会使用户在 worker 未启动、网络失败或面试中止时被错误扣费。问题不是“扣早还是扣晚”，而是没有把资源占用和最终结算分开。

**专家重答**：面试开始要 reserve，表示“这一点已被这场绑定面试占用”；此时可防止最后一点被并发会话重复使用。reserve 使用 `application/interview` 派生的稳定键，命中重复 start 返回同一消费结果。真正的 confirmed 只发生在已定义的交付终态，例如面试完成且结算 outbox 被消费；中断、权限撤回、worker 启动失败或租约失效进入 release。报告失败不能机械等同于面试失败：主面试已交付时报告应走独立降级/补偿政策。余额、预留、确认和释放均进入账本，才能对用户解释“为什么暂时占用、何时归还”。

```text
available --start/CAS--> reserved --interview completed--> confirmed
    ^                         │                 │
    └------ release <---------┘                 └--> report 独立，不倒置主面试事实
```

```ts
type SettlementDecision =
  | { kind: 'confirm'; reason: 'interview_completed' }
  | { kind: 'release'; reason: 'start_failed' | 'abandoned' | 'consent_revoked' }
  | { kind: 'manual_review'; reason: 'payment_or_ledger_invariant_broken' };

// graph 只提出结果；真正改 entitlement 的服务以 consumptionId 幂等消费 outbox。
async function onInterviewSettled(id: string, decision: SettlementDecision) {
  await appendOutbox({
    kind: 'settlement_proposed',
    idempotencyKey: `${id}:${decision.kind}`,
    payload: decision,
  });
}
```

### 第三轮：压力追问 2——“候选人说简历是 AI 写错的。你为什么不直接把本轮打 0 分，再问下一题？”

**初学者常见回答**：“候选人没有回答，所以按 rubric 给零分，系统最一致。”

**错误诊断**：这混淆了能力不足、答非所问、指代不清和候选人纠正系统错误。若问题的前提来自不可靠简历抽取或模型幻觉，继续追问或扣分会将系统自己的错误变成候选人损失；在招聘场景还会制造不可解释的负面信号。

**专家重答**：输入先经过确定性和模型辅助的 turn intent 路由，但路由结果不直接写分。`resume_correction` 的优先级高于 `answer`：将被纠正的 fact 标为 disputed，当前 question 标 `invalidated`，本轮不产生 `answer_evaluated`，也不进入能力均分和计费轮数。下一个问题只能使用未争议的简历事实或通用能力题；若用户的“上面那个”指代不清，则进入 clarify，而不是随机检索。候选人纠正本身是独立事件和审计事实，不静默修改原简历；若用户确认，后续才创建新 resume version。B 端摘要也只能显示“本题未评估/需复核”这样的最小化状态，不把纠正文本扩散给招聘方。

```text
waiting_user
  ├─ answer_valid ───────────> evaluating → scored
  ├─ ambiguous_referent ─────> clarify → waiting_user
  ├─ resume_correction ──────> fact_disputed + question_invalidated → new_safe_question
  └─ explicit_skip ──────────> unresolved（非 0 分） → next_question
```

```ts
if (intent.kind === 'resume_correction') {
  await tx(async (c) => {
    await recordCorrection(c, {
      key: `${interviewId}:${questionId}:correction`,
      factIds: intent.disputedFactIds,
      resumeVersionId,
    });
    await appendEvent(c, interviewId, 'question_invalidated', {
      questionId, reason: 'candidate_disputed_grounding',
    });
  });
  return { next: 'safe_general_question' as const };
}
```

### 第四轮：压力追问 3——“招聘方只想要一个分数排序，为什么不把全部对话和模型推理都给他？”

**初学者常见回答**：“给得越多越透明，HR 自己判断就行。”

**错误诊断**：更多数据不等于更可解释。原始对话包含候选人 C 端训练、隐私信息、跑题内容以及可能未经证实的模型文本；模型 chain-of-thought 不是可靠证据，还可能泄露题库、提示词和攻击面。把全量内容交给 B 端会超出最小必要和原始同意目的。

**专家重答**：招聘方得到的是岗位专属 `EvaluationSnapshot`，不是聊天镜像。每个可见维度带分数/状态、至少一个来源于本次候选人答案的 evidence span、question/rubric/model/prompt version、生成时间和人工复核状态；没有证据则 `inconclusive`。候选人看到与自身答案相关的改进建议和申诉入口，不看到隐藏题库和反作弊规则。招聘方最终操作只能生成 append-only 的人工 `DecisionRecord`，系统不提供自动 reject/hire 边。这样“透明”指的是版本、证据和审计透明，而不是无限扩大数据可见范围。

### 综合状态表

| 对象 | 事实源 | 不变量 | 用户可见终态 | 招聘方可见字段 |
| --- | --- | --- | --- | --- |
| ConsentGrant | 授权账本 | revoked 后新处理 = 0 | 已撤回/已过期 | 仅授权状态，不见原文 |
| Consumption | 权益账本 | 一次会话一次 reserve/confirm | 已占用/已结算/已归还 | 不展示具体账本 |
| BoundInterview | interview + event ledger | application/job/resume/candidate 全匹配 | 可继续/已完成/暂不可用 | 无 transcript |
| EvaluationSnapshot | 版本化评估表 | evidence 必在本次答案中 | 可查看/可申诉/需复核 | 分数、证据摘要、版本 |
| DecisionRecord | 人工审计表 | 自动 reject/hire = 0 | 处理状态 | 授权人、理由、时间 |

### 综合压测与接受阈值

| 用例 | 注入方法 | 可量化阈值 |
| --- | --- | ---: |
| 候选人同时双击开始并刷新 | 20 并发 command，混入断线重试 | bound interview = 1；reserve = 1；响应 ID 一致 |
| 历史会话冒充岗位 | 传入已完成训练 ID、跨岗位 ID、别人的 ID | 非绑定 score 写入 = 0 |
| 事实纠正 | 含“上面那题”和“简历是 AI 写错”的混合输入 | 错误前提重复追问 = 0；本轮惩罚分 = 0 |
| recruiter 数据窥探 | DB/API/SSE/缓存多数据面尝试 | C 端 transcript 命中 = 0 |
| 网络和报告故障 | 在最后答案后断网、报告 provider 超时 | 面试终态可达 = 100%；无永久 spinner |
| 评分可解释性 | 扫描每条 B 端有效 score | evidence span 覆盖率 = 100%，否则 inconclusive |

**当前事实与外部阻断**：✅ 岗位绑定、strict finalize、真实浏览器闭环、SSE 恢复、文本降级、评分证据校验、RLS 最小化 recruiter 读取和消费/结算机制已有验证。⛔ purpose-bound consent grant、撤回传播、人工 DecisionRecord、申诉/重算和企业级 retention/DSAR 尚未闭环；综合题中要明确将它们标为下一阶段，而不是说“数据库里已经没有 transcript 所以合规完成”。

---

## 实战七：事故演练——凌晨两点，重复扣点投诉、SSE 卡住与模型 429 同时出现

### 训练问题

凌晨两点收到三个告警：第一，用户投诉同一场面试被扣了两次；第二，客服看到大量页面停在“正在建立连接”；第三，模型供应商开始返回 429。与此同时，刚发布了新的前端事件字段，某些用户在移动端语音作答。你是值班负责人，如何判断影响范围、先止血、再恢复、最后避免复发？请不要只回答“回滚”。

### 第一轮：90 秒首答（事故指挥口述）

我会先把事故按资金正确性、用户可达性和外部依赖分成三条并行泳道，并立即冻结风险最高的写路径而不是盲目重启所有服务。对于重复扣点，先关闭新的开始面试或结算开关到只读/可恢复模式，保留原始订单、消费、outbox 和请求 ID，查询是否是真重复 reserve、重复 confirm、还是展示缓存错误；绝不直接改余额覆盖证据。对于“正在建立连接”，检查前端对新事件 schema 的 parse reject、SSE event replay、网关错误率和最近发布差异；如果是未知题型/字段导致整个 `question_ready` 被丢弃，先回滚或做向后兼容解析，让坏字段降级而非让整帧消失。对 429，开启 provider circuit breaker、降低 worker 并发和每租户配额，停止无界重试；正在等待的会话进入有解释的 waiting/degraded，已完成面试的报告转 `report_unavailable`，不重新扣点。移动端语音必须立即保留文字 fallback，不能因为 ASR/provider 故障阻塞答题。止血后按 stable idempotency key 重放和对账，修复 schema contract、补测试和指标；复盘要给出受影响用户数、重复副作用数、恢复时间和补偿结果，而不是只写“服务已恢复”。

### 事故指挥图

```text
告警入口
  ├─资金：duplicate consumption? ─> freeze risky transition → ledger/query → reconcile/compensate
  ├─体验：SSE connecting spike? ─> parser/version/Last-Event-ID → compatibility fix → replay
  ├─依赖：provider 429? ─────────> breaker/quota/queue cap → degraded/report_unavailable
  └─语音：ASR unavailable? ──────> text fallback，不扩大采集

所有路径：保留 requestId/threadId/commandId/invokeId；禁止手工 delete 或直接 UPDATE 伪造“恢复”。
```

### 第二轮：压力追问 1——“用户说被扣两次。你第一条 SQL 写什么？”

**初学者常见回答**：“查余额，如果少了两点就给用户加一点；或者把重复订单删掉。”

**错误诊断**：余额是派生视图，直接加回或删除会破坏审计链，无法知道是 reserve、confirm、支付入账、缓存展示还是客服重复操作造成的。还可能把本来已消费的权益错误返还，形成新的套利漏洞。

**专家重答**：先以用户、interview/application、consumption idempotency key、outbox event 和时间窗口组成证据包。确认同一 `interviewId:transition` 是否存在多条 immutable ledger/consumption，是否同一 reserve 被重复展示，是否两个不同 interview 因绑定错误都成功，是否 PSP 的 providerTxn 重复入账。把状态按“真实重复、展示误差、未知待对账”分类；真实重复通过独立补偿 ledger/refund 状态机处理，补偿也有唯一键，不能用裸 UPDATE。与此同时暂时拒绝可能继续产生重复的 transition，直到约束和 consumer 状态恢复。

```sql
SELECT c.id, c.interview_id, c.status, c.idempotency_key, c.created_at,
       l.event_type, l.units, l.created_at AS ledger_at
  FROM entitlement_consumption c
  LEFT JOIN entitlement_ledger l ON l.consumption_id = c.id
 WHERE c.owner_user_id = $1
   AND c.interview_id = $2
 ORDER BY c.created_at, l.created_at;

-- 诊断查询不能修数据；修复要走 compensation 领域命令和不可变账本。
```

### 第三轮：压力追问 2——“前端只是多了一个 qkind，为什么会让用户永远卡连接？”

**初学者常见回答**：“字段多了前端不关心，应该忽略。”

**错误诊断**：如果前端为整个 event payload 做严格 schema 校验，而 enum 只覆盖旧值，新增 `grounded` 会使完整的 `question_ready` 解析失败。客户端没有收到题目也没有收到显式错误，只剩 connecting；这不是网络问题而是消费者契约不兼容。反过来，无限制 `.passthrough()` 又可能接受被破坏的身份字段，导致错误提交。

**专家重答**：事件协议要区分“必须理解的字段”和“可前向兼容的装饰字段”。`questionId/stateVersion/turn` 是提交身份，缺失或非法必须 fail-closed；qkind 是展示/分析分类，消费者应该支持当前领域枚举，并对未来未知值选择可观测的安全降级，例如存为 `unknown` 但仍显示题面，或由版本协商阻止发布。发布前把 producer/consumer 契约测试放入 CI，灰度时监控 `event_parse_rejected_total{event,field,value}` 和 `connecting_duration_p95`。事故中先扩展兼容 enum、回滚 producer 或启用 versioned event，随后用真实浏览器重放该事件确认题目可答。

```ts
const QuestionKind = z.enum([
  'grounded', 'fundamental', 'scenario', 'behavioral',
  // 历史重放兼容值；迁移期保留，指标记录使用量。
  'primary', 'followup', 'clarification', 'fallback',
]);

const QuestionReady = z.object({
  question: z.string().min(1),
  questionId: z.string().regex(/^q-v\d+-t\d+-c\d+$/),
  stateVersion: z.number().int().nonnegative(),
  turn: z.number().int().nonnegative(),
  qkind: QuestionKind.optional(),
});
```

### 第四轮：压力追问 3——“供应商 429 时，为什么不把所有 job 无限重试，总会成功？”

**初学者常见回答**：“重试越多成功率越高，用户等着就好。”

**错误诊断**：无界重试会让队列堆积、重复消耗成本、延长恢复时间，并在供应商恢复时形成惊群；用户没有截止时间和可解释终态。对某些确定性错误，如内容拒绝、schema 不匹配或撤回同意，重试没有意义，只会造成更多副作用。

**专家重答**：先分类错误：429/短暂 5xx 可在有限预算内指数退避并带随机抖动；确定性拒绝不重试；业务校验失败走 clarify/degrade；未知错误隔离后有限重试。每个 job 有 attempt、deadline、最大 queue age 和 tenant/global concurrency；超过预算进入 `report_unavailable`、`unscored` 或 DLQ，并给用户重试/稍后恢复的出口。breaker 打开时不继续发新外呼，worker 仍可以处理本地重放、SSE、撤回和结算。对模型评分，失败不可用 fake 分数替代；对语音，回文字；对报告，保留主面试结果。恢复时按队列 age、优先级和配额渐进放量，避免同时把所有积压请求打回 provider。

### 事故状态机与 runbook 示例

```text
ProviderHealth: healthy → degraded → open_circuit → half_open → healthy
                         │              │              └→ degraded
                         └──────────────┴→ user-visible fallback

Run: active → retrying(transient, bounded) → completed
                    ├→ degraded/report_unavailable
                    ├→ unscored/clarify
                    └→ dlq → manual_review
```

```ts
function classifyFailure(e: unknown):
  | 'transient' | 'deterministic' | 'business_invalid' | 'permission' | 'fatal' {
  if (isRateLimit(e) || isTimeout(e) || isHttp5xx(e)) return 'transient';
  if (isProviderRefusal(e)) return 'deterministic';
  if (isBusinessValidationError(e)) return 'business_invalid';
  if (isForbidden(e)) return 'permission';
  return 'fatal';
}

function nextAction(job: Job, failure: ReturnType<typeof classifyFailure>) {
  if (failure === 'transient' && job.attempt < 3 && job.ageMs < 15 * 60_000) return 'retry';
  if (failure === 'business_invalid') return 'clarify_or_degrade';
  if (failure === 'permission') return 'terminate_without_new_model_call';
  return 'dlq_or_manual_review';
}
```

### 事故指标、演练方法与接受阈值

| 指标 | 演练方法 | 接受阈值 | 值班人要做什么 |
| --- | --- | ---: | --- |
| `duplicate_consumption_total` | 重放同命令、kill consumer、并发 settle | 0；任何非零为 P0 | 冻结 transition、证据包、补偿 ledger |
| `event_parse_rejected_total` | 投放新 enum/坏 payload/历史 replay | 身份字段拒绝 = fail-closed；装饰字段兼容策略可观测 | 回滚/兼容/契约修复 |
| `connecting_duration_p95` | 断 SSE、网关滚动重启、前端 schema drift | 有界；耗尽后 100% degraded 出口 | 检查 replay/consumer/parser |
| `provider_429_rate` | 注入持续 429、恢复后放量 | queue 不无限增长；无界 retry = 0 | breaker、配额、DLQ |
| 语音 fallback 成功率 | ASR 5xx、麦克风拒绝、移动后台 | 文字出口可达率 = 100% | 禁用语音入口/显示文字 |
| 事故恢复 | game day 记录检测到缓解 | MTTD/MTTR 设业务目标并复盘 | 改告警、runbook、自动化测试 |

### 事故复盘要写什么，不该写什么

复盘应当写：开始时间、发现来源、受影响 principal/会话/命令数、是否存在真实资金错误、证据查询、采取的开关动作、每个依赖的错误率、用户最终落入的状态、补偿数、永久修复、测试和防复发指标。不能只写“某服务重启后恢复”，因为那没有说明是否产生重复业务副作用。也不要把真实简历、录音、支付 payload 或模型 prompt 贴进复盘；只记录 hash、内部 ID、脱敏统计和访问受控的证据位置。

**当前事实与外部阻断**：✅ 当前项目已经有付款流水唯一、消费幂等、SSE 事件强校验与回归 proof、qkind 兼容修复、有界重连、语音文字降级、错误分类和部分 worker/outbox 机制。🟡 统一 incident command center、完整 RUM/SLO 看板、自动化 game day 和值班轮值不是现成产品能力。⛔ 正式 PSP 争议处理、供应商多区域故障响应、跨地域灾备、法定泄露通报流程必须由线上运营、法务、安全和供应商合同共同落实；代码只能提供可观测和可收敛的技术基础。

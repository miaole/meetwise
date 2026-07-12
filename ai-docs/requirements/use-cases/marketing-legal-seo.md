---
id: requirements_uc_marketing_legal_seo
name: 用例 · 营销首页·FAQ·联系·法律·SEO·反馈·实时计数
description: 营销/法律/SEO/运营展示域 业务用例与测试用例（正常/异常/特殊/逃逸/高并发/复杂/刁钻七类，17 UC / 96 TC）。二轮对抗评审收口最终版。
type: reference
scope: shared
level: spec
status: active
owner: product
related:
  - ./README.md
  - ../use-case-conventions.md
  - ./cend-identity-account.md
  - ../../testing/conventions/test-authoring.md
  - ../../rules/global/status-machine.md
  - ../../rules/global/production-invariants.md
---

# 营销·法律·SEO·运营展示域 · 用例 + 测试用例（评审收口最终版）

> **🔎 实现状态（对齐真实代码 · 2026-07）** — 本文是 TARGET 规格。**✅ 已实现+接线**：SEO 基建（`sitemap.ts`/`robots.ts`、SSR 元信息、next-intl 中英 hreflang 语义）、营销/首页/FAQ/features/pricing/legal/privacy 等 SSR 页面。**🟠 部分 / ⬜ 未建**：consent-before-tracking 同意闸、A/B 身份合并、服务端二次 PII scrub、实时计数口径过滤、反 spam 回流边、同意审计无空窗等承重合规机制多为规格，尚未全部落地。展示与 SEO 骨架已生效，合规埋点治理待建。

> 顺序铁律：用例 → 契约 → 状态机 → 测试 → 代码。本文档按对抗评审五问逐条收口：先在 §0 消解伪覆盖 / 自相矛盾 / 合规致命漏 / 照搬源库弱实现，再给 17 条 UC（每条标注七类覆盖、每条异常/刁钻流落到一个机制、验收可测、配齐 TC）。**二轮评审增补**（见 §3.2）：consent-before-tracking 整条 UC、spam 回流边、A/B 身份合并、服务端二次 PII scrub、计数口径过滤、降级态治理、同意审计无空窗。
> 四原语缩写：**CAS**(条件更新/乐观锁)、**IDEM**(幂等键唯一约束)、**RLS**(principal 绑定 fail-closed)、**LOG**(持久有序事件日志，单调 seq)。
> 七类缩写：**正常 / 异常(失败回滚·退款) / 特殊(边界·空·首次·i18n) / 逃逸(降级·fallback·kill-switch·人工接管·安全终止) / 高并发(双击·竞态·CAS) / 复杂(多步 saga·跨聚合·部分失败) / 刁钻(注入·越狱·刷分·泄题·PII·畸形·对抗)**。

---

## §0 Spec 修订前置（先消解矛盾，再读用例）

### 0.1 致命合规漏的边界裁决（PIN · 解评审④-1/2/3、必补 #1/#2/#3）

> consent / DSAR / 未成年同意的**状态机与账本权威归 `identity` 域**（`ConsentRecord{GRANTED·WITHDRAWN·SUPERSEDED}`、`scope∈{base,sensitive,cross_border,automated_decision,guardian}`、account 生命周期 `…→RESTRICTED→DELETING`、CONSENT-03/04/06）。

**M-LEGAL（PIN）**：本域**不重复定义** consent/DSAR/未成年状态机；legal 子域只负责三件事并委派 identity 真实机制：(a) 公开法律页面展示 + 版本权威（UC-legal-001）；(b) 同意采集触点合规正确性 + 未成年年龄门/监护人双校验（UC-legal-002）；(c) 撤回/DSAR 的「入口」委派 identity CONSENT-03/06 与 account DELETING saga（UC-legal-003/004）。本域只做「入口可达 + 越权护栏 + 异步受理回执」。这样「同意撤回孤儿态」被消解：撤回有真实触发入口。

### 0.2 运营数据零信任统一（PIN · 解评审④-3/4、①高并发空壳、②-2/3、必补 #4/#5/#6/#9）

> 统一裁决：所有运营/social-proof 数据一律零信任，展示值只由服务端可信事实派生，永不凭空注入、永不超真实、可审计。

**M-COUNTER（PIN）**：
- 语义锁定：计数 = `Interview.completed` 且 `ConsumptionRecord.confirmed` 的累计条数，只增；退款不回退展示值（口径写死防误导）。
- 真实来源：`interview_counter` 投影由 `interview_event(completed)` LOG 聚合，非客户端可写。
- 口径过滤（解 P1-#9）：投影聚合显式排除 `account.flag ∈ {internal, test, fraud_suspected, refunded_reversed}`，过滤规则可对账回放；`real` 收紧为「真实外部已结算用户」累计，杜绝测试账号灌高 social proof。
- 冷启动：`real < T`（建议 1000）→ 隐藏模块或无数字定性文案，**绝不显示编造非 0 静态值**。
- 平滑/约数/封顶：`D = floor(real/g)*g`（g 建议 100）；`D ≤ real` 恒成立、`D` 单调不减；单 tick 增量 ≤ maxStep，跳变时按 maxStep/tick 追赶但永不超 `floor(real/g)*g`。三条全部可断言。

**M-CTA（PIN）**：客户端 `cta_click` 仅弱信号，入 `CtaConversion` 前必过限频+clickId 防重放(IDEM)+服务端二次校验；转化结算只认服务端可信事实（注册完成/权益消费 confirmed）；实验归因加 SRM 守卫。

### 0.3 A/B 收敛为单一机制（PIN · 解评审①复杂不可达、③、⑤-3、必补 #6/#9/#12）

**M-AB（PIN）**：
- 匿名：`variant = stableHash(experimentId + saltedAnonId) % buckets`，纯确定性零持久行；明确承认匿名不跨设备一致，删除「匿名跨设备 A/B 一致」伪用例。
- 登录：写持久 `AbAssignment(userId, experimentId, variant, status, assignedAt, expiresAt)`，跨设备一致；`status∈{active, expired}`。
- expired 后再分配：同一 userId 同实验同周期锁定原 variant 至实验结束；仅新周期可重分配（防实验沾染）。
- SRM/分流比守卫：卡方偏离超阈值 → 告警 + 冻结该实验归因。
- 身份合并 identity stitching（解 P1-#6 24h cookie sticky 业务错）：登录瞬间一次性把匿名哈希 variant 写入 `AbAssignment(userId, variant, source=anon_inherited)`，之后以 AbAssignment 为唯一权威；曝光去重 key 锁定为 `experimentId + 稳定身份(优先 userId 回退 anonId) + variant`，实验期内不随 cookie 过期 re-roll。

### 0.4 时区权威锁定（PIN）
**M-TZ（PIN）**：`needReconsent = userConsent.policyVersion < currentPolicy.version`（版本比较非时刻，与时区无关，消抖）；`effectiveAt` 存 UTC、按 locale 显示。

### 0.5 移除 C 端域坐席/租户语义（PIN · 必补 #10）
**M-TENANT（PIN）**：`ContactTicket`/`Feedback` 只用 owner-RLS（提交者 principal；匿名用一次性 `ticket_lookup_token` 哈希）；删坐席/租户；后台处理 UI 归 admin 域。

### 0.6 外发与内容净化机制补全（PIN · 必补 #7/#8/#11）
**M-OUTBOUND（PIN）**：`queued→sent→delivered`；`sent→failed(soft)` 有界重试；`sent/queued→bounced(hard)` 终态+工单标「无法触达」停止重试；未验证/陌生邮箱→`suppressed_unverified`（仅站内）。
**M-SANITIZE（PIN，护栏第五层）**：`AttachmentScan{pending→clean/sanitized/rejected}`——类型/大小白名单→服务端 AV 扫描→图片重编码（剥离原始字节、去 EXIF/GPS）→SVG 一律拒绝→存私有桶、签名 URL + `Content-Disposition: attachment`。

### 0.65 跟踪同意先行 consent-before-tracking（PIN · 解评审 P0-#2 自相矛盾致命漏）
**M-TRACK-CONSENT（PIN）**：埋点 cookie 与行为事件分两类、默认拒绝——
- 必要类（无需同意）：sessionId/CSRF/locale/负载均衡；不写画像维度，仅匿名聚合计数。
- 跟踪类（需同意 opt-in）：持久 cookieId/anonId 画像、cta_click/曝光埋点、A/B 持久分桶。取得 `TrackingConsent(granted)` 前：①不种持久 cookieId；②不写 per-subject 行为埋点（仅去标识匿名聚合）；③A/B 用纯内存会话哈希或回退对照组。
- 同意载体：`TrackingConsent` 是 identity `ConsentRecord(scope=tracking)` 的本域投影；撤回即时令门禁转 denied、失效持久 cookie。
- 门禁位置：服务端（前端不可信）；unset/denied → 埋点端点 no-op 而非报错。

### 0.66 服务端二次 PII scrub（PIN · 解评审 P1-#8）
**M-SCRUB（PIN，三档可执行机制）**：
- 结构化上下文（route/referrer/query）：服务端按白名单重建（`/interview/:id` 而非 `/interview/138xxx`）+ 白名单 query key；未在白名单一律丢弃，不猜测脱敏，确定性可测。
- 自由文本（反馈/联系正文）：不入事件账本；正文存 owner-RLS 业务表，账本只记元数据（类型/优先级/指纹哈希/时间），绝不复制正文进 LOG。
- 搜索词/短串：入账本前过 PII 正则探针（邮箱/手机/身份证/银行卡）→ 命中整词替换 `[redacted:<类型>]` + 长度截断；探针可单测回放。
- 统一原则：账本宁可少记不可错记 PII；需原文走 owner-RLS 业务表 + 审计访问。

### 0.67 降级态治理（PIN · 解评审 P2-#13）
**M-KILLSWITCH-GOV（PIN）**：所有 kill-switch/降级开关接入 `DegradationSwitch` 治理——每次置位写 LOG（操作者/原因/时间/预期恢复）；降级态持续触发周期性告警（频率随时长升级）；强制 TTL + `reviewBy` 定时复核，到期未复核升级告警要求「续期或关闭」；状态页暴露降级态杜绝静默。

### 0.7 状态机增量（本域新增对象，CAS 落点）

| 对象 | 枚举（增量加粗） | 访问控制 | 说明 |
|---|---|---|---|
| `MarketingContent` | `draft · published · archived` + `version int` | admin 域写；前台只读 published | 内容可信、版本化、防注入 |
| `CtaConversion`(账本) | append-only LOG；`signal∈{click_weak, signup_confirmed, consume_confirmed}` | 服务端写 | 转化只认可信信号（M-CTA） |
| `ContactTicket` | `received · triaging · answered · closed · **spam_quarantined**`；**回流边 `spam_quarantined → triaging`**(CAS) | owner-RLS | 删坐席/租户；误判可兜回（P0-#5） |
| `OutboundMessage` | `queued · sent · delivered · failed · **bounced** · **suppressed_unverified**` | 系统 | 硬退信终止 + 陌生邮箱抑制 |
| `Feedback` | `received · triaged · **escalated** · closed` + `priority∈{low,normal,high}` | owner-RLS / 匿名 token | 高优告警去抖 |
| `AttachmentScan`(账本) | `pending · clean · **sanitized** · **rejected**` + `version int` | 系统 | 净化五层（M-SANITIZE） |
| `interview_counter`(投影) | 由 `interview_event(completed)` 派生只增；`D=floor(real/g)*g` | 服务端只读派生 | 零信任 social proof（M-COUNTER） |
| `AbAssignment`(仅登录态) | `**active** · **expired**`（匿名无行） | owner-RLS | 单一机制（M-AB） |
| `TrackingConsent`(投影/缓存) | `unset · granted · denied`（= identity `ConsentRecord(scope=tracking)` 投影） | 服务端门禁只读 | 跟踪同意先行；撤回即时转 denied |
| `DegradationSwitch`(治理对象) | `active · degraded`（带 `reviewBy` TTL + 降级态周期告警） | admin/系统 | 降级态治理，防开关遗忘 |
| `ConsentRecord` / `account` 生命周期 | — | — | 归 identity 域，本域仅引用（M-LEGAL） |

---

## §1 用例（UC）

### UC-home-001 · 首页营销区块渲染（Hero/Features/Services/Steps/CTA · SSR/ISR · 多语言 · 内容可信）
**七类**：正常✔ 异常✔(E1 区块源失效占位) 特殊✔(E4 i18n/缺翻译回退/首屏空) 逃逸✔(E2 ISR 旧快照) 并发✔(E3 ISR 回源单飞) 复杂✔(多区块独立降级) 刁钻✔(E5 内容注入/XSS)
- 角色：访客（匿名）/ 渲染服务。前置：`MarketingContent(published)` 存在；区块含 locale key。触发：GET `/`。
- 主流程：1) 解析 locale 选 published 版本。2) SSR/ISR 渲染五区块；**仅当 `TrackingConsent=granted` 才注入持久 clickId 并启用行为埋点**，unset/denied 仅走匿名聚合（UC-consent-track-001）。3) 注入 SEO 头。
- 异常/刁钻流：E1 区块级隔离占位不整页 500；E2 ISR 兜底旧 published 快照 SWR；E3 回源 single-flight 收敛一次；E4 i18n 回退链 en→zh→key 占位 + 告警；E5 入库净化 + 输出转义，文案不拼 JSON-LD。
- 后置：纯展示无业务写；clickId 仅签发不计转化。
- 验收：单区块失败→占位+其余 DOM+200；ISR 过期并发 N→回源恰 1 次；缺 key→回退无裸 key；注入 `<script>`→转义不执行。
- 关联：契约 `GET /`、`GET /api/marketing/blocks`；状态机 `MarketingContent`；原语 LOG；安全：内容不可信、输出转义、净化。

### UC-home-002 · CTA 点击与转化采集（零信任 · 限频 · 反作弊 · SRM 守卫）
**七类**：正常✔ 异常✔(E1 校验失败丢弃) 特殊✔(E4 首次无 cookie) 逃逸✔(E5 采集后端不可用前端不阻塞) 并发✔(E2 双击同 clickId) 复杂✔(click→signup→consume 三段归因) 刁钻✔(E3 clickId 灌量刷漏斗)
- 角色：访客/采集服务/commerce。前置：CTA 携服务端签发 clickId（签名+TTL）。触发：点击 CTA。
- 主流程：0) 同意门禁：`TrackingConsent` unset/denied→埋点 no-op（仅匿名聚合 +1），granted 才进。1) 上报 cta_click→校验签名+TTL+限频。2) 写 `CtaConversion(click_weak)` LOG（IDEM clickId），仅弱信号不计转化。3) 注册完成→signup_confirmed；权益消费→consume_confirmed，转化只认这两类。
- 异常/刁钻流：E1 签名失效→丢弃+异常计数；E2 IDEM ON CONFLICT DO NOTHING 恰一条；E3 ①clickId 须服务端签发 ②限频令牌桶 ③转化只认可信信号，click_weak 不进分子；E4 现场签发 anonId、限频按 IP；E5 fire-and-forget 不阻塞跳转；SRM 卡方偏离→冻结该实验归因。
- 验收：伪造 clickId→无记录；同 clickId 两次→恰一条；仅 click_weak→转化分子=0；大量随机 clickId→全拒+限频；失衡 fixture→SRM 冻结。
- 关联：契约 `POST /api/cta/click`；状态机 `CtaConversion`/`AbAssignment`；原语 IDEM+LOG；安全：客户端事件零信任、跟踪同意先行。

### UC-consent-track-001 · Cookie/埋点同意先行（consent-before-tracking · 默认拒绝 · 撤回即停）
**七类**：正常✔(同意后才埋点) 异常✔(E1 写同意失败 fail-closed) 特殊✔(E2 首访 unset/i18n banner/必要 cookie 豁免) 逃逸✔(E4 同意服务不可用按 denied 降级) 并发✔(E3 多标签并发授予幂等) 复杂✔(授予→启用埋点→撤回→停止+失效 cookie) 刁钻✔(E5 伪造 granted 头 / E6 撤回后在途埋点 / E7 必要 cookie 夹带画像)
- 角色：访客（匿名/登录）/ 同意门禁服务 / identity 域。前置：首访默认 `TrackingConsent=unset`，展示 banner（locale）。触发：首访 / 点击 banner。
- 主流程：1) unset 期只发必要 cookie，不种持久 cookieId、不写 per-subject 埋点，功能不受损。2) banner 选择→经契约写 identity `ConsentRecord(scope=tracking, granted|denied, version, locale)`；投影更新。3) granted→启用持久 cookieId+埋点+A/B 持久分桶；denied→匿名聚合-only。
- 异常/刁钻流：E1 fail-closed 视为未授予；E2 unset 默认拒绝、必要 cookie 豁免、locale banner；E3 IDEM(subject+scope+version) 恰一条；E4 按 denied 降级绝不默认开；E5 门禁以服务端投影为准不信客户端声明；E6 埋点端点统一查门禁撤回后 no-op、持久 cookieId 失效；E7 必要 cookie 白名单禁画像维度+审计。
- 后置：identity `ConsentRecord(scope=tracking)`；本域 `TrackingConsent∈{unset,granted,denied}`；granted 才有后续行为 LOG。
- 验收：unset 访客→无持久 cookieId、marketing_event_log 无 per-subject 行；拒绝→埋点端点全程 no-op；接受→之后 cta_click 才落 click_weak；伪造 granted→服务端判 denied 不埋点；撤回后→cookieId 失效、埋点 no-op；多标签并发接受→恰一条 granted。
- 关联：契约 `POST /consent/tracking`（委派 identity）+ 埋点端点门禁；状态机 `TrackingConsent`/identity `ConsentRecord`；原语 IDEM+RLS+LOG；安全：跟踪同意先行、默认拒绝、fail-closed、撤回即停（ePrivacy/PIPL）。

### UC-faq-001 · FAQ 展示 + 结构化数据（FAQPage JSON-LD）
**七类**：正常✔ 异常✔(E1 内容缺失) 特殊✔(E2 i18n/空列表/首次) 逃逸✔(E3 JSON-LD 失败降级) 并发✔(ISR 单飞同 home-001) 复杂✔(分类+搜索过滤) 刁钻✔(E4 文案注入污染 JSON-LD / E5 搜索词 PII 入账本)
- 角色：访客/渲染服务。前置：`MarketingContent(published,type=faq)`。触发：GET `/faq`。
- 异常/刁钻流：E1 跳过缺失条目不整页失败；E2 i18n 回退+空态占位；E3 序列化失败省略结构化数据不阻塞；E4 JSON-LD 安全序列化+HTML 实体转义不拼接；E5 M-SCRUB 搜索词过 PII 探针整词 redact+截断。
- 验收：含 `</script>` FAQ→JSON-LD 不可逃逸；空 FAQ→空态非 500；序列化失败→页面 200；搜索词 `me@x.com`→账本记 `[redacted:email]` 无原文。
- 关联：契约 `GET /faq`；状态机 `MarketingContent`；安全：结构化数据安全序列化、PII scrub。

### UC-contact-001 · 联系表单提交（验证码 + 限频 + 邮箱归属 + 工单创建）
**七类**：正常✔ 异常✔(E1 验证码失败/E4 创建失败回滚) 特殊✔(E5 匿名/i18n/首次) 逃逸✔(E6 风控置疑人工接管/E9 spam 回流) 并发✔(E2 双击同 idemKey) 复杂✔(创建工单→条件外发部分失败) 刁钻✔(E3 伪造他人邮箱枚举 / E7 注入 / E8 附件 malware / E10 上下文 PII)
- 角色：访客（匿名/登录）/ contact 服务。前置：含人机校验 token；可选附件。触发：提交（带 idempotency-key）。
- 主流程：1) 人机校验+限频。2) 附件→UC-attach-001 净化通过才接受。3) idemKey 创建 `ContactTicket(received)`（IDEM）；owner=principal 或匿名 token。4) 回执策略：默认只给站内查询码；仅邮箱归属已验证（登录用户已验证邮箱）才外发；匿名邮箱一律 `suppressed_unverified`。
- 异常/刁钻流：E1 拒绝不创建；E2 IDEM 恰一条；E3 发回执前不验证归属即不外发→匿名 suppressed_unverified、登录只发本人已验证邮箱（枚举无回显差异）；E4 事务回滚工单+附件元数据原子+孤儿清理；E5 匿名 token/locale/空字段容忍；E6 received→spam_quarantine 转人工复核不外发；E7 参数化+输出转义纯文本；E8 委派 UC-attach-001；**E9 回流边 `spam_quarantined→triaging`(CAS) 人工复核/申诉可兜回，复核入 contact_audit**；E10 M-SCRUB route 白名单重建、正文只入 owner-RLS 业务表不入 LOG、搜索词过探针。
- 后置：`ContactTicket∈{received,triaging,spam_quarantined}`（可回流）；写 contact_audit(经 M-SCRUB)、OutboundMessage、AttachmentScan。
- 验收：匿名带邮箱→suppressed_unverified 零外发；登录未验证邮箱→不外发，已验证→queued；同 idemKey→恰一条；附件 EXIF GPS→入库无 GPS；注入正文→转义；落库中途失败→无孤儿；spam 经复核→回流 triaging 落审计；带 `?email=`/`/user/138...`→contact_audit 白名单重建无原始 PII。
- 关联：契约 `POST /api/contact`、`POST /api/contact/:id/reinstate`；状态机 ContactTicket/OutboundMessage/AttachmentScan；原语 IDEM+RLS(owner)+CAS(回流)+LOG；安全：匿名护栏、邮箱归属验证、净化、M-SCRUB。

### UC-contact-002 · 工单外发回执与投递状态机（软失败重试 / 硬退信终止 / 陌生邮箱抑制）
**七类**：正常✔(delivered) 异常✔(E1 软失败有界重试) 特殊✔(重试边界/首封) 逃逸✔(E3 服务商不可用站内兜底) 并发✔(E4 同 message 并发 CAS) 复杂✔(多次重试 saga 收敛) 刁钻✔(E2 硬退信无限重试 DoS / E5 回调伪造)
- 角色：外发服务/邮件服务商回调。前置：`OutboundMessage(queued)` 目标邮箱已验证。触发：投递任务/回调。
- 主流程：1) queued→sent(CAS)。2) 回调 delivered→sent→delivered。3) 软失败→有界退避重试。
- 异常/刁钻流：E1 sent→failed(soft) 有界退避(计数 CAS version+1) 预算内重投；E2 bounced 终态停止重试+工单标「无法触达」不重排队；E3 kill-switch 暂停队列（经 DegradationSwitch：写 LOG+降级态周期告警+TTL 复核防忘关）回执降级站内信；E4 状态 CAS 恰一次外发；E5 回调验签(HMAC)+归属校验，失败丢弃。
- 验收：硬退信→停 bounced、重试增量=0、工单标记；软失败→重试≤N 终态；伪造回调→状态不变。
- 关联：契约 webhook `POST /api/outbound/callback`；状态机 OutboundMessage；原语 CAS+LOG；安全：回调验签。

### UC-attach-001 · 附件/截图安全净化（AV + 重编码 + EXIF 去除 + SVG 净化）· 共享能力
**七类**：正常✔(clean) 异常✔(E1 AV 不可用) 特殊✔(E4 0字节/超大/畸形头/首传) 逃逸✔(E1 降级保守拒收) 并发✔(同 hash 去重) 复杂✔(多步管线部分失败) 刁钻✔(E2 malware / E3 隐写 PII / E5 SVG 脚本 / E6 双扩展名)
- 角色：contact/feedback 上传方/净化服务。前置：类型+大小白名单初筛。触发：上传附件。
- 主流程（净化五层）：1) 白名单(MIME 嗅探真实类型)+大小限。2) AttachmentScan(pending)→AV 扫描。3) 图片重编码剥离原始字节去 EXIF/GPS。4) SVG 一律拒绝。5) 通过→sanitized 存私有桶，签名 URL+attachment。
- 异常/刁钻流：E1 fail-closed 扫描不可用保守拒收；E2 AV 命中 rejected 不入桶；E3 强制重编码+像素重采样破隐写；E4 嗅探+大小门+解码失败即拒；E5 SVG 拒绝不依赖净化器漏网；E6 以嗅探真实类型为准不信扩展名。
- 验收：EICAR→rejected 不入桶；GPS EXIF JPG→输出无 GPS；任意 SVG→rejected；AV mock 不可用→fail-closed 拒收；`a.png.svg`→按真实类型拒。
- 关联：契约内部 `POST /api/attachments`；状态机 AttachmentScan；原语 LOG；安全：内容净化层、私有桶+签名下发。

### UC-feedback-001 · 反馈按钮提交（匿名/登录 · 高优告警去抖限频 · 附件净化）
**七类**：正常✔ 异常✔(E1 落库失败回滚) 特殊✔(E4 匿名/i18n/空) 逃逸✔(E5 告警通道不可用降级) 并发✔(E2 双击 idem) 复杂✔(高优→去抖聚合→escalate) 刁钻✔(E3 高优灌量 DoS 值班 / E6 注入 / E7 上下文 PII)
- 角色：用户（匿名/登录）/ feedback 服务 / 值班告警。前置：反馈按钮全站可达；可选附件。触发：提交（带 idemKey；可选 traceId）。
- 主流程：1) 限频+人机校验（匿名更严）。2) 附件→UC-attach-001。3) 创建 `Feedback(received)`（IDEM）；含可信 traceId 的支付/系统异常→priority=high。4) 高优→去抖聚合后 received→escalated 通知值班。
- 异常/刁钻流：E1 事务回滚+孤儿清理；E2 IDEM 恰一条；E3 ①escalate 需可信信号(有效 traceId)才直 page、纯匿名文本不直 page ②告警去抖同指纹聚合一条 ③令牌桶限频；E4 匿名 token/locale/允许仅附件；E5 降级落 escalated 待办队列+站内看板不丢高优；E6 参数化+转义纯文本；E7 M-SCRUB route 白名单重建+丢弃非白名单参数，正文只入 owner-RLS 业务表，账本仅元数据/指纹。
- 后置：`Feedback∈{received,escalated,closed}`；写 feedback_audit(经 M-SCRUB 仅元数据)、可能 AttachmentScan。
- 验收：同指纹高优 100 条/窗口→聚合 1 条；匿名纯文本「支付异常」无 traceId→不直 page 仅入队，带 traceId→升级；超频→429；双击→恰一条；带 `?email=`/`/user/138...`→feedback_audit 白名单重建无 PII，正文不入 LOG。
- 关联：契约 `POST /api/feedback`；状态机 Feedback；原语 IDEM+RLS(owner)+LOG；安全：匿名护栏、告警去抖、净化、M-SCRUB。

### UC-counter-001 · 实时面试计数展示（累计只增 · 缓存 · 防刷 · 冷启动隐藏 · 平滑可测 · 降级）
**七类**：正常✔ 异常✔(E1 投影读失败) 特殊✔(E2 冷启动 real<T/i18n 千分位) 逃逸✔(E1 降级隐藏/旧快照) 并发✔(E3 缓存击穿回源单飞) 复杂✔(投影聚合+平滑追赶) 刁钻✔(E4 客户端伪造写 / E5 真实跳变注入)
- 角色：访客/计数投影服务。前置：`interview_event(completed)` LOG 追加；投影 `interview_counter`。触发：访问含计数模块页面。
- 主流程：1) 读 real（缓存命中或回源聚合）。2) 语义锁定+口径过滤：real=真实外部已结算用户已完成累计，投影排除 `account.flag∈{internal,test,fraud_suspected,refunded_reversed}`，可对账回放。3) 冷启动门 real<T→隐藏或定性文案绝不编造。4) 展示值 `D=floor(real/g)*g`，平滑封顶 ≤maxStep/tick，D≤real 单调不减，locale 千分位。
- 异常/刁钻流：E1 降级返回 stale 或隐藏绝不返回 0/编造，降级置位经 DegradationSwitch 写 LOG+周期告警+TTL 复核；E2 隐藏数字+定性文案；E3 回源 single-flight+短 TTL，可观测回源次数；E4 设计层拒绝客户端写无写端点；E5 平滑追赶每 tick ≤maxStep 收敛 floor(real/g)*g 永不超 real。
- 后置：纯展示派生无业务写，D 由 real 确定性计算可审计。
- 验收：注入 real 序列→D=floor(real/g)*g 且 D≤real 单调不减；real<T→响应隐藏/定性无数字；real+10000→连续 tick 增量 ≤maxStep 收敛；无客户端写端点；注入 test 账号事件→real 不抬高（对账回放）；降级隐藏→DegradationSwitch 写 LOG+周期告警+reviewBy 升级；缓存过期并发 N→回源恰 1 次。
- 关联：契约 `GET /api/stats/interview-count`（只读）；状态机/投影 interview_counter；原语 LOG+CAS(回源锁)；安全：零信任 social proof、严禁凭空注入、可审计。

### UC-seo-001 · meta / canonical / 多语言 hreflang
**七类**：正常✔ 异常✔(E1 缺翻译页) 特殊✔(E2 默认语言/x-default/首屏) 逃逸✔(E3 动态 meta 失败兜底静态) 并发✔(纯渲染—诚实标注无状态，由 CDN/ISR 承载，高并发正确性由 home-001 E3 统一覆盖) 复杂✔(多 locale×多路由矩阵) 刁钻✔(E4 输入反射进 meta 注入)
- 主流程：渲染 title/description/canonical；每 locale 输出 hreflang+x-default 双向自指。
- 异常/刁钻流：E1 缺 locale 页不输出指向 404 的 hreflang；E2 canonical 去跟踪参数+统一尾斜杠，x-default 指主语言；E3 兜底静态默认 meta 不输出空 title；E4 meta 值转义+白名单长度限不反射原始 HTML。
- 验收：hreflang 集合互相自指不含 404；canonical 去跟踪参数；反射输入转义；meta 失败仍有合法默认 title。
- 关联：页面 head；安全：反射输入转义。

### UC-seo-002 · sitemap 生成（并发回源收敛 · 缓存击穿防护）
**七类**：正常✔ 异常✔(E1 数据源部分失败) 特殊✔(E2 空站点/超大分片) 逃逸✔(E3 生成失败返回上次) 并发✔(E4 并发单飞收敛真断言) 复杂✔(分片+增量) 刁钻✔(E5 草稿页泄露)
- 主流程：聚合 published URL→缓存(TTL)→超量分片 sitemap-index。
- 异常/刁钻流：E1 分片降级其余正常不整体 500；E2 空→合法空 sitemap、超量→自动分片；E3 返回上次缓存后台重建；E4 回源单飞+互斥锁 N 并发收敛 1 次（回源计数=1 断言）；E5 只枚举 published+公开，草稿/私有不进。
- 验收：缓存过期并发 N→生成恰 1 次；草稿页不出现；超 5 万→分片；生成失败→返回缓存。
- 关联：契约 `GET /sitemap.xml`；原语 CAS/锁+LOG；安全：只暴露 published。

### UC-seo-003 · 结构化数据 / breadcrumb（JSON-LD）· 防注入
**七类**：正常✔ 异常✔(E1 字段缺失) 特殊✔(E2 i18n/根页无面包屑) 逃逸✔(E3 生成失败省略) 并发✔(无状态诚实标注) 复杂✔(多类型 schema 组合) 刁钻✔(E4 内容注入逃逸 script)
- 主流程：生成 BreadcrumbList/Organization/WebSite JSON-LD，安全序列化（`<`→实体，不拼接）。
- 异常/刁钻流：E1 省略缺字段输出合法子集；E2 根页省略面包屑、locale 本地化；E3 序列化异常省略不阻塞；E4 Unicode 转义+类型/长度白名单不让用户内容逃逸 ld+json。
- 验收：注入 `</script>`+引号→合法不可逃逸（解析断言）；缺字段→合法子集；序列化失败→页面 200。
- 关联：页面 head；安全：结构化数据安全序列化、内容不可信。

### UC-legal-001 · 用户协议 / 隐私政策展示 + 版本 pin + locale + 生效判定
**七类**：正常✔ 异常✔(E1 内容源失效) 特殊✔(E2 i18n/历史版本回看/首访) 逃逸✔(E3 渲染失败兜底) 并发✔(E4 版本切换读一致 CAS pin 真断言) 复杂✔(版本链+多语言矩阵) 刁钻✔(E5 篡改版本号绕重授)
- 主流程：渲染当前 published 政策(pin 到具体 version，按 locale)；展示 effectiveAt(存 UTC 按 locale 显示)。
- 异常/刁钻流：E1 兜底上次缓存版本绝不空白；E2 版本链可回看不可变+locale 回退；E3 纯文本兜底+联系入口；E4 读 pin 一致 version（CAS 发布原子切换）不混版；E5 服务端权威 needReconsent=userConsent.policyVersion<currentPolicy.version（版本比较），门禁在 identity 服务端校验。
- 后置：纯展示+版本 pin；实际重新同意由 identity CONSENT-04 执行。
- 验收：发新版瞬间并发读→无半新半旧混版；历史版本可回看不可变；伪造 policyVersion→服务端仍 needReconsent=true；跨时区→版本比较结果稳定不抖。
- 关联：契约 `GET /terms|/privacy`、`GET /policy/versions`；状态机 policy 版本链；委派 identity CONSENT-04；原语 CAS(发布)+RLS。

### UC-legal-002 · 同意采集触点（base/sensitive + 未成年年龄门 + 监护人分支）
**七类**：正常✔ 异常✔(E1 写同意失败回滚) 特殊✔(E2 i18n/首次/边界年龄) 逃逸✔(E5 同意服务不可用 fail-closed) 并发✔(E3 双击重复同意 idem) 复杂✔(年龄门→监护人→分级 scope) 刁钻✔(E4 伪报年龄绕监护人 / E6 注入)
- 主流程：1) 展示当前 version 摘要(locale)。2) 年龄门双校验(确定性)：<14→监护人分支(需 scope=guardian，未满足门禁拒绝)，14–18 按策略叠加提示。3) 勾选→经契约写 identity ConsentRecord(scope,version,GRANTED,locale)。**审计无空窗(解 P2-#11)：ConsentRecord 写入与 consent_audit 同事务提交，受保护动作放行以 ConsentRecord 已落库为前提，绝不先放行后补审计；审计写失败则整事务回滚动作不放行（未留痕同意视为无效）。**
- 异常/刁钻流：E1 事务回滚动作不放行；E2 locale 摘要、边界按 <14 严格；E3 IDEM(user+scope+version) 恰一条；E4 业务校验器要 guardian scope 才放行敏感处理，缺→服务端门禁 403；E5 fail-closed 不放行需同意动作；E6 scope 白名单+服务端绑定动作所需 scope。
- 后置：identity ConsentRecord∈{GRANTED}(或拒绝未写)；写 consent_audit(version+locale)。
- 验收：年龄 13 无 guardian→敏感动作 403、无 ConsentRecord(sensitive)；恰 14 边界正确分流；双击→恰一条；同意服务失败→拒绝(fail-closed)；伪造 scope→按动作所需重判；审计写失败→同事务回滚动作不放行无 ConsentRecord（无空窗）。
- 关联：契约 `POST /consent`(identity)+受保护动作端点；状态机 ConsentRecord(identity)；原语 IDEM+RLS+LOG；安全：业务双校验(年龄/监护人)、fail-closed、敏感单独同意(PIPL §29)。

### UC-legal-003 · 同意撤回入口（从隐私页发起，委派 identity CONSENT-03/06）
**七类**：正常✔ 异常✔(E1 撤回写失败) 特殊✔(E2 重复撤回幂等/i18n) 逃逸✔(E4 级联失败补偿) 并发✔(E3 撤回与处理竞态 CAS) 复杂✔(撤回→功能降级→派生数据停处理) 刁钻✔(E5 越权撤回他人 / E6 撤回后在途处理)
- 主流程：1) 鉴权(RLS 仅本人)。2) 选撤回 scope。3) 委派 identity ConsentRecord GRANTED→WITHDRAWN(CAS)。4) 撤回后果：功能门禁即时关闭、派生数据停止处理/匿名化(CONSENT-03 级联)。
- 异常/刁钻流：E1 事务回滚状态不变可重试；E2 幂等(已 WITHDRAWN 再撤 no-op)+locale；E3 CAS 置 WITHDRAWN 后在途处理在边界后被门禁拒；E4 补偿未停处理进重试队列最终一致；E5 RLS fail-closed 0 行→404；E6 处理入口统一查 consent 门禁撤回后即 403。
- 后置：identity ConsentRecord=WITHDRAWN；功能降级；写 consent_audit(withdrawn)。
- 验收：撤回后敏感 API→403；撤回时间戳后无新敏感处理；重复撤回幂等；越权→404；竞态→撤回后处理被拒。
- 关联：契约 `POST /consent/withdraw`(委派 identity)；状态机 ConsentRecord(identity)；原语 CAS+IDEM+RLS+LOG；安全：撤回权(PIPL/GDPR)。

### UC-legal-004 · DSAR 入口（注销 / 数据导出 / 删除）· 委派 identity account DELETING saga
**七类**：正常✔ 异常✔(E2 导出失败重试) 特殊✔(E3 冷静期/首次/i18n) 逃逸✔(E5 异步队列降级/人工接管) 并发✔(E4 重复请求幂等/撤销竞态) 复杂✔(注销冷静期→多聚合删除→不可逆) 刁钻✔(E6 越权导出他人 / E7 导出含他人 PII)
- 主流程：1) 鉴权(RLS 本人)+二次确认。2) 导出：异步队列生成数据包(仅本人)→签名 URL 限时下发。3) 注销/删除：委派 identity account→DELETING(冷静期 saga 可撤销)，冷静期满→多聚合级联删除/匿名化(不可逆)写 account_audit。
- 异常/刁钻流：E1 注销前置校验失败(未结订单/进行中面试)阻断+可解释不静默删；E2 导出异步有界重试最终失败可解释；E3 冷静期内可撤销+locale；E4 IDEM(user+type+window)、撤销/到期 CAS 明确胜出；E5 可靠队列重试+死信→人工接管不丢；E6 RLS fail-closed→404；E7 owner-scope 过滤+二次脱敏审计。
- 后置：identity account∈{DELETING,…}/导出任务终态；写 account_audit、dsar_audit。
- 验收：导出包仅本人数据；越权→404；注销冷静期可撤销撤销后 ACTIVE；重复→恰一次；删除队列失败→死信不丢；签名 URL 限时失效。
- 关联：契约 `POST /account/export|/account/delete`(委派 identity)；状态机 account(identity)；原语 IDEM+CAS+RLS+LOG+可靠队列；安全：DSAR(PIPL/GDPR)、owner-scope 脱敏。

### UC-ab-001 · A/B 实验分流（匿名确定性哈希 / 登录持久 AbAssignment + SRM 守卫 + 过期再分配 + 身份合并）
**七类**：正常✔ 异常✔(E1 配置缺失兜底对照) 特殊✔(E2 首次/无 cookie/边界桶) 逃逸✔(E4 SRM 失衡冻结归因) 并发✔(E3 登录首次分配竞态 CAS) 复杂✔(过期再分配/跨周期一致/EXP/STITCH 身份合并) 刁钻✔(E5 篡改变体刷量 / E6 强制跨设备一致已删伪用例)
- 主流程：匿名 variant=stableHash(experimentId+saltedAnonId)%buckets 零持久行明确不跨设备一致；登录查 AbAssignment(active) 无则 CAS 首次分配持久(绑 userId)；SRM 守卫监控分流比。
- 异常/刁钻流：E1 兜底 control 不报错；E2 现场签发 anonId 哈希确定性边界稳定；E3 CAS 唯一(user+experiment 一行)并发收敛同变体；E4 卡方偏离→告警+冻结实验归因；E5 变体服务端权威(匿名哈希不可自选、登录绑 AbAssignment)、曝光/转化经 M-CTA 限频+IDEM；E6 明确拒绝并文档化匿名物理不可跨设备一致；EXP expired 同实验同周期锁定原 variant 至实验结束仅新周期重分配防沾染；STITCH 登录瞬间一次性把匿名哈希 variant 写入 AbAssignment(source=anon_inherited) 之后以 AbAssignment 为唯一权威，曝光去重 key=experimentId+稳定身份+variant。
- 后置：登录 AbAssignment∈{active,expired}；匿名无行；曝光/转化进 CtaConversion LOG(去重 key 含稳定身份+variant)。
- 验收：同 anonId 多次→同变体；不同设备匿名→不保证一致(断言此预期非 bug)；登录跨设备→同变体；并发首次→恰一行；失衡→SRM 冻结；expired 同周期→仍原 variant；匿名 variant=A 后登录→AbAssignment 继承 A 不换桶、同身份曝光去重不重复计数。
- 关联：契约 `GET /api/experiment/:id/variant`；状态机 AbAssignment；原语 CAS+IDEM+LOG；安全：变体服务端权威、SRM 守卫。

---

## §2 测试用例（TC）

> 测试层：unit / contract / integration(Supertest+Testcontainers) / graph(确定性 fixture+fake model，本域基本不涉模型) / e2e(Playwright) / ai-eval。禁止假验收：只断言 200、只开页不跑流程、mock 模型证明质量、AI 自评、只测 happy path 跳过失败/退款/重复。

UC-home-001：main(e2e 五区块+CTA+locale+服务端 clickId)；E1(integration 单区块失败→占位+其余 DOM+200)；E3(integration ISR 过期+并发 50→回源恰 1 次)；E4(unit 缺 key→回退无裸 key)；E5(unit `<script>`→转义无执行)。
UC-home-002：main(integration 有效 clickId→一条 click_weak)；E1(unit 无/伪签名→丢弃)；E2(integration 同 clickId 两次→恰一条 IDEM)；E3(integration 1000 随机无签名→全拒+429，转化分子=0)；E5(e2e 仅 click_weak→转化=0)；SRM(integration 失衡→SRM 冻结)；E0(integration TrackingConsent=denied/unset→cta_click no-op 无写入)。
UC-consent-track-001：unset(integration 无持久 cookieId、无 per-subject 行)；deny(integration 埋点端点全程 no-op)；grant(e2e 接受后 cta_click 才落 click_weak)；E5(contract 伪造 granted→服务端判 denied)；E6(integration 撤回后 cookieId 失效、埋点 no-op)；E3(integration 多标签并发接受→恰一条 granted)；E4(integration 同意服务不可用→按 denied 降级)。
UC-faq-001：main(e2e FAQ+FAQPage JSON-LD 合法)；E3(unit 序列化失败→200 省略)；E4(unit `</script>`→安全转义不可逃逸)；E5(unit 搜索词 me@x.com→[redacted:email] 无原文)。
UC-contact-001：main(e2e 登录已验证邮箱→工单 received+OutboundMessage queued)；E2(integration 同 idemKey 双提→恰一条)；E3(integration 匿名带邮箱→suppressed_unverified 零外发只给查询码)；E4(integration 落库中途失败→无孤儿)；E6(integration 疑似 spam→spam_quarantine 不外发)；E7(unit 注入正文→转义无执行)；E8(integration 附件 EXIF GPS→入库无 GPS)；E9(integration spam_quarantined 经复核→回流 triaging CAS、复核落 audit)；E10(integration 带 ?email=/user/138→audit 白名单重建无 PII、正文不入 LOG)。
UC-contact-002：E1(integration 软失败→重试≤N 终态)；E2(integration 硬退信→bounced、重试增量=0、工单标无法触达)；E3(integration 服务商不可用→kill-switch 暂停+站内兜底)；E4(integration 并发投递→恰一次 CAS)；E5(contract 伪造无签名回调→丢弃状态不变)。
UC-attach-001：E2(integration EICAR→rejected 不入桶)；E3(unit GPS EXIF JPG→输出无 GPS)；E5(unit 任意 SVG→rejected)；E1(integration AV 不可用→fail-closed 拒收)；E6(unit a.png.svg/伪 MIME→按嗅探真实类型)。
UC-feedback-001：main(e2e 提交→received，带 traceId→escalated)；E2(integration 双击→恰一条)；E3a(integration 同指纹高优 100/窗口→聚合 1 条)；E3b(integration 匿名纯文本支付异常无 traceId→不直 page 仅入队)；E3c(integration 超频→429)；E5(integration 告警通道不可用→高优落待办不丢)；E7(integration 自动上下文 ?email=/user/138→audit 白名单重建无 PII、正文不入 LOG 仅元数据)。
UC-counter-001：smooth(unit 任意 real→D=floor(real/g)*g、D≤real、单调不减)；cold(integration real=500/T=1000→隐藏/定性无编造)；jump(unit real+10000→每 tick ≤maxStep 收敛)；nowrite(contract 无客户端写端点)；stampede(integration 缓存过期+并发 N→回源恰 1 次)；E1(integration 投影读失败→stale 或隐藏绝不返回 0/编造)；filter(integration 注入 internal/test 事件→real 不抬高对账回放)；killgov(integration 降级隐藏→DegradationSwitch 写 LOG+周期告警+reviewBy 未复核升级)。
UC-seo-001：main(integration 各 locale hreflang 自指+x-default)；E1(unit 缺 locale→不输出指向 404)；E3(unit 动态 meta 失败→兜底合法 title)；E4(unit 反射输入→转义无注入)。
UC-seo-002：E4(integration 缓存过期+并发 N→生成恰 1 次)；E5(integration 草稿/私有→不出现)；E2(unit URL>5万→分片，空站点→合法空)；E3(integration 生成失败→返回缓存)。
UC-seo-003：E4(unit 注入 `</script>`/引号→合法不可逃逸)；E1(unit 字段缺失→合法子集)；E3(unit 序列化失败→200 省略)。
UC-legal-001：E4(integration 发新版并发读→无半新半旧 pin 一致)；E5(contract 伪造 policyVersion→服务端 needReconsent=true)；tz(unit 跨时区→版本比较稳定不抖)；E2(integration 历史已同意版本可回看不可变)。
UC-legal-002：minor(integration 年龄 13 无 guardian→403、无 ConsentRecord(sensitive))；edge(unit 恰 14 边界→正确分流)；E3(integration 双击授予→恰一条 IDEM)；E5(integration 同意服务失败→拒绝 fail-closed)；E6(unit 伪造 scope→按所需重判)；audit(integration 注入审计写失败→同事务回滚、动作不放行、无 ConsentRecord 无空窗)。
UC-legal-003：main(integration 撤回后敏感 API→403、撤回时间戳后无新处理)；E2(integration 重复撤回→幂等 no-op)；E5(integration 越权→404 不泄存在性)；E3(integration 竞态→撤回后处理被拒 CAS 边界)；E4(integration 级联部分失败→补偿队列最终停止)。
UC-legal-004：export(integration 导出仅本人数据)；E6(integration 越权 DSAR→404)；E3(integration 注销冷静期可撤销撤销后 ACTIVE)；E4(integration 重复→恰一次 IDEM、撤销/到期竞态明确胜出)；E5(integration 删除队列失败→死信不丢可人工接管)；url(contract 导出签名 URL 限时失效)。
UC-ab-001：anon(unit 同 anonId 多次→同变体)；crossdev(unit 不同设备匿名→不保证一致 断言非 bug)；login(integration 登录跨设备→同变体)；E3(integration 登录首次并发→恰一行 active CAS)；E4(integration 失衡→SRM 冻结)；EXP(integration expired 同周期→仍原 variant)；stitch(integration 匿名 variant=A 后登录→继承 A 不换桶、同身份曝光去重不重复计数)。

---

## §3 评审收口对照（一轮必补 1–12）
1 同意撤回→UC-legal-003；2 DSAR→UC-legal-004；3 未成年→UC-legal-002 E4/E5；4 Counter 冷启动删非0/只增→M-COUNTER+UC-counter-001；5 平滑/约数可测→D=floor(real/g)*g；6 CTA 限频+反作弊+SRM→M-CTA+UC-home-002；7 Contact 邮箱归属→M-OUTBOUND+UC-contact-001 E3；8 附件净化→M-SANITIZE+UC-attach-001；9 A/B 单一机制删伪用例→M-AB+UC-ab-001；10 移除坐席-租户→M-TENANT；11 Outbound bounced+Feedback 告警限频→UC-contact-002 E2+UC-feedback-001 E3；12 effectiveAt 时区+expired 再分配→M-TZ+UC-ab-001 EXP。

## §3.2 二轮对抗评审必补对照（本次增补）
- P0 #2 consent-before-tracking（整条用例缺失、自相矛盾）→ §0.65 M-TRACK-CONSENT + UC-consent-track-001 + UC-home-001/002 埋点门禁 + TC-home-002-E0。
- P0 #5 spam 无回流边 → §0.7 `spam_quarantined→triaging`(CAS) + UC-contact-001 E9 + TC-contact-001-E9。
- P1 #6 A/B 24h cookie sticky 业务错→实验期 sticky+匿名↔登录身份合并 → §0.3 M-AB identity stitching + 曝光去重 key 锁定 + UC-ab-001 STITCH + TC-ab-001-stitch。
- P1 #8 服务端二次 PII scrub → §0.66 M-SCRUB + UC-contact-001 E10 / UC-feedback-001 E7 / UC-faq-001 E5 + 对应 TC。
- P1 #9 计数口径剔除内部/测试/异常账号 → §0.2 M-COUNTER 口径过滤 + UC-counter-001 step2 + TC-counter-001-filter。
- P2 #11 consent 审计补写空窗期 → UC-legal-002 step3 审计同事务无空窗（未留痕同意视为无效）+ TC-legal-002-audit。
- P2 #13 kill-switch 降级常态化/开关遗忘 → §0.67 M-KILLSWITCH-GOV(DegradationSwitch：LOG+周期告警+TTL 复核) + UC-counter-001/UC-contact-002 E3 + TC-counter-001-killgov。
- P2 #10 万级并发/JSON-LD 全文比对→确定性断言：single-flight 回源计数=1 + JSON-LD 安全序列化结构断言（一轮已收口）。
- P2 #12 未成年/监护人同意：UC-legal-002（一轮已收口）。

二轮「两条合规硬伤整条用例缺失」均补齐：撤回同意(UC-legal-003)+Cookie/埋点同意(UC-consent-track-001)。「贴标签未落机制」四项(trackConversion 刷量/附件实际内容/上下文自由文本 PII/spam 黑洞)全部下沉到机制(M-CTA/M-SANITIZE/M-SCRUB/spam 回流边)。照搬源库弱实现三项(冷启动非0/24h cookie sticky/转化客户端敞开写)均按 Meetwise 零信任/实验严谨标准重写。

## §4 待决事项（openDecisions · 需 identity/admin/法务确认，非本域阻塞）
1 强制条款宽限期截止时刻(UTC 权威，长度待法务)；2 计数阈值 T/粒度 g/maxStep 取值与「约数展示」措辞合规复核；3 TrackingConsent 与 identity ConsentRecord(scope=tracking) 契约字段+撤回到门禁生效 SLA；4 计数口径过滤账号 flag 来源(依赖 identity/commerce 只读视图)；5 spam 申诉回流发起方(用户自助 vs 仅人工)与 admin 域职责边界；6 未成年年龄推断方式(声明制 vs 强校验)。
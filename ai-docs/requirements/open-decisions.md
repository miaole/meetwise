---
id: requirements_open_decisions
name: 待拍板业务决策清单
description: 用例评审暴露、需产品/法务/安全签字才能终判的决策。落代码前置。带 PIN 暂定值的可先跑，签字后写死。
type: reference
scope: shared
level: guide
status: active
owner: product
related:
  - ./use-cases/README.md
  - ../rules/global/status-machine.md
---

# 待拍板业务决策清单

> 这些是用例无法自行定夺、需**你/产品/法务/安全签字**的口径。标 `PIN=` 的是暂定默认（可先跑，签字后写死）。未签字项会阻断对应用例的可终判。

## ✅ 已签决策（产品）

| 项 | 决定 | 下游动作 |
|---|---|---|
| A 计费模型 | **全有全无 + 降级按比例(1/2) + 失败/中止不计费** | ConsumptionRecord `partial_confirmed` 用比例；扣费在 `Interview.completed` |
| A 权益有效期 | **paid 设 12 个月有效期**（改原 PIN=不过期） | `EntitlementAccount.expires_at` + 到期清算 job + 提前提醒 + 合规告知；Subscription/Invoice 入状态机 |
| E 报告导出/分享 | **只做导出（水印+脱敏快照+TTL+限次+高熵token），不做对外分享链接** | report-growth 用例据此裁剪；无 share-grant |
| E B 端范围 | **整套全做**（入驻/席位/题库/批量匹配/录用） | bend-recruiting 28 UC 全部本期 in；**排期走窄而深**：先一条 B 端端到端(入驻→建题库→批量匹配出排名)，再铺全 |
| C 安全阈值 / D 合规常量 | **暂按 PIN 跑，待安全/法务补签** | golden 配置先用 PIN 值，签字后写死版本号 |
| C 端形态扩展 | **视频面试 + 在线代码沙箱 + 系统设计白板 本期延后（太重）** | 不进 MVP；C 端增厚先做轻量高杠杆项(留存/offer闭环/内容/社交/AI教练)。代码"讲思路"现有模拟面试已覆盖，仅"真跑代码"执行沙箱延后 |
| A 权益池模型 | **共享池**：quiz/interview/report/career/learning 同抽一池 | commerce 数据模型用单一 `EntitlementAccount` 额度桶；用例不分服务 SKU；升级路径统一 |
| A 扣减/回收优先级 | **FIFO 先到期先扣**：gift→trial→paid 按 `expires_at` 升序；退款只回收来源 paid 桶 | 扣减/回收 SQL 按到期排序 + CAS；对账只动来源桶 |
| A B 端 partial 计费 | **按比例计费（同 C 端 1/2 口径）**：部分/降级结果按比例,失败/中止不计费 | bend 结算与 C 端 `partial_confirmed` 同一比例逻辑,单一真相 |
| serviceType career_path 计费态 | **消耗额度,入共享/主池**：与面试同口径走 reserve→confirm | glossary serviceType 表去掉"计费未签"标记；career-path 用例额度门同面试 |

---

## A. 计费口径（最高频，阻断整组用例可测）
- ✅ **已签**：降级按比例 `1/2`（A 计费模型）。
- 已钉死（确认即可）：1 次额度=面试(非报告)；reserve→confirm 触发点=`Interview.completed`；报告失败不退、只免费 regenerate；仅 `failed/abandoned` 才 release。
- ✅ **已签**：**共享权益池**（quiz/interview/report/career/learning 同抽一池）。并发扣减用 CAS（工程）；career_path **消耗额度入主池**。残留(小)：lite→full 升级是否独立付费？(`PIN=独立付费`)
- ✅ **已签**：扣减/回收优先级 = **FIFO 先到期先扣**（gift→trial→paid 按 `expires_at`）；退款只回收来源 paid 桶；paid **设 12 个月有效期**（A 权益有效期）。
- ✅ **已签**：B 端"按成功条数"计费 = partial/降级**按比例**（同 C 端）。残留(小)：重生成计费归属（平台 vs 租户，`PIN=平台`）？

## B. 状态机增量（需正式 land 到 `rules/global/status-machine.md` + 同步 `check-docs.mjs`）
- Interview 增 `waiting_system`/`paused`、终态 `safety_hold`、会话级 `risk_held`。
- ConsumptionRecord 增 `confirmed→refunded`、`partial_confirmed`。
- 新增承重对象：VoiceTurn、CompensationJob(+DLQ+reconciliation sweeper)、AnswerEval、GuardrailHit、ManualReview——登记进"状态对象清单"（5→升 6+）。
- AiGraphRun 增 `canceling/canceled/timeout`。
- commerce 五表：PaymentOrder(+pending/closed)、EntitlementAccount、RefundOrder、Subscription、Invoice。

## C. 阈值标定（安全+合规+产品会签后写入 golden 配置版本号；落数前 ai-eval 不可终判）
- SLO：越狱/有害/造假拦截召回 `PIN≥0.98`、in-scope 误杀 FPR `PIN≤0.02`、危机自伤召回硬下限 `PIN≥0.995`、残余泄露率 `PIN≤0.005`、bias 可接受分差 ε `PIN≤2%`、PII 检出率。
- 反滥用限频 `PIN=20/min/用户`、队列深度上限 + 503 策略、低置信 NEEDS_REVIEW 阈值、DLQ 毒丸重放上限、research maxDepth/总预算。

## D. 合规法定常量（法务签）
- PIPL 保留期天数 + 时钟基准；被遗忘权两线 scope。
- 跨境单独同意是否触发（取决于最终模型部署位置）；境内 PII 区域门白名单/备案号/AIGC 标识（上线前置门）。
- 未成年 14 岁界限 + 监护人同意 + 敏感岗目录；法定保存年限/legal_hold 期限表；交易凭证保留年限。
- 题库泛化映射 KMS 轮转周期 / 解密授权角色。

## E. 范围/隐私（本期 in/out）
- 报告导出/分享 PII 面：纳入须水印 + 脱敏快照 + TTL + 限次 + 高熵 token；share-grant 默认过期窗 + 可对 HR 开放的字段集。
- B 端 scope：onboarding 全链路 + 批量/题库/席位整套状态机本迭代 in/out？

## F. 技术口径与契约缺口
- 幂等键 inputDigest 归一化算法（入摘字段集、防跨租户碰撞）；eventSeq 分配形态（行锁 + outbox 单写者）；rate-limiter 是否纳第五原语、归 Redis 还是 DB；trace 背压（异步丢弃 vs DLQ）。
- 契约补齐：`message_delta` 流式事件 schema（不补则流式退化整段渲染）、abandon/重试/kill 端点 + 幂等键、thread lease 写令牌信号（谁持写/被拒码）。
- 数值默认（待确认锁定）：支付 TTL `PIN=15min`、reserveTTL `PIN=72h`、补单窗口 `PIN=24h`、时钟漂移 `PIN=±5min`、退款自动审批阈值 `PIN=≤20000分且未消耗100%`、checkpoint retention TTL、FE 运行页 JS `PIN≤180KB`/LCP `PIN≤2.5s`。
- 测试分层纪律固化进 test-strategy：抗注入/不造假/按 locale 产语言归 ai-eval；e2e 仅结构/转义/业务校验；毫秒级竞态归 integration(CAS/租约)，e2e 双击仅尽力复现 + 终态一致。

---

> 处理方式建议：A/B/F 多为工程可先按 PIN 跑、你逐条确认即可；C/D/E 需安全/法务/产品签字才落数。逐组确认或一次性给口径都行。

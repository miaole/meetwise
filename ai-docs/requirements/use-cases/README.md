---
id: requirements_use_cases_index
name: 业务用例目录（索引 + 可追溯矩阵）
description: 315 业务用例 / ≈841 测试用例，10 领域，七类 case 全覆盖；含可追溯矩阵与落代码前置条件。详细用例分领域文档，缺口功能见第二批。
type: reference
scope: shared
level: guide
status: active
owner: product
related:
  - ../use-case-conventions.md
  - ../../testing/conventions/test-authoring.md
  - ../open-decisions.md
  - ./UC-interview-submit-answer.md
---

# 业务用例目录

> 按 [用例规范](../use-case-conventions.md) 产出，业务专家枚举 + 产品/QA 对抗评审收口。每条用例标注覆盖的 case 类、配测试用例与测试层。**功能 parity**：源参考能力一个不丢（见缺口第二批），实现一律走 Meetwise 自己的承重设计。

## 1. 总索引（按领域）

| # | 领域 | UC 数 | TC≈ | 文档 |
|---|---|---|---|---|
| 1 | 认证/同意/账号/权益/支付入口 | 46 | 90 | `cend-identity-account.md` |
| 2 | 简历 上传/摄取/结构化/诊断/优化/删除权 | 23 | 73 | `cend-resume.md` |
| 3 | 押题 resume-quiz/接地歪曲门/空召回 | 29 | 63 | `cend-quiz.md` |
| 4 | 模拟面试/中断恢复/语音/补偿 | 26 | 96 | `cend-mock-interview.md` |
| 5 | 报告子图/复盘/能力曲线/职业路径/学习 | 23 | 63 | `cend-report-growth.md` |
| 6 | 交易 支付/通知幂等/退款机/对账/grandfather | 38 | 62 | `commerce.md` |
| 7 | B 端 入驻/席位/题库/匹配/隔离/录用 | 28 | 135 | `bend-recruiting.md` |
| 8 | AI 双校验/护栏五层/研究 agent/迁移/观测 | 50 | 87 | `ai-safety-system.md` |
| 9 | 前端 SSE/流式/多标签/恢复/无障碍/性能 | 22 | 101 | `frontend-ux.md` |
| 10 | E2E 黄金路径/失败路径/B 端批量/跨设备 | 30 | 71 | `e2e-scenarios.md` |
| | **合计** | **315** | **≈841** | |

**七类覆盖**（单 UC 多归类，均 ≈4.1 类/UC）：

| 正常 | 异常 | 特殊 | 逃逸通道 | 高并发 | 复杂 | 刁钻 |
|---|---|---|---|---|---|---|
| 159 | 247 | 189 | 171 | 159 | 173 | 206 |

> 正常路径仅 ~12%，异常/刁钻最厚——防御性设计主导，符合"禁止假验收"。

## 2. 可追溯矩阵（抽样，示模式）

承重四原语：① CAS/版本号状态迁移 ② reserve→confirm/release 两阶段权益(含 TTL reaper) ③ principal-scoped 幂等键 ④ 事务性 outbox + 单调 eventSeq。横切：RLS 隔离、ai-runtime 双校验、kill-switch。

| UC | 契约 endpoint | 状态机对象 | 命中原语 | 测试层 |
|---|---|---|---|---|
| 提交答案评分 | POST /interview/:id/answers | Interview·ScoredQa·ConsumptionRecord | ①③+双校验 | unit·contract·integration·graph |
| 中断/同 thread resume | POST /interview/:id/interrupt·/resume | Interview(waiting_user)·checkpoint | ①+checkpoint | integration·graph·e2e |
| eventSeq 单调分配 | (outbox 派生) | domain_events | ④ | integration·property |
| 两阶段权益消费 | (reserve/confirm) | ConsumptionRecord·EntitlementAccount | ② | unit·integration·property |
| reserve 后 confirm 崩溃补偿 | POST /quiz/generate | QuizSet·ConsumptionRecord | ②④补偿 | integration·graph |
| 支付异步通知 | POST /payments/notify | PaymentOrder·outbox | ①③④ | integration·contract |
| 退款联动 | POST /refunds·回调 | RefundOrder·ConsumptionRecord(confirmed→refunded) | ①②④ | integration |
| IDOR 越权取简历 | GET /resumes/:id | RLS(属主) | RLS | integration(security) |
| 双校验拦截 | ai-runtime invoke | AiGraphRun | 双校验+① | graph·unit |
| 危机 handoff | SSE safety event | Interview(safety_hold) | ①+确定性路由 | graph·ai-eval |
| 报告子图舱壁 | POST /reports·SSE | AssessmentReport·AiGraphRun | ①②+双校验+舱壁 | graph·integration |
| B 端批量匹配 | POST /b/matches | BatchJob·租户 RLS | ①④+双校验+RLS | integration·ai-eval |

模式：写路径恒走 ① CAS 守终态 + ②/③ 保钱与幂等；跨聚合走 ④ outbox；AI 出口恒过双校验；越权恒 RLS 0 行。对抗类 UC 至少落 integration 真库；模型质量类落 ai-eval 金标集。

## 3. 功能 parity 缺口（第二批用例，按 Meetwise 标准设计）

源参考能力一个不丢；以下 7 块第一批 10 领域未覆盖，作第二批补齐（七类 case + 专家评审）：营销与法务页(首页区块/FAQ/协议/政策/SEO/反馈/实时面试计数)、admin/运营后台、面试服务细分(服务选择+押题/专项/行为/模拟四类)、作答辅助(答案建议+STAR 引导)、3D 数字人面试官(带降级)、兑换码/兑换服务、面试历史。

## 4. 落代码前置条件

1. 用例 + 七类测试矩阵定稿（315 UC / ≈841 TC，已含失败-退款-重复-越权）+ 第二批 parity 补齐。
2. [待拍板业务决策](../open-decisions.md)签字（计费口径、状态机增量、阈值标定、合规常量、范围）。
3. 依赖按 catalog 锁精确版本并通过关键冒烟；`packages/contracts`(共享 zod4 schema) 契约先行；状态机增量写入 `rules/global/status-machine.md` 并同步 `check-docs.mjs`。

三者齐备方可生成生产代码。

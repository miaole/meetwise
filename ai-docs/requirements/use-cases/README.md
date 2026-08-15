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
  - ./interview-question-bank-agent-rag.md
  - ./expert-interview-coach-agent-graph.md
  - ./expert-interview-coach-rag-runtime.md
  - ./expert-interview-coach-evaluation.md
  - ./expert-interview-coach-product-reliability.md
  - ./interview-question-bank-reliability-security.md
  - ./interview-question-bank-product-bend.md
  - ./qbank-generation-lifecycle.md
  - ./model-operation-routing.md
  - ./interview-scoring-measurement.md
  - ./expert-long-interview-runtime.md
  - ./rag-funnel-intent-routing.md
---

# 业务用例目录

> 按 [用例规范](../use-case-conventions.md) 产出，业务专家枚举 + 产品/QA 对抗评审收口。每条用例标注覆盖的 case 类、配测试用例与测试层。**功能完整性**：能力清单一个不丢（见缺口第二批），实现一律走 Meetwise 自己的承重设计。

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
| 8 | AI 双校验/护栏五层/研究 agent/迁移/观测/题库 generation | 51 | 94 | `ai-safety-system.md`、`qbank-generation-lifecycle.md` |
| 9 | 前端 SSE/流式/多标签/恢复/无障碍/性能 | 22 | 101 | `frontend-ux.md` |
| 10 | E2E 黄金路径/失败路径/B 端批量/跨设备 | 30 | 71 | `e2e-scenarios.md` |
| | **合计** | **316** | **≈848** | |

**七类覆盖**（单 UC 多归类，均 ≈4.1 类/UC）：

| 正常 | 异常 | 特殊 | 逃逸通道 | 高并发 | 复杂 | 刁钻 |
|---|---|---|---|---|---|---|
| 160 | 248 | 190 | 172 | 160 | 174 | 207 |

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
| 题库 generation 发布 | 受控构建任务（无公开写接口） | qbank source·generation·active pointer | ① CAS + RLS + 版本账本 | 完整迁移 integration |

模式：写路径恒走 ① CAS 守终态 + ②/③ 保钱与幂等；跨聚合走 ④ outbox；AI 出口恒过双校验；越权恒 RLS 0 行。对抗类 UC 至少落 integration 真库；模型质量类落 ai-eval 金标集。

## 3. 功能完整性缺口（第二批用例，按 Meetwise 标准设计）

能力清单一个不丢；以下 7 块第一批 10 领域未覆盖，作第二批补齐（七类 case + 专家评审）：营销与法务页(首页区块/FAQ/协议/政策/SEO/反馈/实时面试计数)、admin/运营后台、面试服务细分(服务选择+押题/专项/行为/模拟四类)、作答辅助(答案建议+STAR 引导)、3D 数字人面试官(带降级)、兑换码/兑换服务、面试历史。

## 4. 落代码前置条件

1. 用例 + 七类测试矩阵定稿（316 UC / ≈848 TC，已含失败-退款-重复-越权）+ 第二批能力补齐。
2. [待拍板业务决策](../open-decisions.md)签字（计费口径、状态机增量、阈值标定、合规常量、范围）。
3. 依赖按 catalog 锁精确版本并通过关键冒烟；`packages/contracts`(共享 zod4 schema) 契约先行；状态机增量写入 `rules/global/status-machine.md` 并同步 `check-docs.mjs`。

三者齐备方可生成生产代码。

### 横切运行时用例

模型调用、模型操作路由、记忆治理、隐私删除、岗位题域路由、长时专家面试运行时和云测试运行器属于多个领域共用的承重契约，不计入上表按产品域的历史估算；新增或调整模型节点时必须同时满足 `model-invocation-reliability.md` 与 `model-operation-routing.md`，不能因图节点名称或适配器不同而绕过预算、授权、成本和降级验收。长时面试的 transcript、恢复、级别校准、blueprint 和安全围栏必须同时满足 `expert-long-interview-runtime.md`；checkpoint/SSE/job payload 不得被当作用户历史或授权根。涉及后端、前端、测试、AI 等多题域题库时，必须先满足 `rag-funnel-intent-routing.md` 的轨道快照和数据面硬过滤；只有同桶正常完成且确认无合格题，才可按该用例的一次 LLM fallback 生成题。不能用语义相似度、分类建议或 generic fallback 替代隔离。

## 5. 专家级面试官题库（内部使用）

这三份题库共 `46` 题，服务于 Agent/RAG、可靠性/安全、产品/C-B 数据边界的专项面试。题面、量化评分锚点、追问与常见错误仅供面试官和题库策展使用；候选人公开面不返回评分细则、内部安全策略或招聘治理规则。

| 模块 | 题数 | 文档 |
|---|---:|---|
| Agent / RAG / 评测 | 16 | `interview-question-bank-agent-rag.md` |
| 可靠性 / 安全 / 隐私 / Agent Runtime | 15 | `interview-question-bank-reliability-security.md` |
| 产品 / C-B 招聘 / 数据评测 | 15 | `interview-question-bank-product-bend.md` |

## 6. 面向候选人的专家教练材料

| 材料 | 目标 | 文档 |
|---|---|---|
| LangGraph / Agent 图教练 | 小白能讲清状态、重放、并发、RAG、skills、降级与测试；标出已实现与目标边界 | `expert-interview-coach-agent-graph.md` |
| RAG / Agent Runtime 教练 | 用决策、指标、异常输入与代码解释 Router、检索、缓存、受限 Web/deep research、skills 和高性能流式渲染 | `expert-interview-coach-rag-runtime.md` |
| 全格式 RAG / 微调教练 | 用 PDF/Office/图文/视频摄取、结构切块、citation、数据集与微调治理讲清专家级方案 | `expert-interview-coach-rag-ingestion-finetuning.md` |
| LLM 评测 / 打分教练 | 用证据链、金标集、红队集、统计置信度、校准和公平性讲清“分数为何可信” | `expert-interview-coach-evaluation.md` |
| 产品 / 可靠性教练 | 从 C/B 数据边界、支付幂等、隐私、语音、SSE 到可发布性，训练可落地的系统设计回答 | `expert-interview-coach-product-reliability.md` |

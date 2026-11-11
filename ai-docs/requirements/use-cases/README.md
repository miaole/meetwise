---
id: requirements_use_cases_index
name: 业务用例目录（索引 + 可追溯矩阵）
description: 产品域历史估算 498 条用例 / ≈1625 测试用例（前 17 域 496 + 内部招聘骨架 2），另有横切运行时、专家题库与教练材料。本索引覆盖目录内全部 55 个用例文档。「第二批 7 块已补齐」仅指用例与测试矩阵补齐，不表示已全部落代码。
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
  - ../../architecture/devops/local-demo-deployment.md
  - ./public-preview-write-gate.md
  - ./interview-answer-preview-submit.md
  - ./interview-answer-dual-write-fence.md
  - ./marketing-legal-seo.md
  - ./admin-console.md
  - ./interview-modality.md
  - ./answer-assist.md
  - ./avatar-3d.md
  - ./redemption.md
  - ./interview-history.md
  - ./cend-overview-progress.md
  - ./bend-recruiter-architecture-surface.md
  - ./adaptive-interview-length.md
  - ./e2e-parity-baseline.md
  - ./privacy-deletion-sink-inventory.md
  - ./agent-observability-evaluation.md
  - ./application-assessment-terminal.md
  - ./cloud-runtime-and-migration.md
  - ./full-format-rag-platform.md
  - ./memory-governance-and-recall.md
  - ./product-readiness-c-b-audit.md
  - ./quality-assurance-traceability.md
  - ./rag-corpus-control-plane.md
  - ./resume-erasure-lifecycle.md
---

# 业务用例目录

> 按 [用例规范](../use-case-conventions.md) 产出，业务专家枚举 + 产品/QA 对抗评审收口。每条用例标注覆盖的 case 类、配测试用例与测试层。能力清单在规格层一个不丢（见 §3），实现一律走 Meetwise 自己的承重设计；**规格补齐 ≠ 已落代码**，完整文件清单见 §7。

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
| 11 | 营销/法务/SEO/反馈/实时面试计数（运营展示） | 17 | 96 | `marketing-legal-seo.md` |
| 12 | admin/运营后台（RBAC/用户/订单/内容/运营位/RLS） | 34 | 219 | `admin-console.md` |
| 13 | 面试形态（服务选择/四类显式区分/专项确认） | 21 | 84 | `interview-modality.md` |
| 14 | 作答辅助（答案建议/STAR 引导/不造假） | 32 | 88 | `answer-assist.md` |
| 15 | 3D 数字人面试官（3D→语音→文本降级阶梯） | 22 | 91 | `avatar-3d.md` |
| 16 | 兑换码/兑换服务（兑换 vs 充值·共享权益池·FIFO） | 41 | 104 | `redemption.md` |
| 17 | 面试历史（列表/详情/继续未完成/重看报告） | 13 | 93 | `interview-history.md` |
| 18 | 内部招聘骨架：架构笔记与申请状态 | 2 | 静态证明 | `bend-recruiter-architecture-surface.md` |
| | **合计** | **498** | **≈1625** | |

> 498 = 前 17 域历史估算 496 + 第 18 行内部招聘骨架 2。这是产品域历史估算，不是已实现计数，也不含横切/题库/教练文档。完整 55 份用例文档见 §7。

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

## 3. 第二批 7 块能力缺口（用例矩阵已补齐，不等于已落代码）

本节「补齐」**只指**用例与测试矩阵已经写成文档，并经过对抗评审收口；**不是**实现完成，也不是可发布。§4 仍要求三者齐备才可生成生产代码。不得把下表读成这 7 块已全部落地。

| 块 | 覆盖能力 | 文档 | 代码口径（不得用规格覆盖） |
|---|---|---|---|
| 1 | 首页营销区块 / FAQ / 联系 / 用户协议 / 隐私政策 / SEO(breadcrumb·sitemap·meta) / 反馈按钮 / 实时面试计数 | `marketing-legal-seo.md` | 存在 FAQ / legal / features 等部分预览或静态页；不等于该用例矩阵已全部落地，也不能当隐私或 SEO 承诺 |
| 2 | admin/运营后台：RBAC / 用户 / 订单 / 内容 / 运营位 / RLS 最小权限 / C 端隔离 | `admin-console.md` | 存在 `apps/web/app/admin` 运营页；不等于 RBAC/订单/内容/RLS 最小权限等用例已全部落地或可发布 |
| 3 | 面试服务细分：服务选择入口 + 简历押题/专项/行为/模拟四类显式区分 + SpecialInterviewConfirm | `interview-modality.md` | 未见该用例所写四类显式区分与 `SpecialInterviewConfirm` 的完整业务实现；不得读成已落地 |
| 4 | 作答辅助：答案建议/优化 + STAR 引导（不造假·不编经历·保留用户最终决定） | `answer-assist.md` | **仅设计，未落代码** |
| 5 | 3D 数字人面试官：多模态形象（语音口型/表情）+ 3D→语音→文本降级阶梯，不阻塞面试主路径 | `avatar-3d.md` | **仅设计，未落代码**（`apps/web/components/ui/avatar.tsx` 是通用头像组件，不是 3D 数字人面试官） |
| 6 | 兑换码/兑换服务：兑换 vs 充值双路径，对齐共享权益池 + FIFO 扣减 | `redemption.md` | **仅设计，未落代码** |
| 7 | 面试历史：列表 / 详情 / 继续未完成 / 重看报告 | `interview-history.md` | 存在 `apps/web/app/interviews` 列表/继续入口；不等于该用例矩阵已全部落地或可发布 |

## 4. 落代码前置条件

1. 用例 + 七类测试矩阵定稿（产品域历史估算 498 UC / ≈1625 TC = 前 17 域 496 + 第 18 行 2；其中第一批 10 领域 316/≈848，第二批 7 块计入**矩阵补齐**，不等于已落代码；已含失败-退款-重复-越权）。
2. [待拍板业务决策](../open-decisions.md)签字（计费口径、状态机增量、阈值标定、合规常量、范围）。
3. 依赖按 catalog 锁精确版本并通过关键冒烟；`packages/contracts`(共享 zod4 schema) 契约先行；状态机增量写入 `rules/global/status-machine.md` 并同步 `check-docs.mjs`。

三者齐备方可生成生产代码。

### 横切运行时用例

E2E 用例数/断言 parity 是测试控制面，不计入上表产品域估算，全文见 `e2e-parity-baseline.md`。
模型调用、模型操作路由、记忆治理、隐私删除、岗位题域路由、长时专家面试运行时和云测试运行器属于多个领域共用的承重契约，不计入上表按产品域的历史估算；新增或调整模型节点时必须同时满足 `model-invocation-reliability.md` 与 `model-operation-routing.md`，不能因图节点名称或适配器不同而绕过预算、授权、成本和降级验收。当前短流程长度政策只维护在 `adaptive-interview-length.md`（覆盖/证据/`decideNext`，软预算可上调，绝对杀开关默认 120 不是质量政策）；把数字从 8 调到 16 或把杀开关调到 120 都不等于 `INT-LONG-INTERVIEW-01`。控制流 weak/thrashing hook 只维护在 `interview-control-signals.md`（`observeInterviewSignals` → `early_weak` / `thrashing`），不是能力等级校准，不关闭 `INT-LEVEL-01`。长时面试的 transcript、恢复、级别校准、blueprint 和安全围栏必须同时满足 `expert-long-interview-runtime.md`；checkpoint/SSE/job payload 不得被当作用户历史或授权根。涉及后端、前端、测试、AI 等多题域题库时，必须先满足 `rag-funnel-intent-routing.md` 的轨道快照和数据面硬过滤；只有同桶正常完成且确认无合格题，才可按该用例的一次 LLM fallback 生成题。不能用语义相似度、分类建议或 generic fallback 替代隔离。公开预览必须同时满足 `architecture/devops/local-demo-deployment.md` 中 `UC-ecs-public-preview-web-ingress-01` 的回环网络、边缘方法门和 release 状态约束，以及 `public-preview-write-gate.md` 的面试/评分写面清单与失败关闭围栏；不得把 Web 页面、静态构建成功或本地 write-gate proof 解释为完整应用发布。`ecs-public-preview-web-ingress.md` 不在本目录（无独立用例文件）。记忆治理规格见 `memory-governance-and-recall.md`（当前为实现前规格，运行时仍是 lean memory，不开放跨会话写入）。

| 横切能力 | 文档 | 当前代码口径（不得用目标态覆盖） |
| --- | --- | --- |
| 公开预览写门禁 | `public-preview-write-gate.md` | 面试/评分写面清单 + fail-closed；本地 write-gate proof ≠ 发布 |
| C 端成长主页「已答题数」与列表进度 | `cend-overview-progress.md` | `issued_turns`=`status<>'cancelled'`；`Overview.answered`/`answered_turns`=`status='answered'`；禁止用 ScoreCard 空集把已作答伪装成 0 |
| INT-TRANSCRIPT-00 隐私诚实 | `expert-long-interview-runtime.md` / `checkpoint-privacy-erasure.md` | 公开 `DELETE /privacy/interview-data/:id` 仍 503；生产无公开 `/answers`（非预览 404）；签发器/0091 账本 ≠ 删除已开放 |
| RAG-FUNNEL-01A ACL | `rag-funnel-intent-routing.md` | `0124` 空 principal fail-closed；definer 闭包已密封；域 ACL 未接线；≠ routed serving / 发布证据 |
| 隐私删除 sink 盘点 | `privacy-deletion-sink-inventory.md` | `0125` 只收 `vector_chunk.kind='memory'`；公开 DELETE 仍 503；一份 completed ≠ 账户删除完成 |
| 自适应面试动态长度 | `adaptive-interview-length.md` | `decideNext` 覆盖/证据/早停/加深；软预算可上调；`absoluteMaxTurns` 默认 120 只防 runaway；≠ `INT-LONG-INTERVIEW-01` |
| SCOR-00H 消费诚实 | `interview-scoring-measurement.md` | 无 canonical identity 不得伪造 0 / mapped B 端 overall；转写/`POST` 评估/career/SSE 走域闸；GET 不重跑 |
| 答题双写互斥（0126） | `interview-answer-dual-write-fence.md` | 同一身份禁止 ledger artifact 与带顶层 `answer` 键的 legacy job 并存；`/turn` 无 ledger 时仍写明文；`submitInterviewAnswer` 不是生产 HTTP；≠ `INT-TRANSCRIPT-01`；隔离 prove 需 Docker，不进 always-on |
| 预览 OCR binding（0127） | `resume-ocr-binding.md` | `resume.ocr.v1` typed seam + 密封 provenance；双旗 `OCR_ENABLED=1`+`OCR_PREVIEW=1` 才可 invoke；生产仍关；≠ `MODEL-OP-01` 关闭；隔离 `ocr:prove` 不进 always-on |
| 面试公平调度（0128） | `worker-event-driven-dispatch.md` | `WORKER-DISPATCH-002`：owner 量子轮转 + 每 owner 未过期 running cap；进程内 global cap 不是集群锁；押题/诊断/报告仍抽干；静态 `interview-dispatch:unit:prove` / `interview-dispatch:gate:prove` 可进可选 always-on；隔离 `interview-dispatch:prove` 需远程 Postgres，不进 always-on。#96 关闭的是门 + 回执路径，不是远程 SQL 绿 |
| 隐私删除预览路径（0129） | `privacy-erasure-preview-path.md` | 预览版 `POST/GET /privacy/erasure-preview`；生产 DELETE 仍 503；回执 `preview_incomplete` / `productionSloClaimed=false`；静态 domain/contract prove 可进可选 always-on；隔离 `privacy-erasure-preview:prove` 需远程 Postgres，不进 always-on |
| 面试控制信号（SIGNAL-01 / 0130） | `interview-control-signals.md` | `observeInterviewSignals` 供 `decideNext` 消费 `early_weak` / `thrashing`；`safety_ceiling` 先赢；不是能力等级校准，不关闭 `INT-LEVEL-01`；SSE 预览见 `interview-signal-sse.md`；报告路径仍不读 `concludeReason`；静态 `adaptive-signals:prove` / `adaptive-signals-graph:prove` 可进可选 always-on |
| 预览批量语音（#79） | `cend-mock-interview.md` / `architecture/ai/voice-capability-boundary.md` | `createInterviewVoiceSeams` 仅 Key+wired 才构造 ASR/TTS；缺 Key/超时/畸形 fail-closed；`/speak/stream` 仍 503；Live E2E 拒 `VOICE_FAKE`/`ASR_FAKE`/`TTS_FAKE`；静态 `interview-voice-seams:prove` 可进可选 always-on；≠ 生产 SLO / 全双工 |
| 预览简历图片入口（#83） | `cend-resume.md` | Web `/resume` `isOcrPreviewEnabled` 精确双旗；关闭态无图片 accept；Server Action `image_ocr_unavailable`；不把 `text`/`transcript` 当成功转写；Live E2E 拒 `OCR_FAKE`；隔离 `ocr:prove` 不进 always-on；≠ 视觉 SLO |
| 出题 fail-closed（#67） | `model-operation-routing.md` | `QuestionGenerationResult` / `generation_unavailable`；缺 Key/超时/畸形/critique/原生 miss 不发明题面；leftover citation 丢弃 ≠ `interview_unavailable`；静态 `native-fail-closed:prove` / `question-generation-fail-closed:prove` 可进可选 always-on；≠ 发布证据 |
| 预览答题账本（#80） | `interview-answer-preview-submit.md` | 预览 `POST /interview/:id/answers` → 0092 `submitInterviewAnswer`；受 0126 围栏；非预览 404；≠ `INT-TRANSCRIPT-01`；隔离 `int-transcript-preview-submit:http:prove` **不进** always-on |
| SIGNAL-SSE 预览投影（#84） | `interview-signal-sse.md` | `early_weak`/`thrashing` → 既有 SSE `session_concluded`；不是终态、不是 `INT-LEVEL-01`、不发明分；静态 `signal-sse:prove` / `signal-sse-contract:prove` / `signal-sse-worker:prove` 可进可选 always-on |
| 受控记忆治理与召回 | `memory-governance-and-recall.md` | 实现前规格；运行时只有 lean memory（题面去重/弱项软排序）。跨会话写入未开放，≠ `MEM-00` 关闭 |
| 云端唯一依赖运行与迁移 | `cloud-runtime-and-migration.md` | 目标规范，不是已实现证明；不得把历史测试实例或本文写成已买云 / 已上线 |
| 简历擦除生命周期 | `resume-erasure-lifecycle.md` | 完整状态机尚未实现；公开删除入口仍 503 fail-closed |
| 岗位绑定面试无分终态 | `application-assessment-terminal.md` | 描述当前无分收口边界；不是 ScoreCard / 校准 / 人工复核门已关闭 |
| 全格式 RAG 语料平台 | `full-format-rag-platform.md` | proposed 规格；不得把尚未通过沙箱与评测门的格式写成已支持 |
| RAG 语料控制面身份隔离 | `rag-corpus-control-plane.md` | proposed 规格；不宣称已接入 C/B 热路径或组织授权已完成 |
| Agent 观测与评测闭环 | `agent-observability-evaluation.md` | approved_to_implement；Langfuse 不是业务事实或授权系统，≠ 评测门已关闭 |
| C/B 产品可上线性审查 | `product-readiness-c-b-audit.md` | 审查快照；「已证实」只指当时命令或调用链，≠ 100% HA / 发布就绪 |
| 规格-测试-回执追溯 | `quality-assurance-traceability.md` | draft；本文不运行测试、不授予发布权限 |

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

## 7. 完整文件清单（55 个用例文档）

本目录现有 55 个用例文档（不含本 README）。先前索引只覆盖其中 46 个；下表补全漏列的 9 个，并把已出现在 §1 / §4 / §5 / §6 的文档收成一份总目。状态是索引口径，不是发布证据，也不新增用例计数。

| 分组 | 文档 | 索引位置 | 口径 |
|---|---|---|---|
| 产品域 | `cend-identity-account.md`、`cend-resume.md`、`cend-quiz.md`、`cend-mock-interview.md`、`cend-report-growth.md`、`commerce.md`、`bend-recruiting.md`、`ai-safety-system.md`、`qbank-generation-lifecycle.md`、`frontend-ux.md`、`e2e-scenarios.md`、`marketing-legal-seo.md`、`admin-console.md`、`interview-modality.md`、`answer-assist.md`、`avatar-3d.md`、`redemption.md`、`interview-history.md`、`bend-recruiter-architecture-surface.md` | §1（19 份） | 历史产品域估算；其中第二批 7 块见 §3，不得一律读成已落地 |
| 横切 / 运行时契约 | `UC-interview-submit-answer.md`、`adaptive-interview-length.md`、`cend-overview-progress.md`、`checkpoint-privacy-erasure.md`、`e2e-parity-baseline.md`、`expert-long-interview-runtime.md`、`interview-answer-dual-write-fence.md`、`interview-answer-preview-submit.md`、`interview-control-signals.md`、`interview-scoring-measurement.md`、`interview-signal-sse.md`、`model-invocation-reliability.md`、`model-operation-routing.md`、`privacy-deletion-sink-inventory.md`、`privacy-erasure-preview-path.md`、`public-preview-write-gate.md`、`rag-funnel-intent-routing.md`、`resume-ocr-binding.md`、`worker-event-driven-dispatch.md` | §4 及 frontmatter | 不计入 §1 产品域估算；各行以 §4「当前代码口径」为准 |
| 先前未编入索引 | `agent-observability-evaluation.md`、`application-assessment-terminal.md`、`cloud-runtime-and-migration.md`、`full-format-rag-platform.md`、`memory-governance-and-recall.md`、`product-readiness-c-b-audit.md`、`quality-assurance-traceability.md`、`rag-corpus-control-plane.md`、`resume-erasure-lifecycle.md` | 已补入 §4 表 | 见上表各行；规格或审查文档 ≠ 对应能力已关闭或已上云 |
| 专家题库 | `interview-question-bank-agent-rag.md`、`interview-question-bank-reliability-security.md`、`interview-question-bank-product-bend.md` | §5 | 内部面试官材料，不是产品实现证明 |
| 教练材料 | `expert-interview-coach-agent-graph.md`、`expert-interview-coach-rag-runtime.md`、`expert-interview-coach-rag-ingestion-finetuning.md`、`expert-interview-coach-evaluation.md`、`expert-interview-coach-product-reliability.md` | §6 | 面向候选人的教练材料，需自行区分已实现与目标边界 |

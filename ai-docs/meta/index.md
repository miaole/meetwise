---
id: meta_index
name: ai-docs 索引
description: Meetwise AI 知识层入口，说明目录职责、阅读顺序和核心文档。
type: rule
scope: shared
level: guide
status: active
owner: architecture
version: 1
tags:
  - meta
  - index
---

# ai-docs 索引

## 核心入口

- `product/vision.md`：产品定位、目标用户、长期边界。
- `product/glossary.md`：统一术语。
- `product/domain-models/interview-career-domain.md`：领域模型。
- `product/workflows/core-workflows.md`：核心业务流程。
- `architecture/system-blueprint.md`：总体技术架构。
- `architecture/current-runtime-truth.md`：代码、文档与验证证据的事实矩阵；阅读架构前先看，目标态文档与它冲突时以它为准。
- `architecture/frontend/frontend-blueprint.md`：Next.js 前端架构、组件库、RSC 边界、SSE 消费。
- `architecture/ai/langgraph-blueprint.md`：LangGraph 编排方案。
- `architecture/ai/memory-context-design.md`：记忆分层、上下文封顶、语义压缩目标与实跑边界。
- `architecture/ai/tool-skill-memory-runtime-design.md`：Tools、Skills 与记忆运行时的当前能力边界、版本化工具平台和受控语义记忆设计。
- `architecture/ai/provider-egress-inventory.md`：模型、嵌入、语音与签名下载的当前直连出站静态清单；明确不等价于网关隔离或发布证据。
- `architecture/backend/public-preview-write-inventory.md`：公开预览下能写面试或评分状态的当前写面清单与失败关闭围栏；静态门，不是 ECS 或发布证据。
- `architecture/ai/privacy-deletion-sink-inventory.md`：删除回执必须覆盖的 sink 盘点（含 `vector_chunk` / memory / transcript 相邻落点）；公开删除在清单未齐前保持 503。
- `architecture/ai/rag-corpus-lifecycle.md`：RAG 语料/向量代际、更新删除、蓝绿迁移、影子评测与回滚的当前边界和目标方案。
- `architecture/ai/rag-funnel-routing.md`：后端、前端、测试、AI 等岗位题域如何冻结到面试，并在题库、检索、缓存和证据读取中硬过滤；同桶确认无合格题时如何受控由 LLM 出题的目标架构。
- `architecture/ai/rag-production-release-runbook.md`：RAG artifact 定义、量化发布门、稳定灰度、CAS 回滚、tombstone、缓存与灾备演练手册。
- `architecture/ai/full-format-rag-ingestion-and-chunking.md`：PDF/Office/图文/音视频的结构化摄取、切块、citation 回跳、题库关系与发布门。
- `architecture/ai/human-review-design.md`：人工校验、申诉、审核授权、四眼与幂等副作用的当前边界和目标架构。
- `architecture/ai/research-capability-gate.md`：面试 Agent 的 RAG、受限 Web/deep research 与内部 skills 实际能力边界。
- `architecture/devops/local-demo-deployment.md`：Docker Compose 本地演示和部署策略。
- `rules/global/ai-generated-review.md`：长期规则指针——AI 代码/输出必须审核并验证，不得默认信任；收束公式只维护在 `skills/testing/fail-closed-gate.md`。
- `testing/strategy/test-strategy.md`：测试策略。业务全链路以隔离 HTTP fetch/SSE（`e2e:isolated`）为主层，Playwright 只覆盖浏览器次层；与 runtime 事实冲突时以 runtime 为准。
- `testing/conventions/test-authoring.md`：用例→TC 编写规范与层映射（HTTP 主 / Playwright 次）。
- `testing/conventions/e2e-directory-contract.md`：HTTP E2E 的 helpers / 场景 / `scripts/run-e2e*` 目录契约；静态门 `pnpm e2e-platform:check`，种植违规证明 `pnpm e2e-platform:layout:prove`。
- `skills/README.md`：工作方法索引。当前只登记测试技能（draft）。
- `skills/testing/SKILL.md`：测试技能概述与铁律（`status: draft`）。
- `skills/testing/sop.md`：变更后审核 → 测试 → 回归仪式；未升格前保持 draft。
- `skills/testing/fail-closed-gate.md`：P0 fail-closed——AI 产物默认不可信，审核 ∧ 验证缺一阻断。
- `skills/testing/e2e-platform/README.md`：HTTP E2E 平台 SOP（draft / NOT_READY；`pnpm e2e-platform:prove` 是 5 守卫，不是 `layout:prove`）。
- `delivery/e2e-platform-integration.md`：E2E 平台集成分支的核实合并顺序、冲突决议与 supersession（draft PR，非 READY）。
- `testing/golden-tasks/README.md`：第一批 golden tasks 登记（含 planned/unmapped，无假绿）。
- `testing/e2e-parity-baseline.md`：`e2e/` 与约定关键 prove 的用例/断言身份基线与 parity floors；合法削减只走 allowlist。AI diffs 在 parity + 独立审核前不可信。
- `testing/e2e-performance-evidence.md`：全量隔离 E2E、本地性能预算与外部检索基准的实跑证据。
- `testing/rag-retrieval-evaluation-baseline.md`：RAG 检索实跑基线、测试集局限和发布边界。
- `testing/full-format-rag-evaluation.md`：全格式提取、切块、表格、citation 与检索的数据集、指标和发布协议。
- `delivery/resume-project-highlights.md`：已验证指标、简历项目亮点、面试追问卡与禁止夸大表述。
- `delivery/production-readiness-remediation-register.md`：测试、评测、演示与真实生产路径不等价时的整改登记、验收和关闭纪律。
- `delivery/execution-master-checklist.md`：所有已登记未闭环事项的依赖顺序、逐项执行清单和阶段出口；审阅后按此顺序实施。
- `delivery/lean-cd-deployment.md`：**当前生效**的精简单机 CD——CI 构建镜像(@sha256)→ACR→SSH→compose pull/migrate/up --wait/失败回滚。部署相关首看此文档。
- `observability/README.md`：AI、Graph、成本和质量观测。
- `requirements/use-cases/expert-interview-coach-agent-graph.md`：面向候选人的 LangGraph / Agent 图深度面试教练材料。
- `requirements/use-cases/expert-interview-coach-rag-runtime.md`：面向候选人的 RAG、Agent Runtime、流式性能深度面试教练材料。
- `requirements/use-cases/expert-interview-coach-rag-ingestion-finetuning.md`：全格式 RAG、数据清洗切块、题库建模与微调专家面试教练材料。
- `requirements/use-cases/expert-interview-coach-evaluation.md`：面向候选人的 LLM 评测、打分与统计校准深度面试教练材料。
- `requirements/use-cases/expert-interview-coach-product-reliability.md`：面向候选人的产品、支付、隐私、语音与可靠性深度面试教练材料。
- `requirements/use-cases/cend-overview-progress.md`：C 端成长主页「已答题数」与面试列表进度对齐题目账本，禁止用 ScoreCard 空集伪装成 0。
- `requirements/use-cases/resume-erasure-lifecycle.md`：简历擦除的稳定关联、围栏、B 端投影撤销与当前实现边界。
- `requirements/use-cases/model-invocation-reliability.md`：模型调用的准入、半开熔断、未知结果冻结与对账边界。
- `requirements/use-cases/model-operation-routing.md`：按业务操作选择文本、视觉、语音、embedding、rerank 和记忆派生能力，并冻结预算、成本、备用与降级语义。
- `requirements/use-cases/worker-event-driven-dispatch.md`：用户可见作业的提交后事件唤醒、低频恢复扫描、通知最小化与多副本领取边界。
- `requirements/use-cases/rag-funnel-intent-routing.md`：题库 metadata、自动岗位意图路由、面试 route snapshot、QBank track 硬过滤、同桶无题 LLM fallback 与自由文本漏斗分类的业务用例和验收矩阵。
- `architecture/ai/model-operation-routing.md`：模型节点矩阵、operation registry、总上下文预算、共享准入与“派发后不换模型”的目标架构及当前接线边界。
- `architecture/ai/bailian-nonproduction-rollout.md`：百炼非生产工作空间、Key、模型能力 smoke 与 `MODEL-OP` 整改的逐项勾选清单；不含密钥，也不构成生产网关或发布证据。
- `requirements/use-cases/interview-scoring-measurement.md`：面试评分的版本化 rubric、证据、确定性聚合、校准、复核与 C/B 用途边界。
- `requirements/use-cases/expert-long-interview-runtime.md`：长时专家面试的完整 transcript/恢复、能力等级校准、冻结 blueprint、Graph 安全控制面及其七类验收；当前为设计草案，未接线。
- `requirements/use-cases/adaptive-interview-length.md`：当前短流程面试图的动态长度（覆盖/证据/早停/加深；软预算可上调；绝对杀开关默认 120 是平台安全，不是质量政策）；不是一到两小时 blueprint。
- `architecture/ai/scoring-measurement-runtime.md`：当前评分链与伪评分旁路、目标 ScoreCard、难度/覆盖门和评分 operation 的运行时设计。

## 任务分流

| 任务类型 | 首入口 | 关键产物 |
| --- | --- | --- |
| 产品规划 | `product/vision.md` | 产品边界、用户、模块地图 |
| 需求落地 | `requirements/epics/` 或 `requirements/iterations/` | PRD、验收标准 |
| 业务建模 | `product/domain-models/` | 领域对象、状态机、关系 |
| AI 编排 | `architecture/ai/langgraph-blueprint.md` | graph、state、checkpoint、eval |
| 前端架构 | `architecture/frontend/` | 页面、组件、数据流、RSC 边界 |
| C 端进度/已答题数 | `requirements/use-cases/cend-overview-progress.md` | 题目账本投影、与 ScoreCard 分责 |
| 公开预览写门禁 | `architecture/backend/public-preview-write-inventory.md` | 面试/评分写面清单 + fail-closed；本地 proof ≠ 发布 |
| INT-TRANSCRIPT-00 隐私诚实 | `architecture/current-runtime-truth.md` | 公开 DELETE 仍 503；无 `/answers`；签发器落地 ≠ 删除权闭合 |
| RAG-FUNNEL-01A ACL | `rules/backend/qbank-control-definer-sealed-manifest.md` | 31/15/2 闭包 + `0124` 空 principal fail-closed；域 ACL 未接线；≠ routed serving |
| 后端架构 | `architecture/backend/` | 模块、接口、DB、事务、队列 |
| 云端部署(CD) | `delivery/lean-cd-deployment.md` | 精简单机 compose 部署、ACR、回滚 |
| 本地演示 | `architecture/devops/local-demo-deployment.md` | compose、seed、健康检查 |
| 测试设计 | `testing/strategy/test-strategy.md` + `testing/conventions/test-authoring.md` | 分层（HTTP 主 / Playwright 次）、TC 规范、golden tasks |
| 变更后测试/回归 | `skills/testing/sop.md` | 审核 → 选层 → 跑门 → `pnpm regression` → 出处；概述见 `skills/testing/SKILL.md` |
| E2E 平台集成（#55–#64） | `delivery/e2e-platform-integration.md` | 核实合并顺序、冲突决议、supersession；draft / 非 READY |
| AI 产物验收 | `skills/testing/fail-closed-gate.md` | 默认不可信；审核 ∧ 验证；多轮重开；无密钥。长期指针 `rules/global/ai-generated-review.md` |
| 隐私删除 sink 盘点 | `architecture/ai/privacy-deletion-sink-inventory.md` | `privacy_deletion_target.sink` 回执列、公开 503、未闭合缺口；用例在 `requirements/use-cases/privacy-deletion-sink-inventory.md` |
| 代码生成前确认 | `meta/task-sop.md` 的生成前门禁 | Task Harness |

## 新增文档规则

- 长期稳定业务共识放 `product/`。
- 单次或阶段性需求放 `requirements/`。
- 技术方案放 `architecture/`。
- 强约束放 `rules/`。
- 工作方法放 `skills/`。
- 测试策略和评测放 `testing/`。
- 发布、复盘和路线图放 `delivery/`。

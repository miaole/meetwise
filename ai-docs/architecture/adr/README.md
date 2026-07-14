---
id: architecture_adr_index
name: 架构决策登记册（ADR）
description: 项目关键架构决策的可追溯记录——每条含背景、决定、被否方案、后果。面试可辩护的载体。
type: reference
scope: shared
level: guide
status: active
owner: architecture
related:
  - ../system-blueprint.md
  - ../../delivery/production-backlog.md
---

# 架构决策登记册（ADR）

> 「可辩护」是这个项目的卖点。每条决策都记**背景 / 决定 / 被否方案 / 后果**，便于面试追问时给出取舍而非结论。复杂决策可拆为单独文件 `adr/NNNN-title.md`；本册先收口核心集。

格式：`状态` ∈ {accepted, superseded, proposed}。

---

### ADR-0001 技术栈 · accepted
**背景**：纯 AI 驱动的可恢复长会话面试系统。**决定**：Next.js App Router(web) + NestJS(api) + LangGraphJS(worker) + Postgres(+pgvector) + Redis + S3/MinIO。**被否**：Nuxt/Vue（前端定 Next）；纯 serverless（长会话+队列不适）。**后果**：单语言 TS 全栈，monorepo。

### ADR-0002 ORM = Prisma · accepted
**背景**：需迁移 + 约束 + 类型安全。**决定**：Prisma。**被否**：Drizzle（生态/迁移成熟度权衡后否）；裸 SQL（失类型安全）。**后果**：迁移用 Prisma Migrate；RLS 用 client extension 注入 `SET LOCAL`。

### ADR-0003 运行时状态 = LangGraph Postgres checkpointer · accepted
**背景**：可恢复长会话面试的运行态必须跨进程重启/多实例存活。**决定**：状态进 Postgres checkpointer，等待用户=持久 `waiting_user`。**被否**：内存 session map（进程重启/换实例即丢会话，不可恢复、不可多实例）。**后果**：durable/resumable/多实例安全；迁移需处理 checkpoint 结构（见 `runtime-migration.md`）。**这是项目的头号承重决策。**

### ADR-0004 契约 = 共享 zod4 schema + ZodValidationPipe + zod-openapi（**取代 ts-rest**） · superseded→accepted
**背景**：原定 ts-rest，但 must-smoke #2 实测 **ts-rest 稳定版(3.52) 只支持 zod3**，支持 zod4 的仅 3.53-**RC**；项目锁 zod4、要跑 10 年，承重契约层不赌 RC。**决定**：契约 = `packages/contracts` 的**共享 zod4 schema**（前后端 import 同一份拿类型，这才是"前后端共享"的本质）+ 后端**薄 `ZodValidationPipe`**（zod4 原生、零额外契约依赖）+ `zod-openapi`(zod^4) 按需生成 OpenAPI。**被否**：ts-rest（RC-only for zod4）、手写调用（漂移）、降级 zod3（zod4 是既定且更强）。**后果**：最少依赖、zod4 原生、十年稳定；已 must-smoke 验证（NestJS+Fastify+zod4 校验 3/3 通过）。契约变更走版本化（`api-versioning.md`，待补）。

### ADR-0005 模型 = 境内厂商 · accepted
**背景**：PIPL，简历/PII 不出境。**决定**：境内厂商模型；embedding 与生成都受 `agent-runtime` 区域门约束。**被否**：境外模型（合规不可）。**后果**：模型 catalog 带 `region` 字段，PII 命中 `oversea` 即 fail-closed。

### ADR-0006 不上 Vercel · accepted
**背景**：长会话 + 自建队列 + 境内合规。**决定**：不上 Vercel；队列用 Redis 上的 BullMQ/pg-boss。**被否**：Vercel（serverless 长会话/队列/出境不适）。**后果**：自管部署（见 ADR-0011）。

### ADR-0007 多租户隔离 = Postgres RLS（基线） · accepted
**背景**：B/C 两产品线物理隔离生死线。**决定**：RLS + principal 绑定 fail-closed 为统一基线（见 `rls-isolation.md`）。**被否**：纯应用层 where（易漏、不 fail-closed）。**后果**：B 端高敏是否再上 schema-per-tenant/独立库 = 待定（proposed，单列后续 ADR）。

### ADR-0008 长会话迁移 = ReleaseManifest pin · accepted
**背景**：版本变更时在飞长会话的评分口径一致性。**决定**：不可变 ReleaseManifest 快照 + 默认 `run_pinned`；拓扑变更走 Drain。**被否**：五制品独立轴（组合非法）；一律 follow（评分口径分裂）。**后果**：评分口径一致、已评结果持久不依赖重放（见 `runtime-migration.md`）。

### ADR-0009 多 agent = 主子，不用 swarm · accepted
**背景**：工作流是已知 DAG。**决定**：orchestrator-worker（报告维度扇出、B 端候选扇出、面试官/评分分离）。**被否**：swarm（去中心化对等交接，丢确定性/可观测/成本控制）。**后果**：子 agent 类型化契约 + 隔离 + 父子共享预算（见 `multi-agent-orchestration.md`）。

### ADR-0010 无跨租户共享题库 · accepted
**背景**：共享题库违反隔离、共享=泄题=信度归零、产品本是上下文生成非取题。**决定**：题按 (简历×JD×能力模型) 生成；企业题库是 org 私有可选导向资产，有完整生命周期（导入/裸题富化/版本 pin/采纳双签/PII 泛化）。**被否**：跨租户共享题库。**后果**：deepsearch = 长尾冷启动 provenance 之一（见 `product/question-bank-lifecycle.md`，待补）。

### ADR-0011 部署 = 单机 compose，不上 K8s/IaC · accepted
**背景**：demo/早期阶段。**决定**：compose.dev 单机全栈；规模化再上 K8s。**被否**：早期上 K8s/IaC（过度）。**后果**：环境晋级见 `ci-cd.md`；目标云为阿里云 + OSS（部署门禁见 deploy posture）。

### ADR-0012 语音排在文本可恢复骨架之后 · accepted
**背景**：语音是真实面试核心，但实时层（turn-taking/endpointing/延迟）复杂。**决定**：先做文本可恢复骨架，再叠语音热路径。**被否**：先上语音（状态机未稳即加实时复杂度）。**后果**：sequencing 而非降优先级（见 `voice-pipeline.md`，待补）。

### ADR-0013 内容审核 = 开源自托管分类器 + 薄业务桶 · accepted
**背景**：合规 + 面试域专属操纵识别。**决定**：开源自托管分类器为主 + 自建业务桶（刷分/造假/越界）；AIGC 备案/内容安全是另一条合规轨。**被否**：纯买（漏面试语义）；纯自建（过备案重）。**后果**：见 `classifier-router-tier.md` / `safety-defense-in-depth.md`。

### ADR-0014 编排引擎放在 OrchestrationPort 之后（十年可替换） · accepted
**背景**：项目跑 10 年，LangGraph 较年轻、十年内可能换代或被取代（修架构审计 #21）。**决定**：① 业务事实（已评结果/事件/审计/成本）一律落**业务表 + 事件账本**，**绝不只活在 graph state/checkpoint**；② `ai-graphs` 只 `import type` 编排接口，运行时图只活在 worker；③ 把编排能力抽象为薄 `OrchestrationPort`（编译图/启动/中断/恢复/checkpoint），LangGraph 是其当前实现。**被否**：节点/业务代码直接耦合 LangGraph 运行时类型（十年换引擎=重写+可能丢业务事实）。**后果**：届时换编排引擎只重写 port 实现，业务事实零丢失；checkpoint 迁移见 `runtime-migration.md`。见 `architecture/ai/agent-harness.md`。

### ADR-0015 自适应面试 agent 架构 · accepted
**背景**：面试 agent 必须是自适应的——下一题要取决于上一题答得如何,并具备工具/反思/接地能力。**决定**：自适应循环——规划官→能力模型决策(追问/换题/调难度/收尾)→CRAG 自纠检索(本地够好用本地/不行自主 web 探索)→接地出题(简历个性化+标源+不照搬+去重+对能力)→反思自检→角色拆分(各自 invoke+prompt 动静分离)→报告走舱壁。跑在 checkpointer + invoke 关口上。**被否**：固定题单 workflow(下一题与上一题无关,不自适应);LlamaIndex(TS 版 2026 已弃用,押死框架——保 LangGraph + 自实现 CRAG/agentic-RAG 模式);图内出报告(破坏舱壁隔离);qbank 每用户私有(策展真题=共享知识,公共读);热路径现爬(慢/脆/版权)。**后果**：~16 块 gate + 真 qwen 实跑验证;只有真跑才暴露的细节(fetchWithTimeout 漏 import/出题没传简历/幂等键须用持久 turn)全抓修。**详见 [`adr/0015-adaptive-agent-architecture.md`](./0015-adaptive-agent-architecture.md)。**

---

> 待补：ADR-0007 的 B 端物理隔离决策、API 版本化策略、密钥管理与 KMS。来源：原 `.tmp/decision-register.md`（D1–D22）合并去重，逐步补全。

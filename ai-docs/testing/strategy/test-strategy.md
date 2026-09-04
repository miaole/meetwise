---
id: testing_strategy
name: 测试策略
description: Meetwise 的单元、契约、集成、E2E 和 AI 评测策略。业务全链路以隔离 HTTP fetch/SSE 为主层，Playwright 只覆盖浏览器层。
type: testing
scope: shared
level: policy
status: active
owner: qa
version: 2
tags:
  - testing
  - strategy
related:
  - ../conventions/test-authoring.md
  - ../../skills/testing/SKILL.md
  - ../golden-tasks/README.md
  - ../e2e-performance-evidence.md
  - ../../rules/global/ai-generated-review.md
---

# 测试策略

## 分层

| 层 | 工具 | 目标 |
| --- | --- | --- |
| unit | Vitest/Jest | 纯函数、node、validator、domain policy |
| contract | 共享 zod4 schema + schema tests | 前后端接口不漂移 |
| integration | Supertest + Testcontainers | API + DB + Redis |
| graph | deterministic fixtures + fake model | LangGraph 状态、分支、恢复 |
| e2e (HTTP) **主层** | `e2e/full.e2e.ts` + `scripts/run-e2e.mjs`（fetch / SSE），入口 `pnpm e2e:isolated` | 真 API + worker + 隔离 Postgres + **真供应商**主链路；不是 Playwright |
| e2e (browser) **次层** | Playwright（`apps/web/e2e-ui/`），入口 `pnpm e2e:ui:isolated` | cookie / middleware / 页面流；需 production Next 与 live Key |
| ai eval | golden tasks（见 `testing/golden-tasks/`） | 模型输出质量、结构、事实一致性；未映射条目不得标绿 |
| security | 静态扫描 + 日志检查 | 密钥、PII、XSS、越权 |

## 主层与次层

业务端到端的**主层**是隔离 HTTP E2E：`pnpm e2e:isolated`。客户端是 `e2e/full.e2e.ts` 的 fetch / SSE，覆盖鉴权→简历→交易→面试→报告→B 端的契约、账本和终态事件。它不是 Playwright。

**次层**是浏览器 E2E：`pnpm e2e:ui:isolated`（Playwright，`apps/web/e2e-ui/`）。只证明 cookie、middleware、页面可见性和移动视口渲染。不能用 Playwright 冒充 HTTP 全链路，也不能用 HTTP E2E 冒充 cookie 或 DOM。

写 TC 的层映射见 [test-authoring](../conventions/test-authoring.md)。改完功能后怎么选层、怎么跑门见 [测试技能](../../skills/testing/SKILL.md)。

## AI 产物：审核 + 多轮验证（P0）

[AI 产物必须审核并验证](../../rules/global/ai-generated-review.md)：**不得默认信任** agent 写出的代码/测试/文档，也不得默认信任产品侧模型输出。先审核（对来源、用例、契约），再验证（自动化门禁）。鼓励自动化，且必须**多轮门禁**（生成 → 审核 → 跑门 → 修 → 再跑受影响的门）。一轮 `docs:check` 或单测绿不等于业务全链路过。密钥与敏感数据不得进仓库或日志。

## MVP 必测路径

- 登录 demo 用户。
- 上传/选择简历。
- 输入岗位/JD。
- 生成押题。
- 查看押题报告。
- 开始模拟面试。
- 回答一轮。
- 暂停/恢复。
- 结束并生成报告。
- 重启服务后恢复未完成会话。
- 权益扣减和失败退款。

上列路径默认用 HTTP 主层验收（状态机落点、账本、SSE 终态）。只有断言本身依赖浏览器 cookie、页面或移动布局时，才加跑 Playwright 次层。

## 变更后回归入口

功能改动后的审核 → 选层 → 跑门配方见 [`ai-docs/skills/testing/SKILL.md`](../../skills/testing/SKILL.md)。

```bash
pnpm regression            # 无 Key 的总是门（文档 / helpers / 回执 / 架构 / api smoke）
pnpm regression --core     # 行走骨架隔离 prove（需 Docker）
pnpm regression --live     # 真供应商 HTTP E2E；缺 MODEL_API_KEY 非零退出。浏览器层另跑 e2e:ui:isolated（需先构建 web）
```

per-push CI 跑隔离 prove，**不**跑 `e2e:isolated`。缺 Key 时记录 `not_run`，禁止 skip-as-pass。

## AI Golden Tasks

第一批已登记在 [`testing/golden-tasks/README.md`](../golden-tasks/README.md)，状态为 `mapped` / `partial` / `planned`，**没有**“已通过”项。

1. 前端开发岗位 + 有项目简历 -> 生成 8-12 个问题，包含项目深挖。`GT-01` **planned**。
2. 回答过短 -> 报告应指出表达不足，而不是给高分。`GT-02` **partial**（`scoring-golden:prove`）。
3. JD 要求 React/Next.js，简历缺 Next.js -> 能力差距必须出现 Next.js。`GT-03` **planned**。
4. 用户回答“不会” -> 追问策略应转为引导，不应幻觉用户掌握。`GT-04` **partial**。
5. 模型输出非法 JSON -> validator 拒绝；当前运行时派发后**不**自动重试。`GT-05` **mapped**（`runtime:prove`）。
6. 评分证据中的 quote 不属于本题答案 -> `unscored`，不得写入 0/50/99 等任何伪造分数。`GT-06` **mapped**（`scoring-integrity:prove`）。
7. 同 turn 给出不同 answer -> 评分幂等键不同；同答案重放 -> 缓存且不重打模型。`GT-07` **partial**（`turn-idempotency:prove` 覆盖同答案重放）。
8. 报告模型输出的 overall 与逐题 scores 不同、或 sections/段落重复 -> 拒绝；只允许服务端确定性聚合总分。`GT-08` **mapped**（`scoring-integrity:prove`）。

评分官的真模型评测、置信区间、非 happy-path 桶和绝对分校准边界见 [评分评测与校准发布协议](./scoring-evaluation-protocol.md)。它明确区分“链路不伪造分数”的确定性 proof 与“模型评分有效”的统计证据；未完成双盲人标与公平性切片前，分数不得作为 B 端自动决策。

RAG 检索的当前实跑基线、非 happy-path 桶和 pgvector HNSW 复核见 [RAG 检索评测基线与发布边界](../rag-retrieval-evaluation-baseline.md)。它要求报告当前数据集 revision、分子/分母、统计区间和生产边界，禁止把单一小集百分数表述为生产 RAG 质量。

## 禁止伪验收

- 只断言 HTTP 200。
- 只打开页面不走流程。
- 只用 mock model 证明生产模型质量。
- 只凭 AI 自评说报告合理。
- 只测 happy path 不测失败退款和重复请求。
- 把 Playwright 写成 HTTP 全链路的实现或唯一 E2E。
- 把 `planned` / `unmapped` golden-task 标成已通过。
- 默认信任 AI 代码/输出，或用 AI 自评代替审核与多轮门禁。

## 本地性能回归门

性能验证分为两类，禁止混写。

| 门禁 | 命令 | 真依赖 | 固定输入/预算 | 结论边界 |
| --- | --- | --- | --- | --- |
| API 突发 | `pnpm performance:e2e:isolated` | 真 HTTP、Nest API、PostgreSQL、密码哈希、worker 启动 | health 256 @ 32 并发 p95 < 500ms；products 128 @ 16 并发 p95 < 1000ms；signup 24 @ 4 并发 p95 < 3000ms；零非 2xx | 8 核/16GB 开发机回归预算，**不是**线上容量/SLA。 |
| 浏览器流式 | `pnpm e2e:ui:isolated` | production Next、Chromium、移动视口、SSE | 10,000 事件，80 个 DOM card，<15s | 渲染退化回归门，不代表真机 P95。 |
| 上下文压力 | `pnpm stress:prove` | 64 个迁移、真 PostgreSQL（关系型数据库）队列、当前自适应图、报告 worker（后台进程）；本地 HTTP echo（回显）模型适配器 | 输入 80,000 字；5 轮累计约 52k 字；单轮评估 ≤12,000 字；等长轮次输入极差 14 字；8k 答案消费后清除 | 上下文封顶/泄漏回归门，非真实模型质量、云容量或语义摘要基准。 |
| 外部检索 | `pnpm retrieval:benchmark [N]` | 数据集、embedding、reranker | 全局语料池，分别报 dense/hybrid/rerank | 必须记录模型版本、网络状态和费用；失败不可被本地 mock 代替。 |

本地性能门只允许对临时隔离 PostgreSQL 施压；针对生产环境、第三方模型、支付供应商或真实用户数据的负载测试必须先获得独立授权和目标 SLO。

## 影子数据库结构迁移状态

`packages/db/migrations/`（版本化迁移）是全新部署、隔离 E2E（端到端）和任何发布结论的唯一数据库真相。`packages/db/sql/` 只是旧 demo（演示）/单元 fixture（样本）的兼容镜像；`pnpm drift:prove` 只保证它不会比迁移路径**多出**列或唯一约束，不能反向证明它覆盖当前 schema（数据库结构）。

2026-08-10 的仓库盘点发现仍有 **7** 个测试或 smoke（冒烟）源文件直接执行该兼容镜像。其中支付权益 Saga（预留→确认→释放）、面试主链、长上下文压力、记忆模块、报告舱壁、押题、诊断、孤儿任务收割、OCR（光学字符识别）、模型优雅降级、简历摄取和 request ID（请求标识）已经分别迁至 64 个迁移的隔离运行器：`pnpm commerce:prove`（50/50）、`pnpm interview:prove`（11/11）、`pnpm stress:prove`（29/29）、`pnpm memory:prove`（11/11）、`pnpm report:prove`（36/36）、`pnpm quiz:prove`（25/25）、`pnpm diagnosis:prove`（35/35）、`pnpm reaper:prove`（28/28）、`pnpm ocr:prove`（15/15）、`pnpm adaptive-degrade:prove`（8/8）、`pnpm resume:prove`（32/32）、`pnpm reqid:prove`（10/10），十二份回执均标记 `releaseEvidence=false`。已退役固定题单的旧 `flow.proof.ts` 及会手读 `.env`、使用影子结构的 `flow:live`/`adaptive:live` 均已删除；`flow:prove` 仅为当前 `interview:prove` 的兼容别名。其余使用者（包含 vectorstore 和若干 smoke）在迁移前只能作为局部兼容测试，**不得**被写成当前生产 E2E、权限、删除或性能证据。

迁移顺序按风险而非文件数量执行：先改 CI（持续集成）中会创建面试/简历/模型调用的数据流测试，再改对外 smoke，最后删除无调用者的镜像。每个迁移后的用例必须：

- 由 `run-e2e-isolated.mjs` 应用完整迁移前缀，并用 `assertIsolatedTestTarget`（隔离目标断言）拒绝开发库/云库；
- 以当前 parent `(resume_id,resume_privacy_epoch)`（父面试的简历标识、隐私世代）建立面试，不得伪造 v49/v50/NULL 成功行；
- 在结果中区分“局部合同通过”和“发布证据”，前者绝不替代云端、故障注入或真实供应商测试。

## 隔离运行器自身的存活性

隔离运行器不是业务实现，却决定每一条本地 E2E（端到端）证据是否可信。任何创建临时 Docker（容器）数据库、探测就绪状态或收集受限诊断的子进程，都必须有固定的硬时限；超时必须终止**它自己创建的**进程组并使本次 gate（门禁）失败，不能无限等待、更不能继续执行迁移或业务断言。

| 用例 | 触发 | 验收 |
| --- | --- | --- |
| `TC-TEST-RUNNER-001` | 就绪探针子进程永久不退出 | 在硬时限内得到固定 `bounded_command_timeout`，子进程组不残留，测试不能被标记为通过。 |
| `TC-TEST-RUNNER-002` | 正常、短输出的探针 | 保留完整输出；不因超时机制误判失败。 |
| `TC-TEST-RUNNER-003` | 探针返回非零或输出超过受限缓冲区 | 只返回固定错误码和字节计数，不把 stdout（标准输出）/stderr（标准错误）中的 fixture（测试夹具）、端点、令牌或用户内容写入回执。 |

该自检只证明本地测试控制面能够收敛；它不提高业务功能、云端可用性或发布证据等级。

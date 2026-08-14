---
id: architecture_dependency_footprint
name: 全栈依赖足迹清单
description: 按工作区拆分的依赖清单（用途+数量+选型决策）。直接依赖去重≈110-125；安装锁精确版本走 pnpm catalog + syncpack。
type: reference
scope: shared
level: spec
status: active
owner: architecture
related:
  - ./adr/README.md
  - ../delivery/production-backlog.md
---

# 知面 Meetwise 依赖足迹清单（评审收口·最终版）

> 约定：版本安装时锁 latest（`pnpm add` 后写死精确版本）；跨区共享包统一走 **pnpm catalog**（`zod`/`typescript`/`vitest`/`langchain 系`/`opentelemetry 系`/`radix 系`/`date-fns`/`tsup`/`eslint` 等），由 `syncpack` 在 CI 校验不漂移；`workspace:*` 为内部包引用。Node 20+ / pnpm 9+。
> 本版已吸收架构评审：标 **【新增】** 为评审补入，**【删】** 为评审砍除，**【改】** 为替换，**【职责】** 为「无新包但必须登记的机制」。

---

## apps/web — Next.js App Router 前端

### dependencies
| 包 | 用途 |
|---|---|
| `next` | App Router 框架（RSC/Server Actions/路由） |
| `react` / `react-dom` | UI 运行时 |
| `next-intl` | 中英 i18n（服务端+客户端共享 message） |
| `@tanstack/react-query` | 服务端状态：拉取/缓存/重试，承载类型化 fetch 数据流 |
| `zustand` | 仅 UI 局部状态（弹窗/向导步进/SSE 连接态），不放业务真相 |
| `zod` | 表单与契约入参校验（复用 contracts schema） |
| `react-hook-form` | 表单状态与校验编排 |
| `@hookform/resolvers` | RHF × Zod 桥接 |
| `@radix-ui/react-*` | shadcn/ui 底层无样式原语（按用到的逐个装，约 10-15 个） |
| `class-variance-authority` | shadcn 变体样式编排 |
| `clsx` | className 条件拼接 |
| `tailwind-merge` | 合并冲突 Tailwind 类（`cn` 必备） |
| `lucide-react` | 图标集 |
| `sonner` | Toast 通知（SSE 事件/错误提示） |
| `cmdk` | 命令面板/可搜索下拉 |
| `recharts` | 能力曲线/成长档案/雷达图 |
| `@microsoft/fetch-event-source` | 健壮 SSE 客户端（POST/鉴权头/断线重连） |
| `date-fns` | **全仓统一日期库**（按 locale 出中英） |
| `nuqs` | URL query 状态同步（筛选/分页可分享、可回退） |
| `next-themes` | 明暗主题切换 |
| **【新增】** `@t3-oss/env-nextjs` | **前端 env schema 校验**（与 api 的 `@nestjs/config` 对齐；缺则线上缺变量变白屏） |
| **【新增】** `server-only` | 防 server 模块泄漏进 client bundle（密钥/服务端逻辑隔离） |

### devDependencies
| 包 | 用途 |
|---|---|
| `typescript` / `@types/react` / `@types/react-dom` / `@types/node` | 类型 |
| `tailwindcss`（**v4**） / `@tailwindcss/postcss` / `postcss` | 样式构建（v4 走 PostCSS 插件，无 `tailwind.config.js` 主链路） |
| `@tailwindcss/typography` | 报告/富文本 Markdown 排版 |
| **【改】** `tw-animate-css` | 替代 `tailwindcss-animate`（v4 兼容；旧包 v4 下用法已变） |
| `eslint` / `eslint-config-next` | Lint（继承 config 包） |
| `vitest` / `@vitejs/plugin-react` / `jsdom` | 单元/组件测试环境 |
| `@testing-library/react` / `@testing-library/user-event` / `@testing-library/jest-dom` | 组件交互测试 |
| `@playwright/test` | e2e 金路径（登录→简历→面试→报告，CI 守门） |
| `msw` | 前端测试 mock 网络（拦截 HTTP/SSE） |
| `@next/bundle-analyzer` | 包体分析 |
| **【新增】** `@tanstack/react-query-devtools` | 查询调试（dev） |

**小计：deps ~22（不含逐个 radix；含 radix ≈ 32-37），devDeps ~18 → 区合计 ~50-55**（zod4-native 契约，无 ts-rest 客户端）

---

## apps/api — NestJS 应用层

### dependencies
| 包 | 用途 |
|---|---|
| `@nestjs/core` / `@nestjs/common` | 框架核心/DI |
| `@nestjs/platform-fastify` | HTTP 适配（Fastify；**见决策⑤：must-smoke #2 已验 zod4 校验×Fastify 通过**） |
| `@nestjs/config` | 配置加载（env schema 校验） |
| `@nestjs/swagger` | OpenAPI 文档（对外/调试） |
| `@nestjs/throttler` | 限流（防刷、AI 调用前闸） |
| **【新增】** `@nest-lab/throttler-storage-redis` | **限流的 Redis storage**——默认内存计数多实例失效，AI 前闸必须跨实例 |
| `@nestjs/schedule` | 定时任务（语料生命周期/对账/清理） |
| `@nestjs/terminus` | 健康检查（DB/Redis/S3 探针） |
| `@nestjs/bullmq` / `bullmq` | 队列模块+核心（投递面试/报告/研究/匹配任务） |
| `@nestjs/event-emitter` | 应用内领域事件（状态机转移广播、解耦 observability） |
| `zod` / `nestjs-zod` | 共享 zod4 契约校验：薄 `ZodValidationPipe`（Body/Query）+ Nest 异常/swagger 集成 |
| `zod-openapi` | 由共享 zod4 schema 生成 OpenAPI（取代 @ts-rest/open-api，见 ADR-0004） |
| `@prisma/client` | DB 客户端（引用 db 包生成物） |
| `ioredis` | Redis（缓存/限流/分布式锁/BullMQ 连接/auth state-nonce/幂等存储） |
| `nestjs-i18n` | 后端 i18n（错误/邮件/通知中英） |
| `nestjs-pino` / `pino` / `pino-http` | 结构化日志（脱敏，绝不打全文简历/PII） |
| `@opentelemetry/api` / `@opentelemetry/sdk-node` / `@opentelemetry/auto-instrumentations-node` / `@opentelemetry/exporter-trace-otlp-http` | Trace 自动埋点 + OTLP 上报（接 Langfuse/Collector） |
| `@aws-sdk/client-s3` / `@aws-sdk/s3-request-presigner` | 对象存储 + **预签名直传**（简历原件/录音；直传故不需服务端 multipart） |
| `argon2` | 密码哈希（账密兜底） |
| `jose` | JWT 签发/校验（微信扫码后发 token） |
| **【新增】** `@fastify/csrf-protection` | **CSRF 防护**——HttpOnly cookie 承 JWT 必须配，原清单缺口 |
| `@fastify/cookie` / `@fastify/helmet` / `@fastify/cors` | Fastify 安全/cookie/CORS |
| `nanoid` | 短 ID（分享码/短码） |
| **【新增】** `ulid` | 订单号/幂等键（有序、利于索引局部性）；分享码留 `nanoid` |
| `reflect-metadata` / `rxjs` | Nest 装饰器元数据 + SSE Observable 底座 |
| `nodemailer` | 事务邮件（验证码/通知，dev 走 Mailhog） |

> 内部：`@meetwise/contracts`、`@meetwise/db`、`@meetwise/domain`、`@meetwise/config`（`workspace:*`）
> **【删】** `helmet`（Express 版，与 `@fastify/helmet` 冗余）、`cookie`（裸包，`@fastify/cookie` 已覆盖）、`class-validator`/`class-transformer`（走 nestjs-zod 全链路；仅某三方 Nest 模块强依赖时再按需补）、`dayjs`（统一 `date-fns`）。
> **【职责·无新包】**（1）**幂等层**：支付/下单端点用 Redis 幂等键（ULID）拦重复请求，覆盖「重复请求/失败退款」测试硬要求；（2）**auth 防回放**：微信扫码 state/nonce 存 Redis + auth 端点单独限流；（3）`prisma` CLI 归 `packages/db`，api 容器若需 `migrate deploy` 才单独留一份 dep（不三处悬空）。

### devDependencies
| 包 | 用途 |
|---|---|
| `@nestjs/cli` / `@nestjs/schematics` / `@nestjs/testing` | 脚手架/构建/测试容器 |
| `typescript` / `ts-node` / `tsconfig-paths` | TS 编译/路径 |
| `@swc/core` / `@swc/cli` | 快速编译（Nest SWC builder） |
| `vitest` / `supertest` | 单元 + HTTP 集成测试 |
| **【新增】** `vite-tsconfig-paths` | Vitest 解析 TS path alias（决策②自点，必装否则踩坑） |
| `@testcontainers/postgresql` / `@testcontainers/redis` / `testcontainers` | 真实 Postgres/Redis 集成（禁纯 mock 验收） |
| `@types/node` / `@types/supertest` / `@types/nodemailer` | 类型 |
| `eslint` | Lint（继承 config） |

**小计：deps ~38，devDeps ~17 → 区合计 ~55**

---

## apps/worker — LangGraphJS 图执行进程

### dependencies
| 包 | 用途 |
|---|---|
| `@langchain/langgraph` | 图编排核心（押题/模拟面试/职业路径/报告 四图） |
| `@langchain/langgraph-checkpoint` | Checkpoint 抽象（中断/恢复语义） |
| `@langchain/langgraph-checkpoint-postgres` | **Postgres checkpointer**（持久化 run-time 状态，多实例可恢复，禁内存 Map） |
| `@langchain/core` | message/runnable/tool 抽象 |
| `@langchain/openai` | OpenAI 兼容客户端（境内模型多兼容此协议，统一适配、便于多模型路由/降级） |
| **【改】** `@langchain/textsplitters` | 文本切分（RAG），替代顶层 `langchain` meta 包，避免拖入整坨传递依赖 |
| `langfuse` / `langfuse-langchain` | 追踪 SDK + Graph 回调自动埋点（trace/prompt 版本/score 落 `ai_invocation_traces`） |
| `bullmq` / `ioredis` | 消费 api 投递的任务队列 + Redis 连接/锁 |
| `pg` | Postgres 驱动（checkpointer + 业务读写） |
| `@prisma/client` | 业务事实写回业务表（图状态≠业务真相） |
| `zod` / `zod-to-json-schema` | 结构化输出 schema（第一道校验）+ 喂模型 JSON Schema |
| `@aws-sdk/client-s3` | 读简历原件/写报告产物 |
| `pino` | 结构化日志（脱敏） |
| `@opentelemetry/api` / `@opentelemetry/sdk-node` / `@opentelemetry/auto-instrumentations-node` / `@opentelemetry/exporter-trace-otlp-http` | Trace 上报（与 api 同套） |
| `nanoid` | 运行/分片 ID |
| `p-retry` | AI 调用重试/降级编排 |
| **【改】** `gpt-tokenizer` | token **粗估**（截断/预算预检），纯 JS 比 `tiktoken`(wasm) 轻；**计费/预算闸以模型 API 返回的真实 usage 为准**（BPE 对境内模型不准） |
| `pgvector` | pgvector 类型 JS 侧序列化（RAG 检索） |
| **【改】** `unpdf` | 解析 PDF 简历（替代失修易崩的 `pdf-parse`；简历摄取是金路径，不留单点） |
| `mammoth` | 解析 .docx 简历 |
| `cheerio` | 研究 agent 网页结构化解析 |

> 内部：`@meetwise/ai-graphs`、`@meetwise/contracts`、`@meetwise/db`、`@meetwise/domain`、`@meetwise/config`
> **【删/降级】** `langchain`（meta 包，已用 textsplitters 替代）、`@langchain/community`（重、可选 peer 一大片，确定具体 loader/向量集成再单装）、`undici`（Node 20 全局 fetch 即 undici，需连接池精控时再加）、`eventsource-parser`（`@langchain/openai` 自处理上游流式，确有绕过直连场景再加）、`tiktoken`（换 gpt-tokenizer）。

### devDependencies
| 包 | 用途 |
|---|---|
| `typescript` / `tsx` | 编译/本地运行 |
| `@swc/core` | 快速构建 |
| `vitest` | 图测试（确定性 fixtures + fake model） |
| **【新增】** `vite-tsconfig-paths` | Vitest 解析 path alias |
| `@types/node` / `@types/pg` | 类型 |
| `eslint` | Lint |

**小计：deps ~26，devDeps ~7 → 区合计 ~33**

> 备注：`@langchain/openai` 仅作兼容协议客户端；需厂商独有能力（特定语音/长上下文/缓存计费）时按区加专用 SDK 作可选 dep。语音（ASR/TTS）走云厂商 SDK 列可选 dep；浏览器录音用原生 `MediaRecorder`，无需 npm 包。

---

## packages/contracts — 共享 zod4 schema 契约（前后端唯一真相）

> ADR-0004：ts-rest 3.x 锁 zod^3、与 zod4 不兼容 → 弃用。契约 = 一份 zod4 schema，前端 import 拿类型+运行时校验、后端过 `ZodValidationPipe` 校验、`zod-openapi` 生成文档。零额外契约 DSL 依赖。

### dependencies
| 包 | 用途 |
|---|---|
| `zod` | schema 定义（输入/输出/枚举/状态），即契约本身 |

### devDependencies
| 包 | 用途 |
|---|---|
| `zod-openapi` | 由 zod4 schema 生成 OpenAPI |
| `typescript` / `vitest` / `tsup` | 类型 / 契约 schema 测试 / 打包（ESM+CJS+d.ts） |

**小计：deps 1，devDeps 4 → 区合计 5**

---

## packages/db — Prisma 数据层

### dependencies
| 包 | 用途 |
|---|---|
| `@prisma/client` | 生成的类型安全客户端（被 api/worker 复用） |
| `pgvector` | pgvector 列类型支持 |

### devDependencies
| 包 | 用途 |
|---|---|
| `prisma` | **CLI 真主场**（schema/migrate/generate；api 仅运行期按需另留一份） |
| `typescript` / `tsx` | 类型 / 跑 seed/migration 脚本 |
| `vitest` / `@testcontainers/postgresql` / `testcontainers` | 迁移/约束/RLS 策略测试（真库验证） |

**小计：deps 2，devDeps 6 → 区合计 8**

> 备注：RLS 策略与 pgvector 索引走原始 SQL migration（Prisma 不原生管 RLS），无额外 npm 包，migration 目录手写 SQL。
> **【明确不加】** `zod-prisma-types`——它让 Prisma schema 反向生成 Zod，等于把「DB 当 schema 真相源」，与本仓 **contract-first（`packages/contracts` Zod 为唯一真相）** 冲突，会制造双真相互相打架。故意不补。

---

## packages/ai-graphs — 图定义/节点/校验器（纯逻辑，无进程）

### dependencies
| 包 | 用途 |
|---|---|
| `@langchain/langgraph` / `@langchain/core` | 图/节点/状态 + message/runnable 抽象 |
| `@langchain/openai` | 模型兼容客户端 |
| `zod` / `zod-to-json-schema` | 结构化输出 + 业务双校验 + schema→JSON Schema |
| `langfuse` / `langfuse-langchain` | prompt 版本/trace 注入 |
| `p-retry` | 重试/降级原语 |

> 内部：`@meetwise/contracts`、`@meetwise/domain`、`@meetwise/config`

### devDependencies
| 包 | 用途 |
|---|---|
| `typescript` / `vitest` / `tsup` / `@types/node` | 类型 / 图单测（fake model + golden 夹具）/ 打包 |
| **【新增】** `vite-tsconfig-paths` | Vitest 解析 path alias |

**小计：deps 8（+内部3），devDeps 5 → 区合计 ~13**

> 说明：与 worker 拆分——ai-graphs 是**可测的纯图逻辑**（无 checkpointer/队列/IO），worker 注入 Postgres checkpointer + BullMQ 消费来运行它，便于确定性测试。

---

## packages/ui — shadcn 组件库

### dependencies
| 包 | 用途 |
|---|---|
| `@radix-ui/react-*` | 无样式原语（与 web 共享，集中此处锁版本） |
| `class-variance-authority` / `clsx` / `tailwind-merge` | 变体 + className 工具 |
| `lucide-react` | 图标 |

### peerDependencies
| 包 | 用途 |
|---|---|
| `react` / `react-dom` | 由消费方提供，避免双 React 实例 |

### devDependencies
| 包 | 用途 |
|---|---|
| `typescript` / `@types/react` | 类型 |
| `tailwindcss`(v4) / `@tailwindcss/postcss` | 样式构建 |
| `tsup` / `vitest` / `@testing-library/react` / `jsdom` | 打包 + 组件测试 |

**小计：deps ~5（不含逐个 radix），devDeps ~7 → 区合计 ~12-15**

> 备注：shadcn 走「复制源码进仓」而非 npm 安装组件；ui 包主要锁底层原语版本，`shadcn` CLI 仅在根作偶尔生成。

---

## packages/domain — 领域模型/状态机/不变量（贫依赖优先）

### dependencies
| 包 | 用途 |
|---|---|
| `zod` | 领域对象 schema/状态枚举校验 |

### devDependencies
| 包 | 用途 |
|---|---|
| `typescript` / `vitest` / `tsup` | 类型 / 状态机转移单测 / 打包 |

**小计：deps 1，devDeps 3 → 区合计 4**

> 说明：`Interview`/`AssessmentReport`/`PaymentOrder`/`ConsumptionRecord`/`AiGraphRun` 的状态枚举与合法转移表是**手写纯函数**，服务端复用校验。**不引 xstate**——见决策⑦：模拟面试的多阶段+中断+恢复+超时编排由 **LangGraph 本身**（checkpoint/interrupt/resume）承担，xstate 与之职责重叠。

---

## packages/config — 共享 eslint/tsconfig/tailwind/prettier

### devDependencies
| 包 | 用途 |
|---|---|
| `typescript` | 基础 tsconfig |
| `eslint` / `typescript-eslint` / `@eslint/js` / `globals` | flat config 核心 + TS lint + 推荐基线 + 全局集 |
| `eslint-config-prettier` / `eslint-plugin-import` / `eslint-plugin-unused-imports` / `eslint-plugin-n` | 关冲突规则 / import 顺序清理 / Node 规则 |
| `eslint-config-next` | Next 规则（供 web 继承） |
| `prettier` / `prettier-plugin-tailwindcss` | 格式化 + Tailwind 类排序 |
| **【新增】** `dependency-cruiser` | **机器强制架构不变量**：控制器不编排、ai-graphs 无 IO/checkpointer、图不碰支付/entitlements；CI 守门（Agent Architect 展示面加分项） |

**小计：~13 → 区合计 13**

> 说明：tsconfig/tailwind preset 多为 JSON/JS 文件，无独立 npm 包；config 包导出 eslint flat config 数组、`tsconfig.base.json`、`tailwind.preset`、`dependency-cruiser` 规则集。

---

## 根工作区（root devDependencies，全仓工具链）
| 包 | 用途 |
|---|---|
| `turbo` | Monorepo 任务编排/缓存（build/test/lint 拓扑） |
| `typescript` / `prettier` | 顶层版本统一（catalog）+ 全仓格式化 |
| `husky` / `lint-staged` | 提交钩子 |
| **【新增】** `@secretlint/secretlint`（或 `gitleaks` 二选一） | **pre-commit 密钥/PII 扫描**——直接对齐「绝不提交密钥/简历/PII」硬规则，lint-staged 挡不住 secret |
| **【新增】** `knip` | 检测未用依赖/导出（110+ 直接依赖，持续暴露过度依赖） |
| **【新增】** `syncpack` | CI 校验各 workspace 版本不漂移（catalog 统一的守门） |
| `@commitlint/cli` / `@commitlint/config-conventional` | 提交规范 |
| `vitest` / `@vitest/coverage-v8` | 顶层覆盖率聚合 |
| `shadcn` | 组件生成 CLI |
| `dotenv-cli` | 本地注入 env（仅 dev） |

> **【删】** `changesets`（`@changesets/cli`）——内部包全 `workspace:*` 不发布，纯负担；`cross-env`/`rimraf`/`npm-run-all2`——`turbo` 已做拓扑/并行编排，darwin 下 `cross-env` 基本用不上。
> `pnpm` 以 `packageManager` 字段声明，非 devDep。

**小计：~14**

---

## 数量总计（收口后）

| 工作区 | deps | devDeps | 小计 |
|---|---|---|---|
| apps/web | ~24（含 radix ~34-39） | ~18 | ~52-57 |
| apps/api | ~38 | ~17 | ~55 |
| apps/worker | ~26 | ~7 | ~33 |
| packages/contracts | 2 | 4 | 6 |
| packages/db | 2 | 6 | 8 |
| packages/ai-graphs | ~8（+内部3） | ~5 | ~13 |
| packages/ui | ~5（不含 radix） | ~7 | ~12-15 |
| packages/domain | 1 | 3 | 4 |
| packages/config | — | ~13 | ~13 |
| root | — | ~14 | ~14 |

**全仓直接依赖去重后约 110-125 个**（zod/typescript/vitest/langchain 系/opentelemetry 系/radix 系/date-fns 经 catalog 统一）。相比草稿净变化：**新增约 11 个**（throttler-redis、csrf-protection、@t3-oss/env-nextjs、server-only、react-query-devtools、ulid、vite-tsconfig-paths、dependency-cruiser、secretlint、knip、syncpack），**砍/替换约 13 个**（helmet/cookie/class-validator/class-transformer/changesets/langchain/@langchain/community/undici/eventsource-parser/tailwindcss-animate/tiktoken/pdf-parse/cross-env+rimraf+npm-run-all2，及 dayjs 并入 date-fns），**总量基本持平、质量提升**。含传递依赖的 node_modules 物理包预计 **1400-2000 个**（砍掉 `langchain` meta 与 `@langchain/community` 后较草稿收敛）。

---

## 关键选型分叉（最终定论，逐条进 ADR）

1. **队列 → BullMQ + Outbox（不换 pg-boss）**。叙事价值（背压/限速/重试可观测、Bull Board）契合 Agent Architect 展示面。**但 ADR 必须诚实写明：outbox 需要一个 relay/poller，是真实工作量，不是免费的；「outbox 是必交付项」写入验收**。工期紧时 pg-boss 的事务内入队可省掉整个 outbox，为可接受降级。

2. **测试 → 全仓 Vitest**，保留「api 单独退 Jest」逃生口写进 ADR。**前置必装 `vite-tsconfig-paths`**（已补进 api/worker/ai-graphs devDeps）。

3. **样式 → Tailwind v4 + `tw-animate-css`**。锁版本前确认 shadcn 当前发布线已支持 v4（2025 起已支持）；否则回退 v3 + 传统 config。

4. **Auth → 自建微信扫码 + jose**。**自建即自担三件事，已登记为职责**：(a) `@fastify/csrf-protection` CSRF 防护；(b) Redis 存 state/nonce 防回放；(c) auth 端点单独限流。不引重型 IAM；B 端若要 SSO/SAML 再独立部署 Authentik/Keycloak（不进 npm 依赖）。

5. **HTTP 适配 → Fastify（原清单最大隐藏风险，已消解）**。原风险来自 `@ts-rest/nest` 偏 Express；**ADR-0004 弃用 ts-rest 后该风险消失**。must-smoke #2 已实测 **NestJS×SWC×Fastify×类型DI + 薄 `ZodValidationPipe`(zod4) 校验 3/3 通过**（见 `api:smoke`），不再依赖任何 ts-rest×Fastify 协同。demo 量级 Fastify 吞吐优势用不上，真实收益是 SSE/schema 故事 + 类型 DI。

6. **模型客户端 → `@langchain/openai` 兼容层**（PIPL 合规端点多兼容 OpenAI 协议，避免锁厂商、便于多模型路由/降级）。**硬约束：token 计费/预算闸以模型 API 返回的真实 usage 为准**，`gpt-tokenizer` 仅本地粗估（BPE 对境内模型不准）。需厂商独有能力时按区加专用 SDK 作可选 dep。

7. **状态机 → 手写纯函数转移表，不引 xstate**。5 个业务 status 枚举手写转移表（贫依赖、服务端易复用易测）；运行态多阶段/中断/恢复/超时编排交给 **LangGraph**（即那台状态机），xstate 会职责重叠。

8. **语音 → 延后**。ASR/TTS 按选定境内厂商装可选 dep；浏览器录音用原生 `MediaRecorder`；实时转写若走 WebSocket 自写轻封装，避免重型依赖。

**另两条进 ADR 的工程决断（评审补强）：**
- **PDF 摄取**：`pdf-parse` 长期失修易崩，简历摄取是核心金路径，**已改 `unpdf`**（备选 `pdf2json`），不留单点。
- **幂等机制**：`nanoid`/`ulid` 只生成键，**幂等不是有包就有机制**——支付/下单端点必须落 Redis 幂等层（已登记为 api 职责），直接覆盖「重复请求/失败退款」测试硬要求；幂等键/订单号用 **ULID**（有序、索引局部性好），分享码留 `nanoid`。
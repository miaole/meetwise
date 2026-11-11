---
id: architecture_dependency_footprint
name: 全栈依赖足迹清单
description: 按工作区拆分的依赖清单（用途+数量+选型决策）。2026-11-11 已与 package.json、pnpm-lock.yaml 和源码 import 全量对账；「在用」以声明+实证为准。
type: reference
scope: shared
level: spec
status: active
owner: architecture
related:
  - ./adr/README.md
  - ../delivery/production-backlog.md
  - ./current-runtime-truth.md
---

# 知面 Meetwise 依赖足迹清单（与代码对账）

> **对账口径（2026-11-11）**：本页「在用」= 出现在对应 `package.json` 的直接依赖，并且（运行期包）有源码 `import`/`require`，或（工具链 / CSS 插件 / 框架副作用包）有脚本、配置或约定引用。lockfile 传递依赖不登记为直接依赖。#251 已勘误 Redis / BullMQ / throttler 相关行；本刀核对其余依赖与中间件声称，不符的改成实际状态。
>
> 运行与包管理：CI 使用 **Node 22**（`.github/workflows/ci.yml` 的 `node-version: 22`；仓库无 `.nvmrc` / `engines` 字段）；`packageManager` 钉死 **pnpm@10.18.0**；跨区共享版本走 `pnpm-workspace.yaml` 的 `catalog` / `catalogs.langchain`（`zod` / `typescript` / `@types/node` / `pg` / `@types/pg` / `redis` / LangGraph 系）。内部包为 `workspace:*`。
>
> 旧版「评审收口·最终版」里大量包是规划清单，并未安装。那些包改列在各区「历史规划、未安装」或「已声明但未见引用」，**不得再写成现行在用**。

---

## apps/web — Next.js App Router 前端

### 在用 dependencies

| 包 | 用途与实证 |
|---|---|
| `next` | App Router 框架。`apps/web/package.json`；多处 `from "next/..."`。 |
| `react` / `react-dom` | UI 运行时。有 import。 |
| `next-intl` | 中英 i18n。有 import。 |
| `zod` | 契约与入参校验（复用 `@meetwise/contracts` schema）。有 import。 |
| `@radix-ui/react-accordion` / `avatar` / `dialog` / `dropdown-menu` / `label` / `progress` / `scroll-area` / `select` / `separator` / `slot` / `tabs` / `tooltip` | shadcn 底层原语，共 12 个已装包，源码在 `apps/web/components/ui/*`（**没有**独立 `packages/ui` 包）。 |
| `class-variance-authority` / `clsx` / `tailwind-merge` | 变体与 `cn` 工具。`apps/web/lib/utils.ts` 等。 |
| `lucide-react` | 图标。多页引用。 |
| `sonner` | Toast。有 import。 |
| `qrcode` | 分享海报二维码。`apps/web/components/SharePoster.tsx`。 |
| `react-markdown` / `rehype-highlight` / `remark-gfm` | Markdown 渲染。`apps/web/components/MarkdownImpl.tsx`。 |
| `sharp` | Next Image 可选原生依赖，随 `next` 保留；仓内无直接 import。 |
| `tailwindcss-animate` | `apps/web/app/globals.css` 以 `@plugin "tailwindcss-animate"` 引用（**不是**文档旧写的 `tw-animate-css`）。 |
| `zod`（上已列） / `@meetwise/contracts` | 内部契约。`workspace:*`。 |

### 已声明、仓内无 import（不写成在用）

| 包 | 说明 |
|---|---|
| `@tanstack/react-query` | 在 `apps/web/package.json`，仓内无 `import`。不得写成「服务端状态在用」。 |
| `zustand` | 同上，仓内无 `import`。不得写成「UI 局部状态在用」。 |

### 在用 devDependencies

| 包 | 用途与实证 |
|---|---|
| `typescript` / `@types/react` / `@types/react-dom` / `@types/node` | 类型。 |
| `tailwindcss`（v4） / `@tailwindcss/postcss` | 样式构建；`apps/web/postcss.config.mjs`。`postcss` 本身不是直接依赖。 |
| `@playwright/test` | 浏览器 e2e（`e2e:ui:isolated`）。有 import。 |
| `tsx` / `typescript` | 本地脚本 / 类型。 |

### 历史规划、未安装

`react-hook-form`、`@hookform/resolvers`、`cmdk`、`recharts`、`@microsoft/fetch-event-source`、`date-fns`、`nuqs`、`next-themes`、`@t3-oss/env-nextjs`、`server-only`、`tw-animate-css`、`@tailwindcss/typography`、`eslint-config-next`（web 包内）、`vitest` / `@vitejs/plugin-react` / `jsdom`、`@testing-library/*`、`msw`、`@next/bundle-analyzer`、`@tanstack/react-query-devtools`：均不在 web 的 `package.json`，也不在 lockfile 直接依赖里。

中间件/能力实态：SSE 由 Next Route Handler + `fetch` 代理（`apps/web/app/api/**/events`、`apps/web/lib/api/events-proxy.ts`），**无** `@microsoft/fetch-event-source`。日期格式化走 `Intl.DateTimeFormat`（如 `apps/web/lib/interview/context.ts`），**无** `date-fns`。

**小计（package.json）：deps 31（含 12 个 radix），devDeps 8。**

---

## apps/api — NestJS + Fastify HTTP API

### 在用 dependencies

| 包 | 用途与实证 |
|---|---|
| `@nestjs/core` / `@nestjs/common` | 框架核心 / DI。`NestFactory.create`、`@Module` / `@Controller` / `@Injectable`。 |
| `@nestjs/platform-fastify` + `fastify` | HTTP 适配。`apps/api/src/main.ts`：`FastifyAdapter`。 |
| `reflect-metadata` | 装饰器元数据；`main.ts` 首行 `import 'reflect-metadata'`。 |
| `rxjs` | Nest 运行时必需；仓内无直接 `from 'rxjs'`，由框架使用。 |
| `zod` | 契约校验。薄 `ZodValidationPipe` 在 `apps/api/src/platform`，**无** `nestjs-zod` 包。 |
| `@swc-node/register` / `@swc/core` | 开发与证明脚本的 ESM 加载（`node --import @swc-node/register/esm-register`）。无 Nest CLI `nest start -b swc` 脚本。 |
| `typescript` | 运行期/类型（声明在 dependencies）。 |
| `@meetwise/contracts` / `@meetwise/db` / `@meetwise/domain` / `@meetwise/ai-runtime` / `@meetwise/ai-graphs` | 内部包。`workspace:*`。 |

### 已声明、仓内无 import

| 包 | 说明 |
|---|---|
| `@nestjs/platform-express` | 已钉版本，**零 import**。现行适配器是 Fastify，不得写成 Express 平台在用。 |

### 在用 devDependencies

| 包 | 用途 |
|---|---|
| `@types/node` | 类型。 |

### 中间件与能力实态（不要把规划包写成在用）

- **限流**：`apps/api/src/platform/rate-limit.service.ts`。全局 / IP 桶落 PG `platform_rl_bucket`，并发槽落 `platform_slot_lease`，二者的 DML 走迁移 **0189** 的 `SECURITY DEFINER` 网关函数（`gateway_rl_bucket_*` / `gateway_slot_lease_*`，经 `asGateway`）。**per-principal / email 桶仍在进程内**，不走 0189 网关函数（0189 头注释写明此分流）。Redis 限流未接线。`@nestjs/throttler`、`@nest-lab/throttler-storage-redis` **未安装、未引用**。
- **CORS**：`app.enableCors`（`main.ts`），生产必须配置 `WEB_ORIGIN`。无 `@fastify/cors` 包。
- **CSP / 点击劫持**：`main.ts` 手写 `content-security-policy`、`x-frame-options`。无 `@fastify/helmet`。
- **CSRF**：`@fastify/csrf-protection` **未安装**，源码无 CSRF 实现。**未落地**，不得写成「已登记职责即已实现」。
- **Cookie 插件**：无 `@fastify/cookie`。
- **鉴权**：`packages/domain/src/auth.ts` 用 `node:crypto` 的 **scrypt** 哈希 + **HMAC** 会话令牌。无 `jose`、无 `argon2`。微信扫码登录未作为已安装依赖或现行主路径。
- **防回放 / nonce**：api **无 Redis 客户端**，不在 Redis 存 state/nonce。这只说明「不走 Redis」，**不等于**已另建完善的 CSRF / 防回放中间件。
- **幂等**：支付 / 下单走 Postgres 唯一约束，例如 `entitlement_consumption(owner_user_id, idempotency_key)`（0001）和 `payment_order(owner_user_id, idempotency_key)`（0018 `uq_payment_order_idem`），不走 Redis。
- **日志**：Fastify 内置 pino（传递依赖，见 `main.ts` 注释）；无直接声明的 `pino` / `nestjs-pino` / `pino-http`。
- **OpenAPI**：`@meetwise/contracts` 的 `buildOpenApiDocument`（zod4 原生 `z.toJSONSchema`，包注释写明零外部文档依赖）+ `/docs` 用 Swagger UI CDN。无 `zod-openapi`、无 `@nestjs/swagger`。
- **配置**：无 `@nestjs/config`；环境校验为自研证明 / 启动检查。
- **健康检查**：自研 `health` 模块。无 `@nestjs/terminus`。
- **定时任务**：无 `@nestjs/schedule`。
- **领域事件包**：无 `@nestjs/event-emitter`。
- **对象存储客户端**：无 `@aws-sdk/client-s3` / 预签名包。简历原文落 PostgreSQL `resume_blob` + `pgcrypto`（`packages/db/src/resume/resume.ts`）。compose 里的 MinIO 是本地基础设施，应用客户端未接线。
- **邮件**：无 `nodemailer`；通知不是 SMTP 栈。compose 仍有 Mailhog 服务，应用未接线。
- **队列**：无 `@nestjs/bullmq` / `bullmq` / `pg-boss`。耐久队列是 Postgres 表 + `FOR UPDATE SKIP LOCKED`（ADR-0023）。
- **可观测直接依赖**：api 不直接声明 OpenTelemetry 包；Langfuse v5 OTel 在 `@meetwise/ai-runtime`。
- **i18n 后端包**：无 `nestjs-i18n`。
- **Prisma**：无 `@prisma/client` / `prisma`。数据面是 `pg`（在 `@meetwise/db`）。
- **短 ID 包**：无 `nanoid` / `ulid` 直接依赖。

### 历史规划、未安装（曾被写成在用）

`@nestjs/config`、`@nestjs/swagger`、`@nestjs/schedule`、`@nestjs/terminus`、`@nestjs/event-emitter`、`nestjs-zod`、`zod-openapi`、`@prisma/client`、`ioredis`、`nestjs-i18n`、`nestjs-pino` / `pino` / `pino-http`（直接依赖）、`@opentelemetry/*`（api 包内）、`@aws-sdk/*`、`argon2`、`jose`、`@fastify/csrf-protection`、`@fastify/cookie`、`@fastify/helmet`、`@fastify/cors`、`nanoid`、`ulid`、`nodemailer`、`@nestjs/cli` / `@nestjs/schematics` / `@nestjs/testing`、`ts-node` / `tsconfig-paths`、`@swc/cli`、`vitest` / `supertest`、`vite-tsconfig-paths`、`@testcontainers/*`、`testcontainers`。

**小计（package.json）：deps 16，devDeps 1。**

---

## apps/worker — LangGraph 图执行进程

### 在用 dependencies

| 包 | 用途与实证 |
|---|---|
| `@langchain/langgraph` | 图编排。多处 import。 |
| `@langchain/langgraph-checkpoint-postgres` | Postgres checkpointer。`apps/worker/src/main.ts`、`interview-consumer.ts`。 |
| `pg` | Postgres 驱动。 |
| `redis` | **唯一 Redis 客户端声明**（worker）。用于 RAG 热缓存（`rag-redis-cache.ts`）、嵌入计算缓存（`qbank-embedding-compute-seams.ts`）、以及默认关闭的 Streams 唤醒原型（`worker-job-wakeup-redis.ts`）。也用于云 smoke 的 Tair `PING`。**不是**任务队列，**不**承担限流 / auth nonce / 幂等。 |
| `zod` | schema。 |
| `@swc-node/register` / `@swc/core` / `typescript` | 加载与类型。 |
| `@meetwise/ai-graphs` / `@meetwise/ai-runtime` / `@meetwise/contracts` / `@meetwise/db` / `@meetwise/domain` | 内部包。 |

### 在用 devDependencies

| 包 | 用途 |
|---|---|
| `@types/node` / `@types/pg` / `tsx` | 类型与本地运行。 |

### 历史规划、未安装（曾被写成 worker 在用）

`@langchain/langgraph-checkpoint`（抽象包不在 worker 的 dependencies；只在 `packages/db` 的 devDependencies，供证明使用）、`@langchain/core`（worker 未直接声明）、`@langchain/openai`、`@langchain/textsplitters`、`langfuse` / `langfuse-langchain`（现行是 `@langfuse/*` v5，在 `ai-runtime`）、`@prisma/client`、`zod-to-json-schema`、`@aws-sdk/client-s3`、`pino`（直接依赖）、`@opentelemetry/*`（worker 包内）、`nanoid`、`p-retry`（非直接依赖）、`gpt-tokenizer`、`pgvector`（npm 包；向量能力是 Postgres 扩展，见下）、`unpdf`、`mammoth` / `pdf-parse`（在 `packages/domain`，不在 worker）、`cheerio`。

从队列表领取任务用 `pg` + `SKIP LOCKED` 与 `LISTEN/NOTIFY`（ADR-0023），不是 BullMQ。

**小计（package.json）：deps 13，devDeps 3。**

---

## packages/contracts — 共享 zod4 schema

### 在用

| 包 | 用途与实证 |
|---|---|
| `zod` | 契约本身。OpenAPI 由本包 `src/openapi.ts` 用 zod4 原生 `z.toJSONSchema` 生成，**无** `zod-openapi`、无 tsup / vitest 直接依赖。 |

devDependencies：`@types/node`、`typescript`。

**小计：deps 1，devDeps 2。**

---

## packages/db — 手写 SQL 迁移 + `pg`（不是 Prisma）

### 在用 dependencies

| 包 | 用途与实证 |
|---|---|
| `pg` | 唯一数据访问驱动。RLS / 队列 / 账本均经此。 |
| `tsx` | 迁移与脚本。 |
| `@meetwise/contracts` / `@meetwise/domain` / `@meetwise/errors` / `@meetwise/qdrant-store` | 内部包。qdrant-store 是可选检索后端原型，**不是**生产切流（见该包自身说明）。 |

### 在用 devDependencies

`@langchain/langgraph-checkpoint`、`@langchain/langgraph-checkpoint-postgres`（checkpoint 物理删除等证明）、`@types/node`、`@types/pg`、`typescript`。

**明确不在用：** `@prisma/client`、`prisma` CLI、npm 包 `pgvector`。向量检索用的是 Postgres 扩展 `vector`（`packages/db/migrations/0001_baseline.sql`：`CREATE EXTENSION IF NOT EXISTS vector`），JS 侧不经过 `pgvector` npm 包。

**小计：deps 6，devDeps 5。**

---

## packages/ai-graphs — 图定义（纯逻辑）

### 在用

| 包 | 用途与实证 |
|---|---|
| `@langchain/langgraph` | 图 / 节点 / 状态。 |
| `@meetwise/domain` | 领域类型与政策。 |
| `zod` | 仅声明在 **devDependencies**；`packages/ai-graphs/src` 无 `from 'zod'`。 |

无 `@langchain/core` 直接声明或 peer，无 `@langchain/openai`、`zod-to-json-schema`、`langfuse*`、`p-retry`。worker 注入 Postgres checkpointer 并消费 PG 表队列来运行本包。

**小计：deps 2，devDeps 4。**

---

## packages/ai-runtime — 模型调用关口（旧清单漏列）

### 在用 dependencies

| 包 | 用途与实证 |
|---|---|
| `@langfuse/client` / `@langfuse/otel` / `@langfuse/tracing` | Langfuse **v5**。`packages/ai-runtime/src/langfuse-v5.ts` 等。 |
| `@opentelemetry/sdk-node` | 与 Langfuse OTel 适配器一起用。 |
| `ipaddr.js` | SSRF / 地址校验。`packages/ai-runtime/src/voice.ts`。 |
| `zod` | schema。 |
| `@meetwise/db` / `@meetwise/domain` / `@meetwise/errors` | 内部包。 |

devDependencies：`@types/node`、`tsx`、`typescript`。

旧文把 `langfuse` / `langfuse-langchain` 和一整套 `@opentelemetry/*` 写在 api/worker 下，与现行不符：直接依赖在本包，且是 Langfuse v5 作用域包，不是 `langfuse-langchain`。

**小计：deps 9，devDeps 3。**

---

## packages/domain — 领域模型与简历解析

### 在用 dependencies

| 包 | 用途与实证 |
|---|---|
| `@meetwise/contracts` | 契约类型。 |
| `mammoth` | 解析 .docx。`packages/domain/src/resume-extract-child.ts`。 |
| `pdf-parse` | 解析 PDF。同一文件。**并未**改成 `unpdf`（`unpdf` 未安装）。 |

`zod` **不是** domain 的直接依赖（经 contracts 使用）。无 `xstate`、无 tsup / vitest 直接依赖。

devDependencies：`@types/node`、`typescript`。

**小计：deps 3，devDeps 2。**

---

## packages/errors — 共享错误类型（旧清单漏列）

无运行期依赖。devDependencies：`@types/node`、`tsx`、`typescript`。被 `ai-runtime`、`db` 引用。

**小计：deps 0，devDeps 3。**

---

## packages/qdrant-store — Qdrant 原型（旧清单漏列，非生产切流）

无运行期 npm 依赖。自研 `fetch` HTTP 客户端（`packages/qdrant-store/src/client.ts`），**无** `@qdrant/*` SDK。包说明写明：不切走 pgvector / `annSearch`，Not HA，≠ 0091 可写账本。compose 本地可起 Qdrant，不得写成生产向量主存储。

devDependencies：`@types/node`、`tsx`、`typescript`。

**小计：deps 0，devDeps 3。**

---

## packages/db-mysql — MySQL 骨架（旧清单漏列，未切流）

无 npm 依赖。只为 `docker/compose.mysql-local.yml` 提供最小 schema。**不是** Postgres 迁移的移植，**不等于** RLS。`releaseEvidence=false`。不得写成现行业务库。

**小计：deps 0，devDeps 0。**

---

## packages/ui — 不存在

仓库没有 `packages/ui`。shadcn 组件源码在 `apps/web/components/ui`，原语版本锁在 `apps/web` 的 `@radix-ui/react-*`。旧清单把 ui 包写成在用，已更正。

---

## packages/config — eslint / prettier 共享配置

### 在用 devDependencies

| 包 | 用途与实证 |
|---|---|
| `eslint` / `eslint-plugin-import` / `typescript-eslint` | `packages/config/eslint.config.base.mjs`。 |
| `prettier` | `packages/config/prettier.config.mjs`。 |

**未安装（曾被写成在用）：** `@eslint/js`、`globals`、`eslint-config-prettier`、`eslint-plugin-unused-imports`、`eslint-plugin-n`、`eslint-config-next`、`prettier-plugin-tailwindcss`。`dependency-cruiser` 在**根** devDependencies，不在本包。`zod` 不是本包依赖；各 app 并不 `import '@meetwise/config'` 作为 workspace 运行时依赖（eslint 配置用相对路径）。

**小计：deps 0，devDeps 4。**

---

## 根工作区（root devDependencies）

| 包 | 用途与实证 |
|---|---|
| `turbo` | monorepo 任务编排。 |
| `typescript` / `@types/node` | 顶层类型。 |
| `eslint` | 全仓 lint。 |
| `tsx` | 脚本。 |
| `esbuild` | 部分打包脚本（如 `scripts/build-cloud-smoke-fc.mjs`）。 |
| `dependency-cruiser` | 架构约束（根级配置）。 |

root **无** `dependencies`。**未安装（曾被写成在用）：** `prettier`（在 config 包）、`husky`、`lint-staged`、`@secretlint/secretlint` / `gitleaks`、`knip`、`syncpack`、`@commitlint/*`、`vitest` / `@vitest/coverage-v8`、`shadcn` CLI、`dotenv-cli`。`pnpm` 以 `packageManager` 声明，非 devDep。

**小计：deps 0，devDeps 7。**

---

## 数量总计（对账后，按各 package.json 直接依赖计）

| 工作区 | deps | devDeps | 小计 | 备注 |
|---|---|---|---|---|
| apps/web | 31（含 12 个 radix） | 8 | 39 | 含 2 个已声明无 import 的包 |
| apps/api | 16 | 1 | 17 | 含 platform-express 残留声明 |
| apps/worker | 13 | 3 | 16 | |
| packages/contracts | 1 | 2 | 3 | |
| packages/db | 6 | 5 | 11 | 含内部包 |
| packages/ai-graphs | 2 | 4 | 6 | |
| packages/ai-runtime | 9 | 3 | 12 | 旧清单漏列 |
| packages/domain | 3 | 2 | 5 | |
| packages/errors | 0 | 3 | 3 | 旧清单漏列 |
| packages/qdrant-store | 0 | 3 | 3 | 旧清单漏列；非生产切流 |
| packages/db-mysql | 0 | 0 | 0 | 旧清单漏列；未切流 |
| packages/config | 0 | 4 | 4 | |
| packages/ui | — | — | 0 | **包不存在** |
| root | 0 | 7 | 7 | |

**全仓直接依赖去重（不含 `@meetwise/*` 内部包）共 67 个包名**（其中 12 个是 `@radix-ui/react-*`）。旧文「约 110–125」和「新增 throttler-redis / csrf-protection / env-nextjs / secretlint / knip / syncpack 等 11 个」是规划账，不是现行安装面。

---

## 关键选型分叉（现行，不是规划稿）

1. **队列 → PG 表队列（`FOR UPDATE SKIP LOCKED`）+ 已落地的 commerce outbox。** 旧定论「BullMQ + Outbox（不换 pg-boss）」是草稿期选型叙事。`bullmq` / `@nestjs/bullmq` / `pg-boss` 不在依赖声明里，也没有运行时 import。领取见 `packages/db/src/interview/interview-jobs.ts`、`packages/db/src/jobs/*`、`packages/db/src/report/report.ts`；选型见 ADR-0023。outbox 需要真实 relay/poller（`commerce_outbox` + `settleOutbox` + commerce-reconciler），不是免费的。pg-boss 事务内入队的旧降级叙事只作历史记录。

2. **测试 → 以具名 prove / 隔离 runner / Playwright 为主**，不是「全仓 Vitest 已装」。根和各主要包的 `package.json` **没有** `vitest` 直接依赖。api 也没有 Jest。不得把规划中的 Vitest 写成现行工具链。

3. **样式 → Tailwind v4 + `tailwindcss-animate`（CSS `@plugin`）**。未安装 `tw-animate-css`。

4. **Auth → 自建账密（scrypt + HMAC 令牌），不是 jose / 微信扫码已落地。** CSRF（`@fastify/csrf-protection`）**未安装、未落地**。防回放不走 Redis（api 无 Redis 客户端），但不要把「不走 Redis」写成 CSRF / 防回放职责已实现。(c) 端点限流走 `RateLimitService` / PG 共享桶表，Redis 限流未接线。不引重型 IAM。

5. **HTTP 适配 → NestJS × Fastify（`@nestjs/platform-fastify` + `fastify`）。** 无 ts-rest。OpenAPI 由 contracts 自研生成。`@nestjs/platform-express` 仅为残留声明。

6. **模型客户端 → 自研调用关口在 `@meetwise/ai-runtime`（invoke / 准入 / 对账），不是 `@langchain/openai` 包。** 计费 / 预算闸以模型 API 返回的真实 usage 为准。仓内无 `gpt-tokenizer` 直接依赖。

7. **状态机 → 手写纯函数转移表，不引 xstate。** 运行态多阶段 / 中断 / 恢复交给 LangGraph。

8. **语音 → 预览缝已接线，生产默认 fail-closed。** 无独立 ASR/TTS npm 厂商 SDK 作为直接依赖；浏览器录音用原生 `MediaRecorder`。细节以 `current-runtime-truth.md` 为准。

**工程实态（纠正旧「已改 / 已补」表述）：**

- **PDF 摄取**：现行是 `pdf-parse`（`packages/domain`），**不是** `unpdf`。
- **幂等机制**：`nanoid` / `ulid` 均未作为直接依赖安装。支付 / 下单幂等落 Postgres 约束，如 `entitlement_consumption(owner_user_id, idempotency_key)` 与 `payment_order(owner_user_id, idempotency_key)`，不走 Redis。
- **数据层**：手写 SQL migration + `pg`，不是 Prisma / Drizzle。
- **Redis/Tair**：只在 worker 声明 `redis` 包，用于 RAG 热缓存、嵌入计算缓存与单飞锁（及默认关闭的 Streams 唤醒原型）。限流当前落 PG 共享桶表，Redis 限流未接线。

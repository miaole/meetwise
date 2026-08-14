---
id: architecture_devops_infra_blueprint
name: 工程基建蓝图（评审定稿·可执行脚手架）
description: monorepo 结构/包边界 DAG、workspace+catalog 依赖归位、构建工具链(全 ESM + NestJS 走 SWC)、tsconfig 继承、dependency-cruiser 强约束、env、测试基建、脚手架步骤与 must-smoke 闸门。落代码前的工程地基。
type: reference
scope: shared
level: spec
status: active
owner: architecture
related:
  - ./ci-cd.md
  - ../dependency-footprint.md
  - ../backend/module-boundaries.md
  - ../../delivery/production-backlog.md
---

# 知面 Meetwise · 工程基建蓝图（定稿·可执行）

本蓝图综合各块设计与对抗评审，已就评审暴露的 P0 矛盾逐条拍板。凡评审标"落地即崩/自相矛盾"处，本稿给出唯一定调 + 锁版前 must-smoke 闸门。

---

## 0. 三条全局定调（先消除块间矛盾）

1. **全仓 ESM-first（含 api）**。理由：footprint 已锁 Fastify + `nanoid`/`jose` 等 ESM-only 依赖，worker/web/ai-graphs/langchain 全 ESM；选 CJS-api 会逼出叶库 dual-format（dual-package hazard）+ 撞 `tsc module:CommonJS×moduleResolution:NodeNext` 非法组合 + `require(ESM-only langchain)` 崩。全 ESM 后**叶库一律 esm-only，删掉所有 dual-format**。代价是 SWC×ESM×装饰器元数据未经实测——列为**锁版前 must-smoke #1**，不过则退 CJS-api（删 `type:module`，叶库才补 `require` 条件）。
2. **api 编译链 = SWC（dev 与 prod 同源）**，`tsc` 只做 `--noEmit` 类型权威。dev `nest start -b swc --watch`，prod `nest build -b swc`（**不用 tsc 出 prod**，避免 NodeNext 扩展名 dev/prod skew）。这根治"tsx 不发装饰器元数据→被迫字符串 token"。tsx 仅留给**无装饰器**场景（worker dev、db seed、脚本）。
3. **图 IO 边界**：`ai-graphs` 纯逻辑，运行期不碰 IO、不碰 langchain 运行时；**api↔ai-graphs 仅 `import type`**，图的运行时只活在 worker（注入 PostgresSaver + 模型）。这同时解掉"CJS api require langchain"与"图改 entitlements"两个雷。

---

## 1. 最终目录结构

```
meetwise/
├── apps/
│   ├── web/        @meetwise/web      Next App Router  (next dev/build)
│   ├── api/        @meetwise/api      NestJS+Fastify   (nest start/build -b swc, ESM)
│   └── worker/     @meetwise/worker   LangGraphJS 进程 (tsx watch / swc 编译出 dist)
├── packages/
│   ├── config/        @meetwise/config        tsconfig/eslint/tailwind preset + ./env (zod 片段)
│   ├── domain/        @meetwise/domain        状态机/枚举/不变量 (叶, 仅 zod)
│   ├── contracts/     @meetwise/contracts     zod4 schema 契约 (→domain)
│   ├── db/            @meetwise/db            Prisma client 封装 + 迁移 + raw pg(RLS)
│   ├── ai-graphs/     @meetwise/ai-graphs     纯图/节点 (→domain; @langchain/core peer)
│   ├── ai-runtime/    @meetwise/ai-runtime    模型调用关口: invoke 双校验/重试/幂等 trace + router/validators/catalog (→db)
│   ├── ui/            @meetwise/ui            shadcn 组件 (react peer)
│   ├── observability/ @meetwise/observability 共享脱敏 logger/otel (叶, pino/otel)
│   └── testkit/       @meetwise/testkit       测试夹具/fake-model/pg helper (test-only)
├── turbo.json
├── .dependency-cruiser.cjs        # 根级（不进被构建包，避免自举）
├── .npmrc · .nvmrc · .gitleaks.toml
├── pnpm-workspace.yaml            # 含 catalog；删除 ai-docs 条目
└── package.json                   # 仅工具链 devDeps + turbo 委托脚本
```

**依赖 DAG（唯一向下，dep-cruiser 守）：**
```
L2 apps:   web      api          worker
L1 mid:    ui   ai-graphs   ai-runtime   db
L0.5:      contracts ─→ domain
L0 leaf:   domain   config   observability        (互不依赖)
testkit:   test-only，对业务包仅 import type
```
- web→{contracts,ui,config}；api→{contracts,db,domain,observability,config}；worker→{ai-graphs,ai-runtime,contracts,db,domain,observability,config}
- ai-graphs→{domain}（**不依赖 contracts/db**：节点纯逻辑，模型经注入）
- ai-runtime→{db}（模型调用**关口**：invoke 双校验/重试/幂等 trace；写 ai_invocation_trace、用 db 的 Client 类型；worker 注入它驱动图）
- contracts→domain（**枚举唯一家在 domain，contracts import 之**，杜绝枚举漂移）
- packages 永不依赖 apps；apps 之间永不互 import（只经 contracts 对齐类型，运行期靠 HTTP/SSE/队列）

**各 package.json 要点：**

| 包 | type | exports/产物 | 关键依赖位 |
|---|---|---|---|
| config | module | `./tsconfig/*`、`./eslint`、`./tailwind`、`./env`(zod 片段, tsup 出 dist) | dep: zod(catalog) |
| domain | module | esm-only dist + dts (tsup/tsc -b) | dep: zod 仅此一项 |
| contracts | module | esm-only | dep: zod(catalog)；workspace: domain |
| db | module | esm-only；`build: prisma generate && tsup` | dep: @prisma/client, pg, pgvector |
| ai-graphs | module | esm-only | dep: @langchain/langgraph(catalog)；**@langchain/core 走 peer** |
| ai-runtime | module | esm-only | dep: zod(catalog)；workspace: db（关口公共面只导出 invoke，禁深链 router/validators/catalog） |
| ui | module | esm-only + `./styles.css` | **react/react-dom 走 peerDependencies(>=19)** |
| observability | module | esm-only | dep: pino, @opentelemetry/* |
| api | module | 无 exports；`build: nest build -b swc` | dep: @nestjs/*, @fastify/*, reflect-metadata, rxjs + workspace 内部包 |
| worker | module | 无 exports；prod swc 编译出 dist | dep: @langchain/*, bullmq, ioredis, pg + 内部包 |
| web | — | Next 自管 | dep: next, react + 内部包 |
| testkit | module | test-only，私有，无运行期产物 | devDep workspace:*；业务包仅 type |

叶库分发：**dist + `^build` 拓扑**（非 source-export）——SWC 不编 node_modules 里的 .ts，source-export 会让 api 解析不到；代价用 turbo `^build` + `predev` 兜（§4/§7）。

---

## 2. 工具链决策定稿（每条带理由）

| 决策 | 定调 | 理由 |
|---|---|---|
| **NestJS 运行/构建** | dev `nest start -b swc --watch`，prod `nest build -b swc`，run `node dist/main.js` | SWC 既发装饰器元数据又快；dev/prod 同源避免 skew；tsc-NodeNext-ESM 的扩展名雷被绕开 |
| **emitDecoratorMetadata 谁发** | **SWC**（`.swcrc`: `legacyDecorator:true`+`decoratorMetadata:true`+`keepClassNames:true`+`useDefineForClassFields:false`），tsc 仅 `--noEmit` 查类型，**Vitest 走 `unplugin-swc`** | esbuild/tsx 物理不发 `design:paramtypes`；测试层同源，否则 DI 测试复发。`reflect-metadata` 必须 main.ts 首行 + vitest `setupFiles` |
| **type-only import 防擦除** | api/worker(server) 包**关掉** `verbatimModuleSyntax` 与 eslint `consistent-type-imports`；被注入类必须值 import | 否则 lint `--fix` 把注入类改成 `import type`→元数据退化为 `Object`→DI 再挂（每次 commit 自毁）。`verbatimModuleSyntax` 只在无装饰器叶库开 |
| **ESM/CJS 每 app** | web=ESM(Next)，worker=ESM，**api=ESM**(`.swcrc module.type:es6`)；叶库 esm-only | 见 §0.1；全 ESM 删 dual-format |
| **worker prod 构建** | swc/tsc **编译不打包**（非 tsup bundle） | tsup 默认内联 langchain/checkpoint-postgres，大量动态 require 打包后易碎 |
| **tsx 保留范围** | worker dev、db seed、无装饰器脚本 | 无元数据需求处享受 tsx 快；带 `@Injectable/@Module` 一律禁 tsx/esbuild |
| **turbo 任务图** | `build:{dependsOn:["^build", db#db:generate]}`、`typecheck/test:{dependsOn:["^build"]}`、`lint/arch:{}`(零依赖并行)、`dev:{cache:false,persistent:true}`、`db:generate:{outputs:[generated]}` | `^build` 自动拓扑序、循环即报错；lint/arch 最快出红 |
| **tsconfig base 继承** | `config/tsconfig/base.json`(ES2022/ESNext/Bundler/strict/isolatedModules) 全继承；`config/tsconfig/nest.json` extends base 仅 api 用(开 `experimentalDecorators`+`emitDecoratorMetadata`、关 `verbatimModuleSyntax`)；web 用 next preset | 单一 base；装饰器开关与 verbatim 冲突项隔离到 nest preset |
| **适配器** | **platform-fastify**（按 footprint，纠正 root 误装的 express） | **must-smoke #2 已过**：薄 `ZodValidationPipe`(zod4)×Fastify×类型DI 校验 3/3（`api:smoke`），不再依赖 ts-rest |
| **pnpm** | **`pnpm@10.18.0`（`packageManager` 钉死 + corepack 复现）**，catalog 需 ≥9.5；engines `node>=22`(不封上界)，`.nvmrc` | catalog 协议硬前提；packageManager 钉死保 10 年可复现；require(ESM) 依赖 Node≥22.12 |

`.swcrc`(apps/api) 关键字段：`jsc.parser.decorators:true` / `transform.{legacyDecorator,decoratorMetadata}:true` / `keepClassNames:true` / `useDefineForClassFields:false` / `module.type:"es6"`。

---

## 3. 依赖归位

**root `dependencies` 整段删除**，运行期依赖按实际 import 下沉：

| root 现依赖 | 归位 | 引用 |
|---|---|---|
| @nestjs/common·core·platform-* / reflect-metadata / rxjs | **删**（无人 import）→ api 真 Nest 化时装到 apps/api | — |
| @langchain/langgraph·checkpoint-postgres | worker（+ ai-graphs 仅 @langchain/core peer） | catalog:langchain |
| pg / zod | 按 import 下沉 db·worker / domain·contracts·worker | catalog: |
| @types/*·tsx·typescript(dev) | 下沉各包 devDeps | catalog: |

root 只留工具链 devDeps：`turbo, typescript(catalog), prettier, dependency-cruiser, syncpack, knip, husky, lint-staged, vitest(catalog), @vitest/coverage-v8, dotenv-cli`。**砍 commitlint**（单作者 showcase 纯仪式）。验收信号：root 无 `dependencies`，`pnpm why @nestjs/core` 为空。

**catalog（`pnpm-workspace.yaml`，单一版本真相）**——只收**≥2 工作区共享且双版本有害**者，版本**用 `pnpm view` 取真实最新、对齐已装大版本**（勿手抄）：
```
catalog:
  typescript: 6.0.3        # 2026 真实版本（^6 非笔误，已装）
  "@types/node": 26.0.1    # 2026 真实版本（已装，对齐 Node22 运行时无碍）
  zod: 4.4.x               # 已装 zod4，勿降 zod3
  vitest / tsup / pg / @types/pg / @prisma/client / prisma
catalogs:
  langchain: { "@langchain/core": 1.2.x, "@langchain/langgraph": 1.4.x, ...checkpoint-postgres }
  otel / react(19.x)       # 待对应包真存在再启用
```
内部包一律 `workspace:*`（永远软链本地源）。`syncpack`（CI `pnpm exec`，**非 dlx**）守：catalog 一致 + 全精确 + 内部 workspace:*。`@langchain/core` 在 ai-graphs/worker **显式声明**（删 ignoreMissing），别靠传递 peer。

---

## 4. 脚手架步骤（有序·可执行）

```bash
# 0. 阻断前提：解锁 catalog
corepack use pnpm@10.18.0         # 写 packageManager；建 .nvmrc(22)

# 1. 目录骨架
mkdir -p apps/{web,worker} packages/{config,domain,contracts,db,ai-graphs,ai-runtime,ui,observability,testkit}

# 2. config 包先行（其余 extends 它）：放 tsconfig/{base,nest}.json、eslint flat、tailwind、env(zod 片段)
#    .dependency-cruiser.cjs 放【仓库根】（不进被构建包）

# 3. 依赖归位：删 root dependencies；按 import 下沉各包（写好 catalog 引用再 add）
pnpm install

# 4. workspace：加 catalog/catalogs 段，删 ai-docs 条目；.npmrc(save-exact=true, auto-install-peers 留默认 true,
#    onlyBuiltDependencies 仅 [@swc/core, esbuild, prisma 若用, argon2 若用])

# 5. 工具链
pnpm -w add -D turbo dependency-cruiser syncpack knip husky lint-staged
pnpm -w add -D unplugin-swc -F @meetwise/api -F @meetwise/worker   # Vitest 元数据 transform

# 6. tsconfig / turbo / eslint+cruiser / env / test 落盘（见 §2/§5/§7）

# 7. 验证：基建跑通
pnpm build && pnpm typecheck && pnpm lint && pnpm arch
pnpm -C apps/api dev      # 期望：DI 按类型注入成功，无字符串 token（Nest DI boot 冒烟）
pnpm -C apps/worker dev   # 期望：图挂 PG checkpointer 起得来
pnpm -C apps/web dev
```

**关键配置纪律：**
- **eslint flat**：`base+node+react` 三层；`no-restricted-properties process.env`（仅放行各 app 单一 env loader）；`import/order`+`no-relative-packages`+禁深导入；**配 `eslint-import-resolver-typescript`**(否则边界规则静默 no-op)；server 包关 `consistent-type-imports`；`no-restricted-imports` 配置文件 glob 豁免。`import/no-cycle` **砍**（与 cruiser 重叠）。
- **dependency-cruiser**（根级，`tsPreCompilationDeps:true` 看穿 import type）：`no-circular`、`pkg-no-import-app`、`no-cross-app`、`ai-graphs-no-io`(含 `node_modules/@langchain/(openai|anthropic|community)` + pg/bullmq/ioredis/aws-sdk/checkpoint-postgres/`^packages/db`)、`domain-poor`(排除 `.test/.spec`/config)、`web-no-server`、`db-only-server`、testkit `import type`-only。`controllers-dont-orchestrate` 等命名规则**待 api 文件结构落地再加**。
- **env**：每 app 各自 `.env`/`.env.example`(仅 committed example)；`@meetwise/config/env` 只导出 zod 片段(不读 process.env)；api=`@nestjs/config`+zod validate(fail-fast 只打 key 名)，web=`@t3-oss/env-nextjs`(server/client 隔离 + `server-only`，**锁版前验 t3-env×zod4**)，worker=**惰性 `getEnv()`(无顶层 process.exit)** + 显式 `import 'dotenv/config'`/`--env-file`。turbo `envMode:strict`。
- **密钥**：gitleaks 一处收口(pre-commit `--staged` + CI 全历史) + `.gitleaks.toml` allowlist 放行 `*.env.example` 占位；砍 secretlint 双引擎。

---

## 5. spike re-home（已完成 · 全 gate 绿灯不断档）

`packages/kernel` 杂物抽屉**已拆解删除**。re-home 是**拆包重划，非平移**——先建包再抽取、每步 gate 绿。
实际落点（经专家审计，对原计划有三处更正，标 ✎）：

| 原 spike | 实际迁入 | 验证脚本 |
|---|---|---|
| kernel 双校验/重试/幻觉拦截/幂等 trace | ✎ `invoke`→**`ai-runtime`**（关口，非 `ai-graphs`）；双校验→`ai-runtime/validators` | `runtime:prove`（→ `ai-runtime/test`） |
| kernel 状态机 CAS / 租约 / 事件账本 / asPrincipal | ✎ 四原语**留 `packages/db`**（高内聚于 SQL/RLS，非下沉 `domain`）；`api` 与 `ai-runtime` 共用单一真相 | `db:prove` + `runtime:prove` |
| kernel:graph interrupt+PG checkpointer+重启续会话 | 纯图→**`ai-graphs`**（checkpointer 注入）；✎ checkpointer+续跑→**新建 `apps/worker`**（组合根，使 `ai-graphs-pure` 可成立） | `graph:prove`（→ `worker/test`） |
| pipeline 简历→押题 factuality 门 | 摄取/factuality→**`domain`**；押题图→**`ai-graphs`**（generate 注入） | `pipeline:prove`（→ `ai-graphs/test`） |
| 内嵌 smoke-contract 的 zod4 schema | **独立 `packages/contracts`**（前后端单一真相）；`ZodValidationPipe`→`api/platform` | `api:smoke` |
| api 平铺 src | `api/{platform/, modules/interview/, test/}` 特性模块化；`asPrincipal` 去重（委托 `@meetwise/db`） | `api:validate` |

> 三处更正的理由见 ADR / module-boundaries：① 关口完整性要求 `invoke` 在 `ai-runtime` 包，depcruise `ai-runtime-chokepoint` 才有可锚的真实目标；② 四原语是 `pg` 查询，与 SQL+迁移同包最高内聚，`platform` 是会变垃圾抽屉的投机桶；③ 无 `worker` 则长图只能跑在 api 请求里＝退回内存 session 反模式。

**测试基建**：全仓 Vitest projects（按文件后缀切分 `*.test/.contract.test/.graph.test/.int.test/.eval`）；api/worker 走 `unplugin-swc`；CI 复用 compose 库(`TEST_PG_URL` 切换，不双供库)；**库隔离默认事务 ROLLBACK**，模板库仅 DDL/迁移套件；**单一 root globalSetup** 供库(幂等守门)；testkit 提供 `FakeChatModel`(按调用序号脚本：正常/重试/拒绝/幻觉)。覆盖率差异化(核心域 domain/validators/contracts 卡严，apps/* 初期不设地板)。

**过渡纪律**：旧 5 脚本 job 与新 Vitest job **并存**，某 gate 断言全搬完且 CI 绿再删旧；`api:validate` 翻向真 Nest **必须先有 AppModule + validate 子命令移植完**(期间 spike 续 tsx 保绿)。db 迁移在 Prisma schema 落地前先用 `psql -f sql/*.sql`；RLS policy/pgvector 走**手写 migration SQL**(prisma migrate 不托管)。

**must-smoke #3**：经 PrismaClient 工厂（`SET LOCAL app.principal` 包在交互式事务）的查询**越权读=0**，别用 raw 证过蒙混。

---

## 6. 反过度工程（本期坚决不上，各一句）

- **changesets**：内部包全 `workspace:*` 不发布，版本编排纯负担。
- **nx**：turbo 拓扑+缓存已够。
- **commitlint/conventional**：单作者 showcase 纯仪式。
- **remote cache / TS project references**：本地 `.turbo` 足够，一行开关后续增量。
- **dual-format 叶库**：全 ESM 后无 CJS 消费方，删。
- **knip/syncpack 进硬门**：knip 空仓期只产噪音→warn-only 观察；syncpack 进门(确定性)。
- **node-linker=hoisted / 全局 strict-peer**：默认隔离 node_modules 才是幽灵依赖治本；peer 严只严在 react/zod 致命双实例项。
- **eslint-plugin-boundaries / xstate / Renovate**：边界交 dep-cruiser，状态机交 domain 枚举，依赖升级走人工批次进 ADR。
- **env:check 自研脚本**：knip+boot fail-fast 覆盖够，被咬到再加。

---

## 7. 落代码前置（三道闸全绿才动业务码）

1. **基建脚手架跑通**：`pnpm build && pnpm typecheck && pnpm lint && pnpm arch` 全绿；root 无 `dependencies`；catalog/syncpack 一致；lockfile 随本次 bump 重生成并提交。
2. **一键 dev 起栈**：`pnpm dev` = `infra:up(compose --wait 带 healthcheck) → db:generate → db:migrate → turbo build --filter=./packages/* (predev 让叶库 dist 就绪) → turbo dev(库 tsup --watch + api nest-swc watch + worker tsx + web next，并发常驻)`；本地 env 经 `.env`/`--env-file` 注入。web/api/worker 三进程健康探针通过。
3. **五 gate 在新结构绿**：CI 加 `pnpm install --frozen-lockfile → syncpack lint(exec) → turbo typecheck lint test build arch → 起 Postgres → 5 runtime gate`；加 **api/worker dist-import boot 冒烟**(用 prod 产物真 `node` 起一次，抓 ESM/CJS 双包导出 bug)；coverage job 起库或只跑确定层。旧 spike job 搬完即删。

**锁版前 must-smoke（任一不过即退回退路径，不得带病锁版）：**
1. SWC `decoratorMetadata` × ESM × **跨包注入 + forwardRef 循环**真 provider 解析（不过→退 CJS-api，**勿退 tsc-ESM**）。
2. 薄 `ZodValidationPipe`(zod4) × Fastify × 类型DI 启动校验（已过，见 `api:smoke`）。
3. PrismaClient 工厂走 RLS **越权读=0**。

> 本蓝图为 L2 基建定稿，按项目门禁须过一次对抗式 `expert-audit`（构建系统 / Node 模块解析 / Nest 编译链三类专家）后并入 production-backlog，重点复核上述三处 must-smoke——它们是全稿唯一未经实测、又最 load-bearing 的承重点。
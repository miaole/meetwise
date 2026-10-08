# Harness / REQUEST — DIR-1 · 目录与文件位置重构设计刀（docs-only · per-batch pure-move 迁移计划）

**Status**: `draft:awaiting_pre_exec_dual`（本刀本批只出设计文档 · **写完即停** · Ban self-approve · alone ≠ dual）
**刀**: DIR-1 · 用户直裁原文：「文件夹和文件位置也很混乱」
**Date**: 2026-10-07 · **Parent tip**: `0fe96fca`（fetch 后 `origin/feat/mysql-schema-skeleton` 实测 · docs 基线 · not a prove tip）
**Worktree**: `meetwise-line-dirstruct` · branch `line/dir-structure`
**releaseEvidence=false** · **NOT_HA** · 本刀零代码改动 = 本绿 ≠ 重构完成 ≠ E2E ≠ HA

---

## Pins（十值 · 文首照抄 · 本刀不改口）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained**（业务+LangGraph PostgresSaver+pgvector；禁 MySQL/Qdrant 业务切流叙事） |
| Public DELETE | **503**（stays） |
| `g7SuiteGreen` | **false**（retained） |
| `r1Closed` | **false**（retained） |

另钉：`canHonestlyFlip=false`（UC-018）· `techRoleFailClosedOptOutG7Only=true`（retained）。

---

## 0. 刀的边界（一句话）

本刀 = **目录/文件位置重构的设计刀（REQUEST + 迁移计划）**：只读盘点 + 目标结构规范 + 分批纯移动迁移方案。**本 commit 零代码、零配置、零 SSOT 改动**；实际 `git mv` 属后续每批一刀（§4），每批走 §3 loop（预执行双审 → 授权 → 纯移动 → prove → post 双审 → nail）。

---

## 1. 现状结构图（只读盘点 @ `0fe96fca` · 全部实测）

```
meetwise/
├── apps/
│   ├── api/        NestJS · src 53 文件
│   │   └── src/  main.ts · app.module.ts · version.ts
│   │       ├── modules/        16 个域目录（admin auth commerce diagnosis health interview
│   │       │                   jobs legal metrics notification privacy profile quiz recruiter
│   │       │                   resume roles）—— 仅 3/16 有 *.module.ts（interview/quiz/diagnosis）；
│   │       │                   其余 13 域的 controller/service 由 app.module.ts 直接 import 装配；
│   │       │                   resume/ 另有 2 个无角色后缀文件（ocr-model-client.ts · resume-display.ts）
│   │       └── platform/       11 文件平铺（guard/filter/pipe/service 混放：
│   │                           admin.guard · all-exceptions.filter · db.service · last-event-id ·
│   │                           platform.module · preview-controlled-write.guard · principal.guard ·
│   │                           public-preview.ts · rate-limit.service · recruiter.guard · zod.pipe）
│   ├── worker/     src **83 文件全平铺（零子目录）** + smoke/ 20 + test/ 113
│   │   └── src/  main.ts（716 行）+ 域簇：r4-* **31** · qbank-* 6 · interview-* 6 · cloud-* 6 ·
│   │               rag-* 3 · quiz-* 3 · adaptive-* 3 · voice-* 2 · privacy-* 2 · model-* 2 ·
│   │               job-* 2 · diagnosis-* 2 · 其余散件 ~17（checkpoint-principal · commerce-reconcile ·
│   │               memory-service · production-config · report-worker · signal-conclude-event …）
│   └── web/        Next.js · app/ 路由树（Next 约定 · 不动）· components/ 41 tsx ·
│                   lib/（平铺 8 个 ts + 7 个子目录 api/hooks/interview/jobs/recruiter/resume/stream）·
│                   e2e-ui/ 7 spec（受 e2e-directory-contract SSOT 管 · 不动）· test/ 5 proof
├── packages/
│   ├── db/         src **71 文件平铺** + tenant/（唯一子目录）+ index.ts 桶（562 行）
│   │   └── 域簇：memory-* 10 · qbank-* 10 · interview-* 5 · privacy-* 2 + **uc052-* 3**（UC 编号前缀）·
│   │               scoring-* 3 · retrieval-* 3 · context-compression-* 3 + **ctx03-event-source**（同族两套命名）·
│   │               checkpoint-* 2 · commerce.ts + payment.ts · 其余散件 ~29（principal.ts 2077 行 ·
│   │               model-invocation · model-operation-admission · usage-calibration · migrate/migrate-cli …）
│   ├── domain/     src **50 文件平铺（零子目录）** + index.ts 桶（514 行）
│   │   └── 域簇：memory-* 9 · scoring-* 5 · qbank-* 3 · rag-* 2 · privacy-* 2 ·
│   │               **ctx03/ctx04/ctx05/ctx06 + mem07/mem09 六个编号前缀** · 其余单件（auth · career ·
│   │               crag · growth · learning · web-explore · sealed-* 2 · resume-extract …）
│   ├── ai-runtime/ src 48 文件：mostly 平铺 + 已有 3 子目录（catalog/ · router/ · validators/）；
│   │               簇：voice* 3 · g7-* 3 · langfuse* 2 · offline-evaluation* 2 · usage-* 2 ·
│   │               model-operation-* 2 · 其余散件（invoke.ts 774 行 · retrieval · reranker · search …）；
│   │               package.json exports 暴露 subpath `./g7-bootstrap`（两 app main.ts 直接引）
│   ├── ai-graphs/  src 16 文件：**adaptive-interview.ts（文件）与 adaptive-interview/（目录）同茎共存**；
│   │               图文件平铺（career-path · mock-interview · report · resume-diagnosis · resume-quiz）
│   ├── contracts/  仅 index.ts（1243 行）+ openapi.ts
│   ├── config/     无 src（仅 tsconfig/nest.json）
│   ├── db-mysql/   骨架（README + migrations/0001_skeleton.sql · PG-retained 下不切流）
│   └── qdrant-store/ src 8 文件（平铺 · 小包 · 低混乱）
├── scripts/        **根 79 文件（77 .mjs + 2 .sh）** vs 8 个子目录（140 文件）：
│   │               ai-docs 3 · conn-stack 11 · e2e-platform 13 · fixtures 91 · g7-freetier 1 ·
│   │               ha 14 · isolated 3 · lib 4
│   └── 根构成：*.proof.mjs 38（一次性 prove）· mysql-stack.* 11（与 conn-stack/ 11 文件同名复制族）·
│               运维/检查 39；**根 package.json `node scripts/…` 引用 248 处**
├── e2e/            2 个 *.e2e.ts + helpers/ 13 —— 已被 e2e-directory-contract（SSOT 级契约）+
│                   adr-e2e-directory-restructure（S0–S4）裁定为**扁平即契约**（禁领域子树）→ 本刀不动
├── ai-docs/        delivery 223 文件 + reviews/ 1098 + receipts/ + harness/（本文件所在）
├── docs/           Pages 静态预览（index.html · styles.css）+ docs/delivery 2 个收据
│                   （与 ai-docs/delivery/receipts 双落点）
└── docker/ · ops/ · .github/workflows 7
```

**测试落位现状**（一处结论）：`<pkg>/test/*.proof.ts` 与 src 同级 = 9 棵树共 322 文件（worker 113 · db 66 · api 45 · ai-runtime 41 · domain 26 · qdrant 8 · contracts 5 · web 5 · ai-graphs 4）+ `apps/web/e2e-ui/*.spec.ts` 7（UI 次层）+ `apps/worker/smoke/` 20（eval/smoke 混合）。**基本统一**；唯一下挂点 `apps/api/test/_neg-harness.ts`（下划线前缀）。

---

## 2. 混乱点清单（量化 · 全部 @ `0fe96fca` 实测）

### 2.1 文件名风格计数（apps+packages 全部 .ts，n=747）

| 风格 | 数量 | 占比 | 例 |
|------|------|------|----|
| kebab-case（含 `.controller/.service/.proof` 等角色后缀） | **742** | 99.3% | `interview-event.ts` · `neg-commerce.proof.ts` |
| camelCase | 4 | 0.5% | `apps/web/lib/hooks/use{Quiz,Interview,Diagnosis}Stream.ts` · `useFrameCoalescedState.ts`（React hooks 约定必须 camel → **豁免**） |
| snake/下划线 | **1** | 0.1% | `apps/api/test/_neg-harness.ts` |
| PascalCase（.ts） | 0 | — | — |

.tsx（web）：26 个 PascalCase 组件 + Next 保留名（layout/page/error/loading/not-found）—— React/Next 约定，**豁免**。
**判定**：命名风格本身已近全绿；真实混乱不在风格，在**位置与同名**（下述）。

### 2.2 超长文件 top（>800 行 · DIR-1 **禁拆**，只登记为后续 SPLIT 内容刀候选）

| # | 文件 | 行数 | 备注 |
|---|------|------|------|
| 1 | `scripts/run-e2e-isolated.mjs` | 2449 | 启栈+隔离 runner（e2e 契约锁定落位 · 禁本刀动） |
| 2 | `packages/db/src/principal.ts` | 2077 | principal+池+错误多职责混装 |
| 3 | `scripts/e2e-parity-check.mjs` | 1254 | parity 门 |
| 4 | `packages/contracts/src/index.ts` | 1243 | 单文件全契约桶 |
| 5 | `apps/api/src/modules/interview/interview.service.ts` | 954 | SSE-PUSH 在飞线正碰此文件 |

次名次：`packages/db/test/uc052-checkpoint-physical.proof.ts` 927 · `scripts/eval-harness-matrix-cite.proof.mjs` 824 · `scripts/lib/uc-covered-real-gatherer.mjs` 807。`apps/worker/src/main.ts` 716 行（apps 内第一）。
**裁定**：拆分 = 改内容 = 违反本刀纯移动 Ban → 全部留给后续独立 **SPLIT-1** 内容刀。

### 2.3 同类职责散落 / 跨树同名对照表（核心混乱）

| 同名/近名 | 出现位置（≥2） | 混乱性质 |
|-----------|----------------|----------|
| `qbank-track-local-retrieval.ts` | `packages/db/src` · `packages/domain/src` · `apps/worker/src`（**三棵树同名**） | 最重：同 stem 三义（repo/纯函数/worker 装配），grep 不可辨 |
| `memory-{admission,control-surface,fact-adjudication,governance,index-generation,summary,summary-tree,two-stage-recall}.ts`（8 个名） | `packages/db/src` ↔ `packages/domain/src` 各一份 | 层间成对同名（db=存储 vs domain=纯逻辑），import 时必须看包名才能分辨 |
| `scoring-{aggregation,evidence-conflict,fact-root}.ts`（3 个名） | `packages/db/src` ↔ `packages/domain/src` | 同上 |
| `privacy-authorization.ts` · `privacy-erasure-preview.ts` | `packages/db/src` ↔ `packages/domain/src` | 同上 |
| `qbank-miss.ts` · `qbank-route-scope-cache.ts` | `packages/db/src` ↔ `packages/domain/src` | 同上 |
| `ctx03-event-source.ts` | `packages/db/src` ↔ `packages/domain/src` | 同上 + **ctx03/04/05/06 与 mem07/mem09 六个编号前缀**与描述名混排（domain） |
| `job-route-classify.ts`（ai-runtime）vs `job-route-classifier.ts`（domain） | 两个包 | 近名易混（-er 差一个字母） |
| `usage-calibration.ts`（db）· `usage-calibration-reconcile.ts`（worker）· `usage-calibration-reconciler.ts`（ai-runtime） | 三包 | 同族三后缀三种拼法 |
| `worker-job-wakeup.ts`（db）vs `worker-job-wakeup-redis.ts`（worker） | 两包 | 近名 |
| `free-text-route.ts`（domain）· `free-text-route-decision.ts`（db）· `free-text-route-funnel.ts`（worker） | 三包 | 同族散三处 |
| `interview-service.ts` | `apps/api/src/modules/interview` ↔ `apps/worker/src` | 两 app 同名不同义（HTTP vs 队列消费） |
| `voice-stream-preview.ts` | `packages/ai-runtime/src` ↔ `apps/web/lib` | 跨端同名 |
| `public-preview.ts` | `apps/api/src/platform` ↔ `apps/web/lib` | 跨端同名 |
| `cloud-readiness.ts` · `cloud-test-serial.ts` | `apps/worker/src` ↔ `apps/worker/smoke` | **同 app 内同名两份** |
| `report.ts` | `packages/ai-graphs/src` ↔ `packages/db/src` | 跨包同名 |
| `adaptive-interview.ts` | `packages/ai-graphs/src（文件）` ↔ `packages/domain/src`；且 ai-graphs 内 `adaptive-interview.ts` 与 `adaptive-interview/` 目录**同茎共存** | 文件/目录同茎 |
| `actions.ts` ×11 · `route.ts` ×10 | `apps/web/app/**` | Next 约定（**豁免**，登记备查） |

计数：src 级跨树同名 basename **17 组**（其中 1 组三树、16 组两树）+ 近名族 5 组。

### 2.4 大平铺（按域内聚缺失）

| 位置 | 文件数 | 可识别域簇（≥2 文件） |
|------|--------|----------------------|
| `apps/worker/src` | **83 平铺** | r4 31 · qbank 6 · interview 6 · cloud 6 · rag 3 · quiz 3 · adaptive 3 · voice 2 · privacy 2 · model 2 · job 2 · diagnosis 2 |
| `packages/db/src` | **71 平铺**（仅 tenant/） | memory 10 · qbank 10 · interview 5 · privacy+uc052 5 · scoring 3 · retrieval 3 · context-compression+ctx03 4 · checkpoint 2 |
| `packages/domain/src` | **50 平铺** | memory 9 · scoring 5 · qbank 3 · rag 2 · privacy 2 · ctx0x 4 · mem0x 2 |
| `packages/ai-runtime/src` | 48（3 子目录已存在） | voice 3 · g7 3 · langfuse 2 · offline-eval 2 · usage 2 · model-operation 2 |
| `apps/api/src/platform` | 11 平铺 | guard×4 · service×3 · filter/pipe/其他×4 混放 |

### 2.5 scripts/ 根堆积

根 79 文件 vs 子目录 8 个 140 文件。根中 **38 个 `*.proof.mjs` 一次性 prove** + **11 个 `mysql-stack.*`**（与 `scripts/conn-stack/` 内 11 个**同名文件族**并存——conn-stack 是拆壳副本，契约上保留但根侧同名双份易混）。根 `package.json` 有 **248 处 `node scripts/…`** 引用 + 7 个 workflow 少量引用 → 移动 scripts 必须同步改 package.json 路径（B6 最重，最后做）。

### 2.6 其他

- `docs/delivery/` 2 个收据 vs `ai-docs/delivery/receipts/`（收据双落点；Pages 预览线产物）。
- `apps/api` 16 域中 13 域无 `*.module.ts`（装配集中在 app.module.ts 53 行 import 块）→ 补 module 文件 = **内容刀**，非本刀。
- 测试落位已统一（test/ 同级 + *.proof.ts），本刀只钉规范，不搬测试。

---

## 3. 目标结构规范（分层规则 · 迁移终点）

### R1 包级分层（packages 按域内聚）

```
packages/
├── db/src/          按域文件夹：memory/ qbank/ interview/ scoring/ privacy/ commerce/
│                    retrieval/ checkpoint/ context/ model-op/ jobs/ ；根只留 index.ts ·
│                    principal.ts（SPLIT 前原地不动）· migrate*.ts · tenant/（已存在）
├── domain/src/      按域文件夹：memory/ scoring/ qbank/ privacy/ routing/ context/ rag/；
│                    ctx03-ctx06/mem07/mem09 **原文件名不动**（编号前缀=历史刀痕，改名留后续刀）
├── ai-runtime/src/  已有 catalog/ router/ validators/ 基础上补：voice/ eval/ observability/
│                    model-op/；g7-bootstrap.ts **留在根**（package.json exports subpath 锚点，禁动）
├── ai-graphs/src/   adaptive-interview.ts（文件）并入 adaptive-interview/（目录同茎消除）
├── contracts/ · config/ · db-mysql/ · qdrant-store/   小包不动
```

### R2 应用级分层（apps 按既有 module/ 域目录推进）

```
apps/api/src/     modules/<域>/ 保持（16 域目录即目标形态）；platform/ 内部不再细分（11 文件
                  可读性可接受，guard/service 分文件夹=可选微调，非必须）；resume/ 的 2 个
                  无后缀文件原地不动（改名=内容刀）
apps/worker/src/  按域文件夹：qbank/ interview/ cloud/ rag/ quiz/ adaptive/ voice/ privacy/
                  model-op/ jobs/ diagnosis/ r4-evidence/（31 个 r4-* 一次性收证/接线脚本聚一
                  处，等待整体退役评估）；根留 main.ts + production-config.ts 等装配件
apps/web/         app/（Next 路由）· components/ · lib/ 现状即目标（lib 平铺 8 文件可后续
                  归入既有子目录，非本刀必须）
```

### R3 文件名规范

- 全部 `.ts` = **kebab-case**（现状 742/747 已达标）。
- **豁免**（约定合法性）：React hooks camelCase（4 文件）· `.tsx` PascalCase 组件 + Next 保留名 · 测试 `_neg-harness.ts` 前缀（runner glob 探测后另批处理，见 B7）。
- 同包内禁「文件与目录同茎」（ai-graphs adaptive-interview 唯一违例，B4 消除）。

### R4 测试落位（统一一案 · 现状即规范）

- 单包证明测试 = `<pkg>/test/*.proof.ts` 与 src **同级**（不贴 src 内联、不建 `__tests__`）。
- UI 次层 = `apps/web/e2e-ui/*.spec.ts`（e2e-directory-contract SSOT 管辖）。
- eval/smoke = `apps/worker/smoke/`（维持，但其内与 src 同名的 2 文件在 B3 中消除歧义）。
- **禁**：新测试贴 src 内联；新 `__tests__/`；e2e/ 内建领域子树（契约禁）。

### R5 e2e/ 与 scripts/isolated（既有契约优先）

`e2e/` 扁平树 + `scripts/run-e2e*.mjs` + `scripts/isolated/` 薄入口已被 `ai-docs/testing/conventions/e2e-directory-contract.md` 与 `adr-e2e-directory-restructure.md`（S0–S4）**锁死**——本刀**零触碰**该树；DIR-1 与该 ADR 冲突时**以该 ADR 为准**。

---

## 4. 迁移方案（分批 · 每包一刀 · 纯 git mv）

**通用律**（每批相同）：
1. 只用 `git mv`（保 rename 历史，`--find-renames` 可证 R100）。
2. 同步改且只改三类「路径文本」：包内相对 import · 包桶 `src/index.ts` re-export 行 · （仅 B6）`package.json` script 路径 / workflow 引用。**零其他内容改动**。
3. 跨包边界不受影响：apps 只经 `@meetwise/*` 桶 import（根 tsconfig paths + 各包 exports 锚定；唯一 subpath `@meetwise/ai-runtime/g7-bootstrap` 的锚文件不动）。
4. 每批一个独立 worktree/branch，走 §3 loop 全程（预执行双审 → 授权 → mv → prove → post 双审 → nail）。
5. 批间串行（同线一刀一 REQUEST）；上一批 nail 前不开下一批。

### 批次表

| 批 | 范围 | 文件量 | 前置/冲突声明 | 主要风险 |
|----|------|--------|----------------|----------|
| **B1** | `packages/db/src` 域文件夹化（memory/qbank/interview/scoring/privacy/commerce/retrieval/checkpoint/context/model-op/jobs） | ~50 mv | 无在飞冲突（当前无 db-src 平铺域文件的在飞刀） | 桶 562 行 re-export 改写面大；test/ 中引用 db 内部路径的 proof 需同批改 import |
| **B2** | `packages/domain/src` 域文件夹化（memory/scoring/qbank/privacy/routing/context/rag） | ~35 mv | 无在飞冲突 | 同上（桶 514 行） |
| **B3** | `apps/worker/src` 域文件夹化 + `smoke/` 同名 2 文件消歧 | ~70 mv | **排除 `checkpoint-principal.ts`**（loop 文件冲突规则：隐私主线在飞禁改；待其 nail 后补批 B3b 或原地保留） | main.ts 25 个相对 import；113 个 proof 引用面 |
| **B4** | `apps/api`：platform/ 维持、resume 件不动；**整批后置**至 SSE-PUSH 线 nail（`interview.controller/service` 954 行在被碰面） | ~0-8 mv | **DEFERRED**：SSE-PUSH 在飞 | 与功能刀撞文件 |
| **B5** | `packages/ai-runtime/src` 补域文件夹 + `ai-graphs` 同茎消除 | ~20 mv | **DEFERRED**：TOKSTREAM 线碰 ai-runtime；g7-bootstrap.ts 锚点禁动 | 同上 + exports subpath |
| **B6** | `scripts/` 根归位：38 个 `*.proof.mjs` → `scripts/proofs/`、11 个 `mysql-stack.*` → 评估并入 `conn-stack/`（保留根别名或改 248 处引用） | ~50 mv | 最重改面：根 `package.json` 248 处 `node scripts/` + 7 workflow + e2e 契约锁定的 `run-e2e*`/`isolated` **不动** | 契约锚定文件（run-e2e-isolated.mjs 等）**留在根** |
| **B7**（可选微批） | `apps/api/test/_neg-harness.ts` 去 `_` 前缀 | 1 rename | 先证 runner glob 不依赖 `_` 前缀 | 探测后决定做/不做 |

**推荐序**：B1 → B2 → B3 → B6 →（SSE-PUSH nail 后）B4 →（TOKSTREAM nail 后）B5 → B7。
**总量**：~200 个纯移动，6-7 批，每批一刀一 REQUEST。

### 零行为变更证明（每批统一）

- `git diff --find-renames --stat main...HEAD`：除 index.ts 桶 / import 行 / package.json 路径行外**全为 R100 rename**；`git diff -M100% --diff-filter=M` 逐文件核对仅路径文本变化。
- 每批 prove（B6 额外含根 `pnpm regression:core`）：

```bash
pnpm install --frozen-lockfile          # EXIT=0（lockfile 零改动本身即证明）
pnpm -C <pkg> typecheck && pnpm -C <pkg> build   # EXIT=0
pnpm -C <pkg> test                      # EXIT=0（与迁移前基线同数同绿）
# B1/B2 后追加：pnpm -C apps/api typecheck && pnpm -C apps/worker typecheck   # 消费方编译
```

---

## 5. Ban（违者本刀/本批作废）

1. **Ban 动任何文件本体内容**：除 import 路径文本、桶 re-export 行、package.json script 路径外的任何行；**Ban** 顺手重构/改名变量/加注释。
2. **Ban 与在飞功能刀撞文件**：SSE-PUSH 线碰 `apps/api/src/modules/interview/interview.controller.ts`（及 interview.service.ts）→ B4 后置；TOKSTREAM 线碰 `packages/ai-runtime/src` → B5 后置；隐私主线在飞 → B3 不动 `apps/worker/src/checkpoint-principal.ts`。撞面未解除前**该批不开**。
3. **Ban 改共享 SSOT**：`e2e-requirement-coverage-matrix.md` / `gap-bug-backlog.md` / checklist / `e2e-directory-contract.md` / `adr-e2e-directory-restructure.md` —— 只在 nail 时按诚实规则登记。
4. **Ban secrets**：不 commit `.env*` / Key / token。
5. **Ban** 拆超长文件（§2.2 top5 归 SPLIT-1 后续内容刀）；**Ban** 文件改名（除 B7 单列微批）；**Ban** 补 `*.module.ts`、改装配、改行为。
6. **Ban** 触碰 `e2e/` 树、`scripts/run-e2e*.mjs`、`scripts/isolated/`、`g7-bootstrap.ts`、`principal.ts`、migrations。
7. **Ban 假绿叙事**：批绿 ≠ 重构完成 ≠ E2E ≠ HA ≠ covered；docs-only 本 commit 更不构成任何收束。
8. **Ban** 自批 / 代签 peer；Ban 本批未授权先 mv。

---

## 6. 成功标准（本 docs-only 批）

- [x] 只读盘点落盘（§1 结构图 + §2 量化清单，file:line 级可复核）
- [ ] 本 REQUEST + slice + 双 stub（mw-e2e-ha / mw-model-op）四件齐
- [ ] 预执行双审 BOTH `Verdict: PASS`（协调方派审）
- [ ] `git show --stat` = 恰 4 个新增 md · 零代码 / 零 package.json / 零 SSOT
- [ ] 后续每批：tsc/build/test 绿 + `--find-renames` R100 证明 + post 双审 + nail 授权
- [ ] **写完即停**：本批不 mv 任何文件

---

*DIR-1 REQUEST · 2026-10-07 · tip `0fe96fca` · releaseEvidence=false · NOT_HA · awaiting pre-exec dual · STOP*

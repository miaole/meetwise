# Harness / REQUEST — DIR-1 · 目录与文件位置重构设计刀（docs-only · per-batch pure-move 迁移计划）

**Status**: `draft:awaiting_pre_exec_dual` · **rev2**（双席 FAIL 合并处方已并入：e2e-ha 两实洞 + model-op 盘点诚实性 · 七项修订 · 修完 STOP 等重审）
**刀**: DIR-1 · 用户直裁原文：「文件夹和文件位置也很混乱」
**Date**: 2026-10-07（rev1）/ 2026-10-07（rev2）· **Parent tip**: `0fe96fca`（fetch 后 `origin/feat/mysql-schema-skeleton` 实测 · docs 基线 · not a prove tip）
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
│   │               job-* 2 · diagnosis-* 2 · 其余散件 15（checkpoint-principal · commerce-reconcile ·
│   │               cost-configure · drain-loop · free-text-route-funnel · main.ts · memory-service ·
│   │               owner-queue-drain · production-config · production-equivalent-funnel-08-eval ·
│   │               report-worker · route-classify-consumer · signal-conclude-event ·
│   │               usage-calibration-reconcile · worker-job-wakeup-redis）
│   └── web/        Next.js · app/ 路由树（Next 约定 · 不动）· components/ 41 tsx ·
│                   lib/（平铺 8 个 ts + 7 个子目录 api/hooks/interview/jobs/recruiter/resume/stream）·
│                   e2e-ui/ 7 spec（受 e2e-directory-contract SSOT 管 · 不动）· test/ 5 proof
├── packages/
│   ├── db/         src 71 文件 = **70 平铺 + tenant/**（唯一子目录）+ index.ts 桶（562 行）
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
│   ├── ai-graphs/  src 17 文件：**adaptive-interview.ts（文件）与 adaptive-interview/（目录）同茎共存**；
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
├── e2e/            2 个 *.e2e.ts + helpers/ 12（11 .ts + 1 .mjs）—— 已被 e2e-directory-contract（SSOT 级契约）+
│                   adr-e2e-directory-restructure（S0–S4）裁定为**扁平即契约**（禁领域子树）→ 本刀不动
├── ai-docs/        delivery 223 文件 + reviews/ 1098 + receipts/ + harness/（本文件所在）
├── docs/           Pages 静态预览（index.html · styles.css）+ docs/delivery 2 个收据
│                   （与 ai-docs/delivery/receipts 双落点）
└── docker/ · ops/ · .github/workflows 7
```

**测试落位现状**（一处结论）：`<pkg>/test/*.proof.ts` 与 src 同级 = 9 棵树共 322 文件（worker 113 · db 66 · api 45 · ai-runtime 41 · domain 26 · qdrant 8 · contracts 5 · web 5 · ai-graphs 4）+ `apps/web/e2e-ui/*.spec.ts` 7（UI 次层）+ `apps/worker/smoke/` 20（eval/smoke 混合）。**基本统一**；唯一下挂点 `apps/api/test/_neg-harness.ts`（下划线前缀）。

---

## 2. 混乱点清单（量化 · 全部 @ `0fe96fca` 实测）

### 2.1 文件名风格计数（apps+packages 全部 .ts 含 .d.ts，n=749 · rev2 勘误口径）

| 风格 | 数量 | 占比 | 例 |
|------|------|------|----|
| kebab-case（含 `.controller/.service/.proof/.d` 等点式角色后缀） | **744** | 99.3% | `interview-event.ts` · `neg-commerce.proof.ts` · `global.d.ts` |
| camelCase | 4 | 0.5% | `apps/web/lib/hooks/use{Quiz,Interview,Diagnosis}Stream.ts` · `useFrameCoalescedState.ts`（React hooks 约定必须 camel → **豁免**） |
| snake/下划线 | **1** | 0.1% | `apps/api/test/_neg-harness.ts` |
| PascalCase（.ts） | 0 | — | — |

.tsx（web）：26 个 PascalCase 组件 + Next 保留名（layout/page/error/loading/not-found）—— React/Next 约定，**豁免**。
**判定**：命名风格本身已近全绿；真实混乱不在风格，在**位置与同名**（下述）。
**rev1→rev2 勘误**：rev1 n=747/kebab=742 漏计 2 个 `.d.ts`（`apps/web/global.d.ts` · `apps/web/next-env.d.ts`，均 kebab）→ 实值 n=749 / kebab=744。

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
| `qbank-track-local-retrieval.ts`（**旗舰行 · rev2 勘误**） | `packages/db/src` ↔ `packages/domain/src` **两树同名**；`apps/worker/src/qbank-track-local-retrieve.ts` 为**近名**（无 `-al`，rev1 误记三树同名） | rev1 旗舰行勘误：exact 同名 = db+domain 两树；worker 是近名归 §近名族。仍是最重混乱：exact 同名双树 + 近名第三树，grep 不可辨 |
| `memory-{admission,control-surface,fact-adjudication,governance,index-generation,summary,summary-tree,two-stage-recall}.ts`（8 个名） | `packages/db/src` ↔ `packages/domain/src` 各一份 | 层间成对同名（db=存储 vs domain=纯逻辑），import 时必须看包名才能分辨 |
| `scoring-{aggregation,evidence-conflict,fact-root}.ts`（3 个名） | `packages/db/src` ↔ `packages/domain/src` | 同上 |
| `privacy-authorization.ts` · `privacy-erasure-preview.ts` | `packages/db/src` ↔ `packages/domain/src` | 同上 |
| `qbank-miss.ts` · `qbank-route-scope-cache.ts` | `packages/db/src` ↔ `packages/domain/src` | 同上 |
| `ctx03-event-source.ts` | `packages/db/src` ↔ `packages/domain/src` | 同上 + **ctx03/04/05/06 与 mem07/mem09 六个编号前缀**与描述名混排（domain） |
| `scoring-honesty.ts`（rev2 补录） | `packages/domain/src` ↔ `apps/web/lib/stream/scoring-honesty.ts` | 跨包↔前端同名（rev1 漏计） |
| `client.ts`（rev2 补录） | `packages/qdrant-store/src/client.ts` ↔ `apps/web/lib/api/client.ts` | 跨包↔前端同名（rev1 漏计） |
| `voice-stream-preview.ts` | `packages/ai-runtime/src` ↔ `apps/web/lib` | 跨端同名 |
| `public-preview.ts` | `apps/api/src/platform` ↔ `apps/web/lib` | 跨端同名 |
| `cloud-readiness.ts` · `cloud-test-serial.ts` | `apps/worker/src` ↔ `apps/worker/smoke` | **同 app 内同名两份** |
| `report.ts` | `packages/ai-graphs/src` ↔ `packages/db/src` | 跨包同名 |
| `adaptive-interview.ts` | `packages/ai-graphs/src（文件）` ↔ `packages/domain/src`；且 ai-graphs 内 `adaptive-interview.ts` 与 `adaptive-interview/` 目录**同茎共存** | 文件/目录同茎 |
| `actions.ts` ×11 · `route.ts` ×10 | `apps/web/app/**` | Next 约定（**豁免**，登记备查） |
| `main.ts` ×2 | `apps/api/src` ↔ `apps/worker/src` | 惯例锚点（**豁免**，docker `compose.prod.yml:240/:269` 引用面见 §4 R2/B3） |

**近名族（rev2 重数 = 6 族）**：`job-route-classify`（ai-runtime）vs `job-route-classifier`（domain）· `usage-calibration`（db）/`usage-calibration-reconcile`（worker）/`usage-calibration-reconciler`（ai-runtime）· `worker-job-wakeup`（db）vs `worker-job-wakeup-redis`（worker）· `free-text-route`（domain）/`free-text-route-decision`（db）/`free-text-route-funnel`（worker）· `interview.service.ts`（api，Nest 点式）vs `interview-service.ts`（worker，kebab——rev1 误记「同名」，实为近名）· `qbank-track-local-retrieval` vs `qbank-track-local-retrieve`（并入旗舰行）。

计数（rev2 重数）：exact 同名 **17 组全部为 db↔domain 成对**（memory 8 + scoring 3 + privacy 2 + qbank 3 + ctx03 1）；跨树另 **8 组**（scoring-honesty · client · voice-stream-preview · public-preview · report · cloud-readiness · cloud-test-serial · adaptive-interview）；近名族 **6 族**；惯例豁免 3 类（Next actions/route · main.ts · tsx/hooks 约定）。

### 2.4 大平铺（按域内聚缺失）

| 位置 | 文件数 | 可识别域簇（≥2 文件） |
|------|--------|----------------------|
| `apps/worker/src` | **83 平铺** | r4 31 · qbank 6 · interview 6 · cloud 6 · rag 3 · quiz 3 · adaptive 3 · voice 2 · privacy 2 · model 2 · job 2 · diagnosis 2 |
| `packages/db/src` | **70 平铺**（+tenant/ · 71 总） | memory 10 · qbank 10 · interview 5 · privacy+uc052+vector-plane 6 · scoring 3 · retrieval+rag-corpus 4 · context-compression+ctx03 4 · checkpoint 2 |
| `packages/domain/src` | **50 平铺** | memory 9 · scoring 5 · qbank 3 · rag 2 · privacy 2 · ctx0x 4 · mem0x 2 |
| `packages/ai-runtime/src` | 48（3 子目录已存在） | voice 3 · g7 3 · langfuse 2 · offline-eval 2 · usage 2 · model-operation 2 |
| `apps/api/src/platform` | 11 平铺 | guard×4 · service×3 · filter/pipe/其他×4 混放 |

### 2.5 scripts/ 根堆积

根 79 文件 vs 子目录 8 个 140 文件。根中 **38 个 `*.proof.mjs` 一次性 prove** + **11 个 `mysql-stack.*`**——rev2 实测澄清：根 11 个是 **S4 legacy path forwarder（转发层）**，真身在 `scripts/conn-stack/`（根文件头自证「S4 legacy path forwarder → scripts/conn-stack/… · Keeps root package.json aliases working」）——这是 e2e 目录契约 S4 的**已落地形态**，非「同名双份易混副本」，DIR-1 **无权动**（见 §4.2）。根 `package.json` 有 **248 处 `node scripts/…`** 引用 + 7 个 workflow 少量引用 → 移动 scripts 必须同步改 package.json 路径（B6 最重，最后做），且 `scripts/**.mjs` 内部还有 repo 相对路径串改面（62 文件级前置扫描，§4.2）。

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
                  处，等待整体退役评估；**移动 ≠ 关闭任何 r4/R4/FUNNEL backlog 债行**，见 B3）；
                  根留装配锚点：main.ts · production-config.ts · cost-configure.ts ·
                  drain-loop.ts · owner-queue-drain.ts —— 其中 **cost-configure.ts 点名钉根**
                  （`docker/compose.prod.yml:231` 容器启动命令直接引
                  `apps/worker … src/cost-configure.ts`，移动即破坏生产镜像启动路径）
apps/web/         app/（Next 路由）· components/ · lib/ 现状即目标（lib 平铺 8 文件可后续
                  归入既有子目录，非本刀必须）
```

**docker/ops 引用面（rev2 补 · B1/B3/B6 前置盘点必查）**：`docker/compose.prod.yml:230-231`（db `src/migrate-cli.ts` + worker `src/cost-configure.ts` 容器命令）· `:240/:269`（api/worker `src/main.ts`）· `docker/Dockerfile.ha-dual:38`（worker `src/main.ts`）· `docker/compose.ha-dual.yml:7` + `compose.ha-dual.shared.yml:8/:18`（`scripts/ha/*` 引用）· `docker/env/worker.env.example:171`（注释引 `apps/worker/src/interview-service.ts` 路径字符串）· `ops/deploy/*`（remote-deploy/bootstrap 脚本，B6 前逐文件扫）。→ B1 锚 `migrate-cli.ts` 留根；B3 锚 `main.ts`/`cost-configure.ts` 留根且移动 `interview-service.ts` 前须核 `worker.env.example:171` 注释同步（注释行属路径文本白名单）；B6 锚 `scripts/ha/` 不动。

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
0. **批前重查**（rev2）：开批前重跑 `git fetch` 对齐 tip，并重查 ①`ai-docs/skills/testing/sop.md`（变更后测试仪式）②**W 线冻结序**（`harness/w1*`/`w1b-*`/`w2-resource-sizing-receipts` 等收据线的排队与文件面；W2 prep 先例「F8/W1 parallel noted · Ban blocking either」——DIR 批**不得阻断**在飞 W 线，也不得移动其冻结面）③loop §3 文件冲突表现态。任一命中本批文件面 → 该批顺延并在批 REQUEST 声明。
1. 只用 `git mv`（保 rename 历史，`--find-renames` 可证 R100）。
2. 同步改且只改四类「路径文本」（rev2 补第四类）：① 包内相对 import；② 包桶 `src/index.ts` re-export 行；③ 根/包 `package.json` script 路径与 workflow 引用；④ **（仅 B6）`scripts/**.mjs` 内 repo 相对路径串（`scripts/…` 目标路径）与 `./lib`、`../` 文件相对 import**——此类的改面以 **62 文件级前置扫描**为前提（见 B6）。**零其他内容改动**。
3. 跨包边界不受影响：apps 只经 `@meetwise/*` 桶 import（根 tsconfig paths + 各包 exports 锚定；唯一 subpath `@meetwise/ai-runtime/g7-bootstrap` 的锚文件不动）。
4. 每批一个独立 worktree/branch，走 §3 loop 全程（预执行双审 → 授权 → mv → prove → post 双审 → nail）。
5. 批间串行（同线一刀一 REQUEST）；上一批 nail 前不开下一批。

### 批次表（rev2）

| 批 | 范围 | 文件量 | 前置/冲突声明 | 主要风险 |
|----|------|--------|----------------|----------|
| **B1** | `packages/db/src` 域文件夹化（逐文件落位见 §4.1，**65 mv** + 5 根锚 + tenant/ 原地） | 65 mv | 无在飞冲突；`migrate-cli.ts` 钉根（`docker/compose.prod.yml:230-231` 容器命令直引） | 桶 562 行 re-export 改写面大；test/ 66 个 proof 引用包内相对路径须同批改 |
| **B2** | `packages/domain/src` 域文件夹化（memory/ scoring/ qbank/ privacy/ routing/ context/ rag/） | ~35 mv | 无在飞冲突 | 同上（桶 514 行；test/ 26 proof） |
| **B3** | `apps/worker/src` 域文件夹化 + `smoke/` 同名 2 文件消歧（~70 mv）；**排除 `checkpoint-principal.ts`**（隐私主线在飞；待其 nail 后补批 B3b 或原地保留）；**锚根不动**：main.ts · cost-configure.ts（docker `:231`）· production-config.ts | ~70 mv | 见通用律 0 批前重查 | main.ts 25 相对 import；test/ 113 proof；`worker.env.example:171` 注释路径串；**r4-* 31 文件移入 `r4-evidence/` 不关闭任何 r4/R4/FUNNEL 债行**（backlog 字节不动） |
| **B4** | `apps/api`：platform/ 维持、resume 件不动；**整批后置**至 SSE-PUSH 线 nail（`interview.controller/service` 954 行在被碰面） | ~0-8 mv | **DEFERRED**：SSE-PUSH 在飞 | 与功能刀撞文件 |
| **B5** | `packages/ai-runtime/src` 补域文件夹 + `ai-graphs` 同茎消除（17 文件中 1 并目录） | ~20 mv | **DEFERRED**：TOKSTREAM 线碰 ai-runtime；g7-bootstrap.ts 锚点禁动 | 同上 + exports subpath |
| **B6** | `scripts/` 根归位（rev2 收窄）：38 个根 `*.proof.mjs` + 无簇运维件 → 子目录；**mysql-stack.\* 11 个根转发文件原样保留**（契约 S4 landed 态，见 §4.2）；`run-e2e*` / `isolated/` / `conn-stack/` / `e2e-platform/` / `ha/` / `lib/` 不动 | ~40-50 mv + 248 处 package.json 路径 + 62 文件级路径串扫描 | **预裁定：禁新建 shim/转发别名**——被移脚本的旧路径一律直接改 package.json/workflow 引用，不造转发层；**前置盘点**=62 文件扫描（§4.2）+ `ops/deploy/*` 引用扫 | 契约锚定文件留根；alias 面大 |
| **B7**（可选微批） | `apps/api/test/_neg-harness.ts` 去 `_` 前缀 | 1 rename | 先证 runner glob 不依赖 `_` 前缀 | 探测后决定做/不做 |

**推荐序**：B1 → B2 → B3 → B6 →（SSE-PUSH nail 后）B4 →（TOKSTREAM nail 后）B5 → B7。
**总量**：~200 个纯移动，6-7 批，每批一刀一 REQUEST。

### §4.1 B1 逐文件落位清单（packages/db/src · 70 平铺全量 · rev2 新增）

域簇（≥2 文件）入域文件夹；单件域亦给独占文件夹（桶外全移，根只留锚点）：

| 目标文件夹 | 文件（70 平铺中） | 数 |
|------------|------------------|----|
| `memory/` | memory-admission · memory-control-surface · memory-fact-adjudication · memory-governance · memory-index-generation · memory-store · memory-summary-tree · memory-summary · memory-two-stage-recall · memory-vector-chunk-erasure | 10 |
| `qbank/` | qbank-curation · qbank-embedding-compute-cache · qbank-generation-projection · qbank-generation-retrieval · qbank-ingest · qbank-miss · qbank-provider-input · qbank-retrieval-cache · qbank-route-scope-cache · qbank-track-local-retrieval | 10 |
| `interview/` | interview-answer-dual-write · interview-event · interview-graph-lease · interview-jobs · interview-question | 5 |
| `privacy/` | privacy-authorization · privacy-erasure-preview · uc052-checkpoint-physical · uc052-external-sink-async-purge · uc052-internal-erasure · vector-plane-erasure | 6 |
| `scoring/` | scoring-aggregation · scoring-evidence-conflict · scoring-fact-root | 3 |
| `retrieval/` | retrieval-backend · retrieval-legacy · retrieval-store · rag-corpus-versioning | 4 |
| `context/` | context-compression-dispatch · context-compression-erasure · context-compression-snapshot · ctx03-event-source | 4 |
| `checkpoint/` | checkpoint-privacy · checkpoint-thread | 2 |
| `commerce/` | commerce · payment | 2 |
| `model-op/` | model-invocation · model-operation-admission · usage-calibration · ai-cost-governance · online-judge-control | 5 |
| `jobs/` | diagnosis-jobs · quiz-jobs · gateway-dispatch · worker-job-wakeup | 4 |
| `routing/` | candidate-route · free-text-route-decision · job-route-decision | 3 |
| `transcript/` | int-transcript · int-transcript-projection | 2 |
| `audit/` | audit | 1 |
| `recruiting/` | recruiter | 1 |
| `resume/` | resume | 1 |
| `notification/` | notification | 1 |
| `report/` | report | 1 |
| **根锚（不动）** | index.ts · principal.ts（2077 行 · SPLIT-1 候选 · docker/env 引用面广）· migrate.ts · migrate-cli.ts（`docker/compose.prod.yml:231` 直引）· isolated-test-target.ts（e2e LIVE 目标解析锚） | 5 |
| **原地** | tenant/（已是文件夹） | (1) |

核对：10+10+5+6+3+4+4+2+2+5+4+3+2+1+1+1+1+1 = **65 mv** + 5 根锚 + tenant/ = 71 ✓（rev1 估 ~50，rev2 逐文件实数 **65 mv**）。桶 `index.ts` 562 行 re-export 同批改写；`packages/db/test/` 66 proof 中引用 `../src/<file>` 相对路径者同批改（属白名单①）。

### §4.2 B6 前置扫描与契约裁定（rev2）

1. **62 文件级扫描（前置盘点，产出逐文件清单入批 REQUEST）**：扫描命令钉死——
   ```bash
   grep -lE "['\"\`](\./lib|\.\./|scripts/|apps/|packages/|e2e/)" scripts/*.mjs scripts/*.sh
   ```
   rev2 复扫实测：**67/79** 根脚本含 repo 相对路径串（`scripts/` 34 文件 · `apps/` 23 · `packages/` 15 · `./lib` 5 · `e2e/` 2 · `../` 0，并集 67；其中文件移动敏感面 `./lib|../|scripts/` 并集 37 文件）。协调方处方记 62 —— 口径差 = 扫描正则覆盖面（是否含 `apps/|packages/|e2e/` 串）；**以本命令实测为准**，B6 批 REQUEST 落逐文件清单后此差异消解。
2. **mysql-stack.\* 根转发层 = 契约 S4 landed 态（rev2 勘误）**：实测根 `scripts/mysql-stack.skeleton.proof.mjs` 文件头自证 =「**S4 legacy path forwarder → scripts/conn-stack/…** · Keeps root package.json mysql-stack:\*:prove aliases working」——真身在 `scripts/conn-stack/`（11 文件），根 11 文件是**转发层**。**B6 裁定：根转发层原样保留不动**（连桶移动都不做）；任何「并入 conn-stack/」「删根转发」「改别名」都属 e2e 目录契约（S4）变更，**须契约修正案前置另刀**，非本刀权限。
3. **禁 shim 预裁定**：B6 移动 38 个 `*.proof.mjs`/运维件时**禁止新建任何转发 shim/别名层**保旧路径——旧路径引用一律在 package.json（248 处 `node scripts/`）与 workflow（7 个）内直接改指新位置。仓内唯一合法转发层 = 既有 mysql-stack 根转发（上条）。

### 零行为变更证明（rev2 · 真实命令面）

**rev1 勘误**：rev1 写的 `pnpm -C <pkg> typecheck && build && test` 是**不存在的命令**（各包 package.json 无 `typecheck`/`build`/`test` script；turbo 虽定义 task 但包未接线）。rev2 改为仓库真实命令面：

**(a) 类型面（每批必跑 · 经 `pnpm exec`，不新增包级 script）**：

```bash
pnpm install --frozen-lockfile                                # EXIT=0（lockfile 零改动本身即证明）
pnpm exec tsc -p packages/db/tsconfig.json --noEmit           # B1（示例；各批替换为对应包）
pnpm exec tsc -p apps/api/tsconfig.json --noEmit              # 消费方（B1/B2 后必跑）
pnpm exec tsc -p apps/worker/tsconfig.json --noEmit           # 消费方（B1/B2/B3 后必跑）
```

> 若某包 prove 需要**新增** package.json script（如批量 prove 入口），该 script 名必须在该批 REQUEST **显式单列白名单**并说明为何不可用现有命令；未单列即新增 = 批作废。

**(b) prove 面（每批全绿清单 · 全部为现存 script，零新增）**：

| 批 | 包 | prove 全绿清单（`pnpm -C <pkg> <name>`，EXIT 全 0） |
|----|----|------------------------------------------------------|
| B1 | packages/db（67 script 中 prove 类全列） | `prove`（需 dev postgres 容器 · `docker exec … psql < proof/primitives.sql`）· `commerce` · `resume` · `recruiter` · `growth` · `migrate` · `prove:vectorstore` · `prove:migrate` · `prove:migrate-cli` · `prove:uc017-orphan` · `prove:uc017-nhp-load` · `prove:uc018-abandon` · `prove:uc018-graph` · `prove:uc011-report-refund` · `prove:uc019-report-regenerate` · `prove:uc002-lease` · `prove:qbank-control-role` · `prove:qbank-handoff-closure` · `prove:qbank-source` · `prove:qbank-cache` · `prove:rag-corpus-version` · `prove:rag-control-role` · `prove:rag-control-upgrade` · `prove:rag-control-dispatch` · `prove:ai-cost` · `prove:runtime-role` · `prove:principal-config` · `tenant-enforcement:prove` · `prove:tenant-wiring-e5` · `prove:tenant-wiring-neg` · `prove:isolated-target` · `prove:privacy-authorization` · `prove:uc052-internal-erasure` · `prove:uc052-external-sink-retention` · `prove:uc052-external-sink-async-purge` · `prove:uc052-checkpoint-physical` · `prove:memory-governance` · `prove:memory-admission` · `prove:memory-fact-adjudication` · `prove:memory-index-generation` · `prove:memory-two-stage-recall` · `prove:memory-control-surface` · `prove:ctx03-event-source` · `prove:int-transcript-answer-fact-root` · `prove:int-transcript-remaining-sinks` · `prove:int-answer-dual-write-fence` · `prove:scor-01/02/03` · `prove:embed-compute-cache` · `prove:rag03-route` · `prove:rag04-track-local` · `prove:rag03-filter-locus` · `prove:rag03-hnsw-completeness` · `prove:rag03c-exactk-observe` · `prove:rag05-qbank-miss` · `prove:rag06-route-scope-cache` · `prove:rag07-free-text-route` · `prove:mem02-summary` · `prove:mem03-summary-tree` · `prove:ctx04-compression-snapshot` · `prove:ctx05-concurrency-recovery` · `prove:ctx06-deletion-closure` · `prove:memory-vector-chunk-erasure` · `prove:vector-plane-erasure` · `prove:privacy-erasure-preview` · `prove:retrieval-backend-qdrant` |
| B2 | packages/domain（26 script 全 prove） | `prove:auth` · `prove:privacy-authorization` · `prove:privacy-erasure-preview` · `prove:adaptive` · `prove:adaptive-redesign` · `prove:adaptive-length` · `prove:adaptive-signals` · `prove:signal-sse` · `prove:grounded` · `prove:crag` · `prove:research-policy` · `prove:critique` · `prove:question-generation-fail-closed` · `prove:web-explore` · `prove:resume-extract` · `prove:rag-chunking` · `prove:rag-retrieval-acl` · `prove:ctx-01-input-routing` · `prove:scoring-operation-routing` · `prove:scoring-honesty` · `prove:mem07-injection-fence` · `prove:mem09-lifecycle-triggers` · `prove:memory-vector-chunk-deletion` · `prove:sealed-ocr-binding` · `prove:sealed-job-route-classify-binding` · `prove:r4-p-planner-unit` |
| B3 | apps/worker（119 script 中非 r4 prove 全列；r4 prove 见注） | `prove:resume` · `prove:report` · `prove:flow` · `prove:interview` · `prove:voice` · `prove:stress` · `prove:quiz` · `prove:diagnosis` · `prove:ocr` · `prove:reaper` · `prove:commerce-reconcile` · `prove:uc018-ttl` · `prove:uc016-nhp-fault` · `prove:model-invocation-reconcile` · `prove:model-op00-db-state` · `prove:security` · `prove:memory` · `prove:drain` · `prove:interview-dispatch` · `prove:interview-dispatch-pg` · `prove:owner-drain-order` · `prove:quiz-dual-claim` · `prove:quiz-dual-claim-pg` · `prove:job-wakeup` · `prove:job-wakeup-redis` · `prove:adaptive-*`（13 个：flow/life/consumer/voice-adaptive/degrade/grounding/offtopic/chaos/latency/signals 等）· `prove:signal-sse` · `prove:qbank` · `prove:qbank-pipeline` · `prove:qbank-generation` · `prove:qbank-integrity-upgrade` · `prove:qbank-retrieval-eval` · `prove:reqid` · `prove:scoring-integrity` · `prove:scoring-golden` · `prove:agent-skills` · `prove:window` · `prove:rag-cost` · `prove:model-cost` · `prove:model-cost-metrics` · `prove:rag-cost-runtime` · `prove:rag-redis-cache` · `prove:rag-redis-config` · `prove:cloud-readiness` · `prove:cloud-smoke-fc` · `prove:cloud-test-serial` · `prove:cloud-test-ledger` · `prove:cloud-test-fc` · `prove:uc052-pool-role-leak` · `prove:checkpoint-runtime-role` · `prove:checkpoint-privacy-erasure` · `prove:privacy-erasure-pause-upgrade` · `prove:resume-erasure-tombstone` · `prove:resume-derivative-reference` · `prove:online-judge-control` · `prove:production-config` · `prove:rag-control-runtime` · `attack` · `prove:r1-tech-role-fail-closed` · `prove:g4-*`（2） · `prove:r4-*`（31，**全跑**——移动 r4-evidence/ 后须逐个证明 prove 别名仍解析）· `prove:r2-*`（8） |
| B6 | 根 package.json | `pnpm docs:check` · `pnpm regression:core` · 被 B6 移动脚本对应的每个根 `pnpm <name>:prove` 别名逐个 EXIT=0（含 `golden-tasks:prove` · `generation-trust:prove` · `e2e-parity:prove` · `e2e-static-guards:prove` · `e2e-case-inventory:prove` · `quality:*` · `provider-egress:*` · `public-preview-write:*` · `secrets:check-staged` 等）；**mysql-stack:\*:prove 别名须全绿证转发层未破坏** |

> 注：live/Key 类 prove（`e2e:isolated` · `e2e:ui:isolated` · `verify:e2e-performance` · `smoke:tts-download-live` · `cloud:test` 等）**不在迁移批 prove 面**——纯移动不触运行时语义，且 live 面归 G7/HA 线管；批 REQUEST 如需例外须单列。
> 注：`packages/db prove`（primitives.sql）与部分 pg 依赖 prove 需本地 dev postgres（`pnpm db:up`）——批前起栈属环境准备，非行为变更。

**(c) rename 面（每批必附）**：

- `git diff --find-renames --stat <base>...HEAD`：除 §4 通用律 2 四类路径文本行外**全为 R100 rename**；`git diff -M100% --diff-filter=M` 逐文件核对仅路径文本变化；`git status` 干净；lockfile `git diff --quiet pnpm-lock.yaml` EXIT=0。

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
9. **Ban 关债叙事**（rev2）：B3 移动 31 个 `r4-*` 文件**不关闭、不洗涤任何 r4/R4/FUNNEL/G-R4-5 backlog 债行**——`gap-bug-backlog.md` 相应行字节不动，移动 ≠ 退役 ≠ closed。
10. **Ban 新建 shim/转发别名**（rev2 · B6 预裁定）：被移脚本旧路径一律直改引用处；仓内唯一合法转发层 = 既有 mysql-stack 根转发（S4 landed，§4.2）。
11. **Ban 跳过批前重查**（rev2 · 通用律 0）：未重查 SOP/W 线冻结序/loop 文件冲突面即开批 = 批作废。

---

## 6. 成功标准（本 docs-only 批 · rev2）

- [x] 只读盘点落盘（§1 结构图 + §2 量化清单；rev2 含勘误：两树旗舰行 + n=749/kebab=744 + db 70 平铺 + ai-graphs 17 + 散件 15 + helpers 12 + 补录 scoring-honesty/client）
- [ ] 本 REQUEST（rev2）+ slice + 双 stub（mw-e2e-ha / mw-model-op）同步修订齐
- [ ] rev2 七项处方逐条对应：①§4 真实 prove 命令面（逐包 prove 全绿清单 + `pnpm exec tsc -p --noEmit`；新增 script 须单列白名单）②通用律 2 第四类白名单 + §4.2 62 文件扫描 ③§4.2 mysql-stack 根转发层 = S4 landed 保留 ④R2 cost-configure.ts 钉根 + docker/ops 引用面 ⑤旗舰行勘误 + 五处计数实值 ⑥§4.1 B1 逐文件落位（65 mv）⑦B3 r4 债行不关 + B6 禁 shim + 通用律 0 批前重查 SOP/W2 冻结序
- [ ] 重审（协调方派）预执行双审 BOTH `Verdict: PASS`
- [ ] `git show --stat` = 恰 4 个修改 md（本 rev2 commit）· 零代码 / 零 package.json / 零 SSOT
- [ ] 后续每批：真实 prove 面全绿 + `--find-renames` R100 证明 + post 双审 + nail 授权
- [ ] **修完即停**：本 rev2 不 mv 任何文件，STOP 等重审

---

*DIR-1 REQUEST rev2 · 2026-10-07 · tip `0fe96fca` · releaseEvidence=false · NOT_HA · 七项处方已并入 · awaiting re-review · STOP*

# UC017-ORPHAN-HTTP-SSE REQUEST — UC-E2E-017 孤儿预占对账 HTTP/SSE 注入进隔离收据刀（修法=HTTP/SSE 注入面 prove 一行一 case·零 covered 发明·零 live key·EXEC 期容器依赖预登·docs-only REQUEST 卷·起草落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 五面行使落卷·门矩阵十门 EXIT 原值入收据·alone≠dual·本 commit 不预 claim 任何 post-commit 升格——翻面与 covered 评估权归协调方 post 双审链）

**席位**：UC-017 分面行收口起草席（协调方派·单责起草·诊断锚已并入 §0/§1）。
**基线**：`origin/main` @ `38f6e7d78`（`38f6e7d78d29b263b29b43e5fc3fae2a8e3f591d`·fetch 后亲证 origin tip 同指）· 分支 `line/uc017-draft`（建前已存同名树为前次中断残树：零独有提交+零本卷文件亲证后 `reset --hard origin/main` 归位=等效新建）· 工作树 `meetwise-uc017`（仓根同级）· docs:check **2343≤cap 2354 本树亲跑 EXIT=0**（本卷 +1 预期 2344 仍绿）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/harness/reconcile-retry-REQUEST.md`（形制范本·§0-§8/停止条件四类/Ban-pins 形制沿承）→ `ai-docs/delivery/harness/uc-e2e-017-orphan-reservation.md`（既有 017 集成 harness·`:35-42` 非目标自证=本刀靶面）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（`:122` 六列行靶·`:148` PERF/LOAD 批B行**零触**·`:180` §1 行·`:265` P0-5 行）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（`:61-63` NHP-017 既有行）→ 涉事机制源 `apps/api/src/modules/interview/interview.controller.ts`/`apps/api/src/modules/interview/interview.service.ts`/`packages/db/src/commerce/commerce.ts`/`apps/worker/src/commerce-reconcile.ts`/`apps/api/test/_neg-harness.ts`/`apps/api/test/uc-e2e-018-user-abandon-http.proof.ts`/`apps/api/src/platform/sse-pump.ts`/`scripts/run-e2e-isolated.mjs`。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①矩阵 `:122` 行读法列「HTTP/SSE 注入未进 isolated」（六列现状亲证=§1.1）；②集成 proof `:13`（「Do NOT claim covered until e2e:isolated includes an HTTP begin-fail inject」）+`:139`（`BLOCKED_FOR_FULL_E2E: HTTP begin-fail inject / SSE-after-commit orphan not in e2e:isolated yet`）双自证；③既有 harness `:19`/`:39`/`:73`/`:90` 非目标自证（「产品 HTTP 故障注入另包」）；④矩阵 `:265` P0-5「仍缺 HTTP begin-fail / SSE 注入进 `e2e:isolated`」；⑤协调方派单 brief（2026-10-26·北星门① 分面行·HTTP/SSE 注入进 isolated·PERF/LOAD 归批 B 零触·STOP=draft）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 sed/grep/Read/`git hash-object` 实测 @`38f6e7d78`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list` 建后 **30** 树实测（主仓+29 支线树）；`git branch --list "line/uc017*"` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | grep uc017` 建前恰 2 命中（`uc-e2e-017-orphan-reservation.md`/`gap-uc017-load-sweep-nhp.md` 皆既有非本卷）→ `uc017-REQUEST.md` 全史零命中（`git log --all --diff-filter=A -- ai-docs/delivery/harness/uc017-REQUEST.md` 空）=落卷后唯一同名卷=本卷。
- **在飞交叠复核（2026-10-26 本树亲跑）**：协调方点名的在飞分支 `line/nhp-batch-a-draft`/`line/nhp-batch-b-draft`/`line/nhp-c-draft`/`line/uc019-draft`/`line/online-pay-draft`/`line/rag02-draft`/`line/event-ttl-draft` 对 UC-017 触面（两 proof `.ts`+两 harness `.md`+`interview.controller.ts`+`interview.service.ts`）merge-base diff 逐树亲跑 **全部 0 命中**——「NHP 批 A/B/UC-019 均不触 UC-017」亲证成立。其余本地旧支线对触面的 `origin/main..` 命中均为旧基线未并所致历史噪声（分支已并/已废·非在飞刀·沿 reconcile §0.0 复核先例判读）。**EXEC 立项日照本规则对届时在飞分支重跑**。
- 同名命令占用查：`grep -n "orphan-http-sse" package.json apps/api/package.json` 建前零命中亲证=新命令名无撞面。

### 0.1 blob 锚表（`git hash-object` 亲算 @`38f6e7d78`）

| 文件 | blob（8 hex·行数） | 关键行锚 |
|---|---|---|
| `packages/db/test/uc-e2e-017-orphan-reservation.proof.ts` | `f4b8b0d3`（144 行） | **`:5` 头注自证「NO MODEL_API_KEY, NO HTTP e2e:isolated scenario」·`:13` 「Do NOT claim covered until e2e:isolated includes an HTTP begin-fail inject」·`:54-78` O1/O2-sync（reserve→reserved→release→released+额度回补）·`:80-97` O2-sweeper（租约回拨→`reconcile`→staleReleased≥1）·`:99-114` O3 同键幂等（duplicate·恰 1 行·不双扣）·`:116-134` O4 跨主体 RLS（0 行+release not_found）·`:139` `BLOCKED_FOR_FULL_E2E: HTTP begin-fail inject / SSE-after-commit orphan not in e2e:isolated yet`（缺口自证句）** |
| `ai-docs/delivery/harness/uc-e2e-017-orphan-reservation.md` | `497b9f11`（90 行） | **`:19` 「必须钉死，直至 `e2e:isolated` 显式纳入 HTTP begin-fail 注入场景」·`:35-42` 明确不测表·`:39` 「HTTP `POST …/begin` 故障注入 + SSE 建连失败 E2E｜当前 begin 内 `reserve+enqueue` 同事务；真孤儿需 commit 后故障点 / 进程崩溃；尚未进 `e2e:isolated`」·`:73` 「`uc017:orphan:prove` 绿 = covered」假绿标红行·`:90` 「产品 HTTP 故障注入另包」** |
| `apps/api/src/modules/interview/interview.controller.ts` | `d10db4ae`（280 行） | **`:28-32` `@Post(':id/begin')` 202（HTTP 扣额开面嘴）·`:154-159` `@Post(':id/abandon')` 200（「对接 commerce saga release 路径」=HTTP 补偿嘴）·`:257-279` `@Get(':id/events')` SSE（`:262` 槽满 429 `too_many_streams` 零取数副作用·`:267` isTerminal 集·`:268-277` `pumpSseEvents` hijack 泵）** |
| `apps/api/src/modules/interview/interview.service.ts` | `a8ae0d15`（918 行） | **`:94-102` `beginInterviewCore` 注记（扣额路由+入队合一事务）·`:217`/`:231` begin 幂等（已有 start job→`alreadyBegun` 不再扣额不再入队）·`:255-256` reserve 双路由（application→`reserveEntitlementForApplication`/NULL→`reserveEntitlement`）·`:285` `enqueueInterviewJob` ·`:288` 「start 臂同事务回滚=上方扣费预留同滚（零悬账）」（**同事务=HTTP 层 begin-fail 不产孤儿**的机制句）** |
| `packages/db/src/commerce/commerce.ts` | `20b7613e`（691 行） | `:47` `reserveEntitlement` ·`:118` `reserveEntitlementForApplication` ·`:282` `releaseConsumption` ·`:500` `abandonInterviewAndRelease` ·`:553` `availableUnits` ·`:666-669` `reconcile`（返回 `staleReleased`/`settled`/`swept`） |
| `apps/worker/src/commerce-reconcile.ts` | `73772ac2`（142 行） | **`:2-9` 头注「商务对账的生产调度侧（C1:把已写好、零生产调用方的 reconcile/sweep/settle 真正接进 worker）·一拍=枚举有『待回收』的 owner(租约过期的孤儿预留 或 pending 结算 outbox)→每 owner 各跑 reconcile」·`:34` `reconcileOwner(pool, owner)` 导出形（生产调度嘴·本刀件①直调同一函数）** |
| `apps/api/test/_neg-harness.ts` | `9768b323`（330 行） | **`:50-57` `boot()` env 形（`AUTH_DEV_HEADER` 等）·`:61-62` `delete process.env.MODEL_API_KEY`/`MODEL_BASE_URL`（**零 live key 承载体**·rev2 OBS-A 收窄：`:60` 系注释行不属删除承载面）·`:63` `createApp()` 零参编译·`:63-66` `createApp()`+`assertIsolatedTestTarget`·`:111-126` `interview_privacy_active` 最小镜像+`:212-225` `assert_interview_privacy_active`（rev2 P2-1 归因锚）·`:283-284` `app.listen(0,'127.0.0.1')` 真 HTTP·`:29-37` `Harness` 返回面+`:324-329` boot() 返回五件套（均无 app 句柄·rev2 P1 无 override 缝锚）** |
| `apps/api/test/uc-e2e-018-user-abandon-http.proof.ts` | `720f383d`（267 行） | **`:2` 头注「real POST /interview/:id/abandon」·`:108-130` H1 臂形（DB 侧 seed reserve→HTTP abandon→200+released+额度净零）·`:170-172` HTTP begin 409 臂·`:246-255` 404/401/409 守卫臂群（同形范本）** |
| `apps/api/src/platform/sse-pump.ts` | `b93121dc`（223 行） | `:83` `export async function pumpSseEvents`（SSE 泵单源·断连/终态/心跳语义承载） |
| `scripts/run-e2e-isolated.mjs` | `f89fb27c`（3348 行） | **`:2766` `const container = meetwise-e2e-${pid}-${Date.now()}`（**一次性 PG 容器=EXEC 期容器依赖本体**·只删自建 `meetwise-e2e-*` 族）·`:53` `writeLocalIsolatedReceipt`（隔离收据落盘口）·头注 `:21`/`:25` 「在独立、临时的 PostgreSQL cluster 上运行…绝不触碰开发数据库或开发容器」（rev P2-2 行锚修正·引文不变）·**目标注册面三件（rev2 P0-2 补 pin·本次 P0 根因=该面未 pin）**：目标白名单 `:2237` 族行（`'uc017:orphan:prove:raw'` 等条目所在·新目标零命中即 `:2346-2348` `throw unsupported_e2e_target`（`:2347` 亲证））·`isolatedCommand` 分支链 `:2352-`（uc018 http 分支 `:2390-2391` 同形）·`isolatedReceiptSources` `:93` 起（017 条目 `:1232`·018 http 条目 `:1257` 同形）·LIVE 门 `:2901`** |
| `package.json`（根） | `5bdf3111`（692 行） | **`:127-130` uc017 族注册现形：`uc017:orphan:prove`/`:raw`→`pnpm -C packages/db prove:uc017-orphan`+`uc017:nhp-load:prove`/`:raw`（件② 同族同形落点）·`:135-136` `uc018:abandon:http:prove`/`:raw`→`pnpm -C apps/api prove:uc018-abandon-http`（**HTTP prove 注册同构范本**）** |
| `apps/api/package.json` | 见 §0.1 附注 | `:36` `prove:uc002-http` / `:39` `prove:uc018-abandon-http`（`node --import @swc-node/register/esm-register test/*.proof.ts` 形=件② api 侧行同构范本） |
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `788423b1`（519 行） | **`:122` 六列行 `UC-E2E-017｜partial｜partial｜partial（sweeper）｜blind｜HTTP/SSE 注入未进 isolated`（翻面靶·翻面权归协调方）·`:148` `UC-E2E-011 / 017 / 019（钱/对账）` PERF/LOAD 行（**批 B 行 6·本刀零触**）·`:180` §1 行（`eval/uc-e2e-017-orphan-reservation.eval.md` 引用为卷内叙述名·仓库无独立 eval 目录文件·沿现状零改）·`:265` P0-5 行** |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `e6c669ba`（189 行） | **`:61` `NHP-017-FAULT-01`（partial·`uc017:orphan:prove`）·`:62` `NHP-017-BOUND-01`（partial·同上）·`:63` `NHP-017-LOAD-w-01`（blind→case-only·Line Y nail·**批B面零触**）——件④ 净增行落位=同表 017 区之后 append** |
| `ai-docs/delivery/harness/gap-uc017-load-sweep-nhp.md` | `8194e1f6`（119 行） | 批B LOAD 面既有 harness（旁证引用·本刀零触） |

### 0.2 派单简报核实登记（结论零变·如实精化）

1. 简报「UC-017 HTTP/SSE 注入进 isolated·矩阵 :121 区」——**核实成立**：靶行实为 `:122`（`:121` 为 `UC-E2E-016/029` 行尾·`:121-122` 同屏亲证）；缺口三处自证一致（§0.1 行 1/2/4 blob 锚）。
2. 简报「PERF/LOAD 归批 B 行 6 不碰」——**核实成立**：`:148` 行即批 B 区第 6 行（`UC-E2E-011/017/019 钱/对账`·其 LOAD_w 半已由 Line Y nail 收口）·本刀全部交付面对该行零字节（§2 门 10 机检钉）。
3. 简报「EXEC 期容器依赖如实预登」——**核实成立并预登**：`run-e2e-isolated.mjs:2766` 一次性 Docker PG 容器为执行硬前置·§2 门 9+§4 预登（docker 不可用=`blocked` 停上报·非验收红）。
4. 简报「另一 agent 可能已动」——**核实未动**：§0.0 在飞七分支逐树 0 命中+`uc017-REQUEST.md` 全史零命中+六列行 `:122` 与 `38f6e7d78` 亲证逐字节同前——先验未闭成立·本卷继续。

### 0.3 迁移号登记（零迁移刀）

- 本刀 **零迁移**（纯 prove+harness+注册行·`packages/db/migrations/` 零触）——无占号诉求；EXEC 期若发现需 DDL 即触停止条件「越界需要」停上报。

## §1 红事实（机制链·全部亲证 @`38f6e7d78`·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 UC-017 六列现状（矩阵 `:122` 行亲证·`788423b1`）

| 列 | 现值 | 读法 |
|----|------|------|
| 需求/能力ID | `UC-E2E-017`（孤儿预占对账） | 需求源 `e2e-scenarios.md` UC-E2E-017 |
| NEG | **partial** | 跨主体 404/RLS 有（O4·`neg:*` 旁证）·HTTP 真嘴 NEG 面未进 isolated |
| FAULT | **partial** | begin-fail 补偿+sweeper 有（O1/O2·DB 层）·**HTTP/SSE 注入未进 isolated（真缺口）** |
| BOUND | **partial**（sweeper） | 同键幂等有（O3·DB 层）·HTTP 幂等嘴未进 isolated |
| ADV | **blind** | 无对抗面用例（本刀不解决·如实保持） |
| 快乐路径盲区读法 | HTTP/SSE 注入未进 isolated | 本刀靶句·逐字亲证 |

**未闭判定**：无 covered 字样·FAULT/NEG/BOUND 皆 partial 非 covered·读法列缺口句在卷——先验未闭成立（已闭即翻面候选并停·未触发）。

### 1.2 既有 prove 面（集成半·`f4b8b0d3` O1–O4）

- O1/O2-sync（reserve→可观测 reserved→release→released+净零）·O2-sweeper（租约过期→`reconcile`→`staleReleased≥1`+回补）·O3（同键 duplicate·恰 1 行·不双扣）·O4（跨主体 RLS 0 行+`release`→`not_found`）——**全部经 `@meetwise/db` 函数直调·零 HTTP·零 SSE**（`:5` 头注自证）；命令 `pnpm uc017:orphan:prove`（runner 形）= `uc017:orphan:prove:raw`→`pnpm -C packages/db prove:uc017-orphan`（`package.json:127-128`）。
- 同族 DB 层第二件：`uc017:nhp-load:prove`（`40dbe245`·453 行·批B LOAD 面·Line Y nail 收据在卷）——本刀零触。

### 1.3 缺口分解与修法否决（三择一·采 (A)）

- **(A) 采·HTTP/SSE 注入面 prove 进 isolated（收据刀）**：以 `_neg-harness` 真 NestJS 栈+真 `POST /interview/:id/begin`/`abandon`/`GET …/events` 嘴重演 O1–O4 语义+sse-after-commit 面，产 CMD+EXIT 收据（G1）。三理由：①缺口真实（三处自证 §0.1·集成半与产品 HTTP/SSE 嘴之间零执行体）；②先例族现成（`uc018:abandon:http:prove`/`uc002:http:prove` 全链在飞绿态=同构范本·零新机制发明）；③零产品码触面（`apps/api/src` 零字节·prove-only 沿 UC-001 族先例）。
- **(B) 否决·直接翻 `:122` 行措辞/升 covered**：EXIT0=case≠covered（矩阵 §0 词汇表钉）；无收据的措辞变化=叙事≠证据（G1 硬句）；翻面权归协调方（沿 reconcile §3-6 先例）——本卷只产收据与 case 登记·升格评估归 post 双审链。
- **(C) 否决·进 full.e2e/live/真进程崩溃注入**：①`e2e:isolated` 全链路半绑 live `MODEL_API_KEY`（矩阵 §0 真业务 E2E 行）=零 live key 禁令直撞；②真 commit 后故障点=进程级 SIGKILL/跨进程 worker 编排——超本刀面（矩阵 harness `:39` 已如实钉「真孤儿需 commit 后故障点/进程崩溃」）；本刀以**fixture 租约过期注入**为诚实模拟形态预登（与集成半 O2-sweeper 同一注入语义·经真 HTTP 嘴+生产调度嘴 `reconcileOwner` 重演），进程级崩溃注入若需→另报协调方另刀（§3-5）。

## §1-修法（预期恰 5 件·零行为变更·零迁移·一行一 case）

- **件①（新 proof·恰 1 文件）**：`apps/api/test/uc-e2e-017-orphan-http-sse.proof.ts`——`_neg-harness.boot()` 真 HTTP 栈（9768b323 `:50-66` env+`:60-62` 零 live key 承载+`:283-284` 真监听）·`A()` 断言器不改·**一段一 case·case 表如下（一行一 case·全部 case-only·零 covered 发明）**：

| Case ID | 列 | 面 | 场景（简） | 期望（结构） | 当前旗 | 执行体 |
|---------|----|----|------------|--------------|--------|--------|
| NHP-017-HTTP-FAULT-01 | FAULT | api | HTTP begin 202→reserved 可观测→**fixture 租约过期注入**（commit 后故障的诚实模拟·`:39` 形态预登）→生产调度嘴 `reconcileOwner`（73772ac2 `:34`）回收 | `staleReleased≥1`·consumption=released·额度回补·HTTP GET 终态可读 | **case-only** | 件① |
| NHP-017-HTTP-COMP-01 | FAULT | api | HTTP 补偿嘴：begin 202+reserved→`POST :id/abandon`→200 `released` | 额度净零·interview=abandoned·复用 720f383d H1 臂形换 017 幂等键语义 | **case-only** | 件① |
| NHP-017-SSE-FAULT-01 | FAULT | api | begin 202 后 SSE 建连→客户端中断注入（abort/close）→SSE 拆除本身 | 拆除零假释放零新 orphan（原预占语义不变）；附 404 跨主体/429 槽满面（d10db4ae `:262`） | **case-only** | 件① |
| NHP-017-HTTP-BOUND-01 | BOUND | api | 同 interview 重复 HTTP begin（网络重试形） | 202 `alreadyBegun` 同 jobId·恰 1 行 consumption·不双扣（a8ae0d15 `:217`/`:231`） | **case-only** | 件① |
| NHP-017-HTTP-NEG-01 | NEG | api | 错主体 abandon/events（HTTP 真嘴 RLS） | 404 `not_found_or_forbidden`·原预占仍 reserved（O4 语义 HTTP 升面） | **case-only** | 件① |

  ADV 面**零触**（:122 行 ADV=blind 如实保持·本刀不解决不虚记）。件① 头注必带：`releaseEvidence=false · Not HA · 本绿 ≠ 全链路 E2E covered · ≠ UC-E2E-017 covered · EXIT0 = case ≠ covered`+fixture=pgvector green-risk/R5 注记+`:139` 自证句的 HTTP/SSE 半对照注记+0058 `interview_privacy_active`/`assert_interview_privacy_active` 注记（rev2 P2-1 归因改写：boot() 已内置 `interview_privacy_active` 最小镜像（9768b323 `:111-126`）+`assert_interview_privacy_active`（`:212-225` 0058 真函数体逐字）覆盖五 case 全隐私触点——proof 级 720f383d 形 stub（`:32-59`）系沿承防御面**可免装**；如装须注明形状差（harness 镜像=SECURITY DEFINER·018 形 stub=invoker-rights）·rev P2-1）。
- **件②（注册行·恰 6 行三文件）**：根 `package.json` 恰 2 行（`:127-130` uc017 族后 append）：`"uc017:orphan-http-sse:prove": "node scripts/run-e2e-isolated.mjs uc017:orphan-http-sse:prove:raw"` + `"uc017:orphan-http-sse:prove:raw": "pnpm -C apps/api prove:uc017-orphan-http-sse"`（`:135-136` 同构）；`apps/api/package.json` 恰 1 行（`:36`/`:39` 同族）：`"prove:uc017-orphan-http-sse": "node --import @swc-node/register/esm-register test/uc-e2e-017-orphan-http-sse.proof.ts"`；`scripts/run-e2e-isolated.mjs` 三处（沿 `uc018:abandon:http:prove:raw` 018 同形·约 6 行）：①目标白名单条目（`:2237` 族行内 append `'uc017:orphan-http-sse:prove:raw'`）②`isolatedCommand` 分支（`:2352` 链尾二行·uc018 http 分支 `:2390-2391` 同形：`: target === 'uc017:orphan-http-sse:prove:raw'` → `['pnpm', ['-C', 'apps/api', 'prove:uc017-orphan-http-sse']]`）③`isolatedReceiptSources` 条目（`:1257` 018 http 条目邻·017 条目 `:1232` 同形 append）。**rev2 P0-1 根因亲证（f89fb27c 届树）**：`uc017:orphan-http-sse:prove:raw` 白名单零命中→门 `:2346-2348` 立即 `throw unsupported_e2e_target`（`:2347` 亲证）——runner 不注册=件② 根 script 行指向的隔离门不放行·门 1 必红。**零新依赖**。
- **件③（harness 卷·恰 1 文件）**：`ai-docs/delivery/harness/uc-e2e-017-orphan-http-sse.md`——五 case 一行一 case 合同+CMD/EXIT 期望+假绿标红表+零 live key/容器依赖预登+矩阵锚点；**既有 `uc-e2e-017-orphan-reservation.md` 零字节改**（其非目标自证保留=诚实链）。
- **件④（case 矩阵净增·恰 5 行）**：`non-happy-path-perf-load-case-matrix.md` 017 区后 append 上表 5 行（旗=case-only·「登记未执行」·零改旧行零升格）；`e2e-requirement-coverage-matrix.md` **零字节**（`:122`/`:148`/`:180`/`:265` 全部只读——翻面与措辞更新权归协调方）。
- **件⑤（收据）**：`receipts/uc017-orphan-http-sse/00-exec.md`（**仓根 receipts/=非受管根·零 docs:check 增量**·沿 reconcile/evkind 件⑥ 先例）七字段：门矩阵全表 EXIT 原值+五 case PASS 名单+diff numstat+重 pin 全表+容器依赖亲证（docker info+容器清理）+偏离清单+pins 零翻声明。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵十门·**数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **新 proof 主判据**：`node scripts/run-e2e-isolated.mjs uc017:orphan-http-sse:prove:raw` **EXIT=0**·五 case 段全 PASS（一行一 case·实数 N/0 如实记）；runner 形 `pnpm uc017:orphan-http-sse:prove` 同命令如实记（注册形沿 `:127-136`）。
2. **邻面不回退**：`pnpm uc017:orphan:prove` EXIT=0（既有 O1–O4 零字节零弱化·PASS 数恒等）；`pnpm uc017:nhp-load:prove` EXIT=0（批B面旁证零触）；`node scripts/run-e2e-isolated.mjs neg:interview` EXIT=0（HTTP 邻域 PASS 名单零减员·届时分母如实记）。
3. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（届时口径如实记）。
4. **lint 五值恰等**：`pnpm turbo lint` 0 errors·web/root/api/worker/ai-runtime 五值对届时主线口径恰等（任一超即停承登·Ban 顺手消偿）。
5. **docs:check（红停条款）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·**≤cap 2354（>2354 红停上报·cap 上抬权归协调方）**（基线 2343 本树亲跑·本卷起草 +1=2344·EXEC 件①③④ 再 +3 预期 2347·收据仓根非受管根零增量）。
6. **markers 五类零命中**：本刀改动集（件①-④+本卷 .md）新增行五类标记词（冲突标记/假绿绕过词/测试门弱化/遗留标/secrets 样值）grep 零命中（词族沿 i6-239 门口径·词面不复抄卷内防自指·命令与回执入收据）。
7. **diff 面机检**：EXEC 交付 commit `git diff --numstat <base>` **恰 6 tracked 路径**=件① .ts（A）+件② 两 .json+**件② runner .mjs**+件③ .md+件④ case-matrix .md（+收据目录 untracked 仓根非受管根口径；起草 commit 恰 1 tracked=本卷 .md）——多任何 tracked 路径即停（越界需要类）（rev2 P0-2：件② 扩 runner .mjs 后路径数 5→6）。
8. **SSOT 行零触机检**：`git diff <base> -- ai-docs/delivery/e2e-requirement-coverage-matrix.md` **零字节**（`:122` 六列行/`:148` 批B行/`:180`/`:265` 全只读）；case-matrix 仅净增 5 行零改旧行。
9. **EXEC 期容器依赖门（预登条款）**：立项第一步 `docker info` EXIT=0 亲证入收据；run 后一次性容器 `meetwise-e2e-*`（`f89fb27c:2766` 族）由 runner 自清理·收据记清理亲证；**docker 不可用=`blocked` 停上报（非验收红）**。
10. **卫生+零 live key**：`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改；`.env*` ABSENT 双向记录；proof 运行面零 `MODEL_API_KEY`（零 live key 承载=`_neg-harness:61-62` 删除·rev2 OBS-A 收窄；runner fake-flags 门仅 live 目标路径（`f89fb27c:2901`）触发·本刀非 live 不经——rev P2-3·收据按此如实记）；`actualSpendCny=null`·est live=0（全离线隔离 PG·零模型外呼）。

## §3 范围外（边界清单·越界即 FAIL）

1. **产品码零触**：`apps/api/src`/`packages/db/src`/`apps/worker/src` 零字节——本刀=prove-only（沿 UC-001 族 prove-only 先例）；begin 同事务语义（`a8ae0d15:288` 零悬账句）零改。
2. **共享 SSOT 行零触**：矩阵 `:122` 六列行翻面、`:148` 批B行、`:180`/`:265` 措辞更新、coveredCount 等钉——翻面权全归协调方（§1.3-(B) 否决沿承）；`gap-uc017-load-sweep-nhp.md` 零触。
3. **既有 017 交付面零字节**：`uc-e2e-017-orphan-reservation.proof.ts`（f4b8b0d3）与 `uc-e2e-017-orphan-reservation.md`（497b9f11）零改——其非目标自证句是本刀立项证据链，改之即自毁锚。
4. **full.e2e/live 面零触**：不跑 live E2E 不宣称「e2e:isolated 全链路含 017」——本刀产的是 isolated 非账收据·`e2e/full.e2e.ts` 纳入归协调方另裁。
5. **进程级崩溃注入零承诺**：SIGKILL 子进程/跨进程 worker 编排/真 commit 后故障点超本刀面（§1.3-(C) 否决沿承）——fixture 租约过期=预登诚实模拟形态；需真崩溃→停上报另刀。
6. **ADV 面零触**：`:122` ADV=blind 保持——对抗面归对抗族刀（UC-031/032 域）。
7. **零迁移零新依赖**：§0.3；需第二 DDL/新包即停。

## §4 依赖

**①上游已满足**：`_neg-harness.boot()` 真 HTTP 栈+零 live key 承载（9768b323 在树）；`pumpSseEvents`（b93121dc）；`abandonInterviewAndRelease`/`reconcile`（20b7613e）；`reconcileOwner` 生产调度嘴导出（73772ac2 `:34`——**进程内直调同一函数·非跨进程 worker 编排·如实措辞**）；runner 原语族（`f89fb27c:2766` 容器+`:53` 收据口）；018/002 HTTP prove 范本（720f383d/同族）=修法承载面全在树。**②无同文件并发**：起草触面=恰 1 新 .md；EXEC 触面=新 .ts+两 .json+新 harness .md+case-matrix 净增——§0.0 在飞交叠复核规则 EXEC 立项日必做（本次起草亲证协调方点名七在飞分支 0 命中）。**③容器依赖**：Docker daemon+一次性 PG（§2 门 9 预登）。**④下游**：矩阵 `:122` 行翻面+case-matrix 旗 case-only→真证据升格评估归协调方 post 双审链；收据归 G7 全量叙事素材（releaseEvidence 仍 false）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban invent covered / Ban claiming covered / Ban 把 EXIT0 或 case-only 写成 covered（§1.3-(B)·矩阵 §0 词汇表）；Ban live key/Ban 造 .env*/Ban 写 Key 值入树入据（§2 门 10）；Ban 触 `apps/api/src` 等产品码（§3-1）；Ban 触共享 SSOT 行翻面（§3-2·翻面权归协调方）；Ban 触批 B 行 6（`:148`·派单边界）；Ban 改既有 017 proof/harness 零字节面（§3-3）；Ban 进程级崩溃注入承诺（§3-5）；Ban 第二迁移/新依赖/顺手扩面（§3-7/§0.3）；Ban retry-to-green（红不重跑冲销·如实承登）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因门矩阵外新红（若现新红→如实登记升级·Ban 借机修）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗（本卷=docs-only 起草·未执行任何 prove；EXEC 期 prove 全离线隔离 PG·零模型外呼·零 live key·§2 门 9/10 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草席本树亲跑 EXIT 全 1·命令与回执随 EXEC 收据留痕·五类词面不复抄卷内防自匹配——沿 reconcile/evkind/negbend 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `executed:awaiting_post_prove_dual`**（EXEC 落卷翻面·原值 `draft:awaiting_pre_exec_dual` 见 §9-EXEC 台账 · alone≠dual · 翻面=已行使非已升格 · 本 commit 不预 claim 任何 post-commit 升格/翻面——矩阵 `:122` 行与 case 旗评估权全归协调方 post 双审链。）开工三条款（已按序履行·台账见 §9-EXEC）：①pre-exec 双审两外席 **BOTH PASS 落卷**（rev2 后双 PASS 汇流）；②**协调方明示 EXEC 授权**（committed SHA 重钉=d3196b442）；③EXEC 立项**不得改 §1.3 裁决 (A) 与 §5 Ban/pins 与 §1-修法件①-⑤ 一行一 case 表**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做·docker 可用性亲证为立项第一步）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且结论受疑（`:122` 六列行已被他刀翻面或读法句消失·proof `:139` 自证句消失·begin 同事务语义句 `:288` 变·`reconcileOwner` 导出面变·runner 容器原语变·**runner 目标注册面变（白名单 `:2237` 族/`isolatedCommand` `:2352` 链/`isolatedReceiptSources` `:1232`/`:1257` 任一漂移或他刀改写注册形·rev2 P0-2 补）**·§0.0 在飞分支对本刀触面有新增提交）→停·重 pin 回炉。
- **机制不满足**：件①-⑤ 落卷后五 case 任一红或既有 O1–O4 邻面翻红（§1.2 推定形被证伪·如 abandon 嘴非 release 语义/SSE 拆除改预占态）→根因诊断被证伪→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。**rev P1-1 补注（已知承载点）**：SSE-FAULT-01 的 429 子臂在默认 boot 栈下 429 永不发生（`_neg-harness` 装载单 `:72-90` 不含 0189→`gateway_slot_lease_acquire` 缺失→`RateLimitService` catch fail-open `return true`·`rate-limit.service:158-175` 亲证）——EXEC 必须按 §9-rev 1-(b)（rev2 收紧形=沿 sse-principal-slot.proof.ts:112-131 自建最小模块同进程承载·boot() 无 override 缝三锚 `_neg-harness.ts:63`/`:29-37`/`:324-329`）承载该子臂；漏承载致该臂红属**预登已知面**照本条停上报·非现场新红。
- **越界需要**：修法诉求超出 §1-修法恰 5 件面（需触产品码/矩阵行翻面/进程级崩溃/live 面/第二迁移/新依赖）→停·另刀或协调方裁决（§1.3-(B)(C) 否决沿承·Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻套件新红/lint 五值超/docs:check>2354/docker 不可用属 blocked 另计）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9-rev 修订席收敛回路（双审席1 FAIL→rev 纯文面落点·2026-10-26）

**rev 由来**：pre-exec 双审席1 对本卷起草 commit `bfaa60e06` 判 FAIL（P1×1+P2×3+OBS×1）→rev 席逐条落文如下。纯文面修订：§1.3 裁决 (A)、§5 Ban/pins 十一值、§1-修法一行一 case 表五 case 面**零改**；新增行零行为语义变更。

1. **P1-1 · SSE-FAULT-01 429 臂承载前置预登（三择一·采 (b)）**
   - **机制根因（rev 回路亲证 @`38f6e7d78`）**：`_neg-harness.boot()` 装载单（`9768b323:72-90`）**不含** `packages/db/migrations/0189_api_harden_shared_state.sql` → `gateway_slot_lease_acquire` 在隔离库缺失 → `RateLimitService.acquireSlot` 共享臂 query 抛错入 catch **fail-open `return true`**（`rate-limit.service:158` 函数入口·`:173-174` fail-open 句亲证）→ 默认 boot 栈下 429 槽满**永不发生**——SSE-FAULT-01 附带的 429 子臂若沿默认栈承载必空转。
   - **择 (b) 落文（rev2 P1/OBS-B 收紧改写）**：件① SSE-FAULT-01 的 429 子臂**改走 Map 模式**——429 子臂沿 `sse-principal-slot.proof.ts:112-131` 形（`@Module` providers `{ provide: RateLimitService, useValue: rl }` `:116`+`NestFactory.create` 自建最小模块 `:112-129`+`listen(0,'127.0.0.1')` `:131`）**自建最小模块同进程承载**（compile 期 useValue 覆盖·`:91` `new RateLimitService()` 无 DbService=本地 Map·`rate-limit.service:149-151` 注释同证）；**boot() 栈承载其余子臂**——`boot()` **无 override 缝**三锚亲证（`_neg-harness.ts:63` `createApp()` 零参编译无模块覆盖入参+`:29-37` `Harness` 接口返回面无 app 句柄+`:324-329` boot() 返回 `base`/`pool`/`req`/`send`/`raw`/`post`/`patch`/`U` 无 app 句柄）——rev1 原文「对件① booted 栈内 RateLimitService 做 DI 覆盖」无承载缝·rev2 按先例独立模块覆盖形如实收紧（先例在树·最小面·零产品码零迁移零新依赖）；其余四 case 承载不变（仍 `_neg-harness.boot()` 全栈）。§1-修法件① case 表 SSE-FAULT-01 行面零改·仅执行承载形按本条精化。
   - **§8「机制不满足」已补注**此已知承载点（见 §8 rev P1-1 补注句·漏承载致红属预登已知面照停上报·非现场新红）。
   - **否决 (a)**（proof fixture 显式装载 0189）：改 `_neg-harness` 装载单或 proof 自载迁移均超本刀触界面（共享 harness 面/越界需要），且其装载单尾独立可载性另需专项核——非最小面。**否决 (c)**（429 子臂降为预登条件面·fail-open 现状如实记）：放弃可真实驱动的 429 语义=无谓削弱 case 面——(b) 承载零成本在树先例。
2. **P2-1 · 件① 头注补 0058 stub 注记（rev2 按席2 F-3 归因改写）**：落点=§1-修法件①「头注必带」清单第四项+本条归因句（均已改）。**归因亲证（9768b323 届树）**：**boot() 已内置 `interview_privacy_active` 最小镜像（`:111-126`）+`assert_interview_privacy_active`（`:212-225`·0058 真函数体逐字）**，覆盖五 case 全隐私触点（FAULT-01 begin+reconcileOwner 围栏 SELECT（73772ac2 `:50` 亲证）/COMP-01 begin+abandon/SSE-FAULT-01 begin+events/BOUND-01 begin×2/NEG-01 RLS 零行）——**proof 级 018 形 stub（720f383d `:10-11`/`:32-59` 先例亲证）系沿承防御面可免装；如装注明 SECURITY DEFINER→invoker-rights 形状差**（harness 镜像 `:115`/`:215` 带 SECURITY DEFINER·018 形 stub 无 SECURITY 子句=invoker-rights·届树逐字亲证）。
3. **P2-2 · §0.1 runner 行锚漂移修正**：落点=§0.1 `scripts/run-e2e-isolated.mjs` 行（已改）：头注行锚 `:14-16`→`:21`/`:25`，引文「在独立、临时的 PostgreSQL cluster 上运行…绝不触碰开发数据库或开发容器」零变（`f89fb27c:21`/`:25` 现行亲证·`:14-16` 实为 S3 forwarder 注记段=原锚漂移）。
4. **P2-3 · §2 门 10 措辞如实化**：落点=§2 门 10（已改）：「零 live key 承载=`_neg-harness:61-62` 删除（rev2 OBS-A 收窄）；runner fake-flags 门仅 live 目标路径（`f89fb27c:2901` `LIVE_E2E_TARGETS.has(target)` 门）触发·本刀非 live 不经」——机检亲证 `:2901` 该断言被 LIVE 白名单 Set 门控·非 live 目标不触发；**收据（件⑤）按此如实记**：零 live key 承载收据=`_neg-harness:61-62` 删除句+proof 运行面 env 亲证·runner fake-flags 门不列为本刀触发收据。
5. **OBS-1 · EXEC 立项环境 Docker daemon 落卷**：**EXEC 立项环境必须具备可用 Docker daemon**——rev 回路本机实测 `which docker` 零命中（零 docker CLI on PATH；`~/.docker` 仅陈旧配置残留·非可用 daemon 证据）→§2 门 9「docker 不可用=`blocked` 停上报（非验收红）」预登停形为**承重墙**（本机现状立项即 blocked 停·非验收红）；立项日第一步 `docker info` EXIT=0 亲证**照旧**（§8 三条款③ 同句沿承·不因本注免除）。

**rev 后收束**：五条全落（§9-rev 本节 append+§0.1/§1-修法/§2/§8 四处定点·逐条如上）；docs:check 复跑 2344≤2354（受管文件数口径·纯文面零新增文件）；markers 五类零命中复跑；**STOP 维持 `draft:awaiting_pre_exec_dual`**（rev 落卷≠开工·双审余席+协调方授权链照旧）。

## §9-rev2 rev2 修订登记（双审第二输入回路：席1 PASS 附 OBS×4+席2 FAIL 合并清单·rev2 席逐条落点·届树亲证·2026-10-26）

**rev2 由来**：pre-exec 双审席1 对本卷 rev1 @`4eabd187c` 判 **PASS**（附 OBS 四件：P2-R1/P2-R2/OBS-A/OBS-B）+席2 判 **FAIL**（P0（件② 扩面+门 7 联动两件）+P1×1（F-2）+P2×1（F-3））→rev2 席按合并清单逐条落文如下。纯文面修订：§1.3 裁决 (A)、§5 Ban/pins 十一值、§1-修法一行一 case 表五 case 面**零改**；件② 注册行扩面系「使件① 可经 runner 行使」的文面补全·承载形收紧系按届树亲证如实改写·零行为语义变更。

1. **rev2-1（席2 P0-1 · 件② 扩三文件）**：件②「恰 3 行两文件」→**「恰 6 行三文件」**——+`scripts/run-e2e-isolated.mjs` 三处（沿 `uc018:abandon:http:prove:raw` 018 同形·约 6 行）：①目标白名单条目（`:2237` 族行内 append `'uc017:orphan-http-sse:prove:raw'`）②`isolatedCommand` 分支（`:2352` 链尾二行·uc018 http 分支 `:2390-2391` 同形）③`isolatedReceiptSources` 条目（`:1257` 018 http 条目邻·017 条目 `:1232` 同形）。**根因亲证（f89fb27c 届树）**：`uc017:orphan-http-sse:prove:raw` 白名单零命中→门 `:2346-2348` 立即 throw `unsupported_e2e_target:<target>`（`:2347` 亲证）——runner 不注册则件② 根 script 行指向的隔离门不放行·§2 门 1 必红。落点=§1-修法件②（已改）。
2. **rev2-2（席2 P0-2 · 门 7+§0.1+§8 三点）**：①门 7「恰 5 tracked 路径」→**「恰 6 tracked 路径」**（+件② runner .mjs）；②§0.1 runner 行补**目标注册面**锚（白名单 `:2237` 族+`isolatedCommand` `:2352` 链+`isolatedReceiptSources` `:93`/`:1232`/`:1257`+硬门 `:2346-2348`·LIVE 门 `:2901`）——**本次 P0 根因=该面未 pin**；③§8「现场漂移」补 runner 注册面漂移触发词。落点=§2 门 7+§0.1 runner 行+§8 现场漂移句（三处已改）。
3. **rev2-3（席2 P1=F-2 · 429 子臂承载 locus 改写+席1 OBS-B 同面收紧）**：§9-rev 1-(b) 原文「对件① booted 栈内 `RateLimitService` 做 DI 覆盖」→「429 子臂沿 `sse-principal-slot.proof.ts:112-131` 形**自建最小模块同进程承载**（compile 期 useValue 覆盖）·boot() 栈承载其余子臂·明记 boot() 无 override 缝三锚（`_neg-harness.ts:63`/`:29-37`/`:324-329`——createApp 零参编译+Harness 返回面无 app 句柄）」。三锚届树亲证（9768b323）：`:63`=`const app = await createApp();`（零参·无模块覆盖入参）·`:29-37`=`export interface Harness`（base/pool/req/send/post/patch/raw/U·零 app）·`:324-329`=boot() 返回八件面（零 app）——**booted 栈内 DI 覆盖无承载缝·rev1 措辞机械不可行·rev2 按先例独立模块覆盖形如实收紧**（`:112-129` `@Module`+`NestFactory.create` 自建·`:131` listen·`:116` useValue·`:91` 本地 Map 同证）；§8「机制不满足」rev P1-1 补注句同步按收紧形改写。落点=§9-rev 1-(b)+§8 rev P1-1 补注（两处已改）。
4. **rev2-4（席2 P2=F-3 · 0058 stub 归因改写）**：§9-rev 2（P2-1）原文「`_neg-harness` 不载 0058（故 proof 装 stub）」归因→「**boot() 已内置 `interview_privacy_active` 最小镜像（`:111-126`）+`assert_interview_privacy_active`（`:212-225`·0058 真函数体逐字）**，覆盖五 case 全隐私触点（FAULT-01 begin+reconcileOwner 围栏 SELECT（73772ac2 `:50` 亲证）/COMP-01 begin+abandon/SSE-FAULT-01 begin+events/BOUND-01 begin×2/NEG-01 RLS 零行）·proof 级 018 形 stub 系沿承防御面可免装（如装注明 SECURITY DEFINER→invoker-rights 形状差）」。形状差届树逐字亲证：harness 镜像 `:115`/`:215` 带 `SECURITY DEFINER`·018 形 stub（720f383d `:32-59`）无 SECURITY 子句=invoker-rights。落点=§9-rev 2 归因句+§1-修法件① 头注第四项（两处已改）。
5. **rev2-5（席1 OBS-A · `:60-62` 收窄）**：§0.1 `_neg-harness` 行+§2 门 10+§9-rev 4 引文「`:60-62`」→**「`:61-62`」**（三处已改）——届树亲证（9768b323）：`:61`/`:62`=两行 `delete process.env.MODEL_API_KEY`/`MODEL_BASE_URL`·`:60` 系注释行（「…isolated live E2E suite.」）不属零 live key 删除承载面·收窄后引文如实。
6. **rev2-6（席1 OBS P2-R1/P2-R2 · 如实登记·待双审第二轮面核）**：席1 两件 OBS 原文=「§0.4 `:94-108`/`:96`/`:106`→`:94-104`/`:102`（P2-R1）」+「§0.3 `:44-46`→`:38-41`（P2-R2·批 B 同源漂移一并注）」——**rev2 席届树亲证零可映射落点**：本卷无 §0.4 小节（§0 仅 0.0-0.3）；全卷（§0.1 全表/必读清单/§1/§2/§8/§9-rev/脚注）零 `:94-108`/`:96`/`:106`/`:44-46` 锚；§0.1 全部 15 blob（含 matrix `788423b1`/case-matrix `e6c669ba`/gap `8194e1f6`/reservation.md `497b9f11`）届树 `git hash-object` 逐一亲证 byte 级未变=文件侧零漂移；候选区段（matrix `:35-48`/`:93-112`·gap doc `:36-48`/`:94-108`·case-matrix `:38-46`·reservation.md `:28-47`）逐段亲读无此锚。按 §5「Ban 伪造已读/已验来源」本笔**不发明落点**——两件 OBS 原文如实登记如上，留 pre-exec 双审第二轮面核对锚（OBS 系 PASS 席非阻断件·不构成本轮停止条件）。
7. **门复跑（rev2 落卷 turn·本席亲跑）**：markers 五类标记词零命中（词面运行时组装防自指·沿 i6-239 门口径·命令与回执随双审留痕）·docs:check EXIT=0 scanned **2344**≤cap **2354**（§2 门 5 口径·本笔纯文面零新增受管文件）·本笔工作树 diff 恰 1 tracked=本卷 .md·est live=0（本 turn 零实跑零模型外呼零 Key 加载·锚=静态亲读+script grep/`git hash-object`）·**STOP 维持 `draft:awaiting_pre_exec_dual`**（Status 头/§8/本节三处同值零翻）·rev2 后回炉重派 pre-exec 双审第二轮·alone≠dual·Ban self-approve·翻面权归协调方。

## §9-EXEC EXEC 落卷登记（协调方授权 EXEC turn·2026-10-26·五面行使收据）

**EXEC 由来**：rev2 落卷 @`d3196b442` 后 pre-exec 双审双 PASS 汇流 + 协调方明示 EXEC 授权（授权面含「colima 容器已可用」预登）→ 本 EXEC turn 按 §1-修法件①-⑤ 落码行使。§1.3 裁决 (A)、§5 Ban/pins 十一值、§1-修法一行一 case 表**零改**。

1. **件①-⑤ 落卷形**：件① `apps/api/test/uc-e2e-017-orphan-http-sse.proof.ts`（五 case 一行一 case·boot() 全栈承载四 case+SSE 429 子臂沿 sse-principal-slot:91,112-131 形自建最小模块同进程承载·头注四项必带齐含 0058 stub 可免装注记 rev2 P2-1 形）+件② 三文件恰 6 行（根 package.json 双行 `:131-132` 区+apps/api 行+runner 三触点：白名单 `:2237` 族行内 append·isolatedCommand 分支二行·isolatedReceiptSources 条目）+件③ `harness/uc-e2e-017-orphan-http-sse.md`+件④ case-matrix 017 区后恰净增 5 行（旗=case-only·零改旧行）+件⑤ 收据仓根 `receipts/uc017-orphan-http-sse/00-exec.md`（untracked 非受管根）。
2. **门矩阵十门亲跑**：全表 EXIT 原值见收据 §一——门 1 A1 红/`A2=0`/FINAL 确认 `0`（57 PASS/0 FAIL·五 case 全行使）·门 2 三邻面全 `0`（17/—/108·零减员）·门 3 `0`（8/8）·门 4 A1 红/`A2=0`（api 恰回 1423·0 errors）·门 5 `0`（2346≤2354）·门 6 `0`（五类零命中）·门 7 交付面恰 6 tracked（+1 工序面=本节+STOP 翻面·如实承登收据 §六-5）·门 8 SSOT 零字节+case-matrix 5/0·门 9 docker info `0`+容器零残留·门 10 全绿（frozen-lockfile 零 lockfile 改·.env ABSENT·零 live key·est live=0）。两红轮（门 1 A1 夹具 uuid 笔误/门 4 A1 本刀文件 4 lint warnings）均系本刀交付面自身缺陷面内自修·非锚漂非邻面翻红非越面——停止条件四类 EXEC turn **零触发**。
3. **重 pin**：§0.1 全表 13 blob 对届树 `d3196b442` `git hash-object` 逐一 byte 级零漂（全表见收据 §四）；锚行号抽验零漂。
4. **STOP 翻面**：`draft:awaiting_pre_exec_dual` → **`executed:awaiting_post_prove_dual`** 三处（Status 头/§8/卷尾）；§9-rev 7 与 §9-rev2 7 系历史 turn 记录**保留原值**（诚实链）。alone≠dual·Ban self-approve·矩阵 `:122` 翻面/case 升格评估权归协调方 post 双审链。
5. **STOP 三态记录**：本节落卷=EXEC turn 台账（原值 draft 见 rev2 节）·门矩阵数字口径以实跑实测为准（收据与 runner stdout 留痕）。

---

*UC017-ORPHAN-HTTP-SSE REQUEST · 2026-10-26 起草（同日 rev1 落卷：双审席1 FAIL P1×1+P2×3+OBS×1 已逐条落·§9-rev；同日 rev2 落卷：席1 PASS OBS×4+席2 FAIL 合并清单已逐条落·§9-rev2；同日 EXEC 落卷：五面隔离行使门矩阵十门 EXIT 原值入收据·§9-EXEC）· **`STOP=executed:awaiting_post_prove_dual`**（EXEC 行使落卷·翻面/升格评估权归协调方 post 双审链·本 commit 不预 claim 任何升格）· base `origin/main` @`38f6e7d78` · EXEC 起点 HEAD=`d3196b442` · 分支 `line/uc017-draft` · 工作树 `meetwise-uc017` · 先验未闭亲证=矩阵 `:122` 六列行（partial/partial/partial(sweeper)/blind/HTTP/SSE 注入未进 isolated）零翻动·批 B 行 6（`:148`）零触·协调方点名在飞七分支（NHP 批 A/B/C·UC-019·pay·rag02·event-ttl）UC-017 触面逐树 0 命中 · 修法=HTTP/SSE 注入面 prove 进 isolated 收据刀（件① 新 proof 五 case 一行一 case 全 case-only 已行使 57/0+件② 注册行恰 6 行三文件（含 runner 目标注册面三处·rev2 P0-1）+件③ harness 卷+件④ case-matrix 净增 5 行+件⑤ 收据仓根 untracked·零产品码零迁移零 live key·EXEC 期 Docker 一次性 PG 容器依赖亲证自清=§2 门 9·SSE-FAULT-01 429 子臂自建最小模块同进程承载（boot() 无 override 缝三锚·rev2 收紧形）=§9-rev 1-(b)）· docs:check 基线 2343≤cap 2354（起草 +1=2344·EXEC +2=2346 本树亲跑 EXIT=0）· est live=0 · markers=0 · pins 十一值零翻 · 停止条件四类（EXEC turn 零触发·两红轮=本刀交付面自身缺陷面内自修如实承登收据 §六）· Ban self-approve · alone≠dual · ⛔push*

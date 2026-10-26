draft:awaiting_pre_exec_dual

# UC-E2E-004 career-path 全链路 · 隔离库 e2e HTTP 主路径 REQUEST（主路径 + 落点断言 + 失败降级臂 · docs-only 零码动）

基线 `47dd6be56d5f3b59ccf5dc0c827b0bdc2e6952de`（origin/main tip，fetch 亲证）。分支 `line/uc004-draft`。工作树 meetwise-uc004（主仓 `git worktree add ../meetwise-uc004 -b line/uc004-draft`）。这一步只新增这份说明，不改产品代码。行号是在这棵树上打开文件看到的。

缺口源：`ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md:25` Phase 2 第 9 项「UC-004 FAULT/A3 gap · L」。起草前复核（本树亲测）：`e2e-requirement-coverage-matrix.md:115` UC-E2E-004 整行 gap（NEG gap · FAULT gap · BOUND gap · ADV blind）；`:173` 拆行「抬到 covered 还缺」明示 e2e HTTP 主路径、成长落点、A3 失败降级仍缺；`e2e-covered-path-backlog.md:28` 第 004 行同一口径；本树 `e2e/` 目录（full.e2e.ts / helpers / ocr-fixture.ts / performance.e2e.ts）零 career-path 用例。缺口未闭，无翻面候选。

## §0 锚

### 0.1 HTTP 路由面（已存在，即本门的主路径口）

`apps/api/src/modules/interview/interview.controller.ts:16` `@Controller('interview')`。`:237-241` `@Post(':id/career-path')` + `@HttpCode(HttpStatus.OK)` → `generateCareerPath`；`:243-245` `@Get(':id/career-path')` → `getCareerPath`。即 `POST /interview/:id/career-path`、`GET /interview/:id/career-path`。路由今天只有 `apps/api/test/validate.ts:632-634` 的本地 validate 直打（矩阵 `:173` 已钉「validate.ts 旁证≠covered」），没有隔离库 e2e 门。

### 0.2 AiGraphRun(career-path) 图状态机面（Line T 已接线，本门的落点断言对象）

`apps/api/src/modules/interview/interview.service.ts:821-825` 注释原句：derive 经 career-path 单节点图执行，AiGraphRun(career-path) 状态机真实落库（tx1 guards/评估前置零写 → tx2 create/reuse active version+1 → 图(derive) → career_path upsert 原样 + active→succeeded 同事务 | 失败 active→failed 后 rethrow）。`:827` `generateCareerPath`；`:828` `denyPublicPreviewWrite`；`:829` pre 块（guardInterviewPrivacy + `SELECT overall, dimensions FROM assessment_report WHERE interview_id=$1`，无行 409 `assessment_required`；`requireTrustedPracticeOverall` 抛 `insufficient_evidence` 409）；`:846` `selectCareerPathDerive(id, careerPathFailSeamThreadId(), deriveCareerPath)`；`:847` `runCareerPathGraph`。ledger 三闭包：begin `:850-866`（`:853` 事务级 advisory lock、`:854-857` latest-row `FOR UPDATE` 复用/接管、`:858-865` `ai_graph_run` INSERT/UPDATE `status='active'`、version+1、lease）；commitSuccess `:867-882`（`:871-875` `career_path` upsert `ON CONFLICT (owner_user_id, interview_id) DO UPDATE`、`:877-881` 同事务 `status='succeeded'`，version fence）；markFailed `:883-888`（`status='failed'`，version+1）；`:890` `onTransitionError` fail-closed 只观测不伪装终态。`:894-896` `getCareerPath` 委托 `getCareerPathFor`。

图本体：`packages/ai-graphs/src/career-path.ts:20` `CAREER_PATH_GRAPH_NAME = 'career-path'`；`:21` `CAREER_PATH_INJECTED_FAILURE`；`:40-44` 单节点图 `addNode('derive', …)`（dep=注入的 `deriveCareerPath` 纯本地函数，`packages/domain/src/career.ts` 零 IO 零模型）；`:48-53` `selectCareerPathDerive` 精确等值 fail-only seam；`:55-70` `runCareerPathGraph`（begin → invoke → commitSuccess | markFailed + rethrow 原错误）。导出 `packages/ai-graphs/src/index.ts:15-16`。

### 0.3 FI-3 seam（失败降级臂的注入口，production-off）

`apps/api/src/modules/interview/interview.service.ts:52-55` `careerPathFailSeamThreadId()`：`NODE_ENV=production` 恒返回 undefined；否则读 `MEETWISE_CAREER_PATH_FAIL_THREAD_ID`（`:54`）。`packages/ai-graphs/src/career-path.ts:48-53` 只在 env 值与线程 id **精确相等**时换成确定性抛错 dep；未设/空 = 原 dep 同一引用，零行为差。同一进程内非匹配线程完全不受影响——`apps/api/test/uc-e2e-004-career-path-fault.proof.ts:64`（`IV_FI3` seam 常量）+ `:66`（`SEAM_ENV_KEY`）+ `:230-232`（API 子进程带 `MEETWISE_CAREER_PATH_FAIL_THREAD_ID=IV_FI3` 启动后 CONTROL 线程照常成功）已是先例。失败臂断言集沿该 prove `:44-46` 七项口径：①POST 失败可解释（500 `internal_error` 信封）②`ai_graph_run(career-path,线程)` 恰一行 `failed` ∧ version≥2 ③GET 404 无失败产物 ④额度账本净变 0 ⑤server alive ⑥in-fault 重试再失败 + version 递增 + `career_path` 仍 0 行 ⑦零 trace。

### 0.4 成长落点（A1/A2 如实：能断什么、不能断什么）

A1 曲线：`apps/api/src/modules/profile/profile.controller.ts:26-28` `GET /profile/growth` → `apps/api/src/modules/profile/profile.service.ts:85-105` `growth()` 从 `assessment_report`（status='ready'）按时间序聚 `deriveGrowth` 维度点。种子评估就绪后曲线点存在，A1「≥2 维度数据点」可做确定字段断言。
A2 档案关联：产品今日**未接线**——`growth()` 只读 `assessment_report`/`score_card`，不 join `career_path`；全仓无 GrowthTimeline 写面（矩阵 `:173`「无 GrowthTimeline 写」、静态钉 harness `uc-e2e-004-career-path.md:34` S4 / `:38` G-GAP-3 原钉）。本门**不造**关联断言；A2 关联落点属另一刀，本门只断今天真实存在的面：`ai_graph_run` succeeded 行 + version、`career_path` 表行（读真相）、`GET /interview/:id/career-path` 确定字段、GET 前置 404。
GET 重闸：`apps/api/src/modules/interview/interview-assessment.ts:94-108` `getCareerPathFor`——无行 404 `not_found`（`:96`/`:106`）；有行再过 `:99` `requireCurrentScorableCards(c,id,'insufficient_evidence')`（定义 `:36`，资格单源 `aggregateInterviewScores`——0161 收窄后 `eligible_card_count` 只认 `score_card.status='practice_eligible'` 单态，`packages/db/migrations/0161_practice_only_read_narrowing.sql:33` 亲证；`b_review_eligible` 归 B 端评审态不计入，两态口径仅存于 growth answered 计数面 `profile.service.ts:100`），故 GET 200 臂的种子 `score_card` 须满足该资格谓词：`status='practice_eligible'` ∧ `deterministic_total` 数值非空（0100 `:172`）；种子仅 `b_review_eligible` 必假红。

### 0.5 既有门与本门不触碰的口径

- 静态诚实钉：`pnpm uc004:career-path:prove`（根 `package.json:198-199` → `apps/api/package.json:87` → `apps/api/test/uc-e2e-004-career-path.proof.mjs`）。接线落地后它 EXIT=1 是预期绊线（矩阵 `:115` 原钉「静态 `uc004:career-path:prove` EXIT=1 预期绊线（另刀）」）。本门不替代、不改它。
- 运行时故障钉：`pnpm uc004:career-path-fault:prove`（根 `package.json:200-201` → `apps/api/package.json:88` → `apps/api/test/uc-e2e-004-career-path-fault.proof.ts`）。Line T 后 EXIT=0（4×0）。本门只回归复跑，原句零改。
- 两者均「本绿 ≠ covered ≠ A3 closed」（fault prove 头注原句）；`GAP-UC004-FAIL-A3` / `NHP-004-FAULT-01` / 矩阵 UC-E2E-004 行 stays gap，翻转只走 covered 评估器 + 协调方 nail。

### 0.6 门注册形三先例与零 live key 形

根 `package.json` 注册形（每门两行）：`:135-136` `uc018:abandon:http:prove` / `:163-164` `uc019:report-regenerate:http:prove` / `:173-174` `uc002:http:prove`——`"<name>": "node scripts/run-e2e-isolated.mjs <name>:raw"` + `"<name>:raw": "pnpm -C apps/api prove:<kebab>"`；`apps/api/package.json` 一行 `prove:<kebab>` 指向 `test/*.proof.ts`（`:36`/`:39`/`:46`），运行形 `node --import @swc-node/register/esm-register`。隔离壳 `scripts/run-e2e-isolated.mjs`：per-run 随机容器 `meetwise-e2e-*` + 动态端口 + `assertIsolatedTestTarget` attestation，绝不触碰开发库。
零 live key 形：`apps/api/test/_neg-harness.ts:59-63` boot 前 `delete process.env.MODEL_API_KEY / MODEL_BASE_URL` + `assertIsolatedTestTarget`（`:65`）+ 全量 sql/ 与迁移镜像；`apps/api/test/report-retry-http.proof.ts:17` 头注「NO MODEL_API_KEY（generate 注入确定性函数）」=stub 注入先例。career-path 主路径 derive 本就纯本地零模型（0.2），零 live key 依赖天然成立；prove 全程零模型端点、零 `ai_invocation_trace` 写（trace 行数 before/after 为观察面，沿 fault prove C-MO 口径）。

## §1 修法

只新增一个隔离库 e2e prove 文件并按 0.6 注册形注册一门，覆盖主路径 + 落点断言 + 失败降级臂。不改产品代码、不改既有两钉口径、不新增迁移。

### 1.1 新 prove 文件 `apps/api/test/uc-e2e-004-career-path-http.proof.ts`

boot 形沿 `_neg-harness` `boot()`（真 NestJS 栈 + 隔离 attestation + 删 MODEL_API_KEY/MODEL_BASE_URL）；进程 env 预设 `MEETWISE_CAREER_PATH_FAIL_THREAD_ID=<失败线程>`（0.3 精确等值 scoping，同一进程内主路径线程不受影响，同 fault prove `:230-232` 先例）。种子沿 fault prove `:204-226` 同口径（superuser 直插 + `set_config('app.principal_user','userA',false)` GUC：user_account + interview(completed) + assessment_report(status='ready', overall=60, dimensions 2 项 gap) + entitlement_bucket），另按 0.4 补 GET 重闸所需可评分 `score_card` 行——形钉满足 `aggregateInterviewScores` 资格谓词：`status='practice_eligible'` ∧ `deterministic_total` 数值非空（0161 `:33` 单态）；`assessment_report.dimensions` 逐项必含数值 `score`（沿 fault prove dims2 形 `:212-215`——`deriveGrowth` 仅收 `Number.isFinite(score)` 维度项，growth.ts:57）；并补臂 7 两 409 前置线程种子：无评估线程（零 `assessment_report` 行）+ overall 不可信线程（`assessment_report(status='ready', overall=NULL)`，`requireTrustedPracticeOverall` 对 NULL fail `insufficient_evidence`，scoring-honesty.ts:145-147）。断言臂（Ban 减项）：

主路径：
1. POST 前 `GET /interview/:id/career-path` → 404 `not_found`；
2. `POST /interview/:id/career-path` → 200，体为契约原形 `{readiness, level, milestones}`（`level='mid'`——种子 overall=60 纯分数阶梯 ≥50→mid，career.ts:51/:57 阶梯单源，沿 validate.ts:632 先例；milestones 非空数组）；
3. `ai_graph_run`（`graph_name='career-path'` ∧ `thread_id=<主路径线程>`）恰一行 `status='succeeded'` ∧ `version>=2` ∧ `lease_owner IS NULL`（active→succeeded 转换证据，Ban 接受无 version 行）；
4. `career_path` 表恰一行（owner+interview 维度，读真相）；
5. `GET /interview/:id/career-path` → 200 同字段（GET 重闸放行）；
6. 越权负前置（内嵌主路径叙事·非 NEG 列收据，§1.4/§9-rev 裁定）：他人 principal GET → 404 信封 `not_found_or_forbidden`（guard 面 `interview.service.ts:67`，沿 validate.ts:634 口径升 e2e）；
7. 409 负前置臂（内嵌主路径叙事·非 NEG 列收据）：无评估线程 POST → 409 信封 `assessment_required`（`interview.service.ts:832`）；overall 不可信线程（种子 `overall=NULL`）POST → 409 信封 `insufficient_evidence`（scoring-honesty.ts:145-147 → 映射 `:838-839`）；两 409 线程各断 `ai_graph_run`（`graph_name='career-path'` ∧ `thread_id=`该线程）恰 0 行（tx1 评估前置抛点先于 begin，`:829-843` 零写）；
8. A1：`GET /profile/growth` → 200 且断言钉 `body.dimensions.length >= 2`（deriveGrowth 维度并集口径，growth.ts:53 dimSet ∪ `:86` 返回单源；Ban 以 `points.length>=2` 顶替——单报告种子恰 1 点必假红；确定字段断言，只读 assessment 驱动的真实聚合）；
9. 零模型边界：`ai_invocation_trace` 全表行数 before/after 净变 0（观察面）。

失败降级臂（seam 线程）：
10. POST → 500 `internal_error` 统一信封（实测为准，Ban 编造体）；
11. `ai_graph_run(career-path,<失败线程>)` 恰一行 `status='failed'` ∧ `version>=2`；
12. `GET /interview/<失败线程>/career-path` → 404 信封 `not_found`（`interview-assessment.ts:102`，无失败产物）；
13. 额度账本（`entitlement_bucket`/`entitlement_consumption`/`payment_order` 三表 before/after 逐行快照）净变 0（career-path 不计费 D1，净变 0 是观察结果非假设）；
14. in-fault 重试：再次 POST 再失败 + run 行 version 递增 + `career_path` 仍 0 行 + 账本仍净变 0；
15. server alive 钉复打主路径线程形：失败臂后 `POST /interview/<主路径线程>/career-path` → 200 ∧ 主线程 `ai_graph_run` 行仍恰一行 `status='succeeded'`（begin 复用/接管同 run 行·version 单调递增）；Ban 健康 ping 顶替（server alive=主路径真实可服务）。

EXIT 契约：全臂 PASS → EXIT 0；任一 FAIL → EXIT 1 如实记录，Ban retry-to-green、Ban 改断言迁就实测、Ban 把 EXIT1 记成 flake。本绿 ≠ covered ≠ A3 closed ≠ 矩阵翻面。

### 1.2 门注册（两文件三行，沿 0.6 三先例形）

- 根 `package.json`（`:201` 后邻位插入两行）：`"uc004:career-path:http:prove": "node scripts/run-e2e-isolated.mjs uc004:career-path:http:prove:raw"` 与 `"uc004:career-path:http:prove:raw": "pnpm -C apps/api prove:uc004-career-path-http"`；
- `apps/api/package.json`（`:88` 后邻位插入一行）：`"prove:uc004-career-path-http": "node --import @swc-node/register/esm-register test/uc-e2e-004-career-path-http.proof.ts"`。

执行层允许触碰面仅此三行 + 1.1 新文件。Ban 借刀改：`interview.controller.ts`/`interview.service.ts`/`packages/ai-graphs/**`/`packages/domain/**`/`packages/db/**`/profile/worker、`scripts/run-e2e-isolated.mjs` 与 `scripts/isolated/*`、静态钉与故障钉两 prove、SSOT 三件（矩阵 / checklist / backlog）。

## §1.3 否决

- 不依赖 live key：本门零 `MODEL_API_KEY`/零 live 模型端点（`_neg-harness` 删键形 + derive 纯本地）；Ban 引 `e2e/full.e2e.ts` live 形充当本门；Ban 在 prove 里发明 Key。
- 不造 covered 假翻面：本门 EXIT 0 ≠ covered ≠ 矩阵任何列翻转；covered 翻面须 covered 评估器 + 协调方 nail，本步（draft）与 EXEC 均不改 SSOT；Ban 在文档或断言里写 covered。
- 不改产品代码（0.2/0.3/0.4 全部锚面零触）；不新增迁移；不改 `scripts/ai-docs/public-text-policy.mjs` 上限。
- 不改既有 prove：`uc-e2e-004-career-path.proof.mjs`（静态诚实钉，EXIT=1 预期绊线原样保留）与 `uc-e2e-004-career-path-fault.proof.ts` 原句口径零改（只回归复跑）。
- 不把「成长档案关联 / GrowthTimeline 写」造进断言（0.4 如实：A2 关联未接线，属另一刀）；A1 只断真实聚合面。
- 不把 EXIT 0 写成 A3 closed / G-GAP 全闭 / UC-E2E-004 covered；不碰 UC-018 / UC-052 / UC-025 任何行与文件。
- 不改 `deriveCareerPath` 纯函数与对外契约（成功体/409 信封/500 信封/GET 404 语义全部原样）；Ban 为绿改业务语义。
- 不 push、不 force-push、不碰 secrets/`.env*`；Ban self-approve（alone ≠ dual）。

## §1.4 交叠登记与 EXEC 串行裁定（rev 双审收敛新增）

在飞交叠卷：`line/nhp-batch-b-draft`（bfda3c53c，`ai-docs/delivery/harness/nhp-batch-b-REQUEST.md`）认领覆盖矩阵 §1.0.1 行 4-6，其行 4（矩阵 `:115` UC-E2E-004）拟补 NEG/BOUND/ADV 缺列收据——与本卷同触 UC-E2E-004 行面。双审收敛裁定：**EXEC 串行，本卷先行**（HTTP 主路径 + 失败降级臂先落）；本卷**不声称 NEG 列收据**（NEG 臂 6/7 仅为内嵌负前置，见 §9-rev P1-2），批 B 行 4 的 NEG/BOUND/ADV 列收据空间不被本卷占用；**批 B 在本卷并线后收缩行 4 scope 再 rebase，并按其 §0「EXEC 立项照届时 tip 重 pin」规则重 pin 全部行锚**。本卷 EXEC 前置检查相应加一项：对在飞分支 `git log -1 -- ai-docs/delivery/e2e-requirement-coverage-matrix.md` 逐树复核，交叠面出现 `47dd6be56` 之后新提交即停手上报。

## §2 门

执行时跑（EXEC 阶段）：

1. `pnpm uc004:career-path:http:prove`（新门，1.2 注册形；经 `scripts/run-e2e-isolated.mjs` 隔离壳）。期望 EXIT 0 全臂 PASS（1.1 十五臂）。
2. `pnpm uc004:career-path-fault:prove` 回归，期望 EXIT 0（4×0 不回退，attempt 台账原样）。
3. `pnpm uc004:career-path:prove` 静态诚实钉：本刀不改它；现 EXIT=1 为预期绊线（0.5 原钉），不得为绿改其口径。
4. `pnpm turbo typecheck --force`。

`pnpm docs:check`（根 `package.json:9`，即 `node scripts/ai-docs/check-docs.mjs`）——draft 与 EXEC 两阶段都跑。上限在 `scripts/ai-docs/public-text-policy.mjs:137` `MAX_FILES = 2_346`；本树起草前 main 实测扫描 2341（本席亲测 `47dd6be56`），本步新增一个受管文件 → 2342 ≤ 2346，余 4，通过。前刀形制里「2328 恰等」系当树旧值；本树实值 2346 足额，帽步进无须随刀行使（在飞承登语如实记录于此，不改上限）。不许把上限改大。

`pnpm turbo lint`：0 errors；警告不得超过各包现有 `--max-warnings`：根 `package.json:8` 为 5242，`apps/api/package.json:7` 为 1423，`packages/domain/package.json:10` 为 115，`packages/ai-runtime/package.json:14` 为 628，`apps/worker/package.json:7` 为 959，`packages/db/package.json:11` 为 1042，`apps/web/package.json:7` 为 601，`packages/qdrant-store/package.json:11` 为 27，`packages/ai-graphs/package.json:10` 为 47，`packages/contracts/package.json:12` 为 265，`packages/config/package.json:8` 为 0，`packages/db-mysql/package.json:8` 为 0。低于上限可以通过，不许把上限改大。

本步（draft）届树实测（本席亲测）：`docs:check` EXIT 0，扫描 2342（=main 2341 + 本档 1，≤ 2346）；markers 卫生 grep 唯一命中为下方声明两行自引字面，零真实占位标记（收据随 commit）。

卫生声明：本档零占位标记——`grep -n "TODO|FIXME|XXX|TBD|待补|占位|<MARKER>"` 于落卷前亲证：唯一命中为本声明行自引 pattern 字面（非占位），零真实占位标记。

## §8

draft:awaiting_pre_exec_dual（起草席 uc004-draft 落卷 2026-10-26 · 待预执行双审 · 双审 PASS 后由协调方行使 EXEC 授权 · STOP）

draft:awaiting_pre_exec_dual（三处状态之一 · 本步 docs-only 零码动 · releaseEvidence=false · Not HA · coveredCount=8 不变 · STOP）

## §9-rev（双审合并修订 · rev 席落卷 2026-10-26 · 纯文面·零码动·零断言放宽）

双审回路：席1 PASS + 席2 FAIL → rev 回路。以下逐条落点全部 rev 席本树（@`4bf00bed0`）亲证后落文，行号即本卷所见：

1. **P1-1 臂 8 断言钉死**（席2）：臂 8 改钉 `body.dimensions.length >= 2`——deriveGrowth 维度并集口径（growth.ts:53 dimSet ∪ `:86` 返回单源）；Ban `points.length>=2` 顶替（单报告种子恰 1 点必假红）。种子规格同步钉 `assessment_report.dimensions` 逐项必含数值 `score`（沿 fault prove dims2 形 `uc-e2e-004-career-path-fault.proof.ts:212-215`；deriveGrowth 仅收 `Number.isFinite(score)` 项，growth.ts:57）。落点：§1.1 种子段 + 臂 8。
2. **P1-2 NEG 降格与交叠裁定**（双席收敛）：本卷保持十五臂全貌；NEG 臂 6/7 降格为主路径叙事内嵌负前置（臂题加「负前置·非 NEG 列收据」标注），不单独声称 NEG 列收据、不据此求矩阵任何列翻面；新增 §1.4 交叠登记 `line/nhp-batch-b-draft`（bfda3c53c）并裁定 EXEC 串行：本卷先行·批 B 收缩行 4 scope 后 rebase 重 pin。落点：臂 6/7 题注 + 新 §1.4。
3. **席1 P2-1 §0 行号四处勘误**（逐处亲证）：QUEUE 缺口源 `:24`→`:25`（`REMAINING-NORTH-STAR-QUEUE.md:25` =「9. UC-004 FAULT/A3 gap · L」）；§0.2 interview.service `denyPublicPreviewWrite` `:829`→`:828`、pre 块 `:830`→`:829`（亲证 `:827` generateCareerPath / `:828` deny / `:829` asPrincipal pre 块）；§0.2 ai-graphs 导出 `:17-18`→`:15-16`（index.ts:15-16 恰为 career-path 两 export 行）；§0.3 fault prove seam 常量 `:55`→`:64`（`const IV_FI3`）并补 `SEAM_ENV_KEY` `:66` 锚。落点：§0 缺口源句 + §0.2 ×2 + §0.3。
4. **席1 P2-2 臂 7 不可信种子钉 overall NULL**：`insufficient_evidence` 前置线程评估种子钉 `assessment_report(status='ready', overall=NULL)`（亲证 `requireTrustedPracticeOverall` 对 NULL fail `insufficient_evidence`，scoring-honesty.ts:145-147；409 映射 interview.service.ts:838-839）。落点：§1.1 种子段 + 臂 7。
5. **席1 P2-3 臂 15 钉复打主路径线程形**：server alive 收敛为失败臂后复打主路径线程 `POST` → 200 ∧ 主线程 `ai_graph_run` 仍恰一行 `succeeded`（begin 复用/接管同 run 行·version 单调递增）；Ban 健康 ping 顶替。落点：臂 15。
6. **席2 P2-1 臂 6/7 信封键钉**：臂 6 越权 GET 404 钉 `not_found_or_forbidden`（guard 面 interview.service.ts:67）；臂 7 两 409 显式落键 `assessment_required`（:832）/`insufficient_evidence`（:838-839）；GET 侧 `not_found`（interview-assessment.ts:102）于臂 1/12 保持显式。落点：臂 1/6/7/12。
7. **席2 P2-2 409 线程 ai_graph_run 零行臂**：两 409 线程各断 `ai_graph_run`（career-path ∧ 该 thread_id）恰 0 行——tx1 评估前置抛点先于 begin（interview.service.ts:829-843 零写·begin 首写在 `:850` 后）。落点：臂 7。
8. **席2 P2-3 臂 2 钉 `level='mid'`**：种子 overall=60 → 纯分数阶梯 ≥50→mid（career.ts:51 阶梯单源/`:57`），沿 validate.ts:632 先例（`r.body.level === 'mid'`）。落点：臂 2。
9. **席2 P2-4 种子 score_card 须满足 aggregateInterviewScores 资格谓词**：钉 `status='practice_eligible'` ∧ `deterministic_total` 数值非空（0100 `:172`）——0161 收窄后 `eligible_card_count` 只认 practice_eligible 单态（`packages/db/migrations/0161_practice_only_read_narrowing.sql:33` 亲证）；连带勘误 §0.4 旧「只认 IN ('practice_eligible','b_review_eligible')」两态口径为 0161 单态口径（两态口径仅存于 growth answered 计数面 profile.service.ts:100，非 GET 重闸资格谓词）——此项为席2 P2-4 落文必要连带，否则种子钉与谓词文面自相矛盾。落点：§0.4 + §1.1 种子段。
10. **席2 P2-5 QUEUE 行号**：与席1 P2-1 第一处同标（`:24`→`:25`），已并入第 3 条落点。

工序收据：§9-rev append 后复跑 markers 卫生 grep + `pnpm docs:check`（纯文面零新增文件，扫描数维持 2342≤2346；收据随 commit）。本节为纯文面修订：不改 §1 十五臂总数、不改 §2 门矩阵、不改任何 Ban/否决条、不改产品代码与两既有 prove 口径。

draft:awaiting_pre_exec_dual（rev 卷尾钉 · 与卷首行/§8 同值 · STOP 维持 · awaiting_pre_exec_dual 不变）

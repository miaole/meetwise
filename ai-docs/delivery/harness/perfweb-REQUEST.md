# PERFWEB REQUEST — NHP-001-PERF-web-01 执行收据起草卷·覆盖矩阵 §1.0.2 `:146` UC-E2E-001 PERF_web cell + case-matrix `:41` 具名行 + §1.6 `:143` NHP-PERF-WEB-SUITE 伞行处置（docs-only REQUEST 卷·起草落卷即停）

**Status**: **`closed:post_prove_dual_pass`**（2026-10-27 post 落卷收官三处翻面·史录零字洗：`draft:awaiting_pre_exec_dual`（2026-10-26 起草落卷）→ `executed:awaiting_post_prove_dual`（2026-10-27 EXEC 落卷·前置链=pre-exec dual r3 双审两独立外席 BOTH PASS→协调方 EXEC 授权随令行使→§9-EXEC 落卷）→ **`closed:post_prove_dual_pass`**（同日 §9-post post-prove 双审两独立复核面 BOTH PASS 会签·P2×3 随卷登记·详 §9.3）· **STOP 三处钉已闭：本 Status 行 + §8 + 卷尾注 同值** · alone≠dual 已解（会签在卷 §9.3）· 本 commit 不预 claim 任何 covered 升格（EXIT0=case≠covered · coveredCount=8 零动 · blind/case-only 措辞保留）· 后继=并线席随令 fetch/merge/push/PR+终验五门（lint 前清 `.next`/`.tmp` 生成物·P2-C 履行）。

**席位**：NHP-001-PERF-web 起草席（诊断+起草双责·协调方派·派单标识「总盘派单序第 9 项 R1/R42 合刀」系派单令 token·非在树 SSOT 行名如实登记·认领=UC-001 PERF_web 分面 + case-matrix `:41` NHP-001-PERF-web-01 执行·与批 A/B/C 及各 UC 专属线互斥不重叠）。
**基线**：`origin/main` @ **`9c31c0ccc`**（full `9c31c0ccce2c5b7a82f80fa7dca332087491ad89` · `git fetch origin` 本 turn 成功 · #156 pay-neg 并线点 · 分支 `line/perfweb-draft` 建 worktree `git worktree add ../meetwise-perfweb -b line/perfweb-draft origin/main` 亲立 · HEAD 落 tip 亲证）· `node scripts/ai-docs/check-docs.mjs` 本树亲跑 **EXIT=0 · scanned 2410 = cap 2410 恰等零余量**（`public-text-policy.mjs:171` `MAX_FILES = 2_410` 亲证 · §2-1 预算核 → 本卷随刀步进）· 工作树 `meetwise-perfweb`（仓根同级）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md`（Phase2 #12 `:28`）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§0.5 `:57-65` 强制列+PERF_web 分面定义 / §1.0.2 `:146` / §1.0.3 `:166` 双表同步令）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（`:41` NHP-001-PERF-web-01 / `:142-144` §1.6 总册）→ `ai-docs/requirements/use-cases/e2e-scenarios.md`（UC-001 `:48`）→ 涉事机制源 `apps/web/playwright.config.ts` / `scripts/run-e2e-ui.mjs` / `apps/web/app/api/interview/[id]/events/route.ts` / `apps/web/e2e-ui/stream-window.spec.ts` / `apps/web/next.config.mjs` / `apps/web/global.d.ts` / `scripts/g6-e2e-iso-blocked.proof.mjs` → PERF 收据形先例 `apps/api/test/uc-e2e-001-nhp-perf-api.proof.ts`（五值/nearest-rank/runs=3/caps·批 C Row 3 执行在证）+ `apps/api/test/uc-e2e-018-perf-load.proof.ts`（零触只读）。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①`REMAINING-NORTH-STAR-QUEUE.md` Phase2 **#12「remaining NHP rows one-knife-one-row · highly parallel」**（`:28` 亲证·批 A/B/C 同源）；②`e2e-requirement-coverage-matrix.md` §0.5 强制列令（PERF_web 分面「不得单列 n/a 偷关」`:65`）+ §1.0.3 `:166` 双表同步令；③协调方派单（PERF-web 起草·docs-only 授权·R1/R42 合刀标识随令）；④结构范本=`harness/nhp-batch-c-REQUEST.md`（§0-§8 形制·其 §1 case 3/§9-EXEC Row 3=NHP-001-PERF-api-01 执行收据同构先例）。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse 亲算 @`9c31c0ccc`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 本 turn **34 树**实测（EXEC 立项日全量重 pin 值·起草 turn 38 史录不洗）——`line/perfweb-draft` 恰 1 命中=本席；`ls ai-docs/delivery/harness/ | grep perfweb` 落卷后唯一同名卷=本卷。
- **在飞三线逐 tip 亲读**（对本案触面 `scripts/ai-docs/public-text-policy.mjs`+`public-text-policy.proof.mjs`+双表 PERF 区）：
  - `line/perf3-receipts`——**已并线收官**（#157 落 main `f82d1a2c2`·EXEC 立项日重 pin·起草 turn `1fb9acbf8` 在飞史录不洗）·PERF_api 三收据三 proof 在 main（cap union 面 `2416` 承值成分）。
  - `line/x33-adv-draft` @`5a560411a`（worktree 在飞·EXEC 重 pin 值·起草 turn `704505167` 史录不洗）——已 merge main `f82d1a2c2`·cap **2_419**（=main 2416+本支 3 先手）·零触双表矩阵文件·**#160 在飞未在 main 如实采**。
  - `line/webhook-fault-draft` @`3f44c2408`（worktree 在飞·EXEC 重 pin 新登——起草 turn 登记的 webhook-neg 线已 #159 并线收官·此为其后继故障注入卷）——cap **2_411**（起草届值）·零触双表矩阵文件·**#161 在飞未在 main 如实采**。
- 其余 `line/*` 无 worktree 分支对 policy 双件的提交均系历史并入链（`git log --not origin/main` 逐支核过·在飞零交涉）。
- **在飞交叠复核规则（EXEC 立项日必做）**：本卷起草 turn 触面=恰 3 tracked（本卷 .md+policy 双件）；EXEC 期触面=§2-4 登记清单。届时对在飞分支 `git log -1 -- <触面文件>` 逐树复核，任一分支顶对触面存在 `9c31c0ccc` 之后新增提交且与本卷同区 → 触停止条件「现场漂移」停手上报。
- **在飞快照 EXEC 日重 pin 预告（standing rule）**：上列 §0.0 快照系起草 turn 值——rev 修订席 turn 在飞复核已见漂移：webhook 线 cap 已步进 **2413**（对起草卷 `:20` 记 2410 已陈旧）·x33 线 tip 已进 **`8153be74c`**（对 `:19` 记 `704505167` 已陈旧）·worktree 树数已变 **34**（对 `:16` 记 38 已陈旧）；上列三值系 rev turn 协调方观察快照·非稳定锚。**EXEC 立项日对届时 tip 全量重 pin**（cap/tip/树数/触面逐项·含 §2-1 在飞三线 cap 登记行）——standing rule「并线 union 按届时实测重测重步」承登·漂移如实改锚·结论不变则只更数。

### 0.1 blob 锚表（`git rev-parse <tip>:<path>` 亲算·8 hex）

| 文件 | blob（行数） | 关键行锚 |
|---|---|---|
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `28048fce`（521） | **§1.0.2 `:146` UC-E2E-001 分面行（PERF_api 执行收据已落 · PERF_web=blind/case-only · LOAD_w=blind/case-only）**·`:65` PERF_web 分面定义（「Playwright 流式窗口、首屏/交互预算」·假绿禁令「单机 Chromium ≠ 真机容量」）·§1.0.3 `:166` 双表同步令 |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `c71bf78b`（204） | **`:41` NHP-001-PERF-web-01（001/PERF/web/golden UI 流式窗口预算·「收据可复核；≠ 真机容量」·旗=case-only/blind·锚=e2e:ui 历史 not_run）**·`:42` NHP-001-LOAD-w-01（留后刀）·§1.6 `:143` NHP-PERF-WEB-SUITE（「production Next + Chromium/Pixel 流式窗口预算」·case-only/not_run·禁令「单机 ≠ 真机容量」） |
| `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c3` | UC-001 `:48`（黄金路径全链路） |
| `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md` | `a7d8959a` | Phase 2 item 12（`:28`） |
| `scripts/ai-docs/public-text-policy.mjs` | `596d4017` | `:171` `MAX_FILES = 2_410`（cap 亲证 · §2-1 预算核 · 本卷随刀步进 2413） |
| `apps/web/playwright.config.ts` | `321b80e0`（32） | `:5-6` 无 webServer——栈由外部 runner 启（api+worker+web production `next start`）·`:11` 单用例上限 150s·`:14-17` **workers=1 串行钉（「服务端真实并发由 performance.e2e.ts 的独立 HTTP 门量化覆盖，不能靠浏览器用例并发数冒充压测」）**·`:27-31` 双 project（chromium=Desktop Chrome + mobile=Pixel 5） |
| `scripts/run-e2e-ui.mjs` | `963f81aa`（318） | **`:53` `live_provider_key_missing` fail-closed（无 `MODEL_API_KEY` 即 throw）**·`:72-84` 端口面（10240-65534 · pid 派生默认 · `E2E_API_PORT`/`E2E_WEB_PORT` 显式覆盖 · 三口互异）·`:242-278` 无 BUILD_ID 或 STALE_BUILD_GUARD 判陈旧 → 先 `next build`（build 阶段置 `E2E_UI_STRESS='1'`）·`:280-288` production `next start`·`:292` `--grep-invert 'capture README screenshots'`·`:296-297` `E2E_UI_GREP`/`E2E_UI_PROJECT` 选面缝 |
| `apps/web/app/api/interview/[id]/events/route.ts` | `8023ea9e`（131） | **`:103` STRESS 门=构建期内联 `__E2E_UI_STRESS__==='1'`（生产构建内联 '0' 恒假+死码剔除 `:19-23`）**·`:12-13` `__e2e_stream_stress__`/10000 轮·`:32-55` hermetic 合成 SSE 源（零上游 fetch 零模型零用户数据）·`:98-99` 正常 httpOnly 会话前置 |
| `apps/web/e2e-ui/stream-window.spec.ts` | `9be5d39a`（69） | **`:9` 10k 精确重投 → 唯一 80 轮 DOM 窗 → 终态视图**·`:11` `Date.now()` 起表·`:20-25` 窗口断言（显示第 9921–10000 轮/80 turn 全唯一）·`:26` 终态断言·**:29 `Date.now()-started < 15_000`（在树唯一 web 面延迟预算源·自述「deliberately broad ceiling…not a device or production SLO」）**·`:46/:60` G3 progress/silent 变体 |
| `apps/web/next.config.mjs` + `apps/web/global.d.ts` | `f44c9119`+`53f5c5ac` | `next.config.mjs:18` `compiler.define __E2E_UI_STRESS__`（build 期内联 '0'/'1'）·`global.d.ts:20` 裸标识符声明 |
| `scripts/g6-e2e-iso-blocked.proof.mjs` | `bdaf6007`（301） | **`:93` 行为门钉死 `run-e2e-ui.mjs` 的 `live_provider_key_missing` fail-closed（拆门即红）**·`:107` `run-performance-e2e.mjs` 无 Key 门（API 面·无 web·非本刀车） |
| `apps/api/test/uc-e2e-001-nhp-perf-api.proof.ts` | `977e0d01` | 五值先例 `PERF={N:100,c:10,p50:250,p95:750,p99:1500,errMax:0.005}`+max 观测披露 · nearest-rank · warmup 10 excluded · runs=3 all-must-pass · caps Docker `--cpus=2 --memory=4g` · Key 进程内先删+断言 unset |
| `scripts/ai-docs/public-text-policy.proof.mjs` | `a9398726`（404） | `TC-quality-04-E11` `:249` · **四联动点 `:375`（loop 2_410）/:382（atCap.scannedFiles 2_410）/:385（`f-2410.md` 注入路径）/:388（`PTP_FILE_LIMIT:2411`）**——本卷随刀联动 2_413/`f-2413.md`/`:2414` |
| `package.json`（root） | `5d1f966a`（740） | `:168` `uc018:ui:prove`/`:265` `uc003:i18n-locale-ui:prove`（isolated e2e:ui 选面先例·`E2E_UI_GREP`+`E2E_UI_PROJECT`+`E2E_UI_SKIP_WORKER=1`）·`:402` `e2e:ui`·`:404` `e2e:ui:isolated`·`:405` `performance:e2e`（API 面）·`:407` `verify:e2e-performance`（历史门族 not_run） |
| `apps/web/package.json` | `0f840191` | `:7` lint **`--max-warnings 601`**（五值恰等册 web 帽·Ban 就地放宽）·`:24` typecheck `tsc --noEmit` |

### 0.2 产品面侦察结论（起草席亲证·三问三答）

**① 嘴形定标（production Next vs dev 形 + keyless 面是否成立）**：
- 现行 e2e-ui 启动形亲读=**production 形**：`run-e2e-ui.mjs` 无 `.next/BUILD_ID` 或 STALE_BUILD_GUARD 判陈旧 → `next build`（build+start 两阶段均置 `E2E_UI_STRESS='1'`）→ `next start` 服务生产构建（`:260-288`）——非 dev 形，与 case-matrix `:143`「production Next」措辞一致。本地行使**可行**：全链 build+start+就绪探测+拆栈在树工程化（含 `web_not_ready` 败臂/build 扣留日志落盘/STALE_BUILD_GUARD 假红防线），历史行使收据在树（`receipts/e2e-assert-refresh/s3-e2e-ui-isolated-final*.log`）→ **不触发降格形·不红停归排期**（派单条件 4 核销）。
- **keyless 面定标（核心侦察结论）**：`pnpm e2e:ui` 共享门 `run-e2e-ui.mjs:53` 无 `MODEL_API_KEY` 即 fail-closed `live_provider_key_missing`，且该门被 `g6-e2e-iso-blocked.proof.mjs:93` 行为门钉死（拆门即红·Ban 触门）→ **经 `pnpm e2e:ui` 门 keyless 不可行·如实登记**。keyless 前提的成立形=**专用 proof 自启栈**（沿批 C `uc001:nhp-perf-api` 同构）：隔离真 PG（run-e2e-isolated 系）+ api keyless boot（`MODEL_API_KEY`/`MODEL_BASE_URL` 进程内先删+boot 后复证 unset·`977e0d01` 先形）+ web 生产构建/启动（`E2E_UI_STRESS='1'`）+ Playwright 程序化行使——**零模型零 worker**：STRESS 源 hermetic 在 web 层（`route.ts:32-55` 合成 ReadableStream 零上游 fetch）+ `E2E_UI_SKIP_WORKER=1` 先例在树（root `package.json:168/:265`）。登录主链嘴=真 signup（`/login` 注册 → user_account 落隔离 PG）→ dashboard → `/interview/__e2e_stream_stress__?duplicateFrames=1` → 同源 SSE `/api/interview/__e2e_stream_stress__/events`（STRESS 分支 `:103`·持正常 httpOnly 会话）——全嘴零模型零外呼，**PERF-web 零模型前提成立（经专用 proof 自启栈形）**。
- **披露钉（D-BUILD）**：量测构建携 `__E2E_UI_STRESS__='1'` build 期内联（e2e-guard-only 源）≠ 洁净生产 bundle（生产构建该分支死码剔除 `route.ts:19-23`）——收据须逐字披露·Ban 宣称「洁净生产包量测」。`next build` 耗时在测量窗外（prep 段·沿 PERF-api consent 窗外同法）。

**② 流式窗口预算面（现断言亲读）**：`stream-window.spec.ts` 三测试=10k 精确重投 80 窗（`:9`·唯一预算臂 `:29` 15s 墙钟）+ G3 progress（`:46`）/silent（`:60`) 两变体（功能断言·零延迟量测）。10k 臂已证全管线（SSE decode→reducer→rAF→DOM 窗）可断言、`Date.now()` 计时在树——**预算面有缝**：缺 per-sample 分位（现单发单值）、缺 runs 重复、缺 error_rate、缺 caps、缺收据四件套=本刀补账面。矩阵 `:65` 分面定义中「首屏/交互预算」**无在树预算源无在树断言** → 本刀不取（§1.3·Ban 硬造）。

**③ Playwright 计时能力**：`Date.now()` 墙钟臂在树亲证（`:11/:29`）；per-sample `performance.now()`/`page.evaluate` 端到端延迟可行使（Playwright 程序化 API+report 耗时披露 `:27-28` 注记亲读）——**计时缝成立**。端到端延迟口径登记=**page.goto(stress URL) 起 → 终态视图可见止**（注册/导航 prep 在窗外）。

**④ 派单数「22 tests」亲点勘误（如实登记）**：fresh 树 `apps/web/e2e-ui/` 8 spec 文件 **15 个 `test()` 声明**（golden 2 + online-public 2 + recruiting-bound 1 + screenshots 2 + stream-window 3 + uc003 1 + uc018 1 + voice-duplex 3）·双 project 配置 ×2=30 planned；默认门净执行=**20**（30−10 skip·含 screenshots 4）·key/URL 门 skip=10（online-public 2+voice 3×2·`test.skip` 亲读）·**runner `--grep-invert` 剔除=0**——`:292` 模式 `capture README screenshots` 与 screenshots 两测顶层标题 `capture demo screenshots` 零交集（`:292` 模式自引入即陈旧·实证 `receipts/e2e-assert-refresh/s3-e2e-ui-isolated-final3.log:33-34/:48-49` 四执行通过）。派单「22」对本 base 不可复现·以 fresh 亲点为准（本卷 §0.1 行锚为准）·预算面承载 spec=stream-window.spec.ts（3 声明）如实登记。

### 0.3 认领登记（行号+cell+现值·亲读逐字）

| 位置 | cell/行 | 现值（亲读） | 本刀补 |
|---|---|---|---|
| 矩阵 §1.0.2 **`:146`** | UC-E2E-001 **PERF_web** | **blind / case-only**（「PERF_web/LOAD_worker 保持 blind/case-only 留后刀」·PERF_api 格已带批 C 执行收据） | **执行收据**（具名 case=`NHP-001-PERF-web-01`·格值措辞 case-only 保留+收据入账） |
| case-matrix **`:41`** | NHP-001-PERF-web-01 | **case-only / blind**（「收据可复核；≠ 真机容量」·锚=e2e:ui 历史 not_run） | 执行收据锚（`pnpm uc001:nhp-perf-web:prove` · 收据路径 · 措辞 case-only 保留） |
| case-matrix §1.6 **`:143`** | NHP-PERF-WEB-SUITE（伞） | case-only / not_run（「单机 ≠ 真机容量」） | 零翻——per-UC 实例≠伞（Ban 借本收据宣伞闭合·沿批 C `:40` 同法） |

---

## §1 修法（一行一 case · `NHP-001-PERF-web-01` 执行收据 · 零产品码触 · 零 invent covered · 零 live key · 零模型）

**修法形状**（沿批 C Row 3 `uc001:nhp-perf-api` 同构）：新 proof 文件（预期落位 `apps/web/test/nhp-001-perf-web.proof.ts` 或 `apps/api/test/` 隔离系内·EXEC 按 runner 注册位归属亲定）+ root `package.json` `prove`/`prove:raw` 双行 + runner 五位登记（`scripts/run-e2e-isolated.mjs`：`isolatedReceiptSources`（`run-e2e-isolated.mjs:93`）/allowlist/isolatedCommand/pre-migrate 名单/resource-caps 条件——**五位全登记**·批 A 第四位+批 C 第五位教训承登）+ egress 环境引用登记（`provider-egress-inventory.json` additive·新 proof×实际出现词名·class=test-isolation·`10b920521` 先例形·漏登即 CI `environment_reference_unregistered` 红）+ 双表行内改（矩阵 `:146` PERF_web 格+case-matrix `:41` 收据锚）· **prove-only · `apps/*/src`/`packages/*/src`/`apps/web/e2e-ui/**` 零 diff 意向**；isolated 真 PG · 零 MODEL_API_KEY（进程内先删+断言 unset）· 零外呼 · 零 worker drain；收据 `.tmp/<case>-receipts/` + tracked `ai-docs/delivery/receipts/<case>/`（implementer pre-commit runs · **not evidence of record**）。行状态/格值一字不动：EXIT0=case≠covered，coveredCount=8 不变。

**证据层**：隔离真 PG + 自启三进程栈（api keyless + web production build/start + Playwright headless chromium）· caps=**三容器 Docker `--cpus=2 --memory=4g`**（PG+api+web · NanoCpus=2e9/Memory=4GiB HostConfig inspect 亲证入收据·沿 uc001 双容器形+web 第三容器同值）· **拓扑钉（如实注）**：web 容器含**容器内 `next build`**（build+start 两阶段·`E2E_UI_STRESS='1'` 经 caps-child passEnv 扩展传入容器）——**web 容器形非既有路径**（本 proof 自启栈新组形·非 `run-e2e-ui.mjs` 宿主直跑形）·三口（PG/api/web）经 Docker 发布口+`host.docker.internal` 互通（macOS 无 `--network=host`）· **Chromium 宿主驱动进程不封顶已披露**（单机 headless 单实例 · workers=1 串行 · `:143`「单机 ≠ 真机容量」禁令保留）。

**负载形状（登记冻结）**：登录主链嘴真 signup prep（逐虚拟用户唯一邮箱·测量窗外·不计分位）→ N=**100** · **c=1 串行**（`playwright.config.ts:14-17` 在树明钉浏览器并发冒充压测之禁——串行非降格·登记为 web 面口径·API 侧并发已由 PERF_api 收据另证）· **runs=3 all-must-pass** · warmup 10 excluded · nearest-rank · timeout 10s/sample=error。per-sample 主体=`/interview/__e2e_stream_stress__?duplicateFrames=1` 10k 精确重投全管线（goto→终态可见 elapsed）。双端：chromium project=**预算承载面**；Pixel 5（mobile project）=**P-OBS 披露臂 N=20**（功能断言+五值观测值入收据·**Ban 当预算判据**·防 runtime 膨胀的登记限幅）。

**期望（五值形 · web 实情定标 · 值源在树亲证·Ban 硬造）**：p50 ≤ **15_000ms** · p95 ≤ **15_000ms** · p99 ≤ **15_000ms**（值源=`stream-window.spec.ts:29` 在树唯一 web 面延迟预算——同主体 per-test 15s deliberate broad ceiling·逐字承其「catches a regression to per-event O(n²) work without pretending to be a device or production SLO」读法）· max=观测值披露（不设阈·`977e0d01` 形）· error_rate ≤ **0.5%**（uc018/uc001 同口径）· 全 sample 功能断言（唯一 80 轮窗+题面全唯一+终态可见）all-pass。**读法钉**：p99 ≤ 15s 受「timeout 10s/sample=error + error_rate ≤ 0.5% 零容忍」支配——**有效样本上限=10s**，计分样本域内 p99 恒 ≤10s·15s 阈非约束面仅回归守卫名义上限（**收据按此读法落卷**·分位读法不得宣 10-15s 区间分辨力）；同值第二锚=`stream-window.spec.ts:20` 显式 `timeout: 15_000`（可选补登入收据·与 `:29` 15s 墙钟同值双锚）。本收据=回归守卫预算（O(n²) 退化捕获）**≠ 线上 SLO ≠ 真机容量 ≠ HA ≠ 生产 bundle 量测**（D-BUILD 披露随收据）；阈值收紧=后刀校准卷出域（本卷 Ban 就地收紧 Ban 就地放阈）。

**收据四件套**：CMD+EXIT+负载参数冻结（N/c/runs/warmup/双端/caps/构建旗）+ `.tmp`/tracked 路径（沿批 C Row 3 同形）。

---

## §1.3 否决表（落选面诚实留痕·含停止条件登记）

| 落选项 | 否决/登记理由 |
|---|---|
| 矩阵 `:65` 分面定义「首屏/交互预算」 | **码面无在树预算源无在树断言**（全树 grep 亲证零 web 首屏阈值）→ 本刀不取·Ban 硬造阈 · 留后刀独立裁量。 |
| case-matrix `:42` NHP-001-LOAD-w-01（worker 队列积压） | LOAD_worker 面 ≠ PERF_web 面 · 一行一 case 防多面同刀 wash · 留后刀。 |
| `:147` UC-002/010 三分面 | 跨副本压测未证 · live worker 面 · 本刀零触。 |
| `pnpm e2e:ui` 全门作 EXEC 车 | **keyless 不可行**（`run-e2e-ui.mjs:53` Key 门+`g6:93` 行为门钉死）· 且全门 20 执行含与本刀无关面 → 专用 proof 自启栈取代（§0.2-①）。 |
| `performance:e2e` / `run-performance-e2e.mjs`（`:405`） | API/worker 面·无 web 无浏览器（g6 `:107` 无 Key 门正因无 web 面）→ 非本刀车·旁证零借。 |
| `verify:e2e-performance` 族（`:407`·矩阵历史门族 not_run） | 历史门族台账·非单行 case；本 case=per-UC 实例 · **Ban 借实例宣族复绿**（批 C `:153` 同法）。 |
| NHP-PERF-API-SUITE（`:142`）/ NHP-PERF-WEB-SUITE（`:143`）闭合宣称 | 伞行零翻 · per-UC 实例≠伞 · coveredCount=8 不变。 |

---

## §2 验收门矩阵（pre-exec 双审核对单基面 · 起草门 1-3 本 commit 适用 + EXEC 预基面届时重 pin · **数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **docs:check（红停条款）+ cap 预算核（亲算）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 · 本树起草前亲跑 **EXIT=0 · scanned 2410**（stdout「public text policy scanned 2410 managed worktree files」亲读）· cap=**2410**（`public-text-policy.mjs:171` 亲证）= **恰等零余量** → 本卷 +1 必超 → **随刀先手步进 cap 2410→2413**（+3 算式：本卷 REQUEST 1 + EXEC 期 proof 1 + EXEC 期 tracked receipt 若落 text-extension 1 · `x33-adv-draft` 先手步进先形+killsw 算式先形·协调方常设预授权「cap/lint 以合并树实测为准恰等步进免再询」承登）+ `public-text-policy.proof.mjs` 四联动点恰等联动（2_413/`f-2413.md`/`PTP_FILE_LIMIT:2414`）· 本树步进后亲跑 proof **12/12 EXIT=0** · 步进后 docs:check 预期 scanned 2411 ≤ 2413。在飞三线（EXEC 立项日全量重 pin 值：perf3=已并线收官 #157 落 main·x33=2419 @5a560411a·webhook-neg=已并线收官 #159 落 main·其继 webhook-fault=2411 @3f44c2408）并线 union 届时按 standing rule 重测重步（§0.0）——已履行：merge 届值 main 承 **2416**·union 实测 2417 红→**CAP-SANCTION-2418 恰等步进 2416→2418**（算式=main 2416+本卷 REQUEST 1+EXEC 期 proof 1·tracked gate stdout 收据落 .log ∉TEXT_EXTENSIONS 非扫描面不计=起草卷「若落 text-extension 1」条件分支不触发·§9.1 承登）。若 EXEC 期 tracked 受管件超算式 → 恰等再步随 standing rule·Ban 就地改 cap 超算式值。
2. **markers 五类零命中**：本刀改动集（3 tracked）五类标记词（运行时组装口径 `i6-239-gates.proof.mjs:154-163`·词面不抄卷内防自指）+行首冲突标记 grep **零命中**（起草席亲跑·回执入 EXEC 收据）。
3. **diff 面机检**：起草 commit `git diff --numstat <base>` **恰 3 tracked 路径**=本卷 .md+`public-text-policy.mjs`+`public-text-policy.proof.mjs`；EXEC 期 diff 面=本卷+双表行内改（矩阵 `:146` 邻区+case-matrix `:41` 邻区）+proof 新文件+root `package.json` 注册行+runner 五位登记+egress-inventory additive+收据 tracked 面——届时逐件登记·多任何未登记 tracked 路径即停。
4. **EXEC 预基面（届时重 pin）**：proof EXIT=0 **双 fresh**（实现方恰一次+独立复验恰一次·attempts 台账含红次如实）· 五值收据四件套齐（缺任一=门红）· caps 三容器 HostConfig 亲证（NanoCpus/Memory 同值 ok=true·非自报）· `pnpm -C apps/web typecheck` EXIT=0 · web lint **≤601 恰等零放宽**（超则恰等步进 sanction 随令·Ban 就地放宽）· turbo typecheck EXIT=0 · egress additive 登记亲跑 EXIT=0 · 双表同步 diff 逐件登记（§1.0.3 `:166` 令）· **邻面登记**：e2e:ui 族套件（golden/recruiting/uc003/uc018/voice）key-gated 出 keyless EXEC 窗——**如实登记 out-of-window 非静默跳过**，邻面安全基=`apps/*/src`/`packages/*/src`/`apps/web/e2e-ui/**` 零 diff+typecheck/lint 绿；任一门红 → §8 停止条件。
5. **行/格冻结**：EXIT0=case≠covered · 矩阵 `:146` PERF_web 格与 case-matrix `:41` 措辞仅允许 blind/case-only 保留+收据锚入账 · `:143` 伞行零翻 · coveredCount=8 零翻转 · **Ban 借本收据宣 SLO/真机容量/生产 bundle 量测/伞闭合**。

## §3 范围外（越界即 FAIL）

1. **产品码面零触**：`apps/`、`packages/` 产品源零 diff（EXEC 期仅新增 proof+注册行+runner 注册位·`apps/web/e2e-ui/**` 现有 spec 零触——预算 proof 系独立新文件非改既有 spec）。
2. **批 A/B/C/在飞三线触面零触**：批 C 三行（`:120/:121/:146` PERF_api 格/case-matrix `:40`）· perf3 双表 PERF_api 区（`:61/:62`/`:148`）· webhook/x33 REQUEST 面——只读；policy 双件系共享计数预算面（本卷按 standing rule additive 步进·非他线专属）不在零触之列。
3. **阈值就地位**：Ban 就地收紧/放宽五值（收紧=后刀校准卷·放宽=无授权即 Ban）· Ban 触 `:143` 禁令措辞。
4. **共享 SSOT 零改**：REMAINING-NORTH-STAR-QUEUE / execution-master-checklist / gap-bug-backlog / case-matrix 其余行只读引用——翻面权归协调方。
5. **covered/queue 翻面零预支** · **零迁移零配置零 CI 告警配置改** · Ban 改 g6 行为门/`run-e2e-ui.mjs`（Key 门系被钉行为门）· Ban 造 .env*/写 Key 值入树入据 · Ban 顺带升级依赖包。

## §4 依赖

**①上游已满足**：STRESS 门/hermetic 源/production 启动链/计时臂全在树（§0.1/§0.2 blob 亲证）+ 五值 PERF 收据形先例（`977e0d01` 执行在证）。**②同文件并发**：起草 turn 触 policy 双件——§0.0 在飞三线已登记·并线 union 按 standing rule 重测（交涉面=计数预算非内容·冲突解=dual-keep 注记先例形）；EXEC 期触双表 `:146`/`:41` 邻区——届时在飞复核必做。**③下游**：执行收据供 PERF-web 伞行/校准后刀/covered-lift 评估族引用（评估权归后继刀·本卷 Ban 代评）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual）；Ban retry-to-green（红即停·attempts 台账·Ban 改断言迁就）；Ban invent covered（含升格 blind→partial/covered·借旁证 wash·实例宣伞）；Ban live key（零 Key 面硬跑——proof 进程内先删 `MODEL_API_KEY`/`MODEL_BASE_URL` 后断言 unset·`977e0d01` 形）；Ban 触产品码/`apps/web/e2e-ui/**` 既有 spec/g6 门/run-e2e-ui.mjs/迁移/CI 配置；Ban 触批 A/B/C 与在飞三线触面（policy 双件 standing-rule additive 步进除外）；Ban 改共享 SSOT；Ban 硬造阈值（五值外新阈·首屏面·收紧/放宽就地改）；Ban 借收据宣 SLO/真机容量/HA/生产 bundle 量测/伞闭合/`verify:e2e-performance` 族复绿；Ban 浏览器并发冒充压测（c=1 串行冻结·`playwright.config.ts:14-17` 在树钉）；Ban 伪造已读/已验来源（§0 全亲证为本卷前提）；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗（本 turn 亲跑仅 docs:check/PTP proof/markers grep 本地机检）。EXEC 期：零模型（STRESS 源 hermetic+api keyless boot+零 worker drain）· 零 provider egress（actualSpendCny=null 同源）· Docker/Playwright 本地行使。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md+policy 双件·起草 turn）五类标记词（词面运行时组装·不复抄卷内防自匹配——本卷行文本零直书四词·亲跑机检回执随 EXEC 收据留痕）+行首冲突标记 grep **零命中**（起草席亲跑·口径 `i6-239-gates.proof.mjs:154-163`——沿批 C §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `closed:post_prove_dual_pass`（2026-10-27 post 落卷收官翻面·史录零字洗：`draft:awaiting_pre_exec_dual`→`executed:awaiting_post_prove_dual`（2026-10-27 EXEC 落卷）→本值·三处钉：本行 + Status 头 + 卷尾注 同值）· alone≠dual 已解（§9.3 post-prove 双审两独立复核面 BOTH PASS 会签落卷·席1 PASS+席2 PASS）· 开工三条款已兑现（①pre-exec dual r3 双审两独立外席 BOTH PASS 落卷 ②协调方 EXEC 授权随令行使 ③§0 对开工 tip 全量重 pin 履行=§9.0）→ EXEC 已落卷 + post 双审已落卷（§9.3·P2×3 随卷：P2-A attempts `.exit` 簿记/P2-B 诊断留痕建议/P2-C lint 门状态序依赖「prove 容器 build 回写 `.next/` 致 prove 后 lint 红·CI fresh clone 不受影响·后继刀补 eslint ignores `.next`/`.tmp`」）· 翻面权归协调方（随令行使）。** 停止条件（四类·命中即停手上报·Ban 就地处置）：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且结论受疑（`:146`/`:41`/`:143` 行被他刀改写 · STRESS 门/串行钉/Key 门/15s 预算源漂移 · 在飞三线并线改写 policy 双件/双表 PERF 区）→ 停·重 pin 回炉。
- **机制不满足**：EXEC 期实测与 §1 推定形不符（STRESS 门构建内联不可行使 · hermetic 源泄漏上游依赖 · 三容器 caps 不可证 · 双端 Pixel 5 面不可行使）→ 根因诊断被证伪 → 停·如实升级（**产品缺陷=EXIT1 诚实保留+backlog 登记 · Ban retry-to-green**）。
- **越界需要**：修法诉求超出 §1 恰 1 case 面（需触产品码/既有 spec/g6 门/阈值就地改/covered 翻面/共享 SSOT）→ 停·另刀或协调方裁决。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check 超算式 / web lint 超 601 且非本刀面 / 邻面 typecheck 新红）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。
- **降格/排期触发面（派单条件 4 对账）**：若 EXEC 期 production Next 本地行使实证不可行（`next build` 环境红/端口面枯竭/Docker 不可用）→ **如实登记降格形（观测值收据·零分位宣称）或红停归排期**——本卷起草期侦察结论为可行（§0.2-①·build/start 链在树工程化+历史收据在证）·EXEC 期推翻须走本条留痕。

## §9 状态

**`closed:post_prove_dual_pass`**（2026-10-27 post 落卷收官翻面·全链=draft 起草落卷→pre-exec dual r3 双审两独立外席 BOTH PASS 放行→协调方 EXEC 授权行使→§9-EXEC 落卷→**§9.3 §9-post post-prove 双审两独立复核面 BOTH PASS 会签落卷（席1 PASS+席2 PASS·P2×3 随卷）**→翻面权归协调方（随令行使）· alone≠dual 已解 · Ban self-approve 不适用=双独立会签在卷 · ⛔push ⛔force-push）。

## §9-EXEC 落卷（2026-10-27 EXEC 席·pre-exec dual r3 双 PASS 放行+协调方授权行使·断言数/门矩阵 EXIT 原值/重 pin 落点/attempts 台账如实全录）

### 9.0 立项并线与全量重 pin（§8 ③履行·届值如实采·O1=:98/:145 在飞三线登记行全量重 pin）

- **并线**：`git fetch origin` 本 turn 亲跑 **EXIT=0** · 届值 origin/main **`f82d1a2c2`**（**#157 perf3-receipts 并线点·已含 #158 rowcut/#159 webhook-neg·#160 x33/#161 webhook-fault 在飞未在 main 如实采**——派单令「届值含 #160/#161 在飞·cap 届值如实采」对届值如实承登）· merge-tree 预演=恰两 policy .mjs 双改冲突（本支 2413 vs main 承 **2416**）→ 按派单令「共享文件 additive→dual-keep」+常设预授权「cap 届值如实采·union 越限恰等步进」解决（注释 dual-keep 双留=本支 PERF-web 起草注记+main CAP-SANCTION-2416 注记并留）· **并线树终验亲跑 docs:check PTP_FILE_LIMIT:2417>2416 红**（union 实测 2417=main 届扫 2416+本支 harness/perfweb-REQUEST.md 受管 1 件并入·双亲各自合规 main 2416=cap/本支 2411≤2413）→ **CAP-SANCTION-2418 恰等步进 2416→2418**（+2 算式=REQUEST 1+EXEC 期 proof 1·tracked gate stdout 收据落 .log ∉TEXT_EXTENSIONS 非扫描面不计=起草卷「若落 text-extension 1」条件分支不触发·沿 webhook-neg/批 C 收据先形）· 四联动点 2_418/f-2418.md/:2419 恰等改 · merge 落 **`bb015be57`**（双亲 b8e62d75f+f82d1a2c2）· `pnpm install --frozen-lockfile` **EXIT=0**（4.3s）。
- **§0.0 在飞重 pin（O1）**：worktree **34 树**亲读（起草 38 史录不洗）· `line/perfweb-draft` 恰 1 命中=本席 · perf3 线=已 #157 并线收官 · webhook-neg 线=已 #159 并线收官 · **x33 @`5a560411a` cap 2_419**/**webhook-fault @`3f44c2408` cap 2_411** 两线在飞（#160/#161）零触本卷双表触面——对 §0.1 触面零新增交叠·停止条件未触发。
- **§0.1 blob 锚重 pin（merge tip `bb015be57` 亲算）**：机制源**零漂**——playwright.config `321b80e0`/run-e2e-ui `963f81aa`/events route `8023ea9e`/stream-window.spec `9be5d39a`/next.config `f44c9119`/global.d.ts `53f5c5ac`/g6 `bdaf6007`/uc001 PERF_api proof `977e0d01`/e2e-scenarios `9976f9c3`/QUEUE `a7d8959a` 逐值恰等=机制零漂（STRESS 门 `:103` 期内联/串行钉 `:14-17`/Key 门 `run-e2e-ui.mjs:53`/15s 预算双锚 spec `:29`+`:20` 亲点未漂·停止条件未触发）· 文档锚漂移如实更：矩阵 blob `28048fce`→**`31940032`**（521 行恒等·§1.0.2 **`:146` PERF_web cell 行号未漂**·`:65` 分面定义未漂）· case-matrix `c71bf78b`→**`38e4051f`**（204→208 行·§1.2 **`:41` NHP-001-PERF-web-01 行号未漂**·§1.6 伞行 `:143`→**`:147`** 漂 +4=邻线 additive 行·措辞未漂）· policy `MAX_FILES` 行 `:171`→**`:189`**（cap 注记链增长·值面已随 CAP-SANCTION-2418 联动）· runner `isolatedReceiptSources` `:93` 未漂。
- **落位钉勘误承登**：派单令 proof 落位 `apps/web/test/nhp-perf-web.proof.ts`（§1 预期名 `nhp-001-perf-web.proof.ts` 的 EXEC 亲定形）——本刀按令落位·case id=NHP-001-PERF-web-01 恒等。

### 9.1 egress 登记臂履行 + case 落码与门矩阵亲跑（EXIT 原值·stdout 留痕）

- **egress 登记臂（择臂 a=登记·沿 uc001 PERF_api 同形）**：新 proof 实际出现词名 `MODEL_API_KEY`+`MODEL_BASE_URL` × `apps/web/test/nhp-perf-web.proof.ts` · **inventory additive 2 条目 class=test-isolation（382→384）**· `provider-egress-inventory` 亲跑 **EXIT=0 · environment_references=384**（stdout 留痕 `.tmp/uc001-perf-web-gate/`）· **与 proof 同 commit 履行**（本刀单 commit 面含 proof+inventory）· proof 进程内先删两键+断言 unset（uc001 PERF_api R6 同形·boot 无关：本 proof 不含 api 进程——api 容器由 caps child 以零 `MODEL_*` env 注入=keyless boot 面成立）。
- **docker info 亲证**：**EXIT=0**（Server 29.5.2 · Ubuntu 24.04.4 · CPUs=2 · Total Memory 3.814GiB · colima 容器可用）· node:20-bookworm 镜像在场（1.59GB 零 pull）。
- **NHP-001-PERF-web-01**（`apps/web/test/nhp-perf-web.proof.ts`·`pnpm uc001:nhp-perf-web:prove`）：**EXIT=0 · 10 断言全绿（ATTEMPT_END total=10 fail=0）· attempts 6（最终形）**——五值形全过：chromium 预算面 runs=3 all-pass（**p50 208.0–212.0ms / p95 234.0–235.0ms / p99 283.0–291.0ms / max 344.0–460.0ms / error_rate 0**·阈值 p50/p95/p99 ≤15_000ms 同值三锚+0.5%·nearest-rank·timeout 10s/sample=error·warmup 10 excluded·N=100·c=1 串行）· per-sample 功能断言（唯一 80 轮窗+题面全唯一 9921–10000+终态可见）all-pass · Pixel 5 P-OBS 披露臂 **N=20**（p50 209.0ms/p95 240.0ms/p99 288.0ms/max 288.0ms/error_rate 0·**Ban 当预算判据**）· caps 三容器 PG+api+web 各 `--cpus=2 --memory=4g` HostConfig inspect 亲证（NanoCpus=2e9/Memory=4GiB ok=true×3·`_caps-evidence.json` 非自报）· Chromium 宿主驱动不封顶披露 · D-BUILD 披露（量测构建携 `__E2E_UI_STRESS__='1'` build 期内联 e2e-guard-only 源 ≠ 洁净生产 bundle·`next build` 在测量窗外 prep 段）· tracked receipt `ai-docs/delivery/receipts/nhp-001-perf-web-01/01-gate-uc001-nhp-perf-web.stdout.log` · `.tmp/uc001-perf-web-receipts/`（perf-receipt.json+_caps-evidence.json+_caps-child.source.mjs 四件套）。
- **attempts 台账（红次如实全录·Ban retry-to-green 承守·零断言谓词变）**：attempt1 **EXIT=1**（harness 形：Playwright 库态无 baseURL→`page.goto('/login')` 相对 URL invalid·全 sample 即败）→ 修复=绝对 URL 拼 `WEB_BASE` · attempt2 **EXIT=1**（66% sample `waitForURL('**/dashboard')` 挂起：内层 20s 显式超时越 10s race 界→zombie context 泄漏串扰·phase 埋点诊断承登）→ 修复=内层超时全界 ≤9s+race 超时臂强杀 context（串行零泄漏）· attempt3 **EXIT=1 中止诊断**（phase 埋点+活体 curl 双跳亲证 2-4ms 恒绿·api log 亲证 `POST /auth/signup` **429**=auth.service.ts:46 在树防滥用桶）· attempt4 **EXIT=1**（`RL_SIGNUP_IP=1000,100` 在树覆写口（auth.service.ts:11 自述「仅 perf/E2E 启动档放宽并显式落档」）修 ip 桶后·run1 全绿·run2/3 残 2/4 次 stray=硬编码全局桶 `signup:global` (60,1/s) 泊松亏空）→ 修复=signup prep 准入节律 1.05s（≤1/s refill·测量窗外·五参冻结不动）+撞桶 ≤2 有界重试（同 email·per-email 桶 (3,0.02) 容许）· attempt5 **EXIT=0 门绿但收据错登**（Pixel 臂误跑 N=100 对登记 N=20 不符·如实承登）→ 修复=Pixel 臂恰 N=20 重登记（warmup 0）· **attempt6=最终形 EXIT=0**（本收据）· 邻面 attempt 红零次。
- **门矩阵（§2-4 逐项）**：`pnpm -C apps/web typecheck` **EXIT=0**（含新 proof）· web lint **605=cap 恰等 EXIT=0**（0 errors·基线 601 恰等+4=新 proof naming-convention `N` 字面四 warn（uc001 PERF_api 五值形同源）→ **601→605 恰等步进 sanction 随令**（常设预授权「cap/lint 以合并树实测为准恰等步进免再询」·Ban 就地放宽未触=恰等非放宽））· root lint **5362=cap 恰等 EXIT=0**（基线 5358 stash 对照亲证恰等+4 同源→**5358→5362 恰等步进**·runner 亲测 0 warning）· `pnpm turbo typecheck` **8/8 EXIT=0** · `check-docs` **EXIT=0 scanned 2417 ≤ 2418**（步进后）· `public-text-policy.proof.mjs` **EXIT=0 12/12** · provider-egress-inventory **EXIT=0 384** · markers 五类标记词+行首冲突标记 grep 改动集（运行时组装口径 `i6-239-gates.proof.mjs:154-163` 承形·零字面复抄）**零命中** · **runner 五位全登记**（位1 `isolatedReceiptSources`（receipt 源 9 件·`[id]` 括号路径出列=local-e2e-receipt 正则 `A-Za-z0-9._/-` 亲证不收·attempt1 红承登）/位2 supported targets/位3 isolatedCommand=`UC001_PERF_WEB_CAPS_CHILD` 三容器内联 child/位4 pre-migrate 名单/位5 resource-caps 条件）· 双 package.json 注册（root `uc001:nhp-perf-web:prove`+`:prove:raw` 两行·apps/web `prove:nhp-perf-web` 一行）。
- **邻面登记（§2-4 邻面安全基）**：e2e:ui 族（golden/recruiting/uc003/uc018/voice/screenshots）**key-gated out-of-window 如实登记**（本 EXEC 窗零 MODEL_API_KEY·`run-e2e-ui.mjs:53` fail-closed `live_provider_key_missing`·`g6:93` 行为门钉死——非静默跳过·keyless 成立形=本 proof 专用自启栈非共享门）· 邻面安全基=`apps/*/src`/`packages/*/src`/`apps/web/e2e-ui/**` **零 diff 亲证**+typecheck/lint 绿 · attempt6 后零栈残留（api/web 容器 rm -f 亲证·PG runner finally 自拆）。
- **est live=0**（全程零模型零外呼零 Key 加载：STRESS 源 hermetic web 层合成·api keyless boot·零 worker drain·actualSpendCny=null）· pins 十一值零翻转（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · **coveredCount=8** · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null）。

### 9.2 双表同步（§1.0.3 令）+ 范围外核 + post 输入

- 覆盖矩阵 §1.0.2 `:146` **PERF_web cell additive 注记**（格值 `blind`/`case-only` 措辞保留·收据入账·LOAD_w cell 零动）· case-matrix §1.2 `:41` **NHP-001-PERF-web-01 行收据锚 additive 注记**（case-only/blind 保留·`pnpm uc001:nhp-perf-web:prove` 锚+收据路径）· case-matrix §1.6 `:147` **NHP-PERF-WEB-SUITE 伞行零翻**（`case-only`/`not_run` 保持·per-UC 实例≠伞·Ban 借本收据宣伞闭合）· coveredCount=8 零翻转 · **EXIT0=case≠covered**。
- 范围外核：`apps/*/src`/`packages/*/src`/`apps/web/e2e-ui/**` 既有 spec 零 diff 亲证 · 批 A/B/C 与已并线触面只读零触 · g6 行为门/`run-e2e-ui.mjs`/迁移/CI 配置零触 · 共享 SSOT 零改 · 零 .env 零 Key 值入树入据 · 零依赖升级 · 阈值就位（15_000ms 三值同阈·未收紧未放宽·首屏/交互预算面未取=§1.3 维持）· ⛔push。
- **post 输入**：§9-EXEC 门矩阵全绿在卷（三处钉 **`executed:awaiting_post_prove_dual`**·待 post-prove 双审两独立外席·alone≠dual）→ 双 PASS 会签 → 三处钉（Status 头+§8+卷尾注）翻终态 `closed:post_prove_dual_pass`；stdout 全痕目录 `.tmp/uc001-perf-web-gate/`（六 attempt gate stdout+.exit+phase 诊断）+`.tmp/uc001-perf-web-receipts/`（四件套 fresh 收据·gitignored 本地证据）+`.tmp/isolated-proof-receipts/`（runner receipt）。

### 9.3 §9-post post-prove 双审双 PASS 会签（2026-10-27 并线席 post 落卷·两独立复核面 BOTH PASS·P2×3 随卷登记）

**席1 复核面（定性亲读+机证抽验）——PASS**：
- **红五次定性亲读·六尝试日志全卷**（`.tmp/uc001-perf-web-gate/gate-attempt1..6.stdout.log` 六卷逐一全文 Read）：a1 **EXIT=1**（`page.goto("/login")` 相对 URL `Cannot navigate to invalid URL` 全 sample 即败·与台账 a1 恰等）· a2 **EXIT=1**（`sample_timeout_10s` 散布+`browser.newContext: Target page, context or browser has been closed` zombie context crash·与 a2 恰等）· a3 **EXIT=1 中止诊断**（phase 埋点 `phases={"gotoLogin":98,"fill":41,"clickSignup":32}`+waitForURL 9000ms 挂·crash 路径·与 a3 恰等）· a4 **EXIT=1 total=10 fail=3**（stray 429 桶·与 a4 红定性恰等·计数勘误见下）· a5 **EXIT=0 但错登**（`PERF_OBS surface=pixel5-P-OBS N=100` 对登记 N=20 不符·断言行文案 N=20 与实测 N=100 同卷并存·如实承登与 a5 恰等）· a6 **EXIT=0 total=10 fail=0**（最终形·与收据五值恰等 p50 208/210/212·p95 235/234/234·p99 291/283/283·max 460/403/344ms）。**零断言谓词变亲证**：六卷 `ATTEMPT_START` 行逐字恒等（`负载参数冻结 N=100 c=1 warmup=10 runs=3 pixel5-P-OBS N=20`×6）· 五次修复皆 harness 形（绝对 URL/内层超时界/中止诊断/准入节律/N 复位）非阈值动。
- **五参冻结零阈值动核亲证**：proof 源常量冻结亲读——`PERF={N:100,c:1,p50:15_000,p95:15_000,p99:15_000,errMax:0.005}`+`SAMPLE_TIMEOUT_MS=10_000`+`WARMUP=10`+`REPEAT_RUNS=3`+`PIXEL_OBS_N=20`；15_000 三值同阈值源=`stream-window.spec.ts:29`+第二锚 `:20` 双锚在树恒等·六尝试+post 轮间零 retune 零阈值位移。
- **十断言逐一对上**：3 ISO（model-key-unset-in-process/PERF_WEB_WEB_BASE present/caps enforced）+7 PERF（Pixel 5 P-OBS 功能/3 runs p50/3 runs p95/3 runs p99/3 runs error_rate/五值收据齐/per-sample 功能 all-pass）逐一对应 proof `A()` 调用面与 a6/post 卷 PASS 行·total=10 fail=0 恰等。
- **八 blob 恰等**：HEAD `cad25d5b8` `git rev-parse` 亲算——playwright.config `321b80e0`/run-e2e-ui `963f81aa`/events route `8023ea9e`/stream-window.spec `9be5d39a`/next.config `f44c9119`/global.d.ts `53f5c5ac`/g6 `bdaf6007`/uc001 PERF_api proof `977e0d01` 八值与 §9.0 重 pin 恰等=机制零漂；行锚亲点未漂（spec `:29`/`:20` 15_000 双锚·config `:17` `workers: 1` 串行钉·route `:103` STRESS 构建期内联门·run-e2e-ui `:53` Key fail-closed 门）。
- **门矩阵抽验复跑**：`check-docs` **EXIT=0 scanned 2418=cap 恰等**·`public-text-policy.proof` **EXIT=0 12/12**·markers 五类+行首冲突标记对改动集 12 tracked grep **零命中**·`pnpm -C apps/web lint` **605=cap 恰等 EXIT=0**（0 errors·清 `.next` 前置·P2-C 联动）。
- **P2×2（席1 发现·随卷登记）**：**P2-A attempts `.exit` 簿记**——attempt2/3（crash/中止路径）无 `gate-attemptN.exit` 落盘（六卷仅 1/4/5/6 有·crash 路径 `ELIFECYCLE Command failed.`/exit 143 先于 `.exit` 写出）·建议后继刀 runner 对 crash/中止臂同写 `.exit`（本 post 轮 `gate-post-seat2.exit` 已按全簿记形补齐先例）；**P2-B 诊断留痕建议**——a3 中止诊断能闭环系 phase 埋点+probe 在位（`phase-probe.mjs` 仅存 gitignored `.tmp` 面·随卷即失）·建议后继 perf 刀将 phase 级埋点（error detail 携 `phases`）与诊断 stdout 留痕列为固定交付面（最终 proof 已携 `phases` 字段=先形在证）。
- **席1 勘误随卷（P3 如实·史录不洗）**：§9.1 a4 行「run2/3 残 2/4 次 stray」对卷勘误=chromium run2=2/run3=5+pixel5-P-OBS run=1×2（`PERF_ERROR_DETAIL` 计 9 条·fail=3 断言数恰等·红定性不变）。

**席2 复核面（独立行使复现+活体复核）——PASS**：
- **独立复跑 10/10 同带复现**：`pnpm uc001:nhp-perf-web:prove` 独立行使落 `gate-post-seat2.stdout.log`+`.exit`——**EXIT=0 ATTEMPT_END total=10 fail=0**（12:50:57–12:58:01Z·424.7s·runner receipt `2026-10-27T12-58-01-755Z-41093-…json` outcome=passed exitCode=0·sourceDigests 九件 sha256 锁面）· chromium 三 runs **p50 182.0/183.0/184.0ms·p95 213.0/215.0/213.0ms·p99 247.0/250.0/242.0ms·max 299.0/325.0/319.0ms·error_rate 0·timeout 0 passed=true×3**· Pixel 5 P-OBS N=20（p50 185.0/p95 206.0/p99 213.0/max 213.0ms·error_rate 0）——对登记收据带（p50 208.0–212.0/p95 234.0–235.0/p99 283.0–291.0/max 344.0–460.0ms）**同带复现**（同亚秒量级·远低于 15_000ms 三值阈·读法钉计分域内 p99 恒 ≤10s 不变）。
- **活体 docker inspect 三容器独立复核**：复跑在飞窗口 `docker ps`+`docker inspect` 亲证三容器 `State.Running=true`——`meetwise-e2e-41093-1793105457085`/`meetwise-uc001-perf-web-api-41368-1793105461346`/`meetwise-uc001-perf-web-41368-1793105461346` **HostConfig NanoCpus=2000000000/Memory=4294967296 ×3 恰等**（与 `_caps-evidence.json` 同名同值互证·非自报）· api 容器 env **`MODEL_*` 计数=0（keyless 活体亲证）**+`RL_SIGNUP_IP=1000,100`（perf/E2E 启动档覆写口在登）· `docker info` Server 29.5.2/CPUs=2/Mem=4095574016· run 终三容器自拆亲证（`docker ps` 残留=0）。
- **chromium 串行行使真实嘴数核对**：c=1 串行 3×(100 计分+10 warmup)+pixel5 P-OBS 20=**350 次真实页面行使零 error 零 timeout**（post 卷 `PERF_ERROR_DETAIL` 零行=嘴嘴过·六历史卷错误行均为 a1–a4 红次如实留痕）· 逐 sample 功能断言（唯一 80 轮窗 9921–10000+题面全唯一+终态可见）×300 计分样本全过· 时长对账：signup prep 节律 1.05s×330≈346.5s 下界与 receipt 424.7s 相容（节律窗与测量窗重叠符合实现）· 邮箱逐虚拟用户唯一（`nhp001pw_<S>_r<run>u<i>@perf-web.test`）。
- **P2-C lint 门状态序依赖（席1/席2 共同发现·随卷登记）**：`apps/web/.next/`（509MB·prove web 容器 build 回写宿主·gitignored）在场时 `pnpm -C apps/web lint` **红 2917 warnings EXIT=1**（0 errors·生成物 naming-convention 面）· `rm -rf apps/web/.next` 后复跑 **605=cap 恰等 EXIT=0**——**状态序依赖非交付面红**：prove 后行使 lint 门必须先清 `.next/`（CI fresh clone 无 `.next` 不受影响·uc003x 线 e10e1b673「lint .next 清场前置实测 2913→601 恰等」同象互证）· 本卷后继并线终验五门履行「lint 前清 `.next`/`.tmp` 生成物」· **后继刀建议 eslint ignores 补 `apps/web/.next`+`.tmp`**（本卷 Ban 就地改 lint 配置不触·留后刀）。

**会签**：席1 **PASS** + 席2 **PASS** = **post-prove 双审双 PASS 落卷**（红五次定性亲读+独立复现+活体 caps 三重互证·alone≠dual 已解）· 附记如实：EXEC 落卷后 20:16–20:22Z 本地另有一轮 exitCode=0 复跑留痕（runner receipt `…25720-…json`·`perf-receipt.json`/`_caps-evidence.json` 曾被该轮覆写·非本会签 formal 轮）·本会签 formal 轮=gate-post-seat2（41093/41368 容器名与活体 inspect 互证）· est live=0 零模型零外呼维持· pins 十一值零翻· coveredCount=8 零动· EXIT0=case≠covered · 史录不洗。

---

---

*PERFWEB REQUEST · 2026-10-26 起草 · 2026-10-27 EXEC 落卷 · 2026-10-27 §9-post post-prove 双审双 PASS 会签落卷 · **STOP=`closed:post_prove_dual_pass`**（2026-10-27 post 落卷收官三处翻面·史录零字洗：`draft:awaiting_pre_exec_dual`→`executed:awaiting_post_prove_dual`（2026-10-27 EXEC 三处翻面）→本值·三处钉：Status 行+§8+本行 同值·会签在卷 §9.3·席1 PASS+席2 PASS·alone≠dual 已解）· 剩余队列 Phase2 #12 one-knife-one-row · 派单序第 9 项 R1/R42 合刀 · 覆盖矩阵 §1.0.2 `:146` UC-E2E-001 PERF_web cell（blind/case-only）+ case-matrix `:41` NHP-001-PERF-web-01 + §1.6 `:143` NHP-PERF-WEB-SUITE 伞行（零翻）· 修法=恰 1 具名 case 执行收据（`NHP-001-PERF-web-01`·批 C PERF-api Row 3 同构）· 证据层=隔离真 PG+api keyless+web production build/start（`E2E_UI_STRESS='1'` 期内联·D-BUILD 披露）+Playwright headless·caps 三容器 2cpu/4GiB+Chromium 宿主不封顶披露 · 负载形状=N=100·c=1 串行（config `:14-17` 在树钉）·runs=3·warmup 10·nearest-rank·chromium 预算面+Pixel 5 P-OBS 披露臂 N=20 · 五值形 web 定标=p50/p95/p99 ≤15_000ms（值源 `stream-window.spec.ts:29` 在树 15s broad ceiling）+max 观测披露+error_rate ≤0.5%·Ban 硬造 Ban 读作 SLO/真机容量 · keyless 定标=`pnpm e2e:ui` 门 Key-gated（`run-e2e-ui.mjs:53`+`g6:93` 钉）不可行·成立形=专用 proof 自启栈（零模型零 worker·`E2E_UI_SKIP_WORKER` 先例）· production Next 本地行使=可行不降格 · 派单「22 tests」fresh 勘误=15 声明/30 planned/20 净执行（§0.2-④·`--grep-invert` 剔除=0 零交集勘误）· cap 预算=起草期 2410 恰等零余量 → 起草随刀先手步进 **2410→2413**（史录）→ EXEC 立项并线届值如实采：origin/main `f82d1a2c2` 承 **2416**（#157/#158/#159 已并）·union 实测 2417 红→**CAP-SANCTION-2418 恰等步进 2416→2418**（四联动点 2_418/f-2418.md/:2419 联动·merge `bb015be57`·EXEC 收据 .log 非扫描面不计）· **EXEC 在飞三线登记行全量重 pin（O1 履行）**：perf3=已 #157 并线收官·webhook-neg=已 #159 并线收官·x33=2419 @`5a560411a`·webhook-fault=2411 @`3f44c2408`（#160/#161 在飞未在 main 如实采）· worktree 34 树 · **EXEC 门矩阵全绿在卷 §9-EXEC**：`pnpm uc001:nhp-perf-web:prove` **EXIT=0 · 10 断言**（attempts 6,0·红五次 harness 形如实承登·零断言谓词变）· N=100 c=1 串行 runs=3 all-pass（p50 208.0–212.0ms/p95 234.0–235.0ms/p99 283.0–291.0ms/error_rate 0·15_000ms 阈·读法钉计分域内 p99 恒 ≤10s）· Pixel 5 P-OBS N=20 披露（Ban 当预算判据）· caps 三容器 2cpu/4GiB HostConfig ok=true×3 · egress 登记臂 a=inventory additive 382→384 class=test-isolation 与 proof 同 commit · lint 双帽恰等步进 601→605/5358→5362（0 errors）· docker info EXIT=0 · turbo typecheck 8/8 EXIT=0 · 首屏/交互预算面=无在树源不取（§1.3）· 双表同步令沿 §1.0.3 `:166` · base=`origin/main` `9c31c0ccc` · 分支 `line/perfweb-draft` · 工作树 `meetwise-perfweb` · est live=0 · markers=0 · pins 十一值零翻 · coveredCount=8 不变 · EXIT0=case≠covered · releaseEvidence=false · ≠HA · **§9-post=双审双 PASS 会签（席1 六尝试日志全卷定性亲读+五参冻结零阈值动+十断言逐对+八 blob 恰等+门矩阵抽验复跑·P2-A attempts `.exit` 簿记/P2-B 诊断留痕建议 · 席2 独立复跑 10/10 同带复现+活体 docker inspect 三容器 NanoCpus/Memory ×3 恰等+chromium 串行 350 嘴零误+lint 状态序 P2-C「prove 后 lint 门先清 `.next`/`.tmp` 生成物·CI fresh clone 不受影响·后继刀补 eslint ignores」）** · ⛔push*

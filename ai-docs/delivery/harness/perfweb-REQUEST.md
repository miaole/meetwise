# PERFWEB REQUEST — NHP-001-PERF-web-01 执行收据起草卷·覆盖矩阵 §1.0.2 `:146` UC-E2E-001 PERF_web cell + case-matrix `:41` 具名行 + §1.6 `:143` NHP-PERF-WEB-SUITE 伞行处置（docs-only REQUEST 卷·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`** · **STOP=draft（三处钉：本 Status 行 + §8 + 卷尾注 · alone≠dual · pre-exec 双审两独立外席 BOTH PASS + 协调方 EXEC 授权前零动工）** · 本卷 docs-only 起草：恰 1 新 .md + cap 随刀步进双件（`public-text-policy.mjs`/`public-text-policy.proof.mjs` 越限臂联动）· 零产品码触 · 零 prove 零实跑模型 · 不预 claim 任何 covered 升格（EXIT0=case≠covered · coveredCount=8 零动 · blind/case-only 措辞保留）。

**席位**：NHP-001-PERF-web 起草席（诊断+起草双责·协调方派·派单标识「总盘派单序第 9 项 R1/R42 合刀」系派单令 token·非在树 SSOT 行名如实登记·认领=UC-001 PERF_web 分面 + case-matrix `:41` NHP-001-PERF-web-01 执行·与批 A/B/C 及各 UC 专属线互斥不重叠）。
**基线**：`origin/main` @ **`9c31c0ccc`**（full `9c31c0ccce2c5b7a82f80fa7dca332087491ad89` · `git fetch origin` 本 turn 成功 · #156 pay-neg 并线点 · 分支 `line/perfweb-draft` 建 worktree `git worktree add ../meetwise-perfweb -b line/perfweb-draft origin/main` 亲立 · HEAD 落 tip 亲证）· `node scripts/ai-docs/check-docs.mjs` 本树亲跑 **EXIT=0 · scanned 2410 = cap 2410 恰等零余量**（`public-text-policy.mjs:171` `MAX_FILES = 2_410` 亲证 · §2-1 预算核 → 本卷随刀步进）· 工作树 `meetwise-perfweb`（仓根同级）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md`（Phase2 #12 `:28`）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§0.5 `:57-65` 强制列+PERF_web 分面定义 / §1.0.2 `:146` / §1.0.3 `:166` 双表同步令）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（`:41` NHP-001-PERF-web-01 / `:142-144` §1.6 总册）→ `ai-docs/requirements/use-cases/e2e-scenarios.md`（UC-001 `:48`）→ 涉事机制源 `apps/web/playwright.config.ts` / `scripts/run-e2e-ui.mjs` / `apps/web/app/api/interview/[id]/events/route.ts` / `apps/web/e2e-ui/stream-window.spec.ts` / `apps/web/next.config.mjs` / `apps/web/global.d.ts` / `scripts/g6-e2e-iso-blocked.proof.mjs` → PERF 收据形先例 `apps/api/test/uc-e2e-001-nhp-perf-api.proof.ts`（五值/nearest-rank/runs=3/caps·批 C Row 3 执行在证）+ `apps/api/test/uc-e2e-018-perf-load.proof.ts`（零触只读）。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①`REMAINING-NORTH-STAR-QUEUE.md` Phase2 **#12「remaining NHP rows one-knife-one-row · highly parallel」**（`:28` 亲证·批 A/B/C 同源）；②`e2e-requirement-coverage-matrix.md` §0.5 强制列令（PERF_web 分面「不得单列 n/a 偷关」`:65`）+ §1.0.3 `:166` 双表同步令；③协调方派单（PERF-web 起草·docs-only 授权·R1/R42 合刀标识随令）；④结构范本=`harness/nhp-batch-c-REQUEST.md`（§0-§8 形制·其 §1 case 3/§9-EXEC Row 3=NHP-001-PERF-api-01 执行收据同构先例）。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse 亲算 @`9c31c0ccc`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 本 turn **38 树**实测——`line/perfweb-draft` 恰 1 命中=本席；`ls ai-docs/delivery/harness/ | grep perfweb` 落卷前**零命中** → 落卷后唯一同名卷=本卷。
- **在飞三线逐 tip 亲读**（对本案触面 `scripts/ai-docs/public-text-policy.mjs`+`public-text-policy.proof.mjs`+双表 PERF 区）：
  - `line/perf3-receipts` @`1fb9acbf8`（worktree 在飞 2026-10-27）——PERF_api 三收据卷（uc011/017/019）·已 merge 本 base `9c31c0ccc`·cap 步进 **2410→2413**（+3 本支三 proof）·触双表 `:61/:62` PERF_api 行+§1.0.2 `:148` 区——与本卷触面（`:146` PERF_web cell+case-matrix `:41`）**行级互斥**·policy 双件交涉面=并线 union 届时按 standing rule 重测。
  - `line/x33-adv-draft` @`704505167`（worktree 在飞）——x33-adv-REQUEST 起草卷·cap 先手步进 **→2_417**（先手步进形=本卷随刀步进同先例）·零触双表矩阵文件。
  - `line/webhook-neg-draft` @`69997bd42`（worktree 在飞）——webhook-neg-REQUEST 起草卷·merge 本 base 后 tip cap=**2_410**·零触双表矩阵文件。
- 其余 `line/*` 无 worktree 分支对 policy 双件的提交均系历史并入链（`git log --not origin/main` 逐支核过·在飞零交涉）。
- **在飞交叠复核规则（EXEC 立项日必做）**：本卷起草 turn 触面=恰 3 tracked（本卷 .md+policy 双件）；EXEC 期触面=§2-4 登记清单。届时对在飞分支 `git log -1 -- <触面文件>` 逐树复核，任一分支顶对触面存在 `9c31c0ccc` 之后新增提交且与本卷同区 → 触停止条件「现场漂移」停手上报。

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

**④ 派单数「22 tests」亲点勘误（如实登记）**：fresh 树 `apps/web/e2e-ui/` 8 spec 文件 **15 个 `test()` 声明**（golden 2 + online-public 2 + recruiting-bound 1 + screenshots 2 + stream-window 3 + uc003 1 + uc018 1 + voice-duplex 3）·双 project 配置 ×2=30 planned；默认门净执行=16（golden 2+recruiting 1+stream 3+uc003 1+uc018 1=8×2 project）·key/URL 门 skip=10（online-public 2+voice 3×2·`test.skip` 亲读）·runner `--grep-invert` 剔 screenshots=4（`:292`）。派单「22」对本 base 不可复现·以 fresh 亲点为准（本卷 §0.1 行锚为准）·预算面承载 spec=stream-window.spec.ts（3 声明）如实登记。

### 0.3 认领登记（行号+cell+现值·亲读逐字）

| 位置 | cell/行 | 现值（亲读） | 本刀补 |
|---|---|---|---|
| 矩阵 §1.0.2 **`:146`** | UC-E2E-001 **PERF_web** | **blind / case-only**（「PERF_web/LOAD_worker 保持 blind/case-only 留后刀」·PERF_api 格已带批 C 执行收据） | **执行收据**（具名 case=`NHP-001-PERF-web-01`·格值措辞 case-only 保留+收据入账） |
| case-matrix **`:41`** | NHP-001-PERF-web-01 | **case-only / blind**（「收据可复核；≠ 真机容量」·锚=e2e:ui 历史 not_run） | 执行收据锚（`pnpm uc001:nhp-perf-web:prove` · 收据路径 · 措辞 case-only 保留） |
| case-matrix §1.6 **`:143`** | NHP-PERF-WEB-SUITE（伞） | case-only / not_run（「单机 ≠ 真机容量」） | 零翻——per-UC 实例≠伞（Ban 借本收据宣伞闭合·沿批 C `:40` 同法） |

---

## §1 修法（一行一 case · `NHP-001-PERF-web-01` 执行收据 · 零产品码触 · 零 invent covered · 零 live key · 零模型）

**修法形状**（沿批 C Row 3 `uc001:nhp-perf-api` 同构）：新 proof 文件（预期落位 `apps/web/test/nhp-001-perf-web.proof.ts` 或 `apps/api/test/` 隔离系内·EXEC 按 runner 注册位归属亲定）+ root `package.json` `prove`/`prove:raw` 双行 + runner 五位登记（`scripts/run-e2e-isolated.mjs`：SOURCE_PATHS/allowlist/isolatedCommand/pre-migrate 名单/resource-caps 条件——**五位全登记**·批 A 第四位+批 C 第五位教训承登）+ egress 环境引用登记（`provider-egress-inventory.json` additive·新 proof×实际出现词名·class=test-isolation·`10b920521` 先例形·漏登即 CI `environment_reference_unregistered` 红）+ 双表行内改（矩阵 `:146` PERF_web 格+case-matrix `:41` 收据锚）· **prove-only · `apps/*/src`/`packages/*/src`/`apps/web/e2e-ui/**` 零 diff 意向**；isolated 真 PG · 零 MODEL_API_KEY（进程内先删+断言 unset）· 零外呼 · 零 worker drain；收据 `.tmp/<case>-receipts/` + tracked `ai-docs/delivery/receipts/<case>/`（implementer pre-commit runs · **not evidence of record**）。行状态/格值一字不动：EXIT0=case≠covered，coveredCount=8 不变。

**证据层**：隔离真 PG + 自启三进程栈（api keyless + web production build/start + Playwright headless chromium）· caps=**三容器 Docker `--cpus=2 --memory=4g`**（PG+api+web · NanoCpus=2e9/Memory=4GiB HostConfig inspect 亲证入收据·沿 uc001 双容器形+web 第三容器同值）· **Chromium 宿主进程不封顶如实披露**（单机 headless 单实例 · workers=1 串行 · `:143`「单机 ≠ 真机容量」禁令保留）。

**负载形状（登记冻结）**：登录主链嘴真 signup prep（逐虚拟用户唯一邮箱·测量窗外·不计分位）→ N=**100** · **c=1 串行**（`playwright.config.ts:14-17` 在树明钉浏览器并发冒充压测之禁——串行非降格·登记为 web 面口径·API 侧并发已由 PERF_api 收据另证）· **runs=3 all-must-pass** · warmup 10 excluded · nearest-rank · timeout 10s/sample=error。per-sample 主体=`/interview/__e2e_stream_stress__?duplicateFrames=1` 10k 精确重投全管线（goto→终态可见 elapsed）。双端：chromium project=**预算承载面**；Pixel 5（mobile project）=**P-OBS 披露臂 N=20**（功能断言+五值观测值入收据·**Ban 当预算判据**·防 runtime 膨胀的登记限幅）。

**期望（五值形 · web 实情定标 · 值源在树亲证·Ban 硬造）**：p50 ≤ **15_000ms** · p95 ≤ **15_000ms** · p99 ≤ **15_000ms**（值源=`stream-window.spec.ts:29` 在树唯一 web 面延迟预算——同主体 per-test 15s deliberate broad ceiling·逐字承其「catches a regression to per-event O(n²) work without pretending to be a device or production SLO」读法）· max=观测值披露（不设阈·`977e0d01` 形）· error_rate ≤ **0.5%**（uc018/uc001 同口径）· 全 sample 功能断言（唯一 80 轮窗+题面全唯一+终态可见）all-pass。**读法钉**：本收据=回归守卫预算（O(n²) 退化捕获）**≠ 线上 SLO ≠ 真机容量 ≠ HA ≠ 生产 bundle 量测**（D-BUILD 披露随收据）；阈值收紧=后刀校准卷出域（本卷 Ban 就地收紧 Ban 就地放阈）。

**收据四件套**：CMD+EXIT+负载参数冻结（N/c/runs/warmup/双端/caps/构建旗）+ `.tmp`/tracked 路径（沿批 C Row 3 同形）。

---

## §1.3 否决表（落选面诚实留痕·含停止条件登记）

| 落选项 | 否决/登记理由 |
|---|---|
| 矩阵 `:65` 分面定义「首屏/交互预算」 | **码面无在树预算源无在树断言**（全树 grep 亲证零 web 首屏阈值）→ 本刀不取·Ban 硬造阈 · 留后刀独立裁量。 |
| case-matrix `:42` NHP-001-LOAD-w-01（worker 队列积压） | LOAD_worker 面 ≠ PERF_web 面 · 一行一 case 防多面同刀 wash · 留后刀。 |
| `:147` UC-002/010 三分面 | 跨副本压测未证 · live worker 面 · 本刀零触。 |
| `pnpm e2e:ui` 全门作 EXEC 车 | **keyless 不可行**（`run-e2e-ui.mjs:53` Key 门+`g6:93` 行为门钉死）· 且全门 16 执行含与本刀无关面 → 专用 proof 自启栈取代（§0.2-①）。 |
| `performance:e2e` / `run-performance-e2e.mjs`（`:405`） | API/worker 面·无 web 无浏览器（g6 `:107` 无 Key 门正因无 web 面）→ 非本刀车·旁证零借。 |
| `verify:e2e-performance` 族（`:407`·矩阵历史门族 not_run） | 历史门族台账·非单行 case；本 case=per-UC 实例 · **Ban 借实例宣族复绿**（批 C `:153` 同法）。 |
| NHP-PERF-API-SUITE（`:142`）/ NHP-PERF-WEB-SUITE（`:143`）闭合宣称 | 伞行零翻 · per-UC 实例≠伞 · coveredCount=8 不变。 |

---

## §2 验收门矩阵（pre-exec 双审核对单基面 · 起草门 1-3 本 commit 适用 + EXEC 预基面届时重 pin · **数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **docs:check（红停条款）+ cap 预算核（亲算）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 · 本树起草前亲跑 **EXIT=0 · scanned 2410**（stdout「public text policy scanned 2410 managed worktree files」亲读）· cap=**2410**（`public-text-policy.mjs:171` 亲证）= **恰等零余量** → 本卷 +1 必超 → **随刀先手步进 cap 2410→2413**（+3 算式：本卷 REQUEST 1 + EXEC 期 proof 1 + EXEC 期 tracked receipt 若落 text-extension 1 · `x33-adv-draft` 先手步进先形+killsw 算式先形·协调方常设预授权「cap/lint 以合并树实测为准恰等步进免再询」承登）+ `public-text-policy.proof.mjs` 四联动点恰等联动（2_413/`f-2413.md`/`PTP_FILE_LIMIT:2414`）· 本树步进后亲跑 proof **12/12 EXIT=0** · 步进后 docs:check 预期 scanned 2411 ≤ 2413。在飞三线（perf3=2413/x33=2417/webhook=2410）并线 union 届时按 standing rule 重测重步（§0.0）。若 EXEC 期 tracked 受管件超算式 → 恰等再步随 standing rule·Ban 就地改 cap 超算式值。
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

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · 开工三条款（①pre-exec 双审两独立外席 BOTH PASS 落卷 ②协调方明示 EXEC 授权 ③届时 §0 对开工 tip 全量重 pin·§1 修法面/§5 Ban/pins/§1.3 否决面零改动）未兑现前零动工。** 停止条件（四类·命中即停手上报·Ban 就地处置）：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且结论受疑（`:146`/`:41`/`:143` 行被他刀改写 · STRESS 门/串行钉/Key 门/15s 预算源漂移 · 在飞三线并线改写 policy 双件/双表 PERF 区）→ 停·重 pin 回炉。
- **机制不满足**：EXEC 期实测与 §1 推定形不符（STRESS 门构建内联不可行使 · hermetic 源泄漏上游依赖 · 三容器 caps 不可证 · 双端 Pixel 5 面不可行使）→ 根因诊断被证伪 → 停·如实升级（**产品缺陷=EXIT1 诚实保留+backlog 登记 · Ban retry-to-green**）。
- **越界需要**：修法诉求超出 §1 恰 1 case 面（需触产品码/既有 spec/g6 门/阈值就地改/covered 翻面/共享 SSOT）→ 停·另刀或协调方裁决。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check 超算式 / web lint 超 601 且非本刀面 / 邻面 typecheck 新红）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。
- **降格/排期触发面（派单条件 4 对账）**：若 EXEC 期 production Next 本地行使实证不可行（`next build` 环境红/端口面枯竭/Docker 不可用）→ **如实登记降格形（观测值收据·零分位宣称）或红停归排期**——本卷起草期侦察结论为可行（§0.2-①·build/start 链在树工程化+历史收据在证）·EXEC 期推翻须走本条留痕。

## §9 状态

**`draft:awaiting_pre_exec_dual`**（起草落卷即停 · pre-exec 双审两独立外席+协调方 EXEC 授权前零动工 · 翻面权归协调方 · alone≠dual · Ban self-approve · ⛔push ⛔force-push）。

---

*PERFWEB REQUEST · 2026-10-26 起草 · **STOP=`draft:awaiting_pre_exec_dual`**（三处钉：Status 行+§8+本行 · 起草落卷即停）· 剩余队列 Phase2 #12 one-knife-one-row · 派单序第 9 项 R1/R42 合刀 · 覆盖矩阵 §1.0.2 `:146` UC-E2E-001 PERF_web cell（blind/case-only）+ case-matrix `:41` NHP-001-PERF-web-01 + §1.6 `:143` NHP-PERF-WEB-SUITE 伞行（零翻）· 修法=恰 1 具名 case 执行收据（`NHP-001-PERF-web-01`·批 C PERF-api Row 3 同构）· 证据层=隔离真 PG+api keyless+web production build/start（`E2E_UI_STRESS='1'` 期内联·D-BUILD 披露）+Playwright headless·caps 三容器 2cpu/4GiB+Chromium 宿主不封顶披露 · 负载形状=N=100·c=1 串行（config `:14-17` 在树钉）·runs=3·warmup 10·nearest-rank·chromium 预算面+Pixel 5 P-OBS 披露臂 N=20 · 五值形 web 定标=p50/p95/p99 ≤15_000ms（值源 `stream-window.spec.ts:29` 在树 15s broad ceiling）+max 观测披露+error_rate ≤0.5%·Ban 硬造 Ban 读作 SLO/真机容量 · keyless 定标=`pnpm e2e:ui` 门 Key-gated（`run-e2e-ui.mjs:53`+`g6:93` 钉）不可行·成立形=专用 proof 自启栈（零模型零 worker·`E2E_UI_SKIP_WORKER` 先例）· production Next 本地行使=可行不降格 · 派单「22 tests」fresh 勘误=15 声明/30 planned/16 净执行（§0.2-④）· cap 预算=2410 恰等零余量 → 随刀先手步进 **2410→2413**（四联动点联动·在飞三线 2413/2417/2410 登记·union 届时重测）· 首屏/交互预算面=无在树源不取（§1.3）· 双表同步令沿 §1.0.3 `:166` · base=`origin/main` `9c31c0ccc` · 分支 `line/perfweb-draft` · 工作树 `meetwise-perfweb` · est live=0 · markers=0 · pins 十一值零翻 · coveredCount=8 不变 · EXIT0=case≠covered · releaseEvidence=false · ≠HA · ⛔push*

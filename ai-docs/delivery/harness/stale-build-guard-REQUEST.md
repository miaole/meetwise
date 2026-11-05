# STALE-BUILD-GUARD REQUEST（UI runner 误复用无压测源生产构建假红修复·STALE_BUILD_GUARD 增「压测意图判」·起草+落卷席）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草+修法+真机验证+落卷同席落卷·pre-exec 双审两独立外席待派·alone≠dual·Dual PASS ≠ 开工·Ban self-approve·est live=1 臂（模型 Key 隔离臂真机 UI run·零消耗记 §9-③）·markers=0·⛔push⛔merge 主线）

> 任务类型：runner 测试基建面守卫缺陷修复（STALE_BUILD_GUARD 旧判单一 BUILD_ID mtime 新鲜 → 误复用 `verify:e2e-performance` 步1 无 `E2E_UI_STRESS` 生产构建 → events 路由压测分支死码剔除 → stream-window 压测 SSE 零帧饿死假红；修法=复用前增「意图判」递归扫编译产物压测载荷串·缺源即重建·步1 生产构建零触不被测试开关污染）。
> 立项出处：协调方派单 brief（2026-11-05 SBG 起草席·「本波唯一被允许跑浏览器 UI runner 的席位」随令·修法候选「守卫不只看时间·还判断既有构建是否符合本次意图（E2E_UI_STRESS=1 时检查编译产物是否含压测源·缺失即强制重建）」优先采纳随令授权）。
> 本刀修法面：`scripts/run-e2e-ui.mjs` 意图判接线 + 新 `scripts/e2e-platform/stale-build-guard.mjs` 纯函数模块 + 新 `scripts/e2e-ui-stale-build-guard.proof.mjs` 无浏览器 proof + `package.json` 注册行 + 两 policy 脚本 cap 恰等联动。零产品码触面。修订后另触 `.github/workflows/ci.yml` 一步（§9-⑥）。

## §0 事实锚（本席亲证清单·2026-11-05·全部 Read/rg/wc/git rev-parse/真机构建产物实测 @`92a82a944`）

### 0.0 基线/防重/在飞

- **基线/分支/工作树**：`origin/main` = `92a82a944`（=PR #209 perf-status-pin merge·`git fetch` EXIT=0 后 `git rev-parse origin/main` 亲证=主仓 main tip 恒等）· 分支 `line/sbg-draft`（建前 worktree 列表零 `meetwise-sbg`·本席 `git worktree add ../meetwise-sbg -b line/sbg-draft origin/main` 亲立·主仓只做 worktree add 零其他 mutation）· 工作树 `meetwise-sbg`（仓根同级）· `pnpm install --frozen-lockfile` EXIT=0 亲跑。
- **防重双查**：`ls ai-docs/delivery/harness/ | grep stale-build` 建前命中恰 1=`e2e-runner-stale-build-guard-REQUEST.md`（系先行刀 件① BUILD_ID mtime 新鲜度防线+件② web-build 扣留输出落盘 卷·**零修法面交叠**：该刀未触意图判/产物扫描面）· `stale-build-guard-REQUEST.md` 建前零命中→落卷后唯一同名卷=本卷；`git branch --list "line/sbg*"` 恰 1 命中=本席分支。
- **在飞登记**（worktree 列表四树+届值逐支亲算）：`line/online-pay-rev`（`bc9d6fd08`·ahead=2）/`line/s3caps-draft`（`2cfdade94`·ahead=5·承 **2_487**）/`line/uc31-rev`（`ac3d1ef76`·ahead=1·承 **2_487**）——三支 merge-base 均 `92a82a944` 亲证（`git merge-base origin/main <b>`）·两 policy 脚本触面亲算（`git diff --name-only <mb>...<b> -- scripts/ai-docs/` 均 2 件）=已知共享热面·并线 union 沿常设预授权届时取大重算承登（本刀 2489 现最大）；本刀工作树 `meetwise-sbg` 系本席亲立在册。

### 0.1 现状固化表（base blob 亲算 `git rev-parse --short=8 92a82a944:<path>`·行号=base blob 实值）

| # | 锚 | base blob | 亲证结论 |
| --- | --- | --- | --- |
| 1 | `scripts/run-e2e-performance-suite.mjs` | `7580fa02` | 步表 steps[0]=`['web production build', ['-C','apps/web','build']]`——**不带 E2E_UI_STRESS**（步1 真实生产构建形·本刀零触）；steps[3]=`['browser full E2E', ['e2e:ui:isolated']]`（步4·假红触发点）。派单锚「步4 之后是否有步骤依赖 .next 为无压测源生产形」核毕：步5 `web:prove`=`pnpm -C apps/web prove`=`tsx test/web-logic.proof.ts`（apps/web/package.json :8 亲证·rg `.next\|next build\|playwright\|browser` 零命中=纯逻辑 proof）·步6 起 resume-extract/rag-chunking/performance:e2e（API burst）/api:validate/neg:all/turn-idempotency/stress:prove/window:prove（apps/worker）/memory/voice/adaptive-latency/scoring 四件/vectorstore/rag-generation/rag-corpus-version/qbank-control/rag-cache/retrieval/adversarial/crag/agent-skills 全系 API/DB 面——**套件内步4 之后零 `.next` 消费步·零容器构建/公开文案/发布门步**：步4 强制重建把 `.next` 留在压测形对套件后继步骤零影响〔套件结束态与套件外消费者补记见 §9-⑥-6〕 |
| 2 | `apps/web/next.config.mjs` | `f44c9119` | :18 `compiler: { define: { __E2E_UI_STRESS__: process.env.E2E_UI_STRESS === '1' ? '1' : '0' } }`——构建期内联（DefinePlugin 语义·头注 #65 裁决项⑤「移出生产构建」面亲读） |
| 3 | `apps/web/app/api/interview/[id]/events/route.ts` | `8023ea9e` | :103 `if ((id === STRESS_ID \|\| id === STRESS_PROGRESS_ID \|\| id === STRESS_SILENT_ID) && __E2E_UI_STRESS__ === '1') {`——三压测注入函数（`e2eStressStream`/`e2eProgressStream`/`e2eSilentStream`·函数体唯一载荷串见 §0.2-1）**唯一调用点均在此门分支内**（rg 亲证）→ 生产构建（内联 '0'）门恒假+死码剔除 |
| 4 | `scripts/run-e2e-ui.mjs` | `6dc0cf86`（320 内容行 wc -l 口径） | :6 头注（单一新鲜度判形）；:99-107 `headTimeSec()`（git 不可用→null fail-open）；:241-243 Recorded blocker 注释；:244 `const nextBuildId`；:245 `let forceRebuild = false`；:248-259 mtime<HEAD → forceRebuild+warn（**判据单一：BUILD_ID 在场且 mtime 新鲜即复用·对产物是否含本次意图所需压测源零检**）；:263 重建 log 行；:268/:288 build/start 两阶段 spawn 恒显式 `E2E_UI_STRESS: '1'`。派单锚「:246-261」→实际 guard 段实值 **:241-267**（行号偏差如实登记·语义判定不受影响） |
| 5 | `scripts/run-e2e-isolated.mjs` | `5ec83765` | :3254-3302 UC001WEB 容器臂：容器内 `next build && next start`（:3265 `-e E2E_UI_STRESS=1`·ROOT 全挂载 `-v ROOT:ROOT`）→ 容器构建**写宿主 `apps/web/.next` 成压测形**（:3300 D-BUILD 披露「NOT clean production bundle」在卷）——宿主 `.next` 压测形的合法来源之一（非事故面·披露面在卷） |
| 6 | `.dockerignore` | `f3bc7479` | :6 `**/.next`——宿主 `.next` 零进生产镜像构建上下文 |
| 7 | `apps/web/Dockerfile` | — | 生产镜像 build 阶段容器内 `RUN pnpm -C apps/web build`（**无 E2E_UI_STRESS**·`COPY . .` 后在容器内重建覆盖·`.dockerignore` 已剔 `.next`）→ run 阶段只带 standalone——**生产构建链零压测源泄露面** |
| 8 | `scripts/deploy-check.mjs`/`scripts/release.mjs` | — | rg `\.next\|E2E_UI_STRESS\|standalone` 零命中——发布/部署检查脚本零 `.next` 复用面 |
| 9 | `scripts/ha/ha-sandbox.mjs` | `431a23a4` | :561-574 web standalone 产物门〔门实际在 :563，见 §9-⑥-6〕（「生产同形材质」）——**STANDALONE_SERVER 在场即不重建照用**（`:561 if (!existsSync(STANDALONE_SERVER))`）：e2e-ui/UC001WEB 臂留下的压测形 standalone（`output:'standalone'` 随 build 恒产出）可被本门当「生产同形材质」复用于 HA 沙箱——**反向安全面残留风险（本刀只登记不修·§9-② 越界登记·Ban 就地扩面）**：压测源进生产=事故，生产链本体（#6/#7）安全；HA 沙箱系本地沙箱非生产，但「生产同形材质」宣称被压测形污染属失真面，建议后继刀给该门加独立构建位或压测源检 |
| 10 | `scripts/e2e-static-guards.mjs` | — | `discoverRunnerPaths` 正则 `^(?:run-e2e.*\|run-performance-e2e\|capture-screenshots)\.mjs$`（:259-263 亲读）——本刀新 proof `e2e-ui-stale-build-guard.proof.mjs` 不入 runner 扫描面·runnerCount 恒 6；helpers 扫描面=e2e/helpers 目录+固定清单（:240-256）——新 e2e-platform 模块不入·helperCount 恒 21 |
| 11 | `scripts/e2e-platform/secret-redaction.mjs` | — | :52-59 合同：run-e2e-ui.mjs 源恒含 `E2E_PROCESS_OUTPUT_WITHHELD`——本刀零触该面（改后源仍含·亲证） |
| 12 | `package.json` | `5927981d` | :459 `g6-e2e-iso-blocked:prove` 行后插入本刀 proof 注册行（:444/:446 `e2e:ui`/`e2e:ui:isolated` 零触） |

### 0.2 检测串选型勘验（本卷最重要勘验·真机构建产物两形实测·「检查编译产物是否含压测源」的落点定稿）

1. **压测载荷三串（定稿检测串）**：`压力回放题`（e2eStressStream·`__e2e_stream_stress__` 源·stream-window 用例数据面）/`进度预演题`（e2eProgressStream）/`静默连接题`（e2eSilentStream）——events/route.ts 三函数体内字符串字面量。**clean 构建实测**（`pnpm -C apps/web build` 不带开关·本席亲跑）：三串在 `.next/server` 全零命中（死码剔除亲证）；**压测构建实测**（`E2E_UI_STRESS=1 pnpm -C apps/web build`·本席亲跑）：三串逐串恰在 1 文件命中（`server/app/api/interview/[id]/events/route.js`·路由处理器整块单 chunk·实测未拆散）。`.next/server` 面 121 个 .js/5.8MB（find+du 亲测）——递归全扫成本毫秒级。
2. **id 串假阳发现（弃用根因）**：`__e2e_stream_stress__` 等 id 串在 **clean 生产构建仍保留**——`server/app/interview/[resultId]/page.js`（客户端 chunk·源 `apps/web/app/interview/[resultId]/page.tsx` 构造跳转 URL 用）〔依据有误：该文件是服务端组件页 bundle，见 §9-⑥-6〕亲证 3 id 串全在。**若按字面采纳「检查编译产物是否含压测源」以 id 串为检测串 → clean 构建必假阳=事故面复现（无压测源构建被当压测构建复用→零帧假红原样发生）**。故检测串定稿=服务端独有载荷三串·全在才判「压测源在」（三变体任一缺=意图不完整·W3/W4 臂同消费）。
3. **扫描面定稿**：只扫 `apps/web/.next/server`（服务产物 canonical 位）递归 `*.js`——`.next/cache` 系构建缓存（含源码缓存·clean 构建亦可能留痕）不入扫面；`.next/standalone` 系同产物派生副本不另扫；非 .js 不计（防未来 manifest 误带串）。中文载荷串若未来打包器翻 unicode 转义序列（`\u` 前缀形）→ 扫不到 → 判缺源 → 重建（**fail-safe 方向=多花重建耗时·不产生错误复用**）。
4. **chunk 拆分稳定性**：扫描不锚单文件路径（路由 chunk 未来拆分不假阴——递归全目录·三串允许分居不同文件·proof fixture 拆分形态实测在卷）；字符串字面量经压缩原样保留（两形构建实测）。

## §1 修法（已随起草落卷·逐字·⛔EXEC 期不得更改）

> 修订指针：本节保留起草原文，现行修法以 §9-⑥-2 为准。

净面：`scripts/run-e2e-ui.mjs` +37/−9（numstat 亲测·base blob `6dc0cf86` 320 行→348 行）+ 新 `scripts/e2e-platform/stale-build-guard.mjs`（101 行）+ 新 `scripts/e2e-ui-stale-build-guard.proof.mjs`（196 行）+ `package.json` +1（:460 proof 注册行）+ 两 policy 脚本 cap 恰等联动（§3）。零产品码触面。

### 件① 新模块 `scripts/e2e-platform/stale-build-guard.mjs`（纯函数·可测·import 级直测）

- `STRESS_BUILD_MARKERS = Object.freeze(['压力回放题','进度预演题','静默连接题'])`（§0.2 定稿三串·全在才判在）。
- `scanServerStressMarkers(serverDir)`：递归扫 `.next/server` 全 `*.js`·目录缺/读失败/单文件失败按缺源计（fail-safe 方向）·`{present, missing, scannedFiles}` 三元返回。
- `decideBuildReuse({buildIdExists, buildIdMtimeMs, headTimeSec, stressExpected, stressSourcePresent})`：`!buildIdExists→'build_id_missing'`；mtime<head（双值齐才判·任一不可得跳新鲜度判=既有 fail-open 语义保持）`→'stale_vs_head'`；`stressExpected=true 且源缺→'stress_source_missing'`；`stressExpected=false 且源在→'stress_source_unexpected'`（反向意图·本 runner 恒 true·面留通用）；其余 `→reuse`。

### 件② `scripts/run-e2e-ui.mjs` 意图判接线（guard 段 :241-267 重写·核心 diff 形）

- 头注 :5-6 增「或既有构建缺本 runner 压测源(意图判…)」第三重建触发面+模块指引。
- import 增 `decideBuildReuse, scanServerStressMarkers`（`./e2e-platform/stale-build-guard.mjs`）。
- guard 段：mtime 读取与新鲜度判语义逐字保持（fail-open 双 warn 行保持·文案微调为「新鲜度判按现行为服务既有构建(压测意图判照检)」）；BUILD_ID 在场时**恒**复扫压测源（确定性读盘·不受 git 可用性影响）→ `decideBuildReuse({…, stressExpected: true, stressSourcePresent: stressScan.present})`；`stress_source_missing` 臂 warn：`E2E-UI: STALE_BUILD_GUARD 既有构建缺压测源(.next/server 未见 e2e-guard-only 压测载荷·缺 <missing 串列>·疑无 E2E_UI_STRESS 生产构建)→ 强制重建(防误复用后压测 SSE 零帧假红)`；`stress_source_unexpected` 臂 warn 压测源不进非压测服务面；重建 log 行改「判定重建(陈旧/缺压测源)」。**:268/:288 build/start 两阶段 `E2E_UI_STRESS: '1'` 逐字零触；:99-107 headTimeSec 逐字零触；扣留输出落盘面（`E2E_PROCESS_OUTPUT_WITHHELD` 合同）逐字零触。**
- **步1 生产构建零触**：`scripts/run-e2e-performance-suite.mjs` 零字节（proof 源级钉「无 E2E_UI_STRESS 词面」在卷）——步1 仍真实生产形不被测试开关污染（派单优先采纳修法本旨）。

### 件③ 新 proof `scripts/e2e-ui-stale-build-guard.proof.mjs`（无浏览器·真模块 import 直测非副本同构）

- 决策矩阵 11 格（任务书四格全含：新鲜无压测源→重建 / 新鲜有压测源→复用 / 陈旧→重建 / 产物缺失→重建 + HEAD-time 不可得两态 / mtime 读失败两态 / mtime==head 边界 / 反向意图两格）。
- 扫描语义 5 格（三串分居嵌套 chunk 文件→present / 空目录→缺 / 目录缺→缺 / 部分缺 1/3→缺且 missing 精确 / 串仅非 .js→缺）。
- 检测串假阳守卫钉（markers 不含 `__e2e_stream_` id 族 / 三串在 route.ts 源在场 / 门面 `__E2E_UI_STRESS__ === '1'` 在场 / 载荷串在 e2eStressStream 函数体且唯一调用点在门分支内）。
- runner 源级钉 7 项（模块 import / 两调用 / `stressExpected: true` / 缺源告警行 / 旧新鲜度告警行保持 / build+start `E2E_UI_STRESS: '1'` ≥2 处 / 内嵌 next build）+ perf 套件步1 零触钉 + `node --check` 三脚本。
- `package.json` :460 注册 `"e2e-ui-stale-build-guard:prove": "node scripts/e2e-ui-stale-build-guard.proof.mjs"`。

### 守恒断言（改面外零字节）

- `headTimeSec()`（:99-107）/seedAdmin/waitFor/waitForApiDatabase/spawnProc/buildSink/writeBuildLog 全函数体零字节；:268/:288 `E2E_UI_STRESS: '1'` 双点逐字在（proof 钉）；`E2E_PROCESS_OUTPUT_WITHHELD`/`withheldOutputSummary` 合同面零触（static-guards 改后 EXIT=0 亲证）；`assertNoFakeServiceFlags` import/call 恒在（static-guards 合同）；runner 词面零 `live_provider_key_missing` 增减；`run-e2e-performance-suite.mjs`/`run-e2e.mjs`/`run-e2e-isolated.mjs`/`run-performance-e2e.mjs` 零字节；migrations 零触（`git diff -- packages/db/migrations`=空亲证随 commit 复核）。

## §2 验收断言预算（门矩阵·**数字口径以实跑实测为准+偏差熔断**·命令原样可复制）

- **A 臂（改前基线红·诊断席实证+本席复核在卷 §0）**：`verify:e2e-performance` 步1 生产构建（无开关）→ `.next` 无压测源 → 旧 guard mtime 新鲜复用 → stream-window SSE 落真 API 代理零帧饿死。本席复核：clean 构建 `.next/server` 三串零命中（§0.2-1）+ 旧 guard 判据单一（§0.1-#4）机制链亲证成立。
- **B 臂（主断言·本席真机亲跑·派单随令「本波唯一 UI runner 席位」·receipt `ai-docs/delivery/receipts/stale-build-guard/ui-run1-stream-window-2026-11-05.log` 在盘）**：工作树 `pnpm -C apps/web build`（**不带开关**·真实生产形先置）→ `source ~/.meetwise-secrets/load-model-api-key.sh`（只报 set/unset：`MODEL_API_KEY: set`·`G7_RUN_COST_LEDGER_PATH: unset`·零值打印零 `.env*` 读建）+ `G7_FREETIER_REPROVE=1` + `E2E_UI_GREP='10k SSE replay|variant:'`（stream-window.spec.ts 三用例精确匹配·rg 亲证他 spec 零命中）→ `pnpm e2e:ui:isolated`。**实测（run1·≤2 次预算未耗尽）：EXIT=0**·runner log 逐字：
  - `E2E-UI: STALE_BUILD_GUARD 既有构建缺压测源(.next/server 未见 e2e-guard-only 压测载荷·缺 压力回放题/进度预演题/静默连接题·疑无 E2E_UI_STRESS 生产构建)→ 强制重建(防误复用后压测 SSE 零帧假红)`
  - `E2E-UI: STALE_BUILD_GUARD 判定重建(陈旧/缺压测源) → 强制 next build…`
  - Playwright **6 passed (24.5s)**（stream-window 三用例 × chromium/mobile 两 project 全绿·10k replay 803ms/618ms·progress 5.5s×2·silent 5.5s×2）——预期触发重建且 stream-window 全绿达成（run1 即绿·run2 备用未用）。
- **C 臂（复用臂·守卫复用语义真机零回归）**：B 臂跑后 `.next` 已为压测形（重建产物·三串在场亲证）——同形再跑守卫判「新鲜+源在→复用」不重建；本席以 proof 决策矩阵格+产物扫描实测覆盖（真机二次整跑不另耗：B 臂 log 内重建后 `next start` 即复用判定链后段·复用臂由决策格单测钉死·如实登记）。**〔「由决策格单测钉死」不成立，已撤回，见 §9-⑥-1〕
- **门矩阵（起草已全跑）**：

| # | 门 | 期望 | 实测（起草 turn 亲跑） | 结论 |
|---|---|---|---|---|
| 0a | check-docs 改前基线 | EXIT=0·scanned=cap 2486 恰等 | `git ls-files --cached` managed 过滤亲算 **2486**（cap 2486 恰等） | 绿 |
| 0b | PTP proof 改前基线 | 12/12 | EXIT=0 `selected=12/12` | 绿 |
| 0c | static-guards 改前基线 | EXIT=0 | EXIT=0 runners=6 helpers=21 flags=9 aiPaths=6 | 绿 |
| 0d | g6 改前基线 | EXIT=0 | EXIT=0 | 绿 |
| 0e | egress inventory 改前基线 | EXIT=0 | EXIT=0 adapters=5 operations=10 pairs=55 refs=401 | 绿 |
| 1 | 新 proof 改后 | EXIT=0 全 PASS | EXIT=0·31 PASS 0 FAIL（决策 11+扫描 5+markers 4+runner 7+套件钉 1+node --check 3）〔起草读数，现行见 §9-⑥-7〕 | 绿 |
| 2 | static-guards 改后 | EXIT=0·四值恰等 | EXIT=0 runners=6 helpers=21 flags=9 aiPaths=6 | 绿恰等 |
| 3 | g6 改后（runner 形制行为门零回归） | EXIT=0 | EXIT=0 | 绿 |
| 4 | provider-egress-inventory 改后 | EXIT=0 | EXIT=0 | 绿 |
| 5 | check-docs 落卷后 | EXIT=0·scanned=cap 2489 恰等 | 见 §9 落卷读数（改后先实测 2488=2486+2 新脚本·cap 2486 时 PTP_FILE_LIMIT:2488 红真亲证→cap 联动后绿） | 落卷实测 |
| 6 | PTP proof 落卷后 | 12/12 | 联动后 12/12 亲跑 | 绿 |
| 7 | markers 五类（改动集·词面运行时组装） | 0 命中 | 见 §9 落卷读数 | 落卷实测 |
| 8 | node --check 改动脚本 | PARSE-OK×5 | runner/模块/proof/policy/proof-policy 全 PARSE-OK（三件在 proof 内·两 policy 件 node --check 单跑） | 绿 |
| 9 | B 臂真机（docker 隔离栈） | 守卫重建触发行+stream-window 全绿 | run1 EXIT=0·6 passed（§2-B） | 绿 |

## §3 cap 预登（CAP-SANCTION-2489 恰等步进·派单预登值如实重算承登）

- 届值亲证：起草前 `git ls-files --cached` managed 过滤亲算 **2486 = cap 2486 恰等零余量**（`MAX_FILES = 2_486` 行亲证 @`6f6ec8aa`）。
- **派单预登「main 届扫+1 预期 2487」如实重算**：预登系 brief 时点仅计本卷 REQUEST 1 件的预估；本刀实际受管 +3（`scripts/e2e-platform/stale-build-guard.mjs`+`scripts/e2e-ui-stale-build-guard.proof.mjs`+本卷 REQUEST .md——派单门矩阵自带「新 proof」件·untracked managed additions 亲算恰 2 脚本·cap 2486 原值下实测红 `PTP_FILE_LIMIT:2488` 真红亲证）→ **cap 2486→2489（+3·恰等零多放）**·沿 CAP-SANCTION-2486「预登值届值进位后如实重算承登·预登注史录保留零洗」先例形·协调方常设预授权「cap 以合并树实测恰等步进免再询」随令行使。预登值偏差已入 §9-① 偏离清单。
- 四联动点已随卷恰等改（两 policy 脚本·既有注记零字节改写·链注 append）：`policy.mjs` `MAX_FILES 2_489` + 链区 CAP-SANCTION-2489 注记；`proof.mjs` loop `i < 2_489` / atCap `scannedFiles 2_489` / overCap `f-2489.md` / `FILE_LIMIT:2490` + 链区注记（越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。PTP 12/12 联动后亲跑绿。
- 在飞如实列（§0.0 亲测）：pay ahead=2 / s3caps-draft 承 2_487 / uc31-rev 承 2_487——并线 union 沿常设预授权届时取大重算承登（本刀 2489 现最大）。
- EXEC 期零新增受管文件（真机收据 .log ∉TEXT_EXTENSIONS 不计·`.next` gitignored 不计）→ terminal **2489 零新增**。

## §5 Ban 列表 + pins（沿邻卷同源誊录+本卷面增补）

**Ban 列表**：Ban push/force push/merge 主线；Ban 自批（双审须独立外席·alone≠dual）；Ban retry-to-green/masking/假绿叙事（B 臂 ≤2 次预算外零重跑）；Ban 翻 pins（十一值含 `actualSpendCny=null`）；Ban 改共享 SSOT（LEDGER/checklist/TASK-SOP-v2/issues-master 零触）；Ban 触 migrations（零迁移）；Ban 就地扩面（ha-sandbox standalone 复用面只登记不修·§0.1-#9/§9-②）；Ban 触步1 生产构建形（`run-e2e-performance-suite.mjs` 零字节·测试开关不进生产构建）；Ban 改 id 串/压测源语义/events 路由门面（`__E2E_UI_STRESS__` 内联语义零触）；Ban 读/打印 secrets 值与 `.env*` 读写（本刀全程 name-only·`MODEL_API_KEY: set/unset` 口径亲守）；Ban 触其他工作树（worktree 列表在册树零触）；Ban 伪造已问/已验来源；Ban 弱化既有守卫语义（新鲜度防线/扣留输出合同/隔离门零弱化）；Ban cap 超预登值（2489）再自升。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本卷起草+真机臂零消耗口径·B 臂模型面系既有隔离栈 UI 流·无新增模型消耗记 §9-③）

## §6 est live 口径

B 臂系真机 UI run（隔离 PG+隔离栈+真浏览器·按派单随令行使·本波唯一 UI runner 席位）：流经 events 路由压测源（e2e-guard-only·零上游 fetch·hermetic）+ 三用例 UI 面零模型文本外呼（stream-window 三用例不触模型生成臂）·`MODEL_API_KEY` 系 runner 启动合同必需（`live_provider_key_missing` 门）非消耗面·账本 `G7_RUN_COST_LEDGER_PATH` 保持 UNSET（派单钉·runner 默认 `.tmp/g7-ledgers/` 自管·零共享账本写入）。零生产操作·零 secrets 值触面。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · 2026-11-05 起草+落卷即停 · pre-exec 双审两独立外席待派 · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·翻面/nail 归协调方）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1 修法清单与 §0.2 检测串定稿与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin·漂移只更行号不改结论）。

**停止条件（四类·命中即停手上报·Ban 就地处置）——本席起草期逐条核：零命中**：

- **现场漂移**：EXEC 时点 tip 对 §0.1 任一实锚漂移且 §1 结论受疑（guard 段被他线改写/压测源移位/内联语义变）→停·重 pin 回炉。
- **机制不满足**：B 臂重建触发行不出现或 stream-window 红→守卫机制被证伪→停（run1 即绿未触）；门矩阵任一门红→全卷停·Ban 借机修邻面。
- **越界需要**：修法诉求超出 §1 申报面（需触 ha-sandbox/步1 步表/产品码）→停·另刀或协调方裁决（已按此登记 §9-② 零就地扩面）。
- **验收红不可修**：门红且根因不在本刀交付面→停·stash 对照亲证基线·如实登记（check-docs 基线 2488 红系 cap 预登差·沿 §3 重算承登非邻面红）。

## §9 落卷记录（起草席·2026-11-05）

**①偏离任务书清单（如实承登·理想零为不可达项如实注）**：
1. **cap 预登 2487→实落 2489**：派单「main 届扫+1 预期 2487」系仅计 REQUEST 1 件预估；本刀实际 +3（guard 模块+proof+REQUEST·派单门矩阵自带「新 proof」件）——沿常设预授权恰等重算承登（§3·CAP-SANCTION-2486 同形先例）·非自升（union 实测红 `PTP_FILE_LIMIT:2488` 真红亲证在卷）。
2. **检测串定稿偏离派单字面口径**：派单「检查编译产物是否含压测源」——字面以 id 串检测必假阳（§0.2-2 clean 构建客户端 chunk 保留 id 串亲证）〔依据更正见 §9-⑥-6〕·按派单「防这个判断自身假阳/假阴」条款落点定稿=服务端独有载荷三串·选型勘验全卷 §0.2。
3. **守卫逻辑落点为新模块文件**：派单「守卫逻辑写成可测函数」——runner 顶层 side-effect（隔离 throw/Key 门）使 import 级直测不可达（先行 e2e-runner-stale-build-guard 卷 §0.2-2 同判）·纯函数落 `scripts/e2e-platform/stale-build-guard.mjs`（proof 真模块 import 直测·优于前刀副本同构形）·系任务书条款必然面+1 受管件（已并入 §3 算式）。
4. **C 臂（复用臂）以决策单测+产物实测覆盖·未另耗真机二次整跑**：B 臂 ≤2 次预算内 run1 即绿·复用语义由 proof 决策格钉死+重建产物三串在场实测·如实登记非真机整跑臂（如双审裁定需真机复用臂·EXEC 期补跑 run2 形即可·预算未耗尽）。〔「由 proof 决策格钉死」已撤回，见 §9-⑥-1〕
5. 派单行号锚「STALE_BUILD_GUARD(:246-261)」→base 实值 :241-267（偏差如实改锚·结论不变）。

**②范围外登记（只登记不修·后继刀候选）**：`scripts/ha/ha-sandbox.mjs :561-574` web standalone「生产同形材质」门对既有 `.next/standalone` 在场即复用——e2e 臂遗留压测形 standalone 可被其当生产同形材质消费（§0.1-#9）·生产链本体安全（`.dockerignore **/.next`+容器内洁净构建亲证）·建议后继刀给该门加压测源检或独立构建位（本刀 Ban 就地扩面零触）。〔锚与后继排序见 §9-⑥-6〕

**③真机收据（B 臂·run1）**：receipt `ai-docs/delivery/receipts/stale-build-guard/ui-run1-stream-window-2026-11-05.log`（3228B·零 secrets 形亲扫·`MODEL_API_KEY=`/`sk-` 形零命中）·EXIT=0·守卫重建触发行+`6 passed (24.5s)` 逐字在卷 §2-B·docker 栈隔离（`docker info` 通·前置 `ps` 无他 next build/chromium 亲证）·`E2E_UI_GREP='10k SSE replay|variant:'`（stream-window 三用例精确匹配·他 spec 零命中 rg 亲证）·`G7_FREETIER_REPROVE=1`·`G7_RUN_COST_LEDGER_PATH` UNSET 保持·run2 备用未用。

**④门矩阵落卷读数（起草落卷后终跑）**：
- 新 proof：EXIT=0（31 PASS·§2 门 1）。
- static-guards：`e2e static guards passed: runners=6 helpers=21 flags=9 aiPaths=6; releaseEvidence=false` EXIT=0。
- g6：`CMD=pnpm g6-e2e-iso-blocked:prove EXIT=0`。
- provider-egress-inventory：`static_provider_egress_inventory_valid: adapters=5; operations=10; registered_consumer_source_pairs=55; environment_references=401` EXIT=0。
- check-docs：`ai-docs check passed: 80 required files verified; public text policy scanned 2489 managed worktree files` EXIT=0——**scanned 2489 = cap 2489 恰等**（本卷 +2 脚本 untracked 亲算+REQUEST 落卷+1·改后先实测 2488→落卷 2489 链亲证）。
- PTP：`static_preflight_valid: selected=12/12` EXIT=0（cap 2489 联动后）。
- markers 五类（改动集 7 文件·五类标记词词面运行时组装不入卷防自指·冲突标记+四遗留词·沿 i6-239-gates.proof.mjs :152-163 形）：**0 命中**（首轮实测 5 命中系本卷两文件字面自指·即改即清·复测 0 在卷）。
- node --check 五脚本：runner/模块/proof/policy.mjs/policy.proof.mjs 全 PARSE-OK。

**⑤后继工序（归协调方·本席停手）**：pre-exec 双审两独立外席派单（对 §0 全量重 pin+§1 修法面审+§2 门矩阵复核）→ BOTH PASS 落卷 → 协调方明示授权 → pin 翻面（Status 头/§8/§9/卷尾四处同值翻面·append-only 原行留痕）→ nail/push 归协调方。EXEC 期零码面改动（§1 已随起草落卷）。

**⑥修订注记（2026-11-06·回应 pre-exec 两路审查 sbg-1 FAIL / sbg-2 PASS·状态不变）**：

1. **起因与撤回**：sbg-1 P1-1 实测，原 proof 对 runner 接线的 7 条钉只查字面，把压测源存在写死为 true（事故原形）或删掉强制重建，31 项仍全过；扫描格 d 三次覆盖写同一文件，是空转格。§2-C 与 §9-①-4「复用语义由 proof 决策格钉死」不成立，撤回。

2. **现行修法（取代 §1 件①②③ 的对应描述）**：
   - 模块：`decideBuildReuse` 改为由输入决定输出的纯函数，入参是 BUILD_ID 在否、BUILD_ID 时间、HEAD 提交时间、压测意图、产物扫描结果，返回 `{rebuild, reason, warnings, buildLog}`，全部判定和告警文案都在这里，文案逐字沿用。新增 `evaluateExistingBuild({webDir, headTimeSec, stressExpected})`，只读盘收集 BUILD_ID 时间与扫描结果再调用它。
   - runner：只提供 HEAD 时间与压测意图、调用 `evaluateExistingBuild`、原样打 `warnings`、按 `rebuild` 构建。`forceRebuild`、`statSync`、按 reason 分派全部删除。判定段由 `STALE_BUILD_GUARD_SEGMENT_BEGIN/END` 界标围住，覆盖到 `next start` 的 spawn。
   - 相对起草形的运行差异三处，均无判定影响：无 BUILD_ID 时也调一次 `headTimeSec()`（只读 `git log`）；HEAD 时间不可得时也 stat 一次 BUILD_ID；无 BUILD_ID 时也扫一次 `.next/server`。
   - proof：`decideBuildReuse` 完整决策表 80 格（BUILD_ID 2 × mtime 5 × HEAD 2 × 意图 2 × 压测源 2，期望值按状态标签查表，不含数值比较）加非法入参格；`evaluateExistingBuild` 在假 `.next` 上 16 格；runner 判定段截出真实源码，跑在假 `.next` 与替身 build 命令上（事故形、复用、陈旧、无 BUILD_ID、HEAD 不可得、构建非零退出、构建成功但无 BUILD_ID），替身按 `E2E_UI_STRESS` 决定是否产出压测串，所以重建后再跑同一目录必须复用。扫描格 d 改为三串各写一个非 .js 文件，并加同内容 .js 正对照。proof 崩溃时也交出已跑读数。
   - 边界：替身 build 不验证 next 真实产物；界标外的 runner 代码不被执行，只受防回退钉约束。

3. **变异测试（对改后代码原地变异，内存留原文，每次恢复并校验 sha256，未用 git stash）**：判定口径是 proof 退出 1 且至少一条断言 FAIL，崩溃不算。

| 项 | 变异 | proof 结果 |
| --- | --- | --- |
| (a) 压测源存在恒为 true | 判定函数入口写死 | 失败，23 条 FAIL |
| (a) | 扫描返回写死 | 失败，23 条 FAIL |
| (a) | 收集层伪造扫描结果 | 失败，17 条 FAIL |
| (b) 去掉强制重建 | runner 门恒假 | 失败，16 条 FAIL |
| (b) | runner 只认 BUILD_ID 缺失 | 失败，12 条 FAIL |
| (b) | 判定函数不再要求重建 | 失败，28 条 FAIL |
| (c) 去掉扩展名过滤 | 删过滤 | 失败，3 条 FAIL |
| (c) | 放宽到含 .js.map | 失败，3 条 FAIL |
| (d) 时间比较取反 | `<` 改 `>` | 失败，26 条 FAIL |
| (d) | `<` 改 `>=` | 失败，27 条 FAIL |
| (d) | `<` 改 `<=`（边界） | 失败，2 条 FAIL |

   另做 22 种：扫描根漂移、意图改 false 或漏传、构建或启动丢压测开关、不传 HEAD 时间、吞告警、runner 本地放过缺源、构建后不验 BUILD_ID、构建失败不退出、界标外偷跑构建、检测串减少、删反向臂、BUILD_ID 恒在、跳过陈旧判、不可读文件计数，以及 route.ts 三函数导出、门外调用、门改运行时、next 配置关 `serverMinification`/`cleanDistDir`、perf 套件写入开关。合计 33 种，33 种被断言抓到，0 种存活，0 种崩溃。route.ts、next.config.mjs、perf 套件这 6 种跑在 `/tmp` 布局副本上，树内产品文件未被临时改动。
   首轮曾有 4 种（判定函数入口写死、`<` 改 `>`、`<` 改 `>=`、跳过陈旧判）退出 1 但零 FAIL 行，查实是 proof 自身 TypeError 崩溃，不是断言抓到。已修 proof 与统计口径后全量重跑，上表是重跑结果。

4. **CI**：proof 无库、无浏览器、实测约 0.5 秒，接入 `.github/workflows/ci.yml` verify 任务，紧跟 E2E static guards（新增 :65-67 三行加一空行），命令 `pnpm e2e-ui-stale-build-guard:prove`。无 `.next` 的副本树与导出 `E2E_UI_STRESS=1` 的环境下都实测 EXIT=0。

5. **真机复核：未跑，改后代码目前没有真机读数**。本席执行纪律禁止跑 E2E 场景，已告知协调方，由主会话补跑。`pnpm -C apps/web build` 与跑 runner 之间不能落新 commit：否则 BUILD_ID 早于 HEAD，走的是陈旧臂而不是事故路径。期望出现 `既有构建缺压测源` 告警（缺三串）、判定重建行与 `6 passed`。收据建议名 `ai-docs/delivery/receipts/stale-build-guard/ui-run2-stream-window-2026-11-06.log`，并用 `git hash-object` 记下 runner 与模块的 blob 以绑定收据，读数待主会话补入本条。同形再跑一次（总数不超 2 次）可补真机复用臂：不应出现 STALE_BUILD_GUARD 行。
   〔主会话真机读数补入 2026-11-06：前提核毕——工作区恰本刀 5 件改动、无其他树构建/浏览器进程、docker OK；`pnpm -C apps/web build` EXIT=0（无 E2E_UI_STRESS·约 27s）后至 commit 零落新 commit。〕
   - **run1（判定重建臂）**：`G7_FREETIER_REPROVE=1 E2E_UI_GREP='10k SSE replay|variant:' pnpm e2e:ui:isolated`，EXIT=0，全程约 74s。关键行：`E2E-UI: STALE_BUILD_GUARD 既有构建缺压测源(.next/server 未见 e2e-guard-only 压测载荷·缺 压力回放题/进度预演题/静默连接题·疑无 E2E_UI_STRESS 生产构建)→ 强制重建(防误复用后压测 SSE 零帧假红)`；`E2E-UI: STALE_BUILD_GUARD 判定重建(陈旧/缺压测源) → 强制 next build…`；`6 passed (25.1s)`。收据 `ai-docs/delivery/receipts/stale-build-guard/ui-run2-stream-window-2026-11-06.log`。
   - **run2（复用臂）**：不重建同命令再跑，EXIT=0，全程约 40s。关键行：零 STALE_BUILD_GUARD 行（直接 `启 web(production next start…)`），`6 passed (25.2s)`。收据 `ai-docs/delivery/receipts/stale-build-guard/ui-run3-stream-window-2026-11-06.log`。
   - **blob 绑定**（`git hash-object` @ `93e32e157`）：`scripts/run-e2e-ui.mjs`=`20b6ab180349fe6bffca70da007cb2cdee6e39e1`；`scripts/e2e-platform/stale-build-guard.mjs`=`ea6bfd87b708e975c410663cc43faec9571cfdc9`。两收据落卷后 re-run check-docs EXIT=0 scanned=cap；落卷与 commit 间不再跑 runner。

6. **两路审查 P2 处置**（sbg-1 记 1-，sbg-2 记 2-）：

| P2 | 处置 |
| --- | --- |
| 1-1 套件结束态未登记 | 已登记：跑完 `verify:e2e-performance` 后 `.next` 与 `.next/standalone` 由 clean 形变为压测形。套件外复用者除 ha-sandbox 还有 `scripts/capture-screenshots.mjs:81`（直接 `next start`，截图只写 `.tmp`，实害可忽略） |
| 1-2、2-2 ha-sandbox 残留 | 不修：跨 HA 子系统，需独立双审，且只加压测判是半修。门实际在 `ha-sandbox.mjs:563`。后继刀应排在下一次 `ha-sandbox up` 之前，过渡期 up 前先做一次 clean 构建或删 `apps/web/.next` |
| 1-3 检测依赖 DCE | 已修一半：proof 钉 next 配置未关 `serverMinification`/`cleanDistDir`、三函数未导出、除声明外只有门内一处调用。不做「重建后复扫」：runner 会多一条失败路径，超出本次修订，留后继 |
| 1-4 「客户端 chunk」依据错 | 已修：模块与 proof 改为服务端组件页 bundle（`page.tsx` 无 'use client'，:13 id 数组，:21 运行时门），runner 该句注释已删。§0.2-2、§9-①-2 留原文加指针 |
| 1-5 模块落位 | 不迁：迁目录要改 runner、proof 两处 import，收益只是目录观感。落位理由已写入模块头注 |
| 1-6、2-4 门矩阵漏列、proof 不在自动化入口 | 已修：e2e-platform 三门读数见下条；proof 已进 CI |
| 1-7、2-6 套件钉过宽、env 泄漏 | 钉已收窄为禁止把 `E2E_UI_STRESS` 置 1。env 继承不修：`run-e2e-performance-suite.mjs` 在 §5 Ban 内。前提登记：「步1 仍真实生产形」只在运营者 shell 未导出该开关时成立，产物不进生产镜像 |
| 1-8 proof 标签过头 | 已修：调用点改为实数计数并验在门分支内；「全格」改为真枚举 80 格 |
| 1-9 簿记 | 已更正：§9-④ markers 实为 8 件；§0.1 的 D-BUILD 披露行实为 :3302，base 的 `headTimeSec` 实为 :101-109。run1 收据未绑 commit，无法事后补绑，新收据由主会话绑定。在飞快照见下 |
| 1-10、2-1 既有竞态与新鲜度盲区 | 不修：扫描到启动之间同树并发改写 `.next`、切到更旧提交、有未提交改动，都是本刀之前就有的风险。守卫承诺只在构建写者串行时成立，加锁是新机制，留后继 |
| 2-3 反向臂在本 runner 不可达 | 不修：非缺陷，保留给通用判定，proof 已覆盖 |
| 2-5 scannedFiles 含不可读文件 | 已修：只计读到内容的 .js，proof 有格 |

   在飞快照（2026-11-06 重算，cap 值取各支 `MAX_FILES` 行）：`line/online-pay-rev` `e4ab3b4cb` 2_489（与本刀并列最大）；`line/uc31-rev` `afbca40e4` 2_488；`line/s3caps-draft` `0e73cd25f`、`line/fastm-draft` `50e026077`、`line/flipa-draft` `a63098304`、`line/ksw-draft` `7c667e229`、`line/rtx-draft` `75af753a6`、`line/xs-draft` `6727e166a` 均 2_487。

7. **门读数（修订后）**：新 proof EXIT=0，81 PASS；static-guards EXIT=0，runners=6 helpers=21 flags=9 aiPaths=6；g6 EXIT=0，61 PASS；provider-egress-inventory EXIT=0，adapters=5 operations=10 pairs=55 refs=401；check-docs EXIT=0，scanned 2489 = cap 2489 恰等（本次零新增受管文件，cap 不动）；PTP 12/12；markers 0；`node --check` 三脚本 OK；e2e-platform check/prove/layout:prove、e2e-static-guards:prove 32/32、e2e-helpers:prove、e2e-receipt:prove、e2e-runner:prove、e2e-parity check/prove、interview-dispatch:gate:prove 全部 EXIT=0；eslint 三脚本 0 错误 0 告警。

8. **后继**：本次改动须走差量复审。作者不得自签，本条读数不等于审核通过。真机读数与 commit 待主会话补。releaseEvidence=false。

**STOP**：维持 **`draft:awaiting_pre_exec_dual`**（pre-exec 双审两独立外席待派·alone≠dual·Dual PASS ≠ 开工·Ban self-approve）。

---

**卷尾 STOP · `draft:awaiting_pre_exec_dual` · 2026-11-05**（Status 头/§8/§9/卷尾四处同值·pre-exec 双审两独立外席待派·alone≠dual·Dual PASS ≠ 开工·⛔push⛔merge 主线·一切改动只交付本工作树）

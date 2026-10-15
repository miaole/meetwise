# ISO-DOTENV-ISOLATION REQUEST — scripts/run-e2e.mjs isolated 形强制跳 .env 回灌微刀（恰 1 tracked 代码文件 ~3 行·E2E_SKIP_DOTENV 语义保持·G7K 诊断排程刀 4·P2·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停→pre-exec 双审两独立外席待派→协调方明示 EXEC 授权后方开工·本 commit 不预 claim 任何 post-commit EXIT·alone≠dual·⛔push⛔merge 主线）

**席位**：ISO-DOTENV-ISOLATION 起草席（G7K 诊断排程刀 4·P2·协调方派·⛔push⛔merge 主线）。
**基线**：`feat/mysql-schema-skeleton` 主线 tip=`0c94d1ec`（fetch 后 `git rev-parse origin/feat/mysql-schema-skeleton` 亲读=`0c94d1ec`·=QBANK-INTEGRITY-CHAIN-EXTEND nail 落卷 commit·**origin tip≥integrity nail 波 tip 恰等下界满足**·origin/main=`c4244470` 为其祖先 `merge-base --is-ancestor` EXIT=0 亲证）· 分支 `line/iso-dotenv-isolation`（建前 `git branch --list "line/iso-dotenv*"` 零命中·本起草席 `git worktree add ../meetwise-idi -b line/iso-dotenv-isolation origin/feat/mysql-schema-skeleton` 亲立·HEAD=`0c94d1ec` 亲证）· 工作树 `meetwise-idi`（仓根同级·新建 worktree **仓根 `.env` ABSENT 天然成立**·`ls .env` No such file 亲证——起草期全部轻门在此树跑·零造 .env）。
**立项出处**：
1. **协调方派单 brief**（2026-10-14·G7K 诊断排程刀 4·P2「ISO-DOTENV-ISOLATION 环境隔离微刀」）：G7K 诊断席环境发现——主仓 `.env`（mtime 10-07·4691B）使任何 isolated 跑默认混入 15+ 键（`APP_RUNTIME_DB_EXPECTED_ROLE`/`NODE_ENV`/`PORT` 等）→ class=worker 伪红（12.2s 早退实录）；基线协议要求 `.env` ABSENT·现需手携 `E2E_SKIP_DOTENV=1` 达基线等价——易漏。修法候选（诊断席提出）：`scripts/run-e2e.mjs:17` 一带增 `E2E_ISOLATED==='1'` 判强制跳 .env auto-load（isolated 形下无论 SKIP_DOTENV 与否一律跳·防环境泄漏伪红）。
2. **环境元数据亲证（本席·非内容）**：主仓工作树仓根 `.env`（即本仓仓外 sibling 主检出树·非本 worktree·untracked 用户文件）**在场** size=4691B mtime=Oct 7 20:49（`ls -la` 亲证·与派单口径逐字吻合）·**内容零读**（.env 本体 Ban 读入卷 Ban 造·§3-7）——「15+ 键/键名清单/class=worker 12.2s」系派单转述（G7K 诊断席实录）·本席以机制面源证承接口径（§1）·键名例证不复核不修饰。
3. **事故机制源证（本席亲读）**：隔离删单（`run-e2e.mjs:28-34`）只删云数据面凭据 20 键+`LANGFUSE_` 命名空间——**不覆盖** `APP_RUNTIME_DB_EXPECTED_ROLE`/`NODE_ENV`/`PORT` 类环境语义键→.env 回灌键可穿透隔离删单直达 api/worker 子进程（worker spawn 无 `PORT` 覆盖·api 有·:124/:129 亲读）→伪红机制链源证成立（§1.1）。
4. **形制范本**：`ai-docs/delivery/harness/e2e-runner-stale-build-guard-REQUEST.md`（§0-§9 全形制·STOP 三处·轻门+源级断言+副本直测合成自证形）·`ai-docs/delivery/harness/cache-observe-repin-REQUEST.md`（门矩阵纪律）。

**必读清单（EXEC 开工前逐件亲读·显式路径）**：`AGENTS.md`（总则+生成前门禁）·本卷·`scripts/run-e2e.mjs` 全文（197 内容行·wc -l 口径）·`scripts/run-e2e-ui.mjs` :24-53（同形 auto-load+隔离段对照面）·`scripts/run-performance-e2e.mjs` :24-41（无钩 auto-load 对照面）·`scripts/run-e2e-isolated.mjs` :2729-2765（inheritedEnv/baseEnv 注入链）·`scripts/g6-e2e-iso-blocked.proof.mjs` :239-260（轻门行为臂）·`scripts/e2e-static-guards.mjs` :35-50/:262/:285（runner 形制守卫）·`ai-docs/delivery/harness/e2e-runner-stale-build-guard-REQUEST.md`（形制范本）。

## §0 现状锚（起草席亲读·file:line/blob 逐条 Read/rg/wc/git rev-parse 实测 @`0c94d1ec`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠复核

- `git branch --list "line/iso-dotenv*"` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | grep -i "iso-dotenv\|dotenv"` 建前零命中→落卷后唯一同名卷=本卷。
- **在飞交叠全支线扫描（本席亲跑·对 `scripts/run-e2e.mjs` 单径·`git log -1 <branch> -- <径>`+`merge-base --is-ancestor` 全本地支线）**：非祖先顶触簇七个——`3424dc19`(2026-09-23·line/*+rv/* 大簇·**HEAD 祖先亲证**)/`ea66b21e`(2026-10-11·含 line/qbank-pipeline-scope 等十支线共指·**HEAD 祖先亲证**)/`e2479961`(2026-10-10·**HEAD 祖先**)/`7da29707`(2026-09-04·**HEAD 祖先**)/`e621235b`(2026-08-18·**HEAD 祖先**)；**真非祖先残枝两簇**=`590be0df`（2026-10-08·`line/g7-boot-intercept`·对径 diff 11 插 36 删·早于基线·旧波残枝）+`c3de7fe6`(2026-08-14·feature/ecs-*·preview-* 远古残枝群·sbg 卷 §0.0 同形登记)。判据沿 cache-observe-repin/sbg §0.0=**对径支线顶触提交日期晚于基线（2026-10-16）方计作在飞触面**——全簇最新 2026-10-11<基线·**零在飞触面**。EXEC 立项日必做重扫：任一支线顶对 `scripts/run-e2e.mjs` 存在基线后新增提交→触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git rev-parse --short=8 0c94d1ec:<path>` 亲算·base=@`0c94d1ec`）

| # | 文件 | base blob | 关键行锚 |
|---|---|---|---|
| 1 | `scripts/run-e2e.mjs` | `17cee8ce`（197 内容行·wc -l） | **:4 头注**（「用法:pnpm e2e:isolated（包装器注入 E2E_ISOLATED=1）」）；:9-11 imports（failure-class/fake-service-flags/live-capability-env·全本地依赖）；:13 `ROOT`（尾带 `/`）；:15 env 测试键默认 5 键单行；**:16-18 三行注释**（:16「加载 .env…不覆盖已设」/:17 REG-FIX 组8b 测试钩/:18 Key-unset 快速失败必达）；**:19 守卫行**（`if (process.env.E2E_SKIP_DOTENV !== '1') {`）；**:20-25 回灌循环**（existsSync→逐行正则 `^([A-Z_][A-Z0-9_]*)=(.*)$`→`!env[m[1]]` 不覆盖已设）；**:27-40 isolated 删单段**（:28-34 凭据 20 键·:35-38 `LANGFUSE_` 命名空间整删·:39 `DATABASE_SSL_MODE='disable'`）；**:41** `if (env.E2E_ISOLATED !== '1') throw tagE2EFailure('capability', 'e2e_isolation_required')`；:42 `assertNoFakeServiceFlags(env)`；:43-47 假服务旗扫描；**:48** `MODEL_API_KEY` 空→`live_provider_key_missing`；:124 api spawn（**extraEnv 含 `PORT` 覆盖**）；:129 worker spawn（**extraEnv 无 `PORT` 覆盖**·`E2E_REPORT_FAIL_ALL:'1'`）；:175 e2e client spawn |
| 2 | `scripts/run-e2e-ui.mjs` | `3ceb6f14`（312 行） | :24-26 三行注释与 #1 :16-18 **逐字同构**；:27 守卫行同构；:28-33 回灌循环同构；:35-45 isolated 删单段（凭据 17 键·无 QBANK_CONTROL 双键）；:46 `e2e_ui_isolation_required` throw；:53 `MODEL_API_KEY` 检查——**独立 runner·不经 #1**（§1.3 波及面） |
| 3 | `scripts/run-performance-e2e.mjs` | `edfcc96f`（124 行） | **:24-29 无钩 auto-load**（无任何 E2E_SKIP_DOTENV 判·恒回灌）；:30-40 isolated 删单段；:41 `performance_e2e_isolation_required` throw——同伪红类·**本刀零触·承登后继刀**（§3-3） |
| 4 | `scripts/run-e2e-isolated.mjs` | `0787a7ff` | :2729 `const inheritedEnv = { ...process.env };`；:2730 注释「must never load a developer `.env`」——**包装器自身零 .env 读取**；:2732-2755 云凭据删单；:2757-2764 `baseEnv = { ...inheritedEnv, E2E_ISOLATED: '1', E2E_TEST_CONTAINER, E2E_TEST_TARGET_TOKEN, DATABASE_SSL_MODE:'disable', PGHOST/PGUSER/PGPASSWORD/PGDATABASE }`（:2758 `E2E_ISOLATED: '1'`）——**E2E_ISOLATED 唯一 wrapper 注入点**·**不注 E2E_SKIP_DOTENV** |
| 5 | `scripts/g6-e2e-iso-blocked.proof.mjs` | `bdaf6007` | :239 臂注「Lightweight behavior: direct runner fail-closed (**no isolated docker**)」；:243-245 注入 `{ ...process.env, E2E_ISOLATED: '1', E2E_SKIP_DOTENV: '1' }`+`delete env.MODEL_API_KEY`；:246 起 spawnSync 直跑 #1·:257 起 同形直跑 #2→断言非零+`live_provider_key_missing`——**SKIP_DOTENV 语义的行为门**（轻门·免 docker·本席改前基线 EXIT=0 亲跑） |
| 6 | `package.json` | `3b04b871` | :341 `e2e:prove`→`node scripts/run-e2e.mjs`；:342 `e2e:ui`→`node scripts/run-e2e-ui.mjs`；:343 `e2e:isolated`→`node scripts/run-e2e-isolated.mjs e2e:prove`；:344 `e2e:ui:isolated`→同包装器 `e2e:ui`；:349 `e2e-isolation:prove`；:357 `g6-e2e-iso-blocked:prove` |
| 7 | `scripts/e2e-static-guards.mjs` | `01127803` | :36-39 `REQUIRED_E2E_RUNNER_PATHS` 含 #1/#2/#4；:49-50 fake-service 守卫扫描面含 #1/#4；:262/:454 runner 集正则——本刀守卫行单行替换**零触**这些锚（import/call/文件集零变） |
| 8 | `scripts/capture-screenshots.mjs` | `175998af` | :20-21 无钩 auto-load 同构——**非隔离门工具**·本刀零触·登记面 |
| 9 | `receipts/e2e-assert-refresh/diag-expert-region.mjs` | `98c8160b` | :31 `env.E2E_SKIP_DOTENV = '1'`——SKIP_DOTENV 第三消费点（诊断收据脚本）·修法下语义不变（skip 仍 skip） |
| 10 | `scripts/ai-docs/public-text-policy.mjs` | `b7281d11` | :96 `MAX_FILES = 2_176`（cap=sanction `1824b2d9`）·本刀零自升 |
| 11 | 迁移链 | 204 文件·头 `0204_ai_cost_cached_input_price.sql` | 本刀**零迁移**·链深对届时实测 |

### 0.2 口径登记（派单/上游口径漂移如实改正·问=答）

1. **「15+ 键/键名/class=worker 12.2s 伪红」数字口径**：派单 brief 转述 G7K 诊断席实录·本席未复核主仓 `.env` 内容（**内容零读=Ban 面纪律**）·未实跑隔离全栈（est live=0 纪律）——本刀判据为**机制形**（回灌守卫不识 isolated 形→.env 键穿透删单；删单不覆盖环境语义键；worker 无 PORT 覆盖 :129 亲读）·不锚定具体键数/键清单/时长·诊断叙事仅作立项出处存档。主仓 `.env` 在场性（4691B/mtime Oct 7 20:49）系元数据级亲证。
2. **「run-e2e.mjs:17 修法落点」问=定稿答**：派单锚 :17 系注释行（REG-FIX 组8b 测试钩说明）；**守卫本体在 :19**（:17-18 为其注释）——修法定稿=**:19 守卫行增第二判 + :18/:19 间增两行注释**（§1-修法·内容锚定位·行号漂移以 rg 定位）。
3. **cap 现值**：2176（sanction `1824b2d9`·public-text-policy.mjs :96）·起草基线树 `node scripts/ai-docs/check-docs.mjs` EXIT=0 **scanned 2161** 本席亲跑——落卷后对届时树实测（+本卷 1 预期 2162≤2176 ✓ 余量 14·cap sanction 权归协调方·Ban 自升）。
4. **runner 直测形态亲证（轻门可行性与边界）**：①`node scripts/run-e2e.mjs`（无 E2E_ISOLATED）→EXIT=1 `E2E_FAILURE class=capability code=e2e_isolation_required`（:41·**load 块 :19-26 已执行后**才 throw——非 isolated 形仅此 fail-closed 早退面可达）；②`env -u MODEL_API_KEY E2E_ISOLATED=1 node scripts/run-e2e.mjs`（本 worktree·`.env` ABSENT）→EXIT=1 `E2E_FAILURE class=provider code=live_provider_key_missing`（:48·**零子进程 spawn**·20s 内秒级早退）——两臂均本席改前亲跑·**隔离形轻门免 docker 成立**（g6 :239 同判）。③「isolated+.env 在场」直测不可行：本 worktree `.env` ABSENT·主仓 `.env` 不可复制不可造（§3-7 Ban）——该形新语义由源级字节锚+副本真值表+守卫恒等式机械承载（§2-2 臂 C·副本强度局限如实登记=副本≠import）。
5. **`env.E2E_ISOLATED` vs `process.env.E2E_ISOLATED`（守卫拼写）问=定稿答**：:15 默认键单不含 `E2E_ISOLATED`·:19 时点 .env 未读→`env.E2E_ISOLATED === process.env.E2E_ISOLATED` **恒等**（浅拷贝）·两拼写行为全等；定稿取 `env.` 形=与 :27/:41 隔离合同同源同写（读本刀判据面同一变量·防双源漂移）。
6. **哨兵对照对（起草席 /tmp 实证·仓树零触·`/tmp/idi-verify2` 临时副本+临时哨兵 .env=`E2E_FAKE_MODEL=1`+`MODEL_API_KEY=dummy-idi-probe` 两行·依赖文件同布局随拷）**：同形（isolated·无旗·哨兵 .env 在场·ROOT 恒等）下——**旧码**（`17cee8ce` 原样副本）→裸崩 `Error: fake_service_mode_forbidden:E2E_FAKE_MODEL`（:42·**哨兵键穿透隔离形直证=诊断席伪红机制操作级复证**）；**修法套用副本**（本卷 fenced 块字节级套用·node --check PARSE-OK·diff 恰 4 行=+3/−1）→分类失败 `e2eFailure: { class: 'provider', code: 'live_provider_key_missing' }`（**.env 整体未回灌直证**·若回灌必因哨兵 `E2E_FAKE_MODEL` 报 fake_service_mode_forbidden）；携旗格（isolated+SKIP）与非 isolated 格两臂同跑全原样——真值表四格行为级全证·**副本强度局限如实登记**（/tmp 副本≠仓树 import·EXEC 期以 §2-2 自证一/三对仓树承载）。

## §1 红事实（读码定稿·机制链·全部亲证 @`17cee8ce`/`3ceb6f14`/`edfcc96f`/`0787a7ff`·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 伪红机制链（回灌守卫不识 isolated 形）

- **环 1（隔离合同·:41）**：`if (env.E2E_ISOLATED !== '1') throw … 'e2e_isolation_required'`——runner **de-facto isolated-only**（包装器注入或 shell 直注·否则 :41 fail-closed）。「非 isolated 形」仅 :19-26 load 块已执行后的 :41 早退面可达（§0.2-4①亲证）。
- **环 2（回灌守卫·:19）**：`if (process.env.E2E_SKIP_DOTENV !== '1')`——判据**只识 SKIP_DOTENV 单旗·不识 E2E_ISOLATED**：isolated 形默认（不携 SKIP_DOTENV）**必回灌**仓根 `.env`（:20-25·正则逐行·`!env[m[1]]` 不覆盖已设=填充一切 shell/包装器未设键）。
- **环 3（删单盲区·:28-34）**：isolated 删单覆盖云数据面凭据 20 键+`LANGFUSE_` 命名空间——**环境语义键不在删单**（`APP_RUNTIME_DB_EXPECTED_ROLE`/`NODE_ENV`/`PORT`/G7 旗等类）→.env 回灌的此类键**穿透删单**驻留 env。
- **环 4（子进程继承·:124/:129/:175）**：api/worker/e2e client 全以 `{ ...env, ...extraEnv }` spawn——api 有 `PORT` 覆盖（:124）·**worker 无**（:129）→worker 进程可见 .env 回灌 `PORT` 及其余穿透键。派单口径：隔离跑混入 15+ 键→class=worker 伪红（12.2s 早退实录）——机制链环 2→3→4 源证成立·伪红表现面系转述存档（§0.2-1）。
- **环 5（包装器零污染·:2729-2730 亲证）**：`run-e2e-isolated.mjs` 自身**不读 .env**（inheritedEnv 仅取 shell·注释明示 must never load a developer `.env`）→泄漏向量**唯一**=子 runner :19-26 auto-load。修法落点唯一性源证成立。
- **环 6（现 mitigations=手携旗·易漏）**：现基线协议要求 `.env` ABSENT；主仓 `.env` 在场时达等价须手携 `E2E_SKIP_DOTENV=1`（g6 门 :245 同形）——人工记忆面·易漏=派单定 性。修法后 isolated 形**自足防泄漏**（无论携旗与否一律跳）。

### 1.2 E2E_SKIP_DOTENV 现语义（全仓三消费点·亲证）

- **守卫点**：`run-e2e.mjs:19`+`run-e2e-ui.mjs:27` 同构（`!== '1'` 即回灌·`='1'` 即跳·**默认零变**语义=不设旗行为与无 .env 等价）。
- **行为门**：`g6-e2e-iso-blocked.proof.mjs:243-260`（REG-FIX 组8b·isolated+SKIP+无 Key→`live_provider_key_missing` 必达断言·免 docker 轻门·本席基线 EXIT=0 亲跑）。
- **诊断脚本**：`receipts/e2e-assert-refresh/diag-expert-region.mjs:31`（设旗跳回灌）。
- **语义保持判据（修法约束）**：修法只**增** isolated 形跳过臂·**不改** SKIP_DOTENV 本身语义——非 isolated 形四态真值表逐格不变（§2-2 臂 C）；isolated+SKIP 形行为不变（仍跳·g6 门逐字保全）。

### 1.3 波及面定稿（读码问答·EXEC 与双审必读）

- **问：e2e:ui 入口也走 run-e2e.mjs 吗？答：不走。** `package.json:342` `e2e:ui`→`scripts/run-e2e-ui.mjs` **独立 runner**·自带 :24-34 逐字同构 auto-load 段+:35-46 隔离段；`e2e:ui:isolated`（:344）经同一包装器注入 `E2E_ISOLATED='1'` 后直跑 run-e2e-ui.mjs。**派单修法面=恰 1 文件（run-e2e.mjs）→ run-e2e-ui.mjs 同形段本刀零触**·其 isolated 形仍需手携 SKIP_DOTENV 方免回灌——**同形残留面如实承登**（§3-3·后继刀候选·非本刀遗漏洞=现行为零变）。
- **同族残留面全录**：`run-performance-e2e.mjs:24-29`（无钩恒回灌·:41 隔离门）·`capture-screenshots.mjs:20-25`（非隔离门工具）——均本刀零触·登记后继刀候选池。
- **包装器其他目标**（neg:* proofs/`isolated-env:prove` :349/sole-stack 族）：子进程经 baseEnv 一律 `E2E_ISOLATED='1'`·其子 runner 若为 run-e2e.mjs 即受本刀语义惠及；其余子进程不受 :19 守卫面影响。
- **直接 shell 入口**：`E2E_ISOLATED=1 node scripts/run-e2e.mjs`（g6 :245/probe 同形）→本刀语义同惠及。

## §1.3 候选否决登记（防 EXEC 期重开）

- **候选甲（否决）=删主仓 `.env`**：用户文件（untracked·gitignored·本机配置面）——Ban 动用户仓外资产（§3-7）·且治标（.env 重生即复发）·否决。
- **候选乙（否决）=换/引 dotenv 库统一解析**：+依赖+解析语义面（注释/export 行/引号形）漂移风险·越 1 文件界（package.json+lockfile）·且现正则形三 runner 一致系既成合同·否决。
- **候选丙（否决）=同刀扩修 run-e2e-ui.mjs/run-performance-e2e.mjs/capture-screenshots.mjs 同形段**：破「恰 1 tracked 代码文件」派单面——同形残留承登后继刀（§3-3）·否决。
- **候选丁（否决）=包装器 baseEnv 注 `E2E_SKIP_DOTENV:'1'`**（run-e2e-isolated.mjs :2758 一带）：触第二文件+语义混淆（SKIP_DOTENV 变 isolated 隐含旗·其「非 isolated 默认零变」独立语义被吞）+g6 门 :245 注入形失去独立意义·否决。
- **候选戊（否决）=隔离删单扩键**（:28-34 增 `APP_RUNTIME_DB_EXPECTED_ROLE`/`NODE_ENV`/`PORT` 等）：逐键打地鼠（新环境键再漏需再改删单·永恒追赶）·且 `PORT` 类键有 extraEnv 覆盖面耦合（:124 有 :129 无）·根因面（守卫不识 isolated 形）不动·否决。
- **候选己（否决）=修法落 run-e2e-isolated.mjs（包装器层统一）**：包装器子进程面含非 run-e2e.mjs 的多样目标（proofs/sole-stack）·其在 :19 守卫面之外·包装器层一刀切属越界面扩张；子 runner 守卫缝=最小机械面·否决。

## §1-修法（恰 1 tracked 代码文件 1 编辑·**以下定稿文本 ⛔ 不得更改——EXEC 逐字节照抄·Ban 自由发挥**·行号系起草基线锚·并线漂移以内容锚 rg 定位·禁按行号自上而下套用）

- **唯一编辑（`scripts/run-e2e.mjs`·:18 与 :19 之间插两行注释 + :19 守卫行整行替换·numstat 预估 +3/−1 对届时实测）——改前**：
```js
// Key-unset 快速失败(live_provider_key_missing)在任何宿主形态(仓根 .env 存/缺)必达,不被 .env 静默绕过。
if (process.env.E2E_SKIP_DOTENV !== '1') {
```
**改后**：
```js
// Key-unset 快速失败(live_provider_key_missing)在任何宿主形态(仓根 .env 存/缺)必达,不被 .env 静默绕过。
// ISO-DOTENV-ISOLATION:isolated 形(E2E_ISOLATED=1)无论 E2E_SKIP_DOTENV 与否一律跳 .env 回灌——主仓 .env 在场时其环境语义键(APP_RUNTIME_DB_EXPECTED_ROLE/NODE_ENV/PORT 类)穿透隔离删单(:28-34 只删云凭据)漏入 api/worker 子进程=伪红源(G7K 诊断席环境发现);包装器 baseEnv 已供隔离全套 env,隔离形零回灌需求。
// E2E_SKIP_DOTENV 语义保持:非 isolated 形仍按原钩跳过(默认零变·g6-e2e-iso-blocked 行为门语义不变)。
if (process.env.E2E_SKIP_DOTENV !== '1' && env.E2E_ISOLATED !== '1') {
```
- **守恒断言**：:16-18 三行注释零字节；:20-26 回灌循环体零字节；:27-40 删单段/:41 隔离 throw/:42 fake flags/:48 key throw 零字节；:124/:129/:175 spawn 面零字节；`assertNoFakeServiceFlags` import(:10)/call(:42) 恒在（static-guards :49-50 合同）；`E2E_ISOLATED`/`E2E_SKIP_DOTENV`/`live_provider_key_missing`/`e2e_isolation_required` 词面恒在；新增注释零敏感词（token/Authorization/audioBase64/contentBase64/MODEL_API_KEY/PAY_PROVIDER_SECRET/AUTH_SECRET/KEY 字面值·secret-redaction LOG_LEAK 判据形）；diff 面恰 1 tracked 代码文件=`scripts/run-e2e.mjs`（+3/−1 对届时 numstat 实测）+本卷 .md 新增（EXEC turn 计数形沿 cache-observe-repin §2-13）。
- **行为语义登记（非偏离·本刀明示语义）**：①真值表四态——(SKIP=0,ISO=0)→回灌（原样）；(SKIP=1,ISO=0)→跳（原样）；(SKIP=0,ISO=1)→**跳（本刀新语义·唯一翻转格）**；(SKIP=1,ISO=1)→跳（原样）——四格中三格逐字节原行为·一格新语义即本刀全部交付面；②ISO 判取 `env.E2E_ISOLATED`（与 :27/:41 同源·§0.2-5 恒等证）；③`E2E_ISOLATED` 从 .env 回灌自举的病态形（shell 未设+.env 设 `E2E_ISOLATED=1`）修法前后行为不变（:19 时点 env 尚无该键·回灌照走·:27 起删单照跑——修法判据在回灌前读 env 拷贝·语义面零触）；④run-e2e-ui.mjs/run-performance-e2e.mjs/capture-screenshots.mjs 三同形面行为零变（§1.3 残留承登）。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵·**数字口径以实跑实测为准+偏差熔断**·命令原样可复制）

0. **改前基线 run（必做·并主线后改前树）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0（起草基线 scanned **2161** 亲跑≤2176）+ `node scripts/e2e-static-guards.mjs` EXIT=0（起草基线 runners=6 helpers=21 flags=9 aiPaths=6 亲跑）+ `pnpm g6-e2e-iso-blocked:prove` EXIT=0（起草基线亲跑·免 docker 轻门）——基线任一红→停（现场漂移类）。
1. **isolated 形零回归行为门（必做·免 docker 轻门）**：`pnpm g6-e2e-iso-blocked:prove` EXIT=0——g6 :245 臂（isolated+SKIP+无 Key→`live_provider_key_missing`）在改后树仍绿=修法下 isolated+SKIP 形逐字节原行为的行为级直证（SKIP+ISO 双旗格·真值表①④格行为级承载）。
2. **修法三件合成自证（必做·环境无关·副本强度局限如实登记=副本≠import·真值表机械性由源级字节锚承重）**：
   - **自证一·源级守卫字节锚（对真文件·防判据被静默摘除/拼错）**：
```bash
node -e '
const fs = require("node:fs");
const src = fs.readFileSync("scripts/run-e2e.mjs", "utf8");
const checks = [
  ["guard-two-disjuncts", src.includes("if (process.env.E2E_SKIP_DOTENV !== \x271\x27 && env.E2E_ISOLATED !== \x271\x27) {")],
  ["iso-comment-face", src.includes("ISO-DOTENV-ISOLATION")],
  ["skip-token-kept", src.includes("E2E_SKIP_DOTENV")],
  ["legacy-load-loop-kept", src.includes("existsSync(ROOT + \x27.env\x27)") && src.includes("!env[m[1]]")],
  ["iso-strip-kept", src.includes("e2e_isolation_required") && src.includes("LANGFUSE_")],
  ["fake-flags-contract", src.includes("assertNoFakeServiceFlags")],
  ["ui-runner-untouched-by-this-knife", fs.readFileSync("scripts/run-e2e-ui.mjs", "utf8").includes("if (process.env.E2E_SKIP_DOTENV !== \x271\x27) {")],
];
const bad = checks.filter(([, ok]) => !ok);
if (bad.length) { console.error("SELF-PROBE-1 FAIL: " + bad.map(([n]) => n).join(",")); process.exit(1); }
console.log("PASS source-level guard assertions " + checks.length + "/" + checks.length);
'
```
   - **自证二·守卫真值表副本直测（四态·唯一翻转格断言）**：
```bash
node -e '
const skipLoad = (SKIP, ISO) => !(SKIP !== "1" && ISO !== "1") ? "skip" : "load";
const t = [
  [skipLoad("0", "0"), "load"],  // 非 isolated·无旗 → 回灌（原样）
  [skipLoad("1", "0"), "skip"],  // 非 isolated·携旗 → 跳（原样·SKIP 语义保持格）
  [skipLoad("0", "1"), "skip"],  // isolated·无旗 → 跳（本刀唯一新语义格）
  [skipLoad("1", "1"), "skip"],  // isolated·携旗 → 跳（原样·g6 门格）
];
const bad = t.filter(([got, want]) => got !== want);
if (bad.length) { console.error("SELF-PROBE-2 FAIL: " + JSON.stringify(bad)); process.exit(1); }
console.log("PASS truth-table 4/4 (single flipped cell: iso,no-skip -> skip)");
'
```
   - **自证三·runner 直跑双臂 fail-closed（改后树·本 worktree `.env` ABSENT 形）**：`node scripts/run-e2e.mjs` →EXIT=1+输出含 `code=e2e_isolation_required`（非 isolated 形早退面原样）；`env -u MODEL_API_KEY -u E2E_SKIP_DOTENV E2E_ISOLATED=1 node scripts/run-e2e.mjs` →EXIT=1+输出含 `code=live_provider_key_missing`（isolated·无旗·无 Key→key-unset 快速失败必达·零 spawn 秒级早退·g6 :239 同判）——任一臂 EXIT/码面不符→触停止条件「机制不满足」。**「isolated+.env 在场」直测不可行**（§0.2-4③·Ban 造 .env）·该形由自证一+自证二机械合成承载·局限如实登记。
3. **非 isolated 形 SKIP_DOTENV 行为不变（必做）**：自证二真值表①②格 + 自证三臂一（:41 早退面零变·load 块在 :41 前行为面不变）+ 自证一 `skip-token-kept`/`legacy-load-loop-kept` 锚——三证合成·SKIP_DOTENV 独立语义（非 isolated 默认零变）零触直证。
4. **静态邻面守卫**：`node scripts/e2e-static-guards.mjs` EXIT=0（runner 形制+fake-service import/call 合同在改后树仍绿）。
5. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached·对届时实测）。
6. **lint**：`pnpm turbo lint` EXIT=0 全域 0 errors·五值对届时实测（起草参照=sbg 卷门 6：web 601/root 5235/api 1421/worker 954/ai-runtime 628·漂移如实登记·非本刀面所致方可）。
7. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·**scanned≤cap 2176**（起草基线 2161 亲跑·落卷后对届时树实测·**>2176 红停上报**·cap sanction 权归协调方·Ban 自升）。
8. **markers 五类零命中**：改动集（起草 turn=本卷 1 .md；EXEC turn=本卷 .md+run-e2e.mjs 两件）五类标记词 grep 零命中（`scripts/i6-239-gates.proof.mjs` §2-7 运行时组装口径·词面不复抄卷内防自匹配·命令与回执入收据）。
9. **diff 面机检+卫生**：`git diff --numstat <base>`（`<base>` 钉明=届时主线 tip=EXEC 工序 1 并线 merge 第二亲——防对起草基线 union diff 连他件假停·沿 cache-observe-repin §2-13 rev2 形）·**EXEC turn 恰 2 tracked 路径=①代码面恰 1 tracked 修改=`scripts/run-e2e.mjs`（派单「恰 1 tracked」所指·预估 +3/−1 实测为准）+②本卷 .md（卷宗本体计数形）**——多任何其余 tracked 路径即停；起草 turn 本 commit 恰 1 tracked 新增=本卷 .md（门矩阵 code 面 run 属 EXEC 工序③）；`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改（新建 worktree node_modules ABSENT 修复·沿 qbank-scope-fix/sbg EXEC 先例）；`.env*` ABSENT 双向记录（本 worktree 天然 ABSENT·**Ban 自主仓复制**）；`actualSpendCny=null`；est live=0。
10. **副效应登记**：typecheck/lint 门可能翻动 `apps/web/tsconfig.tsbuildinfo`（tracked 构建状态件）——`git checkout` 回滚保门 9 恰数（沿 cache-observe-repin/sbg §9 先例·非交付面）；`.next/`·`.tmp/` 均 gitignored 不入 diff。

## §3 范围外（边界清单·越界即 FAIL）

1. **prove 断言面全 Ban**：一切 `*.proof.ts`/`*.proof.mjs`/prove 脚本零字节——本刀零断言改动·自证三件系 ad-hoc node 副本/直跑探针**不入树**（命令仅入本卷面·Ban 新增任何 tracked 测试/证明文件）。
2. **产品码全 Ban**：`apps/*` src·`packages/*` src 零字节。
3. **同形残留面零字节（承登后继刀候选池·非本刀修）**：`scripts/run-e2e-ui.mjs`（:27-34 同构 auto-load）·`scripts/run-performance-e2e.mjs`（:24-29 无钩 auto-load）·`scripts/capture-screenshots.mjs`（:20-25 无钩）·`scripts/run-e2e-isolated.mjs`（包装器零触）——四文件零字节。
4. **CI/workflow/pnpm scripts 零改**（package.json 零字节）·零 .gitignore 改。
5. **共享 SSOT 零改**：LEDGER/checklist/backlog/north-star 只读（本刀无批表行·行翻面权归协调方；gap-bug-backlog G7K 系行状态零触）。
6. **零迁移零 DDL**（§0.1 #11）·零依赖升级·零 cap 自升（§2-7）。
7. **`.env` 本体全 Ban**：Ban 读主仓/任何 worktree `.env` 内容入卷入据·Ban 造/复制/删任何形态 `.env`（含主仓用户文件=候选甲否决面）·Ban 写 Key 值入树入据——基线协议 `.env` ABSENT 面以本 worktree 天然 ABSENT 承载·主仓在场事实仅元数据级登记（§0.2-1）。

## §4 依赖

**①上游**：无（自足小刀·基线=origin tip `0c94d1ec` 已含全部前置·零跨卷语义依赖；G7K 诊断席发现系派单输入非在卷依赖）。
**②无同文件并发**：§0.0 全支线扫描=零在飞触面（非祖先残枝两簇全早于基线·登记在卷）·EXEC 立项日必做重扫。
**③迁移号**：预期零（§0.1 #11）。
**④下游**：EXEC 绿→post 双审→nail 归协调方；「isolated 形必手携 SKIP_DOTENV」人工记忆面随本刀闭合·主仓 `.env` 在场与基线协议 ABSENT 的等价性由 runner 自足保证；同形残留面（§3-3 三文件）留后继刀候选池·处置权归协调方。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban merge 主线（本席⛔·并线归 EXEC 工序）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban 翻 pins（§5 十一值+`actualSpendCny=null`·零翻转）；Ban 自由发挥定稿文本（§1-修法 ⛔ 条款）；Ban 新增 tracked 测试/证明文件（§3-1）；Ban 触同形残留面/包装器/产品码/proof 面/package.json（§3-2/3/4）；Ban 读 `.env` 内容/Ban 造·复制·删任何 `.env`（§3-7·候选甲否决面）；Ban 引 dotenv 库/换解析实现（候选乙否决面）；Ban 包装器注旗（候选丁否决面）；Ban 隔离删单扩键（候选戊否决面）；Ban 弱化 :41 隔离 throw/:48 key 快速失败语义；Ban 触共享 SSOT/批表行翻面/G7K 系行状态（§3-5）；Ban 迁移 Ban DDL Ban 依赖升级 Ban cap 自升（§3-6/§2-7）；Ban retry-to-green（门矩阵任一门红不重跑冲销·如实登记升级）；Ban 就地归因邻面新红（§2 任一门红根因不在本刀面→停·Ban 借机修）；Ban 触其他工作树（含主仓 `.env` 所在树）；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑隔离全栈零模型外呼零 Key 加载零生产操作零 secrets 零消耗（读码+轻门+docs:check+探针全离线·runner 直跑双臂均秒级 fail-closed 早退零 spawn·§0.2-4 亲证）。EXEC 期：门矩阵十门全免 docker 免 Key（g6 轻门 :239 设计+自证三直跑臂同判）——est live 仍按「零模型外呼新增」口径=0·实跑如有如实登记收据。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·五类词沿 `scripts/i6-239-gates.proof.mjs` §2-7 运行时组装口径·词面不复抄卷内防自匹配——沿 sbg/negbend/g7w/authz 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1 红事实结论与 §5 Ban/pins 与 §1-修法定稿文本面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠重扫必做）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 `run-e2e.mjs` blob 对 `17cee8ce` 漂移·关键行锚（:16-19 注释+守卫带/:27-41 删单+隔离 throw 段）漂移·§0.0 重扫出新非残枝在飞触面·门 0 基线在改前树红→停·重 pin 回炉。
- **机制不满足**：门 1 g6 改后树红·自证一字节锚任一 FAIL·自证二真值表任一格 RED·自证三双臂任一臂 EXIT/码面不符→证伪诊断→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。
- **越界需要**：修法诉求超出恰 1 tracked 代码文件面（需触 run-e2e-ui.mjs/run-performance-e2e.mjs/run-e2e-isolated.mjs/capture-screenshots.mjs/proof/产品码/package.json/.gitignore/`.env` 本体）→停·另刀或协调方裁决（§1.3 候选甲/乙/丙/丁/戊/己沿承·同形残留面后继刀候选池）。
- **验收红不可修**：门矩阵任一门红且根因不在本刀交付面（邻面新红/lint 漂红/docs:check>2176）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

**STOP · `draft:awaiting_pre_exec_dual` · 起草落卷即停 · pre-exec 双审两独立外席待派 · nail/批表/行翻面权归协调方 · alone≠dual · ⛔push⛔merge 主线**

---

*ISO-DOTENV-ISOLATION REQUEST · 2026-10-14 起草落卷 · **`draft:awaiting_pre_exec_dual`（起草席落卷即停·pre-exec 双审待派·协调方 EXEC 授权前码面零触）** · base 主线 tip `0c94d1ec`（=QBANK-INTEGRITY-CHAIN-EXTEND nail·origin tip≥integrity nail 波 tip 恰等下界亲证）· 分支 `line/iso-dotenv-isolation` · 工作树 `meetwise-idi`（本起草席立·仓根 `.env` ABSENT 天然）· 立项出处=G7K 诊断席环境发现（主仓 `.env` 4691B/mtime Oct 7 在场元数据亲证·内容零读·isolated 跑混入 15+ 环境语义键→class=worker 伪红 12.2s 转述存档·基线协议 ABSENT 等价需手携 E2E_SKIP_DOTENV=1 易漏）+协调方派单 brief（G7K 诊断排程刀 4·P2）· 读码定稿=回灌守卫 `run-e2e.mjs:19` 只识 SKIP_DOTENV 不识 E2E_ISOLATED（:16-18 注释带/:20-25 回灌循环/:27-40 删单盲区/:41 隔离 throw/:48 key 快速失败·:124/:129 worker 无 PORT 覆盖）+SKIP_DOTENV 全仓三消费点（:19 守卫/g6 :243-245 行为门/diag-expert-region :31）+E2E_ISOLATED 唯一 wrapper 注入点 `run-e2e-isolated.mjs:2758`（包装器自身零 .env 读取 :2729-2730=泄漏向量唯一性源证）+**波及面定稿=e2e:ui 独立 runner 不走 run-e2e.mjs**（run-e2e-ui.mjs :27-34 同构段/run-performance-e2e.mjs :24-29 无钩段/capture-screenshots.mjs :20-25 三同形残留承登后继刀）· 修法=恰 1 tracked 代码文件 1 编辑 +3/−1（:19 守卫增 `env.E2E_ISOLATED !== '1'` 第二判+两行注释·真值表四态三格原样一格新语义·SKIP_DOTENV 语义保持·候选甲删用户 .env/乙换 dotenv 库/丙同刀扩修/丁包装器注旗/戊删单扩键/己包装器层修全否决在卷）· 门矩阵十门承卷（改前基线三件亲跑绿+g6 isolated 轻门+自证三件合成[字节锚/真值表/直跑双臂]+非 isolated SKIP 语义不变三证+static-guards+typecheck+lint 五值+docs:check≤cap 2176+markers+diff 恰 1 tracked 代码面+卫生）· 迁移零（链头 0204）· est live=0 · markers=0 · pins 十一值照抄零翻 · 停止条件四类 · Ban self-approve · alone≠dual · ⛔push⛔merge 主线 · STOP*

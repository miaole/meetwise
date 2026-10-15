# PERFLOAD-ENV-FIX REQUEST — uc018:perf-load:prove 恒红环境根因刀（oxc-resolver linux 原生绑定缺装·安装面声明式修·恰 1 配置文件·perfload-env-fix 战役·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs-only REQUEST · 本 commit 恰 1 .md · Ban coding · Ban prove · Ban push · pre-exec dual BOTH PASS 后由协调方明示 EXEC 授权 · Ban self-approve · alone ≠ dual · 本 commit 不预 claim 任何 post-commit EXIT）

**席位**：perfload-env-fix 起草席（诊断+起草双责·协调方派·工作树本席亲立）。
**基线**：`feat/mysql-schema-skeleton` @ `156dd977`（PERF-PREP nail 收官 SSOT commit·本树亲证：docs:check **2122**≤cap 2128 EXIT=0·migrate 链 **202** 头 `0202_interview_event_kind_score_card_written.sql` `ls` 亲数）· 分支 `line/perfload-env-fix`（建前 `git branch --list "line/perfload*"` 零命中·本席 `git worktree add ../meetwise-ple -b line/perfload-env-fix feat/mysql-schema-skeleton` 亲立·fetch 后以 origin tip `156dd977` 为基·HEAD 落点亲证）· 工作树 `meetwise-ple`（仓根同级）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：
- ①5E nail SSOT STILL OPEN 在案登记：`ai-docs/delivery/execution-master-checklist.md:2756` ①「perf-load oxc 环境红（ⓜ caps API 子进程 oxc-resolver `@oxc-resolver/binding-linux-arm64-gnu` 原生绑定缺失崩·容器环境基建面·非断言非产品行为·冻结阈值门未走到断言层·环境面修复归后继）」+ `:2755` ⓜ 基线红在册复现登记 + `:1122` attempts 台账 `1,0,0,0` 先例协议（attempt-1 env 层缺陷如实归因·非可达性类·attempts 2/3/4 全过·红不弃单不洗）。
- ②5E REQUEST 红签名登记：`ai-docs/delivery/harness/5e-behavior-REQUEST.md:302`（同模态同红逐字节 diff 口径）+ `:316`（ⓜ 基线同红在册不洗）。
- ③先例收据：`receipts/archive/2026-09-batch23/receipts/2026-10-07-gap-perf-container-reachability-fix-prove.md`——`:26` attempt-1 模块加载期崩溃归因 + `:28-:37` supportedArchitectures **untracked 实验形**（attempts 2/3/4 全绿=临时形在场证·事后按设计还原=恒红复现的结构性证据）。
- ④复红实证：`receipts/archive/2026-09-batch23/reviews/REQUEST-2026-10-06-c-perf-teardown-condition-residual-post-mw-rag-route.md:69`（fresh worktree `pnpm install --frozen-lockfile` 后直跑同签名红=不可持久面实锤）。
- ⑤外科补包先例（本刀否决候选乙的先例依据）：`receipts/ha-2/exec-receipt.md:67` + `receipts/ha-3/exec-receipt.md:36`（宿主 node_modules 外科式补 linux 包·darwin 共存零破坏实证）。
- ⑥协调方派单 brief（2026-10-14·PERFLOAD-ENV-FIX 战役·诊断四问+REQUEST §1/§2/§5 指派·⛔push ⛔改产品码 docs-only）。
- ⑦必读清单（EXEC 立项前全读）：`AGENTS.md`（总原则+P0 fail-closed 测试门）· `ai-docs/meta/index.md` · 本卷 · 形制范本 `ai-docs/delivery/harness/negbend-fix-REQUEST.md`（§0-§9 全形）· 触面扩展时 `ai-docs/rules/backend/README.md`。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/sed/Read/git hash-object 实测 @`156dd977`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

> **EXEC 重 pin 记录（2026-10-14·pre-exec 双审 BOTH PASS+协调方 EXEC 授权后·对 `b827d1d8`=本线并 `feat/mysql-schema-skeleton`@`3559c5c9` 后 tip 亲证）**：§0.1 全部 8 锚 blob 逐字恒等（`8ac5f942`/`3b04b871`/`c63259c0`/`e69e317a`/`910ff4f8`/`e69420d4`/`af9c3f38`/`bf1af79e`）·master-checklist `:1122`/`:2755`/`:2756` 三锚行号零漂·结论零翻。行号漂移恰 1 处如实改锚：capped-child `--cpus/--memory` 实锚 **`:130-:131`**（起草卷误记 `:137-:138`——该两行实为 `-w`/`-u` 参数·`--cpus`/`--memory` 在 create 数组首两参位 `:130-:131`·表已更）。§0.0 在飞交叠复核亲证：全部 worktree 在飞 `line/*` 分支对 `pnpm-workspace.yaml` 在 `156dd977..branch` 零命中（`feature/*` 旧预览历史分支非在飞·`c3de7fe6` 非 `156dd977` 祖先不属本仓在飞面）。双审 P2 四项随 pin 落：①capped-child 锚 `:130-:131`（本表已更）②候选丁臂数改「八十余脚本（api 89 实测）」（§1.4 已更·api package.json 全 script 键亲数 89）③「run-e2e-isolated 门矩阵内唯一」+HA compose 族旁注 ha-3 `:36`（§1.2 已增）④成本登记行入收据模板（§1-修法 件④ 已增）。

### 0.0 防重双对表

- 本席建树后 `git worktree list` 无第二 perfload 同名树；`git branch --list "line/perfload*"` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | rg perfload` 建前零命中→落卷后唯一同名卷=本卷。
- **在飞交叠复核规则（EXEC 立项日必做）**：本刀唯一码改面=`pnpm-workspace.yaml`（现 blob `8ac5f942`）。届时对各在飞分支执行 `git log <branch> -1 -- pnpm-workspace.yaml` 逐树复核，任一分支顶对该文件存在主线 `156dd977` 之后的新增提交→触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git hash-object` 亲算 @`156dd977`）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `pnpm-workspace.yaml` | `8ac5f942`（17 行） | 仅 packages/catalog/catalogs 三键——**零 supportedArchitectures 零 .npmrc（根 `.npmrc` ls ABSENT 亲证）**＝平台过滤按默认=仅 current 平台物化（本刀修法点） |
| `package.json`（root） | `3b04b871` | `:148` `"uc018:perf-load:prove"`→`node scripts/run-e2e-isolated.mjs uc018:perf-load:prove:raw`·`:149` `":raw"`→`node scripts/uc018-perf-load-capped-child.mjs`（三层门链 :132-:135 同形对照=abandon 族宿主面） |
| `scripts/uc018-perf-load-capped-child.mjs` | `c63259c0`（201 行） | **`:42` `NODE_IMAGE = process.env.UC018_PERF_NODE_IMAGE || 'node:20-bookworm'`（Debian glibc·容器 linux 面）·`:136` `-v ${ROOT}:${ROOT}` 宿主树 bind-mount（同径挂载·pnpm symlink 树容器内可解析）·`:130-:131` `--cpus=2 --memory=4g`（EXEC 重 pin 改锚·起草卷误记 `:137-:138`）·`:147` PGHOST 单点注入·`:148-:154` docker CMD=`node --import @swc-node/register/esm-register test/uc-e2e-018-perf-load.proof.ts`（-w apps/api）＝容器内触发点·`:110-:123` passEnv 无 MODEL_API_KEY 通道（est live=0 承证）** |
| `scripts/run-e2e-isolated.mjs` | `e69e317a`（3189 行） | `:2258-:2259` target 映射 perf-load→`['node', ['scripts/uc018-perf-load-capped-child.mjs']]`（宿主侧 spawn）·`:2217-` 系列其余全部目标 `['pnpm', …]` 宿主直跑（其余全绿与 perf 恒红并存的结构性原因）·`:3056` perf 目标 PG 侧 caps |
| `apps/api/package.json` | `910ff4f8` | `:41` `prove:uc018-perf-load`＝`node --import @swc-node/register/esm-register test/uc-e2e-018-perf-load.proof.ts`（宿主孪生形）·`:113-:114` devDependencies `"@swc-node/register": "^1.11.1"`+`"@swc/core": "^1.15.43"` |
| `apps/worker/package.json` | `e69420d4` | `:8-:9`/`:42` swc-node 装载面·`:173-:174` devDeps 同 api（同链第二消费面·本刀零触） |
| `pnpm-lock.yaml` | `af9c3f38` | `:1331-:1421` `@oxc-resolver/binding-*` **19 平台变体全量登记**（`:1366-:1369` linux-arm64-gnu 带 `cpu:[arm64] os:[linux]`·`:1341-:1344` darwin-arm64）·`:2119` `@swc/core@1.15.43`·`:3812` `oxc-resolver@11.21.3` 本体·`:6145` snapshot `@swc-node/register@1.11.1` dependencies 内 `oxc-resolver: 11.21.3`（引入链唯一实证）·`:6194-` `@swc/core` optionalDependencies 平台二进制面 |
| `packages/db/src/isolated-test-target.ts` | `bf1af79e` | `:72-:73` PGHOST 双字面量白名单+`destructive_proof_loopback_or_hostgateway_required`（C-PERF-CONTAINER-REACHABILITY 候选1 已落码面·崩溃发生在其**之前**＝断言层未达证） |
| `receipts/archive/2026-09-batch23/receipts/2026-10-07-gap-perf-container-reachability-fix-prove.md` | —（只读引用） | `:26` attempt-1 归因·`:28-:37` untracked supportedArchitectures 实验形（本刀件① 逐字照抄的验证源） |
| `ai-docs/delivery/execution-master-checklist.md` | —（SSOT·只读） | `:1122` attempts 协议·`:2755` ⓜ 在册红·`:2756` STILL OPEN ①（受管件·行翻面权归协调方 nail·本刀零改） |

### 0.2 题面钉值登记（对 156dd977 题面亲核·EXEC 以实测为准+偏差熔断）

- neg:bend 臂数题面钉=**179/179**（156dd977 题面亲核·注意非 negbend-fix 时代 178——后续刀已增臂·EXEC 实测≠179 即停上报）。
- lint 五值题面钉=web **601**/root **5235**/api **1421**/worker **954**/ai-runtime **628**（156dd977 题面·全 0 errors 口径·任一值漂移即停上报）。
- docs:check 底值=**2122**≤cap **2128**（本树亲跑 EXIT=0·本卷落卷后 +1=2123 预期）。
- 迁移链=**202** 头 0202（`ls packages/db/migrations | wc -l` 亲数）。

## §1 红事实（机制链·全部亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 引入链（诊断问①：oxc-resolver 由哪个依赖引入）

- oxc-resolver **非任何 package.json 直接依赖**（全仓 package.json rg 零命中）——唯一引入链在 lockfile 亲证：
  **`@swc-node/register@1.11.1`（apps/api `:113` + apps/worker `:173` devDependencies）→ 其 dependencies 内 `oxc-resolver: 11.21.3`（pnpm-lock.yaml:6145）→ `oxc-resolver` 的 optionalDependencies `@oxc-resolver/binding-*` 19 平台变体（pnpm-lock.yaml:1331-1421）**。
- 同链第二原生面：`@swc-node/core@1.14.1 → @swc/core@1.15.43`（lockfile `:2119`/snapshot `:6194-` optionalDependencies `@swc/core-linux-arm64-gnu` 等）＝容器内 TS 转换的 native 加载面（oxc 之外的同族缺装面·修法须一并覆盖·见 §1.4 候选甲闭包论证）。
- 版本恒等钉：oxc-resolver **11.21.3**·@swc/core **1.15.43**·@swc-node/register **1.11.1**（lockfile 三处亲证·本刀零版本变更）。

### 1.2 为何容器内缺 linux 绑定（诊断问②：平台过滤机制）

- **pnpm optionalDependencies 平台过滤**：`pnpm install` 在宿主 darwin-arm64 物化 optional 依赖时按当前平台（os/cpu/libc）过滤——lockfile **登记**全部 19 变体（`:1331-:1421`），但只**物化** `@oxc-resolver/binding-darwin-arm64` 一枚入 `node_modules/.pnpm`；`linux-arm64-gnu` 仅登记不物化。`--frozen-lockfile` 只锁版本图**不扩平台物化面**——frozen 与缺装并存零矛盾。
- 过滤默认的仓内成因：根 `.npmrc` ABSENT（ls 亲证）+ `pnpm-workspace.yaml` 无 `supportedArchitectures` 键（blob `8ac5f942` 全文 17 行亲读）→ pnpm 走默认=仅 current 平台。
- **perf-load 是唯一把 proof 进程放进 linux 容器的目标**：capped-child `:136` `-v ${ROOT}:${ROOT}` 宿主树 bind-mount 进 `node:20-bookworm`（Debian glibc·arm64·`:42`）容器；容器内 Node 经 pnpm symlink 树（同径挂载→symlink 可解析）加载 `@swc-node/register/esm-register`→`@swc/core`→`oxc-resolver`→require 平台绑定→仓 store 仅 darwin 物化→`Cannot find module '@oxc-resolver/binding-linux-arm64-gnu'` **模块加载期同步 throw→EXIT=1**。
- 崩溃点在 `assertIsolatedTestTarget`（`bf1af79e` `:72-:73`）**之前**＝冻结阈值门未走到断言层（5E 收据 `:26` 同口径亲证）——**环境基建面·非断言非产品行为**，与 5E nail SSOT STILL OPEN ① 登记逐字一致。
- **对照实证（其余目标全绿与 perf 恒红并存无矛盾）**：其余全部 prove 目标由 run-e2e-isolated.mjs 在**宿主 darwin** 直接 spawn（`:2217-:2259` 系列 `['pnpm', …]`/宿主 `node`）——宿主 darwin 绑定在场→宿主面全绿；唯 perf-load 经 capped-child 进容器→容器面恒红。**run-e2e-isolated 门矩阵内唯一（双审 P2③ 亲证）**：runner 全 target 映射表中容器路由恰 1 条=`:2258-:2259` perf-load→`['node', ['scripts/uc018-perf-load-capped-child.mjs']]`，其余全为宿主 `['pnpm', …]`；`capped-child` 在 runner 内另一次出现 `:1156` 属 file-watch 依赖清单非 spawn 面——本刀修的是门矩阵内唯一容器化目标，宿主面零触碰。**HA compose 族旁注（ha-3 收据 `:36`）**：HA compose proof 面曾沿 ha-2 先例对 bind-mount 容器外科式补 4 linux 包（gitignore 面·不入树）——本刀落 `supportedArchitectures` 后该外科先例面整体为声明式替代覆盖，compose 族后继卷可直接受益（本刀零触 compose/镜像面）。
- **复红实证（候选乙不可持久的证据）**：2026-10-07 收据实验形（untracked supportedArchitectures 临时追加→attempts 2/3/4 全绿→**按设计立即还原**）＝临时形在场即绿、还原即红的完整对照；fresh worktree 场景复红同签名（出处④ `:69`）。

### 1.3 proof 侧触发点（诊断问③：何处 require oxc）

- 门链：root `package.json:148` `uc018:perf-load:prove` → `scripts/run-e2e-isolated.mjs`（:2258-:2259 宿主 spawn capped-child）→ root `:149` `:raw` → `scripts/uc018-perf-load-capped-child.mjs` → 容器内 `node --import @swc-node/register/esm-register test/uc-e2e-018-perf-load.proof.ts`（capped-child `:148-:154`）。
- **require 位＝`@swc-node/register/esm-register` 模块加载闭包**：`@swc-node/register → oxc-resolver → require('@oxc-resolver/binding-linux-arm64-gnu')`（缺）与 `@swc-node/core → @swc/core → require('@swc/core-linux-arm64-gnu')`（缺·oxc 崩在先故日志只见 oxc 签名）——**proof 源文件与产品源文件零嫌疑**（红先于一切业务代码执行）。
- 宿主孪生面零红：`pnpm -C apps/api prove:uc018-perf-load`（apps/api `:41`）在宿主 darwin 直跑同文件全绿（2026-10-07 收据 attempts 2/3/4 即容器内全绿·宿主面历来全绿）——行为面无嫌疑的结构性证据。

### 1.4 修法方向裁决（诊断问④·防 EXEC 期重开）

- **候选甲（采纳）＝安装面声明式修**：`supportedArchitectures` 键入 `pnpm-workspace.yaml`（pnpm 10 canonical 配置位·仓库已验证形逐字照抄出处③ `:32`：os `[darwin, linux]`+cpu `[arm64, x64]`）。效果：宿主物化 darwin+linux 双平台**全部** optional 变体——oxc-resolver/swc/core/tailwind-oxide/esbuild/napi-canvas 等全闭包**一次性**物化（外科逐包补的 whack-a-mole 问题整体消解）；lockfile 零改（变体本已全量登记·出处③ `:33` 实证 `pnpm install --frozen-lockfile` EXIT=0 ≈1m54s）；darwin 绑定共存零铲（ha-2 `:67` 先例=双平台共存宿主 proofs 全绿零破坏）；fresh worktree/CI 重装同形自愈（声明式入树=可持久）。
- **候选乙（否决·登记先例）＝外科式补包/容器内装**（ha-2 `:67`/ha-3 `:36` 三~四包外科补）：机器本地 gitignore 面操作·不入树·fresh worktree 必复红（§1.2 复红实证）＝不可持久；容器内整树 `pnpm install` 另被 NO_TTY 保险正确拦下（ha-2 `:67` 防铲 darwin 绑定）——方向已由先例否决。
- **候选丙（否决）＝proof 环境门「缺绑定时 skip-as-known 登记」**：skip-as-pass 形＝Ban（诚实红线）；登记形虽诚实但使冻结阈值门（NHP-018-PERF/LOAD·Method freeze·Ban post-hoc retune·proof 头注释亲读）**永不执行**——perf-load:prove 的存在意义即执行阈值门，登记形＝功能放弃非修复。本刀后若仍环境红，如实登记升级（§8 停止条件承）·Ban 以登记形替代修复。
- **候选丁（否决）＝换纯 JS resolver 路径**：oxc-resolver 是 @swc-node/register 的**传递依赖**（`:6145`）非可直换件；替换 TS 装载器＝触 api+worker 全部 prove 脚本面（apps/api 全 script 键亲数 **89**＝八十余脚本+worker 同面更大·双审 P2② 改锚）·爆炸半径不可界·与安装面 8 行配置修完全不成比例。

## §1-修法（权限链修复刀·预期恰 1 配置文件码改·零迁移零产品码零 proof/runner 文件改动）

- **件①（唯一码改·⛔ 不得更改形）**：`pnpm-workspace.yaml` 文件尾追加（与 `catalogs:` 块间恰一空行·YAML 顶层键·**逐字照抄出处③ `:32` 验证形**）：
  ```yaml

  supportedArchitectures:
    os:
      - darwin
      - linux
    cpu:
      - arm64
      - x64
  ```
  预期 diff＝恰 1 文件净 **+8 行**（1 空行+7 配置行）·既有 17 行零字节改。**libc 键不设**（验证形原样·musl/Windows 面如实登记不在本刀域——node:20-bookworm=glibc·扩键=改件① 形→回炉）。
- **件②（宿主重物化+材化断言·命令原样可复制）**：执行树内：
  ```
  pnpm install --frozen-lockfile
  ls node_modules/.pnpm | grep -c '@oxc-resolver+binding-darwin-arm64'          # 期望恰 1
  ls node_modules/.pnpm | grep -c '@oxc-resolver+binding-linux-arm64-gnu'       # 期望恰 1
  ls node_modules/.pnpm | grep -c '@swc+core-linux-arm64-gnu'                   # 期望≥1
  git diff --exit-code pnpm-lock.yaml                                           # 期望零输出 EXIT=0
  ```
  （任一 grep 计数偏离/lockfile 出 diff→「机制不满足」停止条件·`.pnpm` 目录命名以 pnpm 10.18.0 实测为准·模式按 `@oxc-resolver`/`@swc` 面宽匹配计数）
- **件③（prove·attempts 全台账·恰终态 1 绿）**：`pnpm uc018:perf-load:prove`——fresh 隔离 PG per attempt（per-run 随机容器+动态端口+token GUC 惯例零改）·**attempts 全台账不弃单**：env 红如实归因沿 `:1122` 先例协议（1,0,0,0 形·环境层归因须附日志摘证）；行为红（断言/阈值 miss）**Ban retry 冲销**；终态要求 EXIT=0（`SUMMARY allPass=true capsEnforced=true`）+ 终 run machine receipt 与 `_caps-evidence.json`（enforced=true）嵌入收据。容器内零模型外呼（passEnv `:110-:123` 无模型 Key 通道·est live=0）。
- **件④（收据）**：`ai-docs/delivery/receipts/perfload-env-fix/00-exec.md`——七字段（门矩阵全表+EXIT 原值+attempts 台账+件② 材化断言回执+diff numstat+重 pin 全表+pins 零翻声明）+**成本登记行（双审 P2④·三值据席2 实测）**：生产镜像 **+~185MB**／CI 冷跑 **+0.65-1.3GB 每次**／宿主 store 一次性 **+1.6-2GB**（双平台物化面一次性成本·CI/fresh worktree 因 store 共享可摊薄）。

## §2 验收门矩阵（pre-exec 双审核对单基面·十门·数字口径以实测为准·偏差熔断阈值明示）

1. **perf-load:prove 翻绿（本刀见证点）**：`pnpm uc018:perf-load:prove` EXIT=0·attempts 全台账·`SUMMARY allPass=true capsEnforced=true`。
2. **邻面不回退·宿主工具链共存见证**：`pnpm -C apps/api neg:bend` EXIT=0 臂总数恰 **179/179**（§0.2 题面钉·实测≠179 即触「现场漂移」停）。
3. **邻面不回退·同族隔离 runner**：`pnpm uc018:abandon:prove` EXIT=0（臂数以实测为准·master-checklist 题面 46·偏差即停上报）。
4. **migrate 链**：`pnpm migrate:prove` EXIT=0·链 **202** 头 0202（届时链顶顺延如实记）。
5. **drift+uniqueness**：`pnpm drift:prove` EXIT=0 零漂移·`node scripts/check-migration-version-uniqueness.mjs`→`files=202 violations=0`（files 对届时链顶亲数·violations 恒 0）。
6. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached 口径沿 SSOT 门矩阵）。
7. **lint 五值承登**：`pnpm turbo lint` 12 任务·五值恰等 §0.2 题面钉（web 601/root 5235/api 1421/worker 954/ai-runtime 628·全 0 errors）——任一值漂移或第三红即停上报（承登口径·零余量如实记）。
8. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·≤cap **2128**（底值 2122 本树亲跑·本卷落卷后预期 2123·**>2128 红停上报**）。
9. **markers 五类零命中**：本刀改动集（本卷 .md+件① yaml+收据目录全文件）五类标记词零命中（词面运行时组装防自指·`scripts/i6-239-gates.proof.mjs:152-163` §2-7 同五类同源·词面不入卷不入收据·命令与回执入收据）。
10. **diff 面机检+卫生**：`git diff --numstat <base>` tracked 恰 2 路径＝`pnpm-workspace.yaml`+本卷 .md（+收据目录 untracked）——多任何 tracked 路径即停（越界需要类）·`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录·`actualSpendCny=null`·est live=0。

## §3 范围外（边界清单·越界即 FAIL）

1. **proof/runner/caps/assert 零触**：`apps/api/test/uc-e2e-018-perf-load.proof.ts`·`scripts/uc018-perf-load-capped-child.mjs`·`scripts/run-e2e-isolated.mjs`·`packages/db/src/isolated-test-target.ts` 零字节改——红为环境安装面·断言面与容器拓扑面零嫌疑（§1.2/§1.3 已证）。
2. **产品码零触·零迁移零 DDL**：apps/**、packages/** 产品 src 与 packages/db/migrations/** 零改（§0.1 锚面·迁移链 202 恒等）。
3. **lockfile 零改·依赖版本零变**：`pnpm-lock.yaml` 零 diff（变体本已全量登记）·oxc-resolver 11.21.3/@swc/core 1.15.43/@swc-node/register 1.11.1 恒等（Ban 顺带升级/renovate 面）。
4. **共享 SSOT 零改**：master-checklist `:2756` STILL OPEN ① 行翻面权归协调方 nail（本刀只交执行面证据）·backlog/LEDGER/north-star 只读。
5. **CI/wrapper/docker 镜像零改**：镜像面=`UC018_PERF_NODE_IMAGE` 既有预留位·本刀不动（镜像烘焙 node_modules 方向＝候选乙族·否决沿承）。

## §4 依赖

**①上游已满足**：C-PERF-CONTAINER-REACHABILITY 候选1 已落码（`f59c4d20`·capped-child 桥接+host-gateway 形·`c63259c0` `:9-:22` 注释自证）＝本刀容器拓扑前提·5E nail SSOT 在案登记＝红靶确认。**②无同文件并发**：`pnpm-workspace.yaml` 末次变更在主线内·§0.0 在飞复核规则 EXEC 立项日必做。**③迁移号**：预期零。**④下游**：本刀翻绿＝5E 门矩阵 ⓜ 基线红与 STILL OPEN ① 消欠的执行面证据·行翻面与 nail 排序归协调方·PERF/LOAD stays local partial 不因翻绿而变（§5 外推禁令）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban skip-as-pass（任何 known-red skip 臂入 proof＝FAIL·诚实红线）；Ban retry-to-green（件③ 行为红不冲销·env 红如实归因全台账不弃单不洗）；Ban 触 proof/runner/caps/assert 文件（§3-1）；Ban 产品码/迁移（§3-2）；Ban lockfile 编辑与依赖升降级（§3-3）；Ban 容器内 `pnpm install`（NO_TTY 先例·安装一律宿主面）；Ban `supportedArchitectures` 面外扩（libc/Windows 键增删＝改件① 形·回炉）；Ban 共享 SSOT 自翻行（§3-4）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地修邻面新红（neg 族/lint/docs 若现新红→如实登记升级·Ban 借机修）；Ban 造 `.env*`/写 Key 值入树入据。

**pins（十二值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · PERF/LOAD stays **local partial** · capacityRepresentative=**false** · canHonestlyFlip=**false** · actualSpendCny=null。**翻绿外推禁令**：perf-load:prove EXIT=0 不外推为容量/HA/release 任何叙事（2026-10-07 收据 §4b 口径沿承·§1.1 stays partial 不翻）。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载·零生产操作·零 secrets·零消耗（docs-only·诊断面全静态 rg/Read/git）。EXEC 期 prove 亦零模型外呼（capped-child passEnv `:110-:123` 无模型 Key 通道亲证·§2 门 1 全离线容器+隔离 PG 面）。

## §7 markers=0（卫生声明）

本刀改动集（本 commit 恰 1 .md·EXEC 期+件① yaml+收据目录）**五类标记词零命中**（起草席本 commit 亲跑·词面运行时组装防自指·五类词面沿 i6-239-gates §2-7 不复抄卷内防自匹配——沿 negbend-fix/g7w/authz-harden 卷 §7 同形制）·命令与回执随 EXEC 收据留痕。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.4 裁决与 §1-修法件① 唯一码改形与 §5 Ban/pins**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做·§0.2 题面钉值对届时 SSOT 复核）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且结论受疑（capped-child 容器拓扑/挂载面改写·lockfile 变体面增删·pnpm-workspace.yaml 既有键改写）·或 §0.0 在飞分支对 `pnpm-workspace.yaml` 有新增提交·或门 2 neg:bend 实测≠179·或基线 docs:check 底值 >2128 → 停·重 pin 回炉。
- **机制不满足**：件①+件② 材化断言全绿而容器内仍同签名红（或件② grep 计数偏离/lockfile 出 diff）→ 机制诊断被证伪 → 停·如实升级协调方回炉（**Ban 就地转候选乙外科补 Ban 改诊断 Ban 凑绿**）。
- **越界需要**：修法诉求超出 `pnpm-workspace.yaml` 单文件面（需触 proof/runner/lockfile/产品码/镜像/CI/assert 白名单）→ 停·另刀或协调方裁决（§3 全清单沿承·Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻面 neg:abandon 红·lint 五值漂移·docs:check>2128·typecheck 红）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 EXEC 记录（2026-10-15·执行席落卷·post-prove 双审前）

**Status 翻面**：`draft:awaiting_pre_exec_dual` → **`executed:awaiting_post_prove_dual`**（开工链=双审席1 `agent_2c63fc07`+席2 `agent_187f6195` BOTH PASS→协调方 EXEC 授权·⛔push）。

- **并线**：`git merge --no-ff feat/mysql-schema-skeleton`→**`b827d1d8`**（origin tip=`3559c5c9`·merge-base `156dd977`·merge-tree 预演 tree `9e48b77c` EXIT=0 零冲突先证·实测零冲突零 dual-keep 需·⛔pull --rebase 未用）。§0.0 在飞交叠复核亲证零命中（在飞 `line/*` 分支对 `pnpm-workspace.yaml` 零新增提交）。
- **重 pin**：对 `b827d1d8` 全 8 锚 blob 逐字恒等·行号漂移恰 1（capped-child `:137-:138`→**`:130-:131`**·P2① 已更 §0.1）·双审 P2 四项全落卷（§0 重 pin 记录块+§1.2+§1.4+§1-修法 件④）。
- **件①**：`pnpm-workspace.yaml` +8/-0（supportedArchitectures os `[darwin,linux]`+cpu `[arm64,x64]`·验证形逐字·既有 17 行零字节改）。
- **件②**：重装 EXIT=0（16m33.8s）·材化四断言全绿：oxc darwin-arm64 恰 1+oxc linux-arm64-gnu 恰 1+swc core-linux-arm64-gnu 恰 1+`git diff --exit-code pnpm-lock.yaml` EXIT=0（零 lockfile 改）。
- **件③**：`pnpm uc018:perf-load:prove` **EXIT=0 attempts 恰 1 零 retry**·`SUMMARY allPass=true capsEnforced=true`·`_caps-evidence.json` enforced=true blocker=null·machine receipt+7 件机检落 `ai-docs/delivery/receipts/uc018-perf-load/`（proof 设计 TRACKED_DIR·史上有绿故首现）·改前环境红基线在册不洗（:2755 ⓜ/:2756 ①）。
- **件④**：收据 `ai-docs/delivery/receipts/perfload-env-fix/00-exec.md`（七字段+§7 成本登记行三值+§6 红与偏差登记）。
- **门矩阵十门终值**：门1 prove 翻绿**绿**·门2 neg:bend **179/179 EXIT=0 绿**（runner 隔离行使·直跑形缺宿主 env 红为取道缺配如实记 §6-3）·门3 abandon **EXIT=0 绿**·门4 migrate 链 202 头 0202 **绿**·门5 drift 零漂+uniqueness files=202 violations=0 **绿**·门6 typecheck 8/8 0 cached **绿**·门7 lint 12/12 五值恰等 web 601/root 5235/api 1421/worker 954/ai-runtime 628 全 0 errors **绿**·门8 docs:check **红=PTP_FILE_LIMIT:2131>2128（+本收据 2132）红停上报**·门9 markers 五类零命中 **绿**·门10 diff 恰 2 tracked 路径+零 lockfile 改+.env* 三查 ABSENT+actualSpendCny=null+est live=0 **绿**。
- **停止条件「验收红不可修」命中登记（Ban 借机修·裁决归协调方）**：门 8 红构成=基线 2124（stash 对照亲证 clean `b827d1d8` **2124≤2128 EXIT=0 绿**·本席 tracked 改动计数贡献=0）+件③ 强制机检 7+件④ 收据 1=**2132>2128**。根因=sanctioned cap 对「merge 漂 +1+prove 首绿机检件 +7」无预算（起草底值 2122 预期落卷 2123 无从预见首绿产出）·本席零自改 cap（cap 史全部协调方 sanction·先例「EXEC 红停 2081>2080」同形）·**请协调方裁决上调幅度**（最少 +4 至 2132·沿 +8 先例取 2136 头空可选）。
- **门 3 臂数偏差登记**：题面 46→实测 **33 PASS/0 FAIL/EXIT=0**——proof 本体在基线内 `5b1208a1`（5E 二十面测试改形·`156dd977` 祖先亲证）已改形至 33 `A()` 臂·起草卷照抄旧 SSOT 行未复测·门本体绿·钉漂移如实上报。
- **卫生**：markers 五类零命中（9 件+收据复扫）·tracked 恰 2 路径（`pnpm-workspace.yaml`+本卷·typecheck 触发 `tsconfig.tsbuildinfo` 副产已还原如实记）·零 lockfile 改·零迁移·proof/runner/caps/assert 产品面零触·共享 SSOT 零触·est live=0·actualSpendCny=null。
- **pins 十二值零翻**（承 §5 原文·翻绿外推禁令沿承·PERF/LOAD stays local partial）。

---

*PERFLOAD-ENV-FIX REQUEST · 2026-10-14 起草 · 2026-10-15 EXEC 落卷 · 起草 base `feat/mysql-schema-skeleton` @`156dd977` · EXEC 线 tip=`b827d1d8`+本卷 · 分支 `line/perfload-env-fix` · 工作树 `meetwise-ple`（本起草席立·建前 branch+worktree 双查不存在）· 立项出处=5E nail SSOT STILL OPEN ①（master-checklist :2756/:2755/:1122）+2026-10-07 收据（:26 归因+:28-:37 untracked 验证形）+fresh worktree 复红实证 · 红根因=`@swc-node/register@1.11.1`（api :113/worker :173 devDep）→`oxc-resolver@11.21.3`（lockfile :6145）→`@oxc-resolver/binding-*` 19 变体（:1331-:1421）经 pnpm optional 平台过滤宿主 darwin 只物化 darwin 枚·perf-load 唯一容器化 proof（capped-child :136 bind-mount+:42 node:20-bookworm+:130-:131 caps+:148-:154 swc-node 装载）在 linux 容器内模块加载期崩·断言层未达·环境基建面 · 修法=候选甲 supportedArchitectures 声明式入 pnpm-workspace.yaml（验证形逐字照抄·+8 行·lockfile 零改·darwin 共存·fresh worktree 自愈·**EXEC 已落码翻绿实证**）·候选乙外科补/容器装（不可持久）候选丙 skip-as-known（Ban skip-as-pass·阈值门弃执行）候选丁换纯 JS resolver（爆炸半径不可界·api script 键 89 实测）全否决在卷 · 门矩阵十门 EXEC 终值=8 绿+门 8 cap 红（红停上报·裁决归协调方）+门 3 臂数 33 偏差登记 · 迁移零 · est live=0 · markers=0 · pins 十二值零翻+翻绿外推禁令 · 停止条件「验收红不可修」命中登记 · **`executed:awaiting_post_prove_dual`** · ⛔push*

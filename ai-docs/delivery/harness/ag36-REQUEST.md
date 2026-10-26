# AG-36 — checkpoint 基座依赖收编 catalog + 0043 版本自检件（REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草 2026-10-26 落卷·pre-exec 双审两独立外席待派→Dual PASS→协调方授权后始有 EXEC·est live=0·Ban self-approve·alone≠dual·⛔push ⛔merge 主线·翻面权归协调方）。

**席位**：AG 能力复核台账下一刀起草席（派单标的 **AG-36**=P3 编排运行时「packages/db 直接钉死 @langchain/langgraph-checkpoint 1.1.3，不走 catalog；0043 手抄 vendor migrations，运行时没有版本自检」·LEDGER open 3 门控/前置项之一·派单 brief 命前置=「依赖 catalog 化」并预授权：前置已解且判词已修则改报翻面·否则照常起草）。
**基线**：`origin/main` @ `ab282ba81`（`git fetch` 后 `git rev-parse origin/main` 亲证=ab282ba8134f51938a183691a240e21d02ce08c5·Merge PR #123·分支 `line/ag36-draft`·工作树 `../meetwise-ag36`（`git worktree add ../meetwise-ag36 -b line/ag36-draft ab282ba81`·建树亲证）。
**前置定谳（工序①·非翻面）**：派单命「前置=依赖 catalog 化」——现树亲证 **半解·判词面未修·非翻面候选**：①catalog 机制本身在位——`pnpm-workspace.yaml:13-17` 具名 `catalogs.langchain` 三值（core 1.2.1/langgraph 1.4.7/checkpoint-postgres 1.0.4）自仓初始 commit 即在·`catalog:langchain` 消费面四处（apps/worker :170-171、packages/db :112、packages/ai-graphs :18）；②**但 AG-36 判词点名的 `@langchain/langgraph-checkpoint` 仍直钉**——`packages/db/package.json:113` `"1.1.3"` 字面·与本卷亲证的复核快照 `2fab7946`（在仓可引·`git cat-file -t` EXIT=0）`:97-98` 逐字节同形——catalog 化对该点名面**零推进**；③0043 版本自检零落地——`checkpoint_migrations` 在产品源运行时引用**零命中**（全仓 .ts 命中仅 packages/db/test 两 proof）。→ 三面两缺·照常起草本卷。
**防重对表（亲证）**：`git worktree list` 21 树**零 ag36 树**；`git branch -a | grep -iE "ag-?36"` EXIT=1 **零同名线**；`ls ai-docs/delivery/harness/ | grep -iE "ag-?36"` EXIT=1 **零同名刀卷**；`git log --all --oneline --grep="AG-36"` **零笔**。→ 防重停止条件未触发·可落卷。
**蓝本**：①`ai-docs/delivery/ai-capability-review/issues-final.md` AG-36（总览 **:48**·详情 **:449-458**·判词 **:451**「成立（已核实，当前 lockfile 一致）」·源编号 **:453**=LG-23·file:line **:454**·触发例子 **:455**「升级 checkpoint-postgres 时 vendor 新增了列，0043 没有跟进，运行期 SQL 报错」·**修法 :457**「启动时校验 checkpoint_migrations 的最大版本；db 包改用 catalog」）②`ai-docs/delivery/ai-capability-review/LANDING-INDEX.md` **:42** LG-23 行（映射 AG-36·成立）③`ai-docs/delivery/execution-master-checklist.md` **:4443** open 3 登记「AG-36（前置未修）」④`ai-docs/delivery/harness/product-campaign-LEDGER.md` **:712** 同口径 ⑤`ai-docs/delivery/harness/extrev-deps-audit-REQUEST.md` **:197**（双层 catalog 承重 33 处引用·Renovate ≥39 原生解析命名 catalog——修法①可行性依准）⑥形制沿 `ag35-legacy-api-erratum-REQUEST.md`/`ag37-deficit-persist-REQUEST.md`（§0-§8 同源）。

## §0 现状锚（起草席亲读·base `ab282ba81`·file:line/blob 逐条 sed/grep/`git rev-parse HEAD:<path>` 实测·**EXEC 立项照届时 tip 全量重 pin——漂则重锚·结论不变只更行号·定性翻案即停**）

### 0.1 blob 锚表（全 40 hex @`ab282ba81`·vendor 三条系本机实装事实登记非 tracked 锚·见 0.3-3）

| # | 文件 | blob | 关键行锚 |
|---|---|---|---|
| 1 | `pnpm-workspace.yaml` | `f14e7fc25f68f8042023be164c94ee867d7b5c42` | `:5-11` 根 `catalog:` 六值；**:13-17 `catalogs.langchain` 三值（:15 core 1.2.1 / :16 langgraph 1.4.7 / :17 checkpoint-postgres 1.0.4）——本刀修法① 第 4 值落点** |
| 2 | `packages/db/package.json` | `08c98d938bd67cfd0eb673ccc2a55fb401b0e089` | **:112 checkpoint-postgres=`catalog:langchain`（已收编对照面）**；**:113 `@langchain/langgraph-checkpoint: "1.1.3"` 字面直钉（判词点名面·本刀修法① 触点·全仓 langchain 族唯一漏收编位）**；:11 lint cap 1042；:25/:53/:66 `prove:migrate`/`prove:uc052-checkpoint-physical`/`prove:dbhy1` 门名 |
| 3 | `packages/db/migrations/0043_langgraph_checkpoint_least_privilege.sql` | `a771894d1e93e4dc7504de9f57996d142c70916b` | **:1-4 头注自述手抄**「Mirrors …1.0.4 migrations…Package upgrades that alter this schema require a new reviewed migration before deployment」——**纯人守·零机器执行**；:6-22 四表+blob 可空手抄体；**:23 seeds (0)-(4) 恰 5 版**；:24 GRANT 四表至 app_role（运行时自检读权在位）。sha256 亲算=`f12c3026f0624d012de988fd0f77310cde9d4128defc8fc18bc502075d7e9123`（与锚 8 ledger 逐位一致） |
| 4 | `apps/worker/src/main.ts` | `03bca62015076011d666daba5d710c1d3f1ac0b2` | `:449` bootstrap 内 `createPool({ purpose: 'worker' })`；**:460 `await verifyModelCostGovernance(pool, modelCost)`——启动期 fail-closed 治理闸族既有先例（修法② 接线位同族）**；**:482-483 负向声明**「0043 owns the vendor checkpoint schema. Calling PostgresSaver.setup() here would reintroduce runtime DDL」；**:484 `createCheckpointer(undefined, true)`（低权 app_role·生产从不跑 vendor DDL）——修法② 插位点即 :482 前** |
| 5 | `packages/db/src/index.ts` | `c81850862a0fc5f10f21c27f7701cdd414b44792` | 包导出面（自检件常量+断言函数 additive 导出落点） |
| 6 | `packages/db/test/uc052-checkpoint-physical.proof.ts` | `80b3dffdda0f58ddd2693e032bc817759f8dd7d6` | **:11 全仓唯一直接 import 基座包面**（`emptyCheckpoint, uuid6` from `@langchain/langgraph-checkpoint`）/:138-139 消费——直钉依赖的直接消费方即此测试（产品 src 零 import·亲证） |
| 7 | `apps/worker/package.json` | `8507d220c37ba605ff1909802008ac9fc11d627c` | :170-171 langgraph+checkpoint-postgres 全 `catalog:langchain`——worker 侧零直钉对照面 |
| 8 | `packages/db/test/dbhy1.proof.ts` | `4d591bc5ba94d962ddc4f0fd82cda5d0807ab94b` | **:77 0043 hash 台账 `f12c3026f0624d01…9123`——本刀零迁移不变量锚**（0043 零字节改则此门绿） |
| 9 | `packages/db/test/migrate.proof.ts` | `a0454506399dbd2be18d70cbe6ce5ebc99000def` | :362「加载 LangGraph checkpoint 低权迁移 0043」装载断言 |
| 10 | `pnpm-lock.yaml` | `fdff2efd2d588b83ea9ef982333d3863fbfa6329` | :931-938 `checkpoint-postgres@1.0.4`（peerDeps 基座 `^1.0.0`）+ `checkpoint@1.1.3` 锁实值——判词「当前 lockfile 一致」面·锁实值=直钉值=vendor 实装 |
| 11 | `ai-docs/delivery/ai-capability-review/issues-final.md` | `7bf0f03d00db44959af7c1983e7926d25d67e514` | AG-36 总览 :48 + 详情 :449-458（只读蓝本·零触） |
| 12 | `scripts/ai-docs/public-text-policy.mjs` | `963ba81b9fc9f1d8b5601b12851bfe8fe87cb6bc` | :139 `MAX_FILES = 2_354`（docs:check cap 现值） |

### 0.2 漂移登记（复核快照 `2fab7946` → 现树 `ab282ba81`·快照在仓逐位亲比）

| 蓝本锚（issues-final :454） | 现树重 pin（实测） | 漂移判读 |
|---|---|---|
| pnpm-workspace.yaml:14-17 | **:13-17**（`catalogs:` 头行即 :13） | 微漂 1 行·三值内容零变·结论不变 |
| packages/db/package.json:97-98 | **:112-113**（:112 已收编对照位·:113 直钉原样） | 行漂（邻刀插行）·**:113 直钉面零变=判词原样成立** |
| 0043 :1-4 | :1-4 | **零漂**·sha256 亲算与 dbhy1 :77 台账逐位一致 |

### 0.3 现势并发登记（强制）

1. **LEDGER :712 open 3**（AG-13 线上数据/AG-32 前置/AG-36 前置）——本刀即 AG-36 正身；其「前置=catalog 化」定谳见卷头（机制半在位·点名面未收编=本刀修法①本体·**非外部前置刀·零在途依赖**）。
2. **零在飞交叠**：防重三查全零（卷头）·21 树在飞线与本刀触面（workspace yaml/db package.json/lockfile/db src+test/worker main.ts 一行）经 `grep` 交叠面复核——ag14/ag18/ag20/ag32 等在飞线触面与本刀零交集。
3. **vendor 实装事实（本机主仓 node_modules 登记·非 tracked 锚·届机 proof 重绑）**：`@langchain/langgraph-checkpoint-postgres@1.0.4` ①`dist/index.js` 尾行**仅 `export { PostgresSaver }`——`getMigrations` 不出包根**·package.json exports map **无 `./migrations` 子径**（运行时无法从包面导入 vendor 迁移清单=修法② 须仓内常量承载的结构性原因）；②`dist/migrations.js` `getMigrations(schema)` 返回**恰 5 条**（位置 0-4·与 0043 :23 seeds 逐版对齐=今日一致·判词红面系**升级时**才触发）；③vendor package.json peerDeps 基座 `^1.0.0`·本机实装 1.1.3 与基线 lockfile :938 一致（主仓 47dd6be56 lockfile 同值亲证·实装可信）。

## §1 红事实 + 修法

### 红事实 A：基座包绕过 catalog（判词半①·机制链三段）

1. **单一真相面破口**：workspace yaml :13-17 具名 catalog 即 langchain 族版本单一真相·族内四包三个已收编（worker :170-171/db :112/ai-graphs :18）·唯 `packages/db:113` 基座包字面直钉 `"1.1.3"` 漏网。
2. **漂移暴露面**：catalog 组升级（Renovate 周窗·extrev-deps-audit :197 裁定原生解析命名 catalog）可推 checkpoint-postgres 新版并经 peerDeps `^1.0.0` 拉入新基座——而 :113 直钉不随动·**版本双源分叉**无机器闸（恰为判词 :451「当前 lockfile 一致」所锚的今日脆弱平衡）。
3. **直接消费方唯一**：产品 src 零 import 基座包（亲证）·唯 uc052 proof :11——直钉的存在本身即测试依赖误置生产 dependencies 形·收编 catalog 不改语义零风险。

### 红事实 B：0043 手抄无版本自检（判词半②·机制链四段）

1. **人守面**：0043 :3-4 头注自述「升级须新审迁移」——纯文字纪律·零机器执行·**升级即失守**（判词 :455 触发例子原文）。
2. **生产零 DDL 面自洽**：worker :482-483 负向声明+:484 低权 createCheckpointer——生产**从不**跑 `PostgresSaver.setup()`（vendor 自迁移）·0043 是 schema 唯一载体；vendor 新版若加列（如 v5）·0043 不跟·**首个 checkpoint 查询运行期 SQL 报错**——错在面试在途时点·非部署闸时点。
3. **自检缺口**：`checkpoint_migrations` 产品源运行时引用零命中（亲证）——启动期无任何闸比较 DB `MAX(v)` 与已装 vendor 期望版本。
4. **结构约束**：vendor 不导出迁移清单（0.3-3①）——自检期望值**只能仓内常量承载**·常量↔vendor 的一致性由 proof 绑定（修法② 环三）。

### §1-修法（蓝本修法 :457 原文两肢照单全收·全 additive·零迁移·版本零变）

**① catalog 收编（修法肢二「db 包改用 catalog」）**：`pnpm-workspace.yaml` `catalogs.langchain` 增第 4 值 `'@langchain/langgraph-checkpoint': 1.1.3`；`packages/db/package.json:113` 改 `"catalog:langchain"`；`pnpm install` 重生成 lockfile。**版本保留 1.1.3 零 semver 变**（本刀 Ban 升级·§1.3 乙）；Renovate 命名 catalog 原生解析·第 4 值自动入族周窗组·零配置增量。**可行性判定：可行·无不兼容**（机制自初始 commit 在位·四处同族消费先例·零新工具零新配置）。

**② 0043 版本自检件（修法肢一「启动时校验 checkpoint_migrations 的最大版本」·三环链）**：

- **环一（常量+断言·packages/db）**：新模块 `src/checkpoint-schema.ts` 导出 `EXPECTED_CHECKPOINT_MIGRATIONS = 5`（对齐 vendor 1.0.4 迁移条数=0043 :23 seeds 数·头注注明 vendor 版本与换算式「最大版本=条数-1」）+ `assertCheckpointMigrationsCurrent(client)`：`SELECT COALESCE(MAX(v), -1) FROM checkpoint_migrations` → `MAX(v) === EXPECTED-1` 不成立即抛 `checkpoint_migrations_version_mismatch`（fail-closed·含 NULL 空表臂与 DB 领先臂——等值闸双向捕捉：落后=升级未跟进·领先=回滚未回灌）；`src/index.ts` additive 导出一行。
- **环二（启动接线·apps/worker 一行）**：`main.ts` bootstrap() 于 :460 `verifyModelCostGovernance` 治理闸族同位、**:484 `createCheckpointer` 之前**插 `await assertCheckpointMigrationsCurrent(...)`——错在部署闸时点拒绝启动（与 :482-483 既有立场自洽：schema 不对时该 fail 的是部署迁移而非在途面试的运行期 SQL）。app_role 读权已由 0043 :24 GRANT 在位·零权限面新增。
- **环三（常量↔vendor 绑定 proof）**：新 proof `packages/db/test/checkpoint-schema.proof.ts`（门名 `prove:checkpoint-schema-selfcheck`）断言：①常量条数=**已装 vendor** 迁移清单条数（经包入口解析定位 vendor 实装路径后读其 `dist/migrations.js`——vendor 升级即此断言红·强制走 0043 头注的「新审迁移+常量提版」流程·人守转机守）；②隔离 PG 双臂：seeds (0)-(4) 臂断言通过·缺 v4/多 v5 两失配臂断言抛 `checkpoint_migrations_version_mismatch`；③0043 hash 不变量（对照 dbhy1 :77 值重算）。

**③ 接线面清单（EXEC 立项照 §0 重 pin）**：pnpm-workspace.yaml（+1 行）/packages/db/package.json（:113 一处改值）/pnpm-lock.yaml（pnpm install 重生成·importers 面 catalog 引用替换）/packages/db/src/checkpoint-schema.ts（新）/packages/db/src/index.ts（+1 导出行）/apps/worker/src/main.ts（+1 行）/packages/db/test/checkpoint-schema.proof.ts（新）/packages/db/package.json scripts（+1 门名行）。**八处全 additive·零迁移零 0043 字节改零产品行为变（schema 今日一致·闸今日必绿）。**

### §1.2 触面矩阵

六 tracked 文件改（上③清单前六）+两新文件（checkpoint-schema.ts/proof）+1 scripts 行=db package.json 计七 tracked 改两新增；零历史迁移触·零 SSOT 触·零 env 闸·web/api 零触（api/web 零 langgraph 依赖亲证）。

### §1.3 否决（五条）

- **甲=顺手升级基座/postgres 版本**：本刀=收编+自检·版本零变；升级须先过环三机守（新迁移+常量提版）·绕过即架空 0043 头注纪律·Ban。
- **乙=手抄编辑 pnpm-lock.yaml**：lockfile 唯一合法生成通道=`pnpm install`·手抄必致 importers/resolutions 漂·Ban。
- **丙=本刀新增迁移或改 0043**：schema 今日逐版一致·零 DDL 需求；0043 零字节=dbhy1 :77 hash 不变量·触碰即毁台账·Ban。
- **丁=生产路径恢复 `PostgresSaver.setup()` 或运行时深径 import vendor 内部模块**：:482-483 负向声明=编辑者防线·setup 重引 runtime DDL；深径 import 仅 proof 允许（fail-loud 可接受）·运行时依赖 vendor 内部布局即脆弱耦合·Ban。
- **戊=直改 issues-final/LEDGER/execution-master-checklist 翻 AG-36 行**：翻面权归协调方·本刀零 SSOT 触·Ban。

## §2 门矩阵（起草树基线值已亲跑·EXEC 届值如实录·漂移不洗）

- 门① **`pnpm turbo typecheck --force`** EXIT=0（基线口径·ag37 §9.4 同形）。
- 门② **`pnpm turbo lint`** 全绿·root cap 5242（package.json :8）/db cap 1042（db package.json :11）**两帽精确不上浮**（新增两文件零 warning）。
- 门③ **`node scripts/ai-docs/check-docs.mjs`** EXIT=0·起草树实测 **scanned 2342 ≤ cap 2354**（:139 亲证）；本卷落卷后 +1=**2343**·余 11。
- 门④ **`pnpm install --frozen-lockfile`** EXIT=0（修法① 落地后 catalog↔lockfile 一致性·CI 同形）。
- 门⑤ **新 proof `prove:checkpoint-schema-selfcheck`** EXIT=0（环三三断言：常量=vendor 条数/匹配臂绿/失配双臂 fail-closed·隔离 PG）。
- 门⑥ **既有门回归原值**：`prove:migrate`（:362 0043 装载）/`prove:dbhy1`（:77 hash 台账含 0043 位）/`prove:uc052-checkpoint-physical`（基座包唯一直接消费方回归）三门全绿 **EXIT 原值**·基线同红如实登记不洗。

## §3 范围外（边界清单·越界即 FAIL）

1. **vendor 升级本体**（1.1.3/1.0.4 或任何 semver 移动）=范围外（§1.3 甲）。
2. **新迁移/0043 改写**=范围外（§1.3 丙·环三机守是未来升级的闸·不是本刀的活）。
3. **AG-30 checkpoint 清理/AG-31 图版本兼容闸/AG-33 pool 往返**=各自台账线·零触。
4. **api/web 侧接线**=零 langgraph 依赖（亲证）·无消费即无闸位·零触。
5. **SSOT 翻面**（issues-final/LEDGER/checklist AG-36 行）=协调方专权·零触（§1.3 戊）。
6. **est live=0**：零真实模型外呼·零生产操作·零 secrets（§6）。

## §4 依赖

- **零前置刀**：catalog 机制在基线内自初始 commit 在位（卷头前置定谳）·非在途依赖；启动闸族先例（:460）在基线内·零在飞并发刀触本刀八处接线面（§0.3-2）。
- **下游**：AG-36 行翻面权归协调方（随 EXEC 收据行使）；Renovate 下周窗起经命名 catalog 组覆盖第 4 值（零配置）。
- EXEC 若并线（主线前移）→ 照 §0 协议重 pin（漂则重锚·结论不变则只更行号·沿 ag37 §9.0 先例）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 十一值·含脚注 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/execution-master-checklist/issues-master/ai-capability-review 四件·翻面权归协调方）；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban 版本移动（§1.3 甲）；Ban 手抄 lockfile（乙）；Ban 新迁移/改 0043（丙）；Ban 生产 setup() 与运行时深径 import vendor 内部（丁）；Ban 直改 SSOT 翻行（戊）；Ban 把自检闸放 createPool 通用路径（闸只接 worker bootstrap 单点·零 checkpoint 用途的 pool 不被检）；Ban 真实模型外呼（est live=0）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全 scripted/隔离 PG·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：新 proof=纯 SQL+文件读取+隔离 PG；回归门=既有 prove 原值重跑。零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·EXEC 届八处码面）**五类标记词 grep 零命中**（四词运行时组装防自指·沿 `scripts/i6-239-gates.proof.mjs:151-163` 同源制）+行首冲突标记·对本卷亲跑 **0 命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 ag35/ag37 §7 同形制）。

## §8 停止条件与 STOP + 裁决项

- 停止四类（前置已解+判词已修/升级涉不兼容/现场漂移超注记级/验收红不可修）——**前置半解·判词两面均未修·非翻面候选**（卷头定谳）；catalog 化可行性已判可行·无不兼容（修法①）；漂移全注记级（§0.2）；起草期均未触发停止。
- **本卷 STOP=`draft:awaiting_pre_exec_dual`**（三处同值：Status 头+本节+卷尾注）·pre-exec 双审两独立外席待派→Dual PASS→协调方授权后始有 EXEC·**alone≠dual**·**Dual PASS ≠ 开工**·Ban self-approve·⛔push。

**待双审/EXEC 裁决项**：

- **①自检比较口径**：(a) `MAX(v) === EXPECTED-1` **严格等值（推荐**·双向捕捉：落后=升级未跟进·领先=回滚未回灌**）**(b) `MAX(v) >= EXPECTED-1` 下限闸（只捕落后·回滚面漏检）。
- **②常量↔vendor 绑定通道**：(a) proof 经包入口解析定位实装路径读 `dist/migrations.js` 数条目（**推荐**·零运行时依赖·vendor 布局变更即 fail-loud 强制人审）(b) proof 深径 import 执行 `getMigrations` 取数组长度（更强·依赖内部模块路径稳定·布局变更同样 fail-loud）。
- **③闸位**：(a) worker bootstrap() :460 治理闸族后 :484 前单点（**推荐**·生产 checkpoint 消费方唯一=worker）(b) db createPool 通用路径（越面·零 checkpoint 用途 pool 被连带检·§5 Ban）。
- **④断言模块宿主**：(a) packages/db `src/checkpoint-schema.ts`（**推荐**·与 0043 同宿主·db/worker 两消费形都可用）(b) 并入 migrate.ts（既有文件膨胀·导出面混载）。
- **⑤新 proof 门名**：(a) `prove:checkpoint-schema-selfcheck`@packages/db（**推荐**·§2 门⑤）(b) 并入 prove:dbhy1 扩臂（注册面零增·混载既有 hash 台账门）。

---

卷尾注：STOP=`draft:awaiting_pre_exec_dual` 三处同值（Status 头/§8/本注）·起草 2026-10-26 落卷·基线 `origin/main` @ `ab282ba81`·分支 `line/ag36-draft`·工作树 `../meetwise-ag36`·蓝本=issues-final AG-36 :48/:449-458 + LANDING-INDEX :42 + execution-master-checklist :4443 + LEDGER :712 + extrev-deps-audit :197 · 前置定谳=catalog 化机制半在位·点名直钉面与版本自检面均未修·**非翻面候选** · 修法=catalog 收编（版本零变）+0043 版本自检三环链（常量/启动一行/vendor 绑定 proof）·八处接线全 additive·零迁移零 0043 字节改 · est live=0 · pins 十一值照抄 · markers=0 · ⛔push ⛔merge 主线 ⛔force push · 翻面权归协调方 · alone≠dual · Ban self-approve。

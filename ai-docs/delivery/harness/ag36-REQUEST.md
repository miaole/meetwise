# AG-36 — checkpoint 基座依赖收编 catalog + 0043 版本自检件（REQUEST）

**Status**: **`closed`**（2026-10-26 协调方收官翻面·post-prove 双审两外席双 PASS 会签〔席1 门⑤四臂+门⑥四门+静态+卷面五域全数亲证·席2 四臂独立猎杀含 42501 独立亲跑+九路径零越值〕+判词面落主线 PR #136 merge `846e26d44` 对 HEAD `git merge-base --is-ancestor` 祖先亲证 EXIT=0·issues-final AG-36 翻面注记+checklist 翻面笔段计数勘误随链落·done 47→48·open 3→2·§9-post 同卷——前值 **`executed:awaiting_post_prove_dual`** 史录保留：EXEC 落卷 2026-10-26 翻面·前值 **`draft:awaiting_pre_exec_dual`** 双前值史录在卷：起草 2026-10-26 落卷·pre-exec 双审三轮（席1 FAIL→§9-rev 落卷·第二轮席1 PASS+席2 FAIL→§9-rev3 落卷·第三轮双 PASS 汇流）→协调方明示授权 EXEC→落码+门矩阵届值全绿·§9-EXEC 记录七字段·est live=0·Ban self-approve·alone≠dual·⛔push ⛔merge 主线）。

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
- **EXEC 落卷翻面（2026-10-26）**：本卷 STOP=**`executed:awaiting_post_prove_dual`**（三处同值翻面：Status 头+本节+卷尾注·前值 `draft:awaiting_pre_exec_dual` 史录保留于上行·落码+门矩阵届值全绿见 §9-EXEC·post-prove 双审两外席归后继席派单）。
- **收官翻面 closed（2026-10-26·协调方翻面权行使）**：本卷 STOP=**`closed`**（三处同值翻面：Status 头+本节+卷尾注·前值 `executed:awaiting_post_prove_dual` 史录保留于上行）——依据=post-prove 双审两外席双 PASS 会签（席1 门⑤四臂+门⑥四门+静态+卷面五域全数亲证·席2 四臂独立猎杀含 42501 独立亲跑+九路径零越值）+判词面（catalog 收编+0043 vendor 迁移自检）落主线 PR #136 merge `846e26d44` 对 HEAD `git merge-base --is-ancestor` 祖先亲证 EXIT=0·issues-final AG-36 翻面注记同卷落·done 47→48·open 3→2（余 AG-13 线上数据/AG-32 UNSTUB-VOICE 部署）·§9-post 同卷。

**待双审/EXEC 裁决项**：

- **①自检比较口径**：(a) `MAX(v) === EXPECTED-1` **严格等值（推荐**·双向捕捉：落后=升级未跟进·领先=回滚未回灌**）**(b) `MAX(v) >= EXPECTED-1` 下限闸（只捕落后·回滚面漏检）。
- **②常量↔vendor 绑定通道**：(a) proof 经包入口解析定位实装路径读 `dist/migrations.js` 数条目（**推荐**·零运行时依赖·vendor 布局变更即 fail-loud 强制人审）(b) proof 深径 import 执行 `getMigrations` 取数组长度（更强·依赖内部模块路径稳定·布局变更同样 fail-loud）。
- **③闸位**：(a) worker bootstrap() :460 治理闸族后 :484 前单点（**推荐**·生产 checkpoint 消费方唯一=worker）(b) db createPool 通用路径（越面·零 checkpoint 用途 pool 被连带检·§5 Ban）。
- **④断言模块宿主**：(a) packages/db `src/checkpoint-schema.ts`（**推荐**·与 0043 同宿主·db/worker 两消费形都可用）(b) 并入 migrate.ts（既有文件膨胀·导出面混载）。
- **⑤新 proof 门名**：(a) `prove:checkpoint-schema-selfcheck`@packages/db（**推荐**·§2 门⑤）(b) 并入 prove:dbhy1 扩臂（注册面零增·混载既有 hash 台账门）。

## §9-rev rev 修订注记（pre-exec 双审第一轮席1 FAIL 清单 P0×1+P1×2+P2×6 回路 · rev 席落卷 2026-10-26 · **append 注记形 · 上文 §0-§8 一字不洗** · EXEC 期与上文冲突处以本节为准读）

**rev 缘由**：pre-exec 双审第一轮席1 FAIL 清单（P0 一件+P1 两件+联动一件+P2 五件承六发现点 F-4/F-5/F-6/门④增肢/F-8 新登记）·本席逐位届树亲证（证据随条）后按 rev 回路落卷（只改本卷·纯文面零码动·码面/migrations/LEDGER/SSOT/他卷零触·落卷形=append 不洗·EXEC 期以下列修正句为准读）。**九件全部届树成立落修正·零跳过**；P2 清单词面「五件」承六发现点（A.3 定性与暴露面改锚 F-4 合条落 §9-rev.5 两修正句）·计数口径差如实登记随条。**STOP 维持 `draft:awaiting_pre_exec_dual` 三处同值零翻**（Status 头/§8/卷尾注）·**rev 落卷后重派 pre-exec 双审两独立外席第二轮·窄域=本节落点复验·alone≠dual·Ban self-approve**。

### §9-rev.1 修订①（P0·闸位重写）——自检闸位由 worker bootstrap 迁至 migrate 服务 post-flight

- **届树亲证（推翻原环二权限申明的实证链三段）**：①`packages/db/migrations/0045_checkpoint_thread_rls.sql` blob HEAD 重 pin=`23ba67d304eec310281c4308d7281b6d1d98f7bc`（`git rev-parse HEAD:` 亲证·文件恰 72 行）**:70-71 注释立场「Runtime never calls PostgresSaver.setup(); migration bookkeeping is not a data-plane capability and stays with the migration login.」+:72 `REVOKE ALL ON checkpoint_migrations FROM app_role;`**——0043 :24 GRANT 的 checkpoint_migrations 读权已被后迁移 0045 **全量收回**·原环二句「app_role 读权已由 0043 :24 GRANT 在位·零权限面新增」失真；②运行时执行身份=provisionRuntimeLogin（`packages/db/src/principal.ts:579-594`·CREATE/ALTER ROLE `… LOGIN NOINHERIT … NOBYPASSRLS` :584/:590 亲证）——两执行身份（migration bookkeeping 归 migration login 立场+app_role NOINHERIT 低权）对 checkpoint_migrations 裸读**全堵**·worker bootstrap 闸位（原环二 :484 前插·asPrincipal 通道）实跑 `SELECT … FROM checkpoint_migrations` 必 SQLSTATE **42501**（insufficient_privilege）=结构性不可达；③蓝本先例自证：verifyModelCostGovernance（`apps/worker/src/model-cost-governance.ts:65`·:58-64 注释原文「It can only ask a fixed SECURITY DEFINER predicate whether every configured immutable binding is still present and enabled.」）经 `ai_cost_text_price_binding_matches_scoped` **SECURITY DEFINER 谓词**读·非裸表读——启动闸族既有先例的立场恰是「运行时不裸读受控表」·原环二裸读闸与先例相悖。
- **修正句一（§1 修法② 环二整段重写）**：环二→「**migrate 服务 post-flight 接线（packages/db/src/migrate-cli.ts）**：main() 于 `runMigrations(pool, migrations)` 返回后（既有 post-flight assert 族 assertQbankControlExecutorIdentity/assertRagControlExecutorIdentity 同形先例在位）插 `await assertCheckpointMigrationsCurrent(pool)`——以 migrate 连接（migration login·持权身份）实跑 MAX(v)=常量校验·mismatch 抛 `checkpoint_migrations_version_mismatch`→main catch EXIT 1·**部署迁移期 fail-closed 拒绝**（错在部署闸时点立场原样·且与 migrate-cli.ts :1 头注「intentionally separate from API/worker startup」自洽·触面归 §2 门⑥ prove:migrate 回归覆盖）」。原句「app_role 读权已由 0043 :24 GRANT 在位·零权限面新增」**删**（实证链=上述①②③·零权限面新增申明反向成立：运行时面本就零读权·闸位不得设在无权身份通道）。
- **修正句二（蓝本修法语义收窄登记）**：蓝本修法 issues-final :457「**启动时校验** checkpoint_migrations 的最大版本」语义收窄为「**部署迁移期校验**」（migrate 服务 post-flight 通道）——语义收窄非翻案：闸仍在部署路径 fail-closed（mismatch=migrate job EXIT 1·部署被拒）·判词红面捕捉时点不变（升级失守拦在部署闸·不在途运行期）·EXEC 期「启动时」一律读作「部署迁移期」。
- **修正句三（裁决③ 连带重述·单点语义）**：裁决③→「(a) **migrate 服务 post-flight 单点（推荐·修订后）**——部署迁移期校验·migration login 为唯一持读权身份·『生产 checkpoint 消费方唯一=worker』事实面不变但 worker 不再是闸位 (b) worker bootstrap :484 前位**改列 Ban**（双重理由：越面+0045 :72 REVOKE 后 app_role 读 checkpoint_migrations 必 42501=结构性不可达）(c) db createPool 通用路径 Ban 维持（§5 同步见 §9-rev.4）」。裁决①②④⑤ 零翻。
- **联动随条**：§0.1 锚表 4 号 worker main.ts 行「修法② 插位点即 :482 前」注记失效（闸位迁出·main.ts 全零触）；§0.3-2 交叠触面清单「worker main.ts 一行」→「packages/db/src/migrate-cli.ts post-flight 一处」。

### §9-rev.2 修订②（P1·§0/§0.3）——0045 锚行增补+权限史结构约束第四条+LANDING-INDEX 失真引删

- **届树亲证**：①0045 blob 重 pin 与 :70-72 行锚逐行 sed 亲证（见 §9-rev.1①）；②LANDING-INDEX 失真引：`ai-docs/delivery/ai-capability-review/LANDING-INDEX.md` 全文件 grep「LG-23」**EXIT=1 零行**·:42 实为「六、落地形式调整账」节表格行与 LG-23 无涉——卷头蓝本②「LANDING-INDEX :42 LG-23 行（映射 AG-36·成立）」系失真引。
- **修正句一（§0.1 blob 锚表增第 13 行）**：`| 13 | packages/db/migrations/0045_checkpoint_thread_rls.sql | 23ba67d304eec310281c4308d7281b6d1d98f7bc | :70-71 注释立场「migration bookkeeping … stays with the migration login」+:72 REVOKE ALL ON checkpoint_migrations FROM app_role——本刀闸位迁 migrate 侧的权限面实证锚 |`。
- **修正句二（§0.3 增第 4 条·结构约束）**：4. **checkpoint_migrations 权限史（结构约束第四条）**：0043 :24 `GRANT SELECT, INSERT, UPDATE, DELETE ON checkpoint_migrations, checkpoints, checkpoint_blobs, checkpoint_writes TO app_role` → 0045 :72 `REVOKE ALL ON checkpoint_migrations FROM app_role`——净态=**运行时（app_role）对 checkpoint_migrations 零读权**（与 vendor 不导出迁移清单并列·自检闸位选择的第二硬约束：闸只能落在持读权身份=migration login 的唯一通道=migrate post-flight）。
- **修正句三（失真引删）**：卷头蓝本② LANDING-INDEX :42 引**删**（LG-23 行届树不存在·grep EXIT=1 亲证）·蓝本面收窄为四件=issues-final AG-36 :48/:449-458+execution-master-checklist :4443+product-campaign-LEDGER :712+extrev-deps-audit :197；卷尾注行内附注同步（见卷尾 rev 附注）。

### §9-rev.3 修订③（P1·§2 门⑤）——身份可达性负例臂（42501 机器断言）

- **届树亲证**：migrate 通道生产身份=migrate-cli.ts :5 `createPool({ purpose: 'migrate' })`（migration login·checkpoint_migrations 唯一持读权身份）；运行时身份=app_role（0045 :72 REVOKE 后零读权·§9-rev.2 结构约束第四条）——两身份可达性差=闸位正确性承重面·现门⑤ 断言集（环三三断言）未锁·文面申明无机器闸。
- **修正句（§2 门⑤ 增第④臂·身份负例）**：门⑤→「新 proof `prove:checkpoint-schema-selfcheck` EXIT=0（环三断言：常量=vendor 条数/匹配臂绿/失配双臂 fail-closed·隔离 PG；**增第④臂身份可达性机器断言**：正例臂——按选定生产身份（migrate purpose 通道·migration login）实跑 `assertCheckpointMigrationsCurrent` 断言**可达**（seeds (0)-(4) 臂通过·失配臂抛 mismatch 照环三）；负例臂——`SET ROLE app_role` 形实跑同函数断言预期 **SQLSTATE 42501**（insufficient_privilege）——0045 :72 运行时零读权由机器断言锁定·未来迁移若回授读权此臂即红·强制复审闸位）」。

### §9-rev.4 修订④（联动）——§1.3 丙确认句+§5 Ban 同步+「零迁移」全套口径核

- **修正句一（§1.3 丙 确认句 append）**：丙 尾 append「**闸位在 migrate 侧零迁移成立确认**：自检件=post-flight SELECT 读校验（非迁移件·零 DDL·零迁移文件新增）·0043 零字节=dbhy1 :77 hash 不变量照旧·Ban 新迁移/改 0043 原样成立」。
- **修正句二（§5 Ban 同步）**：「Ban 把自检闸放 createPool 通用路径（闸只接 worker bootstrap 单点·零 checkpoint 用途的 pool 不被检）」→「Ban 把自检闸放 createPool 通用路径或 worker bootstrap 运行时路径（**闸只接 migrate 服务 post-flight 单点**·零 checkpoint 用途的 pool 不被检·worker bootstrap 位经 0045 :72 REVOKE 后结构性不可达=42501）」。
- **修正句三（「零迁移」全套口径核）**：§1 修法③/§1.2/§3-2/§4/卷尾注 各「零迁移」位逐一届树复核**全线成立**——migrate-cli.ts=migrate 服务代码非迁移件·校验=SELECT 非 DDL·闸位迁移零增迁移面；§1 修法③「八处全 additive·零迁移零 0043 字节改零产品行为变」结论原样·编辑点计数随 §9-rev.7 重述（5 tracked 改+2 新增=7 路径·八处编辑点）。

### §9-rev.5 修订⑤（P2-①·F-4）——红事实 A.3 定性改「devDependencies 内直钉」+暴露面改锚 worker dependencies+peerDeps

- **届树亲证**：①`packages/db/package.json` `"devDependencies"` 始 **:108**·:112 checkpoint-postgres=`catalog:langchain`+:113 基座=`"1.1.3"` 两键均在 devDependencies 块内（:108-114 亲证）——原 A.3「测试依赖误置生产 dependencies 形」定性失真；②暴露面实链：`apps/worker/package.json` **:169 `"dependencies"` 块 :170-171** 双 `catalog:langchain`（langgraph+checkpoint-postgres·生产运行时消费面）+lockfile :931-938 checkpoint-postgres@1.0.4 **peerDependencies** 基座 `^1.0.0`（:935-937 亲证）——分叉进入路径=worker 运行时 catalog 消费+peer 范围拉新基座。
- **修正句一（红事实 A.3）**：「直钉的存在本身即测试依赖误置生产 dependencies 形」→「直钉的存在本身即 **devDependencies 内直钉**绕 catalog 形（:108 块内 :113 字面）」——绕 catalog 红面/消费方唯一（产品 src 零 import·唯 uc052 proof :11）/收编 catalog 不改语义零风险 三结论均不变·仅定性面修正。
- **修正句二（红事实 A.2 暴露面改锚）**：暴露面锚由「:113 直钉不随动」扩正为「**worker dependencies :169-171**（:170/:171 双 catalog:langchain 消费）+vendor **peerDeps**（lockfile :931-938·checkpoint-postgres@1.0.4 peerDependencies 基座 `^1.0.0` :935-937）拉新基座——db devDeps :113 直钉不随动=分叉固着点」——版本双源分叉无机器闸结论不变·进入路径锚修正（F-4）。

### §9-rev.6 修订⑥（P2-②·F-5）——红事实 B.3 命中清点改「一 proof 两处」

- **届树亲证**：全仓 .ts `checkpoint_migrations` 命中=packages/db/test 恰 **一 proof 两处**（`uc052-checkpoint-physical.proof.ts` :870 `SELECT count(*)… FROM checkpoint_migrations`+:914 RLS 排除注记 `checkpoint_migrations: 'excluded (not per-thread)'`·grep 亲证；`migrate.proof.ts` **零命中** EXIT=1 亲证）。
- **修正句**：卷头前置定谳③「全仓 .ts 命中仅 packages/db/test 两 proof」→「仅 packages/db/test **一 proof 两处**（uc052-checkpoint-physical :870/:914·F-5）」；红事实 B.3 证据面同口径收窄——「产品源运行时引用零命中·启动期无任何闸」结论不变·仅命中清点修正。

### §9-rev.7 修订⑦（P2-③·F-6）——§1.2 触面计数重计（闸位迁 migrate 侧联动）

- **修正句（§1.2 整段重述）**：→「**5 tracked 改**（pnpm-workspace.yaml/packages/db/package.json/pnpm-lock.yaml/packages/db/src/index.ts/packages/db/src/migrate-cli.ts）**+2 新增**（src/checkpoint-schema.ts/test/checkpoint-schema.proof.ts）**=7 路径·八处编辑点**（①workspace +1 行 ②db pkg :113 改值 ③db pkg scripts +1 门名行 ④lockfile regen ⑤index.ts +1 导出行 ⑥migrate-cli.ts post-flight 接线一处 ⑦checkpoint-schema.ts 落盘 ⑧proof 落盘）；**worker main.ts 移出触面**（worker 全零触·§0.3-2 联动见 §9-rev.1）·零历史迁移触·零 SSOT 触·零 env 闸·web/api 零触 原样」（F-6）；§1 修法③ 接线清单同步（main.ts 行→migrate-cli.ts 行·余七处同形）。

### §9-rev.8 修订⑧（P2-④）——门④ 附 lockfile 断言（specifier=收编形+resolved 字节不变）

- **修正句（门④ append）**：门④→「`pnpm install --frozen-lockfile` EXIT=0（CI 同形）+**lockfile 断言**：importers 面 `packages/db` 的 `@langchain/langgraph-checkpoint` specifier=`catalog:langchain`（收编后形态）+lockfile `@langchain/langgraph-checkpoint@1.1.3` resolved 条目（:938 integrity `sha512-wgzdQNeE…` 起首）与基线**逐字节不变**——收编只改 specifier 来源不改锁实值·版本零变（§1.3 甲）由字节不变断言机守」。

### §9-rev.9 修订⑨（P2-⑤·F-8 登记）——未来升级刀纪律（新迁移+常量提版同 commit 同部署单元）

- **登记句（append·非修正）**：checkpoint 基座/postgres 族版本移动届时=**新迁移+常量提版同 commit 同部署单元**——`EXPECTED_CHECKPOINT_MIGRATIONS` 提版与 00xx 新迁移（0043 头注 :3-4「Package upgrades that alter this schema require a new reviewed migration before deployment」纪律的机守化）必须同 commit 落·同部署单元过 migrate post-flight 闸（闸以常量为期望·拆步=部署窗 MAX(v)≠常量→EXIT 1 fail-closed 拒部署）·本刀零涉（§1.3 甲/§3-1 Ban 版本移动原样）·登记在案防未来刀拆步（F-8）。

**rev 自检回执**：`git diff --numstat` 恰 1 tracked 本卷 .md（§0-§8 一字不洗·纯 append+卷尾注行内 append）；`node scripts/ai-docs/check-docs.mjs` EXIT=0（rev 时点亲跑·既有文件 append 零新增文件·scanned 2343 ≤ cap 2354）；markers 五类标记词（运行时组装·沿 `scripts/i6-239-gates.proof.mjs:151-163` 同源制）+行首冲突标记对改动面直扫 **0 命中**（本席亲跑·本节零引承重词面·零新增标记词落卷）；码面/migrations/LEDGER/SSOT/他卷零触；est live=0（rev turn 全只读+1 doc append·pins 脚注 `actualSpendCny=null` 同源）；**STOP=`draft:awaiting_pre_exec_dual` 三处同值零翻**（Status 头/§8/卷尾注）·rev 落卷后重派 pre-exec 双审两独立外席第二轮·窄域=本节落点复验·alone≠dual·Ban self-approve。

## §9-rev3 rev 修订注记 第二轮（pre-exec 双审第二轮席1 PASS+席2 FAIL 清单 P1×1+P2×5 回路 · rev 增补席落卷 2026-10-26 · **append 注记形 · 上文 §0-§8 及 §9-rev 各修正句正文字面零洗** · EXEC 期与上文及 §9-rev 冲突处以本节为准读）

**rev3 缘由**：pre-exec 双审第二轮（窄域=§9-rev 落点复验）席1 PASS·席2 FAIL 清单 P1 一件（门⑥覆盖申明指错门）+P2 五件——增补代价极小·纯文面。本席逐位届树亲证（`grep -n`/`sed -n`/`git rev-parse HEAD:` 实测·证据随条）后按 rev 回路落卷（只改本卷·纯文面零码动·码面/migrations/LEDGER/SSOT/他卷零触·落卷形=append 不洗）。**六条全部届树成立落修正·零跳过**；席2 条1「可选增强」登记为非必需（是否落入 EXEC 裁决项·见 §9-rev3.1 可选增强句）。**STOP 维持 `draft:awaiting_pre_exec_dual` 三处同值零翻**（Status 头/§8/卷尾注）·**rev3 落卷后重派 pre-exec 双审两独立外席第三轮·窄域=本节六条落点复验·alone≠dual·Ban self-approve**。

### §9-rev3.1 修订一（P1·门⑥覆盖申明指错门）——门⑥增列 prove:migrate-cli 第四门+§9-rev.1 触面归门改指

- **届树亲证（失真申明实证链三段）**：①`packages/db/test/migrate-cli.proof.ts` **:51** `spawn('pnpm', ['-C', 'packages/db', 'migrate'], …)` 真实子入口（child exit code 即 db 包 `migrate` script→`tsx src/migrate-cli.ts` 实跑结果）·**:63/:68 双跑**（`first`/`second = await runMigrationCli()`·双跑 contract 断言=二跑须验已封 manifest 而非抢 ownership）：②`.github/workflows/ci.yml` **:299** 实挂 `run: pnpm migrate-cli:prove`（root package.json :589→`node scripts/run-e2e-isolated.mjs migrate-cli:prove:raw`·:590→`pnpm -C packages/db prove:migrate-cli`·db package.json :30 门名在位）；③**`prove:migrate`（test/migrate.proof.ts）不执行 migrate-cli.ts**——该文件全文件 grep「migrate-cli」EXIT=1 亲证（其测 loadMigrations/runMigrations 模块面·非 CLI 入口）；而 migrate-cli.ts 系 §9-rev.7 编辑点⑥（post-flight 接线一处）——**该文件唯一行为回归承重门即 prove:migrate-cli**·§9-rev.1 修正句一「触面归 §2 门⑥ prove:migrate 回归覆盖」申明指错门=失真（编辑点⑥行为面零门覆盖则申明不闭合）。
- **修正句一（§2 门⑥ 增列第四门）**：门⑥→「既有门回归原值：`prove:migrate`（:362 0043 装载）/`prove:dbhy1`（:77 hash 台账含 0043 位）/`prove:uc052-checkpoint-physical`（基座包唯一直接消费方回归）/**`prove:migrate-cli`**（migrate-cli.proof.ts :51 spawn 真实子入口 `pnpm -C packages/db migrate`·:63/:68 双跑 contract 断言·ci.yml :299 实挂）**四门全绿 EXIT 原值**·基线同红如实登记不洗」。
- **修正句二（§9-rev.1 修正句一 触面归门改指）**：「触面归 §2 门⑥ prove:migrate 回归覆盖」→「**触面归门⑥ prove:migrate-cli 回归覆盖**」——migrate-cli.ts 编辑点⑥之行为回归由 prove:migrate-cli 子入口实跑承接·prove:migrate 不执行该文件（亲证③）·原申明失真勘误。
- **可选增强句（非必需·是否落交 EXEC 裁决）**：migrate-cli.proof 可增失配臂（tamper checkpoint_migrations → child EXIT 1）——落则 post-flight 闸 mismatch→EXIT 1 fail-closed 链路由 CLI 门机器直锁；未落则该链路由门⑤失配双臂+§9-rev3.2 两闸串联文面承接·**非必需·不落不减席2 六条闭合**。

### §9-rev3.2 修订二（P2-1·§9-rev.1 修正句二 append）——两闸串联闭合申明

- **修正句（§9-rev.1 修正句二 尾 append）**：「**常量↔DB 面由 migrate 闸捕（拆步/回滚）·常量↔vendor 面由环三① prove 闸捕·两闸串联方闭合判词红面**」——判词红面（升级时 vendor 新版 0043 不跟·在途运行期 SQL 报错）捕捉链两段：vendor 换版→环三① 常量=vendor 条数断言红（强制「新迁移+常量提版」·§9-rev.9 纪律）→新常量↔旧 DB MAX(v) 失配由 migrate post-flight 闸红（EXIT 1 拒部署）——单闸各有盲面·串联方全闭。

### §9-rev3.3 修订三（P2-2·门⑤第④臂 append 装库形前置）

- **修正句（§9-rev.3 修正句 门⑤第④臂 尾 append）**：「**装库形前置：loadMigrations+runMigrations 全量真实迁移集（含 0045 REVOKE·migrate.proof.ts :362 家族形——:363 同族断言 0045 装载亲证）·0043-only 手工种子形禁用**（0043 :24 GRANT 在效则 0045 :72 REVOKE 未落·app_role 对 checkpoint_migrations 读权未收·第④臂负例必红=种子形反证闸失真；全量集装库后净态=REVOKE 在效·负例臂方绿）」。

### §9-rev3.4 修订四（P2-3·门⑤第④臂文本钉形）

- **修正句（§9-rev.3 修正句 门⑤第④臂 负例臂执行形钉死）**：负例臂文本钉形：「**单 checkout 客户端 BEGIN+SET LOCAL ROLE app_role（dbhy1 :465 形**——「单一 checkout 客户端内 BEGIN+SET LOCAL ROLE 定界（pool.query 跨连丢 SET ROLE·同上实测）」注释原位亲证）·**先断 SET ROLE 成功·后断 SELECT 抛 `e.code==='42501'`**（防 SET ROLE 自身 42501 空过——若 SET 即被拒·SELECT 断言未达而臂误绿）」。

### §9-rev3.5 修订五（P2-4·引证行漂三处批注）

- **届树亲证**：①`packages/db/src/migrate-cli.ts` **:6** `createPool({ purpose: 'migrate' })`（:5=`async function main()` 行·§9-rev.3 引 `:5` 漂 1 行）；②`packages/db/src/principal.ts` CREATE ROLE 字面 **:587**/ALTER ROLE 字面 **:594**（§9-rev.1 引 `:584/:590` 系 connect/query 包裹层行·漂至字面行）；③`pnpm-lock.yaml` **:939** `@langchain/langgraph-checkpoint@1.1.3` integrity `sha512-wgzdQNeE…`（:938=键名行·§9-rev.8 引 `:938` 漂 1 行）。
- **修正句（三处批注）**：§9-rev.3 `:5`→`:6`；§9-rev.1 `:584/:590`→`:587/:594`；§9-rev.8 `:938`→`:939`——三处均行漂注记级·结论零变（EXEC 立项照 §0 协议届时全量重 pin 原样）。

### §9-rev3.6 修订六（P2-5·§9-rev.1 修正句二 append 残余登记+EXEC 期容器依赖预登）

- **修正句一（§9-rev.1 修正句二 尾 append·残余登记）**：「**残余登记：migrate 后带外漂移（两部署窗间手工 DDL/vendor 直写）至下次 migrate 前不可见·接受为语义收窄同类残余（原启动闸对启动后漂移同盲·收窄不新增盲面）**」。
- **修正句二（EXEC 期容器依赖预登）**：门⑤新 proof 与 prove:migrate-cli 均需 **isolated loopback PG 容器**（`scripts/run-e2e-isolated.mjs` 家族·root package.json :589 既有挂载先例在位）——EXEC 期门⑤新 proof 入该家族挂载·非新基础设施·est live=0 不变（纯容器本地 SQL·零模型外呼零 secrets）。

**rev3 自检回执**：`git diff --numstat` 恰 1 tracked 本卷 .md（§0-§8 及 §9-rev 正文字面零洗·纯 append+卷尾注行内 append）；`node scripts/ai-docs/check-docs.mjs` EXIT=0（rev3 时点亲跑·既有文件 append 零新增文件·scanned 2343 ≤ cap 2354）；markers 五类标记词（运行时组装·沿 `scripts/i6-239-gates.proof.mjs:151-163` 同源制）+行首冲突标记对改动面直扫 **0 命中**（本席亲跑）；码面/migrations/LEDGER/SSOT/他卷零触；est live=0（rev3 turn 全只读+1 doc append·pins 脚注 `actualSpendCny=null` 同源）；**STOP=`draft:awaiting_pre_exec_dual` 三处同值零翻**（Status 头/§8/卷尾注）·rev3 落卷后重派 pre-exec 双审两独立外席第三轮·窄域=本节六条落点复验·alone≠dual·Ban self-approve。

## §9-EXEC EXEC 记录（EXEC 席 2026-10-26·rev3 后 pre-exec 双审第三轮双 PASS 汇流+协调方明示授权 EXEC·七字段·**append 注记形·上文 §0-§8 及 §9-rev/§9-rev3 正文字面零洗·EXEC 期届值以本节为准读**）

**①授权链+立项重 pin**：rev3 落卷后 pre-exec 双审第三轮两独立外席双 PASS 汇流+协调方明示授权 EXEC。立项照 §0 协议届树（HEAD=`8c3da8e8c`·分支 `line/ag36-draft`·工作树 `../meetwise-ag36`）全量重 pin·**零定性漂·结论零改**：`packages/db/package.json:113` 直钉 `"1.1.3"` 原样（devDependencies 块 :108 起）/`pnpm-workspace.yaml:13-17` 具名 catalog 三值原样/`migrate-cli.ts` :6 `createPool({ purpose: 'migrate' })`+:15 `runMigrations`+:59 `assertQbankControlExecutorIdentity` 同族先例/`dbhy1.proof.ts` :77 0043 hash 台账+:465 邻域 BEGIN+SET LOCAL ROLE 定界形/`migrate.proof.ts` :362-363 0043+0045 装载断言/0043 blob `a771894d…`/0045 blob `23ba67d3…`+:70-72 立场注释与 `REVOKE ALL ON checkpoint_migrations FROM app_role`/vendor 实装亲证=`@langchain/langgraph-checkpoint@1.1.3`+`@langchain/langgraph-checkpoint-postgres@1.0.4`·exports 无 `./migrations` 子径·`dist/index.js` 根出 `PostgresSaver`·`dist/migrations.js` `getMigrations` 恰 5 条·peerDeps 基座 `^1.0.0`。基线 `pnpm install --frozen-lockfile` EXIT=0（动工前亲跑）。

**②码面落点（§1 修法①+②·rev1-rev3 终形·核心八处编辑点+rev3.6 挂载两路径）**：(i) `pnpm-workspace.yaml` catalogs.langchain 增第 4 值 `'@langchain/langgraph-checkpoint': 1.1.3`（版本零 semver 变）；(ii) `packages/db/package.json` devDependencies 内 `@langchain/langgraph-checkpoint` 值 `"1.1.3"`→`"catalog:langchain"`（scripts 门名行插入后该键行由 :113 漂 :114·收编语义零变）；(iii) 同文件 scripts +1 门名行 `"prove:checkpoint-schema-selfcheck": "tsx test/checkpoint-schema.proof.ts"`；(iv) `pnpm-lock.yaml` 经 `pnpm install` 重生成（**diff 4+/1-**：catalogs 段 +3 行+importers `packages/db` specifier 替换·`@langchain/langgraph-checkpoint@1.1.3` resolved 条目 integrity `sha512-wgzdQNeE…` 与基线**逐字节不变**亲证=版本零变机守）；(v) `src/checkpoint-schema.ts` 新文件：`EXPECTED_CHECKPOINT_MIGRATIONS = 5`（头注载 vendor 1.0.4 与「最大版本=条数-1」换算）+`CHECKPOINT_MIGRATIONS_VERSION_MISMATCH`+`assertCheckpointMigrationsCurrent(client: Client | DbPool)`——`SELECT COALESCE(MAX(v), -1) FROM checkpoint_migrations` **严格等值 `MAX(v) === EXPECTED-1`**（裁决① a 案·NULL 空表经 COALESCE 承载·双向 fail-closed）·mismatch 抛 `Error` 附 `code='checkpoint_migrations_version_mismatch'`；(vi) `src/index.ts` +1 additive 导出行（三导出名同行）；(vii) `src/migrate-cli.ts` import 续排+**post-flight 一处**：`runMigrations(pool, migrations)` 返回后即插 `await assertCheckpointMigrationsCurrent(pool)`（migrate purpose 连接=migration login·唯一持读权身份·mismatch→main catch `process.exit(1)` fail-closed 拒部署·沿 :59 assertQbankControlExecutorIdentity 同族 post-flight 先例·§9-rev3.5 行漂批注后锚位）；(viii) `test/checkpoint-schema.proof.ts` 新文件（门⑤ 四臂·见③）；(ix) **§9-rev3.6 挂载令行使两路径**：根 `package.json` +2 行（`checkpoint-schema:prove`→`node scripts/run-e2e-isolated.mjs checkpoint-schema:prove:raw`+`:raw`→`pnpm -C packages/db prove:checkpoint-schema-selfcheck`·migrate-cli:prove 挂载先例同形）+`scripts/run-e2e-isolated.mjs` 3 注册点（isolatedReceiptSources 条目+known-target 名单+isolatedCommand 链映射·全 additive·各沿 migrate-cli 同形）。**worker main.ts 零触**（§9-rev.1 修正句三·Ban 维持）·migrations 零字节改（`git diff -- packages/db/migrations` 空亲证）·0043 零字节·零 SSOT 触。

**③门矩阵届值（届时实跑·全绿）**：**门①** `pnpm turbo typecheck --force` **8/8 successful EXIT=0**。**门②** `pnpm turbo lint --force` **12/12 EXIT=0**·两帽精确恰等=root **5242**（根 package.json :8 cap 5242·0 errors 5242 warnings）/db **1042**（db package.json :11·0 errors 1042 warnings）——新增面零新增 warning·零上浮。**门③** `node scripts/ai-docs/check-docs.mjs` **EXIT=0**·scanned **2345 ≤ cap 2354**（:139 亲证）——对 rev3 回执 2343 **+2 归因=本卷两新增 .ts 文件计入受管扫描**（受管根 `packages/`+文本扩展 `.ts` 双条件·B2o §9-C 勘误同源口径）·余 9。**门④** `pnpm install --frozen-lockfile` **EXIT=0**（收编后亲跑·CI 同形）+lockfile 断言（②(iv) 三面全中）。**门⑤** `prove:checkpoint-schema-selfcheck` **EXIT=0**（隔离 loopback PG 容器·rev3.6 家族挂载实跑·receipt 落盘）四臂全 PASS：①常量=已装 vendor 条数（`vendor=5 expected=5`·包入口 `require.resolve` 定位实装路径→读 `dist/migrations.js` return 数组计数·裁决② a 案·布局变更 fail-loud）③0043 sha256=`f12c3026…9123` 与 dbhy1 :77 台账逐位一致②装库形=loadMigrations+runMigrations **全量真实迁移集 216 文件 applied=216 skipped=0**（含 0043+0045·rev3.3 前置·0043-only 手工种子形未用）·seed 形 `[0,1,2,3,4]`·匹配臂绿·失配三臂 fail-closed（behind 缺 v4/ahead 多 v5/NULL 空表→`checkpoint_migrations_version_mismatch`）④正例臂=migrate login 实跑可达绿·负例臂=**单 checkout 客户端 BEGIN+SET LOCAL ROLE app_role（dbhy1 :465 形）·先断 SET ROLE 成功（`current_user=app_role` 实值回显·防 SET ROLE 自身 42501 空过）·后断 SELECT→SQLSTATE `42501` 实跑值**（0045 :72 REVOKE 机器锁定·rev3.4 钉形照落）。**门⑥** 四门 **EXIT 原值全绿**：`prove:migrate` EXIT=0（隔离 PG 全量装载+runner 合同断言全绿）/`prove:migrate-cli` EXIT=0（migrate-cli.proof :51 spawn 真实子入口 `pnpm -C packages/db migrate` **双跑**·本刀 post-flight 接线在两跑中零 mismatch 输出·manifest/login=verified/provisioned 合同全绿=编辑点⑦行为回归由第四门承接·§9-rev3.1 修正句二兑现）/`prove:dbhy1` EXIT=0（28 断言全绿·:77 hash 台账含 0043 位）/`prove:uc052-checkpoint-physical` 见④（C-UNCOMMITTED 净树门时序·净树重跑 **EXIT=0** 17/17 cases pass）。

**④落卷时序+commit 形（B2g–B2n–B2o 先例）**：uc052 proof :206-209 的 **C-UNCOMMITTED 净树门**（脏树 `git status --porcelain` 非空即 refuse·proof 自证 gitSha 防 fake-green）机器强制「先 commit 后跑」——脏树首跑如实登记=`C-UNCOMMITTED refuse`（**机器守卫非功能红**·九路径本刀改动集即脏源）；沿同 proof 先例：首版 commit **`f921caa30c552ad8c4741bf7fd4308367211d131`**（净消息照令 `fix(db): checkpoint 基座依赖收编 catalog——迁移版本启动自检`·九路径 260 insertions/4 deletions·secret gate passed）→净树重跑 uc052 **EXIT=0**（17/17 cases·输出自证 `gitSha=f921caa30…d131`·receipt 落盘）→本 §9-EXEC+STOP 三处翻面经 **`git commit --amend` 折入**（docs-only 增量·净消息不变）·**终版 hash 见交付报告**（首版 hash 即 uc052 gitSha 亲证值· amend 增量 docs-only 对 uc052 码面零涉）。

**⑤偏离登记（三项·零 Ban 项）**：(a) **触面实账 9 路径对 §9-rev.7 七路径 +2=§9-rev3.6 挂载令行使**（根 package.json+`scripts/run-e2e-isolated.mjs`）——届树亲证 wrapper 无通用 passthrough（未注册 target→known-target 名单 `unsupported_e2e_target` throw+isolatedCommand 链末端 `undefined`）·「门⑤新 proof 入该家族挂载」非注册不可达·rev3 冲突条款（EXEC 期以本节为准读）控制·+2 两路径全 additive 注册面·核心七路径与 rev.7 逐位一致；(b) **docs:check scanned 2345 对 REQUEST 预计 2343 +2**=两新增 .ts 计入（见③门③·谱系归因非本卷 .md 面）；(c) **uc052 脏树首跑 refuse→净树重跑绿**（见④·两态均如实登记不洗·非 retry-to-green：首跑红因=机器守卫时序非断言失败·净树重跑为该门唯一合法行使形）。

**⑥est live=0+pins 零翻**：prove 全系隔离 loopback PG 容器（run-e2e-isolated 家族·wrapper 自建自清 `meetwise-e2e-*` 容器零残留亲证）+文件读取+纯 SQL·零模型真实外呼·零生产操作·零 secrets·零消耗；pins 十一值照抄零翻（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null）。

**⑦STOP**：**`executed:awaiting_post_prove_dual`**（Status 头/§8/卷尾三处同值翻面·前值 `draft:awaiting_pre_exec_dual` 史录保留·append 不洗·post-prove 双审两外席归后继席派单）·est live=0·⛔push ⛔merge 主线 ⛔force push。

**EXEC 自检回执**：markers 五类标记词（运行时组装·沿 `scripts/i6-239-gates.proof.mjs:151-163` 同源制）+行首冲突标记对九路径改动面（tracked diff+两新增文件）直扫 **0 命中**（本席亲跑）；migrations 零字节改亲证（`git diff -- packages/db/migrations` 空）；LEDGER/execution-master-checklist/issues-final/他卷零触（翻面权归协调方）；est live=0（pins 脚注 `actualSpendCny=null` 同源）。

## §9-post post-prove 双审收官登记（2026-10-26 · post 双审两外席双 PASS 会签 · 协调方翻面权行使 · append-only · **STOP 翻面 `closed`** 三处同值：Status 头/§8/卷尾注）

- **席1 post-prove PASS**：门⑤ proof 四臂（checkpoint-schema 常量链+严格等值+post-flight 通道+42501 负例实跑值）+门⑥四门全数亲跑 EXIT=0+静态门（typecheck/lint/frozen-lockfile/docs:check）复跑同值+卷面五域（落点/门矩阵/偏离/预算/STOP）全数亲证——零 P0/P1。
- **席2 post-prove PASS**：四臂独立猎杀（含 42501 独立亲跑·非承席1 读数）+九路径改动面零越值（越界扫描零命中·触面=核心七+rev3.6 挂载两在树逐位亲读）——零 P0/P1。
- **判词面落主线亲证**：catalog 收编（版本零变）+0043 vendor 迁移自检三环链=主线承载 PR #136 merge `846e26d44` 对 HEAD `git merge-base --is-ancestor` 祖先亲证 EXIT=0。
- **收官动作**：本卷 STOP 三处翻 `closed`·issues-final AG-36 翻面注记落卷·checklist 翻面笔二批/AG-18 补翻两段计数勘误随链（权威递推 44→45→46→47→48·open 3→2 余 AG-13 线上数据/AG-32 UNSTUB-VOICE 部署）·est live=0·pins 十一值零翻·markers=0。

---

卷尾注：STOP=`closed`（2026-10-26 收官翻面·三处同值：Status 头/§8/本注·前值 `executed:awaiting_post_prove_dual` 史录保留·其前值 `draft:awaiting_pre_exec_dual` 双前值史录在卷·收官依据=§9-post）·原起草注史录如下——STOP=`draft:awaiting_pre_exec_dual` 三处同值（Status 头/§8/本注）·起草 2026-10-26 落卷·基线 `origin/main` @ `ab282ba81`·分支 `line/ag36-draft`·工作树 `../meetwise-ag36`·蓝本=issues-final AG-36 :48/:449-458 + LANDING-INDEX :42 + execution-master-checklist :4443 + LEDGER :712 + extrev-deps-audit :197 · 前置定谳=catalog 化机制半在位·点名直钉面与版本自检面均未修·**非翻面候选** · 修法=catalog 收编（版本零变）+0043 版本自检三环链（常量/启动一行/vendor 绑定 proof）·八处接线全 additive·零迁移零 0043 字节改 · est live=0 · pins 十一值照抄 · markers=0 · ⛔push ⛔merge 主线 ⛔force push · 翻面权归协调方 · alone≠dual · Ban self-approve·rev 修订注记 §9-rev 2026-10-26 落卷（pre-exec 双审第一轮席1 FAIL P0×1+P1×2+联动×1+P2 五件六发现点全成立落修正·零跳过·**闸位迁 migrate 服务 post-flight**·蓝本 LANDING-INDEX :42 失真引经 §9-rev.2 勘误删·蓝本面以 §9-rev.2 收窄四件清单为准·上文 §0-§8 零字洗·STOP 三处同值零翻·第二轮双审待重派）·rev3 修订注记 §9-rev3 2026-10-26 落卷（pre-exec 双审第二轮席1 PASS+席2 FAIL P1×1+P2×5 六条全成立落修正·零跳过·**门⑥增列 prove:migrate-cli 第四门**·引证行漂三处批注·可选增强登记非必需·上文 §0-§8 及 §9-rev 正文字面零洗·STOP 三处同值零翻·第三轮双审待重派·窄域=§9-rev3 六条落点复验）·**EXEC 落卷 2026-10-26**（rev3 后第三轮双审双 PASS 汇流+协调方明示授权 EXEC·**STOP=`executed:awaiting_post_prove_dual`** 三处同值翻面·前值 `draft:awaiting_pre_exec_dual` 史录保留·落码=肢① catalog 收编版本零变+肢② 三环链（checkpoint-schema.ts 常量 5+严格等值断言/migrate-cli post-flight 一处 mismatch→EXIT 1/门⑤ proof 四臂·第④臂 42501 负例实跑值）·门矩阵届值全绿=typecheck 8/8+lint 双帽恰等（root 5242/db 1042）+docs:check 2345≤2354+frozen-lockfile EXIT=0 integrity 字节不变+门⑤ EXIT=0+门⑥四门 EXIT 原值全绿·uc052 净树门时序=B2g–B2n–B2o 先例首版 commit `f921caa30` 净树实跑绿 amend 折入本落卷·触面九路径（核心七+rev3.6 挂载两）·偏离三项如实登记·est live=0·pins 十一值零翻·markers=0·post-prove 双审两外席归后继席派单·⛔push ⛔merge 主线 ⛔force push）。

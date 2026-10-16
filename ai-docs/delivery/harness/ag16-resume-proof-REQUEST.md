# AG16-RESUME-PROOF REQUEST（AG-16 残面 proof 补齐小刀 · 旧 checkpoint resume 确定性 proof + recursionLimit 面纪实收口 · test-only 零产品码零迁移）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停·零码动（本卷恰 1 新 .md·两 proof 件未落）·pre-exec 双审两独立外席待派·Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · est live=0 · ⛔push⛔merge主线）

**席位**：AG-16 残面 proof 补齐小刀起草席（AG 盘点席定谳承接口·协调方派单）。
**基线**：`feat/mysql-schema-skeleton` @ `fe4079a0`（fetch 后 origin tip 亲证·`git rev-parse origin/feat/mysql-schema-skeleton`=`fe4079a0` 全串 `fe4079a0…`·派单下界 tip≥fe4079a0 **等号成立**·本卷全锚对该 tip 亲算）。分支 `line/ag16-resume-proof`·工作树 `meetwise-ag16`（`git worktree add ../meetwise-ag16 -b line/ag16-resume-proof fe4079a0` 本起草席已立·建前 branch 双查无同名·HEAD 落 `fe4079a0` 亲证）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①`ai-docs/delivery/ai-capability-review/issues-final.md`（blob `dac7f58c`）AG-16 总表行 `:28` + 详情 `:224-234`（六面清单「eval 后崩溃、节点瞬时异常、报告重试是否真的再调模型、准入拒绝后重试、recursionLimit 是否生效、旧 checkpoint resume」·修法「为每个 P1 补一个 MemorySaver+注入抛错的确定性 proof」）；②同目录 `EXPERT-REVIEWS.md`（blob `5d446552`）`:69`「AG-16 proof 摊进各刀（每刀自带确定性 proof 系仓内纪律）」=摊刀纪律权威；③同目录 `review-log.md`（blob `ea66a06e`）`:136`（「dist/graph/state.js:432 compile 只解构 checkpointer/store/cache/interruptBefore/interruptAfter/name/description/transformers；默认值 25 见 pregel/utils/config.js」=残②外部核对权威）+ AG-27 详情 `:345-353`（issues-final·recursionLimit 死键案）；④`ai-docs/delivery/harness/ci-wiring2-REQUEST.md`（blob `195e72db`）`:130/:146/:157` 偏离⑦（「ai-graphs graph.ts `recursionLimit` 移除·五包授权面外·langgraph 1.4.7 compile 解构不含该键=旧键运行时静默丢弃·行为字节级零变已证」）+`ai-docs/delivery/execution-master-checklist.md`（blob `8a98fb92`）`:2609` 偏离⑦登记行=残②「改纪实断言形」的定谳出处；⑤AG 盘点席定谳（协调方派单令）：4/6 面已随刀A/C/D/E proof 摊入·残=①旧 checkpoint resume 确定性 proof ②recursionLimit 面纪实收口。

## §0 现状锚（起草席亲读·base `fe4079a0`·file:line/blob 逐条 rg/Read/git ls-tree/装版 dist 亲读实测·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list` 本卷建树后实测含 `meetwise-ag16`（本席自树）——**无他席 ag16 树**；`git branch --list "line/ag16-resume-proof"` 恰本席一支。
- `ls ai-docs/delivery/harness/ | grep -i ag16` 零命中——**无同名卷无在途同面刀**（harness 现存 ag-a/c/d/e/f 系修复轨刀卷·与残面小刀不同名不同域）；`grep -rl "ag16-resume-proof" ai-docs/` 恰本卷。→ 停止条件未触发。

### 0.1 六面摊刀盘点（4/6 已覆盖·亲读定谳）+ 残面缺口精确落点

| AG-16 面 | 承接刀/proof | 状态 |
|---|---|---|
| eval 后崩溃 | 刀A `a89471ef` merge·`apps/worker/test/adaptive-resume.proof.ts`（blob `f5dfcacf`·306 行·**36 臂**·形①两段驱动 seam 注入+形② checkpoint 边界注入+AG-26 a/b 两面） | 已覆盖 |
| 节点瞬时异常 | 刀F `ag-f-reroll.proof.ts`（有界 re-roll·耗尽换 competency 不终场） | 已覆盖 |
| 报告重试真再调模型 | 刀E `ag-e-report.proof.ts`（provider 计数=2+键 :a2≠:a1） | 已覆盖 |
| 准入拒绝后重试 | 刀D `ag-d-admission.proof.ts`（ai-runtime 26 臂+worker 23 臂）+刀C `requeue-backoff.proof.ts` | 已覆盖 |
| recursionLimit 是否生效 | **残②**：死键已随 CIW2 偏离⑦ 显式移除·行为字节级零变已证——但三事实（compile 无该键/装版契约不收/默认 25 兜底）**零自动化纪实断言**（死键回潮或注释漂移零门红） | **本刀面** |
| 旧 checkpoint resume | **残①**：零 proof（详见 §0.2 缺口表） | **本刀面** |

### 0.2 残①缺口精确落点（旧 checkpoint resume=兼容/版本失配/中断点确定性 三面）

| 缺口面 | 现码既有缺省臂（零 proof 面） | 既有 proof 覆盖盘点（为什么仍缺） |
|---|---|---|
| 兼容=旧形 additive 字段缺省 | `packages/ai-graphs/src/adaptive-interview/state.ts`（blob `d387ab08`·266 行）七处「旧 checkpoint 缺省」面 `:36/:42/:109/:117/:234/:256/:261`（dispositions/evidence/plannedTurns/topicId/askMode/clarifyCause/deficit/concludeReason 缺省语义）+`apps/worker/src/adaptive-lifecycle.ts`（blob `246657b1`·625 行）`:272-276`（plannedTurns/topicId「JSON 序列化即缺字段·消费者必须降级」）+`:506-508`（存量 v5 checkpoint 回合无 dispositions→跳过写卡） | 仅两点单臂：`adaptive-lifecycle.proof.ts`（blob `4a6123fb`·445 行）`:29/:423` SFC 空 mind 合成旧 checkpoint 单点臂+`ag37-deficit-persist.proof.ts :253/:268` deficit null 起跑单点臂——「旧形 checkpoint 经 resume 链全程（Command(resume)→投影→事件 payload→收口）确定性」零 proof |
| 版本失配=channel_values 键集漂移 | 图 state 通道随代际演增（deficit/topicId 等新代通道）；旧 checkpoint 缺通道→channel 缺省；未来键回退→未知键读侧处理——1.4.7 实际行为**零纪实** | 零 proof（`checkpointer-runtime-role.proof.ts` 5 断言只覆盖 runtime 角色 DDL 围栏；`checkpoint-privacy-erasure`/`resume-erasure-tombstone-foundation`/`resume-derivative-reference` 系隐私擦除域；`resume-grounding.proof.ts` 31 静态断言系 grounding/consent 域——均非本面） |
| 中断点确定性 | `graph.ts`（blob `6cdcc122`·66 行）`:14` 注释自证「`interrupt()` 所在节点在 resume 时从第一行重放，因此模型调用被隔离在 genQuestion 节点」 | `adaptive-resume.proof.ts` 形①断言一次续跑推进到下一 interrupt——**重复 resume 落点恒等性**（双图实例同 checkpoint 重复续跑→identity/next/节点重放计数恒等）零 proof；`resume.int.ts` 系 mock-interview 纯图 PostgresSaver 进程重启续跑（非 adaptive 图非旧 checkpoint 面） |

### 0.3 残②纪实事实链（本席装版亲读@pnpm 隔离实存 `node_modules/.pnpm/@langchain+langgraph@1.4.7_*/`）

1. `packages/ai-graphs/src/adaptive-interview/graph.ts:65` 现形 `.compile({ checkpointer })`——死键移除后终树态（CIW2 偏离⑦·checklist `:2609`）；`:49/:62-64`+`nodes/generate-question.ts:141` 系注释叙事行（「叠加 langgraph invoke 侧默认 recursionLimit 上限」「compile 选项契约无 recursionLimit 形参——曾置键被运行时静默丢弃,移除系类型真化,行为零变」）非键形。
2. 装版 `@langchain/langgraph` **1.4.7**（`pnpm-workspace.yaml` blob `f14e7fc2` `:16` catalog 钉版）`dist/graph/state.js` 全文 `recursionLimit` **零命中**（compile 选项契约不收该键·review-log `:136` 外部核对同源·本席 grep 亲证零命中）。
3. 装版 `dist/pregel/utils/config.js` `:17` CONFIG_KEYS 含 `recursionLimit`（invoke 侧 config 键）+`:139` `recursionLimit: DEFAULT_RECURSION_LIMIT`（**默认 25**·文件内 `DEFAULT_RECURSION_LIMIT = 25` 亲读）——死循环阀=invoke 侧运行时默认 25 恒兜底·非 compile 键。

### 0.4 blob 锚表（`git ls-tree HEAD` 亲算·全 @`fe4079a0`·EXEC 重 pin）

| 文件 | blob（8 hex） | 关键锚 |
|---|---|---|
| `packages/ai-graphs/src/adaptive-interview/graph.ts` | `6cdcc122` | 装配 :29-61·**compile 实参 `{ checkpointer }` :65**·注释 :49/:62-64 |
| `packages/ai-graphs/src/adaptive-interview/state.ts` | `d387ab08` | 旧 checkpoint 缺省七处 :36/:42/:109/:117/:234/:256/:261 |
| `apps/worker/src/adaptive-lifecycle.ts` | `246657b1` | start 守卫 :321-329·alreadyApplied 守卫 :393-405·SFC 缺省臂注释 :370-373·投影缺省面 :272-276·v5 写卡跳过 :506-508 |
| `apps/worker/test/adaptive-resume.proof.ts` | `f5dfcacf` | 306 行 36 臂·形①/形②/AG-26 a/b（邻面回归基点·零触） |
| `apps/worker/test/adaptive-lifecycle.proof.ts` | `4a6123fb` | :29/:423 SFC 合成旧 checkpoint 单点臂（零触） |
| `packages/ai-graphs/src/adaptive-interview/nodes/generate-question.ts` | `5bbc052e` | :141 recursionLimit+连续帽双层注释（零触） |
| `packages/ai-runtime/test/model-slot-bypass.static.proof.ts` | `daf99bdd` | 静态 readSrc 断言形制权威（件② 蓝本） |
| `apps/worker/package.json` / `package.json` / `packages/ai-graphs/package.json` / `scripts/run-e2e-isolated.mjs` | `f6b6df38` / `3b04b871` / `6104cb80` / `0787a7ff` | 门注册四处现形：worker `:55-56`·root `:531-533/:574-578`·ai-graphs `:11-13`·runner source `:321-323`/whitelist `:2126`/命令映射 `:2338-2339`/预迁移名单 `:3094` |
| `scripts/ai-docs/public-text-policy.mjs` | `841e8666` | `:102 MAX_FILES=2_200`（cap·**Ban 自升**） |
| 蓝本五件（只读引用） | ci-wiring2 `195e72db`/issues-final `dac7f58c`/EXPERT-REVIEWS `5d446552`/review-log `ea66a06e`/checklist `8a98fb92` | 见卷首立项出处行锚 |

### 0.5 docs:check cap 2200 触顶登记（预置停止条件·如实预触发上报）

base 树本席亲跑 `node scripts/ai-docs/check-docs.mjs` EXIT=0 **scanned 2200 ≤ cap 2200（余 0）**；listTrackedPublicTextPaths 亲证根 `receipts/` 不计入、`ai-docs/delivery/receipts/` 计入。**本卷起草 +1 新 .md → 起草树 2201 > 2200 = PTP_FILE_LIMIT 红**——即 checklist `:3340` STILL OPEN 预登记的「cap 贴边触顶·若超 2200 红停上报」预置停止条件**如实触发**：cap sanction 权归协调方（`841e8666` :102 零触·Ban 自升）。**EXEC 届树预期账**：2200+1（本卷 REQUEST）+2（件①件② proof）+1（EXEC 收据若落 `ai-docs/delivery/receipts/`）=**2204**——协调方 cap sanction 至 ≥2204 前 EXEC 门 docs:check 恒红停（§2 门13·§8 停止条件①）。

## §1 红事实与修法

### 1.1 残①红事实

旧 checkpoint resume 三面（§0.2 表）在 CI 全绿下零 proof：兼容面七处缺省臂（state.ts）中仅 SFC 空 mind/deficit null 两点各有单点臂，resume 全链（续跑判定→投影→事件 payload 缺省序列化→收口）确定性无门；版本失配面（channel 键集漂移）实际行为零纪实；中断点确定性（graph.ts:14 注释自证形）无重复遍恒等断言——回归无法发现，修复后也无法证明已修好（issues-final `:231` 原话语义）。

### 1.2 残②红事实

偏离⑦三事实（compile 无键/装版不收/默认 25 兜底）系纯卷面登记（ci-wiring2 `:130/:146/:157`+checklist `:2609`）——零自动化纪实断言：死键若回潮（compile 实参再增 `recursionLimit` 键）或装版升级变更契约，零门红零披露。

### 1-修法（test-only·零产品码零迁移·恰 3 新 tracked 码/卷文件+4 注册文件·图包零字节）

- **件①（残①·新 proof）**：`apps/worker/test/adaptive-legacy-checkpoint.proof.ts`（沿 `adaptive-resume.proof.ts` 形制：MemorySaver+scriptedModelClient 脚本模型+真实 PG 隔离库投影面+`unhandledRejection` 显式捕面）三面臂：
  - **面1 兼容**：正常 start 落场后直改 inner cp `channel_values` 剥离新代 additive 字段合成旧形 checkpoint（pending.topicId/askMode/clarifyCause/plannedTurns·transcript 末回合 dispositions/evidence·mind.competencies·deficit）→ 同 answer identity `submitAdaptiveAnswer` → 断言：identity 保持不 stale·链路不坠·`question_ready` payload 对缺省字段序列化即缺键·dispositions 缺省不触发写卡面（`:506-508` 语义）·收口/出题方向确定。
  - **面2 版本失配**：合成 `channel_values` 携未知遗留键+缺新代通道键 → resume → 纪实钉住 1.4.7 实际行为（未知键读侧忽略/缺失键走 channel 缺省）·与「无该键」对照面投影逐字节一致·两遍同形。
  - **面3 中断点确定性**：中场 checkpoint 停在 awaitAnswer interrupt → 双图实例重复 `getState`+`Command(resume)` → 断言：落点恒等（next=[awaitAnswer]·pending identity 同）·awaitAnswer 首行重放（节点计数）·genQuestion 零重执行·ask 计数零增·事件键幂等重放。
- **件②（残②·新静态纪实 proof）**：`packages/ai-graphs/test/adaptive-compile-contract.proof.ts`（沿 `model-slot-bypass.static.proof.ts` 静态 readSrc 形制·no-DB）：
  - C1 graph.ts 恰一 `.compile(` 且实参恰 `{ checkpointer }`（死键移除终树态）；C2 图包 src `recursionLimit` 键形（`recursionLimit:`）零命中·注释叙事命中恰 §0.3-1 三处（纪实防死键回潮）；C3 装版 version=1.4.7（catalog `f14e7fc2:16`）；C4 装版 `dist/graph/state.js` `recursionLimit` 零命中；C5 装版 `dist/pregel/utils/config.js` 含 `DEFAULT_RECURSION_LIMIT = 25`+CONFIG_KEYS 含 `recursionLimit`（invoke 侧默认 25 恒兜底）；C6 行为纪实：test-only 自环 StateGraph（非产品图·零产品码）缺省 config invoke → `GraphRecursionError` 确定性抛出（默认阀生效纪实）。
- **件③（门注册·4 文件 additive）**：worker `package.json` 增 `prove:adaptive-legacy-checkpoint`；`packages/ai-graphs/package.json` 增 `prove:adaptive-compile-contract`；root `package.json` 增 `adaptive-legacy-checkpoint:prove`（沿 `run-e2e-isolated` 隔离形）+`adaptive-compile-contract:prove`（直跑形）；`scripts/run-e2e-isolated.mjs` 四处 additive 注册（source/whitelist/命令映射/预迁移名单·沿 `ag-a-resume:prove:raw` 同形）。

### §1.3 否决（越界即 FAIL）

1. **否决产品码改动**：AG-27 修法（invoke 侧 `recursionLimit` 接线+断言测试）=行为变更面·归协调方/后继刀——本刀只纪实不接线；checkpoint 版本字段/迁移机制/schema version 新增=产品码+迁移面越 test-only 授权面，均否决。
2. **否决监控面出手**：卡死检测/ai_graph_run 观测列=AG-15 领地（EXPERT-REVIEWS `:69` 同段）——本刀不加观测面不新增列。
3. **否决 cap 自升**：`public-text-policy.mjs MAX_FILES` 零触·cap sanction 权归协调方（§0.5）。
4. **否决既有 proof 臂改写**：`adaptive-resume.proof.ts` 36 臂/`adaptive-lifecycle.proof.ts` 44 断言行等邻面零触——本刀只增新文件零改既有臂。

## §2 验收门矩阵（pre-exec 双审核对单基面·对届时实测·预期值随 §0 锚）

| # | 门 | 预期 |
|---|---|---|
| 1 | 新件① `adaptive-legacy-checkpoint:prove`（隔离库） | EXIT=0·三面臂全 PASS（臂数 EXEC 定稿入收据·≥12） |
| 2 | 新件② `adaptive-compile-contract:prove`（no-DB） | EXIT=0·C1-C6 全 PASS |
| 3 | 邻面 `adaptive-resume:prove` | EXIT=0 **36 臂原值** |
| 4 | 邻面 `adaptive-life:prove` | EXIT=0 43 断言原值（刀A rev2 口径） |
| 5 | 邻面 `adaptive-flow:prove`+`adaptive-degrade:prove`+`adaptive-chaos:prove`+`resume-grounding:prove` | 各 EXIT=0 原值（5/11/4 断言/31 静态断言·对届时实测） |
| 6 | `neg:all` | EXIT=0 **692** 恰等基线（fe4079a0 承卷值） |
| 7 | `turbo typecheck --force` | EXIT=0 8/8 |
| 8 | `turbo lint` | EXIT=0 12/12 五值恰等 |
| 9 | `docs:check` | **基线树 EXIT=0 2200≤2200（本席已亲跑）·届树 2204 需协调方 cap sanction ≥2204 方可行使——sanction 前 EXEC 红停上报（§0.5 预置停止条件）·Ban 自升** |
| 10 | markers 五类 | 本刀改动集运行时组装扫描 0/0（`i6-239-gates.proof.mjs` §2-7 口径·词面不复抄卷内） |
| 11 | diff 面 | 恰 **7 tracked**（3 新=本卷 REQUEST+件①+件②·4 改=三 package.json+runner·全 additive 注册行）·图包/账本/迁移/产品码零字节 |
| 12 | 迁移面 | 零新迁移（migrations 目录零增） |

## §5 Ban 列表 + pins

**Ban 列表**：Ban push；Ban merge 主线；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（LEDGER/checklist/issues-master/ai-capability-review 四件+INDEX·AG-16 行翻面权归协调方）；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban 动产品码（`packages/**/src`+`apps/**/src` 零字节——件①件② 全落 test 面）；Ban 动图包（`packages/ai-graphs/src/**` 零字节）；Ban 动账本/迁移/env 闸/新配置面/新定时器；Ban 动 `public-text-policy.mjs` cap（Ban 自升·§0.5）；Ban 动既有 proof 既有臂（邻面零触）；Ban AG-27 invoke 侧接线出手（§1.3-1 否决面）；Ban AG-15 监控面出手（§1.3-2）；Ban 顺带升级依赖包（DEPS-AUDIT 域·catalog 钉版零触）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 proof 全 MemorySaver+scriptedModelClient 假体/隔离库+静态 readSrc·零模型外呼·零消耗）。

## §6 est live=0

零生产操作：件①=隔离库+脚本模型假体（沿 `prove:adaptive-resume` 既有形）·件②=纯静态 readSrc+进程内自环小图（no-DB no-网络）·门=本地门——零真实 provider 外呼·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（起草 turn=恰 1 .md）**五类标记词零命中**（起草席亲跑·五类词沿 `scripts/i6-239-gates.proof.mjs` §2-7 运行时组装口径·**词面不复抄卷内防自匹配**——沿 negbend/g7w/context-budget-wire 卷 §7 同形制）·全树行首冲突标记零命中。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（起草 turn 恰 1 .md·两 proof 件 EXEC 落）。开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（issues-final AG-16 行+盘点席定谳系登记出处·本卷非授权本身）；③EXEC 立项**不得改 §1-修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。**停止条件**：①**cap 未 sanction**（届树 docs:check>2200 且协调方未裁——§0.5 预置·红停上报非自升）②§0 锚漂（graph.ts compile 现形漂/lifecycle 行锚漂/装版 dist 契约漂——重 pin 回炉·结论变才停）③邻面新红（门 3-8 任一红且根因不在本刀交付面→stash 对照亲证基线·如实登记）④验收红不可修（Ban 借机修）。

**待双审/EXEC 裁决项**：①件①三面臂的合成旧 checkpoint 手法（推荐=直改 inner cp channel_values 剥字段形·零产品缝 vs CrashCheckpoint 子类拦截形备选）；②件② 住地（推荐=`packages/ai-graphs/test/` 与图包同住地 vs 并入 worker test 减一注册文件）；③件② C6 自环小图行为纪实臂是否入刀（推荐=入——「默认 25 生效」唯一行为级证据）vs 纯静态五臂；④门名（推荐=`prove:adaptive-legacy-checkpoint`/`prove:adaptive-compile-contract` 沿既有形）。

## §9-rev rev 修订注记（pre-exec 双审席1 FAIL R1-R3 P1×3+R4-R8 P2×4+P3×1 修订清单八条回路 · 协调方四裁决随卷 · rev 席落卷 2026-10-16 · **append 注记形 · 上文 §0-§8+卷尾注零洗** · 本节为 EXEC 期对前文对应句的权威修正与增补）

> **席1 FAIL 定谳（rev 席逐位亲证成立）**：**R1（P1）基线/cap 前提整体过期**——rev 席 fetch 实测上游已步进 `f26ab75f`（`line/cap-sanction-2208` nail 波 tip·cap-sanction-2208 已 nail 落主线·cap 2200→2208 **上游已授予**·`merge-base --is-ancestor fe4079a0 f26ab75f` EXIT=0 亲证·本支 merge `37124104` --no-ff 并入·merge-tree 预演 EXIT=0 零冲突·对支线五文件 M3/A1 与本卷 REQUEST 零交叠亲证）——§0.5「sanction≥2204 前 EXEC 红停」/§2-门9 sanction 前置/§8-停止条件①「cap 未 sanction」三处前提失效。**R2（P1）裁决项① 推荐手法机制失效**——装版 @langchain/langgraph-checkpoint **1.1.3**（主仓 .pnpm 实存亲证）`dist/memory.cjs` 亲读：`put`=`copyCheckpoint`+`dumpsTyped` **序列化串存储**（`:207-216`）·`getTuple`=`loadsTyped` **每读新反序列化对象**（`:98-104`）——「直改 inner cp channel_values 剥字段」改内层对象不持久化必返工·**存储缝手术不荐**。**R3（P1）缺省臂清单 5/7**——channel 缺省臂=Annotation `default` 仅在 channel_values **缺键**时生效（state.ts `:234 topicMainQuestionId`/`:256 weightedDeficit`/`:261 concludeReason` 三处 channel 级缺省臂亲读）——面1 剥嵌套字段触不到 channel 级缺省臂。R4-R7（P2）+R8（P3）逐位亲证见 §9-rev.4-§9-rev.7。rev 八条修订+四裁决如次·STOP 维持 `draft:awaiting_pre_exec_dual` 三处同值（§9-rev.10）。

### §9-rev.1 修订①（R1·P1）——基线/cap 前提更新+sanction 已上游授予改记

- fetch+并线：rev 席 fetch 后支线 **merge `f26ab75f` --no-ff**（merge `37124104`·双亲 bc7221bf+f26ab75f·merge-tree 预演 EXIT=0 零冲突·⛔pull --rebase 未用）——**EXEC 届时 merge-forward 照 §0 规则以本并线树为基**。
- §0.4 policy blob 锚更：`scripts/ai-docs/public-text-policy.mjs` blob `841e8666`→**`7bace81c`**（@`f26ab75f` 亲算）·`:104 MAX_FILES = 2_208`（cap 2200→2208 上游已授予·a75736a0 EXEC 落码+7bace81c nail 承卷亲读）。**其余 §0.4 锚零漂移亲证**：graph.ts `6cdcc122`/state.ts `d387ab08`/adaptive-lifecycle.ts `246657b1`/adaptive-resume.proof.ts `f5dfcacf`/adaptive-lifecycle.proof.ts `4a6123fb`/generate-question.ts `5bbc052e`/model-slot-bypass `daf99bdd`+注册四件（worker `f6b6df38`/root `3b04b871`/ai-graphs `6104cb80`/runner `0787a7ff`）+pnpm-workspace `f14e7fc2` 全值对 `fe4079a0`=`f26ab75f` 恒等·零更锚；蓝本 checklist blob `8a98fb92`→**`c7296149`**（cap-sanction nail +9 行落 `:3340` 后 flowchart 段·**`:2609` 偏离⑦行与 `:3340` 行号双双零位移亲证**——sed 亲读两行原文在位）。
- §0.5/§2-门9/§8-停止条件① **改记（原文零洗·以下列修正句为准读）**：**sanction 已上游授予（`f26ab75f`·cap 2208）**·起草树 PTP 红（2201>2200）系**旧 cap 下如实触发**的历史事实保留不洗·**上游解锁如实登记**——EXEC 期 `public-text-policy.mjs` 零触禁令（Ban 自升）**不解除**·但 sanction 前置红停条件**解除**。**EXEC 届树预期 2205≤2208 余 3**=rev 并线树 2202（rev 席 docs:check 亲跑 EXIT=0 **2202≤2208 余 6**·本 rev append 零新增文件计数不变）+2（件①件② proof）+1（EXEC 收据若落 `ai-docs/delivery/receipts/`）·门9 判据改「**届树实测 ≤2208 即绿·实测值入收据·超 2208 红停上报非自升**」·§8-停止条件① 同步改挂「届树 docs:check>2208 且协调方未裁」。
- checklist 行锚按新 tip 重算：`:2609`/`:3340` 双锚 @`f26ab75f` 零位移（本席亲证·见上）。

### §9-rev.2 修订②（R2·P1·协调方裁决①）——§1-件① 面1 合成手法定稿改写（读缝拦截形升主选）

- **定稿（协调方裁决·席1 意见采纳）**：面1 合成手法=**读缝拦截形主选**——沿 `apps/worker/test/adaptive-lifecycle.proof.ts:27-40` `LegacyEmptyMindReadSaver` 先例形（rev 席亲读：MemorySaver 子类 `override async getTuple`·**恰一次**把反序列化后 tuple 的 `checkpoint.channel_values` 剥新代 additive 字段后放行·后续读零触·写零触直通）：件① 面1 首句「正常 start 落场后直改 inner cp `channel_values` 剥离新代 additive 字段合成旧形 checkpoint」**以此替换读**——面1=正常 start 落场后经读缝拦截 saver（恰一次 getTuple 改形）剥离新代 additive 字段合成旧形 checkpoint（pending.topicId/askMode/clarifyCause/plannedTurns·transcript 末回合 dispositions/evidence·mind.competencies·deficit）→ 其余断言链原文有效。**存储缝手术不荐**（机制=R2 定谳·序列化串存储面无 inner cp 可改）。
- §8 待双审/EXEC 裁决项① 以本节为准**已裁**（读缝拦截形主选·CrashCheckpoint 子类拦截形与存储缝手术均不荐）——EXEC 期不再裁量。

### §9-rev.3 修订③（R3·P1）——面2 缺新代通道键集显式钉+EXEC 臂数表三列映射

- 面2「缺新代通道键」**键集显式钉 ⊇ {topicMainQuestionId, weightedDeficit, concludeReason}**（§1 面2 既有措辞已授权·本节补钉键集）——此三键系 channel 级 `default` 缺省臂（state.ts `:234/:256/:261` 亲读）·唯 channel_values **缺键**才触发·嵌套剥字段触不到（R3 定谳）·故面2 须整键缺席合成·不得以面1 嵌套剥法代偿。
- **EXEC 臂数表须给 臂→手法→断言 三列映射**（门1 收据随附·三面逐臂列·臂数与映射一并入收据）。

### §9-rev.4 修订④（R4/R5·P2）——门4/门5 stale 计数改届时实测口径

- 门4「EXIT=0 43 断言原值（刀A rev2 口径）」→「**EXIT=0·届时实测值与逐臂名入收据**」（rev 席现树亲数 `adaptive-lifecycle.proof.ts` A( 调用位 **46**·「43」系 stale 口径作废）。
- 门5 resume-grounding「31 静态断言」→**同 R4 处置「届时实测值入收据」**（rev 席现树亲数行位 **33**·「31」stale）——邻面门语义不变=EXIT=0+臂零改·计数字面一律以届时实跑为准。

### §9-rev.5 修订⑤（R6·P2）——面2 一致性比较 ID 纪律

- 面2「与『无该键』对照面投影逐字节一致」收口：**须 pin ID 规范化比较或固定 UUID 入参（二择一·EXEC 落码定·收据披露所用形）**——现 proof 先例入参系 `randomUUID`（adaptive-lifecycle.proof.ts `:5/:70/:87/:123` 等亲读）·identity/answerId 类字段两遍异值即假红·逐字节断言前须先规范化或钉死入参。

### §9-rev.6 修订⑥（R7·P2 四件）——件② 纪律 pin

1. **C2 命中集逐行钉**：恰 {`graph.ts:49`/`graph.ts:62`/`graph.ts:63`+`generate-question.ts:141`} **四行**（rev 席 grep 亲证现树图包 src `recursionLimit` 词面恰此四行——§0.3-1「`:49/:62-64`」区间措辞作废·`:64` 零命中）。
2. **C4/C5 dist 定位**：必须 `createRequire(import.meta.url).resolve('@langchain/langgraph/package.json')` 动态定位装版 dist·**禁硬编码 `.pnpm` 哈希路径**。
3. **禁 skip-as-pass 显式声明**：装版缺失/resolve 失败/dist 读失败=**红**（非 skip 非降级·收据如实红）。
4. **C6 断言双钉**：`instanceof GraphRecursionError` **与** 消息含 **`Recursion limit of 25`** 双条件（装版 dist/pregel/index.js `:1223` 模板串 `Recursion limit of ${config.recursionLimit} reached` 亲读·默认 25 时字面恰此）。

### §9-rev.7 修订⑦（R8·P3 两件）

1. checklist `:3340` 引用措辞（§0.5/卷尾注两处）**改读**：「**沿其先例形**」（`:3340` 系 5E-CLEANUP-SWEEP-2 nail 刀的 cap 贴边触顶登记行·非本卷预置登记本体）·**本卷预置停止条件在 §0.5**——本卷对 `:3340` 系援引先例形·原文零洗以此读为准。
2. 件③ runner source 清单**补 `state.ts`**（`packages/ai-graphs/src/adaptive-interview/state.ts`）——件① 隔离库投影面直读 state 通道缺省语义·runner source 白名单须含之（四处 additive 注册形不变·沿 `ag-a-resume:prove:raw` 同形）。

### §9-rev.8 四裁决项落卷（协调方·席1 意见采纳·EXEC 期不再裁量）

① 合成手法=**读缝拦截形主选**（§9-rev.2·存储缝手术不荐）；② 件② 住地=**`packages/ai-graphs/test/` 维持**（并入 worker test 备选否决）；③ **C6 行为臂入刀**（「默认 25 生效」唯一行为级证据·纯静态五臂否决）；④ 门名=**`prove:adaptive-legacy-checkpoint`/`prove:adaptive-compile-contract`**（§1-件③ 门名字面即此·零改）。

### §9-rev.9 §8-③ 冻结条款权威修正句（§1 冻结沿 rev 先例形）

§8-③「EXEC 立项不得改 §1-修法清单与 §5 Ban/pins（改则回炉重审）」禁令**不变**——但 §1-修法清单自本节起**以 §9-rev 修正后的定稿文本为冻结本体**（§9-rev.2/.3/.5/.6/.7 修正句并入 §1 读·原文零洗替换读）·本 rev 系 pre-exec 双审回路协调方授权的权威修正·非 EXEC 期改动·EXEC 立项对 rev 后定稿文本仍零触（触则回炉重审）。

### §9-rev.10 门矩阵 rev 后口径+rev 后 STOP 状态（rev 席亲跑）

- **docs:check**：EXIT=0 **2202≤2208 余 6**（并线树 `37124104` 本席亲跑·本 rev append 零新增文件→计数不变）。
- **markers**：本 rev 改动集（恰 1 .md）五类标记词+行首冲突标记直扫零命中（词族运行时组装不誊卷·沿 §7 同形制·i6-239 §2-7 口径）。
- **diff 面**：本 rev 恰 1 tracked=本卷 .md 纯 append 零删改·零码面（对 `37124104` 机检）·B 段门 1-12 沿 §2 预 registered 判据·随 §9-rev.1/§9-rev.4 修正值读。
- **STOP=`draft:awaiting_pre_exec_dual` 三处同值维持**（Status 头/§8/卷尾注零字洗）——rev 落卷后待席1 修订清单 R1-R8 落点确认（或协调方裁定）→**重派 pre-exec 双审两独立外席**（rev 后重审·alone≠dual·Ban self-approve）·开工权归协调方·⛔push ⛔merge 主线 ⛔改码面（本 rev 恰 1 doc 零码面）·est live=0（rev turn 全只读+1 doc append）·actualSpendCny=null。

---

*AG16-RESUME-PROOF REQUEST · 2026-10-16 起草 · **`draft:awaiting_pre_exec_dual`** · base `feat/mysql-schema-skeleton` @`fe4079a0`（origin tip 亲证·派单下界 tip≥fe4079a0 等号成立）· 分支 `line/ag16-resume-proof` · 工作树 `meetwise-ag16`（本起草席立·落 origin tip）· 立项出处=issues-final AG-16 `:28/:224-234`+AG-27 `:345-353`+EXPERT-REVIEWS `:69`+review-log `:136`+ci-wiring2 偏离⑦ `:130/:146/:157`+checklist `:2609/:3340`· 残面=①旧 checkpoint resume 三面（兼容/版本失配/中断点确定性·§0.2 缺口表）②recursionLimit 纪实收口（§0.3 装版三事实亲读）· 修法=两新 proof（件① 隔离库三面臂+件② 静态 C1-C6）+门注册四处·零产品码零迁移· diff 预期恰 7 tracked · est live=0 · pins 十一值照抄 · markers=0 亲跑 · docs:check 基线 2200≤2200 EXIT=0 亲跑·起草树 2201>2200=checklist `:3340` 预置触顶停止条件如实触发·cap sanction 权归协调方（Ban 自升）· ⛔push⛔merge主线 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · **STOP***

# AG16-RESUME-PROOF REQUEST（AG-16 残面 proof 补齐小刀 · 旧 checkpoint resume 确定性 proof + recursionLimit 面纪实收口 · test-only 零产品码零迁移）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 席翻面 2026-10-17·前值 `draft:awaiting_pre_exec_dual`=起草+rev 史录·EXEC 落卷=2 新 proof+4 注册件改+§9-exec append+收据·post-prove 双审两独立外席待派·Ban self-approve · alone≠dual · est live=0 · ⛔push⛔merge主线）

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

## §8 STOP · `executed:awaiting_post_prove_dual`（EXEC 席翻面 2026-10-17·前值 `draft:awaiting_pre_exec_dual`=起草+rev 史录）

**STOP · `executed:awaiting_post_prove_dual` · alone≠dual。** 起草席写完即停零码动（起草 turn 恰 1 .md·两 proof 件 EXEC 已落=§9-exec）。开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**（第四次双审会签 PASS×2=席1 agent_8ff74c69+席2 agent_264162ff）；②**协调方明示授权**（已行使=派单令 EXEC 六条收据落法随卷）；③EXEC 立项**不得改 §1-修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin=§9-exec 已行使）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。**停止条件**：①**cap 未 sanction**（届 cap=2216 已上游 nail·届实跑 2215≤2216 见 §9-exec）②§0 锚漂（§9-exec 十一 blob 重 pin 零漂）③邻面新红（门 3-6/8 届实跑全绿）④验收红不可修（Ban 借机修·lint 贴边红自纠两处如实登记）。**post-prove 双审两独立外席待派**。

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

## §9-rev3 rev3 修订注记（pre-exec 双审席1 F1=席2 R-2.1 互盲双 FAIL 收敛同一 P1→rev3 回路 · 面1 拦截手法世代形升格+面3 隔离三钉+届 tip 漂移改记+P3 五件 · rev3 席落卷 2026-10-16 · **append 注记形 · 上文 §0-§8+§9-rev 全节+卷尾注零洗** · 本节为 EXEC 期对前文对应句的最新权威修正与增补·与前节冲突处以本节为准）

> **双审双 FAIL 定谳（rev3 席逐位亲证成立）**：席1 F1 与席2 R-2.1 互盲独立收敛同一 P1 缺陷=**§9-rev.2 面1「恰一次 getTuple 改形放行」孔径错位**——lifecycle `submitAdaptiveAnswerImpl` submit 读序**三读**（apps/worker/src/adaptive-lifecycle.ts **`:366` before 读** `gInitial.getState`+**`:400` resume invoke**（PregelLoop resume 内部读=装版 1.4.7 `dist/pregel/loop.js` **`:255`/`:259` 两处 `checkpointer.getTuple` 位亲读**）+**`:401` snap 读** `g.getState`）——「恰一次」闩锁必被 `:366` before 读先行消费·`:400` resume 读与 `:401` snap 读**零次拦截**→面1 断言链（payload 缺键/出题方向收口/`:506-508` 写卡跳过）全程对未剥新形状态评断=**结构性假红或空转**。R-2.2~R-2.8 逐位亲证见 §9-rev3.2-§9-rev3.8。rev3 修订如次·STOP 维持 `draft:awaiting_pre_exec_dual` 三处同值（§9-rev3.10）。

### §9-rev3.1 修订①（P1·协调方裁决）——§9-rev.2 面1 定稿句升格：恰一次形→**checkpoint 世代拦截形**

- **定稿（协调方裁决=采纳席2 R-2.1 改法）**：面1 读缝拦截 saver 的改形判据自「恰一次闩锁」**升格为按 checkpoint 世代拦截**——**getTuple 返回 tuple 的 `checkpoint.id` 等于 resume 前目标 checkpoint id 则剥字段放行**（恰覆盖 `:366` before 读与 `:400` resume 读两读=两读同指旧世代）·**id 变化（resume 落写新 checkpoint）后零触直通**（`:401` snap 读自然落新世代=真新态零剥）·**put 零覆写**——恰复现真旧 checkpoint 全程语义·四孔径（**stale 守卫/`:506-508`/payload 缺键/出题方向**）全对准。
- §9-rev.2 定稿句「恰一次…后续读零触」**升格替换读**（原文零洗·以此为准）·§9-rev.8-① 同步升格读=合成手法定稿=**读缝拦截形（checkpoint 世代判据）**·「恰一次」子句作废·存储缝手术不荐维持。
- 席1 附带承接：§9-rev.3 三列映射扩五列承载布防钉（§9-rev3.9）后·F1 随本节世代拦截形落定降 P2 承接（布防位置+消费读位两列入收据映射=孔径错位类缺陷结构性防 recurrence）。

### §9-rev3.2 修订②（R-2.2·P2）——面3 中断点确定性隔离三钉

- **(a) 双实例 saver 克隆机制钉**：面3 双图实例各持**独立克隆 MemorySaver**（同源 checkpoint 装载后各自克隆）·**禁共享单 MemorySaver 实例**（共享则第二实例 getState 读到第一实例 resume 落写的新世代=落点恒等断言假象）。
- **(b) 面3 双驱动同源输入钉**：两遍驱动同源单输入对象**或固定 UUID**（先例 `randomUUID` 两遍异值=identity/落点恒等断言假红·沿 §9-rev.5 同纪律外溢面3）。
- **(c) 驱动面二择一定稿**：走 `submitAdaptiveAnswer` 则第二遍撞 identity ledger 去重（claim/alreadyApplied 面 `:393-405`）·走裸图 `Command(resume)` 则事件键幂等断言无 lifecycle 衬底——**二择一 EXEC 落码定稿+所择形断言衬底如实入收据**（不择不定稿=红）。

### §9-rev3.3 修订③（R-2.3·P2）——届 tip 漂移改记（origin 已 `10799a3e`=WHG nail）

- rev3 席 fetch 亲证 **origin/feat/mysql-schema-skeleton=`10799a3e`**（worker-hang-guard nail 波 tip·`merge-base --is-ancestor f26ab75f 10799a3e` EXIT=0 亲证）——本卷 §0 基线下界（tip≥fe4079a0）继续成立·**EXEC 届时 merge-forward 以届 tip 为准**（照 §0 规则·本 rev 零并线·⛔merge 未行使）。
- checklist 行锚漂移亲证：5E-CLEANUP cap 行 **`:3340`→`:3351`**（@`10799a3e` 亲读·blob `c7296149`→**`376fd5bc`**）·**`:2609` 偏离⑦行零位移亲证**（两树同值 `:2609`）——§9-rev.7-1「沿其先例形」读法不变·行号随此更读。
- **docs:check 届树预期改记**：§9-rev.1「2205≤2208 余 3」作废→**届树 2207≤2208 余 1**（亲算=WHG tip 树 2203[replica 口径与 check-docs 计数同构亲证·WHG nail 自报 2203≤2208 同值]+本卷 REQUEST 1+件①件② proof 2+EXEC 收据 1[若落 tracked 面]）·门9 判据维持「届树实测 ≤2208 即绿·超 2208 红停上报非自升」。
- **门6 neg 改挂届树实测**：「EXIT=0 692 恰等基线」→「**EXIT=0·届树实测值入收据**」（WHG EXEC 落码 drain-loop.ts 等五码·承卷值 692 系 fe4079a0 口径已过期·漂移如实登记非红）。
- 本卷 §0.4/§9-rev.1 pin 七 blob（graph.ts `6cdcc122`/state.ts `d387ab08`/adaptive-lifecycle.ts `246657b1`/adaptive-resume.proof.ts `f5dfcacf`/adaptive-lifecycle.proof.ts `4a6123fb`/generate-question.ts `5bbc052e`/policy `7bace81c`）**@`10799a3e` 全值恒等亲证零漂**（rev3 席逐 blob `git rev-parse` 双树比对）。

### §9-rev3.4 修订④（R-2.4·P3）——行锚登记承接

- state.ts channel 级 default 缺省臂**实体行**承接登记：`topicMainQuestionId` **`:237`**/`weightedDeficit` **`:260`**/`concludeReason` **`:262`**（§9-rev 引 `:234/:256/:261` 系注释行位·实体行以本节为准读·blob `d387ab08` 恒等零漂）。
- `LegacyEmptyMindReadSaver` 类实体 **`adaptive-lifecycle.proof.ts:31-43`** 亲证（class `:31`·override getTuple `:34`·闭括号 `:43`）——§9-rev.2 先例形援引行随此承接。

### §9-rev3.5 修订⑤（R-2.5·P3）——门11 diff 面补记

- 门11「恰 7 tracked」补「**+EXEC 收据（若落 tracked 面=`ai-docs/delivery/receipts/`）如实计入第 8 tracked**」——判据形=交付面 7 tracked+收据如实另计·不因收据落 tracked 面判门11 红（如实登记即可）。

### §9-rev3.6 修订⑥（R-2.6·P3·裁决）——面1「deficit」消歧

- `deficit`=`weightedDeficit` 系 **channel_values 顶层整键**（state.ts `:260` Annotation 亲读）**非嵌套字段**——**裁决=从面1 剥字段清单移除·归面2 键集**（§9-rev.3 面2 键集已含 `weightedDeficit`·恰位）；§1-件① 面1 清单「mind.competencies·deficit」改读「mind.competencies」（原文零洗以此为准）·席1 F2 同源同裁并入本节。

### §9-rev3.7 修订⑦（R-2.7·P3）——静态臂钉形

- 件② 静态臂钉形=**命中内容集非行号**：C2 needle 形沿 `model-slot-bypass.static.proof.ts:25-28` `indexOf(needle)` 先例（亲读）——§9-rev.6-1「四行 {graph.ts:49/:62/:63+generate-question.ts:141}」改读**四 needle 内容集**（行号仅登记参考·断言对象=内容命中集·行号漂移不假红不漏放）。
- C6 消息钉**contains 形禁等值**：§9-rev.6-4 双钉维持·消息断言明确 `contains('Recursion limit of 25')`·**禁全串等值**（dist 模板串全串=「…of 25 reached」·等值形对模板尾缀漂移假红）。

### §9-rev3.8 修订⑧（R-2.8·P3）——第八通道观察登记

- 第八通道 `competencyExhaustions`（state.ts **`:250`** Annotation 亲读·AG-F 刀F 产物）=面2 可选第四 exemplar（**观察登记可选**·非必断言键）——EXEC 若纳则入臂数表映射·若不纳零触不红。

### §9-rev3.9 修订⑨（席1 附带）——EXEC 臂数表三列映射扩五列

- §9-rev.3「臂→手法→断言 三列映射」**扩为五列：臂→手法→断言→布防位置→消费读位**（布防位置=saver 判据/静态 needle/断言钉落点·消费读位=被评断的 lifecycle 读位 `:366/:400/:401` 系）——孔径错位类缺陷（席1 F1=席2 R-2.1）以两新增列结构性钉防·门1 收据随附五列全列。

### §9-rev3.10 门矩阵 rev3 后口径+rev3 后 STOP 状态（rev3 席亲跑）

- **docs:check**：本席亲跑 EXIT=0 **2202≤2208 余 6**（本 rev append 零新增文件→计数不变·对 HEAD `3d37e1ac`）。
- **markers**：本 rev 改动集（恰 1 .md）五类标记词+行首冲突标记直扫零命中（词族运行时组装不誊卷·沿 §7 同形制·i6-239 §2-7 口径）。
- **diff 面**：本 rev 恰 1 tracked=本卷 .md 纯 append 零删改·零码面·B 段门 1-12 沿 §2 预 registered 判据·随 §9-rev.1/§9-rev.4/§9-rev3.3/§9-rev3.5/§9-rev3.6/§9-rev3.7 修正值读。
- **STOP=`draft:awaiting_pre_exec_dual` 三处同值维持**（Status 头/§8/卷尾注零字洗）——rev3 落卷后待双审 FAIL 两席修订清单（席1 F1-F2+席2 R-2.1-R-2.8）落点确认（或协调方裁定）→**重派 pre-exec 双审两独立外席**（rev3 后重审·alone≠dual·Ban self-approve）·开工权归协调方·⛔push ⛔merge 主线 ⛔改码面（本 rev 恰 1 doc 零码面）·est live=0（rev turn 全只读+1 doc append）·actualSpendCny=null。

## §9-rev4 rev4 修订注记（pre-exec 双审第三次双审双 FAIL→rev4 回路 · R-1/R4-4+R-2/R4-1 两 P1 同源收敛+R-3/R4-3+R4-2+R-4 三 P2+R-5 一 P3 · 文面修订零码面 · 前席 ENOSPC 中断本席重派 · rev4 席落卷 2026-10-16 · **append 注记形 · 上文 §0-§8+§9-rev 全节+§9-rev3 全节+卷尾注零洗** · 本节为 EXEC 期对前文对应句的最新权威修正与增补·与前节冲突处以本节为准）

> **双审 FAIL 定谳（rev4 席逐位亲证成立）**：**R-1/R4-4（P1·同源）**=§9-rev3.1 世代拦截形将四孔径全挂单臂（alreadyApplied=false resume 形）——写卡跳过与 evidence 缺键两孔径在该单臂形下结构性空转，四孔径须**跨两臂对准**（rev4 席亲证：lifecycle submit 读序两分支 `:394-401` !alreadyApplied resume 形 / `:402-404` alreadyApplied invoke(null) 形·`:509-511` 写卡 operative 门与 `:443-447` answer_evaluated 发射面分属不同驱动形）。**R-2/R4-1（P1）**=届树账再漂移——rev4 席 fetch 亲证 origin/feat/mysql-schema-skeleton=**`656fc7be`**（三刀 nail 后）·§9-rev3.3「origin=`10799a3e`·cap 2208」口径作废。R-3/R4-3、R4-2、R-4、R-5 逐位亲证见 §9-rev4.3-§9-rev4.6。rev4 六条修订如次·STOP 维持 `draft:awaiting_pre_exec_dual` 三处同值（§9-rev4.7）。

### §9-rev4.1 修订①（R-1/R4-4·P1·同源）——面1 四孔径跨两臂对准升格（fresh 臂+重放臂）

- **升格（双审 FAIL 采纳）**：§9-rev3.1「四孔径全对准」改读**四孔径跨两臂对准**——**fresh 臂**（`:394` !alreadyApplied 分支 resume 形）承载 stale 守卫（**`:396-397`** 亲证=剥字段清单只剥 pending.topicId/askMode/clarifyCause/plannedTurns 四子键·questionId/stateVersion/turn 存活→守卫判据不坠 identity 保持）+出题方向+plannerSequence 空序（**`:374-379`** 亲证=mind.competencies 剥→空序→g=gInitial）三孔径；**重放臂**（alreadyApplied=true invoke(null) 形）承载写卡跳过 operative 门（**`:509-511`** 亲证=`:509` deps+unscored/clarifying/score 条件+`:510` dispositions 读+`:511` 空序判据）+evidence 缺键（**`:443-447`** answer_evaluated payload·`:446` `evidence: last.evidence` 缺省=undefined 不进 JSONB 亲证）两孔径。
- **重放臂手法定稿**：沿 `apps/worker/test/adaptive-resume.proof.ts:173-203` **形① 两段驱动先例**合成 **eval-done 坠点**（evalAnswer 已评落 checkpoint、genQuestion seam 坠·坠点形态=transcript 已含本题答案+next 非空+无 pending interrupt·先例 `:193-195` 同形亲读）→ **同 identity 重入** submitAdaptiveAnswer（alreadyApplied=true `:381` 亲证）→ **`:402-404` invoke(null) 不重评**（先例 `:207-208` evaluate 零重评+`:210` 重入零 plan/decide/evalAnswer 重执行断言形同源衬底）→ **snap.last=旧世代剥后回合**（`:404` snap 读·transcript 末回合即被剥旧回合）。
- **重放臂 deps 必配 `scoreWriterLeaseOwner`**：lifecycle deps `scoreWriterLeaseOwner` 系 optional（`:147` 亲证·不配则 `:509` 门首条件短路=跳过断言空转假绿）——重放臂 deps 必配之**且断言 score_card 行数=0**：证跳过=dispositions 空序 `:511` 门 operative 裁定·非 deps 缺失短路·防空转。
- **§1-件① 面1 首句「正常 start 落场后…transcript 末回合」随两臂拆分改读**（原文零洗·以此为准）：fresh 臂读=「正常 start 落场后经读缝拦截 saver（checkpoint 世代判据·§9-rev3.1 升格形维持）剥字段→同 identity submitAdaptiveAnswer（resume 形）」；重放臂读=「正常 start 落场后沿形① 两段驱动合成 eval-done 坠点→同 identity 重入（invoke(null) 形）」；剥字段清单两臂共用（pending.topicId/askMode/clarifyCause/plannedTurns·transcript 末回合 dispositions/evidence·mind.competencies·§9-rev3.6 deficit 移除维持）。

### §9-rev4.2 修订②（R-2/R4-1·P1）——届树账改记（届 tip=`656fc7be`·cap-2216 已 nail 落主线·届 cap=2216 余 6）

- rev4 席 fetch 亲证 **origin/feat/mysql-schema-skeleton=`656fc7be`**（trace-service-wire nail 波 tip）——**三刀 nail 后**：cap-sanction-2216（**`6c92ef4c`**）+boot-validate（`ab3ab9c9`）+trace-service-wire（`656fc7be`）·§9-rev3.3「origin=`10799a3e`」作废升格（本 rev 零并线·⛔merge 未行使·EXEC 届时 merge-forward 以届 tip 为准照 §0 规则）。
- **cap-2216 已 nail 落主线**：`6c92ef4c` 对 `656fc7be` `merge-base --is-ancestor` EXIT=0 亲证·policy blob `7bace81c`→**`4509bf68`**（@`656fc7be` 亲算）·**MAX_FILES 行 `:104`→`:106` 值 2208→2_216 亲读**（cap 2208→2216 上游已授予·行移 +2 系 cap-sanction-2216 EXEC 两文件落码所致如实登记·EXEC 期零触禁令维持）。
- **§9-rev3.3 届树预期升格改记**：「届树 2207≤2208 余 1」作废→**届树 2214≤2216 余 2**（亲算=届 tip 树 **2210**[rev4 席 docs:check 亲跑 EXIT=0 `2210≤2216 余 6`·@`656fc7be` 只读临时 worktree 亲跑·零触他树·run 后即拆]+本卷 REQUEST 1+件①件② proof 2+EXEC 收据 1[若落 tracked 面]）——**EXEC 硬前置（cap sanction）已满足**。
- **门9 判据升格=「届实跑≤届 cap 即绿」**：cap 随届 tip 上游步进如实跟读（届 tip/cap 值/行锚一律 fetch 亲证为准）·实测值入收据·超届 cap 红停上报非自升（Ban 自升维持）·§8-停止条件① 同步改挂「届树 docs:check>届 cap 且协调方未裁」。
- checklist 行锚承读：blob `376fd5bc`→**`a175c238`**（@`656fc7be` 亲算）·**`:3351`（5E-CLEANUP cap 行）/:2609（偏离⑦行）双双零位移亲证**·§9-rev.7-1「沿其先例形」读法不变。
- 本卷 §0.4/§9-rev.1 pin 七 blob @`656fc7be` 复证：六 code/test blob（graph `6cdcc122`/state `d387ab08`/lifecycle `246657b1`/resume.proof `f5dfcacf`/lifecycle.proof `4a6123fb`/generate-question `5bbc052e`）全值恒等零漂亲证·policy 一件随 cap 步进 `4509bf68`（唯一漂移件·上记）。

### §9-rev4.3 修订③（R-3/R4-3·P2）——面3 克隆钉升格：storage+writes 双 map 双层深拷

- §9-rev3.2(a)「双实例各持独立克隆 MemorySaver」升格双钉：克隆必须 **storage+writes 双 map 双层深拷**——证据链四环亲读（装版 langgraph **1.4.7**+langgraph-checkpoint **1.1.3** 主仓 .pnpm 实存）：`dist/pregel/io.js :51-62`（`Command(resume)`→`yield [NULL_TASK_ID, RESUME, cmd.resume]` RESUME write 进 writes 管线）→`dist/pregel/loop.js :379`（`checkpointer.putWrites(config, writesToSave, taskId)`）→checkpoint `dist/memory.cjs :246`（`this.writes[outerKey][innerKeyStr]` 落 writes map）+`:100`（getTuple `pendingWrites=Object.values(this.writes[key])` 读）→`dist/interrupt.cjs :59/:66`（scratchpad.resume 空→GraphInterrupt 再抛）。
- **漏 writes=RESUME 丢失→interrupt 再抛=落点恒等断言假绿**；浅拷（引用共享）=实例 A resume 落写漏进实例 B=恒等假象（§9-rev3.2(a) 禁共享机制面原句维持·本节补钉双层深拷形）——EXEC 落码克隆器对 storage 与 writes 两 map 各自逐层复制·克隆形入收据披露。

### §9-rev4.4 修订④（R4-2·P2）——面3 驱动面钉死：裸图双 Command(resume) 形

- §9-rev3.2(c) 二择一**钉死（双审 FAIL 采纳）**：face-3 核心驱动面=**裸图双 `Command(resume)` 形**（双克隆实例各自直驱）——submitAdaptiveAnswer 二次驱动**结构性不可行定谳**：第二遍 submit 撞 `:421-424`（第一遍 `:423` markInterviewAnswerApplied 已消费 claim→`:421` verifyInterviewAnswerClaim 零命中→`:422` throw `answer_identity_lost` 亲读）·`:381` alreadyApplied 短路形（直达既有纯重放路径 `:402` elif）非双遍对等驱动。
- **事件键幂等断言如实披露**：裸图形无 lifecycle 投影衬底→§1-件① 面3「事件键幂等重放」断言**归 submit-replay 臂**（§9-rev4.1 重放臂·answer_evaluated 幂等键 appendEvent 形 `:447` 亲证）承载+EXEC 收据披露所用形·裸图形只断言落点/重放计数恒等（§9-rev3.2(a)/(b) 双钉维持）。

### §9-rev4.5 修订⑤（R-4·P2）——五列映射逐臂预填 ≥4 臂+fresh 臂新世代直通正对照

- §9-rev3.9 五列映射 **EXEC 预填（≥4 臂下限·EXEC 可增臂·增臂同形入表）**（布防位置=世代判据+needle·消费读位=`:366`/`:400`/`:401`/`:510`/`:443` 系）：

| 臂 | 手法 | 断言 | 布防位置 | 消费读位 |
|---|---|---|---|---|
| fresh-stale 守卫 | 世代判据剥字段+同 identity submit（resume 形） | stale_question 零抛·identity 保持不 stale | saver getTuple 世代判据（checkpoint.id==resume 前目标 id 剥）+needle（pending 四子键） | `:366` 系（before 快照·`:396-397` 判据） |
| fresh-出题方向 | 同形（mind.competencies 剥→plannerSequence 空序） | 出题方向确定+**新世代直通正对照**（next payload 含 plannedTurns/askMode=证零过剥） | 世代判据+needle（mind.competencies/plannedTurns/askMode） | `:374-379`/`:400`/`:401` 系 |
| replay-写卡跳过 | 形① eval-done 坠点+同 identity 重入 invoke(null) | score_card 行数=0（deps.scoreWriterLeaseOwner 必配=operative 门非短路） | 世代判据+needle（transcript 末回合 dispositions） | `:510` 系（`:509`/`:511` 门） |
| replay-evidence 缺键 | 同 replay 驱动形 | answer_evaluated payload 零 evidence 键（undefined 不进 JSONB） | 世代判据+needle（evidence） | `:443` 系（`:446` 读） |

- **fresh 臂新世代直通正对照断言=「证零过剥」**：resume 落写新世代（checkpoint id 变化）后读零触（§9-rev3.1 世代判据语义）·下一题 persist/emission payload 含 plannedTurns/askMode（`:430`/`:469`/`:496` 亲证）——防拦截形自身过剥新世代的结构性正对照·两臂共用。

### §9-rev4.6 修订⑥（R-5·P3）——§0.4 行锚 `:509-511` 承接+§9-rev.9 冻结句升格读

- §0.4 表 adaptive-lifecycle.ts 行锚「v5 写卡跳过 `:506-508`」改读 **`:509-511`**（rev4 席亲读=`:506-508` 系注释叙事行位·operative 门=`:509` 条件+`:510` dispositions 读+`:511` 空序判据）——§1-件① 面1「(`:506-508` 语义)」与 §9-rev3.1 所引随此承接改读（原文零洗）。
- **§9-rev.9 冻结句升格读**：「以 §9-rev 修正后的定稿文本为冻结本体」补「**§9-rev4 修正后**」字面=冻结本体=**§9-rev4 修正后定稿文本**（§9-rev.2/.3/.5/.6/.7+§9-rev3.1-.9+§9-rev4.1-.6 修正句全链并入 §1 读·原文零洗替换读）·禁令不变·EXEC 立项对 rev4 后定稿文本仍零触（触则回炉重审）。

### §9-rev4.7 门矩阵 rev4 后口径+rev4 后 STOP 状态（rev4 席亲跑）

- **docs:check**：届树亲跑 EXIT=0 **2210≤2216 余 6**（@`656fc7be` 只读临时 worktree·零触他树·run 后即拆）·本树（HEAD `cb9679bf`）亲跑 EXIT=0 **2202≤2208 余 6**（本 rev append 零新增文件→计数不变）。
- **markers**：本 rev 改动集（恰 1 .md）五类标记词+行首冲突标记直扫零命中（词族运行时组装不誊卷·沿 §7 同形制·i6-239 §2-7 口径）。
- **diff 面**：本 rev 恰 1 tracked=本卷 .md 纯 append 零删改·零码面·B 段门 1-12 沿 §2 预 registered 判据·随 §9-rev.1/§9-rev.4/§9-rev3.3/§9-rev4.2/§9-rev4.6 修正值读。
- **STOP=`draft:awaiting_pre_exec_dual` 三处同值维持**（Status 头/§8/卷尾注零字洗）——rev4 落卷后待双审 FAIL 修订清单（R-1-R-5+R4-1-R4-4）落点确认（或协调方裁定）→**重派 pre-exec 双审两独立外席**（rev4 后重审·alone≠dual·Ban self-approve）·开工权归协调方·⛔push ⛔merge 主线 ⛔改码面（本 rev 恰 1 doc 零码面）·est live=0（rev turn 全只读+1 doc append·届树亲跑系只读临时 worktree）·actualSpendCny=null。

## §9-exec EXEC 记录（EXEC 席落卷 2026-10-17·七字段+F-1/A1-A7 落法逐条+收据披露·STOP→`executed:awaiting_post_prove_dual`）

**授权链**：起草落卷→rev/rev3/rev4 三轮 pre-exec 回路（append 注记形·上文零洗）→第四次双审会签 **PASS×2**（席1 `agent_8ff74c69`+席2 `agent_264162ff`）→协调方明示授权 EXEC（EXEC 六条收据落法=F-1/A1-A7 硬前置随派单令）→EXEC 本卷（fetch 亲证 origin/feat/mysql-schema-skeleton=`79d83617`·派单届 tip≥79d83617 等号成立+对 rev4 pin 656fc7be merge-base --is-ancestor EXIT=0 祖先亲证→**merge `741bc79e`** --no-ff 双亲 1510999a+79d83617·SSOT 冲突并集解**未触发**=auto-merge 零冲突 40 files·⛔pull --rebase 未用）。

**七字段**：①工作区 `meetwise-ag16`·分支 `line/ag16-resume-proof`·EXEC 基线 merge `741bc79e`；②§0 全量重 pin=十一 blob 对届树全恒等零漂（七 code/test `6cdcc122`/`d387ab08`/`246657b1`/`f5dfcacf`/`4a6123fb`/`5bbc052e`/`daf99bdd`+四注册件 `f6b6df38`/`3b04b871`/`6104cb80`/`0787a7ff`+pnpm-workspace `f14e7fc2`·policy `4509bf68` 唯一漂移件随 cap 步进承 rev4.2 记账）；③落码恰 **2 新+4 改**=件① `apps/worker/test/adaptive-legacy-checkpoint.proof.ts`（读缝拦截世代判据形+面1 两臂对准+面2 键集臂+面3 裸图克隆·43 断言）+件② `packages/ai-graphs/test/adaptive-compile-contract.proof.ts`（C1-C6·18 断言）+worker package.json+root package.json+ai-graphs package.json+runner 四处 additive（source/whitelist/命令映射/预迁移名单·沿 ag-a-resume 同形·source 清单含 state.ts 承 §9-rev.7-2）+本收据 `ai-docs/delivery/receipts/ag16-resume-proof/00-exec.md`·零产品码零迁移零 lockfile；④门矩阵全表+两 proof 臂账=收据 00-exec.md ①②节（门1 43/43 EXIT=0 两连跑·门2 18/18·邻面 36/49/5/11/4/39 全 EXIT=0·neg:all 692 恰等·typecheck 8/8·lint 12/12 五值恰等 root 5235/web 601/api 1421/db 1042/worker 954 零新增·docs:check 届实跑 2214→收据后 2215≤2216 余 1·markers 0/0·diff 恰 2 新+4 改+REQUEST+收据·tsbuildinfo 门副产已还原）；⑤F-1/A1-A7 落法逐条+五列臂数映射=收据 ④③节（F-1 seed score_request 沿 interview.proof.ts:252 先例三臂全行使+dispositions 在场正对照 score_card=1·A2/A3 重入 seam 定稿 fail-closed 错形→:443-447 位+:509 伴生条件为真臂+:487-491 位 same-shape-uncovered 如实披露·F-2 假机制句禁用=幂等重放真机制钉死+裸图真因=:402 elif 零 invoke/:381 alreadyApplied·F-3 克隆双 map 双层深拷+浅拷串染恒等假象主险对照实证+RESUME 内存链自种句作废 rev4.3 假绿路径·A7 届账=届 tip 79d83617 树 2211+REQUEST 1+2 proof+收据 1=2215≤2216 余 1·门9=届实跑≤届 cap ✓）；⑥偏离两条如实登记=邻面 adaptive-life 实跑 49（静态计数口径沿革·届时实测值语义）+lint 贴边红自纠两处（计算键形/括号访问·仓内先例形·帽零放宽）；⑦STOP=`executed:awaiting_post_prove_dual` 三处同值翻面（Status 头/§8/卷尾注·前值 draft:awaiting_pre_exec_dual 史录零字洗）·LEDGER/checklist/issues-final 翻面权归协调方（本刀零触共享 SSOT）·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·est live=0·actualSpendCny=null·pins 十一值零翻转·⛔push。

---

*AG16-RESUME-PROOF REQUEST · 2026-10-16 起草 · STOP=`executed:awaiting_post_prove_dual`[EXEC 席翻面 2026-10-17·前值 `draft:awaiting_pre_exec_dual`=起草+rev 史录] · base `feat/mysql-schema-skeleton` @`fe4079a0`（起草 origin tip 亲证）· EXEC 基线=merge `741bc79e`（--no-ff 并届 tip `79d83617`）· 分支 `line/ag16-resume-proof` · 工作树 `meetwise-ag16`（本起草席立）· 立项出处=issues-final AG-16 `:28/:224-234`+AG-27 `:345-353`+EXPERT-REVIEWS `:69`+review-log `:136`+ci-wiring2 偏离⑦ `:130/:146/:157`+checklist `:2609/:3340`· 残面=①旧 checkpoint resume 三面（兼容/版本失配/中断点确定性）②recursionLimit 纪实收口· 修法=两新 proof+门注册四处·EXEC 落码=43+18 断言两件全绿+邻面/负门/静态门届实跑全绿· est live=0 · pins 十一值零翻转 · markers=0 · docs:check 届实跑 2215≤2216 余 1 · ⛔push⛔merge主线 · Ban self-approve · alone≠dual · post-prove 双审待派 · **STOP***

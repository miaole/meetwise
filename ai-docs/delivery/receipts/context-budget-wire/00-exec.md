# CONTEXT-BUDGET-WIRE EXEC 收据（七字段）——AG-20 CTX-02 显式接线刀 EXEC 席 · 2026-10-17

工作树 `meetwise-ag20` · 分支 `line/context-budget-wire` · 授权链=起草落卷 `86ab374b` → pre-exec 双审会签 PASS（席1 `agent_d536f449`+席2 重派 `agent_3741484d`·P2 修订随 EXEC 落）→ 协调方明示 EXEC 授权（派单·STOP→executed:awaiting_post_prove_dual）→ EXEC 本卷 · est live=0（门矩阵 proof 面全隔离容器/纯函数/确定性 stub·零模型外呼·零 Key 加载·零 env 触·零生产操作）· `actualSpendCny=null` 零支出记录。

## ① 门矩阵全表（十五门·EXIT 原值·并线树 `01503e5c` 基·交付 commit 前实测）

| # | 门 | 判据 | 实测 | EXIT | 结论 |
|---|---|---|---|---|---|
| 0 | 改前基线 run（恰 1 次） | prompts.ts blob `899be6f2…` 恒等+context-budget.ts blob `45c3c343` 前缀+docs:check ≤2200 | `git hash-object prompts.ts`=`899be6f2a348703250447c30a0f15d83e626a1e5` 恒等·`git hash-object context-budget.ts`=`45c3c34315274bad8855867585187eec708a03f6` 前缀恒等·check-docs EXIT=0 scanned **2194**≤2200（并线树含本卷） | 0 | 绿 |
| 1 | 新 prove:context-budget-wire | EXIT=0·三带（P2-B）·组B 字节恒一必须 PASS | **14 PASS/0 FAIL**（P2-B 三带=组A 6+组B 3+组C 5）·B1 后缀差恒等/B2 缺省臂 v7 形 PASS·tsx 直跑免隔离·首跑即绿；终树复行使 14/14（PASS 行逐字节恒等机检） | 0 | 绿 |
| 2 | CTX-02 本体门 | EXIT=0·49+35 恒等 | prove:context-budget **49 臂**（源锚 `grep -c "A('"`=49 恒等）+prove:g7-freetier-reprove-paths **35 臂**（源锚=35 恒等）·两命令 EXIT=0 | 0 | 绿 |
| 3 | 随翻门·ag19 | 隔离 wrapper·47 对届时·blob 双读恒等+v8 零触 | `pnpm ag19-prompt-version:prove` **50 PASS** EXIT=0（=47+sse-api-family 臂 0-b +3·届时实测=sse 卷自证「ag19 50」恒等）·blob 臂 PASS=「git blob sha1=96acf9c3414f8dd19b781d795f8d04e779e04c5c·REGISTRY v8 随翻重钉(#51)·AG-20 单源提取恒等」·v8 计 2 PASS | 0 | 绿 |
| 4 | S3 护面 resume-grounding | EXIT=0·39 | `node scripts/run-e2e-isolated.mjs resume-grounding:prove:raw` **39 PASS**·D 区围栏臂+live 多轮臂全绿 | 0 | 绿 |
| 5 | #51 护面 session-summary | EXIT=0·17·C2 随翻复绿 | **17 PASS/0 FAIL**·C2 新锚「C2 service 消费点:vars 第 10 键 session: sessionOut 在案(AG-20 预算裁定出口)」PASS·组B 渲染字节恒等 PASS=件① 提取单源零漂机械保证 | 0 | 绿 |
| 6 | 邻面 interview/flow/life | 57 对届时+5+49 | 隔离 target `interview:prove:raw` **64 PASS**（=57+queue-enqueue-bp +7·届时实测=其卷自证「64 PASS」恒等）+adaptive-flow:prove **5**/0+adaptive-life:prove **49**/0 | 0 | 绿 |
| 7 | 邻面 neg 六段 | 687 对届时 | **692**（90+90+91+107+179+135·=687+queue-enqueue-bp interview 段 +5·其卷自证「90/90/91/107/179/135」恒等·429 映射臂在输出亲证）EXIT=0 | 0 | 绿 |
| 8 | migrate:prove | EXIT=0·链 204 头 0204 | `✓ 迁移运行器 全部通过`·`ls packages/db/migrations | wc -l`=204·头 `0204_ai_cost_cached_input_price.sql` | 0 | 绿 |
| 9 | drift+uniqueness | 零漂移·violations=0 | `✓ schema 无漂移`+`files=204 violations=0 exemptions=0143,0152,0160` | 0 | 绿 |
| 10 | typecheck | 8/8·0 cached | 三跑序列：6/8 红（件④ TS2304）→7/8 红（件⑩ TS2339）→**8 successful, 8 total·Cached: 0 cached, 8 total**（详⑤-1） | 0 | 绿 |
| 11 | lint 五值恰等 | 12 任务·0 errors·五值对届时 | `Tasks: 12 successful, 12 total`·root **5235**/web **601**/api **1421**/worker **954**/ai-runtime **628** 全 0 errors·对 #51/queue-enqueue-bp pin 值逐一恒等·件③/件⑩ 零警告增量 | 0 | 绿 |
| 12 | docs:check | scanned≤cap 2200 | `ai-docs check passed: 80 required files verified; public text policy scanned **2197** managed worktree files`≤2200·余量 **3**（终树实测=基线 2194+件③+件⑩+本收据 1·两新码文件与本收据均入 managed 扫描面） | 0 | 绿 |
| 13 | markers 五类 | 改动集零命中 | 运行时组装词面（i6-239 §2-7 口径·词面不入卷防自匹配）扫 12 tracked+本收据 **零命中**（命令与回执见⑦） | 0 | 绿 |
| 14 | diff 面机检+卫生 | 对 base=`d5dc0726` 恰 12 tracked+四件卫生 | `git diff --numstat d5dc0726` 恰 12 tracked（详③）·守恒断言零触机检（详③末）·`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT·actualSpendCny=null·est live=0·typecheck 副产 tsbuildinfo `git checkout` 回滚 | 0 | 绿 |

**行使形登记（全序列·零断言红冲销）**：门 10 首跑 6/8=件④ TS2304（fenced 文本 (c) 引 ModelCostPolicy 而 (a) import 漏 `type ModelCostPolicy`·件⑤/⑥ 同形均有=定稿文本面缺陷·根因在本刀交付面）→:8 import 补 type（修法语义零变）；二跑 7/8=件⑩ A2 臂 `.plan` 欠判别收窄 TS2339（新 proof 署名窗口构造缺陷·#51 卷门 9 同类先例）→提升局部变量+`.ok` 收窄（臂名断言语义零变）→三跑 8/8 绿。门 1 终树复行使一次（两修正后·PASS 行集合逐字节恒等）。census 绿跑登记（零红·同臂集同值）：门 2a/2b 各+1（49/35 源锚口径核）·门 3+2（50 核+blob 臂行抽验）·门 4+1（39 核）。Ban retry-to-green 辨析：全序列无「语义断言 FAIL 改 PASS 冲销」——门 10 两红均编译/静态面构造缺陷且根因在本刀交付面；邻面门（2/4/5/6/7/8/9）首臂执行跑即绿零重跑。

## ② 机制证 + 三带账（P2-B）+ ag19/C2 翻面账

**降级臂机制证（门 1 组A·亲证）**：A3 窗口紧形（window=1000/out=100/margin=1/in=1000/reserve=0→available=899·system/userData/rag 各 100B+summary 1000B）→`planDispatchBudget` status=**degraded**·trimmedComponents 含 **summary**（裁后 300≤899 fit）→`sessionSurvivesAskBudget`=**false**=段不渲染（#51 v8 缺省臂既有字节路径）；A4 窗口算术破形（available<1）→ok:false→true 委任 transport 权威拒绝臂；A5 safetyMargin=0（FromCostPolicy throw 形=transport validPositive 同破损面）→true 不抛委任臂；A1 缺省 undefined→true 零触（scripted deps 现状字节·门 6 flow 5/life 49/interview 64 全绿交叉实证）。**组B 单源恒一（P2-B 带 B）**：B1 `buildData(带 session) === buildData(去 session)+renderSessionSummarySection(session)` 后缀差恒等 PASS=件① 提取零漂机械保证+门 5 组B 渲染字节恒等交叉实证；B2 缺省臂 v7 形守卫 PASS；B3 段结构+弱点空省行 P2-c PASS。**组C 静态五锚（P2-B 带 C）**：C1 service 三子串/C2 prompts 单源/C3 四段管道/C4 CTX-02 真消费非复刻/C5 注册——全 PASS。

**ag19 翻面账（件⑧·语义翻转如实登记非为绿改）**：blob 钉 :96-97 值 `899be6f2…`→`96acf9c3414f8dd19b781d795f8d04e779e04c5c`（件① 终字节后 `git hash-object` 机械重算·proof 内 createHash('sha1') 同法双读恒等亲证）·臂名「…blob=插值」→「…AG-20 单源提取恒等·blob=插值」。**registry/序列语义面零触**（八对表 interviewer.ask 恒 v8/v8 计 2 PASS·渲染输出字节恒等=非版本位阶事件·如实登记）。**C2 随翻账（件⑨）**：`svc.includes('session: session ?? undefined')`→`svc.includes('session: sessionOut')`·C2 语义「vars 第 10 键 session 消费在案」原样保全·仅消费表达式随件④ (e) 演进·组C 其余三锚零触（C1/C3/C4 PASS 亲证）。

**P2-C failover primary 钉登记**：`apps/worker/src/main.ts` :647 `askCostPolicy: modelCost.policies.primary` 与 :519 `defaultModelClient({ primary: modelCost.policies.primary, backup: … })` **同一政策对象同源注入**（组合根 `:445 resolveModelCostGovernance()` 单源·transport `model !== costPolicy.model` 恒等闸背书）——failover 包装链不参与政策供给（failover-model.ts blob `af04ae73` 53L 零字节零触·不透出静态 costPolicy·modelFor requestDigest 消费面禁触=候选丁 Ban 承·`git diff d5dc0726` 零 model-client/failover-model/invoke 路径机检在③）。

## ③ diff numstat（对 base=并线 merge 第二亲 `d5dc0726`·落卷 commit 前实测）

```
M  apps/worker/package.json                                    ←件⑩ 注册
M  apps/worker/src/adaptive-interview-service.ts               ←件④
M  apps/worker/src/adaptive-lifecycle.ts                       ←件⑤
M  apps/worker/src/interview-consumer.ts                       ←件⑥
M  apps/worker/src/main.ts                                     ←件⑦
M  apps/worker/test/session-summary.proof.ts                   ←件⑨
M  packages/ai-runtime/src/index.ts                            ←件②
M  packages/ai-runtime/src/prompts.ts                          ←件①
M  packages/ai-runtime/test/ag19-prompt-version.proof.ts       ←件⑧
M  ai-docs/delivery/harness/context-budget-wire-REQUEST.md     ←本卷（§0.1 追记+STOP 三处翻面+§9）
?? apps/worker/src/ask-context-budget.ts                       ←件③ 新增
?? apps/worker/test/context-budget-wire.proof.ts               ←件⑩ 新增
?? ai-docs/delivery/receipts/context-budget-wire/00-exec.md    ←本收据 untracked 不入 12
```
=恰 **12 tracked**（3 新 9 改：件③+件⑩+本卷 .md 对主线 tip 系新文件；9 改=件①②④⑤⑥⑦ 6 码+件⑧⑨ 2 test+package.json 1）。**守恒断言机检**：`git diff --name-only d5dc0726` 零 context-budget.ts/model-client.ts/failover-model.ts/invoke.ts/session-summary.ts/state.ts/generate-question.ts/resume-grounding.proof.ts 路径=CTX-02 本体+transport 拒绝臂+digest 面+#51 图链+S3 护面全零字节零触（blob 门 2/门 3 亲证交叉）。

## ④ 重 pin 全表（§0 协议·对并线树 `01503e5c`（树=`d5dc0726`+本卷）全量复核）

blob 恒等七锚：context-budget `45c3c343`/353·prompts `899be6f2`/242·index `63bf8afe`/240·lifecycle `3b4f05e1`/622·consumer `27ddbcf1`/657·main `6fa1e374`/844·worker package.json `bf38d19b`/181。blob 漂两锚（并线携 sse-api-family·§0.0 预置场景·重 pin 非停）：#4 service `757d7f95`→`05c598b3`/773（+2 `service:` 键 @:327/:549·与本刀触面 :8/:11/:211-214/:397/:529-532/:563 零 hunk 交叠亲证）·#8 ag19 proof `d8dfb822`→`b471dfff`/393（+39 臂 0-b 源级门 :100 起·blob 钉区 :94-98 零触）。#51 图链 session-summary.ts `92f1a2ba`→`e64a5152`/state.ts→`d387ab08`=主线 ai-graphs-cycle-break nail 演进（对 base 零触机检在③）。P2-A 行号实值逐一亲证：lifecycle interface **:116**/trackLocalDeficitRef **:153**/makeDeps **:161**/透传 **:173**+service `AdaptiveServiceDeps` :211/`fastModel` **:214**/material **:529-532**/vars 行 **:563**/retrieveAndGenerate :397/buildAdaptiveDeps :374/lastFollowUp :381。门基线锚届时实测：context-budget 49/g7-freetier 35/session-summary 17/resume-grounding 39/flow 5/life 49/migrate 204 头 0204/cap 2200（public-text-policy.mjs :102）恒等；ag19 **50**/interview **64**/neg **692**（归因=已并主线 sse-api-family/queue-enqueue-bp 两卷 EXEC 自证值恒等·如实改锚·结论不变）。门 0 基线 run：blob 恒等+check-docs 2194≤2200 EXIT=0。

## ⑤ 偏离清单（如实登记·非零项 4）

1. **门 10 两构造红（行使形·非语义冲销）**：件④ fenced 文本 TS2304（(a) import 漏 `type ModelCostPolicy`·件⑤ (a)/件⑥ (a) 同形均有=定稿文本面缺陷·非 EXEC 自由发挥）+件⑩ TS2339（A2 内联 `.plan` 欠收窄）——修正均限类型面/收窄面·臂名与断言语义零变·零 disable 注释·根因均在本刀交付面（§8 停止条件要件未触）。如实升级 post 双审核对。
2. **门基线锚三项漂移（届时实测如实改锚·非本刀引入）**：ag19 47→50（sse-api-family +3）·interview 57→64（queue-enqueue-bp +7）·neg 687→692（interview 段 +5）——三者均为并线携已并主线内容·各来源 EXEC 卷自证值恒等亲证·§0 协议「基线漂移如实改锚·结论不变」承载·§8 现场漂移停止条件以「未经归因」为实害未触（归因链在④）。
3. **census 绿跑 +1/+1/+2/+1（门 2a/2b/3/4）+门 1 终树复行使 1 次**：全绿同值零红零冲销（行使形登记①表）。
4. **P2-E 余量口径勘记**：P2 预估「docs 预算余量实 2」vs EXEC 终树实测 scanned **2197**→余量 **3**（2200−2197=基线 2194+件③+件⑩+收据 1）——P2 预估较实测多计 1 文件（预估口径差如实登记·不洗）·方向不变（贴边薄余量·Ban 自升失效方向安全承守·>2200 即停未触）。

## ⑥ pins 零翻声明 + 停止条件判定

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null——十一值照抄零翻转。停止条件四类判定：现场漂移=未触（blob 七恒等+两漂锚归因=预置并线场景重 pin·零实新在飞触面·门基线锚三项漂移归因已并主线卷自证值·cap 2200 恒等）；机制不满足=未触（A3 degraded/summary-trimmed 亲证=§1.1 缺口推定兑现·failoverModel 未透出 costPolicy=§1.2 前提成立亲证）；越界需要=未触（12 路径零外·CTX-02 本体/transport/#51 图链/MEM 面零字节·零迁移零 SSOT）；验收红不可修=未触（十五门全绿·两构造红均本刀交付面已修正·见⑤-1）。⛔push ⛔force push 未用·⛔pull --rebase 未用。

## ⑦ markers 扫描命令与回执（门 13·词面运行时组装防自匹配）

命令形（同 `scripts/i6-239-gates.proof.mjs` §2-7 组装口径·词面不入卷）：node 运行时拼装五类词（四标记词 char-join+冲突标记对 `<'*6|>'*6` 正则）→对改动集 12 tracked+本收据逐文件 `includes`/正则扫描（执行时点含 typecheck 副产 tsbuildinfo 暂脏面共 14 文件同扫·回滚后正式改动集 13 文件为其子集·零命中结论覆盖）。回执：`hits=[]`·零命中 EXIT=0。门 12 docs:check 终树值 **2197**≤2200（余量 3·P2-E 预估 2 与实测 3 之差已在⑤-4 勘记）与门 0 基线值 2194 已录①表。

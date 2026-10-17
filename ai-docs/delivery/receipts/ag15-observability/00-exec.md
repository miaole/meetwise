# AG15-OBSERVABILITY EXEC 收据（00-exec·2026-10-17·untracked 不入 diff 九路径）

**授权链**：pre-exec 双审会签 PASS×2（席1 agent_8c34943b+席2 agent_45e5d4b8）+协调方明示 EXEC 授权+前置 cap-2232 nail 落主线。工作树 `meetwise-ag15`·分支 `line/ag15-observability`·并线前 HEAD=`a1cb1f85`。

**序 1 并线**：`git fetch` 亲证 `origin/feat/mysql-schema-skeleton`=`bb321093`（`git merge-base --is-ancestor bb321093 origin/feat/mysql-schema-skeleton` EXIT=0·届 tip≥bb321093 等号成立）→`git merge-tree` 预演 EXIT=0 零冲突→`git merge --no-ff origin/feat/mysql-schema-skeleton`=**`be854a14`**（29 files +2279/−32·ort 零冲突兑现·⛔pull --rebase 未用）。

**序 2 §0 全量重 pin（十七锚 `git hash-object` 本席亲算 @`be854a14`）**：

| # | 文件 | blob（届） | 行数 | 判定 |
|---|---|---|---|---|
| 1 | migrations/0001_baseline.sql | d68f8dd0 | 485 | 恒等 |
| 2 | migrations/0149_money_status_constraints.sql | cec80b94 | 83 | 恒等 |
| 3 | migrations/0143_db_id_v7_unify.sql | b96e00f5 | 136 | 恒等 |
| 4 | migrations/0194_money_consistency_graph_run_terminal.sql | e514427b | 71 | 恒等 |
| 5 | migrations/0186_qbank_org_owner_columns.sql | bba0666c | 143 | 恒等 |
| 6 | sql/01_schema.sql | 5ae54c19 | 185 | 恒等（:25-36 镜像位/lease_expires_at :33 亲证） |
| 7 | src/interview/interview-graph-lease.ts | d30a4048 | 87 | 恒等 |
| 8 | src/index.ts | 3c210e21 | 642 | 恒等（:149-150 导出锚亲证） |
| 9 | apps/api/.../interview.service.ts | cf23ed37 | 906 | 恒等 |
| 10 | src/commerce/commerce.ts | 99f6aba6 | 664 | 恒等（P2-1 守恒断言陈值 daa07b41→99f6aba6 照更） |
| 11 | apps/worker/src/adaptive-lifecycle.ts | 246657b1 | 625 | 恒等（:15/:46-49/:246-250/:321-329/:393-405/:419 全行锚亲证） |
| 12 | src/langfuse-v5.ts | 63d5466c | 199 | 恒等 |
| 13 | adaptive-interview/graph.ts | 6cdcc122 | 66 | 恒等 |
| 14 | src/metrics.ts | a34c585d | 187 | 恒等（METRIC 尾槽 :124-125/基线区 :165-166 亲证） |
| 15 | apps/worker/src/interview-consumer.ts | 265798df | 660 | 恒等 |
| 16 | apps/worker/test/adaptive-consumer.proof.ts | 6d33d0c8 | 479 | 恒等（`A(` 直数 35） |
| 17 | apps/worker/package.json | **f6b6df38→d83fbde4** | 182→**183** | 漂（偏离④：AG-16 0e601e7d 注册行+1 @:57 区·本刀锚 `prove:bill1-topic-fields` **:27 内容恒等零移**·注册照 :27 后插入） |

**门基线锚届值**：cap=**2_232**@`scripts/ai-docs/public-text-policy.mjs:110`（blob `05f48933`/408L·=cap-2232 nail 落主线·原 2216@:106/4509bf68 届前值存档=偏离③）·迁移链 204 头 0204→本刀后 205 头 0205·uniqueness exemptions=0143,0152,0160 恒等·METRIC 同口径 36→37（件⑤ 后）·门 0 基线 docs:check=EXIT=0 **scanned 2222**（stash 对照亲证）·§0.0 在飞复扫（全 refs 非 HEAD 祖先对十七锚 merge-base diff 扫描）零新在飞触面·0205 全 ref 防撞零命中。

**序 3 九路径落点**：件① `packages/db/migrations/0205_ai_graph_run_observability_columns.sql`（新·三 ADD COLUMN IF NOT EXISTS 幂等形·@migration-mode multi-statement·定稿逐字节）·件② `packages/db/sql/01_schema.sql` :33 后三行镜像（尾行无逗号）·件③ `packages/db/src/interview/graph-run-observability.ts`（新·哑读写+谓词·六值 LIVE_RUN_STATUSES）·件④ `packages/db/src/index.ts` :150 后导出行（改）·件⑤ `packages/ai-runtime/src/metrics.ts` METRIC 尾槽+基线行（改）·件⑥ `apps/worker/src/adaptive-lifecycle.ts`（改·import 扩形/classify+threshold 两函数/observeGraphRunPosition fail-soft await 形/两挂点恰 2 处=届树 :374（start :328 行后）+:452（answer :405 块闭后 :406 transcript 读前）·均 :419 区投影事务外）·件⑦ `apps/worker/test/graph-run-observability.proof.ts`（新·四组臂·零 DB 零外呼零 env）·件⑧ `apps/worker/package.json` :27 后注册行（改·=件⑦ 注册句·P3-2 标签对齐）。P3-1=件⑥(c) runGraph 锚 :243-247→**:246-250** 照实值落卷。

**序 4 门矩阵十二门（届实跑·EXIT 原值）**：

| 门 | 命令 | EXIT | 关键值 |
|---|---|---|---|
| 0 基线 run（恰 1 次） | fetch+blob+ls+check-docs（stash 对照） | 0 | lifecycle `246657b1` 亲证·migrations 204 头 0204·docs scanned **2222**≤2232 |
| 1 新 prove | pnpm -C apps/worker prove:graph-run-observability | 0 | **ALL PASS 21 臂**（首跑绿·lint 构造修正后复行使同值零断言变更） |
| 2 migrate 链 205 | pnpm migrate:prove | 0 | 「迁移运行器 全部通过」+隔离收据 `schemaMigrationManifest count=205 latest=0205_ai_graph_run_observability_columns.sql`+`applied=205 skipped=0`（零 0206+） |
| 3 drift+uniqueness | pnpm drift:prove / node scripts/check-migration-version-uniqueness.mjs | 0 / 0 | drift 零未登记漂移（豁免 2=dbhy1 退役残面登记面）·**files=205 violations=0 exemptions=0143,0152,0160** |
| 4 adaptive-consumer | pnpm adaptive-consumer:prove | 0 | **pass_count=37 fail_count=0**（≠35 归因=偏离②：静态 35 恒等+动态 turn 臂 ×3=+2） |
| 5 图邻面三族 | adaptive-life:prove / adaptive-flow:prove / reaper:prove:raw | 0/0/0 | life **49** PASS+flow **5** PASS+reaper **28** PASS（fail-soft 零位移·零回退） |
| 6 neg:all | pnpm neg:all | 0 | **692=90+90+91+107+179+135** 六段全绿 |
| 7 typecheck | pnpm turbo typecheck --force | 0 | **8 successful, 8 total·0 cached**（修正后复行使同值） |
| 8 lint | pnpm turbo lint（首跑→修正→--force 复行使） | 1→**0** | 12 任务 0 errors·五值恰等贴边 **root 5235/web 601/api 1421/worker 954/ai-runtime 628**+db 1042（首跑红=+4 本刀构造警破 pin·修正后复行使·行使形见偏离①） |
| 9 docs:check | node scripts/ai-docs/check-docs.mjs（终树） | 0 | scanned=**2226**（=基线 2222+件①③⑦ 3 码面+收据 1）≤届 sanctioned cap **2_232** 余 6·零自升 |
| 10 markers 五类 | i6-239 :151-163 运行时组装词面 grep（改动集 9 tracked+收据目录） | 0 | 五类词+冲突标记对 **0/0 命中** |
| 11 diff 面机检 | git diff --numstat bb321093 | — | 恰 **9 tracked**（3 新 5 改+本卷 .md）·收据目录 untracked·tsbuildinfo 副产 checkout 回滚 |
| 12 零行为位移双证 | C1 SQL 断言+C5c 静态锚+守恒 blob 机检 | 0 | 全 PASS（见下守恒段） |

**proof 臂账（门 1 明细）**：组A classify 5（A1 'END'·A2 'interrupt:awaitAnswer' tasks 形·A3 裸节点 stuck=true·A4 degraded conclude→'END'+generation_ 前缀 lastError·A5 双调恒等）·组B 阈值 5（B1 null→false·B2 同名→true·B3 异名→false·B4 前次 interrupt:→false·B5 stuck=false→false）·组C db stub 4（C1 record SQL `SET current_node=$4, last_error=$5, checkpoint_id=$6`∧零 version 字样∧零 `status='` 赋值∧六值 WHERE∧参数序 $1-⑥∧rowCount 透传·C2 read 返回形+SELECT 只读形·C3 谓词五值域 'genQuestion't/'END'f/'interrupt:awaitAnswer'f/nullf/''f·C4 stub 拒绝诚实上抛）·组D 静态锚 C5×7（C5a try/catch+console.warn('graph_run_observability_write_failed'·C5b 两挂点恰 2·C5c `await g.invoke(null` 恒 2+`invoke(null` 字面恒 5·C5d metrics 尾槽+基线行·C5e index 导出·C5f 0205 三 ADD COLUMN·C5g 01_schema 镜像三列）。

**diff numstat（门 11·base=并线 merge 第二亲 bb321093）**：恰 9 tracked——本卷 .md+件①/③/⑦ 3 新+件②/④/⑤/⑥/⑧ 5 改（逐文件行数见 commit numstat）·收据目录（本文件）untracked·typecheck 副产 *.tsbuildinfo 已 `git checkout` 回滚零残留。

**守恒断言机检（门 12）**：`d30a4048`（interview-graph-lease）/`63d5466c`（langfuse-v5）/`6cdcc122`（ai-graphs graph.ts）/`265798df`（interview-consumer）/`99f6aba6`（commerce）/`cf23ed37`（apps/api interview.service）/`cec80b94`（0149 词表面）blob 全恒等零字节零触·`git status` 改动集=门 11 九路径+收据 untracked 零迁移外触面·`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·零 .env*·零依赖升级·零 CI/wrapper/runner 注册改（件⑦ 免隔离注册沿 ag20 先例）。

**偏离清单（如实全登）**：
- **偏离①（码面·类型/字面构造适配 ×4·门 8 行使形）**：件③ 泛型 `{current_node: string|null}`→`{[column: string]: unknown}`+`typeof` 收窄（text 列运行时恒等）·件⑥(b) `snap: any`→`Parameters<typeof pendingQuestion>[0]`（解析型恒等 any）·件⑥(c) checkpoint cast 改 index-signature 型（访问形不变）·件⑦ C2 stub 行 `{current_node:…}`→`{['current_node']:…}`（同值同键）。根因=定稿四处构造在届树 eslint naming-convention/no-explicit-any 下各生 1 警（+4）破 db 1042/worker 954/root 5235 --max-warnings pin→首跑红；修正=运行时语义零变+SQL 字符串逐字节不变（C1/C2 断言零涉）·按 context-budget-wire 门 10 先例修正+复行使+登记。零 disable 注释零守卫拆除零断言变更。
- **偏离②（门 4 臂数 37≠预期 35·归因非停）**：`A(` 静态直数 35 恒等（blob `6d33d0c8` 零触）；动态臂 `第${input.turn}题 API identity ledger 接受`（proof :181·while 排空环内）随夹具 3 答 3 次触发=+2 重复→35+2=37；与 ag04 权威形（静态 33+动态 2=35）同构·fail_count=0 零回退·§0.1 #16「runner 权威数=对届时实跑」沿承。
- **偏离③（锚随并线演进·如实改锚）**：cap 2216@:106/4509bf68→**2_232@:110/05f48933**（cap-2232 nail 已落主线=协调方前置兑现）·门 0 基线 docs scanned=2222（rev 席 2211 系届前值）·#17 package.json d83fbde4/183L（AG-16 注册行+1·本刀锚 :27 恒等）。
- **其余零偏离**：§1 红事实四环/§1.2/§1.3 五候选否决/§5 Ban/pins 结论面零翻。

**pins 零翻声明（十一值照抄）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

**est live=0**：全 prove 隔离容器/纯函数/确定性 stub·零模型外呼零 Key 加载零 env 触·零生产操作。

**STOP 终态**：`executed:awaiting_post_prove_dual`（三处翻面：Status/§8/尾注·原句存档更替）·post-prove 双审两独立外席待派·alone≠dual·nail/批表/LEDGER/AG-15 行翻面归协调方·⛔push ⛔force-push 未用。

---

**续席登记（2026-10-17·前席超时中断续作·全门对届树 `512cbf29` 重跑·本席亲跑）**：

- **续席并线**：开工 `git status`+log 亲证=前席半成品（merge `be854a14` 已 commit·九路径+文面+本收据在工作区未 commit·终 commit 缺）→`git fetch` 亲证 origin 前移=`23e80b40`（`merge-base --is-ancestor 23e80b40 bb321093` EXIT=1=前席届 tip 下界不成立）→`bb321093..23e80b40` 增量 7 files 与九路径零交叠→merge-tree 预演 EXIT=0→`git merge --no-ff`=**`512cbf29`**（`merge-base --is-ancestor 23e80b40 HEAD` EXIT=0 等号亲证·⛔pull --rebase ⛔force-push 未用）。
- **届树复 pin**：十七锚 `git rev-parse HEAD:<path>`=16 恒等（#1-#16 全对前席表值）+#17 `d83fbde4`（偏离④承·:27 锚恒等）·commerce `99f6aba6` 恒等（P2-1）·cap 2_232@:110/`05f48933` 恒等·链 205 头 0205·HEAD 行锚 :246-250（P3-1）/:328/:405-406 亲证。
- **九路径核验**：件①-⑧ 逐字节合规（偏离① 四构造点在案）·两挂点恰 2（WT :374/:452）·`await g.invoke(null` 代码形恒 2 零新增（+1 行数系定稿注释字面「Ban invoke(null)」）。
- **门矩阵重跑（EXIT 原值）**：门 1 EXIT=0 ALL PASS 21 臂（首跑绿）·门 2 EXIT=0 全部通过+`applied=205 skipped=0`·门 3 EXIT=0 零未登记漂移+`files=205 violations=0 exemptions=0143,0152,0160`·门 4 EXIT=0 pass_count=37 fail_count=0·门 5 EXIT=0×3（life/flow/reaper 隔离收据·静态 `A(` 46/5 亲数）·门 6 EXIT=0 692=90+90+91+107+179+135·门 7 EXIT=0 8/8·0 cached·门 8 EXIT=0 五值逐包亲测 root 5235/web 601/api 1421/worker 954/ai-runtime 628+db 1042 全恰等 0 errors·门 9 EXIT=0 scanned **2227**≤2232（=前席终树 2226+二次并线 readyz REQUEST +1）·门 10 五类 0/0·门 11 `git diff --numstat 23e80b40` 6 改 tracked+3 新 untracked=commit 后恰 9 tracked·tsbuildinfo 副产 checkout 回滚·门 12 C1+C5c PASS+守恒十六锚恒等承。
- **STOP 终态承维**：`executed:awaiting_post_prove_dual` 三处不变·post-prove 双审两独立外席待派·alone≠dual·nail 归协调方·⛔push ⛔force-push 未用·est live=0·actualSpendCny=null。

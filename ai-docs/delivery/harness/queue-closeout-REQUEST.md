# QUEUE-CLOSEOUT 队列收尾微刀（批5 盘点 Top2+5C post P2-1 三件一卷·零迁移·STOP=`executed:awaiting_post_prove_dual`）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 落卷·前值 `draft:awaiting_pre_exec_dual` 史录·本值为卷内三处锚定=①本卷头标题行+②本 Status 行+③§8 STOP 节·卷尾落款行不载 STOP 值防多锚漂移·沿 G7W 先例「自述三处实测四处」教训预勘误·开工权归协调方·⛔push·⛔merge 主线·est live=0·`actualSpendCny=null`）。

**席位**：QUEUE-CLOSEOUT 队列收尾微刀起草席（协调方派单令·批5 盘点席 Top2+5C-BEHAVIOR post 席2 P2-1 三件一卷·量级微·⛔push·⛔merge 主线）。

**立项出处（不自建 SSOT 行——行翻面权沿例归协调方）**：①批5 盘点 Top1/修法面=#5 reaper requeue 不清 `lease_expires_at`——`harness/5e-cleanup-sweep-2-REQUEST.md` `:41` 剔除归槽呈报行（「sweep requeue 臂 `SET status='queued', lease_owner=NULL` 未清 lease_expires_at 亲证（issues-master 修法「置 NULL」SQL 半未落）」原文在树·本席亲读）+`:53`/`:147` 锚重 pin 行（sweep 臂 `:317-318`/注释半 `:302`/consumer fence 臂 `:277-285/:279` 三锚现值）；②批5 盘点 Top2/收口面=#117 翻面行使载体——`harness/queue-enqueue-bp-REQUEST.md`（六裁决落卷卷·①案A②per-owner③N=3④429⑤预查形默认⑥收紧形采用全数行使）+`execution-master-checklist.md` `:3299`「Line queue-enqueue-bp nail」段（「批表 #117/#5 行翻面载体·翻面权归协调方核」+STILL OPEN 行「本刀不宣称关闭」在树）；③5C-BEHAVIOR post 席2 P2-1=兜底臂 reclaim 判别断言缺位——`harness/5c-behavior-trio-REQUEST.md` `:184`（「件① 双 wire 点⑵ soft-set 兜底臂…reclaim 判别断言缺位…**加固归后继小刀**（本刀零扩散·登记不销案）」原文在树）；④LEDGER `ai-docs/delivery/harness/product-campaign-LEDGER.md` `:87` 5C 组行「#5/#117/#7/#9 背压」在册未翻（本席亲读）+`:89` 翻面笔先例（【5C-BEHAVIOR-TRIO nail b02a30ce 落主线…本注记不计件】行内 append 形·本席亲读）；⑤`harness/extreview-fix-campaign-SOP.md` `:41` QUEUE-BACKPRESSURE 行（「#4 退避/#117 入队背压…」原文）；⑥issues-master #5（`:362` P3 第5批-C·原文经 ① `:41` 转录承引）·#117 行原文仓外（协调方持有·沿 Q1 #157/#158 同款登记·不阻起草）。

## §0 锚表（blob 级·对 base=origin/feat/mysql-schema-skeleton@`5c8e122c` 树亲 pin）

| # | 文件 | blob（@5c8e122c） | 行数 | 挂点/判读 |
|---|------|------------------|------|----------|
| 1 | `packages/db/src/interview/interview-jobs.ts` | `c69c03a3` | 367L | `:302` sweep docstring 已宣告「requeue 回 queued(**lease NULL**,可被重领…)」语义=修法后真值；`:277-285` fence 臂 `requeueInterviewJob`（`:279` `SET status='queued', lease_owner=NULL, lease_expires_at=NULL,…`=同翻转对照形）；`:309-332` sweepStuckInterviewJobs（`:316-319` sweep requeue 臂=**件① 修法面·`:317` `SET status='queued', lease_owner=NULL, version=version+1` 缺 `lease_expires_at=NULL`**） |
| 2 | `apps/worker/test/reaper.proof.ts` | `0b9db078` | 171L | `:34-37` orphanInterview fixture（种子 `lease_owner='dead-worker#1'`+`lease_expires_at=now()-interval '5 minutes'`=过期租约戳在种）；`:41-42` jobRow 助手（现选列 `status, lease_owner, attempts`=缺 `lease_expires_at` 列）；`:91-98` ② 下边界 requeue 段（`:96` 断言「job 回 queued 且 lease 释放(NULL)」=**件① 判别臂落点**） |
| 3 | `apps/worker/src/commerce-reconcile.ts` | `5ed1b0ed` | 140L | `:74-83` abandon try/catch（`:79` 错误码窄 filter·`:80-82` soft-set abandoned UPDATE）；`:84-86` #1 接线注记+`await cancelOpenInterviewQuestion(c, owner, s.idempotencyKey);`（**判别对象现形**——该臂绕过 abandonInterviewAndRelease·显式补 cancel）；`:87` interview_unavailable `:reclaim` 事件 |
| 4 | `apps/worker/test/commerce-reconcile.proof.ts` | `ac57bb51` | 300L | `:279-294` **⑨ 族**（`:281-285` fixture=seedOwner+interview INSERT+reserve+expireLease·`:286` commerceReconcileTick 拍·`:287-293` event_key 恒等+重放拍零重发两断言=**件③ seed/断言落点**） |
| 5 | `ai-docs/delivery/harness/product-campaign-LEDGER.md` | `33ea22d6` | 644L | `:87` 5C 组行「#5/#117/#7/#9 背压」在册未翻（翻面笔落点·**本刀零触**）+`#4（半闭注记…autovacuum 调优半无刀认领·维持开放勿翻面）`原文（§1.3 否决面）；`:89` 5E 行尾【5C-BEHAVIOR-TRIO nail b02a30ce 落主线…本注记不计件】=翻面笔行内 append 先例 |
| 6 | `ai-docs/delivery/execution-master-checklist.md` | `bad5dd80` | 3360L | `:3299`「Line queue-enqueue-bp nail」段（#117+#5 翻面载体+翻面权归协调方核+STILL OPEN 登记在树）；`:3326`「Line 5c-behavior-trio nail」段（P2-1 承登链） |
| 7 | `ai-docs/delivery/harness/extreview-fix-campaign-SOP.md` | `eae68fe2` | 99L | `:41` QUEUE-BACKPRESSURE 行（#4 退避/#117 入队背压原文·翻面行使同拍面·本刀零触） |
| 8 | `ai-docs/delivery/harness/queue-enqueue-bp-REQUEST.md` | `b549dabf` | 229L | 六裁决落卷卷（§9 EXEC 记录七字段+行使记录+「行翻面权归协调方（本卷零代行）」条款在树） |
| 9 | `ai-docs/delivery/harness/5e-cleanup-sweep-2-REQUEST.md` | `28de5763` | 159L | `:41` #5 剔除归槽呈报（5C 域·「#5/#117/#7/#9 背压」在册）+`:53`/`:147` 三锚重 pin（sweep 臂 `:317-318` 现值亲证在卷） |
| 10 | `ai-docs/delivery/harness/5c-behavior-trio-REQUEST.md` | `b4216cd9` | 186L | `:184` P2-1 兜底臂 reclaim 判别断言缺位登记（「加固归后继小刀」=本刀③立项原文） |
| 11 | `apps/api/test/neg-interview.proof.ts` | `06f8e249` | 672L | neg 回归门面（本刀零 api 触·G3 回归恰等基线） |

## §0.0 在飞扫描（2026-10-16 起草时点）

全 ref（本地 line/* + ccl 镜像 + origin）对 base `5c8e122c` 触面扫描：唯一实触面=`line/worker-hang-guard`@`4c20f12b`（EXEC 波序1 并线·已 merge `5c8e122c` 入支线）触 LEDGER/checklist 两 docs——LEDGER=新增管线行 append（`:576` 区 worker-hang-guard 起草行）·checklist=新增段 append，与本刀零 hunk 交叠（本刀=REQUEST 新文件+EXEC 期 3 src/proof 文件·零 SSOT 行本体触）；`line/ag15-observability`/`line/cap-sanction-2208`/`line/g7w-diag-needles`/`line/context-budget-wire`/`line/ag43-dual-half`/`line/ag16-resume-proof`/`line/q2-validate-scene-fix`/`line/boot-validate`/`line/worker-shutdown-seq` 九支线对本刀 11 锚文件零触亲证（`git diff --name-only 5c8e122c...line/<b>` 逐支线跑·空集）。并线序自由先并则重 pin 非停（ag20/sse-api-family 先例同形）。

## §1 修法（三件一卷·量级微·零迁移）

**件①（批5 盘点 Top1·#5 SQL 半一行+判别臂）**：`interview-jobs.ts` `:317` sweep requeue 臂

```
`UPDATE interview_job SET status='queued', lease_owner=NULL, version=version+1
```
→
```
`UPDATE interview_job SET status='queued', lease_owner=NULL, lease_expires_at=NULL, version=version+1
```

（恰 `lease_expires_at=NULL,` 一片段·余零字节）。语义定谳（本席亲读三面）：⑴ fence 臂 `:279` 同翻转（running→queued·lease 释放）已带 `lease_expires_at=NULL`——两臂数据面恒等化，清除「同语义两形」分叉；⑵ docstring `:302` 已宣告「requeue 回 queued(lease NULL…)」——现码仅清 `lease_owner` 未清 `lease_expires_at`=注释半与 SQL 半不符，修法使注释成真；⑶ 影响面亲读=现行为零位移动：claim `:154` 领取时无条件覆写 `lease_expires_at=now()+…`（重领 job 租约戳即新·stale 值不外溢到领取后）、claim queued 臂 `:162` 与 cap 计数 `:172-177` 均不读 queued 行租约列、purge `:354` queued 臂按 `created_at` 口径（有意形）、enumerate `:365` 按 status 口径——不清的实害=**行态不变量破面**（「queued ⇒ lease 双列 NULL」被 sweep 臂单独违反·重领前窗口内 queued 行带旧租约戳，监控/取证/未来读者按「非 NULL lease_expires_at=租约在场」判读即误判）+reaper 语义面与 fence 臂对照可判别的收尾残留。**判别臂**（`reaper.proof.ts`）：`:41-42` jobRow 选列补 `lease_expires_at`；`:96` 断言扩形——`A('job 回 queued 且 lease 释放(NULL)', after1.status === 'queued' && after1.lease_owner === null)` → `A('job 回 queued 且 lease 双列释放(NULL)', after1.status === 'queued' && after1.lease_owner === null && after1.lease_expires_at === null)`。改前红论证=fixture `:36` 种 `lease_expires_at=now()-interval '5 minutes'`，旧码 sweep 臂不清理 → 重领前该列=past timestamptz 非 NULL → 断言 FAIL；改后绿。EXEC 改前红取证沿 queue-enqueue-bp 先例=stash `interview-jobs.ts` 单文件跑 `prove:reaper` ② 段 FAIL 后恢复复跑绿（双向亲证）。（EXEC 随批注记·双审 R4：本修=**租约列恒等化**——sweep 臂与 fence 臂 `:279` 两臂 `lease_owner`+`lease_expires_at` 双列同形清空；`next_attempt_at` 两臂分叉**维持原样不随修**=fence 臂 `:280` 写退避/sweep 臂不触，存量零害亲证=claim queued 臂 `:162` 谓词 `next_attempt_at IS NULL OR <= now()`（NULL=立即领·存量过去戳=已到期可领），sweep requeue 行两态均立即可领→修前修后行为逐字节同·退避语义差异系两臂设计内（fence=用户主动放弃重排·sweep=崩溃收割重领））

**件③（5C post P2-1·⑨ 族加 1 判别断言）**：`commerce-reconcile.proof.ts` ⑨ 族（`:280-294`）两臂：⑴ `:284` reserve 后 seed issued 题——`await pool.query("INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question) VALUES ($1,$2,'q-reclaim-closeout',1,0,'收口判别题')", [owner, iid]);`（status 缺省 `'issued'`·0021 `:12` CHECK 四值+`uq_interview_question_open` 单开题窗内恰一行）+fixture 就位断言（查回 `'issued'`）；⑵ `:286` 首拍后加 1 断言——`SELECT status FROM interview_question WHERE owner_user_id=$1 AND interview_id=$2` 返 `'cancelled'`（reclaim 拍前 seed issued 题→拍后 status='cancelled'·派单令原文逐字）。判别对象如实登记：reclaim 路径 cancel 收口联合判别钉=主臂 `finishAbandon`（`commerce.ts:490` 同事务 cancel）+兜底臂 `commerce-reconcile.ts:86`（soft-set 臂显式 cancel）两臂终态口径合一（trio 件① 双 wire）；对 trio 前码（finishAbandon 零触 interview_question+soft-set 臂零 cancel）本断言红（status 恒 `'issued'`）→对现 tip 码绿=防回退判别钉，兑现 P2-1「未立独立判别臂钉 reclaim 语义」销案。兜底臂独走全路径判别（须强置 `interview_abandon_conflict`）超出派单令断言形——登记 §8 归 EXEC 可选加强项不预支。

**件②（批5 盘点 Top2·#117 翻面行使载体登记）**：#117 载体 QUEUE-ENQUEUE-BP 六裁决已落卷落码（merge `be045fe5` 执行面主线在树亲证=advisory 收紧 `interview-jobs.ts:79`/预查豁免 `:80-83`/count≥3 具名错 `:84-91`/429 映射 interview.service.ts），批表 #117/#5 行翻面权归协调方（checklist `:3299` + queue-enqueue-bp §9 双登记在树）——本刀 **REQUEST 登记翻面笔待行使注记（底稿见 §8）·协调方 nail 时行使**；本刀零代行零预支·LEDGER/checklist/SOP 行本体零字节改（Ban 触 SSOT 行本体）。

## §1.3 否决（三候选在卷）

1. **#4 autovacuum 调优半不认领**：LEDGER `:87` `#4（半闭注记 2026-10-13：退避半已随 AG-C 落…autovacuum 调优半无刀认领·维持开放勿翻面）`——autovacuum 系 DB 运维参数调优面（非代码缺陷·涉生产库配置域），超本微刀量级与域，维持开放归协调方另裁（§1.3 拒认领·非拒存在）。
2. **迁移/存量回填否决**：对 queued 行带非 NULL 旧租约戳的存量行做一次性清理 UPDATE（迁移件）否决——本刀零迁移纪律；存量脏值对现行为零影响（§1-件① 三面亲读：claim 覆写/purge created_at 口径/enumerate status 口径），脏值随各 job 自然走完生命周期消化，回填零净收益纯迁移面开销。
3. **扩族否决**：quiz/diagnosis 两族 reaper（`quiz-jobs.ts:81` 镜像面）同形缺口如有的普查与修复否决出卷——批5 盘点 Top2 只点名 interview 面 #5；扩族超「队列收尾微刀」边界，如实登记归后继（不销案不预支）。附带拒改：purge queued 臂改 lease 口径（否决·created_at=入队年龄语义正确）；claim `:154` 覆写行为改（否决·现语义正确）。（EXEC 随批注记·双审 R1：同形**普查面**由「quiz/diagnosis 两族」放宽为「**quiz/diagnosis/report 等其余队列族**」——report 族同形缺口在树亲证两锚：`packages/db/src/report/report.ts:68` `requeueFailedReport` 置 `lease_owner=NULL…next_attempt_at=NULL` 未清 `lease_expires_at`、`:88` `sweepReports` requeue 臂 `SET status='queued', lease_owner=NULL, version=version+1` 同缺——本注记=登记非修码·修复仍归后继（本刀零扩族零触 report 族·否决面结论不变））

## §2 门矩阵（EXEC 期逐门亲跑·红停）

| 门 | 门名 | 判据 |
|----|------|------|
| G1 | prove:reaper | `pnpm -C apps/worker prove:reaper` EXIT=0 全绿；件① 判别臂改前红（stash 单文件取证 FAIL）→改后绿双向亲证（沿 queue-enqueue-bp 判别臂先例）；邻门 `prove:requeue-backoff` EXIT=0 回归（reaper 邻面零翻）；邻门 `prove:reaper-purge-wire` EXIT=0（双审 R5·零库假池形） |
| G2 | prove:commerce-reconcile | `pnpm -C apps/worker prove:commerce-reconcile` EXIT=0；⑨ 族既有 2 断言零翻+新增 2 臂（fixture 就位 issued+拍后 cancelled）全 PASS；①-⑧ 族回归零翻 |
| G3 | neg:interview | `pnpm -C apps/api neg:interview` EXIT=0 恰等基线（本刀零 api 触·对届时实跑值亲证） |
| G4 | typecheck | 8/8 包全绿（`pnpm -r typecheck`） |
| G5 | lint | 五值贴边恰等基线（root 5235/web 601/api 1421/worker 954/db 1042·零新警告） |
| G6 | docs:check | `node scripts/ai-docs/check-docs.mjs` EXIT=0 且 scanned ≤cap 2208（起草时点实测 2202·+本卷 1=2203 预期·余 5） |
| G7 | markers | 改动集五类标记词+行首冲突标记零命中 **0/0**（词面运行时组装防自指·`scripts/i6-239-gates.proof.mjs:151-163` 同源） |
| G8 | diff 面 | 恰 4 tracked：`interview-jobs.ts`（SQL 一片段）+`reaper.proof.ts`（选列+断言扩形）+`commerce-reconcile.proof.ts`（seed+2 断言）+本卷 `.md`；零新增文件（除本卷）·零 tsbuildinfo 入卷 |
| G9 | 迁移/SSOT | migrations 全目录字节零触；LEDGER/checklist/SOP/issues 行本体零字节改（翻面笔仅登记于本卷 §8） |

## §3 边界

触面=§1 三件恰 3 src/proof 文件+本卷 1 `.md`；quiz/diagnosis 族零触·api 零触·web 零触·迁移零触·消费侧语义零触（件①=补 fence 臂既有语义非新行为·件③=纯测试断言·件②=纯登记）；每件独立可停（单件法则）。

## §5 pins 十一值（照抄承登·EXEC/post 零翻）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null。

**Ban**：Ban 触 SSOT 行本体（LEDGER/checklist/SOP/issues 零字节改·翻面/归槽/销案宣称权归协调方）·Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · Ban 预支裁决（本刀零新裁决项·六裁决已落卷）·Ban 扩族（quiz/diagnosis）·Ban 迁移面 · ⛔push · ⛔merge 主线 · ⛔force push · ⛔pull --rebase。

## §7 起草自检回执（本席亲跑）

- markers：本卷改动集（本卷 1 `.md`）五类词面运行时组装直扫=0 命中+全树行首冲突标记零命中（回执随 commit 叙词）。
- docs:check：起草时点本席亲跑 EXIT=0，scanned 2202 ≤cap 2208（余 6）；落卷后预期 2203（+本卷 1）。
- 基线：base=origin/feat/mysql-schema-skeleton@`5c8e122c`（fetch 后 tip 同值亲证=**tip≥5c8e122c 等号成立**·origin/main `112e6d26` 为其祖先 `merge-base --is-ancestor` EXIT=0 亲证）；支线 `line/queue-closeout`·工作树 `meetwise-qco`（主仓 `git worktree add ../meetwise-qco -b line/queue-closeout 5c8e122c` 本席亲立·直接落 origin tip 零 reset）。
- est live=0（起草 docs-only·零容器零外呼零模型调用）·actualSpendCny=null。

## §8 翻面笔行使条款 + STOP

**#117+#5 批表行翻面笔（待行使·底稿）**：行使权归协调方·行使时点=nail 时（`<nail_hash>` 填实值）·行使位=LEDGER `:87` 5C 组行行内 append（「#5/#117/#7/#9 背压」词面后·沿 `:89` 5C-BEHAVIOR-TRIO 翻面笔行内 append 先例）·同拍行使面=checklist `:3299` 段 STILL OPEN 行翻面核条款+extreview SOP `:41` 行（归协调方同裁）。底稿逐字：

> 【QUEUE-CLOSEOUT nail `<nail_hash>` 落主线·#5 sweep 臂 `lease_expires_at=NULL` 补清（fence 臂 `:279` 对照恒等·判别臂改前红→改后绿）+5C-BEHAVIOR P2-1 reclaim 判别断言销案（⑨ 族 seed issued→拍后 cancelled）·#117 载体 QUEUE-ENQUEUE-BP 六裁决落卷执行面主线亲证（①案A②per-owner③N=3④429⑤预查形默认⑥收紧形采用）·post 双审会签 PASS×2·批表 #5/#117 两行翻面·本注记不计件】

EXEC 可选加强项（不预支·零必做）：兜底臂独走全路径判别臂（强置 `interview_abandon_conflict` fixture 验 `:86` soft-set 臂 cancel）——归 EXEC 现场裁量或后继刀。

**停止条件四类**：①单件法则=件①/件③ 机制独立·单件机制不满足可停单件余件继续；②卷级门红全卷停；③现场漂移（锚漂超 ±3 且结论受影响·LEDGER `:87` 翻面被他刀先行行使→本刀翻面笔底稿作废如实改登）停手上报；④STOP 状态翻面权=pre-exec 双审 BOTH PASS 后归协调方（EXEC 授权随派单令）。

**STOP · `executed:awaiting_post_prove_dual`**（三处锚定=①卷头标题行+②Status 行+③本节·前值 `draft:awaiting_pre_exec_dual` 史录=EXEC 落卷翻面·翻面授权=pre-exec 双审 BOTH PASS 后随协调方 EXEC 派单令）。开工三条款：①pre-exec 双审 BOTH PASS（两外席·Ban self-approve）②协调方 EXEC 授权③零裁决前置（本刀零新裁决项）。双审前零 EXEC 零落码·est live=0·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push。

## §9 EXEC 记录（2026-10-16·本席亲跑）

**EXEC 授权链**：pre-exec 双审会签 PASS×2（席1 `agent_c79afe9f`+席2 `agent_7355ae12`）→协调方授权 EXEC（派单令随双审修订清单 R1-R5 与执行序五步）。

**序1 并线**：fetch 亲证 `origin/feat/mysql-schema-skeleton`=`10799a3e`（派单下界「tip≥10799a3e」等号成立）→merge `0e022751` --no-ff（双亲 `0a4d6901`+`10799a3e`·ort 自动并零冲突·8 files +361/−9 全为 worker-hang-guard nail 波卷内容·⛔pull --rebase 未用·⛔force push 未用）。

**字段① 门矩阵全表（G1-G9·EXEC 时点亲跑）**：

| 门 | 判据与结果 | 结论 |
|---|---|---|
| G1 主 | `run-e2e-isolated.mjs reaper:prove:raw`——**改前红**（stash `interview-jobs.ts` 单文件取证）=恰 1 FAIL「job 回 queued 且 lease 双列释放(NULL)」·余 27 臂绿零回退·EXIT=1；**改后绿**=28 PASS/0 FAIL EXIT=0 | 绿（判别臂双向亲证） |
| G1 邻 requeue-backoff | **基线红单列**：改前改后失败面逐字节同形=EXIT=1 `interview_queue_saturated`@`requeue-backoff.proof.ts:126`·0 臂执行（净树 stash 对照跑同值同错亲证）——根因=#117 饱和闸（QUEUE-ENQUEUE-BP 执行面主线在树）并线后该 proof 对同 owner 预置 5 行 queued start（TID/DID/CAPID/STRID/GID·第 4 笔撞 N=3 闸）未随迁=**跨刀遗留基线红·与本刀零涉**（本刀 sweep 臂半行与入队闸零交集·reaper 邻面零翻按本刀零 delta 口径成立）·修复（proof fixture 随迁）归协调方裁后继·本刀零代修不越界 | 红=基线（非本刀引入·单列上报） |
| G1 邻 reaper-purge-wire（R5） | `pnpm -C apps/worker prove:reaper-purge-wire` **EXIT=0**（零库假池形·PASS 计 14） | 绿 |
| G2 | `run-e2e-isolated.mjs commerce-reconcile:prove:raw` **EXIT=0**=49 PASS/0 FAIL；⑨ 族既有 2 断言零翻+新增 4 断言（seed 就位 issued/reclaim 拍收口 cancelled/终态-conflict 兜底臂独走双钉）全 PASS；①-⑧ 族回归零翻 | 绿 |
| G3 | `run-e2e-isolated.mjs neg:interview` **EXIT=0**「✓ neg:interview: 107 条负路径用例全绿」恰等基线 | 绿 |
| G4 | `pnpm turbo typecheck --force` **EXIT=0**「Tasks: 8 successful, 8 total / Cached: 0 cached, 8 total」 | 绿 |
| G5 | `pnpm turbo lint --force` **EXIT=0**「Tasks: 12 successful, 12 total」五值恰等 pin：root **5235**/web **601**/api **1421**/worker **954**/db **1042**（+ai-runtime 628 等·零新警告） | 绿 |
| G6 | docs:check **EXIT=0** scanned **2204** ≤cap 2208（余 4·计数谱系=起草时点 2202+并线携 worker-hang-guard 卷 1+worker-hang-guard nail 波 SSOT 计 1·本卷 append +0 零新增文件） | 绿 |
| G7 | markers 改动集五类词+行首冲突标记零命中 **0/0**（词面运行时组装防自指） | 绿 |
| G8 | diff 面=恰 4 tracked（本卷 `.md`+`interview-jobs.ts`+`reaper.proof.ts`+`commerce-reconcile.proof.ts`）·`tsconfig.tsbuildinfo` 副产物 checkout 复位不计（api-harden R4 先例）·零新增文件·零迁移 | 绿 |
| G9 | migrations 全目录字节零触+LEDGER/checklist/SOP/issues 行本体零字节改（#5/#117 翻面笔仅存 §8 底稿+本节 R3 登记·归协调方 nail 时行使） | 绿 |

**字段② EXIT 原值**：G1 改前 EXIT=1（「FAIL  job 回 queued 且 lease 双列释放(NULL)」+「✗ 1 项失败」）→改后 EXIT=0（「✓ Reaper(心跳防误收 + 双边界 requeue/终结 + 终态事件 + 退款 + 僵尸守卫 + 已结算不误终态)全部通过」·PASS 计 28）；G2 EXIT=0（「✓ C1 对账兜底调度侧:孤儿预留回收+终态事件+结算入账+幂等+并发安全 全部通过」·PASS 计 49）；G3 EXIT=0（107 全绿行亲录）；G4 EXIT=0（Tasks 行亲录）；G5 EXIT=0（12 successful+五值 ✖ 计数逐包亲录）；G6 EXIT=0（「ai-docs check passed: 80 required files verified; public text policy scanned 2204 managed worktree files」）；G7 自面 0/0；G8 porcelain 四行亲录；G1 邻 requeue-backoff 双态均 EXIT=1 同错同点（基线红单列·非本刀引入）。

**字段③ 改前改后 PASS diff（判别链定稿）**：reaper 面=only-in-post=② 段「双列释放」臂 FAIL→PASS（stash 单文件双向亲证·非单 attempt 留证）；commerce-reconcile 面=only-in-post=⑨ 族 4 新断言 PASS·既有 45 断言恒等零回退。件③ 判别臂「改前红」如实记账=**论证红非实跑红**（红态在树不可达：现 tip 已含 5C-BEHAVIOR-TRIO cancel 接线·对 trio 前码 finishAbandon 零触 interview_question+soft-set 臂零 cancel→status 恒 `'issued'` 断言必红——沿 REQUEST §1-件③ 原文口径）；R2 子臂同口径（completed fixture 下 `:86` 兜底臂缺位则题恒 issued 必红=防回退钉）。

**字段④ diff numstat**：EXEC 修法面=4 tracked：本卷 `.md` **+51/−6**（R1/R4/R5 三 append+§9 append+STOP 三处翻面）+`packages/db/src/interview/interview-jobs.ts` **+1/−1**（sweep 臂 `lease_expires_at=NULL,` 一片段）+`apps/worker/test/reaper.proof.ts` **+2/−2**（jobRow 选列+断言扩形）+`apps/worker/test/commerce-reconcile.proof.ts` **+26/−0**（⑨ 族 seed+4 断言+终态-conflict 子臂·numstat 实测）；并线 merge `0e022751` 携入 8 files 全为 worker-hang-guard nail 波卷内容非本刀修法面；tsbuildinfo 副产物 checkout 复位不计。

**字段⑤ 重 pin 全表（并线后树 `0e022751` EXEC 时点）**：§0 十一锚——#1-#4 四码锚 blob **恒等零漂**（interview-jobs.ts `c69c03a3`/reaper.proof `0b9db078`/commerce-reconcile.ts `5ed1b0ed`/commerce-reconcile.proof `ac57bb51`·行数 367/171/140/300 恒等·`:317`/`:279`/`:96`/`:281-294` 挂点逐一对届树成立）；#7 SOP `eae68fe2`/#8 queue-enqueue-bp `b549dabf`/#9 5e-sweep-2 `28de5763`/#10 5c-trio `b4216cd9`/#11 neg proof `06f8e249` 五锚恒等；#5 LEDGER `33ea22d6`→`210e80a1`（644L→645L）+#6 checklist `bad5dd80`→`376fd5bc`（3360L→3371L）——漂移源=并线携 worker-hang-guard nail 波 SSOT append（非本刀触）·行锚 `:87`（5C 组行「#5/#117/#7/#9 背压」在册未翻）/`:89`（5C-BEHAVIOR-TRIO 翻面笔先例）/`:3299`（queue-enqueue-bp nail 段头）零漂·checklist `:3326`→`:3337` 移位 +11（5c-behavior-trio nail 段）——结论全数不变（§0.0 预勘「并线序自由先并则重 pin 非停」兑现）。

**字段⑥ 偏离清单**：①**seed 执行形勘正**（非语义偏离）：commerce-reconcile.proof 件③ seed INSERT 初稿沿 REQUEST 语句面裸 superuser 池直插→撞 0058/0059 投影写护栏（session principal 缺席→`interview_privacy_fenced` RAISE·G2 首跑红停·沿 fail-loud 未绕门）→沿 `scor-00-http-db.proof.ts:155` asPrincipal 先例改 **asPrincipal(owner) 包裹执行**（INSERT 语句文本逐字未动=DBHY-1 迁移真相「投影写护栏要求 session principal=owner」·护栏注记随码）；②R2 加强项落点=⑨ 族块内 append 终态-conflict 子臂实测 +10 行（派单「约 +8 行」近似值·断言双钉=interview 保持 completed+题 cancelled）；③G1 邻门 requeue-backoff 基线红（字段①单列·跨刀遗留·零代修）；④其余零偏离（件①/件③ 逐字落笔·G8 恰 4 tracked·G9 SSOT 零触·quiz/diagnosis/report 族零码触·消费侧语义零触·每件独立可停未触发）。

**字段⑦ pins 零翻声明**：§5 pins 十一值逐字零翻（haStatus=NOT_HA·releaseEvidence=false·claimProductionHA=false·gR45Closed=true·coveredCount=8·ms3EqualsR4Closed=false·PG-retained·公开 DELETE=503·g7SuiteGreen=false·r1Closed=false·脚注 actualSpendCny=null）；est live=0 兑现（隔离容器/零库假池/静态门·零模型外呼·零生产操作·零 secrets 读用·actualSpendCny=null）；`pnpm install --frozen-lockfile` 环境准备（worktree node_modules 缺席·沿 queue-enqueue-bp 先例）lockfile **零字节变**；⛔push 未犯·⛔force push 未犯·⛔pull --rebase 未犯。

**修订清单落点（双审 R1-R5 随 EXEC 落）**：
- **R1**（席2）→§1.3-3 append 注记已落：同形普查面放宽为「quiz/diagnosis/report 等其余队列族」（`report.ts:68` requeueFailedReport/`:88` sweepReports requeue 臂两锚在树亲证·登记非修码·本刀零扩族零触 report 族码面）。
- **R2**（席2·协调方裁决=行使加强项）→commerce-reconcile.proof ⑨ 族内补终态-conflict 子臂已落：seed `status='completed'` 终态 interview（INSERT 先于 reserve=0020 配对触发器 consumption NULL 放行）→主 CAS（`commerce.ts:529` WHERE IN created/waiting_user）0 行→`:539` 抛 `interview_abandon_conflict`→`commerce-reconcile.ts:79` 窄滤接住→soft-set no-op（completed 被排除）→`:86` 兜底臂独走 cancel·断言 cancelled+completed 零翻转双钉——**P2-1 销案升格为兜底臂独占钉**（该 fixture 下 cancel 唯一来源=`:86`·主臂 finishAbandon 不可达=独占判别）。
- **R3**（席2）→**EXEC 只登记不改批表**：#5/#117 批表行翻面笔归协调方 nail 时同拍行使（§8 底稿逐字在卷零改·LEDGER `:87`/checklist `:3299` 段/SOP `:41` 行本体零字节改·本卷零代行零预支）。
- **R4**（席2）→§1-件① append 注记已落：「租约列恒等化·next_attempt_at 分叉存量零害」（fence 臂 `:280` 写退避/sweep 臂不触·claim queued 臂 `:162` 谓词 `IS NULL OR <=now()` 两态均立即可领=修前修后逐字节同·两臂退避差异系设计内）。
- **R5**（席2）→§2-G1 加列邻门 `prove:reaper-purge-wire` EXIT=0 已落已跑（EXIT=0·PASS 计 14·零库假池形无需隔离靶）。

### §9-B STOP 翻面

三处权威 STOP（①卷头标题行+②Status 行+③§8 节）`draft:awaiting_pre_exec_dual`→**`executed:awaiting_post_prove_dual`**（§0-§8 叙事原文不洗·append+勘正注形·卷尾行不载值沿三处锚定制）——post-prove 双审归后继席（两独立外席·alone≠dual）·G1 邻门 requeue-backoff 基线红如实单列呈报待裁（跨刀遗留·非本刀引入）·⛔push ⛔merge 主线 ⛔force push。

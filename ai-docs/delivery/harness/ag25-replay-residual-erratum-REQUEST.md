# AG25-REPLAY-RESIDUAL-ERRATUM REQUEST（AG-25 残面勘误卷——genQuestion 重放非模型副作用届树逐项核定：检索外呼与进度帧两半已落+wasAsked 系读语义零副作用+写面键幂等或闸已闭·真残面为零·零码面·本卷仅登记核定证据·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草 2026-10-22 落卷·pre-exec 双审两独立外席待派→Dual PASS→协调方授权后始有 EXEC·本卷 EXEC 零落码动作·est live=0·Ban self-approve·alone≠dual·⛔push ⛔merge 主线·翻面权归协调方）。

**席位**：AG 能力复核台账下一刀起草席（派单标的 **AG-25 残面**=P3·编排运行时「genQuestion 重放非模型副作用重执行」之检索包/进度帧两半已落后的其余面·派单 brief 预授权：真残面为零时如实转勘误卷·沿 ag35 勘误先例形）。
**基线**：`origin/main` @ `d5b03ee6`（`git fetch origin` 亲证 tip=Merge pull request #117·分支 `line/ag25-replay-residual-draft`·工作树 `meetwise-ag25`·`git worktree add -b … origin/main` 本席亲立·干树）。
**立项出处（不自建 SSOT 行——issues-final AG-25 行翻面与 checklist 刀位注翻面权归协调方）**：①`ai-docs/delivery/ai-capability-review/issues-final.md` AG-25 总览 `:37`+详情 `:327-336`（P3·编排运行时·判词「genQuestion 重放时，节点内的非模型副作用（本地 ANN、web 或深检索外呼、进度事件、wasAsked 查询）会重新执行」·file:line 引 `adaptive-interview-service.ts:113-121,150-165,178-187` 系复核快照树旧值·届树漂移登记 §0.2-10·修法「检索结果按 attemptKey 缓存，或者拆成独立节点存进 state」两肢均系两半领地）；②邻刀已落对照（勿重做红线）：replay-retrieval-packet（main 系 `2b460443`）+replay-progress（main 系 `fd6ef5b1`/`f5b7eb2e`）+0209 回放优先（ag09-replay-first-REQUEST.md）+checkpoint-terminal-slim/graph-release-marker 各卷+邻卷 `replay-side-effect-REQUEST.md`；③形制沿 `ag35-legacy-api-erratum-REQUEST.md`（同席位零残面勘误先例形）。

## §0 现状锚（起草席亲读·base `d5b03ee6`·file:line/blob 逐条 Read/grep/git rev-parse/merge-base 实测·**EXEC 立项照届时 tip 全量重 pin——结论不变只更行号·定性翻案即停**）

### §0.0 防重三查 + 在飞交叠复核 + 转径定谳 + 旧支线复核

- `git worktree list` 建 **15 树**实测（本席 meetwise-ag25 唯一 ag25 树）；`git branch -a | grep ag25` 恰本席 `line/ag25-replay-residual-draft` 一条；`ls ai-docs/delivery/harness/ | grep -iE "ag-?25|replay-residual"` **EXIT=1——零同名刀卷**。
- `git log --all --oneline --grep="AG-25"` 恰 3 笔均系 AG-A nail 刀位翻面笔随文披露（「AG-25 ask+1 归后继」·载体 `execution-master-checklist.md:2462`）——**零在飞同题修复刀**；在飞码面各线与本卷触面（恰本卷 1 个 .md）结构性无碰。→ 防重停止条件未触发。
- **旧支线复核（派单线索⑤·亲证）**：`origin/line/replay-side-effect-draft` 顶三笔（`afef66a9`/`e83b40c7`/`e312eac5`）系检索包修复早期迭代，merge-base `112e6d26` 分叉、tip 对 origin/main **非祖先**；`comm` 亲证该支线在 ai-docs/delivery/harness/ 下**零支线独有文件**、其 `replay-side-effect-REQUEST.md` blob `1a2b8d23…` 与 main 恒等——内容全数经 main 系重植笔落卷=**旧壳非未并同题卷**，本卷照常自起草、无并卷义务。
- **承载笔祖先性申明（ag35 §9-rev 教训行使·逐笔 `git merge-base --is-ancestor <c> origin/main` 亲跑）**：检索包半 main 系=`2b460443`（docs 随笔 `7032860b`/`926246c8`）EXIT=0；进度半 main 系=`fd6ef5b1`+`f5b7eb2e`（同题同 stat 双笔均 EXIT=0·docs 随笔 `2aea14e0`）；**派单所引 `6f29338c`/`f49982ae` 均 EXIT=1 非 main 祖先**——系旧支线原始笔（重植前同内容笔），本卷一律登记 main 系承载笔。
- **转径定谳**：§0.2 逐项核定真残面为零——按派单 brief 预授权**不弃案转勘误卷**（ag35 先例形）·非造码非弃案。

### §0.1 blob 锚表（`git rev-parse HEAD:<path>` 亲算·全 40 hex @`d5b03ee6`）

| 文件 | blob | 关键行锚 |
|---|---|---|
| `packages/ai-graphs/src/adaptive-interview/nodes/generate-question.ts` | `69f268295b2fde44a66412e40ccc7500d579e72a` | 两段式图侧落点：`:33-41` 身份四项全同·`:43-47` 包形判别·`:111-117` replayIdentity+replayHit·`:119-123` 检索相位只返包·`:125-128` 命中交包零再检索·`:129-132` 未声明脚本接缝仍一次调用 |
| `packages/ai-graphs/src/adaptive-interview/state.ts` | `da02225700f1e4ee971e4df70328d0eb87d2e0ca` | `:207` `retrievalReplay?: true`·`:212` `retrieveReplayPacket?`·`:309` `retrievalPacket` 覆盖通道 `reducer (_,b)=>b` 缺省 null |
| `apps/worker/src/adaptive-interview-service.ts` | `71c9a502a8bdb5a34cdf4b91529aeef1c1267216` | `:437` `retrievalReplay: true`·`:438-456` 检索相位·`:548-568` `runWithoutProgress` 包在场跳两层·`:573-575` 包在场零 loadRetrieval·`:610` recentAskedStems 读·`:341`/`:660`/`:829` recordUsageSoft 三面·`:754`/`:779` wasAsked 读两位·`:409` recordRagRetrievalAction·`:423-427`/`:462-469` deficit holder·`:536-542` roll 键 |
| `apps/worker/src/generation-progress.ts` | `931f49c1b81bc8495990dc7183c6679838ba3869` | `:95` `:first-token`/`:133` `:progress:${ordinal}`/`:146` `:started` 事件键族·`:130` 同 ordinal ON CONFLICT 不添行·`:23` 2s 窗·`:29` ≤6 行 |
| `apps/worker/src/memory-service.ts` | `d599835abff95e926d0d7b78644b3fc089ed2f3f` | `:14-16` wasAsked（→episodeSeen 只读）·`:22-28` recordAskedQuestions（`:23` 批内 uniq 去重） |
| `packages/db/src/memory/memory-store.ts` | `066e0b5645bee0528c7c7440a12f8582616e9a1c` | `:13-19` insertMemory（randomUUID 无 ON CONFLICT·结构注记载体）·`:39-46` episodeSeen SELECT 只读·`:56-84` recentAskedStems SELECT 只读 |
| `packages/db/src/model-op/question-usage-ledger.ts` | `94f170a7ea9b08e025e148cf652271240a9e5476` | `:42-46` 注释自证「重放=false」·`:64` `ON CONFLICT (owner_user_id,invocation_key) DO NOTHING` |
| `packages/db/src/interview/interview-question.ts` | `08b00a9ead0aca3f149b41d2a9087e3fa59c3133` | `:59` `ON CONFLICT(owner,interview,question_id) DO NOTHING`·`:70-78` identity 冲突闸 |
| `packages/db/src/interview/interview-event.ts` | `880a1dcb7b4751e061b28207df7699573b712931` | `:23-25` event_key 先查后插·同键返回原 seq=幂等 |
| `packages/db/src/interview/interview-graph-lease.ts` | `bb5bf73acbc208d35a11a24efd945942b09f7265` | `:31-38` 零行臂终态拒·`:48-54` 在行臂终态拒（failed/completed/abandoned 三态） |
| `apps/worker/src/adaptive-lifecycle.ts` | `db96efec972f6a2f903a256303c6591afbb57ee4` | `:326-334`/`:540-544`/`:566-571` question_ready event_key·`:682-685` 删终态检查点→recordAskedQuestions 单次执行位 |
| `packages/ai-runtime/src/metrics.ts` | `277d0e770ca06ee8c7dae432a8fa0a2c8d4e3f49` | `:143-147` recordRagRetrievalAction=进程内 Prometheus 计数零持久化 |
| `apps/worker/test/adaptive-resume.proof.ts` | `f3bc101c74d23aad326d306a4a362e7d739fb4e8` | `:209` ask+1 断言（首成语义·邻卷 §1.4 明文保留）·`:374-378` 续跑本地/深研零重调断言 |
| `apps/worker/src/interview-consumer.ts` | `df2ec0def327db56c58ddddb319ac43ed1b6f71d` | `:472` 三路检索每次领取各 1 上限 |
| `apps/worker/package.json` | `8507d220c37ba605ff1909802008ac9fc11d627c` | `:60` `prove:adaptive-resume`（涉面既有 prove 名亲证·非本卷门） |
| `ai-docs/delivery/ai-capability-review/issues-final.md` | `7bf0f03d00db44959af7c1983e7926d25d67e514` | AG-25 总览 `:37`+详情 `:327-336`（只读蓝本·零触） |
| `ai-docs/delivery/execution-master-checklist.md` | `c7a0dcc0e18b085a613f5ce38db5a8fa3f42d80a` | `:2462` STILL OPEN「AG-25 ask+1 归后继」注（§0.2-9 裁定载体·零触） |
| `ai-docs/delivery/harness/replay-side-effect-REQUEST.md` | `1a2b8d237817bbed367a984a529cb2690f81064c` | 两半邻卷（其 §1.3 留置判词=§0.2-3 载体·零触） |
| `scripts/ai-docs/public-text-policy.mjs` | `f3b183ee0491f7c854b8548fe1e8953eded1f8d5` | `:135` `MAX_FILES = 2_338`（cap 现值） |

### §0.2 逐项核定（真残面判定·**全零**·判词四类面+写路径逐项·证据=§0.1 行锚）

1. **检索外呼半（本地 ANN/web/深检索）——已在（检索包半收口）**：main 系 `2b460443` 落两段式——state 覆盖通道（state.ts `:309`）+接缝声明（service `:437`）+检索相位（`:438-456`）+身份命中交包零再检索（generate-question.ts `:111-128`）+生成相位包在场零 `loadRetrieval`（service `:573-575`）；proof 断言续跑本地/深研新增=0（proof `:374-378`）；同 claim 三路上限原值（consumer `:472`）。**判词「本地 ANN、web 或深检索外呼会重新执行」按码面不成立**。
2. **进度帧半——已在（进度半收口）**：main 系 `fd6ef5b1`/`f5b7eb2e`——包在场跳 `withTokenStream`+`withGenerationProgress` 两包装（service `:548-568`·`:548` 注释自述跳层缘由）+事件键族幂等（generation-progress.ts `:95`/`:133`/`:146`·同 ordinal 不添行 `:130`）。**判词「进度事件会重新执行」按码面不成立**。
3. **wasAsked 查询——读语义零残面**：两调用位（service `:754`/`:779`）均只读 SELECT（memory-store.ts `:39-46`），零写入零外呼零用户可见重复；重放重复执行=一次索引查询。邻卷 §1.3 明文留置（「那个窄窗续跑时，已问查询可以再做一次；本地检索和深检索不可以」）——留置判词届树成立，本卷不翻案。
4. **读伴随面——零残面**：`recentAskedStems`（service `:610`→memory-store.ts `:56-84` SELECT 只读）同上。
5. **归集行写——已幂等**：`recordUsageSoft`（`:341`/`:660`/`:829`）→ `recordUsage` PK `(owner_user_id,invocation_key)` ON CONFLICT DO NOTHING（question-usage-ledger.ts `:64`·`:42-46` 注释自证「重放=false」）；重放时 invoke 同键缓存回放零二次派发、归集键=idempotencyKey 同键→零双行。
6. **进程内载体——设计内非持久副作用**：deficit holder/roll 计数（`:423-427`/`:462-469`/`:536-542`）进程内闭包，跨进程经 state.seed 通道恢复；`recordRagRetrievalAction`（`:409`→metrics.ts `:143-147`）进程内计数零持久化，且两段式后仅检索相位进入一次。观测注记级零残面。
7. **题面登记（episode 写）——位置面外+终态闸已闭**：`recordAskedQuestions` 唯一调用位=lifecycle 收尾 `:684`，位于终态事务提交与 `deleteCommittedTerminalCheckpoints`（`:682`）之后——genQuestion 重放窗口不经过；重复登记理论面被 acquire 终态拒绝双臂（lease `:31-38`/`:48-54`）封闭。结构注记（如实）：`insertMemory` 本体 randomUUID 无 ON CONFLICT（memory-store.ts `:13-19`）——其防双写由终态闸承载，非键幂等。
8. **题目行+题目就绪事件——已幂等**：`interview_question` ON CONFLICT+identity 闸（interview-question.ts `:59`/`:70-78`）；`question_ready` event_key 幂等（interview-event.ts `:23-25`）；均在节点外投影事务内（lifecycle `:326-334`/`:540-544`/`:566-571`）。
9. **ask+1 披露面——非重复派发·随两半收口**：checklist `:2462`「AG-25 ask+1（续跑 genQuestion 重入检索/进度帧副作用重放·本刀只披露）归后继刀」早于两半落卷：其「重入检索/进度帧」主体已由件1/件2 收口；残余 ask+1=seam 入口抛错窗（首程未派发即崩）续跑一次模型调用=首成非重放（proof `:209` 断言 `askBefore1+1` 邻卷 §1.4 明文保留），已派发窗由 invoke 同键缓存回放兜底零二次派发。**裁定：ask+1 系设计内首成语义·非重复副作用**。
10. **漂移注记（注记级·非停止条件）**：台账 file:line 引值系复核快照树（`:113-121,150-165,178-187` 现树已演两段式落点）；checklist `:2462` 注早于两半；docs:check 基线届测 **2335** 非派单口径 2334（45f7ec4f→d5b03ee6 间 11 笔 +4 文件·本席双树亲测）——cap `2338` 不变·余量 §2 照实。

## §1 修法（勘误登记·**零码面**·恰 1 新增 .md=本卷）

- **登记动作=本卷自身**：AG-25 残面核定证据（两半 main 系承载笔/逐项现值/幂等性判定/ask+1 裁定）已登记于 §0.0+§0.1+§0.2·EXEC 无落码动作·零测试触·零 SSOT 触·零迁移。
- **EXEC 立项义务仅两项**：①照届时 tip 重 pin §0.1 blob/行号（漂移如实改锚·结论不变只更行号·**定性翻案即停**——两半承载笔被回退或任一写面幂等性失效则本卷失效转重勘）；②照常走 pre-exec 双审。零落码·零 prove 跑（无码面可证）。
- **翻面底稿（行使权归协调方·仅为底稿不自行落账）**：issues-final AG-25 行可按「检索外呼半=2b460443·进度帧半=fd6ef5b1/f5b7eb2e·wasAsked 查询=读语义零残面·写面键幂等/终态闸（证据=本卷 §0.2）」如实翻面；checklist `:2462` STILL OPEN 的 AG-25 ask+1 段随行一并处置；LEDGER 刀位图同步翻面均归协调方。

### §1.2 触面矩阵

恰 **1 tracked**=本卷 `ai-docs/delivery/harness/ag25-replay-residual-erratum-REQUEST.md`——零历史迁移·零 db/app/worker/web 产品触·零 env 闸·零 package.json/脚本注册触。

### §1.3 否决（五条）

- **甲=为 wasAsked 窄窗再拆节点/新表/判重缓存**：邻卷 §1.3 明文不行使；读语义零副作用，硬造治理面=过度工程·Ban。
- **乙=给 insertMemory/recordAskedQuestions 加 ON CONFLICT/唯一约束**：非判词面（位置面外+终态闸已闭 §0.2-7）+需新迁移违历史迁移零字节纪律·Ban。
- **丙=把 wasAsked/recentAskedStems 结果写进检索包或新 checkpoint 通道**：读面零成本，持久化读结果=零收益+旧 checkpoint 缺省兼容复杂度·Ban。
- **丁=重做/复检两半实现（检索包/进度键）或改其留置判词**：邻刀领地零越面·Ban。
- **戊=直改 issues-final/checklist/LEDGER 翻 AG-25 行与 `:2462` 注**：翻面权归协调方·本刀零 SSOT 触·Ban。

## §2 门矩阵（docs-only 三门·起草树亲跑·EXEC 届值如实录）

- 门① **`node scripts/ai-docs/check-docs.mjs`** EXIT=0·起草树基线实测 scanned **2335**（§0.2-10 漂移注记）·本卷落卷后 **2336** ≤ cap **2338**（`public-text-policy.mjs:135` 亲证）·余 2。
- 门② **markers 改动集 0 命中**：五类标记词（四词运行时组装防自指·沿 i6-239 同源制）+行首冲突标记·对本卷改动集亲跑 **0/0**。
- 门③ **`git diff --stat` 恰 1 tracked**（本卷 .md·EXEC 届时复跑断言不变——多出即越面即停）。
- **prove 名亲证与豁免申明（如实）**：涉面两半既有 prove=`prove:adaptive-resume`（`apps/worker/package.json:60` 亲证·非本卷门）；零码面故 `turbo typecheck --force`/`turbo lint` 不适用（零 TS 触面·帽精确相等门不列）；零模型调用零新增供应商 env 故出站两门豁免；零迁移故无迁移唯一性门。

## §3 裁决项（两件·两案并陈处标推荐）

1. **AG-25 行翻面口径**：**推荐=整行翻面**（判词四类面全闭·证据本卷 §0.2）；协裁保守则按「两半=邻刀独立收口·wasAsked/读面=读语义零残面·写面=既有键幂等面」注记形翻面（ag34/ag35 勘误登记同形）——两案均由协调方行使·本卷不落账。
2. **checklist `:2462` STILL OPEN「AG-25 ask+1 归后继」段处置**：**推荐=随 AG-25 行翻面一并注销**（本卷 §0.2-9 裁定底稿）；协裁保守则保留原注+append「ag25 勘误卷已核」指认——均归协调方。

## §5 Ban 面

历史迁移 0001-0209 零字节·零新迁移；全部码面文件零字节触（§1.3 甲乙丙丁否决面）；SSOT 四卷+issues-final+checklist 零触（戊）；⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

## §8 停止条件与 STOP

- 停止四类（现场漂移超注记级/机制不满足/越界需要/验收红不可修）——起草期均未触发（漂移注记级亲证 §0.2-10）；「残面为零」系派单 brief 预授权的勘误转径（ag35 先例形）·非弃案非停止条件。
- **本卷 STOP=`draft:awaiting_pre_exec_dual`**（三处同值：Status 头+本节+卷尾注）·pre-exec 双审两独立外席待派→Dual PASS→协调方授权后始有 EXEC（本卷 EXEC 仅重 pin+零落码）·翻面权归协调方·alone≠dual·Ban self-approve。
- **est live=0**（起草全轮只读+1 doc·零模型外呼零 DNS 零 Key·`actualSpendCny=null`）·⛔push。

卷尾注：STOP=`draft:awaiting_pre_exec_dual` 三处同值（Status 头/§8/本注）·起草 2026-10-22 落卷·基线 `origin/main` @ `d5b03ee6`·AG-25 残面逐项核定全零（检索外呼半=2b460443·进度帧半=fd6ef5b1/f5b7eb2e 均系 main 祖先亲证·派单所引 6f29338c/f49982ae 非祖先已如实更正登记·wasAsked/读面=读语义零副作用·写面=键幂等或终态闸·ask+1=首成语义·证据 §0.2 逐项）·旧支线 line/replay-side-effect-draft 零独有内容=旧壳复核登记 §0.0·本卷勘误登记零码面·恰 1 新增 .md·est live=0·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push·翻面权归协调方·alone≠dual·Ban self-approve。

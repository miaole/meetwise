# AG35-LEGACY-API-ERRATUM REQUEST（AG-35 残面勘误卷——遗留 API 导出与契约面三项台账面全部已被邻刀顺带收口·零码面·本卷仅登记移除证据·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草 2026-10-22 落卷·pre-exec 双审两独立外席待派→Dual PASS→协调方授权后始有 EXEC·本卷 EXEC 零落码动作·est live=0·Ban self-approve·alone≠dual·⛔push ⛔merge 主线·翻面权归协调方）。

**席位**：AG 能力复核台账下一刀起草席（派单标的 **AG-35**=P3 编排运行时残面「遗留 API 导出与契约面」三项·LEDGER 届面 done 40/half 2/open 7 内 AG-35 残面=本席标的·派单 brief 预授权转径：真余面为零时改出勘误卷·沿 ag34 勘误先例形）。
**基线**：`origin/main` @ `98033ca8`（分支 `line/graph-legacy-api-draft`·工作树 `meetwise-ag35`·`git fetch origin` 亲证 behind-2 后 `git reset --hard origin/main` 归齐·`git status` 干树）。
**立项出处（不自建 SSOT 行——issues-final AG-35 行翻面与 LEDGER 刀位图翻面权归协调方）**：①`ai-docs/delivery/ai-capability-review/issues-final.md` AG-35 总览 `:47`+详情 `:438-446`（P3·编排运行时·判词三半「buildMockInterviewGraph 会把原始答案写进 state / buildMockInterviewRunner 会调用 cp.setup()（DDL）/ db.acquireLease/releaseLease 按 thread_id 更新、不带 graph_name」·修法「删除，或改为 retired 时直接抛错」·关联 #170）；②邻刀对照（勿重做红线）：raw-answer-lease（main 落点 `d4d29ee8`·其起草面 `05cb02d5` 非祖先）+5E 簇B（`5c449d46`·#170 注/码两半）+graph-lease 族生产租约入口（interview/interview-graph-lease.ts）。

## §0 现状锚（起草席亲读·base `98033ca8`·file:line/blob 逐条 Read/grep/git rev-parse 实测·**EXEC 立项照届时 tip 全量重 pin——结论不变只更行号·定性翻案即停**）

### 0.0 防重三查 + 在飞交叠复核 + 转径定谳

- `git worktree list` 建 **11 树**实测（本席 meetwise-ag35 唯一 ag35 树·余为主仓/wt-102/wt-106/ag29/ag34/cap2338/iss249/iss73/nextfix/wssport）。
- `git branch -a | grep -iE "ag-?35|legacy-api"` 恰本席 `line/graph-legacy-api-draft` 一条；`ls ai-docs/delivery/harness/ | grep -iE "ag-?35|legacy"` **EXIT=1——零同名刀卷**。
- `git log --all --oneline --grep="AG-35"` **0 笔**——零在飞同题刀；在飞码面线（ag29=65a9c40f 零越基/ag34=41247781 触 worker 派发面/iss249/iss73/wssport）与本卷触面（恰本卷 1 个 .md）**零交集**（本卷零码面·与任何在飞码刀结构性无碰）。→ 防重停止条件未触发。
- 基线亲证：`git fetch origin` 后 `origin/main`=`98033ca8`（Merge pull request #114）；两收口 commit 祖先性均以 `git merge-base --is-ancestor <c> origin/main` 亲证 EXIT=0（§0.2 逐项）。
- **转径定谳**：§0.2 三项逐项亲证台账面全部已被邻刀收口——按派单 brief 预授权「真余面为零不硬造·改出勘误卷：§1 修法=零码面·仅登记移除证据」**不弃案转勘误卷**（ag34 勘误先例形）·非造码非弃案。

### 0.1 blob 锚表（`git rev-parse HEAD:<path>` 亲算·全 40 hex @`98033ca8`·台账三项逐项现值）

| 文件 | blob | 关键行锚 |
|---|---|---|
| `packages/ai-graphs/src/mock-interview.ts` | `86fd4d227444ac6eb659d020cf680f033e4f99f3` | **项① 现值**：`:15` 仍导出 `buildMockInterviewGraph(checkpointer, questions)`；`:20` `interrupt({ question });`（返回值不取用·注释自述「返回值不进入状态」）；**:21 `return { questions: [question], answers: ['answer_omitted'], idx: i + 1 };`——作答位=字面常量·原文字节零进状态** |
| `apps/worker/src/main.ts` | `03bca62015076011d666daba5d710c1d3f1ac0b2` | **项② 现值**：**:141-142 恰两行登记注释「【#170 码半·2026-10-12】buildMockInterviewRunner 已删：全仓调用方零命中（rg 亲证·仅定义无消费）」「生产消费循环走 interview-consumer/interview-service 装配」——函数定义全仓零命中（grep 亲证·唯一命中即此注释）**；产品源 `.setup()` 运行时调用零命中（`:123`/`:482-483` 恰两处注释·`:482-483` 负向声明「Calling PostgresSaver.setup() here would reintroduce runtime DDL」在位=编辑者防线） |
| `packages/db/src/index.ts` | `c81850862a0fc5f10f21c27f7701cdd414b44792` | **项③ 现值**：`:7` 原语④头注「只按线程的租约入口已关闭：调用即拒绝，不执行更新」；**:61-67 `acquireLease` 在任何 `c.query` 前抛 `AppError('thread_only_lease_refused')`（`:66`）·`:69-75` `releaseLease` 同构（`:74`）——台账锚 `:55-64` 的两条只按 thread_id 的 UPDATE 已不存在** |
| `packages/ai-runtime/test/runtime-kernel.proof.ts` | `612110c9e88f4a59f5887417328e9a387cafb64a` | 项③ 证明：`:66-84` 四断言抛 `thread_only_lease_refused`+同一 `ai_graph_run` 行调用前后 `lease_owner`/`lease_expires_at`/`version` 三列不变 |
| `apps/worker/test/voice.proof.ts` | `6db38c18771e9b5c4b4330b2db52ec8d871c5ad2` | 项① 证明：`:40`/`:46` 断言图状态 `answers` 每项 `=== 'answer_omitted'` |
| `apps/worker/test/resume.int.ts` | `9e647f02ada4d38106aa4e22c41274d4c376506c` | 项① 证明：`:37`/`:40`/`:50` 断言续跑前后每项 `answer_omitted` |
| `packages/db/src/interview/interview-graph-lease.ts` | `bb5bf73acbc208d35a11a24efd945942b09f7265` | 项③ 生产入口：`:28`/`:40`/`:79`/`:90`/`:100` 全部查询谓词带 `graph_name=$1`（graph 作用域租约=「不带 graph_name」面在生产入口不成立） |
| `packages/ai-graphs/src/index.ts` | `0c6a29857ad0422ed06cbf5371dd0373bbdcf814` | `:11` `export { buildMockInterviewGraph } from './mock-interview.ts';`——导出保留（raw-answer-lease 卷 §1 明文不删图）·零触 |
| `ai-docs/delivery/ai-capability-review/issues-final.md` | `7bf0f03d00db44959af7c1983e7926d25d67e514` | AG-35 总览 `:47`+详情 `:438-446`（只读蓝本·零触） |
| `scripts/ai-docs/public-text-policy.mjs` | `f3b183ee0491f7c854b8548fe1e8953eded1f8d5` | `:135` `MAX_FILES = 2_338`（docs:check cap 现值） |

### 0.2 三项逐项定谳（真余面判定·**全零**·收口证据亲证）

1. **项①「原始答案写进 state」——已在（raw-answer-lease 刀收口）**：收口 commit=**`d4d29ee8`**（「模拟面试不再保存原始作答，只按线程抢占的租约改为直接拒绝」·`git merge-base --is-ancestor d4d29ee8 origin/main` EXIT=0 亲证；起草面 `05cb02d5` 同题非 main 祖先·系落 main 重植笔）；现树 `:21` 固定标记 `answer_omitted`（§0.1 项① 行）+`voice.proof.ts`/`resume.int.ts` 断言在位——**判词半按码面不成立**。
2. **项②「runner 调 cp.setup()（DDL）」——已在（5E 簇B 收口）**：收口 commit=**`5c449d46`**（commit body 自述「#170 …码半：buildMockInterviewRunner 无调用方删除」·`--is-ancestor` EXIT=0 亲证）；被删原体 `git show 5c449d46^` 亲证恰 `await cp.setup();` 一行（本判词半载体随函数同灭）；现树函数零命中+`.setup()` 产品源零调用+`:482-483` 负向声明在位——**判词半按码面不成立**。
3. **项③「租约按 thread_id 不带 graph_name」——已在（同被 `d4d29ee8` 收口）**：现树两函数查询前拒抛 `thread_only_lease_refused`（§0.1 项③ 行）+proof 四断言三列不变+生产入口 `interview-graph-lease.ts` 全查询带 `graph_name=$1`——**判词半按码面不成立**。
4. **修法两肢对应收口归属（如实登记·非本刀收口）**：台账修法「删除，或改为 retired 时直接抛错」——肢「删除」由 `5c449d46` 行使（runner）；肢「直接抛错」由 `d4d29ee8` 行使（租约两函数）；项① 走 raw-answer-lease 卷 §1 明文固定标记形。**台账行未翻·翻面权归协调方·本卷不复重做**。
5. **行号漂移登记（注记级）**：台账引 `mock-interview.ts:15-21`（区间恒等·`:21` 内容已换标记）；`main.ts:137-141`（现值 `:141-142` 注释·漂系邻刀插行）；`db/src/index.ts:55-64`（现值 `:61-75`·漂系文件头 re-export 增行）——判词零变·结论面不变。

## §1 修法（勘误登记·**零码面**·恰 1 新增 .md=本卷）

- **登记动作=本卷自身**：三项移除证据（收口 commit/亲证命令/blob/行锚/断言位）已登记于 §0.1+§0.2·EXEC 无落码动作·零测试触·零 SSOT 触·零迁移。
- **EXEC 立项义务仅两项**：①照届时 tip 重 pin §0.1 blob/行号（漂移如实改锚·结论不变只更行号·**定性翻案即停**——任一项证据被回退则本卷失效转重勘）；②照常走 pre-exec 双审。零落码·零 prove 跑（无码面可证）。
- **翻面底稿（行使权归协调方·仅为底稿不自行落账）**：issues-final AG-35 行可按「三项残面均已被邻刀顺带收口（#170 码半=5c449d46·写 state 半+租约拒抛半=d4d29ee8·移除证据=本卷 §0.2）」如实翻面；LEDGER 刀位图与 execution-master-checklist 同步翻面均归协调方。

### §1.2 触面矩阵

恰 **1 tracked**=本卷 `ai-docs/delivery/harness/ag35-legacy-api-erratum-REQUEST.md`——零历史迁移·零 db/app/worker/web 产品触·零 env 闸·零 package.json/脚本注册触。

### §1.3 否决（四条）

- **甲=为「凑码面」复活 runner 或重写只按 thread_id 的租约 UPDATE**：收口语义系两邻刀已行使的台账修法肢·复活即回退已收口面并重引运行时 DDL/跨图篡改风险·Ban。
- **乙=删除 `buildMockInterviewGraph` 导出或 `voice.proof.ts`/`resume.int.ts`**：raw-answer-lease 卷 §1 明文「不删图·不改 index.ts 导出」——mock 图系 interrupt 持久化/凭 threadId 续会话的活证明载体·两测试系 `answer_omitted` 断言载体·删除属越面·Ban。
- **丙=直改 issues-final/LEDGER/execution-master-checklist 翻 AG-35 行**：翻面权归协调方（管线行明文）·本刀零 SSOT 触·Ban。
- **丁=顺手清理 `main.ts:141-142`/`:482-483` 登记与负向声明注释**：系 #170 活文档与运行时 DDL 负向声明（防后来者重引 `cp.setup()` 的编辑者防线）·非误导·零收益·Ban。

## §2 门矩阵（docs-only 两门·起草树亲跑·EXEC 届值如实录）

- 门① **`node scripts/ai-docs/check-docs.mjs`** EXIT=0·起草树实测 **scanned 2331 ≤ cap 2338**（`public-text-policy.mjs:135` 亲证）；本卷落卷后 +1=**2332**·余 6。
- 门② **markers 改动集 0 命中**：五类标记词（四词运行时组装防自指·沿 `scripts/i6-239-gates.proof.mjs:151-163` 同源制）+行首冲突标记·对本卷改动集亲跑 **0/0**。
- 门③ **`git diff --stat` 恰 1 tracked**（本卷 .md·零码面触·EXEC 届时复跑断言不变——多出即越面即停）。
- **豁免申明（如实）**：零码面故 `pnpm turbo typecheck --force`/`pnpm turbo lint` 不适用（零 TS 触面·帽精确相等门不列）；零模型调用零新增供应商 env 故出站两门 `pnpm provider-egress:inventory`/`pnpm provider-egress:prove` 豁免；零迁移故无迁移唯一性门。

## §3 裁决项（两件·两案并陈处标推荐）

1. **AG-35 行翻面口径**：**推荐=整行翻面**（三项面全闭·证据本卷 §0.2）；协裁保守则按「三项均系邻刀顺带收口·非独立刀收口」注记形翻面（ag34 勘误登记同形·LEDGER `:704`④ 先例）——两案均由协调方行使·本卷不落账。
2. **本卷归属**：**推荐=勘误卷随 pre-exec 双审后即结**（EXEC 仅重 pin 零落码）；协裁要求实物复证则加跑三门 prove（`prove:voice`/`prove:resume`/ai-runtime `prove`·均系邻刀已落断言的复跑·非新码）——须双审定·默认不加跑。

## §5 Ban 面

历史迁移 0001-0209 零字节·零新迁移；mock-interview.ts/db index.ts/main.ts/两测试/interview-graph-lease.ts 零字节触（§1.3 甲乙丁否决面）；SSOT 四卷+issues-final 零触（丙）；⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

## §8 停止条件与 STOP

- 停止四类（现场漂移超注记级/机制不满足/越界需要/验收红不可修）——起草期均未触发；「标的已被邻刀收口」系派单 brief 预授权的勘误转径（ag34 先例形）·非弃案非停止条件。
- **本卷 STOP=`draft:awaiting_pre_exec_dual`**（三处同值：Status 头+本节+卷尾注）·pre-exec 双审两独立外席待派→Dual PASS→协调方授权后始有 EXEC（本卷 EXEC 仅重 pin+零落码）·翻面权归协调方·alone≠dual·Ban self-approve。
- **est live=0**（起草全轮只读+1 doc·零模型外呼零 DNS 零 Key·`actualSpendCny=null`）·⛔push。

卷尾注：STOP=`draft:awaiting_pre_exec_dual` 三处同值（Status 头/§8/本注）·起草 2026-10-22 落卷·基线 `origin/main` @ `98033ca8`·AG-35 三项台账面逐项定谳全已被邻刀顺带收口（#170 码半=5c449d46·写 state 半+租约拒抛半=d4d29ee8·证据 §0.2 逐项）·本卷勘误登记零码面·恰 1 新增 .md·est live=0·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push·翻面权归协调方·alone≠dual·Ban self-approve。（rev 2026-10-22 增记：项②收口笔勘误修订见 §9-rev——收口登记更正为主线重植笔 `e9a1a035`·`5c449d46` 系 5e-cleanup-sweep 线原始笔·对 origin/main 非祖先 EXIT=1。）

## §9-rev rev 修订注记（pre-exec 双审席1 P1 一件·项②收口笔勘误·2026-10-22 回炉）

- **FAIL 事实**：pre-exec 双审席1 FAIL P1 一件——项② 收口 commit 登记「`5c449d46`·`--is-ancestor` EXIT=0 亲证」不实：`5c449d46` 对 `origin/main` **非祖先**；main 系真收口笔=重植 commit **`e9a1a035`**。落卷笔 `ae39408b` 之 §0.0「两收口 commit 祖先性均亲证 EXIT=0」系不实声明——本节更正·**上文零字洗·以下列落点为准**。
- **三笔祖先性届树亲证（`git merge-base --is-ancestor <c> origin/main` 三笔各跑一遍·届树 `origin/main` 亲证=`98033ca8`·EXIT 原值入卷）**：`d4d29ee8` → **EXIT=0**；`e9a1a035` → **EXIT=0**；`5c449d46` → **EXIT=1（非 main 祖先）**。
- **重植笔等价亲证（届树重跑）**：`e9a1a035` 与 `5c449d46` 同作者（miaole）同秒（2026-10-12T16:17:05+08:00）同主旨去 issue 号（原始笔 subject 带 #170/#39/#210/#60/#65/#74·重植笔去号）；双方父版 `apps/worker/src/main.ts` 均恰 `:146 await cp.setup();` 一行（grep 各恰一命中亲证）；对 `apps/worker/src/main.ts` 的删改两笔 patch-id 相同（`c70eeff7d496aba933d3b1512c9f751376e913e8`·diff-of-diffs IDENTICAL）=内容等价；`5c449d46` 系 5e-cleanup-sweep 线原始笔（`git branch -a --contains` 亲证 `origin/line/5e-cleanup-sweep` 含之·`e9a1a035` 为 origin/main 所含）。
- **四处同步修正落点**：
  - **§0.0**（基线亲证行）：祖先性声明更正为如实——`d4d29ee8` EXIT=0·`e9a1a035` EXIT=0·`5c449d46` EXIT=1 非 main 祖先；「两收口 commit 祖先性均亲证 EXIT=0」作废。
  - **§0.2-②**：项② 收口 commit 改登记 **`e9a1a035`**（main 系重植笔·等价证据见本节）；原「`5c449d46`·EXIT=0 亲证」句作废（实为 EXIT=1）；「被删原体 `git show 5c449d46^` 恰 `await cp.setup();` 一行」的载体事实不变（双方父版同此·重植笔父版同此）。
  - **§1 翻面底稿**：「#170 码半=5c449d46」更正为「#170 码半=e9a1a035（main 系重植笔·5e-cleanup-sweep 线原始笔 5c449d46 内容等价）」。
  - **卷尾注**：「#170 码半=5c449d46」同口径更正为 e9a1a035（该行已行内 append rev 2026-10-22 增记指向本节）。
- **落卷 commit message 同误知悉**：落卷笔 `ae39408b` message 携带同一错误 hash（`5c449d46`）系落卷后不可改——本节知悉即可·不另动作。
- **门①③ 数值不变**：本节系纯 append 文面·改动集仍恰本卷 1 个 .md（零码面触）——rev 树复跑 `node scripts/ai-docs/check-docs.mjs` EXIT=0·scanned **2332** ≤ cap 2338 不变；markers 五类标记词+行首冲突标记对本卷改动集 **0 命中** 不变；`git diff --stat` 恰 1 tracked 不变。
- **STOP 与复审**：本卷 STOP 维持 **`draft:awaiting_pre_exec_dual`** 三处同值（Status 头/§8/卷尾注）不变；**rev 落卷后重派 pre-exec 双审两独立外席第二轮·窄域=本节落点复验·alone≠dual·Ban self-approve**。

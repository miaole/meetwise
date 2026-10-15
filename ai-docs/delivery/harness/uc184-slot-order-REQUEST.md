# UC184-SLOT-ORDER REQUEST — #184 SSE 领槽后置于取数序修复刀（429 拒连路径零取数副作用·恰 3 控制器同形调序+1 proof 断言翻面·uc184-slot-order 战役·起草落卷即停）

**Status**: **`closed`**（2026-10-15 卷主翻面·协调方授权两卷收口·沿 ag-cost5 先例·一行依据=#184 行已 SSOT 翻面=LEDGER :87 5C 行 `#184 ✅`+刀位图「UC184-SLOT-ORDER」行 `✅ nail 收官`（授权链含 post 双审会签 PASS·nail merge --no-ff 并主线 @`af9ab780`+SSOT `42527046` 对 HEAD is-ancestor 亲证）——原 `executed:awaiting_post_prove_dual` 系滞后登记 · est live=0 · Ban self-approve · alone≠dual）

**席位**：uc184-slot-order REQUEST 起草席（诊断+起草双责·协调方派·批表盘点席在案靶点=`interview.controller.ts:259` initial 取数仍先于 `:263` acquireSlot·#184 真未闭且原样·5C 批余项）。
**基线**：`feat/mysql-schema-skeleton` @ `7bc8ffaa`（ha6-repin nail 收官 SSOT commit·本地与 origin tip 恒等亲证·docs:check 2124≤cap 2128 本树亲跑 EXIT=0）· 分支 `line/uc184-slot-order`（建前 `git branch --list "line/uc184*"` 零命中·本起草席 `git worktree add ../meetwise-u184 -b line/uc184-slot-order feat/mysql-schema-skeleton` 亲立·HEAD 落 `7bc8ffaa` 亲证）· 工作树 `meetwise-u184`（仓根同级）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①批表盘点席派单 brief（2026-10-14·UC184-SLOT-ORDER 取数序修复刀·靶点 interview:259/:263 原样在案）；②LEDGER 行语义=`ai-docs/delivery/harness/product-campaign-LEDGER.md:87`（5C 可靠性 52 件开放清单内 `/#184/` 在册·同族标注「🆕 分 4 子刀（OBS/QUEUE/SSE-API/API-HARDEN）」·#139 多实例面标注留 5C-SSE-API 子刀——本刀仅清偿 #184 序缺陷·#139 零触）；③原始 issues-master.md 系仓外卷·本树不可达（find 亲证零命中）——语义对表以 LEDGER 行+派单 brief 为准（brief 预授权口径）；④形制范本 `ai-docs/delivery/harness/negbend-fix-REQUEST.md`（§0-§8+trailer 形制·STOP 三条款+四类停止条件+pins 十一值沿承）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/Read/git hash-object 实测 @`7bc8ffaa`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

> **EXEC 立项重 pin 回执（2026-10-15·EXEC 席亲测 @并线后 tip `32cd5e70`）**：①并线 `feat/mysql-schema-skeleton` @`109e3eb1`（origin tip=brief「bb1627d8+」实测兑现·`bb1627d8` 系 line/ci-red-clear 支线 tip 非本链祖先·brief 「≈」口径成立）`--no-ff` 零冲突并线→`32cd5e70`；②§0.1 五锚 blob `git hash-object` 复算逐值全等（`1426c175`/`e77480dd`/`75a57e21`/`da936220`+零触面三件）→**行号零漂零改锚·结论零变**；③迁移链复数=202 头 `0202` 恒等；④交叠重扫见 §0.0 附表。

### 0.0 防重双对表

- `git worktree list` 建后 11 树实测（主仓+本 u184 树等）——无第二 uc184 同名树；`git branch --list "line/uc184*"` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | rg -i "uc184|slot-order"` 建前零命中→落卷后唯一同名卷=本卷。
- **在飞交叠复核规则（EXEC 立项日必做）**：本刀产品触面=3 SSE 控制器+1 proof 文件（§1-修法四件）。起草席已对全部 `line/*` 分支逐树扫描四文件（`git log -1 -- <file>`+`merge-base --is-ancestor` 双查）：唯一非祖先命中=`line/b2-uc025-wiring` 对 `interview.controller.ts`（file-tip `6cbaf04e` 2026-10-03）——**判定=历史残枝非在飞**（该分支全 tip `6e5252ad` 2026-10-03 早于基线 11 日；其文件版 blob `18004851` 缺 sse-pump 接线 import=旧形已被主线取代·`git diff HEAD line/b2-uc025-wiring -- <file>` 亲证纯落后零前瞻·沿 negbend-fix §0.0 b110 残枝同判例）。EXEC 日对届时在飞分支重扫·任一分支顶对四文件存在基线后新增提交→触停止条件「现场漂移」停手上报。
- **EXEC 立项日重扫附表（2026-10-15·EXEC 席亲测）**：①`git worktree list` 实测 **14 树**（起草时 11 树→新增 meetwise-crc/ple/rcp2/stf2 等邻战役树·零第二 uc184 同名树·`git branch --list "line/uc184*"` 恰 1 命中=本席分支）；②非祖先命中两条·**均判历史残枝非在飞·零停止条件触发**：
  - `line/b2-uc025-wiring`（承起草判例）：tip `6e5252ad` 2026-10-03·对 `interview.controller.ts` file-tip `6cbaf04e` 2026-10-03——纯落后零前瞻（同上判例原文）。
  - `line/sse-notify-push`（新命中）：tip `49535514` 2026-10-08 16:51(+0800)·对三控制器最后触点 `a963ef19` 2026-10-08 16:30(+0800)——**早于基线 `7bc8ffaa`（2026-10-15 11:18+0800）7 日·零基线后新增提交**；其文件版（`6beb8136`/`205958e0`/`53f2456b`）为 API-HARDEN 前旧形（acquireSlot 非 async 签名+缺 `getSseNotify` 接线 import·`git diff HEAD 49535514` 亲证纯落后零前瞻）——沿 b2-uc025-wiring 残枝同判例。

### 0.1 blob 锚表（`git hash-object` 亲算 @`7bc8ffaa`）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `apps/api/src/modules/interview/interview.controller.ts` | `1426c175`（279 行·末次产品变更=`8676777c` s4b 并线） | **`:257-:278` events 控制器**：`:259` `const initial = await this.interviews.events(...)`（取数①）→`:260` null→404 →`:262` `const slotKey = \`sse:${req.principal}\`` →`:263` `if (!(await this.rl.acquireSlot(slotKey, 5)))` 429（**领槽②后置于取数①——本刀修法点**）→`:264` try→`:267-:276` pumpSseEvents（`:272` fetchMore/`:275` deltaSource）→`:277` `finally { await this.rl.releaseSlot(slotKey); }`；`:261` F5 注释（每条 SSE 长期占一 DB 池周期查询·不封顶打满连接池饿死鉴权）随 slotKey 块搬移 |
| `apps/api/src/modules/quiz/quiz.controller.ts` | `e77480dd`（71 行·末次=`f31d56d1` API-HARDEN） | **`:53-:70` events 同形**：`:55` 取数→`:56` null→404→`:57` slotKey（尾注 F5）→`:58` acquireSlot→`:69` finally release（与 interview 逐形同构·同缺陷） |
| `apps/api/src/modules/diagnosis/diagnosis.controller.ts` | `75a57e21`（69 行·末次=`f31d56d1`） | **`:51-:68` events 同形**：`:53` 取数→`:54` null→404→`:55` slotKey（尾注 F5）→`:56` acquireSlot→`:67` finally release（同上） |
| `apps/api/test/sse-principal-slot.proof.ts` | `da936220`（205 行·末次=`f0fedfb2`） | **HC-GAP-007 三控制器共享 `sse:${principal}` cap=5 HTTP 劫持 proof**：`:38-:52` countingDb（`asPrincipal` 计数 stub·query 恒 `{rowCount:1,rows:[]}`）→`:100-:107` wrapEvents（`lastEventId===undefined` 计入 catchUp 桶）→`:137-:148` firstFive=3 interview+2 quiz 占满→`:150-:163` 三路第六连 429+槽仍 5→**:164 `A('overflow 各付 1 次 catch-up（counting stub；不入环 ≠ 零调用）', (catchUp.get('userA') ?? 0) === 8)`（现行序锁断言·5 占槽+3 拒连各付 1=8——修后翻 5）**→`:171-:172` 注释自证 defer（「Slot is acquired after the first events()/asPrincipal (documented; this slice does not move it). Rejected requests do one catch-up asPrincipal then 429」）→`:173-:176` 拒连不入 2s 轮询（`polled === 5`·修后零改） |
| `apps/api/src/platform/sse-pump.ts` | `c95f7c5d`（178 行·零触面） | `:8-:9` 泵契约注释（「并发槽 acquire/429 与 404 前置留在控制器(时序在 hijack 之前,语义原值)」——修后仍准确·四者仍全在控制器 pre-hijack）；`:23-:25` D5 时序纪律（每轮先注册 waiter 再取数·notify lossy hint 漏醒由兜底收）；`:139-:140` waiter 先注册再重放 catch-up；`:165-:168` tail `fetchMore(lastSeq)` 按 `seq>` 重放 |
| `apps/api/src/platform/rate-limit.service.ts` | `fce544ff`（200 行·零触面） | `:149-:151` 并发槽=「同时占用数」资源保护非安全边界；`:153-:157` acquireSlot 契约（**成功后必须 release（放 finally/close）**·PG 不可达 fail-open）；`:158-:181` 实现（共享 PG lease 单语句原子占/进程内 Map）·`:184-` releaseSlot 幂等不抛 |
| `apps/api/src/modules/interview/interview.service.ts` | `42cf316e`（887 行·零触面） | **`:879-:886` events 取数体**：`:880` parseLastEventId→`:881` `asPrincipal(principal, ...)`（RLS：`SET LOCAL ROLE app_role`+`set_config('app.principal_user')`·`packages/db/src/principal.ts:991-:1001` 亲读·异常 rethrow 不吞）→`:882` `guardInterviewPrivacy(c, id)`（`:403-:405` 委托 `guardInterviewPrivacyTx` `:64-:75`：owner SELECT rowCount=0→**throw** HttpException 404 `not_found_or_forbidden`+隐私围栏 GONE）→`:883` `SELECT seq,kind,payload FROM interview_event WHERE stream_key=$1 AND seq>$2 ORDER BY seq`。`:878` 注释称「返回 null 表示越权」与实态 throw 不符（漂移登记 §0.2-2） |
| `apps/api/src/modules/quiz/quiz.service.ts` | `98edbeb2`（140 行·零触面） | `:131-:139` events：`:134-:135` owner SELECT rowCount=0→**return null**（:130 注释同称返 null）→`:136` interview_event 同形 SELECT（null 判空在 quiz 控制器 `:56` 为活码） |
| `apps/api/src/modules/diagnosis/diagnosis.service.ts` | `2c7c882e`（113 行·零触面） | `:104-` events 同 quiz 形（null 判空活码） |
| `apps/worker/test/interview.proof.ts` | —（零触面） | interview:prove 门载体（`root package.json:271` interview:prove→run-e2e-isolated `:680`/`:2349`→`pnpm -C apps/worker prove:interview`·SSOT 题面 57 臂） |

### 0.2 派单简报漂移登记（结论零变·如实改锚/扩裁）

1. **简报靶面仅点名 interview:259/:263——诊断实测同形缺口遍三控制器**（quiz `:55-:58`/diagnosis `:53-:56` 亲证同构）且共享桶锁断言跨三控制器计数（proof `:164` ==8 的 8=3 interview+2 quiz 占槽+3 第六连拒连各付 1）——只修 interview 则 `:164` 只能改 7、quiz/diagnosis 拒连取数窗原样残留=#184 机制不闭。修法面据此裁决扩为三控制器同形调序（§1.3 候选乙淘汰承卷）。靶面修正≠简报方向推翻（interview 三控制器中唯一 deltaSource 接线面·panic 面最大·本刀仍以其为首要验收面）。
2. **interview service `:878` 注释「返回 null 表示越权/不存在」与实态不符**：`guardInterviewPrivacyTx` 系 throw 形（`42cf316e` `:64-:75` 亲证·`principal.ts:1000` rethrow 亲证）——interview 控制器 `:260` null 判空为防御性死码；quiz/diagnosis service 系 return null 形（`:135` 亲证）其控制器判空为活码。三处判空修法中**原样搬移零改语义**（丢 throw/吞异常均 Ban——见 §3-3）。
3. **proof `:171-:172` 注释自证现行序系 HC-GAP-007 有意 defer**（"this slice does not move it"）——非回归非漂移·本刀即该 defer 的清偿刀·`da936220` `:164`/`:171-:172` 为现行序的书面前科。
4. **简报「越权读窗」定性修正**：数据越权已被双层兜住（RLS `asPrincipal`+owner/隐私守卫逐次亲证§1.2）——#184 真缺口=资源准入序（拒连路径仍付全额取数副作用）·修法裁决不受影响·定性表述随 §1.2。

### 0.3 迁移号登记（预期零迁移）

- 主线链顶实测：`ls packages/db/migrations | wc -l`=**202**·头 `0202_interview_event_kind_score_card_written.sql`（与本卷基线 `7bc8ffaa` 题面「migrate 链 202 头 0202」恒等）。
- 本刀修法=纯控制器内语句搬移+proof 断言翻面（§1-修法件①②）·**预期零迁移零 DDL**。协调规则：EXEC 期若实测产生非预期迁移需求→**停（越界需要类）上报**·认领号=对届时主线链顶亲数+在飞分支题面复核后取最小未占号顺延·Ban 抢号 Ban 私占。

## §1 红事实（机制链·全部亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 现行序亲证（行为缺陷钉死）

- **interview**（`1426c175` `:257-:278`）：`GET :id/events` 入口先 `await this.interviews.events(...)`（`:259`·RLS 事务+守卫+event SELECT 全池周期）·判空 404（`:260`）·**之后**才 `acquireSlot('sse:'+principal, 5)`（`:263`）·429 拒连。领槽晚于取数·槽上限对 initial 取数零约束。
- **quiz/diagnosis 同形**（`e77480dd` `:55-:58`/`75a57e21` `:53-:56`）：同一 `sse:${principal}` 键同一 cap=5·同一先取数后领槽序。
- **书面前科**：proof `da936220` `:171-:172` 注释明文「Slot is acquired after the first events()/asPrincipal (documented; this slice does not move it). Rejected requests do one catch-up asPrincipal then 429」+`:164` 断言把「拒连各付 1 次 catch-up（==8）」锁为现行契约——缺陷系已知 defer·非回归。
- **泵面契约不受影响**：sse-pump `c95f7c5d` `:8-:9` 明文 acquire/429/404 前置**留在控制器**（时序在 hijack 之前）——泵只消费非空 initial（`:51`/`:140`）·序调整全程不触泵。

### 1.2 越权读窗定性（读什么/谁兜着/副作用多大）

- **读的什么**：每次 initial 取数=`asPrincipal` 全池周期（pool.connect+BEGIN+`SET LOCAL ROLE app_role`+`set_config`+业务查询+COMMIT/ROLLBACK+release·`principal.ts:991-:1001` 逐行亲证）内含①owner 守卫 SELECT（interview `:882`）②`interview_event` 按 `stream_key`+`seq>` 的 SELECT（`:883`）。
- **数据越权已被兜住（亲证非推定）**：读全程 RLS（`app_role`+principal 绑定）+owner 守卫（interview throw 形 `:64-:75`·quiz/diagnosis null 形）——跨主体不可读·404 壳对外。**定性=资源准入序缺陷（越额读窗）·非授权缺陷**：429 拒连请求在领槽失败前已付全额取数副作用=未过准入闸先消耗被闸资源。
- **副作用计量**：F5 注释自证防护意图（`1426c175` `:261`「每条 SSE 长期占一 DB 池周期查询;不封顶 → 开几十条即打满连接池饿死鉴权」）——现行序使**第 6..N 条拒连各付 1 个池周期取数**（proof `:164` ==8 机证）·洪水打开 N 条并发时取数侧无上限（槽 cap=5 只封「入环流」不封「拒连取数」）·F5 意图在取数面被绕过。零持久写副作用（纯读）·故本刀=序修复·非数据修复。
- **对照面**：`rate-limit.service.ts:153-:157` 契约自证槽语义=「资源保护非安全边界」+「成功后必须 release」——先行领槽对 404/throw 路径的租约义务由 finally 承接（§1-修法件① 形制）·租期=取数毫秒级 ≪10min 封顶（pump `:105` deadline）。

### 1.3 #184 语义对表+修法候选淘汰登记（防 EXEC 期重开）

- **#184 语义**（LEDGER `:87` 在册+brief）：SSE 取数序缺陷·「真未闭且原样」——本刀清偿即翻面前提。修法方向裁决（协调方 brief 预授权）：**调序=先 acquireSlot 后取数·须证 slot 失败路径零取数副作用+取数结果在 slot 成功后仍新鲜**。
- **新鲜度证（裁决第二半·亲证）**：①initial 取数系 `seq > lastId` 重放——领槽（进程内 Map 微秒级/PG lease 单语句毫秒级）与取数间提交的事件必入结果集；②取数→pump 邻接序修法前后不变（同在 try 内紧邻）·泵内 D5 纪律（waiter 先注册再重放 `:139-:140`+lossy notify 漏醒兜底收 `:14-:18`+tail `seq>` 重放 `:165-:168`）覆盖取数后事件·**零新丢事件窗**；③泵契约（`:8-:9`）修后仍满足（四者仍全在控制器 pre-hijack）。
- **候选甲（采纳）=三控制器同形调序+proof 断言翻面（§1-修法件①②）**：一次把共享桶机制的三处物化面全部翻正·`:164` 8→5 即「拒连零取数」的机器锁定。
- **候选乙（否决·Ban）=只修 interview**：`:164` 只能改 7（quiz/diagnosis 拒连各仍付 1）·#184 机制面残留两处·共享桶 proof 语义劈叉——否决。
- **候选丙（否决·Ban）=泵内统一领槽（acquire 搬入 pumpSseEvents）**：泵契约明文前置留在控制器（`c95f7c5d` `:8-:9`「语义原值」）·404 判空/终态集/fetchMore 注入面随入泵=触零触面+爆炸半径扩全 pump 消费者（含 TOKSTREAM delta 臂）——否决。
- **候选丁（否决·Ban）=改断言凑绿不动码**：把 `:164` 维持 8 或放宽容差=为绿改断言弱化（negbend-fix 候选丙否决沿承）——`:164` 翻 5 的正当性**仅**来自件① 行为变更·码不动而动断言即 Ban。

## §1-修法（序修复刀·预期恰 4 文件=3 产品+1 proof·零迁移零 service/pump/rate-limit 触）

- **件①（interview 控制器·首要验收面）**：`apps/api/src/modules/interview/interview.controller.ts` events（现 `:257-:278`）——把 `:261-:263` 的 F5 注释+`slotKey` 声明+`acquireSlot` 守卫块**整体上移至 `:259` 取数行之前**；`:259` 取数+`:260` 判空+`:264-:276` pump 全体纳入现 `:264` try 块（try 上移至取数前）·`finally { await this.rl.releaseSlot(slotKey); }` 原样收口（`rate-limit.service.ts:153-:157`「成功后必须 release」契约·404 判空 return/守卫 throw 两退出路径均经 finally 恰一次释放）；F5 注释尾增一行 UC184 注（「UC184:领槽先于取数——429 拒连路径零取数副作用·404/throw 路径经 finally 释放」）。**404 判空与守卫 throw 语义原样搬移零改（§0.2-2·丢 throw/吞异常/改响应码均 Ban）**。**diff 预期=块搬移±UC184 注释行·零逻辑增删**。
- **件②（quiz/diagnosis 控制器·同形搬移）**：`quiz.controller.ts` `:53-:70`/`diagnosis.controller.ts` `:53-:56` 起的 events——与件① 完全同形的 acquireSlot 块上移+try 纳入取数与判空+finally 收口+UC184 注（quiz `:57` 尾注 F5 随块搬移·diagnosis `:55` 同）。三文件除注释与注入服务名（interviews/quizzes/diagnoses）外**逐字同构**。
- **件③（proof 断言翻面·新契约锁定·非为绿改断言）**：`apps/api/test/sse-principal-slot.proof.ts`（`da936220`）恰三 hunk：**hunk-A** `:164` 期望值 `=== 8`→`=== 5`·标签改「溢出拒连零 catch-up（UC184 领槽先于取数·拒连不付取数副作用）」；**hunk-B** `:171-:172` 注释翻面（「Slot is acquired BEFORE the first events() (UC184): rejected requests pay zero catch-up then 429; they must not start a 2s loop」）；**hunk-C** `:96-:97` 注释「overflow catch-up +2 is not racy」残留语同步翻面（溢出已零付·计数不再依赖该余量）。`:149`/`:163`/`:173-:176` 三断言（槽计数=5/拒连不占槽/拒连不入轮询）修后语义不变**零触**。
- **件④（收据）**：`ai-docs/delivery/receipts/uc184-slot-order/00-exec.md`——七字段（门矩阵全表+EXIT 原值+改前改后 sse-slot 计数观测+diff numstat+重 pin 全表+偏离清单+pins 零翻声明）。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵·数字口径以实跑实测为准·题面值熔断另注）

1. **sse-slot（本刀机制门·改后必绿）**：`pnpm -C apps/api prove:sse-slot` EXIT=0·`:164` 断言实测 **5**（**改前必做 run 恰一次不计 prove**：改前树实跑 sse-slot 取 `:164` 实测 **8** PASS 计数观测入收据——改前 8/改后 5 对照=序翻面的机器实证·零 retry 冲销纪律不变）。
2. **interview:prove 57 不回退**：`pnpm interview:prove` EXIT=0·臂总数题面 **57**（熔断=0 容差：实测≠57 即触停止条件「现场漂移」·如实记实测值）。
3. **neg:all 六段全绿**：`pnpm neg:all` EXIT=0·总臂题面 **687**（auth 90+commerce 90+resume 91+interview 102+bend 179+input 135·bend 179 随 ha6-repin 已翻基线·熔断：总≠687 停上報）·interview 段 102 内 `/events` 404/401 臂（`neg-interview.proof.ts:507-:511`）不翻码=件① 判空/throw 搬移零改语义的邻面承载；邻五套件 PASS 名单 diff=∅（diff 非空即停·如实登记归因）。
4. **SSE 邻面三门不回退**：`pnpm -C apps/api prove:sse-push-notify` EXIT=0（题面 35 臂）+`pnpm -C apps/api prove:s4b-delta-arm` EXIT=0（题面 20 臂）+`pnpm -C apps/api prove:uc010-sse-resume` EXIT=0（臂题面值以实跑实测为准·零弱化）。
5. **migrate:prove**：`pnpm migrate:prove` EXIT=0·链头实测=**0202**（届时链顶顺延如实记）。
6. **migration uniqueness**：`node scripts/check-migration-version-uniqueness.mjs`→`files=202 violations=0`（files 对届时链顶亲数·violations 恒 0）。
7. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached 口径沿 SSOT 门矩阵）。
8. **lint 五值恰等**：`pnpm turbo lint` 12 任务全绿 EXIT=0·五贴线预算**恰等零超支**：web `601≤601`+root `5235≤5235`+api `1421≤1421`+worker `954≤954`+ai-runtime `628≤628`（五值本树 package.json 亲证·任一值新增超支或第三贴面出现即停）。
9. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·≤cap **2128**（`public-text-policy.mjs:70` MAX_FILES=2128 亲证·本树现值 2124 亲跑·本卷落卷后预期 2125·**>2128 红停上报**）。
10. **markers 五类零命中**：本刀改动集（1 .md 本卷+3 控制器 .ts+1 proof .ts+收据目录）五类标记词 grep 零命中（词面不复抄卷内防自匹配·命令与回执入收据·沿 negbend-fix §2-10 同口径）。
11. **diff 面机检**：`git diff --numstat <base>` 恰 **4** tracked 路径=3 控制器 .ts（件①②）+1 proof .ts（件③）·另本卷 .md+收据目录 untracked——多任何 tracked 路径即停（越界需要类）。
12. **卫生**：`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录·`actualSpendCny=null`·零模型外呼（neg/proof 面全离线·est live=0）。

## §3 范围外（边界清单·越界即 FAIL）

1. **service 层零触**：interview/quiz/diagnosis 三 service 的 events 方法与守卫链（`42cf316e` `:879-:886`/`:64-:75`·`98edbeb2` `:131-:139`·`2c7c882e` `:104-`）blob 前后全等——#184 定性=准入序非授权（§1.2）·RLS/守卫/判空语义原样搬移零改（§0.2-2）。
2. **泵与限流机制零触**：`sse-pump.ts`（`c95f7c5d`——`:8-:9` 契约修后仍准确）·`rate-limit.service.ts`（`fce544ff`）·0189 `gateway_slot_lease_*`/0143 触发器——API-HARDEN nail 已闭机制面·本刀纯调用侧调序（候选丙否决承卷）。
3. **同簇扩面零触**：TOKSTREAM delta 臂接线面（`:274-:275` 原样随块搬移零改语义）·resume-parse 槽（`resume.service.ts:51`）·#139 多实例 SSE 面·通知健康门/终态集合/心跳语义——皆零改（同形缺口若 EXEC 期被发现→如实登记升级·Ban 就地顺手修）。
4. **共享 SSOT 零改**：backlog/checklist/LEDGER/north-star 只读引用——#184 行翻面权归协调方 nail。
5. **零迁移零 DDL**（§0.3）·零 CI/wrapper/runner 改·零依赖升级。

## §4 依赖

**①上游已满足**：API-HARDEN nail（`809cd46e`·0189 槽单语句原子占+releaseSlot 幂等）+ha6-repin nail（`b21fe709`→`7bc8ffaa`·门矩阵基线与本卷题面值载体）皆在基线链。**②无同文件并发**：§0.0 在飞复核亲证（唯一命中 b2-uc025-wiring 判历史残枝）·EXEC 立项日重扫必做。**③迁移号**：§0.3 预期零。**④下游**：#184 行翻面与 nail 排序归协调方；同族 5C-SSE-API 余件（#139 等）另刀零涉。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（件③ 改前 run+prove run 恰各 1·红不重跑冲销）；Ban 翻 pins（§5 十一值+`actualSpendCny=null` 脚注·零翻转）；Ban 为绿改断言（§1.3 候选丁承卷——`:164` 翻 5 的唯一正当性=件①② 行为变更随行·码不动动断言/放宽容差/回改 8 均 Ban）；Ban 触 service 守卫层/泵/限流机制/0143/0189（§3-1/3-2·候选丙否决沿承）；Ban 丢 throw/吞异常/改 404/429 响应码与壳体（§1-修法件① 原样搬移条款）；Ban 同簇扩面（§3-3·delta 臂/resume-parse 槽/#139 零触）；Ban 迁移 Ban DDL（§0.3 预期零·需则停上报走认领规则）；Ban 改共享 SSOT（§3-4）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因门矩阵外新红（邻面若现新红→如实登记升级·Ban 借机修）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载·零生产操作·零 secrets·零消耗（neg/sse proof 面全离线·counting stub/负测库口径·interview:prove 系既有回归门常跑项·EXEC 期 prove 亦零模型外呼·本卷 §2-12 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·五类词不复抄卷内防自匹配——沿 negbend-fix §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.2 定性与 §1.3 裁决结论与 §5 Ban/pins 与 §1-修法件①②③ 四文件面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做·§0.2 简报漂移复核）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且 §1.2 结论受疑（如三控制器 events 序已被动过/acquireSlot 契约变更/proof `:164` 前提结构漂移（firstFive 并发形状改）/§0.0 在飞分支对四文件有基线后新增提交/门 2 臂总数≠57·门 3 总臂≠687）→停·重 pin 回炉。
- **机制不满足**：件③ 改后 sse-slot run `:164` 实测≠5（拒连仍付 catch-up=序未翻成）或 429 臂/404 臂翻码（neg:interview `:507-:511` 非 404/401）→根因诊断被证伪→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。**归因注（pre-exec 席1 P2 附）**：若 neg 404 臂红·先核 12min 残留 lease 归因——共享 PG lease 模式（`rate-limit.service.ts:40-:41` `slotLeaseMs=12min`=SSE 10min 封顶+2min 缓冲）下前轮崩溃残留占用未到期可呈假性占用/拒绝红·残留到期即被下次 acquire 原子接管（`:21`）·归因先行 Ban 直改码。（EXEC 实测：三臂 404/404/401 全绿·本注未触发）
- **越界需要**：修法诉求超出 §1-修法四文件面（需触 service 守卫/泵/限流机制/迁移/TOKSTREAM 面）→停·另刀或协调方裁决（§1.3 候选乙/丙否决沿承·Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻 proof 新红/lint 贴面新增超支/docs:check>2128）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 EXEC 记录（2026-10-15·EXEC 席·pre-exec 双审会签 PASS（席1 agent_d4e4f7b9+席2 agent_6e6e1701）+协调方 EXEC 授权后开工·STOP=`executed:awaiting_post_prove_dual`）

**立项并线**：`git fetch` 后 `feat/mysql-schema-skeleton` 本地=origin=`109e3eb1`（brief「origin tip≈bb1627d8+」实测兑现：`bb1627d8` 系 line/ci-red-clear 支线 tip 非本链祖先·109e3eb1 含 perfload-env-fix nail cap 2128→2136 续作+batchflip 并线）→`git merge --no-ff` 并线 **`32cd5e70` 零冲突**（并集解惯例零启用·⛔pull --rebase 未用）·并线对四文件零触（`git diff b4712353 HEAD -- <四文件>` 空·EXIT=0）。`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改。

**改前机证（恰一次 run·不计 prove）**：`pnpm -C apps/api prove:sse-slot` EXIT=0·18 臂全 PASS·`:164` 现行标签「overflow 各付 1 次 catch-up」PASS=**现行序锁实测 8**（5 占槽+3 拒连各付 1）。

**改形落点（件①②③·恰 4 tracked 文件·diff numstat 机检）**：
| 文件 | numstat | 落点 |
|---|---|---|
| `apps/api/src/modules/interview/interview.controller.ts` | +3/−2 | `:259-:263` 取数序翻面：F5 注释+UC184 注+slotKey+acquireSlot 块整体上移至取数前·取数+判空 404+pump 全体纳入 try·finally releaseSlot 原样收口（404 return/守卫 throw 两退出路径均经 finally 恰一次释放·判空/throw 语义零改） |
| `apps/api/src/modules/quiz/quiz.controller.ts` | +3/−2 | `:55-:58` 同形翻面（UC184 注+slotKey 尾注 F5 随块上移·try 纳入取数判空·finally 收口） |
| `apps/api/src/modules/diagnosis/diagnosis.controller.ts` | +3/−2 | `:53-:56` 同形翻面（同上） |
| `apps/api/test/sse-principal-slot.proof.ts` | +3/−4 | hunk-A `:164` `=== 8`→`=== 5`+标签翻「溢出拒连零 catch-up（UC184 领槽先于取数·拒连不付取数副作用）」；hunk-B `:171-:172` defer 注释翻面（「Slot is acquired BEFORE the first events() (UC184): rejected requests pay zero catch-up then 429; they must not start a 2s loop」）；hunk-C `:96-:97` 「overflow catch-up +2 is not racy」残留语清除翻「拒连已零付」 |

**翻面确认（机制门）**：改后 prove run 恰一次 EXIT=0·18 臂全 PASS·`:164` 新标签 PASS=**实测 5**（改前 8/改后 5 对照=「拒连零取数」序翻面的机器实证·零 retry 冲销）·`:149`/`:163`/`:173-:176` 三断言（槽计数 5/拒连不占槽/拒连不入轮询）原样绿零触。

**门矩阵十二门全表**：
| # | 门 | 实测 | 结论 |
|---|---|---|---|
| 1 | sse-slot（机制门） | 改前 run `:164`=8 PASS EXIT=0（恰一次）→改后 prove `:164`=**5** PASS EXIT=0（恰一次·18 臂） | **绿（翻面）** |
| 2 | interview:prove | `pnpm interview:prove` EXIT=0·**57** PASS·0 FAIL（题面 57 恒等·熔断未触发） | 绿 |
| 3 | neg:all 六段 | `pnpm neg:all` EXIT=0·**687** PASS·0 FAIL（auth 90+commerce 90+resume 91+interview 102+bend 179+input 135 逐段题面恒等）·neg:interview `/events` 三臂 404/404/401 原码全绿（件① 判空/throw 搬移零改语义邻面承载） | 绿 |
| 4 | SSE 邻面三门 | sse-push **35**/35 EXIT=0+delta-arm **21**/21 EXIT=0（见偏离 2）+uc010 **13**/13 EXIT=0（实测为准·零弱化） | 绿 |
| 5 | migrate:prove | EXIT=0·123 臂全 PASS·链头实测 **0202**（链 `ls migrations | wc -l`=**202** 恒等·零迁移零 DDL） | 绿 |
| 6 | uniqueness | `node scripts/check-migration-version-uniqueness.mjs` EXIT=0·**files=202 violations=0**（豁免 0143/0152/0160 登记面） | 绿 |
| 7 | typecheck | `pnpm turbo typecheck --force` EXIT=0·**8/8·0 cached** | 绿 |
| 8 | lint 五值恰等 | `pnpm turbo lint` 12 任务 EXIT=0 全 0 errors：web **601≤601**+root **5235≤5235**+api **1421≤1421**+worker **954≤954**+ai-runtime **628≤628** 恰等零超支·零第三贴面新增 | 绿 |
| 9 | docs:check | `node scripts/ai-docs/check-docs.mjs` EXIT=0·**2134≤2136**（cap 2136=`public-text-policy.mjs:75` 亲证·并线带入 perfload 续作）·收据落卷后复跑终值见收据 | 绿 |
| 10 | markers 五类 | 改动集（4 .ts+本卷 .md+收据目录）运行时组装四词+冲突标记对 grep **零命中**（命令+EXIT 回执入收据·词面不入卷防自匹配） | 绿 |
| 11 | diff 面机检 | 改形时刻 `git diff --numstat HEAD` 恰 **4** tracked（3+3+3+3 行增/2+2+2+4 行减·上表）·本卷 .md（§0 重 pin+§8 附注+§9）与收据目录按协议随 EXEC commit（见偏离 5） | 绿 |
| 12 | 卫生 | install --frozen-lockfile EXIT=0 零 lockfile 改·`.env*` ABSENT 亲扫（root+depth-3 find 零命中）·neg/proof 面全离线·`actualSpendCny=null`·est live=0 零模型外呼 | 绿 |

**偏离清单（如实登记·Ban 就地扩面未触）**：
1. **门 4 sse-push/uc010 入口形**：REQUEST 题面裸形 `pnpm -C apps/api prove:sse-push-notify`/`prove:uc010-sse-resume` 在本机红于 `env_schema_invalid: database_target_missing`（裸跑无 PG 环境注入·基建红非断言红）→改走 root 既有隔离包装 `pnpm sse-push:notify:prove`/`pnpm uc010:sse-resume:prove`（root `package.json:178-181` 亲证包装体即调同靶 raw 命令·ssepush-notify 战役收据同入口先例）→35/35·13/13 全绿。靶与臂数零变·非弱化。
2. **门 4 delta-arm 臂数 21 对题面 20**：`sse-delta-arm.proof.ts` 在 `baf31a4e`（2026-10-14·基线前）/`7bc8ffaa`/`32cd5e70` 三点 blob 恒等·源内恰 21 断言——题面 20 系起草席误计（或与 tokenstream 20/20 邻门混淆）·非并线引入非现场漂移。按 §2 前言「数字口径以实跑实测为准」记 21/21 全绿零弱化·熔断条款未附此门·不上停。
3. **门 3 邻五套件 PASS 名单 diff=∅ 载体**：树内无存量 PASS 名单基线文件可逐名 diff——以六段计数字面恰等题面（90/90/91/102/179/135）+0 FAIL+`/events` 三臂原码承载等效判定·本轮全量 PASS 名单存 `/tmp/u184-neg-all.log`（易失件·不提交）。
4. **门 2 interview:prove 跑两次**：首跑 EXIT=0 绿但臂计数观测被 tail 截断未留痕→全量重跑一次留痕（57/57 PASS）。首跑即绿·非 retry-to-green 冲销（本门无恰一次条款·计数观测需要）·两 run 收据均在 `.tmp/isolated-proof-receipts/`。
5. **门 11 口径**：REQUEST §2-11 原文「另本卷 .md+收据目录 untracked」与实态不符（本卷 .md 自 b4712353 起即 tracked）——EXEC 序 3/6 协议授权的 §0 重 pin+§8 P2 附注+§9 记录+件④ 收据随本 commit 入树（授权卷自身载体+收据面）·产品触面恰 4 tracked 在改形时刻机检锁定（上表）·多出 2 路径均为协议内载体非产品面。
6. **§8 归因注触发态**：neg:interview 404/401 三臂全绿·12min 残留 lease 归因注未触发（预防性附注随 §8 落卷）。

**pins 零翻声明**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null——十一值照抄零翻转。Ban 列表零触（零 push/零 retry-to-green 冲销/零 pins 翻/零为绿改断言/零 service 守卫-泵-限流机制触/零丢 throw 吞异常改响应码/零同簇扩面/零迁移 DDL/零 SSOT 改/零跨树触/零依赖升级）。

**STOP**：**`executed:awaiting_post_prove_dual`**——post 双审两独立外席待派·nail/LEDGER #184 行翻面权归协调方·本席止步于此 commit（⛔push）。

---

*UC184-SLOT-ORDER REQUEST · 2026-10-14 起草 · 2026-10-15 EXEC 落码 · **`executed:awaiting_post_prove_dual`**（§9 EXEC 记录·门矩阵十二门全绿·post 双审两独立外席待派·nail/#184 行翻面归协调方） · base `feat/mysql-schema-skeleton` @`7bc8ffaa`→EXEC 并线 origin tip `109e3eb1`（merge **`32cd5e70`** 零冲突） · 分支 `line/uc184-slot-order`（EXEC 前 HEAD=`b4712353`） · 工作树 `meetwise-u184` · pre-exec 双审会签 PASS（席1 agent_d4e4f7b9+席2 agent_6e6e1701）+协调方 EXEC 授权 · 修法件①②③恰 4 tracked 文件落地（interview/quiz/diagnosis 三控制器取数序翻面=acquireSlot 前移+try 纳入取数判空+pump+finally 恰一次释放·proof `:164` 8→5 断言翻面+hunk-B/C 注释翻面）· 机制门改前 run `:164`=8→改后 prove `:164`=**5** 全绿（拒连零取数新契约机器锁定·零 retry 冲销）· 门矩阵=sse-slot 翻面绿+interview:prove 57+neg:all 687 六段（/events 404/404/401 原码）+sse-push 35/35+delta 21/21（题面 20 系起草误计·blob 三点恒等）+uc010 13/13+migrate 链 202 头 0202 123 臂+uniqueness files=202 violations=0+typecheck 8/8 0 cached+lint 五值恰等 web 601/root 5235/api 1421/worker 954/ai-runtime 628+docs:check 2134≤2136（cap 2136 并线带入）+markers 五类零命中+diff 面恰 4 tracked+卫生（.env* ABSENT·actualSpendCny=null·est live=0）· 偏离六条如实登记 §9（裸形门入口改隔离包装/20→21 臂数勘误/PASS 名单载体/interview 双跑留痕/门 11 协议载体口径/归因注未触发）· 零迁移零 DDL · pins 十一值照抄零翻 · 停止条件四类零触发 · Ban self-approve · alone≠dual · post 双审待派 · ⛔push · ⛔force push · STOP*

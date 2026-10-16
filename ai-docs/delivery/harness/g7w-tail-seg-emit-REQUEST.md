# G7W-TAIL-SEG-EMIT REQUEST（G7W 案 A 埋点刀 · P1 · iso driver 结构化埋点+wall-clock delta · 协调方授权起草 · 案 B 契约裁定已 EXEC 落卷 · 码面 EXEC 期落卷 · 起草落卷即停零码动）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 席落卷 2026-10-16 · pre-exec 双审会签 PASS（席1 `agent_0fbcaf64`+席2 `agent_d595e5cd` · P2×4 随 EXEC 落）+协调方 EXEC 授权 · merge `42dfe8e7` 并 `origin/feat/mysql-schema-skeleton@24b75b17` · 面① interview.ts +5/−0+面② full.e2e.ts +15/−0 落卷 §9-EXEC · 静态门全绿（typecheck/lint 5235=cap 恰等/prove 28/static-guards/parity/case-inventory/platform/docs:check 2186≤2200/markers 零命中）· **LIVE 跑数零行使**（判别 run 零实跑·EXEC 授权≠LIVE 授权两票分立）· post-prove 双审两独立外席待派 · alone ≠ dual · ⛔push · Ban self-approve · est live=0 · `actualSpendCny=null` · 起草期原注=draft 原文见 git `ac6877a0`）

**席位**：G7W-TAIL-DEATH 案 A 埋点刀 起草席（协调方派单令 · 承 `line/g7w-tail-diag@7521e57d` 诊断卷两案并陈 · 协调方裁案 B 先行已 EXEC 落卷 · 本卷=案 A 埋点肢独立域承登行使）。
**基线**：`feat/mysql-schema-skeleton` @ **`3cd159dd`**（fetch 后亲证 origin tip `origin/feat/mysql-schema-skeleton` = `3cd159dd` **恰等派单下界「origin tip≥3cd159dd」以等号成立** · cap sanction 波 tip · `origin/main`（`112e6d26`）系另一 lineage 不含本基线——两线分叉沿姊妹卷如实登记 · 本卷沿支树谱系承诊断/裁定两卷形制）· worktree **`meetwise-g7a`**（仓根同级 · `git worktree add ../meetwise-g7a -b line/g7w-tail-seg-emit` 本起草席立）· branch **`line/g7w-tail-seg-emit`**。
**立项出处（不自建 SSOT 行——行翻面权沿例归协调方）**：①协调方派单令（案 A 埋点刀起草 · 前置=批判门韧性刀落地已满足（QGEN+submit-flow 已 nail · checklist `:3113` QGEN-CRITIQUE-RESILIENCE 修法承卷+`:3142` submit-flow-competency-wire nail 在树）·案 B 已 EXEC 落卷·案 A 埋点肢独立域不灭失）；②`ai-docs/delivery/gap-bug-backlog.md`（blob `62c5e620`）`:108` GAP-G7W-API-TAIL-DEATH 行 P1 OPEN 原文（修复路径「**driver 侧结构化失败埋点** 或 withhold 契约裁定（二选一归协调方裁）」之「埋点」肢=本卷行使）+ `:796` G7X 双面收敛注 + `:800` 案 B 勘误注（「『埋点』肢=案 A 独立域**不因本注灭失**」原文）+ `:840` CMOP03-FIX 鉴别刀立项注（臂①「driver 侧分段埋点」先例立项原文）；③诊断卷 `line/g7w-tail-diag@7521e57d`（blob `790be3dd` · ⛔push 在飞未并 · 本卷只读承接）§1-修法修A 全文（案 A 授权源：seg emit 逐处+wall-clock delta 行·零 A() 语义变更·零 withhold 触·最小 diff·判别 run 恰 1·est live≈7 账本实测）；④**埋点先例链四件**：CMOP03-D M1-M7（checklist `:1559` nail · `seg_*` 7 枚留树）· CMOP03-F F1-F4（checklist `:1670` nail · `seg2_*` 5 枚留树+段外升级条款先例）· G7Y finer markers 立项（backlog `:842`）· G7P-6 7a 定靶刀（`harness/g7p6-7a-diag.md` blob `8fce8a66` · 7a_diag NDJSON 通道发明卷）；⑤**绿基线锚**：G7FIX-2 nail（checklist `:1905` · CMD1 主旅程首次全绿 EXIT=0/75 断言/19 ledger 末位 M7=ledger 容量算术基座）；⑥结构范本 `harness/g7w-tail-contract-ruling-REQUEST.md`（blob `4aa060e1` · 案 B 姊妹卷 · §0/§1/§1.3/§2/§5/§8 形制承之）。

---

## §0 现状锚（起草席亲证 · 全部 rg/Read/sed/git ls-tree/check-ignore 实测 @`3cd159dd` · 后继 pre-exec dual/EXEC 面照本节对届时 tip 再重 pin——blob 漂移如实改锚·结论不变则只更行号；行锚漂移超 ±3 且结论受影响 → §8 停止条件①）

### 0.0 防重双对表（本 turn 实测）

- `git worktree list`：`meetwise-g7a` 名下**恰 1 树**=本树；`git branch --list "line/g7w-tail-seg-emit"` 恰 1 命中=本席分支 · 零同名。
- `ls ai-docs/delivery/harness/ | grep g7w-tail-seg-emit` 落卷前**零命中**（无同名卷）；与诊断卷 `g7w-tail-diag-REQUEST.md`/案 B 卷 `g7w-tail-contract-ruling-REQUEST.md` 卷名/分支名均不同名、域相承不重叠（案 B=withhold 契约裁定 docs-only 已 EXEC · 本卷=driver 埋点码面刀 · 案 A/案 B 非互斥承 diag 卷 §1-修法诊断意见原文）。
- `git check-ignore .tmp/e2e-seg-emit.ndjson .tmp/e2e-7a-diag.ndjson` **EXIT=0 双命中**（`.tmp` 全族 gitignored 非受管 · 本卷新通道沿此）。

### 0.1 blob 锚表（`git ls-tree` 亲算 · 8 hex · @`3cd159dd` 亲读）

| # | 文件 | blob | 关键行锚（@`3cd159dd` 亲读） |
|---|------|------|------|
| 1 | `ai-docs/delivery/gap-bug-backlog.md` | `62c5e620`（诊断卷锚 `1b8867b4`→案 B EXEC 期 `2ff5d685`→现值 · 他刀 append 漂移如实改锚） | **`:108` GAP-G7W-API-TAIL-DEATH 行 P1 OPEN 原文 intact**（本卷授权行 · 零触）· `:796` G7X 注 · `:800` 案 B 勘误注（「埋点」肢不灭失原文）· `:840` CMOP03-FIX 臂① 立项注 · `:842` G7Y EXEC 结果注（finer markers「CMOP03-D 同法」原文） |
| 2 | `ai-docs/delivery/execution-master-checklist.md` | `e585e85f`（诊断卷锚 `274b5d27`→案 B 期 `368f1b8f`→现值） | `:1559` CMOP03-D NAIL（M1-M7 先例段头）· `:1670` CMOP03-F NAIL（「恰 4 行 seg2 埋点+判别 run 单 attempt 收据」·埋点留树 4+7 枚）· `:1905` G7FIX-2 NAIL（**75 断言/19 ledger 末位 M7 首次全绿**）· `:3113` QGEN 修法 + `:3142` submit-flow nail（前置兑现双锚） |
| 3 | `e2e/full.e2e.ts` | `4cb481aa`（890 行 · **与诊断卷/案 B 卷锚恒等零漂移**） | `:35`（fs/bootId/capT0 就绪+.tmp mkdir）· `:190`-`:214`（interviewStartedAt+主旅程 driveInterviewToTerminal+红路径）· `:216`-`:220`（report 段）· `:222`-`:251`（7a 段 · **`:247`-`:248` 7a_diag NDJSON 红时帧+diag_failed 防自伤形**）· `:270`/`:273`/`:340`/`:343`（M1-M4）· `:575`（M5）· `:589`-`:601`（app_start/app_start_reid 帧·**elapsed_ms 先例字段**）· `:592`-`:608`（F1-F4）· `:609`-`:620`（M6/M7+boundLoop）· `:622`-`:647`（postm7_a1..a5 帧链）· `:627`-`:637`（finalize 结算面） |
| 4 | `e2e/helpers/interview.ts` | `4aee4a29`（385 行） | `:59`-`:72`（InterviewLoopResult type）· `:290`-`:385`（driveInterviewToTerminal）· `:304`（`const started = Date.now()`）· `:306`-`:308`（while+readSseEvents+provenance review——**批级 wall-clock 插点位**）· `:379`-`:384`（return） |
| 5 | `e2e/helpers/sse.ts` | `f41719a2` | `:65`-`:94`（readSseEvents hold-and-tail · 1.2s abort · 请求发出/首响应/流式完成三时刻**结构性在函数内部**——本卷零触 · scope-out 见 §1-修法边界登记） |
| 6 | `e2e/helpers/failure-class.mjs` | `102d0f3a` | `:32` CODE_RE · `:49`-`:53`（E2E_REVIEW/E2E_FAILURE 行 RE）· **`:55` `REVIEW_LEDGER_LIMIT = 32`**（ledger 容量硬界）· `:303`-`:338`（evaluateIsolatedHttpE2E · **`:322`-`:324` exit=0+E2E_FAILURE 行在 → `success_with_failure_class` 拒收**=Ban emitE2EFailure 作埋点行的机制根据）· `:345`/`:374`（越帽 → `review_ledger_overflow`） |
| 7 | `e2e/helpers/e2e-helpers.proof.ts` | `e748be25` | `:339`-`:349`（full.e2e 源码锁 test · 8 正则=本刀禁删面）· `:599`-`:646`（iso accept 面契约 test） |
| 8 | `scripts/e2e-static-guards.mjs` | `01127803` | `:97`-`:106`（full.e2e AI-path 契约=driveInterviewToTerminal≥3 调用+scorelessBound 契约钉正则+禁 invented questionId）· `:370`-`:383`（scanFullE2eAiPath · 禁 dead call/禁 shadow/禁 forged zero）· `:154`-`:172`（credential 形扫=新增行禁区）· `:404`-`:426`（failure-helper import 守卫） |
| 9 | `scripts/e2e-parity-check.mjs` | `40394984` | `:19`-`:22`（full.e2e binding needle `'assert: A'`=本刀零触面） |
| 10 | `scripts/run-e2e-isolated.mjs` | `0787a7ff`（**与案 B 卷锚恒等**） | `:89` LIVE_E2E_TARGETS+`:2754` 假旗门（LIVE 预飞位）· `:58`-`:59`+`:2769`-`:2778`（**G7_RUN_COST_LEDGER 账本臂**：G7_FREETIER_REPROVE=1 → `.tmp/g7-ledgers/g7-<pid>-<ts>.ndjson`=est live 账本实测载体）· `:2861`-`:2887`/`:2866`/`:2922`/`:3013`-`:3051`/`:3119`/`:3164`（withhold 契约面+receipt reviewLedger 结构化行入账——承案 B 卷 §0.1 #4 转录 · blob 恒等故行锚有效 · 本卷零触） |
| 11 | `scripts/ai-docs/public-text-policy.mjs` | `841e8666` | `:102` **`MAX_FILES = 2_200`**（cap sanction `3cd159dd` 现值）· 起草基线 docs:check 实测 **2185 managed ≤ 2200**（余量 15 · EXIT=0 亲跑） |
| 12 | `ai-docs/delivery/harness/g7p6-7a-diag.md` | `8fce8a66` | 7a_diag 通道发明卷（红时补抓+diag_failed 防自伤+「est live ≤25/run · 链累计硬帽 200」预算形=本卷 §6 口径源） |
| 13 | `ai-docs/delivery/harness/g7w-tail-contract-ruling-REQUEST.md` | `4aa060e1` | 案 B 姊妹卷（`executed:awaiting_post_prove_dual` · 面① 裁定「埋点肢不灭失」+面③ scoped readback 另立登记=本卷域界书） |
| 14 | 诊断卷 `g7w-tail-diag-REQUEST.md` | `790be3dd` @`7521e57d`（跨支锚 · 该支 ⛔push 在飞） | §0.2 六件证据基座（postm7_a1..a5 三 boot 帧+7a_diag 两 boot 十帧+五 receipt+老红归档件）=本卷「今日 NDJSON 逐帧=埋点证据基座」承接源 · 修A 全文=本卷修法母本 |

### 0.2 读码三项（派单任务 2a/2b/2c · 起草席亲读定稿）

#### 0.2a · iso e2e driver 面：供给链各段现埋点盘点 + wall-clock 可插点清单

**现埋点盘点（`e2e/full.e2e.ts` @`4cb481aa` 逐段亲读）**：

| 供给链段 | 行锚 | 现埋点 | 形 |
|---|---|---|---|
| 前置区（signup/consent/resume/commerce） | `:29`-`:85` | consent 帧（`:38`-`:39` · elapsed_ms） | NDJSON（consent-capture） |
| UC018 abandon 段 | `:90`-`:143` | 无 | — |
| 主旅程建面试+begin | `:145`-`:188` | 无 | — |
| **主旅程 SSE 循环** | `:190`-`:214` | `interviewStartedAt`（`:190` · **仅红路径 `:211` 消费**）· 循环内零埋点 | — |
| **report 段**（主报告读） | `:216`-`:220` | 无 | — |
| **7a 报告失败隔离段** | `:222`-`:251` | 红时 7a_diag 五帧（`:247`）+diag_failed 防自伤（`:248`）——**绿时零帧** | NDJSON（red-only） |
| 7b 押题+诊断段 | `:253`-`:269` | recordTerminal ×2 | ledger |
| M1-M4 段标 | `:270`/`:273`/`:340`/`:343` | seg_diag_green_enter/seg_step8_enter/seg_step9_green/seg_expert_enter | ledger（CMOP03-D） |
| R1-R3 路由段 | `:429`-`:553` | r2 recordTerminal | ledger |
| 岗位 start/幂等/begin | `:589`-`:608` | F1-F4+M5（`:575`）· app_start/app_start_reid 帧（**elapsed_ms 在**） | ledger+NDJSON（CMOP03-F） |
| boundLoop | `:609`-`:620` | M6/M7 · 循环内零 wall-clock | ledger |
| **结算段**（finalize/a4/a5） | `:627`-`:657` | postm7_a3/a4/a5 帧（status/outcome 在 · **无 elapsed**） | NDJSON |

**判读**：现有 12 枚 seg 行（M1-M7+F1-F4）+两条 NDJSON 通道覆盖「段标心跳」与「结算/7a 红时」两域；**wall-clock delta 全域缺位**（仅 consent/app_start 两帧带 elapsed_ms），主旅程进出/report 段/7a 段绿时/循环内批时刻四面零读数——老红「~12s 静默窗」若今日复现，仪器只能给 class 级归因不能给窗内直读（diag 卷 §1 次读「面前预占」的仪器侧根因）。

**wall-clock 可插点清单（五点 · 派单指定）**：

| # | 插点 | 结构位 | 本卷处置 |
|---|------|--------|---------|
| W1 | 请求发出 | `interview.ts:307` readSseEvents 调用前批 t0（fetch 发出含括） | **修法面① S2 捕捉** |
| W2 | 首响应 | `sse.ts:70`-`:77` fetch 响应头返回位（函数内部） | **scope-out 如实登记**——拆点须触 `sse.ts` 第三码面（`e2e-helpers:prove`+static-guards 契约面+预算超帽）· 批 delta 对其括界（首响应 ∈ [批 t0, 批 t0+tMs]）· 需要时另立微刀 |
| W3 | 流式完成 | `interview.ts:308` 批返回位（hold-and-tail 1.2s abort 含括 · kinds 随批） | **修法面① S2 捕捉**（W1→W3 一并=batch tMs+kinds 日志） |
| W4 | report 段 | `full.e2e.ts:216`-`:220` 主报告读前后 | **修法面② F2 帧** |
| W5 | 结算段 | `full.e2e.ts:627`-`:637` finalize 面 | **修法面② F5 帧**（既有 postm7_a3..a5 帧链补 wall-clock 增量·零改既有帧） |

#### 0.2b · NDJSON 帧写入缝（e2e-7a-diag 同族输出通道）

- **同族形**：`fs.appendFileSync('.tmp/<channel>.ndjson', `${JSON.stringify({ bootId, step, ... })}\n`)`——在树三缝：consent-capture（`:38`/`:39`/`:589`/`:601`/`:622`-`:647` · 无条件步进帧+elapsed_ms 字段先例）、7a_diag（`:247` 红时帧+`:248` **diag_failed 防自伤 try/catch 形**）、`.tmp` 全族 gitignored（0.0 三查亲证）· 每树各异如实登记（承诊断卷 §0.2 D2 机制）。
- **通道性质**：driver 进程内写盘=**非子进程 stdout**——不触 withhold 契约（`run-e2e-isolated.mjs` `:2866` stderr 即弃/`:2922` WITHHELD 只约束子进程输出面；帧通道零 stdout 捕获零 raw 落盘）· 宿主 `.tmp/` 在盘可回读（容器即毁面不适用）。
- **本卷新缝**：`.tmp/e2e-seg-emit.ndjson`（新兄弟通道 · 同族形 · **零改写既有两通道字节**——G7K 诊断工具对 consent-capture/7a-diag 的消费面零扰动）· 帧字段白名单=`bootId/step/t_ms/elapsed_ms/terminal/questions/turns/status/reportStatus/outcome/batches[{tMs,kinds}]`（kinds 仅事件 kind 串非载荷 · **零 answer/prompt/token/key 值**——沿 failure-class.mjs 头注「never accepts or persists secrets, tokens, prompts, answers」契约）· 写盘失败防自伤 try/catch（`:248` 同形——Ban 埋点自身异常改写红面 class）。
- **判读口径**：帧journal 按 bootId 分组、`t_ms`/`elapsed_ms`/批 `tMs` 作差即段间 wall-clock delta——「静默窗归因由仪器直读」（diag 卷修A 原文）落地形。

#### 0.2c · est live≈7 跑数需求（EXEC 期判别 run · 起草零 live）

- **口径**：判别 run 恰 1（`pnpm e2e:isolated`=CMD1 · 单 attempt · Ban retry-to-green）· **est live≈7/run 系账本实测口径非计数器预估**（est-not-counter）——承老红归档件账本读数（diag 卷 §0.2 帧源 D：`ai_model_invocation` succeeded=5+failed/schema_validation_failed=2=7）· 链累计沿 g7p6-7a-diag「硬帽 200」口径如实另账（g7p6 收据链 126+本刀 7≈133 ≤ 200 · EXEC 期以账本实跑值为准）。
- **跑数前置条件**（EXEC 期核）：真供应商 Key 在 runner env（MODEL_API_KEY 文本 profile · DASHSCOPE vision/tts/asr 缺省 → capability ×2 行照常）· iso runner env 契约（PG* fail-closed）· LIVE 授权=**协调方另行授权，本卷起草期零行使**（零外呼零容器零 DB 连接——起草 turn 全只读+落卷门全本地）。
- **账本臂**：`G7_FREETIER_REPROVE=1` → 隔离父进程分配 `G7_RUN_COST_LEDGER_PATH=.tmp/g7-ledgers/g7-<pid>-<ts>.ndjson`（`run-e2e-isolated.mjs` `:58`-`:59`/`:2769`-`:2778`）=est live 实测载体（修A「配套 sidecar 账本实测臂」原文的机制落点）· 判别 run 收据三源判读=机器 receipt（reviewLedger/断言计数/durationMs）+ seg-emit NDJSON 帧 + 账本 NDJSON。

## §1-修法（seg emit 逐处定稿 · 恰 2 码面 +17/±3/−0 · 硬帽 +25/−0 · EXEC 期落卷 · 本起草卷零码动）

**行形总纲（承 diag 卷修A「沿 CMOP03-D 臂①」原文的机制精确化）**：埋点行=**`reviews.record({ class: 'worker', code: 'seg3_*' })` → `E2E_REVIEW` 结构化 ledger 行**（CMOP03-D M1-M7/CMOP03-F F1-F4 在树同形同源 `createE2EReviewLedger`）——**Ban `emitE2EFailure` 作埋点行形**：E2E_FAILURE 行+EXIT=0 → `evaluateIsolatedHttpE2E` 判 `success_with_failure_class` 拒收（`failure-class.mjs:322`-`:324`），绿面必翻红（§1.3-2 机制根据）。diag 卷修A 行文「`emitE2EFailure({class:'worker',code:'seg_*'})` 形」系 SSOT 行文对「结构化 ledger 行」的族称（backlog `:840` 臂①/G7Y `:842` 同族称），**在树 12 枚 seg/seg2 先例全数 `reviews.record` 形**——本卷以在树实现为准绳定稿，SSOT 族称不照抄。新行前缀 `seg3_`（seg_=CMOP03-D · seg2_=CMOP03-F · seg3_=本刀——三族 code 串零碰撞=reviewLedger 逐行可甄别=基线红形零漂移判读基座）· 六码全过 CODE_RE（`failure-class.mjs:32`）非 opaque。

### 面① · `e2e/helpers/interview.ts`（blob `4aee4a29` · **+5/−0** · 零 A() 触）

| # | 位锚（现树） | 新增形（定稿） |
|---|---|---|
| S1 | InterviewLoopResult type 尾（`:72` 后） | `batchWallClock: Array<{ tMs: number; kinds: string[] }>;` 字段 1 行 |
| S2a | `:304` `const started` 后 | `const batchWallClock: Array<{ tMs: number; kinds: string[] }> = [];` 1 行 |
| S2b | `:307` readSseEvents 前 | `const batchT0 = Date.now();` 1 行（W1 请求发出位） |
| S2c | `:308` provenance review 后 | `batchWallClock.push({ tMs: Date.now() - batchT0, kinds: events.map((e) => e.kind) });` 1 行（W3 流式完成位） |
| S3 | return 对象（`:379`-`:384`） | `batchWallClock,` 1 行 |

零语义变更三证：驱动逻辑/identity 链/A() 调用零字节触；static-guards AI-path 契约保全（`questionIdentityFromEvent(event)` ≥2 命中不动 · 禁改面零触 · 新增行无 score/overall 键无 credential 形无 invented questionId 形）；`e2e-helpers:prove` 现有断言零触（新增字段非其断言面）。W2（首响应拆点）scope-out 如实登记（§0.2a 表）。

### 面② · `e2e/full.e2e.ts`（blob `4cb481aa` · **+12/−0** · seg 行 6 枚+seg3 帧 5 帧+helper 1 枚）

**seg3 ledger 行（6 枚 · 每枚 1 行 `reviews.record` + 行尾 `//` 注记 · 先例同形）**：

| # | code | 位锚（现树） | 域标 |
|---|------|------------|------|
| R1 | `seg3_mainloop_enter` | `:190` `interviewStartedAt` 旁·主循环调用前 | 主旅程进 |
| R2 | `seg3_mainloop_terminal` | `:202` mainLoop 解构后·`:203` 断言面前 | 主旅程出+断言面进 |
| R3 | `seg3_7a_enter` | `:223` 7a 块入口后 | 7a 段进 |
| R4 | `seg3_7a_loop_terminal` | `:238` failLoop 返回后·红补抓面 `:240` 前 | 7a 循环出（绿红两态皆记） |
| R5 | `seg3_finalize_pre` | `:627` finalize fetch 前 | 结算段进 |
| R6 | `seg3_finalize_assert_post` | `:637` finalize 断言后 | 结算段断言面过 |

**seg3 NDJSON 帧（5 帧+helper 1 枚 · `.tmp/e2e-seg-emit.ndjson` 新通道 · §0.2b 形）**：

| # | step | 位锚 | 字段 |
|---|------|------|------|
| H1 | —（helper） | `:35` 区后 1 行箭头 | `segEmit(frame)` =appendFileSync+防自伤 try/catch（`:248` 同形） |
| F1 | `seg3_mainloop` | R2 后 | terminal/questions/turns/`elapsed_ms=Date.now()-interviewStartedAt`/`batches=mainLoop.batchWallClock` |
| F2 | `seg3_main_report` | `:219` 报告读后 | status/reportStatus/`elapsed_ms`（W4 report 段） |
| F3 | `seg3_7a_loop` | R4 旁 | terminal/questions/turns/`batches=failLoop.batchWallClock` |
| F4 | `seg3_boundloop` | M7 `:620` 后 | terminal/questions/turns/`batches=boundLoop.batchWallClock` |
| F5 | `seg3_finalize` | `:628` readJson 后 | status/outcome/`t_ms`（W5 结算段 · 既有 postm7 帧链零改写） |

**量级核算**：面① +5 · 面② +12（H1 1+R1-R6 6+F1-F5 5）· 合计 **+17/−0**（±3 浮动帽=行尾注记/断行样式 · EXEC 期 numstat 实测为准 · 硬帽 +25/−0 越帽即停 §8-③）。
**ledger 容量算术（面② 硬约束）**：现树 worst-case ledger=20 行（capability×2+recordTerminal×6〔main/7a/quiz/diag/r2/bound〕+M1-M7×7+F1-F4×5 · G7FIX-2 首绿实测 19 与本算术同族 `:1905`）+ 新增 6=**26 ≤ REVIEW_LEDGER_LIMIT 32**（余量 6 · `E2E_REVIEW_CODES` 1..32 界内）· OCR/voice 键在场 profile 18+6=24 更宽。EXEC 期若届时树基线行数实测 >26 → §8 停止条件②。
**零触三面**：零产品码（apps/packages 全域）· 零 withhold 契约码面（scripts/run-e2e*+secret-redaction+withheld-output）· 零迁移零 spec 零夹具零占号。
**判别 run 判读谱（EXEC 期 · LIVE 授权后）**：绿 run=accept 判定/断言计数（零 A() → `passed()` 计数不变）对基线同形+reviewLedger 恰「基线行+seg3 六行」+seg3 帧链在盘；红 run=failureClass 对基线同形（seg3 行零产生 E2E_FAILURE 行）+seg3 帧/行给出死亡窗段位直读——「埋点先行·判别 run 解耦后置」条款（diag 卷修A 原文）已由前置兑现，判别 run 排程仍归协调方。

## §1.3 否决清单（veto · 双审/EXEC 违反任一即 FAIL）

1. **Ban 起草期码动**：本卷起草改动集恰 1 .md——码面（面①/面②）只可在 EXEC 期随本卷授权落卷，起草期触码即 FAIL。
2. **Ban `emitE2EFailure` 作埋点行形**（§1 行形总纲机制根据：`success_with_failure_class` 拒收=绿面翻转）· Ban 埋点行携带 class 伍 `worker` 外的族称（沿 M1-M7/F1-F4 全 `worker` 先例）。
3. **Ban A() 断言语义变更/删除/改写/新增**（本刀断言零增零减零改——含 scorelessBound 契约钉、static-guards 契约正则面、`e2e-helpers.proof.ts` 源码锁 8 正则、parity binding needle `'assert: A'`）· Ban 为绿放宽任何门。
4. **Ban 触 withhold 契约码面**（`run-e2e-isolated.mjs`/`run-e2e.mjs`/`run-e2e-ui.mjs`/`secret-redaction.mjs`/`withheld-output.mjs`——案 B 面③ scoped readback 另立域 · 本卷零代立）· **Ban 子进程 stdout 捕获新通道**（帧通道=driver 进程内 `.tmp` 写盘 · 结构性在 withhold 域外）。
5. **Ban 帧/行携带敏感物料**：answer/prompt/token/key 值/model 回显/连接串零入帧零入行（字段白名单 §0.2b · kinds 仅 kind 串非载荷）· Ban Key 物料入树入据。
6. **Ban ledger 越帽**：新增后 worst-case >32（`review_ledger_overflow` 拒收）即停（§8-②）· Ban retry-to-green/Ban 只留绿 attempt（判别 run 单 attempt 纪律）。
7. **Ban 第三码面**：`sse.ts` 零触（W2 拆点 scope-out · 需要则另立微刀全链）· 零产品码零迁移零占号零锁文件。
8. **Ban 起草期 live**：零外呼零容器零 DB；判别 run 的 LIVE 行使=协调方另行授权后的 EXEC 期工序，未授权先跑即 FAIL · **Ban self-approve**（pre-exec dual 归协调方派两独立外席 · alone ≠ dual）· ⛔push ⛔merge 主线 ⛔force push。

## §2 门矩阵（起草期本席全跑 + EXEC 期码面落卷全跑 · 每条可独立判定）

**A 段 · 起草期（本席亲跑 · 零码零 live）**：

| # | 门 | 命令/判据 | 判定 |
|---|-----|-----------|------|
| A1 | docs:check | `node scripts/ai-docs/check-docs.mjs` | **EXIT=0**（起草基线亲跑：2185 managed ≤ cap 2200（`public-text-policy.mjs:102` 亲证）· 落卷后预期 2186 ≤ 2200 · 本卷系唯一新增受管件） |
| A2 | markers 五类 | 改动集 grep（词族=`scripts/i6-239-gates.proof.mjs:151` 区运行时组装四词+冲突标记对 · **词面本卷不复抄防自匹配**） | **零新增命中**（改动集恰 1 .md） |
| A3 | diff 面 | `git diff --numstat HEAD~1 HEAD`（落卷后） | **恰 1 tracked 新件=本卷 .md · +N/−0 纯新增 · 零他 tracked 路径零删改**（SSOT 原文零触机检：backlog/checklist 对 HEAD 零 delta） |

**B 段 · EXEC 期（码面落卷时行使 · 本卷预 registered 判据）**：

| # | 门 | 命令/判据 | 判定 |
|---|-----|-----------|------|
| B1 | typecheck | `pnpm typecheck`（=`tsc -p tsconfig.e2e.json` · include `e2e/**/*` 恰盖两码面） | **EXIT=0** |
| B2 | lint | `pnpm lint`（`--max-warnings 5235`） | **EXIT=0 且新增零 warning** |
| B3 | 受影响 e2e 门族绿形零漂移 | `pnpm e2e-helpers:prove`+`pnpm e2e-static-guards:check`+`pnpm e2e-parity:check`+`pnpm e2e-parity:prove`+`pnpm e2e-case-inventory:prove`+`pnpm e2e-platform:check` | **全 EXIT=0 逐门同基线**（源码锁 8 正则/AI-path 契约/binding needle/withhold marker 检查零触零漂移） |
| B4 | diff 面（码面） | `git diff --numstat` | **恰 3 tracked=两码面（面① ∈[2,8]·面② ∈[9,15]·合计 ∈[11,23]∩硬帽 ≤25/−0）+本卷 .md · 零他 tracked** |
| B5 | ledger 容量算术 | §1 核算对届时树重算 | **worst-case ≤32**（基线实测 +6） |
| B6 | 受影响 e2e 门基线红形零漂移（LIVE 面） | 判别 run 恰 1（**LIVE 授权归协调方另行**） | failureClass 族/断言计数/accept-reject 判定对基线同形——**E2E_FAILURE 行零新增 · 新增仅 seg3_* E2E_REVIEW 行+seg3 NDJSON 帧** · 绿红两态判读谱 §1 |
| B7 | 账本臂 | `G7_FREETIER_REPROVE=1` 账本 NDJSON 在盘 | est live 实测值入收据（est-not-counter 对账） |

## §3 范围外（边界清单 · 越界即 FAIL）

1. 产品码全域（apps/packages）· 迁移（链顶 0204 冻结 · 零预占）· spec/夹具/锁文件。
2. withhold 契约码面全家（§1.3-4 五文件）——案 B 面③ 另立域 · 本卷只读引用。
3. `sse.ts`（第三码面 · W2 拆点 scope-out）· `e2e/helpers/` 其余文件（本刀仅 interview.ts 一 helper）。
4. `:108` 行本体与行翻面（P1 OPEN 维持 · 翻面权归协调方）· `:107`/`:109`/CMOP03-POST7B/7A-DOWNGRADE 各行域 · 诊断卷支 `line/g7w-tail-diag` 与前刀支 `line/g7w-tail-death`（零代推零改写零复活）。
5. 既有两 NDJSON 通道字节（consent-capture/7a-diag 零改写）· 既有 12 枚 seg/seg2 行与 M/F 编号（零改零删零重号）。
6. 共享 SSOT 其余全部行/行统计/LEDGER/矩阵——只读零触。

## §4 依赖与迁移号

零新依赖——wall-clock/appendFileSync/ledger 全为 Node 内建与在树设施。**迁移号=零**（现树 max=0204 · 不预占任何号）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push/pull --rebase（git 写操作只在本 worktree 起草 commit 一次）· Ban 起草期码动（§1.3-1）· Ban `emitE2EFailure` 埋点形（§1.3-2）· Ban A() 语义触（§1.3-3）· Ban 触 withhold 码面与 stdout 捕获通道（§1.3-4）· Ban 敏感物料入帧入行（§1.3-5）· Ban ledger 越帽/retry-to-green/只留绿 attempt（§1.3-6）· Ban 第三码面与产品码与迁移（§1.3-7）· Ban 起草期 live/LIVE 未授权先跑/self-approve（§1.3-8）· Ban 直改 `:108` 行原文任何字节/删行洗史/洗 `:107` 入本行/追认 G7S/G7U 时点内容/就地定谳断言内容（`:108` Ban 条款逐字承）· Ban 以探针臂绿代 in-driver 绿· Ban 触 §3 全部域。

**pins（十一值照抄 · 零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（起草零调用零消耗 · 判别 run 消耗 EXEC 期账本实记）。

## §6 est live（起草=0 · EXEC 判别 run≈7）

起草 turn 全只读（rg/Read/sed/git/check-ignore）；落卷期门行使面=docs:check+markers+git diff+三查（全本地零外呼零容器零 DB）——**起草 est live=0 · `actualSpendCny=null`**。EXEC 期：静态门族（B1-B5）全本地零外呼；判别 run 恰 1 **est live≈7/run**（账本实测口径 · §0.2c · LIVE 授权归协调方另行 · 链累计沿硬帽 200 口径如实另账）。

## §7 markers=0（卫生声明）

本刀起草改动集恰 1 .md，五类标记词起草席亲跑 grep 零新增（命令与回执随交付报告；五类标记词不在卷内复抄，避免自匹配——沿诊断卷/案 B 卷 §7 同形制）。

## §8 STOP（开工三条款）+ 停止条件

**STOP · `executed:awaiting_post_prove_dual`（EXEC 席 2026-10-16 终态翻转 · 原 `draft:awaiting_pre_exec_dual` · 实测翻面三处=Status 头/本节/卷尾 · 与起草自述「三处」恒等）· 起草席写完即停零码动条款已行使完毕。** 开工三条款：①本卷 pre-exec 双审 BOTH PASS（双审对象=§0 锚保真+§1 修法逐处定稿（行形总纲/量级/ledger 算术/W2 scope-out）+§1.3 否决+§2 门矩阵——两独立外席 · alone ≠ dual）；②协调方 EXEC 授权（码面落卷+判别 run 排程一并由协调方裁 · **LIVE 跑数须协调方另行授权**——EXEC 授权≠LIVE 授权，两票分立）；③post-prove 双审+行状态归协调方裁。三者全属后继工序 · 本卷不含 EXEC。

**停止条件（五类 · 命中即停手上报）**：
1. **现场漂移**：pre-exec/EXEC 面对届时 tip 重 pin——`:108` 行被翻面/他刀插入注记、先例链段（checklist `:1559`/`:1670`/`:1905`）被改写、或 §0 锚漂移超 ±3 且结论受影响 → 停手上报（不得就地改修法实质）。
2. **机制不满足**：ledger 容量算术被届时树实测推翻（基线行数 >26 不可容纳六行）、`failure-class.mjs` 容量/行 RE 面被他刀改动、或静态门契约面（源码锁/AI-path/binding needle）被他刀动 → 停手上报回炉（不得就地改行形）。
3. **越界需要**：执行中若需触 §3 任何域（产品码/withhold 码面/sse.ts/既有通道改写/行数越帽）→ 停手上报（W2 拆点若判必要=另立微刀 · 不得就地扩域）。
4. **验收红不可修**：A/B 两段任一门红且无法在本刀范围内归因修复 → 停手上报（Ban 为绿放宽门——含 Ban 放宽 lint cap/typecheck/ledger 帽）。
5. **LIVE 边界**：EXEC 期判别 run 前协调方 LIVE 授权未落字 → 判别 run 停摆（静态门 B1-B5 可先行）· Ban 未授权先跑。

---

## §9 pre-exec dual 交接（预留 · 本节零 SSOT 触碰）

- **双审对象四件**：§0 全节（blob 锚表 14 锚+读码三项 0.2a/0.2b/0.2c）· §1 修法逐处定稿（行形总纲 `reviews.record` 形裁定+面① +5/面② +12 逐行+ledger 26≤32 算术+W2 scope-out）· §1.3 八款否决· §2 门矩阵 A/B 两段判据。
- **悬决项（归协调方）**：EXEC 排程 · 判别 run LIVE 授权（两票分立 §8-②）· 判别 run 与案 B post-prove 双审的排程先后。
- **本卷落卷后事实基座不受后继裁决影响的部分**：§0 全节读数系读数登记（原值记账零冲销）。

### §9-EXEC EXEC 席执行记录（码面 面①+面② · 2026-10-16 EXEC 席落卷 · append 保史 · §0-§8 上文零字洗改——P2-A/P2-C 系 pre-exec 双审会签裁决「随 EXEC 落」的定点修正+STOP 翻面系状态字段行使非洗改 · 席位=协调方派单 EXEC 席）

- **① 授权链**：起草 `ac6877a0`（STOP=`draft:awaiting_pre_exec_dual`）→ pre-exec 双审会签 **PASS**（两独立外席 · 席1 `agent_0fbcaf64`+席2 `agent_d595e5cd` · P2×4 随 EXEC 落）→ 协调方 EXEC 授权（P2×4 随 EXEC 行使）→ 本席 EXEC 落卷。alone ≠ dual 全程未犯 · Ban self-approve 未犯 · **LIVE 跑数零行使**（EXEC 授权≠LIVE 授权两票分立 · 判别 run 零实跑零 e2e:isolated 行使 · B6/B7 归 LIVE 授权后工序如实留待 · 红形零漂移基线由改前核承载）。
- **② 序1 并线**：`git fetch`+`git merge --no-ff origin/feat/mysql-schema-skeleton`——fetch 后 origin tip=`24b75b17`（5e-cleanup-sweep nail 波 · 派单下界「届时 tip≥3cd159dd」以严格大于成立）→ **merge=`42dfe8e7`**（双亲 `ac6877a0`+`24b75b17` · ort 零冲突 · 冲突沿并集解预置未触发 · ⛔pull --rebase 未用）。
- **③ §0 全量重 pin（对 merge 后树 `42dfe8e7` 亲证 · P2-D 登记臂之一）**：§0.1 十三锚（#1-#13）`git ls-tree` 逐一重算 **blob 全数恒等零漂**（`62c5e620`/`e585e85f`/`4cb481aa`/`4aee4a29`/`f41719a2`/`102d0f3a`/`e748be25`/`01127803`/`40394984`/`0787a7ff`/`841e8666`/`8fce8a66`/`4aa060e1`）· 跨支 #14 诊断卷 `790be3dd`@`7521e57d`（`line/g7w-tail-diag` 本地支亲证恒等）——十四锚零漂移故 §0.1 表零字改 · 关键行锚对 blob 恒等树逐行亲读全中（`backlog :108` P1 OPEN 原文 intact · checklist `:1559`/`:1670`/`:1905`/`:3113`/`:3142` · full.e2e `:35`/`:190`-`:214`/`:216`-`:220`/`:222`-`:251`/`:247`-`:248`/`:592`-`:608`/`:609`-`:620`/`:627`-`:647` · interview.ts `:59`-`:72`/`:290`-`:385` · failure-class `:32`/`:55`/`:322` · proof `:339`-`:349` · guards `:97`-`:106` · parity `:19`-`:22` · policy `:102` MAX_FILES=2_200）· 停止条件① 未触发。
- **④ P2×4 行使落点**：**P2-A** §0.2b 帧字段白名单补 `reportStatus`/`outcome` 两词（F2/F5 帧实发字段对白名单对齐 · 定点修正随 EXEC 落 · 本⑦转录同值防口径分叉）；**P2-B** 代码落点=F2 帧 `elapsed_ms` 基准钉 `Date.now()-interviewStartedAt`（同 F1）+F5 帧 `t_ms` 基准钉 `Date.now()-capT0`（`:35` boot 区）——两钉随面② 帧行尾注记载明；**P2-C** §2-B4 判据窗改「面① ∈[2,8]·面② ∈[9,15]·合计 ∈[11,23]∩硬帽 ≤25/−0」（定点修正随 EXEC 落 · 实测见⑧）；**P2-D**=⑥ 树面分叉甄别登记。
- **⑤ 面①+面② 落卷实绩（numstat 实测）**：面① `e2e/helpers/interview.ts` **+5/−0**（S1=InterviewLoopResult type 尾 `batchWallClock` 字段行〔「`:72` 后」锚按 type 尾语义机械落于闭括号前=`:71`/`:72` 边界 · ±3 浮动内 · typecheck 绿为机械判据〕+S2a `:304` 后+S2b `:307` 前+S2c `:308` 后+S3 return 增 `batchWallClock,`）· 面② `e2e/full.e2e.ts` **+15/−0**（修法行 12=H1 helper 1+R1-R6 6+F1-F5 5 · 另 3 行系行内豁免注释见⑨(a)）· 行形=`reviews.record({ class: 'worker', code: 'seg3_*' })` 6 枚全过 CODE_RE 非 opaque（Ban emitE2EFailure 未犯 · Ban class 伍 worker 外族称未犯）· 帧 5 帧走 `.tmp/e2e-seg-emit.ndjson` 新通道（appendFileSync+防自伤 try/catch `:248` 同形 · 零改写既有两通道字节 · `git check-ignore` 双命中亲证）· 零 A() 断言触（零增零减零改）· 零第三码面（sse.ts 零触）零产品码零迁移零 spec 零夹具。
- **⑥ P2-D batch1-residual 树面分叉甄别登记（随 EXEC 收据记一笔）**：merge 后亲证 `git merge-base HEAD origin/main`=`112e6d26`=origin/main tip 本身 → **origin/main 系本树祖先**（起草卷「origin/main 另 lineage 不含本基线」的分叉形态已被 `24b75b17` 并线波消化为零残差 · 无悬空分叉）· HEAD（merge 后）↔origin/main 残差树面=`git diff --name-only` 实测 **48 文件**全数属支树独有 commit（cap sanction `3cd159dd`+5e nail 波 `24b75b17`+本卷系）· **本刀两码面（`e2e/full.e2e.ts`/`e2e/helpers/interview.ts`）对双 lineage 逐字节恒等零交叠**——甄别结论=batch1-residual 无本刀域内残差，判别 run 收据面零跨线污染源。
- **⑦ ledger 容量算术复算（B5 · 对 merge 后树）**：现树静态 `reviews.record` 15 枚（capability 3=ocr×2 互斥分支+voice×1 → 最坏可发 2 · seg/seg2 12）+`recordTerminal` 6 → **worst-case 20**（与起草算术恒等）+新增 seg3 6=**26 ≤ REVIEW_LEDGER_LIMIT 32**（余量 6 · 停止条件② 未触发）· P2-A 补词转录：F2 帧字段=`step/status/reportStatus/elapsed_ms`、F5 帧字段=`step/status/outcome/t_ms`（均界白名单内 · 零 answer/prompt/token/key 值）。
- **⑧ 门矩阵（本席亲跑）**：B1 `pnpm typecheck`（=tsc -p tsconfig.e2e.json）**EXIT=0** · B2 `pnpm lint`（--max-warnings 5235）**EXIT=0 5235 warnings=cap 恰等基线**（新增零 warning 亲证：两文件改前 65=改后 65 · 5238→5235 修复轨迹见⑨(a)）· B3 绿形零漂移全绿=e2e-helpers:prove **EXIT=0（28 scenarios）**+e2e-static-guards:check EXIT=0+e2e-parity:check EXIT=0+e2e-parity:prove EXIT=0+e2e-case-inventory:prove EXIT=0+e2e-platform:check EXIT=0 · docs:check **EXIT=0 2186 managed ≤ cap 2200**（余量 14）· markers 五类改动集零命中（词面运行时组装防自匹配 · 卷内不复抄）· B4 diff 面=恰 2 tracked 码面（interview.ts +5/−0+full.e2e.ts +15/−0=合计 20∈[11,23]∩≤25 · 面① 5∈[2,8] · 面② 15∈[9,15] · −0 硬）+本卷 .md（commit 后 `git show --numstat HEAD` 终核）· B6/B7=判别 run 工序本席零行使如实留待（LIVE 授权归协调方）。
- **⑨ 偏离清单（理想零 · 实一 · 不改修法实质）**：(a) F1/F2/F5 三帧对象字面量 `elapsed_ms`/`t_ms` wire 字段名各触 `@typescript-eslint/naming-convention` 新 warning（×3 · B2「新增零 warning」判据+cap 5235 恰等零余量被破·初测 5238>5235）——处置=3 行 `// eslint-disable-next-line @typescript-eslint/naming-convention --` 行内豁免（wire 字段名系 §0.2b 白名单契约+consent-capture 同族先例·非代码标识符不可改名 · `apps/api/test/authz34-chunked-cap.proof.ts:47` 先例同形同理由）· 面② +12→**+15**（P2-C 窗 `∈[9,15]` 界内 · 合计 20∈[11,23] · 硬帽 ≤25 内）· 复测 lint EXIT=0 5235=cap · wire 字段名零改白名单契约保全。
- **⑩ STOP 终态**：**`executed:awaiting_post_prove_dual`**（三处实测一致=Status 头/§8/卷尾）——post-prove 双审两独立外席待派 · alone ≠ dual · 判别 run LIVE 授权归协调方两票分立 · 本席 ⛔push ⛔merge 主线 ⛔force push 未用 · est live=0（本 EXEC 零外呼零容器零 DB）· `actualSpendCny=null`。

### §9-补 post 双审随卷注记（2026-10-16 nail 席·post 双审会签 PASS 授权（席1 agent_6fa5594e+席2 agent_92ba2912）·append 注记形·§0-§9 上文零字节洗改·席1 无 P2·席2 零必改）

- **post 双审会签 PASS（席1 agent_6fa5594e+席2 agent_92ba2912）**：席1 **无 P2**·席2 **零必改**——两席观察面零新增修订落点·本卷 §0-§9 正文零触碰（本节=唯一 append）·LIVE 判别 run 两票分立未行使（行使权归协调方·判别 run est live≈7 账本口径 §0.2c 在卷）·静态门终态维持 EXEC 落卷值。

---

*nail 落卷 2026-10-16·post 双审会签 PASS（席1 agent_6fa5594e+席2 agent_92ba2912·席1 无 P2·席2 零必改）后协调方派单 nail（本波唯一主线推送席·随 API-HARDEN nail 波顺携并线）·序1 merge --no-ff line/g7w-tail-seg-emit@`30493162` 入主线（merge `51a06265` 零冲突 3 files +243·merge-tree 预演 EXIT=0·merge-base `24b75b17` 亲证·⛔pull --rebase 未用）∥序2 本卷 §9-补 post 随卷注记一件（append 注记形上文零洗=双 PASS 无 P2 零必改观察+LIVE 两票分立未行使登记）∥序3 SSOT 三处随卷（LEDGER 刀位图 G7W-TAIL-DEATH 案 A 埋点刀行+配套管线 g7w-tail-seg-emit nail 行+checklist「Line g7w-tail-seg-emit nail」段·支线树内改主仓路径文件随支线推·⛔主仓单独 commit 未犯）∥est live=0（本 nail 零外呼）·actualSpendCny=null·⛔force push 未用·⛔pull --rebase 未用*

### §9-LIVE LIVE 判别 run 执行记录（判别 run 恰 1 · 2026-10-17 LIVE 席落卷 · append 保史 · §0-§8+§9-EXEC 上文零字洗改 · 状态字段未触归协调方 · 席位=协调方两票分立第二票 LIVE 判别 run 授权席）

- **① 授权链与行使形**：协调方两票分立第二票=LIVE 判别 run 授权（EXEC 授权已行使·EXEC 落码零 live·STOP=`executed:awaiting_post_prove_dual` 维持）→ 本席恰 1 run 行使——`pnpm e2e:isolated`（=run-e2e-isolated.mjs e2e:prove·CMD1 单 attempt·Ban retry-to-green 未犯）· loader 方式 b（`~/.meetwise-secrets/load-model-api-key.sh` 进程 env 注入·零 .env 落盘·仓根 .env 不存在亲证·wave75 先例形）+`E2E_SKIP_DOTENV=1` 基线等价形+`G7_FREETIER_REPROVE=1` 账本臂（§2-B7）。判别 run 在支线树行使（本刀未 nail 落主线·埋点帧收割用·非 CI 面）· 行使前核=git status 净+HEAD=`30493162` 恰等+worktree 恰本树 · 窗 2026-10-17 00:51:17–01:00:40 +0800。
- **② run 终局**：**EXIT=1 · `E2E_FAILURE_CLASS class=api`** · 迁移 applied=204 skipped=0（链头 0204 与 §4 恒等）· boot/post-migrate/pre-probe 三探 3×绿 · `ISOLATED_POSTGRES_OUTPUT_WITHHELD`（withhold 契约按设计行使·state_bytes=216 logs_bytes=1587）· 容器 runner finally `docker rm -f` 自清。
- **③ seg-emit NDJSON 五帧首采（`.tmp/e2e-seg-emit.ndjson` · 恰 3 帧落盘）**：F1 `seg3_mainloop` terminal=**report_ready**·questions=2·turns=4·elapsed_ms=**31083**·batches 15 批（tMs≈1202ms hold-and-tail 窗×14+末批 20ms·kinds=question_ready×2+clarification_needed×2+answer_evaluated×2+session_concluded+report_ready）· F2 `seg3_main_report` status=200·reportStatus=**ready**·elapsed_ms=31091 · F3 `seg3_7a_loop` terminal=**report_unavailable**·questions=3·turns=5·batches 28 批（generation_started/progress 流式带在帧·末批 380ms）· **F4/F5 未出**（死亡先于 :631/:642）· consent-capture 通道仅 consent 1 帧（app_start 帧 :589-:601 未达）→ **死亡窗 bracket=:249（F3 已出）..:575-:589（M5/app_start 未达）=7b 押题/诊断→step8/9→R1-R3 段域**——「静默窗归因由仪器直读」（diag 卷修A 原文）首次兑现为段位级 bracket。
- **④ B7 账本臂实测（est-not-counter · `.tmp/g7-ledgers/g7-19846-1792169477224.ndjson` 49 行）**：reservation 17+release 17+call 15——**succeeded=15**（actualModel 全数 qwen3.8-flash·estimatedCostCny 累计 0·free_quota_wiring_only）+**failed=2**（`rsv_…587818`/`rsv_…632118`·~30s release 无 call 行=调用失败形）· **est live≈7（老红账本口径）→ 实测 17**：超预估如实登记·归因=本 run 走得比老红远（主旅程绿+7a 绿+7b 带生成）· 链累计 g7p6 126+17=**143 ≤ 硬帽 200** · 账本时间线=末模型活动 16:54:32.979Z → 其后 **6min03s 零模型零帧** → class=api 终局。
- **⑤ 判读三则**：(a) **老红 38013ms 簇主旅程尾死形未复现**——主旅程 31.08s 达 report_ready（F1/F2 直读·report 200/ready）· 老红形状（38s 簇+末 DB 活动→~12s 静默→uncaught throw 于主旅程尾）不在；(b) **report_unavailable 期望形按设计复现**——7a 隔离段 F3=report_unavailable 且 :259-:260 断言面越过（quarantined）；(c) **新 api 红现于不同段位**——class 族与老红同（api）·死亡段位（7b 后带）/时长（~9min）/形状（6min03s 零活动后终局）异·class=api 具体 code 不可回读（红面子进程 stdout 仅 runner 解析不落盘·withhold 契约面）——判别信息已得=死亡在 7b 后带非主旅程尾·段位 bracket 交协调方裁后续。
- **⑥ seg3 六枚 ledger 行落盘实况**：R1-R4 证实已执行（帧发射点位证据：F1 出于 R2 后·F3 出于 R4 后）· R5/R6 未达（死亡先于结算段）· **六行未持久化**——红路 reviewLedger 未落盘（见⑦收据门失败）+红面子进程 stdout 弃（withhold 契约面）· E2E_FAILURE 行零新增系 seg3 行未触红面 class（class=api 来自旅程本体·Ban emitE2EFailure 未犯·B6 红形判读族同基线）· 断言计数面因死亡不完整如实记。
- **⑦ 收据写盘失败登记（runner 既有机制冲突·非本刀域·本席零触）**：`LOCAL_E2E_RECEIPT_FAILED reason=local_e2e_receipt_g7_actual_model_required`——`scripts/local-e2e-receipt.mjs` optionalG7Fields 要求 calls[] 每行含 actualModel 字符串，而 `G7_RUN_COST_LEDGER` 账本行形=reservation/release/call 三行组（reservation 行仅 `model` 字段）→ 任一 `G7_FREETIER_REPROVE=1` 的 e2e:prove run（**含绿 run**）收据写盘必炸→EXIT 翻 1。本 run 红 EXIT=1 先于收据失败独立成立；该冲突使绿面亦被翻红，归 runner 域待另立登记（§3 范围外·本席不停手因不属本刀门判据面）。
- **⑧ C-MO-P3 算术在验通过**：`identities.length === questions + clarifications`（:210-212）断言面越过=identities 4=questions 2+clarifications 2 ✓（F1 turns=4 与 kinds 计数恒等·澄清重发 identity 计数 vs 零澄清假设解耦形首次 live 实采成立）。
- **⑨ 偏离清单（理想零·实零）**：est live≈7→实测 17 系 est-not-counter 口径内实测值如实记账非偏离；恰 1 run/Ban retry-to-green/Ban 只留绿 attempt 未犯 · ⛔push ⛔merge 主线 ⛔force push 未用 · tracked 翻动=恰本卷 .md append 一件 · 收割数据全落 `.tmp`（gitignored·`live-discrim-console.log`+`g7w-live-discrim-harvest.md`+`e2e-seg-emit.ndjson`+`e2e-consent-capture.ndjson`+g7-ledgers 49 行）· 孤儿容器 `meetwise-e2e-49091-*`（先前会话副产·属主 PID 已灭）本席清理归位。

---

*G7W-TAIL-SEG-EMIT REQUEST · 2026-10-16 起草 · **`executed:awaiting_post_prove_dual`**（EXEC 席 2026-10-16 终态翻转 · 原 `draft:awaiting_pre_exec_dual` · merge `42dfe8e7` 并 `origin/feat/mysql-schema-skeleton@24b75b17` · 静态门全绿 · LIVE 零行使）· ⛔push ⛔merge 主线 · alone ≠ dual · base `feat/mysql-schema-skeleton` @`3cd159dd`（=fetch 后 origin/支树 tip 恰等派单下界「origin tip≥3cd159dd」以等号成立 · EXEC 期 fetch 后 tip=`24b75b17` 严格大于成立 · origin/main `112e6d26` 经 `24b75b17` 并线波已证系本树祖先——起草期「另 lineage 分叉」形态消化为零残差如实承登 §9-⑥）· worktree `meetwise-g7a` · branch `line/g7w-tail-seg-emit`（建前零同名树/同名分支/同名卷三查亲证）· 立项出处=协调方派单令+backlog `:108`/`:796`/`:800`/`:840`/`:842`+checklist `:1559`/`:1670`/`:1905`/`:3113`/`:3142`+诊断卷 `790be3dd`@`7521e57d` 修A 全文+案 B 卷 `4aa060e1` 域界书 · 读码三项=driver 面盘点与五点插位（0.2a）+NDJSON 同族缝 `.tmp/e2e-seg-emit.ndjson`（0.2b）+est live≈7 账本实测口径与 LIVE 分票（0.2c）· 修法=面① interview.ts +5/−0（批级 wall-clock W1/W3）+面② full.e2e.ts +12/−0（seg3 行 6 枚+帧 5 帧+helper 1 枚 · W4/W5）· 行形=reviews.record→E2E_REVIEW（Ban emitE2EFailure 机制钉）· 合 +17/±3/−0 硬帽 +25/−0 · ledger 26≤32 · 零 A() 零 withhold 零产品码零第三码面 · 门矩阵=A 段起草三锚（docs:check 2185≤2200+markers+diff 恰 1）+B 段 EXEC 七门（typecheck/lint/绿形零漂移/码面 diff/ledger 算术/红形零漂移/账本臂）· 迁移号=零 · 起草 est live=0 · 判别 run est live≈7（LIVE 授权另行 · 两票分立）· pins 十一值照抄 · markers=0 · 停止条件五类全设 · Ban self-approve · pre-exec dual ≠ 开工 · STOP*

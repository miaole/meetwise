# G7W-DIAG-NEEDLES REQUEST（G7W 新红诊断席修复建议① · 判别加针刀 · P1 · 零产品码判别面三针 · 协调方派单起草 · 码面 EXEC 期落卷 · 起草落卷即停零码动）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 席落卷翻面 2026-10-16 · 前值 `draft:awaiting_pre_exec_dual`=起草+rev+rev2 史录 · 三码面 +10/−1 落码·merge-forward `8c4d60ea`（origin tip `10799a3e` 等号亲证）·门矩阵 A/B 全绿（§9-exec）· post-prove 双审两独立外席待派 · alone ≠ dual · ⛔push · est live=0 · `actualSpendCny=null`）〔前值原文：**`draft:awaiting_pre_exec_dual`**（起草席落卷 2026-10-16 · 起草期零码动零 live · 改动集恰 1 .md · docs:check EXIT=0 2194≤cap 2200 + markers 五类零命中 + diff 面恰 1 新件三收据亲跑 · pre-exec 双审两独立外席待派 · alone ≠ dual · ⛔push ⛔merge 主线 · Ban self-approve · est live=0 · `actualSpendCny=null`）〕

**席位**：G7W 新红诊断席修复建议①「判别加针刀」起草席（协调方派单令 · 承 `line/g7w-tail-seg-emit@62ffaffa` §9-LIVE 判别 run 新红 api（class=api 具体 code 不可回读 · 死亡窗 bracket `:249..:575-:589` 段域级）· 本卷=该诊断席三条修复建议之①的独立行使（建议②③如派单令同文三针——① R2 循环退出即 segEmit ② batchWallClock 心跳中途落盘 ③ 红路 tsx stderr 尾量入 .tmp 侧通道——三针同属判别面 harness/runner 域并一卷行使·零产品码））。
**基线**：`feat/mysql-schema-skeleton` @ **`d5dc0726`**（fetch 后亲证 origin tip `origin/feat/mysql-schema-skeleton` = `d5dc0726` **恰等派单下界「origin tip≥最新」**（ai-graphs 环解 nail 波 tip · 该波顺携 queue-enqueue-bp/g7w-tail-seg-emit §9-LIVE 两并线）· `origin/main`（`112e6d26`）系已消化祖先线形沿姊妹卷 §9-⑥ 承登）· worktree **`meetwise-gdn`**（仓根同级 · `git worktree add ../meetwise-gdn -b line/g7w-diag-needles` 本起草席立 · 起点=origin tip `d5dc0726` 非主仓本地 HEAD）· branch **`line/g7w-diag-needles`**。
**立项出处（不自建 SSOT 行——行翻面权沿例归协调方）**：①协调方派单令原文三针（「①R2 循环退出即 segEmit（step:'seg3_r2_loop_exit'·terminal/questions/batches:len·:519 前——下轮直接钉死 deadline 到期形）②driveInterviewToTerminal 每 N 批 flush 心跳帧（batchWallClock 已收集只差中途落盘）③run-e2e.mjs 红路把 tsx stderr 尾量写入 .tmp 侧通道（现 :181-:198 弃·A() 消息不可回读即此因）」·「下一 LIVE 前置」定位原文）；②判别 run 新红证据基座=`harness/g7w-tail-seg-emit-REQUEST.md`（blob `62ffaffa`）§9-LIVE（⑤(c)「class=api 具体 code 不可回读（红面子进程 stdout 仅 runner 解析不落盘·withhold 契约面）」+③ 死亡窗 bracket `:249..:575-:589` 段域级恰罩 R1-R3 段+F4/F5 未出）；③backlog `:108` GAP-G7W-API-TAIL-DEATH 行 P1 OPEN 维持（blob `62c5e620` · 翻面权归协调方 · 本卷零触行本体）；④**埋点/侧通道先例链**：案 A 埋点刀 seg3 六码五帧（LEDGER `:493` ✅ nail · checklist `:3281` 段）· G7P-6 7a_diag 红时补抓+diag_failed 防自伤形（`harness/g7p6-7a-diag.md`）· consent-capture 无条件步进帧族（full.e2e `:38`-`:40`）· 案 B 面③ scoped readback 另立登记（LEDGER `:484` · 本卷针③系 runner 红路判别面非 scoped readback 契约面·域界见 §3）；⑤**结构范本**=案 A 卷 `62ffaffa`（§0/§1/§1.3/§2/§5/§8 形制承之）。

---

## §0 现状锚（起草席亲证 · 全部 rg/Read/sed/git ls-tree/check-ignore 实测 @`d5dc0726` · 后继 pre-exec dual/EXEC 面照本节对届时 tip 再重 pin——blob 漂移如实改锚·结论不变则只更行号；行锚漂移超 ±3 且结论受影响 → §8 停止条件①）

### 0.0 防重双对表（本 turn 实测）

- `git worktree list`：`meetwise-gdn` 名下**恰 1 树**=本树；`git branch --list "line/g7w-diag-needles"` 恰 1 命中=本席分支 · 零同名。
- `ls ai-docs/delivery/harness/ | grep g7w-diag-needles` 落卷前**零命中**（无同名卷）；与案 A 卷 `g7w-tail-seg-emit-REQUEST.md`/案 B 卷 `g7w-tail-contract-ruling-REQUEST.md`/诊断卷 `g7w-tail-diag-REQUEST.md` 卷名/分支名均不同名、域相承不重叠（案 A=循环出后帧+wall-clock · 本卷=循环内心跳+R2 退出帧+runner 红路尾量——三针恰补案 A 卷 §9-LIVE 实测暴露的三个仪器缺口，见 0.2a）。
- `git check-ignore .tmp/e2e-seg-heartbeat.ndjson .tmp/e2e-tsx-stderr-tail.ndjson` **EXIT=0 双命中**（`.gitignore:15` `.tmp/` 全族 gitignored 非受管 · 本卷新两通道沿此）。

### 0.1 blob 锚表（`git ls-tree` 亲算 · 8 hex · @`d5dc0726` 亲读）

| # | 文件 | blob | 关键行锚（@`d5dc0726` 亲读） |
|---|------|------|------|
| 1 | `e2e/full.e2e.ts` | `fe21414b`（905 行 · 案 A 落码后值） | `:35`（fs/bootId/capT0+.tmp mkdir）· `:36`（**segEmit helper=H1 先例行**·appendFileSync+防自伤 try/catch）· `:191`-`:207`（主旅程 driveInterviewToTerminal+R2 记录+F1 帧）· `:229`-`:249`（7a 段+F3 帧）· `:249`-`:258`（7a_diag 红时补抓+diag_failed 防自伤形）· `:480`-`:523`（**R2 歧义 P1 全旅程段**：`:510`-`:518` r2Loop 调用 · **`:519` `if (r2Loop.terminal) reviews.recordTerminal(...)`=针①插位前界** · `:520`-`:522` 断言面=A() fail-fast 面）· `:631`（F4 boundLoop 帧）· `:638`-`:642`（R5/F5 结算段） |
| 2 | `e2e/helpers/interview.ts` | `1b2a87e8`（390 行 · 案 A +5 后值） | `:1`（import crypto——**针② import 加行位**）· `:6`（`INTERVIEW_TERMINAL_DEADLINE_MS = 420_000`）· `:269`-`:283`（InterviewLoopOptions type · **`:284` 空行=H0 helper 插位**）· `:291`-`:390`（driveInterviewToTerminal）· `:305`（`const started`）· `:306`（**batchWallClock 收集器=案 A S2a**）· `:308` while · `:309` batchT0 · `:310` readSseEvents · `:312`（**batchWallClock.push=案 A S2c——针② S2d flush 插位**）· `:378`（`if (terminal) break;`）· `:379` sleep(1000) · `:382`-`:389`（return · `:388` batchWallClock 随结果） |
| 3 | `scripts/run-e2e.mjs` | `f55330b1`（205 行） | `:8`（`import { readFileSync, existsSync, mkdirSync } from 'node:fs'`——**appendFileSync 加词位**）· `:83`-`:89`（tailAppend 字节计数=api/worker 两路 withhold 保全面 · **零触**）· `:95`-`:101`（run() forwardOutput 门=E2E_VERBOSE 门）· `:181`-`:198`（**红路弃段=针③域**：`:183`-`:185` tsx spawn(forwardOutput=false) · `:186`-`:187` tsx stdout/stderr 无条件转发**且即弃零落盘** · `:188`-`:192` Promise.race(worker/api exit race) · `:193`-`:195` 字符串臂 throw worker/api_exited · `:196` `if (code !== 0) throw tagE2EFailure('api','client_exited')` · `:197`-`:198` 绿路 cleanup+exit(0)）· `:200`-`:205`（main().catch=emitClassifiedE2EFailure+emitFailureDiagnostics 字节计数打印）· `:59`（`${ROOT}/.tmp/g7-ledgers` .tmp 路径拼接先例） |
| 4 | `e2e/helpers/assert.ts` | `975fbb38` | `:14`-`:16`（**A() 失败路径=emitE2EFailure ledger 行+`console.error('✗', msg)` 入 stderr+`process.exit(1)` fail-fast**——A() 消息只存在于 tsx 客户端 stderr 流=针③ 回读对象 · 零触） |
| 5 | `e2e/helpers/failure-class.mjs` | `102d0f3a` | `:55` `REVIEW_LEDGER_LIMIT = 32`（ledger 容量硬界——本卷**零新 ledger 行**故 26≤32 算术原样维持·案 A 卷 §1 核算承之）· `:322`-`:324`（success_with_failure_class 拒收=Ban emitE2EFailure 埋点形机制根据承之） |
| 6 | `ai-docs/delivery/harness/g7w-tail-seg-emit-REQUEST.md` | `62ffaffa` | **§9-LIVE**（③ 五帧首采+F4/F5 未出+死亡窗 bracket `:249..:575-:589` ⑤(c) class=api 具体 code 不可回读=本卷三针证据母本）· §0.2b（NDJSON 同族缝/字段白名单/防自伤形/「driver 进程内写盘=非子进程 stdout·不触 withhold 契约」判读=本卷新两通道形制源） |
| 7 | `ai-docs/delivery/gap-bug-backlog.md` | `62c5e620` | `:108` GAP-G7W-API-TAIL-DEATH 行 P1 OPEN 原文 intact（本卷域内授权行 · 零触）· `:800` 案 B 勘误注（「埋点」肢不灭失） |
| 8 | `ai-docs/delivery/execution-master-checklist.md` | `2e744da0` | `:3281`「Line g7w-tail-seg-emit nail」段（案 A SSOT · 本卷零触零改写）· `:3164` 案 B nail 段（域界参照） |
| 9 | `ai-docs/delivery/harness/product-campaign-LEDGER.md` | `b4bc1838` | `:493` 案 A 埋点刀行 ✅ nail · `:484` 案 B 契约裁定刀行 ✅ nail（面③ scoped readback 另立登记=本卷 §3 域界书）· `:570` g7w-tail-seg-emit nail 管线行（本卷零触零改写） |
| 10 | `scripts/e2e-static-guards.mjs` | `01127803` | interview.ts AI-path 契约（questionIdentity 五 required+invented questionId forbidden=针② 新增行零触面）· full.e2e 契约（driveInterviewToTerminal 调用+scorelessBound 钉=针① 新增行零触面）· credential 形扫=新增行禁区（三面新增行零 credential 形）· run-e2e.mjs 在 REQUIRED_EVIDENCE_HELPER_PATHS（已受扫·针③ 新增行同受扫） |
| 11 | `e2e/helpers/e2e-helpers.proof.ts` | `e748be25` | `:339`-`:349`（full.e2e 源码锁 8 正则=presence 禁删面——纯新增行零触）· `:14`（import interview.ts=proof 只 import 纯函数不跑循环→心跳代码 proof 零执行路径） |
| 12 | `scripts/e2e-parity-check.mjs` | `40394984` | `:19`-`:22`（full.e2e binding needle `'assert: A'`=针①零触面） |
| 13 | `scripts/run-e2e-isolated.mjs` | `0787a7ff` | 父层隔离 runner（run-e2e.mjs 的父进程 · 其对 runner stderr 的 withhold=新红 code 不可回读的结构性成因面 · **本卷零触**——针③在 runner 进程内先落盘后 throw=父层 withhold 语义零改而回读面达成·案 B 面③ scoped readback 另立域不并入） |
| 14 | `scripts/ai-docs/public-text-policy.mjs` | `841e8666` | `:102` `MAX_FILES = 2_200` · 起草基线 docs:check 实测 **2193 managed ≤ 2200**（余量 7 · EXIT=0 亲跑 · 落卷后预期 2194 ≤ 2200 余 6 · 本卷系唯一新增受管件） |

### 0.2 读码三项（派单任务 2 · 起草席亲读定稿）

#### 0.2a · 新红三缺口判读（三针=恰对三缺口 · 逐一亲证）

| # | 缺口（新红证据基座=案 A 卷 §9-LIVE） | 现树仪器状态亲读 | 针 |
|---|---|---|---|
| G-α | **死亡窗 bracket `:249..:575-:589` 段域内零循环级帧**——F1/F2（主旅程 `:207`/`:226`）·F3（7a `:249`）已出·F4/F5（`:631`/`:642`）未出·bracket 罩住 7b→step8/9→R1-R3 全段；其中 **R2 全旅程循环（`:510`-`:518`）现零 segEmit 零 ledger 帧行**（五帧 F1-F5 全在 main/7a/bound/finalize · R2 段仅 `:519` recordTerminal 一枚 ledger 行） | 若新红死亡在 R2 循环内（含 420s deadline 到期 `terminal=''` 形——`:308` while 环尽零 terminal 即静默返回），环内零帧零读数、环出仅 recordTerminal 一行且**不区分 deadline 到期形与终态形** | **针①** |
| G-β | **batchWallClock 已收集只差中途落盘**——案 A S2a-c（`:306`/`:309`/`:312`）逐批 tMs+kinds 在内存累积，唯二落盘点=循环出后的 F1/F3/F4 帧与 return 值；进程级死亡（deadline 到期后被 runner race 臂 SIGKILL、worker/api exit race、uncaught throw）时 in-memory 全弃 | 老红「~12s 静默窗」（checklist `:1365` 末 DB 活动→receipt 终点）与新红「6min03s 零模型零活动」（§9-LIVE ④）两形状的**窗内批级直读**均缺位——若批 hang（readSseEvents 停针）帧永不出 | **针②** |
| G-γ | **红路 tsx stderr 即弃**——`:187` tsx stderr 无条件转发进 runner 自身 stderr 流但**零落盘**；A() 失败消息（assert.ts `:15` console.error→stderr）与失败 class 码只存在于该流；隔离形下 runner 系 run-e2e-isolated.mjs 子进程，其 stderr 受父层 withhold（`ISOLATED_POSTGRES_OUTPUT_WITHHELD` 同族）——§9-LIVE ⑤(c)「class=api 具体 code 不可回读（红面子进程 stdout 仅 runner 解析不落盘·withhold 契约面）」的结构性成因 | `:193`-`:196` 两红臂 throw 前**无任何落盘动作**（`:200`-`:205` catch 臂 emitFailureDiagnostics 亦只打印字节计数 `:92`）→ run 终局后 A() 消息不可回读（容器即毁/CI 截断/流交叠三态皆然） | **针③** |

#### 0.2b · NDJSON 通道缝（案 A §0.2b 同族形 · 新两兄弟通道）

- **同族形**：`fs.appendFileSync('.tmp/<channel>.ndjson', `${JSON.stringify({ bootId, step, ... })}\n`)`+防自伤 try/catch（full.e2e `:36` H1/`:258` diag_failed 先例同形）· 在树四缝（consent-capture/7a-diag/seg-emit/g7-ledgers）+本卷**新二缝**=`.tmp/e2e-seg-heartbeat.ndjson`（针②）+`.tmp/e2e-tsx-stderr-tail.ndjson`（针③）——**零改写既有四通道字节**（G7K/G7W 诊断工具对既有通道消费面零扰动）· 双通道 check-ignore EXIT=0 亲证（0.0）。
- **通道性质**：两缝均为**判别面进程内写盘=非子进程输出捕获**——针② 在 driver（tsx/full.e2e）进程内、针③ 在 runner（run-e2e.mjs）进程内 throw 前落盘，均沿案 A §0.2b「driver 进程内写盘不触 withhold 契约」判读；**api/worker 两子进程输出仍仅字节计数（`:83`-`:89` tailAppend 零触）**=withhold 保全语义零改。
- **帧字段白名单**：心跳帧=`bootId/step/interviewId/batches/lastSeq/questions/elapsedMs`（全标量 · camelCase 沿 batches 项 `tMs` 在树同族 · **零 eslint naming-convention 新 warning 面**·零 answer/prompt/token/key 值/interviewId 系服务端发放 id 沿 7a_diag `:257` 在树先例）；尾量帧=`bootId/step/exit/tailBytes/tail`（`tail`=tsx 客户端已公开流字节的有界副本——见针③ 行形总纲 · JSON.stringify 转义 NDJSON 安全）。
- **判读口径**：心跳帧按 bootId 分组、interviewId 区分四循环（main/7a/R2/bound 各 interviewId 互异）、`batches` 递增对 `elapsedMs` 作差即批间 delta；尾量帧每 run 红时恰 1-2 帧（两红臂 `:193`-`:196` 互斥·先到先落）。

#### 0.2c · est live 口径（起草=0 · EXEC/判别 run 归协调方）

起草 turn 全只读（rg/Read/sed/git/check-ignore/docs:check/markers——全本地零外呼零容器零 DB）——**起草 est live=0 · `actualSpendCny=null`**。EXEC 期静态门族全本地零外呼；判别 run（「下一 LIVE 前置」钉死形 run）**LIVE 授权归协调方另行两票分立**（沿案 A EXEC 授权≠LIVE 授权先例）· 参考值如实登记：案 A 判别 run 账本实测 17（est-not-counter·§9-LIVE ④·链累计 143≤硬帽 200）——本卷判别 run 跑数以届时账本实跑值为准非本卷预估，链累计沿硬帽 200 口径如实另账。

## §1-修法（三针逐处定稿 · 恰 3 码面 +9/±3/−0 · 硬帽 +20/−0 · EXEC 期落卷 · 本起草卷零码动）

**行形总纲（零产品码 · 判别面 harness/runner 三面）**：三针全部为**纯新增埋点行/侧通道行**——零 A() 断言增减改、零驱动逻辑语义变更、零产品码（apps/packages 全域）、零迁移、零 spec/夹具、零既有通道改写。判别面=case A 卷同族「e2e harness（面①面②）+runner（面③）」；面③ 系**红路判别面加针非 withhold 契约语义变更**（api/worker 字节计数保全零触·转发语义零改只加有界副本落盘·协调方派单令明示授权 runner 面「红路把 tsx stderr 尾量写入 .tmp 侧通道」）。

### 面① · `e2e/full.e2e.ts`（blob `fe21414b` · **+1/−0** · 针① R2 循环退出即帧）

| # | 位锚（现树） | 新增形（定稿） |
|---|---|---|
| N1 | `:518`（r2Loop 调用闭括号）与 `:519`（recordTerminal）之间·`:520` 断言面前 | `segEmit({ step: 'seg3_r2_loop_exit', terminal: r2Loop.terminal, questions: r2Loop.questions, batches: r2Loop.batchWallClock.length }); // G7W-DIAG-NEEDLES N1: R2 循环退出即帧(断言面前·deadline 到期形 terminal='' 亦可回读)` |

定稿三证：**「`:519` 前」逐字兑现**（帧先于 recordTerminal 与 `:520`-`:522` A() 断言面=红时 fail-fast `process.exit(1)` 不吞帧）；**deadline 到期形钉死**——`:308` while 环尽零 terminal 时 `terminal=''`+`batches` 计数即为到期形直读（`INTERVIEW_TERMINAL_DEADLINE_MS=420_000` 值零触·禁放宽沿 R2 段 `:508` 注记原文）；**batches=len 口径**——派单令钉 `batches:len`（退出帧只钉退出形计数·批级全数组由针② 心跳通道中途落盘承载·F1/F3/F4 全数组形系循环出后帧不冲突）。字段全标量零 eslint 新 warning 面。

### 面② · `e2e/helpers/interview.ts`（blob `1b2a87e8` · **+3/−0** · 针② 每 N 批心跳中途落盘）

| # | 位锚（现树） | 新增形（定稿） |
|---|---|---|
| N2a | `:1` import crypto 行后 | `import { appendFileSync, mkdirSync } from 'node:fs';` 1 行 |
| N2b | `:284`（InterviewLoopOptions type 尾空行 · driveInterviewToTerminal doc comment `:285` 前） | 模块级 helper 1 行：`const flushLoopHeartbeat = (interviewId: string, batches: number, lastSeq: number, questions: number, elapsedMs: number): void => { try { mkdirSync('.tmp', { recursive: true }); appendFileSync('.tmp/e2e-seg-heartbeat.ndjson', `${JSON.stringify({ bootId: process.pid, step: 'seg3_loop_heartbeat', interviewId, batches, lastSeq, questions, elapsedMs })}\n`); } catch { /* 防自伤: 心跳写盘自身异常不改写驱动语义(:36 segEmit 同形) */ } }; // G7W-DIAG-NEEDLES N2b` |
| N2c | `:312` batchWallClock.push 行后 | `if (batchWallClock.length % 5 === 0) flushLoopHeartbeat(options.interviewId, batchWallClock.length, lastSeq, questions, Date.now() - started); // G7W-DIAG-NEEDLES N2c: 每 N=5 批心跳中途落盘(死亡窗内批级直读)` |

定稿四证：**N=5 钉死**（§9-LIVE 实测单 journey 15-28 批→每循环 3-6 帧·420s deadline 到期 worst-case ≈350 批→≤70 帧/run·四循环 ≤~90 帧·每帧 ~150B 全 gitignored=有界）；**四循环全覆盖**（main/7a/R2/bound 四处 driveInterviewToTerminal 调用共用本函数·interviewId 入帧区分各循环）；**「已收集只差中途落盘」逐字兑现**（batchWallClock 收集面 `:306`/`:312` 案 A 原样零触·只在 push 后加有条件 flush=驱动语义零变更·`lastSeq/questions/started` 全为 `:294`-`:306` 在树作用域变量零新增状态）；**proof 零执行路径**（`e2e-helpers.proof.ts:14` 只 import 纯函数不跑循环·防自伤 catch 兜底）。camelCase 键零 naming-convention 新 warning 面（案 A §9-⑨(a) snake_case 教训沿 avoid 路行使·非豁免路径）。

### 面③ · `scripts/run-e2e.mjs`（blob `f55330b1` · **+5/−1** · 针③ 红路 tsx stderr 尾量入 .tmp 侧通道）

| # | 位锚（现树） | 新增形（定稿） |
|---|---|---|
| N3a | `:8` import fs 行 | 词级加 `appendFileSync`（净行 0） |
| N3b | `:187` tsx.stderr.on 行改写（转发语义零改+前置收集） | 2 行：收集器行 `const tsxErrChunks = [];`（`:186` 前·注释=红路回读面）+ `:187` 改 `tsx.stderr.on('data', (d) => { tsxErrChunks.push(String(d)); while (tsxErrChunks.length > 1 && Buffer.byteLength(tsxErrChunks.join('')) > 32_768) tsxErrChunks.shift(); process.stderr.write(d); });`（**尾量 cap 32KiB 滚动·转发逐字节零改**） |
| N3c | `:188` Promise.race 前 | flush helper 1 行：`const flushTsxStderrTail = (exit) => { try { mkdirSync(`${ROOT}.tmp`, { recursive: true }); appendFileSync(`${ROOT}.tmp/e2e-tsx-stderr-tail.ndjson`, `${JSON.stringify({ bootId: process.pid, step: 'tsx_stderr_tail', exit, tailBytes: Buffer.byteLength(tsxErrChunks.join('')), tail: tsxErrChunks.join('') })}\n`); } catch { /* 防自伤: 尾量落盘自身异常不改写红路 class(:258 7a_diag diag_failed 同形) */ } }; // G7W-DIAG-NEEDLES N3c` |
| N3d | `:193`-`:195` 字符串臂体内+`:196` throw 前 | 两处各 1 行 `flushTsxStderrTail(code);`（**恰两红臂·绿路 `:197`-`:198` 零写盘零触**·throw 前落盘=catch 臂 `:200`-`:205` 零改） |

**行形总纲三证（面③ 专项）**：①**零新增暴露面**——`tail`=tsx 客户端（E2E 断言面自身）`:187` 已无条件转发进 CI log 流的同一字节流的有界尾量副本（A() prose/stack·断言消息为卷面 crafting 文本零 secret 面）；**api/worker 两子进程原始输出仍仅字节计数（`:83`-`:89` 零触）**=withhold 契约保全语义零字节变更；②**回读面达成机制**——runner 进程内先落盘后 throw，隔离形父层（run-e2e-isolated.mjs `0787a7ff`）对 runner stderr 的 withhold 语义零改而 `.tmp` 在盘可回读（案 A §0.2b「进程内写盘在 withhold 域外」判读同源）；③**红路即弃逐字兑现**——现 `:181`-`:198` 弃段内恰补收集/落盘两点·`client_exited`/`worker_exited_during_test`/`api_exited_during_test` 三 throw 全被尾量帧前置覆盖。

**量级核算**：面① +1 · 面② +3 · 面③ +5/−1 · 合计 **+9/±3/−0**（±3 浮动帽=行尾注记/断行样式 · EXEC 期 numstat 实测为准 · 硬帽 +20/−0 越帽即停 §8-③）。
**ledger 容量算术（零变更核）**：本卷**零新 ledger 行**（三针全 NDJSON 通道帧·reviews.record/recordTerminal/emitE2EFailure 零新增）——案 A 卷 §1 核算 26 ≤ REVIEW_LEDGER_LIMIT 32 **原样维持**（余量 6）· EXEC 期对届时树复算确认即可。
**零触三面**：零产品码（apps/packages 全域）· 零 withhold 契约语义面（run-e2e-isolated.mjs/secret-redaction.mjs/withheld-output.mjs 零字节触·`:83`-`:89` tailAppend 零触）· 零迁移零 spec 零夹具零占号。
**判别 run 判读谱（EXEC/LIVE 期 · 授权归协调方）**：红 run=三帧链闭环可回读——R2 段死亡→`seg3_r2_loop_exit` 帧 terminal=''+batches 计数=deadline 到期形钉死；任一循环内死亡→心跳帧末枚=死亡批位+批级 delta；client 红/子进程 exit 红→`tsx_stderr_tail` 帧 tail 字段=A() 消息与失败码直读（新红 ⑤(c) 不可回读面翻面载体）；绿 run=心跳帧链+既有五帧链并存零干扰、exit 0 零尾量帧。

## §1.3 否决清单（veto · 双审/EXEC 违反任一即 FAIL）

1. **Ban 起草期码动**：本卷起草改动集恰 1 .md——三针码面（面①/面②/面③）只可在 EXEC 期随本卷授权落卷，起草期触码即 FAIL。
2. **Ban A() 断言语义变更/删除/改写/新增**（断言零增零减零改——含 R2 段 `:520`-`:522` 断言面·scorelessBound 契约钉·static-guards 契约正则面·proof 源码锁 8 正则·parity binding needle `'assert: A'`）· **Ban deadline/超时值触**（`INTERVIEW_TERMINAL_DEADLINE_MS=420_000`·R2 段 `:508`「420s deadline 沿既有值·禁放宽」原文逐字守）· Ban 为绿放宽任何门。
3. **Ban 产品码与 withhold 契约语义面**：apps/packages 全域零触；`run-e2e-isolated.mjs`/`secret-redaction.mjs`/`withheld-output.mjs` 零字节触；**api/worker 子进程输出捕获零新增**（`:83`-`:89` tailAppend 字节计数语义零改·Ban 把 api/worker 原始输出写入任何通道/文件）；`tsx.stderr` 转发语义零改（N3b 只前置收集）。
4. **Ban 敏感物料入帧**：answer/prompt/token/key 值/model 回显/连接串零入帧（心跳帧白名单 0.2b 全标量）；尾量帧 `tail` 字段**系 tsx 客户端已公开流字节的有界副本**——若 tail 内检出 credential 形（static-guards credential 规则族）即停（§8-④）· Ban 尾量帧无限量（32KiB cap 硬·Ban 全量落盘）。
5. **Ban 既有面改写**：既有四 NDJSON 通道字节（consent-capture/7a-diag/seg-emit/g7-ledgers）零改写 · 既有 seg3 五帧 F1-F5/六码 R1-R6/12 枚 seg/seg2 行零改零删零重号 · batchWallClock 收集面（`:306`/`:309`/`:312`）零改 · `:186` stdout 转发零触 · 绿路 `:197`-`:198` 零触。
6. **Ban `emitE2EFailure`/新 ledger 行作埋点形**（本卷零新 ledger 行=26≤32 零变更核·`success_with_failure_class` 拒收机制承案 A 卷 §1 总纲）· Ban ledger 越帽/retry-to-green/只留绿 attempt（判别 run 单 attempt 纪律·LIVE 授权后）。
7. **Ban 第三码面**：`sse.ts`/`http.ts`/`auth.ts` 等其余 helpers 零触（本刀码面恰三文件）· 零迁移零占号零锁文件。
8. **Ban 起草期 live**：零外呼零容器零 DB；判别 run 的 LIVE 行使=协调方另行两票分立授权后的工序，未授权先跑即 FAIL · **Ban self-approve**（pre-exec dual 归协调方派两独立外席 · alone ≠ dual）· ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

## §2 门矩阵（起草期本席全跑 + EXEC 期码面落卷全跑 · 每条可独立判定）

**A 段 · 起草期（本席亲跑 · 零码零 live）**：

| # | 门 | 命令/判据 | 判定 |
|---|-----|-----------|------|
| A1 | docs:check | `node scripts/ai-docs/check-docs.mjs` | **EXIT=0**（起草基线亲跑：2193 managed ≤ cap 2200（`public-text-policy.mjs:102` 亲证）· 落卷后实测 2194 ≤ 2200 · 本卷系唯一新增受管件） |
| A2 | markers 五类 | 改动集 grep（词族=`scripts/i6-239-gates.proof.mjs:151` 区运行时组装四词+冲突标记对 · **词面本卷不复抄防自匹配**） | **零新增命中**（改动集恰 1 .md） |
| A3 | diff 面 | `git show --numstat HEAD`（落卷后） | **恰 1 tracked 新件=本卷 .md · +N/−0 纯新增 · 零他 tracked 路径零删改**（三码面/backlog/checklist/LEDGER 对 HEAD 零 delta 机检） |

**B 段 · EXEC 期（码面落卷时行使 · 本卷预 registered 判据）**：

| # | 门 | 命令/判据 | 判定 |
|---|-----|-----------|------|
| B1 | typecheck:e2e | `pnpm typecheck:e2e`（=`tsc -p tsconfig.e2e.json` · include `e2e/**/*` 恰盖面①面②） | **EXIT=0** |
| B2 | lint | `pnpm lint`（`--max-warnings 5235`） | **EXIT=0 且新增零 warning**（camelCase 键面=零 naming-convention 豁免路径·案 A §9-⑨(a) 先例规避） |
| B3 | e2e-helpers:prove | `pnpm e2e-helpers:prove` | **EXIT=0 同基线**（28 scenarios · interview.ts 新增行零触其断言面·proof 零执行路径 0.2 亲证） |
| B4 | e2e 静态门族 | `pnpm e2e-static-guards:check`+`pnpm e2e-parity:check`+`pnpm e2e-parity:prove`+`pnpm e2e-case-inventory:prove`+`pnpm e2e-platform:check` | **全 EXIT=0 逐门同基线**（AI-path 契约/credential 形扫三面新增行/源码锁 8 正则/binding needle/withhold marker 零触零漂移） |
| B5 | diff 面（码面） | `git diff --numstat` | **恰 4 tracked=三码面（面① ∈[1,2]·面② ∈[2,5]·面③ ∈[3,8]·合计 ∈[6,15]∩硬帽 ≤20/−0）+本卷 .md · 零他 tracked** |
| B6 | 通道/gitignore 双查 | `git check-ignore .tmp/e2e-seg-heartbeat.ndjson .tmp/e2e-tsx-stderr-tail.ndjson` | **EXIT=0 双命中**（新两通道 gitignored） |
| B7 | 判别 run（LIVE 面） | 恰 1 run（**LIVE 授权归协调方两票分立另行**） | 三帧链判读谱 §1（红=三帧可回读/绿=帧链并存零干扰）· E2E_FAILURE 行零新增 · est live 以账本实跑值为准（0.2c） |

## §3 范围外（边界清单 · 越界即 FAIL）

1. 产品码全域（apps/packages）· 迁移（链顶 0204 冻结 · 零预占）· spec/夹具/锁文件。
2. withhold 契约语义面四件（`run-e2e-isolated.mjs`/`secret-redaction.mjs`/`withheld-output.mjs`+`:83`-`:89` tailAppend 字节计数面）——案 B 面③ scoped readback 另立域不并入（针③=runner 红路判别面加针·域界 0.2b/§1 面③ 三证）。
3. `sse.ts` 与 `e2e/helpers/` 其余文件（本刀仅 interview.ts 一 helper）· `http.ts` readSseEvents 内部（批 t0 已在面② W1 位括住零触）。
4. backlog `:108` 行本体与行翻面（P1 OPEN 维持 · 翻面权归协调方）· 诊断卷支 `line/g7w-tail-diag`/案 A 支 `line/g7w-tail-seg-emit`/案 B 支 `line/g7w-tail-contract-ruling`（零代推零改写零复活）。
5. 既有四 NDJSON 通道字节与既有五帧六码 12 行（§1.3-5 全单）· 共享 SSOT 其余全部行/行统计/LEDGER/矩阵——只读零触。
6. 新红 class=api 的产品侧归因与修复（本卷=判别面加针非缺陷修复刀——归因须针后判别 run 读数·另立域）。

## §4 依赖与迁移号

零新依赖——appendFileSync/mkdirSync/Buffer 全为 Node 内建与在树设施。**迁移号=零**（现树 max=0204 · 不预占任何号）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push/pull --rebase（git 写操作只在本 worktree 起草 commit 一次）· Ban 起草期码动（§1.3-1）· Ban A() 语义触与 deadline 触（§1.3-2）· Ban 产品码与 withhold 语义面触/子进程输出捕获新增（§1.3-3）· Ban 敏感物料入帧与尾量无限量（§1.3-4）· Ban 既有面改写（§1.3-5）· Ban ledger 行形与越帽/retry-to-green（§1.3-6）· Ban 第三码面/迁移/占号（§1.3-7）· Ban 起草期 live/LIVE 未授权先跑/self-approve（§1.3-8）· Ban 直改 backlog `:108` 行原文任何字节/删行洗史（承案 A/案 B Ban 条款）· Ban 触 §3 全部域。

**pins（十一值照抄 · 零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（起草零调用零消耗 · 判别 run 消耗 LIVE 授权后账本实记）。

## §6 est live（起草=0）

起草 turn 全只读；落卷期门行使面=docs:check+markers+git diff+worktree/branch/卷名/check-ignore 四查（全本地零外呼零容器零 DB）——**起草 est live=0 · `actualSpendCny=null`**。EXEC 期：静态门族（B1-B6）全本地零外呼；判别 run 恰 1（LIVE 授权归协调方两票分立另行 · 链累计沿硬帽 200 口径如实另账 · est-not-counter 沿 §9-LIVE 实测 17 参考值非本卷预估）。

## §7 markers=0（卫生声明）

本刀起草改动集恰 1 .md，五类标记词起草席亲跑 grep 零新增（命令与回执随交付报告；五类标记词不在卷内复抄，避免自匹配——沿案 A/案 B 卷 §7 同形制）。

## §8 STOP（开工三条款）+ 停止条件

**STOP · `executed:awaiting_post_prove_dual`（EXEC 席翻面 2026-10-16 · 前值 `draft:awaiting_pre_exec_dual`=起草+rev+rev2 史录 · 三处同值翻面=Status 头/本节/卷尾注 · post-prove 双审两独立外席待派 · alone ≠ dual）·〔前值原文：`draft:awaiting_pre_exec_dual`（起草席 2026-10-16 落卷终态 · 三处实测一致=Status 头/本节/卷尾）· 起草席写完即停零码动条款（起草期已履行完毕=EXEC 落卷兑现）〕** 开工三条款：①本卷 pre-exec 双审 BOTH PASS（双审对象=§0 锚保真+§1 三针逐处定稿（面① `:519` 前/`batches:len`·面② N=5/白名单/四循环·面③ 32KiB cap/两红臂/withhold 三证+量级/ledger 零变更核）+§1.3 八款否决+§2 门矩阵 A/B 两段判据——两独立外席 · alone ≠ dual）；②协调方 EXEC 授权（三码面落卷+判别 run 排程一并由协调方裁 · **LIVE 跑数须协调方另行两票分立授权**——EXEC 授权≠LIVE 授权）；③post-prove 双审+行状态归协调方裁。三者全属后继工序 · 本卷不含 EXEC。

**停止条件（五类 · 命中即停手上报）**：
1. **现场漂移**：pre-exec/EXEC 面对届时 tip 重 pin——backlog `:108` 行被翻面/他刀注记、案 A 卷 §9-LIVE 锚段被改写、或 §0 锚漂移超 ±3 且结论受影响 → 停手上报（不得就地改修法实质）。
2. **机制不满足**：`failure-class.mjs` 容量/行 RE 面被他刀改动、static-guards/proof/parity 契约面（源码锁 8 正则/AI-path/binding needle/credential 形扫）被他刀动、或 segEmit/`:83`-`:89` 先例行漂移使针位失效 → 停手上报回炉（不得就地改行形）。
3. **越界需要**：执行中若需触 §3 任何域（产品码/withhold 语义面/其余 helpers/既有通道改写/行数越帽）→ 停手上报（不得就地扩域）。
4. **验收红不可修**：A/B 两段任一门红且无法在本刀范围内归因修复（含尾量帧 credential 形检出 §1.3-4）→ 停手上报（Ban 为绿放宽门——含 Ban 放宽 lint cap/typecheck/32KiB cap/硬帽）。
5. **LIVE 边界**：EXEC 期判别 run 前协调方 LIVE 两票分立授权未落字 → 判别 run 停摆（静态门 B1-B6 可先行）· Ban 未授权先跑。

---

## §9 pre-exec dual 交接（预留 · 本节零 SSOT 触碰）

- **双审对象四件**：§0 全节（blob 锚表 14 锚+读码三项 0.2a/0.2b/0.2c）· §1 三针逐处定稿（面① +1/面② +3/面③ +5/−1·32KiB cap·N=5·batches:len 口径·withhold 三证·ledger 26≤32 零变更核）· §1.3 八款否决· §2 门矩阵 A/B 两段判据。
- **悬决项（归协调方）**：EXEC 排程 · 判别 run LIVE 授权（两票分立 §8-②）· 新红产品侧归因刀的立项先后（本卷针后判别读数为其前置）。
- **本卷落卷后事实基座不受后继裁决影响的部分**：§0 全节读数系读数登记（原值记账零冲销）。

## §9-rev rev 修订注记（pre-exec 双审席2 FAIL P1×2 修订清单五条回路 · rev 席落卷 2026-10-16 · **append 注记形 · 上文 §0-§9 零洗** · 本节为 EXEC 期对前文对应句的权威修正与增补）

> **席2 FAIL 定谳（rev 席逐位亲证成立）**：**P1-1 预算声明自相矛盾**——§1 量级核算（`:92`）声明「+9/±3/−0·硬帽 +20/−0」，但面③ N3b 系对 `run-e2e.mjs:187` 现行单行 `tsx.stderr.on('data', (d) => process.stderr.write(d));` 的**改写**（rev 席亲读 @`e09cf11c`）→ EXEC 期 numstat 实测必 **+9/−1**，按卷面 −0 字面即触发 §8-③ 越帽假停。**P1-2 LIVE 判别读法缺 a/b 分辨器且含失准读法**——`sse.ts` `readSseEvents`（rev 席亲读：清单词面 `:73-95` 区·实测签名 `:65` 默认 `timeoutMs=1200`+`:86-88` catch 吞 abort+`:91-93` 返回可空数组）→ worker/api hang 形下每批照常完成（空 kinds）·`interview.ts:312` push 照常·心跳照常续推——原 §1 判读谱「帧无+心跳停→形 b」机制不成立、「任一循环内死亡→心跳帧末枚=死亡批位」失准；**真分辨器=lastSeq/questions 递进 vs 平台**。rev 五条修订如次·STOP 维持 `draft:awaiting_pre_exec_dual` 三处同值（§9-rev.7）。

### §9-rev.1 修订①（P1-1）——预算声明修正（§1 量级核算 `:92` + §2 B5 `:126`）

- §1 量级核算「合计 **+9/±3/−0**（±3 浮动帽=行尾注记/断行样式 · EXEC 期 numstat 实测为准 · 硬帽 +20/−0 越帽即停 §8-③）」→「合计 **+9/±3/−1**（**−1=面③ N3b `:187` 改写删除·预授权**）·硬帽 **+20/−1**」。
- §2 B5「合计 ∈[6,15]∩硬帽 ≤20/−0」→「**合计 ∈[6,15]∩删除 ∈[0,1]∩硬帽 ≤20/−1**」。
- 卷尾注「合 +9/±3/−0 硬帽 +20/−0」同此修正值——EXEC 期 numstat 实测 +9/−1 为准·**不再触发 §8-③ 假停**（其余两码面纯新增 +1/−0·+3/−0 零变）。

### §9-rev.2 修订②（P1-2）——§1 判读谱（`:95`）重写为机制核证版四行矩阵

EXEC/LIVE 期判读以下列四行矩阵为准（原判读谱句以此节替换读·原文零洗）：

1. **exit 帧 `terminal=''` + 心跳 lastSeq/questions 递进至末帧 → 形 a**（事件流健在·面试不终局/R2 deadline 到期）。
2. **exit 帧 `terminal=''` + 心跳 batches/elapsedMs 递进而 lastSeq/questions 平台 → 形 b**（SSE 零事件=worker/api 停摆·**末次 lastSeq 递进帧=事件断点位**）。
3. **帧无 + 心跳平台（turn fetch 无 abort·`interview.ts:261`）→ api 侧 turn 挂死形**。
4. **tail 帧在场 → client 红/子进程 exit 红直读**。

- **删除「任一循环内死亡→心跳帧末枚=死亡批位」失准表述**（原判读谱句作废·以此矩阵为准）——机制根据=`sse.ts:65/:86-88/:91-93` 亲证（hang 时 readSseEvents 1200ms abort 空数组返回·批照常完成·心跳照常续推空批）。
- 三形互斥判别器：①末帧 lastSeq/questions 是否递进（形 a vs 形 b）②心跳帧是否仍在产出（形 b vs turn 挂死形）③tail 帧在场与否（client/子进程红直读）。

### §9-rev.3 修订③——§0.2b 判读口径（`:53`）补句

判读口径行补：「**心跳帧末枚≠死亡批位（hang 时心跳续推空批）·死亡点位按末次 lastSeq 递进帧读**」——原「心跳帧按 bootId 分组…尾量帧每 run 红时恰 1-2 帧（两红臂 `:193`-`:196` 互斥·先到先落）」保持·EXEC/判读期以此补句为准。

### §9-rev.4 修订④（P2）——§0 基线锚（`:6`/`:36`）EXEC 期注记

本卷落卷后主线 tip 已步进——rev 席 fetch 实测 origin tip=**`fe4079a0`**（清单词面 `f7caa206` 系其祖先·`merge-base --is-ancestor` EXIT=0 亲证·uuid-id-check/q2-validate-scene-fix/5c-behavior-trio/context-budget-wire 四波已并）·**三码面零漂移亲证**：`e2e/full.e2e.ts`=`fe21414b`/`e2e/helpers/interview.ts`=`1b2a87e8`/`scripts/run-e2e.mjs`=`f55330b1` 三 blob 对 `d5dc0726`=`f7caa206`=`fe4079a0` 恒等（§0.1 锚 1-3 全值保持·零更锚）·届时 EXEC **merge-forward+重 pin** 照 §0 规则不受影响；managed 余量对 f7caa206 口径=**余 5**（2195≤2200·q2-validate-scene-fix nail 序4 亲跑值承之）·**cap sanction 2208 在飞前置**（`line/cap-sanction-2208`@`a75736a0` EXEC 已落码未并主线 rev 席亲证·其 sanction 注记「在飞 G7W-DIAG-NEEDLES/WORKER-HANG-GUARD 两 REQUEST 并入即 2201 超限」rev 席亲读——本卷并线以 sanction 2208 落地为前置）。

### §9-rev.5 修订⑤（P2 四件）——§1.3-4（`:102`）尾量字面+门面口径

1. **P2 尾量 cap 字面精确化**：§1.3-4「32KiB cap 硬」→「**32KiB 滚动+至多 1 管道块保留·转义后单行上界 ~196KiB 有界**」（N3b `while (tsxErrChunks.length > 1 && …) shift()` 保形=滚动窗至多留 1 管道块·转义后单行上界有界非无界）——Ban 尾量无限量语义不变·cap 仍硬。
2. **P2-1 帧数措辞**：心跳帧数上界修正为「**单到期循环 ≤70-84 帧·四循环硬界 ≤336 帧≈50KB 有界**」（原「≤70 帧/run·四循环 ≤~90 帧」措辞作废·每帧 ~150B→≈50KB 有界结论不变）。
3. **P2-2 ledger 复算口径**：EXEC 期 26≤32 复算以**运行时 `reviewLedger.length`**（隔离/判别 run 实测）为准·非源码 grep 计数。
4. **P2-3 Buffer 收集形可选采纳**（EXEC 期裁量·不强修——N3b 收集器行形保持卷面定稿即可）。
5. **P2-4**：席2 清单词面「**13 滞留分支登记入 §8-①**」如实转录——登记入 §8-① 现场漂移哨位（rev 席核证边界如实披露：本席对基线 `d5dc0726` 滞留支线实测=恰 2 支=本支+`line/worker-hang-guard`（`line/ai-graphs-cycle-break` 已并）·origin 领先本支 20 commit·「13」数值 rev 席未能复现到唯一仓内对象·EXEC 期如遇词面所指现场即停手上报）；**与 WORKER-HANG-GUARD 串行排程注记**：`line/worker-hang-guard`@`a479fdc2`（其 REQUEST 亦已 rev 五条·STOP 同值）在飞未并 rev 席亲证+cap-sanction 注记「两 REQUEST 并入即 2201 超限」→本卷与 WORKER-HANG-GUARD 的 EXEC/并线**串行排程**（不得同时并入 cap 2200 主线·以 sanction 2208 落地或串行为前置·排程权归协调方）。

### §9-rev.6 门矩阵 rev 后口径（rev 席亲跑）

- **A1 docs:check**：EXIT=0 实测值见 commit 回执（文件计数制·本 rev append 零新增文件→计数不变）。
- **A2 markers**：rev 增量行五类标记词+冲突对直扫零命中（词族运行时组装不誊卷·沿 §7 同形制）。
- **A3 diff 面**：恰 1 tracked=本卷 .md 纯 append 零删改·零他 tracked（三码面对 `e09cf11c` 零 delta 机检）。
- B 段七门沿 §2 预 registered 判据·预算判据随 §9-rev.1 修正值（B5 删除 ∈[0,1]·硬帽 ≤20/−1）。

### §9-rev.7 rev 后 STOP 状态

**STOP=`draft:awaiting_pre_exec_dual` 三处同值维持**（Status 头/§8/卷尾注零字洗）——rev 落卷后待席2 修订清单五条落点确认（或协调方裁定）→**重派 pre-exec 双审两独立外席**（rev 后重审·alone ≠ dual）；开工权归协调方·⛔push ⛔merge 主线 ⛔改码面（本 rev 恰 1 doc 零码面）。

### §9-rev2 rev2 修订注记（rev 后确认席 REJECTED R1·P1+R2·P2+R3·P2 三条回路 · rev2 席落卷 2026-10-16 · **append 注记形 · 上文 §0-§9-rev 零洗** · 本节为 EXEC 期对前文对应句的权威修正续篇 · 沿 §9-rev 先例形）

> **确认席 REJECTED 定谳（rev2 席逐位亲证成立）**：**R1（P1）删除口径漏计 N3a**——§9-rev.1 修正值「+9/±3/−1」仍假：N3a 原定稿「词级加 `appendFileSync`（净行 0）」系对 `run-e2e.mjs:8` 现行行 `import { readFileSync, existsSync, mkdirSync } from 'node:fs';`（blob `f55330b1` @`0d41d2cb` `git ls-tree` 亲读零漂移）的**改写**——git numstat 对现行行改写照计 **+1/−1**（rev2 席 /tmp 沙盒双形实测：词级加词形=+1/−1·独立新行形=+1/−0——净行 0≠numstat 0），而 N3c helper 体用 `appendFileSync`（§1 面③ N3c 定稿行亲读）必触 import 面→EXEC 实测必 **+10/−2** 非 +9/−1→B5「删除 ∈[0,1]」假停。**R2（P2）**——§9-rev 定谳段（`:178`）「原 §1 判读谱『帧无+心跳停→形 b』」系**席2 FAIL 词转写·非原卷字面**（rev2 席亲读原卷 `:95` 判读谱句：形 a/形 b 字样 0 命中亲证）。**R3（P2·出处闭环·协调方提供）**——「13 滞留分支」出处=**pre-exec 双审席1 报告原文**「触三针文件的未并线分支恰 13 条·全部 tip=2026-10-08/09 滞留一周」，系该席**两-dot diff 口径**（rev2 席 ai-docs 全域「13 滞留/滞留一周」词面直扫零命中=「13」无仓内对象亲证·两-dot 直 diff 把「分支缺案 A 帧」反向计入产生大面积伪交叠·**merge-base+ahead 独有提交口径才是真值=实测滞留恰 2 支**）。rev2 三条修订如次·STOP 维持 `draft:awaiting_pre_exec_dual` 三处同值（§9-rev2.4）。

#### §9-rev2.1 rev2-①（R1）——N3a 改形定稿（§1 面③ N3a 行 `:85`+面③ 头量 `:81` 权威修正 · 冻结条款处理=本节权威修正句覆盖·§1 原文零洗）

- §1 面③ N3a「`:8` import fs 行｜词级加 `appendFileSync`（净行 0）」→「**`:8` 行后独立新行｜`import { appendFileSync } from 'node:fs';` 1 行**（沿面② N2a 同形·零触 `:8` 现行行）」——EXEC 期以本节为权威（原 N3a 词级加词形**作废**）。
- 面③ 量级「+5/−1」（`:81`）→「**+6/−1**」·合计（`:92` 承 §9-rev.1 修正值处）→「**+10/±3/−1**（−1=面③ N3b `:187` 改写删除·预授权）·硬帽 +20/−1（不变）」。
- **B5 判据行核对（零改）**：§9-rev.1 修正值「合计 ∈[6,15]∩删除 ∈[0,1]∩硬帽 ≤20/−1」对 rev2 后合计 **+10/±3/−1 成立**（10∈[6,15]·−1∈[0,1]·+10≤20·−1≤1·面③ +6∈[3,8]）——B5 原判据即可行使·零改（修订面最小）。
- **§9-rev.1 对表值同步**：其「EXEC 期 numstat 实测 +9/−1 为准」→「EXEC 期 numstat 实测 **+10/−1** 为准」（其「合计 +9/±3/−1」→「合计 **+10/±3/−1**」·其余零改）。
- **§9-rev.6 对表值同步**：B 段句对表值=「EXEC numstat 预期 **+10/−1**（面① +1/−0·面② +3/−0·面③ +6/−1）·B5 判据行原值行使」。
- 独立新行形零新 warning 面亲证：`packages/config/eslint.config.base.mjs` 仅注册 `import/order`（`:74`）·无 `import/no-duplicates` 规则面（rev2 席亲读）——两 `node:fs` import 行并存零 lint 新 warning。

#### §9-rev2.2 rev2-②（R2）——席2 词转写标注（§9-rev 定谳段 `:178` 补注 · 防后席按字面回查原卷误引）

§9-rev 定谳段 P1-2 内「原 §1 判读谱『帧无+心跳停→形 b』」补注：「**席2 FAIL 词转写·非原卷字面（原卷 `:95` 判读谱句无形 a/形 b 字样·形 a/形 b 系席2 词与 §9-rev.2 四行矩阵的概括记号）**」——EXEC/后席期回查判读谱以 §9-rev.2 四行矩阵为权威·不以 `:178` 引文为原卷字面。

#### §9-rev2.3 rev2-③（R3）——§8-① 哨位「13 滞留分支」出处与口径勘记（补一行 · 承 §9-rev.5-5 已登记哨位）

§8-① 现场漂移哨位（§9-rev.5-5 登记处）补：「**『13 滞留分支』出处=pre-exec 双审席1 报告原文『触三针文件的未并线分支恰 13 条·全部 tip=2026-10-08/09 滞留一周』——系该席两-dot diff 口径（两-dot 直 diff 把『分支缺案 A 帧』反向计入产生大面积伪交叠·merge-base+ahead 独有提交口径才是真值=实测滞留恰 2 支）·EXEC 期此哨以 merge-base+ahead 口径复算为准**」——出处链=席1 报告原文经协调方转录（rev2 席 ai-docs 全域直扫零仓内对象·如实登记非本席复算）。

#### §9-rev2.4 rev2 后门矩阵回执+STOP 状态

- **markers**：rev2 增量行五类标记词+冲突对直扫零命中（词族运行时组装不誊卷·沿 §7/§9-rev.6 同形制）——命令与回执随交付报告。
- **docs:check**：EXIT=0 实测值见 commit 回执（文件计数制·本 rev2 append 零新增文件→计数不变）。
- **A3 diff 面**：恰 1 tracked=本卷 .md 纯 append 零删改·零他 tracked（三码面/backlog/checklist/LEDGER 对 `0d41d2cb` 零 delta 机检随 commit 回执）。
- **STOP=`draft:awaiting_pre_exec_dual` 三处同值维持**（Status 头/§8/卷尾注零字洗）——rev2 落卷后随 §9-rev.7 同路：待落点确认（或协调方裁定）→重派 pre-exec 双审两独立外席（alone ≠ dual）；开工权归协调方·⛔push ⛔merge 主线 ⛔改码面（本 rev2 恰 1 doc 纯 append 零码面）·Ban self-approve。

### §9-exec EXEC 记录（EXEC 席落卷 2026-10-16 · rev2.1 权威修正后定稿恰 +10/−1 · 门矩阵 A/B 全绿 · 双审 P2 承接两件随卷 · STOP→`executed:awaiting_post_prove_dual`）

**授权链**：起草落卷 `e09cf11c`→rev 落卷 `0d41d2cb`（席2 FAIL P1×2 五条修订）→rev2 落卷 `0989c74d`（确认席 REJECTED R1/R2/R3 三条回路·rev2.1 N3a 改形独立新行定稿）→pre-exec 双审**重派会签 PASS×2**（席1 `agent_854946fd`+席2 `agent_052b7d72`）→协调方授权 EXEC（派单令·执行序五步·STOP→executed:awaiting_post_prove_dual）→EXEC 本卷（序1 fetch 亲证 origin/feat/mysql-schema-skeleton=`10799a3e` 恰等派单下界「tip≥10799a3e」→merge `8c4d60ea` --no-ff 双亲 `0989c74d`+`10799a3e`·零冲突预证亲跑=merge-base `d5dc0726`+origin 侧 35 commits 对三码面/REQUEST 零触及+三 blob 双侧恒等 `fe21414b`/`1b2a87e8`/`f55330b1`·ort 策略零冲突 38 files +1985/−43·⛔pull --rebase 未用）。

**① 门矩阵全表（A 段+B 段 · 并线树 `8c4d60ea` 基 · 交付 commit 前亲跑）**：

| # | 门 | 判据 | 实测 | EXIT | 结论 |
|---|---|---|---|---|---|
| A1 | docs:check | EXIT=0 ≤cap 2208 | 终树值见 commit 回执（cap `7bace81c:104` MAX_FILES=2_208 sanction 后值亲证） | 0 | 绿 |
| A2 | markers 五类 | 改动集新增行四标记词+冲突对直扫零命中+全树行首冲突标记零命中 | 改动集 4 文件新增行直扫 hits=0（词族沿 `scripts/i6-239-gates.proof.mjs:154` 区运行时组装·词面不誊防自匹配）；全树行首冲突标记 `git grep` EXIT=1 零命中 | 0/1 | 绿 |
| A3 | diff 面 | 恰 4 tracked=3 码+本卷 .md · 零新受管文件 | 终树值见 commit 回执（码面 3 tracked +10/−1 先证） | 0 | 绿 |
| B1 | typecheck:e2e | EXIT=0 | `tsc -p tsconfig.e2e.json` 零输出零错 | 0 | 绿 |
| B2 | lint | EXIT=0 · --max-warnings 5235 恰等零新 warning | 全树 5235 warnings/0 errors 恰等基线帽；三改动文件单独 lint=65 warnings **逐位对照零新**（full.e2e 58 条无 :519 新行·interview.ts 7 条无 :2/:286/:315 新行·run-e2e.mjs 0 条） | 0 | 绿 |
| B3 | e2e-helpers:prove | EXIT=0 · 28 scenarios 恰等基线 | `28 scenarios; releaseEvidence=false` 恰等 | 0 | 绿 |
| B4 | 静态门族五门 | 全 EXIT=0 逐门同基线 | e2e-static-guards:check+e2e-parity:check+e2e-parity:prove+e2e-case-inventory:prove+e2e-platform:check 五门全 EXIT=0 | 0 | 绿 |
| B5 | diff 面（码面） | 恰 4 tracked=三码面（面① ∈[1,2]·面② ∈[2,5]·面③ ∈[3,8]·合计 ∈[6,15]∩删除 ∈[0,1]∩硬帽 ≤20/−1）+本卷 .md | **+10/−1 恰等 rev2.1 权威修正值**（面① +1/−0·面② +3/−0·面③ +6/−1·10∈[6,15]·−1∈[0,1]·+10≤20） | 0 | 绿 |
| B6 | 通道/gitignore 双查 | EXIT=0 双命中 | `git check-ignore .tmp/e2e-seg-heartbeat.ndjson .tmp/e2e-tsx-stderr-tail.ndjson` 双命中 EXIT=0 | 0 | 绿 |
| B7 | 判别 run（LIVE 面） | 恰 1 run·LIVE 授权归协调方两票分立另行 | **本席不行使**（§8-② EXEC 授权≠LIVE 授权·静态门 B1-B6 先行·判读谱沿 §9-rev.2 四行矩阵） | — | 如实登记 |

**② numstat 实测（EXEC 手迹账 · 对并线落点 `8c4d60ea`）**：`e2e/full.e2e.ts` +1/−0（面① N1：`:518`/`:519` 间 seg3_r2_loop_exit 帧·断言面前）·`e2e/helpers/interview.ts` +3/−0（面② N2a `:1` 后独立 import 新行+N2b `:284` 空行后 doc comment 前模块级 flushLoopHeartbeat 恰 1 行+N2c `:312` push 后 length%5===0 条件 flush）·`scripts/run-e2e.mjs` +6/−1（面③ N3a-rev2 `:8` 后独立 import 新行+N3b 收集器行+`:187` 改写（转发逐字节零改+32KiB 滚动·至多 1 管道块保留）+N3c flushTsxStderrTail helper+N3d 恰两红臂 throw 前落盘·绿路 `:197`-`:198` 零触）·**合计 +10/−1 恰等 rev2.1 权威修正值（§9-rev2.1 对表值亲证兑现）·零他 tracked**。

**③ §0 EXEC 重 pin 全表**：三码面 blob 对届树（`8c4d60ea`）**恒等零漂移**（`fe21414b`/`1b2a87e8`/`f55330b1`·位锚逐处亲读零漂=面① `:518`/`:519`/`:520`·面② `:1`/`:284`/`:305`/`:306`/`:312`·面③ `:8`/`:186`/`:187`/`:188`/`:193`-`:196`/`:197`-`:198`）；policy blob **`7bace81c`**（漂移自 `841e8666`·cap-sanction-2208 落地随并·`:104` MAX_FILES=2_208 亲读）；checklist blob `2e744da0`→**`376fd5bc`**（+65 随并·行锚 `:3281` 案 A 段零漂·`:3351` 邻域=context-budget-wire/cap-sanction-2208 两 nail 段亲读）；LEDGER blob `b4bc1838`→**`210e80a1`**（`:484` 案 B 行/`:493` 案 A 行 intact 亲读）；backlog `62c5e620`/案 A 卷 `62ffaffa`/assert `975fbb38`/failure-class `102d0f3a`/static-guards `01127803`/parity `40394984`/proof `e748be25`/isolated `0787a7ff` **九锚恒等**；failure-class `:55` REVIEW_LEDGER_LIMIT=32 零漂（ledger 26≤32 零变更核维持·运行时口径 P2-2 承之）；backlog `:108` GAP-G7W-API-TAIL-DEATH P1 OPEN intact；REQUEST 卷对 `0989c74d` 零漂（EXEC 基线）·blob 漂移三处（policy/checklist/LEDGER）语义无涉亲读=停止条件①不触发。

**④ 双审 P2 承接落卷两件**：
- **P2-R1（§9-rev2.3 勘正注记·EXEC 哨位复算）**：「真值=2 支」对总体误标如实承登——EXEC 席按 merge-base+branch-side 分口径复算（对届树 `8c4d60ea`·`line/*` 本地名去重）：**触三针文件未并支线实得恰 13 条**（全部 tip=2026-10-08/09：cmop03-driver-assertion-fix/cmop03-post7b-discriminator/cmop03f-finermarkers/g7-7a-diag/g7-boot-intercept/g7-driver-assert/g7-driver-capture/g7-finalize-skew/g7-postm7/g7-route-wait/g7-start-capture/g7fix5-arm-rework/tsc-fix-batches）·逐支行级吸收度复算=**全吸收 9 支（100%）+EVOLVED 形 2 支（g7-postm7 75%·g7fix5-arm-rework 50%）+NOVEL 2 支（g7-boot-intercept 0%=旗控 OFF 形·g7-finalize-skew 16%=另域）**——双审点名 2 NOVEL 恰等亲证·非阻塞结论一致（双审席「8 全吸收+4 EVOLVED+2 NOVEL」三分系其阈值判读如实登记不追改）；吸收无碰撞终证=三码面 blob 双侧恒等+落码位锚零漂。EXEC 哨位复算按分口径读=本条为 §9-rev2.3 勘正注记的 EXEC 期终值。
- **P2-R3（尾量帧单管道块上界备考）**：§9-rev.5-1「转义后单行上界 ~196KiB」系按 32KiB 单块口径·单管道块绝对最坏可达 64KiB（Node 流块上限）×JSON.stringify 转义最坏 ~6 倍膨胀=**~384KiB 仍有界**——cap 语义不变（滚动+至多 1 管道块保留·仍硬·Ban 无限量语义不变）·备考登记非必改。

**⑤ markers 扫描回执**：改动集（三码面+本卷 .md）对 HEAD 新增行直扫四标记词+行首冲突标记对 hits=0（词族运行时组装不誊卷·沿 §7/§9-rev.6 同形制）；全树行首冲突标记 EXIT=1 零命中（merge `8c4d60ea` 后残留零证）。

**⑥ pins 零翻声明+停止条件判定**：§5 pins 十一值全零翻（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · `actualSpendCny=null`）；停止条件五类逐条判定=①现场漂移**未触发**（blob 漂移三处语义无涉·backlog `:108`/案 A 卷 §9-LIVE intact）②机制不满足**未触发**（failure-class 容量/契约面九锚恒等·segEmit/`:83`-`:89` 先例行零漂）③越界需要**未触发**（改动集恰 4 tracked·零产品码零迁移零 withhold 语义面零第三码面）④验收红不可修**未触发**（A/B 全绿）⑤LIVE 边界**未触发**（判别 run 本席不行使·归协调方两票分立）。

**⑦ 偏离清单**：理想零。登记两条非偏离如实注记=①面② N2b helper 行插位形：定稿行落 `:284` 空行后、doc comment 前且不追加额外空行（纯 +1/−0 兑现面②恰 +3·helper 与 doc comment 间无空行系最小扰动形）②面③ N3d 第二臂落盘形：`:196` 单行 if 前置同条件独立 flush 行（`if (code !== 0) flushTsxStderrTail(code);`）非块形改写——「throw 前落盘·恰两红臂·绿路零触」语义逐字兑现且删除面恰 −1（块形改写必 +1/−1 超删除帽·rev2.1 删除口径预授权恰 1 处=N3b `:187` 改写）。

---

*G7W-DIAG-NEEDLES REQUEST · 2026-10-16 起草 · **`executed:awaiting_post_prove_dual`**（EXEC 席落卷翻面 2026-10-16·前值 `draft:awaiting_pre_exec_dual`=起草+rev+rev2 史录·三处一致=Status 头/§8/卷尾·EXEC 落卷详情=§9-exec）〔前值原文：**`draft:awaiting_pre_exec_dual`**（起草席落卷终态 · 三处一致=Status 头/§8/卷尾）〕· ⛔push ⛔merge 主线 · alone ≠ dual · base `feat/mysql-schema-skeleton` @`d5dc0726`（=fetch 后 origin tip 恰等派单下界「origin tip≥最新」ai-graphs nail 波）· worktree `meetwise-gdn` · branch `line/g7w-diag-needles`（建前零同名树/同名分支/同名卷三查亲证）· 立项出处=协调方派单令三针原文+案 A 卷 `62ffaffa` §9-LIVE 新红证据基座+backlog `:108` P1 OPEN+案 A/案 B/7a_diag/consent-capture 先例链+LEDGER `:493`/`:484` · 读码三项=R2 循环零帧/batchWallClock 只差中途落盘/红路 stderr 即弃三缺口（0.2a）+NDJSON 新二缝白名单（0.2b）+est live 口径（0.2c）· 修法=面① full.e2e.ts R2 退出帧 +1/−0（`:519` 前·deadline 到期形钉死）+面② interview.ts 心跳中途落盘 +3/−0（N=5·四循环·防自伤）+面③ run-e2e.mjs 红路 tsx stderr 尾量 +5/−1（32KiB cap·两红臂·withhold 三证）· 合 +9/±3/−0 硬帽 +20/−0 · ledger 26≤32 零变更 · 零 A() 零产品码零迁移零第三码面 · 门矩阵=A 段起草三锚（docs:check 2194≤2200+markers+diff 恰 1）+B 段 EXEC 七门（typecheck:e2e/lint/e2e-helpers:prove/静态门族/码面 diff/通道双查/判别 run LIVE 另授）· 迁移号=零 · est live=0 · `actualSpendCny=null` · pins 十一值照抄 · markers=0 · 停止条件五类全设 · Ban self-approve · pre-exec dual ≠ 开工 · STOP*

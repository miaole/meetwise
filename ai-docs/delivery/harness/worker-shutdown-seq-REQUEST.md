# WORKER-SHUTDOWN-SEQ REQUEST — worker 停机序刀（批5 盘点 Top3·QUEUE 族四行 #157/#158/#181/#156 Q2 残余收口·四件一卷零迁移 · 起草席落卷 · STOP=`draft:awaiting_pre_exec_dual` 三处）

> 战役 meetwise · 支线 `line/worker-shutdown-seq` · 工作树 `meetwise-wss` · 起草基线 @origin/feat/mysql-schema-skeleton=`5c8e122c`（派单下界「fetch 后 origin tip≥5c8e122c」以等号成立亲证=fetch 后 `origin/feat/mysql-schema-skeleton` tip `git hash-object` 亲算）· ⛔push ⛔merge 主线（push/翻面权归协调方）。主仓 worktree 建支线：`git worktree add ../meetwise-wss -b line/worker-shutdown-seq origin/feat/mysql-schema-skeleton`。
> 立项出处（不自建 SSOT 行——行翻面权归协调方）：①协调方派单 brief（2026-10-16·批5 盘点席 Top3·全 worker 停机序同域=QUEUE 族四行 #156/#157/#158/#181）；②QUEUE-SHUTDOWN 载体刀定谳承引（LEDGER `:568`/`:584` 管线 queue-shutdown-phases 行·「翻面载体非翻面·四行全闭还须 Q2+ 各子刀」本席亲读在卷）；③checklist `:2624` STILL OPEN 行 + `:3210` queue-shutdown-phases 段 STILL OPEN 行（本席亲读在卷）；④issues-master 四行原文仓外待补（协调方持有·不阻起草·EXEC 立项时如已入卷照 §0 协议补锚）。

## §0 现状锚（停机序全链双向锚·起草席亲读+blob 亲算 @`5c8e122c`·**EXEC 立项照本节对届时 tip 再重 pin——结论不变则只更行号**）

### 0.0 WHG 在飞登记+冲突预演（同域必做·本席亲证）

- **在飞登记**：WORKER-HANG-GUARD（`line/worker-hang-guard`·EXEC 中）与本刀同域（worker 停机/loop 面）。其 EXEC 波序1 并线已落=`4c20f12b`（merge `--no-ff` origin/feat/mysql-schema-skeleton@`5c8e122c`·与本刀基线同 tip 亲证）；其**码面未落**（`drain-loop.ts` @`4c20f12b` 仍 `ba51dd17` 恒等亲证·EXEC 码面待落）。
- **碰撞面对账**：WHG EXEC 触面=恰 5 码（`drain-loop.ts` 件① 签名第三参 `opts.tickWatchdogMs`+缺省 `TICK_WATCHDOG_DEFAULT_MS=600_000`+tick 体 `Promise.race` 具名中断；`drain-loop.proof.ts` 件② watchdog 臂组 ≥8；quiz/diagnosis/report 三 runner 显式第三参定值）+3 docs。本刀 EXEC 触面=恰 2 码（`drain-loop.ts` 件② ready() 体+in-flight 标志；`main.ts` 件① 分域组合）+2 proof（`drain-loop.proof.ts` append 臂组；`obs-ready.proof.ts` append 臂）。**同文件交叠两处**：`drain-loop.ts`（WHG 改签名+tick race 包裹区 vs 本刀改 ready() 体+tick 标志置位——同函数 ±5 行文本冲突窗·语义零冲突=两刀互不改对方机制）与 `drain-loop.proof.ts`（两刀均 append 新臂组·append 位冲突并集解可解）。
- **并线序裁定（本刀声明）**：**WHG EXEC 码面先落卷 → 本刀 EXEC 基线=含 WHG 码面的 tip**（merge `line/worker-hang-guard` 或其并线后的主线 tip）·届时对 `drain-loop.ts`/`drain-loop.proof.ts` 全量重 pin 后落码。理由：WHG EXEC 已在飞（序1 并线已落=其卷已冻结基线·后动者重 pin 成本低）；本刀 ready() 叠加在 WHG 后的内核上语义最清晰（watchdog 先在·豁免窗永不超越中断点）。反向（本刀先行）语义亦自洽（件② grace 自限 600s=WHG 缺位世界挂死仍翻红·协同性双向成立）但落序默认 WHG 先；若协调方令本刀先行，文本冲突沿并集解先例机械可解（本刀不动签名与 tick race·WHG 不动 ready() 体）·如实登记。
- **互斥触面对账**：WHG `main.ts` 零字节 Ban（13 调用点零改承诺）→本刀件① 触 `main.ts` 与 WHG 承诺单向无对撞亲证。本刀零字节 Ban 三 runner（quiz `477f09e8`/diagnosis `14a7b39c`/report `245c9ac5`）+`owner-queue-drain.ts` `2ce26c6c` →与 WHG 三 runner 触面互斥亲证=merge 面零新增冲突。
- **锚漂移对账（d5dc0726=WHG 起草基线 → 5c8e122c=本刀基线/WHG 并线 tip）**：`main.ts` `6fa1e374`→`61692bbb`（AG-20 askCostPolicy 一行 `:647`·本刀锚面 workerReady/drainStops 零语义漂移亲证 diff 全读）+`report-worker.ts` `a6a1f6c2`→`245c9ac5`（5C-BEHAVIOR-TRIO 件④ `:203` quarantine 键一行·WHG 触面邻锚漂移一行如实登记·WHG EXEC 重 pin 义务随其纪律）+其余全部锚恒等亲证（`drain-loop.ts` `ba51dd17`/`drain-loop.proof.ts` `2b401be2`/`ha-2-drain.proof.ts` `9079347b`/quiz `477f09e8`/diagnosis `14a7b39c`/`owner-queue-drain.ts` `2ce26c6c`）。

### 0.1 blob 锚表（`git rev-parse 5c8e122c:<path>` 亲算）

| 文件 | blob @`5c8e122c` | 本刀触面 |
|---|---|---|
| `apps/worker/src/main.ts` | `61692bbb` | **件① 触（分域 ready 组合）** |
| `apps/worker/src/drain-loop.ts` | `ba51dd17` | **件② 触（ready() in-flight 豁免）** |
| `apps/worker/test/drain-loop.proof.ts` | `2b401be2` | **件③ 触（新臂组 append·既有 14 臂零改零删）** |
| `apps/worker/test/obs-ready.proof.ts` | `17b13af3` | **件④ 触（分域端点臂·既有 9 臂零改零删）** |
| `apps/worker/test/ha-2-drain.proof.ts` | `9079347b` | **零字节 Ban**（门 2 邻面 58 臂=Q1 载体回归锚） |
| `apps/worker/src/privacy-erasure-worker.ts` | `8d9dd2eb` | **零字节 Ban**（两 privacy loop 工厂零触·分域在组合根收口） |
| `apps/worker/src/interview-consumer.ts` | `265798df` | **零字节 Ban**（#158 判据锚 :658-659·tick 体零触） |
| `apps/worker/src/interview-dispatch-fairness.ts` | `34f0144f` | **零字节 Ban**（合法深拍墙钟算术锚 :10-16+:22） |
| `apps/worker/src/owner-queue-drain.ts` | `2ce26c6c` | **零字节 Ban**（串行抽干形锚·WHG 邻锚同值） |
| `apps/worker/src/quiz-consumer.ts` | `477f09e8` | **零字节 Ban**（WHG 触面互斥声明） |
| `apps/worker/src/diagnosis-consumer.ts` | `14a7b39c` | **零字节 Ban**（WHG 触面互斥声明） |
| `apps/worker/src/report-worker.ts` | `245c9ac5` | **零字节 Ban**（WHG 触面互斥声明·5C-TRIO 漂移后值） |

### 0.2 停机序全链与四件触点事实（file:line 亲证 @`5c8e122c`）

- **停机全链**：`wireSignalShutdown(['SIGTERM','SIGINT'])` 双信号同一 handler（`main.ts:840`·`drain-loop.ts:160-166`）→`shutdownWorker`（`main.ts:822-839`·`workerShuttingDown` 幂等闩 :823）→wakeup 两 listener+redis client 先停（:826-828）→`drainWithDeadline(drainStops, WORKER_DRAIN_TIMEOUT_MS=30s 缺省, onTimeout 结构化日志 worker_drain_timeout signal/phase/in_flight)`（:829-831）→metrics close 2s race（:832-835）→`process.exit(0)`（:837）。
- **两相排水（Q1 载体已落·`drain-loop.ts:111-154`）**：`drainWithDeadline` 严格两相 `await runPhase('loop'…)→await runPhase('deps'…)`（:151-152）·份额 0.7/0.3 和恒等总上限（:97 `LOOP_PHASE_SHARE`·loop 21s/deps 9s@30s）·败者计时器纪律（:143）·逐相在飞名。`drainStops` 19 具名（`main.ts:800-820`）=loop 相 14（report/interview/quiz/diagnosis/route-classify/commerce/model-invocation-reconcile/usage-calibration-reconcile/usage-calibration-retention/qbank-release-sweep/privacy-erasure/**vector-plane-erasure**/gauge+stub-tick 条件展开）+deps 相 5（rag-cache/privacy-pool/qbank-control-pool/rag-control-pool/langfuse）。
- **件①（#156）现状**：`vectorPlaneErasureLoop` 组装 `main.ts:744`（`privacyPool ? runVectorPlanePrivacyEraser(privacyPool, …)`）·停机清单具名 `:812`（`name:'vector-plane-erasure'`·`phase:'loop'`）·`stop()` 等在飞擦除 tick 完整收尾（`drain-loop.ts:64-71`）·`privacyPool.end()` 在 deps 相 `:815` 后行=优雅路径「关池后擦除被中途打断」**Q1 已闭**（ha-2-drain :73-94 清单逐项断言+补漏件实接线断言 :94 在卷）·本刀零码锚定。
- **件①（#157）现状 OPEN**：`workerReady` AND 链 `main.ts:763-768` 含 `(privacyErasureLoop?.ready() ?? true)` 与 `(vectorPlaneErasureLoop?.ready() ?? true)`（:767）——privacy 域任一后台 sweep 连续 3 拍失败（`drain-loop.ts:50-51` cf≥3）即整 worker `/readyz/worker` 503=编排面拉闸/重启·而隐私擦除系 best-effort 后台 sweep（专用池 `privacyPool` :503·可选组装 :740-744）非队列健康面。`/readyz` 面：`/readyz/worker` 缺省 fail-closed（:264·#92）·`/readyz/rag` 缺省 fail-open（:258·W1b 钉）——分域端点沿 rag 形制有先例。
- **件②（#158）现状 OPEN**：`interviewLoop=runDrainLoop(interviewDispatchTick, 5000)`（`interview-consumer.ts:658-659`）·ready() 陈旧窗=`max(intervalMs*3, 5s)`=**15s**（`drain-loop.ts:76`）·而一拍 `interviewDispatchTick`（:632-657）=reap 全 owner+`fairDrainInterviewOwners` 量子轮转（launch cap 32/owner `interview-dispatch-fairness.ts:22`·globalInflight 4 :11）含 35s 级模型 invoke（WHG §0.2 invoke.ts:374-376 转录承引）→健康深拍墙钟可 ≫15s=拍内 `lastSuccessAt` 落窗→`ready()=false` 误翻红（拍在跑≠拍挂了）·LB 拉闸/重启恰砍在飞 job=与优雅排水目标对冲。
- **件②（#181）现状**：优雅路径**Q1 已闭**（loop 相全 settle 后 deps 相才起跑·:151-152 亲证）·**超时路径残面披露**：deadline 胜出相返回后被弃在飞 tick 与后继相并窗·在飞 tick 可触已 `end()` 池——残面有界（进程随即 exit 0·被弃 job 走租约过期→reaper/sweep 重领 crash-safe 既有）·非本刀面·如实披露不修。
- **WHG 面转录**（本席亲读 @`meetwise-whg` REQUEST §1.1）：WHG 件① watchdog 到点具名中断 `tick_watchdog_timeout`→既有 catch 臂 `consecutiveFailures++`→`ready()` 经 cf/陈旧窗翻红=挂死检测本体。本刀件② 陈旧豁免**不改该链**（cf 臂/首拍门/`!stopped` 三臂零改·挂死经 WHG 中断进 cf 或经 grace 自限 600s 落窗——两条翻红路任在）。

### 0.3 迁移号

零迁移零 DDL（预期·EXEC 复核=链尾迁移号无新占）。

## §1 修法（四件一卷定稿·恰 2 码文件+2 proof·零迁移零 env 闸）

### 1.0 四件分判

#156/#181=Q1 载体刀（queue-shutdown-phases）已闭·本刀**零码锚定**（门 2 复跑+残面披露）；#157/#158=真残余·本刀两件落码。判据：`drainStops` 具名/两相严格序 @`5c8e122c` 亲读在卷（§0.2）·LEDGER `:568`「四行全闭还须 Q2+ 各子刀」明文。

### 1.1 件①（#157）分域 ready（`main.ts` 恰一码文件）

- `startMetricsExposition` options 增 `privacyReady?: () => boolean`；新端点 `GET /readyz/privacy`（形态沿 `:readyz/rag` `:257-259`：ready→200 ready·否则 503 degraded·**缺省 `?? true` fail-open 沿 ragReady 形制**=域观测面非流量闸·与 :264 workerReady fail-closed 语义分层注释在卷）。
- bootstrap 组合（`:763-768`）：`workerReady` AND 链摘除 `(privacyErasureLoop?.ready() ?? true)` 与 `(vectorPlaneErasureLoop?.ready() ?? true)` 两肢→新 `privacyReady: () => (privacyErasureLoop?.ready() ?? true) && (vectorPlaneErasureLoop?.ready() ?? true)`。
- **同域判例扩张披露**：#157 原文点名向量擦除循环；checkpoint 擦除循环同形同耦合（同专用池/同 best-effort sweep/同 3 拍翻红）·一并入分域=同域对称收口（留同病一肢=缺陷下移一门）·pre-exec 双审有权裁收窄至 vectorPlane 单件（收窄形态=privacyErasure 肢回焊 AND 链·恰一行回退）。
- 两 loop 停机清单/两相归属**零触**（仍在 `drainStops` loop 相·:811-812 原样）·`ready()` 机制本体零改（翻红信号仍在·域归属变 `/readyz/privacy`）——WHG watchdog→ready() 翻红机制链对 privacy 域 loop 照达·仅观测端点分域。

### 1.2 件②（#158）ready() in-flight 陈旧豁免（`drain-loop.ts` 恰一码文件）

- `runDrainLoop` 闭包内新增 `tickInFlight`/`tickStartedAt` 标志（await tick() 前置位·finally 复位——与 WHG race 包裹区相邻 ±5 行·并线序 §0.0 已声明）+模块级导出常量 `INFLIGHT_READY_GRACE_MS = 600_000`。
- `ready()` 陈旧窗臂（:76）改：`… && (!stale || (tickInFlight && Date.now() - tickStartedAt <= INFLIGHT_READY_GRACE_MS))`——**在飞且在飞时长 ≤grace→陈旧臂豁免**（拍在跑=活动非失联）；settle 后照常落窗（闲置失联检测语义未废）；其余三臂（`!stopped`/`everSucceeded` 首拍门/`cf < 3`）**零改**。
- **WHG 协同算术**：grace 上界 600_000 与 WHG `TICK_WATCHDOG_DEFAULT_MS=600_000` 同值——WHG 在则豁免窗永不超越中断点（watchdog 到点中断→tick settle→标志复位→grace 终·挂死转 cf 计数翻红）；WHG 缺（本刀先行世界）则 grace 自限=挂死拍 600s 后陈旧臂复效翻红。**挂死检测两世界均不回归**·合法深拍（launch cap 32×~90s÷globalInflight 4 算术可分钟级·`interview-dispatch-fairness.ts:10-16` 锚）不再误翻红。
- 全 13 loop 共享语义（gauges/commerce 等短拍 loop 零行为位移=拍≪15s 豁免臂永不触·纯增益）；签名零改（第三参归 WHG·本刀零调用点扩散）。

### 1.3 否决（五件）

1. **进程管理器替代案**（k8s liveness/readiness 双门外部裁决替代分域）——外部杀进程=在飞 job 硬砍·违优雅排水纪律（`drainWithDeadline`+租约 crash-safe 是兜底非首选）·域信号内聚组合根不外溢编排假设·否决。
2. **快速失败/硬杀语义案**——弃在飞模型调用=成本账本 reserve 无 release/call 悬挂（WHG LIVE 三事实同形）·否决。
3. **workerReady 摘除核心消费循环案**（interview/quiz/diagnosis/report 出 AND 链）——readiness 不可观测反向缺陷（unready 不报=LB 继续打失联 worker）·本刀仅摘 privacy 后台 sweep 域·否决扩张。
4. **per-loop `readyWindowMs` opts 参数案**——与 WHG `opts.tickWatchdogMs` 同位第三参扩散·13 调用点面扩大违最小面；取全局语义修复（in-flight 豁免）零调用点改动·否决。
5. **断言放宽/豁免伪绿案**（lint budget 上调/既有臂删除）——Ban 通用纪律·否决。

### 1.4 件③/件④（proof 面）

- 件③ `drain-loop.proof.ts` 新臂组 ≥4（EXEC 定值·既有 14 臂零改零删）：臂1 长拍豁免（intervalMs=50 注入·tick 睡 ~200ms>150ms 窗·grace 内 `ready()=true`·**判别臂改前红**）；臂2 settle 恢复（长拍 settle 后新 success 置 `lastSuccessAt`→闲拍超窗照常翻红=窗语义未废）；臂3 grace 自限源级形（常量 600_000 在源+ready() 引用在源——运行时 600s 真睡不可行·Date 注入属签名面 Ban·如实披露源级形制）；臂4 回归锚（3 连败翻红/首拍门/`!stopped` 既有臂零改活体证）。
- 件④ `obs-ready.proof.ts` 新臂 ≥3（既有 9 臂零改零删）：P1 缺省 `privacyReady`→`/readyz/privacy` 200 ready（fail-open 形制）；P2 分域解耦直证（`privacyReady()=false`→503 degraded **且** 同注入 `workerReady()=true`→`/readyz/worker` 200 ready·privacy 红不拖 worker 绿·**判别臂改前红**）；P3 源级防回焊臂（main.ts workerReady 行不含向量擦除 ready 耦合词面·privacyReady 组合在源）。

## §2 门矩阵（八门·起草席基线亲跑值在卷·EXEC 期复跑+新臂落值）

1. **门1 判别臂双向**：件③臂1+件④P2 改前红改后绿（EXEC stash/checkout 取证·形式沿判别臂协议）。
2. **门2 ha-2-drain 回归锚**：`pnpm -C apps/worker prove:ha2-drain` 58/58 EXIT=0（该文件零字节 Ban·Q1 载体断言回归证据）。起草基线亲跑 **58/58 EXIT=0** 在卷。
3. **门3 邻面**：`prove:drain`（既有 14 臂+件③新臂全绿）+`prove:obs-ready`（既有 9 臂+件④新臂全绿）+`prove:owner-drain-order`+`prove:interview-dispatch` 全 EXIT=0。起草基线亲跑 14 臂/9 臂/两邻面全 EXIT=0 在卷。
4. **门4 typecheck**：`pnpm turbo typecheck --force` 8/8·0 cached·EXIT=0。起草基线亲跑在卷（13.4s）。
5. **门5 lint**：`pnpm turbo lint --force` 12/12·0 cached·EXIT=0·**worker 954 贴线恰等不破**（max-warnings 954·起草基线亲测 954 warnings 0 errors 恰等·新增行零 warning 纪律）。
6. **门6 docs:check**：EXIT=0 ≤2208。起草基线亲跑 **2202**（本卷前）·本 REQUEST 落卷后预期 **2203**≤2208 余 5·EXEC 零新增文件口径。
7. **门7 markers**：改动集全部新增行五类标记词运行时组装直扫 0/0（`['T','O','D','O']`/`['F','I','X','M','E']`/`['X','X','X']`/`['H','A','C','K']` join 词面+冲突标记对 `<` 连五 `>` 连·词面不入卷防自匹配）+全树行首冲突标记 grep EXIT=1 零命中。
8. **门8 diff 面**：EXEC 恰 **7 tracked**=2 码（`main.ts`+`drain-loop.ts`）+2 proof（`drain-loop.proof.ts`+`obs-ready.proof.ts`）+3 docs（本 REQUEST+LEDGER 管线行+checklist 段）·frozen-lockfile 零 lockfile 改·tsbuildinfo 门副产 checkout 回滚不入 commit。本起草卷 diff 恰 3 docs 零码面。

**停止条件（四类）**：**现场漂移**=届时 tip 对 §0.1 任一锚 blob/机制漂移（workerReady AND 链形变/drainWithDeadline 被动/ready() 三既存臂被改/drainStops 19 具名增删）→停·重 pin 回炉；**机制不满足**=件①②落位后门 1 判别臂或门 3 邻面红→停·如实升级（Ban 就地改因 Ban 扩面修）；**越界需要**=任何迁移/env 闸/签名第三参/停机清单改动/三 runner 触碰诉求→停·另刀或 §8 裁决行使；**WHG 冲突实爆**=并线冲突超并集解可解（同函数交叠区语义冲突）→停·协调方裁序。

## §5 pins（Ban+预算）

- est live=0（起草+EXEC 全程本地静态门+注入 proof·零模型外呼零 DB 零容器零外呼）· 0 Key 值 · `actualSpendCny=null`。
- **零迁移零 DDL 零 env 闸**：`INFLIGHT_READY_GRACE_MS` 系模块导出常量非 env·`drain-loop.ts` 纯注入形保持（proof 注入短 intervalMs 确定性证明·零时钟真睡）。
- frozen-lockfile 零 lockfile 改；worker lint max-warnings **954** 与 root cap **5235** 不放宽不上调。
- **零字节 Ban**（blob @`5c8e122c` §0.1 全表）：`ha-2-drain.proof.ts`（Q1 断言零触）·`privacy-erasure-worker.ts`（loop 工厂零触）·`interview-consumer.ts`·`interview-dispatch-fairness.ts`·`owner-queue-drain.ts`·quiz/diagnosis/report 三 runner（WHG 触面互斥·merge 面零新增冲突承诺）。
- 停机面零触承诺：`drainStops` 19 具名与 phase 标签零改·两相份额 0.7/0.3 零改·`WORKER_DRAIN_TIMEOUT_MS` 语义零改·`worker_drain_timeout` 日志形零改（QUEUE-SHUTDOWN 卷契约保持）。
- ready() 前三臂（`!stopped`/首拍门 #92/3 连败）与 obs-ready 既有 9 臂、drain-loop proof 既有 14 臂**零改零删**（既有断言面=回归锚非改造面）。
- `/readyz/worker` 缺省 fail-closed（#92）语义零改；`/readyz/rag` 形制零触。
- Ban self-approve · alone≠dual · Dual PASS ≠ 开工（开工须协调方明示授权）· post BOTH PASS ≠ push · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase · 禁就地扩面（§1.3 否决五件 EXEC 期不得翻案·翻案=回炉重审）。

## §8 STOP · `draft:awaiting_pre_exec_dual`（三处同值：本节+LEDGER 管线行+checklist 段）

- **开工三条款**：①pre-exec 双审两外席 **BOTH PASS 落卷**（双审席必含 §0.0 并线序确认=WHG 先/本刀先裁定行使权归协调方）；②**协调方明示 EXEC 授权**（含 §1.1 同域判例扩张（privacyErasure 并入分域）窄化裁决定行使落字·committed SHA 重钉）；③EXEC 立项**不得改 §1-修法定稿契约与 §5 pins**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（**若 WHG EXEC 码面已落卷·基线=含 WHG 码面 tip·`drain-loop.ts`/`drain-loop.proof.ts` 重算重锚**·行号漂移如实改锚·结论不变只更行号）。
- 本 commit 不预 claim 任何 EXEC 门值（§2 起草基线值=证据在卷非 EXEC 承诺）。

---
*WORKER-SHUTDOWN-SEQ REQUEST · 2026-10-16 起草 · STOP=`draft:awaiting_pre_exec_dual` · 起草 base=`feat/mysql-schema-skeleton` @`5c8e122c` · 分支 `line/worker-shutdown-seq` · 工作树 `meetwise-wss`（本起草席立·建前 branch/worktree 双查不存在）· 立项出处=协调方派单 brief（批5 盘点 Top3）+LEDGER `:568`/`:584` QUEUE-SHUTDOWN 载体定谳承引+checklist `:2624`/`:3210` STILL OPEN 锚定+issues-master 四行仓外待补 · 四件分判=#156/#181 Q1 已闭零码锚定+#157/#158 两件落码（分域 ready+in-flight 陈旧豁免）· WHG 在飞交叠预演在卷（§0.0 同文件两处交叠±5 行·并线序默认 WHG 先·三 runner 互斥零字节 Ban·锚漂移对账两件如实）· 触面=EXEC 恰 7 tracked（2 码+2 proof+3 docs）· 起草基线门亲跑全绿（ha2-drain 58/58+drain 14+obs-ready 9+邻面 2+typecheck 8/8+lint 12/12 worker 954 恰等+docs:check 2202≤2208）· est live=0 · actualSpendCny=null · 零迁移零 env 闸 · 停止条件四类全设未触发 · Ban self-approve · alone≠dual · ⛔push · ⛔merge主线 · STOP*

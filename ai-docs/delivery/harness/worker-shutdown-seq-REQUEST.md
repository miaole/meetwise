# WORKER-SHUTDOWN-SEQ REQUEST — worker 停机序刀（批5 盘点 Top3·QUEUE 族四行 #157/#158/#181/#156 Q2 残余收口·四件一卷零迁移 · EXEC 席落卷 · **STOP=`executed:awaiting_post_prove_dual`**[EXEC 席翻面 2026-10-16·前值 `draft:awaiting_pre_exec_dual`=起草+rev 史录]）

> 战役 meetwise · 支线 `line/worker-shutdown-seq` · 工作树 `meetwise-wss` · 起草基线 @origin/feat/mysql-schema-skeleton=`5c8e122c`（派单下界「fetch 后 origin tip≥5c8e122c」以等号成立亲证=fetch 后 `origin/feat/mysql-schema-skeleton` tip `git hash-object` 亲算）· ⛔push ⛔merge 主线（push/翻面权归协调方）。主仓 worktree 建支线：`git worktree add ../meetwise-wss -b line/worker-shutdown-seq origin/feat/mysql-schema-skeleton`。
> 立项出处（不自建 SSOT 行——行翻面权归协调方）：①协调方派单 brief（2026-10-16·批5 盘点席 Top3·全 worker 停机序同域=QUEUE 族四行 #156/#157/#158/#181）；②QUEUE-SHUTDOWN 载体刀定谳承引（LEDGER `:568`/`:584` 管线 queue-shutdown-phases 行·「翻面载体非翻面·四行全闭还须 Q2+ 各子刀」本席亲读在卷）；③checklist `:2624` STILL OPEN 行 + `:3210` queue-shutdown-phases 段 STILL OPEN 行（本席亲读在卷）；④issues-master 四行原文仓外待补（协调方持有·不阻起草·EXEC 立项时如已入卷照 §0 协议补锚）。

## §0 现状锚（停机序全链双向锚·起草席亲读+blob 亲算 @`5c8e122c`·**EXEC 立项照本节对届时 tip 再重 pin——结论不变则只更行号**）

### 0.0 WHG 在飞登记+冲突预演（同域必做·本席亲证）

- **在飞登记**：WORKER-HANG-GUARD（`line/worker-hang-guard`·EXEC 中）与本刀同域（worker 停机/loop 面）。其 EXEC 波序1 并线已落=`4c20f12b`（merge `--no-ff` origin/feat/mysql-schema-skeleton@`5c8e122c`·与本刀基线同 tip 亲证）；其**码面未落**（`drain-loop.ts` @`4c20f12b` 仍 `ba51dd17` 恒等亲证·EXEC 码面待落）。
- **碰撞面对账**：WHG EXEC 触面=恰 5 码（`drain-loop.ts` 件① 签名第三参 `opts.tickWatchdogMs`+缺省 `TICK_WATCHDOG_DEFAULT_MS=600_000`+tick 体 `Promise.race` 具名中断；`drain-loop.proof.ts` 件② watchdog 臂组 ≥8；quiz/diagnosis/report 三 runner 显式第三参定值）+3 docs。本刀 EXEC 触面=恰 2 码（`drain-loop.ts` 件② ready() 体+in-flight 标志；`main.ts` 件① 分域组合）+2 proof（`drain-loop.proof.ts` append 臂组；`obs-ready.proof.ts` append 臂）。**同文件交叠两处**：`drain-loop.ts`（WHG 改签名+tick race 包裹区 vs 本刀改 ready() 体+tick 标志置位——同函数 ±5 行文本冲突窗·语义零冲突=两刀互不改对方机制）与 `drain-loop.proof.ts`（两刀均 append 新臂组·append 位冲突并集解可解）。
- **并线序裁定（本刀声明）**：**WHG EXEC 码面先落卷 → 本刀 EXEC 基线=含 WHG 码面的 tip**（merge `line/worker-hang-guard` 或其并线后的主线 tip）·届时对 `drain-loop.ts`/`drain-loop.proof.ts` 全量重 pin 后落码。理由：WHG EXEC 已在飞（序1 并线已落=其卷已冻结基线·后动者重 pin 成本低）；本刀 ready() 叠加在 WHG 后的内核上语义最清晰（watchdog 先在·豁免窗永不超越中断点）。反向（本刀先行）语义亦自洽（件② grace 自限 600s=WHG 缺位世界挂死仍翻红·协同性双向成立）但落序默认 WHG 先；若协调方令本刀先行，文本冲突沿并集解先例机械可解（本刀不动签名与 tick race·WHG 不动 ready() 体）·如实登记。
- **互斥触面对账**：WHG `main.ts` 零字节 Ban（13 调用点零改承诺）→本刀件① 触 `main.ts` 与 WHG 承诺单向无对撞亲证。本刀零字节 Ban 三 runner（quiz `477f09e8`/diagnosis `14a7b39c`/report `245c9ac5`）+`owner-queue-drain.ts` `2ce26c6c` →与 WHG 三 runner 触面互斥亲证=merge 面零新增冲突。
- **锚漂移对账（d5dc0726=WHG 起草基线 → 5c8e122c=本刀基线/WHG 并线 tip）**：`main.ts` `6fa1e374`→`61692bbb`（AG-20 askCostPolicy 一行 `:647`·本刀锚面 workerReady/drainStops 零语义漂移亲证 diff 全读）+`report-worker.ts` `a6a1f6c2`→`245c9ac5`（5C-BEHAVIOR-TRIO 件④ `:203` quarantine 键一行·WHG 触面邻锚漂移一行如实登记·WHG EXEC 重 pin 义务随其纪律）+其余全部锚恒等亲证（`drain-loop.ts` `ba51dd17`/`drain-loop.proof.ts` `2b401be2`/`ha-2-drain.proof.ts` `9079347b`/quiz `477f09e8`/diagnosis `14a7b39c`/`owner-queue-drain.ts` `2ce26c6c`）。
- **rev 并线落点（2026-10-16·修订记事 §9.6）**：WHG EXEC 码面**已落卷**亲证（`line/worker-hang-guard` tip `f9416486`·STOP=`executed:awaiting_post_prove_dual`·双常量 `drain-loop.ts:24/:26`+三 runner 传参 :108/:106/:243 亲证）——本 rev 执行 §0.0 默认序：merge `f9416486`（--no-ff）入本支线=**EXEC 基线翻新为含 WHG 码面 tip**·§0.1 全表重 pin（§9.3）。上文「EXEC 中/码面未落/`drain-loop` 仍 `ba51dd17`」句以本 bullet 为权威更新。

### 0.1 blob 锚表（**rev 重 pin 2026-10-16【P2-C·§9.3】**：EXEC 基线翻新=含 WHG 码面 tip `10799a3e`（=origin/feat/mysql-schema-skeleton 现 tip=WHG nail 后 tip·本刀 rev 并线 merge `d18f3817` 并入亲证）·`git rev-parse HEAD:<path>` 亲算·漂移五行全系 WHG EXEC 码面所致·本刀触面/Ban 结论不变）

| 文件 | blob @rev 重 pin | 起草原值 @`5c8e122c` | 本刀触面 |
|---|---|---|---|
| `apps/worker/src/main.ts` | `61692bbb` | 恒等 | **件① 触（分域 ready 组合）** |
| `apps/worker/src/drain-loop.ts` | `325402fc` | `ba51dd17`→漂移（WHG 件① 码面：签名第三参+双常量 :24/:26+race 包裹） | **件② 触（ready() in-flight 豁免·臂锚 :76→:134）** |
| `apps/worker/test/drain-loop.proof.ts` | `6347f2f9` | `2b401be2`→漂移（WHG 件② watchdog 臂组 +16 新臂·既有臂 14→**30**） | **件③ 触（新臂组 append·既有 30 臂零改零删）** |
| `apps/worker/test/obs-ready.proof.ts` | `17b13af3` | 恒等 | **件④ 触（分域端点臂·既有 9 臂零改零删）** |
| `apps/worker/test/ha-2-drain.proof.ts` | `9079347b` | 恒等 | **零字节 Ban**（门 2 邻面 58 臂=Q1 载体回归锚） |
| `apps/worker/src/privacy-erasure-worker.ts` | `8d9dd2eb` | 恒等 | **零字节 Ban**（两 privacy loop 工厂零触·分域在组合根收口） |
| `apps/worker/src/interview-consumer.ts` | `265798df` | 恒等 | **零字节 Ban**（#158 判据锚 :658-659·tick 体零触） |
| `apps/worker/src/interview-dispatch-fairness.ts` | `34f0144f` | 恒等 | **零字节 Ban**（合法深拍墙钟算术锚 :10-16+:22） |
| `apps/worker/src/owner-queue-drain.ts` | `2ce26c6c` | 恒等 | **零字节 Ban**（串行抽干形锚·WHG 邻锚同值） |
| `apps/worker/src/quiz-consumer.ts` | `4c9d0b61` | `477f09e8`→漂移（WHG B 组传参 :108） | **零字节 Ban**（WHG 触面互斥声明·WHG 已触后重 pin） |
| `apps/worker/src/diagnosis-consumer.ts` | `5247e36b` | `14a7b39c`→漂移（WHG B 组传参 :106） | **零字节 Ban**（WHG 触面互斥声明·WHG 已触后重 pin） |
| `apps/worker/src/report-worker.ts` | `e89fec16` | `245c9ac5`→漂移（WHG B 组传参 :243） | **零字节 Ban**（WHG 触面互斥声明·WHG 已触后重 pin） |

### 0.2 停机序全链与四件触点事实（file:line 亲证 @`5c8e122c`）

- **停机全链**：`wireSignalShutdown(['SIGTERM','SIGINT'])` 双信号同一 handler（`main.ts:840`·`drain-loop.ts:160-166`）→`shutdownWorker`（`main.ts:822-839`·`workerShuttingDown` 幂等闩 :823）→wakeup 两 listener+redis client 先停（:826-828）→`drainWithDeadline(drainStops, WORKER_DRAIN_TIMEOUT_MS=30s 缺省, onTimeout 结构化日志 worker_drain_timeout signal/phase/in_flight)`（:829-831）→metrics close 2s race（:832-835）→`process.exit(0)`（:837）。
- **两相排水（Q1 载体已落·`drain-loop.ts:111-154`）**：`drainWithDeadline` 严格两相 `await runPhase('loop'…)→await runPhase('deps'…)`（:151-152）·份额 0.7/0.3 和恒等总上限（:97 `LOOP_PHASE_SHARE`·loop 21s/deps 9s@30s）·败者计时器纪律（:143）·逐相在飞名。`drainStops` 19 具名（`main.ts:800-820`）=loop 相 14（report/interview/quiz/diagnosis/route-classify/commerce/model-invocation-reconcile/usage-calibration-reconcile/usage-calibration-retention/qbank-release-sweep/privacy-erasure/**vector-plane-erasure**/gauge+stub-tick 条件展开）+deps 相 5（rag-cache/privacy-pool/qbank-control-pool/rag-control-pool/langfuse）。
- **件①（#156）现状**：`vectorPlaneErasureLoop` 组装 `main.ts:744`（`privacyPool ? runVectorPlanePrivacyEraser(privacyPool, …)`）·停机清单具名 `:812`（`name:'vector-plane-erasure'`·`phase:'loop'`）·`stop()` 等在飞擦除 tick 完整收尾（`drain-loop.ts:64-71`）·`privacyPool.end()` 在 deps 相 `:815` 后行=优雅路径「关池后擦除被中途打断」**Q1 已闭**（ha-2-drain :73-94 清单逐项断言+补漏件实接线断言 :94 在卷）·本刀零码锚定。
- **件①（#157）现状 OPEN**：`workerReady` AND 链 `main.ts:763-768` 含 `(privacyErasureLoop?.ready() ?? true)` 与 `(vectorPlaneErasureLoop?.ready() ?? true)`（:767）——privacy 域任一后台 sweep 连续 3 拍失败（`drain-loop.ts:50-51` cf≥3）即整 worker `/readyz/worker` 503=编排面拉闸/重启·而隐私擦除系 best-effort 后台 sweep（专用池 `privacyPool` :503·可选组装 :740-744）非队列健康面。`/readyz` 面：`/readyz/worker` 缺省 fail-closed（:264·#92）·`/readyz/rag` 缺省 fail-open（:258·W1b 钉）——分域端点沿 rag 形制有先例。
- **件②（#158）现状 OPEN**：`interviewLoop=runDrainLoop(interviewDispatchTick, 5000)`（`interview-consumer.ts:658-659`）·ready() 陈旧窗=`max(intervalMs*3, 5s)`=**15s**（`drain-loop.ts:76`）·而一拍 `interviewDispatchTick`（:632-657）=reap 全 owner+`fairDrainInterviewOwners` 量子轮转（launch cap 32/owner `interview-dispatch-fairness.ts:22`·globalInflight 4 :11）含 35s 级模型 invoke（WHG §0.2 invoke.ts:374-376 转录承引）→健康深拍墙钟可 ≫15s=拍内 `lastSuccessAt` 落窗→`ready()=false` 误翻红（拍在跑≠拍挂了）·LB 拉闸/重启恰砍在飞 job=与优雅排水目标对冲。
- **件②（#181）现状**：优雅路径**Q1 已闭**（loop 相全 settle 后 deps 相才起跑·:151-152 亲证）·**超时路径残面披露**：deadline 胜出相返回后被弃在飞 tick 与后继相并窗·在飞 tick 可触已 `end()` 池——残面有界（进程随即 exit 0·被弃 job 走租约过期→reaper/sweep 重领 crash-safe 既有）·非本刀面·如实披露不修。
- **WHG 面转录**（本席亲读 @`meetwise-whg` REQUEST §1.1+EXEC 落卷码面亲证·【rev 补登 §9.4】）：WHG 件① watchdog 到点具名中断 `tick_watchdog_timeout`→既有 catch 臂 `consecutiveFailures++`→`ready()` 经 cf/陈旧窗翻红=挂死检测本体。**SERIAL 组定值=SERIAL_DRAIN_TICK_WATCHDOG_MS=1_800_000**（rev 补登·与 `TICK_WATCHDOG_DEFAULT_MS=600_000` 并列导出 `drain-loop.ts:24/:26`@`f9416486` 亲证）+**三 runner 传参事实**（rev 补登）=quiz-consumer.ts:108/diagnosis-consumer.ts:106/report-worker.ts:243 各显式第三参 `{ tickWatchdogMs: SERIAL_DRAIN_TICK_WATCHDOG_MS }` 恰 1 行（runner 对外签名不变=main.ts 调用点零改）。本刀件② 陈旧豁免**不改该链**（cf 臂/首拍门/`!stopped` 三臂零改·挂死经 WHG 中断进 cf 或经 grace 自限 1_800s（30min·rev 修正原 600s 表述）落窗——两条翻红路任在）。**「挂死检测两世界均不回归」WHG 世界限定（rev 补）**：WHG 世界挂死翻红=watchdog→cf 链——cf 三击时延≈3×watchdog+每中断红隙~intervalMs（在飞豁免使翻红信号间歇化·终态 3 击翻红不废=限定语如实披露）。

### 0.3 迁移号

零迁移零 DDL（预期·EXEC 复核=链尾迁移号无新占）。

## §1 修法（四件一卷定稿·恰 2 码文件+2 proof·零迁移零 env 闸）

### 1.0 四件分判

#156/#181=Q1 载体刀（queue-shutdown-phases）已闭·本刀**零码锚定**（门 2 复跑+残面披露）；#157/#158=真残余·本刀两件落码。判据：`drainStops` 具名/两相严格序 @`5c8e122c` 亲读在卷（§0.2）·LEDGER `:568`「四行全闭还须 Q2+ 各子刀」明文。

### 1.1 件①（#157）分域 ready（`main.ts` 恰一码文件）

- `startMetricsExposition` options 增 `privacyReady?: () => boolean`；新端点 `GET /readyz/privacy`（形态沿 `:readyz/rag` `:257-259`：ready→200 ready·否则 503 degraded·**缺省 `?? true` fail-open 沿 ragReady 形制**=域观测面非流量闸·与 :264 workerReady fail-closed 语义分层注释在卷）。
- bootstrap 组合（`:763-768`）：`workerReady` AND 链摘除 `(privacyErasureLoop?.ready() ?? true)` 与 `(vectorPlaneErasureLoop?.ready() ?? true)` 两肢→新 `privacyReady: () => (privacyErasureLoop?.ready() ?? true) && (vectorPlaneErasureLoop?.ready() ?? true)`。
- **同域判例扩张披露**：#157 原文点名向量擦除循环；checkpoint 擦除循环同形同耦合（同专用池/同 best-effort sweep/同 3 拍翻红）·一并入分域=同域对称收口（留同病一肢=缺陷下移一门）·pre-exec 双审有权裁收窄至 vectorPlane 单件（收窄形态=privacyErasure 肢回焊 AND 链·恰一行回退）。**pre-exec 席1 判例扩张裁定=支持扩张已落卷（2026-10-16·checkpoint+vectorPlane 两 loop 同形同修·#157 不半留）**——收窄权条款原样保留（席2 复审+协调方 EXEC 授权落字终裁权不变·§8 ② 承·修订记事 §9.5）。
- 两 loop 停机清单/两相归属**零触**（仍在 `drainStops` loop 相·:811-812 原样）·`ready()` 机制本体零改（翻红信号仍在·域归属变 `/readyz/privacy`）——WHG watchdog→ready() 翻红机制链对 privacy 域 loop 照达·仅观测端点分域。
- **部署注记（rev 补·席1 P2 承）**：`/readyz/privacy` 新端点**零消费方**（新面·无编排面/LB 规则配置消费该端点=观测面落地先行）——分域生效不依赖外部消费方接线·现有流量闸（`/readyz/worker` fail-closed）行为零变·后续消费接线另案不入本刀。

### 1.2 件②（#158）ready() in-flight 陈旧豁免（`drain-loop.ts` 恰一码文件·【rev 权威修正 2026-10-16·席1 P1-A 定谳+协调方裁决选项 (b)·修订记事 §9.1】）

- `runDrainLoop` 闭包内新增 `tickInFlight`/`tickStartedAt` 标志（await tick() 前置位·finally 复位——与 WHG race 包裹区相邻 ±5 行·并线序 §0.0 已声明）+模块级导出常量 `INFLIGHT_READY_GRACE_MS = Math.max(TICK_WATCHDOG_DEFAULT_MS, SERIAL_DRAIN_TICK_WATCHDOG_MS)`（**rev 定稿**：废独立 magic number `600_000`·改引用同文件 WHG 双常量取 max——@WHG 码面 tip 算得 `1_800_000`·WHG 调整 watchdog 定值时豁免窗自动跟随）。
- `ready()` 陈旧窗臂改：`… && (!stale || (tickInFlight && Date.now() - tickStartedAt <= INFLIGHT_READY_GRACE_MS))`——**在飞且在飞时长 ≤grace→陈旧臂豁免**（拍在跑=活动非失联）；settle 后照常落窗（闲置失联检测语义未废）；其余三臂（`!stopped`/`everSucceeded` 首拍门/`cf < 3`）**零改**。（臂锚：`:76`@`5c8e122c` 起草锚 / `:134`@WHG 码面后 tip——rev 双锚亲证·EXEC 以 §0.1 重 pin 为准。）
- **WHG 协同算术（rev 重写）**：**豁免窗 ≥watchdog 对 DEFAULT 组与 SERIAL 组均成立**——`Math.max(600_000, 1_800_000)=1_800_000` ≥两组各自 watchdog 定值（原独立 `600_000` 对 SERIAL 组 quiz/diagnosis/report 失效=合法深拍 600-1800s 域内 watchdog 未中断而 grace 先到→陈旧臂复效误翻红复现·rev 修复面）。WHG 在则豁免窗永不先于中断点误翻红（watchdog 到点中断→tick settle→标志复位→grace 终·挂死转 cf 计数翻红）；「no-WHG 世界」（WHG 码面不在/退役形态）则 grace 自限=挂死拍 **1_800s（30min）** 后陈旧臂复效翻红——**自限翻红 30min 如实披露**（较原 600s 自限放宽·换两组豁免一致性·协调方裁决明示）。**挂死检测不回归（WHG 世界限定）**：WHG 世界挂死翻红走 watchdog→cf 链——cf 三击时延≈3×watchdog+每中断红隙~intervalMs（翻红信号在豁免窗内间歇化·终态 3 击翻红不废）。合法深拍（interview launch cap 32×~90s÷globalInflight 4 算术可分钟级·`interview-dispatch-fairness.ts:10-16` 锚+SERIAL 组深积压恢复域 1_800s 界）不再误翻红。
- 全 13 loop 共享语义（gauges/commerce 等短拍 loop 零行为位移=拍≪15s 豁免臂永不触·纯增益）；签名零改（第三参归 WHG·本刀零调用点扩散）。

### 1.3 否决（五件）

1. **进程管理器替代案**（k8s liveness/readiness 双门外部裁决替代分域）——外部杀进程=在飞 job 硬砍·违优雅排水纪律（`drainWithDeadline`+租约 crash-safe 是兜底非首选）·域信号内聚组合根不外溢编排假设·否决。
2. **快速失败/硬杀语义案**——弃在飞模型调用=成本账本 reserve 无 release/call 悬挂（WHG LIVE 三事实同形）·否决。
3. **workerReady 摘除核心消费循环案**（interview/quiz/diagnosis/report 出 AND 链）——readiness 不可观测反向缺陷（unready 不报=LB 继续打失联 worker）·本刀仅摘 privacy 后台 sweep 域·否决扩张。
4. **per-loop `readyWindowMs` opts 参数案**——与 WHG `opts.tickWatchdogMs` 同位第三参扩散·13 调用点面扩大违最小面；取全局语义修复（in-flight 豁免）零调用点改动·否决。
5. **断言放宽/豁免伪绿案**（lint budget 上调/既有臂删除）——Ban 通用纪律·否决。

### 1.4 件③/件④（proof 面）

- 件③ `drain-loop.proof.ts` 新臂组 ≥4（EXEC 定值·既有 **30** 臂零改零删【rev 重 pin=14 既有+16 WHG watchdog 臂·§9.3】）：臂1 长拍豁免（intervalMs=50 注入·陈旧窗=`max(intervalMs×3, 5_000)`=**5_000 系 5s 窗下限**【rev 算术修正·席1 P1-B 定谳=原「tick 睡 ~200ms>150ms 窗」表述删除·50×3=150 不超 5s 下限·原式判别臂恒绿失效】·**长拍睡 ~5.5s>5s 窗下限**·grace 内在飞采样 `ready()=true`·**判别臂改前红**）；臂2 settle 恢复（长拍 settle 后新 success 置 `lastSuccessAt`→**闲置 >5s 复红等待**（同 5s 窗下限）→闲拍超窗照常翻红=窗语义未废【rev 同步增补等待面·原表述漏窗下限必短睡假绿】）；臂3 grace 自限源级形（常量 `Math.max(TICK_WATCHDOG_DEFAULT_MS, SERIAL_DRAIN_TICK_WATCHDOG_MS)`=`1_800_000` 在源+ready() 引用在源——运行时 1_800s 真睡不可行·Date 注入属签名面 Ban·如实披露源级形制）；臂4 回归锚（3 连败翻红/首拍门/`!stopped` 既有臂零改活体证）。**proof 墙钟 ~12-15s 随卷登记**（臂1 ~5.5s+臂2 >5s 复红等待+间隔余量·rev 登记·EXEC 期复测落值为准）。
- 件④ `obs-ready.proof.ts` 新臂 ≥3（既有 9 臂零改零删）：P1 缺省 `privacyReady`→`/readyz/privacy` 200 ready（fail-open 形制）；P2 分域解耦直证（`privacyReady()=false`→503 degraded **且** 同注入 `workerReady()=true`→`/readyz/worker` 200 ready·privacy 红不拖 worker 绿·**判别臂改前红**）；P3 源级防回焊臂（main.ts workerReady 行不含向量擦除 ready 耦合词面·privacyReady 组合在源）。

## §2 门矩阵（八门·起草席基线亲跑值在卷·EXEC 期复跑+新臂落值）

1. **门1 判别臂双向**：件③臂1+件④P2 改前红改后绿（EXEC stash/checkout 取证·形式沿判别臂协议）。
2. **门2 ha-2-drain 回归锚**：`pnpm -C apps/worker prove:ha2-drain` 58/58 EXIT=0（该文件零字节 Ban·Q1 载体断言回归证据）。起草基线亲跑 **58/58 EXIT=0** 在卷。
3. **门3 邻面**：`prove:drain`（既有 **30** 臂【rev 重 pin=14 既有+16 WHG watchdog 臂·§9.3·WHG EXEC 门2 亲跑 30 PASS 在卷承引】+件③新臂全绿）+`prove:obs-ready`（既有 9 臂+件④新臂全绿）+`prove:owner-drain-order`+`prove:interview-dispatch` 全 EXIT=0。起草基线亲跑 14 臂/9 臂/两邻面全 EXIT=0 在卷（历史值@`5c8e122c`·rev 并线后 EXEC 期以 30 臂口径复跑）。
4. **门4 typecheck**：`pnpm turbo typecheck --force` 8/8·0 cached·EXIT=0。起草基线亲跑在卷（13.4s）。
5. **门5 lint**：`pnpm turbo lint --force` 12/12·0 cached·EXIT=0·**worker 954 贴线恰等不破**（max-warnings 954·起草基线亲测 954 warnings 0 errors 恰等·新增行零 warning 纪律）。
6. **门6 docs:check**：EXIT=0 ≤2208。起草基线亲跑 **2202**（本卷前）·本 REQUEST 落卷后预期 **2203**≤2208 余 5·EXEC 零新增文件口径【rev 并线后】WHG REQUEST 文件随并线入树+本 rev 文面增量→EXEC 期计数以 rev 席亲跑值（§9.6）为准。
7. **门7 markers**：改动集全部新增行五类标记词运行时组装直扫 0/0（`['T','O','D','O']`/`['F','I','X','M','E']`/`['X','X','X']`/`['H','A','C','K']` join 词面+冲突标记对 `<` 连五 `>` 连·词面不入卷防自匹配）+全树行首冲突标记 grep EXIT=1 零命中。
8. **门8 diff 面**：EXEC 恰 **7 tracked**=2 码（`main.ts`+`drain-loop.ts`）+2 proof（`drain-loop.proof.ts`+`obs-ready.proof.ts`）+3 docs（本 REQUEST+LEDGER 管线行+checklist 段）·frozen-lockfile 零 lockfile 改·tsbuildinfo 门副产 checkout 回滚不入 commit。本起草卷 diff 恰 3 docs 零码面。

**停止条件（四类）**：**现场漂移**=届时 tip 对 §0.1 任一锚 blob/机制漂移（workerReady AND 链形变/drainWithDeadline 被动/ready() 三既存臂被改/drainStops 19 具名增删）→停·重 pin 回炉；**机制不满足**=件①②落位后门 1 判别臂或门 3 邻面红→停·如实升级（Ban 就地改因 Ban 扩面修）；**越界需要**=任何迁移/env 闸/签名第三参/停机清单改动/三 runner 触碰诉求→停·另刀或 §8 裁决行使；**WHG 冲突实爆**=并线冲突超并集解可解（同函数交叠区语义冲突）→停·协调方裁序。

## §5 pins（Ban+预算）

- est live=0（起草+EXEC 全程本地静态门+注入 proof·零模型外呼零 DB 零容器零外呼）· 0 Key 值 · `actualSpendCny=null`。
- **零迁移零 DDL 零 env 闸**：`INFLIGHT_READY_GRACE_MS` 系模块导出常量非 env·`drain-loop.ts` 纯注入形保持（proof 注入短 intervalMs 确定性证明·零时钟真睡）。
- frozen-lockfile 零 lockfile 改；worker lint max-warnings **954** 与 root cap **5235** 不放宽不上调。
- **零字节 Ban**（blob @§0.1 rev 重 pin 表 2026-10-16·含 WHG 码面 tip 值）：`ha-2-drain.proof.ts`（Q1 断言零触）·`privacy-erasure-worker.ts`（loop 工厂零触）·`interview-consumer.ts`·`interview-dispatch-fairness.ts`·`owner-queue-drain.ts`·quiz/diagnosis/report 三 runner（WHG 触面互斥·merge 面零新增冲突承诺·WHG 已触后 blob 重 pin 结论不变）。
- 停机面零触承诺：`drainStops` 19 具名与 phase 标签零改·两相份额 0.7/0.3 零改·`WORKER_DRAIN_TIMEOUT_MS` 语义零改·`worker_drain_timeout` 日志形零改（QUEUE-SHUTDOWN 卷契约保持）。
- ready() 前三臂（`!stopped`/首拍门 #92/3 连败）与 obs-ready 既有 9 臂、drain-loop proof 既有 14 臂**零改零删**（既有断言面=回归锚非改造面）。
- `/readyz/worker` 缺省 fail-closed（#92）语义零改；`/readyz/rag` 形制零触。
- Ban self-approve · alone≠dual · Dual PASS ≠ 开工（开工须协调方明示授权）· post BOTH PASS ≠ push · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase · 禁就地扩面（§1.3 否决五件 EXEC 期不得翻案·翻案=回炉重审）。

## §8 STOP · `executed:awaiting_post_prove_dual`（EXEC 席翻面 2026-10-16·前值 `draft:awaiting_pre_exec_dual`=起草+rev 史录·三处同值：本节+LEDGER 管线行+checklist 段）

- **开工三条款**：①pre-exec 双审两外席 **BOTH PASS 落卷**（双审席必含 §0.0 并线序确认=WHG 先/本刀先裁定行使权归协调方）；②**协调方明示 EXEC 授权**（含 §1.1 同域判例扩张（privacyErasure 并入分域）窄化裁决定行使落字·committed SHA 重钉）；③EXEC 立项**不得改 §1-修法定稿契约与 §5 pins**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（**WHG EXEC 码面已落卷且已 nail（tip `10799a3e`=rev 时 origin tip）·rev 已并线（§9.6 merge `d18f3817`）·基线=含 WHG 码面 tip**：`drain-loop.ts` `ba51dd17`→`325402fc`/`drain-loop.proof.ts` `2b401be2`→`6347f2f9` 重算重锚+**三 runner 零字节 Ban blob 同步重算**（quiz `477f09e8`→`4c9d0b61`/diagnosis `14a7b39c`→`5247e36b`/report `245c9ac5`→`e89fec16`）+既有臂 14→30·§0.1 全表 rev 重 pin 在卷·行号漂移如实改锚·结论不变只更行号）。
- 本 commit 不预 claim 任何 EXEC 门值（§2 起草基线值=证据在卷非 EXEC 承诺）。

## §9 rev 修订注记（pre-exec 双审席1 FAIL P1×2 修订回路·rev 席落卷 2026-10-16·**append 注记形·上文 §0-§8 除授权修正句形外零洗**·本节为 EXEC 期对前文对应句的权威修正与增补）

> 席1 FAIL 定谳（rev 席逐位亲证成立）+协调方裁决：
> **P1-A（SERIAL 组 grace 失效）·协调方裁决=选项 (b)**：原 §1.2 独立常量 `INFLIGHT_READY_GRACE_MS=600_000` 对 WHG SERIAL 组（quiz/diagnosis/report·watchdog=`SERIAL_DRAIN_TICK_WATCHDOG_MS=1_800_000`）失效——合法深拍 600-1800s 域内 watchdog 未中断而 grace 先到→陈旧臂复效误翻红（恰与本刀反误翻红目标对冲）。rev 修复=常量改 `Math.max(TICK_WATCHDOG_DEFAULT_MS, SERIAL_DRAIN_TICK_WATCHDOG_MS)`（@含 WHG 码面 tip 算得 `1_800_000`·WHG 调整自动跟随·不再独立 magic number）。
> **P1-B（件③臂1 判别算术错）**：陈旧窗 `max(intervalMs*3, 5_000)` 有 **5s 下限**（rev 双锚亲证：`drain-loop.ts:76`@`5c8e122c` / `:134`@rev 并线后树）——原「intervalMs=50→窗 150ms·tick 睡 ~200ms」算术错（实窗 5_000ms·200ms 睡不超窗→判别臂恒绿失效）。rev 修复=臂1 改「长拍睡 ~5.5s>5s 窗下限」+臂2 增 >5s 闲置复红等待+proof 墙钟 ~12-15s 随卷登记。
> **P2-C/P2-B**：锚重 pin 义务+WHG 面转录补登（§9.3/§9.4）。
> **席1 通过项转录**：判例扩张裁定=**支持扩张**（checkpoint+vectorPlane 两 loop 同形同修·#157 不半留）→§1.1 落卷确认（§9.5）。
> rev 五修订+并线翻新如次·STOP 维持 `draft:awaiting_pre_exec_dual` 三处同值（§9.7）。

### §9.1 修订①（P1-A·协调方裁决选项 (b)）——§1.2 grace 常量定稿改写+协同论证重写

- §1.2 已按裁决以**权威修正句形**定稿改写（题头标注【rev 权威修正 2026-10-16·席1 P1-A 定谳+协调方裁决选项 (b)】）：`INFLIGHT_READY_GRACE_MS = Math.max(TICK_WATCHDOG_DEFAULT_MS, SERIAL_DRAIN_TICK_WATCHDOG_MS)`——**豁免窗 ≥watchdog 对 DEFAULT 组与 SERIAL 组均成立**（`max(600_000, 1_800_000)=1_800_000`·原独立 600_000 对 SERIAL 组失效面见上定谳）·「no-WHG 世界」自限翻红 **30min** 如实披露（较原 600s 自限放宽·换两组豁免一致性·裁决明示）·挂死检测不回归句加 **WHG 世界限定**（cf 三击时延≈3×watchdog+每中断红隙~intervalMs）。
- **并线序硬化注记（rev 如实登记）**：选项 (b) 常量引用同文件 WHG 双常量=对 WHG 码面**编译期依赖**——§0.0 默认序「WHG EXEC 码面先落」由软默认升为硬前提·「本刀先行」反向世界该引用编译不成立由序排除（原 §0.0「反向语义亦自洽（grace 自限 600s）」句随 (b) 失效·以本节与 §0.0 rev 并线落点 bullet 为权威更新）。

### §9.2 修订②（P1-B）——§1.4 臂1 算术修正+臂2 复红等待+proof 墙钟登记

§1.4 件③已按定谳修正（rev 权威修正句形）：臂1 **删 150ms 窗表述**改「**长拍睡 ~5.5s>5s 窗下限**」（5s 下限=陈旧窗第二参 `5_000`·席1 定谳 rev 双锚亲证·原式 50×3=150 不超下限=判别臂恒绿失效）+臂2 增「**闲置 >5s 复红等待**」（同窗下限·原表述漏窗下限必短睡假绿）+**proof 墙钟 ~12-15s 随卷登记**（臂1 ~5.5s+臂2 >5s 复红等待+间隔余量·EXEC 期复测落值为准）。

### §9.3 修订③（P2-C）——§0.1 锚全面重 pin（对含 WHG 码面 tip）+§8 括号补三 runner Ban blob 同步重算+既有臂 14→30

- §0.1 表 rev 重 pin 亲算值（`git rev-parse HEAD:<path>`@merge `d18f3817` 树=其二亲 `10799a3e` 恒等）：`drain-loop.ts` `ba51dd17`→**`325402fc`** / `drain-loop.proof.ts` `2b401be2`→**`6347f2f9`** / quiz `477f09e8`→**`4c9d0b61`** / diagnosis `14a7b39c`→**`5247e36b`** / report `245c9ac5`→**`e89fec16`**（五行漂移全系 WHG EXEC 码面所致·本刀触面/零字节 Ban 结论不变）+余七行恒等亲证（main `61692bbb`/obs-ready `17b13af3`/ha-2-drain `9079347b`/privacy-erasure-worker `8d9dd2eb`/interview-consumer `265798df`/interview-dispatch-fairness `34f0144f`/owner-queue-drain `2ce26c6c`）。
- **既有臂 14→30**：drain-loop proof 既有断言面=14 既有+16 WHG watchdog 臂=**30 臂**（WHG EXEC 门2 亲跑 30 PASS 在卷承引）——§0.1 件③ 行/§1.4 件③/§2 门3 口径随更·「既有臂零改零删」承诺面从 14 扩至 30。
- §8 开工条款③ 括号已补：WHG 码面已落+已 nail 前提落字+三 runner 零字节 Ban blob 同步重算（三旧值→三新值全录）。
- 行号漂移要录（rev 亲证@并线后树）：ready() 陈旧窗臂 `:76`→**`:134`** / `runDrainLoop` 签名 `:14`→**:66** / 两相 `runPhase` `:151-152`→**:209-210** / WHG 双常量 `:24`+**:26** / 三 runner 传参 quiz `:108`/diagnosis `:106`/report `:243`（WHG 后值）——§0.2 历史锚 @`5c8e122c` 原样保留（§0 header 重 pin 协议管辖）·EXEC 期以本节+§0.1 为准。

### §9.4 修订④（P2-B）——§0.2 WHG 面转录补登+/readyz/privacy 零消费方部署注记

- §0.2 WHG 面转录已补四件：**SERIAL_DRAIN_TICK_WATCHDOG_MS=1_800_000**（`:26`@`f9416486` 亲证）+**三 runner 传参事实**（quiz `:108`/diagnosis `:106`/report `:243` 各显式第三参恰 1 行·runner 签名不变）+**「挂死检测两世界均不回归」WHG 世界限定**（cf 三击时延≈3×watchdog+每中断红隙~intervalMs·在飞豁免使翻红信号间歇化·终态 3 击翻红不废）+grace 自限值 600s→**1_800s（30min）**（P1-A 联动修正）。
- §1.1 已补**部署注记**：`/readyz/privacy` 新端点**零消费方**（新面·无编排面/LB 规则消费=观测面先行）·分域生效不依赖外部接线·现有流量闸（`/readyz/worker` fail-closed）行为零变·后续消费接线另案不入本刀。

### §9.5 修订⑤（席1 通过项）——判例扩张=支持扩张落卷确认

pre-exec 席1 判例扩张裁定=**支持扩张**（checkpoint+vectorPlane 两 loop 同形同修·#157 不半留）→§1.1 判例扩张 bullet 尾注落卷确认；收窄权条款原样保留（席2 复审+协调方 EXEC 授权落字终裁权不变·§8 ② 承）。

### §9.6 rev 并线翻新（EXEC 基线=含 WHG 码面 tip）+门 rev 后口径（rev 席亲跑）

- **并线**：本 rev 席 fetch 两巡——首巡 origin tip=`5c8e122c`（WHG 码面未到主线）·按 §0.0 默认序 merge `line/worker-hang-guard`（届 tip 已含 WHG EXEC `f9416486`+nail `10799a3e`·nail 系 SSOT 注记两 .md 零码面）→**merge `d18f3817`**（--no-ff·双亲 `96de2ff5`+`10799a3e`·merge-base `5c8e122c` 亲证·LEDGER/checklist auto-merge **并集解**双段双保零手工冲突）·复巡 fetch 亲证 **origin/feat/mysql-schema-skeleton tip=`10799a3e`**（WHG nail 推送席已直推主线）且 `git merge-base --is-ancestor origin/feat/mysql-schema-skeleton HEAD` EXIT=0=origin 最新 tip 已在本卷·派单「届时≥WHG nail 后 tip」成立。**erratum 如实登记**：merge 令文书写 `@f9416486`·届 tip 实为 `10799a3e`（WHG nail 于本 rev 工序间隙落卷推线·码面 blob 恒等·§0.1 重 pin 值不受影响）——沿 erratum 先例以卷内现值为准·merge commit 不改写。
- 门6 `docs:check`：EXIT=0 **2204≤cap 2208** 余 4（rev 席亲跑·merge 携入 WHG REQUEST 文件 +1+本 rev 文面零新增文件）。
- 门7 markers：rev 增量行 75 行五类标记词+冲突对直扫 **0/0**+全树行首冲突标记 grep EXIT=1 零命中（受管树排除 receipts 历史收据横线沿起草口径·词面不入卷防自匹配）。
- EXEC 基线=本卷（含 WHG 码面 tip）·§2 起草基线门值系 `5c8e122c` 历史证据非 EXEC 承诺·EXEC 期全门按 §9.3 口径复跑（drain proof 30 臂+件③新臂）。

### §9.7 rev 后 STOP 状态

**STOP=`draft:awaiting_pre_exec_dual` 三处同值维持**（本 REQUEST §8+LEDGER 管线「worker-shutdown-seq 起草」行+execution-master-checklist「Line worker-shutdown-seq」段·零改）。rev 落卷后待**窄域复审确认**五条修订落点（§9.1-§9.5）→重派/续派 pre-exec 双审两席（席1 FAIL 已走 rev 回路·席2 审 pending）；开工权归协调方·⛔push ⛔merge 主线 ⛔改码面（本 rev 恰 1 doc 零码面·merge 系 §0.0 预案并线=主线入支线方向非「merge 主线」禁面）。

### §9.8 EXEC 记录（EXEC 席落卷 2026-10-16·七字段+F1/F2/F3 落点+前瞻耦合注记·STOP→`executed:awaiting_post_prove_dual`）

**授权链**：起草落卷 `96de2ff5`→rev 落卷 `92d9d807`（席1 FAIL P1×2 修订回路·五条修订+并线翻新）→pre-exec 双审**重派会签 PASS×2**（席1 `agent_fb2861c3`+席2 `agent_1d5ed158`·「可授权 EXEC」）→协调方明示授权 EXEC（派单令·STOP→executed:awaiting_post_prove_dual）→EXEC 本卷（git fetch 亲证 `origin/feat/mysql-schema-skeleton`=`656fc7be`·派单下界「届时 tip≥656fc7be」等号成立亲证→**merge `630586f8`** `--no-ff` 双亲 `92d9d807`+`656fc7be`·冲突恰两 SSOT docs append 区沿并集解双段双保[HEAD 段在前·殿后=落线时序·沿 G7TRIO-2 先例]·码面 main.ts/drain-loop.ts 与 WHG/QUEUE/G7W 触面零 hunk 交叠预证兑现=auto-merge 零冲突·冲突标记行首全树零残留·⛔pull --rebase 未用）。

**① 门矩阵全表**（并线树 `630586f8` 基·交付 commit 前本席亲跑）：

| # | 门 | 判据 | 实测 | EXIT | 结论 |
|---|---|---|---|---|---|
| 1 | 判别臂双向 | 件③臂1+件④P2 改前红改后绿 | stash 两码面+drain-loop 常量 shim（仅补 ESM 导出名使臂达断言层·取证形不入卷）→改前 drain **34 PASS/2 FAIL**（臂1b 判别红[旧陈旧臂在飞直判 false]+臂3 源级 pin 红·既有 30 臂全 PASS 零损）+obs-ready **9 PASS/3 FAIL**（P1/P2/P3·改前端点 404/组合缺位）；回滚 pop 后改后 drain **36 PASS/0 FAIL** 3 连跑 EXIT=0 稳定+obs-ready **12 全绿** | 0 | 绿（双向亲证） |
| 2 | ha-2-drain | 58/58 恰等基线 | 58 PASS/0 FAIL（零字节 Ban 面零触） | 0 | 绿 |
| 3 | 邻面 | drain 既有 30 零改+obs-ready 既有 9 零改+owner-drain-order+interview-dispatch | drain 既有 30 臂逐字节零改亲证（append 形）+obs-ready 既有 9 臂零改+owner-drain-order **EXIT=0**+interview-dispatch **EXIT=0** | 0 | 绿 |
| 4 | typecheck | 8/8·0 cached | 8 successful, 8 total·Cached: 0（63.6s） | 0 | 绿 |
| 5 | lint | 12/12·0 cached·五值恰等 | 12 successful, 12 total·0 cached（31.3s）·root **5235**/web **601**/api **1421**/db **1042**/worker **954** 全 0 errors 逐一实测恰等（中途 955 红自纠=新端点 `'content-type'` 对象字面量键 naming-convention +1→改 `res.setHeader` 字符串参形 wire 恒等复跑归 **954** 恰等·沿 WHG EXEC 红自纠先例·§5 954 不放宽 pin 兑现） | 0 | 绿 |
| 6 | docs:check | EXIT=0·≤cap 2216 | **2211**≤2216 余 5（谱系=rev 席亲跑 2204+并线携入受管新件 7[六 REQUEST+`packages/contracts/src/public-preview.ts`]·本卷零新增文件） | 0 | 绿 |
| 7 | markers | 改动集新增行五类词+冲突对零命中+全树行首冲突标记零命中 | git diff 新增行直扫（词表沿 `scripts/i6-239-gates.proof.mjs:154` 运行时组装·词面不入卷防自匹配）**0 hits**；全树行首冲突标记严格形 `git grep -nE '^(<{6} \|={7}\$|>{6} )'` EXIT=1 零命中 | 0 | 绿 |
| 8 | diff 面 | 恰 7 tracked=2 码+2 proof+3 docs·零新受管 | 2 码（`main.ts`+`drain-loop.ts`）+2 proof（`drain-loop.proof.ts`+`obs-ready.proof.ts`）+3 docs（本 REQUEST+LEDGER 行+checklist 段）·零新增文件·§0.1 零字节 Ban 八锚零触亲证 | 0 | 绿 |
| 卫生 | frozen-lockfile+tsbuildinfo+est live | lockfile 零改·门副产回滚·est live=0 | `pnpm install --frozen-lockfile` EXIT=0（1.9s）零 lockfile 改·`apps/web/tsconfig.tsbuildinfo` 门副产 checkout 回滚·est live=0（proof 注入短墙钟形+本地静态门·零模型外呼零 DB 零容器零 Key 零 secrets）·`actualSpendCny=null`·零迁移零 DDL 零 env 闸（grace 常量模块导出形非 env） | 0 | 绿 |

**② 机制证（新臂账·件①② 落码账）**：drain-loop proof 新增 **6 臂**（≥4 判据·既有 30 零改零删=**36**）——豁免臂1a 长拍入飞（首拍成功+第二拍在飞·intervalMs=50→陈旧窗=5s 下限）+**臂1b 长拍豁免判别臂**（长拍睡 ~5.5s>5s 窗下限·在飞越过陈旧点采样 `ready()=true`·改前旧陈旧臂直判 false=判别红）；豁免臂2a/2b 复红形（**F2 定稿形**：独立 loop 实例·intervalMs=1000[窗 5s 下限]·`opts.tickWatchdogMs=3000` 注入[proof 侧 WHG 既有第三参]·首拍 settle 后 tick 挂死→第 2/3 次看门狗中断间红隙采样 `!ready() && snapshot().consecutiveFailures < 3`=非在飞陈旧照常翻红而 3 连败臂未满=闲置失联窗语义未废）；豁免臂3 grace 源级形（`INFLIGHT_READY_GRACE_MS===Math.max(TICK_WATCHDOG_DEFAULT_MS,SERIAL_DRAIN_TICK_WATCHDOG_MS)===1_800_000`+ready() 豁免引用在源——运行时 1_800s 真睡不可行·Date 注入属签名面 Ban·源级形制披露）；豁免臂4 回归锚（首拍成功 ready() 绿→stop 后恒红=`!stopped` 臂活体证·3 连败/首拍门既有臂同卷零改活跑）。obs-ready 新增 **3 臂**（既有 9 零改零删=**12**）——P1 缺省 `/readyz/privacy` 200 ready（fail-open 形制沿 ragReady）；**P2 分域解耦判别臂**（同注入 `privacyReady()=false`+`workerReady()=true`→privacy 503 degraded **且** worker 200 ready=privacy 红不拖 worker 绿·改前端点 404=判别红）；P3 源级防回焊（main.ts workerReady 组合零两 privacy loop ready 耦合词面+privacyReady 组合在源）。件② 落码=`drain-loop.ts` 闭包内 `tickInFlight`/`tickStartedAt` 标志+模块导出 `INFLIGHT_READY_GRACE_MS=Math.max(TICK_WATCHDOG_DEFAULT_MS, SERIAL_DRAIN_TICK_WATCHDOG_MS)`（:36）+ready() 陈旧臂改 `(!stale || (tickInFlight && Date.now() - tickStartedAt <= INFLIGHT_READY_GRACE_MS))`（:157·其余三臂 `!stopped`/`everSucceeded`/`consecutiveFailures<3` 零改）。件① 落码=`main.ts` options 增 `privacyReady?: () => boolean`（:242）+新端点 `GET /readyz/privacy`（:266-272·ready→200 ready/否则 503 degraded·缺省 `?? true` fail-open 沿 ragReady 形制·响应头 setHeader 字符串参形=零新 warning）+bootstrap AND 链摘除两 privacy 肢→`privacyReady: () => (privacyErasureLoop?.ready() ?? true) && (vectorPlaneErasureLoop?.ready() ?? true)`（:780·drainStops 两 loop loop 相归属零触）。

**③ diff numstat（EXEC 手迹账·对并线落点 `630586f8`）**：2 码：`drain-loop.ts` +24/−1（件② 全部）/`main.ts` +15/−2（件① 全部）；2 proof：`drain-loop.proof.ts` +53/−1（件③ 6 臂）/`obs-ready.proof.ts` +27/−0（件④ 3 臂）；3 docs：本 REQUEST+LEDGER 行+checklist 段（终值以交付 commit numstat 为准）·恰 7 tracked 零新增文件。

**④ 重 pin 全表**：§0.1 十二锚对并线树 `630586f8` `git rev-parse HEAD:<path>` 亲算 **12/12 恒等**（main `61692bbb`/drain-loop `325402fc`/drain-loop.proof `6347f2f9`/obs-ready `17b13af3`/ha-2-drain `9079347b`/privacy-erasure-worker `8d9dd2eb`/interview-consumer `265798df`/interview-dispatch-fairness `34f0144f`/owner-queue-drain `2ce26c6c`/quiz `4c9d0b61`/diagnosis `5247e36b`/report `e89fec16`）=双审预证兑现·免改锚。行号漂移（本刀落码所致·落码后值）：`runDrainLoop` :66→**:76**/ready() 陈旧窗臂 :134→**:150（豁免臂 ：157）**/两相 `runPhase` :209-210→**:232-233**/WHG 双常量 ：24/:26 恒等+新常量 `INFLIGHT_READY_GRACE_MS` **：36**；main.ts options :242/新端点 ：266-272/`privacyReady` 组合 **：780**。

**⑤ 偏离清单**：理想零。登记一条非偏离如实注记=门5 中途 955 红自纠（新端点 `'content-type'` 对象字面量键 +1 warning·改 `res.setHeader('content-type','text/plain')` 字符串参形——线上 wire 恒等[同一 content-type 头]·obs-ready 12 臂复跑全绿复证·复跑归 954 恰等·沿 WHG EXEC「红自纠=臂自增强非语义冲销」先例）。其余零偏离：§1-修法四件落位与 §9.1/§9.2 权威定稿逐字兑现·零迁移零 env 闸零签名第三参零停机清单触。

**⑥ pins 零翻声明+停止条件判定**：§5 pins 全值对届树复验恰等（ha2-drain 58/drain 既有 30/obs-ready 既有 9/typecheck 8/8/lint 五值恰等/worker 954+root 5235 不放宽/docs cap 2216 sanction 后值/零字节 Ban 八锚零触/`/readyz/worker` fail-closed 与 `/readyz/rag` 形制零触/drainStops 19 具名与两相份额 0.7/0.3 零触）；停止条件四类逐条判定=①现场漂移——**未触发**（§0.1 十二锚 12/12 恒等·workerReady AND 链形/drainWithDeadline/ready() 三既存臂/drainStops 19 具名全亲证在位）②机制不满足——**未触发**（门1 判别臂双向绿+门3 邻面全绿）③越界需要——**未触发**（触面恰 7 tracked 全在授权清单内）④WHG 冲突实爆——**未触发**（merge 冲突恰两 SSOT docs append 区并集解·码面 auto-merge 零冲突）。

**⑦ markers 扫描命令与回执**：改动集=本刀 2 码+2 proof 对并线落点**本席手迹**新增行，`git diff | node` 运行时组装词表直扫（四标记词+行首冲突标记对·词面不誊入卷防自匹配）**0 hits**；全树行首冲突标记严格形 EXIT=1 零命中；docs:check 终树 **2211**≤2216 EXIT=0。

**F1/F2/F3 落点（EXEC 三携带纪律兑现）**：**F1**=in-flight 标志落位权威解读兑现——`tickInFlight=true; tickStartedAt=Date.now()` 于 loop 体 `await raceWithTickWatchdog` 调用前（drain-loop.ts:113-114·await 前置位）+**同层 finally 复位**（:128·与 await 同一 try/finally 层）·标志生命周期=迭代生命周期·**零 race 内部包 tick 成员**（弃 tick 迟 settle finally 跨迭代清标志缺陷形未犯·臂1b/臂2b 活体证两向）。**F2**=臂2 复红形按定稿落值（独立 loop 实例·intervalMs=1000·opts.tickWatchdogMs=3000·settle 后挂死→第 2/3 次中断间红隙采样 `!ready() && cf<3`）·墙钟臂1 ~5.5s+臂2 ~8-9s≈**14-15s**（实测三连跑全程 EXIT=0 在 ~15s 内·落值与 §9.2 登记带恰符）。**F3**=LEDGER 管线行+checklist 段 **append 注记形刷新旧值五件**（grace `Math.max` 形 `1_800_000`[废独立 600_000 表述]/drain 既有 **30 臂**[14+16 WHG]口径/三 runner 新 blob `4c9d0b61`/`5247e36b`/`e89fec16`/WHG **已 nail**[`10799a3e`]/行号 **：134/:66/:209-210** 漂移要录）——STOP 字面刷新处零改（翻面沿本节专笔·前值史录形）。

**前瞻耦合注记（席1 观察①·随卷登记）**：本刀 `INFLIGHT_READY_GRACE_MS=Math.max(TICK_WATCHDOG_DEFAULT_MS, SERIAL_DRAIN_TICK_WATCHDOG_MS)=1_800_000` 的「豁免窗 ≥watchdog」不变式**只对引用此两组具名常量的 loop 组成立**——若未来第三组 loop 经 `opts.tickWatchdogMs` 传入 **>1_800_000** 的定值，则豁免窗先于该组 watchdog 中断点到点（合法深拍在飞将被陈旧臂误翻红·恰与本刀反误翻红目标对冲）——处置路径=纳入 max 实参或上调 SERIAL 组定值（二择一归后继刀/协调方裁·本刀不预改零扩散）。

**STOP=`executed:awaiting_post_prove_dual`（EXEC 席翻面 2026-10-16·前值 `draft:awaiting_pre_exec_dual`=起草+rev 史录·三处同值翻面=本 REQUEST §8+LEDGER 管线「worker-shutdown-seq 起草」行+execution-master-checklist「Line worker-shutdown-seq」段·post-prove 双审两独立外席待派·alone≠dual）**。

---
*WORKER-SHUTDOWN-SEQ REQUEST · 2026-10-16 起草 · STOP=`executed:awaiting_post_prove_dual`[EXEC 席翻面·前值 `draft:awaiting_pre_exec_dual` 史录] · 起草 base=`feat/mysql-schema-skeleton` @`5c8e122c` · 分支 `line/worker-shutdown-seq` · 工作树 `meetwise-wss`（本起草席立·建前 branch/worktree 双查不存在）· 立项出处=协调方派单 brief（批5 盘点 Top3）+LEDGER `:568`/`:584` QUEUE-SHUTDOWN 载体定谳承引+checklist `:2624`/`:3210` STILL OPEN 锚定+issues-master 四行仓外待补 · 四件分判=#156/#181 Q1 已闭零码锚定+#157/#158 两件落码（分域 ready+in-flight 陈旧豁免）· WHG 在飞交叠预演在卷（§0.0 同文件两处交叠±5 行·并线序默认 WHG 先·三 runner 互斥零字节 Ban·锚漂移对账两件如实）· 触面=EXEC 恰 7 tracked（2 码+2 proof+3 docs）· 起草基线门亲跑全绿（ha2-drain 58/58+drain 14+obs-ready 9+邻面 2+typecheck 8/8+lint 12/12 worker 954 恰等+docs:check 2202≤2208）· est live=0 · actualSpendCny=null · 零迁移零 env 闸 · 停止条件四类全设未触发 · Ban self-approve · alone≠dual · ⛔push · ⛔merge主线 · STOP*

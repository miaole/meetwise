# QUEUE-SHUTDOWN worker 收尾序两阶段化刀（5C-QUEUE 拆刀排程 Q1 · drainWithDeadline 单相并行→loop 相/依赖相两阶段排空 · EXEC REQUEST · 落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（pre-exec 双审 BOTH PASS 会签在卷：席1 `agent_0158b7a6`+席2 `agent_982e865c`·P2×3 随卷 EXEC 立项落笔 · 协调方明示 EXEC 授权 · EXEC 十门全绿落卷=本档 §9 · post 双审待开 · Ban self-approve · alone≠dual · post BOTH PASS ≠ push · ⛔push）
**席位**：QUEUE-SHUTDOWN 两阶段化刀起草席（协调方派单·5C-QUEUE 拆刀排程 Q1·授权按 LEDGER :87 组标签+checklist :2624 锚定·⛔push·⛔merge主线）。
**基线**：`feat/mysql-schema-skeleton` @ `f20e38c8`（gitleaks-archive-expand+hmac-consolidate 双 nail 收官 SSOT commit·docs:check 2176≤cap 2184 本席本树亲跑）· 分支 `line/queue-shutdown-phases`（本席 `git worktree add ../meetwise-q1s -b line/queue-shutdown-phases` 亲立·建树时落 `0ff55592`·起草中主线推进→`git merge --ff-only origin/feat/mysql-schema-skeleton` 随动至 `f20e38c8`——分支当时零 commit·ff 零冲突零 merge 节点·⛔pull --rebase 未用）· 工作树 `meetwise-q1s`（仓根同级）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①协调方派单 brief（2026-10-16·5C-QUEUE 诊断席定谳承引：QUEUE 族四行 #157/#158/#181/#156=worker 收尾序·缺口正身=`drain-loop.ts:112-121` 单相并行全项同拍起跑·修法=两阶段排空·≤1 天可控）；②LEDGER :87 组标签（5C 可靠性行「#157/#158/#181/#156 worker 收尾序」在册未翻·本席亲读在卷）；③checklist :2624 STILL OPEN 行（「#157 旁路后刀（worker 收尾序 5C 队列·本刀 workerReady 面仅 #92 口径·收尾序零触）」·本席亲读在卷）；④issues-master 四行原文（#157/#158/#181/#156）**仓外待补**（协调方持有·不阻起草·EXEC 立项时如已入卷照 §0 重 pin 协议补锚）。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git hash-object/活体 run 实测 @`f20e38c8`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号·EXEC 重 pin 已行 @`f2e8de7b`（merge `c9beb402`·见 §0.2-6））

### 0.0 防重双对表

- `git branch --list "line/queue-shutdown-phases"` 恰 1 命中=本席分支；`git worktree list` 48 树中 queue 词面恰 2=`meetwise-qfm`（`line/queue-family`·tip=`397d037b`=旧 origin tip 零独有 commit·非本刀触面）+本 `meetwise-q1s`——无第二 queue-shutdown 同名树。
- `ls ai-docs/delivery/harness/ | grep queue-shutdown` 建前零命中→落卷后唯一同名卷=本卷。
- 本刀在飞相 stock 面：`line/queue-family` 树零独有 commit（`git rev-list --count f20e38c8..397d037b` 口径下 `397d037b` 为 `f20e38c8` 祖先亲证）·与本刀零交叠（§3）。

### 0.1 blob 锚表（`git hash-object` 亲算 @`f20e38c8`·核心五锚自 `0ff55592` 起零漂移亲证·**EXEC 重 pin @`f2e8de7b`：四核心+八锚 blob 恒等亲证（纯改号）·唯一漂移=`public-text-policy.mjs` `322e277a`→`0548e848`（cap 2184→2192·行随实改锚）**）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `apps/worker/src/drain-loop.ts` | `ead1b405`（140 行） | **`:84-88` `NamedStop { name; stop }`（无 phase 字段=缺口形）**·**:98-128` `drainWithDeadline(stops, timeoutMs, onTimeout?)`（**:103** `pending` Set·**:106-111** 单一 deadline 计时器（不 unref·:96 注记纪律）·**:112-121 单相 `Promise.race([Promise.allSettled(stops.map(…)), deadline])`——全部 stop 同拍起跑=缺口正身**·**:117` finally `pending.delete`（settle 含 reject·allSettled 语义）·**:122** `clearTimeout` 败者计时器纪律·**:123-127** timeout→`onTimeout?.([...pending])`（无相位标签）→`'timeout'`）·`:14-80` `runDrainLoop`（`:64-71` `stop()` 等在飞 tick·`:76` 首拍门 ready·零触承诺件）·`:134-140` `wireSignalShutdown` 双信号同 handler |
| `apps/worker/src/main.ts` | `b47aba76`（840 行） | **`:785-795` HA-2 注记块（「清单 18 项」口径记载）**·**:796-816 `drainStops: NamedStop[]` 19 具名（:797-809 13 loop·:810 rag-cache·:811-813 三 pool.end·:814 langfuse·:815 stub-tick env-gated 条件展开）**·**:817** `workerShuttingDown` 幂等闸·**:818-835** `shutdownWorker`（**:822-824** 唤醒面先行停 jobWakeupListener/jobWakeupRedisListener/jobWakeupRedisClient·**:825** `drainWithDeadline(drainStops, boundedIntEnv('WORKER_DRAIN_TIMEOUT_MS', 30_000, 1_000, 300_000), onTimeout)`·**:826** `worker_drain_timeout signal=… in_flight=…` 结构化日志·**:828-831** `metricsServer.close()` 2s 上限 race·**:832-833** `drained (${outcome}), exiting`+`process.exit(0)`）**·`:836` `wireSignalShutdown(['SIGTERM','SIGINT'],…)` 同链 |
| `apps/worker/test/ha-2-drain.proof.ts` | `8a864311`（116 行·**41 断言亲跑亲证 PASS=41 FAIL=0**） | `:19-34` A.3 drainedWins 4 臂·`:37-55` A.3 deadlineWins 5 臂（**:50** 时序窗 `elapsed >= 80 && elapsed < 500`·80=注入 timeoutMs）·`:58-70` A.4 signalWiring 3 臂·**:73-105 A.4 源级清单断言 29 臂（`:81-87` required 18 具名逐项+`:92` 清单实数 19 臂（含 stub-tick 条件展开 regex）+`:93` vectorPlane 接线+`:94` 双信号+`:95` 幂等闸+`:96` boundedIntEnv 30_000+`:97` 超时日志 regex+`:98` metrics 2s+`:99` exit(0)+`:101-104` stub 三臂）** |
| `apps/api/test/ha-2-drain.proof.ts` | `2a2f0828`（317 行·**47 断言亲跑亲证 PASS=47 FAIL=0**） | api 优雅停机门（A.1 拒新放旧/A.2 SSE 泵/A.4-api 源级/C1/C4）——**零 `drainWithDeadline` 引用**（api 面独立 `createApiShutdownChain`）·本刀零触·双面门零回归承载 |
| `apps/worker/test/drain-loop.proof.ts` | `2b401be2`（80 行） | `runDrainLoop` 本体单元门（stop 等在飞 tick/停后不起 tick/首拍门）——**零 `drainWithDeadline` 引用**·drain-loop.ts 被触后的不回退邻面 |
| `apps/worker/test/owner-drain-order.proof.ts` | `9cac1aa4`（188 行） | owner 排干序单元门（drain 族邻面·零触） |
| `apps/worker/test/ag-f-reroll.proof.ts` | `64ab8123`（583 行·`0ff55592` 时 `866b4108`/427 行→并线波 +164 行增 §F 模板旁路臂族·如实改锚） | ag-f 邻面门（隔离跑·崩溃安全兜底侧邻证·零触） |
| `apps/worker/package.json` | `e69420d4`（180 行） | `:7` lint max 954·`:41` `prove:drain`·`:43` `prove:ha2-drain`·`:46` `prove:owner-drain-order`·`:157` `prove:ag-f-reroll` |
| `apps/api/package.json` | `266e64b8`（119 行·并线波 +1 行 csp-headers prove 接线·如实改锚） | `:52` `prove:ha2-drain` |
| `package.json` | `3b04b871`（675 行） | `:8` lint max 5235·`:233-234` `ag-f-reroll:prove(:raw)` 接线·`:659` `i6-gates:prove` |
| `scripts/i6-239-gates.proof.mjs` | `339f92f4` | §2-7 五类标记词定义（词面运行时组装防自指·不入卷）+改动集恰符臂（i6-239 历史刀申报面=协议形红承登载体·§7） |
| `scripts/ai-docs/public-text-policy.mjs` | `322e277a`→EXEC 重 pin `0548e848`（398 行） | `:98` `MAX_FILES = 2_184`（docs cap·EXEC 重 pin：merge `f2e8de7b` 纯改号→cap **2_192**·`MAX_FILES` 移 `:100`） |

### 0.2 漂移登记（派单 brief/诊断席定谳 → `f20e38c8` 现状·**EXEC 重 pin 同协议**）

1. **依赖相计数勘误（brief「依赖相 4/loop 相 13」→代码真值 5/14）**：`main.ts:796-816` 亲读逐项清点——依赖相（依赖面收尾·后行相）=**5 项**（rag-cache `:810`+privacy-pool `:811`+qbank-control-pool `:812`+rag-control-pool `:813`+langfuse `:814`·brief 的「4」漏计 langfuse 或系 stub 归类口径差）；loop 相（等在飞 tick·先行相）=13 静态（`:797-809`）+stub-tick 1（`:815` env-gated·loop 族）=**14 项**。合计=静态 18+条件 1=**19 具名**（与 proof `:92` 实数 19 臂、main.ts `:785-788`「清单 18 项」+stub 附加注记三方互证恒等）。**两相划分与修法设计不受影响**（依赖相全数后行·多一项更须后行）·本勘误落 §8 裁决项①待双审追认。
2. **基线随动漂移（0ff55592→f20e38c8）**：起草中主线推进 54 commit（积压 nail 收官串+gitleaks-archive-expand/hmac-consolidate 双 nail SSOT）——本席 fetch 后 `git merge --ff-only` 随动（分支零 commit·零冲突）·核心五锚（drain-loop.ts/worker main.ts/双 ha-2-drain proof/drain-loop proof）blob **零漂**亲证；三锚如实改：ag-f proof `866b4108`→`64ab8123`（+164 行 §F 臂族）、api package.json `910ff4f8`→`266e64b8`（+1 行 csp prove 接线）、docs 基线 2165→**2176**（cap 2184 零变·本卷 +1→2177·余量 7·cap sanction 权归协调方）。
3. **issues-master 仓外**：四行原文（#157/#158/#181/#156）协调方持有未入卷——不阻起草（派单 brief 明示）·EXEC 立项时如已入卷照 §0 协议补锚·未入卷则维持仓外登记。
4. **「19 项源级断言」口径勘误（brief）**：worker proof 源级清单断言=**29 臂**（§0.1 第三行明列）·其中关于 19 具名清单的臂=18 具名逐项（`:88` 循环）+实数 19 臂（`:92`）=**19 臂**——brief 的「19 项源级断言」按此口径成立·本卷「19 项维持」即钉此 19 臂逐字冻结。
5. **机制证据等级（诚实申明）**：SIGTERM 排水窗竞速三害（§1.3）系**源级机制链亲证+诊断席定谳承引·未活体复现**（起草席零真实 SIGTERM 生产窗复跑——复跑需真池/真 ragCache/langfuse 排水竞态注入·超出 docs 起草 turn 面）·EXEC 期亦以注入式 proof 承载（沿 worker proof 既有 fake 注入形制·零 IO）。
6. **EXEC 重 pin 漂移登记（`f20e38c8`→`f2e8de7b`·2026-10-16）**：EXEC 序1 `git fetch`+`git merge --no-ff origin/feat/mysql-schema-skeleton`（届时 tip=`f2e8de7b`=派单下界以等号成立·merge=`c9beb402`·merge-base=`f20e38c8`·ort 零冲突·delta 仅 `scripts/ai-docs/public-text-policy.mjs`+`public-text-policy.proof.mjs` 两件 +9/−7·禁 pull --rebase 遵守）——四核心锚（drain-loop.ts `ead1b405`/worker main.ts `b47aba76`/worker ha-2-drain proof `8a864311`/api ha-2-drain proof `2a2f0828`）+八锚（drain-loop proof `2b401be2`/owner-drain-order `9cac1aa4`/ag-f `64ab8123`/worker package.json `e69420d4`/api package.json `266e64b8`/root package.json `3b04b871`/i6-239 `339f92f4`）blob **恒等亲证=纯改号**；唯一漂移=`public-text-policy.mjs` `322e277a`→`0548e848`（cap 2184→**2192**·`MAX_FILES` :98→:100）——docs:check 实读 2177（含本卷）≤ 2192·余量 15·cap sanction 权归协调方（P2① 承载）。三码文件 file:line 锚全数对中未漂（drain-loop.ts :84-88/:98-128/:14-80/:134-140·main.ts :785-836·worker proof :19-105）。

### 0.3 迁移号登记与协调规则（预期零·实证后定）

- 主线链顶实存 max（`f20e38c8` 树 `ls packages/db/migrations | tail` 口径）·本刀**预期零迁移**（修法=worker 时序编排面两文件+1 proof·零 SQL 零新表零 wrapper）。
- **协调规则**：若 EXEC 期复判确需迁移→认领号=EXEC 立项日按届时主线链顶顺延实测·零硬编码本卷号·Ban 抢号 Ban 私占（沿 ssepush §0.3 同款）。

## §1 红事实（机制链·源级亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 单相全貌（`drain-loop.ts:98-128` 亲读·缺口正身 `:112-121`）

`drainWithDeadline` 现行体：全部 `stops`（生产=main.ts drainStops 19 具名）经**一个** `Promise.allSettled(stops.map(async s => { try { await s.stop(); } finally { pending.delete(s.name); } }))`（`:112-121`）与**一个** deadline（`:106-111`·`timeoutMs` 来自 main.ts `:825` `boundedIntEnv('WORKER_DRAIN_TIMEOUT_MS', 30_000, 1_000, 300_000)`）做 `Promise.race`。**依赖相与 loop 相无任何先后约束**：`allSettled` 同拍起跑全部 19 项，settle 序由各 stop 自身耗时决定。依赖相各 stop（`ragCache.close()`/`pool.end()`/`langfuse.shutdown()`）均为快返回型（ms 级），loop 相各 stop（`runDrainLoop.stop()`·`drain-loop.ts:64-71`）须**等在飞 tick 跑完**（tick 含真实 PG 往返/模型管线收尾·百 ms 至 s 级）——故今日常态**依赖相必然先于 loop 相 settle**：依赖面在 loop 在飞 tick 仍需其服务时被拆。

### 1.2 19 具名项两相分类名单（`main.ts:796-816` 逐项·定稿口径）

| 相 | 项（name·main.ts 行） | stop 体 | 计 |
|---|---|---|---|
| loop 相（先行·等在飞 tick） | report `:797`·interview `:798`·quiz `:799`·diagnosis `:800`·route-classify `:801`·commerce `:802`·model-invocation-reconcile `:803`·usage-calibration-reconcile `:804`·usage-calibration-retention `:805`·qbank-release-sweep `:806`·privacy-erasure `:807`·vector-plane-erasure `:808`·gauge `:809` | 各 `runDrainLoop.stop()`（等在飞 tick） | 13 |
| loop 相（env-gated 条件） | stub-tick `:815` | `stubLoop.stop()`（HA-2 证明 stub·loop 族） | +1 |
| 依赖相（后行·依赖面收尾） | rag-cache `:810` | `ragCache.close()`（硬闭） | 1 |
| 依赖相 | privacy-pool `:811`·qbank-control-pool `:812`·rag-control-pool `:813` | 各 `pool.end()` | +3 |
| 依赖相 | langfuse `:814` | `langfuse.shutdown()`（遥测收口） | +1 |

合计静态 18+条件 1=19 具名（=proof `:92` 实数臂钉值）。brief「依赖相 4/loop 相 13」勘误见 §0.2-1。

### 1.3 竞速三害机制链（诊断席定谳承引+源级链·证据等级 §0.2-5）

1. **rag-cache 先闭→在飞 retrieval 拒绝→降级**：`:810` `ragCache.close()` 与 `:797-801` 面向 qbank read model 的 loop stop 同拍起跑——close 先 settle 即硬闭 client·在飞 tick 的 retrieval 路径拒绝→降级路径噪声（fail-closed 语义正确但排水窗制造本可避免的拒绝尾迹）。
2. **pool.end 竞在飞 erasure tick→白跑+噪声**：`:811` `privacyPool.end()` 与 `:807-808` privacy-erasure/vector-plane-erasure stop 同拍——erasure tick 在飞时 pool.end 收空闲连接+拒后续取连（busy client 不被终结·真实拒绝面=connect()-after-end·pg-pool 3.14.0 :127-143/:189-193/:488-498）→tick 内查询拒绝→`drain-loop.ts:50-53` 兜底 catch 计 consecutiveFailures+console.error 噪声·该 tick 已做工作白跑（幂等护栏保证不双跑·但排水窗白耗）。（R2 措辞降格随 nail 落：原句「pool.end 终结连接」系超定表述·降格实录见 §9 字段⑧ P2-1）
3. **langfuse 先收→收尾尾迹丢失**：`:814` `langfuse.shutdown()` 与 13 loop stop 同拍——shutdown 先 settle 即收遥测·各 loop 最后一个在飞 tick 的 span/事件不入尾迹（排水收口观感失真）。
4. **无预算分配**：单一 30s deadline 下依赖相与 loop 相共享同一预算——挂死 loop（如 stub hang 形态）可耗尽全预算·依赖相收尾被饿死；反之依赖相快 settle 又先行拆依赖。两向皆失序。

### 1.4 崩溃安全兜底链现状（已在·本刀零触清单）

deadline 胜出→`worker_drain_timeout`（在飞名）→`process.exit(0)`（`:826-833`）→被弃 job 走租约过期→reaper/sweep 重领→retry_exhausted→AG-C 0175 退避时闸（0175+claim 时闸·nail `@928b2612`·LEDGER :87 在册）——**全链本刀零字节零触**（§1-件②边界·§3-1）。幂等由租约互斥保证不双跑（main.ts `:785-794` 注记既有语义·本刀不翻案）。

### 1.5 基线读数（起草席本树亲跑 @`f20e38c8`·2026-10-16·全绿在卷）

`pnpm -C apps/worker prove:ha2-drain` **41/41 EXIT=0**·`pnpm -C apps/api prove:ha2-drain` **47/47 EXIT=0**·`pnpm -C apps/worker prove:drain` EXIT=0·`pnpm -w run owner-drain-order:unit:prove` EXIT=0·`pnpm -w run ag-f-reroll:prove` EXIT=0（§A-§F 全绿·隔离收据 `.tmp/isolated-proof-receipts/2026-10-16T07-12-53-036Z-…-16818a8ef1fb.json`）·`pnpm -w run docs:check` 2176≤2184 EXIT=0。即：**既有门全绿=本刀为缺陷修复刀非复绿刀**（缺口在门覆盖外·分相断言即新增覆盖）。

## §1-修法（两阶段化定稿·三件·零业务语义变更——崩溃安全兜底零触）

- **件① `drain-loop.ts` 两相化（定稿契约·EXEC 照钉）**：
  - `NamedStop` 增可选字段 `phase?: 'loop' | 'deps'`（缺省 `'loop'`·既有第三方调用形不破）；生产清单逐项显式贴标（件②）。
  - `drainWithDeadline(stops, timeoutMs, onTimeout?)` 内部重构为**严格两相顺序排空**（伪代码级契约）：`loopStops = stops.filter(s => s.phase !== 'deps')`·`depsStops = stops.filter(s => s.phase === 'deps')`；`loopShare = Math.ceil(timeoutMs * 0.7)`·`depsShare = timeoutMs - loopShare`（**两相份额和恒等 timeoutMs·全程排水上限与今日恒等**·30s 默认→21s/9s）；先 loop 相后 deps 相·**deps 相任一 stop 不在 loop 相结束（全 settle 或到点）前起跑**；每相=现行单相体原样下沉复用（per-phase `pending` Set+`Promise.allSettled`×deadline race+`:122` 败者 `clearTimeout` 纪律+`:96` 计时器不 unref 纪律+`:117` reject 不外抛语义·逐相保持）；`onTimeout` 增第二参 `phase: 'loop' | 'deps'`（**在飞名逐相日志**·各自超时各自报·`[...pending]` 为该相在飞名）；返回值枚举不变（任一相 timeout→`'timeout'`·双相 drained→`'drained'`）。份额常量 0.7 具名落源（机检可锚）。
  - `runDrainLoop` 本体（wake/stop/ready/snapshot/首拍门）**零字节零触**；`wireSignalShutdown` 零触。
- **件② `main.ts` 清单贴标+日志带相位（幂等闸/唤醒面先行停/deadline env/metrics 2s/exit 0 全零触）**：
  - `:796-816` drainStops 19 项逐项显式 `phase`：14× `'loop'`（13 loop+stub-tick）+5× `'deps'`（§1.2 名单）；**字段序钉 `name→stop→phase`**（phase 追加在 stop 之后——proof `:89` 逐项 regex `\{ name: 'X', stop:` 与 `:92` 实数臂、`:93` vectorPlane 接线臂逐字存活的前提·EXEC 违序即 19 具名臂红=停止条件）。
  - `:825-827` onTimeout 回调随件①签名·`:826` 日志行→`worker_drain_timeout signal=${signal} phase=${phase} in_flight=${inFlight.join(',')}`（结构化三要素）；`:785-795` 注记块随实更新（两相化描述+依赖相 5 项在册勘误对齐 §1.2）。`:817` 幂等闸/`:822-824` 唤醒面先行停/`:825` boundedIntEnv 三参/`:828-831` metrics 2s race/`:832-833` exit 0 全部零字节。
- **件③ `apps/worker/test/ha-2-drain.proof.ts` 41 既有臂维持+分相断言新增**：
  - **维持（39/41 逐字冻结·含 19 具名清单臂全数）**：18 具名逐项+实数 19 臂+vectorPlane 接线+双信号+幂等闸+boundedIntEnv+metrics 2s+exit(0)+stub 三臂+drainedWins 4 臂+signalWiring 3 臂——**19 具名清单臂逐字冻结为硬门**（机检：pre/post 首参清单 diff 中该 19 臂零 diff·沿 ssepush §2-1 pre/post 清单协议形）。
  - **演进（2/41·随机制如实登记·力不减弱）**：演进①=`:97` 超时日志臂 regex 对齐件②新格式（signal+**phase**+in_flight 三要素全钉·要素增即强）；演进②=`:50` 时序窗下界 `80`→机制推导值 `Math.ceil(80*0.7)=56`（窗 `[56,500)`·断言文本同步如实——仍钉「deadline 胜出+非真睡 30s」·力不减）。pre/post 双清单 diff=**恰此 2 条+新增臂**·多一条即停。
  - **新增（分相臂·EXEC 落值·预期 ≥8）**：A 分相序臂（deps stop 起跑时点 ≥ loop 相全 settle 时点·事件序记录直证「依赖相后行」）；B 份额臂（timeoutMs=100 注入·loop 相挂死→loop 相 ≈70ms 到点（非 100ms）·deps 相随后仍获 30ms 份额跑完（deps settle 计数=1·份额保护直证））；C 逐相在飞名臂（loop 相超时→`onTimeout(names,'loop')` 收 loop 名·deps 相挂死→`onTimeout(names,'deps')` 收 deps 名·两回调相位标签逐一正确）；D 退化形态臂（全 loop 相集·deps 空→outcome/在飞名语义与今日恒等——`'allSettled(空)即 drained'` 零行为漂移）；E 源级臂（main.ts `phase: 'deps'` 恰 5 处+`phase: 'loop'` 恰 14 处·drain-loop.ts 0.7 份额常量与 `depsShare = timeoutMs - loopShare` 和恒等式在源·main.ts 日志行含 phase=）；F 兜底零触臂（exit(0)/boundedIntEnv 30_000/metrics 2s/幂等闸既有臂逐字存活即承载·不另立重复臂）。

## §1.3 否决（替代路径·全数否决·越界行使即停止条件）

1. **否决「保持单相·仅调 drainStops 数组序」**：`Promise.allSettled` 与数组序无关（同拍起跑·settle 序由耗时定）——调序零修力（§1.1 机制链）。
2. **否决「依赖相先行」**：与缺口同向放大（先拆依赖再等 tick·§1.3 三害全数恶化）。
3. **否决「拉长总 deadline（30s→60s）」**：容器宽限不变·总上限语义漂移·治标不治本；两相化后 30s 总上限零改即得正确次序。
4. **否决「依赖相 stop 体改优雅化（close 放宽/重试/宽限）」**：触碰 ragCache/pool/langfuse 业务语义·越出时序编排件边界（本刀=纯时序件·`drainWithDeadline` 注记 :91 自证「纯时序件零 IO」）。
5. **否决「改 exit 语义/租约面/reaper」**：崩溃安全兜底链 §1.4 零触红线——exit 0→租约过期→reaper 重领→retry_exhausted→AG-C 0175 退避时闸全链不动。
6. **否决「loop 相超时即跳过依赖相（fail-fast 直退）」**：依赖相尾迹（langfuse flush/pool 优雅关）在有界份额内仍值得争取·跳过=新增语义损失；deps 相自带 30% 份额·总上限恒等·跳过无收益有损失。
7. **否决「runDrainLoop.stop() 语义改造（如强制砍 tick）」**：等在飞 tick 完整收尾=HA 北极星既有承诺（`drain-loop.ts:2-3` 注记·drain-loop.proof 在钉）·缺口在编排层不在原语层。

## §2 验收断言候选（EXEC 门矩阵·pre-exec 双审核对单基面·全过为绿）

1. **worker 复绿门**：`pnpm -C apps/worker prove:ha2-drain` **EXIT=0**——41 既有臂中 39 条逐字存活（含 19 具名清单臂全数·机检 pre/post 首参清单 diff=恰 2 演进+新增）+2 演进臂（§1-件③）+分相新增臂全绿。
2. **api 双面零回归门**：`pnpm -C apps/api prove:ha2-drain` **47/47 EXIT=0**（api 面零字节·双面惯例零回归承载）。
3. **drain 邻面门**：`pnpm -C apps/worker prove:drain` EXIT=0（drain-loop.ts 被触·runDrainLoop 本体零回归直证）。
4. **ag-f 邻面门**：`pnpm -w run ag-f-reroll:prove` EXIT=0（隔离跑·崩溃安全兜底侧邻证·blob `64ab8123` 新臂族含入）。
5. **drain 族邻面门**：`pnpm -w run owner-drain-order:unit:prove` EXIT=0。
6. **typecheck 门**：`pnpm turbo typecheck --force` EXIT=0（8/8 0 cached 口径·沿 nail 卷形制）。
7. **lint 承登口径**：`pnpm lint`（root max **5235**）+`pnpm -C apps/worker lint`（max **954**）亲跑实测——两文件+1 proof 改动零新增 warning 为预期·漂移即如实登记归因（**Ban 借机修 lint**）。
8. **docs:check 门**：`node scripts/ai-docs/check-docs.mjs` EXIT=0（基线 2176·本卷 +1→**2177 ≤ cap 2184**·余量 7·>2184 红即停上报·cap sanction 权归协调方·**EXEC 重 pin：cap 2184→2192（merge `f2e8de7b` 纯改号）·实读 2177 ≤ 2192·余量 15·零新增文件**）。
9. **markers 门**：改动集（本卷 .md+三码文件）五类标记词零命中+`est live=0` 臂绿（词面见 `i6-239-gates.proof.mjs` §2-7 运行时组装·不入卷防自指）——**恰符臂红=协议形承登**（i6-239 历史刀申报面·沿 safewrite-backpressure OBS-2+authz-34 :225 先例·非本刀新增红·§7）。
10. **diff 面（改动面窄断言）**：EXEC diff（对立项基线）=恰 4 类——本卷 .md+`apps/worker/src/drain-loop.ts`+`apps/worker/src/main.ts`+`apps/worker/test/ha-2-drain.proof.ts`（+收据目录可选）——`apps/api`/`apps/web`/`packages/`/`migrations/`/共享 SSOT 四卷零文件入 diff；`runDrainLoop` 函数体零字节（`git diff` 词面机检）。

## §3 范围外（边界清单·越界即 FAIL）

1. **零产品码越面**：仅 `apps/worker` 两 src 文件+worker 侧 1 proof——api/web/packages/db/migrations 零字节；`runDrainLoop` 本体零触（§1-件①承诺）。
2. **崩溃安全兜底链零触**：exit 语义/租约/reaper/sweep/retry_exhausted/AG-C 0175 退避时闸全链（§1.4）·api `createApiShutdownChain` 零触。
3. **共享 SSOT 零改**：LEDGER（含 :87 组标签行）/checklist（含 :2624 行）/batch-residual-plan/issues-master 只读引用——QUEUE 族四行翻面权归协调方 nail·本刀不宣称行关闭。
4. **依赖相 stop 体业务语义零触**：`ragCache.close()`/三 `pool.end()`/`langfuse.shutdown()` 调用形与语义原值（仅编排次序变）。
5. **stub 纪律零触**：stub-tick env-gated/零模型调用/挂死形态三臂（proof `:101-104`）逐字存活。
6. est live=0（起草 turn·§6）·零迁移（§0.3）。

## §4 依赖

**①上游已满足**：`f20e38c8` 主线（含双 nail SSOT）为基线·核心五锚 blob 亲证在卷（§0.1）。**②无同文件并发**：`git worktree list` 48 树亲证——零第二树触 drain-loop.ts/worker main.ts/worker ha-2-drain.proof.ts（§0.0）。**③迁移号**：§0.3（预期零）。**④下游**：QUEUE 族四行 #157/#158/#181/#156 行翻面+checklist :2624 STILL OPEN 行核翻·归协调方 nail（本刀交付读数）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（⛔push·git 写只本 worktree docs commit）·Ban merge 主线（⛔merge主线）·Ban 自批（pre-exec 双审须独立外席·alone≠dual 不代签）·Ban 弱化断言（19 具名清单臂逐字冻结·两演进臂力不减弱·§1-件③）·Ban retry-to-green（断言红恰 1 attempt·基建红除外）·Ban 触崩溃安全兜底链（§3-2）·Ban 触依赖相 stop 体语义（§3-4）·Ban 改 runDrainLoop 本体（§3-1）·Ban 触共享 SSOT（§3-3）·Ban 抢迁移号 Ban 私占（§0.3）·Ban 借机修 lint/cap/协议形红（§2-7/§2-8）·Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）·Ban 顺带升级依赖包·Ban 触其他工作树（含 `meetwise-qfm`）。

**pins（本卷钉值·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零外呼零消耗）——**刀专项**：worker ha2-drain 断言总数=**41**（亲跑亲证）·api ha2-drain=**47**（亲跑亲证）·drainStops=静态 18+env-gated 1=**19 具名**·依赖相 **5**/loop 相 **14**（含 stub）·deadline 份额 **70/30**（和恒等·总上限 30s 与 boundedIntEnv('WORKER_DRAIN_TIMEOUT_MS',30_000,1_000,300_000) 零改）·docs cap=**2184**·lint root **5235**/worker **954**·迁移=**0**·est live=0（起草 turn）。

## §6 est live=0（起草 turn）+ EXEC 门预申明

- **起草 turn（本 commit）**：est live=**0**——零模型外呼零 Key 加载零生产操作零消耗（全部基线 run=纯本地 tsx/隔离 PG 容器·用后即焚）。
- **EXEC 期门预申明（授权后方可行）**：①件①②③落码+分相臂新增落位；②§2 十门全跑全落收据（EXIT 逐门入卷）；③`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改；④收据落点 `ai-docs/delivery/receipts/queue-shutdown-phases/`（00-exec.md+pre/post 断言清单对照+各门 EXIT 回执·count 纳 docs:check 面——余量 7 内 EXEC 自裁最小集·越即停上报）+harness 本卷推进注记（append-only）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 .md+EXEC 期三码文件+收据）**五类标记词 grep 零命中**（起草席落卷时对本卷亲跑直证·回执随 EXEC 收据留痕·五类词面见 `i6-239-gates.proof.mjs` §2-7 运行时组装·不入卷防自指）。**承登（基线红如实）**：`i6-gates:prove` 的「改动集恰符」臂以 i6-239 历史刀申报清单为期望集·任何后继刀必红该臂=**协议形承登**（沿 safewrite-backpressure OBS-2+authz-34 :225 先例）；基线树（净 `f20e38c8`）该门对 HEAD~1（双 nail SSOT commit 的 LEDGER/checklist 面）三臂红（⑤SSOT/⑦词面/恰符）均系历史登记行词面·`f20e38c8` 改前同在·非本刀引入——本刀实质臂=改动集五类词面零命中+`est live=0`+⑤邻面零触+⑤零迁移+⑤SSOT 零触（本刀改动集口径）·全绿为门。

## §8 STOP（开工三条款 + 待双审/EXEC 裁决项）

**STOP · `executed:awaiting_post_prove_dual`（EXEC 十门全绿落卷=§9 · post 双审两外席待开 · post BOTH PASS ≠ push · push 权归协调方）· 原 `draft:awaiting_pre_exec_dual` 随 pre-exec 双审 BOTH PASS（席1 `agent_0158b7a6`+席2 `agent_982e865c`）+协调方明示 EXEC 授权翻面 · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（含 §8 裁决行使落字·committed SHA 重钉）；③EXEC 立项**不得改 §1-修法定稿契约与 §5 Ban/pins**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·含 §0.2 五条漂移复核与 §0.3 迁移号实占复核）。**停止条件（四类）**：**现场漂移**=届时 tip 对 §0.1 任一锚 blob/机制漂移（drainStops 增删项/NamedStop 被他刀改/drainWithDeadline 被他刀动/链顶异动）→停·重 pin 回炉；**机制不满足**=件①②③落位后 §2-1 命中红（19 具名臂非恰 2 演进外有 diff/分相臂不绿/时序窗演进后仍红）→停·如实升级协调方（Ban 就地改因 Ban 扩面修）；**越界需要**=任何迁移/业务语义/租约面/exit 语义/依赖相 stop 体/共享 SSOT 改动诉求→停·另刀或 §8 裁决行使（Ban 就地修）；**验收红不可修**=门矩阵静态红（typecheck/docs:check>cap/lint 漂移）且根因不在本刀交付面→停·如实登记（Ban 借机修·docs:check >2184 红即停上报）。

**待双审/EXEC 裁决项**：
- **①依赖相计数勘误追认（§0.2-1）**：brief「依赖相 4/loop 相 13」→代码真值「依赖相 5/loop 相 14（含 stub）」·19 具名口径三方互证——推荐=追认（修法设计不变·依赖相 5 项全数后行）vs 翻案（翻案即回炉）。
- **②空 deps 相退化语义追认（件③-D 臂）**：`allSettled(空)` 即 drained·全 loop 相集语义与今日恒等——推荐=追认零行为漂移定性。
- **③演进②时序窗行使追认（件③）**：`:50` 下界 80→56（机制推导）为「随机制演进·力不减」非「为绿改测试」——证据=窗由份额常量推导+断言文本如实+其余 40 臂中 39 条逐字冻结。推荐=追认行使 vs 翻案（翻案即回炉）。
- **④零迁移确认（§0.3）**：预期零；若 EXEC 复判需迁移→§0.3 协调规则。
- **⑤行关闭效力**：EXEC 命中门矩阵十门全绿+post 双审 BOTH PASS→QUEUE 族 #157/#158/#181/#156 与 checklist :2624 STILL OPEN 行的关闭/翻面登记权归协调方 nail（本刀交付读数·不宣称关闭·「四行全闭」还须 Q2+ 各子刀——本刀=Q1 一子）。

---

## §9 EXEC 记录（2026-10-16·EXEC 席落卷·十门全绿·`executed:awaiting_post_prove_dual`）

**会签与授权**：pre-exec 双审 BOTH PASS 在卷——席1 `agent_0158b7a6`+席2 `agent_982e865c`（P2×3 随卷·EXEC 立项落笔）·协调方明示 EXEC 授权。

**字段① merge（EXEC 序1）**：`git fetch` 后 `git merge --no-ff origin/feat/mysql-schema-skeleton@`f2e8de7b``→merge **`c9beb402`**（届时 tip=`f2e8de7b`=派单下界「≥f2e8de7b」以等号成立·merge-base=`f20e38c8`·merge-tree 预演 EXIT=0·ort 零冲突·delta=public-text-policy 两件 +9/−7·冲突沿并集解预置未触发·禁 pull --rebase 遵守）。

**字段② 三文件落点（恰三码文件·EXEC 自改 working diff 对 `c9beb402`）**：
- `apps/worker/src/drain-loop.ts`（件①）：`DrainPhase` 类型新增·`NamedStop` 增 `phase?: DrainPhase`（**字段序 name→stop→phase**·缺省 `'loop'`）·`LOOP_PHASE_SHARE = 0.7` 具名落源·`drainWithDeadline` 重构两相顺序排空（`loopStops`/`depsStops` filter·`loopShare = Math.ceil(timeoutMs * LOOP_PHASE_SHARE)`·`depsShare = timeoutMs - loopShare` 和恒等·`runPhase` 单相体原样下沉：per-phase pending Set+allSettled×deadline race+败者 clearTimeout 纪律+计时器不 unref+reject 不外抛·deps 相严格后行不并行）·`onTimeout` 增第二参 `phase`（逐相在飞名）·返回值枚举不变（任一相 timeout→`'timeout'`·双相 drained→`'drained'`）·`runDrainLoop` :14-80 **函数体 diff 逐字节恒等机检直证**·`wireSignalShutdown` 零字节。
- `apps/worker/src/main.ts`（件②）：`drainStops` 19 项逐项贴标（13 loop `:797-809`+stub-tick `as const`=14·deps 5=rag-cache+三 pool.end+langfuse）·注记块随实更新（两相化+30s→loop 21s/deps 9s+19 具名勘误=loop 14/deps 5）·onTimeout 回调随签名·超时日志三要素 `worker_drain_timeout signal=${signal} phase=${phase} in_flight=${inFlight.join(',')}`·幂等闸/唤醒面先行停/boundedIntEnv 三参/metrics 2s race/exit 0 **全零字节**。
- `apps/worker/test/ha-2-drain.proof.ts`（件③）：见字段③。

**字段③ 臂账（41 维持+恰 2 演进+17 新增=58·机检在卷）**：pre/post 首参清单 diff=**恰 2 演进**（演进① `worker_drain_timeout 结构化日志含 signal+phase+in_flight` regex 三要素全钉·要素增即强；演进② 时序窗下界 `80`→`56`=`Math.ceil(80×0.7)` 机制推导·窗 [56,500)·断言文本如实）+**恰 17 新增**（A 分相序 2=事件序直证 deps 后行·B 份额 3=timeoutMs 100 注入→loop 70ms 到点非 100ms 全额+deps 30ms 余量跑完 settle 计数=1·C 逐相在飞名 4=loop/deps 相位标签逐一正确·D 退化形态 3=全 loop 相集+空 deps allSettled(空)即 drained 零行为漂移·E 源级 5=deps 恰 5/loop 恰 14/0.7 具名/和恒等式/日志 phase=）·其余 **39 臂逐字冻结**（19 具名清单臂全数零 diff 亲证·F 兜底零触=exit(0)/boundedIntEnv/metrics 2s/幂等闸既有臂逐字存活承载不另立）。实测 `pnpm -C apps/worker prove:ha2-drain` **PASS=58 FAIL=0 EXIT=0**。

**字段④ 门矩阵十门全表（全绿）**：

| # | 门 | 命令 | 结论 |
|---|---|---|---|
| 1 | worker 复绿 | `pnpm -C apps/worker prove:ha2-drain` | **58/58 EXIT=0**（41 维持+2 演进+17 新增） |
| 2 | api 双面零回归 | `pnpm -C apps/api prove:ha2-drain` | **47/47 EXIT=0**（api 面零字节） |
| 3 | drain 邻面 | `pnpm -C apps/worker prove:drain` | EXIT=0（runDrainLoop 本体零回归） |
| 4 | ag-f 邻面 | `pnpm -w run ag-f-reroll:prove` | EXIT=0（§A-§F 全绿·隔离收据 `.tmp/isolated-proof-receipts/2026-10-16T08-32-39-…-3a2d79ea1486.json`） |
| 5 | owner-drain-order 邻面 | `pnpm -w run owner-drain-order:unit:prove` | EXIT=0 |
| 6 | typecheck | `pnpm turbo typecheck --force` | EXIT=0（**8/8·0 cached**·首跑红=stub 条件展开行 phase 字面量脱离上下文定型拓宽为 string·`as const` 口径内收口·复跑绿·零语义） |
| 7 | lint | `pnpm lint`+`pnpm -C apps/worker lint` | 双绿 EXIT=0（root **5235/5235**·worker **954/954**·零漂移零新增 warning·Ban 借机修未犯） |
| 8 | docs:check | `node scripts/ai-docs/check-docs.mjs` | EXIT=0（**2177 ≤ cap 2192**·零新增文件·收据=本节 inline 自裁最小集·余量 15） |
| 9 | markers | `node scripts/i6-239-gates.proof.mjs` | 实质臂全绿（⑤邻面零触/⑤零迁移零新表/⑤SSOT 四卷零触/⑦改动集五类词面零命中/est live=0）·恰符臂红=**协议形承登**（unexpected=恰本刀三码文件·沿 safewrite-backpressure OBS-2+authz-34 :225 先例·§7 预申明形状如实复现·非本刀新增红） |
| 10 | diff 面 | `git status/diff HEAD`（对立项基线 `6c124bb0` EXEC 自改面） | 恰 **4 tracked**=三码文件+本卷（typecheck 副产物 `apps/web/tsconfig.tsbuildinfo` 已还原出净·零收据目录新增·`apps/api`/`apps/web`/`packages/`/`migrations/` 零文件入 diff） |

附：`pnpm install --frozen-lockfile` EXIT=0（零 lockfile 改）·零迁移实证（改动集零 SQL 零新表·§0.3 预期零成立）·est live=0（EXEC turn 全程本地 tsx/node+隔离 PG 容器·零模型外呼零 Key 加载零 secrets 读用）。

**字段⑤ P2×3 承载落点（双审随卷·EXEC 立项落笔）**：
- **P2① 基线锚重 pin**：`f20e38c8`→届时主线 tip `f2e8de7b`（merge `c9beb402`）——四核心 blob 恒等亲证=纯改号（§0.2-6 全表在卷）·§0.1 表行与 §2-8 门随实改锚（cap 2184→2192·`MAX_FILES` :98→:100）。
- **P2② 收据补记挤压风险两条（已知语义取舍·随卷登记）**：其一 **loop 相预算收窄 30s→21s**（30s 默认下 loop 相份额 `Math.ceil(30000×0.7)=21000`——在飞 tick 若超 21s 即提前到点→`worker_drain_timeout(phase=loop)`→exit 0 兜底链·非新增风险面而系既有 crash-safe 语义的更早触发点）；其二 **deps 相上限 9s**（依赖面收尾被压入 30% 份额 9000ms——langfuse flush/pool 优雅关超 9s 即被斩尾）。两相份额和恒等 timeoutMs·总上限 30s 零改·取舍双向明示（挂死 loop 不再饿死依赖相 vs 依赖相预算从共享 30s 收窄为固定 9s）。
- **P2③ D 臂断言文本显式豁免时序窗**：D 臂断言文本带「时序窗显式豁免不钉墙钟」落字+函数内注释落字（两相份额调度下总读数不钉·只钉 outcome/在飞名/相位语义面）。

**字段⑥ 裁决项行使落字（§8 五条）**：①依赖相计数勘误**追认行使**（deps 5/loop 14 实证·19 具名三方互证恒等）；②空 deps 相退化语义**追认行使**（D 臂 allSettled(空)即 drained 零漂移）；③演进②时序窗行使**追认**（56=`Math.ceil(80×0.7)` 机制推导·其余 39 臂逐字冻结·力不减）；④**零迁移确认**（实证零）；⑤行关闭效力归协调方 nail（本刀不宣称关闭）。§1-修法定稿契约与 §5 Ban/pins **零改**（修法契约逐条落实·pins 全数维持：41/47/19 具名/5+14/70-30/30s/cap（重 pin 随动）/lint 5235·954/迁移 0）。

**字段⑦ 落卷**：本 commit（§9 append+Status/§0 重 pin/§2-8/§8/footer 翻面）·STOP=**`executed:awaiting_post_prove_dual`**——post 双审两外席待开·post BOTH PASS ≠ push·push 权归协调方（⛔push 未犯·工作区交付）。

**字段⑧ post P2 随卷（append 注记形·本节原文零洗史·nail 随卷落笔）**：post 双审会签 **PASS**（席1 `agent_7b34de12`+席2 `agent_09c70a19`）·三件承登：
- **P2-α B 份额臂判别力登记**：B 份额臂时序窗上界 500 系**哨兵形制**（防真睡跨窗的粗护栏·非份额机制精断言）——份额判别力由 A 分相序臂（deps stop 起跑时点 ≥ loop 相全 settle 时点）+C 逐相在飞名臂+E 源级臂（`LOOP_PHASE_SHARE=0.7` 具名与和恒等式在源）承载·**非本刀弱化**。
- **P2-β §6④↔门 8 收据落点差异追认一行**：§6④ 预申明收据落点=`ai-docs/delivery/receipts/queue-shutdown-phases/`（00-exec.md+断言清单+各门 EXIT 回执）→EXEC 实落=**§9 inline 自裁最小集·零收据目录新增**（§9 字段④ 门 8 如实记载）——落点形差异追认·各门 EXIT 回执实质零缺。
- **P2-1 R2 措辞降格（post 双席同源建议·§1.3-2 :70 机制句原位降格）**：「pool.end 终结连接」→「**pool.end 收空闲连接+拒后续取连（busy client 不被终结·真实拒绝面=connect()-after-end·pg-pool 3.14.0 :127-143/:189-193/:488-498）**」——本 nail 席对 `node_modules/.pnpm/pg-pool@3.14.0_pg@8.22.0/node_modules/pg-pool/index.js` 三锚亲证（:127-143 `_pulseQueue` ending 仅移 idle·`_clients` 清空才 `ended`；:189-193 `connect()` ending 后拒 `'Cannot use a pool after calling end on the pool'`；:488-498 `end()` 置 ending+`_pulseQueue()`）·白跑定性收窄为「在飞 tick 若 end 后新取连即拒·已持 busy client 不被终结」·§1.3-2 后半兜底链句与修法设计零变（原句超定表述已留痕于该行行尾注记）。

---

*QUEUE-SHUTDOWN REQUEST · 2026-10-16 起草 · EXEC 同日落卷 · STOP=`executed:awaiting_post_prove_dual` · 起草 base=`feat/mysql-schema-skeleton` @`f20e38c8`（建树 `0ff55592`→ff 随动·⛔pull --rebase 未用）→ EXEC 重 pin=`f2e8de7b`（merge `c9beb402`·四核心 blob 恒等纯改号·§0.2-6）· 分支 `line/queue-shutdown-phases` · 工作树 `meetwise-q1s`（本起草席立·建前 branch/worktree 双查不存在）· 立项出处=协调方派单 brief（5C-QUEUE 诊断席定谳承引）+LEDGER :87 组标签+checklist :2624 锚定+issues-master 四行仓外待补 · pre-exec 双审 BOTH PASS（席1 `agent_0158b7a6`+席2 `agent_982e865c`·P2×3 随卷）· 缺口=`drain-loop.ts:112-121` 单相 `Promise.allSettled` 全 19 具名同拍起跑（依赖相 5 项快 settle 先拆依赖 vs loop 相 13+1 项等在飞 tick）· 修法=两阶段排空（loop 相先行 70% 份额→依赖相后行 30% 份额·和恒等总上限 30s 零改·在飞名逐相日志·runDrainLoop 本体与崩溃安全兜底链零触）· 触面=drain-loop.ts+worker main.ts+worker ha-2-drain.proof.ts 恰三码文件 · 41 臂维持（39 冻结+2 演进）+17 分相臂新增=58/58 · 门矩阵十门全绿（门 9 恰符臂协议形承登）· P2×3 落卷=§0.2-6 重 pin+§9 字段⑤挤压风险两条+D 臂时序窗豁免落字 · est live=0（起草+EXEC 双 turn）· markers=0（恰符臂协议形承登）· 停止条件四类全设未触发 · Ban self-approve · alone≠dual · post BOTH PASS ≠ push · ⛔push · ⛔merge主线 · STOP*

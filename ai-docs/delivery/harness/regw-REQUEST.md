# REGW REQUEST — 流式注册窗口退化态证明起草卷（`GAP-SSEPUSH-REG-WINDOW` · D5「先注册 waiter 再取数」机制现形 + 控制器 pre-fetch 边界窗口 · RW-0…RW-5 六臂刀形）（docs-only REQUEST 卷·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（2026-10-30 起草落卷即停 · 三处钉：本行 + §8 + 卷尾 · 同值 · pre-exec 双审两独立外席待派 · Ban self-approve · alone≠dual · est live=0 · markers=0 · ⛔push ⛔动主仓）

**席位**：meetwise 流式注册窗口起草席（docs-only 起草 · 总盘 v4 未认领 keyless 仪器小刀 P2/P3 · 协调方授权 · ⛔push ⛔动主仓）。
**基线**：`origin/main` @ **`1ca3ce1daa31903efc834de911f78752a8168e78`**（short `1ca3ce1da` · `git fetch origin` 本 turn 成功 · 分支 `line/regw-draft` 零独有 commit · worktree `meetwise-regw` · `git worktree add ... -b line/regw-draft origin/main` 本席已立）· 起草前本树 `node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned 2457**（cap 2_461 · §2-1 预算核）· `node scripts/ai-docs/public-text-policy.proof.mjs` **EXIT=0 12/12**。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/execution-master-checklist.md`（**`:1660` STILL OPEN 行**含 `GAP-SSEPUSH-REG-WINDOW` 原文）→ 机制源 `apps/api/src/platform/sse-pump.ts`（`:23`-`:25` D5 区 · `:70`-`:71` 双钉值 · `:169`-`:170` 注册/重放序 · `:173`-`:209` 循环 · `:191` 下一轮注册 · `:199` 取数）· `apps/api/src/platform/sse-notify.service.ts`（`:197`-`:210` `waitFor` · `:309`-`:319` `onNotification` · `:185`-`:187` `health`）· 三控制器 `interview.controller.ts`（`:264`/`:268`）/`quiz.controller.ts`（`:59`/`:62`）/`diagnosis.controller.ts`（`:57`/`:60`）· 取数面 `interview.service.ts`（`:910`-`:917`）/`quiz.service.ts`（`:131`-`:139`）· 先例 `apps/worker/src/job-wakeup-listener.ts`（`:111`-`:115` LISTEN 先于 reconcile）→ 既有证明 `apps/api/test/sse-push-notify.proof.ts`（`:924` GAP 诚实 PIN · `:554`-`:579` P-2b 兜底 cadence/notify 主推）· `apps/api/test/ha-2-drain.proof.ts`（`:24`-`:70` fake sink/controlledFetch/fakeNotify 形制）· `apps/api/test/sse-delta-arm.proof.ts`（`:50`-`:59` fake LISTEN client）· `apps/api/test/uc-e2e-010-sse-resume.proof.ts`（`:260` 断线窗）→ 旁证卷 `ai-docs/delivery/harness/xrep-REQUEST.md`（`§XR-2 :93` 二择一预注册 · `§9-EXEC :198` 择形②记录）· 收据 `ai-docs/delivery/receipts/sse-xrep/04-neighbor-sse-push-notify.log`（`:132` 同 PIN）。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①`ai-docs/delivery/execution-master-checklist.md:1660` **`GAP-SSEPUSH-REG-WINDOW`（控制器 initial 取数→pump waiter 注册 ~ms 级窗口 · 窗内事件由兜底收 ≤30s 非丢失 · 退化态 2s 收）**；②同卷 SSE-PUSH 段 Non-claims/STILL OPEN 五行登记（本行不关闭）；③三处证明面诚实 PIN（`sse-push-notify.proof.ts:924`、`receipts/evidence-delivery/2026-10-10-sse-push-notify-final.log:88`、`receipts/sse-xrep/04-neighbor-sse-push-notify.log:132`）——均=登记非证明；④`xrep-REQUEST.md:93` 二择一预注册（①尾窗容忍/②发射窗倒置消除）+`:198` EXEC 记录**择形②**；⑤协调方派单令（keyless 仪器小刀·单列本 GAP 证明面）。

---

## 认领核对 · 登记处 fresh 亲点（本卷核心盘点 · 逐行对 `origin/main` @`1ca3ce1da` 亲读·file:line 逐字）

| 登记处 | 对树行使证据（file:line 亲读逐字） | 判定 |
|---|---|---|
| `GAP-SSEPUSH-REG-WINDOW` 主登记 | `execution-master-checklist.md:1660` STILL OPEN 行原文：`GAP-SSEPUSH-REG-WINDOW`（控制器 initial 取数→pump waiter 注册 ~ms 级窗口 · 窗内事件由兜底收 ≤30s 非丢失 · 退化态 2s 收） | **开**（亲点维持） |
| 证明面诚实 PIN | `sse-push-notify.proof.ts:924` 逐字同句 PIN；`receipts/evidence-delivery/2026-10-10-sse-push-notify-final.log:88` 与 `receipts/sse-xrep/04-neighbor-sse-push-notify.log:132` 两处同句 | 旁证一致（PIN=登记非证明） |
| XREP 旁证 | `xrep-REQUEST.md:93` 预注册两形：①尾窗容忍（窗内事件由 `HEALTHY_FALLBACK_MS=30s` 兜底收）②消除（待首帧/心跳后始发 INSERT）；`:198` EXEC 实录「**XR-2×2（reg-window 择形②消除=首帧先到后发射**+逐条 <500ms·实测读数 2.8-11.1ms 原样透出）」 | **旁证=绕行非证明**（测试发射序倒置使窗口不落入被测路径；产品侧窗口原样在树） |
| 其他登记面 | `grep -rn GAP-SSEPUSH-REG-WINDOW` 全树命中=checklist `:1660`+proof `:924`+收据三处+xrep 两处；`current-runtime-truth.md` / `high-concurrency-review.md` / `case-matrix` 零命中 | 不在册（无第二登记处） |

**起草席定谳（亲读结论·推翻即红停）**：本 GAP **不是机制缺陷，是窗口的证明缺口**，且**机制呈两区结构**（§0.2）——(i) **泵内尾循环零窗**：`:191` 下一轮 waiter 注册发生在 `:199` `fetchMore` 之前（D5 对偶行使），尾取数窗已被结构性消灭；(ii) **控制器 pre-fetch 边界窗真实存在**：三控制器均先 `await ...events(...)` 取 initial（`:264`/`:59`/`:57`）再调泵（`:268`/`:62`/`:60`），initial 快照之后、泵 `:169` 注册之前落库的事件，其 NOTIFY 命中零在册 waiter → 提示掉地（lossy hint），只能由兜底臂收。**故「机制已结构性闭合到可纯证伪」不成立**（边界窗在泵外）；刀型应为**双臂复合**：泵内用证伪臂钉死零窗，边界窗用承接臂证零丢失与有界时延（§1 二择一）。停止条件「机制已结构性闭合且无可证伪面」**未触发**。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse 亲算 @`1ca3ce1da`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git branch --list "line/regw*"` 恰本席一支 `line/regw-draft`；`git worktree list` 含 `meetwise-regw`（本席自树）；`ls ai-docs/delivery/harness/ | grep -i "regw\|reg-window"` 落卷前**零命中**→落卷后唯一同名卷=本卷。`grep -rn GAP-SSEPUSH-REG-WINDOW` 无第二认领卷。
- **在飞交叠复核（EXEC 立项日必做）**：本卷起草 turn 触面=**恰 1 新 .md**（产品零触）——与任何在飞刀零交涉。EXEC 期触面=1 新 proof+root/`apps/api` 两 `package.json` 注册行（各 1-2 行）；**不入 `scripts/run-e2e-isolated.mjs`**——纯单元缝 proof 先例 `prove:ha2-drain`（`apps/api/package.json:83`）与 `prove:s4b-delta-arm`（`:106`）均不入 runner，本刀沿同形（§2-4）。届时对两 `package.json` 注册区做 `git log -1 -- <file>` 在飞复核，任一分支顶在本基后有新增提交→触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git rev-parse HEAD:<path>` 亲算·8 hex）

| 文件 | blob（行数） | 关键锚 |
|---|---|---|
| `apps/api/src/platform/sse-pump.ts` | `b93121dc`（223） | **`:23`-`:25` D5 注释区**（先注册 waiter 再取数/notify lossy hint/漏醒兜底收）·`:70` `HEALTHY_FALLBACK_MS = 30_000` · `:71` `DEGRADED_POLL_MS = 2_000` · `:83` 函数入口 · `:87`-`:88` hijack/writeHead · `:123`-`:125` registry 注册 · `:126` `lastSeq = o.initial.lastId` · `:131` `lastSeq = Math.max(...)` · `:135` deadline 10min · `:136` close 即醒 · **`:169` 首次 `waitFor`** · `:170` catch-up emit · `:173` while · `:174`-`:176` health→waitMs · `:177`-`:185` race/计时器/唤醒钩 · `:188`-`:190` clear/dispose/break · **`:191` 下一轮 `waitFor`** · `:192`-`:196` delta-only 免取数 · `:197`-`:199` `fetchMore(lastSeq)` · `:205`-`:208` null/drain/emit/ping · `:210`-`:213` dispose/unregister · `:222` 单点 end |
| `apps/api/src/platform/sse-notify.service.ts` | `a20b0720`（500） | `:185`-`:187` `health()` 同步读 · `:190`-`:195` `whenHealthy` · **`:197`-`:210` `waitFor`（router Set 在册→resolve+自摘除）** · `:212`-`:218` `waitingCount` · **`:309`-`:319` `onNotification`（按流取 Set；无在册 waiter 即 return=提示掉地）** · `:360` `wakeAllWaiters`（掉线全醒） |
| `apps/api/src/modules/interview/interview.controller.ts` | `d10db4ae`（280） | `:260` 领槽先于取数注 · `:262` acquireSlot/429 · **`:264` `const initial = await this.interviews.events(...)`** · `:268` `await pumpSseEvents({` · `:278` finally releaseSlot |
| `apps/api/src/modules/quiz/quiz.controller.ts` | `9b78100d`（72） | **`:59` initial 取数** · `:62` pump 调用 · 无 deltaSource（裁决⑤零触） |
| `apps/api/src/modules/diagnosis/diagnosis.controller.ts` | `f2d7ea90`（70） | **`:57` initial 取数** · `:60` pump 调用 · 无 deltaSource |
| `apps/api/src/modules/interview/interview.service.ts` | `a8ae0d15`（918） | `:910`-`:917` `events()`；`:915` SQL **`WHERE stream_key=$1 AND seq>$2 ORDER BY seq`**（initial 与 tail 同谓词） |
| `apps/api/src/modules/quiz/quiz.service.ts` | `98edbeb2`（140） | `:131`-`:139` `events()`；`:137` 同 `seq>$2` 谓词；`:136` 越权 0 行→null→404 |
| `apps/worker/src/job-wakeup-listener.ts` | `fc18131d`（157） | `:111` `LISTEN ${...}` · **`:112`-`:114` 注释「LISTEN first, then reconcile: a commit between an earlier scan and LISTEN cannot be missed」** · `:115` `onWake()`=D5 先例 |
| `ai-docs/delivery/execution-master-checklist.md` | `2884be76`（4503） | **`:1660` STILL OPEN 五行登记（本 GAP 原文）** · `:1661` XREP CLOSED 行 · `:1665` 收账注 |
| `ai-docs/delivery/harness/xrep-REQUEST.md` | `b218924b`（210） | `:93` XR-2 reg-window 二择一 · `:198` §9-EXEC 择形② |
| `apps/api/test/sse-push-notify.proof.ts` | `3056a929`（934） | `:924` GAP 诚实 PIN · `:539`-`:579` P-2b 单元臂（G1 cadence/G2 notify 主推） |
| `apps/api/test/ha-2-drain.proof.ts` | `1be2f6c7`（317） | `:24`-`:50` fake sink · `:53`-`:59` `fakeNotify()`（健康恒真、waitFor 永不 resolve）· `:62`-`:70` `controlledFetch` |
| `apps/api/test/sse-delta-arm.proof.ts` | `8a6ff458`（319） | `:50`-`:59` `fakePgClient`（LISTEN/pg_trigger 应答）· `:88`-`:110` startPump 直驱形 |
| `apps/api/test/uc-e2e-010-sse-resume.proof.ts` | `680fbd66`（320） | `:260` 断线窗 append（客户端不在线）· `:310` `GAP-UC010-UI` PIN |
| `scripts/ai-docs/public-text-policy.mjs` | 本树届值 | `:276` `const MAX_FILES = 2_461`（cap·**Ban 自升**） |

### 0.2 机制逐行现形（三控制器 → 泵 → notify → 取数 → 兜底）

**(a) D5 注释区（`sse-pump.ts:23`-`:25` 逐字）**：
`时序纪律(D5,worker listener :112 先例):每轮先注册 waiter 再取数,消灭注册窗竞态;notify 为 lossy hint,误醒空手 ping、漏醒由兜底收。Last-Event-ID 重放语义零改(initial catch-up 与 tail 取数均为 seq>lastSeq 同一形状)。`

**(b) D5 先例（`job-wakeup-listener.ts:111`-`:115`）**：先 `LISTEN`，再 `onWake()` reconcile——「更早的 scan 与 LISTEN 之间的提交不可能被漏」，与泵「先注册 waiter 再取数」同构；D5 是同一纪律在 SSE 泵的行使。

**(c) 泵入口/首次注册序（逐行）**：`:84` 取 notify（注入优先）→ `:87` `reply.hijack()` → `:88` `writeHead(200, text/event-stream)` → `:123`-`:124` registry 注册（HA-2 排水旗）→ `:126` `lastSeq = o.initial.lastId` → `:136` close 即醒钩 → **`:169` `let wait = notify.waitFor(o.streamKey)`（先注册）** → **`:170` `emit(o.initial.rows)`（后重放 catch-up）** → `:173` 进循环 → `:174`-`:176` 同步读 `health()` 定 `waitMs`（健康=30_000/退化=2_000）→ `:178`-`:180` race promise+兜底计时器（unref）→ `:181`-`:184` close/delta/notify 三唤醒钩（`notifyWoke` 逐轮重置）→ `:185` `await race` → `:188` 必清计时器 → `:189` `wait.dispose()` → `:190` 帧边界退出守卫 → **`:191` 先注册下一轮 waiter** → `:192`-`:196` delta-only 免取数 → **`:197`-`:199` `more = await o.fetchMore(lastSeq)`（后取数）** → `:207` 有行即 emit / `:208` 空手 ping → 回到 `:173`。

**(d) 窗口的精确边界（控制器侧，非泵内）**：三控制器同形——`interview.controller.ts:264` `const initial = await this.interviews.events(req.principal, id, lastEventId);` → `:268` `await pumpSseEvents({...})`；quiz `:59`→`:62`；diagnosis `:57`→`:60`。initial 取数返回后到 `:169` 前**无任何 `await`**（泵体同步执行至 `:185`），故窗口的墙钟成分 = **initial SELECT 的 DB 往返 + 微任务切换**，量级 ms（与 checklist「~ms 级」一致），而非 30s。

**(e) 提示掉地的机制依据（`sse-notify.service.ts`）**：`:197`-`:210` `waitFor` 把 waiter 放进 `router` 的 per-streamKey `Set`；`:309`-`:319` `onNotification` 收到裸 stream_key 后 `const set = this.router.get(key); if (!set) return;`——**注册前无 Set/Set 空 ⇒ 提示静默丢弃**（lossy hint 的字节级含义）；NOTIFY 语义本身不排队、不重放。

**(f) 零丢失的机制依据（取数谓词）**：`interview.service.ts:915` / `quiz.service.ts:137` 均为 `seq > $2 ORDER BY seq`；泵 `:131` `lastSeq = Math.max(lastSeq, e.seq)` 单调前进；`:199` 每轮以 `lastSeq` 取数。故边界窗内落库的行（seq 大于 initial 已重放的最大值/游标）**必在下一轮唤醒的 `fetchMore` 返回**——兜底臂是唯一可能迟到的唤醒源，但**不是唯一可能送达的路径**（notify 若在 `:169` 后到达则立即取数，§0.2-g）。

**(g) 承接链两形**：
- **立即承接**：notify 在 `:169` 之后（含 catch-up emit 期间）到达 → waiter resolve；即使 `:184` 的 `.then` 尚未挂上，已 resolve 的 promise 也会在挂上后立刻触发 → race 立即醒 → `:191` 重注册 → `:199` 取数 → `:207` emit。**不等兜底**。
- **兜底承接**：notify 在 `:169` 之前掉地 → 本轮 race 由 `:179` 计时器 settle → `:199` 取数 → emit。健康通道 `waitMs=30_000`（生产钉值，`:70`/`:175`），退化通道 `DEGRADED_POLL_MS=2_000`（`:71`/`:176`）。
- **终态不例外**：窗内终态事件同样经任一承接臂 emit，`:132` `done=true` 后帧边界退出，`:222` 单点 `end()`。

**(h) 两区结论（本卷刀型的依据）**：

| 区 | 位置 | 结构性状态 | 可证形式 | 本卷臂 |
|---|---|---|---|---|
| 区1 尾循环取数窗 | `:191` 重注册 vs `:199` 取数 | **零窗**（先注册后取数，D5 对偶） | **证伪式**：注入在途事件→必须命中已注册 waiter→即时送达；若序回归则退化为兜底时延（判决性） | RW-1（+RW-3 立即承接） |
| 区2 控制器 pre-fetch 边界窗 | `:264` 取数快照 → `:169` 注册 | **存在**（泵外，无法由泵关闭；关窗需产品码把 initial 取数移入泵） | **承接式**：窗内提交→提示掉地→兜底送达，零丢失/零重放/有界时延 | RW-2/RW-4/RW-5 |

### 0.3 checklist `:1660` 原文（逐字·不洗）

`- [ ] **STILL OPEN（行登记 · 均不关闭）**：**GAP-SSEPUSH-PROD-30S**（生产兜底 30s 为源钉值 HEALTHY_FALLBACK_MS=30_000 · 行为证明=注入 250ms 加速 + HTTP 2.8s 静默窗旁证 · 30s 原值级生产读数未采——登记不关闭）· GAP-SSEPUSH-FULL-E2E（full e2e 三流 interview/quiz/diagnosis 终态段未跑）· GAP-SSEPUSH-QUIZ-DX-HTTP（quiz/diagnosis 共 pump 共表码面单源+类型检查 · HTTP 级逐实体流证明未单列）· **GAP-SSEPUSH-REG-WINDOW（控制器 initial 取数→pump waiter 注册 ~ms 级窗口 · 窗内事件由兜底收 ≤30s 非丢失 · 退化态 2s 收）** · g7SuiteGreen=false 维持.`

### 0.4 xrep 旁证引证（旁证≠证明·零重叠依据）

- `xrep-REQUEST.md:93`（XR-2）预注册**二择一**：①尾窗容忍——窗内事件由 `HEALTHY_FALLBACK_MS=30s` 兜底收（判定窗上限=30s+ε，窗内完到不判丢）；②消除——待首帧/心跳到达后才开始 INSERT（发射窗与注册窗序倒置）。
- `xrep-REQUEST.md:198`（§9-EXEC）实录：**「XR-2×2（reg-window 择形②消除=首帧先到后发射+逐条 <500ms·实测读数 2.8-11.1ms 原样透出）」**。
- 判定：xrep **择形②=测试侧绕行**——发射被推迟到首帧之后，窗口不落入被测路径，故 xrep 未产生「窗内事件」读数，**未证明本 GAP**；其收据 `receipts/sse-xrep/04-neighbor-sse-push-notify.log:132` 仍承 PIN。**本刀补的正是 xrep 明确绕开的那一面**（零替代、零互借）。

---

## §1 修法（恰 1 具名 proof=`sse-reg-window` · RW-0…RW-5 六臂 · keyless 单元缝 · 零产品码触 · 零 invent covered）

**修法形状**：新增 `apps/api/test/sse-reg-window.proof.ts`——纯单元缝，**零 DB 连接零模型外呼零 HTTP 起服**：fake notify（可控 waiter 集/health/drop 计数，形制沿 `ha-2-drain.proof.ts:53`-`:59` 扩展）· fake sink（writes/times/endCount，沿 `ha-2-drain.proof.ts:24`-`:50`）· 内存行存储（snapshot/fetch 两法复刻 `seq>lastId` 谓词）· `pumpSseEvents` 直驱（`registry: createSseRegistry()` 每臂独立，防单例串臂）。注册面：root `package.json` 1 行（`sse-reg-window:prove`）+ `apps/api/package.json` 1 行（`prove:sse-reg-window`）；**不入 `scripts/run-e2e-isolated.mjs`**（纯单元 proof 先例 `prove:ha2-drain`/`prove:s4b-delta-arm` 均不入，§0.0/§2-4）。

**等价类申明（为什么无需真库）**：边界窗的泵侧输入只有 `initial {lastId, rows}` 与 `fetchMore`。真库版「initial SELECT 快照后、`:169` 前提交」在泵看来等价于「调用前固定 initial、随后行可见」；NOTIFY 掉地等价于「注册前 `fire()` 命中 0 waiter」。故 RW-2 的注入是**该窗口的精确等价类**，不引入时序抖动，也不依赖隔离 PG（§1.3 否决真库臂）。

### 1.0 刀型二择一（建议=乙·双臂复合 · 理由）

| 选项 | 形状 | 判决 |
|---|---|---|
| 甲 · 单臂「承接只证」 | 仅 RW-2/RW-4/RW-5：窗内事件被兜底/立即送达、零丢失 | **否决**——只证「不丢」，**不能区分「窗口存在」与「窗口不存在」**；GAP 的前提（窗口真实存在、且泵内只有兜底能收）未被验证，等于用结果掩盖前提。 |
| **乙 · 双臂「证伪 + 承接」（建议）** | RW-0/RW-1/RW-3 证伪区1（泵内零窗、即时承接）；RW-2/RW-4/RW-5 承接区2（边界窗 lossless 有界） | **建议**——同时钉死两件事：①D5 在泵内真的行使（先注册后取数，序回归即红）；②唯一残留窗在控制器边界、且该窗行为与 checklist 措辞逐字一致（≤30s 健康/2s 退化、非丢失）。这正是「证伪式证明」在区1 的正当用法，同时不给区2 伪造「零窗」结论。 |
| 丙 · 纯证伪「断言窗不存在」 | 只断言全局无窗 | **Ban**——控制器边界窗在树，断言全局无窗即与 `:264`→`:268` 源码及 checklist 原文矛盾=伪造绿。 |

**机制未完全闭合的判断依据**：若 initial 取数已移入泵（即 `pumpSseEvents` 内部自行 `fetchInitial`），则区2 消失、刀型可退化为纯证伪；本树三控制器均为**泵外取数**（§0.2-d），故不成立。EXEC 期若发现该结构已变（在飞刀把取数移入泵），触 §8「机制不满足/结构已闭合」→ 红停上报，改 docs 钉刀，**不得**为凑臂虚构窗口。

### 1.1 六臂设计（逐臂注入点/断言/判决性）

**RW-0 · 结构静态臂（4 断言·把 §0.2 的「现形」变成机器可判）**
1. 首次注册先于 catch-up：源内 `let wait = notify.waitFor(o.streamKey)` 的 index < `emit(o.initial.rows)` 的 index。
2. 下一轮注册先于取数：`注册下一轮 waiter` 注释锚 index < `more = await o.fetchMore(lastSeq)` index。
3. 边界窗在控制器：三控制器各自 `const initial = await ...events(` index < `pumpSseEvents({` index（interview/quiz/diagnosis 三查，一断言聚合）。
4. 双钉值在场：源内含 `const HEALTHY_FALLBACK_MS = 30_000` 与 `const DEGRADED_POLL_MS = 2_000`。

**RW-1 · 证伪臂·泵内尾窗零窗（3 断言）**
- 注入点：`fetchMore` **第一次在途时**（此时 `:191` 已注册 waiter#2、`:199` 尚未返回）落库 seq=1 并 `fire()`。
- 断言：①`fire()` 命中 1 个在册 waiter（提示不掉地）；②进入 fetch#1 时 `waitFor` 调用数 ≥2（注册序在取数前）；③在 `fallbackMsHealthy=1000` 下事件送达 **<300ms**（判决性：若序回归为「先取数后注册」，事件只能等 1000ms 兜底 → 红）。
- 读数 PIN：`zero_window_delivery_ms`。

**RW-2 · 承接臂·健康通道窗内事件由兜底收（4 断言）**
- 注入点：内存快照 `{lastId:0, rows:[1,2]}` → 快照后落库 seq=3 → `fire()`（注册前，0 waiter）→ 启动泵（`fallbackMsHealthy=60`）。
- 断言：①`fire()` 命中 0 waiter 且 drop 计数=1（lossy hint 掉地，忠实复现）；②seq=3 在 **60ms+ε** 内送达（`<500ms` 容差；60 是注入加速值，生产钉值 30_000 由 RW-0-4 静态钉住）；③写出序列恰 `id:1,id:2,id:3`（catch-up 不重放、窗口行不丢、零间隙零重复）；④close 后泵返回且 `waitingCount()===0`（无 waiter 泄漏；close 路径按 `:222` 守卫不 end，end 恰一次由 RW-5 终态路径承担）。

**RW-3 · 立即承接臂·注册后提示即时取数（2 断言）**
- 注入点：泵调用返回后**立即** `fire()`（泵体已同步执行到 `:185`，`:169` 已注册；行 3 已在库）。
- 断言：①送达 **<300ms**（判 `fallbackMsHealthy=1000`，证明「立即取数承接」而非兜底）；②恰一次写出 `id:3`。
- 该臂与 RW-2 合起来覆盖「提示在注册前/后」两分支，即 `:23`-`:25` 注释的完整语义。

**RW-4 · 退化臂·2s 轮询收窗内事件（2 断言）**
- 注入点：`health()` 恒 `{healthy:false}`；快照后落 seq=1；注册前 `fire()`（掉地）；泵 `fallbackMsHealthy=60`（应被忽略）。
- 断言：①送达落在 **1900–2800ms**（首 tick=2_000；证明走 `DEGRADED_POLL_MS` 而非 60ms 注入值）；②close 后 waiter 归零。
- 读数 PIN：`degraded_delivery_ms`。

**RW-5 · 终态窗内事件臂（2 断言）**
- 注入点：快照后落 seq=1、`kind=report_ready`（终态）；注册前 `fire()` 掉地；`isTerminal` 认该 kind。
- 断言：①兜底送达终态帧（不漏终态、不空转到 deadline）；②`end()` 恰一次、无写后半截（沿 `ha-2-drain` 的 writesAfterEnd=0 形）。

**确定性纪律（全臂）**：等待一律 `until(cond, timeout)` 轮询（沿 `sse-delta-arm.proof.ts` 形），**Ban 裸 sleep 硬等**；时间断言只用于**判决性判别**（RW-1/RW-3 的 <300ms vs 1000ms；RW-4 的 1900–2800ms），其余为内容断言；所有读数以 `PIN` 行原样透出（不取整不修饰）。预计 17 断言。

### 1.2 非替代申明（零重叠核·reason 级可分）

| 既有面 | 它证什么 | 为什么不可替代本刀 |
|---|---|---|
| `sse-push-notify.proof.ts` P-2b（`:554`-`:579`） | 无事件时兜底 cadence=注入值；notify 到达即醒（<1000ms） | 不注入「initial 快照→注册」窗内事件；不断言提示掉地；不区分两区结构 |
| 同 proof `:924` | 本 GAP 的**诚实 PIN**（打印登记，非断言） | PIN≠证明；本刀把该 PIN 转为可执行断言 |
| xrep XR-2（`:93`/`:198`） | 跨副本延迟；**择形②把发射推迟到首帧后** | 绕行窗口，零窗内读数；本刀正面注入窗内事件 |
| `uc-e2e-010-sse-resume.proof.ts:260` | 客户端断线期间的 append → Last-Event-ID 重连重放 | 客户端不在线的**断线窗**；本刀=客户端在线但服务端 waiter 未注册的**注册窗**，两个不同窗 |
| `sse-delta-arm.proof.ts` | delta 帧唤醒/免取数/ring 丢旧 | 不涉 initial 边界窗；本刀零 deltaSource |
| `ha-2-drain.proof.ts` | 停机排水/end 恰一次/受控取数 | 排水语义；本刀仅借其 fake harness 形制（只读引用，零改动） |
| `uc-e2e-017-orphan-http-sse.proof.ts` | 429 孤儿槽 | 槽口面；与本窗零交集 |

### 1.3 否决表（落选项诚实留痕）

| 落选项 | 否决/登记理由 |
|---|---|
| 真隔离 PG + 真 LISTEN 注入窗内事件 | 窗口由 DB 往返决定，无法确定性把提交卡在「快照后、注册前」；需隔离库+PG，违背 keyless 小刀预算；泵侧等价类已精确（§1 等价类申明）。 |
| HTTP/UI 级时序臂 | 需起 app+客户端，抖动大、判决力弱；窗在毫秒级不可控。 |
| 裸 sleep 硬等制造窗口 | Ban（沿 xrep `:93` 第三形禁令）；且 sleep 不保证落在窗内。 |
| 纯证伪「窗不存在」 | 与三控制器泵外取数结构及 checklist 措辞矛盾（§1.0-丙）。 |
| 产品码修法（把 initial 取数移入泵以关窗） | 越界：本刀 docs/proof-only；关窗=产品语义变更，须另刀授权+全量回归。 |
| 改既有 proof/仪器 | Ban；只读引用其 harness 形制。 |
| 借 xrep 收据宣本 GAP 已证 | 旁证≠证明；xrep 明确绕行（§0.4）。 |
| 翻 checklist `:1660` 行 | 翻面权归协调方；本刀只产收据供评估（§2-5）。 |

---

## §2 验收门矩阵（起草门 4 门本 commit 适用 + EXEC 届树届时重 pin）

1. **docs:check（亲跑·EXIT 原值）**：`node scripts/ai-docs/check-docs.mjs` —— 起草前本树 **EXIT=0 · scanned 2457**；cap=**2_461**（`scripts/ai-docs/public-text-policy.mjs:276` `const MAX_FILES = 2_461` 亲证）。本卷 +1 → 起草树 **2458 ≤ 2_461（余 3）**；EXEC +1 proof → **2459 ≤ 2_461（余 2）**。**零步进**（不需 cap sanction）；EXEC 期若在飞并线致 >2_461 → 触 §8「验收红不可修」停手上报，**Ban 自升**。
2. **PTP 公开文字政策（亲跑）**：`node scripts/ai-docs/public-text-policy.proof.mjs` **EXIT=0 12/12**（起草前基线；本卷落卷后复跑须仍 12/12）。
3. **markers 五类 + 行首冲突标记（亲跑·改动集）**：词面运行时组装口径（`scripts/i6-239-gates.proof.mjs:159`-`:163`·卷内不复抄防自指）；起草 commit 改动集=本卷 1 件 → grep **零命中**；EXEC 期改动集=proof+两 `package.json` → 同检零命中。
4. **diff 面机检**：起草 commit `git diff --numstat <base>` **恰 1 tracked 路径**=本卷 `.md`；EXEC 期=本卷+`apps/api/test/sse-reg-window.proof.ts`+root `package.json`+`apps/api/package.json`（**runner 零触**）——多任何未登记 tracked 路径即停。
5. **EXEC 主门（届时）**：`pnpm -C apps/api prove:sse-reg-window` **EXIT=0**（17 断言全 PASS·PIN 读数入收据）；邻面不回退 `pnpm -C apps/api prove:ha2-drain` EXIT=0 · `prove:s4b-delta-arm` EXIT=0 · `prove:sse-push-notify` EXIT=0（三件均 keyless 直跑形）；`pnpm -C apps/api typecheck` EXIT=0；新 proof eslint **零 warning**（lint 帽零新增——若触帽沿协调方 sanction 面，非起草刀自裁）。
6. **行/列冻结**：EXIT0=case≠covered · coveredCount=8 零翻转 · `:1660` 行**零改**（翻面权归协调方）· Ban 借本收据宣 GAP closed/窗已消除/生产 30s 已证（RW 读数=注入加速值，非生产原值级读数；后者归 `GAP-SSEPUSH-PROD-30S`）。

## §3 范围外（越界即 FAIL）

1. **产品码零触**：`apps/*/src`、`packages/*/src`、migrations 零 diff；关窗修法不在本刀。
2. **既有 proof 家族零触**：`sse-push-notify`/`ha-2-drain`/`sse-delta-arm`/`uc-e2e-010`/`sse-principal-slot`/`sse-cross-replica` 只读引用。
3. **SSOT/登记文件零改**：checklist `:1660`（及同段五行）、`xrep-REQUEST.md`、case-matrix、current-runtime-truth、high-concurrency-review、台账卷零改；收据 additive 供协调方评估。
4. **runner/CI 零触**：`scripts/run-e2e-isolated.mjs` 零改（§2-4）。
5. **HA/SLO/发布叙事零涉**：Ban 借读数宣 HA、延迟 SLO、releaseEvidence、生产容量；Ban 借 `GAP-SSEPUSH-PROD-30S` 面互借。
6. **零 Key 零配置**：不读 `.env*`、不写 secrets、零模型外呼。

## §4 依赖

**①上游已满足**：机制源全在树（§0.1 blob 亲算）；三控制器同形；notify 服务与泵注入缝（`notify?`/`registry?`/`fallbackMsHealthy?`）齐备（`sse-pump.ts:56`-`:61`）；fake harness 形制先例在树（`ha-2-drain`）。**②同文件并发**：起草 turn 仅 1 新 `.md`，零交涉；EXEC 期仅两 `package.json` 注册区（高汇聚区）——§0.0 在飞复核必做，union additive 双留，`merge-tree` 预演。**③下游**：本刀收据供协调方评估 `:1660` 行；行翻面不在本刀。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 动主仓；Ban 自批（pre-exec 双审两独立外席·alone≠dual）；Ban retry-to-green（红即停·attempts 台账·环境红/臂红分口·Ban 改断言迁就）；Ban invent covered（含借 PIN 升格/翻 `:1660` 行）；Ban live key（零 Key 硬跑）；Ban 触产品码/迁移/runner/既有 proof/SSOT；Ban 裸 sleep 硬等（§1.1 确定性纪律）；Ban 纯证伪「全局无窗」（§1.0-丙）；Ban 把注入加速值（60ms/2s）宣为生产 30s 原值级读数；Ban 借 xrep 择形② 宣本窗已消除；Ban 伪造已读/已验来源（§0 全亲证为本卷前提）；Ban 造 `.env*`/写 Key 值入树入据；Ban 顺带升级依赖；Ban 借读数宣 HA/SLO/发布叙事/生产容量。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。
**本卷附加钉**：Not HA · keyless（零 DB 连接/零模型/零网络）· 本窗=**容忍不消除**（产品侧原样，零产品码触）· 30s=源钉值静态断言而非生产原值级读数 · `:1660` 行零改 · 窗口机制=两区结构（区1 零窗/区2 边界窗）措辞冻结。

## §6 keyless 判定 + cap 预算核 + 零重叠核 + est live=0

- **keyless 判定=真**：proof 仅 import `sse-pump.ts`（及其静态依赖 `sse-notify.service.ts` 的**模块加载**，不建立 LISTEN：`getSseNotify()` 惰性、本 proof 不调用）与 `sse-registry.ts`；notify/sink/存储全 fake；零 `@meetwise/db` 连接、零 PG、零 HTTP 起服、零模型外呼、零环境变量/Key。先例：`prove:ha2-drain`、`prove:s4b-delta-arm` 同为 keyless 直跑。
- **cap 预算核**：2457（起草前 scanned）→ 2458（起草 +1）→ 2459（EXEC +1 proof）≤ **2_461**；余 3/2。**零步进**。
- **零重叠核**：xrep（择形②绕行·`:198`）/uc010（断线窗·`:260`）/sse-push-notify（cadence+主推·`:554`-`:579`）/sse-delta-arm（delta 臂）/ha-2-drain（排水）五面逐条 reason 级可分（§1.2），零替代零互借。
- **est live=0**：起草 turn 与 EXEC 期均零外呼零 Key 零生产操作零消耗（EXEC 仅本地 node 直跑）。

## §7 markers=0（卫生声明）

本刀改动集（起草 turn=本卷 1 `.md`；EXEC 期=proof+两 `package.json`）五类标记词 + 行首冲突标记 grep **零命中**（起草席亲跑；词面运行时组装口径，`scripts/i6-239-gates.proof.mjs:159`-`:163` 同形，卷内不复抄防自匹配）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual`（三处钉：本节 + Status 行 + 卷尾 · 同值）。** 开工三条款（未履行不得 EXEC）：①pre-exec 双审两独立外席 BOTH PASS 落卷；②协调方明示 EXEC 授权；③§0 全量对届时 tip 重 pin——机制源/三控制器/取数谓词/双钉值任一漂移且结论受疑即回炉。
- **现场漂移**：二 `package.json` 注册区被在飞刀改写、或 `sse-pump.ts` 的 D5 序/`waitFor` 行/`fetchMore` 行漂移且结论受疑 → 停·重 pin。
- **机制不满足 / 结构已闭合**：EXEC 期发现 initial 取数已移入泵（区2 消失）或 `:191`/`:199` 序回归（区1 被证伪）→ **红停上报**：前者改 docs 钉刀（纯证伪形，须协调方重裁刀型）；后者=产品机制回归，EXIT1 诚实保留+backlog 登记，**Ban retry-to-green/断言迁就**。
- **越界需要**：修法诉求超出「1 proof + 2 注册行」（需产品码关窗/真库/runner/改既有 proof）→ 停·另刀或协调方裁决。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check >2_461 / PTP 红 / 邻面 proof 红 / typecheck/lint 超）→ 停·stash 对照亲证基线·如实登记·Ban 借机修。

## §9 状态

**`draft:awaiting_pre_exec_dual`**（2026-10-30 起草落卷即停 · 前无状态 · pre-exec 双审两独立外席待派 · Ban self-approve · alone≠dual · ⛔push ⛔动主仓 · est live=0 · markers=0 · cap 零步进 · 收据/EXEC 记录待后续席追加，本节 append-only 不改既有字）。

---

*REGW REQUEST · 2026-10-30 起草落卷 · **STOP=`draft:awaiting_pre_exec_dual`**（三处钉：Status 行+§8+本行·同值）· 认领=`GAP-SSEPUSH-REG-WINDOW`（checklist `:1660`·fresh 亲点维持**开**）· 定性=**证明缺口非机制缺陷**（区1 泵内零窗：`:191` 先注册后 `:199` 取数；区2 控制器 pre-fetch 边界窗：`:264`/`:59`/`:57` 取数先于 `:268`/`:62`/`:60` 泵调用，提示在 `:169` 前掉地，`seq>lastSeq` 谓词保证下一轮兜底取回）· 刀型=**乙·双臂复合**（RW-0/RW-1/RW-3 证伪区1 零窗与即时承接；RW-2/RW-4/RW-5 承接区2 零丢失/零重放/有界时延；纯证伪否决）· 修法=恰 1 proof `apps/api/test/sse-reg-window.proof.ts` 六臂 17 断言 keyless 单元缝（zero DB/model/HTTP）· 注册=root+api 两行，runner 零触· 零产品码零迁移零 Key · cap **零步进**（2457→2458→2459≤2_461）· pins 十一值零翻 · est live=0 · markers=0 · releaseEvidence=false · Not HA · Ban SLO/HA/发布叙事 · Ban 借 xrep 择形② 宣窗已消除 · ⛔push ⛔动主仓 · 起草态 STOP*

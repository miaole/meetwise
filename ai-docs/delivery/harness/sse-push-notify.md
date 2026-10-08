# SSE-PUSH · SSE 2s 轮询 → PG LISTEN/NOTIFY 精确推送重构 · REQUEST（docs-only）

status: **`draft:awaiting_pre_exec_dual`**（REQUEST 就绪 · 预执行双审未做 · meetwise 未授权 EXEC · 本 commit 零码零迁移零实跑——trigger/连接/抽 util/proof 属下轮 EXEC 面）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

## 0. Base line 与 worktree 披露

- fetch 2026-10-07：`origin/feat/mysql-schema-skeleton` = `0fe96fca`（≥ `0fe96fca` 达成——恰为 tip；本地同名分支已 ff 同点）。
- 本刀 worktree：`/Users/miaole/Desktop/golucky/meetwise-line-ssepush`（仓库根同级新建）；分支 `line/sse-notify-push`（新立自 `0fe96fca`）。
- 立项出处：**用户直裁立项（任务书直发）**——非 GAP 行承接，本文不自建 SSOT 行。三处 2s 轮询现状为码面事实（§1 亲算），非本 REQUEST 实测红读数。
- 全部 blob/行号锚为 mw-core 在本 worktree 于 base 点以 `git rev-parse HEAD:<path>` / 逐行亲算，非转录：

| 文件 | blob @ 0fe96fca | 角色 |
| --- | --- | --- |
| `apps/api/src/modules/interview/interview.controller.ts` | `18004851` | 现状锚①（EXEC 改动面） |
| `apps/api/src/modules/quiz/quiz.controller.ts` | `83a7f37c` | 现状锚②（EXEC 改动面） |
| `apps/api/src/modules/diagnosis/diagnosis.controller.ts` | `2f4c31c8` | 现状锚③（EXEC 改动面） |
| `apps/api/src/platform/last-event-id.ts` | `40b12d01` | 反语义漂移钉（Ban 改） |
| `apps/api/src/platform/rate-limit.service.ts` | `08f5993b` | acquireSlot/releaseSlot 只读引用 |
| `apps/api/src/platform/db.service.ts` | `b4589eba` | DI 模式蓝本（复用形态不改本体） |
| `apps/worker/src/job-wakeup-listener.ts` | `fc18131d` | LISTEN 生命周期蓝本（Ban 改） |
| `apps/worker/src/main.ts` | `e4878b61` | Ban 改（:633 wiring 在内） |
| `packages/db/src/worker-job-wakeup.ts` | `7a46fc9b` | Ban 改（wakeup 通道本体） |
| `packages/db/src/interview-event.ts` | `d2d81df2` | appendEvent 写路径只读引用 |
| `packages/db/migrations/0001_baseline.sql` | `d68f8dd0` | interview_event schema 本体（Ban 改） |
| `packages/db/migrations/0059_interview_privacy_projection_fence.sql` | `4fbac173` | 既有 trigger #1（Ban 改） |
| `packages/db/migrations/0126_interview_answer_dual_write_fence.sql` | `867ea729` | 既有 trigger #2（Ban 改） |
| `packages/db/migrations/0084_worker_job_wakeup_notifications.sql` | `9eb6fe38` | worker wakeup trigger 先例（Ban 改） |
| `packages/db/migrations/0133_job_route_pending_worker_wakeup.sql` | `9380e6f9` | trigger 迁移风格蓝本（Ban 改） |
| `apps/api/test/uc-e2e-010-sse-resume.proof.ts` | `2453840f` | proof 先例（复跑绿对象·Ban 改） |
| `e2e/helpers/sse.ts` | `9bba015d` | SSE wire format 钉（Ban 改） |

**现状锚行号披露（任务书锚 vs 当树亲算·漂移如实登记）**：任务书 `interview.controller.ts:287-292` → 当树（`18004851` 亲算）：acquireSlot `:256` · hijack `:258` · isTerminal `:264` · emit `:267-273` · deadline(10min) `:275` · **while `:276` · sleep(2000) `:277` · 每轮 tail fetch `:279`** · releaseSlot `:285`（全文件 287 行，任务书 `:287-292` 越过 EOF——两读法均指向同一段 while+sleep(2000) 轮询体，无歧义）。`quiz.controller.ts:57` 段 ✓（writeHead `:57` · acquireSlot `:54` · while `:73` · sleep `:74` · fetch `:76`）；`diagnosis.controller.ts:57` 段 ✓（同形：` :54/:57/:73/:74/:76`）。`main.ts:633/:640-641` ✓（apps/worker/src/main.ts `:633` = `startWorkerJobWakeupListener(createPool({ max: 1 }), …)` · `:640-641` = "never replaces the PG LISTEN session above" 注释段）。`worker-job-wakeup.ts:7/:15` ✓（`:7` production LISTEN/NOTIFY 注释 · `:15` channel 常量）。`acquireSlot(slotKey,5)`（任务书 `:262`）→ 当树亲算：定义 `rate-limit.service.ts:24`，三调用点 `interview:256`/`quiz:54`/`diagnosis:54`（`:262` 无当树对应——锚漂移如实登记，语义无歧义）。

## 1. 现状解剖（REQUEST 必写①）

**三处同款复制粘贴轮询体（码面亲算）**：interview（`18004851` `:276-283`）/ quiz（`83a7f37c` `:73-80`）/ diagnosis（`2f4c31c8` `:73-80`）——`while (!done && !closed && Date.now() < deadline) { await sleep(2000); fetch(seq>lastSeq); rows ? emit : ping }`，hijack 后连接挂 ≤10min。

**成本读数（码面推算·非实测）**：每轮 tail fetch 实为 ≥2 条 SQL（asPrincipal 内 own/guard 前置 + `SELECT seq,kind,payload FROM interview_event WHERE stream_key=$1 AND seq>$2 ORDER BY seq`——interview 流为 guardInterviewPrivacy+tail，quiz/diagnosis 流为 own check+tail）。每条空闲 SSE = 0.5 QPS 持续池负载，10min 封顶内最坏 **300 轮空查询/连接**；per-principal 5 槽并发上限（`acquireSlot(slotKey,5)`）下，N 个用户 ×5 条空闲 SSE 即纯轮询噪音打满请求池。事件到达延迟最坏 **≈2s**（poll tick 相位决定）。

**既有基础设施（只读引用·复用模式不改本体）**：worker wakeup `meetwise_worker_wakeup_v1` LISTEN/NOTIFY（`worker-job-wakeup.ts:7/:15` 常量 + `main.ts:633` 专用池 wiring + `job-wakeup-listener.ts` 完整生命周期：notification 回调零 SQL 只 edge-trigger、error/end→指数退避重连 100ms→5s cap、LISTEN-first-then-reconcile `:112-114`、stop 隐式 UNLISTEN）——**trigger 迁移风格蓝本 0084/0133**（SECURITY INVOKER · `SET search_path` · REVOKE · DROP IF EXISTS 再 CREATE · `SET LOCAL lock_timeout/statement_timeout`）。

**关键结构事实（设计约束本体）**：三实体事件**共用同一张 `interview_event` 表**（`0001_baseline.sql:38-46`：`stream_key`+`seq` 唯一），quiz/diagnosis 的 SSE 取数即 `stream_key=quizId/diagnosisId` 复用（`quiz.service.ts:103-110`/`diagnosis.service.ts:103-110` 亲读：同一条 `WHERE stream_key=$1 AND seq>$2`）。表内**无实体类型列**。写路径唯一入口 `appendEvent`（`interview-event.ts`，advisory 事务锁 + `INSERT…SELECT MAX+1` + `event_key` 幂等 `ON CONFLICT DO NOTHING`）——幂等冲突路径不产新行。

## 2. 设计（两案对比交双审 · REQUEST 必写②）

### 2.1 共同底座（两案共享·EXEC 处方）

- **D1 trigger（additive）**：`interview_event` AFTER INSERT 行级 trigger → `pg_notify(ch, payload)`，**payload 精简 = 只 id**（`NEW.stream_key`）——不携 owner/kind/payload 数据（镜像 wakeup lossy-hint 纪律，hint 只做"该流可能有新事件"信号，事实仍由 fetch 按 `seq>lastSeq` 从表内取）。`event_key` 幂等冲突不产新行→不触发 notify→正确（无新事件无推送）。
- **D2 API 进程共享 LISTEN 连接**：新 `apps/api/src/platform/sse-notify.service.ts`（NestJS provider·复用 `db.service.ts:6-10` DI 形态）——**每进程恰一条专用 LISTEN 客户端**（独立 `createPool({ max: 1 })`，不占请求池），生命周期复制 `job-wakeup-listener.ts` 模式（notification 回调内零 SQL 只 resolve 等待者；error/end→退避重连 100ms→5s；stop 隐式 UNLISTEN）。**禁每 SSE 一条 LISTEN 连接**（连接数随 SSE 线性爆炸，与 5 槽上限正面冲突——任务书明文禁）。
- **D3 进程内 router**：`Map<streamKey, Set<waiter>>`；`waitFor(streamKey): Promise<void>` resolve 即 lossy 信号；SSE 全退出路径（断开/终态/超时/取数失败）finally 注销 waiter。
- **D4 SSE 循环改造**：`await Promise.race([notifyPromise, sleep(30_000)])` 替 `sleep(2000)`——**无事件时零 SQL**（静默期 0 条；30s 兜底每路最多 20 条/10min + notify 按需），醒后同一 tail fetch（`seq>lastSeq` 幂等：误醒空手→ping；漏醒由兜底收）。
- **D5 时序纪律**：waiter 注册先于 initial catch-up 查询（LISTEN-first-then-reconcile 同构·`job-wakeup-listener.ts:112` 先例——注册与首查之间的 INSERT 至多产生一次无害误醒）。
- **D6 30s 兜底三重语义**：(a) LISTEN 断连静默窗最终一致（退避重连期间事件不丢——兜底 fetch 收）；(b) ping 心跳载体（空转唤醒写 `: ping\n\n`）；(c) 旧机制退化形态——LISTEN 全失效时行为=30s 轮询版旧循环，**fail-open 变慢不变错**，不引入新故障面。
- **D7 sse-pump util 去重**：新 `apps/api/src/platform/sse-pump.ts` 收三处复制粘贴段（hijack/writeHead/safeWrite/emit/loop/deadline/slot release 全收）；controller 只留 404 前置 + 429 + `isTerminal` 集合参数 + fetch fn 注入（三处集合原值：interview 5 值 `:264` / quiz 3 值 `:61` / diagnosis 3 值 `:61`——作为参数传入零合并）。

### 2.2 案A（推荐）· 统一 channel · payload=裸 stream_key

channel `interview_event_ch`（任务书原名）；单 trigger 单 channel 单 LISTEN；API router 按 `streamKey` 精确匹配分发，**实体无关**（interview 流 payload=interviewId、quiz 流=quizId、diagnosis 流=diagnosisId——三实体共表事实使统一 channel 是零分类成本的自然形）。三控制器同构注册 `waitFor(id)`，零实体感知。

### 2.3 案B · 三通道同构（或统一 channel+实体前缀）

- **B1 三通道** `interview_event_ch`/`quiz_event_ch`/`diagnosis_event_ch`：事件全落 `interview_event` 一表且无实体类型列 → trigger 无法从行内判实体归属 → 须 (i) trigger 内 JOIN `resume_quiz`/`resume_diagnosis` 分类（每 INSERT 额外查询 + trigger 与实体表 schema 耦合升温），或 (ii) app 写路径双写 notify（`appendEvent` 调用点多处、API/worker 皆写 → 漏报面 + 双写不一致，丧失"trigger 单点保证"）。
- **B2 统一 channel+实体前缀** `interview:<id>`/`quiz:<id>`/`diagnosis:<id>`：分类难题同 B1（前缀也须知实体类型），另加 router 剥前缀复杂度；唯一增益=日志可读性。

### 2.4 对比表（交双审裁决·本 REQUEST 推荐案A）

| 维度 | 案A 统一 channel（推荐） | 案B1 三通道 | 案B2 统一+前缀 |
| --- | --- | --- | --- |
| trigger 数 / channel 数 / LISTEN 连接 | 1 / 1 / 1 | 3 语义 1 表（需分类） | 1 / 1 / 1（需分类） |
| trigger 内分类 | **不需要** | JOIN 两实体表 或 app 双写 | 同 B1 |
| 每 INSERT 额外成本 | 0 | +1 分类查询（或双写调用） | 同 B1 |
| 漏报面 | 无（trigger 单点） | 双写路径漏报 / JOIN 失配漏报 | 同 B1 |
| router 复杂度 | Map 精确匹配 | 三 channel 三回调 | 剥前缀匹配 |
| "payload 精简=只 id"任务书吻合 | 裸 id ✓ | 裸 id（三通道各判） | 前缀 id（非裸） |
| 事件表 schema 触碰面 | 仅加 trigger（最小） | 同 + 耦合实体表 | 同 B1 |
| 实体日志可读性 | 中（id 无前缀） | 高 | 高 |

**推荐理由**：单表现实下案A 零分类、单点保证、改动面最小、payload 裸 id 与任务书原文吻合；B2 前缀若双审强要求可作案A 叠加增强（注册时带实体前缀·router 改剥前缀），列为双审裁量项，默认不采。

## 3. 迁移面（REQUEST 必写·additive）

- 新迁移 `packages/db/migrations/0143_sse_push_notify.sql`（号位顺延 0142）：`SET LOCAL lock_timeout='2s'; statement_timeout='15s'` + `CREATE OR REPLACE FUNCTION sse_event_notify_after_insert()`（plpgsql · SECURITY INVOKER · `SET search_path = pg_catalog, public` · body 仅 `PERFORM pg_notify('interview_event_ch', NEW.stream_key); RETURN NEW;`）+ `REVOKE ALL … FROM PUBLIC, app_role` + `DROP TRIGGER IF EXISTS interview_event_sse_notify ON interview_event` + `CREATE TRIGGER … AFTER INSERT … FOR EACH ROW EXECUTE FUNCTION`——**0133 风格逐项镜像**。
- **事件表 schema 本体零触碰**（任务书 Ban）：0001 建表列/索引/约束零改（blob `d68f8dd0` 前后全等核验）；既有 0059/0126 两 trigger 留树零触碰（`4fbac173`/`867ea729` 全等）；新 trigger 只加不改。
- 迁移注册进 runner whitelist（rag03c C-4 四点登记先例·additive）。多进程/多实例幂等：PG trigger 每 LISTEN 进程各自收播，进程内 router 自然按本进程 waiter 分发——无跨进程分发需求（每 SSE 等待者与其 API 进程同生死）。

## 4. 兼容（REQUEST 必写③）

- **Last-Event-ID 重放语义不变**：`parseLastEventId`（`40b12d01`）regex/400 行为零改；initial catch-up 与 tail fetch 同一条 `WHERE stream_key=$1 AND seq>$2 ORDER BY seq` 零改；`id:/event:/data:` 帧与 `: ping` 注释帧 wire format 逐字节同形（`e2e/helpers/sse.ts:6` 解析器零感知）。
- **保留项逐条**：per-principal `acquireSlot(slotKey,5)`/429 `too_many_streams` 原值；10min deadline 原值；ping 心跳机制保留（空转唤醒即写——静默 cadence 由 2s 变 30s 兜底驱动，**此点为唯一行为披露项，交双审确认**）；三处终态集合原值零合并；404 前置原值；hijack 胶水收进 util 但 Fastify 紧耦合行为同形。
- **worker 零改动**：worker 不 LISTEN SSE channel（SSE 推送只属 API 进程）；wakeup 通道本体五 blob 全等核验（§0 表）。
- **降级面**：LISTEN 失败/断连 → 循环退化为 30s 轮询（D6c），无新增 fail-closed 路径；trigger 缺失（迁移未上）同样退化为纯兜底轮询——部署顺序无耦合（先迁移后发版均可）。

## 5. Prove 计划（REQUEST 必写④·EXEC 一次优先）

- **新 proof** `apps/api/test/sse-push-notify.proof.ts`（`pnpm -C apps/api prove:sse-push-notify` 新 script·`_neg-harness` boot·uc010 `2453840f` 先例同法）五断言组：
  - **P-1 NOTIFY-LATENCY（主判据）**：waiter 挂起 → INSERT 事件 → SSE 帧到达延迟 **<500ms**（旧机制对照读数登记不设门：同 harness 模拟 2s poll 相位最坏 ≥2000ms 常量对照，登记性记录）。
  - **P-2 FALLBACK**：notify 抑制（listener 断连 stub）→ 30s sleep 分支唤醒后事件到达 + `: ping` 写出（fake-timer 加速）；LISTEN 断连→退避重连 100ms→5s 单测读数（listener 生命周期复制体实证）。
  - **P-3 DISCONNECT-RESUME**：客户端中途断开 → slot 释放 + waiter 注销（router Map 归零断言·无泄漏）→ 重连带 Last-Event-ID → 只补 `seq>N`（uc010 同形·重放语义不变实证）。
  - **P-4 MULTI-WAITER**：同 stream_key 两 waiter 单 notify 双醒；异 stream_key 不误醒。
  - **P-5 TRIGGER-E2E**：迁移应用后真实 INSERT → 测试 LISTEN 连接实收 payload=stream_key 只 id（trigger 实证非 mock）。
- **回归绿**：既有 SSE 三 proof 复跑绿（`prove:last-event-id`/`prove:sse-slot`/`prove:uc010-sse-resume`——语义不变实证）+ `pnpm run e2e:isolated` full e2e 三流绿（interview SSE 流 · quiz `full.e2e.ts:246` · diagnosis `:254` 终态段零回归）。
- **机器核验**：wakeup 通道五 blob + 事件表 schema 三迁移 blob + `last-event-id.ts`/`e2e/helpers/sse.ts` blob 前后全等（§0 表全列）；三控制器 429/deadline/ping/终态集合 grep 收据；`git diff` 面审计（apps/worker 零字节）。

## 6. Ban 列表（REQUEST 必写）

**Ban 碰 worker wakeup 通道本体**（`meetwise_worker_wakeup_v1` 常量/0084/0133 两 trigger/`job-wakeup-listener.ts`/worker main.ts :633 wiring——SSE push 全新 channel 不复用不改动，worker 侧零字节 diff）；**Ban 碰事件表 schema 本体**（interview_event 列/索引/约束零改·只加 trigger·0059/0126 两 trigger 零触碰）；**Ban 改 Last-Event-ID 语义**（`parseLastEventId` regex/400/catch-up/tail 查询形状零改）；**Ban secrets**（键值入收据/invented spend/`actualSpendCny` 编造——保持 `null`）；Ban 每 SSE 一条 LISTEN 连接（必须进程共享单连接）；Ban 移除/放宽 rate-limit 429·10min deadline·ping 心跳·终态集合（保留项违反=红）；Ban 改共享 SSOT；Ban force-push；Ban retry-to-green；Ban self-approve（预执行/post-prove 双审均须 mw-e2e-ha + mw-model-op 独立席位）。

## 7. 流程声明（REQUEST 必写⑦）

REQUEST（本文）→ 预执行双审（mw-e2e-ha + mw-model-op · 空审 stub 见 §8）→ meetwise 授权 → EXEC（迁移 0143 + sse-notify.service + sse-pump util + 三控制器去重 + proof 五断言组 + script/runner 登记，一次优先）→ post-prove 双审 → meetwise 授权 nail。执行地：worktree `meetwise-line-ssepush` · 分支 `line/sse-notify-push`。

## 8. 交付物与本 commit

- `ai-docs/delivery/harness/sse-push-notify.md`（本文）
- `ai-docs/delivery/sse-push-notify.slice.md`（切片速览）
- `ai-docs/delivery/reviews/REQUEST-2026-10-07-sse-push-mw-e2e-ha.md`（空审 stub · 待审席填写）
- `ai-docs/delivery/reviews/REQUEST-2026-10-07-sse-push-mw-model-op.md`（空审 stub · 待审席填写）

本 commit = 上述恰 4 文件、零其他 diff；作者/提交者 `mw-core <mw-core@meetwise.local>`。

## 9. Not-a-pass 诚实尾条

Not a pass · not coding（零码零迁移·本 REQUEST docs-only）· not proven · not run（零实跑零 live 零容器）· not 延迟 <500ms 达成（P-1 属 EXEC 面）· not 2s 轮询已消除（现状三处仍在树）· not e2e 三流绿（未跑）· not covered · not HA · not releaseEvidence · not nail · not coordinator authorize · not 预执行双审 done · `g7SuiteGreen=false` · `actualSpendCny=null` · alone ≠ dual

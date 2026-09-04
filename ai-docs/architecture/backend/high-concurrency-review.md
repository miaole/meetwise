---
id: architecture_backend_high_concurrency_review
name: 后端高并发复核骨架
description: 对照当前代码盘点 Worker 公平调度、SKIP LOCKED 领取、SSE 扇出、模型调用槽与账本 CAS / 同键 claim-join；只记录已接线机制和可复现证明缺口，不发明运行时事实。
type: architecture
scope: shared
level: reference
status: active
owner: architecture
version: 2
related:
  - ../current-runtime-truth.md
  - ./worker-dispatch-fairness.md
  - ../../requirements/use-cases/worker-event-driven-dispatch.md
  - ../../requirements/use-cases/model-invocation-reliability.md
  - ../ai/model-operation-routing.md
  - ./commerce-saga.md
  - ../../rules/global/production-invariants.md
  - ../../rules/global/status-machine.md
---

# 后端高并发复核骨架

本文是**复核清单**，不是容量 SLO，也不是发布证明。每条只允许引用仓库里的代码位置、已登记命令或 `current-runtime-truth.md` 已写明的回执。目标态、口头“高并发已完成”、未跑过的隔离库结果，一律不算事实。

阅读顺序：先看 `current-runtime-truth.md` 与下表“不保证”，再看各切片专文。本文件不平行改写那些专文的结论。

## 0. 使用规则

| 状态 | 本文件怎么用 |
| --- | --- |
| 已接线 | 源码路径存在，行为以该路径为准。 |
| 有证明命令 | 命令写在仓库里；是否在本环境跑绿另见 `current-runtime-truth.md`。 |
| 证明缺口 | 合同或代码在，但缺对应层级的负例 / 多副本 / 远程库 / HTTP 断言。 |
| 未交付 | 文档或注释已声明不做，或明确未接线。 |

禁止：把进程内 cap 写成集群锁；把 2 秒轮询写成事件扇出；把 `0130` 写成供应商幂等；把本地 `releaseEvidence=false` 回执写成发布。

本切片**不新增迁移**。最新已跟踪迁移是 `0130_model_invocation_same_key_claim_join.sql`。`0131+` 只在后续真正改库时占用。

## 1. 五面总表

| 面 | 当前接线（代码） | 实际保证 | 不保证 | 专文 |
| --- | --- | --- | --- | --- |
| Worker 公平调度 | `apps/worker/src/interview-dispatch-fairness.ts`；`interview-consumer.ts` 的 tick 走 `fairDrainInterviewOwners`；网关 `0128` `gateway_dispatch_owners('interview')`；押题 / 诊断 / 报告 tick 走 `drainOwnersInListedOrder` | 面试 owner 量子轮转；每 owner **未过期** running cap（默认 1，表计数 + advisory lock）；本进程 `WORKER_INTERVIEW_GLOBAL_INFLIGHT`（默认 4）；非法预算启动失败。押题 / 诊断 / 报告在本进程按 gateway 列表把每个 owner 抽干（`A,A,A,B`），有无库合同 | 押题 / 诊断 / 报告**不是**面试量子轮转；gateway 对这三类仍是无最老等待排序的 `DISTINCT`；无每 owner DB cap / advisory；进程内 global cap 不是跨副本锁；即时 wakeup 不是延迟 SLO | `worker-dispatch-fairness.md`、`UC-WORKER-002` |
| SKIP LOCKED 领取 | `interview-jobs.ts` / `quiz-jobs.ts` / `diagnosis-jobs.ts` / `report.ts` 的 claim SQL；`commerce.ts` `settleOutbox`；`ai_model_reconcile_stale_scoped` | 多领取者对**同一候选行**不互相等待；赢家 CAS 成 running / relayed / unknown | 无行时 `SELECT FOR UPDATE` 锁不住创建竞态（模型 claim 另用 `0130` advisory）；quiz/diagnosis/report **没有**面试那套 owner cap + advisory | 本文件 §3 |
| SSE 扇出 | 面试 / 押题 / 诊断 `GET :id/events`：catch-up → 2s 轮询 tail；`RateLimitService.acquireSlot('sse:'+principal, 5)` | 账本是真相；连接可丢；三路 service 用 `parseLastEventId` 失败关闭非法游标；`pnpm api:validate` 对三路非法 `Last-Event-ID` 断言 HTTP 400（`HC-GAP-006` 已关）；`pnpm sse-slot:prove` 对共享 `sse:${principal}` 打满 5+1 → HTTP 429（`HC-GAP-007` 已关，计数 `asPrincipal` stub）；每进程每主体最多 5 条长连接；10 分钟封顶 | **不是** LISTEN/NOTIFY 或跨进程扇出；槽是进程内 Map，且在首次 catch-up 查询之后才占槽；跨副本槽仍开（`HC-GAP-008`） | `frontend-blueprint.md` §7 |
| 模型调用槽 | `0120` `ai_model_concurrency_lease` + `admitSharedModelOperation`；另有进程内 `rateLimitedModel` / `MODEL_MAX_CONCURRENT` | 带 `spec.operation` 的路径：共享槽认领失败则 `concurrency_exhausted`，零外呼；释放按 (owner, idempotency) 匹配，不误清他人槽 | 无 `operation` 的 legacy `invoke` **不走** 0120 槽；`MODEL_MAX_CONCURRENT` 仍是进程内；ASR/TTS/embedding 等多条路径仍未共享该槽 | `model-operation-routing.md`、`UC-MODEL-001` |
| 账本 CAS / 同键 claim-join | `0130` `ai_model_claim_invocation_scoped`；`casTransition`；`appendEvent`；权益 `UNIQUE(owner,idempotency)` + 桶 `FOR UPDATE`；结算 `ON CONFLICT DO NOTHING` | 同键至多一个 execute；孤儿 create-permit 只 `wait`；权益同 key 不二次分配；结算 at-least-once → 入账 exactly-once | `0130` 不证明供应商取消计费；`appendEvent` 的 `hashtext(stream)` 是 32-bit 命名空间，与面试 owner lock / 0126 writer lock / 0130 claim lock 不同键 | `UC-MODEL-001`、`commerce-saga.md` |

## 2. Worker 公平调度

只复述当前代码，细节以 `worker-dispatch-fairness.md` 为准。

- 生产面试 tick：**隔离 reap**（失败 owner 本拍不再 drain）→ `fairDrainInterviewOwners`。`drainOwnerJobs` 只留测试/维护。
- `idle` = 本次 claim 为 null。隐私归还、丢租约、graph fence 未取得、`markDone` CAS=0 → `retry`，owner 留在本拍。
- 每 owner 每拍最多 32 次 launch，防 `retry` 活锁。
- 押题 `quizDispatchTick`、诊断 `diagnosisDispatchTick`、报告 `dispatchTick` 走 `drainOwnersInListedOrder`：按 gateway 返回的 owner 列表把**一个 owner 抽干到 idle** 再处理下一个（`A,A,A,B`）。reap / sweep 仍夹在该 owner 两侧。这不是 `fairDrainInterviewOwners`。
- 这三类的 gateway（`0128` 的 `quiz` / `diagnosis` / `report` 分支）仍是 `SELECT DISTINCT`，**没有**面试那种按最老可领取行排序。本切片不改 SQL、不加 `0131+`。

**证明**

| 命令 | 层 | 覆盖 | 缺口 |
| --- | --- | --- | --- |
| `pnpm interview-dispatch:unit:prove` | 无库确定性 | 轮转 A,B,A,A；非法预算；切片隔离；远程库配置门 | 不碰 SQL / RLS / 多副本 |
| `pnpm owner-drain-order:unit:prove` | 无库确定性；per-push CI | 押题/诊断/报告当前顺序是 `A,A,A,B`；同队列经 `fairDrain` 才是 `A,B,A,A`；tick 源码绑定；单 owner / 空列表 / 失败不提前轮转；本拍不重叠两个 owner | 不是远程 PG claim 顺序；不是跨副本；不改 gateway `DISTINCT` 排序 |
| `pnpm interview-dispatch:gate:prove` | 无库包装器 | 缺远程配置 / isolated profile / loopback / compose 主机名 / `DATABASE_URL` 失败关闭；源码不调用 compose | 不连远程库，不写通过回执；浅层门不是 cloud attestation |
| `pnpm interview-dispatch:prove` | 远程 Postgres，`E2E_CLOUD_ISOLATED=1` | **脚本合同**含 TC-WORKER-002-main/E1–E6（须远程跑绿后才算证明）；远程成功时写入 `.tmp/interview-dispatch-receipts/` | **不在 per-push CI**。`current-runtime-truth.md` 已登记命令与回执路径；**本环境无通过回执** |
| `pnpm worker-wakeup:prove` | 确定性 listener / DrainLoop | 单飞 tick、停后无新 tick | 不是真实 NOTIFY/回滚/20 路多副本 |

未交付（已写在专文，禁止对外勾完成）：跨副本集群 inflight 锁；押题/诊断/报告**公平轮转**（本切片只证明当前抽干顺序）；繁忙态端到端延迟。

`HC-GAP-002` 本切片关闭方式：诚实记录并单元证明**当前**领取顺序是 `A,A,A,B`。没有把这三类改成面试轮转；原表里“顺序不是 `A,A,A,B`”仍是后续实现轮转时的负例，不是今天的事实。

## 3. SKIP LOCKED 领取路径

仓库里用户可见领取 / 对账扫描现用 `FOR UPDATE SKIP LOCKED` 的路径：

| 路径 | 文件 | 额外围栏 | 本拍证明 |
| --- | --- | --- | --- |
| 面试 job | `packages/db/src/interview-jobs.ts` `claimNextInterviewJob` | owner `pg_advisory_xact_lock`；同面试未过期 running / failed 兄弟；未过期 running `< perOwnerInflight` | 单元与失败关闭门有；远程 PG 证明有脚本与回执路径，**无**本文件可引用的通过回执 |
| 押题 job | `quiz-jobs.ts` `claimNextQuizJob` | 同 quiz 未过期 running 守卫；**无** owner cap / advisory | `pnpm quiz:prove` 本 PR CI `33867570523` / tip `06b46c4`，**130** 迁移 **22/22**，`releaseEvidence=false`。双连接专用合同是 `pnpm quiz-dual-claim:prove` / `quiz-dual-claim:unit:prove`（`HC-GAP-004`，#93）；`quiz:prove` 22/22 不含本合同。本环境未取得 `quiz-dual-claim:prove` 隔离库回执时不得写成已跑绿 |
| 诊断 job | `diagnosis-jobs.ts` | 同诊断 running 守卫；无 owner cap | 双连接与押题同形，同一 `pnpm quiz-dual-claim:prove` 覆盖；不另开 follow-up。`pnpm diagnosis:prove` 历史 64 迁移回执仍不得写成当前通过（不在本切片） |
| 报告 | `report.ts` `claimReport` | attempts 上限；无 owner cap | `pnpm report:prove` 含两并发恰一领：本 PR CI `33867570523` / tip `06b46c4`，**130** 迁移 **31/31**，`releaseEvidence=false` |
| 结算 outbox | `commerce.ts` `settleOutbox` | `FOR UPDATE OF o SKIP LOCKED` + ledger `UNIQUE(consumption_id)` | `pnpm commerce:prove` 同上 CI，**130** 迁移 **50/50**，`releaseEvidence=false` |
| 模型对账 | `model-invocation.ts` → `ai_model_reconcile_stale_scoped` | 只终态化陈旧 `dispatching` | `pnpm model-invocation-reconcile:prove` 标明须在当前迁移重跑 |

`sweepStuck*` / `sweepReports` / `sweepExpiredReservations` 是按 owner 的条件 `UPDATE`，**不是** SKIP LOCKED 领取。它们靠行锁 + lease 过期谓词防心跳 TOCTOU，不能写成“跳过锁的领取”。

简历引用回填 `0053` 的 SKIP LOCKED 是分类批处理，不是用户可见队列。

## 4. SSE：账本重放 + 连接侧槽，不是扇出总线

当前 API 对面试 / 押题 / 诊断都是：

1. 短事务按 `seq > lastId` 读 `interview_event`（RLS / 所属校验之后）。
2. `hijack` 写出 catch-up。
3. **每 2 秒再查一次**；空则写 `: ping`。
4. 终态事件、客户端断开或 10 分钟到点结束。面试 `session_concluded`（`early_weak`/`thrashing` 练习控制流预览）**不是**终态，流须继续等到 `report_*` / `assessment_*` / `interview_unavailable` / `error`（见 `interview-signal-sse.md`）。
5. `acquireSlot('sse:' + principal, 5)` / `finally releaseSlot`。槽实现是进程内 `Map`，注释写明多实例要换共享桶。

因此“扇出”只发生在**每个连接自己轮询账本**。没有跨连接 pub/sub，没有把 wakeup 通知当事件载荷。前端用 `Last-Event-ID` 续传；SSE 不持业务真相。

### 4.1 Last-Event-ID 失败关闭（无迁移）

三路 `*Service.events` 在 **首次 catch-up / hijack 之前** 调用 `parseLastEventId`。非法游标（空串、`Infinity`、小数、`+1`、科学计数、前导零、超安全整数、过长）抛 `400 invalid_last_event_id`，不把 `Number()` 结果喂给 `seq > $2`。缺省 header（`undefined`）才是 `0`（全量重放起点）。Controller 只使用 service 返回的 `lastId`，不再解析 header。

`pnpm api:validate` 对面试 / 押题 / 诊断 HTTP 路径断言同一组非法游标 → 400，且 `Infinity` 不触发 `interview_event` catch-up SQL（不降级为 `seq>0` 全表语义）。`HC-GAP-006` 已关。槽打满 429 已由 `pnpm sse-slot:prove` 在计数 `asPrincipal` stub 上打到 HTTP 429（`HC-GAP-007` 已关）；跨副本槽仍是 `HC-GAP-008`。该套件需隔离或远程库；禁止 `compose.dev` 本地 Postgres/Redis。本文件不把一次本地绿跑写成发布回执（`releaseEvidence=false`）。

| 命令 | 层 | 覆盖 | 仍缺 |
| --- | --- | --- | --- |
| `pnpm last-event-id:unit:prove` | 无库；per-push CI | 解析器：缺省=0；空串拒绝；合法整数；负号/小数/科学计数/前导加号/前导零/`Infinity`/超长 | 不是 HTTP |
| `pnpm api:validate` | 隔离 HTTP（需库） | 面试 / 押题 / 诊断 `/…/:id/events` 同一组坏游标 400；`Infinity` 的 catch-up SQL=0 | 不证明 429 槽打满（另由 `sse-slot:prove`）；不证明跨副本槽（`HC-GAP-008`） |
| `pnpm sse-slot:prove` | 无库 HTTP hijack；per-push CI | 面试 3 + 押题 2 打满共享 `sse:principal`；第 6 条面试 / 押题 / 诊断均 429 `too_many_streams`（非 SSE）；overflow 各付 1 次 catch-up（`events()` → counting `asPrincipal` stub）；随后一个 poll 周期 stub 只 +5（holders）；释放后诊断可再占；异主体不受影响 | **不是** 隔离库 `DbService.asPrincipal` / `api:validate`；**不是** 跨副本（`HC-GAP-008`）；privacy/ownership SQL 被 stub 短路；首次 catch-up 仍在占槽前（本切片不改） |
| `apps/api/test/validate.ts` `[F5]` | 纯 RateLimitService | 上限 2 时第 3 次 acquire 失败、release 后可再占 | 不是跨进程、不是真实 SSE |
| `pnpm web:prove` | 前端纯函数 | 解码、Last-Event-ID 续传、终态停转；**HTTP 400 `invalid_last_event_id` 立即停转 / degraded，open=1，不得用同一游标重试**（`HC-GAP-014` 已关） | 不证明 API 槽、轮询或浏览器实链 |

未交付：跨 API 副本的 SSE 槽；把 2 秒轮询换成 LISTEN；把连接当业务状态。

## 5. 模型调用槽

两层不要写成一层：

1. **0120 共享槽**（`ai_model_concurrency_lease`）：`admitSharedModelOperation` 在 durable claim **之后**、`dispatching` **之前**。仅当 `resolveModelAdmissionPartition(spec)` 因 `spec.operation` 得到分区时进入。满额 → `model_concurrency_exhausted`，claim 标 failed，零外呼。释放要求 owner+idempotency 仍匹配。
2. **进程内** `rateLimitedModel`：`MODEL_MAX_CONCURRENT`（默认 4）+ 可选 RPM。`agent-runtime.md` 仍写“多副本需 Redis/Tair 原子配额”——那是进程内层的边界，**不能用来否定 0120 已存在**，也不能把 0120 说成所有适配器的全局上限。

`invoke.ts` 注释写明：legacy 无 `operation` 的调用不走共享权威。这是显式兼容缝，**不是**“已经全局限流”。本切片不把该缝改成生产 fail-closed。OCR / 语音 / embedding 的 typed binding 与共享槽是否在**生产组合根**接通，以 `current-runtime-truth.md` 与 `model-operation-routing.md` 为准。

**证明**

| 命令 | 层 | 覆盖 | 缺口 |
| --- | --- | --- | --- |
| `pnpm model-slot-bypass:static:prove` | 无库；per-push CI | `resolveModelAdmissionPartition` 无 `operation` 为 undefined；`admitSharedModelOperation` 仅在 `if (admissionPartition)` 内调用一次 | 不读库，不能单独当作 lease 行回执 |
| `pnpm model-slot-bypass:prove` | 隔离 PG（`packages/ai-runtime/test/model-slot-bypass.proof.ts`） | 无 `operation` 的成功/在途 invoke 不改变 `ai_model_concurrency_lease`；有 operation 且 `max_concurrency=2` 时第三条 `model_concurrency_exhausted`、零外呼、claim=`failed` | 需隔离库；**不在 per-push**；不起 compose.dev / 本地常驻 Docker 库。本环境未取得新回执时 `releaseEvidence=false` |
| `pnpm model-op02:prove` | 隔离 PG（`packages/ai-runtime/test/model-op02-shared-provider.proof.ts`） | 单测分区 max=2 时第三 acquire 拒绝；释放/过期可复用 | 需隔离库；不在 per-push；不是多 Worker 真副本抢同一生产 operation |
| `pnpm breaker:prove` | 确定性 | 半开单探针、abort 不晚到外呼 | 不证明 0120 跨副本槽 |
| `pnpm runtime:isolated:prove` | 隔离 PG | 同键双并发 calls=1；`0130` wait / 不二次 execute；**HC-GAP-011** 具名：孤儿 permit claim→`wait`；两连接无行 claim execute=1+wait=1；invoke calls=1 | 内核 37 断言 + 5 条 claim-join 具名断言；隔离门不在 per-push；不证明 0120 槽与 claim-join 的交叉故障 |

## 6. 账本 CAS / 同键 claim-join

| 机制 | 代码 | 保证 | 不保证 |
| --- | --- | --- | --- |
| 模型同键 claim-join | `0130` 短事务 `pg_advisory_xact_lock(hashtext('meetwise:model_invocation_claim:'\|\|owner), hashtext(key))`；无行时清孤儿 permit 只回 `wait` | 跟随者不得因 `missing_after_conflict` 再 execute | 不跨供应商；advisory 与 0126 答题锁、面试 owner 锁命名空间分离（源码注释） |
| 调用 / 费用状态机 | `0088` / `markModelInvocationDispatched` 等 scoped 过程 | `claimed → dispatching` 无 slot 被拒；终态不自动重发 | 历史 reconcile proof 注明迁移数已落后，须重跑 |
| 面试状态 CAS | `casTransition`：`UPDATE interview … WHERE status=$from` | 0 行即落败 | 不是 job / invocation 通用 CAS |
| 事件序 | `appendEvent`：`pg_advisory_xact_lock(hashtext(stream))` + `MAX(seq)+1` + `event_key` 幂等 | 同 stream 串行分配 seq | `hashtext` 32-bit 碰撞未做隔离证明；不是 SSE 推送锁 |
| 权益 | `reserveEntitlement` 先 `ON CONFLICT DO NOTHING` 占坑，再桶 `FOR UPDATE` | 同 key 不二次扣；凑不齐整事务回滚 | 130 迁移 CI 回执 commerce 50/50；不是支付渠道回调 |
| 结算 | `settleOutbox` SKIP LOCKED + `settlement_ledger UNIQUE(consumption_id)` | 重跑不双入账 | 不是支付渠道回调证明 |

`0130` 的合同与 `UC-MODEL-001` 验收一致：同键并发供应商派发数 = 1。`current-runtime-truth.md` 把 `runtime:isolated:prove` 记为已覆盖同键双并发与 `0130` wait 语义。`HC-GAP-011` 的具名负例（legacy 两路：孤儿 permit 的 claim → `wait`；两连接无行 claim execute=1 且 wait=1；`invoke()` calls=1 且同值；清 permit 不得把 calls 变成 2）已单列进 per-push `pnpm runtime:prove`，隔离门另有 `pnpm runtime:isolated:prove` / `pnpm runtime:claim-join:prove`。**不**把该行升级为账单、0120 槽交叉、lease 接管或云多副本证据。

## 7. 证明与测试缺口（可执行清单）

下列项是持续缺口，除非写进「已关闭」。§4.1 的共享解析器已接线。`HC-GAP-001` 关闭的是**门 + 回执路径**，不是远程 SQL 绿或 per-push CI 绿。`HC-GAP-002`（抽干顺序合同）、`HC-GAP-004`（押题/诊断双连接恰一领）、`HC-GAP-006`（押题/诊断 HTTP 400）、`HC-GAP-007`（HTTP 槽打满）、`HC-GAP-011`（0130 claim-join 孤儿 / 两连接无行）、`HC-GAP-012`（四门 130 迁移回执）与 `HC-GAP-014`（前端 400 停转）已关。`HC-GAP-009` 证明已接线，见 §7.1；隔离回执未取得前不得写成发布证据。跨副本项仍开。

### 7.1 已关闭

| ID | 面 | 关闭命令 | 范围诚实 |
| --- | --- | --- | --- |
| `HC-GAP-001` | 公平调度 | `pnpm interview-dispatch:gate:prove`（per-push CI）；可选 `pnpm interview-dispatch:prove` | 缺远程配置失败关闭，不得改起本地 Docker。远程成功时的回执写入路径 `.tmp/interview-dispatch-receipts/` 已登记。不是 per-push CI 远程绿；本环境无通过回执；远程负例（两连接 cap=1 恰一 `running`；跨 owner=0）仍只在脚本里。浅层门不是 cloud attestation。不是集群 inflight。`releaseEvidence=false`。 |
| `HC-GAP-002` | 公平调度 | `pnpm owner-drain-order:unit:prove` | 已在 `main`（#94）。押题 / 诊断 / 报告生产 tick 按 gateway 列表抽干，顺序**就是** `A,A,A,B`，未接 `fairDrainInterviewOwners`。不证明远程 PG 领取顺序、gateway `DISTINCT` 稳定性、每 owner DB cap、跨副本（`HC-GAP-003`）。不是面试轮转，不是容量 SLO。 |
| `HC-GAP-004` | SKIP LOCKED | `pnpm quiz-dual-claim:unit:prove`（per-push）；`pnpm quiz-dual-claim:prove`（远程隔离库） | 已在 `main`（#93）。同 owner 同一押题 / 诊断 job 两连接并发 claim 恰一 `running`，败者 null 且事件/额度/父行增量=0。无库门拒绝本地 Docker / loopback。隔离库命令要求 `E2E_CLOUD_ISOLATED=1`；本文件不登记未跑隔离库回执。不证明 owner 级 cap、公平轮转或发布。诊断与押题同一证明，不另开 follow-up。`releaseEvidence=false`。 |
| `HC-GAP-006` | SSE | `pnpm api:validate` | 押题 / 诊断与面试同一组坏游标（`-1` / `1.5` / `Infinity` / `+1` / 超安全整数 / 过长）HTTP `status=400`、`error=invalid_last_event_id`、不是 `text/event-stream`；`Infinity` 的 `interview_event` catch-up SQL 次数=0（先用合法游标证明计数器会动）。不证明 429 槽打满（另由 `sse-slot:prove`）或跨副本槽（`HC-GAP-008`）。不是容量 SLO。回执保持 `releaseEvidence=false`。 |
| `HC-GAP-007` | SSE | `pnpm sse-slot:prove` | 已在 `main`（#98）。同一 `sse:${principal}` 计数 stub 上 5 条持有 + 第 6 条面试 / 押题 / 诊断均 429 `too_many_streams`（非 SSE）；overflow 各 1 次 catch-up；随后一个 poll 周期 stub 只 +5（holders）。不是隔离库 `DbService.asPrincipal`；privacy/ownership SQL 被 stub 短路；不证明跨副本（`HC-GAP-008`）；首次 catch-up 仍在占槽前。不是容量 SLO。 |
| `HC-GAP-009` | 模型槽 | `pnpm model-slot-bypass:static:prove`（per-push CI）；可选 `pnpm model-slot-bypass:prove` | 已在 `main`（#91）。静态门：无 `operation` / resolve 失败不得派生分区；`admitSharedModelOperation` 只能在 `if (admissionPartition)` 内调用；`invoke.ts` 不得直连 `acquireModelAdmission` / 0120 过程 / lease 表。隔离命令已接线：无 `operation` 的 invoke 不写 `ai_model_concurrency_lease`；有 operation 且 max=2 时第三条拒绝、零外呼。本环境无 Docker，**未取得隔离回执**，`releaseEvidence=false`。不把 legacy 缝改成生产 fail-closed；隔离证明不在 per-push；无隔离回执不得写成发布通过；不关闭 `HC-GAP-010`。 |
| `HC-GAP-011` | claim-join | `pnpm runtime:prove` | 已在 `main`（#92）。单库、legacy 无 cost/operation、两路并发。孤儿 leftover create-permit（无 invocation 行）claim 只 `wait`、不 execute、清 permit；`invoke()` 撞上该 permit 仍 calls=1。两连接同时无行 → claim execute=1 且 wait=1；两路 `invoke()` calls=1 且同值。清 permit 后 calls 不得变成 2。具名：`HC-GAP-011-orphan-permit`、`HC-GAP-011-concurrent-no-row`、`HC-GAP-011-orphan-concurrent`。per-push：`pnpm runtime:prove`（CI Postgres）。隔离门：`pnpm runtime:isolated:prove` / `pnpm runtime:claim-join:prove`（需隔离/远程 env，不在 per-push）。不证明供应商取消计费、0120 槽交叉、billed/`operation` digest、lease 过期接管、云多副本。无新迁移。 |
| `HC-GAP-012` | 账本 | `pnpm commerce:prove` / `report:prove` / `quiz:prove` / `reaper:prove` | 本 PR CI `33867570523` / tip `06b46c4`，`applied=130 skipped=0`：commerce **50/50**、report **31/31**、quiz **22/22**、reaper **28/28**。`releaseEvidence=false`。回执钉在该 tip，不是当前 `main` `e4e0d58`（#89/#91/#92/#93/#94/#95/#96/#97/#98 未改这四门 prove 源码或迁移；#94 只把抽干接到 `drainOwnersInListedOrder`；#98 只加 `sse-slot:prove`；#96 只加 `interview-dispatch:gate:prove` 与回执路径；#97 只登记四门回执并挂 per-push `quiz:prove`/`reaper:prove`）。`quiz:prove` 22/22 不是双连接合同（那是已关的 `HC-GAP-004` / `quiz-dual-claim:*`）。不是支付渠道、云故障或发布证据。诊断 `diagnosis:prove` 仍停在历史 64 迁移回执，不在本 gap。 |
| `HC-GAP-014` | SSE | `pnpm web:prove` | 已在 `main`（#90）。三路流驱动把 HTTP 400 `invalid_last_event_id` 当失败关闭，open=1，不得用同一游标重试。不是浏览器实链，不是 API HTTP 门。 |

### 7.2 仍开

| ID | 面 | 缺口 | 正确层级 | 负例断言（尚未具备或未在 CI） |
| --- | --- | --- | --- | --- |
| `HC-GAP-003` | 公平调度 | 无跨 Worker 副本集群 inflight | 多进程 + 共享库 | 两进程 `globalInflight=4` 时集群 running 可大于 4（今日即如此，需诚实度量而非“修掉”） |
| `HC-GAP-005` | SKIP LOCKED | `UC-WORKER-001` 的 rollback 通知=0、20 路 wakeup、重连 drain | 真实 PG NOTIFY | 回滚后 drain 次数不增加；监听恢复立即 drain |
| `HC-GAP-008` | SSE | 槽与 2s 轮询均为单进程 | 多 API 副本 | N 副本时可开到 `5N` 条连接（今日即如此） |
| `HC-GAP-010` | 模型槽 | 文本 `MODEL_MAX_CONCURRENT` 与 0120 `max_concurrency` 双层，无组合根交叉证明 | 隔离 PG | 共享槽已满时进程内队列不得把调用标成 `dispatching` |
| `HC-GAP-013` | 唤醒 | 真实 commit-to-claim ≤250ms | 远程数据面 | 未测不得写达标 |

`HC-GAP-004` **已关**：押题/诊断双连接恰一领的专用合同见 §3 / §8。`TC-WORKER-001-E2-quiz` 与 `TC-WORKER-001-E2-diagnosis` 挂在同一命令。未跑隔离库回执不得写成发布。

`TC-WORKER-001-*`、`TC-WORKER-002-*`（远程）、`TC-MODEL-001-E2` 半开改路等，用例文档已写、治理叶多为 planned/unmapped。不得用本复核文件把它们标成已绑定。

## 8. 当前树落地 / 明确不做

**已落地（文档 + 解析器 + `HC-GAP-001` 门 + 抽干合同 + 共享槽 HTTP + 三路 HTTP 400 + 前端 400 停转 + HC-GAP-004 合同 + HC-GAP-009 证明接线 + HC-GAP-011 具名用例 + HC-GAP-012 四门回执）**

- 本复核骨架挂到索引与运行时事实矩阵的 related。
- 三路 SSE service 共用 `parseLastEventId`；controller 只用返回的 `lastId`。无库证明 `pnpm last-event-id:unit:prove` 进入 per-push CI。`HC-GAP-006`（押题/诊断 HTTP 400）由 `pnpm api:validate` 关闭。`HC-GAP-007`（槽打满）由 `pnpm sse-slot:prove` 关闭。
- `HC-GAP-001`：`pnpm interview-dispatch:prove` 经包装器失败关闭；`pnpm interview-dispatch:gate:prove` 进入 per-push CI。远程成功时的回执写入路径 `.tmp/interview-dispatch-receipts/`。本环境无远程通过回执。远程 SQL **不**进 per-push CI。
- `HC-GAP-002`：押题 / 诊断 / 报告生产 tick 接到 `drainOwnersInListedOrder`；无库证明 `pnpm owner-drain-order:unit:prove` 进入 per-push CI。领取顺序合同是 `A,A,A,B`，不是面试轮转。
- `HC-GAP-007` 已关闭：`pnpm sse-slot:prove` 用真实 Fastify hijack 打满共享 `sse:principal`（面试 3 + 押题 2），第 6 条面试 / 押题 / 诊断均 429。overflow 在占槽前各付 1 次 catch-up（counting `asPrincipal` stub，不是隔离库 `DbService.asPrincipal`）；被拒连接不进入 2s 轮询，holders 一个周期 stub 恰 +5。跨副本槽仍是 `HC-GAP-008`。
- **`HC-GAP-014` 已关闭（仅前端，#90）**：面试 / 押题 / 诊断流驱动把 HTTP 400 `invalid_last_event_id` 当失败关闭，不是断线。`pnpm web:prove` 断言 open 恰好 1 次、`connection=closed`、`degraded`、不得用同一 `Last-Event-ID` 重试；Next SSE 代理保持 400 而不改写成普通 `stream_unavailable`。不是浏览器实链。押题/诊断 HTTP 400 现由 `api:validate` 覆盖。`releaseEvidence=false`。
- **`HC-GAP-009` 证明已接线**：`pnpm model-slot-bypass:static:prove` 在 per-push CI；隔离命令 `pnpm model-slot-bypass:prove` 已接线。本机/本 PR 无隔离回执（`releaseEvidence=false`）。不 fail-close 旧 `invoke` 缝。
- `HC-GAP-004`：押题与诊断同形 SKIP LOCKED 双连接恰一领。无库门 `pnpm quiz-dual-claim:unit:prove` 进 per-push。隔离库命令 `pnpm quiz-dual-claim:prove` 只接受 `E2E_CLOUD_ISOLATED=1`，禁止本地 Docker / loopback；缺远程配置失败关闭，不得改起本地库。诊断与押题同一证明，不另开工单。本文件不登记未跑隔离库回执。
- `HC-GAP-011`：`packages/ai-runtime/test/claim-join-orphan.proof.ts` 具名负例已挂进既有 `runtime:prove` 门。无新迁移；`0130` SQL 未改。
- **`HC-GAP-012` 已关闭（仅四门 130 迁移回执）**：本 PR `verify` run `33867570523` / tip `06b46c4`，`applied=130 skipped=0`：commerce **50/50**、report **31/31**、quiz **22/22**、reaper **28/28**。`releaseEvidence=false`。#89/#91/#92/#93/#94/#95/#96/#98 未改这四门 prove 源码或迁移（#94 只把抽干接到 `drainOwnersInListedOrder`；#98 只加 `sse-slot:prove`；#96 只加 `interview-dispatch:gate:prove` 与回执路径），故不是「仅 commerce/report」半关闭。`quiz:prove` 不是双连接合同（`HC-GAP-004`），也不是抽干顺序合同（`HC-GAP-002`），也不是槽打满合同（`HC-GAP-007`），也不是 `HC-GAP-001` 远程 SQL。不是支付渠道、云故障或发布证据。诊断 `diagnosis:prove` 仍停在历史 64 迁移回执，不在本 gap。回执钉在 `06b46c4`，不是当前 `main` `e4e0d58`。

**明确不做**

- 不把押题 / 诊断 / 报告改成 `fairDrainInterviewOwners`，不加每 owner DB cap / advisory，不改 `gateway_dispatch_owners` 的 `DISTINCT` 分支。
- 不改领取 SQL、公平调度、0120 槽语义、`0130`、权益账本。
- 不加 `0131+` 迁移。
- 不把无 `operation` 的 legacy invoke 改成生产 fail-closed（除非后续单独立项）。
- 不关闭 `HC-GAP-003` / `005` / `008` / `010` / `013`；不重开已关闭的 `HC-GAP-001` / `002` / `004` / `006` / `007` / `009` / `011` / `012` / `014`。不把 `HC-GAP-009` 的隔离命令写成发布回执。不把 `owner-drain-order:unit:prove` 写成远程 PG 领取顺序或发布回执。不把 `sse-slot:prove` 写成隔离库 `asPrincipal` 或跨副本槽。不把 `interview-dispatch:gate:prove` 写成远程 SQL 绿。
- 不把 LISTEN 接到 SSE，不把 `acquireSlot` 挪到首次 catch-up 之前（那是行为变更，不是本切片）。
- 不实现集群 inflight 或跨副本 SSE 槽。
- 不重跑、不伪造隔离库或远程库通过回执；本环境无远程 PG env 时不起本地 Docker / compose.dev / 本地常驻库，不把失败 spawn 回执写成通过。无远程/隔离库 env 时保持 `releaseEvidence=false`。不把本切片写成这三类已公平，或跨副本 / 远程 PG 领取顺序已验收。
- 不把 `interview-dispatch:prove` 写进 per-push CI。

## 9. 验证命令

```bash
pnpm last-event-id:unit:prove
pnpm sse-slot:prove
pnpm interview-dispatch:unit:prove
pnpm owner-drain-order:unit:prove
pnpm interview-dispatch:gate:prove
pnpm model-slot-bypass:static:prove
pnpm quiz-dual-claim:unit:prove
pnpm docs:check
pnpm api:validate   # 三路非法 Last-Event-ID → 400；需隔离或远程库，禁止 compose.dev 本地 Postgres/Redis
pnpm runtime:prove
pnpm runtime:isolated:prove
pnpm runtime:claim-join:prove
```

`pnpm commerce:prove` / `pnpm report:prove` / `pnpm quiz:prove` / `pnpm reaper:prove` 的当前 130 迁移回执见 `current-runtime-truth.md`（本 PR CI run `33867570523`）。`pnpm model-slot-bypass:prove` / `pnpm quiz-dual-claim:prove` / `pnpm api:validate` / `pnpm interview-dispatch:prove` / `pnpm runtime:isolated:prove` / `pnpm runtime:claim-join:prove` 需要隔离或远程库（经 env，禁止 `pnpm db:up` / 共享本地 Docker Postgres）。缺远程配置时 `interview-dispatch:prove` 与 `quiz-dual-claim:prove` 必须失败关闭。本环境未取得新回执时保持 `releaseEvidence=false`。

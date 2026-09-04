---
id: architecture_backend_high_concurrency_review
name: 后端高并发复核骨架
description: 对照当前代码盘点 Worker 公平调度、SKIP LOCKED 领取、SSE 扇出、模型调用槽与账本 CAS / 同键 claim-join；只记录已接线机制和可复现证明缺口，不发明运行时事实。
type: architecture
scope: shared
level: reference
status: active
owner: architecture
version: 1
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
| Worker 公平调度 | `apps/worker/src/interview-dispatch-fairness.ts`；`interview-consumer.ts` 的 tick 走 `fairDrainInterviewOwners`；网关 `0128` `gateway_dispatch_owners('interview')` | 面试 owner 量子轮转；每 owner **未过期** running cap（默认 1，表计数 + advisory lock）；本进程 `WORKER_INTERVIEW_GLOBAL_INFLIGHT`（默认 4）；非法预算启动失败 | 押题 / 诊断 / 报告仍按 owner 抽干；进程内 global cap 不是跨副本锁；即时 wakeup 不是延迟 SLO | `worker-dispatch-fairness.md`、`UC-WORKER-002` |
| SKIP LOCKED 领取 | `interview-jobs.ts` / `quiz-jobs.ts` / `diagnosis-jobs.ts` / `report.ts` 的 claim SQL；`commerce.ts` `settleOutbox`；`ai_model_reconcile_stale_scoped` | 多领取者对**同一候选行**不互相等待；赢家 CAS 成 running / relayed / unknown | 无行时 `SELECT FOR UPDATE` 锁不住创建竞态（模型 claim 另用 `0130` advisory）；quiz/diagnosis/report **没有**面试那套 owner cap + advisory | 本文件 §3 |
| SSE 扇出 | 面试 / 押题 / 诊断 `GET :id/events`：catch-up → 2s 轮询 tail；`RateLimitService.acquireSlot('sse:'+principal, 5)` | 账本是真相；连接可丢；三路 service 用 `parseLastEventId` 失败关闭非法游标；`pnpm api:validate` 对三路非法 `Last-Event-ID` 断言 HTTP 400（`HC-GAP-006` 已关）；每进程每主体最多 5 条长连接；10 分钟封顶 | **不是** LISTEN/NOTIFY 或跨进程扇出；槽是进程内 Map，且在首次 catch-up 查询之后才占槽；429 打满与跨副本槽仍开 | `frontend-blueprint.md` §7 |
| 模型调用槽 | `0120` `ai_model_concurrency_lease` + `admitSharedModelOperation`；另有进程内 `rateLimitedModel` / `MODEL_MAX_CONCURRENT` | 带 `spec.operation` 的路径：共享槽认领失败则 `concurrency_exhausted`，零外呼；释放按 (owner, idempotency) 匹配，不误清他人槽 | 无 `operation` 的 legacy `invoke` **不走** 0120 槽；`MODEL_MAX_CONCURRENT` 仍是进程内；ASR/TTS/embedding 等多条路径仍未共享该槽 | `model-operation-routing.md`、`UC-MODEL-001` |
| 账本 CAS / 同键 claim-join | `0130` `ai_model_claim_invocation_scoped`；`casTransition`；`appendEvent`；权益 `UNIQUE(owner,idempotency)` + 桶 `FOR UPDATE`；结算 `ON CONFLICT DO NOTHING` | 同键至多一个 execute；孤儿 create-permit 只 `wait`；权益同 key 不二次分配；结算 at-least-once → 入账 exactly-once | `0130` 不证明供应商取消计费；`appendEvent` 的 `hashtext(stream)` 是 32-bit 命名空间，与面试 owner lock / 0126 writer lock / 0130 claim lock 不同键；commerce 回执停在历史 64 迁移 | `UC-MODEL-001`、`commerce-saga.md` |

## 2. Worker 公平调度

只复述当前代码，细节以 `worker-dispatch-fairness.md` 为准。

- 生产面试 tick：**隔离 reap**（失败 owner 本拍不再 drain）→ `fairDrainInterviewOwners`。`drainOwnerJobs` 只留测试/维护。
- `idle` = 本次 claim 为 null。隐私归还、丢租约、graph fence 未取得、`markDone` CAS=0 → `retry`，owner 留在本拍。
- 每 owner 每拍最多 32 次 launch，防 `retry` 活锁。
- 押题 `quizDispatchTick`、诊断 `diagnosisDispatchTick` 仍是 `for owner: reap; drainOwner*Jobs`（抽干）。报告消费者同形，无公平轮转。

**证明**

| 命令 | 层 | 覆盖 | 缺口 |
| --- | --- | --- | --- |
| `pnpm interview-dispatch:unit:prove` | 无库确定性 | 轮转 A,B,A,A；非法预算；切片隔离；远程库配置门 | 不碰 SQL / RLS / 多副本 |
| `pnpm interview-dispatch:prove` | 远程 Postgres，`E2E_CLOUD_ISOLATED=1` | 合同写了 TC-WORKER-002-main/E1–E6 | **不在 per-push CI**；缺远程配置必须失败关闭，不得改起本地 Docker。`current-runtime-truth.md` 未登记本命令的通过回执 |
| `pnpm worker-wakeup:prove` | 确定性 listener / DrainLoop | 单飞 tick、停后无新 tick | 不是真实 NOTIFY/回滚/20 路多副本 |

未交付（已写在专文，禁止对外勾完成）：跨副本集群 inflight 锁；押题/诊断/报告公平轮转；繁忙态端到端延迟。

## 3. SKIP LOCKED 领取路径

仓库里用户可见领取 / 对账扫描现用 `FOR UPDATE SKIP LOCKED` 的路径：

| 路径 | 文件 | 额外围栏 | 本拍证明 |
| --- | --- | --- | --- |
| 面试 job | `packages/db/src/interview-jobs.ts` `claimNextInterviewJob` | owner `pg_advisory_xact_lock`；同面试未过期 running / failed 兄弟；未过期 running `< perOwnerInflight` | 单元有；远程 PG 证明有脚本、无本文件可引用的通过回执 |
| 押题 job | `quiz-jobs.ts` `claimNextQuizJob` | 同 quiz 未过期 running 守卫；**无** owner cap / advisory | 双连接专用合同 `pnpm quiz-dual-claim:prove`（`E2E_CLOUD_ISOLATED=1`，禁止本地 Docker）；无库门 `pnpm quiz-dual-claim:unit:prove`（per-push）。`quiz:prove` 历史回执不含本合同。本环境未取得隔离库通过回执时不得写成已跑绿 |
| 诊断 job | `diagnosis-jobs.ts` | 同诊断 running 守卫；无 owner cap | 与押题同形，同一 `pnpm quiz-dual-claim:prove` 覆盖；不另开 follow-up |
| 报告 | `report.ts` `claimReport` | attempts 上限；无 owner cap | `pnpm report:prove` 含两并发恰一领（历史 64 迁移回执） |
| 结算 outbox | `commerce.ts` `settleOutbox` | `FOR UPDATE OF o SKIP LOCKED` + ledger `UNIQUE(consumption_id)` | `pnpm commerce:prove` 历史 50/50（64 迁移） |
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

`pnpm api:validate` 对面试 / 押题 / 诊断 HTTP 路径断言同一组非法游标 → 400，且 `Infinity` 不触发 `interview_event` catch-up SQL（不降级为 `seq>0` 全表语义）。`HC-GAP-006` 已关。槽打满 429 仍是 `HC-GAP-007`。该套件需隔离或远程库；禁止 `compose.dev` 本地 Postgres/Redis。本文件不把一次本地绿跑写成发布回执（`releaseEvidence=false`）。

| 命令 | 层 | 覆盖 | 仍缺 |
| --- | --- | --- | --- |
| `pnpm last-event-id:unit:prove` | 无库；per-push CI | 解析器：缺省=0；空串拒绝；合法整数；负号/小数/科学计数/前导加号/前导零/`Infinity`/超长 | 不是 HTTP |
| `pnpm api:validate` | 隔离 HTTP（需库） | 面试 / 押题 / 诊断 `/…/:id/events` 同一组坏游标 400；`Infinity` 的 catch-up SQL=0 | 三路并发槽 429 未用真实 hijack 打满 |
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
| `pnpm runtime:isolated:prove` | 隔离 PG | 同键双并发 calls=1；`0130` wait / 不二次 execute；**HC-GAP-011** 具名：孤儿 permit → `wait`、两连接无行 execute=1 + `wait`/`cached` | 内核 37 断言 + 5 条 claim-join 具名断言；不证明 0120 槽与 claim-join 的交叉故障 |

## 6. 账本 CAS / 同键 claim-join

| 机制 | 代码 | 保证 | 不保证 |
| --- | --- | --- | --- |
| 模型同键 claim-join | `0130` 短事务 `pg_advisory_xact_lock(hashtext('meetwise:model_invocation_claim:'\|\|owner), hashtext(key))`；无行时清孤儿 permit 只回 `wait` | 跟随者不得因 `missing_after_conflict` 再 execute | 不跨供应商；advisory 与 0126 答题锁、面试 owner 锁命名空间分离（源码注释） |
| 调用 / 费用状态机 | `0088` / `markModelInvocationDispatched` 等 scoped 过程 | `claimed → dispatching` 无 slot 被拒；终态不自动重发 | 历史 reconcile proof 注明迁移数已落后，须重跑 |
| 面试状态 CAS | `casTransition`：`UPDATE interview … WHERE status=$from` | 0 行即落败 | 不是 job / invocation 通用 CAS |
| 事件序 | `appendEvent`：`pg_advisory_xact_lock(hashtext(stream))` + `MAX(seq)+1` + `event_key` 幂等 | 同 stream 串行分配 seq | `hashtext` 32-bit 碰撞未做隔离证明；不是 SSE 推送锁 |
| 权益 | `reserveEntitlement` 先 `ON CONFLICT DO NOTHING` 占坑，再桶 `FOR UPDATE` | 同 key 不二次扣；凑不齐整事务回滚 | 历史 commerce 回执 64 迁移 |
| 结算 | `settleOutbox` SKIP LOCKED + `settlement_ledger UNIQUE(consumption_id)` | 重跑不双入账 | 不是支付渠道回调证明 |

`0130` 的合同与 `UC-MODEL-001` 验收一致：同键并发供应商派发数 = 1。`current-runtime-truth.md` 把 `runtime:isolated:prove` 记为已覆盖同键双并发与 `0130` wait 语义。`HC-GAP-011` 的具名负例（孤儿 permit → `wait`；两连接无行 → execute=1 且 `wait`/`cached`；清 permit 不得把 calls 变成 2）已单列进 `pnpm runtime:prove` / `pnpm runtime:isolated:prove` / `pnpm runtime:claim-join:prove`。**不**把该行升级为账单或云多副本证据。

## 7. 证明与测试缺口（可执行清单）

下列项是持续缺口。§4.1 的共享解析器已接线。`HC-GAP-004`（押题/诊断双连接恰一领）、`HC-GAP-006`（押题/诊断 HTTP 400）、`HC-GAP-011`（0130 claim-join 孤儿 / 两连接无行）与 `HC-GAP-014`（前端 400 停转）已关；`HC-GAP-009` 证明已接线，见 §7.1；隔离回执未取得前不得写成发布证据。HTTP 槽打满 / 多副本项仍开。

**已关闭**

| ID | 面 | 关闭命令 | 范围诚实 |
| --- | --- | --- | --- |
| `HC-GAP-004` | SKIP LOCKED | `pnpm quiz-dual-claim:unit:prove`（per-push）；`pnpm quiz-dual-claim:prove`（远程隔离库） | 同 owner 同一押题 / 诊断 job 两连接并发 claim 恰一 `running`，败者 null 且事件/额度/父行增量=0。无库门拒绝本地 Docker / loopback。隔离库命令要求 `E2E_CLOUD_ISOLATED=1`；本文件不登记未跑隔离库回执。不证明 owner 级 cap、公平轮转或发布。诊断与押题同一证明，不另开 follow-up。`releaseEvidence=false`。 |
| `HC-GAP-006` | SSE | `pnpm api:validate` | 押题 / 诊断与面试同一组坏游标（`-1` / `1.5` / `Infinity` / `+1` / 超安全整数 / 过长）HTTP `status=400`、`error=invalid_last_event_id`、不是 `text/event-stream`；`Infinity` 的 `interview_event` catch-up SQL 次数=0（先用合法游标证明计数器会动）。不证明 429 槽打满或跨副本槽（`HC-GAP-007` / `008`）。不是容量 SLO。回执保持 `releaseEvidence=false`。 |
| `HC-GAP-011` | claim-join | `pnpm runtime:prove` | 孤儿 leftover create-permit（无 invocation 行）只 `wait`、不 execute、清 permit；两连接同时无行 → execute=1 且 follower `wait`/`cached`；清 permit 后 calls 不得变成 2。具名断言：`HC-GAP-011-orphan-permit`、`HC-GAP-011-concurrent-no-row`、`HC-GAP-011-orphan-concurrent`。也挂 `pnpm runtime:isolated:prove` / `pnpm runtime:claim-join:prove`。不证明供应商取消计费、0120 槽交叉、云多副本。无新迁移。 |
| `HC-GAP-014` | SSE | `pnpm web:prove` | 已在 `main`（#90）。三路流驱动把 HTTP 400 `invalid_last_event_id` 当失败关闭，open=1，不得用同一游标重试。不是浏览器实链，不是 API HTTP 门。 |

| ID | 面 | 缺口 | 正确层级 | 负例断言（尚未具备或未在 CI） |
| --- | --- | --- | --- | --- |
| `HC-GAP-001` | 公平调度 | `interview-dispatch:prove` 无登记回执、不在 per-push | 远程 PG | 两连接 cap=1 恰一 `running`；跨 owner=0 |
| `HC-GAP-002` | 公平调度 | 押题/诊断/报告仍抽干，无轮转证明 | 远程 PG + 单元 | 两 owner 领取顺序不是 `A,A,A,B` |
| `HC-GAP-003` | 公平调度 | 无跨 Worker 副本集群 inflight | 多进程 + 共享库 | 两进程 `globalInflight=4` 时集群 running 可大于 4（今日即如此，需诚实度量而非“修掉”） |
| `HC-GAP-005` | SKIP LOCKED | `UC-WORKER-001` 的 rollback 通知=0、20 路 wakeup、重连 drain | 真实 PG NOTIFY | 回滚后 drain 次数不增加；监听恢复立即 drain |
| `HC-GAP-007` | SSE | 三路共享 `sse:principal` 槽；无 hijack 打满 5+1 | HTTP 集成 | 第 6 条 429，`asPrincipal` 轮询不增加 |
| `HC-GAP-008` | SSE | 槽与 2s 轮询均为单进程 | 多 API 副本 | N 副本时可开到 `5N` 条连接（今日即如此） |
| `HC-GAP-010` | 模型槽 | 文本 `MODEL_MAX_CONCURRENT` 与 0120 `max_concurrency` 双层，无组合根交叉证明 | 隔离 PG | 共享槽已满时进程内队列不得把调用标成 `dispatching` |
| `HC-GAP-012` | 账本 | commerce / quiz / report / reaper 回执停在 64 迁移 | 当前迁移隔离 PG | 在 **130** 个迁移上重跑后才能引用新回执 |
| `HC-GAP-013` | 唤醒 | 真实 commit-to-claim ≤250ms | 远程数据面 | 未测不得写达标 |

`HC-GAP-004` **已关**：押题/诊断双连接恰一领的专用合同见 §3 / §8。`TC-WORKER-001-E2-quiz` 与 `TC-WORKER-001-E2-diagnosis` 挂在同一命令。未跑隔离库回执不得写成发布。

`TC-WORKER-001-*`、`TC-WORKER-002-*`（远程）、`TC-MODEL-001-E2` 半开改路等，用例文档已写、治理叶多为 planned/unmapped。不得用本复核文件把它们标成已绑定。

### 7.1 `HC-GAP-009`（证明已接线，隔离回执未跑）

| ID | 关闭物 | 不关闭 |
| --- | --- | --- |
| `HC-GAP-009` | 静态门 `pnpm model-slot-bypass:static:prove` 进入 per-push：无 `operation` / resolve 失败不得派生分区；`admitSharedModelOperation` 只能在 `if (admissionPartition)` 内调用；`invoke.ts` 不得直连 `acquireModelAdmission` / 0120 过程 / lease 表。隔离命令 `pnpm model-slot-bypass:prove` 已接线：无 `operation` 的 invoke 不写 `ai_model_concurrency_lease`；有 operation 且 max=2 时第三条拒绝、零外呼。本环境无 Docker，**未取得隔离回执**，`releaseEvidence=false`。 | 不把 legacy 缝改成生产 fail-closed；隔离证明不在 per-push；无隔离回执不得写成发布通过；不关闭 `HC-GAP-010`（进程内 `MODEL_MAX_CONCURRENT` 与 0120 交叉） |

## 8. 当前树落地 / 明确不做

**已落地（文档 + 解析器 + 前端 400 停转 + 押题/诊断 HTTP 400 + HC-GAP-004 合同 + HC-GAP-009 证明接线 + HC-GAP-011 具名用例）**

- 本复核骨架挂到索引与运行时事实矩阵的 related。
- 三路 SSE service 共用 `parseLastEventId`；controller 只用返回的 `lastId`。无库证明 `pnpm last-event-id:unit:prove` 进入 per-push CI。`HC-GAP-006`（押题/诊断 HTTP 400）由 `pnpm api:validate` 关闭。`HC-GAP-007`（槽打满）仍开。
- **`HC-GAP-014` 已关闭（仅前端，#90）**：面试 / 押题 / 诊断流驱动把 HTTP 400 `invalid_last_event_id` 当失败关闭，不是断线。`pnpm web:prove` 断言 open 恰好 1 次、`connection=closed`、`degraded`、不得用同一 `Last-Event-ID` 重试；Next SSE 代理保持 400 而不改写成普通 `stream_unavailable`。不是浏览器实链。押题/诊断 HTTP 400 现由 `api:validate` 覆盖。`releaseEvidence=false`。
- **`HC-GAP-009` 证明已接线**：`pnpm model-slot-bypass:static:prove` 在 per-push CI；隔离命令 `pnpm model-slot-bypass:prove` 已接线。本机/本 PR 无隔离回执（`releaseEvidence=false`）。不 fail-close 旧 `invoke` 缝。
- `HC-GAP-004`：押题与诊断同形 SKIP LOCKED 双连接恰一领。无库门 `pnpm quiz-dual-claim:unit:prove` 进 per-push。隔离库命令 `pnpm quiz-dual-claim:prove` 只接受 `E2E_CLOUD_ISOLATED=1`，禁止本地 Docker / loopback；缺远程配置失败关闭，不得改起本地库。诊断与押题同一证明，不另开工单。本文件不登记未跑隔离库回执。
- `HC-GAP-011`：`packages/ai-runtime/test/claim-join-orphan.proof.ts` 具名负例已挂进既有 `runtime:prove` 门。无新迁移；`0130` SQL 未改。

**明确不做**

- 不改领取 SQL、公平调度、0120 槽语义、`0130`、权益账本。
- 不加 `0131+` 迁移。
- 不把无 `operation` 的 legacy invoke 改成生产 fail-closed（除非后续单独立项）。
- 不关闭 `HC-GAP-001`…`003` / `005` / `007` / `008` / `010` / `012` / `013`；不重开已关闭的 `HC-GAP-004` / `HC-GAP-006` / `HC-GAP-014`。不把 `HC-GAP-009` 的隔离命令写成发布回执。

- 不把 LISTEN 接到 SSE，不把 `acquireSlot` 挪到首次 catch-up 之前（那是行为变更，不是本切片）。
- 不实现集群 inflight 或跨副本 SSE 槽。
- 不重跑、不伪造隔离库回执；不起 compose.dev / 本地常驻 Docker 库。无远程/隔离库 env 时保持 `releaseEvidence=false`。

## 9. 验证命令

```bash
pnpm last-event-id:unit:prove
pnpm interview-dispatch:unit:prove
pnpm model-slot-bypass:static:prove
pnpm quiz-dual-claim:unit:prove
pnpm docs:check
pnpm api:validate   # 三路非法 Last-Event-ID → 400；需隔离或远程库，禁止 compose.dev 本地 Postgres/Redis
pnpm runtime:prove
pnpm runtime:isolated:prove
pnpm runtime:claim-join:prove
```

`pnpm model-slot-bypass:prove` / `pnpm quiz-dual-claim:prove` / `pnpm api:validate` / `pnpm interview-dispatch:prove` / `pnpm runtime:isolated:prove` / `pnpm runtime:claim-join:prove` 需要隔离或远程库（经 env，禁止 `pnpm db:up` / 共享本地 Docker Postgres）。本环境未取得新回执时保持 `releaseEvidence=false`。

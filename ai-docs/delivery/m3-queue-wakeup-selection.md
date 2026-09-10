# M3 — 队列 / Wakeup / Claim / Reconcile 选型（Q1–Q5）

**状态**：selection draft · **releaseEvidence=false** · Not HA · 不宣称 controlPlaneClosed  
**栈裁定**：**MySQL + Qdrant + Redis** 为架构 **当前唯一真相**；本文件写 **目标队列设计选型**，不是旧栈对照 memoir。  
**本切片范围（协调方已确认）**：**仅选型文档覆盖 Q1–Q5**；**不切生产 wakeup**；**不宣称 MODEL-OP reconciler 已接 / 已切**。  
**实现方不自批切流**：合入/切流前须独立审查 + 相关 prove 退出码；本里程碑 **禁止自批 cutover**。

关联：`ai-docs/delivery/adr-mysql-qdrant-local.md`（MODEL-OP / 队列硬缺口 Q1–Q5；M3 门禁）。

---

## 0. 本切片硬钉（静态 prove 会匹配）

| 钉 | 裁定 |
|----|------|
| M3 本切片交付 | **仅选型文档覆盖 Q1–Q5** + 静态 `mysql-stack:m3-queue:prove` |
| 生产 wakeup | **不切生产 wakeup**（`job-wakeup-listener` / `meetwise_worker_wakeup_v1` 代码本切片不动）直至独立 prove + 专家审批准切流 |
| 目标 wakeup | **Redis Streams（优选）** / PubSub / 轮询 — 对齐 sole stack |
| MODEL-OP reconciler | **不宣称 reconciler 已接 / 已切**；skeleton/ping/本选型 prove 绿 **≠** 队列已迁 **≠** reconciler 已切（Q4） |
| 证据 | `releaseEvidence=false`；非 HA；不勾 `controlPlaneClosed=true` |
| 栈 | **MySQL+Qdrant+Redis sole stack**；**cutover blocked until proves** |

中文钉死：

- **仅选型文档覆盖 Q1–Q5**
- **不切生产 wakeup**
- **不宣称 reconciler 已接**
- **不宣称 reconciler 已切**
- mysql-stack 连通绿 **≠** 队列已迁 **≠** MODEL-OP reconciler 已切
- **MySQL+Qdrant+Redis sole stack**

---

## 1. 现有代码入口（本切片不改；活门非 memoir）

| 面 | 代码位置 / 行为（保留至切流批准） |
|----|----------------|
| **Wakeup（Q1）** | 通道常量 `packages/db/src/worker-job-wakeup.ts`：`WORKER_JOB_WAKEUP_CHANNEL = 'meetwise_worker_wakeup_v1'`，payload `'wake'`。Listener：`apps/worker/src/job-wakeup-listener.ts`（专用 session `LISTEN`；通道为 **LISTEN/NOTIFY** 形态）。Publisher：迁移 `0084_worker_job_wakeup_notifications.sql` 内 `PERFORM pg_notify('meetwise_worker_wakeup_v1', 'wake')`。语义：lossy、commit-delivered **hint only**；队列表 + claim 租约才是 durable 工作源。**本切片不切生产 wakeup。** |
| **Claim（Q2）** | 多路径 `FOR UPDATE SKIP LOCKED`（如 `packages/db/src/quiz-jobs.ts` `claimNextQuizJob`、`interview-jobs.ts`、`diagnosis-jobs.ts`、`report.ts`、`commerce.ts`、model-invocation reconcile claim）。 |
| **Advisory / 串行（Q3）** | `pg_advisory_lock` / `pg_advisory_xact_lock` / `pg_advisory_unlock`（如 migrate、interview-graph-lease、interview-jobs owner 串行、resume-privacy、cloud-test-serial）。 |
| **MODEL-OP reconciler（Q4）** | ① `apps/worker/src/model-invocation-reconcile.ts` + `pnpm model-invocation-reconcile:prove`；② `reconcileUsageCalibration`（`packages/ai-runtime/.../usage-calibration-reconciler.ts`）+ `pnpm model-op00-usage-reconciler:prove`。**二者同列**切流证据门；代码路径本切片不动；**不宣称已接/已切**。 |
| **证据 prove（Q5）** | 现有：`pnpm worker-wakeup:prove`（`apps/worker` `prove:job-wakeup`）、`pnpm model-invocation-reconcile:prove`。迁栈后须换夹具或标红；**本切片不换夹具、不宣称已绿即已迁**。 |

**结论**：本切片 = 选型 only。生产 wakeup / claim / advisory / reconciler **代码不切**；目标设计按 Redis + MySQL 8 对齐 sole stack。

---

## 2. Q1 — Wakeup 选型（Redis Streams / PubSub / 轮询）

| 选项 | 要点 | 本切片裁定 |
|------|------|------------|
| **Redis Streams**（推荐主路径） | 可持久、consumer group、与「hint + reconcile 兜底」兼容；可带极简 wake token（仍禁止塞 owner/PII） | **选型优选**：sole-stack wakeup 主候选 |
| **Redis PubSub** | lossy hint；需强依赖周期 reconcile | 可作轻量旁路探针；**不可单独当 durable 队列** |
| **仅轮询** | 无 wakeup；增大延迟与关系库负载 | **兜底**（listener 断连窗口）；不作唯一生产唤醒 |

**硬约束（未切前）**：

- **不切生产 wakeup**：worker 仍走 `job-wakeup-listener` + `meetwise_worker_wakeup_v1`（代码活门）。
- 未来实现须 **additive**（feature-flag / 旁路 publisher）；flag 关时零行为变化。
- Wake 载荷保持 **无 owner / job / user 数据**。
- 任何 Redis wakeup 落地后仍须 **periodic reconcile** 覆盖漏通知窗口。

---

## 3. Q2 — Claim（`FOR UPDATE SKIP LOCKED`）选型

| 选项 | 要点 | 本切片裁定 |
|------|------|------------|
| **MySQL 8 `FOR UPDATE SKIP LOCKED`** | 与现网 SQL 形态接近；适合关系表 job 队列迁 MySQL 后 | **关系表 job claim 主候选** |
| **Redis Streams consumer group** | `XREADGROUP` + 待处理 PEL；适合「事件/唤醒」与部分 outbox | **与 Streams wakeup 对齐时用于 wake/outbox 侧**；**不**用 Streams 悄悄替换需 tenant 强制的业务 job 行语义 |
| **无锁抢跑 / 应用层 set** | 易双消费 | **禁止**作为等价 claim |

须在切流前具备 **claim prove**（多消费者不双领、租约过期可重领）。本切片 **只选型，不落地 claim 改写**。

---

## 4. Q3 — Advisory / 租约选型

| 现有代码 | 迁栈候选 | 本切片裁定 |
|------|----------|------------|
| `pg_advisory_*` 会话/事务锁 | Redis `SET key NX PX` + token fence（续约/比对释放） | **跨进程短租约 / 串行：Redis 租约主候选** |
| 同行 `FOR UPDATE` | MySQL 行锁 + version/fence 列 | **行级状态机锁：表行锁主候选** |
| 迁移串行 `pg_advisory_lock('meetwise_migrations')` | MySQL GET_LOCK / 迁移工具锁 | 迁移工具链另案；不在本切片伪关 |

须 **锁 prove**（互斥、过期、fencing）。本切片不改 `pg_advisory_*` 调用点。

---

## 5. Q4 — MODEL-OP reconciler / 费用·校准主链

**硬句（mw-model-op conditional）**：**本绿 ≠ 已迁 / ≠ cutover**。`mysql-stack:m3-queue:prove`（及 skeleton/ping）EXIT=0 **只**证明选型/连通文档钉扎，**禁止**写成队列或 MODEL-OP 已迁。

**禁止**用下列任一绿信号宣称队列或 MODEL-OP reconciler **已接 / 已切**：

- `mysql-stack:skeleton:prove` / `ping:prove` / `m2-tenant:prove` EXIT=0
- **本** `mysql-stack:m3-queue:prove` EXIT=0（仅证明选型文档钉扎）
- 容器连通、compose config 通过

### Q4 切流前证据门（须**同列**；缺一不可）

| 证据门 | 代码 / 脚本 | 要求 |
|--------|-------------|------|
| **model-invocation reconcile** | `apps/worker/src/model-invocation-reconcile.ts`；`pnpm model-invocation-reconcile:prove` | 切流前须绿（迁栈后换夹具或标红）；**不宣称已接/已切** 直至此门通过 |
| **usageCalibrationReconciler** | `packages/ai-runtime` `reconcileUsageCalibration`（`usage-calibration-reconciler.ts`）；`pnpm model-op00-usage-reconciler:prove` | **与上同列** Q4 证据门；切流前须绿（迁栈后换夹具或标红）；**不宣称校准 reconciler 已接生产主链** |

现网两条 reconciler 路径在独立 prove 与迁栈夹具就绪前 **代码不切**；**不宣称 reconciler 已接 / 已切**。  
选型方向（未实现）：MySQL 侧保留「gateway 列 owner → 等价强制内 SKIP LOCKED 终态化」形状；或 Streams 仅作唤醒、**终态化仍落关系库账本**；校准因子 reconciler 同须在 sole stack 上可证明。

---

## 6. Q5 — Wakeup + reconcile 证据门

**M3 切流前必须**（ADR；本切片只写清门，不伪关）：

| 证据 | 说明 |
|------|------|
| 选型文档 | **本文**（Q1–Q5） |
| wakeup prove | 现网 `pnpm worker-wakeup:prove`；迁栈后换 Redis/MySQL 夹具或 **标红** 退役旧假绿 |
| reconcile prove（Q4 同列） | `pnpm model-invocation-reconcile:prove` **与** `pnpm model-op00-usage-reconciler:prove`（`usageCalibrationReconciler`）**同列**；迁栈后换夹具或标红 |
| 连通/选型绿 | **本绿 ≠ 已迁 / ≠ cutover**；**≠** 队列已迁 **≠** reconciler 已切 |

未换夹具前：旧 prove 绿只证明 **现有代码路径**，不得写成 MySQL/Redis 队列已就绪。

---

## 7. 切流门（本里程碑 · 非双跑主路径）

- **MySQL+Qdrant+Redis sole stack**；目标 wakeup/claim/锁按上表。
- `compose.dev.yml` 若仍在树内：仅 **legacy 待删**，不是 dual-run 产品计划。
- **不切生产 wakeup**；Redis Streams/PubSub 实现若出现，必须 flag 默认关。
- **releaseEvidence=false**；不宣称生产 HA；不勾 `controlPlaneClosed=true`。
- **禁止自批** cutover；须 `mw-model-op` 等独立审查。
- **cutover blocked until proves**。

---

## 8. 本切片交付与非目标

**交付**

- 本文档 `ai-docs/delivery/m3-queue-wakeup-selection.md`（**仅选型文档覆盖 Q1–Q5**）
- 静态 prove：`scripts/mysql-stack.m3-queue.skeleton.proof.mjs` + `pnpm mysql-stack:m3-queue:prove`

**非目标 / 未做**

- **不切生产 wakeup**（不改 `job-wakeup-listener` / `0084` NOTIFY / 生产默认通道）
- **不宣称 reconciler 已接 / 已切**；不改 `model-invocation-reconcile` 生产接线
- 不改写 `FOR UPDATE SKIP LOCKED` / `pg_advisory_*` 生产路径
- 不 push；不触 `.env*`
- 不自批 cutover；不宣称 controlPlaneClosed / HA / releaseEvidence=true
- 不把 skeleton/ping/本 prove 绿写成队列或 MODEL-OP 已迁
- 不以「旧栈仍为产品真相 / dual-run 主路径」叙事

**成功标准**：选型文档落地且覆盖 Q1–Q5 + 静态 prove **EXIT=0**；生产 wakeup / reconciler 接线未切。

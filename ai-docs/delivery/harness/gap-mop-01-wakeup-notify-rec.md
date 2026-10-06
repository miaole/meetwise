# Harness — **GAP-MOP-01 `:74` · wakeup work face + BUG-NOTIFY-REC `:95`**（docs-only REQUEST · **`draft:awaiting_pre_exec_dual`** · Ban coding · Ban Redis cutover · Ban MODEL-OP closed · PG LISTEN retained）

**Status**: **`draft:awaiting_pre_exec_dual`**（empty review stubs · Ban self-approve · alone ≠ dual · 零 coding · 零 prove 执行 · 零 live · 零 SSOT）
**Date**: 2026-10-07（Asia/Shanghai）
**Base**: `origin/feat/mysql-schema-skeleton` · **`1c4588f9`** / `1c4588f952b77e6173acfadf7f3351c311b0cff0`（docs-delivery NAIL G7 Path B honesty）
**Wave**: Line **MOP01**（queue **Phase 5 MOP** · `REMAINING-NORTH-STAR-QUEUE.md`：「**GAP-MOP-01/BUG-NOTIFY-REC** · GAP-MOP-02 claim」——GAP-MOP-02 claim 本刀**不认领**，独立行另刀）
**Experts**: `mw-model-op` + `mw-e2e-ha`（PRE dual · Ban self-approve · alone ≠ dual）
**Knife**: **GAP-MOP-01 `:74` wakeup 工作面 + BUG-NOTIFY-REC `:95` 处方分解**——按 backlog 原文把 wakeup 生产诚实清单与 M3 切流包工作面**立卷**（docs 定义），**不切流**、**不重复立法 MOP03 六门**（只读 cite）
**Gap ids**: **`GAP-MOP-01`**（backlog `gap-bug-backlog.md:74` · P0 · **OPEN**）· **`BUG-NOTIFY-REC`**（backlog `:95`@本基线 `1c4588f9` · P0 · **OPEN**；派单原文写 `:93` = MOP03-era base `71713718` 行号——MOP03 nail `e29d8f93` 在 §A 尾 append +2 行登记块后 B 区整体下移 2 行 → 本基线 `:95` · 同一行条目，OB-1 如实登记）

## 0. backlog 原文（只读引用 · 零改写）

**`:74` GAP-MOP-01**：

> | GAP-MOP-01 | P0 | Wakeup 生产仍 **LISTEN/NOTIFY** `meetwise_worker_wakeup_v1` — **Q1**；Redis Streams 仅 flag 关旁路原型 **INFLIGHT:redis-wakeup-wip** | 选型已钉 Streams 优选；切流须 wakeup prove + 周期 reconcile；**本绿 ≠ 已迁** | model-op | M3 切流包（非本选型切片）：flag 默认关→审后开；保留 reconcile | `harness/redis-streams-wakeup.prototype.md`；`pnpm worker-wakeup:prove`（旧）标红或换夹具 |

**`:95` BUG-NOTIFY-REC**（本基线行号 · MOP03-era `:93`）：

> | BUG-NOTIFY-REC | P0 | 生产 wakeup 仍依赖 **lossy NOTIFY**；reconcile 未在 sole stack 证明 → 漏唤醒窗口 | Redis Streams hint + **强制** periodic reconcile；旧 `worker-wakeup:prove` 迁栈后标红 | model-op | 与 GAP-MOP-01/03 同列切流 | `harness/redis-streams-wakeup.prototype.md`；双 reconciler prove |

## 1. 解读（implementer 解读 · 双审裁决点）

**解读（一句话）**：GAP-MOP-01 `:74` 的独立工作面 = **wakeup 侧切流工作面**——生产诚实清单（lossy NOTIFY 现状 + 漏唤醒窗口）+ **M3 切流包内容定义**（flag 默认关→审后开 · 保留 reconcile · wakeup prove · 旧 prove 标红/换夹具处置）；本刀 docs-only 把该工作面**立卷**，切流执行属未来授权 REQUEST（须同时过 MOP03 六门与本刀切流包内容）。

**裁决点（留给 PRE dual）**：

1. **D1 · 与 MOP03 立卷的重叠裁决（本刀生死点）**：MOP03 nail `e29d8f93` 立的是「未来 cutover REQUEST 的**准入合同**六门」（§3 逐门对照）；其中 wakeup prove / 强制周期 reconcile / flag 默认关 / PG LISTEN retained 四要素**已作为准入条件立法**。本刀按「**互补不重复**」理解：MOP03 答「未来切流 REQUEST 须过什么门」；MOP01 答「wakeup 工作面**是什么、诚实现状是什么、切流包须交付什么**」——本刀**不再立法**这四要素，原样引用六门且不松动（Ban 重复立卷）。若双审判定此读法仍构成实质重叠，则本刀须显式改写收窄为「仅诚实登记」（逃生门写死于此，Ban 静默换范围）。
2. **D2 · 切流包内容口径**：`:74` 拟切片原文「M3 切流包（非本选型切片）：flag 默认关→审后开；保留 reconcile」——本刀按「切流包 = 未来授权 REQUEST 的 wakeup 侧交付清单（内容定义，非执行）」理解；flag 开启动作本身 Ban（本刀零 flag 操作）。
3. **D3 · Redis 语义**：Ban Redis cutover 指**本刀不切流**；`m3-queue-wakeup-selection.md`（选型已钉 Streams 优选）· `harness/redis-streams-wakeup.prototype.md`（flag 关旁路原型）· `INFLIGHT:redis-wakeup-wip`（`:74` 原文）全部**只读 cite**；Redis wake deferred ≠ STOPPED（W5 口径）· 本刀不启 flag、不写 Redis prove 授权。

## 2. 本刀范围（docs · 授权后可执行面）

| Face | 本 REQUEST（拟） | 仍须保留 |
|------|------------------|----------|
| **诚实清单钉** | §2a wakeup 生产现状诚实登记（lossy hint · 无周期兜底轮询 · 漏唤醒窗口） | BUG-NOTIFY-REC `:95` OPEN · Ban 写成已修复 |
| **切流包立卷** | §2b M3 切流包 wakeup 侧内容定义（docs · 非执行） | `:74` OPEN · flag 开启动作属未来授权 REQUEST |
| **旧 prove 处置** | §2c `worker-wakeup:prove`（旧）标红或换夹具的处置计划（docs 声明） | 本刀不改 `package.json`、不跑不标红 |
| **口径钉** | `actualSpendCny=null` · 两本账分离沿 I 线 · `releaseEvidence=false` | 费率非承诺 |

### 2a. wakeup 生产现状诚实清单（Q1 · 代码锚实测 @base `1c4588f9`）

| 事实 | 代码锚 | 诚实含义 |
|------|--------|----------|
| 生产 wakeup = PG **LISTEN/NOTIFY** `meetwise_worker_wakeup_v1` · payload `'wake'` | `packages/db/src/worker-job-wakeup.ts:15-17`；mig `0084_worker_job_wakeup_notifications.sql:14`、`0133_job_route_pending_worker_wakeup.sql:20`（`PERFORM pg_notify(...)`） | lossy、commit-delivered **hint only**（`:74`「Q1」原文；代码头注同口径） |
| 「Production still uses LISTEN/NOTIFY until an independent cutover is approved」+ flag 默认关 | `packages/db/src/worker-job-wakeup.ts:7-8` | 代码门原样 · 本刀零摘除 |
| Redis Streams 旁路 = additive · **value-gated** `MEETWISE_WAKEUP_REDIS_STREAMS`（仅 `'1'/'true'/'on'` 开 · `'0'`/空/unset 关 · 本刀 unset） | `apps/worker/src/worker-job-wakeup-redis.ts:50-53`（`isRedisStreamsWakeupEnabled` trim+lowercase）；`apps/worker/src/main.ts:641-642`（"never replaces the PG LISTEN session above"） | flag 默认关三代码锚之一沿 MOP03 C-E2E-2 口径重述 · "presence-only" 不作开关判据 |
| Redis URL 缺失 → skip 且 PG LISTEN unchanged | `apps/worker/src/main.ts:646-648` | 旁路失败不伤生产路径 |
| **无周期兜底轮询**：worker main 唯一 `setInterval` 为无关 5s flush timer，wakeup 断链即存在漏唤醒窗口 | `apps/worker/src/main.ts:452`（唯一 setInterval · 与 wakeup 无关） | BUG-NOTIFY-REC `:95`「漏唤醒窗口」的代码级诚实登记——LISTEN 断连/NOTIFY 丢失窗口内仅靠下游下次 wake 兜底，**强制 periodic reconcile 未在 sole stack 证明** |

### 2b. M3 切流包 wakeup 侧内容定义（docs 立卷 · 未来授权 REQUEST 的交付清单 · 非本刀执行）

未来授权 wakeup 切流 REQUEST 至少须交付（与 MOP03 六门**同时**满足 · 见 §3）：

1. **flag 开启程序**：`MEETWISE_WAKEUP_REDIS_STREAMS` 审后开（value-gated 语义不变）——开启动作 = Redis cutover 本体，本刀 Ban。
2. **保留 reconcile**：`:74` 原文「保留 reconcile」+ `:95` 处方「**强制** periodic reconcile」——切流包须含周期 reconcile 在 sole stack 的证明路径（reconciler 实现/接线属 GAP-MOP-03 域 Q4/Q5 同列门 · 本刀只钉 wakeup 侧须「保留」，不认领 reconciler 实现）。
3. **wakeup prove**：Redis 夹具 wakeup prove **不命名不授权**（属未来 cutover REQUEST 自带）。
4. **旧 prove 处置**（§2c）。
5. **本绿 ≠ 已迁**（`:74` 原文）随包输出。

### 2c. 旧 `worker-wakeup:prove` 处置（docs 声明 · 本刀不执行）

`:74`/`:95` 原文两处「旧 `worker-wakeup:prove` 标红或换夹具（迁栈后）」。本刀按 docs 声明处置计划：切流（未来授权 REQUEST）落地时该 prove 须**换 Redis/目标栈夹具或显式标红退役**，不得冒充已迁证据（BUG-FAKE-CONN 口径：文档/连通绿 ≠ 已迁）；本刀不改 `package.json`、不跑、不标红。

## 3. 与 MOP03 立卷的边界 / 重叠分析（Ban 重复立卷）

**MOP03 nail `e29d8f93` 立的六门**（`execution-master-checklist.md` MOP03 NAIL 节 · 未来 cutover 的**准入合同** · `:76` OPEN · 「GAP-MOP-01 `:74` / GAP-MOP-02 `:75` 独立行本刀不认领」原文明示）：

| # | MOP03 六门 | 与本刀关系 |
|---|-----------|-----------|
| 1 | Q4/Q5 prove CMD 实存（双 reconciler 同列门） | **MOP03 域**：reconciler 实现面 · 本刀不认领不触碰 |
| 2 | wakeup prove | **重叠要素**：本刀不再立法——六门原样引用（wakeup prove 属未来切流 REQUEST 自带 · 本刀只登记「未命名未授权」） |
| 3 | 强制周期 reconcile | **重叠要素**：同上 · 本刀仅钉「切流包须保留 reconcile」（`:74` 原文语）· reconciler 实现归门 1 |
| 4 | flag 默认关三代码锚 | **重叠要素**：本刀按 C-E2E-2 口径**重述**（§2a 表）· 不新增不改动 |
| 5 | PG LISTEN retained 直至授权 | **重叠要素**：本刀原样继承写死（§6 Pins）· 不松动 |
| 6 | 独立审≥dual/四专家不降级 + 两本账分离 | **重叠要素**：本刀评审规格照此执行（mw-model-op + mw-e2e-ha dual · BUG-REV-COND `:96` 四专家审对切流持续绑定）· 不降级 |

**边界一句话**：MOP03 立的是「**准入合同**（未来切流 REQUEST 须过什么门）」；MOP01 立的是「**wakeup 工作面**（`:74` 原文：诚实清单 + 切流包内容 + 旧 prove 处置）」——两刀合成：未来 wakeup 切流 REQUEST 须**同时**满足 MOP03 六门（准入）与 MOP01 切流包内容（工作面交付），缺一不可。

**重叠的诚实声明**：要素 2–5 与 MOP03 六门实质同域；本刀的处理是**引用而非重复立法**（Ban 重复立卷）。若双审（D1）判此仍构成重复立卷，本刀收窄为「仅诚实登记」（§2a）并显式改写。

## 4. 相关历史（只读 cite · 零改写）

| 来源 | 口径 |
|------|------|
| M3 选型 | `m3-queue-wakeup-selection.md`：Q1 Streams 优选 / PubSub lossy / 轮询兜底；「任何 Redis wakeup 落地后仍须 periodic reconcile 覆盖漏通知窗口」；不切生产 wakeup |
| Redis 原型 | `harness/redis-streams-wakeup.prototype.md`：additive · flag 默认关 · **PG LISTEN 无条件保留** · `worker-wakeup-redis:prove` local only ≠ cutover |
| `m3-redis-wakeup-prototype.md` | 原型交付说明 · 非生产切流 |
| W5 | `w5-model-op-dual-reconciler-wakeup.slice.md`：prod PG LISTEN/NOTIFY provisional keep · Redis wake deferred / **not STOPPED** · dual `25833fc` · ≠ fake green |
| MOP03 立卷链 | nail `e29d8f93`（`post_prove_dual_pass` · REQUEST `cdde235e` · pre `16f2c684`+`d65023e1` · exec `47f17b83` · post `e10df445`+`abb04dbd`）· 六门准入合同 · `:76` OPEN · GAP-MOP-01 独立行不认领 |
| BUG-REV-COND `:96` | 切流前 ADR 隐私 prove 清单全绿 + 四专家审 · 禁止自批（D2 沿 MOP03 · 持续绑定切流） |
| BUG-FAKE-CONN | 文档/连通绿被误写成已迁 → 拒绝叙事越权（§2c 处置口径来源） |
| GAP-PRIV-AUTHZ-PROVE-FLAKE `:68` | attempts 全记录 · Ban retry-to-green（EXIT 契约先例） |
| I 线 | `model-op-spend-ledger-offline(-i2)` · nail `e09a39f` · 两本账分离 · `actualSpendCny=null` · 费率非承诺 |

## 5. prove 计划（named · **本 REQUEST 零执行**）+ EXIT 契约

| Command | State | 说明 |
|---------|-------|------|
| `pnpm worker-wakeup:prove`（旧 · `package.json:379`） | 已存在 · 本 REQUEST **不跑** | 旧 PG 层 prove · named 仅为 §2c 处置 clarity（标红/换夹具对象）· **≠ 已迁证据** |
| `pnpm worker-wakeup-redis:prove`（`package.json:474`） | 已存在 · 本 REQUEST **不跑** | 原型层 · EXIT0 仅证明 Streams 发/收一条 wake + PG listener 代码仍在 + flag 默认关 · **≠ cutover 证据**（C-E2E-3 口径沿 MOP03） |
| 未来 cutover wakeup prove（Redis 夹具） | **不命名 · 不授权** | 属未来授权切流 REQUEST 自带 · Ban Redis cutover 本刀 |
| Q4/Q5（`model-invocation-reconcile:prove` / `model-op00-usage-reconciler:prove`） | **MOP03 域 · 本刀零认领** | 六门 1 · 见 §3 |

本 REQUEST 不新增脚本、不改 `package.json`、不跑任何 prove。命名以上命令仅为双审 clarity（I2 先例：**named proves ≠ coding/prove 授权**）。

**EXIT 契约（预声明 · 适用于未来授权后的 prove · 本 REQUEST 零执行）**：

- **attempts 全记录**：每次 prove 尝试逐条入 receipt（attempt 序号 · Asia/Shanghai 时间窗 · code SHA · EXIT 值）；失败与成功同列入账。
- **诚实失败路径**：EXIT≠0 → 原样记录 → 判 fail → **Ban retry-to-green**（`:68` 先例：单次后绿不关因）；如需重跑须新 REQUEST + 双审。
- **EXIT0 ≠** 已迁 ≠ cutover ≠ MODEL-OP closed ≠ SLO ≠ HA ≠ suite green ≠ covered（`:74`「本绿 ≠ 已迁」原文 · Line C：wiring 级绿 ≠ suite）。

## 6. Pins（原值全抄 · retained 写死）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **public DELETE=503** · **PG LISTEN retained** · `actualSpendCny=null` · 两本账分离沿 I 线 · **GAP-MOP-01 `:74` OPEN** · **BUG-NOTIFY-REC `:95` OPEN**

## 7. Ban 列表

- **Ban coding**（本刀 docs-only）· **Ban prove execution** · **Ban live**（无 Key/网络/付费/控制台 spend）
- **Ban Redis cutover**（wakeup / queue / claim 切流 · flag 开启 · Redis prove 授权）——MOP03 六门不因本刀松动
- **Ban MODEL-OP closed claim** / SLO forge / fake green / `:74`/`:95` flip CLOSED
- **Ban 删除/绕过 PG LISTEN** without separately authorized cutover REQUEST
- **Ban 重复立卷**：不重复立法 MOP03 六门（要素 2–5 只读引用）；不借本刀宣称 MOP03 合同升级/放宽
- Ban GAP-MOP-02 `:75` claim/lease 认领（Phase 5 同列独立行 · 另刀）
- Ban self-approve（alone ≠ dual）· Ban 四专家审降级（BUG-REV-COND · 对未来切流持续绑定）
- Ban SSOT edit（backlog / matrix / checklist / queue 本刀零改）· Ban 碰 sibling 文件（MOP03 立卷链 / AN 系列）
- Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · **Ban push**

## 8. Non-claims

docs-only REQUEST 立卷 · not wakeup cutover · not Redis cutover · not flag 开启 · not MODEL-OP closed · not SLO · not HA · not suite green · not `releaseEvidence=true` · not BUG-NOTIFY-REC 修复宣称 · PG LISTEN retained · `:74`/`:95` OPEN · alone ≠ dual · PASS ≠ coding ≠ prove ≠ AUTHORIZE

## Review stubs

| Expert | Stub |
|--------|------|
| `mw-model-op` | `reviews/REQUEST-2026-10-07-gap-mop-01-wakeup-notify-rec-mw-model-op.md` |
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-07-gap-mop-01-wakeup-notify-rec-mw-e2e-ha.md` |

**PRE dual BOTH PASS + 协调方 AUTHORIZE 前：本刀 docs 面不得执行，且执行仍 Ban coding / Ban prove / Ban live。**

*Harness · GAP-MOP-01 :74 wakeup work face + BUG-NOTIFY-REC :95 · 2026-10-07 · `draft:awaiting_pre_exec_dual` · 零 coding · 零 prove 执行 · Ban Redis cutover · Ban MODEL-OP closed · Ban 重复立卷（MOP03 六门只读引用不松动）· PG LISTEN retained · `:74`/`:95` OPEN · alone ≠ dual · STOP（awaiting PRE dual）*

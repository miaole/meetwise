# Harness — **GAP-MOP-02 `:75` · claim/lease 工作面（PG 侧等价机制盘点 + 「选型后」切片定义）**（docs-only REQUEST · 立卷 executed · **`executed:awaiting_post_prove_dual`** · Ban coding · Ban prove 执行 · Ban Redis cutover · Ban MySQL claim 顶替 · Ban MODEL-OP closed · PG LISTEN retained）

**Status**: **`executed:awaiting_post_prove_dual`**（PRE dual BOTH PASS（mw-model-op `bab29111` + mw-e2e-ha `1b85b58a` · 均 ∈ exec base 祖先）+ 协调方 AUTHORIZE 后 exec landed · REQUEST 自身即完整立卷产物 · exec = lifecycle 元行推进 + 双审 Conditions/OB docs-side 落实（§0/§2a/§2b/§4/§7/§9）· **Ban self-write `post_prove_dual_pass`**（POST 双审 + 协调方 nail 专属）· alone ≠ dual · 本刀零执行：零 coding · 零 prove 执行 · 零 live · 零 SSOT · **Ban Redis 顶替实现**（SET NX PX+fence 属未来六门 REQUEST 自带）· **Ban MySQL 8 同语义 claim 顶替**（PG-retained · GAP-SCH-01）· **GAP-MOP-02 `:75` OPEN**）

> **Draft-era status（historical · retained）**: **`draft:awaiting_pre_exec_dual`**（empty review stubs · Ban self-approve · alone ≠ dual · 本刀零执行：零 coding · 零 prove 执行 · 零 live · 零 SSOT · **Ban Redis 顶替实现**（SET NX PX+fence 属未来六门 REQUEST 自带）· **Ban MySQL 8 同语义 claim 顶替**（PG-retained · GAP-SCH-01）· **GAP-MOP-02 `:75` OPEN**）
**Date**: 2026-10-07（Asia/Shanghai）
**Base**: `origin/feat/mysql-schema-skeleton` · **`2fd78ea1`** / `2fd78ea10cd1a2d47babb79604afc3f62977eebc`（fetch 后 origin tip · GAP-RAG-02 fixture 刀 nail）
**Wave**: Line **MOP02**（queue **Phase 5 MOP** 第二行 · `REMAINING-NORTH-STAR-QUEUE.md`：「GAP-MOP-01/BUG-NOTIFY-REC · **GAP-MOP-02 claim**」——MOP01 已立卷（wakeup 工作面 · 本刀只读引用），本刀认领 **GAP-MOP-02 claim** 独立行）
**Experts**: `mw-model-op` + `mw-e2e-ha`（PRE dual BOTH PASS：mw-model-op `bab29111` + mw-e2e-ha `1b85b58a` · POST dual awaiting · Ban self-approve · alone ≠ dual · Ban nail）
**Knife**: **GAP-MOP-02 `:75` claim/lease**——按 backlog 原文把 claim/lease 工作面**立卷**（docs 定义）：PG 侧等价机制现状盘点（Q2 多路径 `FOR UPDATE SKIP LOCKED` + Q3 advisory `pg_advisory_*` + job 表租约语义）+「选型后」claim/lease 实现切片的内容定义（待建 prove 清单），**不切流**、**不实现任何 Redis/MySQL 顶替**、**不重复立法 MOP03 六门**（只读 cite）
**Gap id**: **`GAP-MOP-02`**（backlog `gap-bug-backlog.md:75`@本基线 `2fd78ea1` · P0 · **OPEN**）

## 0. backlog 原文（只读引用 · 零改写）

**`:75` GAP-MOP-02**（本基线 `2fd78ea1` 行号）：

> | GAP-MOP-02 | P0 | Claim 仍多路径 PG `FOR UPDATE SKIP LOCKED` — **Q2**；advisory `pg_advisory_*` — **Q3** | MySQL 8 同语义 claim **或** Streams 仅 wake/outbox；跨进程租约 Redis `SET NX PX`+fence；须 claim/锁 prove | model-op / schema | M3 claim/lease 实现切片（选型后） | claim multi-consumer prove；锁互斥/过期/fence prove（待建） |

列语义（表头 `:55` · exec 更正 **OB-1/OB-H1**：REQUEST 误引 `:66` 实为 GAP-UC052-POOL-ROLE-LEAK 行；该行实辖表头 = `| ID | P0/P1 | 现状 | 目标 | 归属域 | 拟切片 | 所需 harness 路径 |`（`@2fd78ea1` 与 exec tip `1b85b58a` 双点实测同位）——缺口列实名「现状」其命名强化 D1 读法）：缺口 = 「Claim 仍多路径 PG `FOR UPDATE SKIP LOCKED` — Q2；advisory `pg_advisory_*` — Q3」· 处置/验收 = 「MySQL 8 同语义 claim 或 Streams 仅 wake/outbox；跨进程租约 Redis `SET NX PX`+fence；须 claim/锁 prove」· 下一刀 = 「M3 claim/lease 实现切片（选型后）」· 证据 = 「claim multi-consumer prove；锁互斥/过期/fence prove（待建）」。

## 1. 解读（implementer 解读 · 双审裁决点 · 模糊处留双审裁决）

**解读（一句话）**：`:75` 原文的「claim/lease 实现切片（选型后）」是旧 **MySQL+Qdrant+Redis sole-stack 叙事**下的拟切片——其处置列两条腿（MySQL 8 同语义 claim / 跨进程租约 Redis `SET NX PX`+fence）均属**被 PG-retained overlay superseded 的栈方向**（backlog 头部 `adr-postgres-retained.md` · GAP-SCH-01 Ban MySQL sole relational cutover），且其前置「选型后」**未满足**（M3 队列选型 PG vs Redis Streams 未决：Redis cutover 须未来六门 REQUEST · MOP03 nail `e29d8f93` 六门准入合同 + MOP01 wakeup 工作面立卷共同钉）——故本刀范围 = **PG 侧 claim/lease 等价机制的现状盘点与立卷**（原文缺口列自认 PG claim 是现状：「Claim 仍…」）+ 未来「选型后」切片的设计定义与待建 prove 清单 + 诚实登记（Redis 腿 deferred ≠ STOPPED · MySQL 腿 Ban）· **零实现零切流**。

**裁决点（留给 PRE dual）**：

1. **D1（生死点）· 原文属向裁决**：`:75` 的 claim/lease 概念是否 Redis 侧概念。implementer 读法：**原文缺口列陈述的现状本身就是 PG 侧**（Q2「Claim 仍多路径 PG `FOR UPDATE SKIP LOCKED`」的「仍」= 现状已实存；Q3 advisory 同）——Redis `SET NX PX`+fence 只出现在**处置列**（选型后新栈的候选实现），故本刀=「PG 现状盘点 + 切片定义 + 诚实登记」，非 Redis 实现。若双审判原文重心在 Redis 侧实现，则本刀显式改写收窄为「仅诚实登记 + 设计文档」（逃生门写死于此 · Ban 静默换范围 · Ban 任何 Redis 顶替实现不因改写而解禁）。
2. **D2 · 「选型后」前置状态**：`m3-queue-wakeup-selection.md` 钉的是 wakeup 侧「Streams 优选」叙事（Q1），非 Q2/Q3 claim 选型终局；PG-retained overlay 后 Redis wake/cutover 仍 separately evaluable 但须六门 REQUEST。本刀按「选型未决 → 切片前置不满足 → 不实现」理解；**模糊处（「选型」指 Q1 wakeup 选型还是 Q2/Q3 claim 机制选型）留双审裁决**——两读法下本刀产物均为 docs（差别仅在 §2b 定义的措辞强度），Ban 以任一读法为由启动实现。
3. **D3 · Redis/MySQL 语义边界**：`SET NX PX`+fence 与 MySQL 8 同语义 claim 在本刀**只作原文转述与候选语义登记**（零代码零原型零 flag 零授权）；Redis deferred ≠ STOPPED（W5 口径）；MySQL 腿在 PG-retained 下**非 deferred 而是 Ban**（GAP-SCH-01：Ban MySQL sole relational cutover · STOPPED:mysql-schema-prove）。
4. **D4 · 与 MOP01/MOP03 边界**：MOP03 nail `e29d8f93` 六门准入合同**只读引用不松动**（Ban 重复立卷）；MOP01 `:74`/BUG-NOTIFY-REC（`:95`@REQUEST base → `:97`@exec tip · **OB-H3 exec 刷新 · 行 ID 锚定**）wakeup 工作面已立卷、本刀**不认领不重复**（wakeup=lossy hint，claim/lease=真相——`worker-job-wakeup.ts:2-4` 原文自钉）；execution-master-checklist `:1134`「GAP-MOP-01 `:74` / GAP-MOP-02 `:75` 独立行本刀不认领」——本刀即该独立行的认领刀。

## 2. 本刀范围（docs · 授权后可执行面）

| Face | 本 REQUEST（拟） | 仍须保留 |
|------|------------------|----------|
| **现状诚实清单** | §2a PG 侧 claim/lease 等价机制盘点（Q2 多路径 SKIP LOCKED + Q3 advisory + 租约字段面）代码锚实测 @base `2fd78ea1` | GAP-MOP-02 `:75` OPEN · Ban 写成已关/已选型 |
| **切片定义** | §2b 未来「选型后」claim/lease 实现切片的内容清单（docs 定义 · 非执行 · 待建 prove 三项照原文） | 待建 prove 不命名不授权（Redis 侧）· 属未来六门 REQUEST |
| **口径钉** | `actualSpendCny=null` · 两本账分离沿 I 线 · `releaseEvidence=false` | 费率非承诺 |
| **prove/EXIT 契约** | §5 named proves 零执行 + EXIT 契约预声明（attempts 全记录 · 诚实失败路径） | named ≠ 授权（I2 先例） |

### 2a. PG 侧 claim/lease 等价机制现状诚实清单（Q2/Q3 · 代码锚实测 @base `2fd78ea1`）

| # | 事实 | 代码锚 | 诚实含义 |
|---|------|--------|----------|
| 1 | **Q2 · job claim 多路径 `FOR UPDATE SKIP LOCKED` 实存**：报告 job claim = CAS（queued 或租约过期 running）→running + `lease_owner` + `lease_expires_at` + `attempts++` + `version++`，子查询 `FOR UPDATE SKIP LOCKED LIMIT 1` 防并发双跑、不抢活租约；`DEFAULT_LEASE_SECONDS=120` · `MAX_REPORT_ATTEMPTS=3` · 失败指数退避封顶 5min · sweeper 超限隔离 `quarantined` | `packages/db/src/report.ts:23-42`（`claimReport`）/`:45-59`（`markReportReady` 仅持租约者 CAS）/`:62-69`（`markReportFailed`）/`:80-93`（`sweepReports`） | 租约语义完整实存于 PG job 表——跨进程互斥由**行锁 + 租约字段**承担，非 Redis |
| 2 | **Q2 · interview/quiz/diagnosis/route 四路同构 claim**：seq 序认领 + 同构租约字段 + per-owner inflight cap + 僵尸兄弟守卫（同面试任一 job 终态 failed 不再领后续） | `packages/db/src/interview-jobs.ts:125-149`（`:143` SKIP LOCKED）· `packages/db/src/quiz-jobs.ts:40` · `packages/db/src/diagnosis-jobs.ts:38` · `packages/db/src/job-route-decision.ts:393` | 「多路径」原文逐字成立：同一 SKIP LOCKED 语义散布 ≥6 处 claim 面 |
| 3 | **Q2 · model invocation reconcile 面**：`reconcileStaleModelInvocations` 以 `FOR UPDATE SKIP LOCKED` 锁候选，「concurrent worker replicas divide the work」；30s 周期（低于最小 age，不与新鲜发送竞速） | `apps/worker/src/model-invocation-reconcile.ts:64-68`（注释原文）· `:127-131`（`intervalMs = 30_000`）· mig `0088_ai_model_invocation_controlled_state_machine.sql:708` | reconciler 的"分活"= 事务内行锁，非长租约；dispatching→unknown 终态化幂等 |
| 4 | **Q3 · advisory `pg_advisory_xact_lock` 多路径实存**：model invocation same-key claim 短事务锁（`hashtext('meetwise:model_invocation_claim:'‖owner)`+`hashtext(idempotency_key)`）+ 既有行先取行锁再铸 one-use permit（同序防 permit↔invocation 死锁）；interview/quiz/diagnosis begin/abandon 面锁；预算/记忆/隐私面锁 | mig `0130_model_invocation_same_key_claim_join.sql:73-90` · `apps/api/src/modules/interview/interview.service.ts:198/:391/:557/:582/:856` · `apps/api/src/modules/quiz/quiz.service.ts:29` · `apps/api/src/modules/diagnosis/diagnosis.service.ts:30` · mig `0050_online_judge_control_plane.sql:329/:332/:343`（**OB-H4 exec 落实**：REQUEST 误列的 `:401` 实为 `FOR UPDATE SKIP LOCKED` 属 Q2 族非 advisory，已移列——advisory 主张由 `:329/:332/:343` + `0076:97` + `0105:391` + service 面独立支撑，结论不变） · mig `0076_privacy_erasure_legacy_request_pause.sql:97` · mig `0105_memory_two_stage_recall.sql:391` · `apps/worker/src/cloud-test-serial.ts:364/:494`（`pg_try_advisory_lock` · **测试基建非产品路径**） | Q3「advisory `pg_advisory_*`」原文逐字成立：事务级 advisory 锁承担同键互斥与临界区，全部 PG 侧 |
| 5 | **dual reconciler 侧无显式租约的诚实边界**：usage calibration 60s 周期靠**小时桶幂等**（同小时重跑幂等）而非租约；model invocation reconcile 30s 靠行锁+30s finalization grace | `apps/worker/src/usage-calibration-reconcile.ts:6`（「batch = 小时桶，同小时重跑幂等」括注实位 · REQUEST 引 `:5` ±1 同 doc-comment 块 · **OB-H4 exec 落实**）· `:62-64`（`intervalMs = 60_000`）· `model-invocation-reconcile.ts:21-25`（`MODEL_INVOCATION_FINALIZATION_GRACE_MS = 30_000`） | claim/lease 语义在两 reconciler 中以「幂等 + 行锁」等价体现——如实登记，**不声称二者已有跨进程租约** |
| 6 | **wakeup 与 claim/lease 的关系（MOP01 面零重复）**：PG LISTEN/NOTIFY 为 lossy commit-delivered hint，**「queue tables and claim leases remain the sole durable source of work」** | `packages/db/src/worker-job-wakeup.ts:2-4`（原文）· `:15-17` | 原文自钉 claim/lease=真相、wakeup=hint——本刀不认领 wakeup 面（MOP01 已立卷），只引用该边界句 |

### 2b. 未来「选型后」claim/lease 实现切片的内容定义（docs 立卷 · 非本刀执行）

未来授权的 claim/lease 切片 REQUEST（无论选型终局 PG 深化还是 Redis 侧）至少须交付（与 MOP03 六门**同时**满足 · 见 §3）：

1. **backlog `:75` 证据列三项待建 prove 逐项落地**：claim **multi-consumer prove**（多消费者并发认领恰一分活、零双跑）；**锁互斥 prove**（advisory 与行锁的互斥语义按路径逐面验证）；**过期/fence prove**（租约过期回收语义；若未来跨进程租约落 Redis 侧，fence token 语义证明属该 REQUEST 自带）。
2. **选型前置显式化**：REQUEST 须写明其依据的选型状态（PG-retained 深化 vs Redis cutover 已过六门）——**Ban 在选型未决时借本定义启动实现**。**禁引 `m3-queue-wakeup-selection.md` draft「主候选」（Q2 关系表 job claim `:76` / Q3 Redis 租约 `:88`）充当选型终局**——该 doc 状态行 `:10` 自钉 **selection draft** 且以已 superseded 的 MySQL sole-relational 前提行文（**OB-2/OB-D2 exec 落实** · PRE 双审 D2 精确化）。
3. **Redis 腿约束**（若选型终局为 Redis 侧）：须走 MOP03 六门 REQUEST + MOP01 切流包内容 + BUG-REV-COND（backlog 行 ID 锚定 · `:96`@REQUEST base → `:98`@exec tip · **OB-H3 exec 刷新**）四专家审；`SET NX PX`+fence 为候选语义之一，本刀**不命名不授权**任何 Redis prove。
4. **MySQL 腿**：`MySQL 8 同语义 claim` 处置腿在 PG-retained overlay 下 **Ban**（GAP-SCH-01）——未来切片 REQUEST 不得以 MySQL claim 实现交付，除非栈裁定另经独立六门翻转。
5. **「仍多路径」的收敛或显式保留**：Q2 多路径（≥6 claim 面）是否收敛到统一 claim 原语，属切片 REQUEST 的范围决策；本刀只登记现状、不预设收敛结论。
6. **本绿 ≠ 已实现 ≠ 已选型**（沿 `:74`「本绿 ≠ 已迁」同族口径）随包输出。

### 2c. 旧/现存 prove 面处置（docs 声明 · 本刀不执行）

现存与 claim/lease 相关的 prove（§5 全表）均为**局部面证据**（claim-join orphan / uc002 租约 / report 舱壁租约双跑 / commerce 租约心跳），**不构成** `:75` 证据列三项待建 prove 的替代；`:75` 证据列明写「待建」——本刀不新增脚本、不改 `package.json`、不跑不标红任何现存 prove；未来切片 REQUEST 落地时按其选型决定现存 prove 的沿用/换夹具/标红（BUG-FAKE-CONN 口径：局部绿 ≠ 全面 claim/lock 证明）。

## 3. 与 MOP01/MOP03 立卷的边界 / 重叠分析（Ban 重复立卷）

**MOP03 nail `e29d8f93` 六门准入合同**（execution-master-checklist `:1134` 原文：「cutover 准入合同六门已立（Q4/Q5 prove CMD 实存 + wakeup prove + 强制周期 reconcile + flag 默认关三代码锚 + PG LISTEN retained 直至授权 + 独立审≥dual/四专家不降级 + 两本账分离）· `:76` GAP-MOP-03 stays OPEN · GAP-MOP-01 `:74` / GAP-MOP-02 `:75` 独立行本刀不认领」）：

| # | MOP03 六门 | 与本刀关系 |
|---|-----------|-----------|
| 1 | Q4/Q5 prove CMD 实存（双 reconciler 同列门） | **MOP03 域**：本刀零认领（§2a#5 只作现状登记） |
| 2 | wakeup prove | **MOP01 域**：本刀零认领零重复 |
| 3 | 强制周期 reconcile | **MOP01 域**：同上（§2a#5 边界句引用不立法） |
| 4 | flag 默认关三代码锚 | **MOP01/MOP03 域**：本刀零触碰零重述（claim 刀不涉 flag） |
| 5 | PG LISTEN retained 直至授权 | **原样继承写死**（§6 Pins）· 不松动 |
| 6 | 独立审 ≥dual/四专家不降级 + 两本账分离 | 本刀评审规格照此执行（mw-model-op + mw-e2e-ha dual · 对未来切片 REQUEST 持续绑定）· 不降级 |

**边界一句话**：MOP03 立「准入合同（未来切流 REQUEST 须过什么门）」；MOP01 立「wakeup 工作面（`:74`/`:95` · tip `:97` · 行 ID 锚定）」；MOP02 立「claim/lease 工作面（`:75`：PG 现状盘点 + 选型后切片定义）」——未来 claim 侧切流/实现 REQUEST 须**同时**满足 MOP03 六门（准入）、MOP01 切流包（若涉 wakeup 联动）与本刀 §2b 内容清单（工作面交付），缺一不可。

**重叠的诚实声明**：本刀与六门的交集仅门 5/6 的继承与照办（写死引用，非重复立法）；若双审（D1/D4）判仍有实质重叠，本刀收窄为「仅诚实登记」（§2a）并显式改写（逃生门）。

## 4. 相关历史（只读 cite · 零改写）

| 来源 | 口径 |
|------|------|
| `adr-postgres-retained.md` | retained truth = Postgres (+pgvector + PostgresSaver)；MySQL+Qdrant+Redis sole-stack 叙事 **superseded**；Redis wake still separately evaluable |
| GAP-SCH-01（backlog `:80` · **OB-H2 exec 更正**：REQUEST 误引 `:78` 实为 GAP-PROD-02 行 · base/tip 双点实测同位） | **STOPPED / superseded by PG-retained**——MySQL schema skeleton historical · **Ban** MySQL sole relational cutover（§2b#4 依据） |
| M3 选型 | `m3-queue-wakeup-selection.md`：Q1 Streams 优选叙事 · 不切生产 wakeup · 任何落地仍须 periodic reconcile（wakeup 侧 · MOP01 面） |
| Redis 原型 | `harness/redis-streams-wakeup.prototype.md`：additive · flag 默认关 · **PG LISTEN 无条件保留** · ≠ cutover（本刀零 flag 操作） |
| MOP03 立卷链 | nail `e29d8f93`（REQUEST `cdde235e` · pre `16f2c684`+`d65023e1` · exec `47f17b83` · post `e10df445`+`abb04dbd`）· 六门准入合同 · `:76` OPEN · 「GAP-MOP-02 `:75` 独立行不认领」→ 本刀即认领刀 |
| MOP01 立卷链 | nail `b95313a9`≡origin `fe0c134a`（REQUEST stub `a265d6f8` · RE-PRE dual `a6b5cd94`+`07746c3c` · micro-patch `f202091c`）· wakeup 工作面 · `:74`/BUG-NOTIFY-REC（`:95`@base → `:97`@tip · **OB-H3 exec 刷新**）OPEN · 本刀只读引用 |
| W5 | `w5-model-op-dual-reconciler-wakeup.slice.md`：Redis wake **deferred ≠ STOPPED**（D3 口径来源） |
| AN-MOP-Q45 | `:76` honesty nail：prove EXIT 同列绿禁止宣称 MODEL-OP/SLO/cutover 已关（本刀 EXIT0 口径同族） |
| I 线 | `model-op-spend-ledger-offline(-i2)` · nail `e09a39f` · 两本账分离 · `actualSpendCny=null` · 费率非承诺 |
| GAP-PRIV-AUTHZ-PROVE-FLAKE `:68` | attempts 全记录 · Ban retry-to-green（EXIT 契约先例） |
| BUG-REV-COND（backlog `:96`@base → `:98`@tip · **OB-H3 exec 刷新** · 行 ID 锚定） | 切流前 ADR 隐私 prove 清单全绿 + 四专家审 · 禁止自批（对未来切片 REQUEST 持续绑定） |
| BUG-FAKE-CONN | 文档/连通绿被误写成已迁 → 拒绝叙事越权（§2c 口径来源） |

## 5. prove 计划（named · **本 REQUEST 零执行**）+ EXIT 契约

| Command | State | 说明 |
|---------|-------|------|
| `pnpm runtime:claim-join:prove`（`package.json:81`） | 已存在 · 本 REQUEST **不跑** | ai-runtime claim-join orphan 面 · 局部证据 ≠ `:75` 待建三项的替代 |
| `pnpm uc002:lease:prove`（`package.json:144`） | 已存在 · 本 REQUEST **不跑** | uc002 租约面 · 同上 |
| `pnpm report:prove`（`package.json:211`）/ `pnpm commerce:prove`（`package.json:107`） | 已存在 · 本 REQUEST **不跑** | report 舱壁租约双跑/崩溃重领 + commerce 租约心跳 · 局部面（S6/S7 code-validated 先例）· 同上 |
| Q4/Q5（`model-invocation-reconcile:prove` `package.json:196` / `model-op00-usage-reconciler:prove` `package.json:200`） | **MOP03 域 · 本刀零认领** | 六门 1 · 见 §3 |
| `worker-wakeup:prove`（`package.json:381`）/ `worker-wakeup-redis:prove`（`package.json:476`） | **MOP01 域 · 本刀零认领** | §2a#6 边界 · named 仅为防越界 clarity |
| `:75` 证据列待建三项（claim multi-consumer / 锁互斥 / 过期-fence） | **待建 · 不命名 · 不授权** | 属未来「选型后」切片 REQUEST 自带（§2b#1）· Redis 侧 prove Ban 本刀授权 |

本 REQUEST 不新增脚本、不改 `package.json`、不跑任何 prove。命名以上命令仅为双审 clarity（I2 先例：**named proves ≠ coding/prove 授权**）。

**EXIT 契约（预声明 · 适用于未来授权后的 prove · 本 REQUEST 零执行）**：

- **attempts 全记录**：每次 prove 尝试逐条入 receipt（attempt 序号 · Asia/Shanghai 时间窗 · code SHA · EXIT 值）；失败与成功同列入账。
- **诚实失败路径**：EXIT≠0 → 原样记录 → 判 fail → **Ban retry-to-green**（`:68` 先例：单次后绿不关因）；如需重跑须新 REQUEST + 双审。
- **EXIT0 ≠** 已实现 ≠ 已选型 ≠ cutover ≠ `:75` closed ≠ MODEL-OP closed ≠ SLO ≠ HA ≠ suite green ≠ covered（AN-MOP-Q45 口径同族：局部绿禁止洗成域 close）。

## 6. Pins（原值全抄 · retained 写死）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **public DELETE=503** · **PG LISTEN retained** · `actualSpendCny=null` · 两本账分离沿 I 线 · **GAP-MOP-02 `:75` OPEN**（Ban flip CLOSED）

## 7. Ban 列表

- **Ban coding**（本刀 docs-only）· **Ban prove execution** · **Ban live**（无 Key/网络/付费/控制台 spend）
- **Ban Redis 顶替实现**：`SET NX PX`+fence 跨进程租约的任何实现/原型/授权 · Redis claim/wakeup/queue 切流 · Redis prove 命名授权——MOP03 六门不因本刀松动
- **Ban MySQL 8 同语义 claim 顶替实现**（PG-retained · GAP-SCH-01 · STOPPED:mysql-schema-prove）
- **Ban MODEL-OP closed claim** / SLO forge / fake green / `:75` flip CLOSED
- **Ban 删除/绕过 PG LISTEN** without separately authorized cutover REQUEST
- **Ban 重复立卷**：MOP03 六门（门 5/6 写死引用）与 MOP01 wakeup 工作面只读引用 · 不借本刀宣称 MOP03/MOP01 合同升级/放宽
- Ban 认领 MOP01 `:74`/BUG-NOTIFY-REC（tip `:97`）与 MOP03 `:76` 面（独立行另刀已立卷 · 本刀零触碰）
- Ban self-approve（alone ≠ dual）· Ban 四专家审降级（BUG-REV-COND（`:96`@base→`:98`@tip）对未来切片 REQUEST 持续绑定）
- Ban SSOT edit（backlog / matrix / checklist / queue 本刀零改）· Ban 碰 sibling 文件（MOP03 立卷链 / MOP01 立卷链 / AN 系列）
- Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · **Ban push**

## 8. Non-claims

docs-only REQUEST 立卷 · not claim/lease 切片实现 · not 选型终局 · not Redis cutover / not Redis SET NX PX+fence 实现 · not MySQL claim · not MODEL-OP closed · not SLO · not HA · not suite green · not `releaseEvidence=true` · not `:75`/`:74`/BUG-NOTIFY-REC（tip `:97`）/`:76` flip CLOSED · PG LISTEN retained · alone ≠ dual · PASS ≠ coding ≠ prove ≠ AUTHORIZE

## 9. exec 登记（2026-10-07 · exec-era · docs-only · lifecycle 元行推进）

**PRE dual BOTH PASS + 协调方 AUTHORIZE 后 exec landed**：REQUEST `93e0ffaf`≡origin `f8d9f615`（patch-id **`f100ee66e5ed86d04a8d32585c233fce85b2a055`** 两副本实测等同）· PRE dual PASS = **mw-model-op `bab29111` + mw-e2e-ha `1b85b58a`**（0 Blocker · D1 implementer 读法成立收窄逃生门不触发 · D4 零重复立卷）· REQUEST 自身即完整立卷产物（盘点+切片定义+诚实登记）→ 执行 = 本 harness/slice lifecycle 元行推进 **`draft:awaiting_pre_exec_dual` → `executed:awaiting_post_prove_dual`**（旧状态以 Draft-era historical retained blockquote 保留 · token 0 live residue）+ 双审 Conditions/OB docs-side 落实（§0/§2a/§2b/§4/§7 行号与措辞更正 + 本节登记）。

**C-MO-1/C-E2E-1 · base 重验（rebase 落 tip 后锚点核对）**：

- **落位**：`line/mop02-claim-lease` rebase `origin/feat/mysql-schema-skeleton` → REQUEST 同补丁副本 drop（origin `f8d9f615` 已 ∈ 祖先 · patch-id 同上 · `git rebase` skipped-CherryPicks 实证）· exec HEAD = tip **`1b85b58a`**（= mw-e2e-ha PRE PASS commit · 两 PRE PASS 均 ∈ exec base 祖先亲证）。
- **零码移复证**：`git diff --name-only 2fd78ea1..1b85b58a` = 16 文件全 `ai-docs/` · `git diff --stat 2fd78ea1..1b85b58a -- src apps packages scripts migrations package.json` = **0 字节** → §2a 代码锚在新 base 全部继续有效（另抽验：`report.ts:8/:10` 常量 + `:23-42` claimReport（`:29` lease_owner/lease_expires_at + `:34` SKIP LOCKED）· 四路 `interview-jobs.ts:143`/`quiz-jobs.ts:40`/`diagnosis-jobs.ts:38`/`job-route-decision.ts:393` · reconcile `:21-25/:64-68/:127-131` · `0088:708` · `0130:73-90` · `0076:97` · `0105:391` · service 面 advisory 5/1/1 处 · `cloud-test-serial.ts:364/:494` · `worker-job-wakeup.ts:2-4` 逐字 · `usage-calibration-reconcile.ts:6`）。
- **SSOT 行号 tip 实测**（只读核对 · 零改）：`:75` GAP-MOP-02（**tip 无位移**）· `:55` 实辖表头 · `:74` GAP-MOP-01 · `:76` GAP-MOP-03 · `:80` GAP-SCH-01 · `:68` GAP-PRIV-AUTHZ-PROVE-FLAKE · checklist `:1134` 六门合同逐字在位；漂移仅 MOP01 nail backlog 登记块 append +2 行 → **BUG-NOTIFY-REC `:95`@base → `:97`@tip · BUG-REV-COND `:96`@base → `:98`@tip**（**OB-H3** · 本卷已同步刷新 · 后续引用按行 ID 锚定非裸行号）。
- **named proves**：八条 CMD 行号 tip 实测全在位（`package.json:81/:107/:144/:196/:200/:211/:381/:476`）· 零跑零新增零 receipt。

**OB 落实清单（C-MO-4/C-E2E-4 · 全 docs-side · 零 SSOT 行改动）**：

| OB | 内容 | 落实位置 |
|----|------|----------|
| OB-1/OB-H1 | 表头行号 `:66`→`:55`（实际表头「现状」命名强化 D1） | §0（base/tip 双点同位实测） |
| OB-H2 | GAP-SCH-01 `:78`→`:80`（`:78` 实为 GAP-PROD-02） | §4 |
| OB-H3 | `:95`/`:96` base 准确 · tip 漂 `:97`/`:98`（MOP01 nail +2 行 · 按 ID 锚定） | §1-D4/§2b#3/§3/§4×2/§7×2/Non-claims 同步刷新 |
| OB-H4 | usage-calibration 括注实位 `:6`（REQUEST 引 `:5` ±1）· `0050:401` 实为 Q2 SKIP LOCKED 族非 advisory | §2a#5 锚更正 · §2a#4 移列（advisory 主张由 `:329/:332/:343`+`0076:97`+`0105:391`+service 面独立支撑 · 结论不变） |
| OB-2/OB-D2 | m3 doc 含 Q2 `:76`/Q3 `:88` draft「主候选」但状态行 `:10` 自钉 selection draft 且前提 superseded · 禁引充当选型终局 | §2b#2 落字 |

**C-MO-3/C-E2E-3 · 写死保留（未来切片绑定）**：未来任何 claim/lease 实现/切流 REQUEST 须**同时**满足——(1) **MOP03 六门**（`e29d8f93` 准入合同 · 不因本刀松动）；(2) **本刀 §2b 内容清单**（含 #2 选型前置显式化 · 禁引 draft 主候选充当终局）；(3)（若涉 wakeup 联动）**MOP01 切流包**内容（`:74`/BUG-NOTIFY-REC 立卷面）；(4) **BUG-REV-COND 四专家审**（禁自批）——缺一不可；本刀 PRE PASS/exec ≠ 上述任一项预授。

**铁律持续自证**：零实现 · 零 Redis cutover · **PG LISTEN retained** · Ban MODEL-OP closed · Ban live · 零产品码（delta 复证 0 字节）· **SSOT 零触碰**（backlog/checklist/matrix/queue 本 exec 零改 · SSOT 登记属协调方 nail 阶段）· **`:75` stays OPEN** · `actualSpendCny=null` · 两本账分离 · pins 原值（§6）零漂移 · **Ban self-write `post_prove_dual_pass`**（POST 双审 + 协调方 nail 专属 · Ban open POST here）。

**STOP——awaiting POST dual（协调方另派 · 禁自批）· Ban push。**

## Review stubs

| Expert | Stub |
|--------|------|
| `mw-model-op` | `reviews/REQUEST-2026-10-07-gap-mop-02-claim-lease-pg-equivalent-mw-model-op.md` |
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-07-gap-mop-02-claim-lease-pg-equivalent-mw-e2e-ha.md` |

**PRE dual BOTH PASS + 协调方 AUTHORIZE 已兑现 · docs 立卷面已执行 = lifecycle 元行推进至 `executed:awaiting_post_prove_dual` · Ban coding / Ban prove / Ban live 持续 · awaiting POST dual（Ban self-write `post_prove_dual_pass` · Ban open POST here · nail 属协调方 · SSOT 登记属 nail 阶段）。**

*Harness · GAP-MOP-02 :75 claim/lease（PG 等价机制盘点 + 选型后切片定义）· 2026-10-07 · `executed:awaiting_post_prove_dual` · 零 coding · 零 prove 执行 · Ban Redis/MySQL 顶替实现 · Ban MODEL-OP closed · Ban 重复立卷（MOP03 六门 + MOP01 工作面只读引用不松动）· PG LISTEN retained · `:75` OPEN · alone ≠ dual · STOP（awaiting POST dual）*

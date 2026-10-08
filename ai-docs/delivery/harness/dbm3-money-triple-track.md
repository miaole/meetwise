# Harness — **DBM3-1** · GAP-DEBT-DB-MONEY3 钱三轨 + 约束治理刀（REQUEST）

**Status**: **`rev2:pre_exec_dual_pass`**（双审双席意见齐：`mw-model-op` **PASS** 附 N1/N2 · `mw-e2e-ha` **PASS** 附④让位机械修正+0144 撞号 · 裁定与修订经协调方 rev2 通道落卷 · **awaiting meetwise EXEC authorization** · 仍未编码 / zero migration / zero prove）
**Date**: 2026-10-07（rev2 · rev1 同日 `53e7939f`）
**Rev2 裁定摘要**: D1=**案B**（CHECK-only · 两席一致）· D2=**摘除**（consumption_record CHECK 出刀 · DBHY-1 DROP 先行）· D3=删 0027 保 0021 · D4=入 · D6=11 值全收 · **迁移顺延 0149**（让位序 DBTF-1=0144 已 EXEC → DBHY-1=0145+0146 → DBFK-1=0147+0148 → **DBM3-1=0149**）· N1=P0 负样本自证移 0149 前基线态 · N2=措辞勘误落卷（全账 §9）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（stays） · g7SuiteGreen=false · actualSpendCny=null
**Experts**: `mw-model-op` + `mw-e2e-ha`（pre-exec 双审 · 本 REQUEST 只送审 · **Ban self-approve** · **Dual PASS ≠ 自动开工** · 须 meetwise 明示授权才进 EXEC）
**Slice**: `../dbm3-money-triple-track.slice.md`
**Authority**: 技术债台账 `ai-docs/delivery/gap-bug-backlog.md:877`（GAP-DEBT-DB-MONEY3 · P1 · 协调方 SSOT commit 2026-10-08 登记）· W2 四刀 · 债行在卷。对表勾销判据链 = `ai-docs/engineering/NEXT-NODE-BEST-PRACTICES.md`（硬规则 11）+ postgres skill 第 4 项（status CHECK / 金额单位）——DBID-1 EXEC §4 已将该项指向本台账行，本刀即其清偿刀。
**Parent tip**: `48dee7a2`（branch `line/db-money3` · base `origin/feat/mysql-schema-skeleton`）· rev1 `53e7939f` · rev2 本笔
**Honesty**: 本 REQUEST 全部清单为 mw-core 在 `48dee7a2` 上亲核（grep/逐迁移逐列/代码引用面），非 AI 凭记忆；发现的联动面（drift:prove 方向约束 · migrate.proof 既有断言 · 台账交叉张力）如实入 §1.6/§6，不藏不利事实。

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **本刀是什么** | 钱三轨治理四件套：① 钱/额度规范文档（`money-convention.md` · 三轨映射表 + bigint 分单位 + 列名单位后缀约定）② 新迁移 **0149** 补正数 CHECK（D1 裁**案B**：units CHECK-only 零触碰 · 无 ALTER TYPE）+ status 枚举 CHECK（ai_graph_run 11 值 · D6 全收）+ 删 interview_event 双重唯一索引之一（D3：删 0027 保 0021）③ prove `db-money3.proof.ts` EXIT=0（P0 负样本自证移 0149 前基线态 · 负值拒绝 + 三表回归）④ 台账 MONEY3 行清偿 |
| **本刀不是什么** | **不是** 业务语义变更（枚举不收敛 · succeeded/completed 双终态并存保留 · units 计次语义不动）· **不是** 历史迁移改写（0001–0143 一字不动 · 0143 双文件编号只登记）· **不是** consumption_record CHECK（rev2 裁**摘除**——DBHY-1 DROP 先行 · 表生死归该刀）· **不是** RLS/secrets/触发器面 · **不是** amount_cents int→bigint 列类型升级（D5 豁免登记）· **不是** units ALTER TYPE 升精度（D1 裁案B · 案A 登记）· **不是** 本 turn 编码（rev2 落卷即停 · EXEC 须 meetwise 明示授权） |
| **增益边界（诚实）** | DB 层结构性兜底：负/0 金额与脏 status 在 DB 面被 23514 拒绝（今日应用层 contract `z.number().int()` 之外全裸奔）；22003 炸点在**下单时**被拒（今日在**回调入账时**才炸）；interview_event 每笔 INSERT 少维护一个全行唯一 btree + 少一次唯一性检查。**无** SLO/压测/性能量化声明 · **无** 存量数据修复 claim |
| **现在** | `rev2:pre_exec_dual_pass` · docs-only · 双席 PASS + 裁定落卷 · 等 meetwise 明示 EXEC 授权 |

---

## 1. 审计现状（亲核 @ `48dee7a2` · `packages/db/migrations/0001–0143`）

### 1.1 钱三轨总览（业务量 ↔ 单位 ↔ 表 ↔ 现有守卫）

| 轨 | 业务量 | 单位 | 表.列（迁移:行） | 类型 | 现有守卫 | 判定 |
|----|--------|------|------------------|------|----------|------|
| 轨1 法币 | 订单支付金额 | 分（cents） | `payment_order.amount_cents`（0001:407） | **int** | **无**（无正数 CHECK · 允许负/0） | **洞①** |
| 轨2 权益 | 面试次数额度 | 次（支持 0.50 半次 · 2 位小数） | `payment_order.units`（0001:408） | **numeric 无精度** | **无**（无 CHECK 无 typmod） | **洞②（22003 炸点）** |
| 轨2 权益 | 同上 | 同上 | `entitlement_bucket.units_total/units_reserved/units_consumed`（0001:97-99） | numeric(12,2) | `>=0` ×3 + `ck_bucket_capacity`（0001:104）✓ | 良 · 且是洞②的**落点窄口** |
| 轨2 权益 | 同上 | 同上 | `entitlement_consumption.units_requested/units_settled`（0001:114-115） | numeric(12,2) | `units_requested > 0` ✓（settled 可空无 CHECK） | 良（settled 登记见 D4） |
| 轨2 权益 | 结算入账 | 同上 | `settlement_ledger.units_settled`（0001:143） | numeric(12,2) | **无**（NOT NULL 但无 `>=0`） | 登记（D4 · 一行成本） |
| 轨3 模型成本 | token 计费/预算预留/结算 | 微元（micro_cny · 1e-6 CNY） | `ai_cost_price_book.input/output_micro_cny_per_million`（0033:12/0036:8,14）· `ai_cost_budget_policy.monthly_limit_micro_cny`（0033:21）· `ai_cost_budget_month.limit/reserved/settled_micro_cny`（0033:29-31）· `ai_cost_reservation.input_micro_cny_per_million/reserved/settled_micro_cny`（0033:48-50）· `rag_embedding_compute.reserved_micro_cny`（0101:51）· `*_ledger_breaker.settled_micro_cny`（0120:86） | **bigint** | 全带 `>=0`/`>0` CHECK + 容量不变量（0033:32） | **良 · 三轨中唯一达规范**（bigint + 单位后缀 + CHECK 齐备）——**作为规范参照实现** |

**三轨并存事实**：同一「钱/额度」域，int 分 × 无精度 numeric 次 × bigint 微元三种存储纪元并存，无任何文档声明何列用何单位（`payment_order.units` 从列名读不出「次」· `amount_cents` 从列名读不出币种）。DBID-1 已立 ID 规范（`id-convention.md`），钱面规范缺位——本刀补齐（§2）。

### 1.2 洞① + 洞②：payment_order 双裸奔列与 22003 炸点链

- **洞① `amount_cents int NOT NULL` 无正数 CHECK**（0001:407）：`-100`/`0` 分订单在 DB 面畅通。写路径亲核：`packages/db/src/payment.ts:15/:27`（createOrder 直落参数 · 无符号校验）· 值源 `apps/api/src/modules/commerce/commerce.service.ts:12-13`（目录常量 9900/24900 · 服务端可信但 DB 层零兜底）· contract `packages/contracts/src/index.ts:229`（`z.number().int()` —— int 但**非正数**）。int 容量 2^31-1 分 ≈ ¥21,474,836/单笔（登记 · 不升 bigint · D5）。
- **洞② `units numeric` 无精度无 CHECK**（0001:408）与 `entitlement_bucket numeric(12,2)`（0001:97）**落点窄口错配**：
  - 炸点链亲核：下单 `createOrder`（payment.ts:15）→ `units` 以任意 numeric 入库（`1e30` 合法）→ 支付回调 `markOrderPaidAndCredit`（payment.ts:84）`INSERT INTO entitlement_bucket(... units_total ...) VALUES ($1,'paid',$2,...)` → **numeric(12,2) 上限 9999999999.99（10 位整数）** → `SQLSTATE 22003 numeric field overflow` → 回调事务（CAS created→paid + 发桶同事务）整体回滚 → **订单永久卡 created · 回调持续 5xx**。今日防线仅 TS contract `units: z.number().int()`（contracts:229）——但 contract 层是 API 面，DB 直写/函数写/未来调用方全裸奔；且 `units = 1e10`（整数 · contract 放行）即触发 22003。
  - 语义附注（诚实）：`units` 名义计次但 numeric 承载 0.5 半次（bucket 注释 0001:92「1 次面试=1.00，降级按比例可落 0.50」）→ 精度锚 = 落点 numeric(12,2)，源头裸 numeric 是唯一不齐点。

### 1.3 status 无 CHECK：ai_graph_run 脏值静默绕过 partial unique 不变量

- `ai_graph_run.status text NOT NULL`（0001:31）**无 CHECK**；`uq_active_run`（0001:36-37）partial unique 依赖之：
  `CREATE UNIQUE INDEX uq_active_run ON ai_graph_run (graph_name, thread_id) WHERE status IN ('created','active','waiting_user','migrating','paused')`
- **绕过机制**：任何脏值（如拼写错误 `'runing'`/`'wating_user'`、上游枚举演进遗漏值）INSERT/UPDATE **成功**（无 CHECK 拦截）→ 该行落在 partial 谓词**之外**→ 同 `(graph_name, thread_id)` 再插一条 active run 也成功 → 「每 (graph,thread) 至多一个非终态 run」的结构性不变量**静默失效**（无任何报错 · fencing/interrupt 语义随之漂移）。这是本刀 status CHECK 的主案由（台账原文点名）。
- **状态词表亲核（11 值全清单 · 写点+谓词点逐值溯源）**：

| # | 值 | 证据（file:line） | 性质 |
|---|-----|------------------|------|
| 1 | `created` | uq_active_run 谓词（0001:37）· 写点 packages/ai-runtime/test/runtime-kernel.proof.ts:48 | 非终态 |
| 2 | `active` | interview-graph-lease.ts:33/:42 · interview.service.ts:892/:896 | 非终态 |
| 3 | `waiting_user` | interview-graph-lease.ts:83（release 写点） | 非终态 |
| 4 | `migrating` | uq_active_run 谓词 · commerce.ts:212 谓词 | 非终态（现无写点 · 词表值） |
| 5 | `paused` | 同上 | 非终态（现无写点 · 词表值） |
| 6 | `quarantined` | commerce.ts:246 谓词（safe-terminate 扫入集） | 隔离态 |
| 7 | `safe_terminating` | commerce.ts:244 写点 | 两步 CAS 中间态 |
| 8 | `safely_terminated` | commerce.ts:250 写点 | 终态 |
| 9 | `succeeded` | interview.service.ts:910 写点 | 终态（服务纪元） |
| 10 | `completed` | uc052-internal-erasure.proof.ts:91 · uc052-external-sink-async-purge.proof.ts:102 写点 · commerce.ts:240 注释承认 | 终态（kernel 纪元 · 与 succeeded 并存——**Ban 收敛** · 属业务语义） |
| 11 | `failed` | interview.service.ts:916 写点 | 终态 |

### 1.4 status 无 CHECK：consumption_record（rev1 次席案由 · rev2 裁 CHECK 摘除出刀）

- `consumption_record.status text NOT NULL DEFAULT 'reserved'`（0001:52）无 CHECK。同族 saga 孪生 `entitlement_consumption.status`（0001:116-117）**有** CHECK `IN ('reserved','confirmed','partial_confirmed','released')`——同库同语义双标。
- 写面亲核：运行时**零 UPDATE/零枚举写点**（全库 grep · 仅 runtime-kernel.proof.ts:78 以默认值 INSERT · 隐私/oj prove 只 SELECT count）→ rev1 曾提镜像孪生 4 值枚举（D2）。
- **rev2 裁定（协调方通道 · 双席对齐）**：consumption_record CHECK **从迁移摘除**——GAP-DEBT-DB-HYGIENE（gap-bug-backlog.md:878「死表在产」）裁定 **DROP 先行**（DBHY-1 刀），本刀不为其加过渡 CHECK（避免给将死之表加约束后再 DROP 的对冲浪费）；两刀对齐：本刀 P0 脏值检测面与 P2 拒绝面同步不含此表。§1.1–§1.5 审计事实保留为台账证据。

### 1.5 interview_event 双重唯一索引（写放大 · 删一侧）

- 现状亲核：`(stream_key, event_key)` 上**两个**唯一结构并存——
  - 0021:3-4 `CREATE UNIQUE INDEX uq_interview_event_key ON interview_event(stream_key, event_key) WHERE event_key IS NOT NULL`（**partial index**）
  - 0027:5 `ALTER TABLE interview_event ADD CONSTRAINT uq_interview_event_key_constraint UNIQUE (stream_key, event_key)`（**表级约束 + 自带全行背衬唯一 btree**）
  - NULL 语义等价（partial 不收录 NULL 行 · 约束 NULLS DISTINCT 均允许多 NULL）→ 纯冗余。
- **ON CONFLICT 实际使用面亲核**：全库唯一仲裁引用 = `packages/db/src/interview-event.ts:32` `ON CONFLICT (stream_key,event_key) WHERE event_key IS NOT NULL DO NOTHING` —— 带 WHERE 谓词的冲突目标**只能推断 0021 partial index**（约束背衬索引无谓词 · 不匹配）；零 `ON CONFLICT ON CONSTRAINT uq_interview_event_key_constraint` 引用（全库 grep）。0027 自述注释（「仍被 appendEvent 的 ON CONFLICT 谓词选用」）亦亲证。
- **写放大事实**：每笔 interview_event INSERT 现维护 4 个 btree（PK bigserial + `uq_event_seq`(stream_key,seq) 0001:45 + 0021 partial + 0027 约束背衬全行索引）+ 提交期两次唯一性检查。**（N2 措辞勘误 · rev2 落卷）** rev1「appendEvent 全库 45 调用点」计数口径不纯：45 含测试文件，其中 `apps/api/test/sse-push-notify.proof.ts:132` **自定义同名本地 helper** 及其调用非 db 原语；rev2 亲核复算 = **运行时源码（packages/db/src + apps/api/src + apps/worker/src）真实调用点 38 处**（worker 37 + qbank-miss 1 · 带显式 eventKey 者极少数）——**「绝大多数调用不带 eventKey（进度/题目流）」结论不变**：凡 event_key IS NULL 的行，0027 背衬索引仍收录索引项，0021 partial 完全不收录 → 0027 侧是纯开销侧。
- **删哪侧**：保 0021 partial（ON CONFLICT 实际 arbiter + NULL 行零索引成本），删 0027 约束（0149 `DROP CONSTRAINT`·D3 已裁）。反向（保约束删 partial + 改 interview-event.ts:32 去谓词）劣化：全行进唯一索引 + 动代码面 → 否。

### 1.6 联动面（亲核发现 · 不藏）

| # | 联动 | 事实 | EXEC 必须 |
|---|------|------|-----------|
| L1 | `drift:prove` 方向约束 | `scripts/schema-drift-check.mjs:75-79`：**sql/ 有、迁移缺 = 红**。sql/01_schema.sql:46 fixture 有 `CONSTRAINT uq_event_key UNIQUE (stream_key, event_key)`；0149 删约束后 mig 路径无该表级 UNIQUE → drift 红 | sql/01 fixture 对齐（表约束 → 0021 同形 partial index · drift 只比列+UNIQUE/PK 约束 · 索引不比 → 绿） |
| L2 | migrate.proof 既有断言 | `packages/db/test/migrate.proof.ts:307` 断言 0027 约束**存在**（`:306` 断言 0021 索引存在）| :307 契约更新为 0149 后终态（约束 0 · partial 索引仍在）——prove 契约变更非历史改写 |
| L3 | 0143 双文件 + **0144 撞号（e2e-ha 席④）** | 0143_db_id_v7_unify.sql 与 0143_sse_push_notify.sql **同号并存**（base 亲核）；rev1 误判「0144 为下一空号」——实况 **DBTF-1 已 EXEC 占 0144**，让位序 DBHY-1=0145+0146 · DBFK-1=0147+0148 | **DBM3-1 顺延 0149**（rev2 裁定）· 双 0143 只登记（Ban 碰历史迁移） |
| L4 | prove wiring 面 | dbid1 先例：root package.json ×2 + packages/db/package.json ×1 + `scripts/run-e2e-isolated.mjs` ×4 注册点（target 表/:1595 allowlist/:1827 dispatch/:2391 **migrate allowlist**——dbid1 attempt#0 红 因即漏此点）| db-money3 四点全落 · EXEC checklist 明列 |

---

## 2. 规范交付：`money-convention.md`（id-convention 同级 · 新增 `ai-docs/architecture/backend/money-convention.md`）

1. **三轨映射表**（§1.1 表原样冻结入档 + 演进规则）：业务量 ↔ 单位 ↔ 表.列 ↔ 类型 ↔ 守卫 ↔ 判定（洞/良/豁免）。
2. **新表规范（一刀冻结）**：
   - 法币金额一律 `bigint` **分单位整数** + **列名单位后缀**（`*_cents` · 币种入注释/文档）；禁 float/double/裸 numeric 存法币。
   - 模型成本一律 `bigint` 微元 + `*_micro_cny` 后缀（0033 族为参照实现 · 含 `>=0` CHECK 与容量不变量样板）。
   - 权益计次一律 `numeric(12,2)`（2 位小数锚定 · 与落点 bucket 对齐）+ `units` 词根 + 语义注释（1.00=一次 · 0.50=降级半次）。
   - 一切金额/额度列**必须**带符号 CHECK（>0 计费额 / >=0 余额类），CAPACITY 型不变量优先表级命名 CONSTRAINT。
3. **存量豁免登记**：`payment_order.amount_cents int`（int 容量 ¥21.47M/单笔 · 升 bigint=全表 rewrite · 本刀不升 · D5）；`payment_order.units` 精度处置随 D1 裁定；`succeeded`/`completed` 双终态并存（kernel 纪元遗产 · Ban 本刀收敛）。
4. **消费面契约**（沿 DBID-1 §2 先例）：任何新钱列接入前须在本表登记单位与守卫——未登记即用 = 违规（规范 fail-closed 在文档层）。

---

## 3. 迁移 0149 方案（新 `packages/db/migrations/0149_money_status_constraints.sql` · rev2 顺延定号 · 名可 EXEC 定稿）

**语句白名单**（prove P6 静态门强制）：`ADD CONSTRAINT … CHECK` · `DROP CONSTRAINT uq_interview_event_key_constraint` · DO $$ 前置脏值检测块。**零** UPDATE/DELETE/INSERT/DROP COLUMN/ALTER COLUMN TYPE/CREATE INDEX/TRIGGER/RLS/GRANT（D1 裁案B → **无 ALTER TYPE** · 白名单收窄）。

1. **正数 CHECK**（0149 主体）：
   - `payment_order` `ADD CONSTRAINT ck_payment_order_amount_cents_positive CHECK (amount_cents > 0)`；
   - 存量先验证：DO 块前置 `SELECT count(*) FROM payment_order WHERE amount_cents <= 0` / units 侧 `WHERE NOT (units > 0 AND units <= 9999999999.99 AND units = round(units,2))` → 非 0 即 `RAISE EXCEPTION 'dbm3_dirty_rows: …'`（具名可行动 · fail-loud 不静默）；隔离库零行过 · 生产部署同语义（**本 turn 不跑**）。
   - 「登记豁免面」= 若生产前置检测出脏行：不洗数据（Ban）· 停部署上报 meetwise 裁决（修复刀 or 豁免登记）——prove P0 落同构检测函数。
2. **units 精度（D1 已裁案B · 两席一致）**：`payment_order` `ADD CONSTRAINT ck_payment_order_units_range CHECK (units > 0 AND units <= 9999999999.99 AND units = round(units,2))` —— 与落点 `entitlement_bucket numeric(12,2)`（0001:97 · 上限 9999999999.99 · 2 位小数锚）逻辑等价护栏 · 零锁窗口零存量触碰（append-only 纪律零妥协）。**案A（ALTER COLUMN TYPE numeric(12,2)）登记不做**：全表 rewrite + ACCESS EXCLUSIVE 锁窗 + 存量 typmod 静默舍入风险（须先证 `max(scale(units)) <= 2`）——typmod 硬收敛留 HYGIENE 后续刀评估。
3. **status 枚举 CHECK**：
   - `ai_graph_run` `CHECK (status IN (§1.3 十一值))`（D6 裁**全收**）—— 枚举**只增不改**（脏值检测 prove 先行 · P0/P2）；
   - `consumption_record` **无 CHECK 面**（rev2 裁摘除 · §1.4 · DBHY-1 DROP 先行）；
   - 其余无 CHECK status 列（interview 0001:21 · memory/ctx/checkpoint 族 0047/0093/0095/0099/0104/0107/0112/0115/0117 亲核清单）**本刀不动 · 登记台账**（非 MONEY3 行面 · 防刀面膨胀）。
4. **双重唯一索引删一（D3 裁定：删 0027 保 0021）**：0149 `ALTER TABLE interview_event DROP CONSTRAINT uq_interview_event_key_constraint`（保 0021 partial · §1.5 亲核使用面）；联动 L1（sql/01 fixture 对齐）+ L2（migrate.proof:307 契约更新）。
5. **settlement_ledger.units_settled `>= 0` CHECK（D4 裁入）**：`ADD CONSTRAINT ck_settlement_units_settled_nonneg CHECK (units_settled >= 0)` —— 一行成本补齐同族兜底。

---

## 4. Prove 设计（新 `packages/db/test/db-money3.proof.ts` · `pnpm db-money3:prove` · EXIT=0）

对隔离 PostgreSQL（`assertIsolatedTestTarget` + 增量迁移到 0149 · wiring 四点 L4 全落），全断言 PASS 才 EXIT=0：

| 块 | 断言 |
|----|------|
| P0 脏值检测先行 + 负样本自证（N1 rev2 重排） | **负样本自证移 0143 基线态**：隔离库先增量迁移到 0143 → `SAVEPOINT p0_neg` → **DO 检测块前注入**三类脏行各一（`payment_order.amount_cents<=0` / `units` 出域或 >2 位小数 / `ai_graph_run.status` 脏值；consumption_record 已摘除不在检测面·§1.4）→ 跑 0149 → 其 DO 块如实 `RAISE dbm3_dirty_rows`（**证明检测器非恒真**）→ `ROLLBACK TO p0_neg` 回滚脏行与半途迁移 → 干净基线上**再跑 0149 全绿**（同库同 runner·attempts 两跑全账留痕）。通过后复跑 §3.1 同构检测各 count=0 |
| P1 约束生效断言（catalog） | pg_constraint 具名存在：`ck_payment_order_amount_cents_positive` · `ck_payment_order_units_range`（D1 案B）· ai_graph_run 枚举 CHECK · `ck_settlement_units_settled_nonneg`（D4 已裁入）；consumption_record **无新 CHECK**（rev2 摘除·如双审复核发现则红）；`uq_interview_event_key_constraint` **不存在** · partial `uq_interview_event_key` **仍存在**；pg_indexes 上 (stream_key,event_key) 唯一结构恰 1 个 |
| P2 负值/脏值拒绝 | `amount_cents=-1` / `=0` INSERT → 23514；`units=-5` / `units=1e10` / `units=1.005` → 源头 23514（D1 案B CHECK·零 ALTER TYPE）；`ai_graph_run.status='runing'`（脏拼写）→ 23514 |
| P3 三表回归（写路径真行为） | **payment_order**：createOrder+markOrderPaidAndCredit 全链绿（正数单 → paid → 发桶 credited · 幂等重放 already）；**entitlement_bucket**：reserve/confirm/release saga 绿（ck_bucket_capacity 不变量 · 22003 边界值 9999999999.99 可入 / 1e10 拒）；**interview_event**：appendEvent 带 eventKey 重复投递返回既有 seq（ON CONFLICT arbiter=partial · 约束已删零影响）· 无 eventKey 连写 N 行全成功 |
| P4 不变量回归 | ai_graph_run fencing：同 (graph_name,thread_id) 二条非终态 → 第二条 23505（uq_active_run 仍活）· 终态后新开 run 合法 · `succeeded`/`completed` 双终态并存写均过（Ban 收敛自证） |
| P5 sql/ fixture 对齐 | drift:prove 绿（L1 · sql/01 无该表级 UNIQUE · mig 路径同）· migrate.proof 更新后 :306/:307 双绿（L2） |
| P6 静态契约门 | 0149 文本（dollar-quote 感知切分）：语句白名单外**零**语句；零 UPDATE/DELETE/INSERT/DROP COLUMN/ALTER COLUMN TYPE/CREATE INDEX/TRIGGER/RLS/GRANT |
| P7 对表勾销块 | postgres skill 第 4 项（status CHECK/金额单位）✅ 落地 + NEXT-NODE 硬规则 11 面 · 程序输出勾销行 |

**纪律**：EXIT=0 一次过；**attempts 全账**（每次运行无论红绿都记录）；**Ban retry-to-green**（红后修因重跑须留痕并说明）。

---

## 5. 硬 Ban（EXEC 期同样有效）

1. **Ban 改历史迁移**（0001–0143 一字不动 · checksummed ledger；0143 双文件编号事实只登记 · L3）。
2. **Ban 业务语义变更**：枚举不收敛（succeeded/completed 并存保留）· units 计次语义不动 · saga 状态机不动 · 正数 CHECK 只判符号不判定价。
3. **Ban RLS/权限面**（零策略改动 · payment_order/interview_event 等现策略原样）。
4. **Ban secrets / 真实数据入树**。
5. **Ban 洗存量数据**（检测出脏行只上报不修 · §3.1 豁免面流程）。
6. **Ban 改共享 SSOT**（north-star / hard-gates / e2e coverage 矩阵 / 台账他行不动——本刀只勾 MONEY3 行）。
7. **Ban 本 turn 编码**（REQUEST 写完即停回报；EXEC 须双审 PASS + meetwise 明示授权）。

---

## 6. 决策点（请双审裁定）

| ID | 议题 | mw-core 建议（rev1） | rev2 裁定（双席+协调方通道） |
|----|------|--------------|--------------|
| D1 | units 精度：案A ALTER TYPE（rewrite+typmod 硬约束）vs 案B CHECK-only（零触碰）——案A 含存量静默舍入风险，须 P0 前置证明 scale≤2 | 案B 默认；若双审要求 typmod 对齐且前置证明全行干净，案A 可选 | **案B（CHECK-only）锁定**——两席一致：零锁窗零存量触碰；案A 登记不做（typmod 收敛留 HYGIENE 后续刀） |
| D2 | consumption_record 枚举 = 镜像孪生 4 值（运行时零写点亲核）vs 仅 ('reserved') | 镜像 4 值（同族语义 · 死表生死归 HYGIENE 刀不在此裁） | **摘除出刀**——DBHY-1 DROP 先行（协调方让位序裁定·两刀 rev2 一并落）：不在将死表上叠新约束；P0/P1/P2 面同步不含该表（§1.4） |
| D3 | 双重唯一删 0027 约束保 0021 partial（ON CONFLICT 实际 arbiter 亲核）vs 反向 | 删 0027 保 0021（使用面+NULL 行零索引成本双优）· 联动 L1/L2 必落 | **删 0027 保 0021** 确认（双席无异议） |
| D4 | settlement_ledger.units_settled `>=0` CHECK 入迁移 vs 登记 | 入（一行成本 · 同族兜底齐） | **入** 确认（具名 `ck_settlement_units_settled_nonneg`） |
| D5 | amount_cents int→bigint：本刀不动（容量够 · 升级=rewrite）· 规范层新表 bigint | 不动 · 豁免入档 | **不动** 确认（豁免登记入 money-convention.md） |
| D6 | ai_graph_run 枚举 11 值（含 migrating/paused 无写点词表值 + quarantined 谓词值） | 按词表全收（枚举只增不改 · 漏收即脏值误拒合法演进） | **11 值全收** 确认 |

---

## 7. Acceptance（EXEC 后验收）

| ID | Criterion |
|----|-----------|
| A1 | 0149 仅白名单语句（P6 绿）· 0001–0143 checksum 零漂移（migrate:prove 绿） |
| A2 | `db-money3.proof.ts` EXIT=0（P0–P7 全 PASS · attempts 全账） |
| A3 | 负值/脏值 23514 拒绝 + uq_active_run 不变量 + appendEvent 幂等回归全绿（P2–P4） |
| A4 | drift:prove 绿（L1）· migrate.proof:307 更新后绿（L2） |
| A5 | `money-convention.md` 落地（三轨映射表 + bigint 分单位 + 后缀约定 + 豁免登记） |
| A6 | 台账 MONEY3 行按流程勾销（post-dual + meetwise 授权后）· 他行零触碰 |
| A7 | pins 全保留（§首行 · 无一翻转） |

---

## 8. 流程与产物

**流程**：REQUEST（本档 rev2 · 双席 PASS + 裁定落卷）→ **meetwise 授权** → EXEC（0149 + fixture 对齐 + prove wiring + 规范文档）→ post-prove 双审 → **meetwise 授权 nail**。

**EXEC 文件面（预告 · 本 turn 不动）**：

| 文件 | 动作 |
|------|------|
| `packages/db/migrations/0149_money_status_constraints.sql` | 新增（前置脏值检测 DO 块 + `ck_payment_order_amount_cents_positive` + `ck_payment_order_units_range`（D1 案B）+ ai_graph_run 11 值枚举 CHECK + `ck_settlement_units_settled_nonneg`（D4）+ `DROP CONSTRAINT uq_interview_event_key_constraint`；consumption_record CHECK **不含**——rev2 摘除） |
| `packages/db/sql/01_schema.sql` | 对齐 interview_event（表级 uq_event_key 约束 → 0021 同形 partial index · L1） |
| `packages/db/test/db-money3.proof.ts` | 新增 prove（P0–P7） |
| `packages/db/test/migrate.proof.ts` | :307 断言契约更新（L2） |
| `package.json` + `packages/db/package.json` + `scripts/run-e2e-isolated.mjs` | `db-money3:prove` wiring（四注册点 · L4） |
| `ai-docs/architecture/backend/money-convention.md` | 新增（§2 规范 · id-convention 同级） |

---

## 9. rev2 修订全账（双席裁定 + N1/N2 落卷 · 落卷 mw-core）

**rev1 基线**：`53e7939f`（本分支同日）。**rev2 性质**：docs-only 裁定落卷——双审两席意见齐（`mw-model-op` PASS 附 N1/N2；`mw-e2e-ha` PASS 附④撞号修正），无编码无迁移无 prove；落卷者 **mw-core**（协调方 rev2 通道）。

| # | 修订 | rev1 原文 | rev2 落卷 | 依据 |
|---|------|-----------|-----------|------|
| R1 | D1 裁定 | 两案交双审（建议案B） | **案B CHECK-only 锁定**：`ck_payment_order_units_range`（>0 · ≤9999999999.99 · `=round(units,2)`）·案A 登记不做·白名单收窄（无 ALTER TYPE） | 两席一致 |
| R2 | D2 摘除 | consumption_record 镜像 4 值枚举 CHECK | **CHECK 从迁移摘除**：DBHY-1 DROP 先行（gap-bug-backlog.md:878 死表）——不在将死表上叠约束；P0 检测面/P1 catalog/P2 拒绝面同步不含该表；§1.4 审计事实保留为台账证据 | 协调方让位序裁定·两刀一并落 |
| R3 | D3/D4/D6 裁定 | 建议 删0027保0021 / 入 / 全收 | 均确认（§6 表第三列） | 双席无异议 |
| R4 | 迁移号顺延 | 0144 为下一空号 | **0149**：DBTF-1 已 EXEC 占 0144 → DBHY-1=0145+0146 → DBFK-1=0147+0148 → 本刀 0149（§1.6 L3/§3 全文同步改号） | e2e-ha 席④+协调方裁定 |
| R5 | N1 落卷 | P0 负样本自证 = 迁移后注入脏行→检测→DELETE 回滚 | **移 0143 基线态**（§4 P0 重写）：SAVEPOINT `p0_neg` 内、DO 检测块前注入三类脏行 → 跑 0149 检测块如实 RAISE → ROLLBACK TO 回滚 → 干净基线再跑 0149 全绿——原方案的「检出后才 DELETE 回滚」在检测块 fail-loud 语义下不可达（RAISE 即中断），SAVEPOINT 回滚是唯一自洽形态；attempts 两跑全账 | mw-model-op 席 N1 |
| R6 | N2 落卷 | 「appendEvent 全库 45 调用点」 | **计数口径勘误**（§1.5）：45 含测试文件且混入 sse-push-notify.proof.ts:132 自定义同名本地 helper；rev2 亲核复算 = 运行时源码真实调用点 **38**（worker 37 + qbank-miss 1）；「绝大多数不带 eventKey」结论不变 | mw-model-op 席 N2 |

**对后续流程的效力**：本 rev2 后 REQUEST 面即双席 PASS 终稿；EXEC 仍须 meetwise 明示授权（Dual PASS ≠ 开工）。

---

## Non-claims

Not HA · not suite green · not SLO/性能量化声明 · not 存量数据修复 · not 业务语义变更 · not RLS/触发器/secrets 面 · not amount_cents 升 bigint · not 死表下线（consumption_record 归 HYGIENE）· not consumption_record CHECK（rev2 摘除）· not units ALTER TYPE（D1 案B）· not coding authorized（Dual PASS ≠ 开工）· not 覆盖任何 e2e 门（coveredCount=8 不变）· `releaseEvidence=false` · `actualSpendCny=null`。

---

*Harness · DBM3-1 钱三轨 + 约束治理刀 REQUEST **rev2**（rev1 `53e7939f`·双席 PASS+裁定落卷：D1 案B/D2 摘除/D3 删0027保0021/D4 入/D6 全收·顺延 0149·N1 P0 负样本自证移 0143 基线 SAVEPOINT 形态·N2 计数勘误 45→38·落卷 mw-core）· 2026-10-07 · rev2:pre_exec_dual_pass · parent `48dee7a2` · docs-only · pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · Dual PASS ≠ 开工 · Ban self-approve*

# Harness — **DBM3-1** · GAP-DEBT-DB-MONEY3 钱三轨 + 约束治理刀（REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual`**（本 turn docs-only · REQUEST 编写完成即停 · **未授权 EXEC** · zero coding / zero migration / zero prove）
**Date**: 2026-10-07
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（stays） · g7SuiteGreen=false · actualSpendCny=null
**Experts**: `mw-model-op` + `mw-e2e-ha`（pre-exec 双审 · 本 REQUEST 只送审 · **Ban self-approve** · **Dual PASS ≠ 自动开工** · 须 meetwise 明示授权才进 EXEC）
**Slice**: `../dbm3-money-triple-track.slice.md`
**Authority**: 技术债台账 `ai-docs/delivery/gap-bug-backlog.md:877`（GAP-DEBT-DB-MONEY3 · P1 · 协调方 SSOT commit 2026-10-08 登记）· W2 四刀 · 债行在卷。对表勾销判据链 = `ai-docs/engineering/NEXT-NODE-BEST-PRACTICES.md`（硬规则 11）+ postgres skill 第 4 项（status CHECK / 金额单位）——DBID-1 EXEC §4 已将该项指向本台账行，本刀即其清偿刀。
**Parent tip**: `48dee7a2`（branch `line/db-money3` · base `origin/feat/mysql-schema-skeleton`）
**Honesty**: 本 REQUEST 全部清单为 mw-core 在 `48dee7a2` 上亲核（grep/逐迁移逐列/代码引用面），非 AI 凭记忆；发现的联动面（drift:prove 方向约束 · migrate.proof 既有断言 · 台账交叉张力）如实入 §1.6/§6，不藏不利事实。

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **本刀是什么** | 钱三轨治理四件套：① 钱/额度规范文档（`money-convention.md` · 三轨映射表 + bigint 分单位 + 列名单位后缀约定）② 新迁移 0144 补正数 CHECK + status 枚举 CHECK + 删 interview_event 双重唯一索引之一 ③ units 无精度列升 numeric(12,2) **两案评估交双审** ④ prove `db-money3.proof.ts` EXIT=0（脏值检测先行 + 负值拒绝 + 三表回归） |
| **本刀不是什么** | **不是** 业务语义变更（枚举不收敛 · succeeded/completed 双终态并存保留 · units 计次语义不动）· **不是** 历史迁移改写（0001–0143 一字不动 · 含 0143 双文件编号事实只登记）· **不是** RLS/secrets/触发器面 · **不是** amount_cents int→bigint 列类型升级（登记豁免 · 见 D5）· **不是** 死表下线（consumption_record 归 HYGIENE 刀 · 本刀只加 CHECK 不判生死）· **不是** 本 turn 编码（REQUEST 写完即停） |
| **增益边界（诚实）** | DB 层结构性兜底：负/0 金额与脏 status 在 DB 面被 23514 拒绝（今日应用层 contract `z.number().int()` 之外全裸奔）；22003 炸点在**下单时**被拒（今日在**回调入账时**才炸）；interview_event 每笔 INSERT 少维护一个全行唯一 btree + 少一次唯一性检查。**无** SLO/压测/性能量化声明 · **无** 存量数据修复 claim |
| **现在** | `draft:awaiting_pre_exec_dual` · docs-only · 等双审 + meetwise 授权 |

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

### 1.4 status 无 CHECK：consumption_record（同案由次席 + 台账交叉张力）

- `consumption_record.status text NOT NULL DEFAULT 'reserved'`（0001:52）无 CHECK。同族 saga 孪生 `entitlement_consumption.status`（0001:116-117）**有** CHECK `IN ('reserved','confirmed','partial_confirmed','released')`——同库同语义双标。
- 写面亲核：运行时**零 UPDATE/零枚举写点**（全库 grep · 仅 runtime-kernel.proof.ts:78 以默认值 INSERT · 隐私/oj prove 只 SELECT count）→ 枚举提案 = 镜像孪生 4 值（D2）。
- **台账交叉张力（如实登记）**：GAP-DEBT-DB-HYGIENE（gap-bug-backlog.md:878）已把 consumption_record 登记为「死表在产」拟下线。本刀**不判表生死**（归 HYGIENE 刀）：死表下线前 CHECK 是一行成本的过渡兜底；若 HYGIENE 刀先收表，本 CHECK 面自动随表消失，无对冲。

### 1.5 interview_event 双重唯一索引（写放大 · 删一侧）

- 现状亲核：`(stream_key, event_key)` 上**两个**唯一结构并存——
  - 0021:3-4 `CREATE UNIQUE INDEX uq_interview_event_key ON interview_event(stream_key, event_key) WHERE event_key IS NOT NULL`（**partial index**）
  - 0027:5 `ALTER TABLE interview_event ADD CONSTRAINT uq_interview_event_key_constraint UNIQUE (stream_key, event_key)`（**表级约束 + 自带全行背衬唯一 btree**）
  - NULL 语义等价（partial 不收录 NULL 行 · 约束 NULLS DISTINCT 均允许多 NULL）→ 纯冗余。
- **ON CONFLICT 实际使用面亲核**：全库唯一仲裁引用 = `packages/db/src/interview-event.ts:32` `ON CONFLICT (stream_key,event_key) WHERE event_key IS NOT NULL DO NOTHING` —— 带 WHERE 谓词的冲突目标**只能推断 0021 partial index**（约束背衬索引无谓词 · 不匹配）；零 `ON CONFLICT ON CONSTRAINT uq_interview_event_key_constraint` 引用（全库 grep）。0027 自述注释（「仍被 appendEvent 的 ON CONFLICT 谓词选用」）亦亲证。
- **写放大事实**：每笔 interview_event INSERT 现维护 4 个 btree（PK bigserial + `uq_event_seq`(stream_key,seq) 0001:45 + 0021 partial + 0027 约束背衬全行索引）+ 提交期两次唯一性检查。appendEvent 全库 45 调用点、多数不带 eventKey（进度/题目流）——**凡 event_key IS NULL 的行，0027 背衬索引仍收录索引项，0021 partial 完全不收录** → 0027 侧是纯开销侧。
- **删哪侧**：保 0021 partial（ON CONFLICT 实际 arbiter + NULL 行零索引成本），删 0027 约束（0144 `DROP CONSTRAINT`）。反向（保约束删 partial + 改 interview-event.ts:32 去谓词）劣化：全行进唯一索引 + 动代码面 → 否（D3）。

### 1.6 联动面（亲核发现 · 不藏）

| # | 联动 | 事实 | EXEC 必须 |
|---|------|------|-----------|
| L1 | `drift:prove` 方向约束 | `scripts/schema-drift-check.mjs:75-79`：**sql/ 有、迁移缺 = 红**。sql/01_schema.sql:46 fixture 有 `CONSTRAINT uq_event_key UNIQUE (stream_key, event_key)`；0144 删约束后 mig 路径无该表级 UNIQUE → drift 红 | sql/01 fixture 对齐（表约束 → 0021 同形 partial index · drift 只比列+UNIQUE/PK 约束 · 索引不比 → 绿） |
| L2 | migrate.proof 既有断言 | `packages/db/test/migrate.proof.ts:307` 断言 0027 约束**存在**（`:306` 断言 0021 索引存在）| :307 契约更新为 0144 后终态（约束 0 · partial 索引仍在）——prove 契约变更非历史改写 |
| L3 | 0143 双文件 | 0143_db_id_v7_unify.sql 与 0143_sse_push_notify.sql **同号并存**（base 亲核）| 只登记（Ban 碰历史迁移）· 0144 为下一空号 |
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

## 3. 迁移 0144 方案（新 `packages/db/migrations/0144_money_status_constraints.sql` · 名可 EXEC 定稿）

**语句白名单**（prove P6 静态门强制）：`ADD CONSTRAINT … CHECK` · `DROP CONSTRAINT uq_interview_event_key_constraint` · （仅 D1 案A 时）`ALTER COLUMN units TYPE numeric(12,2)` · DO $$ 前置脏值检测块。**零** UPDATE/DELETE/DROP COLUMN/CREATE INDEX/TRIGGER/RLS/GRANT。

1. **正数 CHECK**（0144 主体）：
   - `payment_order` `ADD CONSTRAINT ck_payment_order_amount_cents_positive CHECK (amount_cents > 0)`；
   - 存量先验证：DO 块前置 `SELECT count(*) FROM payment_order WHERE amount_cents <= 0` / units 侧 `WHERE NOT (units > 0 AND units <= 9999999999.99)` → 非 0 即 `RAISE EXCEPTION 'dbm3_dirty_rows: …'`（具名可行动 · fail-loud 不静默）；隔离库零行过 · 生产部署同语义（**本 turn 不跑**）。
   - 「登记豁免面」= 若生产前置检测出脏行：不洗数据（Ban）· 停部署上报 meetwise 裁决（修复刀 or 豁免登记）——prove P0 落同构检测函数。
2. **units 精度两案（D1 · 交双审）**：

   | | 案A `ALTER COLUMN units TYPE numeric(12,2)` | 案B CHECK-only |
   |--|--|--|
   | 语义 | typmod 硬约束（源=落点对齐 · 深度防御） | `CHECK (units > 0 AND units <= 9999999999.99 AND units = round(units,2))` 逻辑等价护栏 |
   | 锁窗口 | ACCESS EXCLUSIVE + **全表 rewrite**（payment_order 小表=订单行 · 秒级；回调路径部署窗停写） | 仅 catalog 元数据 · 锁窗口最小 |
   | 存量触碰 | rewrite 对存量行施加 typmod 舍入——**若存在 >2 位小数行则静默改值**（违零回填纪律）→ 须 P0 前置证明 `max(scale(units)) <= 2` 且全行 ∈ (0, 9999999999.99] 才允许 | 零数据触碰（append-only 纪律零妥协） |
   | mw-core 建议 | 若前置证明干净 → 可选 | **默认建议**（零锁零触碰 · typmod 收敛留 HYGIENE 后续刀） |

3. **status 枚举 CHECK**：
   - `ai_graph_run` `CHECK (status IN (§1.3 十一值))` —— 枚举**只增不改**（脏值检测 prove 先行 · P0/P2）；
   - `consumption_record` `CHECK (status IN ('reserved','confirmed','partial_confirmed','released'))`（镜像孪生 · D2）；
   - 其余无 CHECK status 列（interview 0001:21 · memory/ctx/checkpoint 族 0047/0093/0095/0099/0104/0107/0112/0115/0117 亲核清单）**本刀不动 · 登记台账**（非 MONEY3 行面 · 防刀面膨胀）。
4. **双重唯一索引删一**：0144 `ALTER TABLE interview_event DROP CONSTRAINT uq_interview_event_key_constraint`（保 0021 partial · §1.5 亲核使用面）；联动 L1（sql/01 fixture 对齐）+ L2（migrate.proof:307 契约更新）。
5. **（D4 裁定）settlement_ledger.units_settled `>= 0` CHECK**：一行成本补齐同族兜底（不入亦登记）。

---

## 4. Prove 设计（新 `packages/db/test/db-money3.proof.ts` · `pnpm db-money3:prove` · EXIT=0）

对隔离 PostgreSQL（`assertIsolatedTestTarget` + 增量迁移到 0144 · wiring 四点 L4 全落），全断言 PASS 才 EXIT=0：

| 块 | 断言 |
|----|------|
| P0 脏值检测先行 | 迁移后即跑 §3.1 同构检测（amount_cents<=0 / units 出域 / ai_graph_run.status∉枚举 / consumption_record.status∉枚举 各 count=0）+ **负样本注入自证**（临时注入脏行 → 检测函数如实报数 · 检出后才 DELETE 回滚 · 证明检测器本身非恒真） |
| P1 约束生效断言（catalog） | pg_constraint 具名存在：ck_payment_order_amount_cents_positive · ai_graph_run 枚举 CHECK · consumption_record 枚举 CHECK（+D4 若入）；`uq_interview_event_key_constraint` **不存在** · partial `uq_interview_event_key` **仍存在**；pg_indexes 上 (stream_key,event_key) 唯一结构恰 1 个 |
| P2 负值/脏值拒绝 | `amount_cents=-1` / `=0` INSERT → 23514；`units=-5`（及案A `1e10`→22003 落点回归 / 案B 源头 23514）；`ai_graph_run.status='runing'`（脏拼写）→ 23514；`consumption_record.status='bogus'` → 23514 |
| P3 三表回归（写路径真行为） | **payment_order**：createOrder+markOrderPaidAndCredit 全链绿（正数单 → paid → 发桶 credited · 幂等重放 already）；**entitlement_bucket**：reserve/confirm/release saga 绿（ck_bucket_capacity 不变量 · 22003 边界值 9999999999.99 可入 / 1e10 拒）；**interview_event**：appendEvent 带 eventKey 重复投递返回既有 seq（ON CONFLICT arbiter=partial · 约束已删零影响）· 无 eventKey 连写 N 行全成功 |
| P4 不变量回归 | ai_graph_run fencing：同 (graph_name,thread_id) 二条非终态 → 第二条 23505（uq_active_run 仍活）· 终态后新开 run 合法 · `succeeded`/`completed` 双终态并存写均过（Ban 收敛自证） |
| P5 sql/ fixture 对齐 | drift:prove 绿（L1 · sql/01 无该表级 UNIQUE · mig 路径同）· migrate.proof 更新后 :306/:307 双绿（L2） |
| P6 静态契约门 | 0144 文本（dollar-quote 感知切分）：语句白名单外**零**语句；零 UPDATE/DELETE/INSERT/DROP COLUMN/CREATE INDEX/TRIGGER/RLS/GRANT |
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

| ID | 议题 | mw-core 建议 |
|----|------|--------------|
| D1 | units 精度：案A ALTER TYPE（rewrite+typmod 硬约束）vs 案B CHECK-only（零触碰）——案A 含存量静默舍入风险，须 P0 前置证明 scale≤2 | **案B 默认**；若双审要求 typmod 对齐且前置证明全行干净，案A 可选 |
| D2 | consumption_record 枚举 = 镜像孪生 4 值（运行时零写点亲核）vs 仅 ('reserved') | **镜像 4 值**（同族语义 · 死表生死归 HYGIENE 刀不在此裁） |
| D3 | 双重唯一删 0027 约束保 0021 partial（ON CONFLICT 实际 arbiter 亲核）vs 反向 | **删 0027 保 0021**（使用面+NULL 行零索引成本双优）· 联动 L1/L2 必落 |
| D4 | settlement_ledger.units_settled `>=0` CHECK 入 0144 vs 登记 | **入**（一行成本 · 同族兜底齐） |
| D5 | amount_cents int→bigint：本刀不动（容量够 · 升级=rewrite）· 规范层新表 bigint | **不动 · 豁免入档** |
| D6 | ai_graph_run 枚举 11 值（含 migrating/paused 无写点词表值 + quarantined 谓词值） | **按词表全收**（枚举只增不改 · 漏收即脏值误拒合法演进） |

---

## 7. Acceptance（EXEC 后验收）

| ID | Criterion |
|----|-----------|
| A1 | 0144 仅白名单语句（P6 绿）· 0001–0143 checksum 零漂移（migrate:prove 绿） |
| A2 | `db-money3.proof.ts` EXIT=0（P0–P7 全 PASS · attempts 全账） |
| A3 | 负值/脏值 23514 拒绝 + uq_active_run 不变量 + appendEvent 幂等回归全绿（P2–P4） |
| A4 | drift:prove 绿（L1）· migrate.proof:307 更新后绿（L2） |
| A5 | `money-convention.md` 落地（三轨映射表 + bigint 分单位 + 后缀约定 + 豁免登记） |
| A6 | 台账 MONEY3 行按流程勾销（post-dual + meetwise 授权后）· 他行零触碰 |
| A7 | pins 全保留（§首行 · 无一翻转） |

---

## 8. 流程与产物

**流程**：REQUEST（本档）→ 预执行双审（`mw-model-op` + `mw-e2e-ha`）→ **meetwise 授权** → EXEC（0144 + fixture 对齐 + prove wiring + 规范文档）→ post-prove 双审 → **meetwise 授权 nail**。

**EXEC 文件面（预告 · 本 turn 不动）**：

| 文件 | 动作 |
|------|------|
| `packages/db/migrations/0144_money_status_constraints.sql` | 新增（前置脏值检测 DO 块 + 正数 CHECK + 2 枚举 CHECK +（D4）+ DROP CONSTRAINT +（D1 案A 时）ALTER TYPE） |
| `packages/db/sql/01_schema.sql` | 对齐 interview_event（表级 uq_event_key 约束 → 0021 同形 partial index · L1） |
| `packages/db/test/db-money3.proof.ts` | 新增 prove（P0–P7） |
| `packages/db/test/migrate.proof.ts` | :307 断言契约更新（L2） |
| `package.json` + `packages/db/package.json` + `scripts/run-e2e-isolated.mjs` | `db-money3:prove` wiring（四注册点 · L4） |
| `ai-docs/architecture/backend/money-convention.md` | 新增（§2 规范 · id-convention 同级） |

---

## Non-claims

Not HA · not suite green · not SLO/性能量化声明 · not 存量数据修复 · not 业务语义变更 · not RLS/触发器/secrets 面 · not amount_cents 升 bigint · not 死表下线（consumption_record 归 HYGIENE）· not coding authorized（Dual PASS ≠ 开工）· not 覆盖任何 e2e 门（coveredCount=8 不变）· `releaseEvidence=false` · `actualSpendCny=null`。

---

*Harness · DBM3-1 钱三轨 + 约束治理刀 REQUEST · 2026-10-07 · draft:awaiting_pre_exec_dual · parent `48dee7a2` · docs-only · pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · Dual PASS ≠ 开工 · Ban self-approve*

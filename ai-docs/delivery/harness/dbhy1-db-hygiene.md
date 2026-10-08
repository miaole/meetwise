# Harness — **DBHY-1** · GAP-DEBT-DB-HYGIENE 卫生刀（死表/sql/ 双真相/qbank 分区生命周期/jsonb 路线图 · REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual`**（本 turn docs-only · REQUEST 编写完成即停 · **未授权 EXEC** · zero coding / zero migration / zero prove）
**Rev**: **rev2**（双审 FAIL 修订·唯一项：sql/ 退役清单漏 3 真依赖方+_neg-harness 真加载器·P3 门失明 → 清单 15→18 处·P3 改全代码面文件名模式 grep·0144 让位序协调方裁定（DBTF-1 已 EXEC 占 0144 → 本刀 0145+0146）·consumption_record 让位 DBM3-1 裁定入卷 · rev1 = `f4f320cd` · 落卷 mw-core）
**Date**: 2026-10-07
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（stays） · g7SuiteGreen=false · actualSpendCny=null
**Experts**: `mw-model-op` + `mw-e2e-ha`（pre-exec 双审 · 本 REQUEST 只送审 · **Ban self-approve** · **Dual PASS ≠ 自动开工** · 须 meetwise 明示授权才进 EXEC）
**Slice**: `../dbhy1-db-hygiene.slice.md`
**Authority**: 债行在卷 `ai-docs/delivery/gap-bug-backlog.md:878`（GAP-DEBT-DB-HYGIENE · P1 · OPEN · 拟切片「多刀」· 本刀=其首刀）· W1 盘点（`post_prove_dual_pass` @ `675269c`）+ W1b 批次（`post_prove_dual_pass` @ `c378943`）早已言明「retire coding only after separate prove + authorize」——**本刀即那个 separate knife 的 REQUEST**，不构成 W1/W1b 闭面重开
**Parent tip**: `48dee7a2`（branch `line/db-hygiene` · base `origin/feat/mysql-schema-skeleton` @ `48dee7a2` · fetch 后 ff 已核同步）
**Honesty**: 本 REQUEST 全部清单为 mw-core 在 `48dee7a2` 上亲核（grep/逐文件逐行读迁移与消费方），非 AI 凭记忆；四处「零生产写入/零引用」断言均给出可复核的检索口径（§1 各节）。**rev2 教训如实入卷**：rev1 消费方清单以 `db/sql` 字面 grep 为口径，漏掉 `_neg-harness.ts` 模板路径加载（`packages/db/${dir}/${f}`·dir='sql'）与 `.mjs` 工程面（云测拷贝/manifest 点名）——被双审 FAIL 唯一项点名；rev2 已逐文件补核并把 P3 门改为全代码面文件名模式 grep（§5）

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **本刀是什么** | DB 卫生四件套的 REQUEST：① 死表（`app_setting`/`consumption_record`）处置两案；② `packages/db/sql/` 双 schema 真相退役计划（rev2 三案·18 处消费方·proof 直跑迁移）；③ qbank retired 代存储清理例程设计（DETACH+DROP 评估·与 G-R4-5 已闭面关系声明）；④ jsonb 万能口袋老表渐进拆表路线图（**不本刀做**·只立规范+deprecated 标注） |
| **本刀不是什么** | **不是** 本 turn 编码（写完即停）· **不是** 历史迁移改写（0001–0143 一字不动·处置一律走新迁移）· **不是** G-R4-5/W1/W1b/dbid1 已闭面重开 · **不是** qbank serving/检索面变更 · **不是** MySQL/Qdrant 叙事重开 · **不是** HA/suite green · **不是** 隐私擦除闭包（GAP-DEBT-DB-NOFK 另刀） |
| **范围切割（诚实）** | 债行五项中：死表下线 ✓（本刀）· sql/ 删除 ✓（本刀计划+EXEC）· 分区清理例程 ✓（本刀设计+EXEC 落函数）· 0023-0027 reconcile 补丁族 ✗（历史事实已闭·不追溯重写·仅登记）· 老 jsonb 渐进拆 ✗（本刀只立规范+标注·拆表另刀） |
| **现在** | `draft:awaiting_pre_exec_dual` · docs-only · 等双审 + meetwise 授权 |

---

## 1. 审计现状（亲核 @ `48dee7a2`）

### 1.1 死表域

| 表 | 出生 | 现状（亲核口径） | 判定 |
|----|------|------------------|------|
| `app_setting` | `0002_app_setting.sql`（自述「增量迁移示范：CREATE IF NOT EXISTS 可重跑」）+ `0003`（示范 ALTER ADD COLUMN） | 全库 grep `app_setting`（*.ts/*.sql）：仅命中迁移本体 2 文件 + `packages/db/test/migrate.proof.ts`（:223 DROP 冒烟·:397 列存在断言·:399-402 幂等数据保留断言）。**业务代码（packages/db/src · apps/api/src · apps/worker/src）零引用零读写** | 示范迁移进产：教学样本成了生产表 |
| `consumption_record` | `0001_baseline.sql:47`（id uuid · owner_user_id · idempotency_key · interview_id · status · `uq_consumption_idem(owner_user_id,idempotency_key)`） | 生产写入面：**0 处**（grep 全 src 无 INSERT/UPDATE）。消费面仅测试：`packages/ai-runtime/test/runtime-kernel.proof.ts:78`（INSERT 幂等冒烟）· `apps/api/test/privacy-erasure-http.proof.ts:290/:334`（SELECT count 断言逃逸=0）· `apps/worker/test/online-judge-control-plane.proof.ts:87/:238`（SELECT count 业务隔离断言）· `packages/db/test/db-id-v7.proof.ts:38`（dbid1 catalog 行）· `packages/db/proof/primitives.sql`（自带 DROP+CREATE 本地副本·不依赖迁移建的表） | 零生产写入仅测试 count：幂等语义真身已是 `entitlement_consumption`（0001:109 · `uq_entitlement_consumption_idem` 同形 · 生产写路径 `packages/db/src/commerce.ts`） |

**要点**：两表删除（案A）不影响任何生产路径；所有触碰面都在测试/证明文件里，且 `migrate.proof.ts` 对 `app_setting` 的断言本身就是「示范迁移如何工作」的自证——表死则示范须换真对象。

### 1.2 sql/ 双 schema 真相域

| 事实 | 证据（亲核） |
|------|--------------|
| 双真相结构 | `packages/db/sql/`（25 个 .sql 域文件·DROP+CREATE 重放型·自述「内核演示 schema」）vs `packages/db/migrations/`（144 个版本化增量·runMigrations 记 `schema_migrations`）。`scripts/schema-drift-check.mjs`（`pnpm drift:prove`）头部自述：**「版本化 migrations 才是 fresh deploy 的唯一真相；sql/ 是兼容镜像，不能用于生产/发布/当前 E2E 结论」** |
| 曾炸史 | `0019_schema_drift_reconcile.sql` 自述：sql/15_audit、sql/16_feedback 在 0001_baseline（只拼到 sql/14）之后新增、learning_progress/user_account.is_admin 漂移出基线、**均无配套迁移 → fresh deploy 缺表缺列 → admin 审计/题目反馈/学习进度端点 500**；本迁移把它们补进迁移路径 |
| 十月仍在双写 | `bb97e837`（2026-10-03 · GAP-UC025-NEG-01 真接线）同时改 `sql/20_resume_quiz.sql`（+expires_at 列）与新增 `0135_resume_quiz_freshness_anchor.sql`，0135 注释自认「新库经 sql/20 重放镜像得同列——两类库都必须拿到锚点列」——**每次 schema 演进都在付双份成本，且 sql/ 侧是 DROP+CASCADE 型（`20_resume_quiz.sql:4`），重放即毁数据** |
| 消费面（rev2 亲核逐文件分类·18 处） | **真加载器/依赖方 18 处**：① `.ts` 直读 14 个（readFileSync/sql() 助手实读）：ai-runtime proofs ×6（runtime-kernel · model-cost-governance · claim-join-orphan · estimate-threading-invoke · usage-calibration-reconciler · failover-price-policy，均 `01_schema.sql`）· apps/api ×3（`validate.ts` 拼读 16 文件+`23_api_gateway` · `neg-bend.proof.ts` · `uc-e2e-025-nhp-bound.proof.ts` 读 `20_resume_quiz.sql`）+`uc-e2e-028-nhp-fault.proof.ts` 读 `01_schema.sql` · apps/worker ×3（`smoke/rag-demo.ts` · `qbank-ingest.proof.ts` · `adaptive-latency.proof.ts`）· packages/db ×1（`vectorstore.proof.ts` 以 sql/ 目录为工作目录跑全量）；② **`apps/api/test/_neg-harness.ts:61-70`（rev2 补·rev1 漏网）**：模板路径加载器 `packages/db/${dir}/${f}`（dir 默认 'sql'·字面 grep `db/sql` 天然打不中）——**整载 22 个 sql 文件+`23_api_gateway.sql`**+4 个迁移，承载 neg 族（uc-e2e-025-adv/bound/fault 等）命脉；rev1 把 `uc-e2e-025-nhp-adv.proof.ts` 误分类为「仅注释」实为经 harness import 的间接真消费方；③ **`scripts/build-cloud-test-fc.mjs:28`（rev2 补）**：`cp(packages/db/sql → 云测函数包/sql, recursive)` 整目录拷贝（其后 `appendDirectoryDigest` 亦对 sql/ 目录求 digest）——退役不改则云测构建断；④ **`scripts/run-e2e-isolated.mjs:155/:176/:188-189`（rev2 补）**：isolated prove 的文件 manifest 数组点名 `packages/db/sql/01_schema.sql`（:155）· `sql/20_resume_quiz.sql`（:176 uc025:nhp-fault · :188 uc025:nhp-adv）· `sql/02_commerce.sql`（:189）——退役不摘则 manifest 校验红；⑤ `scripts/schema-drift-check.mjs`（drift 门本体·第 18 处）。**仅注释提及**（已用迁移·不需改）：interview/memory/report-bulkhead 三 proof 的注释文本 |
| 门的自省 | drift:prove 只防「sql/ 有、迁移缺」这一个方向（会打断 fresh deploy 的方向）；反向（迁移独有）仅提示兼容镜像落后。**门存在本身=双真相的常态化**；测试注释已出现「禁止用 sql/ 影子 schema 伪造通过」（interview.proof.ts）·「旧兼容样本」（memory.proof.ts）·「绕过当前 privacy trigger/RLS」（report-bulkhead.proof.ts） |

### 1.3 qbank 分区无界膨胀域（亲核 `0029_qbank_generation_hybrid_retrieval.sql` 全文）

- **每代一物理表**：`qbank_generation_chunk` 为 `PARTITION BY LIST (generation_id)`（0029:138-146）；`qbank_prepare_generation_partition()`（0029:186-209）为每个 building 代建分区 `qbank_generation_chunk_<uuid32>` + **独立 HNSW partial index `qgc_hnsw_visible_<uuid32>`**（`USING hnsw (embedding vector_cosine_ops) WHERE visible`）。
- **retired 只翻状态不释放**：`qbank_activate_generation()`（0029:341-364）把旧 active 代 `state='retired'` 后仅此而已——**全库 grep `DETACH`/分区清理：0 处**（唯一 retiring→retired 状态机在 memory 侧 `memory_retire_generation_window`，且也无存储释放）。每次语料重灌 = 新分区 + 新 HNSW 永久落盘，旧代向量存储**无界累积**（含 failed 代的半成品分区）。
- **DELETE 路径被触发器焊死**：`trg_qbank_generation_chunk_only_building`（0029:158-184）对非 building 代的行 DELETE 抛 `check_violation`——**行级清理不可能**，这正是 DETACH+DROP 评估的技术根据（DETACH PARTITION + DROP TABLE 不逐行触发 row trigger，HNSW 索引随表自动落）。
- **回滚语义已在状态机里自然给出清理判据**：`qbank_activate_generation` 要求 `snapshot_epoch = 当前 corpus_epoch` 否则抛 `serialization_failure`（0029:354）——**一旦 corpus_epoch 前进，retired 代的回滚价值在数据库层面已经死亡**，其物理存储是纯冗余。
- **元数据行必须保留**：`qbank_vector_generation` 行（state/时间戳/failure_reason）是发布审计面，清理例程只释放存储、不抹历史。

### 1.4 jsonb 万能口袋老表域（本刀只标注不拆）

| 列 | DDL | 生产读写现状（亲核） |
|----|-----|----------------------|
| `interview.questions` jsonb `DEFAULT '[]'` | 0001:24（注释「押题生成的题目」） | **写入 0 处**（INSERT 列清单不含·全库无 `UPDATE … SET questions`）；唯一读点 `apps/api/src/modules/interview/interview.service.ts:737`（transcript 转写路径 `SELECT questions FROM interview WHERE id=$1`）；legacy 固定题单生命周期已退役（`interview-lifecycle.ts:14` `legacy_interview_lifecycle_retired`）· 后继结构 `interview_question`（0021）已在产 |
| `assessment_report.dimensions` jsonb `DEFAULT '[]'` | 0001:341（注释 `[{dimension, score, gap:bool, evidence:[]}]`——结构化实体塞口袋） | 有读写（评分报告聚合面） |
| `learning_plan.items` jsonb `DEFAULT '[]'` | 0001:383 | 有读写（学习计划条目） |
| `career_path.milestones` jsonb `DEFAULT '[]'` | 0001:433 | 有读写（职业路径里程碑） |

四列共同病：无 schema 约束（CHECK 只能浅防）· 无法 FK/索引到元素级 · 隐私擦除闭包只能整列盲处理 · 每次消费都全量解析。

---

## 2. 死表处置两案（决策点 D1/D2 · 交双审）

**总原则（两案共用）**：历史迁移 0001–0143 **一字不改**（migrate.proof 的 checksum 链·Ban 历史迁移改写）；一切处置走**新迁移 0145**（让位序见下）。

**迁移号让位序（协调方 rev2 裁定·按 EXEC 就绪序防三刀撞号）**：**DBTF-1 已 EXEC 占 0144 → DBHY-1（本刀）顺延 0145+0146 · DBFK-1 顺延 0147+0148 · DBM3-1 顺延 0149**。本刀两迁移域切分：**0145 = 死表处置+jsonb deprecated 标注+sql/→migrations 承载声明头** · **0146 = qbank 分区生命周期（storage_released_at 列+清理例程函数）**。诚实注记：本分支 base `48dee7a2` 止于 0143（且 0143 双文件并存·dbid1 与 sse-push 各一·runner 以全文件名为 version 无冲突），DBHY-1 EXEC 时须先与 DBTF-1 的 0144 汇流（rebase/merge）再落 0145。

### 2.1 `app_setting`

| 案 | 内容 | 代价/风险 |
|----|------|-----------|
| **A（mw-core 建议）· drop migration** | 新迁移 `0145`（死表域·名 EXEC 定）：`DROP TABLE IF EXISTS app_setting CASCADE;`（无依赖对象·亲核零引用故 CASCADE 为空放大）。`migrate.proof.ts` 的示范断言组（:223/:397/:399-402）改挂真表（用临时 `mig_t*` 示范对象或 `schema_migrations` 本身演示增量语义） | 示范叙事从「真业务表」退到「测试对象」——如实说：这本来就是它唯一真实身份。fresh deploy 不再产死表 |
| **B · 保留+deprecated 标注** | 同迁移改 `COMMENT ON TABLE app_setting IS 'DEPRECATED: demo-only table from 0002/0003 era; no production read/write; candidate for removal'` + 在 id-convention/schema 规范登记 | 零风险但死表继续在产占心智（新人会当配置表用）；债复发 |

### 2.2 `consumption_record`

| 案 | 内容 | 代价/风险 |
|----|------|-----------|
| **A'（mw-core 建议）· drop migration + 测试改查真表** | 同一 `0145`：`DROP TABLE IF EXISTS consumption_record CASCADE;`。测试面同步改造（**先改测试再落迁移**，同一 EXEC 批次）：① `runtime-kernel.proof.ts:78` 幂等 INSERT 冒烟改打 `entitlement_consumption`（同形 `uq(owner_user_id,idempotency_key)`·语义即其真身）；② `privacy-erasure-http.proof.ts:290/:334` 与 `online-judge-control-plane.proof.ts:87/:238` 的 count 断言改查 `entitlement_consumption`（列名对齐 `interview_id` 需核——若真表无该列则改断言为对 `interview_event`/业务真表的既有断言组合，EXEC 时以实际列为准登记）；③ `db-id-v7.proof.ts:38` catalog 行删去该表；④ `packages/db/proof/primitives.sql` 自建本地副本**不动**（它 DROP+CREATE 自己的表·与迁移路径无关·保留为 SQL 原语示范）。**让位序（协调方 rev2 裁定·两刀 rev2 一并落）**：DBHY-1 DROP 先行——DBM3-1（GAP-DEBT-DB-MONEY3·顺延 0149）从其迁移面**摘除 consumption_record 的 CHECK 项**，不在将死表上叠新约束 | 三处测试改造是行为面变更（断言对象换真表），须逐条 prove 重跑；语义更真（现在测的是「死表没被碰」，改后测「真计费面没被误碰」——更接近原意）。跨刀时序：DBHY-1 与 DBM3-1 若并行 EXEC，以本刀 0145 DROP 为准序（DBM3-1 面摘除后才可各自绿） |
| **B' · 保留+deprecated 标注** | COMMENT 标注 + 测试维持现状（测死表） | 测试继续为死表站台；dbid1 已把它写进 55 表 catalog 断言，债滚雪球 |

**交双审点**：A/A' 的测试改造清单是否完备（亲核口径 §1.1）；案 B 族是否有人主张保留语义（如未来真要 app 配置表）——若有，建议走「drop 后将来按需新表」而非留尸。

---

## 3. sql/ 目录退役计划（决策点 D3 · 两案）

### 3.0 前置事实

- **migrations 已是超集**（drift:prove 门长期绿的语义）：sql/ 的列/约束迁移路径全覆盖（0019 补齐后）；20_resume_quiz 的十月内容（expires_at）已由 0007+0135 完整承载。
- **20_resume_quiz 内容并入 migrations 声明** = 不需要任何新 DDL：在 0145 迁移头部注释 + 本 REQUEST §3.2 表格声明「`sql/20_resume_quiz.sql` 全部内容（含 expires_at 锚点）由 `0007_resume_quiz` + `0135_resume_quiz_freshness_anchor` 承载」；同理逐文件声明 25 个 sql 文件 → 迁移承载清单（§3.2）。
- 退役 = 删除 `packages/db/sql/` 目录 + 删除 `drift:prove` 门（其「B 侧真相源」消失，门失去对象）+ **18 处消费方**（§3.2 rev2 清单）全部改走 `runMigrations`。

### 3.2 消费方迁移清单（EXEC 批次 · **rev2 扩至 18 处**）

| # | 消费方 | 现状 | 改造 |
|---|--------|------|------|
| 1 | `scripts/schema-drift-check.mjs`（drift:prove） | 双库 diff 门 | **退役**，替代者=§5 fresh-deploy prove（单真相自证）· root package.json 删 script |
| 2 | `apps/api/test/validate.ts` | 拼读 16 文件+23 | 改 `loadMigrations(migrations/)`+`runMigrations`（已有公开导出 `packages/db/src/index.ts:295`） |
| 3-8 | ai-runtime proofs ×6（runtime-kernel · model-cost-governance · claim-join-orphan · estimate-threading-invoke · usage-calibration-reconciler · failover-price-policy） | 各自 `sql('../../db/sql/01_schema.sql')` | 同上改迁移前缀（多张 ai_cost 族表本就只在迁移里·01_schema 镜像反而缺它们——改后断言面更真） |
| 9 | `apps/api/test/neg-bend.proof.ts` | 拼读 | 同上 |
| 10 | `apps/api/test/uc-e2e-025-nhp-bound.proof.ts` | 读 `20_resume_quiz.sql` | 改迁移（0007+0135 前缀） |
| 11 | `apps/api/test/uc-e2e-028-nhp-fault.proof.ts` | 读 `01_schema.sql` | 同上 |
| 12 | `apps/worker/smoke/rag-demo.ts` | 拼读 | 同上 |
| 13 | `apps/worker/test/qbank-ingest.proof.ts` | 拼读 | 同上 |
| 14 | `apps/worker/test/adaptive-latency.proof.ts` | 拼读 | 同上 |
| 15 | `packages/db/test/vectorstore.proof.ts` | 以 sql/ 目录为工作目录 | 改「迁移全量跑完后的库」作工作对象（assertIsolatedTestTarget 前缀已具备） |
| 16 | **`apps/api/test/_neg-harness.ts:61-70`**（rev2 补） | 模板路径加载器（`packages/db/${dir}/${f}`·dir='sql'）整载 **22 文件+`23_api_gateway.sql`**+4 迁移·承载 neg 族命脉（uc-e2e-025-adv/bound/fault 等经 import 间接依赖） | 加载路径同步迁 `runMigrations` 前缀（种子 INSERT 逐域核对·B 端 17/18/22 的显式 DROP 清理逻辑随迁移前缀消解为「库已由 runner 干净重建」）；**或**（若 neg 族改造面超本刀预算）sql/ 保留至 neg 迁移另刀——见 D3 案B' |
| 17 | **`scripts/build-cloud-test-fc.mjs:28`**（rev2 补） | `cp(packages/db/sql → 云测函数包/sql, recursive)` 整目录拷贝（+其后 `appendDirectoryDigest` 对 sql/ 求 digest） | 停拷 sql/ 目录（云测包只带 migrations/·digest 面同步摘除）·云测 prove 重跑绿 |
| 18 | **`scripts/run-e2e-isolated.mjs:155/:176/:188-189`**（rev2 补） | isolated prove 文件 manifest 数组点名 `sql/01_schema.sql`（:155）· `sql/20_resume_quiz.sql`（:176/:188）· `sql/02_commerce.sql`（:189） | manifest 点名逐条改为对应迁移文件（01_schema→迁移前缀整体 · 20→0007+0135 · 02→commerce 迁移族）·isolated prove 重跑绿 |

（表内「拼读」文件清单 = validate.ts:58 的 16 文件 + 23_api_gateway + rag-demo/qbank-ingest 各自的域文件列表·EXEC 时逐一对号。）

### 3.3 两案（rev2 增案B'）

| 案 | 内容 | 代价/风险 |
|----|------|-----------|
| **A（mw-core 建议）· 单刀一步退役** | 一个 EXEC 批次完成：**18 处消费方**全改造（含 _neg-harness 加载路径迁移·云测拷贝停运·manifest 点名替换）+ 删 sql/ 目录 + 删 drift:prove + 0145 头部声明承载清单 + §5 prove 全绿（含 fresh deploy 重建） | 改动面大（18 文件·neg harness 种子逐域核对最重）但全部是测试/脚手架·零生产代码；一次性消灭双真相·十月式双写成本立即止血 |
| **B · 两步退役** | 第一步：冻结（drift 门反向加严：sql/ 文件 hash 锁定·禁改）+ 高频消费方（validate/vectorstore）先迁；第二步（下刀）：余下迁移+删目录 | 多一刀流程成本；冻结期内 schema 演进仍需过冻结门（或临时豁免·又开洞） |
| **B'（rev2 增）· neg 族让刀** | 案A 面上**剔除 #16**：sql/ **保留至 neg 迁移另刀**（_neg-harness 整载面单独一CHAPTER刀处理）·其余 17 处照迁·drift:prove 改为「仅守 #16 已知残留」收缩门 | 双真相多活一刀周期；但 neg 族（承载 uc025 证明命脉）改造风险与主退役解耦·不阻塞止血主体 |

---

## 4. qbank retired 代清理例程设计（决策点 D4 · EXEC 落函数）

### 4.1 新函数 `qbank_release_retired_generation_storage(p_generation text) RETURNS void`（独立 `0146`·与 0145 死表域分刀落）

```sql
-- 守卫（全部 fail-closed）：
-- 1) 仅 __system_qbank__（与 prepare/validate/activate 同一权限面）
-- 2) 目标代 state IN ('retired','failed')（building/validated/active 一律拒绝）
-- 3) 目标代 ≠ qbank_active_generation 当前指针（双保险·state 守卫已含 active）
-- 4) source_epoch < 当前 qbank_corpus_epoch.epoch —— corpus 已前进，回滚在 DB 语义层已死
--    （activate 本会抛 serialization_failure·0029:354；此判据把「回滚窗口自然关闭」定为释放前置）
-- 5) storage_released_at IS NULL —— 幂等防重复释放
-- 动作：
--   ALTER TABLE qbank_generation_chunk DETACH PARTITION qbank_generation_chunk_<suffix>;
--   DROP TABLE qbank_generation_chunk_<suffix>;        -- HNSW 索引随表自动落·不逐行触发 row trigger
--   UPDATE qbank_vector_generation SET storage_released_at=clock_timestamp() WHERE id=p_generation;
--   （元数据行保留：state/failure_reason/时间戳为发布审计面·永不抹）
```

- **配套列**：`ALTER TABLE qbank_vector_generation ADD COLUMN IF NOT EXISTS storage_released_at timestamptz;`（非破坏·与 0135 同姿势）。
- **分区名派生**：复用 prepare 的确定性规则（`replace(substr(id,6),'-','')`·0029:201）·不信任任何请求参数作 identifier。
- **不做自动调度**：本刀只落手动例程函数（运维以 `__system_qbank__` 身份调用）；自动.retention 策略（如 retired 满 N 天自动释放）留后续刀——避免本刀引入后台任务面。
- **failed 代**：同样可释放（半成品分区纯垃圾）；守卫 2 已含。

### 4.2 与 G-R4-5 已闭面的关系声明（硬）

- 本例程**不碰**：`qbank_generation_ann_search`/`lexical_search`/`evidence`/`distances` 四检索函数 · active 代及其分区与 HNSW · `qbank_route_scope_cache`（0113）· track local serving scope（0106）· retrieval cache epoch 语义（0022/0023/0024）。
- 释放只发生在「retired/failed + corpus 已前进 + 非 active」三重守卫内的**死存储**上；G-R4-5 闭面（`gR45Closed=true` · `coveredCount=8`）**不因此重开、不因此加成、不重述**——本刀 Non-claims 明示。
- prove 侧以负门保护：释放例程跑完后，active 代 ann_search 结果不变（§5 P5）。

---

## 5. Prove 设计（新 `packages/db/test/dbhy1.proof.ts` · `pnpm dbhy1:prove` · EXIT=0 · 对隔离 PG）

| 块 | 断言 |
|----|------|
| P1 死表退役 | catalog：`app_setting`/`consumption_record` `to_regclass` 为 NULL（案A）/ 或 COMMENT 含 DEPRECATED（案B·以双审裁定案为准）· 全库静态 grep：两表名在 `packages/*/src`+`apps/*/src` 出现 0 处（`packages/db/proof/primitives.sql` 本地副本豁免·登记） |
| P2 迁移链完整性 | `migrate.proof.ts`（改造后）全绿：示范断言组改挂新对象后增量语义（乱序/幂等/只跑新增/checksum 不改历史）逐条 PASS · **0145/0146 之前全部历史迁移 checksum 与改造前一致**（亲核基线入卷·含与 DBTF-1 0144 汇流后的序核） |
| P3 sql/ 退役（**rev2 门升级：全代码面文件名模式 grep·堵模板路径盲区**） | ① `packages/db/sql` 目录不存在；② **全代码面静态门**——不限于 `.ts`，对**全部文本代码文件**（`.ts`/`.mjs`/`.js`/`.json`/`.yml`/`.yaml`/`Dockerfile*`/`package.json` scripts 等）按**文件名与路径模式**grep：字面 `packages/db/sql` · `db/sql/` · **模板路径形态 `packages/db/${dir}`、`db/${dir}/${f}`、`sql/${f}`（rev1 盲区·_neg-harness 教训）** · manifest 字符串点名（`sql/01_schema.sql`/`sql/02_commerce.sql`/`sql/20_resume_quiz.sql`/`sql/23_api_gateway.sql` 等 25 文件名逐一）——命中仅允许登记豁免清单（`packages/db/proof/primitives.sql` 本地副本自建·历史 CHANGELOG/收据/harness 文档的叙事文本·注释），否则红；③ §3.2 **18 处**消费方各自原有断言面在迁移前缀下全绿（逐文件跑账入 attempts·neg 族含 uc-e2e-025-adv/bound/fault 三 proof 重跑） |
| P4 fresh deploy 重建（runner 实测） | **空库 → `loadMigrations(migrations/) → runMigrations`**（真 runner·非 psql 拼）：① `schema_migrations` 计数 = 迁移文件数（0146 后·亲核数入卷·含 DBTF-1 0144 汇流）② 抽查 catalog：`resume_quiz.expires_at` 存在（0007+0135 链·对 sql/20 退役的替代证明）· `admin_audit`/`question_feedback`/`learning_progress`/`user_account.is_admin` 存在（0019 语义回归·对当年炸史的封口断言）③ 死表不存在（案A） |
| P5 qbank 清理例程（若 EXEC 含 §4） | 隔离库建 fake 语料与两代：gen1 active→gen2 激活后 gen1 retired·corpus_epoch 前进 → 调 `qbank_release_retired_generation_storage(gen1)`：gen1 分区 `to_regclass` NULL·`qbank_vector_generation` gen1 行仍在且 `storage_released_at` 非空·**gen2（active）ann_search 结果与释放前一致**；负门：对 active 代调用 → 异常·对 building 代调用 → 异常·二次调用（幂等门）→ 异常·非 `__system_qbank__` 调用 → `insufficient_privilege` |
| P6 deprecated 标注（若含 §6） | `pg_description`：四 jsonb 列 + （案B 时两死表）COMMENT 含 `DEPRECATED` 与指向路线图的锚文本 |

**纪律**：EXIT=0 一次过；**attempts 全账**（每次运行无论红绿都记录）；**Ban retry-to-green**（红后修因重跑须留痕说明）。

---

## 6. jsonb 老表渐进拆表路线图（**不本刀做拆表**·只立规范+标注 · 决策点 D5）

### 6.1 本刀交付（EXEC 面）

1. **规范冻结**：`ai-docs/architecture/backend/id-convention.md` 同级新增（或并入）schema 规范节「jsonb 使用边界」：新表**禁** jsonb 作结构化实体口袋（元素级可查/可 FK/可擦除的数据必须建子表+复合 FK）；jsonb 仅限不透明诊断 blob / 图产物快照（如 `resume_quiz.report`·终结记录·不可查）。四老列登记为例外存量。
2. **deprecated 标注**（进 0145）：`COMMENT ON COLUMN interview.questions/assessment_report.dimensions/learning_plan.items/career_path.milestones IS 'DEPRECATED (jsonb pocket): see GAP-DEBT-DB-HYGIENE roadmap — successor pattern = child tables (cf. interview_question @0021); do not add new consumers'`。

### 6.2 路线图（后续独立刀 · 本刀只立卷）

| 阶段 | 内容 | 备注 |
|------|------|------|
| P0（本刀） | 规范+标注 | — |
| P1 | `interview.questions` 先行：生产零写入（§1.4 亲核）·唯一读点 transcript:737 改读 `interview_question` 后即列死 | 最小风险打样 |
| P2 | `assessment_report.dimensions` → 子表（dimension/score/gap/evidence 四列）·读路径切换 | 评分聚合面（0100/0103）配合 |
| P3 | `learning_plan.items` · `career_path.milestones` 同型拆 | — |
| P4 | 列退役（ADD COLUMN 路线的逆走·新迁移） | 每步独立 REQUEST+双审 |

---

## 7. 硬 Ban（EXEC 期同样有效）

1. **Ban G-R4-5 已闭面重开**：不碰检索四函数/active 代/serving scope/cache epoch；`gR45Closed=true`·`coveredCount=8` 不重述不加成。
2. **Ban 历史迁移改写**：0001–0143（含 0019/0029/0135·含 sql/ 镜像史的任何「回填式修正」）一字不动；migrate.proof checksum 链不破。
3. **Ban secrets / 真实数据入树**。
4. **Ban 本 turn 编码**（REQUEST 写完即停；EXEC 须双审 PASS + meetwise 明示授权）。
5. **Ban 触发器/函数族改动**（GAP-DEBT-DB-TRIGFAM 另刀·本刀只新增不重抄）。
6. **Ban 自动后台清理调度**（§4 只落手动例程）。
7. **Ban 把 sql/ 退役叙述成 MySQL/Qdrant 重开**（PG-retained 不动）。
8. **Ban W1/W1b 闭面重开**（本刀是 W1b 预告的 separate knife·非重开）。

---

## 8. 决策点（请双审裁定）

| ID | 议题 | mw-core 建议 |
|----|------|--------------|
| D1 | `app_setting`：案A drop vs 案B 保留+标注 | **A**（drop·零业务面·示范改挂测试对象） |
| D2 | `consumption_record`：案A' drop+测试改真表 vs 案B' 保留+标注 | **A'**（drop·三处测试改查 `entitlement_consumption`·`primitives.sql` 本地副本不动·**让位序：DBM3-1 摘除该表 CHECK 项——协调方 rev2 裁定两刀一并落**） |
| D3 | sql/ 退役：案A 单刀一步（18 处）vs 案B 两步冻结 vs 案B' neg 族让刀（#16 留另刀·17 处照迁） | **A**（18 处全测试/脚手架·零生产代码·一次止血；若双审判 #16 neg harness 改造面超预算则降 B'） |
| D4 | qbank 清理例程：本刀 EXEC 落函数（独立 0146·DBTF-1 已占 0144/本刀死表域 0145）vs 仅设计留卷 | **本刀落**（三重守卫+元数据保留+P5 负门齐备·风险面收敛） |
| D5 | jsonb：本刀仅规范+四列标注（拆表另刀） | **确认**（P1 先行 `interview.questions` 入路线图） |

---

## 9. Acceptance（EXEC 后验收）

| ID | Criterion |
|----|-----------|
| A1 | **0145+0146**（让位序：DBTF-1 已 EXEC 占 0144 → 本刀顺延·协调方 rev2 裁定）落盘：0145=死表处置（按裁定案）+四 jsonb 列 COMMENT（若 D5=确认）+承载声明头；0146=`storage_released_at` 列+清理例程函数（若 D4=落）；P2 checksum 链不破 |
| A2 | `dbhy1.proof.ts` EXIT=0（P1–P6 按裁定面 · attempts 全账） |
| A3 | sql/ 目录删除 · **18 处**消费方改造后各自 prove/冒烟全绿（neg 族三 proof 在内·若 D3=B' 则 17 处+#16 登记另刀）· drift:prove 退役 |
| A4 | fresh deploy 重建 runner 实测绿（P4 三组断言） |
| A5 | 生产代码零改动面如实登记（本刀 EXEC 面 = 测试/脚手架/迁移/文档·apps+packages 的 src 目录 diff=0 除 id-convention 等文档） |
| A6 | pins 全保留（§首行 · 无一翻转） |

---

## 10. 流程与产物

**流程**：REQUEST（本档 rev2）→ 预执行双审（`mw-model-op` + `mw-e2e-ha`）→ **meetwise 授权** → EXEC（0145+0146 + 18 处消费方 + prove + 规范文档 + 删 sql/·与 DBTF-1 0144 汇流后落号）→ post-prove 双审 → **meetwise 授权 nail** → 债行 GAP-DEBT-DB-HYGIENE 勾销「死表/sql/」项（jsonb 拆表与补丁族登记留卷）。

**EXEC 文件面（预告 · 本 turn 不动）**：

| 文件 | 动作 |
|------|------|
| `packages/db/migrations/0145_*.sql`（名 EXEC 定·死表域） | 新增（死表 DROP/COMMENT + 承载声明头 + jsonb 四列 COMMENT） |
| `packages/db/migrations/0146_*.sql`（qbank 分区生命周期域） | 新增（`storage_released_at` 列 + 清理例程函数） |
| `packages/db/sql/`（25 文件） | 删除（若 D3=B'：保留至 neg 迁移另刀·#16 登记留卷） |
| `scripts/schema-drift-check.mjs` + root `package.json` `drift:prove` | 删除（B' 时收缩为 #16 残留守门） |
| §3.2 十八处消费方 | 逐点改造（→ runMigrations 前缀·含 _neg-harness 模板路径/云测拷贝/manifest 点名） |
| `packages/db/test/dbhy1.proof.ts` + `package.json` `dbhy1:prove` | 新增 |
| `packages/db/test/migrate.proof.ts` · `db-id-v7.proof.ts` · 三处 count 测试 · `runtime-kernel.proof.ts` | 死面摘除/改真表 |
| `ai-docs/architecture/backend/id-convention.md`（或 schema-convention 节） | jsonb 边界规范 + 四列例外登记 |

---

## Non-claims

Not HA · not suite green · not G-R4-5 重开或加成（`gR45Closed=true`·`coveredCount=8` 原样）· not W1/W1b/dbid1 闭面重开 · not 历史迁移改写 · not qbank serving/检索面变更 · not MySQL/Qdrant 重开 · not jsonb 拆表执行 · not 自动清理调度 · not coding authorized（Dual PASS ≠ 开工）· `releaseEvidence=false` · `actualSpendCny=null`。

---

*Harness · DBHY-1 GAP-DEBT-DB-HYGIENE 卫生刀 REQUEST **rev2**（rev1 `f4f320cd`·双审 FAIL 唯一项修订：sql/ 清单 15→18+P3 全代码面门+让位序 0145/0146）· 2026-10-07 · draft:awaiting_pre_exec_dual · parent `48dee7a2` · branch `line/db-hygiene` · docs-only · pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · Dual PASS ≠ 开工 · Ban self-approve*

# Harness — **DBFK-1** · interview 复合 FK 渐进补齐（GAP-DEBT-DB-NOFK · W2 二刀 · REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual`**（本 turn docs-only · REQUEST 编写完成即停 · **未授权 EXEC** · zero coding / zero migration / zero prove）
**Date**: 2026-10-08
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（stays） · g7SuiteGreen=false · actualSpendCny=null
**Experts**: `mw-model-op` + `mw-e2e-ha`（pre-exec 双审 · 本 REQUEST 只送审 · **Ban self-approve** · **Dual PASS ≠ 自动开工** · 须 meetwise 明示授权才进 EXEC）
**Slice**: `../db-intfk.slice.md`
**Authority**: TASK-SOP-REFACTOR Wave 2 第 5 行（`ai-docs/engineering/TASK-SOP-REFACTOR.md:12`「GAP-DEBT-DB-NOFK：interview 复合 FK 渐进补齐（擦除机器减半）」）· 债行 `ai-docs/delivery/gap-bug-backlog.md:875`（P0 OPEN ·「interview 零外键被引用…resume 侧却复合 FK 双标 → 逼出 6 个巨型隐私擦除迁移手工枚举删除闭包」）· 本刀 = W2 二刀（TRIGFAM 后 · DBID-1 为 W3 并行已 nail 的模板近亲）
**Parent tip**: `48dee7a2`（branch `line/db-interview-fk` · base `origin/feat/mysql-schema-skeleton`）
**Honesty**: 本 REQUEST 全部清单为 mw-core 在 `48dee7a2` 上亲核（grep/逐迁移逐行）· 非 AI 凭记忆 · 与债行/协调方草案的口径差（§1.6 量级差 · §3.2 CONCURRENTLY 措辞修正）如实标注

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **本刀是什么** | interview 侧复合 FK 渐进补齐第一刀：interview 建 `UNIQUE(id, owner_user_id)`（镜像 resume 模板 0001:180）→ Batch 1 三表（ai_report / assessment_report / question_feedback）补 `FOREIGN KEY (interview_id, owner_user_id) REFERENCES interview(id, owner_user_id) ON DELETE CASCADE`（additive · orphan-check-first · NOT VALID+VALIDATE 在线路径）· interview_event 两案并陈交双审 · Prove `db-int-fk.proof.ts` EXIT=0 + 三表回归 prove 复跑 |
| **本刀不是什么** | **不是** 存量行回填/改写 · **不是** 擦除迁移改写（本刀后删除闭包仍由 0048/0092/0096/0111/0118/0125 手工枚举承重——FK 驱动收缩是**未来刀**，见 §4）· **不是** RLS/触发器变更（0058/0059/0062 写 guard 面零碰）· **不是** interview_event 判别列手术（若裁案 A 则独立后刀）· **不是** 删除 interview 根行（fence 锚不动，§1.5a）· **不是** 本 turn 编码 |
| **增益边界（诚实）** | ①同 owner 归属从「触发器+RLS 行为面」升为**声明式 DB 约束**（绕过触发器的路径——新 SECURITY DEFINER/运维直连——也被拦）· ②孤儿行制造被 DB 拒绝（现状可静默产生）· ③为未来「删除闭包 FK 驱动化」铺轨（收缩面=0096 report sink 6 表 DELETE 可撤）· **不 claim** 擦除机器已减半（本刀只铺轨）· **不 claim** 性能收益 |
| **现在** | `draft:awaiting_pre_exec_dual` · docs-only · 等双审 + meetwise 授权 |

---

## 1. 审计现状（亲核 @ `48dee7a2` · `packages/db/migrations/0001–0143`）

### 1.1 「interview 零外键被引用」亲核

`grep -rn "REFERENCES interview\b" packages/db/migrations/*.sql` = **0 命中**。对照 resume 侧（双标实证）：

| 父表 | 复合唯一键 | 被引用（复合 FK 子表） |
|------|-----------|----------------------|
| `resume` | `uq_resume_id_owner UNIQUE (id, owner_user_id)`（0001:180 · 行内注释「复合 FK 用：让子表 FK 强制同 owner」） | `resume_blob`(0001:190) · `resume_profile`(0001:197) · `interview`(0049:22 DEFERRABLE) · `interview_job`(0049:32/:49) · `resume_quiz`/`resume_diagnosis`/`quiz_job`/`diagnosis_job`(0061:54-66 NOT VALID 四连) |
| `job_posting` | `uq_job_posting_id_owner`（0046:51） | 0046:55 起同款 |
| **`interview`** | **无**（仅 `id text PRIMARY KEY` · 0001:18-25） | **零** |

interview 表现状：`id text PK · owner_user_id text NOT NULL · status · version · current_question_index · questions jsonb`（0001:18-25）+ `application_id/job_id/resume_id`（0028:6-8）+ `application_attempt`（0046:6）。**FK 目标列对 `(id, owner_user_id)` 无现存唯一约束**——本刀必须先补（§3.1）。

### 1.2 卫星表全景（interview 定位列 + owner 列齐备性亲核）

| 表 | 迁移 | 定位列（现值） | 既有唯一键 | 0059 写 guard | 擦除语义（亲核） | 分批裁决 |
|----|------|---------------|-----------|--------------|------------------|---------|
| `ai_report` | 0001:224-238 | `interview_id text NOT NULL` | `uq_report_interview UNIQUE(owner_user_id, interview_id)` | ✅ 0059:106-108 | 0096:548 物理 DELETE（report sink） | **Batch 1** |
| `assessment_report` | 0001:336-346 | `interview_id text NOT NULL` | `UNIQUE(owner_user_id, interview_id)` | ✅ 0059:110-112 | 0096:546 物理 DELETE | **Batch 1** |
| `question_feedback` | 0019:19-27 | `interview_id text NOT NULL` | `PK(owner_user_id, interview_id, question_index)` | ✅ 0059:120-122 | 0096:538 物理 DELETE | **Batch 1** |
| `learning_plan` | 0001:378-387 | `interview_id text NOT NULL` | `UNIQUE(owner_user_id, interview_id)` | ✅ 0059:113-115 | 0096:542 物理 DELETE | **Batch 1b（归属复核后入列 · D2）** |
| `career_path` | 0001:427-437 | `interview_id text NOT NULL` | `UNIQUE(owner_user_id, interview_id)` | ✅ 0059:118-120 | 0096:544 物理 DELETE | **Batch 1b（同上）** |
| `learning_progress` | 0019:38-45 | `interview_id text NOT NULL` | `PK(owner_user_id, interview_id, topic)` | ✅ 0059:116-118 | 0096:540 物理 DELETE | **Batch 1b（亲核新发现孪生——协调方清单未点名，如实登记入裁）** |
| `interview_event` | 0001:38-46 + 0021:2-4(event_key) | **`stream_key text`（多态 · §1.5b）** | `UNIQUE(stream_key, seq)` + `uq_interview_event_key` 部分唯一 | ✅ 0059:97-99 → 0062 重定义 scope | 0096:529 物理 DELETE（event sink · 按 owner+stream_key） | **两案并陈（D1）** |
| `interview_job` | 0001:253-268 | `interview_id text NOT NULL` | —（claim 索引） | ✅ 0058:95-98 | **原地 redact**（0058:188-192 `status='done', payload='{}'`——行保留=审计轨迹） | **排除（redact-not-delete 语义与 CASCADE 相悖 · §2.3）** |
| `interview_question` | 0021:6-23 | `interview_id text NOT NULL` | `PK(owner,interview,question_id)` 等 | ✅ 0058:110-113 | **原地 redact**（0058:180-183 `status='cancelled'`） | **排除（同上）** |
| `interview_answer_submission/artifact/job` | 0092:55/77/102 | `interview_id`（+owner） | 各自幂等键 | 0092 自带状态机 guard | 0092:558-562 物理 DELETE（INT sink 族） | **后续批候选**（自带 fence/DEFINER 面 · 先让 Batch 1 验模板 · §2.3） |
| `consumption_record` | 0001:47-54 | `interview_id text`（**可空**） | `uq_consumption_idem(owner, key)` | 无 | 商幂等审计行 | **排除**（B 侧审计不该随 C 侧删除级联 · §2.3） |
| `user_memory.source_id` | 0001:312-320 | `source_id text`（**可空**·「来源面试 id 可追溯」） | — | 无 | memory 域 0093 自治 | **排除**（弱引用 · memory 域已治理） |

### 1.3 resume 侧可复制模板（三件套先例）

1. **父唯一键**：`UNIQUE (id, owner_user_id)`（0001:180）。
2. **FK 形态谱**：`DEFERRABLE INITIALLY IMMEDIATE`（0049:22-25 · 同事务先插子后插父的场景）↔ `NOT VALID` 四连（0061:53-67 · 先约束新写入、存量后验——**在线加 FK 的标准姿势**）。
3. **在线索引先例**：`0055_resume_reference_legacy_backfill_index.sql` = 全库唯一 `-- @migration-mode concurrent-index` 迁移（runner `packages/db/src/migrate.ts:258-289` 事务外执行 + 独立短事务记账 · 安全面=恰好一条 `CREATE [UNIQUE] INDEX CONCURRENTLY IF NOT EXISTS` 语句，正则门在 migrate.ts concurrentIndexStatement）。

### 1.4 擦除链现状（「6 个巨型迁移手工枚举删除闭包」债行对表）

interview 一场的删除闭包今天散布在（亲核 DELETE 语句落点）：

| 迁移 | 字节（亲核 wc -c） | 手工枚举的闭包成员 |
|------|------|-------------------|
| 0048_checkpoint_physical_erasure | 25,774 | `checkpoint_writes/blobs/checkpoints`（:429-433） |
| 0092_int_transcript_answer_fact_root | 36,754 | `interview_answer_job/artifact/submission`（:558-562） |
| 0093_memory_governance | 65,733 | MEM 7 sink |
| 0096_int_transcript_remaining_sinks | 37,534 | `interview_event`(:529) · `ai_graph_run`(:533) · report sink 6 表=question_feedback/learning_progress/learning_plan/career_path/assessment_report/ai_report（:538-548）+ 残留=0 校验(:550-557) |
| 0111_ctx03_event_source_erasure | 33,468 | conversation 事件源 |
| 0118_ctx06_deletion_closure | 27,343 | 压缩快照/派发 |

另 0058（队列 redact）/0059（投影 fence）/0062（事件流 scope）不删行但写 guard 承重。

### 1.5 关键架构事实（分批裁决的根据 · 全部亲核）

- **(a) interview 根行是 fence 锚，永不删除**：全库 `DELETE FROM interview` = **0 命中**（唯一 `UPDATE interview` 是 0046 恢复器与 0123 快照回写，均非擦除）。`interview_privacy_active`（0058:42-45）先 `PERFORM 1 FROM interview WHERE id=… AND owner=principal`，**行不在→返回 false→全部写 guard 失效**。故「删除 interview 根行」= 拆 fence——`ON DELETE CASCADE` 在现行擦除路径**永不触发**，本刀的 CASCADE 是**声明式安全网**（若未来引入真·根删除路径，须先重裁 fence 锚设计——Non-claim）。
- **(b) interview_event 是多态共享流表，stream_key 无类型父**：0062:4-6 自述「shared durable transport for interview, quiz and diagnosis SSE」+ 0143_sse_push_notify.sql:5「interview / quiz / diagnosis share this table」；writers 亲核五域——interview（interview-consumer.ts:91/93 · report-worker.ts:55/67 · adaptive-lifecycle.ts:54/158/257 · signal-conclude-event.ts:26）· quiz（quiz-lifecycle.ts:37/63/64 · quiz-consumer.ts:56/82）· diagnosis（diagnosis-lifecycle.ts:43/68-70 · diagnosis-consumer.ts:55/81）· qbank 生成（qbank-miss.ts:261 `plan.snapshotId`）· commerce 过期（commerce-reconcile.ts:49/65 `s.idempotencyKey`）。0062:36-39 对「legacy generic streams」显式放行（无父表可言）。→ `stream_key` 直接 FK 到 interview(id) **结构上不可能**（会拒绝全部非 interview 流）。
- **(c) 0059 写 guard 已隐式要求「interview 行在 + 同 owner」**：8 张投影表的 BEFORE INSERT OR UPDATE guard → `enforce_interview_projection_privacy_active` → `interview_privacy_active`。因此**现存全部受 guard 写入已满足未来复合 FK**——FK 对现存流程的破坏风险 ≈ 0（触发器=安全边界，FK=完整性边界，互补非替代；FK 另拦「绕过触发器的路径」）。
- **(d) RLS/触发器与 FK 零交互**：约束校验不走 RLS 策略；CASCADE 仅父删除触发（§1.5a：不存在该路径）。0096 purge 走**子行直接 DELETE**，FK 不拦子侧删除（P5 验证）。

### 1.6 口径差（诚实标注）

债行「~10 万字节」vs §1.4 亲核六迁移合计 **~226 KB**（0048+0092+0093+0096+0111+0118）——债行为量级低估值，事实结论（巨型+手工枚举）一致，不影响刀面。

---

## 2. 分批方案（渐进补齐 · 语义分批不是一次全上）

### 2.1 Batch 1（本刀 EXEC · 「行随 interview 删除而清理」语义明确）

**ai_report / assessment_report / question_feedback** 三表加复合 FK。入列判据（三条件全中）：
1. 0096 report sink purge 的物理 DELETE 闭包成员（=「行随 interview 删除而清理」的现行语义载体）；
2. `(owner_user_id, interview_id)` 双列齐备且 interview_id NOT NULL；
3. 写入全部经 0059 guard（§1.5c → 孤儿/错 owner 风险面已被行为面覆盖，FK 是声明式加固）。

### 2.2 Batch 1b（业务归属复核后入列 · D2）

**learning_plan / career_path**（协调方点名「复核后入列」）+ **learning_progress**（mw-core 亲核新发现孪生：同 0096 purge 块、同 0059 guard、同 PK 形态——协调方清单未点名，如实登记）。复核内容=写入点归属亲核：`interview.service.ts:822`（learning_plan）/`:904`（career_path）均在 interview 完成链内、owner 同 principal、interview 行必先在；learning_progress 写入点 EXEC 期复核入收据。**mw-core 建议：复核通过则与 Batch 1 同迁移落地（6 FK 一刀）**——形态完全同构，分两刀只有记账成本；若复核发现例外写路径则该表剔除登记。

### 2.3 interview_event 两案并陈（D1 · 隐私擦除语义优先 · 交双审裁）

| | 案 A：FK ON DELETE CASCADE | 案 B：保持无 FK + 登记理由（mw-core 建议） |
|---|---|---|
| 前置手术 | 需先加**可空判别列** `interview_id`（或拆域分表）——因 stream_key 多态（§1.5b），直接 FK 会拒绝 quiz/diagnosis/qbank/commerce/legacy 流 | 无 DDL |
| 热路径代价 | `appendEvent`（interview-event.ts:16-51 · INSERT…SELECT MAX+1 幂等）5 域 writer 契约全改 + 存量回填 interview 域流 | 零 |
| 隐私擦除收益 | 现行≈0： CASCADE 永不触发（§1.5a 根行不删）；0096 event sink purge 本就按 owner+stream_key 直删+残留=0 | 同左（FK 不在场的现状已由 purge+0062 scope fence+残留校验承重） |
| 完整性收益 | interview 域事件孤儿制造被拒 | 无（登记：孤儿风险已由 0059/0062 guard 拦截写入侧） |
| 裁决建议 | **若裁 A：独立后刀**（判别列+回填+writer 契约+prove 面大，塞本刀违反渐进纪律） | **本刀落 B**：登记理由=「多态共享流表无类型父 · append-only · 擦除语义已由 0062 scope + 0096 purge 残留=0 校验承重 · 隐私擦除语义优先于形式 FK」写入债行尾部 |

### 2.4 排除面登记（本刀不动 · 理由在卷）

| 表/列 | 排除理由 |
|-------|---------|
| `interview_job` / `interview_question` | **redact-not-delete**（0058:180-192 原地 UPDATE cancelled/done+payload={}）——行保留即审计轨迹；CASCADE「行随父删」语义与之**相悖**；且 guard 是 BEFORE INSERT OR UPDATE（0058:95-113），FK 无增量收益 |
| `interview_answer_submission/artifact/job`（0092 三表） | 物理 DELETE 闭包成员=后续批候选；但自带加密事实根状态机+DEFINER 写路径+显式 id（DBID-1 B2 面），**先让 Batch 1 验模板再入列** |
| `consumption_record.interview_id` | 可空 + B 侧商幂等审计行，不该随 C 侧删除级联（级联=销毁对账证据） |
| `user_memory.source_id` | 可空弱引用（「来源面试可追溯」），memory 域 0093/0107 已自治 |
| `interview_route_snapshot`/`issued_question_contract`/`score_*` | 评分/路由域自有 locator 与 FK 面（0100/0104），不属 interview 复合 FK 模板面 |

---

## 3. FK 形态与迁移机械（additive · orphan-check-first）

### 3.1 父侧：interview 建 `UNIQUE(id, owner_user_id)`

镜像 0001:180 resume 模板。`(id)` 已是 PK，`(id, owner_user_id)` 函数依赖上冗余但**物理必需**（复合 FK 引用列必须有精确唯一约束；`INCLUDE` 列不算）。全库亲核无同名索引/约束冲突。

### 3.2 子侧：FK 定义（Batch 1 三表 + Batch 1b 三表同构）

```sql
ALTER TABLE <child>
  ADD CONSTRAINT fk_<child>_interview_owner
  FOREIGN KEY (interview_id, owner_user_id)
  REFERENCES interview (id, owner_user_id)
  ON DELETE CASCADE;
```

- **列序**照 resume 模板（0001:190）：子 `(interview_id, owner_user_id)` ↔ 父 `(id, owner_user_id)` 位置对应。
- **NOT DEFERRABLE（默认·比 0049 模板更严）**：0049 用 DEFERRABLE 是因 interview/job 同事务先子后父插 resume；本刀卫星 INSERT 永远晚于 interview 行存在（§1.5c），无需延迟检查——登记为 **D3**。
- **协调方草案措辞修正（D4 · 对齐 dbid1-D4 先例）**：**PG16 无 `ADD CONSTRAINT … FOREIGN KEY … CONCURRENTLY`**（CONCURRENTLY 仅 UNIQUE/PK USING INDEX 形态）。在线等价两段式=**`ADD CONSTRAINT … NOT VALID`**（短 ACCESS EXCLUSIVE · 不扫存量）→ **`VALIDATE CONSTRAINT`**（仅子表 SHARE UPDATE EXCLUSIVE · 不阻塞读写）。锁窗口评估：本库 C 侧无生产放量（releaseEvidence=false）， VALIDATE 扫描量为全表计数级——窗口可忽略；两段式仍作为**模板永久形态**落地（后续大批表复制）。

### 3.3 迁移文件形态两案（D4 内）

| | 形态 1：双迁移（mw-core 建议） | 形态 2：单事务迁移 |
|---|---|---|
| 结构 | `0144_interview_owner_unique_index.sql`（`-- @migration-mode concurrent-index` · `CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_interview_id_owner ON interview (id, owner_user_id);`——**恰合 runner 正则门**）→ `0145_interview_composite_fk_batch1.sql`（`ALTER TABLE interview ADD CONSTRAINT uq_interview_id_owner UNIQUE USING INDEX uq_interview_id_owner;` + 6×FK ADD NOT VALID + 6×VALIDATE，同事务原子） | 单文件全内联（UNIQUE 直建 + FK NOT VALID + VALIDATE） |
| 锁 | 父表在线建索引（0055 先例）· 0145 短窗 | 父表 ACCESS EXCLUSIVE 建索引（量小可忍，但模板不可复制到大表） |
| 建议 | ✅（interview_event/answer 族后续大批复制此模板） | 否 |

注：0143 已有双文件同号先例（`0143_db_id_v7_unify.sql` + `0143_sse_push_notify.sql` 并存）——本刀取 **0144/0145 顺号**，避撞。

### 3.4 orphan-check-first（ADD 前置门 · prove P1 承重）

每张入列子表，ADD FK 前跑（生产/预发/迁移前即时各一次，结果入收据）：

```sql
SELECT count(*) AS orphans FROM <child> c
  LEFT JOIN interview i ON i.id = c.interview_id AND i.owner_user_id = c.owner_user_id
 WHERE c.interview_id IS NOT NULL AND i.id IS NULL;
-- 期望 0；>0 → 停：登记孤儿行数+样本（不删不回填），处置交双审另裁
```

**Ban 静默回填**（对照 0049 先例：它只回填「证明过的值」且明说「never guessed」；本刀孤儿若>0，处置=登记后另裁，绝不在本刀内 UPDATE 子表或插父行补洞）。干净库上期望 0（§1.5c guard 已拦写入侧孤儿）。

---

## 4. 与隐私擦除链的关系声明（本刀不动擦除迁移）

1. **FK 补齐后删除闭包「可」改 FK 驱动**：0096 report sink 的 6 表手工 DELETE（:538-548）+ 残留=0 校验（:550-557）在未来刀可改为「删 interview 根行（须先重裁 fence 锚 §1.5a）或按 FK 声明收缩枚举面」——这是债行「擦除机器减半」的**完成态**，**不是本刀交付物**。
2. **本刀零碰擦除迁移**：0048/0058/0059/0062/0092/0093/0096/0111/0118/0125 一字不动（P6 静态门验证历史迁移零 diff）。
3. **并存正确性**：0096 purge 按子表直接 DELETE（FK 不拦子侧删除）+ advisory 锁序不变——P5 在 FK 在场复刻 purge 全链验证。
4. **方向不反转**：本刀 CASCADE 对擦除路径 inert（§1.5a）；若未来真要「FK 驱动擦除」，前置=独立的 fence 锚重设计刀（登记，不在本刀 claim 面）。

---

## 5. Prove 设计（新 `packages/db/test/db-int-fk.proof.ts` · `pnpm db-intfk:prove` · EXIT=0）

对隔离 PostgreSQL（`assertIsolatedTestTarget` + 增量迁移到 0145），全断言 PASS 才 EXIT=0：

| 块 | 断言 |
|----|------|
| P1 孤儿检测 | §3.4 查询逐表跑（6 表 · 计数入卷）→ 全 0；另构造合成孤儿行证明 NOT VALID ADD 后 VALIDATE **会**拒绝（23503 卷标）——即检测门非摆设 |
| P2 FK 生效 catalog 断言 | `pg_constraint`：6 条 FK 存在 · `convalidated=true` · `confdeltype='c'`（CASCADE）· conkey/confkey 列序=(interview_id,owner_user_id)↔(id,owner_user_id) · 父 `uq_interview_id_owner` 存在且 indisunique |
| P3 负门 | INSERT ai_report 带不存在 interview_id → 23503；带真 interview_id+**错 owner** → 23503（同 owner 归属声明式生效）；assessment_report/question_feedback 同负门 |
| P4 正路径 | 建 interview → 依序 INSERT 三表成功（guard 与 FK 共存不误伤 · `report.ts:15` / `interview.service.ts:567/:796` 真实语句形态） |
| P5 擦除共存 | 复刻 0096 report sink 链（begin→claim→purge）在 FK 在场走通 + 残留=0 + interview 根行仍在（fence 锚不动） |
| P6 静态契约门 | 新迁移文本 grep：**零** `UPDATE `/`DELETE FROM `/`DROP `/`CREATE TRIGGER `/`POLICY`（仅 CREATE UNIQUE INDEX / ADD CONSTRAINT / VALIDATE）；`git diff --stat packages/db/migrations/0001-0143` 零变更 |
| P7 三表回归 prove 复跑 | `growth`（assessment_report ×4 引用）· `prove:uc019-report-regenerate`（ai_report ×6）· `prove:int-transcript-remaining-sinks`（question_feedback ×3 + purge 闭包）全绿收据 |

**接线**（dbid1 同款四点）：root `package.json` `db-intfk:prove`/`:raw` · `packages/db/package.json` `prove:db-int-fk` · `scripts/run-e2e-isolated.mjs` 文件映射表 · test 文件本体。
**纪律**：EXIT=0 一次过；attempts 全账；**Ban retry-to-green**。

---

## 6. 硬 Ban（EXEC 期同样有效）

1. **Ban 碰历史迁移/擦除迁移**（0001-0143 全部 · 0048/0058/0059/0062/0092/0093/0096/0111/0118/0125 点名——P6 验证零 diff）。
2. **Ban 碰 RLS / 触发器**（0058/0059/0062 写 guard 面 · 全部 policy · 零碰）。
3. **Ban 存量行回填/改写**（orphan>0 只登记另裁 · §3.4）。
4. **Ban 本刀内做 interview_event 判别列手术**（案 A 裁中也是独立后刀）。
5. **Ban 改共享 SSOT**（north-star / hard-gates / e2e coverage 矩阵 / 债行本体只追加注不改写）。
6. **Ban secrets / 真实数据入树**。
7. **Ban 本 turn 编码**（REQUEST 写完即停回报；EXEC 须双审 PASS + meetwise 明示授权）。

---

## 7. 决策点（请双审裁定）

| ID | 议题 | mw-core 建议 |
|----|------|--------------|
| D1 | interview_event 两案（A=CASCADE 需判别列手术·独立后刀 vs B=保持无 FK+登记理由） | **B**（多态流表无类型父 · 擦除语义已承重 · 隐私优先） |
| D2 | Batch 1b：learning_plan/career_path 复核后与 Batch 1 同刀（+新发现孪生 learning_progress 入裁） | **同刀 6 FK**（同构 · 分刀只增记账成本；复核例外则剔除登记） |
| D3 | FK NOT DEFERRABLE（严于 resume 模板 0049 的 DEFERRABLE） | **确认**（卫星永远后于父行存在 · 无同事务先子后父场景） |
| D4 | 形态 1 双迁移（0144 concurrent-index 父索引 + 0145 USING INDEX/FK/VALIDATE）+「PG 无 FK CONCURRENTLY·NOT VALID+VALIDATE 为在线等价」措辞修正 | **确认形态 1**（0055 先例 · 模板可复制） |
| D5 | CASCADE vs NO ACTION（父行永不删的现状下二者等价 inert；CASCADE 为未来 FK 驱动擦除预铺） | **CASCADE**（铺轨语义 · 与 resume 侧 0001:190 一致） |
| D6 | consumption_record/answer 族/user_memory.source_id 排除面（§2.4） | **确认登记**（answer 族=Batch 2 候选） |

---

## 8. Acceptance（EXEC 后验收）

| ID | Criterion |
|----|-----------|
| A1 | 0144（concurrent-index 模式·恰一条语句）+ 0145（USING INDEX + 6 FK NOT VALID + 6 VALIDATE · 同事务）落地（P6 静态门绿） |
| A2 | `db-int-fk.proof.ts` EXIT=0（P1–P7 全 PASS · attempts 全账） |
| A3 | 孤儿检测 6 表计数=0 收据在卷（或 >0 时登记处置 · Ban 静默回填） |
| A4 | 三表回归 prove（growth / uc019 / remaining-sinks）复跑全绿收据 |
| A5 | 历史迁移/RLS/触发器零 diff（P6）· 存量数据零变化 |
| A6 | pins 全保留（§首行 · 无一翻转） |

---

## 9. 流程与产物

**流程**：REQUEST（本档）→ 预执行双审（`mw-model-op` + `mw-e2e-ha`）→ **meetwise 授权** → EXEC（0144+0145 + prove 接线 + 回归复跑）→ post-prove 双审 → **meetwise 授权 nail**（债行 GAP-DEBT-DB-NOFK 追加进度注·不 CLOSE——event 表裁定与后续批在卷）。

**EXEC 文件面（预告 · 本 turn 不动）**：

| 文件 | 动作 |
|------|------|
| `packages/db/migrations/0144_interview_owner_unique_index.sql` | 新增（concurrent-index 模式 · 父唯一索引） |
| `packages/db/migrations/0145_interview_composite_fk_batch1.sql` | 新增（USING INDEX 收编 + 6 FK NOT VALID + 6 VALIDATE） |
| `packages/db/test/db-int-fk.proof.ts` | 新增 prove（P1–P7） |
| root `package.json` + `packages/db/package.json` + `scripts/run-e2e-isolated.mjs` | prove 接线三点 |
| 债行 `gap-bug-backlog.md:875` | 追加进度注（append-only） |

---

## Non-claims

Not HA · not suite green · not 擦除机器已减半（只铺轨 · §4）· not interview_event 判别列/分表 · not 删除 interview 根行（fence 锚不动）· not 存量回填 · not RLS/触发器变更 · not coding authorized（Dual PASS ≠ 开工）· not 覆盖任何 e2e 门（coveredCount=8 不变）· `releaseEvidence=false` · `actualSpendCny=null`。

---

*Harness · DBFK-1 interview 复合 FK 渐进补齐 REQUEST · 2026-10-08 · draft:awaiting_pre_exec_dual · parent `48dee7a2` · docs-only · pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · Dual PASS ≠ 开工 · Ban self-approve*

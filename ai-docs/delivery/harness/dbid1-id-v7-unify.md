# Harness — **DBID-1** · 数据库 ID 统一优化刀（UUIDv7 渐进收敛 · REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual`**（本 turn docs-only · REQUEST 编写完成即停 · **未授权 EXEC** · zero coding / zero migration / zero prove）  
**Date**: 2026-10-08  
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（stays） · g7SuiteGreen=false · actualSpendCny=null  
**Experts**: `mw-model-op` + `mw-e2e-ha`（pre-exec 双审 · 本 REQUEST 只送审 · **Ban self-approve** · **Dual PASS ≠ 自动开工** · 须 meetwise 明示授权才进 EXEC）  
**Slice**: `../dbid1-id-v7-unify.slice.md`  
**Authority**: meetwise 用户直裁立项（「现在的 ID 太混乱…UUID 太 low…弄完后一并优化」）· 本刀 = DB 层 ID 纪元收敛 · **≠ HA · ≠ suite green · ≠ 任何业务门关闭**  
**Parent tip**: `0fe96fca`（branch `line/db-id-v7-unify` · base `origin/feat/mysql-schema-skeleton`）  
**Honesty**: 本 REQUEST 全部清单为 mw-core 在 `0fe96fca` 上亲核（grep/解析逐表逐行）· 非 AI 凭记忆 · 协调方审计口径与 mw-core 复核差异已在 §1.4 标注

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **本刀是什么** | DB 主键 ID 三纪元收敛：A 级 uuid 表 DEFAULT 换 `uuidv7()`（零回填）· B 级应用层 ID 工厂统一 `newEntityId(prefix)`（时间有序尾巴）· C 级 ID 规范冻结 + 前缀注册表 · Prove `db-id-v7.proof.ts` EXIT=0 |
| **本刀不是什么** | **不是** 存量行改写/回填 · **不是** 列类型/FK/RLS 变更 · **不是** MySQL/Qdrant 叙事重开 · **不是** HA/suite green 声明 · **不是** 业务幂等键（idempotency_key）变更 · **不是** 本 turn 编码（REQUEST 写完即停） |
| **增益边界（诚实）** | 新行时间有序 → B-tree 追加式插入（写放大/页分裂/buffer 局部性改善）；**存量 v4/text 行保留不动** → 表内 v4/v7 并存属预期终态（append-only 渐进）· 性能改善幅度**不在本刀 claim 面**（无 SLO/压测声明） |
| **现在** | `draft:awaiting_pre_exec_dual` · docs-only · 等双审 + meetwise 授权 |

---

## 1. 审计现状（亲核 @ `0fe96fca` · `packages/db/migrations/0001–0142`）

### 1.1 三纪元并存总览

| 纪元 | 数量（亲核） | 形态 | 判定 |
|------|------|------|------|
| **uuid + `DEFAULT gen_random_uuid()`** | **55 张**（逐表现值见 §2.3 附表） | UUIDv4 随机（PG16 `gen_random_uuid()`） | **三宗罪**（见 §1.2）· A 级对象 |
| **text 主键（应用层 `prefix + randomUUID()`）** | 50 张单列 text PK + 45 张复合 PK（首列多为 text）≈ **~100 张**；Node 侧生成点亲核 **16 处**（§3.2，15 处入 B 级 + 1 处格式冻结排除） | `'job_' + randomUUID()` 等 | 前缀可读 ✓ 但尾巴仍 v4 随机 · 40 字节宽于 uuid 16 字节 · B 级对象 |
| **bigint/bigserial 事件表 + boolean singleton** | 4 张 bigint（`interview_event` bigserial@0001 · `memory_audit_event`@0093 · `rag_cache_invalidation_outbox`@0073 · `rag_generation_release_event`@0073）+ 6 张 boolean singleton（`qbank_cache_epoch`@0022 · `qbank_active_generation`/`qbank_corpus_epoch`@0029 · `rag_corpus_epoch`/`rag_active_generation`@0032 · `rag_cache_epoch`@0073） | 事件表自增 · 控制面 singleton | **合理保留 · 不动** |
| （附）uuid 无 DEFAULT | 5 张：`privacy_checkpoint_target`@0048 · `interview_answer_artifact_target`@0092 · `interview_projection_target`@0096（均 `REFERENCES privacy_deletion_target(id)` 跟随）· `resume_blob`/`resume_profile`@0001（id 由应用/函数显式提供） | — | 不适用 DEFAULT 切换 · 登记 |

### 1.2 uuid v4 默认的三宗罪

1. **随机 v4 → B-tree 插入点全随机** → 写放大 / 页分裂 / buffer 局部性差（高写入表尤甚：commerce 结算族、interview answer 族、memory index embedding 族）。
2. **裸 uuid 无域前缀** → 日志/收据/排障不可读（无法从 id 反查域）。
3. **与 text 系双纪元并存** → 同库三套 ID 语义，认知与治理成本。

### 1.3 text 系的「半好」形态

`prefix + randomUUID()`：前缀可读 ✓，但尾巴仍是 v4 随机（B-tree 局部性同样差），且 40 字符宽于 uuid 16 字节存储。亲核样例：
- `packages/db/src/recruiter.ts:31` `'job_' + randomUUID()` · `:139`/`:332` `'app_'` · `:419` `'iv_'`
- `packages/db/src/job-route-decision.ts:109`/`:139` `'rd_'` · `packages/db/src/candidate-route.ts:73` `'cprd_'`
- `apps/api/src/modules/commerce/commerce.service.ts:27` `'ord_'` …（全清单 §3.2）

### 1.4 口径差（诚实标注）

协调方审计计 **171 张表**；mw-core 在 `0fe96fca` 亲核 `CREATE TABLE` 去重计数 **173 张**（含 `checkpoint_migrations` 等基础设施表）。差异为计数口径（是否含非业务/重复 IF NOT EXISTS 面），**三纪元事实与分级结论一致**，不影响本刀范围。

---

## 2. A 级方案（零回填渐进 · DEFAULT 切换）

### 2.1 `uuidv7()` SQL 函数（新 migration 提供 · PG16 纯 SQL/plpgsql）

- **布局（RFC 9562 §5.2）**：`unix_ms(48bit) | ver=0111(4bit) | rand_a(12bit) | var=10(2bit) | rand_b(62bit)`。
- 形态：`CREATE OR REPLACE FUNCTION public.uuidv7() RETURNS uuid`（`LANGUAGE plpgsql VOLATILE`）；时间源 `floor(extract(epoch from clock_timestamp()) * 1000)`；随机源 `gen_random_bytes`/`gen_random_uuid()` 尾部位（不引扩展，pgcrypto 已在 0121/0122 处理运行时 ACL——实现以现网可用原语为准，EXEC 时定稿）。
- 另提供 **IMMUTABLE 确定性伴生函数** `uuidv7_from_parts(unix_ms bigint, rand_a bigint, rand_b bit varying)` 供 prove 做 RFC 9562 已知答案测试（KAT），生产路径不调用。
- **KAT 向量（RFC 9562 §5.2 示例位域分解复算）**：`unix_ms=0x017F22E279B0 · ver=7 · rand_a=0xCC3 · var=10 · rand_b=0x18C4DC0C0C07398F` → 期望 `017f22e2-79b0-7cc3-98c4-dc0c0c07398f`。

### 2.2 切换语义（关键 · 零回填）

```sql
ALTER TABLE ONLY public.<table>
  ALTER COLUMN id SET DEFAULT public.uuidv7();
```

- **uuid 列类型不变** = 零 FK 改动 · 零数据回填 · 零 RLS 改动；**存量 v4 行保留不动**（append-only）；新行立即时间有序。
- **范围 = 全部 55 张 `DEFAULT gen_random_uuid()` 表一刀切**（§2.3 全清单）。理由：①每张表改动成本完全相同（一条 ALTER SET DEFAULT）；②只切「高写入」子集会制造**第四纪元**（v4-default 表与 v7-default 表并存），违背「统一」刀名；③低写入控制面表同样受益于可读性/有序性且无任何额外风险。
- **写入路径亲核（收益真实性）**：commerce 五表 + `ai_graph_run` + `privacy_deletion_target` 的 INSERT 均不携带显式 id（`packages/db/src/commerce.ts:49/:130/:373` · `packages/db/src/payment.ts:84` · `apps/api/src/modules/interview/interview.service.ts:891` · `packages/db/src/interview-graph-lease.ts:33` · `packages/db/src/uc052-internal-erasure.ts:80`），`privacy_erasure_request` 由 0048/0058/0093/0096/0111/0118/0125 等 plpgsql 函数 INSERT（无显式 id）→ **DEFAULT 切换即时生效**。例外：`interview_answer_submission/artifact/job` 三表由应用层**预生成显式 id**（§3.3 B2 面）→ 必须 B2 同刀才真正时间有序（A 级单做对该三表是 no-op，已如实登记）。

### 2.3 A 级全清单（55 张 · 亲核每个 DEFAULT 现值 = `uuid PRIMARY KEY DEFAULT gen_random_uuid()` · 分档仅叙事·同刀全切）

| # | 表 | 迁移 | 档 |
|---|----|------|-----|
| 1 | `entitlement_consumption` | 0001 | 核心点名（commerce） |
| 2 | `entitlement_bucket` | 0001 | 核心点名（commerce） |
| 3 | `consumption_record` | 0001 | 核心点名（commerce） |
| 4 | `commerce_outbox` | 0001 | 核心点名（commerce） |
| 5 | `settlement_ledger` | 0001 | 核心点名（commerce） |
| 6 | `ai_graph_run` | 0001 | 核心点名 |
| 7 | `privacy_deletion_target` | 0047 | checkpoint 族 |
| 8 | `privacy_erasure_request` | 0047 | checkpoint 族（0048 `privacy_checkpoint_target` 无 DEFAULT·FK 跟随·不适用） |
| 9 | `resume` | 0001 | 高写入运行时 |
| 10 | `interview_job` | 0001 | 高写入运行时 |
| 11 | `ai_report` | 0001 | 高写入运行时 |
| 12 | `quiz_job` | 0007 | 高写入运行时 |
| 13 | `diagnosis_job` | 0008 | 高写入运行时 |
| 14 | `interview_answer_submission` | 0092 | 高写入运行时（显式 id 路径·须 B2 配套） |
| 15 | `interview_answer_artifact` | 0092 | 高写入运行时（同上） |
| 16 | `interview_answer_job` | 0092 | 高写入运行时（同上） |
| 17 | `conversation_event` | 0108 | 高写入运行时（事件源） |
| 18 | `conversation_event_artifact` | 0108 | 高写入运行时 |
| 19 | `context_compression_snapshot` | 0115 | 高写入运行时 |
| 20 | `context_compression_dispatch` | 0117 | 高写入运行时 |
| 21 | `issued_question_contract` | 0100 | 评分运行时 |
| 22 | `score_request` | 0100 | 评分运行时 |
| 23 | `score_card` | 0100 | 评分运行时 |
| 24 | `score_card_criterion` | 0100 | 评分运行时 |
| 25 | `score_evidence` | 0103 | 评分运行时 |
| 26 | `online_judge_candidate` | 0050 | OJ 运行时 |
| 27 | `online_judge_dispatch` | 0050 | OJ 运行时 |
| 28 | `online_judge_lot` | 0050 | OJ 运行时 |
| 29 | `memory_consent` | 0093 | memory 运行时 |
| 30 | `memory_fact` | 0093 | memory 运行时 |
| 31 | `memory_context_snapshot` | 0093 | memory 运行时 |
| 32 | `memory_index_generation` | 0093 | memory 运行时 |
| 33 | `memory_fact_adjudication` | 0099 | memory 运行时 |
| 34 | `memory_fact_relationship` | 0099 | memory 运行时 |
| 35 | `memory_recall_context_snapshot` | 0105 | memory 运行时 |
| 36 | `memory_index_generation_cache_entry` | 0102 | memory 索引（高写入） |
| 37 | `memory_index_generation_embedding` | 0102 | memory 索引（高写入） |
| 38 | `memory_index_source_manifest` | 0102 | memory 索引 |
| 39 | `memory_index_source_manifest_item` | 0102 | memory 索引 |
| 40 | `memory_summary` | 0112 | memory 运行时 |
| 41 | `memory_admission_authorization` | 0095 | memory 准入 |
| 42 | `memory_admission_record` | 0095 | memory 准入 |
| 43 | `privacy_authorization_snapshot` | 0091 | 隐私收据族 |
| 44 | `privacy_deletion_receipt` | 0091 | 隐私收据族 |
| 45 | `privacy_preview_request` | 0129 | 隐私收据族 |
| 46 | `privacy_external_purge_evidence` | 0140 | 隐私收据族 |
| 47 | `memory_collection_pause` | 0107 | 控制面低频 |
| 48 | `memory_correction_command` | 0107 | 控制面低频 |
| 49 | `memory_deletion_request` | 0107 | 控制面低频 |
| 50 | `memory_deletion_target` | 0107 | 控制面低频 |
| 51 | `memory_export_receipt` | 0107 | 控制面低频 |
| 52 | `memory_policy_publish_command` | 0107 | 控制面低频 |
| 53 | `memory_reindex_task` | 0107 | 控制面低频 |
| 54 | `question_rubric` | 0100 | 内容低频 |
| 55 | `question_rubric_criterion` | 0100 | 内容低频 |

**不切面（登记）**：4 张 bigint 事件表 + 6 张 boolean singleton（§1.1，合理保留）· 5 张无 DEFAULT uuid 表（§1.1）· 全部 text 表（B 级对象，DEFAULT 面不涉及）。

---

## 3. B 级方案（应用工厂统一）

### 3.1 新工厂 `packages/db/src/ids.ts`

```ts
export function newEntityId(prefix: string): string;  // `<prefix>_<32hex>` · 前缀白名单校验（未登记 throw · fail-closed）
export function newUuidV7(): string;                  // 连字符形态 UUIDv7 · uuid 列显式 id 用（格式与现行完全一致）
```

- **布局修正（协调方草案笔误）**：UUIDv7 = 128bit，去 hyphen 为 **32 hex**（草案「26 hex/长度 31」为笔误——26hex 无法同时满足 prove 的「v7 版本位」断言，版本位在 32hex 尾巴第 13 字符）。最终格式 **`<prefix>_<32hex>`**，长度 = `len(prefix)+1+32`（例 `job_` 40→36 · `cprd_` 41→37 · `nr-`/`qip-` 保持现连字风格则 39→35/40→36）。**此修正是 REQUEST 决策点 D4，请双审确认。**
- **同 ms 单调（进程内）**：rand_a 用 12bit 计数器（随机种子起步，同 ms 自增）→ 工厂输出**严格字典序=生成序**（10000 次零碰撞 · Spearman≈1.0，见 §5）。
- 零新依赖（`node:crypto` 原语实现）· 从 `packages/db/src/index.ts` 导出。

### 3.2 B1 替换点全清单（15 处 · `prefix + randomUUID()` → `newEntityId(prefix)` · 行为等价）

| # | file:line | 现值 | 目标表 |
|---|-----------|------|--------|
| 1 | `packages/db/src/recruiter.ts:31` | `'job_' + randomUUID()` | `job_posting` |
| 2 | `packages/db/src/recruiter.ts:139` | `'app_' + randomUUID()` | `job_application` |
| 3 | `packages/db/src/recruiter.ts:332` | `'app_' + randomUUID()` | `job_application` |
| 4 | `packages/db/src/recruiter.ts:419` | `'iv_' + randomUUID()` | `interview` |
| 5 | `packages/db/src/job-route-decision.ts:109` | `'rd_' + randomUUID()` | `job_route_decision` |
| 6 | `packages/db/src/job-route-decision.ts:139` | `'rd_' + randomUUID()` | `job_route_decision` |
| 7 | `packages/db/src/candidate-route.ts:73` | `'cprd_' + randomUUID()` | `candidate_profile_route_decision` |
| 8 | `packages/db/src/qbank-route-scope-cache.ts:158` | `'nr-' + randomUUID()` | `qbank_route_scope_negative_result` |
| 9 | `packages/db/src/qbank-miss.ts:267` | `'qip-' + randomUUID()` | `question_issue_provenance` |
| 10 | `packages/db/src/free-text-route-decision.ts:117` | `'ftd_' + randomUUID()` | `free_text_route_decision` |
| 11 | `packages/db/src/free-text-route-decision.ts:147` | `'ftd_' + randomUUID()` | `free_text_route_decision` |
| 12 | `apps/api/src/modules/commerce/commerce.service.ts:27` | `'ord_' + randomUUID()` | `payment_order` |
| 13 | `apps/api/src/modules/quiz/quiz.service.ts:20` | `'qz_' + randomUUID()` | `resume_quiz` |
| 14 | `apps/api/src/modules/interview/interview.service.ts:610` | `'iv_' + randomUUID()` | `interview` |
| 15 | `apps/api/src/modules/diagnosis/diagnosis.service.ts:20` | `'dg_' + randomUUID()` | `resume_diagnosis` |

约束亲核：B1 目标表均无 id 格式 CHECK（仅 `apps/web/lib/recruiter/surface.ts:7` 的 `RECRUITER_APPLICATION_ID = /^app_[A-Za-z0-9-]{1,40}$/`，`app_`+32hex=36 字符 ∈ 限内，**无需改**）。

### 3.3 B2 补充面（uuid 表显式 id → `newUuidV7()` · 3 处 · 格式不变仅熵源换时间有序）

| # | file:line | 现值 | 目标表 |
|---|-----------|------|--------|
| 16 | `packages/db/src/int-transcript.ts:133` | `randomUUID()`（裸·显式 id 预生成，:129 注释言明） | `interview_answer_submission` |
| 17 | `packages/db/src/int-transcript.ts:153` | `randomUUID()` | `interview_answer_artifact` |
| 18 | `packages/db/src/int-transcript.ts:164` | `randomUUID()` | `interview_answer_job` |

**理由**：此三表是高写入路径且应用层显式供 id——A 级 DEFAULT 切换对它们不生效；不并 B2 则 §2.2 的「新行时间有序」对 interview answer 族是空话。B2 保持连字符 uuid 形态 = 对外格式零变化。

### 3.4 排除与残留（亲核登记 · 本刀不动）

| 点 | 原因 |
|----|------|
| `apps/worker/src/qbank-generation.ts:359` `'qgen-' + randomUUID()` | **格式冻结**：`qbank_vector_generation.id` 有 SQL CHECK `^qgen-[0-9a-f-]{36}$`（0029:102）+ 2 处 domain 正则（`packages/domain/src/qbank-track-local-retrieval.ts:29` · `qbank-route-scope-cache.ts:39`）冻结连字符 36 形态；改 32hex 需动 3 处格式契约+存量并存，超出「行为等价」面 → 留后续刀（决策点 D2） |
| 裸 uuid → text PK 5 点：`apps/api/src/modules/auth/auth.service.ts:22`（`user_account`）· `apps/api/src/modules/privacy/privacy.service.ts:23`（`consent_record`）· `apps/worker/src/memory-service.ts:24`（`user_memory`）· `apps/api/src/modules/interview/interview.service.ts:798/:824/:906`（`assessment_report`/`learning_plan`/`career_path`） | 裸 uuid **前缀化属对外可见格式变更**（返回体/引用面），非「行为等价」；且均为低写入 → 交 C 级规范裁决去留（保留 bare 或后续刀逐域收敛）（决策点 D3） |
| 非 id 用途 randomUUID()（token/请求关联，全保留）：`main.ts:35` reqId · `interview.service.ts:875` leaseOwner · `rag-redis-cache.ts:214` · `qbank-retrieval-cache.ts:167-168`（fillId+token）· `qbank-embedding-compute-cache.ts:283/284/532` · `qbank-embedding-compute-seams.ts:126` · `cloud-test-run-ledger.ts:242-243` · `invoke.ts:466` · `model-client.ts:458` callId · `model-admission.ts:81` probeToken · `privacy-authorization.ts:247` jti · `ephemeral-answer-vault.ts:18`（内存 Map） | 一次性 token / 幂等 fence / 请求关联，**非持久实体主键**，时间序无收益，不在刀面 |
| `apps/worker/src/report-worker.ts:56` `ntf_${claim.reportId}` | 通知 id 为**确定性派生**（非随机工厂）· 注册表登记 `ntf` 形态即可 |

---

## 4. C 级（规范冻结 · 同刀 EXEC 交付）

1. **规范文档** `ai-docs/architecture/backend/id-convention.md`（新增）：
   - 新表一律：高写入代理键 = `uuid DEFAULT uuidv7()` · 业务可读键 = `text` `<prefix>_<v7nohyphen>` · 事件表 = `bigserial`/`bigint IDENTITY` · 控制面 singleton = `boolean PK`。
   - 存量三纪元处置说明（v4 行 append-only 保留 · text 存量行不动）。
2. **域前缀注册表**（文档 + `ids.ts` 白名单双落）：`job`/`app`/`iv`/`rd`/`cprd`/`nr`/`qip`/`ftd`/`ord`/`qz`/`dg`（本刀 B1 面）+ 既有冻结格式登记（`qgen-`/`rgen-`/`rrun-`/`qrecipe-`/`rrecipe-`/`rcite-`/`rbind-`/`rpolicy-`/`ntf_` 派生）。**新前缀须先登记再使用**（fail-closed：未登记前缀 `newEntityId` throw）。

---

## 5. Prove 设计（新 `packages/db/test/db-id-v7.proof.ts` · `pnpm db-id-v7:prove` · EXIT=0）

对隔离 PostgreSQL（`assertIsolatedTestTarget` + 增量迁移到 0143），全断言 PASS 才 EXIT=0：

| 块 | 断言 |
|----|------|
| P1 SQL 函数位域 | `uuidv7()` 1000 次调用：版本位=0111（32hex 尾巴第 13 字符=7）· variant=10 · 前 12hex=unix_ms 落在 [now-5s, now+5s] 窗口 · **timestamp 非降（1000 次）** · 同 ms 随机尾部**碰撞 0/1000** · 跨事务单调（两连接交替提交，按 commit 序 timestamp 非降·同 ms 允许并列） |
| P2 RFC 9562 KAT | `uuidv7_from_parts(0x017F22E279B0, 0xCC3, ...)` 位域复算 = `017f22e2-79b0-7cc3-98c4-dc0c0c07398f`（§2.1 向量 · SQL 与 TS 双实现各自复算互比 + 硬编码期望值三方一致） |
| P3 工厂校验 | `newEntityId`：未登记前缀 throw（白名单 fail-closed）· 长度=len(prefix)+1+32 · 尾巴 `[0-9a-f]{32}` · 版本位=7 · **10000 次零碰撞** · **字典序=生成序（Spearman=1.0 阈值 ≥0.999**，同 ms 计数器保证）· `newUuidV7()` 连字符形态且 round-trip 进 uuid 列 |
| P4 catalog 断言 | `information_schema.columns`：§2.3 全 55 表 `column_default` 含 `uuidv7()` · 4 张 bigint/6 张 boolean 表 DEFAULT 原样 · 5 张无 DEFAULT uuid 表仍无 DEFAULT |
| P5 INSERT 冒烟 | `entitlement_consumption`/`commerce_outbox` 无 id INSERT…RETURNING：id 前 12hex → unix_ms ∈ [now-60s, now+5s] · B2 路径：`newUuidV7()` 供显式 id 插入 `interview_answer_job` 冒烟同样断言 |
| P6 静态契约门 | 新 migration 文本 grep：**零** `UPDATE`/`DELETE`/`DROP COLUMN`/`ALTER COLUMN … TYPE`/`ADD CONSTRAINT`/触发器语句——仅允许 `CREATE FUNCTION` + `ALTER … SET DEFAULT`（append-only 硬保证落 prove） |

**纪律**：EXIT=0 一次过；**attempts 全账**（每次运行无论红绿都记录）；**Ban retry-to-green**（红后修因重跑须留痕并说明，不得静默洗绿）。

---

## 6. 硬 Ban（EXEC 期同样有效）

1. **Ban 任何存量行 ID 改写/回填**（append-only：v4 行、40 字符 text 行全部原样保留）。
2. **Ban 改列类型 / FK / RLS / 权限面**（A 级仅 `SET DEFAULT`）。
3. **Ban 碰 `idempotency_key` 语义**（业务幂等键 UNIQUE/ON CONFLICT 不动）。
4. **Ban 碰已闭触发器**（0020/0046 配对面及一切既有触发器）。
5. **Ban 改共享 SSOT**（north-star / hard-gates / e2e coverage 矩阵等一概不动）。
6. **Ban secrets / 真实数据入树**。
7. **Ban 本 turn 编码**（REQUEST 写完即停回报；EXEC 须双审 PASS + meetwise 明示授权）。

---

## 7. 决策点（请双审裁定）

| ID | 议题 | mw-core 建议 |
|----|------|--------------|
| D1 | A 级面：全 55 张一刀切 vs 只切「高写入」最小面（核心 6 + checkpoint 族 2 + 高写入运行时） | **全 55**（避免第四纪元；成本一致；P4 catalog 断言一次覆盖） |
| D2 | `qgen-` 点排除（格式冻结，三处契约联动，留后续刀） | **确认排除** |
| D3 | 裸 uuid→text PK 5 点残留（前缀化=对外格式变更）交 C 级裁决 | **确认残留登记** |
| D4 | `<prefix>_<32hex>` 长度修正（草案 26hex/31 为笔误） | **确认 32hex** |
| D5 | B2（int-transcript 3 点显式 id）并入本刀（否则 A 级对 interview answer 族无实效） | **确认并入** |

---

## 8. Acceptance（EXEC 后验收）

| ID | Criterion |
|----|-----------|
| A1 | 新 migration（0143）仅 CREATE FUNCTION + 55 条 SET DEFAULT（P6 静态门绿） |
| A2 | `db-id-v7.proof.ts` EXIT=0（P1–P6 全 PASS · attempts 全账） |
| A3 | B1 15 点 + B2 3 点全部替换、无 `prefix+randomUUID()` 残留（除 §3.4 登记面） |
| A4 | `ids.ts` + 前缀白名单 + C 级规范文档 + 注册表落地 |
| A5 | 存量数据零变化（无回填 DDL · 无 UPDATE/DELETE） |
| A6 | pins 全保留（§首行 · 无一翻转） |

---

## 9. 流程与产物

**流程**：REQUEST（本档）→ 预执行双审（`mw-model-op` + `mw-e2e-ha`）→ **meetwise 授权** → EXEC（migration 0143 + `ids.ts` + 18 替换点 + prove + 规范文档）→ post-prove 双审 → **meetwise 授权 nail**。

**EXEC 文件面（预告 · 本 turn 不动）**：

| 文件 | 动作 |
|------|------|
| `packages/db/migrations/0143_db_id_v7_unify.sql` | 新增（uuidv7 函数 + 55 条 SET DEFAULT） |
| `packages/db/src/ids.ts` | 新增（newEntityId/newUuidV7 + 白名单） |
| `packages/db/src/index.ts` | 导出 ids.ts 面 |
| §3.2/§3.3 的 18 个 file:line | 逐点替换 |
| `packages/db/test/db-id-v7.proof.ts` | 新增 prove |
| `package.json` | `db-id-v7:prove` script |
| `ai-docs/architecture/backend/id-convention.md` | 新增 C 级规范 + 前缀注册表 |

---

## Non-claims

Not HA · not suite green · not SLO/性能改善量化声明 · not 存量 ID 迁移 · not 列类型/FK/RLS 变更 · not MySQL/Qdrant 重开 · not coding authorized（Dual PASS ≠ 开工）· not 覆盖任何 e2e 门（coveredCount=8 不变）· `releaseEvidence=false` · `actualSpendCny=null`。

---

*Harness · DBID-1 ID 统一优化刀 REQUEST · 2026-10-08 · draft:awaiting_pre_exec_dual · parent `0fe96fca` · docs-only · pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · Dual PASS ≠ 开工 · Ban self-approve*

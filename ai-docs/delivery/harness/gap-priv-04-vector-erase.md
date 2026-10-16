# Harness — **PRIV4 · GAP-PRIV-04 vector erase**（向量面 pgvector 擦除 · REQUEST docs-only · backlog `:60` OPEN · DELETE=503 · PG-retained · **≠ AR `:64`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（REQUEST docs-only · 本 commit 零 coding / 零 prove / 零产品码 · Ban coding until PRE dual **BOTH PASS** `mw-privacy-int` + `mw-e2e-ha` + 协调方 AUTHORIZE · Ban self-approve · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · **PG-retained** · public DELETE stays **503** · backlog `:60` OPEN · `:64` OPEN · UC-052 partial · canHonestlyFlip=false
**Date**: 2026-10-07
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`14c14a31`** / full `14c14a316477745d142bbd02ba383e477888adde`（MOP01 nail tip · 开工时点 origin 最新 tip；开工前首次 fetch 观测 tip 为 `2fd78ea1`，随后被并发 nail 前移至 `14c14a31`——delta 恰 backlog `:81` 后 MOP01 立卷 append-only 两条 + checklist 对应段，**与本刀面零交集**，backlog `:60`/`:64` 锚零位移（diff hunk `@@ -81,6 +81,8 @@` 实测）。如实记录 tip 移动。）
**Line**: **PRIV4**（队列 Phase 3 privacy · `REMAINING-NORTH-STAR-QUEUE.md:32`「DELETE=503 freeze · INT-TRANSCRIPT-01 · GAP-PRIV-01 tenant≠RLS · GAP-PRIV-04 vector erase」）
**Experts**: `mw-privacy-int` + `mw-e2e-ha`（PRE dual · alone ≠ dual · 不代签 · backlog `:60` 域列为 privacy/rag——rag 域是否加席由协调方裁定；本 REQUEST dual 以协调方钉的两席为准）
**Authority**: meetwise — 本文件为 docs-only REQUEST（§3 loop 第③步）· **Ban coding · Ban prove · Ban push** · PRE dual BOTH PASS 后由协调方授权 coding · implementer 禁自批
**Knife**: **GAP-PRIV-04（vector erase）**· 向量面擦除诚实方案（backlog `gap-bug-backlog.md:60` · P0 · **OPEN**）
**Related（只读）**: `harness/qdrant-g5-erasure-ledger.md`（P15 · **STOPPED / superseded by PG-retained**）· `harness/qdrant-g5-ledger-map.md`（P16 · 同 STOPPED）· `harness/qdrant-store.prototype.md` · `harness/uc-e2e-050-052-privacy-erasure.md`（UC-052 partial）· `harness/privacy-erasure-http-503-pin.md`（DELETE=503）· `architecture/ai/privacy-deletion-sink-inventory.md`（§3.2/§5）· 0091 · 0125 · AR 线 `71713718`（`:64` OPEN · 边界 cite-only）

## 0. 为何新开文件（≠ AR `:64` wash · ≠ G5 复活）

1. **向量面 ≠ external sink 面**。AR 线（`71713718` · `post_prove_dual_pass`）钉的是 backlog `:64` GAP-PRIV-EXTERNAL-SINK-RETENTION（oss/redis/langfuse async purge · `local_isolated_stub` PATH · **stub≠cloud** · **cloudVendorDeleted=false** · NB-3 · **`:64` stays OPEN**）。本刀只做 **向量面（PG pgvector）** 擦除 REQUEST。**Ban 借 AR 的证据/状态** · **Ban 洗 AR `:64` 的 OPEN 钉** · 两面的 receipt 与证据类不得互相抵扣。
2. **G5 Qdrant 不复活**。`qdrant-g5-erasure-ledger.md` / `qdrant-g5-ledger-map.md` 已被 Meetwise 裁定 **STOPPED / superseded by PG-retained**（vector does NOT migrate to Qdrant · Ban replace-pgvector / sole-Qdrant-vector cutover）。本刀 **不** 把 Qdrant 路线当作实现路径；P15/P16 仅作为诚实先例 cite（subject erase + countable receipt + recall=0 的证据形状；receipt→0091 mapping + fail-closed PREREQ 的方法形状）。Qdrant 保持 prototype 面（matrix `:212` QDRANT-SKEL partial）。
3. **backlog `:60` 现状列与目标列的诚实读法**：现状列「关系库有 `memory_vector_chunk` 先例；Qdrant 尚未登记为可证明擦除 sink……仍 ≠ 0091 可写/对齐 / 公开 DELETE 仍 503」——在 PG-retained 钉下，本刀按其诚实内核（**向量/题库 chunk 擦除 + 0091 对齐缺口**）在 **PG 面** 推进；目标列「Qdrant as erasure sink」**不** 作为本刀路线。`:60` 本 commit **零 SSOT 编辑**（不翻行 · stays OPEN）。

## 1. Cited evidence（只读 · Ban re-prove）

| Item | 出处 / note |
|------|------------|
| `memory_vector_chunk` 先例 | `packages/db/migrations/0125_memory_vector_chunk_erasure.sql`：① sink CHECK 扩 `memory_vector_chunk`；② ACL+RLS（`privacy_worker_owner` 仅 owner_user_id=principal AND kind='memory' AND target 已建 可 DELETE）；③ 写围栏 `memory_vector_chunk_erasure_active` + `enforce_memory_vector_chunk_erasure_fence`（`42501 memory_vector_chunk_erasure_fenced`）；④ begin/claim/purge 物理 DELETE `owner=principal AND kind='memory'` · 残留=0 · **永不 DELETE kind='qbank'** · 公开 DELETE 保持 503 |
| 向量数据面 DDL | `packages/db/migrations/0001_baseline.sql:279-300`：`vector_chunk`（id / owner_user_id / kind∈{qbank,memory} / ref_id / content_hash / **`embedding vector(512) NOT NULL`**）· HNSW `ix_vchunk_hnsw (embedding vector_cosine_ops)` · RLS on owner_user_id ·「只存向量+引用 id+hash，不存原文 PII」 |
| 0091 主链（Ban 动） | `packages/db/migrations/0091_privacy_authorization_issuer.sql`：PrivacyAuthorizationIssuer（ECDSA P-256 短时快照 · 单次消费 · `privacy_epoch`+`target_set_digest`）· `privacy_deletion_receipt` per-sink receipt · **completed guard（0091 L516–545）**：completed iff every target `erased` AND 无 `external_pending`/`failed_cleanup` |
| DELETE=503 冻结 | `apps/api/src/modules/privacy/privacy.controller.ts:51-52`（`@Delete('interview-data/:id')` + `@HttpCode(SERVICE_UNAVAILABLE)`）· `privacy.service.ts:54-56`（throw `interview_erasure_authorization_not_available`）· GAP-PRIV-02（`:58`）「必须保持 503（冻结）」 |
| AR 边界 | `71713718`（nail AR）：`:64` OPEN · stub≠cloud · cloudVendorDeleted=false · NB-3 `external_confirmed` ≠ vendor deleted · Ban count-as-erased——**cite only · Ban 借证据/状态 · Ban 洗 OPEN 钉** |
| sink inventory | `architecture/ai/privacy-deletion-sink-inventory.md`：`memory_vector_chunk` 本迭代闭合（§3.2/§5）；sink=`'vector'` INT 无 interview 作用域键 → 面试删除诚实不建 target；`0107 memory_deletion_target.sink` 7 值 CHECK 不含向量块 |
| prove 先例 CMD | `package.json:339` `memory-vector-chunk-erasure:prove` · `:351` `privacy-erasure:http:prove` · `:236` `vectorstore:prove`（均经 `scripts/run-e2e-isolated.mjs` 隔离真 PG）· `qdrant-store:g5-erasure:prove` / `g5-ledger-map:prove`（P15/P16 · STOPPED 面仅 cite） |

## 2. 向量数据面（只读定位 · 本 REQUEST 的事实基线）

**一句话**：生产向量真相 = PG `vector_chunk` 表（`embedding vector(512)` 列 + HNSW 索引，PG-retained）；owner 级 memory 块已有 0125 物理擦除路径（账户轨道 · 残留=0）；qbank 块按设计永不随 subject 删；INT `sink='vector'` 无面试作用域键（诚实不建 target）；Qdrant 为 prototype 面（非 0091 sink）；公开 DELETE=503。

| 向量面 | 载体 | 今日擦除现状 |
|--------|------|--------------|
| owner 记忆向量 | `vector_chunk` `kind='memory'` | **已闭合**（0125 账户轨道：target + 写围栏 + 物理 DELETE + 残留=0）· 本刀 **不重做** |
| INT 面试向量 | sink=`'vector'`（`privacy_deletion_target.sink` CHECK 已含该值） | **未闭合**：无 interview 作用域键 → 诚实不建 target（0125 头注）· 本刀候选面 |
| qbank 题库向量 | `vector_chunk` `kind='qbank'` + 0029 generation 分区（`embedding vector(512)` + per-generation HNSW）+ 0032 corpus `p_*` 表 | 共享语料 · **设计上不随 subject 删除**（visible/版本控制）· 本刀只诚实披露边界，**Ban 借刀删共享语料** |
| Qdrant prototype | `packages/qdrant-store`（`erasure.ts` / `ledger-receipt-map.ts`） | prototype · **非 0091 sink** · PG-retained 钉下不切真相 · P15/P16 诚实钉 retained |

## 3. 本刀范围（拟 · 未授权 · PRE dual 裁定后才行 coding/prove）

### 3.1 擦除方案候选（列利弊 · **交双审裁** · 实现方倾向非绑定）

| 候选 | 形状 | 利 | 弊 / 诚实代价 |
|------|------|-----|---------------|
| **A 软删标记（fence-first）** | 向量行/owner 级加擦除标记（如 `erased_at`）+ 检索/读路径 fence + 写围栏沿用 0125 形 | 可逆可审计 · 迁移面最小 · 先闭合「不可检索」语义 · 与 0125 围栏同形 | embedding 字节仍驻磁盘与 HNSW 索引——**非物理擦除**；receipt 只能诚实写 soft/fenced，**Ban 写成 `erased`**；与 0091 `status='erased'` 语义冲突（动语义须显式申报，默认 Ban）；留「假彻底删除」洗白风险 |
| **B 物理删除（0125 同形扩展）** | privacy worker 在授权 target 集内物理 DELETE subject 作用域向量行（owner/kind 谓词沿用 0125）+ 残留=0 快照 + fence 防复活 | 0125 已验证同形（target+fence+begin/claim/purge+残留=0）· 证据最强 · 与「擦除」字面语义一致 | 不可逆 · scope 键必须精确（owner+kind）防越界删 qbank/shared；HNSW 索引内部页 / WAL / 快照备份不在行级证据面——**须如实披露**（行不可检索 recall=0 是口径，**Ban 写「磁盘字节清零」**） |
| **C 擦除收据链（0091 对齐收尾）** | 向量面 per-sink receipt（复用 0091 `privacy_deletion_receipt` **现有**形状/函数，零语义改动）+ subject recall=0 + countable receipt（P15 证据形状）→ 对齐 completed guard（L516–545） | 与 UC-052/0125 闭环同构 · 审计链完整 · 正面回应 backlog `:60`「仍 ≠ 0091 可写/对齐」缺口 | 触 ledger 接线/登记面——**0091 语义不动除非显式申报**；范围最大可能溢出本刀；做成必须显式申报对齐，做不成 EXIT1 诚实保留 |

**实现方倾向（非绑定 · PRE dual 裁定）**：B 为向量面主体 + C 的 receipt 证据类为收尾；A 仅可作 fence 增强 additive，**不得**作为唯一擦除语义（Ban 以 soft 标记宣称 erased）。最终组合由 PRE dual 裁定并写入 AUTHORIZE 记录。

### 3.2 触碰 file 清单（拟 · 未授权）

- `packages/db/migrations/014?_vector_plane_erasure.sql`（**新增** · 编号以开工时 main tip 为准 · **Ban 抢号**——0124/0125 抢号先例注释为戒）
- `packages/db/src/`（向量擦除函数/caller——扩 0125 家族或新模块）
- `apps/api/src/modules/privacy/privacy.service.ts`（仅 sweep/preview 面；`eraseInterviewData` 503 一字不动）
- `apps/worker/`（privacy worker executor 向量 sweep 步）
- `scripts/run-e2e-isolated.mjs` + `package.json`（具名 prove CMD 注册 · 沿 `memory-vector-chunk-erasure:prove` 先例）
- prove proof 文件（`packages/db/test/*.proof.ts` 惯例）

### 3.3 明确非目标（Ban）

- **Ban 借刀动 authorization/issuer 主链**：0091 issuer / `privacy_authorization_snapshot` / `privacy_epoch`+`target_set_digest` 语义 **不动**（候选 C 若确须动语义 → 必须显式申报 + 双审，否则 Ban）
- Ban 动 `privacy.controller.ts` 503 · Ban 开公开 DELETE · Ban 动 0137/0140 external 链 · Ban 动 AR 线文件（`ar-gap-priv-external-sink-async-purge.*`）
- Ban 动 GAP-PRIV-01 tenant/RLS 面（`:57` 另行）· Ban 动 GAP-PRIV-AUTHZ-PROVE-FLAKE `:68` 面 · Ban 复活 Qdrant cutover · Ban replace-pgvector
- Ban 删 `kind='qbank'`/共享语料 · Ban 把 INT `sink='vector'` 假造出面试作用域键（无键=诚实不建 target 的现状保持）
- Ban SSOT 翻行（backlog `:60`/`:64` · checklist · matrix——本 commit 4 文件 docs-only 零 SSOT 编辑；additive pointer 若需要由协调方/nail 期决定）

## 4. prove 方案（授权后 · Ban live · 本 REQUEST 零 prove）

- **CMD（拟 · PRE dual 裁定确切名）**：`pnpm vector-plane-erasure:prove`（或扩 `memory-vector-chunk-erasure:prove` 家族）via `scripts/run-e2e-isolated.mjs` · **隔离真 PG**（pgvector fixture 惯例 · `E2E_PG_IMAGE=pgvector`）· **Ban live 云端** · 默认剥 `MODEL_API_KEY`。
- **向量面快照（擦除前/后）**：per `(owner_user_id, kind)` 行数 · `content_hash` 集合 digest · embedding 聚合 hash；跨 subject 面与 qbank 面 **不变快照**。
- **fail-closed 断言（拟）**：
  1. **未授权拒绝**：无有效 issuer 授权路径（无 consumed `privacy_authorization` 快照）→ 擦除被拒（fence/403）——红灯；
  2. **授权后不可检索**：subject 向量 recall=0（ANN probe 0 hit）+ 目标行数=0 + 残留快照=0；
  3. **跨 subject intact** + **qbank intact**（永不删）；
  4. **公开 DELETE 仍 503**（`pnpm privacy-erasure:http:prove` 同列入账）。
- **EXIT 契约**：EXIT0 ≠ covered ≠ `:60` CLOSED ≠ UC-052 flip ≠ DELETE 开放 ≠ HA ≠「彻底删除」宣称；**EXIT1 = 诚实保留**（做不出 → 保留，attempts 全记录 Asia/Shanghai + commit SHA，**Ban retry-to-green**，Ban 换弱断言凑绿）；PREREQ 缺（隔离 PG 起不来/fixture 失败）→ 预期非零 EXIT 且如实记录（沿 G5 fail-closed `EXIT=3` 惯例）。

## 5. 诚实条款

- **cloudVendorDeleted 类披露沿 AR 口径**：本地/隔离环境（`local_isolated` PG）擦除证据 **≠ 生产云端删除**；备份 / WAL / HNSW 索引内部页 / 副本不在本刀证据面——**如实披露**。
- **Ban 把本地擦除写成「数据已彻底删除」**：任何「erasure complete / 数据已彻底删除」叙事均为假绿；本刀证据口径 = 授权后 subject 向量行物理不可存 + recall=0 + 残留=0 快照。
- NB-3 属 external 面（AR）；本刀边界写清：向量面（PG 本地）receipt/证据 **≠** AR `:64` external sink（oss/redis/langfuse）面证据，互不抵扣。

## 6. 行语义（冻结 · 本 REQUEST）

- backlog `:60` **GAP-PRIV-04 stays OPEN** · 本 commit 零 SSOT 编辑 · canHonestlyFlip=false。
- UC-052 / privacy 行 stays **partial** · DELETE=503 · coveredCount=8 · EXIT0 ≠ 翻行。
- AR `:64` stays **OPEN**（Ban wash）· NB-3 held（external 面）· PG-retained（Ban Qdrant cutover）。
- GAP-PRIV-01（tenant≠RLS）另行 · GAP-PRIV-AUTHZ-PROVE-FLAKE（`:68`）stays OPEN mitigated/cause-unknown。

## 7. Ban 列表

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban push · Ban self-nail · Ban self-approve（alone ≠ dual）· **Ban 借刀动 authorization/issuer 主链（0091 语义不动除非显式申报）** · **Ban 开公开 DELETE（DELETE=503 保持）** · Ban 把 soft 标记/fence 写成 erased/彻底删除 · **Ban 借 AR `:64` 证据/状态 · Ban 洗 `:64` OPEN 钉** · Ban count-as-erased（沿 AR 口径用于任何面）· Ban flip UC-050/051/052 covered · Ban SSOT 翻行（`:60`/`:64`/checklist/matrix）· Ban Qdrant / replace-pgvector cutover（PG-retained）· Ban 删 qbank/共享语料 · Ban retry-to-green · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban buy cloud · Ban 冒充 dual / 代签 · Ban product/infra code this turn。

## 8. Non-claims

Not a pass · not run · not erased · not deleted · not covered · not closed · not 0091-writable/aligned · not vendor/cloud wiped · not open DELETE · not HA · not releaseEvidence · alone ≠ dual · 本地/隔离擦除证据 ≠ 生产彻底删除 · 本 REQUEST docs-only（4 文件 · 零产品码 · 零 SSOT 编辑）。

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · **PG-retained** · public DELETE=503 · backlog `:60` OPEN · `:64` OPEN · UC-052 partial · canHonestlyFlip=false · **STOP**

---

*Harness · PRIV4 GAP-PRIV-04 vector erase · 2026-10-07 · `draft:awaiting_pre_exec_dual` · Ban coding until PRE dual BOTH PASS (mw-privacy-int + mw-e2e-ha) + 协调方 AUTHORIZE · Ban prove · Ban push · DELETE=503 · `:60` OPEN · PG-retained · ≠ AR `:64` · alone ≠ dual · STOP*

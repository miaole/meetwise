# Slice — **PRIV4 · GAP-PRIV-04 vector erase**（向量面 pgvector 擦除 · REQUEST docs-only · backlog `:60` OPEN · DELETE=503 · PG-retained · ≠ AR `:64`）

**Status**: **`draft:awaiting_pre_exec_dual`**（REQUEST docs-only · 零 coding / 零 prove · Ban coding until PRE dual BOTH PASS + coordinator AUTHORIZE · Ban self-approve · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · **PG-retained** · public DELETE stays **503** · backlog `:60` OPEN · `:64` OPEN · UC-052 partial · canHonestlyFlip=false
**Date**: 2026-10-07
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`14c14a31`** / full `14c14a316477745d142bbd02ba383e477888adde`（MOP01 nail tip · 开工时点 origin 最新 tip · 首测 tip `2fd78ea1` 被并发 nail 前移 · delta 恰 backlog `:81` 后 MOP01 立卷 append + checklist 段 · **与本刀面零交集** · `:60`/`:64` 锚零位移 · 如实记录）
**Authority**: meetwise — docs-only REQUEST（§3 loop 第③步）· Ban coding · Ban prove · Ban push · PRE dual BOTH PASS（mw-privacy-int + mw-e2e-ha）后由协调方授权 coding · implementer 禁自批
**Line**: **PRIV4**（队列 Phase 3 privacy · `REMAINING-NORTH-STAR-QUEUE.md:32`）

## One-line

backlog `:60` **GAP-PRIV-04** **OPEN**：向量/题库 chunk 擦除——PG `vector_chunk`（`embedding vector(512)` + HNSW）是生产向量真相（PG-retained）；owner 级 memory 块已由 0125 `memory_vector_chunk` 物理擦除先例闭合；Qdrant 面在 PG-retained 裁定下不切真相（P15/P16 STOPPED 保留为诚实先例）；本 REQUEST 在 PG 面开向量擦除诚实刀：**候选 A 软删标记 / B 物理删除（0125 同形）/ C 擦除收据链（0091 现有形状对齐）列利弊交双审裁** · **Ban 借刀动 authorization/issuer 主链（0091 语义不动除非显式申报）** · **Ban 借 AR `:64` 证据/状态 · Ban 洗 `:64` OPEN 钉** · 公开 DELETE=503 保持 · UC-052 stays partial · `:60` stays OPEN · alone≠dual。

## Evidence（cite only · Ban re-prove）

| Item | SHA / note |
|------|------------|
| 向量数据面 | `packages/db/migrations/0001_baseline.sql:279-300` · `vector_chunk` · **`embedding vector(512) NOT NULL`** · HNSW `ix_vchunk_hnsw (vector_cosine_ops)` · kind∈{qbank,memory} · RLS owner_user_id |
| 擦除先例 | `packages/db/migrations/0125_memory_vector_chunk_erasure.sql` · sink CHECK 扩展 + owner/kind 双谓词 RLS + 写围栏（`42501 memory_vector_chunk_erasure_fenced`）+ begin/claim/purge 物理 DELETE 残留=0 · **永不 DELETE kind='qbank'** |
| 0091 主链（Ban 动） | `packages/db/migrations/0091_privacy_authorization_issuer.sql` · issuer 快照单次消费 + `privacy_deletion_receipt` + completed guard L516–545 |
| DELETE=503 | `privacy.controller.ts:51-52` + `privacy.service.ts:54-56` · GAP-PRIV-02（`:58` 冻结）· `harness/privacy-erasure-http-503-pin.md` |
| G5/Qdrant（PG-retained） | `harness/qdrant-g5-erasure-ledger.md`（P15）+ `harness/qdrant-g5-ledger-map.md`（P16）**STOPPED / superseded by PG-retained** · Qdrant ≠ 0091 sink（matrix `:212` QDRANT-SKEL partial） |
| AR 边界 | `71713718` nail · `:64` OPEN · stub≠cloud · cloudVendorDeleted=false · NB-3 · **cite only · Ban 借 · Ban 洗** |
| UC-052 | `harness/uc-e2e-050-052-privacy-erasure.md` · stays **partial** |
| sink inventory | `architecture/ai/privacy-deletion-sink-inventory.md` §3.2/§5 · `memory_vector_chunk` 本迭代闭合 · sink=`'vector'` INT 无 interview 作用域键（诚实不建 target） |

## Products

| Role | Path |
|------|------|
| Harness | `ai-docs/delivery/harness/gap-priv-04-vector-erase.md` |
| Slice | `ai-docs/delivery/gap-priv-04-vector-erase.slice.md`（本文件） |
| Dual stub `mw-privacy-int` | `ai-docs/delivery/reviews/REQUEST-2026-10-07-gap-priv-04-vector-erase-mw-privacy-int.md`（PENDING · 不代填 Verdict） |
| Dual stub `mw-e2e-ha` | `ai-docs/delivery/reviews/REQUEST-2026-10-07-gap-priv-04-vector-erase-mw-e2e-ha.md`（PENDING · 不代填 Verdict） |

**本 commit = 上述恰 4 文件 docs-only**（零 SSOT 编辑 · backlog/checklist/matrix 不在 diff · 零产品码 / migration / script）。

## Scope（拟 · 未授权 · PRE dual 裁定）

- **候选 A 软删标记**：fence-first · 利=可逆可审/迁移小 · 弊=非物理擦除（字节仍驻）· Ban 以 soft 标记宣称 erased · 仅可作 additive 增强。
- **候选 B 物理删除**：0125 同形扩展（target+fence+begin/claim/purge+残留=0）· 利=先例同形证据最强 · 弊=不可逆/scope 键须精确防越界 qbank/HNSW 索引内部页+WAL+备份不在证据面（如实披露）。
- **候选 C 擦除收据链**：复用 0091 `privacy_deletion_receipt` 现有形状/函数 + recall=0 + countable receipt 对齐 completed guard · 利=正面回应 `:60`「≠ 0091 可写/对齐」缺口 · 弊=触 ledger 接线 · **0091 语义不动除非显式申报**。
- **实现方倾向（非绑定）**：B 主体 + C receipt 收尾；A 仅 additive。组合由 PRE dual 裁定写入 AUTHORIZE。
- **触碰 file 清单（拟）**：`packages/db/migrations/014?_vector_plane_erasure.sql`（新增 · Ban 抢号）· `packages/db/src/` · `apps/api/src/modules/privacy/privacy.service.ts`（503 一字不动）· `apps/worker/` · `scripts/run-e2e-isolated.mjs`+`package.json`（具名 CMD）· proof 文件。
- **非目标**：0091 issuer/authorization 语义 · `privacy.controller.ts` 503 · 0137/0140 · AR 线文件 · GAP-PRIV-01 RLS 面 · `:68` flake 面 · Qdrant cutover · qbank/共享语料删除 · SSOT 翻行。

## Prove plan（授权后 · Ban live · 本 REQUEST 零 prove）

- 具名 CMD（拟 · PRE dual 裁定）：`pnpm vector-plane-erasure:prove`（或扩 `memory-vector-chunk-erasure:prove` 家族）via `run-e2e-isolated.mjs` · **隔离真 PG**（pgvector fixture 惯例）· Ban live 云端。
- **快照**：擦除前/后 per `(owner_user_id, kind)` 行数 + `content_hash` digest + embedding 聚合 hash；跨 subject 与 qbank 面不变快照。
- **fail-closed 断言**：未授权擦除拒绝（fence/403 红）· 授权后 subject 向量 recall=0 + 行数=0 + 残留=0 · 跨 subject intact · qbank intact · 公开 DELETE 仍 503 同列入账。
- **EXIT 契约**：EXIT0 ≠ covered ≠ `:60` CLOSED ≠ UC-052 flip ≠ DELETE 开放 ≠ HA ≠ 彻底删除宣称；EXIT1=诚实保留 · attempts 全录（Asia/Shanghai+SHA）· **Ban retry-to-green**；PREREQ 缺 → 预期非零 EXIT 且记录。

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban push · Ban self-nail · Ban self-approve（alone ≠ dual）· **Ban 借刀动 authorization/issuer 主链（0091 语义不动除非显式申报）** · **Ban 开公开 DELETE（DELETE=503）** · Ban 把 soft 标记/fence 写成 erased/彻底删除 · **Ban 借 AR `:64` 证据/状态 · Ban 洗 `:64` OPEN 钉** · Ban count-as-erased · Ban flip UC-050/051/052 covered · Ban SSOT 翻行（`:60`/`:64`/checklist/matrix）· Ban Qdrant / replace-pgvector cutover（PG-retained）· Ban 删 qbank/共享语料 · Ban retry-to-green · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban buy cloud · Ban 冒充 dual / 代签 · Ban product/infra code this turn。

Pins: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · `:60` OPEN · `:64` OPEN · UC-052 partial。

---

*Slice · PRIV4 GAP-PRIV-04 vector erase · `draft:awaiting_pre_exec_dual` · 2026-10-07 · `:60` OPEN · DELETE=503 · PG-retained · Ban coding awaiting PRE BOTH + AUTHORIZE · alone ≠ dual · STOP*

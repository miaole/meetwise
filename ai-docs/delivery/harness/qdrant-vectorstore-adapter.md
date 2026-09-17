# Harness — Qdrant vectorstore adapter（G2 子切片 · real path）

**状态**：eval-honesty · **releaseEvidence=false** · **Not HA** · **≠ covered** · **≠ cutover** · **≠ RAG/memory on Qdrant** · **G2 仍 GAP**  
**平行**：`r5-retirement-sole-stack-status.md` G2 · `qdrant-backed-prove-deepen.md` · `qdrant-store.prototype.md`  
**硬句**：本绿 ≠ 已迁；**不得**把本 EXIT=0 写成 `vectorstore:prove` / `rag*` / `memory*` 已默认可信于 Qdrant；**不得**切 `E2E_ISOLATION_STACK` 默认离 `pgvector-legacy`。

---

## 1. 目标

推进 G2 的 **诚实子切片**：一条 **真实** Qdrant-backed 向量路径（thin adapter），在 live Qdrant 可用时证明 upsert + ANN search；不可用 → **EXIT=3 PREREQ**（fail-closed，禁假绿）。

| 项 | 裁定 |
|----|------|
| 包 | `@meetwise/qdrant-store` · `QdrantVectorStoreAdapter` |
| 形状 | 对齐 `retrieval-store` 字段：`upsertVectorChunk(owner, {id,kind,refId,contentHash,embedding})` / `annSearch(owner,kind,q,k) → {refId,distance}` |
| 租户 | payload filter：`qbank` 共享读；`memory` owner-only（**≠** Postgres RLS 等价证明） |
| 幂等 | point id = deterministic UUID(owner+kind+contentHash) |
| 距离 | `distance = 1 - cosine_score`（对齐 pgvector `<=>` 风格） |
| 生产 | **未**接线 `retrieval-store.annSearch`；pgvector 活路径 **intact** |

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm qdrant-store:vectorstore-adapter:prove` | **0** | honesty 钉 + live adapter upsert/annSearch OK |
| `pnpm e2e-isolation:sole-vectorstore-adapter:prove` | **0** / **3** | sole allowlist 路径（compose Qdrant）；gate receipt；**≠** 翻默认 |
| `pnpm e2e-isolation:sole-vectorstore-qdrant:prove` | **0** / **3** | sole allowlist → P12 product prove path（平行条目；本 harness 仍钉 P11） |
| （Qdrant down / 坏 `QDRANT_URL`）同上 | **3** | PREREQ fail-closed；**不得**静默绿 |
| honesty 钉失败 | **1** | 文档/默认/pgvector intact 等断言失败 |

PREREQ：

```bash
docker compose -f docker/compose.mysql-local.yml up -d qdrant
# /readyz → 200
```

可选：`QDRANT_URL`（默认 `http://127.0.0.1:6333`）。

---

## 3. Proven vs GAP（本切片）

| | 项 |
|--|-----|
| **Proven（本绿可达）** | Thin adapter 实路径：ensureCollection + upsert + annSearch（自查 + qbank 共享 + memory 私有 filter）打 live Qdrant；缺 Qdrant → EXIT=3；`annSearch` / `vectorstore.proof` / `E2E_PG_IMAGE` / 默认 `pgvector-legacy` **intact** |
| **仍 GAP** | **G2**：`vectorstore:prove` / `rag*` / `memory*` **默认**仍 `run-e2e-isolated`→pgvector；G1 默认 isolation；G3 `E2E_PG_IMAGE`；G4 R4；G5 erasure ledger；G7 HA/`releaseEvidence` |

**禁止宣称**：G2 关闭、RAG/memory/vectorstore **默认** Qdrant-backed covered、fixtures retired、cutover、sole 默认已切、HA、`releaseEvidence=true`。

---

## 4. 与既有 CMD 关系

| CMD | 关系 |
|-----|------|
| `qdrant-store:skeleton:prove` | 更底层 collection/upsert/search/erase 原型；本切片 = retrieval 形状 adapter |
| `qdrant-store:erase-honesty:prove` | count honesty；本切片不替代 |
| `mysql-stack:qdrant-backed:prove` | inventory+readyz 深挖；本切片 = 实路径 upsert/search |
| `vectorstore:prove` | **仍** pgvector-isolated（G2 GAP）；**禁止**改道本 adapter |
| `vectorstore:qdrant:prove` | P12 opt-in product prove **走本 adapter**（显式）；≠ 默认关 G2；见 `qdrant-vectorstore-prove.md` |
| `rag:qdrant:prove` / `memory:qdrant:prove` | P13 opt-in 最小 rag/memory 切片 **走本 adapter**；≠ 默认关 G2；见 `qdrant-rag-prove.md` / `qdrant-memory-prove.md` |

---

## 5. 审查

- 双域：`mw-rag-route` + `mw-e2e-ha`
- 合入/切流权在协调/用户；**禁止自批 cutover / HA / G2 关闭**
- 结论落 `ai-docs/delivery/reviews/`

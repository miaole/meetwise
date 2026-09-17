# Harness — retrieval-store backend selector → Qdrant（G2 子切片 · P14 · product-selector PREREQ）

**状态**：eval-honesty · **releaseEvidence=false** · **Not HA** · **≠ covered** · **≠ cutover** · **≠ full RAG on Qdrant** · **G2 仍 GAP**  
**平行**：`qdrant-vectorstore-prove.md`（P12）· `qdrant-rag-prove.md` / `qdrant-memory-prove.md`（P13）· `qdrant-vectorstore-adapter.md`（P11）· `r5-retirement-sole-stack-status.md` G2  
**硬句**：本绿 ≠ 已迁；**显式 opt-in only**；**不得**把本 EXIT=0 写成 `vectorstore:prove` / `rag*` / `memory*` **默认**已切 Qdrant；**不得**切 `E2E_ISOLATION_STACK` 默认离 `pgvector-legacy`；**不得**宣称 qbank generation / hybrid / HNSW / RLS / serving_scope 已迁。

---

## 1. 目标

关闭 P12/P13 文档中的 **product-selector PREREQ**（选择器未建）：在 `packages/db` 落地诚实后端选择（薄工厂，默认仍 pgvector）：

| 项 | 裁定 |
|----|------|
| Env | `RETRIEVAL_VECTOR_BACKEND`：unset/`pgvector`/`pg` → **pgvector（默认）**；`qdrant` → Qdrant adapter；未知 → throw |
| 工厂 | `packages/db/src/retrieval-backend.ts` · `resolveRetrievalVectorBackend` / `createRetrievalVectorBackend` |
| pg 路径 | `retrieval-store.ts` **仍** SQL/HNSW/RLS/qbank-generation（**未**被本切片改道） |
| Qdrant 路径 | 显式 env → `@meetwise/qdrant-store` thin adapter（**一个**诚实 code path：upsert + ANN；memory 租户过滤） |
| CMD | `pnpm retrieval-store:qdrant:prove`（**显式 opt-in**；**NOT** sole allowlist 扩面） |

### 仍诚实 PREREQ（禁假绿 · 未宣称全量 RAG）

Qdrant 选择器 **≠** 全量产品 RAG 已覆盖。下列仍需更大改写，**不得**因本绿宣称已迁：

- qbank generation 指针 + `qbank_generation_ann_search`
- `hybridQbankSearch` / `to_tsvector` 词法腿
- HNSW plan / Postgres RLS / principal session
- rag04 `serving_scope` + route snapshot
- 默认 `vectorstore:prove` / `rag*` / `memory*` isolation 迁移（**G2 仍开**）

缺 live Qdrant / 坏 `QDRANT_URL` → **EXIT=3**（fail-closed）。

---

## 2. 命令与期望 EXIT

| CMD / 条件 | 期望 EXIT | 含义 |
|------------|-----------|------|
| `pnpm retrieval-store:qdrant:prove`（Qdrant up） | **0** | honesty + default=pgvector + live `backend=qdrant` upsert/ANN + bad-URL child EXIT=3 |
| 同上 + 坏 `QDRANT_URL`（子进程钉） | 子进程 **3**；主进程在子钉通过后继续 | fail-closed；**不得**静默绿 |
| live Qdrant down / readyz 失败 | **3** | PREREQ fail-closed |
| honesty 钉失败 | **1** | 文档/默认/pgvector intact / G2 开等断言失败 |
| default/unset（工厂 resolve） | n/a（断言） | **仍** `pgvector`；不碰 Qdrant |
| `pnpm vectorstore:prove` / `rag*` / `memory*` | n/a（本轨不改） | **仍** `run-e2e-isolated`→pgvector |

PREREQ（live）：

```bash
docker compose -f docker/compose.mysql-local.yml up -d qdrant
# /readyz → 200
```

可选：`QDRANT_URL`（默认 `http://127.0.0.1:6333`）。证明 live 路径时设置 `RETRIEVAL_VECTOR_BACKEND=qdrant`（prove 内部设置）。

---

## 3. Proven vs GAP（本切片）

| | 项 |
|--|-----|
| **Proven（本绿可达）** | 产品选择器：`RETRIEVAL_VECTOR_BACKEND` 显式选 Qdrant；默认/unset=pgvector；live Qdrant memory upsert+ANN；坏 URL → EXIT=3；`retrieval-store.ts` pg 路径 intact；**G2 仍开** |
| **仍 GAP** | **G2**：`vectorstore:prove` / `rag*` / `memory*` **默认**仍 pgvector-isolated；generation/hybrid/HNSW/RLS/serving_scope 未迁；G1 默认 isolation；G3 `E2E_PG_IMAGE`；G4 R4；G5 erasure ledger；G7 HA/`releaseEvidence` |

**禁止宣称**：G2 关闭、全量 RAG/memory/vectorstore **默认** Qdrant-backed covered、fixtures retired、cutover、sole 默认已切、HA、`releaseEvidence=true`。

---

## 4. 与既有 CMD 关系

| CMD | 关系 |
|-----|------|
| `vectorstore:qdrant:prove`（P12） | 产品形 bridge prove；本切片 = **db 工厂选择器** PREREQ 关闭 |
| `rag:qdrant:prove` / `memory:qdrant:prove`（P13） | standalone 最小切片；选择器 ≠ 默认迁 rag/memory |
| `qdrant-store:vectorstore-adapter:prove`（P11） | adapter 实路径；本工厂 qdrant 分支调用同一 adapter |
| `vectorstore:prove` / `rag*` / `memory*` | **仍** pgvector-isolated（G2 GAP）；**禁止**改道 |
| sole allowlist | **本 CMD 不入 allowlist**（与 P13 同保守；≠ 扩 sole 假绿面） |

---

## 5. 审查

- 双域：`mw-rag-route` + `mw-e2e-ha`
- 合入/切流权在协调/用户；**禁止自批 cutover / HA / G2 关闭**
- 结论落 `ai-docs/delivery/reviews/`

# Review — P14 retrieval-store→Qdrant 选型（mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-10（PT）  
**结论**：**pass**（产品选择器 PREREQ 关闭；**G2 仍开**；**≠ 翻默认**；**≠ sole cutover**；**≠ full RAG covered**）  
**releaseEvidence=false** · Not HA · **standalone opt-in** · **默认仍 pgvector**

## 对照

- `packages/db/src/retrieval-backend.ts`（`RETRIEVAL_VECTOR_BACKEND` · `createRetrievalVectorBackend`）
- `harness/retrieval-backend-qdrant.md` · status **P14** · **G2**
- `pnpm retrieval-store:qdrant:prove`
- 平行：P12/P13 · qdrant-backed · `retrieval-store.ts` pg 路径 intact

## 焦点核实

| 焦点 | 结果 |
|------|------|
| 选择器 PREREQ 关 | **成立**。显式 `RETRIEVAL_VECTOR_BACKEND=qdrant` → thin adapter；unset/pgvector/pg → **pgvector**；未知 throw |
| 默认断言 pgvector | **成立**。resolve + create 默认 client-bound；`vectorstore:prove`/`rag*`/`memory*` 仍 isolated→pgvector |
| live + 坏 URL | **成立**。prove=0；整进程坏 URL=3；子进程坏 URL 钉亦 EXIT=3 |
| `retrieval-store.ts` 未偷切 | **成立**。仍 SQL/HNSW；**无** `@meetwise/qdrant-store` import；选择器为独立工厂 |
| **未入** sole allowlist | **成立**。allowlist 恰 5；无 sole-retrieval 目标 |
| G2 仍开 / ≠ 全量 covered | **成立**。generation/hybrid/HNSW/RLS/serving_scope 仍 PREREQ；status G2 字面开 |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm retrieval-store:qdrant:prove` | **0** |
| `QDRANT_URL=http://127.0.0.1:1 RETRIEVAL_VECTOR_BACKEND=qdrant pnpm retrieval-store:qdrant:prove` | **3** |
| `pnpm vectorstore:qdrant:prove`（P12） | **0** |
| `pnpm rag:qdrant:prove` / `memory:qdrant:prove`（P13） | **0** / **0** |
| `mysql-stack:qdrant-backed:prove` | **0** |

## 非宣称

禁止：G2 关闭、默认 `vectorstore`/`rag*`/`memory*` 已切 Qdrant、sole cutover / P14 入 allowlist、全量 RAG（generation/hybrid/HNSW/RLS/serving_scope）covered、夹具退役、HA、`releaseEvidence=true`。

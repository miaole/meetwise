# Review — G2 P12 vectorstore:qdrant:prove（mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-10（PT）  
**结论**：**pass**（opt-in product-shaped prove 诚实；**G2 仍开**；**opt-in ≠ 翻默认**；**retrieval-store 未挂 Qdrant**）  
**releaseEvidence=false** · Not HA · **≠ covered / ≠ fixtures retired / ≠ RAG/memory on Qdrant**

## 对照

- `harness/qdrant-vectorstore-prove.md`
- `packages/qdrant-store/src/product-vectorstore-bridge.ts`（`ProductVectorStoreQdrantBridge`）
- `pnpm vectorstore:qdrant:prove` · status **P12** · **G2**
- 平行：P11 adapter · qdrant-backed · r5-mark-red

## 焦点核实

| 焦点 | 结果 |
|------|------|
| Opt-in bridge→adapter live | **成立**。60 chunks upsert；ANN 自查；暴力余弦 5/5；幂等；qbank 共享 / memory 私有 |
| 坏 `QDRANT_URL` EXIT=3 | **成立**（PREREQ fail-closed） |
| G2 仍开 | **成立**。默认 `vectorstore:prove`/`rag*`/`memory*` 仍 pgvector-isolated；status G2 字面开 |
| opt-in ≠ 翻默认 | **成立**。仅 `vectorstore:qdrant*` 可走 qdrant-store；`pgvector-legacy` / `E2E_PG_IMAGE` intact |
| retrieval-store 未挂 Qdrant | **成立**。无 `@meetwise/qdrant` import；bridge 自钉 PREREQ（大改写前不可选） |
| 既有 prove 不回归 | **成立**（见下表） |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm vectorstore:qdrant:prove` | **0** |
| `QDRANT_URL=http://127.0.0.1:1 pnpm vectorstore:qdrant:prove` | **3** |
| `pnpm qdrant-store:vectorstore-adapter:prove` | **0** |
| `node scripts/conn-stack/mysql-stack.qdrant-backed.prove.mjs` | **0** |
| `node scripts/conn-stack/mysql-stack.r5-mark-red.proof.mjs` | **0** |

## 非宣称

禁止：G2 关闭、默认 `vectorstore:prove`/rag/memory Qdrant covered、翻 isolation 默认、夹具退役、生产后端选择器已建、cutover、HA、`releaseEvidence=true`。

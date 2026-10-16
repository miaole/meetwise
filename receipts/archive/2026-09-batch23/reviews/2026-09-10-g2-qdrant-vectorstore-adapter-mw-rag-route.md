# Review — G2 Qdrant vectorstore adapter P11（mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-10（PT）  
**结论**：**pass**（G2 子切片 real-path 诚实；**G2 仍开**；**≠ 翻默认**；**≠ RAG/memory covered**）  
**releaseEvidence=false** · Not HA · **≠ covered / ≠ fixtures retired / ≠ cutover**

## 对照

- `harness/qdrant-vectorstore-adapter.md`
- `packages/qdrant-store` · `QdrantVectorStoreAdapter` · `prove:vectorstore-adapter`
- `harness/r5-retirement-sole-stack-status.md` **P11** · **G2**
- 关联：`qdrant-backed-prove-deepen` · skeleton · r5-mark-red

## 焦点核实

| 焦点 | 结果 |
|------|------|
| Adapter live upsert/annSearch | **成立**。ensureCollection + upsert + self-recall + qbank 共享 + memory owner-only |
| 坏 `QDRANT_URL` fail-closed EXIT=3 | **成立**（PREREQ；禁假绿） |
| G2 仍开 | **成立**。status/harness/prove NOTE；`vectorstore`/`rag*`/`memory*` 仍 `run-e2e-isolated`→pgvector |
| ≠ 翻默认 | **成立**。`E2E_ISOLATION_STACK` 默认仍 `pgvector-legacy`；`annSearch` / `E2E_PG_IMAGE` intact |
| ≠ RAG/memory covered on Qdrant | **成立**。本绿仅 adapter 子路径；无脚本改道 qdrant-store |
| 既有 prove 不回归 | **成立**（见下表） |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm qdrant-store:vectorstore-adapter:prove` | **0** |
| `QDRANT_URL=http://127.0.0.1:1 pnpm qdrant-store:vectorstore-adapter:prove` | **3** |
| `pnpm qdrant-store:skeleton:prove` | **0** |
| `node scripts/conn-stack/mysql-stack.qdrant-backed.prove.mjs` | **0** |
| `node scripts/conn-stack/mysql-stack.r5-mark-red.proof.mjs` | **0** |

## 非宣称

禁止：G2 关闭、`vectorstore:prove`/rag/memory 默认 Qdrant covered、翻 `E2E_ISOLATION_STACK` 默认、夹具退役、cutover、sole 默认已切、HA、`releaseEvidence=true`。

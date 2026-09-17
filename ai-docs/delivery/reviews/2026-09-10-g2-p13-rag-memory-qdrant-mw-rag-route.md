# Review — G2 P13 rag/memory:qdrant opt-in（mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-10（PT）  
**结论**：**pass**（standalone opt-in 最小切片诚实；**G2 仍开**；**未入** sole allowlist；**≠ RAG/memory covered**）  
**releaseEvidence=false** · Not HA · **standalone ≠ 翻默认** · **≠ fixtures retired**

## 对照

- `harness/qdrant-rag-prove.md` · `harness/qdrant-memory-prove.md`
- `pnpm rag:qdrant:prove` · `pnpm memory:qdrant:prove`（packages/qdrant-store）
- status **P13** · **G2** · **P8**（恰 5；**P13 NOT on allowlist**）
- 平行：P12 `vectorstore:qdrant` · qdrant-backed · r5-mark-red

## 焦点核实

| 焦点 | 结果 |
|------|------|
| Standalone opt-in live slices | **成立**。rag=最小 qbank ANN；memory=owner-scoped vector；复用 P12 bridge |
| 坏 `QDRANT_URL` EXIT=3 | **成立**（rag + memory） |
| **未入** sole allowlist | **成立**。Set 恰 5（至 vectorstore-qdrant）；无 `sole-*-rag/memory-qdrant` 脚本；假 target → unsupported |
| G2 仍开 / ≠ 翻默认 | **成立**。默认 `rag*`/`memory*`/`vectorstore:prove` 仍 pgvector-isolated；`pgvector-legacy` intact |
| ≠ RAG/memory covered | **成立**。≠ hybrid/R4/episode/two-stage；产品 PREREQ 大改写未解 |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm rag:qdrant:prove` | **0** |
| `pnpm memory:qdrant:prove` | **0** |
| 坏 URL 同上 | **3** / **3** |
| `pnpm vectorstore:qdrant:prove` | **0** |
| `mysql-stack:qdrant-backed:prove` | **0** |
| `mysql-stack:r5-mark-red:prove` | **0** |
| sole `rag03-route:prove:raw` / `memory:prove:raw` | **3** / **3** |

## 非宣称

禁止：G2 关闭、默认 rag/memory covered、P13 已入 sole allowlist、hybrid/R4/episode/two-stage covered、翻 isolation 默认、夹具退役、HA、`releaseEvidence=true`。

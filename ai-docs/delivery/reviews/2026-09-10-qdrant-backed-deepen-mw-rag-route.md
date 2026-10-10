# Review — Qdrant-backed prove deepen（mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-10（PT）  
**结论**：**pass**（inventory + readyz 深挖诚实钉；**G2 仍 GAP**）  
**releaseEvidence=false** · Not HA · **≠ RAG/memory covered on Qdrant** · **≠ fixtures retired** · **≠ cutover**

## 对照

- `harness/qdrant-backed-prove-deepen.md`
- `scripts/conn-stack/mysql-stack.qdrant-backed.prove.mjs`
- `harness/r5-retirement-sole-stack-status.md` **P8/P9** · **G2**
- 关联：`qdrant-store` skeleton / erase-honesty（additive only）

## 焦点核实

| 焦点 | 结果 |
|------|------|
| G2 仍 GAP（vector/RAG/memory 默认非 Qdrant） | **成立**。prove NOTE + package.json 钉：`vectorstore`/`rag*`/`memory*` 仍 `run-e2e-isolated`→pgvector；无脚本静默改道 qdrant-store |
| 本绿 ≠ RAG/memory on Qdrant | **成立**。COVERED 范围仅 inventory classify + `/readyz` connect |
| 坏 `QDRANT_URL` fail-closed | **成立**。`QDRANT_URL=http://127.0.0.1:1` → **EXIT=3** PREREQ |
| sole isolated 仍 fail-closed | **成立**。`E2E_ISOLATION_STACK=mysql-qdrant-redis` + `isolated-env:prove` → **EXIT=3** |
| P8/P9 与 status 一致 | **成立**。P8=深挖 inventory/readyz；P9=additive qdrant-store；G2 字面仍开 |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm mysql-stack:qdrant-backed:prove`（默认 :6333 up） | **0** |
| `QDRANT_URL=http://127.0.0.1:1 … qdrant-backed:prove` | **3** |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node scripts/run-e2e-isolated.mjs isolated-env:prove` | **3** |

## 非宣称

禁止：G2 关闭、RAG/memory/vectorstore Qdrant-backed covered、夹具退役、annSearch 已切、0091 ledger、sole 默认已切、HA、`releaseEvidence=true`。

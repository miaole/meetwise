# Review — Sole wiring（RAG 域 mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-10（PT）  
**结论**：**pass**（allowlist wiring 诚实前进；**G1/G2 仍开**）  
**releaseEvidence=false** · Not HA · **allowlist ≠ default** · **≠ covered / ≠ fixtures retired** · **≠ RAG/memory on Qdrant**

## 对照

- `harness/r5-retirement-sole-stack-status.md`（P8 · **G1/G2** · L1 GAP）
- `scripts/conn-stack/mysql-stack.sole-wiring.proof.mjs`（+ root forwarder）
- `scripts/run-e2e-isolated.mjs`：`SOLE_WIRING_ALLOWLIST={sole-stack:wiring:prove}`
- 关联：`mysql-stack:qdrant-backed:prove`（G2 inventory 钉）

## 焦点核实

| 焦点 | 结果 |
|------|------|
| Qdrant live prove 诚实 | **成立**。sole-wiring 对 `:6333/readyz` 实探；坏 `QDRANT_URL`（非 :6333 / 不可达）→ **EXIT=1** fail-closed；本绿仅 connect + env 证言 |
| G1 仍开（默认仍 `pgvector-legacy`） | **成立**。未设 `E2E_ISOLATION_STACK` → banner **R5-MARKED-RED** `pgvector-legacy` · leaf EXIT=0 |
| G2 仍开（RAG/memory 非 Qdrant 默认） | **成立**。`qdrant-backed:prove` EXIT=0 仍钉 `vectorstore`/`rag*`/`memory*` pgvector-isolated；status G2 字面开 |
| allowlist ≠ default | **成立**。sole 仅 `sole-stack:wiring:prove` 可绿；同栈 `isolated-env:prove` → **EXIT=3** + PREREQ（含 G2） |
| 本绿 ≠ 退役 / covered | **成立**。receipt `claimsForbidden` + harness NOTE；共享 `compose.mysql-local` ≠ disposable |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `node scripts/conn-stack/mysql-stack.sole-wiring.proof.mjs` | **0**（mysql+redis+qdrant readyz） |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node scripts/run-e2e-isolated.mjs sole-stack:wiring:prove` | **0**（`R5-SOLE-WIRING` banner） |
| 同栈 `… isolated-env:prove`（非 allowlist） | **3** |
| 默认（无 stack）`… isolated-env:prove` | **0** + **pgvector-legacy** |
| `QDRANT_URL=http://127.0.0.1:1` sole-wiring | **1** |
| `node scripts/conn-stack/mysql-stack.qdrant-backed.prove.mjs` | **0**（**G2 仍开**） |

## 非宣称

禁止：G1/G2 关闭、isolated 默认已切 sole、RAG/memory Qdrant-backed covered、夹具退役、`E2E_PG_IMAGE` 退役、disposable sole isolation、cutover、HA、`releaseEvidence=true`。

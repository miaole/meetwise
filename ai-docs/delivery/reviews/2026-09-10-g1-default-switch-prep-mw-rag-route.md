# Review — G1 default-switch PREP（mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-10（PT）  
**结论**：**pass**（PREP 诚实；**default 仍 `pgvector-legacy`**；**无 sole 默认赋值**；**flip NOT open**）  
**releaseEvidence=false** · Not HA · **prep landed ≠ flip** · **G1 仍 OPEN** · **禁止假翻默认**

## 对照

- `harness/g1-default-switch-prep.md`
- `scripts/g1-default-switch-prep.proof.mjs` · `pnpm g1-default-switch:prep:prove`
- `scripts/run-e2e-isolated.mjs`（`LEGACY_STACK` / 缺省写入）
- status **G1**（prep landed · flip NOT open）

## 焦点核实

| 焦点 | 结果 |
|------|------|
| prove 钉 default 仍 legacy | **成立**。`LEGACY_STACK='pgvector-legacy'`；unset → raw || LEGACY_STACK 并写入 env |
| 无 sole 默认赋值 | **成立**。无 `|| SOLE_STACK`；prep prove / package script **不**设 `E2E_ISOLATION_STACK=mysql-qdrant-redis` |
| 运行时默认仍 legacy | **成立**。无 stack 跑 `isolated-env:prove` → banner **R5-MARKED-RED** `pgvector-legacy` |
| PREP ≠ flip / G1 关 | **成立**。harness FORBIDDEN 本轮翻默认；status flip NOT open；G2 仍开 |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm g1-default-switch:prep:prove` | **0** |
| 默认（无 `E2E_ISOLATION_STACK`）`… isolated-env:prove` | **0** + **pgvector-legacy** banner |

## 非宣称

禁止：G1 关闭、默认已切 `mysql-qdrant-redis`、flip open、L1 关闭、fixtures retired、假翻默认、HA、`releaseEvidence=true`。

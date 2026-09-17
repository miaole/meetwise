# Review — P8 sole allowlist 扩量（mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-10（PT）  
**结论**：**pass**（保守扩量诚实；**未**纳入 rag/memory/默认 vectorstore；**G2 仍开**）  
**releaseEvidence=false** · Not HA · **≠ covered / ≠ 默认已切 sole / ≠ fixtures retired**

## 对照

- `scripts/run-e2e-isolated.mjs` · `SOLE_WIRING_ALLOWLIST`
- `harness/r5-retirement-sole-stack-status.md` **P8** · **G1/G2**
- `package.json` · `e2e-isolation:sole-*:prove`

## Allowlist（核实）

`sole-stack:{wiring,ping,qdrant-backed,vectorstore-adapter}:prove`  
注释钉：**NEVER include rag*/memory*/vectorstore:prove until G2 defaults Qdrant-backed**。

**不在 allowlist**：`memory:prove:raw` · `rag03-route:prove:raw` · `vectorstore:prove:raw` · `isolated-env:prove` · 业务 migrate/e2e 等。

## 焦点核实

| 焦点 | 结果 |
|------|------|
| 未把 rag/memory/默认 vectorstore 放进 allowlist | **成立**（Set 字面 + deny EXIT=3） |
| G2 仍开 | **成立**。status G2；PREREQ #3；adapter allowlist ≠ 默认迁移 |
| allowlist 绿 ≠ covered | **成立**。banner + gate receipt `release_evidence=false`；共享 compose ≠ disposable |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| sole `wiring` / `ping` / `qdrant-backed` / `vectorstore-adapter` | **0** |
| sole `memory:prove:raw` | **3** |
| sole `rag03-route:prove:raw` | **3** |
| sole `vectorstore:prove:raw` | **3** |
| sole `isolated-env:prove` | **3** |

## 非宣称

禁止：G2 关闭、rag/memory/vectorstore 默认已迁 sole/Qdrant、宽业务 allowlist、L1 关闭、夹具退役、HA、`releaseEvidence=true`。

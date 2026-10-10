# Review — G3 E2E_PG_IMAGE P17（mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-10（PT）  
**结论**：**pass**（限 retirement path marked + sole fail-closed）  
**releaseEvidence=false** · Not HA · **默认镜像值仍 OPEN（未退役）** · **≠ flip** `E2E_ISOLATION_STACK` · **≠ fixtures retired**

## 对照

- `harness/g3-e2e-pg-image.md`
- `harness/r5-retirement-sole-stack-status.md` **P17 / G3**
- `scripts/run-e2e-isolated.mjs`（`LEGACY_PG_IMAGE_DEFAULT` / `[G3-E2E-PG-IMAGE]`）
- 交叉：`g1-default-switch-prep`（isolation 默认未翻）

## 焦点核实

| 焦点 | 结果 |
|------|------|
| 默认仍 pgvector 图 | **成立**。`LEGACY_PG_IMAGE_DEFAULT = 'pgvector/pgvector:pg16'`；`E2E_PG_IMAGE ?? LEGACY_PG_IMAGE_DEFAULT`；compose.dev/demo 仍钉同图 |
| sole 拒假绿 | **成立**。sole + 显式 `E2E_PG_IMAGE` → EXIT=3 `[G3-E2E-PG-IMAGE]`；非批准 fixture → EXIT=3；defense-in-depth 禁 sole docker-run PG；`soleEnv` 剥离 `E2E_PG_IMAGE` |
| ≠ 默认已退役 / G3 关 | **成立**。harness/status 钉「默认镜像值仍 OPEN」；本绿 ≠ 默认镜像已退役 |
| ≠ flip isolation | **成立**。unset → `pgvector-legacy`；无 default-to-SOLE；g1 prep=0 |
| allowlist 未借机扩面 | **成立**。sole allowlist 恰 5 |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm g3-e2e-pg-image:prove` | **0** |
| `pnpm g1-default-switch:prep:prove` | **0** |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis E2E_PG_IMAGE=pgvector/pgvector:pg16 node scripts/run-e2e-isolated.mjs isolated-env:prove` | **3**（`[G3-E2E-PG-IMAGE]`） |

## 非宣称

禁止：G3 关闭、`E2E_PG_IMAGE` 默认值已退役、fixtures retired、翻默认 isolation、G1/G2 关、假 covered、HA、`releaseEvidence=true`。

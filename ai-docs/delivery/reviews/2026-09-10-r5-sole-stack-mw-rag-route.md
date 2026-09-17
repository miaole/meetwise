# Review — R5 retirement / sole-stack honesty（mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-10（PT）  
**结论**：**pass**（诚实 status / mark-red 轨；**≠ covered / ≠ cutover / ≠ migrated**）  
**releaseEvidence=false** · Not HA · **本绿 ≠ 已迁** · **local green ≠ HA**

## 对照

- `harness/r5-retirement-sole-stack-status.md`（Proven vs GAP）
- `harness/r5-pgvector-fixture-mark-red.md` · `m5-pgvector-fixture-retirement-plan.md`
- `m4-rag-hard-gates.md` §R4 / R5
- `pnpm mysql-stack:r5-mark-red:prove`（conn-stack body）

## 焦点核实

| 焦点 | 结果 |
|------|------|
| Qdrant-backed vector/RAG/memory 是否仍 **GAP** | **是（G2）**。`vectorstore:prove` / rag* / memory* 默认仍经 pgvector isolation；仅有 `qdrant-store:skeleton|erase-honesty` 原型 ≠ 默认 Qdrant-backed prove |
| R4 题域隔离 | **NOT closed**（m4 §R4；生产无 track 硬过滤；Worker legacy 技术岗默认仍在）— status **G4** 正确 |
| 默认仍 `pgvector-legacy` 是否诚实 pin | **是**。`E2E_ISOLATION_STACK` 缺省写入 `pgvector-legacy`；sole=`mysql-qdrant-redis` 未接线 **fail-closed**（禁假绿）；banner + status G1 钉默认未切 |

## CMD / EXIT

| CMD | EXIT |
|-----|------|
| `pnpm mysql-stack:r5-mark-red:prove` | **0**（标红诚实钉 only） |

## Proven vs GAP（本域认同）

- **Proven P1–P7**：叙事/标红/双轨/annSearch 未切 — 认同  
- **GAP G1–G5（RAG 相关）**：默认 legacy、Qdrant-backed 未默认、E2E_PG_IMAGE 未退役、R4 未关、erasure ledger — **仍开**；不得假 covered

## 非宣称

禁止：RAG 已迁、sole-stack 已默认、fixtures retired、题域隔离已关、HA、`releaseEvidence=true`、cutover。

# Harness — opt-in minimal memory vector prove via Qdrant（G2 子切片 · P13 · opt-in）

**状态**：eval-honesty · **releaseEvidence=false** · **Not HA** · **≠ covered** · **≠ cutover** · **≠ memory on Qdrant default** · **G2 仍 GAP**  
**平行**：`qdrant-rag-prove.md`（P13 sibling）· `qdrant-vectorstore-prove.md`（P12）· `qdrant-vectorstore-adapter.md`（P11）· `r5-retirement-sole-stack-status.md` G2  
**硬句**：本绿 ≠ 已迁；**standalone package script only（不得入 `SOLE_WIRING_ALLOWLIST`）**；**不得**把本 EXIT=0 写成 `memory*` **默认**已切 Qdrant；**不得**宣称 lean `memory:prove`（episode）或 two-stage recall covered；**不得**切 `E2E_ISOLATION_STACK` 默认离 `pgvector-legacy`。

---

## 1. 目标

推进 G2 的下一诚实子切片（**P13**）：一条 **opt-in** 最小 memory **向量** prove 路径，经既有桥接打 live Qdrant：

`ProductVectorStoreQdrantBridge` → `QdrantVectorStoreAdapter` → live `:6333`（kind=memory upsert + owner-scoped ANN + 跨 owner=0）

| 项 | 裁定 |
|----|------|
| CMD | `pnpm memory:qdrant:prove`（**显式 opt-in**） |
| 默认 | `pnpm memory:prove` / memory-* family **仍** `run-e2e-isolated`→pgvector（**intact**） |
| 桥 | `@meetwise/qdrant-store` · 复用 P12 bridge（无新生产接线） |
| 生产 | **未**接线 admission / consent / two-stage / retrieval-store 选择器 |

### PREREQ（诚实 · 禁假绿 · 产品 memory* 大改写 blocker）

产品 `memory*` **尚不能**在不大改写下选择 Qdrant：

- Lean `memory:prove`（`apps/worker/test/memory.proof.ts`）= **跨会话精确判重 episode + 弱项投影 + RLS** — **根本不是向量路径**；无法「opt-in 到 Qdrant」而不改产品语义
- `memory-two-stage-recall`：admission / consent / generation / SQL 硬过滤后再 ANN — 绑定 pg `PoolClient` + roles
- Postgres RLS / principal session

本切片交付 = **最小 memory 向量切片** opt-in prove + 诚实文档；**≠** 生产后端选择器；**≠** episode/two-stage；**≠** 默认迁移。

缺 live Qdrant → **EXIT=3**（fail-closed）。

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm memory:qdrant:prove` | **0** | honesty 钉 + live 最小 memory vector upsert/annSearch via bridge OK |
| （Qdrant down / 坏 `QDRANT_URL`）同上 | **3** | PREREQ fail-closed；**不得**静默绿 |
| honesty 钉失败 | **1** | 文档/默认/pgvector intact / PREREQ 文案等断言失败 |
| `pnpm memory:prove` / memory-* | n/a（本轨不改） | **仍** pgvector-isolated；**禁止**改道本桥 |

PREREQ（live）：

```bash
docker compose -f docker/compose.mysql-local.yml up -d qdrant
# /readyz → 200
```

可选：`QDRANT_URL`（默认 `http://127.0.0.1:6333`）。

---

## 3. Proven vs GAP（本切片）

| | 项 |
|--|-----|
| **Proven（本绿可达）** | Opt-in `memory:qdrant:prove`：bridge→adapter memory upsert + owner 自查 + 跨 owner=0 + 暴力余弦重合 + 幂等；缺 Qdrant → EXIT=3；默认 `memory*` / `annSearch` / `E2E_PG_IMAGE` / `pgvector-legacy` **intact**；retrieval-store **未** import qdrant-store |
| **仍 GAP** | **G2**：`vectorstore:prove` / `rag*` / `memory*` **默认**仍 pgvector-isolated；lean episode / two-stage / admission / consent 未迁；生产后端选择器未建；G1 默认 isolation；G3 `E2E_PG_IMAGE`；G4 R4；G5 erasure ledger；G7 HA/`releaseEvidence` |

**禁止宣称**：G2 关闭、memory **默认** Qdrant-backed covered、episode/two-stage covered、fixtures retired、cutover、sole 默认已切、HA、`releaseEvidence=true`。

---

## 4. 与既有 CMD 关系

| CMD | 关系 |
|-----|------|
| `vectorstore:qdrant:prove` | P12 产品形向量 prove（含 memory 私有形状）；本切片 = **memory 命名**最小向量入口 |
| `rag:qdrant:prove` | P13 sibling：rag 检索切片 |
| `memory:prove` | lean episode/RLS（**非向量**）；**仍** pgvector-isolated；**禁止**改道 |
| `memory-two-stage-recall:prove` | **仍** pgvector-isolated（G2 GAP） |

---

## 5. 审查

- 双域：`mw-rag-route` + `mw-e2e-ha`
- 合入/切流权在协调/用户；**禁止自批 cutover / HA / G2 关闭**
- 结论落 `ai-docs/delivery/reviews/`

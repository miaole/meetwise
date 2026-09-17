# Harness — product vectorstore prove via Qdrant bridge（G2 子切片 · P12 · opt-in）

**状态**：eval-honesty · **releaseEvidence=false** · **Not HA** · **≠ covered** · **≠ cutover** · **≠ RAG/memory on Qdrant** · **G2 仍 GAP**  
**平行**：`qdrant-vectorstore-adapter.md`（P11）· `qdrant-backed-prove-deepen.md` · `r5-retirement-sole-stack-status.md` G2  
**硬句**：本绿 ≠ 已迁；**不得**把本 EXIT=0 写成 `vectorstore:prove` / `rag*` / `memory*` **默认**已切 Qdrant；**不得**切 `E2E_ISOLATION_STACK` 默认离 `pgvector-legacy`。

---

## 1. 目标

推进 G2 的下一诚实子切片（**P12**）：一条 **opt-in** 产品形向量 prove 路径，经最小桥接打 live Qdrant：

`ProductVectorStoreQdrantBridge` → `QdrantVectorStoreAdapter` → live `:6333`

对齐 `packages/db/test/vectorstore.proof.ts` 的 ANN / 幂等 / 租户 / 隐私 **形状**（非 HNSW plan / 非 Postgres RLS 等价证明）。

| 项 | 裁定 |
|----|------|
| CMD | `pnpm vectorstore:qdrant:prove`（**显式 opt-in**） |
| 默认 | `pnpm vectorstore:prove` **仍** `run-e2e-isolated`→pgvector（**intact**） |
| 桥 | `@meetwise/qdrant-store` · `product-vectorstore-bridge.ts` |
| 生产 | **未**接线 `retrieval-store`；pgvector 活路径 **intact** |

### PREREQ（诚实 · 禁假绿）

P14 关闭 **选择器** PREREQ：`packages/db/src/retrieval-backend.ts` · `RETRIEVAL_VECTOR_BACKEND=qdrant`（默认仍 pgvector）。

`packages/db/src/retrieval-store.ts` 仍为 pgvector SQL 路径；全量特征迁 Qdrant 仍需 large rewrite：

- 绑定 `pg` `PoolClient` + SQL `vector_chunk` / HNSW
- qbank generation 指针 + `qbank_generation_ann_search`
- Postgres RLS / principal session

本切片交付 = **prove-path 最小 opt-in 桥** + 诚实文档；选择器见 P14；**≠** 默认迁移。

缺 live Qdrant → **EXIT=3**（fail-closed）。

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm vectorstore:qdrant:prove` | **0** | honesty 钉 + live product-shaped upsert/annSearch via bridge OK |
| `pnpm e2e-isolation:sole-vectorstore-qdrant:prove` | **0** / **3** | sole allowlist → 同 P12 path + gate receipt；≠ 翻默认；≠ G2 关 |
| （Qdrant down / 坏 `QDRANT_URL`）同上 | **3** | PREREQ fail-closed；**不得**静默绿 |
| honesty 钉失败 | **1** | 文档/默认/pgvector intact / PREREQ 文案等断言失败 |
| `pnpm vectorstore:prove` | n/a（本轨不改） | **仍** pgvector-isolated；**禁止**改道本桥 |

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
| **Proven（本绿可达）** | Opt-in `vectorstore:qdrant:prove`：bridge→adapter upsert + ANN 自查 + 暴力余弦重合 + 幂等 + qbank 共享/memory 私有；缺 Qdrant → EXIT=3；默认 `vectorstore:prove` / `annSearch` / `E2E_PG_IMAGE` / `pgvector-legacy` **intact**；retrieval-store **未** import qdrant-store |
| **仍 GAP** | **G2**：`vectorstore:prove` / `rag*` / `memory*` **默认**仍 pgvector-isolated；P13 opt-in ≠ 默认关；P14 选择器已建但仍 opt-in；G1 默认 isolation；G3 `E2E_PG_IMAGE`；G4 R4；G5 erasure ledger；G7 HA/`releaseEvidence` |

**禁止宣称**：G2 关闭、RAG/memory/vectorstore **默认** Qdrant-backed covered、fixtures retired、cutover、sole 默认已切、HA、`releaseEvidence=true`。

---

## 4. 与既有 CMD 关系

| CMD | 关系 |
|-----|------|
| `qdrant-store:vectorstore-adapter:prove` | P11 adapter 实路径；本切片 = **产品形 prove 入口**走同一 adapter |
| `e2e-isolation:sole-vectorstore-qdrant:prove` | sole allowlist 包装同一 P12 path + gate receipt；**≠** 翻默认 / G2 关 |
| `vectorstore:prove` (+legacy) | **仍** pgvector-isolated（G2 GAP）；**禁止**改道 |
| `rag:qdrant:prove` / `memory:qdrant:prove` | P13 sibling opt-in 最小 rag/memory 切片（同 bridge） |
| `mysql-stack:qdrant-backed:prove` | inventory+readyz；本 CMD 列入 **qdrant-native opt-in** |
| `qdrant-store:skeleton:prove` / `erase-honesty:prove` | 更底层；不替代 |

---

## 5. 审查

- 双域：`mw-rag-route` + `mw-e2e-ha`
- 合入/切流权在协调/用户；**禁止自批 cutover / HA / G2 关闭**
- 结论落 `ai-docs/delivery/reviews/`

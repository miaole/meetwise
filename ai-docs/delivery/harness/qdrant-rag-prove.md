# Harness — opt-in minimal RAG retrieval prove via Qdrant（G2 子切片 · P13 · opt-in）

> **2026-09-17 (~01:15 PT) · STOPPED / superseded by PG-retained direction**  
> Meetwise ruling (**hard**): **vector does NOT migrate to Qdrant** — continue **Postgres pgvector**.  
> Retained truth stack: **Postgres (+pgvector + PostgresSaver)**. Ban replace-pgvector / sole-Qdrant-vector cutover.  
> Prior status preserved below for history; **do not delete**. Further Qdrant-as-required-vector work on this artifact is **banned**.  
> MySQL relational cutover likewise superseded; **Redis wake** remains separately evaluable (not canceled).  
> `releaseEvidence=false` · ≠HA · ≠suite green · Ban implementing vector cutover from this pin · Dual PASS ≠ authorize coding.

**Prior status (historical)**: P13 Qdrant RAG prove path (not default)


**状态**：eval-honesty · **releaseEvidence=false** · **Not HA** · **≠ covered** · **≠ cutover** · **≠ RAG on Qdrant default** · **G2 仍 GAP**  
**平行**：`qdrant-memory-prove.md`（P13 sibling）· `qdrant-vectorstore-prove.md`（P12）· `qdrant-vectorstore-adapter.md`（P11）· `r5-retirement-sole-stack-status.md` G2  
**硬句**：本绿 ≠ 已迁；**standalone package script only（不得入 `SOLE_WIRING_ALLOWLIST`）**；**不得**把本 EXIT=0 写成 `rag*` **默认**已切 Qdrant；**不得**宣称 hybrid / R4 / rag03–rag07 covered；**不得**切 `E2E_ISOLATION_STACK` 默认离 `pgvector-legacy`。

---

## 1. 目标

推进 G2 的下一诚实子切片（**P13**）：一条 **opt-in** 最小 RAG **检索** prove 路径，经既有桥接打 live Qdrant：

`ProductVectorStoreQdrantBridge` → `QdrantVectorStoreAdapter` → live `:6333`（qbank ANN 自查 / 共享读 / 幂等）

| 项 | 裁定 |
|----|------|
| CMD | `pnpm rag:qdrant:prove`（**显式 opt-in**） |
| 默认 | `pnpm rag03-route:prove` / `rag04-track-local:prove` / … **仍** `run-e2e-isolated`→pgvector（**intact**） |
| 桥 | `@meetwise/qdrant-store` · 复用 P12 bridge（无新生产接线） |
| 生产 | **未**接线 hybrid / generation / retrieval-store 选择器 |

### PREREQ（诚实 · 禁假绿 · 产品 rag* 大改写 blocker）

产品 `rag*` **尚不能**在不大改写下选择 Qdrant：

- `hybridQbankSearch` + `to_tsvector` 词法腿（PG）
- `rag04` track-local：`serving_scope` SQL 硬过滤（ORDER BY/LIMIT **前**）+ route snapshot
- qbank generation 指针 + `qbank_generation_ann_search`
- Postgres RLS / principal session / outbox 原语

本切片交付 = **最小检索切片** opt-in prove + 诚实文档；**≠** 生产后端选择器；**≠** hybrid/R4；**≠** 默认迁移。

缺 live Qdrant → **EXIT=3**（fail-closed）。

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm rag:qdrant:prove` | **0** | honesty 钉 + live 最小 qbank ANN retrieval via bridge OK |
| （Qdrant down / 坏 `QDRANT_URL`）同上 | **3** | PREREQ fail-closed；**不得**静默绿 |
| honesty 钉失败 | **1** | 文档/默认/pgvector intact / PREREQ 文案等断言失败 |
| `pnpm rag03-route:prove` / `rag04-track-local:prove` / … | n/a（本轨不改） | **仍** pgvector-isolated；**禁止**改道本桥 |

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
| **Proven（本绿可达）** | Opt-in `rag:qdrant:prove`：bridge→adapter qbank upsert + ANN 自查 + 暴力余弦重合 + 幂等 + qbank 共享读；缺 Qdrant → EXIT=3；默认 `rag*` / `annSearch` / `E2E_PG_IMAGE` / `pgvector-legacy` **intact**；retrieval-store **未** import qdrant-store |
| **仍 GAP** | **G2**：`vectorstore:prove` / `rag*` / `memory*` **默认**仍 pgvector-isolated；hybrid/R4/generation/serving_scope 未迁；生产后端选择器未建；G1 默认 isolation；G3 `E2E_PG_IMAGE`；G4 R4；G5 erasure ledger；G7 HA/`releaseEvidence` |

**禁止宣称**：G2 关闭、RAG **默认** Qdrant-backed covered、hybrid/R4 closed、fixtures retired、cutover、sole 默认已切、HA、`releaseEvidence=true`。

---

## 4. 与既有 CMD 关系

| CMD | 关系 |
|-----|------|
| `vectorstore:qdrant:prove` | P12 产品形向量 prove；本切片 = **rag 命名**最小检索入口走同一 bridge |
| `memory:qdrant:prove` | P13 sibling：memory 向量切片 |
| `rag03`…`rag07` | **仍** pgvector-isolated（G2 GAP）；**禁止**改道 |
| `qdrant-store:vectorstore-adapter:prove` | P11 adapter；本 CMD 走同一 adapter |

---

## 5. 审查

- 双域：`mw-rag-route` + `mw-e2e-ha`
- 合入/切流权在协调/用户；**禁止自批 cutover / HA / G2 关闭**
- 结论落 `ai-docs/delivery/reviews/`

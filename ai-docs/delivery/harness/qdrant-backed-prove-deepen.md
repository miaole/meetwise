# Harness — Qdrant-backed prove 深挖（inventory + connect pin）

**状态**：eval-honesty · **releaseEvidence=false** · **Not HA** · **≠ covered** · **≠ cutover** · **≠ RAG/memory on Qdrant**  
**平行**：`r5-retirement-sole-stack-status.md` G2 · `qdrant-store.prototype.md` · `qdrant-erase-count-honesty.md`  
**硬句**：本绿 ≠ 已迁；**不得**把 pgvector/`vectorstore:prove`/`rag*`/`memory*` EXIT=0 写成 Qdrant-backed covered。

---

## 1. 目标

深挖 sole-stack 上 **Qdrant 路径** 的诚实证明面：

1. **Inventory**：哪些 CMD 是 Qdrant-native / conn-ping / static，哪些仍走 **pgvector-isolated**（G2 GAP）。  
2. **Connect pin**：`compose.mysql-local` Qdrant `:6333` `/readyz` 可达时钉 covered；不可达 → **EXIT=3 PREREQ**（fail-closed，禁假绿）。  
3. **Additive only**：`qdrant-store:skeleton|erase-honesty` 可绿 ≠ RAG/memory 默认已切 Qdrant。  
4. **永不**在 pgvector 路径上宣称 Qdrant-backed vector/RAG/memory covered。

---

## 2. Inventory（backing · 期望 EXIT）

| 类别 | CMD（代表） | Backing | 期望 EXIT | 可宣称？ |
|------|-------------|---------|-----------|----------|
| Qdrant-native | `pnpm qdrant-store:skeleton:prove` | `@meetwise/qdrant-store` live :6333 | **0**（需 Qdrant） | Additive collection/upsert/search/erase **only** |
| Qdrant-native | `pnpm qdrant-store:erase-honesty:prove` | 同上；count honesty | **0**（需 Qdrant） | count mitigated；**≠ 0091 ledger** |
| Qdrant-native | `pnpm qdrant-store:g5-erasure:prove` · `pnpm qdrant-store:g5-ledger-map:prove` | P15 subject erase + P16 schema/map；recall=0 + countable receipt | **0** / **3** | **P15**；**G5 仍 GAP**（≠ 0091）；DELETE 仍 503 |
| Qdrant-native | `pnpm qdrant-store:vectorstore-adapter:prove` | thin adapter upsert/annSearch live | **0**（需 Qdrant）/ **3** | G2 **子切片** real path；**≠** `vectorstore:prove` 默认；**≠** RAG/memory covered；**≠ G2 关** |
| Qdrant-native **opt-in** | `pnpm vectorstore:qdrant:prove` | product-shaped prove via bridge→adapter live | **0**（需 Qdrant）/ **3** | G2 **子切片 P12**；**显式 opt-in**；默认 `vectorstore:prove` **仍** pgvector；**≠** RAG/memory covered；**≠ G2 关**；P14 已关选择器 PREREQ；≠ 默认关 G2 |
| Qdrant-native **opt-in · standalone** | `pnpm rag:qdrant:prove` | minimal qbank ANN retrieval slice via bridge | **0**（需 Qdrant）/ **3** | G2 **子切片 P13**；**package script only（NOT sole allowlist）**；默认 `rag*` **仍** pgvector；**≠** hybrid/R4/rag03–07 covered；**≠ G2 关**；PREREQ：product rag* 大改写 |
| Qdrant-native **opt-in · standalone** | `pnpm memory:qdrant:prove` | minimal memory vector slice via bridge | **0**（需 Qdrant）/ **3** | G2 **子切片 P13**；**package script only（NOT sole allowlist）**；默认 `memory*` **仍** pgvector；**≠** episode/two-stage covered；**≠ G2 关**；PREREQ：lean memory 非向量 + two-stage 大改写 |
| Qdrant-native **opt-in · standalone** | `pnpm retrieval-store:qdrant:prove` | db `retrieval-backend` selector → adapter live | **0**（需 Qdrant）/ **3** | G2 **子切片 P14**；**package script only（NOT sole allowlist）**；`RETRIEVAL_VECTOR_BACKEND=qdrant`；默认 **仍** pgvector；**≠** 全量 RAG covered；**≠ G2 关** |
| Conn / readyz | `pnpm mysql-stack:ping:prove` | mysql+redis+qdrant readyz | **0**（需本地栈） | 连通 only；≠ RAG |
| Static honesty | `pnpm mysql-stack:qdrant-backed:prove` | 本 harness + inventory + readyz | **0** 或 **3** | 见 §3；≠ RAG/memory covered |
| Static gates | `pnpm mysql-stack:m4-rag:prove` / `r5-mark-red:prove` | 文档/标红钉 | **0** | 门/标红 only |
| **GAP G2** | `vectorstore:prove` (+legacy) | `run-e2e-isolated` → **pgvector** | n/a（本轨不跑冒充） | **禁止**写成 Qdrant-backed；opt-in `vectorstore:qdrant:prove` ≠ 默认关 G2 |
| **GAP G2** | `rag03`…`rag07` / `rag-generation` / `rag-corpus-version` / … | isolated → **pgvector** | n/a | **禁止**写成 Qdrant-backed；opt-in `rag:qdrant:prove` ≠ 默认关 G2 |
| **GAP G2** | `memory:prove` / memory-* family | isolated → **pgvector** | n/a | **禁止**写成 Qdrant-backed；opt-in `memory:qdrant:prove` ≠ 默认关 G2 |
| **GAP G2** | `rag:adversarial:pg-eval` | pgvector leaf（非 isolated） | n/a | **禁止** |
| Sole allowlist（**恰 5**） | `e2e-isolation:sole-{wiring,ping,qdrant-backed,vectorstore-adapter,vectorstore-qdrant}:prove` | compose MySQL+Qdrant+Redis；gate receipt | **0** / **3** | 连通/inventory/adapter/P12 opt-in only；**P13/P14** `rag/memory/retrieval-store:qdrant` = standalone **NOT** allowlist；≠ L1；≠ G2 关；≠ rag/memory/`vectorstore:prove` 默认 |
| Fail-closed | `E2E_ISOLATION_STACK=mysql-qdrant-redis` + isolated runner（**非** allowlist：rag*/memory*/vectorstore/migrate…） | sole **非 allowlist** → 3（allowlist 可 0 ≠ L1） | **3** | 禁假绿 |

PREREQ（live Qdrant 段）：

```bash
docker compose -f docker/compose.mysql-local.yml up -d qdrant
# /readyz → 200
```

缺 PREREQ → `mysql-stack:qdrant-backed:prove` **EXIT=3**（非 0），打印 PREREQ 列表。

可选：`QDRANT_URL`（默认 `http://127.0.0.1:6333`）覆盖 readyz 目标；错误 URL → 同 **EXIT=3**。

---

## 3. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm mysql-stack:qdrant-backed:prove` | **0** | inventory 诚实钉 + Qdrant readyz OK；**仍钉 G2 GAP**（RAG/memory/vectorstore 非 Qdrant 默认） |
| `pnpm conn-stack:qdrant-backed:prove` | **0** | 同上（body） |
| （Qdrant down）同上 | **3** | PREREQ fail-closed；**不得**静默绿 |

相关（不替代本 harness）：

| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm qdrant-store:skeleton:prove` | **0** | additive store 原型 |
| `pnpm qdrant-store:erase-honesty:prove` | **0** | deleted_count 诚实；≠ ledger |
| `pnpm qdrant-store:g5-erasure:prove` | **0** / **3** | P15 subject erase；**G5 仍开** |
| `pnpm qdrant-store:g5-ledger-map:prove` | **0** | P16 schema/mapping + PREREQ；**G5 仍开**；≠ 0091 可写 |
| `pnpm qdrant-store:vectorstore-adapter:prove` | **0** / **3** | adapter real path；≠ G2 关 |
| `pnpm vectorstore:qdrant:prove` | **0** / **3** | P12 opt-in product prove via bridge；≠ G2 关；默认 vectorstore:prove intact |
| `pnpm rag:qdrant:prove` | **0** / **3** | P13 opt-in 最小 RAG 检索切片；≠ G2 关；默认 rag* intact |
| `pnpm memory:qdrant:prove` | **0** / **3** | P13 opt-in 最小 memory 向量切片；≠ G2 关；默认 memory* intact |
| `pnpm retrieval-store:qdrant:prove` | **0** / **3** | P14 product-selector；默认 pgvector；坏 URL→3；≠ G2 关；≠ 全量 RAG |
| `pnpm mysql-stack:ping:prove` | **0** | 含 qdrant readyz |

---

## 4. Proven vs GAP（本切片可钉）

| | 项 |
|--|-----|
| **Proven（本绿可达）** | Inventory 分类钉；Qdrant `/readyz` connect；additive `qdrant-store` 脚本存在（含 **vectorstore-adapter** + opt-in **`vectorstore:qdrant:prove`** / **`rag:qdrant:prove`** / **`memory:qdrant:prove`** / **`retrieval-store:qdrant:prove`**）；pgvector 活路径 **intact**；sole isolated **fail-closed**；status G2 **仍开** 字面钉 |
| **仍 GAP** | G2：vector/RAG/memory **默认** Qdrant-backed prove（P11–P14 opt-in ≠ 默认迁移）；G1 默认 isolation；G4 R4；G5 erasure ledger / P16 ledger-map；G7 HA/`releaseEvidence` |

**禁止宣称**：RAG 已迁、memory 已在 Qdrant、fixtures retired、cutover、HA、`releaseEvidence=true`。

---

## 5. 审查

- 双域：`mw-rag-route` + `mw-e2e-ha`  
- 合入/切流权在协调/用户；**禁止自批**  
- 结论落 `ai-docs/delivery/reviews/`

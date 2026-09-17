# M4 — Qdrant client / collection / 擦除 sink 雏形（实现切片）

**状态**：implemented prototype · **releaseEvidence=false** · Not HA · 不宣称 controlPlaneClosed  
**栈裁定**：**MySQL + Qdrant + Redis sole stack**（架构唯一真相）。  
**硬钉**：**不切向量真相**；不删/不禁用 pgvector 活路径（`retrieval-store.ts` `annSearch`、`vectorstore.proof`、`E2E_PG_IMAGE`）。Additive only（独立包）。  
**本绿 ≠ 已迁**；**pass ≠ cutover**；实现方不自批切流。

关联：`m4-rag-hard-gates.md`、`adr-mysql-qdrant-local.md`、harness `ai-docs/delivery/harness/qdrant-store.prototype.md`。

---

## 1. 交付物

| 路径 | 作用 |
|------|------|
| `packages/qdrant-store/` | `@meetwise/qdrant-store` — 应用侧 API（独立包，不进 `retrieval-store`） |
| `src/constants.ts` | `QDRANT_VECTOR_SIZE=512`、`QDRANT_DISTANCE=Cosine`（对齐现有 recipe） |
| `src/client.ts` / `store.ts` | HTTP client + `ensureCollection` / `upsert` / `search` |
| `src/erasure.ts` | 擦除 sink：`erasePoints` → receipt `{ id, collection, deleted_count, at }` |
| `test/qdrant-store.skeleton.proof.ts` | 本地 live prove（collection + upsert + search；删后 recall=0 + receipt） |
| `pnpm qdrant-store:skeleton:prove` | 根脚本；打印 `CMD=… EXIT=` |
| `pnpm qdrant-store:erase-honesty:prove` | count 诚实性 prove；harness `qdrant-erase-count-honesty.md`；**仍 ≠ 0091** |
| `src/vectorstore-adapter.ts` | G2 子切片：retrieval-shaped thin adapter（upsertVectorChunk / annSearch）→ live Qdrant；**≠ 默认切流** |
| `pnpm qdrant-store:vectorstore-adapter:prove` | adapter real-path prove；harness `qdrant-vectorstore-adapter.md`；缺 Qdrant → EXIT=3 |
| `src/product-vectorstore-bridge.ts` | G2 P12：opt-in product-shaped bridge→adapter（prove-path only；**PREREQ**：retrieval-store 尚不能选 Qdrant） |
| `pnpm vectorstore:qdrant:prove` | product vectorstore prove via bridge；harness `qdrant-vectorstore-prove.md`；缺 Qdrant → EXIT=3；**≠** 默认 `vectorstore:prove` |
| `ai-docs/delivery/harness/qdrant-store.prototype.md` | harness（命令与期望 EXIT 一致） |

## 2. 应用侧 API

```ts
import { createQdrantStore } from '@meetwise/qdrant-store';

const store = createQdrantStore(); // default http://127.0.0.1:6333
await store.ensureCollection();    // size=512 Cosine
await store.upsert([{ id, vector /* length 512 */, payload }]);
const hits = await store.search(vector, 10);
const receipt = await store.erasePoints([id]);
// receipt: { id, collection, deleted_count, at }
```

## 3. 擦除 sink 合同（原型）

| 项 | 裁定 |
|----|------|
| 行为 | delete points → 同向量 search **recall=0** |
| receipt | 核心 `{ id, collection, deleted_count, at }`；`deleted_count`=retrieve 前后差（非 `ids.length`）；多 id 另带 `batch_digest`（sorted ids sha256）。**≠ 0091 ledger** |
| 与账本 | 形状对齐关系库 privacy ledger **之前不得切向量真相** |
| 生产 | **未**接线 `memory-vector-chunk-erasure` / privacy DELETE；公开 DELETE 仍 503 |

## 4. Prove

前置：`docker compose -f docker/compose.mysql-local.yml up -d qdrant`；`/readyz` OK。

```bash
pnpm qdrant-store:skeleton:prove
# 期望 EXIT=0；输出含 CMD=pnpm qdrant-store:skeleton:prove EXIT=0
```

静态钉：`annSearch` / `vectorstore.proof` pgvector / `E2E_PG_IMAGE` intact；harness 命令一致。

## 5. 非目标

- 不切 `retrieval-store` / hybrid / qbank 生产路径
- 不宣称 RAG 已切流；R1–R5 / 题域隔离门仍挡（见 `m4-rag-hard-gates.md`）
- 不宣称 HA / `releaseEvidence=true` / `controlPlaneClosed=true`
- 不以 memoir / 双跑为主叙事；sole stack only

**成功标准**：包 + harness + 本文档 + prove **EXIT=0**；pgvector 活路径 intact。

## 6. 审查接力

协调方送 **`mw-rag-route`**；若擦除合同需隐私侧审，另送 **`mw-privacy-int`**。结论落 `ai-docs/delivery/reviews/`。

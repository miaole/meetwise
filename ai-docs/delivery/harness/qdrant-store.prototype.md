# Harness — Qdrant client/collection + 擦除 sink 雏形

> **2026-09-17 (~01:15 PT) · STOPPED / superseded by PG-retained direction**  
> Meetwise ruling (**hard**): **vector does NOT migrate to Qdrant** — continue **Postgres pgvector**.  
> Retained truth stack: **Postgres (+pgvector + PostgresSaver)**. Ban replace-pgvector / sole-Qdrant-vector cutover.  
> Prior status preserved below for history; **do not delete**. Further Qdrant-as-required-vector work on this artifact is **banned**.  
> MySQL relational cutover likewise superseded; **Redis wake** remains separately evaluable (not canceled).  
> `releaseEvidence=false` · ≠HA · ≠suite green · Ban implementing vector cutover from this pin · Dual PASS ≠ authorize coding.

**Prior status (historical)**: prototype harness · additive · not production vector truth


**releaseEvidence=false** · **Not HA** · **本绿 ≠ 已迁**  
**硬约束**：不切生产向量真相；不删 pgvector 活路径（`retrieval-store` / `vectorstore:prove` / `E2E_PG_IMAGE`）。

## 前置
- `docker compose -f docker/compose.mysql-local.yml up -d qdrant`（6333）
- qdrant `/readyz` OK

## 命令与期望 EXIT
| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm qdrant-store:skeleton:prove` | **0** | collection + upsert + search；删后 recall=0 + receipt 形状 |

## 非目标
- 不宣称 RAG 已切流；R1–R5 / 题域隔离门仍挡

## 审查
- 专家：`mw-rag-route`（擦除碰 `mw-privacy-int`）；结论落 `ai-docs/delivery/reviews/`

## Related (count honesty · not ledger)

| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm qdrant-store:erase-honesty:prove` | **0** | `deleted_count` 诚实性（≠ ids.length）；批量 `batch_digest`；**仍 ≠ 0091 ledger** |
| `pnpm qdrant-store:g5-erasure:prove` | **0** / **3** | **P15/G5** subject erase + recall=0 + countable receipt；**仍 ≠ 0091**；DELETE 仍 503 |
| `pnpm qdrant-store:g5-ledger-map:prove` | **0** | **P16/G5** schema/mapping + fail-closed PREREQ；**仍 ≠ 0091 可写**；DELETE 仍 503 |

Harness: `ai-docs/delivery/harness/qdrant-erase-count-honesty.md`

## Related (G2 sub-slice · adapter real path)

| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm qdrant-store:vectorstore-adapter:prove` | **0** / **3** | retrieval-shaped adapter upsert/annSearch；**≠ G2 关**；**≠ RAG/memory covered** |

Harness: `ai-docs/delivery/harness/qdrant-vectorstore-adapter.md`

## Related (G2 sub-slice · P12 product prove opt-in)

| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm vectorstore:qdrant:prove` | **0** / **3** | product-shaped prove via bridge→adapter；**≠ G2 关**；默认 `vectorstore:prove` intact |
| `pnpm rag:qdrant:prove` / `memory:qdrant:prove` | **0** / **3** | P13 minimal rag/memory slices；**≠ G2 关**；默认 rag*/memory* intact |

Harness: `ai-docs/delivery/harness/qdrant-vectorstore-prove.md`


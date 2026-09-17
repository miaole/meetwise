# Review — G5 P15 Qdrant erasure（第二域 mw-rag-route）

**专家**：mw-rag-route（第二审；主审 mw-privacy-int 并行）  
**日期**：2026-09-10（PT）  
**结论**：**pass**（subject erase + recall=0 + countable receipt 诚实；**G5 仍开**；**DELETE 仍 503**）  
**releaseEvidence=false** · Not HA · **recall=0+receipt ≠ 0091** · **≠ privacy covered** · **≠ DELETE 200/202**

## 对照

- `harness/qdrant-g5-erasure-ledger.md`
- `pnpm qdrant-store:g5-erasure:prove` · `packages/qdrant-store` erasure/adapter
- status **P15** · **G5**
- 平行：`erase-honesty` · `privacy-erasure-http-503-pin` · `privacy.service` 503 源码

## 焦点核实

| 焦点 | 结果 |
|------|------|
| recall=0 + countable receipt | **成立**。subject A erase `deleted_count` 诚实；post-erase ANN recall=0；跨 subject intact；idempotent=0 |
| receipt ≠ 0091 ledger | **成立**。harness/status/prove NOTE；原型 receipt ≠ `privacy_deletion_receipt` 字段对齐 |
| 公开 DELETE 仍 503 | **成立**。prove 源码钉 `eraseInterviewData` / `deleteResumeData` 仍 `HttpStatus.SERVICE_UNAVAILABLE`（503） |
| G5 仍开 | **成立**。status G5 字面；P15 ≠ 关闭 GAP |
| 未入 sole / 未切 pgvector | **成立**。standalone；`annSearch` / `E2E_PG_IMAGE` intact |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm qdrant-store:g5-erasure:prove` | **0** |
| `QDRANT_URL=http://127.0.0.1:1` 同 prove | **3** |
| `pnpm qdrant-store:erase-honesty:prove` | **0** |
| `pnpm privacy-erasure:http:prove` | **0**（公开 DELETE 仍 503 钉） |

## 非宣称

禁止：G5 关闭、0091 ledger 对齐、privacy covered、DELETE 200/202、erasure complete、cutover、HA、`releaseEvidence=true`。

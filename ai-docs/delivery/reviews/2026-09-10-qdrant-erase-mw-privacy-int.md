# 审查归档 — Qdrant erase 合同雏形 · mw-privacy-int

**日期**：2026-09-10（PT）  
**结论**：**conditional**  
**releaseEvidence=false** · 本绿 ≠ 已迁 · 实现方不自批切流

## Prove
| CMD | EXIT |
|-----|------|
| `pnpm qdrant-store:skeleton:prove` | **0**（upsert→search>0→erase receipt→post-erase recall=0；pgvector 活路径 intact） |

## 允许
- 合入 additive `@meetwise/qdrant-store` 擦除原型

## 假闭环风险（协调方钉）
- `deleted_count` ≠ Qdrant 确认删除数 → 易假闭环
- 未进入 0091 逐 sink ledger → **切流 block**

## 向量真相 / 隐私删除切流：仍 block

### 切流前还需要（隐私）
1. **与关系库擦除账本对齐**：`privacy_deletion_receipt`（request_id/target_id/receipt_kind/receipt_hash/recorded_by + no-forge-completed）≠ 本原型四字段；须映射/扩展并能进 0091 逐 sink receipt
2. **授权根接线**：erase 挂 claim/lease 之后；跨 owner fail-closed；禁无授权删 collection
3. **`deleted_count` 诚实性**：勿仅用 `ids.length`；用 op 结果或删后 count（recall=0 不替代 ledger 诚实）
4. **批量 receipt**：勿 `id=ids[0]` 丢其余；逐 id 或可验证 batch digest
5. **域 sink prove**：`pnpm memory-vector-chunk-erasure:prove`（及题库向量）在 Qdrant 路径 recall=0+receipt；未绿不得切 `memory_vector_chunk` 真相
6. **公开 DELETE 仍 503**；禁 releaseEvidence=true / controlPlaneClosed；pgvector 活路径保持至组合根 prove+专家审

## Harness
`ai-docs/delivery/harness/qdrant-store.prototype.md`  
另见 rag 骨架审：`reviews/2026-09-10-qdrant-store-mw-rag-route.md`

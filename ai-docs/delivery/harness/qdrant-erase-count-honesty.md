# Harness — Qdrant erase `deleted_count` 诚实性（count only）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 已迁**  
**硬约束**：不切生产向量真相；不删 pgvector 活路径（`retrieval-store` / `vectorstore:prove` / `E2E_PG_IMAGE`）。  
**本绿 ≠ 0091 ledger 对齐**：假闭环风险仅对 **`deleted_count` 诚实性** mitigated；**仍 ≠** `privacy_deletion_receipt` / 0091 逐 sink ledger；**切流仍 block**。

## 交付物（须与本表 CMD 同名）

| 路径 | 角色 |
|------|------|
| `packages/qdrant-store/src/erasure.ts` | `erasePoints`：`deleted_count` 来自删前/删后 retrieve 差（或等价验证），**禁止**盲用 `ids.length` |
| `packages/qdrant-store/src/types.ts` | receipt 核心形状 `{ id, collection, deleted_count, at }`；批量另见 `batch_digest` |
| `packages/qdrant-store/test/qdrant-store.erase-honesty.proof.ts` | 断言 `deleted_count` = 实际移除数；批量 digest；≠ 0091 宣称 |
| root `package.json` | `qdrant-store:erase-honesty:prove` |

## 前置

- `docker compose -f docker/compose.mysql-local.yml up -d qdrant`（6333）
- qdrant `/readyz` OK

## 命令与期望 EXIT

| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm qdrant-store:erase-honesty:prove` | **0** | upsert→erase（含缺失 id）→`deleted_count`=实际移除数；批量 `batch_digest` 覆盖全部 ids；删后再 erase 同 id → `deleted_count=0`；pgvector 活路径 intact；钉 **≠ 0091 ledger** |

相关骨架（不替代本 harness）：

| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm qdrant-store:skeleton:prove` | **0** | collection + upsert + search；删后 recall=0 + receipt 形状（仍 additive） |

## 假闭环风险（协调方钉 · count only）

| 风险 | 本 harness 处置 |
|------|-----------------|
| `deleted_count` 盲等于 `ids.length` | **mitigated（count only）**：prove 强制 `deleted_count` 匹配实际移除 |
| 批量只写 `id=ids[0]` 丢其余 | **mitigated（count only）**：多 id 必须带可验证 `batch_digest`（sorted ids sha256） |
| 未进 0091 逐 sink ledger | **仍 open** — 本绿 **不得**宣称 ledger 对齐 / 切流 |

## 非目标

- 不宣称 RAG / 隐私删除已切流；不宣称与 `privacy_deletion_receipt`（0091）对齐
- 不接线授权根 / claim / lease；不 `releaseEvidence=true` / `controlPlaneClosed`
- recall=0 **不替代** ledger 诚实；本 prove 只钉 count 诚实

## 审查

- 专家：`mw-privacy-int`；结论落 `ai-docs/delivery/reviews/`
- 合入权在协调/用户；禁止自批切流

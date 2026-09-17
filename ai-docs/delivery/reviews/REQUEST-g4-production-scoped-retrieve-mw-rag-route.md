# REQUEST — G4 production scoped retrieve（partial P-WIRE）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-10（PT）  
**releaseEvidence=false** · Not HA · **pass ≠ R4 已关** · **≠ 题域已隔离** · **≠ wrong_track=0** · **≠ sole cutover**

## 对照

- `ai-docs/delivery/harness/r4-domain-isolation.md`（P-WIRE partial）
- `ai-docs/delivery/harness/r4-domain-isolation-status.md`（G-R4-1 partial）
- `ai-docs/delivery/eval/r4-domain-isolation.eval.md`
- `apps/worker/src/main.ts`（`localRetrieve` → `cachedQbankSearch(..., scope?)`）
- `apps/worker/src/qbank-retrieve-scope.ts`
- `apps/worker/src/interview-consumer.ts`
- `gap-bug-backlog.md` GAP-RAG-04 · `m4-rag-hard-gates.md` §R4

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm g4-production-scoped-retrieve:prove` | **0** |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |
| `pnpm mysql-stack:m4-rag:prove` | **0** |

## 请专家回答

1. `main.ts` 是否真实转发 `scope` 入 `cachedQbankSearch`，且 consumer 从 snapshot 主叶解析？  
2. 本刀是否仅 **partial P-WIRE**（无 `dispatchTrackLocalRetrieval` / 无 per-turn planner leaf / 缺 snapshot 仍 unscoped）？  
3. 是否同意 **保持 R4 NOT closed**，且禁止把本绿写成 wrong_track=0 / 题域已隔离？  
4. PREREQ（R1/R2/MetadataReviewReceipt/full dispatch）是否仍正确登记为未齐？

## 非宣称（实现方自认）

- 不宣称 R4 / 题域隔离已关  
- 不宣称 wrong_track=0 生产读面已证  
- 不宣称 full `dispatchTrackLocalRetrieval` 已接线  
- 不切 qbank / 向量真相 / flip default  
- 本 REQUEST **不是** pass 结论

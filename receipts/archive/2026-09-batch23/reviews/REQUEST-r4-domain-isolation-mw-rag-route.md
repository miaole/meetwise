# REQUEST — R4 题域隔离诚实钉（GAP-RAG-04 · G4）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-10（PT）  
**releaseEvidence=false** · Not HA · **pass ≠ R4 已关** · **≠ 题域已隔离** · **≠ sole cutover**

## 对照

- `ai-docs/delivery/harness/r4-domain-isolation.md`
- `ai-docs/delivery/harness/r4-domain-isolation-status.md`
- `ai-docs/delivery/eval/r4-domain-isolation.eval.md`
- `ai-docs/delivery/m4-rag-hard-gates.md` §R4
- `ai-docs/delivery/gap-bug-backlog.md` GAP-RAG-04

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |
| `pnpm mysql-stack:m4-rag:prove` | **0** |
| `pnpm r1-tech-role-fail-closed:prove` | **0** |

## 请专家回答

1. E1–E10 / PREREQ 表是否足够验收「诚实钉」而不误关 R4？  
2. 假绿标红是否覆盖：rag04→R4关、snapshot 写面→R2关、role→题域隔离、m4-rag绿→切流、01A→R4关？  
3. 生产 `main.ts` 无-scope / 无 `dispatchTrackLocalRetrieval` 作为 GAP 钉是否准确？  
4. 在 PREREQ（R1/R2/MetadataReviewReceipt）未满足前，是否同意 **保持 NOT closed**？

## 非宣称（实现方自认）

- 不宣称 R4 / 题域隔离已关  
- 不宣称生产 track 硬过滤已接线  
- 不切 qbank / 向量真相  
- 本 REQUEST **不是** pass 结论

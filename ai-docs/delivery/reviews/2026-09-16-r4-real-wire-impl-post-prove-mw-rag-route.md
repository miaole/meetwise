# Review — R4 **REAL-WIRE-IMPL** **post-prove**（第二域 mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（PT）  
**结论**：**pass**（限：独立复跑 `r4-real-wire-impl:prove` EXIT=0 + 旁证 + 静态接线诚实；**接线绿 ≠ R4 closed ≠ wrong_track=0 ≠ 题域已隔离**）  
**releaseEvidence=false** · Not HA · 配对 `mw-e2e-ha` · HEAD `639134f`

覆盖 REQUEST：`REQUEST-2026-09-16-r4-real-wire-impl-post-prove-mw-rag-route.md`  
前序 pre-exec：`2026-09-16-r4-real-wire-impl-mw-rag-route.md`（pass · 验收门 only）

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | 独立复跑？ | **已复跑**：`r4-real-wire-impl:prove` **0**；旁证 `r4-p-planner-unit:prove` **0**；`g4-dispatch-recheck-prereq:prove` **0**（FLIPPED）。 |
| 2 | CALL_SITES≥1 且路径为 planner→assemble→dispatch（非 P-FAKEPLAN）？ | **是**。1 调用点：`qbank-track-local-retrieve.ts:130`；经 active generation/recipe → `assembleValidatedRetrievalPlan` → `dispatchTrackLocalRetrieval`；域内 `planInterviewTurn`/`validatePlannerOutput`；**无**主叶硬塞。 |
| 3 | `recheck_failed` fail-closed 与 G-R2-5 仍成立？ | **是**。recheck_failed → `degradedRetrieval`；无 unscoped 回退；`decideRouteSnapshotRetrieve` → `route_snapshot_missing` 仍在。 |
| 4 | EXIT=0 仍钉 ≠ R4 closed / ≠ 题域已隔离 / ≠ wrong_track=0？ | **是**。 |
| 5 | harness/status/eval 是否误写 R4 已关？ | **否**。仍 `implemented:awaiting_post_prove_dual`；题域隔离 NOT closed；wire 绿 ≠ R4 closed。 |
| 6 | ADV / wrong_track=0 仍为剩余缺口？ | **同意**（ADV 另刀）。 |
| 7 | pre-exec dual + 本绿是否不得自动批准 R4 关闭？ | **不得**。 |

## CMD / EXIT（本域独立复跑）

| CMD | EXIT | 读法 |
|-----|------|------|
| **`pnpm r4-real-wire-impl:prove`** | **0** | CALL_SITES=1；fail-closed；≠ R4 关 |
| `pnpm r4-p-planner-unit:prove` | **0** | unit 合同仍绿；≠ 单独关 R4 |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** | FLIPPED CALL_SITES≥1；≠ R4 关 / ≠ wrong_track=0 |

Key **unset** · 未读 `.env*` · 未跑 wrong_track ADV / flip / DELETE / HA

## 静态核对

| 项 | 裁定 |
|----|------|
| CALL_SITES | **1**（`qbank-track-local-retrieve.ts:130`） |
| P-FAKEPLAN | **未发现**（真 assemble + generationId/recipeId） |
| recheck fail-closed | **是** |
| G-R2-5 | **保留** |
| wrong_track=0 | **未证** |

## 仍开

- R4 / 题域隔离 **NOT closed**  
- wrong_track=0 / NHP-R4-ADV（另刀）  
- P-R1 / P-R2 overall / P-META 并列 PREREQ

## 非宣称

禁止：R4 已关、题域已隔离、wrong_track=0、P-FAKEPLAN、削弱 G-R2-5、HA、`releaseEvidence=true`、实现方自批、本绿自动关 R4。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-r4-real-wire-impl-post-prove-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-r4-real-wire-impl-post-prove-mw-rag-route.md`
- HEAD：`639134f`

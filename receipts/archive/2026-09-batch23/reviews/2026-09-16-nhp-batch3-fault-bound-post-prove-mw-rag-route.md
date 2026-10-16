# Review — NHP Batch3 FAULT/BOUND **post-prove**（RAG/R4 子集 · mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（PT）  
**结论**：**pass**（限：本域独立复跑 7× CMD 均 EXIT=0 作 honesty 收据；**≠ covered** · **≠ R4 closed** · **≠ wrong_track=0** · **≠ ADV covered** · **≠ 路由已生效** · **≠ planner leaf** · **≠ LOAD/HA**）  
**releaseEvidence=false** · Not HA · 配对 `mw-e2e-ha` · **无** `mw-model-op` · HEAD `639134f`

覆盖 REQUEST：`REQUEST-2026-09-16-nhp-batch3-fault-bound-post-prove-mw-rag-route.md`  
前序 RECHECK：`2026-09-16-nhp-batch3-fault-bound-RECHECK-mw-rag-route.md`（pass · FAULT FLIPPED 措辞闭合）

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | 独立复跑？ | **已复跑全 7**。RAG 主审：`g-r2-5-retrieve-fail-closed` **0**；`g4-dispatch-recheck-prereq` **0**（FLIPPED CALL_SITES=1）。 |
| 2 | EXIT=0 仍钉 ≠ R4 / ≠ planner / ≠ wrong_track=0 / ≠ ADV / ≠ 路由已生效？ | **是**。 |
| 3 | FLIPPED CALL_SITES=1 是否误读成 R4 关或 wrong_track=0？ | **否**。OK 文钉 R4 NOT closed；≠ wrong_track=0。 |
| 4 | harness/status/eval 是否误写 R4/planner 已关？ | **否**。`executed:awaiting_post_prove_dual`；仍 ≠ covered；本批未改 wire。 |
| 5 | 须并列 mw-model-op？ | **否（本批）**。 |
| 6 | 是否错误启动 R4 接线/编码/ADV/Meridian？ | **否**。仅 honesty prove。 |
| 7 | dual + 本绿不得自动批 R4/planner/ADV 关闭？ | **不得**。 |

## CMD / EXIT（本域独立复跑 · ~19:21 PT）

| Case ID | CMD | EXIT | 读法 |
|---------|-----|------|------|
| NHP-015-BOUND-01 | `pnpm uc015:ingest-failures:prove` | **0** | F2/F3 BOUND ≠ OCR FAULT（e2e-ha） |
| NHP-011-FAULT-01 | `pnpm uc011:report-refund:prove` | **0** | DB released ≠ refund complete（e2e-ha） |
| NHP-017-BOUND-01 | `pnpm uc017:orphan:prove` | **0** | sweeper 幂等 ≠ LOAD（e2e-ha） |
| NHP-019-NEG-01 | `pnpm uc019:report-regenerate:prove` | **0** | quarantine GAP ≠ 019 covered（e2e-ha） |
| NHP-033-BOUND-01 | `pnpm uc033:cross-user-authz:prove` | **0** | X10 ≠ SLO（e2e-ha） |
| **NHP-R4-NEG-01** | `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | snapshot fail-closed；**≠ R4 closed / ≠ 路由已生效** |
| **NHP-R4-FAULT-01** | `pnpm g4-dispatch-recheck-prereq:prove` | **0** | **FLIPPED CALL_SITES=1**；seam honesty；**仍 ≠ R4 closed ≠ wrong_track=0 ≠ ADV** |

Key **unset** · 未读 `.env*` · 未跑 `e2e:isolated` / LOAD / HA / R4 coding / ADV

## 仍开

- R4 / 题域隔离 **NOT closed**  
- wrong_track=0 / ADV covered（ADV 另轨；本批未扩）  
- Batch3 各行仍 partial/honesty；**零 covered**

## 非宣称

禁止：covered、R4/planner/ADV 关、wrong_track=0、路由已生效、FLIPPED=R4关、HA、`releaseEvidence=true`、实现方自批。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-nhp-batch3-fault-bound-post-prove-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-nhp-batch3-fault-bound-post-prove-mw-rag-route.md`
- HEAD：`639134f`

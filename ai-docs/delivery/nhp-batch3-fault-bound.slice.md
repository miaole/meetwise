# Slice — NHP Batch3 · 第三批 FAULT/BOUND（+ R4 NEG/FAULT honesty · **post_prove_dual_pass · honesty only**）
**状态**：**`post_prove_dual_pass`** · 7× CMD 新鲜 EXIT=0 · post-prove 双域独立审均 **pass** · **仅 honesty/partial** · **仍 ≠ covered**  
**日期**：2026-09-16（~19:20 PT · post-prove 双域 pass）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ LOAD/容量绿** · **≠ R2/R4 closed** · **≠ planner leaf** · **≠ PERF SLO** · **≠ wrong_track=0** · **≠ ADV covered**  
**前置已齐**：硬闸文档闸生效 · 矩阵双域文档闸 pass · Batch1+Batch2 = **post_prove_dual_pass** · Batch3 RECHECK 双域 pass · 本批执行授权已用 · 7× prove EXIT=0 · post-prove 双域均 pass · **仅 honesty/partial** · **实现方禁止自批 pass**
---
## 产物
| 角色 | 路径 |
|------|------|
| 本切片索引 | `ai-docs/delivery/nhp-batch3-fault-bound.slice.md` |
| Harness | `ai-docs/delivery/harness/nhp-batch3-fault-bound.md` |
| Eval | `ai-docs/delivery/eval/nhp-batch3-fault-bound.eval.md` |
| REQUEST · e2e-ha（pre-exec） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch3-fault-bound-mw-e2e-ha.md` |
| REQUEST · rag-route（pre-exec） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch3-fault-bound-mw-rag-route.md` |
| REQUEST · e2e-ha（post-prove） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch3-fault-bound-post-prove-mw-e2e-ha.md` |
| REQUEST · rag-route（post-prove） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch3-fault-bound-post-prove-mw-rag-route.md` |
| Review · e2e-ha（post-prove pass） | `ai-docs/delivery/reviews/2026-09-16-nhp-batch3-fault-bound-post-prove-mw-e2e-ha.md` · **pass（honesty/partial only）** |
| Review · rag-route（post-prove pass） | `ai-docs/delivery/reviews/2026-09-16-nhp-batch3-fault-bound-post-prove-mw-rag-route.md` · **pass（honesty only）** |
| RECHECK · e2e-ha（dual pass） | `ai-docs/delivery/reviews/2026-09-16-nhp-batch3-fault-bound-RECHECK-mw-e2e-ha.md` |
| RECHECK · rag-route（dual pass） | `ai-docs/delivery/reviews/2026-09-16-nhp-batch3-fault-bound-RECHECK-mw-rag-route.md` |
| model-op | **无**（本批无 MODEL-OP live 子集；不要并列） |
| Batch1 对照 | `nhp-batch1-neg-perf.slice.md` · **post_prove_dual_pass**（7 IDs 不重复） |
| Batch2 对照 | `nhp-batch2-neg-fault.slice.md` · **post_prove_dual_pass**（7 IDs 不重复） |
## Case IDs（7）· CMD+EXIT（~19:20 PT · HEAD `639134f` · post-prove 双审回执）
| Case ID | CMD | EXIT | 读法 |
|---------|-----|------|------|
| NHP-015-BOUND-01 | `pnpm uc015:ingest-failures:prove` | **0** | F2/F3 BOUND ≠ OCR FAULT / ≠ LOAD · pgvector green-risk/R5 |
| NHP-011-FAULT-01 | `pnpm uc011:report-refund:prove` | **0** | 失败→released DB 口径 ≠ refund complete / ≠ UI-pay |
| NHP-017-BOUND-01 | `pnpm uc017:orphan:prove` | **0** | sweeper 幂等 ≠ LOAD |
| NHP-019-NEG-01 | `pnpm uc019:report-regenerate:prove` | **0** | quarantine regen GAP ≠ 019 covered |
| NHP-033-BOUND-01 | `pnpm uc033:cross-user-authz:prove` | **0** | X10 burst ≠ PERF/LOAD SLO |
| NHP-R4-NEG-01 | `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | snapshot missing honesty ≠ R4 closed |
| NHP-R4-FAULT-01 | `pnpm g4-dispatch-recheck-prereq:prove` | **0** | **FLIPPED（CALL_SITES=1≥1）** · seam honesty only；**仍 ≠ R4 closed** · **≠ wrong_track=0** · **≠ ADV covered** |
## 硬钉
- 实现方 **不自批** pass；post-prove 双域独立审均 **pass**（仅 honesty）
- **FLIPPED CALL_SITES≥1 仍 ≠ R4 closed ≠ wrong_track=0 ≠ ADV**  
- **不跑** `e2e:isolated` / `verify:e2e-performance` / 云 TC / HA / LOAD / PERF-CLOUD / UI-pay / cloud-kill  
- **不**把 Batch1/2 pass 读成 Batch3 covered  
- **不改** R4 wire；**不读** `.env*`；**不开** Meridian  
- `releaseEvidence=false` · **≠HA**
---
*Slice · NHP Batch3 · 2026-09-16 ~19:20 PT · post_prove_dual_pass（honesty only）· R4-FAULT FLIPPED honesty · releaseEvidence=false · ≠HA · ≠ covered*

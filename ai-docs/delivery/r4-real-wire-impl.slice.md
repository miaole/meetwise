# Slice — R4 **REAL-WIRE-IMPL**（Worker retrieve 真接线 · post_prove_dual_pass · wire honesty only）

**状态**：**`post_prove_dual_pass`（wire honesty only）**  
**日期**：2026-09-16（~19:05 PT）  
**CALL_SITES=1** · **releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R4 closed** · **≠ wrong_track=0** · **LIVE_PG=`post_prove_dual_pass`（honesty only）**  
**前置**：pre-exec dual **pass** · post-prove dual **pass（wire honesty only）** · meetwise authorize coding+prove  
**本刀禁止**：宣称 R4 关 · wrong_track=0 · 实现方自批 pass · flip default · open DELETE

---

## 产物

| 角色 | 路径 |
|------|------|
| 本切片索引 | `ai-docs/delivery/r4-real-wire-impl.slice.md` |
| Harness | `ai-docs/delivery/harness/r4-real-wire-impl.md` |
| Eval | `ai-docs/delivery/eval/r4-real-wire-impl.eval.md` |
| Prove | `apps/worker/test/r4-real-wire-impl.proof.ts` · `pnpm r4-real-wire-impl:prove` |
| 接线 helper | `apps/worker/src/qbank-track-local-retrieve.ts` |
| Consumer / main | `interview-consumer.ts` · `main.ts` |
| post-prove review · rag | `ai-docs/delivery/reviews/2026-09-16-r4-real-wire-impl-post-prove-mw-rag-route.md` · **pass** |
| post-prove review · e2e | `ai-docs/delivery/reviews/2026-09-16-r4-real-wire-impl-post-prove-mw-e2e-ha.md` · **pass** |
| 父 harness / status | `harness/r4-domain-isolation.md` §6e · `r4-domain-isolation-status.md` |

## 范围一句话

Worker retrieve **真接线**：planner → validate → assemble `RetrievalPlan`（generationId/recipeId）→ `dispatchTrackLocalRetrieval` → recheck；保留 G-R2-5；禁 P-FAKEPLAN；`recheck_failed` fail-closed；**接线绿 ≠ R4 closed ≠ wrong_track=0**。post-prove dual pass（wire honesty only）。

## 硬钉

- 实现方 **不自批** pass  
- **R4 仍 NOT closed**；NHP-R4-ADV-01 **partial**（LIVE_PG dual honesty landed ≠ covered）  
- **LIVE_PG=`post_prove_dual_pass`（honesty only）**
- `releaseEvidence=false`  
- remaining：wrong_track covered / R4 closed（LIVE_PG dual honesty ≠ covered）

---

*Slice · R4 REAL-WIRE-IMPL · 2026-09-16 ~19:45 PT · post_prove_dual_pass（wire honesty only）· CALL_SITES=1 · releaseEvidence=false · ≠HA · ≠ R4 closed · LIVE_PG=post_prove_dual_pass（honesty only）*

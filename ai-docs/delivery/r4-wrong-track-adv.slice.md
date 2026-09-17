# Slice — R4 **wrong_track=0 ADV**（对抗跨域 · post_prove_dual_pass · ADV honesty only）

**状态**：**`post_prove_dual_pass`（ADV honesty only）**  
**日期**：2026-09-16（~19:22 PT）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R4 closed** · **wire 绿 ≠ ADV closed** · **ADV 绿 ≠ R4 closed** · **LIVE_PG_GAP dual receipts landed（honesty）**  
**前置**：REAL-WIRE-IMPL `post_prove_dual_pass`（wire honesty only）；ADV pre-exec dual **PASS**；meetwise authorize coding+prove；post-prove dual **PASS**  
**本刀禁止**：宣称 covered / R4 关 / full live Worker+PG ADV 已关 · 实现方自批 · flip default · open DELETE  
**next**：LIVE_PG = `post_prove_dual_pass`（honesty only）；covered path parallel（≠ covered）

---

## 产物

| 角色 | 路径 |
|------|------|
| 本切片索引 | `ai-docs/delivery/r4-wrong-track-adv.slice.md` |
| Harness | `ai-docs/delivery/harness/r4-wrong-track-adv.md` |
| Eval | `ai-docs/delivery/eval/r4-wrong-track-adv.eval.md` |
| Prove | `apps/worker/test/r4-wrong-track-adv.proof.ts` · `pnpm r4-wrong-track-adv:prove` |
| Domain hooks | `packages/domain/src/qbank-track-local-retrieval.ts`（wrong_track assert） |
| Worker | `apps/worker/src/qbank-track-local-retrieve.ts`（enforce + map） |
| post-prove review · rag | `reviews/2026-09-16-r4-wrong-track-adv-post-prove-mw-rag-route.md` · **pass（ADV honesty only）** |
| post-prove review · e2e | `reviews/2026-09-16-r4-wrong-track-adv-post-prove-mw-e2e-ha.md` · **pass（ADV honesty only）** |
| 父 harness / status | `harness/r4-domain-isolation.md` §6f · `r4-domain-isolation-status.md` |
| Case | NHP-R4-ADV-01（matrix §1.5）→ **partial**/honesty-pin ≠ covered |
| LIVE_PG knife | `harness/r4-wrong-track-adv-live-pg.md`（`post_prove_dual_pass` · honesty only；LIVE_PG_GAP dual receipts landed） |

## 范围一句话

在 **wired** retrieve 上落地 wrong_track=0 对抗 assert + prove（A1–A8）；**post-prove dual PASS（ADV honesty only）**；LIVE_PG = `post_prove_dual_pass`（honesty only）；**LIVE_PG_GAP dual receipts landed（honesty）**；**≠ covered / ≠ R4 closed**。

## 硬钉

- 实现方 **不自批**  
- **R4 仍 NOT closed**；NHP-R4-ADV-01 **partial**/honesty-pin **≠ covered**  
- **LIVE_PG_GAP dual receipts landed（honesty）** · 仍 ≠ covered ≠ R4 closed ≠ HA  
- `releaseEvidence=false`  
- LIVE_PG：**`post_prove_dual_pass`（honesty only）**

---

*Slice · R4 wrong_track=0 ADV · 2026-09-16 ~19:45 PT · post_prove_dual_pass（ADV honesty only）· releaseEvidence=false · ≠HA · LIVE_PG=post_prove_dual_pass（honesty only）· LIVE_PG_GAP dual receipts landed*

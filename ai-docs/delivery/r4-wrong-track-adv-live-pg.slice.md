# Slice — R4 **wrong_track=0 ADV · LIVE_PG**（关 LIVE_PG_GAP · post_prove_dual_pass · honesty only）

**状态**：**`post_prove_dual_pass`（honesty only）**  
**日期**：2026-09-16（~19:45 PT）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R4 closed** · **unit ADV ≠ LIVE_PG covered** · **LIVE_PG_GAP dual receipts landed（honesty）· 仍 ≠ R4 closed ≠ covered ≠ HA** · **sole 未翻** · **R5/pgvector-legacy honesty 保留**  
**前置**：ADV `post_prove_dual_pass`（ADV honesty only）；LIVE_PG pre-exec dual PASS；meetwise authorize coding+prove；prove EXIT=0；`:prove:raw` no-PG EXIT=1；post-prove dual PASS  
**本刀禁止**：宣称 R4 关 / covered / HA · 实现方自批 · flip default · open DELETE · sole allowlist 翻面

---

## 产物

| 角色 | 路径 |
|------|------|
| 本切片索引 | `ai-docs/delivery/r4-wrong-track-adv-live-pg.slice.md` |
| Harness | `ai-docs/delivery/harness/r4-wrong-track-adv-live-pg.md` |
| Eval | `ai-docs/delivery/eval/r4-wrong-track-adv-live-pg.eval.md` |
| Prove | `apps/worker/test/r4-wrong-track-adv-live-pg.proof.ts` |
| CMD | `pnpm r4-wrong-track-adv-live-pg:prove` |
| post-prove · rag | `reviews/2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-rag-route.md` · **pass（honesty only）** |
| post-prove · e2e | `reviews/2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-e2e-ha.md` · **pass（honesty only）** |
| 父 harness / status | `harness/r4-domain-isolation.md` §6g · `r4-domain-isolation-status.md` §11 |
| 前序 ADV | `harness/r4-wrong-track-adv.md`（`post_prove_dual_pass` · ADV honesty only） |
| Case | NHP-R4-ADV-01 → 仍 **partial**/honesty-pin ≠ covered |

## 范围一句话

在 **live wired Worker+PG** 路径（`retrieveViaDispatchTrackLocal`）上跑 wrong_track=0 ADV prove；**post-prove dual PASS（honesty only）**；**LIVE_PG_GAP dual receipts landed（honesty）**；仍 **≠ R4 closed ≠ covered ≠ HA**；NHP-R4-ADV-01 仍 **partial**。

## 硬钉

- 实现方 **不自批**  
- **R4 仍 NOT closed**；NHP-R4-ADV-01 **partial**/honesty-pin **≠ covered**  
- **LIVE_PG_GAP dual receipts landed（honesty）** · 仍 ≠ R4 closed ≠ covered ≠ HA  
- `releaseEvidence=false`；sole allowlist **未翻**；R5 green-risk / pgvector-legacy fixture honesty **保留**

---

*Slice · R4 wrong_track ADV LIVE_PG · 2026-09-16 ~19:45 PT · post_prove_dual_pass（honesty only）· releaseEvidence=false · ≠HA · ≠ covered · ≠ R4 closed · LIVE_PG_GAP dual receipts landed（honesty）*

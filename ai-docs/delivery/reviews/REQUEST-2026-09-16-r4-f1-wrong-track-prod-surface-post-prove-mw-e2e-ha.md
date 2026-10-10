# REQUEST — Knife **F1** · wrong_track **production-surface remaining** **post-prove** → mw-e2e-ha

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-16 (~23:20 PT · post-prove)  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ wrong_track=0 production fully closed** · **LIVE_PG dual ≠ prod closed** · **NHP covered dual ≠ this knife** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE**  
**Pair**: `REQUEST-2026-09-16-r4-f1-wrong-track-prod-surface-post-prove-mw-rag-route.md`  
**Hard**: pre-exec dual PASS · meetwise authorize coding+prove · EXIT=0 ≠ R4 closed ≠ prod fully closed · no self-approve  
**Prior pre-exec dual（pass）**: `2026-09-16-r4-f1-wrong-track-prod-surface-mw-e2e-ha.md` · `2026-09-16-r4-f1-wrong-track-prod-surface-mw-rag-route.md`  
**Knife**: `pnpm r4-wrong-track-prod-surface:prove`（真 PG · PS1–PS3）；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## Contra

| File | Role |
|------|------|
| `harness/r4-f1-wrong-track-prod-surface.md` | Canonical harness（`executed:awaiting_post_prove_dual`） |
| `eval/r4-f1-wrong-track-prod-surface.eval.md` | run-status + fake-green checklist |
| `r4-f1-wrong-track-prod-surface.slice.md` | Slice index |
| `harness/r4-domain-isolation-status.md` §13 | R4 **仍 NOT closed**；F1 awaiting post-prove dual |
| `apps/worker/src/qbank-track-local-retrieve.ts` | observeTrackLocalRetrieval · classifyTrackLocalOutcome |
| `apps/worker/src/interview-consumer.ts` | production `track_local_required` fail-closed |
| `apps/worker/src/production-config.ts` | `productionRequiresTrackLocal` |
| `apps/worker/test/r4-wrong-track-prod-surface.proof.ts` | F1 prove |
| `harness/r4-wrong-track-adv-live-pg.md` | LIVE_PG honesty（spawned 旁证 · ≠ prod closed） |
| `harness/nhp-r4-adv-covered-path.md` | NHP covered（≠ this knife） |

---

## Stance（E2E-HA）

F1 landed production-surface remaining beyond LIVE_PG honesty + NHP covered:

1. **PS1** prod call-path / deploy-surface: main `trackLocal`; production missing trackLocal → fail-closed `track_local_required`  
2. **PS2** observability: `rag_retrieval_total{mode=track_local}` on wrong_track / recheck / cache-replay; cache-replay map fail-closed  
3. **PS3** honesty: ≠ R4 closed · LIVE_PG ≠ prod closed · NHP covered ≠ this knife · P-R1/P-R2/P-META/P-FIX still open  

**EXIT=0 ≠ production wrong_track=0 fully closed ≠ R4 closed ≠ HA**.  
本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方 · 见 eval 实测栏）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm r4-wrong-track-prod-surface:prove`** | **0** | 真 PG · PS1–PS3；≠ R4 关；≠ prod fully closed；await dual |
| **`pnpm r4-wrong-track-prod-surface:prove:raw`**（no-PG） | **1** | skip≠pass |

**未跑（禁）**：HA 绿关 · flip default / open DELETE · 把本绿写成 R4 关 / prod fully closed。  
**Key**：unset（未 invent MODEL_API_KEY）。

---

## Please answer

1. 请 **独立复跑** `pnpm r4-wrong-track-prod-surface:prove`，附 CMD+EXIT；并确认 `:prove:raw` no-PG EXIT≠0。  
2. PS1–PS3 是否诚实成立（deploy fail-closed · track_local obs · LIVE_PG 旁证 · honesty pins）？  
3. LIVE_PG ADV `post_prove_dual_pass` 是否仍钉 **≠** prod closed？  
4. NHP covered dual 是否仍钉 **≠** this knife / **≠** production wrong_track=0 fully closed？  
5. EXIT=0 是否仍钉 **≠ R4 closed / ≠ 题域已隔离 / ≠ HA / ≠ suite green**？  
6. harness/status/eval 是否错误把本绿写成 R4 已关 / prod fully closed？（期望：**否**）  
7. sole allowlist 是否仍恰 5 未翻？`releaseEvidence=false`？

Please write the conclusion to `reviews/`（e.g. `2026-09-16-r4-f1-wrong-track-prod-surface-post-prove-mw-e2e-ha.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- 不宣称 R4 closed / 题域已隔离 / prod wrong_track=0 fully closed / HA  
- **await post-prove dual**

---

*REQUEST · mw-e2e-ha · F1 prod-surface post-prove · 2026-09-16 ~23:20 PT · releaseEvidence=false · ≠HA · ≠R4 closed · awaiting dual*

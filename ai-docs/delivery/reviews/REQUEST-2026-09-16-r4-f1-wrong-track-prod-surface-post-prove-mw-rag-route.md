# REQUEST — Knife **F1** · wrong_track **production-surface remaining** **post-prove**（RAG/路由）→ mw-rag-route

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-16 (~23:20 PT · post-prove)  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ wrong_track=0 production fully closed** · **LIVE_PG dual ≠ prod closed** · **NHP covered dual ≠ this knife** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE**  
**Pair**: `REQUEST-2026-09-16-r4-f1-wrong-track-prod-surface-post-prove-mw-e2e-ha.md`  
**Hard**: pre-exec dual PASS · meetwise authorize coding+prove · G-R2-5 retained · ban P-FAKEPLAN · EXIT=0 ≠ R4 closed ≠ prod fully closed · no self-approve  
**Prior pre-exec dual（pass）**: `2026-09-16-r4-f1-wrong-track-prod-surface-mw-rag-route.md` · `2026-09-16-r4-f1-wrong-track-prod-surface-mw-e2e-ha.md`  
**Knife**: `pnpm r4-wrong-track-prod-surface:prove`（真 PG · PS1–PS3）；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## Contra

| File | Role |
|------|------|
| `harness/r4-f1-wrong-track-prod-surface.md` | Canonical harness（`executed:awaiting_post_prove_dual`） |
| `eval/r4-f1-wrong-track-prod-surface.eval.md` | run-status + fake-green |
| `r4-f1-wrong-track-prod-surface.slice.md` | Slice |
| `harness/r4-domain-isolation-status.md` §13 | R4 **仍 NOT closed** |
| `m4-rag-hard-gates.md` §R4 | wrong_track=0 关闭条件原文；R4 still NOT closed |
| `apps/worker/src/qbank-track-local-retrieve.ts` | track_local observe + retrieveVia |
| `apps/worker/src/interview-consumer.ts` | `track_local_required` deploy fail-closed |
| `apps/worker/test/r4-wrong-track-prod-surface.proof.ts` | F1 prove |
| `packages/ai-runtime/src/metrics.ts` | track_local baseline |
| LIVE_PG / NHP covered harnesses | 旁证层 · **≠** F1 alone |

---

## Stance（rag-route）

F1 closes **production-surface remaining** gaps beyond LIVE_PG honesty + NHP-R4-ADV-01 covered（THIS case）:

1. **PS1** — production call-path (`trackLocal` → `retrieveViaDispatchTrackLocal`) + deploy-shape fail-closed when production lacks trackLocal  
2. **PS2** — observability on production path for metadata / track-flip / cache-replay escapes（`mode=track_local`）；cache-replay map still fail-closed  
3. **PS3** — honest pin: remaining ≠ R4 closed（P-R1 / P-R2 / P-META / P-FIX still open）  

Retain G-R2-5 · ban P-FAKEPLAN · ban unscoped/sibling/legacy_unrouted.  
**EXIT=0 ≠ production wrong_track=0 fully closed ≠ R4 closed ≠ 题域已隔离 ≠ HA**.  
本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方 · 见 eval）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm r4-wrong-track-prod-surface:prove`** | **0** | 真 PG · PS1–PS3；≠ R4 关；await dual |
| **`pnpm r4-wrong-track-prod-surface:prove:raw`**（no-PG） | **1** | skip≠pass |

---

## Please answer

1. 请 **独立复跑** `pnpm r4-wrong-track-prod-surface:prove`，附 CMD+EXIT；确认 raw no-PG EXIT≠0。  
2. PS1–PS3 / E1–E8 是否诚实（deploy fail-closed · track_local obs · cache-replay · honesty pins）？  
3. LIVE_PG dual ≠ prod closed · NHP covered dual ≠ this knife 是否硬钉？  
4. G-R2-5 / ban P-FAKEPLAN / ban unscoped 是否保留？  
5. EXIT=0 是否仍钉 **≠ R4 closed / ≠ 题域已隔离 / ≠ HA / ≠ production wrong_track=0 fully closed**？  
6. harness/status/eval 是否错误把本绿写成 R4 关 / prod fully closed？（期望：**否**）  
7. sole allowlist 恰 5 · `releaseEvidence=false`？

Please write the conclusion to `reviews/`（e.g. `2026-09-16-r4-f1-wrong-track-prod-surface-post-prove-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- 不宣称 R4 closed / 题域已隔离 / prod wrong_track=0 fully closed / HA  
- **await post-prove dual**

---

*REQUEST · mw-rag-route · F1 prod-surface post-prove · 2026-09-16 ~23:20 PT · releaseEvidence=false · ≠HA · ≠R4 closed · awaiting dual*

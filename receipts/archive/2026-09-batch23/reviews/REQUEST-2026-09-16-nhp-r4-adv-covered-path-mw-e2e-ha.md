# REQUEST — NHP-R4-ADV-01 **covered path**（pre-exec）→ mw-e2e-ha

**Status**: **REQUEST / awaiting review**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-16 (~19:44 PT)  
**Knife status**: **`REQUEST-ready / not_run:pre_dual`** · **no prove** · **no coding** · review-before-run  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R4 closed** · **≠ wrong_track=0 production closed** · **≠ 题域已隔离**  
**Pair**: `REQUEST-2026-09-16-nhp-r4-adv-covered-path-mw-rag-route.md`  
**Hard**: LIVE_PG ADV `post_prove_dual_pass` ≠ this covered path done · partial ≠ covered until this knife dual+prove+post-prove dual · EXIT=0 later ≠ covered alone ≠ R4 closed ≠ HA · no self-approve

---

## Contra

| File | Role |
|------|------|
| `harness/nhp-r4-adv-covered-path.md` | Canonical harness（this knife） |
| `eval/nhp-r4-adv-covered-path.eval.md` | Eval checklist |
| `nhp-r4-adv-covered-path.slice.md` | Slice index |
| `harness/r4-domain-isolation-status.md` §12 | R4 still NOT closed · next covered knife |
| `non-happy-path-perf-load-case-matrix.md` · NHP-R4-ADV-01 | Still **partial**/honesty-pin ≠ covered |
| `harness/r4-wrong-track-adv.md` | Prior ADV `post_prove_dual_pass`（honesty only） |
| `harness/r4-wrong-track-adv-live-pg.md` | LIVE_PG `executed:awaiting_post_prove_dual` · gap open until dual |

---

## Stance（E2E-HA）

This knife **defines** the non-happy **covered path** for NHP-R4-ADV-01 beyond honesty/partial:

1. **Eval cases** C1–C4（cross-domain wrong_track=0 · A3 adversary surfaces · G-R2-5/P-FAKEPLAN · matrix honesty）  
2. **E2E matrix pin** — promote partial→covered **only** after this knife dual+prove+post-prove dual  
3. **Prove CMD freeze** — `pnpm nhp-r4-adv-covered:prove`（planned；**not_run:pre_dual**；not implemented this prep）

**Explicit**: LIVE_PG ADV `post_prove_dual_pass` **≠** covered path done. ADV honesty **≠** covered. **≠ R4 closed**. **≠ production wrong_track=0 closed**.

This prep: **zero prove · zero coding · zero self-approve**.

---

## Please answer

1. Agree covered path = eval → E2E matrix → CMD freeze（beyond honesty/partial）?  
2. Agree LIVE_PG ADV `post_prove_dual_pass` ≠ this covered path done?  
3. Agree NHP-R4-ADV-01 must stay **partial** until **this knife** dual + prove + post-prove dual?  
4. Agree ≠ R4 closed · ≠ wrong_track=0 production closed · ≠ HA · ≠ full E2E suite green?  
5. Agree CMD `not_run:pre_dual` · no prove this turn · no self-approve · `releaseEvidence=false`?

Please write the conclusion to `reviews/`（e.g. `2026-09-16-nhp-r4-adv-covered-path-mw-e2e-ha.md`）. **Ban** implementer writing pass.

---

## Non-claims

- Not pass · not covered · not R4 closed · not LIVE_PG gap dual-closed by this REQUEST · not HA · not production wrong_track=0 closed

---

*REQUEST · mw-e2e-ha · NHP-R4-ADV covered path · 2026-09-16 ~19:44 PT · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠ covered · R4 open*

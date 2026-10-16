# REQUEST — NHP-R4-ADV-01 **covered path**（pre-exec）→ mw-rag-route

**Status**: **REQUEST / awaiting review**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-16 (~19:44 PT)  
**Knife status**: **`REQUEST-ready / not_run:pre_dual`** · **no prove** · **no coding** · review-before-run  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ wrong_track=0 production closed**  
**Pair**: `REQUEST-2026-09-16-nhp-r4-adv-covered-path-mw-e2e-ha.md`  
**Hard**: LIVE_PG ADV `post_prove_dual_pass` ≠ this covered path done · partial ≠ covered until this knife dual+prove+post-prove dual · G-R2-5 retained · ban P-FAKEPLAN · no self-approve

---

## Contra

| File | Role |
|------|------|
| `harness/nhp-r4-adv-covered-path.md` | Canonical harness |
| `eval/nhp-r4-adv-covered-path.eval.md` | Eval |
| `nhp-r4-adv-covered-path.slice.md` | Slice |
| `harness/r4-domain-isolation.md` / `r4-domain-isolation-status.md` §12 | R4 NOT closed · covered knife opened |
| Matrix NHP-R4-ADV-01 | **partial**/honesty-pin |
| Prior ADV / LIVE_PG harnesses | honesty / LIVE_PG_GAP — **≠ covered** |

---

## Stance（RAG / route）

RAG-route view: covered elevation for wrong_track ADV must **not** collapse into:

- ADV unit+map honesty dual  
- LIVE_PG Worker+PG dual alone  
- wire CALL_SITES=1  

Covered requires **explicit** C1–C4 + matrix pin + frozen `pnpm nhp-r4-adv-covered:prove` + this knife's dual chain. Retain **G-R2-5** · ban **P-FAKEPLAN** · ban unscoped / sibling / legacy_unrouted. **≠ R4 closed** · **≠ 题域已隔离**.

---

## Please answer

1. Agree elevating NHP-R4-ADV-01 to covered needs this dedicated path（eval→matrix→CMD）beyond honesty/LIVE_PG?  
2. Agree LIVE_PG ADV `post_prove_dual_pass` ≠ covered path done from RAG view?  
3. Agree C3（G-R2-5 / ban P-FAKEPLAN / ban unscoped）must remain in covered acceptance?  
4. Agree ≠ R4 closed / ≠ 题域已隔离 / ≠ production wrong_track=0 closed?  
5. Agree `not_run:pre_dual` · no prove · no coding · no self-approve · `releaseEvidence=false`?

Please write the conclusion to `reviews/`（e.g. `2026-09-16-nhp-r4-adv-covered-path-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- Not pass · not covered · not R4 closed · not 题域已隔离 · not LIVE_PG gap closed by this REQUEST · not HA

---

*REQUEST · mw-rag-route · NHP-R4-ADV covered path · 2026-09-16 ~19:44 PT · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠ covered · R4 open*

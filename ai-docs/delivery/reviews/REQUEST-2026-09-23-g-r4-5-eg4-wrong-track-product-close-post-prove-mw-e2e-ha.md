# REQUEST — **G-R4-5 / EG4 wrong-track product close** **post-prove** → mw-e2e-ha

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-23 (~12:20 PT) · post-prove  
**releaseEvidence=false** · **≠HA** · **≠suite green** · `eg4ProductClosed=true` · `wrongTrackProductClosed=true` under authorize · `gR45Closed=false` · `r4ProductClosed=true` **retained** · `funnelProductClosed=true` **retained** · `domainIsolationClosed=true` **retained** · `eg3ProductClosed=true` **retained** · coveredCount **not invented** · **G-R4-5 STILL OPEN** · **MS3 ≠ R4 closed** · Ban flip `gR45Closed`/r4/funnel · Ban invent coveredCount · Ban forge · Ban claim closed from EXIT=0 alone as lifecycle nail · Ban wash EG4 tip **`3cefebf`** / dual **`ec90b6d`** / R4·FUNNEL tip **`2b38e18`** / prove **`14e9e2c`** / EG3 tip **`7be1a55`** / prove **`5b3c854`** · Ban MS3=R4 · Ban empty meta · Ban self-nail `post_prove_dual_pass`  
**Pair**: `REQUEST-2026-09-23-g-r4-5-eg4-wrong-track-product-close-post-prove-mw-rag-route.md`  
**Hard**: standing authorize after pre-exec dual on REQUEST tip **`1b589af`** · prior **`pre_dual_pass`** recorded · product-close prove EXIT **2×0** ≠ G-R4-5 all closed · Ban self-approve · Ban secrets · No force · Dual PASS ≠ next knife auto-authorize  
**Knife**: `harness/g-r4-5-eg4-wrong-track-product-close.md` · status **`executed:awaiting_post_prove_dual`** · **实现方不写** pass review · **Ban self-write `post_prove_dual_pass`**

---

## Contra

| File | Role |
|------|------|
| `harness/g-r4-5-eg4-wrong-track-product-close.md` | Knife harness · `executed:awaiting_post_prove_dual` · prior `pre_dual_pass` |
| `receipts/2026-09-23-g-r4-5-eg4-wrong-track-product-close-prove.md` | CMD+EXIT table |
| `receipts/2026-09-23-g-r4-5-eg4-wrong-track-product-close-evidence.json` | product-close evidence flags |
| Pre-exec dual | `REQUEST-2026-09-23-g-r4-5-eg4-wrong-track-product-close-mw-e2e-ha.md` + `…-mw-rag-route.md` · **pass** on `1b589af` |
| Prior EG4 evidence | tip **`3cefebf`** / dual **`ec90b6d`** retained OPEN evidence · Ban wash |
| Prior R4·FUNNEL | tip **`2b38e18`** / prove **`14e9e2c`** · Ban flip r4/funnel/`gR45Closed` |
| Prior EG3 | tip **`7be1a55`** / prove **`5b3c854`** · Ban wash into EG4 |

---

## Stance（mw-e2e-ha）

1. Standing authorize coding+flip+prove after pre-exec dual on `1b589af` · prior `pre_dual_pass` · Dual≠coding.  
2. Dedicated + production-scoped proves EXIT **2×0** · `eg4ProductClosed=true` / `wrongTrackProductClosed=true` under authorize · **Ban** flip `gR45Closed`/r4/funnel.  
3. Ban wash EG4 / R4·FUNNEL / EG3 · Ban invent coveredCount · Ban MS3=R4 · Ban empty meta · Ban forge.  
4. Knife remains **`executed:awaiting_post_prove_dual`** until experts write pass — **Ban** implementer self-write `post_prove_dual_pass`.  
5. Dual PASS ≠ next knife auto-authorize · Key×3 O3 honesty_red **非阻塞** · no second knife.

本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| `pnpm r4-eg4-wrong-track-product-close:prove` | **0** | dedicated product-close · flags this knife only |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | production-scoped honesty · ≠ G-R4-5 all closed |

---

*REQUEST stub · post-prove · mw-e2e-ha · G-R4-5 / EG4 wrong-track product close · 2026-09-23 · executed:awaiting_post_prove_dual · Ban自批*

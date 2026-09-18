# Harness — **G-R4-3 residual**（docs REQUEST open · **residual OPEN** · PR1-B/C evidence gaps）

**Status**: **`REQUEST-ready / not_run:pre_dual`**  
**Date**: 2026-09-17 (~20:38 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **G-R4-3 STILL OPEN** · **PR1-B/C false / evidence gaps** · **≠ R1 product closed** · **≠ G-R4-3 closed** · **≠ flip default** · **≠ coding authorized** · **Ban假关** · **Ban wash R1 L5 into G-R4-3 closed** · **Dual PASS ≠ coding** · **Ban self-approve**  
**Experts (REQUEST pair)**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual **await** · Dual PASS ≠ coding · Ban self-approve）  
**Prior R1-EXPLICIT L4+L5**: `harness/r1-explicit-close-ssot-flip.md` · **`post_prove_dual_pass`** · L4 tip **`ebd4117`** · L5 tip **`9e9b6ff`** · dual on **`da20c09`** · EXIT **3×0** · **knife narrative CLOSED** · **≠** this residual · **≠** wash L5 into G-R4-3 closed · fail-closed default **NOT flipped**（still `0`）  
**Prior prove dual_pass**: `harness/r1-real-close-ssot-flip.md` · dual on **`0deb5fb`** · tip **`30d93dc`** · **≠** this knife · Ban wash  
**Prior docs knife**: `harness/r1-close-authorize-receipt.md` · dual on **`2316bbc`** · close **`f9119fe`** · **≠** this knife · Ban wash  
**Prior F4 honesty**: `harness/r4-f4-p-r1-fail-closed.md` · **`post_prove_dual_pass`** · **PR1-A true · PR1-B/C false** · **G-R4-3 STILL OPEN** · no flip default  
**Slice**: `../g-r4-3-residual.slice.md`  
**Eval**: `../eval/g-r4-3-residual.eval.md`  
**Authority**: meetwise — docs-only REQUEST open to list **PR1-B/C evidence gaps** blocking G-R4-3 close · Ban secrets / `.env*` · Meridian banned · No force-push  
**Honesty**: R1-EXPLICIT L4 `ebd4117` / L5 `9e9b6ff` = **knife narrative CLOSED only** · **≠** G-R4-3 closed · **≠** R1 product closed beyond knife · Dual PASS here ≠ coding · residual **OPEN** · fail-closed default still **0**

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Docs-only REQUEST: list **PR1-B/C evidence gaps** for **G-R4-3** residual · dual pre-exec REQUEST pair · residual honesty |
| **What this knife is not** | **Not** coding · **not** prove · **not** claiming G-R4-3 closed · **not** claiming R1 product closed · **not** flipping `MEETWISE_TECH_ROLE_FAIL_CLOSED` · **not** washing R1 L5 `9e9b6ff` / L4 `ebd4117` into G-R4-3 closed · **not** washing prove dual_pass `0deb5fb`/`30d93dc` or docs knife `f9119fe`/`2316bbc` as G-R4-3 close |
| **≠ R1 L5 wash** | **YES** — L5 tip **`9e9b6ff`** · L4 **`ebd4117`** · knife narrative **CLOSED** · **G-R4-3 STILL OPEN** · Ban wash L5 into G-R4-3 closed |
| **≠ prove dual_pass wash** | **YES** — prove `0deb5fb` / tip `30d93dc` · Ban claim as G-R4-3 close |
| **≠ docs knife wash** | **YES** — `f9119fe` / `2316bbc` · Ban claim as G-R4-3 close |
| **R1 L5 dual_pass ⇒ G-R4-3 closed?** | **NO** — Ban假关 · Ban wash |
| **Dual PASS here ⇒ coding?** | **NO** — Dual PASS ≠ coding · waits **standing authorize after dual** |
| **G-R4-3 / PR1-B/C** | **STILL OPEN** · PR1-B/C **false** · Ban假关 |
| **Fail-closed default** | **NOT flipped** · still `MEETWISE_TECH_ROLE_FAIL_CLOSED=0` |
| **Now** | **`REQUEST-ready / not_run:pre_dual`** · zero coding · zero prove · residual **OPEN** · `releaseEvidence=false` |

---

## 1. Evidence gaps（block G-R4-3 close · **PR1-B/C**）

| # | Gap | Source / pointer | Honest read |
|---|-----|------------------|-------------|
| **PR1-A** (context) | Legacy「技术岗」default-on honesty | F4 `r4-f4-p-r1-fail-closed` · classifier | **true** · production still depends on legacy fallback · **≠** G-R4-3 closed alone |
| **PR1-B** | Fail-closed **flag-on / combo-root** production evidence | F4 · receipt `receipts/2026-09-17-r1-explicit-close-ssot-flip-prove.md` | **false / missing · STILL OPEN** · Ban forge · Ban flip default this knife |
| **PR1-C** | **Default-on / no-legacy** path · r1 prove ≠ product close | F4 · receipt · `r1-tech-role-fail-closed:prove` | **false / missing · STILL OPEN** · prove green ≠ R1/G-R4-3 closed · Ban flip `MEETWISE_TECH_ROLE_FAIL_CLOSED` default |
| **EG-D** | Product / G-R4-3 SSOT close authorize after evidence | R1-EXPLICIT §4 fail-closed-adjacent **skipped** | **NOT authorized** · F4 / domain-isolation G-R4-3 **NOT flipped to closed** |
| **EG-E** | Fail-closed default flip | `docker/env/worker.env.example` | **NOT flipped** · still `0` · Ban flip without standing authorize |

**Ban**: claim G-R4-3 closed · claim R1 product closed · wash R1 L5 into G-R4-3 closed · wash prove dual_pass / docs knife as G-R4-3 close · flip fail-closed default · forge PR1-B/C evidence · Dual PASS as coding authorize

---

## 2. Explicit ≠ R1 L5 wash（must survive dual）

| Prior knife | SHA pins | Role | This residual |
|-------------|----------|------|---------------|
| **R1-EXPLICIT L5** | tip **`9e9b6ff`** · L4 **`ebd4117`** · dual **`da20c09`** · EXIT **3×0** | knife narrative CLOSED · narrow SSOT（knife+w0）· fail-closed default **NOT** flipped · **G-R4-3 STILL OPEN** | **≠** wash into G-R4-3 closed |
| **Prove dual_pass** | prove **`0deb5fb`** · tip **`30d93dc`** | prove honesty only · R1 product NOT closed · SSOT NOT flipped | **≠** wash as G-R4-3 close |
| **Docs knife** | dual **`2316bbc`** · close **`f9119fe`** | checklist prep only · R1 product NOT closed | **≠** wash as G-R4-3 close |
| **F4 honesty** | `r4-f4-p-r1-fail-closed` · `post_prove_dual_pass` | PR1-A true · **PR1-B/C false** · G-R4-3 STILL OPEN · no flip | **retained** · residual **OPEN** |

**Headline**: R1 L5 knife narrative **CLOSED** ≠ **G-R4-3 closed**. Ban假关.

---

## 3. Lifecycle（draft · not executed）

| Phase | Gate | This open |
|-------|------|-----------|
| **L0** | REQUEST pair open · `REQUEST-ready / not_run:pre_dual` | **this commit** |
| **L1** | Pre-exec dual (`mw-e2e-ha` + `mw-rag-route`) · Ban self-approve | **await coordinator send** |
| **L2** | **Standing authorize** after dual · Dual PASS ≠ coding | **not yet** |
| **L3** | Standing coding + prove（later · if authorized）· Ban invent EXIT · Ban假关 · Ban forge PR1-B/C · Ban flip default without authorize | **forbidden until L2** |
| **L4** | Post-prove dual · Ban self-approve · Ban wash into G-R4-3 closed | **forbidden until L3** |
| **L5** | **Only then** any G-R4-3 / product SSOT claim · Ban close without PR1-B/C evidence | **forbidden until L4 + evidence** |

**Hard**: REQUEST → pre-exec dual → standing coding+prove (later) → post-prove → **only then** any G-R4-3 close claim.

---

## 4. Pins（must survive dual）

1. **G-R4-3 STILL OPEN** · **PR1-B/C false / evidence gaps** · residual **OPEN**  
2. **≠ R1 L5 wash** — L5 `9e9b6ff` / L4 `ebd4117` knife CLOSED ≠ G-R4-3 closed  
3. **≠ prove dual_pass** `0deb5fb`/`30d93dc` · **≠ docs knife** `f9119fe`/`2316bbc` as G-R4-3 close  
4. Evidence gaps PR1-B/C listed · Ban forge · Ban flip `MEETWISE_TECH_ROLE_FAIL_CLOSED` default（still `0`）  
5. **Ban假关** · **Dual PASS ≠ coding** · Ban self-approve · Ban claim R1/G-R4-3 product closed  
6. **`releaseEvidence=false`** · **≠HA** · ≠suite green  
7. Lifecycle: REQUEST → pre-exec dual → standing coding+prove (later) → post-prove → only then any G-R4-3 SSOT claim  
8. Zero coding / zero prove this open · Ban secrets / `.env*` · Meridian banned · force-push banned  
9. F4 honesty retained · G-R4-3 **NOT** flipped to closed · Ban elevating R1 L5 / prove dual_pass / docs knife to G-R4-3 closed  

---

## 5. Prove CMD honesty（frozen · not run this open）

| CMD | Run status now | Honest read |
|-----|----------------|-------------|
| `pnpm r1-tech-role-fail-closed:prove` | **`not_run:await_authorize`** | Prior EXIT=0 ≠ R1/G-R4-3 closed |
| `pnpm r4-p-r1-fail-closed:prove` | **`not_run:await_authorize`** | F4 honesty · PR1-B/C false · G-R4-3 STILL OPEN |
| `pnpm mysql-stack:m4-rag:prove` | **`not_run:await_authorize`** | §R1 doc gate · ≠ product close |
| PR1-B combo-root / flag-on production evidence | **missing · STILL OPEN** | Ban forge · Ban假关 |
| PR1-C default-on / no-legacy path | **missing · STILL OPEN** | Ban flip default without authorize |
| Fail-closed default / G-R4-3 SSOT flip | **forbidden under evidence gaps** | Ban silent flip · default still `0` |

---

## 6. Non-claims

Not G-R4-3 closed · not R1 product closed · not wash R1 L5 `9e9b6ff`/`ebd4117` into G-R4-3 closed · not wash prove dual_pass `0deb5fb`/`30d93dc` · not wash docs knife `f9119fe`/`2316bbc` · not flip fail-closed default · not forge PR1-B/C · not coding authorized · not HA · not suite · Dual PASS ≠ coding · Ban假关 · `releaseEvidence=false` · G-R4-3 **STILL OPEN** · PR1-B/C **false**

---

*Harness · G-R4-3 residual · 2026-09-17 (~20:38 PT) · REQUEST-ready / not_run:pre_dual · residual OPEN · ≠ R1 L5 wash 9e9b6ff/ebd4117 · ≠ prove dual_pass 0deb5fb/30d93dc · ≠ docs knife f9119fe/2316bbc · G-R4-3 STILL OPEN · PR1-B/C false · fail-closed default still 0 · Ban假关 · Dual PASS ≠ coding · releaseEvidence=false · ≠HA · zero coding · Ban self-approve*

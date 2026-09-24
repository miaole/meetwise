# Eval — **G-R4-5 EG4 true-evidence / impl**（**`executed:awaiting_post_prove_dual`** · EG4 STILL OPEN）

**Date**: 2026-09-23 (~04:38 PT)  
**run-status**: **`executed:awaiting_post_prove_dual`** · EG4 evidence **emitted** · EXIT **1×0** · EG4 **STILL OPEN** · EG5–EG6 **deferred** · **Ban假关** · **Ban invent coveredCount** · **Ban forge** · Ban claim from covered-path / meta prove alone · Ban wash EG3 `62c0e2f`/`c18e28f` / EG1+EG2 `08f7499`/`ffb2a9b` / residual `e23c5fd` / evidence-close `b4a8ede` / 5×0 into closed · **Ban idle re-prove EG1/EG2/EG3 as fake EG4 close** · **Ban idle re-run of the same 5×meta prove as fake close** · Ban self-nail `post_prove_dual_pass` · **G-R4-5 STILL OPEN** · **题域 STILL OPEN** · **R4/FUNNEL product STILL OPEN** · **MS3 ≠ R4 closed**  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ EG3 dual_pass wash** · **≠ EG1+EG2 dual_pass wash** · **≠ residual honesty wash** · **≠ evidence-close dual_pass wash** · **≠ L4 wash**  
**Harness**: `ai-docs/delivery/harness/g-r4-5-eg4-true-evidence-impl.md`  
**Slice**: `ai-docs/delivery/g-r4-5-eg4-true-evidence-impl.slice.md`  
**Receipt**: `ai-docs/delivery/receipts/2026-09-23-g-r4-5-eg4-true-evidence-prove.md`  
**Honesty**: Standing coding+prove under authorize after pre-exec dual on **`cf469c3`** · EG4 wrong_track production honesty evidence emitted · EXIT=0 ≠ EG4/wrong_track closed · Ban wash `62c0e2f`/`c18e28f` / `08f7499`/`ffb2a9b` / `e23c5fd` / `b4a8ede` / 5×0 into closed · Ban idle re-prove EG1/EG2/EG3 / 5×meta as fake close · Ban claim from covered-path / meta prove alone · Ban self-nail `post_prove_dual_pass`

---

## 1. Purpose

Expert **post-prove** checklist for G-R4-5 EG4 true-evidence / impl — coding+prove executed · awaiting dual.  
**Ban**: claiming EG4/wrong_track/any EG / R4/FUNNEL product / dual-claim / 题域 closed · inventing coveredCount · forging receipts · claiming from covered-path / meta prove alone · washing EG3 `62c0e2f`/`c18e28f` · washing EG1+EG2 `08f7499`/`ffb2a9b` · washing residual `e23c5fd` · washing evidence-close `b4a8ede` / 5×0 · treating EXIT=0 as product close · **idle re-proving EG1/EG2/EG3 as fake EG4 close** · **idle re-running the same 5×meta prove as fake close** · implementer self-writing `post_prove_dual_pass` · Cloud Agent · secrets / `.env*`

---

## 2. Execution record

| CMD / action | Expected | Actual | Read |
|--------------|----------|--------|------|
| Pre-exec dual BOTH PASS on `cf469c3` | pass+pass | **pass+pass** | authorize coding+prove |
| EG4 emitter + `pnpm r4-eg4-wrong-track-product:prove` | EXIT=0 · evidence emitted | **EXIT=0** · json receipt | EG4 evidence emitted · EG4 STILL OPEN |
| Prior EG1/EG2/EG3 proves | not re-run as fake EG4 close | **not re-run** | Ban idle re-prove as fake EG4 close |
| Prior 5×meta | not re-run as fake close | **not re-run** | Ban idle re-run as fake close |
| Product SSOT flip | none | **none** | Ban silent flip |
| Status | executed:awaiting_post_prove_dual | **`executed:awaiting_post_prove_dual`** | Ban self-nail dual_pass |
| EG4 / wrong_track | STILL OPEN | **STILL OPEN** | evidence ≠ closed |

---

## 3. Eval cases（post-prove · awaiting dual）

| ID | Eval point | Pass means |
|----|------------|------------|
| E1 | Agree EG4 wrong_track production honesty evidence emitted · `wrongTrackProductEvidence=true` · `eg4ProductClosed=false` · `wrongTrackProductClosed=false` · Ban forge · **EG4 STILL OPEN** · EXIT=0 ≠ product closed | harness §1 + receipt |
| E2 | Agree Ban claim from covered-path / meta prove alone · `coveredPathAloneDoesNotClose=true` · `metaProveAloneDoesNotClose=true` · wrong_track **STILL OPEN** | harness §1/§5 + receipt |
| E3 | Agree **≠** EG3 dual_pass tip `62c0e2f` / dual `c18e28f` · Ban wash · Ban idle re-prove EG3 as fake EG4 close · EG3 **STILL OPEN** retained | harness §0/§2 |
| E4 | Agree **≠** EG1+EG2 tip `08f7499` / prove `ffb2a9b` · **≠** residual tip `e23c5fd` / dual `04c6ed1` · **≠** evidence-close tip `b4a8ede` / prove `ae99258` · Ban wash 5×EXIT=0 · **Ban idle re-run of the same 5×meta prove as fake close** · Ban idle re-prove EG1/EG2 as fake EG4 close | harness §0/§2/§5 |
| E5 | Agree **G-R4-5 STILL OPEN** · **题域 STILL OPEN** · **R4/FUNNEL product STILL OPEN** · **MS3 ≠ R4 closed** · EG1/EG2/EG3/EG4 **STILL OPEN** · Ban假关 · Ban invent coveredCount · Ban forge · Ban claim closed from EXIT=0 alone | hard pin |
| E6 | Agree status **`executed:awaiting_post_prove_dual`** · Ban self-nail `post_prove_dual_pass` · `releaseEvidence=false` · ≠HA · L5 forbidden | harness §3/§4 |

---

## 4. Fake-close checklist（post-prove · for experts）

- [ ] EXIT=0 ≠ EG4 / wrong_track / 题域 / R4 / G-R4-5 closed
- [ ] Ban claim from covered-path / meta prove alone
- [ ] Ban idle re-prove EG1/EG2/EG3 as fake EG4 close
- [ ] Ban idle re-run same 5×meta as fake close
- [ ] Ban invent coveredCount · Ban forge · Ban wash `62c0e2f`/`c18e28f` / `08f7499`/`ffb2a9b` / `e23c5fd` / `b4a8ede`
- [ ] Implementer did **not** self-write `post_prove_dual_pass`
- [ ] `releaseEvidence=false` · ≠HA · product SSOT NOT flipped

---

*Eval · G-R4-5 EG4 true-evidence / impl · 2026-09-23 (~04:38 PT) · executed:awaiting_post_prove_dual · Ban self-nail · EG4 STILL OPEN · wrong_track STILL OPEN · releaseEvidence=false · ≠HA*

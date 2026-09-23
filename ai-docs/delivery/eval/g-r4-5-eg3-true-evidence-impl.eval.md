# Eval — **G-R4-5 EG3 true-evidence / impl**（**`executed:awaiting_post_prove_dual`** · EG3 STILL OPEN）

**Date**: 2026-09-23 (~04:22 PT)  
**run-status**: **`executed:awaiting_post_prove_dual`** · EG3 evidence **emitted** · EXIT **1×0** · EG3 **STILL OPEN** · EG4–EG6 **deferred** · **Ban假关** · **Ban invent coveredCount** · **Ban forge** · **Ban claim 题域已隔离 from meta prove alone** · Ban wash residual `e23c5fd` / evidence-close `b4a8ede` / 5×0 / EG1+EG2 `08f7499`/`ffb2a9b` into closed · **Ban idle re-prove EG1/EG2 as fake EG3 close** · **Ban idle re-run of the same 5×meta prove as fake close** · Ban self-nail `post_prove_dual_pass` · **G-R4-5 STILL OPEN** · **题域 STILL OPEN** · **R4/FUNNEL product STILL OPEN** · **MS3 ≠ R4 closed**  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ EG1+EG2 dual_pass wash** · **≠ residual honesty wash** · **≠ evidence-close dual_pass wash** · **≠ L4 wash**  
**Harness**: `ai-docs/delivery/harness/g-r4-5-eg3-true-evidence-impl.md`  
**Slice**: `ai-docs/delivery/g-r4-5-eg3-true-evidence-impl.slice.md`  
**Receipt**: `ai-docs/delivery/receipts/2026-09-23-g-r4-5-eg3-true-evidence-prove.md`  
**Honesty**: Standing coding+prove under authorize after pre-exec dual on **`0c0bbcb`** · EG3 product evidence emitted · EXIT=0 ≠ EG3/题域 closed · Ban wash `08f7499`/`ffb2a9b` / `e23c5fd` / `b4a8ede` / 5×0 into closed · Ban idle re-prove EG1/EG2 / 5×meta as fake close · Ban claim 题域已隔离 from meta prove alone · Ban self-nail `post_prove_dual_pass`

---

## 1. Purpose

Expert **post-prove** checklist for G-R4-5 EG3 true-evidence / impl — coding+prove executed · awaiting dual.  
**Ban**: claiming EG3/题域/any EG / R4/FUNNEL product / dual-claim closed · inventing coveredCount · forging receipts · claiming 题域已隔离 from `mysql-stack:r4-domain-isolation:prove` alone · washing EG1+EG2 `08f7499`/`ffb2a9b` · washing residual `e23c5fd` · washing evidence-close `b4a8ede` / 5×0 · treating EXIT=0 as product close · **idle re-proving EG1/EG2 as fake EG3 close** · **idle re-running the same 5×meta prove as fake close** · implementer self-writing `post_prove_dual_pass` · Cloud Agent · secrets / `.env*`

---

## 2. Execution record

| CMD / action | Expected | Actual | Read |
|--------------|----------|--------|------|
| Pre-exec dual BOTH PASS on `0c0bbcb` | pass+pass | **pass+pass** | authorize coding+prove |
| EG3 emitter + `pnpm r4-eg3-domain-isolation-product:prove` | EXIT=0 · evidence emitted | **EXIT=0** · json receipt | EG3 evidence emitted · EG3 STILL OPEN |
| Prior EG1/EG2 proves | not re-run as fake EG3 close | **not re-run** | Ban idle re-prove as fake EG3 close |
| Prior 5×meta | not re-run as fake close | **not re-run** | Ban idle re-run as fake close |
| Product SSOT flip | none | **none** | Ban silent flip |
| Status | executed:awaiting_post_prove_dual | **`executed:awaiting_post_prove_dual`** | Ban self-nail dual_pass |
| EG3 / 题域 | STILL OPEN | **STILL OPEN** | evidence ≠ closed |

---

## 3. Eval cases（post-prove · awaiting dual）

| ID | Eval point | Pass means |
|----|------------|------------|
| E1 | Agree EG3 product evidence emitted · `domainIsolationProductEvidence=true` · `eg3ProductClosed=false` · `domainIsolationClosed=false` · Ban forge · **EG3 STILL OPEN** · EXIT=0 ≠ product closed | harness §1 + receipt |
| E2 | Agree Ban claim 题域已隔离 from `mysql-stack:r4-domain-isolation:prove` alone · `metaProveAloneDoesNotClose=true` · **题域 STILL OPEN** | harness §1/§5 + receipt |
| E3 | Agree **≠** EG1+EG2 dual_pass tip `08f7499` / prove `ffb2a9b` · Ban wash · Ban idle re-prove EG1/EG2 as fake EG3 close · EG1/EG2 **STILL OPEN** retained | harness §0/§2 |
| E4 | Agree **≠** residual tip `e23c5fd` / dual `04c6ed1` · **≠** evidence-close tip `b4a8ede` / prove `ae99258` · Ban wash 5×EXIT=0 · **Ban idle re-run of the same 5×meta prove as fake close** | harness §0/§2/§5 |
| E5 | Agree **G-R4-5 STILL OPEN** · **题域 STILL OPEN** · **R4/FUNNEL product STILL OPEN** · **MS3 ≠ R4 closed** · EG1/EG2/EG3 **STILL OPEN** · Ban假关 · Ban invent coveredCount · Ban forge · Ban claim closed from EXIT=0 alone | hard pin |
| E6 | Agree status **`executed:awaiting_post_prove_dual`** · Ban self-nail `post_prove_dual_pass` · `releaseEvidence=false` · ≠HA · L5 forbidden | harness §3/§4 |

---

## 4. Fake-close checklist（post-prove · for experts）

- [ ] EXIT=0 ≠ EG3 / 题域 / R4 / G-R4-5 closed
- [ ] Ban claim from meta `mysql-stack:r4-domain-isolation:prove` alone
- [ ] Ban idle re-prove EG1/EG2 as fake EG3 close
- [ ] Ban idle re-run same 5×meta as fake close
- [ ] Ban invent coveredCount · Ban forge · Ban wash `08f7499`/`ffb2a9b` / `e23c5fd` / `b4a8ede`
- [ ] Implementer did **not** self-write `post_prove_dual_pass`
- [ ] `releaseEvidence=false` · ≠HA · product SSOT NOT flipped

---

*Eval · G-R4-5 EG3 true-evidence / impl · 2026-09-23 (~04:22 PT) · executed:awaiting_post_prove_dual · Ban self-nail · EG3 STILL OPEN · 题域 STILL OPEN · releaseEvidence=false · ≠HA*

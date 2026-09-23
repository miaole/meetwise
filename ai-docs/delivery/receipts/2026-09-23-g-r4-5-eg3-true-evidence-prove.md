# Receipt — **G-R4-5 EG3 true-evidence / impl** prove

**Date**: 2026-09-23 (~04:22 PT)  
**Knife**: `harness/g-r4-5-eg3-true-evidence-impl.md` · status **`executed:awaiting_post_prove_dual`**  
**Authority**: standing authorize after pre-exec dual BOTH PASS on REQUEST **`0c0bbcb`** (reviews landed **`82b2761`**)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **EG3 STILL OPEN** · **题域 STILL OPEN** · **G-R4-5 STILL OPEN** · **R4/FUNNEL product STILL OPEN** · **MS3 ≠ R4 closed** · EG1/EG2 **STILL OPEN** · EG4–EG6 **deferred**  
**Ban**: claim EG3/题域/product closed from EXIT=0 · claim 题域已隔离 from meta prove alone · invent coveredCount · forge · idle re-prove EG1/EG2 · idle re-run 5×meta · self-nail `post_prove_dual_pass` · Cloud Agent · secrets / `.env*`

---

## CMD+EXIT

| CMD | EXIT | Honest read |
|-----|------|-------------|
| `pnpm r4-eg3-domain-isolation-product:prove` | **0** | EG3 product 题域隔离 evidence emitted · ≠ EG3/题域/G-R4-5/R4 closed · Ban forge · Ban claim from `mysql-stack:r4-domain-isolation:prove` alone |

Prior EG1/EG2 proves (`r4-eg1-dual-claim:prove` / `r4-eg2-funnel-covered:prove`) and prior 5×meta (tip `ae99258`) **retained as ceiling · not re-run as fake EG3 close**.

---

## Artifacts

| Artifact | Path |
|----------|------|
| Emitter | `apps/worker/src/r4-eg3-domain-isolation-product-evidence.ts` |
| Prove | `apps/worker/test/r4-eg3-domain-isolation-product-evidence.proof.ts` |
| JSON receipt | `receipts/2026-09-23-g-r4-5-eg3-domain-isolation-product-evidence.json` |
| Classifier honesty | `eg3ProductClosed=false` · `domainIsolationClosed=false` · `gR45Closed=false` · `r4ProductClosed=false` · `wrongTrackZeroProductProven=false` · `metaProveAloneDoesNotClose=true` · `releaseEvidence=false` |

---

## Non-claims

EXIT=0 ≠ EG3 closed ≠ 题域已隔离 ≠ dual-claim closed ≠ R4/FUNNEL product closed ≠ G-R4-5 closed · Ban wash EG1+EG2 `08f7499`/`ffb2a9b` · Ban wash residual `e23c5fd` · Ban wash evidence-close `b4a8ede` / 5×0 · Ban claim from meta prove alone · Ban self-nail `post_prove_dual_pass` · product SSOT **NOT** flipped.

---

*Receipt · EG3 true-evidence prove · 2026-09-23 (~04:22 PT) · EXIT 1×0 · executed:awaiting_post_prove_dual · Ban自批 · releaseEvidence=false · ≠HA*

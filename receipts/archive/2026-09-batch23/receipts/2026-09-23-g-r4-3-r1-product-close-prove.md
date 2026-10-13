# Prove receipt — **G-R4-3 / R1 product close**

**Date**: 2026-09-23 (~07:55 PT)  
**Base / pre-exec tip**: **`147b9d1`** / full `147b9d1409d8a4cf2c3198e6013772ce17abc02e`  
**Authority**: standing authorize after pre-exec dual BOTH PASS · Ban secrets / `.env*` · Ban Meridian · Ban Cloud Agent · Ban self-nail `post_prove_dual_pass`  
**Harness**: `harness/g-r4-3-r1-product-close.md` · status **`executed:awaiting_post_prove_dual`**  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ R4/FUNNEL/题域/G-R4-5/EG closed**

---

## CMD+EXIT

| CMD | EXIT | Honest read |
|-----|------|-------------|
| `pnpm r4-pr1-product-close:prove` | **0** | dedicated product-close evidence · `gR43ProductClosed=true` · `r1ProductClosed=true` this knife only under authorize · Ban self-nail dual_pass |
| `pnpm r4-pr1b-combo-root:prove` | **0** | retained PR1-B combo-root / flag-on evidence |
| `pnpm r4-pr1c-no-legacy:prove` | **0** | retained PR1-C · honest `failClosedDefaultStill0=false` · `defaultFlipped=true` |
| `pnpm r1-tech-role-fail-closed:prove` | **0** | retained R1 contract · product default ON |

## Evidence JSON

`receipts/2026-09-23-g-r4-3-r1-product-close-evidence.json`

Key flags:
- `failClosedDefaultStill0=false`
- `defaultFlipped=true`
- `gR43ProductClosed=true`
- `r1ProductClosed=true`
- `r4ProductClosed=false` · `funnelProductClosed=false` · `domainIsolationClosed=false` · `gR45Closed=false` · `eg1ThroughEg6Closed=false`
- `releaseEvidence=false`

## Code / SSOT touch (authorized)

- `apps/worker/src/adaptive-role-resolve.ts` — product default ON
- `docker/env/worker.env.example` — `MEETWISE_TECH_ROLE_FAIL_CLOSED=1`
- `apps/worker/src/r4-pr1-product-close.ts` + proof + package scripts
- PR1-C emitter/proof honest post-flip · R1 proof default ON · PR1-B B3 default-on
- SSOT: GAP-RAG-01 · m4 §R1 · w0-w8 · G-R4-3 harness/slice · r1-tech-role-fail-closed harness

## Ban wash / non-claims

- ≠ wash EG6 `9b1c83e`/`3e82f14` or PR1 `77c83ce` into R4/FUNNEL/题域 closed
- ≠ invent coveredCount · ≠ HA · ≠ suite green · ≠ `releaseEvidence=true`
- **Ban self-nail `post_prove_dual_pass`** · Dual PASS ≠ next R4/FUNNEL auto-authorize
- Key×3 O3 honesty_red **非阻塞**

---

*Prove receipt · G-R4-3 / R1 product close · 2026-09-23 · EXIT 4×0 · executed:awaiting_post_prove_dual · Ban self-nail*

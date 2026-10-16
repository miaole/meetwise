# Harness — **UC-E2E-018 AiGraphRun safely_terminated**（§1b #2 · `GAP-UC018-GRAPH` · **`post_prove_dual_pass`**）

**Status**: **`post_prove_dual_pass`**（AUTHORIZED coding+prove landed on prove tip `f06dcba`; post-prove dual **BOTH PASS** on `2ff3527` / `8b382cc`; authorized lifecycle nail · **GAP-UC018-GRAPH closed only** · matrix remains **partial** · **Ban claim UC-E2E-018 covered** · §1b #3/#5/#6 remain OPEN · STOP）
**Date**: 2026-09-23 (~16:52 PT)
**Branch**: `feat/mysql-schema-skeleton`
**REQUEST / parent**: REQUEST `25d1900`; parent FULL-E2E nail `c36b032` (`GAP-UC018-FULL-E2E` closed prior, retained and not washed into this knife).
**Prove tip**: `f06dcba` / `f06dcbaf0da35d853888df700f78c5541902e1a7`
**Post-prove dual**: `mw-e2e-ha` tip `2ff3527` / `2ff3527c9462e462fe1e4fc0bfb2e1fb25da0e7a` · `mw-rag-route` tip `8b382cc` / `8b382cc8600a56611a76599ce9a5eb8d68fc906b` · **BOTH PASS**

**Honest ruling**: `GAP-UC018-GRAPH` is **CLOSED only**. UC-E2E-018 and its matrix row remain **partial**, not covered. This nail does not close §1b #3 TTL, #5 UI, or #6 sole-stack R5.

## 1. Hard pins

- **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`** · **≠ HA** · **≠ suite green**.
- **`gR45Closed=true`** retained · **`coveredCount=8`** retained · **`ms3EqualsR4Closed=false`** retained.
- UC-E2E-018 matrix remains **`partial`**; **do not claim UC-E2E-018 covered** or matrix covered.
- **`GAP-UC018-GRAPH` closed only**; §1b **#3 TTL / #5 UI / #6 sole-stack remain OPEN**.
- Parent FULL-E2E `c36b032` / `GAP-UC018-FULL-E2E` and prior D2b `7fddebe` remain orthogonal retained evidence; **do not wash FULL-E2E/D2b/HA/liveGhaRunUrl into E2E covered** and do not reopen D2b.
- Existing abandon HTTP/db/full-e2e proves remain regression evidence; **do not wash `uc018:abandon:*` into graph closure or UC covered**. Dedicated graph proof is the graph evidence.
- Ban invent green, forge receipts, Meridian, Cloud Agent, secrets / `.env*`, test-results, force-push, second knife, or next-knife authorization.
- **STOP** after this authorized lifecycle nail. Dual PASS is not UC covered and does not authorize another knife.

## 2. Post-prove dual receipts

| Expert | Receipt | Result |
|---|---|---|
| `mw-e2e-ha` | `ai-docs/delivery/reviews/REQUEST-2026-09-23-uc-e2e-018-graph-safely-terminated-post-prove-mw-e2e-ha.md` | **PASS** · tip `2ff3527` · independently reran the five cited commands with EXIT `0/0/0/0/0` · graph terminal real · matrix partial |
| `mw-rag-route` | `ai-docs/delivery/reviews/REQUEST-2026-09-23-uc-e2e-018-graph-safely-terminated-post-prove-mw-rag-route.md` | **PASS** · tip `8b382cc` · independently reran the five cited commands with EXIT `0/0/0/0/0` · dedicated graph prove · matrix partial |

Both post-prove receipts explicitly retain `haStatus=NOT_HA`, `releaseEvidence=false`, `claimProductionHA=false`, `gR45Closed=true`, `coveredCount=8`, and `ms3EqualsR4Closed=false`; both reject UC covered and #3/#5/#6 closure. The receipts are independent and are not self-approval.

## 3. Scope and evidence

| Item | Honest result |
|---|---|
| Product path | On abandon, non-terminal `AiGraphRun` advances `safe_terminating` → `safely_terminated`; business facts remain retained. |
| Dedicated prove | `pnpm uc018:graph:prove` · G1–G5 graph-terminal/fact-retention assertions · EXIT **0** · closes `GAP-UC018-GRAPH` only. |
| Retained regression proves | `pnpm uc018:abandon:prove`, `pnpm uc018:abandon:http:prove`, and `pnpm uc018:abandon:full-e2e:prove` each EXIT **0**; they do not independently prove UC covered. |
| Matrix cite | `pnpm eval-harness-matrix-cite:prove` EXIT **0** and confirms UC-E2E-018 is **partial (not covered)**. |
| Receipts | Prove receipt `ai-docs/delivery/receipts/2026-09-23-uc-e2e-018-graph-safely-terminated-prove.md` and evidence JSON are retained; post-prove expert receipts are listed above. |

## 4. Lifecycle

| Phase | Result |
|---|---|
| REQUEST | DONE · `25d1900` |
| Pre-exec dual | BOTH PASS · `dc0e1fd` + `d1f1f69` |
| AUTHORIZED coding+prove | DONE · prove tip `f06dcba` |
| Post-prove dual | BOTH PASS · `mw-e2e-ha` `2ff3527` + `mw-rag-route` `8b382cc` |
| Authorized lifecycle nail | DONE · this commit sets **`post_prove_dual_pass`** |
| UC covered lift / next knife | **NOT DONE / NOT AUTHORIZED** · matrix partial · STOP |

## 5. Explicit non-claims

- Not UC-E2E-018 covered, not matrix covered, and not full-suite covered.
- Not §1b #3 TTL, #5 UI, or #6 sole-stack R5; those remain **OPEN**.
- Not HA, production HA/failover, release evidence, or sole-stack cutover.
- Not a wash of FULL-E2E `c36b032`, D2b `7fddebe`, HA, `liveGhaRunUrl`, or prior abandon proves.
- Not Meridian, Cloud Agent, secrets, `.env*`, test-results, force-push, or a next knife.

## 6. Cite paths

- Matching slice: `ai-docs/delivery/uc-e2e-018-graph-safely-terminated.slice.md`
- Parent UC harness: `ai-docs/delivery/harness/uc-e2e-018-user-abandon.md` §1b #2
- Eval: `ai-docs/delivery/eval/uc-e2e-018-user-abandon.eval.md`
- Matrix: `ai-docs/delivery/e2e-requirement-coverage-matrix.md` · UC-E2E-018 **partial**
- Prove receipt: `ai-docs/delivery/receipts/2026-09-23-uc-e2e-018-graph-safely-terminated-prove.md`

*Harness · UC-E2E-018 AiGraphRun safely_terminated · `GAP-UC018-GRAPH` · 2026-09-23 (~16:52 PT) · `post_prove_dual_pass` · prove `f06dcba` · post-prove dual `2ff3527` / `8b382cc` BOTH PASS · GAP closed only · matrix partial · #3/#5/#6 OPEN · `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · Ban UC covered · STOP*

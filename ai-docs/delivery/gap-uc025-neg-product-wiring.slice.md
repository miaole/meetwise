# Slice — **GAP-UC025-NEG-01 product wiring**（revised REQUEST · **`post_pre_exec_dual_pass`**）

**Status**: **`post_pre_exec_dual_pass`**（docs status nail · not a product nail）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-02 (~22:30 PT revision)
**Base**: original `58c003156c3fc69505ecb3daa2e3dad25f4a6dfc` · revision base `ad37bbb3115e5836f79c9b2c4dde0420e250de61`
**Authority**: meetwise — L0 docs only · this commit does not authorize editing the proof and does not authorize product wiring · Ban self-approve

## One-line

Revised lock: `pnpm uc025:nhp-neg:prove` / `uc-e2e-025-nhp-neg` **STAYS EXIT 1** until `acceptsQuiz` and `realStaleReject` are both real product wiring, not a stub and not a boolean flipped to true. Current interview begin has no quiz artifact. The proof exits 0 when both regexes hit, so washing green by flipping those booleans is forbidden. Ban wash-green. Ban covered. Ban turning red into green. Ban writing SSOT as covered. `GAP-UC025-NEG-01` stays OPEN. UC-E2E-025 row stays **gap**. Not UC-018. Not UC-052. Prior mw-e2e-ha `6fe3bfd62a15e3ea3396c3e506d7123969f20f95` is FAIL. mw-rag-route `b191881c4474c2b3e34a243d69ccf9da31dbafd0` PASS alone is not a dual. Overall not pass.

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-uc025-neg-product-wiring.md` |
| Revised dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-02-gap-uc025-neg-wiring-revise-mw-e2e-ha.md` |
| Revised dual `mw-rag-route` | `reviews/REQUEST-2026-10-02-gap-uc025-neg-wiring-revise-mw-rag-route.md` |

Old PASS/FAIL review files are not overwritten.

*Slice · GAP-UC025-NEG-01 revised · post_pre_exec_dual_pass · EXIT 1 until real wiring · STOP*

## Post pre-exec dual

**Status**: **`post_pre_exec_dual_pass`**. Docs status nail only. Not a product nail. Implementer does not self-approve. This PASS is not coding permission, not a proof edit, and not product wiring. The next step is post-prove dual, which this commit does not perform.

Pre-exec dual reviewed tip `3ee28d376a3031fcb064d3b7ca05e103d799eb81`: mw-rag-route `80bf022fdf9f3ab48cb523a788d86c3bcb30993e` · mw-e2e-ha `5403c2b678d60e031ba235f989bd33b25a5e866a`. FAIL `6fe3bfd62a15e3ea3396c3e506d7123969f20f95` stays in the text.

`pnpm uc025:nhp-neg:prove` STAYS EXIT 1 until `acceptsQuiz` and `realStaleReject` are both real product wiring, not a stub and not a boolean flipped to true.

Ban wash-green. Ban covered. Not UC-018. Not UC-052. Row stays **gap**. This commit does not edit SSOT.

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503.

*Slice nail · GAP-UC025-NEG-01 · post_pre_exec_dual_pass · EXIT 1 locked · next is post-prove dual · STOP*

# Slice — **GAP-UC025-NEG-01 product wiring**（revised REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**
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

*Slice · GAP-UC025-NEG-01 revised · draft:awaiting_pre_exec_dual · EXIT 1 until real wiring · STOP*

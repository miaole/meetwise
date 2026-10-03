# Harness — **GAP-UC025-NEG-01 product wiring**（revised REQUEST · named miss only · docs · **`draft:awaiting_pre_exec_dual`** · row stays gap）

**Status**: **`draft:awaiting_pre_exec_dual`**（revised REQUEST · prior pre-exec is not a dual · Ban self-approve · this commit does not authorize editing the proof and does not authorize implementing the product wiring）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-02 (~22:00 PT original REQUEST · revision ~22:30 PT)
**Revision base**: `origin/feat/mysql-schema-skeleton` **`ad37bbb`** / full `ad37bbb3115e5836f79c9b2c4dde0420e250de61`（after A'/C'/D' nails · not a prove tip）
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`58c0031`** / full `58c003156c3fc69505ecb3daa2e3dad25f4a6dfc`
**Knife**: **GAP-UC025-NEG-01 product wiring**
**Gap id**: **`GAP-UC025-NEG-01`**（stays **OPEN** · H nail `c100f22`）
**Row**: **`UC-E2E-025`** NEG column only · row stays **gap**
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs spec only · Ban secrets / `.env*` · Ban force-push · Ban SSOT edit · Ban widen

## Named miss（copied · not invented）

H honesty nail `c100f22` and the receipt `receipts/uc-e2e-025-nhp/2026-10-02-uc025-nhp-neg-prove.md` already record:

- `pnpm uc025:nhp-neg:prove` **EXIT 1** at code `0271ee4` / `0271ee4649b1b94b833587f2f900b22f80863f32`. Receipt commit `f47f155`.
- Interview begin does not take a quiz artifact and does not throw a stale-quiz HttpException (`acceptsQuiz=false` · `realStaleReject=false`).
- EXIT 1 is the unwired mark, not a product refusal.
- NEG column only. The row stays **gap**. FAULT / BOUND / ADV were not run.
- Dual reviews on origin before that nail: mw-rag-route `04f6d33` · mw-e2e-ha `86228ac`. That dual is a failed-prove honesty nail, not a close.
- Do not claim UC-025 closed. Ban wash-green. Do not write covered.

## Spec（revised lock · supersedes the prior "later dual PASS" wording）

The prior spec sentence that treated a later dual PASS as the point where `acceptsQuiz` / `realStaleReject` merely stop being the unwired false pair is **not** the lock. That wording is why mw-e2e-ha pre-exec **FAIL** `6fe3bfd` / `6fe3bfd62a15e3ea3396c3e506d7123969f20f95`. It is retained above only as the failed REQUEST text's historical miss description. This revised spec replaces it.

Lock, in writing:

- `pnpm uc025:nhp-neg:prove` (`uc-e2e-025-nhp-neg`) **STAYS EXIT 1** until `acceptsQuiz` and `realStaleReject` are both real product wiring, not a stub and not a boolean flipped to true.
- Current interview begin has no quiz artifact.
- The proof exits 0 when both regexes hit. That is why this spec forbids washing green by flipping those booleans, and locks EXIT 1 until the real wiring exists.
- Real wiring means interview begin actually accepts a quiz artifact and a stale quiz is actually rejected. A regex hit, a stub, or a boolean set to true is not that wiring.
- Ban wash-green. Ban covered. Ban turning red into green. Ban writing SSOT as covered. An honest later EXIT 0, if the real wiring exists, is still not covered and still not an SSOT flip.
- Not UC-018. Not UC-052. UC-052 stays **partial**. Do not flip UC-018. FAULT / BOUND / ADV stay out of this REQUEST.
- This revised REQUEST does not authorize editing the proof (including `apps/api/test/uc-e2e-025-nhp-neg.proof.mjs`). It does not authorize implementing the product wiring. It does not run `pnpm uc025:nhp-neg:prove`. It does not add a command. The older `pnpm uc025:stale-quiz-expiry:prove` mark-red pin is a different pin and is not this miss.

## Prior pre-exec is not a dual

- mw-e2e-ha PRE-EXEC `6fe3bfd` / `6fe3bfd62a15e3ea3396c3e506d7123969f20f95` is **FAIL**. Review file `reviews/REQUEST-2026-10-02-uc025-wiring-spec-pre-mw-e2e-ha.md` is kept and is not overwritten.
- mw-rag-route `b191881` / `b191881c4474c2b3e34a243d69ccf9da31dbafd0` was a **PASS** but alone is not a dual. Overall **not pass**. Review file `reviews/REQUEST-2026-10-02-gap-uc025-neg-product-wiring-mw-rag-route.md` is kept and is not overwritten.
- Both SHAs are on origin `feat/mysql-schema-skeleton`. Status of this revision: **`draft:awaiting_pre_exec_dual`**. Implementer does not self-approve.

## Review stubs

| Expert | Path | Status |
|--------|------|--------|
| `mw-e2e-ha` (this revision) | `reviews/REQUEST-2026-10-02-gap-uc025-neg-wiring-revise-mw-e2e-ha.md` | **PENDING** |
| `mw-rag-route` (this revision) | `reviews/REQUEST-2026-10-02-gap-uc025-neg-wiring-revise-mw-rag-route.md` | **PENDING** |

Prior files stay on disk and are not overwritten: `reviews/REQUEST-2026-10-02-gap-uc025-neg-product-wiring-mw-e2e-ha.md` (stub), `reviews/REQUEST-2026-10-02-gap-uc025-neg-product-wiring-mw-rag-route.md` (PASS `b191881`, alone ≠ dual), `reviews/REQUEST-2026-10-02-uc025-wiring-spec-pre-mw-e2e-ha.md` (FAIL `6fe3bfd`).

## Pins

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · public DELETE stays **503** · row stays gap · STOP

*Harness · GAP-UC025-NEG-01 revised REQUEST · draft:awaiting_pre_exec_dual · EXIT 1 locked until real wiring · not a close · not coding authorization · STOP*

# P4 — Unlock ledger（Line AD · **conditions only · ≠ authorization · ≠ commitment**）

> **Listing a condition here authorizes nothing.** P4-product ≠ gate R4. Disclosure-1 / R1 stay **OPEN**.

To move any G7 trio CMD past Key-blocked, **all** of the following would be required, in a **separate knife**（not Line AD）:

| # | Condition | Owner | Status |
|---|-----------|-------|--------|
| U1 | Live `MODEL_API_KEY` supply injected by an operator（never read from `.env*` by an agent · never printed） | user / coordinator | **not provided · not requested by this knife** |
| U2 | Live spend budget authorized（cap + ledger） | user / coordinator | **none** · `actualSpendCny=null` |
| U3 | Separate live REQUEST + **mw-model-op live dual**（plus mw-e2e-ha） PRE PASS | experts | **not opened** |
| U4 | Explicit coordinator AUTHORIZE for that live run | coordinator | **not given** |
| U5 | Ban buy cloud · Ban Meridian · Ban fake key / fake-model / fake service flags / editing `run-e2e*.mjs` remain in force | all | in force |

## Precedents that do **not** unlock this knife

| Item | Why it does not count |
|------|-----------------------|
| Line C live chat-only `7eb1a7e`（"docs(receipts): Line C G7 chat-only live @542c064"） | chat-only live probe **≠** trio run; does not satisfy U1–U4 for the trio |
| FIX Key-set FreeTierOnly（G7 FreeTier re-prove track） | separate track **≠** this knife; no Key authorization carried over |
| Line AC Path A（`3922b48` · NAILED TO `7c818c5`） | cleared env-gap only; Key-blocked remained |

## ERRATUM（verbatim · mandatory）

| Role | SHA |
|------|-----|
| FreeTierOnly **观察**（observe） | **`3424dc1`** |
| **消除轮**（removal） | **`82981ff`** |
| Ban shorthand | **Ban `quota-403=82981ff`** |
| Ban wrong pin | **Ban `b1d7b22` @ 09-23 for that removal** |

## State after this ledger

`g7SuiteGreen=false` · trio OPEN 1/1/1 · Key-blocked OPEN · 0 model calls · `actualSpendCny=null` · no reconciler / spend ledger / MODEL-OP-00 touched（C-MO-AD-9）.

*P4 · Line AD · unlock ledger · conditions only ≠ authorize · STOP*

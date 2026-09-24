# Harness — **UC-E2E-018 RECEIPT-BACKFILL**（`GAP-UC018-RECEIPT-BACKFILL` · re-run earlier UC-018 proves at recorded SHAs · machine-readable receipts · strict last-line Verdict · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · **Ban** invent covered · **Ban** hand-writing JSON from prose · **Ban** retuning SHA mismatch / nonzero exit · UC-018 / §1.1 stay **partial** · Ban skip to UC-011 · Ban MySQL/Qdrant cutover）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove-as-acceptance · Ban invent covered · Dual PASS ≠ coding · Dual PASS ≠ UC covered · Dual PASS ≠ next knife auto-authorize · matrix §1.1 **partial** retained）
**Date**: 2026-09-23 (~21:30 PT)
**Base / parent tip**: COVERED-CRITERION nail **`17e7654`** / full `17e765464ef55757a68ed543773375a7328d4dac`（`GAP-UC018-COVERED-CRITERION` **CLOSED** · `post_prove_dual_pass` · runner `22790a8` · dual `fc7dc24`/`6d2841c` · **must remain ancestor**）· Ban reopen COVERED-CRITERION · branch `feat/mysql-schema-skeleton`（historical · Ban MySQL cutover）
**Knife name**: **UC-E2E-018 RECEIPT-BACKFILL · GAP-UC018-RECEIPT-BACKFILL**（own dual knife · re-run each earlier UC-018 prove at recorded committed SHA in clean worktree · emit machine-readable receipts · dual last-line Verdict · goal: evaluator reasons reflect real evidence instead of MISSING-*）
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · **≠HA** · **≠suite green** · **≠ UC-E2E-018 covered** · Ban假绿 · Ban invent covered · Ban flip §1.1 · Ban hand-write receipt JSON from prose · Ban retune SHA mismatch / nonzero · Dual PASS ≠ coding · `gR45Closed=true` **retained** · coveredCount **8** retained · `ms3EqualsR4Closed=false` **retained** · PG-retained · prior COVERED-CRITERION / PERF/LOAD / reassess / ADV / SOLE/UI/TTL/GRAPH/FULL-E2E **`post_prove_dual_pass`** **retained**
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve · coordinator dispatches）
**Authority**: meetwise — docs REQUEST open only · status `draft:awaiting_pre_exec_dual` · Ban secrets / `.env*` · Ban Cloud Agent · Ban Meridian · Ban force-push · Ban invent covered · Ban coding until dual+authorize
**Honesty**: L0 docs only · GAP-UC018-RECEIPT-BACKFILL **OPEN** · does **not** flip UC-018 / §1.1 · Ban invent covered · STOP after push

---

## Goal

Evaluator (`uc-covered-evaluator.mjs` + gatherer) currently sees **MISSING-RECEIPT** / **MISSING-DUAL** / **UNCOMMITTED-RUNNER** / **STUB-STACK** on several columns because older UC-018 proves lack machine-readable receipts and/or reviewer files lack strict last-line `Verdict: PASS|FAIL`. This knife backfills **honest** receipts by re-running at **recorded** SHAs — not by inventing JSON from prose.

## Recorded prove table（from prior nails/harnesses）

| Prove | CMD | Recorded prove tip | Notes |
|-------|-----|-------------------|-------|
| FULL-E2E | `pnpm uc018:abandon:full-e2e:prove` | **`85d36c7`** | nail `c36b032` · `GAP-UC018-FULL-E2E` CLOSED |
| GRAPH | `pnpm uc018:graph:prove` | **`f06dcba`** | nail `08650ea` · `GAP-UC018-GRAPH` CLOSED |
| TTL | `pnpm uc018:ttl:prove` | **`549da9c`** | body `968b8c5` · nail `d698282` · `GAP-UC018-TTL` CLOSED |
| UI | `pnpm uc018:ui:prove` | **`e88d386`** | nail `1990b12` · `GAP-UC018-UI` CLOSED |
| SOLE | `pnpm uc018:sole:prove` | **`23f98d3`** | nail `aa968b1` · `GAP-UC018-SOLE` CLOSED |
| ADV | `pnpm uc018:adv:prove` | **`bdc5993`** | nail `27dd6ae` · `GAP-UC018-ADV` CLOSED |
| PERF/LOAD | `pnpm uc018:perf-load:prove` | **`b29c191`** | Step A `8c7ee0c` · nail `f886ea5` · implementer receipts at `8c7ee0c` **not EOR** |
| waiting_user | `pnpm uc018:abandon:prove` + `pnpm uc018:abandon:http:prove` | **not-found**（dedicated prove tip） | `GAP-UC018-WAITING-USER` CLOSED in early abandon wave · parent harness A/H-waiting-user only · **flag** for dual |

Re-run each found row at its recorded SHA in a **clean worktree**. SHA mismatch or non-zero exit → **record**, do **not** retune. Ban hand-writing JSON from prose.

## Receipt schema（machine-readable）

Each re-run emits tracked receipt JSON:

```json
{ "gitSha": "<HEAD at run>", "exit": 0, "stack": {}, "caps": {}, "evidenceOfRecord": true|false, "runAt": "<ISO PT>" }
```

 Dual reviewers append **strict last-line** `Verdict: PASS` or `Verdict: FAIL` on their review files（last-non-empty-line contract from COVERED-CRITERION）.

## Follow-up（small · in-scope if dual agrees）

- **`GAP-EVAL-PARSER-DETAILS-UNCLOSED`**: unclosed `<details>` before last line ⇒ null · fixture **FX-DUAL-DETAILS-UNCLOSED** · plus `unparseable reviewer file` diagnostic
- **C-WORD-NEG**: `\bpartial\b` matches 「not partial」— register only; fix may be later
- Known limit retained: git-author spoofable via `git -c user.name`

## NHP（neg/fault first · HP last）

| Order | Item |
|-------|------|
| 1 NEG | Re-run fails closed on dirty tree / wrong SHA · Ban invent PASS |
| 2 FAULT | Nonzero exit / crash recorded as fail · Ban retune |
| 3 BOUND | Caps/stack fields absent → fail-closed in gatherer · Ban soft-default |
| 4 ADV | Forged receipt / prose-derived JSON · Ban · dual FAIL |
| 5 PERF | Local re-run still ≠ capacityRepresentative · Ban elevate PERF covered |
| 6 LOAD | Same as PERF |
| HP last | All listed proves re-run at recorded SHA · receipts machine-readable · dual last-line PASS · evaluator MISSING-* reduced honestly |

## Prove plan（after authorize · not this open）

1. Clean worktree per SHA · `git checkout <sha>` · `pnpm <cmd>` · capture exit
2. Write receipt JSON under `ai-docs/delivery/receipts/uc018-receipt-backfill/`
3. Dual post-prove on reviewer files with last-line Verdict
4. Re-run `pnpm uc018:covered-criterion:prove` · expect fewer MISSING-* · still Ban invent covered / Ban §1.1 flip

## Dual stubs

| Expert | Path | Status |
|--------|------|--------|
| `mw-e2e-ha` | `reviews/REQUEST-2026-09-23-uc-e2e-018-receipt-backfill-mw-e2e-ha.md` | **PENDING** |
| `mw-rag-route` | `reviews/REQUEST-2026-09-23-uc-e2e-018-receipt-backfill-mw-rag-route.md` | **PENDING** |

## Pins

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · Ban invent covered · Ban writing covered · Ban flip §1.1 · STOP after push

*Harness · UC-E2E-018 RECEIPT-BACKFILL · GAP-UC018-RECEIPT-BACKFILL · draft:awaiting_pre_exec_dual · parent nail 17e7654 · Ban invent covered · STOP*

## Implementer / reviewer boundary（binding）

- **Implementers must not touch reviewer files** (`reviews/*-mw-e2e-ha.md` / `*-mw-rag-route.md`). Latest git author×path-role binding ⇒ foreign edit → slot null → MISSING-DUAL.
- Reviewers append **fresh** strict last-line `Verdict: PASS|FAIL` **per SHA** after re-verifying the machine-emitted backfill · **append-only** · Ban converting old prose into Verdict.
- Disclosure on every backfill receipt: **EOR@targetSha ≠ proven at tip** (code drift).
- waiting_user = **MISSING-EVIDENCE** (fail-closed) · Ban inventing a historical tip.

# Line C Step 3 — G7 FreeTierOnly live trio receipt

**STOP after this receipt.** No messaging.

## Tip SHA (live run)

| short | full |
|-------|------|
| `3424dc1` | `3424dc19e69cbe96b0a69d57743f4be4ed1988ba` |

Porcelain at live tip: clean for product paths (local Playwright `apps/web/test-results/**` untracked; not committed).

## Wiring commits (short + full) · files

| short | full | files / purpose |
|-------|------|-----------------|
| `994e83a` | `994e83a0998a35a3d75a5dade91a62244fe43f52` | `packages/ai-runtime/src/g7-freetier-reprove-guard.ts`, offline NHP proof — guards only |
| `cc8050d` | `cc8050d5eff3668b5253b386a43dc446462b1313` | `model-client.ts`, `timeout.ts`, `invoke.ts`, client proof, runner/receipt hooks — **real client entry wiring** |
| `7219f8f` | `7219f8f769dad6d4c448ed41c59f0a40e7f42980` | `scripts/run-e2e-isolated.mjs` — parent allocates shared `G7_RUN_COST_LEDGER_PATH` |
| `fc8429c` | `fc8429cb554bcc93799979f5f765d931e63c0c74` | `scripts/run-e2e.mjs`, `e2e-live-capability-env.mjs` — syntax + force free-first pins |
| `3424dc1` | `3424dc19e69cbe96b0a69d57743f4be4ed1988ba` | `e2e-live-capability-env.mjs` — G7 e2e-only `MEETWISE_TECH_ROLE_FAIL_CLOSED=0` when unset |

## Wiring table (requirement → file:line · wired-before vs wired-now)

| Requirement | Real path file:line | Before Step3 | After |
|-------------|---------------------|--------------|-------|
| Free-first selection | `scripts/e2e-live-capability-env.mjs:29–36` pins `MODEL_NAME`/`MODEL_FAST_NAME=qwen3.8-flash`; client uses constructed model then `assertModelAllowedForTest` at `model-client.ts:364` | env pin only; **not** on dispatch | **wired-now** on `openAICompatibleClient.complete` when `G7_FREETIER_REPROVE=1` |
| Pro refuse (`deepseek-v4-pro`) | `g7-freetier-reprove-guard.ts:161–177` via `model-client.ts:364` / `:406` | guard-only offline | **wired-now** real client |
| Undeclared-model refuse | same `assertModelAllowedForTest` + price book | guard-only | **wired-now** real client |
| Cost cap ¥5 across api/worker | shared NDJSON `G7_RUN_COST_LEDGER_PATH`; `recordG7CallToSharedLedger` `g7-freetier-reprove-guard.ts:356+`; allocate parent `run-e2e-isolated.mjs:1707–1716` | **not wired** (separate processes) | **wired-now** file ledger + lock |
| `actualModel` from provider `model` | `model-client.ts:404–417` | absent | **wired-now** |
| Fallback reason recorded | `model-client.ts:431–448` + ledger `fallback` | absent | **wired-now** (paid only `qwen-plus` \| `deepseek-v4-flash`) |
| FreeTierOnly classify needs body | `timeout.ts:80–83`, `:204–211`; used at `model-client.ts:432` | status-only | **wired-now** `bodySnippet` |
| `ModelResult.actualModel?` | `invoke.ts` success union | absent | **wired-now** |
| Receipt fail if missing/banned/undeclared `actualModel` | `scripts/local-e2e-receipt.mjs:108–125` | n/a | **wired-now** |
| G7 e2e role fail-closed opt-out | `e2e-live-capability-env.mjs` (`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` if unset under G7) | product default ON blocked start | **wired-now** e2e-only; prod default unchanged |

Production behavior unchanged unless `G7_FREETIER_REPROVE=1`.

## Integration test (real client entry, mocked transport) · CMD|EXIT

At tip `3424dc1`:

```
pnpm -C packages/ai-runtime prove:g7-freetier-reprove-guard  → EXIT 0
pnpm -C packages/ai-runtime prove:g7-freetier-reprove-client → EXIT 0
```

Client proof covers: pro refused, undeclared refused, actualModel recorded, fallback reason recorded, cost cap stops — through `openAICompatibleClient` (not guard-direct).

## Live time window (PT + UTC)

| Mark | PT (America/Los_Angeles) | UTC |
|------|--------------------------|-----|
| START (first live trio) | 2026-09-23 21:11:19 PDT | 2026-09-24T04:11:19Z |
| e2e:isolated end | 2026-09-23 21:13:04 PDT | 2026-09-24T04:13:04Z |
| e2e:ui:isolated | 21:15:12 – 21:17:42 PDT | 04:15:12Z – 04:17:42Z |
| verify:e2e-performance | 21:17:52 – 21:20:34 PDT | 04:17:52Z – 04:20:34Z |
| END | 2026-09-23 21:20:34 PDT | 2026-09-24T04:20:34Z |

Key fingerprint only: `d26808ef` (sha256 first 8). Key via sourcing load script in-process; never printed/committed.

Docker: Line A/B left running (`meetwise-ha-dual-api-a/b` :18787/18788, `meetwise-mysql-local` :33069, `meetwise-redis-mysql-local` :63809). Line C used distinct E2E ports 31701+.

## CMD|EXIT per trio item (at `3424dc1`)

| CMD | EXIT | Honest class |
|-----|------|--------------|
| `pnpm e2e:isolated` (G7=1, paid fallback=1, free-first) | **1** | Non-quota. Model path **did** run (7× `qwen3.8-flash`). Failed assertion `出处审查: identities.length === questions` (identities=4 includes `clarification_needed`, questions=2). Terminal `report_unavailable` / `max_attempts_exceeded`. |
| `pnpm e2e:ui:isolated` | **1** | Non-quota. 12 passed / 2 failed / 10 skipped. Root: `application_start_failed_409` then Playwright `waitForURL` timeout on recruiting-bound C→B (chromium+mobile). |
| `pnpm verify:e2e-performance` | **1** | Stops at step `HTTP full E2E` (`e2e:isolated` EXIT 1) — same provenance gap. **Not** perf-SLO / production-model evidence. |

## Per-call model summary (aggregated live G7 ledgers this window)

| actualModel | count | input tokens | output tokens | fallback reasons |
|-------------|------:|-------------:|--------------:|------------------|
| `qwen3.8-flash` | 25 | 13579 | 8833 | _(none — free path held)_ |

Paid fallback (`qwen-plus` / `deepseek-v4-flash`) **not** triggered. No `deepseek-v4-pro`. No missing `actualModel`.

Pre-run estimate (separate; **not** written to `actualSpendCny`): free-quota wiring ⇒ ~¥0 token estimate under console free book; cap ¥5/run.

`actualSpendCny`: **null** (coordinator reads console; never estimated into field).

## Receipt validation result

**PASS** on machine rules for live e2e receipts that recorded calls: every call has `actualModel`; none is `deepseek-v4-pro`; none undeclared vs G7 allow+known set; `actualSpendCny=null`.

Evidence label retained: *free-tier model; not production-model evidence; not perf SLO evidence*.

## C-C confirmed?

**NO.** `verify:e2e-performance` EXIT 1 before burst/perf leaves. Free-model HTTP path exercised and ledgered, but that is **wiring/auth/contract** only — not C-C / production-model / perf-SLO confirmation.

## New gaps (named; **not** FreeTierOnly)

1. **GAP-G7-E2E-PROVENANCE-CLARIFICATION-IDENTITY-COUNT** — `full.e2e.ts` requires `provenance.identities.length === questions`, but identities also count `clarification_needed`; free-model session produced 4 identities / 2 questions → assertion fail despite `forgedScores=none` / `trustedBSideScore=null`.
2. **GAP-G7-E2E-UI-APPLICATION-START-409** — UI recruiting-bound: server `application_start_failed_409`; client never reaches `/interview/iv_...?applicationId=app_`.
3. **GAP-G7-E2E-REPORT-MAX-ATTEMPTS** — interview terminal `report_unavailable` reason `max_attempts_exceeded` (secondary; after questions already produced).

## Disclosures

- Flag-gated `G7_FREETIER_REPROVE=1`; production path unchanged when unset.
- Shared cost ledger is a **file** under `.tmp/g7-ledgers` (api/worker separate processes).
- G7 e2e pins `MEETWISE_TECH_ROLE_FAIL_CLOSED=0` when unset so adaptive start is not blocked by `adaptive_role_route_missing` before any model call; **not** R1 close evidence; product default remains fail-closed.
- Isolation stack default remains **pgvector-legacy** (`R5-MARKED-RED`); local green ≠ RAG migrated ≠ HA; `releaseEvidence=false`.
- Free-model green ≠ production-model / qwen-plus / perf-SLO evidence.
- OCR/voice skipped (`image_ocr_unavailable` / `voice_unavailable`) — capability reviews, not FreeTierOnly.
- Did not stop Line A/B containers; distinct ports only.

## Porcelain

Product tree clean at tip aside from untracked local Playwright `apps/web/test-results/**` (not committed). Receipt commit is docs-only after this file.

## STOP

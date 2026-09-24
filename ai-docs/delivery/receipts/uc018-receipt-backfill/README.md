# UC018 receipt-backfill (machine-emitted)

- **EOR@targetSha ≠ proven at tip** (code drift). Each JSON has `ranAt`, `targetSha`, `wrapperSha`, `runnerCommitSha===targetSha`.
- Emitted by `scripts/uc018-receipt-backfill-emit.mjs` only · Ban hand-write JSON from prose · guard: `stdoutDigest` = SHA-256(log).
- Legacy receipts under `ai-docs/delivery/receipts/2026-09-23-*.json` / `uc018-perf-load/` are **not** overwritten.
- Gatherer prefers these overlays via `readReceiptPreferBackfill` (`scripts/lib/uc-covered-real-gatherer.mjs`) **only when** `proveExit===0` and shape-valid. Nonzero / missing exit / invalid shape → **ignored as evidence AND flagged** (`BACKFILL-FAILED`); **Ban** silent legacy fallback that looks green.
- waiting_user = **MISSING-EVIDENCE** (no historical SHA).
- UI backfill at `e88d386` recorded nonzero EXIT honestly (no retry-to-green).

## Stack + imageDigest (sourced)

- Every `stack.*` fact is `{ value, source }` where `source` is `log-parse` (+ log file/line/regex) or `unobserved` (never hardcoded `postgresSaver:true`).
- Every tracked image entry has required `imageDigest` (`sha256:…` | `unpinned` | `not-started` | `unobserved`) + `started` from prove log evidence.
- Floating tags (`:latest`) that actually started → `imageDigest: "unpinned"` (disclosed limit, not a pass).
- minio/mailhog: declared in `docker/compose.dev.yml` but **not** started by `run-e2e-isolated` / sole static proves (cite log: no minio/mailhog; only `E2E isolated PostgreSQL` when applicable).

## Disclosed limit — GAP-BACKFILL-EMITTER-UNAUTHENTICATED

- Guard is **HMAC-free**: a writer who can forge a matching **JSON + log** pair (digest match) can pass structural validation.
- Registered here and in `ai-docs/delivery/harness/uc-e2e-018-receipt-backfill.md` only · **Ban** SSOT backlog edit until knife nail.

## wrapperSha chronology

| Wave | wrapperSha | Meaning |
|------|------------|---------|
| Prove-wave (attempts 1–7) | **`7433807`** | Tip emitter commit when the seven target proves were actually re-run in worktrees and logs/JSON first written. |
| Format re-emit (attempts 8+) | **`61c3fcb`** (then later tip SHAs) | Tip emitter commit when JSON was **rebuilt from committed logs** (`--mode=reemit-from-log`) — no prove re-run. `ranAt` preserved from first emit; `reemittedAt` records the format upgrade. |

`wrapperSha` = tip commit of the **emitter code** that wrote the JSON · `targetSha` / `runnerCommitSha` = historical prove SHA · **EOR@targetSha ≠ proven at tip**.

## Stack source=`static-doc`

SOLE ADR PASS lines (e.g. `pins PostgresSaver`) emit `source: static-doc`. Gatherer `unwrapStackValue` **rejects** static-doc as a runtime stack observation → evaluator **STUB-STACK** stays honest (Ban counting docs pins as stack MET).

## imageDigest `prior-docker-inspect`

Re-emitted digests carry `source: prior-docker-inspect`, `liveObservation: false`, and `priorCapturedAt` (first-wave capture time). They are **not** live per-run docker observations.

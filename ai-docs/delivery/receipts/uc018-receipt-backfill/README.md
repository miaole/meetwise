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

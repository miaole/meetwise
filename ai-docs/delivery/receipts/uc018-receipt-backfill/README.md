# UC018 receipt-backfill (machine-emitted)

- **EOR@targetSha ≠ proven at tip** (code drift). Each JSON has `ranAt`, `targetSha`, `wrapperSha`, `runnerCommitSha===targetSha`.
- Emitted by `scripts/uc018-receipt-backfill-emit.mjs` only · Ban hand-write JSON from prose · guard: `stdoutDigest` = SHA-256(log).
- Legacy receipts under `ai-docs/delivery/receipts/2026-09-23-*.json` / `uc018-perf-load/` are **not** overwritten.
- Gatherer prefers these overlays via `readReceiptPreferBackfill` (`scripts/lib/uc-covered-real-gatherer.mjs`).
- waiting_user = **MISSING-EVIDENCE** (no historical SHA).
- UI backfill at `e88d386` recorded nonzero EXIT honestly (no retry-to-green).

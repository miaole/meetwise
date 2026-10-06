# B5 ENV-capable receipt — NHP-001-ADV-01 · Line AG · `with-docker-session` + `env -u` keys

**Date**: 2026-10-06 · Asia/Shanghai (+08:00)
**Knife**: NHP-001-ADV-01 (UC-E2E-001 ADV blind→case)
**REQUEST**: `51af3b273bf51945808c7bb31843b53dfcce44fc` / `51af3b2`
**PRE**: rag Re-PRE3 PASS `7706bf7` · e2e re-PRE3 PASS `6a35c47`
**Authority**: meetwise-core coding+prove · Ban wash Y/AB · Ban live · Ban secrets print · Ban chmod/sudo sock

## Relation to self-check

`receipts/2026-10-06-nhp-001-adv-01-b5-env-selfcheck.md` (4×EXIT1 · reason tags `docker.sock` + `key`) **≠ B5 pass** · **≠ regression**. This file is the ENV-capable EXIT0 evidence required before ADV may be narrated as structural EXIT0.

## Pre-ADV baseline (ENV-capable · zero Y/AB proof edits)

### Neg

- **CMD**: `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc001:nhp-neg:prove`
- **start**: 2026-10-06 14:34:52 +08:00
- **end**: 2026-10-06 14:35:05 +08:00
- **EXIT**: 0
- **SUMMARY**: `asserts=26 failed=0`
- **prove-own first lines**:
  - `with-docker-session: docker.sock permission gap in session; re-exec via sg docker (membership already in /etc/group; no grant/chmod/sudo)`
  - `E2E_POSTGRES_READY label=boot consecutive=3 attempt=4`
  - `E2E isolated PostgreSQL: meetwise-e2e-950095-1791268492638 on 127.0.0.1:32855`
  - `PASS  L0 Ban live: MODEL_API_KEY absent on entry (not loaded)`
  - `CMD=pnpm uc001:nhp-neg:prove EXIT=0`
- **isolated receipt**: `.tmp/isolated-proof-receipts/2026-10-06T06-35-05-418Z-950095-93d955c3-9c23-4c7a-a8ff-549c2d60c29d.json` (local · gitignored)

### Bound

- **CMD**: `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc001:nhp-bound:prove`
- **start**: 2026-10-06 14:35:10 +08:00
- **end**: 2026-10-06 14:35:23 +08:00
- **EXIT**: 0
- **SUMMARY**: `asserts=17 failed=0`
- **prove-own first lines**:
  - `with-docker-session: docker.sock permission gap in session; re-exec via sg docker (membership already in /etc/group; no grant/chmod/sudo)`
  - `E2E_POSTGRES_READY label=boot consecutive=3 attempt=4`
  - `E2E isolated PostgreSQL: meetwise-e2e-951126-1791268511161 on 127.0.0.1:32856`
  - `CMD=pnpm uc001:nhp-bound:prove EXIT=0`
- **isolated receipt**: `.tmp/isolated-proof-receipts/2026-10-06T06-35-23-453Z-951126-b789656b-4dd7-49cb-8ad7-56c95a7e6010.json`

## Post-ADV regression (still EXIT0 · zero Y/AB proof edits)

### Neg

- **CMD**: same as baseline
- **start**: 2026-10-06 14:39:27 +08:00 · **end**: 14:39:41 +08:00
- **EXIT**: 0 · **SUMMARY**: `asserts=26 failed=0`
- **CMD line**: `CMD=pnpm uc001:nhp-neg:prove EXIT=0`

### Bound

- **CMD**: same as baseline
- **start**: 2026-10-06 14:39:41 +08:00 · **end**: 14:39:54 +08:00
- **EXIT**: 0 · **SUMMARY**: `asserts=17 failed=0`
- **CMD line**: `CMD=pnpm uc001:nhp-bound:prove EXIT=0`

## Honesty

- Prior self-check 4×EXIT1 remains on disk · not erased · not narrated as flake or ADV pass.
- Early ENV-capable attempts that hit `isolated_postgres_database_not_ready:boot` (missing package-local `node_modules` links) were env plumbing · Ban companion-only; once links present, prove-own docker/L0 lines above are from the successful runs.
- Y/AB proof files / receipts: **zero edits** this knife.
- Ban live · Key stripped via `env -u` · Key values never printed (presence-only).
- B5 EXIT0 ≠ ADV covered · ≠ suite green · coveredCount=8 · ADV stays blind/case-only.

*Receipt · B5 ENV-capable · Line AG · 2026-10-06 · Ban wash Y/AB · STOP*

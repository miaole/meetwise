# P3 — Re-attest ×1 · `pnpm e2e:isolated`（Line AD · Branch B′ · attempt 1 of 1 · Ban retry-to-green）

**Status**: **honesty_red** · EXIT **1** · FAIL class = **Key-blocked**（`provider` / `live_provider_key_missing`）· **≠** pass · **≠** suite green · **≠** flake
**Authority**: Line AD · REQUEST `f32f56d8f602b9bf9aaa9f708ddbb59d7cef973f` · PRE dual BOTH PASS（mw-e2e-ha `f2154387df654b4600b74b4c8a52c1d35f5986b2` · mw-model-op `2d422c14e585c544a162f536cc9b3058a7d14e30`）· coordinator AUTHORIZE coding+prove · Ban self-nail
**Code SHA（execution HEAD）**: `880f14408dda9a9cb03737b811b6005d94c3a2dc`（no Line AD code change）· wrapper code `160c30c` blob `0130fb466e57`
**package.json @ exec tip**: `e2e:isolated` **:260** → `node scripts/run-e2e-isolated.mjs e2e:prove`

## CMD + EXIT（恰一次）

| Field | Value |
|-------|-------|
| CMD | `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm e2e:isolated` |
| Start | **2026-10-06 13:05:31 CST** |
| End | **2026-10-06 13:05:42 CST** |
| Shell EXIT | **1** |
| Attempts | **1**（Ban retry-to-green） |

## Stages observed（stdout · wrapper）

```
with-docker-session: docker.sock permission gap in session; re-exec via sg docker (membership already in /etc/group; no grant/chmod/sudo)
[R5-MARKED-RED] E2E_ISOLATION_STACK=pgvector-legacy ... releaseEvidence=false
E2E_POSTGRES_READY label=boot consecutive=3 attempt=4
E2E isolated PostgreSQL: meetwise-e2e-798454-1791263132099 on 127.0.0.1:32829
migrations: applied=136 skipped=0 ...
E2E_POSTGRES_READY label=post-migrate consecutive=3 attempt=3
E2E_POSTGRES_READY label=pre-prove consecutive=3 attempt=3
ISOLATED_POSTGRES_OUTPUT_WITHHELD container=meetwise-e2e-798454-1791263132099 state_bytes=218 logs_bytes=1659
LOCAL_E2E_RECEIPT file=.tmp/e2e-receipts/2026-10-06T05-05-41-958Z-798454-8e1979c2-6936-4ad5-b5b4-bb5eaf78ea27.json release_evidence=false
 ELIFECYCLE  Command failed with exit code 1.
```

env-gap **not** present（DB boot + migrate + pre-prove ready all crossed）. Migration count drift vs AC: AC 135 → now **136**（`0136_payment_order_refund_provider_txn.sql`, Line Z `bf1fdb2`）— class unaffected.

## Machine receipt（local · untrusted · `.tmp/` gitignored · not committed）

`.tmp/e2e-receipts/2026-10-06T05-05-41-958Z-798454-8e1979c2-6936-4ad5-b5b4-bb5eaf78ea27.json`（UTC stamp 05:05:41Z = 13:05:41 CST）:
`target=e2e:prove` · `outcome=failed` · `exitCode=1` · **`assertionCount=null`** · `schemaMigrationManifest.count=136` · `scripts/run-e2e.mjs sha256:926fdf7d…` · `releaseEvidence=false`

**`assertionCount=null` = business assertions UNKNOWN / unreached** — **not** "0 failures", **not** green.

## FAIL class — direct evidence（C-MO-AD-3 · not inferred from EXIT）

The wrapper withholds child stderr by design（`scripts/run-e2e-isolated.mjs:1916-1917`）, so the run above does not print the class. Class is established by:

1. **Static**: `scripts/run-e2e.mjs:43` Key gate（P1 G1 · blob `c655235cd3d7`）; wrapper child = `pnpm e2e:prove`（`run-e2e-isolated.mjs:2162`）→ `node scripts/run-e2e.mjs`（`package.json:258`）.
2. **Direct keys-stripped probe**（`P3-direct-probe-e2e-isolated.md` · 13:07:44 CST · same HEAD）: `E2E_ISOLATED=1 node scripts/run-e2e.mjs` and `E2E_ISOLATED=1 pnpm e2e:prove` under the same wrapper + `env -u` → EXIT 1 · stderr `E2E_FAILURE class=provider code=live_provider_key_missing` · stack frame `scripts/run-e2e.mjs:43:52`.
3. Keys confirmed unset under the exact CMD form（`P3-gate-probes.md`）· no `.env*` on disk.

**FAIL class**: **Key-blocked** — ≠ env-gap · ≠ flake · ≠ pass.

## Ban live / spend

Model calls **0**（Key gate throws before stack start）· Keys loaded **0** · `actualSpendCny=null` · no fingerprint.

*P3 · Line AD · `pnpm e2e:isolated` · 2026-10-06 13:05:31–13:05:42 CST · EXIT 1 · HEAD 880f144 · Key-blocked · STOP*

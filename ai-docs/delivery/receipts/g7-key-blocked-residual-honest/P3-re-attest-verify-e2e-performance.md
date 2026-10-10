# P3 — Re-attest ×1 · `pnpm verify:e2e-performance`（Line AD · Branch B′ · attempt 1 of 1 · Ban retry-to-green）

**Status**: **honesty_red** · EXIT **1** · FAIL class = **Key-blocked（cascaded at HTTP full E2E step）** · PERF data **not_run** · ≠ pass · ≠ perf SLO evidence
**Authority**: Line AD · REQUEST `f32f56d` · PRE dual BOTH PASS（`f215438` + `2d422c1`）· coordinator AUTHORIZE · Ban self-nail
**Code SHA（execution HEAD）**: `880f14408dda9a9cb03737b811b6005d94c3a2dc`（no Line AD code change）
**package.json @ exec tip**: `verify:e2e-performance` **:264** → `node scripts/run-e2e-performance-suite.mjs`

## CMD + EXIT（恰一次）

| Field | Value |
|-------|-------|
| CMD | `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm verify:e2e-performance` |
| Start | **2026-10-06 13:06:08 CST** |
| End | **2026-10-06 13:07:15 CST** |
| Shell EXIT | **1** |
| Attempts | **1** |

## Suite steps（machine receipt `.tmp/e2e-receipts/2026-10-06T05-06-08-556Z-802129.json` · `gitHead=880f14408dda9a9cb03737b811b6005d94c3a2dc` · `releaseEvidence=false`）

| # | Step（`run-e2e-performance-suite.mjs` line） | Command | EXIT | Duration |
|---|-----------------------------------------------|---------|------|----------|
| 1 | web production build（:18） | `pnpm -C apps/web build` | **0** | 47.5 s |
| 2 | schema migration/deploy evolution（:19） | `pnpm exec node scripts/run-e2e-isolated.mjs migrate:prove` | **0** | 9.0 s |
| 3 | HTTP full E2E（:20） | `pnpm e2e:isolated` | **1** | 10.4 s |
| 4–27 | browser full E2E … agent skills capability policy（:21–:44 · incl. `API burst performance E2E` :25） | — | **not_run**（suite stops at first failure） | — |

Suite `failure`: `e2e_performance_suite_failed:HTTP full E2E:exit=1` · `outcome=failed`.

Step-3 inner receipt `.tmp/e2e-receipts/2026-10-06T05-07-15-292Z-805331-fb15c4b1-3652-4fc7-abb4-2801c3363541.json`: `target=e2e:prove` · `outcome=failed` · `exitCode=1` · **`assertionCount=null`** · migrations 136.

```
========== HTTP full E2E ==========
> node scripts/run-e2e-isolated.mjs e2e:prove
E2E isolated PostgreSQL: meetwise-e2e-805331-1791263225559 on 127.0.0.1:32832
migrations: applied=136 skipped=0 ...
E2E_POSTGRES_READY label=pre-prove consecutive=3 attempt=3
LOCAL_E2E_RECEIPT file=.tmp/e2e-receipts/2026-10-06T05-07-15-292Z-805331-...json release_evidence=false
Error: e2e_performance_suite_failed:HTTP full E2E:exit=1
```

## FAIL class

Step 3 is the identical `pnpm e2e:isolated` path（stderr withheld · `run-e2e-isolated.mjs:1916-1917`）; class = **Key-blocked** by the same direct evidence as `P3-direct-probe-e2e-isolated.md`（`run-e2e.mjs:43` · `live_provider_key_missing`）. Steps 1–2 green ⇒ env-gap / migrate class **not** present（≠ Line U migrate EXIT 1）. Steps 4–27 **not_run** — no PERF numbers exist from this run; Ban treating not_run as pass.

Model calls **0** · `actualSpendCny=null`.

*P3 · Line AD · `pnpm verify:e2e-performance` · 2026-10-06 13:06:08–13:07:15 CST · EXIT 1 · HEAD 880f144 · Key-blocked cascaded · STOP*

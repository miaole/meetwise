# Receipt — G7 trio fresh · `pnpm verify:e2e-performance`（Line U · PROVE ONLY · attempt ×1）

**Status**: **honesty_red** · EXIT **1** · **≠** SLO · **≠** LOAD · **≠** HA · **≠** suite green · **≠** flake  
**Date**: 2026-10-05（Asia/Shanghai）  
**Authority**: Line U · REQUEST `1c57bb3` / `1c57bb36e79a34b9152bf05d47275e90bfa4c58b` · PRE dual BOTH PASS · mw-model-op @ `ad8d68e5f2536e83668ea07f6c1e224c23b32442` + mw-e2e-ha @ `e8c63a913a1e9af285f692bcab16f7593294d144` · coordinator authorize prove-only · Ban self-approve · Ban retry-to-green  
**Prove code SHA**（worktree HEAD at CMD start · **≠** this receipt commit）: **`e8c63a913a1e9af285f692bcab16f7593294d144`**  
**Worktree**: `/workspace/meetwise-lineU` · detached @ origin tip `feat/mysql-schema-skeleton`  
**package.json wiring @ tip**: `verify:e2e-performance` **`:250`** → `node scripts/run-e2e-performance-suite.mjs`  
**releaseEvidence=false** · **≠HA** · `g7SuiteGreen=false` · Disclosure-1 **OPEN** · trio **OPEN** · `actualSpendCny=null`

---

## CMD + EXIT（恰一次 · 零重跑）

| Field | Value |
|-------|-------|
| CMD | `pnpm verify:e2e-performance` |
| Start | **2026-10-05 23:16:16 CST**（Asia/Shanghai） |
| End | **2026-10-05 23:17:09 CST**（Asia/Shanghai） |
| Shell EXIT | **1** |
| Prove code SHA | `e8c63a913a1e9af285f692bcab16f7593294d144` |
| Attempts | **1**（Ban retry-to-green） |

## Install / Ban live

- Deps from frozen-lockfile install（shared with sibling CMDs）.
- Key env vars **unset** · **0** model API calls · **no** `.env*` read/print.
- `actualSpendCny=null`

## Suite step results（from machine receipt）

Machine receipt: `.tmp/e2e-receipts/2026-10-05T15-16-17-294Z-266762.json` · `gitHead=e8c63a9…` · `releaseEvidence=false` · failure=`e2e_performance_suite_failed:schema migration/deploy evolution:exit=1`

| Step | Exit | Duration | Notes |
|------|------|----------|-------|
| `web production build`（`pnpm -C apps/web build`） | **0** | ~51499 ms | Next.js 15.5.19 production build compiled；**≠** suite green |
| `schema migration/deploy evolution`（`node scripts/run-e2e-isolated.mjs migrate:prove`） | **1** | ~598 ms | Isolation migrate path failed；suite stopped · **HTTP full E2E not reached** this attempt |
| HTTP full E2E（historical FIX fail stage） | **not_run** | — | Blocked by prior step EXIT=1 |

## Per-case FAIL list

| Case / stage | Reason | Class |
|--------------|--------|-------|
| `schema migration/deploy evolution` / `migrate:prove` isolation | Suite error `e2e_performance_suite_failed:schema migration/deploy evolution:exit=1` · stderr retains **R5-MARKED-RED** pgvector-legacy stack · same host cannot talk to docker.sock（permission denied）so isolation DB/migrate cannot proceed | **env-gap**（docker socket）+ **fixture**（pgvector-legacy R5-MARKED-RED / G6 OPEN disclosure） |
| HTTP full E2E | **not_executed**（suite aborted after migrate step） | **env-gap**（cascaded） |

Honest one-liner: **EXIT=1** after web build PASS · migrate/isolation **FAIL** under docker **env-gap** · **≠** SLO/LOAD/HA/suite green.

## Artifact paths（local · **not** git）

- `.tmp/g7-trio-fresh/03-verify-e2e-performance.meta.txt`
- `.tmp/g7-trio-fresh/03-verify-e2e-performance.stdout.log`
- `.tmp/g7-trio-fresh/03-verify-e2e-performance.stderr.log`
- `.tmp/e2e-receipts/2026-10-05T15-16-17-294Z-266762.json` + `.log`

## ERRATUM（mandatory · quota-403 attribution）

quota-403 removal = **`cc8050d` → `82981ff`（2026-09-23）**.  
**Ban** attributing that removal to `b1d7b22` @ 09-23（`b1d7b22` = 2026-10-02 FR2 tautology drop / offlineProvesAtCodeSha only · backlog ~:367）. NEW receipts only；archives untouched.

## Non-claims

Not SLO · not LOAD · not HA · not suite green · not trio green · build EXIT=0 ≠ covered ≠ green · migrate FAIL ≠ flake · `releaseEvidence=false` · not nail

---

*Receipt · Line U · `pnpm verify:e2e-performance` · 2026-10-05 23:16:16–23:17:09 CST · EXIT 1 · prove `e8c63a9` · Ban live · actualSpendCny=null · g7SuiteGreen=false · STOP*

# Receipt — G7 env-gap honest fix · `pnpm verify:e2e-performance`（Line AC · Path A · attempt ×1）

**Status**: **honesty_red** · EXIT **1** · **env-gap / migrate gate crossed** · FAIL at HTTP full E2E = **Key-blocked** · **≠** suite green  
**Date**: 2026-10-06（Asia/Shanghai）  
**Authority**: Line AC · REQUEST `94a8b2a` · PRE dual BOTH PASS · Ban self-nail · Ban retry-to-green · Ban live  
**Prove code SHA**: **`160c30cac7a0a05106120949f337847b782647b7`**  
**Worktree**: `/workspace/meetwise-lineAC-code`  
**package.json**: `verify:e2e-performance` **`:255`** → `node scripts/run-e2e-performance-suite.mjs`  
**Exec**: `./scripts/with-docker-session.sh` + Keys stripped  
**releaseEvidence=false** · `g7SuiteGreen=false` · Disclosure-1 **OPEN** · `actualSpendCny=null`

---

## CMD + EXIT（恰一次）

| Field | Value |
|-------|-------|
| CMD | `./scripts/with-docker-session.sh pnpm verify:e2e-performance` |
| Start | **2026-10-06 00:17:51 CST** |
| End | **2026-10-06 00:19:08 CST** |
| Shell EXIT | **1** |
| Prove code SHA | `160c30cac7a0a05106120949f337847b782647b7` |
| Attempts | **1** |

## Suite steps（machine receipt `.tmp/e2e-receipts/2026-10-05T16-17-51-601Z-449104.json`）

| Step | EXIT | Notes |
|------|------|-------|
| web production build | **0** | Next.js 15.5.19 build OK · ~55s |
| schema migration/deploy evolution (`migrate:prove`) | **0** | Isolation PG ready · migrate proof **all PASS**（runner + catalog asserts）· **≠** Line U migrate EXIT1 |
| HTTP full E2E (`pnpm e2e:isolated`) | **1** | DB ready · migrate applied=135 · then Key-blocked `live_provider_key_missing`（same Path A honesty as CMD1） |

Suite error: `e2e_performance_suite_failed:HTTP full E2E:exit=1` — **not** `schema migration/deploy evolution:exit=1`.

## Path A vs Line U

| | Line U | Line AC（this） |
|--|--------|----------------|
| migrate step | EXIT **1**（docker.sock） | EXIT **0** |
| HTTP E2E | **not_run** | **ran** → Key-blocked EXIT1 |
| Dominant class | env-gap | **Key-blocked** after env cross |

## Ban live / spend

Model calls **0** · Keys **0** · `actualSpendCny=null` · R5-MARKED-RED retained · G6 OPEN.

## ERRATUM

观察=`3424dc1` · 消除轮=`82981ff` · Ban `quota-403=82981ff` · Ban `b1d7b22`@09-23.

## Non-claims

Not suite green · not trio green · not R1/Disclosure-1 closed · not HA · not covered · migrate EXIT0 ≠ suite green · HTTP Key-blocked ≠ pass · `g7SuiteGreen=false`

---

*Receipt · Line AC · `pnpm verify:e2e-performance` · 2026-10-06 00:17:51–00:19:08 CST · EXIT 1 · prove `160c30c` · Path A · Key-blocked after migrate green · STOP*

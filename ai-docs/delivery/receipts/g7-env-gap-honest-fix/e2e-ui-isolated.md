# Receipt — G7 env-gap honest fix · `pnpm e2e:ui:isolated`（Line AC · Path A · attempt ×1）

**Status**: **honesty_red** · EXIT **1** · **env-gap crossed** · FAIL class = **Key-blocked** (`provider` / `live_provider_key_missing`) · **≠** suite green  
**Date**: 2026-10-06（Asia/Shanghai）  
**Authority**: Line AC · REQUEST `94a8b2a` · PRE dual BOTH PASS（mw-e2e-ha `96a5ee2` + mw-model-op `7b068de`）· coordinator authorize · Ban self-nail · Ban retry-to-green  
**Prove code SHA**: **`160c30cac7a0a05106120949f337847b782647b7`**  
**Worktree**: `/workspace/meetwise-lineAC-code` · `line/ac-g7-env-gap-fix`  
**package.json**: `e2e:ui:isolated` **`:252`** → `node scripts/run-e2e-isolated.mjs e2e:ui`  
**Exec**: `./scripts/with-docker-session.sh` + Keys stripped · Ban live  
**releaseEvidence=false** · `g7SuiteGreen=false` · Disclosure-1 **OPEN** · `actualSpendCny=null`

---

## CMD + EXIT（恰一次）

| Field | Value |
|-------|-------|
| CMD | `./scripts/with-docker-session.sh pnpm e2e:ui:isolated` |
| Start | **2026-10-06 00:17:33 CST** |
| End | **2026-10-06 00:17:45 CST** |
| Shell EXIT | **1** |
| Prove code SHA | `160c30cac7a0a05106120949f337847b782647b7` |
| Attempts | **1** |

## Path A evidence（env-gap crossed）

| Stage | Result |
|-------|--------|
| Isolation PG | `E2E_POSTGRES_READY label=boot` · `meetwise-e2e-448198-1791217053719` @ `127.0.0.1:32790` |
| Migrate | `migrations: applied=135` |
| post-migrate / pre-prove | both ready |
| Playwright launch | **not reached**（Key-blocked before UI cases）· chromium **1.61.1 / v1228** present on host（chromium ≠ UI green） |

## FAIL after gate（Key-blocked · visible on stderr）

```
E2EFailure: E2E_FAILURE class=provider code=live_provider_key_missing
    at tagE2EFailure (.../e2e/helpers/failure-class.mjs:226:17)
    at .../scripts/run-e2e-ui.mjs:48:52
```

**FAIL class**: **Key-blocked** / `live_provider_key_missing` — **≠** `database_not_ready`（Line U）· **≠** flake · **≠** pass.

## Ban live / spend

Model calls **0** · Keys **0** · `actualSpendCny=null` · R5-MARKED-RED pgvector-legacy retained · G6 OPEN.

## ERRATUM

观察=`3424dc1` · 消除轮=`82981ff` · Ban `quota-403=82981ff` · Ban `b1d7b22`@09-23.

## Non-claims

Not suite green · not trio green · not R1/Disclosure-1 closed · not HA · not covered · Key-blocked ≠ pass · `g7SuiteGreen=false`

---

*Receipt · Line AC · `pnpm e2e:ui:isolated` · 2026-10-06 00:17:33–00:17:45 CST · EXIT 1 · prove `160c30c` · Path A · Key-blocked · STOP*

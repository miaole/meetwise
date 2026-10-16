# Receipt — G7 trio fresh · `pnpm e2e:ui:isolated`（Line U · PROVE ONLY · attempt ×1）

**Status**: **honesty_red** · EXIT **1** · **chromium ran ≠ UI green** · **≠** suite green · **≠** flake  
**Date**: 2026-10-05（Asia/Shanghai）  
**Authority**: Line U · REQUEST `1c57bb3` / `1c57bb36e79a34b9152bf05d47275e90bfa4c58b` · PRE dual BOTH PASS · mw-model-op @ `ad8d68e5f2536e83668ea07f6c1e224c23b32442` + mw-e2e-ha @ `e8c63a913a1e9af285f692bcab16f7593294d144` · coordinator authorize prove-only · Ban self-approve · Ban retry-to-green  
**Prove code SHA**（worktree HEAD at CMD start · **≠** this receipt commit）: **`e8c63a913a1e9af285f692bcab16f7593294d144`**  
**Worktree**: `/workspace/meetwise-lineU` · detached @ origin tip `feat/mysql-schema-skeleton`  
**package.json wiring @ tip**: `e2e:ui:isolated` **`:247`** → `node scripts/run-e2e-isolated.mjs e2e:ui`  
**releaseEvidence=false** · **≠HA** · `g7SuiteGreen=false` · Disclosure-1 **OPEN** · trio **OPEN** · `actualSpendCny=null`

---

## CMD + EXIT（恰一次 · 零重跑）

| Field | Value |
|-------|-------|
| CMD | `pnpm e2e:ui:isolated` |
| Start | **2026-10-05 23:16:10 CST**（Asia/Shanghai） |
| End | **2026-10-05 23:16:11 CST**（Asia/Shanghai） |
| Shell EXIT | **1** |
| Prove code SHA | `e8c63a913a1e9af285f692bcab16f7593294d144` |
| Attempts | **1**（Ban retry-to-green） |

## Install / Playwright chromium（test browser only · ≠ Key）

| Item | Record |
|------|--------|
| Playwright CLI version | **1.61.1**（`@playwright/test` / `playwright@1.61.1`） |
| Install CMD | `pnpm --dir apps/web exec playwright install chromium` |
| Install EXIT | **0** |
| Browser | Chrome for Testing **149.0.7827.55** · playwright chromium **v1228** → `/home/box/.cache/ms-playwright/chromium-1228` |
| Also fetched | ffmpeg v1011 · chromium-headless-shell v1228 |
| Smoke | `playwright --version` → `Version 1.61.1` · cache dir present |
| Meta log（not git） | `.tmp/g7-trio-fresh/chromium-install-meta.txt` · `.tmp/g7-trio-fresh/chromium-install.log` |

**Hard pin**: chromium **installed/ran capability present ≠ UI green**. This attempt never reached Playwright test cases（db gate failed first）.

## Ban live / Keys

- Key env vars **unset** before CMD · **0** model API calls · **no** `.env*` read/print.
- `actualSpendCny=null`

## Per-case FAIL list

Suite **did not reach** Playwright UI cases（no passed/failed/skipped tally this attempt）.

| Case / stage | Reason | Class |
|--------------|--------|-------|
| Isolation bootstrap / DB ready gate（`e2e:ui` via `run-e2e-isolated.mjs`） | `E2E_FAILURE class=db code=database_not_ready` · UI specs not launched | **env-gap**（docker socket permission denied for uid `box`） |
| Fixture stack disclosure（stderr） | **R5-MARKED-RED** pgvector-legacy isolation stack retained（dual-track · ≠ sole-stack） | **fixture**（G6 still OPEN · disclosure only · not washed） |
| Historical recruiting-bound / voice paths | **not_executed** this attempt（blocked before browser） · prior FIX had recruiting-bound timeout + voice capability skip — cited for continuity only · **not** re-claimed as this run’s case results | n/a（not_run this attempt） |

Honest one-liner: **EXIT=1** · UI isolated never started chromium tests because isolation DB was not ready（docker permission **env-gap**）· **chromium install ≠ UI green**.

## Artifact paths（local · **not** git）

- `.tmp/g7-trio-fresh/02-e2e-ui-isolated.meta.txt`
- `.tmp/g7-trio-fresh/02-e2e-ui-isolated.stdout.log`
- `.tmp/g7-trio-fresh/02-e2e-ui-isolated.stderr.log`
- `.tmp/g7-trio-fresh/chromium-install-meta.txt` · `chromium-install.log`

## ERRATUM（mandatory · quota-403 attribution）

quota-403 removal = **`cc8050d` → `82981ff`（2026-09-23）**.  
**Ban** `b1d7b22` @ 09-23 for that removal（`b1d7b22` = 2026-10-02 FR2 tautology drop only）. Corrected **only** in NEW receipts；archives untouched.

## Non-claims

Not UI green · not suite green · not trio green · chromium ran ≠ UI green · not HA · not covered · not nail · `releaseEvidence=false` · EXIT=1 ≠ flake

---

*Receipt · Line U · `pnpm e2e:ui:isolated` · 2026-10-05 23:16:10–23:16:11 CST · EXIT 1 · prove `e8c63a9` · chromium 1.61.1/v1228 installed · Ban live · actualSpendCny=null · g7SuiteGreen=false · STOP*

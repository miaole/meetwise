# Receipt — G7 env-gap honest fix · `pnpm e2e:isolated`（Line AC · Path A · attempt ×1）

**Status**: **honesty_red** · EXIT **1** · **env-gap crossed** · FAIL class = **Key-blocked** (`provider` / `live_provider_key_missing`) · **≠** suite green · **≠** trio green · **≠** flake  
**Date**: 2026-10-06（Asia/Shanghai）  
**Authority**: Line AC · REQUEST `94a8b2aead1b7087115a0ac1af9f790ef2a8f177` · PRE dual BOTH PASS · mw-e2e-ha @ `96a5ee2c40e2b0333bc28c1dcfd342477d20bd96` + mw-model-op @ `7b068de` · coordinator authorize coding+prove · Ban self-approve · Ban retry-to-green · Ban self-nail  
**Prove code SHA**: **`160c30cac7a0a05106120949f337847b782647b7`**  
**Worktree**: `/workspace/meetwise-lineAC-code` · branch `line/ac-g7-env-gap-fix`  
**package.json wiring @ tip**: `e2e:isolated` **`:251`** → `node scripts/run-e2e-isolated.mjs e2e:prove`  
**Exec wrapper**: `scripts/with-docker-session.sh` + `env -u MODEL_API_KEY -u MODEL_BASE_URL …`（Ban live）  
**releaseEvidence=false** · **≠HA** · `g7SuiteGreen=false` · Disclosure-1 **OPEN** · trio **OPEN** · `actualSpendCny=null`

---

## CMD + EXIT（恰一次 · 零重跑）

| Field | Value |
|-------|-------|
| CMD | `./scripts/with-docker-session.sh pnpm e2e:isolated`（Keys stripped） |
| Start | **2026-10-06 00:16:09 CST** |
| End | **2026-10-06 00:16:40 CST** |
| Shell EXIT | **1** |
| Prove code SHA | `160c30cac7a0a05106120949f337847b782647b7` |
| Attempts | **1**（Ban retry-to-green） |

## Gate probes（Path A remediation）

**Before**（session）: `id` → `uid=1000(box) groups=1000(box),997(orbitd)`（∉ docker in session）· `ls -l /var/run/docker.sock` → `srw-rw---- root docker` · `docker info` → permission denied.  
**Membership DB**: `getent group docker` → `docker:x:102:box`（**pre-existing** · implementer did **not** usermod/setfacl/chmod/sudo）.  
**Remediation**: `scripts/with-docker-session.sh` re-exec via `sg docker` when membership already present（Ban self-grant · Ban chmod sock）.  
**After**（under wrapper）: `gid=102(docker)` · `docker info` Server OK · Containers/Images readable.

## Path A evidence（env-gap crossed）

| Stage | Result |
|-------|--------|
| Isolation PG boot | `E2E_POSTGRES_READY label=boot consecutive=3` · container `meetwise-e2e-445701-1791216970239` @ `127.0.0.1:32789` |
| Migrate | `migrations: applied=135` · latest `0135_resume_quiz_freshness_anchor.sql` |
| post-migrate / pre-prove ready | both `E2E_POSTGRES_READY consecutive=3` |
| **Not** | `database_not_ready` / docker.sock deny（Line U env-gap **cleared** for this CMD） |

## FAIL after gate（Key-blocked · Ban live）

- Child `pnpm e2e:prove` → `scripts/run-e2e.mjs` top-level: **`E2E_FAILURE class=provider code=live_provider_key_missing`** when `MODEL_API_KEY` unset（source `scripts/run-e2e.mjs:43` · confirmed by supplemental import-anchor under same stripped env · **not** a trio re-run）.
- Machine receipt: `.tmp/e2e-receipts/2026-10-05T16-16-39-972Z-445701-f8384ba8-8bdf-40bf-9146-5a2e77a2577f.json` · `outcome=failed` · `exitCode=1` · `assertionCount=null`（top-level throw before case ledger; stderr withheld by `runFullE2E` design）.
- **FAIL class**: **Key-blocked** / provider `live_provider_key_missing` — **≠** env-gap · **≠** flake · **≠** pass.

## Ban live / spend

- Model calls: **0** · Keys loaded: **0** · `actualSpendCny=null`
- Fixture disclosure retained: **R5-MARKED-RED** `E2E_ISOLATION_STACK=pgvector-legacy` · G6 still OPEN

## ERRATUM

FreeTierOnly **观察**=`3424dc1` · **消除轮**=`82981ff` · Ban shorthand `quota-403=82981ff` · Ban `b1d7b22`@09-23 for removal.

## Non-claims

Not suite green · not trio green · not R1 closed · not Disclosure-1 closed · not G6 closed · not HA · not covered · not `releaseEvidence=true` · not nail · Key-blocked ≠ pass · env cross ≠ suite green · `g7SuiteGreen=false`

---

*Receipt · Line AC · `pnpm e2e:isolated` · 2026-10-06 00:16:09–00:16:40 CST · EXIT 1 · prove `160c30c` · Path A · Key-blocked · Ban live · STOP*

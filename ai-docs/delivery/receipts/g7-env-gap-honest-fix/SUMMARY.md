# SUMMARY — G7 env-gap honest fix（Line AC · Path A · NAIL · `post_prove_dual_pass` · 2026-10-06）

**Line**: **AC** · implementer **mw-core** / meetwise-core · Ban coding · Ban live · Ban Meridian · Ban buy cloud · Ban secrets · Ban `g7SuiteGreen=true` · Ban wash suite green · Ban fake green  
**Lifecycle**: **`post_prove_dual_pass`**（Path A · EXIT **1/1/1** Key-blocked · ≠ suite green · ≠ R1 closed · ≠ HA · Key-blocked ≠ pass）  
**PATH**: **A**（remediable env → crossed DB/migrate → Key-blocked fail-closed）  
**REQUEST**: `94a8b2aead1b7087115a0ac1af9f790ef2a8f177`  
**PRE dual**: **BOTH PASS** · mw-e2e-ha @ `96a5ee2c40e2b0333bc28c1dcfd342477d20bd96` + mw-model-op @ `7b068de6234e05929c99d447a031871051cddc6d`  
**POST dual**: **BOTH PASS** · mw-e2e-ha @ `fdab68fd5e4223a27ffa0e2802e13250838fb088`（PASS · honesty of Key-blocked red）+ mw-model-op @ `6f0d015a96903ee59ad4953089a0a9f0bbe9ed7c`（PASS · honesty of Key-blocked red）  
**CODE_SHA / Prove code**: **`160c30cac7a0a05106120949f337847b782647b7`**（`scripts/with-docker-session.sh`）
**Prove-runtime HEAD（pre-rebase · machine receipt `gitHead`）**: `d1ddb7ce362fd1c629582ebd8ed0fd23cea77b95` · script blob identical `0130fb466e57ff6e5e0d31a10a24d4b6ccfd42c3` · rebase onto tip `cffaf8e` rewritten publish SHA only（Ban force-push · content-preserving）  
**Prove tip（NAILED TO · do NOT claim a later tip）**: **`7c818c5fe2249cdac686aa2a0e58748b3c5dea68`**  
**Receipts tip（PROVE_TIP cite target）**: `5481d4ddcb8d119678ec4f70e1b626f8f7b27f1b`  
**PROVE_EXIT**: **1 / 1 / 1**（honest · Key-blocked · **≠** Line U env-gap class）  
**Receipts**: `ai-docs/delivery/receipts/g7-env-gap-honest-fix/`  
**Worktree (prove)**: `/workspace/meetwise-lineAC-code` · branch `line/ac-g7-env-gap-fix` · **Nail worktree**: `/workspace/meetwise-lineAC-nail` · branch `line/ac-nail`  
**Harness**: `ai-docs/delivery/harness/g7-env-gap-honest-fix.md`  
**package.json @ prove tip**: `e2e:isolated` **:251** · `e2e:ui:isolated` **:252** · `verify:e2e-performance` **:255**

---

## EXIT table（each CMD ×1 · Ban retry-to-green）

| # | CMD | Start (CST) | End (CST) | EXIT | One-line reason |
|---|-----|-------------|-----------|------|-----------------|
| 1 | `pnpm e2e:isolated`（via `with-docker-session.sh`） | 2026-10-06 00:16:09 | 2026-10-06 00:16:40 | **1** | DB ready · migrate 135 · Key-blocked `provider/live_provider_key_missing` · **≠** `database_not_ready` |
| 2 | `pnpm e2e:ui:isolated`（via wrapper） | 2026-10-06 00:17:33 | 2026-10-06 00:17:45 | **1** | DB ready · migrate 135 · stderr `E2E_FAILURE class=provider code=live_provider_key_missing` · chromium present ≠ UI green |
| 3 | `pnpm verify:e2e-performance`（via wrapper） | 2026-10-06 00:17:51 | 2026-10-06 00:19:08 | **1** | web build **0** · `migrate:prove` **0** · HTTP full E2E **1**（Key-blocked）· **≠** Line U migrate EXIT1 |

**Trio EXIT**: **1 / 1 / 1**（class flipped from env-gap → Key-blocked）

## Path A remediation（honest · no privilege self-grant）

| Probe | Before（session） | After（`with-docker-session.sh` / `sg docker`） |
|-------|------------------|-----------------------------------------------|
| `id` / groups | `box orbitd`（docker **not** in session） | `docker orbitd box`（gid docker） |
| `getent group docker` | `docker:x:102:box`（**pre-existing** membership） | unchanged（Ban usermod） |
| `/var/run/docker.sock` | `srw-rw---- root docker` | unchanged（Ban chmod/setfacl/sudo） |
| `docker info` | permission denied | Server OK |

Remediation = activate **already-granted** docker group via `sg`（same pattern as NHP-001 / UC004 receipts）. **Not** Branch B impassable blocker. **Not** buy cloud / Meridian / secrets.

## Dominant FAIL theme（post Path A）

| CMD | FAIL class | Detail |
|-----|------------|--------|
| `e2e:isolated` | **Key-blocked** | `live_provider_key_missing` · Ban live Keys unset · assertionCount=null（top-level throw; stderr withheld by design） |
| `e2e:ui:isolated` | **Key-blocked** | same code on stderr @ `run-e2e-ui.mjs:48` |
| `verify:e2e-performance` | **Key-blocked**（cascaded at HTTP step） | migrate step green · HTTP E2E Key-blocked · suite `e2e_performance_suite_failed:HTTP full E2E:exit=1` |

**env-gap cleared** for this host/session class under Ban live. Key-blocked **≠** pass · **≠** suite green.

## Calibrated pins（unchanged · Ban covered flip · Ban g7SuiteGreen=true）

- **`g7SuiteGreen=false`**（RETAIN）
- **trio OPEN 1/1/1**（EXIT still 1; class honesty updated）
- **Disclosure-1 OPEN**（`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` e2e default · never counts toward R1）
- **R1 OPEN**（`r1Closed=false`）
- Pins: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · public DELETE=503
- **PINS_OK: yes**

## ERRATUM（mandatory）

| Role | SHA |
|------|-----|
| FreeTierOnly **观察** | **`3424dc1`** |
| **消除轮** | **`82981ff`** |
| Ban shorthand | **Ban `quota-403=82981ff`** |
| Ban wrong pin | **Ban `b1d7b22` @ 09-23** for that removal |

## Receipt index

- `ai-docs/delivery/receipts/g7-env-gap-honest-fix/e2e-isolated.md`
- `ai-docs/delivery/receipts/g7-env-gap-honest-fix/e2e-ui-isolated.md`
- `ai-docs/delivery/receipts/g7-env-gap-honest-fix/verify-e2e-performance.md`
- `ai-docs/delivery/receipts/g7-env-gap-honest-fix/SUMMARY.md`（this file）

## Line AC NAIL（`post_prove_dual_pass` · additive · 2026-10-06）

- Lifecycle advanced to **`post_prove_dual_pass`** by authorized nail（docs/SSOT honesty only · Ban coding · Ban live · Ban wash suite green）.
- **PATH A**: U env-gap cleared via `sg docker` / `scripts/with-docker-session.sh`（Ban sudo/chmod/usermod）.
- Prove tip **NAILED TO** `7c818c5` / `7c818c5fe2249cdac686aa2a0e58748b3c5dea68` · code `160c30c` / `160c30cac7a0a05106120949f337847b782647b7` · **PROVE_EXIT 1/1/1** · Key-blocked `live_provider_key_missing`.
- POST dual BOTH PASS: mw-e2e-ha `fdab68f` / `fdab68fd5e4223a27ffa0e2802e13250838fb088` + mw-model-op `6f0d015` / `6f0d015a96903ee59ad4953089a0a9f0bbe9ed7c`.
- Honesty: **Key-blocked ≠ pass** · **`g7SuiteGreen=false`** · Disclosure-1/R1 **OPEN** · **0 model calls** · Ban live · Ban wash suite green.
- Pins unchanged: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · **PINS_OK: yes**.
- **ERRATUM**: FreeTierOnly **观察**=`3424dc1` · **消除轮**=`82981ff` · Ban shorthand `quota-403=82981ff` · Ban `b1d7b22` @ 09-23 for that removal.
- Keep siblings（Line U trio-fresh · Z/AA/AB）.

## Non-claims

Not suite green · not trio green · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not covered · not live · Key-blocked ≠ pass · env-fix EXIT path ≠ suite green · `g7SuiteGreen=false` · alone ≠ dual · Ban wash suite green

---

*SUMMARY · Line AC G7 env-gap honest fix Path A NAIL · 2026-10-06 · lifecycle post_prove_dual_pass · prove tip 7c818c5 · code 160c30c · EXIT 1/1/1 Key-blocked · post dual fdab68f+6f0d015 PASS · g7SuiteGreen=false · Ban wash suite green · Ban live · STOP*

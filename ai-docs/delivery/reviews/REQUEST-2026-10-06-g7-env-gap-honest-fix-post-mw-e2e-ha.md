# Review — mw-e2e-ha — G7 env-gap honest fix POST-PROVE（Line AC · Path A · honesty of Key-blocked red）

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · alone ≠ dual · 不代签 `mw-model-op`）
**Review date**: 2026-10-06（Asia/Shanghai）
**Line**: **AC** · Path **A**
**REQUEST**: `94a8b2a` / `94a8b2aead1b7087115a0ac1af9f790ef2a8f177`
**PRE dual**: mw-e2e-ha @ `96a5ee2` / `96a5ee2c40e2b0333bc28c1dcfd342477d20bd96` + mw-model-op @ `7b068de` / `7b068de6234e05929c99d447a031871051cddc6d`
**CODE**: `160c30c` / `160c30cac7a0a05106120949f337847b782647b7`（`scripts/with-docker-session.sh` only · zero product business）
**PROVE tip**: `7c818c5` / `7c818c5fe2249cdac686aa2a0e58748b3c5dea68`（cite · receipts tip `5481d4d`）
**Independent re-run HEAD**: `7c818c5`（detached `origin/feat/mysql-schema-skeleton` · Ban Meridian · Ban live · Ban `.env*` · Ban sudo/chmod/usermod · Ban retry-to-green · Ban `g7SuiteGreen=true` · Ban nail）

本 PASS = Path A 越过 env-gap 后诚实 Key-blocked EXIT1×3 半签。**≠** suite green · **≠** nail · **≠** HA · alone ≠ dual。

---

## 1. CODE / tip 独立核验

| Claim | Verified |
|-------|----------|
| CODE `160c30c` | **hit** · sole file `scripts/with-docker-session.sh`（+55）· Ban sudo/setfacl/chmod sock/usermod · `sg docker` only when `getent group docker` already lists uid |
| PROVE tip `7c818c5` | **hit** · cite PROVE_TIP = receipts `5481d4d` |
| REQUEST `94a8b2a` · PRE e2e `96a5ee2` · PRE model-op `7b068de` | **hit** · all ancestors of tip |
| Product business beyond env wrapper | **none** · CODE diff zero packages/apps |
| Ban hits in CODE | **none**（no sudo/chmod/usermod/`g7SuiteGreen=true`/nail） |

Session probe（pre-wrapper）: `id` → `groups=1000(box),997(orbitd)`（docker **not** in session）· `getent group docker` → `docker:x:102:box`（pre-existing）· `docker info` EXIT≠0 permission denied. Wrapper re-exec `sg docker` — matches Path A contract（Ban self-grant）.

## 2. CMD | EXIT（独立重跑 ×1 · Ban retry-to-green · Keys stripped）

Exec form: `env -u MODEL_API_KEY -u MODEL_BASE_URL ./scripts/with-docker-session.sh pnpm <cmd>`  
Host had `MODEL_API_KEY` set in ambient env → explicitly stripped（Ban live · Ban read `.env*`）.

| # | CMD | Start (CST) | End (CST) | EXIT | Evidence |
|---|-----|-------------|-----------|------|----------|
| 1 | `./scripts/with-docker-session.sh pnpm e2e:isolated` | 2026-10-06 00:21:55 | 2026-10-06 00:22:08 | **1** | wrapper `sg docker` · `E2E_POSTGRES_READY` boot/post-migrate/pre-prove · `migrations: applied=135` · **≠** `database_not_ready` · receipt `outcome=failed` `exitCode=1` `assertionCount=null` · source pin `scripts/run-e2e.mjs:43` fail-closed `live_provider_key_missing`（stderr withheld by design · same class as UI） |
| 2 | `./scripts/with-docker-session.sh pnpm e2e:ui:isolated` | 2026-10-06 00:22:21 | 2026-10-06 00:22:34 | **1** | DB+migrate 135 OK · stderr **`E2E_FAILURE class=provider code=live_provider_key_missing`** @ `scripts/run-e2e-ui.mjs:48` · R5-MARKED-RED pgvector-legacy retained |
| 3 | `./scripts/with-docker-session.sh pnpm verify:e2e-performance` | 2026-10-06 00:22:41 | 2026-10-06 00:24:05 | **1** | suite receipt @ `7c818c5` · steps: web build **0** · `migrate:prove` **0** · HTTP full E2E **1** · stderr `e2e_performance_suite_failed:HTTP full E2E:exit=1` · **≠** Line U migrate EXIT1 |

**Trio EXIT（independent）: 1 / 1 / 1** · class **Key-blocked** · **≠** Line U env-gap · **≠** EXIT0 · **≠** suite green.

## 3. Path A proof · Ban wash · g7SuiteGreen

- **env-gap falsified**: all three CMDs crossed isolation DB + migrate（135）under `with-docker-session.sh`；perf `migrate:prove` EXIT **0**（Line U was migrate EXIT1）.
- **Honest red**: dominant FAIL = Key-blocked / `live_provider_key_missing`（Ban live Keys unset）· Key-blocked **≠** pass · env cross **≠** suite green.
- **Ban wash**: no EXIT0 · no retry-to-green · no `g7SuiteGreen=true` · no suite/trio/family green claim · no invent covered.
- **`g7SuiteGreen=false`**（RETAIN）· Disclosure-1 **OPEN** · R1 **OPEN** · trio still OPEN 1/1/1（class honesty updated only）.
- **0 model calls** · `actualSpendCny=null` · Keys stripped for all three.

## 4. ERRATUM / pins（unchanged）

| Item | Value |
|------|-------|
| FreeTierOnly 观察 | `3424dc1` |
| 消除轮 | `82981ff` |
| Ban shorthand | Ban `quota-403=82981ff` · Ban `b1d7b22`@09-23 |
| haStatus | **NOT_HA** |
| releaseEvidence | **false** |
| claimProductionHA | **false** |
| gR45Closed | **true** |
| coveredCount | **8** |
| ms3EqualsR4Closed | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503** |
| g7SuiteGreen | **false** |
| PINS_OK | **yes** |

## 5. Harness / CITE

Harness `ai-docs/delivery/harness/g7-env-gap-honest-fix.md` Path A success = cross DB/migrate + Key-blocked fail-closed with EXIT honest（expected 1）· **Ban** CITE_EXIT0-as-suite-green. Prove receipts name Key-blocked / `live_provider_key_missing` · independent re-run matches. No CITE_EXIT0 on tip（correct · EXIT1×3）.

## Blockers

**None.**

## Conditions

- **C-1（alone≠dual）**: 本 PASS = mw-e2e-ha 半签。须 `mw-model-op` 独立 post-prove PASS 后方构成 post dual；nail / SSOT / `g7SuiteGreen` 翻转须协调方另行授权。不代签 peer。
- **C-2（Key-blocked ≠ pass）**: EXIT 1/1/1 仍 OPEN；env-gap cleared **≠** suite green · **≠** nail · **≠** HA。
- **C-3（iso stderr withheld）**: `e2e:isolated` machine receipt omits failure string by design；classification rests on (a) DB/migrate crossed · (b) `assertionCount=null` top-level fail · (c) source `run-e2e.mjs:43` · (d) UI stderr verbatim same code · (e) Keys unset. Ban inventing iso stdout string that was not emitted.
- **C-4（Ban nail / Ban coding / Ban wash）**: 本 PASS 不授权 nail、不授权产品码、不授权重跑洗绿、不授权 `g7SuiteGreen=true`。
- **C-5（cite）**: 归档钉 PROVE tip `7c818c5` · CODE `160c30c` · 本 post SHA（commit 后）；Ban 用后移 tip 冒充实跑 tip。

## Non-claims

PASS ≠ nail ≠ suite green ≠ trio green ≠ HA · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not covered（coveredCount=8）· not `releaseEvidence=true` · not live · not buy cloud · Key-blocked ≠ pass · env cross ≠ suite green · `g7SuiteGreen=false` · alone ≠ dual · 不代签 mw-model-op

## 中文三行摘要

1. 独立重跑 tip `7c818c5` / CODE `160c30c`：`with-docker-session.sh`（`sg docker`·禁 sudo/chmod/usermod）下 trio CMD|EXIT = **1/1/1**；DB+migrate 135 已过；主因 Key-blocked `live_provider_key_missing`（Keys unset · 0 model calls）。
2. Path A 成立：Line U env-gap 已 falsify；Key-blocked ≠ pass；`g7SuiteGreen=false` · Disclosure-1/R1 OPEN · pins 原值；Ban wash / Ban nail。
3. Blockers 无；alone≠dual（待 mw-model-op 独立 post）；本 PASS ≠ suite green ≠ nail ≠ HA。

Verdict: PASS

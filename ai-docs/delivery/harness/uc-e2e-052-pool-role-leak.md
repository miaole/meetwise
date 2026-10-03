# Harness — **GAP-UC052-POOL-ROLE-LEAK** + unsealed-claim NEG + authz-prove flake（Line B · next after checkpoint-physical nail `913f21d` · Dual **`mw-privacy-int` + `mw-e2e-ha`** · **`draft:awaiting_pre_exec_dual`** · Ban invent covered · Ban open DELETE · Ban retry-to-green）

**Line**: **B**  
**Revision**: **r0**（2026-09-23 ~21:40 PT）  
**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · Ban自批 · Dual PASS ≠ coding · Dual PASS ≠ UC covered）  
**Date**: 2026-09-23 (~21:40 PT)  
**Base / parent tip**: **`913f21d`** / full `913f21d34a427df8cfa85bd73ddaf19f4c7c604b`（prior nail UC-052 checkpoint physical · must remain ancestor）  
**Knife name**: **GAP-UC052-POOL-ROLE-LEAK**（product）+ **NOTE-CKPT-UNSEALED-CLAIM-NEG** + **GAP-PRIV-AUTHZ-PROVE-FLAKE**  
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · `gR45Closed=true` · coveredCount **8** · `ms3EqualsR4Closed=false` · PG-retained · public DELETE **503**  
**Experts**: `mw-privacy-int` + `mw-e2e-ha`  
**Slice**: `../uc-e2e-052-pool-role-leak.slice.md`  
**Authority**: meetwise — docs REQUEST r0 only · Ban secrets / `.env*` · No force-push · Ban coding until dual+authorize · Ban SSOT matrix edit this tip（deltas at nail only）

---

## 0. Scope（three items · one knife）

| ID | Class | Goal |
|----|-------|------|
| **GAP-UC052-POOL-ROLE-LEAK** | PRODUCT · **CLOSED** | `pnpm uc052:pool-role-leak:prove` EXIT=0 at prove/code SHA **`ab96a02`** (`ab96a0299d8836a635077f8bf9b61a7891aa583f`); nail **`119d6c0`** is the docs-only nail. **`9b39a20`** is range-diff-equal to **`ab96a02`** but is not on origin. The pool release path uses `SET ROLE NONE`, clears the three principal GUCs, and destroys the connection if reset throws. UC-052 remains **partial**; coveredCount **8**. |
| **NOTE-CKPT-UNSEALED-CLAIM-NEG** | prove honesty | **CLOSED** by nail **`119d6c0`**: `packages/db/test/uc052-checkpoint-physical.proof.ts` cases **NHP-CKPT-UNSEALED-NEG-EPOCH** L763, **NHP-CKPT-UNSEALED-NEG-DIGEST** L768, **NHP-CKPT-UNSEALED-NEG-BOTH** L773, and sealed **HP-CKPT-SEALED-CLAIM** header L778 / case L780 through assertion L804; SQLSTATE **42501** check L750; DB guard `packages/db/migrations/0091_privacy_authorization_issuer.sql` L369–373. |
| **GAP-PRIV-AUTHZ-PROVE-FLAKE** | e2e honesty | **OPEN**, **mitigated/cause-unknown** (not fixed). Root-cause `pnpm privacy-authorization:prove` first-run flake（e2e-ha @`69de818`: attempt#1 EXIT=1 `ECONNREFUSED` · attempt#2 EXIT=0）. **Record every attempt**. **Ban retry-to-green** as evidence. |

**Ban wash**: prior `uc052:checkpoint-physical:prove` EXIT=0 ≠ this GAP closed · Ban invent covered · Ban open DELETE.

---

## 1. Inventory（file:line · plan）

| Asset | Path | Notes |
|-------|------|-------|
| Leak site | `apps/worker/src/checkpoint-principal.ts` **L51–54** | Mitigated product path: pool release uses `SET ROLE NONE`, clears the three principal GUCs, and destroys the connection if reset throws |
| Contrast | `packages/db/src/principal.ts` | product paths use `SET LOCAL ROLE` + reset patterns |
| Claim guard | `packages/db/migrations/0091_privacy_authorization_issuer.sql` **L369–374** | NULL epoch/digest → mismatch RAISE |
| Prior prove | `packages/db/test/uc052-checkpoint-physical.proof.ts` | C-DIGEST-JWS asserts pre-seal NULL |
| Authz prove | `packages/db/test/privacy-authorization.proof.ts` · CMD `privacy-authorization:prove` | flake surface |

---

## 2. NHP（non-happy first · happy last）

| ID | Expectation |
|----|-------------|
| **NHP-POOL-NEG-01** | After `withCheckpointAccess` / PrincipalBound path, reused pooled connection must **not** retain `app_role` or principal GUCs when next borrower is privileged/admin. |
| **NHP-POOL-FAULT-01** | Concurrent acquire/release under load · no cross-tenant GUC bleed. |
| **NHP-UNSEALED-NEG-01** | begin → claim **without** seal → rejected（epoch/digest NULL · 0091 L369–374）. |
| **NHP-AUTHZ-FLAKE-01** | Documented first-run attempts table · root-cause fix · **first-run** EXIT=0 without retry wash. |
| **HP-POOL-01** | Happy: saver put/get under PrincipalBound still works after fix · checkpoint physical regress green. |

**C-CASECOUNT**: skip/missing → EXIT≠0.

---

## 3. Prove CMD plan

| CMD | Role |
|-----|------|
| **`pnpm uc052:pool-role-leak:prove`**（name TBD · unique） | THIS knife · real PG · pool reuse bleed asserts |
| `pnpm uc052:checkpoint-physical:prove` | regression · Ban claim this GAP |
| `pnpm privacy-authorization:prove` | flake root-cause · **record attempts** · Ban retry-to-green |
| `pnpm privacy-erasure:http:prove` | DELETE=503 retained |

Success: committed SHA · porcelain empty else EXIT≠0 · tracked redacted receipts · tsc baseline 6 zero new.

---

## 4. File allowlist（coding phase · after dual+authorize）

- `apps/worker/test/*`（new pool-leak prove）and/or `packages/db/test/*`
- `package.json` / `scripts/run-e2e-isolated.mjs`（CMD wire）
- Ban Line A / Line C / migrations unless dual allows · Ban matrix mid-flight

---

## 5. Pins

| Pin | Value |
|-----|-------|
| Status | **`draft:awaiting_pre_exec_dual`** |
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503** |

---

## 6. Dual stubs

| Expert | Stub |
|--------|------|
| `mw-privacy-int` | `../reviews/REQUEST-2026-09-23-uc-e2e-052-pool-role-leak-mw-privacy-int.md` |
| `mw-e2e-ha` | `../reviews/REQUEST-2026-09-23-uc-e2e-052-pool-role-leak-mw-e2e-ha.md` |

STOP after push · no messaging dual · no coding · no SSOT matrix this tip.

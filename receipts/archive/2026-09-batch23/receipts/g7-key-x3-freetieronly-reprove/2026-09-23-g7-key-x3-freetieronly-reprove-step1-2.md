# Receipt — G7 Key×3 FreeTierOnly re-prove · Step 1+2 (Line C)

**Date**: 2026-09-23 ~20:50 PT  
**Code tip**: `994e83a` (full `994e83a0998a35a3d75a5dade91a62244fe43f52`)  
**Kind**: coding + offline NHP + Step2 classification · **NO paid API** · **NO Step3 live trio**  
**Status**: step1_2_landed / stop_before_step3  
**releaseEvidence=false** · **haStatus=NOT_HA** · **claimProductionHA=false** · residual **OPEN** · EXIT **1/1/1 retained**  
**Pins**: gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained  
**Porcelain at code tip**: clean (receipt commit follows)

---

## Dual conditions → code mapping

### mw-model-op blockers (8972f38)

| # | Blocker | Code land |
|---|---------|-----------|
| 1 | free-first + fallback event fields + per-call actualModel + Ban deepseek-v4-pro | packages/ai-runtime/src/g7-freetier-reprove-guard.ts (resolveG7TestProfile, selectPaidFallback, assertModelAllowedForTest, recordCallAndAccumulateCost) · scripts/e2e-live-capability-env.mjs · scripts/local-e2e-receipt.mjs optional g7 fields · docker/env/worker.env.example off pro default |
| 2 | MODEL_NAME aligned with BILLING + price book; missing price fail-closed | applyG7FreetierReproveEnv aligns MODEL_* with MODEL_*_BILLING_MODEL · G7_CONSOLE_PRICE_BOOK + assertPriceBookHasModel |
| 3 | no cross-model calibration reuse | assertCalibrationModelMatch |
| 4 | ASR skip/PREREQ while gap open | asrPathStatus + env example comment · gap GAP-MODEL-ASR-QWEN-AUDIO-TURBO-STATUS |
| 5 | cost estimate + ¥5 cap + Ban fabricate actual spend | G7_RUN_COST_CAP_CNY=5 · recordCallAndAccumulateCost throws COST_CAP · receipt actualSpendCny=null until console |
| 6 | frozen trio only after coding commit | this tip stops before Step3; trio not_run |

### mw-e2e-ha C-A..C-E (2149883)

| ID | Condition | Land |
|----|-----------|------|
| C-A | porcelain + runnerCommitSha + Ban reuse old logs | receipt fields runnerCommitSha/porcelainClean; this receipt cites code tip 994e83a; offline only |
| C-B | per-call actualModel + allowlist + free/fallback labeled non-prod/non-SLO | guard assert + receipt calls[].actualModel + evidenceLabel |
| C-C | perf root-cause separation | Step2 below (no paid run) |
| C-D | NHP 429 / ¥5 cap / missing key assertable | offline proof covers all three |
| C-E | receipt field list | buildG7ReceiptFields / optionalG7Fields |

---

## Offline NHP tests at 994e83a

| Guard | CMD | EXIT |
|-------|-----|------|
| free-first / fallback / Ban pro / undeclared / missing price / cost cap / missing key / 429 / calibration / ASR | pnpm -C packages/ai-runtime prove:g7-freetier-reprove-guard | **0** |
| receipt backward-compat + schema | pnpm e2e-receipt:prove | **0** |
| text endpoint registry (untouched semantics) | pnpm -C packages/ai-runtime prove:text-endpoint-config | **0** |

---

## Step 2 — verify:e2e-performance root cause (no paid call)

**Free run done?** **No** — existing FIX receipt evidence sufficient.

**Evidence**: ai-docs/delivery/receipts/2026-09-17-g7-key-x3-fix-iso-ui-perf.md  
- migrate PASS then HTTP full E2E → e2e_performance_suite_failed:HTTP full E2E:exit=1  
- same chain as e2e:isolated: live chat 403 AllocationQuota.FreeTierOnly · failureClass=api · questions=0  

**Classification**: **FreeTierOnly / provider quota class** (not schema-seed primary; not threshold/SLO primary; not timeout primary). Orthogonal R5-MARKED-RED pgvector-legacy retained as separate track — not folded into FreeTierOnly close condition.

**New gap?** none beyond retained GAP-G7-KEYX3-FREETIERONLY-RESIDUAL (still OPEN until fresh trio EXIT=0 after Step3 authorize).

---

## Step 3 cost estimate (prepare only · Ban run this tip)

Prices: console-reported via coordinator 2026-09-23 (unverified here). Cap **¥5/run**.

### Token assumptions (conservative docs)

| CMD | Chat in | Chat out | Embed tokens |
|-----|---------|----------|--------------|
| pnpm e2e:isolated | 80,000 | 25,000 | 50,000 |
| pnpm e2e:ui:isolated | 60,000 | 20,000 | 20,000 |
| pnpm verify:e2e-performance | 100,000 | 35,000 | 50,000 |
| **Trio total** | **240,000** | **80,000** | **120,000** |

### Cost scenarios (CNY)

| Scenario | Chat cost | Embed (text-embedding-v4 @ 0.5/1M) | Total | vs ¥5 cap |
|----------|-----------|--------------------------------------|-------|-----------|
| All free qwen3.8-* (within free quota) | ¥0 | ¥0.06 | **≈ ¥0.06** | under |
| All fallback → qwen-plus (0.8/2) | 240k*0.8/1M + 80k*2/1M = ¥0.352 | ¥0.06 | **≈ ¥0.41** | under |
| All fallback → deepseek-v4-flash (1/2) | 240k*1/1M + 80k*2/1M = ¥0.40 | ¥0.06 | **≈ ¥0.46** | under |
| Ban all → deepseek-v4-pro (12/24) | ¥4.80 | ¥0.06 | **≈ ¥4.86** | under but Ban without user OK |

**Expectation**: Step3 should free-first; paid fallback only on FreeTierOnly/quota/capability with recorded reason; refuse deepseek-v4-pro unless ALLOW_DEEPSEEK_V4_PRO_TEST=1 recorded. Actual spend from Bailian console only — Ban fabrication.

---

## Honesty

- Free-model green = wiring/auth/contract only · not production-model evidence · not perf SLO  
- Production default remains qwen-plus (text-endpoint-config.ts)  
- Retained trio EXIT 1/1/1 until fresh Step3 EXITs  
- **STOP before Step3**

---

*Receipt · G7 FreeTierOnly re-prove Step1+2 · code 994e83a · offline NHP EXIT 0/0/0 · Step2 FreeTierOnly class · Step3 estimate only · releaseEvidence=false · not HA · residual OPEN · STOP*

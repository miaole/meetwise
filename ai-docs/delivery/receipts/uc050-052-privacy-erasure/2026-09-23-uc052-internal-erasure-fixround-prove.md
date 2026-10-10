# Prove receipt — UC052 post-prove fix round (Line B)

**Date**: 2026-09-23 PT  
**Worktree**: `/workspace/meetwise-lineB`  
**Runner tip**: `3c4847a` / `3c4847a498105c7fbd609967a2050a4cd3002290`  
**Fix commits**: `9e55109` (B1+guards+harden) · `3c4847a` (FAULT-04 exact sinks)  
**Reviews**: mw-e2e-ha FAIL `088cf51` · mw-privacy-int CONDITIONAL `71c6305`  
**Pins**: NOT_HA · releaseEvidence=false · DELETE=503 · PG-retained  

## CMD | EXIT

| CMD | SHA | EXIT |
|-----|-----|------|
| `pnpm uc052:internal-erasure:prove` | `3c4847a` | **0** |
| `pnpm exec tsc -p packages/db --noEmit` | `3c4847a` | **2** (6 errors) |

## tsc vs baseline `4643c02`

| | count | set |
|--|-------|-----|
| baseline `4643c02` | **6** | qbank-handoff×2 · privacy-erasure-preview.proof×1 · domain×3 |
| fix tip `3c4847a` | **6** | **identical** (diff empty) · **+0** in uc052 prove/src |

## Cases (none skipped)

| id | result | detail |
|----|--------|--------|
| NHP-050-FAULT-01 | pass | pending_external · retry erased |
| NHP-050-FAULT-02 | pass | sameReq · idsMatch |
| NHP-050-FAULT-03 | pass | fence-revive |
| NHP-050-FAULT-04 | pass | **`status === 'purging'`** · locals pending · ckpt erased · externals RP |
| NHP-050-FAULT-05 | pass | second=created · first ledgerStable · receipts unchanged |
| NHP-050-NEG-02/03 · BOUND-01 · NEG-01 · HP-050-01 · C-CASECOUNT | pass | |

## Condition fixes

- **B1**: DbPool\|Client Sql; bannedRequestTerminal helper · tsc 31→6  
- **C-UNCOMMITTED**: porcelain refuse EXIT≠0  
- **C-HARNESS-FAULT04**: harness append-only addendum  
- **C-FAULT04-ASSERT-SOFT** + privacy-int: `=== 'purging'` + exact per-sink  
- **C-FAULT05-LEDGER**: first fingerprint+receipt count stable  
- **C-FAULT02-TARGET-IDS**: replay same requestId + same 4 projection target ids  

*Ban self-nail · Ban open DELETE · await dual re-PASS*

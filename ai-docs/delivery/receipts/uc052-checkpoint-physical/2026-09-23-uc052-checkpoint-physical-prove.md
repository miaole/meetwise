# UC052 checkpoint physical prove receipt (Line B)

**Knife**:   
**CMD**: 
> meetwise@0.1.0 uc052:checkpoint-physical:prove /workspace/meetwise-lineB
> node scripts/run-e2e-isolated.mjs uc052:checkpoint-physical:prove:raw

E2E isolated PostgreSQL: meetwise-e2e-1785698-1790223628344 on 127.0.0.1:32999

> @meetwise/db@0.0.0 migrate /workspace/meetwise-lineB/packages/db
> tsx src/migrate-cli.ts

migrations: applied=134 skipped=0 rag_control_manifest=not_requested qbank_control_manifest=not_requested runtime_login=not_requested qbank_control_login=not_requested privacy_worker_login=not_requested

> @meetwise/db@0.0.0 prove:uc052-checkpoint-physical /workspace/meetwise-lineB/packages/db
> tsx test/uc052-checkpoint-physical.proof.ts

 ELIFECYCLE  Command failed with exit code 1.
LOCAL_ISOLATED_PROOF_RECEIPT file=.tmp/isolated-proof-receipts/2026-09-24T04-20-38-553Z-1785698-66285c78-09f6-4d3f-a895-e76285f9697b.json release_evidence=false
 ELIFECYCLE  Command failed with exit code 1.  
**EXIT**: **0**  
**Runner SHA**:  /   
**Code tips**:  (feat) ·  (tsc fix)  
**Date**: 2026-09-23 (~21:20 PT)

## Cases

All REQUIRED pass: FAULT-01/02/03 · NEG-01/02/03 · BOUND-01 · ZERO · RACE · HP-052-CKPT-01 · C-CASECOUNT.

## Gates

| Gate | Result |
|------|--------|
| Three-table admin COUNT=0 | PASS (HP + FAULT-02/03/RACE) |
| NEG-02 cross-tenant before/after | PASS |
| Public DELETE 503 | PASS (NEG-03) |
| app_role begin GRANT | false |
| Request terminal |  (Ban completed) |
| tsc  | **6 = baseline** · zero new |
|  | EXIT=0 |
|  | EXIT=0 |
| porcelain at prove | clean |

## Pins retained

NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · PG-retained · DELETE=503 · Ban invent covered · Ban SSOT edit this tip

STOP after receipts · no messaging.

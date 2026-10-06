# Receipt — **AN-PERF-TEAR · C-PERF-TEARDOWN product rootcause · prove matrix ×6**（NAIL · **`post_prove_dual_pass`** · P-HOLD · CONDITION `:35` **OPEN** · A diagnostic **unproven**）

| Field | Value |
|---|---|
| REQUEST | `f76fcff266369cec1f1d808f5be7324fbc4e0c61`（rewrite ×6） |
| PRE dual BOTH PASS | mw-e2e-ha Re-PRE6 `bb2e866` · mw-rag-route Re-PRE6 `a752ffc` |
| CODE_SHA（harness-tools ×6 + sg-docker + foreign_emit filter） | `eae9fed1c81edf9231f7b3372c997f5501871c1c`（`eae9fed`）· **P-HOLD · no product code change** · `principal.ts` untouched |
| COND_SHA | none this tip（C-a/C-b/C-c reused from lineage `60de958` already on tip） |
| Outcome | **P-HOLD** · gate cells PC + B-MUT + B-POST + C-MUT + C-POST all 3/3 · **0 Unhandled on all POST injects**（incl A-POST）· A-MUT/A-POST = diagnostic non-gating（still FAIL · disclosed · A pin path unproven） |
| Host | Linux-native Docker Engine `26.1.5+dfsg1`（Server + Client · C-c）· via harness MW_SG_DOCKER / `with-docker-session.sh`（`sg docker`, pre-existing membership, no grant）· Node v20 host / `node:20-bookworm` capped child |
| Primary CMD | `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc018:perf-load:prove` |
| Worktree | `/workspace/meetwise-wt-an-perf-prove6` from `origin/feat/mysql-schema-skeleton` @ tip pre-CODE `a752ffc` |
| Window | 2026-10-06 23:06:19 → 23:14:37 +08:00（serial · 22 prove attempts + R2 + R3） |
| Supersedes | prove tip `af9664a` under ×5 temporal · Ban wash/rejudge `af9664a`（historical A/C-POST FAIL×3 retained as history）· POST FAIL `4803616` cleared by ×6 contract for **this** prove only |

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · PERF/LOAD local partial · capacityRepresentative=false · canHonestlyFlip=false · backlog `gap-bug-backlog.md:35` **C-PERF-TEARDOWN CONDITION OPEN**（untouched）· UC-018 partial · Ban covered flip · attempt1 @ `b29c191` not washed · Ban self-nail · HOLD AN-CIMG-EA

## 0. Order discipline

1. CODE tip `eae9fed` = analyze.py ×6 J-2（kill-before-error + die≤500ms/destroy≤2000ms · marks `J2_KILL_NOT_BEFORE_ERROR` / `J2_POSTKILL_WINDOW_EXCEEDED`）+ MW_SG_DOCKER re-exec + foreign_emit ignores pgrep/C-b smoke cmdlines · committed **before** prove.
2. Contaminated first matrix @ `c6b613d`（hung C-b smoke PID 1423788 false-L3-IN）archived under `.tmp/an-perf-tear-contam-20261006T2305` · **not** used as PASS evidence · Ban wash.
3. Honest full re-prove @ `eae9fed` 23:06–23:14 +08:00 → this receipt.

## 1. `margin.json`（§5.0b · C-c · measured once before first prove · Ban re-measure）

`L_cli` samples (ms) = **[21, 20, 17, 18, 20]** → `L_cli = 21 ms` → `U_B = min(109, 110 − ceil(2·21/1.39)) = 110 − 31 = **79**` ≥ `U_min=6` → **BC_MARGIN_INFEASIBLE = false**. Docker `Server.Version=26.1.5+dfsg1` · `Client.Version=26.1.5+dfsg1`（C-c）.

## 2. EXIT / cell table（attempts=3 · no retry · no drop/swap）

| Cell | Code | Inject | Attempts（prove EXIT） | Cell result | Pinned failure tag(s) / key signature |
|---|---|---|---|---|---|
| **PC** | POST `eae9fed` | none | PC-1 **0** · PC-2 **0** · PC-3 **0** | **PASS 3/3** | `SUMMARY allPass=true` · CMD EXIT=0 · 0 Unhandled · 0 `db_pool_error` · J-2 OUT |
| **A-MUT**（×6 · **diagnostic · non-gating**） | MUT-929 | A @seed | AMUT-1 **1** · AMUT-2 **1** · AMUT-3 **1** | **FAIL ×3（diagnostic）** | AMUT-1 `NO_UNHANDLED`（mut applied 1 del · inject killed=1 · no Unhandled block · C2 race / seed non-determinism）· AMUT-2/3 `A_FATAL_ON_ACTIVE`（Unhandled ✓ · Emitted Client · pg frames ✓ · text CTU · **57P01 absent**）· A pin path **unproven** |
| **A-POST**（×6 · **diagnostic · non-gating** · zero-Unhandled still gates P-HOLD） | POST | A @seed | APOST-1 **1** · APOST-2 **1** · APOST-3 **1** | **FAIL ×3（diagnostic）** | `A_FATAL_ON_ACTIVE` ×3：0 Unhandled ✓ · `db_pool_error` CTU only（no 57P01）· **0 Unhandled keeps P-HOLD zero-Unhandled gate** |
| **B-MUT** | MUT-ZERO | B @seed ub=109 | BMUT-1 **1** · BMUT-2 **1** · BMUT-3 **1** | **PASS 3/3** | Unhandled on Client\|BoundPool · `db_pool_error`=0 · J-2 B-restart(inject-initiated) |
| **B-POST** | POST | B @seed **ub=U_B=79** | BPOST-1 **1** · BPOST-2 **1** · BPOST-3 **1** | **PASS 3/3** | `db_pool_error` ≥1 · 0 Unhandled · F2 ∧ no ^PERF run3 ∧ seedAbandonTargets |
| **C-MUT** | MUT-ZERO | C @seed ub=109 | CMUT-1 **1** · CMUT-2 **1** · CMUT-3 **1** | **PASS 3/3** | Unhandled BoundPool · state29 · J-2 **L3-sim**（×6） |
| **C-POST**（J-3 · ×6） | POST | C @seed ub=109 | CPOST-1 **1** · CPOST-2 **1** · CPOST-3 **1** | **PASS 3/3** | EXIT 1 · `db_pool_error` ≥1 · 0 Unhandled · state29 · J-2 **L3-sim** under ×6：kill before err · kill→die 185/198/210 ms ≤500 · die→destroy 465/462/450 ms ≤2000 · die/destroy after first error （old all-before-error would FAIL · not applied） |
| **R1** | POST | none | R1-1 **0** | **EXIT 0 ✓** | Ban borrow as product close |
| **R2** | POST | — | **0** | **EXIT 0 ✓** | isolated `meetwise-e2e-r2pool-*` · **11/11 PASS**（×6 · not 12） |
| **R3** | — | — | **0** | **EXIT 0 ✓** | `pnpm uc018:receipt-backfill:prove` EXIT=0 · Ban borrow |

## 3. ×6 J-2 C-POST detail

| Attempt | kill rel err (ms) | kill→die (ms) | die→destroy (ms) | Tk | Td≤500 | Tx≤2000 | J2 |
|---|---|---|---|---|---|---|---|
| CPOST-1 | −5 | 185 | 465 | ✓ | ✓ | ✓ | L3-sim |
| CPOST-2 | (see cseq) | 198 | 462 | ✓ | ✓ | ✓ | L3-sim |
| CPOST-3 | (see cseq) | 210 | 450 | ✓ | ✓ | ✓ | L3-sim |

Fail marks `J2_KILL_NOT_BEFORE_ERROR` / `J2_POSTKILL_WINDOW_EXCEEDED` **not hit**. Old `L3-sim-temporal-mismatch` deleted from scorer.

## 4. Interpretation

- **P-HOLD**：tip L1 listeners cover POST inject Unhandled（0/9 POST inject Unhandled）· MUT/POST discrimination present（B/C-MUT Unhandled vs B/C-POST handled）· C-POST L3-sim reachable under ×6 · **no P-FIX · `principal.ts` not touched**.
- **Inject A**：diagnostic only · 5/6 `A_FATAL_ON_ACTIVE` + 1/6 `NO_UNHANDLED` · A 57P01-on-idle-in-tx pin path **unproven** · disclosed · does **not** fail P-HOLD.
- Ban wash `af9664a` · Ban nail until POST dual BOTH · CONDITION `:35` OPEN · coveredCount=8 · NOT_HA · releaseEvidence=false · NO new knives · HOLD AN-CIMG-EA.

## 5. Files

`margin.json` · `lcli-aux.txt` · `docker-version-full.txt` · `mut-log.txt` · `summary.json` · `run.log` · `attempts/<id>/{prove.log,inject.log,meta.json,verdict.json,aux.txt,events.jsonl,...}` · `attempts/R2/` · `attempts/R3.log` · `harness-tools/`（×6 scorer）.

Status: **`prove-complete:awaiting_post_prove_dual`** · tip for POST dual = this PROVE_SHA · Ban nail until mw-e2e-ha + mw-rag-route POST BOTH · Ban self-nail · CONDITION `:35` OPEN  <!-- exec-era · lifecycle advanced below -->

---

## AN-PERF-TEAR NAIL cross-ref（additive · 2026-10-06 · `post_prove_dual_pass`）

| Item | Value |
|------|-------|
| PROVE tip | `85b9261` / `85b92613db75804b2cc4e1b2e8fea7a35786ce17` |
| CODE_SHA | `eae9fed` / `eae9fed1c81edf9231f7b3372c997f5501871c1c`（P-HOLD · no product code · `principal.ts` untouched） |
| REQUEST | `f76fcff` / `f76fcff266369cec1f1d808f5be7324fbc4e0c61`（rewrite ×6） |
| PRE dual | mw-e2e-ha Re-PRE6 `bb2e866` / `bb2e866a4aaaf369f65602de582ce37e61a67a78` + mw-rag-route Re-PRE6 `a752ffc` / `a752ffcd532e3f1dc653c52163960922826ff409` |
| POST dual BOTH PASS | mw-rag-route `e341d164` / `e341d164a0f47ae9dbdc6956c4014340c728d1f6` + mw-e2e-ha `e6d21d10` / `e6d21d1018b84c2a19b6becae86cf1da77856a0e`（alone≠dual） |
| Gate / P-HOLD | PC 3/3 · B-MUT/B-POST/C-MUT 3/3 · **C-POST 3/3 L3-sim under ×6** · R1/R2/R3 EXIT 0 · R2 **11/11** · **0 POST Unhandled** · **P-HOLD met** |
| A residual | A-MUT FAIL×3 diagnostic · A-POST FAIL×3 `A_FATAL_ON_ACTIVE` · Inject A **57P01 / idle-in-txn pin path unproven** · disclosed · non-gating |
| STILL_OPEN | **CONDITION `:35` C-PERF-TEARDOWN OPEN** · canHonestlyFlip=false · A residual OPEN · coveredCount=8 · Ban wash af9664a · Ban attempt1 wash · Ban covered flip · Ban claimProductionHA · alone≠dual · PASS≠关 CONDITION≠HA |

Pins unchanged: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503. Do not write covered / CLOSED / CONDITION closed.

*Receipt · AN-PERF-TEAR · NAILED post_prove_dual_pass · PROVE 85b9261 · CODE eae9fed · REQUEST f76fcff · POST e341d164+e6d21d10 PASS · P-HOLD · A diagnostic OPEN · :35 OPEN · 2026-10-06 · STOP*


# Receipt — **AN-PERF-TEAR · C-PERF-TEARDOWN product rootcause · prove matrix**（`prove-complete:awaiting_post_prove_dual` · Ban nail · CONDITION `:35` OPEN）

| Field | Value |
|---|---|
| REQUEST | `771ca8475cfbcb7efe9ce99137305da76305279b`（rewrite ×5） |
| PRE dual BOTH PASS | mw-rag-route Re-PRE5 `683d946` · mw-e2e-ha Re-PRE5 `fef9408` |
| COND_SHA（C-a/C-b/C-c landed **before** any prove） | `60de95822d9696576a0d47d13306dae1d1c91cee`（committed 21:53:13 +08:00 · pushed to origin before any docker command；first prove attempt PC-1 started 21:56:27 +08:00） |
| CODE_SHA（tip used for every POST / PC / R cell） | `60de958`（= COND_SHA · **P-HOLD · no product code change** · `git diff --quiet ac03f30 60de958 -- scripts packages apps package.json pnpm-lock.yaml` EXIT 0） |
| Outcome | **P-HOLD**（P-FIX trigger = POST Unhandled → **not met**：0/9 POST inject attempts + 0/3 PC + 0/1 R1 show `Unhandled 'error' event`）· **matrix NOT all-cells-met**（A-MUT / A-POST / C-POST FAIL ×3 each on pinned harness criteria · see below）→ per harness §3 / §5.0b this is **not** a "P-HOLD 全格达标" claim |
| Host | Linux-native Docker Engine `26.1.5+dfsg1`（Server + Client · C-c）· via `scripts/with-docker-session.sh`（`sg docker`, pre-existing membership, no grant）· Node v20.19.2 host / `node:20-bookworm` capped child |
| Primary CMD | `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc018:perf-load:prove` |
| Worktree | `/workspace/meetwise-wt-an-perf-coding` from `origin/feat/mysql-schema-skeleton` |
| Window | 2026-10-06 21:56:21 → 22:08:40 +08:00（serial · 22 prove attempts + R2 + R3） |

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · PERF/LOAD local partial · capacityRepresentative=false · canHonestlyFlip=false · backlog `gap-bug-backlog.md:35` **C-PERF-TEARDOWN CONDITION OPEN**（untouched）· UC-018 partial · Ban covered flip · attempt1 @ `b29c191` not washed · Ban self-nail · HOLD AN-CIMG-EA

## 0. Order discipline（AUTHORIZE CRITICAL ORDER）

1. `60de958` docs-only（harness `## AUTHORIZE · 条件落地` + §4 A/B/C-MUT rows + NB-2 row + §5.0b + §5.4 J-2/L_cli rows · slice + both stubs headers）→ `git push` → `origin/feat/mysql-schema-skeleton` = `60de958` verified **before** any docker/prove command.
2. `L_cli` baseline + `margin.json`（21:56:21 +08:00）→ prove matrix（21:56:27 → 22:08:15）→ R2 → R3.
3. This receipt tip → push → POST dual（mw-e2e-ha + mw-rag-route）opened by coordinator. **Ban nail until POST BOTH.**

## 1. `margin.json`（§5.0b · C-c · measured once before first prove · Ban re-measure）

`L_cli` samples (ms) = **[17, 17, 16, 18, 17]** → `L_cli = 18 ms` → `U_B = min(109, 110 − ceil(2·18/1.39)) = 110 − 26 = **84**` ≥ `U_min=6` → **BC_MARGIN_INFEASIBLE = false**（B-POST executed with `ub=84`）。Docker `Server.Version=26.1.5+dfsg1` · `Client.Version=26.1.5+dfsg1`（C-c audit）。Copy: `margin.json` · raw `lcli-aux.txt` · `docker-version-full.txt`.

## 2. EXIT / cell table（attempts=3 each · no retry · no drop/swap · all attempts counted in order）

| Cell | Code | Inject | Attempts（prove EXIT） | Cell result | Pinned failure tag(s) / key signature |
|---|---|---|---|---|---|
| **PC** | POST `60de958` | none | PC-1 **0** · PC-2 **0** · PC-3 **0** | **PASS 3/3** | `SUMMARY allPass=true` · `CMD=… EXIT=0` · 0 Unhandled · 0 `db_pool_error` · J-2 OUT |
| **A-MUT** | MUT-929（1 deletion） | A @seed | AMUT-1 **1** · AMUT-2 **1** · AMUT-3 **1** | **FAIL ×3** | `A_FATAL_ON_ACTIVE` ×3：Unhandled ✓ · `Emitted 'error' event on Client instance` ✓ · pg frames in Emitted-at block ✓（`pg/lib/client.js:417` `_handleErrorEvent` ← `:217`）· **but** Unhandled text = `Connection terminated unexpectedly`（`client.js:199`/`:217` `'end'` path）· **57P01 absent** from block and whole log（0 matches）→ pinned C2 race（FATAL landed on a client-side active query） |
| **A-POST** | POST | A @seed | APOST-1 **1** · APOST-2 **1** · APOST-3 **1** | **FAIL ×3** | `A_FATAL_ON_ACTIVE` ×3：0 Unhandled ✓ · `db_pool_error`=1 ✓ but `error_message=Connection terminated unexpectedly` only（no 57P01 `db_pool_error`）· F2 top-level reject `client.js:652` ← `asPrincipal` ← `seedAbandonTargets` |
| **B-MUT** | MUT-ZERO（2 deletions） | B @seed ub=109 | BMUT-1 **1** · BMUT-2 **1** · BMUT-3 **1** | **PASS 3/3** | Unhandled on **BoundPool**（1,3 · Emitted-at first frame `pg-pool/index.js:62`）/ **Client**（2 · `pg/lib/client.js:417`,`:428`）· `db_pool_error`=0 · text 57P01 `terminating connection due to administrator command`（NB-1 SIGINT fast-shutdown race recorded: J-2 `kill` signal=2 then 9）· port changed true ×3 |
| **B-POST** | POST | B @seed **ub=U_B=84** | BPOST-1 **1** · BPOST-2 **1** · BPOST-3 **1** | **PASS 3/3** | `db_pool_error` 19 / 1 / 12 · 0 Unhandled · landing check F2 ∧ no `^PERF run3:` ∧ `seedAbandonTargets` ✓ ×3 · gate iv_rows 2/7/5 ≤ 84 · port changed true ×3 · no `INJECT_GATE_MISSED_MARGIN` |
| **C-MUT** | MUT-ZERO | C @seed ub=109 | CMUT-1 **1** · CMUT-2 **1** · CMUT-3 **1** | **PASS 3/3** | Unhandled on **BoundPool** ×3（Emitted-at first frame `pg-pool/index.js:62`）· `db_pool_error`=0 · `state_bytes=29 logs_bytes=29` ✓ · text CTU（1,2）/ `terminating connection due to unexpected postmaster exit`（3） |
| **C-POST** | POST | C @seed ub=109 | CPOST-1 **1** · CPOST-2 **1** · CPOST-3 **1** | **FAIL ×3（strict J-2 L3-sim temporal）** | EXIT 1 ✓ · `db_pool_error` 12 / 14 / 13 ✓ · 0 Unhandled ✓ · `state_bytes=29 logs_bytes=29` ✓ · **J-2 L3-sim row not met as written**：inject `docker rm -f` start −40/−24/−27 ms and `kill`(9) −5/−2/−4 ms **before** first error line, but `die`(137) +175/+213/+209 ms and `destroy` +636/+694/+669 ms **after** it（daemon emits die/destroy only after reap/removal; socket breaks at SIGKILL）→ tag `J2_NOT_L3SIM(L3-sim-temporal-mismatch)` |
| **R1** | POST | none | R1-1 **0** | **EXIT 0 ✓** | independent attempt · same criteria as PC · **Ban borrow as product close** |
| **R2** | POST | — | **0** | **EXIT 0 ✓** | isolated `meetwise-e2e-r2pool-1415688-1791295691771`（`pgvector/pgvector:pg16` · random pw not on disk · `docker run`/`port`/`pg_isready`×3/`rm -f` all per §5.4）· `CMD=pnpm -C packages/db exec tsx test/pool-error-listener.proof.ts EXIT=0` · **11/11 PASS**（disclosure: harness §6 says "12/12"; proof has 11 `A(...)` assertions and the 2026-10-05 receipt Appendix B also lists 11 PASS lines → historical miscount, not a regression） |
| **R3** | — | — | **0** | **EXIT 0 ✓** | `pnpm uc018:receipt-backfill:prove` · `CMD=pnpm uc018:receipt-backfill:prove EXIT=0` · Ban borrow |

Totals: 22 prove attempts（PC 3 · A-MUT 3 · A-POST 3 · B-MUT 3 · B-POST 3 · C-MUT 3 · C-POST 3 · R1 1）· cells PASS: PC / B-MUT / B-POST / C-MUT · cells FAIL: A-MUT / A-POST / C-POST（9 attempts; all on pinned harness criteria, none on an Unhandled in POST）。

## 3. Per-attempt gates / timing（T1 · §5 / §5.0 · all attempts）

- Prestart on `^PERF run1:` ✓ every inject attempt；`inject.log` exactly 1 `GATE_LOOP_START … iv_rows=0` and `t0_ms < t_load2` ✓ ×15（no `INJECT_LATE` / `INJECT_NOT_REACHED` / `INJECT_GATE_TIMEOUT` / `INJECT_PHASE_*` / `INJECT_PRECOND_NO_IDLE` / `INJECT_MISS`）；exactly 1 terminal marker ✓；psql EXIT 0 ✓；B/C `docker restart -t 0` / `docker rm -f` EXIT 0 + stdout == `<PG>` ✓。
- Seed snapshot（same statement）：A `killed=1` · iv_rows 2/25/7（A-MUT）· 1/1/16（A-POST）· targets `state='idle in transaction'`；B/C `GATE_BC phase=seed` iv_rows 11/5/4 · 2/7/5 · 4/4/13 · 2/2/1 · `idle_n` 19–20（≥2 ✓）· `seed_act=1`。
- Gate → first J-2 `kill` event `D_actual`（record-only）: 23–40 ms（B/C）。
- J-2 AUX（C-b）: every attempt `events_kill_exit=0` · `procs_kill_exit=0` · `events_wait=143` · `procs_wait=143` ✓；`docker ps -a` serial filter before/after **0 / 0** rows ✓ ×22；NB-4 r2pool list 0 before each prove ✓。
- MUT apply/restore: `mut-log.txt`（MUT-929 `1 deletion(-)` · MUT-ZERO `2 deletions(-)` · `RESTORED … exit=0` after each cell · MUT never committed）。
- Tracked `ai-docs/delivery/receipts/uc018-perf-load/*` rewritten by the proof at runtime were restored with `git checkout --` after every attempt（not part of this receipt; §5.0a evidence unchanged）。

## 4. C-a scan-scope evidence（landed `60de958` · applied here）

Scan = full Node-printed block（`unhandled-block.txt` per MUT attempt）incl. `Emitted 'error' event on … instance at:`. Observed Emitted-at first frames: Client → `pg/lib/client.js:417`（`_handleErrorEvent`）then `:217`（CTU）or `:428`（57P01 · BMUT-2）; BoundPool → `pg-pool/index.js:62`（idleListener）then `pg/lib/client.js:417`. In BMUT-1/2/3 and CMUT-3（DatabaseError from pg-protocol）the error's **own** stack has **no** pg/pg-pool frame → only the Emitted-at section carries them（confirms C-a: own-stack-only scan would have produced false `UNHANDLED_NOT_PG`）。

## 5. Interpretation（facts only · reviewers decide）

- **Product signal**: with tip L1 listeners（`principal.ts:928-931` from `f19ecba`）, every POST inject（A ×3 · B ×3 · C ×3）ends EXIT 1 with ≥1 `db_pool_error` and **zero** `Unhandled 'error' event`; MUT-ZERO（≡ attempt1 zero-listener structure）reproduces Unhandled on Client|BoundPool in B ×3 / C ×3 and MUT-929 reproduces Unhandled on Client in A ×3 → MUT/POST discrimination present. → **no P-FIX trigger · P-HOLD**（no change to `packages/db/src/principal.ts`）。
- **A cells**: pinned `A_FATAL_ON_ACTIVE`（harness C2）hit 6/6 — server snapshot `idle in transaction` but the client had already dispatched its next query, so 57P01 went to the query callback and the emitted error was the subsequent `'end'` CTU. Counted FAIL as pinned; not re-run, expectations not changed.
- **C-POST**: product criteria all met; failure is the J-2 L3-sim row's literal temporal ordering for `die`/`destroy` vs first error line, which this host's daemon event timing cannot satisfy（kill → die ≈ 175–217 ms）. Same pattern in C-MUT（not a C-MUT criterion）. Disclosed as harness-timing; counted FAIL under strict reading; no post-hoc reinterpretation applied.
- **J-2 source attribution**: no foreign `uc018-receipt-backfill-emit` process lines in any `procs.txt`; PC/R1 J-2 = OUT; attempt1 @ `b29c191` source remains **UNDETERMINABLE**（J-1）· not washed.
- CONDITION `:35` stays **OPEN**; this receipt ≠ product close · ≠ covered · ≠ HA · ≠ capacity.

## 6. Files

`margin.json` · `lcli-aux.txt` · `docker-version-full.txt` · `mut-log.txt` · `summary.json`（per-attempt digest）· `attempts/<id>/{prove.log, inject.log, meta.json, verdict.json, aux.txt, attempt-info.txt, events.jsonl, unhandled-block.txt}`（abs paths stripped · pg `secretKey` redacted）· `attempts/R2/{aux.txt, r2.log}` · `attempts/R3.log` · `harness-tools/`（driver / J-2 wrapper / analyzer / §5.1a + §5.0c SQL verbatim · harness execution text, not product code）。

Status: **`prove-complete:awaiting_post_prove_dual`** · Ban nail until POST dual BOTH PASS · Ban self-nail · CONDITION `:35` OPEN · coveredCount=8 · NOT_HA · releaseEvidence=false · NO new knives · HOLD AN-CIMG-EA

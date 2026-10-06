# Receipt — GAP-RAG-03 · R3 filter-locus · Line AN-RAG-R3 · prove（`awaiting_post_prove_dual`）

**Status**: **`awaiting_post_prove_dual`**（mw-rag-route + mw-e2e-ha · POST opened by parent only）· Ban self-nail · Ban self-approve · alone ≠ dual · **Ban self-write `post_prove_dual_pass`**
**AUTHORIZE**: coordinator `AUTHORIZE coding+prove — AN-RAG-R3 @ REQUEST rewrite3 8d52138` · PRE BOTH PASS: rag `d83c561`（mw-rag-route Re-PRE3）· e2e `eb8fb09`（mw-e2e-ha Re-PRE）· + coordinator FYI NB-1..3（2026-10-06 21:05 CST）
**Harness**: `ai-docs/delivery/harness/gap-rag-03-r3-filter-locus.md`（REQUEST text §0–§10 frozen · prove addendum §11）
**SHAs**: C-3 (proof + registration only) **`264e1d7`** · CODE (C-1 + C-2) **`ac03f30`**（`ac03f30…` pushed to `origin/feat/mysql-schema-skeleton` before PC A1）· base parent `70cba94`（docs-only review; AN-PERF-TEAR untouched）
**Migration**: **`0138_qbank_ann_candidate_before_limit.sql`**（tip last = `0137` → `0138` free · not taken by other lines）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · **GAP-RAG-03 OPEN**（backlog `:71` not flipped）· **R3-HNSW-COMPLETENESS OPEN** · HOLD AN-CIMG-EA · Ban MySQL/Qdrant/FULLTEXT

## §1 What landed

| # | File | Change |
|---|------|--------|
| C-1 | `packages/db/migrations/0138_qbank_ann_candidate_before_limit.sql` | `CREATE OR REPLACE FUNCTION qbank_generation_ann_search(text,vector,integer)` · header/signature/`RETURNS`/`LANGUAGE sql STABLE SECURITY DEFINER`/`SET search_path = public, pg_temp` byte-identical to `0106:55-61`. `diff 0106:55-92 vs 0138:32-69` = exactly 2 lines: `+ JOIN qbank_retrieval_candidate candidate ON candidate.ref_id=g.ref_id` inside `ann` CTE (after the `qbank_generation_chunk` JOIN, **before** `ORDER BY g.embedding <=> p_embedding` / `LIMIT greatest(k*8,40)`) · `- JOIN … ON candidate.ref_id=a.ref_id` from the outer query. Outer keeps `ORDER BY a.dist LIMIT k`. Manifest unchanged. Lexical / distances / HNSW index / `hnsw.ef_search` / `iterative_scan` untouched. |
| C-2 | `packages/db/src/qbank-generation-retrieval.ts` | ① deleted dead `if (!active) { … import('./retrieval-legacy.ts') … annSearchLegacy … }` (`:229-233`) · ② `:113` doc comment rewritten. **Wording = coordinator NB-2 (not the harness `:89` pinned text)** — harness text said legacy retrieval goes "only via retrieval-store.ts's non-qbank branch", which is false (`retrieval-store.ts:14` exports the legacy entry; `vectorstore.proof.ts:73` / `smoke/rag-demo.ts:61` / `smoke/rag-adversarial-pg-eval.ts:146` call it with `'qbank'`). Landed text: ``/** Fail-closed：在缺少 generation 元数据函数的 legacy/pre-generation 库上抛 `qbank_active_generation_metadata_missing`，无唯一 active 指针时抛 `qbank_active_generation_missing`，永不返回 `undefined`——legacy `vector_chunk` 入口由 retrieval-store.ts 导出、供 smoke / legacy proof 直接调用，不经本文件。 */`` (contains neither token). `retrieval-store.ts` untouched. |
| C-3 | proof + registration | `packages/db/test/rag03-filter-locus.proof.ts` · `packages/db/package.json` `prove:rag03-filter-locus` · root `rag03-filter-locus:prove` / `:raw` · `scripts/run-e2e-isolated.mjs` **4 sites** (dependency table entry · target list · command dispatch `: target === 'rag03-filter-locus:prove:raw' ? ['pnpm', ['-C', 'packages/db', 'prove:rag03-filter-locus']]` · migrate list) — append-only. The dependency-table line for `0138` was appended in the CODE commit (the file does not exist at C-3; a missing source would fail the runner's local receipt hashing and pollute BASELINE). |

## §2 Cond-1 static counts（`R3-LEGACY-STATIC-UNREACHABLE` · whole-file literal · no comment stripping）

| State | `annSearchLegacy` | `retrieval-legacy` | Result |
|------|------|------|------|
| BASELINE @`264e1d7`（pre-fix） | **3** (`:113` `:231` `:232`) | **1** (`:231`) | red ×3 |
| PC @`ac03f30` | **0** | **0** | green ×3 |
| MUT-4 | **2** | **1** | red ×3 |

**NB-3 broader tree**（`rg -n 'annSearchLegacy' packages/db/src apps` before @`dbed2f2`=16 lines · after @`ac03f30`=13 lines; `retrieval-legacy` 3 → 2）: the only delta is the 3 removed lines in `qbank-generation-retrieval.ts` (`:113` `:231` `:232`); **zero new references anywhere**. Files: `static/nb3-{before,after}-*.txt`. The static assertion itself remains single-file (disclosed): a caller-side catch→legacy route elsewhere would not be caught by it (none exists today).

## §3 Execution ledger（Asia/Shanghai · CST/UTC+8 · every run attempt #1 of its cell · zero retry · zero discarded）

Order per harness §5: C-3 commit → BASELINE×3 → C-1+C-2 commit → PC×3 → MUT-1..4 ×3 → R-a..R-e ×1. Image `pgvector/pgvector:pg16` · RepoDigest `pgvector/pgvector@sha256:7b822b0aac60967beb1ea5e576b8602c94c300a157d187f385ae3e0da199b90a` · image id `sha256:f1447071e6c8…` · PostgreSQL 16.15 · **pgvector extversion 0.8.7** · `hnsw.ef_search` = **40** (default, unset) · CMD `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm rag03-filter-locus:prove`. Full per-run line (container name, start/end, dirty paths, red names) in `attempt-ledger.txt`.

| Cell | SHA | Runs (start CST) | EXIT | Red assertion names |
|------|-----|------|------|------|
| **BASELINE** | `264e1d7` | 21:10:27 · 21:10:39 · 21:10:52 | **1 / 1 / 1** | `R3-STARVE-EXACT-K` (0≠5) + `R3-LEGACY-STATIC-UNREACHABLE` (3/1) + `R3-STARVE-HASH-DRIFT-EXACT-K` (NB-1 addition, 0≠5) · LEGACY ×2 green |
| **PC** | `ac03f30` | 21:11:21 · 21:11:33 · 21:11:47 | **0 / 0 / 0** | — |
| **MUT-1** scope predicate → outer, after `LIMIT k` | `ac03f30`+local | 21:12:08 · 21:12:21 · 21:12:34 | **1 / 1 / 1** | `R3-SCOPE-EXACT` (0≠3) + `R3-STARVE-EXACT-K` (+HASH) |
| **MUT-2** delete `g.taxonomy_version = …` | `ac03f30`+local | 21:12:46 · 21:12:59 · 21:13:12 | **1 / 1 / 1** | `R3-SCOPE-EXACT` + `R3-SCOPE-NO-CROSS-TAXONOMY` (5 v2-taxonomy rows leak) |
| **MUT-3** candidate JOIN back after inner LIMIT (= 0106 form) | `ac03f30`+local | 21:13:24 · 21:13:37 · 21:13:50 | **1 / 1 / 1** | `R3-STARVE-EXACT-K` (0≠5) (+HASH) |
| **MUT-4** restore legacy branch + `activeQbankGeneration` returns undefined on rowCount≠1 | `ac03f30`+local | 21:14:02 · 21:14:15 · 21:14:28 | **1 / 1 / 1** | `R3-LEGACY-STATIC-UNREACHABLE` (2/1) + `R3-LEGACY-SCOPED-FAIL-CLOSED` + `R3-LEGACY-UNSCOPED-FAIL-CLOSED` (all three) · `legacyReturned` scoped=1 unscoped=1 (record only · Cond-5) |
| R-a `rag04-track-local:prove` | `ac03f30` | 21:14:48 | **0** | — |
| R-b `rag03-route:prove` | `ac03f30` | 21:15:00 | **1** ⚠ | `未决岗位 start 不抛、返回 started，但 interview snapshot 行 = 0（优雅降级）` — **pre-existing**: same single assertion red on an unmodified worktree at base `70cba94` (21:16:01, exit 1, `logs/reg-rag03-route-BASE-70cba94.log`). job-route-decision start path; does not touch `qbank_generation_ann_search` / `hybridQbankSearch`. Not fixed (out of knife). **Deviation from expected EXIT 0 — for POST to rule.** |
| R-c `rag-generation:prove` | `ac03f30` | 21:15:12 | **0** | — (with-active, no-scope serving path; not legacy) |
| R-d `qbank-pipeline:prove` | `ac03f30` | 21:15:25 | **0** | — |
| R-e `qbank-integrity-upgrade:prove` | `ac03f30` | 21:15:38 | **0** | — |

MUT hygiene: each MUT applied by local edit (`mut-diffs/MUT-n.diff`) → 3 runs → `git checkout -- <file>` → `git diff --exit-code` **EXIT 0** ×4 (ledger). No MUT committed. MUT red name vs harness: MUT-1 via `R3-SCOPE-EXACT`/`R3-STARVE-EXACT-K` ✓ · MUT-3 via `R3-STARVE-EXACT-K` ✓ · MUT-4 all three ✓ · **MUT-2**: harness gives only the label `R3-MUT-NO-TAXONOMY` with no "经" proof assertion → mapped to `R3-SCOPE-EXACT` + `R3-SCOPE-NO-CROSS-TAXONOMY` (disclosed).

**R-e rationale (corrected per coordinator NB-1 / rag `d83c561` NB-1)**: `qbank-integrity-upgrade.proof.ts` applies only migration prefixes ≤0067/≤0068/≤0072 + 0086/0087 — it **never applies 0106 or 0138**, so it neither exercises the C-1 JOIN move nor proves 0138 applies under the migration role. It stays a regression for shared TS (C-2) only. The content-hash semantics under C-1 are instead covered by the new `F-STARVE-HASH` fixture (below).

**Dev runs (disclosed · not attempts)**: before the C-3 commit, three development runs while writing the proof — `dev1` (F-STARVE `FIXTURE_UNREACHABLE`: revoke-after-activation is synced to `visible=false`, see §4), `dev2` (baseline-shaped, EXIT 1), `dev3-postfix` (uncommitted C-1/C-2 sanity, EXIT 0). Logs kept in `logs/`. The proof was not changed after the C-3 commit.

## §4 Fixtures · values（PC attempt values identical across 3/3）

- **F-LEGACY / F-LEGACY-NOSCOPE**: run first, after full migrate, before any generation; precondition `count(qbank_active_generation_metadata())=0` and one `vector_chunk(kind='qbank', owner='__system_qbank__')` row written via `upsertVectorChunk` under `asQbankControlExecutor`. Both reject `qbank_active_generation_missing` (BASELINE + PC).
- **F-SCOPE**: 3 in-scope approved `(v1, backend/nodejs)` dist 0.30/0.31/0.32 + 20 out-of-scope approved, closer: 10 `(v1, backend/java)` dist 0.01–0.10 + **10 `(v2, backend/nodejs)` dist 0.11–0.20** (cross-taxonomy rows so MUT-2 is non-vacuous; taxonomy `v2` created through the existing draft → scopes → `released` path under the control executor, guard triggers active). K=5 → exactly `r3s_in_00..02`, 0 out-of-scope.
- **F-STARVE**: 45 in-scope unapproved dist 0.10–0.54 · 5 in-scope approved dist 0.60–0.64 · 10 out-of-scope approved dist 0.010–0.050. Vectors are `s·e_q + √(1−s²)·e_own` with a private orthogonal axis per ref → cosine distance exactly `1−s` (returned distances match to 1e-6). PC: P-EXACT (serving `hybridQbankSearch` + direct call) = `r3f_appr_00..04`, distances 0.60…0.64 ascending. BASELINE: 0.
  - **Construction disclosure（for POST）**: the pinned state "visible=true but not in `qbank_retrieval_candidate` (`status<>'approved'`)" is **not** reachable by revoking after activation: `qbank_source_visible_epoch_sync` (0029, redefined 0069) sets existing generation rows `visible=false` on approved→rejected (dev1 showed visibleUnapproved=0 → `FIXTURE_UNREACHABLE`). The proof therefore revokes the 45 sources **before** the build (normal control-executor `UPDATE qbank_source … 'rejected'`, same as `qbank-handoff-closure.proof`), and the builder's fact set includes those 45 refs; rows are written through the existing control-executor INSERT, with every trigger/FK/only-building check and `qbank_validate_generation` count+epoch check live. **No trigger disabled.** Each attempt checks reachability (`revoked=45 · visibleUnapproved=45 · candidateUnapproved=0 · candidateApproved=5`) and would log `FIXTURE_UNREACHABLE` + fail otherwise. Semantically this is the builder-fact-set vs current-approval drift that the in-function candidate JOIN defends against. Production builder (`snapshotFacts` approved-only + epoch check) does not produce it by itself → D-ANN-1 is defense-in-depth for that drift plus legacy content drift. POST to judge whether this construction matches §4.2's "existing DDL/write functions".
- **F-STARVE-RRF**: same corpus, `rrf`, query `qwvzkx` (lexical 0 rows verified) → 5 approved (BASELINE also 5 · control).
- **F-STARVE-HASH (coordinator NB-1 addition · not in harness §4.2)**: 45 in-scope with `qbank_chunk.content` drifted after activation (content_hash mismatch → not a candidate, still `visible`) + 5 approved far + 10 out-of-scope near. Drift is only constructible by a superuser `ALTER TABLE qbank_chunk DISABLE TRIGGER USER` → UPDATE → `ENABLE TRIGGER USER` seam (same simulation class as `rag04` ⑥b; equals the pre-0068 historic drift that `qbank-integrity-upgrade` covers). BASELINE 0 (red) → PC exactly 5. This makes BASELINE/MUT-1/MUT-3 carry one extra red name beyond the harness-pinned set (disclosed; required names still hit).

## §5 HNSW · EXPLAIN（Cond-6 · `planSource=substituted_body` · `LIVE_PLAN_NOT_CAPTURED`）

EXPLAIN (ANALYZE, FORMAT JSON) of the catalog body from `pg_get_functiondef(…regprocedure)` with parameters substituted, superuser txn, same `SET LOCAL` + scope GUCs; the hard gate is the **real function call in that same txn**. Full JSON per attempt: `receipt-json/<cell>-<n>.json` → `fStarve.plans[].explainJson`.

| Plan | BASELINE / MUT-3 (JOIN after LIMIT) | PC (0138) |
|------|------|------|
| P-EXACT (`enable_indexscan=off`, `enable_bitmapscan=off`) | no `qgc_hnsw_visible_` · live 0 | no `qgc_hnsw_visible_` · live **5** exact |
| P-DEFAULT | `HNSW_USED=true` · live 0 (safety-only judged) | `HNSW_USED=false` · live **5** exact (hard) |
| P-HNSW (`enable_seqscan=off`) | `HNSW_USED` (Index Scan `qgc_hnsw_visible_*`) · hnswReturned=0 | **`HNSW_NOT_EXERCISED`** (planner still avoids the HNSW scan with the candidate JOIN before LIMIT) · hnswReturned=5 · `R3-HNSW-SAFETY` green |

All plan labels are substituted-body observations, not live-plan proof. Because P-HNSW post-fix did not exercise HNSW, **HNSW completeness under the fix is unobserved → `R3-HNSW-COMPLETENESS` stays OPEN** (ef_search=40 ordered index scan can still under-fill K when ≥40 nearer rows fail the JOIN; BASELINE P-HNSW shows exactly that). No knob/index change.

## §6 Ban-path / scope checks

`git diff 70cba94..ac03f30`: 6 files (`package.json`, `packages/db/package.json`, `scripts/run-e2e-isolated.mjs`, `0138`, `qbank-generation-retrieval.ts`, new proof). Added lines matching `MATCH|AGAINST|qdrant|mysql|FULLTEXT` = only "Ban …" comments/strings (and a JS `String.match` regex); **zero** MySQL/Qdrant/FULLTEXT code paths. No PERF-TEAR / AN-CIMG-EA / AN-PRIV-EXT / AN-MOP files touched. No matrix/backlog/checklist edit. No `.env*` read; MODEL_* stripped.

## §7 Non-claims

EXIT 0 ≠ R3 closed ≠ GAP-RAG-03 closed (backlog `:71` **OPEN** · canHonestlyFlip=false) · ≠ HNSW-complete (`R3-HNSW-COMPLETENESS` **OPEN**) · ≠ live-plan proof · ≠ cutover · ≠ FULLTEXT equiv · ≠ HA · releaseEvidence=false · coveredCount=8 · R-a..R-e green ≠ R3 evidence. Not nail. alone ≠ dual. Ban self-nail until POST BOTH + coordinator AUTHORIZE.

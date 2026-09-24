# REQUEST — **UC-E2E-018 RECEIPT-BACKFILL · GAP-UC018-RECEIPT-BACKFILL** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）  
**Expert**: `mw-e2e-ha`  
**Knife**: `harness/uc-e2e-018-receipt-backfill.md` · slice `uc-e2e-018-receipt-backfill.slice.md`  
**Parent nail**: `17e7654`（COVERED-CRITERION CLOSED）  
**Date**: 2026-09-23 (~21:30 PT)

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Matrix §1.1 UC-E2E-018 | **partial** · Ban invent covered |

Dual PASS ≠ coding ≠ covered ≠ nail · Ban hand-write JSON from prose · Ban retune SHA mismatch.

---

*Stub · awaiting expert pre-exec dual · STOP*

---

# PRE-EXEC dual · UC-E2E-018 RECEIPT-BACKFILL · mw-e2e-ha（docs gate only · Ban prove · Ban product edit）

**Agent**: `mw-e2e-ha`（adversarial Meetwise E2E evidence-honesty · Line A knife `GAP-UC018-RECEIPT-BACKFILL`）  
**REQUEST tip**: `402f242` / full `402f2428779573c972f530e521bfde824e71ee69`（`docs(e2e): REQUEST UC018 RECEIPT-BACKFILL (pre_dual)` · Author meetwise-core）  
**Parent nail**: `17e7654` / full `17e765464ef55757a68ed543773375a7328d4dac` COVERED-CRITERION CLOSED · r5 PASS `fc7dc24` conditioned this backfill knife + Ban hand-write JSON from prose  
**Date**: 2026-09-23 (~21:40 PT)  
**Scope**: `/workspace/meetwise` only · branch `feat/mysql-schema-skeleton` · Ban Meridian · Ban `.env*` · Ban peer-sign · Ban touch `mw-rv-*` · Ban coding/prove this turn  
**alone≠dual** · Pre-exec PASS ≠ coding ≠ covered ≠ nail ≠ next knife

## Pins（restated · unchanged）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| public DELETE | **503** |
| Matrix §1.1 UC-E2E-018 | **partial** · Ban invent covered |

---

## 1. REQUEST tip · docs-only · ancestry · origin

| Check | Result | Cite |
|-------|--------|------|
| `git fetch` + tip on origin branch | **YES** · `402f242` is ancestor of HEAD/`origin/feat/mysql-schema-skeleton` | `git merge-base --is-ancestor 402f242 HEAD` EXIT=0 |
| Docs-only | **YES** · 4 paths, all under `ai-docs/delivery/` | `harness/uc-e2e-018-receipt-backfill.md` · `reviews/REQUEST-…-mw-e2e-ha.md` · `reviews/REQUEST-…-mw-rag-route.md` · `uc-e2e-018-receipt-backfill.slice.md` · 0 product/scripts |
| Parent nail retained ancestor | **YES** · `17e7654` on origin | COVERED-CRITERION nail |

## 2. Seven recorded SHAs · cmds vs prior post-prove

All seven exist + are ancestors of HEAD（`git rev-parse` + `merge-base --is-ancestor`）.

| Prove | REQUEST CMD + SHA | Prior post-prove claimed primary CMD | Match? |
|-------|-------------------|--------------------------------------|--------|
| FULL-E2E | `pnpm uc018:abandon:full-e2e:prove` @ `85d36c7` | same primary @ tip MATCH（suite also ran abandon/http/full-e2e） | **YES** primary |
| GRAPH | `pnpm uc018:graph:prove` @ `f06dcba` | same dedicated primary | **YES** |
| TTL | `pnpm uc018:ttl:prove` @ `549da9c` | same dedicated primary | **YES** |
| UI | `pnpm uc018:ui:prove` @ `e88d386` | same dedicated primary | **YES** |
| SOLE | `pnpm uc018:sole:prove` @ `23f98d3` | same dedicated primary | **YES** |
| ADV | `pnpm uc018:adv:prove` @ `bdc5993` | same dedicated primary | **YES** |
| PERF/LOAD | `pnpm uc018:perf-load:prove` @ `b29c191` | same dedicated primary（implementer tracked `8c7ee0c` not EOR · dual re-ran at `b29c191`） | **YES** |
| waiting_user | abandon+http · **not-found** dedicated tip | `2026-09-10-uc-e2e-018-waiting-user-mw-e2e-ha.md` early wave · **no recorded prove tip SHA** | **honest not-found** · Ban invent SHA |

Cite harness table: `ai-docs/delivery/harness/uc-e2e-018-receipt-backfill.md` recorded-prove table（FULL-E2E…PERF/LOAD + waiting_user not-found）.  
Cite gatherer last-line contract: `scripts/lib/uc-covered-real-gatherer.mjs:265` `REVIEW_VERDICT_LINE_RE` · `:322` `parseReviewFileVerdict` last-non-empty-line only · `:427` `assertCleanPorcelain`.  
Cite receipt field contract: gatherer header `:21–29` · `pickExitFromReceipt` `:180` · `pickGitSha` `:196` · `evidenceOfRecord` fail-closed `:175–178` · evaluator `MISSING-RECEIPT` / `PROVE-FAIL` `scripts/lib/uc-covered-evaluator.mjs:27,:162,:193–196`.  
Cite gatherer hard paths: sole/adv/perf/graph JSON `:473–475,:499`.

**Finding C-CMD-SUITE**: prior post-proves often recorded **companion** CMD suites. REQUEST lists **primary dedicated** CMD only — acceptable for column wire **if** gatherer cmd keys match. Binding: when claiming suite parity with prior post-prove, re-run the **same CMD list** that post-prove recorded, not a silent subset.

## 3. Old-SHA runnability（docs-only · Ban prove）

Diff each SHA → HEAD（no prove executed）:

| Risk | Observation | Binding |
|------|-------------|---------|
| Lockfile drift | `pnpm-lock.yaml` + package.json scripts grow tip-ward（e.g. `85d36c7..HEAD` → +23 lines across 2 files） | **C-FROZEN-LOCK** · per-SHA clean worktree · `pnpm install --frozen-lockfile` **at that SHA** · Ban tip lockfile |
| package.json scripts | Later knife scripts **absent** at older SHAs（`85d36c7` has abandon* only; graph/ttl/ui/sole/adv/perf added later） | **Good** for SHA-faithful re-run · Ban cherry-picking tip scripts into old worktree |
| packageManager | Stable `pnpm@10.18.0` across SHAs+tip | Record pnpm+node versions in receipt |
| engines.node | **Absent** in root package.json | Record actual `node -v` / `pnpm -v` |
| Images | `docker/compose.dev.yml` @ `85d36c7`: `pgvector/pgvector:pg16` · `redis:7-alpine` · **`minio/minio:latest`** floating · mailhog pinned | **C-IMAGE-DIGEST** · record RepoDigests · Ban silent `:latest` drift |
| Migrations / PG state | Path-count stable；product code after older SHAs still a **PG retained-state** hazard if DB reused | **C-FRESH-DB** · fresh isolated PG per SHA worktree · Ban shared retained volume |
| Worktree hygiene | Harness says「clean worktree」only | **C-WORKTREE-HYGIENE** · separate worktree per SHA · porcelain clean before+after · `runnerCommitSha`/`gitSha` **=== recorded SHA**（Ban tip HEAD labeled as that SHA） |

## 4. Honest failure recording · emitter vs hand-write

REQUEST/harness **do** Ban hand-write JSON from prose · Ban retune SHA mismatch / nonzero（harness Goal + NHP FAULT/NEG）· **directionally sound**.

**Gaps（not fatal if bound）**:

| Gap | Why it matters | Condition |
|-----|----------------|-----------|
| Failure record under-specified | 「record, do not retune」lacks EXIT≠0 + log path + status stays prior/partial/downgrade · never promote | **C-FAIL-HONEST** |
| Retry-until-green | Not forbidden explicitly | **C-NO-RETRY-WASH** · every attempt logged；no silent last-green-only |
| Tip-SHA substitution | Not labeled | **C-NO-TIP-SUB** · tip run allowed only if labeled **new evidence ≠ backfill** for that historical SHA |
| Schema skeletal | `{gitSha,exit,stack,caps,evidenceOfRecord,runAt}` · gatherer also needs cmd-keyed exits/`cmds`、committed ancestry、stack tri-state、targetEnv | **C-SCHEMA-GATHERER-ALIGN** |
| Emitter + anti-hand-author test absent | Ban is prose-only；no required runner emit path / log-hash / generated fields test | **C-EMITTER-MACHINE-ONLY** · receipts via runner/script emit only · test refuses hand-authored JSON（e.g. log hash / runner-only fields） |
| Receipt output dir vs gatherer paths | Plan: `ai-docs/delivery/receipts/uc018-receipt-backfill/` · gatherer hard-reads sole/adv/graph JSON + `uc018-perf-load/summary.json`（`:473–475,:499`） | **C-GATHERER-PATH-WIRE** · either write gatherer-expected paths **or** extend gatherer to read backfill dir · Ban orphan JSON that never feeds evaluator |
| Old reviews last-line | Existing post-prove tails are prose / italic — **not** `Verdict: PASS`（parser → MISSING-DUAL）· correct motivation | **C-APPEND-ONLY-REVIEWS** · Ban rewrite old receipts · append new post-prove dual files with strict last line after **fresh** re-verify |

## 5. waiting_user without recorded SHA

REQUEST correctly marks **not-found** · does **not** invent a SHA · **PASS this FAIL-trigger**.

**C-WAITING-USER-RULE**（binding）: cannot backfill as historical. Either (i) fresh run at **current tip** labeled **new evidence ≠ backfill**, or (ii) stays gap/unrecorded. Ban minting a SHA from 2026-09-10 prose.

## 6. PERF/LOAD @ `b29c191`

Harness NHP PERF/LOAD: local re-run ≠ capacityRepresentative · Ban elevate PERF covered. Aligns with pin + prior PERF post-prove（partial · local · ≠HA · ≠perf SLO）.

**C-PERF-CAP-PARTIAL**: backfill must **not** lift PERF/LOAD above **partial** · `capacityRepresentative` stay false for local · Ban HA/SLO claim.

## 7. Reviewer verdicts · coveredCount

- Strict verdicts must come from **re-verifying fresh runs**（post-prove dual **per SHA**）· Ban converting old prose → PASS（**C-DUAL-FROM-FRESH**）.
- Gatherer reads **only** last line `Verdict:`（`:265,:322`）.
- Old receipts append-only（**C-APPEND-ONLY-REVIEWS**）.
- `coveredCount` stays **8** unless REQUEST explicitly + honestly defines otherwise via **real gatherer input + dual post-prove**（**C-COVERED-COUNT-8**）. Backfill reducing MISSING-* must not silently flip §1.1 / invent covered（harness Ban invent covered / Ban flip §1.1 — retained）.

Optional follow-up `FX-DUAL-DETAILS-UNCLOSED` / C-WORD-NEG: register-only OK · not blockers for this pre-exec.

## Fail-trigger audit（this gate）

| FAIL if… | Assessment |
|----------|------------|
| Permits prose→JSON | **No** · explicit Ban hand-write JSON from prose（harness/slice/stub）· strengthen via **C-EMITTER-MACHINE-ONLY** |
| Lacks failure honesty | **Partial** · base Ban retune/record present · gaps closed by **C-FAIL-HONEST** / **C-NO-RETRY-WASH** / **C-NO-TIP-SUB** as **binding**（not optional niceties） |
| Invents waiting_user SHA | **No** · not-found flagged |

## Blockers

**None for pre-exec docs gate** — plan sound under binding conditions below. Coding/prove **not** authorized by this PASS alone.

## Conditions（binding · named）

1. **C-FROZEN-LOCK** — per-SHA worktree · `pnpm install --frozen-lockfile` at recorded SHA.
2. **C-IMAGE-DIGEST** — record image digests（esp. Ban silent `minio:latest` drift）+ node/pnpm versions.
3. **C-FRESH-DB** — fresh isolated PG per SHA · Ban PG-retained shared volume reuse across SHA re-runs.
4. **C-WORKTREE-HYGIENE** — separate clean worktree · porcelain clean before/after · `gitSha`/`runnerCommitSha` === recorded SHA.
5. **C-FAIL-HONEST** — failed/differing re-run: real EXIT≠0 + log path · status stays prior/partial or downgrades · **never** promoted.
6. **C-NO-RETRY-WASH** — no retry-until-green without recording **all** attempts.
7. **C-NO-TIP-SUB** — tip-SHA run only if labeled new evidence；**not** counted as historical backfill for that SHA.
8. **C-EMITTER-MACHINE-ONLY** — machine emitter code path + test that JSON cannot be hand-authored from prose（log hash / runner-generated fields）.
9. **C-SCHEMA-GATHERER-ALIGN** — receipt fields satisfy gatherer contract（cmd-keyed exit、stack tri-state、evidenceOfRecord、gitSha ancestry）.
10. **C-GATHERER-PATH-WIRE** — receipts must land on paths gatherer reads（or gatherer extended）· Ban orphan backfill dir.
11. **C-WAITING-USER-RULE** — no historical backfill without SHA；tip-new or stay gap.
12. **C-PERF-CAP-PARTIAL** — PERF/LOAD stay partial · not SLO · not HA.
13. **C-DUAL-FROM-FRESH** — strict Verdict only after per-SHA fresh re-verify · Ban prose conversion.
14. **C-APPEND-ONLY-REVIEWS** — do not rewrite old post-prove files.
15. **C-COVERED-COUNT-8** — coveredCount=8 retained；any covered/§1.1 movement only via real gatherer + dual post-prove（out of scope invent）.
16. **C-CMD-SUITE** — when claiming parity with prior post-prove, re-run recorded companion CMD list.

## Chinese 3-line

1. `402f242` 纯文档、七 SHA 均在、waiting_user 诚实 not-found；禁散文转 JSON / 禁编造 SHA — 预执行门闸方向正确。  
2. 失败诚实与发射器/路径接线偏薄：以 C-FAIL-HONEST、C-EMITTER-MACHINE-ONLY、C-GATHERER-PATH-WIRE 等为**绑定条件**后方可授权实现。  
3. 裁定 **PASS（附绑定条件）** · ≠编码≠covered≠钉牌 · alone≠dual · 不代签 mw-rag-route · PERF 保持 partial · coveredCount=8。

*Pre-exec · mw-e2e-ha · GAP-UC018-RECEIPT-BACKFILL · REQUEST @402f242 · 2026-09-23 ~21:40 PT · Ban Meridian · Ban .env* · Ban peer-sign · STOP*

Verdict: PASS

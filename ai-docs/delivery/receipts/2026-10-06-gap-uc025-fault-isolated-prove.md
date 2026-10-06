# Receipt — **GAP-UC025-FAULT-ISOLATED-01 · UC-025 FAULT isolated PG/HTTP evidence**（Line W · NAIL · **`post_prove_dual_pass`** · EXIT0≠covered · row/FAULT stay gap · coveredCount=8）

**Date**: 2026-10-06（Asia/Shanghai / CST UTC+8）
**Line**: **W** · implementer `mw-core`（commit identity `meetwise-core`）
**Knife**: harness `harness/gap-uc025-fault-isolated.md` · slice `gap-uc025-fault-isolated.slice.md`
**Gap / Case**: `GAP-UC025-FAULT-ISOLATED-01` · same case `NHP-025-FAULT-01`（evidence-layer upgrade · not a new NHP row）
**REQUEST**: `43322e5c2686b3daaf1e66a255184ac8ca74c6b9`（docs cite `b0242bf` missing on origin → use 43322e5）
**PRE dual BOTH PASS**: mw-e2e-ha `69be76c9c3c7eb1ef2cc8ce2bdd4686c750487f2` + mw-privacy-int `3fb7ba50803c9f43c3960913ced51f916c373e34`
**Authority**: coordinator meetwise — Line W AUTHORIZED coding+prove · Ban self-nail · Ban wash AA · Ban claim this knife replaces AA · Ban live · Ban buy cloud · Ban HA · Ban force-push · Ban Meridian · Ban secrets · Ban fake-green / retry-to-green · Ban flipping row/FAULT · coveredCount stays 8 · EXIT0≠covered

---

## Pins（unchanged）

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · public DELETE=**503** · g7SuiteGreen=**false**

**Row**: `UC-E2E-025` stays **gap** · FAULT 列 **未翻** · NEG frozen · BOUND gap · ADV blind

---

## Complementary to AA（Ban wash）

| Layer | SHA / tip | Evidence shape |
|-------|-----------|----------------|
| AA in-process nail | nail `15eedd65658c370f91cca5a55a86b76bdaa60a98` · code `a8b98fcaaa8c314fd8e25437ff015f59dce05d93` · prove `3a6ec52195bbde8bd56cae10e48346391cee116d` | `InterviewService.begin` + recording fake DB · **≠** isolated PG/HTTP |
| **This knife (W)** | CODE `cce33ba9359ee040cf7cffa661cbb2477a1ed694` | three-layer isolated shell + real Nest HTTP + real PG `expires_at timestamptz` |

**AA_WASH: no** — two receipts complementary, not substitutes. Ban narrating AA alone as enough. Ban claiming this EXIT0 replaces AA.

---

## HTTP / error pin（same criteria as AA）

| 项 | 值 |
|----|----|
| HTTP status | **409 CONFLICT** |
| Body | `{ "error": "missing_quiz_expiry" }` |
| NULL | fail-closed → 409 `missing_quiz_expiry`（≠ `stale_quiz`） |
| NaN | fail-closed fold same code（real PG: `'infinity'::timestamptz` → driver `Infinity` → `Date(...).getTime()` NaN） |
| Order | NEG `stale_quiz` → FAULT `missing_quiz_expiry` → BOUND `resume_version_mismatch` |
| No quiz-id | FAULT block skipped · begin baseline 202 |

---

## SHAs

| 项 | 值 |
|----|----|
| Start tip | `3fb7ba50803c9f43c3960913ced51f916c373e34` |
| **CODE_SHA（prove tip product+proof）** | `cce33ba9359ee040cf7cffa661cbb2477a1ed694` |
| Ancestry | `48c4a8a` feat → `8d0d808` UUID fix → `ca4e44d` snap col → `e7b9ba2` job v64 stub → `cce33ba` 0049 bind stub |

---

## Attempt ledger（ALL recorded · Ban retry-to-green）

| # | CODE tip | Start (UTC) / CST | Container | EXIT | Note |
|---|----------|-------------------|-----------|------|------|
| 1 | `48c4a8a` | 04:30:03Z / 12:30:03 CST | meetwise-e2e-752001-1791260992060 | **1** crash | invalid UUID fixture `025fault…` (22P02) |
| 2 | `8d0d808` | 04:30:33Z / 12:30:33 CST | meetwise-e2e-753206-1791261025793 | **1** crash | snap queried non-existent `entitlement_consumption.interview_id` |
| 3 | `ca4e44d` | 04:30:55Z / 12:30:55 CST | meetwise-e2e-754258-1791261047973 | **1** | F1–F4 PASS · F5 HTTP 500（sql/05 CHECK=50 vs enqueue v64） |
| 4 | `e7b9ba2` | 04:31:36Z / 12:31:36 CST | meetwise-e2e-755493-1791261089816 | **1** | F1–F4 PASS · F5 HTTP 500（sql/22 CHECK+immutable trigger blocks NULL→resume bind） |
| **4b** | `e7b9ba2`（same SHA） | 04:32:02Z / 12:32:02 CST | meetwise-e2e-756259-… | **1** | privacy OPEN `NOTE-UC025-ATTEMPT-LEDGER-4b` · same-SHA another EXIT1（still red · **≠** retry-to-green wash） |
| 5 | `cce33ba` | 04:34:20Z / 12:34:20 CST | meetwise-e2e-759280-1791261253419 | **0** | F1–F5 all PASS · 21/21 |

CMD each attempt: `pnpm uc025:nhp-fault-isolated:prove`（→ `scripts/run-e2e-isolated.mjs uc025:nhp-fault-isolated:prove:raw` → `pnpm -C apps/api prove:uc025-nhp-fault-isolated`）

Local runner receipts (releaseEvidence=false): `.tmp/isolated-proof-receipts/2026-10-06T04-34-21-658Z-759280-358e4484-1def-488f-960b-ff7044d4874f.json` (+ prior EXIT1 receipts retained).

---

## EXIT0 assertions（attempt 5 @ `cce33ba`）

### Isolation / pins
- dynamic PG port present（PGPORT=32826）
- `resume_quiz.expires_at` live column = `timestamp with time zone` / `timestamptz`（sql/20 mirror）
- static order NEG→FAULT→BOUND + FAULT throw shape

### F1–F5
| id | Result |
|----|--------|
| F1 NULL expiry · ready seed | **409 `missing_quiz_expiry`** · zero side-effect snapshot · ≠ `stale_quiz` |
| F2 infinity→NaN | **409 `missing_quiz_expiry`** · zero side-effect · probe printed |
| F3 fresh expiry + pin mismatch | **409 `resume_version_mismatch`** sentinel（≠ missing/stale） |
| F4 past expiry | **409 `stale_quiz`**（NEG order control） |
| F5 no quiz-id | **202 accepted** · resume bound + start job · ≠ FAULT codes |

### Privacy note（non-blocking）
`_neg-harness` after boot: `AUTH_DEV_HEADER="1"` · `NODE_ENV=<unset>`（dual-gate: `AUTH_DEV_HEADER==='1' && NODE_ENV!=='production'`）

### Schema stubs disclosed（≠ covered claims）
- privacy-active minimal stub（≠ 0058 fence）
- interview_job `resume_privacy_epoch` + v64 CHECK（≠ 0064 triggers）
- 0049-compatible allow-once C-side resume bind（≠ full 0049）

---

## Freeze regressions（same tip `cce33ba` · still EXIT0）

| CMD | EXIT |
|-----|------|
| `pnpm uc025:nhp-fault:prove`（AA in-process） | **0** |
| `pnpm uc025:nhp-neg:prove` | **0** |
| `pnpm uc025:nhp-bound:prove` | **0** |

Ban edited AA/NEG/BOUND proofs.

---

## OPEN（non-blocking · disclosed）

1. **NOTE-UC025-DEVHEADER-NODEENV-DISCLOSE**：`_neg-harness` sets `AUTH_DEV_HEADER='1'` · `NODE_ENV` remains `<unset>` after boot · dual-gate `AUTH_DEV_HEADER==='1' && NODE_ENV!=='production'` still holds · Ban claim blocker · Ban weaken guard/CORS.
2. **NOTE-UC025-ATTEMPT-LEDGER-4b**：same-SHA `e7b9ba2` extra EXIT1（container `756259` @ 04:32:02Z）now recorded in ledger above · still red → **≠** retry-to-green.

## Line W NAIL（`post_prove_dual_pass` · additive · 2026-10-06）

- Lifecycle: **`post_prove_dual_pass`**.
- Prove tip NAILED TO: `e8d8a919a4f1a6da8e2879a09d429653fd849705` · CODE `cce33ba9359ee040cf7cffa661cbb2477a1ed694` · REQUEST `43322e5c2686b3daaf1e66a255184ac8ca74c6b9`.
- CMD `pnpm uc025:nhp-fault-isolated:prove` **EXIT0** · HTTP **409** `missing_quiz_expiry` · F1–F5 · AA/NEG/BOUND freeze EXIT0.
- **AA_WASH: no** · complementary≠substitute AA · AA nail `15eedd6` / `a8b98fc`/`3a6ec52` retained · 409 not washed.
- Attempts1–4 EXIT1 retained · Ban retry-to-green · 4b added.
- POST dual BOTH PASS: mw-e2e-ha `c55253bbe5f46fa3475b733d7e5f955b150f1103` + mw-privacy-int `1fc66233b3136d1d0740fd3b9568f67673c1f267`.
- **STILL_GAP**: row + FAULT column · EXIT0≠covered · coveredCount=**8** · canHonestlyFlip=false.
- Pins: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · g7SuiteGreen=false.
- Ban invent covered · Ban flip row/FAULT · Ban HA · Ban live · Ban buy cloud · Ban Meridian · Ban secrets · Ban force-push · Ban coding.
- Keep siblings · Ban nail other lines.

## Non-claims

EXIT0 ≠ covered ≠ flip row/FAULT · coveredCount=**8** · Not HA · releaseEvidence=false · Ban claim covered/HA · Ban live · Ban buy cloud

---

*Receipt · GAP-UC025-FAULT-ISOLATED-01 · Line W NAIL · 2026-10-06 · lifecycle post_prove_dual_pass · tip e8d8a91 · CODE cce33ba · EXIT0 · 409 missing_quiz_expiry · AA_WASH: no · post dual c55253b+1fc6623 PASS · row+FAULT gap · coveredCount=8 · STOP*

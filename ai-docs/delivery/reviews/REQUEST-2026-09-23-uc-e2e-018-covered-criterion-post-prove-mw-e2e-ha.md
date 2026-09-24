# POST-PROVE dual · UC-E2E-018 COVERED-CRITERION · mw-e2e-ha

**Agent**: mw-e2e-ha（adversarial · E2E/HA/PERF-LOAD evidence honesty）  
**Date**: 2026-09-23 ~20:21 PT  
**Knife**: GAP-UC018-COVERED-CRITERION · Line A post-prove  
**Verdict**: **PASS**（无 blocker · CONDITIONS for nail）  
**Alone ≠ dual · Dual PASS ≠ covered ≠ nail · 不代签 peer**

---

## Tips checked

| Tip | Full SHA | Role | OK? |
|-----|----------|------|-----|
| runner/code `1cae8f6` | `1cae8f6a738a5424ba2f79e11d5457667c7ab0a9` | evaluator+fixtures+prove | **YES** · exists · ancestor of tip |
| prove/receipt tip `aa958e7` | `aa958e7e52b04f8c7717536ea909abf82d77a137` | docs/receipts harness executed | **YES** · on `origin/feat/mysql-schema-skeleton` |
| ancestry | `git merge-base --is-ancestor 1cae8f6 aa958e7` EXIT=0 | code tip ≤ receipt tip | **YES** |
| `git diff 1cae8f6 aa958e7 --stat` | 4 files · harness/slice/receipts only | no product/code after runner | **YES**（docs/receipts only） |
| tracked cleanliness (review start) | porcelain empty for scripts | — | **YES**（later privacy-erasure dirty unrelated · not staged） |

Pre-exec PASS: `ai-docs/delivery/reviews/REQUEST-2026-09-23-uc-e2e-018-covered-criterion-mw-e2e-ha.md`（commits 9477046 + 4902df0）.

Worktree: `git worktree add /workspace/mw-review-aa958e7 aa958e7`（detached）· `node_modules` symlink to main · removed `--force` after proves.

---

## CMD|EXIT（this session）

| CMD | EXIT | Key output |
|-----|------|------------|
| `git fetch` | **0** | — |
| `git rev-parse 1cae8f6` / `aa958e7` | **0** / **0** | tips exist |
| `git merge-base --is-ancestor 1cae8f6 aa958e7` | **0** | ancestor OK |
| `git branch -r --contains aa958e7` | **0** | `origin/feat/mysql-schema-skeleton` |
| `git diff 1cae8f6 aa958e7 --stat` | **0** | harness+slice+2 receipts only |
| `git status --porcelain`（start） | **0** | clean |
| `git worktree add … aa958e7` | **0** | detached |
| `pnpm uc018:covered-criterion:prove`（worktree） | **0** | FX-ALL-MET true · all false fixtures PASS · guards PASS · **REAL** `canHonestlyFlip=false` reasons=`STATUS-NOT-COVERED,CASE-ONLY,PERF-LOCAL-ONLY,OPEN-GAP,S11-NOT-MET` · pins coveredCount=8 NOT_HA … |
| `pnpm uc018:covered-lift-reassess:prove`（worktree） | **0** | `canHonestlyFlip=false` · refuse PERF-LOCAL-ONLY · matrix UC-018 **partial** |
| `pnpm eval-harness-matrix-cite:prove`（worktree） | **0** | UC-E2E-018 **partial**（not covered） |
| `pnpm uc018:adv:prove`（worktree） | **1** | `isolated_postgres_database_not_ready` · **env flake** |
| `git diff aa958e7 -- scripts package.json` | **0** / empty | scripts parity → retry main OK |
| `pnpm uc018:adv:prove`（main checkout） | **0** | 76 ADV cases PASS · ADV alone ≠ covered · coveredCount=8 |
| `git worktree remove --force` | **0** | cleaned |

Committed receipt at `aa958e7` claims `runnerCommitSha=1cae8f6` · EXIT=0 · same real reasons list · **matches** this session’s covered-criterion recompute（HEAD in worktree was `aa958e7` so live write used `runnerCommitSha=aa958e7` — not committed）.

---

## Source findings（`git show 1cae8f6:<path>` · file:line）

### Pure evaluator / IO isolation
- `scripts/lib/uc-covered-evaluator.mjs:193–244` — `evaluate(input)` pure（no fs/net）；IO + gatherer only in `scripts/uc-e2e-018-covered-criterion.proof.mjs:270–413` `gatherRealUc018()`.

### True branch reachable
- `evaluate` `:227–229` `canHonestlyFlip = allColsMet && businessPathMet && openGaps.length===0`.
- Prove asserts FX-ALL-MET `:229–232`；fixture expected `canHonestlyFlip:true`；session **PASS** true branch reachable.

### Single-miss / named fixtures → specific reasons
| Fixture | Expected reason | Session |
|---------|-----------------|---------|
| FX-MISS-NEG/ADV/PERF/LOAD | STATUS-NOT-COVERED | PASS |
| FX-MISS-FAULT | CASE-ONLY | PASS |
| FX-MISS-BOUND | MISSING-NHP | PASS |
| FX-OPEN-GAP | OPEN-GAP | PASS |
| FX-S11-NOT-MET | S11-NOT-MET | PASS |
| FX-IMPL-ONLY | IMPL-ONLY | PASS |
| FX-PERF-LOCAL-ONLY | PERF-LOCAL-ONLY | PASS（`capacityRepresentative:true` + `targetEnv:docker-isolated` still false） |
| FX-DUAL-ONE / FX-STALE-SHA / FX-MISSING-RECEIPT | DUAL-ONE / STALE-SHA / MISSING-RECEIPT | PASS |

### Frozen refuse enum
- `uc-covered-evaluator.mjs:18–41` — `Object.freeze(REFUSE_REASONS)` + `REFUSE_REASON_LIST`（15 members）：PERF-LOCAL-ONLY, CASE-ONLY, OPEN-GAP, IMPL-ONLY, UNCOMMITTED-RUNNER, MISSING-DUAL, DUAL-ONE, STALE-SHA, MISSING-RECEIPT, S11-NOT-MET, HAPPY-ONLY, STATUS-NOT-COVERED, MISSING-NHP, STUB-STACK, PROVE-FAIL.
- Unknown reason → throw `:76–78` `refuse reason not in frozen enum`.

### capacityRepresentative · local/docker NEVER true
- `LOCAL_ENV_CLASSES` `:59–68` includes `local`/`docker-isolated`/…
- `isLocalEnv` `:70–74`；null/empty → local.
- `isCapacityRepresentative` `:99–105`：requires flag===true **AND** non-local **AND** dual both **AND** EOR≠false. Caps-alone path **does not exist**.
- PERF/LOAD hard cap `:173–178` → PERF-LOCAL-ONLY when not representative.
- Real gatherer `:306–307` hardcodes `targetEnv='docker-isolated'`（PERF/LOAD）+ `capacityRepresentative=false`.
- Cite W2 SSOT `w2-resource-sizing-receipts.md:32`（2c4g/4c8g compare）+ `:35` sizing ≠ capacity；evaluator comment pins local caps must not wash.

**Bypass residual（CONDITION, not blocker）**: gatherer/receipts could lie `targetEnv='staging'` — trust boundary on gatherer honesty; evaluator itself blocks every LOCAL_ENV_CLASSES path.

### constant-FALSE / constant-TRUE / anti-tautology
- Guards in prove `:62–134`；session：anti-tautology PASS · constant-TRUE PASS · constant-FALSE on evaluator+rewired reassess PASS · **TRIPS on b29c191**（init false + unconditional knife refuse）.
- Runtime anti-tautology：`evaluate` rejects `input.expected` `:197–200`；prove `:234–239`.
- Evaluator source has no `expected.json` / readFile of expected（guard `:122–133`）.
- Fixtures are separate `.input.json` / `.expected.json`；prove compares — evaluator never reads expected.

**Guard residual（CONDITION）**: constant-FALSE Pattern C soft；regex-based — not a formal CFG. Still FX-ALL-MET + computed `allColsMet` path holds.

### BOUND pin
- `UC018_BOUND_PIN_ID='waiting_user-CAS'` `:44`；`UC018_REQUIRED_NHP.BOUND` `:50`.
- Gatherer `:290–296` records `hasBoundNhp=false`；pins nhpIds to `[waiting_user-CAS]` when matrix cell cites waiting_user.
- Missing pin → MISSING-NHP `:127–134`（cannot silent-true）.

### Real UC-018 computed false + PERF-LOCAL-ONLY
- Session + committed receipt：`canHonestlyFlip=false` · reasons include **PERF-LOCAL-ONLY**（also STATUS-NOT-COVERED, CASE-ONLY, OPEN-GAP, S11-NOT-MET）.
- Gatherer parses tracked matrix/NHP/harness — not hand-written column constants for statuses（`:270–370`）；PERF/LOAD capacity forced local.

### UC-018 / §1.1 NOT flipped · coveredCount=8
- Matrix §1.1 UC-E2E-018 stays **partial**（cite matrix row）；eval-harness-matrix-cite PASS；prove restates pins `coveredCount=8` · no matrix write.

### businessPathMet gatherer false-negative（CONDITION）
- Prove `:386–391` requires `GAP-UC018-*:…CLOSED` within 40 chars on **parent harness**.
- Parent often writes `**CLOSED**（\`GAP-…\``（CLOSED **before** id）→ `businessPathMet=false` → extra **S11-NOT-MET**.
- Stricter-only（cannot false-true）. Nail should widen regex / also parse matrix §1.1 CLOSED cluster.

---

## D1–D4 rulings

### D1 BOUND not strictly NHP-018-BOUND-*
**Ruling: CONDITION for nail · NOT FAIL.**  
Evaluator requires `waiting_user-CAS` in nhpIds（frozen pin）; missing → **MISSING-NHP**（`:127–134`）— cannot produce false true by ignoring BOUND. Registering `NHP-018-BOUND-01` in nail is **acceptable additive** tightening; current pin satisfies pre-exec「BOUND pinned to NHP id」via frozen `UC018_BOUND_PIN_ID`. `hasBoundNhp=false` honesty recorded.

### D2 FAULT matrix partial vs NHP case-only
**Ruling: matrix §1.0.1 FAULT=partial is stale; NHP-018-FAULT-01 `blind→case-only`（cite `—` · no prove）is authoritative. Stricter-wins in gatherer（`:299` prefer nhpRow.status）= correct safe behavior.**  
History: NHP row never elevated（db0d513 backfill era · still case-only）；reassess post-prove already noted matrix partial / NHP case-only residual. **Fix in nail**: align matrix FAULT → **case-only**（or elevate NHP only after real FAULT prove+dual）. Do **not** loosen gatherer to matrix-optimistic.

### D3 OPEN-GAP self-referential
**Ruling: ACCEPTABLE.**  
Real reasons without OPEN-GAP still false（STATUS-NOT-COVERED + CASE-ONLY + PERF-LOCAL-ONLY + S11-NOT-MET）. Gap self-closes in nail when harness marks CLOSED; evaluator does not silently exclude this knife’s GAP（`:372–381` pushes when not closed）.

### D4 four enum members added post pre-exec
**Ruling: ACCEPTABLE as additive stricter · CONDITION for fixture gaps.**  
STATUS-NOT-COVERED / MISSING-NHP / STUB-STACK / PROVE-FAIL frozen now（`:31–37`）. Fixture coverage: STATUS-NOT-COVERED ✓ · MISSING-NHP ✓ · **STUB-STACK ✗ no fixture** · **PROVE-FAIL ✗ no fixture**. Code paths exist（`:144–145`, `:157–163`）. Nail: add FX-STUB-STACK + FX-PROVE-FAIL.

---

## Blockers vs CONDITIONS

### Blockers
**无。** Criterion prove EXIT=0 · true branch reachable · real verdict false+PERF-LOCAL-ONLY computed · guards trip b29c191 · local capacity hard-blocked · UC-018/§1.1 not flipped · coveredCount=8 · scripts tip honest.

### CONDITIONS for nail（non-blocking）
1. Optional register `NHP-018-BOUND-01`（or keep `waiting_user-CAS` pin documented）.
2. Align matrix FAULT cell → case-only（NHP truth）or run FAULT prove then elevate both.
3. Self-close `GAP-UC018-COVERED-CRITERION` on dual PASS nail（harness CLOSED）.
4. Add fixtures for STUB-STACK + PROVE-FAIL.
5. Fix `businessPathMet` gatherer regex（CLOSED-before-id / matrix §1.1）so S11-NOT-MET is not a false-negative.
6. Keep capacityRepresentative trust：gatherer must not invent non-local `targetEnv`.

---

## Pins（restated · this review）

| Pin | Value |
|-----|-------|
| haStatus | **NOT_HA** |
| releaseEvidence | **false** |
| claimProductionHA | **false** |
| gR45Closed | **true** |
| coveredCount | **8** |
| ms3EqualsR4Closed | **false** |
| stack | **PG-retained** |
| UC-018 / §1.1 | **partial** · not flipped · no `covered` written |

Ban invent covered · Ban self-nail · Ban secrets/.env* · Ban Meridian · Ban Cloud Agent · Dual PASS ≠ covered ≠ nail · alone ≠ dual.

---

## Verdict

**PASS**（post-prove dual · mw-e2e-ha）· CONDITIONS listed · **≠** UC-E2E-018 covered · **≠** nail.

### 三行中文摘要
1. 复跑 covered-criterion/reassess/matrix-cite=0；ADV 在 worktree 因 isolated PG 未就绪失败、主仓 scripts=aa958e7 复跑=0；收据 tip 声称 runner=1cae8f6 与源码/实算一致。  
2. 亲读 evaluator：enum 冻结、local/docker 永不 capacityRepresentative、FX-ALL-MET 真分支可达、真实矩阵算出 false 且含 PERF-LOCAL-ONLY；D1–D3 非阻塞，D4 缺 STUB/PROVE fixture 为 nail 条件。  
3. 裁定 **PASS**（有 CONDITIONS）· 不升 coveredCount=8 · NOT_HA · releaseEvidence=false · Dual≠covered≠nail。

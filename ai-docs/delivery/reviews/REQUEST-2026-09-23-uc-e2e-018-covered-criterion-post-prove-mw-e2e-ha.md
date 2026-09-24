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

---

## 追加（append-only · 2026-09-23 · mw-e2e-ha 亲读 gatherer）· 新增 NAIL-BLOCKING 条件 C-GATHERER-REAL-INPUT

独立 `git show 1cae8f6:scripts/uc-e2e-018-covered-criterion.proof.mjs`（EXIT 0）逐行复核 gatherer `colFrom`：
- `:307` `const capacityRepresentative = false; // real UC-018: local only`、`:306` `targetEnv` 按 `isPerfLoad` 字面量写成 `'docker-isolated'`：**不从回执读取**。评估器 `uc-covered-evaluator.mjs:99–105` 可达 true，但真实输入路径对 PERF/LOAD **恒 false**，即使日后有云端回执也翻不动，除非改代码。方向保守，但属于「真实路径常量」。
- `:313` `exit: opts.exit ?? (nhpRow ? 0 : null)`：有 NHP 行就**推定 EXIT=0**，不是读 prove 结果。
- `:315–316` `committed: true`、`shaMatchesCommitted: true`：**字面量**，未核 runner 是否已提交。
- `:321–327` `stack: { postgres: true, postgresSaver: true, … }`、`:333` `present: true`：**字面量**。
- `:356/:361/:367` gitSha 为字面量（`bdc5993`/`b29c191`）。

结论：六条 keep-partial 逃逸里，「未提交 runner」「PROVE-FAIL」「STUB-STACK」在**真实 UC-018 输入**上是**断言，不是采集**，只在 fixture 上被证明。当前真实判定仍为 false（有 STATUS-NOT-COVERED/CASE-ONLY/PERF-LOCAL-ONLY 等独立理由），所以**现在不会造成假关**，本档 **PASS 维持**（评估器本身纯、可达、enum 冻结，这些都成立）。但以下是 **nail 前阻塞条件**：
- **C-GATHERER-REAL-INPUT**：gatherer 必须从已跟踪回执（`ai-docs/delivery/receipts/**`）与 git 读取 `targetEnv`、`capacityRepresentative`、`exit`、`gitSha`、`committed`/`shaMatchesCommitted`（`git merge-base --is-ancestor` + 工作树干净）以及 `stack`。缺失时必须是 fail-closed（写入 MISSING/PROVE-FAIL/STUB-STACK），不得默认 true/0。
- nail 文案不得声称「真实 UC-018 的六逃逸均已计算」，直到满足 C-GATHERER-REAL-INPUT。
- 更正本档前文：本档对「gatherer capacity hardcode」只有一行描述，没有定性。现在定性为**真实路径常量 + 若干反保守字面量**。

Pins 不变：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · UC-018/§1.1 partial · alone≠dual。

---

## 追加（append-only · 2026-09-23 ~20:36 PT · mw-e2e-ha）· C-GATHERER-REAL-INPUT fix-round 再审 @45a7bc1 / runner ca1c8a5

**Agent**: mw-e2e-ha（adversarial · POST-PROVE RE-REVIEW · C-GATHERER-REAL-INPUT）  
**Tips**: runner `ca1c8a5` / full `ca1c8a5b6848e0237a5f405113fc1dc4ed526e5d` · receipts tip `45a7bc1` / full `45a7bc1f829bde75bf6a4afdae4ed74387571bee`  
**Ancestry**: `git merge-base --is-ancestor ca1c8a5 45a7bc1` EXIT=0 · both on `origin/feat/mysql-schema-skeleton`  
**Verdict（本追加）**: **PASS** · C-GATHERER-REAL-INPUT **CLOSE** · CONDITIONS（非阻塞）· **≠** UC-E2E-018 covered · alone≠dual · 不代签 peer

### Tips / diff claim

| Check | Result |
|-------|--------|
| `ca1c8a5` ancestor of `45a7bc1` | **YES** EXIT=0 |
| both on origin | **YES** `origin/feat/mysql-schema-skeleton` |
| `git diff ca1c8a5 45a7bc1 --stat` docs/receipts only? | **NO** · 5 files: harness+slice+2 receipts **+** `packages/db/test/privacy-authorization.proof.ts`（+5 lines lease target digest 同构）· **disclose**: tip message `docs(e2e):…` 不完全准确 |
| tracked receipt `runnerCommitSha` @45a7bc1 | **`ca1c8a5b6848e0237a5f405113fc1dc4ed526e5d`** · MATCH runner |
| worktree | `git worktree add /workspace/mw-review-45a7bc1 45a7bc1` · `pnpm install --frozen-lockfile` EXIT=0 · removed after |

### CMD|EXIT（this session · worktree unless noted）

| CMD | EXIT | Key output |
|-----|------|------------|
| `git fetch` | **0** | — |
| `git rev-parse ca1c8a5` / `45a7bc1` | **0** / **0** | tips exist |
| `git merge-base --is-ancestor ca1c8a5 45a7bc1` | **0** | ancestor OK |
| `pnpm install --frozen-lockfile` | **0** | lockfile up to date |
| `pnpm uc018:covered-criterion:prove` | **0** | FX-ALL-MET true · FX-STUB-STACK/FX-PROVE-FAIL PASS · guards PASS · gatherer-literal PASS · **REAL** `canHonestlyFlip=false` reasons=`STATUS-NOT-COVERED,UNCOMMITTED-RUNNER,MISSING-DUAL,CASE-ONLY,PROVE-FAIL,MISSING-RECEIPT,IMPL-ONLY,PERF-LOCAL-ONLY,OPEN-GAP` · businessPathMet=true · real-input neg drop-ADV-exit→PROVE-FAIL · nonexistent-ADV-sha→UNCOMMITTED-RUNNER |
| `pnpm uc018:covered-lift-reassess:prove` | **0** | canHonestlyFlip=false · refuse PERF-LOCAL-ONLY · matrix UC-018 **partial** |
| `pnpm uc018:adv:prove` | **0** | 76 ADV PASS · isolated PG ready this run（no flake）· ADV alone ≠ covered |
| `pnpm eval-harness-matrix-cite:prove` | **0** | UC-E2E-018 **partial**（not covered） |
| `git status --porcelain`（after proves） | **0**（cmd） · dirty=2 | **only** tracked evidence self-writes: `uc018-covered-criterion/covered-criterion-evidence.json` + `…covered-lift-reassess-evidence.json` · **no** scripts/package.json/packages dirty |
| capacity probe `isCapacityRepresentative({capacityRepresentative:true,targetEnv:'docker-isolated',…}, dual both)` | — | **false** · PERF/LOAD still PERF-LOCAL-ONLY |
| `git worktree remove` | **0** | cleaned |

Per-column REAL reasons（session）:
- **NEG**: STATUS-NOT-COVERED, UNCOMMITTED-RUNNER, MISSING-DUAL · exit=0 · gitSha=null · dual null · sole receipt present · stack from soleStack
- **FAULT**: CASE-ONLY, UNCOMMITTED-RUNNER, PROVE-FAIL, MISSING-DUAL, MISSING-RECEIPT · receipt=null
- **BOUND**: STATUS-NOT-COVERED, UNCOMMITTED-RUNNER, MISSING-DUAL · same sole receipt as NEG
- **ADV**: STATUS-NOT-COVERED only · exit=0 · gitSha=bdc5993（harness tip）· dual PASS/PASS · committed=true
- **PERF/LOAD**: STATUS-NOT-COVERED, UNCOMMITTED-RUNNER, IMPL-ONLY, PERF-LOCAL-ONLY · targetEnv=docker-isolated（from caps.method）· implementerOnly=true

### Literal-by-literal（former C-GATHERER nails · `git show ca1c8a5:scripts/lib/uc-covered-real-gatherer.mjs`）

| Former literal | Now sourced from | Fail-closed if missing? | Cite |
|----------------|------------------|-------------------------|------|
| `targetEnv='docker-isolated'` by isPerfLoad | `pickTargetEnv(receipt)` · receipt.targetEnv/envClass/environment/env **or** derive caps.method `/docker/i` → docker-isolated · **never invent staging/prod** | null → local via evaluator `isLocalEnv` | gatherer `:137–148`, `:294` |
| `capacityRepresentative=false` hardcoded | `pickCapacityRepresentative` · only true if receipt claim true；else `capacityClaim===true` → false | absent → false（not invent true） | `:149–156`, `:295–298` |
| `exit` default 0 if NHP row | receipt `exit`/`exitCode`/`exits[cmd]`/`allPass`；receipt present+missing exit → **null**；harness CMD\|EXIT **only if receipt absent** | null → evaluator PROVE-FAIL `:147–149` | gatherer `:166–174`, `:299–301` · evaluator `:147–151` |
| `committed:true` / `shaMatchesCommitted:true` | `shaFlags` ← `git cat-file -e <sha>^{commit}` + `git merge-base --is-ancestor <sha> HEAD`（cwd=root） | no sha → committed=false uncommitted=true → UNCOMMITTED-RUNNER | `:122–135`, `:235–245`, `:305–311` · evaluator `:140–145` |
| `stack.postgres:true` etc literals | `pickStack` ← receipt.stack **or** parse soleStack string | absent → undefined fields（see remaining hunt） | `:181–214`, `:312` |
| `present:true` | `receiptPresent = receipt != null` | missing → present=false → MISSING-RECEIPT | `:292`, `:333–334` · evaluator `:175–176` |
| literal gitSha bdc5993/b29c191 | `pickGitSha(receipt)` then harness `parseProveTipSha` | null → UNCOMMITTED-RUNNER | `:176–179`, `:108–119`, `:302–304` |
| dual from harness regex | ADV/PERF/LOAD: `dualFromReviewFiles` reading reviews/ PASS markers；NEG/FAULT/BOUND: **hardcoded `{e2eHa:null,ragRoute:null}`** | null dual → MISSING-DUAL | `:216–234`, `:281–288`, `:356/:366/:376` |
| implementerOnly regex | receipt.implementerOnly **or** label/README `/not evidence of record\|implementer pre-commit\|uncommitted runner/i` | forces uncommitted + eor=false | `:157–164`, `:306–310` |
| evidenceOfRecord | receipt fields；**soft default** `!implementerOnly && receipt!=null` if absent | implementerOnly → false | `:161–164` |
| businessPathMet | `gapClosedInText`（CLOSED-before/after + 已关） | false → S11-NOT-MET；session **true** | `:85–95`, `:417–422` |

### Remaining-literal / soft-default hunt

| Finding | Severity | Note |
|---------|----------|------|
| NEG/FAULT/BOUND `dual: { e2eHa: null, ragRoute: null }` literals `:356/:366/:376` | CONDITION | Fail-closed（MISSING-DUAL）· **not** invent PASS；但 SOLE post-prove dual markdown **存在**（`…sole-stack-pg-retained-post-prove-mw-e2e-ha.md` / `…mw-rag-route.md` · Verdict PASS）— gatherer **未接线** · ≠「证据不存在」 |
| `evidenceOfRecord` soft default true when receipt present `:162` | CONDITION | Prefer absent→false fail-closed |
| Header claim「absent stack → STUB-STACK」vs evaluator `postgres===false` only `:163–169` | CONDITION | undefined stack **does not** trip STUB-STACK（ADV stack={} this run still only STATUS-NOT-COVERED） |
| **No `git status --porcelain` check** in gatherer/prove | CONDITION vs original C-GATHERER 文案「工作树干净」 | git ancestor checks **are** real；porcelain check **absent** in code · reviewer porcelain after prove = evidence self-write only |
| No remaining `committed:true` / `present:true` / `capacityRepresentative=false` object literals in `gatherRealUc018` body | OK | guardGathererLiterals PASS |
| No hardcoded PASS/SHAs on real column path | OK | dual PASS only from review file parse |

### Rulings · new fail-closed reasons

1. **UNCOMMITTED-RUNNER（NEG/BOUND）** — **correct fail-closed · evidence not machine-readable for SHA**（非 gatherer「找错字段」的纯 bug）。sole JSON **存在**但 **无** `gitSha`/`proveTip`/`runnerCommitSha`/`commitSha`；parent harness 有 CMD\|EXIT=0 但无 parseable `**Prove tip**:` → gitSha=null → uncommitted。同批 FULL-E2E/GRAPH/TTL/UI JSON 同样缺 SHA 字段。**≠** markdown 不存在（reviews/ 有 dual）。
2. **MISSING-DUAL（NEG/BOUND）** — **mixed**：evaluator 对 null dual → MISSING-DUAL **正确**；但 gatherer **硬编码** dual=null，**未读**已存在的 SOLE dual reviews → 报告「证据缺 dual」偏「未接线 / 非机器可读 dual 字段」，不是「reviews 目录空」。FAULT 同（无 FAULT receipt）。
3. **PROVE-FAIL + MISSING-RECEIPT（FAULT）** — **correct**：FAULT `receipt:null` · exit null · case-only · 无机器可读 FAULT prove 回执。
4. **GAP-UC018-RECEIPT-BACKFILL** — **应登记**于本 nail（CONDITION / follow-on）。**Backfill 必须另开 knife**（双审）· 在**记录的 prove SHA** 复跑 proves 生成机器可读 JSON（gitSha/exit/stack/dual/targetEnv/capacityRepresentative）· **Ban** 从旧 prose 手写 JSON 转录。nail 只登记 gap + 契约字段名；不在本 gatherer 刀内偷写历史回执。

### Blockers vs CONDITIONS

**Blockers: 无。** C-GATHERER-REAL-INPUT 原钉（真实路径字面量 invent true/0/committed）已移除；缺失 fail-closed；real-input negatives 在 temp copies 断言具体 reason；anti-tautology / constant-TRUE/FALSE / b29c191 trip / gatherer-literal / FX-STUB-STACK+FX-PROVE-FAIL / businessPathMet fix / capacity+docker still false — 全部本会话验证。

**CONDITIONS（非阻塞）**:
1. 登记 **GAP-UC018-RECEIPT-BACKFILL**（nail）· backfill **own knife** + dual · Ban hand-write JSON from prose。
2. 可选：NEG/BOUND 接线 SOLE dual review 文件（或要求 sole receipt.dual 机器字段）— 区分「未接线」vs「证据缺」。
3. `evidenceOfRecord` 缺省改为 fail-closed false；stack absent → 显式 STUB-STACK（与 header 一致）或改 header。
4. 补 porcelain-clean 检查 **或** 收窄 C-GATHERER 文案（当前仅 ancestor，无 porcelain）。
5. disclose：`45a7bc1` 含 `privacy-authorization.proof.ts` · 非纯 docs/receipts。
6. harness 仍列 `GAP-UC018-COVERED-CRITERION` open → REAL reasons 含 OPEN-GAP（self-ref · 钉死后关）· 可接受。

### Pins（restated）

| Pin | Value |
|-----|-------|
| haStatus | **NOT_HA** |
| releaseEvidence | **false** |
| claimProductionHA | **false** |
| gR45Closed | **true** |
| coveredCount | **8** |
| ms3EqualsR4Closed | **false** |
| stack | **PG-retained** |
| UC-018 / §1.1 | **partial** · not flipped |

Ban invent covered · Ban self-nail · Ban .env* · Ban Meridian · alone≠dual · Dual PASS ≠ covered ≠ nail · 不代签 peer。

### Verdict

**PASS** · **C-GATHERER-REAL-INPUT CLOSED** · CONDITIONS above · REAL still false with MORE fail-closed reasons（诚实）· **≠** UC covered。

### 三行中文摘要
1. worktree@45a7bc1 四 prove 全 EXIT=0（含 ADV）；收据 runnerCommitSha=ca1c8a5；真实 verdict 仍 false，且多了 UNCOMMITTED-RUNNER/MISSING-DUAL/PROVE-FAIL/MISSING-RECEIPT（fail-closed）。  
2. 亲读 gatherer：旧字面量已改为回执+git；缺 exit/sha → PROVE-FAIL/UNCOMMITTED；docker+capacityRepresentative:true 仍 false；neg 在临时副本断言通过；仍有 dual=null 硬编码、eor 软默认、无 porcelain 检查、45a7bc1 夹带 privacy proof.ts。  
3. 裁定 **PASS（C-GATHERER 关闭）**· 登记 GAP-UC018-RECEIPT-BACKFILL 作 follow-on 刀（禁手写 JSON）· pins 不变 · alone≠dual。

*Receipt append · mw-e2e-ha · C-GATHERER-REAL-INPUT re-review · 2026-09-23 ~20:36 PT · PASS @45a7bc1 / ca1c8a5 · STOP*

---

## 改判（append-only · 2026-09-23 · mw-e2e-ha 亲读 ca1c8a5）· gatherer 复审 **PASS → FAIL**：C-GATHERER-REAL-INPUT **未关闭**

上节（`15be441`）判「PASS · C-GATHERER-REAL-INPUT CLOSED（附条件）」。我逐行复核后**撤回**，原因是它和本席在 `479cce5` 写下的条件原文冲突。原文要求：「缺失时必须 fail-closed……不得默认 true/0」。独立 `git show ca1c8a5:<path>`（EXIT 0）发现以下两处直接违反：

1. **缺 stack 被当作达标**：`scripts/lib/uc-covered-real-gatherer.mjs:208–214`：receipt 既没有 `stack` 也没有 `soleStack` 时，返回全部 `undefined`。而 `scripts/lib/uc-covered-evaluator.mjs:163–169` 的 `badStack` 只在 `=== true` 或 `=== false` 时才命中，`undefined` 不会触发 STUB-STACK，所以缺失被视为达标，属于 fail-open。另外 `:185` 仅凭 `postgres && /pgvector/` 就推出 `postgresSaver=true`，属于弱推断。同伴 mw-rag-route 的阻塞项与此一致（本席独立复核，不代签）。
2. **evidenceOfRecord 软默认 true**：`uc-covered-real-gatherer.mjs:161–162`：`evidenceOfRecord == null` 时，只要 receipt 存在且没有 implementer 标签，就被置为 true。这是缺失默认 true，属于 fail-open。

其余剩余项维持为条件：NEG/FAULT/BOUND 的 `dual=null` 是硬编码（`:356/:366/:376`；方向保守，但应读取 review 文件）；gatherer 没有 porcelain 检查；`45a7bc1` 夹带了非 docs 文件 `packages/db/test/privacy-authorization.proof.ts`（Line B 的文件，需披露，不得混入 Line A 证据）。

**阻塞项（nail 前必须修）**：
- B-STACK-FAIL-OPEN：stack 字段缺失或 `undefined` 时，必须命中 STUB-STACK（或 MISSING-RECEIPT）；去掉 pgvector 推断 postgresSaver。须补 fixture：`FX-STACK-MISSING` 期望 false + STUB-STACK。
- B-EOR-FAIL-OPEN：`evidenceOfRecord` 缺失时必须为 false（或命中 MISSING-DUAL / MISSING-RECEIPT）。须补 fixture：`FX-EOR-MISSING` 期望 false。

**维持的裁定**：四条 prove 复跑 EXIT 全为 0（见上节）。NEG/BOUND 的 UNCOMMITTED-RUNNER 是真实缺口；MISSING-DUAL 是接线缺口；FAULT 的 PROVE-FAIL / MISSING-RECEIPT 判定正确。在 nail 中登记 GAP-UC018-RECEIPT-BACKFILL，回填单独成刀并走双审，禁止从旧 prose 手写 JSON。

真实判定目前仍为 false，所以**不存在当下的假关**，但本刀的目的就是「真实路径可计算且 fail-closed」，所以改判 FAIL。
Pins：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · UC-018/§1.1 partial · alone≠dual。

---

## Round 2（append-only · 2026-09-23 · mw-e2e-ha 亲读 runner `4a8a085` / receipts `4224e73`+`4706c4b`）

### Tips
| tip | full | role |
|-----|------|------|
| `4a8a085` | `4a8a085ba31400b389b288e42557324a769cb5af` | runner（code） |
| `4224e73` | `4224e7386cb19b6bc948a24e76c2ae5ecd44a53a` | covered-criterion re-prove receipts |
| `4706c4b` | `4706c4b447d33777f4339080e5812ba19d531693` | ADV append receipts |
| `03449a8` | `03449a8b3b6be5f41270f21758d669fefb73d2b5` | voided pre-rebase receipt citing `f7f804b` |
| `f7f804b` | `f7f804b45a316ae11b8962013f452d0254ca8658` | voided pre-rebase runner twin（same subject as 4a8a085；**not** ancestor of 4a8a085） |

Ancestry: `git merge-base --is-ancestor 4a8a085 4224e73` EXIT=0；`… 4a8a085 4706c4b` EXIT=0；both on `origin/feat/mysql-schema-skeleton`.
Receipts `runnerCommitSha` == `4a8a085ba31400b389b288e42557324a769cb5af`（4224e73 + 4706c4b JSON）.

`git diff 4a8a085 4706c4b --stat`：**NOT docs/receipts only** — range also contains unrelated product commits (`994e83a` g7 FreeTier guards · `packages/ai-runtime/**` · `docker/env/worker.env.example` · `scripts/e2e-live-capability-env.mjs` · `scripts/local-e2e-receipt.mjs`). Receipt commits themselves (`4224e73`/`4706c4b`) are docs/receipts only. **CONDITION**（disclose range pollution；do not treat range as pure evidence tip）.

### CMD|EXIT（worktree `/workspace/mw-rv-4706c4b` @4706c4b · clean before each prove）

| CMD | EXIT | Key outputs |
|-----|------|-------------|
| `git fetch` | 0 | |
| `git worktree add /workspace/mw-rv-4706c4b 4706c4b` | 0 | detached 4706c4b · porcelain=0 |
| `pnpm install --frozen-lockfile` | 0 | |
| `pnpm uc018:covered-criterion:prove` | **0** | FX-ALL-MET true · FX-STACK-MISSING/EMPTY · FX-EOR-MISSING · FX-EXIT-MISSING/ABSENT PASS · porcelain clean+dirty-probe PASS · **REAL** `canHonestlyFlip=false` reasons=`STATUS-NOT-COVERED,UNCOMMITTED-RUNNER,MISSING-RECEIPT,CASE-ONLY,STUB-STACK,IMPL-ONLY,PERF-LOCAL-ONLY,OPEN-GAP` · per-col dual invented PASS/PASS（see dual hunt）· pins retained |
| re-run covered-criterion after self-write | **1** | `DIRTY_TREE` · `M …/covered-criterion-evidence.json`（self-write） |
| `pnpm uc018:covered-lift-reassess:prove` | **0** | canHonestlyFlip=false · refuse=PERF-LOCAL-ONLY · matrix partial |
| `pnpm uc018:adv:prove` | **0** | 76/76 · honesty ADV≠covered · porcelain=0（no tracked self-write） |
| `pnpm eval-harness-matrix-cite:prove` | **0** | UC-E2E-018 stays partial · releaseEvidence=false |
| DIRTY_TREE manual（append README comment） | **1** | `DIRTY_TREE: … M README.md` at gatherer `:270` / gather `:287` |
| `git cat-file -e f7f804b^{commit}` | **0** | object still in store |
| `git merge-base --is-ancestor f7f804b 4a8a085` | **1** | **not** ancestor（rebase twin） |

After covered-criterion / lift-reassess：porcelain shows modified evidence JSON → second prove refuses DIRTY_TREE until `git checkout -- <evidence>`. **CONDITION**（operational self-friction；not false-true）.

### Old-item fix table（`git show 4a8a085:<path>` · file:line）

| Old item | Status | New cite |
|----------|--------|----------|
| B-STACK-FAIL-OPEN（gatherer returned all-undefined；evaluator only `===true/===false`） | **FIXED** | evaluator `:166–172` `!== true` / `!== false` → STUB-STACK；gatherer `pickStack` `:209–231` still may emit all-undefined，but evaluator now fail-closed |
| Saver inference `postgres+pgvector→postgresSaver` | **FIXED** | gatherer `parseSoleStack` `:198–200` explicit `/postgressaver/` only；comment Ban inference |
| B-EOR-FAIL-OPEN（EOR absent→true） | **FIXED** | gatherer `pickEvidenceFlags` `:172–176` absent⇒false；evaluator `:178–179` `evidenceOfRecord !== true` → MISSING-RECEIPT |
| NEG/BOUND/FAULT dual=null hardcoded | **FIXED（wiring）** | gatherer `:325–336` / FAULT `:339–341` read review files；**but parser fail-open — new blocker** |
| No porcelain check | **FIXED** | `assertCleanPorcelain` `:266–278`；gather `:287`；proof probe PASS |
| null exit → not refused | **FIXED** | evaluator `:148–149` `prove.exit == null` → MISSING-RECEIPT；fixtures FX-EXIT-MISSING/ABSENT PASS |
| Fixtures FX-STACK-MISSING/EMPTY · FX-EOR-MISSING · FX-EXIT-* | **FIXED** | proof PASS list；under `scripts/fixtures/uc-covered-evaluator/` |
| Real verdict must stay false | **HOLD** | canHonestlyFlip=false |
| capacityRepresentative local guard | **INTACT** | `isCapacityRepresentative` + `isLocalEnv`（null/'' → local）· docker-isolated still PERF-LOCAL-ONLY |
| Six columns required（missing object） | **OK fail-closed** | `evaluate` loops frozen `COLUMNS`；missing `columnsIn[c]` → blind/empty → reasons；`meetsCovered===true` required；not skipped |
| GAP-UC018-RECEIPT-BACKFILL | **CONDITION retained** | still follow-on knife；Ban hand-write JSON |
| 45a7bc1 Line B privacy proof sneak | **n/a this tip** | runner 4a8a085 range disclose separate product files（above） |

### Fail-open hunt results

#### Closed / OK
- Stack tri-state；EOR absent→false；exit null→MISSING-RECEIPT；Saver inference removed；DIRTY_TREE；`COLUMNS.every` uses evaluated objects；`[].every` on required NHP guarded by `nhpIds.length===0` branch；capacity local guard；gapClosedInText has Ban/不得/禁止 windows（fixtures PASS）.

#### NEW BLOCKER — B-DUAL-PASS-PRIORITY + B-DUAL-CROSS-ROLE
`dualFromReviewFiles` `4a8a085:scripts/lib/uc-covered-real-gatherer.mjs:233–250`:

1. **PASS beats FAIL**：`pass = Verdict/Status PASS patterns OR \`**PASS**\s*[（(]\``；`fail = /\*\*FAIL\*\*/ && !pass`。Concrete：file with `**Verdict**: **PASS**` then later `**Verdict**: **FAIL**` → **PASS**（synthetic test）. File with `**Verdict**: **FAIL**` and prose `**PASS** (` → **PASS**.
2. **No latest-verdict**：first/any PASS wins；retraction ignored.
3. **Cross-role contamination**：`isE2e/isRag` true if path **or** `text.slice(0,500)` matches peer name. One rag-route file mentioning both agents in header sets **both** e2eHa+ragRoute. Observed：PERF ha table `\| **Verdict** \| **PASS** \|` does **not** match colon regex（verdict null alone），but rag-route file with `**PASS**（` + head500hasBoth → gatherer emits dual PASS/PASS for PERF/LOAD.
4. **This receipt’s own FAIL retraction** uses `**PASS → FAIL**` / prose `改判 FAIL` without standalone `**FAIL**` → `/\*\*FAIL\*\*/` false；parser still **PASS**（passHits≥1）.
5. **Reachable false dual-met**：suppresses MISSING-DUAL/DUAL-ONE on NEG/BOUND/ADV/PERF/LOAD（session REAL columns show `dual={"e2eHa":"PASS","ragRoute":"PASS"}` and dual reasons absent）. Hypothetical-but-reachable：FX-ALL-MET-quality other fields + contaminated dual PASS/PASS → canHonestlyFlip true while peer review actually FAIL/retracted. **BLOCKER**（alone≠dual honesty）.

Evaluator `dualVerdict` `:83–92`：FAIL+FAIL → `'missing'`（fail-closed）；PASS+FAIL → `'one'`（OK）— damage is **gatherer inventing PASS**.

#### CONDITIONS（not false-true alone）
- **C-DIRTY-SELF-WRITE**：prove writes tracked evidence → re-prove DIRTY_TREE until restore. Refuse is correct；workflow friction.
- **C-RANGE-PRODUCT**：`4a8a085..4706c4b` includes non-receipt product code.
- **C-ALLPASS-EXIT0**：`pickExitFromReceipt` `:186` `allPass===true → 0`（trust receipt boolean）.
- **C-PARSESOLE-POSTGRES-WITHOUT-SAVER**：`postgres:true, postgresSaver:undefined` → STUB-STACK（fail-closed OK）.
- **C-GAP-UC018-RECEIPT-BACKFILL** + open GAP-UC018-COVERED-CRITERION self-ref OPEN-GAP.

### f7f804b ruling
- `git cat-file -e f7f804b^{commit}` **EXIT=0**（object retained）.
- `git merge-base --is-ancestor f7f804b 4a8a085` **EXIT=1**（rebase twin，same subject message；**not** on tip ancestry）.
- Citations：prose/`rebaseNote` in `covered-criterion-evidence.json:524` only；**not** used as gatherer `gitSha` input on 4706c4b tip.
- `03449a8` receipt cited voided runner `f7f804b` — **superseded** by `4224e73` @`4a8a085`. If a receipt still pointed gatherer at `f7f804b` as prove tip：object exists so would **not** auto UNCOMMITTED-RUNNER via missing object；ancestor check vs HEAD may still mark stale/uncommitted depending on graph. **No live gatherer dependency found** on tip receipts.

### DIRTY_TREE test result
- Built-in proof probe：PASS（temp file refuse）.
- Self-write evidence：re-run EXIT=1 DIRTY_TREE.
- Manual README touch：EXIT=1 DIRTY_TREE @ gatherer `:270`.
- Does **not** false-trigger on clean tree；**does** trigger after own evidence write（CONDITION）.

### Blockers / Conditions
**Blockers**
1. **B-DUAL-PASS-PRIORITY**：PASS pattern anywhere overrides FAIL；no last-verdict / retraction semantics.
2. **B-DUAL-CROSS-ROLE**：peer-name in path or first 500 chars lets one file fill both dual slots；table Verdict format mismatch + rag `**PASS**（` invents both-PASS.

**Conditions**
1. C-DIRTY-SELF-WRITE  
2. C-RANGE-PRODUCT（4a8a085..4706c4b）  
3. C-ALLPASS-EXIT0  
4. C-GAP-UC018-RECEIPT-BACKFILL（nail follow-on）  
5. f7f804b object retained but prose-only on tip（disclose）

### Pins（restated · alone≠dual · 不代签 mw-rag-route）
| Pin | Value |
|-----|-------|
| haStatus | **NOT_HA** |
| releaseEvidence | **false** |
| claimProductionHA | **false** |
| gR45Closed | **true** |
| coveredCount | **8** |
| ms3EqualsR4Closed | **false** |
| stack | **PG-retained** |
| UC-018 / §1.1 | **partial** · not flipped |

### Verdict
**FAIL** — old B-STACK / B-EOR / exit-null / Saver-inference / dual-null-hardcode / porcelain gaps **fixed** at `4a8a085`；REAL `canHonestlyFlip=false` holds；**but** dual review parser fail-open（PASS-priority + cross-role）is a new nail-blocking honesty defect（alone≠dual）.

### 三行中文摘要
1. runner `4a8a085` 上旧 B-STACK/B-EOR/exit/Saver/porcelain/dual 空硬编码已修；四 prove+matrix EXIT 符合预期；真实 canHonestlyFlip=false。  
2. 新阻塞：dual 解析「任一 PASS 压过 FAIL」且文首 500 字角色名串线，能把单文件/已撤回 PASS 收成双 PASS（本收据改判 FAIL 仍被读成 PASS）。  
3. 裁定 **FAIL** · pins 不变 · DIRTY_TREE 自写 evidence 为 CONDITION · 不代签 peer。

*Receipt append · mw-e2e-ha · UC018 covered-criterion gatherer round2 FAIL @4706c4b / 4a8a085 · 2026-09-23 ~21:05 PT · STOP*

---

## Re-review r3 · mw-e2e-ha · covered-criterion (Line A) · @10bf0c0 / runner 28dc259 · 2026-09-23 ~21:00 PT

**Role**: mw-e2e-ha · adversarial evidence-honesty · alone≠dual · 不代签 mw-rag-route  
**Tips**: `origin/feat/mysql-schema-skeleton`=`74cf87e` (peer r3 already on tip) · claim tip=`10bf0c0` · runner=`28dc259` · prior round2 tip=`dd2f3ce` · prior runner=`4a8a085`

### Task1 · ancestry / disclosure
| Check | Result | EXIT |
|-------|--------|------|
| `git fetch` | ok | 0 |
| `28dc259` ancestor of `10bf0c0` | yes (`merge-base --is-ancestor`) | 0 |
| both on `origin/feat/mysql-schema-skeleton` | yes | 0 |
| `git diff 28dc259 10bf0c0 --stat` | **docs/receipts only** (4 files: harness md + lift evidence + covered-criterion evidence/prove.md) | 0 |
| receipts `runnerCommitSha` | `28dc25947baad0f3a377d2961fa38fb6a25b915b` | — |
| range `4a8a085..10bf0c0` | 14 commits (reviews + Line B/C product + Line A fix/receipts) | 0 |

**Disclosure vs range**: evidence `rangeDisclosure.lineACommits` = `{4a8a085,4224e73,4706c4b,28dc259}` + vague note about Line B/C in `4a8a085..4706c4b`.  
**Undisclosed product SHAs still in range** (CONDITION C-RANGE-PRODUCT-R3): `994e83a` feat(g7) FreeTierOnly · `9e55109`/`3c4847a` UC052 privacy product. Note text not updated to `..10bf0c0`; Line A docs `03449a8`/`10bf0c0`/`dd2f3ce` omitted from `lineACommits` list (docs-only, lower severity).

### Task2 · clean worktree proves @10bf0c0
Worktree `/workspace/mw-rv-10bf0c0` @ `10bf0c0` · `pnpm install --frozen-lockfile` EXIT=0 · `.tmp/` gitignored (`.gitignore:15`).

| CMD | EXIT | Key output |
|-----|------|------------|
| `pnpm uc018:covered-criterion:prove` #1 | 0 | leaf-mutation **405/405**; dual FX retracted/single-peer PASS; real `canHonestlyFlip=false`; reasons include PERF-LOCAL-ONLY,OPEN-GAP,…; wrote `.tmp/uc018-covered-criterion/*` only; porcelain clean after |
| `pnpm uc018:covered-criterion:prove` #2 | 0 | **no DIRTY_TREE**; porcelain still clean (C-DIRTY-SELF-WRITE fixed for this knife) |
| `pnpm uc018:covered-lift-reassess:prove` | 0 | canHonestlyFlip=false retained; **but** dirtied tracked `ai-docs/delivery/receipts/2026-09-23-uc-e2e-018-covered-lift-reassess-evidence.json` → restored via `git checkout --` (C-LIFT-DIRTY-TRACKED) |
| `pnpm eval-harness-matrix-cite:prove` | 0 | UC-E2E-018 partial≠covered |
| `pnpm uc018:adv:prove` | 0 | 76 cases green; pins ADV alone≠covered; receipt under `.tmp/isolated-proof-receipts/` |
| Mutation (inside covered-criterion prove) | 0 | **405/405** · allowlistHits=84 · 7-entry allowlist printed |
| DIRTY_TREE sanity: `echo >> README.md` then prove | **1** | `DIRTY_TREE: … M README.md` refuse (`assertCleanPorcelain` :315–323) · restored |
| `git check-ignore -v .tmp/uc018-covered-criterion/…` | 0 | ignored |
| worktree remove `--force` | 0 | cleaned |

### Task3 · dual parser source @28dc259 (`uc-covered-real-gatherer.mjs`)
**Regex** (`REVIEW_VERDICT_LINE_RE` :261; applied per-line :268):  
`/^(?:\*\*)?Verdict(?:\*\*)?:\s*(?:\*\*)?(PASS|FAIL)(?:\*\*)?\s*$/`  
- Anchored full line · optional `**` around Verdict and PASS/FAIL only · **no** trailing commentary · case-sensitive PASS/FAIL · last matching line wins (:263–272).  
- Tolerates `**Verdict**: **PASS**` · rejects `Verdict: PASS (with conditions)` and `**Verdict**: **PASS**（…）` (trail junk → null).  
- **Does NOT strip markdown fences** — a bare machine line inside a ``` fence still matches (see test d).

**Role binding** (`roleFromReviewPath` :273–281): filename suffix `-mw-e2e-ha.md` / `-mw-rag-route.md` (or path segment) **only**. Body / first-500 peer names ignored. **No git-author check** (C-NO-GIT-AUTHOR): any committer can drop a file named `…-mw-e2e-ha.md` with a strict last-line PASS.

**Which files per column** (`gatherRealUc018` :366–391): knife **post-prove** paths — ADV→`…-adv-post-prove-…`, PERF/LOAD→`…-perf-load-post-prove-…`, NEG/BOUND→sole-stack-pg-retained-post-prove (+ waiting-user ha fallback via `||` :383–385), FAULT→graph-safely-terminated-post-prove if tip wired. **Not** covered-criterion-post-prove files for the six columns (correct knife binding).

**Latest-wins**: confirmed FX-DUAL-RETRACTED + synthetic (a)/(b). Prior B-DUAL-PASS-PRIORITY / B-DUAL-CROSS-ROLE **fixed**.

#### Parser tests (temp fixtures · EXIT=0)
| ID | Setup | Result |
|----|-------|--------|
| (a) PASS then FAIL | last=FAIL · dual FAIL+PASS | **not met** (DUAL-ONE path) ✓ |
| (b) FAIL then PASS | last=PASS · dual PASS+PASS | **met** ✓ append re-review |
| (c) no marker | prose PASS only | e2eHa=null → **MISSING-DUAL** ✓ |
| (d) fence | ``` / Verdict: PASS / ``` only | **PASS counted** → **B-DUAL-FENCE-COUNTED** |
| (d2) `> Verdict: PASS` then FAIL | quoted ignored | FAIL ✓ |
| (d3) bold / trail junk | bold OK; junk → null | ✓ |
| (e) only rag file | e2eHa=null | **MISSING-DUAL** ✓ |
| (f) real covered-criterion post-prove ha @tip | matchCount=0 (line6/198 have trail junk / non-strict label) | **null** (not PASS) ✓ · FX-DUAL-RETRACTED / SINGLE-FILE-NAMES-PEER fixtures also not invent PASS |

Note: after this r3 append, gatherer will read **this file's last strict line** as ha slot for any column that points here — covered-criterion columns do **not** point here today; still keep last line honest.

### Task4 · mutation allowlist rulings (7)
| # | Path | What mutation does | Why survivor | Ruling | Evidence |
|---|------|--------------------|--------------|--------|----------|
| 1 | `ucId` | delete/null metadata | evaluate never reads | **LEGIT** | evaluator has no ucId gate |
| 2 | `columns.(NEG\|FAULT\|BOUND\|ADV).receipts.capacityRepresentative` | flip claim on non-PERF/LOAD | only PERF/LOAD call `isCapacityRepresentative` :191–195 | **LEGIT** | design correct |
| 3 | `columns.(NEG\|FAULT\|BOUND\|ADV).receipts.targetEnv` | same | only via capacity helper for PERF/LOAD | **LEGIT** | design correct |
| 4 | `columns.*.prove.cmd` | delete cmd alone | MISSING-RECEIPT OR is `!cmd && !gitSha` :155–157; gitSha alone suffices | **LEGIT** (soft) / **C-PROVE-CMD-OR** | missing **both** → MISSING-RECEIPT; cmd-only absent still flip=true on FX-ALL-MET |
| 5 | `columns.*.prove.gitSha` | delete/garbage sha string | same OR; **evaluate never cat-file/merge-base the string** — trusts `committed`/`uncommitted`/`staleSha` flags | **LEGIT** vs flags · **C-PROVE-GITSHA-UNUSED** | null/garbage sha + forged flags true → flip **true**; flags false → UNCOMMITTED-RUNNER |
| 6 | `columns.*.receipts.implementerOnly` | delete/null/false | fail-closed only on `=== true` :179–181 | **LEGIT** | positive-proof asymmetry correct |
| 7 | `section11.status` | delete / set gap/blind/not_met/covered | only `case-only` pushes CASE_ONLY :239–241; **`canHonestlyFlip` ignores status entirely** (`allColsMet && businessPathMet && openGaps.length===0` :244–246) | **FAIL-OPEN** | Direct test: status=`case-only` ⇒ `{flip:true, reasons:["CASE-ONLY"]}`; status=`gap`/`not_met`/absent ⇒ flip **true**. S11 business path gate is **`businessPathMet`** (absent/false ⇒ S11-NOT-MET ✓ FX-S11-NOT-MET). Coordinator suspicion **confirmed**: allowlist hides ornamental status field; even CASE_ONLY reason does not block flip. |

### Task5 · fail-open re-hunt
**New / confirmed**
1. **B-S11-STATUS-FAIL-OPEN** — `section11.status` ornamental; CASE_ONLY reason without flip=false (`evaluator.mjs` :239–246).  
2. **B-DUAL-FENCE-COUNTED** — no fence-stripping in `parseReviewFileVerdict` :263–272; last fenced strict line can override prior FAIL.  
3. C-NO-GIT-AUTHOR · C-PROVE-GITSHA-UNUSED · C-PROVE-CMD-OR · C-RANGE-PRODUCT-R3 · C-LIFT-DIRTY-TRACKED · C-ALLPASS-EXIT0 (`pickExitFromReceipt` still `allPass===true → 0` :193) · dualVerdict accepts boolean/`pass` lowercase :86 (gatherer emits PASS/FAIL strings today).

**Prior fixes intact @28dc259**
- stack tri-state `!== true` / `!== false` :167–176  
- EOR `evidenceOfRecord !== true` :182–184; gatherer absent⇒false :175–178  
- null exit ⇒ MISSING-RECEIPT :152–154  
- capacity local guard + dual EOR :99–105  
- porcelain DIRTY_TREE :315–336  
- dual last-strict + path-suffix role (B-DUAL-PASS-PRIORITY / B-DUAL-CROSS-ROLE closed)  
- evidence write `.tmp/` only (this knife)

`COLUMNS.every` over fixed 6 names — empty input columns ⇒ not all met (fail-closed). `negBoundDual` `||` :383–385 — FAIL string is truthy (OK); null falls through to waiting-user review (by design).

### Task6 · pins (restated · alone≠dual · 不代签 peer)
| Pin | Value |
|-----|-------|
| haStatus | NOT_HA |
| releaseEvidence | false |
| claimProductionHA | false |
| gR45Closed | true |
| coveredCount | 8 |
| ms3EqualsR4Closed | false |
| stack | PG-retained |
| UC-018 / §1.1 | partial · not flipped |
| real canHonestlyFlip | false (OPEN-GAP + column refuses) |

### Blockers (r3)
1. **B-S11-STATUS-FAIL-OPEN** — `section11.status` (incl. `case-only`) does not gate `canHonestlyFlip`; mutation allowlist entry #7 is fail-open camouflage.  
2. **B-DUAL-FENCE-COUNTED** — fenced/code-block strict verdict lines counted; last-wins can launder PASS from quoted peer fence.

### Conditions (r3)
1. C-NO-GIT-AUTHOR (path suffix only)  
2. C-RANGE-PRODUCT-R3 (994e83a / 9e55109 / 3c4847a undisclosed by SHA; note stale)  
3. C-PROVE-GITSHA-UNUSED / C-PROVE-CMD-OR  
4. C-LIFT-DIRTY-TRACKED (sibling knife)  
5. C-ALLPASS-EXIT0 retained  
6. Prior C-DIRTY-SELF-WRITE **closed** for covered-criterion (tmp-only)

### Accidental strict-marker note
Earlier body lines `**Verdict**: **PASS**（…）` (L6) and `**Verdict（本追加）**: **PASS** · …` (L198) and r2 `### Verdict` / prose **FAIL** **do not** match the strict EOL regex (trail junk / non-exact label). Pre-append `parseReviewFileVerdict` ⇒ null. This r3 last line is the sole strict marker.

### Verdict
Round-2 dual priority/cross-role + DIRTY self-write **fixed** at `28dc259` / receipts `10bf0c0`; proves×2 + lift + matrix + adv + 405/405 green; pins hold; **but** S11 status fail-open + dual fence count remain nail-blocking honesty defects.

### 三行中文摘要
1. runner `28dc259`/收据 `10bf0c0`：双 PASS 优先与跨角色、自写 DIRTY 已修；四 prove+matrix+ADV 与 405/405 符合；真实 canHonestlyFlip=false。  
2. 新阻塞：`section11.status`（含 case-only）不挡 flip（allowlist 掩盖）；代码块内严格 Verdict 行仍计入且 last-wins。  
3. 裁定 **FAIL** · pins 不变 · alone≠dual · 不代签 mw-rag-route。

*Receipt append · mw-e2e-ha · UC018 covered-criterion r3 FAIL @10bf0c0 / 28dc259 · 2026-09-23 ~21:00 PT · STOP*
Verdict: FAIL

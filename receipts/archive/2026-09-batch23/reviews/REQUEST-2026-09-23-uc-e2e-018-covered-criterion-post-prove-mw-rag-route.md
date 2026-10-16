# REQUEST — **UC-E2E-018 COVERED-CRITERION · GAP-UC018-COVERED-CRITERION** · post-prove dual · `mw-rag-route`

**Verdict**: **PASS**（附非阻塞 nail 条件 · **无 post-prove blocker**）  
**Expert / Author**: `mw-rag-route`（域：RAG/route · claim-boundary honesty · Ban invent covered · Ban假关 · Ban假绿 · Ban wash constant-false · Ban peer authorship · alone≠dual）  
**Date**: 2026-09-23 (~20:25 PT)  
**Knife**: UC-E2E-018 COVERED-CRITERION · `GAP-UC018-COVERED-CRITERION` · **post-prove dual**  
**Branch**: `feat/mysql-schema-skeleton`（historical name only · Ban MySQL cutover justification）  
**Pair**: `REQUEST-2026-09-23-uc-e2e-018-covered-criterion-post-prove-mw-e2e-ha.md`（peer · **未触** · Ban forge peer）  
**Pre-exec base**: 本专家 `f07663a` · receipt `REQUEST-2026-09-23-uc-e2e-018-covered-criterion-mw-rag-route.md`（P1–P5）· peer e2e-ha `9477046` / `4902df0`  
**Harness left**: `executed:awaiting_post_prove_dual` · **未改 harness / slice / scripts / matrix** · Ban self-nail  
**硬读**: **Dual PASS ≠ covered ≠ nail ≠ §1.1 flip** · alone≠dual · Ban invent covered · Ban假关

---

## Verdict

**PASS**。独立在干净树 `aa958e7`（detached；tip `2bbebff` 其后仅有无关 privacy 审查提交）重跑四条 prove 均 **EXIT=0**；P1–P5 满足；evaluator 真分支可达、无恒假/死 true；real UC-018 `canHonestlyFlip=false` 理由真实派生。无 post-prove blocker。下列为非阻塞 **nail conditions**。

**本专家未改 harness/slice/matrix/scripts** · 仅写本 receipt · Ban Meridian · Ban Cloud Agent · Ban `.env*`。

---

## tip / authors audited

| 项 | 证据 | 裁定 |
|----|------|------|
| `git fetch` + `git pull --ff-only` | already up to date | **PASS** |
| runner code `1cae8f6` | full `1cae8f6a738a5424ba2f79e11d5457667c7ab0a9` · Author `meetwise-core <meetwise-core@users.noreply.github.com>` · `feat(e2e): UC018 covered-criterion evaluator + fixtures + prove (Line A)` · 32 files · 祖先 of tip | **PASS** |
| prove/receipt tip `aa958e7` | full `aa958e7e52b04f8c7717536ea909abf82d77a137` · Author `meetwise-core` · `docs(e2e): UC018 covered-criterion prove receipts + harness executed (Line A)` · harness/slice/receipts · 祖先 of tip | **PASS** |
| tip vs prove tip | HEAD=`2bbebff`（privacy pre-exec）· `aa958e7..HEAD` = `dc3e17a`/`2bbebff` 无关 · **独立重跑在 detached `aa958e7`**，事后恢复 `feat/mysql-schema-skeleton` | **NOTED** |
| receipt claims runner | `covered-criterion-prove.md`：**Runner commit `1cae8f6`** · CMD `pnpm uc018:covered-criterion:prove` EXIT=0 | **MATCH** |
| `1cae8f6` 为 `aa958e7` 祖先 | `merge-base --is-ancestor` exit 0 | **PASS** |

`git show --stat 1cae8f6`：evaluator + fixtures + prove + reassess rewire。`git show --stat aa958e7`：harness/slice → `executed:awaiting_post_prove_dual` + receipts。

---

## CMD|EXIT（独立重跑 @ detached `aa958e7`）

| CMD | EXIT | 关键输出 |
|-----|------|----------|
| `pnpm uc018:covered-criterion:prove` | **0** | `canHonestlyFlip=false` · reasons=`STATUS-NOT-COVERED,CASE-ONLY,PERF-LOCAL-ONLY,OPEN-GAP,S11-NOT-MET` · b29c191 guard TRIPS · FX-ALL-MET true · pins restated · detached HEAD=`aa958e7`（原 receipt 钉 runner=`1cae8f6`） |
| `pnpm uc018:covered-lift-reassess:prove` | **0** | `canHonestlyFlip=false` · refuse=`PERF-LOCAL-ONLY` · matrix §1.1 stays **partial** · Ban假关 |
| `pnpm uc018:adv:prove` | **0** | 76 条负路径全绿 · isolated receipt `releaseEvidence=false` · **REAL Postgres** `pgvector/pgvector:pg16` via `run-e2e-isolated`（docker disposable · 非 MemorySaver/MySQL/Qdrant） |
| `pnpm eval-harness-matrix-cite:prove` | **0** | matrix: UC-E2E-018 is **partial** (not covered) · releaseEvidence=false |

重跑后对 prove 写入的 receipt / `.tmp` / reassess evidence **已 `git checkout --` 还原** · harness 状态未触。

---

## P1–P5 evidence

### P1 Guard 具体化 — **PASS**
- 静态 `guardConstantFalse` **显式**覆盖：`let/const canHonestlyFlip = false` 无 true/computed 赋值（b29c191 ~196）；无条件 `refuseReasons.push('reassess-knife-refuses-…')`（~211）。
- Prove 输出：`constant-FALSE guard TRIPS on b29c191: canHonestlyFlip initialised false with no true/computed assignment (b29c191 ~196); unconditional refuseReasons.push('reassess-knife-refuses-…')`。
- 独立：`git show b29c191:…` → temp `/workspace/tmp-review/b29-reassess.proof.mjs` → guard **trips=true**；当前 `scripts/uc-e2e-018-covered-lift-reassess.proof.mjs:248` = `const canHonestlyFlip = verdict.canHonestlyFlip`（**无** constant-false）。

### P2 Real-matrix 输入诚实 — **PASS**（附 nail）
- `gatherRealUc018()` **解析** tracked：`e2e-requirement-coverage-matrix.md` · `non-happy-path-perf-load-case-matrix.md` · criterion/parent/adv/perf harness。
- 列 status 来自 `cellStatus` / `parseNhpRow` · **无**手写 `status: 'partial'|'covered'|…` 常量冒充计算。
- Mutation：`FX-ALL-MET` → `canHonestlyFlip=true`；去掉 BOUND pin → `MISSING-NHP` 且 false。
- **Nail（非阻塞）**：gatherer 对 real UC-018 硬编码 `capacityRepresentative=false` + stack `postgres:true`（PG-retained pin）· 与 docker-isolated 证据一致 · 建议 nail 改为从 NHP/receipt 解析而非字面常量。

### P3 负向 fixture — **PASS**
存在且 prove 断言：`FX-STALE-SHA` / `FX-DUAL-ONE` / `FX-MISSING-RECEIPT`（false+正确 reason）；`FX-ALL-MET` true；`FX-MISS-{NEG,FAULT,BOUND,ADV,PERF,LOAD}`；`FX-OPEN-GAP` / `FX-S11-NOT-MET` / `FX-IMPL-ONLY` / `FX-PERF-LOCAL-ONLY`。全部独立重跑 PASS。

### P4 硬规则无 covered / 无 §1.1 flip — **PASS**
- `git diff 5afd399..aa958e7 --name-only`：**无** `e2e-requirement-coverage-matrix.md`。
- 矩阵 grep：UC-E2E-018 §1.0/§1.1 仍 **partial** · **≠ covered**。
- Prove 显式 Ban 写 covered · reassess/matrix-cite 钉 partial。

### P5 Pins 复述 — **PASS**
Prove 输出：`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained` · no UC-018/§1.1 flip · no covered written。

---

## Evaluator audit（`scripts/lib/uc-covered-evaluator.mjs`）

| 检查 | 证据（file:line） | 裁定 |
|------|-------------------|------|
| 纯函数 | `evaluate(input)` :193–245 · 无 IO/网络/git/wall-clock | **PASS** |
| 无恒假 | `canHonestlyFlip = allColsMet && s11.businessPathMet === true && openGaps.length === 0` :229 | **PASS** |
| true 可达 | FX-ALL-MET → true；mutation ALL-MET 基线 true | **PASS** |
| 无死 true 分支 | false 时才补底 reasons :231–237；true 时 reasons 可空 | **PASS** |
| 无 tautology | 拒绝 `input.expected` :198–200；不读 fixture expected | **PASS** |

---

## Real UC-018 结果（派生诚实）

- `canHonestlyFlip=false`
- reasons: `STATUS-NOT-COVERED`（NEG/BOUND/ADV/PERF/LOAD status≠covered）· `CASE-ONLY`（FAULT←NHP）· `PERF-LOCAL-ONLY`（docker-isolated · 非 capacity-representative）· `OPEN-GAP`（`GAP-UC018-COVERED-CRITERION` 仍 OPEN）· `S11-NOT-MET`（`businessPathMet!==true`）
- 各 reason 均由 `evaluate`/`gatherRealUc018` 路径推出 · **非**硬编码 refuse。

---

## D1–D4 rulings（mw-core disclosures）

### D1 BOUND carried · 无 `NHP-018-BOUND-*` · pin `waiting_user-CAS` · `hasBoundNhp=false`
**裁定：ACCEPTABLE as nail-condition · 非 FAIL。**  
Evaluator `UC018_REQUIRED_NHP.BOUND=[waiting_user-CAS]` :47–50；缺 pin → `MISSING-NHP` :128–134 · **不可能** `meetsCovered=true` / UC covered。Mutation 验证。未谎报 BOUND 已 met。注册 `NHP-018-BOUND-01` = 共享 SSOT nail-only（可后做）。

### D2 FAULT 源冲突（matrix §1.0.1 **partial** vs NHP-018-FAULT-01 **case-only**）
**裁定：matrix FAULT 单元偏松/陈旧；gatherer 取更严 NHP case-only = 正确保守 · nail 对齐 SSOT（非 blocker）。**  
证据：NHP 行仍 `**blind**→**case-only**` · cite `—`（无 dual EOR）；Batch2 仅抬 `NHP-018-NEG-01` partial · **未**抬 FAULT；matrix 将 FAULT 写 **partial**（或随 GRAPH 旁抬）但 NHP 未同步。Gatherer :299 优先 NHP status → case-only。Nail：要么矩阵 FAULT 降回 case-only，要么 NHP+ dual cite 正当抬 partial。

### D3 OPEN-GAP 自指（本刀 `GAP-UC018-COVERED-CRITERION`）
**裁定：即使去掉 OPEN-GAP，verdict 仍 false（STATUS-NOT-COVERED / CASE-ONLY / PERF-LOCAL-ONLY / S11-NOT-MET 独立强制）· nail 在本刀 CLOSED 后从 openGaps 排除自指，避免永久假 · 非 blocker。**  
Mutation：`openGaps=[]` → 仍 `canHonestlyFlip=false` 且无 `OPEN-GAP`。

### D4 四枚举（STATUS-NOT-COVERED / MISSING-NHP / STUB-STACK / PROVE-FAIL）
**裁定：PASS · 均可达 · 不构成永久假。**  
- `STATUS-NOT-COVERED`：FX-MISS-NEG/ADV/PERF/LOAD + real · :122–124  
- `MISSING-NHP`：FX-MISS-BOUND · :128–134  
- `STUB-STACK`：无专用 FX · mutation `memorySaver=true` → 命中 :157–163 · ALL-MET 仍 true  
- `PROVE-FAIL`：无专用 FX · mutation `prove.exit=1` → 命中 :144–146  
**Nail（可选）**：补 `FX-STUB-STACK` / `FX-PROVE-FAIL`。

---

## Blockers

**无。**（true 可达 · guard trips b29c191 · 无手写列 status 冒充 · 无 covered 写入 · ADV 真 PG docker · 四 prove EXIT=0）

---

## Nail conditions（非阻塞 · 供后续 nail / SSOT）

1. D1：可选注册 `NHP-018-BOUND-01`（或保留 `waiting_user-CAS` pin 文档化）。
2. D2：对齐 matrix §1.0.1 FAULT vs NHP-018-FAULT-01（更严 case-only 为现状诚实）。
3. D3：本刀 nail CLOSED 后排除自指 OPEN-GAP，避免永久假信号。
4. D4：可选补 STUB-STACK / PROVE-FAIL fixture。
5. Gatherer：`businessPathMet` 正则仅匹配 ASCII `CLOSED` 且同行窗口 40；parent harness 多用「已关」→ 今日 `S11-NOT-MET` 偏严（其他理由已独立 false）· nail 扩展匹配。
6. P2 nail：`capacityRepresentative` / stack 从收据解析而非硬编码。

---

## Pins restated

- `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false`
- `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false`
- Matrix §1.1 UC-E2E-018 **partial** · Ban invent covered · Ban假关
- PG-retained（Postgres + pgvector + PostgresSaver）· Ban MemorySaver / MySQL / Qdrant-as-required
- **Dual PASS ≠ covered ≠ nail ≠ §1.1 flip** · GAP-UC018-COVERED-CRITERION 在 dual 完成前仍依 harness 生命周期 · 本专家 **未** 改 harness

---

## PG real

**YES** — `pnpm uc018:adv:prove` → `scripts/run-e2e-isolated.mjs` docker-run `pgvector/pgvector:pg16`（容器名形如 `meetwise-e2e-*-*`）· schema migrations 134 · **非** MemorySaver / MySQL / Qdrant。covered-criterion / reassess / matrix-cite 为静态/文档 prove · 不需 PG。

---

## secret scan

对本文件扫描 `password|secret|api[_-]?key|token|Bearer|AKIA|private[_-]?key|\.env`：仅文档禁令措辞 · **无真实凭据** · **CLEAN**。

---

## signature

**mw-rag-route** · 2026-09-23 (~20:25 PT) · post-prove dual · Verdict **PASS** · 单文件本 receipt · harness 未触 · tree 将 clean · Ban Meridian · Ban Cloud Agent · Ban `.env*` · Ban invent covered · Ban假关 · Ban forge peer · **Dual PASS ≠ covered ≠ nail ≠ §1.1 flip** · alone≠dual

---

## Re-review · C-GATHERER-REAL-INPUT (ca1c8a5/45a7bc1)

**Date**: 2026-09-23 (~20:40 PT)  
**Verdict**: **FAIL**（blocker：missing stack **default-to-met** · 与「absent→STUB-STACK」主张不符）  
**Expert**: `mw-rag-route` · Ban invent covered · Ban假关 · alone≠dual · **Dual PASS ≠ covered ≠ nail ≠ §1.1 flip**  
**Tips**: runner `ca1c8a5` / full `ca1c8a5b6848e0237a5f405113fc1dc4ed526e5d` Author `meetwise-core` · receipts `45a7bc1` / full `45a7bc1f829bde75bf6a4afdae4ed74387571bee` Author `meetwise-core` · receipt claims runner=`ca1c8a5` **MATCH** · peer nail-blocking `479cce5` noted  
**Worktree**: `git worktree add /workspace/wt-mwrr-ca1c8a5 45a7bc1` · `pnpm install --frozen-lockfile` · 四 prove 后 `worktree remove --force` + prune · **主 worktree 未扰**

### CMD|EXIT（@ worktree 45a7bc1）

| CMD | EXIT | 关键输出 |
|-----|------|----------|
| `pnpm uc018:covered-criterion:prove` | **0** | `canHonestlyFlip=false` · reasons=`STATUS-NOT-COVERED,UNCOMMITTED-RUNNER,MISSING-DUAL,CASE-ONLY,PROVE-FAIL,MISSING-RECEIPT,IMPL-ONLY,PERF-LOCAL-ONLY,OPEN-GAP` · `businessPathMet=true` · FX-STUB-STACK/FX-PROVE-FAIL PASS · FX-ALL-MET true |
| `pnpm uc018:covered-lift-reassess:prove` | **0** | canHonestlyFlip=false · PERF-LOCAL-ONLY · §1.1 partial |
| `pnpm uc018:adv:prove` | **0** | 76 PASS · isolated `releaseEvidence=false` · **REAL** `pgvector/pgvector:pg16` via `run-e2e-isolated` |
| `pnpm eval-harness-matrix-cite:prove` | **0** | UC-E2E-018 partial ≠ covered |

### Gatherer audit（`scripts/lib/uc-covered-real-gatherer.mjs`）

| 字段 | 来源（file:line） | hardcode? | fail-closed? |
|------|-------------------|-----------|--------------|
| `capacityRepresentative` | `capacityClaim === true` :298–298 · `pickCapacityRepresentative` :149–156 | **无**字面 `false` 赋给对象（absent→false via `=== true`） | **YES** absent≠true |
| `targetEnv` | `pickTargetEnv` :137–148 · caps.method docker→docker-isolated | **无**字面 `docker-isolated` 常量赋列 | **YES** absent→null |
| `exit` | receipt `exit`/`exitCode`/`exits[cmd]`/`allPass` :166–174 · else harness CMD|EXIT :299–301 | **无** `exit ?? 0` | **YES** null→evaluator PROVE-FAIL :147–149 |
| `committed` / sha | `git cat-file` + `merge-base --is-ancestor` :122–135 · `shaFlags` :235–245 | **无** `committed:true` | **YES** 无 sha→uncommitted |
| `stack` | `pickStack` :194–214 · absent→`undefined` 字段 | **无** `postgres:true` 字面 | **NO — BLOCKER**（见下） |
| `present`/`missing` | `receipt != null` :292 · :333–334 | **无** `present:true` | **YES** |

**P2 residual hardcodes（本轮）**: **无** capacity/stack/sha/exit 字面残留于 real-path 对象构造。注释 L297 提及 `capacityRepresentative: false` 仅为说明 · 非代码字面。

### BLOCKER — missing stack default-to-met

- Gatherer 主张（文件头 :39–42）：`absent → undefined fields → STUB-STACK`。
- Evaluator `badStack`（`uc-covered-evaluator.mjs` :157–163）仅在 `postgres === false` / `postgresSaver === false` / MemorySaver/MySQL/Qdrant true 时拒；**`undefined` 不触发**。
- 独立复现：ALL-MET 输入将 stack 全设 `undefined` → `canHonestlyFlip=true` · reasons=`[]`。
- Real ADV 列：`stack={}`（adv evidence 无 stack/soleStack）· 仅 `STATUS-NOT-COVERED` · **未**出 STUB-STACK。
- **裁定**：对 missing stack **default-to-met** = 本 re-review **FAIL blocker**（与 C-GATHERER「missing fail-closed」主张矛盾）。须 evaluator 将 `postgres!==true \|\| postgresSaver!==true`（或等价）纳入 STUB-STACK。

### `gapClosedInText` regex（:85–95）

| 样本 | 期望 | 实得 | 裁定 |
|------|------|------|------|
| `GAP-… **CLOSED**` / `CLOSED（GAP-…）` / `已关 · GAP` / `GAP…已关` | true | true | OK |
| `未关 GAP-…` / `GAP-… 未关` / `Ban假关 · GAP` | false | false | OK |
| `不得写已关 · GAP-UC018-FULL-E2E remains OPEN` | **false** | **true** | **FP**（`已关[^\n]{0,160}id` 吞掉「不得写已关」） |

Parent harness 无 `不得写已关` 字面 · 今日 `businessPathMet=true` 与 §1b#1–#6 真 CLOSED/已关一致 · **非本 blocker** · **nail**：排除否定语境（未关/不得写已关/Ban假关）。

### Fixtures

- `FX-STUB-STACK`：ADV `memorySaver:true`+`postgres:false` → false + STUB-STACK · **PASS**
- `FX-PROVE-FAIL`：NEG `exit:1` → false + PROVE-FAIL · **PASS**
- `FX-ALL-MET` true · temp-copy all-met on real-shape keys → true · **true 分支仍可达**

### Extra reasons 分列裁定

| 列/原因 | 裁定 | 证据 |
|---------|------|------|
| NEG **UNCOMMITTED-RUNNER** | **genuine（fail-closed）** | NEG 绑 `sole-stack-…-evidence.json`（:354）· 该 JSON **无** `gitSha` → `shaFlags` 无 sha → uncommitted :236；exit=0 来自 sole `exits[uc018:abandon:http:prove]` · 非假 EXIT |
| NEG **MISSING-DUAL** | **gatherer wiring 缺口（nail）** | dual 硬传 `{null,null}` :356；存在历史 dual 文如 `2026-09-10-uc-e2e-018-http-abandon-mw-e2e-ha.md` 未读 |
| BOUND **UNCOMMITTED-RUNNER** | **genuine（同 sole 无 gitSha）** | :374 同 sole receipt |
| BOUND **MISSING-DUAL** | **gatherer wiring 缺口（nail）** | dual null :376；waiting_user dual 文存在未读 |
| FAULT **PROVE-FAIL** | **null→PROVE-FAIL 语义 · 非 nonzero EXIT 实录** | FAULT `receipt:null` `cmd:null` :358–366 → `exit=null` → evaluator :147–149 推 PROVE-FAIL；**无** tracked nonzero EXIT。相关 GRAPH evidence `2026-09-23-uc-e2e-018-graph-safely-terminated-evidence.json` 含 `cmds.uc018:graph:prove:0` **未接线** → wiring 缺口（nail）· 非「伪造失败码」 |
| FAULT **MISSING-RECEIPT** | **genuine（对本 gatherer 路径）** | FAULT 显式 `receipt:null`；GRAPH 收据存在但未映射为 FAULT 列 |

### Receipt backfill 裁定

**单独 knife（非 nail）**。为 NEG/BOUND/FAULT 等旧刀补齐 machine-readable 字段（gitSha/stack/dual/exit）需在 committed runner 重跑 prove + dual 审那些收据 = **新证据**。Nail 仅可 **登记缺口** +（可选）把已存在 GRAPH 收据线到 FAULT / 修 dual 路径（SSOT 对齐 · 不发明新绿）。

### Blockers

1. **FAIL**：missing/`undefined` stack **不**触发 STUB-STACK → default-to-met（evaluator :157–163 vs gatherer 主张 :39–42）。

### Nail conditions（非本轮通过条件 · 供修复刀）

1. Evaluator：absent stack → STUB-STACK（`postgres!==true \|\| postgresSaver!==true`）。
2. `gapClosedInText`：拒「不得写已关 / 未关 / Ban假关」假阳性。
3. NEG/BOUND：接专用收据或至少读 http/waiting_user dual 审；勿长期借 sole 冒充 NEG 收据（exit 碰巧有 · sha 无）。
4. FAULT：接线 `graph-safely-terminated-evidence.json` + graph post-prove dual（或登记「无 FAULT 机读收据」缺口）。
5. 机读收据字段补齐 = **separate knife**（见上）。

### Pins / harness

- pins HOLD · UC-018 **partial** · 无 covered / §1.1 flip（本专家未改 matrix/harness）
- harness 状态未触 · **Dual PASS ≠ covered ≠ nail ≠ §1.1 flip**

### PG real / secret / cleanup

- **PG real YES**（adv → run-e2e-isolated → pgvector:pg16）
- secret scan：本节仅文档禁令措辞 · **CLEAN**
- worktree `/workspace/wt-mwrr-ca1c8a5` **已 remove --force + prune** · 主树未为本审改其他文件

### signature（re-review）

**mw-rag-route** · 2026-09-23 (~20:40 PT) · C-GATHERER-REAL-INPUT re-review · Verdict **FAIL** · blocker=missing-stack default-to-met · APPEND-ONLY 本节 · Ban Meridian · Ban Cloud Agent · Ban `.env*`

---

## Re-review round 2 (4a8a085/4706c4b)

**Date**: 2026-09-23 (~20:52 PT)  
**Verdict**: **FAIL**（blocker：`prove.committed` / `uncommitted` / `shaMatchesCommitted` 缺省仍可 MET · 非 positive-proof）  
**Expert**: `mw-rag-route` · Ban invent covered · Ban假关 · alone≠dual · **Dual PASS ≠ covered ≠ nail ≠ §1.1 flip**  
**Tips**: runner `4a8a085` / full `4a8a085ba31400b389b288e42557324a769cb5af` Author `meetwise-core` · receipts `4224e73` / full `4224e7386cb19b6bc948a24e76c2ae5ecd44a53a` + ADV append `4706c4b` / full `4706c4b447d33777f4339080e5812ba19d531693` Author `meetwise-core` · evidence `runnerCommitSha=4a8a085` **MATCH**  
**Worktree**: `/workspace/wt-mwrr-4a8a085` @ `4706c4b` · `pnpm install --frozen-lockfile` · 四 prove 后 remove --force + prune · 主树仅本 append

### f7f804b / 03449a8 stale SHA

| 检查 | 结果 |
|------|------|
| `git merge-base --is-ancestor f7f804b origin/feat/mysql-schema-skeleton` | **fail**（非 tip 祖先） |
| 本地 `git cat-file -t f7f804b` | 可能仍存 **orphaned** 对象（本机 cat 曾成功）· **非** origin 证据链 |
| tip `git grep f7f804b` | **仅** `covered-criterion-evidence.json:524` `rebaseNote`：「rewrote local f7f804b → origin 4a8a085 · supersedes 03449a8」 |
| `03449a8` | 曾把 `runnerCommitSha` 写成 `f7f804b…` · 已被 `4224e73`/`4706c4b` 以 `4a8a085` 重证取代 |

**裁定：ACCEPTABLE（void/superseded）** · tip 无 live `runnerCommitSha`/`gitSha` 消费 `f7f804b` · gatherer/evaluator 不读该 orphan · **非 blocker**。

### CMD|EXIT（@ worktree 4706c4b · porcelain=0）

| CMD | EXIT | 关键输出 |
|-----|------|----------|
| `pnpm uc018:covered-criterion:prove` | **0** | `canHonestlyFlip=false` · reasons=`STATUS-NOT-COVERED,UNCOMMITTED-RUNNER,MISSING-RECEIPT,CASE-ONLY,STUB-STACK,IMPL-ONLY,PERF-LOCAL-ONLY,OPEN-GAP` · `businessPathMet=true` · FAULT wired GRAPH tip `25d1900` · porcelain clean accepted + dirty DIRTY_TREE refuse · FX-STACK-*/EOR/EXIT/PROVE PASS |
| `pnpm uc018:covered-lift-reassess:prove` | **0** | false · PERF-LOCAL-ONLY · §1.1 partial |
| `pnpm uc018:adv:prove` | **0** | 76 PASS · **REAL** `pgvector/pgvector:pg16` docker ephemeral |
| `pnpm eval-harness-matrix-cite:prove` | **0** | UC-018 partial ≠ covered |

### Field-removal mutation（`/tmp/mwrr-field-removal.mjs` · 不入仓）

- **ALL-MET → true**（true 分支可达）
- 对六列逐字段 delete/undef（status/stack/exit/committed-forced-false/dual/eor/present/nhpIds）+ s11/openGaps/capacity：**89/89 PASS**（flip=false）· **0 blocker from that table**
- **额外探针（BLOCKER）**：仅删除 `prove.committed` / `uncommitted` / `shaMatchesCommitted` / `staleSha`（保留 exit=0、stack 全绿、eor=true、dual both）→ **`canHonestlyFlip=true`** · reasons=`[]`

### 字段检查分类（evaluator / gatherer）

| 字段 | file:line | 分类 |
|------|-----------|------|
| status === covered | evaluator :116–125 | fail-closed（≠covered → reason） |
| NHP ids 正向包含 | :127–134 | fail-closed |
| stack postgres/Saver **!== true**；mem/mysql/qdrant **!== false** | :163–172 | **fail-closed**（本轮已修 · 先验 PASS） |
| exit == null → MISSING-RECEIPT；!==0 → PROVE-FAIL | :147–151 | fail-closed |
| dual missing/one | :157–160 | fail-closed |
| eor **!== true** → MISSING-RECEIPT | :175–179 | fail-closed |
| present/missing | :180–182 | fail-closed |
| capacityRepresentative **=== true** + non-local + dual both | :99–104 | 大体 fail-closed；**`evidenceOfRecord === false` 才拒 · undef 仍可 capOk=true**（nail；列级 eor 已拦 meetsCovered） |
| businessPathMet **=== true** | :232 / :235 | fail-closed |
| openGaps length | :222–224 | fail-closed |
| gapClosedInText + banNear | gatherer :85–110 | fail-closed（不得写已关/未关/Ban/尚未关闭/not closed **PASS**） |
| DIRTY_TREE porcelain | gatherer :assertCleanPorcelain ~271 | fail-closed（prove 测 clean accept + dirty refuse） |
| **committed / shaMatchesCommitted** | evaluator :140–145 | **default-met BLOCKER**：仅在 `=== false` / `uncommitted === true` 时拒 · **缺省 undefined 不拒** |
| FAULT ← GRAPH `25d1900` | gatherer :337–360 + columns FAULT | **真实接线**（tipOk+cmds.graph=0 → wired；无 stack → STUB-STACK） |
| NEG/BOUND dual | sole+waiting reviews :318–328 | fail-closed 读取 · dual PASS 本跑 |
| pg+pgvector→Saver 推断 | parseSoleStack :196–210 | **已移除** · 仅 `/postgressaver/` 显式 token |

### Fixtures / regex

- `FX-STACK-MISSING` / `FX-STACK-EMPTY` / `FX-EOR-MISSING` / `FX-EXIT-MISSING` / `FX-EXIT-ABSENT` / `FX-PROVE-FAIL` / `FX-STUB-STACK` / `FX-ALL-MET`：**全部 PASS**（期望 reason 命中）
- gapClosed 否定含 `不得写已关` · `未关` · `Ban假关` · `尚未关闭` · `not closed`：**全部 PASS**

### FAULT / DIRTY_TREE

- FAULT：`faultReceiptNote=wired GRAPH evidence (tip 25d1900 committed+ancestor; cmds present; no stack => STUB-STACK)` · dual graph post-prove PASS · exit=0 from `cmds['uc018:graph:prove']` · **非**伪造 nonzero
- DIRTY_TREE：clean accept · dirty refuse · 本跑 porcelain=0 未误拒

### Blockers

1. **FAIL**：evaluator 对 `prove.committed` / `shaMatchesCommitted` **未**要求 `=== true`（:140–145）· 字段缺省 → 仍可 ALL-MET true（独立复现）。须改为 positive-proof（例：`committed !== true \|\| shaMatchesCommitted !== true` → UNCOMMITTED-RUNNER；无 sha 同理）。

### Nail conditions（非本 FAIL 主因 · 可并修）

1. `isCapacityRepresentative`：`evidenceOfRecord` 应 `!== true` 即拒（今日仅 `=== false`）。
2. `pickGitSha` 未读 GRAPH `requestTip` → FAULT/NEG 常 `gitSha=null`→UNCOMMITTED（保守 · 可纳 `requestTip`）。
3. `covered-criterion-prove.md` 文首仍钉 `ca1c8a5` · 与 evidence `4a8a085` 漂移（以 JSON `runnerCommitSha` 为准 · 文档对齐 nail）。
4. 旧刀机读字段补齐（stack/eor/gitSha）仍属 **separate knife** / GAP-UC018-RECEIPT-BACKFILL。

### Pins / PG / secret / cleanup

- pins HOLD · §1.1 partial · 无 covered flip · harness 未触  
- **PG real YES**（adv docker `pgvector/pgvector:pg16`）  
- secret scan：本节仅禁令措辞 · **CLEAN**  
- worktree **已移除** · 主树仅本文件 append

### signature（r2）

**mw-rag-route** · 2026-09-23 (~20:52 PT) · re-review round 2 · Verdict **FAIL** · blocker=committed-flags default-met · APPEND-ONLY · Ban Meridian · Ban Cloud Agent · Ban `.env*` · **Dual PASS ≠ covered ≠ nail ≠ §1.1 flip**

---

## Re-review r3 (28dc259/10bf0c0)

**Date**: 2026-09-23 (~21:00 PT)  
**Verdict**: **PASS**（r2 blocker 已修 · allowlist 7 项可接受 · 无新 default-met blocker）  
**Expert**: `mw-rag-route` · Ban invent covered · Ban假关 · alone≠dual · **Dual PASS ≠ covered ≠ nail ≠ §1.1 flip**  
**Line A commits**（均为 Author `meetwise-core` · 单目的 · tip 祖先）:
| SHA | Subject | files |
|-----|---------|-------|
| `4a8a085` / `4a8a085ba31400b389b288e42557324a769cb5af` | fail-closed stack/EOR/exit/gapClosed/dual | 13 scripts/fixtures |
| `4224e73` / `4224e7386cb19b6bc948a24e76c2ae5ecd44a53a` | fix-round-2 re-prove @4a8a085 | 3 receipts/harness |
| `4706c4b` / `4706c4b447d33777f4339080e5812ba19d531693` | ADV prove EXIT=0 @4a8a085 | 2 |
| `28dc259` / `28dc25947baad0f3a377d2961fa38fb6a25b915b` | r3 committed-proof + strict dual | 38 UC018-covered only |
| `10bf0c0` / `10bf0c0d4a8bd2631202158baa4af41a3fa4d4ae` | fix-round-3 prove @28dc259 | 4 |

**Receipt SHA match**: evidence JSON + prove.md 均钉 `28dc25947baad0f3a377d2961fa38fb6a25b915b` · **MATCH**  
**Worktree**: `/workspace/wt-mwrr-28dc259` @ `10bf0c0` · 四 prove 后 remove+prune

### CMD|EXIT

| CMD | EXIT | 关键输出 |
|-----|------|----------|
| `pnpm uc018:covered-criterion:prove` | **0** | false · reasons=`STATUS-NOT-COVERED,UNCOMMITTED-RUNNER,MISSING-RECEIPT,CASE-ONLY,STUB-STACK,MISSING-DUAL,IMPL-ONLY,PERF-LOCAL-ONLY,OPEN-GAP` · businessPathMet=true · leaf-mutation 405/405 allowlisted · dual retracted/path-suffix PASS · .tmp-only write · porcelain clean |
| `pnpm uc018:covered-lift-reassess:prove` | **0** | |
| `pnpm uc018:adv:prove` | **0** | 76 PASS · REAL pgvector docker isolated |
| `pnpm eval-harness-matrix-cite:prove` | **0** | UC-018 partial≠covered |

### Mutation（`/tmp/mwrr-r3-mutation.mjs`）

- ALL-MET → **true**
- 删除 `prove.cmd` **且** `prove.gitSha` → **false** + MISSING-RECEIPT
- 仅删 cmd 或仅删 gitSha → true（OR allowlist）
- committed/shaMatches/uncommitted/staleSha undef → **false**（r2 blocker **CLOSED**）
- `section11.status` = undef/`''`/`partial`/`unknown`/`met`/`covered` → flip 仍 true（见下裁定）· `case-only` 推 CASE-ONLY reason 但 **不**改 flip（nail）
- PERF/LOAD 删 capacityRepresentative 或 targetEnv → **false** + PERF-LOCAL-ONLY
- NEG/ADV 同字段删除 → true（allowlist · 非 PERF/LOAD）
- prove 内置 leaf-mutation：**405/405 false · 0 unallowlisted**

### Allowlist 分项裁定

1. **ucId** — **ACCEPTABLE**。仅标签 · `evaluate` 不读其做门闩（删除仍 true · 无 gating）。
2. **capacityRepresentative / targetEnv（NEG/FAULT/BOUND/ADV）** — **ACCEPTABLE**。capacity 仅 PERF/LOAD 列调用 `isCapacityRepresentative`（evaluator :186–190）；PERF/LOAD 删除同字段 → false+PERF-LOCAL-ONLY（已证）。非 PERF/LOAD 列不要求容量证据（§0.5/§1.0）。
3. **prove.cmd / prove.gitSha OR** — **ACCEPTABLE**。`:153` 仅当 `!cmd && !gitSha && status==='covered'` 才 MISSING-RECEIPT；删两者 → false；单留其一不绕过 exit/committed 正证（exit/committed 独立检查）。缺 cmd 有 gitSha = 可接受（nail 可选：强制 cmd）。
4. **implementerOnly 仅 `=== true` 拒** — **ACCEPTABLE（冗余）**。`eor !== true` → MISSING-RECEIPT（:182）；dual 缺槽 → MISSING-DUAL（:83–91 `!present(a)\|\|!present(b)`）；IMPL-ONLY 为 implementer 标签加码 · 双 PASS+eor 正证已 fail-closed。
5. **section11.status** — **ACCEPTABLE · 非 §1.1 default-met blocker**。§1.1 门闩是 **`businessPathMet === true`**（:237 / :246）+ gatherer `gapClosedInText`；删 `businessPathMet` → S11-NOT-MET false。`status` 不驱动 flip；`case-only` 仅 push reason 不翻 false（**nail**：对齐或删除死分支）。

### Strict dual parser

- 末行 `Verdict: PASS|FAIL`（可选粗体 · **禁**同行尾注）· 角色仅 path suffix `-mw-e2e-ha.md` / `-mw-rag-route.md`
- FX-DUAL-RETRACTED：末行 FAIL → DUAL-ONE · PASS
- FX-DUAL-SINGLE-FILE-NAMES-PEER：body 提 peer 名不填槽 → MISSING-DUAL · PASS
- 本文件此前仅有 `**Verdict**: **PASS**（…）` 尾注行 · **严格解析 = null**；本节末将写裸 `Verdict: PASS` 供后续 gatherer 读取

### PERF/LOAD MISSING-DUAL

- 实跑 PERF/LOAD `dual={null,null}` · 旧 post-prove 文有表格/散文 Verdict **无**严格单行 → fail-closed **正确**
- **裁定：属 backfill knife**（勿改旧 receipt 洗绿）· 登记 GAP 即可

### Blockers

**无。**（committed 正证已落地 · mutation/allowlist 与主张一致 · prove EXIT=0 · 真 PG · 无 covered/§1.1 flip）

### Nail conditions

1. `section11.status==='case-only'` 推 reason 但不阻 flip — 对齐或删除。
2. 可选强制 `prove.cmd`（不只 gitSha）。
3. PERF/LOAD 严格 Verdict 行 = backfill knife（不改旧文）。
4. `section11.openGaps` 缺省≡`[]`（空集语义）· 可文档化。

### Pins / PG / secret / cleanup

- pins HOLD · Dual PASS ≠ covered ≠ nail ≠ §1.1 flip · harness 未触  
- **PG real YES** · secret **CLEAN** · worktree **已移除**

### signature（r3）

**mw-rag-route** · 2026-09-23 (~21:00 PT) · re-review r3 · 无 blocker · APPEND-ONLY · Ban Meridian · Ban Cloud Agent · Ban `.env*`

Verdict: PASS

## Re-review r3 · 更正（mw-rag-route 本人复核源码后撤回上方 r3 PASS）

复核 `28dc259:scripts/lib/uc-covered-evaluator.mjs` :232–246：

- :240–242 当 `section11.status === 'case-only'` 时写入 `CASE-ONLY` refuse reason；
- 但 :246 `canHonestlyFlip = allColsMet && s11.businessPathMet === true && openGaps.length === 0` **不看 reasons、不看 status**。

后果：六列全部 meetsCovered、businessPathMet=true、无 openGaps，但 matrix §1.1 单元仍是 case-only 时，evaluator 返回 **`canHonestlyFlip=true` 且 reasons 含 `CASE-ONLY`**。这是自相矛盾的输出，而且 true 分支在 §1.1 SSOT 仍为 case-only 时可达，属于假关风险，落在本刀要堵的 true 路径上。上一轮子审把它列成了 nail（「status case-only reason↔flip mismatch」），本人判为 **BLOCKER**。

修法（任选其一，建议两者都做）：
1. `canHonestlyFlip` 另加 `reasons.length === 0`（即任何 refuse reason 都会阻止翻转），或显式要求 `s11.status` 为正向枚举（非 case-only、非 partial）；
2. 新增 FX-S11-STATUS-CASE-ONLY：ALL-MET + `section11.status='case-only'` 必须返回 false，并带 `CASE-ONLY`；再加一条全局不变量断言：`canHonestlyFlip === true` 时 `reasons` 必须为空。

nail（非阻塞，维持）：`openGaps` 缺失在 evaluator 里等同于 `[]`（:233）属于「缺失即达标」；真实 gatherer（:533）总是会构造数组，所以真实路径不受影响，但应改为缺失时 fail-closed 或补 fixture。其余 r3 结论（四个 prove EXIT=0、真实 PG、白名单 1–5 裁定、严格 parser、PERF/LOAD MISSING-DUAL 归补录刀）不变。

Pins 不变：NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained。未写 covered，未翻 §1.1。

**mw-rag-route** · 2026-09-23 (~21:05 PT) · r3 更正 · APPEND-ONLY · 以本行下方的严格 Verdict 为准

Verdict: FAIL

---

## Re-review r4 (b97de26/585006b)

**Date**: 2026-09-23 (~21:10 PT)  
**Verdict**: **FAIL**（blocker：HTML 多行注释内 `Verdict: PASS` 仍被解析为 PASS · fence/strip 未覆盖 HTML comment）  
**Expert**: `mw-rag-route` · Ban invent covered · Ban假关 · alone≠dual · **Dual PASS ≠ covered ≠ nail ≠ §1.1 flip**  
**Tips**: runner `b97de26` / full `b97de26e25f71bef357585ed98153897d31f1af3` Author meetwise-core · receipts `585006b` / full `585006b2012d5e4ae230126aecedbc286e2a3da2` Author meetwise-core · JSON+prove.md runner **MATCH**  
**843b8ca**: intermediate Author meetwise-core · tip 仅 lineage/`rebase` 旁引 + 无关 privacy 审查提及 · **非** `runnerCommitSha` · gatherer 不消费为证据 · **ACCEPTABLE superseded**  
**Worktree**: `/workspace/wt-mwrr-b97de26` @ `585006b` · 后 remove+prune

### CMD|EXIT

| CMD | EXIT | 关键 |
|-----|------|------|
| `pnpm uc018:covered-criterion:prove` | **0** | false · reasons 含 STATUS-NOT-COVERED,UNCOMMITTED-RUNNER,MISSING-RECEIPT,CASE-ONLY,STUB-STACK,MISSING-DUAL,IMPL-ONLY,PERF-LOCAL-ONLY,OPEN-GAP,S11-NOT-MET · invariant OK · .tmp-only |
| `pnpm uc018:covered-lift-reassess:prove` | **0** | dirty DIRTY_TREE refuse PASS · clean accept |
| `pnpm uc018:adv:prove` | **0** | 76 · REAL pgvector docker |
| `pnpm eval-harness-matrix-cite:prove` | **0** | |

### Flip logic（`uc-covered-evaluator.mjs`）

- Positive §1.1 status enum：**仅** `covered`（大小写不敏感 · `:261–267`）· **不含** case-only/partial/unknown/empty/met
- flip 条件 `:270–276`：`allColsMet && businessPathMet===true && openGapsPresent && openGaps.length===0 && s11Status==='covered' && reasons.length===0`
- **Invariant 在代码内强制**：`reasons.length>0 ⇒ flip=false`（:279–280,:300）+ **throw** 若 true∧reasons（:282–286,:301–302）+ `assertFlipReasonsInvariant`（:312+）· **非**仅测断言
- openGaps 缺省/非数组 → `OPEN-GAP-UNKNOWN`（:248–251）· **已修** r3 nail

### Mutation（`/tmp/mwrr-r4-audit.mjs`）

- ALL-MET **true** · reasons=[] · invariant OK
- status undef/''/case-only/partial/unknown/PARTIAL/met → **false**；`covered`/`COVERED` → true；`' covered '`（含空格）→ false（过严 nail）
- openGaps delete/null/string/{} → OPEN-GAP-UNKNOWN false；`[GAP]` → OPEN-GAP；`[]` → true
- case-only → false + S11-NOT-MET|CASE-ONLY（**r3 blocker CLOSED** · 不再 true+reasons）
- leaf delete stillTrue ⊆ 4-item allowlist · invBreak=0 · true⇒reasons empty 全覆盖
- PERF cap delete → false；NEG cap delete → true（allowlist）

### Allowlist（4）裁定

1. **ucId** — ACCEPTABLE（标签 · 无门闩）
2. **capacity/targetEnv on NEG/FAULT/BOUND/ADV** — ACCEPTABLE（capacity 仅 PERF/LOAD；PERF 删除失败已证）
3. **implementerOnly** — ACCEPTABLE（仅 ===true 加 IMPL-ONLY；eor/dual 已正证 fail-closed）
4. （cmd/gitSha OR 已移除 · 现两者皆需 `:169–173`）

### Dual break attempts

| 尝试 | 结果 |
|------|------|
| 缩进 4 空格 / `>` blockquote / ``` / ~~~ fence | null · PASS |
| 单行 HTML 注释包裹的 PASS 行（注释起止标记 · 不写字面量） | null · PASS |
| **多行 HTML 注释包裹的 PASS 行（注释起止标记 · 不写字面量）** | **got=PASS · BYPASS · BLOCKER** |
| trailing / lower / 全角冒号 / ZWSP | null · PASS |
| CRLF 真 PASS | PASS · OK |
| PASS then FAIL | FAIL · OK |
| (b) 最新 author≠role（evil） | slot null · PASS |
| (c) 早 impl、最新 reviewer | 取最新 author → PASS · OK |
| (d) 同捆 race：e2e-ha 文件 author=mw-rag-route | e2eHa **null**（拒跨角色）· fail-closed OK |

### Binding / allPass / lift dirty

- `verifiedSha === prove.gitSha`（前缀相容）· 否则 UNCOMMITTED-RUNNER · FX-VERIFIEDSHA-MISMATCH PASS
- `allPass` 不再发明 exit · `pickExitFromReceipt` 仅数值字段 · FX-ALLPASS-NO-EXIT → MISSING-RECEIPT PASS
- lift-reassess：dirty → DIRTY_TREE refuse PASS

### Parser on our file（pre-append @585006b）

- `parseReviewFileVerdict` → **FAIL**（74cf87e 严格行）
- `latestCommitAuthor` → mw-rag-route · dual slot ragRoute=FAIL · role=ragRoute **OK**

### Blockers

1. **FAIL**：`stripMarkdownNonProse` 未剥离 HTML comment · 多行 HTML 注释包裹的 PASS 行仍计 PASS（`uc-covered-real-gatherer.mjs` 当时 `:265–278`）。须剥离 HTML 注释块（含跨行）后再匹配。

### Nail

1. status `' covered '`（首尾空白）不过正证 · 可选 trim
2. PERF/LOAD 旧 dual 无严格行 → MISSING-DUAL（backfill knife · 勿改旧文）

### Pins / PG / secret / cleanup

- pins HOLD · Dual PASS ≠ covered ≠ nail ≠ §1.1 flip  
- **PG real YES** · secret **CLEAN** · worktree **已移除**

### signature（r4）

**mw-rag-route** · 2026-09-23 (~21:10 PT) · re-review r4 · blocker=HTML-comment Verdict bypass · APPEND-ONLY

Verdict: FAIL

---

## Re-review r5 (22790a8/971bb80)

**Date**: 2026-09-23 (~21:18 PT)  
**Verdict**: **PASS**（r4 HTML 注释 bypass 已关 · last-line-only + HTML/fence 防御 · 本文件已中和 r4 字面注释样例以免自毒）  
**Expert**: `mw-rag-route` · Ban invent covered · Ban假关 · alone≠dual · **Dual PASS ≠ covered ≠ nail ≠ §1.1 flip**

### Commits（Author meetwise-core · tip 祖先 · 单目的）

| SHA | Subject |
|-----|---------|
| `4e39b78` / `4e39b783e7bc1b7d6ef8242f471c67379257965d` | r5 last-line Verdict parser + HTML comment defense |
| `476d1fd` / `476d1fd259c4ba80a378d441b28626d44b0be4c2` | prove expect sole dual MISSING under last-line |
| `22790a8` / `22790a8dfb23604c4f47574b91d178e737f946a5` | r5b unterminated-fence + HTML-ML |
| `07659ee` | receipts @476d1fd（中间） |
| `971bb80` / `971bb80ca1c71fc60f14189d5e8a4ce57c1afd90` | receipts prove @22790a8 · JSON+prove.md runner **MATCH** |

**Worktree**: `/workspace/wt-mwrr-22790a8` @ `971bb80` · 后 remove+prune

### Receipt-fix approach

Gatherer 用 **精确路径**（非 glob）：`…covered-criterion-post-prove-mw-rag-route.md`。故在本文件内中和，不另开 r5 文件。

**本提交对既有 r4 节的最小改写**（历史 SHA `f4abf1b` 仍为权威原貌）：
- 原表格/ blocker 中含字面 HTML 注释起止标记 + 其内 `Verdict: PASS` 的三处样例 → 改为散文「多行/单行 HTML 注释包裹的 PASS 行（不写字面量）」
- 语义不变 · 仅为 parser 防御 · 避免整文件被 `htmlCommentDefenseFails` 判 null
- 未改其他章节正文

### CMD|EXIT（@ 971bb80）

| CMD | EXIT |
|-----|------|
| `pnpm uc018:covered-criterion:prove` | **0** · false · MISSING-DUAL 等 · invariant OK · .tmp-only |
| `pnpm uc018:covered-lift-reassess:prove` | **0** |
| `pnpm uc018:adv:prove` | **0** · 76 · REAL pgvector |
| `pnpm eval-harness-matrix-cite:prove` | **0** |

### Parser contract（`uc-covered-real-gatherer.mjs` ~:246–340）

- 仅 **最后非空行**（去尾空白/CR）匹配 `^(\*\*)?Verdict: (PASS|FAIL)(\*\*)?$` · 粗体成对
- 全文任意未闭合 HTML 注释起止 / 注释块内含 Verdict 行 → **null**
- 未闭合 ```/~~~ fence → **null**
- 角色：path suffix + latest git author

### Break attempts（/tmp · 自 22790a8 模块）

| 尝试 | 结果 |
|------|------|
| 末行真 PASS/FAIL / CRLF / 尾空白 / 成对粗体 / front-matter | 正确 PASS/FAIL |
| 缩进 4 空格末行 / blockquote / 表格单元格 / 未闭合 fence / 不成对粗体 | null |
| PASS 后跟 ZWSP 行 / PASS 后接 ZWSP 字符 | null |
| 已闭合无 Verdict 的注释 + 末行 PASS | PASS（不过严） |
| 早先注释内含 PASS + 末行 FAIL | null（fail-closed · 见下） |
| setext 下划线在 Verdict 后 | null（下划线成末行） |
| 未闭合 details + 末行 PASS | PASS（details≠注释 · nail 可选） |
| evil author | slot null |

**null⇒阻 flip**：ALL-MET 双槽 null → false + **MISSING-DUAL**（已证）。故「被注毒的 FAIL」变 null 只会 MISSING-DUAL，**绝不变 PASS**。

### Mutation / invariant

- 宣称 423/423 · allowlist 4 · 本轮抽检 ALL-MET true · null dual false · FX HTML/HIDDEN/TRAILING/DETAILS/UNBALANCED/UNTERMINATED/HTML-ML → MISSING-DUAL · invariant OK

### Blockers

**无。**（r4 HTML 多行注释 bypass 已关 · 本文件注释样例已中和 · prove EXIT=0 · 真 PG）

### Nail

1. 未闭合 details 不 fail-closed（末行 PASS 仍计）— 可选加固
2. 注释内曾有 Verdict 会 null 掉其后真 FAIL（fail-closed 保守 · 审者勿在注释写 Verdict）
3. PERF/LOAD 旧 dual 无末行严格 Verdict → MISSING-DUAL（backfill knife）

### Pins / PG / secret / cleanup

- pins HOLD · Dual PASS ≠ covered ≠ nail ≠ §1.1 flip  
- **PG real YES** · secret **CLEAN** · worktree **已移除**

### signature（r5）

**mw-rag-route** · 2026-09-23 (~21:18 PT) · re-review r5 · PASS · APPEND-ONLY + r4 样例中和披露

Verdict: PASS


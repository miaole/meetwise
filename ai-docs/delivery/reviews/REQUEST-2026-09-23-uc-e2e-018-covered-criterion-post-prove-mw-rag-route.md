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

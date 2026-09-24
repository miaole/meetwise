# REQUEST — **UC-E2E-018 COVERED-CRITERION · GAP-UC018-COVERED-CRITERION** · pre-exec dual · `mw-rag-route`

**Verdict**: **PASS**（附 post-prove 非阻塞条件 · **无 pre-exec blocker**）  
**Expert / Author**: `mw-rag-route`（域：RAG/route · claim-boundary honesty · Ban invent covered · Ban假关 · Ban假绿 · Ban wash constant-false into「已评估不可翻」· Ban peer authorship · 未写/未改 `mw-e2e-ha` receipt · alone≠dual）  
**Date**: 2026-09-23 (~20:09 PT)  
**Knife**: UC-E2E-018 COVERED-CRITERION · `GAP-UC018-COVERED-CRITERION` · docs REQUEST · **pre-exec dual** · plan `pnpm uc018:covered-criterion:prove`（**not_run** this open · Ban prove-as-acceptance · Ban coding this open）  
**Branch**: `feat/mysql-schema-skeleton`（historical name only · Ban MySQL cutover justification）  
**Pair**: `REQUEST-2026-09-23-uc-e2e-018-covered-criterion-mw-e2e-ha.md`（peer stub PENDING · **未触** · Ban forge peer）  
**Harness left**: `draft:awaiting_pre_exec_dual` · **未改 harness / slice / scripts / matrix** · Ban self-nail · Dual PASS ≠ coding ≠ UC-E2E-018 covered ≠ §1.1 flip ≠ next knife ≠ nail  
**ZERO peer forge**: confirmed · 仅写本文件 · Ban Meridian · Ban Cloud Agent · Ban `.env*` · Ban coding · Ban invent covered · Ban假关

---

## Verdict

**PASS**。REQUEST tip `5afd399`（Author `meetwise-core` / mw-core · docs only）满足 e33dd63 携带条件的 **L0 设计面**：书面 partial→covered 准则 + 可计算六列 `evaluate`（true 可达）+ 无硬编码 refuse + 静态源扫描+行为 fixture 护栏 + 硬规则本刀不翻 UC-018/§1.1。pins HOLD。**无 pre-exec blocker**。下列为 coding/prove 阶段须落实的 **post-prove 非阻塞条件**（未满足则 post-prove 不得 PASS）。

**硬读**：Dual PASS ≠ coding · ≠ prove-as-acceptance · ≠ UC-E2E-018 covered · ≠ §1.1 flip · ≠ next knife · ≠ self-nail · alone≠dual。本专家 **未** 跑 prove、**未** 改 harness、**未** 触 peer、**未** 读 `.env*`、**未** 启 Cloud Agent。

---

## tip audited

| 项 | 证据 | 裁定 |
|----|------|------|
| REQUEST tip | full `5afd3992e6152f9817b62bc03f684b8352fea4f8` / short `5afd399` · branch `feat/mysql-schema-skeleton` | **MATCH**（= HEAD） |
| `git fetch` + `git pull --ff-only` | already up to date · working tree clean | **PASS** |
| tip 存在且为 HEAD 祖先 | `merge-base --is-ancestor 5afd399 HEAD` exit **0** · tip = HEAD | **PASS** |
| Author / subject | Author `meetwise-core <meetwise-core@users.noreply.github.com>` · `docs(e2e): REQUEST UC018 covered-criterion (pre_dual)` | **PASS**（mw-core） |
| files changed（`git show --stat 5afd399`） | 4 files · +322 · 全部 `ai-docs/`：harness · slice · 两份 dual stub | **docs-only PASS** |
| 祖先钉 | `f886ea5` / `b29c191` / `5cddb53` / `e33dd63` 均为 HEAD 祖先 | **PASS** retained |

---

## 携带条件对照（e33dd63）

e33dd63 携带条件：后续任何 covered-lift / §1.1 flip 刀 **必须先**恢复「由矩阵 §0.5/§1.0 六列真实计算、**可以返回 true**」的判定并经 dual；Ban 把 `b29c191` 常量 false 洗成「已评估不可翻」。

| 要求 | 本 REQUEST 是否回答 | 证据 |
|------|---------------------|------|
| 书面 covered 准则 | **YES** | harness §1.1–§1.4 |
| 可计算六列 evaluator · CAN true | **YES（设计）** | harness §2 + FX-ALL-MET |
| 无硬编码 refuse | **YES（设计）** | harness §2「No hardcoded refuse」· Ban `canHonestlyFlip = false` constant |
| dual 审查本 restore | **本开即** | pre-exec dual · 本 receipt |
| 本刀本身不翻 §1.1 | **YES** | harness §0 Hard rule · §1.4#4 · §6 A6 |

本刀 = 携带条件的 **L0 restore REQUEST**（criterion + evaluator plan）· coding+prove = L2 under authorize · **仍 Ban** 在本刀内翻 UC-018/§1.1。

---

## Focus 1 — 携带条件：可计算六列 · CAN true · 无硬编码 refuse · 护栏

| 检查 | 证据（file:line 摘录） | 裁定 |
|------|------------------------|------|
| 书面准则 | harness §1.1–§1.4：列 covered iff NHP+prove EXIT=0@committed SHA+dual BOTH PASS+real PG/PostgresSaver；UC covered iff 六列全 meetsCovered + §1.1 business path + no open GAP | **PASS** |
| CAN return true | harness:130 `FX-ALL-MET` → `canHonestlyFlip=true`；§2:120「true branch **must** be reachable under all-met fixture」 | **PASS** |
| 无硬编码 refuse | harness:120「**Ban** `canHonestlyFlip = false` constant · **Ban** unreachable true branch」 | **PASS** |
| 护栏具体度 | harness:142「prove **FAIL**s if evaluator source contains a constant-false return / unreachable true branch（**regex/static check** on `uc-covered-evaluator.mjs` + reassess caller）」+ FX-ALL-MET 行为证明 | **PASS（adequately specified for L0）** |
| 对照已知缺陷 | `scripts/uc-e2e-018-covered-lift-reassess.proof.mjs:196` `let canHonestlyFlip = false` 永不置 true；`:211` 无条件 `refuseReasons.push('reassess-knife-refuses-§1.1-flip')` — 本刀明确以 `5cddb53` 为 restore 目标、以 `b29c191` 为 regression pin · Ban 引用为 assessment | **PASS** |

**非阻塞**：coding 时护栏 regex 须**显式**覆盖（a）`canHonestlyFlip` 初始化 false 后无任何 true 赋值；（b）无条件 refuse push（如 `reassess-knife-refuses`）；（c）true 分支不可达的控制流。见 post-prove 条件 P1。

---

## Focus 2 — Evaluator `scripts/lib/uc-covered-evaluator.mjs` 设计

| 检查 | 证据 | 裁定 |
|------|------|------|
| 纯函数 · 无 IO/副作用 | harness:116–119 `evaluate(input)` ·「no wall-clock · no network · no git spawn inside `evaluate`（caller may gather）」 | **PASS** |
| 每列 reasons | harness:117 `columns: { [col]: { status, meetsCovered, reasons: string[] } }` + top-level `reasons[]` | **PASS** |
| 输入来自真实矩阵/NHP/receipts | harness:122「Gather **live** matrix/NHP/harness/receipt facts → `evaluate`」；input shape 含 status/nhpIds/prove/dual/stack/receipts/section11 | **PASS（设计意图）** |
| 手写常量风险 | harness:118「Structured JSON（preferred）**or** parsed …」— fixture 合成输入合法；若 real-matrix **caller** 把列状态写死在脚本内则违规 | **FLAG（非 blocker）** → post-prove P2：real-matrix gatherer **必须**解析 tracked 文件，Ban 在 gatherer/evaluator 内重述矩阵常量 |

---

## Focus 3 — Fixtures 双向覆盖

| Fixture | 期望 | 裁定 |
|---------|------|------|
| `FX-ALL-MET` | true | **有** · true 可达 |
| `FX-MISS-{NEG,FAULT,BOUND,ADV,PERF,LOAD}` | false + 对应列 reason | **有** · 六列负向齐 |
| `FX-OPEN-GAP` / `FX-S11-NOT-MET` / `FX-IMPL-ONLY` / `FX-PERF-LOCAL-ONLY` | false + 对应 reason | **有** |
| keep-partial 已写但未命名 fixture | stale gitSha 不匹配 · dual 仅一侧 PASS · missing receipts | harness §1.3:91–92 已强制 keep-partial · **fixture 表未单列** |

**双向覆盖 adequacy**：**正向 true + 六列 miss + UC 级 miss + local-only + impl-only = adequate for L0**。缺失的命名负向（stale SHA / dual-one / missing receipts）记 **post-prove P3**（编码时补 FX 或并入现有 fixture 行为断言）· **非 pre-exec blocker**。

---

## Focus 4 — local-only PERF/LOAD cap

| 检查 | 证据 | 裁定 |
|------|------|------|
| cap 合理 | harness §1.2 + cite `testing/e2e-performance-evidence.md` §3 · local ≠ 线上 SLO ≠ 容量 ≠ HA · 与矩阵 §0.5 / PERF-LOAD nail 一致 | **PASS · reasonable** |
| 非永久 false 伪装 | capacity-representative = 声明 target env + caps 对齐 sizing SSOT（W2 / W0 §2）+ 该 env 上 dual EOR；`FX-ALL-MET` 含 capacity-representative PERF/LOAD → true 路径可达 | **PASS · concretely reachable later** |
| UC 不能仅靠 local 变 covered | harness:81「**UC-E2E-018 cannot become covered on local evidence alone**」 | **HOLD** |

---

## Focus 5 — Hard rules / pins / 成功标准 / 状态机 / 反假关

| 检查 | 证据 | 裁定 |
|------|------|------|
| 本刀不翻 UC-018 / §1.1 | harness §0 Hard rule · §1.4#4 · §6 A6 · slice 贯穿 | **PASS** |
| Real Postgres only | harness:60 Ban MemorySaver/MySQL/Qdrant · Critical stack pin `adr-postgres-retained.md` | **PASS** |
| pins | haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · §1.1 partial | **HOLD**（harness §8 / slice Hard pins） |
| prove CMD + EXIT | harness §4 `pnpm uc018:covered-criterion:prove` · EXIT=0 iff fixtures + real-matrix computed（非 constant-false）+ guard · Ban matrix flip | **PASS（plan defined）** |
| harness 状态转移 | L0 `draft:awaiting_pre_exec_dual` → L1 dual → L2 authorize coding+prove → covered-lift = **separate later knife** | **sane PASS** |
| 无假关/假绿/自批 | Ban自批 · dual stubs PENDING not pre-filled · Dual PASS ≠ covered · expected real-matrix `canHonestlyFlip=false`（expectation）· implementer-only ≠ EOR | **PASS** |

---

## Blockers

**无 pre-exec blocker。**

---

## Post-prove conditions（非阻塞 · coding/prove 必达）

1. **P1 Guard 具体化**：静态扫描须 FAIL 于（a）`canHonestlyFlip` 常量 false / 无 true 赋值；（b）无条件 refuse push（对照 `proof.mjs:211`）；（c）true 不可达。FX-ALL-MET 行为断言保留。
2. **P2 Real-matrix 输入诚实**：gatherer 从 tracked matrix / NHP / harness / dual receipts **解析**事实；Ban 在 gatherer 或 evaluator 内手写列 status 常量冒充「计算」。
3. **P3 补负向 fixture（或等价断言）**：至少覆盖 stale `gitSha` 不匹配、dual 仅一侧 PASS、关键 receipts 缺失（可并入 FX-IMPL-ONLY / 新 FX-*）。
4. **P4 硬规则保持**：prove EXIT=0 **不得**写 matrix §1.0/`§1.1` 为 covered · **不得**翻 UC-018 · covered-lift = 另开 knife + dual。
5. **P5 Pins 复述于 prove 输出**：NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained。

未满足任一 P1–P5 → post-prove dual **不得** PASS。

---

## Pins restated

- **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`**
- **`gR45Closed=true`** · **coveredCount=8** · **`ms3EqualsR4Closed=false`**
- Matrix §1.1 UC-E2E-018 **partial** · Ban invent covered · Ban假关
- PG-retained（Postgres + pgvector + PostgresSaver）· Ban MemorySaver / MySQL / Qdrant-as-required
- `canHonestlyFlip@b29c191` = constant-false no-flip guard · **not** assessment · Ban「已评估不可翻」
- Dual PASS ≠ coding ≠ UC covered ≠ §1.1 flip ≠ next knife
- GAP-UC018-COVERED-CRITERION 本开仍 **OPEN** · harness 保持 `draft:awaiting_pre_exec_dual`（本专家未改）

---

## secret scan

对 REQUEST tip `5afd399` diff 扫描 `password|secret|api[_-]?key|token|Bearer|AKIA|private[_-]?key`：仅命中文档禁令措辞（「Ban secrets / `.env*`」等）· **无真实凭据/密钥字面量** · **CLEAN**。

---

## signature

**mw-rag-route** · 2026-09-23 (~20:09 PT) · pre-exec dual · Verdict **PASS** · Ban Meridian · Ban Cloud Agent · Ban `.env*` · Ban invent covered · Ban假关 · Ban forge peer · Ban coding this open · alone≠dual

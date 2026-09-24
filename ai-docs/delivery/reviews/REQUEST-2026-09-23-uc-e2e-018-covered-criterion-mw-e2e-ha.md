# REQUEST — **UC-E2E-018 COVERED-CRITERION · GAP-UC018-COVERED-CRITERION** · pre-exec · mw-e2e-ha

**Status**: **PASS** / `pre_exec_dual_pass`（mw-e2e-ha · docs gate ONLY · **≠ coding** · **≠ UC-E2E-018 covered** · **≠ §1.1 flip** · **≠ nail** · alone ≠ dual · **不代签** mw-rag-route）  
**Expert**: `mw-e2e-ha`  
**Pair**: `REQUEST-2026-09-23-uc-e2e-018-covered-criterion-mw-rag-route.md`（**未读其结论 · 不代签**）  
**Knife**: `harness/uc-e2e-018-covered-criterion.md` · slice `uc-e2e-018-covered-criterion.slice.md` · status sampled **`draft:awaiting_pre_exec_dual`**  
**Reviewed tip**: **`5afd399`** / full `5afd3992e6152f9817b62bc03f684b8352fea4f8` · author `meetwise-core` · subject `docs(e2e): REQUEST UC018 covered-criterion (pre_dual)` · **HEAD exact MATCH** at review time · parent `f886ea5` ancestor YES  
**Date**: 2026-09-23 (~20:09 PT)

---

## Pins（retained · 本审不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained**（`adr-postgres-retained.md`） |
| Matrix §1.1 UC-E2E-018 | **partial** retained · Ban invent covered |

Dual PASS ≠ coding ≠ covered ≠ nail · alone ≠ dual · 不代签 peers。

---

## CMD|EXIT 表

| # | CMD | EXIT |
|---|-----|------|
| 1 | `git config user.name mw-e2e-ha && git config user.email mw-e2e-ha@meetwise.local` | 0 |
| 2 | `git fetch origin` | 0 |
| 3 | `git rev-parse HEAD` → `5afd3992e6152f9817b62bc03f684b8352fea4f8` | 0 |
| 4 | `git merge-base --is-ancestor 5afd399 HEAD` | 0（YES · exact HEAD） |
| 5 | `git merge-base --is-ancestor f886ea5 HEAD` | 0（YES） |
| 6 | `git show --stat 5afd399` | 0 |
| 7 | `git show 5afd399 --name-only` / `git diff 5afd399^..5afd399 --stat` | 0 |
| 8 | docs-only gate: diff paths ⊆ `ai-docs/` only（no `scripts/` / `src` / `package.json` file add） | 0（`DOCS_ONLY_OK`） |
| 9 | `git log --oneline -- …/REQUEST-2026-09-23-uc-e2e-018-covered-criterion-mw-e2e-ha.md` | 0（仅 stub tip `5afd399`） |
| 10 | Read harness + slice + receipt stub + matrix §0.5/§1.0/§1.1 + W2 sizing + W0 §2 + `testing/e2e-performance-evidence.md` §3 | 0（read-only） |
| 11 | `rg` sizing / PERF / reason / UC-018（matrix + harnesses） | 0 |
| 12 | `find` sizing / matrix paths | 0 |
| 13 | （本收据 commit / push 见文末 verify） | — |

**未执行**：coding · prove · `pnpm uc018:*` · 任何实现写 · 未读 `.env*` · 未碰 Meridian。

---

## Tip / docs-only 裁定

- **Tip MATCH**: HEAD == `5afd399` exact。
- **docs-only**: **PASS**。`5afd399` 仅改 4 个 `ai-docs/delivery/**` 文件（harness + slice + 两 dual stub）。**无** `scripts/` / `src` / `package.json` 文件增改。文中出现的 `scripts/lib/uc-covered-evaluator.mjs` / `pnpm uc018:covered-criterion:prove` 为 **plan 路径**（harness §2/§4 · Ban wire this open）· **≠** 本 tip 已落地代码。
- Author: `meetwise-core`（docs REQUEST）· 与 mw-core 叙事一致。

---

## Findings

### (a) 六列 partial→covered 准则 · keep-partial 逃逸

**裁定：adequately precise for docs gate · PASS with CONDITIONS**

采样：`harness/uc-e2e-018-covered-criterion.md` §1.1–§1.4（`:49–107`）· §1.3 keep-partial（`:83–96`）· slice 准则表（`:31–41`）。

| Escape | 映射谓词（harness） | 具名 refuse（文档层） |
|--------|---------------------|------------------------|
| happy-only | §1.3 · 无 NHP / happy-path-only | 叙事级；fixture 未单列 FX-HAPPY-ONLY |
| case-only | §1.3 · status `case-only`/`blind`/… | 叙事级 |
| open GAP | §1.3 + §1.4.3 · `openGaps[]` / FX-OPEN-GAP | **OPEN-GAP**（fixture id） |
| implementer-only | §1.1.3 + §1.3 · dual EOR · FX-IMPL-ONLY | **IMPL-ONLY** |
| uncommitted runner | §1.1.2 · Ban uncommitted · gitSha≠committed tip | 叙事级（无 FX-*） |
| missing dual | §1.1.3 + §1.3 · one/both not PASS | 叙事级（并入 IMPL-ONLY / missing dual） |

NEG/FAULT/ADV 有具名 NHP（NHP-018-NEG-01 / FAULT-01 / ADV-01）。BOUND 稍软：`named NHP or harness §1b BOUND pin executed`（§1.1.1 `:56`）——可测但仍允「或」分支。  
**非阻塞**：六逃逸均有文字谓词；机器可检 **具名 reason enum** 尚未冻结进 `evaluate` 输出 schema（仅 `reasons: string[]` · §2 `:117`）。

### (b) local PERF/LOAD → partial · capacity-representative · 非 NEG/FAULT/BOUND/ADV 越权

**裁定：正确 bar · PASS with CONDITIONS · 非 constant-false 伪装**

- Hard decision 与 `testing/e2e-performance-evidence.md` §3（`:62`：「本地毫秒/RPS = 单机回归预算 · 不是线上 SLO · 不是容量承诺 · 不是 HA」）一致；matrix §0.5 / UC-018 §1.0.2 `:141`（local ≠ prod ≠ HA · PERF/LOAD partial ≠ covered）一致。
- **非越权**：capacity-representative **仅**加在 PERF/LOAD（§1.2 item 6 · `:63–81`）；NEG/FAULT/BOUND/ADV 止于 §1.1 items 1–5 —— **同意**。
- **UC-018 不能仅靠 local 变 covered**：§0 Stance `:39` + §1.2 `:81` —— **同意**（PERF/LOAD 容量主张）。
- **Sizing SSOT 存在且有数字**（故 **非** unreachable constant-false）：
  - `ai-docs/delivery/harness/w2-resource-sizing-receipts.md` `:32`：**2 vCPU / 4 GiB** vs **4 vCPU / 8 GiB**（且诚实钉 sizing ≠ capacity green · `:5`/`:35`）。
  - Parent：`ai-docs/delivery/harness/pg-retained-checkpoint-postgres-saver.md` **§2 Resource sizing**（`:55+` · RAM/CPU 范围表 · Ban HA/suite）。
- **可达性**：harness 要求 declared target env（非 laptop docker）+ caps 对齐 sizing + dual on that env（§1.2.6 `:67–71`）。FX-ALL-MET 可合成 `capacityRepresentative` → true 分支可达。后续 cloud knife 可声明 staging/prod-like host class（建议对齐 W2 **4c8g** 或授权 sizing，避免与本地已用的 2c4g 数字重合洗白）。
- **CONDITION（关键）**：本地 isolated 已是 **2vCPU/4GiB**（与 W2 2c4g 数字重合）。coding 时 `capacityRepresentative` **不得**仅因 CPU/mem 数字匹配 W2 2c4g 就翻 true；必须有 **非 local/laptop/docker-isolated** 的 `targetEnvClass` + 该环境 dual EOR。

### (c) Evaluator / fixtures / guards

**裁定：设计方向诚实 · PASS with CONDITIONS**

| 项 | 读法 |
|----|------|
| pure `evaluate(input)` | §2 `:115–122` · 确定性 · 无网/无 git spawn inside evaluate |
| true 分支可达 | Ban constant-false · FX-ALL-MET → true（§3 `:130`） |
| 双向 fixture | FX-ALL-MET true；六 FX-MISS-* + OPEN-GAP / S11-NOT-MET / IMPL-ONLY / PERF-LOCAL-ONLY → false |
| constant-false guard | §3 `:142` · 有 |
| constant-TRUE guard | **未写** → CONDITION |
| anti-tautology（evaluator 不得读 fixture 的 expected） | **未写** → CONDITION |
| 真实 UC-018 输入 | §5 `:161–171` 期望 `canHonestlyFlip=false`（computed）· 主导因含六列 partial + **PERF/LOAD local-only cap** · 对齐 FX-PERF-LOCAL-ONLY 意图 · **期望非跑果**（本 tip 无 prove） |

### (d) Hard rule · 无本刀翻 covered

**裁定：PASS · 明确**

- Stance `:36` / §1.4.4 / §6 A6 / Hard retain `:201–209`：本刀 **只**建/证 evaluator · **禁止**写 UC-018 / §1.1 `covered` · coveredCount **8** retained · 真翻 = 另刀 + dual。

---

## 阻塞项

**无阻塞。**

抽样依据：tip docs-only · 六列准则+keep-partial 文字齐全 · PERF/LOAD local cap 与证据 §3 / matrix 一致且未越权到 NEG 四列 · sizing SSOT 路径+数字存在（W2 `:32` · W0 §2）· FX-ALL-MET 保证 true 可达 · hard no-flip / coveredCount=8 钉死 · pins NOT_HA / releaseEvidence=false / claimProductionHA=false。

---

## Conditions（post-prove / AUTHORIZED coding · 非本 tip 阻塞）

1. **冻结具名 refuse reason enum**（至少覆盖六逃逸 + PERF-LOCAL-ONLY / S11-NOT-MET / STUB-STACK），`evaluate` 输出可机检；单测断言具体 code 而非自由字符串。
2. **补 source guard**：禁止 constant-TRUE / 不可达 false；禁止 evaluator 读取 fixture 的 expected 字段（anti-tautology）。
3. **`capacityRepresentative`**：`targetEnvClass ∈ {local,laptop,docker-isolated,…}` → 强制 false，即使 caps 数字 = W2 2c4g；云刀须声明非 local 目标环境 + dual EOR。
4. **BOUND**：后续 elevate 前钉死具体 AUTHORIZED NHP id（收紧 §1.1 的「或 harness §1b」软分支）。
5. **Prove 时 real-matrix gather**：必须 computed `canHonestlyFlip=false`，reasons 含 **PERF-LOCAL-ONLY**（或等价 enum）——与今日六列 partial + local PERF/LOAD 真相一致；Ban 本刀写 matrix covered。

---

## Verdict

**PASS**（pre-exec docs gate · mw-e2e-ha）

- Tip **MATCH** `5afd399`
- docs-only **PASS**
- 阻塞项：**无**
- Conditions：上列 1–5（coding/prove 阶段）
- Pins：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained
- Dual PASS ≠ coding ≠ covered ≠ nail · alone ≠ dual · **不代签** `mw-rag-route`

---

## 三行中文摘要

1. 预审 **PASS**：`5afd399` 纯 docs，六列 partial→covered 准则与 local PERF/LOAD 硬封顶诚实，未把 NEG/FAULT/BOUND/ADV 一并抬到容量条。  
2. sizing SSOT **存在**（W2 2c4g/4c8g + W0 §2）；容量代表环境可经后续云刀达到，但 coding 须防「本地 2c4g 数字撞 W2」洗白。  
3. 无阻塞；条件含 reason enum、constant-TRUE/反重言守卫、以及 prove 时真实矩阵须算出 false+PERF-LOCAL-ONLY；本刀不翻 coveredCount=8。

*mw-e2e-ha · pre-exec · 2026-09-23 (~20:09 PT) · tip 5afd399 · PASS · 无阻塞*

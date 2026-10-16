# PASS — G-R4-5 / FUNNEL coveredCount Batch4b（08 eval）· pre-exec docs gate · mw-rag-route

**Verdict**: **PASS**（docs gate only · zero coding · zero prove · alone≠dual · Ban自批）  
**Expert**: `mw-rag-route`（独立预执行双审 · 域：RAG-FUNNEL · production-equivalent eval / 题库隔离 / 出题路径 · **Ban forge peer** · **Ban自批**）  
**Date**: 2026-09-23 (~11:25 PT)  
**Tip / HEAD**: `77b9d57f76389ed5a6a918e8cf57b990754cc2ee` · tip `77b9d57` · branch `feat/mysql-schema-skeleton` · **MATCH**  
**Path**: `ai-docs/delivery/reviews/REQUEST-2026-09-23-g-r4-5-funnel-covered-count-batch4b-08-eval-mw-rag-route.md`  
**Pair**: `…-mw-e2e-ha.md`（本专家**未写/未改/未 stage** · **ZERO peer touched** · alone≠dual）  
**Knife status（docs）**: **`REQUEST-ready / not_run:pre_dual`**（≡ awaiting_pre_exec_dual · 本审**不翻** harness → `post_prove_dual_pass` · Ban self-nail · Dual PASS ≠ coding · Dual PASS ≠ next）

---

## 1. Tip / HEAD 核验

| 项 | 值 |
|----|-----|
| 期望 HEAD | `77b9d57f76389ed5a6a918e8cf57b990754cc2ee` / tip `77b9d57` |
| `git rev-parse HEAD` | `77b9d57f76389ed5a6a918e8cf57b990754cc2ee` |
| branch | `feat/mysql-schema-skeleton` |
| commit subject | `docs(g-r4-5): open FUNNEL coveredCount Batch4b 08 eval REQUEST` |
| Prior nail baseline | `9b8b9a7` / full `9b8b9a7ace78608cd76076462156c93fcd38ad1f` · **是 HEAD 祖先** · prove tip retained `b0f5c50` · Batch4 REQUEST `1e8edcd` · coveredCount=**7** · product flags false |
| 结果 | **MATCH** · 非 FAIL mismatch |

---

## 2. 路径核验（exist）

| 路径 | 结果 |
|------|------|
| `ai-docs/delivery/harness/g-r4-5-funnel-covered-count-batch4b-08-eval.md` | **存在** · status `REQUEST-ready / not_run:pre_dual` |
| `ai-docs/delivery/g-r4-5-funnel-covered-count-batch4b-08-eval.slice.md` | **存在** · scope **only** `RAG-FUNNEL-08` eval evidence/wire |
| `ai-docs/delivery/rag-funnel-01-08-covered-matrix.md` | **存在** · coveredCount **7** 基线 · 02A–07 **covered** · 08 **not_covered** · refuse `production-equivalent eval matrix not evidenced` · Batch4b goal noted · Ban elevate this open |
| Batch4 assessor `apps/worker/src/r4-funnel-covered-count-batch4.ts` `assessFunnel08ProductionEquivalentEval` | **可读对照**（08 refuse/clear pins 源 · ≠ invent） |
| Receipts `ai-docs/delivery/receipts/production-equivalent-funnel-08-release.json` / `…-thresholds.json` | **不存在**（与 matrix 08 not_covered 诚实一致 · Ban forge this open） |
| Eval `…-batch4b-08-eval.eval.md` | **本 open 不要求**（harness/slice 标明 later · 非本 docs gate blocker） |
| Peer stub `…-batch4b-08-eval-mw-e2e-ha.md` | **存在 stub** · 本专家**未触碰** · Ban forge peer · **ZERO peer confirmed** |

---

## 3. Domain 审读 — RAG-FUNNEL（08 production-equivalent eval matrix · 本域核心）

本专家域：**RAG-FUNNEL** — 本刀 docs 是否给出**诚实可落地**的计划，以清除 Batch4 留下的 refuse：`production-equivalent eval matrix not evidenced` · **Ban docs-only fake cover** · **Ban invent coveredCount=8**。

| ID | True-cover target（docs 钉） | Matrix / live | 本审 |
|----|------------------------------|---------------|------|
| `RAG-FUNNEL-08` | **evidence/wire production-equivalent eval matrix** · UC-RAG-FUNNEL-08 · multi-lang/fullstack/ambiguity/injection holdout · per-leaf Recall@K · **wrong-track=0** · P95/成本阈值预注册 · release receipts bound · UC Alternate：**local fake/demo/benchmark alone ≠ passed** | **not_covered** · refuse `production-equivalent eval matrix not evidenced` · receipts **absent** | **诚实 · 可落地（定义/计划层）** · 6 assessor pins 钉死 clear 条件 · **非** docs-only fake cover · **非** invent covered this open |
| `RAG-FUNNEL-02A`/`02B`/`03`/`04`/`05`/`06`/`07` | prior Batch1/2/2b/3b/4 | **covered** retained | **retained** · Ban wash / Ban 重 invent |
| product flags | — | `r4`/`funnel`/`gR45` **false** | **本刀不翻** · Ban假关 |

### 08 clear-refuse 计划（必须 survive coding later · cite Batch4 assessor）

Harness/slice 与 `assessFunnel08ProductionEquivalentEval` 对齐的 6 pins（**全部** affirm 才可 elevate · 缺一 → refuse / keep not_covered）：

1. **`releaseReceiptsBound`** — receipt `ai-docs/delivery/receipts/production-equivalent-funnel-08-release.json` · datasetDigest/policyDigest/recipeDigest/environmentDigest + releaseEvidence/production-equivalent
2. **`perLeafRecallReported`** — per-leaf Recall@K + leafTrackId / backend/(nodejs|java|go|python)
3. **`wrongTrackZeroHardAssert`** — wrong-track=0 + hard-zero assert（题库隔离 / sibling 误路由不可被全局平均掩盖）
4. **`p95CostThresholdsPreRegistered`** — thresholds `…-funnel-08-thresholds.json` · P95 + 成本 + 预注册
5. **`multiLangHoldoutPresent`** — multi-lang/fullstack/ambiguity/injection（**alone ≠ covered**）
6. **`notLocalFakeAlone`** — 以上全部绑定 · **Ban** 本地 holdout/demo/benchmark alone 洗成 covered

**Refuse 类（assessor · 非 invent）**：`production-equivalent eval matrix not evidenced` · `per_leaf_recall_at_k_not_reported` · `wrong_track_zero_hard_assert_missing` · `p95_cost_thresholds_not_pre_registered` · `local_fake_demo_benchmark_alone_not_production_equivalent` · `multi_lang_fullstack_holdout_missing`

**域诚实读法**：

- 本 open **仅** docs REQUEST · **不** emit receipts · **不**跑 prove · **不**翻 matrix · coveredCount **保持 7**
- later under authorize：dedicated `pnpm r4-funnel-covered-count-batch4b-08-eval:prove` 仅当 6 pins + assessor affirm 才可设 08 `covered` · expect **7→8 if affirmed** · else keep **7** / refuse
- EXIT=0 alone ≠ covered · emit + assessor affirm required · Ban silent matrix flip · Ban docs-only fake cover
- UC Alternate 硬钉：无真实云或人工标注 → `not_run`/`inconclusive` · **local fake alone ≠ passed**

→ 本刀 **08 evidence 计划诚实且可落地（docs 定义层）** · **能**在 authorize+prove 后诚实清除 refuse · **非** invent covered · **非** product flip · **非** wash Batch4 `9b8b9a7`。

---

## 4. Scope（docs must say · 已核对）

| 钉 | Docs 读法 | 本审 |
|----|-----------|------|
| true-cover **ONLY** `RAG-FUNNEL-08` | harness/slice 明示 · batch4bOnly · 不抬升 07 再一次 | **OK** |
| 08 = production-equivalent eval matrix evidence/wire | slice §Scope IDs · cite Batch4 refuse · 6 assessor pins | **OK** |
| status `REQUEST-ready / not_run:pre_dual` | harness + slice 钉死 | **OK** |
| baseline coveredCount **7** retained · Ban invent=8 | matrix + harness + slice | **OK** |
| **本刀不翻** product flags | `r4ProductClosed`/`funnelProductClosed`/`gR45Closed` 保持 false | **OK** |
| Dual PASS ≠ coding / ≠ next | 多处硬钉 · Coding forbidden until dual BOTH PASS + standing AUTHORIZE | **OK** |
| if not achievable → `not_covered` + refuse | harness/slice/matrix 硬钉 | **OK** |
| Ban wash Batch4 `9b8b9a7`/`b0f5c50`/`1e8edcd` · Ban wash Batch3b `85be7ad`/`9aa1be4` · Ban second knife · ≠HA · `releaseEvidence=false` | 硬钉 | **OK** |

**Ban wrong scope**：未把本刀写成 invent coveredCount=8 / invent 08 covered this open / product close / MS3=R4 / docs-only fake cover / post_prove_dual_pass / HA / wash Batch4 partial into 08 covered。

---

## 5. Pins（对照 matrix + prior Batch4 · Ban invent / Ban wash）

| Pin | Live / Docs | Ruling |
|-----|-------------|--------|
| `coveredCount` | matrix **7**（Batch1 03/04 + Batch2 02A + Batch2b 02B + Batch3b 05/06 + Batch4 **07 only**） | **Ban invent 8** · 本 open 保留 **7** |
| `RAG-FUNNEL-08` | matrix **`not_covered`** · refuse `production-equivalent eval matrix not evidenced` · receipts **absent** | 仍 not_covered · Ban invent covered this open |
| `RAG-FUNNEL-02A`/`02B`/`03`/`04`/`05`/`06`/`07` | **covered** retained | Ban wash / Ban 重 invent |
| Prior Batch4 tip / prove / REQUEST | tip nail **`9b8b9a7`** · prove tip **`b0f5c50`** · REQUEST **`1e8edcd`** · EXIT 2×0 · coveredCount **6→7** · 07 **covered** · 08 **not_covered** refuse · `post_prove_dual_pass` · `productionConsumerWired=true` | retained · Ban wash into invent 08 / product-closed |
| Prior Batch3b / Batch3 / Batch2b / Batch2 / Batch1 / product-close | `85be7ad`/`9aa1be4` · `bd3a800`/`e468de9` · `ddfb64d`/`824e072` · `0a980e6`/`5593226` · `5519078`/`bd15172` · `1c2ed8c`/`139dac9` | retained · Ban wash |
| product flags | `r4ProductClosed=false` · `funnelProductClosed=false` · `gR45Closed=false` | **本刀不翻** · intent 保持 false |
| `releaseEvidence` | **false** | ≠HA · Ban claim releaseEvidence=true |
| R4/FUNNEL/G-R4-5 | **STILL OPEN** · **MS3 ≠ R4 closed** | Ban假关 · Ban MS3=R4 |
| `domainIsolationClosed` / `eg3ProductClosed` | retained from EG3 tip **`7be1a55`** | Ban wash into FUNNEL-08 invent |

**Prior Batch4（对照 · ≠ wash）**：tip `9b8b9a7` / prove `b0f5c50` 已诚实抬升 coveredCount **6→7** · **仅** 07 covered · 08 仍 **not_covered** refuse。本 Batch4b REQUEST **承认**该 baseline，**不**把 Batch4 nail/`post_prove_dual_pass`/coveredCount=7 洗成 08 已 covered 或 invent=8 / product-closed。

---

## 6. Docs gate PASS 条件核对

| 条件 | 结果 |
|------|------|
| HEAD = `77b9d57f76389ed5a6a918e8cf57b990754cc2ee` on `feat/mysql-schema-skeleton` | **是** |
| Harness + slice 存在 · clean · scope 限 08 eval only | **是** |
| baseline coveredCount=**7** · 未 invent 8 · 未 invent 08 covered | **是** |
| honest 08 clear plan：6 assessor pins + receipts/thresholds wire · fake≠passed · if not achievable → not_covered+refuse | **是** · landable |
| 未 wash Batch4 `9b8b9a7`/`b0f5c50`/`1e8edcd` · 未 wash Batch3b/3/2b/2/1/product-close/EG3 | **是** |
| 未 premature product close · flags 仍 false in intent · **本刀不翻** | **是** |
| Ban HA / `releaseEvidence=false` · ≠HA | **是** |
| Dual PASS ≠ coding · Dual PASS ≠ next · Ban自批 · Ban self-nail · alone≠dual | **是** |
| ZERO peer · 未写 `…-mw-e2e-ha.md` | **是** · peer stub 仍 awaiting |
| REQUEST-ready / pre_dual · zero coding · zero prove this open | **是** |

**Blockers**: **无**（docs gate）

---

## 7. Non-claims（本审明确不声称）

- **不**声称 Dual BOTH PASS（alone≠dual · peer 未写）
- **不**声称 coding/prove authorize · Dual PASS ≠ coding · Dual PASS ≠ next
- **不**声称 coveredCount=8 / 08 covered / matrix 已翻
- **不**声称 `r4ProductClosed`/`funnelProductClosed`/`gR45Closed` = true · **本刀不翻**
- **不**声称 `releaseEvidence=true` / HA / suite green / MS3=R4 / G-R4-5 closed
- **不** wash Batch4 `9b8b9a7`/`b0f5c50` 或任何 prior nail 成 08 covered
- **不** forge peer / **不**自批 / **不** self-nail harness

---

## 8. Verdict

**PASS** — HEAD **MATCH** · harness+slice clean · REQUEST-ready/pre_dual · baseline coveredCount=**7** · 08 refuse 保留且有诚实 clear 计划（6 assessor pins · Ban docs-only fake cover）· 无 invent/wash/product flip · **ZERO peer** · Dual PASS ≠ coding。

*mw-rag-route · pre-exec docs gate · G-R4-5 FUNNEL Batch4b 08 eval · 2026-09-23 (~11:25 PT) · PASS · HEAD 77b9d57 · coveredCount=7 Ban invent · 08 still not_covered · Ban docs-only fake cover · 本刀不翻 product flags · Ban wash Batch4 9b8b9a7 · ZERO peer · alone≠dual · Dual PASS ≠ coding · STOP*

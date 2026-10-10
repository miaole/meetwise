# PASS — G-R4-5 / FUNNEL coveredCount Batch4（07+08 true-cover）· pre-exec docs gate · mw-rag-route

**Verdict**: **PASS**（docs gate only · zero coding · zero prove · alone≠dual · Ban自批）  
**Expert**: `mw-rag-route`（独立预执行双审 · 域：RAG-FUNNEL / metadata-route / 题库隔离 / 出题路径 · **Ban forge peer** · **Ban自批**）  
**Date**: 2026-09-23 (~11:03 PT)  
**Tip / HEAD**: `1e8edcdfe2d92a14bd2e7d067211570d5c99a2ae` · tip `1e8edcd` · branch `feat/mysql-schema-skeleton` · **MATCH**  
**Path**: `ai-docs/delivery/reviews/REQUEST-2026-09-23-g-r4-5-funnel-covered-count-batch4-mw-rag-route.md`  
**Pair**: `…-mw-e2e-ha.md`（本专家**未写/未改/未 stage** · **ZERO peer touched** · alone≠dual）  
**Knife status（docs）**: **`REQUEST-ready / not_run:pre_dual`**（≡ awaiting_pre_exec_dual · 本审**不翻** harness → `post_prove_dual_pass` · Ban self-nail · Dual PASS ≠ coding · Dual PASS ≠ next）

---

## 1. Tip / HEAD 核验

| 项 | 值 |
|----|-----|
| 期望 HEAD | `1e8edcdfe2d92a14bd2e7d067211570d5c99a2ae` / tip `1e8edcd` |
| `git rev-parse HEAD` | `1e8edcdfe2d92a14bd2e7d067211570d5c99a2ae` |
| branch | `feat/mysql-schema-skeleton` |
| commit subject | `docs(g-r4-5): open FUNNEL coveredCount Batch4 07+08 true-cover REQUEST` |
| Prior nail baseline | `85be7ad` / full `85be7ad57f747f5c9a60775d6ca5e8ab6234b732` · **是 HEAD 祖先** · prove tip retained `9aa1be4` |
| 结果 | **MATCH** · 非 FAIL mismatch |

---

## 2. 路径核验（exist）

| 路径 | 结果 |
|------|------|
| `ai-docs/delivery/harness/g-r4-5-funnel-covered-count-batch4.md` | **存在** · status `REQUEST-ready / not_run:pre_dual` |
| `ai-docs/delivery/g-r4-5-funnel-covered-count-batch4.slice.md` | **存在** · scope 07+08 true-cover only |
| `ai-docs/delivery/rag-funnel-01-08-covered-matrix.md` | **存在** · coveredCount **6** 基线 · 07/08 **not_covered** · Batch4 goal noted · Ban elevate this open |
| UC `requirements/use-cases/rag-funnel-intent-routing.md` UC-RAG-FUNNEL-07/08 | **可读对照**（true-cover 定义源 · ≠ invent） |
| Eval `…-batch4.eval.md` | **本 open 不要求**（harness/slice 标明 later · 非本 docs gate blocker） |
| Peer stub `…-batch4-mw-e2e-ha.md` | **存在 stub** · 本专家**未触碰** · Ban forge peer |

---

## 3. Domain 审读 — RAG-FUNNEL / metadata-route / 题库隔离 / 出题路径（本域核心）

本专家域：**RAG-FUNNEL · metadata-route · 题库隔离 · 出题路径** — 刀是否定义**诚实可落地**的 07+08 true-cover（非 docs-only fake cover · 非 invent coveredCount=8 · 非越权/扩 corpus）。

| ID | True-cover target（docs 钉） | Matrix refuse（现） | 本审 |
|----|------------------------------|-------------------|------|
| `RAG-FUNNEL-07` | **free-text allowlisted scope funnel** · UC-RAG-FUNNEL-07 · rules→light model→clarification · typed JobRouteDecision-equivalent · **only suggests** allowlisted track · **no** read/tool grant · 低置信/unknown=0 检索 · 不扩大权限/corpus | `free-text allowlisted scope funnel not evidenced` · **not_covered** | **诚实 · 可落地（定义层）** · 复用 UC-03 自动路由同构 · 分类无数据读权限 · 题库隔离/出题零副作用可钉 · **非** docs-only fake cover |
| `RAG-FUNNEL-08` | **production-equivalent eval matrix** · UC-RAG-FUNNEL-08 · multi-lang/fullstack/ambiguity/injection holdout · per-leaf Recall@K · **wrong-track=0** · P95/成本阈值 · release receipts · local fake/demo/benchmark alone ≠ passed | `production-equivalent eval matrix not evidenced` · **not_covered** | **诚实 · 可落地（定义层）** · hard-zero + 预注册阈值 + 回执绑定 · UC Alternate 明确无真实云/人工时仅 `not_run`/`inconclusive` · **Ban** 本地 fake 洗成 covered |
| `RAG-FUNNEL-02A`/`02B`/`03`/`04`/`05`/`06` | prior Batch1/2/2b/3b | **covered** | **retained** · Ban wash / Ban 重 invent |
| product flags | — | `r4`/`funnel`/`gR45` **false** | **本刀不翻** · Ban假关 |

**07 域钉（metadata-route / 题库隔离 / 出题路径 · 必须 survive coding later）**：

- 自由文本入口复用**同一**自动路由（UC-03 同构 `JobRouteDecision`）· **不**扩大权限 · **不**扩大 corpus
- 分类结果 **only suggests** allowlisted track · **无** read/tool grant · 低置信/unknown/**越权 = 0 检索**
- prompt/日志/cache/事件不含未授权原文 · 误路由与外发越界=0
- true-cover ≠ docs 声明 alone · 须 evidenced+affirmed；若不可达 → **refuse / keep not_covered**

**08 域钉（题库隔离 / 出题路径 / production-equivalent · 必须 survive coding later）**：

- per-leaf 报告 · **不以全局平均掩盖** sibling 误路由 · **wrong-track=0** 硬断言
- hard-zero 安全断言 + 预注册质量/成本/P95 阈值 + release receipts（dataset/policy/recipe/环境 digest）
- 本地 fake / demo / benchmark / 单一缓存命中 **alone ≠ passed** · 无真实云或人工标注 → `not_run`/`inconclusive` · **Ban** wash 成 covered
- true-cover ≠ docs 声明 alone · 须 evidenced+affirmed；若不可达 → **refuse / keep not_covered**

**CoveredCount 诚实钉**：

- 本 open 基线 **coveredCount=6** · **Ban invent=8** · **Ban invent 07/08 covered this open**
- expect later：**6→8 if both affirmed** · else keep **6** 或 **7** · **Ban invent coveredCount=8**
- EXIT=0 alone ≠ covered · emit + assessor affirm required · Ban silent matrix flip · Ban docs-only fake cover

→ 本刀 **07+08 true-cover defs 诚实且可落地（docs 定义层）** · **非** invent covered · **非** product flip · **非** wash Batch3b。

---

## 4. Scope（docs must say · 已核对）

| 钉 | Docs 读法 | 本审 |
|----|-----------|------|
| true-cover **ONLY** `RAG-FUNNEL-07` + `RAG-FUNNEL-08` | harness/slice 明示 · batch4Only | **OK** |
| 07 = free-text allowlisted scope funnel · 08 = production-equivalent eval | slice §Scope IDs · cite matrix refuse | **OK** |
| status `REQUEST-ready / not_run:pre_dual` | harness + slice 钉死 | **OK** |
| baseline coveredCount **6** retained · Ban invent=8 | matrix + harness + slice | **OK** |
| **本刀不翻** product flags | `r4ProductClosed`/`funnelProductClosed`/`gR45Closed` 保持 false | **OK** |
| Dual PASS ≠ coding / ≠ next | 多处硬钉 · Coding forbidden until dual BOTH PASS + standing AUTHORIZE | **OK** |
| if not achievable → `not_covered` + refuse | harness/slice/matrix 硬钉 | **OK** |
| Ban wash Batch3b `85be7ad`/`9aa1be4` · Ban second knife · ≠HA · `releaseEvidence=false` | 硬钉 | **OK** |

**Ban wrong scope**：未把本刀写成 invent coveredCount=8 / invent 07/08 covered this open / product close / MS3=R4 / docs-only fake cover / post_prove_dual_pass / HA / wash Batch3b。

---

## 5. Pins（对照 matrix + prior Batch3b · Ban invent / Ban wash）

| Pin | Live / Docs | Ruling |
|-----|-------------|--------|
| `coveredCount` | matrix **6**（Batch1 03/04 + Batch2 02A + Batch2b 02B + Batch3b 05/06） | **Ban invent 8** · 本 open 保留 **6** |
| `RAG-FUNNEL-07` | matrix **`not_covered`** · refuse `free-text allowlisted scope funnel not evidenced` | 仍 not_covered · Ban invent covered this open |
| `RAG-FUNNEL-08` | matrix **`not_covered`** · refuse `production-equivalent eval matrix not evidenced` | 仍 not_covered · Ban invent covered this open |
| `RAG-FUNNEL-02A`/`02B`/`03`/`04`/`05`/`06` | **covered** retained | Ban wash / Ban 重 invent |
| Prior Batch3b tip / prove | tip nail **`85be7ad`** · prove tip **`9aa1be4`** · EXIT 2×0 · coveredCount **6** · 05/06 **covered** · 07/08 **not_covered** · `post_prove_dual_pass` | retained · Ban wash into invent 07/08 / product-closed |
| Prior Batch3 / Batch2b / Batch2 / Batch1 / product-close | `bd3a800`/`e468de9` · `ddfb64d`/`824e072` · `0a980e6`/`5593226` · `5519078`/`bd15172` · `1c2ed8c`/`139dac9` | retained · Ban wash |
| product flags | `r4ProductClosed=false` · `funnelProductClosed=false` · `gR45Closed=false` | **本刀不翻** · intent 保持 false |
| `releaseEvidence` | **false** | ≠HA · Ban claim releaseEvidence=true |
| R4/FUNNEL/G-R4-5 | **STILL OPEN** · **MS3 ≠ R4 closed** | Ban假关 · Ban MS3=R4 |
| `domainIsolationClosed` / `eg3ProductClosed` | retained from EG3 tip **`7be1a55`** | Ban wash into FUNNEL-07/08 invent |

**Prior Batch3b（对照 · ≠ wash）**：tip `85be7ad` / prove `9aa1be4` 已诚实抬升 coveredCount **4→6** · 05/06 **covered** · 07/08 仍 **not_covered**。本 Batch4 REQUEST **承认**该 baseline，**不**把 Batch3b nail/`post_prove_dual_pass`/coveredCount=6 洗成 07/08 已 covered 或 invent=8。

---

## 6. Docs gate PASS 条件核对

| 条件 | 结果 |
|------|------|
| HEAD = `1e8edcdfe2d92a14bd2e7d067211570d5c99a2ae` on `feat/mysql-schema-skeleton` | **是** |
| Harness + slice 存在 · clean · scope 限 07+08 true-cover only | **是** |
| baseline coveredCount=**6** · 未 invent 8 · 未 invent 07/08 covered | **是** |
| honest 07/08 defs：07=free-text allowlisted scope funnel（无扩权）· 08=production-equivalent eval（hard-zero + 阈值 + receipts · fake≠passed） | **是** · landable |
| 未 wash Batch3b `85be7ad`/`9aa1be4` · 未 wash Batch3/2b/2/1/product-close/EG3 | **是** |
| 未 premature product close · flags 仍 false in intent · **本刀不翻** | **是** |
| Ban HA / `releaseEvidence=false` · ≠HA | **是** |
| status `REQUEST-ready / not_run:pre_dual` · Ban self-nail `post_prove_dual_pass` | **是** |
| Dual PASS ≠ coding · Dual PASS ≠ next · Coding forbidden until dual+AUTHORIZE | **是** |
| 未写/未改 peer `…-mw-e2e-ha.md` | **是** · **ZERO peer touched** |
| Zero coding · zero prove · Ban自批 · alone≠dual | **是** |

---

## 7. Blockers

**无**（对本刀 **pre-exec docs gate** 而言）。

非阻塞提醒（非 FAIL · 非本审翻 harness / 非授权 coding）：

- 07/08 仍 **not_covered** · coveredCount **6** · true-cover 仅在 **dual BOTH PASS + standing AUTHORIZE** 之后才可 coding/prove
- Dual PASS ≠ coding · Dual PASS ≠ next knife auto-authorize
- **本刀不翻** `r4`/`funnel`/`gR45` product flags · product close 另刀
- alone≠dual：pair `mw-e2e-ha` 须独立写 · **Ban forge peer**
- Key×3 O3 honesty_red 按 harness **非阻塞**
- 后续 prove 若 07/08 不可达必须 honest refuse · Ban docs-only fake cover · **Ban invent coveredCount=8**
- 08：本地 fake/demo/benchmark alone ≠ production-equivalent · Ban wash

---

## 8. Explicit Ban 笔记

- Ban invent coveredCount / Ban invent coveredCount=8 / invent 07/08 covered this open
- Ban docs-only fake cover（07 须 evidenced free-text funnel without privilege expansion · 08 须 evidenced production-equivalent eval）
- Ban wash Batch3b tip **`85be7ad`** / prove **`9aa1be4`** / coveredCount **6** / 05/06 covered into invent 07/08
- Ban wash Batch3 **`bd3a800`**/`e468de9` · Batch2b **`ddfb64d`**/`824e072` · Batch2 **`0a980e6`**/`5593226` · Batch1 **`5519078`**/`bd15172` · product-close **`1c2ed8c`** · EG3 / rem·SSOT·EXPLICIT / R1 / EG3 evidence
- Ban MS3=R4 · Ban Dual PASS=coding · Dual PASS ≠ next
- Ban self-nail harness · Ban Cloud Agent · Ban Meridian · Ban secrets / `.env*`
- Ban forge peer `…-mw-e2e-ha.md` · **ZERO peer confirmed**
- Ban second knife · `releaseEvidence=false` · ≠HA · product flags **NOT** flipped this knife

---

## 9. Verdict

**PASS** — HEAD **MATCH** `1e8edcdfe2d92a14bd2e7d067211570d5c99a2ae` · harness+slice clean · baseline coveredCount=**6** · 07/08 true-cover defs 诚实可落地（07=free-text allowlisted scope funnel · 无扩权/无读权 · 08=production-equivalent eval · hard-zero/阈值/receipts · fake≠passed）· 无 invent/wash/product flip · status **`REQUEST-ready / not_run:pre_dual`** · Dual PASS ≠ coding · **ZERO peer touched**.

*mw-rag-route · pre-exec docs gate · G-R4-5 / FUNNEL coveredCount Batch4 07+08 true-cover · 2026-09-23 (~11:03 PT) · PASS · alone≠dual · Ban自批 · Ban forge peer · STOP*

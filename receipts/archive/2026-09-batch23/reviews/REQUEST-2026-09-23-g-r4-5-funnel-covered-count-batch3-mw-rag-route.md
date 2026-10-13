# PASS — G-R4-5 / FUNNEL coveredCount Batch3 · pre-exec docs gate · mw-rag-route

**Verdict**: **PASS**（docs gate only · zero coding · zero prove · alone≠dual · Ban自批）  
**Expert**: `mw-rag-route`（独立预执行双审 · 域：RAG-FUNNEL / metadata-route / 题库隔离 / Worker·出题路径可达性 · **Ban forge peer** · **Ban自批**）  
**Date**: 2026-09-23 (~10:10 PT)  
**Tip / HEAD**: `e3161b45f35b10d71a8b22087305844eb461cb87` · tip `e3161b4` · branch `feat/mysql-schema-skeleton` · **MATCH**  
**Path**: `ai-docs/delivery/reviews/REQUEST-2026-09-23-g-r4-5-funnel-covered-count-batch3-mw-rag-route.md`  
**Pair**: `…-mw-e2e-ha.md`（本专家**未写/未改/未 stage** · **ZERO peer touched** · alone≠dual）  
**Knife status（docs）**: **`REQUEST-ready / not_run:pre_dual`**（本审**不翻** harness · Ban self-nail · Dual PASS ≠ coding · Dual PASS ≠ next）

---

## 1. Tip / HEAD 核验

| 项 | 值 |
|----|-----|
| 期望 tip | `e3161b4` / full `e3161b45f35b10d71a8b22087305844eb461cb87` |
| `git rev-parse HEAD` | `e3161b45f35b10d71a8b22087305844eb461cb87` |
| branch | `feat/mysql-schema-skeleton` |
| commit subject | `docs(g-r4-5): open FUNNEL coveredCount Batch3 REQUEST (05+06)` |
| 结果 | **MATCH** · 非 FAIL mismatch |

---

## 2. 路径核验（exist）

| 路径 | 结果 |
|------|------|
| `ai-docs/delivery/harness/g-r4-5-funnel-covered-count-batch3.md` | **存在** |
| `ai-docs/delivery/g-r4-5-funnel-covered-count-batch3.slice.md` | **存在** |
| `ai-docs/delivery/rag-funnel-01-08-covered-matrix.md` | **存在**（coveredCount 基线 **4**） |
| Prior Batch2b post-prove `…-batch2b-02b-wire-post-prove-mw-rag-route.md` | **可读对照**（钉 coveredCount=**4** · 02B covered · 05–08 not_covered · ≠ wash） |
| Eval `…-batch3.eval.md` | **本 open 不要求**（harness/slice 标明 later · 非本 docs gate blocker） |

---

## 3. Scope（docs must say · 已核对 · 05+06 only）

| 钉 | Docs 读法 | 本审 |
|----|-----------|------|
| true-cover **ONLY** `RAG-FUNNEL-05` + `RAG-FUNNEL-06` | harness Knife + slice Scope IDs 明示 | **OK** |
| 05 = same-leaf LLM generation on clean miss | clean `no_eligible_in_scope` → one `QuestionPlan` / same-leaf generate · degraded/ACL/recipe/cache/unknown outbounds=0 · generated Q ≠ pollute QBank · score-excluded until calibrated | **OK** · 定义可诚实落地（见 §5） |
| 06 = route-scope cache/provenance/revoke | retrieval-result/negative cache · singleflight · epoch · metrics · provenance carry route-scope/taxonomy/generation digest · embedding compute cache 仅 cross-ref revoke/delete（≠ 替换 retrieval-cache 语义） | **OK** · 定义可诚实落地（见 §5） |
| 07/08 **out of scope** | slice 明示 Ban elevate this knife | **OK** |
| status `REQUEST-ready / not_run:pre_dual` | harness + slice 钉死 | **OK** |
| **本刀不翻** product flags | `r4ProductClosed`/`funnelProductClosed`/`gR45Closed` 保持 false | **OK** |
| Dual PASS ≠ coding / ≠ next | 多处硬钉 · Coding forbidden until dual BOTH PASS + standing AUTHORIZE | **OK** |
| 非 Batch4 / 非 second knife / 非 HA / `releaseEvidence=false` | 硬钉 | **OK** |

**Ban wrong scope**：未把本刀写成 02A/02B/03/04 再盖 / 07/08 抬升 / product close / invent coveredCount=5|6 / invent 05/06 covered this open / post_prove_dual_pass。

---

## 4. Pins（对照 matrix + prior Batch2b · Ban invent / Ban wash）

| Pin | Live / Docs | Ruling |
|-----|-------------|--------|
| `coveredCount` | matrix **4**（Batch1 03/04 + Batch2 02A + Batch2b 02B） | **Ban invent 5/6** · 本 open **保留 4** 为起点 |
| `RAG-FUNNEL-05`/`06` | matrix **`not_covered`** | 仍 not_covered · Ban invent covered this open |
| `RAG-FUNNEL-02A`/`02B`/`03`/`04` | **covered** retained | Ban wash / Ban 重 invent |
| `RAG-FUNNEL-07`/`08` | **not_covered** · out of scope | Ban elevate this knife |
| Batch2b tip / prove | tip nail **`ddfb64d`** · prove tip **`824e072`** · coveredCount **4** · 02B covered · `productionConsumerWired=true` | retained · Ban wash into invent 05/06 |
| Batch2 / Batch1 | tip **`0a980e6`**/`5593226` · **`5519078`**/`bd15172` | retained · Ban wash |
| product-close | tip **`1c2ed8c`** / prove **`139dac9`** · flags **false** | **本刀不翻** · Ban wash |
| product flags | `r4ProductClosed=false` · `funnelProductClosed=false` · `gR45Closed=false` | **本刀不翻** · intent 保持 false |
| `releaseEvidence` | **false** | ≠HA · Ban claim releaseEvidence=true |
| R4/FUNNEL/G-R4-5 | **STILL OPEN** · **MS3 ≠ R4 closed** | Ban假关 · Ban MS3=R4 |

**Prior Batch2b post-prove（对照 · ≠ wash）**：mw-rag-route 审在 tip `824e072` 钉 coveredCount **4** · 02B **covered** · 05…08 **not_covered** · product flags **false**。本 Batch3 REQUEST **承认**该基线为起点（coveredCount=**4** · 05/06 仍 not_covered），**不**把 Batch2b nail/`post_prove_dual_pass` 洗成 05/06 已 covered 或 coveredCount 已 5/6。

---

## 5. 域审：05+06 true-cover 定义能否诚实落地（mw-rag-route）

本专家域仅评 **定义/门禁诚实性**（docs gate）· **不** coding · **不** prove · **不**宣称生产已接线。

### 5.1 `RAG-FUNNEL-05`（same-leaf LLM · clean miss · 出题路径）

| 维度 | 定义钉（harness/slice） | 域读法 |
|------|------------------------|--------|
| 触发 | 仅 clean `no_eligible_in_scope` miss | **诚实**：非任意 miss / 非 degraded 伪装 covered |
| 产物 | 一条 same-leaf `QuestionPlan` / generate | **可达性门**：须落在 Worker·出题路径（plan→generate）· 非旁路脚本假盖 |
| 隔离 | generated Q ≠ pollute QBank · score-excluded until calibrated | **题库隔离钉**：与 metadata-route / QBank 投影边界一致 · Ban 把生成题洗成题库命中 |
| 负向 | degraded/ACL/recipe/cache/unknown outbounds = 0 | **Ban假盖**：出界≠ covered |
| 拒绝类（illustrative） | `same_leaf_llm_clean_miss_not_evidenced` / `production_path_not_wired_*` | **OK**：未接线则 refuse · keep not_covered · Ban invent |

→ **可诚实落地**：true-cover 要求生产出题路径在 clean miss 上真接线并举证；本 open **仍 not_covered** · expect later 4→6 **仅当**双方均 affirmed。

### 5.2 `RAG-FUNNEL-06`（route-scope cache / provenance / revoke · metadata-route）

| 维度 | 定义钉（harness/slice） | 域读法 |
|------|------------------------|--------|
| 缓存面 | retrieval-result / negative cache · singleflight · epoch · metrics | **诚实**：route-scope 语义 · 非把 02B embedding compute cache 洗成 06 |
| 溯源 | provenance 携带 route-scope / taxonomy / generation digest | **metadata-route 钉**：与 JobRouteDecision / scoped retrieval（03/04）边界正交 · Ban wash 03/04 covered |
| revoke | 与 delete/revoke receipt 对齐；embedding compute cache **仅 cross-ref**（≠ 替换 retrieval-cache 语义） | **Ban wash 02B**：02B durable compute ≠ 06 retrieval-cache |
| 拒绝类（illustrative） | `route_scope_cache_provenance_revoke_not_evidenced` / `production_path_not_wired_*` | **OK**：未接线则 refuse · keep not_covered |

→ **可诚实落地**：true-cover 要求 route-scope 缓存/溯源/撤销生产路径真举证；本 open **仍 not_covered** · Ban 用 Batch2b 02B wire 洗成 06 covered。

### 5.3 与 prior covered 的边界（Ban wash）

| Prior ID | Status | 与 05/06 |
|----------|--------|----------|
| 02A / 02B | covered | **≠** 05 LLM generate · **≠** 06 retrieval-cache（02B 仅 cross-ref） |
| 03 JobRouteDecision | covered | **≠** 05/06 · route 决策 ≠ same-leaf generate / cache-revoke |
| 04 track-local scoped retrieval | covered | **≠** 06 · 检索路径 covered ≠ cache/provenance/revoke covered |

---

## 6. Docs gate PASS 条件核对

| 条件 | 结果 |
|------|------|
| HEAD = tip `e3161b4…` on `feat/mysql-schema-skeleton` | **是** |
| Harness + slice 存在 · scope 限 **05+06 only** | **是** |
| baseline coveredCount=**4** retained as start · 未 invent 5/6 | **是** |
| 05/06 true-cover 定义诚实可落地 · 本 open 仍 **not_covered** | **是** |
| 未 wash Batch2b `ddfb64d`/`824e072` · 未 wash Batch2/Batch1/product-close/EG3 | **是** |
| 未 premature product close · flags 仍 false in intent | **是** |
| Ban HA / `releaseEvidence=false` · ≠HA | **是** |
| status `REQUEST-ready / not_run:pre_dual` · Ban self-nail harness | **是** |
| Dual PASS ≠ coding · Dual PASS ≠ next · Coding forbidden until dual+AUTHORIZE | **是** |
| 未写/未改 peer `…-mw-e2e-ha.md` | **是** · **ZERO peer touched** |
| Zero coding · zero prove · Ban自批 · alone≠dual | **是** |

---

## 7. Blockers

**无**（对本刀 **pre-exec docs gate** 而言）。

非阻塞提醒（非 FAIL · 非本审翻 harness / 非授权 coding）：

- 05/06 仍 **not_covered** · coveredCount **4** · 真接线/prove 仅在 **dual BOTH PASS + standing AUTHORIZE** 之后  
- Dual PASS ≠ coding · Dual PASS ≠ next knife auto-authorize  
- **本刀不翻** `r4`/`funnel`/`gR45` product flags · product close 另刀  
- alone≠dual：pair `mw-e2e-ha` 须独立写 · **Ban forge peer**  
- expect later coveredCount **4→6 if both affirmed** · else keep **4** or **5** · **Ban invent**  
- Key×3 O3 honesty_red 按 harness **非阻塞**

---

## 8. Explicit Ban 笔记

- **Ban invent coveredCount**（禁写 5/6 · 禁本 open 抬 05/06 covered）  
- **Ban wash** prior Batch2b nails `ddfb64d` / prove `824e072`（及 Batch2 `0a980e6`/`5593226` · Batch1 · product-close `1c2ed8c` · EG3 · rem·SSOT·EXPLICIT · R1 · EG3 evidence）进 invent 05/06 covered  
- **Ban wash** 02B embedding compute / 03 route / 04 scoped retrieval 进 05/06 covered  
- **Ban forge peer**（不写不改 `…-mw-e2e-ha.md`）  
- **Ban自批** / alone≠dual  
- **Ban** self-nail harness · **Ban** 翻 product flags  
- **releaseEvidence=false** · **≠HA** · Dual PASS ≠ coding · Dual PASS ≠ next  
- Ban Meridian · Ban Cloud Agent · Ban secrets / `.env*`（本审未读） · Ban MS3=R4 · Ban Batch4 parallel · Ban second knife

---

## 9. Report 摘要（父代理回传用）

| 项 | 值 |
|----|-----|
| Verdict | **PASS** |
| HEAD | `e3161b45f35b10d71a8b22087305844eb461cb87` |
| branch | `feat/mysql-schema-skeleton` |
| Path | `ai-docs/delivery/reviews/REQUEST-2026-09-23-g-r4-5-funnel-covered-count-batch3-mw-rag-route.md` |
| Pins | coveredCount=**4** · 02A/02B/03/04 **covered** · 05/06 **not_covered** · product flags **false** · releaseEvidence=**false** · ≠HA · status **REQUEST-ready / not_run:pre_dual** · Batch2b base **`ddfb64d`** retained |
| Blockers | **无** |
| ZERO peer e2e-ha touched | **是** |

---

*mw-rag-route · pre-exec docs gate · G-R4-5 / FUNNEL coveredCount Batch3 · 2026-09-23 ~10:10 PT · HEAD e3161b4 · MATCH · harness+slice OK · scope=05+06 only · coveredCount=4 Ban invent · 05/06 still not_covered · honest true-cover defs landable · Ban wash ddfb64d/824e072 · r4/funnel/gR45 false · 本刀不翻 · releaseEvidence=false · ≠HA · Dual≠coding · Dual≠next · alone≠dual · Ban自批 · Ban peer forge · ZERO peer touched · blockers none · Verdict PASS*

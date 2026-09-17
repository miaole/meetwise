# 审查归档 — Knife **F7** · **MS2 facets on product path** **post-prove** · mw-e2e-ha

**日期**：2026-09-17 ~01:03 PT  
**审稿人**：`mw-e2e-ha`（对抗独立审 · post-prove 第二域；**不采信**实现方自报 EXIT；**拒绝自批**；**本审不代签** `mw-rag-route`）  
**送审对照**：`reviews/REQUEST-2026-09-17-r4-f7-p-meta-ms2-facets-product-post-prove-mw-e2e-ha.md`  
**前序 pre-exec**：`reviews/2026-09-17-r4-f7-p-meta-ms2-facets-product-mw-e2e-ha.md`（**pass** · 执行前文档闸 only）  
**配对**：`REQUEST-2026-09-17-r4-f7-p-meta-ms2-facets-product-post-prove-mw-rag-route.md`（**须独立签**；冲突取更严；**本审不代签 / 不等待**）  
**结论**：**pass**（**仅** F7 MS2 post-prove honesty：专家独立复跑 EXIT=0 · **MS1 true** · **MS2 served** · **MS3 still false** · `facetsServedOnProductPath` = required set · `fullFacetsServed=true` · `standardDeployProductHandoff=false` · **G-R4-5 STILL OPEN** · **≠ FUNNEL-01 closed · ≠ R4 closed · ≠ 题域已隔离 · ≠ R1 closed · ≠ G-R4-5 closed · ≠ HA · ≠ suite green · ≠ knife product-done** · **Ban forge serving** · **Ban self-approve `post_prove_dual_pass`** · await dual / coordinator 可在双域齐后推进 harness — **本审不代改 harness**）  
**批准范围**：**仅**「`pnpm r4-p-meta-ms2-facets-product:prove` 专家独立复跑 EXIT=0 + MS2 real product-path facet serve honesty（`serveRequiredSecondaryFacetsOnProductPath` · ≠ forge）+ MS1 pin stays true + MS3 still false + sole 恰 5 未翻 + `releaseEvidence=false` · ≠HA · no flip default · no Live Key · no self-approve」——**不批** FUNNEL-01 closed · R4 closed · 题域已隔离 · R1 closed · G-R4-5 closed · HA · suite green · `releaseEvidence=true` · sole cutover · flip default · open DELETE · forge MetadataReviewReceipt serving · MS product-done · 把本绿写成 FUNNEL-01/R4/G-R4-5 关 · 单域本审冒充 dual 齐 · **pass ≠ knife product-done / G-R4-5 close**  
**硬钉**：`releaseEvidence=false` · **≠HA** · **EXIT=0 ≠ FUNNEL-01 closed ≠ R4 closed ≠ 题域已隔离 ≠ R1 closed ≠ G-R4-5 closed ≠ HA ≠ suite green ≠ knife product-done** · **01A ≠ 01** · **sole allowlist 恰 5** · **MS1=true · MS2=served · MS3=false** · **G-R4-5 STILL OPEN** · **G-R4-3 STILL OPEN**（parallel）· **MS2 alone ≠ FUNNEL-01 closed ≠ G-R4-5 closed ≠ R4 closed**（MS3 remain）· **Ban forge serving** · **no P-R1 flip** · **no Live×3** · **no self-approve** · **Ban claiming R4/FUNNEL/G-R4-5 closed** · **pass ≠ knife product-done / gate close** · HEAD `cedda0d`（本审 verify）· Key **unset**（本审）· 未读 `.env*`

---

## 0. 结论表（范围钉死）

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass** |
| **Scope** | **F7 MS2 post-prove honesty only** — NOT FUNNEL-01 closed · NOT R4 closed · NOT 题域已隔离 · NOT R1 closed · NOT G-R4-5 closed · NOT HA · NOT suite green · NOT knife product-done · NOT forge OK · NOT gate close · NOT `post_prove_dual_pass`（单域） |
| 实现方自批 / REQUEST 预写 | **无效 / 拒绝**；本审独立裁定 |
| `pnpm r4-p-meta-ms2-facets-product:prove`（本审复跑） | **EXIT=0** |
| F6 spawn（prove 内旁证） | **EXIT=0** · MS1 true · MS2 now true · MS3 still false |
| F5 / F3 spawn（旁证链） | **EXIT=0** · MS1/MS2 true · MS3 still false |
| `:prove:raw` / no-PG isolated | **n/a**（harness **does not** require :raw · no PG） |
| MS1 / MS2 / MS3 | **MS1=true** · **MS2=served** · **MS3=false** |
| `facetsServedOnProductPath` | **non-empty = required set** `[competency,technology,difficulty,seniority,kind,language]` · `fullFacetsServed=true` |
| `standardDeployProductHandoff` | **false**（MS3 still open） |
| R4 / 题域 / FUNNEL-01 / R1 | **仍 NOT closed / 仍开** |
| G-R4-5 | **STILL OPEN**（MS3 remain · MS2 alone ≠ close） |
| G-R4-3 / P-R1 | **平行仍开** · **not** this F7 · **no flip** |
| 本刀 harness/eval/status | 仍 **`executed:awaiting_post_prove_dual`**（**未**误写 FUNNEL-01/R4/G-R4-5 关 / `post_prove_dual_pass`） |
| `releaseEvidence` | **false** |
| sole allowlist | **恰 5 未翻** · F7 **不在** allowlist |
| HA / suite | **≠HA** · **≠ suite green** |
| no `mw-model-op` | **仍正确** |
| Blockers（本域 honesty） | **无阻塞**（配对 `mw-rag-route` 独立；coordinator 可在双域齐后推进 harness；**本 pass ≠ gate close ≠ G-R4-5 close**） |

---

## 1. 送审对照（不采信 · 独立复核）

| 送审项 | 本审结果 |
|--------|----------|
| 实现方 `pnpm r4-p-meta-ms2-facets-product:prove` EXIT=0（eval/REQUEST） | **不采信自报**；本审 **独立复跑 EXIT=0**（§2） |
| SHA claimed `cedda0d` | **属实** — `git rev-parse HEAD` = `cedda0d9acca5279475476908df1d434c8a5e641` · subject `feat(r4): F7 MS2 facets on product path (prove EXIT=0)` |
| harness/eval/slice/status `executed:awaiting_post_prove_dual` | **属实**；**未**写成 FUNNEL-01/R4/G-R4-5 关 / `post_prove_dual_pass` |
| EXIT=0 ≠ FUNNEL-01/R4/R1/G-R4-5 closed · ≠ 题域已隔离 · ≠ HA · ≠ suite green · ≠ knife product-done | **属实**（硬钉全文） |
| MS1 true · MS2 served · MS3 still false · ≠ forge · 01A ≠ 01 | **属实**（classifiers + prove MS0–MS4 + serve fail-closed） |
| MS2 alone ≠ FUNNEL-01/G-R4-5 closed（MS3 remain） | **属实** |
| sole 恰 5 未翻；未 flip default；未 open DELETE | **属实** |
| `releaseEvidence=false` · ≠HA · 禁止自批 · await dual | **属实**；本文件为独立签核 |
| Key unset / 未 invent MODEL_API_KEY / 未读 `.env*` / 未跑 Live×3 | **属实**（本审 Key unset） |
| G-R4-5 STILL OPEN · G-R4-3 parallel open | **属实** |
| pre-exec dual PASS · coding+prove authorized/executed | **属实**（prior gate · 本审不重审 coding authorize） |

对照源：REQUEST post-prove · `harness/r4-f7-p-meta-ms2-facets-product.md` · `eval/r4-f7-p-meta-ms2-facets-product.eval.md` · `r4-f7-p-meta-ms2-facets-product.slice.md` · `harness/r4-domain-isolation-status.md` §13 · **G-R4-5 / MS2** · `apps/worker/src/r4-p-meta-ms2-facets-product.ts` · `apps/worker/src/r4-p-meta-serving-product-remaining.ts` · `apps/worker/test/r4-p-meta-ms2-facets-product.proof.ts` · Prior F6 **`post_prove_dual_pass`** · Prior F5 **`post_prove_dual_pass`** · 前序 pre-exec `2026-09-17-r4-f7-p-meta-ms2-facets-product-mw-e2e-ha.md` · `scripts/run-e2e-isolated.mjs` `SOLE_WIRING_ALLOWLIST` 恰 5 · pair REQUEST `…-mw-rag-route.md`

---

## 2. 独立复跑 CMD+EXIT（本审 · ~01:03 PT · HEAD `cedda0d`）

| # | CMD | EXIT | 诚实读法（本审强制） |
|---|-----|------|----------------------|
| 1 | `pnpm r4-p-meta-ms2-facets-product:prove` | **0** | MS0–MS4 全 PASS；**MS1 true**；**MS2 served**；**MS3 still false**；**≠ FUNNEL-01 closed**；**≠ R4 closed**；**≠ 题域已隔离**；**≠ R1 closed**；**≠ G-R4-5 closed**；`releaseEvidence=false`；F6+F5+F3 spawn EXIT=0 |
| 2 | spawn F6 `pnpm r4-p-meta-ms1-product-wire:prove`（prove 内旁证） | **0** | MS1 true · MS2 now true · MS3 still false · ≠ FUNNEL-01/R4/G-R4-5 closed |
| 3 | spawn F5 / F3（旁证链） | **0** | MS1/MS2 true · MS3 false · ≠ FUNNEL-01/R4 closed |
| 4 | `:prove:raw` / no-PG isolated | **n/a** | harness **does not** require :raw（no PG） |

**未跑（禁）**：HA 绿关 · flip default / open DELETE · Live Key×3 · forge MetadataReviewReceipt serving · 全套 `e2e:isolated` 当本刀关闸 · 把本绿当 FUNNEL-01/R4/G-R4-5 关 · P-R1 flip · 宣称 MS product-done / knife gate close / 自批 `post_prove_dual_pass`。

### 2.1 Prove 收据（~01:03 PT）

- CMD：`pnpm r4-p-meta-ms2-facets-product:prove` → `tsx test/r4-p-meta-ms2-facets-product.proof.ts`
- 首行：`F7 MS2 facets on product path prove — MS1 true · MS2 served · MS3 still false · releaseEvidence=false · ≠HA · ≠R4 closed`
- 钉行：`EXIT=0 ≠ RAG-FUNNEL-01 closed ≠ G-R4-5 closed ≠ 题域已隔离 · await post-prove dual · Ban forge serving`
- MS0：F7 harness/eval/slice/status/inventory/F6/F5/F4/01A/principal/rag-funnel/F7 facets/F6 wire/F5 helper/F3 helper/F2 helper/handoff prove/pre-exec dual reviews — **all PASS present**
- MS1：`MS1_METADATA_REVIEW_RECEIPT_PRODUCT_SERVING_CONSUMER_WIRED=true` · **`routedServingProductConsumerWired=true`** · **`contract.wired=true`** · F3/F2 align wired=true · F6 harness `post_prove_dual_pass` — **all PASS（MS1 pin stays）**
- MS2：`MS2_PRODUCT_FACETS_SERVED_ON_PRODUCT_PATH_WIRED=true` · serve id pinned · plan facets = architecture secondary set (6) · **`facetsServedOnProductPath` = required set** · F3 `fullFacetsServed=true` · F2 `fullFacetsServed=true` · serve admitted+valid → served · deploy=false · non-admitted / invalid → fail-closed · exports `serveRequiredSecondaryFacetsOnProductPath` · inventory/status P-META / G-R4-5 open — **all PASS（MS2 served · ≠ forge）**
- MS3：`productDeployHandoffChecklistNamed=true` · **`standardDeployProductHandoff=false`** · `local01AHandoffProveExists=true` · F3/F2 `standardDeployHandoff=false` — **all PASS（MS3 still open）**
- MS4：`isProductFunnel01Closed=false` · `isProduct01ANotEqual01=true` · align F3/F2 · `gR43PR1ParallelOpen=true` · harness pins ≠ R4/FUNNEL/R1 · Ban forge · omit model-op · F6/F5/F4=`post_prove_dual_pass` · status 题域 NOT closed · **G-R4-5 STILL OPEN · MS3 remain** · pre-exec dual pass · P-R1 fail-closed OFF · no invent `MODEL_API_KEY` · **SOLE 恰 5 · F7 NOT on allowlist** · composition EXIT=0 ≠ FUNNEL/R4/R1/G-R4-5 closed ≠ HA ≠ forge OK — **all PASS**
- 终行：`OK  r4-p-meta-ms2-facets-product prove (MS2 served; MS1 true; MS3 still false; ≠ FUNNEL-01/R4/G-R4-5 closed; releaseEvidence=false)`

### 2.2 Static 对抗复核（本审）

| 点 | 观察 | 读法 |
|----|------|------|
| `facetsServedOnProductPath` | non-empty · = `[competency,technology,difficulty,seniority,kind,language]` · = `PRODUCT_FACET_SERVING_PLAN` / `REQUIRED_SECONDARY_FACETS` | **MS2 served 诚实** · ≠ `[]` · ≠ partial |
| `fullFacetsServed` | `true`（F3/F2 align） | 与 MS2 served 一致 |
| Serve path | `serveRequiredSecondaryFacetsOnProductPath` · fail-closed on non-admitted / invalid · no PG forge | **≠ forge serving** |
| MS1 pin | `MS1_…_WIRED=true` · `routedServingProductConsumerWired=true` · `contract.wired=true` | **MS1 stays true** · ≠ flip back |
| MS3 | `standardDeployProductHandoff=false` | **MS3 still false** · G-R4-5 remain |
| sole | `SOLE_WIRING_ALLOWLIST` 恰 **5**（sole-stack:wiring:prove / ping / qdrant-backed / vectorstore-adapter / vectorstore-qdrant）· F7 不在 | **未翻** |
| Key / env | 本审 **未读** `.env*` · **未** invent Key · prove 不 assign `MODEL_API_KEY` | **属实** |

---

## 3. REQUEST Q1–Q7（对抗答）

| # | 问题 | 本审答 | 对抗要点 |
|---|------|--------|----------|
| **Q1** | 请独立复跑 `pnpm r4-p-meta-ms2-facets-product:prove`，附 CMD+EXIT | **已复跑 · EXIT=0** | §2；不采信实现方自报；HEAD `cedda0d` verify |
| **Q2** | MS2 是否诚实 served（`facetsServedOnProductPath` = required · `fullFacetsServed=true` · serve path · ≠ forge）· MS1 **true** · MS3 **still false**？ | **是** | Static + prove：required 6 齐 · serve fail-closed · MS1 pin stays · MS3 `standardDeployProductHandoff=false` · Ban forge |
| **Q3** | EXIT=0 是否仍钉 **≠ FUNNEL-01 closed / ≠ R4 closed / ≠ 题域已隔离 / ≠ R1 closed / ≠ G-R4-5 closed / ≠ HA / ≠ suite green**？ | **是（硬钉）** | prove/MS4 composition + harness/eval/status 全文钉住；**本 pass ≠** 上述任一关 |
| **Q4** | MS2 alone 是否仍钉 **≠ FUNNEL-01/G-R4-5 closed**（MS3 remain）？ | **是（硬钉）** | `isProductFunnel01Closed=false` · MS3 false · **MS2 alone ≠ FUNNEL-01 closed ≠ G-R4-5 closed ≠ R4 closed** |
| **Q5** | harness/status/eval 是否错误把本绿写成 FUNNEL-01/R4/G-R4-5 已关 / `post_prove_dual_pass` / forge OK？ | **否（期望满足）** | 仍 `executed:awaiting_post_prove_dual` · G-R4-5 STILL OPEN · MS3 still false · Ban self-approve · Ban forge |
| **Q6** | sole allowlist 是否仍恰 5 未翻？`releaseEvidence=false`？no flip default？ | **是** | SOLE 恰 5 · F7 不在 allowlist · `releaseEvidence=false` · P-R1 fail-closed 仍 OFF |
| **Q7** | **no** `mw-model-op` 是否仍正确？G-R4-5 / G-R4-3 是否仍 STILL OPEN？ | **是（硬钉）** | Domain = MS2 product-path facets · omit model-op **正确**；G-R4-5 **STILL OPEN**（MS3）· G-R4-3 **STILL OPEN**（parallel · Ban flip） |

---

## 4. 对抗：假绿 / 偷关 / 冒充

| 风险说法 | 裁定 |
|---------|------|
| 「EXIT=0 / MS2 served = FUNNEL-01 closed / R4 closed / G-R4-5 closed / 题域已隔离」 | **假绿 / 禁** — MS3 remain · Ban claiming R4/FUNNEL/G-R4-5 closed |
| 「MS2 alone = G-R4-5 closed / FUNNEL-01 closed / MS product-done」 | **假绿 / 禁** — **MS2 alone ≠ FUNNEL-01 closed ≠ G-R4-5 closed ≠ R4 closed** |
| 「本审 pass = `post_prove_dual_pass` / dual 齐 / knife product-done」 | **禁** — 单域；须配对 `mw-rag-route`；**Ban self-approve**；**pass ≠ knife product-done** |
| 「harness 可写成 `post_prove_dual_pass`（实现方自批）」 | **禁** — **Ban self-approve `post_prove_dual_pass`**；须双专家独立 post-prove |
| 「serve = forge MetadataReviewReceipt / invent DB facts」 | **禁** — real serve path · fail-closed · no PG forge · Ban forge |
| 「MS1 可回翻 / MS3 已关」 | **禁** — MS1 pin stays true · MS3 still false |
| 「翻 sole / releaseEvidence=true / flip default / open DELETE / HA / suite green」 | **禁** — sole 恰 5 · `releaseEvidence=false` · ≠HA · ≠ suite green |
| 「缺 model-op = 审不全 / 应驳」 | **禁** — 本 harness **无** MODEL-OP domain need；omit **正确** |
| 「实现方预写 REQUEST = 专家 pass」 | **禁** — 拒绝自批；本文件独立签 |
| 「本域 pass = dual 齐」 | **禁** — 须配对 `mw-rag-route` 独立 |

**本审**：harness/eval/status/prove **未**把 R4/HA/R1/FUNNEL/G-R4-5/suite/forge/`post_prove_dual_pass` 写成已关；假绿面在 **叙事外推** 与 **自批 dual**。post-prove honesty 诚实即可控。

---

## 5. Blockers

**本域 F7 MS2 post-prove honesty：无阻塞。**

仍 gated（**非**本审 blocker · **须**后续独立动作）：
1. 配对 `mw-rag-route` 独立 post-prove 签（本审不代签）
2. Dual 齐后 harness 方可迁 `post_prove_dual_pass` —— **Ban self-approve**；**本 pass ≠** 代改 harness
3. 即使 dual pass：**仍 ≠** FUNNEL-01 / R4 / G-R4-5 closed（**MS3 remain**）
4. MS3 deploy + G-R4-3 / P-R1 flip = parallel · **Ban flip without authorize**（不在本 F7）
5. **MS1 stays true** pin — 后续不得回翻 MS1

---

## 6. 签名

**Verdict**：**pass**  
**Scope**：**F7 MS2 post-prove honesty only**  
**Sign**：`mw-e2e-ha`  
**Explicit pins**：
- CMD `pnpm r4-p-meta-ms2-facets-product:prove` · **EXIT=0**（本审独立复跑 ~01:03 PT）
- **MS1=true · MS2=served · MS3=false** · `facetsServedOnProductPath` = required 6 · `fullFacetsServed=true` · `standardDeployProductHandoff=false`
- **G-R4-5 STILL OPEN** · **G-R4-3 STILL OPEN**
- **MS2 alone ≠ FUNNEL-01 closed ≠ G-R4-5 closed ≠ R4 closed**
- **pass ≠ knife product-done / G-R4-5 close / `post_prove_dual_pass`（单域）**
- Reject self-pass；pair `mw-rag-route` independently
- No `mw-model-op` required
- sole 恰 5 · `releaseEvidence=false` · ≠HA · ≠ suite green
- Ban forge · Ban flip without authorize · Ban claiming R4/FUNNEL/R1/G-R4-5 closed · ≠ 题域已隔离
- HEAD：`cedda0d`（verify）· Key unset · 未读 `.env*`

---

*Review · mw-e2e-ha · F7 MS2 facets on product path · post-prove · 2026-09-17 ~01:03 PT · verdict=pass · scope=F7 MS2 post-prove honesty only · CMD EXIT=0 · MS1 true · MS2 served · MS3 still false · G-R4-5 STILL OPEN · G-R4-3 STILL OPEN · MS2 alone≠FUNNEL/G-R4-5 closed · pass≠knife product-done · releaseEvidence=false · ≠HA · sole 恰 5 · Ban forge · Ban self-approve · reject self-pass · pair mw-rag-route · no mw-model-op · HEAD cedda0d*

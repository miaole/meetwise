# 审查归档 — **G-R4-5 / FUNNEL coveredCount Batch4b（08 eval）** · **post-prove** · mw-e2e-ha

**Verdict**：**`pass`**（范围：**post-prove 诚实性 only** — 独立复跑 EXIT **2×0** + **诚实 elevation**（`RAG-FUNNEL-08` **covered** · refuse cleared · `notLocalFakeAlone=true` · evidence via `production-equivalent-funnel-08-eval.ts` · release+thresholds receipts · coveredCount **7→8** · `batch4bCoveredCount=1` · `coveredCountInvented=false` · `batch4bOnly=true` · 02A–07 **covered retained**）+ **本刀不翻** product flags（`r4ProductClosed=false` · `funnelProductClosed=false` · `gR45Closed=false`）+ harness **未**自钉 `post_prove_dual_pass` · real eval wire spot-check **pass** · **≠** invent without evidence · **≠** local-fake-alone · **≠** docs-only fake cover · **≠** wash Batch4 `9b8b9a7`/`b0f5c50`（07 covered / 08 refuse）into fake 8 · **≠** MS3=R4 · **≠** HA · **≠** suite green · **≠** `releaseEvidence=true` · **≠** 自批 dual_pass · **≠** alone=dual · **≠** Dual PASS = next knife auto-authorize · **≠** second knife · **≠** product / G-R4-5 closed · **covering 08 ≠ product closed**）  
**审稿人**：`mw-e2e-ha`（对抗独立审 · **实现方自批无效 / 拒绝** · 本审 **零 coding beyond 本 review 文件** · **未读 `.env*`** · **未触 Meridian** · Ban Cloud Agent · **未 commit / 未 push** · **未翻 harness 为 `post_prove_dual_pass`** · **未写** pair rag-route 路径）  
**日期**：2026-09-23 ~11:34 PT  
**送审路径（唯一 canonical）**：`ai-docs/delivery/reviews/REQUEST-2026-09-23-g-r4-5-funnel-covered-count-batch4b-08-eval-post-prove-mw-e2e-ha.md`  
**配对**：`…-post-prove-mw-rag-route.md`（**须独立签** · **alone ≠ dual** · **Ban自批** `post_prove_dual_pass` · 本审不代签 / 不等待 / **未复制** rag-route）  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **本刀诚实结局**：true-cover **仅** 08 via production-equivalent eval matrix **real produce+bind** · coveredCount **8**（诚实 **7→8**）· refuse cleared · 02A–07 retained · **本刀不翻** product flags（仍 **false**）· **STILL OPEN**：R4/FUNNEL product · G-R4-5 · MS3≠R4 · `batch4bOnly=true` · Key×3 O3 honesty_red **非阻塞** · **08 covered ≠ product closed**

**关键诚实框（PASS = EXIT 2×0 AND honest 7→8 · FAIL if invent / local-fake-alone / wash / flip / self-nail / claim HA）**：
- EXIT **2×0** **且** 诚实 7→8（08 covered · refuse cleared · `notLocalFakeAlone=true` · real eval wire · 02A–07 retained · 无 invent · 无 wash Batch4 refuse）**且** product flags **保持 false** = **正确对抗结局** → verdict **pass**
- **PASS = honesty of 08 elevation ≠ product closed ≠ HA ≠ G-R4-5 closed ≠ releaseEvidence=true**
- **FAIL** 条件：invent coveredCount without evidence · local-fake-alone · tip mismatch · prove fail · self-nail `post_prove_dual_pass` · wash Batch4 08 refuse into fake 8 · silent flip product flags · claim HA / `releaseEvidence=true` · claim product closed because 08 covered
- **EXIT=0 ≠ R4/FUNNEL/G-R4-5 product closed ≠ HA ≠ Dual PASS = next auto-authorize**

**硬钉（must survive）**：
- Verdict = **honesty only**（post-prove）· pass/fail 仅对独立 EXIT + honest **7→8**（08 covered · refuse cleared · `notLocalFakeAlone=true`）+ flags 不翻 + harness 未自钉
- Ban自批 `post_prove_dual_pass` — harness 须仍 `executed:awaiting_post_prove_dual` 直至 BOTH peers PASS
- alone≠dual · pair `mw-rag-route` independently · 本审 **不写** rag-route 路径 · **勿代签**
- Dual PASS ≠ next knife auto-authorize · no second knife
- **本刀不翻**：`r4ProductClosed=false` · `funnelProductClosed=false` · `gR45Closed=false`
- Ban invent coveredCount · Ban wash Batch4 **`9b8b9a7`**/`b0f5c50`** · Ban docs-only / local-fake-alone · Ban MS3=R4
- STILL OPEN：R4/FUNNEL product · G-R4-5 · MS3≠R4 · `releaseEvidence=false` · ≠HA · **08 covered ≠ product closed**
- zero coding beyond review file · no commit/push · no harness flip
- Pre-exec tip contrast：**`77b9d57`**（pre-exec PASS · coveredCount then **7** · 08 **not_covered** refuse）→ prove tip **`0e58386`** · prior nail Batch4 **`9b8b9a7`**
---
## 0. 结论表（范围钉死）

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass** |
| **Scope** | **post-prove honesty only** — NOT product closed · NOT invent · NOT local-fake-alone · NOT wash · NOT HA · NOT suite · NOT self-nail dual_pass · NOT alone=dual · NOT next auto-authorize · NOT second knife · covering 08 ≠ product closed |
| 实现方自批 / REQUEST stub | **无效 / 拒绝**；本审独立裁定 |
| Knife status | **`executed:awaiting_post_prove_dual`** · **NOT** `post_prove_dual_pass` |
| 本刀诚实结局 | **08 elevation** · refuse cleared · `notLocalFakeAlone=true` · coveredCount **7→8** · 02A–07 retained · product flags NON-flip · real eval wire |
| coveredCount / 08 / refuse | **8** / **covered** / **null**（cleared）· Ban invent · Batch4bOnly |
| notLocalFakeAlone / release+thresholds | **true** · receipts bound · **诚实 prove emission · 非 invent** |
| Flags（须保持 false） | `r4ProductClosed=false` · `funnelProductClosed=false` · `gR45Closed=false` |
| STILL OPEN | R4/FUNNEL product · G-R4-5 · MS3≠R4 · `releaseEvidence=false` · ≠HA · **08 covered ≠ product closed** |
| alone ≠ dual | **硬钉** · pair `mw-rag-route` independently · Ban自批 · 本审未写 pair · 勿代签 |

---

## 1. Tip / HEAD

| 项 | 值 |
|----|-----|
| Expected tip / HEAD | **`0e58386`** / full `0e58386126c4c6bc186685b5526068875e70dbc1` |
| 本审 `git rev-parse HEAD` | **`0e58386126c4c6bc186685b5526068875e70dbc1`** |
| `git log -1 --oneline` | `0e58386 feat(g-r4-5): FUNNEL coveredCount Batch4b 08 eval under authorize (awaiting_post_prove_dual)` |
| Tip match | **Y** · 与 expected tip **一致** · **非挡** |
| Pre-exec BOTH PASS | REQUEST tip **`77b9d57`** · ours `…-mw-e2e-ha.md`（non-post-prove）docs gate · 当时 matrix coveredCount **7** / 02A–07 **covered** / 08 **not_covered** refuse · **非挡** |
| Prior continuity（≠ wash） | Batch4 tip nail **`9b8b9a7`** / prove **`b0f5c50`** · coveredCount **6→7** · 07 covered · 08 then **not_covered** refuse `production-equivalent eval matrix not evidenced` · **本刀不 wash** that refuse into fake 8 |
| Contrast | pre-exec **`77b9d57`**（coveredCount=7 · 08 not_covered）→ tip **`0e58386`** · **7→8** · 08 covered · refuse cleared · `notLocalFakeAlone=true` · **诚实 elevation** · **非** invent · **非** wash Batch4 |
| Harness status | **`executed:awaiting_post_prove_dual`** · **NOT** silently flipped to `post_prove_dual_pass` · Ban自批 |

---

## 2. 独立复跑 CMD+EXIT（cwd `/workspace/meetwise` · ~11:34 PT）

| # | CMD | EXIT | 诚实读法 |
|---|-----|------|----------|
| 1 | `pnpm r4-funnel-covered-count-batch4b-08-eval:prove` | **0** | dedicated Batch4b 08 eval true-cover · live assessors：08 **all pins true** incl. `notLocalFakeAlone=true` / `releaseReceiptsBound=true` → **covered** · refuse **null** · emit coveredCount **8** · `batch4bCoveredCount=1` · `coveredCountInvented=false` · `batch4bOnly=true` · product flags **false** · `releaseEvidence=false` · Ban invent · Ban self-nail dual_pass · Ban docs-only / local-fake-alone · covering 08 ≠ product closed |
| 2 | `pnpm r4-eg2-funnel-covered:prove` | **0** | EG2 Batch4b-aware matrix · coveredCount **matches** live assessors（got=8 expect=8）· 02A/02B/03/04/05/06/07/08 **covered** · 01 ≠ invent covered · `inventCovered=false` · `releaseEvidence=false` |

**EXIT table**：**2×0** — 与实现方收据一致；本审**独立复跑**确认（**不采信**自报）。script names 与 harness-frozen CMD **一致**（`r4-funnel-covered-count-batch4b-08-eval:prove` · `r4-eg2-funnel-covered:prove`）。

**EXIT=0 ≠ R4/FUNNEL/G-R4-5 product closed ≠ invent ≠ HA ≠ suite ≠ `releaseEvidence=true` ≠ self-nail `post_prove_dual_pass` ≠ Dual PASS = next auto-authorize ≠ second knife · covering 08 ≠ product closed。**

**关键对抗读法**：EXIT **2×0** **同时** coveredCount **8** = **诚实 7→8**（08 elevation via production-equivalent eval wire + all assessor pins incl. `notLocalFakeAlone`）**同时** product flags **保持 false** = **诚实 PASS**（正确 08 elevation · 正确拒绝假关 / HA / product closed），**不是**“绿=产品已关 / G-R4-5 closed / HA”。

Prove stdout 关键钉（独立观察）：B0 awaiting + flags false · B1 eval wire produce+bind digests/perLeaf/wrongTrackZero · B2 08 covered=`true` / `notLocalFakeAlone=true` / `releaseReceiptsBound=true` · B3 `batch4bOnly=true` · `coveredCountInvented=false` · r4/funnel/gR45 **false** · `ms3EqualsR4Closed=false` · `releaseEvidence=false` · coveredIds=[08] · funnel08RefuseReason **null** · B4 inventCovered=false · got=8 expect=8 · 02A–07 retained · 08 covered · B5/B6 receipts · roundtrip flags false · Ban wash Batch4 · Ban MS3=R4 · Ban self-nail · Ban docs-only fake cover · awaiting · EG2 M1 got=8 expect=8 · 08 covered

---

## 3. Receipt / matrix flags（复跑后 · 08 elevation vs OPEN）

源：`receipts/2026-09-23-g-r4-5-funnel-covered-count-batch4b-08-eval-evidence.json` · `receipts/production-equivalent-funnel-08-release.json` · `receipts/production-equivalent-funnel-08-thresholds.json` · `rag-funnel-01-08-covered-matrix.md` · `receipts/2026-09-23-g-r4-5-funnel-covered-count-batch4b-08-eval-prove.md`（独立复跑后重读）

| Flag / 项 | 值 | 裁定 |
|-----------|-----|------|
| `kind` | `FunnelCoveredCountBatch4b08EvalEvidence` | Batch4b evidence · **确认** |
| `batch4bOnly` | **true** | Batch4bOnly · **硬钉** |
| `funnel08Covered` | **true** | assessor affirmed · **诚实 emission** · **确认** |
| `coveredIds` | `["RAG-FUNNEL-08"]` | Batch4b elevates **08 only** · **确认** |
| `batch4bCoveredCount` | **1** | = 08 this knife · **确认** |
| matrix / total `coveredCount` | **8** | **7→8 honest** · Batch1 03/04 + Batch2 02A + Batch2b 02B + Batch3b 05/06 + Batch4 07 + Batch4b 08 · Ban invent · **确认** |
| `coveredCountInvented` / matrix `inventCovered` | **false** / **false** | Ban invent · **确认** |
| `funnel08Assessor.notLocalFakeAlone` | **true** | **真实 pin** · all pins bound · **确认** |
| `funnel08Assessor` other pins | releaseReceiptsBound / perLeafRecallReported / wrongTrackZeroHardAssert / p95CostThresholdsPreRegistered / multiLangHoldoutPresent · **all true** | **确认** |
| `funnel08RefuseReason` | **null** | refuse cleared · **确认** |
| matrix `RAG-FUNNEL-02A`/`02B`/`03`/`04`/`05`/`06`/`07` | **covered** | retained · Ban wash · **确认** |
| matrix `RAG-FUNNEL-08` | **covered** | Batch4b true-cover · eval wire · **确认** |
| `r4ProductClosed` | **false** | **本刀不翻** · **STILL OPEN** · Ban假关 · **确认** |
| `funnelProductClosed` | **false** | **本刀不翻** · **STILL OPEN** · Ban假关 · **确认** |
| `gR45Closed` | **false** | **本刀不翻** · **STILL OPEN** · **硬钉** |
| `ms3EqualsR4Closed` | **false** | Ban MS3=R4 · **确认** |
| `releaseEvidence` | **false** | **硬钉** · ≠ release · ≠HA |

**Elevated**：`RAG-FUNNEL-08` → **covered** · **7→8** · `notLocalFakeAlone=true`。 **Product closed this knife**：**无**。 **OPEN retained**：r4/funnel/gR45 · R4/FUNNEL · G-R4-5 · MS3≠R4 · `releaseEvidence=false` · ≠HA · **covering 08 ≠ product closed**。

---

## 4. Wire spot-check（Ban docs-only / local-fake-alone · 08）

| # | 抽查 | 结果 |
|---|------|------|
| W1 | File | `apps/worker/src/production-equivalent-funnel-08-eval.ts` · **确认** production-equivalent eval matrix wire |
| W2 | Export / marker | `PRODUCTION_EQUIVALENT_FUNNEL_08_EVAL_WIRED = true` · `runProductionEquivalentFunnel08Eval(` · **real export** · **确认** |
| W3 | Holdout matrix | `FUNNEL_08_HOLDOUT_CASES` — multi-lang / fullstack / ambiguity / injection · leafTrackId backend/(nodejs\|java\|go\|python) · **确认** |
| W4 | Produce+bind | `writeFileSync` → `production-equivalent-funnel-08-release.json` + `…-thresholds.json` · digests · per-leaf Recall@K · wrong-track=0 hard-zero · P95/成本预注册 · **real produce+bind** · **确认** |
| W5 | Honesty pins | `releaseEvidence: false` hardcoded · note Ban local fake alone · UC Alternate · live B2 `notLocalFakeAlone=true` · **Ban fake cover / local-fake-alone · 确认** |

---

## 5. Harness status

| 项 | 观察 |
|----|------|
| File | `harness/g-r4-5-funnel-covered-count-batch4b-08-eval.md` |
| Status string | **`executed:awaiting_post_prove_dual`** |
| 是否自钉 `post_prove_dual_pass` | **否** · Ban自批 · **确认** |
| Dual receipts 表 | pre-exec BOTH PASS on `77b9d57` named · post-prove dual **not_run** · 本路径 = e2e-ha post-prove · rag-route **仍须独立** · alone≠dual · **勿代签** |
| Lifecycle | L3 coding+dedicated prove **done** · L4 post-prove dual **awaiting** · L5 nail **not_run** · Ban self-nail · no second knife |
| Dual PASS ≠ next | harness **硬钉** Dual PASS ≠ next knife auto-authorize · covering 08 ≠ product closed · **确认** |
| Flags in harness | `r4ProductClosed=false` · `funnelProductClosed=false` · `gR45Closed=false` · `batch4bOnly=true` · `coveredCountInvented=false` · `releaseEvidence=false` · **与 receipt 一致** |
| 本刀不翻 | harness 显式 **本刀不翻** product flags · product close = separate knife · tip **`1c2ed8c`** honesty non-flip **retained** · **确认** |
| Scope | Batch4b = **仅** 08 eval true-cover · Ban invent · Ban wash Batch4 tip **`9b8b9a7`** / prove **`b0f5c50`** · **确认** |

---

## 6. Spot-checks / Blockers

| # | 抽查项 | 结果 |
|---|--------|------|
| S1 | Tip `0e58386` = HEAD | **Y** · 非挡 |
| S2 | Pre-exec `77b9d57` · prior nail `9b8b9a7` · Batch4 prove `b0f5c50` | **确认** · Ban wash |
| S3 | 独立 2× prove EXIT | **2×0** · 见 §2 |
| S4 | coveredCount=8 honest **7→8** · Ban invent | evidence+EG2+MD **一致** · `coveredCountInvented=false` · **确认** |
| S5 | 08 covered · refuse cleared · `notLocalFakeAlone=true` · 02A–07 retained | **确认** |
| S6 | Real eval wire produce+bind（§4）· ≠ docs-only · ≠ local-fake-alone | **确认** |
| S7 | Product flags 仍 false · 本刀不翻 | r4/funnel/gR45 **全部 false** · **确认** |
| S8 | Harness awaiting · 未自钉 dual_pass | **确认** |
| S9 | Ban wash Batch4/Batch3b/Batch3/Batch2b/Batch2/Batch1/product-close/EG3 | harness/receipt **硬钉** · elevation via new eval wire ≠ wash prior refuse · **确认** |
| S10 | Ban MS3=R4 · batch4bOnly · releaseEvidence=false · alone≠dual · zero coding beyond review · 无 `.env*` · 无 Meridian · 无 commit/push · 未写 rag-route · covering 08 ≠ product closed | **确认** |

### Blockers

| 域 | Blocker？ | 说明 |
|----|-----------|------|
| 本域 · post-prove honesty | **无阻塞** | 独立 EXIT 2×0 · coveredCount=8 honest 7→8 · 08 covered · refuse cleared · `notLocalFakeAlone=true` · real eval wire · flags 仍 false · harness 仍 awaiting · tip match · Ban wash / Ban invent / Ban自批齐 |
| 配对 `mw-rag-route` | **须独立** | alone ≠ dual · 不代签 · 本审未写 pair 路径 |
| R4/FUNNEL product · G-R4-5 · `gR45Closed` | **仍 OPEN** | Ban假关 · 本刀不翻 · EXIT=0 ≠ product closed · covering 08 ≠ product closed · Dual PASS ≠ next auto-authorize · no second knife |
| MS3 = R4 | **否** | Ban MS3=R4 · `ms3EqualsR4Closed=false` |
| `releaseEvidence` / HA | **false / ≠HA** | 硬钉 |

**本域 post-prove blockers = 无阻塞。** 本 pass **≠** dual 齐 · **≠** R4/FUNNEL/G-R4-5 product closed · **≠** Dual PASS = next knife auto-authorize · **≠** second knife · **≠** HA · **≠** invent · **covering 08 ≠ product closed**。
---

## 7. Hard pin 确认表

| Pin | 本审 |
|-----|------|
| Verdict = honesty only · EXIT 2×0 + honest **7→8**（08 covered · refuse cleared · `notLocalFakeAlone=true` · real eval wire）+ flags false + harness 未自钉 | **确认** |
| Ban自批 `post_prove_dual_pass` · harness 仍 `executed:awaiting_post_prove_dual` | **确认** |
| alone≠dual · pair `mw-rag-route` independently · 本审未写 pair · 勿代签 · Dual PASS ≠ next · no second knife | **确认** |
| 本刀不翻：`r4ProductClosed=false` · `funnelProductClosed=false` · `gR45Closed=false` | **确认** |
| coveredCount **8** = prove emission · Ban invent · `coveredCountInvented=false` · `batch4bOnly=true` · 08 covered · 02A–07 retained | **确认** |
| Wire：`production-equivalent-funnel-08-eval.ts` produce+bind release+thresholds · Ban docs-only · Ban local-fake-alone | **确认** |
| Ban wash `9b8b9a7`/`b0f5c50` · `85be7ad`/`9aa1be4` · Batch3/Batch2b/Batch2/Batch1/product-close/EG3 · Ban MS3=R4 | **确认** |
| STILL OPEN R4/FUNNEL/G-R4-5 · `releaseEvidence=false` · ≠HA · covering 08 ≠ product closed · zero coding beyond review · no commit/push · 未读 `.env*` · 未触 Meridian · tip `0e58386` · contrast `77b9d57` · prior nail `9b8b9a7` | **确认** |
---

## 8. Ban wash / Ban invent / Ban假关 清单

| Ban | 裁定 |
|-----|------|
| Invent coveredCount without evidence · docs-only fake 08 · local-fake-alone · forge / silent matrix | **Ban · 确认未犯** · coveredCount=8 via 08 eval wire+all pins affirmed · `notLocalFakeAlone=true` · `coveredCountInvented=false` |
| Wash Batch4 `9b8b9a7`/`b0f5c50`（07 covered / 08 refuse）· Batch3b `85be7ad`/`9aa1be4` · Batch3/Batch2b/Batch2/Batch1/product-close/EG3 | **Ban · 确认未洗** · flags 仍 false · Batch4bOnly · elevation via new eval wire ≠ wash prior refuse into fake 8 |
| Claim R4/FUNNEL/G-R4-5 product closed from EXIT=0 / coveredCount=8 / 08 covered · silent flip flags true | **Ban** · honesty pass ≠ product closed · covering 08 ≠ product closed · flags **全部 false** |
| MS3=R4 · self-nail `post_prove_dual_pass` · Dual PASS=next auto-authorize · second knife · alone=dual · 自批 · 代写 rag-route | **Ban** · harness 仍 awaiting |
| HA / suite green / `releaseEvidence=true` / Meridian / `.env*` / Cloud Agent | **Ban** |
---

## 9. Sign-off

| 项 | 值 |
|----|-----|
| **Verdict** | **pass** |
| **Scope** | **post-prove honesty gate only** |
| **CMD+EXIT** | `pnpm r4-funnel-covered-count-batch4b-08-eval:prove` → **0** · `pnpm r4-eg2-funnel-covered:prove` → **0**（独立复跑 · ~11:34 PT） |
| **Honest结局** | coveredCount **8**（**7→8 honest**）· 08 **covered** · refuse **cleared** · `notLocalFakeAlone=true` · 02A–07 **retained covered** · `batch4bOnly=true` · `coveredCountInvented=false` · **本刀不翻** `r4ProductClosed=false` · `funnelProductClosed=false` · `gR45Closed=false` |
| **Wire** | `production-equivalent-funnel-08-eval.ts` real produce+bind release+thresholds · Ban docs-only · Ban local-fake-alone |
| **STILL OPEN** | R4/FUNNEL product · G-R4-5 · MS3≠R4 · `releaseEvidence=false` · ≠HA · **08 covered ≠ product closed** |
| **Harness** | **`executed:awaiting_post_prove_dual`** |
| **Tip** | **`0e58386`** match **Y** · pre-exec **`77b9d57`** · prior nail **`9b8b9a7`** · Batch4 prove **`b0f5c50`** |
| **alone ≠ dual** | pair `mw-rag-route` **须独立** · 本审 **未写** pair · Ban自批 dual_pass · **勿代签** |
| **Dual PASS ≠ next auto-authorize** · **no second knife** | **硬钉** |
| **本审动作** | 仅写本 review · 零 product coding · 未 commit/push · 未翻 harness · 未读 `.env*` · 未触 Meridian |

*Post-prove · mw-e2e-ha · G-R4-5 / FUNNEL coveredCount Batch4b 08 eval · 2026-09-23 ~11:34 PT · pass honesty · EXIT 2×0 · coveredCount=8（7→8 · Ban invent）· 08 covered · refuse cleared · notLocalFakeAlone=true · real eval wire · 02A–07 retained · flags false · awaiting_post_prove_dual · Ban invent · Ban wash Batch4 9b8b9a7/b0f5c50 · Ban docs-only · Ban local-fake-alone · Ban自批 · alone≠dual · 勿代签 rag-route · releaseEvidence=false · ≠HA · EXIT=0≠product closed · covering 08 ≠ product closed · Dual≠next knife · STILL OPEN R4/FUNNEL/G-R4-5*

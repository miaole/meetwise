# 审查归档 — **G-R4-5 / FUNNEL coveredCount Batch4（07+08）** · **post-prove** · mw-e2e-ha

**Verdict**：**`pass`**（范围：**post-prove 诚实性 only** — 独立复跑 EXIT **2×0** + **诚实 partial elevation**（`RAG-FUNNEL-07` **covered** · `productionConsumerWired=true` · `RAG-FUNNEL-08` **not_covered** · refuse `production-equivalent eval matrix not evidenced` · coveredCount **6→7** · `batch4CoveredCount=1` · `coveredCountInvented=false` · `batch4Only=true` · **Ban invent coveredCount=8** · 02A/02B/03/04/05/06 **retained covered** · 08 **not elevated**）+ **本刀不翻** product flags（`r4ProductClosed=false` · `funnelProductClosed=false` · `gR45Closed=false`）+ harness **未**自钉 `post_prove_dual_pass` · real wire spot-check **pass**（`free-text-route-funnel.ts` import+invoke + `main.ts` bind）· **≠** invent 8 · **≠** invent 08 covered · **≠** docs-only fake cover · **≠** wash Batch3b `85be7ad`/`9aa1be4` · Batch3 `bd3a800`/`e468de9` · Batch2b · Batch2 · Batch1 · product-close · EG3 · rem/SSOT/EXPLICIT · **≠** MS3=R4 · **≠** HA · **≠** suite green · **≠** `releaseEvidence=true` · **≠** 自批 dual_pass · **≠** alone=dual · **≠** Dual PASS = next knife auto-authorize · **≠** second knife · **≠** product / G-R4-5 closed）  
**审稿人**：`mw-e2e-ha`（对抗独立审 · **实现方自批无效 / 拒绝** · 本审 **零 coding beyond 本 review 文件** · **未读 `.env*`** · **未触 Meridian** · Ban Cloud Agent · **未 commit / 未 push** · **未翻 harness 为 `post_prove_dual_pass`** · **未写** pair rag-route 路径）  
**日期**：2026-09-23 ~11:13 PT  
**送审路径（唯一 canonical）**：`ai-docs/delivery/reviews/REQUEST-2026-09-23-g-r4-5-funnel-covered-count-batch4-post-prove-mw-e2e-ha.md`  
**配对**：`…-post-prove-mw-rag-route.md`（**须独立签** · **alone ≠ dual** · **Ban自批** `post_prove_dual_pass` · 本审不代签 / 不等待 / **未复制** rag-route）  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **本刀诚实结局**：true-cover **仅** 07 via production consumer **real import+invoke** · `productionConsumerWired=true` · coveredCount **7**（诚实 **6→7 partial** · **NOT 8**）· 08 honest refuse · 02A–06 retained · **本刀不翻** product flags（仍 **false**）· **STILL OPEN**：R4/FUNNEL product · G-R4-5 · MS3≠R4 · 08 · `batch4Only=true` · Key×3 O3 honesty_red **非阻塞**

**关键诚实框（PASS = EXIT 2×0 AND honest 6→7 partial · FAIL if invent 8 / invent 08 / wash / flip）**：
- EXIT **2×0** **且** 诚实 partial（07 covered · wired=true · 08 not_covered + refuse · coveredCount=**7** · real wire · 无 invent 8 · 无 wash）**且** product flags **保持 false** = **正确对抗结局** → verdict **pass**
- **PASS = honesty of partial elevation + honest refuse on 08 ≠ invent 8 ≠ product closed ≠ HA ≠ G-R4-5 closed**
- **FAIL** 条件：invent coveredCount=8 · invent 08 covered · tip mismatch · prove fail · self-nail `post_prove_dual_pass` · wash Batch3b · silent flip product flags · claim HA / `releaseEvidence=true` · docs-only fake 07
- **EXIT=0 ≠ R4/FUNNEL/G-R4-5 product closed ≠ HA ≠ Dual PASS = next auto-authorize**

**硬钉（must survive）**：
- Verdict = **honesty only**（post-prove）· pass/fail 仅对独立 EXIT + honest **6→7**（07 covered · wired=true · 08 refuse）+ flags 不翻 + harness 未自钉
- Ban自批 `post_prove_dual_pass` — harness 须仍 `executed:awaiting_post_prove_dual` 直至 BOTH peers PASS
- alone≠dual · pair `mw-rag-route` independently · 本审 **不写** rag-route 路径 · **勿代签**
- Dual PASS ≠ next knife auto-authorize · no second knife
- **本刀不翻**：`r4ProductClosed=false` · `funnelProductClosed=false` · `gR45Closed=false`
- Ban invent coveredCount=8 · Ban invent 08 covered · Ban docs-only fake cover · Ban wash Batch3b **`85be7ad`**/`9aa1be4` · Ban MS3=R4
- STILL OPEN：R4/FUNNEL product · G-R4-5 · 08 · MS3≠R4 · `releaseEvidence=false` · ≠HA
- zero coding beyond review file · no commit/push · no harness flip
- Pre-exec tip contrast：**`1e8edcd`**（pre-exec PASS · coveredCount then **6** · 07/08 **not_covered**）→ prove tip **`b0f5c50`** · prior nail Batch3b **`85be7ad`**
---
## 0. 结论表（范围钉死）

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass** |
| **Scope** | **post-prove honesty only** — NOT product closed · NOT invent 8 · NOT invent 08 · NOT wash · NOT HA · NOT suite · NOT self-nail dual_pass · NOT alone=dual · NOT next auto-authorize · NOT second knife |
| 实现方自批 / REQUEST stub | **无效 / 拒绝**；本审独立裁定 |
| Knife status | **`executed:awaiting_post_prove_dual`** · **NOT** `post_prove_dual_pass` |
| 本刀诚实结局 | **07 elevation + 08 refuse** · wired=true · coveredCount **6→7** · 02A–06 retained · 08 not_covered · product flags NON-flip · real wire |
| coveredCount / 07 / 08 | **7** / **covered** / **not_covered** · Ban invent 8 · Batch4Only |
| productionConsumerWired / 08 refuse | **true**（07）· refuse `production-equivalent eval matrix not evidenced` · **诚实 prove emission · 非 invent** |
| Flags（须保持 false） | `r4ProductClosed=false` · `funnelProductClosed=false` · `gR45Closed=false` |
| STILL OPEN | R4/FUNNEL product · G-R4-5 · 08 · MS3≠R4 · `releaseEvidence=false` · ≠HA |
| alone ≠ dual | **硬钉** · pair `mw-rag-route` independently · Ban自批 · 本审未写 pair · 勿代签 |

---

## 1. Tip / HEAD

| 项 | 值 |
|----|-----|
| Expected tip / HEAD | **`b0f5c50`** / full `b0f5c5018124f34a937fdfb02dfa47f415d9b07e` |
| 本审 `git rev-parse HEAD` | **`b0f5c5018124f34a937fdfb02dfa47f415d9b07e`** |
| `git log -1 --oneline` | `b0f5c50 feat(g-r4-5): FUNNEL coveredCount Batch4 07+08 under authorize (awaiting_post_prove_dual)` |
| Branch | `feat/mysql-schema-skeleton` · **确认** |
| Tip match | **Y** · 与 expected tip **一致** · **非挡** |
| Pre-exec BOTH PASS | REQUEST tip **`1e8edcd`** · ours `…-mw-e2e-ha.md`（non-post-prove）docs gate · spot-confirmed · 当时 matrix coveredCount **6** / 02A–06 **covered** / 07–08 **not_covered** · **非挡** |
| Prior continuity（≠ wash） | Batch3b tip nail **`85be7ad`** / prove **`9aa1be4`** · coveredCount **4→6** · 05/06 covered · 07/08 then not_covered · **本刀不 wash** |
| Contrast | pre-exec **`1e8edcd`**（coveredCount=6 · 07/08 not_covered）→ tip **`b0f5c50`** · **6→7** · 07 wired=true · 08 refuse · **诚实 partial** · **非** invent 8 · **非** wash Batch3b |
| Harness status | **`executed:awaiting_post_prove_dual`** · **NOT** silently flipped to `post_prove_dual_pass` · Ban自批 |

---

## 2. 独立复跑 CMD+EXIT（cwd `/workspace/meetwise` · ~11:13 PT）

| # | CMD | EXIT | 诚实读法 |
|---|-----|------|----------|
| 1 | `pnpm r4-funnel-covered-count-batch4:prove` | **0** | dedicated Batch4 07+08 true-cover · live assessors：07 **all pins true** incl. `productionConsumerWired=true` → **covered** · 08 pins incomplete → **not_covered** · refuse `production-equivalent eval matrix not evidenced` · emit coveredCount **7** · `batch4CoveredCount=1` · `coveredCountInvented=false` · `batch4Only=true` · product flags **false** · `releaseEvidence=false` · Ban invent 8 · Ban self-nail dual_pass · Ban docs-only fake cover |
| 2 | `pnpm r4-eg2-funnel-covered:prove` | **0** | EG2 Batch4-aware matrix · coveredCount **matches** live assessors（got=7 expect=7）· 02A/02B/03/04/05/06/07 **covered** · 08 **still not_covered** · 01 ≠ invent covered · `inventCovered=false` · `releaseEvidence=false` |

**EXIT table**：**2×0** — 与实现方收据一致；本审**独立复跑**确认（**不采信**自报）。script names 与 harness-frozen CMD **一致**（`r4-funnel-covered-count-batch4:prove` · `r4-eg2-funnel-covered:prove`）。

**EXIT=0 ≠ R4/FUNNEL/G-R4-5 product closed ≠ invent 8 ≠ invent 08 covered ≠ HA ≠ suite ≠ `releaseEvidence=true` ≠ self-nail `post_prove_dual_pass` ≠ Dual PASS = next auto-authorize ≠ second knife。**

**关键对抗读法**：EXIT **2×0** **同时** coveredCount **7** = **诚实 6→7 partial**（07 elevation via wired=true + real wire · 08 honest refuse）**同时** product flags **保持 false** = **诚实 PASS**（正确 partial elevation · 正确拒绝 invent 8 / 假关），**不是**“绿=产品已关 / G-R4-5 closed / coveredCount=8”。

Prove stdout 关键钉（独立观察）：B0 awaiting + flags false · B1 07 covered=`true`/`productionConsumerWired=true` · B2 08 covered=`false`/`releaseReceiptsBound=false` · B3 `batch4Only=true` · `coveredCountInvented=false` · r4/funnel/gR45 **false** · `ms3EqualsR4Closed=false` · `releaseEvidence=false` · coveredIds=[07] · batch4CoveredCount=1 · funnel08RefuseReason cites production-equivalent · B4 inventCovered=false · got=7 expect=7 · Ban invent coveredCount=8 · 02A–06 retained · 07 covered · 08 not_covered · B5/B6 receipts · roundtrip flags false · Ban wash Batch3b · Ban MS3=R4 · Ban self-nail · Ban docs-only fake cover · awaiting · EG2 M1 got=7 expect=7 · 08 not_covered

---

## 3. Receipt / matrix flags（复跑后 · partial elevation vs OPEN）

源：`receipts/2026-09-23-g-r4-5-funnel-covered-count-batch4-evidence.json` · `receipts/2026-09-17-g-r4-5-eg2-funnel-covered-matrix.json` · `rag-funnel-01-08-covered-matrix.md` · `receipts/2026-09-23-g-r4-5-funnel-covered-count-batch4-prove.md`（独立复跑后重读）

| Flag / 项 | 值 | 裁定 |
|-----------|-----|------|
| `kind` | `FunnelCoveredCountBatch4Evidence` | Batch4 evidence · **确认** |
| `batch4Only` | **true** | Batch4Only · **硬钉** |
| `funnel07Covered` | **true** | assessor affirmed · **诚实 emission** · **确认** |
| `funnel08Covered` | **false** | honest refuse · **确认** |
| `coveredIds` | `["RAG-FUNNEL-07"]` | Batch4 elevates **07 only** · **确认** |
| `batch4CoveredCount` | **1** | = 07 this knife · **确认** |
| matrix / total `coveredCount` | **7** | **6→7 honest partial** · Batch1 03/04 + Batch2 02A + Batch2b 02B + Batch3b 05/06 + Batch4 07 · Ban invent 8 · **确认** |
| `coveredCountInvented` / matrix `inventCovered` | **false** / **false** | Ban invent · **确认** |
| `funnel07Assessor.productionConsumerWired` | **true** | **真实 pin** · **诚实 prove emission** · **确认** |
| `funnel07RefuseReason` | **null** | wire affirmed · refuse cleared · **确认** |
| `funnel08RefuseReason` | **`production-equivalent eval matrix not evidenced`** | exact refuse string · **确认** |
| matrix `RAG-FUNNEL-02A`/`02B`/`03`/`04`/`05`/`06` | **covered** | retained · Ban wash · **确认** |
| matrix `RAG-FUNNEL-07` | **covered** | Batch4 true-cover · wired · **确认** |
| matrix `RAG-FUNNEL-08` | **not_covered** | refuse retained · Ban invent 08 · **确认** |
| `r4ProductClosed` | **false** | **本刀不翻** · **STILL OPEN** · Ban假关 · **确认** |
| `funnelProductClosed` | **false** | **本刀不翻** · **STILL OPEN** · Ban假关 · **确认** |
| `gR45Closed` | **false** | **本刀不翻** · **STILL OPEN** · **硬钉** |
| `ms3EqualsR4Closed` | **false** | Ban MS3=R4 · **确认** |
| `releaseEvidence` | **false** | **硬钉** · ≠ release · ≠HA |

**Elevated**：`RAG-FUNNEL-07` → **covered** · **6→7** · wired=true。 **Refused**：`RAG-FUNNEL-08` → **not_covered** · refuse `production-equivalent eval matrix not evidenced` · Ban invent 8。 **Product closed this knife**：**无**。 **OPEN retained**：r4/funnel/gR45 · R4/FUNNEL · G-R4-5 · MS3≠R4 · 08 · `releaseEvidence=false` · ≠HA。 Prove MD 对齐：awaiting · 07 true · wired true · 08 refuse · count 7 · flags false · Ban invent 8 / Ban wash / Ban self-nail。

---

## 4. Wire spot-check（Ban docs-only fake cover · 07）

| # | 抽查 | 结果 |
|---|------|------|
| W1 | File | `apps/worker/src/free-text-route-funnel.ts` · **确认** production free-text funnel path |
| W2 | Import | L20–27：`createFreeTextScopeRevision` · `classifyFreeTextScope` from `@meetwise/db` · **real import** · **确认** |
| W3 | 07 invoke | L76–78 `createFreeTextScopeRevision(` · L87 `classifyFreeTextScope(` inside `runFreeTextAllowlistedScopeFunnel` · retrievalGranted/toolGrant **false** · **real invoke** · **确认** |
| W4 | main bind | `apps/worker/src/main.ts` L39–41 import · L619–628 `freeTextAllowlistedScopeFunnel = { wired, run }` · throw if !wired · `void freeTextAllowlistedScopeFunnel.run` live bind · **确认** |
| W5 | Marker + ≠ docs-only | `FREE_TEXT_ALLOWLISTED_SCOPE_FUNNEL_WIRED = true` · comments alone ≠ cover · live B1 wired=true · **Ban fake cover · 确认** |

---

## 5. Harness status

| 项 | 观察 |
|----|------|
| File | `harness/g-r4-5-funnel-covered-count-batch4.md` |
| Status string | **`executed:awaiting_post_prove_dual`** |
| 是否自钉 `post_prove_dual_pass` | **否** · Ban自批 · **确认** |
| Dual receipts 表 | pre-exec BOTH PASS on `1e8edcd` named · post-prove dual **not_run** · 本路径 = e2e-ha post-prove · rag-route **仍须独立** · alone≠dual · **勿代签** |
| Lifecycle | L3 coding+dedicated prove **done** · L4 post-prove dual **awaiting** · L5 nail **not_run** · Ban self-nail · no second knife |
| Dual PASS ≠ next | harness **硬钉** Dual PASS ≠ next knife auto-authorize · Ban invent coveredCount=8 · **确认** |
| Flags in harness | `r4ProductClosed=false` · `funnelProductClosed=false` · `gR45Closed=false` · coveredCount **7** · 07 **covered** · 08 **not_covered** · `batch4Only=true` · `coveredCountInvented=false` · `releaseEvidence=false` · **与 receipt 一致** |
| 本刀不翻 | harness 显式 **本刀不翻** product flags · product close = separate knife · tip **`1c2ed8c`** honesty non-flip **retained** · **确认** |
| Scope | Batch4 = **仅** 07+08 true-cover attempt · honest partial 07 · refuse 08 · Ban invent 8 · Ban wash Batch3b tip **`85be7ad`** / prove **`9aa1be4`** · **确认** |

---

## 6. Spot-checks / Blockers

| # | 抽查项 | 结果 |
|---|--------|------|
| S1 | Tip `b0f5c50` = HEAD · branch `feat/mysql-schema-skeleton` | **Y** · 非挡 |
| S2 | Pre-exec `1e8edcd` · prior nail `85be7ad` · Batch3b prove `9aa1be4` | **确认** · Ban wash |
| S3 | 独立 2× prove EXIT | **2×0** · 见 §2 |
| S4 | coveredCount=7 honest **6→7** · Ban invent 8 | evidence+EG2+MD **一致** · `coveredCountInvented=false` · **确认** |
| S5 | 07 covered · wired=true · 08 not_covered + refuse · 02A–06 retained | **确认** |
| S6 | Real wire import+invoke（§4）· ≠ docs-only | **确认** |
| S7 | Product flags 仍 false · 本刀不翻 | r4/funnel/gR45 **全部 false** · **确认** |
| S8 | Harness awaiting · 未自钉 dual_pass | **确认** |
| S9 | Ban wash Batch3b/Batch3/Batch2b/Batch2/Batch1/product-close/EG3 | harness/receipt **硬钉** · partial via real wire ≠ wash · **确认** |
| S10 | Ban MS3=R4 · batch4Only · releaseEvidence=false · alone≠dual · zero coding beyond review · 无 `.env*` · 无 Meridian · 无 commit/push · 未写 rag-route · Ban invent 8 | **确认** |

### Blockers

| 域 | Blocker？ | 说明 |
|----|-----------|------|
| 本域 · post-prove honesty | **无阻塞** | 独立 EXIT 2×0 · coveredCount=7 honest 6→7 · 07 covered + wired · 08 refuse · real wire · flags 仍 false · harness 仍 awaiting · tip match · Ban wash / Ban invent 8 / Ban自批齐 |
| 配对 `mw-rag-route` | **须独立** | alone ≠ dual · 不代签 · 本审未写 pair 路径 |
| R4/FUNNEL product · G-R4-5 · `gR45Closed` | **仍 OPEN** | Ban假关 · 本刀不翻 · EXIT=0 ≠ product closed · Dual PASS ≠ next auto-authorize · no second knife |
| FUNNEL-08 | **仍 not_covered** | refuse retained · Ban invent 8 |
| MS3 = R4 | **否** | Ban MS3=R4 · `ms3EqualsR4Closed=false` |
| `releaseEvidence` / HA | **false / ≠HA** | 硬钉 |

**本域 post-prove blockers = 无阻塞。** 本 pass **≠** dual 齐 · **≠** R4/FUNNEL/G-R4-5 product closed · **≠** Dual PASS = next knife auto-authorize · **≠** second knife · **≠** HA · **≠** invent coveredCount=8。
---

## 7. Hard pin 确认表

| Pin | 本审 |
|-----|------|
| Verdict = honesty only · EXIT 2×0 + honest **6→7**（07 covered · productionConsumerWired=true · 08 refuse · real wire）+ flags false + harness 未自钉 | **确认** |
| Ban自批 `post_prove_dual_pass` · harness 仍 `executed:awaiting_post_prove_dual` | **确认** |
| alone≠dual · pair `mw-rag-route` independently · 本审未写 pair · 勿代签 · Dual PASS ≠ next · no second knife | **确认** |
| 本刀不翻：`r4ProductClosed=false` · `funnelProductClosed=false` · `gR45Closed=false` | **确认** |
| coveredCount **7** = prove emission · Ban invent 8 · `coveredCountInvented=false` · `batch4Only=true` · 07 covered · 08 not_covered · 02A–06 retained | **确认** |
| Wire：`free-text-route-funnel.ts` import+invoke + `main.ts` bind · Ban docs-only fake cover | **确认** |
| 08 refuse string `production-equivalent eval matrix not evidenced` · Ban invent 08 covered | **确认** |
| Ban wash `85be7ad`/`9aa1be4` · `bd3a800`/`e468de9` · Batch2b/Batch2/Batch1/product-close/EG3 · Ban MS3=R4 | **确认** |
| STILL OPEN R4/FUNNEL/G-R4-5 · 08 · `releaseEvidence=false` · ≠HA · zero coding beyond review · no commit/push · 未读 `.env*` · 未触 Meridian · tip `b0f5c50` · contrast `1e8edcd` · prior nail `85be7ad` | **确认** |
---

## 8. Ban wash / Ban invent / Ban假关 清单

| Ban | 裁定 |
|-----|------|
| Invent coveredCount=8 · invent 08 covered · docs-only fake 07 · forge / silent matrix | **Ban · 确认未犯** · coveredCount=7 via 07 wired+affirmed · 08 refuse retained · real import+invoke · `coveredCountInvented=false` |
| Wash Batch3b `85be7ad`/`9aa1be4` · Batch3 `bd3a800`/`e468de9` · Batch2b/Batch2/Batch1/product-close/EG3 | **Ban · 确认未洗** · flags 仍 false · Batch4Only · partial elevation via new wire ≠ wash prior |
| Claim R4/FUNNEL/G-R4-5 product closed from EXIT=0 / coveredCount=7 · silent flip flags true | **Ban** · honesty pass ≠ product closed · flags **全部 false** |
| MS3=R4 · self-nail `post_prove_dual_pass` · Dual PASS=next auto-authorize · second knife · alone=dual · 自批 · 代写 rag-route | **Ban** · harness 仍 awaiting |
| HA / suite green / `releaseEvidence=true` / Meridian / `.env*` / Cloud Agent | **Ban** |
---

## 9. Sign-off

| 项 | 值 |
|----|-----|
| **Verdict** | **pass** |
| **Scope** | **post-prove honesty gate only** |
| **CMD+EXIT** | `pnpm r4-funnel-covered-count-batch4:prove` → **0** · `pnpm r4-eg2-funnel-covered:prove` → **0**（独立复跑 · ~11:13 PT） |
| **Honest结局** | coveredCount **7**（**6→7 honest partial** · **NOT 8**）· 07 **covered** · `productionConsumerWired=true` · 08 **not_covered** · refuse `production-equivalent eval matrix not evidenced` · 02A–06 **retained covered** · `batch4Only=true` · `coveredCountInvented=false` · **本刀不翻** `r4ProductClosed=false` · `funnelProductClosed=false` · `gR45Closed=false` |
| **Wire** | `free-text-route-funnel.ts` real import+invoke + `main.ts` bind · Ban docs-only fake cover |
| **STILL OPEN** | R4/FUNNEL product · G-R4-5 · 08 · MS3≠R4 · `releaseEvidence=false` · ≠HA |
| **Harness** | **`executed:awaiting_post_prove_dual`** |
| **Tip** | **`b0f5c50`** match **Y** · branch `feat/mysql-schema-skeleton` · pre-exec **`1e8edcd`** · prior nail **`85be7ad`** · Batch3b prove **`9aa1be4`** |
| **alone ≠ dual** | pair `mw-rag-route` **须独立** · 本审 **未写** pair · Ban自批 dual_pass · **勿代签** |
| **Dual PASS ≠ next auto-authorize** · **no second knife** | **硬钉** |
| **本审动作** | 仅写本 review · 零 product coding · 未 commit/push · 未翻 harness · 未读 `.env*` · 未触 Meridian |

*Post-prove · mw-e2e-ha · G-R4-5 / FUNNEL coveredCount Batch4 07+08 · 2026-09-23 ~11:13 PT · pass honesty · EXIT 2×0 · coveredCount=7（6→7 partial · Ban invent 8）· 07 covered · productionConsumerWired=true · real wire · 08 not_covered · refuse production-equivalent eval matrix not evidenced · 02A–06 retained · flags false · awaiting_post_prove_dual · Ban invent · Ban wash Batch3b 85be7ad/9aa1be4 · Ban docs-only fake cover · Ban自批 · alone≠dual · 勿代签 rag-route · releaseEvidence=false · ≠HA · EXIT=0≠product closed · Dual≠next knife · STILL OPEN R4/FUNNEL/G-R4-5 · 08 still open*

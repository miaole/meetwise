# Review — Knife **F7** · **MS2 facets on product path**（执行前验收门 · mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-17（~00:55 PT；本审只读 · **零 coding · 零 prove · 零 Live · 零 Key · 零 flip · 零 forge serving · 零 commit**）  
**结论**：**pass**（限：F7 harness/slice/eval/REQUEST 文档门诚实够格；**≠ FUNNEL-01 closed**；**≠ forge MetadataReviewReceipt serving**；**≠ R4 closed / ≠ 题域已隔离 / ≠ R1 closed / ≠ G-R4-5 closed**；F6=`post_prove_dual_pass` **≠** FUNNEL-01/G-R4-5 closed / MS2 facets served / MS product-done；F5=`post_prove_dual_pass` **≠** G-R4-5 closed；F4=`post_prove_dual_pass` **≠** R1 closed / flip；本刀正确不 coding/prove/forge/flip；**双域 PASS ≠ 授权 coding**（另需显式「授权 F7 coding+prove」）；MS3/G-R4-3 **不**并入本刀 · **Ban flip without authorize** · **Ban self-approve**）  
**硬钉**：**MS1 true** · **MS2 still false** · **MS3 still false** · **G-R4-5 STILL OPEN** · **sole 恰 5** · **releaseEvidence=false** · **Ban forge** · **Ban flip without authorize** · **Ban self-approve** · **≠ R4 / FUNNEL / R1 / G-R4-5 closed** · **≠ HA** · **≠ suite green** · **G-R4-3 STILL OPEN**（parallel · not preferred）· planned CMD `pnpm r4-p-meta-ms2-facets-product:prove` = **`not_run:pre_dual` · not implemented** · **双域 PASS ≠ 授权 coding**（另需显式「授权 F7 coding+prove」）· Closing MS2 alone **≠** FUNNEL-01/R4/G-R4-5 closed（MS3 remain）· **Ban claiming R4 closed** · **Ban claiming FUNNEL-01 closed** · **Ban claiming G-R4-5 closed** · **Ban forge serving**  
**配对**：mw-e2e-ha · 本审不代签  
**HEAD**：`081b774`（`feat/mysql-schema-skeleton` · F6 close SHA = docs `post_prove_dual_pass` + open F7 REQUEST · F6 prove HEAD `2c06d6a` · 本审未改树）

覆盖 REQUEST：`REQUEST-2026-09-17-r4-f7-p-meta-ms2-facets-product-mw-rag-route.md`  
对照：`harness/r4-f7-p-meta-ms2-facets-product.md` · `r4-f7-p-meta-ms2-facets-product.slice.md` · `eval/r4-f7-p-meta-ms2-facets-product.eval.md` · status §13 · **G-R4-5 / MS2** · `harness/r4-domain-isolation.md` §2 / §6c.3 · Prior F6 **`post_prove_dual_pass`**（MS1 wired · `routedServingProductConsumerWired=true` · contract.wired=true · **`facetsServedOnProductPath=[]`** · `standardDeployProductHandoff=false` · **MS2/MS3 still false** · G-R4-5 STILL OPEN · Ban forge）· Prior F5 **`post_prove_dual_pass`** · Prior F4 **`post_prove_dual_pass`**（G-R4-3 STILL OPEN · ≠ R1 closed · ≠ flip）· Parallel `g7-ui-live-rerun-after-chromium` **does not block** · spot `r4-p-meta-serving-product-remaining.ts`（MS1 true · facetsServed **empty** · MS3 false）· `r4-p-meta-ms1-product-wire.ts`（`MS1_…_WIRED=true`）· SOLE_WIRING_ALLOWLIST **恰 5**（`scripts/run-e2e-isolated.mjs`）· **无** F7 prove script / helper / proof artifact（`r4-p-meta-ms2-facets-product.ts` / `.proof.ts` **不存在**）

---

## 专家问答（REQUEST Q1–Q7）

| # | 问 | 答 |
|---|----|----|
| 1 | harness M1–M6 是否诚实登记 **MS2 facets on product path**（G-R4-5 / MS2），且 ≠ FUNNEL-01 closed / ≠ forge serving？ | **同意**。M1 钉 MS2 facets on product path（G-R4-5）；M2 硬钉含 Ban forge · `releaseEvidence=false` · sole 恰 5 · **MS1 true** · **MS3 false** · MS2 alone ≠ FUNNEL · Ban flip without authorize · ≠ R4/FUNNEL/R1/G-R4-5 closed；M3 = e2e-ha + rag-route only（no model-op）；M4 CMD `not_run:pre_dual`；M5 coding gate 仍须 F7 pre-exec dual + authorize；M6 REQUEST pair · no self-approve。**MS2** = serve required secondary facets on product MetadataReviewReceipt path（仍 `facetsServedOnProductPath=[]` · ≠ forge）。关齐 MS2 alone **仍 ≠** FUNNEL-01/R4/G-R4-5 closed（MS3 remain）。 |
| 2 | 是否同意：**本刀无 coding / 无 prove / 无 flip / 无 Live**，仅 harness + slice + eval + REQUEST？ | **同意**。`pnpm r4-p-meta-ms2-facets-product:prove` = **planned / not implemented / `not_run:pre_dual`**（无 package script · 无 helper · 无 proof file · 无 `r4-p-meta-ms2-facets-product.ts`）；本审零 coding / 零 prove / 零 flip / 零 Live / 零 Key / 零 forge / 零 commit；禁 invent EXIT；禁本 prep forge facets serving。 |
| 3 | 是否同意：**省略** `mw-model-op` REQUEST（无 MODEL-OP domain need）？ | **同意**。本刀域 = MS2 **facets on product path**（G-R4-5 / MS2）；**非** classify/route/MODEL-OP wire 刀。omit `mw-model-op` **正确**。 |
| 4 | 是否同意：**R4 仍 NOT closed**；F6 dual ≠ FUNNEL-01 closed ≠ G-R4-5 closed ≠ 题域已隔离；本刀关齐 MS2 面仍 ≠ FUNNEL-01/R4/G-R4-5 全家关（MS3 remain）？ | **同意（硬钉）**。status / G-R4-5：R4 **NOT closed** · G-R4-5 **STILL OPEN**。F6 dual = MS1 wired · **`facetsServedOnProductPath=[]`** · MS2/MS3 still false · **≠** FUNNEL-01 · **≠** G-R4-5 closed · **≠** 题域已隔离。Wiring MS2 alone 仍并列挡：MS3 · P-R1 / wrong_track / 其它 PREREQ。**Ban claiming R4 closed** · **Ban claiming FUNNEL-01 closed** · **Ban claiming G-R4-5 closed** · **Ban claiming R1 closed**。 |
| 5 | 是否同意：MS1 stays true · MS3 stays false · coding gate = MAIN + NHP-ADV + F1–F6 dual done · 仍须 **F7 pre-exec dual + authorize** · 本 REQUEST dual **不**自动授权 coding / forge / flip？ | **同意（硬钉）**。前置 MAIN / NHP-ADV / F1–F6 **均** `post_prove_dual_pass`（前置 **satisfied**）；spot：`MS1_METADATA_REVIEW_RECEIPT_PRODUCT_SERVING_CONSUMER_WIRED=true` · `facetsServedOnProductPath=[]` · `standardDeployProductHandoff=false`。**仍**须本刀 pre-exec dual PASS + meetwise **显式「授权 F7 coding+prove」**。**双域 PASS ≠ 授权 coding** · **≠** authorize forge/flip · **≠** this knife done · **≠** MS2 facets served · **≠** G-R4-5 closed。**MS1 pin 必须保持 true** · **MS3 本刀保持 false**。 |
| 6 | 是否同意：保持 `releaseEvidence=false`；sole 恰 5；禁 flip default / open DELETE / HA / suite green / **Ban claiming R4/FUNNEL/G-R4-5 closed** / **Ban forge** / **Ban flip without authorize** / **Ban self-approve**？ | **同意**。`releaseEvidence=false` · ≠HA · ≠ suite green · sole allowlist **恰 5 未翻**（spot：`SOLE_WIRING_ALLOWLIST` = wiring/ping/qdrant-backed/vectorstore-adapter/vectorstore-qdrant · F7 NOT on list）· 禁 flip default without authorize / open DELETE · 禁实现方自批 · ≠ R5 retired ≠ sole cutover ≠ G1 flip · **Ban claiming R4 closed** · **Ban claiming FUNNEL-01 closed** · **Ban claiming G-R4-5 closed** · **Ban forge serving** · **Ban flip without authorize** · **Ban self-approve**。 |
| 7 | 是否同意：MS3 / G-R4-3 仍开且 = **not preferred** next · parallel UI Live **不**阻塞本刀？ | **同意（硬钉）**。MS3 = `standardDeployProductHandoff=false`（sibling · out of scope）。F4 honesty 钉 PR1-A true · PR1-B/C false · G-R4-3 **STILL OPEN** · **≠** R1 closed · **≠** flip。本 F7 = **clearest remaining = MS2 facets on product path**（G-R4-5 / MS2）only。MS3 deploy + G-R4-3 fail-closed flip = **parallel · not preferred** · **Ban flip without authorize** · **不得**并入本 F7。Parallel UI Live re-run **does not block / substitute** F7。 |

### RAG / metadata · MS2 facets product 焦点（补充）

| 点 | 裁定 |
|----|------|
| **MS2 facets vs F6 dual** | F6 = MS1 product wire **`post_prove_dual_pass`**（consumer wired · contract.wired=true · **`facetsServedOnProductPath=[]`** · deploy handoff **false** · MS2/MS3 still false · G-R4-5 STILL OPEN · Ban forge）。F7 = **serve required secondary facets** on product path（docs REQUEST · **≠** F6 re-run · **≠** claim MS2 already served · **≠** flip MS1 back）。 |
| **Plan vs served** | `PRODUCT_FACET_SERVING_PLAN` / `requiredFacets` **named/pinned**（F5 progress）· **`facetsServedOnProductPath=[]`**（MS2 still open）· named plan **≠** facets served · **≠** FUNNEL-01 closed。 |
| **Forge bans / receipt honesty** | **Ban forging MetadataReviewReceipt facets serving** · 禁把 docs gate / 未来 EXIT=0 / 假 facets 写成 MS2 done / FUNNEL-01 closed / G-R4-5 closed。facets 诚实 = **still empty** until real product-path serve + prove（另授权后）。 |
| **G-R4-5 STILL OPEN** | MS1 true · MS2 still false · MS3 still false · wiring MS2 alone **≠** FUNNEL-01 closed（MS3 remain）· **≠** R4 closed · **01A ≠ 01**。 |
| **相对 F4 / MS3** | F4 = P-R1 fail-closed honesty · G-R4-3 STILL OPEN · no flip。MS3 = standard deploy handoff · still false。**不得**把 F4 dual / MS3 sibling 写成 R1 closed / flip authorized / 并入本 F7。**Ban flip without authorize**。 |
| **分层（不可坍缩）** | … → F6 MS1 product-wire dual → **F7 MS2 facets docs gate** →（日后）F7 coding+prove+post-prove（须显式「授权 F7 coding+prove」）→（仍开）MS3 · G-R4-3 · wrong_track / 其它 PREREQ · **R4 NOT closed** · **FUNNEL-01 NOT closed until MS1–MS3 product wired** · **G-R4-5 STILL OPEN until MS3**。任一层绿 ≠ 上层关闭。**双域 PASS ≠ 授权 coding**。 |
| **false-green 禁** | 禁：docs gate→R4/题域已隔离/FUNNEL-01/R1/G-R4-5 closed；F6 dual→FUNNEL-01/G-R4-5 closed/MS2 served/forge OK；F4 dual→R1 closed/flip；本 dual→coding/forge/flip authorize / knife done；**双域 PASS→授权 coding**；EXIT=0 later→HA/suite/R4/FUNNEL/G-R4-5；实现方自批；缺 model-op 当挡板；forge facets serving / flip default / open DELETE / sole 扩；MS3/G-R4-3 并入本刀；UI Live 替代本刀；把 MS1 pin 翻回 false。 |
| **CMD** | `pnpm r4-p-meta-ms2-facets-product:prove` = **`not_run:pre_dual` · not implemented**；future green **≠** FUNNEL-01/R4/G-R4-5 closed · **≠** authorize forge serving。 |

---

## 批准范围

**批**：F7 **docs/REQUEST 门**（harness M1–M6 · MS2 facets on product path · slice · eval stubs · REQUEST pair）；≠ FUNNEL-01 closed；≠ forge serving；≠R4关 / ≠题域已隔离 / ≠R1 closed / ≠G-R4-5 closed；omit `mw-model-op`；零 coding/prove/flip/Live；coding gate 仍钉 **F7 pre-exec dual PASS + 显式「授权 F7 coding+prove」**（MAIN+NHP+F1–F6 前置已满足 **不足**单独开闸）；F6=`post_prove_dual_pass` **≠** FUNNEL-01/G-R4-5 closed / MS2 served；**MS1 stays true** · **MS3 stays false**；MS3/G-R4-3 **不**并入 · Ban flip without authorize · Ban self-approve；UI Live **不**阻塞；`releaseEvidence=false` · ≠HA · ≠ suite green · sole 恰 5 · **MS2 still false** · G-R4-5 STILL OPEN · Ban claiming R4 closed · Ban claiming FUNNEL-01 closed · Ban claiming G-R4-5 closed · Ban forge serving · **双域 PASS ≠ 授权 coding**。

**不批**：R4 关、题域已隔离、R1 closed、RAG-FUNNEL-01 closed、G-R4-5 closed、把 F6 dual / F5 dual / F4 dual / 本 docs gate 写成 R4/FUNNEL-01/G-R4-5 closed/MS2 served/MS product-done/R1 closed/本刀完成、本 dual 自动 authorize coding/prove/forge/flip、**把双域 PASS 当「授权 F7 coding+prove」**、HA、suite green、`releaseEvidence=true`、实现方自批、forge MetadataReviewReceipt facets serving、flip default / open DELETE、sole cutover / G1 flip、把 MS3 deploy / G-R4-3 fail-closed flip 并入本 F7、把 UI Live 当 F7 替代、把 MS1 pin 翻回 false。

---

## 仍开

- F7 CMD `pnpm r4-p-meta-ms2-facets-product:prove` = **`not_run:pre_dual`**（未实现）
- coding / forge / flip **仍 gated** on **F7 pre-exec dual PASS + 显式「授权 F7 coding+prove」**（本 pass **本身不**授权；**双域 PASS ≠ 授权 coding**）
- **MS1 true** · **MS2 still false** · **MS3 still false** · **G-R4-5 / P-META serving STILL OPEN**；FUNNEL-01 / R4 / 题域隔离 / R1 **NOT closed**
- MS3 standard deploy handoff **仍开**（wiring MS2 alone ≠ FUNNEL-01/G-R4-5 closed）
- G-R4-3 / P-R1 **仍开**（parallel · F4 honesty only · **≠** R1 closed · **≠** flip · **not preferred** · **Ban flip without authorize**）
- F6=`post_prove_dual_pass` · facets empty · **≠** FUNNEL-01 · **≠** G-R4-5 closed · **≠** MS2 served
- F4=`post_prove_dual_pass` · G-R4-3 STILL OPEN · **≠** R1 closed · **≠** flip
- wrong_track / 其它 PREREQ 并列仍开
- Parallel UI Live = separate · **does not block**

---

## 非宣称

禁止：R4 closed、题域已隔离、R1 closed、RAG-FUNNEL-01 closed、G-R4-5 closed、F6 dual = FUNNEL-01 / G-R4-5 closed / MS2 served / forge OK、F4 dual = R1 closed / flip、HA、suite green、`releaseEvidence=true`、本 prep 已 prove/coding/forge/flip/Live/Key/commit、本 dual = coding/forge/flip authorize / knife done、**双域 PASS = 授权 F7 coding+prove**、实现方自批、sole allowlist 已翻、forge MetadataReviewReceipt facets serving、flip default / open DELETE、把 MS2 facets 文档闸写成 R4/FUNNEL/G-R4-5 closed、把 MS3/G-R4-3 并入本刀。

---

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-17-r4-f7-p-meta-ms2-facets-product-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-17-r4-f7-p-meta-ms2-facets-product-mw-rag-route.md`
- HEAD：`081b774`（`feat/mysql-schema-skeleton` · F6 close SHA）
- 对照：harness M1–M6 · MS2 facets product · slice · eval · status §13 · G-R4-5/MS2 · F6=`post_prove_dual_pass` ≠ FUNNEL/G-R4-5 closed · **MS1 true · MS2 still false · MS3 still false** · G-R4-5 STILL OPEN · G-R4-3 STILL OPEN · SOLE **恰 5** · no F7 prove artifact · Ban forge · Ban flip without authorize · Ban self-approve
- **零 prove · 零 coding · 零 Live · 零 Key · 零 flip · 零 forge · 零 commit · releaseEvidence=false · ≠HA · ≠R4关 · ≠题域已隔离 · ≠FUNNEL-01 closed · ≠R1 closed · ≠G-R4-5 closed · sole 恰 5 · Ban R4 closed · Ban FUNNEL-01 closed · Ban G-R4-5 closed · Ban forge · Ban flip without authorize · Ban self-approve · 双域 PASS ≠ 授权 coding**
- blockers：**无**（本 pre-exec 文档门）；coding/prove/forge/flip **仍禁**直至 F7 dual PASS + **显式「授权 F7 coding+prove」**

---

*Review · mw-rag-route · F7 MS2 facets on product path pre-exec · 2026-09-17 ~00:55 PT · pass（docs gate only）· HEAD=081b774 · MS1 true · MS2 still false · MS3 still false · G-R4-5 STILL OPEN · G-R4-3 parallel open · sole 恰 5 · releaseEvidence=false · ≠FUNNEL-01/R4/R1/G-R4-5 closed · ≠HA · ≠suite green · Ban forge · Ban flip without authorize · Ban self-approve · zero prove · 双域 PASS ≠ 授权 coding（另需显式「授权 F7 coding+prove」）*

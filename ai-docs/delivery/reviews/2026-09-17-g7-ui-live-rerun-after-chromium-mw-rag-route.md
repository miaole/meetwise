# Review — G7 · **UI Live re-run after chromium**（执行前验收门 · mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-17（~00:09 PT；本审只读 · **零 Live · 零 coding · 零 install · 零 invent Key · 零 commit · 零 sole flip**）  
**结论**：**pass**（限：UI Live re-run after chromium harness/slice/eval/REQUEST **文档门**诚实够格；**chromium prereq ≠ UI green**；**Key set ≠ UI green**；**A′ honesty_red retained**；**R5 green-risk / sole ≠ retired / sole 恰 5 / G6 OPEN** pins retained；Live **`not_run:pre_dual`** until dual PASS + separate authorize；本 dual **不**自动授权 Live；R5/sole **不**并入本刀）  
**硬钉**：**≠ suite green** · **≠ G6 closed** · **≠ R5 closed/retired** · **≠ R2/R4 closed** · **≠ HA** · **≠ covered** · **≠ sole cutover** · **chromium prereq ≠ UI green** · **Key set ≠ UI green** · **EXIT=0 ≠ suite/G6/R5/HA** · **A′ honesty_red retained** · **R5 SEPARATE** · **sole 恰 5** · **`releaseEvidence=false`** · **no invent Key** · Live = **`not_run:pre_dual` · not authorized** · **Ban fake green** · **Ban claiming suite/G6/R5/UI green**  
**配对**：mw-e2e-ha · 本审不代签 · HEAD `639134f`

覆盖 REQUEST：`REQUEST-2026-09-17-g7-ui-live-rerun-after-chromium-mw-rag-route.md`  
对照：`harness/g7-ui-live-rerun-after-chromium.md` · `g7-ui-live-rerun-after-chromium.slice.md` · `eval/g7-ui-live-rerun-after-chromium.eval.md` · CR `harness/g7-chromium-ui-runner-prereq.md`（**`post_prove_dual_pass`** · ≠ UI green）· CR post-prove `2026-09-17-g7-chromium-ui-runner-prereq-post-prove-mw-rag-route.md`（**pass**）· A′ `harness/g7-key-live-x3.md`（`honesty_red_key_set` · UI EXIT=1 chromium miss · **retained**）· `harness/g6-e2e-iso-blocked.md`（G6 **OPEN**）· `harness/r5-retirement-sole-stack-status.md`（sole **恰 5** · default pgvector-legacy · R5 **SEPARATE**）· spot `package.json` `e2e:ui:isolated` · loader exists（**未** source）· **无** Live this prep

**本审动作**：对照 REQUEST Q1–Q4 vs harness/slice/eval/CR/A′/G6/R5 · 假绿扫描 · sole allowlist 恰 5 spot · **零** Live · **零** invent Key · **未读** `.env*` · **零** sole flip / DELETE · **omit** `mw-model-op` 仍正确。

---

## 0. 结论表

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass**（docs gate only） |
| **批准范围** | UI Live re-run plan docs/REQUEST 门诚实够格：CMD=`pnpm e2e:ui:isolated` only · Key loader + NEW_SHELL_STATUS · hard pins（chromium ≠ UI green · A′ retained · R5 SEPARATE · sole 恰 5 · Ban fake green · `releaseEvidence=false`）· gate dual⇒authorize⇒execute⇒post-prove · no model-op |
| **明确不批** | suite green · G6 closed · R5 closed/retired · sole cutover · R2/R4 closed · UI green · covered · HA · `releaseEvidence=true` · invent Key · 本 dual = Live authorize · CR = UI green · rewrite A′ honesty_red · 实现方自批 |
| Live / Key | **`not_run:pre_dual`** · loader path documented · **未** source / invent |
| Prior CR | **`post_prove_dual_pass`** · runner-prereq only · **≠** UI green · **≠** RAG migrated · **≠** R5 retired |
| A′ | honesty_red_key_set **retained** |
| `releaseEvidence` | **false** |
| 阻塞（本域文档闸） | **无** |

---

## 1. 专家问答（REQUEST Q1–Q4）

| # | 问 | 答 |
|---|----|----|
| **1** | Agree UI Live re-run plan must retain **R5 green-risk / sole ≠ retired / sole 恰 5 / G6 OPEN** pins even after chromium dual-closed？ | **同意（硬钉）。** CR `post_prove_dual_pass` = binary/runner-start honesty only · **≠** RAG migrated · **≠** R5 retired · **≠** sole cutover。Default iso still **pgvector-legacy** → **R5 green-risk**。G6 still **OPEN**。Sole allowlist spot = **恰 5**（wiring/ping/qdrant-backed/adapter/vectorstore-qdrant）· 本刀 **未**扩。**R5 isolated SEPARATE**。 |
| **2** | Agree **chromium prereq ≠ UI green** · **Key set ≠ UI green** · **EXIT=0 ≠ suite green ≠ R2/R4/G6 closed ≠ R5 closed** · **Ban fake green**？ | **同意（硬钉）。** harness/eval/slice/REQUEST 均钉这些硬句。即使日后 authorized UI EXIT=0，仍 **≠** suite green · **≠** R2/R4/G6 closed · **≠** R5 closed · **≠** HA · **≠** sole cutover。**Ban fake green**。 |
| **3** | Agree Key inject = `source …/load-model-api-key.sh` · NEW_SHELL_STATUS · dual before execute；post-prove after；`not_run:pre_dual` now · no invent Key / no `.env*`？ | **同意（硬钉）。** ONLY authorized loader · name-only probe · never paste Key · never invent · never read `.env*`。Gate：**pre-exec dual pass ⇒ may execute**（仍须 **separate authorize**）⇒ EXIT honesty ⇒ **post-prove dual**。Now = **`not_run:pre_dual`**。本审 **未** source / 未跑 Live。 |
| **4** | Agree A′ honesty_red **retained** · R5 isolated **SEPARATE** · this knife does **not** close sole/R5/G6 · `releaseEvidence=false`？ | **同意（硬钉）。** A′ `post_prove_dual_pass:honesty_red_key_set` · UI EXIT=1 chromium miss · Key set · **retained** · CR **不得** rewrite A′ to green。本刀 = UI Live re-run plan only · **不**关 sole/R5/G6。`releaseEvidence=false` · ≠HA。 |

### RAG / fixture · runner 焦点（补充）

| 点 | 裁定 |
|----|------|
| **chromium vs RAG** | CR dual-closed = env/runner layer only · **≠** RAG migrated · **≠** R5 retired · **≠** sole-stack default |
| **UI Live vs R5** | Default `e2e:ui:isolated` still rides **pgvector-legacy** isolation → **R5 green-risk** even if UI EXIT later = 0 · **R5 SEPARATE** prove still required |
| **相对 A′** | A′ = live Key×3 honesty_red（EXIT 1/1/1 · UI chromium miss）。本刀草稿 authorized UI re-run。**不得**把 A′ dual / CR dual 写成 UI/suite/G6/R5 green。 |
| **相对 G6** | G6 = sole 整套复跑 + inventory。UI Live alone **≠** G6 closed。 |
| **相对 sole** | sole allowlist **恰 5** retained · **≠** retired · **≠** cutover · **≠** G1 flip |
| **相对 R2/R4** | still **open** · UI Live ≠ domain isolation closed |
| **false-green 禁** | 禁：CR→UI green；Key set→UI green；本 dual→Live authorize；UI EXIT=0→suite/G6/R5/HA；实现方自批；invent Key；R5/sole 并入本刀；rewrite A′ honesty_red |

---

## 2. CMD / 状态（RAG 读法 · 未执行）

| CMD / 项 | Status now | RAG / fixture 诚实读法 |
|----------|------------|------------------------|
| CR install/version/smoke | **0/0/0** · `post_prove_dual_pass` | runner-prereq honesty · **≠** UI green · **≠** RAG migrated · **≠** R5 retired |
| `source …/load-model-api-key.sh` | **`not_run:pre_dual`** | ONLY path · **Key set ≠ UI green** |
| NEW_SHELL_STATUS probe | **`not_run:pre_dual`** | name only · never print value |
| **`pnpm e2e:ui:isolated`** | **`not_run:pre_dual`** | Exact CMD only · EXIT honesty later · still **R5 green-risk** on default iso |
| `e2e:isolated` / `verify:e2e-performance` | **out of scope** | HTTP/suite remain SEPARATE / prior A′ |
| Sole allowlist | **恰 5** | 本刀 **不**扩 · **≠** sole cutover |

---

## 3. 批准范围

**批**：UI Live re-run after chromium **docs/REQUEST 门**（harness UI-A–D · M1–M7 · slice · eval stubs · REQUEST pair）；CMD=`pnpm e2e:ui:isolated` only；Key loader discipline；chromium prereq ≠ UI green；Key set ≠ UI green；A′ honesty_red retained；R5 SEPARATE · sole 恰 5 · G6 OPEN pins；omit `mw-model-op`；零 Live this prep；Live gate 仍钉 **dual PASS + separate authorize**；`releaseEvidence=false` · Ban fake green · Ban suite/G6/R5/UI/HA green。

**不批**：suite green、G6 closed、R5 closed/retired、sole cutover、R2/R4 closed、UI green、covered、HA、`releaseEvidence=true`、本 dual 自动 authorize Live、实现方自批、invent Key、把 CR 写成 UI green、把 A′ honesty_red rewrite 为绿、把本刀写成 R5/sole/G6 closed。

---

## 4. 仍开

- Live `pnpm e2e:ui:isolated` = **`not_run:pre_dual`**（未授权）
- Key inject / NEW_SHELL_STATUS = **`not_run:pre_dual`**
- Live **仍 gated** on **pre-exec dual PASS + separate meetwise execute authorize**
- G6 **OPEN** · R5 **OPEN SEPARATE**（pgvector-legacy green-risk）· sole **≠ retired** · sole allowlist **恰 5** · suite **not green** · UI **not green**
- R2 / R4 **still open** · ≠ 题域已隔离 · ≠ covered
- A′ honesty_red_key_set **retained** · A unset-era Key-blocked honesty **retained**
- post-prove **n/a** until after authorized execute

---

## 5. 非宣称

禁止：suite green、G6 closed、R5 closed/retired、sole cutover、R2/R4 closed、UI green、family green、covered、HA、`releaseEvidence=true`、本 prep 已 Live/coding/invent Key、本 dual = Live authorize / knife done、实现方自批、把 chromium `post_prove_dual_pass` 写成 UI green、把 Key set 写成 UI green、把 A′ honesty_red rewrite 为绿、把本刀写成 R5/sole/G6 closed。

---

## 6. 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-17-g7-ui-live-rerun-after-chromium-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-17-g7-ui-live-rerun-after-chromium-mw-rag-route.md`
- 对照：harness UI-A–D/M1–M7 · slice · eval · CR `post_prove_dual_pass` · A′ honesty_red retained · G6 OPEN · R5 SEPARATE · sole 恰 5 · CMD=`e2e:ui:isolated` only · no Live artifact this prep
- **零 Live · 零 coding · 零 invent Key · releaseEvidence=false · ≠HA · ≠ suite green · ≠ G6 closed · ≠ R5 closed · chromium prereq ≠ UI green · Key set ≠ UI green · A′ honesty_red retained · sole 恰 5 · R5 SEPARATE · Ban fake green**
- blockers：**无**（本 pre-exec 文档门）；Live **仍禁**直至 dual PASS + **separate authorize**

---

*Review · mw-rag-route · G7 UI Live re-run after chromium pre-exec · 2026-09-17 ~00:09 PT · **pass**（docs gate only）· HEAD `639134f` · chromium prereq ≠ UI green · A′ honesty_red retained · R5 SEPARATE · sole 恰 5 · G6 OPEN · Live not_run:pre_dual · execute needs dual PASS + separate authorize · Ban fake green · no invent Key · releaseEvidence=false · ≠HA · ≠ suite/G6/R5/UI green*

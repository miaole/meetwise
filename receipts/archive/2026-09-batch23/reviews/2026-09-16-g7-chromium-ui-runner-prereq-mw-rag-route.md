# Review — G7 · **chromium / UI runner prerequisite**（执行前验收门 · mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（~23:57 PT；本审只读 · **零 coding · 零 install · 零 Live re-run · 零 invent Key**）  
**结论**：**pass**（限：chromium / UI runner prereq harness/slice/eval/REQUEST 文档门诚实够格；**Key set ≠ UI green**；**≠ suite green / ≠ G6 closed / ≠ R5 closed**；**R5 SEPARATE**；本刀正确不 install/Live；本 dual **不**自动授权 install；R5/sole **不**并入本刀）  
**硬钉**：**≠ suite green** · **≠ G6 closed** · **≠ R5 closed** · **≠ HA** · **Key set ≠ UI green** · **install not authorized until dual PASS + separate authorize** · **R5 pgvector-legacy SEPARATE** · **releaseEvidence=false** · **no invent Key** · planned install = **`not_run:pre_dual` · not authorized** · **Ban claiming suite/G6/R5/UI green**  
**配对**：mw-e2e-ha · 本审不代签

覆盖 REQUEST：`REQUEST-2026-09-16-g7-chromium-ui-runner-prereq-mw-rag-route.md`  
对照：`harness/g7-chromium-ui-runner-prereq.md` · `g7-chromium-ui-runner-prereq.slice.md` · `eval/g7-chromium-ui-runner-prereq.eval.md` · A′ `harness/g7-key-live-x3.md`（UI EXIT=1 chromium miss · Key set · honesty_red）· `harness/g6-e2e-iso-blocked.md`（G6 OPEN）· R5/sole artefacts = **SEPARATE** · **无** install/Live this prep

---

## 专家问答（REQUEST Q1–Q7）

| # | 问 | 答 |
|---|----|----|
| 1 | harness M1–M6 是否诚实登记 chromium / UI runner prereq（CR-A–D），且 Key set ≠ UI green？ | **同意**。M1 钉 CR-A–D from A′ Key-set UI EXIT=1（`Executable doesn't exist`）；M2 硬钉含 ≠ suite/G6/R5/HA · Key set ≠ UI green · `releaseEvidence=false` · no invent Key · R5 SEPARATE；M3–M6 = experts/no model-op · install `not_run:pre_dual` · install gate · REQUEST pair。 |
| 2 | 是否同意：本刀无 coding / 无 install / 无 Live re-run，仅 harness + slice + eval + REQUEST？ | **同意**。`pnpm exec playwright install chromium` = **planned / not authorized / `not_run:pre_dual`**；Live `e2e:ui:isolated` = **`not_run:this_knife`**；本审零 coding / 零 install / 零 Live；禁 invent EXIT。 |
| 3 | 是否同意：省略 `mw-model-op` REQUEST？ | **同意**。本刀域 = UI runner / Playwright browser prereq honesty；**非** classify/route/MODEL-OP wire 刀。omit **正确**。 |
| 4 | 是否同意：G6 仍 OPEN · R5 仍开（SEPARATE）· suite 未绿；本刀关齐 install 面仍 ≠ G6/R5/suite 全家关？ | **同意（硬钉）**。G6 still OPEN（sole full re-run still required）。R5 pgvector-legacy **SEPARATE** still open — **Ban claiming R5 closed by this**。Suite **not green**。Install honesty alone **≠** G6/R5/suite/HA/R4/题域已隔离。 |
| 5 | 是否同意：install gate = pre-exec dual PASS + separate authorize · 本 dual **不**自动授权 install / Live？ | **同意（硬钉）**。本 pre-exec dual pass **≠** authorize install / Live re-run / coding · **≠** this knife done。须 **dual PASS + separate authorize**。 |
| 6 | 是否同意：保持 `releaseEvidence=false`；禁 invent Key / HA / suite green / Ban claiming R5 closed by this？ | **同意**。`releaseEvidence=false` · ≠HA · ≠ suite green · no invent Key · never paste Key · never read `.env*` · **Ban claiming R5 closed by this** · Ban G6/UI green。 |
| 7 | 是否同意：R5 pgvector-legacy / sole-stack **不**并入本刀（SEPARATE）？ | **同意（硬钉）**。本刀 = chromium / UI runner **prereq honesty only**。R5 fixture / sole-stack / G1 flip = **SEPARATE knives** · **不得**并入本刀当关闸。 |

### RAG / fixture · runner 焦点（补充）

| 点 | 裁定 |
|----|------|
| **UI runner prereq** | LIVE UI path：Key **required** **and** Playwright chromium binary **required**。A′ 证明 Key set **仍** UI fail → **Key set ≠ UI green**。 |
| **相对 A′** | A′ = live Key×3 honesty_red（EXIT 1/1/1）。本刀 = **chromium miss** 文档闸。**不得**把 A′ dual 写成 UI/suite/G6 green。 |
| **相对 G6** | G6 = sole 整套复跑 + inventory。Install chromium alone **≠** G6 closed。 |
| **相对 R5** | R5 = pgvector-legacy / mark-red / sole-stack。**SEPARATE** · **≠** closed by this knife。 |
| **false-green 禁** | 禁：docs gate→suite/G6/R5/UI green；Key set→UI green；本 dual→install/Live authorize；install later→G6/R5/suite/HA；实现方自批；invent Key；R5 并入本刀。 |

---

## 批准范围

**批**：chromium / UI runner prereq **docs/REQUEST 门**（harness M1–M6 · CR-A–D · slice · eval stubs · REQUEST pair）；Key set ≠ UI green；≠ suite/G6/R5/HA green；omit `mw-model-op`；零 coding/install/Live；install gate 仍钉 **dual PASS + separate authorize**；R5 **SEPARATE** 不并入；`releaseEvidence=false` · no invent Key · Ban suite/G6/R5/UI green。

**不批**：suite green、G6 closed、R5 closed/retired、UI green、HA、`releaseEvidence=true`、本 dual 自动 authorize install/Live、实现方自批、invent Key、sole cutover / G1 flip、把本刀写成 R5 closed、把 A′ honesty_red 写成 UI/suite green。

---

## 仍开

- Install CMD `pnpm exec playwright install chromium` = **`not_run:pre_dual`**（未授权）
- Live `e2e:ui:isolated` = **`not_run:this_knife`**
- install / Live **仍 gated** on **pre-exec dual PASS + separate authorize**
- G6 **OPEN** · R5 **OPEN SEPARATE** · suite **not green** · UI **not green**
- A′ honesty_red retained · HTTP api fail + suite fail **orthogonal** still open
- A unset-era Key-blocked honesty **retained**

---

## 非宣称

禁止：suite green、G6 closed、R5 closed、UI green、HA、`releaseEvidence=true`、本 prep 已 install/Live/coding、本 dual = install authorize / knife done、实现方自批、invent Key、把 chromium 文档闸写成 R5 closed、把 Key set 写成 UI green。

---

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-g7-chromium-ui-runner-prereq-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-g7-chromium-ui-runner-prereq-mw-rag-route.md`
- 对照：harness M1–M6 · CR-A–D · slice · eval · A′ UI chromium miss · G6 OPEN · R5 SEPARATE · no install/Live artifact this prep
- **零 install · 零 Live · 零 coding · 零 invent Key · releaseEvidence=false · ≠HA · ≠ suite green · ≠ G6 closed · ≠ R5 closed · Key set ≠ UI green · R5 SEPARATE**
- blockers：**无**（本 pre-exec 文档门）；install/Live **仍禁**直至 dual PASS + **separate authorize**

---

*Review · mw-rag-route · G7 chromium UI runner prereq pre-exec · 2026-09-16 ~23:57 PT · pass（docs gate only）· Key set ≠ UI green · G6 OPEN · R5 SEPARATE · zero install · install still needs dual PASS + separate authorize · Ban suite/G6/R5/UI green*

# Review — G7 · **chromium / UI runner prerequisite**（**post-prove** · mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-17（~00:04 PT）  
**结论**：**pass**（限：**install+minimal smoke 收据诚实** · runner prereq met · docs **未**假绿；**install ≠ UI green ≠ G6/R5/suite/HA** · **Key set ≠ UI green** · A′ honesty_red **retained** · **R5 SEPARATE** · Live **`not_run:this_knife`**）  
**硬钉**：**≠ suite green** · **≠ G6 closed** · **≠ R5 closed** · **≠ HA** · **Key set ≠ UI green** · **install ≠ UI green** · **R5 pgvector-legacy SEPARATE** · **`releaseEvidence=false`** · **no invent Key** · **Ban claiming suite/G6/R5/UI green** · **do NOT rewrite A′ honesty_red Key-set to green**  
**配对**：mw-e2e-ha · HEAD `639134f` · 刀状态 `executed:awaiting_post_prove_dual`

覆盖 REQUEST：`REQUEST-2026-09-16-g7-chromium-ui-runner-prereq-post-prove-mw-rag-route.md`  
前序 pre-exec：`2026-09-16-g7-chromium-ui-runner-prereq-mw-rag-route.md`（**pass** · docs gate）  
对照：`harness/g7-chromium-ui-runner-prereq.md` · `g7-chromium-ui-runner-prereq.slice.md` · `eval/g7-chromium-ui-runner-prereq.eval.md` · `receipts/2026-09-17-g7-chromium-ui-runner-prereq.md` · `.tmp/g7-chromium-ui-runner-prereq-20260917/` · A′ `harness/g7-key-live-x3.md`（honesty_red · UI EXIT=1 chromium miss · **retained**）· `harness/g6-e2e-iso-blocked.md`（G6 **OPEN**）· R5/sole = **SEPARATE**

**本审动作**：核对 CMD+EXIT vs receipt + `.tmp` logs · 独立 `--version` + launch smoke · docs 假绿扫描 · **零** invent Key · **未读** `.env*` · **零** commit secrets · **零** Live `e2e:ui:isolated` · **零** 自批 suite/G6/R5/UI green · **omit** `mw-model-op` 仍正确。

---

## 0. 结论表

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass**（runner-prereq honesty only） |
| **批准范围** | install EXIT=0 + version EXIT=0 + launch smoke EXIT=0 与收据一致；CR-A binary gap closed at env layer；CR-B–D hard pins；docs **未**假绿；R5 **SEPARATE**；A′ honesty_red **retained** |
| **明确不批** | suite green · G6 closed · R5 closed/retired · UI green · sole cutover · R4 closed · 题域已隔离 · HA · `releaseEvidence=true` · invent Key · smoke = Live UI green · 本刀 = R5 closed |
| Independent EXIT | `--version` **0** · launch smoke **0**（matches implementer） |
| Live UI | **`not_run:this_knife`** |
| `releaseEvidence` | **false** |

---

## 1. 专家问答（REQUEST Q1–Q7）

| # | 问 | 答 |
|---|----|----|
| **1** | harness/eval/slice 是否诚实登记 install+smoke EXIT=0，且 **install ≠ UI green ≠ G6/R5/suite/HA**？ | **同意。** harness §3/§7 · eval §2 · slice CMD 表 · receipt 均钉 EXIT=0 且硬钉 **≠** UI/suite/G6/R5/HA。独立核验一致。 |
| **2** | 是否同意：Live `e2e:ui:isolated` = **`not_run:this_knife`**；smoke ≠ Live suite green？ | **同意（硬钉）。** authorize = minimal verify only。smoke EXIT=0 = runner can start · **≠** Live UI suite green · **禁**把 smoke 写成 `e2e:ui:isolated` 绿。 |
| **3** | 是否同意：**省略** `mw-model-op` 仍正确？ | **同意。** 本刀域 = UI runner / Playwright browser prereq · **非** classify/route/MODEL-OP。omit **正确**。 |
| **4** | 是否同意：**G6 仍 OPEN · R5 仍开（SEPARATE）· suite 未绿**；本刀 install 面仍 ≠ 全家关？ | **同意（硬钉）。** G6 still OPEN。R5 pgvector-legacy **SEPARATE** still open — **Ban claiming R5 closed by this**。Suite **not green**。Install alone **≠** G6/R5/suite/HA/R4/题域已隔离。 |
| **5** | 是否同意：A′ honesty_red / Key-set **retained** · **禁** rewrite to green？ | **同意（硬钉）。** A′ `post_prove_dual_pass:honesty_red` · UI EXIT=1 chromium miss · Key set · **retained**。本刀 **不得** rewrite Live honesty_red_key_set to green。**Key set ≠ UI green** still true。 |
| **6** | 是否同意：保持 `releaseEvidence=false`；禁 invent Key / HA / suite green / **Ban claiming R5 closed by this**？ | **同意。** `releaseEvidence=false` · ≠HA · ≠ suite green · no invent Key · never paste Key · never read `.env*` · **Ban claiming R5 closed by this**。 |
| **7** | 是否同意：R5 pgvector-legacy / sole-stack **不**并入本刀（SEPARATE）？ | **同意（硬钉）。** 本刀 = chromium / UI runner **prereq honesty only**。R5 fixture / sole-stack / G1 flip = **SEPARATE knives** · **不得**并入本刀当关闸。 |

---

## 2. CMD / EXIT 核验（RAG / fixture / runner 读法）

| CMD | EXIT（实现方） | 本审独立 | RAG / fixture / runner 诚实读法 |
|-----|----------------|----------|--------------------------------|
| `pnpm -C apps/web exec playwright install chromium` | **0** | **确认 0** · install.log · chromium-1228 present | **CR-A**：binary env gap closed · **≠** RAG migrated · **≠** R5 retired · **≠** G6 closed · **≠** suite/UI green |
| `pnpm -C apps/web exec playwright --version` | **0** · `Version 1.61.1` | **重跑 EXIT=0** · `Version 1.61.1` | CLI present · runner tooling ok · **≠** Live UI green |
| chromium.launch headless smoke | **0** · `chromium_launch_smoke_ok` | **重跑 EXIT=0** · executable present | runner can start · **≠** `e2e:ui:isolated` green · **≠** family covered |
| `pnpm e2e:ui:isolated` | **`not_run:this_knife`** | **确认未跑** | full Live deferred · A′ honesty_red **retained** · **Key set ≠ UI green** |

**CR stance（rag-route）**：

| ID | 裁定 |
|----|------|
| **CR-A** | chromium binary **installed**（EXIT=0）— env gap closed at binary layer only |
| **CR-B** | **Key set ≠ UI green** — still true；install alone **≠** UI covered |
| **CR-C** | install authorized + executed after dual PASS + separate authorize — **met** |
| **CR-D** | hard pins · R5 SEPARATE · Ban suite/G6/R5/UI/HA green — **met in docs** |

**CMD note**：Playwright under `apps/web`；sanctioned `pnpm -C apps/web exec playwright …` — **同意**。

---

## 3. 仍开 / 阻塞

| 类 | 项 |
|----|-----|
| **本域 post-prove honesty** | **无阻塞**（install+smoke 诚实 · docs 无假绿 → pass） |
| **suite / G6 / R5 / UI / HA** | **仍开**：G6 OPEN · R5 OPEN SEPARATE · suite not green · UI not green（Live not_run）· ≠HA |
| **A′ / A** | A′ honesty_red retained · A unset-era Key-blocked honesty retained · HTTP api fail + suite fail orthogonal still open |
| **仍开 siblings** | R5 pgvector-legacy · G6 BUG-E2E-ISO · sole ≠ retired · ≠ RAG migrated · ≠ R4 / 题域已隔离 |

---

## 4. 非宣称

禁止：suite green、G6 closed、R5 closed/retired、UI green、sole cutover、R4 closed、题域已隔离、RAG migrated、HA、`releaseEvidence=true`、invent Key、把 smoke 写成 Live UI green、把 A′ honesty_red rewrite 为绿、实现方自批、把本刀写成 R5 closed、Key set = UI green。

---

## 5. 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-g7-chromium-ui-runner-prereq-post-prove-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-17-g7-chromium-ui-runner-prereq-post-prove-mw-rag-route.md`
- 对照：harness CR-A–D · slice · eval · receipt · `.tmp/g7-chromium-ui-runner-prereq-20260917/` · A′ honesty_red · G6 OPEN · R5 SEPARATE
- HEAD：`639134f`
- 本审：install/version/smoke **0/0/0** 诚实 · Live **`not_run:this_knife`** · **pass (runner-prereq honesty only)** · releaseEvidence=false · ≠HA · ≠ suite green · ≠ G6 closed · ≠ R5 closed · Key set ≠ UI green · install ≠ UI green · R5 SEPARATE · A′ honesty_red retained · no invent Key · omit model-op

---

*Review · mw-rag-route · G7 chromium UI runner prereq post-prove · 2026-09-17 ~00:04 PT · **pass** (runner-prereq honesty only) · install/version/smoke EXIT 0/0/0 · Live not_run:this_knife · releaseEvidence=false · ≠HA · G6 OPEN · R5 SEPARATE · Key set ≠ UI green · A′ honesty_red retained · Ban suite/G6/R5/UI green*

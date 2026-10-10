# Review — G7 · **UI Live re-run after chromium**（**post-prove** · mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-17（~00:19 PT）  
**结论**：**pass**（限：**Key-set · chromium-present · UI Live EXIT=1** 收据诚实 · docs **未**假绿；**chromium ran ≠ UI green ≠ G6/R5/suite/HA** · **Key set ≠ UI green** · A′ honesty_red **retained** · **R5 SEPARATE** · sole **恰 5** · **≠** sole cutover）  
**硬钉**：**≠ suite green** · **≠ G6 closed** · **≠ R5 closed/retired** · **≠ R2/R4 closed** · **≠ HA** · **≠ sole cutover** · **≠ UI green** · **Key set ≠ UI green** · **chromium prereq ≠ UI green** · **chromium ran ≠ UI green** · **EXIT=1 ≠ suite/G6/R5/HA** · **A′ honesty_red retained** · **R5 SEPARATE** · **sole 恰 5** · **`releaseEvidence=false`** · **no invent Key** · **Ban fake green** · **Ban claiming suite/G6/R5/UI green** · **do NOT rewrite A′ honesty_red to green**  
**配对**：mw-e2e-ha · receipt HEAD `db0d513` · 刀状态 `executed:awaiting_post_prove_dual` · **本审不代签 e2e-ha**

覆盖 REQUEST：`REQUEST-2026-09-17-g7-ui-live-rerun-after-chromium-post-prove-mw-rag-route.md`  
前序 pre-exec：`2026-09-17-g7-ui-live-rerun-after-chromium-mw-rag-route.md`（**pass** · docs gate）  
对照：`harness/g7-ui-live-rerun-after-chromium.md` · slice · eval · `receipts/2026-09-17-g7-ui-live-rerun-after-chromium.md` · `.tmp/g7-ui-live-rerun-after-chromium-20260917-001117/` · CR `g7-chromium-ui-runner-prereq`（**`post_prove_dual_pass`** · ≠ UI green · ≠ RAG migrated）· A′ `harness/g7-key-live-x3.md`（`honesty_red_key_set` · UI EXIT=1 chromium miss · **retained**）· `harness/g6-e2e-iso-blocked.md`（G6 **OPEN**）· R5/sole（default **pgvector-legacy** · sole **恰 5** · **≠ retired**）

**本审动作**：核对 CMD+EXIT vs receipt + `.tmp` EXIT/log · R5 banner · sole allowlist 恰 5 · docs 假绿扫描 · **零** invent Key · **未读** `.env*` · **零** commit secrets · **零** Live re-run · **零** Key loader source · **零** 自批 suite/G6/R5/UI green · **omit** `mw-model-op` 仍正确。

---

## 0. 结论表

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass**（honesty of red-with-chromium+Key only） |
| **批准范围** | EXIT=1 + NEW_SHELL_STATUS=set 与收据一致；default iso **pgvector-legacy / R5-MARKED-RED**；docs **未**假绿；A′ honesty_red **retained**；R5 **SEPARATE**；sole **恰 5 ≠ retired** |
| **明确不批** | suite green · G6 closed · R5 closed/retired · UI green · sole cutover · R2/R4 closed · 题域已隔离 · RAG migrated · HA · `releaseEvidence=true` · invent Key · chromium ran = UI green · Key set = UI green · rewrite A′ → green |
| Independent verify | EXIT.txt **EXIT=1** · NEW_SHELL_STATUS=**set** · log 14/4/4 · R5-MARKED-RED · **no re-run** |
| Live UI | **EXIT=1**（ran · not green） |
| `releaseEvidence` | **false** |

---

## 1. 专家问答（REQUEST Q1–Q5）

| # | 问 | 答 |
|---|----|----|
| **1** | Confirm EXIT：**NEW_SHELL_STATUS=set** · **`e2e:ui:isolated` EXIT=1** · and **EXIT≠0 ≠ suite green ≠ R2/R4/G6 closed ≠ R5 closed ≠ sole cutover ≠ HA**? | **确认。** EXIT=**1** · Key **set** · **≠** suite/R2/R4/G6/R5/sole/HA。 |
| **2** | Agree default iso still **pgvector-legacy / R5-MARKED-RED** · **R5 SEPARATE** · sole **恰 5** · **≠ retired** even after chromium dual-closed + this Live? | **同意（硬钉）。** log `[R5-MARKED-RED] … pgvector-legacy` · sole allowlist 恰 5 · UI EXIT=1 **不**关 R5/sole/G6。 |
| **3** | Agree **chromium prereq ≠ UI green** · **Key set ≠ UI green** · chromium **ran** ≠ UI green（EXIT still 1）· **Ban fake green**? | **同意（硬钉）。** chromium present & ran · still EXIT=1 · Ban fake green。 |
| **4** | Agree **A′ honesty_red retained** · this knife does **not** close sole/R5/G6 · `releaseEvidence=false` · no invent Key? | **同意（硬钉）。** A′ chromium-miss honesty_red **保留**；本刀 fail class = ingest/status · **不得** rewrite A′→green。 |
| **5** | Confirm implementer **must not** self-approve · write independent post-prove review? | **确认。** 拒绝自批 · 本审独立 · 配对 e2e-ha 独立。 |

---

## 2. CMD / EXIT 核验（RAG / fixture / UI 读法）

| CMD / artifact | EXIT（实现方） | 本审独立 | RAG / fixture / UI 诚实读法 |
|----------------|----------------|----------|------------------------------|
| NEW_SHELL_STATUS | **set** | **确认** · EXIT.txt + log L1 | Key present · **≠** RAG migrated · **≠** UI green |
| **`pnpm e2e:ui:isolated`** | **1** | **确认 1** · EXIT.txt · log `14 failed` / `4 passed` / `4 skipped` · `client_exited` · chromium projects ran（无 Executable-miss） | Live on **R5-MARKED-RED** pgvector-legacy iso · **≠** UI green ≠ sole cutover ≠ R5 retired ≠ G6 closed ≠ suite green ≠ HA |
| Dominant fail | ingested timeout | **确认** · `状态:ingested` 20s across golden/recruiting/screenshots/voice | product/ingest path red · **≠** family covered |
| full trio HTTP/perf | out of scope | **确认** UI-only knife | A′ trio honesty separate · **≠** this close |
| `.last-run.json` now `passed` | — | **stale caveat** · mtime after EXIT · **Ban** treating as green | 权威 = EXIT.txt + full.log + 14 fail dirs |

**R5 / sole stance（rag-route）**：

| ID | 裁定 |
|----|------|
| Default iso | **pgvector-legacy** · **R5-MARKED-RED** banner on this Live — **retained** |
| R5 | **SEPARATE** · UI Live EXIT=1 **≠** R5 closed ≠ R5 retired |
| sole | allowlist **恰 5** · **≠ retired** · **≠ cutover** · this knife **未**扩 allowlist |
| G6 | **OPEN** · UI-only ≠ G6 close |
| R2 / R4 | still **open** · UI Live ≠ 题域已隔离 |

---

## 3. 仍开 / 阻塞

| 类 | 项 |
|----|-----|
| **本域 post-prove honesty** | **无阻塞**（EXIT=1 诚实 · docs 无假绿 → pass） |
| **UI / suite / G6 / R5 / HA** | **仍开**：UI EXIT=1 · G6 OPEN · R5 OPEN SEPARATE · suite not green · ≠HA · sole ≠ retired |
| **A′** | honesty_red_key_set **retained**（historical chromium-miss）· this fresh EXIT=1 is **separate** honesty row |
| **仍开 siblings** | R5 pgvector-legacy · G6 BUG-E2E-ISO · sole ≠ retired · ≠ RAG migrated · ≠ R2/R4 / 题域已隔离 · ingest/status UI red |

---

## 4. 非宣称

禁止：suite green、G6 closed、R5 closed/retired、UI green、sole cutover、R2/R4 closed、题域已隔离、RAG migrated、HA、`releaseEvidence=true`、invent Key、chromium ran = UI green、Key set = UI green、把 A′ honesty_red rewrite 为绿、实现方自批、把本刀写成 R5 closed、把 stale `.last-run.json` passed 写成绿。

---

## 5. 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-17-g7-ui-live-rerun-after-chromium-post-prove-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-17-g7-ui-live-rerun-after-chromium-post-prove-mw-rag-route.md`
- 对照：harness · slice · eval · receipt · `.tmp/…-001117/` · A′ honesty_red · G6 OPEN · R5 SEPARATE · sole 恰 5
- receipt HEAD：`db0d513`
- 本审：EXIT=**1** · NEW_SHELL_STATUS=**set** · chromium **ran** · R5-MARKED-RED · 14/4/4 · **pass (honesty of red-with-chromium+Key only)** · releaseEvidence=false · ≠HA · ≠ suite green · ≠ G6 closed · ≠ R5 closed · Key set ≠ UI green · chromium ran ≠ UI green · A′ honesty_red retained · sole 恰 5 · no invent Key · omit model-op · **no re-run**

---

*Review · mw-rag-route · G7 UI Live re-run after chromium post-prove · 2026-09-17 ~00:19 PT · **pass** (honesty of red-with-chromium+Key only) · EXIT=1 · NEW_SHELL_STATUS=set · 14 failed/4 passed/4 skipped · chromium ran · R5-MARKED-RED · client_exited · releaseEvidence=false · ≠HA · G6 OPEN · R5 SEPARATE · sole 恰 5 · Key set ≠ UI green · A′ honesty_red retained · Ban suite/G6/R5/UI green · no invent Key*

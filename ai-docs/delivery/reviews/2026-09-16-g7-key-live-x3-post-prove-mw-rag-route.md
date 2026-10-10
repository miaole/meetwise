# Review — G7-A′ · **live Key×3** **post-prove**（Key-set re-run · mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（~23:56 PT）  
**结论**：**pass**（限：**红-with-Key-set 收据诚实** · EXIT **1/1/1** 与 logs/receipts 一致 · docs **未**假绿；**≠ family/suite green** · **≠ sole cutover** · **≠ R5 retired** · **G6 OPEN** · **≠ RAG migrated** · **Key set ≠ auto green**）  
**硬钉**：**Key present ≠ auto green ≠ covered ≠ SLO/LOAD ≠ HA** · **EXIT=0 ≠ suite green ≠ R2/R4/G6 closed**（本跑 EXIT=**1/1/1**）· **R5 green-risk / sole ≠ retired / G6 OPEN retained** · **R5 pgvector-legacy independent of Key** · **`releaseEvidence=false`** · **≠HA** · **A unset-era honesty retained** · **A′ Key-set live path ≠ family green** · **禁 invent/paste Key · 禁读 `.env*` · 禁自批 suite 绿**  
**配对**：mw-e2e-ha · HEAD `639134f` · 刀状态 `executed:awaiting_post_prove_dual`

覆盖 REQUEST：`REQUEST-2026-09-16-g7-key-live-x3-post-prove-mw-rag-route.md`（Key-set re-run refresh）  
前序 pre-exec：`2026-09-16-g7-key-live-x3-mw-rag-route.md`（**pass** · 文档闸）  
对照：`harness/g7-key-live-x3.md` · `g7-key-live-x3.slice.md` · `eval/g7-key-live-x3.eval.md` · Prior A `harness/g7-key-blocked-x3-honesty.md`（**retained**）· `harness/g6-e2e-iso-blocked.md`（G6 **OPEN**）  
对比：prior A′ unset-era dual ~23:29 PT（Key **unset** · UI `live_provider_key_missing`）— **superseded for live-path narrative** by this Key-set re-run；honesty-of-red stance **retained**；**A unset pin retained**.

**本审动作**：核对 EXIT 表 vs `.tmp/g7-key-live-x3-rerun-20260917-065057/` + cited e2e-receipts · name-only Key probe · docs 假绿扫描 · **零** invent/paste Key · **未读** `.env*` · **零** commit secrets · **零** sole flip · **零** suite 假绿自批 · **未**做全量 confirmatory re-run（收据充分）。

---

## 0. 结论表

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass**（honesty of red-with-Key-set receipts only） |
| **批准范围** | 红诚实：1/1/1 · Key **set** · R5 mark-red · sole ≠ retired · G6 OPEN · A retain · no fake-green docs · Key set ≠ uplift |
| **明确不批** | family/suite green · covered · sole cutover · R5 retired · G6 closed · R2/R4 closed · RAG migrated · SLO/LOAD/HA · `releaseEvidence=true` · Key set = green |
| Presence（name only） | Implementer **`NEW_SHELL_STATUS=set`** · 本审壳 **set** · never print value |
| Contrast unset-era | Prior A′ dual Key-unset honesty_red · this re-run Key-set still red（R5 api / Playwright / suite HTTP） |
| `releaseEvidence` | **false** |

---

## 1. 专家问答（REQUEST Q1–Q5）

| # | 问 | 答 |
|---|----|----|
| **1** | Agree EXIT **1/1/1** with Key **set** retains **R5 green-risk / sole ≠ retired / G6 OPEN**（no uplift from Key presence alone）？ | **同意（硬钉）。** 三 CMD 全红；iso **R5-MARKED-RED** pgvector-legacy；sole ≠ retired；G6 / BUG-E2E-ISO **仍 OPEN**。Key **set** **未**抬升 covered/G6/sole/RAG migrated。**R5 independent of Key**。 |
| **2** | Agree **Key present ≠ auto green ≠ covered ≠ SLO/LOAD ≠ HA** and **EXIT=0 ≠ suite green ≠ R2/R4/G6 closed**（here EXIT≠0 anyway）？ | **同意。** 本跑 EXIT=**1/1/1**；即便日后 Key+EXIT=0 仍 ≠ suite green ≠ R2/R4/G6 closed ≠ RAG migrated。 |
| **3** | Agree authorized Key loader only · **no invent Key** · **no read `.env*`** · A unset-era honesty **retained**？ | **同意。** 未见 invent/paste/`.env*`；A `post_change_dual_pass` unset honesty **保留**；本跑 receipt dir **0×** `live_provider_key_missing`（Key-set 对照成立）但仍红。 |
| **4** | Agree `verify:e2e-performance` EXIT=1 still embeds mark-red / R5 leaves narrative · ≠ RAG migrated？ | **同意。** receipt `e2e_performance_suite_failed:HTTP full E2E:exit=1`；suite 内 HTTP E2E 再触 R5 banner + `failureClass=api`；**≠** SLO/LOAD/HA/suite green · **≠** RAG migrated。 |
| **5** | Confirm post-prove dual required · ban self-approve / suite green / covered uplift / sole cutover claim？ | **确认。** 本 pass **仅**红诚实；禁自批绿 / covered uplift / sole cutover；配对 mw-e2e-ha 独立。 |

---

## 2. CMD / EXIT 核验（RAG / sole / R5 读法）

**Presence probe（name only）**：`NEW_SHELL_STATUS=set` · authorized loader only · **no invent Key**

| CMD | EXIT | RAG / sole / R5 诚实读法 | 核验源 |
|-----|------|--------------------------|--------|
| `pnpm e2e:isolated` | **1** | Key **set** · **R5-MARKED-RED** pgvector-legacy · `failureClass=api` · ≠ RAG migrated · ≠ sole-stack · ≠ R5 retired · ≠ G6 closed | `.tmp/g7-key-live-x3-rerun-20260917-065057/01-e2e-isolated.log` + `EXIT-e2e-isolated.txt` · receipt `2026-09-17T06-51-18-174Z-1282731-a5f210c1-2854-4cd9-8d6c-8f0c8ef94f8b.json` · `outcome=failed` · `releaseEvidence=false` |
| `pnpm e2e:ui:isolated` | **1** | Key **set** · same R5 risk · Playwright chromium missing · `client_exited` · 18 failed · ≠ UI covered · ≠ sole cutover | `02-e2e-ui-isolated.log` + `EXIT-e2e-ui-isolated.txt` · **no** `live_provider_key_missing` |
| `pnpm verify:e2e-performance` | **1** | suite fail at HTTP E2E · mark-red/R5 leaves retained · build/migrate 0 ≠ suite green · ≠ SLO ≠ LOAD ≠ HA ≠ RAG migrated | `03-verify-e2e-performance.log` · suite receipt `2026-09-17T06-51-54-323Z-1285055.json` · nested HTTP `2026-09-17T06-53-11-853Z-1286447-fa61601d-9151-40c4-886d-deecad9b2fc4.json` |
| EXIT file | E1=1 E2=1 E3=1 | 0/3 green · PARTIAL | `exits.env` |

**NHP（RAG 强调）**：NEG 无假绿 · FAULT 无 invent Key · BOUND Key-set ≠ auto green · ADV 无自批 · PERF/LOAD suite红 · PARTIAL 0/3 · **R5** mark-red retained（**independent of Key**）· **G6** OPEN · sole ≠ retired · ≠ RAG migrated。

---

## 3. 仍开 / 阻塞

| 类 | 项 |
|----|-----|
| **本域 post-prove honesty** | **无阻塞**（红-with-Key-set 诚实成立 → pass） |
| **suite / family / covered** | **blocker**：EXIT≠0 · R5 · Playwright env gap · G6 OPEN · Key set ≠ uplift |
| **仍开** | G6 OPEN · R5 green-risk · sole ≠ retired · R2/R4 open · ≠ RAG migrated · ≠ suite/family green |

---

## 4. 非宣称

禁止：auto green、covered、family/suite green、G6 closed、R5 retired、sole cutover、R2/R4 closed、题域已隔离、RAG migrated、SLO/LOAD/HA、`releaseEvidence=true`、invent Key、把 A rewrite 为绿、实现方自批、Key set = pass for G6/family。

---

## 5. 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-g7-key-live-x3-post-prove-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-g7-key-live-x3-post-prove-mw-rag-route.md`
- 对照：harness/slice/eval · Prior A · G6 OPEN · receipt dir `g7-key-live-x3-rerun-20260917-065057` · e2e-receipts 06:51–06:53Z
- HEAD：`639134f`
- 本审：EXIT **1/1/1** 诚实 · Key **set** 仍红 · **pass (red-with-Key-set honesty only)** · releaseEvidence=false · ≠HA · ≠ sole cutover · R5 green-risk retained · G6 OPEN · A unset honesty retained · A′ ≠ family green

*Review · mw-rag-route · G7-A′ live Key×3 post-prove Key-set re-run · 2026-09-16 ~23:56 PT · **pass** (honesty of red-with-Key-set) · EXIT 1/1/1 · releaseEvidence=false · ≠HA · R5 green-risk retained · G6 OPEN · A unset honesty retained · Key set ≠ auto green*

# 审查归档 — G7 · **Key×3 fix** iso/UI/perf **post-prove**（mw-rag-route）

**日期**：2026-09-17 ~20:20 PT  
**审稿人**：`mw-rag-route`（对抗独立审 · **post-prove 红诚实 only**；**拒绝自批** `post_prove_dual_pass`；**零 coding** · **未重跑** frozen trio · **未读 `.env*`** · 仅 `/workspace/meetwise` · **未触 Meridian**）  
**范围**：独立复核实现方 G7 Key×3 **fix** 收据 — EXIT **1/1/1** · Key **set** · FreeTierOnly residual · **Key set ≠ suite green** · Ban 假绿 · Ban 抬升红→绿/fixed · `releaseEvidence=false` · RAG **正交** · Dual ≠ coding  
**对照（全文只读）**：
- `receipts/2026-09-17-g7-key-x3-fix-iso-ui-perf.md`（`executed:awaiting_post_prove_dual` · prove SHA **`a4e3de5`**）
- `reviews/REQUEST-2026-09-17-g7-key-x3-fix-iso-ui-perf-post-prove-mw-rag-route.md`
- `.tmp/g7-key-x3-fix-20260917/` EXIT-01/02/03 + `01-e2e-isolated.log` / `02c-e2e-ui-isolated.log` / `03-verify-e2e-performance.log`
- cited `.tmp/e2e-receipts/2026-09-18T03-13-11-573Z-2254679-58841060-e0b0-4526-8f28-f842c9e25e3b.json`（iso）· `…/2026-09-18T03-17-41-959Z-2264092-8cf459f2-824f-4889-a75f-4c323a42ed70.json`（perf nested HTTP）
- diag 旁证 `.tmp/g7-key-x3-diag/full-e2e-safe-1789700407807.log`（`questions=0` · `interview_unavailable` · `generation_provider_not_configured` · `deterministic_refusal`）
- Prior pre-exec `reviews/2026-09-17-g7-key-x3-fix-iso-ui-perf-mw-rag-route.md`（docs-only PASS on `8de362c` · Dual ≠ already fixed）
- Prior A″ `receipts/2026-09-17-g7-key-x3-rerun.md`（`e697c81` · honesty_red · EXIT **1/1/1** · **retained**）
- `harness/g6-e2e-iso-blocked.md`（**G6 STILL OPEN** · R5 risk）
- 配对：`REQUEST-…-post-prove-mw-e2e-ha.md`（**须独立**；本审不代签）

**结论**：**pass**（**仅** Key-set 仍红收据诚实 · EXIT 表 vs 工件一致 · UI 局部进展 **≠** suite green · **未**发明绿 / fixed / HA）  
**批准范围**：**仅**同意 — frozen trio 诚实 EXIT **1/1/1** · receipt `NEW_SHELL_STATUS=set` · FreeTierOnly / live-path residual 诚实（Key set ≠ suite green）· OCR/voice capability skip/review **≠** 洗绿 · UI stream/golden/ingest 进展 **≠** suite/UI family green · **R5-MARKED-RED** / **G6 STILL OPEN** · Ban 假绿 · Ban 实现方自翻 `post_prove_dual_pass` · Dual ≠ coding · Dual ≠ 已修好 · `releaseEvidence=false` · RAG **正交**  
**不批**：suite/family green · fixed · covered · sole cutover · R5 retired · G6 closed · R2/R4/题域/FUNNEL closed · RAG migrated · SLO/LOAD/HA · `releaseEvidence=true` · Key set = green · EXIT=1→绿 · 实现方自批 dual · invent Key / 复制 `MODEL_API_KEY`→vision/ASR/TTS  
**硬钉**：**Key set ≠ invent green** · **Ban 假绿** · **Ban elevating red→green/fixed** · **Dual ≠ coding ≠ 已修好** · **`releaseEvidence=false`** · **≠HA** · **≠ suite green** · **≠ FUNNEL/R4 closed** · R5-MARKED-RED pgvector-legacy **independent of Key** · 禁 invent/paste Key · 禁读 `.env*`

---

## 0. 结论表（范围钉死）

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass**（red-with-Key-set honesty only · **≠** suite green / fixed） |
| **Scope** | post-prove 红诚实 · NOT suite green · NOT fixed · NOT HA · NOT G6/R5/sole uplift · NOT coding · NOT Dual 代签 |
| 实现方自批 / 自翻 `post_prove_dual_pass` | **无效 / 拒绝** |
| Claimed prove SHA | **`a4e3de5`** · full `a4e3de583942fb641acb7cf545709f4124034b86` |
| Observed HEAD（审时） | **`5f591ea97c7cc3fe1e34befa932e6b5bccf3f40c`**（短 **`5f591ea`** · tip = pin receipt→prove SHA；**a4e3de5** 为 ancestor） |
| EXIT table（frozen trio） | **1 / 1 / 1** · 与 EXIT-*.txt + logs + e2e-receipts **一致** |
| Key state | **receipt only**：`NEW_SHELL_STATUS=set`（authorized loader · name-only）· **本审未读 `.env*`** · **未**重跑 loader · **未**打印 value · **Key set ≠ suite green** |
| FreeTierOnly | receipt 文档化 live chat **403 `AllocationQuota.FreeTierOnly`**（status-only；prove 日志 withheld provider body）· 旁证 `deterministic_refusal`→`generation_provider_not_configured` · **questions=0** · **≠** invent Key / 复制 text key 可修 |
| R5 / sole / G6 | **R5-MARKED-RED** pgvector-legacy · sole ≠ retired · **G6 STILL OPEN** · Key 在场 **无** uplift · Ban sole cutover claim |
| Dual | **≠ coding** · **≠ 已修好** · 本 pass **≠** dual 齐 · 待 `mw-e2e-ha` 独立 |
| `releaseEvidence` | **false**（iso/perf receipts + logs 一致） |
| RAG / 题域 / FUNNEL / R4 / HA / suite | **正交** · **≠** 关闸 · **≠HA** · **≠suite green** |
| 本域阻塞（blockers） | **无**（红诚实成立 · 本审不抬升） |
| 仍开（非本域 uplift） | G6 OPEN · R5-MARKED-RED · trio 仍红 · FreeTierOnly residual · ≠ RAG migrated · ≠ fixed |

---

## 1. HEAD / SHA

| 项 | 值 |
|----|-----|
| Claimed prove | **`a4e3de5`** |
| Prove commit subject | `fix(g7-key-x3): iso/UI/perf honest coding+prove (awaiting_post_prove_dual)` |
| Observed HEAD | **`5f591ea97c7cc3fe1e34befa932e6b5bccf3f40c`**（短 **`5f591ea`**） |
| Tip subject | `docs(delivery): pin G7 Key×3 fix receipt to prove SHA a4e3de5` |
| Match prove | **yes** — `a4e3de5` 为 HEAD ancestor；tip 仅 pin receipt·**不**改写 EXIT **1/1/1** |
| Prior A″ | **`e697c81`** · honesty_red · EXIT **1/1/1** · **retained** · **≠** 本刀洗绿 |
| Pre-exec dual | PASS on REQUEST SHA **`8de362c`** · Dual ≠ already fixed · Dual ≠ coding |
| 本审动作 | 只读 receipt + REQUEST + `.tmp` EXIT/logs + cited e2e-receipts + diag 旁证 · **零** CMD 重跑 · **零** coding · **未读** `.env*` · **未触** Meridian · **仅写**本 review |

**未跑（按 REQUEST：收据诚实优先）**：`pnpm e2e:isolated` / `e2e:ui:isolated` / `verify:e2e-performance` 重跑 · Key loader · HA · sole flip · suite 自批绿。

---

## 2. EXIT 表诚实核验（vs receipt / 工件）

**Presence（receipt only）**：`NEW_SHELL_STATUS=set` · authorized `source …/load-model-api-key.sh` · **no invent Key** · value never printed

| # | CMD | Receipt EXIT | Artifact EXIT | 诚实读法 | 核验源 |
|---|-----|--------------|---------------|----------|--------|
| 1 | `pnpm e2e:isolated` | **1** | **1**（`EXIT-01-e2e-isolated.txt` · ELAPSED=21s） | Key **set** · **`[R5-MARKED-RED]`** pgvector-legacy · `E2E_FAILURE_CLASS class=api` · receipt `outcome=failed` `failureClass=api` `exitCode=1` · reviewLedger capability `image_ocr_unavailable` / `voice_unavailable` · `releaseEvidence=false` · receipt 钉 live chat FreeTierOnly → `questions=0` / `generation_provider_not_configured` · **≠** family green · **≠** G6 closed · **≠** RAG migrated | `.tmp/g7-key-x3-fix-20260917/01-e2e-isolated.log` · `…/2026-09-18T03-13-11-573Z-2254679-58841060-e0b0-4526-8f28-f842c9e25e3b.json` |
| 2 | `pnpm e2e:ui:isolated` | **1** | **1**（`EXIT-02-e2e-ui-isolated.txt` · ELAPSED=143s） | Key **set** · Playwright **10 passed / 2 failed / 10 skipped** · stream+golden+screenshots **PASS** · voice **skipped**（无 TTS/ASR keys）· **recruiting-bound** chromium+mobile `waitForURL(/interview/iv_…)` timeout 30s · `E2E_FAILURE class=frontend code=client_exited` · **同** R5-MARKED-RED banner · **chromium ran ≠ UI green** · ingest/stream 进展 **≠** suite green | `02c-e2e-ui-isolated.log` |
| 3 | `pnpm verify:e2e-performance` | **1** | **1**（`EXIT-03-verify-e2e-performance.txt` · ELAPSED=77s） | migrate runner PASSes **后** HTTP full E2E → `e2e_performance_suite_failed:HTTP full E2E:exit=1` · nested iso 再触 **R5-MARKED-RED** + `failureClass=api` · **≠** SLO · **≠** LOAD · **≠** HA · **≠** suite green | `03-verify-e2e-performance.log` · nested `…/2026-09-18T03-17-41-959Z-2264092-8cf459f2-824f-4889-a75f-4c323a42ed70.json` |

**EXIT table（frozen trio）**：**1 / 1 / 1** — receipt 与工件 **吻合** · **零** 假绿抬升 · **Ban** wash EXIT=1→green。

---

## 3. REQUEST Q1–Q5（mw-rag-route）

| # | Q | Answer |
|---|---|--------|
| **1** | Confirm EXIT **1/1/1** and that UI/stream/ingest progress **≠** suite green **≠** RAG migrated **≠** G6 closed？ | **确认（硬钉）。** EXIT 文件与三日志一致为 **1/1/1**。UI log 显示 stream/golden/screenshots PASS、recruiting-bound 仍红、voice skip——**局部进展 ≠ suite/UI family green**。三路径均见 **R5-MARKED-RED** · **≠** RAG migrated · **≠** G6 closed。RAG **正交**。 |
| **2** | Agree live text path red is **provider quota FreeTierOnly** on authorized key · **not** solved by inventing keys / copying MODEL_API_KEY into vision/ASR/TTS？ | **同意（硬钉）。** receipt 文档化 authorized Key → DashScope **403 `AllocationQuota.FreeTierOnly`**（status-only；prove 日志按设计 withheld provider body）。独立旁证：diag `deterministic_refusal`→`generation_provider_not_configured`→`interview_unavailable`·**questions=0**；iso/perf `failureClass=api`。OCR/voice 为独立 capability gate（ledger / UI skip）——**禁止** invent Key 或把 text `MODEL_API_KEY` 复制进 vision/ASR/TTS。**Key set ≠ suite green**。 |
| **3** | Agree **R5-MARKED-RED** / pgvector-legacy on iso **independent** · **G6 STILL OPEN** · Ban sole cutover claim from this knife？ | **同意（硬钉）。** iso/UI/perf 日志均打 `[R5-MARKED-RED] E2E_ISOLATION_STACK=pgvector-legacy`；sole stack = MySQL+Qdrant+Redis **未**成立；`g6-e2e-iso-blocked` **G6 STILL OPEN**。本刀 UI/capability/profile 修复 **≠** sole cutover · **≠** R5 retired · Key 在场 **无** uplift。 |
| **4** | Agree OCR/voice capability skips are honest · **≠** washing HTTP E2E to green？ | **同意。** iso receipt reviewLedger 留 `image_ocr_unavailable` / `voice_unavailable`；UI voice 6 例 skipped；HTTP E2E / perf 仍 **EXIT=1** `failureClass=api`。capability skip/review = 诚实缺能力 · **≠** 把 HTTP E2E 洗绿。 |
| **5** | Confirm implementer did **not** self-approve · **not** invent Key · **not** claim fixed without EXIT=0 evidence · post-prove dual required？ | **确认。** receipt status 仍 **`executed:awaiting_post_prove_dual`** · Ban self-write `post_prove_dual_pass`；EXIT **1/1/1** · **未** claim fixed / suite green；Key 仅 authorized loader · 本审未读 `.env*` · 未见 invent Key。**post-prove dual 必需** · 配对 `mw-e2e-ha` **独立** · 本审不代签 · Dual ≠ coding ≠ 已修好。 |

---

## 4. RAG / sole / R5 读法（正交钉）

| 钉 | 裁定 |
|----|------|
| RAG migrated / sole-stack | **否** — 默认夹具仍 pgvector-legacy · **≠** MySQL+Qdrant+Redis sole truth |
| R5 retired | **否** — **R5-MARKED-RED** 留在 iso / UI / perf HTTP 路径 |
| G6 | **仍 OPEN**（BUG-E2E-ISO）— Key-set fix 硬跑红 **≠** G6 关 |
| Key×3 fix 本刀 vs RAG 题域 | **正交** — UI ingest/stream/golden + capability gates + live profile pin · **不**关 RAG quality / FUNNEL / R4 / 题域 |
| FreeTierOnly residual | live text path 仍红 · **证明** Key set ≠ suite green · **≠** invent credentials 可关 |
| Dual pass（若日后齐） | **≠ coding** · **≠** sole flip · **≠** suite green · **≠** fixed（若仍 EXIT≠0 则更不得洗绿） |

---

## 5. 仍开 / 阻塞

| 类 | 项 |
|----|-----|
| **本域 blockers** | **无**（红诚实核验成立；本审 **不** uplift） |
| 仍开 · trio 红 | iso `failureClass=api` · UI recruiting-bound · perf HTTP full E2E |
| 仍开 · provider | FreeTierOnly / live generation residual · OCR/voice capability absent |
| 仍开 · R5/G6 | **R5-MARKED-RED** · **G6 STILL OPEN** · sole ≠ retired |
| 仍开 · 流程 | 待 `mw-e2e-ha` 独立 post-prove · Ban 实现方自翻 `post_prove_dual_pass` |
| 显式非关 | suite/family green · fixed · HA · SLO/LOAD · RAG migrated · FUNNEL/R4 · `releaseEvidence=true` |

---

## 6. 禁令回执（本审遵守）

- **未**把 EXIT=1 写成 green / fixed / covered / HA / suite green  
- **未**把 Key set / FreeTierOnly 写成 suite 已绿  
- **未**把 UI stream/golden/ingest PASS 写成 UI/suite family green  
- **未**把 OCR/voice skip 写成 HTTP E2E 绿  
- **未**宣称 G6 / R5 / sole / RAG / FUNNEL/R4 关闭  
- **未**读 `.env*` · **未** invent / echo Key · **未**触 Meridian  
- **未**重跑 frozen trio · **未**自批实现方 `post_prove_dual_pass`  
- `releaseEvidence=false` 保留

---

*审查 · mw-rag-route · G7 Key×3 fix iso/UI/perf post-prove · 2026-09-17 ~20:20 PT · verdict=pass（honesty_red only）· prove SHA a4e3de5 · HEAD 5f591ea · EXIT 1/1/1 · NEW_SHELL_STATUS=set（receipt）· FreeTierOnly residual · Key set ≠ suite green · Ban假绿 · Ban elevating red→green/fixed · Dual ≠ coding ≠ 已修好 · R5-MARKED-RED · G6 STILL OPEN · RAG 正交 · releaseEvidence=false · ≠HA · ≠ suite green · ≠ FUNNEL/R4 closed*

# Review — Knife **W1b** · PG redundant retire/trace batches（pre-exec · ZERO DROP）· mw-rag-route

**专家**：mw-rag-route  
**日期**：2026-09-17（~01:41 PT；对抗独立审 · **零 coding · 零 prove · 零 DROP · 禁自批**）  
**结论**：**pass**（限：pre-exec 文档/REQUEST 门 — W1b = **batched docs/trace REQUEST only · ZERO DROP · 无 delete batch** · Batch B = **trace-only** · Batch A = **docs-only** · **qbank/pgvector HARD RETAIN 不得进删除批（本刀亦无删除批）** · Dual PASS on W1 **≠** 自动授权 W1b coding · Dual PASS on W1b **≠** 授权 DROP/coding · **≠** R4/FUNNEL/题域 closed · **≠** RAG quality green · **≠** HA/suite · `releaseEvidence=false`）  
**硬钉**：**ZERO DROP** · **无 delete batch authorized** · **Batch B = trace only** · **HARD RETAIN（qbank/pgvector/checkpoints/privacy/hot）FORBIDDEN 进任何删除批 · non-DROP-able** · **D-01/D-02 不得把 pgvector/qbank HARD RETAIN 标为 delete-eligible** · **`proposed_next` never `drop-now`** · **禁 invent DROP 目标 outside W1 D-01…D-07** · **Dual PASS on W1 ≠ W1b coding** · **Dual PASS on W1b ≠ DROP/coding** · **禁把 draft/hypotheses 当 DROP** · **MySQL/Qdrant STOPPED** · **≠ FUNNEL/R4/题域 closed** · **≠ HA ≠ suite ≠ W8** · `releaseEvidence=false` · **零 coding · 零 prove · 零 DROP** · **Ban self-approve** · 未读 `.env*` · 未触 Meridian  
**配对**：mw-e2e-ha · 本审不代签 · 本审不代写 DROP · 不授权 coding / delete batch

覆盖 REQUEST：`REQUEST-2026-09-17-w1b-pg-redundant-retire-batches-mw-rag-route.md`  
对照：`harness/w1b-pg-redundant-retire-batches.md` · `w1b-pg-redundant-retire-batches.slice.md` · `eval/w1b-pg-redundant-retire-batches.eval.md` · Parent W1 formal `receipts/w1-pg-redundant-table-inventory.md`（D-01…D-07 · dual on `675269c`）· `harness/w1-pg-redundant-table-inventory.md` · `m4-rag-hard-gates.md`（R1–R4 仍开）

**本审动作**：读 harness/slice/eval/REQUEST + W1 formal receipt · 核对刀钉 SHA=`e9731cf` · HEAD=`e9731cf` · **零** prove · **零** coding · **零** DROP/TRUNCATE · **未读** `.env*` · **未触** Meridian · **未改** packages/db / migrations / live DB（仅写本 review）

---

## 0. Verdict table

| Item | Ruling |
|------|--------|
| **Verdict** | **pass**（pre-exec docs/REQUEST 门 only） |
| **Scope** | Docs-gate batched REQUEST：Batch A docs-only + Batch B trace-first · **ZERO DROP** · **无 delete batch** |
| Implementer self-approve | **rejected** |
| CMD / prove | **`REQUEST-ready / not_run:pre_dual`** · **无 prove script** · 本审 **未跑** prove · **未执行** DROP |
| Knife SHA | **`e9731cf`**（`e9731cf269aef6a4882319328c1d49ebcccb178b`）· W1b REQUEST open · docs-only |
| HEAD（审时） | **`e9731cf269aef6a4882319328c1d49ebcccb178b`**（短 `e9731cf`）· **=** 刀钉 |
| Parent W1 | **`post_prove_dual_pass`** @ **`675269c`** · Dual PASS ≠ W1b coding/DROP auth |
| RAG stance | **pgvector retained** · **qbank/pgvector HARD RETAIN · 非 delete-eligible** · Batch B = trace only · Qdrant **STOPPED** |
| 题域 / FUNNEL / R4 | **正交 = yes**（W1b **≠** 关闸 · **≠** R4/FUNNEL/题域 closed） |
| `releaseEvidence` | **false** |
| Blockers（本域 pre-exec） | **none**（文档门够格）；DROP / delete batch / coding / prove / W1b Dual→DROP **仍禁** |
| Dual PASS ≠ authorize | **硬钉同意**（W1 Dual ≠ W1b coding；W1b Dual ≠ DROP/coding） |
| Zero DROP / zero prove | **confirmed** |

---

## 1. REQUEST Q1–Q6（rag-route answers · 含 meetwise 追钉）

| # | Q | Answer |
|---|---|--------|
| **1** | 向量真相是否留 **Postgres pgvector** · W1b **不得**授权 DROP active vector/qbank/memory sinks / generation-scoped serving？ | **同意（硬钉）**。W0 保留 + W1 Hard retain + W1b harness §3：active pgvector / generation-scoped qbank+rag / memory erasure sinks = **HARD RETAIN · non-DROP-able**。本刀 **ZERO DROP** · **无 delete batch** · 不得授权 DROP serving sinks。 |
| **2** | Batch B D-01/D-02 = legacy-compat **trace-first** · usage prove before any retire proposal · **not** delete-now？ | **同意（硬钉）**。D-01=`retrieval-legacy`/`annSearchLegacy` on `vector_chunk` · D-02=`vector_chunk` vs generation path：Batch B **trace only** · `proposed_next` = document-only / candidate-for-trace / keep generation path · **never** `drop-now` · **≠** delete-now。 |
| **3** | Batch A D-05 = document-only trust_state honesty · ≠ table DROP backlog？ | **同意**。D-05=`legacy_untrusted` / retired generation trust_state = 控制面状态机 · Batch A **docs-only** · keep · **≠** unused-table DROP 清单。 |
| **4** | D-07 = keep-until-trace · Ban inventing DROP targets · HARD RETAIN forbidden in any delete batch？ | **同意（硬钉）**。D-07 unknown names = Batch B keep-until-trace · **no DROP**；Ban invent targets outside W1 D-01…D-07；HARD RETAIN **FORBIDDEN** 进任何删除批（本刀亦**无**删除批）。 |
| **5** | 本刀 **≠** R4 closed · **≠** FUNNEL-01 closed · **≠** RAG quality green · Qdrant STOPPED？ | **同意（硬钉）**。仅 docs/trace REQUEST 门；`m4-rag-hard-gates` R1–R4 **仍开**；**≠** retrieve quality proof · **≠** 题域隔离关闸；Qdrant cutover **STOPPED** · Ban revive。 |
| **6** | Dual PASS on **W1 ≠** auto-auth W1b coding · Dual PASS on **W1b ≠** DROP/coding · `releaseEvidence=false` · ≠HA · ≠suite · ≠W8 · zero coding · Ban self-approve？ | **同意（硬钉）**。W1 Dual 仅关 inventory；W1b Dual（若后得）仅 docs/trace gate · **≠** DROP/merge-retire/coding；本审零 coding / 零 prove / 零 DROP；Ban self-approve · Ban 把 draft 当 DROP。 |

### Meetwise 追钉（显式答 · D-01/D-02 HARD RETAIN · D-03…D-07 honesty）

| 追钉 | 裁定 |
|------|------|
| **D-01 / D-02 不得把 pgvector / qbank HARD RETAIN 放进 delete-eligible** | **同意 · 硬钉** — D-01/D-02 仅 Batch B **trace**；generation-scoped qbank/rag + active pgvector = **HARD RETAIN**；禁标 delete-eligible / `drop-now` / 入任何删除批；本刀 **无** delete batch |
| **D-03…D-07 honesty** | **同意** — **D-03** successor document · no live DROP；**D-04** mig recreate 文档 · Ban 把 mig 内 `DROP IF EXISTS` 当 delete auth；**D-05** trust_state docs-only · ≠ DROP backlog；**D-06** MySQL history keep · **not** PG delete · cutover STOPPED；**D-07** keep-until-trace · **no DROP** · Ban invent targets |
| **Zero DROP · Dual PASS ≠ authorize · `releaseEvidence=false`** | **同意 · 硬钉** — 本审确认 **零 DROP / 零 prove / 零 coding**；W1 Dual ≠ W1b coding；W1b Dual ≠ DROP/coding；`releaseEvidence=false` · ≠HA · ≠suite · ≠W8 |

---

## 2. Batch honesty map（对照 harness §2 · ZERO DROP）

| ID | Batch | Kind | `proposed_next`（本刀） | Ban |
|----|-------|------|------------------------|-----|
| D-01 | **B** | legacy-compat trace | document-only · candidate-for-trace | **never** drop-now · 不得把 HARD RETAIN 标删 |
| D-02 | **B** | legacy vs generation | keep generation path · inventory legacy role | generation/qbank/pgvector = HARD RETAIN · **非** delete-eligible |
| D-03 | **A** | docs-only | document successor | no live DROP |
| D-04 | **A** | docs-only | document mig patterns | Ban mig DROP → delete auth |
| D-05 | **A** | docs-only | keep · document-only | ≠ table DROP backlog |
| D-06 | **A** | docs-only / historical | keep history | not PG delete · Qdrant/MySQL STOPPED |
| D-07 | **B** | keep-until-trace | keep until usage prove | no DROP · Ban invent targets |
| — | **Delete** | **不存在** | — | **not authorized** |

---

## 3. RAG stance（核心）

| Point | Ruling |
|-------|--------|
| **Vector truth** | **Postgres pgvector retained** |
| **qbank generation / active RAG sinks** | **HARD RETAIN · 非 DROP-able · 非 delete-eligible**（D-01/D-02 不得拉入删除批） |
| **memory / privacy erasure sinks** | **HARD RETAIN** |
| **Batch B** | **trace only** · usage/call-site prove **before** any future retire proposal · still **no DROP** this knife |
| **Batch A** | **docs-only** · document / keep / historical honesty |
| **Delete batch** | **none authorized** |
| **Qdrant cutover** | **STOPPED** · Ban revive as W1b outcome |
| **R1–R4 / FUNNEL / 题域** | **仍开 / 正交** — W1b **≠** 关闸 · **≠** RAG quality green |
| **Checkpoint / PostgresSaver** | HARD RETAIN（与 e2e-ha 分工一致） |

---

## 4. 正交裁定（题域 / FUNNEL / ≠HA）

| Point | Ruling |
|-------|--------|
| **题域隔离 / R4** | **正交 = yes** — 无 wrong-track / domain-isolation 产品变更；**≠** R4 closed |
| **FUNNEL-01** | **正交 = yes** — **≠** FUNNEL closed |
| **RAG product gates** | **正交 = yes** — docs/trace REQUEST **≠** 关闸；R1–R4 仍开 |
| **HA / suite / W8** | **≠** — `releaseEvidence=false` · Ban claiming W8 / HA / suite green |
| **Parallel W2…W7 / F8** | 另刀 · **不**并入本 W1b 结论 · **不**授权本刀 DROP |

---

## 5. Fake-green bans（this review）

- Ban：本 pre-exec pass → DROP / TRUNCATE / destructive migrate 已授权  
- Ban：授权任何 **delete batch**  
- Ban：把 D-01/D-02 或 HARD RETAIN（qbank/pgvector）标为 delete-eligible  
- Ban：Dual PASS on **W1** → 自动授权 W1b **coding** / DROP  
- Ban：Dual PASS on **W1b** → 授权 DROP / coding / merge-retire migrations  
- Ban：`proposed_next=drop-now` · 把 draft/hypotheses 当 approved DROP 清单  
- Ban：invent DROP targets outside W1 D-01…D-07  
- Ban：W1b → R4 / FUNNEL-01 / 题域 / RAG quality **关闸**  
- Ban：revive MySQL 或 Qdrant cutover  
- Ban：claim HA / suite green / W8 / `releaseEvidence=true`  
- Ban：invent prove EXIT / self-approve / 单域 pass = dual-complete  
- Ban：读 `.env*` / 触 Meridian / 对本刀执行 coding/prove/DROP  

---

## 6. Approve / do-not-approve

**Approve（限）**：pre-exec 文档/REQUEST 门诚实够格 — W1b = Batch A docs-only + Batch B trace-first · **ZERO DROP** · **无 delete batch**；HARD RETAIN（含 qbank/pgvector）**FORBIDDEN** 进删除批且本刀无删除批；D-01/D-02 **不得**标 delete-eligible；D-03…D-07 honesty 与 harness/receipt 一致；Dual PASS on W1 **≠** W1b coding；Dual PASS on W1b **≠** DROP/coding；**≠** R4/FUNNEL/题域 closed · **≠** RAG quality green · **≠** HA/suite；Qdrant **STOPPED**；`releaseEvidence=false`；零 coding · 零 prove · 零 DROP。

**Do not approve**：任何 DROP/TRUNCATE · delete batch · D-01/D-02→delete-eligible · HARD RETAIN 入删集 · Dual PASS→coding/DROP · `drop-now` · invent DROP targets · MySQL/Qdrant cutover 复活 · R4/FUNNEL/题域/RAG quality closed · HA/suite/W8 · `releaseEvidence=true` · self-approve · coding/prove 本刀执行。

---

## 7. Blockers

| Class | Status |
|-------|--------|
| Pre-exec docs/REQUEST 门（本域） | **无 blocker** — harness/slice/eval/REQUEST/W1 receipt 对齐 · Batch A/B 诚实 · HARD RETAIN 钉住 |
| DROP / delete batch / coding / prove | **仍禁** — 非本审 blocker，而是 **硬禁继续做** |
| Dual / 另域 | 本审 **不代签** mw-e2e-ha · 单域 pass ≠ dual-complete |

---

## 8. Confirm · zero DROP / zero prove

- 本审 **未执行** DROP / TRUNCATE / destructive SQL  
- 本审 **未跑** prove / 未发明 EXIT  
- 本审 **未** coding / migrations / 改 packages/db  
- 本审 **未读** `.env*` · **未触** Meridian  
- 仅写入：`ai-docs/delivery/reviews/2026-09-17-w1b-pg-redundant-retire-batches-mw-rag-route.md`

---

*Review · mw-rag-route · W1b · 2026-09-17 (~01:41 PT) · verdict=pass（pre-exec docs gate only）· HEAD/SHA=e9731cf · releaseEvidence=false · ≠HA · ≠suite · ≠R4/FUNNEL/题域 closed · ZERO DROP · Batch B=trace only · HARD RETAIN forbidden in delete · Dual PASS≠authorize · zero coding · zero prove · Ban self-approve*

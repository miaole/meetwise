# 审查归档 — **W1b** · PG redundant retire/trace batches · 执行前文档闸 · mw-e2e-ha

**日期**：2026-09-17 ~01:41 PT  
**审稿人**：`mw-e2e-ha`（对抗独立审 · 执行前第二域；**实现方自批无效 / 拒绝**；本审 **零 coding · 零 prove · 零 DROP · 零 HA · 零 suite · 未读 `.env*`** · 仅 `/workspace/meetwise`）  
**送审**：`reviews/REQUEST-2026-09-17-w1b-pg-redundant-retire-batches-mw-e2e-ha.md`  
**对照（全文只读）**：
- `harness/w1b-pg-redundant-retire-batches.md`（canonical · Batch A/B · Ban delete batch · Ban DROP）
- `w1b-pg-redundant-retire-batches.slice.md`
- `eval/w1b-pg-redundant-retire-batches.eval.md`（`REQUEST-ready / not_run:pre_dual` · E1–E7）
- Parent W1 formal receipt：`receipts/w1-pg-redundant-table-inventory.md`（D-01…D-07 · `post_prove_dual_pass` · dual on `675269c`）
- Parent W1 harness：`harness/w1-pg-redundant-table-inventory.md` · Parent W1 审：`reviews/2026-09-17-w1-pg-redundant-table-inventory-mw-e2e-ha.md`
- Parent W0：`harness/pg-retained-checkpoint-postgres-saver.md` · `adr-postgres-retained.md` · W0 审：`reviews/2026-09-17-pg-retained-checkpoint-postgres-saver-mw-e2e-ha.md`（PG+pgvector+PostgresSaver retained · MySQL/Qdrant STOPPED）
- Workflow SSOT：`w0-w8-workflow-status.md`（spot）
**配对**：`REQUEST-2026-09-17-w1b-pg-redundant-retire-batches-mw-rag-route.md`（**须独立签**；冲突取更严；**本审不代签 / 不等待**）  
**结论**：**pass**（**仅** 执行前文档闸）  
**批准范围**：**仅**同意本刀 harness/slice/eval/双 REQUEST 够格钉死 **W1b = batched REQUEST from W1 D-01…D-07 · Batch A docs-only · Batch B trace-first · ZERO DROP · no delete batch** · Dual PASS on **W1 ≠** auto-auth W1b coding/DROP · Dual PASS on **W1b ≠** authorize DROP / coding / merge-retire migrations · HARD RETAIN（qbank/pgvector/checkpoints/privacy/hot）**FORBIDDEN** in any delete batch · `proposed_next` never `drop-now` · Ban inventing DROP targets outside W1 receipt · MySQL/Qdrant cutover remains **STOPPED** · PG-retained consistent · `releaseEvidence=false` · **≠HA** · **≠suite** · **≠W8** · **zero coding** · Ban self-approve  
**不批**：DROP · TRUNCATE · destructive migrate · delete batch · W1b coding / merge-retire migrations · 把 Dual PASS on W1 当 W1b coding 授权 · 把 Dual PASS on W1b 当 DROP/coding 授权 · `proposed_next=drop-now` · HARD RETAIN 入删除集 · invent DROP targets · coding · prove · HA · suite green · `releaseEvidence=true` · MySQL/Qdrant cutover revival · 打开 W8 · 实现方自批 · 本域 pass = dual 齐  
**硬钉**：Batch A docs-only · Batch B trace-first · **no delete batch** · ZERO DROP · Dual ≠ DROP/coding · HARD RETAIN protected · `releaseEvidence=false` · **≠HA** · **≠suite** · PG-retained consistent · Ban self-approve · pair `mw-rag-route` independently · zero coding · zero prove · zero DROP

---

## 0. 结论表（范围钉死）

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass** |
| **Scope** | **执行前文档闸 only** — NOT coding · NOT prove · NOT DROP · NOT delete batch · NOT merge-retire migrations · NOT HA · NOT suite · NOT cutover · NOT W8 |
| 实现方自批 / REQUEST 预写 | **无效 / 拒绝**；本审独立裁定 |
| Knife / CMD | **`REQUEST-ready / not_run:pre_dual`**；docs dual only · **no prove script** · **zero coding** · **zero DROP** |
| Batch A | **D-03, D-04, D-05, D-06** = **docs-only** · document/keep/historical · **≠** DROP |
| Batch B | **D-01, D-02, D-07** = **trace-first** · usage/call-site prove **before** any retire proposal · still **no DROP** this REQUEST |
| Delete batch | **none authorized** · 本刀 **无** delete batch |
| Dual PASS on W1 | **≠** auto-authorize W1b coding / DROP |
| Dual PASS on W1b（若日后齐） | **≠** authorize DROP / coding / merge-retire · 须 later separate prove + authorize |
| HARD RETAIN | qbank generation / pgvector / checkpoints / privacy / hot · **FORBIDDEN** in any delete batch · **non-DROP-able** |
| Parent W1 | `post_prove_dual_pass` · formal receipt · dual on `675269c` · D-01…D-07 = hypotheses |
| Parent W0 | PG retained · MySQL/Qdrant cutover **STOPPED** |
| `releaseEvidence` | **false** |
| HA / suite / W8 | **≠HA** · **≠suite green** · **≠W8** |
| 阻塞（本域文档闸） | **无阻塞**（见 §5；配对域独立；DROP/coding/delete batch 仍禁） |

---

## 1. HEAD / 已读 / 对照（只读 · 零 coding · 零 prove · 零 DROP）

| 角色 | 路径 | 观察 |
|------|------|------|
| REQUEST（本域） | `REQUEST-…-mw-e2e-ha.md` | Q1–Q6 清晰；硬钉完整；禁自批；Dual≠DROP/coding；ZERO DROP · no delete batch |
| Harness | `harness/w1b-pg-redundant-retire-batches.md` | §0–§6：Batch A/B 表 · row map D-01…D-07 · pins · Ban delete batch · `proposed_next` never `drop-now` · CMD `not_run:pre_dual` |
| Slice | `w1b-pg-redundant-retire-batches.slice.md` | products 齐；Batch summary 齐；硬钉齐；zero coding / zero DROP |
| Eval | `eval/w1b-pg-redundant-retire-batches.eval.md` | E1–E7 · fake-green checklist · `not_run:pre_dual` |
| Parent W1 receipt | `receipts/w1-pg-redundant-table-inventory.md` | D-01…D-07 · HARD RETAIN 表 · `post_prove_dual_pass` · dual on `675269c` · ≠ DROP list |
| Parent W1 harness | `harness/w1-pg-redundant-table-inventory.md` | W1b 原注「later merge/retire · NOT open」— 本刀以 **更严** docs/trace REQUEST 开闸 · **仍 ZERO DROP** |
| Parent W0 ADR/harness | `adr-postgres-retained.md` · `harness/pg-retained-*` | PG+pgvector+PostgresSaver retained · MySQL/Qdrant STOPPED |
| Workflow SSOT spot | `w0-w8-workflow-status.md` | 行仍写 W1b **NOT open**（见 §1.2 诚实注记） |
| Pair REQUEST | `REQUEST-…-mw-rag-route.md` | 已备；本审 **不代签** |

### 1.1 HEAD（brief · 相对 claimed `e9731cf`）

| 项 | 值 |
|----|-----|
| Claimed knife SHA | `e9731cf`（`docs(delivery): open W1b PG redundant retire/trace REQUEST (zero DROP)`） |
| Observed HEAD | `e9731cf269aef6a4882319328c1d49ebcccb178b`（short **`e9731cf`**） |
| Relation | **exact match** |
| Honesty | 本审对照 tip 树内 W1b artefacts；HEAD match **≠** 授权 DROP/coding/delete batch · **≠** 本审 prove |

### 1.2 SSOT / 父刀语义诚实注记（非阻塞）

| 注记 | 裁定 |
|------|------|
| SSOT 仍写 W1b「NOT open」而本 REQUEST 已开 | **预期开闸竞态** · 本刀目标即把 W1b 钉为 **`REQUEST-ready / not_run:pre_dual`（docs/trace）**；dual 齐后 SSOT 应更新为 REQUEST/docs-gate 态 · **Ban** 写成 merge-retire coding 已开 |
| Parent W1 曾框 W1b =「later merge/retire migrations」 | 本刀 **收窄为** docs/trace batches · **ZERO DROP · no delete batch** — **更严 · 更诚实** · **不**偷开 coding/DROP |
| Parent W1 Dual PASS | 仅关 inventory · **≠** 本刀 coding/DROP 授权（Q4 硬钉） |

### 1.3 DROP / 删除面 spot（文档层 · ≠ live DB）

Harness / slice / eval / REQUEST **均显式**：ZERO DROP · **no delete batch** · HARD RETAIN forbidden in delete · `proposed_next` never `drop-now` · Ban inventing targets outside D-01…D-07。本审 **零 DROP 执行** · **未**打开 destructive migrate · **未**授权 delete batch。

---

## 2. REQUEST Q1–Q6（对抗答）

| # | 问题 | 本审答 | 对抗要点 |
|---|------|--------|----------|
| **Q1** | Agree W1b scope = batched REQUEST from W1 D-01…D-07 · **ZERO DROP** · **no delete batch** · Ban guessed deletes？ | **同意** | 全套 artefacts 一致；D-01…D-07 来自 W1 formal receipt；**无** delete batch 行；Ban invent targets |
| **Q2** | Agree Batch A (D-03…D-06) = docs-only document/keep · **not** authorize DROP？ | **同意** | D-03 successor · D-04 mig recreate document · D-05 trust_state keep · D-06 MySQL history keep · **≠** live DROP |
| **Q3** | Agree Batch B (D-01, D-02, D-07) = trace-first · prove usage before any retire proposal · still **no DROP** this REQUEST？ | **同意** | D-01/D-02 legacy-compat + generation keep · D-07 unknown-needs-trace · **本闸只批 trace 计划诚实** · **≠** 本闸执行 usage prove coding · **≠** DROP |
| **Q4** | Agree Dual PASS on **W1 ≠** auto-authorize W1b coding / DROP？ | **同意（硬钉）** | W1 Dual 只关 inventory；本刀开闸 **≠** 被 W1 Dual 自动授权 coding/DROP |
| **Q5** | Agree Dual PASS on **W1b ≠** authorize DROP / merge-retire migrations / coding · separate prove+authorize later？ | **同意（硬钉）** | 即便日后 W1b Dual PASS，范围仍仅 docs/trace 闸 · **≠** DROP/coding · 未来 retire 须 **separate** prove + authorize |
| **Q6** | Agree HARD RETAIN **FORBIDDEN** in any delete batch · `proposed_next` never `drop-now` · Ban inventing DROP targets · MySQL/Qdrant STOPPED · `releaseEvidence=false` · ≠HA · ≠suite · ≠W8 · zero coding · Ban self-approve？ | **同意（硬钉）** | 与 W0/W1 一致；本审零 coding / 零 prove / 零 DROP；拒绝自批；PG-retained consistent |

---

## 3. 对抗：假绿 / 偷关 / 冒充

| 风险说法 | 裁定 |
|---------|------|
| 「文档闸 / Dual PASS on W1b = 已授权 DROP / TRUNCATE / delete batch」 | **禁** — Dual PASS on W1b ≠ DROP/coding · **no delete batch** |
| 「Dual PASS on W1 = 已自动授权 W1b coding / DROP」 | **禁** — Q4 硬钉 · W1 Dual ≠ W1b auth |
| 「Batch B trace-first = 现在可 retire / DROP D-01/D-02/D-07」 | **假绿 / 禁** — trace **before** any retire proposal · still no DROP this REQUEST |
| 「Batch A docs-only = mig 内历史 DROP recreate = 现可删表」 | **禁** — document only · Ban treating mig DROP as delete auth |
| 「HARD RETAIN 可进未来 delete batch」 | **禁** — FORBIDDEN · non-DROP-able |
| 「可 invent DROP targets 超出 W1 receipt D-01…D-07」 | **禁** |
| 「`proposed_next=drop-now` 合法」 | **禁** — never `drop-now` |
| 「本刀 = coding / prove / migrations / live DB」 | **禁** — `not_run:pre_dual` · zero coding · zero prove · zero DROP |
| 「本刀 = HA / suite green / releaseEvidence / W8」 | **假绿 / 禁** |
| 「本刀 = MySQL/Qdrant cutover 复活」 | **禁** — W0 STOPPED · PG-retained consistent |
| 「SSOT 仍 NOT open = 本 REQUEST 无效」或「开闸 = merge-retire 已开」 | **禁双侧偷换** — REQUEST-ready docs/trace 开闸合法；**≠** coding/DROP 开闸 |
| 「实现方预写 REQUEST = 专家 pass」 | **禁** — 拒绝自批 |
| 「本域 pass = dual 齐」 | **禁** — 须配对 `mw-rag-route` 独立 |

**本审**：送审 artefacts **未**把 DROP/delete batch/coding/HA/suite/cutover 写成已批已绿；主要假绿面在 **W1 Dual→W1b coding 偷开**、**W1b Dual→DROP 偷开**、**Batch B→retire-now 外推**、**HARD RETAIN 入删集**。文档闸诚实即可控。

---

## 4. Eval / fake-green 对照（E1–E7 · 文档层）

| ID | Eval 点 | 本审 |
|----|---------|------|
| E1 | W1b = batched REQUEST from D-01…D-07 · ZERO DROP · no delete batch | **同意** |
| E2 | Batch A (D-03…D-06) = docs-only · not delete | **同意** |
| E3 | Batch B (D-01, D-02, D-07) = trace-first · still no DROP | **同意** |
| E4 | Dual PASS on W1 ≠ auto-auth W1b coding / DROP | **同意（硬钉）** |
| E5 | Dual PASS on W1b ≠ authorize DROP / coding / merge-retire | **同意（硬钉）** |
| E6 | HARD RETAIN FORBIDDEN in any delete batch · non-DROP-able | **同意** |
| E7 | Ban invent targets · never `drop-now` · MySQL/Qdrant STOPPED · `releaseEvidence=false` · ≠HA · ≠suite · ≠W8 · zero coding · Ban self-approve | **同意** |

Fake-green checklist（本审勾选诚实面）：未授权 DROP/TRUNCATE/destructive migrate · 未授权 delete batch · 未把 W1 Dual 当 W1b coding/DROP 授权 · 未 invent DROP targets · 未设 `proposed_next=drop-now` · 未将 HARD RETAIN 放入删除集 · 未宣称 HA/suite/`releaseEvidence`/W8 · 未复活 MySQL/Qdrant cutover · 未实现 migrations/coding · 未 invent prove EXIT / 自批 · **零 DROP 执行**。

---

## 5. 阻塞 / 批准边界

| 类 | 裁定 |
|----|------|
| **本域文档闸阻塞** | **无阻塞** |
| 配对 `mw-rag-route` | **独立进行**；本审不代签；dual = 两域齐 |
| DROP / TRUNCATE / destructive migrate / delete batch | **仍禁** — 即使 dual PASS 也 **≠** 删除授权 |
| W1b coding / merge-retire migrations | **仍禁** — Dual PASS on W1b **≠** authorize；须 later separate prove + authorize |
| Batch B usage/call-site prove 实现 | **仍禁于本刀** — 本闸只同意 trace-first **计划诚实** · coding knife 另开 |
| HARD RETAIN | **仍 non-DROP-able** · 禁入任何 delete batch |
| MySQL/Qdrant cutover | **仍 STOPPED** |
| W8 / HA / suite | **未开 / 未证 / 禁宣称** |
| this knife as DROP / delete authorize | **否** — 仅执行前文档闸 · Batch A docs / B trace-first · **no delete batch** |

---

## 6. 签名

**Verdict**: **pass**  
**Scope**: **执行前文档闸 only**  
**Sign**: `mw-e2e-ha`  
**Pair**: 须 `mw-rag-route` **独立**（本审不代签）  
**Confirm**: **zero DROP** · **Dual PASS ≠ DROP/coding**（W1 Dual ≠ W1b coding；W1b Dual ≠ DROP/coding）· **`releaseEvidence=false`** · **≠HA** · **≠suite** · **HARD RETAIN protected** · **Batch A = docs-only** · **Batch B = trace-first** · **no delete batch** · PG-retained consistent · zero coding · zero prove · Ban self-approve · claimed/observed HEAD **`e9731cf` match**

---

*Review · mw-e2e-ha · W1b PG redundant retire/trace batches · 2026-09-17 ~01:41 PT · pass · 执行前文档闸 only · releaseEvidence=false · ≠HA · ≠suite · ZERO DROP · no delete batch · Batch A docs-only · Batch B trace-first · Dual≠DROP/coding · HARD RETAIN protected · zero coding · Ban self-approve · pair mw-rag-route independently*

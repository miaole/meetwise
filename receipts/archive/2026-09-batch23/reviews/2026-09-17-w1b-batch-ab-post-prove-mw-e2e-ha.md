# 审查归档 — **W1b** · Batch A/B **POST-PROVE** receipt review · mw-e2e-ha

**日期**：2026-09-17 ~01:50 PT  
**审稿人**：`mw-e2e-ha`（对抗独立审 · **post-prove receipt review only**；**拒绝自批**；**本审不写** harness `post_prove_dual_pass` · **未**代签 `mw-rag-route` · **零 DROP · 零 destructive migrate · 未读 `.env*`** · 仅 `/workspace/meetwise`）  
**范围**：Batch A docs-finalize + Batch B trace-evidence **收据诚实性**复审（≠ coding · ≠ DROP 授权 · ≠ suite · ≠ HA）  
**前序 pre-exec**：`reviews/2026-09-17-w1b-pg-redundant-retire-batches-mw-e2e-ha.md`（**pass** · 执行前文档闸 only · claimed/observed `e9731cf`）  
**对照（全文只读）**：
- `receipts/w1b-batch-a-docs-finalize.md`
- `receipts/w1b-batch-b-trace-evidence.md`
- `harness/w1b-pg-redundant-retire-batches.md`（**`executed:awaiting_post_prove_dual`**）
- `w1b-pg-redundant-retire-batches.slice.md`
- `eval/w1b-pg-redundant-retire-batches.eval.md`
- REQUEST 硬钉：`REQUEST-2026-09-17-w1b-pg-redundant-retire-batches-mw-e2e-ha.md`
- 配对：`REQUEST-…-mw-rag-route.md` / `2026-09-17-w1b-pg-redundant-retire-batches-mw-rag-route.md`（**须独立**；本审不代签）
**结论**：**pass**（**仅** post-prove receipt review）  
**批准范围**：**仅**同意 Batch A/B 执行收据诚实：docs-only + trace-first · **ZERO DROP** · **no delete batch** · status 仍 **`awaiting_post_prove_dual`** · 未自写 `post_prove_dual_pass` · `proposed_next` never `drop-now` · HARD RETAIN 未入删除集 · `releaseEvidence=false` · **≠HA** · **≠suite** · Dual PASS（若日后齐）**≠** DROP/coding  
**不批**：DROP · TRUNCATE · destructive migrate · delete batch · invent DROP targets · `proposed_next=drop-now` · HARD RETAIN 入删 · coding / merge-retire migrations · 把 Dual PASS 当 DROP/coding 授权 · 实现方自写 `post_prove_dual_pass` · HA · suite green · `releaseEvidence=true` · MySQL/Qdrant cutover 复活 · 本域 pass = dual 齐  
**硬钉**：Batch A = docs-only · Batch B = trace-first · **no delete batch** · Dual ≠ DROP/coding · HARD RETAIN protected · `releaseEvidence=false` · **≠HA** · **≠suite** · Ban self-approve post_prove_dual_pass · pair `mw-rag-route` independently · zero DROP

---

## 0. 结论表（范围钉死）

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass** |
| **Scope** | **post-prove receipt review only** — NOT DROP auth · NOT coding · NOT delete batch · NOT HA · NOT suite · NOT cutover · NOT 代写 harness `post_prove_dual_pass` |
| 实现方自批 / 自写 `post_prove_dual_pass` | **无效 / 拒绝**；本审独立；**未**改 harness status |
| Batch A | **docs-only 诚实** · D-03…D-06 · mig `DROP IF EXISTS` recreate **≠** live DROP 授权 |
| Batch B | **trace-first 诚实** · D-01/D-02/D-07 · keep · **never** `drop-now` · 零 TS ≠ proven dead |
| Delete batch | **none** · **未授权 · 未执行** |
| Status | **`executed:awaiting_post_prove_dual`** · **Ban** 自写 `post_prove_dual_pass` |
| Dual PASS（日后） | **≠** authorize DROP / coding / merge-retire |
| HARD RETAIN | **protected** · FORBIDDEN in any delete batch · D-02 generation + D-07 `checkpoint_migrations` 明确 keep |
| `releaseEvidence` | **false** |
| HA / suite | **≠HA** · **≠suite** |
| 配对 `mw-rag-route` | **独立待/须签**；本审不代签 |
| 阻塞（本域 receipt） | **无阻塞**（见 §5） |

---

## 1. HEAD / 已读（brief）

| 项 | 值 |
|----|-----|
| Claimed SHA | **`c378943`**（`docs(delivery): execute W1b Batch A/B docs+trace; awaiting post-prove dual`） |
| Observed HEAD | `c378943dcb176a9ef6e1a7f6416fb7c7335819a7`（short **`c378943`**） |
| Relation | **exact match** |
| Honesty | HEAD match **≠** DROP/coding 授权 · **≠** 本审代写 `post_prove_dual_pass` · **≠** dual 齐 |

**已读**：Batch A/B receipts · harness/slice/eval · pre-exec mw-e2e-ha · REQUEST hard pins。**未**读 `.env*`。**未**执行 DROP / destructive migrate。**未**改 harness。

### 1.1 Status 诚实

| Artefact | Status 观察 |
|----------|-------------|
| Harness | **`executed:awaiting_post_prove_dual`** · Ban self-write `post_prove_dual_pass` · §8 execution record 指向两份 receipts |
| Slice / Eval | 同钉 `awaiting_post_prove_dual` · post-prove dual **pending** |
| Receipts | 显式 **not** `post_prove_dual_pass` · Ban self-write |

**裁定**：状态机诚实 · **未**实现方自批关闸。

---

## 2. Batch A 诚实性（docs-only · D-03…D-06）

| ID | Receipt 裁定 | 本审核对 | 诚实？ |
|----|--------------|----------|--------|
| D-03 | document successor · 0108 mig recreate · **no live DROP** | 确认 `0108_…sql` L57–58 / L86–87：`DROP TABLE IF EXISTS …` → 立即 `CREATE TABLE` | **是** — recreate pattern **≠** 现网删表授权 |
| D-04 | document 0093/0099/0105 mig `DROP IF EXISTS` recreate · Ban as delete auth | 确认 0093 行 53/106/130/153/177 等均为 recreate | **是** |
| D-05 | keep · `legacy_untrusted` control-plane honesty | 确认 0073 L52–53 / L137 / L184+ 为活跃 trust_state 机 | **是** — **keep · ≠ DROP backlog** |
| D-06 | keep historical MySQL skeleton · cutover STOPPED | receipt 钉 `packages/db-mysql` / compose · **not** PG delete | **是** |

**Explicit**：Batch A = docs finalize only · **≠** delete batch · **≠** migrations coding · **≠** live DROP。本审同意。

---

## 3. Batch B 诚实性 + CMD spot-check（trace-first · D-01/D-02/D-07）

### 3.1 本审独立复跑（read-only · 1–2 greps）

| CMD（本审） | 结果摘要 | vs receipt |
|-------------|----------|------------|
| `git grep -n "annSearchLegacy" -- '*.ts' '*.tsx' ':!**/node_modules/**'` | **多处命中**：`retrieval-legacy.ts:11` 定义 · `retrieval-store.ts` import/re-export/fallback · `qbank-generation-retrieval.ts:231-232` · proofs/smokes · 等 | **与 D-01 表一致** · hits **存在** · **live callers** 主张成立 |
| `git grep -n "retrieval-legacy" -- '*.ts' '*.tsx'` | `retrieval-store.ts:12,14` · `qbank-generation-retrieval.ts:231` | **一致** |
| `git grep -n "FROM vector_chunk\|INSERT INTO vector_chunk" -- 'packages/db/src/*.ts'` | `retrieval-legacy.ts:26,35,41` · `retrieval-store.ts:23` · **另** `qbank-ingest.ts:223`（receipt 未列 · **加强** live SQL 面 · 非矛盾） | hits **存在** · Ban treating as dead |

**裁定**：Ban treating zero TS hits as proven dead — receipt D-07 已显式钉；本审同意。D-01 **不得**外推为 retire-now / DROP。

### 3.2 D-02 HARD RETAIN

| Object | CREATE pointer（本审确认） | 裁定 |
|--------|---------------------------|------|
| `qbank_chunk` / `qbank_vector_generation` / `qbank_active_generation` | `0029_…sql:30/101/125` | **HARD RETAIN · non-DROP-able** |
| `rag_embedding_generation` / `rag_active_generation` | `0032_…sql:170/219` | **HARD RETAIN · non-DROP-able** |
| Legacy `vector_chunk` + `annSearchLegacy` | coexistence · keep | **never** `drop-now` · **no** delete batch |

### 3.3 D-07 zero-TS ≠ proven dead

| name | 本审 spot | receipt ruling | 同意？ |
|------|-----------|----------------|--------|
| `checkpoint_migrations` | `0043_…sql:6` CREATE + GRANT · HARD RETAIN | HARD RETAIN · keep · **NO** delete-REQUEST | **是** |
| `interview_answer_artifact_target` | `0092_…sql:121` CREATE + RLS | keep · not proven dead · **NO** flag | **是** |
| 其余 online_judge_* / memory_reindex_task / privacy_preview_* | receipt 钉 SQL-live · **无** candidate-for-W1b-delete-REQUEST | keep · Ban guessed deletes | **是**（本审未发明 DROP 目标） |

**`proposed_next`**：全表 **never** `drop-now` · delete? **NO** · **无** invent DROP targets。

---

## 4. 对抗：假绿 / 偷开

| 风险说法 | 裁定 |
|---------|------|
| 「Batch A/B done = 已授权 DROP / delete batch」 | **禁** — receipts 显式 ZERO DROP · no delete batch |
| 「mig 内 `DROP IF EXISTS` recreate = 现可删 live 表」 | **禁** — Batch A 已诚实钉 · 本审确认 |
| 「零 `*.ts` 命中 = proven dead → 可 DELETE REQUEST」 | **禁** — D-07 全 keep · Ban guessed deletes |
| 「本审 pass / Dual PASS = DROP/coding 授权」 | **禁** — Dual ≠ DROP/coding |
| 「可把 HARD RETAIN 放进未来 delete batch」 | **禁** — FORBIDDEN · protected |
| 「实现方可自写 harness `post_prove_dual_pass`」 | **禁** — status 仍须 `awaiting_post_prove_dual` 至双域独立齐；本审 **未**写入 |
| 「本刀 = HA / suite / releaseEvidence / cutover」 | **假绿 / 禁** |
| 「本域 pass = dual 齐」 | **禁** — 须 `mw-rag-route` 独立 |

**本审**：两份 receipts + harness **未**把 DROP/delete/`post_prove_dual_pass`/HA/suite 写成已批已绿。主要假绿面在 **docs/trace done → DROP 偷开**、**零 TS → dead 外推**、**自写 dual pass** — 收据层已控。

---

## 5. 阻塞 / 批准边界

| 类 | 裁定 |
|----|------|
| **本域 post-prove receipt 阻塞** | **无阻塞** |
| 配对 `mw-rag-route` | **独立**；本审不代签；dual = 两域齐后方可由 **parent** 收束（**Ban** 实现方自写 `post_prove_dual_pass`） |
| DROP / TRUNCATE / destructive migrate / delete batch | **仍禁** — 即便 dual PASS 也 **≠** 删除授权 |
| W1b coding / merge-retire | **仍禁** — 须 later separate prove + authorize |
| HARD RETAIN | **仍 non-DROP-able** |
| MySQL/Qdrant cutover | **仍 STOPPED** |
| this knife as DROP authorize | **否** — 仅 receipt honesty · Batch A docs / B trace · **no delete batch** |

---

## 6. Confirm 清单（强制）

| Pin | 本审 |
|-----|------|
| **zero DROP** | **确认** — 收据/harness/本审均未授权、未执行 |
| **awaiting dual**（`awaiting_post_prove_dual`） | **确认** — harness/slice/eval 一致 · **未**自写 `post_prove_dual_pass` |
| **`releaseEvidence=false`** | **确认** |
| **≠HA** · **≠suite** | **确认** |
| **HARD RETAIN protected** | **确认** — D-02 generation + D-07 checkpoints 等 · FORBIDDEN in delete · **no delete batch** |
| Dual ≠ DROP/coding | **确认** |
| Batch A docs-only · Batch B trace-first · no delete batch | **确认** |
| pair `mw-rag-route` independently | **确认**（本审不代签） |

---

## 7. 签名

**Verdict**: **pass**  
**Scope**: **post-prove receipt review only**  
**Sign**: `mw-e2e-ha`  
**Pair**: 须 `mw-rag-route` **独立**（本审不代签）  
**Confirm**: **zero DROP** · **awaiting_post_prove_dual** · **Ban self-write `post_prove_dual_pass`** · **Dual ≠ DROP/coding** · **`releaseEvidence=false`** · **≠HA** · **≠suite** · **HARD RETAIN protected** · Batch A docs-only 诚实 · Batch B trace-first 诚实（spot-check greps 命中存在） · **no delete batch** · `proposed_next` never `drop-now` · Ban invent DROP targets · claimed/observed HEAD **`c378943` match** · 本审 **未**改 harness

---

*Review · mw-e2e-ha · W1b Batch A/B POST-PROVE receipt · 2026-09-17 ~01:50 PT · pass · post-prove receipt review only · releaseEvidence=false · ≠HA · ≠suite · ZERO DROP · no delete batch · awaiting_post_prove_dual · Dual≠DROP/coding · HARD RETAIN protected · Ban self-approve post_prove_dual_pass · pair mw-rag-route independently*

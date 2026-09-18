# 审查归档 — **W1b** · Batch A/B **POST-PROVE** receipt review · mw-rag-route

**日期**：2026-09-17 ~01:51 PT  
**审稿人**：`mw-rag-route`（对抗独立审 · **post-prove receipt / docs+trace 复审 only**；**拒绝自批**；**本审不写** harness `post_prove_dual_pass` · **未**代签 `mw-e2e-ha` · **零 DROP · 零 coding · 零 destructive migrate · 未读 `.env*`** · 仅 `/workspace/meetwise` · **未触 Meridian**）  
**范围**：Batch A docs-finalize + Batch B trace-evidence **收据诚实性**复审（≠ coding · ≠ DROP 授权 · ≠ suite · ≠ HA · ≠ R4/FUNNEL/题域关闸）  
**前序 pre-exec**：`reviews/2026-09-17-w1b-pg-redundant-retire-batches-mw-rag-route.md`（**pass** · 执行前文档闸 only · knife `e9731cf`）  
**对照（全文只读）**：
- `receipts/w1b-batch-a-docs-finalize.md`
- `receipts/w1b-batch-b-trace-evidence.md`
- `harness/w1b-pg-redundant-retire-batches.md`（**`executed:awaiting_post_prove_dual`**）
- `w1b-pg-redundant-retire-batches.slice.md`
- `eval/w1b-pg-redundant-retire-batches.eval.md`
- REQUEST 硬钉：`REQUEST-2026-09-17-w1b-pg-redundant-retire-batches-mw-rag-route.md`
- 配对：`REQUEST-…-mw-e2e-ha.md` / `2026-09-17-w1b-batch-ab-post-prove-mw-e2e-ha.md`（**须独立**；本审不代签）
- Parent W1：`receipts/w1-pg-redundant-table-inventory.md` · dual on `675269c`
**结论**：**pass**（**仅** post-prove receipt / docs+trace review）  
**批准范围**：**仅**同意 Batch A/B 执行收据诚实：docs-only + trace-first · **ZERO DROP** · **no delete batch** · **qbank/pgvector HARD RETAIN 未入删除批（本刀亦无删除批）** · status 仍 **`awaiting_post_prove_dual`** · 未自写 `post_prove_dual_pass` · `proposed_next` never `drop-now` · Dual PASS（若日后齐）**≠** DROP/coding · `releaseEvidence=false` · **≠HA** · **≠suite** · **≠ R4/FUNNEL/题域 closed**  
**不批**：DROP · TRUNCATE · destructive migrate · delete batch · invent DROP targets · `proposed_next=drop-now` · HARD RETAIN 入删 · 把 D-01/D-02 trace 当 delete-eligible · coding / merge-retire migrations · Dual PASS = DROP/coding 授权 · 实现方自写 `post_prove_dual_pass` · HA · suite green · `releaseEvidence=true` · MySQL/Qdrant cutover 复活 · R4/FUNNEL/题域关闸 · 本域 pass = dual 齐  
**硬钉**：Batch A = docs-only · Batch B = **trace only** · **no delete batch** · Dual PASS ≠ DROP/coding · HARD RETAIN protected · D-01/D-02 **不得触碰** pgvector/qbank HARD RETAIN · D-03…D-07 honesty · `releaseEvidence=false` · **≠HA** · **≠suite** · Ban self-approve · pair `mw-e2e-ha` independently · **zero DROP**

---

## 0. 结论表（范围钉死）

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass** |
| **Scope** | **post-prove receipt / docs+trace review only** — NOT DROP auth · NOT coding · NOT delete batch · NOT HA · NOT suite · NOT R4/FUNNEL/题域 closed · NOT 代写 harness `post_prove_dual_pass` |
| 实现方自批 / 自写 `post_prove_dual_pass` | **无效 / 拒绝**；本审独立；**未**改 harness status |
| Batch A | **docs-only 诚实** · D-03…D-06 · mig `DROP IF EXISTS` recreate **≠** live DROP 授权 |
| Batch B | **trace-first 诚实** · D-01/D-02/D-07 · keep · **never** `drop-now` · 零 TS ≠ proven dead |
| Delete batch | **none** · **未授权 · 未执行** |
| HARD RETAIN（qbank/pgvector） | **ok · protected** · D-02 generation-scoped **HARD RETAIN · non-DROP-able** · **FORBIDDEN** in any delete batch · **不在** delete set |
| Status | **`executed:awaiting_post_prove_dual`** · **Ban** 自写 `post_prove_dual_pass` |
| Dual PASS（日后） | **≠** authorize DROP / coding / merge-retire |
| `releaseEvidence` | **false** |
| HA / suite / R4 / FUNNEL / 题域 | **≠HA** · **≠suite** · **≠ R4 closed** · **≠ FUNNEL closed** · **≠ 题域关闸** |
| 配对 `mw-e2e-ha` | **独立**；本审不代签 |
| 阻塞（本域 receipt） | **无阻塞**（见 §6） |
| **Zero DROP** | **confirmed** |

---

## 1. HEAD / SHA / CMD+EXIT

| 项 | 值 |
|----|-----|
| Claimed SHA | **`c378943`**（`docs(delivery): execute W1b Batch A/B docs+trace; awaiting post-prove dual`） |
| Observed HEAD | `c378943dcb176a9ef6e1a7f6416fb7c7335819a7`（short **`c378943`**） |
| Relation | **exact match** |
| HEAD 内容 | **仅** `ai-docs/delivery/**`（eval/harness/slice/receipts/north-star/w0-w8）· **无** `.sql` · **无** packages/apps coding · **无** live DROP |
| Honesty | HEAD match **≠** DROP/coding 授权 · **≠** 本审代写 `post_prove_dual_pass` · **≠** dual 齐 · **≠** HA/FUNNEL/R4/题域 closed |

### 1.1 本审复跑 prove CMDs（docs/trace · **非** DROP）

REQUEST / receipt 点名的是 **docs/trace** `git grep` 证据，**无** DROP prove script · **无** coding prove。本审独立复跑：

| CMD | EXIT | 摘要 vs receipt |
|-----|------|-----------------|
| `git grep -n "annSearchLegacy" -- '*.ts' '*.tsx' ':!**/node_modules/**'` | **0**（多 hit） | 与 D-01 表一致：`packages/db/src/retrieval-legacy.ts:11` 定义 · `retrieval-store.ts` import/re-export/fallback · `qbank-generation-retrieval.ts:231-232` · proofs/smokes · **live callers** |
| `git grep -n "retrieval-legacy" -- '*.ts' '*.tsx' ':!**/node_modules/**'` | **0** | `retrieval-store.ts:12,14` · `qbank-generation-retrieval.ts:231` · **一致** |
| `git grep -n "FROM vector_chunk\|INSERT INTO vector_chunk" -- 'packages/db/src/*.ts'` | **0** | `retrieval-legacy.ts:26,35,41` · `retrieval-store.ts:23` · **另** `qbank-ingest.ts:223`（receipt 未列 · **加强** live SQL · 非矛盾） |
| `git grep -nE "CREATE TABLE (IF NOT EXISTS )?(qbank_chunk\|qbank_vector_generation\|qbank_active_generation\|rag_embedding_generation\|rag_active_generation\|vector_chunk)" -- 'packages/db/migrations/*.sql'` | **0** | D-02 CREATE pointers **确认**：0029 qbank_* · 0032 rag_* · 0001 `vector_chunk` |
| `git grep -n "hybridQbankSearch\|qbank_generation_ann_search\|FROM vector_chunk\|INSERT INTO vector_chunk" -- 'packages/db/src/*.ts'` | **0** | generation path **热** · legacy coexistence · **HARD RETAIN 成立** |
| D-07 spot：`git grep -n --fixed-string "checkpoint_migrations"` / `"interview_answer_artifact_target"` | **0**（SQL-live） | HARD RETAIN / keep · **NO** delete-REQUEST flag · 与 receipt 一致 |

**未跑（禁）**：DROP · TRUNCATE · destructive migrate · live DB delete · HA · suite · MySQL/Qdrant cutover · 任何 coding prove。

### 1.2 Status 诚实

| Artefact | Status 观察 |
|----------|-------------|
| Harness / Slice / Eval | **`executed:awaiting_post_prove_dual`** · Ban self-write `post_prove_dual_pass` · post-prove dual **pending** |
| Receipts | 显式 **not** `post_prove_dual_pass` · Ban self-write · ZERO DROP |
| HEAD commit message | `awaiting post-prove dual` · 诚实 |

**裁定**：状态机诚实 · **未**实现方自批关闸。

---

## 2. REQUEST Q&A（post-prove · 含 meetwise 追钉）

覆盖 REQUEST：`REQUEST-2026-09-17-w1b-pg-redundant-retire-batches-mw-rag-route.md`（硬钉沿用；本审为 **post-prove** 对 Batch A/B 执行收据）。

| # | Q | Answer |
|---|---|--------|
| **1** | 向量真相是否留 **Postgres pgvector** · W1b **不得**授权 DROP active vector/qbank/memory sinks / generation-scoped serving？ | **同意（硬钉）**。复跑确认 generation-scoped qbank/rag CREATE + `hybridQbankSearch` / `qbank_generation_ann_search` **热路径** = **HARD RETAIN · non-DROP-able**。本刀执行 **ZERO DROP** · **无 delete batch**。 |
| **2** | Batch B D-01/D-02 = legacy-compat **trace-first** · usage prove before any retire proposal · **not** delete-now？ | **同意（硬钉）**。D-01 live callers **确认** · D-02 generation **HARD RETAIN** + legacy coexistence keep · `proposed_next` **never** `drop-now` · delete? **NO**。 |
| **3** | Batch A D-05 = document-only trust_state honesty · ≠ table DROP backlog？ | **同意**。0073 `control_trust_state` / `legacy_untrusted` **活跃状态机**（本审 spot L52–53/137/184+）· **keep · docs-only** · **≠** DROP backlog。 |
| **4** | D-07 = keep-until-trace · Ban inventing DROP targets · HARD RETAIN forbidden in any delete batch？ | **同意（硬钉）**。D-07 全表 keep · **无** `candidate-for-W1b-delete-REQUEST` this turn · `checkpoint_migrations` = HARD RETAIN · Ban invent targets。 |
| **5** | 本刀 **≠** R4 closed · **≠** FUNNEL-01 closed · **≠** RAG quality green · Qdrant STOPPED？ | **同意（硬钉）**。仅 docs/trace receipt 门；**≠** R4/FUNNEL/题域关闸 · **≠** retrieve quality proof；Qdrant **STOPPED**。 |
| **6** | Dual PASS on **W1 ≠** auto-auth W1b coding · Dual PASS on **W1b ≠** DROP/coding · `releaseEvidence=false` · ≠HA · ≠suite · ≠W8 · zero coding · Ban self-approve？ | **同意（硬钉）**。本审 **pass ≠** Dual 齐 · Dual（若日后）**≠** DROP/coding；`releaseEvidence=false` · ≠HA · ≠suite · ≠W8 · 零 coding · Ban self-approve。 |

### Meetwise 追钉（显式答）

| 追钉 | 裁定 |
|------|------|
| **D-01 / D-02 trace 不得触碰 pgvector / qbank HARD RETAIN** | **同意 · 硬钉** — Batch B = **trace only**；generation-scoped qbank/rag + active pgvector = **HARD RETAIN**；trace **不得**标 delete-eligible / `drop-now` / 入任何删除批；本刀 **无** delete batch · **未触碰** HARD RETAIN |
| **D-03…D-07 honesty** | **同意** — **D-03** 0108 recreate document · no live DROP（本审确认 L57–58/86–87）；**D-04** mig recreate 文档 · Ban mig `DROP IF EXISTS` → delete auth；**D-05** trust_state docs-only · ≠ DROP backlog；**D-06** MySQL history keep · cutover STOPPED · **not** PG delete；**D-07** keep-until-trace · SQL-live · **no** delete-REQUEST flags |
| **Dual PASS ≠ authorize DROP · `releaseEvidence=false`** | **同意 · 硬钉** — Dual PASS on W1b（日后齐）**≠** authorize DROP / coding / merge-retire；本审 pass **≠** DROP 授权；`releaseEvidence=false` · ≠HA · ≠suite |

---

## 3. Batch A 诚实性（docs-only · D-03…D-06）

| ID | Receipt 裁定 | 本审核对 | 诚实？ |
|----|--------------|----------|--------|
| D-03 | document successor · 0108 mig recreate · **no live DROP** | 确认 `0108_…sql` L57 / L86：`DROP TABLE IF EXISTS …` → 立即 recreate | **是** — recreate **≠** 现网删表授权 |
| D-04 | document 0093/0099/0105 mig recreate · Ban as delete auth | 确认 0093 `DROP TABLE IF EXISTS memory_fact` 等为 recreate 模式 | **是** |
| D-05 | keep · `legacy_untrusted` control-plane honesty | 确认 0073 活跃 trust_state 机 | **是** — **keep · ≠ DROP backlog** |
| D-06 | keep historical MySQL · cutover STOPPED | receipt 钉 skeleton · **not** PG delete | **是** |

**Explicit**：Batch A = docs finalize only · **≠** delete batch · **≠** migrations coding · **≠** live DROP。本审同意。

---

## 4. Batch B 诚实性（trace-only · D-01/D-02/D-07）+ HARD RETAIN

### 4.1 D-01 — live legacy callers（**≠** retire-now）

| Field | 本审 |
|-------|------|
| usage_signal | **live callers**（复跑确认） |
| `proposed_next` | document-only · keep · **never** `drop-now` |
| delete? | **NO** |
| HARD RETAIN 触碰？ | **否** — trace 仅 inventory legacy · **不得**把 pgvector/qbank HARD RETAIN 标删 |

### 4.2 D-02 — generation HARD RETAIN vs legacy coexistence

| Path | Ruling |
|------|--------|
| Generation qbank/rag + active pgvector | **HARD RETAIN · non-DROP-able** · **ok · 未入删除批** |
| Legacy `vector_chunk` + `annSearchLegacy` | compat coexistence · **keep** · never `drop-now` |
| delete batch? | **none** |
| Trace 触碰 HARD RETAIN？ | **否** — inventory only · Ban delete-eligible |

### 4.3 D-07 — keep · no delete-REQUEST flags

| name | 本审 | receipt | 同意？ |
|------|------|---------|--------|
| `checkpoint_migrations` | SQL CREATE+GRANT · HARD RETAIN | HARD RETAIN · **NO** flag | **是** |
| `interview_answer_artifact_target` | 0092 CREATE+RLS | keep · not proven dead | **是** |
| 其余 online_judge_* / memory_reindex_task / privacy_preview_* | receipt SQL-live · **无** candidate flag | keep · Ban guessed deletes | **是** |

**`proposed_next`**：全表 **never** `drop-now` · delete? **NO** · **zero** `candidate-for-W1b-delete-REQUEST` this turn。

---

## 5. RAG stance / 正交 / Fake-green bans

| Point | Ruling |
|-------|--------|
| **Vector truth** | **Postgres pgvector retained** |
| **qbank generation / active RAG sinks** | **HARD RETAIN · ok · 非 delete-eligible · 未入删除批** |
| **Batch B** | **trace only** · still **no DROP** |
| **Batch A** | **docs-only** |
| **Delete batch** | **none authorized · none executed** |
| **Qdrant / MySQL cutover** | **STOPPED** |
| **R1–R4 / FUNNEL / 题域** | **仍开 / 正交** — W1b post-prove **≠** 关闸 |
| **HA / suite / W8** | **≠** · `releaseEvidence=false` |

| 风险说法 | 裁定 |
|---------|------|
| 「Batch A/B done = 已授权 DROP / delete batch」 | **禁** |
| 「mig 内 `DROP IF EXISTS` recreate = 现可删 live 表」 | **禁** |
| 「D-01/D-02 trace = 可删 qbank/pgvector HARD RETAIN」 | **禁** — trace **不得触碰** HARD RETAIN |
| 「零 `*.ts` = proven dead → DELETE REQUEST」 | **禁** |
| 「本审 pass / Dual PASS = DROP/coding 授权」 | **禁** |
| 「可自写 harness `post_prove_dual_pass`」 | **禁** — 仍 `awaiting_post_prove_dual`；本审 **未**写入 |
| 「本刀 = HA / suite / R4 / FUNNEL / 题域 closed」 | **假绿 / 禁** |

---

## 6. Blockers / Zero DROP

| 项 | 值 |
|----|-----|
| Blockers（本域 post-prove receipt） | **无** |
| Zero DROP | **confirmed** — HEAD 仅 ai-docs · receipts/harness 显式 Ban · 本审零 DROP 命令 · 无 delete batch · 无 `drop-now` · 无 delete-REQUEST flags |
| HARD RETAIN ok? | **是** — qbank/pgvector generation path **HARD RETAIN** · **不在** delete batch · D-01/D-02 trace **未触碰** |
| 仍禁（全局） | DROP / coding / Dual→DROP / R4·FUNNEL·题域关闸 / HA / suite / `releaseEvidence=true` / 自写 `post_prove_dual_pass` |

---

## 7. Non-claims

- 本审 **pass ≠** Dual 齐 · **≠** harness `post_prove_dual_pass`（禁自写；须双域独立齐后由父流程处理）
- **≠** DROP / delete batch / coding / merge-retire 授权
- **≠** R4 closed · **≠** FUNNEL closed · **≠** 题域关闸 · **≠** RAG quality green
- **≠** HA · **≠** suite · **≠** W8 · `releaseEvidence=false`
- Dual PASS on W1b（日后）**≠** authorize DROP/coding
- 未代签 `mw-e2e-ha` · 未读 `.env*` · 未触 Meridian

---

*Review · mw-rag-route · W1b Batch A/B post-prove · 2026-09-17 ~01:51 PT · HEAD/SHA `c378943` · verdict **pass**（receipt/docs+trace only）· review path `ai-docs/delivery/reviews/2026-09-17-w1b-batch-ab-post-prove-mw-rag-route.md` · HARD RETAIN ok · blockers none · **ZERO DROP confirmed** · Dual PASS ≠ DROP · `releaseEvidence=false` · ≠HA · ≠R4/FUNNEL/题域 closed · Ban self-write post_prove_dual_pass*

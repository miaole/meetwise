# Review — Knife **W1** · PG redundant/obsolete table inventory（pre-exec · ZERO deletes）· mw-rag-route

**专家**：mw-rag-route  
**日期**：2026-09-17（~01:24 PT；对抗独立审 · **零 coding · 零 prove · 零 DROP · 禁自批**）  
**结论**：**pass**（限：pre-exec 文档/REQUEST 门 — W1 = **inventory only · ZERO deletes** · Ban DROP/TRUNCATE · 禁把草稿当 DROP 清单 · **qbank generation / pgvector 真相表不得标为 DROP-able** · MySQL/Qdrant cutover **STOPPED** 诚实 · Dual PASS **≠** 授权 W1b deletes · **inventory ≠ 关闸** · **≠** R4/FUNNEL/题域 closed · **≠** RAG quality green · **≠** HA/suite · `releaseEvidence=false`）  
**硬钉**：**ZERO deletes** · **Ban DROP/TRUNCATE/destructive migrate** · **Dual PASS ≠ authorize W1b** · **禁把 provisional draft 当 DROP 清单** · **禁把 qbank generation / active pgvector / memory erasure sinks 标为 DROP-able** · **MySQL/Qdrant STOPPED** · **≠ FUNNEL/R4/题域 closed** · **inventory ≠ 关闸** · **≠ HA ≠ suite ≠ W8** · `releaseEvidence=false` · **零 coding · 零 prove · 零 DROP** · **Ban self-approve** · 未读 `.env*` · 未触 Meridian  
**配对**：mw-e2e-ha · 本审不代签 · 本审不代写 DROP · 不授权 W1b

覆盖 REQUEST：`REQUEST-2026-09-17-w1-pg-redundant-table-inventory-mw-rag-route.md`  
对照：`harness/w1-pg-redundant-table-inventory.md` · `w1-pg-redundant-table-inventory.slice.md` · `eval/w1-pg-redundant-table-inventory.eval.md` · `receipts/w1-pg-redundant-table-inventory.draft.md`（≠ DROP list）· Parent W0 `adr-postgres-retained.md` · `harness/pg-retained-checkpoint-postgres-saver.md` · `m4-rag-hard-gates.md`（R1–R4 产品闸仍开）

**本审动作**：读 harness/slice/eval/REQUEST/draft · 核对刀钉 SHA=`675269c` · 确认 HEAD 含其后文档刀但本审范围仍 = W1 pre-exec · **零** prove · **零** coding · **零** DROP/TRUNCATE · **未读** `.env*` · **未触** Meridian · **未改** packages/db / migrations / live DB（仅写本 review）

---

## 0. Verdict table

| Item | Ruling |
|------|--------|
| **Verdict** | **pass**（pre-exec docs/REQUEST 门 only） |
| **Scope** | Docs-gate inventory plan · ZERO deletes · Ban DROP · draft = hypothesis only |
| Implementer self-approve | **rejected** |
| CMD / prove | **`not_run:pre_dual`** · **无 prove script** · 本审 **未跑** prove · **未执行** DROP |
| Knife SHA | **`675269c`**（`675269c0999bf1887b3c527f7fc85420e72fd3de`）· W1 REQUEST open · docs-only |
| HEAD（审时） | `25833fc93a9e1bb6a2337665bd9648fdb9f8ee1c`（短 `25833fc`）· **含** `675269c` 为祖先 · 其后另开 W2/W3/W4/W5 docs · **不改变** W1 本刀 scope |
| RAG stance | **pgvector retained** · **qbank generation / active vector sinks = HARD RETAIN · 非 DROP-able** · Qdrant cutover **STOPPED** |
| 题域 / FUNNEL / R4 | **正交 = yes**（inventory **≠** 关闸 · **≠** R4/FUNNEL/题域 closed） |
| `releaseEvidence` | **false** |
| Blockers（本域 pre-exec） | **none**（文档门够格）；DROP/W1b/coding/prove **仍禁** |
| Dual PASS ≠ W1b | **硬钉同意** |
| Draft ≠ DROP list | **硬钉同意** |
| Zero DROP / zero prove | **confirmed** |

---

## 1. REQUEST Q1–Q6（rag-route answers · 含 meetwise 追钉）

| # | Q | Answer |
|---|---|--------|
| **1** | 向量真相是否留 **Postgres pgvector** · W1 inventory **不得**授权 DROP active vector / **qbank generation** / memory erasure sinks？ | **同意（硬钉）**。W0 保留 + harness §2/§5 bucket E + draft Hard retain：**active pgvector paths / generation-scoped qbank+rag serving** = **HARD RETAIN**。Inventory **must NOT** mark qbank generation tables / pgvector truth tables as DROP-able / `drop-now`。`proposed_next` 仅允许 `keep` · `document-only` · `candidate-for-W1b-review` · **never** `drop-now`。 |
| **2** | `retrieval-legacy` / `vector_chunk` compat path 是否 = inventory/legacy-compat · **not** delete-now？ | **同意**。harness bucket A · draft D-01/D-02：compat-only · document-only / candidate-for-W1b-review · **≠** delete-now · **≠** W1 DROP 授权。 |
| **3** | provisional RAG/control `legacy_untrusted` 信号是否 = state-machine honesty · **≠** table DROP backlog？ | **同意**。harness bucket C · draft D-05：trust_state / retired generation = 控制面状态机 · **keep · document-only** · **≠** unused-table DROP 清单。 |
| **4** | 本刀 **≠** R4 closed · **≠** FUNNEL-01 closed · **≠** RAG quality green · **inventory ≠ 关闸**？ | **同意（硬钉）**。仅 PG 冗余表 **inventory docs gate**；`m4-rag-hard-gates` R1–R4 **仍开**；本刀 **≠** retrieve quality proof · **≠** 题域已隔离 · **inventory ≠ 关闸**。 |
| **5** | Dual PASS ≠ authorize **W1b** deletes · MySQL/Qdrant cutover 保持 **STOPPED** · F8 untouched/not blocked？ | **同意（硬钉）**。Dual PASS on W1 **≠** W1b merge/retire/deletes（须 **separate authorize + batch prove**）。MySQL/Qdrant cutover **STOPPED** 诚实（W0 parent · harness bucket D · draft D-06 · Ban revive）。F8 MS3 parallel OK · 互不阻塞 · 本刀未触 F8。 |
| **6** | `releaseEvidence=false` · ≠HA · ≠suite · ≠W8 · zero coding · Ban self-approve · **禁把草稿当 DROP 清单**？ | **同意（硬钉）**。eval fake-green checklist 一致；draft 顶注 provisional · `proposed_next` never drop-now · Ban treating draft rows as approved deletes；本审零 coding / 零 prove / 零 DROP；Ban self-approve。 |

### Meetwise 追钉（显式答）

| 追钉 | 裁定 |
|------|------|
| Inventory **不得**把 **qbank generation / pgvector 真相表**标为 DROP-able | **同意 · HARD RETAIN** — generation-scoped qbank/rag serving + active pgvector = keep；禁 `drop-now` / DROP 候选标签 |
| **MySQL/Qdrant STOPPED** honesty | **同意** — cutover 保持 STOPPED；history kept；W1 **不** revive；`packages/db-mysql` / mysql compose = out-of-scope historical · **not** W1 PG delete |
| **Dual PASS ≠ W1b** | **同意** — W1 dual PASS 仅解锁 inventory 契约文档；W1b deletes/merge-retire **另开刀 + separate authorize + batch prove** |

---

## 2. RAG stance（核心）

| Point | Ruling |
|-------|--------|
| **Vector truth** | **Postgres pgvector retained** |
| **qbank generation / active RAG sinks** | **HARD RETAIN · 非 DROP-able**（inventory 不得标删） |
| **memory / privacy erasure sinks** | **HARD RETAIN**（draft Hard retain） |
| **legacy-compat retrieve** | `retrieval-legacy` / `vector_chunk` = inventory candidate · **not** delete-now |
| **`legacy_untrusted`** | state-machine honesty · **≠** DROP backlog |
| **Qdrant cutover** | **STOPPED** · Ban revive as W1 outcome |
| **MySQL relational cutover** | **STOPPED** · out of W1 PG delete scope |
| **R1–R4 / FUNNEL / 题域** | **仍开 / 正交** — inventory **≠** 关闸 · **≠** RAG quality green |
| **Checkpoint / PostgresSaver** | HARD RETAIN（与 e2e-ha 分工一致） |

---

## 3. 正交裁定（题域 / FUNNEL / inventory≠关闸）

| Point | Ruling |
|-------|--------|
| **题域隔离 / R4** | **正交 = yes** — 无 wrong-track / domain-isolation 产品变更；**≠** R4 closed |
| **FUNNEL-01** | **正交 = yes** — **≠** FUNNEL closed |
| **RAG product gates** | **正交 = yes** — inventory **≠** 关闸；R1–R4 仍开 |
| **F8 MS3** | parallel OK · untouched / not blocked |
| **HA / suite / W8** | **≠** — `releaseEvidence=false` · Ban claiming W8 |
| **W2…W5**（其后 docs） | 另刀 · **不**并入本 W1 结论 · **不**授权本刀 DROP |

---

## 4. Draft / buckets honesty（≠ DROP list）

| Check | Ruling |
|-------|--------|
| Provisional draft 存在 | **yes** — `receipts/w1-pg-redundant-table-inventory.draft.md` |
| Hard retain 含 qbank/pgvector | **yes** — generation-scoped qbank+rag · active pgvector · checkpoints · privacy sinks · hot business |
| `proposed_next` | **never** `drop-now` · 仅 keep / document-only / candidate-for-W1b-review |
| Buckets A–F | hypothesis only · **≠** approved delete backlog |
| Mig 内历史 `DROP TABLE IF EXISTS` recreate | **≠** 授权 live business table delete now（harness §4 · draft D-03/D-04） |
| Ban | **同意** — 禁把草稿/buckets 当 DROP 清单 · 禁 Dual PASS→W1b |

---

## 5. Fake-green bans（this review）

- Ban：本 pre-exec pass → DROP / TRUNCATE / destructive migrate 已授权  
- Ban：Dual PASS → 自动授权 **W1b** deletes / merge-retire migrations  
- Ban：把 provisional draft / buckets A–F 当 approved DROP 清单  
- Ban：把 **qbank generation / pgvector 真相表**标为 DROP-able / retire-now  
- Ban：inventory → R4 / FUNNEL-01 / 题域 / RAG quality **关闸**  
- Ban：revive MySQL 或 Qdrant cutover  
- Ban：claim HA / suite green / W8 / `releaseEvidence=true`  
- Ban：invent prove EXIT / self-approve / 单域 pass = dual-complete  
- Ban：读 `.env*` / 触 Meridian / 对本刀执行 coding/prove/DROP  

---

## 6. Approve / do-not-approve

**Approve（限）**：pre-exec 文档/REQUEST 门诚实够格 — W1 = inventory only · ZERO deletes · Ban DROP/TRUNCATE；artifact plan + method 够 docs gate；draft/buckets = hypothesis · **≠** DROP list；**qbank generation / pgvector truth = HARD RETAIN · 非 DROP-able**；MySQL/Qdrant **STOPPED**；Dual PASS **≠** W1b；**inventory ≠ 关闸** · **≠** R4/FUNNEL/题域 closed · **≠** RAG quality green；F8 parallel OK；`releaseEvidence=false`；零 coding · 零 prove · 零 DROP。

**Do not approve**：任何 DROP/TRUNCATE · W1b deletes · 把草稿当 DROP 清单 · 标 qbank/pgvector 可删 · MySQL/Qdrant cutover 复活 · R4/FUNNEL/题域/RAG quality closed · HA/suite/W8 · `releaseEvidence=true` · self-approve · coding/prove 本刀执行 · Dual PASS 自动授权 W1b。

---

## 7. 仍开 / 阻塞

| 类 | 项 |
|----|-----|
| **本域 pre-exec 文档门** | **无阻塞** → pass（docs only） |
| **DROP / coding / prove** | **仍禁** — CMD `not_run:pre_dual` · 无 prove |
| **W1b** | **NOT open** · Dual PASS ≠ authorize · 须 separate authorize + batch prove |
| **R1–R4 / FUNNEL / 题域** | **仍开**（本刀不关 · inventory ≠ 关闸） |
| **MySQL/Qdrant cutover** | **STOPPED** · 保持 |
| **F8 / siblings** | **仍开 / untouched** · parallel OK |
| **配对** | mw-e2e-ha 独立；本审不代签 |

---

## 8. 非宣称 / 收据

**禁止宣称**：DROP 已授权 · W1b 已授权 · draft=DROP list · qbank/pgvector 可删 · R4/FUNNEL/题域 closed · RAG quality green · inventory=关闸 · HA · suite green · W8 · MySQL/Qdrant cutover 进行中或已授权 · Dual PASS=W1b · self-approve · `releaseEvidence=true` · 本刀已 coding/prove/DROP

| 字段 | 值 |
|------|-----|
| 专家 | `mw-rag-route` |
| 覆盖 REQUEST | `REQUEST-2026-09-17-w1-pg-redundant-table-inventory-mw-rag-route.md` |
| 本 review | `ai-docs/delivery/reviews/2026-09-17-w1-pg-redundant-table-inventory-mw-rag-route.md` |
| Knife SHA | `675269c`（`675269c0999bf1887b3c527f7fc85420e72fd3de`） |
| HEAD（审时） | `25833fc`（`25833fc93a9e1bb6a2337665bd9648fdb9f8ee1c`）· 含 675269c 祖先 |
| Verdict | **pass**（pre-exec docs gate only） |
| RAG-orthogonal（题域/FUNNEL/R4） | **yes**（inventory ≠ 关闸） |
| Blockers | **none**（docs gate）；DROP/W1b/coding/prove **仍禁** |
| `releaseEvidence` | **false** |
| Zero DROP / zero prove | **confirmed** |
| Dual PASS ≠ W1b | **confirmed** |
| qbank/pgvector non-DROP-able | **confirmed** |
| MySQL/Qdrant STOPPED | **confirmed** |

---

*Review · mw-rag-route · W1 PG redundant table inventory · 2026-09-17 (~01:24 PT) · pass（pre-exec docs only）· SHA=675269c · HEAD=25833fc · releaseEvidence=false · ZERO deletes · Ban DROP · Dual PASS ≠ W1b · qbank/pgvector HARD RETAIN · MySQL/Qdrant STOPPED · inventory ≠ 关闸 · ≠R4/FUNNEL/题域 closed · draft ≠ DROP list · zero prove · zero coding · Ban self-approve*

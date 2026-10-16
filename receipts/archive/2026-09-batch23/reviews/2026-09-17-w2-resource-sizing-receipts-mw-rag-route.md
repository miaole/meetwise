# Review — Knife **W2** · Resource sizing receipts（2c4g vs 4c8g · pre-exec）· mw-rag-route

**专家**：mw-rag-route  
**日期**：2026-09-17（~01:24 PT；对抗独立审 · **零 coding · 零 prove · 禁自批**）  
**结论**：**pass**（限：pre-exec 文档/REQUEST 门 — W2 = **baseline sizing receipts** under **Postgres (+pgvector + PostgresSaver)** · **2c4g vs 4c8g** · local/doc sim OK · **sizing ≠ 关闸** · **≠** R4/FUNNEL/题域 closed · **≠** RAG quality green · **≠** capacity/HA/suite proof · Qdrant cutover **STOPPED** · `releaseEvidence=false` · Dual PASS **≠** 授权 coding）  
**硬钉**：**≠ HA ≠ suite green ≠ capacity proof ≠ FUNNEL/R4/题域 closed ≠ RAG quality green** · **sizing ≠ 关闸** · **Ban treating 2c4g/4c8g sketches as green/capacity/HA** · **Dual PASS ≠ authorize coding** · **Ban self-approve** · **MySQL/Qdrant STOPPED** · `releaseEvidence=false` · **零 coding · 零 prove** · 未读 `.env*` · 未触 Meridian  
**配对**：mw-e2e-ha · 本审不代签 · 本审不代跑 sim · 不授权 coding/prove

覆盖 REQUEST：`REQUEST-2026-09-17-w2-resource-sizing-receipts-mw-rag-route.md`  
对照：`harness/w2-resource-sizing-receipts.md` · `w2-resource-sizing-receipts.slice.md` · `eval/w2-resource-sizing-receipts.eval.md` · Parent W0 `harness/pg-retained-checkpoint-postgres-saver.md` **§2 Resource sizing** · `adr-postgres-retained.md` · `w0-w8-workflow-status.md` · `m4-rag-hard-gates.md`（R1–R4 产品闸仍开 · 栈/Qdrant-required 声明 superseded）

**本审动作**：读 harness/slice/eval/REQUEST · 核对 parent W0 §2 · 核对 SSOT W2 OPEN · 核对刀钉 SHA=`3463e9e` · 确认 HEAD 含其后 docs 刀但本审范围仍 = W2 pre-exec · **零** prove · **零** coding · **未读** `.env*` · **未触** Meridian · **未改** packages / compose / live stack（仅写本 review）

---

## 0. Verdict table

| Item | Ruling |
|------|--------|
| **Verdict** | **pass**（pre-exec docs/REQUEST 门 only） |
| **Scope** | Docs-gate + baseline sizing **receipts plan** · 2c4g vs 4c8g · PG(+pgvector+PostgresSaver) · local/doc sim OK |
| Implementer self-approve | **rejected** |
| CMD / prove | **`not_run:pre_dual`** · **无 prove script** · 本审 **未跑** prove · **未跑** measured compose |
| Knife SHA | **`3463e9e`**（`3463e9e1af886518ea456a089c52761d3c7ed5a5`）· W2 REQUEST open · docs-only |
| HEAD（审时） | `25833fc93a9e1bb6a2337665bd9648fdb9f8ee1c`（短 `25833fc`）· **含** `3463e9e` 为祖先 · 其后另开 W4/W5 docs · **不改变** W2 本刀 scope |
| RAG stance | **pgvector retained on Postgres** · Ban Qdrant-required sole vector in sizing narrative · Qdrant cutover **STOPPED** |
| 题域 / FUNNEL / R4 | **正交 = yes**（**sizing ≠ 关闸** · **≠** R4/FUNNEL/题域 closed） |
| Resource sizing | planning receipts / host-class sketches · **≠** capacity · **≠** HA · **≠** suite green |
| `releaseEvidence` | **false** |
| Blockers（本域 pre-exec） | **none**（文档门够格）；coding/prove/capacity/HA **仍禁** |
| Dual PASS ≠ coding | **硬钉同意** |
| Sizing ≠ green / 关闸 | **硬钉同意** |
| Zero prove | **confirmed** |

---

## 1. REQUEST Q1–Q5（rag-route answers）

| # | Q | Answer |
|---|---|--------|
| **1** | 向量是否留 **pgvector on Postgres** · Ban Qdrant-required sole vector in sizing narrative？ | **同意（硬钉）**。W0 ADR + harness §0–§2 + W2 harness pins：stack fixed = `postgres+pgvector+PostgresSaver`；Qdrant vector cutover **STOPPED**；sizing **不得**把 Qdrant 写成 required sole vector / revive cutover。Former MySQL+Qdrant+Redis 仅作 honesty contrast。 |
| **2** | 2c4g vs 4c8g receipts ≠ retrieve quality proof · ≠ R4/FUNNEL closed？ | **同意（硬钉）**。本刀 = host-class sizing **receipts**（cpu/ram/disk sketches · local/doc sim）；**≠** retrieve quality · **≠** RAG-FUNNEL · **≠** 题域隔离 · **sizing ≠ 关闸**。`m4-rag-hard-gates` R1–R4 **仍开**。 |
| **3** | W0 §2 co-located PG+pgvector envelope 是否为正确 parent？ | **同意**。Parent `harness/pg-retained-checkpoint-postgres-saver.md` **§2 Resource sizing** = retained planning envelope（单机 compose · 非 multi-AZ · rough ranges · Honesty bans）；W2 加深为 **2c4g vs 4c8g** host-class receipt contract · 不另开向量切流叙事。 |
| **4** | Dual PASS ≠ authorize coding · Ban self-approve · zero coding？ | **同意（硬钉）**。Eval E4 + harness §1 pin 5：Dual PASS 仅解锁 **documented receipt contract**；**later** sim/coding knife 须 **separate authorize**。本 prep **零 coding · 零 prove**；Ban self-approve；实现方 REQUEST ≠ expert pass。 |
| **5** | F8/W1 parallel · MySQL/Qdrant STOPPED · `releaseEvidence=false` · ≠HA · ≠suite · ≠ capacity？ | **同意（硬钉）**。SSOT + harness：F8/W1 parallel OK · 互不阻塞；MySQL/Qdrant cutover **STOPPED**；`releaseEvidence=false`；**≠HA** · **≠suite green** · **≠ capacity proof**；Ban treating 2c4g/4c8g as multi-AZ HA / production cert。 |

### Meetwise 追钉（显式答）

| 追钉 | 裁定 |
|------|------|
| **sizing ≠ 关闸** | **同意** — host-class receipts **不**关闭 R1–R4 / FUNNEL / 题域 / RAG quality |
| **≠ FUNNEL/R4/题域 closed** | **同意** — 产品闸仍开；本刀正交 |
| **Ban treating sizing as green/capacity proof** | **同意** — sketches / local-doc sim · **≠** green · **≠** capacity · **≠** HA |
| **Dual PASS ≠ 授权** | **同意** — ≠ coding · ≠ prove · ≠ W1b · ≠ cutover |
| **releaseEvidence=false · ≠HA** | **同意** |

---

## 2. RAG stance（核心）

| Point | Ruling |
|-------|--------|
| **Vector truth** | **Postgres pgvector retained**（sizing stack fixed） |
| **Qdrant cutover** | **STOPPED** · Ban Qdrant-as-required sole vector in W2 narrative · Ban revive via sizing |
| **MySQL relational cutover** | **STOPPED** · honesty contrast only |
| **Checkpoint / PostgresSaver** | retained co-located envelope（与 e2e-ha 分工一致 · 本域同意） |
| **R1–R4 / FUNNEL / 题域** | **仍开 / 正交** — **sizing ≠ 关闸** · **≠** RAG quality green |
| **Retrieve quality** | **不在本刀** — Ban reading RAM/CPU sketches as retrieve proof |
| **F8 MS3 / W1** | parallel OK · untouched / not blocked by W2 |

---

## 3. 正交裁定（题域 / FUNNEL / sizing≠关闸）

| Point | Ruling |
|-------|--------|
| **题域隔离 / R4** | **正交 = yes** — 无 wrong-track / domain-isolation 产品变更；**≠** R4 closed |
| **FUNNEL-01** | **正交 = yes** — **≠** FUNNEL closed |
| **RAG product gates** | **正交 = yes** — **sizing ≠ 关闸**；R1–R4 仍开 |
| **Capacity / HA / suite** | **≠** — receipts = planning · Ban green/capacity/HA |
| **F8 / W1 / W3** | parallel / sibling · **不**并入本 W2 关闸结论 |
| **RAG-orthogonal** | **yes** |

---

## 4. Host-class receipts honesty（2c4g vs 4c8g）

| Check | Ruling |
|-------|--------|
| Compare classes | **2c4g** vs **4c8g** · scoped in harness §0–§2 |
| Stack fixed | `postgres+pgvector+PostgresSaver` |
| Sim mode | local/doc · compose-sketch · measured-later（**deferred** · 本 REQUEST 无 measured prove） |
| Parent W0 §2 | referenced · deepen host-class · Ban multi-AZ HA narrative |
| Retest after W1b | noted · Dual PASS ≠ authorize W1b |
| Provisional receipt path | optional later `receipts/w2-resource-sizing-2c4g-vs-4c8g.draft.md` · **non-authorizing** |
| Ban | **同意** — ≠HA · ≠suite · ≠production cert · no MySQL/Qdrant revival · **≠ capacity proof** |

---

## 5. Fake-green bans（this review）

- Ban：本 pre-exec pass → coding / prove / measured capacity 已授权  
- Ban：Dual PASS → 自动授权 sim/coding knife 或 W1b  
- Ban：把 **2c4g/4c8g** sketches 当 **green / capacity / HA / multi-AZ** 证据  
- Ban：**sizing → R4 / FUNNEL-01 / 题域 / RAG quality 关闸**  
- Ban：revive MySQL 或 Qdrant cutover via sizing narrative  
- Ban：claim HA / suite green / W8 / `releaseEvidence=true`  
- Ban：invent prove EXIT / self-approve / 单域 pass = dual-complete  
- Ban：读 `.env*` / 触 Meridian / 对本刀执行 coding/prove

---

## 6. Approve / do-not-approve

**Approve（限）**：pre-exec 文档/REQUEST 门诚实够格 — W2 = baseline sizing **receipts** under **PG(+pgvector+PostgresSaver)** · **2c4g vs 4c8g** · local/doc sim OK；parent W0 §2 正确；向量真相 **pgvector retained** · Qdrant **STOPPED**；**sizing ≠ 关闸** · **≠** R4/FUNNEL/题域 closed · **≠** RAG quality green · **≠** capacity/HA/suite；F8/W1 parallel OK；`releaseEvidence=false`；Dual PASS **≠** 授权 coding；零 coding · 零 prove。

**Do not approve**：coding · prove · measured capacity cert · HA/suite green · FUNNEL/R4/题域/RAG quality closed · MySQL/Qdrant cutover 复活 · W1b · `releaseEvidence=true` · self-approve · Dual PASS 自动授权 later sim/coding · 把 sizing sketches 写成产品绿/容量证明。

---

## 7. 仍开 / 阻塞

| 类 | 项 |
|----|-----|
| **本域 pre-exec 文档门** | **无阻塞** → pass（docs only） |
| **coding / prove / measured sim** | **仍禁** — CMD `not_run:pre_dual` · 无 prove · Dual PASS ≠ authorize |
| **R1–R4 / FUNNEL / 题域** | **仍开**（本刀不关 · sizing ≠ 关闸） |
| **MySQL/Qdrant cutover** | **STOPPED** · 保持 |
| **W1b** | **NOT open** · may retest sizing after W1b · Dual ≠ authorize W1b |
| **F8 / W1 / siblings** | **仍开 / parallel** · untouched |
| **配对** | mw-e2e-ha 独立；本审不代签 |

---

## 8. 非宣称 / 收据

**禁止宣称**：sizing = capacity/HA/suite green · R4/FUNNEL/题域 closed · RAG quality green · sizing=关闸 · Qdrant/MySQL cutover 进行中或已授权 · Dual PASS=coding authorize · W1b authorized · self-approve · `releaseEvidence=true` · 本刀已 coding/prove

| 字段 | 值 |
|------|-----|
| 专家 | `mw-rag-route` |
| 覆盖 REQUEST | `REQUEST-2026-09-17-w2-resource-sizing-receipts-mw-rag-route.md` |
| 本 review | `ai-docs/delivery/reviews/2026-09-17-w2-resource-sizing-receipts-mw-rag-route.md` |
| Knife SHA | `3463e9e`（`3463e9e1af886518ea456a089c52761d3c7ed5a5`） |
| HEAD（审时） | `25833fc`（`25833fc93a9e1bb6a2337665bd9648fdb9f8ee1c`）· 含 3463e9e 祖先 |
| Verdict | **pass**（pre-exec docs gate only） |
| RAG-orthogonal（题域/FUNNEL/R4 · sizing≠关闸） | **yes** |
| Blockers | **none**（docs gate）；coding/prove/capacity/HA **仍禁** |
| `releaseEvidence` | **false** |
| Zero prove / zero coding | **confirmed** |
| Dual PASS ≠ authorize | **confirmed** |
| Sizing ≠ green/capacity/关闸 | **confirmed** |
| MySQL/Qdrant STOPPED | **confirmed** |

---

*Review · mw-rag-route · W2 resource sizing receipts · 2026-09-17 (~01:24 PT) · pass（pre-exec docs only）· SHA=3463e9e · HEAD=25833fc · releaseEvidence=false · ≠HA · ≠suite · ≠capacity · sizing≠关闸 · ≠R4/FUNNEL/题域 closed · pgvector retained · Qdrant STOPPED · Dual PASS ≠ authorize coding · zero prove · zero coding · Ban self-approve*

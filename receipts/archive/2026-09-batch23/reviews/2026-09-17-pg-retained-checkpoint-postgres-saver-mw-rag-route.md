# Review — Knife **PG-retained** · Postgres (+pgvector + PostgresSaver)（pre-exec）· mw-rag-route

**专家**：mw-rag-route  
**日期**：2026-09-17（~01:17 PT；对抗独立审 · **零 coding · 零 prove · 禁自批**）  
**结论**：**pass**（限：pre-exec 文档/REQUEST 门 — 向量真相留 **pgvector** · Qdrant 切流叙事 **STOPPED** · 资源 sizing = 规划信封 · **≠** R4/FUNNEL/题域 closed · **≠** sole cutover · **≠** HA/suite green · `releaseEvidence=false` · Dual PASS ≠ 授权 coding · **禁把政策裁定当绿**）  
**硬钉**：**≠ HA ≠ suite green ≠ R4 closed ≠ FUNNEL-01 closed ≠ 题域已隔离 ≠ sole cutover ≠ R5 retired ≠ MySQL sole relational ≠ Qdrant sole vector** · **Dual PASS ≠ 授权 coding/prove** · **Ban self-approve** · **Ban 把方向钉/政策裁定当绿** · `releaseEvidence=false` · 未读 `.env*` · **零 prove** · **零 coding**  
**配对**：mw-e2e-ha · 本审不代签 · 本审不代改 production / 不实现 cutover

覆盖 REQUEST：`REQUEST-2026-09-17-pg-retained-checkpoint-postgres-saver-mw-rag-route.md`  
对照：`harness/pg-retained-checkpoint-postgres-saver.md` · `pg-retained-checkpoint-postgres-saver.slice.md` · `eval/pg-retained-checkpoint-postgres-saver.eval.md` · `adr-postgres-retained.md` · `adr-mysql-qdrant-local.md`（relational+vector **SUPERSEDED** 注）· `m4-rag-hard-gates.md`（R1–R4 产品闸仍开；栈/Qdrant-required 声明 superseded）· STOPPED 样例 `harness/qdrant-store.prototype.md` / `m5-pgvector-fixture-retirement-plan.md` / `harness/r5-retirement-sole-stack-status.md` · Redis 正交样例 `harness/redis-streams-wakeup.prototype.md` / `m3-queue-wakeup-selection.md`

**本审动作**：读 harness/slice/eval/REQUEST/ADR · 抽查 STOPPED 横幅与 Redis orthogonal 横幅 · 核对 SHA=`0c95883` 仅 delivery docs · **零** prove 执行 · **零** coding · **未读** `.env*` · **未触** Meridian · **未改** production（仅写本 review）

---

## 0. Verdict table

| Item | Ruling |
|------|--------|
| **Verdict** | **pass**（pre-exec docs/REQUEST 门 only） |
| **Scope** | 方向钉文档诚实：Postgres(+pgvector+PostgresSaver) 保留 · MySQL/Qdrant **cutover STOPPED**；**NOT** coding · **NOT** prove · **NOT** close FUNNEL/R4/题域/suite/HA/sole |
| Implementer self-approve | **rejected** |
| CMD / prove | **`not_run:pre_dual`** · **无 prove script** · 本审 **未跑** 任何 prove |
| HEAD / SHA | HEAD = `0c958834087cf48bea3cbff35ed96efee0390575`（短 `0c95883`）· 与 REQUEST/刀钉 **一致** · docs-only commit · **无 drift** |
| RAG stance | **pgvector retained** · **Qdrant vector cutover STOPPED**（history kept） |
| 题域 / FUNNEL / R4 | **正交 = yes**（本刀只停 cutover 方向 · **不关** 产品闸） |
| Resource sizing | harness §2 规划信封 · **≠** capacity/HA/suite 证明 |
| `releaseEvidence` | **false** |
| Blockers（本域 pre-exec） | **none**（文档门够格）；coding/prove/cutover **仍禁**直至 dual PASS + **separate authorize** |
| Dual PASS ≠ coding | **硬钉同意** |
| 政策裁定 ≠ 绿 | **硬钉同意**（方向钉/Dual PASS **≠** product green） |

---

## 1. REQUEST Q1–Q6（rag-route answers）

| # | Q | Answer |
|---|---|--------|
| **1** | 向量真相是否留 **Postgres pgvector** · Ban Qdrant-required sole vector / replace-pgvector cutover？ | **同意（硬钉）**。ADR successor + harness §0/§1 + STOPPED §3 一致：vector stays **pgvector**；Ban Qdrant-as-required sole vector / replace-pgvector。 |
| **2** | STOPPED Qdrant inventory（m4/m5/qdrant-* / g1 / r5 retirement sole claims）是否诚实 · history kept？ | **同意**。harness §3 列齐；抽查 `qdrant-store.prototype` / `m5-pgvector-fixture-retirement-plan` / `r5-retirement-sole-stack-status` 均有 **STOPPED / superseded** 横幅且正文历史保留、未删。 |
| **3** | 本钉 **≠** R4 closed · **≠** FUNNEL-01 closed · **≠** RAG quality green？ | **同意（硬钉）**。仅停 MySQL/Qdrant *cutover* 方向；`m4-rag-hard-gates` 明示 R1–R4 **产品闸仍开**；本刀 **≠** retrieve quality proof · **≠** 题域已隔离。 |
| **4** | ADR mysql vector-cutover claims superseded · successor ADR ok？ | **同意**。`adr-mysql-qdrant-local` 顶注 **SUPERSEDED (relational + vector-cutover)** · history preserved；successor `adr-postgres-retained.md` 决策钉齐 · Redis wake 未取消。 |
| **5** | resource sizing ≠ capacity / HA / suite proof？ | **同意**。harness §2 明示 planning envelope / rough ranges / assumptions（单机 compose · 10s 并发）· Honesty bans 禁当 HA/suite/capacity 证据。 |
| **6** | Redis wake 仍可独立评 · F8 untouched · `releaseEvidence=false` · Dual PASS ≠ authorize coding · zero coding · Ban self-approve？ | **同意（硬钉）**。Redis 横幅 = **orthogonal / NOT canceled**；commit 未触 F8/commerce/egress；`releaseEvidence=false`；本审零 coding/零 prove；Ban self-approve；Dual PASS ≠ coding authorize。 |

---

## 2. RAG stance（核心）

| Point | Ruling |
|-------|--------|
| **Vector truth** | **Postgres pgvector retained** |
| **Qdrant cutover** | **STOPPED** — Ban required-sole-vector / replace-pgvector narrative；历史文档保留、加 STOPPED 横幅 |
| **Checkpoint** | **PostgresSaver** 保留（本域同意；与 e2e-ha 分工不冲突） |
| **MySQL relational cutover** | **STOPPED**（本域连带同意；非本审主面） |
| **sole / R5** | 前 sole=MySQL+Qdrant+Redis / R5→sole 退役叙事 **STOPPED** · **≠** sole cutover done · **≠** R5 retired-as-green |
| **R1–R4 / FUNNEL / 题域** | **仍开 / 正交** — 停 cutover **≠** 关产品闸 · **≠** RAG quality green |
| **政策裁定** | 方向钉 / Dual PASS = **文档门** · **禁当绿**（≠ HA · ≠ suite · ≠ FUNNEL/R4 closed） |

---

## 3. 正交裁定（题域 / FUNNEL / siblings）

| Point | Ruling |
|-------|--------|
| **题域隔离 / R4** | **正交** — 无 wrong-track / dispatch / domain-isolation 产品变更；本刀 **≠** R4 closed |
| **FUNNEL-01** | **正交** — 本刀 **≠** FUNNEL closed；仅停向量切流方向 |
| **F8 MS3** | **untouched**（commit 文件表无 F8；harness Explicitly not stopped） |
| **commerce / egress** | **untouched** |
| **Redis wake** | **separately evaluable** · **未授权** · **未取消** |
| **HA / suite** | **≠** — sizing 信封 **≠** HA evidence · **≠** suite green |
| **RAG-orthogonality to product gates** | **yes**（方向钉 ⊥ 产品关闸） |

---

## 4. Resource sizing（harness §2）

| Check | Ruling |
|-------|--------|
| 节存在 | **yes** — Envelope table：process/RAM/CPU/disk/hops/failure domains/erasure sinks |
| 假设诚实 | 单机 compose · 非 multi-AZ · 非 prod load test · rough ranges |
| Ban | **同意** — 禁当 capacity/HA/suite 证明 · 禁 Redis wake sized/authorized · 禁 branch `feat/mysql-schema-skeleton` 作 MySQL 正当化 · 禁 Dual PASS→cutover coding |

---

## 5. Fake-green bans（this review）

- Ban：本 pre-exec pass → coding/prove/cutover 已授权 / knife product-done  
- Ban：Dual PASS → 自动授权 MySQL 或 Qdrant cutover coding（须 **separate authorize**）  
- Ban：**把政策/方向裁定当绿**（方向钉 ≠ HA/suite/FUNNEL/R4/题域/sole/RAG quality green）  
- Ban：STOPPED 横幅 → 历史 Qdrant/MySQL 文档已删或“从未存在”  
- Ban：resource sizing 表 → production capacity / HA closed  
- Ban：pgvector retained → R5 retired / sole cutover done / RAG migrated  
- Ban：本刀 → R4/FUNNEL-01/题域 closed  
- Ban：Redis orthogonal → Redis wake 已授权切流  
- Ban：实现方 REQUEST = expert pass · self-approve  
- Ban：读 `.env*` / invent Live Key / `releaseEvidence=true`  
- Ban：单域 pass = dual-complete without pair

---

## 6. Approve / do-not-approve

**Approve（限）**：pre-exec 文档/REQUEST 门诚实够格 — 向量真相 **pgvector retained**；Qdrant replace-pgvector / sole-vector cutover **STOPPED**（inventory + 横幅抽查一致 · history kept）；ADR mysql relational+vector superseded · successor ADR ok；resource sizing = 规划信封 **≠** HA/suite；Redis wake 正交可评；F8 untouched；`releaseEvidence=false`；**≠** R4/FUNNEL/题域 closed；**≠** sole cutover；Dual PASS **≠** 授权 coding；**禁把裁定当绿**；本审 **零 prove · 零 coding**。

**Do not approve**：coding · prove · MySQL/Qdrant cutover 实现 · HA/suite green · FUNNEL/R4/题域 closed · sole cutover · R5 retired-as-green · Redis wake authorized · `releaseEvidence=true` · self-approve · 本 dual 自动 authorize coding · 把政策方向钉写成产品绿。

---

## 7. 仍开 / 阻塞

| 类 | 项 |
|----|-----|
| **本域 pre-exec 文档门** | **无阻塞** → pass（docs only） |
| **coding / prove / cutover** | **仍禁** — 待 dual PASS + **separate authorize**；CMD 仍 `not_run:pre_dual` · 无 prove script |
| **R1–R4 / FUNNEL / 题域** | **仍开**（本刀不关） |
| **sole / R5 / G1** | 前 sole/Qdrant 退役叙事 **STOPPED**；**≠** sole cutover done · **≠** R5 已退役绿 |
| **Redis wake** | **仍可评** · **未授权** |
| **F8 / commerce / egress** | **仍开 / untouched** |
| **配对** | mw-e2e-ha 独立；本审不代签 |

---

## 8. 非宣称 / 收据

**禁止宣称**：HA green · suite green · R4/FUNNEL/题域 closed · sole cutover done · R5 retired-as-green · Qdrant/MySQL cutover 仍进行或已授权 · Redis wake authorized · 本 prep 已 coding/prove · Dual PASS=coding authorize · 政策裁定=产品绿 · self-approve · `releaseEvidence=true`

| 字段 | 值 |
|------|-----|
| 专家 | `mw-rag-route` |
| 覆盖 REQUEST | `REQUEST-2026-09-17-pg-retained-checkpoint-postgres-saver-mw-rag-route.md` |
| 本 review | `ai-docs/delivery/reviews/2026-09-17-pg-retained-checkpoint-postgres-saver-mw-rag-route.md` |
| HEAD / SHA | `0c958834087cf48bea3cbff35ed96efee0390575`（`0c95883`） |
| Verdict | **pass**（pre-exec docs gate only） |
| RAG stance | **pgvector retained · Qdrant cutover STOPPED** |
| 题域/FUNNEL 正交 | **yes** |
| Resource sizing | planning envelope · ≠HA/suite |
| Blockers | **none**（docs gate）；coding/prove **仍禁** |
| `releaseEvidence` | **false** |
| Zero prove / zero coding | **confirmed** |

---

*Review · mw-rag-route · PG-retained · 2026-09-17 (~01:17 PT) · pass（pre-exec docs only）· releaseEvidence=false · ≠HA · ≠suite · ≠R4/FUNNEL closed · pgvector retained · Qdrant STOPPED · Dual PASS ≠ authorize coding · Ban 裁定当绿 · zero prove · zero coding · Ban self-approve*

# Review — Knife **W5** · MODEL-OP dual reconciler + wakeup honesty（pre-exec）· mw-rag-route

**专家**：mw-rag-route  
**日期**：2026-09-17（~01:26 PT；对抗独立审 · **零 coding · 零 prove · 禁自批 · Ban forge MODEL-OP 假绿**）  
**结论**：**pass**（限：pre-exec 文档/REQUEST 门 — W5 = **docs-only honesty pin** · dual reconciler 同列 **≠** 已接/已切 · prod wakeup = **PG LISTEN/NOTIFY provisional keep** · Redis wake **deferred** · Ban forge SLO · **≠** MODEL-OP closed / 假绿 · **≠** reconciler/wakeup cutover · **RAG 正交** · **≠** R1/R2/R4/FUNNEL closed · **≠** route verbally effective · **≠** retrieve quality green · **禁假迁栈** · Dual PASS **≠** 授权 coding · **≠** HA/suite · `releaseEvidence=false`）  
**硬钉**：**Dual PASS ≠ 授权** · **releaseEvidence=false** · **Ban MODEL-OP 假绿** · **RAG 正交** · **禁假迁栈**（Ban 经 wakeup/reconciler 叙事 reopen MySQL/Qdrant cutover） · **≠HA/suite** · **≠ FUNNEL/R4 closed** · **零 coding · 零 prove** · Ban self-approve · 未读 `.env*` · 未触 Meridian  
**配对**：mw-e2e-ha · 本审不代签 · 不代写 pass · 不授权 coding / reconciler cutover / Redis wake cutover / SLO green · `mw-model-op` 可选 later（domain cutover REQUEST · **不在**本 REQUEST 对）

覆盖 REQUEST：`REQUEST-2026-09-17-w5-model-op-dual-reconciler-wakeup-mw-rag-route.md`  
对照：`harness/w5-model-op-dual-reconciler-wakeup.md` · `w5-model-op-dual-reconciler-wakeup.slice.md` · `eval/w5-model-op-dual-reconciler-wakeup.eval.md` · `m3-queue-wakeup-selection.md` · `harness/redis-streams-wakeup.prototype.md` · `m3-redis-wakeup-prototype.md` · `gap-bug-backlog.md`（GAP-MOP-01/03 · BUG-NOTIFY-REC）· `m4-rag-hard-gates.md`（R1–R4 **untouched**）· PG-retained parent

**本审动作**：读 harness/slice/eval/REQUEST + M3/Redis priors + GAP-MOP + m4-rag-hard-gates · 核对刀钉 SHA=`25833fc` · HEAD=`25833fc` · **零** prove · **零** coding · **未跑** `model-invocation-reconcile:prove` / `model-op00-usage-reconciler:prove` / `worker-wakeup:prove` / `worker-wakeup-redis:prove` · **未改** apps/worker · **未触** Redis wake cutover · **未读** `.env*` · **未触** Meridian · 仅写本 review

---

## 0. Verdict table

| Item | Ruling |
|------|--------|
| **Verdict** | **pass**（pre-exec docs/REQUEST 门 only） |
| **Scope** | Docs-only：dual reconciler honesty + wakeup honesty · **零 coding** |
| Implementer self-approve | **rejected** |
| CMD / prove | **`not_run:pre_dual`** · **no prove script this knife** · 本审 **未跑** any prove |
| Knife SHA | **`25833fc`**（`25833fc93a9e1bb6a2337665bd9648fdb9f8ee1c`）· W5 REQUEST open · docs-only |
| HEAD（审时） | `25833fc93a9e1bb6a2337665bd9648fdb9f8ee1c`（短 `25833fc`）· **=** knife SHA |
| RAG stance | **正交** — 本刀 **≠** R1/R2/R4/FUNNEL closed · **≠** route verbally effective · **≠** retrieve quality green · pgvector **retained** |
| 假迁栈 | **禁** — Ban 经 wakeup/reconciler 叙事 reopen MySQL/Qdrant cutover · PG+pgvector+PostgresSaver retained |
| MODEL-OP | **≠ closed** · Ban 假绿 · dual reconciler / wakeup **仍开诚实门** |
| `releaseEvidence` | **false** |
| Blockers（本域 pre-exec） | **none**（文档门够格）；coding / cutover / SLO forge / prove **仍禁** |
| Dual PASS ≠ 授权 coding | **硬钉同意** |
| Zero prove / zero coding | **confirmed** |

---

## 1. REQUEST Q1–Q5（rag-route answers）

| # | Q | Answer |
|---|---|--------|
| **1** | 本刀 ≠ R2/R4/FUNNEL closed · ≠ route verbally effective · ≠ retrieve quality green？ | **同意（硬钉）**。W5 = MODEL-OP dual-reconciler + wakeup **docs honesty**；`m4-rag-hard-gates` R1–R4 / FUNNEL **untouched · 仍开**。Ban 把 reconciler/wakeup 文档钉读成 RAG 产品关闸、路由口头生效、retrieve 质量绿。 |
| **2** | dual reconciler honesty 同列 · ≠ cutover · Ban forge SLO？ | **同意（硬钉）**。`model-invocation-reconcile` **与** `usageCalibrationReconciler` **同列**（GAP-MOP-03）；docs/connectivity/prior prove EXIT **≠** reconciler已接/已切 · **≠** queue migrated · **≠** MODEL-OP closed。Ban forge SLO / capacity / latency green。#102 calib **INFLIGHT** ≠ Q4 dual-closed。 |
| **3** | prod PG LISTEN/NOTIFY provisional · Redis wake deferred？ | **同意（硬钉）**。Prod keep `job-wakeup-listener` + `meetwise_worker_wakeup_v1` **provisional**（GAP-MOP-01 · BUG-NOTIFY-REC）；Ban 删 PG listener without separate authorize。Redis Streams = flag-off additive / **deferred** · **≠** production cutover authorized（M3 selection / redis prototype harness）。 |
| **4** | PG/pgvector retained · Ban MySQL/Qdrant reopen via this docs pin？ | **同意（硬钉 · 禁假迁栈）**。PG+pgvector+PostgresSaver **retained**；wakeup/reconciler 叙事 **不得** reopen MySQL relational 或 Qdrant vector cutover。Redis wake under PG-retained = **orthogonal / separately evaluable** · **≠** 假迁栈授权。 |
| **5** | `releaseEvidence=false` · Dual PASS ≠ authorize coding · zero coding · Ban self-approve · `mw-model-op` optional later？ | **同意（硬钉）**。Dual PASS 至多 = docs honesty 契约同意；coding / reconciler cutover / Redis wake cutover / SLO claim **另开 REQUEST + 授权**。`mw-model-op` 可选 later for domain cutover · **不在**本 e2e-ha+rag-route REQUEST 对。本审零 coding / 零 prove；Ban self-approve。 |

### Meetwise 追钉（显式答）

| 追钉 | 裁定 |
|------|------|
| **RAG 正交** | **同意** — W5 **≠** R1/R2/R4/FUNNEL closed · **≠** route verbally effective · **≠** retrieve quality green · RAG product gates **仍开 / untouched** |
| **禁假迁栈** | **同意** — Ban 经 wakeup/reconciler 叙事宣称 MySQL/Qdrant cutover 进行中或已授权 · PG+pgvector retained honesty |
| **Dual PASS ≠ 授权** | **同意** — ≠ coding · ≠ reconciler cutover · ≠ Redis wake cutover · ≠ SLO green · ≠ MODEL-OP closed |
| **releaseEvidence=false** | **同意** · **≠HA** · **≠suite** |
| **Ban MODEL-OP 假绿** | **同意** — 禁宣称 MODEL-OP / dual reconciler / wakeup **已关** · 禁把 prior prove EXIT 当 W5 green close |

---

## 2. RAG / stack stance（核心）

| Point | Ruling |
|-------|--------|
| **RAG 正交** | **yes** — wakeup/reconciler honesty **不**关闭 R1/R2/R4/FUNNEL |
| **route verbally effective** | **≠** — 本刀无关 · R2 overall **仍 NOT closed**（m4） |
| **retrieve quality** | **≠ green** — 本刀无关 |
| **Vector truth** | **Postgres pgvector retained** |
| **Qdrant cutover** | **STOPPED / 禁假迁栈 reopen** |
| **MySQL relational cutover** | **STOPPED / 禁假迁栈 reopen** |
| **Checkpoint / PostgresSaver** | **retained**（PG-retained parent） |
| **Redis wake vs RAG** | Redis wake **orthogonal** to RAG gates · **deferred** · **≠** RAG cutover |

---

## 3. MODEL-OP / wakeup honesty（≠ 假绿）

| Face | Ruling |
|------|--------|
| **model-invocation reconcile** | 同列 · local/structural prove 可能 · **≠** production cutover · **≠** SLO · **≠** W5 close |
| **usageCalibrationReconciler** | 同列 · **≠** 已接生产主链 · #102 INFLIGHT ≠ dual-closed |
| **Prod PG LISTEN/NOTIFY** | **provisional keep** · lossy hint · durable truth = job tables + claim/lease + periodic reconcile |
| **Redis Streams prototype** | flag-off additive · **deferred** · Ban claiming production Redis wake |
| **BUG-NOTIFY-REC** | 仍开 — Redis hint + **forced** periodic reconcile required **before** cutover |
| **Prior prove EXIT** | reference only · **Ban** treating as W5 green close / MODEL-OP closed |
| **MODEL-OP closed?** | **NO** — Ban 假绿 |

---

## 4. 正交裁定（RAG ≠ MODEL-OP knife · ≠HA/suite）

| Point | Ruling |
|-------|--------|
| **题域隔离 / R4 / FUNNEL** | **正交 = yes** — 无 domain/funnel 产品变更；**≠** closed |
| **R2 classify / route effective** | **正交 = yes** — **≠** closed · **≠** verbal 生效 |
| **HA / suite** | **≠** — `releaseEvidence=false` |
| **W4 R2 close-auth · F8 · PG-retained** | parallel OK · untouched · **不**并入本 W5 为「已关」 |
| **mw-model-op domain cutover** | **optional later** · **not** this REQUEST pair |

---

## 5. Eval E1–E7 honesty

| ID | Eval point | Ruling |
|----|------------|--------|
| E1 | dual reconciler 同列 · docs/prove ≠ 已接/已切 | **同意** |
| E2 | prod PG LISTEN/NOTIFY provisional · Ban delete without authorize | **同意** |
| E3 | Redis wake deferred · ≠ cutover authorized | **同意** |
| E4 | Ban forge SLO / capacity / latency from knife or prototype prove | **同意** |
| E5 | PG+pgvector+PostgresSaver retained · Ban MySQL/Qdrant reopen | **同意 · 禁假迁栈** |
| E6 | REQUEST pair e2e-ha+rag-route · mw-model-op optional later | **同意** |
| E7 | releaseEvidence=false · Dual PASS ≠ authorize coding · zero coding · Ban self-approve · ≠HA/suite | **同意** · 本审已遵守 |

---

## 6. Fake-green bans（this review）

- [x] 未宣称 reconciler已接/已切 / queue migrated / MODEL-OP closed  
- [x] 未宣称 Redis wake production cutover  
- [x] 未 forge SLO / HA / suite / `releaseEvidence=true`  
- [x] 未用 Dual PASS 授权 coding / 删 PG LISTEN  
- [x] 未 invent prove EXIT / self-approve  
- [x] 未宣称 R1/R2/R4/FUNNEL closed · route verbally effective · retrieve quality green  
- [x] 未假迁栈 reopen MySQL/Qdrant cutover  
- [x] 未把 prior `*:prove` EXIT 当 W5 green close  
- [x] **零 prove** · **零 coding**

---

## 7. Blockers

| 域 | Blocker |
|----|---------|
| **本域 pre-exec（docs gate）** | **none** — harness/slice/eval/REQUEST/GAP-MOP/M3/m4 对齐；硬钉齐全 |
| **仍禁（非本刀解锁）** | coding · reconciler cutover · Redis wake cutover · forge SLO · MODEL-OP closed claim · R2/R4/FUNNEL closed claim · 假迁栈 · HA/suite · self-approve · prove this prep · Dual PASS→authorize |

---

## 8. Non-claims / 收据

**禁止宣称**：MODEL-OP closed · dual reconciler 已接/已切 · Redis wake 生产已切 · SLO/HA/suite green · R1/R2/R4/FUNNEL closed · route verbally effective · retrieve quality green · MySQL/Qdrant cutover 进行中或已授权（假迁栈）· Dual PASS=authorize coding · self-approve · `releaseEvidence=true` · 本刀已 coding/prove

| 字段 | 值 |
|------|-----|
| 专家 | `mw-rag-route` |
| 覆盖 REQUEST | `REQUEST-2026-09-17-w5-model-op-dual-reconciler-wakeup-mw-rag-route.md` |
| 本 review | `ai-docs/delivery/reviews/2026-09-17-w5-model-op-dual-reconciler-wakeup-mw-rag-route.md` |
| Knife SHA / HEAD | `25833fc`（`25833fc93a9e1bb6a2337665bd9648fdb9f8ee1c`） |
| Verdict | **pass**（pre-exec docs gate only） |
| RAG-orthogonal | **yes**（≠ R1/R2/R4/FUNNEL closed） |
| 禁假迁栈 | **confirmed** |
| Ban MODEL-OP 假绿 | **confirmed** |
| Blockers | **none**（docs gate）；coding/cutover/SLO/prove **仍禁** |
| `releaseEvidence` | **false** |
| Zero prove / zero coding | **confirmed** |
| Dual PASS ≠ 授权 | **confirmed** |

---

*Review · mw-rag-route · W5 MODEL-OP dual reconciler + wakeup · 2026-09-17 (~01:26 PT) · verdict=pass（pre-exec docs only）· SHA/HEAD=`25833fc` · releaseEvidence=false · ≠HA · ≠suite · Ban MODEL-OP 假绿 · RAG 正交 · 禁假迁栈 · Dual PASS ≠ 授权 · prod PG LISTEN provisional · Redis deferred · Ban forge SLO · ≠R2/R4/FUNNEL closed · zero prove · zero coding · Ban self-approve*

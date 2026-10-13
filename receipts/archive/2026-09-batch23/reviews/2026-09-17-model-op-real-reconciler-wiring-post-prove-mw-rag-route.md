# Review — Knife **MODEL-OP-wire** · real reconciler wiring（**post-prove**）· mw-rag-route

**专家**：mw-rag-route  
**日期**：2026-09-17（~19:48 PT；对抗独立 post-prove 审 · **复跑 3×prove** · 禁自批 · Ban forge MODEL-OP 假绿 · Ban elevating · Ban W5 wash）  
**结论**：**pass**（限：post-prove 门 — 独立复跑 3 CMD **EXIT=0/0/0** · `release_evidence=false` · Redis **not run / deferred** 诚实 · PG LISTEN **retained** · harness 仍 **`executed:awaiting_post_prove_dual`** · **≠** MODEL-OP closed · **≠** W5 masquerade/wash · **RAG 正交** · **≠** R1/R2/R4/FUNNEL closed · **≠** route verbally effective · **≠** retrieve quality green · **禁假迁栈** · `releaseEvidence=false` · **≠HA** · **≠suite**）  
**硬钉**：**RAG 正交** · **Ban MODEL-OP 假绿** · **Ban 假迁栈** · **Ban elevating**（prove EXIT ≠ MODEL-OP closed ≠ W5 wash ≠ cutover ≠ SLO）· **releaseEvidence=false** · **≠HA/suite** · **≠ R4/FUNNEL closed** · Ban self-approve · 未读 `.env*` · 未触 Meridian · **未**自写 harness `post_prove_dual_pass`  
**配对**：mw-e2e-ha · 本审不代签 · 不代写对方 pass · 不授权 Redis wake cutover / SLO green / MODEL-OP closed / HA suite

覆盖 REQUEST：`REQUEST-2026-09-17-model-op-real-reconciler-wiring-post-prove-mw-rag-route.md`  
对照：`receipts/2026-09-17-model-op-real-reconciler-wiring-prove.md` · `harness/model-op-real-reconciler-wiring.md`（status=`executed:awaiting_post_prove_dual`）· prep dual `2026-09-17-model-op-real-reconciler-wiring-mw-rag-route.md`（pass on `0137f39`）· `apps/worker/src/usage-calibration-reconcile.ts` · `apps/worker/src/main.ts` · `packages/db/migrations/0134_usage_calibration_gateway_owners.sql` · `m4-rag-hard-gates.md`（正交 / untouched）

**本审动作**：读 receipt + REQUEST + harness · 抽查 wiring（usage-calibration drain-loop + main PG LISTEN + Redis flag-off additive）· **独立复跑** 三 prove CMD · **未跑** `worker-wakeup-redis:prove`（deferred 诚实）· **未改** harness status · **未读** `.env*` · **未触** Meridian · 仅写本 review

---

## 0. Verdict table

| Item | Ruling |
|------|--------|
| **Verdict** | **pass**（post-prove 门 only · ≠ MODEL-OP closed） |
| **SHA_B（claimed / verified）** | **`6cd621c`**（`6cd621ccd693a388b41a4feab7ebadafac2f9d12`）· `feat(model-op-wire): wire dual reconciler + prove (awaiting_post_prove_dual)` · **HEAD 祖先含此 commit** |
| **HEAD（审时）** | `42f77c1`（`42f77c1d5552f9480f88535a075e0d44008c82e7`）· 其后仅 docs nail（R4/FUNNEL rem / G7 REQUEST）· **≠** 本刀 wiring 回滚 |
| **CMD / EXIT（独立复跑）** | **0 / 0 / 0**（见 §1） |
| **Redis prove** | **`not_run` / deferred** · ≠ cutover · ≠ STOPPED 误宣 |
| **PG LISTEN** | **retained**（`startWorkerJobWakeupListener` 仍在 `main.ts` · Redis Streams 注释明确 never replaces PG） |
| **Harness status** | 仍 **`executed:awaiting_post_prove_dual`** · 实现方 **未**自写 `post_prove_dual_pass` · 本审亦 **未**改 harness |
| **RAG stance** | **正交** — ≠ R1/R2/R4/FUNNEL closed · ≠ verbal route · ≠ retrieve quality green |
| **假迁栈** | **禁** — PG+pgvector+PostgresSaver retained · MySQL/Qdrant STOPPED |
| **MODEL-OP** | **≠ closed** · Ban 假绿 · Ban elevating prove EXIT |
| **≠ W5** | **硬钉** — 本刀 ≠ W5 docs close wash / masquerade |
| **`releaseEvidence`** | **false**（isolated receipts 确认） |
| **Blockers（本域 post-prove）** | **none**；MODEL-OP closed / Redis cutover / R4·FUNNEL / HA·suite / W5 wash **仍禁** |

---

## 1. 独立复跑 CMD+EXIT

| CMD | EXIT | Log（本审 box） | 诚实读法 |
|-----|------|----------------|----------|
| `pnpm model-invocation-reconcile:prove` | **0** | `.tmp/model-op-wire-post-prove-mw-rag-route/model-invocation-reconcile.log` | ≠ MODEL-OP closed · ≠ SLO · ≠ cutover · `release_evidence=false` |
| `pnpm model-op00-usage-reconciler:prove` | **0** | `.tmp/model-op-wire-post-prove-mw-rag-route/model-op00-usage-reconciler.log` | ≠ MODEL-OP closed · RAG 正交 · `release_evidence=false` |
| `pnpm worker-wakeup:prove` | **0** | `.tmp/model-op-wire-post-prove-mw-rag-route/worker-wakeup.log` | PG LISTEN retained · ≠ Redis cutover |
| `pnpm worker-wakeup-redis:prove` | **not run** | — | **deferred 诚实** · ≠ cutover · Ban 把 not-run 洗成绿 |

**EXIT-summary**（本审）：`.tmp/model-op-wire-post-prove-mw-rag-route/EXIT-summary.txt` · 起跑 ~19:47 PT · 三 CMD 均 EXIT=0。  
与实现方 receipt（`EXIT 0/0/0` · redis not run）**一致**；本审 **独立复跑** 非抄录。

Isolated proof 尾标（抽查）：
- invocation：`LOCAL_ISOLATED_PROOF_RECEIPT … release_evidence=false`
- usage：`LOCAL_ISOLATED_PROOF_RECEIPT … release_evidence=false`
- wakeup：`✓ worker listener lifecycle proof passed`（无 release_evidence=true）

---

## 2. REQUEST Q1–Q5（rag-route answers）

| # | Q | Answer |
|---|---|--------|
| **1** | 抽查/复跑至少 `pnpm model-op00-usage-reconciler:prove`，附 CMD+EXIT | **已做且扩到三 CMD**：`model-invocation-reconcile:prove`→**0** · `model-op00-usage-reconciler:prove`→**0** · `worker-wakeup:prove`→**0** · redis **not run**。日志见 `.tmp/model-op-wire-post-prove-mw-rag-route/`。 |
| **2** | 是否同意 **RAG 正交**（≠ R1/R2/R4/FUNNEL closed · ≠ verbal route · ≠ retrieve quality green）？ | **同意（硬钉）**。本刀 = worker dual reconciler wiring + PG wakeup prove · **不**触 RAG product gates · **≠** R1/R2/R4/FUNNEL closed。 |
| **3** | 是否同意 Ban 假迁栈 · PG retained · MySQL/Qdrant STOPPED？ | **同意（硬钉）**。Ban 经 reconciler/wakeup 叙事 reopen MySQL/Qdrant cutover · PG+pgvector+PostgresSaver **retained**。 |
| **4** | 是否同意 status 保持 **`executed:awaiting_post_prove_dual`**（未自写 `post_prove_dual_pass`）？ | **同意（硬钉）**。harness 现仍 `executed:awaiting_post_prove_dual` · 实现方 receipt 明示 Ban self-write · 本审 **未**改 harness status。 |
| **5** | 是否引入 secrets / MODEL-OP fake green / W5 masquerade / HA/suite？（期望：否） | **否（确认）**。未读 `.env*` · 未宣称 MODEL-OP closed · ≠ W5 wash · `releaseEvidence=false` · ≠HA · ≠suite。 |

### Meetwise 追钉（显式答）

| 追钉 | 裁定 |
|------|------|
| **Redis deferred honesty** | **同意** — `worker-wakeup-redis:prove` **not run** · deferred · not STOPPED · ≠ cutover · Ban 把 deferred 洗成「已切」或误称 STOPPED 已撤 |
| **PG LISTEN retained** | **同意** — `startWorkerJobWakeupListener` 仍接线 · Redis Streams 默认 flag-off additive · 注释「never replaces the PG LISTEN session」 |
| **Ban elevating → MODEL-OP closed** | **同意** — 3×EXIT=0 **≠** MODEL-OP closed · ≠ SLO · ≠ cutover claimed |
| **Ban elevating → W5 wash** | **同意** — 本刀 ≠ W5 docs close masquerade/wash · W5 = docs honesty only |
| **Ban 假绿 / 假迁栈** | **同意** |
| **releaseEvidence=false** | **同意** · **≠HA** · **≠suite** |

---

## 3. Wiring spot-check（≠ cutover claim）

| Surface | 观察 | Ruling |
|---------|------|--------|
| `apps/worker/src/usage-calibration-reconcile.ts` | **new** drain-loop · `reconcileUsageCalibration` · 文件头钉 PG LISTEN / Redis deferred | wired · ≠ MODEL-OP closed |
| `apps/worker/src/main.ts` | import + `runUsageCalibrationReconciler` + ready/SIGTERM · **PG LISTEN** `startWorkerJobWakeupListener` **retained** · Redis Streams flag-off additive | PG retained · Redis ≠ cutover |
| `packages/db/migrations/0134_usage_calibration_gateway_owners.sql` | 存在 | gateway owners helper · ≠ SLO |
| SHA_B `6cd621c` | feat 含 worker + migration + prove receipt + post-prove REQUESTs | 祖先于 HEAD · 证据链完整 |

---

## 4. RAG / stack stance（核心）

| Point | Ruling |
|-------|--------|
| **RAG 正交** | **yes** — dual reconciler wiring prove **不**关闭 R1/R2/R4/FUNNEL |
| **route verbally effective** | **≠** |
| **retrieve quality** | **≠ green** |
| **R4 / FUNNEL** | **≠ closed** — Ban folding |
| **Vector truth** | **Postgres pgvector retained** |
| **Qdrant / MySQL cutover** | **STOPPED / 禁假迁栈 reopen** |
| **Checkpoint / PostgresSaver** | **retained** |
| **Redis wake vs RAG** | Redis wake **orthogonal** · **deferred** · **≠** RAG cutover |

---

## 5. Fake-green / elevating bans（this review）

- [x] 未宣称 MODEL-OP closed / dual reconciler cutover / SLO green  
- [x] 未宣称 Redis production cutover · 未误称 Redis STOPPED 已撤  
- [x] 未 W5 masquerade / wash（本刀 ≠ W5 docs close）  
- [x] 未 forge HA / suite / `releaseEvidence=true`  
- [x] 未宣称 R1/R2/R4/FUNNEL closed · route verbally effective · retrieve quality green  
- [x] 未假迁栈 reopen MySQL/Qdrant  
- [x] 未把 3×EXIT=0 升格为 MODEL-OP closed / HA green  
- [x] 未自写 harness `post_prove_dual_pass`  
- [x] 未读 `.env*` · 未触 Meridian  
- [x] 独立复跑证明 · 非抄录假绿

---

## 6. Blockers

| 域 | Blocker |
|----|---------|
| **本域 post-prove（rag-route）** | **none** — 3×EXIT=0 复跑一致 · redis deferred 诚实 · PG LISTEN retained · harness 未自写 pass · RAG 正交钉齐全 |
| **仍禁（非本审解锁）** | MODEL-OP closed claim · Redis wake cutover · R2/R4/FUNNEL closed · 假迁栈 · HA/suite · W5 wash · SLO forge · self-write `post_prove_dual_pass` · elevating prove EXIT |

---

## 7. Non-claims / 收据

**禁止宣称**：MODEL-OP closed · Redis wake 生产已切 · SLO/HA/suite green · R1/R2/R4/FUNNEL closed · route verbally effective · retrieve quality green · MySQL/Qdrant cutover（假迁栈）· W5 wash · `releaseEvidence=true` · harness 已 `post_prove_dual_pass`（需 **双专家**后由 meetwise 钉 · 本审仅一方）

| 字段 | 值 |
|------|-----|
| 专家 | `mw-rag-route` |
| 覆盖 REQUEST | `REQUEST-2026-09-17-model-op-real-reconciler-wiring-post-prove-mw-rag-route.md` |
| 本 review | `ai-docs/delivery/reviews/2026-09-17-model-op-real-reconciler-wiring-post-prove-mw-rag-route.md` |
| SHA_B | `6cd621c`（`6cd621ccd693a388b41a4feab7ebadafac2f9d12`） |
| HEAD（审时） | `42f77c1`（`42f77c1d5552f9480f88535a075e0d44008c82e7`） |
| CMD+EXIT | `model-invocation-reconcile:prove`=**0** · `model-op00-usage-reconciler:prove`=**0** · `worker-wakeup:prove`=**0** · `worker-wakeup-redis:prove`=**not_run/deferred** |
| Redis status | **deferred / not run** · ≠ cutover |
| Verdict | **pass**（post-prove 门 only） |
| RAG-orthogonal | **yes** |
| Ban MODEL-OP 假绿 / elevating / W5 wash | **confirmed** |
| 禁假迁栈 | **confirmed** |
| Harness status | 仍 **`executed:awaiting_post_prove_dual`** |
| Blockers | **none**（本域）；closed/cutover/HA/R4·FUNNEL/W5 wash **仍禁** |
| `releaseEvidence` | **false** |

---

*Review · mw-rag-route · MODEL-OP-wire post-prove · 2026-09-17 (~19:48 PT) · verdict=pass（post-prove only）· SHA_B=`6cd621c` · HEAD=`42f77c1` · EXIT 0/0/0 · redis=deferred/not_run · releaseEvidence=false · ≠HA · ≠suite · ≠MODEL-OP closed · ≠W5 wash · RAG 正交 · 禁假迁栈 · PG LISTEN retained · Ban elevating · ≠R2/R4/FUNNEL closed · harness 仍 awaiting_post_prove_dual · Ban self-approve*

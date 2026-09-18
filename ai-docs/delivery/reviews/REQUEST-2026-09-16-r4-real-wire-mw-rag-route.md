# REQUEST — R4 / G4 **REAL-WIRE**（真接线 inventory · **不接线**）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（PT · ~04:51）  
**releaseEvidence=false** · Not HA · **pass ≠ R4 已关** · **≠ 题域已隔离** · **≠ wrong_track=0** · **≠ full P-WIRE** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE**  
**硬闸**：`north-star-hard-gates.md` **已生效**（文档闸）· **≠** 本 REQUEST 授权 coding / prove 绿关  
**配对**：`REQUEST-2026-09-16-r4-real-wire-mw-e2e-ha.md`

---

## 对照

| 文件 | 角色 |
|------|------|
| `harness/r4-domain-isolation.md` **§6c** | intended wire W1–W6 · 假绿风险 · 阻塞表 · NHP-R4 |
| `harness/r4-domain-isolation-status.md` **§7** | REAL-WIRE await dual · 不接线 |
| `eval/r4-domain-isolation.eval.md` **§7** | pre-exec；CMD=`not_run:pre_dual_review` |
| `non-happy-path-perf-load-case-matrix.md` §1.5 | NHP-R4-* / NHP-RAG-LOAD-01 |
| `m4-rag-hard-gates.md` §R4 · GAP-RAG-04 | 题域隔离 NOT closed |
| `packages/db/src/qbank-track-local-retrieval.ts` | 合同 seam（dispatch+recheck） |
| `packages/domain/src/qbank-track-local-retrieval.ts` | `RetrievalPlan` / `validateRetrievalPlan` |
| `apps/worker/src/{main,interview-consumer,qbank-retrieve-scope}.ts` | **仍零** dispatch；partial 主叶 + G-R2-5 |
| 前序 FOLLOW dual | `2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-{rag-route,e2e-ha}.md`（**pass · 仅 honesty / 仍不接线**） |

---

## 切片立场（实现方自认）

FOLLOW honesty **post-prove dual-passed** 之后，本刀打开 **R4 真接线**评估：

1. **Inventory** 最小诚实路径：per-turn `InterviewPlannerOutput` → 组装完整 `RetrievalPlan`（含 generationId/recipeId）→ `dispatchTrackLocalRetrieval` → recheck → Worker 消费；`recheck_failed` / 缺 snapshot **fail-closed**（不回退 unscoped）。  
2. **假绿主险**：**P-FAKEPLAN**（主叶硬塞 plan 无 planner/generation/recipe）。  
3. **产品阻塞仍开**：**P-PLANNER**（主）· P-R2 overall · P-R1 · P-META · P-WT0。  
4. **实现方裁定**：**产品风险高 → 停在 harness + REQUEST**；**不**改 Worker；**不**跑本刀 prove 绿关；**await dual before code/prove**。

Worker 现状（本刀后仍成立）：`apps/worker/src` **零** `dispatchTrackLocalRetrieval(`。

---

## 请专家（双审通过前）**不要**要求实现方开始 wiring / 绿关 prove

本刀 **无**新 REAL-WIRE prove；既有 honesty subset 仅旁证「仍未接线」钉，**不得**写成 REAL-WIRE 已齐。

| CMD | 本刀 | 读法 |
|-----|------|------|
| （无） | **not_run:pre_dual_review** | 禁绿关 |
| `pnpm g4-dispatch-recheck-prereq:prove`（旁证可选） | 期望仍 **0** | **未接线**钉；≠ full wire |

---

## 请专家回答

1. harness §6c intended wire（W1–W6）是否诚实描述最小生产路径（含 recheck 与 generation/recipe 要求）？  
2. 是否同意：**产品风险高（尤其 P-PLANNER / P-FAKEPLAN）→ 本刀正确不接线**，仅 inventory + REQUEST？  
3. FOLLOW post-prove dual-pass 是否 **不得**自动批准本刀 coding / 不得写成 R4 / full P-WIRE 已关？  
4. NHP-R4 NEG/FAULT/BOUND/ADV/PERF/LOAD 是否仍不得升格为 covered；ADV（wrong_track=0）仍 gap/blocked？  
5. 若将来有条件真接线，是否必须：**真 per-turn planner 输出** + 完整 `RetrievalPlan` 字段 + 保留 G-R2-5 fail-closed + **单独** wrong_track=0 prove，且 **接线绿 ≠ R4 关**？  
6. 是否同意：保持 **R4 NOT closed**；`releaseEvidence=false`；禁 flip default / open DELETE / HA？

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass；实现方禁止自批  
- **未**接线生产 dispatch/recheck/planner 消费  
- 不宣称 R4 / 题域已隔离 / wrong_track=0 / full P-WIRE  
- 不把 FOLLOW dual / G-R2-5 / partial P-WIRE 升格为真接线批准  
- 不切 qbank / 向量真相 / flip default / open DELETE / HA / `releaseEvidence=true`  
- **await dual before code/prove**

---

*REQUEST · mw-rag-route · R4-REAL-WIRE · 2026-09-16 PT · releaseEvidence=false · ≠HA*

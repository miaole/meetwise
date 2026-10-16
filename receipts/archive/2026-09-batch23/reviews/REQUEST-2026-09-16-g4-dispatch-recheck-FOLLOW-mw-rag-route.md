# REQUEST — G4/R4 dispatch-recheck FOLLOW（honesty recheck · 不接线）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · Not HA · **pass ≠ R4 已关** · **≠ 题域已隔离** · **≠ wrong_track=0** · **≠ full P-WIRE** · **≠ sole cutover**  
**硬闸**：`north-star-hard-gates.md` **已生效**（文档闸）· **≠** 本 REQUEST 授权 prove 绿关；非happy prove **不笼统开跑**  
**配对**：`REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-mw-e2e-ha.md`

---

## 对照

| 文件 | 角色 |
|------|------|
| `harness/r4-domain-isolation.md` §6b | FOLLOW 差距盘点 + NHP-R4 六列 + 阻塞表 |
| `harness/r4-domain-isolation-status.md` §6 | FOLLOW await dual |
| `eval/r4-domain-isolation.eval.md` §6 | pre-exec；实测 EXIT=`not_run:pre_dual_review` |
| `non-happy-path-perf-load-case-matrix.md` §1.5 | NHP-R4-* / NHP-RAG-LOAD-01 |
| `m4-rag-hard-gates.md` §R4 · GAP-RAG-04 | 题域隔离 NOT closed |
| `packages/db/src/qbank-track-local-retrieval.ts` | 合同 seam（dispatch+recheck） |
| `apps/worker/src/{main,interview-consumer,qbank-retrieve-scope}.ts` | **仍无** dispatch 调用；G-R2-5 fail-closed |
| 前序 dual | `2026-09-10-g4-dispatch-recheck-prereq-mw-rag-route.md`（**范围过时面需复核**）· `2026-09-16-g-r2-5-retrieve-fail-closed-mw-rag-route.md` |

---

## 切片立场（实现方自认）

本 FOLLOW **不**把 `dispatchTrackLocalRetrieval` / recheck / per-turn planner leaf 接进生产 Worker。  
刷新诚实事实后，**仍**选择 honesty PREREQ + fail-closed（相对 full wire）：

| 阻塞 | 现状（2026-09-16） |
|------|-------------------|
| **P-PLANNER** | Worker 仍无 `InterviewPlannerOutput` → `RetrievalPlan` |
| **P-R2** | wire 已齐；**overall NOT closed** / ≠ 路由已生效（P-LIVE dual 收据齐；仍 ≠ 路由已生效） |
| **P-FAKEPLAN** | 主叶硬造 plan = 假绿 → **禁止** |
| **P-FAILCLOSED**（retrieve） | **CLOSED（G-R2-5）** — 旧「缺 snapshot 仍 unscoped」**过时** |
| **P-WT0** | wrong_track=0 未证（NHP-R4-ADV-01 gap/blocked） |

合同 seam + `g4-dispatch-recheck-prereq:prove` **仍在**；绿 = 未接线钉 ≠ 已齐。

---

## 请专家（双审通过前）**不要**要求实现方绿关复跑；审文档完备性后，若放行，再由专家复跑：

| CMD | 期望 EXIT | 读法 |
|-----|-----------|------|
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** | ≠ full wire · ≠ R4 关 |
| `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | ≠ R2/R4 关 |
| `pnpm g4-production-scoped-retrieve:prove` | **0** | partial ≠ wrong_track=0 |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | ≠ 题域已隔离 |
| `pnpm mysql-stack:m4-rag:prove` | **0** | §R4 NOT closed |

实现方本刀实测：**not_run:pre_dual_review**（见 eval §6.3）。

---

## 请专家回答

1. harness §6b 差距表是否诚实（尤其：G-R2-5 关闭旧 P-FAILCLOSED；R2 wire≠overall closed；dispatch/planner 仍无）？  
2. 是否同意 FOLLOW **仍不接线** full dispatch/recheck（P-PLANNER / P-R2 overall / P-FAKEPLAN），而非假接线？  
3. NHP-R4 NEG/FAULT/BOUND/ADV/PERF/LOAD（或 blind/gap）是否够格作 R4 诚实门，且 **未**把 NHP-R4-ADV-01 写成已关？  
4. 09-10 dual-pass 是否 **不得**自动放行本 FOLLOW prove / 不得写成 R4 已关？  
5. 是否同意：**保持 R4 NOT closed**；禁 wrong_track=0 / 题域已隔离 / full P-WIRE；`releaseEvidence=false`？

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass；实现方禁止自批  
- 不宣称生产 dispatch/recheck 已接线 · 不宣称 R4 / 题域已隔离 · 不宣称 wrong_track=0  
- 不把 G-R2-5 / R2 wire / 09-10 PREREQ dual 升格为 R4 closed  
- 不切 qbank / 向量真相 / flip default / HA / `releaseEvidence=true`  
- 硬闸生效 ≠ 本刀 prove 已授权笼统开跑  
- **await dual before prove**

---

*REQUEST · mw-rag-route · R4 dispatch-recheck FOLLOW · 2026-09-16 PT · releaseEvidence=false · ≠HA*

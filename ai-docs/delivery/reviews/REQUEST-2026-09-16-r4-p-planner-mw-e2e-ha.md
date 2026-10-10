# REQUEST — R4 **P-PLANNER**（acceptance gate · **不 coding / 不 prove**）→ mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（PT · ~05:10）  
**releaseEvidence=false** · **Not HA** · **≠ covered** · **pass ≠ R4 已关** · **≠ 题域已隔离** · **本刀 ≠ 完整 E2E** · **≠ planner 已落地** · **≠ flip default** · **≠ open DELETE**  
**硬闸**：`north-star-hard-gates.md` **已生效**（文档闸）· **≠** 非happy prove 笼统开跑 · **≠** 本 REQUEST 自带绿关 / coding 批准  
**配对**：`REQUEST-2026-09-16-r4-p-planner-mw-rag-route.md`

---

## 对照

- `harness/r4-p-planner.md` · `eval/r4-p-planner.eval.md` · `r4-p-planner.slice.md`  
- `harness/r4-domain-isolation.md` §6c / §6d · status · 父 eval  
- `non-happy-path-perf-load-case-matrix.md` §1.5（NHP-R4-* · 零 covered）  
- `e2e-requirement-coverage-matrix.md` GAP-RAG-04  
- `apps/worker/src`（**零** `dispatchTrackLocalRetrieval(`；**无** per-turn planner→retrieve）  
- 前序：`2026-09-16-r4-real-wire-mw-e2e-ha.md`（pass · 正确不接线）· NHP Batch1 `post_prove_dual_pass`（≠ covered）  
- GAP-RAG-04 · r5 sole-stack **G4**

---

## 切片立场

实现方在 REAL-WIRE dual「正确不接线」之后，交付 **P-PLANNER 验收门文档**（标准 + gap + 冻结 CMD + REQUEST），** deliberately 不 coding / 不 prove**。  

**不得**冒充：完整 E2E / covered / HA / `releaseEvidence=true` / R4 关 / 题域已隔离 / planner 已落地 / wrong_track=0 / full wire / 「已批准 Worker 实现」。

本刀：**未改** Worker；**未跑** P-PLANNER prove（`not_run:pre_dual_review`）。

---

## 双审通过前请勿强制实现方 coding / 绿关

| 项 | 本刀 |
|----|------|
| P-PLANNER prove | **not_run:pre_dual_review** |
| Worker planner / dispatch | **仍零**（保持至另 authorize） |
| sole allowlist | **不扩** |
| NHP-R4 六列 | **零 covered**（不升格） |

若专家仅批准「验收门诚实 + 本刀不 coding/prove」，实现方 **不**开始实现。

---

## 请专家回答

1. 本刀是否错误冒充完整 E2E / covered / HA / `releaseEvidence=true` / R4 已关 / planner 已生产接线？  
2. **harness 是否够格当 P-PLANNER 验收门**（文档闸；非实现刀）？  
3. 是否同意：**本刀无 coding / 无 prove**？  
4. 是否同意：**P-FAKEPLAN 禁令**仍必须？  
5. 是否同意：**R4 仍 NOT closed**；本刀 dual ≠ 关 R4？  
6. 是否同意：follow-on wire 仍须完整 plan 字段 + G-R2-5 + **wrong_track=0 单独**，接线绿 ≠ R4 关？  
7. sole allowlist 是否因本切片扩面？（期望：**否**）  
8. 硬闸「已生效」是否被误写成「非happy / P-PLANNER prove 已授权笼统开跑」？（期望：**否**）  
9. NHP-R4 / NHP Batch1 是否仍 **不得**因本刀升 covered？  
10. 是否同意：本刀 dual pass **不**自动授权 Worker coding（须 separate authorize）？

---

## 非宣称

- 本 REQUEST **不是** pass；实现方禁止自批  
- 不宣称 covered / HA / releaseEvidence=true / sole cutover / flip default / open DELETE  
- 不宣称生产 planner/dispatch 已接线 / R4 closed / 题域已隔离 / wrong_track=0  
- **await dual**；coding/prove 另授权

---

*REQUEST · mw-e2e-ha · R4 P-PLANNER · 2026-09-16 PT · releaseEvidence=false · ≠HA*

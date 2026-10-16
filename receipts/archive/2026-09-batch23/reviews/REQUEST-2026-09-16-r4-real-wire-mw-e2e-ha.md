# REQUEST — R4 / G4 **REAL-WIRE**（真接线 inventory · **不接线**）→ mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（PT · ~04:51）  
**releaseEvidence=false** · **Not HA** · **≠ covered** · **pass ≠ R4 已关** · **≠ 题域已隔离** · **本 inventory ≠ 完整 E2E** · **≠ flip default** · **≠ open DELETE**  
**硬闸**：`north-star-hard-gates.md` **已生效**（文档闸）· **≠** 非happy prove 笼统开跑 · **≠** 本 REQUEST 自带绿关 / 接线批准  
**配对**：`REQUEST-2026-09-16-r4-real-wire-mw-rag-route.md`

---

## 对照

- `harness/r4-domain-isolation.md` §6c · `r4-domain-isolation-status.md` §7 · `eval/r4-domain-isolation.eval.md` §7  
- `non-happy-path-perf-load-case-matrix.md` §1.5（NHP-R4-* · 零 covered）· `harness/non-happy-path-perf-load-matrix.md`  
- `e2e-requirement-coverage-matrix.md` GAP-RAG-04 / §1.0  
- `apps/worker/src`（**零** `dispatchTrackLocalRetrieval(`）  
- 前序：`2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-e2e-ha.md`（pass · 仅 honesty / 仍不接线）  
- GAP-RAG-04 · r5 sole-stack **G4**

---

## 切片立场

实现方在 FOLLOW post-prove dual-pass 后，交付 **R4-REAL-WIRE inventory**（intended wire + 假绿风险 + 阻塞），并因 **P-PLANNER / P-FAKEPLAN** 等 **选择不接线**。  
**不得**冒充：完整 E2E / covered / HA / `releaseEvidence=true` / R4 关 / 题域已隔离 / wrong_track=0 / full wire / 「已批准 coding」。

实现方本刀：**未改** Worker 生产路径；**未跑** REAL-WIRE prove（`not_run:pre_dual_review`）。

---

## 双审通过前请勿强制实现方 wiring / 绿关

| 项 | 本刀 |
|----|------|
| REAL-WIRE prove | **not_run:pre_dual_review** |
| Worker dispatch 调用 | **仍零**（期望保持至专家另批有条件接线） |
| sole allowlist | **不扩** |

若专家仅批准「inventory 诚实 + 继续不接线」，实现方 **不**开始 coding。

---

## 请专家回答

1. 本刀是否错误冒充完整 E2E / covered / HA / `releaseEvidence=true` / R4 已关 / 生产 dispatch 已接线？  
2. FOLLOW post-prove dual-pass 是否 **不得**自动批准本刀 coding 或 R4 关闭？  
3. sole allowlist 是否因本切片扩面？（期望：**否**）  
4. 硬闸「已生效」是否被误写成「非happy prove / REAL-WIRE prove 已授权笼统开跑」？（期望：**否**）  
5. NHP-R4 六列是否仍均为 case-only/partial/gap/blind，**零 covered**？  
6. 是否同意实现方裁定：**产品风险高 → 停在 REQUEST / await dual / 不接线**，而非假接线冲绿？

---

## 非宣称

- 本 REQUEST **不是** pass；实现方禁止自批  
- 不宣称 covered / HA / releaseEvidence=true / sole cutover / flip default / open DELETE  
- 不宣称生产 dispatch/recheck 已接线 / R4 closed / 题域已隔离 / wrong_track=0  
- **await dual before code/prove**

---

*REQUEST · mw-e2e-ha · R4-REAL-WIRE · 2026-09-16 PT · releaseEvidence=false · ≠HA*

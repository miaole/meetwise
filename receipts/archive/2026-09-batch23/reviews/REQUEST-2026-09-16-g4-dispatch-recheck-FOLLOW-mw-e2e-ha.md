# REQUEST — G4/R4 dispatch-recheck FOLLOW（honesty recheck · 不接线）→ mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · **Not HA** · **≠ covered** · **pass ≠ R4 已关** · **≠ 题域已隔离** · **本静态钉 ≠ 完整 E2E**  
**硬闸**：`north-star-hard-gates.md` **已生效**（文档闸）· **≠** 非happy prove 笼统开跑 · **≠** 本 REQUEST 自带绿关  
**配对**：`REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-mw-rag-route.md`

---

## 对照

- `harness/r4-domain-isolation.md` §6b · `r4-domain-isolation-status.md` §6 · `eval/r4-domain-isolation.eval.md` §6  
- `non-happy-path-perf-load-case-matrix.md` §1.5（NHP-R4-*）· `harness/non-happy-path-perf-load-matrix.md`  
- `e2e-requirement-coverage-matrix.md` GAP-RAG-04 / §1.0  
- `apps/worker/test/g4-dispatch-recheck-prereq.proof.ts`  
- 前序：`2026-09-10-g4-dispatch-recheck-prereq-mw-e2e-ha.md` · `2026-09-16-g-r2-5-retrieve-fail-closed-mw-e2e-ha.md`  
- GAP-RAG-04 · r5 sole-stack **G4**

---

## 切片立场

实现方 **未**接线生产 dispatch/recheck；FOLLOW 只刷新诚实盘点 + NHP 列 + REQUEST。  
**不得**冒充：完整 E2E / covered / HA / `releaseEvidence=true` / R4 关 / 题域已隔离 / wrong_track=0 / full wire。

实现方本刀 **未跑** prove 作绿关（`not_run:pre_dual_review`）。

---

## 双审通过后请专家复跑（通过前勿强制实现方绿关）

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** |
| `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** |
| `pnpm g4-production-scoped-retrieve:prove` | **0** |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |
| `pnpm conn-stack:r4-domain-isolation:prove` | **0** |

---

## 请专家回答

1. 本 FOLLOW 是否错误冒充完整 E2E / covered / HA / `releaseEvidence=true` / R4 已关？  
2. EXIT=0（若复跑）是否被文档明确标红为 **≠ 题域已隔离 / ≠ dispatch 已齐 / ≠ wrong_track=0**？  
3. sole allowlist 是否因本切片扩面？（期望：**否**）  
4. 硬闸「已生效」是否被误写成「非happy prove 已授权笼统开跑」？（期望：**否**；矩阵 prove 仍须单独双审）  
5. NHP-R4 六列是否均为 case-only/partial/gap/blind，**零 covered**？  
6. 09-10 / G-R2-5 dual-pass 是否 **不得**自动批准本 FOLLOW 绿关或 R4 关闭？

---

## 非宣称

- 本 REQUEST **不是** pass；实现方禁止自批  
- 不宣称 covered / HA / releaseEvidence=true / sole cutover / flip default  
- 不宣称生产 dispatch/recheck 已接线 / R4 closed / 题域已隔离  
- **await dual before prove**

---

*REQUEST · mw-e2e-ha · R4 dispatch-recheck FOLLOW · 2026-09-16 PT · releaseEvidence=false · ≠HA*

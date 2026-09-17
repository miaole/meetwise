# REQUEST — R4 **wrong_track=0 ADV**（对抗跨域验收门 · **不 coding / 不 prove**）→ mw-e2e-ha

**状态**：**`REQUEST-ready` / `not_run:pre_dual`**（REQUEST / 待审；实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（PT · ~19:08）  
**releaseEvidence=false** · **Not HA** · **≠ covered** · **pass ≠ R4 已关** · **≠ 题域已隔离** · **本刀 ≠ 完整 E2E** · **wire 绿 ≠ wrong_track=0** · **≠ flip default** · **≠ open DELETE**  
**硬闸**：`north-star-hard-gates.md` **已生效**（文档闸）· **≠** 非happy prove 笼统开跑 · **≠** 本 REQUEST 自带 coding / 绿关批准  
**配对**：`REQUEST-2026-09-16-r4-wrong-track-adv-mw-rag-route.md`

---

## 对照

- `harness/r4-wrong-track-adv.md` · `eval/r4-wrong-track-adv.eval.md` · `r4-wrong-track-adv.slice.md`  
- `harness/r4-domain-isolation.md` §6f · status（next=ADV await dual；REAL-WIRE-IMPL await post-prove）  
- `harness/r4-real-wire-impl.md`（wire ≠ ADV）  
- `non-happy-path-perf-load-case-matrix.md` §1.5（NHP-R4-ADV-01 **gap**/blocked；零 covered）  
- `e2e-requirement-coverage-matrix.md` GAP-RAG-04  
- `apps/worker/src`（本刀 **不改**）  
- 前序：REAL-WIRE-IMPL post-prove REQUEST 待审（≠ ADV covered）

---

## 切片立场

meetwise 在 REAL-WIRE-IMPL 实现后，授权 **打开** wrong_track=0 ADV **文档+REQUEST**。验收目标为：在已接线 retrieve 上对抗跨域，wrong_track must be 0；NEG/FAULT companions 登记不升格；CMD 冻结 not_run。

**不得**冒充：完整 E2E / covered / HA / `releaseEvidence=true` / R4 关 / 题域已隔离 / wrong_track=0 已证 / 「wire 绿已含 ADV」/ 「已批准 ADV 实现」。

本刀：**未改** Worker；**未跑** prove（`not_run:pre_dual`）。

---

## 双审通过前请勿要求实现方 coding / 绿关

| 项 | 本刀 |
|----|------|
| ADV prove | **not_run:pre_dual** |
| Worker | **零改动** |
| sole allowlist | **不扩** |
| NHP-R4 六列 | **零 covered**（ADV 仍 gap/blocked） |
| wire EXIT=0 | **≠** wrong_track=0 |

coding/prove **forbidden** until dual pass + wire post-prove + **separate authorize**。

---

## 请专家回答

1. 本刀是否错误冒充完整 E2E / covered / HA / `releaseEvidence=true` / R4 已关 / wrong_track=0 已证？  
2. harness 是否够格当 ADV 验收门（非实现刀），且明确 **wire 绿 ≠ ADV**？  
3. 是否同意：**本刀无 coding / 无 prove**？  
4. 是否同意：NEG/FAULT companions **不**因本刀升 covered？  
5. 是否同意：NHP-R4-ADV-01 仍 **gap/blocked**？  
6. 是否同意：R4 仍 NOT closed；将来 ADV 绿仍 ≠ R4 全家关？  
7. sole allowlist 是否因本切片扩面？（期望：**否**）  
8. 是否同意：G7 verification gate draft **≠** success？  
9. 是否同意：本刀 dual pass **不**自动授权 ADV coding？  
10. 是否同意：禁 flip default / open DELETE / HA？

---

## 非宣称

- 本 REQUEST **不是** pass；实现方禁止自批  
- 不宣称 covered / HA / releaseEvidence=true / sole cutover / flip default / open DELETE  
- 不宣称 wrong_track=0 已证 / R4 closed / 题域已隔离 / wire 已覆盖 ADV  
- **await dual**；coding/prove 另授权

---

*REQUEST · mw-e2e-ha · R4 wrong_track=0 ADV · 2026-09-16 PT · releaseEvidence=false · ≠HA · wire≠ADV*

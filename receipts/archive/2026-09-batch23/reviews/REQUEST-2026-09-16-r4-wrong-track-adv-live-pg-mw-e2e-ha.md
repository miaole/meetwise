# REQUEST — R4 **wrong_track=0 ADV · LIVE_PG**（关 LIVE_PG_GAP · **不 coding / 不 prove**）→ mw-e2e-ha

**状态**：**`REQUEST-ready` / `not_run:pre_dual`**（REQUEST / 待审；实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（PT · ~19:22）  
**releaseEvidence=false** · **Not HA** · **≠ covered** · **pass ≠ R4 已关** · **≠ 题域已隔离** · **本刀 ≠ 完整 E2E** · **ADV honesty ≠ LIVE_PG closed** · **≠ flip default** · **≠ open DELETE**  
**硬闸**：`north-star-hard-gates.md` **已生效**（文档闸）· **≠** 非happy prove 笼统开跑 · **≠** 本 REQUEST 自带 coding / 绿关批准  
**配对**：`REQUEST-2026-09-16-r4-wrong-track-adv-live-pg-mw-rag-route.md`

---

## 对照

- `harness/r4-wrong-track-adv-live-pg.md` · `eval/r4-wrong-track-adv-live-pg.eval.md` · `r4-wrong-track-adv-live-pg.slice.md`  
- `harness/r4-domain-isolation.md` §6g · status §11（next=LIVE_PG await dual；LIVE_PG_GAP 仍开）  
- `harness/r4-wrong-track-adv.md`（ADV honesty dual **≠** LIVE_PG）  
- `reviews/2026-09-16-r4-wrong-track-adv-post-prove-mw-{rag-route,e2e-ha}.md`（ADV post-prove **pass · honesty only**）  
- `non-happy-path-perf-load-case-matrix.md` §1.5（NHP-R4-ADV-01 **partial**；零 covered）  
- `e2e-requirement-coverage-matrix.md` GAP-RAG-04  
- `apps/worker/src`（本刀 **不改**）

---

## 切片立场

meetwise 在 ADV honesty dual 通过后，授权 **打开** LIVE_PG full-path ADV **文档+REQUEST** 以关 A3 LIVE_PG_GAP。验收目标为：在 live wired Worker+PG 路径上对抗跨域，wrong_track must be 0（非 unit-only map）；companions 不升格；CMD 冻结 not_run。

**不得**冒充：完整 E2E / covered / HA / `releaseEvidence=true` / R4 关 / 题域已隔离 / LIVE_PG_GAP 已关 / 「ADV dual 已含 LIVE_PG」/ 「已批准 LIVE_PG 实现」。

本刀：**未改** Worker；**未跑** prove（`not_run:pre_dual`）。**禁宣称 R4 closed**。

---

## 双审通过前请勿要求实现方 coding / 绿关

| 项 | 本刀 |
|----|------|
| LIVE_PG prove | **not_run:pre_dual** |
| Worker | **零改动** |
| sole allowlist | **不扩** |
| NHP-R4 六列 | **零 covered**（ADV 仍 partial） |
| ADV EXIT=0 / dual | **≠** LIVE_PG closed |

coding/prove **forbidden** until dual pass + **separate authorize**。

---

## 请专家回答

1. 本刀是否错误冒充完整 E2E / covered / HA / `releaseEvidence=true` / R4 已关 / LIVE_PG_GAP 已关？  
2. harness 是否够格当 LIVE_PG 验收门（非实现刀），且明确 **ADV honesty ≠ LIVE_PG**？  
3. 是否同意：**本刀无 coding / 无 prove**？  
4. 是否同意：companions / NHP-R4-ADV-01 **不**因本刀升 covered？  
5. 是否同意：NHP-R4-ADV-01 仍 **partial**/honesty-pin？  
6. 是否同意：R4 仍 NOT closed；禁宣称 R4 closed；将来 LIVE_PG 绿仍 ≠ R4 全家关？  
7. sole allowlist 是否因本切片扩面？（期望：**否**）  
8. 是否同意：G7 verification gate draft **≠** success？  
9. 是否同意：本刀 dual pass **不**自动授权 LIVE_PG coding？  
10. 是否同意：禁 flip default / open DELETE / HA？

---

## 非宣称

- 本 REQUEST **不是** pass；实现方禁止自批  
- 不宣称 covered / HA / releaseEvidence=true / sole cutover / flip default / open DELETE  
- 不宣称 LIVE_PG_GAP 已关 / R4 closed / 题域已隔离 / ADV dual 已覆盖 LIVE_PG  
- **await dual**；coding/prove 另授权

---

*REQUEST · mw-e2e-ha · R4 wrong_track ADV LIVE_PG · 2026-09-16 PT · releaseEvidence=false · ≠HA · ADV≠LIVE_PG · ≠R4 closed*

# REQUEST — Knife **F2** · **P-META · P-R1** remaining（pre-exec）→ mw-rag-route

**Status**: **`REQUEST-ready / not_run:pre_dual`**（实现方预写；**禁止自批 pass**；**not yet dual-sent**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-16 (~23:27 PT)（refresh after F1 `post_prove_dual_pass`）  
**releaseEvidence=false** · Not HA · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **01A ≠ 01** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Pair**: `REQUEST-2026-09-16-r4-f2-p-meta-p-r1-mw-e2e-ha.md`  
**Hard**: F1 = **`post_prove_dual_pass`**（≠ R4 closed ≠ prod fully closed · NHP covered ≠ F1 alone）· F2 coding still needs **own pre-exec dual + authorize** · **no** model-op · no self-approve · **zero coding / zero prove this prep**

---

## Contra

| File | Role |
|------|------|
| `harness/r4-f2-p-meta-p-r1.md` | **本刀** acceptance stub · M1–M6 |
| `r4-f2-p-meta-p-r1.slice.md` | Slice index |
| `eval/r4-f2-p-meta-p-r1.eval.md` | Pre-exec eval stubs |
| `harness/r4-domain-isolation.md` §2 / §6c.3 | P-META · P-R1 inventory |
| `harness/r4-domain-isolation-status.md` G-R4-3 / G-R4-5 / §13 | F1 dual-closed · F2 REQUEST-ready · PREREQ still open |
| `harness/r1-tech-role-fail-closed.md` · GAP-RAG-01 | R1 contract · **未关** |
| `m4-rag-hard-gates.md` §R1 | R1 关闭条件原文 |
| `rules/backend/qbank-control-definer-sealed-manifest.md` | RAG-FUNNEL-01A ≠ 01 |
| Sibling F1 | `harness/r4-f1-wrong-track-prod-surface.md` · **`post_prove_dual_pass`** |

---

## Stance（rag-route）

R4 inventory still lists **P-META**（RAG-FUNNEL-01）and **P-R1**（GAP-RAG-01）as **open PREREQs**. meetwise 授权 **draft** F2 REQUEST：

1. **P-META**：独立 `MetadataReviewReceipt` serving + 完整 facets + 标准部署 handoff — **01A 源码密封 ≠ 01 关闭**  
2. **P-R1**：生产不再依赖 legacy「技术岗」默认 + flag-on 组合根证据 — contract prove 绿 **≠ R1 closed**  
3. Experts = `mw-rag-route` + `mw-e2e-ha` only — harness **does not** need MODEL-OP domain → **omit** `mw-model-op`  
4. Closing P-META/P-R1 **alone ≠ R4 closed / ≠ 题域已隔离**（wrong_track / P-R2 / P-FIX 并列；F1 dual ≠ prod fully closed）  
5. Planned CMD `pnpm r4-p-meta-p-r1:prove` = **`not_run:pre_dual`** · **not implemented**  
6. **Coding gate**：MAIN + NHP-ADV + **F1 `post_prove_dual_pass`**；F2 still needs **own pre-exec dual + authorize**  
7. **禁宣称 R4 closed / 题域已隔离 / R1 closed / FUNNEL-01 closed**

This prep: **zero code · zero prove**.

---

## Please answer

1. harness M1–M6 是否诚实登记 P-META + P-R1 remaining，且 01A ≠ 01 / r1 prove ≠ R1 closed？  
2. 是否同意：**本刀无 coding / 无 prove**，仅 harness + slice + eval + REQUEST？  
3. 是否同意：**省略** `mw-model-op` REQUEST（无 MODEL-OP domain need）？  
4. 是否同意：**R4 仍 NOT closed**；P-META/P-R1 关齐仍 ≠ 题域已隔离 / ≠ R4 全家关；F1 dual ≠ prod fully closed？  
5. 是否同意：coding gate = MAIN + NHP-ADV + F1 dual done · 仍须 **F2 pre-exec dual + authorize** · 本 REQUEST dual **不**自动授权 coding？  
6. 是否同意：保持 `releaseEvidence=false`；sole 恰 5；禁 flip default / open DELETE / HA / suite green？

Please write the conclusion to `reviews/`（e.g. `2026-09-16-r4-f2-p-meta-p-r1-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass；实现方禁止自批  
- **未**跑 prove；**未**改 Worker / metadata serving / R1 flag default  
- 不宣称 R1 / FUNNEL-01 / R4 / 题域已隔离 closed  
- **await dual send**；coding/prove 另授权且受 coding gate 约束

---

*REQUEST · mw-rag-route · F2 P-META · P-R1 · 2026-09-16 ~23:27 PT · REQUEST-ready / not_run:pre_dual · F1=`post_prove_dual_pass` · releaseEvidence=false · ≠HA · ≠R4 closed · sole 恰 5 · no model-op*

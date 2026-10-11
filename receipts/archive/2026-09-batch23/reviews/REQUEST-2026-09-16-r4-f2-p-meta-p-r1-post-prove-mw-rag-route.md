# REQUEST — Knife **F2** · **P-META · P-R1** remaining **post-prove** → mw-rag-route

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-16 (~23:35 PT · post-prove)  
**releaseEvidence=false** · Not HA · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **01A ≠ 01** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Pair**: `REQUEST-2026-09-16-r4-f2-p-meta-p-r1-post-prove-mw-e2e-ha.md`  
**Hard**: pre-exec dual PASS · meetwise authorize coding+prove · EXIT=0 ≠ R1/FUNNEL-01/R4 closed · no self-approve · **Ban** forging MetadataReviewReceipt serving / claiming R1 closed  
**Prior pre-exec dual（pass）**: `2026-09-16-r4-f2-p-meta-p-r1-mw-e2e-ha.md` · `2026-09-16-r4-f2-p-meta-p-r1-mw-rag-route.md`  
**Knife**: `pnpm r4-p-meta-p-r1:prove`；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## Contra

| File | Role |
|------|------|
| `harness/r4-f2-p-meta-p-r1.md` | **本刀**（`executed:awaiting_post_prove_dual`） |
| `eval/r4-f2-p-meta-p-r1.eval.md` | Eval + CMD+EXIT |
| `r4-f2-p-meta-p-r1.slice.md` | Slice |
| `harness/r4-domain-isolation.md` §2 / §6c.3 | P-META · P-R1 inventory **仍开** |
| `harness/r4-domain-isolation-status.md` G-R4-3 / G-R4-5 / §13 | F2 awaiting post-prove · PREREQ still open |
| `apps/worker/src/r4-p-meta-p-r1-remaining.ts` | classifyPMetaRemaining / classifyPR1Remaining |
| `apps/worker/test/r4-p-meta-p-r1.proof.ts` | Prove body |
| `harness/r1-tech-role-fail-closed.md` · GAP-RAG-01 | R1 contract · **未关** |
| `m4-rag-hard-gates.md` §R1 | R1 关闭条件原文 |
| `rules/backend/qbank-control-definer-sealed-manifest.md` | RAG-FUNNEL-01A ≠ 01 |
| `packages/db/src/principal.ts` | `qbank_metadata_review_receipt` 01A table |

---

## Stance（rag-route）

F2 = **honesty remaining-gap** for inventory P-META + P-R1（**not** closing them）:

1. **P-META / MR1**：01A source seal present；`routedServingWired` / `fullFacetsServed` / `standardDeployHandoff` **false**；worker src **no** MetadataReviewReceipt serving consumer；**01A ≠ 01**；**≠ FUNNEL-01 closed**  
2. **P-R1 / PR1**：empty-env fail-closed flag **OFF**（**no flip default**）；legacy「技术岗」still on；spawn `r1-tech-role-fail-closed:prove` **旁证 ≠ R1 closed**  
3. Experts = rag-route + e2e-ha only — **omit** `mw-model-op`  
4. **G-R4-3 / G-R4-5 still open** after EXIT=0；closing narrative alone ≠ R4 / 题域已隔离  
5. **G-R2-5 / P-FAKEPLAN retained**（本刀不碰）；禁假造 MetadataReviewReceipt / 假关 R1  

**EXIT=0 ≠ R1 closed ≠ RAG-FUNNEL-01 closed ≠ R4 closed ≠ 题域已隔离**.

---

## Post-prove CMD+EXIT（实现方）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm r4-p-meta-p-r1:prove`** | **0** | MR1/PR1/H3 honesty；await dual |
| spawned **`pnpm r1-tech-role-fail-closed:prove`** | **0** | ≠ R1 closed |
| `:prove:raw` | **n/a** | harness does not require :raw |

**Key**：unset（未 invent）。**未跑** Live Key×3。

---

## Please answer

1. 请 **独立复跑** `pnpm r4-p-meta-p-r1:prove`，附 CMD+EXIT。  
2. MR1：01A ≠ 01 · FUNNEL-01 still open · no forged MetadataReviewReceipt serving — 同意？  
3. PR1：default flag OFF · r1 prove ≠ R1 closed · no flip default — 同意？  
4. EXIT=0 是否仍钉 **≠ R4 closed / ≠ 题域已隔离 / ≠ HA / ≠ suite green**？  
5. G-R4-3 / G-R4-5 / P-META / P-R1 是否仍登记为 **open**？  
6. sole 恰 5 · `releaseEvidence=false` · omit model-op 仍正确？  
7. harness/eval/status 是否错误把本绿写成 R1/FUNNEL-01/R4 已关？（期望：**否**）

Please write the conclusion to `reviews/`（e.g. `2026-09-16-r4-f2-p-meta-p-r1-post-prove-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- **未**关 R1 / FUNNEL-01 / R4 / 题域已隔离  
- **未** flip default · **未** open DELETE · **未**扩 sole allowlist  
- **await post-prove dual**

---

*REQUEST · mw-rag-route · F2 P-META·P-R1 post-prove · 2026-09-16 ~23:35 PT · prove EXIT=0 · releaseEvidence=false · ≠HA · ≠R4 closed · awaiting dual*

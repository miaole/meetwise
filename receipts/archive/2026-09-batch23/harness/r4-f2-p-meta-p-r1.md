# Harness — Knife **F2** · **P-META · P-R1** remaining（**`post_prove_dual_pass`**）

**Status**: **`post_prove_dual_pass`**  
**Date**: 2026-09-16 (~23:40 PT)  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual **PASS** · post-prove dual **PASS** · expert re-run prove EXIT=0 · spawned r1 EXIT=0 ≠ R1 closed）  
**Parent**: `harness/r4-domain-isolation.md` §2 / §6c.3 · `r4-domain-isolation-status.md` §13 · G-R4-3 / G-R4-5  
**Slice**: `../r4-f2-p-meta-p-r1.slice.md`  
**Eval**: `../eval/r4-f2-p-meta-p-r1.eval.md`  
**Authority**: meetwise — F2 pre-exec dual PASS + coding+prove + **post-prove dual PASS** → harness **`post_prove_dual_pass`** · **EXIT=0 ≠ R1/FUNNEL-01/R4 closed ≠ 题域已隔离 ≠ HA ≠ suite green** · **01A ≠ 01** · **sole 恰 5** · **releaseEvidence=false** · **P-META/P-R1 product gaps STILL OPEN** · **no self-approve**

---

## 0. Stance（先读）

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Combined **honesty / remaining-gap** prove for **P-META**（RAG-FUNNEL-01 / `MetadataReviewReceipt` serving）+ **P-R1**（GAP-RAG-01 / legacy「技术岗」）per R4 inventory |
| **What this knife is not** | Not R4 close · not 题域已隔离 · not R1 closed · not RAG-FUNNEL-01 closed · not F1 wrong_track prod-surface · not MAIN sole∩scor · **not** flip default · **not** product close of P-META/P-R1 |
| **Inventory source** | `r4-domain-isolation.md` §2 PREREQ · §6c.3 · status G-R4-3 / G-R4-5 · `m4-rag-hard-gates` §R1 · GAP-RAG-01 · RAG-FUNNEL-01 vs **01A** |
| **01A ≠ 01** | Source sealed manifest / handoff-closure local prove **≠** independent `MetadataReviewReceipt` serving + full facets + standard deploy handoff |
| **R1 contract prove** | `pnpm r1-tech-role-fail-closed:prove` green **≠** R1 closed（default flag-off legacy still on） |
| **MODEL-OP?** | **Not required** for this harness domain → **no** `mw-model-op` REQUEST |
| **Prior F1** | F1 = **`post_prove_dual_pass`** · **≠** R4 closed · **≠** production wrong_track=0 fully closed · **NHP covered ≠ F1 alone** |
| **Now** | Coding+prove **executed** · post-prove dual **PASS** · status **`post_prove_dual_pass`** · `releaseEvidence=false` · **P-META/P-R1 product gaps STILL OPEN** · next follow = **F4 P-R1 fail-closed remaining**（F3=`post_prove_dual_pass` · G-R4-5 STILL OPEN） |

---

## 1. Scope（inventory remaining · implemented honesty）

| ID | PREREQ | Implemented this knife | Close R4 alone? |
|----|--------|------------------------|-----------------|
| **P-META** | RAG-FUNNEL-01：独立 `MetadataReviewReceipt` serving + 完整 facets + 标准部署 handoff | **MR1** honesty classifiers + static: 01A sealed · routedServing/facets/deploy **still false** · worker **no** receipt serving consumer | **否**（PREREQ only · **STILL OPEN**） |
| **P-R1** | R1：生产不再依赖 legacy「技术岗」默认，且 flag-on 有组合根证据 | **PR1** honesty: default flag **OFF**（no flip）· legacy still on · spawn `r1-tech-role-fail-closed:prove` 旁证 | **否**（PREREQ only · **STILL OPEN**） |

**Out of scope this knife**: P-R2 overall / P-LIVE verbal 生效 · F1 production-surface wrong_track · sole allowlist flip · cloud Key invent · flip `MEETWISE_TECH_ROLE_FAIL_CLOSED` default · forge MetadataReviewReceipt serving · **product close** of FUNNEL-01 / R1.

---

## 2. Acceptance（M1–M6 · met for honesty dual）

| ID | Criterion | Now |
|----|-----------|-----|
| **M1** | Harness names P-META + P-R1 remaining from inventory | **met** |
| **M2** | Hard pins: ≠ R4 closed · ≠ 题域已隔离 · `releaseEvidence=false` · ≠ HA · 01A ≠ 01 · r1 prove ≠ R1 closed · sole 恰 5 | **met** |
| **M3** | Experts = e2e-ha + rag-route only（no model-op） | **met** |
| **M4** | Prove CMD frozen · executed · EXIT=0 · expert re-run EXIT=0 | **met** |
| **M5** | Coding gate + F1-may-precede-F2 · F1 dual-closed · F2 pre-exec dual + authorize | **satisfied** |
| **M6** | Dual REQUEST pair · no self-approve · **post-prove dual PASS** | **met** → **`post_prove_dual_pass`** |

### CMD

| CMD | Role | Status |
|-----|------|--------|
| **`pnpm r4-p-meta-p-r1:prove`** | Combined honesty / remaining-gap prove for P-META∩P-R1（MR1/PR1/H3） | **EXIT=0**（implementer ~23:35 PT · expert re-run ~23:38 PT） |
| `pnpm r1-tech-role-fail-closed:prove` | Existing R1 contract旁证（spawned） | **EXIT=0** · **≠ R1 closed** · **≠ this knife alone** |
| `pnpm qbank-handoff-closure:prove` | 01A local旁证（not re-run this knife；static 01A pins） | **≠ RAG-FUNNEL-01 closed** |

**Note**: harness does **not** require `:prove:raw` / isolated PG（honesty + r1 contract；no PG）.

---

## 3. Dual targets

| Stage | Expert | Path | Status |
|-------|--------|------|--------|
| pre-exec | `mw-e2e-ha` | `reviews/2026-09-16-r4-f2-p-meta-p-r1-mw-e2e-ha.md` | **pass** |
| pre-exec | `mw-rag-route` | `reviews/2026-09-16-r4-f2-p-meta-p-r1-mw-rag-route.md` | **pass** |
| model-op | — | — | **omitted**（no MODEL-OP domain need） |
| post-prove | `mw-e2e-ha` | `reviews/2026-09-16-r4-f2-p-meta-p-r1-post-prove-mw-e2e-ha.md` | **pass** · prove=0 · r1 spawn=0 ≠ R1 closed |
| post-prove | `mw-rag-route` | `reviews/2026-09-16-r4-f2-p-meta-p-r1-post-prove-mw-rag-route.md` | **pass** · prove=0 · r1 spawn=0 ≠ R1 closed |

---

## 4. Hard pins

- **≠ R4 closed** · **≠ 题域已隔离**  
- **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed**（01A ≠ 01）  
- **EXIT=0 ≠ R1 closed ≠ FUNNEL-01 closed ≠ R4 closed ≠ 题域已隔离 ≠ HA ≠ suite green**  
- **P-META / P-R1 product gaps STILL OPEN**（G-R4-3 / G-R4-5 still open）  
- **≠ HA** · `releaseEvidence=false` · no self-approve  
- **MAIN sole∩scor-00 `post_prove_dual_pass`（done）** · **NHP-ADV covered（done）** · **F1 `post_prove_dual_pass`（done）**  
- sole allowlist **恰 5 未翻** · ≠ R5 retired ≠ sole cutover ≠ G1 flip · no flip default · no open DELETE  
- no `mw-model-op` REQUEST unless a future revision proves MODEL-OP domain need  
- **next** = **F3 `post_prove_dual_pass`**（done · serving gaps STILL OPEN）· **F4 P-R1 fail-closed remaining**（docs `REQUEST-ready / not_run:pre_dual`）· **≠** R1/R4 closed

---

## 5. Code anchors

| Path | Role |
|------|------|
| `apps/worker/src/r4-p-meta-p-r1-remaining.ts` | **this knife** MR1/PR1 honesty classifiers |
| `apps/worker/src/adaptive-role-resolve.ts` | R1 flag + legacy / fail-closed（no default flip） |
| `apps/worker/test/r4-p-meta-p-r1.proof.ts` | **this knife prove** |
| `packages/db/src/principal.ts` | 01A `qbank_metadata_review_receipt` manifest |
| `ai-docs/rules/backend/qbank-control-definer-sealed-manifest.md` | 01A ≠ 01 pin |

---

*Harness · F2 P-META · P-R1 · 2026-09-16 ~23:40 PT · post_prove_dual_pass · prove EXIT=0 · r1 spawn ≠ R1 closed · releaseEvidence=false · ≠HA · ≠ R4 closed · ≠ R1/FUNNEL-01 closed · P-META/P-R1 gaps STILL OPEN · sole 恰 5 · no model-op*

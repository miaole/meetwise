# Harness — **R1 close** · R1 gate close-path REQUEST prep（docs checklist）

**Status**: **`REQUEST-ready / not_run:pre_dual`**  
**Date**: 2026-09-17 (~19:30 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ R1 closed** · **≠ R2 closed** · **≠ R4 / FUNNEL dual-closed** · **≠ flip default** · **≠ coding authorized** · **Ban false green** · **Dual PASS ≠ coding**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（**not yet dual-sent** · **Ban self-approve** · **Dual PASS ≠ authorize coding** · **zero coding / zero prove**）  
**Slice**: `../r1-close-authorize-receipt.slice.md`  
**Eval**: `../eval/r1-close-authorize-receipt.eval.md`  
**Authority**: meetwise — docs-only **R1 close-path checklist** pointing at existing R1 harness · Ban claiming R1 closed · PG+pgvector+PostgresSaver retained  
**Honesty**: **G-R4-3 / P-R1 STILL OPEN** · F4 `post_prove_dual_pass` ≠ R1 closed · `pnpm r1-tech-role-fail-closed:prove` EXIT=0 ≠ R1 closed

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Docs-only REQUEST prep: inventory existing R1 gate artifacts + draft a **separate close-path authorize checklist** for a *future* R1 close decision · point `harness/r1-tech-role-fail-closed.md` + F4 honesty |
| **What this knife is not** | **Not** coding · **not** prove · **not** flipping fail-closed default · **not** claiming R1 closed · **not** R2/R4/FUNNEL close · **not** HA/suite · **not** false green |
| **R1 closed after Dual PASS here?** | **NO** — Dual PASS ≠ authorize coding · **Ban** claiming R1 closed from this knife |
| **Now** | **`REQUEST-ready / not_run:pre_dual`** · docs-only · zero coding · Ban self-approve |

---

## 1. Existing R1 pointers（no rewrite · no new prove）

| Path | Role | Honest status |
|------|------|---------------|
| `harness/r1-tech-role-fail-closed.md` | Canonical R1 prove contract (E1–E9) | **pass ≠ R1 已关** · flag default off · legacy 技术岗 still present |
| `eval/r1-tech-role-fail-closed.eval.md` | Existing R1 eval | prove contract only |
| `pnpm r1-tech-role-fail-closed:prove` | Existing prove | EXIT=0 = contract green · **≠ R1 closed** |
| `harness/r4-f4-p-r1-fail-closed.md` | F4 P-R1 remaining honesty | **`post_prove_dual_pass`** · PR1-A true · **PR1-B/C false** · **G-R4-3 STILL OPEN** |
| `harness/r4-domain-isolation-status.md` §2 G-R4-3 · §13 F4 | R4 parent status | R1 PREREQ **未关** · blocks R4 close |
| `m4-rag-hard-gates.md` §R1 · GAP-RAG-01 | Hard-gate SSOT | R1 close needs production no-legacy-default **and** route honesty evidence |
| `w4-r2-close-authorize-receipt` | Prior order pin | R2-auth → **R1** → R4/FUNNEL |
| GAP-RAG-01 | Backlog | R1 still open |

### Close-path honesty (what “R1 closed” would require · **not claimed**)

| # | Future close condition (draft) | This knife |
|---|-------------------------------|------------|
| C1 | Existing R1 prove contract still EXIT=0 (E1–E9) | point only · **not re-run as close** |
| C2 | Production fail-closed evidence path named (PR1-B) · Ban forge | **still open** · F4 honesty |
| C3 | Default-on / no silent legacy 技术岗 (PR1-C) · Ban flip without authorize | **still open** · Ban flip here |
| C4 | R2 close-auth / route honesty order respected (W4) | inventory · R2 still NOT closed |
| C5 | Explicit ≠ R4/FUNNEL/HA/suite from R1 alone | pinned |
| C6 | Separate authorize + dual before any “R1 closed” SSOT flip | **this checklist drafts only** · not executed |

---

## 2. Separate authorize checklist（draft · not executed）

| # | Authorize item | Must be true before any "R1 closed" claim | This knife |
|---|----------------|-------------------------------------------|------------|
| A1 | Cite existing R1 harness + eval + prove CMD | yes | pointed |
| A2 | Cite F4 dual: PR1-A true · PR1-B/C false · G-R4-3 STILL OPEN | yes | pointed |
| A3 | Explicit Ban: prove EXIT=0 ≠ R1 closed · Ban false green | yes | pinned |
| A4 | Ban flip `MEETWISE_TECH_ROLE_FAIL_CLOSED` default without authorize | yes | pinned |
| A5 | Order: R2-auth → R1 → R4/FUNNEL | yes | pinned |
| A6 | `releaseEvidence=false` · ≠HA · ≠suite · Dual PASS ≠ coding · Ban self-approve | yes | pinned |
| A7 | **No** coding / prove as fake close this prep | yes | docs only |

**Ban**: implementer must **not** write R1 pass-close · must **not** flip default · must **not** claim R1 closed · must **not** treat Dual PASS as coding authorize.

---

## 3. Pins (must survive dual)

1. **R1 NOT closed** · Ban claiming R1 closed from this REQUEST / Dual PASS  
2. **Ban false green** · prove EXIT=0 / F4 dual / knife dual ≠ R1 closed ≠ HA ≠ suite  
3. Point existing `r1-tech-role-fail-closed` harness · Ban inventing close prove this prep  
4. G-R4-3 STILL OPEN · PR1-B/C false · Ban flip default without authorize  
5. Dual PASS ≠ authorize coding · Ban self-approve · zero coding · zero prove  
6. `releaseEvidence=false` · ≠HA · ≠suite · PG retained · MySQL/Qdrant STOPPED  
7. Ban secrets / `.env*`

---

## 4. CMD

| CMD | Status |
|-----|--------|
| docs dual only | **`not_run:pre_dual`** · **no prove script this knife** · zero coding |
| Prior (reference only · not re-run as close) | `pnpm r1-tech-role-fail-closed:prove` · `pnpm r4-p-r1-fail-closed:prove` — **Ban** treating prior EXIT as R1 closed |

---

## 5. Non-claims

Not R1 closed · not flip authorized · not coding · not HA · not suite · Dual PASS ≠ authorize coding · Ban false green · Ban self-approve · `releaseEvidence=false`

---

*Harness · R1 close authorize receipt · 2026-09-17 (~19:30 PT) · REQUEST-ready / not_run:pre_dual · R1 NOT closed · Ban false green · releaseEvidence=false · ≠HA · Dual PASS ≠ authorize coding · zero coding · Ban self-approve*

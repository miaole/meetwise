# Eval — **W5** · MODEL-OP dual reconciler + wakeup honesty（**`REQUEST-ready / not_run:pre_dual`**）

**Date**: 2026-09-17 (~01:25 PT)  
**run-status**: **`REQUEST-ready / not_run:pre_dual`** · **zero coding · zero prove** · await pre-exec dual · **Dual PASS ≠ authorize coding**  
**releaseEvidence=false** · **Not HA** · **≠suite green** · **≠ SLO green** · **≠ reconciler/wakeup cutover**  
**Harness**: `ai-docs/delivery/harness/w5-model-op-dual-reconciler-wakeup.md`  
**Slice**: `ai-docs/delivery/w5-model-op-dual-reconciler-wakeup.slice.md`  
**Dual**: pre-exec REQUEST **drafted** · **not yet dual-sent** · no self-approve

---

## 1. Purpose

Expert **pre-exec** checklist for W5 docs-only dual-reconciler + wakeup honesty.  
**Ban**: forge SLO green · claiming reconciler/wakeup cutover · removing PG LISTEN without authorize · treating Dual PASS as coding authorize · inventing prove EXIT · self-approve.

---

## 2. Execution record

| CMD / action | Expected | Actual | Read |
|--------------|----------|--------|------|
| Dual reconciler honesty | present | **present** (harness §1) | 同列 · ≠ cutover |
| Prod PG LISTEN/NOTIFY provisional | pinned | **pinned** | keep |
| Redis wake deferred | pinned | **pinned** | not cutover |
| Ban forge SLO | pinned | **pinned** | ≠HA/suite |
| Coding / prove | none | **none** | `not_run:pre_dual` |
| Pre-exec dual | await | **REQUEST drafted · await** | Ban self-approve |

---

## 3. Eval cases

| ID | Eval point | Pass means |
|----|------------|------------|
| E1 | Agree dual reconciler (invocation + usage-calibration) 同列 · docs/prove ≠ 已接/已切 | docs agree |
| E2 | Agree prod wakeup stays PG LISTEN/NOTIFY **provisional** · Ban delete without authorize | pin |
| E3 | Agree Redis wake deferred · separately evaluable · ≠ cutover authorized | pin |
| E4 | Agree Ban forge SLO / capacity / latency green from this knife or prototype prove | pin |
| E5 | Agree PG+pgvector+PostgresSaver retained · Ban MySQL/Qdrant reopen via wakeup story | pin |
| E6 | Agree REQUEST pair e2e-ha+rag-route · `mw-model-op` optional later | note |
| E7 | Agree `releaseEvidence=false` · Dual PASS ≠ authorize coding · zero coding · Ban self-approve · ≠HA/suite | hard pins |

---

## 4. Fake-green checklist（pre-exec · for experts）

- [ ] Did not claim reconciler已接/已切 / queue migrated  
- [ ] Did not claim Redis wake production cutover  
- [ ] Did not forge SLO / HA / suite / `releaseEvidence=true`  
- [ ] Did not authorize removing PG LISTEN from Dual PASS  
- [ ] Did not invent prove EXIT / self-approve  
- [ ] Did not reopen MySQL/Qdrant cutover  

---

## 5. Non-claims

Not pass · not cutover · not SLO · not coding · not HA · not suite · Dual PASS ≠ authorize coding

---

*Eval · W5 MODEL-OP dual reconciler + wakeup · 2026-09-17 (~01:25 PT) · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠suite · Ban forge SLO · zero coding*

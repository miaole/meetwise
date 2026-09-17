# Eval — **PG-retained** · Postgres (+pgvector + PostgresSaver)（**`REQUEST-ready / not_run:pre_dual`**）

**Date**: 2026-09-17 (~01:15 PT)  
**run-status**: **`REQUEST-ready / not_run:pre_dual`** · **zero coding · zero prove** · await pre-exec dual · **Dual PASS ≠ authorize coding**  
**releaseEvidence=false** · **Not HA** · **≠suite green** · **≠ MySQL sole relational** · **≠ Qdrant sole vector** · **≠ cutover**  
**Harness**: `ai-docs/delivery/harness/pg-retained-checkpoint-postgres-saver.md`  
**Slice**: `ai-docs/delivery/pg-retained-checkpoint-postgres-saver.slice.md`  
**Dual**: pre-exec REQUEST **drafted** · **not yet dual-sent** · no self-approve

---

## 1. Purpose

Expert **pre-exec** checklist for the PG-retained direction pin (docs only).  
**Ban**: treating Dual PASS as coding authorize · claiming HA/suite green · reopening MySQL/Qdrant cutover · touching F8 · inventing prove EXIT.

---

## 2. Execution record

| CMD / action | Expected | Actual | Read |
|--------------|----------|--------|------|
| MySQL/Qdrant cutover knives STOPPED | pinned | **pinned** (see harness §3) | history kept |
| ADR postgres retained | drafted | **drafted** | `adr-postgres-retained.md` |
| ADR mysql relational+vector | superseded note | **additive note** | no false history |
| Resource sizing section | present | **present** in harness §2 | honest ranges · ≠HA |
| F8 artifacts | untouched | **untouched** | MS3 still REQUEST-ready |
| Coding / prove | none | **none** | `not_run:pre_dual` |
| Pre-exec dual | await | **REQUEST drafted · await** | Ban self-approve |

---

## 3. Eval cases

| ID | Eval point | Pass means |
|----|------------|------------|
| E1 | Agree Postgres retained for business DB + RLS + 0043 | docs agree · no MySQL sole claim |
| E2 | Agree PostgresSaver / checkpoint stays on Postgres | docs agree |
| E3 | Agree pgvector retained · Qdrant not required sole vector | docs agree · STOPPED knives listed |
| E4 | Agree ADR mysql relational+vector superseded · successor ADR ok | additive honesty |
| E5 | Agree Redis wake still separately evaluable · not canceled | orthogonal pin |
| E6 | Agree resource sizing is planning envelope only · ≠HA/suite | harness §2 |
| E7 | Agree `releaseEvidence=false` · Dual PASS ≠ authorize coding · zero coding · F8 untouched | hard pins |

---

## 4. Fake-green checklist（pre-exec · for experts）

- [ ] Did not claim HA / suite green / releaseEvidence from this knife  
- [ ] Did not authorize MySQL or Qdrant cutover coding from Dual PASS  
- [ ] Did not treat branch `feat/mysql-schema-skeleton` as MySQL justification  
- [ ] Did not stop F8 / commerce / egress / R4 meta  
- [ ] Did not cancel Redis wake eval  
- [ ] Did not delete historical MySQL/Qdrant docs (STOPPED pins only)  
- [ ] Did not invent prove EXIT / self-approve  

---

## 5. Non-claims

Not pass · not coding · not HA · not suite · not cutover · Dual PASS ≠ authorize coding

---

*Eval · PG-retained · 2026-09-17 (~01:15 PT) · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠suite · zero coding*

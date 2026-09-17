# Eval — **PG-retained** · Postgres (+pgvector + PostgresSaver)（**`post_prove_dual_pass`**）

**Date**: 2026-09-17 (~01:31 PT)  
**run-status**: **`post_prove_dual_pass`** · **zero coding · zero prove** · pre-exec dual **PASS** · **Dual PASS ≠ authorize coding**  
**releaseEvidence=false** · **Not HA** · **≠suite green** · **≠ MySQL sole relational** · **≠ Qdrant sole vector** · **≠ cutover** · **≠ coding authorized**  
**Harness**: `ai-docs/delivery/harness/pg-retained-checkpoint-postgres-saver.md`  
**Slice**: `ai-docs/delivery/pg-retained-checkpoint-postgres-saver.slice.md`  
**Dual**: `reviews/2026-09-17-pg-retained-checkpoint-postgres-saver-mw-e2e-ha.md` + `…-mw-rag-route.md` → **pass** · dual SHA **`0c95883`** · no self-approve  
**Honesty**: Dual was on **`0c95883`**; any later provisional wake wording (e.g. tip `32d0724`) is **overlay after dual**, not a user hard pin, and does **not** require wake-patch re-dual. Redis still orthogonal/not STOPPED.

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
| Coding / prove | none | **none** | docs-only close |
| Pre-exec dual | PASS both domains | **`post_prove_dual_pass`** · receipts archived · dual SHA `0c95883` | Ban self-approve · Dual PASS ≠ coding |

---

## 3. Eval cases

| ID | Eval point | Pass means |
|----|------------|------------|
| E1 | Agree Postgres retained for business DB + RLS + 0043 | docs agree · no MySQL sole claim |
| E2 | Agree PostgresSaver / checkpoint stays on Postgres | docs agree |
| E3 | Agree pgvector retained · Qdrant not required sole vector | docs agree · STOPPED knives listed |
| E4 | Agree ADR mysql relational+vector superseded · successor ADR ok | additive honesty |
| E5 | Record provisional production wake preference = Postgres LISTEN/NOTIFY; Redis wake evaluation deferred pending a user hard sentence | coordinator suggestion only · not a user hard pin · Redis not STOPPED |
| E6 | Agree resource sizing is planning envelope only · ≠HA/suite | harness §2 |
| E7 | Agree `releaseEvidence=false` · Dual PASS ≠ authorize coding · zero coding · F8 untouched | hard pins |

---

## 4. Fake-green checklist（pre-exec · for experts）

- [ ] Did not claim HA / suite green / releaseEvidence from this knife  
- [ ] Did not authorize MySQL or Qdrant cutover coding from Dual PASS  
- [ ] Did not treat branch `feat/mysql-schema-skeleton` as MySQL justification  
- [ ] Did not stop F8 / commerce / egress / R4 meta  
- [ ] Did not cancel or STOP Redis wake eval; recorded only the provisional Postgres LISTEN/NOTIFY preference pending a user hard sentence
- [ ] Did not delete historical MySQL/Qdrant docs (STOPPED pins only)  
- [ ] Did not invent prove EXIT / self-approve  

---

## 5. Non-claims

Docs close **`post_prove_dual_pass` only** · not coding · not HA · not suite · not cutover · Dual PASS ≠ authorize coding · `releaseEvidence=false`

---

*Eval · PG-retained · 2026-09-17 (~01:31 PT) · post_prove_dual_pass · dual on 0c95883 · wake provisional overlay after dual · releaseEvidence=false · ≠HA · ≠suite · zero coding*

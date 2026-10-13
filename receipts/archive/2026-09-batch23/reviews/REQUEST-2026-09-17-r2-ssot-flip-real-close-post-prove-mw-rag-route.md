# REQUEST — **R2 real close / SSOT flip** **post-prove** → mw-rag-route

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-17 (~19:42 PT · post-prove)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **R2 structural CLOSED** · **R2 NOT closed** as HA/suite/verbal/controlPlane/R4/FUNNEL · **≠ verbal route-effective** · Ban false close 题域/FUNNEL/R4 · sole **恰 5** · PG/pgvector retained  
**Pair**: `REQUEST-2026-09-17-r2-ssot-flip-real-close-post-prove-mw-e2e-ha.md`  
**Hard**: standing authorize after dual on `c3092c1` · prove EXIT=0 ≠ verbal 生效 ≠ retrieve quality green · Ban self-approve · Ban elevating to route-effective · **≠ W4** · Ban secrets · No force  
**Knife**: `harness/r2-ssot-flip-real-close.md` · **`executed:awaiting_post_prove_dual`** · **实现方不写** pass

---

## Contra

| File | Role |
|------|------|
| `harness/r2-ssot-flip-real-close.md` | Knife · awaiting_post_prove_dual |
| `receipts/2026-09-17-r2-ssot-flip-real-close-prove.md` | CMD+EXIT |
| `harness/r2-classify-job-route-status.md` · `m4-rag-hard-gates.md` §R2 · GAP-RAG-02 | flipped SSOT |
| Pre-exec dual | `2026-09-17-r2-ssot-flip-real-close-mw-rag-route.md` **pass** on `c3092c1` |

---

## Stance（rag-route）

1. SSOT flip authorized+executed · `await_authorize` retired.  
2. **R2 structural CLOSED** · **≠ verbal 路由已生效** · **题域正交** · Ban false close R2-as-HA / 题域 / FUNNEL / R4.  
3. Prove EXIT=0 ≠ RAG quality green ≠ retrieve green ≠ cutover.  
4. PG+pgvector retained · Qdrant cutover STOPPED · sole 恰5 不扩.  
5. Await post-prove dual · Ban implementer self-write `post_prove_dual_pass`.

本 REQUEST **不是** pass。

---

## Post-prove CMD+EXIT（实现方）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| `pnpm r2-p-live-route-effective:prove` | **0** | structural · ≠ verbal 生效 |
| `pnpm r2-classify-job-route-prereq:prove` | **0** | R2 NOT closed as HA/suite/verbal/controlPlane/R4/FUNNEL |
| `pnpm r2-p-fake-route-classify:prove` | **0** | ≠ verbal 生效 |
| `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | ≠ R4 |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** | ≠ R4 closed |
| `pnpm mysql-stack:m4-rag:prove` | **0** | §R2 doc gate |

---

## Please answer

1. 请抽查/复跑至少 live + prereq proves，附 CMD+EXIT。  
2. GAP-RAG-02 / m4 §R2 / status 是否诚实（structural CLOSED · 仍钉 ≠ verbal / ≠ R4/FUNNEL/题域）？  
3. 是否同意 Ban elevating to route-effective · Ban false close 题域/FUNNEL/R4？  
4. 是否同意 `executed:awaiting_post_prove_dual`（未自写 post_prove_dual_pass）？  
5. PG/pgvector retained · sole 恰5 · no secrets？（期望：**是/否** 对齐）

Please write the conclusion to `reviews/`（e.g. `2026-09-17-r2-ssot-flip-real-close-post-prove-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- 不宣称 verbal 生效 / RAG quality green / R4/FUNNEL/题域 closed / HA / suite  
- **await post-prove dual**

---

*REQUEST · mw-rag-route · R2 SSOT flip post-prove · 2026-09-17 ~19:42 PT · prove EXIT=0 · releaseEvidence=false · ≠HA · ≠suite · awaiting dual*

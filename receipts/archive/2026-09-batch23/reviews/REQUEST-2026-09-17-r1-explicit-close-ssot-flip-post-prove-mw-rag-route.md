# REQUEST — **R1 explicit close / SSOT flip** **post-prove** → mw-rag-route

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-17 (~20:05 PT · post-prove)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ route-effective** · **R1 STILL OPEN** · **G-R4-3 STILL OPEN** · **≠ R1 closed** · **≠ flip default** · **SSOT NOT flipped** · Ban 假关 · Ban false green · 题域正交  
**Pair**: `REQUEST-2026-09-17-r1-explicit-close-ssot-flip-post-prove-mw-e2e-ha.md`  
**Hard**: standing authorize after pre-exec dual on REQUEST **`ae8d640`** · prove EXIT=0 ≠ R1 closed ≠ G-R4-3 closed ≠ GAP-RAG-01 closed · Ban self-approve · Ban secrets · PG+pgvector retained · **≠ prove dual_pass knife** `0deb5fb`/`30d93dc` · **≠ docs knife** `f9119fe`/`2316bbc`  
**Knife**: `harness/r1-explicit-close-ssot-flip.md` · status **`executed:awaiting_post_prove_dual`** · **实现方不写** pass review · **Ban self-write `post_prove_dual_pass`**

---

## Contra

| File | Role |
|------|------|
| `harness/r1-explicit-close-ssot-flip.md` | Knife harness · `executed:awaiting_post_prove_dual` |
| `receipts/2026-09-17-r1-explicit-close-ssot-flip-prove.md` | CMD+EXIT table |
| `m4-rag-hard-gates.md` §R1 · GAP-RAG-01 | Product / backlog honesty · **NOT flipped** |
| `harness/r1-real-close-ssot-flip.md` | Prove dual_pass prior · ≠ this · `0deb5fb`/`30d93dc` |
| `harness/r4-f4-p-r1-fail-closed.md` | F4 · G-R4-3 STILL OPEN · PR1-B/C false |
| Pre-exec dual | `2026-09-17-r1-explicit-close-ssot-flip-mw-rag-route.md` **pass** on `ae8d640` |

---

## Stance（RAG-route）

1. Standing authorize coding+prove after pre-exec dual on `ae8d640`.  
2. Prove EXIT **3×0** · GAP-RAG-01 / m4 §R1 **仍开** · **≠** route-effective · **≠** R1 product closed.  
3. **SSOT targets NOT flipped** · L5 waits post-prove dual + explicit close authorize.  
4. **R1 STILL OPEN** · **G-R4-3 STILL OPEN** · Ban 假关 · Ban flip default · Ban wash prove dual_pass · PG+pgvector retained.  
5. Knife remains **`executed:awaiting_post_prove_dual`** until experts write pass — **Ban** implementer self-write `post_prove_dual_pass`.

本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| `pnpm r1-tech-role-fail-closed:prove` | **0** | ≠ R1 closed · ≠ GAP-RAG-01 closed |
| `pnpm r4-p-r1-fail-closed:prove` | **0** | PR1-B/C false · G-R4-3 STILL OPEN |
| `pnpm mysql-stack:m4-rag:prove` | **0** | §R1 doc gate ≠ product close · ≠ route-effective |

---

## Please answer

1. 请抽查/复跑至少 `pnpm r1-tech-role-fail-closed:prove` + `pnpm mysql-stack:m4-rag:prove`，附 CMD+EXIT。  
2. GAP-RAG-01 / m4 §R1 honesty：prove 绿 ≠ R1 closed ≠ production no-legacy-default？  
3. **R1 STILL OPEN** / **G-R4-3 STILL OPEN** / **SSOT NOT flipped** / Ban flip default / ≠ route-effective 是否仍硬钉？  
4. 是否同意 status 保持 **`executed:awaiting_post_prove_dual`**（实现方未自写 `post_prove_dual_pass`）？  
5. 是否引入 secrets / Meridian / force-push / HA/suite/`releaseEvidence=true` / 题域假关？（期望：**否**）

Please write the conclusion to `reviews/`（e.g. `2026-09-17-r1-explicit-close-ssot-flip-post-prove-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- 不宣称 R1 closed / G-R4-3 closed / route-effective / HA / suite / flip default / SSOT flipped / 题域已隔离  
- **await post-prove dual** · Ban self-write `post_prove_dual_pass`

---

*REQUEST · mw-rag-route · R1 explicit-close SSOT-flip post-prove · 2026-09-17 ~20:05 PT · prove EXIT 3×0 · releaseEvidence=false · ≠HA · ≠suite · ≠route-effective · R1 STILL OPEN · G-R4-3 STILL OPEN · SSOT NOT flipped · awaiting dual*

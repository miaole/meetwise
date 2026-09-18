# REQUEST — **R4/FUNNEL explicit close / SSOT flip** **post-prove** → mw-e2e-ha

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 (~20:15 PT · post-prove)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **R4/FUNNEL STILL OPEN** · **MS3 ≠ R4 closed** · **G-R4-5 dual-claim STILL OPEN** · **≠ R4 closed** · **≠ 题域已隔离** · **SSOT NOT flipped** · Ban 假关 · Ban false green  
**Pair**: `REQUEST-2026-09-17-r4-funnel-explicit-close-ssot-flip-post-prove-mw-rag-route.md`  
**Hard**: standing authorize after pre-exec dual on REQUEST **`133d952`** · prove EXIT=0 ≠ R4 closed ≠ FUNNEL dual-closed ≠ G-R4-5 dual-closed · Ban self-approve · Ban secrets · No force · PG retained · **≠ prove dual_pass knife** `105b264`/`d994c36` · **≠ honesty knife** `42f77c1`/`669bca4`  
**Knife**: `harness/r4-funnel-explicit-close-ssot-flip.md` · status **`executed:awaiting_post_prove_dual`** · **实现方不写** pass review · **Ban self-write `post_prove_dual_pass`** · **SSOT flip STILL DEFERRED to L5**

---

## Contra

| File | Role |
|------|------|
| `harness/r4-funnel-explicit-close-ssot-flip.md` | Knife harness · `executed:awaiting_post_prove_dual` |
| `receipts/2026-09-17-r4-funnel-explicit-close-ssot-flip-prove.md` | CMD+EXIT table |
| `harness/r4-funnel-real-close.md` | Prove dual_pass prior · ≠ this · `105b264`/`d994c36` |
| `harness/r4-funnel-remainder-honesty.md` | Honesty knife prior · ≠ this · `42f77c1`/`669bca4` |
| `harness/r4-f8-p-meta-ms3-deploy-product.md` | F8 · MS3 true · **MS3 ≠ R4 closed** · G-R4-5 dual-claim STILL OPEN |
| Pre-exec dual | `2026-09-17-r4-funnel-explicit-close-ssot-flip-mw-e2e-ha.md` **pass** on `133d952` |

---

## Stance（E2E-HA）

1. Standing authorize coding+prove after pre-exec dual on `133d952`.  
2. Prove EXIT **5×0** under authorize · **≠** R4 product closed · **≠** FUNNEL dual-closed · **≠** G-R4-5 dual-closed.  
3. **SSOT targets NOT flipped** this phase · L5 waits post-prove dual + explicit close authorize.  
4. **R4/FUNNEL STILL OPEN** · **MS3 ≠ R4 closed** · **G-R4-5 STILL OPEN** · Ban 假关 · Ban wash prove dual_pass `105b264`/`d994c36`.  
5. Knife remains **`executed:awaiting_post_prove_dual`** until experts write pass — **Ban** implementer self-write `post_prove_dual_pass`.

本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | ≠ R4 closed · ≠ 题域已隔离 |
| `pnpm r4-p-meta-ms3-deploy-product:prove` | **0** | MS3 ≠ R4 closed · G-R4-5 STILL OPEN |
| `pnpm r4-p-meta-ms2-facets-product:prove` | **0** | ≠ dual-claim closed |
| `pnpm r4-p-meta-ms1-product-wire:prove` | **0** | ≠ dual-claim closed |
| `pnpm mysql-stack:m4-rag:prove` | **0** | §R4 doc gate ≠ product close |

Minimal code: none — docs + prove re-run only · **SSOT NOT flipped**.

---

## Please answer

1. 请抽查/复跑至少 `pnpm r4-p-meta-ms3-deploy-product:prove` + `pnpm mysql-stack:r4-domain-isolation:prove`，附 CMD+EXIT。  
2. 是否同意 **≠ prove dual_pass knife** `105b264`/`d994c36` · **≠ honesty knife** `42f77c1`/`669bca4` · 本刀 = explicit-close prove-await path？  
3. **R4/FUNNEL STILL OPEN** / **MS3 ≠ R4 closed** / **G-R4-5 STILL OPEN** / **SSOT NOT flipped** 是否仍硬钉？  
4. 是否同意 status 保持 **`executed:awaiting_post_prove_dual`**（实现方未自写 `post_prove_dual_pass`）？  
5. 是否引入 secrets / `.env*` / Meridian / force-push / HA/suite/`releaseEvidence=true` / 假关？（期望：**否**）

Please write the conclusion to `reviews/`（e.g. `2026-09-17-r4-funnel-explicit-close-ssot-flip-post-prove-mw-e2e-ha.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- 不宣称 R4 closed / FUNNEL dual-closed / G-R4-5 dual-closed / HA / suite / SSOT flipped / MS3 closes R4  
- **await post-prove dual** · Ban self-write `post_prove_dual_pass`

---

*REQUEST · mw-e2e-ha · R4/FUNNEL explicit-close SSOT-flip post-prove · 2026-09-17 ~20:15 PT · prove EXIT 5×0 · releaseEvidence=false · ≠HA · ≠suite · R4/FUNNEL STILL OPEN · MS3 ≠ R4 closed · G-R4-5 STILL OPEN · SSOT NOT flipped · awaiting dual*

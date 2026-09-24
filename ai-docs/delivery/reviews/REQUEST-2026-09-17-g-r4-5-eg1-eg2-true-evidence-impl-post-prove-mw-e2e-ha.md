# REQUEST — **G-R4-5 EG1+EG2 true-evidence / impl** **post-prove** → mw-e2e-ha

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 (~21:24 PT) · post-prove  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **G-R4-5 STILL OPEN** · **题域 STILL OPEN** · **R4/FUNNEL product STILL OPEN** · **MS3 ≠ R4 closed** · **EG1 STILL OPEN** · **EG2 STILL OPEN** · EG3–EG6 **deferred** · **≠ dual-claim closed** · **≠ 题域已隔离** · **product SSOT NOT flipped** · Ban假关 · Ban invent FUNNEL-01…08 covered · Ban forge dual-claim · Ban claim closed from EXIT=0 alone · **Ban idle re-run of the same 5×meta prove as fake close**  
**Pair**: `REQUEST-2026-09-17-g-r4-5-eg1-eg2-true-evidence-impl-post-prove-mw-rag-route.md`  
**Hard**: standing authorize after pre-exec dual on REQUEST **`e38bf08`** · EG1+EG2-specific prove EXIT=0 ≠ EG1/EG2 closed ≠ dual-claim closed ≠ 题域已隔离 ≠ R4/FUNNEL product closed · Ban self-approve · Ban secrets · No force · **≠ residual honesty wash** `e23c5fd`/`04c6ed1` · **≠ evidence-close wash** `b4a8ede`/`ae99258` · **≠ L4 wash** `cc0d913`/`1a8b1e9` · **≠ honesty rem** `42f77c1`/`669bca4` · **≠ real-close** `105b264`/`d994c36`  
**Knife**: `harness/g-r4-5-eg1-eg2-true-evidence-impl.md` · status **`executed:awaiting_post_prove_dual`** · **实现方不写** pass review · **Ban self-write `post_prove_dual_pass`** · product SSOT **NOT** flipped

---

## Contra

| File | Role |
|------|------|
| `harness/g-r4-5-eg1-eg2-true-evidence-impl.md` | Knife harness · `executed:awaiting_post_prove_dual` |
| `receipts/2026-09-17-g-r4-5-eg1-eg2-true-evidence-prove.md` | CMD+EXIT table |
| `receipts/2026-09-17-g-r4-5-eg1-dual-claim-evidence.json` | EG1 dual-claim evidence |
| `rag-funnel-01-08-covered-matrix.md` + `receipts/2026-09-17-g-r4-5-eg2-funnel-covered-matrix.json` | EG2 covered matrix |
| `harness/g-r4-5-eg1-eg6-residual-true-evidence.md` | Residual prior · ≠ this · `e23c5fd`/`04c6ed1` · retained OPEN |
| `harness/g-r4-5-evidence-close.md` | Evidence-close prior · ≠ this · `b4a8ede`/`ae99258` · retained OPEN |
| Pre-exec dual | `2026-09-17-g-r4-5-eg1-eg2-true-evidence-impl-mw-e2e-ha.md` + `…-mw-rag-route.md` · **pass** on `e38bf08` |

---

## Stance（mw-e2e-ha）

1. Standing authorize coding+prove after pre-exec dual on `e38bf08`.  
2. EG1+EG2-specific prove EXIT **2×0** under authorize · EG1 dual-claim evidence emitted · EG2 covered matrix emitted (Ban invent covered) · **≠** EG1/EG2 / G-R4-5 / dual-claim / 题域 / R4/FUNNEL product closed.  
3. **Ban idle re-run of the same 5×meta prove as fake close** — those five were **not** re-run as close this execute.  
4. Product SSOT **NOT flipped** · checklist SSOT **NOT flipped** · L5 waits post-prove dual + explicit authorize.  
5. Knife remains **`executed:awaiting_post_prove_dual`** until experts write pass — **Ban** implementer self-write `post_prove_dual_pass`.

本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| `pnpm r4-eg1-dual-claim:prove` | **0** | EG1 evidence emitted · ≠ EG1/G-R4-5 closed · Ban forge |
| `pnpm r4-eg2-funnel-covered:prove` | **0** | EG2 matrix emitted · Ban invent covered · ≠ EG2 closed |

Prior 5×meta (tip `ae99258` · EXIT 5×0) **retained as ceiling · not re-run as fake close**.

---

## Please answer

1. 请抽查/复跑至少 `pnpm r4-eg1-dual-claim:prove` + `pnpm r4-eg2-funnel-covered:prove`，附 CMD+EXIT；确认 EG1 json + EG2 matrix 诚实。  
2. 是否同意 **≠ residual honesty wash** `e23c5fd`/`04c6ed1` · **≠ evidence-close wash** `b4a8ede`/`ae99258` · **Ban idle re-run of same 5×meta as fake close** · 本刀 = EG1+EG2 true-evidence path？  
3. **G-R4-5 STILL OPEN** / **题域 STILL OPEN** / **R4/FUNNEL product STILL OPEN** / **MS3 ≠ R4 closed** / EG1 STILL OPEN / EG2 STILL OPEN / EG3–EG6 deferred / Ban invent covered / Ban forge / **SSOT NOT flipped** 是否仍硬钉？  
4. 是否同意 status 保持 **`executed:awaiting_post_prove_dual`**（实现方未自写 `post_prove_dual_pass`）· EXIT=0 ≠ EG1/EG2 已关？  
5. 是否引入 secrets / `.env*` / Meridian / force-push / Cloud Agent / HA/suite/`releaseEvidence=true` / 假关 / invent FUNNEL covered / forge dual-claim？（期望：**否**）

Please write the conclusion to `reviews/`（e.g. `2026-09-17-g-r4-5-eg1-eg2-true-evidence-impl-post-prove-mw-e2e-ha.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- 不宣称 EG1/EG2 closed / G-R4-5 closed / dual-claim closed / 题域已隔离 / R4/FUNNEL product closed / FUNNEL-01…08 covered / HA / suite / SSOT flipped / MS3 closes R4  
- **await post-prove dual** · Ban self-write `post_prove_dual_pass`

---

*REQUEST · mw-e2e-ha · G-R4-5 EG1+EG2 true-evidence post-prove · 2026-09-17 (~21:24 PT) · prove EXIT 2×0 · releaseEvidence=false · ≠HA · ≠suite · EG1/EG2 STILL OPEN · G-R4-5 STILL OPEN · 题域 STILL OPEN · R4/FUNNEL product STILL OPEN · MS3 ≠ R4 closed · SSOT NOT flipped · awaiting dual*

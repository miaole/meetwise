# REQUEST — **R2 real close / SSOT flip** **post-prove** → mw-e2e-ha

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 (~19:42 PT · post-prove)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **R2 structural CLOSED** · **R2 NOT closed** as HA/suite/verbal/controlPlane/R4/FUNNEL · **≠ verbal route-effective** · **≠ controlPlaneClosed** · Ban false close 题域/FUNNEL/R4 · sole **恰 5**  
**Pair**: `REQUEST-2026-09-17-r2-ssot-flip-real-close-post-prove-mw-rag-route.md`  
**Hard**: standing authorize after dual on `c3092c1` · prove EXIT=0 ≠ verbal 生效 ≠ HA/suite · Ban self-approve · Ban secrets · No force · PG retained · **≠ W4**  
**Knife**: `harness/r2-ssot-flip-real-close.md` · status **`executed:awaiting_post_prove_dual`** · **实现方不写** pass review

---

## Contra

| File | Role |
|------|------|
| `harness/r2-ssot-flip-real-close.md` | Knife harness · `executed:awaiting_post_prove_dual` |
| `receipts/2026-09-17-r2-ssot-flip-real-close-prove.md` | CMD+EXIT table |
| `harness/r2-classify-job-route-status.md` | Status SSOT flipped |
| `harness/r2-p-harness-agree.md` | G-R2-8 authorized + flipped |
| Pre-exec dual | `2026-09-17-r2-ssot-flip-real-close-mw-e2e-ha.md` **pass** on `c3092c1` |

---

## Stance（E2E-HA）

1. SSOT flipped off `await_authorize` under standing authorize after dual.  
2. **R2 structural CLOSED**（classify→bind→snapshot→refuse/allow + dual+authorize+prove）.  
3. **R2 NOT closed** as HA/suite/verbal/controlPlane/R4/FUNNEL · **≠ verbal 生效**.  
4. All listed prove EXIT=0 · Ban invent EXIT · Ban false green.  
5. Knife remains **`executed:awaiting_post_prove_dual`** until experts write pass — **Ban** implementer self-write `post_prove_dual_pass`.

本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| `pnpm r2-p-live-route-effective:prove` | **0** | ≠ verbal 生效 |
| `pnpm r2-classify-job-route-prereq:prove` | **0** | R2 NOT closed as HA/suite/verbal/controlPlane/R4/FUNNEL |
| `pnpm r2-p-fake-route-classify:prove` | **0** | ≠ verbal 生效 |
| `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | ≠ R4 |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** | ≠ R4 closed |
| `pnpm mysql-stack:m4-rag:prove` | **0** | §R2 doc gate |

---

## Please answer

1. 请抽查/复跑至少 `pnpm r2-p-live-route-effective:prove` + `pnpm r2-classify-job-route-prereq:prove`，附 CMD+EXIT。  
2. SSOT flip 是否诚实退休 `await_authorize` 且 **≠ W4**？  
3. **R2 structural CLOSED** 语言是否仍钉 **≠ verbal / ≠HA / ≠suite / ≠ controlPlane / ≠ R4/FUNNEL**？  
4. 是否同意 status 保持 **`executed:awaiting_post_prove_dual`**（实现方未自写 `post_prove_dual_pass`）？  
5. 是否引入 secrets / force-push / sole allowlist 扩面？（期望：**否**）

Please write the conclusion to `reviews/`（e.g. `2026-09-17-r2-ssot-flip-real-close-post-prove-mw-e2e-ha.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- 不宣称 verbal 生效 / HA / suite / controlPlaneClosed / R4/FUNNEL closed  
- **await post-prove dual**

---

*REQUEST · mw-e2e-ha · R2 SSOT flip post-prove · 2026-09-17 ~19:42 PT · prove EXIT=0 · releaseEvidence=false · ≠HA · ≠suite · awaiting dual*

# REQUEST — **G-R4-3 evidence close** **post-prove** → mw-rag-route

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-17 (~20:54 PT) · post-prove  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **G-R4-3 STILL OPEN** · **PR1-B/C false / evidence gaps** · **≠ R1 product closed** · **≠ GAP-RAG-01 closed** · **≠ flip default** · **≠ route-effective** · Ban假关 · Ban forge PR1-B/C · Ban claim closed from EXIT=0 alone  
**Pair**: `REQUEST-2026-09-17-g-r4-3-evidence-close-post-prove-mw-e2e-ha.md`  
**Hard**: standing authorize after pre-exec dual on REQUEST **`0c3fbaa`** · prove EXIT=0 ≠ G-R4-3 closed ≠ R1 product closed · Ban self-approve · Ban secrets · No force · **≠ residual honesty wash** `5e05909`/`4cd0ecd` · **≠ R1 L5 wash** `9e9b6ff`/`ebd4117` · **≠ prove dual_pass** `0deb5fb`/`30d93dc` · **≠ docs knife** `f9119fe`/`2316bbc`  
**Knife**: `harness/g-r4-3-evidence-close.md` · status **`executed:awaiting_post_prove_dual`** · **实现方不写** pass review · **Ban self-write `post_prove_dual_pass`** · fail-closed default **NOT** flipped（still `0`）

---

## Contra

| File | Role |
|------|------|
| `harness/g-r4-3-evidence-close.md` | Knife harness · `executed:awaiting_post_prove_dual` |
| `receipts/2026-09-17-g-r4-3-evidence-close-prove.md` | CMD+EXIT table |
| `harness/g-r4-3-residual.md` | Residual honesty prior · ≠ this · `5e05909`/`4cd0ecd` · retained OPEN |
| `harness/r1-explicit-close-ssot-flip.md` | R1 L5 prior · ≠ this · `9e9b6ff`/`ebd4117` |
| `harness/r4-f4-p-r1-fail-closed.md` | F4 · PR1-A true · **PR1-B/C false** · G-R4-3 STILL OPEN · no flip |
| `m4-rag-hard-gates.md` §R1 · GAP-RAG-01 | R1 未关 · prove 绿 ≠ closed · 默认 legacy 仍开 |
| Pre-exec dual | `2026-09-17-g-r4-3-evidence-close-mw-e2e-ha.md` + `…-mw-rag-route.md` · **pass** on `0c3fbaa` |
| Default pin | `docker/env/worker.env.example` · `MEETWISE_TECH_ROLE_FAIL_CLOSED=0` |

---

## Stance（mw-rag-route）

1. Standing authorize coding+prove after pre-exec dual on `0c3fbaa`.  
2. Prove EXIT **3×0** under authorize · coding=**none** · **≠** G-R4-3 / R1 product / GAP-RAG-01 closed.  
3. PR1-B/C **STILL OPEN** · combo-root / flag-on production evidence **missing** · default-on / no-legacy **missing** · Ban forge · Ban假关.  
4. Fail-closed default **NOT flipped**（still `0`）· ≠ route-effective · SSOT waits post-prove dual + evidence + explicit authorize.  
5. Knife remains **`executed:awaiting_post_prove_dual`** until experts write pass — **Ban** implementer self-write `post_prove_dual_pass`.

本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| `pnpm r1-tech-role-fail-closed:prove` | **0** | ≠ R1 product closed · ≠ G-R4-3 closed · ≠ GAP-RAG-01 closed |
| `pnpm r4-p-r1-fail-closed:prove` | **0** | PR1-A true · PR1-B/C false · comboRoot=false · G-R4-3 STILL OPEN · default still 0 |
| `pnpm mysql-stack:m4-rag:prove` | **0** | §R1 doc gate ≠ product close |

Minimal code: **none** — prove re-run only · PR1-B/C **not forged** · **default NOT flipped**.

---

## Please answer

1. 请抽查/复跑至少 `pnpm r4-p-r1-fail-closed:prove` + `pnpm mysql-stack:m4-rag:prove`，附 CMD+EXIT。  
2. 是否同意 **≠ residual honesty wash** `5e05909`/`4cd0ecd` · **≠ R1 L5 wash** `9e9b6ff`/`ebd4117` · 本刀 = evidence-close prove-await path？  
3. **G-R4-3 STILL OPEN** / **PR1-B/C false** / combo-root missing / default-on missing / **fail-closed default still 0** / **≠ route-effective** / **SSOT NOT flipped** 是否仍硬钉？  
4. 是否同意 status 保持 **`executed:awaiting_post_prove_dual`**（实现方未自写 `post_prove_dual_pass`）· EXIT=0 ≠ 已关？  
5. 是否引入 secrets / `.env*` / Meridian / force-push / HA/suite/`releaseEvidence=true` / 假关 / forge PR1-B/C / flip default / claim GAP-RAG-01 closed？（期望：**否**）

Please write the conclusion to `reviews/`（e.g. `2026-09-17-g-r4-3-evidence-close-post-prove-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- 不宣称 G-R4-3 closed / R1 product closed / GAP-RAG-01 closed / PR1-B/C covered / HA / suite / default flipped / route-effective / SSOT flipped  
- **await post-prove dual** · Ban self-write `post_prove_dual_pass`

---

*REQUEST · mw-rag-route · G-R4-3 evidence close post-prove · 2026-09-17 (~20:54 PT) · prove EXIT 3×0 · releaseEvidence=false · ≠HA · ≠suite · G-R4-3 STILL OPEN · PR1-B/C false · fail-closed default still 0 · awaiting dual*

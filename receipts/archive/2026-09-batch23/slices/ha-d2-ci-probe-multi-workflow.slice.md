# Slice — **HA D2 CI probe:multi workflow**（AUTHORIZED coding+prove · **`post_prove_dual_pass`** · ladder **D2** CI-safe `ha:probe:multi` workflow · stub dual+fault · CI artifact · honesty `--require-evidence` EXIT=1）

**Status**: **`post_prove_dual_pass`**（AUTHORIZED coding+prove · workflow landed · static prove · pre-exec BOTH PASS · **Ban second knife** · Dual PASS ≠ HA green · Dual PASS ≠ next knife · **≠ claim 阶 D** · **≠ CI stub = 阶 D** · **≠ production HA** · **≠ flip `releaseEvidence`** · **≠ wash D1 `b72c7c4`/`65526ac`/`1f020fd` into 阶 D** · **≠ wash G-R4-5 into HA** · **≠ wash `--require-evidence` EXIT=1 into green** · live GHA URL **none** · STOP）
**Date**: 2026-09-23 (~15:35 PT)
**Base / REQUEST tip**: **`dad775f`** / full `dad775f0261ad35f86dcbdf7affd01c9cb68ad9a` · prior D1 nail **`b72c7c4`** retained · ≠ wash into 阶 D
**Prove tip / land**: **`2186ad7`** / full `2186ad7b46f22c06f620bbe0c08499be6392d6bb` · **pin HEAD**: **`984ffc5`** / full `984ffc5d7fdc2cb3d260ad529638c4ebeb3f58ce` · **Nail docs commit**: **`50e35ba`** / full `50e35ba07b45c916c55fcf817fa1a4f0e8ac993f` · **`post_prove_dual_pass`** · post-prove dual **BOTH PASS**
**Authority**: meetwise — AUTHORIZED coding+prove · Ban secrets / `.env*` · Ban Meridian · Ban Cloud Agent · **Ban second knife `post_prove_dual_pass`** · Ban claim 阶 D · Ban CI stub = 阶 D · Ban production HA · Ban flip `releaseEvidence` · Ban wash prior tips into 阶 D / HA · **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`** · STOP
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · **≠HA** · **≠suite green** · **≠ CI stub green = 阶 D green** · **≠ production topology** · **≠ 阶 C/D green** · **≠ coding authorized** · Dual PASS ≠ coding · Ban self-approve · Ban Cloud Agent · Ban Meridian · Ban自批 HA · Key×3 FreeTier **out of scope** · `gR45Closed=true` **retained** · coveredCount **8** retained · `ms3EqualsR4Closed=false` **retained** · eg1–eg6 / r4 / funnel product flags **retained** · prior D1 **`post_prove_dual_pass`** **retained** · prior C3b **`post_prove_dual_pass`** **retained** · prior C3+C4 **`post_prove_dual_pass`** **retained** · `releaseEvidence=false` **retained** · ≠HA
**Experts**: `mw-e2e-ha` + `mw-rag-route` · pre-exec dual **BOTH PASS** · tips `10d2053` / `4724ce3` · post-prove **BOTH PASS** · Ban自批 · Ban second knife

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/ha-d2-ci-probe-multi-workflow.slice.md` |
| Harness | `ai-docs/delivery/harness/ha-d2-ci-probe-multi-workflow.md` |
| Eval | `ai-docs/delivery/eval/ha-d2-ci-probe-multi-workflow.eval.md`（later / experts · **not** this open） |
| Must cite HA ladder | `harness/ha-track.multi-instance.md` · **D2** CI probe:multi workflow · CI artifact URL · Local D1 done ≠ 阶 D green · Ban claim 阶 D green · Ban claim production compose HA on GHA · `--with-bring-up-stub` · `--with-fault-inject` · `--require-evidence` EXIT=1 fail-closed（job treats EXIT=1 as expected honesty）· CI stub green ≠ 阶 D green ≠ production HA |
| Prior HA local D1 | tip nail **`b72c7c4`** · prove tip **`65526ac`** · prove land **`1f020fd`** · `post_prove_dual_pass` · still NOT_HA · 阶 C/D STILL NOT GREEN · Local D1 done ≠ 阶 D green · **retained** · Ban wash into 阶 D |
| Prior HA local C3b | tip nail **`beaedc9`** · prove tip **`4da46d5`** · prove land **`a32c071`** · EXIT **3×0** · `post_prove_dual_pass` · still NOT_HA · 阶 C/D STILL NOT GREEN · **retained** · Ban wash into 阶 D |
| Prior HA local C3+C4 | tip nail **`358a5cf`** · prove **`16e8379`** · prove land **`94b05b6`** · EXIT **4×0** · `post_prove_dual_pass` · still NOT_HA · 阶 C/D STILL NOT GREEN · **retained** · Ban wash into 阶 D |
| Prior G-R4-5 product close | tip nail **`6ded589`** · prove **`ba1b8aa`** · EXIT **2×0** · `gR45Closed=true` · coveredCount **8** · `ms3EqualsR4Closed=false` · eg1–eg6/r4/funnel **retained** · `releaseEvidence=false` · ≠HA · **retained** · Ban wash into HA |
| Parent / stance | **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`** · 阶 C/D **STILL NOT GREEN** · production HA **NOT claimed** · CI stub green ≠ 阶 D green |
| REQUEST · e2e-ha (pre-exec PASS) | `reviews/REQUEST-2026-09-23-ha-d2-ci-probe-multi-workflow-mw-e2e-ha.md` · **PASS** tip `10d2053` | |
| REQUEST · rag-route (pre-exec PASS) | `reviews/REQUEST-2026-09-23-ha-d2-ci-probe-multi-workflow-mw-rag-route.md` · **PASS** tip `4724ce3` | |

## One-line scope

Completed **HA D2 CI probe:multi workflow** · status `post_prove_dual_pass` · ladder **D2** CI-safe `ha:probe:multi` workflow under GHA（cite `ha-track.multi-instance.md` · CI artifact URL · Ban claim 阶 D green · Ban claim production compose HA on GHA）· landed workflow under `.github/workflows/`· prefer `workflow_dispatch` + `pull_request`/path filter · **no** secrets / `.env*` · CI-safe `pnpm ha:probe:multi -- --with-bring-up-stub --with-fault-inject`（stub dual+fault · **no** claim production compose HA on GHA）· honesty `pnpm ha:probe:multi -- --require-evidence` → **EXIT=1** fail-closed · **job treats EXIT=1 as expected honesty** · Ban flipping to pass · upload probe receipt JSON/md as **CI artifact** · document how artifact URL is recorded · pins `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · **CI stub green ≠ 阶 D green ≠ production HA** · local static check workflow YAML + package scripts completed · optional `actionlint` · Ban claim workflow land alone = 阶 D green · Ban假绿 · do NOT invent green · Ban claim 阶 D / 阶 C/D green · Ban production HA / failover · Ban flip `releaseEvidence` · Ban wash `b72c7c4`/`65526ac`/`beaedc9`/`358a5cf` into 阶 D · Ban wash G-R4-5 `6ded589`/`ba1b8aa` into HA · Ban wash skeleton/stub / local D1 EXIT=0 into HA · Explicit ≠ wash prior tips into 阶 D · Lifecycle: REQUEST → pre-exec dual → AUTHORIZED coding+prove → post_prove_dual_pass → post-prove dual → AUTHORIZED nail → `post_prove_dual_pass` → STOP · Dual PASS ≠ next knife auto-authorize · Dual PASS ≠ coding · Dual PASS ≠ HA green · Key×3 FreeTier out of scope · retain prior D1 / C3b / C3+C4 / `gR45Closed=true` / coveredCount **8** / `ms3EqualsR4Closed=false` / eg1–eg6/r4/funnel · **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`** · Ban claim 阶 D from this knife alone · Ban wash D1 receipts into 阶 D · out of scope: production probe (**D3**) · cloud buy · UC covered-lift · flipping `--require-evidence` · full compose-shared on GHA as production HA claim · workflow YAML landed · static prove landed · zero HA claim · Ban second knife · Dual not pinged by implementer · STOP.

## Hard pins

- **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`** · 阶 C/D **STILL NOT GREEN** · production HA **NOT claimed** · CI stub green ≠ 阶 D green · ≠ wash prior D1 `b72c7c4`/`65526ac`/`1f020fd` into 阶 D · ≠ wash prior C3b `beaedc9`/`4da46d5`/`a32c071` into 阶 D · ≠ wash prior C3+C4 `358a5cf`/`16e8379` into 阶 D · ≠ wash G-R4-5 `6ded589`/`ba1b8aa` · ≠ wash skeleton/stub / local D1 EXIT=0 into HA · ≠ wash `--require-evidence` EXIT=1 into green · Ban invent green · Ban假绿 · Ban claim 阶 D / 阶 C/D green · Ban production HA / failover · Ban claim workflow land alone = 阶 D green · Ban flip `releaseEvidence` · Dual PASS ≠ coding · Dual PASS ≠ HA green · Dual PASS ≠ next knife auto-authorize · `gR45Closed=true` **retained** · coveredCount **8** retained · `ms3EqualsR4Closed=false` **retained** · eg1–eg6/r4/funnel **retained** · prior D1 / C3b / C3+C4 **retained** · Ban self-approve · Ban Cloud Agent · Ban Meridian · Ban secrets / `.env*` · Key×3 FreeTier **out of scope** · Ban claim 阶 D from this knife alone · Ban wash D1 receipts into 阶 D · Dual not pinged by implementer
- Lifecycle: L0–L3 **done this land** · L4 post-prove dual **done** · L5 nail **done** · status **`post_prove_dual_pass`** · **Ban second knife** · CI stub ≠ 阶 D · ≠ production HA · STOP
- Acceptance later: pre-exec dual BOTH PASS → standing authorize → AUTHORIZED land GHA workflow + static prove（stub probe CI-safe + `--require-evidence` EXIT=1 honesty expected + CI artifact + artifact URL recorded）→ post-prove dual BOTH PASS → lifecycle nail → STOP · **Ban假绿** · **Ban invent green** · **Ban claim 阶 D** · **Ban production HA** · **Ban claim workflow land alone = 阶 D green**

## Scope

| In scope（later under authorize · not this open） | Out of scope |
|--------------------------------------------------|--------------|
| New GHA workflow under `.github/workflows/`（or dedicated job）· prefer `workflow_dispatch` + `pull_request`/path filter · **no** secrets / `.env*` · `pnpm ha:probe:multi -- --with-bring-up-stub --with-fault-inject`（stub dual+fault · still NOT_HA · releaseEvidence=false · **no** claim production compose HA on GHA）· honesty `pnpm ha:probe:multi -- --require-evidence` → EXIT=1 fail-closed · **job treats EXIT=1 as expected honesty** · Ban flipping to pass · upload probe receipt JSON/md as **CI artifact** · document artifact URL recording · local static check workflow YAML + package scripts · optional `actionlint` · Ban claim workflow land alone = 阶 D green · Ban washing EXIT=1 into green | production probe (**D3**) · cloud buy · UC covered-lift · Key×3 FreeTier · flipping `--require-evidence` · full compose-shared on GHA as production HA claim · Ban claim 阶 D from this knife alone · Ban wash D1 receipts into 阶 D · coding/prove/workflow YAML this open · flip releaseEvidence · invent green |

## CMD

| CMD | Status |
|-----|--------|
| docs REQUEST open | **done** · tip `dad775f` · cite `ha-track.multi-instance.md` D2 |
| pre-exec dual | **BOTH PASS** · `10d2053` / `4724ce3` · Ban自批 nail |
| standing coding / authorize / prove | **AUTHORIZED coding+prove this land** · Ban invent green · Ban假绿 · Ban claim 阶 D · Ban production HA · Ban claim workflow land alone = 阶 D · status `post_prove_dual_pass` |
| coding+prove + nail | landed `.github/workflows/ha-probe-multi.yml` · stub + `--require-evidence` EXIT=1 honesty · artifact upload design · local static YAML/scripts · actionlint skip · live GHA none · Ban washing EXIT=1 into green · Ban假绿 · Ban claim 阶 D · Ban second knife · post-prove receipt tips `7ca7fa8` / `22ac6cd` |

---

*Slice · HA D2 CI probe:multi workflow · 2026-09-23 (~15:36 PT) · post_prove_dual_pass · REQUEST tip dad775f · pre-exec BOTH PASS · workflow landed · live GHA none · haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · Ban second knife · Ban claim 阶 D · Ban CI stub = 阶 D · STOP**

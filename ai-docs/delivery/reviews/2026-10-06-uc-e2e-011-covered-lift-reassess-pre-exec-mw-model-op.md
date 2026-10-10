# Line AF · UC-E2E-011 covered-lift-reassess · PRE-EXEC · mw-model-op

**Role**: independent reviewer `mw-model-op` (alone ≠ dual · peer `mw-e2e-ha`)
**Date**: 2026-10-06 ~13:00 CST (Asia/Shanghai · UTC+8)
**Branch**: `feat/mysql-schema-skeleton`
**Worktree**: `/workspace/meetwise-mwmodelop-lineaf-pre` (fresh · Ban live · Ban `.env*` · Ban Meridian · **NO coding** · Ban overwrite REQUEST stubs)
**REQUEST**: `3dca5decfe69c81f1ef5cf58428834d95b2b59d9`
**REQUEST parent**: `b4a2a01d225373283c60d773055d360f6a3fc15a`
**Tip at dual seed**: `b12e20d26ef852a9a4de136324f3c225ab7ef4ee`
**Harness**: `ai-docs/delivery/harness/uc-e2e-011-covered-lift-reassess.md`
**Stub**: `ai-docs/delivery/reviews/REQUEST-2026-10-06-uc-e2e-011-covered-lift-reassess-mw-model-op.md` (PENDING · not overwritten)
**Context**: Line V honesty-of-red `587b9e0`/`0421e5a` · Line Z Path A `bbde310`→`76edbc6`→`ef980e3` (+ peer `938adee`) · PASS ≠ covered · ADV column gap/`case-only` retained · later main-mouth nail `5aae104` CLOSED(wired) ≠ covered
**Coordinator pre-judge**: `canHonestlyFlip=false` · Ban fake flip · Ban coding until BOTH + AUTHORIZE

## 1. Docs-only confirmation

| Check | Result |
|-------|--------|
| `git diff --name-status 3dca5dec^..3dca5dec` | **4 files · all `.md`** |
| Paths | `harness/uc-e2e-011-covered-lift-reassess.md` · `uc-e2e-011-covered-lift-reassess.slice.md` · `REQUEST-…-mw-e2e-ha.md` · `REQUEST-…-mw-model-op.md` |
| Matrix / backlog / checklist / ledger / package.json / src | **untouched** by REQUEST |
| coveredCount edit | **none** (stays **8** in harness/slice/stubs) |
| `canHonestlyFlip` in REQUEST docs | pin = **false** (reassess only · Ban flip in REQUEST) |

**Ruling**: REQUEST is **docs-only**. PASS gate “canHonestlyFlip=true or coveredCount edit → FAIL” **not triggered**.

## 2. canHonestlyFlip ruling

**Ruling**: harness **honestly concludes UC-011 cannot flip to covered now** · `canHonestlyFlip=**false**` (current pin · §2 预判 · §0 Expected · §5/§7 freeze).

Aligned with real evidence:

| Evidence | Reality check | Harness read |
|----------|---------------|--------------|
| Line V `pnpm uc011:adv:prove` honesty-of-red | tip-reachable prove tip `79825b2` · code `3d113c8` · **EXIT 1** (historical 三口 404 / A1/A2 UNREACHABLE) · retained Ban wash | §1 row · Ban wash ✓ |
| Line Z Path A mouth | CODE `bf1fdb2` · prove tip `244b812` · **EXIT 0 · 41/41** · dual `938adee`/`ef980e3` | EXIT0 ≠ covered ✓ |
| Main mouth wiring (post-Z) | tip tree has `POST /payment/refund-callback` (`payment-callback.controller.ts` via feat `40a4f6c2acba905165d269d7318c2351e1be5ecb`) · CMD `uc011:refund-callback-adv:prove` registered · nail `5aae104` CLOSED(wired) · ADV **column** stays gap/`case-only` | closed(wired) ≠ covered · Ban column lift ✓ |
| Amount DISCLOSED / audit absent | matrix `:117` nail residual ①② · Z AMT DISCLOSED | OPEN-GAP residuals · Ban wash ✓ |
| PERF/LOAD | matrix `:148` PERF_api/LOAD_worker **blind** · NHP-011-LOAD-w-01 blind→case-only (`non-happy-path-perf-load-case-matrix.md:59`) | primary refuse · UC-018 precedent ✓ |
| NEG/FAULT/BOUND | NHP `:55–57` **partial** | `STATUS-NOT-COVERED` ✓ |
| §1b inventory | `harness/uc-e2e-011-report-refund.md:63–74` #2–#6 still OPEN / 须重读 | Ban 一揽子 DONE ✓ |
| coveredCount / row | matrix `:117` / `:175` / P1-2 **partial** · coveredCount=**8** | freeze · Ban SSOT flip in REQUEST ✓ |

**Falsifiable flip criteria (harness §3)**: true only if evaluator reasons empty + all columns meetCovered + §1.1 businessPathMet + openGaps=[] + status covered — and **even if computed true, Ban flip in this knife** (另刀 + dual + 协调方授权). Branch A docs hand-calc default · Branch B computed **not authorized** in REQUEST.

## 3. Remaining-gap list (blockers to flip) · cites

| # | Remaining gap / refuse | Cite | Flip would need (falsifiable) |
|---|------------------------|------|-------------------------------|
| 1 | **PERF_api blind** | matrix `:148` · harness §2 | Named NHP-011-PERF-* + non-blind prove EXIT0 meeting criterion · else `MISSING-NHP` |
| 2 | **LOAD_worker blind** (并发退款风暴 / 无双退收据) | NHP `:59` · matrix `:148` · subsumes “M2 sequential ≠ parallel stress” | NHP-011-LOAD-w-01 non-blind evidence · not case-only |
| 3 | **ADV column** gap/`case-only` | matrix `:117` ADV · NHP `:58` · CLOSED(wired) ≠ column covered | Column meetCovered under evaluator (not just GAP wired close) |
| 4 | **NEG/FAULT/BOUND partial** | NHP `:55–57` · matrix `:117` | Each column status covered + required NHP meetCovered |
| 5 | **§1b #2 balance-ui** | report-refund harness `:63–74` | Product + prove path EXIT0 for balance-ui |
| 6 | **§1b #3 fail HTTP / full.e2e** | same | Fail-mouth or full.e2e entitlement rollback evidence |
| 7 | **§1b #4 regenerate (UC-019)** | same | UC-019 closed-loop evidence (separate UC) |
| 8 | **§1b #5 wallet ADR/落地** | same | `GET /wallet` or ADR demote accepted |
| 9 | **§1b #6 sole-stack** | same · PG-retained ADR · Ban cutover | Honest re-read under PG-retained (≠ MySQL cutover wash) |
| 10 | **Residual ① audit absent** | matrix `:117` / nail `:439` area · GuardrailHit emit absent | Audit wiring knife + emit evidence (not disclosed-absent) |
| 11 | **Residual ② amount explicit recheck** | A3 DISCLOSED · no server amount compare path | New knife implementing + proving explicit recheck (Ban 改口「已实现」) |
| 12 | Historical **`uc011:adv:prove` EXIT 1** honesty-of-red | `79825b2` / `3d113c8` · Ban wash | Retained red · not a flip enabler |

Money-face invariants (M1/M2/B-1 pins) cited as **existing evidence only** — REQUEST stub §3 · **not** extrapolated to covered.

Payment ledger path = commerce refund/entitlement ≠ G7/reconciler spend-ledger · no G7 green / MODEL-OP-00 / HA / R1 / A3 claims in REQUEST.

## 4. Other rulings

| Topic | Ruling |
|-------|--------|
| Pins exact | **NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · **gR45Closed=true** · **coveredCount=8** · **ms3EqualsR4Closed=false** · **PG-retained** |
| Stale-INV wash ADV green | **Ban observed** · harness retains honesty-of-red · does not treat INV flip as ADV covered |
| Evaluator cites | `uc-covered-evaluator.mjs:236` `evaluate` · `:246` `requiredNhp` override — verified present; gatherer UC-018-only (UC-011 gatherer absent) — claim substantively true |
| NHP line cites `:55–59` | `non-happy-path-perf-load-case-matrix.md:55–59` — **accurate** |
| Matrix `:117` / `:148` / `:175` / P1-2 | Read-only references · REQUEST did not edit SSOT |
| expired-sig folded into `bad_signature` | Disclosed Z non-blocker · not a separate covered criterion; LOAD/#2 covers concurrency stress gap |
| alone ≠ dual · Dual PASS ≠ coding ≠ prove ≠ nail ≠ covered | Restated · Ban AUTHORIZE coding until BOTH |

## 5. Blockers / non-blockers

### Blockers

**None** for PRE-EXEC PASS of this docs REQUEST.

### Non-blockers / CONDITIONS

1. **Pre-rebase SHA cite debt (inherited from prior nail, not invented by AF REQUEST)**: harness/SSOT cite CODE `2535b31…` · prove tip `cf34390…` · dual `275ba7d`/`a0f77f0`/`7f31beb`/`dfd9822` are **not presently fetchable** from `origin` (`upload-pack: not our ref` / bad object). Tip-reachable equivalents for AUTHORIZE/exec: feat **`40a4f6c2acba905165d269d7318c2351e1be5ecb`** · post-prove mirrors **`a8873d0`** / **`b236be8`** · nail **`5aae104`**. Does **not** overturn `canHonestlyFlip=false`.
2. Harness “base tip `416b6a5`” is wave-start pin; dual seed tip is `b12e20d` (siblings AD/AE/AH may land) — Ban touch siblings restated.
3. Branch B computed gatherer/prove **not in this REQUEST** — correctly deferred.
4. P1-2 backlog text still lists older “仍缺支付回调产品口” inventory language in places; harness correctly treats #1 Path A + main mouth as landed and leaves #2–#6 OPEN — Ban 一揽子 DONE.

## Honesty footer

PASS ≠ coding ≠ prove ≠ nail ≠ covered · alone ≠ dual · EXIT0 ≠ covered · closed(wired) ≠ covered · canHonestlyFlip=false · coveredCount=8 · Ban fake flip · Ban invent covered · Ban wash residuals · Ban Meridian · Ban live

Verdict: PASS

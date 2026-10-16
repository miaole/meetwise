# mw-e2e-ha · RE-PRE-EXEC · NOTE-CKPT-UNSEALED-CLAIM-NEG rewrite @`a24382b`

**Role**: mw-e2e-ha（adversarial E2E evidence-honesty · docs gate only）
**Date**: 2026-10-02 (PT)
**REQUEST**: `a24382b` / full `a24382b6ae10464e2b7abcc957bec43ef2868061` — `docs(privacy): rewrite Line F unsealed-claim request`
**Tip at review**: `origin/feat/mysql-schema-skeleton` contains `a24382b` as ancestor
**Scope**: re-pre-exec only · no prove · no docker · no product edit · Ban Meridian / `.env*` · Ban sign for mw-privacy-int
**Supersedes**: prior F pre-exec ruling on REQUEST `a1a06ab`（receipt `3bf6f40`）**for the rewritten text only**. The prior file `REQUEST-2026-10-02-note-ckpt-unsealed-claim-neg-mw-e2e-ha.md` is left untouched. This receipt does not edit Line A backfill.

## Gate checks

| Check | Result |
|-------|--------|
| `git show --stat a24382b` docs-only | **PASS** — only `ai-docs/delivery/harness/note-ckpt-unsealed-claim-neg.md` + `ai-docs/delivery/note-ckpt-unsealed-claim-neg.slice.md`（51+/72−）· no product / proof / migration |
| On origin · ancestor of tip | **PASS** — `origin/feat/mysql-schema-skeleton` contains `a24382b` |
| Cite existing unsealed NEG cases | **PASS** — see line audit below |
| Retire NOTE as implementation knife | **PASS** — knife disposition + “not an implementation authorization” · no second prove |
| Ban second implementation | **PASS** — keep `uc052-checkpoint-physical.proof.ts` unchanged · no new proof file |
| Ban principal edits | **PASS** — keep `apps/worker/src/checkpoint-principal.ts` unchanged |
| `retention_pending` present | **PASS** — pin in harness + slice（external retention · not completion evidence） |
| Keep SQLSTATE `42501` + no-write | **PASS** — shared assertion cited · cases cite refusal / unchanged rows |
| Pins retained | **PASS** — haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 |
| Alone ≠ dual | **PASS** — await mw-privacy-int · this file does not dual-close |

## Proof line audit（tip `packages/db/test/uc052-checkpoint-physical.proof.ts`）

REQUEST citations vs real tip lines — **exact match · no drift**:

| Case / shared | REQUEST cites | Tip reality | Contract quote |
|---|---|---|---|
| Shared refusal | L750–758 | L750–758 | `const refused = !claimed && sqlState === '42501' && errMsg.includes(expectMsg);` · `unchanged` on targets/status · `ok: refused && unchanged` · detail includes `claimed=` |
| NULL epoch | L763–766 `NHP-CKPT-UNSEALED-NEG-EPOCH` | L763–766 | `runUnsealedClaimNeg('epoch')` |
| NULL digest | L768–771 `NHP-CKPT-UNSEALED-NEG-DIGEST` | L768–771 | `runUnsealedClaimNeg('digest')` |
| both NULL | L773–776 `NHP-CKPT-UNSEALED-NEG-BOTH` | L773–776 | `runUnsealedClaimNeg('both')` · epoch checked first |
| sealed positive | L780–804 `HP-CKPT-SEALED-CLAIM` | L780–804 | claim returns lease |

Helper `runUnsealedClaimNeg` starts ~L686；`claimed` defaults false（L735）；refusal requires `!claimed` + `42501` + message · not a bare `rejects()`. Line numbers match REQUEST; no “wrong lines” condition.

## Line B nail gate

Rewrite **drops** the old “coding waits for Line B `GAP-UC052-POOL-ROLE-LEAK` nail” sequencing language from `a1a06ab`.

That drop is **not** a blocker here: the rewrite replaces it with a **stronger** disposition — knife **retired** · **no product code / prove / nail in scope** · “does not … authorize coding”. It does **not** authorize coding now. Per gate rule: dropping the nail gate blocks only if it authorizes coding now — it does not.

Condition retained: this re-pre-exec **PASS ≠ coding now ≠ covered ≠ nail**. If anyone later tries to reopen an implementation path under this note title, that would be a **new** REQUEST and must not treat this PASS（or retired NOTE）as authorization. Prior `3bf6f40` conditions on assertion shape（42501 · claimed=false · unchanged · no bare rejects）remain binding for any future prove claim.

## What this PASS is not

- ≠ coding authorization
- ≠ covered / UC-052 covered
- ≠ Line B nail
- ≠ dual（mw-privacy-int still required）
- ≠ post-prove · ≠ releaseEvidence · ≠ HA

## Blockers

None for docs re-pre-exec.

## Conditions

1. PASS 仅对 `a24382b` 重写文本；不复活 `a1a06ab` 的实现授权。
2. 禁止第二实现 / 新 proof 文件 / 改 `checkpoint-principal.ts` / 改本 proof。
3. 负例合同保持：`42501` · `claimed=false` · `unchanged` · 非裸 `rejects()`。
4. `retention_pending` 是 pin，不是完成证据。public DELETE 保持 503。coveredCount 保持 8。
5. 不代签 mw-privacy-int。alone ≠ dual。

## 三行中文摘要

1. `a24382b` 仅改 harness/slice 文档；已在 origin 且为 tip 祖先；行号与 tip proof L750–758 / L763–776 / L780–804 完全一致。
2. NOTE 已退役为实现刀；禁第二实现与 principal 编辑；保留 42501 + 无写入 + `retention_pending` pins。
3. 去掉 Line B nail 等待语不构成开工许可（刀已退役）；本 PASS ≠ coding ≠ covered ≠ nail；alone ≠ dual。

Verdict: PASS

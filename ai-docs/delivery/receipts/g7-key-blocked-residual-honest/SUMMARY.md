# SUMMARY（P5）— G7 Key-blocked residual honest receipts（Line AD · Branch A + B′ · NAIL · `post_prove_dual_pass` · 2026-10-06）

**Line**: **AD** · implementer **mw-core** / meetwise-core · Ban live · Ban Meridian · Ban buy cloud · Ban secrets/`.env*` · Ban force-push · Ban `g7SuiteGreen=true` · Ban washing Key-blocked as pass · Ban wash suite green · Ban claim suite green/HA
**Lifecycle**: **`post_prove_dual_pass`**（EXIT **1/1/1** Key-blocked · ≠ suite green · ≠ R1 closed · ≠ HA · Key-blocked ≠ pass · P1–P5≠gate R1）
**Branch**: **A**（docs residual ledger citing Line AC）**+ B′**（re-attest ×1 · tip moved past `416b6a5`）
**REQUEST**: `f32f56d8f602b9bf9aaa9f708ddbb59d7cef973f`（parent `416b6a5b5c71d97a1816974c2b174dbf4b9c8cb8`）
**PRE dual**: **BOTH PASS** · mw-e2e-ha @ `f2154387df654b4600b74b4c8a52c1d35f5986b2`（REQUEST `REQUEST-2026-10-06-g7-key-blocked-residual-pre-mw-e2e-ha.md`）+ mw-model-op @ `2d422c14e585c544a162f536cc9b3058a7d14e30`（`2026-10-06-g7-key-blocked-residual-honest-pre-exec-mw-model-op.md` · C-MO-AD-1..9）
**POST dual**: **BOTH PASS** · mw-e2e-ha @ `ea00c936a032fc7334d46762c33709b6dbe016bb`（PASS · honesty of Key-blocked residual · EXIT 1/1/1）+ mw-model-op @ `c4bc83679eaac6ec92c257c4739d4a31dc9d2e49`（PASS · Key-blocked residual 1/1/1 · C-MO-AD-3 direct probe · `.env` absence non-blocker note）
**Nail worktree**: `/workspace/meetwise-lineAD-nail` · branch `line/ad-g7-key-blocked-residual-nail`
**CODE_SHA**: **none**（docs-only · zero script / package / lockfile change · Ban editing `run-e2e*.mjs`）
**Execution HEAD（re-attest + cite）**: **`880f14408dda9a9cb03737b811b6005d94c3a2dc`**（clean · = machine receipt `gitHead`）
**Receipts tip（PROVE_TIP cite target）**: **`f4981cb6f75d5710039915b47e063e9192248da0`**（receipts commit · rebased onto `350f7a4`, docs-only drift · re-attest ran at `880f144`; Ban claiming a later tip as the run tip）
**Prior nail（read-only · Ban rewrite）**: Line AC NAIL `3922b48` / `3922b4859f034f07d43ba9f9b443ac3d29b7687e` · prove tip **NAILED TO `7c818c5`** / `7c818c5fe2249cdac686aa2a0e58748b3c5dea68` · code `160c30c` / `160c30cac7a0a05106120949f337847b782647b7` · receipts `receipts/g7-env-gap-honest-fix/`（untouched）
**Worktree**: `/workspace/meetwise-lineAD` · branch `line/ad-g7-key-blocked-residual`
**package.json @ exec tip**: `e2e:isolated` **:260** · `e2e:ui:isolated` **:261** · `verify:e2e-performance` **:264**（AC historic `:251/:252/:255` retained in AC receipts）

> **Label disambiguation（C-MO-AD-6 / AUTHORIZE cond. 3）**: harness products R1–R5 are executed as **P1–P5**. **P1-product ≠ gate R1.** Gate **R1 OPEN**. Nothing here closes R1.

---

## P3 EXIT table（each CMD ×1 · keys stripped · Ban retry-to-green）

CMD form: `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm <cmd>`

| # | CMD | Start (CST) | End (CST) | EXIT | FAIL class · evidence |
|---|-----|-------------|-----------|------|-----------------------|
| 1 | `pnpm e2e:isolated` | 2026-10-06 13:05:31 | 13:05:42 | **1** | **Key-blocked** · DB+migrate 136 crossed · `assertionCount=null` · direct probe `E2E_FAILURE class=provider code=live_provider_key_missing` @ `run-e2e.mjs:43:52` |
| 2 | `pnpm e2e:ui:isolated` | 2026-10-06 13:05:53 | 13:06:03 | **1** | **Key-blocked** · stderr `E2E_FAILURE class=provider code=live_provider_key_missing` @ `run-e2e-ui.mjs:48:52` |
| 3 | `pnpm verify:e2e-performance` | 2026-10-06 13:06:08 | 13:07:15 | **1** | **Key-blocked（cascaded）** · build 0 · `migrate:prove` 0 · HTTP full E2E 1 · `e2e_performance_suite_failed:HTTP full E2E:exit=1` · steps 4–27 not_run |

**Trio EXIT: 1 / 1 / 1** — class unchanged vs Line AC（no drift）.

Supplemental（≠ trio）: direct probe EXIT 1/1（`P3-direct-probe-e2e-isolated.md`）· **CITE_EXIT 0/0** guard proofs `g6-e2e-iso-blocked` + `uc001:live-blocked`（EXIT 0 = gate present & blocked documented · ≠ e2e pass）.

Gate probes（`P3-gate-probes.md`）: bare session `groups=1000(box),997(orbitd)` · docker.sock `srw-rw---- root docker` · `docker info` exit 1 permission denied → under wrapper `gid=102(docker)` · `docker info` exit 0 · Server Version 26.1.5+dfsg1. Ambient `MODEL_API_KEY` was **set** and is **unset** under the exact CMD form（presence only · value never printed）· **`.env` / `.env.local` / `apps/api/.env` absent**（presence-only · contents never read）. **Required gate probe（model-op POST non-blocker carried into harness）**: future keys-stripped re-attest **must** assert those paths absent before CMD because `run-e2e.mjs:15–19` auto-loads `ROOT/.env` when present and could bypass `env -u MODEL_API_KEY -u MODEL_BASE_URL`.

## Products

| Product | File | Reading |
|---------|------|---------|
| P1 Key-gate static cite ledger | `P1-key-gate-cite-ledger.md` | file:line + blob @ `880f144`; static ≠ pass |
| P2 Residual classification | `P2-residual-classification.md` | env-gap cleared @ AC · Key-blocked OPEN · business-assert **unknown（null）** · not_run listed |
| P3 Re-attest ×1 + probes | `P3-gate-probes.md` · `P3-re-attest-e2e-isolated.md` · `P3-re-attest-e2e-ui-isolated.md` · `P3-re-attest-verify-e2e-performance.md` · `P3-direct-probe-e2e-isolated.md` | EXIT 1/1/1 honest |
| P4 Unlock ledger | `P4-unlock-ledger.md` | conditions only ≠ authorize |
| P5 SUMMARY | `SUMMARY.md`（this） | pins + non-claims |

## Calibrated pins（unchanged）

- **`g7SuiteGreen=false`**
- **trio OPEN 1/1/1**
- **Disclosure-1 OPEN**（`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` e2e default · never counts toward R1）
- **R1 OPEN**（`r1Closed=false`）
- **coveredCount=8** · Ban invent covered
- haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · ms3EqualsR4Closed=**false** · **PG-retained** · public DELETE=**503**
- **0 model calls** · **`actualSpendCny=null`** · no key fingerprint
- G6 OPEN · R5-MARKED-RED pgvector-legacy retained
- **PINS_OK: yes**

## ERRATUM（verbatim）

FreeTierOnly **观察**=`3424dc1` · **消除轮**=`82981ff` · Ban shorthand `quota-403=82981ff` · Ban `b1d7b22` @ 09-23 for that removal.

## SSOT

Authorized Line AD nail registers Key-blocked residual receipts on backlog / checklist / matrix（additive · **`g7SuiteGreen` stays false** · Ban flipping G7 green / R1 closed / Disclosure-1 closed）. Line AC receipts unchanged. Sibling Line AE/AF/AG/AH active knife files untouched（shared SSOT append only）.

## Line AD NAIL（`post_prove_dual_pass` · additive · 2026-10-06）

- Lifecycle advanced to **`post_prove_dual_pass`** by authorized nail（docs/SSOT honesty only · Ban coding · Ban live · Ban wash suite green · Ban `g7SuiteGreen=true`）.
- PROVE_TIP **NAILED TO** `f4981cb` / `f4981cb6f75d5710039915b47e063e9192248da0` · stubs `2e4a825` / `2e4a825bc1c77d5428bdab281dba4c4aaf6104f2` · exec HEAD `880f144` / `880f14408dda9a9cb03737b811b6005d94c3a2dc` · **PROVE_EXIT 1/1/1** · Key-blocked `live_provider_key_missing` · assertionCount=**null**.
- POST dual BOTH PASS: mw-e2e-ha `ea00c93` / `ea00c936a032fc7334d46762c33709b6dbe016bb` + mw-model-op `c4bc836` / `c4bc83679eaac6ec92c257c4739d4a31dc9d2e49`.
- Honesty: **Key-blocked ≠ pass** · **`g7SuiteGreen=false`** · Disclosure-1/R1 **OPEN** · P1–P5≠gate R1 · **0 model calls** · actualSpendCny=null · Ban live · Ban buy cloud · Ban wash suite green.
- **`.env` absence required gate probe**: future keys-stripped re-attest must assert `.env` / `.env.local` / `apps/api/.env` **absent**（presence-only · never read）because `run-e2e.mjs:15–19` auto-loads ROOT/.env when present and could bypass `env -u`.
- Pins unchanged: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · **PINS_OK: yes**.
- Keep siblings（Line AC Path A · AE/AF/AG/AH · Line U）.

## Non-claims

Not suite green · not trio green · not family green · not G7 closed · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not covered · not `releaseEvidence=true` · not live · not Key provisioning · not buy cloud · **Key-blocked ≠ pass** · `assertionCount=null` ≠ 0 failures · not_run ≠ pass · CITE_EXIT 0 ≠ e2e pass · P1-product ≠ gate R1 · unlock ledger ≠ authorization · `g7SuiteGreen=false` · alone ≠ dual · Ban wash suite green · Ban claim suite green/HA

---

*SUMMARY（P5）· Line AD G7 Key-blocked residual honest NAIL · 2026-10-06 · lifecycle post_prove_dual_pass · PROVE_TIP f4981cb · POST ea00c93+c4bc836 PASS · EXIT 1/1/1 Key-blocked · g7SuiteGreen=false · Disclosure-1/R1 OPEN · .env absence probe required · Ban wash suite green · Ban live · STOP*

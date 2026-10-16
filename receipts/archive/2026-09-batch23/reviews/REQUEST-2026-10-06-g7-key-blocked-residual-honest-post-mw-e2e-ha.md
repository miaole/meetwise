# Review — mw-e2e-ha — G7 Key-blocked residual honest POST-PROVE（Line AD · Branch A + B′ · honesty of Key-blocked red）

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · alone ≠ dual · 不代签 `mw-model-op`）
**Review date**: 2026-10-06 ~13:16 CST（Asia/Shanghai · UTC+8）
**Line**: **AD** · Branch **A**（docs residual ledger）**+ B′**（re-attest ×1）
**REQUEST**: `f32f56d` / `f32f56d8f602b9bf9aaa9f708ddbb59d7cef973f`
**PRE dual BOTH PASS**: mw-e2e-ha @ `f215438` / `f2154387df654b4600b74b4c8a52c1d35f5986b2` + mw-model-op @ `2d422c1` / `2d422c14e585c544a162f536cc9b3058a7d14e30`
**CODE_SHA**: **none**（docs-only · zero `apps/`/`packages/`/`scripts/`/`package.json` · Ban editing `run-e2e*.mjs`）
**Exec HEAD（re-attest run）**: `880f144` / `880f14408dda9a9cb03737b811b6005d94c3a2dc`
**PROVE_TIP（receipts）**: `f4981cb` / `f4981cb6f75d5710039915b47e063e9192248da0`
**Stubs tip（review base）**: `2e4a825` / `2e4a825bc1c77d5428bdab281dba4c4aaf6104f2`
**Independent re-run HEAD**: `2e4a825`（worktree `/workspace/meetwise-lineAD` · scripts blobs == `880f144` · Ban Meridian · Ban live · Ban `.env*` · Ban sudo/chmod/usermod · Ban retry-to-green · Ban `g7SuiteGreen=true` · Ban nail · Ban wash Key-blocked as pass）
**Receipts**: `ai-docs/delivery/receipts/g7-key-blocked-residual-honest/`（SUMMARY + P1 · P2 · P3×5 · P4）
**Harness**: `ai-docs/delivery/harness/g7-key-blocked-residual-honest.md`（execution addendum · P1–P5 rename）
**Prior nail（read-only）**: Line AC `3922b48` · prove tip NAILED TO `7c818c5` · code `160c30c`

本 PASS = Line AD Key-blocked residual 诚实收据半签（EXIT 1/1/1 无漂移）。**≠** suite green · **≠** nail · **≠** HA · alone ≠ dual。

---

## 1. Tip / ancestry / docs-only（独立核验）

| Check | Evidence | Ruling |
|-------|----------|--------|
| PROVE_TIP `f4981cb` docs-only | 10 paths · harness addendum + receipts P1–P5 · **+434** · **零** product/scripts | **PASS** · CODE none |
| Stubs tip `2e4a825` | cite PROVE_TIP + post stubs e2e-ha/model-op · docs-only | **PASS** |
| REQUEST `f32f56d` ancestor of tip | `merge-base --is-ancestor` **YES** | **PASS** |
| PRE e2e `f215438` · PRE model-op `2d422c1` | both ancestors | **PASS** |
| Exec `880f144` ancestor | **YES** · re-attest + cite HEAD | **PASS** |
| Script blobs @ WT == `880f144` | `run-e2e.mjs` `c655235cd3d7` · `run-e2e-ui.mjs` `aa86fb3f4219` · `run-e2e-isolated.mjs` `2e78877ca3f2` · `with-docker-session.sh` `0130fb466e57` | **PASS** · match |
| `.env*` on disk | **none**（name find only · contents never read） | **PASS** |
| Ban `g7SuiteGreen=true` in receipts | receipts pin `g7SuiteGreen=false` only · Ban wash language present | **PASS** |

Session probe（pre-wrapper）: `id` → `groups=1000(box),997(orbitd)`（docker **not** in session）· `getent group docker` → `docker:x:102:box` · `docker.sock` `srw-rw---- root docker` · ambient `MODEL_API_KEY` **set**（value never printed）. Under exact CMD form `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL …`: `gid=102(docker)` · Keys **unset** · `docker info` exit 0 · Server 26.1.5+dfsg1. Matches Path A / P3-gate-probes.

## 2. CMD | EXIT（独立重跑 ×1 · Ban retry-to-green · Keys stripped）

Exec form: `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm <cmd>`

| # | CMD | Start (CST) | End (CST) | EXIT | Evidence |
|---|-----|-------------|-----------|------|----------|
| 1 | `pnpm e2e:isolated` | 2026-10-06 13:14:34 | 13:14:45 | **1** | wrapper `sg docker` · DB boot + migrate **136** + pre-prove ready · `ISOLATED_POSTGRES_OUTPUT_WITHHELD` · receipt `outcome=failed` `exitCode=1` **`assertionCount=null`** · child stderr withheld by design（`run-e2e-isolated.mjs:1916-1917`） |
| 2 | `pnpm e2e:ui:isolated` | 2026-10-06 13:14:47 | 13:14:58 | **1** | DB+migrate 136 OK · stderr **`E2E_FAILURE class=provider code=live_provider_key_missing`** @ `scripts/run-e2e-ui.mjs:48:52` · R5-MARKED-RED pgvector-legacy retained |
| 3 | `pnpm verify:e2e-performance` | 2026-10-06 13:15:02 | 13:15:58 | **1** | suite @ `2e4a825` · web build **0** · `migrate:prove` **0** · HTTP full E2E **1** · `e2e_performance_suite_failed:HTTP full E2E:exit=1` · steps 4–27 **not_run** · inner receipt `assertionCount=null` |

**Trio EXIT（independent）: 1 / 1 / 1** · class **Key-blocked** · **no drift** vs implementer claim @ `880f144` / Line AC `7c818c5` · **≠** EXIT0 · **≠** suite green.

## 3. Direct probe · wrapper stderr disclosure · CITE_EXIT

| Probe | CMD | EXIT | Evidence |
|-------|-----|------|----------|
| PROBE-A | `E2E_ISOLATED=1 node scripts/run-e2e.mjs`（same wrapper · Keys stripped） | **1** | `E2E_FAILURE class=provider code=live_provider_key_missing` @ `run-e2e.mjs:43:52` |
| PROBE-B | `E2E_ISOLATED=1 pnpm e2e:prove` | **1** | same class · same frame `:43:52` |
| CITE g6 | `node scripts/g6-e2e-iso-blocked.proof.mjs` | **0** | NOTE blocked(无 Key) · ≠ live E2E · ≠ G6 closed |
| CITE uc001 | `node scripts/uc-e2e-001-live-blocked.proof.mjs` | **0** | NOTE blocked(无 Key) · ≠ covered · ≠ e2e pass |

- **Wrapper hide stderr disclosed**: static G4 `run-e2e-isolated.mjs:1916-1917`（`child.stderr.on('data', () => {})`）verified in WT · matches P1/P3-direct-probe · independent iso re-run emits no child `E2E_FAILURE` line（class via direct probe + UI stderr + `assertionCount=null`）.
- **CITE_EXIT 0/0 ≠ e2e pass**: guard proofs document gate present & blocked · Ban wash as trio/suite green · Ban invent covered.

## 4. P1–P5 · g7SuiteGreen · Disclosure / R1 · pins

| Item | Held? |
|------|-------|
| P1–P5 = harness product labels（≠ gate R1–R5） | **YES** · harness addendum + P1 header explicit · **P1-product ≠ gate R1** |
| Gate **R1 OPEN** · **Disclosure-1 OPEN** | **YES** · SUMMARY + P2 · `r1Closed=false` · tech-role fail-closed=0 never counts toward R1 |
| **`g7SuiteGreen=false`** | **YES** · RETAIN · Ban true · no receipt claims suite/trio/family green |
| `assertionCount=null` | **YES** · independent iso + perf-inner receipts · Ban as 0 failures |
| **0 model calls** · **`actualSpendCny=null`** | **YES** · Key gate before stack · Keys stripped |
| **coveredCount=8** | **YES** · Ban invent covered · zero SSOT flip |
| haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · ms3EqualsR4Closed=**false** · **PG-retained** · DELETE=**503** | **YES** |
| Class drift vs AC | **none**（Key-blocked all three）· non-class: migrations 135→136 recorded honestly |
| P4 unlock ledger | conditions only ≠ authorize · Ban live / Ban buy cloud held |

## 5. Blockers

**无阻塞。**

## Conditions

- **C-1（alone≠dual）**: 本 PASS = mw-e2e-ha 半签。须 `mw-model-op` 独立 post-prove PASS 后方构成 post dual；nail / SSOT / `g7SuiteGreen` 翻转须协调方另行授权。不代签 peer。
- **C-2（Key-blocked ≠ pass）**: EXIT 1/1/1 仍 OPEN；env-gap cleared **≠** suite green · **≠** nail · **≠** HA · **≠** covered。
- **C-3（iso stderr withheld）**: classification of `e2e:isolated` rests on (a) DB/migrate crossed · (b) `assertionCount=null` · (c) source `run-e2e.mjs:43` · (d) direct probe stderr · (e) UI stderr verbatim · (f) Keys unset. Ban inventing iso stdout class string.
- **C-4（Ban nail / Ban wash / Ban coding）**: 本 PASS 不授权 nail、不授权产品码、不授权重跑洗绿、不授权 `g7SuiteGreen=true`、不授权 live/buy cloud。
- **C-5（cite）**: 归档钉 PROVE_TIP `f4981cb` · exec `880f144` · stubs `2e4a825` · 本 post SHA（commit 后）；Ban 用后移 tip 冒充实跑 tip。

## Non-claims

PASS ≠ nail ≠ suite green ≠ trio green ≠ HA · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not covered（coveredCount=8）· not `releaseEvidence=true` · not live · not buy cloud · Key-blocked ≠ pass · CITE_EXIT 0 ≠ e2e pass · P1-product ≠ gate R1 · `assertionCount=null` ≠ 0 failures · `g7SuiteGreen=false` · alone ≠ dual · 不代签 mw-model-op

## 中文三行摘要

1. 独立重跑 stubs tip `2e4a825`（脚本 blob = exec `880f144`）：`with-docker-session.sh` + Keys stripped 下 trio CMD|EXIT = **1/1/1**；DB+migrate 136 已过；主因 Key-blocked `live_provider_key_missing`（UI `:48:52` · 直接探针 `:43:52` · iso stderr 被 wrapper 隐瞒已披露）。
2. CITE_EXIT 0/0（g6/uc001 live-blocked）仅证门在且 blocked · ≠ e2e pass；P1–P5 ≠ gate R1；`g7SuiteGreen=false` · Disclosure-1/R1 OPEN · `assertionCount=null` · 0 model · `actualSpendCny=null` · coveredCount=8；与 AC/AD 声称无 class 漂移。
3. Blockers 无；alone≠dual（待 mw-model-op 独立 post）；本 PASS ≠ suite green ≠ nail ≠ HA · Ban wash Key-blocked as pass。

Verdict: PASS

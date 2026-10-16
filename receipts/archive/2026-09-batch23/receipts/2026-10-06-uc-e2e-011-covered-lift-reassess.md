# Receipt — **UC-E2E-011 covered-lift-reassess**（Line AF · Branch A docs hand-calc · honest non-flip）

**Status**: **`post_prove_dual_pass`**（Branch A hand-calc done · post-prove dual BOTH PASS · `GAP-UC011-COVERED-LIFT-REASSESS` **CLOSED as honest non-flip assessment only** · Dual PASS ≠ invent covered · Ban Branch B）
**Date**: 2026-10-06 ~13:16 CST（Asia/Shanghai · UTC+8） · nail lifecycle recorded
**Line**: **AF**
**Knife**: `harness/uc-e2e-011-covered-lift-reassess.md` · slice `uc-e2e-011-covered-lift-reassess.slice.md`
**Gap id**: `GAP-UC011-COVERED-LIFT-REASSESS` · **CLOSED as honest non-flip assessment only**（≠ UC-011 covered · Ban invent covered · Ban SSOT flip to covered · Ban closing ADV/audit/amount residuals）
**Branch**: **A only**（docs hand-calc · **Zero CMD** · Ban Branch B gatherer/prove script · Ban live · Ban buy cloud · Ban Meridian · Ban secrets / `.env*`）
**PRE BOTH PASS**: mw-e2e-ha `f215438` / `f2154387df654b4600b74b4c8a52c1d35f5986b2`（AD-AH dual half · includes `REQUEST-2026-10-06-uc011-covered-lift-reassess-pre-mw-e2e-ha.md`）· mw-model-op `e3c887b` / `e3c887b0ea55631b0df691820c63618caa1ab3e2` · REQUEST `3dca5de` / `3dca5decfe69c81f1ef5cf58428834d95b2b59d9`
**AUTHORIZE**: Line AF · PRE BOTH PASS · Branch A · **canHonestlyFlip=false** · Ban fake flip
**PROVE tip**: `350f7a4` / `350f7a482bd85ccd05c41c62edfd98996f9a9506`
**POST dual BOTH PASS**: mw-e2e-ha `ac590ab` / `ac590ab7b513a9b776c6a6399eb2eb75258e9582` · mw-model-op `e38a7c4` / `e38a7c43d64879fa59467d31d4c4d068af677c96`
**NAIL tip**: **本 commit**（【NAIL · Line AF】· fill after commit）
**Lifecycle**: `post_prove_dual_pass`
**Style mirror**: `harness/uc-e2e-018-covered-lift-reassess.md` · evaluator `scripts/lib/uc-covered-evaluator.mjs`（**read-only** · Ban edit）
**Executed by**: `mw-core`（meetwise-core · Ban self-nail · Ban message meetwise）

## Pins（frozen · Ban flip）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| UC-E2E-011 | **partial**（stays · Ban flip SSOT） |
| `canHonestlyFlip` | **false**（computed hand-calc · Ban fake flip） |
| `GAP-UC011-ADV-01` | **CLOSED（wired）** ≠ covered · Ban reopen |
| 残余 ① | audit **absent**（retained · Ban wash） |
| 残余 ② | **amount explicit recheck / AMT DISCLOSED**（retained · Ban wash · Ban 改口「已实现金额复核」） |

## Non-claims

EXIT0 ≠ covered · closed(wired) ≠ covered · Ban invent covered · Ban flip SSOT matrix/backlog/checklist · Ban Branch B · Ban self-nail · Ban Meridian · Ban buy cloud · Ban secrets / `.env*` · Ban force-push · Ban touch Line AD/AE/AG/AH · Ban live · Ban retry-to-green · Ban rewrite prior nails · Ban HA · Ban `releaseEvidence=true`

---

## 0. Tip-reachable cites（Ban invent unreachable as live cites）

| Role | Tip-reachable SHA（full） | Note |
|------|--------------------------|------|
| Main-mouth feat（wire） | `40a4f6c` / `40a4f6c2acba905165d269d7318c2351e1be5ecb` | Prefer over unreacheable `2535b31` |
| Post-prove dual mirrors | `a8873d0` / `a8873d039e1eeda0b0e773b78c9d1a43a58d0382` · `b236be8` / `b236be883efeb30a26ef0636245d52b8aaaad427` | Prefer over unreacheable `275ba7d` / `a0f77f0` |
| Main-mouth nail | `5aae104` / `5aae10424277e68edb51c314b00e753e08a20d29` | CLOSED(wired) ≠ covered · Prefer over unreacheable `cf34390` |
| Line Z Path A prove tip | `244b812` / `244b81248d33bb85110a5304fff1f3d56de8563a` | EXIT0 · 41/41 · EXIT0≠covered |
| Line Z Path A CODE | `bf1fdb2` / `bf1fdb22674d10fc5ab7fb827a7da11def97fd1f` | mouth `POST /commerce/webhook/refund/:id` |
| Line V honesty-of-red tip | `79825b2` / `79825b206d068aea0ef200ae8f5c4f92e85642d6` | EXIT1 retained · Ban wash |
| Line V honesty-of-red CODE | `3d113c8` / `3d113c872455375d81d84de48b7d806eb42b2dd4` | Ban wash 404=pass |
| PRE e2e-ha | `f215438` | PASS |
| PRE model-op | `e3c887b` | PASS |
| REQUEST | `3dca5de` | docs-only pre_dual |

**Non-blocker（inherited · model-op PRE §5）**: harness/SSOT may still *print* unreacheable CODE `2535b31` / prove `cf34390` / dual `275ba7d` as historical narrative — **do not cite those as live objects**. Tip-reachable equivalents above stand for AUTHORIZE/exec. Does **not** overturn `canHonestlyFlip=false`.

---

## 1. Evaluator true-branch（read-only cite · Ban edit）

From `scripts/lib/uc-covered-evaluator.mjs`:

- `:236` `export function evaluate(input)`
- `:246` `const requiredMap = input.requiredNhp || UC018_REQUIRED_NHP` → UC-011 may override requiredNhp
- True branch (`:280–288`): **all six columns** `meetsCovered` **AND** `section11.businessPathMet === true` **AND** `openGaps` is explicit `[]` **AND** `section11.status === 'covered'` **AND** `reasons.length === 0`
- Column refuse enums (`REFUSE_REASONS`): `STATUS-NOT-COVERED` · `CASE-ONLY` · `MISSING-NHP` · `S11-NOT-MET` · `OPEN-GAP` · (+ PERF-LOCAL-ONLY / MISSING-RECEIPT / … when prove flags absent)
- Branch A: **hand-calc** maps matrix/NHP/§1b/residuals into those enums · **Zero CMD** · Ban Branch B gatherer

UC-011 requiredNhp map used for this hand-calc:

```
NEG:  ['NHP-011-NEG-01']
FAULT:['NHP-011-FAULT-01']
BOUND:['NHP-011-BOUND-01']
ADV:  ['NHP-011-ADV-01']
PERF: []          → MISSING-NHP (no NHP-011-PERF-*)
LOAD: ['NHP-011-LOAD-w-01']
```

---

## 2. Six-column hand-calc table（mapped to evaluator rules）

Sources（read-only）:

- matrix §1.0.1 `:117` · §1.0.2 PERF/LOAD `:148` · §1.1 `:175` · P1-2 `:270`
- NHP `non-happy-path-perf-load-case-matrix.md:55–59`
- §1b `harness/uc-e2e-011-report-refund.md:63–74`
- Prior nails: Line V honesty-of-red `79825b2`/`3d113c8` · Line Z Path A `244b812`/`bf1fdb2` · Line V-main nail `5aae104` · feat `40a4f6c` · dual mirrors `a8873d0`/`b236be8`

| Column | Matrix / NHP status | Named NHP | Non-blind? | meetsCovered? | Primary refuse reason(s)（evaluator enum） | Evidence read |
|--------|---------------------|-----------|------------|---------------|-------------------------------------------|---------------|
| **NEG** | **partial**（`:117`） | NHP-011-NEG-01 **partial**（`:55`） | YES（partial） | **NO** | `STATUS-NOT-COVERED` | quarantine 后误退 partial · ≠ covered |
| **FAULT** | **partial** | NHP-011-FAULT-01 **partial**（`:56`） | YES | **NO** | `STATUS-NOT-COVERED` | 面试失败→released+额度净 0 partial · ≠ covered |
| **BOUND** | **partial**（幂等误 release） | NHP-011-BOUND-01 **partial**（`:57`） | YES | **NO** | `STATUS-NOT-COVERED` | already_confirmed partial · ≠ covered |
| **ADV** | **gap** / `case-only`（措辞保留） | NHP-011-ADV-01 gap→case-only（`:58`） | case-only / gap | **NO** | `CASE-ONLY` · `STATUS-NOT-COVERED` | `GAP-UC011-ADV-01` **CLOSED(wired)** @ nail `5aae104` · feat `40a4f6c` · dual mirrors `a8873d0`/`b236be8` · **closed(wired) ≠ column covered** · Ban 借 wired 抬列 |
| **PERF** | PERF_api **blind**（`:148`） | **无** NHP-011-PERF-* | **NO** | **NO** | `MISSING-NHP` · (+ blind → `STATUS-NOT-COVERED` / happy-path class) | 无具名 PERF NHP · 无容量代表收据 · UC-018 precedent |
| **LOAD** | LOAD_worker **blind**（`:148`） | NHP-011-LOAD-w-01 blind→case-only（`:59`） | **NO** | **NO** | `CASE-ONLY` · `STATUS-NOT-COVERED` | 并发失败退款风暴 / 无双退 · 无并发退款/对账负载收据 |
| **§1.1** | **partial**（`:175`） | — | — | businessPathMet=**false** | `S11-NOT-MET` · `OPEN-GAP` | §1b #2–#6 OPEN/须重读 + 残余 ①② |

**§1b inventory（逐项 · Ban 一揽子 DONE）**

| # | Item | Status | Note |
|---|------|--------|------|
| 1 | refund-callback 产品口 | **DONE（Path A + 主口）** | Path A `244b812`/`bf1fdb2` · 主口 nail `5aae104` / feat `40a4f6c` · EXIT0≠covered |
| 2 | balance-ui | **OPEN** | TC-E2E-011-balance-ui · GAP-UC011-BALANCE-UI |
| 3 | fail HTTP mouth / full.e2e | **OPEN** | GAP-UC011-FAIL-HTTP-MOUTH / GAP-UC011-FULL-E2E |
| 4 | regenerate（UC-019） | **OPEN** | 另 UC · Ban 一揽子 |
| 5 | `GET /wallet` 或 ADR | **OPEN** | GAP-UC011-WALLET |
| 6 | sole-stack 夹具 | **须重读** | 原文 MySQL+Qdrant · **PG-retained ADR** 下重读 · **Ban cutover** |

**Residuals（Ban wash closed）**

| # | Residual | Status | Wording（UC-011） |
|---|----------|--------|-------------------|
| ① | 审计 | **OPEN-GAP** · absent | 主口+管道 GuardrailHit/安全日志 emit 点 **absent**（AUDIT-OBSERVATION: absent · disclosed-not-blocking · 审计接线=另刀 · Ban 假称已接） |
| ② | 金额显式复核 | **OPEN-GAP** · AMT DISCLOSED | **amount explicit recheck / AMT DISCLOSED**：白名单无金额通道 + 服务器权威 units 红冲 · 显式服务端金额复核比较路径不存在 · 属新刀 · Ban 改口「已实现金额复核」· **Ban** name collision with career-path / UC004 A3 |

---

## 3. Computed conclusion

| Field | Value |
|-------|-------|
| **canHonestlyFlip** | **false** |
| **allColsMet** | **false**（0/6 meetsCovered） |
| **section11.businessPathMet** | **false** |
| **section11.status** | **partial** ≠ covered |
| **openGaps** | non-empty（§1b #2–#6 + 残余 ①② + column gaps） |
| **reasons** | non-empty → invariant forces `canHonestlyFlip=false` |

### Top refuse reasons（enums）

1. **`MISSING-NHP`** — PERF 无 NHP-011-PERF-*（primary · UC-018 precedent twin）
2. **`CASE-ONLY`** — ADV column gap/`case-only` · LOAD NHP-011-LOAD-w-01 blind→case-only
3. **`STATUS-NOT-COVERED`** — NEG/FAULT/BOUND/ADV/PERF/LOAD none literally `covered`
4. **`S11-NOT-MET`** — §1.1 stays **partial** · businessPathMet≠true
5. **`OPEN-GAP`** — §1b #2–#6 + residual ① audit absent + residual ② amount explicit recheck / AMT DISCLOSED

**Even if a future Branch B compute returned true**: this knife **Ban flip** SSOT（翻行须另刀 + 双审 + 协调方授权）.

---

## 4. Explicit blocker list（mirrors PRE model-op §3 gaps 1–12）

| # | Remaining gap / refuse | Cite | Flip would need (falsifiable) |
|---|------------------------|------|-------------------------------|
| 1 | **PERF_api blind** | matrix `:148` · harness §2 | Named NHP-011-PERF-* + non-blind prove EXIT0 meeting criterion · else `MISSING-NHP` |
| 2 | **LOAD_worker blind**（并发退款风暴 / 无双退收据） | NHP `:59` · matrix `:148` | NHP-011-LOAD-w-01 non-blind evidence · not case-only |
| 3 | **ADV column** gap/`case-only` | matrix `:117` ADV · NHP `:58` · CLOSED(wired) @ `5aae104`/`40a4f6c` ≠ column covered | Column meetCovered under evaluator（not just GAP wired close） |
| 4 | **NEG/FAULT/BOUND partial** | NHP `:55–57` · matrix `:117` | Each column status covered + required NHP meetCovered |
| 5 | **§1b #2 balance-ui** | report-refund harness `:63–74` | Product + prove path EXIT0 for balance-ui |
| 6 | **§1b #3 fail HTTP / full.e2e** | same | Fail-mouth or full.e2e entitlement rollback evidence |
| 7 | **§1b #4 regenerate (UC-019)** | same | UC-019 closed-loop evidence（separate UC） |
| 8 | **§1b #5 wallet ADR/落地** | same | `GET /wallet` or ADR demote accepted |
| 9 | **§1b #6 sole-stack** | same · PG-retained ADR · Ban cutover | Honest re-read under PG-retained（≠ MySQL cutover wash） |
| 10 | **Residual ① audit absent** | matrix `:117` / nail residual area | Audit wiring knife + emit evidence（not disclosed-absent） |
| 11 | **Residual ② amount explicit recheck / AMT DISCLOSED** | AMT DISCLOSED · no server amount compare path | New knife implementing + proving explicit recheck（Ban 改口「已实现」· Ban UC004 A3 name collision） |
| 12 | Historical **`uc011:adv:prove` EXIT 1** honesty-of-red | `79825b2` / `3d113c8` · Ban wash | Retained red · not a flip enabler |

---

## 5. Branch A deliverables（this tip）

| Artifact | Path |
|----------|------|
| Receipt（this file） | `ai-docs/delivery/receipts/2026-10-06-uc-e2e-011-covered-lift-reassess.md` |
| Harness status → `post_prove_dual_pass` | `ai-docs/delivery/harness/uc-e2e-011-covered-lift-reassess.md` |
| Slice status → same | `ai-docs/delivery/uc-e2e-011-covered-lift-reassess.slice.md` |
| Post dual `mw-e2e-ha` PASS | tip `ac590ab` · `reviews/REQUEST-2026-10-06-uc-e2e-011-covered-lift-reassess-post-prove-mw-e2e-ha.md` |
| Post dual `mw-model-op` PASS | tip `e38a7c4` · `reviews/2026-10-06-uc-e2e-011-covered-lift-reassess-post-mw-model-op.md` |

**CMD**: **none**（Branch A · Zero CMD · Ban live · Ban Branch B `pnpm uc011:covered-lift-reassess:prove`）

**SSOT（nail registration · honest non-flip only）**: matrix / checklist / backlog append Line AF reassessment note · **status stays partial** · coveredCount stays **8** · Ban flip UC-011 / §1.1 / P1-2 to covered · Ban closing ADV gap or residuals as covered

---

## 6. Honesty footer（nail · post_prove_dual_pass）

canHonestlyFlip=**false** · coveredCount=**8** · UC-011 stays **partial** · EXIT0≠covered · closed(wired)≠covered · refuse five retained · GAP-UC011-COVERED-LIFT-REASSESS **CLOSED as honest non-flip assessment only** · Ban fake flip · Ban invent covered · Ban wash residuals · Ban Branch B · Ban Meridian · Ban buy cloud · Ban secrets · Ban force-push · Ban claim HA · Ban next REQUEST · alone≠dual · Dual PASS ≠ invent covered · PROVE_TIP 350f7a4 · POST dual ac590ab+e38a7c4 · STOP

*Receipt · Line AF · UC-E2E-011 covered-lift-reassess · Branch A hand-calc · 2026-10-06 ~13:16 CST · post_prove_dual_pass · CLOSED as honest non-flip assessment only · Ban fake flip*

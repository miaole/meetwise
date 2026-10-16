# POST-PROVE · Line AN-PRIV-EXT · GAP-PRIV-EXTERNAL-SINK-RETENTION · mw-e2e-ha

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · Ban self-nail · alone ≠ dual · **不代签** peer `mw-privacy-int` · 不替代 privacy review）
**Review date**: 2026-10-06 ~20:35 CST（Asia/Shanghai · UTC+8）
**Line**: **AN-PRIV-EXT**（wave AN）
**PROVE tip（docs receipt）**: `4b06058`（`4b06058be576e52903d213ace29c5c984e7cc7e2`）· docs(receipt) · **docs-only** atop CODE_SHA · awaiting_post_prove_dual
**CODE_SHA（§1 pre-declare · before any run）**: `9e2abd0`（`9e2abd04083eca464817e35687595c706cbcd2a9`）· feat(privacy) 0137 guard + `uc052:external-sink-retention:prove` · **product knife**
**Tip vs product mapping**: tip `4b06058` = receipt/harness/logs only（16 files · zero product）；`git merge-base --is-ancestor 9e2abd0 4b06058` ✔ · product-identical for prove runs → **independent re-runs at CODE_SHA `9e2abd0`**（disclosed）
**REQUEST pin**: `59e2189`（`59e21898fd29c8d64897e7414a228c379568e3e6`）
**PRE (this side)**: `512cc5d`（`512cc5d667674a8cc479b60b3532be87f5e8cd91` · PASS docs gate · C-1..C-6）
**Peer PRE**: privacy-int `fb6fca2`（`fb6fca2ada0b9afeec974f646242a4b9d7783026`）— **cite only · NOT co-signed** · peer POST is `mw-privacy-int` separately · alone ≠ dual
**Independent re-run**: detached HEAD @ CODE_SHA `9e2abd0` · `./scripts/with-docker-session.sh` · Ban Meridian · Ban buy cloud · Ban `.env*` · Ban git config · Ban force-push · Ban product coding · Ban invent MUT · Ban nail · Ban invent covered/erased/completed · Ban count-as-erased · Ban wash Line B internals as external close · Ban retry-to-green · DELETE=503

本 PASS = 独立复跑半签。**≠** covered · **≠** nail · **≠** HA · **≠** erased · **≠** completed · EXIT0 ≠ covered · alone ≠ dual · gap `:64` stays **OPEN** · canHonestlyFlip=**false**.

---

## 0. §1 PRE-DECLARE（before any run）

```
CODE_SHA=9e2abd04083eca464817e35687595c706cbcd2a9
TIP=4b06058be576e52903d213ace29c5c984e7cc7e2 (docs-only receipt atop CODE_SHA; product-identical for runs)
REQUEST=59e21898fd29c8d64897e7414a228c379568e3e6
PRE=512cc5d667674a8cc479b60b3532be87f5e8cd91
PEER_PRE=fb6fca2ada0b9afeec974f646242a4b9d7783026 (cite only; NOT co-sign)
```

Re-run porcelain: `HEAD == 9e2abd0` · clean · migrations applied=137 · latest=`0137_privacy_external_sink_confirmation_guard.sql`.

## 1. Docs / anchors（read-only spot-check）

| Check | Result |
|-------|--------|
| REQUEST `59e2189` docs-only（harness+slice+2 stubs） | ✓ |
| PRE `512cc5d` PASS · C-1..C-6 | ✓ carry |
| Peer PRE `fb6fca2` cited · not co-signed | ✓ |
| Product `0137` present on CODE_SHA | ✓ `packages/db/migrations/0137_privacy_external_sink_confirmation_guard.sql` |
| 0137 = 0091 guard verbatim + fail-closed（oss/redis/langfuse need resolve-audited `external_confirmed`；direct-write ≠ purge） | ✓ L45–55 `privacy_erasure_request_external_unconfirmed` 55000 |
| 0091 L516–545 completed guard + receipt_kind enum / resolve | ✓ read-only |
| `privacy.service.ts:53-56` `eraseInterviewData` → 503 | ✓ DELETE=503 held |
| backlog `gap-bug-backlog.md:64` GAP-PRIV-EXTERNAL-SINK-RETENTION | ✓ **OPEN** · canHonestlyFlip=false · zero SSOT flip this knife |
| Named CMD `pnpm uc052:external-sink-retention:prove` | ✓ package.json @ CODE_SHA |

## 2. CMD + EXIT table（independent · attempt #1 each · Ban retry）

| # | CMD | SHA | Start → End（CST） | EXIT | Notes |
|---|-----|-----|-------------------|------|-------|
| **A1** | `./scripts/with-docker-session.sh pnpm uc052:external-sink-retention:prove` | `9e2abd0` | 20:32:38 → 20:32:50 | **0** | 10 cases + C-CASECOUNT all PASS · `gapStatus=OPEN` · `canHonestlyFlip=false` · `publicDelete=503` · externals `retention_pending` · EXT-DEL-01 httpStatus=503 |
| C-3(c) | `./scripts/with-docker-session.sh pnpm privacy-erasure:http:prove` | `9e2abd0` | 20:32:54 → 20:33:37 | **0** | pass_count=19 fail_count=0 · DELETE 503 assertions in proof（paused/replay/stillPaused） |
| R1 | `pnpm uc052:internal-erasure:prove` | `9e2abd0` | 20:33:41 → 20:33:53 | **0** | regression only · ≠ this knife evidence · Ban wash Line B |
| R2 | `pnpm privacy-authorization:prove` | `9e2abd0` | 20:33:53 → 20:34:05 | **0** | F1 sanctioned path still green under 0137 |
| R3 | `pnpm uc052:checkpoint-physical:prove` | `9e2abd0` | 20:34:05 → 20:34:17 | **0** | |
| R4 | `pnpm int-transcript-remaining-sinks:prove` | `9e2abd0` | 20:34:17 → 20:34:30 | **0** | local-only still reaches completed |

Docker: `with-docker-session` → `sg docker` · isolated PG · MODEL_API_KEY not loaded · Ban live · `releaseEvidence=false`.

### A1 per-case（independent stdout @ `9e2abd0`）

```
PASS  EXT-RP-01 · req=pending_external · externalsRp=true · externalReceiptKinds=[] (N2)
PASS  EXT-NEG-01 · 55000:privacy_erasure_request_incomplete_targets
PASS  EXT-NEG-02 · 55000:privacy_erasure_request_external_unconfirmed
PASS  EXT-NEG-02B · 55000:privacy_erasure_request_external_unconfirmed
PASS  EXT-NEG-03 · 55000:privacy_erasure_request_external_unresolved
PASS  EXT-NEG-06 · 40901:privacy_authorization_receipt_not_pending
PASS  EXT-NEG-04 · directExternalConfirmed(resolved_at=NULL) → 55000 unconfirmed
PASS  EXT-NEG-05 · 40901×3 · receipts unchanged · externalsRp=true
PASS  EXT-POS-01 · resolve audit works · target stays retention_pending · req≠completed
PASS  EXT-DEL-01 · httpStatus=503
PASS  C-CASECOUNT · all 10 present
```

Matches claimed attempt1 EXIT0 · 10 cases + C-CASECOUNT.

## 3. MUT −0137（Ban invent coding · verify receipt · discarded）

| Check | Ruling |
|-------|--------|
| Implementer scratch `8a571cc`（`8a571cc1d7ab9dbca1f4851c70d101e0d85274dd`） | SCRATCH MUT never-push · drops 0137 only |
| On `origin/feat/mysql-schema-skeleton`? | **No** · `git merge-base --is-ancestor 8a571cc origin/...` fails · local object only |
| Implementer MUT log（tip `4b06058` `logs/MUT-1-scratch-minus-0137.log`） | **EXIT=1** · FAIL EXT-NEG-02 / EXT-NEG-02B / EXT-NEG-04 · `err=NO_ERROR inTxn=completed` on bare 0091 · **non-vacuous** |
| Product 0137 on CODE_SHA | **present** · migrations applied=137 includes 0137 |
| This review | **Ban invent coding** · did **not** recreate MUT · did **not** push MUT · verify-only against implementer receipt |

## 4. Gap / honesty / C-1..C-6 carry

| Item | Ruling |
|------|--------|
| backlog `:64` GAP-PRIV-EXTERNAL-SINK-RETENTION | **OPEN** |
| canHonestlyFlip | **false** |
| Ban count-as-erased · Ban invent completed · Ban invent erased | **held** · prove JSON `countAsErased=false` · externals stay `retention_pending` · request ≠ completed |
| Ban wash Line B internals as external close | **held** · R1 recorded as regression ≠ knife evidence |
| DELETE=503 | **held** · EXT-DEL-01 + http:prove + service throw 503 |
| coveredCount=8 · NOT_HA · EXIT0≠covered | **held** |
| C-1 alone≠dual · peer not co-signed | **held** |
| C-2 PASS≠coding≠nail≠erased≠completed≠covered | **held** |
| C-3 named CMD + red paths a/b/c | **held** · independent A1 greens on 0137；MUT receipt shows bare 0091 red |
| C-4 locus 0091 receipt + resolve；direct `external_confirmed` ≠ purge | **held** · EXT-NEG-04 / EXT-POS-01 |
| C-5 attempts pre-declared · 1 attempt · Ban retry-to-green | **held** |
| C-6 pins frozen · gap OPEN | **held** |

## 5. Hard pins（restated · 不改）

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · public DELETE=**503** · g7SuiteGreen=**false**

## Ban lines（mirrored）

Ban nail until BOTH POST dual + AUTHORIZE · Ban count-as-erased · Ban invent completed/erased/covered · Ban wash Line B internals as external close · Ban open DELETE · Ban self-approve · alone ≠ dual · Ban Meridian · Ban buy cloud · Ban secrets/`.env*` · Ban force-push · Ban invent MUT coding · EXIT0 ≠ covered ≠ HA ≠ gap close

## Blockers

**无阻塞。**

## Non-claims

PASS ≠ nail ≠ covered ≠ HA · EXIT0 ≠ covered · EXIT0 ≠ external purged · EXIT0 ≠ completed · alone ≠ dual · 不代签 peer · gap `:64` stays OPEN · canHonestlyFlip=false · DELETE stays 503 · Ban nail until BOTH

## 中文三行摘要

1. tip `4b06058` 为 docs-only 收据；产品 CODE_SHA `9e2abd0` 已预声明并独立复跑：主 prove EXIT0（10+C-CASECOUNT）· http:prove EXIT0（DELETE 503）· 四回归 EXIT0。
2. MUT −0137 依实现方 never-pushed scratch `8a571cc` 收据核实为非空 EXIT1（NEG-02/02B/04）；产品 0137 在 CODE_SHA 存在且 MUT 未入 origin；本审未发明 MUT 编码。
3. gap `:64` OPEN · canHonestlyFlip=false · DELETE=503 · C-1..C-6 延续 · peer `fb6fca2` 仅 cite 不代签 · alone≠dual · pins 不动 · 本 PASS≠nail≠covered≠HA。

Verdict: **PASS**

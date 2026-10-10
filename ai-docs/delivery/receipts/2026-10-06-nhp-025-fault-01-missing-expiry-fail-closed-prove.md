# Receipt — **NHP-025-FAULT-01 · UC-025 FAULT missing-expiry fail-closed**（Line AA · NAIL · **`post_prove_dual_pass`** · row stays gap · FAULT column stays gap）

**Date**: 2026-10-06（Asia/Shanghai）
**Line**: **AA** · implementer `mw-core`（commit identity `meetwise-core`）
**Knife**: harness `harness/nhp-025-fault-01-missing-expiry-fail-closed.md` · slice `nhp-025-fault-01-missing-expiry-fail-closed.slice.md`
**Gap / Case**: `GAP-UC025-FAULT-01` · `NHP-025-FAULT-01` · NHP 序 #2 Missing expiry field fails closed
**REQUEST**: `448a33e2460f919b15af1db6c9c44497dc585b62`（docs-only pre_dual）
**PRE dual BOTH PASS**: mw-e2e-ha `fbd47ac8076d2ccd0a948b88630cb397789e3ef7` + mw-rag-route `986260120f5910606043b03fb66c6a742636f219`（ignore empty `454d6e9`）
**Authority**: coordinator meetwise — Line AA NAIL AUTHORIZED（docs/SSOT honesty only · Ban coding）· Ban wash B'' NEG · Ban wash W BOUND · Ban HA · Ban secrets / `.env*` · Ban force-push · Ban Meridian · Ban invent covered / coveredCount bump · Ban flip row/FAULT off gap · zero MODEL_API_KEY live calls

---

## Pins（unchanged）

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · public DELETE=**503** · canHonestlyFlip=**false**（本行）

**Row**: `UC-E2E-025` stays **gap** · FAULT 列 **未翻** · BOUND gap（W honesty） · ADV blind · NEG B'' CLOSED(wired) **frozen**（不重跑洗绿、不借 NEG/BOUND EXIT0 记 FAULT/整行 covered）

---

## C-1 disposal（supersede · written before/with code）

| 项 | 值 |
|----|----|
| Old C-1 | `expires_at` NULL 不得当过期拒 → 产品 fail-OPEN（当 fresh 放行） |
| **裁决** | **supersede** |
| 窄保留 | NULL **仍不得**抛 `stale_quiz`（NULL ≠ 有锚且过期）；NEG SELECT+throw 逐字节冻结 |
| supersede 行为 | begin+quiz-id + NULL/缺锚 → **409 `missing_quiz_expiry`** fail-closed |
| Where written | harness `nhp-025-fault-01-missing-expiry-fail-closed.md` §C-1 · slice coding pins · 本 receipt · 产品注释 |

## NaN policy

| 项 | 值 |
|----|----|
| 策略 | **fail-closed**（fold into same guard） |
| 触发 | `expires_at != null` 但 `Date(...).getTime()` = NaN |
| 错误 | 同 **409 `missing_quiz_expiry`** |
| Where | harness §NaN · prove R2 · 产品 `Number.isNaN(expiryMs)` 支 |

---

## HTTP / error pin（本刀钉死）

| 项 | 值 |
|----|----|
| HTTP status | **409 CONFLICT** |
| Body | `{ "error": "missing_quiz_expiry" }` |
| Trigger | begin 携带 `quiz-id` 且 `expires_at` IS NULL，或解析后 NaN |
| Ordering | 抛点先于 resume bind / `reserveEntitlement` / `enqueueInterviewJob`；顺序 NEG `stale_quiz` → FAULT `missing_quiz_expiry` → BOUND `resume_version_mismatch` |
| 正交 | ≠ `stale_quiz` · ≠ `resume_version_mismatch` |
| 无 quiz-id | 整块跳过 |

---

## Evidence shape（honest）

**in-process** · static inventory S + `InterviewService.begin` + recording fake DB R · **≠** isolated Postgres/HTTP E2E · **≠** covered · harness「隔离壳三层」本刀 **NOT run**

---

## SHAs

| 项 | 值 |
|----|----|
| PRE dual tip（start worktree） | `986260120f5910606043b03fb66c6a742636f219` |
| Runner-first（pre-wire · EXIT1） | `fe411fa6997f3d32a3cdcc629e840be238ed5792` |
| **CODE_SHA = PROVE tip（exact）** | `a8b98fcaaa8c314fd8e25437ff015f59dce05d93` |
| Code files | `interview.service.ts`（FAULT 独立块）· `uc-e2e-025-nhp-fault.proof.ts`（@ runner）· `package.json` / `apps/api/package.json`（@ runner） |
| Tree at prove | clean of AA product paths（symlinks local-only · not committed） |

---

## Prove runs

### Pre-wire honesty（runner tip `fe411fa` · product unwired）

CMD: `pnpm uc025:nhp-fault:prove` · Start `2026-10-06T00:32:24+08:00` · End `2026-10-06T00:32:26+08:00` (pre-rebase runner tip; post-rebase runner=`fe411fa`) · **EXIT=1** · `GAP GAP-UC025-FAULT-01 … unwired`

### Committed prove（CODE_SHA `a8b98fc`）

| CMD | Start (Asia/Shanghai) | End | EXIT |
|-----|------------------------|-----|------|
| `pnpm uc025:nhp-fault:prove` | `2026-10-06T00:33:35+08:00` | `2026-10-06T00:33:42+08:00` | **0** |
| `pnpm uc025:nhp-neg:prove` | same window | — | **0**（frozen · Ban wash · not FAULT evidence） |
| `pnpm uc025:nhp-bound:prove` | same window | — | **0**（Ban wash · not FAULT evidence） |

### FAULT output（committed · 原文要点）

```
PASS  S0..S6 (fault throw 409 missing_quiz_expiry · before bind/reserve/enqueue · orthogonal)
NOTE  NEG B'' stale block text present/untouched=true
NOTE  BOUND resume_version_mismatch throw present/untouched=true
PASS  R1-NULL-expires_at → 409 missing_quiz_expiry
PASS  R2-illegal-date-NaN → 409 missing_quiz_expiry
PASS  R3-positive-control(future-valid expiry) → reaches bind
PASS  R4-orthogonal-NEG(past expiry) → 409 stale_quiz
PASS  R5-no-quiz-id → reaches bind
HTTP_ERROR_PIN  status=409 CONFLICT · error=missing_quiz_expiry
ROW_STILL_GAP  … coveredCount=8
CMD=pnpm uc025:nhp-fault:prove EXIT=0
```

---

## Non-claims

EXIT0 ≠ covered ≠ FAULT column flip ≠ row flip · coveredCount stays **8** · Ban invent covered · Ban wash NEG/BOUND · **not isolated Postgres/HTTP E2E** · not HA · alone ≠ dual

## Line AA NAIL（`post_prove_dual_pass`）

- Post-prove dual BOTH PASS：mw-e2e-ha `c674cb543fa93f849d84224074c5a69fb68a741e` + mw-rag-route `42b98343faf338435c6297b3744d7b108490c57f`。
- Lifecycle advanced to **`post_prove_dual_pass`** by Line AA nail（cross-ref harness/slice/SSOT）。
- Prove tip NAILED TO: `3a6ec52195bbde8bd56cae10e48346391cee116d` · CODE `a8b98fcaaa8c314fd8e25437ff015f59dce05d93` · **FAULT EXIT0** · NEG/BOUND 仍 EXIT0 · pre-wire EXIT1 honest @`fe411fa`.
- HTTP **409** `missing_quiz_expiry` · NaN fail-closed · C-1 **supersede**（窄保留 NULL≠`stale_quiz`；缺锚→409）written into matrix/receipts.
- **Evidence layer MUST state**：in-process `InterviewService.begin` + fake DB · **≠ isolated Postgres/HTTP E2E** · **≠ covered** · harness three-layer isolated setup NOT run this knife（soft/aspirational · not hard blocker of this PASS）。若要 PG/HTTP-level FAULT 证据 → separate knife（本 nail 不得宣称）。
- **STILL_GAP**：UC-E2E-025 **row** stays **gap** · **FAULT column** stays **gap** · EXIT0≠covered · coveredCount=**8** · canHonestlyFlip=**false** · NEG B'' CLOSED(wired) **frozen** Ban wash · BOUND W Ban wash · ADV blind。
- Pins：NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · canHonestlyFlip=false · coveredCount=8。
- Keep siblings (Z/AB/AC nails) · Ban nail Z/AB/AC this turn.

## Pins reaffirm

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503

*Receipt · NHP-025-FAULT-01 · Line AA · prove EXIT=0 @a8b98fc · tip 3a6ec52 · post dual c674cb5+42b9834 PASS · lifecycle post_prove_dual_pass · evidence in-process+fake-db ≠ isolated PG/HTTP · row+FAULT gap · coveredCount=8 · Ban wash NEG/BOUND · Ban invent covered · STOP*

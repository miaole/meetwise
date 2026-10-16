# Review — mw-e2e-ha — NHP-025-FAULT-01 missing-expiry fail-closed · POST-PROVE（Line AA）

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · alone ≠ dual · 不代签 `mw-rag-route`）
**Review date**: 2026-10-06 ~00:35 CST（Asia/Shanghai · UTC+8）
**Line**: **AA** · `GAP-UC025-FAULT-01` / `NHP-025-FAULT-01` · Missing / NULL `expires_at` fail-closed
**REQUEST tip**: `448a33e` / `448a33e2460f919b15af1db6c9c44497dc585b62`（docs-only pre_dual）
**PRE dual BOTH PASS**: mw-e2e-ha `fbd47ac` / `fbd47ac8076d2ccd0a948b88630cb397789e3ef7` + mw-rag-route `9862601` / `986260120f5910606043b03fb66c6a742636f219`
**CODE**: `a8b98fc` / `a8b98fcaaa8c314fd8e25437ff015f59dce05d93`（feat · FAULT 独立块）
**PROVE tip / receipt tip**: `3a6ec52` / `3a6ec52195bbde8bd56cae10e48346391cee116d`（cite CODE_SHA=a8b98fc + re-prove EXIT=0）
**Pre-wire（honest EXIT1）**: `fe411fa` / `fe411fa6997f3d32a3cdcc629e840be238ed5792`（runner+harness · product unwired · no `missing_quiz_expiry`）
**Receipt**: `ai-docs/delivery/receipts/2026-10-06-nhp-025-fault-01-missing-expiry-fail-closed-prove.md`
**Independent re-run HEAD**: `3a6ec52`（detached `origin/feat/mysql-schema-skeleton` · Ban Meridian · Ban live · Ban `.env*` · Ban git config · Ban force-push · Ban product-code change · Ban retry-to-green · Ban nail · Ban invent covered · Ban wash NEG/BOUND · Ban HA · Ban narrate in-process as isolated PG/HTTP）

本 PASS = FAULT 面 missing-expiry fail-closed 可测真证据独立复核半签。**≠** covered · **≠** nail · **≠** HA · alone ≠ dual · EXIT0 ≠ covered · 不代签 `mw-rag-route`。

---

## 1. CODE / tip 独立核验

| Claim | Verified |
|-------|----------|
| CODE `a8b98fc` | **hit** · ancestor of PROVE tip · only `interview.service.ts`（+FAULT 独立块 · 409 `missing_quiz_expiry`） |
| PROVE tip `3a6ec52` | **hit** · `git rev-parse HEAD` = `3a6ec52195bbde8bd56cae10e48346391cee116d` · cites CODE_SHA=`a8b98fc` + re-prove EXIT=0 |
| REQUEST `448a33e` · PRE e2e `fbd47ac` · PRE rag `9862601` | **hit** · all ancestors of PROVE tip |
| Pre-wire `fe411fa` | **hit** · ancestor · product tree **lacks** `missing_quiz_expiry`（honest pre-wire EXIT1 path） |
| Receipt file | **hit** · `ai-docs/delivery/receipts/2026-10-06-nhp-025-fault-01-missing-expiry-fail-closed-prove.md` |
| FAULT independent of NEG/BOUND | **hit** · CODE inserts FAULT block **after** NEG `stale_quiz` · **before** BOUND `resume_version_mismatch`；独立错误码 |
| C-1 supersede | **hit** · comment + harness + receipt：NULL≠`stale_quiz` 窄保留 · fail-closed via `missing_quiz_expiry` |
| Prove registrations | **hit** · root `uc025:nhp-fault:prove` → `apps/api` `prove:uc025-nhp-fault` |

## 2. CMD | EXIT（独立重跑 ×1 each · Ban retry-to-green）

Exec @ detached tip `3a6ec52` / CODE `a8b98fc` · in-process（无 docker 必要；本刀 evidence ≠ isolated PG/HTTP）· Ban sudo/chmod/usermod · Ban live Keys · Ban read `.env*`。

| CMD | Start (CST) | End (CST) | EXIT |
|-----|-------------|-----------|------|
| `pnpm uc025:nhp-fault:prove` | `2026-10-06T00:34:59+08:00` | `2026-10-06T00:35:03+08:00` | **0** |
| `pnpm uc025:nhp-neg:prove` | `2026-10-06T00:35:06+08:00` | `2026-10-06T00:35:06+08:00` | **0**（frozen · Ban wash · not FAULT evidence） |
| `pnpm uc025:nhp-bound:prove` | `2026-10-06T00:35:06+08:00` | `2026-10-06T00:35:09+08:00` | **0**（Ban wash · not FAULT evidence） |

### FAULT stdout 要点（本审实测）

```
PASS  S0..S6 (fault throw 409 missing_quiz_expiry · before bind/reserve/enqueue · orthogonal)
NOTE  NEG B'' stale block text present/untouched=true (frozen · not FAULT evidence)
NOTE  BOUND resume_version_mismatch throw present/untouched=true (Ban wash · not FAULT evidence)
PASS  R1-NULL-expires_at → 409 missing_quiz_expiry
PASS  R2-illegal-date-NaN → 409 missing_quiz_expiry (NaN fail-closed folded)
PASS  R3-positive-control(future-valid expiry) → passes FAULT guard, reaches bind
PASS  R4-orthogonal-NEG(past expiry) → 409 stale_quiz (not missing_quiz_expiry)
PASS  R5-no-quiz-id → zero resume_quiz reads, behaviour unchanged, reaches bind
HTTP_ERROR_PIN  status=409 CONFLICT · error=missing_quiz_expiry
C1_DISPOSAL  supersede · NULL≠stale_quiz retained · fail-closed via missing_quiz_expiry
NAN_POLICY  fail-closed folded into missing_quiz_expiry
ROW_STILL_GAP  UC-E2E-025 FAULT column not flipped. BOUND gap · ADV blind · NEG frozen. coveredCount=8.
NOTE  service-level in-process evidence (fake DB client) ≠ HTTP/PG end-to-end ≠ covered ≠ nail ≠ HA
CMD=pnpm uc025:nhp-fault:prove EXIT=0
```

**CMD|EXIT ×3** = FAULT **0** · NEG **0** · BOUND **0**（各恰一次 · Ban retry-to-green）。

## 3. C-1 / NaN / HTTP / evidence-layer 检查

| Check | Required | Measured | Hit |
|-------|----------|----------|-----|
| C-1 supersede | NULL≠`stale_quiz` 窄保留 · fail-closed 独立码 | CODE comment + prove `C1_DISPOSAL` + R1/R4 正交 | **✓** |
| NaN policy | fail-closed · 同口同码 | R2 illegal-date → 409 `missing_quiz_expiry` · `NAN_POLICY` 行 | **✓** |
| HTTP pin | **409** · `{ error: 'missing_quiz_expiry' }` | `HTTP_ERROR_PIN status=409 CONFLICT · error=missing_quiz_expiry` · R1/R2 | **✓** |
| Ordering | 先于 bind / reserve / enqueue | S4 + R1 no-side-effect | **✓** |
| Orthogonality | ≠ `stale_quiz` · ≠ `resume_version_mismatch` | S6 + R4 stale_quiz · BOUND NOTE intact | **✓** |
| Evidence layer | **in-process** + fake DB · **≠** isolated PG/HTTP · **≠** covered | prove banner `EVIDENCE_SHAPE in-process + fake DB` · NOTE ≠ HTTP/PG E2E | **✓**（Ban narrate as isolated） |
| Pre-wire honesty | `fe411fa` EXIT1 unwired | product @`fe411fa` 无 `missing_quiz_expiry`；receipt EXIT=1；proof `if (!wired)` → EXIT1 | **✓**（read-path · Ban 改产品摘守卫） |

## 4. Ban wash NEG/BOUND · 行 stays gap · EXIT0≠covered

| Check | Ruling |
|-------|--------|
| Ban wash B'' NEG | **held** · NEG prove EXIT0 = frozen 回归 · NOTE `not FAULT evidence` · 不计入 FAULT/整行 covered |
| Ban wash W BOUND | **held** · BOUND prove EXIT0 = Ban wash · BOUND 列仍 gap · 不洗入 FAULT |
| UC-E2E-025 row stays **gap** | **held** · matrix `:125` 行 = gap · FAULT 列 = **gap** · 本审不碰 SSOT |
| coveredCount=**8** | **held** · prove PINS + matrix pins · Ban invent covered |
| EXIT0 ≠ covered | **held** · 明示于 prove stdout + receipt + 本审 |
| PASS ≠ nail ≠ covered ≠ HA | **held** |
| alone ≠ dual · 不代签 mw-rag-route | **held** |

## 5. Pins（原值 · 不翻）

| Pin | Value |
|-----|-------|
| haStatus | **NOT_HA** |
| releaseEvidence | **false** |
| claimProductionHA | **false** |
| gR45Closed | **true** |
| coveredCount | **8** |
| ms3EqualsR4Closed | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503** |
| UC-E2E-025 row | **gap** |
| FAULT column | **gap**（本审不翻） |
| BOUND column | **gap**（W honesty） |
| ADV | **blind** |
| NEG B'' | **CLOSED(wired)** frozen |
| canHonestlyFlip（本行） | **false** |

## Blockers

**None.**

## Conditions

- **C-1（alone≠dual）**: 本 PASS = mw-e2e-ha 半签。须 `mw-rag-route` 独立 post-prove PASS 后方构成 post dual；nail / SSOT / covered 翻转须协调方另行授权。不代签 peer。
- **C-2（EXIT0≠covered）**: FAULT/NEG/BOUND EXIT0 = 本刀/冻结面真证据 · **≠** UC-E2E-025 covered · **≠** FAULT 列翻 · **≠** invent covered · coveredCount 保持 8。
- **C-3（Ban wash NEG/BOUND）**: 不借 NEG/BOUND EXIT0 记 FAULT covered 或整行 covered；NEG frozen · BOUND stays gap。
- **C-4（Ban nail / Ban coding / Ban HA）**: 本 PASS 不授权 nail、不改产品码、不翻 SSOT、不宣称 HA / releaseEvidence。
- **C-5（evidence-layer）**: 本 EXIT0 证据层 = **in-process** `InterviewService.begin` + recording fake DB · **≠** isolated PG/HTTP E2E · Ban narrate as isolated。若要 PG/HTTP 级 FAULT 证据 → 另刀。
- **C-6（cite）**: 归档钉 PROVE tip `3a6ec52` · CODE `a8b98fc` · 本独立重跑 @ HEAD `3a6ec52`（commit 前）· Ban 用后移 tip 冒充实跑 tip。

## Non-claims

PASS ≠ nail ≠ covered ≠ HA · not FAULT column flip · not row flip · not invent covered · not wash NEG/BOUND · not releaseEvidence · not live · not Meridian · not secrets · not SSOT flip · EXIT0 ≠ covered · alone ≠ dual · 不代签 mw-rag-route · UC-E2E-025 stays gap · coveredCount=8 · evidence ≠ isolated PG/HTTP

## 中文三行摘要

1. 独立重跑 CODE `a8b98fc` / PROVE tip `3a6ec52`：FAULT/NEG/BOUND 各一次 **EXIT=0/0/0**；HTTP **409** `missing_quiz_expiry`；C-1 supersede + NaN fail-closed 命中；证据层 **in-process**（≠ isolated PG/HTTP）。
2. Ban wash NEG/BOUND · 行/FAULT 列 stays gap · coveredCount=8 · EXIT0≠covered · pins 原值；本 PASS ≠ nail ≠ covered ≠ HA。
3. Blockers 无；alone≠dual（待 mw-rag-route 独立 post）；不代签 peer。

Verdict: PASS

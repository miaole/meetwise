# Review — mw-e2e-ha — NHP-001-BOUND-01 POST-PROVE（Line AB · UC-001 BOUND blind→case）

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · alone ≠ dual · 不代签 `mw-rag-route`）
**Review date**: 2026-10-06 ~00:39 CST（Asia/Shanghai · UTC+8）
**Line**: **AB** · `NHP-001-BOUND-01` · gap `GAP-UC001-BOUND-01` · row `UC-E2E-001` BOUND 列
**REQUEST tip**: `c6dd1a6` / `c6dd1a67fc6b6ef4c2dfad0f9a5beff9791d657b`
**PRE dual**: mw-e2e-ha `d448da9` / `d448da9d0426c30b8ebf8570ecf3d1b7b996bcc9` PASS · mw-rag-route `64252be` / `64252bec74a5cde9aed077869aa86dfcf5d40586` PASS
**CODE**: `6e96cf5` / `6e96cf50a8be410a0d2154761afef88cd2368c7a`（feat(e2e) · prove harness only）
**PROVE tip cite**: `f8cdc82` / `f8cdc82748922a15f668993fe742411052cf21fd`（cite CODE_SHA=`6e96cf5` + re-prove EXIT=0；prior tree prove `a45a44f`/`284d8f3` 同 tree EXIT0）
**Receipt**: `ai-docs/delivery/receipts/2026-10-06-nhp-001-bound-01-blind-to-case-prove.md`
**Independent re-run HEAD**: detached @ `f8cdc82`（ancestors include REQUEST/PRE/CODE · Ban Meridian · Ban live · Ban `.env*` · Ban git config · Ban force-push · Ban product-code change · Ban retry-to-green · Ban nail · Ban invent covered · Ban wash Y NEG / 018/052/025/004/011 · Ban HA）

本 PASS = UC-001 BOUND begin-idempotency 真证据独立复核半签。**≠** covered · **≠** nail · **≠** HA · alone ≠ dual · EXIT0 ≠ covered。

---

## 1. CODE / tip 独立核验

| Claim | Verified |
|-------|----------|
| CODE `6e96cf5` | **hit** · ancestor · 4 files：`apps/api/test/uc-e2e-001-nhp-bound.proof.ts` + `apps/api/package.json` + root `package.json` + `scripts/run-e2e-isolated.mjs` |
| **Zero `apps/api/src/**` product diff** | **hit** · `git diff --stat 6e96cf5^..6e96cf5 -- apps/api/src` = empty · product begin 幂等口 pre-existing（interview id 键 · advisory · alreadyBegun · ON CONFLICT）· 本刀 prove-only |
| PROVE cite tip `f8cdc82` | **hit** · cites CODE_SHA=`6e96cf5` + re-prove EXIT=0 |
| REQUEST `c6dd1a6` · PRE e2e `d448da9` · rag `64252be` | **hit** · all ancestors |
| Receipt file | **hit** · `ai-docs/delivery/receipts/2026-10-06-nhp-001-bound-01-blind-to-case-prove.md` |
| Prove registrations | **hit** · root `uc001:nhp-bound:prove` → isolated → `apps/api` `prove:uc001-nhp-bound` · allowlist |
| SCOPE | **BOUND only** · Ban wash Line Y NEG / UC-017 orphan / 018/052/025/004/011 · B2 static guard held |

## 2. CMD | EXIT（独立重跑 ×1 · Ban retry-to-green · Ban live）

Exec: `env -u MODEL_API_KEY -u MODEL_BASE_URL ./scripts/with-docker-session.sh pnpm uc001:nhp-bound:prove`  
（`sg docker` only · Ban sudo/chmod/usermod · Ban live Keys · Ban read `.env*`）

| Field | Measured |
|-------|----------|
| CMD | `pnpm uc001:nhp-bound:prove`（wrapper `with-docker-session.sh` · keys unset） |
| Start (CST) | 2026-10-06 00:39:25 |
| End (CST) | 2026-10-06 00:39:38 |
| **EXIT** | **0** |
| Assertions | **17/17 PASS · 0 FAIL** |
| Migrations | **136** applied · skipped=0 |
| Isolation | container `meetwise-e2e-516730-1791218366239` @ `127.0.0.1:32816` · pgvector-legacy fixture · `ISOLATED_TARGET_ATTESTATION ok` · releaseEvidence=false · Not HA |
| Ban live | **held** · L0 `MODEL_API_KEY absent on entry` · `model_api_key_present_on_entry=false` · `model_base_url_present_on_entry=false` · L1 zero `ai_model_invocation` / `ai_invocation_trace` |
| Local receipt | `.tmp/isolated-proof-receipts/2026-10-05T16-39-38-783Z-516730-59123dc5-6acb-4f7e-ba3c-4ff26c34af8a.json` · `outcome=passed` · `exitCode=0` · `releaseEvidence=false` |

**CMD|EXIT = `pnpm uc001:nhp-bound:prove` | 0**

## 3. B1 evidence（独立 stdout · 全命中）

拓扑：真实迁移库（136）→ 低权登录（RLS）→ in-process `createApp()` 回环 → 真 Bearer → `POST /interview/:id/begin`。幂等键 = **interview id**（≠ HTTP Idempotency-Key header）。无 worker、无模型网关。

| id | Required | Measured | Hit |
|----|----------|----------|-----|
| **B1a** | 首次 begin → **202** accepted + jobId · 恰 1 ConsumptionRecord · reserved 1.00/5.00 · start job 1 | HTTP **202** · `accepted:true` · jobId=`9a06a9a9-…` · consumption 恰 1 · `idempotency_key===interview id` · status reserved · units 1.00 · bucket reserved 1.00 version=1 · start_jobs=1 · resume 绑定 | **✓** |
| **B1b** | 同 interview 第二次 begin → **202** `alreadyBegun:true` · **同 jobId** · ledger 逐字相同 · 无双扣 | HTTP **202** · `alreadyBegun:true` · **SAME jobId** · ledger_after_second **byte-identical** to after_first · consumption 仍 1 · start_jobs 仍 1 · interview version 不变 | **✓** |
| **B1c** | 第三次 begin → 仍 alreadyBegun · 同 jobId · ledger 仍相同 | HTTP **202** alreadyBegun · same jobId · ledger still identical · start_jobs=1 | **✓** |
| **B2** | 本收据无可执行 import/call 到 uc017 orphan / nhp-neg | PASS B2 boundary | **✓** |
| **L0/L1** | Ban live · 零模型路径 | MODEL_API_KEY absent · ai_* rows 0→0 | **✓** |

**no 双扣** · **ledger byte-identical** · real HTTP+PG · run-e2e-isolated.

## 4. Honesty / Ban 确认（本刀不翻）

| Check | Ruling |
|-------|--------|
| prove-only · zero `apps/api/src/**` | **held** |
| product mouth pre-existing | **held** · begin 幂等已有 · 本刀 = BOUND 真接线证据 |
| Ban wash Y NEG / 018/052/025/004/011 | **held** · SCOPE UC-001 BOUND only · B2 guard |
| Ban invent covered · coveredCount=**8** | **held** · matrix / prove PINS · Ban SSOT flip |
| EXIT0 ≠ covered | **held** · 明示于 prove stdout + receipt |
| PASS ≠ nail ≠ covered ≠ HA | **held** |
| alone ≠ dual · 不代签 mw-rag-route | **held** |
| Ban live · Keys unset | **held** |

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
| UC-E2E-001 BOUND | stays **blind/case-only**（本审不翻矩阵） |
| PINS_OK | **yes** |

## Blockers

**None.**

## Conditions

- **C-1（alone≠dual）**: 本 PASS = mw-e2e-ha 半签。须 `mw-rag-route` 独立 post-prove PASS 后方构成 post dual；nail / SSOT / covered 翻转须协调方另行授权。不代签 peer。
- **C-2（EXIT0≠covered）**: 17/17 EXIT0 = BOUND begin-idempotency 真证据 · **≠** UC-E2E-001 covered · **≠** invent covered · coveredCount 保持 8 · happy path 仍可 blind。
- **C-3（Ban wash）**: Ban wash Line Y NEG / UC-017 orphan / FUNNEL / G-R4-5 / 018/052/025/004/011 进本 BOUND 收据；SCOPE = UC-001 BOUND only。
- **C-4（Ban nail / Ban coding / Ban HA）**: 本 PASS 不授权 nail、不改产品码、不翻 SSOT、不宣称 HA / releaseEvidence。
- **C-5（cite）**: 归档钉 PROVE cite tip `f8cdc82` · CODE `6e96cf5` · 本独立重跑 @ `f8cdc82`（post 提交前 tip）· Ban 用后移 tip 冒充实跑 tip。
- **C-6（Ban live）**: Keys unset · L0/L1 held · no MODEL_API_KEY · no model path。

## Non-claims

PASS ≠ nail ≠ covered ≠ HA · not invent covered · not wash Y NEG / 018/052/025/004/011 · not releaseEvidence · not live · not Meridian · not secrets · not SSOT flip · EXIT0 ≠ covered · alone ≠ dual · 不代签 mw-rag-route · UC-E2E-001 BOUND stays blind/case-only · coveredCount=8 · product mouth pre-existing · prove-only

## 中文三行摘要

1. 独立重跑 CODE `6e96cf5` / cite tip `f8cdc82`：`with-docker-session.sh` + keys unset · `pnpm uc001:nhp-bound:prove` **EXIT=0 · asserts=17** · migrations=136；B1a 202 首 begin→1 ConsumptionRecord；B1b/B1c 202 alreadyBegun 同 jobId · ledger 逐字相同 · 无双扣；Ban live。
2. prove-only（零 `apps/api/src`）· SCOPE BOUND only · Ban wash Y NEG/018/052/025/004/011 · coveredCount=8 · EXIT0≠covered · pins 原值；本 PASS ≠ nail ≠ covered ≠ HA。
3. Blockers 无；alone≠dual（待 mw-rag-route 独立 post）；不代签 peer。

Verdict: PASS

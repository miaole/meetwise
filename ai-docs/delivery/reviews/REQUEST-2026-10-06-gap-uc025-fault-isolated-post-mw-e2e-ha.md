# Review — mw-e2e-ha — GAP-UC025-FAULT-ISOLATED-01 · POST-PROVE（Line W · isolated PG+HTTP FAULT）

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · alone ≠ dual · 不代签 `mw-privacy-int`）
**Review date**: 2026-10-06 ~12:38 CST（Asia/Shanghai · UTC+8）
**Line**: **W** · `GAP-UC025-FAULT-ISOLATED-01` / `NHP-025-FAULT-01` criteria · isolated PG+HTTP evidence complementary to AA
**REQUEST**: `43322e5` / `43322e5c2686b3daaf1e66a255184ac8ca74c6b9`（docs-only pre_dual）
**PRE dual BOTH PASS**: mw-e2e-ha `69be76c` / `69be76c9c3c7eb1ef2cc8ce2bdd4686c750487f2` + mw-privacy-int `3fb7ba5` / `3fb7ba50803c9f43c3960913ced51f916c373e34`
**CODE**: `cce33ba` / `cce33ba9359ee040cf7cffa661cbb2477a1ed694`（0049-compatible C-side resume bind stub for F5 · tip of product+proof ancestry）
**Receipt tip**: `e8d8a91` / `e8d8a919a4f1a6da8e2879a09d429653fd849705`
**Receipt**: `ai-docs/delivery/receipts/2026-10-06-gap-uc025-fault-isolated-prove.md`
**Independent re-run HEAD**: `e8d8a91`（detached `origin/feat/mysql-schema-skeleton` · Ban Meridian · Ban live · Ban `.env*` · Ban git config · Ban force-push · Ban product-code change · Ban retry-to-green · Ban nail · Ban invent covered · Ban wash AA in-process as isolated · Ban wash NEG/BOUND · Ban HA · Ban retry-to-green wash of attempts1–4 EXIT1）

本 PASS = Line W 隔离面 FAULT 真证据（三层壳 · 真 Nest HTTP · 真 PG timestamptz · F1–F5）独立复核半签。**≠** covered · **≠** nail · **≠** HA · alone ≠ dual · EXIT0 ≠ covered · 不代签 `mw-privacy-int` · complementary ≠ substitute AA。

---

## 1. CODE / tip 独立核验

| Claim | Verified |
|-------|----------|
| Tip `e8d8a91` | **hit** · `git rev-parse HEAD` = `e8d8a919a4f1a6da8e2879a09d429653fd849705` · receipt commit |
| CODE `cce33ba` | **hit** · ancestor of tip · only `apps/api/test/uc-e2e-025-nhp-fault-isolated.proof.ts`（+44 · F5 0049 bind stub） |
| Ancestry `48c4a8a`→`8d0d808`→`ca4e44d`→`e7b9ba2`→`cce33ba` | **hit** · feat + 4 honesty fixes · all ancestors |
| REQUEST `43322e5` · PRE e2e `69be76c` · PRE privacy `3fb7ba5` | **hit** · all ancestors of tip |
| Receipt file | **hit** · `ai-docs/delivery/receipts/2026-10-06-gap-uc025-fault-isolated-prove.md` |
| Complementary ≠ AA wash | **hit** · isolated proof banner + AA proof `EVIDENCE_SHAPE in-process + fake DB · ≠ isolated` · CODE 仅 isolated proof · AA proof 未改 |
| Prove registrations | **hit** · root `uc025:nhp-fault-isolated:prove` → `run-e2e-isolated.mjs` → `prove:uc025-nhp-fault-isolated` |

## 2. Attempt ledger honesty（Ban retry-to-green wash）

Receipt 如实记录 attempts1–4 **EXIT1** · attempt5 **EXIT0** @ `cce33ba`：

| # | CODE tip | EXIT | Note（receipt） |
|---|----------|------|-----------------|
| 1 | `48c4a8a` | **1** | invalid UUID fixture（22P02） |
| 2 | `8d0d808` | **1** | snap 查不存在 `entitlement_consumption.interview_id` |
| 3 | `ca4e44d` | **1** | F1–F4 PASS · F5 HTTP 500（CHECK=50 vs enqueue v64） |
| 4 | `e7b9ba2` | **1** | F1–F4 PASS · F5 HTTP 500（0049 bind blocked） |
| 5 | `cce33ba` | **0** | F1–F5 all PASS · 21/21 |

**Ruling**: attempts1–4 EXIT1 **未洗** · 本审独立重跑 ×1 @ tip（含 CODE）· **Ban** 用 attempt5 绿洗前四红。

## 3. CMD | EXIT（独立重跑 ×1 each · Ban retry-to-green）

Exec @ detached tip `e8d8a91` / CODE `cce33ba` · isolated via `./scripts/with-docker-session.sh`（`sg docker` session inheritance · Ban sudo/chmod/usermod）· Ban live Keys · Ban read `.env*`。

| CMD | Start (CST) | End (CST) | EXIT |
|-----|-------------|-----------|------|
| `./scripts/with-docker-session.sh pnpm uc025:nhp-fault-isolated:prove` | `2026-10-06T12:37:25+08:00` | `2026-10-06T12:37:35+08:00` | **0** |
| `pnpm uc025:nhp-fault:prove`（AA in-process freeze） | `2026-10-06T12:37:26+08:00` | `2026-10-06T12:37:29+08:00` | **0** |
| `pnpm uc025:nhp-neg:prove` | `2026-10-06T12:37:29+08:00` | `2026-10-06T12:37:29+08:00` | **0**（frozen · Ban wash · not FAULT isolated evidence） |
| `pnpm uc025:nhp-bound:prove` | `2026-10-06T12:37:29+08:00` | `2026-10-06T12:37:34+08:00` | **0**（Ban wash · not FAULT isolated evidence） |

Local isolated receipt（releaseEvidence=false）: `.tmp/isolated-proof-receipts/2026-10-06T04-37-35-646Z-764478-e7d91369-4326-4a61-b5b4-f9e7a6fa569d.json` · container `meetwise-e2e-764478-1791261445582` · PGPORT=`32827`。

### Isolated stdout 要点（本审实测）

```
ISO_SHELL  PGPORT=32827
PASS  [ISO] dynamic-PG-port-present(or DATABASE_URL)
ANCHOR_COL  resume_quiz.expires_at … data_type=timestamp with time zone udt=timestamptz
PASS  [ISO] anchor-column-expires_at-timestamptz
PASS  [PIN] order-NEG-before-FAULT-before-BOUND(static)
PASS  [PIN] fault-throw-409-missing_quiz_expiry(static)
F1_HTTP  status=409 body={"error":"missing_quiz_expiry"}
F2_HTTP  status=409 body={"error":"missing_quiz_expiry"}  (infinity→NaN)
F3_HTTP  status=409 body={"error":"resume_version_mismatch"}
F4_HTTP  status=409 body={"error":"stale_quiz"}
F5_HTTP  status=202 body={"accepted":true,…}
ATTEMPT_END  … EXIT=0 total=21 fail=0
HTTP_ERROR_PIN  status=409 CONFLICT · error=missing_quiz_expiry
EVIDENCE_SHAPE  isolated three-layer shell + real HTTP + real PG timestamptz · complementary to AA in-process · ≠ AA wash
ROW_STILL_GAP  UC-E2E-025 FAULT column not flipped. … coveredCount=8.
CMD=pnpm uc025:nhp-fault-isolated:prove EXIT=0
```

**CMD|EXIT ×4** = isolated **0** · AA fault **0** · NEG **0** · BOUND **0**（各恰一次 · Ban retry-to-green）。

## 4. Evidence-layer ruling（审点 2 · 真 isolated）

| Check | Required | Measured | Hit |
|-------|----------|----------|-----|
| Three-layer shell | `run-e2e-isolated.mjs` · 自建 `meetwise-e2e-*` · 动态 PG 端口 | container `meetwise-e2e-764478-…` · PGPORT=32827 · wrapper 头注契约 | **✓** |
| Real Nest HTTP | createApp + `app.listen(0)` + `fetch` · 非直调 service | `_neg-harness.ts:89` listen · `:94/:110` fetch · proof `h.post(/interview/…/begin)` | **✓** |
| Real PG timestamptz | 隔离 schema 锚列实测 | `ANCHOR_COL … timestamptz` · ISO assert PASS | **✓** |
| F1–F5 | NULL/NaN/正控/stale/no-quiz-id | 本审 F1–F5 全 PASS · 21/21 | **✓** |
| Complementary ≠ AA | 不洗 AA in-process 为隔离；不代 AA | AA proof 仍 `in-process + fake DB` EXIT0 冻结；isolated 自证 complementary · AA_WASH: **no** | **✓** |
| Schema stubs disclosed | ≠ covered | privacy-active / job v64 / 0049 bind stubs PIN 打印 · Ban invent covered | **✓** |

**Ruling**: 证据层 = **真 isolated PG+HTTP** · **≠** in-process 顶替 · **≠** AA wash · complementary to AA。

## 5. 409 准则未洗（审点 3）

| Check | Ruling |
|-------|--------|
| HTTP **409** `missing_quiz_expiry` | **held** · F1/F2 实测 `status=409 body={"error":"missing_quiz_expiry"}` · `HTTP_ERROR_PIN` |
| ≠ `stale_quiz` on NULL/NaN | **held** · F1/F2 anti-fake-green PASS |
| NaN fold 同口 | **held** · F2 infinity→`dateGetTime=NaN` → 同 409 |
| Order NEG→FAULT→BOUND | **held** · static PIN + F4 stale + F3 mismatch sentinel |
| No quiz-id skip | **held** · F5 → 202 accepted · ≠ FAULT codes |

## 6. AA 冻结诚实（审点 4）· Ban wash NEG/BOUND

| Check | Ruling |
|-------|--------|
| `uc025:nhp-fault:prove` EXIT0 | **held** · 本审实测 · in-process 冻结 · Ban 改 AA 迁就 |
| `uc025:nhp-neg:prove` EXIT0 | **held** · frozen 回归 · not FAULT isolated evidence |
| `uc025:nhp-bound:prove` EXIT0 | **held** · Ban wash · BOUND 列仍 gap |
| Ban wash AA as isolated | **held** · AA stdout 仍自白 `≠ isolated PG/HTTP E2E` |
| Ban wash NEG/BOUND into FAULT/row covered | **held** |

## 7. EXIT0≠covered · pins（审点 5）

| Pin | Value | Hit |
|-----|-------|-----|
| haStatus | **NOT_HA** | **✓** |
| releaseEvidence | **false** | **✓** |
| claimProductionHA | **false** | **✓** |
| gR45Closed | **true** | **✓** |
| coveredCount | **8** | **✓** |
| ms3EqualsR4Closed | **false** | **✓** |
| Stack | **PG-retained** | **✓** |
| Public DELETE | **503** | **✓** |
| UC-E2E-025 row | **gap** | **✓**（matrix `:125` · 本审不碰 SSOT） |
| FAULT column | **gap** | **✓**（本审不翻） |
| BOUND column | **gap** | **✓** |
| ADV | **blind** | **✓** |
| NEG B'' | **CLOSED(wired)** frozen | **✓** |
| canHonestlyFlip（本行） | **false** | **✓** |
| AA_WASH | **no** | **✓** |
| EXIT0 ≠ covered ≠ nail ≠ HA | **held** | **✓** |
| alone ≠ dual · 不代签 privacy | **held** | **✓** |

## Blockers

**None.**

## Conditions

- **C-1（alone≠dual）**: 本 PASS = mw-e2e-ha 半签。须 `mw-privacy-int` 独立 post-prove PASS 后方构成 post dual；nail / SSOT / covered 翻转须协调方另行授权。不代签 peer。
- **C-2（EXIT0≠covered）**: isolated/AA/NEG/BOUND EXIT0 = 本刀/冻结面真证据 · **≠** UC-E2E-025 covered · **≠** FAULT 列翻 · **≠** invent covered · coveredCount 保持 8。
- **C-3（Ban wash AA / NEG / BOUND）**: 不借 AA in-process 或 NEG/BOUND EXIT0 记隔离面已足够 / FAULT covered / 整行 covered；AA complementary retained · NEG frozen · BOUND stays gap。
- **C-4（Ban nail / Ban coding / Ban HA）**: 本 PASS 不授权 nail、不改产品码、不翻 SSOT、不宣称 HA / releaseEvidence。
- **C-5（evidence-layer）**: 本 EXIT0 证据层 = **isolated three-layer shell + real Nest HTTP + real PG timestamptz** · complementary to AA in-process · **≠** AA wash · **≠** covered。
- **C-6（cite）**: 归档钉 tip `e8d8a91` · CODE `cce33ba` · REQUEST `43322e5` · 本独立重跑 @ HEAD `e8d8a91`（commit 前）· Ban 用后移 tip 冒充实跑 tip · Ban 洗 attempts1–4 EXIT1。
- **C-7（attempts honesty）**: receipt attempts1–4 EXIT1 保留为诚实失败账本；本审 ×1 重跑 EXIT0 **≠** 抹红。

## Non-claims

PASS ≠ nail ≠ covered ≠ HA · not FAULT column flip · not row flip · not invent covered · not wash AA/NEG/BOUND · not releaseEvidence · not live · not Meridian · not secrets · not SSOT flip · EXIT0 ≠ covered · alone ≠ dual · 不代签 mw-privacy-int · UC-E2E-025 stays gap · coveredCount=8 · complementary ≠ substitute AA · Ban retry-to-green wash attempts1–4

## 三行中文摘要

1. 独立重跑 `pnpm uc025:nhp-fault-isolated:prove` EXIT**=0**（三层壳 · PGPORT=32827 · F1–F5 全绿 · HTTP **409** `missing_quiz_expiry`）；AA `fault/neg/bound` 冻结 trio 均 EXIT0，未洗。
2. 证据层裁定为**真 isolated**（真 Nest fetch + 真 timestamptz + meetwise-e2e 容器），complementary≠substitute AA；receipt attempts1–4 EXIT1 诚实保留，Ban retry-to-green 洗红。
3. 行/FAULT 仍 gap · coveredCount=8 · pins 原值 · EXIT0≠covered≠nail≠HA · alone≠dual（peer=`mw-privacy-int`）· Blockers=无。

【PASS】

Verdict: PASS

# POST-PROVE · Line AK · NHP-025-ADV-01 · UC-025 ADV blind→case · mw-e2e-ha

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · Ban self-nail · alone ≠ dual · 不代签 peer `mw-rag-route`）
**Review date**: 2026-10-06 ~19:49 CST（Asia/Shanghai · UTC+8）
**Line**: **AK** · `NHP-025-ADV-01` · row `UC-E2E-025` ADV 列
**PROVE_TIP (knife)**: `4a804a8`（`4a804a8f4ebae5c3d747988f798aba2248b34ab9`）· feat(e2e) ADV proof + additive `uc025:nhp-adv:prove` · 2026-10-06 19:39:57 +08:00 · ancestor of `origin/feat/mysql-schema-skeleton` ✔
**Receipt**: `c4d3b9f`（`c4d3b9f0d9b3a4fd60052429eb898ddbe1a76411`）· docs(e2e) prove receipt @`4a804a8` · 2026-10-06 19:40:16 +08:00 · ancestor ✔ · **≠ knife**
**Tip→feat mapping**: knife `4a804a8` → receipt `c4d3b9f` → later AI FAULT `ac5928a` + AJ nail + AI POST reviews · current feat tip at re-run = `7750eef` · `git diff 4a804a8 HEAD -- apps/api/test/uc-e2e-025-nhp-adv.proof.ts` = **empty**（ADV knife byte-identical on feat）· receipt discloses pre-rebase `b66464e`→`ea7c199`→final `4a804a8`（code ≡ docs-only upstream deltas）— disclosed honestly · **not** AI-style tip rewrite of knife body
**REQUEST**: `420aeca`（`420aecadf665349a6419feb89d8a5179a39fd2d2`）· option **(b)** rewrite
**PRE (re-PRE2)**: mw-e2e-ha PASS `13fc781`（docs gate · C1–C6 · B-R1 via option (b): ADV-new = A1 + A3-b + PC-A1）
**Peer rag PRE**: `0a67d40` — **exists · independently verified · NOT co-signed**
**Independent re-run**: detached HEAD @ `origin/feat/mysql-schema-skeleton` (`7750eef` · contains knife) · `./scripts/with-docker-session.sh` + `env -u MODEL_API_KEY -u MODEL_BASE_URL` · Ban Meridian · Ban `.env*` · Ban git config · Ban force-push · Ban product-code change · Ban invent MUT · Ban nail · Ban invent covered · Ban wash W BOUND · Ban complementary as ADV-new · Ban HA · Ban buy cloud · Ban retry-to-green

本 PASS = UC-025 ADV blind→case 真证据独立复核半签。**≠** covered · **≠** nail · **≠** HA · alone ≠ dual · EXIT0 ≠ covered · complementary ≠ ADV-new。

---

## 1. Tip vs receipt（独立 resolve）

| SHA | Role | Verified |
|-----|------|----------|
| `4a804a8` | **PROVE tip / ADV knife** | `git show --stat` = proof.ts + runner additive + package.json · **zero** `apps/api/src/**` / `packages/**` |
| `c4d3b9f` | **Receipt only** | harness/slice status + `receipts/2026-10-06-nhp-025-adv-01-prove.md` · cites prove @`4a804a8` |
| Both on feat | ancestor of `origin/feat/mysql-schema-skeleton` | ✔ |

Re-run preferred on feat tip carrying the ADV knife（proof ≡ `4a804a8`）。

## 2. CMD \| EXIT \| HTTP pins（独立复跑 · Ban live）

| # | CMD | start→end (+08:00) | EXIT | Key pins / SUMMARY |
|---|-----|--------------------|------|---------------------|
| R1 ADV | `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc025:nhp-adv:prove` | 19:48:42→19:48:52 | **0** | A1 **404** `not_found_or_forbidden` · PC-A1 **202** `{accepted,jobId}` · A3-b **409** `resume_version_mismatch` · `ADV_NEW_SUMMARY asserts=18 failed=0` · `COMPLEMENTARY_SUMMARY asserts=8 failed=0 (recorded · never counted as ADV-new)` · infra 18/0 · total=44 · receipt `.tmp/...0215106c...json` release_evidence=false |
| R2 NEG | same wrapper · `pnpm uc025:nhp-neg:prove` | 19:48:56→19:48:57 | **0** | NHP-025-NEG-01 PASS |
| R3 BOUND | same wrapper · `pnpm uc025:nhp-bound:prove` | 19:48:57→19:48:59 | **0** | NHP-025-BOUND-01 PASS（Ban wash W BOUND · regress only） |
| R4 FAULT | same wrapper · `pnpm uc025:nhp-fault:prove` | 19:48:59→19:49:02 | **0** | NHP-025-FAULT-01 PASS |
| R5 FAULT-ISO | same wrapper · `pnpm uc025:nhp-fault-isolated:prove` | 19:49:02→19:49:11 | **0** | 21/21 EXIT0 |

prove 首行：`with-docker-session: docker.sock permission gap… re-exec via sg docker` → isolated PG → `CMD=… EXIT=0`。**零 env-block · Ban live · MODEL_* stripped。**

### ADV-new scope（option b · PRE `13fc781`）

| id | HTTP (independent) | Class |
|----|---------------------|-------|
| **A1** | **404** `{"error":"not_found_or_forbidden"}` | **ADV-new** |
| **PC-A1** | **202** `{"accepted":true,"jobId":…}` | **ADV-new** |
| **A3-b** | **409** `{"error":"resume_version_mismatch"}` | **ADV-new** |

Stdout tags: `RESULT A1/PC-A1/A3-b ADV-new` · `ADV_NEW_SUMMARY A1+PC-A1+A3-b` only decides EXIT0. ✅

### Complementary ≠ ADV-new（Ban wash W BOUND · Ban complementary as ADV-new）

| id | HTTP (independent) | Tag |
|----|---------------------|-----|
| A3-a (W R4) | 202 | `complementary(≠ADV-new · W BOUND re-check)` |
| A3-c (W R2) | 409 `resume_version_mismatch` | same |
| A3-NULL (W R5) | 202 | same |

`COMPLEMENTARY_SUMMARY … (recorded · never counted as ADV-new)` · proof `ADV_NEW` vs `COMPLEMENTARY` arrays disjoint. ✅ **未**把 complementary 绿计入 ADV-new。

## 3. MUT discarded（Ban invent MUT · verify restore）

REQUEST：独立 MUT replay only when safe and already scripted。实现方 MUT 为临时手工改 `interview.service.ts`（非独立脚本）→ **本审不发明 / 不重放 MUT 代码改动**。

| Check | Ruling |
|-------|--------|
| Implementer receipt MUT-A1 / MUT-A3a / MUT-A3b | **EXIT1** each · red asserts as claimed · `git checkout` restore disclosed @`c4d3b9f` receipt |
| Working tree `apps/api/src` vs HEAD | **CLEAN** · no MUT persist |
| Live anchors | `:217` `rowCount === 0`→404 intact · `:263` `toLowerCase` intact · `:265-266` `if (resumeVersionMismatch)` throw intact |
| MUT-A3a ≠ promote A3-a to ADV-new | held（proof + PRE + receipt） |

## 4. C1–C6 spot-check（independent stdout + harness）

| C | Evidence |
|---|----------|
| **C1** | `PASS [SEED] C1 bucket kind='paid' ∈ {gift,trial,paid}` |
| **C2** | `units_total=3` · FIFO-first · end `reserved=3`（PC-A1+A3-a+A3-NULL）· no 402 |
| **C3** | pair chk live：half-NULL refused · A3-NULL both NULL seeded |
| **C4** | INSERT foreign-epoch drift · FK refuse A→B pin · UPDATE-pin trigger refuse |
| **C5** | harness rewrite note 1 B3 row ~~strikethrough~~ **superseded by Rewrite note 2（option (b) · C5）** |
| **C6** | complementary tagged ≠ADV-new · separate summary · excluded from ADV-new count |

## 5. Pins / Ban / Non-claims

| Check | Ruling |
|-------|--------|
| ADV EXIT0 + HTTP pins | **held** · independent R1 |
| ADV-new = A1 + A3-b + PC-A1 only | **held** |
| complementary ≠ ADV-new · Ban wash W BOUND | **held** |
| MUT discarded · no persist | **held**（receipt + clean tree + anchors） |
| regress neg/bound/fault/fault-isolated EXIT0 | **held** · R2–R5 |
| EXIT0 ≠ covered · ADV stays blind · row gap | **held** · coveredCount=**8** |
| alone ≠ dual · peer `0a67d40` not co-signed | **held** |
| Ban invent covered / Ban nail / Ban HA / Ban Meridian / Ban buy cloud | **held** |

### Pins（原值 · 不翻）

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · DELETE=**503** · g7SuiteGreen=**false**

## Blockers

**无阻塞。**

## Non-claims

PASS ≠ nail ≠ covered ≠ HA · EXIT0 ≠ covered · alone ≠ dual · 不代签 peer · complementary ≠ ADV-new · Ban wash W BOUND · Ban invent MUT · Ban invent covered · Ban self-nail · Ban live · Ban buy cloud · ADV stays **blind** · row UC-E2E-025 stays **gap** · canHonestlyFlip=false

## 中文摘要

独立复跑：刀 tip=`4a804a8`（ADV knife）· 收据=`c4d3b9f`（非刀）· 在含刀的 feat tip `7750eef` 复跑（proof ≡ `4a804a8`）。ADV EXIT0：A1=404 · PC-A1=202 · A3-b=409；ADV-new=A1+A3-b+PC-A1；A3-a/c/NULL 仅 complementary 记录、不计 ADV-new；MUT 未持久（树干净 + 锚点完整 + 实现方收据 EXIT1）；neg/bound/fault/fault-isolated 均 EXIT0；C1–C6 命中；Ban wash W BOUND。peer PRE `0a67d40` 存在但不代签。pins 不动 · EXIT0≠covered · ADV 仍 blind。本 PASS≠nail≠covered≠HA；alone≠dual。

Verdict: **PASS**

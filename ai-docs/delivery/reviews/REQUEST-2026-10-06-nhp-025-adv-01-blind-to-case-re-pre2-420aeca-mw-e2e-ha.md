# re-PRE2 — NHP-025-ADV-01 · UC-025 ADV blind→case · REQUEST `420aeca` · mw-e2e-ha（Line AK · docs gate only）

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · Ban self-nail · alone ≠ dual · 不代签 peer `mw-rag-route`）
**Review date**: 2026-10-06 ~19:32 CST（Asia/Shanghai · UTC+8）
**Line**: **AK**
**REQUEST**: `420aeca`（`420aecadf665349a6419feb89d8a5179a39fd2d2`）· meetwise-core · 2026-10-06 14:54:09 +08:00 · **supersedes `43e2dbc`**（← `ae5367e`）· cites FAIL `e883bf8` · ancestor of origin ✔
**Coverage note**: 本人 prior PRE-EXEC PASS `899fef2` **只覆盖旧 tip `ae5367e`/wave，不覆盖 `43e2dbc` 或本 tip `420aeca`**。本文件为对 `420aeca` 的全新独立审查。
**Peer**: mw-rag-route Re-PRE2 PASS `0a67d40` — **独立核实，不代签** · peer 附条件 C1–C6 **carry**
**Scope**: 只审文档 · **Ban coding until BOTH** · Ban prove · Ban wash W BOUND · Ban invent covered · Ban live · Ban `.env*` · Ban nail · Ban HA · Ban buy cloud

本 PASS = docs gate 半签。**≠** AUTHORIZE · **≠** coding · **≠** covered · alone ≠ dual · EXIT0≠covered。

---

## 0. 变更面

- `git show --stat 420aeca` = **4 markdown only**。零代码/script/package。✅
- FAIL `e883bf8` / `6790cc6` 正文在 rag stub **原样保留**。✅
- B1/B2/B4/B5（已于 `43e2dbc` 解除）本稿 **不回退**。✅

## 1. B-R1 · option **(b)** A3 split（独立核 · 对照 FAIL `e883bf8`）

| Claim | 独立核 |
|-------|--------|
| A3-a / A3-c / A3-NULL = complementary（W R4 / R2 / R5）· ≠ ADV-new · 不计 ADV 证据 | **hit** · harness `:110-119` · Ban wash W BOUND |
| ADV-new = **A1 + A3-b + PC-A1** only | **hit** · `:13` / `:43` / `:149` |
| A3-b 钉 **409 `resume_version_mismatch` @ `:266`** · 无扣额/入队 · 无 owner 闸替代期望 | **hit** · 源码：`:194` missing→400 · `:195` 格式→400 · `:263` 与 pin 比较 · `:266` 抛 409；`:255` JOIN 用 `q.resume_id` 非 header；resume **owner** 检查仅 bind `:300`（**在 `:266` 之后**）→ 他人合法 UUID **必** 409 @ `:266`，非 404/400 |
| A3-a：大写 UUID 过守卫（不 409）· `UUID_RE` `/i` `:28` + `:263` toLowerCase | **hit** |
| MUT-A3a / MUT-A3b 钉变红断言 · never commit · MUT-A3a 不升 A3-a 为 ADV-new | **hit** · `:125-128` |
| §3-1 runner 纯增量登记允许（AG `7eb1c88` 先例） | **hit** · `:44` / `:138-143` |
| §3-2 PC-A1 seed 披露 | **hit** · `:91-100` |
| §3-3 A1 先于 PC-A1 | **hit** · `:85` / `:102` |

W BOUND 对照：`uc-e2e-025-nhp-bound.proof.ts` R1/R2/R4/R5 向量存在且语义匹配（跨主体 A3-b = fixture delta on R1 机制）。**Ban wash W BOUND** 明文。✅

## 2. C1–C6 carry（peer `0a67d40` §5 · 本审独立复核）

| ID | 条件 | 核 |
|----|------|----|
| **C1** | bucket `kind` ∈ `gift/trial/paid`（`02_commerce.sql:14`）· 非 service_type `mock_interview` | **carry** · 属实 |
| **C2** | PC-A1/A3-a/A3-NULL 各 reserve 1.0 → 同 bucket 须 `units_total≥3` 或分 bucket | **carry** |
| **C3** | A3-NULL：`resume_id` 与 `privacy_epoch` 须同时 NULL（pair chk） | **carry** |
| **C4** | A3-c epoch 漂移：0061 只拦 UPDATE pin → INSERT 时写异 epoch 或抬 resume epoch · 须满足 FK | **carry** |
| **C5** | rewrite note 1 B3「标 ADV-new」已被 note 2 取代 · 建议标 superseded | **carry** · 非阻断 |
| **C6** | complementary 行结果如实记 · 永不计入 ADV-new | **carry** |

## 3. Pins / Ban

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · DELETE=**503** · UC-E2E-025 ADV stays **blind** · row gap · Ban wash W BOUND · Ban coding until BOTH+AUTHORIZE · alone ≠ dual · 不代签 peer

## Blockers

**无**（docs gate）。执行前须落实 C1–C6。**Ban coding until BOTH PASS + AUTHORIZE。**

## Non-claims

PASS ≠ AUTHORIZE ≠ coding ≠ covered ≠ nail ≠ HA · complementary ≠ ADV-new · Ban wash W BOUND · prior `899fef2` ≠ 覆盖本 tip · alone ≠ dual

## 中文摘要

REQUEST `420aeca` docs-only re-PRE2（supersedes `43e2dbc`），按 FAIL `e883bf8` 选 option **(b)**：A3-a/c/NULL 降为 W R4/R2/R5 complementary（不计 ADV）；ADV-new = A1 + A3-b + PC-A1；A3-b 钉 409 `resume_version_mismatch` @ `:266`。独立读码确认 `:266` 前无 resume owner 闸（owner 在 bind `:300`）。§3 1–3 与 B1/B2/B4/B5 无回退。peer rag PASS `0a67d40` 的 C1–C6 **carry**。Ban wash W BOUND · Ban coding until BOTH。旧 PASS `899fef2` 不覆盖本 tip。本 PASS≠AUTHORIZE≠coding；alone≠dual；不代签 peer。

Verdict: PASS

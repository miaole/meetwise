# REQUEST — **NHP-025-ADV-01 · UC-025 ADV blind→case evidence** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub rewrite **re-PRE2** · awaiting re-PRE · supersedes REQUEST `43e2dbc` · cites rag Re-PRE FAIL `e883bf8` B-R1 + §3 1–3 · Ban self-approve · alone ≠ dual · 不代签 peer）
**Rewrite**: **re-PRE2 · supersedes REQUEST `43e2dbc`**（`43e2dbc1992d2077ca742a6161084ab5052b89d4` ← `ae5367e`）· cites mw-rag-route Re-PRE FAIL **`e883bf8`**（`e883bf8c4d5dafb19af32a3d8713dd5a04ffe139`）**B-R1 → option (b)** + §3 1–3 · prior FAIL **`6790cc6`**（`6790cc6d3e72ab5545a5071838b99b4fe0aaf8da`）B1–B5 (+ C1–C2）cleared @`43e2dbc` · B1/B2/B4/B5 not regressed· peer e2e PASS `899fef2` alone ≠ dual · Ban coding · ADV blind · canHonestlyFlip=false
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Peer**: `mw-rag-route`（独立签 · alone ≠ dual）
**Knife**: `harness/nhp-025-adv-01-blind-to-case.md` · slice `nhp-025-adv-01-blind-to-case.slice.md`
**Parent tip**: origin `feat/mysql-schema-skeleton` tip（includes AI/AJ rewrite + AL/AM/AG · Ban touch AL/AM/AG · Ban 共享 SSOT）
**Date**: 2026-10-06
**Line**: **AK**

## Pins（retained · 本 stub 不改）

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

## 请审什么（mw-e2e-ha · re-PRE2 · B-R1 + §3 1–3 · 不回退 B1/B2/B4/B5）

Line AK · NHP-025-ADV-01。本 stub 为 **re-PRE2 rewrite**（**supersedes `43e2dbc`** ← `ae5367e` · cites rag Re-PRE FAIL **`e883bf8`** B-R1 + §3 1–3 · prior FAIL **`6790cc6`** B1–B5 + C1–C2 已于 `43e2dbc` 解除且本稿不回退；peer PASS `899fef2` **alone ≠ dual**）。请审：

1. **B1 A1**：钉 404 `not_found_or_forbidden`（`:214-218`）· 先于 `:222/:239/:242/:266` · 无 reserve `:329` / enqueue `:337` · own interview + other's quiz · 正控 own fresh pinned quiz → **202** · 与 `:200` 同码区分 · MUT-A1 真变红（警告：只去 owner 过滤在 FORCE RLS 下不够）。
2. **B2 A2**：**已删除**（begin `:22-26` 无客户端 expiry 面）· Ban relabel `stale_quiz` 为 ADV。
3. **B-R1 A3（option (b) · `e883bf8`）**：**ADV-new 仅 A3-b**（跨主体 resume-id）→ 钉 **409 `resume_version_mismatch` @ `:266`** · 未扣额 `:329` / 未入队 `:337` · `:266` 前**无** resume owner 闸（owner 检查在其后 bind `:300` `AND r.owner_user_id=$2`）· 已删旧稿 A3-b「owner 闸替代期望」模糊措辞（期望唯一）；A3-a / A3-c / A3-NULL = 「W R4 / R2 / R5 向量在真 PG + HTTP 层的补充复验 · complementary ≠ ADV-new · 不计 ADV 证据」；A3-a 钉 pin 匹配大写 UUID → 通过版本守卫（不 409 · `UUID_RE` `/i` `:28` · W R4）；A3-NULL = W R5 / `:260` 有意放行 ≠ 红 ≠ ADV pass；MUT-A3a 去 `:263` lowercase → A3-a 变 409 · MUT-A3b 放宽 `:266` → A3-b 不再 409 · never commit；ADV-new EXIT0 = **A1 + A3-b + PC-A1**。
3b. **§3 1–3（`e883bf8`）**：runner 仅增量登记 `uc025:nhp-adv:prove`（`run-e2e-isolated.mjs` + 根/`apps/api` `package.json` · AG `7eb1c88` +16/-1 · 「仅增量登记、不改其他目标行为」· 否则 `unsupported_e2e_target`）；PC-A1 → 202 seed 披露（entitlement bucket 否则 `:329` 402 · quiz `ready` · `expires_at` 未来 · pin resume_id = header `resume-id` · epoch = 当前）；**A1 先于 PC-A1**（`:212-218` 先于 `alreadyBegun` `:321`/`:326` · Δ0 空表基线）。
4. **B4**：单一证据层 `run-e2e-isolated.mjs` 真 PG + Nest HTTP + FORCE RLS（`20_resume_quiz.sql:46-49`）· Ban fake DB · Ban 矛盾措辞。
5. **B5**：具名回归 `uc025:nhp-neg:prove` · `uc025:nhp-bound:prove` · `uc025:nhp-fault:prove` · `uc025:nhp-fault-isolated:prove` EXIT0 零改动；每 A-case ≥1 mutation；env EXIT1 ≠ pass。
6. **列/行诚实**：ADV stays **blind** · row stays **gap** · canHonestlyFlip=false · Ban wash B''/AA/W · Ban 碰共享 SSOT。
7. **C1–C2**：不与 R4 `wrong_track` 混用；attempts=1 · CMD+EXIT+±08:00+SHA · EXIT0≠covered≠ADV 升格≠nail≠HA。

UC-E2E-025 row stays **gap** · ADV stays **blind** until case · **EXIT0≠covered** · canHonestlyFlip=false · coveredCount=8 · Ban wash B'' NEG / AA FAULT / W BOUND+FAULT-ISOLATED.

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban SSOT edit（matrix / backlog / checklist）· Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban 碰 AL/AM/AG 禁触文件 · Ban product/infra code（except 纯增量 runner 目标登记 `uc025:nhp-adv:prove` · 仅增量登记、不改其他目标行为）· Ban borrow W R4/R2/R5 绿为 ADV · Ban relabel stale_quiz · Ban fake DB。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-e2e-ha` re-PRE · implementer 不得填写）

---

*Stub · re-PRE2 rewrite · supersedes 43e2dbc ← ae5367e · FAIL e883bf8 B-R1 option (b) + §3 1–3 · FAIL 6790cc6 B1–B5 · peer PASS 899fef2 alone≠dual · Ban coding · ADV blind · awaiting expert re-PRE dual · STOP*

---

## Historical peer note（alone ≠ dual · do not erase）

- **`899fef2`** · mw-e2e-ha PRE-EXEC PASS ×5（含 Line AK @`ae5367e`）· **alone ≠ dual**（rag FAIL `6790cc6` ⇒ BOTH not PASS）· 历史旁证 · 不代签本 re-PRE。
- **`6790cc6`** · mw-rag-route PRE-EXEC FAIL on `ae5367e` · B1–B5 · 正文保留于 rag stub · 本 rewrite 声称已解除 · **不**构成对新稿 PASS。
- **`e883bf8`** · mw-rag-route Re-PRE FAIL on `43e2dbc` · B1/B2/B4/B5 cleared · **B-R1**（A3 与 W R1/R2/R4/R5 重合）+ §3 1–3 · 正文保留于 rag stub · 本 re-PRE2 选 option (b) 声称已解除 · **不**构成对新稿 PASS。

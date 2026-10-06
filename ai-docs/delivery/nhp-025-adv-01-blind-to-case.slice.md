# Slice — **NHP-025-ADV-01 · UC-025 ADV blind→case evidence**（Line AK · `draft:awaiting_pre_exec_dual` · re-PRE2 rewrite）

**Status update (2026-10-06)**: proved @`4a804a8`（code ≡ pre-rebase `b66464e`） EXIT 0 · receipt `receipts/2026-10-06-nhp-025-adv-01-prove.md` · awaiting POST dual · ADV blind · row gap

**Status (REQUEST-time, retained)**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST rewrite **re-PRE2** · supersedes `43e2dbc`（← `ae5367e`）· cites rag Re-PRE FAIL **`e883bf8` B-R1 + §3 1–3**（option **(b)**）· prior FAIL `6790cc6` B1–B5 cleared · B1/B2/B4/B5 not regressed · Ban coding until PRE BOTH PASS + AUTHORIZE · EXIT0≠covered）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-06
**Base**: `origin/feat/mysql-schema-skeleton` tip（includes AI/AJ rewrite + AL/AM/AG ancestors · Ban touch AL/AM/AG · Ban 共享 SSOT）
**Prior REQUEST**: `43e2dbc` ← `ae5367e` · **FAIL**: `e883bf8`（Re-PRE · B-R1）· `6790cc6`（PRE · B1–B5）· **Peer e2e PASS** `899fef2` alone ≠ dual
**Authority**: meetwise — L0 docs only · Ban coding · Ban prove · Ban self-approve · Ban buy cloud · Ban Meridian · Ban secrets · Ban force-push

## One-line

UC-E2E-025：矩阵 `:125` ADV=**blind** · 行 **gap** · NHP 无 ADV 行。本 re-PRE rewrite 解除 FAIL `6790cc6` **B1–B5**：A1 钉 404 `not_found_or_forbidden`（`:214-218`）+ 正控 202 + MUT-A1；**删 A2**（无客户端 expiry 面）；A3 按 `e883bf8` B-R1 option **(b)**：**ADV-new 仅 A3-b**（跨主体 resume-id → **409 `resume_version_mismatch` @ `:266`** · `:266` 前无 resume owner 闸 · owner 检查在其后 bind `:300`）；A3-a（大写 UUID → 通过版本守卫 · 不 409 · `UUID_RE` `/i` `:28` · W R4）/ A3-c（W R2）/ A3-NULL（W R5 · `:260` 有意放行）= **W R4/R2/R5 真 PG + HTTP 补充复验 · complementary ≠ ADV-new · 不计 ADV 证据**；MUT-A3a（去 `:263` lowercase → A3-a 变 409）/ MUT-A3b（放宽 `:266` → A3-b 不再 409）；ADV-new EXIT0 = **A1 + A3-b + PC-A1**；PC-A1 seed（entitlement bucket · quiz ready · expires_at 未来 · pin resume_id = header · epoch = 当前）；**A1 先于 PC-A1**；runner 仅增量登记 `uc025:nhp-adv:prove`（`run-e2e-isolated.mjs` + package.json · AG `7eb1c88` 先例 · 不改其他目标行为）。证据层 = `run-e2e-isolated.mjs` 真 PG+Nest HTTP+FORCE RLS；具名回归 neg/bound/fault/fault-isolated EXIT0。canHonestlyFlip=false · coveredCount=8.

## Products

| Role | Path |
|------|------|
| Harness | `harness/nhp-025-adv-01-blind-to-case.md`（rewrite） |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-06-nhp-025-adv-01-blind-to-case-mw-e2e-ha.md` |
| Dual `mw-rag-route` | `reviews/REQUEST-2026-10-06-nhp-025-adv-01-blind-to-case-mw-rag-route.md` |

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban SSOT edit（matrix / backlog / checklist）· Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban 碰 AL/AM/AG 禁触文件 · Ban product/infra code（except 纯增量 runner 目标登记 · 仅增量登记、不改其他目标行为）· Ban borrow W R4/R2/R5 绿为 ADV · Ban wash B'' NEG / AA FAULT / W BOUND+FAULT-ISOLATED · Ban relabel stale_quiz 为 ADV · Ban flip ADV/row · EXIT0≠covered · Ban fake DB。

*Slice · NHP-025-ADV-01 blind→case · Line AK · draft:awaiting_pre_exec_dual · re-PRE2 supersedes 43e2dbc ← ae5367e · FAIL e883bf8 B-R1 (b) · FAIL 6790cc6 · STOP*

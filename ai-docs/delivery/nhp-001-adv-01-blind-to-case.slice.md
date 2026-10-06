# Slice — **NHP-001-ADV-01 · UC-001 ADV blind→case**（Line AG · docs REQUEST rewrite · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST rewrite · supersedes `5eba515` · FAIL `863a5e6` B1–B5 addressed · Ban live · Ban fake-model · Ban fake-green suite · SCOPE UC-001 ADV only）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-06
**Base**: `origin/feat/mysql-schema-skeleton` · `ac590ab7b513a9b776c6a6399eb2eb75258e9582`
**Prior REQUEST**: `5eba515`（superseded）· FAIL receipt `863a5e6`（retained）
**Authority**: meetwise — L0 docs only · Ban coding · Ban prove · Ban self-approve

## One-line

选 **NHP-001-ADV-01**（matrix `:112` ADV=**blind**/case-only）—— rewrite 后：V1/V2/V4 靶 **`POST /interview/:id/turn`（TurnDto `.strict()`）**（可选 preview `/:id/answers` + 钉 `MEETWISE_PUBLIC_PREVIEW` · 不混写）；**Ban** GONE `/answer`；V3 仅 `POST /resume`（UploadResumeDto 非 strict · 剥离多余键）· **JD/quiz 文本 ingress = absent**；逐 V 钉 status/error + 副作用快照；正控合法 `/turn`→202+1 answer job · 变异去 `.strict()`→V1 转红（temp · 不提交）· V4 confirmed = 隔离 PG seeded fixture（Ban 无模型主链叙述）；执行后 `uc001:nhp-neg:prove` + `uc001:nhp-bound:prove` EXIT0（Ban 改 proof · Y/AB baseline）。V5 GuardrailHit **absent**。**Ban live** · **Ban fake-model** · EXIT0 ≠ covered · coveredCount=8。Dual = mw-e2e-ha + mw-rag-route（re-PRE）。

## Products

| Role | Path |
|------|------|
| Harness | `harness/nhp-001-adv-01-blind-to-case.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-06-nhp-001-adv-01-blind-to-case-mw-e2e-ha.md` |
| Dual `mw-rag-route` | `reviews/REQUEST-2026-10-06-nhp-001-adv-01-blind-to-case-mw-rag-route.md` |

## Choice

**NHP-001-ADV-01**（blind · clearly OPEN · non-conflicting）over GAP-UC004-FAULT residual（gap · Line T 收据已存 · 留作下一候选）。Ban 018/052/025 · Ban wash Y/AB。

## B1–B5（rewrite 对照）

| # | Fix |
|---|-----|
| B1 | V1/V2/V4 → `/turn`（可选 `/answers`+env pin）；Ban GONE `/answer` |
| B2 | 删发明 quiz/JD；V3=`POST /resume` only；JD ingress=absent |
| B3 | 逐 V 钉 HTTP+error+副作用快照；strict→400 invalid/unrecognized_keys；resume 非strict 剥离 |
| B4 | 正控 202+1 answer job；变异去 `.strict()`；V4 seeded confirmed 披露 |
| B5 | 执行后 neg+bound prove EXIT0 · 零 proof 改动 |

## Ban

Ban coding · Ban prove · Ban live · Ban fake-model · Ban fake-green suite · Ban covered flip · Ban invent covered · Ban wash Y/AB · Ban wash 031/032 旁证 · Ban touching 018/052/025 · Ban SSOT flip · Ban self-approve · Ban self-nail · Ban Meridian · Ban secrets · Ban force-push · Ban 碰 AD/AE/AF/AH · Ban 靶 `/answer` · Ban 发明 JD ingress。

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503.

*Slice · NHP-001-ADV-01 · Line AG · awaiting_pre_exec_dual · rewrite · STOP*

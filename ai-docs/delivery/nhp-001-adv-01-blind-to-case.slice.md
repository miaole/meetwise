# Slice — **NHP-001-ADV-01 · UC-001 ADV blind→case**（Line AG · **`post_prove_dual_pass`** · EXIT0≠covered · ADV stays blind/case-only）

**Status**: **`post_prove_dual_pass`**（Line AG nail 2026-10-06 · prove tip NAILED TO `7eb1c88` · REQUEST `51af3b2` · ADV EXIT0 **63/63** · B5 26/26+17/17 · mutation discarded · POST dual BOTH PASS e2e `0e6d58c` + rag `2bf22c5` · ADV stays blind/case-only · EXIT0≠covered · coveredCount=8）
**History**: ~~`prove:awaiting_post_dual`~~ → POST dual BOTH PASS → nail
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-06
**Base**: REQUEST `51af3b2` · prove on `origin/feat/mysql-schema-skeleton`（historical parent note `71ad2a7` corrected → REQUEST git parent `c562906`）
**Prior REQUEST**: `4e9f568`（superseded by re-PRE3）← `626e060` ← `5eba515` · FAIL receipts `a3364b4`/`71ad2a7`（rag Re-PRE2 · B-R2-1 · retained）· `3f3a2e4`（e2e re-PRE · N1–N4 · retained）· `863a5e6`（rag PRE · B1–B5 · retained）
**B5 self-check**: `receipts/2026-10-06-nhp-001-adv-01-b5-env-selfcheck.md`（reason tags `docker.sock` + `key`）
**Authority**: meetwise-core AUTHORIZE nail · BOTH POST PASS · Ban self-approve beyond this nail · Ban invent covered

## One-line

选 **NHP-001-ADV-01**（matrix `:112` ADV=**blind**/case-only）—— **re-PRE3** rewrite：V1/V2/V4 靶 **`POST /interview/:id/turn`（TurnDto `.strict()`）**；**Ban** GONE `/answer`；V3 仅 `POST /resume` · 钉 HTTP **200**（`resume.controller.ts:17`）；正控与 V2 **各自独立** seed `status='issued'` 题（不同 questionId/turn）；变异去 `.strict()`→V1 EXIT≠0 且记实际 status/error（预期 202 或 409 `question_not_ready`/`stale_question` · 非 400）；LEDGER-SNAP = **`entitlement_consumption`** + owner **total row count** + **all buckets**（镜像 bound `:158-162`）；B5 两独立标签 **`env-blocked(docker.sock)`**（落点 `run-e2e-isolated.mjs:2124/:2134`）与 **`L0-guard(key)`**（neg `:61-65` / bound `:56-60` · L0=Key only）· 自检收据 `receipts/2026-10-06-nhp-001-adv-01-b5-env-selfcheck.md` · **B5 未满足 → ADV ≠ EXIT0**。N1–N4 / B1–B5 retained。V5 GuardrailHit **absent**。**Ban live** · EXIT0 ≠ covered · coveredCount=8。Dual = mw-e2e-ha + mw-rag-route（**re-PRE3** · peer PASS alone ≠ dual）。

## Products

| Role | Path |
|------|------|
| Harness | `harness/nhp-001-adv-01-blind-to-case.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-06-nhp-001-adv-01-blind-to-case-mw-e2e-ha.md` |
| Dual `mw-rag-route` | `reviews/REQUEST-2026-10-06-nhp-001-adv-01-blind-to-case-mw-rag-route.md` |
| B5 self-check（B-R2-1） | `receipts/2026-10-06-nhp-001-adv-01-b5-env-selfcheck.md` |
| B5 ENV-capable | `receipts/2026-10-06-nhp-001-adv-01-b5-env-capable.md` |
| Prove receipt | `receipts/2026-10-06-nhp-001-adv-01-prove.md` |
| ADV proof | `apps/api/test/uc-e2e-001-nhp-adv.proof.ts` |
| POST `mw-e2e-ha` | `reviews/REQUEST-2026-10-06-nhp-001-adv-01-blind-to-case-post-mw-e2e-ha.md`（`0e6d58c` PASS） |
| POST `mw-rag-route` | `reviews/REQUEST-2026-10-06-nhp-001-adv-01-blind-to-case-post-mw-rag-route.md`（`2bf22c5` PASS） |

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

## N1–N4（re-PRE2 · FAIL `3f3a2e4` 对照）

| # | Fix |
|---|-----|
| N1 | 账本快照/V4 seed 表 `consumption_record` → **`entitlement_consumption`**（+ bucket units · outbox 计数）；非空转守卫（恰 1 行 + 状态符合 · 否则 FAIL）+ 守卫自检变异 |
| N2 | V4 fixture 离线调用 `completeInterviewAndConfirm` → interview `completed` + confirmed + units_settled + bucket consumed（披露 seeded）；V1-replay **400** · V2 族 replay **409** `interview_not_active` · job delta 0 · LEDGER-SNAP 逐字节同 |
| N3 | B5 env EXIT1：**两独立标签** `env-blocked(docker.sock)`（落点 `:2124/:2134`）与 `L0-guard(key)`（L0=Key assert only · neg `:61-65` / bound `:56-60`）· Ban 合并；自检收据 `receipts/2026-10-06-nhp-001-adv-01-b5-env-selfcheck.md`；B5 未满足 → ADV ≠ EXIT0；授权后须 ENV-capable EXIT0 · 零 proof 改动 |
| N4 | 引文区 fenced 逐字；`/turn` 移入读码观察 + SSOT `:72` `/answer` / `:58` JD / `:76` `consumption_record` 漂移注记（Ban SSOT edit） |

## C1–C6（re-PRE3 · FAIL `a3364b4`/`71ad2a7` 对照）

| # | Fix |
|---|-----|
| B-R2-1 | 逐字自检收据入库 · harness B5 引用路径 |
| C1 | docker 落点 `:2124/:2134` · L0=Key only · 两独立标签 `env-blocked(docker.sock)` / `L0-guard(key)` |
| C2 | 变异记 V1 实际 status+error（202 或 409 · 非 400）+ EXIT≠0 · temp only |
| C3 | LEDGER-SNAP + owner total consumption rows + all buckets（bound `:158-162`） |
| C4 | 正控与 V2 各独立 seed issued 题（不同 questionId/turn）· Ban 共享 |
| C5 | V3 钉 HTTP **200**（`resume.controller.ts:17`） |
| C6 | 断言 seeded 题行 `status='issued'` |

## Ban

Ban live · Ban fake-model · Ban fake-green suite · Ban covered flip · Ban invent covered · Ban wash Y/AB · Ban wash 031/032 旁证 · Ban touching 018/052/025 · Ban SSOT flip · Ban self-approve · Ban self-nail · Ban Meridian · Ban secrets · Ban force-push · Ban 碰 AD/AE/AF/AH · Ban 靶 `/answer` · Ban 发明 JD ingress · Ban `consumption_record` 快照 · Ban 合并 docker.sock/Key L0 标签 · Ban env-EXIT1 叙述为回归通过/ADV 通过 · Ban 正控/V2 共享种子 · Ban V3 模糊 2xx · Ban 非逐字引文。

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503.

## NAIL（2026-10-06 · Line AG · `post_prove_dual_pass` · EXIT0≠covered · ADV stays blind/case-only）

- Lifecycle → **`post_prove_dual_pass`**（authorized coordinator nail · AUTHORIZE nail · BOTH POST PASS · implementer does not self-approve beyond this nail）.
- REQUEST `51af3b2`（`51af3b273bf51945808c7bb31843b53dfcce44fc`）→ PRE dual mw-e2e-ha `6a35c47` + mw-rag-route `7706bf7` PASS → prove tip **NAILED TO** `7eb1c88`（`7eb1c88ee63aea2fb45a51bf708c0801fc03d22c`）· ADV **EXIT 0 · 63/63** · B5 neg **26/26** + bound **17/17** · mutation discarded.
- POST dual BOTH PASS: mw-e2e-ha `0e6d58c`（`0e6d58c5801083db7c5bd29d6d912c4cc083167e`）+ mw-rag-route `2bf22c5`（`2bf22c56aa47f17e0f466e3b96ef926ef9063168`）· alone≠dual.
- **EXIT0≠covered** · ADV stays **blind/case-only** · Ban invent covered · Ban wash Y/AB · Ban flip ADV to covered · coveredCount=**8**.
- Pins: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · Ban buy cloud · Ban secrets · Ban force.
- Keep siblings（Y/AB/AL/AM · AI/AJ/AK）as written. Ban coding · Ban HA · Ban live · Ban Meridian · Ban claiming covered · Ban self-approve beyond this AUTHORIZE nail.

*Slice · NHP-001-ADV-01 · Line AG · post_prove_dual_pass · EXIT0≠covered · ADV stays blind/case-only · coveredCount=8 · Ban wash Y/AB · STOP*

# Harness — **NHP-025-ADV-01 · UC-025 ADV blind→case evidence**（Line AK · docs REQUEST rewrite · **`draft:awaiting_pre_exec_dual`** · row UC-E2E-025 stays gap · ADV stays blind until case）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST rewrite **re-PRE** · supersedes REQUEST `ae5367e` · cites rag PRE-EXEC FAIL `6790cc6` **B1–B5** (+ C1–C2）· peer e2e PASS `899fef2` alone ≠ dual · Ban coding · Ban prove · EXIT0≠covered · canHonestlyFlip=false · Ban wash B'' NEG / AA FAULT / W BOUND+FAULT-ISOLATED · Ban self-approve）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton`（includes AI/AJ rewrite + AL/AM/AG as ancestors · **Ban touch** AL/AM/AG files · **Ban** 共享 SSOT：coverage matrix / gap-bug-backlog / execution checklist）
**Prior REQUEST**: `ae5367ef94680b5cdcd35e22ebd6195d803861a7`（pre_dual · **superseded by this re-PRE rewrite**）
**FAIL receipt**（retained · 不擦除）: `6790cc6d3e72ab5545a5071838b99b4fe0aaf8da`（mw-rag-route PRE-EXEC FAIL on `ae5367e` · B1–B5）
**Peer note**: mw-e2e-ha PRE-EXEC PASS `899fef248d7d247f8425c037109ed4efde008e71` · **alone ≠ dual** · rag FAIL ⇒ BOTH not PASS
**Wave**: Line **AK** rewrite（after AI · AJ）
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING re-PRE · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban SSOT edit · Ban coding · Ban self-nail · status `draft:awaiting_pre_exec_dual`
**Knife**: **NHP-025-ADV-01（Line AK）· UC-025 押题过期 ADV · blind→case 显式化**（跨用户 quiz-id + ADV-new 版本绕过向量）
**Gap id**: **`GAP-UC025-ADV-01`**（本刀具名 · 服务 NHP-025-ADV-01；不发明 covered · 本 REQUEST 不登记进 matrix/backlog）
**Case id**: **`NHP-025-ADV-01`**（**拟名** · NHP 矩阵无登记行 · 本 REQUEST **不** 补）
**Row**: **`UC-E2E-025`** ADV 列 only · ADV stays **blind** · row stays **gap** · canHonestlyFlip=false

## Rewrite note（re-PRE · supersedes `ae5367e` · FAIL `6790cc6` B1–B5 + C1–C2）

本稿解除 mw-rag-route PRE-EXEC FAIL `6790cc6` 阻断项 B1–B5，并落实非阻塞 C1–C2。peer e2e PASS `899fef2` **alone ≠ dual**。e2e 与 rag 均须对本稿 **re-PRE dual**。**不**擦除 FAIL 收据正文（见 rag stub 历史段）。

| # | 阻断 / 条件（`6790cc6`） | 本稿修订 |
|---|------|------|
| **B1 A1** | 状态码未钉 / 设计交给审查者 | 钉 404 `not_found_or_forbidden`（`interview.service.ts:214-218`）· 抛点先于 `:222/:239/:242/:266` · 无 `reserveEntitlement` `:329` · 无 `enqueueInterviewJob` `:337` · ledger/job 不变；fixture = 自己的 interview + **他人** quiz；正控 = 同 interview + 自己新鲜已 pin quiz → **202**；与 `:200` 同码 404 区分 |
| **B2 A2** | begin 无客户端 expiry 入口 · relabel `stale_quiz` 风险 | **删除 A2**（controller `:22-26` 无 body / 无客户端 expiry 输入 · 无攻击面）· **不**把 `stale_quiz` 当 ADV |
| **B3 A3** | 与 W BOUND 重叠 · 未列绕过向量 | 列具体 bypass 向量 · 标 ADV-new；`:263` lowercase · `:260` NULL pin 有意放行 ≠ 红；Ban borrow W-covered 向量当 ADV pass |
| **B4** | 证据层未声明 | 单一层：`run-e2e-isolated.mjs` 真 PG + Nest HTTP + FORCE RLS（`20_resume_quiz.sql:46-49`） |
| **B5** | 无正控 / mutation / 回归 | 具名回归 EXIT0 零改动；每 A-case ≥1 真变红 mutation（警告：只去 `owner_user_id` 过滤在 FORCE RLS 下不够）· env EXIT1 ≠ pass |
| **C1–C2** | gap 边界 / attempts | A1/A3 不与 R4 `wrong_track` 混用；attempts=1 · CMD+EXIT+±08:00+SHA · EXIT0≠covered≠ADV 升格≠nail≠HA |

## 0. 为何新开文件

NEG（B'' · `GAP-UC025-NEG-01` CLOSED wired · frozen）/ BOUND（Line W · `harness/nhp-025-bound-01-version-pin.md`）/ FAULT（Line AA · `harness/nhp-025-fault-01-missing-expiry-fail-closed.md`）/ FAULT-ISOLATED（Line W · `GAP-UC025-FAULT-ISOLATED-01`）均已 nail 封存；本刀新开 ADV 文件，旧文件只读引用 · 零改写。

## 1. Quoted from the files（只读 @ tip · 零改写）

- `e2e-requirement-coverage-matrix.md:125` UC-E2E-025 行：NEG=**gap** · FAULT=**gap** · BOUND=**gap** · **ADV=`**blind**`** · 行尾：「ADV blind · ≠ covered · coveredCount=8」。
- `non-happy-path-perf-load-case-matrix.md`：NHP-025-* 仅 `:84` **NHP-025-NEG-01** 一行；**无 NHP-025-ADV-01 登记行**（登记缺口 · 本 REQUEST **不** 补 · Ban 碰共享 SSOT）。

## 2. 读码前置观察（B1/B2/B3 · file:line · 只读 @ tip）

- **begin 入口**：`interview.controller.ts:22-26` `POST /:id/begin`（202）只收 header `resume-id` / `quiz-id` · **无 body · 无客户端 expiry / version 输入** → A2 **无攻击面**（已删）。
- **A1 抛点**：`interview.service.ts:214-218` quiz 按 `owner_user_id` 查不到 → **404 `not_found_or_forbidden`** · 先于 `:222` `stale_quiz` / `:239/:242` `missing_quiz_expiry` / `:266` `resume_version_mismatch`。
- **同码区分**：`:200` interview 不可见 → 同码 404 `not_found_or_forbidden` —— fixture 用**自己的 interview + 他人 quiz** 钉 A1，避免与 interview 不可见混淆。
- **副作用闸**：抛点先于 `reserveEntitlement` `:329` · `enqueueInterviewJob` `:337` → 额度与 job 计数不变。
- **BOUND 锚**：`:260` pin 为 NULL 时跳过版本检查（**有意设计放行 · ≠ 红 · ≠ ADV bypass**）；`:263` resume-id 比较前 `toLowerCase`；`:266` 409 `resume_version_mismatch`（W BOUND）。
- **FORCE RLS**：`packages/db/sql/20_resume_quiz.sql:46-49` `ENABLE` + `FORCE ROW LEVEL SECURITY` + `p_owner` 策略。

## 3. blind→case 显式化

| 今日 | 本 REQUEST | 授权后（拟 · 未授权） |
|------|------------|------------------------|
| ADV=blind · 无具名 case · 无 CMD+EXIT | docs：具名 gap `GAP-UC025-ADV-01` + 拟 case `NHP-025-ADV-01` + A1/A3 对抗合同（rewrite）+ dual stubs | 拟 `pnpm uc025:nhp-adv:prove`（`run-e2e-isolated.mjs` · **Ban live**） |

## 4. 对抗合同（ADV · B1/B2/B3 · 拟）

### A1 — 跨用户 quiz-id（B1 · ADV-new）

| 项 | 钉死 |
|----|------|
| Fixture | principal A 的 **own interview** + header `quiz-id` = principal B 的 quiz（**他人**） |
| 期望 | **404** `{error:'not_found_or_forbidden'}`（`:214-218`） |
| 顺序断言 | 抛点 **先于** `:222/:239/:242/:266` · **未**调用 `reserveEntitlement`（`:329`）· **未**调用 `enqueueInterviewJob`（`:337`）· `entitlement_consumption` / `interview_job` 计数不变 |
| 正控 PC-A1 | 同 interview + **own** fresh pinned quiz（ready · 非空 expires_at · pin 匹配）→ **202** `{accepted:true,…}` |
| 与 `:200` 区分 | 同码 404 但 interview 行可见（own）· quiz 因 owner 不可见 |
| Mutation **MUT-A1** | temp：把 `:217-218` rowCount===0→404 改为放行 → 随后 `:219` 取 `rows[0]` 抛 TypeError → **500 ≠ 404** → A1 断言红 · EXIT≠0 · never commit |
| Mutation 警告 | **只去掉** `:214` 的 `owner_user_id=$2` **不够**：真 PG 下 FORCE RLS 仍挡 · `:232`/`:256` 同款查询仍在 → **不会变红** · 不得当负控 |

### A2 — **DELETED**（B2）

begin 不接受任何客户端 expiry 输入（controller `:22-26`）。「客户端声称未过期」无入口。**不**把 409 `stale_quiz`（`:222` = B'' NEG）relabel 为 ADV。本刀合同 **无 A2**。

### A3 — 版本 pin 绕过向量（B3 · 列明 · Ban borrow W）

期望码仍可能是 409 `resume_version_mismatch`（`:266`）——须有 **ADV-new delta**，**Ban** 把 W BOUND 已覆盖向量当 ADV pass。

| id | 向量 | ADV-new? | 期望 |
|----|------|----------|------|
| **A3-a** | resume-id **大小写变体**（同 UUID · 不同 casing） | 部分（测 `:263` lowercase 后仍等价通过 / 仍拒要写清） | 与 pin 比较经 `toLowerCase` 后：匹配 → 不因 casing 误拒；不匹配 → 仍 409 `resume_version_mismatch` |
| **A3-b** | **他人** resume-id（异于 quiz pin 的 resume） | **ADV-new**（跨主体面 · 异于 W 同主体 version 失配） | 409 `resume_version_mismatch`（或先于其的 owner 闸）· **无**扣额/入队 |
| **A3-c** | **epoch 漂移**（pin epoch ≠ 当前 resume.privacy_epoch） | 若 W 已覆盖同向量 → **标 W-covered · Ban 借绿**；仅当 fixture/断言 delta 明示 ADV-new 才计入 | 409 `resume_version_mismatch` |
| **A3-NULL** | quiz pin `resume_id` / epoch 为 **NULL** | **非红** · `:260` 有意设计放行 · **≠ bypass 成功 · ≠ ADV pass** | 跳过版本检查（如实登记） |
| Mutation **MUT-A3** | temp：去掉 `:263` lowercase 或放宽 `:266` 失配闸 | A3-b/A3-a 期望断言红 · EXIT≠0 · never commit | |

旁证（B'' NEG `stale_quiz` 409 · W BOUND `resume_version_mismatch` 409 · AA/W FAULT `missing_quiz_expiry` 409）**≠** ADV 收据；Ban 借其绿。

## 5. 证据层（B4 · 单一表述）

- **唯一证据层**：`scripts/run-e2e-isolated.mjs` **隔离真 PG** + **真 Nest HTTP** + **FORCE RLS**（`packages/db/sql/20_resume_quiz.sql:46-49`）。
- A1 跨用户语义 **仅** 在真 PG + FORCE RLS 下有意义；**Ban fake DB**。
- **Ban** 全文混用「in-process only」与「隔离壳三层」矛盾措辞。

## 6. prove 方案（授权后 · Ban live · C2）

- **CMD（拟）**: `pnpm uc025:nhp-adv:prove`（via `run-e2e-isolated.mjs`）· **attempts=1** · 全记录。
- **期望 EXIT**: A1+A3+PC 齐 → **EXIT 0**；否则 **EXIT ≠ 0**。
- **时间戳**: 起止 Asia/Shanghai（**+08:00**）+ code SHA。
- **EXIT0** = case 证据；**EXIT0≠covered** · ADV 列升格 **仅** 经 prove + POST dual + nail + 协调方授权 · 行 stays **gap** · canHonestlyFlip=false。
- **EXIT1** = 诚实保留（含产品未接线红）· Ban retry-to-green · Ban 改断言洗绿。

## 7. 回归（B5 · 授权执行后 · 零 proof 改动）

| CMD | 要求 |
|-----|------|
| `pnpm uc025:nhp-neg:prove` | EXIT **0** · 零 proof 改动 |
| `pnpm uc025:nhp-bound:prove` | EXIT **0** · 零 proof 改动 |
| `pnpm uc025:nhp-fault:prove` | EXIT **0** · 零 proof 改动 |
| `pnpm uc025:nhp-fault-isolated:prove` | EXIT **0** · 零 proof 改动 |

**Env EXIT1**（docker.sock / Key L0）≠ pass ≠ regression；如实记录后 `with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL` 重跑。B5 未满足 → ADV ≠ EXIT0。

## 8. 行语义（冻结）

- UC-E2E-025 行 stays **gap** · ADV stays **blind** until case · canHonestlyFlip=false · coveredCount=8。
- 本 REQUEST 零 matrix/backlog/checklist edit（含不补 NHP-025-ADV-01 行 · **Ban 抢 AL/AM nail SSOT**）。

## 9. Ban 列表

- **Ban wash B'' NEG** · **Ban wash AA FAULT**（`3a6ec52` / `a8b98fc`）· **Ban wash W BOUND**（`e8fa74c` / `6853e17`）+ **FAULT-ISOLATED**（`e8d8a91` / `cce33ba`）
- Ban relabel `stale_quiz` 为 ADV · Ban borrow W-covered 向量当 ADV pass · Ban 把 NULL pin 放行当红/当 bypass
- Ban flip ADV 列 / 行 off gap · Ban invent covered · Ban live · Ban fake-green suite · Ban fake DB
- Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban SSOT edit（matrix / backlog / checklist）· Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban 碰 AL/AM/AG 禁触文件 · Ban product/infra code
- **C1**：A1/A3 与 R4 `wrong_track` 语义不混用；`GAP-UC025-ADV-01` 不与 NEG/BOUND/FAULT/FAULT-ISOLATED gap 混用

## 10. Non-claims

Not a pass · not run · not covered · ADV not case-evidenced · not nail · not HA · not `releaseEvidence=true` · EXIT0≠covered · alone ≠ dual · peer `899fef2` alone ≠ BOTH · canHonestlyFlip=false

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · canHonestlyFlip=false · row UC-E2E-025 stays gap · ADV blind · STOP

*Harness · NHP-025-ADV-01 · UC-025 ADV blind→case evidence · Line AK · 2026-10-06 · draft:awaiting_pre_exec_dual · re-PRE rewrite supersedes ae5367e · FAIL 6790cc6 B1–B5 · peer e2e PASS 899fef2 alone≠dual · Ban coding · ADV blind · alone ≠ dual · STOP*

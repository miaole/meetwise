# REQUEST — **NHP-025-ADV-01 · UC-025 ADV blind→case evidence** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub rewrite **re-PRE** · awaiting re-PRE · Ban self-approve · alone ≠ dual · 不代签 peer）
**Rewrite**: **supersedes REQUEST `ae5367e`** · cites mw-rag-route PRE-EXEC FAIL **`6790cc6`**（`6790cc6d3e72ab5545a5071838b99b4fe0aaf8da`）**B1–B5 addressed** (+ C1–C2）· peer e2e PASS `899fef2` alone ≠ dual · Ban coding · ADV blind · canHonestlyFlip=false
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Peer**: `mw-e2e-ha`（独立签 · alone ≠ dual）
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

## 请审什么（mw-rag-route · re-PRE · B1–B5 + C1–C2）

Line AK · NHP-025-ADV-01。本 stub 为 **re-PRE rewrite**（**supersedes `ae5367e`** · cites FAIL **`6790cc6`** · 解除 B1–B5 + C1–C2；peer PASS `899fef2` **alone ≠ dual**）。请审：

1. **B1 A1**：404 `not_found_or_forbidden`（`:214-218`）· 先于 `:222/:239/:242/:266` · 无 `reserveEntitlement` `:329` / `enqueueInterviewJob` `:337` · own interview + other's quiz · 正控 → 202 · 与 `:200` 同码区分 · MUT-A1（警告 FORCE RLS）。
2. **B2 A2**：**已删除**（`:22-26` 无客户端 expiry）· Ban relabel `stale_quiz`。
3. **B3 A3**：列 A3-a/b/c + A3-NULL（`:260` 有意放行 ≠ 红 · `:263` lowercase）· 标 ADV-new · Ban borrow W · MUT-A3。
4. **B4**：`run-e2e-isolated.mjs` 真 PG + Nest HTTP + FORCE RLS（`20_resume_quiz.sql:46-49`）· Ban fake DB · 全文单一表述。
5. **B5**：回归 `uc025:nhp-neg|bound|fault|fault-isolated:prove` EXIT0 零改动；每 A-case ≥1 mutation；env EXIT1 ≠ pass。
6. **跨用户/服务端锚**：A1 需 RLS/principal；A2 已删故无客户端声明路径；gap 命名不与 NEG/BOUND/FAULT 混用。
7. **C1–C2**：不与 R4 `wrong_track` 混用；attempts=1 · CMD+EXIT+±08:00+SHA · EXIT0≠covered≠ADV 升格≠nail≠HA。

UC-E2E-025 row stays **gap** · ADV stays **blind** until case · **EXIT0≠covered** · canHonestlyFlip=false · coveredCount=8 · Ban wash B'' NEG / AA FAULT / W BOUND+FAULT-ISOLATED.

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban SSOT edit（matrix / backlog / checklist）· Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban 碰 AL/AM/AG 禁触文件 · Ban product/infra code · Ban relabel stale_quiz · Ban fake DB。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-rag-route` re-PRE · implementer 不得填写）

---

*Stub · re-PRE rewrite · supersedes ae5367e · FAIL 6790cc6 B1–B5 · peer PASS 899fef2 alone≠dual · Ban coding · ADV blind · awaiting expert re-PRE dual · STOP*

---

## Rewrite note · re-PRE（append · do not erase FAIL section below）

**re-PRE · supersedes `ae5367e` · cites FAIL `6790cc6`** · B1–B5 + C1–C2 landed in harness/slice · A2 deleted · Status stays `draft:awaiting_pre_exec_dual` · Pins unchanged · ADV blind · canHonestlyFlip=false · Ban coding · Ban wash B''/AA/W · peer e2e PASS `899fef2` alone ≠ dual。

下方 Historical FAIL 正文 **原样保留不擦除**；本段仅为 rewrite 注记，**不**构成对本稿的 PASS/FAIL。

---

## mw-rag-route PRE-EXEC 审查 · Line AK · NHP-025-ADV-01（2026-10-06T14:29+08:00）

**审查者**: `mw-rag-route`（独立域 · 只审不改产品 · 不代签 peer `mw-e2e-ha` · alone ≠ dual）
**REQUEST**: `ae5367e`（`ae5367ef94680b5cdcd35e22ebd6195d803861a7`）· 作者 meetwise-core · 2026-10-06T14:19:00+08:00
**审查时 origin tip**: `5be471c`（协调方所述 wave tip `c562906` 已被超越；按当前 origin 审）
**执行机器**: 仅本 box（Linux 6.12 · 临时 worktree `/tmp/mwrr-ak` @ origin tip · detached）；未在用户 Mac / 任何 machineId 上执行；未跑 prove（PRE 可选，本审未跑）。
**门文档**: `north-star-hard-gates.md` · `harness/nhp-025-adv-01-blind-to-case.md` · `nhp-025-adv-01-blind-to-case.slice.md` · `harness/NORTH-STAR-EXECUTION-LOOP.md`（**在** origin：`ai-docs/delivery/harness/`，`3003392` 引入）

### 1. REQUEST 提交核对

- `ae5367e` 是 origin tip 祖先。文件 4 个全 docs（harness · slice · 两 dual stub）；零 `apps/` `packages/` `scripts/` `package.json`。✅

### 2. 已核实属实（✅）

- `e2e-requirement-coverage-matrix.md:125` UC-E2E-025：NEG / FAULT / BOUND = gap，**ADV = `**blind**`**，行尾「ADV blind · ≠ covered · coveredCount=8」——harness §1 引用一致。
- `non-happy-path-perf-load-case-matrix.md:84` 只有 NHP-025-NEG-01 一行，没有 NHP-025-ADV-01 行，属实；REQUEST 不补 SSOT，正确。（附注：`:84` 当前旗「产品未接线」已过时，B'' 已接线；不属本刀，nail 时再处理。）
- 禁洗清单 SHA 与矩阵一致：AA `3a6ec52`/`a8b98fc` · W BOUND `e8fa74c`/`6853e17` · FAULT-ISOLATED `e8d8a91`/`cce33ba`。无 covered 翻转；行保持 gap；pins 原样。

### 3. 产品源锚 spot-check（harness 本身零 file:line；以下为审查者自查）

- `interview.controller.ts:22-26` `POST /:id/begin`（202）只收 header `resume-id` / `quiz-id`，**没有 body，也没有任何客户端 expiry / version 输入**。
- `interview.service.ts`：`:194-195` 400 `missing_resume_id` / `invalid_resume_id`；`:200` interview 不可见 → 404 `not_found_or_forbidden`；`:205` 409 `interview_not_active`；`:214-218` quiz 按 `owner_user_id` 查不到 → **404 `not_found_or_forbidden`**；`:222` 409 `stale_quiz`（B'' NEG）；`:239` / `:242` 409 `missing_quiz_expiry`（AA/W FAULT；注：不是协调方说的 ~219-222，那一段是 stale_quiz / not_found）；`:260` pin 为 NULL 时跳过版本检查（设计放行）；`:263` resume-id 比较前 `toLowerCase`；`:266` 409 `resume_version_mismatch`（W BOUND）；`:329` `reserveEntitlement`；`:337` `enqueueInterviewJob`。
- `packages/db/sql/20_resume_quiz.sql:46-49` resume_quiz 开启 **FORCE RLS** + `p_owner` 策略；`expires_at` 可空（`:15`；`migrations/0135_resume_quiz_freshness_anchor.sql:6`）。
- 现有 UC-025 proof（`apps/api/test/uc-e2e-025-*`）对 `not_found_or_forbidden` 的断言数 = 0 → A1（跨用户 quiz-id）确实是新面，不是换名。begin 是活路由（202）。

### Blockers（FAIL）

1. **B1 未钉精确状态码/错误码，设计交给审查者**：§3 标题写「专家 PRE 中裁定」，A1 只写「4xx 可解释」，违反 LOOP §3③。A1 须钉死 404 `not_found_or_forbidden`（`:214-218`），并断言抛点先于 `:222/:239/:242/:266`、未调用 `reserveEntitlement`（`:329`）、未调用 `enqueueInterviewJob`（`:337`）、额度与 job 计数不变。还要和 `:200`（interview 本身不可见）的同码 404 区分开：用**自己的 interview + 他人的 quiz**，并用同一 interview + 自己新鲜、已 pin 的 quiz 作正控 → 202。
2. **B2 A2 没有攻击面**：begin 不接受任何客户端 expiry 输入（controller `:22-26`），所以「客户端声称未过期」在产品上没有入口。如果改成“携带伪造 body/header 字段 + 存储锚已过期”，期望码就是 409 `stale_quiz`（`:222`）＝ B'' NEG 的码，有换名风险。须二选一：删掉 A2；或写明与 NEG 的 delta（被注入的字段必须被忽略），并配一条 mutation（产品改成读客户端 expiry 时该断言必红）。
3. **B3 A3 与 W BOUND 重叠，未列绕过向量**：期望仍是 409 `resume_version_mismatch`（`:266`）＝ W 的码。须逐条列出具体向量并标明哪些是 ADV 新增：resume-id 大小写变体（`:263` 已 lowercase，应仍拒 / 仍通过要写清）、他人 resume-id、epoch 漂移，以及 NULL pin 设计放行（`:260`，要写明这是有意设计，不算绕过、不算红）。W 已覆盖的向量明确禁止借用。
4. **B4 证据层未声明**：全文只有「隔离」二字。A1 的跨用户语义只有在真 PG + FORCE RLS（`20_resume_quiz.sql:46-49`）下才有意义；fake DB 只能测到 WHERE 子句。须定为 `scripts/run-e2e-isolated.mjs` 隔离真 PG + 真 Nest HTTP（同 W FAULT-ISOLATED 层），并全文单一表述（`:125` FAULT/BOUND 单元格里“in-process”与“隔离壳三层”并存的先例不得重演）。
5. **B5 无正控、mutation、回归**：须具名 `uc025:nhp-neg:prove`、`uc025:nhp-bound:prove`、`uc025:nhp-fault:prove`、`uc025:nhp-fault-isolated:prove` 在实现 tip 上 EXIT 0 且 proof 零改动；每个 A-case 至少一条会真变红的 mutation（例如把 `:217-218` 的 rowCount===0 → 404 改成放行 → `:219` 取 rows[0] 抛 TypeError → 500 ≠ 404，A1 必红；注意只去掉 `:214` 的 `owner_user_id=$2` **不够**：真 PG 下 FORCE RLS 仍会挡住，`:232`/`:256` 的同款查询也还在，这种 mutation 不会变红，不能当负控）；环境性 EXIT 1（docker.sock / 环境 `MODEL_API_KEY` 触发 L0 guard）不算通过也不算回归。

### 改写时一并落实（非阻塞）

- C1 A1 / A3 与 R4 `wrong_track` 语义不混用；`GAP-UC025-ADV-01` 不与 NEG/BOUND/FAULT/FAULT-ISOLATED gap 混用。
- C2 预声明 attempts=1、CMD+EXIT+起止（+08:00）+ code SHA；EXIT1（含产品未接线红）如实保留。EXIT0 ≠ covered ≠ ADV 列升格 ≠ nail ≠ HA。

### Pins（核对未变）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · gR45Closed=true · ms3EqualsR4Closed=false · public DELETE=503 · PG-retained（禁 MySQL runtime / Qdrant / MemorySaver）· UC-018 与 §1.1 仍 partial · UC-E2E-025 行 gap · ADV blind · PASS ≠ coding ≠ covered ≠ nail ≠ HA · EXIT0 ≠ covered。

本审不授权 coding / prove。peer `mw-e2e-ha` 独立审，本人未阅改其文件。

Verdict: FAIL

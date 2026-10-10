# REQUEST — **NHP-025-ADV-01 · UC-025 ADV blind→case evidence** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub rewrite **re-PRE2** · awaiting re-PRE · supersedes REQUEST `43e2dbc` · cites rag Re-PRE FAIL `e883bf8` B-R1 + §3 1–3 · Ban self-approve · alone ≠ dual · 不代签 peer）
**Rewrite**: **re-PRE2 · supersedes REQUEST `43e2dbc`**（`43e2dbc1992d2077ca742a6161084ab5052b89d4` ← `ae5367e`）· cites mw-rag-route Re-PRE FAIL **`e883bf8`**（`e883bf8c4d5dafb19af32a3d8713dd5a04ffe139`）**B-R1 → option (b)** + §3 1–3 · prior FAIL **`6790cc6`**（`6790cc6d3e72ab5545a5071838b99b4fe0aaf8da`）B1–B5 (+ C1–C2）cleared @`43e2dbc` · B1/B2/B4/B5 not regressed· peer e2e PASS `899fef2` alone ≠ dual · Ban coding · ADV blind · canHonestlyFlip=false
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

## 请审什么（mw-rag-route · re-PRE2 · B-R1 + §3 1–3 · 不回退 B1/B2/B4/B5）

Line AK · NHP-025-ADV-01。本 stub 为 **re-PRE2 rewrite**（**supersedes `43e2dbc`** ← `ae5367e` · cites Re-PRE FAIL **`e883bf8`** B-R1 + §3 1–3 · prior FAIL **`6790cc6`** B1–B5 + C1–C2 已于 `43e2dbc` 解除且本稿不回退；peer PASS `899fef2` **alone ≠ dual**）。请审：

1. **B1 A1**：404 `not_found_or_forbidden`（`:214-218`）· 先于 `:222/:239/:242/:266` · 无 `reserveEntitlement` `:329` / `enqueueInterviewJob` `:337` · own interview + other's quiz · 正控 → 202 · 与 `:200` 同码区分 · MUT-A1（警告 FORCE RLS）。
2. **B2 A2**：**已删除**（`:22-26` 无客户端 expiry）· Ban relabel `stale_quiz`。
3. **B-R1 A3（option (b) · `e883bf8`）**：**ADV-new 仅 A3-b**（跨主体 resume-id）→ 钉 **409 `resume_version_mismatch` @ `:266`** · 未扣额 `:329` / 未入队 `:337` · `:266` 前**无** resume owner 闸（owner 检查在其后 bind `:300` `AND r.owner_user_id=$2`）· 已删旧稿 A3-b「owner 闸替代期望」模糊措辞（期望唯一）；A3-a / A3-c / A3-NULL = 「W R4 / R2 / R5 向量在真 PG + HTTP 层的补充复验 · complementary ≠ ADV-new · 不计 ADV 证据」；A3-a 钉 pin 匹配大写 UUID → 通过版本守卫（不 409 · `UUID_RE` `/i` `:28` · W R4）；A3-NULL = W R5 / `:260` 有意放行 ≠ 红 ≠ ADV pass；MUT-A3a 去 `:263` lowercase → A3-a 变 409 · MUT-A3b 放宽 `:266` → A3-b 不再 409 · never commit；ADV-new EXIT0 = **A1 + A3-b + PC-A1**。
3b. **§3 1–3（`e883bf8`）**：runner 仅增量登记 `uc025:nhp-adv:prove`（`run-e2e-isolated.mjs` + 根/`apps/api` `package.json` · AG `7eb1c88` +16/-1 · 「仅增量登记、不改其他目标行为」· 否则 `unsupported_e2e_target`）；PC-A1 → 202 seed 披露（entitlement bucket 否则 `:329` 402 · quiz `ready` · `expires_at` 未来 · pin resume_id = header `resume-id` · epoch = 当前）；**A1 先于 PC-A1**（`:212-218` 先于 `alreadyBegun` `:321`/`:326` · Δ0 空表基线）。
4. **B4**：`run-e2e-isolated.mjs` 真 PG + Nest HTTP + FORCE RLS（`20_resume_quiz.sql:46-49`）· Ban fake DB · 全文单一表述。
5. **B5**：回归 `uc025:nhp-neg|bound|fault|fault-isolated:prove` EXIT0 零改动；每 A-case ≥1 mutation；env EXIT1 ≠ pass。
6. **跨用户/服务端锚**：A1 需 RLS/principal；A2 已删故无客户端声明路径；gap 命名不与 NEG/BOUND/FAULT 混用。
7. **C1–C2**：不与 R4 `wrong_track` 混用；attempts=1 · CMD+EXIT+±08:00+SHA · EXIT0≠covered≠ADV 升格≠nail≠HA。

UC-E2E-025 row stays **gap** · ADV stays **blind** until case · **EXIT0≠covered** · canHonestlyFlip=false · coveredCount=8 · Ban wash B'' NEG / AA FAULT / W BOUND+FAULT-ISOLATED.

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban SSOT edit（matrix / backlog / checklist）· Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban 碰 AL/AM/AG 禁触文件 · Ban product/infra code（except 纯增量 runner 目标登记 `uc025:nhp-adv:prove` · 仅增量登记、不改其他目标行为）· Ban borrow W R4/R2/R5 绿为 ADV · Ban relabel stale_quiz · Ban fake DB。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-rag-route` re-PRE · implementer 不得填写）

---

*Stub · re-PRE2 rewrite · supersedes 43e2dbc ← ae5367e · FAIL e883bf8 B-R1 option (b) + §3 1–3 · FAIL 6790cc6 B1–B5 · peer PASS 899fef2 alone≠dual · Ban coding · ADV blind · awaiting expert re-PRE dual · STOP*

---

## Rewrite note · re-PRE（append · do not erase FAIL section below）

**re-PRE · supersedes `ae5367e` · cites FAIL `6790cc6`** · B1–B5 + C1–C2 landed in harness/slice · A2 deleted · Status stays `draft:awaiting_pre_exec_dual` · Pins unchanged · ADV blind · canHonestlyFlip=false · Ban coding · Ban wash B''/AA/W · peer e2e PASS `899fef2` alone ≠ dual。

下方 Historical FAIL 正文 **原样保留不擦除**；本段仅为 rewrite 注记，**不**构成对本稿的 PASS/FAIL。

## Rewrite note 2 · re-PRE2（append · do not erase FAIL sections below · `6790cc6` + `e883bf8`）

**re-PRE2 · supersedes `43e2dbc` · cites Re-PRE FAIL `e883bf8`**（`e883bf8c4d5dafb19af32a3d8713dd5a04ffe139`）· 选 **option (b)** 解除 **B-R1**（原 B3）+ 落实 §3 1–3；B1/B2/B4/B5 + 锚点更正 + C1–C2 **不回退**。落点（harness）：Rewrite note 2 表 · §2 锚（`:28` / `:288-301` / `:321`/`:326` / `:331`/`:334`）· §4 A1 seed 表 + 顺序 · §4 A3（option (b) 表 + MUT-A3a/MUT-A3b）· §5.1 runner allow · §6 EXIT。
- **A3-b（ADV-new 唯一 A3）**：跨主体 resume-id → **409 `resume_version_mismatch` @ `:266`** · `:266` 前无 resume owner 闸（owner 检查在 bind `:300`）· 旧稿「owner 闸替代期望」模糊措辞已删（期望唯一）。
- **A3-a / A3-c / A3-NULL**：W R4 / R2 / R5 真 PG + HTTP 补充复验 · complementary ≠ ADV-new · 不计 ADV 证据。
- **EXIT**：ADV-new = A1 + A3-b + PC-A1；complementary 红则如实 EXIT≠0，绿不计 ADV。
- Status stays `draft:awaiting_pre_exec_dual` · Pins unchanged · ADV blind · row gap · canHonestlyFlip=false · Ban coding · Ban wash B''/AA/W · peer e2e PASS `899fef2` alone ≠ dual。本段**不**构成对本稿的 PASS/FAIL；`6790cc6` 与 `e883bf8` FAIL 正文逐字保留。

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

---

## Re-PRE @43e2dbc（mw-rag-route · Line AK · NHP-025-ADV-01 · 只审文档 · 2026-10-06 14:50 +08:00）

**REQUEST**: `43e2dbc1992d2077ca742a6161084ab5052b89d4`（meetwise-core · 2026-10-06 14:36:19 +08:00 · supersedes `ae5367e`）· 是 origin 祖先；审查时 origin tip `e66419d`，harness 自 `43e2dbc` 起未再变。
**改动文件**（4 个，全 docs）：`harness/nhp-025-adv-01-blind-to-case.md` · `nhp-025-adv-01-blind-to-case.slice.md` · 两个 dual stub。零 `apps/` `packages/` `scripts/` `package.json`。✅
**本文件被 core 改动的核对**：core 改了本 stub 页眉并插入 rewrite 注记；我方 `6790cc6` 的 FAIL 正文逐字未变（抽取 FAIL 段 diff 为空）。
**执行机器**：只在本 box 上执行（临时 worktree `/tmp/mwrr-43e2dbc` @ origin tip）；只读文档与源码，未跑 prove；用户 Mac / 任何 machineId 上零命令。

### 1. 我方 FAIL `6790cc6` 阻断项逐条

| # | 状态 | 依据（harness file:line） |
|---|------|---------------------------|
| B1 A1 未钉 | **已解除** | `:57-67`：自己的 interview + 他人 quiz → 404 `not_found_or_forbidden`（service `:214-218`），先于 `:222/:239/:242/:266`，不调用 `reserveEntitlement` `:329` / `enqueueInterviewJob` `:337`，consumption / job 计数不变；正控 PC-A1 → 202；与 `:200` 同码区分；MUT-A1（放行 `:217-218` → `:219` TypeError → 500）会真变红，并注明只去 `owner_user_id` 在 FORCE RLS 下不够。复核锚点全部为真。 |
| B2 A2 无攻击面 | **已解除** | `:25` / `:69-71` 删除 A2，不把 `stale_quiz` 当 ADV（controller `:22-26` 无 body）。 |
| B3 A3 与 W BOUND 重叠 | **未解除** | 见下方 B-R1。 |
| B4 证据层 | **已解除** | `:87-91` 单一层 = run-e2e-isolated 隔离真 PG + 真 Nest HTTP + FORCE RLS（`20_resume_quiz.sql:46-49`），Ban fake DB。 |
| B5 正控 / mutation / 回归 | **已解除** | `:64` PC-A1、`:66` MUT-A1、`:83` MUT-A3；`:101-110` 具名 `uc025:nhp-neg` / `nhp-bound` / `nhp-fault` / `nhp-fault-isolated:prove` EXIT 0、零 proof 改动；环境 EXIT 1 ≠ pass ≠ regression。 |
| 锚点更正 | 已落实 | `:43` `missing_quiz_expiry` 在 `:239/:242`。 |
| C1–C2 | 已落实 | `:123` 不与 R4 `wrong_track` 混用；`:95-99` attempts=1 等。 |

**LOOP §3③**：`:95-96` 给出 `pnpm uc025:nhp-adv:prove` 与期望 EXIT（A1+A3+PC 齐 → 0，否则 ≠0）。✅
**矩阵诚实**：`:37-38` 引用与 `:125` / NHP `:84` 一致；ADV 保持 blind，行保持 gap，零 SSOT 编辑。✅

### 2. 阻断项（FAIL）

**B-R1（原 B3 未解除）A3 的向量与 W BOUND 几乎完全重合，期望值也未钉死。** 对照 W 的 `apps/api/test/uc-e2e-025-nhp-bound.proof.ts`：
- **A3-a 大小写变体** = W **R4**（`:157-158`：`R_A.toUpperCase()` → 通过守卫、到达 bind）。harness `:79` 还写着「部分 ADV-new」「仍拒要写清」，期望没定。（`UUID_RE` 带 `/i`，service `:28`，大写能过格式校验。）
- **A3-c epoch 漂移** = W **R2**（`:150-151`）。harness `:81` 只写「若 W 已覆盖」，实际已覆盖。
- **A3-NULL** = W **R5**（`:160-161`）。
- **A3-b 他人 resume-id**：机制与 W **R1**（`:146-147`：pin R_A、begin R_B → 409）是同一个比较（`:263`），区别只在 fixture 换成跨主体。harness `:80` 期望写「409 … （或先于其的 owner 闸）」，没钉死。实际 begin 在 `:266` 之前**没有**任何 resume owner 闸（resume 的 owner 检查在 bind 的 `AND r.owner_user_id=$2`，位于 `:266` 之后），所以应钉 **409 `resume_version_mismatch`**。

照现稿执行，A3 的 EXIT 0 会把 W 已有的 R1/R2/R4/R5 向量换个层再报成 ADV 证据，这正是 `:75` / `:120` 自己禁止的「借 W 绿」。**解除方式**（二选一，须写进 harness）：
(a) 删掉 A3，本刀 ADV = A1（+ PC），MUT-A3 一并删除；或
(b) 保留 A3，但把 A3-a / A3-c / A3-NULL 明确标为「W R4 / R2 / R5 向量在真 PG + HTTP 层的补充复验 · complementary ≠ ADV-new · 不计入 ADV 证据」（同 FAULT-ISOLATED 对 AA 的写法）；ADV-new 只认 A3-b（跨主体 resume-id，钉 409 `resume_version_mismatch` @ `:266`，未扣额、未入队）；A3-a 期望钉为「pin 匹配的大写 UUID → 通过版本守卫（不 409）」；MUT-A3 写明对应哪条断言变红（去掉 `:263` lowercase → A3-a 变 409；放宽 `:266` → A3-b 不再 409）。

### 3. 其他须落实（不单独阻断，重提时一并改）

1. **runner 接线与 Ban 矛盾**：`:122`「Ban product/infra code」与 `:53` / `:95` 的新 CMD 冲突——`run-e2e-isolated.mjs` 对未登记目标会抛 `unsupported_e2e_target`，须在该文件与 `package.json` 做纯增量的目标登记（AG `7eb1c88` 先例 +16/-1）。须明文允许“仅增量登记、不改其他目标行为”。
2. **PC-A1 要能拿到 202**：须 seed 额度 bucket（否则 `:329` 后会 402 `insufficient_entitlement`），quiz 须 `status='ready'`、`expires_at` 在未来、pin 的 resume_id 与 header `resume-id` 一致且 epoch 等于当前值；harness 应写明这些 seed 并披露。
3. A1 与 PC-A1 的先后须写明。quiz 守卫（`:212-218`）在 `alreadyBegun` 分支（`:321` / `:326`）之前，所以两种顺序 A1 都应是 404；但建议先跑 A1，让「consumption / job 计数不变」以 0 行为基线，避免与 PC 产生的 reserved 行混在一起。

### Pins（本审不改）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · gR45Closed=true · ms3EqualsR4Closed=false · public DELETE=503 · PG-retained（禁 MySQL runtime / Qdrant / MemorySaver）· UC-018 与 §1.1 仍 partial · UC-E2E-025 行 gap · ADV blind · PASS ≠ coding ≠ covered ≠ nail ≠ HA · EXIT0 ≠ covered。

**结论**：B1、B2、B4、B5 与锚点更正已解除；原 B3 未解除（B-R1：A3 向量与 W BOUND R1/R2/R4/R5 重合、期望未钉）。FAIL（阻断 B-R1；第 3 节 1–3 重提时一并落实）。不代签 peer mw-e2e-ha。alone ≠ dual。

Verdict: FAIL

---

## Re-PRE2 @420aeca

**审查者**：`mw-rag-route`（独立域 · 只审文档 · 不代签 peer `mw-e2e-ha` · alone ≠ dual）· **时间**：2026-10-06 14:57 +08:00
**REQUEST**：`420aecadf665349a6419feb89d8a5179a39fd2d2`（meetwise-core · 2026-10-06 14:54:09 +08:00 · supersedes `43e2dbc` ← `ae5367e` · 引用我方 Re-PRE FAIL `e883bf8`）。审查时它就是 origin tip，是 origin 的祖先。
**改动文件**（4 个，全 docs）：`harness/nhp-025-adv-01-blind-to-case.md` · `nhp-025-adv-01-blind-to-case.slice.md` · 两个 dual stub。零 `apps/` `packages/` `scripts/` `package.json`。✅
**本文件被 core 改动的核对**：core 只改了本 stub 页眉、请审清单和 Ban 行；我方 PRE-EXEC FAIL（`6790cc6`）与 Re-PRE FAIL（`e883bf8`）两段正文逐字未变（按段抽取 diff 为空）。
**执行机器**：只在本 box 上执行（临时 worktree `/tmp/mwrr-420aeca` @ origin tip · detached）；只读文档与源码，未跑 prove，未读取任何密钥 / `.env*`；用户 Mac / 任何 machineId 上零命令；git config 未改。

### 1. B-R1（A3 与 W BOUND 重合）→ **已解除**（选 option (b)）

- **分类**：harness `:13` / `:37` / `:110` / `:114-119` 把 A3-a、A3-c、A3-NULL 明确标为「W R4 / R2 / R5 向量在真 PG + HTTP 层的补充复验 · complementary ≠ ADV-new · 不计 ADV 证据」；`:173` / `:180` 在 Ban 和 Non-claims 里重复声明。W 对照行号复核为真：`uc-e2e-025-nhp-bound.proof.ts:147`（R1）、`:151`（R2）、`:158`（R4）、`:161`（R5）。
- **ADV-new 集合**：`:13` / `:43` / `:149` 写明 ADV-new = **A1 + A3-b + PC-A1**，只有这三项决定 EXIT 0；complementary 行照跑照记，红则 EXIT≠0，绿不计入 ADV 新证据。
- **A3-b 期望唯一**：`:38` / `:116` 钉为 **409 `{error:'resume_version_mismatch'}` @ service `:266`**，不扣额（`:329`）、不入队（`:337`）、Δ0、不 bind；旧稿「或先于其的 owner 闸」已删。**源码复核**：`interview.service.ts:193-266` 之间用到 header `resume-id` 的只有 `:194`（缺失 → 400）、`:195`（`UUID_RE` 格式 → 400）和 `:263`（与 pin 比较）；`:255` 的 `JOIN resume` 用的是 `q.resume_id`（quiz 的 pin），不是 header 值。resume 的 owner 检查只出现在之后的 bind（`:300` `AND r.owner_user_id=$2`）。所以他人 resume-id（合法 UUID）一定先在 `:266` 得到 409，不会是 404 / 400。✅
- **A3-a 期望**：`:39` / `:117` 钉为「pin 匹配的大写 UUID → 通过版本守卫，不 409」，依据 `:28` `UUID_RE` 带 `/i`、`:263` 两侧都 `toLowerCase`。`resume.id` 是 uuid 类型（`sql/03_resume.sql:10`），下游 bind 时 PG 的 uuid 输入不区分大小写，「seed 齐时预期 202」合理。✅
- **Mutation**：`:121-128` MUT-A3a（去掉 `:263` lowercase → A3-a 变 409）、MUT-A3b（放宽 `:266` → A3-b 不再 409），都写明哪条断言变红、EXIT≠0、不提交；并注明 MUT-A3a 不把 A3-a 升为 ADV-new。✅

### 2. 我方 Re-PRE `e883bf8` §3 的 1–3 项

| 项 | 状态 | 依据 |
|----|------|------|
| §3-1 runner 接线与 Ban 矛盾 | **已解除** | `:44` / `:138-143` / `:175` 明文允许纯增量登记（`run-e2e-isolated.mjs` 的 receipt sources、支持目标表、命令映射、migrate 白名单 + 根 / `apps/api` `package.json`），「仅增量登记、不改其他目标行为」，以 AG `7eb1c88` +16/-1 为先例；既有目标与 `apps/api/src/**`、`packages/**` 仍禁改。 |
| §3-2 PC-A1 的 seed | **已解除（附条件 1、2）** | `:45` / `:91-100` 列出 entitlement bucket、quiz `ready`、`expires_at` 在未来、pin resume_id = header、pin epoch = 当前、interview `created` 未 bind，以及各自缺失时的后果（402 `:331/:334` · 409 `:222` / `:239/:242` / `:266` · `:205` / `:321/:326`）。行号复核为真。 |
| §3-3 A1 / PC-A1 先后 | **已解除** | `:46` / `:85` / `:102` / `:148`：先 A1 后 PC-A1；quiz 守卫 `:212-218` 在 `alreadyBegun` `:321/:326` 之前，A1-first 让 Δ0 以空表为基线。 |

### 3. 已解除项无回退

- **B1 A1**：`:77-88` 仍为 own interview + 他人 quiz → 404 `not_found_or_forbidden`（`:214-218`），先于 `:222/:239/:242/:266`、`:329`、`:337`；与 `:200` 同码区分；MUT-A1（`:217-218` 放行 → `:219` TypeError → 500）与 FORCE RLS 警告保留。✅
- **B2**：A2 仍删除（`:104-106`），不 relabel `stale_quiz`。✅
- **B4**：`:132-136` 单一层 = 隔离真 PG + 真 Nest HTTP + FORCE RLS（`20_resume_quiz.sql:46-49`），Ban fake DB。✅
- **B5**：`:154-163` 具名 `uc025:nhp-neg` / `nhp-bound` / `nhp-fault` / `nhp-fault-isolated:prove`，EXIT 0、零 proof 改动；环境 EXIT 1 ≠ pass ≠ regression；PC-A1 与各 mutation 均在。✅
- **锚点**：`:60` `missing_quiz_expiry` 在 `:239/:242`，复核为真。✅

### 4. 门禁

- **LOOP §3③**（`harness/NORTH-STAR-EXECUTION-LOOP.md:81`，REQUEST + harness 须含命令与期望 EXIT）：ADV `pnpm uc025:nhp-adv:prove` → ADV-new 全过 EXIT 0、否则 ≠0（`:147-149`）；每个 mutation EXIT≠0（`:87` / `:125-126`）；4 条回归 EXIT 0（`:158-161`）。每条命令都有期望 EXIT。✅
- **`north-star-hard-gates.md`**：`:46` / `:117`「partial / GAP … ≠ covered」——harness `:151` / `:167` 写明行保持 gap、ADV 保持 blind、EXIT0 ≠ covered、canHonestlyFlip=false；零 matrix / backlog / checklist 编辑（`:168`）。✅
- **Pins**：`:4` / `:184` 原样（NOT_HA · releaseEvidence=false · coveredCount=8 · DELETE=503 · PG-retained）。✅

### 5. 条件（不阻断，执行前落实）

1. **bucket kind 写法**：`:95` 写「`mock_interview` 额度 bucket」。`mock_interview` 是 `reserveEntitlement` 的 service_type（service `:329`），不是 bucket kind；`entitlement_bucket.kind` 受 `CHECK (kind IN ('gift','trial','paid'))` 约束（`packages/db/sql/02_commerce.sql:14`）。seed 须用其中之一（如 AG proof 的 `'paid'`），否则 INSERT 直接失败。
2. **bucket 容量**：PC-A1、A3-a、A3-NULL 预期都会到 202，每个独立 interview 各 reserve 1.0。若都在 principal A 的同一 bucket 上，`ck_bucket_capacity`（`02_commerce.sql:22`）要求 `units_total ≥ 3.0`，否则后跑的 case 会 402，造成假红。须写明总额或改为每个 case 单独 seed bucket。
3. **A3-NULL seed**：0061 有 `resume_quiz_reference_pair_chk`（`CHECK ((resume_id IS NULL) = (privacy_epoch IS NULL))`，`0061_resume_derivative_reference_guard.sql:68-70`），须 resume_id 与 privacy_epoch **同时**为 NULL；并披露这是 admin 直接 INSERT 的旧形态行。
4. **A3-c seed 方法**：0061 的触发器只拦 UPDATE（`:121-124` `BEFORE UPDATE OF resume_id, privacy_epoch`，pin 一旦设定不可改），所以 epoch 漂移须在 INSERT 时直接写入与当前不同的 pin epoch，或改为提升 `resume.privacy_epoch`；两种都要满足外键 `(resume_id, owner_user_id)` 并披露。
5. harness `:26`（rewrite note 1 的 B3 行）仍写「标 ADV-new」，已被 note 2 取代，建议注明 superseded，避免误读。
6. 执行时 complementary 行（A3-a / A3-c / A3-NULL）的实际结果照实记录，任何情况下不计入 ADV-new 证据；POST 收据中逐条标明。

### 6. 洗白 / 越界

B'' NEG / AA FAULT / W BOUND / FAULT-ISOLATED 只读引用并 Ban 洗（`:172-173`）；未碰 AL / AM / AG 文件；FUNNEL / G-R4-5 未触碰；零 SSOT 编辑。

### Pins（本审不改）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · gR45Closed=true · ms3EqualsR4Closed=false · public DELETE=503 · PG-retained（禁 MySQL runtime / Qdrant / MemorySaver）· UC-018 与 §1.1 仍 partial · UC-E2E-025 行 gap · ADV blind · PASS ≠ coding ≠ covered ≠ nail ≠ HA · EXIT0 ≠ covered。

**结论**：B-R1 已按 option (b) 解除（A3-a/c/NULL 降为 complementary、ADV-new = A1 + A3-b + PC-A1、A3-b 钉 409 @ `:266` 且源码确认之前没有 resume owner 闸）；§3 1–3 解除；B1/B2/B4/B5 与锚点无回退；LOOP §3③ 与 hard gates 满足；无新阻断。PASS（附条件 1–6）。**coding 仍禁止**，须 mw-e2e-ha 对 `420aeca` 独立给出 PASS（BOTH PASS）并经协调方 AUTHORIZE 后才可执行。alone ≠ dual。

Verdict: PASS

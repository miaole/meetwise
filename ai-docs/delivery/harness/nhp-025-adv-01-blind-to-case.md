# Harness — **NHP-025-ADV-01 · UC-025 ADV blind→case evidence**（Line AK · docs REQUEST rewrite · **`draft:awaiting_pre_exec_dual`** · row UC-E2E-025 stays gap · ADV stays blind until case）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST rewrite **re-PRE2** · supersedes REQUEST `43e2dbc`（← `ae5367e`）· cites rag Re-PRE FAIL **`e883bf8` B-R1 + §3 items 1–3** · prior rag PRE-EXEC FAIL `6790cc6` **B1–B5** (+ C1–C2）cleared @`43e2dbc` · B1/B2/B4/B5 **not regressed**· peer e2e PASS `899fef2` alone ≠ dual · Ban coding · Ban prove · EXIT0≠covered · canHonestlyFlip=false · Ban wash B'' NEG / AA FAULT / W BOUND+FAULT-ISOLATED · Ban self-approve）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton`（includes AI/AJ rewrite + AL/AM/AG as ancestors · **Ban touch** AL/AM/AG files · **Ban** 共享 SSOT：coverage matrix / gap-bug-backlog / execution checklist）
**Prior REQUEST**: `43e2dbc1992d2077ca742a6161084ab5052b89d4`（re-PRE · **superseded by this re-PRE2 rewrite**）← `ae5367ef94680b5cdcd35e22ebd6195d803861a7`（pre_dual · superseded by `43e2dbc`）
**FAIL receipts**（retained · 不擦除）: `e883bf8c4d5dafb19af32a3d8713dd5a04ffe139`（mw-rag-route Re-PRE FAIL on `43e2dbc` · **B-R1**（原 B3）+ §3 1–3 · B1/B2/B4/B5 cleared）· `6790cc6d3e72ab5545a5071838b99b4fe0aaf8da`（mw-rag-route PRE-EXEC FAIL on `ae5367e` · B1–B5）
**Peer note**: mw-e2e-ha PRE-EXEC PASS `899fef248d7d247f8425c037109ed4efde008e71` · **alone ≠ dual** · rag FAIL ⇒ BOTH not PASS
**Wave**: Line **AK** rewrite re-PRE2（after AI · AJ）
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING re-PRE · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban SSOT edit · Ban coding · Ban self-nail · status `draft:awaiting_pre_exec_dual`
**Knife**: **NHP-025-ADV-01（Line AK）· UC-025 押题过期 ADV · blind→case 显式化**（ADV-new = A1 跨用户 quiz-id + A3-b 跨主体 resume-id + PC-A1；A3-a / A3-c / A3-NULL = W BOUND R4 / R2 / R5 补充复验 · complementary ≠ ADV-new · 不计 ADV 证据）
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

## Rewrite note 2（re-PRE2 · supersedes `43e2dbc` · FAIL `e883bf8` B-R1 + §3 1–3 · 选 option **(b)**）

mw-rag-route Re-PRE FAIL `e883bf8`（`e883bf8c4d5dafb19af32a3d8713dd5a04ffe139`）：B1/B2/B4/B5 + 锚点更正 + C1–C2 **已解除 · 本稿不回退**；阻断 **B-R1**（原 B3：A3 向量与 W BOUND R1/R2/R4/R5 重合、期望未钉）。本稿选 **option (b)**（保留 A3 · 显式降级 complementary），并一并落实 §3 1–3。FAIL 正文原样保留于 rag stub。

| # | 阻断 / 条件（`e883bf8`） | 本稿修订（落点） |
|---|------|------|
| **B-R1 (b)-1** | A3-a / A3-c / A3-NULL = W R4 / R2 / R5 | §4 A3 表：三条均标 **「W R4 / R2 / R5 向量在真 PG + HTTP 层的补充复验 · complementary ≠ ADV-new · 不计 ADV 证据」**（同 FAULT-ISOLATED 对 AA 的写法）· Ban borrow 其绿为 ADV |
| **B-R1 (b)-2** | A3-b 期望未钉（旧稿含 owner 闸替代期望） | **ADV-new 唯一 A3 = A3-b**（跨主体 resume-id）· 钉 **409 `resume_version_mismatch` @ service `:266`** · 未扣额（`:329`）· 未入队（`:337`）· 明写 begin 在 `:266` 前**无** resume owner 闸（resume owner 检查在其后 bind `:300` `AND r.owner_user_id=$2`）· 已删除旧稿 A3-b 的「owner 闸替代期望」模糊措辞（期望唯一） |
| **B-R1 (b)-3** | A3-a 期望未钉 | 钉：pin 匹配的**大写** UUID → **通过版本守卫（不 409 `resume_version_mismatch`）**· 依据 `UUID_RE` `/i`（service `:28`）+ `:263` 双侧 `toLowerCase` + W R4（`uc-e2e-025-nhp-bound.proof.ts:158`） |
| **B-R1 (b)-4** | A3-c = W R2 | complementary only（W R2 `:151`）· Ban borrow 绿为 ADV |
| **B-R1 (b)-5** | A3-NULL = W R5 | W R5（`:161`）/ `:260` 有意放行 · **≠ 红 · ≠ ADV pass** · complementary only |
| **B-R1 (b)-6** | MUT-A3 未写哪条断言变红 | **MUT-A3a**：去掉 `:263` lowercase → **A3-a 变 409**（断言「不 409」红）；**MUT-A3b**：放宽 `:266` 失配闸 → **A3-b 不再 409**（断言「409」红）· never commit |
| **B-R1 (b)-7** | EXIT 期望 | §6：ADV-new = **A1 + A3-b + PC-A1** 齐 → EXIT 0；complementary A3-a/A3-c/A3-NULL 仍执行、如实记录，红则 EXIT≠0 诚实保留，但其绿**不**作为 ADV-new 证据、**不**参与 ADV EXIT0 的新证据计数 |
| **§3-1** | runner 接线与 Ban 矛盾 | §5.1：Ban product/infra code **except** 纯增量目标登记（`scripts/run-e2e-isolated.mjs` + 根 / `apps/api` `package.json` 登记 `uc025:nhp-adv:prove`）· AG `7eb1c88` 先例 +16/-1 · 「**仅增量登记、不改其他目标行为**」· 否则 `unsupported_e2e_target` |
| **§3-2** | PC-A1 拿 202 的 seed 未披露 | §4 A1 seed 表：entitlement bucket（否则 `:329` 后 402 `insufficient_entitlement`）· quiz `status='ready'` · `expires_at` 未来 · pin `resume_id` = header `resume-id` · pin epoch = 当前 `resume.privacy_epoch` |
| **§3-3** | A1 / PC-A1 先后 | §4：**A1 先于 PC-A1**（quiz 守卫 `:212-218` 先于 `alreadyBegun` `:321`/`:326`，两序 A1 均 404；A1-first 令 consumption / job Δ0 以空表为基线） |

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
- **格式闸**：`:28` `UUID_RE` 带 `/i` → 大写 UUID 过 `:195` `invalid_resume_id` 校验（A3-a 依据）。
- **resume owner 闸位置**：begin 在 `:266` 之前**无**任何对 header `resume-id` 的 owner 检查；resume owner 检查仅在其后 bind（`:288-301` · `:300` `AND r.owner_user_id=$2`）→ A3-b 抛点 = `:266`（A3-b 依据）。
- **幂等 / 额度**：`alreadyBegun` 分支 `:321` / `:326` 在 quiz 守卫 `:212-218` 之后；`:329` `reserveEntitlement` 失败 → `:331`/`:334` 402 `insufficient_entitlement`（PC-A1 seed 依据）。
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
| 正控 PC-A1 | 同 interview + **own** fresh pinned quiz（seed 见下表）→ **202** `{accepted:true,jobId}` |
| 顺序 | **A1 先于 PC-A1**（见下「顺序」） |
| 与 `:200` 区分 | 同码 404 但 interview 行可见（own）· quiz 因 owner 不可见 |
| Mutation **MUT-A1** | temp：把 `:217-218` rowCount===0→404 改为放行 → 随后 `:219` 取 `rows[0]` 抛 TypeError → **500 ≠ 404** → A1 断言红 · EXIT≠0 · never commit |
| Mutation 警告 | **只去掉** `:214` 的 `owner_user_id=$2` **不够**：真 PG 下 FORCE RLS 仍挡 · `:232`/`:256` 同款查询仍在 → **不会变红** · 不得当负控 |


**PC-A1 → 202 seed 披露（§3-2 · 写入 harness · 全部为 prove 内离线 seed · 非产品改动）**

| Seed | 值 | 缺失后果 |
|------|----|----------|
| entitlement bucket | principal A 的 `mock_interview` 额度 bucket ≥ 1.0（足以 `reserveEntitlement(c, A, id, 'mock_interview', 1.0)` 返回 `reserved`） | `:329` 后 **402 `insufficient_entitlement`**（`:331`/`:334`）≠ 202 |
| quiz `status` | `'ready'` | `:222` 409 `stale_quiz` |
| quiz `expires_at` | **未来**时间（非 NULL） | 过去 → `:222` 409 `stale_quiz`；NULL → `:239/:242` 409 `missing_quiz_expiry` |
| quiz pin `resume_id` | = header `resume-id`（principal A 自己的 `ingested` resume） | `:266` 409 `resume_version_mismatch` |
| quiz pin epoch | = 当前 `resume.privacy_epoch` | `:266` 409 `resume_version_mismatch` |
| interview | principal A own · `status='created'` · 未 bind（无既有 start job） | `:205` 409 / `:321`/`:326` alreadyBegun ≠ 新 202 |

**顺序（§3-3）**：同一 interview 上 **先 A1、后 PC-A1**。quiz 守卫 `:212-218` 在 `alreadyBegun`（`:321`/`:326`）之前，两种顺序 A1 都应 404；但 A1-first 使「`entitlement_consumption` / `interview_job` Δ0」以**空表（0 行）**为基线，不与 PC-A1 产生的 reserved / start-job 行混淆。

### A2 — **DELETED**（B2）

begin 不接受任何客户端 expiry 输入（controller `:22-26`）。「客户端声称未过期」无入口。**不**把 409 `stale_quiz`（`:222` = B'' NEG）relabel 为 ADV。本刀合同 **无 A2**。

### A3 — 版本 pin 向量（B-R1 · option **(b)** · ADV-new 仅 A3-b · 其余 complementary）

**Option (b) 显式声明**：保留 A3。**A3-a / A3-c / A3-NULL** = 「**W R4 / R2 / R5 向量在真 PG + HTTP 层的补充复验 · complementary ≠ ADV-new · 不计 ADV 证据**」（同 FAULT-ISOLATED 对 AA 的写法：换层复验 ≠ 新对抗面）。**ADV-new 仅 A3-b**（跨主体 resume-id）。Ban 把任何 complementary 行的绿借作 ADV 证据。

每条 A3 用独立 interview（principal A own · `created`）+ 独立 quiz（seed 同 PC-A1，仅改所述字段），互不污染。

| id | 向量 | 分类 | 钉死期望 | W 对照 |
|----|------|------|----------|--------|
| **A3-b** | header `resume-id` = **principal B 的** resume UUID（合法 UUID）· quiz = principal A own · pin = A 的 resume `R_A` | **ADV-new**（跨主体 resume-id · fixture delta：W R1 的 `R_B` 属同一主体） | **409 `{error:'resume_version_mismatch'}` @ service `:266`**（`:263` `R_A ≠ R_B(B)`）· **未**调用 `reserveEntitlement` `:329` · **未**调用 `enqueueInterviewJob` `:337` · `entitlement_consumption` / `interview_job` Δ0 · interview 未 bind。begin 在 `:266` 之前**无** resume owner 闸（owner 检查在其后 bind `:300` `AND r.owner_user_id=$2`）→ 抛点唯一为 `:266`，**不**是 404、**不**是 400 | 机制同 W R1（`:147`）比较，delta = 跨主体 fixture |
| **A3-a** | header `resume-id` = pin 的 `R_A` 的 **大写**形式（同 UUID · 不同 casing） | **complementary**（W **R4** `:158` 真 PG + HTTP 补充复验 · ≠ ADV-new · 不计 ADV 证据） | **通过版本守卫 · 不 409 `resume_version_mismatch`**（`UUID_RE` `/i` @ service `:28` 过格式闸；`:263` 双侧 `toLowerCase` 等价）· 下游结果如实记录（seed 齐时预期 202） | W R4 |
| **A3-c** | pin epoch ≠ 当前 `resume.privacy_epoch` | **complementary**（W **R2** `:151` 补充复验 · ≠ ADV-new · 不计 ADV 证据 · Ban borrow 绿为 ADV） | 409 `resume_version_mismatch` @ `:266` · 无扣额/入队 | W R2 |
| **A3-NULL** | quiz pin `resume_id` 为 **NULL** | **complementary**（W **R5** `:161` 补充复验 · `:260` 有意设计放行） | 跳过版本检查 · **不**被 `:266` 误拒 · **≠ 红 · ≠ bypass 成功 · ≠ ADV pass** · 如实登记 | W R5 |

**Mutation（temp · never commit）**

| id | 改动 | 必红断言 |
|----|------|----------|
| **MUT-A3a** | 去掉 `:263` 的 `toLowerCase`（区分大小写比较） | **A3-a 变 409 `resume_version_mismatch`** → 「不 409」断言红 · EXIT≠0 |
| **MUT-A3b** | 放宽 `:266` 失配闸（不抛 / 不比较 resume_id） | **A3-b 不再 409** → 「409 `resume_version_mismatch`」断言红 · EXIT≠0 |

MUT-A3a 证的是 complementary A3-a 的判别力，**不**因此把 A3-a 升为 ADV-new；ADV-new 的 A3 mutation 证据仅 MUT-A3b。

旁证（B'' NEG `stale_quiz` 409 · W BOUND `resume_version_mismatch` 409 · AA/W FAULT `missing_quiz_expiry` 409）**≠** ADV 收据；Ban 借其绿。

## 5. 证据层（B4 · 单一表述）

- **唯一证据层**：`scripts/run-e2e-isolated.mjs` **隔离真 PG** + **真 Nest HTTP** + **FORCE RLS**（`packages/db/sql/20_resume_quiz.sql:46-49`）。
- A1 跨用户语义 **仅** 在真 PG + FORCE RLS 下有意义；**Ban fake DB**。
- **Ban** 全文混用「in-process only」与「隔离壳三层」矛盾措辞。

### 5.1 Runner 接线 allow（§3-1 · 唯一 Ban 例外）

- Ban product/infra code **except**：纯增量目标登记——`scripts/run-e2e-isolated.mjs`（receipt sources · 支持目标表 · 命令映射 · migrate 白名单）+ 根 `package.json` / `apps/api/package.json` 登记 `uc025:nhp-adv:prove`（及其 `:raw`），先例 AG `7eb1c88`（+16/-1）。
- 明文：「**仅增量登记、不改其他目标行为**」。未登记则 runner 抛 `unsupported_e2e_target`，CMD 跑不起来。
- 任何对既有目标（含 `uc025:nhp-neg|bound|fault|fault-isolated:prove`）的行为改动、产品源（`apps/api/src/**`、`packages/**`）改动 → 仍 **Ban**；回归见 §7。
- 本条为授权后执行范围声明；本 REQUEST 本身零 `scripts/` / `package.json` 改动。

## 6. prove 方案（授权后 · Ban live · C2）

- **CMD（拟）**: `pnpm uc025:nhp-adv:prove`（via `run-e2e-isolated.mjs`）· **attempts=1** · 全记录。
- **执行顺序**: A1 → PC-A1 → A3-b → A3-a / A3-c / A3-NULL（complementary）。
- **期望 EXIT**: **ADV-new = A1 + A3-b + PC-A1** 全部按钉死期望 → **EXIT 0**；任一失败 → **EXIT ≠ 0**。complementary A3-a / A3-c / A3-NULL 同跑同记，红则 EXIT ≠ 0 如实保留；其绿**不**作为 ADV-new 证据、**不**参与 ADV EXIT0 的新证据计数（W R4/R2/R5 已覆盖）。
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
- Ban relabel `stale_quiz` 为 ADV · Ban borrow W-covered 向量当 ADV pass（A3-a/A3-c/A3-NULL = complementary · 不计 ADV 证据）· Ban 把 NULL pin 放行当红/当 bypass
- Ban flip ADV 列 / 行 off gap · Ban invent covered · Ban live · Ban fake-green suite · Ban fake DB
- Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban SSOT edit（matrix / backlog / checklist）· Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban 碰 AL/AM/AG 禁触文件 · Ban product/infra code（**except** §5.1 纯增量 runner 目标登记 · 仅增量登记、不改其他目标行为）
- **C1**：A1/A3 与 R4 `wrong_track` 语义不混用；`GAP-UC025-ADV-01` 不与 NEG/BOUND/FAULT/FAULT-ISOLATED gap 混用

## 10. Non-claims

Not a pass · not run · not covered · ADV not case-evidenced · not nail · not HA · not `releaseEvidence=true` · EXIT0≠covered · alone ≠ dual · peer `899fef2` alone ≠ BOTH · complementary A3-a/A3-c/A3-NULL ≠ ADV 证据 · canHonestlyFlip=false

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · canHonestlyFlip=false · row UC-E2E-025 stays gap · ADV blind · STOP

*Harness · NHP-025-ADV-01 · UC-025 ADV blind→case evidence · Line AK · 2026-10-06 · draft:awaiting_pre_exec_dual · re-PRE2 rewrite supersedes 43e2dbc ← ae5367e · FAIL e883bf8 B-R1 option (b) + §3 1–3 · FAIL 6790cc6 B1–B5 · peer e2e PASS 899fef2 alone≠dual · Ban coding · ADV blind · alone ≠ dual · STOP*

# Harness — **INT00-A · INT-TRANSCRIPT-00 四条已接线 prove 单窗回执收尾刀**（docs-only REQUEST · **`draft:awaiting_pre_exec_dual`** · Ban coding · Ban prove execution · Ban push）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs-only REQUEST 立卷 · L0 · 本 REQUEST 零 coding · 零 prove 执行 · 零 SSOT edit · 零 push · alone ≠ dual · 执行须 PRE 双审 BOTH PASS + meetwise AUTHORIZE）
**Date**: 2026-10-08（Asia/Shanghai · UTC+8）
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`9265e4d8`** / full `9265e4d8a58eaa064244eb3c5fd02c165e83d8fc`（REQUEST 前已 `git fetch origin`，origin tip 与 base 实测恰等 · ≥9265e4d8 满足）
**Wave**: Line **INT00**（INT-TRANSCRIPT-00 侦察立项 · **A 项最强候选** · 协调方 2026-10-08 立项）
**Experts**: `mw-privacy-int` + `mw-e2e-ha`（pre-exec 双审 · alone ≠ dual · Ban self-approve · Ban 代签 peer · INT-00 隐私域邻接 → privacy 席必选）
**Worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-int00` · branch `line/int00-prove-receipt`（自 `9265e4d8` 新挂）

## 0. 证明目标（一句话 + 原文钉）

**一句话**：四条 INT-TRANSCRIPT-00 prove 已**接线在案**（`package.json:353-360` + `run-e2e-isolated.mjs` 隔离壳注册 + `packages/db`/`apps/api` `:raw` 目标存活），但 SSOT **无当前 tip 的 EXIT 入账**——本刀把「wiring 存在」升为「**当前 tip 单窗 EXIT + 回执入账**」，为用户开闸 INT-TRANSCRIPT-01 备好**新鲜证据底座**；**只证明「四条 prove 在当前 tip 单窗可跑、结果如实入账」，不证明控制面已关、不开 01、不动 503**。#103 先例在卷（gate 13/13 + prove-path 10/10 EXIT=0 · 回执 4 钉 · backlog `:783` / checklist `:1298`）。

**原文钉（只读引用 · 零改写）**：

1. `package.json:353-360`（四条接线）：`int-transcript-preview-submit:http:prove` → `run-e2e-isolated.mjs int-transcript-preview-submit:http:prove:raw` → `pnpm -C apps/api prove:int-transcript-preview-submit-http`；`int-transcript-answer-fact-root:prove` / `int-transcript-remaining-sinks:prove` / `int-answer-dual-write-fence:prove` → 各自 `:raw` → `pnpm -C packages/db prove:*`（`packages/db/package.json:51-53` 三条 + `apps/api/package.json:42` 一条，全部存活亲证）。
2. checklist `:173`（INT-TRANSCRIPT-00 ◐）：「…账本 HTTP 证明须**远程 Postgres 环境变量**，**禁止 `pnpm db:up`**，无回执时 `releaseEvidence=false`…这**不**授权 `INT-TRANSCRIPT-01` 生产 cutover…」
3. checklist `:174`（INT-ANSWER-DUAL-WRITE-FENCE ◐ · 不是 01）：迁移 `0126` 已在 main；`INT-TRANSCRIPT-01` 保持 blocked。
4. checklist `:175`（INT-TRANSCRIPT-PREVIEW-SUBMIT ◐）：预览 `/answers` 接 `submitInterviewAnswer`（0092 rehearsal 账本）；仅 `MEETWISE_PUBLIC_PREVIEW=1` 可写；`0129` 预览删除是另一条账本，公开预览下仍 503。
5. checklist `:176`（INT-TRANSCRIPT-01 `[ ]` blocked）：01 canonical 写入双 release gate 原文——**本刀零触碰**。
6. checklist `:67`：当前 raw answer 在 answer job 终态前仍是 payload 中的明文 JSON，**不得称为 canonical artifact**（Ban canonical 宣称出处）。
7. backlog `:58`（GAP-PRIV-02）：公开 `DELETE /privacy/interview-data/:id` **必须保持 503**（冻结）；独立 prove + 专家审批准前不得放开。
8. backlog `:59`（GAP-PRIV-03）：INT-TRANSCRIPT 控制面未关：**00 ◐**（issuer/账本合同本地）；01 blocked；「checklist `INT-TRANSCRIPT-00/01` prove 路径；`pnpm int-answer-dual-write-fence:prove`；`mem00-int00:prove-path`（#103）」。
9. backlog `:783`（2026-10-07 I103 landed 登记 · append-only）：#103 全链完结——gate **13/13** EXIT=0 + `pnpm mem00-int00:prove-path` 全模式 EXIT=0 **10/10**（portable 5/5 + isolated 5/5 · blocked=0 · 双审 fresh re-run 复证）· 回执 4 钉（`releaseEvidence=false`·`controlPlaneClosed=false`·`publicDeleteStill503Required=true`·`intTranscript01ProductionWrite=false`）· 控制面不关。
10. checklist `:1214`（INT01 nail 期 STILL OPEN 行）：「STILL OPEN: INT-TRANSCRIPT-01 stays blocked · 六门未过…」——本刀与 exec 均**零触碰**；四条 prove 的当前 EXIT 入账若须 SSOT 登记，属 **post-prove 双审后协调方 nail 阶段**（`:1214` 留 nail）。
11. checklist `:1215`：Pins unchanged 行（haStatus=NOT_HA · releaseEvidence=false · … · public DELETE=503）。

## 1. 接线现状亲证（本机 @`9265e4d8` · 2026-10-08）

| 项 | 结论 |
|----|------|
| 四条 prove 接线 | `package.json:353-360` 全在：四条顶层 script 均经 `node scripts/run-e2e-isolated.mjs <t>:raw` 进**隔离壳**；`:raw` 目标在 `packages/db/package.json:51-53`（`prove:int-transcript-answer-fact-root` / `prove:int-transcript-remaining-sinks` / `prove:int-answer-dual-write-fence`，各对应 `test/*.proof.ts`）与 `apps/api/package.json:42`（`prove:int-transcript-preview-submit-http` → `test/int-transcript-preview-submit-http.proof.ts`）全部登记 |
| preview-submit:http standing | proof 头注原文：「use **REMOTE Postgres via env**. Never `pnpm db:up` / compose.dev. …Proves answers land on the **0092 ledger** under `MEETWISE_PUBLIC_PREVIEW=1`, without plaintext /turn jobs and without claiming INT-TRANSCRIPT-01. **0126** dual-write fence must already be applied. releaseEvidence=false.」——即该条对远程 PG env 注入有**硬前置** |
| 迁移对应 | 0092 = `int_transcript_answer_fact_root` · 0096 = `int_transcript_remaining_sinks` · 0126 = dual-write fence · 0129 = `privacy_erasure_preview_path`（均在 `packages/db/migrations/` 亲证） |
| SSOT 入账现状 | 四条 prove 在 checklist / backlog **均无当前 tip 的 EXIT 入账**（backlog `:59` 仅指名 `int-answer-dual-write-fence:prove` 为所需 harness；checklist `:174` 指名同条为证明）——「wiring 存在 ≠ 当前绿」的缺口即本刀价值 |
| #103 先例 | gate `pnpm mem00-int00:prove-path:gate` **13/13** EXIT=0 + prove-path **10/10** EXIT=0 单窗 attempt=1 · 回执 `receipts/2026-10-07-i103-mem00-int00-prove-path-attempt1-receipt.json`（4 钉常量 + attempts 全录）——本刀 EXIT 契约全套沿其 §4c（`harness/gap-i103-prove-path.md:85-93`） |
| 隔离壳纪律 | `scripts/run-e2e-isolated.mjs` 头注（BUG-FAKE-R5 fail-closed）：临时独立 cluster · 只删自建 `meetwise-e2e-*` 容器 · 绝不触碰开发库；机器回执落 `.tmp/isolated-proof-receipts/*`（gitignored） |

## 2. 形态二选一（**D1 双审裁决点** · implementer 拟案 = (i)）

| 形态 | 内容 | EXEC 触碰面 | 后果/代价 |
|------|------|-------------|-----------|
| **(i) 纯 prove 执行刀（拟案 · 推荐）** | 零 coding：四命令**单窗**顺序各跑一次（attempt=1）+ 执行前 `mem00-int00:prove-path:gate` 13/13 基线 + 回执落 `ai-docs/delivery/receipts/` + nail 登记 | 恰 1 个新 receipt 文件（本 REQUEST 亦零触碰产品码/runner） | 不动 #103 已证 10/10 绿基线；缺口（无编排聚合）留待他刀；四步各自 EXIT 独立入账 |
| (ii) additive 扩 `mem00-int00:prove-path` 编排步目（+4 步） | 四条并入 runner `ISOLATED` 数组 + gate **additive** 新断言（**Ban 弱化既有 13 条** · 原文零改 · 只增不减不改字面） | `scripts/run-mem00-int00-prove-path.mjs` + `scripts/mem00-int00-prove-path.proof.mjs`（产品 harness 码 · 属 EXEC 面·须本 REQUEST 列明交双审） | 诚实代价：preview-submit:http 远程 PG env 未注入时全模式将**恒 EXIT≠0**（runner 语义 blocked→EXIT≠0），#103 的 10/10 全绿基线在本主机不再无前置复现；聚合绿更难、且 EXEC 面扩大 |

**拟案理由**：本刀价值 =「当前 tip 单窗 EXIT+回执入账」，形态 (i) 即可达且零 coding、零产品码风险；形态 (ii) 属 **coding 刀**（触碰 #103 已证 harness），且会因 http 条 env 硬前置把已证全绿基线变**常态红**，宜另行立卷（届时按 I103 D1/D3 先例走 gate additive 断言 + 双审），不与本收尾刀捆绑。

## 3. 本刀范围（docs-only REQUEST · 全部产出 4 md）

| Face | 本 REQUEST（拟） | 仍须保留 |
|------|------------------|----------|
| **范围立卷** | 证明目标（§0）· 接线亲证（§1）· 形态裁决点（§2）· 未来授权 EXEC 触碰面（§3b） | Ban coding · Ban prove · 本刀零 SSOT |
| **prove 方案** | named 四命令 + gate 基线（§4）· 隔离壳惯例（§4b）· §4c EXIT 契约全套沿 I103 · 零 live（§5） | named ≠ coding/prove 授权（I2 先例） |
| **Pins** | 原值全抄写死（§6） | 零翻动 |
| **Ban** | §7 全清单 | alone ≠ dual |

### 3b. 未来授权 EXEC 的触碰面（拟 · 双审确认后生效）

| 触碰面 | 动作 | 形态 |
|--------|------|------|
| `ai-docs/delivery/receipts/2026-10-08-int00-prove-receipt-attempt1.md`（如双审判 JSON 可并列 `.json`） | **新增**（唯一 EXEC 产物 · attempts 全录 + 4 钉常量 + honesty 注记） | (i) |
| `scripts/run-mem00-int00-prove-path.mjs` / `scripts/mem00-int00-prove-path.proof.mjs` | **零触碰**（形态 (i)）；若双审判 (ii) 则 additive 修改 + gate 只增不改 | (ii) |
| `package.json` | **零触碰**（四条接线已存在 · 两形态均不改） | (i)/(ii) |
| SSOT（backlog / checklist / register / truth / matrix） | **EXEC 零触碰**；四条 prove 当前 EXIT 的 SSOT 登记（含 checklist `:1214` 附近与 `:173`-`:176` 各 ◐ 行是否加注「当前回执在案」）属 **post-prove 双审后协调方 nail 阶段** | (i)/(ii) |

## 4. prove 方案（named · 预声明 · **本 REQUEST 零执行** · named ≠ coding/prove 授权（I2 先例））

**§4a 命令面（单窗 · 顺序执行 · attempt=1）**：

| # | Command | 角色 | 关联 |
|---|---------|------|------|
| 0 | `pnpm mem00-int00:prove-path:gate` | **前置基线**（非 prove 步 · 静态诚实门 · 无 DB · 不起 Docker · 不读 `.env`）——**必须 13/13 EXIT=0 方可开跑**；≠13/13 → 整窗不开、全案 blocked 停 | I103 先例 13/13 |
| 1 | `pnpm int-answer-dual-write-fence:prove` | prove 步（隔离壳） | `0126` fence · checklist `:174` |
| 2 | `pnpm int-transcript-answer-fact-root:prove` | prove 步（隔离壳） | `0092` answer fact root |
| 3 | `pnpm int-transcript-remaining-sinks:prove` | prove 步（隔离壳） | `0096` remaining sinks |
| 4 | `pnpm int-transcript-preview-submit:http:prove` | prove 步（隔离壳 · **远程 PG env 硬前置**） | `0129` 预览 HTTP · checklist `:175` · backlog `:59` |

**§4b 隔离壳惯例（继承仓库现行纪律）**：四条一律走其已接线的 `scripts/run-e2e-isolated.mjs <t>:raw` 入口（临时独立 cluster · 只删自建 `meetwise-e2e-*` 容器 · 绝不触碰开发库/开发容器 · fail-closed）；**Ban 绕壳直连**、**Ban `pnpm db:up`**、Ban compose.dev 本地 Postgres 捷径（checklist `:173` 口径）。

**§4c EXIT 契约（写死 · exec 期机器可检 · 全套沿 I103 harness §4c `gap-i103-prove-path.md:85-93`）**：

1. **attempts 全记录**：每步（含 gate 基线与四条 prove）逐条入回执——attempt 序号 · Asia/Shanghai（+08:00）时间 · code SHA（exec 期 `git rev-parse HEAD` 亲取）· EXIT 值 · 分类 reason；失败与成功同列入账（PRIV4 先例 1,0 全录 · `:68` flake 先例）。
2. **单次 attempt 窗**：预声明 attempt=1 · **Ban retry-to-green**（GAP-PRIV-AUTHZ-PROVE-FLAKE backlog `:68` 先例）；任一步失败/阻塞不重跑凑绿；如需重跑须**新 REQUEST + 双审**。
3. **诚实失败路径**：任一步 EXIT≠0 → 原样入账；**`int-transcript-preview-submit:http:prove` 远程 PG env 未注入（或隔离壳不可用）→ 该步记 `blocked`（附 reason）· 该步 EXIT≠0 · **不写通过回执****（checklist `:173`「账本 HTTP 证明须远程 Postgres 环境变量」口径）；Docker daemon 缺失 → `blocked:docker_daemon_missing`；spawn 失败 → `blocked:command_spawn_failed`——**blocked ≠ pass · Ban skip-as-pass · Ban blocked 写成 pass**。
4. **整体 EXIT 语义**：四条 prove 全绿（且 gate 基线 13/13）→ 整窗 EXIT=0 并写通过回执；任一 failed **或** blocked → 整窗 EXIT≠0、按 §4c.3 分类入账、不写任何通过回执。
5. **回执**：`ai-docs/delivery/receipts/2026-10-08-int00-prove-receipt-attempt1.md`（committed · 机器侧原始回执另存 `.tmp/isolated-proof-receipts/*` gitignored 可引路径）· `class=local_untrusted` · **4 钉常量**：`releaseEvidence=false` · `controlPlaneClosed=false` · `intTranscript01ProductionWrite=false` · `publicDeleteStill503Required=true` · honesty 注记内嵌（「四条 prove 绿不关闭 INT-TRANSCRIPT-00 · 不解禁 01 · blocked ≠ pass · 单窗不重跑」）。
6. **gate 基线**：`pnpm mem00-int00:prove-path:gate` 13/13 EXIT=0 为 exec 开窗前置；基线本身入回执 attempt 台账；13 条断言原文零触碰（形态 (ii) 亦 only-additive）。
7. **EXIT0 ≠** controlPlaneClosed ≠ INT-TRANSCRIPT-00 关闭 ≠ INT-TRANSCRIPT-01 解禁/cutover 授权 ≠ 公开 DELETE 开放 ≠ `:60`/`:64` closed ≠ UC-052 covered ≠ canonical 宣称成立 ≠ HA ≠ `releaseEvidence=true` ≠ suite green ≠ coveredCount 变动（Line C 口径 · BUG-CP-CLAIM 正防越权宣称）。

## 5. 零 live（本刀与未来 EXEC 共同纪律）

无网络/无云 vendor/无控制台 spend/无密钥读取（Ban secrets / `.env*`）· 隔离面只碰本机临时容器（`meetwise-e2e-*`）· 不连任何生产/远程业务环境 · `preview-submit:http` 的「远程 PG」= 环境变量注入的**授权隔离目标**，未注入即 blocked，**绝不**为凑绿改连本地 compose 或开发库 · 全链 `releaseEvidence=false` · `actualSpendCny=null`（零 spend）。

## 6. Pins（原值全抄 · retained 写死 · 零翻动）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503**（冻结 · GAP-PRIV-02 backlog `:58`）· `g7SuiteGreen=false` · `actualSpendCny=null`

派生 retained（钉死不动）：backlog `:58`/`:59`/`:60`/`:61`-`:64` OPEN 原样 · `:68` mitigated/cause-unknown 原样 · BUG-CP-CLAIM（当前 `:103` · I103 立卷期 `:101` · 行号漂移以行 ID 为准）保持 open · `:23`/`:24`/`:44`-`:46` INFLIGHT 行原样（#103 已 landed 系 `:783` append-only 登记 · `:45` 行本体改动属 nail）· `:128` In-flight 覆盖行原样 · UC-052 partial · INT-TRANSCRIPT-00 **◐** / INT-TRANSCRIPT-01 **blocked**（checklist `:173`-`:176` 原文零改）· `INT-P0-RAW-QUEUE` **open**（legacy `/turn` 明文 payload 不洗白）· 七类 TC planned/unmapped · coveredCount 扩面**无**（本刀零 matrix edit）· checklist `:67` canonical 禁称原文零改 · checklist `:1214` STILL OPEN 留 nail。

## 7. Ban 列表

- **Ban coding**（本刀 docs-only；形态 (ii) 的 runner/gate 扩步若被判选，其 coding 亦属**未来授权 EXEC 面**，本 REQUEST 仍零 coding）· **Ban prove execution** · **Ban live**（§5）· Ban `pnpm db:up` · Ban compose.dev 捷径 · Ban 绕隔离壳直连
- **Ban 01 任何推进**：INT-TRANSCRIPT-01 **blocked 不动** · checklist `:176` 原文零改 · Ban 01 canonical write route 任何解禁叙事 · Ban 把 0126/0092/0096/0129 rehearsal 面称为 01 实现 · Ban rehearsal purge 称删除闭环
- **Ban DELETE 503 松动**：公开 DELETE 503 冻结原样 · Ban `publicDeleteStill503Required` 翻 false · Ban 预览删除回执写成公开删除完成
- **Ban SSOT 翻行**：backlog `:58`-`:64` · `:68` · `:100`-`:103`（BUG-CP-CLAIM 族 · 行号漂移以行 ID 为准）· `:128` · checklist `:67`/`:173`-`:176`/`:1214` 原文零改（`:1214` 留 nail）· Ban covered flip / coveredCount 变动 / matrix 零 diff 外任何 edit · Ban `:24`/`:45` INFLIGHT→landed 自行迁移（属协调方 nail）· Ban `INT-P0-RAW-QUEUE` 洗白
- **Ban canonical 宣称**：raw answer 终态前仍是明文 payload，**不得称为 canonical artifact**（checklist `:67` 原文）· 本 prove 绿 ≠ canonical artifact 合同成立
- **Ban 借 #104 面**：`fix/privacy-authorization-lease-takeover`（backlog `:24`/`:46` · INFLIGHT 他刀）零触碰
- **Ban blocked 写 pass**：preview-submit:http env 未注入 → blocked 且步 EXIT≠0 不写通过回执 · Ban skip-as-pass · Ban 历史回执当当前通过（#103 10/10 是 `92ab9918` 的账 · ≠ 当前 tip 证明 · 本刀即为此重证）
- **Ban retry-to-green**（`:68` 先例）· Ban 单 attempt 窗外重跑 · Ban gate 基线 ≠13/13 时开窗
- Ban 碰 sibling AN 文件 · Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · **Ban push**（本刀禁 push · push 属协调方授权后续）· Ban self-approve（alone ≠ dual）

## 8. Non-claims

docs-only REQUEST 立卷 · **not** 四条 prove 已跑/已绿（跑属未来授权 EXEC + PRE 双审 BOTH PASS + meetwise AUTHORIZE）· **not** INT-TRANSCRIPT-00 关闭（仍 ◐）· **not** INT-TRANSCRIPT-01 解禁（stays blocked · `:176` 零改）· **not** 控制面已关（BUG-CP-CLAIM 正防）· **not** DELETE 开放（503 冻结）· **not** canonical artifact 宣称（checklist `:67`）· **not** `:60`/`:64` closed · **not** UC-052 covered · **not** HA · **not** `releaseEvidence=true` · **not** coveredCount 变动 · **not** #104 范围 · alone ≠ dual · PASS ≠ AUTHORIZE ≠ coding ≠ prove · EXIT0 ≠ 关闭 ≠ 越权宣称。

## 9. 双审裁决点（留 PRE-exec dual）

| # | 裁决点 | 拟案（implementer mw-core） |
|---|--------|-----------------------------|
| D1 | **形态二选一** | **(i) 纯 prove 执行刀**（零 coding · 四命令单窗 + gate 13/13 基线 + receipts 回执 + nail 登记）；(ii) 备选 additive 扩编排步目（+4 步 · gate 13 条零弱化 only-additive）——判 (ii) 则 EXEC 面加 `scripts/run-mem00-int00-prove-path.mjs` + `.proof.mjs` additive 修改，且须接受全模式常态 EXIT≠0 的诚实代价（§2） |
| D2 | 回执形态与落点 | `receipts/2026-10-08-int00-prove-receipt-attempt1.md`（committed）+ 引 `.tmp/isolated-proof-receipts/*` 机器原始回执路径；是否并列 `.json` 由双审判 |
| D3 | http 条 env 前置口径 | `preview-submit:http` 无远程 PG env → `blocked` + 步 EXIT≠0 + 整窗 EXIT≠0 + 不写通过回执（checklist `:173`）；是否允许携授权 env 注入跑（仍是零 live 隔离面）由双审判 |
| D4 | 单窗定义 | 四命令 + gate 基线同一 exec 会话顺序执行 · attempt=1 · 任一步 blocked/failed 不阻断后续步入账（全录）但整窗 EXIT≠0；或「首败即停」——拟案**全录不中断**（证据最大化 · 与 I103 attempts 全录先例一致） |

## Review stubs

| Expert | Stub |
|--------|------|
| `mw-privacy-int` | `reviews/REQUEST-2026-10-08-int00-rcpt-mw-privacy-int.md` |
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-08-int00-rcpt-mw-e2e-ha.md` |

## 流程（本刀生命周期）

REQUEST（本文档 + slice + 双空审 stub）→ **pre-exec 双审**（`mw-privacy-int` + `mw-e2e-ha` · BOTH PASS · D1-D4 裁决）→ meetwise AUTHORIZE → **EXEC**（四命令单窗 + gate 基线 + 回执落 `ai-docs/delivery/receipts/`）→ **post-prove 双审**（BOTH PASS · fresh re-run 复证先例沿 #103）→ meetwise AUTHORIZE nail（SSOT 登记 · `:1214` 等留 nail 阶段）。

*Harness · INT00-A INT-TRANSCRIPT-00 四条已接线 prove 单窗回执收尾刀 · 2026-10-08 · `draft:awaiting_pre_exec_dual` · docs-only · 零 coding · 零 prove 执行 · 零 SSOT · 不宣称控制面已关 · 不宣称 canonical · DELETE=503 冻结 · 01 blocked 不动 · alone ≠ dual · STOP（awaiting pre-exec dual）*

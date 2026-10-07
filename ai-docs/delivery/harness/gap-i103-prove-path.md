# Harness — **I103 · #103 `chore/mem00-int00-prove-path` INFLIGHT 落地刀（INT/MEM control plane honesty prove-path）**（docs-only REQUEST · **`draft:awaiting_pre_dual`** · Ban coding · Ban prove · Ban push）

**Status**: **`draft:awaiting_pre_dual`**（docs-only REQUEST 立卷 · L0 · 本 REQUEST 零 coding · 零 prove 执行 · 零 SSOT edit · 零 push · alone ≠ dual · 执行须 PRE dual BOTH PASS + 协调方 AUTHORIZE）
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`50423a6fa`** / full `50423a6fa6f18d4c9d193611cf84c4702e067208`（本 REQUEST 前已 fetch，origin tip 与 base 一致）
**Wave**: Line **I103**（#103 INFLIGHT 落地 · INT01 nail `ad75d033` 兑现的 **privacy C-1 指名项**）
**Experts**: `mw-e2e-ha` + `mw-privacy-int`（pre dual · alone ≠ dual · Ban self-approve · Ban 代签 peer · privacy 席因 INT-00 隐私域邻接为必选）
**Knife**: **#103 INFLIGHT 落地刀** — 把 backlog `:24`/`:45` 记为 **INFLIGHT:pr-privacy-prove** 的 `chore/mem00-int00-prove-path`（`pnpm mem00-int00:prove-path`）按本文档定义的诚实口径**落地为可审 coding REQUEST**：编排 MEM-00 / INT-TRANSCRIPT-00 证明入口（可移植 pin + 隔离壳入口），**只编排与诚实分类，不关闭控制面、不改生产 DELETE、不开 INT-TRANSCRIPT-01 生产 write**。
**Gap id**: 关联 **GAP-PRIV-03**（backlog `:59` · P0 · INT-TRANSCRIPT 控制面未关 · 00 ◐ · 01 blocked）· 关联 **BUG-CP-CLAIM**（backlog `:101` · P0 ·「checklist / PR 易越权勾 `controlPlaneClosed`…（#103 正防此类）」）· 关联 MEM-00/MEM-10（checklist §MEM 域）· 关联 **GAP-PRIV-02**（backlog `:58` · 公开 DELETE=503 冻结 · 本 prove-path 回执钉 `publicDeleteStill503Required=true`）

## 0. 证明目标（一句话 + 原文钉）

**一句话**：为 `pnpm mem00-int00:prove-path` 提供一条**诚实、非关闭**的 MEM-00 / INT-TRANSCRIPT-00 证明路径编排——可移植 pin 全跑全录、隔离入口经 `run-e2e-isolated` 全跑全录、缺 Docker 记 `blocked:docker_daemon_missing`（skip ≠ pass、blocked ≠ pass）、回执 `releaseEvidence=false` + `controlPlaneClosed=false`，任何失败/阻塞使整体 EXIT≠0——**只证明「证明路径存在且诚实」，不证明控制面已关**。

**原文钉（只读引用 · 零改写）**：

1. `gap-bug-backlog.md:24`（INFLIGHT 行）：「**INFLIGHT:pr-privacy-prove** | Open PR **#103/#104** — mem00-int00 prove-path honesty + lease-takeover digest 对齐；**不宣称控制面已关**；公开 DELETE 仍 503 | `chore/mem00-int00-prove-path` · `fix/privacy-authorization-lease-takeover`」
2. `gap-bug-backlog.md:45`（#103 行）：「| #103 | chore(mem00-int00): prove-path without claiming CP closed | **INFLIGHT:pr-privacy-prove**；INT/MEM control plane honesty |」
3. `gap-bug-backlog.md:101`（BUG-CP-CLAIM）：「checklist / PR 易越权勾 `controlPlaneClosed` 或宣称 INT-TRANSCRIPT / MEM 控制面已关（**#103 正防此类**）| 保持未关；prove-path honesty；`releaseEvidence=false` | … | `pnpm mem00-int00:prove-path`（#103）」
4. `gap-bug-backlog.md:59`（GAP-PRIV-03 所需 harness）：「…checklist `INT-TRANSCRIPT-00/01` prove 路径；`pnpm int-answer-dual-write-fence:prove`；**`mem00-int00:prove-path`（#103）**」
5. INT01 nail `ad75d033`（privacy C-1 指名项来源）：INT01 harness §4 表 `pnpm mem00-int00:prove-path`（#103）格改注「**属 #103 INFLIGHT、合入后方可称已存在** · 本 REQUEST **不跑**」（`harness/gap-int-transcript-01-cutover-contract.md:121`）+ `:163` C-1 义务行 + `execution-master-checklist.md:1212`「nail 期改注兑现」/`:1214`「STILL OPEN: … `#103` INFLIGHT（`mem00-int00:prove-path` 未合入）」。
6. `gap-bug-backlog.md:58`（GAP-PRIV-02）：公开 `DELETE /privacy/interview-data/:id` **必须保持 503**（冻结）；独立 prove + 专家审批准前**不得放开**。

## 1. INFLIGHT 草稿调查结论（本机亲证 · 2026-10-07）

| 项 | 结论 |
|----|------|
| 分支痕迹 | `git branch -a | grep -i mem00` → **`remotes/origin/chore/mem00-int00-prove-path` 存在**（本地无同名分支） |
| 草稿 commit | **单 commit** `3c7f99cb` / full `3c7f99cba04987f765af3a0a352b02e2a67131a8`（2026-09-09 · `chore(mem00-int00): wire prove-path harness without claiming control plane closed`） |
| 草稿 base | `c4244470` / full `c4244470a4f3325bead4ef78ddf433cd744298f0`（= 草稿分支与主线的 merge-base · 落后当前 tip 较多） |
| 草稿触碰面 | 恰 6 文件 +327/−7：`scripts/run-mem00-int00-prove-path.mjs`（新增 277 行编排）· `scripts/mem00-int00-prove-path.proof.mjs`（新增 38 行静态诚实门）· `package.json`（+2：`mem00-int00:prove-path` / `mem00-int00:prove-path:gate`）· `ai-docs/architecture/current-runtime-truth.md` · `ai-docs/delivery/execution-master-checklist.md` · `ai-docs/delivery/production-readiness-remediation-register.md`（3 处 SSOT 注记） |
| 引用面存活核验 | 草稿引用的全部 prove 命令在当前 tip **均存在**：portable 5 条（`privacy-authorization:crypto:prove` · `privacy-erasure-preview:domain:prove` · `privacy-erasure-preview:contract:prove` · `interview-answer-submission:prove` · `pnpm -C packages/domain prove:memory-vector-chunk-deletion`（后者在 `packages/domain/package.json`））；isolated 5 条 `:raw` 目标（`privacy-authorization:prove:raw` · `privacy-erasure:http:prove:raw` · `memory-governance:prove:raw` · `memory-control-surface:prove:raw` · `memory:prove:raw`）均登记；`scripts/run-e2e-isolated.mjs` 存在且仍接受位置参数 `process.argv[2]` |
| SSOT hunks 时效 | 草稿对 checklist/register/truth 的注记系 2026-09-09 旧文，与当前 tip（INT01 nail `ad75d033`、SCOR nail 等后续大量演进）**已显著漂移**（如 checklist `:173` INT-TRANSCRIPT-00 行已被后续刀改写）；且现行治理下 **SSOT edit 属 nail 阶段专属**，exec 不碰 |

### 1b. 草稿继承/重写决策（implementer 拟案 · **D1 双审裁决点**）

- **继承（rebase 后重放）**：`scripts/run-mem00-int00-prove-path.mjs` + `scripts/mem00-int00-prove-path.proof.mjs` + `package.json` 两行接线——三个纯代码/接线面，引用面在当前 tip 全部存活，重放预期干净；重放后须过 `:gate` 静态门 + 一次 `--portable-only` 诚实试跑（**属未来授权 exec，非本 REQUEST**）。
- **不继承（弃用草稿 SSOT hunks）**：对 `current-runtime-truth.md` / `execution-master-checklist.md` / `production-readiness-remediation-register.md` 的 3 处注记**一律不带**——(a) 内容已过时须按当前 tip 重写；(b) 现行纪律 SSOT 登记 = **协调方 nail 阶段**专属（post-prove dual 后）；(c) 草稿对 `memory:prove`/MEM 行的改写含「历史回执过期」判断，须 exec 期在当前树上重新亲证，Ban 抄旧结论。
- **Ban 借草稿扩面**：草稿 commit message 与正文不构成授权；`fix/privacy-authorization-lease-takeover`（#104 · backlog `:24` 同组 INFLIGHT）**不在本刀范围**，Ban 借 I103 动 #104 面（lease-takeover digest 属 #104 刀）。

## 2. 本刀范围（docs-only REQUEST · 全部产出 4 md）

| Face | 本 REQUEST（拟） | 仍须保留 |
|------|------------------|----------|
| **范围立卷** | 证明目标（§0）· 草稿继承/重写决策（§1b）· 未来 exec 触碰面清单（§2b） | Ban coding · Ban prove · 本刀零 SSOT |
| **prove 方案** | CMD+EXIT 契约预声明（§4/§5）· 隔离壳惯例（§4b）· 零 live（§5） | named ≠ coding/prove 授权（I2 先例） |
| **Pins** | 原值全抄写死（§6） | 零翻动 |
| **Ban** | §7 全清单 | alone ≠ dual |

### 2b. 未来授权 exec 的触碰面（拟 · 双审确认后生效）

| 触碰面 | 动作 | 来源 |
|--------|------|------|
| `scripts/run-mem00-int00-prove-path.mjs` | 新增（继承草稿 `3c7f99cb` 重放） | §1b |
| `scripts/mem00-int00-prove-path.proof.mjs` | 新增（同上） | §1b |
| `package.json` | +2 行（`mem00-int00:prove-path` → `node scripts/run-mem00-int00-prove-path.mjs`；`mem00-int00:prove-path:gate` → `node scripts/mem00-int00-prove-path.proof.mjs`） | §1b |
| **SSOT 三件**（checklist / register / truth）+ backlog `:24`/`:45` INFLIGHT→landed 状态迁移 | **exec 零触碰**；属 **post-prove dual 后协调方 nail 阶段**，按当前 tip 现状重新成文 | §1b |
| INT01 harness §4 `:121` 注记 | **本刀与 exec 均零触碰**；「属 #103 INFLIGHT…」改回「已存在」属 **#103 合入后的后续 nail**（C-1 义务链的收尾步），非本刀 | §0.5 |

## 3. 相关历史（只读 cite · 零改写）

| 来源 | 口径 |
|------|------|
| INT01 立卷 + nail | REQUEST `c173ee0f`（patch-id `9d52d8ea`）→ nail `ad75d033`：C-1 修正义务兑现——§4 该格改注「属 #103 INFLIGHT、合入后方可称已存在」；**本刀即该 C-1 指名的 INFLIGHT 本体落地刀** |
| GAP-PRIV-AUTHZ-PROVE-FLAKE `:68` | mitigated/cause-unknown · **Ban retry-to-green 先例**（attempts 全录 · 单次后绿不关因）——本 prove-path EXIT 契约沿用 |
| BUG-CP-CLAIM `:101` | 「#103 正防此类」——prove-path 的存在意义即把「不得宣称控制面已关」变成**机器可检**的静态门 + 回执常量 |
| `w3-int-transcript-delete-503-freeze` | 公开 DELETE=503 冻结面——prove-path 回执 `publicDeleteStill503Required=true` 与之对齐，Ban 任何 503 语义松动 |
| 隔离壳 BUG-FAKE-R5 | `run-e2e-isolated.mjs` 头注：E2E_PG_IMAGE ≠ sole-stack truth · fail-closed · 只删自建 `meetwise-e2e-*` 容器、绝不触碰开发库——隔离入口沿用该壳，Ban 绕壳直连 |

## 4. prove 方案（CMD+EXIT 契约 · 预声明 · **本 REQUEST 零执行** · named ≠ coding/prove 授权（I2 先例））

| Command | 分类 | 关联 |
|---------|------|------|
| `pnpm mem00-int00:prove-path` | 编排入口（portable 5 + isolated 5） | §4b/§4c |
| `pnpm mem00-int00:prove-path --portable-only` | 诚实降级模式（isolated 记 `skipped:portable_only`） | D2 裁决点 |
| `pnpm mem00-int00:prove-path:gate` | 静态诚实门（无 DB · 不起 Docker · 不读 `.env`） | D3 裁决点 |

**编排步目（继承草稿 · 当前 tip 引用面已亲证存活）**：

- **portable（5 · 无 DB 无 Docker）**：`privacy-authorization:crypto:prove` · `privacy-erasure-preview:domain:prove` · `privacy-erasure-preview:contract:prove` · `interview-answer-submission:prove` · `pnpm -C packages/domain prove:memory-vector-chunk-deletion`（INT-TRANSCRIPT-00 + MEM-00 域 pin 面）。
- **isolated（5 · 经 `node scripts/run-e2e-isolated.mjs <target>:raw`）**：`privacy-authorization:prove:raw` · `privacy-erasure:http:prove:raw` · `memory-governance:prove:raw` · `memory-control-surface:prove:raw` · `memory:prove:raw`（0091 账本/lease 面 + DELETE 503 pin 面 + MEM-00/10 面）。

**§4b 隔离壳惯例（继承仓库现行纪律）**：isolated 一律走 `scripts/run-e2e-isolated.mjs`（临时独立 cluster · 只删自建 `meetwise-e2e-*` 容器 · 绝不触碰开发库/开发容器 · fail-closed）；**Ban 绕壳直连**、**Ban `pnpm db:up`**（checklist `:173` 口径）、Ban 本地 compose Postgres 捷径（草稿 gate 已含 `!pnpm db:up` / `!compose.dev` 断言，继承）。

**§4c CMD+EXIT 契约（写死 · exec 期机器可检）**：

1. **attempts 全记录**：每次尝试（含 gate、portable、isolated 每步）逐条入回执（attempt 序号 · Asia/Shanghai 时间 · code SHA · EXIT 值 · 分类 reason）；失败与成功同列入账（PRIV4 先例 1,0 全录 · `:68` flake 先例）。
2. **诚实失败路径**：任一步 EXIT≠0 → 原样入账 → 判 `failed`；spawn 失败 → `blocked:command_spawn_failed`；Docker daemon 缺失 → isolated 步记 **`blocked:docker_daemon_missing`**（Ban 把 blocked 写成 pass / Ban skip-as-pass）。
3. **EXIT 语义**：portable 全绿 **且** isolated 全绿 → EXIT0；否则（任何 failed **或** blocked）EXIT≠0——**blocked 使全路径 EXIT≠0**，`--portable-only` 降级模式下 isolated 记 `skipped:portable_only`（skip ≠ pass · 回执明记）。
4. **Ban retry-to-green**（`:68` 先例）：失败不重跑凑绿；预声明单次 attempt 窗口；如需重跑须新 REQUEST + 双审。
5. **回执**：`.tmp/mem00-int00-prove-path/<stamp>-mem00-int00-prove-path.json`（gitignored）· `class=local_untrusted_mem00_int00_prove_path_receipt` · 常量 `releaseEvidence=false` · `controlPlaneClosed=false` · `intTranscript01ProductionWrite=false` · `publicDeleteStill503Required=true` · honesty 注记内嵌（「Portable green does not close MEM-00 or INT-TRANSCRIPT-00…」）。
6. **静态门**：`:gate` 断言 package.json 接线、`releaseEvidence=false` 不可翻、`controlPlaneClosed=false`、无 `db:up`/compose 捷径、portable+isolated 入口齐全、blocked 分类存在、`--portable-only`+`skipped:portable_only` 存在、回执 class 常量（继承草稿 11 条断言；增减项属 **D3 裁决点**）。
7. **EXIT0 ≠** controlPlaneClosed ≠ INT-TRANSCRIPT-00 关闭 ≠ MEM-00/MEM-10 关闭 ≠ INT-TRANSCRIPT-01 解禁 ≠ 公开 DELETE 开放 ≠ `:60`/`:64` closed ≠ UC-052 covered ≠ HA ≠ `releaseEvidence=true` ≠ suite green（Line C 口径）。

## 5. 零 live（本刀与未来 exec 共同纪律）

无网络/无云 vendor/无控制台 spend/无密钥读取（Ban secrets / `.env*`）· 隔离面只碰本机临时容器 · 不连任何远程环境 · 账本类 HTTP 证明如涉远程 Postgres 须环境变量注入、未注入时不得填通过回执（checklist `:173` 口径）· 本 prove-path 全链 `releaseEvidence=false`。

## 6. Pins（原值全抄 · retained 写死 · 零翻动）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503**（冻结 · GAP-PRIV-02 `:58`）

派生 retained（钉死不动）：backlog `:58`/`:59`/`:60`/`:64` OPEN · `:101` BUG-CP-CLAIM 保持 open（#103 落地**不自动关任何行** · 关闭须另行证据+nail）· `:68` mitigated/cause-unknown 原样 · `:123` In-flight 覆盖行原样 · UC-052 partial · INT-TRANSCRIPT-01 **blocked**（checklist `:173`「这**不**授权 01 生产 cutover」）· `INT-P0-RAW-QUEUE` open · 七类 TC planned/unmapped · coveredCount 扩面**无**（本刀零 matrix edit）。

## 7. Ban 列表

- **Ban coding**（本刀 docs-only）· **Ban prove execution** · **Ban live**（§5）· Ban `pnpm db:up` · Ban 绕隔离壳直连
- **Ban 翻 SSOT 行**：Ban covered flip / coveredCount 变动 / matrix-checklist-backlog-register-truth 任何 edit（exec 期亦只碰 `scripts/*` + `package.json`，SSOT 留 nail 阶段）· Ban `:24`/`:45` INFLIGHT→landed 自行迁移（属协调方 nail）
- **Ban 借刀动 INT01 立卷合同**：`harness/gap-int-transcript-01-cutover-contract.md` §4 `:121` 注记（及 `:163` C-1 行）**本刀零触碰**——「合入后方可称已存在」的改回属 **#103 合入后的后续 nail**，Ban self-close 该义务链
- **Ban 借刀动 PRIV4 / AR 产物**：`:60`/`:64` 行、PRIV4 本地行级证据面、AR `stub≠cloud` 口径零触碰 · Ban 碰 `fix/privacy-authorization-lease-takeover`（#104 刀面）
- **禁碰已占用行**：backlog `:58`（503 冻结）· `:59` · `:60` · `:64` · `:68` · `:100` · `:101` · `:102`（#102 pr-model-op-calib 属他刀）· `:123` · checklist `:154`/`:167`-`:176` 现状原文 · UC-052 partial · `INT-P0-RAW-QUEUE` open · 七类 TC planned/unmapped
- **Ban 宣称控制面已关**：Ban `controlPlaneClosed=true` / MEM-00·INT-TRANSCRIPT-00「已关闭」叙事（BUG-CP-CLAIM `:101` 正防此类）· Ban 公开 DELETE 开放（503 冻结）· Ban 0129 preview 回执写成完成 · Ban rehearsal purge 称删除闭环 · Ban blocked/skipped 写成 pass
- Ban 历史回执当当前通过（`memory:prove` 2026-08-10 旧回执 ≠ 当前树证明 · 须 exec 期重证）· Ban retry-to-green（`:68` 先例）· Ban 单 attempt 窗外重跑
- Ban 碰 sibling AN 文件 · Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · **Ban push**（本刀禁 push）· Ban self-approve（alone ≠ dual）

## 8. Non-claims

docs-only REQUEST 立卷 · **not** prove-path 已落地/已合入（落地属未来授权 exec + PRE dual BOTH PASS + AUTHORIZE）· **not** 控制面已关（MEM-00 / INT-TRANSCRIPT-00/01 均未关）· not DELETE 开放（503 冻结）· not `:60`/`:64` closed · not UC-052 covered · not HA · not `releaseEvidence=true` · not INT01 C-1 义务链已闭合（改注「已存在」属后续 nail）· not #104 范围 · alone ≠ dual · PASS ≠ AUTHORIZE ≠ coding ≠ prove

## 9. 双审裁决点（留 PRE dual）

| # | 裁决点 | 拟案（implementer） |
|---|--------|---------------------|
| D1 | 草稿继承/重写口径 | scripts×2 + package.json 接线继承重放（引用面已亲证存活）；SSOT hunks 一律不继承（过时 + nail 阶段专属） |
| D2 | 降级模式语义 | `--portable-only` 时 isolated 记 `skipped:portable_only` 且 EXIT 可为 0——skip≠pass 须回执明记；全模式缺 Docker 必须 EXIT≠0（blocked≠pass） |
| D3 | gate 静态断言面 | 继承草稿 11 条断言为基础；增减项由双审判（如补 `publicDeleteStill503Required` 断言） |

## Review stubs

| Expert | Stub |
|--------|------|
| `mw-privacy-int` | `reviews/REQUEST-2026-10-07-gap-i103-prove-path-mw-privacy-int.md` |
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-07-gap-i103-prove-path-mw-e2e-ha.md` |

*Harness · I103 #103 mem00-int00 prove-path 落地刀 · 2026-10-07 · `draft:awaiting_pre_dual` · 零 coding · 零 prove 执行 · 零 SSOT · 不宣称控制面已关 · DELETE=503 冻结 · INT01 C-1 指名项 · alone ≠ dual · STOP（awaiting pre dual）*

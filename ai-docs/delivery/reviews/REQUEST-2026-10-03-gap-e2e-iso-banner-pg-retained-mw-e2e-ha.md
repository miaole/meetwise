# REQUEST — **GAP-E2E-ISO-BANNER-PG-RETAINED 一致性对齐刀** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-e2e-iso-banner-pg-retained.md` · slice `gap-e2e-iso-banner-pg-retained.slice.md`
**基线 tip**: `8dde8e3`（full `8dde8e3c795178395b4fb9bf0e759aeb11693b90` · 本地 origin ref · docs tip · not a prove tip；开刀时 fetch 网络超时，远端 tip 请审查方侧复核）
**Worktree / branch**: `/Users/miaole/Desktop/golucky/meetwise-line-n` · `line/n-iso-banner-align`
**Date**: 2026-10-03

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
| 公开 DELETE | **503**（stays） |

## 范围 / 背景

Line N · docs-only 对齐刀（§3 loop 第③步）。现状张力：`scripts/run-e2e-isolated.mjs:2068` 的隔离一次性 PG 横幅（`E2E isolated PostgreSQL: ${container} on 127.0.0.1:${env.PGPORT}`）与 stale 的 `:1694-1697`（R5-MARKED-RED，仍写 `(dual-track; intended sole default=${SOLE_STACK})`、`(sole stack = MySQL+Qdrant+Redis)`）vs `ai-docs/delivery/adr-postgres-retained.md:9-11`（keep Postgres / keep `PostgresSaver` / keep pgvector）——banner 既可能被读成「隔离一次性 PG = 偏离 PG-retained」，也可能被反向读成 cutover 依据。对齐口径：**隔离壳是测试基础设施，PG-retained 是产品栈钉，两者并存且互不否定**；对齐措辞硬含「**隔离测试 PG ≠ 产品栈变更 ≠ cutover 证据**」。

执行方案（经授权后）：**方案一** ADR Non-claims 追加一条 clarify bullet（additive-only）+ **方案二** `scripts/run-e2e-isolated.mjs` 在 `:2068` 横幅后**新增**一组 console 输出行（纯文案、零行为）。方案二为**唯一允许的产品面触碰点**，diff 预览逐行见 harness §5（新增 `E2E_ISO_STACK_NOTE …` console 行；零新变量、零控制流、零 exit code 变化、`node --check` 过、本刀不运行任何 e2e）。默认两者都做；任一方案被双审砍掉即不做。**≠ sole cutover**、零产品行为变更。

## 禁碰 / Ban（逐条）

1. **Ban 把对齐写成 sole cutover / MySQL 切流暗示**（零栈迁移语义；`adr-mysql-qdrant-local.md` sole 叙事已被 ADR supersede，不反向当 truth）。
2. **Ban 改 PG-retained pin 本体**（`adr-postgres-retained.md` Decision L7-14 逐字不动；PostgresSaver / pgvector / RLS pin 不重述不松动）。
3. **Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 行**（matrix 对应行及 nails · covered/partial/gap 状态 · `coveredCount=8` 不变）。
4. **Ban SSOT edit**（matrix / `gap-bug-backlog.md` L63 / execution-master-checklist 本刀零改动）。
5. **Ban 改 `SOLE_STACK`/`LEGACY_STACK`/`SOLE_APPROVED_FIXTURE_CONFIG`（`run-e2e-isolated.mjs:1603-1606`）与 R5-MARKED-RED 既有字符串（`:1694-1697`）**——SOLE_STACK 对齐另包。

Ban coding（除 harness §5 申报的纯文案新增行外零代码）· Ban prove · Ban push · Ban force-push · Ban self-approve · Ban secrets / `.env*`。本 stub 不是 nail、不是 HA、不是 covered、不是 cutover 授权。

## 流程

本 stub 为 pre-exec 审查入口：`mw-e2e-ha` PASS + `mw-privacy-int` PASS（**BOTH**，alone ≠ dual · PG-retained 属隐私/栈域故 `mw-privacy-int` 入双审）→ 协调方（meetwise bot）授权 → 实现方按 harness §4/§5 diff 预览执行对齐（默认两者）→ post-align docs supplement + post-align 双审另起。本 commit 本身不运行任何 e2e。

---

*Stub · awaiting expert pre-exec dual · STOP*

---

## POST-PROVE dual 审查 · `mw-e2e-ha`（adversarial evidence-honesty）· 2026-10-03

**被审 tip**: 执行 commit `aab0e8b`（full `aab0e8b1b8bba59e3bd843f4642ebd42abb22c3e` · branch `line/n-iso-banner-align` · parent = origin nail `608e769b77481055cc522775ffed94e2913d7acb`）
**审查 worktree / branch**: `/Users/miaole/Desktop/golucky/meetwise-rv-np-e2e-ha` · `rv/np-e2e-ha`（独立 worktree，本审查全部 git 写操作仅在此）
**方式**: 只读取证 + 命令 + EXIT + 可复现证据 · Ban self-approve · alone ≠ dual · 不代签 `mw-privacy-int`（peer 侧归 peer 自签）· 本审查零 e2e 运行（Ban prove）
**包结构**: `aab0e8b` = 恰 2 文件 +5/−0（`adr-postgres-retained.md` +1 · `scripts/run-e2e-isolated.mjs` +4）；REQUEST `351f163` 因 patch-identical 已 rebase drop，内容经 origin `8cd5ed2` 保留（两者 patch-id 全等 = `120ac6e8b61adb1d2a09d897d32d25f9fe3839d9`）
**pre-exec gate**: `mw-e2e-ha` PASS @`e2d9c8e`（2026-10-05 03:19:36 -0700 · branch `rv/n-e2e-ha`）+ `mw-privacy-int` PASS @`a9a9fec`（03:19:58）均先于执行 `aab0e8b`（03:35:30）；本段裁决的 C-1~C-6 即 pre-exec 段（@`e2d9c8e`）所立 Conditions

### 1. 机检结果（命令 + EXIT 实测 · 非转抄实现方自检）

| # | 机检项 | 结果 | 可复现证据 |
|---|--------|------|------------|
| M1 | 包完整性 | **过** | `git show --stat aab0e8b` → 恰 `2 files changed, 5 insertions(+)` 零删除；`git diff --name-only 608e769 aab0e8b` → 恰 2 文件（ADR + mjs），零其它文件 |
| M2 | §4 预览字节级 | **过** | 实际 diff `+` 行（恰 1 行）与 harness §4 预览 `+` 行 `cmp` 全等 → `ADR_CMP_IDENTICAL=YES`；严格删除行（`^-[^-]`）= 0；hunk 数 = 1 |
| M3 | §5 预览字节级 | **过** | 实际 diff `+` 行（恰 4 行物理行：`console.log(` / 模板字面量×2 / `);`）与 harness §5 预览 `cmp` 全等 → `MJS_CMP_IDENTICAL=YES`；hunk 数 = 1（`@@ -2066,6 +2066,10 @@`）；上下文锚行（`await waitForPostgres(env);` / `E2E isolated PostgreSQL:` banner）逐字节全等 → `CONTEXT_ANCHOR_IDENTICAL=YES` |
| M4 | 语法 | **过** | `node --check scripts/run-e2e-isolated.mjs` → EXIT=0 |
| M5 | 红线零命中 | **过** | 唯一 hunk 旧域 2066-2071 与 L1603-1606 / L1639-1654 / L1694-1697 / L2040-2046 零交集；四区间在 `608e769` vs `aab0e8b` 两 blob 上逐字节 `cmp` 全等；`SOLE_STACK`/`LEGACY_STACK`/`SOLE_APPROVED_FIXTURE_CONFIG` 常量与 R5-MARKED-RED 字符串在 `aab0e8b` 原样 |
| M6 | ADR Decision/既有 bullet | **过** | L7-14（Decision 全文）与 L36-38（含既有 Non-claims bullet）两 blob `cmp` 全等；新 bullet 恰 1 条落 L39（additive-only · 零删除/零改写行） |
| M7 | SSOT + UC 零 diff | **过** | `e2e-requirement-coverage-matrix.md` / `gap-bug-backlog.md` / `execution-master-checklist.md` diff 均 = 0 行；UC-018/052/025/004 零命中（matrix 整文件零 diff）；backlog L63 named-gap 行原样未动 |
| M8 | +4 行号漂移披露核验 | **过** | 新增块占 L2069-2072；全部在案引用行号 ≤2068 不漂移（banner 仍 L2068 · R5 仍 L1694-1697 · `sole stack = MySQL+Qdrant+Redis` 仍 L1696，均在 `aab0e8b` 树 grep 实证）；仅插入点之后整体 +4：harness §1 所引 L2109 `} // end else (legacy pgvector disposable path)` → L2113（实测） |
| M9 | 零 e2e 面 | **过** | 执行 commit name-only = 2 文件，零 `.tmp`/receipt/prove 产物；本审查全程零 e2e 运行 |

### 2. 措辞审查

- **不等式硬含**：`E2E_ISO_STACK_NOTE`（mjs L2070）与 ADR L39 bullet 均**逐字含** `isolated test PG ≠ product stack change ≠ cutover evidence`（grep 各 1 命中）。
- **零切流暗示**：新增 4 行 + bullet 扫描 `sole|mysql|qdrant|migrat|cutover|switch` → 唯一语义命中为否定式 `≠ cutover evidence` 本身（`console.log(` 为 "console" 子串误报）；note 仅把 `adr-postgres-retained.md` 钉为 product stack pin，零迁移/切流/「隔离壳=栈真相」语义。
- **双误读封死**：bullet 明写 banners = `test infrastructure narration, not stack truth` + `neither contradict nor evidence this ADR's Postgres / PostgresSaver / pgvector retention`——既封「隔离壳偏离 pin」也封「banner=迁移证据」。
- **stale 措辞 = named gap**：bullet 明写 `known named gap (gap-bug-backlog.md GAP-E2E-ISO-BANNER-PG-RETAINED) and must not be cited as stack truth`——与 backlog L63 缓解口径（收据/审查不得引用该 banner 作 stack truth；SOLE_STACK 对齐另包）逐点同构，无收紧/放松/新增面。
- **诚实标记**：note 自带 `releaseEvidence=false · Not HA`，与 Pins 同值。

### 3. 条件裁决（pre-exec C-1~C-6 逐条）

| 条件 | 裁决 | 依据 |
|------|------|------|
| C-1 | **PASS** | M2/M3/M4/M9：§5 恰 4 行物理新增逐字节全等、零其它 hunk、严格删除行 0、`node --check` EXIT=0、零 e2e 面 |
| C-2 | **PASS** | M6：仅 1 条新增 bullet @L39；Decision L7-14 与既有 Non-claims bullet（L36-38 区间）逐字节零改动 |
| C-3 | **PASS** | M5：红线三处（常量 L1603-1606 · R5 L1694-1697 · G3 L1639-1654/L2040-2046）零 diff 命中（区间 blob 全等 + hunk 域零交集） |
| C-4 | **PASS** | pre-exec 双 PASS 齐备且先于执行（`e2d9c8e` 03:19:36 + `a9a9fec` 03:19:58 < `aab0e8b` 03:35:30）；author 各自独立（mw-e2e-ha / mw-privacy-int）；执行产物与被授权 §4/§5 预览逐字节全等；协调方显式授权动作本身非 git 可见物，以双 PASS 时序 + 内容逐字节全等为据如实记录；alone ≠ dual 保持（本段仅 mw-e2e-ha 单签） |
| C-5 | **PASS** | M7 + rebase 核实：`351f163` 与 `8cd5ed2` patch-id 全等（`120ac6e8…`）；`aab0e8b` parent = `608e769b`；`8cd5ed2` 为 `608e769` 与 `aab0e8b` 祖先；`8cd5ed2..608e769`（4 commits，均 Line L / G7 docs）与刀内 2 文件零交集 → rebase 对本刀内容中性；Pins 原值保持（包文档零触碰 + note 自带同值标记） |
| C-6 | **PASS** | backlog L63 原样（named gap 状态未动）；ADR bullet/note 自身不引 banner 作 stack truth；本审查段同守 |

### 4. Blockers

- 无。

### 5. Conditions（后续口径 · 非阻断）

- **CO-1**: backlog L63 行状态翻转（如有）只按 harness §6④ 另行 post-align docs 流程 + 届时授权处理；本 PASS 不构成该翻转依据。
- **CO-2**: 任何收据/审查继续禁引 R5 banner（L1694-1697）或新 `E2E_ISO_STACK_NOTE` 行作 stack truth / cutover 证据（C-6 延续）；SOLE_STACK 对齐仍属另包。
- **CO-3**: ADR bullet 内嵌 `@L2068` / `@L1694-1697` / `@L1696` 为 `aab0e8b` 快照实证；后续任何触碰 `run-e2e-isolated.mjs` 行布局的包（含 SOLE_STACK 对齐包）须复核这些引用（本刀实测仅插入点之后 +4 漂移）。
- **CO-4**: alone ≠ dual：本段为 `mw-e2e-ha` 单侧 POST-PROVE；`mw-privacy-int` 侧归 peer 自签，本段不代签、不引用其未见内容。

### 6. 三行中文摘要

1. 执行 commit `aab0e8b`（parent=origin nail `608e769`）恰 2 文件 +5/−0，harness §4/§5 预览块与实际 diff `cmp` 逐字节全等（ADR 1 行 + mjs 4 物理行 · 各 1 hunk · 零删除行），`node --check` EXIT=0，红线四区间 blob 全等，SSOT/UC/checklist 零 diff，+4 漂移实测（L2109→L2113）且全部在案引用不漂移。
2. 措辞双侧硬含「隔离测试 PG ≠ 产品栈变更 ≠ cutover 证据」，零切流/零「隔离壳=栈真相」暗示，stale banner 钉为 named gap 禁作 stack truth；pre-exec 双 PASS（`e2d9c8e` + `a9a9fec`）齐备且先于执行，REQUEST 经 patch-id 全等的 `8cd5ed2` 保留在 `aab0e8b` 谱系，C-1~C-6 全 PASS、无 Blockers。
3. 本段为 `mw-e2e-ha` 单侧 POST-PROVE，**alone ≠ dual，不代签 `mw-privacy-int`**；backlog L63 翻转等 SSOT 变更仍须另行 post-align 流程授权。

Verdict: PASS

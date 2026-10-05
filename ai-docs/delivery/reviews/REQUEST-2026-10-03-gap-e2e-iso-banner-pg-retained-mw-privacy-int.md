# REQUEST — **GAP-E2E-ISO-BANNER-PG-RETAINED 一致性对齐刀** · pre-exec · mw-privacy-int

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503
**Expert**: `mw-privacy-int`
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

Line N · docs-only 对齐刀（§3 loop 第③步）。现状张力：`scripts/run-e2e-isolated.mjs:2068` 的隔离一次性 PG 横幅（`E2E isolated PostgreSQL: ${container} on 127.0.0.1:${env.PGPORT}`）与 stale 的 `:1694-1697`（R5-MARKED-RED，仍写 `(dual-track; intended sole default=${SOLE_STACK})`、`(sole stack = MySQL+Qdrant+Redis)`）vs `ai-docs/delivery/adr-postgres-retained.md:9-11`（keep Postgres / keep `PostgresSaver` / keep pgvector）——banner 既可能被读成「隔离一次性 PG = 偏离 PG-retained」，也可能被反向读成 cutover 依据。对齐口径：**隔离壳是测试基础设施，PG-retained 是产品栈钉，两者并存且互不否定**；对齐措辞硬含「**隔离测试 PG ≠ 产品栈变更 ≠ cutover 证据**」。PG-retained 属隐私/栈域，故 `mw-privacy-int` 为本刀双审之一。

执行方案（经授权后）：**方案一** ADR Non-claims 追加一条 clarify bullet（additive-only）+ **方案二** `scripts/run-e2e-isolated.mjs` 在 `:2068` 横幅后**新增**一组 console 输出行（纯文案、零行为）。方案二为**唯一允许的产品面触碰点**，diff 预览逐行见 harness §5（新增 `E2E_ISO_STACK_NOTE …` console 行；零新变量、零控制流、零 exit code 变化、`node --check` 过、本刀不运行任何 e2e）。默认两者都做；任一方案被双审砍掉即不做。**≠ sole cutover**、零产品行为变更、公开 DELETE=503 语义零触碰。

## 禁碰 / Ban（逐条）

1. **Ban 把对齐写成 sole cutover / MySQL 切流暗示**（零栈迁移语义；`adr-mysql-qdrant-local.md` sole 叙事已被 ADR supersede，不反向当 truth）。
2. **Ban 改 PG-retained pin 本体**（`adr-postgres-retained.md` Decision L7-14 逐字不动；PostgresSaver / pgvector / RLS pin 不重述不松动）。
3. **Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 行**（matrix 对应行及 nails · covered/partial/gap 状态 · `coveredCount=8` 不变 · 公开 DELETE=503 stays）。
4. **Ban SSOT edit**（matrix / `gap-bug-backlog.md` L63 / execution-master-checklist 本刀零改动）。
5. **Ban 改 `SOLE_STACK`/`LEGACY_STACK`/`SOLE_APPROVED_FIXTURE_CONFIG`（`run-e2e-isolated.mjs:1603-1606`）与 R5-MARKED-RED 既有字符串（`:1694-1697`）**——SOLE_STACK 对齐另包。

Ban coding（除 harness §5 申报的纯文案新增行外零代码）· Ban prove · Ban push · Ban force-push · Ban self-approve · Ban secrets / `.env*`。本 stub 不是 nail、不是 HA、不是 covered、不是 cutover 授权。

## 流程

本 stub 为 pre-exec 审查入口：`mw-privacy-int` PASS + `mw-e2e-ha` PASS（**BOTH**，alone ≠ dual）→ 协调方（meetwise bot）授权 → 实现方按 harness §4/§5 diff 预览执行对齐（默认两者）→ post-align docs supplement + post-align 双审另起。本 commit 本身不运行任何 e2e。

---

*Stub · awaiting expert pre-exec dual · STOP*

---

## POST-PROVE dual review · `mw-privacy-int`（单侧签发 · append-only · 2026-10-03）

**Reviewer**: `mw-privacy-int`（PG-retained 栈钉/隐私域审）· **Scope**: POST-PROVE dual（docs+banner-note 对齐刀复验）· 本审只动本审查文件（append-only），零其它文件触碰。**alone ≠ dual**：本段仅为 `mw-privacy-int` 单侧 PASS；并行 `mw-e2e-ha` 的 POST-PROVE 审在本审视野外、不代签不预判；本阶段 dual 以两侧 PASS 齐备为准。
**被审 tip**: **`aab0e8b`**（full `aab0e8b1b8bba59e3bd843f4642ebd42abb22c3e` · `feat(e2e): GAP-E2E-ISO-BANNER-PG-RETAINED align (docs+banner-note only)`）· branch `line/n-iso-banner-align` · **parent = `608e769`**（full `608e769b77481055cc522775ffed94e2913d7acb`，origin nail）。
**Review worktree**: `/Users/miaole/Desktop/golucky/meetwise-rv-np-privacy-int` · branch `rv/np-privacy-int`（一切 git 写操作只在此 worktree）。
**pre-exec dual 回溯**: `mw-privacy-int` @`a9a9fec`（Verdict: PASS）+ `mw-e2e-ha` @`e2d9c8e`（Verdict: PASS）→ 协调方授权 → 实现 tip `aab0e8b`。

### 机检结果（608e769 → aab0e8b · 本审全部命令实证可复现）

| # | 项 | 命令/证据 | 结果 |
|---|----|-----------|------|
| 1 | 全刀触碰面 | `git diff --numstat 608e769 aab0e8b` = 仅 2 文件 +5/−0（`adr-postgres-retained.md` +1/−0 · `run-e2e-isolated.mjs` +4/−0）；零删除、零改写、零 SSOT/UC/privacy 域/`.env`/receipt 命中 | PASS |
| 2 | ADR 保护（核心职责） | `git diff 608e769 aab0e8b -- ai-docs/delivery/adr-postgres-retained.md` 恰 **1 hunk**（`@@ -36,6 +36,7 @@`）+1/−0；该 diff 内 `^-` 行机检 = 0（零删除/改写）；Decision L7-14 与基线逐字节比对相同（`diff <(git show 608e769:…) <(sed -n '7,14p')` 空）；既有 Non-claims bullet（原 L36-38，实为 L38 bullet）以 context 在场零改动；新 bullet 落位 **L39**，与 harness §4 预览 `+` 行 **逐字相等**（`diff` 空） | PASS |
| 3 | bullet 语义闸 | 逐字含 `test infrastructure narration, not stack truth` · **`isolated test PG ≠ product stack change ≠ cutover evidence`** · `neither contradict nor evidence … Postgres / `PostgresSaver` / pgvector retention`（纯指针指称，无重述/升降级）· stale 措辞标注 `known named gap (gap-bug-backlog.md GAP-E2E-ISO-BANNER-PG-RETAINED) and must not be cited as stack truth` · `SOLE_STACK code-path alignment is a separate package`；零「隔离壳=栈真相/可切流」暗示；Postgres/PostgresSaver/pgvector 钉无弱化（L7-14 逐字节未动兜底） | PASS |
| 4 | banner-note 4 行（C-3 勘误口径） | mjs 恰 **1 hunk**（`@@ -2066,6 +2066,10 @@`）+4/−0；实际新增 4 行（新 L2069-2072）与 harness **§5 diff 块** `+` 行 **逐字相等**（`diff` 空）；按 privacy pre-exec C-3 勘误以 diff 块 4 行为准、散文「三行」系笔误；插入紧随 `E2E isolated PostgreSQL:` 横幅行（基线 L2068 = 新 L2068，文本锚落位成立）；`E2E_ISO_STACK_NOTE` 为纯静态模板串（无 `${}`、无新变量、无控制流/exit code/参数变化，文件内该标识符仅此 1 处命中=纯新增）；措辞硬含三不等式 + 指针钉 `ai-docs/delivery/adr-postgres-retained.md (Postgres retained · PostgresSaver · pgvector)` + `releaseEvidence=false · Not HA` | PASS |
| 5 | 红线零 diff | L1603-1606（`SOLE_STACK`/`LEGACY_STACK`/`SOLE_APPROVED_FIXTURE_CONFIG`）· L1694-1697（R5-MARKED-RED，含 L1696 `sole stack = MySQL+Qdrant+Redis` stale 串）· G3 fail-closed L1639-1654 / L2040-2046：与 `608e769` 同区间逐字节比对相同（`diff` 空）；且唯一 hunk 在 L2066+，构造性未触 | PASS |
| 6 | SSOT + UC + privacy 域 | `e2e-requirement-coverage-matrix.md` / `gap-bug-backlog.md`（含 L63 行状态）/ `execution-master-checklist.md` / `uc-e2e-050-052-privacy-erasure.slice.md`：`git diff --quiet 608e769 aab0e8b -- <file>` 全部零 diff（叠加 #1 全树仅 2 文件，UC-018/052/025/004 相关一切文件构造性零触碰） | PASS |
| 7 | `node --check` | `node --check scripts/run-e2e-isolated.mjs` → 退出 0 | PASS |
| 8 | +4 行号漂移披露 | 实证：prove/R5 目标清单两行语句基线 L2069-2070 → 新 **L2073-2074**；`} // end else (legacy pgvector disposable path)` 基线 L2109 → 新 **L2113**；横幅行及其前所有行号不动 → ADR bullet 内嵌 `@L2068 / @L1694-1697 / @L1696` 落位后仍准确 | PASS |

### 条件裁决（pre-exec C-1~C-5 逐条）

| # | Condition | 裁决 | 依据 |
|---|-----------|------|------|
| C-1 | 远端 tip 复核 / rebase 处理 | **CLOSED** | `aab0e8b` parent = `608e769` 机检成立；本审实拉 `git fetch origin feat/mysql-schema-skeleton` 成功，`origin/feat/mysql-schema-skeleton` = `608e769`（远端未前进）；祖先链 `8dde8e3` < `8cd5ed2`（REQUEST）< `608e769` < `aab0e8b` 线性；REQUEST stub 在 `8cd5ed2` 与 `aab0e8b` 间逐字节相同（`git diff --quiet` 过），pre-exec 锚点全程有效 |
| C-2 | 文本锚落位 + post-align 行号重引 | **CLOSED** | 按 §4/§5 文本锚落位（非行号硬编）：4 行紧随横幅行插入、横幅行保持 L2068；post-align 行号已重核并披露（L2069-2070→L2073-2074 · L2109→L2113）；bullet 内引行号 `@L2068/@L1694-1697/@L1696` 均 < 2069 插入点，落位后仍准确 |
| C-3 | 4 行勘误机检 | **CLOSED** | 执行 diff 恰 = §5 diff 块 4 行逐字纯新增、零其它 hunk、`node --check` 过；散文「三行」按 pre-exec 勘误不作执行依据、未造成偏差 |
| C-4 | post-align supplement 冻结 SSOT | **CLOSED（延续中）** | 执行 commit SSOT/UC/privacy 零命中；本 POST-PROVE 审自身亦只动本审查文件；backlog L63 行状态未翻，任何 SSOT 变更仍归 post-align supplement 另行授权流程 |
| C-5 | 双 PASS 齐 + 协调方授权链 | **CLOSED（pre-exec 阶段）** | pre-exec 双 PASS 在案：`mw-privacy-int` @`a9a9fec` Verdict: PASS + `mw-e2e-ha` @`e2d9c8e` Verdict: PASS；协调方据此授权执行（实现 tip `aab0e8b` 在案）。**POST-PROVE 阶段 alone ≠ dual 重申**：本 PASS 为单侧，`mw-e2e-ha` 并行审独立签发后方可称本阶段 dual |

### Blockers

无（none）。

### Conditions（本 PASS 附带 · 不阻断）

- **CO-1 alone ≠ dual**：本段为 `mw-privacy-int` 单侧 POST-PROVE PASS；`mw-e2e-ha` 的并行 POST-PROVE 审未在本审视野内、不代签；仅当其独立 PASS 亦在案时，本阶段方为 dual PASS。
- **CO-2 行号引用时效**：ADR bullet 内 `@L1694-1697 / @L1696` 指向当前 stale banner 实位；「SOLE_STACK 对齐另包」落地改写该区间时，须在该包内重审/重引行号，本刀不预授权。
- **CO-3 note 语义钉**：`E2E_ISO_STACK_NOTE` 行永远为 narration-only，任何后续解析/收据不得将其（或 R5-MARKED-RED stale banner）当 stack truth；stale banner 仍为 named gap，直至另包对齐。
- **CO-4 SSOT 冻结延续**：backlog L63 / matrix / execution-master-checklist 本刀后原样；状态翻转只走 post-align supplement 授权流程。

### 三行中文摘要

1. `aab0e8b`（parent=`608e769` origin nail，远端实拉未前进）全刀仅 2 文件 +5/−0：ADR 恰 1 hunk 且 Decision L7-14 与既有 bullet 逐字节零改动，新 bullet L39 与 §4 预览逐字相等，含「隔离测试 PG ≠ 产品栈变更 ≠ cutover 证据」并把 stale banner 钉为 named gap 禁作 stack truth。
2. mjs 恰 1 hunk +4 行且与 §5 diff 块逐字相等（「三行」系散文笔误，按 C-3 勘误以 diff 块为准），紧随 L2068 横幅文本锚落位，`node --check` 过；`SOLE_STACK`/R5-MARKED-RED/G3 红线与 SSOT 三件、UC-018/052/025/004、privacy 域全部零 diff，+4 漂移实证（L2069-2070→L2073-2074 · L2109→L2113）。
3. pre-exec C-1~C-5 全部 CLOSED（C-5 为 pre-exec 阶段；POST-PROVE 阶段 alone ≠ dual，`mw-e2e-ha` 侧并行审不代签）；无 Blockers，附 CO-1~CO-4；`mw-privacy-int` 单侧 PASS。

Verdict: PASS

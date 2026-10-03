# 审查 — GAP-UC004-FAIL-A3 NHP · post-prove · mw-e2e-ha

**角色**: `mw-e2e-ha`（证据诚实 · 对抗）· **不代签** `mw-rag-route` · **不代签** `mw-privacy-int`
**轮次**: Line C' POST-PROVE · docs honesty nail · 未跑 career-path 套件 · 未把任何 EXIT 0 当成 A3 · 未起 Postgres · 未改产品代码 · 未发 live/model
**审的 nail**: `0807d27` / `0807d2729bd38d4f6b37add0196f819cb51247d2`
**父提交**: `cc8a405` / `cc8a4054d9ee2f2cb1224f2124c1878b2cbc1d14`
**任务点名的 tip**: `3ee28d3` / `3ee28d376a3031fcb064d3b7ca05e103d799eb81`（nail 是其祖先；本审查落笔时 origin 已前移，见条件）
**本轮 diff**（`git diff-tree --name-only -r 0807d27`）仅五份 docs：
- `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（+3）
- `ai-docs/delivery/execution-master-checklist.md`（+9）
- `ai-docs/delivery/gap-bug-backlog.md`（+11）
- `ai-docs/delivery/gap-uc004-fail-a3-nhp.slice.md`（状态短语 + 文末一节）
- `ai-docs/delivery/harness/gap-uc004-fail-a3-nhp.md`（状态短语 + 文末一节）
**docs-only**: **yes**（无产品文件 · 无脚本 · 无 `.env*`）
**pre-exec 对照**: `4107de2` / `4107de2479906269864416815c4d4992159c3dfa`（FAULT 保持 gap，REQUEST 本身不是 nail、不是产品故障路径）

alone ≠ dual。本 PASS ≠ coding authorization ≠ covered ≠ HA ≠ `mw-rag-route` 的签名。本 nail 只记录 docs 状态，不关闭缺口。

---

## 1. FAULT / 行仍是 gap，GAP-UC004-FAIL-A3 未关 — 通过

`git show 0807d27:ai-docs/delivery/e2e-requirement-coverage-matrix.md`

- L115 表行未改：`UC-E2E-004` = **gap / gap / gap / blind**，读法「整行 gap；A3 失败降级未接线」。与父提交该行 sha256 前缀 `90942f0d65` 相同。
- L173 §1.1 覆盖状态仍是 **gap**，正文仍写 G-GAP `FAIL-A3` 与 **≠ covered**。行哈希与父提交相同（`4772b09f5b`）。
- L275 P1-9 仍写「矩阵保持 **gap**（honest）；**禁止**升 covered」。本 nail 的 diff 没有碰到该行。
- L350–L352 只在文末追加 C' 注：docs-nail 状态 `post_pre_exec_dual_pass`。L352 写明 FAULT column stays **gap**，UC-E2E-004 row stays **gap**，`NHP-004-FAULT-01` stays **gap**，**Not a close**。

`git show 0807d27:ai-docs/delivery/harness/gap-uc004-fail-a3-nhp.md`

- L1 / L3 把 REQUEST 状态从 `draft:awaiting_pre_exec_dual` 改成 `post_pre_exec_dual_pass`，同一行仍写 **row stays gap**，并保留 Ban coding。这是 docs 状态，不是把 FAULT 标成 covered/closed。
- L18：§1.0.1 `UC-E2E-004` FAULT **gap**。L20：`NHP-004-FAULT-01` status **gap**。
- L44：`This records the dual. It does not close A3.`
- L53：FAULT column stays **gap**。L61 收束 `FAULT gap`。

`execution-master-checklist.md` L550 标题写 row stays gap。L552 的 `[x]` 只勾「docs status 已记录」，原文是 `This is not a close and not a fix`。L553 的缺口项是 `[ ]`：FAULT stays **gap**，UC-E2E-004 row stays **gap**。勾选没有把 A3 勾关。

`gap-bug-backlog.md` L249–L253：docs-nail `post_pre_exec_dual_pass`，FAULT stays **gap**，`This is not a close`，`NHP-004-FAULT-01` stays **gap**。

`gap-uc004-fail-a3-nhp.slice.md` L3 / L11 / L24 / L28 / L32：状态是 docs dual，FAULT / 行 / case id 都是 **gap**，收束字是 `gap`，不是 CLOSED。

没有把 A3 或 FAULT 写成 covered，也没有写成已关。

## 2. 没有改 UC-018 / UC-052 / UC-025 行 — 通过

`git diff 0807d27^ 0807d27` 对矩阵只在文末 +3。§1.0.1 / §1.1 的 `UC-E2E-018`（L123、L181）、`UC-E2E-025`（L125、L183）、`UC-E2E-050–052`（L132、L190）与父提交逐字节相同。

nail 里出现的 UC-018 / UC-052 / UC-025 都是否定句，不是改行：矩阵 L352、checklist L554、backlog L254、harness L53–L55、slice L28。意思是 Not UC-018、Not UC-052、Not UC-025，Do not flip UC-018，Do not flip UC-052。UC-018 保持 partial、UC-052 保持 partial、UC-025 行保持 gap，都不是本 commit 写上去的新状态。

本 nail 也没有改 `scripts/lib/uc-covered-evaluator.mjs`，没有动 UC-018 receipt JSON。

## 3. career-path EXIT 0 没有被当成 A3 已完成 — 通过

本审查没有跑 `pnpm uc004:career-path:prove`，也没有起 Postgres。nail 自己没有附带新的 EXIT 日志，没有把任何 EXIT 0 写成 A3 证据。

引用都是禁令，不是收口：

- harness L22（REQUEST 原文保留）：mark-red pin 的 EXIT 0 **is not a close**；`This REQUEST does not run it and does not add a command.`
- harness L55、slice L28、checklist L554、backlog L254、矩阵 L352：`Do not treat pnpm uc004:career-path:prove EXIT 0 as A3 closed.`
- checklist L556 / backlog L256：不预认 `eval-harness-matrix-cite:prove` 的 post-commit EXIT。`A green cite does not close A3.`

career-path 绿没有被用来关闭 A3。

## 4. 没有发明产品修复 — 通过

diff 五文件全在 `ai-docs/delivery/`。无 apps/、packages/、scripts/ 产品改动。harness L55 / slice L28 / 矩阵 L352：`Ban inventing a fix. Ban product coding.` checklist L552：`not a fix`。slice L7 仍是 L0 docs only。

dual 祖先抽查（`git merge-base --is-ancestor`，相对 `0807d27`）：mw-rag-route `68ba979874dfaa2669cee847b2aadb35691a3d50` 是祖先；本席 pre-exec `4107de2479906269864416815c4d4992159c3dfa` 是祖先；REQUEST `9a644bd360c5b78f66240d8524e6502ef178fa80` 是祖先。与 harness L46–L51、backlog L252 一致。不代签 rag-route。

## 5. 销钉

harness L57、slice L4 与 L30、矩阵 L352、checklist L555、backlog L255：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503。

无 HA。coveredCount 没有从 8 抬走。

## 6. 抽查（非阻塞）

- harness L6 / slice L6 仍写 base `58c0031`。那是 REQUEST 头，nail L59 声明除状态短语外上文照旧。`git rev-parse 0807d27^` 是 `cc8a405`。头上的 base 不是本 nail 的父，也不当 prove tip。引用按 `0807d27` 树核对。
- checklist L552 的 `[x]` 容易被误读成缺口已关。同条写明 not a close / not a fix，缺口在 L553 仍是 `[ ]`。不构成阻塞。
- 任务点名的 tip `3ee28d3` 之后，origin 又叠了 UC-018 flip-ban nail 与别的 review。那些不在 `0807d27` 的 diff 里。落笔时 `HEAD` 的矩阵 L115 仍是 gap / gap / gap / blind，C' 注仍在且仍写 Not a close。本 PASS 不审那些后继 commit。
- 没有新鲜重跑。任何既有 career-path EXIT 都不是本审查的新证据，也没有被 nail 拿去关 A3。

## 7. 条件

1. docs-only。本 PASS 不是编码授权，不是 covered，不是 HA。`GAP-UC004-FAIL-A3` / `NHP-004-FAULT-01` / UC-E2E-004 FAULT 保持 gap。`post_pre_exec_dual_pass` 只是 docs 状态，不是关缺口。
2. `pnpm uc004:career-path:prove` 的 EXIT 0 不是 A3 closed。不得把 career-path 绿洗成失败降级已接线。本 PASS 不授权跑它。
3. 不得编辑 UC-018、UC-052、UC-025 的矩阵行。不得 flip UC-018。UC-052 保持 partial。不得把本 nail 写成这三行的状态变更。
4. 不得发明产品修复。docs 不是产品故障路径。
5. 销钉保持：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503。
6. alone ≠ dual。本文件不是 `mw-rag-route` 的签名。

## 8. 阻塞

无阻塞。

Verdict: PASS

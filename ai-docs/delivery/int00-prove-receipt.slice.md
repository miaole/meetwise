# Slice — **INT00-A · INT-TRANSCRIPT-00 四条已接线 prove 单窗回执收尾刀**（docs-only REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（零 coding · 零 prove 执行 · 零 SSOT edit · 零 push · alone ≠ dual · 执行须 PRE 双审 BOTH PASS + meetwise AUTHORIZE）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · **PG-retained** · **公开 DELETE=503**（冻结 · GAP-PRIV-02 backlog `:58`）· g7SuiteGreen=false · actualSpendCny=null
**Date**: 2026-10-08（Asia/Shanghai · UTC+8）
**Base**: `origin/feat/mysql-schema-skeleton` · **`9265e4d8`** / `9265e4d8a58eaa064244eb3c5fd02c165e83d8fc`（REQUEST 前已 fetch · origin tip 与 base 恰等）
**Authority**: meetwise — L0 docs only · Ban coding · Ban prove · Ban push
**Wave**: Line INT00（INT-TRANSCRIPT-00 侦察立项 · A 项最强候选 · 协调方 2026-10-08）
**Worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-int00` · `line/int00-prove-receipt`

## One-line

四条 INT-TRANSCRIPT-00 prove 已接线在案（`package.json:353-360` · 隔离壳 `:raw` 注册 · `packages/db:51-53` + `apps/api:42` 存活亲证）但 SSOT **无当前 tip EXIT 入账**——本刀 docs-only 立卷其**单窗回执收尾**：`pnpm mem00-int00:prove-path:gate` 13/13 基线后四命令（`int-answer-dual-write-fence:prove` · `int-transcript-answer-fact-root:prove`（0092）· `int-transcript-remaining-sinks:prove`（0096）· `int-transcript-preview-submit:http:prove`（0129 · 远程 PG env 硬前置））单窗 attempt=1 全跑全录，回执 `class=local_untrusted` + 4 钉常量落 `ai-docs/delivery/receipts/`；沿 I103 §4c 全套 EXIT 契约（attempts 全录 · **Ban retry-to-green** · **blocked ≠ pass**：http 条 env 未注入记 blocked 且步 EXIT≠0 不写通过回执 · EXIT0 ≠ 控制面关 ≠ 01 解禁 ≠ canonical 宣称）。**形态二选一交双审（D1）**：拟案 (i) 纯 prove 执行刀（零 coding）；备选 (ii) additive 扩 `mem00-int00:prove-path` 编排步目（+4 步 · 既有 13 条 gate 断言零弱化 only-additive · 属 EXEC 面）。**不宣称控制面已关 · 不开 01（`:176` 零改）· 不动 503 · `:1214` 留 nail · Ban 借 #104 面**。

## Products

| Role | Path |
|------|------|
| Harness（REQUEST 本体） | `harness/int00-prove-receipt.md` |
| Dual `mw-privacy-int` | `reviews/REQUEST-2026-10-08-int00-rcpt-mw-privacy-int.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-08-int00-rcpt-mw-e2e-ha.md` |

## 接线亲证（浓缩 · 全文见 harness §1）

四条顶层 prove script（`package.json:353-360`）全部经 `run-e2e-isolated.mjs` 隔离壳；`:raw` 目标 `prove:int-answer-dual-write-fence` / `prove:int-transcript-answer-fact-root` / `prove:int-transcript-remaining-sinks`（`packages/db/package.json:51-53`）+ `prove:int-transcript-preview-submit-http`（`apps/api/package.json:42`）全部存活；对应迁移 0092/0096/0126/0129 在 `packages/db/migrations/` 亲证。http proof 头注原文钉：「use REMOTE Postgres via env. Never `pnpm db:up` / compose.dev」（`MEETWISE_PUBLIC_PREVIEW=1` · 0126 fence 前置 · releaseEvidence=false）。SSOT 现状：四条 prove **零当前 EXIT 入账**。#103 先例在卷：gate 13/13 + prove-path 10/10 EXIT=0 · 回执 4 钉（backlog `:783` · checklist `:1298` · `receipts/2026-10-07-i103-mem00-int00-prove-path-attempt1-receipt.json`）。

## prove 方案（浓缩 · named ≠ 授权 · 本 REQUEST 零执行）

- **§4a 单窗命令面**：`0)` `pnpm mem00-int00:prove-path:gate`（前置基线 · 须 13/13 EXIT=0 方可开跑）→ `1)` `pnpm int-answer-dual-write-fence:prove` → `2)` `pnpm int-transcript-answer-fact-root:prove` → `3)` `pnpm int-transcript-remaining-sinks:prove` → `4)` `pnpm int-transcript-preview-submit:http:prove`；attempt=1 · 顺序执行。
- **§4b 隔离壳**：全部走已接线 `run-e2e-isolated.mjs` 入口（临时独立 cluster · 只删自建 `meetwise-e2e-*` · 绝不触碰开发库）；Ban 绕壳直连 · Ban `pnpm db:up` · Ban compose.dev 捷径。
- **§4c EXIT 契约（沿 I103 `gap-i103-prove-path.md:85-93` 全套）**：attempts 全录（序号 · Asia/Shanghai(+08:00) · codeSha · EXIT · reason · 失败与成功同列）· 单次 attempt 窗 · **Ban retry-to-green**（backlog `:68` 先例）· **blocked ≠ pass**（http 条远程 PG env 未注入 → 记 `blocked` + 步 EXIT≠0 + **不写通过回执** · Docker 缺失 → `blocked:docker_daemon_missing` · blocked 使整窗 EXIT≠0）· 回执 `receipts/2026-10-08-int00-prove-receipt-attempt1.md`（`class=local_untrusted` · `releaseEvidence=false` · `controlPlaneClosed=false` · `intTranscript01ProductionWrite=false` · `publicDeleteStill503Required=true` · honesty 注记内嵌）· **EXIT0 ≠** 控制面关 ≠ 00 关闭 ≠ 01 解禁 ≠ DELETE 开放 ≠ `:60`/`:64` closed ≠ UC-052 covered ≠ canonical 宣称 ≠ HA ≠ `releaseEvidence=true` ≠ suite green ≠ coveredCount 变动。

## 形态二选一（D1 · 拟案 (i)）

| 形态 | 触碰面 | 代价 |
|------|--------|------|
| **(i) 纯 prove 执行刀（拟案）** | 零 coding · 唯一产物 = 回执文件 | 无；不动 #103 已证 10/10 基线 |
| (ii) additive 扩编排步目（+4 步） | `scripts/run-mem00-int00-prove-path.mjs` + `.proof.mjs`（EXEC 面 · 13 条 gate 断言零弱化 only-additive） | http 条 env 前置 → 全模式常态 EXIT≠0 · #103 全绿基线不再无前置复现 · EXEC 面扩大 |

## Bans（浓缩 · 全清单见 harness §7）

- **Ban coding** / prove execution / live · Ban `pnpm db:up` · Ban 绕隔离壳 · Ban secrets / `.env*`
- **Ban 01 任何推进**（blocked 不动 · checklist `:176` 原文零改）· **Ban DELETE 503 松动** · **Ban canonical 宣称**（checklist `:67`）
- **Ban SSOT 翻行**：backlog `:58`-`:64`/`:68`/`:100`-`:103`（行号漂移以行 ID 为准）/`:128` · checklist `:67`/`:173`-`:176`/`:1214` 原文零改（`:1214` 留 nail）· coveredCount 变动 Ban · matrix edit Ban · `:24`/`:45` 自行迁移 Ban · **`INT-P0-RAW-QUEUE` 洗白 Ban**
- **Ban 借 #104 面**（`fix/privacy-authorization-lease-takeover` 他刀）· **Ban blocked 写 pass**（http 条 env 未注入 → blocked + 步 EXIT≠0 + 不写通过回执）· Ban 历史回执当当前通过 · Ban retry-to-green · Ban 窗外重跑 · Ban gate ≠13/13 开窗 · Ban force-push · **Ban push** · Ban self-approve（alone ≠ dual）

## 双审裁决点

D1 形态二选一（拟 (i)）· D2 回执形态与落点（md committed + `.tmp` 机器回执引路径）· D3 http 条 env 前置口径（无 env → blocked · 是否许授权 env 注入跑由双审判）· D4 单窗语义（拟「全录不中断」：任一步败不阻断后续入账 · 整窗 EXIT≠0）。

## Named proves（clarity only · 本 REQUEST 零执行 · I2 先例：named ≠ 授权）

`pnpm mem00-int00:prove-path:gate`（基线）· `pnpm int-answer-dual-write-fence:prove` · `pnpm int-transcript-answer-fact-root:prove` · `pnpm int-transcript-remaining-sinks:prove` · `pnpm int-transcript-preview-submit:http:prove`（均属未来授权 EXEC）。本刀不新增脚本、不改 `package.json`、不跑任何 prove、不起容器、不连任何远程环境。

*Slice · INT00-A 四条已接线 prove 单窗回执收尾刀 · 2026-10-08 · `draft:awaiting_pre_exec_dual` · 零 coding · 零 prove 执行 · 不宣称控制面已关 · 不宣称 canonical · DELETE=503 冻结 · 01 blocked · alone ≠ dual · STOP（awaiting pre-exec dual）*

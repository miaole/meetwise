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

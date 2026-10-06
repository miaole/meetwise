# REQUEST — **GAP-MOP-03 `:76` successor（cutover / independent review 立卷）** · pre-exec · `mw-e2e-ha`

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（empty review stub · Ban self-approve · alone ≠ dual）
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-mop-03-successor.md` · `gap-mop-03-successor.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `71713718` / `717137180a4cccaa8575acb21c79ccf848973fc2`
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）· REQUEST 文件名日期 2026-10-06 按派单原文
**Peer stub**: `reviews/REQUEST-2026-10-06-gap-mop-03-successor-mw-model-op.md`（**不代签** · alone ≠ dual · 末行仍 PENDING）

## Pins（原值全抄 · retained 写死）

| Pin | 值 |
|-----|-----|
| haStatus | **NOT_HA** |
| releaseEvidence | **false** |
| claimProductionHA | **false** |
| gR45Closed | **true** |
| coveredCount | **8** |
| ms3EqualsR4Closed | **false** |
| Stack | **PG-retained** |
| public DELETE | **503** |
| PG LISTEN | **retained** |
| actualSpendCny | **null**（两本账分离沿 I 线 · 费率非承诺） |
| GAP-MOP-03 | **OPEN** · backlog `:76` · Ban flip CLOSED |
| coveredCount 扩面 | **无**（本刀零 matrix edit · covered 不动） |

## Scope（待审 · e2e/HA 视角）

docs-only REQUEST：backlog `:76` successor（「cutover 另 REQUEST」+「#102 域 cutover 仍须独立审」）docs 立卷。待审要点：Q4/Q5 同列门与 C-E2E-3 口径（`worker-wakeup:prove` PG 层 ≠ Q4/Q5 co-gate）· wakeup 语义沿 W5（prod PG LISTEN/NOTIFY provisional keep · Redis deferred / not STOPPED）· Line C 口径（one wiring call ≠ suite green ≠ G7 green）· EXIT 契约（attempts 全记录 · Ban retry-to-green · `:68` flake 先例）· pins 不动（coveredCount=8 · NOT_HA · releaseEvidence=false · DELETE=503）。

## Ban（待审确认）

Ban coding · Ban prove execution · Ban live · **Ban Redis cutover** · **Ban MODEL-OP closed claim** · Ban SLO forge / fake green / suite green claim · Ban 删 PG LISTEN · Ban `:76` flip CLOSED · Ban covered flip · Ban #102 借本刀合入 · Ban self-approve（alone ≠ dual）· Ban 四专家审降级（BUG-REV-COND）· Ban SSOT edit · Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · Ban push

本 stub 未跑 prove、未起容器、未改产品码 / migrations / scripts、未读 `.env*`；named proves ≠ coding/prove 授权（I2 先例）。执行须 PRE BOTH PASS + 协调方 AUTHORIZE。

*Stub · awaiting expert pre-exec dual · STOP*

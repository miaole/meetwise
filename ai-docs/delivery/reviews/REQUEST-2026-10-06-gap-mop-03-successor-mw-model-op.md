# REQUEST — **GAP-MOP-03 `:76` successor（cutover / independent review 立卷）** · pre-exec · `mw-model-op`

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（empty review stub · Ban self-approve · alone ≠ dual）
**Expert**: `mw-model-op`
**Knife**: `harness/gap-mop-03-successor.md` · `gap-mop-03-successor.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `71713718` / `717137180a4cccaa8575acb21c79ccf848973fc2`
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）· REQUEST 文件名日期 2026-10-06 按派单原文

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

## Scope（待审）

docs-only REQUEST：把 backlog `:76` 自留的「cutover 另 REQUEST」+「#102 域 cutover 仍须独立审」立卷为 successor 路径——钉未来 cutover REQUEST 准入合同（Q4/Q5 同列门 · wakeup prove + 强制周期 reconcile · `MEETWISE_WAKEUP_REDIS_STREAMS` flag 默认关→审后开 · PG LISTEN retained 直至授权 · 独立审 ≥ PRE/POST dual 且 BUG-REV-COND 四专家审不降级）· 离线 prove named-not-run（Q4/Q5 · 可选 worker-wakeup PG 层）· EXIT 契约预声明（attempts 全记录 · Ban retry-to-green）。

## Ban（待审确认）

Ban coding · Ban prove execution · Ban live · **Ban Redis cutover**（wakeup/queue/claim · flag 开启 · Redis prove 授权）· **Ban MODEL-OP closed claim** · Ban SLO forge / fake green · Ban 删 PG LISTEN · Ban `:76` flip CLOSED · Ban #102 借本刀合入 · Ban self-approve（alone ≠ dual）· Ban 四专家审降级 · Ban SSOT edit · Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · Ban push

## 裁决点（expert 裁量）

- D1：successor 范围是否按「wakeup + 双 reconciler 同列门」锚定（GAP-MOP-02 claim/lease 另行）。
- D2：独立审规格（dual + BUG-REV-COND 四专家审）是否如 REQUEST 所述不降级。
- D3：Redis 语义边界（本刀只立卷不切流 · prototype/选型文档只读 cite）。

本 stub 未跑 prove、未改产品码、未读 `.env*`；named proves ≠ coding/prove 授权（I2 先例）。执行须 PRE BOTH PASS + 协调方 AUTHORIZE。

*Stub · awaiting expert pre-exec dual · STOP*

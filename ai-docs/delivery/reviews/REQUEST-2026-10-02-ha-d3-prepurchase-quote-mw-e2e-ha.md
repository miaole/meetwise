# REQUEST — HA D3 购前报价笔记 · pre-exec · mw-e2e-ha

**Status**: pre-exec **PASS**（有条件）· 本线只派 `mw-e2e-ha` · 无第二审稿人 · 本 PASS 仍然 ≠ HA
**Expert**: `mw-e2e-ha`（单独；不代签任何 peer）
**REQUEST / tip**: `5cd6cbc5d5e6f79a901fde28769c4405370132b0`（`5cd6cbc`）
**Docs-only**: `git show --stat 5cd6cbc` 仅 3 个 markdown（slice / harness / 本 stub）。无购买、无云资源、无产品代码。该 SHA 即本批 tip，且在 `origin/feat/mysql-schema-skeleton` 上（其后 origin 又有别的提交，本 SHA 仍是祖先）。
**Knife**: `ai-docs/delivery/harness/ha-d3-prepurchase-quote.md` · `ai-docs/delivery/ha-d3-prepurchase-quote.slice.md`
**Date**: 2026-10-02（PT）
**本 PASS**: ≠ coding · ≠ covered · ≠ nail · ≠ next knife · ≠ 购买授权 · ≠ production HA · 报价不是可用性证据

## Pins（保留）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（保持） |

## 报价与禁购

未报价的价格被记成 **UNQUOTED**，这是允许的记录，不是 HA 证据。

- slice `:12`：只记容量、价格、选型；价格 UNQUOTED；¥0；`claimProductionHA=false`；第二审稿人未派。
- harness `:11`：这次开档没有拉厂商报价。价格格是 **UNQUOTED**。禁止凭记忆填人民币。本地 compose 限额不是云账单。
- 价格表 `:39–44`：RDS / ECS×2 / Redis / 流量与备份全是 **UNQUOTED**；本 REQUEST **¥0 spent**、购买次数 **0**。`:45` 禁止凭记忆填格；以后若贴公开价目，必须带日期 URL。在那之前保持 UNQUOTED。
- `claimProductionHA=false` 写在 harness `:1`、`:3`、`:8`、`:17`、`:63`、`:78` 和 slice `:8`、`:12`。阶 D 生产探针未开（`:8`）。`:17` 本笔记不开 D3、不宣称阶 D 绿、不设置 `claimProductionHA`。
- 禁购：slice `:1`、`:7`；harness `:10`「Do not buy cloud」；`:33` 不选 SKU、不创建；`:55` 本 REQUEST 什么都不买；`:64` 写成订单号的「报价」出范围。基础版单节点不是生产 HA（`:19`、`:51`、`:62`）。

报价（包括未报价的占位）不是可用性证据。NHP `:61` 没有出处的价格不是证据；`:65` 本地 512m/1g/512m 不是生产 SLO。没有把报价当成 HA，也没有授权买容量。不触发 FAIL。

## 条件

1. `haStatus` 保持 **NOT_HA**，`claimProductionHA` 保持 **false**，`releaseEvidence` 保持 **false**。任何价目、UNQUOTED 格、本地 compose 限额都不是 HA 证据。
2. 本 PASS 不授权下单、不开云、不花 ¥。填具体数字必须另有带日期的公开价目，且仍然不是购买、不是 HA。
3. 无第二审稿人是 REQUEST 自己定的（slice `:20`；harness `:73–74`）。单独 PASS 不等于双签，更不等于 HA。coveredCount 保持 **8**。

Verdict: PASS

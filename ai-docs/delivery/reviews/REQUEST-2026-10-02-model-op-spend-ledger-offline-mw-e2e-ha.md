# REQUEST — MODEL-OP spend-ledger offline · pre-exec · mw-e2e-ha

**Status**: pre-exec **PASS**（有条件）· `draft:awaiting_pre_exec_dual` · 不代签 `mw-model-op` · alone≠dual
**Expert**: `mw-e2e-ha`
**REQUEST**: `dfd8443cc9484d776d8fa23adb5c80ed0801b761`（`dfd8443`）
**Docs-only**: `git show --stat dfd8443` 仅 4 个 markdown。未改 model-client、guard、invoke、live e2e、G7 三件套。该 SHA 是 tip `5cd6cbc` 的祖先，且在 `origin/feat/mysql-schema-skeleton` 上。
**Knife**: `ai-docs/delivery/harness/model-op-spend-ledger-offline.md` · `ai-docs/delivery/model-op-spend-ledger-offline.slice.md`
**Date**: 2026-10-02（PT）
**本 PASS**: ≠ coding 授权 · ≠ covered · ≠ nail · ≠ next knife · alone≠dual · ≠ MODEL-OP 关闭 · **live/付费跑不算数**

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

## 范围只到离线账本

slice `:12`：在 Line C nail 之前，只有 harness、缺口笔记、离线 prove 计划。不改出站主链。没有 live model 调用。本开档 `actualSpendCny` 在代码里保持 null。

harness 把出站主链标成只引用、不改：

- `:17–19` `g7-freetier-reprove-guard.ts` 的 `actualSpendCny: null` 只引用。可写 NDJSON 不是已认证账本。
- `:19` `invoke.ts` 的 `priceRevision` 在 Line C 出站链上，**本刀不改**。
- `:20` 不重跑既有 live G7 三件套。
- `:30–40` 事后若授权，也是**新的**离线脚本，无网络、无 Key、无 live。禁止改 `g7-outbound-interceptor.ts`、`model-client.ts`、`invoke.ts`、`g7-bootstrap.ts`、`apps/api/src/main.ts`、`apps/worker/src/main.ts`。
- `:41` 缺账本路径 fail closed；超额 fixture 拒绝下一次**估算**调用；估算器不能写 `actualSpendCny`；没有控制台出处的伪造实付被拒绝。EXIT 0 ≠ MODEL-OP 关闭。
- `:10` 在 Line C nail 且另一次 dual 授权之前，连离线 prove 的 coding 也不开。只授权离线，不授权 live。

没有改出站调用路径，也没有让 live 跑计入。不触发 FAIL。

## 条件

1. 本 PASS 的范围是离线账本计划。live、付费、G7 三件套重跑都不算本刀证据。
2. 不得改 model-client、invoke、outbound interceptor、以及 guard（`g7-freetier-reprove-guard.ts` 只引用）。事后脚本必须是新的离线文件。
3. `actualSpendCny` 不能被估算器填上。伪造实付没有控制台出处 = 拒绝。EXIT 0 ≠ MODEL-OP 关闭 ≠ SLO。
4. coveredCount 保持 **8**。不代签 model-op。本 PASS 不授权现在写 prove 代码。

Verdict: PASS

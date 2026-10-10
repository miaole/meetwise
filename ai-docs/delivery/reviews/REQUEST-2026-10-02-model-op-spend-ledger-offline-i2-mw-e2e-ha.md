# REQUEST — MODEL-OP spend-ledger offline I2 · pre-exec · mw-e2e-ha

**Status**: pre-exec docs gate · `mw-e2e-ha` · alone≠dual · 不代签 `mw-model-op`
**Reviewed commit**: `8ea17f7835edc0543f17277f1c2fc951a6e52695`（short `8ea17f7`）
**Branch**: `origin/feat/mysql-schema-skeleton`（`8ea17f7` 在 origin 上，且是 tip 的祖先）
**Gate 观察 tip**: `542c0646d1635b0a3a28c5d821ad50bc6ea625a3`（写收据时；其后 tip 仍可能前移）
**Date**: 2026-10-02（PT）
**Knife**: `ai-docs/delivery/harness/model-op-spend-ledger-offline-i2.md` · `ai-docs/delivery/model-op-spend-ledger-offline-i2.slice.md`
**Prior Line I**: `c6acf59` on `dfd8443`。那一签只覆盖离线账本计划。本刀只增加具名离线命令，不把上一签扩成 coding 或 MODEL-OP 关闭。

## 提交是不是只改文档

`git show --stat 8ea17f7` 只有 `ai-docs/delivery/harness/model-op-spend-ledger-offline-i2.md`（+1/−1）：parent tip 从 `60cb927` 改成 `52815fb1b81b2401dc01b88d700101283d2f137b`。没有产品路径。开档父提交 `d3c7963` 也只新增 harness、slice 和两份空 stub。`8ea17f7..` 观察 tip 之间 harness/slice 相对 `8ea17f7` 无 diff。

slice 与本文件的开档 stub 在 `8ea17f7` 仍写 base `60cb927`；harness 写 `52815fb`。两个 hash 都是 tip 的祖先，都不是当前 tip。不把旧 base 当成已经跑过的证明。

## Pins（本评审保留；REQUEST 没有授权翻转）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503** |

REQUEST 正文写了 `NOT_HA`、`releaseEvidence=false`、`claimProductionHA=false`、`coveredCount=8`、public DELETE `503`、PG-retained、`actualSpendCny` 保持 null、no live。没有写 `gR45Closed` / `ms3EqualsR4Closed`，也没有改写它们。本 PASS 不使 G7 变绿，不改 covered。

## 具名命令（对照观察 tip 的 package.json 与脚本文件；本 gate 不执行）

| Command | 观察 tip |
|---|---|
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-guard` | **存在**。`packages/ai-runtime/package.json` → `tsx test/g7-freetier-reprove-guard.proof.ts`，文件在 tip。`8ea17f7` 上同样有该 script。 |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-client` | **存在**。同上，client proof 文件在 tip，且 `8ea17f7` 已有 script。 |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-paths` | **存在**。同上，paths proof 文件在 tip，且 `8ea17f7` 已有 script。 |
| `pnpm model-op-spend-ledger-offline-i2:prove` | **不存在**。root `package.json` 无此 script。`8ea17f7` 与观察 tip 都没有。 |

缺失脚本保持缺失。harness 写明 does not exist yet、this REQUEST does not add it、does not edit `package.json`、does not add a script，并写 Until then those are plan assertions, not evidence。slice 写 unproven plan items。没有把未写脚本预填成绿，也没有暗示它已经通过。本 PASS 不创建该脚本。该 script 落地之前，后来的 prove 不得宣称这条命令 EXIT 0。

三条已存在脚本只是被点名。REQUEST 写明本刀不跑它们。文件头自述 offline / mocked、no network、no live spend；本 gate 未执行，因此不把“脚本在”写成“已经 EXIT 0”。点名 ≠ 已通过 ≠ G7 关闭。

## 禁区

- 产品：禁止改 outbound interceptor、model-client、invoke、g7-bootstrap、`apps/api/src/main.ts`、`apps/worker/src/main.ts`。Ban Line C 出站主链。Ban 本 REQUEST 里的 ledger 产品改动。`8ea17f7` 不含这些路径。
- live / 付费：无 live、无网络、无 Key、无 paid、无 console spend。本 gate 不跑 prove，不起 docker。
- SSOT：禁止改 matrix、backlog、checklist。不翻转 model-op、G7、covered 记录。本提交没有这类编辑。

EXIT 0 ≠ MODEL-OP 关闭 ≠ G7 green ≠ 产品 coding。alone≠dual。不代签 `mw-model-op`。`e8c1892` 是另一路径上的 model-op 收据，不并入本签。

## 条件

1. 本 PASS 只覆盖 `8ea17f7` 的 docs-only 预执行门。不授权写产品，不授权补上 `model-op-spend-ledger-offline-i2:prove`，不授权现在跑任何 prove。
2. 三条已存在的 g7 reprove 脚本即使日后 EXIT 0，也不等于 I2 fixture 命令已存在，更不等于 MODEL-OP 关闭或 G7 变绿。
3. `pnpm model-op-spend-ledger-offline-i2:prove` 出现在 package.json 之前，任何收据不得写该命令 EXIT 0。缺脚本保持缺失（fail-closed，不预填绿）。
4. `actualSpendCny` 保持 null。估算器不得填实付。没有控制台出处的实付必须拒绝。`coveredCount` 保持 8。`gR45Closed` 保持 true。`ms3EqualsR4Closed` 保持 false。public DELETE 保持 503。PG-retained。
5. 不代签 `mw-model-op`。alone≠dual。live / 付费跑不算本刀证据。

## 阻断

无。未授权产品、live 或 SSOT，也未把缺失脚本当成已跑或已绿。

Verdict: PASS

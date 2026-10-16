# PRE-EXEC · mw-model-op · MODEL-OP spend-ledger offline I2

**Verdict**: **PASS**（docs-only · **不**授权下一刀编码 · **≠** MODEL-OP-00 closed · **≠** HA · **≠** dual）  
**Role**: `mw-model-op`  
**Date**: 2026-10-02 (~21:25 PT)  
**REQUEST tip**: `8ea17f7835edc0543f17277f1c2fc951a6e52695`  
**Git parent**: `d3c79634e5253a541b6ef5ffbb97b8ef7eafbb22`  
**Branch**: `feat/mysql-schema-skeleton`  
**Not the tip**: side commit `7baa8365b36b2c98e275aed21cd06da9bf012cef` 未当作本审 tip  
**Kind**: offline pre-exec · Key env unset · **未**跑 live · **未**加脚本  

**Pins**: `NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained**

**Coding authorized**: **no**

---

## 1. Docs-only

`git show --stat 8ea17f7` / diff vs `d3c7963`：只改 `ai-docs/delivery/harness/model-op-spend-ledger-offline-i2.md` 一行（base tip `60cb927` → `52815fb1b81b2401dc01b88d700101283d2f137b`）。**无**代码、migration、script、`package.json`。缺的 `pnpm model-op-spend-ledger-offline-i2:prove` **没有**在本 commit 里被加上（工作树无该文件、无该 script）。

本 tip 树上的 I2 文档（父 commit 引入，本审按 tip 阅读）：

| Path |
|------|
| `ai-docs/delivery/harness/model-op-spend-ledger-offline-i2.md` |
| `ai-docs/delivery/model-op-spend-ledger-offline-i2.slice.md` |
| `ai-docs/delivery/reviews/REQUEST-2026-10-02-model-op-spend-ledger-offline-i2-mw-model-op.md` |
| `ai-docs/delivery/reviews/REQUEST-2026-10-02-model-op-spend-ledger-offline-i2-mw-e2e-ha.md` |

**无** eval 文件。

## 2. Outbound / Line C

本 diff **未**碰 model-client、invoke、guard、interceptor、g7-bootstrap、api/worker main、embed/rerank/voice、g7-freetier guard。文档明文 Ban C outbound 与 Ban live。**未**改写 Line C prove SHA，**未**写 G7 green，**未**授权 C live。

## 3. Named proves（本审 @ `8ea17f7`）

| Command | Exists at SHA? | Doc claim | EXIT |
|---------|----------------|-----------|------|
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-guard` | yes（`packages/ai-runtime/package.json`） | existing · **not run by this REQUEST** | **0** |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-client` | yes | existing · mocked · not run by REQUEST | **0** |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-paths` | yes | existing · not run by REQUEST | **0** |
| `pnpm model-op-spend-ledger-offline-i2:prove` | **no**（无 package script、无文件） | **does not exist yet** · plan assertions, **not evidence** · 未声称 EXIT 0 | **not_run** |

## 4. 哪本账

点名的三条现成命令是 **G7 NDJSON 跑次封顶 / mocked client**（guard、client、paths），**不是** `usageCalibrationReconciler` / `model-invocation-reconcile` 的生产切换证明。未来 fixture 只是计划（缺路径 fail-closed、超 cap 拒绝、estimator 不能写 `actualSpendCny`、无控制台引用则拒绝 actual）。文档 **没有**把任一本账写成 production-cut、closed 或 HA。`actualSpendCny` 保持 **null**（null-until-console）。无伪造 spend。

## 5. Line C 诚实

本切片不改 Line C `offlineProvesAtCodeSha`。Harness 把系列 base 从 `60cb927` 改成 `52815fb`（两者都是 `8ea17f7` 的祖先；git 父提交仍是 `d3c7963`）。Slice 与两份 stub **仍写** base `60cb927`（祖先，非假 prove SHA）。非 blocker。

## Blockers

无。

## Non-claims / non-blockers

- **本 PASS 不授权下一刀编码**，也不授权实现 `model-op-spend-ledger-offline-i2:prove`。  
- 不关闭 MODEL-OP-00 · 不切账 · 不 HA · `releaseEvidence=false` · 三条 G7 EXIT 0 **≠** G7 green · **≠** dual（`mw-e2e-ha` stub 仍 PENDING）。  
- I2 正文未逐条重写 `gR45Closed` / `ms3EqualsR4Closed`；本审按既有 pin 重申，文档未与之矛盾。  
- 未来 fixture 的四条计划 **未证明**。

---

Verdict: PASS

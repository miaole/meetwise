# GODFN-1a — invoke 巨函数拆解 EXEC 刀（按已 nail 设计执行）

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 `16b40f0d` · 分支 `line/godfn-1a-invoke` · 蓝本 = **已 nail 设计** `ai-docs/delivery/harness/godfn-decompose.md` @37705a3e（§5.1 1a 清单+§7.3 条款+§2.2 env 澄清）——本 REQUEST 为执行授权薄壳，设计面零重议。

## 1. 范围（照设计 §5.1 1a 行）
拆解 apps/worker 或 packages/ai-runtime 的 invoke 巨函数（设计 §1/#1 行·组合根保留语义）·prove 面按 §5.1 1a 行：e2e trio 三键（e2e:isolated/e2e:ui:isolated/verify:e2e-performance）+设计列明的 invoke 触面 prove 键。

## 2. 硬约束
①纯机械拆解语义等价（函数提取/委托·零逻辑变更）；②§7.3：1a 与 1c 不同文件无冲突·但 1b×1d 同文件条款不适用本刀；③prove 矩阵全键跑绿（attempts 全账红→绿逐修非 retry-to-green）；④零 G7 面/零迁移/零 SSOT 触碰；⑤pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）；⑥作者 mw-core@meetwise.local；⑦实现不自批 alone≠dual；⑧est：prove 全本地+e2e trio live ≤25/run·链记账；⑨Key name-only。

## 3. 验收
拆解后 diff 面清单+prove 全键 EXIT=0 收据+attempts 台账+收据 `ai-docs/delivery/receipts/godfn-1a/`·push 后 STOP awaiting_post_prove_dual。

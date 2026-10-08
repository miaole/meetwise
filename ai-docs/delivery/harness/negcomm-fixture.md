# NEGCOMM-1 — neg-commerce consume 族夹具修复刀（红掩覆盖解锁）

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 `02d35a01` · 分支 `line/negcomm-fixture` · 立项依据 = G7TRIO nail（consume 族 7F 单一根因=begin UUID_RE 门 3f5bdc80 晚于 'r1' 夹具 3c87bfa7→全部 begin 死于 400 门·产品方向 fail-closed 更严·覆盖红掩）。

## 1. 修法（仅 neg-commerce.proof.ts 夹具·零产品码）
consume 族 7 用例 resumeId 'r1'→合法 UUID v4 夹具+种子 resume 行（含 privacy epoch·沿仓内 resume 种子先例）——使 begin 过 UUID 门后用例意图（402 额度/404 越权/并发超卖/幂等双击）真实行使；**补 400 invalid_resume_id 新门负断言**（字面量夹具形态·防回归）。
- 断言期望值核对：402×2/404/超卖×2/幂等×2 在合法 resumeId 下重推（原期望可能随门修正微调·逐条亲证在卷·禁为绿改断言——若意图面本身与产品行为冲突则如实登记）。

## 2. 验收
恰 1 run neg:commerce（或 neg:all 含该族）EXIT=0（7 用例转绿+新门断言在卷）·attempts 全账·收据 `ai-docs/delivery/receipts/negcomm-fixture/`·零产品码·pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）·实现不自批·alone≠dual·禁重跑至绿。

## 3. Non-claims
本刀 ≠ CMD3 收官（步 11-27 含 6 LEGACY/R5 步解锁后另评估）≠ 7A 面 ≠ trio。

# REQUEST — **CMOP03-E 弱输入 report_unavailable 预期面校准刀**（G7X nail 立项刀②·随刀① 后 · 两分支并陈 · 聚合门/报告链产品码五钉零 diff · sidecar 账本实测臂必须自带）· pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE stays 503 · `g7SuiteGreen=false` · `actualSpendCny=null`
**Expert**: `mw-model-op`
**Knife**: `harness/cmop03-weak-input-calib.md` · slice `cmop03-weak-input-calib.slice.md`
**上游**: G7X nail（残红③根因收敛 + 双刀立项 · 两席 post-dual 支持）→ 刀① CMOP03-FIX 已全链落地 @主线（EXEC 收据 `9a48f57c` · **账本不可达缺口如实记（未派 sidecar）= 本刀 sidecar 前向纪律动因**）→ **本 REQUEST（刀② docs-only · 两分支并陈不预设裁断）→ pre-exec dual（mw-e2e-ha + mw-model-op · 含产品语义视角判读意见）→ meetwise 授权（定裁断分支 P/D）→ EXEC（视裁决分支）→ post-prove dual → meetwise 授权 nail**
**Base tip**: `5a2994c4`（`origin/feat/mysql-schema-skeleton` · not a prove tip · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准 · EXEC 重钉须重新 fetch）
**Date**: 2026-10-08
**Line**: **CMOP03-E**（G7X nail 双刀立项之刀②）

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
| `g7SuiteGreen` | **false**（retained · Ban flip true） |
| `actualSpendCny` | **null**（retained） |
| Trio | **OPEN**（G7U 真测 **1/1/1** · G7X T-1 与刀① EXEC 预期红原值记账零冲销） |
| `GAP-G7K-API-REDS` | **P1 OPEN**（backlog `:107` 状态行不翻 · 任一落地 ≠ 关闭） |
| `GAP-CMOP03-POST7B` | **P1 OPEN**（鉴别刀域 · 本刀零触碰零归因） |
| P2 `GAP-G7W-QGEN-SCHEMA-VALIDATION` | **复验门零触碰**（`:109` 行域 · Ban 归因混淆） |
| 刀② P/D 裁断 | **未决**（本 REQUEST 两分支并陈 · 产品语义终裁归产品席/协调方） |

## 请审什么（mw-model-op · 聚合门机制面忠实性 / sidecar 账本实测臂完备性 / 报告链钟机制 / 预算与 Key 卫生 / 分界纪律）

Line CMOP03-E · **刀② 弱输入 report_unavailable 预期面校准**（docs REQUEST · G7X nail 立项刀②）。请审：

1. **聚合门机制面忠实性（本审首责）**：`reportGenerator` 闭包首行 `aggregateScores(s.scores)`（`interview-service.ts:283`）**invoke 前抛**、narrative 模型调用从不发生的码面亲读是否成立；`aggregateScores` 空集抛 `score_aggregate_empty`（`assessment.ts:20-26`）与三处独立码面注记（`:283`「不交给模型猜」/`assessment.ts:15-16`「空集合不是 0 分」/`main.ts:159`「绝不回退 legacy 分数」）互证是否如实；「报告链钟零模型消耗」判据（G7X T-1 live=7 全部来自题面/评分侧 · last_error ×3 直证）是否可从 sidecar 读数客观复核。
2. **分支 P/D 机制论据**：分支 P（弱输入定义性后果：评分权威仅 practice_eligible/b_review_eligible · legacy 结构性不参与 · `scoring-aggregation.ts:6-7`）与分支 D（若产品意图 practice 应出卡 → scoring 供给缺口 → product-fix 另刀）的机制描述是否忠实；「校准≠为缺陷写预期」辨析是否成立；**本 stub 判读须显式给出产品语义视角意见 + 声明判读≠终谳（终裁归产品席/协调方）**。
3. **sidecar 账本实测臂完备性（本审首责 · model-op 前向纪律）**：`ai_model_invocation` SELECT-only 实测逐 attempt 落卷是否硬闭合；刀① EXEC 账本不可达缺口（wrapper finally 拆容器 · 未派 sidecar · `docker ps -a` 零行）承卷为前向纪律动因是否如实；容器/账本读数窗保活机制交双审定值是否可执行；est ≤10/run · 总硬帽 ≤200（账本实测读数法 · est-not-counter · 超限即停如实记不洗 not_run）是否可机检；DB 凭据容器固定测试凭据（wrapper baseEnv 同面 · 非模型 Key）是否落字。
4. **报告链钟机制**：`MAX_REPORT_ATTEMPTS=3`（`report.ts:10`）· 失败退避 `2^attempts` 秒封顶 300（`report.ts:53`）· dispatcher tick 5000ms（`report-worker.ts:104`）→ ~10-12s 确定性钟 ×2 段（主面试+failLoop）与 G7X T-1 tick-26/31/36 等距实证同量级的判读是否成立；quarantine 必发 `report_unavailable` 终态事件（`report-worker.ts:61-67` · reason=`max_attempts_exceeded`）「防前端无限转圈」设计意图是否如实；钟读数三判（tick 序+`score_aggregate_empty` 计数+last_error 形状 · 不单赌 wall-clock）是否可执行。
5. **预期面冻结与如实预注册**：§3 表（含报告链钟 ×2 段登记为旅程预期构成）先于实跑冻结 · EXEC 不回改；**CMD1 预期 EXIT=1 红于 post-7b 窗（`:201-203` 已修承卷 + `GAP-CMOP03-POST7B` P1 OPEN 未鉴别 · 刀① EXEC 78798ms 先例）**是否如实；四判据（`:236-237` 零 diff 形状兑现 / 钟分段读数 / sidecar 实测 / post-7b 零冲销零触碰）与 prove 判据≠EXIT=0 是否硬闭合。
6. **预算与 Key 卫生**：`actualSpendCny=null`（无计价数据源 · Ban invented spend）；模型 Key 只经进程环境（loader source `~/.meetwise-secrets/` · name-only）· Ban 值/fingerprint 入 receipt/log/commit · Ban `.env*`（ABSENT 前后双测）；attempts 全台账七字段 Ban 删除覆盖 · 预期红非重跑触发（Ban retry-to-green）。
7. **分界纪律**：Ban 归因 schema_validation_failed（P2 `:109` 行域零触碰零混淆）；Ban 碰 post-7b 新面（鉴别刀域 · 分段埋点+sidecar 判别臂归鉴别刀 · 本刀零顺手定位）；Ban 碰聚合门/报告链产品码（五钉 `assessment.ts`=`ca63f4ce`/`interview-service.ts`=`3026d9dd`/`main.ts`=`e4878b61`/`report.ts`=`92c77919`/`report-worker.ts`=`06d87f73` EXEC 前后全等强制 · **Ban 任何「让 practice 出卡/放行空集/回退 legacy」方向产品码改动**——若裁 D 归 product-fix 另刀全链）；Ban 改共享 SSOT（`:107`/`GAP-CMOP03-POST7B`/trio/`g7SuiteGreen` 不翻 · 刀② 登记行指向更新归协调方 nail）；Ban secrets · Ban 顺手做鉴别刀/product-fix。
8. **边界（本 REQUEST turn）**：docs-only 一次 commit；Ban coding（含 e2e harness/driver 代码与注释）· Ban prove 执行 · Ban 实跑 · Ban live · Ban push/force-push · Ban 校准效果/裁断结果预claim · Ban self-approve。

Trio stays **OPEN**（1/1/1 retained · G7X T-1 与刀① EXEC 预期红零冲销）。`g7SuiteGreen=false`. `actualSpendCny=null`. `:107` P1 OPEN · `GAP-CMOP03-POST7B` P1 OPEN（不翻不关）。**P/D 裁断未决——本 stub 判读≠终谳（产品语义终裁归产品席/协调方）· Ban 把 report_unavailable 写成「必须 ready」· Ban retry-to-green · Ban masking · Ban 假绿叙事**。

本 stub 不授权 coding / prove 执行 / 实跑 / live / push；pre-exec dual PASS 后由 meetwise EXEC 授权（含 P/D 裁断定值 · 注释级与否 · sidecar 保活机制 · base 重钉）；implementer 不自批；本 PASS（如落）仅为 model-op 半签，mw-e2e-ha stub 不代签。

---

*REQUEST stub · CMOP03-E 弱输入 report_unavailable 预期面校准刀 · Line CMOP03-E · 2026-10-08 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · 禁 push · STOP*

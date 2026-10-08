# REQUEST — **CMOP03-E 弱输入 report_unavailable 预期面校准刀**（G7X nail 立项刀②·随刀① 后 · 两分支并陈 · `full.e2e.ts:236-237` 断言本体零 diff · ≠ post-7b 鉴别刀 ≠ P2 行域）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE stays 503 · `g7SuiteGreen=false` · `actualSpendCny=null`
**Expert**: `mw-e2e-ha`
**Knife**: `harness/cmop03-weak-input-calib.md` · slice `cmop03-weak-input-calib.slice.md`
**上游**: G7X nail（残红③根因收敛 + 双刀立项 · 两席 post-dual 支持）→ 刀① CMOP03-FIX 已全链落地 @主线（step 7/7a/7b 首执行全过 · `:236-237` 零改断言本体而 report_unavailable+quarantined 形状兑现 · post-7b 新面 `GAP-CMOP03-POST7B` P1 OPEN 另立鉴别刀）→ **本 REQUEST（刀② docs-only · 两分支并陈不预设裁断）→ pre-exec dual（mw-e2e-ha + mw-model-op · 含产品语义视角判读意见）→ meetwise 授权（定裁断分支 P/D）→ EXEC（视裁决分支）→ post-prove dual → meetwise 授权 nail**
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

## 请审什么（mw-e2e-ha · 断言本体零 diff 可机检性 / 分支论据 e2e 面忠实性 / 预期面冻结纪律 / attempt 台账 / withhold 边界）

Line CMOP03-E · **刀② 弱输入 report_unavailable 预期面校准**（docs REQUEST · G7X nail 立项刀②）。请审：

1. **「`:236-237` 断言本体零 diff」原则可机检性（本审首责）**：基线 blob `full.e2e.ts`=`1fededa5` @`5a2994c4` 亲算；断言语句（`failLoop.terminal === 'report_unavailable' && rep.status === 'quarantined'`）逐字符零 diff + `:216` 零 diff 是否可从 EXEC 前后 blob diff 客观判定；「EXEC coding 面默认零 diff · 注释级须双审+meetwise 显式授权且断言语句逐字符全等」是否硬闭合；**Ban 把 `:236-237` 改成「必须 ready」**是否落字（harness §2.0/§5.1）。
2. **两分支并陈的 e2e 面忠实性（本审首责）**：分支 P 四论据的 e2e 面引用是否亲读成立——practice 直创未绑岗（`:142`/`:220` body=`'{}'`）/ `:216` 分支自身容于非 ready 终态 / 终态五族（`interview.ts:7`）容 `report_unavailable` / `:236-237` 现状已容 + G7X T-1 与刀① EXEC 两代实测兑现；分支 D 路由（STOP → product-fix 另刀 · 本刀只交裁决记录）是否清晰；「校准≠为缺陷写预期」的伪绿面辨析（harness §1.2/§2.3）是否成立。
3. **预期面冻结纪律（本审首责）**：§3 表（修复面承卷 → 主面试钟段① → step 7 `:213-216` → 7a `:236-237` → 7b 终态族非空 → post-7b 预期红）是否先于实跑冻结且 EXEC 不回改；**CMD1 预期 EXIT=1 红于 post-7b 窗（如实预注册 · 红 retained · 判据≠EXIT=0 · 四判据 §4.3）**是否硬闭合；「post-7b 红面零冲销零触碰零归因（鉴别刀域）」是否落字。
4. **prove 契约与 attempt 台账**：CMD1 同体一次优先单 attempt；attempts 全台账七字段 Ban 删除覆盖；**预期红非重跑触发**（Ban retry-to-green · Ban 只留绿 attempt · Ban flake 记法冲销 · Ban 红面就地 reinterpret）；est ≤10/run · 总硬帽 ≤200（`ai_model_invocation` 账本实测读数法）；`actualSpendCny=null`；Key 只经进程环境（loader source `~/.meetwise-secrets/` · name-only）· Ban `.env*` · ABSENT 逐 attempt 记录。
5. **时序脆弱面显式化（F1-F3）**：deadline 宽容面（420s vs ×2 段串行钟）/ terminal-gated 读数不变量（quarantine sweep 与 report_unavailable 事件同一 sweeper 动作 · 无先读后迁竞态）/ 退避钟三判（tick 序+计数+last_error 形状 · 不单赌 wall-clock）是否亲读成立；显式化方案是否零码改（Ban 改 deadline · Ban 引入 sleep 补偿 · Ban 改状态轮询式断言）。
6. **边界完整性**：Ban 归因 schema_validation_failed（P2 行域）；Ban 碰 post-7b 新面（鉴别刀域零顺手定位）；Ban 碰聚合门/报告链产品码（五钉 `assessment.ts`=`ca63f4ce`/`interview-service.ts`=`3026d9dd`/`main.ts`=`e4878b61`/`report.ts`=`92c77919`/`report-worker.ts`=`06d87f73`）；Ban 改共享 SSOT（`:107`/`GAP-CMOP03-POST7B`/trio/`g7SuiteGreen` 不翻 · 刀② 登记行指向更新归协调方 nail）；sibling 归档零改写；withhold 契约零触碰。
7. **边界（本 REQUEST turn）**：docs-only 一次 commit；Ban coding（含 e2e harness/driver 代码与注释）· Ban prove 执行 · Ban 实跑 · Ban live · Ban push/force-push · Ban 校准效果/裁断结果预claim · Ban self-approve。

Trio stays **OPEN**（1/1/1 retained · G7X T-1 与刀① EXEC 预期红零冲销）。`g7SuiteGreen=false`. `actualSpendCny=null`. `:107` P1 OPEN · `GAP-CMOP03-POST7B` P1 OPEN（不翻不关）。**P/D 裁断未决——本 stub 判读≠终谳（产品语义终裁归产品席/协调方）· Ban 把 report_unavailable 写成「必须 ready」· Ban retry-to-green · Ban masking · Ban 假绿叙事**。

本 stub 不授权 coding / prove 执行 / 实跑 / live / push；pre-exec dual PASS 后由 meetwise EXEC 授权（含 P/D 裁断定值 · 注释级与否 · sidecar 保活机制 · base 重钉）；implementer 不自批；本 PASS（如落）仅为 e2e-ha 半签，mw-model-op stub 不代签。

---

*REQUEST stub · CMOP03-E 弱输入 report_unavailable 预期面校准刀 · Line CMOP03-E · 2026-10-08 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · 禁 push · STOP*

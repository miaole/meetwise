# REQUEST — **CMOP03-FIX driver 断言修复刀**（G7X nail 立项刀①·P1 优先 · `full.e2e.ts:201-203` 断言澄清感知 · provenance 反伪造零弱化 · ≠ 刀② ≠ 关 `:107`）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `actualSpendCny=null`
**Expert**: `mw-e2e-ha`
**Knife**: `harness/cmop03-driver-assertion-fix.md` · slice `cmop03-driver-assertion-fix.slice.md`
**上游**: G7W 甄别刀（尾段死亡定位）→ G7X 根因调查刀 EXEC 收据 `c477df54`（T-1 EXIT=1 class=api 40363ms · 末段抛点与 `full.e2e.ts:201-203` 恒 False 一致 identities=5 vs questions=3）→ G7X nail `50557225`（C-MO-P3 同面定谳 + 双刀立项 · 两席 post-dual 支持）→ **本 REQUEST（docs-only）→ pre-exec dual（mw-e2e-ha + mw-model-op）→ meetwise 授权 → coding+prove 一次优先 → post-prove dual → meetwise 授权 nail**
**Base tip**: `50557225`（`origin/feat/mysql-schema-skeleton` · not a prove tip · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准 · EXEC 重钉须重新 fetch）
**Date**: 2026-10-08
**Line**: **CMOP03-FIX**

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
| Public DELETE | **503**（stays） |
| `g7SuiteGreen` | **false**（retained · Ban flip true） |
| `actualSpendCny` | **null**（retained） |
| Trio | **OPEN**（G7U 真测 **1/1/1** · G7X T-1 预期红原值记账零冲销） |
| GAP-G7K-API-REDS | **P1 OPEN**（backlog `:107` 状态行不翻 · 本刀落地 ≠ 关闭） |
| 刀② | **OPEN**（弱输入 report_unavailable 产品语义裁归产品席 · 随①后 · 本刀零触碰） |
| C-MO-P3 | **修复路由已裁=刀①（协调方已行使）· 落地待本刀全链 · 登记行指向更新归协调方 nail** |

## 请审什么（mw-e2e-ha · 断言语义保真 / 反伪造零弱化机检 / 预期面冻结纪律 / attempt 台账 / withhold 边界）

Line CMOP03-FIX · **driver 断言修复刀**（e2e harness/driver 代码修复 · 非产品码 · G7X nail 立项刀①）。请审：

1. **「恒 False 由构造」算术证明忠实性（本审首责）**：`interview.ts:209-210` identities 双 kind 计数 vs `:308-309` questions 仅 question_ready 的码面亲读是否成立（blob `c8e63f41`/`7d65d0f3` @`50557225` 亲算）；c≥1 → `identities(q+c) === questions(q)` 恒 False 的证明是否闭合；G7X T-1 实测 5≠3 承卷是否如实；「断言语义缺陷非产品缺陷非 flake」与 C-MO-P3 登记原文（「澄清重发 identity 计数 vs 零澄清假设」）是否一致。
2. **修法方案对比合法性（本审首责）**：方案 a（`identities.length === questions + clarifications` · 显式 clarifications 计数器 · a′ `=== turns` 零 helper 变体）与方案 b（question_ready 子集过滤比对 · 须 provenance review 形状加签发 kind 元数据）的机制描述是否亲读成立；b 的「clarification kind 多签发漏检=检测面收窄」判读是否成立；「推荐 a 交双审 · EXEC 定值一次成型 Ban 二改」是否硬闭合；diff 落点（恰两文件 `interview.ts`+`full.e2e.ts` harness 面）是否可机检。
3. **反伪造零弱化（本审首责）**：`rejectForgedProgressScores`（`sse.ts:53-57`/`:90` + `interview.ts:199`）、identity 签发纪律（`interview.ts:77`/`:90-97`）、progress 携 questionId 拒绝（`:206`）、B 端分信任段（`trustedBSideScore === null && forgedScores === 'none'`）是否全部零触碰；NEG 面契约（伪造 progress 分数/伪造 identity/伪造 B 端分仍须红）是否保留；机检钉四 blob（`sse.ts`=`9bba015d`/`assert.ts`=`975fbb38`/`run-e2e-isolated.mjs`=`13dbfc43`/`model-operation-registry.ts`=`63af556f`）EXEC 前后全等强制是否充分；Ban try/catch 吞错（`assert.ts` 自述纪律）是否落字。
4. **「Ban 为绿改断言」约束（本审首责）**：C-MO-P3 原有约束是否显式入卷（harness §1.2）；「任何改动须共有硬约束+算术证明+预期面先冻，缺任一=为绿改断言=本刀 FAIL」是否可执行；修复面判据「越过 `:201-203`」是否可从 machine receipt/E2E_FAILURE_CLASS/EXIT 三源客观判定。
5. **新预期面冻结纪律**：§3 预期面表（step 7 report_unavailable/quarantined ≠ ready → 7a `:236-237` → 7b 终态族非空 → step 8 RLS → step 9 `:292` application face）是否先于实跑冻结且 EXEC 不回改；「不预设全绿——step 7 后任何红=新面新登记（原值记账+升级协调方）」是否硬闭合；`:216`/`:236-237` 零触碰与刀② 分界是否清晰。
6. **prove 契约与 attempt 台账**：CMD1 同体 `pnpm run e2e:isolated` 一次优先单 attempt；attempts 全账 Ban 删除覆盖；**任何红非重跑触发**（Ban retry-to-green · Ban 只留绿 attempt · Ban flake 记法冲销）；est 硬帽 ≤200 账本实测读数法（G7X 同体 live=7/run 承卷）；`actualSpendCny=null`；Key 只经进程环境（loader source `~/.meetwise-secrets/` · name-only）· Ban `.env*` · ABSENT 逐 attempt 记录。
7. **边界完整性**：Ban 把 report_unavailable 写成「必须 ready」（刀② 产品语义裁归产品席）；Ban 碰 G7V-FIX 线（`apps/web/lib/*`）与 settlement/early-stop 产品码；Ban 顺手做刀②；Ban 改共享 SSOT（`:107` P1 OPEN 不翻 · trio 不翻 · `g7SuiteGreen=false` 不翻 · C-MO-P3 登记行指向更新归协调方 nail）；sibling 归档零改写；withhold 契约零触碰（断言原文/case 名 stderr 回读裁定权归 meetwise · 本刀prove 不以 stderr 回读为判据）。
8. **边界（本 REQUEST turn）**：docs-only 一次 commit；Ban coding（含 e2e harness/driver 代码）· Ban prove 执行 · Ban 实跑 · Ban live · Ban push/force-push · Ban 修复效果预claim · Ban self-approve。

Trio stays **OPEN**（G7U 真测 1/1/1 · G7X T-1 预期红原值记账）。`g7SuiteGreen=false`. `actualSpendCny=null`. GAP-G7K-API-REDS P1 OPEN（不翻不关 · 本刀落地 ≠ 关闭）。刀② OPEN（产品语义裁归产品席）。**Ban 为绿改断言 · Ban 弱化 provenance 校验 · Ban retry-to-green · Ban masking · Ban 假绿叙事**。

本 stub 不授权 coding / prove 执行 / 实跑 / live / push；pre-exec dual PASS 后由 meetwise EXEC 授权（含断言形态 a/a′ 定值与 base 重钉）；implementer 不自批；本 PASS（如落）仅为 e2e-ha 半签，mw-model-op stub 不代签。

---

*REQUEST stub · CMOP03-FIX driver 断言修复刀 · Line CMOP03-FIX · 2026-10-08 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · 禁 push · STOP*

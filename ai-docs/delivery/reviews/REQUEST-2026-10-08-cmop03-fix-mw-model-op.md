# REQUEST — **CMOP03-FIX driver 断言修复刀**（G7X nail 立项刀①·P1 优先 · `full.e2e.ts:201-203` 断言澄清感知 · provenance 反伪造零弱化 · ≠ 刀② ≠ 关 `:107`）· pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `actualSpendCny=null`
**Expert**: `mw-model-op`
**Knife**: `harness/cmop03-driver-assertion-fix.md` · slice `cmop03-driver-assertion-fix.slice.md`
**上游**: G7W 甄别刀（尾段死亡定位）→ G7X 根因调查刀 EXEC 收据 `c477df54`（T-1 EXIT=1 class=api 40363ms · `ai_report` 舱壁 score_aggregate_empty ×3 烧尽时钟 + 末段抛点与 `full.e2e.ts:201-203` 恒 False 一致 identities=5 vs questions=3 · N1b 表名纠偏在卷）→ G7X nail `50557225`（C-MO-P3 同面定谳 + 双刀立项 · 两席 post-dual 支持）→ **本 REQUEST（docs-only）→ pre-exec dual（mw-e2e-ha + mw-model-op）→ meetwise 授权 → coding+prove 一次优先 → post-prove dual → meetwise 授权 nail**
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

## 请审什么（mw-model-op · 算术证明忠实性 / identity 签发纪律面 / NEG 面保留 / 刀② 分界 / 预算与 Key 卫生）

Line CMOP03-FIX · **driver 断言修复刀**（e2e harness/driver 代码修复 · 非产品码 · G7X nail 立项刀①）。请审：

1. **「恒 False 由构造」算术证明忠实性（本审首责）**：identities=q+c vs questions=q 的码面算术（`interview.ts:209-210` 双 kind 均计 / `:308-309` 仅 question_ready）与 G7X T-1 事件面实测（3+2=5 vs 3）承卷是否如实；断言第三段编码「零澄清假设」而自述语义为出处审查的语义错位定性是否成立；「修复=语义纠非避红」与「Ban 为绿改断言」约束的边界是否可执行。
2. **identity 签发纪律面（本审首责）**：方案 a「澄清轮的 ask 也是 provenance 事实」与 identity 签发纪律（`interview.ts:77` 文档锚「E2E uses the identity issued on question_ready / clarification_needed」/ `:90-97` `questionIdentityFromEvent` 双 kind 合法签发源 · progress 非 identity 源 `:92` · 非法 kind 拒绝 `:93`）是否一致；方案 a 全量对称计数（签发全集 vs 应答全集）与 `:339-361` 驱动逐轮应答澄清的事实是否吻合；a′ 变体 `identities.length === turns` 的构造性等式（turn++ 恰在 `:330`/`:361` · stale-replay 提交不 increment）是否成立及其耦合风险判读是否如实。
3. **NEG 面保留（本审首责）**：两案共有硬约束下伪造仍须红是否逐项落实——伪造 progress 分数（`rejectForgedProgressScores` `sse.ts:53-57` 经 `:90`+`interview.ts:199` 双调用点）、progress 携 questionId（`:206`）、identity regex/stateVersion 伪造（`:83-85`）、非法 kind（`:93`）、B 端分信任段（`trustedBSideScore === null && forgedScores === 'none'` 零改动保留）；方案 b 检测面收窄（clarification kind 多签发漏检）判读是否成立——b 不推荐结论是否站得住。
4. **刀② 分界（本审首责）**：`:216`/`:236-237` 零触碰与「Ban 把 report_unavailable 写成必须 ready」是否硬闭合；G7X T-1 报告链事实（`ai_report` 舱壁 `score_aggregate_empty` ×3 烧尽 → report_unavailable+quarantined · 时钟非抛点范围限定）承卷是否如实且本刀零归因零裁定；「practice/未绑岗零可计分 ScoreCard 是设计内常态还是 scoring 缺陷」= 刀② 产品语义裁归产品席是否不被本刀预设；7a 预期（terminal=report_unavailable+quarantined）引用 T-1 同构路径的合法性（含 `E2E_REPORT_FAIL_ALL` 注入面 erratum ② 口径）。
5. **prove 契约忠实性**：CMD1 同体一次优先单 attempt；期望=越过 `:201-203`（三源交叉：EXIT/E2E_FAILURE_CLASS/machine receipt）；「step 7 后任何红=新面新登记（原值记账+升级协调方）· Ban retry-to-green」是否硬闭合；attempts 全账 Ban 删除覆盖；est 硬帽 ≤200 沿账本实测读数法（`ai_model_invocation` DB 账本 · G7X 同体 live=7/run 承卷 · 修复后延展 est ≤30/run 量级声明）；`actualSpendCny=null`（无计价数据源 · Ban invented spend）。
6. **预算与 Key 卫生（与 mw-e2e-ha 共审）**：模型 Key 只经进程环境（loader source `~/.meetwise-secrets/` · name-only 入卷）· Ban 值/fingerprint 入 receipt/log/commit · Ban `.env*`（ABSENT 逐 attempt 记录）· DB 账本直读用容器固定测试凭据（SELECT-only · 非模型 Key）；超限即停如实记中止。
7. **边界完整性**：Ban 弱化/删除 provenance 校验；Ban 碰 G7V-FIX 线（`apps/web/lib/*`）与 settlement/early-stop 产品码；Ban 顺手做刀②；Ban 改共享 SSOT（`:107` P1 OPEN 不翻 · trio 不翻 · `g7SuiteGreen=false` 不翻 · C-MO-P3 登记行指向更新归协调方 nail）；sibling 归档零改写；withhold 契约零触碰；P2 `GAP-G7W-QGEN-SCHEMA-VALIDATION` 复验门零触碰（prove 读数若现 schema_validation_failed 形状=只记不判）。
8. **边界（本 REQUEST turn）**：docs-only 一次 commit；Ban coding（含 e2e harness/driver 代码）· Ban prove 执行 · Ban 实跑 · Ban live · Ban push/force-push · Ban 修复效果预claim · Ban self-approve。

Trio stays **OPEN**（G7U 真测 1/1/1 · G7X T-1 预期红原值记账）。`g7SuiteGreen=false`. `actualSpendCny=null`. GAP-G7K-API-REDS P1 OPEN（不翻不关 · 本刀落地 ≠ 关闭）。刀② OPEN（产品语义裁归产品席 · 本刀零预设）。**Ban 为绿改断言 · Ban 弱化 provenance 校验 · NEG 面伪造仍须红 · Ban retry-to-green · Ban masking · Ban 假绿叙事**。

本 stub 不授权 coding / prove 执行 / 实跑 / live / push；pre-exec dual PASS 后由 meetwise EXEC 授权（含断言形态 a/a′ 定值与 base 重钉）；implementer 不自批；本 PASS（如落）仅为 model-op 半签，mw-e2e-ha stub 不代签。

---

*REQUEST stub · CMOP03-FIX driver 断言修复刀 · Line CMOP03-FIX · 2026-10-08 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · 禁 push · STOP*

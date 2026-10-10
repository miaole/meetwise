# REQUEST — **G7W-G golden 冷启残红 ×1 全 suite 上下文复现臂**（H-G3 假说族判别器：主臂全量 ×N=3 + 对照臂过滤 ×1 一次成型 · ≠ 修复 ≠ 翻绿 ≠ 残红定谳）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `actualSpendCny=null`
**Expert**: `mw-e2e-ha`
**Knife**: `harness/g7w-golden-residual-arm.md` · slice `g7w-golden-residual-arm.slice.md`
**上游**: G7W EXEC 实验一 6 run/12 golden 执行全绿（过滤单跑 · 含冷栈+冷 build · 分段 3.0–4.4s ≪ 20s · 收据 `7db84c18`）→ G7W POST dual BOTH PASS（mw-e2e-ha `33ad1181` + mw-model-op `4eae75c9`）→ coordinator G7W nail（checklist `:1348-1358` @主线 `eef469d9` · 实验一归因 suspended · 残留「G7U 两轮环境特异」挂起——Ban 定谳「永不复现」· 是否立行/是否全 suite 上下文复现臂归协调方）→ 协调方现裁决立 G7W-G 复现臂刀
**Base tip**: `eef469d9`（`origin/feat/mysql-schema-skeleton` fetch 后实测 tip · not a prove tip · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准）
**Date**: 2026-10-07
**Line**: **G7W-G**

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
| `g7SuiteGreen` | **false**（retained · 至三绿 + post-dual + meetwise nail · Ban flip true） |
| `actualSpendCny` | **null**（retained） |
| 残红② golden 冷启归因 | **suspended/OPEN**（本刀指名面 · 行状态翻转归协调方 nail · Ban 本刀关行） |
| Trio | **OPEN**（G7U 真测 **1/1/1** · G7W 6 甄别绿 + CMD1 预期红原值零冲销） |
| GAP-G7K-API-REDS | **P1 OPEN**（backlog `:107` 状态行不翻） |
| 残红①/残红③/P2 复验门/旧红③ | **OPEN · 非本刀**（零触碰） |

## 请审什么（mw-e2e-ha · e2e 纪律 / 预注册与对照臂合法性 / 上下文口径诚实性 / 并行度读数非操纵）

Line G7W-G · **golden 冷启残红 ×1 全 suite 上下文复现臂**（鉴别刀 · G7W nail suspended 登记的协调方裁决后继 · 只读自然对照 · Ban 修复）。请审：

1. **预注册纪律（本审首责）**：假设族 H-G3a/H-G3b/H-G3c 是否每假设带预测+反例分支且不预设结论；**N=3+1 一次成型**是否硬闭合——执行序固定 S1→S2→S3→C1、无升压臂（G7W 升压臂 B 先例不承卷 · 任何追加 run=违纪）、Ban 事后加跑/择优/retry-to-green、红 EXIT 原值记账不冲销 G7U 真测 1/1/1 与 G7W 6 甄别绿+1 预期红台账。
2. **判别判据双向契约（本审首责）**：主臂红 ≥1 → H-G3a/c 候选成立**登记非定谳**（「与 X 一致」≠「X 已证」· a/c 分流只靠分段形状读数登记）；主臂全绿 → suspended 持续**不闭行不定谳**（Ban 定谳「永不复现」· Ban 触发追加 run）；对照臂红（预期绿实红）→ H-G3b 升权**表外值域回协调方 Ban 就地 reinterpret**——三向均非「判别失败」的双向契约是否闭合。
3. **上下文口径诚实性（本审首责）**：混杂变量定性是否如实——残红② 2 红 1 绿三样本全部全量上下文（G7U CMD2 + post-dual 双 re-run）vs G7W 6 绿全部过滤单跑；主臂=无 `E2E_UI_GREP` 全量（wiring `package.json:279`）· 对照臂=`E2E_UI_GREP='golden path'` 过滤（契约内透传 `run-e2e-ui.mjs:193`）是否与在案机制一致；**上下文并行度=如实记录非操纵旋钮**——Ban 调 `workers`/`fullyParallel`/projects/`retries`/超时/`E2E_UI_PROJECT`（config blob `321b80e0` `:12/:13/:17/:19/:27-31` 零 diff 机检）。
4. **观测合法性**：trace `retain-on-failure` 既有配置零改动（`:24`）+ 分段时间轴（`t_navigate(/resume)`/`t_consent`/`t_textarea` · 基线 3.0–4.4s vs 20s 超时窗锚 `golden.spec.ts:10` blob `8db8746b`）+ 栈起日志 name-only 摘录入收据（原文留 `.tmp/` 不入 git）；**Ban 破坏性注入**——Ban 降宿主资源/杀进程/清 BUILD_ID 复现（H-G3 族契约内不可证伪性承卷 · 本刀只做自然上下文对照）；判读表外值域→回协调方分支是否闭合。
5. **四 blob 机检与边界完整性**：`golden.spec.ts` `8db8746b`/`playwright.config.ts` `321b80e0`/`run-e2e-ui.mjs` `aa86fb3f`/`package.json` `0afb3bd2` EXEC 前后全等机检；残红①（旅程自适应早停 ×2 · 产品正确性已定谳）/残红③（`GAP-G7W-API-TAIL-DEATH` 刀①/刀②域）/`GAP-G7W-QGEN-SCHEMA-VALIDATION` P2 复验门/旧红③ `full.e2e.ts:203`（C-MO-P3）零触碰；sibling 归档零改写；SSOT/backlog 状态翻转 Ban（`:107` 不翻 · 残红② suspended 行翻转归协调方 nail · 登记留 nail 阶段）。
6. **预算与 Key 卫生**：est ≤35 ≪ 200（主臂 ≤30 + 对照 ≤5 · est-not-counter · EXEC 期按 spec 清单与 skip 门实数重估）；超限即停如实记中止（不洗 not_run）；`actualSpendCny=null`；模型 Key 只经进程环境（loader source · name-only）· Ban `.env*` · Ban Key 值/fingerprint 入 receipt/log/commit · `.env*` ABSENT presence 逐 run 记录。
7. **七字段与四来源交叉一致**：CMD 原文/EXIT 原值/时间戳/实跑 code SHA/worktree+branch/环境探针（含并行度实测值与 suite tally）/判读归类逐 run 全记录；`EXIT`/`E2E_FAILURE_CLASS`/machine receipt/Playwright tally 四来源交叉一致才可引用；全部 attempt 全记录 Ban 删除覆盖。
8. **边界（本 REQUEST turn）**：docs-only 一次 commit；Ban coding · Ban prove 执行 · Ban 实跑 · Ban live · Ban 判别结论预claim · Ban self-approve。

残红② stays **suspended/OPEN**（行翻转归协调方 nail）。trio stays **OPEN**（真测 1/1/1 如实）。`g7SuiteGreen=false`. `actualSpendCny=null`. **N=3+1 一次成型 · Ban 两向定谳 · Ban retry-to-green · Ban masking · Ban 假绿叙事**。

本 stub 不授权 coding / prove 执行 / 复现臂实跑 / live / push；pre-exec dual PASS 后由 meetwise EXEC 授权（committed SHA 重钉 · N=3+1 定值确认）；implementer 不自批；本 PASS（如落）仅为 e2e-ha 半签，mw-model-op stub 不代签。

---

*REQUEST stub · G7W-G golden 残红全 suite 上下文复现臂 · Line G7W-G · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · STOP*

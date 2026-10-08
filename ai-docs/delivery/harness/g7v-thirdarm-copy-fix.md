# Harness — G7V-FIX · **第三臂文案/结算相悖产品修复刀**（Line G7V-FIX · docs REQUEST · **`rev2:awaiting_pre_exec_re-review`** · G7V EXEC 升级面的指名后继 · 唯一触碰面=文案分派两文件 · ≠ nail ≠ trio 翻绿 ≠ backlog 登记）

**Status**: **`rev2:awaiting_pre_exec_re-review`**（rev1 预执行双审 **FAIL**——mw-model-op FAIL a/c/f 三处方 + mw-e2e-ha FAIL c/f 两处方（b 判锚对齐合法）· 两席处方收敛 · 本 rev2 按协调方合并处方修订 · 仍 docs-only · STOP 等协调方派重审 · docs REQUEST only · Ban coding · Ban prove 执行 · Ban 实跑 · Ban live（本 turn 零调用零 Key 加载零 DB 连接）· Ban push 前授权缺省 · Ban fake green · Ban `g7SuiteGreen=true` · Ban 洗绿 / Ban retry-to-green / Ban 重跑追臂 · Ban 碰结算语义 / Ban 碰早停判据 / Ban 碰 spec / Ban 碰 backlog · Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT）
**Date**: 2026-10-07
**Line**: **G7V-FIX**（G7V EXEC 升级交接 #1 的指名后继：G7V EXEC SUMMARY「第三臂产品面：`no_eligible_scored_answer` UI 文案『额度已释放』与已扣费结算相悖（码面+运行时双证）——文案/结算一致性修复须另派」→ 协调方派刀 G7V-FIX · knife id=**GAP-G7V-THIRDARM-COPY-SETTLEMENT**（缺陷行由 G7V nail 并行登记 P1 OPEN · 本 REQUEST 仅引用缺陷号 · 零 backlog 操作零 SSOT 改写））
**授权链**: G7V REQUEST `14f507e9` → G7V pre-exec dual BOTH PASS（mw-e2e-ha `05da6668` C-HA-V1~V7 + mw-model-op `f4b481ad` C-MO-V1~V7）→ G7V EXEC（甄别三读数随卷 · 分支 A 定谳 · spec 校准 `92f70db7` +52/−5 恰 spec · 第三臂运行时复现 1/2 · 收据 `ai-docs/delivery/receipts/gap-adaptive-early-stop/`）→ 协调方（本刀 REQUEST 指令）→ **本 REQUEST rev1（`c12702dc` · docs-only）→ 预执行双审 FAIL（mw-model-op a/c/f + mw-e2e-ha c/f · b 项判锚对齐合法 · 两席处方收敛）→ rev2 修订（本 commit · 按合并处方）→ 重审（协调方派席）BOTH PASS → meetwise 授权 → coding+prove 一次优先（rebase 硬门 §3.0 先行）→ post-prove 双审 → meetwise 授权 nail**。双审 PASS ≠ 本 stub 自批 ≠ nail ≠ trio 翻绿。
**输入事实（只读在案引用）**: G7V EXEC `01-readings.md` §2——mobile `iv_8d0ee32e`（8 events）seq7 `session_concluded conclude=early_weak@turn4` → seq8 `assessment_unavailable reason=no_eligible_scored_answer`，**臂=第三臂**（unscored=0 ∧ eligible=0 → `completeInterviewAndConfirm` **已扣费不释放** + `markApplicationNoEligibleScore`），UI 经同一 SSE 通道同现 view-model.ts:68「本次预留额度已释放」文案——**已扣费却宣示已释放 = 文案与结算相悖运行时复现**；chromium `iv_8d3e2138` 对照=扣费·报告暂不可用臂（该面文案「报告暂时无法生成」与扣费结算一致 · 零缺陷）。校准 spec 已将第三臂落字 named 诚实红（`recruiting-bound.spec.ts:229-230` · 不作 PASS 容忍面）——本刀 prove 即行使该 named 红转绿。
**Base**: `origin/feat/mysql-schema-skeleton` **`84bbef23`**（full `84bbef2367b0870d30385d2e107449133876ad60` · worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7v-fix` · branch `line/g7v-thirdarm-copy-fix`）· **rev2 时序勘误（如实 · 双席共同处方）**：rev1「本地 origin 引用与主仓 tip 恰等、无 turn 内 origin 前进证据」系 fetch 未成功下的**无凭据过度声称**——rev2 修订时点实测主线已前进两 docs nail（`fe218b7a` G7V nail〔含 GAP-G7V-THIRDARM-COPY-SETTLEMENT P1 OPEN 登记〕+ `209f71c7` G7W nail）；本刀分支仍按派刀指令基于 `84bbef23` 切出（rev1 commit `c12702dc` 在其上），EXEC coding 前 **rebase 硬门**见 §3.0，行号/blob 一律按 rebase 后当 tip 重核
**Pins（原值全抄 · 未动）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503** · **`g7SuiteGreen=false`** · **`actualSpendCny=null`**
**Retained（本刀零翻转）**: trio **OPEN**（`1/1/1` · G7U 真测 retained · 本刀 prove 非 trio 三 CMD，翻绿权不在本刀）· 红① **STILL OPEN**（构成=G7V 校准已落码待行使 · 第三臂 named 红由本刀 prove 行使，行使结果不影响红①的 SSOT 状态——状态行归协调方 nail 改）· golden(chromium) 冷启面 **env/候选**（归协调方）· CMD1/CMD3 api 面 **G7S 同形 retained**（另刀边界）· recruiting-bound ×2 残红（G7U 口径）不因本刀洗绿 · GAP-G7K-API-REDS **P1 OPEN**（`0c6c3287` 不翻）· **GAP-G7V-THIRDARM-COPY-SETTLEMENT** 待 G7V nail 登记（本刀引用不建行不翻行）· `r1Closed=false` · Disclosure-1 **OPEN** · `techRoleFailClosedOptOutG7Only=true`

---

## 0. 本 turn 只读纪律声明（Ban coding / Ban prove 的证据来源披露）

本 REQUEST 的设计**零实跑、零 live 调用、零 Key 加载、零 DB 连接、零产品码改动、零 spec 改动、零 backlog/SSOT 改动**，证据全部来自只读：**(a)** 本 worktree git 只读源码亲读（行号一律 @`84bbef23`，关键码面 blob `git rev-parse HEAD:<path>` 亲算在卷 §1）；**(b)** G7V EXEC 收据（`ai-docs/delivery/receipts/gap-adaptive-early-stop/` 三文件）+ 校准 commit `92f70db7` diff 亲读；**(c)** G7V REQUEST/双审 committed 先例链引用。不发明任何未在案明细；码面行号 EXEC 期按当 tip 重核回填。**「第三臂 UI 实际渲染字节」本 turn 无运行时读数（零实跑）——修复后全测绿的推演是码面结构推演（§3.1），Ban 冒充运行时读数；运行时定谳归 EXEC 单 attempt。**

## 1. 诊断前置：第三臂相悖链源码定位（码面锚 blob 亲算 @`84bbef23`）

### 1.1 相悖链一句话

worker 早停 done 块按评分证据分派结算：第三臂（unscored=0 ∧ eligible=0）走 `completeInterviewAndConfirm` **确认扣费**，却落 `assessment_unavailable` 事件（与释放臂同 kind、仅 `reason` 不同）；前端 `business-events` 解析出 `reason` 后在 `interview-state` 丢弃，`view-model.ts:68` 对 `assessment_unavailable` 相无论 reason 渲染释放臂文案「本次预留额度已释放」→ **已扣费面宣示补偿已发生 = 文案与结算相悖**（G7V EXEC mobile 运行时复现）。

### 1.2 相悖链码面锚（逐环 file:line + blob）

| 环 | file:line | blob | 内容 |
|---|---|---|---|
| UI 文案（**缺陷行 · 本刀修复本体**） | `apps/web/lib/view-model.ts:68` | `71d1bd0d` | `case 'assessment_unavailable'` 单分支相无论 reason：heading「本次评分暂不可用」+ message「没有得到足够可信的评分证据，本次预留额度已释放。岗位面试可从”我的投递“重新开始；其他面试可新建一场。」+ action `view_applications`——两种 reason 同渲染释放声称 |
| SSE 事件解析 | `apps/web/lib/stream/business-events.ts:54-55` | `b7e5ab3d` | `assessment_unavailable` 载荷 `{ reason: z.string() }.loose()` **已解析**；`:54` 注释自证语义边界：「评分证据不足/评分执行失败：没有可信分数，额度已释放。不得与 report_unavailable 混用；**后者的面试已经完成并扣费**」——第三臂事件借用了前者的 kind，钱面却是后者族 |
| view 状态落定（reason 丢弃点 · **本刀伴生 plumb**） | `apps/web/lib/stream/interview-state.ts:122`（接口 `:26-47` · plumb 先例 `:46` `signalConcludeReason?`） | `a9214288` | `case 'assessment_unavailable': next.phase='assessment_unavailable'; next.degraded=true; break;`——reason 到此丢弃；行尾注释「无可信评分且已释放预留」在第三臂为假（如实注记：本刀 plumb 时随行修正该注释，注释-only） |
| 结算分派（**Ban 碰**） | `apps/worker/src/adaptive-lifecycle.ts:340-341`（eligible>0：complete+enqueueReport）· `:345-356`（**第三臂**：`:346` `completeInterviewAndConfirm` + markApplicationNoEligibleScore · `:353` unbound→enqueueReport · `:355-356` bound→`appendEvent('assessment_unavailable',{reason:'no_eligible_scored_answer'},…)` **零报告入队**）· `:360-365`（**释放臂**：`:361` `failInterviewAndRelease` + `:364` `appendEvent(…{reason:'evaluation_unscored'}…)`） | `288eb311` | unscored/eligible 计数分派；第三臂与释放臂同 kind 不同 reason 是相悖的根源，但**分派语义本身正确**（已扣费面就该扣费结算）——修的是 UI 谎报，不是结算 |
| 结算本体（**Ban 碰**） | `packages/db/src/commerce.ts:163`（`completeInterviewAndConfirm`：confirmConsumption 确认消费 + CAS completed）· `:198`（`failInterviewAndRelease`：releaseConsumption 补偿释放） | `a64784e8` | 付费面试终态唯一收口协议；「已扣费」判据=面试 status completed ∧ consumption confirmed |
| B 端收口（旁证 · 零触碰） | `packages/db/src/recruiter.ts:265`（`markApplicationNoEligibleScore`：bound 且 in_progress → 标 `assessment_unavailable`+score=NULL · replay-safe）· `:182`（`finalizeApplication`：**已 `assessment_unavailable` → 幂等返回 `'assessment_unavailable'`（实码 `:200` · rev1 书 `:197` 勘误）**） | `d06b4f49` | 第三臂后自动 finalize（`InterviewPanel.tsx:100` 终相集合含 `assessment_unavailable`）返回 200——spec 末段 `finalizeResponses.some(200)` 断言在第三臂可达 |
| 校准仪器（**Ban 碰 · prove 对象**） | `apps/web/e2e-ui/recruiting-bound.spec.ts` | `2b232748` | `:58-61` 常量（`RELEASED_MSG_PART='本次预留额度已释放'` `:59` · `REPORT_DOWN_MSG_PART='报告暂时无法生成'` `:60` · `PRACTICE_FEEDBACK_PART` `:61`）；`:216-220` 钱面锚 poll `/^(failed\|completed)$/`；`:222-224` 释放臂断言（status=failed → 释放文案必现）；`:225-230` **第三臂 named 诚实红** `expect(releasedCopyOnCharged,…相悖…).toBe(false)`；`:232` 扣费臂 `Promise.any([REPORT_DOWN, PRACTICE_FEEDBACK] · 120s)`（单行 · 初稿 B 下=第三臂强判别门）；`:233-239` 报告就绪/暂不可用分臂；`:241` finalize 200 poll；`:243-254` recruiter 侧校准 hold（评分暂不可用必现 `:245` · 「已完成」count 0 `:246`）。**rev2 行号勘误（mw-e2e-ha 亲证四条已改）**：钱面锚 poll `:216-220`（rev1 书 `:218-221`）· 分臂 `:233-239`（rev1 `:235-242`）· finalize poll `:241`（rev1 `:244`）· `recruiter.ts` 幂等 `:200`（rev1 `:197`）；recruiter hold 块随勘误修正 `:243-254`（rev1 `:246-253` 欠精确） |
| 附着证明面（零触碰 · 须保持绿） | `apps/web/test/web-logic.proof.ts:209-214` | `ee9505f5` | 夹具 reason=**`evaluation_unscored`**：断言释放文案 `message.includes('额度已释放')` + `view_applications` +「不冒充报告不可用」——**本刀后仍绿**（该臂逐字保留释放文案）；本刀给第三臂新文案不进此夹具（Ban 顺手扩证） |
| 运行时复现在案 | `ai-docs/delivery/receipts/gap-adaptive-early-stop/01-readings.md` §2 mobile 表 seq7-8 | — | early_weak@turn4 → 第三臂落臂 → UI 释放文案 ×已扣费结算同帧 |

## 2. 修复方案（唯一触碰面=两文件 · reason 分臂 · 文案初稿交双审）

### 2.1 触碰面声明与指令偏差披露（如实 · 交双审 + 协调方确认）

协调方指令面=「仅 view-model.ts 文案分派（按 reason 分臂）」。码面机械前提：**`reason` 当前到不了 display 层**——`business-events.ts:55` 已解析、`interview-state.ts:122` 落定时丢弃、`InterviewView` 无承载字段。不做 plumb 则 view-model 内任何 reason 分派不可实现。故本刀触碰面申报为**恰两文件**：

1. **`apps/web/lib/stream/interview-state.ts`（伴生 plumb · 机械零语义）**：`InterviewView` 增一可选字段 `assessmentUnavailableReason?: string`（命名/先例沿 `:46` `signalConcludeReason?`）；`:122` 落定处赋值 `next.assessmentUnavailableReason = e.data.reason;`——phase/degraded/终态语义**零改动**；随行修正 `:122` 行尾注释（「无可信评分且已释放预留」→ 按 reason 分臂注记），注释-only。
2. **`apps/web/lib/view-model.ts:68`（修复本体 · reason 分派）**：`case 'assessment_unavailable'` 按 `v.assessmentUnavailableReason` 三分臂（§2.2 文案表）。heading/spinner/action/degraded/signalConclude 结构零改动。

除上述两文件外**全卷零 diff**：`adaptive-lifecycle.ts`、`commerce.ts`、`business-events.ts`、`recruiting-bound.spec.ts`（含早停判据三臂结构全文件）、`web-logic.proof.ts`、`InterviewPanel.tsx`、recruiter surface、jobs page、decideNext/早停阈值/投影/早停文案族——EXEC 期 blob 链前=链后全等机检强制（基线集 §1.2 八面）。

### 2.2 文案定稿表（rev2 · 双审裁决收敛 · 初稿 A 废止 · Ban EXEC 期擅改）

| 臂（reason） | message 初稿 | 语义逐项 |
|---|---|---|
| **`no_eligible_scored_answer`（第三臂 · 定稿=初稿 B 全形 · rev2 双审裁决 primary）** | 「面试已完成并扣费结算，但未获得可信评分，**本次不生成报告**。岗位面试可从”我的投递“重新开始；其他面试可新建一场。」 | ①已完成并**扣费结算**=如实（`completeInterviewAndConfirm` confirmed · `business-events.ts:54` 自家语义「面试已经完成并扣费」）；②**零「已释放/释放/暂时」、零「报告暂时无法生成」**（无 `REPORT_DOWN_MSG_PART` 子串 · 正负双向逐字机检见 §3.1）；③「本次不生成报告」在唯一渲染路径 bound 上**严格为真**——`enqueueReport` 仅 `:341`/`:353`（unbound）可达，bound 第三臂零报告入队且无重试生成入口；**mw-model-op 裁决依据入卷**：「暂时」暗示等待可获报告=假（等待对象不存在）；④出路不变=我的投递（app status `assessment_unavailable` 可重试 · `jobs/page.tsx:112` 零动） |
| **`evaluation_unscored`（释放臂 · 逐字保留）** | 「没有得到足够可信的评分证据，本次预留额度已释放。岗位面试可从”我的投递“重新开始；其他面试可新建一场。」 | 该臂真释放（`failInterviewAndRelease` `commerce.ts:198`）——释放声称此时为真；**零 diff**；`web-logic.proof.ts:209-214` 夹具即此臂，须保持绿 |
| **未知/缺失 reason（fail-closed · 新增守卫）** | 「本次未能获得可信评分，面试已结束。岗位面试可从”我的投递“重新开始；其他面试可新建一场。」 | 不声称释放、不声称扣费——reason 不可辨时**不冒认任何资金变动**（诚实 fail-closed；现网两 reason 均恒带 reason，此臂为未来未知值守卫） |

**锚对齐改判（rev2 · 双席裁决在卷 · rev1 申报义务承续）**：rev1 以「报告暂时无法生成」锚对齐（`REPORT_DOWN_MSG_PART` 逐字子串 → `:232` `Promise.any` 命中 → 全测绿零 spec 改动）的设计**已被预执行双审改判**——**mw-model-op 否决**（裁决依据入卷：「暂时」暗示等待可获报告=假：bound 第三臂零报告入队且无重试生成入口，等待对象不存在；「本次不生成报告」在唯一渲染路径 bound 上严格为真）；**mw-e2e-ha 判锚对齐合法**（b 项）**但初稿 B 更严格诚实**（两席处方收敛于 B）。**定稿=初稿 B 全形 primary（非 fallback）**，初稿 A（含锚版）废止不再实施。改判后果如实申报：初稿 B 无锚词 → `spec :232` 恢复为第三臂**强判别门**（未来他词资金谎报回归将红于超时门 · 判别冗余反而增强）；**已知代价**：第三臂落臂 run 将红于 `:232`（120s 超时）=仪器期望先于修复的既存结构——Ban 归咎修复刀、Ban 洗、EXIT 原值记录（§3.1 落臂矩阵）；**升级协调方裁「仪器校准另刀」**（completed∧assessment_unavailable 面加正向断言恢复判别冗余——归协调方 · 本刀不做不预claim）。

### 2.3 Ban 面（全刀恒常）

Ban 碰 `adaptive-lifecycle.ts` / `commerce.ts` / 结算语义（confirm/release/mark 族）/ 早停语义（阈值、`decideNext`、`session_concluded` 投影与文案）/ spec 早停判据（三臂结构、锚层、分支守卫、禁则——`recruiting-bound.spec.ts` 全文件零 diff）/ `web-logic.proof.ts` / masking（直插事件/分数/伪造落臂）；Ban 把第三臂洗成「报告就绪」假面（文案只如实「本次不生成报告」，不伪造 `report_ready` 语义，`PRACTICE_FEEDBACK_PART` 子串 Ban 出现）；Ban 顺手修 `jobs/page.tsx:110` 注释（「已退款」对第三臂为假话）——越界面不入本刀，**登记为后续注释收口小刀候选（协调方队列 · rev2 保留观察项）**。

## 3. prove 方案（重审 BOTH PASS + meetwise 授权后 EXEC 实施 · 一次优先）

### 3.0 EXEC 前 rebase 硬门（两席共同处方 · rev2 新增 · 先于任何动码）

EXEC coding 前（授权后、动第一行码前）强制：`git fetch && git rebase origin/feat/mysql-schema-skeleton`（当前 tip ≥`fe218b7a` · 已含 G7V nail 的 GAP-G7V-THIRDARM-COPY-SETTLEMENT P1 OPEN 登记行）→ 按 rebase 后当 tip 重核 §1.2 全锚表 blob 与行号回填（行号一律以 rebase 后实测为准）→ **rebase 后 HEAD SHA 记入收据，为 §3.1 机检第四强制项**。rebase 冲突或语义疑义即停升协调方（Ban 强推 · Ban rebase 内顺手改码）。

### 3.1 主证 CMD（恰好一次 · 期望按落臂矩阵如实两段）

```bash
cd /Users/miaole/Desktop/golucky/meetwise-line-g7v-fix \
  && set -a && source ~/.meetwise-secrets/load-model-api-key.sh && set +a \
  && E2E_UI_GREP='C→B: real browser binds application' pnpm e2e:ui:isolated
```

- 路由：`e2e:ui:isolated`（根 `package.json:279` `node scripts/run-e2e-isolated.mjs e2e:ui`）→ `run-e2e-ui.mjs`（自起真栈 api+worker+web production `next start` · `E2E_UI_GREP` `--grep` 单测过滤 · `MODEL_API_KEY` 空即 `live_provider_key_missing` fail-closed `run-e2e-ui.mjs` provider 门）· 双 project（chromium + mobile）同跑。
- **期望（rev2 如实两段 · 非无条件绿 · 码面结构推演 EXEC 运行时定谳）**：
  - **修复合同面（绿判据 · 本刀 prove 目标）**：初稿 B 不含 `RELEASED_MSG_PART`（`:59`）子串 → 第三臂落臂 project 钱面 completed 后 `releasedCopyOnCharged=false` → named 诚实红 `:229-230` **转绿**（`toBe(false)` PASS）——第三臂 UI 资金谎报回归门就此立起。
  - **已知代价面（如实申报 · rev2 锚对齐改判后果）**：初稿 B 无锚词 → 第三臂落臂 project 将**红于 `:232` 超时门**（`Promise.any` 120s 双等待拒绝 = 仪器期望先于修复的既存结构）→ 该 project 该测 FAIL → **EXIT=1 原值记录**，五分类归「仪器结构面」（**Ban 归咎本刀修复 · Ban 洗**）→ 升级协调方裁「仪器校准另刀」（§2.2 改判段）。
  - **落臂矩阵**：①第三臂落臂 → EXIT=1（恰红于 `:232` · 修复已行使 · named 红已转绿）→ 收据记「修复合同兑现 + 仪器结构红申报」；②释放臂/扣费报告臂落臂 → 零改动面全 PASS → EXIT=0；③双 project 均未落第三臂 → EXIT=0 但**修复未被行使 = not-demonstrated** → 如实记录 + 升级协调方（Ban 追臂重跑）。
- **单 attempt · Ban retry-to-green · Ban 重跑追臂**：EXIT 原值逐档记录（含非零原值 · 落臂矩阵①类非零=在案已知代价，不构成迭代刀触发）；红于矩阵外形态 → EXIT 原值 + 五分类 + 根因假设如实登记 → 迭代刀重走 REQUEST。**臂指派数据依赖如实申报**：G7V EXEC 实测 1/2 落第三臂；EXEC run 后逐 project 按结算面读数记录落臂（journey 时间线/结算文案面），`releasedCopyOnCharged` 实测值随收据。
- **副证 CMD（回归门 · 恰好一次 · 零 diff 期望）**：`cd /Users/miaole/Desktop/golucky/meetwise-line-g7v-fix && pnpm -C apps/web prove`——`web-logic.proof.ts` 全绿（`:209-214` 释放臂夹具不动即绿 · EXIT=0 期望 · 非零如实记录）。
- **机检四强制进收据（rev2 重写）**：①**触碰面形**——两触碰面（`view-model.ts`/`interview-state.ts`）`git diff` 链后≠链前且恰为申报变更（plumb + reason 三分派），numstat 恰两文件；②**blob 等值**——六禁改面（`adaptive-lifecycle.ts`/`commerce.ts`/`business-events.ts`/`recruiter.ts`/`recruiting-bound.spec.ts`/`web-logic.proof.ts`）+ 旁证面（`InterviewPanel.tsx`/`jobs/page.tsx`）链前=链后全等（`git rev-parse HEAD:<path>` 逐面亲算 · rev2 修 rev1「八面全等 ∧ 恰两文件」自相矛盾——mw-e2e-ha 处方）；③**正负双向逐字（mw-model-op 处方）**——负面禁则字表「已释放/释放/退还/退回/补偿/稍后自动」第三臂文案零出现，正面扣费主句「已完成并扣费结算」逐字在案，第三臂**实际渲染文案全文入收据**；④**rebase 后 HEAD SHA**（§3.0 · 两席共同处方）。

### 3.2 预算与 Key 卫生（沿用 G7V readings 口径）

- **est ≤30 live**（2×classify + 2×面试旅程[各 ~4–5 回合×出题+评分] + 报告 worker 重试项[report-down 臂若落 · 实测 ~40s 族]）≪ **200 硬帽**（est-not-counter · 七字段口径沿 `receipts/gap-adaptive-early-stop/01-readings.md` §2）；超限即停如实记中止（不洗 not_run）。
- **`actualSpendCny=null`**（无计价数据源 · Ban invented spend）。
- **Key name-only**：`MODEL_API_KEY` 只经进程环境（`~/.meetwise-secrets/load-model-api-key.sh` loader source · 收据只记 presence name-only）；**Ban 写任何 `.env*`**（runner 对已存在 `.env` 的读取不构成本刀写入面 · 本刀不落任何 `.env*` 文件）；`.env*` ABSENT presence 逐 attempt 记录；Ban Key 值/fingerprint 入 receipt/log/commit。
- **收据落点**：`ai-docs/delivery/receipts/gap-thirdarm-copy-fix/`（per-CMD 七字段 + 落臂读数 + 机检段 + SUMMARY）。

## 4. Ban 清单（本 turn 与 EXEC 默认 plan 全量）

1. **Ban coding**（本 turn docs-only；EXEC 期 coding 须 pre-exec dual BOTH PASS + meetwise 授权，触碰面按双审裁决版两文件）。
2. **Ban covered**：本刀状态无论 prove 绿红，covered 定性权归协调方；Ban 在本刀卷内写 covered。
3. **Ban 翻任何 pin**：§首 Pins 十项原值；`g7SuiteGreen` 翻true须三绿+post-dual+协调方 nail，本刀 prove 绿**不构成**翻 pin 依据。
4. **Ban 洗绿其余 OPEN 红**：recruiting-bound ×2 残红（G7U 口径）、golden ×1、trio `1/1/1`——不因本刀 prove 结果改写任何在案红档；Ban flake 记法 / 只留绿 attempt / 假绿；Ban 把第三臂 `:232` 超时红归咎本刀修复或改写归因（rev2 已知代价在案 · §2.2/§3.1）。
5. **Ban 改共享 SSOT**：backlog / checklist 只在 nail 由协调方改；**GAP-G7V-THIRDARM-COPY-SETTLEMENT 由 G7V nail 并行登记 P1 OPEN**——本 REQUEST 仅引用缺陷号，Ban 建行/翻行/代登记。
6. **Ban self-approve / alone ≠ dual**：pre-exec 与 post-prove 均须 mw-e2e-ha + mw-model-op 双审独立签署；本席零裁决权。
7. **Ban Key 物料越界 / Ban 无授权 push**：Key 只经 loader 进程环境 name-only；push 在 commit 后按协调方本刀指令执行（交付链明列）。

## 5. 流程声明（本刀全程）

**REQUEST rev1（`c12702dc`）→ 预执行双审 FAIL（mw-model-op a/c/f + mw-e2e-ha c/f）→ rev2 修订（本 commit · docs-only · 按合并处方）→ 协调方派重审（mw-e2e-ha + mw-model-op）BOTH PASS → meetwise 授权 → coding+prove 一次优先（rebase 硬门 §3.0 先行 + 主证/副证 CMD 各恰一次 + 机检四强制 + 收据落 `receipts/gap-thirdarm-copy-fix/`）→ post-prove 双审 → meetwise 授权 nail**。nail 阶段才动 SSOT（backlog 缺陷行登记/状态、checklist、pin 翻转裁决）。

## 6. Non-claims

Not a pass · not run（本 REQUEST 零实跑 · rev2 亦零实跑）· not fixed · not coding · not proven（推演链是码面结构推演非运行时读数）· not third-arm closed（named 红转绿待 EXEC 行使 · SSOT 状态归 nail）· not covered · not nail · not trio green · not suite green · not `g7SuiteGreen=true` · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not `releaseEvidence=true` · not backlog 登记（G7V nail 已于 `fe218b7a` 并行登记 · 本席零操作）· **not 仪器校准**（completed∧assessment_unavailable 正向断言另刀 · 归协调方 · 本刀不做）· **not 第三臂 run 全绿**（初稿 B 无锚词 · `:232` 超时红为在案已知代价 · 非本刀缺陷）· **not rebase 已执行**（§3.0 EXEC 硬门 · rev2 未动码）· **not 重审 PASS**（rev1 双 FAIL · rev2 待协调方派席重审）· not live（本 turn）· not coordinator authorize · golden 冷启面/api 面 G7S 同形不在本刀 · 注释收口小刀（jobs/page.tsx:110）不在本刀 · `g7SuiteGreen=false` · trio OPEN（1/1/1 retained）· 红① STILL OPEN · **`actualSpendCny=null`** · alone ≠ dual

---
*Harness · G7V-FIX 第三臂文案/结算相悖产品修复刀 · 2026-10-07 · **`rev2:awaiting_pre_exec_re-review`** · docs-only · rev1 双审 FAIL 处方全兑现：第三臂文案定稿=初稿 B 全形（零释放词/零暂时/零锚词 · model-op 裁决依据入卷）· 锚对齐改判废止初稿 A（:232 恢复强判别门 · :232 超时红=在案已知代价 · 仪器校准另刀归协调方）· 机检四强制（触碰面形/六禁改+旁证 blob 等值/正负双向逐字+渲染全文入卷/rebase 后 HEAD SHA）· rebase 硬门 §3.0 EXEC 先行 · 行号勘误四条+hold 块修正 · 时序勘误（恰等过度声称如实改判）· 落臂矩阵如实两段（修复合同绿判据 + 已知代价红段）· est ≤30≪200 · STOP 等协调方派重审 · STOP*

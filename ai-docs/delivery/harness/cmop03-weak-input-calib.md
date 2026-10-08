# Harness — **CMOP03-E · 刀② 弱输入 report_unavailable 预期面校准**（G7X nail 立项刀②·随刀① 后——刀① 已 nail @主线 · Line cmop03-weak-input-calib · docs REQUEST · `draft:awaiting_pre_exec_dual` · **两分支并陈交双审 · 产品语义裁归产品席** · `full.e2e.ts:236-237` 断言本体零 diff 原则 · ≠ 刀①（已落地）≠ post-7b 鉴别刀 ≠ P2 行域）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · Ban coding（含 e2e harness/driver 代码 · 注释级亦须双审授权）· Ban prove 执行 · Ban 实跑 · Ban live（本 turn 零调用零 Key 加载零 DB 连接）· Ban push（本 REQUEST turn 后由协调方指令推）· Ban fake green · Ban `g7SuiteGreen=true` · Ban 洗绿 · **Ban retry-to-green** · **Ban 把 `:236-237` 改成「必须 ready」** · Ban 归因 schema_validation_failed（P2 行域）· Ban 碰 post-7b 新面（GAP-CMOP03-POST7B · 鉴别刀域）· Ban 碰聚合门/报告链产品码 · Ban 改共享 SSOT · Ban secrets · Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT · **本 REQUEST 不预设 P/D 裁断——裁决归预执行双审（含产品席视角判读）+ meetwise**）
**Date**: 2026-10-08
**Line**: **CMOP03-E**（**G7X nail 双刀立项之刀② · 随刀① 后** · G7X nail 登记块 2026-10-08 双刀立项行 · 刀① CMOP03-FIX driver 断言修复刀已落地 @主线（REQUEST `938e0f55`≡`479719a9` → coding `4252efc8` → EXEC 收据 `9a48f57c` → erratum `c7605b8b` → nail `1a76c249` → 主线收账 + fixup `5a2994c4`）· 本刀=刀②（弱输入 report_unavailable 预期面校准 · 产品语义裁归产品席 · REQUEST 期两分支并陈交双审）· 与 `:107`/C-MO-P3 残留/`GAP-CMOP03-POST7B` 鉴别刀/G7V-CALIB 域 disjoint）
**授权链**: G7X 根因调查刀（REQUEST `83234709` → erratum `979a85e4` → EXEC 收据 `c477df54` → post-prove dual BOTH PASS → G7X nail（line 侧 `50557225` · 主线收账见 execution-master-checklist G7X 节）：**残红③根因双面收敛 + 双刀立项登记**）→ **刀① 已全链落地 @主线（step 7/7a/7b 首执行全过 · post-7b 新面 P1 OPEN 另立鉴别刀）** → **本 REQUEST（刀② docs-only · 两分支并陈）→ 预执行双审（mw-e2e-ha + mw-model-op · 含产品语义视角判读意见）→ meetwise 授权（定裁断分支）→ EXEC（视裁决分支：P=显式化校准 · D=STOP 转 product-fix 另刀）→ post-prove 双审 → meetwise 授权 nail**
**输入事实（在卷引用 · 只读 · 行号一律 @`5a2994c4`）**：
- **G7X T-1 判别 run**（EXEC 收据 `c477df54` · 收账入 execution-master-checklist G7X nail 节）：主面试 completed（tick-26）→ `ai_report` 舱壁 3-attempts 烧尽（`score_aggregate_empty` ×3 · tick-26/31/36）→ `report_unavailable`+`quarantined` 设计终态（tick-36）· 全程 40363ms。
- **刀① EXEC 复测**（receipts/cmop03-driver-assertion-fix/ · 单有效 attempt EXIT=1 class=api 78798ms）：journey 首次走通 step 7/7a/7b——**7a failLoop terminal=`report_unavailable`+`quarantined` 如实通过（`:236-237` 零改断言本体而预期形状兑现 · ledger 四终态 report_unavailable×2 + quiz_unavailable + diagnosis_ready 在卷）**；post-7b 新面红原值登记（`GAP-CMOP03-POST7B` P1 OPEN · 死亡窗 ∈(:256, :356] · 鉴别刀已立项另域）。
- **聚合门机制（码面亲读 @`5a2994c4`）**：`reportGenerator` 返回闭包**首行**即 `aggregateScores(s.scores)`（`apps/worker/src/interview-service.ts:283`）——**invoke 之前**抛出，报告 narrative 模型调用从不发生；`aggregateScores` 空集抛 `score_aggregate_empty`（`packages/domain/src/assessment.ts:20-26`）。
- **报告链钟机制（码面亲读）**：`MAX_REPORT_ATTEMPTS=3`（`packages/db/src/report.ts:10`）· 失败指数退避 `next_attempt_at = now() + 2^attempts 秒`封顶 300s（`report.ts:53`）· dispatcher tick `intervalMs=5000`（`apps/worker/src/report-worker.ts:104`）→ 3 attempts + 退避 + tick 对齐 ≈ **~10-12s 确定性钟**（G7X T-1 tick-26/31/36 等距实证同量级）· 3 次烧尽 → sweeper 隔离 `quarantined` 并**必发 `report_unavailable` 终态事件**（`report-worker.ts:61-67` · reason=`max_attempts_exceeded` · 防前端无限转圈）。
- **弱输入定义性后果链（码面亲读）**：两面试皆 practice 直创未绑岗（`e2e/full.e2e.ts:142`/`:220` `POST /interview` body=`'{}'` · 零岗位绑定）→ 得分权威=ScoreCard 仅 practice_eligible/b_review_eligible、legacy `answer_evaluated.score` 结构性不参与（`apps/worker/src/main.ts:158-159` · `packages/db/src/scoring-aggregation.ts:6-7`）→ 该旅程零可计分卡 → `loadSummary` scores 空 → 聚合门空集必拒。

**Base**: `origin/feat/mysql-schema-skeleton` **`5a2994c4`**（full `5a2994c426f49150a6fc1552682db2dd844eea54` · turn 内 `git fetch` EXIT=0 · local/remote-tracking ref 实测恰等 · 含刀① CMOP03-FIX 全链 + 刀① nail @主线）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-knife2` · branch `line/cmop03-weak-input-calib`
**Pins（原值全抄 · 未动）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503** · **`g7SuiteGreen=false`** · **`actualSpendCny=null`**
**Retained（本刀零翻转）**: **`g7SuiteGreen=false`** · trio **OPEN**（G7U 真测 1/1/1 · G7X T-1 与刀① EXEC 预期红原值记账零冲销）· **`GAP-G7K-API-REDS` `:107` P1 OPEN**（任一落地 ≠ 关闭）· **`GAP-CMOP03-POST7B` P1 OPEN（鉴别刀域 · 本刀零触碰零归因）** · **P2 `GAP-G7W-QGEN-SCHEMA-VALIDATION` 复验门零触碰** · C-MO-P3 行关闭/翻转归协调方后续（刀① 落地注≠关闭）· 残红①（旅程自适应早停面 ×2）/残红②（golden ×1）零触碰 · Disclosure-1 OPEN · `r1Closed=false` · **`actualSpendCny=null`**

---

## 0. 本 turn 只读纪律声明（Ban coding / Ban 实跑 的证据来源披露）

本 REQUEST 的设计**零实跑、零 live 调用、零 Key 加载、零 DB 连接、零代码改动（含 e2e harness/driver 代码与注释）**，证据全部来自只读：**(a)** 本 worktree git 只读源码亲读（行号一律 @`5a2994c4`；关键 blob `git hash-object` 亲算在卷 §3 尾机检钉）；**(b)** 在卷收据链引用——G7X T-1（execution-master-checklist G7X nail 节收账原文）+ 刀① EXEC receipts（`ai-docs/delivery/receipts/cmop03-driver-assertion-fix/` 00-exec + SUMMARY · 本 tip 祖先）+ 刀① harness/slice/nail 六节落地注。不发明任何未在案明细；EXEC 期行号按当 tip 重核回填。**prove 期读数无论何形状如实入收据（Ban retry-to-green · Ban 定谳压力 · Ban 就地 reinterpret）。**

## 1. 两分支并陈（**不预设裁断** · 双审含产品席视角判读 · 裁断路由）

> **总纪律**：本 REQUEST 对「practice 直创未绑岗旅程零可计分 ScoreCard → 聚合门 `score_aggregate_empty` invoke 前抛 → 报告链 3 attempts 烧尽（~10-12s 确定性钟）→ `report_unavailable`+`quarantined`」**并陈 P/D 两分支论据，不预设裁断**。产品语义终裁归产品席/协调方 meetwise；双审两席各给**产品语义视角判读意见**（显式声明：双审判读 ≠ 终谳 ≠ EXEC 授权）。

### 1.1 分支 P：设计内常态（→ 本刀落「显式化校准」）

1. **零可计分卡 = 脚本弱输入的定义性后果**：两面试皆 practice 直创未绑岗（`full.e2e.ts:142`/`:220` · body=`'{}'` 零岗位绑定）；得分权威=ScoreCard 且仅 `practice_eligible`/`b_review_eligible` 可计、legacy 分数结构性不参与（`main.ts:158` · `scoring-aggregation.ts:6-7`）——未绑岗输入在评分权威定义下**确定性地**不产出可计分卡，这是输入面的定义性后果，非运行故障、非供应商失败。
2. **聚合门确定性拒绝 = 设计意图（三处独立码面注记在卷互证）**：`interview-service.ts:283`「空集或越界 score 由确定性聚合门拒绝，**不交给模型猜**」；`assessment.ts:15-16`「**空集合不是 0 分**：它表示本场没有有效评分证据，调用方必须走 unavailable/unscored 路径，**不能把系统或供应商故障伪装为候选人的低分**」；`main.ts:159`「无卡 → scores 空（aggregateScores 空集会抛 score_aggregate_empty，**报告走 unavailable，绝不回退 legacy 分数**）」。且门在 **invoke 之前**抛（`:283` 为 `reportGenerator` 闭包首行）→ 报告链钟全程**零模型消耗**（G7X T-1 live=7/run 全部来自题面/评分侧 · `ai_report.last_error=score_aggregate_empty` ×3 直证 narrative invoke 未发生）——钟是纯 DB 确定性钟，非模型重试钟。
3. **unavailable+quarantined = 设计终态族**：`ReportStatus` 五态 CHECK（`report.ts:7`）；`MAX_REPORT_ATTEMPTS=3` poison-pill 兜底「超过 → 隔离转人工（quarantined），不再无限重试/崩溃循环」（`report.ts:9-10`）；quarantine **必发** `report_unavailable` 终态事件（`report-worker.ts:61-67`「quarantined 不能是静默死胡同」）；interview 终态五族含 `report_unavailable`（`e2e/helpers/interview.ts:7`）；`:216` 断言分支自身容于非 ready 终态（刀① §3 已定谳「零改 :216」）。
4. **e2e 断言现状已容 + 两代实测兑现**：`:236-237` 断言本体即「`report_unavailable`+`quarantined`」形状；G7X T-1（tick-36 终态）与刀① EXEC（7a 首验过 · `:236-237` 零改断言本体）两代在卷兑现。**现状已容 → 分支 P 下本刀=登记报告链钟为旅程预期构成 + 判据文档化，零码改或仅注释级（§2）。**

### 1.2 分支 D：scoring 面缺陷（→ 本刀 STOP 转 product-fix 另刀立项）

若产品意图 = **practice 直创旅程也应产出可计分 ScoreCard**（例如 practice 侧应有可落卡 rubric 供给、scoring writer 应在 practice 路径落 `practice_eligible` 卡），则「零可计分卡 → 聚合门必拒 → 报告永远 unavailable」就是 **scoring 供给面缺口**（score-writer 未在 practice 路径落卡）——报告 unavailable 只是缺口的下游确定性表现，此时候准 e2e 预期面等于**把产品缺陷写成测试预期（伪绿面）**。D 成立时：**本刀 STOP——零 run 零 coding，本刀只交裁决记录**；缺口转 product-fix 另刀立项（新 REQUEST 全链），本 REQUEST §2/§3/§4 全部不 EXEC。

### 1.3 双审裁决路由（预执行 dual · 含产品席视角）

- **裁 P** → 本刀落「显式化校准」（§2 设计 · §3 预期面 · §4 prove）：现状 `:236-237` 已容 → 校准=（i）报告链钟（~10-12s ×2 段）登记为弱输入旅程预期构成（文档化进本 harness §3 预期面）+（ii）时序脆弱面显式化（§2.2）——**断言本体零 diff 原则硬闭合（§2.0）**。
- **裁 D** → 本刀 STOP，裁决记录落本 doc 附节（EXEC 期回填）+ SSOT 登记归协调方 nail；**Ban 本刀继续任何校准动作**。
- 双审两席须各自显式给出「产品语义视角判读意见 + 判读依据码面/在卷引用」，并在 stub 中声明「判读非终谳 · 终裁归产品席/协调方」。meetwise 授权时定值分支（一次成型 · EXEC 期 Ban 分支二改）。

## 2. 若分支 P 成立的校准设计（断言本体零 diff 原则 + 两落点）

### 2.0 `:236-237` 断言本体零 diff 原则（硬 · 违反即本刀 FAIL）

```ts
A(failLoop.terminal === 'report_unavailable' && rep.status === 'quarantined',
  `[兜底] 报告失败 → report_unavailable + quarantined(无死胡同;终态=${failLoop.terminal || 'none'}, status=${rep.status ?? 'none'})`);
```

（`e2e/full.e2e.ts:236-237` · 逐字符零 diff 基线 · blob `1fededa5` 含之）。**Ban 改成「必须 ready」**（该方向即刀① §5.3 已 Ban 的越界裁——本刀不仅 Ban，且将其反转为 P 分支的登记对象：弱输入旅程预期构成=report_unavailable+quarantined）；Ban 任何方向改写/放宽/吞错/删除断言本体；`:216` 同零 diff。EXEC coding 面默认**零 diff**；仅当预执行双审 + meetwise 显式授权「注释级校准注记」时，允许 `full.e2e.ts:218-238` 邻域**注释**（断言语句 `:236-237` 逐字符全等机检 · 改后 blob 收据登记）。

### 2.1 落点（i）：报告链钟登记为弱输入旅程预期构成（文档化进 §3 预期面）

G7X/刀① 两代收据的报告链钟（**~10-12s 确定性钟 ×2 段**：主面试钟段① + 7a failLoop 钟段② · 机制=3 attempts × dispatcher tick 5s + 退避 2^attempts 秒封顶 300 · `report.ts:53`/`report-worker.ts:104`）**登记为该旅程的预期构成**（§3 表逐段冻结）：弱输入旅程从 begin 到 terminal 的时长**内含**两段钟，非延迟、非 flake、非供给故障——时钟面读数（tick 序 + `score_aggregate_empty` 计数 + last_error 形状）入 prove 收据（§4）。

### 2.2 落点（ii）：隐式等待报告的时序脆弱面清单 + 显式化方案（交双审 · **Ban 改断言本体**）

| # | 面 | 亲读事实 @`5a2994c4` | 脆弱化条件 | 显式化方案（本刀落字 · EXEC 零码改） |
|---|---|---|---|---|
| F1 | deadline 宽容面 | `INTERVIEW_TERMINAL_DEADLINE_MS=420_000`（`e2e/helpers/interview.ts:6` · per-call option `:269`/`:287`）+ 1s SSE 轮询（`:371`）vs 两段串行报告链钟 ~10-12s ×2 + 7b quiz/诊断钟——现值带宽充裕 | 未来按调用缩 `deadlineMs`，串行钟段②可脆断 | §3 把钟值带宽与「×2 段串行」构成为冻结判据；**任何 deadline 改动须新刀全链**（Ban 本刀 EXEC 内改 deadline/Ban 引入 sleep 补偿） |
| F2 | 读数确定性面 | 报告 status 读取均在终态事件之后（terminal-gated）——quarantine sweep 与 `report_unavailable` 事件系**同一 sweeper 动作**（`report-worker.ts:61-67`）→ `:213-216`/`:234-237` 无「先读后迁」竞态 | 若未来断言改为轮询 GET /report 等状态迁移，将引入竞态面 | §3 判据写明不变量「终态事件先行、status 读数在后」；Ban 改为状态轮询式断言（即 Ban 改断言本体的同义面） |
| F3 | 退避钟对 attempts 语义的敏感性 | backoff=`2^attempts` 秒封顶 300（`report.ts:53`）· attempts 语义若变则钟长变 | scoring/report 侧产品改动隐性改钟 | §3 钟读数判据=**tick 序 + `score_aggregate_empty` 计数 + last_error 形状**三判，不单赌 wall-clock 数值 |

### 2.3 对比案（不推荐 · 并陈备查）：把 7a 期望改为「弱输入面试禁建/前置绑定校验」

即由 driver 侧在 `:220` 前置岗位绑定使 failLoop 旅程变强输入（报告 ready）。**不推荐且超出本刀域**：改变被测旅程形状=改 spec 预期面本体（等同改断言语义），且 `:236-237` 兜底面（报告失败隔离舱壁的首验通道）是 `E2E_REPORT_FAIL_ALL` 注入面之外的**自然弱输入通道**，两通道并存有甄别价值（刀① erratum ② 承卷：注入路径与 loadSummary 面可区分）。仅当产品席裁 D 且 product-fix 落地后，另刀重审本 face——本刀零触碰。

## 3. 新预期面预注册（弱输入旅程 · **报告链钟登记在卷** · 全部判据先于实跑冻结 · EXEC 授权后不回改）

> **总纪律**：本刀**不预设「全绿」**——post-7b 新面红（`GAP-CMOP03-POST7B` P1 OPEN · 鉴别刀域）如实预注册为 **CMD1 预期 EXIT=1（红 retained）**；**本刀 prove 判据 ≠ EXIT=0**（§4.3 四判据）。逐段期望+判据如下（行号 @`5a2994c4` · 承刀① EXEC 实测）：

| 段 | 码面 | 预期（冻结） |
|---|---|---|
| 修复面（刀① 承卷） | `:201-203`（方案 a · `questions + clarifications`） | 过（刀① EXEC 越过实证在卷 · 本刀零触碰） |
| 主面试弱输入旅程 | `:187-210` | terminal=`report_unavailable`（终态五族容）· **报告链钟段①**：`score_aggregate_empty` ×3 → quarantined（~10-12s 带宽 · G7X T-1 tick-26/31/36 + 刀① EXEC 同形状在卷）· **零模型消耗**（gate invoke 前抛 · §1.1.2） |
| step 7 · 报告可查+状态机自洽 | `:213-216` | 过：GET /report → 200 · terminal≠report_ready → 分支 `b.status !== 'ready'` 容 `quarantined`（**零改 :216** · 读数不变量 F2：终态事件先行、status 读数在后） |
| **7a · 报告失败隔离（本刀断言本体面）** | `:220-238` | 过：failLoop terminal=`report_unavailable` && rep.status=`quarantined`（`:236-237` **逐字符零 diff** · 现状已容形状兑现 · 刀① EXEC 首验过承卷）· **报告链钟段②** 同构（×2 段串行登记为旅程预期构成 · F1/F3 判据） |
| 7b · 押题+诊断 | `:240-256` | 过：quiz 终态 ∈ {quiz_ready, quiz_unavailable, error} && 诊断终态 ∈ {diagnosis_ready, diagnosis_unavailable, error} 非空（无死胡同 · 刀① EXEC 实测 quiz_unavailable+diagnosis_ready 承卷 · 本刀不预注定值） |
| post-7b（**非本刀域**） | ∈(:256, :356] | **预期红**：`GAP-CMOP03-POST7B` P1 OPEN（鉴别刀域 · 本刀零触碰零归因）→ 总 EXIT=1 + class=api + machine receipt 原值全录（刀① EXEC 78798ms 先例承卷）· **红面零冲销零重跑** |
| sidecar 读数 | `ai_model_invocation` 账本 | 实测 ≤10/run 预期形状：报告 narrative invoke **零发生**（聚合门 invoke 前抛的正面判据）· 调用全部来自题面/评分侧 |
| 总 EXIT | `pnpm run e2e:isolated` | **预期 EXIT=1 红于 post-7b 窗（如实预注册 · 红 retained）**——判据四条见 §4.3 · **Ban 以「EXIT=0」为本刀通过条件** |

**预期面机检钉**（EXEC 实跑前后 blob 全等强制 · 亲算 @`5a2994c4`）：**产品码五钉零 diff**——`assessment.ts`=`ca63f4ce` · `interview-service.ts`=`3026d9dd` · `main.ts`（worker）=`e4878b61` · `report.ts`=`92c77919` · `report-worker.ts`=`06d87f73`；**harness 保护三钉零 diff**——`sse.ts`=`9bba015d` · `assert.ts`=`975fbb38` · `run-e2e-isolated.mjs`=`13dbfc43`（+`model-operation-registry.ts`=`63af556f` 沿刀① 四钉惯例并入）；`full.e2e.ts`=`1fededa5`/`interview.ts`（helper）=`c7001612` 为基线 blob（EXEC 若获授权落注释级注记 → 改后 blob 收据登记 + `:236-237` 断言语句逐字符全等机检；默认零 diff）。tracked 树 run 前后零改双测（`git status --porcelain` 非 untracked=0）。

## 4. prove 方案（EXEC 期 · pre-exec dual BOTH PASS + meetwise 授权后方可行 · **分支 D 则本节不执行**）

1. **前置**：pre-exec dual BOTH PASS（mw-e2e-ha + mw-model-op · 各含产品语义视角判读意见）→ **meetwise EXEC 显式授权**（定值面：**裁断分支 P/D 一次成型** · 注释级与否 · sidecar 保活机制 · base 重钉 ≥当 tip 含重新 fetch）→ 本 worktree（或授权重开）`pnpm install --frozen-lockfile`（EXIT 记录）→ EXEC coding 面=默认零 diff（§2.0）。
2. **裁 D 路由**：本刀 STOP——零 run 零 coding；裁决记录落本 doc 附节（EXEC 期回填）+ product-fix 另刀立项（非本刀域）。
3. **裁 P 执行序**：CMD1 同体 `pnpm run e2e:isolated`（wiring `package.json:278` · blob 沿刀① `0afb3bd2` 口径 EXEC 期重核）**一次优先 · 单 attempt**。**读数=报告链钟分段 + 聚合门触发面**：(a) 钟段①②分段（tick 序 + 每面试 `score_aggregate_empty` 计数 + `ai_report.last_error` 形状 · 三判非单赌 wall-clock）；(b) narrative invoke 零发生（sidecar 正面判据）；(c) `:236-237` 零 diff 且形状兑现；(d) post-7b 红原值零冲销零触碰。
4. **sidecar 账本实测臂（必须自带 · model-op 前向纪律）**：`ai_model_invocation` 账本 **SELECT-only 实测**逐 attempt 落卷——沿 G7X T-1「CMD1+sidecar」先例；**刀① EXEC 账本不可达缺口（wrapper finally 拆容器 · 未派 sidecar · 实测缺口如实记）= 本前向纪律的直接动因，如实承卷**；容器/账本读数窗保活至读数落卷（保活机制由预执行双审+meetwise 定值）；DB 凭据用容器固定测试凭据（wrapper baseEnv 同面 · 非模型 Key）。**est ≤10/run · 总硬帽 ≤200**（账本实测读数法 · 非估算器口径 · est-not-counter）· 超限即停如实记中止（不洗 not_run）。**`actualSpendCny=null`**（无计价数据源 · Ban invented spend）。
5. **attempts 全台账 · Ban retry-to-green**：全部 attempt（含首跑）七字段全记录 Ban 删除覆盖——CMD 原文 / EXIT 原值 / 起止时间戳 / 实跑 code SHA（worktree HEAD 实测）/ worktree+branch / 环境探针（`.env*` ABSENT 前后各测 · Key name-only）/ 判读归类。**预期红（post-7b 窗）不是重跑触发条件**——零第二次 run 通道（Ban 为绿追跑 · Ban 只留绿 attempt · Ban flake 记法冲销 · Ban 红面就地 reinterpret）。
6. **Key 卫生**：模型 Key 只经进程环境（loader source `~/.meetwise-secrets/` · **name-only 入卷**）· Ban 值/fingerprint 入 receipt/log/commit · Ban 写任何 `.env*`。
7. **收据落点**：`ai-docs/delivery/receipts/cmop03-weak-input-calib/`（per-attempt 收据 + SUMMARY：§3 预期面逐段判读 + 钟分段读数 + sidecar 账本实测 + 机检钉零 diff + 裁决分支执行记录）。SSOT/backlog 登记（刀② 登记行指向更新）**留 nail 阶段（协调方）**。
8. **EXIT 后路由**：§4.3 四判据全成立 → post-prove dual → meetwise 授权 nail（**落地 ≠ `GAP-CMOP03-POST7B` 处置 ≠ 鉴别刀 EXEC ≠ `:107` 关闭 ≠ trio 翻绿 ≠ `g7SuiteGreen=true`**）；任一判据不成立 → 原值记账 → 升级协调方（Ban 就地二改 · Ban 归因既有关行 · Ban 自 nail）。

## 5. 硬 Ban 清单

1. **Ban 把 `:236-237` 改成「必须 ready」**（含任何方向改写断言本体 · §2.0 零 diff 原则硬闭合 · `:216` 同零 diff）。
2. **Ban 归因 schema_validation_failed**：本旅程失败面=`score_aggregate_empty`（确定性聚合门 · 在卷两代实测）；P2 `GAP-G7W-QGEN-SCHEMA-VALIDATION`（`:109` 行域）零触碰零归因零混淆。
3. **Ban 碰 post-7b 新面**：`GAP-CMOP03-POST7B`（死亡窗 ∈(:256, :356]）= 鉴别刀域（driver 分段埋点 + sidecar 判别臂已立项 · line/cmop03-post7b-discriminator）——本刀零触碰零归因零顺手定位；CMD1 预期红于该窗（如实预注册 · 红 retained）。
4. **Ban 碰聚合门/报告链产品码**：`assessment.ts` / `interview-service.ts` / `main.ts`（worker） / `report.ts` / `report-worker.ts` 零 diff（五钉机检 · §3 尾）；Ban 任何「让 practice 旅程出卡/让聚合门放行空集/回退 legacy 分数」方向的产品码改动（后者若产品席裁 D，归 product-fix 另刀全链）。
5. **Ban 改共享 SSOT**：刀② 登记行指向更新 / G7X nail 节 / 刀① nail 节 / backlog 状态行（`:107` P1 OPEN 不翻 · `GAP-CMOP03-POST7B` P1 OPEN 不翻 · trio 不翻 · `g7SuiteGreen=false` 不翻）归**协调方 nail**；sibling 归档零改写。
6. **Ban secrets**：模型 Key 只经进程环境（loader source `~/.meetwise-secrets/` · name-only 入卷）· Ban 值/fingerprint · Ban `.env*` · Ban Key 入 receipt/log/commit。
7. **Ban retry-to-green / Ban masking / Ban 破坏性注入 / Ban withhold 契约触碰**：单 attempt 一次优先 · 预期红非重跑令 · Ban 伪造产品不可能状态 · Ban 清 BUILD_ID/降资源/杀进程 · 断言原文/case 名 stderr 回读契约零变更 · Ban 顺手做鉴别刀 · Ban 顺手做 product-fix。

## 6. EXIT 契约（双向）

- **裁 P 且 §4.3 四判据全成立** → 本刀产品=「弱输入 report_unavailable 预期面显式化校准落地（报告链钟 ×2 段登记为旅程预期构成 · `:236-237` 断言本体零 diff 机检在卷 · sidecar 账本实测在卷）」→ post-prove dual → meetwise 授权 nail。**落地 ≠ `GAP-CMOP03-POST7B` 处置 ≠ trio 翻绿 ≠ `g7SuiteGreen=true` ≠ 产品语义终谳（登记性校准 ≠ 语义定谳——产品席可后续另刀翻案）**。
- **裁 D** → 本刀产品=裁决记录（两分支论据 + 双审判读 + 产品席终裁输入），STOP；product-fix 另刀。
- **§4.3 任一判据不成立** → 原值记账 → 升级协调方（Ban 二改 · Ban retry-to-green）。
- 本 REQUEST（docs turn）不预claim 任何 post-commit EXIT、不预claim §3 判读结果、不预claim P/D 裁断结果。

## 7. Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not coding（本 turn 零代码改动 · 含 e2e harness/driver 代码与注释）· not 校准落地（落地须本刀全链 + 协调方 nail 登记）· **not report_unavailable 语义定谳（P/D 裁断归双审+产品席 · 本 REQUEST 只并陈）** · not product-fix 立项（D 路由的另刀事项）· not `GAP-CMOP03-POST7B` 定位/归因/处置（鉴别刀域）· not P2 行域处置 · not `:107` closed（P1 OPEN 不翻）· not C-MO-P3 行关闭 · not trio green（1/1/1 retained）· not suite green · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not covered · not `releaseEvidence=true` · not nail · not backlog 状态翻转 · not live（本 turn）· not meetwise authorize · `g7SuiteGreen=false` · trio OPEN · **`actualSpendCny=null`** · alone ≠ dual

---

*Harness · CMOP03-E 弱输入 report_unavailable 预期面校准刀（G7X nail 立项刀②·随刀① 后 · 刀① 已 nail @主线 `5a2994c4`）· 2026-10-08 · `draft:awaiting_pre_exec_dual` · docs-only · 两分支并陈不预设裁断（P=设计内常态：零可计分卡=弱输入定义性后果+聚合门确定性拒绝三处码面注记+quarantined 设计终态族+`:236-237` 现状已容两代实测兑现；D=scoring 供给面缺口→product-fix 另刀；双审含产品席视角判读 · 终裁归产品席/协调方）· P 校准=`:236-237` 断言本体零 diff+报告链钟（~10-12s ×2 段 · gate invoke 前抛零模型消耗）登记为旅程预期构成+时序脆弱面 F1-F3 显式化（Ban 改断言本体）· 预期面先于实跑冻结（CMD1 预期 EXIT=1 红于 post-7b 窗 · 判据≠EXIT=0 · 四判据：零 diff+钟分段+sidecar 实测+post-7b 零冲销）· sidecar 账本实测臂必须自带（刀① 账本不可达缺口承卷为前向纪律动因 · est ≤10/run 硬帽 ≤200 · SELECT-only）· Ban retry-to-green · `actualSpendCny=null` · Key name-only · `.env*` ABSENT · STOP*

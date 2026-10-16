# Receipt 01 — G7V EXEC 甄别读数（三读数随卷 · 臂证据 · A/B 定谳 · 仪器勘误随卷）

**Line**: G7V · **Date**: 2026-10-07（run UTC 窗口跨至 2026-10-08T00:27–00:35Z）· **Phase**: EXEC（甄别实验 + spec 校准）· **worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-g7v` · branch `line/g7v-early-stop`

## 七字段（甄别单次 run）

| 字段 | 值 |
|---|---|
| CMD 原文 | `E2E_UI_GREP="binds application to a new interview" node scripts/run-e2e-isolated.mjs e2e:ui`（runner 契约内透传 `run-e2e-ui.mjs:193` · 先例 `package.json:123` · 按 00-instrument §2 预注册执行 · **非 trio**） |
| EXIT | **1**（playwright tally **0 passed / 2 failed** · 双 project 同败于**未校准**旧终态腿 `waitForTerminalOrAnswer :52:14` 90s——预期败因：旧终态串在早停族各臂 UI 面均不可匹配，恰为本刀校准对象； journeys 本身双 project 完整走完） |
| 时间戳（UTC） | 2026-10-08T00:27Z → 00:35Z（chromium 2.8m @00:31:24Z · mobile 2.8m @00:34:2xZ） |
| 实跑 code | worktree `48f7fa5e`（= origin tip `10e25f38` + 仪器预注册 docs · **spec 当时= `af02699a` 未校准** · 校准 commit `92f70db7` 落于 run 后）；产品面 blob 链 run 后机检 20/20 全等（§3） |
| Key presence（name-only） | `MODEL_API_KEY=set`（loader source）· `.env*` ABSENT · Key 值/fingerprint 零入 receipt/log |
| 关键输出 | `[g7u-fixture] route_decided observed` ×2（chromium 3024ms / mobile 3025ms · `attempt_outcome=result_validated`）→ 双 project begin 通过 → 旅程推进至早停收尾：`session_concluded` conclude=**early_weak**@turn5（chromium）/ @turn4（mobile）· 结算臂：chromium=**扣费·报告暂不可用**（`report_unavailable` reason=`max_attempts_exceeded` · conclude 后 ~40s 到达）；mobile=**第三臂 `no_eligible_scored_answer`**（已扣费不释放 · UI 同现「额度已释放」文案） |
| 预算 | live est ≤30（2×classify + 2×旅程[各 ~4–5 回合×出题+评分] + 报告 worker 重试）≪ 200（est-not-counter）· **`actualSpendCny=null`** |

## 1. 仪器勘误（C-HA-V3 冻结投影 · G7W C-HA-1 先例路径 · 如实随卷）

00-instrument 预注册 SQL run 期实测两处**schema/type 事实错误**，修正逐字在卷（修正=事实纠偏非调参；批准面元数据/数值表达式全数保留）：

| 版 | 错误 | 实测报错 | 修正 |
|---|---|---|---|
| v1（预注册原文） | `created_at`/`event_key` 列不存在——`interview_event` 实列=`id/owner_user_id/stream_key/seq/kind/payload`（`packages/db/migrations/0001_baseline.sql:38` 亲读） | `column "created_at" does not exist` | 删两列；时序由 `ORDER BY stream_key, seq` 承担 |
| v2 | `payload->>'concludeReason'->>'code'` 首段 `->>` 返 text 后再 `->>` 非法 | `operator does not exist: text ->> unknown` | 嵌套取值改 jsonb 形 `payload->'concludeReason'->>'code'/'turn'`（mw-model-op E 节表达式语义同形 · SQL 类型事实修正） |
| v3（生效版 · 与 `.tmp/g7v-sidecar.mjs` 逐字一致） | — | — | 见下 |

```sql
SELECT stream_key, seq, kind,
       payload->>'competency' AS competency,
       payload->>'qkind' AS qkind,
       payload->>'turn' AS turn,
       payload->>'score' AS score,
       payload->>'outcome' AS outcome,
       payload->>'reason' AS reason,
       payload->'concludeReason'->>'code' AS conclude_code,
       payload->'concludeReason'->>'turn' AS conclude_turn
  FROM interview_event
  ORDER BY stream_key, seq
```

仪器缺口修复兑现（G7U v1 教训）：sidecar v3 **无连续 miss 提前停**，全 run 在线；v3 ndjson 101 ticks · 85 good · 16 tick 错误（超时如实逐 tick 记录 · 读数取自 good ticks · 末 good tick 含双 IV 完整时间线）。v1/v2 坏档留 `.tmp/g7v-sidecar.v1-broken.ndjson`/`.v2-operr.ndjson` 零删改。

## 2. 三读数（C-HA-V4/C-MO-V1 · 逐 project）

### chromium · `iv_8d3e2138-62f0-4892-a44e-de9b6213aa02`（10 events）

| seq | kind | competency | qkind | turn | score | outcome |
|---|---|---|---|---|---|---|
| 1 | question_ready | 项目经验 | fundamental | 0 | | |
| 2 | answer_evaluated | 项目经验 | | 0 | **40** | answered |
| 3 | question_ready | 项目经验 | fundamental | 1 | | |
| 4 | clarification_needed | 项目经验 | | 2 | | |
| 5 | answer_evaluated | 项目经验 | | 2 | 0 | **unresolved** |
| 6 | question_ready | 技术深度 | fundamental | 3 | | |
| 7 | clarification_needed | 技术深度 | | 4 | | |
| 8 | answer_evaluated | 技术深度 | | 4 | 0 | **unresolved** |
| 9 | **session_concluded** | | | | | **conclude=early_weak@turn5** |
| 10 | **report_unavailable** | | | | | reason=**max_attempts_exceeded** |

**臂=扣费·报告暂不可用**（unscored=0 ∧ eligible≥1[t0 score=40 answered] → completeInterviewAndConfirm 已扣费 + enqueueReport → 报告 worker 重试耗尽 `max_attempts_exceeded`，conclude 后 ~40s 到达）。

### mobile · `iv_8d0ee32e-f714-4a18-a4e5-76bed0a622fa`（8 events）

| seq | kind | competency | qkind | turn | score | outcome |
|---|---|---|---|---|---|---|
| 1 | question_ready | 项目经验 | fundamental | 0 | | |
| 2 | clarification_needed | 项目经验 | | 1 | | |
| 3 | answer_evaluated | 项目经验 | | 1 | 0 | **unresolved** |
| 4 | question_ready | 技术深度 | fundamental | 2 | | |
| 5 | clarification_needed | 技术深度 | | 3 | | |
| 6 | answer_evaluated | 技术深度 | | 3 | 0 | **unresolved** |
| 7 | **session_concluded** | | | | | **conclude=early_weak@turn4** |
| 8 | **assessment_unavailable** | | | | | reason=**no_eligible_scored_answer** |

**臂=第三臂 `no_eligible_scored_answer`**（unscored=0 ∧ eligible=0[双 unresolved] → `completeInterviewAndConfirm` **已扣费不释放** + `markApplicationNoEligibleScore`）——**C-HA-V1 所指 UI 文案相悖本 run 实测命中**：该臂经同一 SSE 通道达 UI 同现 view-model.ts:68「本次预留额度已释放」文案，而钱面为已确认扣费（G7U EXEC 收据当轮 chromium 的「额度已释放」alert 同属此不可分辨面——当时无 reason 读数，如实注记）。

### 判读（C-HA-V4 纪律逐条）

- **① 出题分布（定性主判别）**：双 project 均**恰探 2 门**能力（项目经验/技术深度 · 规划官 plan 族），qkind 全为 `fundamental`；批准面（元数据）内**无系统性离域证据**——题目身份与所探能力一致、逐轮新题/追问结构正常。题面原文按 Ban 面未读（文本面 Ban 的设计代价：离域精判以 competency/qkind 元数据+评分语义承担，如实声明）。
- **② 评分轨迹（单独不判别 · 与①联合）**：chromium 首个 substantive 作答 40 分（answered · 中低带）其后两次 0 分 unresolved；mobile 全为 0 分 unresolved（clarification 循环后未决）。与①联合：供给正常出题、固定单条脚本答案无法为多门能力供证 → 评估官走 clarify→unresolved——**与「脚本弱输入」预期一致**；「均匀错配」假设在①无离域证据支撑下不被触发。
- **③ 开火时点（判路径不判 A/B）**：conclude_turn=5/4，均 ≥ `WEAK_MIN_TURNS=4` → **weak 信号路径开火**（`decideNext:416` 先于覆盖路径；两 project 一致）。
- **臂证据（批准面 `reason` 字段 · 非三读数但同卷）**：双 project 分落**两枚不同结算臂**（chromium=报告暂不可用 · mobile=**第三臂**）——跨 run 臂方差实证（G7U EXEC 面alert 文案方差 + 本 run reason 读数互证），释放臂（`evaluation_unscored`/status='failed'）本 run 未观测但码面可达（`:357-365`）。

## 3. A/B 定谳

**定谳：分支 A（早停=产品正确行为 → spec 断言校准刀）**，诚实形态=「**与脚本弱输入预期 + 码面语义一致**」，非「运行时实证」（C-HA-V4(d)）：①无系统性离域证据（B 触发判据不满足 · 仅低分不触发 B）；②评分轨迹与固定脚本输入的弱供证一致；③weak 路径按设计阈值开火、投影 fail-closed 零违。**甄别读数随卷背书 A（C-HA-V6 兑现）**；分支 B（供给/评分错配修复刀）本刀不触发、留活不闭。

**第三臂升级披露（C-HA-V1 · 本 run 实测命中 1/2）**：`no_eligible_scored_answer` 臂 UI 文案「本次预留额度已释放」与已扣费结算（`completeInterviewAndConfirm`）**码面相悖 + 运行时复现**——校准 spec 将该臂落字为**诚实红**（钱面守卫 `status='completed' ∧ 释放文案` → named FAIL）；**产品文案/结算一致性修复不在本刀授权域（早停语义零触碰 · C-MO-V4），升级协调方另派**。

## 4. 校准落码（commit `92f70db7` · +52/−5 · 恰 spec 一文件）

- **定锚层**：`toHaveText(EARLY_STOP_COPY)`（`view-model.ts:10` 逐字 · `data-testid="signal-conclude-reason"`）90s 无条件断言——正常完成（无 session_concluded）到达=诚实红。
- **分支守卫层**：先钱面锚（`GET /interview/:id` status poll · `failed`=已释放/`completed`=已扣费），再按臂 exact 文案断言——释放臂（`本次预留额度已释放` ∧ failed）/ 扣费·报告就绪臂（`练习完成 · 本次练习反馈` ∧ completed + `:194` finalize poll）/ 扣费·报告暂不可用臂（`报告暂时无法生成` ∧ completed + finalize poll）。
- **第三臂落字**：`status='completed' ∧ 释放文案` 组合 named FAIL（spec 注释逐字点名 + 升级披露文案）——不作 PASS 容忍面。
- **禁则兑现**：零宽正则（全部产品文案逐字子串）；race/`Promise.any` 仅作臂甄别与结构等待，PASS 谓词=各臂 exact 文案+钱面守卫联合；三臂全容忍（Ban 单臂钉死）。
- **触碰面机检**：`git diff --numstat`=52/5 恰 spec；夹具 helper 块（`waitForRouteDecided`）零 diff；非终态断言（URL binding/`:102-104` applications 形状/`:195-198` B 端隐私面）零 diff；旧终态串 `/面试完成 · 综合评分|报告暂不可用/` 三处全数移除（该串在现行 UI 各臂均不可匹配=校准对象本体）。
- **产品码 blob 链 run 后机检（C-MO-V2/V4）**：20 面亲算全等（`71d1bd0d`/`a9214288`/`b7e5ab3d`/`2e691d0f`/`0a6eeda8`/`f0220c82`/`288eb311`/`7c4b0d39`/`6a942e8e`/`fbea8aeb`/`18004851`/`a64784e8`/`69ca4633`/`a7cb43cc`/`24f0eed5`/`d06b4f49`/`ec9b3fe1`/`13dbfc43`/`0afb3bd2`/`e2e/full.e2e.ts`=`7d65d0f3`）——早停语义零触碰 + G7T v2 零回滚 + withhold/occupied 零动，全数 EQ。

## 5. V5/C-MO-V2 结算敏感面实证回填（Ban 预claim · 如实）

- **`:194` finalize poll**：码面=finalize 于三终相自动 POST（`InterviewPanel.tsx:99-101`），三臂均 200（`recruiter.ts:200` replayed / `:203` assessment_unavailable 路径；释放臂 application 已被 done-tx mark → 200；报告臂 in_progress+completed → UPDATE → 200；第三臂已 mark → 200）→ **`:194` 原样保留零改动**；本甄别 run 页面在终相确已自动触发 finalize（useEffect 通道），但未校准 spec 败于 `:193` 前腿、网络级读数未采——**200 实证闭环留 trio CMD2 校准面**（非 200→如实分类/红）。
- **`:196-198` B 端面**：三臂 application 终均 `assessment_unavailable`（done-tx mark 或 finalize mark）→「评分暂不可用/零『已完成』」跨臂成立——零 diff 保留，trio 读数回填。

## 6. Non-claims

Not trio · not prove（本 phase 甄别+校准 · trio 留 prove 阶段 C-MO-V6 纪律）· not CMD2 PASS（校准面读数未跑）· not `g7SuiteGreen=true` · not release arm 实测（码面可达未观测）· not 产品修复（第三臂文案相悖升级协调方 · 早停语义零触碰）· not A 的运行时证明（诚实形态=与预期一致）· not 分支 B 关闭（留活）· Pins 十值零翻转（`g7SuiteGreen=false` · trio OPEN 1/1/1 · `actualSpendCny=null` · haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503）· alone ≠ dual

---
*Receipt 01 · G7V EXEC 甄别读数 · 2026-10-07/08 · 三读数随卷（分布=2 门在域无离域证据 · 轨迹=脚本弱输入一致 · conclude=weak 路径 @turn4/5）· **定谳=分支 A**（诚实形态）· 第三臂实测命中（UI 释放文案 vs 已扣费=相悖 · 升级披露）· 仪器勘误 v1/v2→v3 逐字在卷 · 校准 `92f70db7` +52/−5 恰 spec · 产品 blob 20/20 EQ · est ≤30 ≪ 200 · `actualSpendCny=null` · STOP*

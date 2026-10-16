# Receipt 00 — G7V EXEC 甄别仪器预注册（C-HA-V3/C-MO-V3 冻结投影一次成型 · **run 前 committed** · 零调参承诺）

**Line**: G7V · **Date**: 2026-10-07 · **Phase**: EXEC（甄别实验 + spec 校准阶段 · 协调方授权）· **授权链**: REQUEST `14f507e9`（本线 twin `1c4ad23a` patch-id 全等）→ pre-exec dual BOTH PASS（mw-e2e-ha `05da6668` C-HA-V1~V7 + mw-model-op `f4b481ad` C-MO-V1~V7）→ 协调方 EXEC 授权 · **Base**: origin tip `10e25f38`（worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7v` · branch `line/g7v-early-stop` · rebase 后 = origin tip · 本 REQUEST twin 由 rebase 摺叠承卷）
**预算申报**: 甄别单次 run（est ≤40 live：2×classify + 2×面试旅程[每旅程 ~3–5 回合×出题+评分] + 构建期零 live · est-not-counter）· 全程 ≤200 硬上限 · `actualSpendCny=null`（无计价数据源 · Ban invented spend）· Key 只经进程环境（`~/.meetwise-secrets/load-model-api-key.sh` source · name-only）· `.env*` ABSENT

## 1. 冻结投影（C-HA-V3/C-MO-V3 共批版 · 逐字一次成型 · run 期零修改）

```sql
SELECT stream_key, seq, kind, event_key, created_at,
       payload->>'competency' AS competency,
       payload->>'qkind' AS qkind,
       payload->>'turn' AS turn,
       payload->>'score' AS score,
       payload->>'outcome' AS outcome,
       payload->>'reason' AS reason,
       payload->>'concludeReason'->>'code' AS conclude_code,
       payload->>'concludeReason'->>'turn' AS conclude_turn
  FROM interview_event
  ORDER BY stream_key, seq
```

- **批准面依据**：两审 E/R4 节冻结表达式逐列全等（kind/event_key/created_at + competency/qkind/turn/score/outcome/reason + concludeReason code/turn）；`stream_key`（=interviewId 流身份元数据）+ `seq`（单流内排序）为 mw-model-op E 节「stream_key 限本测自家 interview 流」的过滤/分组元数据，非文本面。
- **Ban 面（本投影零出现 · 违反=post-prove FAIL）**：`payload->>'question'`、`payload->>'hint'`（题面原文 · mw-e2e-ha R4 逐字段 Ban）、整列 `payload`、`ai_invocation_trace` 任何列、`interview_job.payload`、任何写语句（SELECT-only）。
- **三读数映射（C-HA-V4/C-MO-V1）**：①出题分布=`kind='question_ready'` 的 competency/qkind 分布（定性主判别 vs route 叶域）；②评分轨迹=`kind='answer_evaluated'` 的 score/competency/outcome 轨迹（单独不判别 · 仅与①联合）；③开火时点=`kind='session_concluded'` 的 conclude_code/conclude_turn vs `WEAK_MIN_TURNS=4`（判哪条路径开火 · 不判 A/B）。附臂证据=`kind='assessment_unavailable'` 的 `reason`（`evaluation_unscored`=释放臂 / `no_eligible_scored_answer`=第三臂）+ `report_ready`/`report_unavailable` kind（报告结算面）。

## 2. 甄别 run 形态（单次 · 不重试）

| 字段 | 值 |
|---|---|
| CMD | `E2E_UI_GREP="binds application to a new interview" node scripts/run-e2e-isolated.mjs e2e:ui`（过滤=runner 契约内透传 `run-e2e-ui.mjs:193` · 先例 `package.json:123` `uc018:ui:prove`；**非 trio**——trio 三 CMD 各恰一次留 prove 阶段按 C-MO-V6 纪律另行执行） |
| 范围 | recruiting-bound 单测 · **双 project**（chromium+mobile · G7U 残留面 4/4 样本同 context）· worker 不 skip（classify+adaptive+report 消费链全程） |
| Key | loader source 进程环境 · name-only · `.env*` ABSENT 亲扫 |
| 仪器 | `.tmp/g7v-sidecar.mjs`（gitignored · .tmp 落点纪律）——周期 2s · 单 tick 超时 2.5s · **无连续 miss 提前停**（G7U v1 仪器缺口修复：仅 stop-file 或 maxMs=30min 结束 · miss 逐 tick 如实记）· 输出 `.tmp/g7v-sidecar.ndjson` |
| cap | sidecar maxMs=1800000（30min 硬墙 · EXEC 定值一次成型）· tick 超时=诚实记 `error` 不改判；run 期望墙钟 ≤15min（G7U CMD2 全程 7.3m 上界 + build） |
| 单次纪律 | 甄别读数恰 1 次 run · Ban 借甄别名义反复轮询制造 flake（C-HA-V5 R5）；run 失败/仪器缺口=如实分类回协调方，Ban 空读改判 |

## 3. 判读预注册（C-HA-V4 纪律 · run 前落字）

- ①出题分布=**定性主判别**（码面无数值错配阈值 · Ban 发明数值判准）：question_ready competency 落域 vs route 叶域 → 系统性离域=分支 B 触发判据（mw-model-op C.3 收窄版）；在域=与脚本弱输入预期一致。
- ②评分轨迹**单独不判别**（固定答案跨能力一致性低分与「脚本本身弱」及「均匀错配」两假设相容）——仅与①联合判读。
- ③conclude_turn vs `WEAK_MIN_TURNS=4` 判**哪条早停路径开火**（weak 路径 turn≥4 vs 覆盖路径 turn≥2+aborts≥2），**不是 A/B 判别器**——收据如实表述。
- **A 定谳诚实形态**=「与脚本弱输入预期+码面语义一致」，非「运行时证明」（无错配证据 ≠ A 实证 · C-HA-V4(d)）。
- 无读数的 A 定谳=退回（C-HA-V6）。

## 4. spec 校准设计预注册（分支 A 落地形态 · 多臂三层 · run 后按实测臂证据落码）

- **定锚层（无条件）**：早停 copy 精确串 `练习因持续偏弱或多次未决提前结束（自适应控制流，不是能力等级或招聘结论）`（`view-model.ts:10` 逐字 · 元素 `data-testid="signal-conclude-reason"` role=status）双 project 到达。
- **分支守卫层（按实达终相分臂 · 各臂绑 `adaptive-lifecycle.ts:339-365` 结算语义+钱面后果）**：
  - **释放臂**（unscored>0 → `failInterviewAndRelease` + `assessment_unavailable:evaluation_unscored`）：alert 前缀 `本次预留额度已释放`（`view-model.ts:68` 逐字子串）+ **钱面守卫** `GET /interview/:id` → `status='failed'`（`interview.service.ts:47` status 暴露 · 释放=failed）+ application `assessment_unavailable` 可重试。
  - **扣费·报告就绪臂**（unscored=0∧eligible>0 → complete+enqueueReport 成功）：`练习完成 · 本次练习反馈`（`InterviewPanel.tsx:407`）+ `status='completed'` + finalize poll 200（`:194` 原样）。
  - **扣费·报告暂不可用臂**（同上但报告生成失败）：alert 前缀 `报告暂时无法生成`（`view-model.ts:66` 逐字子串 · **已扣费** · `business-events.ts:55` 语义 Ban 写「已释放」）+ `status='completed'` + finalize poll 200。
  - **第三臂 `no_eligible_scored_answer`（`adaptive-lifecycle.ts:342-356`）——落字不作 PASS 容忍面（C-HA-V1）**：其落字事件与释放臂同 kind（`:355` vs `:364`），经同一 SSE 通道（service `:933`）达 UI 同现 `:68`「额度已释放」文案而该臂 `completeInterviewAndConfirm` **已扣费不释放**——UI 文案释放声称与结算事实码面相悖。处置=钱面守卫识别（banner 同释放臂但 `status='completed'`）→ **诚实红 + 五分类 + 升级披露**，Ban 断言其为 PASS。
- **禁则层**：Ban 单臂钉死（G7U 4/4 样本实证双臂）；Ban 宽正则「任意文案皆可」（各臂用产品文案逐字子串）；Ban race 式 OR 作 PASS 谓词（race 仅作**臂甄别**，PASS=各臂 exact 文案+钱面守卫联合断言）。
- **触碰面锁定（C-HA-V5）**：恰终态断言区（helper terminal leg `:49` + `:189` + `:193` 及其直接辅助行）；夹具 helper 块（`waitForRouteDecided`）零 diff；非终态断言（URL binding / `:102-104` applications 形状 / `:195-198` B 端隐私面）零 diff；产品码 blob 链前=链后全等机检强制（十六面基线集 · EXEC 按 tip 重核）。
- **`:194` finalize 回填口径（C-HA-V5/C-MO-V2 · Ban 预claim）**：码面=finalize 于三终相均自动触发（`InterviewPanel.tsx:99-101`）且各臂 200（`finalizeInterviewReport` replayed/assessment_unavailable 路径 · `recruiter.ts:200/:203`）；实证=本甄别 run 臂证据 + trio CMD2 校准面读数双节点回填，非 200→如实分类/红，Ban 静默删除断言。

## 5. Non-claims（仪器预注册段）

Not a reading（本段 run 前落字 · 零读数）· not A/B 定谳（run 后据三读数）· not 校准落码（后继 commit）· not trio · not prove · `g7SuiteGreen=false` · trio OPEN（1/1/1 retained）· Pins 十值零翻转 · `actualSpendCny=null` · alone ≠ dual

---
*Receipt 00 · G7V EXEC 甄别仪器预注册 · 2026-10-07 · 冻结投影 run 前 committed 一次成型（C-HA-V3）· 判读预注册（C-HA-V4）· 校准设计预注册（C-HA-V1/V2/V5 · C-MO-V2/V4）· 单次 run 纪律 · est ≤40 ≪ 200 · `actualSpendCny=null` · STOP*

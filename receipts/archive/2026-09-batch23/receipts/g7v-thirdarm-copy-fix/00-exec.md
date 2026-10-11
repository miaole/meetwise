# Receipt 00 — G7V-FIX EXEC（rebase 硬门 + coding + 机检四强制 + 主证/副证 run 七字段 · 落臂矩阵①命中如实）

**Line**: G7V-FIX · **Date**: 2026-10-07（run UTC 窗口 2026-10-08T02:29–02:37Z）· **授权链**: REQUEST rev1 `c12702dc` → 预执行双审 FAIL → rev2 `05084b11` → 预执行重审 BOTH PASS（mw-model-op + mw-e2e-ha）→ 协调方 standing authorize EXEC（严格按 rev2 harness 契约）
**Worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-g7v-fix` · branch `line/g7v-thirdarm-copy-fix` · **`.env*` ABSENT**（`ls .env*` glob 无匹配 · 全 turn 未写任何 env 文件）· Key 只经 `~/.meetwise-secrets/load-model-api-key.sh` loader source 进程环境（name-only，值零入卷）· **`actualSpendCny=null`**（无计价数据源）· **est ≤30 live**（2×classify + 2×旅程[各 ~4–5 回合×出题+评分] + 报告 worker 重试项[本 run 未触达报告重试面=低于估算]）≪ 200 硬帽（est-not-counter）

## §3.0 rebase 硬门（动码前 · 两席共同处方）

`git fetch origin`（EXIT=0 · tip=`fe218b7a` 实测）→ `git rebase origin/feat/mysql-schema-skeleton`（**EXIT=0 · 零冲突 · 零顺手改码**）。rebase 后链：`fe218b7a` ← `00bdfd5e`（rev1 twin，pre-rebase `c12702dc` patch-id 摺叠）← `298c9c79`（rev2 twin，pre-rebase `05084b11`）。
**机检④**：**rebase 后 HEAD SHA（coding base）= `298c9c79e43eccdbe122f34cb700bda28d132b3a`**；coding commit = `4faa61ef169ea0b4069f42b8084ad024fae8b784`。
按当 tip 重核 §1.2 锚表（实测全等 · docs-only 前进零碰码）：view-model `71d1bd0d` · adaptive-lifecycle `288eb311` · commerce `a64784e8` · spec `2b232748` · business-events `b7e5ab3d` · interview-state `a9214288` · web-logic.proof `ee9505f5` · recruiter `d06b4f49`（+旁证面 InterviewPanel `ec9b3fe1` · jobs page `6912cd61`）；行号回填：spec `:59`/`:216-220`/`:221`/`:225-230`/`:232`/`:233-239`/`:241`/`:245`、view-model `:67-68`、interview-state `:122`、lifecycle `:341/:346/:353/:355-356/:361/:364`、commerce `:163/:198`、recruiter `:200` —— 与 rev2 申报全等。

## Coding（恰两文件 · commit `4faa61ef`）

`apps/web/lib/stream/interview-state.ts`（**+4/−1**）：`InterviewView` 增可选字段 `assessmentUnavailableReason?: string`（`:47-49` · `signalConcludeReason?:46` 同构先例）+ `:125` 落定处 `next.assessmentUnavailableReason = e.data.reason` + 随行注释修正（「无可信评分且已释放预留」→ reason 分臂注记）——phase/degraded/终态语义零改动。
`apps/web/lib/view-model.ts`（**+11/−1**）：`case 'assessment_unavailable'`（`:67-81`）按 `v.assessmentUnavailableReason` 三分派——①`no_eligible_scored_answer` → 初稿 B 全形逐字；②`evaluation_unscored` → 现行释放文案逐字保留；③未知/缺失 → fail-closed 中性（不冒认资金变动）。heading/spinner/action/degraded/signalConclude 结构零改动。

## 机检四强制（全过）

1. **触碰面形**：`git diff --numstat` = 恰两文件（interview-state +4/−1 · view-model +11/−1），diff 形状=申报变更（plumb + reason 三分派），零越界 hunk。
2. **blob 等值**：六禁改面（adaptive-lifecycle `288eb311`/commerce `a64784e8`/business-events `b7e5ab3d`/recruiter `d06b4f49`/spec `2b232748`/web-logic.proof `ee9505f5`）+ 旁证面（InterviewPanel `ec9b3fe1`/jobs page `6912cd61`）——base `fe218b7a` vs coding `4faa61ef` **8/8 全等**（`git rev-parse <sha>:<path>` 逐面亲算）。
3. **正负双向逐字**：负面禁则字表「已释放/释放/退还/退回/补偿/稍后自动」（外加「暂时」「报告暂时无法生成」锚词）对第三臂**渲染串**逐 token=**0**；正面扣费主句「已完成并扣费结算」逐字在案（=1）；释放臂文案逐字保留（=1）；**运行时渲染全文入卷**：mobile 失败现场 a11y 快照（`mobile-thirdarm-runtime-snapshot.excerpt.md` ← `error-context.md:106`）：`面试已完成并扣费结算，但未获得可信评分，本次不生成报告。岗位面试可从“我的投递”重新开始；其他面试可新建一场。` ——与初稿 B 逐字吻合（真实 UI 渲染 · 非码面推读），`:105` 早停锚 copy 同帧在案、`:107` 「前往我的投递」按钮=非死胡同出口保持。
4. **rebase 后 HEAD SHA**：`298c9c79e43eccdbe122f34cb700bda28d132b3a`（§3.0 · 上文）。

## CMD 七字段（逐 attempt 全记录 · Ban retry-to-green 契约内如实分档）

| # | CMD | EXIT | UTC 窗口 | 分类 | 关键输出 |
|---|---|---|---|---|---|
| 副证 attempt#1 | `pnpm -C apps/web prove` | **1** | 02:29:48Z | **env-not-ready（infra abort · 非产品红）**：worktree 新建无 node_modules，`tsx: command not found` | 测试未起跑=无产品读数；环境准备 `pnpm install --frozen-lockfile`（EXIT=0）后下方 attempt 为唯一有效 attempt |
| 副证 attempt#2（唯一有效） | `pnpm -C apps/web prove` | **0** | 02:30:56Z→02:30:58Z | PASS | 「✓ 全部通过」；`web-logic.proof.ts:71`「assessment_unavailable → 独立终态、额度已释放提示并导向我的投递（不冒充报告不可用）」**PASS**=释放臂（evaluation_unscored 夹具）逐字保留兑现、零 diff 期望兑现 |
| 主证 attempt#1（唯一 attempt） | `cd /Users/miaole/Desktop/golucky/meetwise-line-g7v-fix && set -a && source ~/.meetwise-secrets/load-model-api-key.sh && set +a && E2E_UI_GREP='C→B: real browser binds application' pnpm e2e:ui:isolated` | **1** | 02:31:35Z→02:37:29Z | **落臂矩阵①命中（预declared 已知代价形态 · 矩阵外零形态）** | chromium ✓ PASS（1.7m）· mobile ✘ FAIL（3.4m）· `1 failed, 1 passed (5.1m)`；ISOLATED_POSTGRES_OUTPUT_WITHHELD + client_exited 为 runner 收尾 withheld 面（随 EXIT=1 原值随卷） |

原始 log 三份随卷：`mainprove.raw.log`（105 行）· `subprove.attempt2.raw.log` · `subprove.attempt1.infra-abort.raw.log`。

## 落臂矩阵判读（rev2 §3.1 契约逐条）

- **①命中（mobile=第三臂 `no_eligible_scored_answer`）**——**两断言面读数**：
  - **named 诚实红 `:229-230` = 通过**（修复合同兑现）：`releasedCopyOnCharged=false`——执行越过 `:230` 行进至 `:232`（失败栈指 `:232` 而非 `:230`；若 `toBe(false)` 失败栈必指 `:230`）= 初稿 B 渲染下 UI 无 `RELEASED_MSG_PART` 子串，第三臂 UI 资金谎报回归门就此立起。
  - **`:232` 超时门 = FAIL（在案已知代价 · rev2 锚对齐改判申报面）**：`AggregateError: All promises were rejected`，双等待各 `TimeoutError: Timeout 120000ms exceeded`（'报告暂时无法生成' / '练习完成 · 本次练习反馈'）——初稿 B 无锚词 → 仪器无报告面可等 → 恰红于预declared 门。**EXIT=1 原值记录，Ban 归咎修复刀、Ban 洗；仪器校准另刀（completed∧assessment_unavailable 正向断言）升级协调方裁决。**
- **② 非第三臂臂（chromium）**：PASS——零改动面断言（释放/报告就绪/报告暂不可用族）零回归。落臂具体面无直接运行时读数（runner 输出 withheld + 容器已被 wrapper 清理）：PASS 与释放臂/扣费报告臂断言均相容；时长无 ~40s 报告 worker 等待段、**偏释放臂为推断非读数，如实注记**。
- **③ not-demonstrated 未命中**：mobile 已行使修复（第三臂落臂 + named 红转绿 + 渲染全文在卷）。
- **矩阵外红形态**：零（mobile 失败恰为 `:232` 预declared 形态，无其他失败点）→ 不触发迭代刀（①类非零=在案已知代价，rev2 §3.1 契约明列）。

## Non-claims

not a pass（EXIT=1 原值在卷 · 唯一 attempt · 未重跑）· not 仪器校准（另刀归协调方）· not trio green · not suite green · not `g7SuiteGreen=true` · not nail · not covered · not chromium 落臂面定谳（推断非读数如实注记）· not HA · not `releaseEvidence=true` · not backlog 状态翻转 · not post-prove（归协调方派）· `g7SuiteGreen=false` · trio OPEN（1/1/1 retained）· 红① STILL OPEN（状态行归协调方）· **`actualSpendCny=null`** · alone ≠ dual

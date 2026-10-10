# CMOP03-D · GAP-CMOP03-POST7B post-7b 末段红两岔鉴别刀 · REQUEST（docs-only）

status: **`draft:awaiting_pre_exec_dual`**（REQUEST 就绪 · 预执行双审未做 · meetwise 未授权 EXEC · 本 commit 零码零埋点零实跑——埋点属下轮 coding 面）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

## 0. Base line 与 worktree 披露

- fetch 2026-10-08：`origin/feat/mysql-schema-skeleton` = `cb89c23d195ecc6fcb9b8f04a753f87f9607ce96`（≥ cb89c23d 达成；本地同名分支已 ff 至同点）。
- 本刀 worktree：`/Users/miaole/Desktop/golucky/meetwise-line-post7b`（仓库根同级新建）；分支 `line/cmop03-post7b-discriminator`（新立自 `origin/feat/mysql-schema-skeleton`，跟踪同名 upstream）。
- 立项出处：**协调方 CMOP03-D · GAP-CMOP03-POST7B 鉴别刀（刀① nail 登记中——本文引用之，不自建 SSOT 行）**。红读数系协调方卷面记载，本 REQUEST 未实测（docs-only · 零实跑）。
- 全部 blob/行号锚均为 mw-core 在本 worktree 于 base 点以 `git ls-tree` / `git rev-parse` 亲算，非转录：

| 文件 | blob @ cb89c23d |
| --- | --- |
| `e2e/full.e2e.ts` | `7d65d0f35e3924225c949471bfbb83094d5d4330` |
| `e2e/helpers/failure-class.mjs` | `102d0f3ad34c30eb28bcb734b3c4bf5de53b0846` |
| `e2e/helpers/interview.ts` | `c8e63f414b7f9add45579645385932e974ce75fc` |
| `e2e/helpers/assert.ts`（反伪造钉②） | `975fbb3848c2df29cbf6e891bfa5e0926cf57bdc` |
| `e2e/helpers/sse.ts`（反伪造钉①） | `9bba015d6b3f65a9c8ac26c2036422a92ff458c6` |
| `scripts/run-e2e-isolated.mjs`（反伪造钉③） | `13dbfc43c744511644649ae310696a13ee2f20f7` |
| `packages/ai-runtime/src/model-operation-registry.ts`（反伪造钉④） | `63af556fd16696c8756ddefb8a6317d9495f05ff` |

## 1. 红事实与死亡窗解剖（REQUEST 必写①）

**红读数（协调方立项卷 · 非本刀实测）**：旅程末段红——死亡窗 **∈(:256, :356]** · **class=api** · **78798ms** · 首达；行域锚 `e2e/full.e2e.ts`（blob `7d65d0f3` @ base）。窗界语义：`:256`（7b 诊断终态断言绿）**之外**为窗开，`:356` 断言**之内**为窗闭。

**窗内解剖（码面亲读 @ 7d65d0f3）**：

- `:258-:301` = **driver step8/9 区**：B 端招聘方发岗/幂等/门禁/RLS（`:258-:282`）+ 候选人闭环浏览/投递/多方 RLS（`:284-:301`）。
- `:303-:356` = **专家评审段（异常/特殊/兜底/状态机）**：无额度异常面 `:304-:315` · webhook 错签/未知单 `:317-:322` · 防伪造 finalize `:324-:331` · 岗位绑定 start/幂等 `:333-:342` · bound begin `:344-:345` · **boundLoop**（`driveInterviewToTerminal` 调用）`:346-:354` · recordTerminal `:355` · **`:356` 死胡同断言**（`A(boundLoop.questions >= 1 && …)`）。

**两岔**：岔A = 红点落 step8/9 区 `(:256, :301]`；岔B = 红点落 `(:301, :356]` 专家评审段——含 **boundLoop 内部 throw** 与 **`:356` 死胡同** 两子型。

**为何现存 receipt 不可判（鉴别缺口本体）**：`A()` fail-fast 默认 `class='api'` `code='assertion'`（`assert.ts:10-16`）；`main().catch` 未捕获异常落 `class='api' code='client_uncaught'`（`full.e2e.ts:383-385`）；boundLoop 内部 throw 全族为 typed `e2e_*`（`interview.ts:80-179`）逃逸至同一 catch——三者同落 class=api，receipt 的 failure class/code 在本窗内**零鉴别力**；精确致死行不在 receipt 可读面（stderr 断言原文 withhold 契约内不可回读）。故须分段心跳。

## 2. 鉴别机制①：driver 侧分段埋点（下轮 EXEC 处方 · 本 REQUEST 零码）

**发射通道裁定**：埋点行以 **`reviews.record({ class: 'worker', code: 'seg_*' })`** 落账（`full.e2e.ts:22` 既有 `createE2EReviewLedger()` 实例 · `E2E_REVIEW` 行 stdout+stderr 双出 · reviewLedger 已是 receipt 一等公民，下轮 receipt 即可分段定位）。**不采用 `emitE2EFailure`**——其打印 `E2E_FAILURE` 行，绿 run 会被 `evaluateIsolatedHttpE2E` 判 `success_with_failure_class` 拒收（`failure-class.mjs` 绿门）；任务书「emitE2EFailure 形态」按**意图**（结构化 ledger 行 · 分段定位）落实为 `E2E_REVIEW` 通道，形态变体在此显式披露，交预执行双审裁。

**埋点点位清单（7 点 · 恰 7 行 `reviews.record` 纯插入 · 零行删除零行改写）**：

| # | 锚（full.e2e.ts @ 7d65d0f3） | 插入位置 | code | 命中读数含义 |
| --- | --- | --- | --- | --- |
| M1 | `:256` 后 | `:257`（空行处） | `seg_diag_green_enter` | 7b 诊断断言已绿=死亡窗已进入 |
| M2 | `:258` 后 | step8 首行 `:259` 前 | `seg_step8_enter` | 已入 step8 B 端区 |
| M3 | `:301` 后 | `:302`（空行处） | `seg_step9_green` | step8/9 区全绿（岔A 排除） |
| M4 | `:303` 后 | `:304` 前 | `seg_expert_enter` | 已入专家评审段（岔B 确认） |
| M5 | `:333` 后 | `:334` 前 | `seg_bound_start_enter` | 已入岗位绑定 start 面 |
| M6 | `:346` 前 | boundLoop 调用行前 | `seg_boundloop_enter` | 已入 boundLoop（岔B·子型1 域） |
| M7 | `:355` 后 `:356` 前 | recordTerminal 与断言之间 | `seg_boundloop_terminal` | boundLoop 已返回且 terminal 已记账（岔B·子型2 域） |

M6/M7 为「boundLoop 内部 throw vs `:356` 死胡同」两子型拆分所必需：末心跳=M6 → 抛点在 `driveInterviewToTerminal` 内部（typed `e2e_*` 逃逸）；末心跳=M7 → `:346-:354` 已完整返回、死在 `:356` 断言本体。

**账本预算（绿 run 兼容性亲算）**：绿 run 既有 ledger 行 5-7（terminals ×5 + capability 缺 Key 面 ×0-2）+ 7 埋点 = **12-14 ≤ 32**（`REVIEW_LEDGER_LIMIT`）；`E2E_REVIEW_SUMMARY count` 与 `collectE2EReviews` 同源自 entries，`review_summary_mismatch` 绿门自动一致。UC018 abandon-only 提前 return 路径（`:129-137`）全埋点在其后，零影响。

**三零保证**：① **零 A() 断言变更**——埋点为纯插入，A() 断言本体逐字节零 diff（M7 位于 `:355` 与 `:356` 之间但不触碰 `:356` 文本）；② **零 withhold 契约触碰**——分段标记是 `E2E_REVIEW` 通道结构化行，**≠stderr 断言原文回读**，`run-e2e-isolated.mjs`（`13dbfc43`）withhold 面零触碰；③ **零产品码**——EXEC 面唯一改动文件 `e2e/full.e2e.ts`（e2e harness 面）。

**静态门兼容（亲读 `scripts/e2e-static-guards.mjs`）**：对 `full.e2e.ts` 的 required（`interview_helper_import`/`interview_helper_call` ≥3 处/`scoreless_bound_null_score`）与 forbidden（本地 shadow `driveInterviewToTerminal`/`if(false)` 死调用/伪造 0 分断言/`questionId` 模板串）与 `reviews.record` 插入行互斥相交零冲突。

## 3. 鉴别机制②：sidecar 账本实测臂（model-op 前向纪律兑现）

**先例引用（G7X T-1 · 只引不改）**：`execution-master-checklist.md` G7X nail 节（`:1372-1381`）——恰 1 判别 run · sidecar 冻结投影 · **live=7=`ai_model_invocation` 账本实测 succeeded 5+failed 2** · N1b 表名纠偏 · withhold 零触碰 · sidecar 产物 `.tmp/` 不入 git。

**本刀臂**：同一 T-1 判别 run 内并行 sidecar（**SELECT-only · G7X 冻结投影原样复用 · 1000ms EXEC 定值 · Ban 新发明查询**）+ run 终局 `ai_model_invocation` 账本实测（`packages/db/migrations/0037` DDL：status ∈ claimed/dispatching/succeeded/failed/unknown · created_at/completed_at 窗口）——收据内仅入**计数与时间戳**（`request_digest`/`output`/token 计数不入收据 prose）。

**判别读数（预注册）**：step8/9 区（`:258-:301`）为非 AI 面（recruiter jobs/applications CRUD 零模型调用）；专家评审段 boundLoop 面（`:346` 起，若到达）经 worker 图触发模型调用。故：

- **R1** = 红点前末窗（7b 诊断终态后 → receipt 终点）**无新增** invocation 行 → 相容岔A；
- **R2** = 该窗**有新增** invocation 行（含 failed/claimed 面状）→ 相容岔B。

附注诚实：异常前置 `:304-:315`（begin→402 入队前拒）与 webhook 面 `:317-:322` 亦零模型调用面——账本臂为**交叉互证非唯一判据**，不据此单独定谳。

**live 记账纪律（前向兑现）**：est ≤10/run（沿 G7X live=7 口径）· 硬帽 200 · `actualSpendCny=null`（无计价数据源 · Ban invented spend）· Key 只经进程环境 loader（收据内 name-only 零键值）· `.env*` ABSENT（全程零创建零读取零入收据）。

## 4. 判别判据（预注册双向）

| receipt 末 `E2E_REVIEW` 心跳行 | 判读 | 处置（预注册） |
| --- | --- | --- |
| M1 / M2（M3 未达） | 红点 ∈ `(:256, :301]` step8/9 区 | **岔A driver 面**登记（修复另刀立项归协调方） |
| M3（M4 未达） | `(:301, :303]` 空隙（blank `:302`） | **机制不可判 · 如实登记升级协调方**（非强行归类） |
| M4 / M5 | 红点 ∈ `(:303, :333)` 专家评审段 | **岔B**——按既有面登记流程归类（append-only 转挂 · Ban 就地归因既有 OPEN 行） |
| M6（M7 未达） | **岔B·子型1** boundLoop 内部 throw | 同岔B 归类流程 + 子型标注 |
| M7 | **岔B·子型2** `:356` 死胡同断言 | 同岔B 归类流程 + 子型标注 |

- **账本臂交叉互证**：R1↔岔A / R2↔岔B 方向一致则判别成立；两臂冲突或任一机制不可判 → 如实登记升级协调方。
- **预期红 retained ≠ 判别失败**：T-1 判别 run 预期 EXIT=1 class=api retained——鉴别刀交付物=定位读数非翻绿；**单 attempt · Ban retry-to-green**。
- **归因纪律**：本刀只鉴别不归因不修复；两岔任一**不**在本刀就地归因既有 OPEN 行（`GAP-G7K-API-REDS :107` / G7X 刀①刀② 域 / C-MO-P3 面互不越界）。

## 5. `:357` 同族残留关联（non-goal · 候修归协调方）

`:357` boundLoop provenance 计数断言（`trustedBSideScore === null && identities.length === questions` · 与 C-MO-P3 `:201-203` 同族的**非澄清感知**计数形态）本轮被 ledger 排除为死因（死亡窗上界 `:356` 不含 `:357`）；**候修登记归协调方**；本刀 **Ban 顺手修它**——`:357` 断言本体零触碰（埋点加行除外，且 M7 不触碰 `:357`）。

## 6. EXEC 面范围与 prove 计划（下轮 · 本 REQUEST 不执行）

- **coding**：恰 1 文件 `e2e/full.e2e.ts` · 恰 7 行 `reviews.record` 纯插入（§2 表）· 零其他 diff。
- **prove（一次优先 · 单 attempt）**：`pnpm e2e-static-guards:prove` + `pnpm e2e-static-guards:check` 期望 EXIT=0 · `pnpm e2e-helpers:prove` 期望 EXIT=0 · `pnpm e2e-parity:prove` + `pnpm e2e-case-inventory:prove` 期望 EXIT=0 · **判别 T-1 = `pnpm e2e:isolated`（+sidecar 并行）恰 1 次，预期 EXIT=1 class=api retained** · 收据须含 seg_* 心跳行 + sidecar 投影 + `ai_model_invocation` 实测段 · 四钉 blob 前后全等亲算入收据。
- 绿面佐证臂（埋点不破坏绿收据契约的实跑验证）**不默认行使**，是否列入 EXEC 归预执行双审裁（Ban 未经授权加跑）。

## 7. Ban 列表（REQUEST 必写④）

Ban 碰 A() 断言本体（全文件零改写）；Ban 碰反伪造四钉 blob（`9bba015d`=`e2e/helpers/sse.ts` · `975fbb38`=`e2e/helpers/assert.ts` · `13dbfc43`=`scripts/run-e2e-isolated.mjs` · `63af556f`=`packages/ai-runtime/src/model-operation-registry.ts`）；Ban 碰 withhold 契约（stderr 断言原文回读面）；Ban 碰产品码（`apps/**` · `packages/**` 零触碰）；Ban 碰 G7V-CALIB spec 线；Ban 改共享 SSOT（`gap-bug-backlog.md` / `execution-master-checklist.md` / 矩阵 / sibling 归档——只读引用 · 刀① nail 登记只引不建行）；**Ban 归因两岔任一岔**（只鉴别不归因不修复）；Ban 碰 `:357` 断言本体；Ban secrets / 键值入收据 / invented spend / `.env*`；Ban force-push；Ban retry-to-green；Ban self-approve（预执行/post-prove 双审均须 mw-e2e-ha + mw-model-op 独立席位）。

## 8. 流程声明（REQUEST 必写⑦）

REQUEST（本文）→ 预执行双审（mw-e2e-ha + mw-model-op · 空审 stub 见 §9）→ meetwise 授权 → coding（埋点）+ prove 一次优先 → post-prove 双审 → meetwise 授权 nail。执行地：worktree `meetwise-line-post7b` · 分支 `line/cmop03-post7b-discriminator`。

## 9. 交付物与本 commit

- `ai-docs/delivery/harness/cmop03-post7b-discriminator.md`（本文）
- `ai-docs/delivery/cmop03-post7b-discriminator.slice.md`（切片速览）
- `ai-docs/delivery/reviews/REQUEST-2026-10-08-cmop03-disc-mw-e2e-ha.md`（空审 stub · 待审席填写）
- `ai-docs/delivery/reviews/REQUEST-2026-10-08-cmop03-disc-mw-model-op.md`（空审 stub · 待审席填写）

本 commit = 上述恰 4 文件、零其他 diff；作者/提交者 `mw-core <mw-core@meetwise.local>`。

## 10. Not-a-pass 诚实尾条

Not a pass · not coding（埋点未落 · 本 REQUEST docs-only）· not proven · not run（零实跑零 live 零容器零 sidecar）· not 鉴别定谳（两岔未判）· not 归因 · not 修复 · not `:357` 处置（候修归协调方）· not covered · not HA · not releaseEvidence · not nail · not coordinator authorize · not 预执行双审 done · 红读数 retained（78798ms 首达原值记账零冲销）· `g7SuiteGreen=false` · `actualSpendCny=null` · alone ≠ dual

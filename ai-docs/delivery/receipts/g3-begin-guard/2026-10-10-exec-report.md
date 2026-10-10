# G3 BEGIN-GUARD — EXEC 收据（#260+#261+#161+#256显示面 · 形制 A）

**Exec**：`g3-exec` · 分支 `line/g3-begin-guard` @rebase 后 HEAD（基 `feat/mysql-schema-skeleton` @`44734d7f`）· REQUEST rev2（`draft_rev2:pre_exec_dual` · 双审 8/8 收口）· 协调方明示 EXEC 授权
**Date**：2026-10-10 · **est live=0**（纯显示面+additive optional 字段+e2e-guard 注入面·零模型外呼零消耗零迁移零 secrets）· markers=0 · pins 十一值零翻转 · ⛔push

---

## §1 rebase 与漂移表

rebase `feat/mysql-schema-skeleton`（tip `44734d7f`）→ 零冲突落位。主线新增 6 提交（`4983042d/46ff2290/88ffef5c/2136ad86/9cac8778/44734d7f`）实触面＝纯 docs + `packages/db/test/report-retry.proof.ts` + `scripts/run-e2e-isolated.mjs`——**本刀涉案码面零触碰**。

| 锚 | REQUEST 记 | rebase 后实读 | 判 |
|---|---|---|---|
| interviews/page.tsx 门/下拉/默认值/空态 | :81/:88/:91-93/:110-114/:122/:125-127 | 同行号 | 零漂 |
| quiz:82 / diagnosis:84 `resumes.map` | :82/:84 | 同 | 零漂 |
| jobs 过滤先例 | :50 | :50 `filter((r) => r.status === 'ingested')` | 零漂 |
| pricing:37 / faq:34 | :37/:34 | 同 | 零漂 |
| view-model connecting 臂 | :89-90 | :89-90 | 零漂 |
| interview-state InterviewView/question_ready 臂 | :38/:42/:95-101 | interface :33-69（questionIdentity :37-38/turns :42）/case :93-105 | 零漂 |
| business-events question_ready schema | :24-30 | :24-30 | 零漂 |
| generation-progress 段名表 | :20-24（rev2 微漂②） | :20-24 | 零漂 |
| events/route STRESS_ID/门/e2eStressStream | :12/:50/:20 | :12/:50/:20 | 零漂 |
| adaptive-lifecycle pendingQuestion/发射点 | :44-46/:252/:262/:305/:214-217/:368-371 | 同（appendEvent 实读 :214-219/:368-373 ±2） | 微漂⑧ |
| ai-graphs PendingQuestion/mind 通道 | :60/:136-137 | :60-71/:136-154 | 零漂 |
| domain rememberDecision/raise 臂 | :378-385/:400-404 | 同 | 零漂 |
| contracts Entitlement/apiContract SSE 注记 | :232/:1196 | :232/:1203（apiContract 表内行） | 零触碰确认 |

**EXEC 新增微漂账（续 rev2 §0 尾账）**：

- **微漂⑥（N 口径勘误·语义级）**：服务端 `question_ready.turn` 为 **0 基**——实证：`initMind turn:0`（domain :180）、首题 `questionId=q-v*-t0-c*`/`turn:0`（web-logic.proof 既有 fixtures :176-205 全 turn:0、interview_question CHECK(turn>=0) 0021 迁移）、图无首题前自增；而全仓「第 N 题」显示先例统一 **1 基**（progress.ts:19-20 `turn+1`、InterviewPanel:417 `第 {i+1} 题`、QuizPanel:71、VoiceCallPanel:659）。REQUEST §1 W4 公式「N=identity.turn 缺失降级 turns.length」两臂在 0 基现实下恒差 1（同题双数·首题显「第 0 题」）且 §0「grep 第.*题=0」前提失实（:417 实存）。**EXEC 裁量**：N=identity.turn+1（identity 在）→ 缺失降级 turns.length（本身 1 基）——两臂全流程自洽相等（仅 clarify 烧预算轮如实分叉）；§4.4 示例按勘误口径断言（turn=2 → 第 3 题；首题 turn=0 → 第 1 题），web-logic.proof 落证。post-prove 请按本微漂对账 §4.4。
- **微漂⑦（STRESS 通路勘误·R3 消费形）**：`?duplicateFrames=1` 页面 query **不透传** SSE fetch（useInterviewStream openSse 硬路径 `/api/interview/:id/events` 无 query）——既有参数实为死通路（route 侧 searchParams 恒空）。变体选择改**变体 id 族**：`__e2e_stream_progress__`/`__e2e_stream_silent__`，`events/route.ts` + `interview/[resultId]/page.tsx` 双门同扩（同 e2e-guard-only 族·`E2E_UI_STRESS==='1'` 双门语义零降级·零新增生产路由·零 query 通道依赖）。既有 `__e2e_stream_stress__` 行为逐字节不变。
- **微漂⑧（行号漠记）**：generate-question pending 构造实读 :96-113（REQUEST 记 :92 ±4）；adaptive-lifecycle appendEvent 实读 :214-219/:368-373（REQUEST 记 :214-217/:368-371 ±2）；InterviewView.plannedTurns 落位 :45-51（R1 记「:38 相邻区」一致）。

## §2 八处方兑现（rev2 §9 全量对账）

| # | 处方 | 兑现 |
|---|---|---|
| R1 | InterviewView 增 optional `plannedTurns` + question_ready 臂 candidate 读入（不触 QuestionIdentity 令牌契约） | ✓ `apps/web/lib/stream/interview-state.ts`（InterviewView :45-51 字段注释+case question_ready candidate 类型+`next.plannedTurns = candidate.plannedTurns` 逐题覆盖写）；QuestionIdentity/turns 历史零触碰 |
| R2 | 数据源=`snap.values.mind.maxTurns`（decide 后 nextSoft）·PendingQuestion reducer 填充·发射点 start `:252/:262` 传参/answer `:305` 直读 | ✓ `packages/ai-graphs/.../state.ts` PendingQuestion.plannedTurns（:74-79）；`generate-question.ts` pending 填 `state.mind.maxTurns`（decide 先于 genQuestion，raise 后现值）；`apps/worker/src/adaptive-lifecycle.ts` 两 appendEvent 补字段（additive·旧 checkpoint undefined→JSON 缺字段） |
| R3 | C8 STRESS 钩子扩（e2e-guard-only generation_progress/零帧变体）+W1/W2 断言落 web-logic 纯函数级+pricing/faq 断言落 public-copy | ✓ events/route.ts `e2eProgressStream/e2eSilentStream`（三拍分块流）+stream-window.spec.ts 两测试消费形；断言落槽两处全落（见 §3）——变体通路按微漂⑦勘误实现 |
| R4 | contracts 幻锚撤销·apiContract 零触碰 | ✓ `packages/contracts` 零 diff（git 实证）；schema 唯一面=business-events.ts+worker 发射 payload |
| 裁定① | W1④ quiz/diagnosis 保留 | ✓ 三页同谓词同 helper 单源（isEligibleResume/resumeEmptyState） |
| 裁定② | 形制 A（附 R1/R2） | ✓ 全管道落码+显示面「第 N 题 / 预计约 M 题（自适应，可能调整）」 |
| 裁定③ | 措辞去「实时」·两尾段免责句逐字保留判收 | ✓ pricing:37/faq:34 只动假读数短语；免责尾句「不构成可购买服务、报价或销售要约」/「不构成销售要约」逐字保留；public-copy `TC-PUBLIC-COPY-G3` PASS（含免责句逐字 requireText 硬项+禁「实时」入本刀句式——faq :26 既有「页面实时状态」他句零触碰） |
| 席1-4 | 蓝本回补附录 | ✓ 见 §5 |

## §3 断言落槽（R3 写死案对账）

- **web-logic.proof.ts**（纯函数级）：G3 五 section 34 断言——isEligibleResume 六态表+混合列表默认值+空态三臂+三页静态源锚；entitlement 三形状 {3}/{0}/null（含非整数/形状漂移降级）+RSC 消费静态源锚；connecting 三臂（拼帧/进题清除/零帧逐字）+缺数值臂+isDeadEnd 零违例；badge 派生（勘误口径/首题/降级 turns.length/plannedTurns 缺失与非法/追问不增 N/空视图 null/旧流零破坏）。**285 PASS / 0 FAIL 全绿（既有 section 零回归）**。
- **public-copy.proof.mjs**：`TC-PUBLIC-COPY-G3`（置于 E8 前使其实际入门执行段）——新口径句在位+旧假读数短语禁回潮+免责尾句逐字保留（判收硬项）+禁「实时」+预览零支付句原样。**PASS（--case EXIT=0；全量门内执行段 9 ✓）**。
- **页面组合层缺口登记（nail 时入 e2e-requirement-coverage-matrix）**：RSC 数据面接线/表单门/下拉 DOM/余额行 DOM/徽标 DOM（canAnswer 门控）= proof 盲区；静态源锚已补（沿 F2 :1237 先例）非组合证明。浏览器级：stream-window.spec 两新测试覆盖 W3 三臂+W4 徽标渲染（STRESS 全管线）——需 `E2E_UI_STRESS=1` runner 栈，本刀未跑（见 §4 未跑账）。

## §4 门禁 EXIT 表（全部亲跑·EXIT 原值）

| 键 | EXIT | 账 |
|---|---|---|
| `git rebase feat/mysql-schema-skeleton` | OK | 零冲突（6 docs 主线提交重放） |
| `pnpm install --frozen-lockfile` | 0 | 前置（工作树缺 node_modules） |
| `pnpm --filter @meetwise/web prove` | **0** | **285 PASS/0 FAIL**（含 G3 五 section·既有零回归）·log 入卷 |
| `pnpm --filter @meetwise/web prove:public-copy` | **1** | **预存红·基线对账**：E8 `billingAction '/commerce/orders'`（ENTPAY片1×public-copy E8 主线矩阵已登记）——stash 干净 HEAD 实证**同点同抛**；门内执行段 main+E1..E7+G3＝9 ✓ 全过；E8 零触碰零 skip（Ban skip-as-pass 遵守=保留红+对账）；`--case TC-PUBLIC-COPY-G3` EXIT=0 |
| `pnpm --filter @meetwise/web typecheck` | **0** | 零新增错 |
| `pnpm typecheck:e2e`（root·covers e2e-ui spec） | **0** | stream-window 新测试过编译 |
| `pnpm --filter @meetwise/ai-graphs prove:adaptive-graph` | **0** | plannedTurns additive 图级零破坏 |
| `pnpm --filter @meetwise/ai-graphs prove:adaptive-signals` | **0** | decide/mind 通道零破坏 |
| `pnpm neg:interview`（isolated） | **0** | **97/97**（begin/turn/abandon 负路径全绿·含 402 面）·log 入卷 |
| `pnpm interview:prove`（isolated） | **0** | **54 PASS**（v64 面试链路·含 adaptive-lifecycle 投影·receipt json 入卷） |
| `pnpm adaptive-life:prove`（isolated） | **0** | **42 PASS**（checkpoint→ledger→SSE→结算全链） |
| worker raw `prove:tokenstream/quiz/diagnosis` | 1 | `database_config_invalid:database_target_missing`＝raw 键缺 DB 前置（非码红）·其判据面（worker progress 发射/quiz·diagnosis service）本刀**零触**→列未跑账 |
| e2e-ui 七 spec | 未跑 | 需 production next+api+worker 栈+E2E_UI_STRESS=1 runner（live 栈键·离线门不含）·两新测试随卷待 runner 复跑 |

## §5 蓝本回补附录（席1-4·四引线唯一命中=更正版 issues-master）

**更正版 `~/Documents/Meetwise产品审计-更正版/issues-master.md` 四条原文全行**：

- **:272 / #161**：`| #161 | P2 | 技术缺陷 | 面试中 | 首题生成（最慢的等待）时前端 connecting 分支不读 generationProgress，看不到进度 | apps/web/lib/view-model.ts:46-47,55-66；apps/web/lib/stream/quiz-state.ts:123；apps/web/test/web-logic.proof.ts:456 | 仍存在 | 已核实 | connecting 分支也渲染 generationProgressLabel，补浏览器级测试 | #160 | — | 第1批 | findings #161；上一版 teach/final（领域：前端/SSE；定级来源：findings 明示；原批次：第5批 体验/文档/低优先清理） |  |`
- **:292 / #256**：`| #256 | P2 | 产品偏差 | 面试中 | 无进度/时长预期，也没有"提前结束并出报告"：只显示"第 N 题"，软预算约 10–17 题（推断）、绝对上限 120；唯一退出是"放弃"（退额度、无报告） | apps/web/components/InterviewPanel.tsx:327-335,371；packages/domain/src/adaptive-interview.ts:100,116-120 | 仍存在 | 已核实（读码）；题数估计为推断 | 显示"第 3 题 / 预计 10–15 题"；≥N 题可提前结束出报告 | — | #40（提前结束出报告需评分卡）、D3 | 第1批 | 九·产品偏差 原 #215（P2） |  |`
- **:296 / #260**：`| #260 | P2 | 产品偏差 | 开始面试 | 简历下拉口径不一：面试页/押题页列出全部简历（含"解析失败""删除处理中"），选中后 begin 409；岗位页已过滤 ingested | apps/web/app/interviews/page.tsx:79-81；apps/web/app/jobs/page.tsx:49；apps/api/src/modules/interview/interview.service.ts:265,269,282 | 仍存在 | 已核实 | 按可用性过滤或置灰 | — | — | 第1批 | 九·产品偏差 原 #224（P2） |  |`
- **:438 / #261**：`| #261 | P3 | 产品偏差 | 额度/付费 | 额度全产品固定 1.0（面试/押题/诊断/OCR），开始前无"本次消耗"确认；FAQ/pricing 称"额度字段仅表示界面或开发流程状态"，与"无额度不能用任何核心功能"冲突（余额展示见 #228） | apps/api/src/modules/interview/interview.service.ts:304；apps/api/src/modules/quiz/quiz.service.ts:56；apps/api/src/modules/diagnosis/diagnosis.service.ts:59；apps/api/src/modules/resume/resume.service.ts:98；apps/web/app/pricing/page.tsx:37；apps/web/app/faq/page.tsx:33-35 | 仍存在 | 已核实（读码+grep 前端无余额展示） | 开始按钮旁显示"本次消耗 1"；文案改实；分档定价见 D3 | #228 | — | 第1批 | 九·产品偏差 原 #225（P2） | （2026-10-09 独立复核更正：#228/#261 去重：…本条只保留"全产品固定 1.0、开始前无本次消耗确认、FAQ/pricing 文案与 402 冲突"。P2→P3：…属有意设计。） |`

**蓝本 G3 行（`batch-residual-plan.md:88` · meetwise-line-entpay 工作树实读）**：
`| G3 | **BEGIN-GUARD 进度刀** | #260+#261+#161+#256显示面 | #260(:296) 简历下拉按可用性过滤/置灰（jobs 页 ingested 过滤同形先例）·#261(:438) 开始按钮旁「本次消耗 1」+余额 N 展示（🔒#228 已解锁）·#161(:272) connecting 分支渲染 generationProgressLabel+浏览器级测试·#256 显示面(:292) 「第 N 题/预计 M 题」（**提前结束出报告🔒D3 待决·本刀只做显示不做提前结束**） | **M** |`

## §6 Non-claims 复述（判收口径）

prove EXIT=0 ≠ DONE（claimDone=false·完成判定走双审+nail）；「余额 N」=渲染时点读数 ≠ 实时余额保证；「本次消耗 1」=扣费常量如实转述（服务端 1.0 权威零改·402 文案零改）；「第 N 题」按勘误口径=服务端 turn+1 的主题序号显示 ≠ 轮次/追问总数口径；「预计约 M 题」=软预算约数+可调注记 ≠ 承诺 ≠ 上限；connecting 进度=生成进展转述 ≠ 连接健康（进度帧不改 phase 红线零改·isDeadEnd 不变量零破坏实证）；提前结束/session_concluded/D3 全域零触碰（diff 实证）。

---

卷尾：`executed:awaiting_post_prove_dual`（EXEC 落码+门禁全账如上·W1-W4+C8+八处方全兑现·微漂⑥⑦⑧入账·⛔push·alone≠dual）

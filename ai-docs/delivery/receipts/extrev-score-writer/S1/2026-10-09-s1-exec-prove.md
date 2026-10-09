# EXTREV-1 SCORE-WRITER · S1 EXEC 收据 — worker 写入接线刀（五环链全通 + D6 过渡桥）

- 席位：mw-core EXEC（`mw-scorewr-exec`）· 2026-10-09
- 工作树：`/Users/miaole/Desktop/golucky/meetwise-line-scorewr`（branch `line/extrev-score-writer`，基线 tip `1181d959`）
- 唯一蓝本：`ai-docs/delivery/harness/extrev-score-writer-REQUEST.md` @ `1181d959` rev2（`draft_rev2:pre_exec_dual_PASS`·双席 BOTH PASS·协调方 EXEC 授权）
- 范围：蓝本 §1.S1 + rev2 义务（D1 图状态 difficulty plumbing / D2 submit 事务邻域 / D3 claim+lease / D4 后置异 txn+lease_token 复用 / D6 阈值映射）+ S1 prove（scripted seam·:157-160 桩保留·卡数断言）。**零迁移**（0100/0103/0109 契约零触）、**零 S2 面**（读侧/去桩/prompts v6 零触）、**零 G7 面**、**零 live 外呼**（est live=0）。

## 1. 接线面逐函数落位表

| 环 | 函数（定义处不动） | S1 接线位 | 义务 |
|---|---|---|---|
| ① rubric 发布 | `publishQuestionRubric`（`packages/db/src/scoring-fact-root.ts:106`） | `packages/db/src/scoring-wire.ts` `publishRubricAndIssueContract` ← 出题投影事务两处：`apps/worker/src/adaptive-lifecycle.ts` `persistAndEmitQuestion`（start 首题）+ answer 投影 `if (next)` 块（下一题） | D1 |
| ② issue 契约 | `issueQuestionContract`（`scoring-fact-root.ts:119`·12 参） | 同上（同投影事务·冻题不冻答·绑 rubricId） | D1 |
| ③ score request | `createScoreRequest`（`scoring-fact-root.ts:132`） | `scoring-wire.ts` `createScoreRequestForSubmission` ← `apps/api/src/modules/interview/interview.service.ts` `submitPreviewAnswer`（**D2 勘误锚点 :402 邻域**·与 0092 `submitInterviewAnswer`/`:139` submission INSERT/`:157` artifact INSERT 同事务原子·非 claim 位）；幂等键 `sr:{submissionId}`；契约缺位 fail-soft（存量不追溯） | D2 |
| ④ claim/lease | `claimScoreRequest`（`scoring-fact-root.ts:144`·pending→claimed 单次 CAS）+ `fenceScoreRequest`（`:162`） | `apps/worker/src/score-writer.ts` `writeScoreCardAfterProjection`：定位（`findActiveScoreRequest`·app_role 只读）→ privacy 复核（fenced→`fenceScoreRequest` 先赢+跳过）→ claim | D3 |
| ⑤ 写卡 | `writeFinalScoreCard`（`packages/db/src/scoring-aggregation.ts:62`·0103 确定性总分） | 同上 worker 模块：独立 `asScoringWorkerPrincipal` 事务，claim+写卡同 worker txn；**接线点 = `adaptive-lifecycle.ts` `submitAdaptiveAnswerImpl` 投影事务提交后**（`markJobDone` 前·同一 answer-job drain） | D4 |
| — 版本单点 | — | `scoring-wire.ts`：`SCORING_MEASUREMENT_VERSION`/`SCORING_OPERATION_POLICY_VERSION`/`SCORING_PROMPT_POLICY_VERSION`（=`mock-interview.evaluate.v5`）/`SCORING_ROUTE`/`SCORING_LANGUAGE(_SCOPE)`/`SCORING_ISSUE_PRIVACY_EPOCH`/`SCORING_SEED_CRITERION_ID` | D1/D2 |
| — D6 桥 | — | `packages/domain/src/scoring-aggregation.ts` `SCORE_HINT_EXCEEDS_THRESHOLD=85` + `dispositionFromHintScore`（60 锚=`packages/domain/src/assessment.ts` `export const GAP=60` 单源复用，禁字面量散布）；两处 DELETE-ON: #52 v6(S2) 注释 | D6 |
| — consumer | — | `apps/worker/src/interview-consumer.ts`：`life.scoreWriterLeaseOwner = d.leaseOwner`（缺省跳写卡步·兼容旧 seam） | D3/D4 |
| — prove | — | `apps/worker/test/interview.proof.ts` ②a/②b 段 + 0142 route 供给 fixture 修复；`scripts/run-e2e-isolated.mjs` `interview:prove:raw` sources 表扩（收据面） | S1 prove |

行内披露：`interview.service.ts` `privacyEpoch: 1` 字面量 → `SCORING_ISSUE_PRIVACY_EPOCH`（同值单点化，非语义变更）。

## 2. 结构性发现（EXEC 期亲证·非停止项·登记）

1. **图 questionId 跨面试碰撞**：图内 `issueQuestionId` 编码 `q-v{sv}-t{turn}-c{clarify}`（`generate-question.ts:10`）跨面试同形；`question_rubric` 是全局内容表（无 RLS·UNIQUE(question_id,question_version,rubric_version)·publish 幂等回放不比对内容）→ 直接以原样 questionId 发布会让第二场面试静默绑第一场的 rubric（competency/difficulty/内容 hash 全错）。**处置**：rubric 全局键命名空间化 `scoringRubricQuestionId = iv:{interviewId}:{questionId}`（契约/卡/事件侧 questionId 保持原样——`issued_question_contract` 有 owner+interview 作用域无碰撞面；`ScorableScoreCardRow.questionId` 取自契约列）。零迁移、纯调用面。
2. **0126 双写围栏与两答案家族**：明文 `/turn` 家族（图驱动·payload.answer job）与 0092 账本家族（submission/artifact）per-interview 互斥（0126 触发器双向 fence·亲读 `0126_interview_answer_dual_write_fence.sql:151-169`）。D2 锚点（submit 事务）只在账本家族侧存在；账本家族的 `interview_answer_job`（0092 ref-only）**无消费方**（grep 亲证·全仓零命中）——其图驱动消费属 INT-TRANSCRIPT-01（六门 blocked）。**⇒ S1 过渡形状**：明文 /turn 驱动的生产面试结构性零 score_request（D2 无处绑）→ 写卡步 `no_request` 跳过（fail-soft·不阻断 drain）；账本家族面试经 D2+D4 出卡（prove ②b 全链亲证）。两半都是真实生产代码接线；家族合流（账本家族获得图驱动=INT-TRANSCRIPT-01 cutover）后链路端到端自动贯通——S1 无需也无法抢做（Ban 预授权六门）。
3. **adjudicate 接线结构性不可达**：S1 单分项 seed（`answer_quality`·weight 1）下每卡恰一条自计算 span 证据，`reverified` 恒真、无多来源/冲突面——`adjudicateScoreCard`（`scoring-evidence-conflict.ts:66`）在本过渡窗无合法触发路径；死代码接线比如实登记更不诚实。冲突面接线义务随 S2 v6 多分项扩项兑现（SCOR-03 域）。

## 3. prove EXIT 原值（全部 scripted seam·est live=0·actualSpendCny=null·0 Key 值接触）

| 键 | 基线（pristine @1181d959·亲跑） | S1 后（亲跑） | 判读 |
|---|---|---|---|
| `pnpm interview:prove` | **EXIT=1**（7 FAIL：①首题投影起全链连锁红） | **EXIT=0·全绿（新增 18 断言全 PASS）** | base 红根因=fixture 过期：R1 起 `MEETWISE_TECH_ROLE_FAIL_CLOSED` 默认 ON，本 proof 未跟进 0142 route 供给 → start job 全部 `adaptive_role_route_missing`。S1 以**生产同链**供给修复（`supplyCandidateProfileRoute`·adaptive-consumer.proof.ts:86 同款先例），非 flag opt-out。 |
| `pnpm adaptive-life:prove`（spot-check·投影面回归） | —（未跑） | **EXIT=0** | D1 投影事务接线零回归 |
| `pnpm scoring-integrity:prove`（辅证） | **EXIT=1**（①c graph 段 1 FAIL + TypeError@:99·9 PASS） | **EXIT=1**（同段同位同形·9 PASS） | **既有 base 红·S1 前后逐位同形**（pristine 亲跑对照日志在卷）。不在 S1 修复面（其 ①c 是独立 graph fixture 腐化，与本刀无关）；写路径幂等/fence/lease 复用/卡数断言已全部在 interview:prove ②b 绿面覆盖。 |

interview:prove S1 断言面（②a/②b·全 PASS）：
- **D1**：每道已投影题同投影事务发布 rubric（幂等不重复）；每 rubric 冻结单分项 seed；每题冻结契约且 difficulty 由图状态 plumbing 落 1..5 域。
- **0126 诚实面**：明文 /turn 家族结构性零 score_request/零卡（S1 过渡形状如实断言，非掩盖）。
- **D2**：同事务落 score_request ×3。
- **D4+D6**：写卡成功且总分=0/50/100 档位化值（hint=80→50·59→0·85→100，≠v5 hint 分）。
- **D4 恢复钉**：模拟 crash（首 claim 单次 CAS 成功）→ 重放复用既有 lease_token 写卡成功（禁新造）。
- **卡数断言**：score_card 行数 = 已答（ledger 提交）题数（4=4）。
- **0100/0103 契约**：全部 score_request 经 CAS 收口 scored（单 winner）；写卡同事务原子追加 `score_card_written` 事件 ×4。
- **幂等**：at-least-once 重放对 scored 请求跳过·零重复卡。
- **:157-160 桩保留**：③ 报告段 loadSummary 桩原样（去桩属 S2），报告链仍绿。

prove 迭代披露（禁 retry-to-green 核查）：interview:prove 共 4 跑——pristine 基线 1 跑（红）+ S1 后 3 跑；第 1/2 跑的红均为 **prove 自身观测查询踩权限边界**（question_rubric / interview_answer_submission 对 app_role 无 SELECT——0100/0092 权限设计本身正确的副作用），改直连观测面（prove 观测非生产路径），零生产码改动、零断言弱化。另：本机首轮 docker PG boot 未就绪（`isolated_postgres_database_not_ready:boot`·基础设施层）重跑即过；worktree 初次无 node_modules，`pnpm install --frozen-lockfile` 后照常。

## 4. rev2 义务履行证据

- **D6 阈值映射**：`dispositionFromHintScore`（domain·常量单点）：<60 below / 60≤score<85 meets / ≥85 exceeds；60 锚=legacy `GAP` 导出单源（`assessment.ts`），85=命名常量 `SCORE_HINT_EXCEEDS_THRESHOLD`；两处 DELETE-ON: #52 v6(S2) 注释钉死。**过渡窗声明：卡总分=0/50/100 档位化值（0103 确定性公式 of 单档 seed），≠ v5 hint 分**——prove ②b 三档边界值（59/80/85）亲证。
- **D5 三钉**：(i) GAP=60 已导出单源（本刀只动 `const`→`export const`，D5(ii)(iii) 的派生/形状冻结属 S2 面，零触）；无字面量散布（writer 侧唯一 import）。
- **D4 后置异 txn**：写卡步在投影事务 COMMIT 之后、`markJobDone` 之前（consumer 收口序亲读）；独立 `asScoringWorkerPrincipal`（scoring_worker_executor）事务；crash 重放复用 claim 返回既有 lease_token（prove 模拟 crash 段亲证）；三租约域（interview job lease / graph fence / score lease）互不耦合。
- **D2 submit 邻域**：`createScoreRequestForSubmission` 与 `submitInterviewAnswer` 同一 asPrincipal 事务（API 服务面 + prove ②b 同形双行使）；勘误锚点 `int-transcript.ts:114/139/157`+`interview.service.ts:402` 全亲读对形。
- **D1 图状态 plumbing**：`PendingQuestion.difficulty`（`state.ts:58`·图状态本已有）→ 投影层消费（此前投影只取 questionId/stateVersion/turn/question/competency/qkind）→ rubric 冻结列 1..5（prove 断言域）。

## 5. 停止条件核查（五条全未命中）

- (a) 实树 vs D 段锚点：**全部对形**（§0 所列 file:line 逐一亲读核验；唯一形状发现=questionId 全局碰撞，属调用面处置非锚点不符，见 §2.1）。
- (b) prove 红：interview:prove base 红（fixture 过期）已修复转绿；scoring-integrity 红=既有 base 红**同形**（pristine 对照在卷），非 S1 新增。
- (c) S2 面：零触（:157-160 桩保留·prompts/report 读侧/deriveAssessment 切换全零改）。
- (d) 迁移：零（`git status` 无 migrations 改动；0100/0103/0109/0092/0126 仅作为契约被调用/被 prove 覆盖）。
- (e) live 外呼：零（scriptedModelClient + 直连 db；est live=0）。

## 6. 残余登记（append-only·非本刀义务）

- 明文 /turn 生产面试 S1 过渡窗零卡（0126 围栏+INT-TRANSCRIPT-01 六门 blocked；**同今日 #20 形状非回归**——今日本就零写入方）。账本家族（preview `POST /interview/:id/answers`·`MEETWISE_PUBLIC_PREVIEW=1` 门）经本刀起出卡。
- 存量 interview/存量题不追溯供卡（无契约→D2 fail-soft 跳过；rev2 已登记，本刀兑现为代码行为）。
- `score_request` 卡 claimed 无超时回收（rev2 已登记·后续刀）。
- scoring-integrity:prove ①c 既有 base 红（graph fixture 腐化·与本刀无关·pristine 同形对照在卷）。
- rubric 全局命名空间 `iv:{interviewId}:{questionId}` 使每面试一行 rubric（自适应逐题 seed 的诚实代价；qbank 全局语料归 EXTREV-4）。

## 7. Pins（十一值照抄·本刀不改口）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（业务+LangGraph PostgresSaver+pgvector·禁 MySQL/Qdrant 业务切流叙事）· 公开 DELETE /privacy/interview-data/:id=503 · `g7SuiteGreen=false` · `actualSpendCny=null` · r1Closed=false

## 8. Non-claims

S1 ≠ 评分体系完成；≠ #20 报告链已通（报告仍读 legacy hint 桩·S2 去桩切卡）；≠ #103/#50/#52（S2）；≠ #42/#43/#47/#41（S3）；≠ INT-TRANSCRIPT-01；≠ rubric 语料工程（单分项 seed 是过渡最小诚实形态）；卡数断言过 ≠ 评分质量/校准已证；E2E 绿 ≠ HA ≠ releaseEvidence。

---
*S1 收据 · EXTREV-1 SCORE-WRITER · mw-scorewr-exec · 2026-10-09 · est live=0 · 零迁移 · :157-160 桩保留 · STOP（awaiting post-prove dual）*

## §0 续 · 中断续作处置记录（2026-10-09 · `mw-scorewr-exec2` · append-only）

前任席 `mw-scorewr-exec` 于 prove 完成后、commit 前被配额中断，遗下 **18 个 staged 脏文件**（`git status` 亲查：16 code/prove 面 + 1 REQUEST 状态行 + 6 收据/日志；零 unstaged、零 untracked）。续作席逐文件 `git diff --cached` 盘点，对照蓝本 §1.S1 + rev2 裁定：

**判定：已做部分符合蓝本 → 续作（保留合规面·补缺），不 reset。** 逐项对形：

| 义务 | 脏面亲验 | 判定 |
|---|---|---|
| 五环接线 | `scoring-wire.ts`（D1 publish+issue 组合 / D2 request / D4 定位读面）+ `score-writer.ts`（D3 claim+fence / D4 写卡）+ `adaptive-lifecycle.ts` 两投影事务接线位 + `interview-consumer.ts` leaseOwner 注入 + `interview.service.ts:402 邻域` 同事务 D2 | ✅ 对形 |
| D6 阈值映射 | `dispositionFromHintScore`（<60 below / 60-85 meets / ≥85 exceeds）· 60=GAP 单源复用 · 85=`SCORE_HINT_EXCEEDS_THRESHOLD` 命名常量 · 两处 DELETE-ON: #52 v6(S2) 注释 | ✅ 对形 |
| D1 difficulty plumbing | 消费图状态既有 `PendingQuestion.difficulty`（`state.ts:58`）→ rubric 冻结列；零 ai-graphs 改动（与 18 文件清单自洽） | ✅ 对形 |
| D4 后置异 txn+lease_token 复用 | 投影 COMMIT 后·markJobDone 前·独立 `asScoringWorkerPrincipal` 事务；crash 重放复用既有 token | ✅ 对形 |
| D2 submit 邻域 | 与 0092 `submitInterviewAnswer` 同一 asPrincipal 事务原子（非 claim 位·rev2 勘误锚点） | ✅ 对形 |
| S1 prove 纪律 | :157-160 桩字节原样保留（现 :316·行号因 fixture 修复+②a/②b 后移）；卡数断言在卷；est live=0；`privacyEpoch:1`→`SCORING_ISSUE_PRIVACY_EPOCH` 仅同值单点化 | ✅ 对形 |
| 越界面 | 无 migrations/.env/G7/SSOT/prompts/读侧 S2 面文件 | ✅ 零越界 |

**续作席补缺（本节）**：① typecheck EXIT=0；② `pnpm interview:prove` 续作席独立复跑 1 次——**EXIT=0 原值**（29 PASS / 0 FAIL·日志 `2026-10-09-exec2-continue-interview-prove.log` 在卷·非 retry-to-green：前任已在卷 EXIT=0，本次为续作确认跑）；③ 本处置记录；④ REQUEST 状态行续作登记。前任 prove 事实（§1-§8）经续作席亲读日志逐项复核无篡改面，全部承继。

*D1 收据续 · mw-scorewr-exec2 · 2026-10-09 · STOP（awaiting post-prove dual）*

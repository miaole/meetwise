# EXTREV-1 SCORE-WRITER · S2 EXEC 收据 — 读侧切换+完成判据切换+去桩+#103+#50（D6 桥废除）

- 席位：mw-core EXEC（`mw-scorewr-exec3`）· 2026-10-10
- 工作树：`/Users/miaole/Desktop/golucky/meetwise-line-scorewr`（branch `line/extrev-score-writer`，基线 tip `5dba00a2`=rebase 后 S1 EXEC·`git fetch` 亲证 origin 分叉 41/5 为 rebase 后常态·工作树干净·`pnpm install --frozen-lockfile` EXIT=0）
- 唯一蓝本：`ai-docs/delivery/harness/extrev-score-writer-REQUEST.md` @ `1181d959` rev2 收口段（§1.S2 切片行 + rev2 D5 三钉/D6 rg 门/D6 v6 义务）
- 范围=§1.S2 严格四项：①D6 桥废除（dispositionFromHintScore 移除+rg 门 v5→disposition 桥零残留+#52 提示词 v6）②loadSummary 桩废除（interview.proof 改生产 reportWorkerDeps 同形制真实 loadSummary）③#103 切换（D5 三钉）④#50 报告节点结构化输入（competency 面）。**零迁移**、**零 S3 面**（§3.10-12 的 #42 对拍/#43 白名单/#47 类型统一/#41 ADR 零触）、**零 G7 面**、**零 live 外呼**（est live=0·actualSpendCny=null·0 Key 值接触）。

## 1. 四项改动逐面落位表

| 项 | 面 | 落位 |
|---|---|---|
| ① D6 桥废除 | `packages/domain/src/scoring-aggregation.ts` | **删除** `SCORE_HINT_EXCEEDS_THRESHOLD=85` 与 `dispositionFromHintScore`（DELETE-ON 兑现）；**新增** `ScoredCriterionDisposition` 类型（criterionId+disposition+utf8_byte span+spanDigest=0103 契约 worker 侧形状）与 `scoreDispositionFromCodeUnitSpan`（code-unit span→byte span+sha256 字节 digest 派生单源，越界/倒序 fail-closed） |
| ① #52 提示词 v6 | `packages/ai-runtime/src/prompts.ts` `mock-interview.evaluate` | **v5→v6**：模型只按 `<data>` 量表逐分项判档（below/meets/exceeds）+逐字引文 quote，**绝不出总分**；反操纵/relevant/hasHook 规则承自 v5（relevant=false ⇒ 全分项 below）；量表（criteria+rubricVersion）由 `evaluationModel` 供给（种子=发布侧 D1 同款 `SCORING_SEED_CRITERION_ID` 单分项单源·多分项评分期读取面归 EXTREV-4）；**段序钉死 题目→量表→回答恒在末尾**（capUserData 头截不变量：被打分的答案绝不被切） |
| ① v6 契约 plumbing | `apps/worker/src/interview-service.ts` | `ScoreEvidenceSchema`→`{criterionId,disposition,quote}`；`EvalSchema` v6（superRefine：relevant=false ⇒ 全 below/禁 hasHook/criterionId 去重）；`validateEvaluationEvidence` 加 `criterion_not_in_rubric` 量表白名单门；`persistedEvaluation` 存脱敏 records（quote 不落盘不变量保持）；`evaluateOutcomeFromValue` 单源派生（records→0103 dispositions+确定性 hint 分=档位×量表权重，非模型输出）——`evaluateAnswer` 与自适应 `assess` 共用 |
| ① 写卡供源切换 | `apps/worker/src/score-writer.ts` + `adaptive-lifecycle.ts` + `apps/worker/src/adaptive-interview-service.ts` + `packages/ai-graphs/src/adaptive-interview/{state.ts,nodes/evaluate-answer.ts}` | `ScoreWriteQuery.hintScore` **删除**→`dispositions: ScoredCriterionDisposition[]`；assess 返回 dispositions→图 Turn（checkpoint 审计投影·派生物无答案原文/引文原文）→投影后写卡（v6 回合必供）；升级窗 face：存量 v5 checkpoint 回合无档位→跳过写卡（同 rev2「存量 interview 不追溯供卡」残余登记·绝不回退 hint 分派档）；写卡前 `reverifyScoreEvidenceSpan` 文本级复验 fail-closed；`packages/db/src/scoring-wire.ts` `SCORING_PROMPT_POLICY_VERSION`→`mock-interview.evaluate.v6`（issue 契约同步升版） |
| ② 去桩 | `apps/worker/test/interview.proof.ts` §③ | **:315-316 loadSummary 桩（伪造 80 分数组）废除**，改生产同形制真实 loadSummary（=main.ts `reportWorkerDeps.loadSummary` 同链：`listScorableScoreCards`→scores+#50 v3 items）。双面行使：**(a) fail-closed 诚实面**——图家族（明文 /turn·0126 围栏）结构性零卡→aggregateScores 抛→report **failed**（无卡绝不回退桩/legacy 分数·#20 形状如实）；**(b) 真实路径绿（S2 验收）**——账本家族 IID2 四张实卡→生产同链 `enqueueReport`→drain→**ready**，overall=确定性聚合 63=round((50+0+100+100)/4)（桩假绿恒 80 已废）、sections 非空、事件流零 `report_unavailable` |
| ③ #103 切换（D5 三钉） | `packages/domain/src/scoring-aggregation.ts` + `apps/api/src/modules/interview/interview-assessment.ts` | 新增 **`deriveScoreCardAssessmentLegacy`**（D5 legacy-parity 适配）：ScoreCard 输入→legacy `Assessment` 形状。**三钉落位**：(i) gap 判定唯一经 `GAP`（assessment.ts 导出单源，新增代码零 60 字面量·`rg "score < |< GAP"` 亲证仅 GAP 引用）；(ii) 持久化维度形状冻结 `{dimension,score,gap,evidence}`+evidence 文案 legacy parity（`interview.service.ts:673` weaknesses 过滤 d.gap 与 web **零改动**·git status 亲证 apps/web 零文件）；(iii) 派生在 `generateAssessmentFor` **INSERT 前**（domain 纯函数→JSON 落库）；生产调用面 `deriveAssessment`→`deriveScoreCardAssessmentLegacy`（409 fail-closed 信封原样保留） |
| ④ #50 v3 | `packages/ai-graphs/src/report.ts` + `apps/worker/src/main.ts` + `reportGenerator`+prompts | `InterviewSummary` 扩可选 `items: InterviewSummaryItem[]`（questionId/competency/score/cardId 证据引用·**不传题目/答案原文**）；生产 `loadSummary` 供 items；`report.generate` **v2→v3**：buildData 传 scores+逐题结构化摘要（仅 ID 引用）；overall 仍由 `aggregateScores` 确定性计算（模型 overall 无效不变量保持·`validateReportContent` 零改） |

## 2. rg 门（v5→disposition 桥零残留 + #103 零生产调用）

```
GATE-A（D6 桥零残留）:
  rg -n "dispositionFromHintScore|SCORE_HINT_EXCEEDS_THRESHOLD" apps/ packages/ scripts/
  → 零命中（exit=1）。
GATE-B（#103 零生产调用·严格调用形制）:
  rg -n "deriveAssessment\(" apps/ --glob '!**/test/**' --glob '!**/*.proof.ts'
  → 零命中（exit=1）。
GATE-C（v5 提示词策略零残留）:
  rg -n "mock-interview.evaluate.v5|evaluate.v5|'v5'" packages/ai-runtime/src/prompts.ts packages/db/src/scoring-wire.ts apps/worker/src/
  → 零命中（exit=1）。
```
`deriveAssessment` 本体保留于 domain（定义+导出+域内测试/scor-02 F1b 测试面仍行使·**生产调用方已为零**）——删除它会破坏非 S2 范围的域测试面，且「函数存在但零生产调用方」正是 rg 门的裁定对象。

## 3. prove EXIT 原值（全部 scripted/fake seam·est live=0·actualSpendCny=null·0 Key 值接触·禁 retry-to-green）

| 键 | 基线（pristine @5dba00a2·亲跑在卷） | S2 后（终版亲跑） | 判读 |
|---|---|---|---|
| `pnpm interview:prove`（主证） | **EXIT=0·29 PASS** | **EXIT=0·33 PASS** | 去 :315-316 桩后 +4 断言全 PASS（图家族 fail-closed failed 双面·账本家族 ready+overall=63+零 report_unavailable+生产同链 enqueue）。v6 直供档位写卡三档（meets→50/below→0/exceeds→100）+D4 恢复钉+卡数=已答数全绿 |
| `pnpm scoring-integrity:prove`（辅证） | **EXIT=1**（①c graph 段 FAIL+TypeError@:99:50 `Object.hasOwn`·其余 PASS） | **EXIT=1**（**同段同位同形红**） | **既有 base 红如实·逐位同形**（pristine 对照日志在卷）。v6 下 ①/①b（evidenceRecords span+hash/hasHook 保留/缓存幂等/quote 单拒/unscored 不伪造）全 PASS——v6 契约在真 invoke+trace 机上行使无回归 |
| `adaptive-flow:prove` | —（spot-check） | **EXIT=0** | fixture 值断言随 v6 契约更新（88→100·见 §4 披露） |
| `adaptive-life:prove` | —（spot-check） | **EXIT=0** | 同上（:55/:74 断言 88→100） |
| `adaptive-consumer:prove` | —（spot-check） | **EXIT=0** | 零断言改动（仅 fixture v6 形状） |
| `resume-grounding:prove:raw` | —（spot-check） | **EXIT=0** | fixture v6 形状（55→below 档位） |
| `adaptive-latency:prove` | —（spot-check） | **EXIT=0** | fixture v6 形状 |
| `stress:prove:raw`（context-stress） | **EXIT=1·恰 7 FAIL** | **EXIT=1·恰同 7 FAIL** | **既有 base 红逐条同形**（pristine 对照在卷：真实截断 nonce 断言+图未运行家族 5 条——本环境既有红，非 S2 引入）。S2 首跑曾有第 8 条差异红（观测信道被 v6 buildData 量表尾污染），经段序修正（回答恒在末尾）后回到同形——见 §4 披露 2 |
| `pnpm -C apps/worker prove:security` | **EXIT=0**（亲跑对照） | **EXIT=0** | §③ schema 断言随 v6 重写（总分字段=契约外被剥离·全 below/relevant 不变量·criterionId 去重） |
| `pnpm typecheck`（tsconfig.e2e） | EXIT=0 | **EXIT=0** | 零新增 |
| `tsc -p apps/worker/tsconfig.json --noEmit` 误差清单 diff | 既有红清单（r4-p 系等·app 级配置非维护门） | **与 pristine 逐字节同清单** | 零新增 |
| `tsc -p apps/api/tsconfig.json --noEmit` 误差清单 diff | 既有红清单 | **与 pristine 逐字节同清单** | 零新增 |

未跑键披露：`adaptive-attack`（live 红队 smoke·需 MODEL_API_KEY·est live>0 不授权跑）已做 v6 normalize 最小改造保持编译+语义诚实，其实跑验证归下次 live 授权窗；`smoke/scoring-eval` 同为 live 面（改用 `evaluateOutcomeFromValue` 派生·编译干净）。

## 4. prove 迭代披露（禁 retry-to-green 核查）

1. interview:prove 全程 **2 跑**（pristine 基线 1 + S2 终版 1）——一次通过，零重试。scoring-integrity 2 跑（基线+终版）——同形红，零修复尝试（既有红不在 S2 修复面）。
2. **fixture 值断言随 v6 契约更新**（非断言弱化·契约级联维护）：`adaptive-lifecycle.proof.ts:55/:74` 与 `adaptive-flow.proof.ts:52` 钉的 `score===88` 系 v5 自由 hint 分，v6 下同 fixture 档位派生恒 100——断言值随契约更新并注明。首跑（更新前）EXIT=1 如实入账（`extra-proves.txt`），更新后 EXIT=0。
3. **context-stress 观测信道修正**（S2 引入→S2 内收口）：v6 buildData 首版把量表段接在回答之后，按 `回答:` 贪婪截取的测试观测面把量表尾误并入答案（quote 门 fail→第 8 条差异红）。修正=**段序钉死回答恒在末尾**（同时更贴合「capUserData 头截绝不切被打分答案」既有审计不变量），非测试放宽；修正后 stress 回到与 pristine 逐条同形的 7 红。
4. **security.proof 断言语义修正**：首版断言「含 score 键的 payload 被 schema 拒」不准确——Zod 非 strict 对契约外键是 strip 非 reject。改为诚实语义：score 键被剥离进不了输出形状（`!('score' in parsed.data)`），派生分只来自档位。v5 的越界拒绝（999 越界）在 v6 下对应「总分字段整体不在契约」——Ban「model 输出总分」的执行机制=v6 契约无总分字段+worker 零读取，非 schema 拒收。

## 5. D5 三钉落位声明（rev2 义务）

- **(i) GAP=60 单源**：`packages/domain/src/assessment.ts` `export const GAP = 60`（S1 已单源化·本刀未动值）；新派生路径唯一引用 `import { GAP } from './assessment.ts'`（scoring-aggregation.ts）——`rg "score < |< GAP"` 于新增代码仅 `const gap = score < GAP` 一处，零字面量散布。
- **(ii) 持久化维度形状冻结**：`deriveScoreCardAssessmentLegacy` 返回 legacy `Assessment`（`dimensions:[{dimension,score,gap,evidence}]`+`weaknesses`），evidence 文案 legacy parity（'低于达标线，需加强'/'达标'）；`assessment_report.dimensions` JSON 落库形状不变；`interview.service.ts` generateCareerPath 的 `d.gap` 过滤（:673）与 web 消费**零改动**（git status 亲证 apps/web 零文件）。
- **(iii) INSERT 前派生**：`generateAssessmentFor` 先 `deriveScoreCardAssessmentLegacy(cards)`（domain 纯函数）后 INSERT；409 `no_scorable_cards` fail-closed 信封原样（cards 空/派生空集双门）。

## 6. 停止条件核查（蓝图 §5 Ban·五条全未命中）

1. **S3 面越界=未命中**：#42 对拍/#43 INSERT 白名单测试/#47 类型统一/#41 ADR 全部零触（git status 无对应文件）。
2. **零迁移=未命中**：无新增 migration；0100/0103/0109/0126 契约零触。
3. **零 G7 面=未命中**：G7 车道/套件/live Key 零触碰；`g7SuiteGreen=false` 不翻。
4. **SSOT 零触=未命中**：backlog/matrix/checklist/queue/issues-master 零编辑（REQUEST 状态行为授权 append-only 面）。
5. **Ban secrets/retry-to-green/假绿=未命中**：Key 值零接触（scripted/本地 fake HTTP）；prove 迭代全披露（§4）；既有红如实保留（scoring-integrity/stress 双对照在卷）。Ban「保留 loadSummary 桩蒙混」已兑现=桩废除+双面诚实断言。

## 7. Pins（十一值照抄·零翻转）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（业务+LangGraph PostgresSaver+pgvector·禁 MySQL/Qdrant 业务切流叙事）· 公开 DELETE /privacy/interview-data/:id=503 · `g7SuiteGreen=false` · `actualSpendCny=null` · r1Closed=false

## 8. Non-claims

本刀 ≠ 评分体系完成（#104 读面 v2/#45 五档级别另刀）；≠ 多分项 rubric 评分质量已证（v6 行为验证属 eval 面·seed 单分项档位≠校准）；≠ adjudicate 接线（seed 单分项下仍结构性不触发·随 EXTREV-4 扩项）；≠ 存量面试追溯供卡（升级窗 v5 checkpoint 回合跳写=rev2 残余登记延续）；≠ 图家族报告可用（0126 围栏下 fail-closed failed=#20 形状如实·家族合流归 INT-TRANSCRIPT-01）；E2E 绿 ≠ HA ≠ releaseEvidence。

## 9. 结构性登记（EXEC 期亲证·非停止项）

1. **hint 分语义迁移**：v6 起 `answer_evaluated.score`（SSE 进度/完成判定 hint）=档位确定性派生（seed 下 0/50/100），非模型自由输出——完成判定 eligible 计数（payload score 0..100 数值域）不受影响（prove 亲证）。
2. **checkpoint 审计投影扩面**：Turn 增 `dispositions`（criterionId+disposition+byte span+spanDigest）——派生物非答案原文，与 score_card/ai_invocation_trace 既有敏感级同类；quote 原文仍只在 evaluate 期内存态（toEvidenceRecord 后即弃·trace 断言亲证不含原文）。
3. **升级窗 face**：部署切换时在途 v5 checkpoint 回合无 dispositions→写卡步跳过（结构性不供卡），同 rev2「存量 interview 不追溯供卡」；新回合全量 v6 供卡。
4. **rubric 评分期供给**：种子期经 `SCORING_SEED_CRITERION_ID` 常量单源（与发布侧 D1 同款）；多分项 rubric 的评分期 DB 读取面（DEFINER）归 EXTREV-4 QBANK-CORPUS 扩项域。

## 10. 交付物

- commit：`line/extrev-score-writer` 单 commit（author `mw-scorewr-exec3`）· push origin。
- 日志在卷：`2026-10-10-*-pristine-base.log`（interview/scoring-integrity/stress 三对照）+ 终版 prove 日志（见目录）。
- REQUEST 状态行：append-only 追加 S2 EXEC 登记段（`executed_s2:awaiting_post_prove_dual`）。

*EXTREV-1 SCORE-WRITER · S2 EXEC · mw-scorewr-exec3 · 2026-10-10 · est live=0 · alone ≠ dual · awaiting post-prove dual*

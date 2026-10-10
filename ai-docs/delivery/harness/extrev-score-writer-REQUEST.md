# REQUEST — **EXTREV-1 SCORE-WRITER 评分卡写入接线刀**（外部评审双 P0 #40+#20 · 最大产品洞 · 设计面先钉死再写码面 · docs-only 起草）

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（docs-only 起草 · Ban coding · Ban prove 执行 · Ban self-approve · alone ≠ dual · 不代签 peer）
**Line**: **EXTREV-1 SCORE-WRITER**（战役 SOP `ai-docs/delivery/harness/extreview-fix-campaign-SOP.md:16-21` EXTREV-1 节首刀 · 覆盖 #40/#20 双 P0 + #50/#52/#103 + 收尾 #41-#43/#47）
**Base tip**: `5636d58d`（`origin/feat/mysql-schema-skeleton` 2026-10-07 fetch 实测 · 外部评审基线 `2fab7946` 距主线仅 4 commit · 本文全部 file:line 于本 worktree `5636d58d` **亲读复核** · 评审原文行号漂±已在 §3 逐条勘误）
**Author**: `mw-scorewr-draft`（REQUEST 起草席 · 实现不自批）
**Date**: 2026-10-07
**依据**: ①`extreview-fix-campaign-SOP.md:16-21,52-56`（EXTREV-1 节+执行规则 1/3/5）②外部总表 `/Users/miaole/Documents/Meetwise学习与审查/01-成品文档/issues-master.md` #40(:98)/#20(:97)/#50(:294)/#52(:296)/#103(:330)/#41(:471)/#42(:190)/#43(:329)/#47(:472) ③`/Users/miaole/Documents/Meetwise学习与审查/01-成品文档/fix-roadmap.md:38-62`（第 1 批方案+验收标准）

---

## §0 立靶（SOP 引用 + 两 P0 现状亲验）

**SOP 立项依据**（`extreview-fix-campaign-SOP.md:16-19`）：EXTREV-1 评分卡主线为「P0 产品洞·最大单刀」，SCORE-WRITER 覆盖「#40 worker 评估节点接 writeFinalScoreCard/adjudicateScoreCard（lease+CAS）/ #20 报告链 E2E 验证 / #50 报告节点结构化输入 / #103 旧新聚合器切换 / #52 rubric 评分路径 / 收尾 #41-#43/#47（roadmap:45-47 第 1 批尾部）」，无前置依赖。SCORE-READ-V2（#104）与 LEVEL-SCHEME（#45 系）均**依赖本刀**（SOP:20-21）。

**两 P0 现状亲验（@5636d58d · 2026-10-07 本 worktree 实测）**：

- **#40 评分事实根已落库但零写入方——grep 亲证**：
  - `grep -rn writeFinalScoreCard --include="*.ts" apps/ packages/`：命中仅 `packages/db/src/scoring-aggregation.ts:62`（定义）、`packages/db/src/index.ts:356`（re-export）、`packages/db/test/scor-02.proof.ts`/`growth.proof.ts`（测试）——**apps 生产面零调用**（与总表 #40 核实度「已核实（搜索范围 apps/**/*.ts）」一致，本轮独立复证）。
  - `adjudicateScoreCard` 同形：定义 `packages/db/src/scoring-evidence-conflict.ts:66`、导出 `packages/db/src/index.ts:365`、测试 `packages/db/test/scor-03.proof.ts`——apps 零调用。**行号勘误**：总表 #40 file:line 写「scoring-aggregation.ts:62,96」——`:62` writeFinal 准确、`:96` 实为读面 `listScorableScoreCards`；adjudicate 实位于 `scoring-evidence-conflict.ts:66`（SCOR-03 面·0109），非 aggregation 文件。以本勘误为准。
  - **上游两阶段同样零接线（本轮新增发现·总表未列）**：`publishQuestionRubric`（`scoring-fact-root.ts:106`）/`issueQuestionContract`（`:119`）/`createScoreRequest`（`:132`）/`claimScoreRequest`（`:144`）/`recordScoreCard`（`:171`）/`asScoringWorkerPrincipal`（`:25`）在 apps 生产面**全部零调用**（唯一命中 `apps/worker/src/r4-funnel-covered-count-batch3.ts:140-141` 系正则文本引用非调用）。**⇒ 本刀不是「补一个调用」而是接通「rubric 发布→issue 契约→score_request→claim(lease)→write/adjudicate(CAS)」全链**——单刀过大的主要根源，切片建议见 §尾。
- **#20 报告链恒失败——读侧代码链亲读坐实**（总表核实度「推断（有代码链，未跑真实流程）」· 本轮补一实证）：
  1. `apps/worker/src/main.ts:175-180`（reportWorkerDeps.loadSummary·亲读）：`listScorableScoreCards(c, interviewId)` → `scores = cards.map(card => card.deterministicTotal)`；`:177` 注释自认「无卡 → scores 空(aggregateScores 空集会抛 score_aggregate_empty,报告走 unavailable,绝不回退 legacy 分数)」。
  2. `apps/worker/src/interview-service.ts:293`（reportGenerator·亲读）：`const overall = aggregateScores(s.scores); // 空集或越界 score 由确定性聚合门拒绝`——`aggregateScores`（`packages/domain/src/assessment.ts:33-38`）空集 `fail('score_aggregate_empty')`。
  3. ⇒ 零写入方 ⇒ scores=[] ⇒ 抛错 ⇒ report failed/requeue 耗尽 → `report_unavailable`（已扣费无报告）。
  4. **既有 prove 为何全绿（假绿面·本轮亲读新发现）**：`apps/worker/test/interview.proof.ts:157-160` 报告链 proof **桩掉了 loadSummary**——`loadSummary: () => ({ ..., scores: Array.from({length: after.evaluated}, () => 80) })`（伪造 80 分数组）。生产 loadSummary 路径从未被任何 prove 行使——这正是 #20 只能「推断」的根因，也是本刀 §4 E2E 必须**真实 loadSummary 化**的硬要求（去 :158 桩）。
  5. 读侧其余消费点（均已迁 ScoreCard·fail-closed）：`apps/api/src/modules/interview/interview-report.ts:81`（transcriptView·`listScorableScoreCards`·无卡 null）；`apps/api/src/modules/interview/interview-assessment.ts:24,27`（generateAssessmentFor·无卡 409 `no_scorable_cards`）。

## §1 范围（设计面先钉死再写码面）

**目标**（fix-roadmap.md:40）：让生产路径真的写出 `score_card`，并保证报告、评估、聚合三条下游拿到输入。**纪律**：本 REQUEST 先钉设计契约，coding 须待预执行双审 BOTH PASS + meetwise 授权（§8）。

1. **S1 写入面（#40 主体）**：worker 评估节点（`apps/worker/src/adaptive-interview-service.ts:239-271` assess·亲读）后接 score-writer，接通全链（**设计待双审钉死 D1-D5**）：
   - **D1 rubric 供给**：出题链路接 `publishQuestionRubric`（版本化+criteria 冻结）——最小 seed（自适应出题侧逐题发布 vs qbank 导入侧批量发布）由双审定值；出题投影处发 `issueQuestionContract`（冻题不冻答·绑 rubricId·12 参见 `scoring-fact-root.ts:62-75`）。
   - **D2 submission 绑定**：答案 claim/submission 处发 `createScoreRequest`（绑 0092 canonical artifact：`interview_answer_submission`/`interview_answer_artifact`·`0092_int_transcript_answer_fact_root.sql:55,77`·亲读；claimInterviewAnswer 邻域 `interview-question.ts:69-96`）。
   - **D3 lease 形制**：worker `claimScoreRequest`（pending→claimed 单次 CAS·permit leaseToken）→（可选 `markScoreRequestDispatched`）→ 写卡；fence 序（`fenceScoreRequest`·删除/撤权先赢）。
   - **D4 接线位与幂等**：评估投影事务邻域（`adaptive-lifecycle.ts:263-318`·answer_evaluated 事件 `:276,:310` 两处·`:305-309` 注释亲读自认「模型产 disposition（非自由总分）属 SCOR-03，不在本处实现」=本刀兑付该欠账）；at-least-once 投递下按 card 键幂等（roadmap:61）——asScoringWorkerPrincipal 事务边界与事件投影事务的同/异_txn 选择由双审钉死。
   - **写卡调用形制（签名亲读）**：`writeFinalScoreCard(c, {requestId, leaseToken, evidence:[{criterionId, sourceAnswerId, answerVersion, span{offsetKind:'utf8_byte',start,end}, spanDigest, disposition}], targetStatus})`（`scoring-aggregation.ts:27-42,62`）；冲突/多来源走 `adjudicateScoreCard(c, {requestId, leaseToken, evidence:[…+reverified], uncertainty(8源), highImpact})`（`scoring-evidence-conflict.ts:46-66`）。**模型只输出 criterionId+span+digest+disposition，总分在 DB 函数内确定性计算（0103:99/0109:200）**。调用方须 `asScoringWorkerPrincipal`（scoring_worker_executor·`scoring-fact-root.ts:25-35`）。
2. **#20 报告链 E2E 验证**：隔离库跑 begin→作答×N→收尾→报告全链，断言 EXIT=0、评分卡非空、`aggregateScores` 不抛、report 200/ready、事件流无 report_unavailable（§4）。
3. **#103 旧新聚合器切换**：`apps/api/src/modules/interview/interview-assessment.ts:10,33-34`（亲读）`deriveAssessment` → `deriveScoreCardAssessment`（`packages/domain/src/scoring-aggregation.ts:124-147`·亲读）；rg 断言生产面无 `deriveAssessment` 调用方（roadmap:56）。**D5 语义保全（非 drop-in）**：legacy 返回 `{overall, dimensions:[{dimension,score,gap,evidence}], weaknesses}`（`assessment.ts:52-58`·gap/weaknesses 喂 `deriveCareerPath`·`career.ts:10`·`interview.service.ts:661-670` 亲读），新聚合器无 gap/evidence/weaknesses 成员——扩 `deriveScoreCardAssessment`（domain 面）或在消费层补 gap/weaknesses 派生，方案由双审钉死后方可动码。
4. **#50 报告节点结构化输入**：`prompts.ts:111-114`（report.generate v2 buildData 只喂 `各题分数:[]`·亲读）+ `interview-service.ts:301`（`{scores: s.scores}`）→ 升 v3 传题目/能力/证据摘要维度（evidenceId 引用·不传原文），loadSummary 侧供 `competency` 分组结构（读面已带 `ScorableScoreCardRow.competency`·`scoring-aggregation.ts:57-59`）。
5. **#52 rubric 评分路径**：`prompts.ts:85-98`（mock-interview.evaluate v5 模型直出 0-100 整数·亲读）→ 评分改走 rubric+criterion disposition（评分卡路径），模型不出总分；量表锚点/rubric 版本随提示词版本化。旧 evaluateAnswer 证据结构（span+quoteSha256·`scoring-report-integrity.proof.ts:38-40` 亲读）可作 span/digest 供料底座。
6. **收尾 #41-#43/#47**：#41 ADR-0020 `proposed`→`accepted`（`ai-docs/architecture/adr/0020-*.md:7`+`README.md:77`·亲读）；#42 TS↔SQL 状态机/总分公式对拍测试（测试面·`packages/domain/src/scoring-fact-root.ts` vs `0100:385-422`/`0103:234-240`/`0109:157-193`）；#43 write 函数 INSERT 终态白名单**测试覆盖**（`0100:421-422`·亲读定位）；#47 `assessment_report.dimensions.evidence` 类型统一（TS 侧 `assessment.ts:6,53` vs DDL 注释 `0001_baseline.sql:341`）。

## §2 非范围（划界防双改/扩权）

- **SCORE-READ-V2 #104 / LEVEL-SCHEME #45/#102/#105/#124/#125 系另刀**（SOP:20-21 明示依赖本刀后立项）；`interview.service.ts:674` 级别判定三档面零触。
- **零迁移**：表/触发器/写入函数已落库主线（0100/0103/0109·`ls packages/db/migrations` 亲证存在·函数位 0103:99,301,330 / 0109:40,200 亲读）——本刀**不新增任何 migration**。#43 的「补 BEFORE INSERT 触发器」迁移形态**不做**（改测试覆盖形态·§1.6）；若双审裁迁移形态则移交 EXTREV-3B DB-CONSTRAINT 立账。#47 的 DDL 注释修不新开迁移，登记「下次触该面迁移顺带」。
- **零 G7 面**：G7 车道/套件/live Key 三剑客零触碰；`g7SuiteGreen=false` 不翻。
- **SSOT 零触**：backlog/matrix/checklist/queue 仅 nail 期经协调方改；本刀不翻任何 OPEN/CLOSED 行（含 issues-master 侧状态——那是外部文档，回写归协调方）。
- **与 TOKSTREAM S4b 交叠声明**（SOP:54 规则 3 交叠归先立项者）：S4b（`tokstream-s3-design.md:205`·亲读）= worker 观察缝 `apps/worker/src/` token-stream.ts+三触发面接线（model-client declare 面）；本刀=评估节点**后置写入**接线面（assess 返回后、投影事务邻域）。两刀同触 `adaptive-interview-service.ts` 邻域但不同接线点：**触发面（withTokenStream 包裹）归 S4b 先立项；评估后写入接线归本刀**；EXEC 期谁后落谁 rebase，共享函数签名变更须互引先刀 commit。
- **qbank 逐题 rubric 语料建设归 EXTREV-4 QBANK-CORPUS（#76）**：本刀只做 rubric 的**发布/消费机制接线**与最小 seed（D1），不做题库级 rubric 内容工程。
- **评分擦除面对齐（roadmap:61 尾注）**：score_card 一旦有写入即进隐私擦除盘点面——与 3A #183 的对齐**仅登记不动手**，归 PRIVACY-FACE 刀。

## §3 逐条改动清单（file:line 全亲读 @5636d58d · 外部评审行号漂±已勘）

| # | 面 | 锚点（亲读） | 改动 | 备注 |
|---|---|---|---|---|
| 1 | rubric 发布（D1） | `scoring-fact-root.ts:37-60,106-116`；0109:40 | 出题/评审链路接 `publishQuestionRubric`（版本化+criteria 冻结）；最小 seed 策略待双审 | apps 零现状调用方 |
| 2 | issue 契约 | `scoring-fact-root.ts:62-75,119-129`；`adaptive-lifecycle.ts:177,269-272,314-317`（question_ready/persistInterviewQuestion） | 出题投影事务发 `issueQuestionContract`（冻题不冻答·绑 rubricId） | 需 questionContentHash/epoch 等 12 参 |
| 3 | score request | `scoring-fact-root.ts:77-86,132-141`；`interview-question.ts:69-96`（claimInterviewAnswer）；0092:55,77 | 答案 claim/submission 处发 `createScoreRequest`（绑 submissionId/artifactId/answerBodyHmac） | 0092 artifact 面已落库 |
| 4 | claim/lease | `scoring-fact-root.ts:25-35,144-159`；`scoring-fact-root.ts:162-167`（fence） | worker `claimScoreRequest`→(dispatch)→fence 复验序 | asScoringWorkerExecutor |
| 5 | 写卡（#40 核心） | `scoring-aggregation.ts:27-80`（writeFinal）；`scoring-evidence-conflict.ts:23-86`（adjudicate）；`adaptive-lifecycle.ts:263-318` 接线位 | assess 后置写入：evidence 组装（criterionId/span/digest/disposition）→ writeFinal；冲突面走 adjudicate | 模型不出总分 |
| 6 | 报告读链（#20） | `main.ts:175-180`；`interview-service.ts:289-311`（:293 aggregateScores·:301 scores-only） | 生产 loadSummary 不改语义（本已 fail-closed）；补 E2E 真实行使（§4） | #50 在 :301+prompts 扩维 |
| 7 | 评估提示词（#52） | `prompts.ts:85-101`（v5 直出 0-100） | 升 v6：rubric+criterion disposition（below/meets/exceeds）+量表锚点+rubric 版本 | 总分禁模型输出 |
| 8 | 报告提示词（#50） | `prompts.ts:111-115`（v2 scores-only） | 升 v3：结构化维度输入（competency/questionId 摘要+evidenceId·不传原文） | |
| 9 | 聚合切换（#103） | `interview-assessment.ts:10,24,27,33-34`；`domain/scoring-aggregation.ts:124-147`；`assessment.ts:52-58`；`interview.service.ts:661-670`；`career.ts:10-19` | 切 `deriveScoreCardAssessment`；gap/weaknesses 语义保全方案（D5）；rg 断言零 deriveAssessment 生产调用 | 非_drop-in |
| 10 | 对拍/白名单（#42/#43） | `domain/scoring-fact-root.ts`（TS 状态机/公式）vs 0100:385-422/0103:234-240/0109:157-193 | TS↔SQL 对拍 proof；write INSERT 终态白名单测试 | 测试面·零迁移 |
| 11 | 类型统一（#47） | `assessment.ts:6,53`；`0001_baseline.sql:341`；web 消费 `report/[id]/page.tsx:24`/`share/page.tsx:12`（均亲读·gap 可选/必有漂移） | TS 侧 evidence 数组化统一+注释钉口径 | DDL 注释归后续迁移 |
| 12 | ADR（#41） | `adr/0020-*.md:7`；`adr/README.md:77` | proposed→accepted + 状态目录行 | 接线落地后 |

## §4 Prove（隔离库 E2E 主链 · prove 键照仓内惯例）

- **主证**：`pnpm interview:prove`（根 `package.json:230` → `scripts/run-e2e-isolated.mjs interview:prove:raw`:457-463 → `apps/worker/test/interview.proof.ts`）——**去 :157-160 loadSummary 桩**，改用生产 `reportWorkerDeps`（或同形制真实 loadSummary），断言：begin→作答×N→completed→drainReportsOnce→report `ready`；`score_card` 行数=已答题数（roadmap:54）；`aggregateScores` 不抛（scores 非空）；事件流无 `report_unavailable`；`assessment_report` 生成不 409（#103 验收 roadmap:55）。期望 **EXIT=0** + 断言计数如实宣布。
- **辅证**：`pnpm scoring-integrity:prove`（根 :423 → `apps/worker/package.json:51` → `scoring-report-integrity.proof.ts`）扩展：score-writer 写入路径（lease+CAS 幂等重放/fence 先赢/终态白名单）+ #42 TS↔SQL 对拍段。
- **证明键选择**：优先扩既有两键（沿仓内「扩既有 prove 禁另立假门」惯例）；若 S1 面单大需独立键，新键照惯例双注册（根 package.json + `run-e2e-isolated.mjs` target 表）——**最终键形制由预执行双审裁**。
- **est live 预算如实**：主/辅证均走 `scriptedModelClient`（`model-client.ts:139`）fake seam（interview.proof.ts:39-45 先例·零真实外呼）→ **est live=0**、0 Key 值接触、`actualSpendCny=null`；若双审裁需 scripted→live 模型段（如 report v3 提示词真测），则 **est live ≤25 CNY** 且双计入账（est 预算行+attempts 台账双录），禁超限即停如实记中止。attempts 一次优先，Ban retry-to-green。

## §5 Ban

Ban 迁移（本刀零 migration·0100/0103/0109 已落库不重写）· Ban 触 G7 面/车道/live 套件· Ban SSOT 编辑（backlog/matrix/checklist/queue/issues-master 状态行·nail 期归协调方）· Ban secrets/`.env*`（Key name-only·值/fingerprint 禁入卷）· Ban self-approve/代签 peer（alone≠dual）· Ban retry-to-green/masking/假绿叙事（含保留 loadSummary 桩蒙混）· Ban 把本刀写成「评分体系完成」（见 §7）· Ban 动 RLS 授权根/asPrincipal 语义· Ban 顺手做 #104/#45/#102/#105/#124/#125（另刀域）· Ban 顺手做 #183 擦除对齐（仅登记）· Ban model 输出总分（disposition-only 铁律）· Ban 删/弱化 0103 确定性公式与既有 fail-closed 读侧（无卡=null/409/unavailable 语义不回退 legacy 分数）· Ban push 冒充执行（docs-only 起草期）· Ban Meridian· Ban buy cloud。

## §6 Pins（十一值照抄 · 本刀不改口）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（业务+LangGraph PostgresSaver+pgvector·禁 MySQL/Qdrant 业务切流叙事）· 公开 DELETE /privacy/interview-data/:id=503 · `g7SuiteGreen=false` · `actualSpendCny=null` · r1Closed=false

## §7 Non-claims

本刀 ≠ 评分体系完成（#104 读面 v2/#45 五档级别/难度加权均另刀）；≠ #45 级别判定改造（三档面零触）；≠ B 端 adjudication 人审产品面（只落 review_required 路由）；≠ rubric 语料/题库内容工程（EXTREV-4）；≠ #42「SQL 唯一真相」终局（只钉对拍测试·生成化方案另裁）；≠ CI 门禁接入（#98 nightly 归 EXTREV-2）；E2E 绿 ≠ HA ≠ releaseEvidence；评分卡非空断言过 ≠ 评分质量/校准已证（eval 面另立项）。

## §8 STOP

本 REQUEST 为 docs-only 起草，**不授权 coding/prove 执行/实跑/push**。下一步：预执行双审（`awaiting_pre_exec_dual`·建议 e2e-ha + model-op 双域——报告链 E2E 诚实面归前者·invoke/lease/幂等与预算面归后者）BOTH Verdict: PASS → meetwise 授权 EXEC（含附录切片表裁定与 D1-D5 定值）→ coding+prove 一次优先 → post-prove 双审 → meetwise 授权 nail。implementer 不自批 · **alone ≠ dual** · **STOP**。

---

## 附：大刀切片建议（供双审裁 · 沿 tokstream-s3 §I 先例·每片独立收据·序依赖 S1→S2→S3）

| 切片 | 触碰面 | 内容 | 关键验收 | est live |
|---|---|---|---|---|
| **S1** 写入接线 | §3.1-5（worker+db 调用面） | rubric 发布/issue/request/claim 全链接线 + writeFinal/adjudicate（lease+CAS·幂等） | scoring-integrity:prove 扩展绿（写路径幂等/fence/白名单）；interview:prove 仍绿（score_card 行数=已答数） | 0（scripted seam） |
| **S2** 读侧切换 | §3.6-9（report/assessment 消费面） | 真实 loadSummary 化（去 :158 桩）+ #103 切换（gap/weaknesses 语义保全）+ #50/#52 提示词 v3/v6 | interview:prove 报告链真实路径绿；rg 零 deriveAssessment 生产调用；assessment 不 409 | 0（scripted seam；若裁 live 提示词段 ≤25 双计入账） |
| **S3** 收尾 | §3.10-12（test/docs 面） | #42 对拍 + #43 白名单测试 + #47 类型统一 + #41 ADR accepted | 对拍 proof 绿；ADR-0020 accepted | 0 |

切片理由：S1/S2 触面不相交（worker 写入 vs api/web 读消费），可分刀双审收口防单刀过大；S2 依赖 S1 供卡；S3 纯测试/docs 收尾。**整刀直落（不切）亦为可选项**——由预执行双审裁定，若整刀落则本表作 EXEC 内部序依据。

---

*REQUEST stub · EXTREV-1 SCORE-WRITER · Line EXTREV-1 · mw-scorewr-draft · 2026-10-07 · PENDING awaiting pre-exec dual · alone ≠ dual · Ban push · STOP*

## rev2 双审收口（2026-10-09 · 席1 PASS+席2 PASS·裁定转为 EXEC 义务）

- **D6 裁定=(a) 阈值映射**：S1 过渡 disposition 供源=score<60→below·60≤score<85→meets·score≥85→exceeds（60 锚 legacy GAP 单源·85 过渡锚命名常量单点+注释 DELETE-ON: #52 v6(S2)）；S2 验收加 rg 门 v5→disposition 桥零残留；S1 收据声明过渡窗卡总分为 0/50/100 档位化值≠v5 hint 分。
- **D5 裁定=domain 聚合器侧 INSERT 前派生**：三条钉——(i) GAP=60 单源（assessment.ts:9 导出复用禁字面量散布）；(ii) 持久化维度形状冻结 {dimension,score,gap,evidence}（interview.service.ts:661+web 零改动）；(iii) 派生在 generateAssessmentFor INSERT 前（扩 deriveScoreCardAssessment 或 legacy-parity 适配函数均可——零生产调用方无人破坏）。
- **D4 裁定=后置异 txn**：投影事务提交后·同一 answer-job drain 内·独立 asScoringWorkerPrincipal 事务写卡；job 未 done 前完成→requeue at-least-once+0100 CAS exactly-once 效果。**恢复钉**：crash 重放复用 claim 返回的既有 lease_token（禁新造·否则永久 claim 不到）。三租约域互不耦合。
- **D2 勘误**：createScoreRequest 绑 API submit 事务邻域（与 0092 写入同事务原子·int-transcript.ts:114/139/157+interview.service.ts:402），非 claim 位。
- **S2 默认 est 0 不切 live**（v6 提示词行为验证属 eval 面·≤25 仅显式授权启用）。
- **EXTREV-7 对齐定谳**：五环链=已落库 DB 契约（0100:166-168 三列 NOT NULL FK 链+表级 INSERT 仅授 scoring_definer_owner+角色分离）——「直写跳中间件」在 schema+权限双层不可能，全链接线即最小合法路径，简化优先不违。
- 残余登记：存量 interview 不追溯供卡（同今日 #20 形状非回归·收据声明）·score_request 卡 claimed 无超时回收（后续刀）·D1 difficulty 需图状态 plumbing。
- Status: `draft_rev2:pre_exec_dual_PASS`（双席 BOTH PASS·EXEC 授权·S1 起跑）。

## S1 EXEC 登记（2026-10-09 · mw-scorewr-exec · append-only）

- **Status**: `executed_s1:awaiting_post_prove_dual`（S1 写入接线全链落地 + D6 过渡桥 + S1 prove 绿·收据 `ai-docs/delivery/receipts/extrev-score-writer/S1/2026-10-09-s1-exec-prove.md`）。
- interview:prove **EXIT=0 全绿**（含卡数断言 score_card=已答数·D4 lease_token 复用·D6 三档 0/50/100·:157-160 桩保留）；base 红（fixture 缺 0142 route 供给）以生产同链供给修复，非 flag opt-out。辅证 scoring-integrity 既有 base 红（pristine 同形对照在卷·非 S1 引入）。
- 结构性登记：图 questionId 跨面试碰撞→rubric 全局键 `iv:{interviewId}:{questionId}` 命名空间化；0126 双写围栏⇒明文 /turn 家族 S1 过渡窗结构性零卡（同今日 #20 形状非回归·收据 §2/§6）；adjudicate 在单分项 seed 过渡窗结构性不可达（S2 v6 兑现）。零迁移·零 S2 面·零 live（est live=0）。

## S1 EXEC 续作登记（2026-10-09 · mw-scorewr-exec2 · append-only）

- 前任席 prove 完成后 commit 前配额中断（18 staged 脏文件·零 unstaged/untracked）。续作席逐文件 `git diff --cached` 盘点对照 §1.S1+rev2（D6/D5/D4/D2/D1）：**判定=合规→续作（保留合规面·补缺），未 reset**。判定表+承继声明入收据 §0 续（`2026-10-09-s1-exec-prove.md`）。
- 续作席独立复跑 `pnpm interview:prove` **EXIT=0 原值**（29 PASS/0 FAIL·续作确认跑非 retry-to-green·日志 `2026-10-09-exec2-continue-interview-prove.log` 在卷）+ typecheck EXIT=0；:157-160 桩（现 :316）字节原样保留·卡数断言在卷·est live=0。
- **Status**: `executed_s1:awaiting_post_prove_dual`（承继前任同一状态·续作收口=commit+push·post-prove 双审待启）。

## S2 EXEC 登记（2026-10-10 · mw-scorewr-exec3 · append-only）

- **Status**: `executed_s2:awaiting_post_prove_dual`（S2 读侧切换全四项落地·收据 `ai-docs/delivery/receipts/extrev-score-writer/S2/2026-10-10-s2-exec-prove.md`）。
- ①D6 桥废除：`dispositionFromHintScore`+`SCORE_HINT_EXCEEDS_THRESHOLD` 删除（DELETE-ON 兑现）·rg 门 v5→disposition 桥零残留（GATE-A/B/C 零命中在卷）·#52 提示词 v5→v6（量表逐分项判档+逐字引文·总分禁模型输出·量表段序钉死回答恒在末尾）·`SCORING_PROMPT_POLICY_VERSION`→v6·score-writer 供源=模型直供档位（hintScore 参数删除·写卡前 span 文本级复验 fail-closed）。
- ②去桩：interview.proof :315-316 loadSummary 桩（伪造 80 分数组）废除→生产同形制真实 loadSummary 双面行使：图家族（0126 围栏零卡）真实链 **fail-closed failed**（#20 形状如实）+账本家族（实卡）生产同链 enqueue→drain→**ready**·overall=确定性聚合 63·零 report_unavailable。
- ③#103 切换+D5 三钉：生产消费面切 `deriveScoreCardAssessmentLegacy`（D5 legacy-parity 适配·domain 纯函数）；(i) gap 唯一经 `GAP` 单源（新增代码零 60 字面量）；(ii) 持久化形状冻结 `{dimension,score,gap,evidence}`（interview.service:673+web 零改动·git status 亲证）；(iii) generateAssessmentFor INSERT 前派生；rg 门：生产面零 legacy 聚合器调用（严格调用形制 GATE-B 零命中）。
- ④#50 v3：`InterviewSummary.items`（questionId/competency/score/cardId 仅 ID 引用·不传原文）+生产 loadSummary 供给+`report.generate` v2→v3；overall 仍服务端确定性聚合。
- prove 终版：`interview:prove` **EXIT=0（33 PASS/0 FAIL·基线 29 PASS 对照·去桩后 +4 诚实断言）**；`scoring-integrity:prove` **EXIT=1 既有 base 红逐字节同形**（①c :99:50 hasOwn TypeError·pristine 对照在卷·非 S2 引入）；spot-check：adaptive-flow/life/consumer·resume-grounding·adaptive-latency **EXIT=0**·security EXIT=0·context-stress 与 pristine **恰同 7 FAIL 同形**（既有环境红如实）；tsc 三门（root e2e/worker/api 清单 diff）**零新增**；est live=0·actualSpendCny=null·0 Key 值接触。fixture 值断言随 v6 契约更新（88→100·buildData 段序·security strip 语义）三项披露全在收据 §4。
- 结构性登记：hint 分=档位确定性派生（seed 0/50/100）；Turn checkpoint 增档位证据投影（派生物无原文）；升级窗 v5 checkpoint 回合跳写（存量不追溯供卡延续）；rubric 评分期供给=seed 常量单源（多分项读取面归 EXTREV-4）。
- 零迁移·零 S3 面（#42/#43/#47/#41 零触）·零 G7 面·SSOT 零触（本行=授权 append-only 面）·pins 十一值零翻转。

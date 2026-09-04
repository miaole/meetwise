---
id: adr_0020_scorecard_authority_and_eligibility
name: ADR-0020 评分卡事实权威与资格门
description: 规定评分事实必须从不可变已发题合同、版本化 rubric 和专用评分写者产生；事件分数不再是可消费事实。
type: reference
scope: shared
level: guide
status: proposed
owner: architecture
related:
  - ./README.md
  - ../../requirements/use-cases/interview-scoring-measurement.md
  - ../../requirements/use-cases/application-assessment-terminal.md
  - ../ai/scoring-measurement-runtime.md
  - ../../delivery/execution-master-checklist.md
---

# ADR-0020 评分卡事实权威与资格门 · proposed

## 背景

当前面试链可以证明题目/答案 identity、幂等和部分 answer quote 校验，但评分仍来自普通 runtime 可写的 `interview_event` 中的自由 `criterion` 和数值。普通 runtime 或旧 worker 一旦伪造 event/question，C 端 assessment、报告或 profile 就可能读取该分数。题目、rubric、难度、模型/提示词、measurement cohort 和答案版本也没有被一起冻结，简单题均分不能用作可比较结论。

迁移 `0082` 已使岗位绑定面试停在 `assessment_unavailable`、`score=NULL`，但这只阻止 B 端数值用途；它不会自动让 C 端 event 分数成为可信测量事实。

## 决定

### 1. 已发题合同是评分的唯一输入根

每次可评分题目发出时，同一业务事务建立不可变 `IssuedQuestionContract`，至少固定：

- owner、interview、question ID、state version、turn 与 question content hash；
- `QuestionRubric`、criterion、difficulty/form、language 和 measurement version；
- question source/origin、cohort、prompt/model operation policy version；
- privacy epoch、是否允许练习反馈，及 B 端用途始终默认禁止。

发题时答案尚不存在，故合同不得含 `answerId/hash/version`，也不得在提交后 UPDATE 补齐。只有 `INT-TRANSCRIPT-00/01` 的 canonical artifact、删除授权和逐 sink receipt 在同一真实组合根闭合后，答案提交才可追加独立 `AnswerVersion` 与 `ScoreRequest`：它们引用 artifact/submission receipt、冻结 answer HMAC、contract、privacy epoch、operation/policy version 和一次性 permit。`ScoreCard` 必须同时绑定一个 immutable issue contract 与一个 append-only answer version/request。

答案替换、题目撤销、privacy epoch 变化或授权撤回不会修改前述事实；它们只能 fence 后续 request/card 或创建新版本。模型、event、报告和 checkpoint 都不能反向补写 issue contract、answer version 或 request。

### 2. 评分事实由专用写入边界产生

建立专用 `score_writer_owner` / `score_writer_executor` 与受控登录。它是唯一可执行评分写 procedure 的身份；该 procedure 在同一事务内领取 `ScoreRequest` permit，验证 issue contract、answer version/artifact、rubric、criterion、答案 HMAC/span digest、coverage、hard cap 和 privacy fence，再追加 `ScoreCard` 与 `ScoreEvidence`。删除或撤权若先提交，permit 必须 fence；模型派发后的 unknown 不自动重发，迟到结果只能在重新验证 permit/epoch/contract 后被丢弃。

- `app_role`、API runtime、普通 worker、图 checkpoint、报告 worker 和 `PUBLIC` 对 ScoreCard/ScoreEvidence 的直接 INSERT、UPDATE、DELETE 与 procedure EXECUTE 均为 0。
- 不能用“给 app_role 的 SECURITY DEFINER 函数”替代该边界：拿到 runtime SQL 凭据仍可构造伪造输入。
- score-writer 启动时验证 session identity、NOLOGIN owner/executor 属性、成员闭包、schema/table/function ACL、FORCE RLS 和禁止 raw 表权限；任何漂移失败关闭。
- 外部模型只提供有限 `criterionId -> level + evidence` 候选，不能给总分。模型 operation、预算、unknown 和 fallback 另由 `SCOR-03/04` 与 `MODEL-OP` 管理。

### 3. 分数不是 event，消费面只读取资格化 ScoreCard

`ScoreCard` 是追加版本；更正创建 `supersedes` 新卡，不覆盖旧卡。数据库 verifier 用固定公式从有效 criterion 计算 score、coverage 与状态。

- **目标**：只有 `practice_eligible` 可用于 C 端本轮练习反馈。**当前读面** `listScorableScoreCards` 仍含 `practice_eligible` **和** `b_review_eligible`（SCOR-00H 未收窄）。
- `unscored`、`evidence_invalid`、`review_required`、`calibration_blocked`、`fenced`、`superseded` 和历史 event score 的聚合贡献均为 0，不能被当作零分。
- 无资格卡时 **写路径** fail-closed：`POST assessment` → `409 no_scorable_cards`；`POST career-path` → `409 insufficient_evidence`；域助手 `insufficientEvidenceVerdict()` 给出 `assessment_unavailable` / `overall=null`。这**不是** C 端页面自动切到 `assessment_unavailable`（该相位只来自 SSE 事件）。`GET assessment` / `GET career-path` **不**重跑诚实闸。report/profile 不得以 event 平均值补回数值。`SCOR-00H` 已把该消费规则接到域闸：空评估不得落 `overall=0`，SSE 无 canonical identity + answer claim 的 `answer_evaluated.score` 不得展示或贴到错题，`refuseMappedBSideScore` 是域侧恒失败函数（**不拦截** worker eligible 计数或 `markApplicationNoEligibleScore`）。这仍不是 ScoreCard 写路径或校准。
- B 端继续只读 `assessment_unavailable`、`score=NULL`。即使 future card 为 `practice_eligible`，也必须同时满足独立 CalibrationRelease 与人工复核才可进入 `b_review_eligible`；本 ADR 不授权数值排序、阈值、自动录用或拒绝。

### 4. 未配置 rubric 的既有题默认 score-excluded

为避免“迁移时猜 rubric”，任何历史题、LLM 生成题或尚未具备已发布 rubric 的题目都以 `score_excluded` 发出。它们可继续承载对话或非测量性反馈，但不会生成可聚合 ScoreCard。题库 curator 通过新版本 rubric/题目合同后，后续题才可进入评分路径；不得原地给已发布题追加 mutable 标签来恢复旧分数。

这是当前建议的产品过渡方案。若产品选择为既有题批量补 rubric，必须提供人工审核、版本化迁移、回滚和校准计划，不能让模型猜测后直接启用。

### 5. 删除、撤权和证据边界

ScoreCard、ScoreEvidence、report/profile projection、cache、trace 和人工复核都继承 issue contract 与 answer version 的 owner、purpose、retention 与 privacy epoch。删除/撤权先赢时，任何未完成卡必须 fenced；已外发模型请求只可记录最小 attempt 结果，不回填领域事实。跨 sink 删除 receipt 未闭合前，ScoreCard 不得被宣传为可无限期保留的长期记忆，也不得创建其生产表或开放评分写路径。

## 被否方案

| 方案 | 否决原因 |
| --- | --- |
| 继续从 `answer_evaluated` event 求平均 | event 可被普通 runtime 写入，且不含版本化 rubric/证据/难度/cohort，不能构成测量事实。 |
| 给 app runtime 一个受限 SECURITY DEFINER 写函数 | app runtime 仍可伪造 procedure 输入；不能满足原始 SQL 逃逸通道要求。 |
| 用模型自报 confidence 或多模型均值补稳定性 | 不能修复共同 rubric/prompt 偏差，也不是授权、校准或证据来源。 |
| 为历史题自动补 rubric 并回填总分 | 会把不受审查的推测变成可比较事实，且无法复原当时的题目/答案/政策版本。 |
| 先恢复 C/B 数值展示、后补 verifier | 展示会反过来驱动用户和招聘决策；安全顺序必须先事实根、再用途门。 |

## 后果与验证

- 首期可能让未配置 rubric 的现有 C 端评分显示为 unavailable；这是有意停止不可信聚合，不是功能回归的隐藏实现。
- `SCOR-01/02` 的实现前置是 `INT-TRANSCRIPT-00/01` 已在真实组合根证明 canonical artifact、删除 resolver、逐 sink receipt 和删后 read=0。之后的隔离数据库 proof 必须覆盖原始 SQL、旧 worker、跨 owner、并发重放、答案替换、删除/撤权、迟到结果与所有消费者；真实模型质量、校准和 B 端用途不由此证明。
- 专用 writer 的部署凭据、数据库角色、启动门和删除链是生产配置变更，实施前须有平台/安全复核。
- 该 ADR 为 `proposed`。`SCOR-00H` 只收紧消费面诚实（不展示无出处 event 分、不伪造 0），不写入 ScoreCard，也不恢复 B 端数值。完整 C 端可见性切换、只读 `practice_eligible`、GET 重闸与 score-writer 仍等待 `INT-TRANSCRIPT-00/01` 的真实数据/删除前置闭合。

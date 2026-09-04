---
name: ai-provenance
description: AI 触达路径的出处检查：题面身份、route/rubric/model 绑定、禁止伪造分数、禁止匿名模型输出。
---

# AI 出处（provenance）检查

模型输出不能当匿名事实。改面试、评分、押题、诊断、报告、OCR、语音时，按下列项核对。未核不得写“AI 路径已验证”。

## 1. 题面身份（question identity）

- 答题必须携带服务端在 `question_ready` / `clarification_needed` 发放的 `questionId + stateVersion + turn`。
- `questionId` 必须是规范编码 `q-v{stateVersion}-t{turn}-c{clarifyAttempts}`，且内嵌的 version/turn 与同对象字段一致。`q-ready` 或 `q-v1-t0-c0` + `stateVersion:5` 这类弱绑定视为伪造。
- E2E 与浏览器不得用本地计数器冒充当前题。实现：`e2e/helpers/interview.ts` 的 `questionIdentity`（缺字段 → `e2e_question_identity_missing`；格式/交叉失败 → `e2e_question_identity_forged`）。
- 已消费身份重放必须 `409 stale_question`。HTTP E2E 主循环在**第一题 /turn 被受理后**立刻重放，不依赖模型是否发出澄清。澄清事件若出现，仍用新身份作答。
- 客户端夹带历史 `interviewId` 做岗位 finalize 必须 400；未绑定 finalize 必须 409。

## 2. 路由 / rubric / 模型绑定

- 业务操作应能追到 operation / rubric / prompt 版本，而不是“当前默认模型”。
- 派发后不得换模型补分。schema 或业务校验失败：记 `failed` / `unscored` / clarify，不另开匿名 retry 写成成功。
- 生成题（qbank miss）在校准完成前不得驱动 B 端 overall / 排名。见评分与漏斗文档，不要在 E2E 里用生成题当校准证据。

## 3. 评分不得伪造

| 现象 | 必须落点 | 现成门 |
| --- | --- | --- |
| 证据 quote 不是本题答案子串 | `unscored` 或同题 clarify；不写 0/50/99 | `pnpm scoring-integrity:prove` |
| 模型故障 / 超时 | `unscored`，不填中性分 | `pnpm adaptive-degrade:prove` |
| 报告模型自报 overall | 服务端 `aggregateScores`；拒绝重复 section | `pnpm scoring-integrity:prove` |
| 无评分证据进 B 端 | `assessment_unavailable` + `score=NULL` | HTTP E2E 岗位收口 |
| 短答 / 非作答 | 相对序金标，不得高分 | `scoring-golden` / `scoring:eval`（质量层，非 per-push 发布） |
| `progress` 带 numeric `score` / `overall` | 视为伪造分；E2E 抛 `e2e_forged_progress_score`，不得当练习分或 B 端分 | `pnpm e2e-helpers:prove`（`rejectForgedProgressScores`） |
| `answer_evaluated.score` | 仅 `practice_hint`，必须绑 question identity；不得升格 B 端 overall / 排名 | `pnpm e2e-helpers:prove`（`practiceHintFromEvaluated`） |

HTTP 面试循环（`driveInterviewToTerminal`）不发明分数、不把 progress 当评分账本。本循环也不把产品面试硬封成 8 轮；长度跟服务端。

## 3b. conclude / probe 出处

- `decideNext` 的 ask `mode` 只允许 `probe` | `pivot`；conclude `reason` 只允许 `budget_exhausted` | `all_resolved`。
- E2E 只在服务端 payload **已发放**这些字段时记录出处（`source: server_payload`）。同能力推断、客户端自写 `timeout` / `deeper` 都算伪造。
- 终态事件自带的 `reason`（如 `assessment_unavailable` / `report_unavailable`）不是 conclude reason，不得改写。
- 实现：`attributableAsk` / `attributableConclude` / `inspectInterviewProvenance`。缺 mode 返回 `null`（不发明）；有非法 mode/reason 则失败。

## 4. 出处字段（写回执或说明时）

至少能回答：

1. 哪一个 logical node / operation（或明确“尚未绑定，仍是调用方构造”）。
2. 哪一次 invoke 的 schema/业务校验结果（通过 / `schema_validation_failed` / `business:*`）。
3. 分数是服务端聚合还是模型字段（后者必须被丢弃）。
4. 题库命中还是 LLM fallback；fallback 是否被排除出 B 端排序。

答不出第 1 条时，写“绑定未完成”，不要写“已追溯到模型版本”。

## 5. 日志与回执

- 回执和 CI 日志不得包含 prompt、答案、音频、简历原文。
- 真模型评测数字必须带 dataset revision、成功/跳过分母和 Wilson 下界；小样本不得写成准确率。

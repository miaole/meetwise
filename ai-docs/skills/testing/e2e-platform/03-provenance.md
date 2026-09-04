# 03 · 出处（面试 / AI 路径）

细则仍以 [AI 出处检查](../ai-provenance.md) 为准。本页只钉平台层不可破的几条。

## 题面身份

- `/turn` 必须带服务端在 `question_ready` / `clarification_needed` 发放的 `questionId + stateVersion + turn`。
- 实现：`e2e/helpers/interview.ts` 的 `questionIdentity`。缺字段抛 `e2e_question_identity_missing`。
- 已消费身份重放 → `409 stale_question`。主循环在**第一题被受理后**立刻重放，不依赖模型是否澄清。

## 禁止伪造

- 报告 overall 只认服务端聚合，不认模型自报。
- 无评分证据：B 端 `assessment_unavailable` + `score=NULL`，不写 0 分。
- quote 不是本题答案子串 → `unscored`，不填中性分。
- 客户端不得夹带历史 `interviewId` 做岗位 finalize（400 / 409）。

## 模型 / rubric / route

有绑定就写绑定（operation、prompt 版本、rubric 版本）。答不出“哪一次 invoke”时写“绑定未完成”，不要写“已追溯到模型版本”。

`MODEL_API_KEY` 只证明文本供应商 Key 存在，不证明视觉 OCR 或 TTS/ASR 已接线。组合根关闭这些 operation 时，HTTP E2E 应失败而不是跳过。

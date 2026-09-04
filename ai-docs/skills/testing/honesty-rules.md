---
id: skills_testing_honesty_rules
name: 测试诚实规则
description: 测试与文档的诚实边界：releaseEvidence、假服务、skip-as-pass、过期回执。
type: skill
scope: shared
level: guide
status: draft
owner: qa
version: 1
related:
  - ./sop.md
  - ./fail-closed-gate.md
---

# 诚实规则

这是 [变更后 SOP](./sop.md) 的第 5 步。违反任一条，测试技能视为失败，即使命令退出码为 0。本目录 `status: draft` 时同样适用：draft 不能当跳过诚实边界的理由。默认 `pnpm regression` 绿了只证明 always-on 子集，不是发布证据，也不是矩阵「必须」列已跑完。

`not_run:<reason>` 表示**没有发起**该命令。已经跑了 `--live` 却因缺 Key 非零退出，记 `blocked` / 失败，不要改写成 `not_run` 当通过。

## 禁止

1. **把 `releaseEvidence=false` 写成发布、简历或横向对比证据。** 本地隔离回执没有 OIDC runner、不可变对象存储或独立验签。
2. **在需要 live 供应商时打开假服务。** `VOICE_FAKE`、`OCR_FAKE`、`E2E_FAKE_MODEL` 必须使 runner 失败。不要删守卫来“先绿一下”。
3. **缺 Key 却报告 live E2E 通过。** 正确写法是 `not_run:live_provider_key_missing`。`pnpm regression --live` 在缺或空白 `MODEL_API_KEY` 时必须非零退出。CI 刻意不把 `e2e:isolated` 放进 per-push，就是为了避免 skip-as-pass。未请求的 `--core` / `--live` 只能写 `not_requested`，不能写通过。
4. **用过期回执。** 迁移清单数量或最新文件名与当前 `packages/db/migrations/` 不一致时，该 HTTP E2E 回执只是历史记录。
5. **只断言 HTTP 200、只打开页面、只用 mock 证质量、AI 自评、只测 happy path，或默认信任 AI 代码/输出。** `pnpm regression` 的 **review/verify** 是命令退出码和回执；**automation does not trust AI outputs**。**multi-round allowed**。收束公式见 [fail-closed 门](./fail-closed-gate.md)；长期规则指针 `ai-docs/rules/global/ai-generated-review.md`。不能把一次对话小结当成终验。
6. **把 planned / unmapped golden-task 标成 passed。** 登记文件里的 `status` 枚举见 `ai-docs/testing/golden-tasks/README.md`。
7. **把 Playwright 说成当前 HTTP 全链路实现。** 浏览器层才是 Playwright；HTTP 层是 fetch/SSE。
8. **把本机性能数字说成线上 SLO。**
9. **把默认 `pnpm regression` 绿写成触达面必须列已完成、CI `verify` 通过或发布证据。**
10. **skip-as-pass。** 缺 Key、未跑、失败，只能记 `not_run` / `blocked` / 非零退出，不能改 runner 或删守卫来绿。
11. **未审核生成物标 READY 或声称完成。** 生成代码 / 模型输出默认不可信。没有走完 [变更后审核](./post-change-review.md) 第 0 节，不得标 READY，也不得把 `releaseEvidence=false` 的绿回归写成完成。受信回执出现之前，`releaseEvidence` 必须保持 `false`。
12. **默认信任 AI 代码或 AI 输出。** 审核与验证缺一，或把 `aiTrust` 写成 `trusted`，即 [fail-closed 门](./fail-closed-gate.md) `BLOCK`。
13. **提交或记录真实密钥、`.env`、token、简历原文、录音。** 技能与回执只允许占位名。

## 允许

- 在无 Key 环境只跑隔离 prove，并写明 live 未跑。
- 用 fake model 测图分支与校验器，同时把质量评测留给 nightly / `scoring:eval`。
- 引用带 SHA-256 与迁移摘要的本地回执，作为“当时这条隔离链到终态”，并写 `releaseEvidence=false`。

## 写验证说明的最小模板

```text
commands: <实际执行的 pnpm 列表>
exit: <逐条退出码>
receipts: <路径或 none>
releaseEvidence: false
aiDiffReviewed: yes | no
claimDone: false
ready: NOT_READY
liveE2E: ran | not_run:<reason>
kind: FAIL_API | FAIL_WORKER | FAIL_DB | FAIL_PROVIDER | FAIL_CAPABILITY | BLOCKED_DATA_OR_PERMISSION | BLOCKED_LIVE_KEY | none
forgedScores: none | <缺口>
aiAuthored: yes | mixed | no
aiTrust: untrusted | blocked:<gap>
review: passed_adversarial | passed:<reviewerId> | blocked:<gap>
verification: commands_ok | blocked:<gap>
rounds: <正整数>
secrets: none
```

作者不得写裸 `review: passed`。同 run 第二镜头用 `passed_adversarial` 并附 fix-list 路径；非作者用 `passed:<reviewerId>`。`verification: commands_ok` 必须带上面的 `commands`/`exit`。两者都通过才允许写「本轮局部验证完成（releaseEvidence: false）」，禁止单独写「已验证」。`aiTrust` 不得为 `trusted`。模板里只写占位名与退出码，不粘贴密钥值。

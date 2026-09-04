---
name: honesty-rules
description: 测试与文档的诚实边界：releaseEvidence、假服务、skip-as-pass、过期回执。
---

# 诚实规则

违反任一条，测试技能视为失败，即使命令退出码为 0。

## 禁止

1. **把 `releaseEvidence=false` 写成发布、简历或横向对比证据。** 本地隔离回执没有 OIDC runner、不可变对象存储或独立验签。
2. **在需要 live 供应商时打开假服务。** `VOICE_FAKE`、`OCR_FAKE`、`E2E_FAKE_MODEL` 必须使 runner 失败。不要删守卫来“先绿一下”。
3. **缺 Key 却报告 live E2E 通过。** 正确写法是 `not_run:live_provider_key_missing`。CI 刻意不把 `e2e:isolated` 放进 per-push，就是为了避免 skip-as-pass。
4. **用过期回执。** 迁移清单数量或最新文件名与当前 `packages/db/migrations/` 不一致时，该 HTTP E2E 回执只是历史记录。
5. **只断言 HTTP 200、只打开页面、只用 mock 证质量、AI 自评、只测 happy path。**
6. **把 planned / unmapped golden-task 标成 passed。** 登记文件里的 `status` 枚举见 `ai-docs/testing/golden-tasks/README.md`。
7. **把 Playwright 说成当前 HTTP 全链路实现。** 浏览器层才是 Playwright；HTTP 层是 fetch/SSE。
8. **把本机性能数字说成线上 SLO。**
9. **失败只写 `E2E 失败` / `e2e failed`。** 必须带封闭 `E2E_FAILURE class=` 行（`api` / `worker` / `db` / `provider` / `capability` / `data_or_permission` / `frontend`），见 [run-gates.md](./run-gates.md) §6。
10. **AI/系统失败被绿结果吞掉。** `report_unavailable` / 评分不可用 / 供应商暂态必须进 `E2E_REVIEW` 账本；没有 `E2E_REVIEW_SUMMARY` 的 exit 0 记 `opaque_pass`，不得写成通过。

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
liveE2E: ran | not_run:<reason>
forgedScores: none | <缺口>
```

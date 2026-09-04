---
id: e2e_platform
name: E2E 平台 SOP
description: Meetwise 变更后 E2E 平台的编号操作规程。状态诚实：draft / NOT_READY / PASS_WITH_GAPS。
type: skill
scope: shared
level: guide
status: draft
owner: qa
version: 1
---

# E2E 平台（draft）

**readiness: NOT_READY.** 静态守卫和 helpers 可跑；真供应商全链路与 golden-task 评测未在本平台上标 READY。

**honesty: PASS_WITH_GAPS.** 编号规程、目录合同、出处、脱敏规则、失败分类、5 条命名静态守卫 + 2 条自测、事后回归入口已落地。缺口：无 Key 环境不能跑 `e2e:isolated`；隔离 worker 常把主面试打到 `report_unavailable`；浏览器层需另构建 web。守卫红则不得写“已验证”。

不要把本目录写成 READY。没有可跑命令 + 证据，禁止把 draft 改成 active/READY。

## 阅读顺序

1. [00 总览](./00-overview.md) — HTTP fetch/SSE 是主路径，Playwright 是浏览器层
2. [01 目录合同](./01-directory-contract.md) — `e2e/helpers` 对场景；helpers 不进 `apps/web`
3. [02 变更后仪式](./02-post-change.md) — 审核 → unit/contract/prove → 隔离回归 → 可选 live
4. [03 出处](./03-provenance.md) — questionId / stateVersion / turn，不伪造分数
5. [04 证据与脱敏](./04-evidence-and-redaction.md) — 回执与日志不得含令牌/简历/音频
6. [05 失败分类](./05-failure-classification.md) — api / worker / db / provider / capability，不是“e2e 失败”

可执行入口：

```bash
pnpm e2e-platform:prove   # 5 条命名守卫 + 2 条自测（fail-closed）
pnpm regression           # 含上列守卫 + 文档/helpers/回执
pnpm regression --live    # 另加 HTTP E2E；缺 MODEL_API_KEY 非零退出
```

变更后顺序只维护在 [`../sop.md`](../sop.md)。本目录是 HTTP harness 平台合同，不替代那套仪式。收束公式见 [`../fail-closed-gate.md`](../fail-closed-gate.md)（AI 产物默认不可信）。

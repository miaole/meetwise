---
name: post-change-review
description: 功能 diff 落地后、跑测试前的审核清单。对应 AGENTS.md 的生成前门禁与伪验收禁令。
---

# 变更后审核清单

在 `pnpm regression` 之前走完。任一项为“未查”则不得声称审核通过。

## 1. 范围与来源

- [ ] 改动能指回一条需求、用例或明确缺陷，而不是“顺手重构”。
- [ ] 非目标写清：本次不改支付供应商、不改生产密钥、不扩大删除/评分权限。
- [ ] 没有臆造未在 `packages/contracts` 出现的接口字段。

## 2. 状态机与账本

- [ ] 状态承载对象仍用显式枚举，没有新的布尔汤。
- [ ] 失败路径有终态（`unscored` / `report_unavailable` / `402` / `409`），没有无限转圈。
- [ ] 钱、额度、OCR 扣费仍走 reserve/confirm/release，图节点没有直接改权益。

## 3. AI 与不可信输入

- [ ] 用户内容进数据块，未拼进 system instruction。
- [ ] 模型输出仍先 schema、再业务校验；失败不是默认 50 分。
- [ ] 题面/评分/报告若被改动，已打开 [出处检查](./ai-provenance.md)。

## 4. 安全与隐私

- [ ] 日志不写简历原文、答案全文、手机号/邮箱、密钥、完整 prompt。
- [ ] 未提交 `.env`、真实简历、录音。
- [ ] 跨主体读路径仍按 RLS fail-closed（0 行或 404，不泄露存在性）。

## 5. 测试层是否选对

- [ ] 用 [layer-selection](./layer-selection.md) 选了层，而不是默认只开页面或只断言 200。
- [ ] 钱/状态/隔离的并发、恢复、逃逸至少有一条落在集成或 E2E，没有全堆在单测。
- [ ] 没有用 mock 模型证明生产模型质量。

## 6. 结论边界

- [ ] 准备写的验证记录区分：局部合同 / 隔离 prove / 真供应商 E2E / 发布证据。
- [ ] 不会把 `releaseEvidence=false` 的回执抄进发布说明。
- [ ] AI 写出的 diff 仍不可信：已跑 `pnpm e2e-platform:loop`（或等价验证），回执是 `pending_review`，没有把绿门写成已接受。

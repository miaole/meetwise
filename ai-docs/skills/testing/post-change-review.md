---
id: skills_testing_post_change_review
name: 变更后审核清单
description: 功能 diff 落地后、跑测试前的审核清单。对应 AGENTS.md 的生成前门禁与伪验收禁令。
type: skill
scope: shared
level: guide
status: draft
owner: qa
version: 1
related:
  - ./sop.md
  - ./layer-selection.md
  - ./honesty-rules.md
  - ./fail-closed-gate.md
---

# 变更后审核清单

这是 [变更后 SOP](./sop.md) 的第 1 步，也是 [fail-closed 门](./fail-closed-gate.md) 的审核半边。任一项为“未查”则不得声称审核通过，也**不得声称完成**。勾完后进入 [选测试层](./layer-selection.md)，不要直接跑 `pnpm regression`。作者不得自签 `review: passed`；须非作者或对抗式第二镜头，见 fail-closed 门。

**review/verify** gate: `pnpm regression` is automation; **automation does not trust AI outputs**. **multi-round allowed** — review can run again after verify fails or after a later change. Unchecked items cannot be claimed reviewed. No secrets in the checklist or logs.

## 0. 生成物默认不可信（P0，先于一切“已完成”）

可以自动化重构、测试、UI 检查和回归；**默认不信任生成代码或模型输出**。`pnpm regression` 绿了只证明 always-on 子集，不是审核通过，更不是 READY。收束公式见 [fail-closed 门](./fail-closed-gate.md)。

- [ ] 已审过本 diff 的正确性、安全、出处；没有伪造分数、伪造进度或假终态。本轮 AI diff 标成 `UNTRUSTED`，没有预先写成 trusted。
- [ ] 重构 / 新测试 / UI 走自动化命令，没有用「看起来合理」代替执行。
- [ ] 结论只引用实际命令与退出码；**skip-as-pass 禁止**。缺 Key / 未跑记 `not_run` 或 `blocked`，不得写成通过。
- [ ] 在受信回执存在之前，`releaseEvidence` 必须是 `false`。本地隔离回执仍不是发布证据。
- [ ] 未审核生成物**不得标 READY**，不得把 draft / NOT_READY 技能升格，不得写「已完成 / 已验证」代替本清单。
- [ ] 未引入真实密钥、`.env`、简历原文或录音。

未勾完本节，后面的范围/状态机勾选一律视为“未查”。`pnpm generation-trust:prove` 与 `pnpm regression` 会机械检查本政策仍写在技能与回归入口里；命令绿不能替代本节审核，作者也不得自签。

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
- [ ] 题面/评分/报告若被改动，已打开 [出处检查](./ai-provenance.md)。未核不得把 unverified AI path 写成已验证；允许多轮核对（multi-round verify）。

## 4. 安全与隐私

- [ ] 日志不写简历原文、答案全文、手机号/邮箱、密钥、完整 prompt。
- [ ] 未提交 `.env`、真实简历、录音。
- [ ] 跨主体读路径仍按 RLS fail-closed（0 行或 404，不泄露存在性）。

## 5. 测试层是否选对

- [ ] 用 [layer-selection](./layer-selection.md) 选了层，而不是默认只开页面或只断言 200。
- [ ] 钱/状态/隔离的并发、恢复、逃逸至少有一条落在集成或 HTTP E2E 主层（`e2e:isolated`），没有全堆在单测；只有 cookie/DOM 才加 Playwright 次层。
- [ ] 没有用 mock 模型证明生产模型质量。

## 6. 结论边界

- [ ] AI 写出的 diff 已经过审核，没有默认信任；验证走多轮门禁（修完再跑受影响的门）。见 [ai-generated-review](../../rules/global/ai-generated-review.md)。
- [ ] 准备写的验证记录区分：局部合同 / 隔离 prove / 真供应商 E2E / 发布证据。
- [ ] 不会把 `releaseEvidence=false` 的回执抄进发布说明。
- [ ] 未写入密钥、真实 `.env`、简历原文或支付秘密。

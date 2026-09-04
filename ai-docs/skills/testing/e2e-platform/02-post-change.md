# 02 · 变更后仪式

顺序只维护在上一级 [变更后 SOP](../sop.md)。本页只对照 HTTP E2E 平台怎么嵌进那套仪式，不另开一条流程。

```text
1. 审核          范围 / 状态机 / AI 输入 / RLS / 选层
2. unit/contract 包内 prove、zod smoke、能在本机确定的断言
3. isolated      pnpm regression（含 e2e-platform:check / prove / layout:prove）
                 触达面再加对应 *:prove；骨架用 --core
4. live（可选）   有 MODEL_API_KEY 才跑 pnpm regression --live
                 浏览器另：pnpm -C apps/web build && pnpm e2e:ui:isolated
```

## 何时必须上到第 4 步

改了面试循环、题面身份、支付 webhook、简历 OCR/语音、报告终态、多租户 RLS，且本机有 Key。没有 Key 就写 `liveE2E: not_run:live_provider_key_missing`，不要删 runner 守卫。

## 何时停在第 3 步

只改文档、helpers 纯函数、静态守卫、golden-task 登记。此时 `pnpm regression` 足够；不要声称 HTTP 全链路已重跑。

## 完成声明的最小证据

命令绿不是完成。先走 [变更后审核](../post-change-review.md) 第 0 节（生成物默认不可信）。然后：

- `pnpm generation-trust:prove`、`pnpm e2e-platform:check`、`pnpm e2e-platform:prove`、`pnpm e2e-platform:layout:prove` 退出 0
- `pnpm regression` 退出 0（或记录哪一步失败）；`claimDone` 仍为 false
- live 若未跑：显式 `not_run`（skip-as-pass 禁止）
- 没有受信回执前 `releaseEvidence: false`；未审核生成物不得标 READY

没有阶段检查点仓库、没有 70 条 MOVE/BRIDGE 清单。本仓库用上述命令当检查点。写完成句前仍须过 [`../fail-closed-gate.md`](../fail-closed-gate.md)。

---
id: testing_golden_tasks_index
name: AI Golden Tasks 第一批登记
description: 测试策略列出的第一批 golden tasks。只登记可追溯状态，禁止把 planned/unmapped 写成已通过。
type: testing
scope: shared
level: guide
status: active
owner: qa
version: 1
---

# Golden Tasks（第一批）

本目录是 `testing/strategy/test-strategy.md`「AI Golden Tasks」的落地登记。  
**`releaseEvidence=false`。** 没有条目因为“写了文档”而变绿。

允许的 `status`：

| 值 | 含义 |
| --- | --- |
| `mapped` | 已有可复跑门覆盖该不变式（通常是确定性 prove，不是真模型质量） |
| `partial` | 有相关门，但不覆盖策略原文的全部验收 |
| `planned` | 规格已写，尚无对应自动化门 |
| `unmapped` | 尚未指定门；不得当作通过 |

禁止的值：`passed`、`green`、`release_ready`。质量评测另见 [评分评测协议](../strategy/scoring-evaluation-protocol.md)。

机器可读清单：`registry.json`。`pnpm golden-tasks:check` 校验：八条第一批都在、status 合法、`mapped`/`partial` 的命令能在根 `package.json` 找到。

| ID | 策略原文要点 | status | 当前门（若有） |
| --- | --- | --- | --- |
| [GT-01](./GT-01-frontend-project-deep-dive.md) | 前端岗 + 有项目简历 → 8–12 题且含项目深挖 | `planned` | 无。HTTP E2E 只断言 ≥1 题到终态 |
| [GT-02](./GT-02-short-answer-not-high-score.md) | 过短作答不得高分 | `partial` | `scoring-golden:prove` 相对序夹具；真模型 `scoring:eval` 未达发布量 |
| [GT-03](./GT-03-jd-nextjs-gap.md) | JD 要 Next.js、简历没有 → 差距必须出现 Next.js | `planned` | 无岗位差距抽取门 |
| [GT-04](./GT-04-unknown-answer-no-hallucination.md) | 回答「不会」应引导，不幻觉已掌握 | `partial` | `scoring-golden` 非作答档 + offtopic 桶；无独立引导策略 eval |
| [GT-05](./GT-05-illegal-json-reject.md) | 非法 JSON → validator 拒绝 | `mapped` | `runtime:prove` / invoke `schema_validation_failed`。派发后**不**自动重试 |
| [GT-06](./GT-06-quote-not-in-answer-unscored.md) | 引文不属于本题答案 → unscored，不伪造分 | `mapped` | `scoring-integrity:prove` |
| [GT-07](./GT-07-turn-idempotency.md) | 同 turn 不同答案密钥不同；同答案重放不重打模型 | `partial` | `turn-idempotency:prove` 覆盖同答案重放；不同答案冲突未单独立项 |
| [GT-08](./GT-08-report-server-aggregation.md) | 报告 overall 必须服务端聚合 | `mapped` | `scoring-integrity:prove` |

新增任务：先改本表和 `registry.json`，再写单页。不要只在聊天里宣布“又绿了一条”。

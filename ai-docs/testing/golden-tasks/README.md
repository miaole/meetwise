---
id: testing_golden_tasks_index
name: AI Golden Tasks 第一批登记
description: 测试策略列出的第一批 golden tasks。只登记可追溯状态，禁止把 planned/unmapped 写成已通过。
type: testing
scope: shared
level: guide
status: active
owner: qa
version: 2
---

# Golden Tasks（第一批）

本目录是 `testing/strategy/test-strategy.md`「AI Golden Tasks」的落地登记。  
**`releaseEvidence=false`。** 没有条目因为“写了文档”或“附近有一条 prove”而变绿。

允许的 `status`：

| 值 | 含义 |
| --- | --- |
| `mapped` | 已有可复跑门覆盖该不变式（通常是确定性 prove，不是真模型质量） |
| `partial` | 有相关门，但不覆盖策略原文的全部验收 |
| `planned` | 规格已写，尚无对应自动化门 |
| `unmapped` | 尚未指定门；不得当作通过 |

禁止的值：`passed`、`green`、`release_ready`、`pass`。质量评测另见 [评分评测协议](../strategy/scoring-evaluation-protocol.md)。

`golden-tasks:check` **不执行** mapped 门，也不用程序核对 `covers` 句子是否等于 proof 断言；那仍靠改登记时对照 proof。它只挡住假绿 status、空 covering、文档漂移、`scoring:eval` / 文档类脚本冒充 covering。

机器可读清单：`registry.json`（`schemaVersion=2`）。`pnpm golden-tasks:check` 校验：

- 八条第一批都在，status 合法，`releaseEvidence=false`
- `mapped` / `partial` 必须有 `mappedCommands` + `covers`；命令能在根 `package.json` 找到
- `planned` / `unmapped` 不得声称 `mappedCommands` / `covers`，必须列出 `uncovered`
- `relatedCommands` 记录附近但不覆盖的门，且必须写明 `notCovered`
- `scoring:eval` 不得进入 `mappedCommands`（inconclusive 质量层）
- 单页 frontmatter、本表、`test-strategy.md` 的 status 必须一致

`pnpm golden-tasks:prove` 用负向夹具证明上述诚实规则会失败，而不是只绿当前登记。

| ID | 策略原文要点 | status | 当前门（若有） |
| --- | --- | --- | --- |
| [GT-01](./GT-01-frontend-project-deep-dive.md) | 前端岗 + 有项目简历 → 8–12 题且含项目深挖 | `planned` | 无 covering 门。相关：`e2e:isolated` / `interview:prove` / `quiz:prove` / `pipeline:prove` 都不查 8–12 或项目深挖 |
| [GT-02](./GT-02-short-answer-not-high-score.md) | 过短作答不得高分 | `partial` | 夹具结构门 + 图 clarify。短答评分与报告文案仍缺 |
| [GT-03](./GT-03-jd-nextjs-gap.md) | JD 要 Next.js、简历没有 → 差距必须出现 Next.js | `planned` | 无岗位差距抽取门。相关：`diagnosis:prove` 有 match 维度，不抽 JD 缺口 |
| [GT-04](./GT-04-unknown-answer-no-hallucination.md) | 回答「不会」应引导，不幻觉已掌握 | `partial` | 夹具结构 + 图 clarify/pivot。生产 `relevant=false→0` 与报告「掌握 X」仍缺 |
| [GT-05](./GT-05-illegal-json-reject.md) | 非法 JSON → validator 拒绝 | `partial` | `model-op00-usage-reconciler:prove` 覆盖 schema 失败。非法 JSON 文本走 unknown；`runtime:prove` 不断言本条 |
| [GT-06](./GT-06-quote-not-in-answer-unscored.md) | 引文不属于本题答案 → unscored，不伪造分 | `mapped` | `scoring-integrity:prove` |
| [GT-07](./GT-07-turn-idempotency.md) | 同 turn 不同答案密钥不同；同答案重放不重打模型 | `mapped` | `turn-idempotency:prove` + `neg:interview` + `scoring-integrity:prove`。无 HTTP→模型组合测 |
| [GT-08](./GT-08-report-server-aggregation.md) | 报告 overall 必须服务端聚合 | `mapped` | `scoring-integrity:prove` |

新增任务：先改本表和 `registry.json`，再写单页。不要只在聊天里宣布“又绿了一条”。

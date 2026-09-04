---
name: usecase-gen
description: 为一个能力生成业务用例 + 测试用例（七类 case，非 happy path，无玩具代码）。Use when adding a capability — produce use cases per use-case-conventions with mandatory seven-category coverage, each exception/tricky flow mapped to a production-invariant primitive AND a concrete negative assertion at the correct test layer; rejects toy-code/fake-acceptance patterns at generation time.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Write
  - Task
---

# usecase-gen · 业务用例 + 测试用例生成（七类 · 非 happy path · 无玩具代码）

产出一个能力的用例与测试用例。用例写 `ai-docs/requirements/use-cases/<domain>.md`，测试用例按 [test-authoring](../../../ai-docs/testing/conventions/test-authoring.md) 落层（HTTP `e2e:isolated` 主层，Playwright 仅浏览器次层）。变更后怎么跑门见 [testing skill](../../../ai-docs/skills/testing/SKILL.md)。**默认只写 happy path = 直接不合格。**

## 一、每条 UC 必含字段（缺一不可）

```
UC-<module>-<seq> · <标题>
- 角色 / 前置 / 触发
- 主流程 Main（编号步骤，每步可观测）
- 备选流 Alternate
- 异常流 Exception（强制枚举，见 §二 七类）
- 后置：状态机落到哪个 status + 写哪些账本（审计/成本/事件）
- 验收 Acceptance：每条都是「可测业务事实断言」，禁止"返回 200"
- 关联：契约 endpoint · 状态机对象 · 命中的[四原语](../../../ai-docs/rules/global/production-invariants.md) · 隐私/安全规则
- 七类覆盖标注：正/异/特/逃/并/复/刁
```

## 二、七类：每类一条「最小负向断言」，并指定测试层

七类图例见 [use-case-conventions §4](../../../ai-docs/requirements/use-case-conventions.md)。**每类都要有一条能失败的断言**，空泛分类不算覆盖。

| 类 | 含义 | 最小负向断言（至少其一） | 默认测试层 |
|---|---|---|---|
| 正 | 正常 | 主流程端到端到终态 | API→HTTP e2e（`e2e:isolated`）/ UI→browser（`e2e:ui:isolated`） |
| 异 | 异常回滚/退款 | 失败→**退款到账 / 额度归还 / 状态回滚**，断言账本增量 | 集成(真 DB) |
| 特 | 边界/空/首次/i18n | 空/超长/首次/非英文字符 各 ≥1 | 单元+契约 |
| 逃 | 降级/fallback/kill-switch/安全终止 | **依赖失效→确定性降级或 fail-closed，不死循环不 5xx 掩码** | E2E/集成 |
| 并 | 并发/双击/竞态 CAS/租约 | **同 key 并发→恰 1 赢、其余读 0 行回查**，断言不超卖不双扣 | 集成(真并发) |
| 复 | saga/跨聚合/部分失败 | 多步部分失败→**补偿/对账收敛**，断言中间态可恢复 | 集成 |
| 刁 | 注入/越狱/刷分/泄题/PII/畸形/对抗 | 见下方「AI 平台刁钻清单」 | E2E / ai-eval |

### AI 平台「刁」类强制清单（Meetwise 特有，缺失即不合格）

至少覆盖：**提示注入（用户文本进 data block，不 splice 进 system）· 越狱反操纵 · 幻觉/歪曲事实（每个 ref 必须是 fact 子串）· PII 泄露（日志/trace/明文手机号）· 刷分/自报分数 · B 端泄题（题库不进候选面）· 降型逃费（低价模型冒充高价）· 畸形输入（畸形 JSON/Unicode/超大 payload）· 越权（RLS=0 行）**。

## 三、层映射强制（禁止负向全堆在集成 gate）

- 涉及**钱/状态/隔离**的 `并`/`复`/`逃`/`刁`，至少一条落到 **HTTP E2E 主层**（`pnpm e2e:isolated` fetch/SSE）做真实跨进程断言；只有断言依赖 cookie/DOM/middleware 时才加 Playwright 次层。不得只在单测/集成里闭环。
- 判定：一条负向「集成 proof 绿了、但 HTTP E2E 主层没有」= 未完成（对应 [test-strategy 禁止伪验收](../../../ai-docs/testing/strategy/test-strategy.md)）。

## 四、无玩具代码检查表（生成时逐条自问，任一命中即回炉）

1. 断言只测「HTTP 200 / 页面打开」？→ 玩具，改业务事实断言（状态机落点/账本/计数/隔离边界）。
2. 用 mock 模型证明「生产模型质量」？→ 玩具；模型质量归 ai-eval，graph/逻辑用确定性 fake model，二者不混。
3. AI 自评自己的报告/评分？→ 玩具。
4. 只测 happy path，跳过失败退款/重复请求/并发 CAS/越权 0 行？→ 玩具。
5. 用单一 `main()` 串所有断言、一处失败全场崩、无 per-scenario 隔离？→ 玩具，改**每个异常流一个可独立失败/重跑的用例**。
6. 断言「存在即通过」（`length>0` / `status 200` / `!== undefined`）而非「值正确」？→ 假绿。
7. 异常流停在「会处理好」，不落到四原语/状态机迁移？→ 玩具。

## 五、与四原语/状态机绑定（硬约束）

每条改状态的异常流必须显式标注靠哪个原语防住：**CAS / 幂等键 / RLS principal / 持久事件日志**，并写清「缺了这个原语会漏什么」。对号入座见 [production-invariants](../../../ai-docs/rules/global/production-invariants.md) 末尾「症状→缺的原语」表。

## 六、生成流程

1. 用 Task 并行派对口业务专家枚举（钱/状态/隔离/AI 安全），别 freehand。
2. 产出用例 → 逐条过「无玩具代码检查表」→ 补测试用例（`TC-<UC-id>-<flow>` + 层）。
3. **对抗自审三问**：①这条能抓到什么真实 bug？②它漏了哪个失败模式？③哪个断言是「存在即通过」的假绿？
4. 复杂域（L2+）落盘后交 `/expert-audit` 对抗评审，未闭合不算完成。

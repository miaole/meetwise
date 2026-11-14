---
id: architecture_ai_research_agent
name: 研究能力边界与自主研究 agent 设计（现状事实 + 目标架构 + 升级门）
description: 面试图内研究 skills 的现状事实（静态目录/有界预算/egress 边界）与「自主研究 agent」（异步/沙箱/有界预算/对抗核实/同意 gate）的目标架构与逐项升级门。现状与目标分开写，Ban 把目标当现状。
type: architecture
scope: shared
level: guide
status: active
owner: architecture
version: 1
tags:
  - research
  - capability-gate
  - egress
  - agent
related:
  - ./voice-capability-boundary.md
  - ./research-capability-gate.md
  - ../backend/agent-runtime.md
  - ../../delivery/production-backlog.md
---

# 研究能力边界与自主研究 agent 设计

> 现状与目标**分开写**：§1 是代码里存在并可验证的事实；§2 起是「自主研究 agent」目标架构（production-backlog P1 行「自主研究 agent（异步/沙箱/有界预算/对抗核实/同意 gate）」的设计成文），全部标**未实现**。Ban 把目标当现状、Ban 在升级门未过前接线。

## 1. 现状事实（不是路线图）

面试图的「研究」**不是模型可任意命名执行的插件系统**，而是三个静态、只读、无副作用的 skill（`apps/worker/src/interview-research-skills.ts:1-14`）：

| skill | 行为 | 预算/边界 |
|---|---|---|
| `rag.retrieve` | owner-scoped 本地题库召回 | 默认 1 次/job（帽 ≤8）；未启用=空结果 |
| `web.explore` | 单层 allowlist 探索（兼容/降级 seam） | 同上；默认启用集不含 deep.research |
| `deep.research` | 有界多源 allowlist 取证 | 显式启用才可用；同样有界 |

横切边界（同一文件+domain）：

- **静态目录**：未登记 skill 被忽略而非动态加载；查询超长/含控制字符→空结果；**绝不退化为「把名称交给 shell/HTTP/ToolRegistry 试试」**。钱、用户资料写入、支付与任何 effectful action 都不在此目录。
- **每次 claim 重建**：skill 集合每次 consumer 领取 job 时创建——预算不跨用户/不跨面试共享。
- **egress 边界**（`packages/domain/src/research-policy.ts`）：窄出口策略 `classifyInterviewResearchBoundary`——NFKC+零宽归一后识别**明确高危指令**（资金转移/歧视性录用决定/私密数据外带/越权个人建议→`refuse`；提示注入/工具升格→`deny_external`）；模糊普通技术问题**有意**留在 CRAG/RAG 责任面，防守型问法（如何防止/检测/审计）放行。该策略**不是**通用意图分类器，禁止被通用 assistant 复用。
- **fail-closed**：网络能力未启用/预算耗尽/边界拒绝 → 空结果或 `degradedRetrieval` 降级，不编造素材；CRAG verdict 走 `degradedRetrieval` 单源（scenario 无素材走显式降级模板，非伪造）。
- **同意**：当前研究面无独立用户同意门（语音采集的显式同意门是同域先例，见 §2-G5）。

## 2. 目标架构：自主研究 agent（全部**未实现**）

产品目标（P1 行原文五要素）→ 目标形 → 升级门：

| 要素 | 目标形 | 升级门（全过才可接线） |
|---|---|---|
| G1 异步 | 研究 job 独立队列（worker claim·lease/CAS 同 0084 形），完成后经事件面回投，不阻塞面试回合 | 队列账本 + 超时/重试/终态收口证明 + 「研究失败=课题降级，不阻塞面试」行为臂 |
| G2 沙箱 | 外呼只经 allowlist 出口（复用 §1 静态目录形），禁任意 URL/shell/动态加载；进程级或网络级 deny-list 落地 | 沙箱逃逸负例矩阵（未知 skill/动态名/拼接 URL 全部空结果）+ 网络面 deny-list 配置证据 |
| G3 有界预算 | 任务级 token/时长/调用数三帽（沿 maxCallsPerSkill 同纪律放大），帽尽=确定性降级 | 预算耗尽降级臂 + 账本行（MODEL-OP 计费面接入） |
| G4 对抗核实 | 多源交叉核实 + 冲突标注（两源矛盾不静默取一）；素材落库前过 CRAG 同形 verdict | 对抗臂：矛盾源→标记不采纳；单源不可核实→降级不编造 |
| G5 同意 gate | 面试者对「本场允许外部研究」显式同意（语音同意门同形），未同意=本地检索 only | 同意位持久化 + 未同意走本地臂行为证明 + 同意撤回生效臂 |

## 3. 复用与禁改

- §1 的静态目录、egress 策略、预算纪律是 G1-G5 的**基座原语**，设计必须复用而非旁路（Ban 在 agent 内重开任意 HTTP 面绕过 `research-policy`）。
- `research-policy` 头注约束原文保留：它只识别明确高危指令；通用 assistant 产品需要自己的意图/授权合同，**不得复用本策略充数**。
- 观测：沿用 `METRIC` 面 + 研究 job 账本；Ban 把研究原始网页内容落日志（沿「素材不进 prompt/log/cache/event」纪律同形）。

## 4. 诚实边界与 pins

- 本文=现状事实 + 目标设计成文；**没有任何 G1-G5 项已实现**。
- GAP-MOP-01/BUG-NOTIFY-REC、GAP-MOP-02 claim 等先行缺口（north-star Phase 5）是本设计的依赖面，见 `REMAINING-NORTH-STAR-QUEUE.md`。
- Pins：NOT_HA · releaseEvidence=false · est live=0 · Ban 把本文当已接线证据。

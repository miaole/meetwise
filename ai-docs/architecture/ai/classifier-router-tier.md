---
id: architecture_ai_classifier_router_tier
name: 廉价分类 / 路由 tier（统一原语）
description: 输入/输出拦截、任务分类、是否开子 agent、PII 识别、RAG query 路由——这些决策点是同一个"廉价快速分类/路由"原语的复现；每个点用对工具（规则→小分类器→便宜 LLM→强 LLM），fail-mode 按用途分，级联升级，可观测可测。
type: reference
scope: shared
level: spec
status: active
owner: architecture
related:
  - ./agent-runtime.md
  - ./safety-defense-in-depth.md
---

# 廉价分类 / 路由 tier

> 多处决策点（输入/输出拦截、任务分类、是否开子 agent、PII、query 路由）是**同一个原语**的复现：一个廉价快速的「分类/路由」层。架构师的关键不是「都上 LLM」，而是**每个点用对工具、用对失败模式**。这一层是 `agent-runtime` 模型 catalog 分层的最便宜那一档。

> **实现状态（对齐代码）**：本文是分类/路由 tier 的**目标设计**，作为原语登记；当前**尚无独立分类器 tier 接线**。已运行的相关机制：面试图内"追问/换题/收尾"是**纯逻辑确定性决策**（能力模型驱动，非 LLM 路由）✅；重试分类（瞬时/确定拒绝）是 invoke 内纯规则 ✅；模型选择目前由组合根按节点直接注入 `defaultModelClient`/`fastModelClient`，而非本文的 catalog 分层路由（`catalog/resolveBinding` 仍是 `stub:deterministic` 骨架，见 agent-runtime §5）。输入/输出安全分类器、PII NER 门、RAG query 路由等⬜待建。

## 1. 工具选择顺序（挑"可靠到够用"的最便宜档）

**规则 → 小分类器 → 便宜 LLM few-shot → 强 LLM。** 不反射性地都上 LLM——规则与小分类器更便宜、确定、可测、可回归。

> **审计 H19——图内 LLM 路由必须确定且持久化**：mock-interview 是可恢复长会话，resume 会重跑节点；若"追问/下一题/结束"的 LLM 路由非确定，resume 后可能分到不同分支，破坏可恢复性与持久有序事件日志两原语。机制：① LLM 路由 `temperature=0` + 固定 prompt 版本；② **路由结果作为业务事实写入 checkpoint / 事件日志（`route_decided`），resume 读取既有决策、不重算**。决策一次、持久化、可重放。

## 2. 决策点 → 用什么 → 失败模式

| 决策点 | 用什么 | 失败模式 |
|---|---|---|
| 输入安全拦截 | 开源内容安全分类器（非 LLM，本地 <50ms，自托管 PIPL 友好） | **fail-closed**（挂了就拦/降级） |
| 输出安全拦截（TTS 前） | 同上 + 规则 | fail-closed |
| 任务/意图分类（走哪个图） | 意图少→便宜 LLM few-shot；量大稳定→小分类器 | **fail-open**（默认路由） |
| 图内路由（追问/下一题/结束） | 便宜~中模型 + 评分信号（语义重，非最便宜档） | 兜底默认分支 |
| **是否开子 agent** | **多数是规则**（报告固定维度扇出、B 端按候选扇出=确定性）；只有"要不要触发 deepsearch/研究"用**置信度/覆盖度阈值** | 不确定就不开，省钱 |
| 重试分类（瞬时/确定拒绝） | **纯规则**（错误码） | — |
| PII 识别（入库） | NER/分类器，非 LLM | fail-closed |
| RAG query 路由（self-query/routing） | 便宜 LLM | 兜底全量检索 |

## 3. 三个硬点

1. **延迟预算**：语音热路径多一次 LLM 往返就爆。拦截器必须**本地快分类器**，不是 LLM 往返。
2. **fail-mode 按用途分**：安全 **fail-closed**（拦不准就拦死），路由 **fail-open**（判不准走默认，别卡死业务）。同一个分类器在不同用途下失败语义相反。
3. **级联**：便宜分类器先过滤容易的 ~95%，仅**低置信**才升级到强模型裁决。moderation 与路由都用这招——成本最优。

## 4. 可观测 + 可测

- 分类/路由是有状态决策：**misroute 是失败模式**，进对抗测试集。
- 指标：分类准确率、误杀率（over-refusal）、升级率、各路由分布。
- 规则/小分类器确定性 → 比 LLM 路由更易回归——这也是优先它们的理由之一。

## 5. 自建 vs 买

- **分类器**：开源自托管为主（便宜、可控、不出境、无 per-call 成本）+ **薄业务桶**自建（刷分操纵/造假/越界 redirect 这些通用 API 不懂的面试语义）。
- **合规**：AIGC 备案 / 内容安全是**另一条合规轨**，不靠分类器本身满足（见 `safety-defense-in-depth.md`）。
- 纯自建过合规备案重；纯买漏面试域专属操纵识别——故分工。

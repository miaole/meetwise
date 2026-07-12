---
id: adr_0015_adaptive_agent_architecture
name: ADR-0015 自适应面试 agent 架构
description: 把"固定题单 workflow"重建为"可靠、会自己探索的自适应 agent"——决策/检索/工具/反思/角色拆分,及被否方案与失败模式。面试可辩护。
type: reference
scope: shared
level: guide
status: accepted
owner: architecture
related:
  - ./README.md
  - ../ai/langgraph-blueprint.md
  - ../../../.tmp/qa-bank/agent-architecture-crag.md
---

# ADR-0015 自适应面试 agent 架构 · accepted

> 项目核心卖点是 **agent 架构**。本 ADR 记这套 agent 从"薄壳"重建为"真 agent"的决策与取舍,逐条可在面试追问下给出理由而非结论。

## 背景

第一版面试"agent"实为 **固定题单 workflow**:`quizGenerator` 一次性让模型从简历**猜** N 道题 → 顺序问(`questions[i]`)→ 逐题评 → 报告。**下一题与上一题答得如何无关**,无工具、无反思、无适应。这是**继承了源项目"LLM 包一层固定问答"的交互模型**——我们重做了底座(杀内存 session、上 checkpointer/HA/RLS),却没质疑 agent 设计本身。

**核心教训(可辩护):重建基础设施 ≠ 重建智能;底座对不等于脑子对。**

## 决定

把 agent 重建为 **感知→推理→行动 的自适应循环**,跑在已有持久 substrate 上(LangGraph checkpointer + `invoke` 关口双校验/exactly-once):

1. **规划官(plan-and-solve)**:据岗位+简历提目标能力,非固定题单。
2. **自适应决策**(纯逻辑,确定可 gate):能力模型(per-competency confidence/depth/evidence)→ 决策 **追问 probe / 换题 pivot / 调难度 / 收尾 conclude**。
3. **CRAG 自纠检索**(可靠"自己探索"的本体):检索后**给结果打分** → 够好 `use_local`(剥无关)/ 模糊 `augment_web` / 不行 `fallback_web`(**自主回退 web 探索**)。（🟡 web 探索机制已建但默认关闭：`WEB_ALLOWLIST=[]` 空 ⇒ `augment_web`/`fallback_web` 实际退化为只用本地；启用需配置授权源。）
4. **接地出题**:检索真题 + 改写个性化(**简历事实经图状态 durable 串入**)。四条门:标来源、不照搬(版权)、去重、对上能力。
5. **反思自检**:出题后自我批评(太短/重复/诱导/跑题)→ 坏题挡下重生成(有界 ≤3)。
6. **工具系统**:`Tool{name,desc,argsSchema,invoke}` + 注册表。两铁律:**入参不可信→校验后才执行(防注入)**、**循环有界(防失控)**。
7. **角色拆分**:规划官/面试官/评估官 各自 `invoke` + 各自 prompt(注册表,**动静分离** → 稳定 system 前缀可缓存)。
8. **报告走舱壁**:报告**不在 agent 图内出**,经 report-worker 异步(失败隔离,不连累面试,可重试,不双花模型)。

对应 2026 agentic 模式:ReAct / Reflection / Planning / Tool-Use / Orchestrator-Worker。

## 被否方案

- **固定题单(原设计)**:不自适应——核心病灶,否。
- **LlamaIndex(做 agent/RAG)**:查证 **LlamaIndex.TS 2026 已弃用/不再维护**(workflows-ts 弃用、legacy agents v0.9.0 移除、官方导向 Python);TS 生产押它=押死框架。**保留 LangGraphJS**(循环/有状态/人在环/长会话/持久化正是可恢复面试的形状),**拿 agentic-RAG/CRAG 模式自己在现有混合检索(pgvector+BM25+rerank)上实现**——能力同、不锁死、十年可控。
- **图内出报告**:否——破坏报告舱壁的失败隔离 + 双花模型。
- **qbank 每用户私有**:否——策展真题=共享知识(非 PII,非多租户)→ **公共读**(系统 owner 灌一次,全用户检索;memory 仍 owner 私有)。
- **热路径现爬 web**:否——慢/脆/踩 ToS 版权。**离线建库 + allowlist 强制 + 注入 fetch + transform 不照搬**;CRAG 仅在本地不够好时才探。

## 后果与验证

- **~16 块 gate**(adaptive/grounded/crag/tools/critique/集成图/真deps角色/lifecycle/consumer/qbank/全链路…)+ **真 qwen 端到端实跑**(规划→接地出题→评分→自适应,Langfuse 一棵树)。
- **验证拆解(可辩护)**:决策逻辑(pivot/conclude)→ 确定性 gate 证;真组件(出题质量/评分/检索)→ 真模型 live 证。两者合 = 全系统验证。
- **只有真跑才暴露的细节,全抓修**:`fetchWithTimeout` 三适配器漏 import(超时包装实为 undefined 崩溃,fake-gate 照不到);出题没传简历事实(prompt 声称个性化却做不到);幂等键须用图持久 `turn`(内存计数器跨进程 resume 碰撞→返缓存首题);额度在 reserve 时即扣。

## 失败模式(面试追问预案)

- **检索为空**:embedder/题库不可用 → `[]` → CRAG 优雅降级(按能力出题),面试不失败(fail-soft)。
- **web 探索**:allowlist 默认空(不乱爬);源/授权由配置;transform 不照搬(版权);失败跳过(降级)。
- **反思/工具循环**:均有界(≤3 重生成 / maxSteps),防失控烧钱。
- **成本**:每回合多次模型调用 → Langfuse 成本看板(token 进 span);prompt 动静分离命中供应商缓存降本。
- **过度追问**:深问 + 答不到点 → confidence 升得慢 → 可能多轮探同一能力;由 maxTurns 预算兜底,且深探对面试本就有益。

## 记忆设计裁决(已过两轮专家审计)

自适应 agent 的"富记忆/个性化"设计(信念层 + 成长层 + embedding 三层)被**否决**:它会破坏引擎确定性、造出与 `assessment_report` 分叉的第二成长真相源、并形成"确认偏差"回路(记住"弱项"→ 只探弱项 → 更"证实"弱项)。**审定的 MVP**:跨会话**精确哈希去重**(同候选人不重复出同题) + **复用 `assessment_report` 作为唯一成长真相源**;信念/个性化 store **暂缓(deferred)**。成长曲线只从 `assessment_report` 派生。对应 `memory-service` 模块(`rememberFact`/`recallMemories`/`episodeSeen`)现为🟡**机制已建、未接线**(仅测试路径调用,主循环不读写)。

## 与代码现状的对账(哪些已接线运行、哪些默认关闭/骨架)

- ✅ **已接线运行**:规划→自适应决策(确定性 gate)→CRAG 检索(本地 qbank ANN,fail-soft)→接地出题→反思→评估,真 qwen 端到端;报告舱壁(独立 worker);invoke 双校验 + 瞬时错误指数退避 + 成本 token 落 `ai_invocation_trace`。
- 🟡 **机制已建、默认关闭/未接线**:web 探索(`webExplore` 已建,`WEB_ALLOWLIST=[]` 默认空 ⇒ CRAG fallback 只用本地);跨供应商 failover(`failoverModel` 代码在,需 `MODEL_BACKUP_*`,默认单端点);长期记忆(见上)。
- 🟠 **stub/toy**:图片简历多模态 OCR(qwen-vl)当前是 **stub**——图片简历被拒(`image_ocr_unavailable`,接线中);qbank 为 **~33 条自撰种子题**(非大规模策展题库);`catalog/resolveBinding` 为 `stub:deterministic` 残留骨架,invoke 不消费。

## 未尽(非架构缺口,属内容/配置)

更多策展真题(运营离线 `ingestQbank`)、web allowlist 真源(配置)、图片简历 OCR 接线(qwen-vl,当前 stub)、流式语音电话网关(PSTN/SIP,外部基建)。

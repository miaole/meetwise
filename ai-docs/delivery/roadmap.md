---
id: delivery_roadmap
name: 路线图
description: Meetwise 从文档、原型到 MVP 和长期平台的路线图。
type: reference
scope: shared
level: guide
status: active
owner: product
version: 1
tags:
  - roadmap
---

# 路线图

> **状态图例**：✅ 已接线运行 · 🟡 已建未接线/桩/默认关 · ❌ 未建。详细进度看板见 [`production-backlog.md`](./production-backlog.md)（本文只给分阶段轮廓，不重述细节）。

## Phase 0：文档和架构 ✅

- 命名与定位。
- 面试域现状与目标审计。
- 产品愿景和领域模型。
- 技术架构和 LangGraph 方案。
- Docker Compose 演示方案。
- 测试策略和 AI golden tasks。

## Phase 1：工程骨架 ✅（大体建成）

- ✅ 初始化 monorepo（`apps/{web,api,worker}` + `packages/{db,domain,ai-runtime,ai-graphs,contracts,config}`）。
- ✅ Next.js web（RSC + Server Actions + cookie 鉴权）。
- ✅ NestJS api（Fastify + 类型 DI + zod 契约）。
- ✅ worker（report dispatcher + interview/quiz/diagnosis consumer + commerce reconciler）。
- ✅ packages/contracts（zod4 源 + 生成 OpenAPI）。
- ✅ packages/ai-graphs（真 LangGraph + Postgres checkpointer）。
- ✅ packages/db（Postgres + 迁移 + RLS FORCE）。
- ✅ Docker compose.dev/demo。
- ✅ Postgres/Redis/MinIO seed。

## Phase 2：MVP 主链路 🟡（承重逻辑已通，壳层/多模态待补）

- ✅ demo 登录（真 scrypt + HMAC 会话，含会话吊销）。
- 🟡 简历上传和解析（文本/粘贴 + 结构化 + PII 闸 + 加密已接线；**PDF/docx 适配器待补、图片 OCR 为 422 桩**）。
- ✅ 岗位/JD 分析。
- ✅ 简历押题 graph（resume-quiz，factuality 歪曲门）。
- ✅ 模拟面试 graph（threadId=resultId + checkpointer + interrupt + 事件账本 + lease）。
- 🟡 报告 graph（报告子图舱壁 code-validated；`report.generate` 接 invoke 的生产桩收口中）。
- ✅ 历史记录。
- ✅ 权益扣减（reserve→confirm→release saga + FIFO + outbox 结算 + 对账 reconciler 已接线）。

## Phase 3：质量和商业闭环 🟡

- 🟡 支付沙箱 + 回调对账（commerce-webhook 控制器 + outbox 对账已接线；真实 PSP 沙箱接入待续）。
- ❌ AI eval（CI eval gate 待建）。
- 🟡 观测面板（成本/token 已落 `ai_invocation_trace` 自库 + Langfuse 转发；OTel metrics 导出/面板待续）。
- 🟡 管理后台（admin/recruiter 守卫 + B 端控制台部分建；治理动作面待补）。
- 🟡 模型成本预算（成本源头数据已落库；预算闸/告警待接）。

## Phase 4：职业路径扩展 ❌（未建）

- ❌ 成长档案（GrowthProfile / SkillInference 数据模型已定，**记忆模块已建未接线**，聚合未跑）。
- ❌ 职业路径分析。
- ❌ 岗位推荐。
- ❌ 学习计划。
- ❌ 能力曲线。


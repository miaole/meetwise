---
id: requirement_epic_mvp_interview_career_platform
name: MVP - AI 面试与职业准备平台
description: Meetwise MVP 的范围、模块、验收和非目标。
type: requirement
scope: shared
level: epic
status: active
owner: product
version: 1
tags:
  - mvp
  - interview
  - career
---

# MVP - AI 面试与职业准备平台

> **🔎 实现状态（对齐真实代码 · 2026-07）** — MVP 主链路（登录→简历→岗位→押题→模拟面试→报告→学习建议→历史）**已实现+接线并可端到端跑通**（e2e proof 覆盖）。校正：MVP 模块表中“简历-上传/解析”当前**仅文本/PDF 文本层**，图片 OCR 为桩；“用户-邮箱登录”已用 scrypt+HMAC 实现（**微信/OAuth 未接**）；押题出题接地仅本地种子题库（联网未启用）。本表其余项已落地，超出 MVP 的“视频/企业端/多租户后台/题库运营”中，企业招聘端与多租户 RLS 实际**已提前建成**，视频/完整运营后台仍为规划。

## 目标

做出一个可以本地一键演示、可以线上部署、可以持续迭代的偏面试 AI 求职准备平台。

MVP 不追求功能铺满，而追求主链路闭环：

```text
登录 -> 简历 -> 岗位/JD -> 押题 -> 模拟面试 -> 报告 -> 学习建议 -> 历史记录
```

## MVP 模块

| 模块 | MVP 范围 |
| --- | --- |
| 用户 | 邮箱/测试账号登录，后续接 OAuth |
| 简历 | 上传、解析、版本管理、结构化画像 |
| 岗位 | 手动输入岗位/JD，生成岗位画像 |
| 押题 | 生成问题、答案、考察点、匹配分析 |
| 模拟面试 | 文本模式，支持暂停/恢复/结束 |
| 报告 | 雷达图、逐题点评、优势、风险、学习计划 |
| 权益 | 本地 seed 套餐和次数，支付先抽象接口 |
| AI 运行 | LangGraph checkpoint、trace、prompt version |
| 历史 | 查看押题和面试历史 |
| 演示 | Docker Compose 一键跑通 |

## MVP 不做

- 真实支付上线。
- 视频面试。
- 企业招聘端。
- 多租户后台。
- 大规模题库运营。
- 复杂推荐系统。

## 验收

- 本地 `docker compose` 能启动 web、api、worker、postgres、redis、minio。
- seed 后有演示账号、演示简历、演示岗位、演示权益。
- 能完整走通押题和模拟面试。
- 服务重启后，进行中的模拟面试可恢复到 checkpoint。
- 所有前后端接口来自共享契约。
- 所有 AI 输出经过 schema 校验。
- 关键流程有自动化测试或明确未覆盖原因。


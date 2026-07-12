# Meetwise

中文名：知面

Meetwise 是一个偏面试的 AI 求职准备平台。它以面试训练为中心，覆盖简历解析、岗位匹配、职业路径分析、能力差距评估、押题、模拟面试、报告复盘、学习计划和长期成长档案。

本仓库当前阶段只沉淀产品、架构、测试和 AI 协作规则，不急于写业务代码。目标是先把系统边界、领域对象、LangGraph 编排、接口契约、数据模型、部署演示和验收标准想清楚。

## 命名

- 中文产品名：知面
- 英文产品名：Meetwise
- 推荐仓库名：`meetwise`
- 中文含义：知己知彼，面向面试；也包含面对职业选择、岗位匹配和能力成长的含义。
- 英文含义：`meet` 表示面谈、面试、人与机会的相遇；`wise` 表示洞察、判断和策略。

## 当前目录

```text
meetwise/
  ai-docs/        # 统一 AI 知识层：产品、架构、规则、测试、交付
  .tmp/           # 单次 harness、临时证据和运行记录，默认不提交
```

## 第一阶段目标

1. 梳理从源项目继承的业务能力和问题。
2. 定义 Meetwise 的产品边界、核心领域模型和流程。
3. 设计 Next.js + NestJS + LangGraph + Postgres 的长期架构。
4. 设计 Docker Compose 一键本地演示路径。
5. 建立文档先行、契约先行、测试先行的 AI 驱动协作方式。

## 推荐阅读

1. `ai-docs/meta/index.md`
2. `ai-docs/product/vision.md`
3. `ai-docs/product/domain-models/interview-career-domain.md`
4. `ai-docs/architecture/system-blueprint.md`
5. `ai-docs/architecture/frontend/frontend-blueprint.md`
6. `ai-docs/architecture/ai/langgraph-blueprint.md`
7. `ai-docs/architecture/devops/local-demo-deployment.md`


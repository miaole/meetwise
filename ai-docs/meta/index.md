---
id: meta_index
name: ai-docs 索引
description: Meetwise AI 知识层入口，说明目录职责、阅读顺序和核心文档。
type: rule
scope: shared
level: guide
status: active
owner: architecture
version: 1
tags:
  - meta
  - index
---

# ai-docs 索引

## 核心入口

- `product/vision.md`：产品定位、目标用户、长期边界。
- `product/glossary.md`：统一术语。
- `product/domain-models/interview-career-domain.md`：领域模型。
- `product/workflows/core-workflows.md`：核心业务流程。
- `architecture/system-blueprint.md`：总体技术架构。
- `architecture/frontend/frontend-blueprint.md`：Next.js 前端架构、组件库、RSC 边界、SSE 消费。
- `architecture/ai/langgraph-blueprint.md`：LangGraph 编排方案。
- `architecture/devops/local-demo-deployment.md`：Docker Compose 本地演示和部署策略。
- `testing/strategy/test-strategy.md`：测试策略。
- `observability/README.md`：AI、Graph、成本和质量观测。

## 任务分流

| 任务类型 | 首入口 | 关键产物 |
| --- | --- | --- |
| 产品规划 | `product/vision.md` | 产品边界、用户、模块地图 |
| 需求落地 | `requirements/epics/` 或 `requirements/iterations/` | PRD、验收标准 |
| 业务建模 | `product/domain-models/` | 领域对象、状态机、关系 |
| AI 编排 | `architecture/ai/langgraph-blueprint.md` | graph、state、checkpoint、eval |
| 前端架构 | `architecture/frontend/` | 页面、组件、数据流、RSC 边界 |
| 后端架构 | `architecture/backend/` | 模块、接口、DB、事务、队列 |
| 部署演示 | `architecture/devops/local-demo-deployment.md` | compose、seed、健康检查 |
| 测试设计 | `testing/strategy/test-strategy.md` | 测试矩阵、golden tasks |
| 代码生成前确认 | `references/templates/task-harness.md` | Task Harness |

## 新增文档规则

- 长期稳定业务共识放 `product/`。
- 单次或阶段性需求放 `requirements/`。
- 技术方案放 `architecture/`。
- 强约束放 `rules/`。
- 工作方法放 `skills/`。
- 模板和源项目资料放 `references/`。
- 测试策略和评测放 `testing/`。
- 发布、复盘和路线图放 `delivery/`。


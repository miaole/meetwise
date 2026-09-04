# Meetwise AI Docs

`ai-docs` 是 Meetwise 的统一 AI 知识层，服务 Codex、Cursor、Claude 以及后续其他 agent。

目标：

- 让产品、架构、规则、测试和交付知识只维护一份。
- 让 AI 在做事前能稳定找到正确上下文。
- 让代码生成前有证据、边界、契约和验收。
- 让长期项目可以持续沉淀，而不是靠聊天记录续命。

目录说明：

- `meta/`：索引、目录边界、任务 SOP。
- `product/`：产品愿景、术语、领域模型、核心工作流。
- `requirements/`：epic 与 iteration PRD。
- `architecture/`：前端、后端、AI、DevOps、观测等长期架构。
- `rules/`：长期稳定工程规则。
- `skills/`：任务型工作方法。变更后测试入口：`skills/testing/SKILL.md`。
- `testing/`：测试策略（HTTP E2E 主层、Playwright 次层）、`conventions/test-authoring.md`、`golden-tasks/` 登记、E2E 证据和评测。
- `delivery/`：路线图、发布说明、复盘。
- `observability/`：AI 运行、prompt 质量、graph 质量和成本观测。

使用顺序：

1. `meta/index.md`
2. `product/vision.md`
3. 当前任务对应的 `requirements/`
4. 对应范围的 `architecture/`
5. 对应范围的 `rules/`
6. 必要时使用 `skills/`
7. 最后补 `testing/` 与 `delivery/`

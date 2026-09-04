---
id: GT-01
status: planned
subject: ai-output
---

# GT-01 · 前端岗 + 有项目简历 → 8–12 题且含项目深挖

- **策略来源**：test-strategy 第一批第 1 条。
- **subject**：`ai-output`（不得标 `mapped`；fake 固定题不是本条绿）。
- **status**：`planned`（无 covering 门断言题量与项目深挖）。
- **夹具（目标）**：前端开发岗位；简历含至少一个可深挖项目（路由、状态、性能或组件边界）。
- **期望**：生成 8–12 个问题，至少一题绑定该项目事实，不得编造简历未写经历。
- **相关但不覆盖**：`e2e:isolated` 只断言至少 1 题并跑到终态；`interview:prove` 不检查 8–12 或项目深挖；`quiz:prove` / `pipeline:prove` 用 fake/脚本化题证明 factuality，不能冒充本条。
- **负向**：题量在区间外、或深挖题引用了简历没有的项目 → 不得标通过。
- **禁止**：用 fake model 出 8 道固定题来宣称本任务已绿。

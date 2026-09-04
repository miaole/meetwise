---
id: GT-02
status: partial
---

# GT-02 · 过短作答 → 报告指出表达不足，不得高分

- **策略来源**：第一批第 2 条。
- **status**：`partial`。
- **已映射**：`pnpm scoring-golden:prove` 的非作答 / 低档相对序夹具；真模型层见 `pnpm scoring:eval`（未达发布样本量，inconclusive）。
- **期望**：过短或“不太清楚”不得进入高档；报告不得用中性 50 分掩饰。
- **缺口**：没有一条门断言「终态报告文案写了表达不足」。HTTP E2E 使用完整技术答案，不覆盖本条。
- **禁止**：把 nightly 小样本单调性写成“短答质量已校准”。

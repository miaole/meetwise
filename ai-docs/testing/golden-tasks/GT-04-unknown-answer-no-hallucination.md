---
id: GT-04
status: partial
---

# GT-04 · 用户回答「不会」→ 引导，不幻觉已掌握

- **策略来源**：第一批第 4 条。
- **status**：`partial`。
- **已映射**：`scoring-golden` 非作答档与 offtopic 桶要求 `relevant=false → score=0`。
- **期望**：追问转为引导或换角度，不得在后续题或报告里写“候选人掌握 X”。
- **缺口**：没有独立 eval 断言引导话术；HTTP E2E 澄清分支只答「跳过」。
- **禁止**：模型自称“已引导”当作验收。

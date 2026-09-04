---
id: GT-04
status: partial
---

# GT-04 · 用户回答「不会」→ 引导，不幻觉已掌握

- **策略来源**：第一批第 4 条。
- **status**：`partial`。
- **已映射**：`pnpm scoring-golden:prove`（offtopic/非作答**夹具结构**与红队标签，不执行评分）；`pnpm adaptive-offtopic:prove`（图行为：「不知道 / 还是不会」→ clarify 引导语，二次非作答 pivot；fake assess，不是生产 `evaluateAnswer`）。
- **期望**：追问转为引导或换角度，不得在后续题或报告里写“候选人掌握 X”。
- **缺口**：生产路径 `relevant=false → score=0` 未挂到本条 covering 门；没有独立 eval 断言引导话术；报告/后续题「掌握 X」未立项。HTTP E2E 澄清分支只答「跳过」。
- **禁止**：模型自称“已引导”当作验收。

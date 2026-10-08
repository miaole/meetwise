# NEGCOMM-1 attempts 账（禁重跑至绿）

| # | 时间(本地) | 命令 | 前置静态门 | EXIT | 结果 | 重跑? |
|---|-----------|------|-----------|------|------|-------|
| 1 | 2026-10-07 | `pnpm neg:commerce` | esbuild transform EXIT=0 · node --check EXIT=0 · e2e-static-guards EXIT=0 | **0** | `✓ neg:commerce: 84 条负路径用例全绿` FAIL=0 · 隔离容器 meetwise-e2e-25866-1791491508219 | 否（一次即绿，零重试零重排） |

- attempts 合计 = **1**；retry-to-green 次数 = 0；用例重排 = 无（新门断言插入 §5 缺 resume-id 用例之后，其余用例顺序原样）。
- 原始日志：`run-attempt1.log`（未删节，含 R5-MARKED-RED 横幅与 EXIT 行）。

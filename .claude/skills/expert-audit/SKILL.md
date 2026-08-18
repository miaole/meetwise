---
name: expert-audit
description: 对复杂设计/spec/代码/测试做对抗式专家 agent 审计（项目 P0 规则，禁止 freehand）。Use before concluding any complex (L2+) design, architecture, spec, code, or test — spawn an adversarial panel of domain experts to find致命 errors, overclaims (doc promises ≠ implemented), uncovered failure modes, over-engineering, and validation造假. Complex work stays draft until it passes.
allowed-tools:
  - Read
  - Grep
  - Agent
---

# expert-audit · 复杂产物对抗式专家审计（P0）

P0 铁律（见 [task-sop §5](../../../ai-docs/meta/task-sop.md)）：**复杂业务/设计/代码下结论前必须先过专家 agent 审计；禁止自由发挥当定稿。** 只有 L0/L1 琐碎走自检。

## 步骤

1. **按主题选专家镜头**（对口才有用）：分布式/并发可靠性、agent/LLM 系统、RAG/检索、多租户安全、数据库/一致性、AI 安全合规、DevOps/SRE、C 端反过度工程。代码产物加"代码审计专家(正确性/安全/验证是否造假)"。
2. **每位专家用 Read 读真实文件**，对抗式找：①致命错误/不可落地 ②**过度声明**(文档承诺≠落地、绿了≠通过) ③失败模式未覆盖 ④过度设计 ⑤与四原语/既有设计冲突 ⑥(代码)正确性/安全漏洞/造假式验证。
3. 用 Agent 并行派专家。每条发现给 `严重度(致命/高/中) | 问题 | 改法`。
4. **综合成 fix-list**，按严重度排序，先修致命。
5. **输出 fix-list**（按严重度排序、每条给改法），由主流程应用修复并重新验证（如代码 gate 重跑）——审计只审不改（无 Write/Edit/Bash）。未闭合不算完成。

## 输出

`审计报告(分级 findings + 过度声明合订 + solid 保留项 + 修复顺序)` → 交主流程应用 → `重新验证通过`。

# TOKSTREAM-S3 — 阶段2 完整流式实施设计刀（docs-only 设计定稿）

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 `c17804a5` · 分支 `line/tokstream-s3-design` · 蓝本 = TOKSTREAM-S2 nail 必备面清单（B_PASS 实测+S2 席2 开列）。

## 1. 设计范围（docs-only 设计定稿·零产品码）
**产线**：model-client 流式通道（`stream=true`+`stream_options.include_usage`·dashscope compatible-mode OpenAI wire delta.content 天然增量·finish_reason=stop+空 choices usage+[DONE] 三联终结）→ api SSE 泵（复用 `apps/api/src/platform/sse-pump.ts` 形态）→ 前端逐 token 渲染管线。
**S2 必备面全覆盖清单**：①流中 error frame 面（C 被 HTTP 前置拦截未实测——设计携带）②静默断流面 ③idle/总闸截断策略 ④跨 chunk 多字节 UTF-8 TextDecoder stream 解码纪律 ⑤并发/取消/断流续传与计费语义 ⑥长流 pacing（样本仅 72 字符）⑦**拼接校验=长度守恒（ΣdeltaLen==accLen）+归一化全等（+completion_tokens 量级对账）·明文禁裸前缀重叠启发式**（T3 误报实证会改坏正确输出）⑧非 200+JSON error body 一等错误路径（res.ok 先判·4xx 禁重试）。
**G7 车道**：g7_ 前缀族抛出语义 §2.2 冻结零触（流式通道并行面非错误分类面）。

## 2. 产出
设计文档 `ai-docs/delivery/harness/tokstream-s3-design.md` 扩写：数据流图/接口签名/错误矩阵/SSE 事件 schema（zod 双端注册·阶段1 惯例）/测试矩阵（S2 收据形态作 fixture）/分批实施切片（EXEC 刀拆分建议）。

## 3. Ban
零产品码（纯设计文档）·g7 车道零触·Key name-only·pins 十一值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false）+脚注 actualSpendCny=null·实现不自批·alone≠dual。

## 4. 验收
设计文档+必备面清单 ①-⑧ 逐面覆盖对照表+实施切片建议+收据 `ai-docs/delivery/receipts/tokstream-s3-design/`。

## 5. Non-claims
设计 ≠ 实施 ≠ 流式上线。

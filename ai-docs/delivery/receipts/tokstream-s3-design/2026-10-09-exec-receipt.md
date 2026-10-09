# TOKSTREAM-S3 EXEC 收据 — 阶段2 完整流式实施设计刀（docs-only 设计定稿）

**Date**: 2026-10-09 · **Worktree**: `meetwise-line-tokstream-s3` · **Branch**: `line/tokstream-s3-design` · **Base**: `c17804a5` · **REQUEST**: `0a52d12c`（`ai-docs/delivery/harness/tokstream-s3-design.md` §1-§5 原文零改动保留·仅状态行推进）

**授权链**: 协调方 EXEC 授权（2026-10-09）· 席1 处方并入=§B 数据流图必须显式钉死 worker→api 跨进程跳（模型 invoke 实际在 worker 侧 `interview-service.ts:2`——流式消费进程归属→interview_event/notify→sse-pump→浏览器逐段箭头）· harness 状态 `draft:awaiting_pre_exec_dual` → `exec:awaiting_post_prove_dual`。

## 产出（两文件 docs-only · 零产品码）

1. `ai-docs/delivery/harness/tokstream-s3-design.md` 扩写（194 insertions/1 deletion·213 行）· sha256 = `ea4403616e0cf7567849ea139109db015980b1063963a4c794e5f8dab664504b`：
   - §A 亲证锚点表（15 锚全数本刀亲读·行号 @`0a52d12c`）；
   - §B 数据流图（席1 处方承重：六段箭头+进程边界三框——浏览器/api/worker+dashscope·⑤跨进程跳=PG LISTEN/NOTIFY 专用通道 `interview_token_ch`·行泵/delta 臂在 sse-pump 内双源汇出·六段语义表）；
   - §C 传输面（T-A=PG NOTIFY 专用通道 primary·api/worker 运行时无 Redis 依赖亲证故 T-B=Redis Streams 仅登记演进；帧契约/8KB 码点安全切分/at-most-once 丢帧=终态兜底/**Last-Event-ID 光标防毒：token_delta 帧不带 id**·R-B 红线 delta 不落持久表）；
   - §D 接口签名（ai-runtime completeStream 双 preview flag fail-closed 沿 voice-stream 形制·invoke 观察缝 `onModelDelta` 关口零改·worker withTokenStream 与 generation-progress 同位·api sse-pump deltaSource 注入行泵零改·web zod+归约）；
   - §E 错误矩阵（S2 实测态 vs 未实测态如实分栏：⑧C 实测 404 前置=一等路径 res.ok 先判禁重试·①流中 error frame/②静默断流/③idle 10s watchdog+双层期限=设计携带合成 fixture·⑤并发/取消/续传/**计费禁双跑双扣**·⑥三层 coalesce·⑦长度守恒+归一化全等+量级对账 telemetry 非门+**明文禁裸前缀重叠启发式**·④TextDecoder stream+码点安全）；
   - §F zod 双端 SSE schema（token_delta 唯一新增·**唯一 id-optional 成员**·.loose() 容演进·双端同刀注册纪律·旧前端静默丢 delta 向后兼容免费获得·CLAUDE.md:54 SSOT 更新登记 S4c/d 刀内本刀零触）；
   - §G 测试矩阵（S2 收据 7 文件形态→fixture 映射逐行+合成 fixture 4 卷·全零 live·fake seam 沿 voice-stream）；
   - §H 必备面 ①-⑧ 覆盖对照表（逐面 S2 态→设计落点→实施刀）；
   - §I 实施分批切片 S4a→S4b→S4c→S4d（触碰面/内容/关键验收·每片独立 REQUEST）；
   - §J Ban 合规自检。
2. 本收据 `ai-docs/delivery/receipts/tokstream-s3-design/2026-10-09-exec-receipt.md`。

## 锚点亲证抽样（全表见设计文档 §A）

- `apps/worker/src/interview-service.ts:2`（worker 真跑=invoke 进程归属·席1 处方锚）·`:213/:307`+`adaptive-interview-service.ts:113`（阶段1 三触发面）
- `model-client.ts:395/:403`（非流式·零 stream 字段·本分支仍成立）·`voice-stream.ts:5-6`（双 preview flag 形制）·`invoke.ts:135/:19/:346-390`（关口不变面）
- `sse-pump.ts:46/:66/:87-90`（行泵/10min 帽/ping）·`interview.controller.ts:253-272`（槽≤5·isTerminal 五 kind·Last-Event-ID）
- `sse-notify.service.ts:28-29`+`0143_sse_push_notify.sql:26`（现通道载荷=仅 stream_key → 新 delta 须专用通道的设计依据）
- `interview-event.ts:16/:24-28`（appendEvent/0126 围栏）·`business-events.ts:21-72/:79/:101`（zod id 必填/CRLF 三分/null-drop·token_delta id-optional 的对照面）·`CLAUDE.md:54`（SSOT 句）
- S2 收据 7 文件在卷（`receipts/tokstream-s2-probe/2026-10-07/`·经本线 `076514d9`）·B_PASS/404 前置/T3 误报实证如实转写入 §E/§G

## 纪律面

- est live 模型调用=**0**（docs-only 设计刀·零供应商外呼）· `estimatedCostCny` 不适用 · 脚注 actualSpendCny=null
- Key：零触碰零读取（name-only 纪律沿 G7P 系·值零落盘零回显）
- pins 十一值照抄：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false + 脚注 actualSpendCny=null
- Non-claims：设计 ≠ 实施 ≠ 流式上线 ≠ flag 开启裁决；①②③⑥ 未实测面=设计携带（合成 fixture 承载）非预 claim 供应商行为
- Ban self-approve · alone ≠ dual · 本收据交 post-prove 双审 · 遇雷核查：无（S2 收据在卷·REQUEST 在卷·全锚点可达·零阻塞）

**STOP** · harness → `exec:awaiting_post_prove_dual` · 席位 mw-e2e-ha（协调方 EXEC 授权 · docs-only）

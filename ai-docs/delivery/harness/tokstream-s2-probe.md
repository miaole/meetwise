# TOKSTREAM-S2 — 供应商 text 流式能力核实探针刀（阶段2 前置门）

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 `7ad2b3e2` · 分支 `line/tokstream-s2-probe` · 立项依据 = 用户核心三诉求之一「大模型吐的 token 事实展现前端」——TOKSTREAM 阶段1（生成进度事件）已 nail 落地，阶段2（完整流式）前置门=供应商 text SSE 能力核实（现树事实：model-client.ts text 补全**零流式调用**·dashscope-native-config 仅 voice ASR/TTS wss 流式·text 走非流式 HTTP）。

## 1. 手段（探针脚本·零产品码·scripts/ 新增）
`scripts/tokstream-s2-probe.mjs`：直调 dashscope **compatible-mode** 端点（base 同 model-client 既有配置面·Key 经授权 loader 进程 env name-only）：
1. **探针 A（非流式基线）**：现有非流式 chat 调用一次（对照基线：时延/token 数/响应形态）；
2. **探针 B（SSE 流式）**：同 prompt `stream=true`+`incremental_output=true`（dashscope compatible-mode SSE 形态）——逐 chunk 采集：首 token 时延（TTFT）/chunk 间隔曲线/增量文本拼接完整性（与非流式结果语义对照）/finish_reason/usage 面；
3. **探针 C（错误形态）**：无效模型名一次（流式错误的事件形态——SSE error frame or HTTP 错误）。
- est live ≤5（A 1+B 1+C 1+重试余量 2·真实模型调用·authorized loader Key·name-only 记账·estimatedCost 免费额度面如实）·恰每探针一次禁重跑。

## 2. 判读（产出=阶段2 实施设计输入·非实施）
- **B 通**（SSE 逐 token 产出+拼接完整）⇒ 阶段2 实施设计 REQUEST 可立（model-client 流式通道+SSE 泵复用 sse-pump 形态+前端逐 token 渲染管线——另刀全链）；
- **B 形态异常**（无 incremental/整段一次出）⇒ 供应商能力面如实登记 ⇒ 阶段2 降级为「分段伪流式」（阶段1 事件粒度加密）评估；
- **C 错误形态** ⇒ 流式错误处理设计输入。
三向如实禁洗绿。

## 3. Ban
零产品码（apps/packages src 零改）·探针脚本仅 scripts/ 新增+package.json 单 script·Key 只经授权 loader 进程 env（name-only 记账·值零落盘零回显——log/redact 纪律沿 G7P 系）·pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）·实现不自批·alone≠dual·**G7 车道零触**（探针不经 g7 卫兵面·直连供应商·与 model-client 零耦合）。

## 4. 验收
3 探针各恰一次全收据（原始 SSE chunk 流 redact 后留档+TTFT/间隔曲线+拼接对照）+三向判读+脚本 sha256 自证+收据 `ai-docs/delivery/receipts/tokstream-s2-probe/`·node --check 过。

## 5. Non-claims
本刀 ≠ 阶段2 实施 ≠ model-client 改造 ≠ 用户可见流式上线（=前置核实供料）·Key 使用面=authorized loader 既有授权域（MODEL_API_KEY 既有 G7P 系同源）。

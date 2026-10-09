# TOKSTREAM-S2 供应商 text 流式能力核实探针刀 — EXEC 收据

**席位** mw-core · **蓝本** REQUEST rev3 @a8f2f67e（唯一蓝本·`ai-docs/delivery/harness/tokstream-s2-probe.md`） · **worktree** `/Users/miaole/Desktop/golucky/meetwise-line-tokstream2` · **分支** `line/tokstream-s2-probe` · **base** 主线 `7ad2b3e2`（源码树亲证等同：`git diff 7ad2b3e2 HEAD` 仅 harness 文档 +25 行） · **运行时钟披露**：run-id 取协调方授权日历日 `2026-10-07`，runtime ISO 时钟为 `2026-10-09T01:52:20Z`（机器时钟），两者并列如实。

## 1. 交付面（Ban 合规：零产品码）

| 触碰 | 文件 |
| --- | --- |
| 新增探针脚本 | `scripts/tokstream-s2-probe.mjs`（零依赖·node --check 过·sha256=`1dceb7c16b4e64c5acdee8b7cb010faa7844f9c20b2e7036dbdc5c1d0a3fd8fe` 运行时自证，与盘上终版一致） |
| manifest 申报 | `ai-docs/architecture/ai/provider-egress-inventory.json` environmentReferences +2 条：`MODEL_API_KEY × scripts/tokstream-s2-probe.mjs (manual-live-smoke)`·`MODEL_ENDPOINT_PROFILE × scripts/tokstream-s2-probe.mjs (manual-live-smoke)`（第二条为 prove 门硬要求：脚本源文本提及该 env 名即须申报，否则 `environment_reference_unregistered` 必红） |
| package.json | 单 script `"tokstream:s2-probe": "node scripts/tokstream-s2-probe.mjs"` |
| 收据 | `ai-docs/delivery/receipts/tokstream-s2-probe/2026-10-07/`（6 文件，见 §4） |

**零产品码亲证**：`git diff --stat apps packages` = 0 行·G7 车道零触（探针直连供应商·与 model-client 零耦合）。

## 2. 三探针结果（各恰一次·余量 2 零消耗·A=1/3 B=1/3 C=1/1）

守卫链全过：`MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing` 显式钉（ambient deepseek 缺省被拒）·Key 经授权 loader `~/.meetwise-secrets/load-model-api-key.sh` 进程 env 注入（值零落盘零回显·name-only 记账）·legacy 自由 URL 变量缺席断言过·**pre-flight 同族断言双 true**（A/B 响应 `model=qwen-plus` 与请求模型同族，A/B 结果采信）·one-shot 守卫在场（run-id 已有收据即拒，禁重跑工具化）。

### 探针 A（非流式基线）— completed
HTTP 200 · TTFB 1386ms · total 1390ms · 399 bytes · 形态=`choices[0].message.content` 单段·finish_reason=stop·usage {prompt:32, completion:43, total:75}·正文 72 字符（sha256 `97ec512b…9660`）。

### 探针 B（SSE 流式）— **B_PASS（操作定义达标）**
同 prompt 同参钉死（model=qwen-plus·max_tokens=192·temperature=0·seed=42·`stream:true`·`stream_options.include_usage:true`·**无 incremental_output**〔native 参数已按 rev3 删除〕）：
- **TTFT=274ms**（首非空 delta；首字节 273ms 为 role chunk）·total 1339ms；
- **chunk 曲线**：17 chunks（1 role 空增量 + 13 非空 delta + finish + usage + [DONE]），间隔 1–153ms（明细见 `probe-b.json` curve 与 `probe-b-sse-chunks.redacted.txt` 逐行留档）；
- **终结三联**：finish_reason=stop chunk（t=1335ms）→ 空 choices usage chunk（同毫秒）→ `data:[DONE]` ——与 rev3 援引的 compatible-mode 官方终结形态一致；
- **增量拼接**：13 段 delta 顺序 concat 逐字节还原 A 原文（72 字符·sha256 与 A 全同 `97ec512b…9660`）·usage 与 A 完全一致 {32/43/75}；
- **T0-T3 判据**：T0 归一化全等 **pass**（lengthRatio=0）·T1 前后缀锚 50 字符 **pass**·T2 长度带 **pass**（|Δ|/len=0 ≤10%）·T3 定性器 **fail（1 overlap/resend violation——经原始留档复核为启发式误报，见 §3）**；
- **B 通操作定义**（rev3 席2 钉死）：chunk≥3 ✓（17）∧ 非空 delta≥2 ✓（13）∧ [DONE] 在场 ✓ ∧〔T0 ✓ ∨（T1∧T2∧T3）〕→ **经 T0 分支达标，bPass=true**。

### 探针 C（错误形态）— errorSurface=`http_status_first`
`qwen-nonexistent-probe` 一次（禁重试已执行）：**HTTP 404 前置**（225ms·零流字节·服务端生成前即拒零计费），body=`{"error":{"type":"invalid_request_error","code":"model_not_found",...},"request_id":"0e9bd262-…"}`（redact 后全文见 `probe-c.json`）。流中 error frame 与静默断流两形态本轮未出现（404 先行）。

## 3. T3 定性器误报的如实登记（禁洗绿·阶段2 设计输入）

chunk#2 delta=`"S"`、chunk#3 delta=`"SE 是"`：词元器把 "SSE" 的双 S 拆跨 chunk，chunk#3 首 1 字符与 acc 尾字符同形，被「前缀重叠=重发」启发式命中（overlap=1·resendFull=true）。**原始留档复核判定：误报**——该 "S" 是真新内容非重发，accLen 曲线严格按 deltaLen 递增（0→1→5→8→…→72）零平方膨胀，拼接逐字节全等。本刀按 rev3 判据不修正不重跑（每探针恰一次·T3 仅 T0 失败时的 fallback 分支要件），误报事实与其机理**全数入账**：阶段2 sse-pump 的拼接校验不应采用裸前缀重叠启发式，应以「长度守恒（ΣdeltaLen=accLen）+ 归一化全等」为拼接完整性面。

## 4. 收据清单（`ai-docs/delivery/receipts/tokstream-s2-probe/2026-10-07/`）

| 文件 | sha256（盘上实测 `shasum -a 256`） | 内容 |
| --- | --- | --- |
| `run-manifest.json` | `0310a62215a3505f2eb99dcf332f7e1b49fde9391aa73b1daa0ec4907227148b` | 蓝本/run 守卫/pins/attempts 台账/verdicts/费用 |
| `probe-a.json` | `f7c784b8372e150623427dbee853659e2f105d0426f94e9fd722790e9155be3a` | A 全量 facts+形态对照 |
| `probe-b.json` | `cc24734cbda5d0ca05a8ecfdd6fc1f0ff6851775647dee22189c21c5ef9a25dc` | B facts+T0-T3+TTFT/chunk 间隔曲线 |
| `probe-b-sse-chunks.redacted.txt` | `5987aa4db7ec3a7a2647f8826b3956c85d19e00502e3bd2f368003896dca80ac` | 原始 SSE data 行逐条留档（redact 后·带 t=ms 时间戳） |
| `probe-c.json` | `b56e49824c2a921fa41f6eabeb003e87eabcbc5f666fd46f676e0f2feceab328` | C 错误面分类+redact body |
| `stitch-compare.json` | `fa05f97718d2fb3f8aaa08fca75e9bd843061f3f91d58f399e5a26bf854e3e00` | A/B 拼接对照（sha/长度/T0-T3 明细） |

交叉核验：probe-a/probe-b/probe-b-sse/probe-c/stitch 五文件 sha256 与 `run-manifest.json` receipts 表内运行时自证值逐一同符（run-manifest 自身不在其 receipts 表内·上表为盘上实测补全）。

Key 纪律：`MODEL_API_KEY` 值零落盘零回显；留档经 7 规则 redact（sha256 自证键值以 staging 保护不入 redact 面）；授权域=既有 G7P 系 meetwise-secrets loader 同源。

## 5. provider-egress prove — **base≡red 对账（预存红·非本刀引入·如实登记）**

**遇雷如实记录**：`pnpm provider-egress:prove` 在**未做本刀任何改动的工作树（=主线 base 7ad2b3e2 源码树亲证等同）上即 EXIT=1**——预存红 64 行错误清单（g7-freetier 系/nhp 系/uc052 系/godfn-1c 系/e2e-live-capability-env 等 ~40 文件的 `environment_reference_unregistered`/`adapter_consumer_unregistered`，主线历刀欠账·inventory 未随源码演进同步）。
**本刀对账**：本刀三处改动落地后错误清单 sort|uniq 逐行 diff = **空**（本刀引入的 2 个源文本 env 名提及被本刀 2 条申报精确抵消·净增零·未洗红未洗绿——预存红全数保留在案）。
**EXIT=0 验收条款裁决需求**：EXIT=0 在本刀内不可达（须主线另行清算欠账刀逐文件定性补报，超出本刀授权面），按仓库 base≡red 惯例（godfn-1d 先例）如实附协调方裁决。

## 6. 三向判读（事实如实附协调方·Ban self-approve·判读权威=协调方）

- **B 通**（操作定义达标：SSE 逐 token 产出 13 增量段·拼接逐字节全等·终结三联形态与官方文档一致·TTFT 274ms/间隔 1–153ms 曲线健康·usage 面完整）→ 按 REQUEST §2 映射：**阶段2 实施设计 REQUEST 可立**（model-client 流式通道+SSE 泵复用 sse-pump 形态+前端逐 token 渲染管线）；
- **C 错误形态** = HTTP 前置 404（`model_not_found`·零流字节·零计费）→ 阶段2 sse-pump 错误处理设计输入：非 200 状态面为本供应商+端点的一等错误路径（流中 error frame/静默断流为次要假设面）；
- **T3 误报**（§3）→ 阶段2 拼接完整性校验设计输入（长度守恒+归一化全等·弃裸前缀重叠）。
- 形态异常/降级伪流式分支本轮**未触发**（无整段一次出·无无增量形态）。

## 7. Pins（十一值照抄）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false

脚注：actualSpendCny=null（控制台读数未执行）· estimatedCostCny=0.000224（A+B 实测 usage 计价；C=0 生成前即拒）· 单探针无 usage 上界 0.000384 · 价源=console-reported via coordinator 2026-09-23（qwen-plus 0.8/2 CNY 每 1M·NOT independently verified）· key 身份=Bailian/DashScope 兼容 paid key（授权 loader 域）如实入账。

## 8. Non-claims

本刀 ≠ 阶段2 实施 ≠ model-client 改造 ≠ 用户可见流式上线（=前置核实供料）·B_PASS 为探针形态学结论·非生产链路证据·releaseEvidence=false 恒真。

## STOP

**exec:awaiting_post_prove_dual** · 已 push `origin line/tokstream-s2-probe` · Ban self-approve · 三向判读事实附协调方裁决（§5 EXIT=0 不可达裁决 + §6 B/C 判读确认）。

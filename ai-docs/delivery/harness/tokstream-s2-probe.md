# TOKSTREAM-S2 — 供应商 text 流式能力核实探针刀（阶段2 前置门）

**状态**：**`exec:awaiting_post_prove_dual`**（EXEC 完成 2026-10-07·收据 `receipts/tokstream-s2-probe/2026-10-07/2026-10-07-exec-receipt.md`+6 产物文件·脚本 `scripts/tokstream-s2-probe.mjs` sha256=`1dceb7c16b4e64c5acdee8b7cb010faa7844f9c20b2e7036dbdc5c1d0a3fd8fe`·三探针各恰一次余量 2 零消耗：A=completed〔TTFB 1386ms·usage 32/43/75〕·**B_PASS**〔TTFT 274ms·17 chunks/13 非空增量·间隔 1-153ms·stop+空choices usage+[DONE] 终结三联·拼接逐字节全等·T0 pass〕·C=`http_status_first`〔404 model_not_found 前置·零流字节零计费〕·pre-flight 同族断言双 true·**T3 定性器 1 误报如实入账**〔"S"+"SE 是" 词元拆分非重发·accLen 长度守恒零平方膨胀→阶段2 拼接校验应用长度守恒+归一化全等弃裸前缀重叠〕·**provider-egress prove 预存红如实登记**：base 树即 EXIT=1〔64 行主线欠账 unregistered〕·本刀对账 sort|uniq diff 零净增·EXIT=0 验收不可达待协调方裁决（超本刀授权面）·manifest 申报 +2 条（MODEL_API_KEY+MODEL_ENDPOINT_PROFILE×探针脚本·manual-live-smoke）·package.json 单 script `tokstream:s2-probe`·零产品码亲证 apps/packages diff=0·est cost 0.000224 CNY·脚注 actualSpendCny=null·判读=B 通⇒阶段2 设计 REQUEST 可立（事实附协调方·Ban self-approve）） · ~~`draft_rev3:awaiting_pre_exec_dual`~~（rev3 席2 三处方合并：删 incremental_output〔native 参数〕+stream_options.include_usage 必设+三元组钉死〔profile 显式 dashscope+pre-flight model 同族断言〕+T0-T3 分级判据+余量语义钉死——rev2 席1 三处方保留） · base = 主线 `7ad2b3e2` · 分支 `line/tokstream-s2-probe` · 立项依据 = 用户核心三诉求之一「大模型吐的 token 事实展现前端」——TOKSTREAM 阶段1（生成进度事件）已 nail 落地，阶段2（完整流式）前置门=供应商 text SSE 能力核实（现树事实：model-client.ts text 补全**零流式调用**·dashscope-native-config 仅 voice ASR/TTS wss 流式·text 走非流式 HTTP）。

## 1. 手段（探针脚本·零产品码·scripts/ 新增）
`scripts/tokstream-s2-probe.mjs`：直调 dashscope **compatible-mode** 端点（base=`text-endpoint-config.ts:39` dashscope-cn-beijing `dashscope.aliyuncs.com/compatible-mode/v1`·Key=MODEL_API_KEY 经授权 loader·model=qwen-plus 钉写）：**三元组钉死（rev3·席2 处方2 判定性）**——`MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing` 显式 env（主链路 ambient 缺省 profile=deepseek〔text-endpoint-config.ts:77〕·MODEL_API_KEY 若系 DeepSeek key 拨 dashscope 全 401 会把鉴权失败误登记为「供应商无流式」=虚报方向性风险）+ **pre-flight 断言响应 `model` 字段与请求模型同族**后才采信 A/B 结果·estimatedCost 随 key 身份如实（paid 上界 qwen-plus 0.8/2 CNY 每 1M〔g7-freetier-reprove-guard.ts:48〕几分钱以下一并入账）：**第二触碰面申报（席1 处方2）**——`ai-docs/architecture/ai/provider-egress-inventory.json` environmentReferences 增 `scripts/tokstream-s2-probe.mjs × MODEL_API_KEY`（class=manual-live-smoke）条目·验收加 `pnpm provider-egress:prove` EXIT=0（否则回归门必红）：
1. **探针 A（非流式基线）**：现有非流式 chat 调用一次（对照基线：时延/token 数/响应形态）；
2. **探针 B（SSE 流式）**：同 prompt `stream=true`（**rev3·席2 处方1：删 `incremental_output`——系 DashScope native 协议参数非 compatible-mode 字段**·compatible-mode 仅 `stream:true` 即天然增量 `choices[0].delta.content`·流以 finish_reason=stop chunk+空 choices usage chunk+`data:[DONE]` 终结〔官方 help.aliyun.com/zh/model-studio/stream〕）+ **`stream_options={"include_usage":true}`（否则 usage 面必空·官方明言）**——逐 chunk 采集：TTFT/chunk 间隔曲线/增量拼接/finish_reason/usage；**T3 诊断**：逐 chunk delta vs 累积快照定性器（防 concat 平方膨胀漏检）；**B 通操作定义（席2）**：chunk≥3 且非空 delta≥2+[DONE] 在场+[T0 归一化全等（trim+折叠空白）或（T1 前后缀锚 50 字符∧T2 长度带 |Δ|/len≤10%∧T3）]·A/B 钉同参（同 model+max_tokens+**temperature=0**+可选 seed）压采样漂移·禁逐字节判等；
3. **探针 C（错误形态）**：形合法不存在 id（qwen-nonexistent-probe·服务端生成前即拒零计费）一次（错误出现面=HTTP status 前 vs 流中 error frame vs 静默断流——阶段2 sse-pump 错误处理设计输入）·**余量 2 仅限 A/B transport 级瞬时故障·4xx 与 C 一律禁重试（席2 钉死语义）**。
- est live ≤5（A 1+B 1+C 1+重试余量 2·真实模型调用·authorized loader Key·name-only 记账·estimatedCost 免费额度面如实）·恰每探针一次禁重跑。

## 2. 判读（产出=阶段2 实施设计输入·非实施）
- **B 通**（SSE 逐 token 产出+拼接完整）⇒ 阶段2 实施设计 REQUEST 可立（model-client 流式通道+SSE 泵复用 sse-pump 形态+前端逐 token 渲染管线——另刀全链）；
- **B 形态异常**（无 incremental/整段一次出）⇒ 供应商能力面如实登记 ⇒ 阶段2 降级为「分段伪流式」（阶段1 事件粒度加密）评估；
- **C 错误形态** ⇒ 流式错误处理设计输入。
三向如实禁洗绿。

## 3. Ban
零产品码（apps/packages src 零改）·探针脚本仅 scripts/ 新增+package.json 单 script·Key 只经授权 loader 进程 env（name-only 记账·值零落盘零回显——log/redact 纪律沿 G7P 系）·pins 十一值逐字照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · **r1Closed=false**）+脚注 actualSpendCny=null·实现不自批·alone≠dual·**G7 车道零触**（探针不经 g7 卫兵面·直连供应商·与 model-client 零耦合）。

## 4. 验收
3 探针各恰一次全收据（原始 SSE chunk 流 redact 后留档+TTFT/间隔曲线+拼接对照）+三向判读+脚本 sha256 自证+收据 `ai-docs/delivery/receipts/tokstream-s2-probe/`·node --check 过。

## 5. Non-claims
本刀 ≠ 阶段2 实施 ≠ model-client 改造 ≠ 用户可见流式上线（=前置核实供料）·Key 使用面=authorized loader 既有授权域（MODEL_API_KEY 既有 G7P 系同源）。

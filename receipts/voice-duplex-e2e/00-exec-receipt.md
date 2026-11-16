# voice-duplex E2E 真跑回执（L10-p1 语音行收尾刀 · 2026-11-16）

- **性质**：本地真跑证据 · `releaseEvidence=false` · NOT_HA · **skip≠pass 纪律全程**。这不是生产 SLO、真机声学或共享准入证据。
- **被测**：`apps/web/e2e-ui/voice-duplex.spec.ts` 三用例（全回合 TTS→WAV 注入→真 MediaRecorder→真 `/transcribe`→真 Agent→第 2 题；非作答澄清重开；浏览器抢话中止 TTS fetch 无迟到播放）。
- **跑法**：隔离包装器 `E2E_UI_GREP='本机人机双向回合|非作答与评分操纵尾巴|本机人机双工' E2E_UI_PROJECT=chromium node scripts/run-e2e-isolated.mjs e2e:ui`（自建一次性 `meetwise-e2e-*` Postgres + api/worker/web production next start + headless chromium）。零裸跑。
- **能力钥运行时注入（零钥字面量入仓/入日志/入回执）**：`scripts/run-e2e-ui.mjs` 新增语音能力钥块——从仓根 `.env` 运行时读 `MODEL_API_KEY`（百炼一钥通用·用户 2026-11-16 授权做语音真实验证）并映射到 `DASHSCOPE_TTS_API_KEY`+`DASHSCOPE_ASR_API_KEY`（已显式设则不覆盖；`E2E_SKIP_DOTENV=1` 全跳→g6 行为门语义不变；CI 无 `.env`→钥缺→三用例仍 honest skip 臂不变）。同块按非密名单装回 `DASHSCOPE_*_MODEL`/`TTS_VOICE` 模型档（隔离壳层剥 `DASHSCOPE_*` 后模型名配置也需要运行时通道）。spec `beforeEach` 能力门断言不变（仍按两能力钥齐全才开跑）。
- **TTS 模型档**：本地 `.env`（不入仓）加 `DASHSCOPE_TTS_MODEL=qwen3-tts-flash`——探针实证本账号 `qwen-tts`/`qwen-tts-latest`/`qwen2-tts`/`cosyvoice-v1` 在产品 native `multimodal-generation` 端点均 `404 Model not exist`，`qwen3-tts-flash` 同契约 `HTTP 200`+`output.audio.url`（OSS wav）。
- **Node 运行时旗（非产品改动）**：`NODE_OPTIONS=--no-network-family-autoselection`。原因=登记产品缺陷（见下）的运行时规避：node ≥20 默认 `autoSelectFamily` 使 net 层以 `all:true` 形调 `lookup`，而 `packages/ai-runtime/src/voice.ts` 钉 IP `lookup` 回调恒按单记录形回写 → `ERR_INVALID_IP_ADDRESS` → `tts_download_transport_failed` → `/speak` 502。带旗复跑产品适配器探针：短/长文本均真合成（96,044 / 2,296,364 字节 WAV）。**修复归另刀**（回调按 `options.all` 分形返回），本刀零产品码改动。

## 三用例读数（run3 · chromium · 1 passed / 2 failed · 31.3s）

| # | 用例 | 结果 | 读数 |
| --- | --- | --- | --- |
| 3 | 本机人机双工：麦克风先接通，用户抢话中止浏览器 TTS fetch 且不播放 | **PASS**（5.2s） | 真注册→简历→额度→面试→第 1 题（spec 形制漂移修复：`第 N 题` 双命中锚定 `interview-turn`）→语音模式→同意→真 getUserMedia 替身→真 `/speak` 请求发出→VAD barge-in→`在听你说…`→`ttsPlayCalls===0`（迟到播放=0）→`说完了` 可见 |
| 1 | 本机人机双向回合：AI 播报、用户语音作答、ASR 提交并推进下一题 | **FAIL**（17.2s）·卡点=批量 ASR | 前段全真走通：真 `/speak` 200 + 真音频（`audioBase64>1000`·qwen3-tts-flash 真合成经产品 OSS 下载合同）→TTS 真播报（`ttsPlayCalls>0`）→VAD `在听你说…`→`说完了`→真 `/transcribe` 提交→**HTTP 502 `asr_failed`**（供应商账号音频输入模型全部 `403 insufficient_quota`·见探针账）→`expect(asr.ok())` 断言如实红 |
| 2 | 非作答与评分操纵尾巴会澄清并重新打开语音回合 | **FAIL**（7.0s）·卡点同上 | 同 T1 前段全真（真 `/speak` 200+真音频注入）→真 `/transcribe`→502 `asr_failed`→断言如实红（后续澄清/二次 getUserMedia 未达，非独立失败点） |

历史口径对齐：历次该 spec 为 capability skip（skip≠pass·零绿回执）；本轮首次真跑。**批量 ASR 供应商账面上不可用（免费额度耗尽·逐模型 403）是账号资源问题，不是产品码或容器/浏览器环境问题**——故「HTTP 跳真跑」降级方案同样撞同一 403（`/transcribe` 与降级 harness 同调批量 ASR 适配器），如实不采、不编绿。

## 供应商探针账（2026-11-16 · 同钥 · 零钥值落卷）

| 探针 | 结果 |
| --- | --- |
| `qwen-tts` / `qwen-tts-latest` / `qwen2-tts` / `qwen-tts-2025-07-15` / `qwen-omni-tts-latest` / `cosyvoice-v1` @ 产品 native 端点 | 404/400 `Model not exist` |
| `qwen3-tts-flash`（voice=`Cherry`）@ 产品 native 端点 | **200** + `output.audio.url`（`dashscope-result-bj.oss-cn-beijing.aliyuncs.com` wav·curl 直下载 30,764 字节 RIFF PCM 24kHz mono） |
| 产品批量 TTS 适配器（带 Node 旗）短/长文本 | **真合成** 96,044 / 2,296,364 字节 WAV |
| 音频输入 chat 模型（`qwen-audio-turbo-latest`·`qwen3.8-omni-flash`·`qwen3-asr-flash`·`qwen2.5-omni-7b`·`qwen-audio-asr`·`qwen-omni-turbo-latest`·`qwen3-omni-flash`·`qwen-audio-turbo`·`qwen2-audio-instruct`） | 全部 **403 `insufficient_quota`**（`Free allocated quota exceeded`） |
| 文本 `qwen-plus`（产品 MODEL_NAME） | 200（Agent 回合链可用） |
| WS `paraformer-realtime-v2` 协议探针（16k PCM 蜂鸣） | `task-started`→`task-finished` 闭环（流式 WS 账号侧可用·对齐 #308/#309 回执） |

## 登记的缺陷与残面（如实点名·均非本刀修复）

1. **产品缺陷（登记另刀）**：`packages/ai-runtime/src/voice.ts` UC-VOICE-02 钉 IP 下载的 `lookup` 回调不满足 node ≥20 `autoSelectFamily`（默认开）下的 `all:true` 数组回调契约 → 真实网络形态 `/speak` 恒 502。运行时规避=本回执 Node 旗；修复=回调按 `options.all` 分形（一行级）。该缺陷只可能被真网络实跑暴露——本地 fake-dep proof 全数绕过，本刀 E2E 首次咬合。
2. **供应商账号额度（归 B-G7 买云/开通）**：批量 ASR 全模型 403 quota → T1/T2 的 `/transcribe` 真绿、澄清重开链、HTTP 跳真跑均不可达；买云后以同 spec 复跑取证，spec 无需再改（能力门/断言已就位）。
3. **spec 形制漂移已修（修 spec 不修产品）**：UI 新增顶部进度徽标使 `getByText(/第 N 题/)` 双命中（strict mode violation）——新增 `turnQuestion()` 锚定 `getByTestId('interview-turn')`；能力门注释更新为「运行时注入·用户 2026-11-16 授权」实况。断言强度零减弱。
4. **运行环境残面（非产品）**：本机代理 TUN fake-ip DNS（`28.0.0.0/8`）下 curl/带旗 node 均正常出网；对钉 IP 合同无额外影响（真实公网 IP 校验仍过）。

## 门矩阵（本刀改动集亲跑）

- `pnpm g6-e2e-iso-blocked:prove` EXIT=0（能力钥块不破 Key-unset 行为门）。
- run1/run2/run3 原始日志 `.tmp/voice-duplex-e2e/run{1,2,3}.log`（gitignored·不入仓；本文件为唯一入仓回执面）。
- 台账联动：`ai-docs/delivery/production-backlog.md` P1 语音行与 `ai-docs/architecture/ai/voice-capability-boundary.md` 同步本轮实测（只勾已实证·批量 ASR 真跑/真机声学仍点名未验证）。

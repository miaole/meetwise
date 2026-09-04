---
id: architecture_bailian_nonproduction_rollout
name: 百炼非生产接入与模型操作整改清单
description: 将现有分散的模型适配器收敛为可验证的非生产百炼配置和后续统一操作治理；不记录密钥、不构成生产网关或发布证据。
type: architecture
scope: shared
level: must
status: target_with_current_boundary
owner: architecture
related:
  - ../../requirements/use-cases/model-operation-routing.md
  - ./model-operation-routing.md
  - ../../delivery/production-readiness-remediation-register.md
---

# 文本主备与百炼原生能力的非生产接入清单

## 1. 结论与边界

本清单先解决“可控地验证文本主备和百炼原生能力是否可用”，再解决“所有模型调用是否可治理”。二者不能互相替代。

- 非生产工作空间、消费上限、业务空间允许的模型和非敏感 smoke 只能证明一次特定操作当时可达；它们不证明生产容量、统一成本、统一出口、删除闭环或评分质量。
- 当前 API 与 Worker 都可从环境变量直接构造模型客户端；在 `MODEL-OP-00…03` 完成前，任何 Key 都不能称为唯一网关 Key。
- 文本主路由使用 `MODEL_*`，文本备用路由使用 `MODEL_BACKUP_*`；DashScope 原生 ASR、TTS、embedding、rerank 和流式语音只使用 `DASHSCOPE_*`。这避免把文本主路由切到 DeepSeek 时，音频或向量请求悄然携带错误 Key/模型发往文本端点。
- 当前供应商 Key 的模型权限继承其业务空间，并非 per-key 的 operation allowlist。因此“只测文本”靠的是**测试业务空间只开文本模型 + Key 只交给一次性 smoke 进程**，不能把 Key 注入 API/Worker 后再假定其它适配器不可达。
- 原生 endpoint 已收敛为版本化 Beijing profile registry：环境只能选择公开 profile 或受限 workspace id，旧 URL 环境变量、query/fragment/userinfo 形式和生产/开发 constructor override 都在 transport 前拒绝；HTTP 调用拒绝 redirect。独立 `NODE_ENV=test` proof 才能开启 fake transport override。该静态边界不等于 operation binding、共享准入或按 operation 的 secret isolation，任何包含用户内容的视觉/OCR/语音/embedding smoke 继续禁用。
- 生产 compose 已把 DashScope native Key/profile/model 从 API 移除；Worker 仍用一把 native Key 覆盖 embedding、rerank 与未来媒体适配器，这不是 operation 级 secret isolation。后续须拆分 Worker embedding/rebuild 与每项获准媒体能力的 secret/account，并在 `MODEL-OP-04` 前保持所有未绑定原生能力 fail-closed。
- Key 的明文不得出现在 Git、文档、回执、日志、聊天、浏览器 URL 或测试 fixture。控制台生成后只能进入受控的测试环境 secret 注入位置。
- 本次不为“先跑通”而开启所有模型能力。先启用固定、非敏感、低成本的最小 smoke；视觉、语音、rerank、真实评分与长期记忆另有业务前置。

## 2. 当前配置事实

| 面 | 当前代码读取的配置 | 当前边界 |
| --- | --- | --- |
| 文本默认 / 快模型（仅 Worker） | `MODEL_BASE_URL`、`MODEL_API_KEY`、`MODEL_NAME`、`MODEL_FAST_NAME` | 目标为 DeepSeek `deepseek-v4-pro` / `deepseek-v4-flash`；当启动成本策略已批准时，文本适配器将 `maxOutputTokens` 下传为供应商 `max_tokens`。未录入价格 revision、窗口和 secret 前不得外呼。 |
| 文本备用（仅 Worker） | `MODEL_BACKUP_*`、`MODEL_FAST_BACKUP_*` | 目标为 Qwen `qwen-plus` / `qwen-turbo`。仅主端点在派发前已知不可用时才可选择；主备价格策略不同的 half-open 自动切换尚未实现，不得称为完整高可用。 |
| 文本成本 | `MODEL_PRIMARY_*`、`MODEL_FAST_*`、`MODEL_BACKUP_*`、`MODEL_FAST_BACKUP_*`、`MODEL_COST_*` | 四个实际模型各需独立价格 revision、输入/输出单价和窗口；default/fast 是各自进程内 admission，不是共享总量。 |
| embedding | `DASHSCOPE_API_KEY`、`DASHSCOPE_ENDPOINT_PROFILE`、`DASHSCOPE_WORKSPACE_ID`、`DASHSCOPE_EMBED_MODEL`、`RAG_EMBED_*` | 默认 `text-embedding-v4`；endpoint 固定由 profile registry 生成，有 generation/recipe 约束，但尚未进入统一 operation binding。 |
| 视觉 OCR | `DASHSCOPE_VISION_MODEL` + 冻结 `resume.ocr.v1` typed binding（`bindResumeOcr`） | typed binding 与密封 provenance 已落地；**预览双旗**可走通 API `visionOcr`（失败不编造）。**不得**把用户图片 smoke 标成发布证据或视觉 SLO。生产/enforce 仍拒绝组合根。手动 `vl:smoke` 固定 fail-closed、不读凭据/图片、不发网。媒体预算、删除与脱敏回执仍开放。 |
| rerank | `DASHSCOPE_API_KEY`、`DASHSCOPE_RERANK_*` | 代码适配器存在，但未接入当前 QBank serving 路径；默认保持禁用。 |
| 批量 ASR/TTS | `DASHSCOPE_API_KEY`、`DASHSCOPE_ASR_MODEL`、`DASHSCOPE_TTS_*` | 适配器与本地取消合同存在，但 API 组合根和手工 live smoke 已统一 disabled；尚无 operation binding、媒体预算、attempt 或删除回执。 |
| 流式 ASR/TTS | `DASHSCOPE_STREAM_*` + 精确双旗 `VOICE_STREAM_ASR_ENABLED`/`VOICE_STREAM_ASR_PREVIEW` | 适配器存在，但生产/默认 fail-closed；双旗+Key 仍不把 live stream 接到组合根。未形成受控流会话或真实端到端证据。不得编造转写。 |

根目录存在被 Git 忽略的本地环境文件，但本清单不读取其内容，也不据此推断 Key、工作空间或模型已经配置成功。

## 3. 非生产百炼配置清单

以下项目按顺序完成；只有完成该行验收后才可勾选。任何付费开通、购买、创建 Key、修改云端 secret 或向真实模型发送请求均是外部写入，必须在操作发生前由账户持有人确认。

| ID | 状态 | 交付 | 验收与禁止事项 |
| --- | :---: | --- | --- |
| BAILIAN-00 | ◑ | 已创建并核验项目专用的非生产百炼工作空间 | 已在北京区域创建独立测试空间并关闭“授权全部及后续新增模型”；不复用默认空间，不在项目资料记录账号、空间 ID、endpoint 或 Key。 |
| BAILIAN-01 | ☐ | 在控制台核对每个候选模型的可用性、区域、按量计量单位、当前价格版本与上下文窗口 | 只把“模型 ID + 区域 + 价格 revision + 计量单位 + context window”写入受控运行时配置；不得猜测模型名、价格、窗口或把网页价格当永久常量。 |
| BAILIAN-02 | ☐ | 设置测试总预算、单日/单 run 上限和消费告警 | 预算为小额度；告警接收人可追溯。额度不足时 smoke 标为 `not_run`，不切换到未知模型或 Key。 |
| BAILIAN-03 | ☐ | 轮换并保存按用途隔离的非生产 Key | 此前出现在聊天中的任何 Key 均视为已暴露，必须先轮换。新 Key 仅进入受管 secret：Worker 文本主、Worker 文本备用、DashScope native 三类分开保存；不注入 `.env.example`、Docker 镜像、CI 输出或回执。 |
| BAILIAN-04 | ◐ | 静态 endpoint profile registry 已实施；待验证规范 endpoint、TLS 与区域 | 运行时只接受 Beijing public/workspace profile 与受限 workspace id，拒绝旧 URL 环境变量、query、片段、任意备用 URL、redirect 和 production/development override。缺 Key/超时/畸形 body 现抛结构化 `*_not_configured` / `*_timeout` / `*_malformed`（本地 `native-fail-closed:prove`），不得发明转写/向量/排序。仍须在轮换后的非生产 workspace 以最小 non-sensitive smoke 核对实际 host、TLS、区域和 Key，之后才可标已验证。 |
| BAILIAN-05 | ◐ | 历史固定文本兼容性尝试 | 既有一次性文本兼容性回执只说明当时的 direct request 成功；它不能证明 registry、endpoint allowlist、工作空间隔离、统一网关、生产容量或费用封顶。重启 smoke 前须轮换曾暴露的 Key，并完成 BAILIAN-01…04 的 endpoint/secret/预算门；禁止把用户内容或原始模型输出写入日志。 |
| BAILIAN-06 | ☐ | 对已获准的专用能力逐项做独立 smoke | 视觉、embedding、ASR、TTS、流式操作分别有自己的数据上限、取消与费用验收；未获准项保持关闭。本地原生 fail-closed 证明**不是**本项 smoke。 |
| BAILIAN-07 | ☐ | 轮换/撤销演练 | 旧 Key 失效后，运行时应 fail-closed；回执、日志和仓库中均不存在旧 Key。 |

`BAILIAN-00…07` 的完成只表示**非生产配置已验证**。它不改变 `MODEL-OP-00…04` 的实现状态，也不允许把测试 Key 放进 API/Worker 的生产环境变量。

## 4. 最小启用集合与能力矩阵

先按现有代码中已声明的模型名进行控制台核对，核对成功后再写运行时配置。表中的“当前默认值”只是代码 fallback，不是已经购买、开通或获准使用的结论。

| operation 类别 | 当前默认模型名 | 非生产首批 | 前置条件 | 失败时业务结果 |
| --- | --- | :---: | --- | --- |
| 固定文本 smoke / 普通文本 | `deepseek-v4-pro`（Qwen `qwen-plus` 为备用） | ☐ | 轮换后的主/备用 Key、模型/价格/窗口核对、`MODEL-OP-00` 和显式输出上限验证 | smoke=`not_run`；产品出题=`generation_unavailable`/`interview_unavailable`，不发明题面、不自动换 Key。 |
| 快速文本分类 / 规划草稿 | `deepseek-v4-flash`（Qwen `qwen-turbo` 为备用） | ☐ | 主/备用模型均须通过能力与价格核对；规则优先、低置信降级 | 保守默认或请求补充信息。 |
| embedding build/query | `text-embedding-v4` | ◐ | 已授权；recipe/维度/价格 revision 固定；generation 与缓存隔离测试 | 无 RAG；不混用向量空间。 |
| 视觉 OCR | `qwen-vl-max` | ◐ | typed binding 已落地；预览双旗可 invoke（非 SLO）。生产/enforce/公开只读预览仍 disabled。删除、图像页数预算、`BAILIAN-06` 合成 smoke 未做 | 失败不编造转写；无事实不落画像。 |
| rerank | `gte-rerank-v2` | ◐ | 已授权；真实 serving 路径评测 + registry；当前运行时仍保持禁用 | 使用已授权的 dense/FTS/RRF 结果。 |
| 批量 ASR | `qwen-audio-3.0-asr-flash` | ☐ | 现 API 默认 ASR 已 disabled；`qwen-audio-turbo-latest` 不能继续假定兼容文本 chat 协议。须先完成正确原生契约、音频时长、取消、费用与删除验收 | 文字输入。 |
| 批量 TTS | `qwen-tts`（候选兜底 `qwen-audio-3.0-tts-flash`） | ☐ | API 与手工 smoke 均 disabled；下载边界、并发、取消、费用与删除验收后才可逐 operation 启用 | 文字展示。 |
| 流式 ASR | `paraformer-realtime-v2`（候选 `qwen-audio-3.0-asr-flash-streaming`） | ☐ | 生产/默认 fail-closed。预览须精确双旗且非生产锁；组合根仍不接线。须有 browser→API→受控流会话、帧预算和取消回执后才可改称已验证 | 不启用语音回合，文字输入；不编造转写。 |
| 流式 TTS | `cosyvoice-v1` | ☐ | API 与手工 smoke 均 disabled；须有流会话、下载/播放取消与费用验收 | 文字展示。 |
| 评分 | 文本模型，不固定为默认/快模型 | ☐ | `SCOR-01…08`、rubric/coverage/校准/人工复核完成 | `unscored` 或 `review_required`；绝不写默认分数。 |
| 长期记忆候选摘要 | 小文本模型，不固定 | ☐ | `MEM-00…14`、来源/删除/冲突/确认门完成 | 不写任何跨会话派生物。 |

“首批”只包含固定文本 smoke；这刻意避免在 operation registry、计量和删除未闭合时扩大真实数据面。

## 5. 代码与运行时整改顺序

### 阶段 A · 先让现有调用可限制、可解释

| ID | 状态 | 必须完成的改动 | 验收 |
| --- | :---: | --- | --- |
| MODEL-OP-00 | blocked | 文本的输出上限/部分预算/价格绑定存在，但 `0085` 的更新围栏可被 direct `INSERT dispatching`、非法 terminal transition 与 identity tamper 绕过。 | 先完成完整 DB state-machine、原子 header upsert、reservation 精确 binding 与真实低权 runtime SQL 负测；此前所有 direct model expansion 停止。 |
| MODEL-OP-01 | ◐ | OCR 窄切片：`resume.ocr.v1` typed binding + 密封 provenance + 面试 fail-closed。ASR/TTS/embedding/rerank 仍 unwired。 | OCR 未登记/缺 binding/URL 媒体外呼=0；不得把本切片写成整项关闭或视觉已启用。 |
| MODEL-OP-02 | ☐ | 按账号、区域、模型/recipe、tenant/project、operation 建共享容量和费用准入。 | default/fast/API/Worker/语音/embedding 总量不因进程或 client 分裂而扩大。 |
| MODEL-OP-03 | ☐ | registry 取代手写环境路由；为每个 operation 固定输入/输出/媒体/成本/fallback/unknown 语义。 | 未登记 adapter、endpoint、selector 或 signed download 在生产启动失败；rerank 只有通过真实 serving 评测才启用。 |

### 阶段 B · 再接入业务缺口

| 优先级 | 状态 | 依赖与范围 |
| --- | :---: | --- |
| P0 | ☐ | 停止伪评分/跨候选排序，完成 `SCOR-01…08` 后才为评分配置百炼模型。 |
| P1 | ☐ | QBank ingestion metadata、岗位 route snapshot、同桶 SQL 检索和 `QuestionPlan` 先完成；只在 clean `no_eligible_in_scope` 时用 `interviewer.ask.qbank_miss` 单次生成题。 |
| P1 | ☐ | 记忆 `MEM-00…14` 完成后，才允许小模型写入 summary/fact candidate 或使用向量召回。 |
| P1 | ☐ | 真实 RRF/rerank 评测走 generation-aware 生产检索函数后，才考虑启用 rerank。 |
| P1 | ☐ | 批量/流式语音、OCR 分别在隐私删除、取消、计量与真实非敏感 smoke 通过后扩大范围。 |

### 阶段 C · 最后收敛 Key 与出口

| ID | 状态 | 条件 |
| --- | :---: | --- |
| MODEL-OP-04 | ☐ | 只有授权 snapshot、typed binding、request/result outbox、attempt/reconcile、删除/保留、流会话、运行时恢复和网络出口策略全部完成后，才建立独立模型网关并移除 API/Worker 的供应商 Key。 |

## 6. 配置契约

### 6.1 允许的非生产 secret 注入

- Worker 的 DeepSeek 主文本 Key、Worker 的 Qwen 文本备用 Key、DashScope native Key 是三份独立 secret；API 不接收前两者，migrate/Web 不接收任何模型 Key。它们不得出现在浏览器、测试 fixture、CI 输出或 shell 历史。
- `DASHSCOPE_*` 只能驱动 DashScope 原生适配器；`MODEL_*` / `MODEL_BACKUP_*` 只能驱动文本兼容接口。缺少对应变量时必须使该操作不可用，不能跨变量兜底。
- 模型名、区域、价格 revision、输入/输出或媒体上限是非密配置，但仍必须由运行时 schema 校验，不能由任意调用方覆盖。原生 endpoint 不是环境 URL：只能选择受版本控制的 `DASHSCOPE_ENDPOINT_PROFILE`，必要时填写受限 `DASHSCOPE_WORKSPACE_ID` 让 registry 构造固定 host/path。
- 备模型不是高可用的默认开关。只有 registry 明确兼容、尚未派发、同区域且同数据等级时才可选用；派发后超时/5xx/响应丢失统一为 `unknown`。
- 启动时缺少某 operation 的所有必填配置，应只禁用该 operation；不得为了“服务可启动”回退到通用模型或无边界 endpoint。文本出题缺 Key / 超时 / 畸形响应必须投影 `interview_unavailable`+provenance，禁止确定性兜底题冒充模型题。原生 ASR/TTS/embedding/rerank 缺本能力 Key、超时或畸形 body 抛 `*_not_configured` / `*_timeout` / `*_malformed`，不得发明转写、向量或排序。

### 6.2 禁止的临时做法

- 不把 Key 加入任何 `*.env.example`、源码、compose 文件默认值、截图、回执或聊天。
- 不以 browser/local smoke、单次 200、mock、供应商控制台可见模型或环境变量存在作为生产验收。
- 不直接以 `MODEL_API_KEY` 证明 OCR、语音、embedding、rerank、评分、记忆或 RAG 已统一治理。
- 不在 metadata/route、评分或删除前置缺失时用更大的模型或更多重试掩盖业务问题。

## 7. 验证和勾选纪律

每项状态只可按 `☐ 已发现 → ◐ 已实现 → ◑ 已验证 → ☑ 已关闭` 前进。一次真实百炼 smoke 至多把对应 `BAILIAN-*` 标为“已验证”；它不会自动勾选 `MODEL-OP-*`、评分、记忆或题库路由整改。

每次状态变化同步更新：本文件、`model-operation-routing.md`、`production-readiness-remediation-register.md`、`current-runtime-truth.md` 和相应面试题材料。任何新模型、价格 revision、操作或 fallback 先扩用例与七类测试，再写运行时调用。

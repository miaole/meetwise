---
id: requirements_uc_avatar_3d
name: UC-avatar · 3D 数字人面试官（输出呈现 + 语音作答输入 + 计费一致性 + 成本护栏/高并发韧性/权益门禁）
description: 第二轮对抗评审收口最终版。在上一版（输入 ASR / 计费退款 / 防剧透契约层 / 降级↔回升仲裁）基础上，补：TTS 成本/配额护栏、合成服务真高并发韧性、特性 entitlement 门禁、流式 TTS 分段校验、共享资产 SRI 完整性、表情不编码分数、PII 结构性保证、性能/真机测试层与设备矩阵、ADR。按 Meetwise 承重标准（四原语/状态机/RLS/双校验/三账本/安全护栏）重写。
type: spec
scope: shared
level: spec
status: active
owner: product
related:
  - ../use-case-conventions.md
  - ./interview-modality.md
  - ./cend-mock-interview.md
  - ./commerce.md
  - ../../rules/global/production-invariants.md
  - ../../rules/global/status-machine.md
  - ../../rules/ai/structured-output-and-safety.md
  - ../../testing/strategy/test-strategy.md
---

# UC-avatar · 3D 数字人面试官

> **🔎 实现状态（对齐真实代码 · 2026-07）** — 本文是 TARGET 规格。**⬜ 3D 数字人渲染（口型/表情/LOD/WebGL）未建**（代码库无 avatar/数字人/3D 渲染实现）。**✅ 已实现+接线的仅“语音官”底座**：TTS（DashScope qwen-tts）+ ASR（qwen-audio）+ 语音限频，SSE 业务事件驱动的面试形态可跑（见 interview-modality/cend-mock-interview）。本文承重叙事本就是 `3D→纯语音→纯文本` 逃逸阶梯，其中**纯语音/纯文本两级已具备，3D 增强级（P1）为规划**；文内 TTS 成本护栏/流式分段校验/共享资产 SRI 等细化机制多为规格。

> 战略定位（评审五·战略错配收口）：本模块**主线是「语音官」= TTS + 字幕 + SSE 业务事件对齐 + 逃逸阶梯**，保证 demo 黄金路径在弱网/无 WebGL/低端机/现场都端到端可跑、无死路。**3D 渲染（口型/表情/LOD/漂移）显式降为可选增强（P1），是 UI 体验自愈，不是安全面、不是承重叙事**。承重叙事 = `3D → 纯语音 → 纯文本` 逃逸阶梯（韧性）+ ASR 输入业务一致性 + TTS/ASR 钱路径一致性 + 合成服务高并发韧性 + 特性权益门禁。
> 收口原则：每条异常/刁钻必须落到一个**状态机迁移**或一个**四原语**；无真实安全边界的本地态不冒充攻击面（删伪刁钻，禁「原语剧场」——不给共享资产贴 RLS、不给单向 SSE 贴签名）。

---

## 0. 共享规范（状态机 · 契约 · 三账本 · 四原语命中口径 · TTS 模式 · 权益口径）

### 0.1 状态机（显式 enum + CAS 迁移 + 服务端再校验 + 审计；摒弃布尔汤/内存 Map）

**A. `AvatarRenderProfile`（呈现档位枚举，UI-only 体验态，不入业务库）**
`HIGH_3D → LOW_3D → VOICE → TEXT`（**单调降级**方向）。
- 服务端 `/avatar/capability-profile` 给**权威建议档**与**entitlement 上限**（`entitledMaxProfile`，由业务服务判权益，UC-021）。最终档 = `min(建议档, entitledMaxProfile, 用户偏好保守者)`。
- 档位未决时用**默认安全档**（无 WebGL 历史/低端 → `VOICE`，否则 `LOW_3D`），档位返回后经 CAS 修正（UC-001）。
- 回升只能由**用户显式**触发（UC-007），受冷却窗口约束；自动守护**只向下**（UC-005）。**回升禁用是会话级体验态（不持久、不跨会话、不写设备指纹）**（评审二·UC-007 黑名单矛盾收口）。

**B. `AvatarPlaybackState`（呈现播放态，单设备单会话运行时态；不拥有业务事实）**
枚举与**全部迁移边（可枚举、可审计）**：

| from | to | 触发源 | 备注 |
|---|---|---|---|
| `IDLE` | `PRELOADING` | 进入面试/收到 question_ready | — |
| `PRELOADING` | `SYNTHESIZING` | 资产就绪、请求 TTS | — |
| `PRELOADING` | `ERROR` | 资产/音色加载失败/SRI 校验失败 | → 逃逸阶梯 |
| `SYNTHESIZING` | `SPEAKING` | 首音帧到达、音频时钟启动 | — |
| `SYNTHESIZING` | `QUEUED` | 合成服务过载/背压（UC-020） | 排队中，超时→ERROR |
| `QUEUED` | `SYNTHESIZING`/`ERROR` | 出队/排队超时 | 超时→文本兜底 |
| `SYNTHESIZING` | `ERROR` | TTS 失败/超时/熔断打开 | → 逃逸（UC-008/020） |
| `SPEAKING` | `WAITING_USER` | 朗读结束、置已朗读标记（呈现态） | 等待作答 |
| `SPEAKING` | `PAUSED` | 用户暂停/页面隐藏/AudioContext 挂起/静音不计此态 | 可恢复 |
| `PAUSED` | `SPEAKING` | 用户恢复/页面可见、时钟重锚 | — |
| `SPEAKING`/`PRELOADING`/`SYNTHESIZING`/`QUEUED` | `DEGRADING` | 性能守护（UC-005）/用户调档（UC-007）/预算耗尽（UC-019）/熔断（UC-020） | 过渡态 |
| `DEGRADING` | `SPEAKING`（低档）/`WAITING_USER` | 降级完成、按已朗读标记决定是否重读 | — |
| `ERROR` | `DEGRADING` | 逃逸阶梯下一级 | 不可阻塞业务 |
| `WAITING_USER` | `IDLE` | 进入下一题 | — |
| 任意 | `REPORT_PENDING` | 收到 report_pending（UC-014） | 等待报告呈现态 |
| `REPORT_PENDING` | `ENDED` | report_ready/超时兜底 | 终态 |
| 任意 | `ENDED` | report_ready/会话终止/kill-switch | **终态** |

> 约束：`AvatarPlaybackState` 是**呈现态**，跨设备恢复（UC-010）由 `GET /interview/{resultId}/snapshot` 的业务权威快照重建，呈现态本身不写业务库。

**C. `AsrTranscript`（语音作答转写态，输入侧；模型调用产物）**
`RECORDING → TRANSCRIBING → {LOW_CONFIDENCE_REVIEW | READY} → {CONFIRMED → SUBMITTED | DISCARDED} | FAILED`。
`CONFIRMED→SUBMITTED` 把转写文本喂入既有 `UC-INT-submit-answer`（双校验、ConsumptionRecord）。瞬时音频不持久（UC-013）。

**D. `AiCostReservation`（TTS/ASR 模型成本预留，reserve→confirm→release saga）**
`reserved → {confirmed | released}`。失败/超时/预算耗尽/熔断 → `released`（不计费/退还）。

**E. `AvatarTtsBudget`（每会话/每用户 TTS 字符预算计数，UC-019）**
`{sessionCharsUsed, userDailyCharsUsed}` 与上限 `sessionCharCap / userDailyCharCap`（按 tier）。`withinBudget → softWarn(≥80%) → exhausted`。`exhausted` 后新题不再合成，强制降 `TEXT` 呈现（题面字幕仍可读，作答不受影响）。

### 0.2 契约（contract-first day-one；要么有契约、要么明确无契约，去掉「或纯前端」hedge）

| endpoint | 方法 | 请求(Zod 要点) | 响应(Zod 要点) | 说明 |
|---|---|---|---|---|
| `/avatar/capability-profile` | POST | `{webgl:enum(none\|v1\|v2), deviceTier:enum, maxTextureSize:int, prefersReducedMotion:bool, autoplayAllowed:bool, locale, measuredFps:number?}` | `{profile:AvatarRenderProfile, entitledMaxProfile:AvatarRenderProfile, profileVersion:string, ttlSec:int, reason:enum}` | 服务端给权威建议档 + **entitlement 上限**（UC-021）；measuredFps 仅体验自愈二次校正 |
| `/me/preferences` | PATCH | `{avatarRenderPreference:AvatarRenderProfile\|null, captionsAlways:bool, reducedMotion:bool, muted:bool, volume:0..1, locale:enum(zh\|en)}` | 同步后偏好 | 用户显式偏好；写业务库 |
| `/interview/{resultId}/snapshot` | GET | path resultId | `{resultId, status, currentQuestionId, spokenQuestionIds:string[], renderProfileHint, locale, presentationState}` **报告就绪前不含 score/rubric** | 跨设备/多标签恢复业务权威源 |
| `/avatar/metrics` | POST | `{resultId, samples:[{ts,fps,firstAudioMs,...}], nonce, sig}` 限流+签名 | `{accepted:int, dropped:int}` | RUM 上报，服务端异常值丢弃（UC-016） |
| `/interview/{resultId}/answer:transcribe` | POST | `{audioRef\|stream, idempotencyKey, locale}` | `{transcriptId, text, confidence:0..1, status:AsrTranscript}` | ASR 模型调用，落 trace+成本预留（UC-017） |
| `/interview/{resultId}/answer` | POST | `{transcriptId?\|text, idempotencyKey}` | 既有提交契约 | ASR/文本作答**业务等价**入口 |
| `/interview/{resultId}/events` | SSE | Last-Event-ID | 业务事件流（见 0.4） | 契约层裁剪敏感字段 |

> **共享静态资产（3D 模型/贴图/viseme 表）不走 RLS**（评审二·UC-002 RLS 错配收口）：它们是**按 tier 的共享只读资源**，不是按用户私有数据，防的是**篡改不是越权**。完整性走 **SRI/内容哈希校验**（`assetVersion` + `integrityHash`），渲染前比对不一致即拒渲并重取（UC-009）。私有的是用户**业务数据**（snapshot/metrics/transcribe），那些才走 RLS。

### 0.3 三账本（不可丢）
- **事件账本** `interview_event`：SSE 业务事件，单调 `seq`；断线 `Last-Event-ID` 重放。
- **成本账本** `ai_invocation_traces`：每次 TTS/ASR 模型调用的成本/模型版本/prompt 版本；脱敏（不存全文音频/全文答案）。
- **审计账本**：业务状态迁移服务端审计；呈现态遥测落 `avatar_client_metrics`（与业务审计分离）。
- 权益与成本：`consumption_record`（reserved→confirmed→released/refunded）；`ai_cost_reservation`；`avatar_tts_budget`（字符预算计数）。

### 0.4 SSE 业务事件契约（发业务事件而非 model token；报告就绪前裁剪 score）
`progress · question_ready(含 audioRef/visemeTrackRef/assetVersion/integrityHash/ttsMode) · waiting_user · answer_received · answer_evaluated(报告前不下发 score/rubric，仅"已评估"信号) · report_pending · report_ready · degraded(profile 变更+reason) · budget_warn · queued(合成排队) · error`。
**防剧透三道**：① 契约层 `answer_evaluated`（report 前）载荷不含 score/rubric；② 呈现层 aria-live 白名单（UC-012）；③ **数字人表情/动画决策输入不含分数**——表情由"题目阶段/中性礼貌策略"驱动，**各分数桶下表情指令字节级相同**（UC-003 AC，评审三·UC-006 病态命题收口为可测代码级断言）。

### 0.5 计费口径与字符预算（钱路径一致性）
- 面试**权益** `ConsumptionRecord` 已在 `UC-INT` 占用一次；avatar 的 TTS/ASR **默认不二次扣用户权益**（bundled）。
- 每次 TTS/ASR **模型成本**独立走 `AiCostReservation` reserve→confirm/release + `ai_invocation_traces`：首次合成/转写计成本，失败 release（不计费），重听/重播命中缓存不再计成本（UC-015/018）。
- **成本炸弹防护（评审四·TTS 成本炸弹收口）**：幂等只挡重复请求，**挡不住大量合法不同长问题**。因此独立设 `AvatarTtsBudget` 每会话/每用户字符预算上限（按 tier），**超额降文本**而非继续计费合成（UC-019）。
- 幂等：TTS 以 `(questionId, assetVersion, locale)` 内容哈希去重；ASR 以 `idempotencyKey` 去重。

### 0.6 TTS 合成模式与分段校验（解决流式 ↔ 完整 timeline 校验矛盾，评审四·必补 4）
TTS 有两种模式，`question_ready.ttsMode ∈ {SINGLE_ASSET, STREAMING}`，**校验口径按模式分流，不再用单一全局校验制造矛盾**：
- **`SINGLE_ASSET`（默认，短题）**：整段一次合成，`question_ready` 携带完整 `visemeTimeline + audioDuration`。校验：`|audioDuration − visemeTimelineEnd| ≤ ε` 且 `visemeTotalMs ∈ [chars×minMsPerChar, chars×maxMsPerChar]`（UC-002）。
- **`STREAMING`（长题/低首音延迟）**：分段合成，每段 `{segIndex, segDuration, segVisemeSubtrack}` 独立到达。**不做整段时长校验**（整段未知），改**逐段校验**：每段 `|segDuration − segVisemeSubtrackEnd| ≤ ε`、段间累计漂移以音频主时钟为准重锚（UC-004）；`audioDuration≈timelineEnd` 整段断言**仅在 SINGLE_ASSET 适用**，STREAMING 用「逐段 + 累计漂移上界」替代。

### 0.7 entitlement 口径（特性权益门禁，UC-021）
- 判权益**只在业务服务**（avatar 模块不自判）。`capability-profile` 返回 `entitledMaxProfile`。
- 默认策略：**免费档 = 文本官（TEXT，无 TTS/3D）；付费档 = 语音官（VOICE+TTS）/3D**。具体 tier→特性映射由 `commerce.md` 权威，本模块引用 `entitledMaxProfile` 不重述定价。
- entitlement 是**业务门**（越过即拒），与 `AvatarRenderProfile` 体验自愈降级正交：自愈只能在 entitlement 上限**之内**向下走。

### 0.8 七类覆盖口径（每条 UC 七行齐全，缺失即不合格）
正常 · 异常(失败回滚/退款) · 特殊(边界/空/首次/i18n) · 逃逸通道(降级/fallback/kill-switch/人工接管/安全终止) · 高并发(双击/并发/竞态CAS/服务端负载) · 复杂(多步saga/跨聚合/部分失败) · 刁钻(注入/越狱/刷分/泄题/PII/畸形/对抗)。**每条异常/刁钻必须落到一个状态机迁移或一个四原语。** 伪刁钻一律删除或改为真有边界项。

---

## UC-avatar-001 · 能力探测与渲染档位决策（默认安全档先行 + entitlement 上限 + 后置 CAS 修正）

- **角色**：求职者 / 系统
- **前置**：用户进入面试页；尚未确定渲染档位。
- **触发**：页面初始化，采集 WebGL/设备/autoplay 能力。

### 主流程 Main
1. 客户端**立即套用默认安全档**（无 WebGL/低端 → `VOICE`；否则 `LOW_3D`），渲染不阻塞首问。
2. 并行 `POST /avatar/capability-profile`，服务端返回权威建议档 `profile`、`entitledMaxProfile`、`profileVersion`。
3. 响应到达后 CAS 修正：最终档 `= min(profile, entitledMaxProfile, 用户偏好保守者)`，`WHERE localProfileVersion < serverProfileVersion`（陈旧响应落败丢弃）。
4. 渲染窗口内实测 `measuredFps`，持续低于阈值回报 → 服务端可**仅向下**下调（体验自愈，非安全校验）。
5. 预加载该档资产（带 `assetVersion + integrityHash`，UC-009）。

### 备选流 Alternate
- A1：用户已有 `avatarRenderPreference` → 与建议档取**更保守者**，且不超 `entitledMaxProfile`。

### 异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | capability-profile 失败/超时 | 默认安全档兜底，不阻塞 | 维持默认档，记 `avatar_client_metrics` |
| E2 | 档位未决 ⇄ `question_ready` 首问已到达（真竞态） | 默认安全档先呈现首问，档位后置 CAS 修正 | 首问按安全档呈现，到达后平滑切换 |
| E3 | 陈旧/乱序档位响应覆盖新档 | `profileVersion` 单调 CAS | 旧响应 0 行落败丢弃 |
| E4 | 建议档 > entitledMaxProfile（免费用户探到高端机） | 取 entitledMaxProfile 上限 | 不越权益给 3D |

### 后置 Postcondition
`AvatarRenderProfile` 落定（UI 态，受 entitlement 上限约束）；`avatar_client_metrics` 记探测样本。无业务库写。

### 验收标准 Acceptance（可测）
- 无 WebGL/低端 → 首屏默认 `VOICE`，**首问呈现不被档位决策阻塞**（首问到达即可见/可听，档位未决也成立）。
- 档位**初判** ≤300ms（基于上报能力，非 FPS）；**FPS 二次校正**是独立后置事件（≥1 渲染窗口），两步分别绑测（消除验收↔TC 断裂）。
- 乱序档位响应 → 仅最高 `profileVersion` 生效。
- 免费用户高端机 → 最终档不超 `entitledMaxProfile`（断言不给 3D）。

### 关联
契约：`POST /avatar/capability-profile`。状态机：AvatarRenderProfile。原语：CAS（档位单调修正）。安全：渲染档位 UI-only、非安全面；entitlement 上限由业务服务判（UC-021）。

### 七类覆盖
- 正常：默认安全档→建议档（受上限）→渲染。
- 异常：profile 失败→默认档兜底，不阻塞（E1）。
- 特殊：首次无偏好/无 WebGL 历史 → VOICE 默认。
- 逃逸：探测全失败 → 直接 TEXT 仍可作答。
- 高并发：多次重复探测/乱序响应 → 单调 CAS 去重（E3）。
- 复杂：档位未决 ⇄ 首问到达竞态，默认档先行 + 后置修正（E2）。
- 刁钻：伪造 deviceMemory/FPS 骗高档 → 只会触发自身 FPS 自愈降级（无安全边界，仅体验自愈，不冒充对抗面）；真对抗面让位 UC-016（RUM 刷量需签名+限流）。

### 测试用例
| TC | flow | 测试层 | 断言 |
|---|---|---|---|
| TC-001-main | 正常 | e2e | 低端 UA → 首屏 VOICE，建议档到达后切 LOW_3D |
| TC-001-E2 | 竞态 | e2e | mock 首问先于 capability 响应 → 首问立即呈现，档位后切，无白屏/阻塞 |
| TC-001-E3 | CAS | 单元 | v1 晚于 v2 到达 → 最终档=v2，v1 丢弃 |
| TC-001-E4 | 权益上限 | 集成 | 免费用户 + 高端机 → 最终档 ≤ entitledMaxProfile，不给 3D |
| TC-001-ac-init | 验收 | 集成/perf | capability-profile ≤300ms 出**初判**；FPS 校正为独立后置事件 |

---

## UC-avatar-002 · 问题语音合成与口型/首音延迟（分模式双校验）

- **角色**：系统 / AI 图 / 求职者
- **前置**：`question_ready` 已就绪，含 `audioRef/visemeTrackRef/assetVersion/integrityHash/ttsMode`。
- **触发**：到达当前题，需合成并朗读。

### 主流程 Main
1. 收 `question_ready`，按档位决定呈现：3D（口型+表情+音频）/ VOICE（音频+字幕）/ TEXT（仅字幕）。
2. 请求 TTS（命中缓存则跳过合成，UC-015；先过预算门 UC-019）；成本走 `AiCostReservation.reserved`。
3. **模型输出双校验（按 ttsMode 分流，0.6）**：① schema 校验 viseme 结构；② 业务校验——`SINGLE_ASSET` 校 `visemeTotalMs ∈ [下界,上界]` 且 `|audioDuration−timelineEnd|≤ε`；`STREAMING` 逐段校 `|segDuration−segEnd|≤ε`。超界即判畸形→兜底字幕/纯语音。
4. 首音帧到达 → `SYNTHESIZING→SPEAKING`，音频时钟启动，viseme 按音频时钟驱动（UC-004）。
5. 朗读完成 → `SPEAKING→WAITING_USER`，置已朗读呈现标记（UC-010）；`AiCostReservation.confirmed` + `ai_invocation_traces` + `avatar_tts_budget` 累加字符。

### 备选流 Alternate
- A1：autoplay 被拦 → 显示"点击播放"，不阻塞文本可读。

### 异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | TTS 失败/超时 | 成本 `released`；`SYNTHESIZING→ERROR→DEGRADING` | 逃逸纯文本（UC-008） |
| E2 | viseme 与文本量级不匹配（畸形/撑爆主线程） | 业务校验阈值前置拦截（双校验②） | 丢弃 viseme，退字幕/纯语音 |
| E3 | 重复 question_ready（重连重发） | TTS 内容哈希幂等 | 不重复合成、不重复计成本 |
| E4 | STREAMING 段缺失/乱序 | 段 seq 单调 + 段缺失超时 → 该题退字幕 | 不用错位段驱动口型 |

### 后置 Postcondition
`AvatarPlaybackState∈{SPEAKING,WAITING_USER}`；`ai_cost_reservation(confirmed)`、`ai_invocation_traces`、`avatar_tts_budget` 累加；已朗读标记置位。

### 验收标准 Acceptance（可测）
- **viseme 量级阈值（可判定）**：`SINGLE_ASSET` 断言 `visemeTotalMs∈[下界,上界]` 且 `|audioDuration−timelineEnd|≤ε`；`STREAMING` 断言逐段 `|segDuration−segEnd|≤ε`，越界走兜底分支。
- **首音延迟 AC 不用 fake 模型证明**：3D≤800ms / 语音≤500ms 绑 **ai-eval/perf 真机层**（见末「性能/真机测试层」）；该层不可用时**显式降为非门禁 SLO（仅 RUM 观测）**，不得用 graph-fake-model 冒充延迟验收。
- 重复 question_ready → 恰一次合成、一次成本记录。

### 关联
契约：SSE `question_ready`、TTS 取数。状态机：AvatarPlaybackState、AiCostReservation、AvatarTtsBudget。原语：幂等（TTS 内容哈希）、事件日志。安全：模型输出双校验（schema+业务阈值）、AI 合成语音可标识（UC-013）、表情不编码分数（0.4 防剧透三）。

### 七类覆盖
- 正常：合成→双校验→朗读→已读。
- 异常：TTS 失败→成本 released→逃逸（E1，绑 UC-008/018 退费）。
- 特殊：autoplay 被拦（A1）/极短文本（首题问候）边界量级 / STREAMING 长题。
- 逃逸：合成不可用→纯文本仍可读题作答。
- 高并发：重复 question_ready 幂等（E3）。
- 复杂：合成 saga + 成本预留 + 双校验 + 时钟启动跨步部分失败回滚；STREAMING 多段乱序（E4）。
- 刁钻：畸形超长 viseme 撑爆主线程→业务阈值前置拦截（E2）；文本含控制字符/超长→字幕转义、不执行。

### 测试用例
| TC | flow | 测试层 | 断言 |
|---|---|---|---|
| TC-002-main | 正常 | graph-fake-model | 合成→viseme 校验通过→SPEAKING→WAITING_USER，置已读标记 |
| TC-002-E2-low | 量级下界 | 单元 | visemeTotalMs < 下界 → 判畸形→走兜底 |
| TC-002-E2-high | 量级上界 | 单元 | visemeTotalMs > 上界 → 判畸形→走兜底 |
| TC-002-stream | 分段校验 | 单元 | STREAMING 逐段 `|segDuration−segEnd|≤ε`；不对整段做未知 timeline 校验 |
| TC-002-E3 | 幂等 | 集成 | 同 (questionId,assetVersion,locale) 二次请求 → 0 次重复合成 |
| TC-002-latency | 性能/ai-eval | ai-eval/perf | 真实 TTS 路径首音延迟分布达标；**fake-model 不参与该断言** |

---

## UC-avatar-003 · SSE 业务事件对齐与防剧透（契约层裁剪 + 表情不编码分数）

- **角色**：系统 / 求职者
- **前置**：面试进行中，SSE 已连接。
- **触发**：服务端推进业务事件。

### 主流程 Main
1. 客户端以服务端 `seq` 为权威推进呈现，本地不臆造业务状态。
2. **防剧透第一道（契约层）**：`answer_evaluated`（report 前）不含 score/rubric，仅"已评估"信号。
3. **防剧透第三道（表情层，评审三·UC-006 收口）**：数字人表情/动画决策**输入不含分数**——表情由题目阶段/中性礼貌策略驱动；**断言各分数桶下表情指令字节级相同**（不是统计零相关的病态命题，而是代码级输入排除断言）。
4. 呈现层第二道：aria-live 白名单只朗读非敏感字段（UC-012）。
5. 断线 → `Last-Event-ID` 重放，不丢不重。

### 异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 断线重连 | 事件账本 + `Last-Event-ID` 重放 | 从断点续推，seq 单调 |
| E2 | 抓包试图读分数 | 契约层不下发敏感字段 | 客户端根本拿不到分数 |
| E3 | 多标签/多连接 seq 来自不同会话 | 单活仲裁（并入 UC-010） | 仅一个活动会话推进 |
| E4 | 试图从表情/动画反推分数 | 表情决策输入不含分数（字节级相同） | 无信息泄露 |

### 后置 Postcondition
呈现与服务端 `seq` 一致；`interview_event` 为唯一权威。

### 验收标准 Acceptance（可测）
- 抓包 `answer_evaluated`（report 前）→ **不含 score/rubric 字段**（契约层断言）。
- `Last-Event-ID=N` → 仅重放 seq>N。
- 报告就绪后 → score 才下发。
- **表情指令在高分/低分/中分桶下字节级相同**（代码级断言，输入向量不含 score），替换 1000 样本统计剧场。

### 关联
契约：SSE 事件契约（字段裁剪）。状态机：Interview。原语：事件日志（单调 seq）、RLS（事件归属）。安全：防剧透三道（契约层裁剪 + aria 白名单 + 表情不编码分数）。

### 七类覆盖
- 正常：事件按 seq 推进。
- 异常：断线重连重放（E1）。
- 特殊：report 前/后分数可见性切换边界。
- 逃逸：SSE 全断 → 轮询 snapshot 兜底恢复。
- 高并发：多标签多连接 seq 单活仲裁（E3→UC-010）。
- 复杂：跨题事件序 + 重连重放 + 字段裁剪组合。
- 刁钻：删"伪造/重放高 seq SSE 跳题"（SSE 单向、客户端注入只害自身呈现、不动账本——"服务端签名 SSE"是威胁模型错位的过度设计，删除，评审二·UC-004 收口）；真边界改为报告前抓包读分数（E2，契约层拦截）+ 表情反推分数（E4，字节级相同）。

### 测试用例
| TC | flow | 测试层 | 断言 |
|---|---|---|---|
| TC-003-redact | 防剧透 | 契约 | answer_evaluated（report 前）schema 中无 score/rubric |
| TC-003-E1 | 重放 | 集成 | Last-Event-ID=N → 仅 seq>N 重放 |
| TC-003-reveal | 时序 | 集成 | report_ready 后 score 才出现在事件载荷 |
| TC-003-expr | 表情不编码分数 | 单元 | 注入高/中/低分 → 表情决策输入向量不含 score 且输出指令字节级相同 |

---

## UC-avatar-004 · 口型/表情插值与音频时钟权威（客观指标 + 长会话漂移）

- **角色**：系统
- **前置**：`SPEAKING`，音频时钟运行。
- **触发**：每帧渲染 viseme/表情。

### 主流程 Main
1. **音频时钟为唯一时间权威**；viseme/表情按音频 `currentTime` 采样，渲染落后/超前则重锚。
2. 帧间口型位移做插值/淡入，避免跳变。
3. 页面隐藏/可见、AudioContext 挂起→恢复时重锚并淡入。
4. STREAMING 模式：段间以音频主时钟累计对齐，段界不硬切。

### 异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 渲染卡顿致音画漂移 | 以音频时钟重锚（音频不暂停等渲染） | 口型回锚，音频连续 |
| E2 | AudioContext 被系统挂起 | 检测 suspended → `SPEAKING→PAUSED`，恢复时重锚 | 恢复后淡入续播 |
| E3 | 系统级 seek/倍速污染音频时钟 | 校验 playbackRate/currentTime 单调性，异常按真实时钟重锚、丢污染采样 | 不被外部 seek 带飞 |

### 后置 Postcondition
`AvatarPlaybackState` 维持/经 PAUSED 恢复；漂移指标落 `avatar_client_metrics`。

### 验收标准 Acceptance（客观指标，非肉眼"鬼畜"）
- 帧间口型位移 ≤ `maxVisemeDeltaPerFrame`。
- 重锚插值时长 ≥ `minReanchorMs`，回锚帧数 ≤ `maxReanchorFrames`。
- AudioContext suspended→resumed → 重锚后无 ≥1 帧硬跳变（按位移阈值判定）。
- **长会话漂移（真机层，承接旧 5min 漂移 AC，评审三·验收↔TC 断裂收口）**：5min 连续会话累计音画漂移 ≤ `maxDriftMs`，绑「性能/真机测试层」**专属 TC**（非取数自证）。

### 关联
状态机：AvatarPlaybackState（SPEAKING↔PAUSED）。原语：事件日志（漂移遥测）。安全：外部时钟污染防护。

### 七类覆盖
- 正常：时钟驱动口型同步。
- 异常：卡顿漂移→重锚（E1）。
- 特殊：极短/极长音频边界、首帧淡入、STREAMING 段界。
- 逃逸：渲染崩溃→退纯语音（口型不可用不影响听题）。
- 高并发：连续可见性切换抖动→去抖重锚。
- 复杂：多次 pause/resume + 漂移叠加 + 长会话累计漂移。
- 刁钻：系统级 seek/倍速/AudioContext 挂起污染时钟（E2/E3），按真实时钟重锚、丢污染采样。

### 测试用例
| TC | flow | 测试层 | 断言 |
|---|---|---|---|
| TC-004-delta | 客观指标 | 单元 | 注入帧序列 → 帧间位移均 ≤ 阈值，重锚插值 ≥ minReanchorMs |
| TC-004-E2 | 挂起恢复 | 单元 | AudioContext suspended→resumed → PAUSED→SPEAKING 且重锚无硬跳变 |
| TC-004-E3 | 时钟污染 | 单元 | 注入非单调 currentTime/2x rate → 丢污染采样、按真实时钟重锚 |
| TC-004-drift5m | 长会话漂移 | perf/真机 | 5min 真音频会话 → 累计漂移 ≤ maxDriftMs（真机层，非 mock 取数） |

---

## UC-avatar-005 · 性能守护自动降级（单调 + 005×007 仲裁，会话级回升禁用）

- **角色**：系统
- **前置**：`HIGH_3D`/`LOW_3D` 渲染中。
- **触发**：持续低 FPS / 长任务 / 内存压力超阈值。

### 主流程 Main
1. 性能守护采样 FPS/长任务；持续超阈 → `DEGRADING`，沿 `HIGH_3D→LOW_3D→VOICE→TEXT` **下调一级**。
2. 降级**单调**：自动守护**只向下**，不自动回升。
3. 记首帧时延、降级原因、降级前后档位到 `avatar_client_metrics`；SSE 发 `degraded`。

### 异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 降级抖动（刚降又测偶发高 FPS） | 滞回 + 冷却窗口，单调不自动回升 | 不抖动 |
| E2 | 已在 TEXT 仍超阈 | 终态，无更低档 | 维持 TEXT，作答不受影响 |
| E3 | 用户已显式上调（UC-007）后守护又想降 | 进入 005×007 仲裁 | 守护被冷却豁免约束 |

### 005×007 降级↔回升语义仲裁（P0 承重，消除抖动死循环）
- 用户**显式上调**后，守护对该档进入**冷却豁免窗口** `cooldownMs`：窗口内不自动降级。
- 窗口内仍持续超阈 → 降级**一次**并**累加自愈失败计数**。
- **连续 N 次**（如 N=2）"上调→被迫降级"循环后：**禁用该档回升项**并解释"当前设备无法稳定运行更高画质，已锁定到 X 档"——终止条件。
- **回升禁用是会话级体验态**：仅本会话内存，**不持久、不写设备指纹、不跨会话**（评审二·黑名单跨会话矛盾收口）；新会话重新给用户上调机会。
- CAS 只解决并发覆盖；语义谁赢由"冷却豁免 + 失败计数 + 会话级回升禁用"三件套决定。

### 后置 Postcondition
`AvatarRenderProfile` 下调；`avatar_client_metrics`（含首帧时延、降级原因、自愈失败计数）；回升禁用态仅会话内存。

### 验收标准 Acceptance（可测）
- 持续低 FPS（注入）→ 恰下调一级，单调不回升。
- **降级后首帧 ≤ `degradeFirstFrameMs`（AC 门禁，非仅 RUM 字段）**。
- 连续 N 次上调↔降级 → 回升项被禁用且给出解释文案（可断言 DOM/事件）。
- 回升禁用态不持久：新会话重新可上调（断言无跨会话设备指纹）。

### 关联
状态机：AvatarRenderProfile（单调）、AvatarPlaybackState（DEGRADING）。原语：CAS（档位写）、事件日志（degraded）。

### 七类覆盖
- 正常：低 FPS→降一级。
- 异常：抖动→滞回冷却（E1）。
- 特殊：已 TEXT 终态（E2）。
- 逃逸：守护本身即逃逸阶梯执行器。
- 高并发：守护与用户调档并发→CAS + 冷却豁免仲裁（E3）。
- 复杂：上调↔降级多轮 saga + 失败计数 + 会话级回升禁用终止。
- 刁钻：脚本高频"高 FPS 假信号"诱导回升→守护不自动回升、回升仅用户显式且受冷却，假信号无效。

### 测试用例
| TC | flow | 测试层 | 断言 |
|---|---|---|---|
| TC-005-main | 正常 | 单元 | 注入持续低 FPS → 档位 -1 级、单调 |
| TC-005-firstframe | 门禁 | 集成 | 降级后首帧 ≤ degradeFirstFrameMs |
| TC-005x007 | 仲裁 | 集成 | N 次上调→降级 → 回升项 disabled + 解释文案；新会话恢复可上调（无持久指纹） |
| TC-005-E1 | 抖动 | 单元 | 偶发高 FPS 不触发回升 |

---

## UC-avatar-006 · 无 WebGL / 渲染初始化失败的降级阶梯

- **角色**：系统 / 求职者
- **前置**：设备不支持 WebGL，或 3D 引擎初始化失败。
- **触发**：进入面试且 3D 不可用。

### 主流程 Main
1. 检测无 WebGL/初始化异常 → 直接落 `VOICE`（音频+字幕）。
2. 音频亦不可用 → 落 `TEXT`（纯文本读题作答）。
3. 全程作答能力不变（提交答案与渲染解耦）。

### 异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 3D 引擎运行中崩溃 | `ERROR→DEGRADING→VOICE` | 续播音频，不丢题 |
| E2 | 音频与 3D 均不可用 | 落 TEXT 终态 | 字幕作答 |

### 后置 Postcondition
`AvatarRenderProfile∈{VOICE,TEXT}`；业务无影响。

### 验收标准 Acceptance（可测）
- 无 WebGL → 首屏 VOICE 且可读题作答。
- 强制 3D 初始化抛错 → 自动落 VOICE/TEXT，无死页。

### 关联
状态机：AvatarRenderProfile、AvatarPlaybackState（ERROR→DEGRADING）。原语：事件日志。

### 七类覆盖
- 正常：无 WebGL→VOICE。
- 异常：3D 崩溃→降级（E1）。
- 特殊：老旧 Safari/低端 JS 引擎仍可跑 TEXT 档。
- 逃逸：本 UC 即逃逸阶梯入口。
- 高并发：多次初始化重试去抖。
- 复杂：3D→VOICE→TEXT 连续降级 + 续题。
- 刁钻：删"禁用 JS 仍可作答"（App Router+SSE+提交接口禁 JS 全链路不可用，是不真实健壮宣称）；改"低端 JS 引擎/老 Safari 仍能跑 TEXT 档"真实降级断言。

### 测试用例
| TC | flow | 测试层 | 断言 |
|---|---|---|---|
| TC-006-noegl | 正常 | e2e | stub WebGL=none → VOICE 首屏、可提交答案 |
| TC-006-E1 | 崩溃 | 集成 | 注入引擎 init throw → 自动 VOICE，无未捕获错误页 |
| TC-006-legacy | 特殊 | e2e | 老引擎特性集 → TEXT 档可跑 |

---

## UC-avatar-007 · 用户手动调档（含与 005 冲突仲裁/冷却，会话级）

- **角色**：求职者
- **前置**：渲染中，存在更高/更低档可选（不超 `entitledMaxProfile`）。
- **触发**：用户在设置里显式切档（或写 `avatarRenderPreference`）。

### 主流程 Main
1. `PATCH /me/preferences` 写偏好；本地以 CAS 应用档位（上界裁到 entitledMaxProfile）。
2. **上调**（如 VOICE→3D）→ 触发 005 冷却豁免窗口。
3. 偏好持久跨会话；仍与设备能力及 entitlement 上限取保守者（UC-001 A1）。

### 异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 上调后设备扛不住 | 005×007 仲裁：冷却豁免→失败计数→N 次后会话级禁用回升并解释 | 锁定可用档（本会话） |
| E2 | 偏好写入与守护降级并发 | CAS（档位单一权威写） | 一方落败回查重判 |
| E3 | 重复点击切换 | 幂等（同目标档去重） | 不抖动 |
| E4 | 上调超 entitlement 上限 | 业务门拒绝（UC-021） | 维持上限档，提示升级 |

### 后置 Postcondition
`avatarRenderPreference` 持久；档位经 CAS 落定；冷却/失败计数/回升禁用为会话级体验态。

### 验收标准 Acceptance（可测）
- 用户上调 → 进入冷却窗口，窗口内守护不立即降级。
- 连续 N 次上调↔降级 → 回升禁用 + 解释（与 TC-005x007 共断言），且仅本会话。
- 偏好跨会话恢复且不超设备能力/entitlement 上限。

### 关联
契约：`PATCH /me/preferences`。状态机：AvatarRenderProfile。原语：CAS、幂等。安全：entitlement 上限（UC-021）。

### 七类覆盖
- 正常：用户切档生效。
- 异常：上调扛不住→仲裁锁定（E1）。
- 特殊：首次设偏好/无偏好默认。
- 逃逸：用户可一键切 TEXT 作为自助逃逸。
- 高并发：偏好写 vs 守护降级 CAS（E2）、重复点击幂等（E3）。
- 复杂：005×007 多轮 saga。
- 刁钻：脚本快速反复上调刷状态→冷却窗口 + 幂等吸收，无法制造抖动死循环；上调越权益→业务门拒（E4）。

### 测试用例
| TC | flow | 测试层 | 断言 |
|---|---|---|---|
| TC-007-main | 正常 | 集成 | PATCH 偏好 → 档位切换 + 持久 |
| TC-007-E2 | CAS | 单元 | 偏好写与守护降级并发 → 单一最终档、陈旧写落败 |
| TC-007-E3 | 幂等 | 单元 | 连点同目标档 → 单次状态变更 |
| TC-007-E4 | 权益门 | 集成 | 免费用户上调 3D → 拒绝，停在 entitledMaxProfile |

---

## UC-avatar-008 · TTS 合成失败的逃逸兜底（含退费）

- **角色**：系统 / 求职者
- **前置**：`SYNTHESIZING`，TTS 调用中。
- **触发**：TTS 失败/超时/输出非法。

### 主流程 Main
1. TTS 失败 → 重试分类：transient（网络/限流）有限重试；确定性失败（非法输入）不盲目重试。
2. 重试耗尽 → `SYNTHESIZING→ERROR→DEGRADING`，逃逸到字幕/纯文本朗读位（题面始终可读）。
3. **成本 `AiCostReservation.released`（不计费/退还）**；`ai_invocation_traces` 记失败。

### 异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | TTS transient 失败 | 分类重试 | 成功续，失败降级 |
| E2 | TTS 确定性失败 | 不重试，直接降级 | 文本兜底 |
| E3 | 失败后是否计费 | 成本 reserve→**release** | 不计费，可断言退还 |
| E4 | 重复请求（重连） | 幂等（内容哈希） | 不重复扣成本 |

### 后置 Postcondition
`AvatarPlaybackState∈{DEGRADING→显示文本}`；`ai_cost_reservation(released)`。题面可读，作答不受阻。

### 验收标准 Acceptance（可测，满足「失败退款」必测）
- TTS 失败 → 题面退文本仍可读、可作答（无死路）。
- TTS 失败 → 该次成本 `released`，**无 confirmed 计费**（断言账本）。
- 重连重发 → 不重复扣成本。

### 关联
状态机：AvatarPlaybackState、AiCostReservation（release）。原语：幂等、事件日志。安全：失败可解释降级。详细计费见 UC-018。

### 七类覆盖
- 正常：合成成功（反例基线）。
- 异常：失败→降级+release（E1/E2/E3）。
- 特殊：超时边界、空音频返回。
- 逃逸：本 UC 即 TTS 逃逸出口（→文本）。
- 高并发：重复请求幂等（E4）。
- 复杂：重试 saga + 成本 release + 降级跨步。
- 刁钻：构造确定性非法文本反复触发→不盲目重试、不刷成本、稳定降级。

### 测试用例
| TC | flow | 测试层 | 断言 |
|---|---|---|---|
| TC-008-E2 | 失败降级 | 集成 | TTS 注入失败 → 文本兜底可作答 |
| TC-008-E3 | 退费 | 集成 | 失败后 ai_cost_reservation=released、无 confirmed |
| TC-008-E4 | 幂等 | 单元 | 重发同内容 → 成本只预留一次 |

---

## UC-avatar-009 · 资产/音色/viseme 表版本与缓存失效治理（SRI 完整性，非 RLS）

- **角色**：系统
- **前置**：存在缓存的 TTS 音频/viseme 表/3D 共享资产。
- **触发**：音色/viseme 表/模型版本升级（`assetVersion` 变更）。

### 主流程 Main
1. 每份资产/音频/viseme 带 `assetVersion`（含音色版本+viseme 表版本+模型版本指纹）+ `integrityHash`。
2. `question_ready` 携当前 `assetVersion + integrityHash`；客户端缓存 key 含 `assetVersion`。
3. 版本变更 → 旧缓存 key 不命中 → 重拉/重合成；旧音频不与新口型表混用。
4. **渲染前 SRI 完整性校验**：共享静态资产（模型/贴图/viseme 表）下载后比对 `integrityHash`，不一致即拒渲并重取（防篡改/CDN 污染，**非越权——这些是共享只读资源，不套 RLS**，评审二·UC-002 收口）。

### 异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 旧缓存音频 + 新 viseme 表错位 | `assetVersion` 入缓存 key → 旧版不命中 | 强制刷新，不错位 |
| E2 | 版本回滚 | 版本指纹精确比对，不单调假设 | 按指纹命中 |
| E3 | 升级期间新旧并发 | 以服务端 question_ready 的 assetVersion 为权威 | 客户端不自选版本 |
| E4 | 资产被篡改/CDN 污染 | SRI/integrityHash 比对失败 → 拒渲重取 | `PRELOADING→ERROR→DEGRADING` |

### 后置 Postcondition
缓存与 `assetVersion + integrityHash` 一致；`ai_invocation_traces` 记模型/音色版本。

### 验收标准 Acceptance（可测）
- 升级 `assetVersion` → 旧缓存不命中、新音频与新 viseme 表配对。
- 旧 `assetVersion` 音频不会驱动新 viseme 表（断言版本指纹一致才渲染）。
- 篡改资产（改 1 字节）→ integrityHash 不匹配 → 拒渲重取（断言不渲染被篡改资产）。

### 关联
契约：question_ready.assetVersion/integrityHash。原语：幂等（版本化内容哈希）、事件日志。安全：共享资产 SRI 完整性（防篡改，非 RLS 越权）。

### 七类覆盖
- 正常：版本一致命中缓存。
- 异常：版本错位→失效重取（E1）。
- 特殊：首次无缓存、版本回滚（E2）。
- 逃逸：版本拉取/校验失败→退纯文本。
- 高并发：升级窗口新旧并发（E3）。
- 复杂：音色+viseme 表+模型三版本指纹组合失效。
- 刁钻：篡改共享资产/伪造 assetVersion 命中陈旧缓存→SRI 哈希比对不一致即拒渲重取（E4）。

### 测试用例
| TC | flow | 测试层 | 断言 |
|---|---|---|---|
| TC-009-E1 | 失效 | 集成 | bump assetVersion → 旧缓存 miss、新配对渲染 |
| TC-009-mismatch | 一致性 | 单元 | 音频 v1 + viseme 表 v2 → 拒渲并重取 |
| TC-009-sri | 完整性 | 单元 | 篡改 1 字节 → integrityHash 不匹配 → 拒渲重取 |

---

## UC-avatar-010 · 跨设备/多标签会话恢复与"已朗读"权威落点（呈现态）

- **角色**：求职者 / 系统
- **前置**：面试进行中（LangGraph Postgres checkpoint 持久），用户换设备或开多标签。
- **触发**：新设备/标签打开同 `resultId`。

### 主流程 Main
1. `GET /interview/{resultId}/snapshot` 取业务权威快照（status、currentQuestionId、spokenQuestionIds、locale），RLS 绑定属主。
2. 按快照重建 `AvatarPlaybackState`（呈现态），续接 SSE（`Last-Event-ID`）。
3. **已朗读权威落点**：`spokenQuestionIds` 是**呈现态语义的轻量服务端记录**，用于"同设备同会话不重复朗读"；**不承载业务事实**（评分/推进由 Interview/事件账本权威），是呈现态服务端缓存而非业务真相。

### 备选流 Alternate
- A1：多标签同时打开 → **单活仲裁**：仅一个活动标签驱动朗读，其余只读跟随。

### 异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 换设备恢复 | snapshot 重建 + checkpoint 续跑 | 续接当前题 |
| E2 | 多标签/多连接 seq 来自不同会话 | 单活仲裁（leader 锁），非活动连接只读 | 仅一个推进 |
| E3 | 越权读他人 snapshot | RLS fail-closed → 0 行 → 404 | 不泄露存在性 |

### 后置 Postcondition
呈现态从权威快照重建；业务态仍由 Interview/事件账本权威。

### 验收标准 Acceptance（可测）
- **同设备同会话**：已朗读题不重复朗读（零重复）。
- **跨设备恢复**：当前题**允许首次重读一次**（呈现态缓存可不携带最后一句播放进度），之后不再重复。
- 多标签 → 仅一个活动标签朗读，其余只读跟随。
- 越权读 snapshot → 404，无账本变化。

### 关联
契约：`GET /interview/{resultId}/snapshot`、SSE。状态机：Interview、AvatarPlaybackState。原语：RLS、事件日志、CAS（单活 leader 锁）。

### 七类覆盖
- 正常：换设备续接。
- 异常：越权读→404（E3）。
- 特殊：跨设备首次重读一次（边界 AC）。
- 逃逸：snapshot 拉取失败→提示重试，业务态不丢（checkpoint 在）。
- 高并发：多标签单活仲裁（E2/A1）。
- 复杂：换设备 + 多标签 + 重连 seq 重放组合。
- 刁钻：第二标签抢 leader 制造双朗读/双提交→单活锁 + 提交侧幂等/CAS，业务仅一次推进。

### 测试用例
| TC | flow | 测试层 | 断言 |
|---|---|---|---|
| TC-010-E1 | 恢复 | 集成 | 新设备 snapshot → 续当前题，同会话已读题不重读 |
| TC-010-cross | 跨设备 | 集成 | 跨设备恢复 → 当前题至多重读一次，之后不重复 |
| TC-010-E2 | 单活 | 集成 | 两连接同 resultId → 仅 leader 朗读，follower 只读 |
| TC-010-E3 | RLS | 集成 | userB 读 userA snapshot → 404，零账本变化 |

---

## UC-avatar-011 · 中英 i18n 切换与混排音素 + 面试中语言锁定

- **角色**：求职者 / 系统
- **前置**：面试支持 zh/en；存在中英混排题面。
- **触发**：用户切语言 / 渲染混排文本。

### 主流程 Main
1. locale 决定字幕/音色/viseme 表；混排句按分段语言检测选对应 viseme 表，段间过渡插值。
2. **面试中会话级锁定 locale**，进行中不允许切换（避免音色/viseme/已生成音频不一致）；切语言仅对新会话生效。UI 在面试中禁用语言切换并解释。
3. UI 文案、aria、字幕全量 i18n（前后端一致）。

### 异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 面试中尝试切语言 | 会话级锁定（拒绝） | 维持原 locale，提示新会话生效 |
| E2 | 混排句音素分段错误 | 分段检测 + 兜底字幕 | 错段退字幕，不发错音 |
| E3 | locale 资产缺失 | 回退默认 locale 字幕 | 不阻塞 |

### 后置 Postcondition
会话 locale 锁定；偏好切换仅作用于后续会话。

### 验收标准 Acceptance（可测）
- 纯中/纯英 → 选对 viseme 表。
- **中英混排句** → 分段选表正确：断言中文段用中文表、英文段用英文表、段界过渡位移 ≤ 阈值。
- 面试中切语言 → 被拒并提示"新会话生效"（业务规则可断言）。

### 关联
契约：`PATCH /me/preferences(locale)`、snapshot.locale。状态机：Interview（会话 locale 锁）。原语：CAS（locale 锁）、事件日志。

### 七类覆盖
- 正常：纯语言渲染。
- 异常：混排分段错→字幕兜底（E2）。
- 特殊：i18n 边界、混排首题。
- 逃逸：locale 资产缺→默认字幕。
- 高并发：面试中并发切语言请求→锁定拒绝（E1）。
- 复杂：混排 + 跨题 + 偏好切换跨会话生效。
- 刁钻：构造对抗混排（夹杂表情符号/RTL 字符）→分段检测兜底字幕、转义不发错音、不破坏布局。

### 测试用例
| TC | flow | 测试层 | 断言 |
|---|---|---|---|
| TC-011-mix | 混排 | 单元 | 中英混排句 → 各段选对 viseme 表、段界过渡位移 ≤ 阈值 |
| TC-011-E1 | 锁定 | 集成 | 面试中 PATCH locale → 拒绝 + "新会话生效"提示 |
| TC-011-E3 | 兜底 | 单元 | locale 资产缺 → 回退默认字幕、不阻塞 |

---

## UC-avatar-012 · 可访问性（字幕/aria-live/不依赖音画/键盘可达）

- **角色**：求职者（含辅助技术用户）
- **前置**：任意档位。
- **触发**：题面呈现 / 状态变更。

### 主流程 Main
1. 任何档位**始终提供字幕**（音画仅增强，非必需）。
2. aria-live 白名单只播报非敏感业务信号（不播报分数，配合 UC-003 契约层裁剪）。
3. 尊重 `prefers-reduced-motion`：减少口型/表情动画。
4. 键盘可达：播放/暂停/重听/静音/音量/提交全键盘可操作（一级控件见 UC-022）。

### 异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 屏幕阅读器试图读到分数 | aria 白名单 + 契约层不下发分数（双道）+ 表情不编码分数（三道） | 读不到分数 |
| E2 | reduced-motion 用户 | 关动画走字幕/静态形象 | 不晕动 |

### 后置 Postcondition
全档位可达；无敏感信息经 aria 泄露。

### 验收标准 Acceptance（可测）
- 静音/无 3D → 字幕完整可读题作答。
- aria-live 报告前不播报任何分数字段。
- reduced-motion → 动画关闭，功能不变。
- 所有一级控件键盘可达且有 aria-label。

### 关联
状态机：—。原语：—（防剧透挂 UC-003 契约层）。安全：防剧透第二道（aria 白名单）。

### 七类覆盖
- 正常：字幕+aria 正常。
- 异常：阅读器试读分数→白名单+契约双拦（E1）。
- 特殊：reduced-motion、纯键盘、纯屏幕阅读器。
- 逃逸：音画全失→字幕兜底作答。
- 高并发：快速状态变更 aria 去抖不刷屏。
- 复杂：屏幕阅读器 + 键盘 + reduced-motion 组合路径。
- 刁钻：通过 aria-live DOM 注入旁路分数裁剪→分数本就不在前端（契约层未下发），无可注入源。

### 测试用例
| TC | flow | 测试层 | 断言 |
|---|---|---|---|
| TC-012-caption | 正常 | e2e | 静音 → 字幕可读题、可键盘提交 |
| TC-012-E1 | 防剧透 | e2e/契约 | aria-live 区域无 score；报告前 DOM 无分数节点 |
| TC-012-motion | 特殊 | e2e | reduced-motion → 动画关闭、功能保留 |

---

## UC-avatar-013 · 隐私（不录像 · 瞬时转写即弃 · AI 合成语音可标识 · PII 结构性保证）

- **角色**：系统 / 求职者
- **前置**：可能使用语音作答（麦克风）。
- **触发**：录音/合成/呈现。

### 主流程 Main
1. **不录像**：不采集摄像头视频；不持久化原始音频。
2. 语音作答：音频**瞬时转写即弃**（转写后立即丢原始音频，仅留转写文本，详见 UC-017）。
3. **AI 合成语音可标识（合规底线）**：数字人语音明确标注"本声音由 AI 合成"，在音频元数据/字幕区携带标识；境内合规要求可识别。
4. **日志 PII 结构性保证（评审三·"0 PII 靠 grep"收口）**：答案/转写/音频**在类型层就不进入 logger**——日志接口对这些字段不可达（编译期类型边界 + 运行时边界测试），**grep 仅作 CI 兜底**，不作为唯一保证。

### 异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 转写后原始音频残留 | 即弃策略 + 不落持久存储 | 仅转写文本入业务流 |
| E2 | 合成语音缺失标识 | 标识为合成前置硬门 | 无标识不下发 |
| E3 | 日志误记答案/PII | 类型边界（字段不可进 logger）+ 脱敏管线 + grep 兜底 | 账本无 PII |

### 后置 Postcondition
无视频、无原始音频持久化；合成语音带 AI 标识；`ai_invocation_traces` 脱敏。

### 验收标准 Acceptance（可测）
- 全流程无摄像头采集、无原始音频持久化（断言无存储调用）。
- 数字人语音附"AI 合成"标识（断言 UI/元数据存在标识）。
- **结构性 PII 保证**：答案/转写类型**无法被传入 logger**（类型/边界测试断言：尝试传入即编译/运行期拒绝）；grep CI 兜底为第二道。

### 关联
状态机：AsrTranscript（DISCARDED）。原语：事件日志（脱敏）。安全/合规：不录像、AI 语音可标识、PII 结构性保证（类型边界 + 脱敏 + grep 兜底，硬规则）。

### 七类覆盖
- 正常：转写即弃 + 合成带标识。
- 异常：音频残留→即弃兜底（E1）。
- 特殊：首次授权麦克风、拒绝授权降级为文本作答。
- 逃逸：拒授麦克风→纯文本作答路径。
- 高并发：连续作答音频不堆积持久化。
- 复杂：录音→转写→弃→提交跨步隐私保持。
- 刁钻：抓包/调试试图取原始音频或绕过 AI 标识→无持久音频可取、标识为下发前置门；构造含 PII 答案试图进日志→类型边界拒绝（不依赖 grep）。

### 测试用例
| TC | flow | 测试层 | 断言 |
|---|---|---|---|
| TC-013-discard | 隐私 | 集成 | 转写后无原始音频写存储；AsrTranscript=DISCARDED |
| TC-013-watermark | 合规 | e2e | 合成语音附"AI 合成"标识（UI/元数据可断言） |
| TC-013-pii-type | 结构性 | 单元 | 答案/转写类型传入 logger → 编译/运行期拒绝（不可达） |
| TC-013-pii-grep | 兜底 | CI | 日志快照 grep 无 PII 模式（第二道兜底） |

---

## UC-avatar-014 · 报告生成中的呈现态与超时兜底

- **角色**：系统 / 求职者
- **前置**：面试 `completed`，report 作为后台子图生成中。
- **触发**：收到 `report_pending`。

### 主流程 Main
1. 收 `report_pending` → `AvatarPlaybackState→REPORT_PENDING`，数字人进入"报告生成中"等待呈现（进度/安抚文案，非空白）。
2. 收 `report_ready` → `REPORT_PENDING→ENDED`，引导查看报告。

> 边界澄清（评审二·UC-014 职责错位收口）：avatar 模块**不承担刷分/anti-cheat 检测**——呈现层看不到分数（防剧透三道），刷分检测属 scoring/ai-runtime 域。本 UC 只管报告等待呈现态与终态收敛，不"检测刷分→安全终止"。

### 异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | report 生成超时 | 超时兜底文案 + 可重试/稍后通知，数字人落 ENDED | 明确终态 |
| E2 | report 生成失败 | 解释性失败态 + 不阻塞，AssessmentReport 失败态由业务侧权威 | 数字人 ENDED + 提示 |
| E3 | 等待中断线 | snapshot/SSE 重放恢复 REPORT_PENDING | 续等 |

### 后置 Postcondition
`AvatarPlaybackState=ENDED`（终态）；报告态由 AssessmentReport 状态机权威。

### 验收标准 Acceptance（可测）
- report 生成中 → 有明确等待呈现（非空白/非死页）。
- report 超时/失败 → 数字人落 ENDED 并给解释，不停在不确定态（断言终态明确）。

### 关联
契约：SSE `report_pending/report_ready`。状态机：AvatarPlaybackState（REPORT_PENDING→ENDED）、AssessmentReport。原语：事件日志。安全：avatar 不碰分数/不做 anti-cheat（域边界）。

### 七类覆盖
- 正常：pending→ready→收尾。
- 异常：生成失败→解释终态（E2）。
- 特殊：超长报告等待边界。
- 逃逸：报告失败不阻塞，引导稍后查看。
- 高并发：重复 report_ready 幂等收尾。
- 复杂：等待中断线 + 重放 + 终态收敛（E3）。
- 刁钻：伪造 report_ready 想跳过等待→以服务端 snapshot 权威核对报告态，未就绪不跳转。

### 测试用例
| TC | flow | 测试层 | 断言 |
|---|---|---|---|
| TC-014-pending | 正常 | e2e | report_pending → 等待呈现非空白；ready → 引导查看 |
| TC-014-E1 | 超时 | 集成 | 注入超时 → 数字人落 ENDED + 解释文案 |
| TC-014-E3 | 重连 | 集成 | 等待中断线 → 重放恢复 REPORT_PENDING |

---

## UC-avatar-015 · 重听/重播不重复计费（分模式缓存）

- **角色**：求职者
- **前置**：当前题已合成过（有缓存音频/viseme，UC-009 版本一致）。
- **触发**：用户点击"重听"。

### 主流程 Main
1. 重听 → 命中缓存（同 `assetVersion` 内容哈希），**不重新调用 TTS、不计成本**。
2. 重锚音频时钟重播口型（UC-004）。
3. **STREAMING 题缓存口径**：分段合成完成后整题音频/viseme 段集落缓存（同 `assetVersion` key），重听整题命中缓存集，不重新逐段合成（解决评审「流式 ↔ 重听缓存」一致性）。

### 异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 缓存失效（版本变更） | 重新合成并计一次成本（UC-009/018） | 计费一次 |
| E2 | 高频连点重听 | 幂等/去抖，命中缓存 | 不刷成本 |
| E3 | STREAMING 题部分段缓存缺失 | 缺段重合成仅该段计成本，已存段不重计 | 最小重算 |

### 后置 Postcondition
重听不增成本账本；首次合成已计成本不变。

### 验收标准 Acceptance（可测）
- 重听 N 次（同 assetVersion）→ TTS 调用 0 次、成本记录 0 增。
- 版本变更后重听 → 恰一次重合成计费。
- STREAMING 题重听 → 命中整题缓存集，0 新增成本。

### 关联
状态机：AiCostReservation。原语：幂等（内容哈希）。计费口径见 UC-018。

### 七类覆盖
- 正常：重听命中缓存零计费。
- 异常：版本失效重合成计一次（E1）。
- 特殊：首次 vs 重听边界、STREAMING 题缓存。
- 逃逸：缓存损坏→重合成或退文本。
- 高并发：连点重听幂等（E2）。
- 复杂：重听 + 版本失效 + STREAMING 部分段缓存（E3）。
- 刁钻：脚本高频重听刷成本→缓存命中 + 幂等，成本不增。

### 测试用例
| TC | flow | 测试层 | 断言 |
|---|---|---|---|
| TC-015-replay | 正常 | 集成 | 重听×N（同 assetVersion）→ TTS 调用 0、ai_invocation_traces 不增 |
| TC-015-E1 | 失效 | 集成 | bump assetVersion 后重听 → 恰一次重合成计费 |
| TC-015-stream | 分段缓存 | 集成 | STREAMING 题重听 → 命中整题缓存集，0 新增成本 |

---

## UC-avatar-016 · 客户端 RUM 指标上报防伪/限流/异常值丢弃

- **角色**：系统
- **前置**：客户端采集 FPS/首帧/首音等 RUM 样本。
- **触发**：`POST /avatar/metrics` 上报。

### 主流程 Main
1. 上报带 `resultId + nonce + 签名`，服务端校验签名与归属（RLS——这是**用户业务数据上报端点**，与共享只读资产不同，RLS 用对了地方）。
2. **限流**：按用户/会话节流，超额丢弃。
3. **异常值丢弃**：服务端对越界/不可能值（负 FPS、超大值、时间倒流）丢弃，不污染 `avatar_client_metrics`。

### 异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 伪造/重放 RUM 刷量 | 签名 + nonce 防重放 + 限流 | 拒收/丢弃 |
| E2 | 异常值污染 | 服务端值域校验丢弃 | 不入账本 |
| E3 | 越权上报他人 resultId | RLS fail-closed | 0 行 |

### 后置 Postcondition
`avatar_client_metrics` 仅含通过校验的样本。

### 验收标准 Acceptance（可测）
- 无签名/重放上报 → 拒收（断言 dropped）。
- 越界值 → 丢弃不入账本。
- 越权 resultId → 0 行。

### 关联
契约：`POST /avatar/metrics`。原语：RLS（业务数据上报端点）、幂等（nonce 去重）、事件日志（被丢弃计数）。安全：上报通道真边界（存在 client→server 上报端点，签名/RLS 用对地方，区别于单向 SSE 的伪签名）。

### 七类覆盖
- 正常：合法样本入账本。
- 异常：异常值丢弃（E2）。
- 特殊：限流边界、空样本。
- 逃逸：上报失败不影响业务（RUM 非关键路径）。
- 高并发：突发上报→限流。
- 复杂：签名 + 限流 + 值域 + RLS 组合。
- 刁钻（真边界）：伪造/重放 RUM 刷量污染账本→签名+nonce+限流+异常值丢弃四重拦截（E1/E2）。

### 测试用例
| TC | flow | 测试层 | 断言 |
|---|---|---|---|
| TC-016-E1 | 防伪 | 集成 | 无签名/重放 nonce → dropped、不入账本 |
| TC-016-E2 | 值域 | 单元 | 负 FPS/时间倒流 → 丢弃 |
| TC-016-E3 | RLS | 集成 | 上报他人 resultId → 0 行 |

---

## UC-avatar-017 · 语音作答（ASR）输入链路 【承重】

> 补输入侧完整链路：录音→ASR(境内模型/trace/计费/双校验)→低置信度确认纠错→与文本作答**业务等价**提交。
> 域边界：答题主模态（语音 vs 文本）选择与 barge-in（半句打断）**归 `cend-mock-interview.md`(UC-INT-*) 权威**；本 UC 只实现"语音作答"这一形态的输入呈现链路。打断产生的"未完成标记"是**纯呈现 telemetry（落 `avatar_client_metrics`），不进评估/ai-runtime**（评审二·UC-010 越界收口）。

- **角色**：求职者 / AI 图 / 系统
- **前置**：`Interview` 处 `waiting_user`；用户选语音作答，已授权麦克风；持有效权益。
- **触发**：用户录音作答并结束。

### 主流程 Main
1. 录音（`AsrTranscript=RECORDING`）；音频**瞬时、不持久**（UC-013）。
2. 结束 → `POST /interview/{resultId}/answer:transcribe`，ASR 境内模型转写（`TRANSCRIBING`），落 `ai_invocation_traces` + `AiCostReservation.reserved`（计费 UC-018）。
3. **转写双校验**：① schema（文本结构/长度）；② 业务校验——置信度阈值、注入/越狱内容按**不可信输入进数据块**。
4. 置信度分支：`confidence≥τ` → `READY`（展示供确认/编辑）；`confidence<τ` → `LOW_CONFIDENCE_REVIEW`（**强制确认或纠错**，不静默提交错误转写污染答案）。
5. 用户确认 → `CONFIRMED`，文本经**既有 `UC-INT-submit-answer`**（幂等键、CAS 推进、答案双校验、ConsumptionRecord）提交——**与文本作答完全等价**。
6. 原始音频丢弃（`DISCARDED`）；`AiCostReservation.confirmed`。

### 备选流 Alternate
- A1：用户编辑转写后提交 → 以编辑后文本为答案。
- A2：用户切回文本作答 → 放弃转写（`DISCARDED`），无计费残留。

### 异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | ASR 失败/超时 | 重试分类；耗尽 → `FAILED`，提示改文本；成本 `released` | 不计费、可改文本 |
| E2 | 低置信度/方言/噪音转写错误 | `LOW_CONFIDENCE_REVIEW` 强制人工确认纠错 | 错误转写不进评分 |
| E3 | 重复提交（双击/重发，同 idempotencyKey） | 幂等键唯一约束 | 只转写一次、只评一次 |
| E4 | 并发同 thread 提交 | thread 租约/状态 CAS | 仅一个推进 |
| E5 | 越权对他人 resultId 转写/提交 | RLS fail-closed | 0 行→404 |
| E6 | 转写注入/越狱内容 | 不可信输入进数据块 + 答案业务校验（factuality/越狱门） | 不污染系统指令、不入幻觉事实 |

### 后置 Postcondition
`AsrTranscript∈{SUBMITTED,DISCARDED,FAILED}`；成功则经既有 Interview 推进 + `consumption_record(confirmed)` + `ai_invocation_traces`；原始音频不持久。

### 验收标准 Acceptance（可测）
- ASR 与文本作答**业务等价**：同一答案文本经 ASR vs 文本提交 → 进入同一双校验、同一 ConsumptionRecord 语义（断言路径等价）。
- 低置信度转写 → 不静默提交，必经用户确认/纠错（断言强制 review 分支）。
- ASR 失败 → 成本 `released`、不计费、可改文本（断言退费 + 无死路）。
- 同 idempotencyKey 两次 → 恰一次转写、一次评估、一次扣费。
- 越权转写/提交 → 404，零账本变化。
- 注入转写 → 进数据块、不拼接系统指令、不产生幻觉简历事实。
- 半句打断"未完成标记"仅落 `avatar_client_metrics`，**断言不进 answer/评估载荷**。

### 关联
契约：`POST /interview/{resultId}/answer:transcribe`、`POST /interview/{resultId}/answer`。状态机：AsrTranscript、Interview、ConsumptionRecord、AiCostReservation。原语：幂等、CAS、RLS、事件日志（全四条）。安全：用户答案/转写为不可信输入（数据块 + 双校验 + 越狱门）；隐私（不录像/即弃，UC-013）。

### 七类覆盖
- 正常：录音→转写→确认→提交评估。
- 异常：ASR 失败→FAILED+release+改文本（E1）。
- 特殊：低置信度/方言/噪音强制确认（E2）；拒授麦克风→文本作答；空录音边界。
- 逃逸：ASR 不可用→纯文本作答路径。
- 高并发：双击/并发提交→幂等+CAS（E3/E4）。
- 复杂：录音→转写→双校验→确认→既有提交 saga 跨聚合（AsrTranscript×Interview×Consumption×Cost）部分失败回滚。
- 刁钻：越狱/注入转写、刷分（重复提交博多次评估）、PII 边角（转写含身份证/手机号→脱敏不入日志）→数据块+双校验+幂等+脱敏（E6）。

### 测试用例
| TC | flow | 测试层 | 断言 |
|---|---|---|---|
| TC-017-main | 正常 | 集成 | 录音→转写→确认→既有提交链路，Interview 推进、扣费一次 |
| TC-017-equiv | 业务等价 | 契约/集成 | ASR 文本与直接文本提交进入同一双校验+Consumption 语义 |
| TC-017-E2 | 低置信度 | 单元 | confidence<τ → LOW_CONFIDENCE_REVIEW，未确认不提交 |
| TC-017-E1 | 失败退费 | 集成 | ASR 注入失败 → FAILED + cost released + 可改文本 |
| TC-017-E3 | 幂等 | 集成 | 同 idempotencyKey ×2 → 转写1次/评估1次/扣费1次 |
| TC-017-E5 | RLS | 集成 | userB 转写 userA resultId → 404、零账本 |
| TC-017-E6 | 越狱注入 | graph-fake-model | 注入转写进数据块、不入系统指令、答案业务校验拦截幻觉 |
| TC-017-barge | telemetry 边界 | 单元 | 半句打断未完成标记仅落 avatar_client_metrics，不进 answer/评估载荷 |
| TC-017-pii | 隐私 | 单元 | 转写含 PII → 账本脱敏、原始音频 DISCARDED |

---

## UC-avatar-018 · TTS/ASR 计费与失败退款 【承重】

> 明确首次合成/转写计成本、失败不计费/退款、重复请求幂等，绑定账本一致性。对齐 Meetwise「失败退款 + 重复请求」必测。

- **角色**：系统 / 求职者
- **前置**：面试权益 `ConsumptionRecord` 已在 `UC-INT` 占用（口径 0.5：avatar TTS/ASR 默认不二次扣用户权益，但模型成本独立走 `AiCostReservation`）。
- **触发**：发生 TTS 合成或 ASR 转写。

### 主流程 Main
1. 模型调用前 `AiCostReservation.reserved`（幂等键：TTS=内容哈希、ASR=idempotencyKey）。
2. 成功 → `reserved→confirmed`，写 `ai_invocation_traces`（成本/模型版本/prompt 版本，脱敏）。
3. 失败/超时/输出非法 → `reserved→released`（不计费/退还）。

### 异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 失败/超时 | `AiCostReservation.released` | 不计费，可断言退还 |
| E2 | 重复请求（双击/重连） | 幂等键唯一约束 | 成本只预留/确认一次 |
| E3 | 部分失败（已 reserved 未 confirm 进程崩） | 对账补偿：悬挂 reserved 超时 → released | 不漏不重扣 |
| E4 | 缓存命中（重听/重提交相同内容） | 内容哈希命中 → 不新建 reservation | 零增成本（UC-015） |
| E5 | 超额用量是否另计权益 | 见 UC-019 预算护栏：超预算降文本（不继续计费） | 不二次扣权益（默认 bundled） |

### 后置 Postcondition
`AiCostReservation∈{confirmed,released}`；`ai_invocation_traces` 与之一致；用户面试权益不二次扣（默认口径）。

### 验收标准 Acceptance（可测，对齐「失败退款 + 重复请求」必测）
- TTS/ASR 失败 → 该次 `released`、无 confirmed 计费（断言账本）。
- 同幂等键重复请求 → 成本恰预留/确认一次。
- 悬挂 reserved（崩溃模拟）→ 超时对账 released，不漏不重。
- 缓存命中重听/重提交 → 零新增成本。
- 默认口径下用户面试权益不因 TTS/ASR 二次扣减。

### 关联
状态机：AiCostReservation（reserve→confirm/release saga）、ConsumptionRecord、AvatarTtsBudget。原语：幂等、CAS（reservation 状态写）、事件日志。安全：成本/支付秘密不入日志。

### 七类覆盖
- 正常：成功→confirmed 计费一次。
- 异常：失败→released 退款（E1）。
- 特殊：首次合成/转写 vs 缓存命中边界（E4）。
- 逃逸：计费子系统不可用 → 不阻塞作答（成本记账异步补，业务优先）。
- 高并发：重复/并发请求幂等（E2）。
- 复杂：reserve→(崩溃)→对账补偿 saga（E3）跨进程部分失败。
- 刁钻：构造失败后重试刷成本 / 重复请求刷扣费 → 幂等 + release，成本不被刷。

### 测试用例
| TC | flow | 测试层 | 断言 |
|---|---|---|---|
| TC-018-refund | 失败退款 | 集成 | TTS/ASR 注入失败 → reservation=released、无 confirmed |
| TC-018-idem | 重复请求 | 集成 | 同幂等键 ×2 → 恰一次 reserve+confirm |
| TC-018-saga | 部分失败 | 集成 | reserved 后崩溃 → 超时对账 released，账本一致 |
| TC-018-cache | 缓存 | 集成 | 重听/重提交相同内容 → 零新增 reservation |
| TC-018-bundle | 权益口径 | 集成 | TTS/ASR 不二次扣 consumption_record |

---

## UC-avatar-019 · TTS 合成成本/字符预算护栏（超额降文本）【新增·承重，评审必补 1】

> 评审四「TTS 成本炸弹」：幂等只挡重复请求，**挡不住大量合法不同长问题**——每条唯一幂等键=每次 cache miss=真实计费。设每会话/每用户字符预算上限 + 超额降文本 + 合成限流。

- **角色**：系统 / 求职者
- **前置**：会话进行，存在 `AvatarTtsBudget`（按 tier 的 `sessionCharCap`/`userDailyCharCap`）。
- **触发**：每次 TTS 合成请求前的预算门。

### 主流程 Main
1. 合成前查 `AvatarTtsBudget`：本会话/本用户已用字符 + 本题字符 ≤ 上限 → 放行合成（UC-002）。
2. 合成成功 → CAS 累加 `sessionCharsUsed/userDailyCharsUsed`（与 `ai_cost_reservation.confirmed` 同事务/对账一致）。
3. 用量 ≥80% → SSE `budget_warn`，提示"语音用量将达上限，后续题将以文本呈现"。

### 异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 本题合成将超预算 | 预算门拒绝合成 → `DEGRADING→TEXT`（题面字幕仍可读、可作答） | 不计费、不死路 |
| E2 | 并发多题同时申请预算 | 预算计数 CAS（条件累加，超额分支落败） | 不超发、不竞态透支 |
| E3 | 预算服务不可用 | fail-safe：默认拒绝高成本合成、降文本（保守省钱），不阻塞作答 | 业务优先 |
| E4 | 重听命中缓存 | 不计入新增字符预算（无新合成） | 预算不被重听消耗 |

### 后置 Postcondition
`AvatarTtsBudget` 累加与成本账本一致；超额会话档位降 `TEXT`；作答能力不变。

### 验收标准 Acceptance（可测）
- 累计字符达 `sessionCharCap` → 后续题自动降 `TEXT`（断言不再发 TTS 合成请求、题面仍可读作答）。
- 并发多题申请预算 → 总合成字符不超上限（CAS 不透支，断言计数一致）。
- 重听不消耗新增预算（缓存命中，断言字符计数 0 增）。
- ≥80% → `budget_warn` 事件下发（可断言）。

### 关联
契约：SSE `budget_warn`；TTS 取数前置门。状态机：AvatarTtsBudget、AvatarRenderProfile（→TEXT）、AvatarPlaybackState（DEGRADING）。原语：CAS（预算计数）、幂等（缓存命中不计）、事件日志。安全：成本护栏（防大量合法长问题刷合成费）。

### 七类覆盖
- 正常：预算内合成放行。
- 异常：超预算→降文本不计费（E1）。
- 特殊：首题/极短题边界、≥80% 预警边界。
- 逃逸：预算耗尽→TEXT 仍可作答（逃逸阶梯一致）；预算服务挂→保守降文本（E3）。
- 高并发：并发多题抢预算→CAS 不透支（E2）。
- 复杂：预算累加 + 缓存命中不计 + 降级跨步一致性。
- 刁钻：构造大量唯一长问题刷合成费→预算上限封顶、超额降文本，成本被封顶（非幂等能挡，本 UC 才是真护栏）。

### 测试用例
| TC | flow | 测试层 | 断言 |
|---|---|---|---|
| TC-019-cap | 超额降文本 | 集成 | 累计字符达上限 → 后续题 0 次 TTS 请求、降 TEXT、可作答 |
| TC-019-E2 | 预算 CAS | 集成 | 并发多题申请 → 总合成字符 ≤ cap，计数无透支 |
| TC-019-warn | 预警 | 集成 | 用量 ≥80% → budget_warn 事件下发 |
| TC-019-E4 | 缓存不计 | 单元 | 重听命中缓存 → 字符计数 0 增 |
| TC-019-bomb | 刁钻 | 集成 | 大量唯一长问题 → 成本被 cap 封顶、超额降文本 |

---

## UC-avatar-020 · 合成服务高并发韧性（队列/背压/限流/熔断→文本兜底）【新增·承重，评审必补 2】

> 评审①「真·高并发全模块缺失」：现有 UC 的"高并发"都是单用户双击/双标签（客户端竞态）。本 UC 补**服务端负载维度**：千会话同时向 TTS/ASR 合成服务发起 → 队列/背压/限流/熔断 → 文本兜底。区别于 UC-008/014「合成全挂」（这里是**过载排队/部分降级**）。

- **角色**：系统
- **前置**：合成服务（TTS/ASR）共享有限容量；瞬时高并发。
- **触发**：并发合成请求超过服务容量阈值。

### 主流程 Main
1. 合成请求进**有界队列**；队列未满 → 正常合成。
2. **背压**：队列接近满 → 新请求得到"排队中"反馈（`AvatarPlaybackState→QUEUED`，SSE `queued`），不无限堆积。
3. **限流**：按租户/会话令牌桶限速，超速请求排队或快速失败降文本。
4. **熔断**：合成服务错误率/延迟超阈 → 熔断打开，**新请求直接走文本兜底**（不再排队耗时），半开探测恢复。
5. 容量恢复 → 熔断半开→关闭，正常合成恢复。

### 异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 队列满（过载） | 背压：超出部分 `QUEUED` 超时 → `DEGRADING→TEXT` | 文本兜底、不堆积、不雪崩 |
| E2 | 合成服务高错误率/高延迟 | 熔断打开 → 新请求直接文本兜底 | 不被慢调用拖垮、快速降级 |
| E3 | 排队超时 | `QUEUED` 超时阈 → ERROR→DEGRADING→TEXT | 不无限等待 |
| E4 | 熔断恢复误判（半开抖动） | 半开有限探测 + 滞回 | 不抖动反复开合 |
| E5 | 过载期成本一致性 | 排队/熔断未实际调用模型 → 不 reserve/不计费 | 账本不计未合成项 |

### 后置 Postcondition
过载期请求要么排队成功合成、要么文本兜底；无请求无限堆积；账本只计实际合成；作答能力全程不变。

### 验收标准 Acceptance（可测，负载/集成层）
- 注入 N×容量并发 → 超容量请求走 `QUEUED`→超时→TEXT，**无未捕获错误、无请求无限挂起**（断言队列有界 + 超时降级）。
- 合成服务高错误率 → 熔断打开后新请求**不再调用合成、直接文本兜底**（断言熔断态 + 0 新合成调用）。
- 熔断半开→关闭：容量恢复后合成恢复（断言状态机闭环）。
- 过载排队/熔断未合成 → 不产生 `ai_cost_reservation`（断言账本不计）。

### 关联
契约：SSE `queued`、`degraded`。状态机：AvatarPlaybackState（SYNTHESIZING↔QUEUED→ERROR→DEGRADING→TEXT）、AiCostReservation（未调用不 reserve）。原语：事件日志、幂等（重复请求不重复入队）。安全：背压/限流/熔断防雪崩；过载不影响作答（逃逸阶梯兜底）。

### 七类覆盖
- 正常：容量内排队即合成。
- 异常：高错误率→熔断→文本兜底（E2）。
- 特殊：队列空/满边界、熔断半开边界。
- 逃逸：过载/熔断→文本兜底仍可读题作答（逃逸阶梯一致）。
- 高并发（**真服务端负载，本 UC 主场**）：N×容量并发→队列/背压/限流（E1/E3）。
- 复杂：队列+背压+限流+熔断+半开恢复多机制协同 + 成本一致性（E5）。
- 刁钻：恶意并发洪峰试图拖垮合成/雪崩→有界队列+熔断快速降级，不雪崩、不计未合成费、作答不受影响。

### 测试用例
| TC | flow | 测试层 | 断言 |
|---|---|---|---|
| TC-020-load | 负载 | 集成/负载 | N×容量并发 → 超量请求 QUEUED→超时→TEXT，队列有界、无挂起 |
| TC-020-breaker | 熔断 | 集成 | 注入高错误率 → 熔断打开，新请求 0 合成调用、直接文本兜底 |
| TC-020-recover | 恢复 | 集成 | 容量恢复 → 熔断半开→关闭，合成恢复 |
| TC-020-E5 | 成本一致 | 集成 | 排队/熔断未合成 → 0 ai_cost_reservation |
| TC-020-storm | 刁钻 | 负载 | 洪峰并发 → 不雪崩、作答不受影响、账本不计未合成 |

---

## UC-avatar-021 · 特性 entitlement 门禁（免费=文本官 / 付费=语音·3D）【新增·承重，评审必补 3】

> 评审④「权益门禁缺失」：avatar 特性本身缺 entitlement gating。判权益**仍在业务服务**，avatar 不自判。

- **角色**：系统 / 求职者
- **前置**：用户 tier 已知（由 commerce/identity 权威）。
- **触发**：进入面试 / 调档 / 合成前的权益判定。

### 主流程 Main
1. `capability-profile` 由业务服务返回 `entitledMaxProfile`（免费=`TEXT`，付费=`VOICE`/`HIGH_3D`，映射以 `commerce.md` 为权威）。
2. 最终档/调档/合成一律裁到 `entitledMaxProfile` 之内（UC-001/007/002）。
3. 免费用户呈现"文本官"：纯字幕读题、文本作答，**全功能可用**（不阉割作答，只无 TTS/3D 增强）。

### 异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 免费用户尝试上调到 VOICE/3D | 业务门拒绝，引导升级 | 维持 TEXT，无越权 |
| E2 | 会话中权益变更（升级/到期） | 以服务端 `entitledMaxProfile` 为权威，CAS 修正上限 | 新上限即时生效（向下即时、向上需重判） |
| E3 | 客户端伪造 entitledMaxProfile 骗 TTS | 合成端服务侧二次判权益（不信客户端） | 越权合成被拒、不计费 |
| E4 | 权益服务不可用 | fail-closed：默认按免费=TEXT（保守不漏给付费特性） | 不误开高成本特性 |

### 后置 Postcondition
档位/合成不超 `entitledMaxProfile`；权益判定由业务服务权威；越权合成被服务端拒。

### 验收标准 Acceptance（可测）
- 免费用户 → 最高 `TEXT`，无 TTS/3D，但可完整文本作答（断言功能不缺、无合成调用）。
- 付费用户 → 可用 `VOICE`/`3D`（断言权益放行）。
- 客户端伪造 entitledMaxProfile → 合成端服务侧二次判权益拒绝、不计费（断言不信客户端）。
- 权益服务不可用 → fail-closed 到 TEXT（断言不误开付费特性）。

### 关联
契约：`capability-profile.entitledMaxProfile`；合成端服务侧权益校验。状态机：AvatarRenderProfile（上限约束）。原语：RLS/权益门（业务服务判）、CAS（上限修正）、事件日志。安全：判权益在业务服务、不信客户端、fail-closed。引用 `commerce.md` 定价口径（不重述）。

### 七类覆盖
- 正常：按 tier 给档。
- 异常：权益服务挂→fail-closed TEXT（E4）。
- 特殊：免费首次/付费到期边界。
- 逃逸：免费=TEXT 即逃逸阶梯终点，仍可作答。
- 高并发：会话中权益变更与调档并发→CAS 上限修正（E2）。
- 复杂：权益变更 + 档位自愈降级 + 用户调档三方在 entitlement 上限内协同。
- 刁钻：客户端伪造权益骗高成本合成→服务端二次判权益拒绝、不计费（E3）。

### 测试用例
| TC | flow | 测试层 | 断言 |
|---|---|---|---|
| TC-021-free | 免费门 | 集成 | 免费用户 → 最高 TEXT、0 合成调用、文本作答完整 |
| TC-021-paid | 付费门 | 集成 | 付费用户 → VOICE/3D 放行 |
| TC-021-E3 | 防伪权益 | 集成 | 伪造 entitledMaxProfile 请求合成 → 服务端拒、不计费 |
| TC-021-E4 | fail-closed | 集成 | 权益服务不可用 → 降 TEXT，不误开付费特性 |

---

## UC-avatar-022 · 静音/音量/重听/字幕 一级控件（courtesy + a11y）【新增，评审必补 13】

> 评审④「静音/音量/重读无一级控件」：courtesy + a11y 缺口。提供显式一级控件，键盘可达。

- **角色**：求职者（含辅助技术用户）
- **前置**：任意有音频档位（VOICE/3D）；TEXT 档静音/音量不适用，重听=重渲字幕。
- **触发**：用户操作静音/音量/重听/字幕开关。

### 主流程 Main
1. 提供一级控件：静音、音量滑杆、重听（重播当前题）、字幕常显开关；持久到 `/me/preferences`（`muted/volume/captionsAlways`）。
2. 静音 → 音频静音但**字幕仍在**、口型可继续（不进 PAUSED，不丢业务进度）。
3. 重听 → 走 UC-015 缓存重播（不重复计费）。
4. 全控件键盘可达 + aria-label（UC-012）。

### 异常流 Exception（落机制）
| flow | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 | 静音时收到新题 | 维持静音偏好，新题静音呈现 + 字幕 | 偏好跨题保持 |
| E2 | 重听点击与新题 question_ready 竞态 | 以当前题为准 + 幂等去抖 | 不串题、不重复合成 |
| E3 | TEXT 档调音量/静音 | 控件 disabled 或无操作（无音频） | 不报错、语义清晰 |

### 后置 Postcondition
偏好持久（muted/volume/captionsAlways）；静音不丢业务进度；重听不重复计费。

### 验收标准 Acceptance（可测）
- 静音 → 音频静默、字幕仍可读、业务进度不变（断言不进 PAUSED、不丢题）。
- 音量偏好持久且跨题/跨会话恢复。
- 重听 → 命中缓存零计费（与 TC-015-replay 共断言）。
- 全控件键盘可达 + 有 aria-label（断言可达性）。

### 关联
契约：`PATCH /me/preferences(muted/volume/captionsAlways)`。状态机：AvatarPlaybackState（静音不改播放态）。原语：幂等（重听去抖）、事件日志。安全/可达性：courtesy 控件 + 键盘可达 + aria（UC-012）。

### 七类覆盖
- 正常：静音/音量/重听/字幕开关生效。
- 异常：TEXT 档调音量→控件 disabled 不报错（E3）。
- 特殊：首次设偏好、静音跨题保持（E1）。
- 逃逸：静音=用户自助降噪，不影响作答；TEXT 档无音频仍可读。
- 高并发：重听 vs 新题竞态去抖（E2）、连点静音幂等。
- 复杂：静音+音量+字幕+重听组合 + 跨题持久。
- 刁钻：脚本高频重听刷成本→缓存命中+幂等（并入 UC-015），成本不增。

### 测试用例
| TC | flow | 测试层 | 断言 |
|---|---|---|---|
| TC-022-mute | 正常 | e2e | 静音 → 音频静默、字幕在、不进 PAUSED、业务进度不变 |
| TC-022-persist | 持久 | 集成 | 音量/静音偏好跨题/跨会话恢复 |
| TC-022-replay | 重听 | 集成 | 重听 → 命中缓存零计费 |
| TC-022-a11y | 可达 | e2e | 全控件键盘可达 + aria-label 存在 |

---

## 附 A · 性能 / 真机测试层与设备矩阵（承接 P95/延迟/漂移验收，评审③·必补 10）

> 评审③：001/002/005/010 的 P95/延迟/漂移 AC 是真机/性能预算断言，但旧版未指定**设备矩阵或 perf 测试层**，且 5min 漂移 AC 无对应 TC。本节定义专属测试层，承接这些 AC，杜绝用 graph-fake-model 冒充性能验收。

### A.1 测试层定义
- **perf/真机层**：在真实/仿真设备矩阵上跑接近真实 TTS/ASR 路径的端到端，采集 P95 首音延迟、首帧、降级首帧、长会话漂移。**不使用 fake model 证明音画质量/延迟**（测试策略禁止假验收）。
- **ai-eval 层**：真实境内模型路径的延迟/质量金任务（非门禁可降 SLO）。

### A.2 设备矩阵（最小集）
| 档 | 代表设备/环境 | 网络 | 绑定 AC |
|---|---|---|---|
| 低端 | 低端 Android（弱 GPU）/老 Safari | 3G/弱网 | UC-001 默认 VOICE、UC-002 语音首音 ≤500ms 或降 SLO、UC-006 降级 |
| 中端 | 中端手机/普通笔电 | 4G/WiFi | UC-002 3D 首音 ≤800ms、UC-005 降级首帧 ≤degradeFirstFrameMs |
| 高端 | 高端机 | WiFi | UC-004 长会话漂移 ≤maxDriftMs（5min）、UC-001 HIGH_3D |
| 无 WebGL | 强制 WebGL=none | — | UC-006 VOICE/TEXT 阶梯 |

### A.3 承接 TC
- `TC-002-latency`（首音延迟，真机/ai-eval）
- `TC-004-drift5m`（5min 长会话漂移，真机）
- `TC-005-firstframe`（降级首帧门禁）
- `TC-001-ac-init`（300ms 初判，可在集成/perf）
- 弱网 3G 加载（≤约定上界或显式 SLO，承接旧 UC-002 3G AC）

---

## 附 B · ADR / 待决策（评审④·必补 12 显式记，避免"降级单调当纯美德"等隐性默认）

| # | 决策点 | 现状/方向 | trade-off / 代价（须显式承认） |
|---|---|---|---|
| ADR-AV-1 | 战略：3D vs 语音官主线 | **语音官为主线（demo 黄金路径），3D 降 P1 可选增强** | 3D 在真机/弱网/现场是可靠性负债且稀释 agent 深度；以逃逸阶梯韧性为承重叙事 |
| ADR-AV-2 | 降级单调、禁自动回升 | 保留单调，回升仅用户显式 + 会话级（UC-005/007） | **代价**：一次网络抖动可能整场困在低档，多数用户找不到手动回升 → 故回升禁用**仅会话级**、新会话重置；UI 显式提示"可手动调档" |
| ADR-AV-3 | 答题主模态（语音 vs 文本） | **归 `interview-modality.md`/`cend-mock-interview.md` 权威**；avatar 仅实现"语音作答"形态输入链路（UC-017） | 若语音非主答题通道，barge-in 整组退为可选；本模块不擅自定主模态 |
| ADR-AV-4 | barge-in（半句打断）边界 | 打断"未完成标记"= **纯呈现 telemetry，不进评估/ai-runtime**（UC-017 AC） | 越界喂评估违反模块边界；跨域契约须 interview 域确认 |
| ADR-AV-5 | TTS 流式 vs 单资产 | 双模式 `ttsMode`，校验分流（0.6）；短题 SINGLE_ASSET、长题 STREAMING | 单一"完整 timeline 校验"与流式矛盾，故按模式分流校验 |
| ADR-AV-6 | TTS/ASR 超额是否另计权益 | **默认 bundled**，超额降文本（UC-019），不二次扣权益 | 若改独立计费需 commerce 域定价；当前以预算护栏封顶成本 |
| ADR-AV-7 | 头像身份/音色/性别偏见 | **待决**：固定中性音色 vs 可选；须过偏见/一致性审查 | 形象/音色性别偏见、跨题一致性风险；进多专家面板前不锁定 |
| ADR-AV-8 | 面试计时与加载/降级关系 | **待决**：加载/降级耗时是否计入面试计时预算 | 低端机若被加载耗时变相惩罚不公平；倾向"加载/降级不计作答计时" |

---

## 附 C · 评审收口对照（本轮第二次对抗评审 → 落点）

| 评审项 | 收口落点 |
|---|---|
| 必补1 TTS 成本/配额护栏 | **UC-019**（字符预算上限+超额降文本+合成限流） |
| 必补2 真高并发（队列/背压/限流/熔断） | **UC-020**（服务端负载维度，区别于 008/014 全挂） |
| 必补3 entitlement 门禁 | **UC-021**（免费=文本官/付费=语音·3D，判权益在业务服务）+ 0.7 |
| 必补4 流式 ↔ 完整 timeline 矛盾 | 0.6 ttsMode 分模式校验；UC-002 分流；UC-015 STREAMING 缓存 |
| 必补5 共享资产 RLS 误用 | 0.2 说明 + UC-009 SRI/integrityHash 完整性（非 RLS） |
| 必补6 单向 SSE 伪签名过度设计 | UC-003 已删伪签名；真边界保留 UC-016（存在 client→server 端点才签名） |
| 必补7 半句标记/刷分检测边界 | UC-017 AC（未完成标记纯 telemetry 不进评估）；UC-014 明确不做 anti-cheat（域边界）；ADR-AV-4 |
| 必补8 UC-006 病态命题 | UC-003 改"表情决策输入不含分数+各分桶字节级相同"代码级断言，删 1000 样本统计 |
| 必补9 口型≤80ms 自证恒等 | UC-002 延迟移 ai-eval/perf 真机层；graph-fake 仅断言取数/分支逻辑 |
| 必补10 perf/真机层+设备矩阵+5min 漂移 TC | 附 A + TC-004-drift5m |
| 必补11 黑名单跨会话矛盾 | UC-005 回升禁用=会话级体验态、不写设备指纹、不跨会话 |
| 必补12 决策文档化（主模态/计时/身份音色/单调代价） | 附 B ADR-AV-1..8 |
| 必补13 静音/音量/重读一级控件 | **UC-022** |
| 必补14 "0 PII"靠 grep | UC-013 改类型/边界结构性保证（答案不可进 logger）+ grep 兜底 |
| 防原语剧场 | 共享资产去 RLS（0.2/UC-009）、单向 SSE 去签名（UC-003）；RLS 仅留 snapshot/metrics/transcribe 等真业务数据端点 |

> 本版按第二次单专家对抗评审逐条收口。按项目 P0 expert-review gate，进 spec-gate 前仍应过一次**多专家面板（数字人/性能/安全/无障碍/成本）**确认 ADR-AV-7（头像身份/音色偏见）等待决项。

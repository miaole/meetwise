# Harness — UNSTUB-INV 全功能交付盘点刀（EXTREV-6 首刀 · 只读取证 · 零产品码零 run）

**基线**：`origin/feat/mysql-schema-skeleton` @ `b24143fc`（worktree `line/unstub-inventory`）。协调方快扫清单 @5636d58d 8 桩——本刀实测定全量。
**指令定性**（SOP `extreview-fix-campaign-SOP.md:67-69`）：所有用户可见「暂不可用/暂未开放」桩必须变为真实可用功能；诚实 503 是过渡态不是终态；「迁移中」话术与真实状态不符即设计偏移。
**纪律**：①本刀零产品码零 prove run（只读+文档）；②**禁止假可用**——删除类桩必须跨存储擦除真实完成+回执可证后才翻，提前翻=隐私谎言（比诚实 503 更糟）；③行号为 b24143fc 实测，在飞刀可能漂±，翻桩刀 EXEC 前必须亲读复核。

---

## 0. 结论速览

- **全量桩数 = 13**（协调方 8 桩全部确认，其中 1 桩改判归 ROUTE-DICT 非本战役；扩充 5 桩：流式 TTS、流式 ASR/turn-taking、计费/支付、OCR 生产准入、公开预览写关闭〔环境态〕）。
- **删除三桩（简历单删/全量删/面试擦除）是重刀**：内部机械（授权签发 0091/checkpoint worker/投影 sweep/向量面 sweep/memory 各轨 sweep/fence 族/预览回执 0129）**已大量建成**，cutover 卡在 INT01 六门合同（harness `gap-int-transcript-01-cutover-contract.md` §2b）+ §4.2 未闭合缺口（user_memory/trace/备份/外部云端）。**不是「改一个 503」的工作量。**
- **语音两桩半轻半重**：批式 TTS/ASR 链路（config→adapter→registry binding→service→controller→前端回落）**代码已全通**（`voice.tts.v1`/`voice.asr.v1` 均 `wired: true`），差的是**部署面**（per-capability DashScope key）+#69 服务端 consent 落账+持钥环境 live prove；流式 TTS/流式 ASR 是**真代码桩**（registry `wired: false` + 组合根硬 disabled + 前端开关 false 三重禁用）。
- **账户注销是零服务端面**：UI disabled 按钮之外全仓无任何账户删除 API——UNSTUB-ACCOUNT 是从设计到实现的全新刀。
- **最大风险**：把「翻桩」做成「改返回码」。删除桩翻早=隐私谎言；语音桩翻而不做 #69=合规缺口；计费桩纯代码翻不了（需商户合同）。

---

## 1. 全量桩清单总表

| # | 桩 | 类型 | API 桩位 | UI 文案位 | 归刀 |
|---|---|---|---|---|---|
| P-01 | TTS 批式播报（配置缺失时 503） | 部署配置桩 | `apps/api/src/modules/interview/interview-voice.ts:33` | `apps/web/components/VoiceCallPanel.tsx:295` | UNSTUB-VOICE |
| P-02 | TTS 流式播报（恒 503） | 代码桩（三重禁用） | `interview-voice.ts:47-51`（恒） | `VoiceCallPanel.tsx:95`（`ENABLE_STREAMING_TTS=false`）+ `:252-262` | UNSTUB-VOICE 二阶段 |
| P-03 | ASR 语音转写（配置缺失时 503） | 部署配置桩+#69 缺口 | `interview-voice.ts:78` | `VoiceCallPanel.tsx:84/:444/:493/:666` | UNSTUB-VOICE（+#69 同刀） |
| P-04 | 简历单份删除 | never 503 桩 | `apps/api/src/modules/resume/resume.service.ts:277-281`；`resume.controller.ts:41-44`（`@Delete(':id')`） | `apps/web/app/resume/page.tsx:93-94`（disabled 按钮「删除功能暂未开放」） | UNSTUB-ERASE |
| P-05 | 全量简历数据删除 | never 503 桩 | `apps/api/src/modules/privacy/privacy.service.ts:65-68`；`privacy.controller.ts:57-61`（`@HttpCode(503)`） | `resume/page.tsx:38/:47`、`faq/page.tsx:17-18`、`legal/page.tsx:44` | UNSTUB-ERASE |
| P-06 | 面试数据擦除 | never 503 桩 | `privacy.service.ts:53-57`；`privacy.controller.ts:51-55` | `faq/page.tsx:17-18`、`legal/page.tsx:44` | UNSTUB-ERASE |
| P-07 | 账户注销 | disabled 按钮桩（零服务端面） | **无任何 API**（auth 模块零 DELETE 端点，grep 亲证） | `apps/web/app/settings/page.tsx:87-97`（:89 标题/:91 披露/:95 disabled 按钮） | UNSTUB-ACCOUNT |
| P-08 | begin 路由未就绪 | honest 409（非 503 桩） | `apps/api/src/modules/jobs/applications.service.ts:48-52`（`interview_eligible_route` 409） | 前端走错误 toast | **ROUTE-DICT 刀已覆盖（#133/#195）·非本战役** |
| P-09 | 跨存储删除回执披露 | 文案桩（回执本体=0129 预览已可用） | `apps/api/src/modules/legal/legal.controller.ts:15`（dataRights） | `resume/page.tsx:38/:47/:53`、`faq/page.tsx:17-18`、`legal/page.tsx:41-45`、`privacy/page.tsx:37/:54` | UNSTUB-ERASE 收尾面 |
| P-10 | 计费/订单/支付（扩充） | 产品决策桩 | `apps/web/app/billing/actions.ts:5-8`（`createOrderAction` 恒 `{ok:false}`） | `billing/page.tsx:6/:12-21`（「当前不开放」卡） | UNSTUB-COMMERCE 或显式 scope-out |
| P-11 | OCR 图片简历生产准入（扩充） | 预览旗标桩 | `apps/api/src/modules/resume/resume.service.ts:85`（`image_ocr_unavailable` 422） | `apps/web/lib/resume/ocr-preview-ui.ts:18/:61` | 配置面+G7 生产准入刀 |
| P-12 | 公开预览写关闭（扩充） | 部署模式桩（非功能桩） | `apps/api/src/platform/public-preview.ts`（`MEETWISE_PUBLIC_PREVIEW=1` 时写 503 `public_preview_read_only`；触点含 `interview.service.ts:77-85`/`applications.service.ts:25-35`/`privacy.service.ts:99-102`） | billing/legal 页「预览环境」话术 | 部署决策（生产=0 自然退役）·非刀 |
| P-13 | 流式 ASR+服务端 turn-taking（扩充） | 代码桩（更深一层） | `packages/ai-runtime/src/interview-voice-seams.ts:20-22`（注释钉死：`voice.asr-stream.v1` unwired+PRD-TEST-006 未验证）；registry `model-operation-registry.ts:162-166` `wired:false` | 前端未暴露该模式 | UNSTUB-VOICE 二阶段或 backlog |

**非桩面（明确排除·Ban 误翻误改）**——以下「暂不可用」是**运行时优雅降级/取数兜底**，不是功能桩，翻桩战役禁触碰：

- `apps/web/lib/view-model.ts:71-86`（报告/评分暂不可用·重试出路）、`lib/stream/quiz-state.ts:132`、`lib/stream/diagnosis-state.ts:118`：真错误的诚实降级态。
- 各列表页 RSC 取数失败兜底（`diagnosis/page.tsx:89`、`quiz/page.tsx:82`、`interviews/page.tsx:92`、`growth/page.tsx:47`、`notifications/page.tsx:39`、`dashboard/page.tsx:75`、`recruiter/talent/page.tsx:79`、`recruiter/jobs/page.tsx:42`、`resume/page.tsx:71`）：API 未启动/失败的兜底文案。
- `health.controller.ts:22`（degraded 503 诚实健康态）、`resume.service.ts:49`（`server_busy` 限流）、`privacy.service.ts:75/:94`（hmac 缺失/通用映射的诚实错误信封）、`SharePoster.tsx:162`（数据缺失 aria）。
- 各 `loading.tsx`/Skeleton「占位」：加载骨架，非桩。

---

## 2. 逐桩档案

### P-01 TTS 批式播报

- **现状证据**：API `interview-voice.ts:27-40`（`synthesizeSpokenAudio`：`tts_not_configured`→503 `tts_unavailable`「语音播报暂不可用，将以文字显示题目」:33；`tts_download_capacity_exceeded`→503 `tts_busy` :35）。组合根 `packages/ai-runtime/src/interview-voice-seams.ts:111-133`：`wantTts = DASHSCOPE_TTS_API_KEY 存在 && ttsBindingOk()`。registry `model-operation-registry.ts:133-136`：`voice.tts.v1` **`wired: true`**（admission dashscope-native/cn-beijing）。UI `VoiceCallPanel.tsx:272-300`（非流式 `/speak` 调用+`:295` 降级提示）。调用链 `interview.service.ts:443-452`（voiceGate→owner→隐私围栏→`synthesizeSpokenAudio`）。
- **桩因考古**：`git log -S tts_unavailable` → `9c92826e`（initial 2026-07-11）→ `3f5bdc80`（2026-08-18 api 立面）→ `bbf9a962`（godfn-1c 2026-10-09 机械迁出，语义零变）。定性：**该 503 从一开始就是「未配 key 的 fail-closed」而非「功能未实现」**——BAILIAN-03/04 之后 key 按能力维度拆分（`dashscope-native-config.ts:20-27` `DASHSCOPE_TTS_API_KEY`，禁 legacy `DASHSCOPE_API_KEY` 一把抓 :48-51）。
- **可用化差距**：①**部署 `DASHSCOPE_TTS_API_KEY`**（含指纹/撤销清单校验 `dashscope-native-config.ts:100+`）；②持钥环境 live prove（本环境零 live key，godfn-1c 收据已登记「协调方持钥环境复跑」为 post-dual 前置）；③前端文案 `VoiceCallPanel.tsx:295` 随真可用概率下降自然少触发，不需要改码（降级路径保留为真实故障兜底）。
- **依赖链定谳**：无产品码依赖。前置=**key 部署**（运维面）+（可选同刀）#69。
- **翻桩前置条件红线**：无隐私红线——配置就绪即可用；但 prove 必须断言**真音频流**（`audioBase64` 可解码为 WAV/非空 `Uint8Array`，`failClosedTts` 已内置 `tts_malformed` 拒空 :72-79），Ban 只断言 HTTP 200。

### P-02 TTS 流式播报（扩充桩）

- **现状证据**：API `interview-voice.ts:47-51`（`prepareSpeakStreamText`：`streamTts.id === VOICE_EGRESS_DISABLED_ID` **恒真**→恒 503 `tts_unavailable`，:49）。组合根 `interview-voice-seams.ts:128-129/131`：`streamTts: disabledStreamingTts()` **硬编码**、`streamTtsConfigured: false` 恒。registry `model-operation-registry.ts:167-171`：`voice.tts-stream.v1` `wired: false`。UI `VoiceCallPanel.tsx:95`（`ENABLE_STREAMING_TTS = false`）+ `:252-262` 注释「流式 MSE 播放（cosyvoice MP3）未经真机验证…默认走已验证的非流式 /speak；真机确认流式无声问题后再开此开关」。控制器 `interview.controller.ts:100-105`（`/speak/stream` 路由+raw 流胶水已建，异常抛在 hijack 前）。
- **桩因考古**：`git log -S` 同 P-01 族。注释链（seams :19-22、interview-voice.ts:43-46「Disabled before hijack/headers: the browser can always fall back to text and no stream transport can be constructed from a broad provider key」）表明这是**有意的三重禁用**（registry 未接线+组合根 disabled+前端开关关），理由=未经真机验证+宽 key 不可构造流传输。
- **可用化差距**：①registry `voice.tts-stream.v1` wired→true+binding 契约（现 `UNWIRED_OPERATIONS`）；②`voice-stream.ts` 的 `dashscopeStreamingTts` 真实现（cosyvoice WebSocket 首块 1-2s，现只有 `disabledStreamingTts`）；③`DASHSCOPE_STREAM_TTS_API_KEY` 部署；④真机「起播=出声」验证后开 `ENABLE_STREAMING_TTS`；⑤e2e（fake seam 流式断言+live 首音延迟）。
- **依赖链定谳**：与 P-01 独立（前端默认非流式，P-01 先行）；前置=流式适配器实现+PRD-TEST-006 同族验证。
- **翻桩前置条件红线**：**禁只开前端开关**（后端恒 503 会造成「流式假可用=每次静默回落」）；禁在未经真机验证时宣称低延迟。

### P-03 ASR 语音转写

- **现状证据**：API `interview-voice.ts:57-90`（`transcribeAnswer`：`asr_not_configured`→503 `asr_unavailable`「语音转写暂不可用，请改用文字作答」:78）。组合根 `interview-voice-seams.ts:110-118`（`wantAsr = DASHSCOPE_ASR_API_KEY && asrBindingOk()`）；registry `:128-131` `voice.asr.v1` `wired: true`。UI `VoiceCallPanel.tsx:84`（`asr_down: '语音转写暂不可用'`）、`:444/:493`（503/502 toast「可切回打字继续」）、`:666`（alert「可切回打字继续作答,你的进度已保存」）。调用链 `interview.service.ts:432-440`（voiceGate→owner→`guardInterviewPrivacy` delete-wins 围栏→转写；「原始录音不落库」隐私铁律注释 :431）。
- **桩因考古**：同 P-01 族（initial→3f5bdc80→bbf9a962 迁出）。
- **可用化差距**：①**部署 `DASHSCOPE_ASR_API_KEY`**；②**#69 服务端 consent 落账**——现状：`VoiceCallPanel.tsx:604-623` 的 `consent_required` 对话框是**纯客户端 React state**（`setCaptureConsented(true)`），服务端 `transcribe` 全链**无 consent 检查/落账**（grep 亲证 interview 模块零 consent 触点）；`consent_record` 表+`privacy.service.consent()`（`privacy.service.ts:18-26`，幂等 purpose 落账）已存在但 purpose 域只有 `resume_processing` 默认值——差「语音 purpose 落账+gate（无同意→403/404 fail-closed）」；③持钥 live prove。
- **依赖链定谳**：**依赖 #69（CONSENT-AUDIT 域）落账同刀或先行**（SOP EXTREV-6 表已注「ASR 能力门真实化（#69 同刀：服务端 consent 落账）」）。
- **翻桩前置条件红线**：#69 未落账前禁把 ASR 从「配置缺失 503」翻成「无同意也放行」——那不是可用化，是新合规缺口。

### P-04 简历单份删除

- **现状证据**：API `resume.service.ts:270-281`（`remove(_principal,_id): never`→503 `resume_erasure_migration_in_progress`）；`resume.controller.ts:41-44`（`@Delete(':id')`→`remove`）。UI `resume/page.tsx:93-94`（disabled 按钮「删除功能暂未开放」+`title="完整删除与跨存储回执流程尚未开放"`）。
- **桩因考古**：`git log -S resume_erasure_migration_in_progress` → 引入于 `3f5bdc80`（2026-08-18）；文案/披露随 `eb3f6ef9`（0129 预览路径 #82，2026-09-04）定稿。桩因注释（:270-276）原文：「The historical hard DELETE bypassed the C/B reference snapshot, queue and graph fences, receipt ledger, and external deletion targets. Keep the route fail-closed until **the per-resume asynchronous erasure state machine** replaces it; a 200 here would falsely represent a privacy guarantee.」引用文档=**`ai-docs/architecture/ai/privacy-deletion-sink-inventory.md`**（§2 入口表、§4.2 未闭合缺口）。
- **可用化差距**（详表见 §3）：①**per-resume 异步擦除状态机 begin 函数不存在**——`packages/db/src/resume.ts:9` 已有 `'erasure_fenced'|'erased'` 状态枚举、0060/0061 tombstone+derivative guard、0049/0052-0055 引用快照地基已建，但 `packages/db/src/` **无任何 resume 轨道 erasure begin/claim/purge 函数**（对照 memory 轨道五件套）；②授权面：0091 issuer（`privacy-authorization.ts:32/66/97/124/138`）未对公开 HTTP 接线（purpose 域已含 `resume_data_erasure` :18）；③外部 sink（OSS 原文+pgcrypto 密文 0121/0122/0151）云端删除+回执；④UI 翻（:93-95 换真删除 action+确认对话框+回执展示）。
- **依赖链定谳**：依赖 UNSTUB-ERASE 擦除 cutover 前置（=INT01 六门合同对 resume 轨道的同构物：issuer key 管理/外部 sink 云端/开关合同/prove/专家审）。PRIV4（向量面）+PRIV01-C（owner 接线）已 nail 面是地基不是豁免。
- **翻桩前置条件红线**：六门同构判据未过+外部 sink 云端未确证+引用快照未收口前，`remove()` 禁返 200/202（隐私谎言禁令·503-pin `privacy-erasure-http-503-pin.md` §0 硬钉同源）。

### P-05 全量简历数据删除

- **现状证据**：API `privacy.service.ts:59-68`（`deleteResumeData(_principal): never`→503）；`privacy.controller.ts:57-61`（`@Delete('resume-data')` `@HttpCode(SERVICE_UNAVAILABLE)`）。UI 披露：`resume/page.tsx:38/:47`（「完整删除、撤回与跨存储回执流程尚未开放」）、`faq/page.tsx:17-18`（「完整的删除、撤回与跨存储回执流程尚未开放…这不是生产删除完成」）、`legal/page.tsx:44`。
- **桩因考古**：同 P-04（`3f5bdc80` 引入；`eb3f6ef9` 0129 收口注释 :59-64「The former all-resumes synchronous DELETE had no stable C/B references, request ledger, fences, or external receipts…returning a successful response here would be a false privacy-deletion claim」，指向 `privacy-deletion-sink-inventory.md`）。
- **可用化差距**：P-04 全部差距 + ⑤跨存储 sweep 聚合（PG 行+向量面 0125/0141+memory 轨道）+ §4.2 缺口闭合（`user_memory` 正文 purge〔`getMemoriesByRefIds` 按 `vector_chunk.ref_id` 回表——向量块删了正文还在〕、`ai_invocation_trace.output`、备份/PITR 留存语义〔`retentionDays:0` 政策落地〕）+ ⑥幂等键/HMAC 回执聚合面（0129 预览已有 `Idempotency-Key` HMAC 形制可升格）。
- **依赖链定谳**：P-04 先行（单份状态机是全量聚合的构件）；INT01 六门+§4.2 是硬前置。
- **翻桩前置条件红线**：同 P-04；另禁把 0129 预览 202 改写成生产完成态（`completeness=preview_incomplete`/`productionSloClaimed=false`/`releaseEvidence=false` 三钉，0129 迁移+`privacy-erasure-preview` 域侧目录钉死）。

### P-06 面试数据擦除

- **现状证据**：API `privacy.service.ts:46-57`（`eraseInterviewData(_principal,_interviewId,_idempotencyKey): never`→503 `interview_erasure_authorization_not_available`）；`privacy.controller.ts:51-55`（`@Delete('interview-data/:id')` `@HttpCode(503)`+`Idempotency-Key` 头已收）。UI 披露同 P-05。
- **桩因考古**：`git log -S interview_erasure_authorization_not_available` → `3f5bdc80`（引入）→ **`e9d78176`（INT-TRANSCRIPT-00「issuer abuse proofs, 503 stay, P0 doc sync」#69 PR，2026-09-03：「Keep public interview delete at 503. Freeze submission/receipt contract only.」）**→ `eb3f6ef9`（0129 注释收口 :53-55「0125 只闭合 memory_vector_chunk 向量块 sweep；inventory §4.2 的 user_memory/ai_invocation_trace/外部 sink 仍未齐」）。桩因=**授权签发器（0091）未对公开 HTTP 接线**：`app.principal_user` 是路由 GUC 不是不可伪造身份，需授权快照签发器才可再受破坏性请求。
- **可用化差距**：**内部机械已建最全**——`packages/db/src/uc052-internal-erasure.ts:161`（`runAuthorizedInterviewErasure`：event/ai_graph_run/report 本地 purge+oss/redis/langfuse `retention_pending`+0091 JWS 快照签发/消费/claim/回执全链），但「No public HTTP」（文件头注释 :4）。cutover 差=INT01 六门（harness `gap-int-transcript-01-cutover-contract.md` §2b，checklist `:1179`-`1216` INT01 nail 已立卷合同）：门1 issuer 生产级 key 部署管理+轮换证据+JWS 验签真实组合根；门2 外部 sink 逐个云端真删证据（`:64` OPEN·`cloudVendorDeleted=false`·0137/0140 schema 已有、异步确认执行器无）；门3 INT 向量作用域键+Qdrant 登记为可证明擦除 sink（INT `vector` sink 现诚实 no-target·`packages/qdrant-store/src/erasure.ts` 原型「Does NOT wire into production privacy ledger yet」）；门4 503→真删单一开关合同+独立 prove+专家审；门5 公平重放/幂等真实 HTTP/SSE/RLS 组合根复证；门6 BUG-REV-COND 四专家审+§2b-0 三结构前提（0a/0b release gate+0c legacy `/turn` 明文切断）。
- **依赖链定谳**：UNSTUB-ERASE 的**最长杆**——门2/门3 是 `:64`/`:60` OPEN 行，须独立 cutover REQUEST 走六门（INT01 nail 原文：「真实 cutover 须未来授权 REQUEST 走六门，§2b-0 两道 release gate 不可拆」）。
- **翻桩前置条件红线**：六门任一未过禁翻；`INT-P0-RAW-QUEUE`（interview_job.payload 明文）禁洗白；Ban vendor 证据形态顶替（D2：local_isolated_stub/`external_confirmed` NB-3/docs 自述均不算门2证据）。

### P-07 账户注销

- **现状证据**：UI `settings/page.tsx:87-97`（:89「账户注销暂未开放」标题、:91「需要独立的授权、删除与回执流程。该流程完成验证前，本站不接受或伪装完成注销请求」、:95 disabled 按钮）。API：**全仓零账户删除端点**（`apps/api/src/modules/auth/`+`profile/` grep 亲证无 DELETE/注销路由；`billing/actions.ts` 同形制的「明示不可用」对照）。
- **桩因考古**：`git log -S 账户注销暂未开放` → `37602676`（2026-08-18 feat(web) RSC 重构）。
- **可用化差距**：**级联擦除范围设计输入是第一缺口**。已建可复用件：账户级 MEM/CTX 各轨 sweep begin（0093 memory_fact/embedding/context_snapshot、0112 memory_summary、0125 memory_vector_chunk、0111 conversation_event、0118 context compression——purpose `account_data_erasure` 域已含 :18）。待设计：①级联面清单（账户=全 owner 的 INT/RESUME/MEM/CTX/commerce 凭证/notification/audit 范围界定）；②身份回收（refresh token 撤销/pwd epoch 0015/会话失效）；③终态语义（账户行匿名化 vs 物理删+备份留存窗口）；④授权面（注销=不可逆高危，需二次确认+冷静期?）；⑤外部 sink；⑥UI 翻+回执。
- **依赖链定谳**：依赖 UNSTUB-ERASE 的账户级聚合面成熟（P-04/05/06 至少 resume/interview 轨道可用）——否则注销=「删了账户但简历/面试/记忆全留」的假注销（最恶劣的隐私谎言形态）。
- **翻桩前置条件红线**：级联面清单未定谳+未实现前，禁把 disabled 换成「提交后后台人工处理」之类的软话术（同为伪装完成）。

### P-08 begin 路由未就绪（改判归 ROUTE-DICT）

- **现状证据**：`applications.service.ts:48-52`（`interview_eligible_route` → **409 CONFLICT**「该岗位路由尚未就绪，暂不可开始题库面试；请待岗位补充描述并完成路由后再试」）。
- **定谳**：这是**数据未就绪的 honest 409**，不是「功能未实现」桩——岗位补描述+路由完成后自然可用，路径本身真实存在。SOP 已归 ROUTE-DICT 刀（#133 词典收紧+#195）。UNSTUB 战役**不重复立项**；本清单仅登记防漏。

### P-09 跨存储删除回执披露

- **现状证据**：API `legal.controller.ts:8-16`（`PRIVACY_POLICY.dataRights: ['完整删除、撤回同意和跨存储回执流程当前未开放。',…]`+`retentionDays: 0`）；UI `resume/page.tsx:38/:47/:53`、`faq/page.tsx:17-18`、`legal/page.tsx:41-45`、`privacy/page.tsx:14/:26/:37/:54`（预览回执 Badge）。回执本体=0129 预览路径**已可用**（`privacy.service.ts:97-146` beginPreview/getPreview/listPreview；域侧 `PRIVACY_PREVIEW_SINK_CATALOG` 全量盘点+`preview_incomplete`）。
- **桩因考古**：`legal.controller.ts` 随 `eb3f6ef9`（0129）定稿「Conservative public-preview boundary…cannot advertise them as a data-rights workflow」。
- **可用化差距**：随 P-04/05/06 cutover——回执从 `preview_incomplete` 升格 `productionSloClaimed` 可言真的条件=§3 必收录执列+§4.2 缺口全有真实组合根回执（inventory §6 维护规则 3）；文案四页+legal policy 常量同步退役；撤回同意（#81）+policy_version（#82）属 CONSENT-AUDIT 域另刀。
- **翻桩前置条件红线**：禁先改文案后补能力（披露先行原则：文案只能滞后于能力，不能超前）。

### P-10 计费/订单/支付（扩充）

- **现状证据**：`billing/actions.ts:4-8`（server action 恒 `{ok:false,error:'预览环境未开放订单、支付或额度购买。'}`）；`billing/page.tsx:6/:11-21`（「当前不开放」卡：自述「需要独立的服务合同、异常处理与真实环境验证。它们完成前，本站不展示商品、价格或操作入口」）；`legal/page.tsx:45` 披露。
- **桩因考古**：`git log -S 预览环境未开放订单` → `37602676`（2026-08-18）。
- **定谳与差距**：**产品决策桩**——支付需要真实商户合同+资金链路（0136 `payment_order_refund_provider_txn` schema 已有 provider txn 面），不是代码可独立翻的。选项：A) 商务就绪后立 UNSTUB-COMMERCE（provider 绑定+对账+退款异常+e2e）；B) 本战役显式 scope-out 并在 SOP 登记「计费桩属商务前置」决策记录。
- **翻桩前置条件红线**：禁 mock 支付充可用（资金假可用比功能假可用更糟）；scope-out 也必须留 ADR 痕迹而非沉默。

### P-11 OCR 图片简历生产准入（扩充·半桩）

- **现状证据**：`resume.service.ts:85`（`image_ocr_unavailable` 422「图片简历 OCR 仅预览版可用（OCR_ENABLED=1 且 OCR_PREVIEW=1）；生产未开放」）；gate `ocr-model-client.ts:23-39`（双旗+production/enforce 拒绝）；UI `ocr-preview-ui.ts:18/:61`。
- **桩因考古**：`3f5bdc80` 引入，MODEL-OP-01 窄切片后 `resume.ocr.v1` 已 `wired: true`（registry :110-114）。
- **可用化差距**：`resume.ocr.v1` registry 已 wired+DashScope native adapter 已接——差①生产环境双旗部署决策（OCR_ENABLED/OCR_PREVIEW）；②G7 开关生产拒绝面收敛（#168 族）；③视觉 token ledger（MODEL-OP-02）未做（registry 注释自认）。定谳：**归 G7/配置域刀**，UNSTUB 战役登记不立项。

### P-12 公开预览写关闭（扩充·部署模式态）

- **现状证据**：`public-preview.ts`（`resolvePublicPreviewMode` fail-closed 解析+`assertPublicPreviewWritesClosed` 服务层兜底；`PREVIEW_CONTROLLED_WRITE` answers 单口例外）。触点：`interview.service.ts:77-85`、`applications.service.ts:25-35`、`privacy.service.ts:99-102` 等（godfn-1c 等数机检 `denyPublicPreviewWrite` 10 触点）。
- **定谳**：这是**显式部署模式**（`MEETWISE_PUBLIC_PREVIEW`），非产品功能桩——生产部署（=0）时自动消失，预览部署时它就是产品语义（预览站禁写）。UNSTUB 战役**不立项**；登记防与 P-04..06 混淆（P-04..06 的 503 在任何部署模式下都恒抛，与本桩的 env 条件 503 性质不同——翻 P-04..06 ≠ 关预览模式）。
- **注意**：SOP 指令定性中「『迁移中』话术与真实状态（无迁移在进行）不符即设计偏移」的批评**不适用于** P-12（它如实描述部署模式）；适用于 P-05 的 `resume_erasure_migration_in_progress` 错误码字面（「migration in progress」但实际是「state machine not built」——UNSTUB-ERASE 翻桩时错误码与文案一并退役）。

### P-13 流式 ASR+服务端 turn-taking（扩充）

- **现状证据**：`interview-voice-seams.ts:19-22`（「Streaming ASR and server turn-taking stay disabled even when `VOICE_STREAM_ASR_*` preview flags and stream Keys exist: `voice.asr-stream.v1` is unwired and PRD-TEST-006 is not verified」）+ `:127/130`（`streamAsr: disabledStreamingAsr()`/`streamAsrConfigured: false` 恒）；registry `:162-166` `wired: false`。前端无此模式入口。
- **定谳**：比 P-02 更深一层的代码桩（连预览旗标都不开）。建议归 UNSTUB-VOICE 二阶段或显式 backlog（PRD-TEST-006 验证是前置）；本战役登记防漏。

---

## 3. 删除三桩 cutover 对账：已建件 vs 差距清单

### 3.1 已建件（翻桩可复用的真实机械·全部亲读）

| 件 | 位置 | 状态 |
|---|---|---|
| 0091 授权快照签发/消费/claim/回执（JWS EC 签名·purpose 三域已含 interview/resume/account） | `packages/db/src/privacy-authorization.ts:32/66/97/124/138/162` | 建成·**未对公开 HTTP 接线** |
| checkpoint 擦除 worker（claim/lease/purge） | `apps/worker/src/privacy-erasure-worker.ts:13-40`；接线 `apps/worker/src/main.ts:702`（需专用 `PRIVACY_WORKER_DATABASE_URL` 最小权限登录，缺即可见 fenced 而非伪完成 :481-486） | 建成·在跑（配 pool 时） |
| 面试投影 sweep（event/ai_graph_run/report purge+外部 retention_pending+0091 全链） | `packages/db/src/uc052-internal-erasure.ts:161`（`runAuthorizedInterviewErasure`） | 建成·**internal only 无公开 HTTP**（文件头 :4） |
| 向量面 sweep 步（0141 feed→0125 claim→purge→0091 local_erased 回执） | `packages/db/src/vector-plane-erasure.ts:97`；worker `privacy-erasure-worker.ts:48-60`；接线 `main.ts:703` | 建成·PRIV4 nail 2026-10-07（prove 33/33 EXIT=0·本地行级证据） |
| memory_vector_chunk sweep+十项链 fail-closed 写围栏 | `packages/db/src/memory-vector-chunk-erasure.ts:21/44/62/78`；迁移 0125 | 建成 |
| MEM/CTX 账户级各轨 sweep begin | 0093/0112/0111/0118（memory_fact/embedding/context_snapshot/summary/conversation_event/compression） | 建成（各轨独立账本） |
| fence 族（队列/投影/双写） | 迁移 0058/0059/0126 | 建成 |
| 预览回执路径（受理→全量 sink 盘点→诚实未完成态） | 迁移 0129+`privacy.service.ts:97-146`+域侧 `PRIVACY_PREVIEW_SINK_CATALOG` | 建成·在用 |
| 外部 sink 确认 guard+vendor purge evidence | 迁移 0137/0140 | **schema 级·异步确认执行器无** |
| Qdrant 擦除原型（erasePoints/eraseSubjectPoints+回执） | `packages/qdrant-store/src/erasure.ts:98/148` | 原型·**未接生产隐私账本**（文件头自认） |
| 简历引用快照/tombstone 地基 | 迁移 0049/0052-0055/0060/0061；`resume.ts:9`（`erasure_fenced`/`erased` 状态枚举） | 地基·**resume 轨道 begin/claim/purge 函数零实现** |
| checkpoint 物理/投影双路径 | `uc052-checkpoint-physical.ts:138-147` | 建成 |

### 3.2 cutover 差距清单（UNSTUB-ERASE 真实工作面）

1. **授权面（门1）**：0091 issuer 生产级 key 部署管理+轮换逐次证据+JWS 验签在真实 HTTP 组合根生效（现 Bearer/JWS 冒充路径 prove 只有 abuse 侧 e9d78176）。
2. **跨存储回执聚合（门2）**：oss/redis/langfuse `retention_pending`→云端真删确认执行器（0137/0140 有表无执行器）；`:64` OPEN·`cloudVendorDeleted=false`。
3. **INT 向量作用域键+Qdrant 登记（门3）**：INT 轨道 `vector` sink 无 interview 作用域键（诚实 no-target）；qdrant 原型未接 0091 账本；`:60` OPEN。
4. **§4.2 缺口**：`user_memory` 正文（无 sink 无 purge）、`ai_invocation_trace.output`、备份/PITR 留存语义（`retentionDays:0` 落地）。
5. **resume 轨道状态机**：per-resume 异步 begin/claim/purge（对齐 checkpoint 轨道形制）。
6. **开关合同（门4）**：503→真删单一明确开关+独立 prove+专家审（Ban 多入口绕行）。
7. **公平重放/幂等复证（门5）**：真实 HTTP/SSE/RLS 组合根（双 tab 恰一 winner 等）。
8. **四专家审（门6）+§2b-0**：BUG-REV-COND 四席+0a/0b release gate+0c legacy `/turn` 明文切断。
9. **UI 启用**：`resume/page.tsx:93-95` 真删除 action、settings 注销、faq/legal/privacy 四页文案+`legal.controller.ts:15` dataRights 常量、错误码 `resume_erasure_migration_in_progress`/`interview_erasure_authorization_not_available` 退役。
10. **孤儿检测**（P-05 全量聚合特有）：跨轨道 sweep 的孤儿行检测面（各 begin 幂等键命名空间独立——inventory §3.2 已警示「一份 request completed 不等于账户删除完成」，全量聚合须收敛判定）。

---

## 4. 刀拆分建议与 prove 判据草案

### 4.1 UNSTUB-ERASE（P-04/P-05/P-06/P-09 · 建议四子阶段串行）

| 子阶段 | 范围 | prove 判据草案 |
|---|---|---|
| E1 resume 单份状态机 | resume 轨道 begin/claim/purge 函数（对齐 checkpoint 形制）+0091 purpose 接线+UI 翻（单份） | ①真删除断言：owner 视角 `resume`/`resume_profile`/derivative 行数=0（RLS 下 read=0）；②向量面：`vector_chunk` owner+`kind='memory'` 残留=0；③memory 三面：`memory_fact`/`memory_summary`/`memory_context_snapshot` 归零；④回执 200/202：0091 `privacy_record_deletion_receipt` local_erased 落账+幂等重放同回执；⑤负向：无授权 42501 fail-closed 红保留 |
| E2 interview 公开接线（走六门） | issuer HTTP 接线+外部 sink 确认执行器+INT 向量键 | 六门逐门证据（门2 vendor 级真删回执·门3 Qdrant recall=0+账本对齐）+P1-P7 pin 面翻新（`privacy-erasure:http:prove` 期望值整体改版为真删除断言族） |
| E3 全量聚合 | 跨轨道 sweep 聚合+孤儿检测+§4.2 缺口闭合 | 全 owner 跨存储矩阵归零（逐 sink 断言）+`user_memory` 正文回表=0+备份留存窗口披露落回执 |
| E4 文案退役 | P-09 四页+legal 常量+错误码退役 | 静态 pin（`privacy-erasure-preview.proof.ts:133-135` 同形制改钉「禁再出现未开放文案」）+docs:check |

**红线**：每子阶段独立 REQUEST→双审→EXEC→post-dual；E2 必须引用 INT01 六门合同逐门对账，未过门禁翻（隐私谎言禁令）。

### 4.2 UNSTUB-VOICE（P-01/P-03 · 二阶段列 P-02/P-13）

- **一阶段（P-01/P-03）**：①部署 `DASHSCOPE_TTS_API_KEY`/`DASHSCOPE_ASR_API_KEY`（per-capability·禁 legacy 宽 key）；②#69 服务端 consent 落账（`consent_record` 新 purpose+transcribe 前置 gate：无同意→403/404 fail-closed·幂等落账对齐 `privacy.service.ts:18-26` 形制）；③prove：fake seam 单测保留+**持钥环境 live e2e**——TTS 真返回音频流（非空 WAV 可解码·`audioBase64` 长度>0·播放头可起播）、ASR 真转写（固定样本音频→文本非空+`speakerAttribution='not_diarized'` 诚实标注 `interview-voice.ts:70`）、无同意负向红、`asr_down`/`tts` 降级路径仍可走（配置摘除再测 503 降级不死锁）。
- **二阶段（P-02/P-13）**：registry wired+流式适配器（cosyvoice WS）+PRD-TEST-006+真机起播验证+`ENABLE_STREAMING_TTS` 开关翻转 prove（流式失败回落非流式不静默卡死）。
- **红线**：禁无 #69 的 ASR 翻桩；禁只断言 HTTP 200 的假 prove（必须断言音频/文本本体）；live prove 只在协调方持钥环境跑（本环境零 live key 如实登记）。

### 4.3 UNSTUB-ACCOUNT（P-07）

- **范围**：①级联擦除面清单设计输入（全 owner 表×轨道矩阵：INT/RESUME/MEM/CTX/commerce 凭证/notification/audit+身份回收 token/pwd epoch/会话+终态匿名化 vs 物理删决策）；②实现（复用 E1-E3 聚合面+账户轨 begin 已有件）；③prove：全 owner 行数归零矩阵+consent 撤销+已发 token 失效（旧 refresh 401）+注销回执+幂等重放。
- **依赖**：UNSTUB-ERASE E1-E3（否则=假注销）。
- **红线**：级联面未定谳禁 UI 翻；禁「提交后人工处理」软话术。

### 4.4 扩充桩处置

- P-08 → ROUTE-DICT（已立项·EXTREV-0）；P-10 → UNSTUB-COMMERCE 或 scope-out ADR（商务前置·本战役须显式登记决策）；P-11 → G7/配置域刀；P-12 → 部署决策非刀（生产部署自然退役）。

---

## 5. 假可用红线重申（每桩翻桩前置条件一览）

| 桩 | 翻桩前置条件（条件未齐=禁翻） |
|---|---|
| P-01 TTS 批式 | key 部署+live 音频流 prove。无隐私红线。 |
| P-02 TTS 流式 | 适配器真实现+真机起播验证+registry wired。禁先开前端开关。 |
| P-03 ASR | key 部署+**#69 服务端 consent 落账**+live 转写 prove。 |
| P-04 简历单删 | E1 状态机+授权面+引用快照收口+外部 sink 回执+prove+双审。**503-pin 硬钉。** |
| P-05 全量删 | P-04 前置+跨存储 sweep+§4.2 闭合+孤儿检测。**预览 202 禁改生产完成态。** |
| P-06 面试擦除 | **INT01 六门逐门过**（ issuer/云端/向量键/开关/复证/四专家审）+§2b-0。 |
| P-07 注销 | 级联面定谳+ERASE E1-E3+身份回收+prove。 |
| P-09 回执披露 | 能力先行文案滞后（禁先改文案）。 |
| P-10 计费 | 商户合同+资金链路+e2e。**禁 mock 支付。** |
| P-11 OCR | 生产双旗决策+G7 收敛+（欠账）视觉 token ledger。 |
| P-12 预览写关 | 部署决策（=0 即退役）·非刀。 |
| P-13 流式 ASR | PRD-TEST-006+适配器+wired。 |

**总纲**：诚实 503→真实可用的唯一合法路径=「能力真建成→prove 真证据→双审真通过→文案真退役」；任何「先翻 UI 再补能力」「改返回码当可用」「mock 充 provider」均为假可用，比诚实 503 更糟（隐私谎言/资金谎言禁令）。

---

## 6. 维护规则

1. 新增用户可见「暂不可用/未开放」面时必须同步登记本清单（防清单腐化）；新增存储 sink 时按 inventory §6 同步。
2. 本清单行号基线 `b24143fc`；各翻桩刀 EXEC 前亲读复核（在飞刀行漂±）。
3. 翻桩完成后：对应桩行标记翻桩 commit+prove 收据链接；P-09 文案四页与 `legal.controller.ts` dataRights 常量在同一刀内收口，禁分刀留半。
4. 与在飞刀交叠：ROUTE-DICT（P-08/#133/#195）、CONSENT-AUDIT（#69/#81/#82·P-03 依赖 #69）、G7（P-11）——交叠面归先立项者，UNSTUB 各刀 §非范围 引先刀。

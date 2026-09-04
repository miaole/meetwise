---
id: uc_resume_ocr_binding
name: 简历 OCR 类型化 binding 与面试封存来源
description: MODEL-OP-01 窄切片：面试只消费经 typed operation binding 封存的 OCR 转写，禁止图内/面试路径临时调视觉模型；binding 缺失则 fail-closed；产物带模型/binding 出处，但不把转写当事实。
type: requirement
scope: shared
level: must
status: active
owner: architecture
related:
  - ./model-operation-routing.md
  - ./cend-resume.md
  - ../../architecture/ai/model-operation-routing.md
  - ../../delivery/production-readiness-remediation-register.md
---

# 简历 OCR typed binding 与面试封存来源（MODEL-OP-01 窄切片）

> **实现边界（诚实）：** 本用例覆盖「面试依赖密封 OCR」+ **预览版**图片转写可走通。精确双旗 `OCR_ENABLED=1` **且** `OCR_PREVIEW=1`，且非 `NODE_ENV=production` / `MODEL_COST_ENFORCEMENT=enforce` / `MEETWISE_PUBLIC_PREVIEW=1` 时，API 组合根可派发 `bindResumeOcr → visionOcr → invoke`，成功转写封存 provenance 并回灌 `ingestResume`，面试 `admitInterviewResume` 读 profile。这是**预览版能力落地**，不是生产 SLO、不是百炼视觉质量、不是唯一网关。生产/enforce/公开只读预览仍拒绝装配。失败不编造转写（schema/业务校验失败、供应商错误 → `ocr_failed` / release，零事实）。OCR 文本仍是不可信输入。密封 provenance 是身份标签，**不是**出站 host pin，也不是 invocation↔blob 哈希链。押题/诊断仍解密 blob。`pnpm model-op01:prove` 覆盖本地静态负向 + 预览组合根（stub fetch，无真实 Key）；RLS/ledger/并发仍走隔离 `ocr:prove`。`releaseEvidence=false`。

## 生成前门禁

- **任务范围：** `resume.ocr.v1` 必须先经 typed binding 才能进入 `visionOcr`/`invoke`；预览双旗打开后走通 bind → invoke → 密封 provenance → 面试 admit；生产锁与失败路径 fail-closed，不编造转写。
- **来源证据：** `UC-MODEL-ROUTE-01/02`、`architecture/ai/model-operation-routing.md` §OCR 行、`execution-master-checklist` `MODEL-OP-01`。
- **明确不做：** 打开生产 OCR / enforce / 公开只读预览写面、媒体预算/删除/合成 fixture 组合根、ASR/TTS/embedding/rerank 适配器、CI/CD、把 OCR 文本当简历事实或分数依据、宣称视觉质量 SLO。
- **领域对象：** `ModelOperationBinding`、`SealedOcrProvenance`、`ResumeProfile`（`needs_review`）、`InterviewResult`（只持「画像可用」布尔，不持 OCR 原文）。
- **状态机影响：** 不新增枚举。图片源 profile 仍落 `needs_review`。面试不因缺 binding 或 OCR 失败伪造 grounded 题。
- **接口契约影响：** 无新 HTTP。`visionOcr` 成功返回密封 provenance；失败原因为确定性 `ocr_*` / `model_operation_*` / `image_ocr_unavailable`。
- **数据库影响：** `resume.source_kind` 允许 `image`；`resume_profile.ocr_binding`（迁移 0127。`0124`/`0125` 已在 main；开放 PR #74=0126，不得改号）存无 PII/无原文的 binding 快照。OCR 恢复密文仍只活在 `resume_ocr_artifact`。`releaseEvidence=false`。
- **测试计划：** 七类 TC 见下。本地 `pnpm model-op01:prove`（无真实 Key）断言零外呼负向、预览组合根可派发、失败不编造。E2 并发槽、E3 RLS、E4 ledger 沿用既有 `ocr:prove` / invocation 围栏（Docker Postgres）。
- **验证命令：** `pnpm model-op01:prove`；可选隔离 `pnpm ocr:prove`。

## 领域对象

- `SealedOcrProvenance`：`operationId + registryVersion + endpointProfileId + modelOrRecipe + mediaDigest + admissionKey`。禁止 `text`/`prompt`/`apiKey`/`url` 字段。
- `InterviewResumeAdmission`：`admitted | ocr_binding_missing | ocr_binding_invalid | ocr_ad_hoc_forbidden`。失败时 `resumeProfileAvailable=false`。

## UC-MODEL-OCR-01 · 面试只消费密封 OCR，禁止临时视觉调用

- **角色 Actor：** 候选人、简历摄取、模型路由器、自适应面试图。
- **前置 Precondition：** registry 冻结 `resume.ocr.v1`（`vision-ocr`、北京 profile、`maxDispatches=1`）；调用方只持图片字节 digest 与业务 revision，不持 raw prompt / provider URL。
- **触发 Trigger：** 图片简历要转写，或面试图要决定是否使用 OCR 源画像。
- **主流程 Main：**
  1. OCR 路径用图片 digest 构造 typed `vision-ocr` 输入，服务端 `resolveModelOperationBinding('resume.ocr.v1')`；未知字段、raw prompt、provider URL、自由 profile 立即拒绝，供应商调用=0。
  2. 仅当 binding `wired=true` 且媒体为 `data:` URI 时才进入 `invoke()`；成功转写与 `ai_model_invocation=succeeded` 同事务落加密恢复工件，并封存 `SealedOcrProvenance`。
  3. 转写回灌 `ingestResume`；无有效事实则退 OCR 费并删工件。有事实则 profile=`needs_review`，`source_kind=image`，写入 provenance（无原文）。
  4. 面试 start/resume 读 `source_kind + ocr_binding + profile.facts`，不解密原文；缺 `source_kind` 不得默认 `text`。文本/PDF 无 binding 即可授权「画像可用」；图片源必须通过密封 provenance，否则画像不可用。图节点只得布尔，不得把图片或 OCR 原文送进出题模型。
- **备选流 Alternate：** 文本/PDF 简历不走 OCR，禁止挂伪造 OCR provenance。缺双旗、或生产/enforce/公开只读预览 → API 入口 422 `image_ocr_unavailable`，不 reserve、不调用。预览双旗打开后走 UC-MODEL-OCR-02。
- **异常流 Exception：**
  - **E1 重复：** 同图 HMAC `ocr:<digest>` 只读既有 attempt/工件；面试重放不重调视觉。机制：幂等键 + registry `businessRevision`。
  - **E2 并发：** 同 digest 并发只一胜；失败者零外呼。机制：既有 invocation 唯一键 / advisory lock（本切片不重开槽证明）。
  - **E3 越权：** 跨 owner 读 `ocr_binding`/工件 = 0 行。机制：既有 RLS principal（本切片单元只证伪造/缺 binding 不能授权画像）。
  - **E4 失败回滚/退款：** binding 拒绝、URL 媒体、digest 错配均不占槽、不扣费。OCR 文本 HMAC 去重命中既有 text/pdf（或另一张图）时 release 本图预留，不 confirm。机制：派发前确定性失败 + `known_not_sent`；计费行级仍由 `ocr:prove` 覆盖。
  - **E5 降级：** binding 缺失/未接线/伪造 → 面试 `resumeProfileAvailable=false`，出题降为非 grounded，**绝不**在图内补一次视觉/LLM OCR。机制：registry `fallbackAction=manual_text_entry` + 面试授权门。
  - **E6 超时/断线：** 派发前取消零外呼；派发后 unknown，同键不重发。机制：`UC-MODEL-001`。
- **后置 Postcondition：** 每次可外发 OCR 带 registry 身份封印（非 invocation 回执）；面试无视觉调用账本；OCR 原文不进 trace/checkpoint。
- **验收 Acceptance：** 未登记/未接线/缺 binding/伪造 provenance/provider URL/未知字段/raw prompt 的视觉外呼=0；图片源无 provenance 时 grounded 题=0；provenance 含 `resume.ocr.v1` + 固定 profile + `modelOrRecipe`，不含原文/Key。
- **关联：** `UC-MODEL-ROUTE-01`、`UC-RES-003`、CAS/幂等/RLS、`structured-output-and-safety`（模型输出双校验，不信任转写）。
- **七类覆盖：** 正/异/特/逃/并/复/刁。

### 测试用例

| TC | 层 | 断言 |
| --- | --- | --- |
| `TC-MODEL-OCR-01-main` | 单元 | 合法 typed 输入 → 冻结 binding + provenance（operation/profile/modelOrRecipe/mediaDigest）。 |
| `TC-MODEL-OCR-01-E1` | 既有 `ocr:prove`（不在 `model-op01:prove`） | 同 digest 重传视觉调用增量=0。 |
| `TC-MODEL-OCR-01-E2` | 既有 invocation 围栏（不在 `model-op01:prove`） | 同键并发恰 1 派发；本切片不重开 slot。 |
| `TC-MODEL-OCR-01-E3` | 单元 | 伪造/缺 binding 不能把图片源授权为面试画像；跨 owner 0 行沿用既有 resume RLS，本门不重跑。 |
| `TC-MODEL-OCR-01-E4` | 单元 | 未知 operation / 未接线 / URL 媒体 / digest 错配 → 零 invoke、零 claim。 |
| `TC-MODEL-OCR-01-E5` | 单元+graph 源扫描 | 图片源缺 binding → `resumeProfileAvailable=false`；worker/graphs 源码零 `visionOcr`。 |
| `TC-MODEL-OCR-01-E6` | 既有 invoke 合同（不在 `model-op01:prove`） | 派发后 unknown 不换模型；本切片不改该状态机。 |
| `TC-MODEL-OCR-01-特` | 单元 | 文本简历挂 OCR provenance → 拒绝；embedding 等 unwired kind 不能冒充 OCR。 |
| `TC-MODEL-OCR-01-逃` | API 组合根 | 仅 `OCR_ENABLED=1`、生产/enforce、或 `MEETWISE_PUBLIC_PREVIEW=1` 仍拒绝装配；typed binding 存在也不开生产视觉。 |
| `TC-MODEL-OCR-01-刁` | 单元 | raw prompt / 自由 profile / `https://` 媒体 / provenance 夹带 `text`/`apiKey` 一律拒绝。 |

> 钱/状态/隔离的并发与退费已由 `ocr:prove` + `model-op00:prove` 覆盖。浏览器 E2E 真视觉质量仍未做，不得用 stub fetch 宣称 SLO。

## UC-MODEL-OCR-02 · 预览版图片 OCR 走通（非生产 SLO）

- **角色 Actor：** 候选人（预览/非生产环境）、简历摄取、模型路由器、自适应面试图。
- **前置 Precondition：** 组合根传入的 env snapshot（`createOcrVisionClient(env)` / `isOcrFeatureEnabled(env)`）为 `OCR_ENABLED=1` 且 `OCR_PREVIEW=1`，且该 snapshot 非 `NODE_ENV=production` / `MODEL_COST_ENFORCEMENT=enforce` / `MEETWISE_PUBLIC_PREVIEW=1`。现场无参工厂仍读 `process.env`。进程级 dotenv `MODEL_COST_ENFORCEMENT=enforce` 不得否决已通过预览锁的 observe snapshot。视觉 Key 走 `DASHSCOPE_VISION_API_KEY`；registry `resume.ocr.v1` wired。
- **触发 Trigger：** 预览环境上传图片简历。
- **主流程 Main：**
  1. `isOcrFeatureEnabled` 为真 → 进入 `uploadImageViaOcr`；组合根装配可派发的 vision client（专用 profile，非文本 Key）。
  2. `bindResumeOcr(sha256(payload))` 解析冻结 identity；`visionOcr` 仅接受 `data:` URI，幂等键必须 `ocr:<digest>`，然后 `invoke()`。
  3. 成功转写经 schema + `MIN_OCR_CHARS` 业务校验；封存 `SealedOcrProvenance`；回灌 `ingestResume`；有事实则 `source_kind=image`、`ocr_binding` 写入、profile=`needs_review`、confirm 额度。
  4. 面试 start 读 `source_kind + ocr_binding + facts`，`admitInterviewResume` 通过则画像可用；worker/图零 `visionOcr`。
- **备选流 Alternate：** 同图 HMAC 命中加密工件 → 不重调视觉，仍须 reseal binding。文本 HMAC 去重到非本图 → release 不 confirm。
- **异常流 Exception：**
  - **E1 重复：** 同 digest 只一 attempt。机制：幂等键。
  - **E2 并发：** 同键恰一胜。机制：invocation 唯一键（`ocr:prove`）。
  - **E3 越权：** 跨 owner 0 行。机制：RLS。
  - **E4 失败回滚：** 供应商错误 / schema 失败 / 过短转写 / 无事实 → `ocr_failed` 或 `ocr_no_content`，**不编造文本或 facts**，release 额度。机制：确定性失败 + 账本 release。
  - **E5 降级：** 缺双旗 / 生产锁 / 公开只读预览 → 422 `image_ocr_unavailable`，零 reserve。机制：组合根 + 服务入口双闸。
  - **E6 超时/unknown：** 派发后不换模型、不 invent。机制：`UC-MODEL-001`。
- **后置 Postcondition：** 预览成功：`ingested` + `ocr_binding` + 额度 confirmed。失败：无画像、额度 released。生产锁下零派发。
- **验收 Acceptance：** 预览双旗 + stub/scripted 模型可得到密封 provenance 与非空 facts；生产/缺 `OCR_PREVIEW` 装配拒绝；失败路径 `text`/`facts` 不被合成；`releaseEvidence=false`。
- **关联：** `UC-MODEL-OCR-01`、`UC-RES-003`、CAS/幂等/RLS。
- **七类覆盖：** 正/异/特/逃/并/复/刁。

### 测试用例（预览组合根）

| TC | 层 | 断言 |
| --- | --- | --- |
| `TC-MODEL-OCR-02-main` | API 组合根 | 双旗 + 非生产 observe：client 可 `complete` 并解析 `{text}`（stub fetch，非视觉质量）。 |
| `TC-MODEL-OCR-02-E4` | API 组合根 | 供应商抛错 → `ok=false` / `unknown`，无发明 `raw.text`。 |
| `TC-MODEL-OCR-02-E5` | API 组合根 | 生产/enforce/公开预览/缺 `OCR_PREVIEW` → `ocr_model_operation_unconfigured`。 |
| `TC-MODEL-OCR-02-特` | API 组合根 | `OCR_ENABLED=true` 或 `OCR_PREVIEW=true` 不能打开。 |
| `TC-MODEL-OCR-02-逃` | API 组合根 | 禁用态 `requireBoundOperation` 仍零 fetch。 |
| `TC-MODEL-OCR-02-刁` | API 组合根 | 空 `{text:""}` 原样交给上层业务校验，client 不补事实。 |
| `TC-MODEL-OCR-02-ambient` | API 组合根 | `process.env.MODEL_COST_ENFORCEMENT=enforce` + 预览 `cfg.env` observe 仍派发 stub fetch（dotenv 隔离）。 |
| `TC-MODEL-OCR-02-omit` | ai-runtime unit | 省略 `cfg.env` 仍尊重 process.env enforce / `NODE_ENV=production`；部分或 blank/`undefined` 围栏键继承进程锁；`cfg.env` enforce 在进程 observe 下仍拒未绑定 client。 |
| `TC-MODEL-OCR-02-E1/E2/E3` | 既有 `ocr:prove`（Docker） | 幂等/并发/RLS 不在本静态门重开。 |

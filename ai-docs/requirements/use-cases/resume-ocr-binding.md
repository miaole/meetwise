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

> **实现边界（诚实）：** 本用例只关闭「面试依赖密封 OCR、禁止临时视觉/LLM 转写、binding 缺失零外呼、出处为身份标签」。它**不**启用生产 `OCR_ENABLED=1`，不声称语音/embedding/rerank 已接线，不声称唯一网关或发布证据。OCR 文本仍是不可信输入，必须回灌 `ingestResume`（注入清洗 + PII 脱敏 + 结构化）；出处元数据只证明「哪条 registry binding / 哪档模型配方」产出了转写，不证明转写为真，也不是 invocation 回执。密封 provenance 是身份标签，**不是**出站 host pin，也不是 invocation↔blob 哈希链。押题/诊断仍解密 blob，不在本切片加 OCR 授权门。`pnpm model-op01:prove` 只覆盖本地静态负向（零 invoke / 画像不可用 / 组合根 kill-switch），不重跑 RLS、ledger 或并发槽。

## 生成前门禁

- **任务范围：** `resume.ocr.v1` 必须先经 typed binding 才能进入 `visionOcr`/`invoke`；面试只读已摄取画像 + 密封 provenance；binding 缺失/伪造/未接线 → 零视觉外呼、画像不可用。
- **来源证据：** `UC-MODEL-ROUTE-01/02`、`architecture/ai/model-operation-routing.md` §OCR 行、`execution-master-checklist` `MODEL-OP-01`。
- **明确不做：** 打开生产 OCR、媒体预算/删除/合成 fixture 组合根、ASR/TTS/embedding/rerank 适配器、CI/CD、把 OCR 文本当简历事实或分数依据。
- **领域对象：** `ModelOperationBinding`、`SealedOcrProvenance`、`ResumeProfile`（`needs_review`）、`InterviewResult`（只持「画像可用」布尔，不持 OCR 原文）。
- **状态机影响：** 不新增枚举。图片源 profile 仍落 `needs_review`。面试不因缺 binding 伪造 grounded 题。
- **接口契约影响：** 无新 HTTP。`visionOcr` 成功返回密封 provenance；失败原因为确定性 `ocr_*` / `model_operation_*`。
- **数据库影响：** `resume.source_kind` 允许 `image`；`resume_profile.ocr_binding`（迁移 0127。`0124_rag_retrieval_acl_fail_closed` 与 `0125_memory_vector_chunk_erasure` 已在 main；开放 PR #74=0126，不得改号）存无 PII/无原文的 binding 快照。OCR 恢复密文仍只活在 `resume_ocr_artifact`。`releaseEvidence=false`。
- **测试计划：** 七类 TC 见下。本地 `pnpm model-op01:prove`（无网络、无真实 Key）只断言本切片新增的零外呼/画像不可用/组合根拒绝。E2 并发槽、E3 RLS、E4 ledger 沿用既有 `ocr:prove` / invocation 围栏，不记入本门。
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
- **备选流 Alternate：** 文本/PDF 简历不走 OCR，禁止挂伪造 OCR provenance。生产 `OCR_ENABLED≠1` 时 API 入口仍 422，不 reserve、不调用。
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
| `TC-MODEL-OCR-01-逃` | API 组合根 | `OCR_ENABLED=1` 仍拒绝装配（typed binding 存在也不开）；生产视觉不因本切片复活。 |
| `TC-MODEL-OCR-01-刁` | 单元 | raw prompt / 自由 profile / `https://` 媒体 / provenance 夹带 `text`/`apiKey` 一律拒绝。 |

> 钱/状态/隔离的并发与退费已由 `ocr:prove` + `model-op00:prove` 覆盖。本切片新增的负向以「零外呼 / 画像不可用」为主；浏览器 E2E OCR 仍被生产 kill-switch 阻断，不得用 mock 宣称视觉质量。

---
id: delivery_e2e_platform_integration
name: E2E 平台集成分支（#55–#64）
description: feature/e2e-platform-integration 的核实合并顺序、冲突决议与 supersession。draft / 非 READY；releaseEvidence=false。
type: plan
scope: shared
level: guide
status: draft
owner: qa
version: 1
related:
  - ../skills/testing/fail-closed-gate.md
  - ../skills/testing/sop.md
  - ../meta/index.md
---

# E2E 平台集成分支

单分支 `feature/e2e-platform-integration` 对 `main` 开 **draft** PR，收纳草稿 PR #55–#64。**不标 READY。** `releaseEvidence=false`。AI 产物默认不可信；收束只走 [fail-closed 门](../skills/testing/fail-closed-gate.md)。

本文件记录**实际落地的合并顺序与决议**，不是愿望清单。与代码或 `package.json` 脚本不一致时，以本文件加当前树为准，并立刻改文档，禁止留 follow-up。

## 核实后的合并顺序

建议顺序经各 PR 的 merge-base / 文件重叠核实后**未改序**：

| 序 | PR | 头分支 | 相对当时 #55 母线的 fork | 本集成采取 |
| --- | --- | --- | --- | --- |
| 1 | #55 母线 | `feature/e2e-testing-skills` @ `dbcc310` | — | 作为 integration 起点（已含 generation-trust、e2e-platform SOP、fail-closed） |
| 2 | #58 | `cursor/harden-regression-entrypoint-61d4` | 旧于母线 tip（约 `b7b078c`） | 已 merge：车道合同 + review/verify；保留母线 `generation-trust:prove` / `e2e-platform:prove` / `--claim-done` 禁令 |
| 3 | #57 | `cursor/align-testing-docs-e2e-f3ba` | 旧于母线 tip（约 `b7b078c`） | 已 merge：HTTP 主层 / Playwright 次层；`ai-generated-review.md` 收成 fail-closed 指针 |
| 4 | #59 | `cursor/golden-tasks-registry-71ea` | 约 `b7b078c` | 已 merge：`golden-tasks:prove` 进 always-on；GT-01..04 禁止 `mapped` |
| 5 | #56 | `cursor/harden-e2e-auth-commerce-0f82` | 约 `b7b078c` | 已 merge：auth/commerce helper 合同 + mock fetch prove；保留母线 `classifyFailure` |
| 6 | #60 | `cursor/e2e-interview-provenance-526a` | 约 `b7b078c` | 已 merge：规范 questionId + 拒绝伪造分；保留 #56 commerce prove 与母线 golden covering 诚实句 |
| 7 | #61 | `cursor/e2e-failure-class-ledger-e5f7` | 约 `b7b078c` | 已 merge：封闭 `E2E_FAILURE`/`E2E_REVIEW` 账本；不回退 #56 auth 或 #60 identity |
| 8 | #62 | `cursor/e2e-directory-contract-07f9` | 约 `b7b078c` | 已 merge：可执行目录契约 + planted-violation；母线 SOP 仍是叙事源；脚本不与 5 守卫 `prove` 对调 |
| 9 | #63 | `cursor/e2e-static-guards-b01f` | 约 `6530171` | 已 merge：假服务共享列表 + 密钥扫描失败即关 + unverified AI path；不回退 #61 ledger / #60 identity / Key trim |
| 10 | #64 | `cursor/e2e-parity-baseline-f563` | 已基于 `dbcc310` | 已 merge：parity floors + allowlist；不回退 always-on 车道合同，不把 parity 绿写成审核 |

未改序原因：#58 改回归入口合同，后续 PR 往 always-on 挂门；#57 只对齐文档分层；#59 收紧 golden 登记；#56/#60/#61 依次加厚 helper；#62/#63/#64 加目录/静态/parity 守卫。

## 冲突决议（已发生）

### #58

- `scripts/run-post-change-regression.mjs`：采用 #58 的 always-on → `--core` → `--live`、`--dry-run`、可选静态守卫、`REGRESSION_REVIEW_VERIFY_GATE`。**并入**母线 `ALWAYS_ON_REQUIRED` 的 `generation-trust:prove`、`e2e-platform:prove`，以及 `--claim-done` / `--ready` / `--done` → `regression_claim_done_forbidden`。摘要保留 `claimDone: false`、`readyFromUnreviewedGeneration`。
- 技能文档：保留 fail-closed / SOP / e2e-platform 链接，并写入 #58 要求的 `review/verify`、`automation does not trust AI outputs`、`multi-round allowed`。
- `provider-egress-inventory`：同时登记 `run-post-change-regression.mjs` 与 `.proof.mjs`；本集成再登记 #62/#63 的 `e2e-fake-service-flags.mjs` / `e2e-static-guards*.mjs` / `review-loop.mjs`，以及 #67 `native-fail-closed.proof.ts`。`environmentReferenceCount` 随清单长度更新（当前 **208**），禁止手改成旧数。

### #61

- 采用 #61 的 `failure-class.mjs` / `failure.ts` 与 runner `tagE2EFailure`，但 **不**把 `signupOrLogin` / `uidFromToken` / `questionIdentity` 退回旧实现。
- helper prove 保留 #56/#60 合同，追加 ledger / opaque_pass 用例。
- `INTERVIEW_TERMINALS` 含 `error`（#61 AI/system 终态）；证明数组同步更新。
- 回归脚本保持 #58 车道合同，拒绝 #61 旧 `ALWAYS_ON` 回退。

### #60

- helper prove 并入 provenance / forged-score 用例，同时保留 #56 的 commerce/auth mock 合同。
- `questionIdentity` 采用规范 `q-v{n}-t{n}-c{n}`；`q-ready` 视为伪造。
- `ai-provenance.md` 保留 #59 的 covering 诚实句，并入 #60 的 SSE/conclude P0。

### #56

- `full.e2e.ts` 保留母线 `classifyFailure`，采用 #56 的 `isWebhookCreditResult` / `postPayWebhook`。
- helper prove 并入 mock fetch + `signToken` 合同；母线 resume / 失败分类用例改为 `await test`，避免异步 wrapper 漏计。

### #59

- `golden-tasks:prove` 加入 `ALWAYS_ON_REQUIRED`，与 `generation-trust:prove` / `e2e-platform:prove` 并存。
- 诚实规则并入：`relatedCommands` 不是 covering；GT-01..04（`subject=ai-output`）禁止 `mapped`。
- 丢弃 #59 对回归脚本的旧 `ALWAYS_ON` 数组回退。

### #64

- 采用 `scripts/e2e-parity-check.mjs` / `.proof.mjs` 与 `ai-docs/testing/e2e-parity-baseline.{md,json}` + allowlist。
- **不**把回归入口退回旧 `ALWAYS_ON` 数组。parity 两门挂进现有 `ALWAYS_ON_REQUIRED`。
- 文档并集：fail-closed / SOP / honesty / AGENTS 写入 `e2e-parity:check` 与 `parity floors`；作者改 allowlist 不算自签审核。
- CI `verify` 追加 parity check/prove；不加新的云部署 job。
- 集成后 helper/场景增长只能**抬高** floors 或写可审 allowlist 负 delta，禁止下调地板假装从来没有。本合并把 floors 从 22/155 抬到 48/367（含已替换旧身份，含回执 `SOURCE_PATHS` 从 13 增到 15）；effective floors = 当前扫描 37/342。替换旧 conditionDigest 的条目写入 allowlist，原因写清是鉴权/出处/账本/回执覆盖合同变更，不是 AI self-approval。

### #63

- 采用 `scripts/e2e-fake-service-flags.mjs`、`scripts/e2e-static-guards.mjs` / `.proof.mjs`，以及 runner 对 `assertNoFakeServiceFlags` 的真实 import+call。
- **不**把 runner 退回 `new Error(...)` 或无 trim 的 `MODEL_API_KEY` 检查。隔离码保持 `e2e_isolation_required` / `e2e_ui_isolation_required` / `performance_e2e_isolation_required`，经 `tagE2EFailure` 入账。
- 母线 5 守卫仍要在 runner 源码里看见 `VOICE_FAKE` / `OCR_FAKE` / `E2E_FAKE_MODEL` 与 `fake_service_mode_forbidden`，因此保留内联三旗标检查，同时调用共享列表（扩展 ASR/TTS/embed/rerank/transport overrides）。
- 文档并集：保留 fail-closed / review/verify / HTTP 主层，并写入 `unverified AI path`、`失败即关`、`e2e-static-guards`。
- `ALWAYS_ON_REQUIRED` 与 CI `verify` 追加 `e2e-static-guards:check` / `prove`；不加新的云部署 job。
- 不削弱 `questionIdentity` 规范 id，也不把 `scorelessBound` 从 `assessment_unavailable && score === null` 改成伪造 0 分。

### #62

- 采用 #62 的 `check.mjs` / `core-boundaries.mjs` / `trust-guard.mjs` / `review-loop.mjs` / `review-record.mjs` / `e2e-platform.proof.mjs` 与 `testing/conventions/e2e-directory-contract.md`。
- **不**把 `e2e-platform:prove` 改指 `e2e-platform.proof.mjs`。母线 `prove.mjs` 仍是 5 条命名守卫；种植违规入口是 `e2e-platform:layout:prove`。
- `directory-contract.mjs` 以 #62 可执行布局为准，并入母线已有 helpers（`resume.ts`、`classify-failure.ts`、`failure.ts`、`failure-class.mjs`）。`.mjs` helper 合法；场景仍不得进 `helpers/`。
- 保留母线「`e2e/full.e2e.ts` 必须 import `helpers/resume.ts`」与「helpers 不得 import `apps/web` / `apps/api`」。
- 技能文档（`SKILL.md` / SOP / fail-closed / e2e-platform 叙事）以母线为源，只补 check / prove / layout:prove 映射，不另开第二套 P0。
- `ALWAYS_ON_REQUIRED` 在原有 `e2e-platform:prove` 旁加上 `e2e-platform:check` 与 `e2e-platform:layout:prove`。`loop` 不进 always-on。
- CI `verify` 同一步跑 check + prove + layout:prove；不加新的云部署 job。
- #61 把 runner 隔离码收成短码 `isolation_required` 后，5 守卫扫不到 `e2e_*_isolation_required`。本合并把三个 runner 的 `tagE2EFailure` 码恢复为 `e2e_isolation_required` / `e2e_ui_isolation_required` / `performance_e2e_isolation_required`，与 `failure-class.mjs` 映射和 `classify-failure.ts` 一致。
- helper prove 已改 `await test(`；`baseline.json` 地板改为 `^(?:await )?test\\(`，min 仍 9，不降。

### #57

- P0 公式只在 `skills/testing/fail-closed-gate.md`。`rules/global/ai-generated-review.md` **降为指针**（不得默认信任 / 审核 / 验证 / 多轮门禁 / 自动化仍在文中，供 `docs:check`），不再复制第二套 close 句。
- 保留 HTTP isolated E2E 主层、Playwright UI 次层、`testing/conventions/test-authoring.md`。
- 入口文档（`AGENTS.md` / `CLAUDE.md` / `meta/index.md` / `task-sop`）同时指向 SOP + fail-closed，并保留 authoring / 主次层用语。

## 重复文档处理

| 来源 | 处理 |
| --- | --- |
| #57 `ai-generated-review.md` 与 #55 `fail-closed-gate.md` 两套 P0 | 只保留 fail-closed 为收束公式；前者改指针 |
| 各 PR 各自重写 `SKILL.md` / `run-gates.md` / `check-docs.mjs` | 并集：母线文件清单 + 后来 PR 的新术语/新文件 |
| #62 目录合同 vs 母线 `skills/testing/e2e-platform/` | 母线 SOP 为叙事源；可执行布局锁在 `testing/conventions/e2e-directory-contract.md` + `scripts/e2e-platform/check.mjs`；不复制第三套目录故事 |

## 源 PR 处置

#55–#64 保持 **draft**，不在本集成里标 READY。本 PR **supersede** 它们作为对 `main` 的合入口；源 PR 可继续停留在 `feature/e2e-testing-skills` 上，直到本集成合并后关闭。

## 当前 always-on（随代码更新）

`scripts/run-post-change-regression.mjs` 的 `ALWAYS_ON_REQUIRED`：

`docs:check` · `generation-trust:prove` · `golden-tasks:check` · `golden-tasks:prove` · `e2e-platform:check` · `e2e-platform:prove` · `e2e-platform:layout:prove` · `e2e-helpers:prove` · `e2e-receipt:prove` · `e2e-runner:prove` · `e2e-static-guards:check` · `e2e-static-guards:prove` · `e2e-parity:check` · `e2e-parity:prove` · `arch` · `api:smoke`

脚本映射（禁止对调）：`e2e-platform:check` → `scripts/e2e-platform/check.mjs`；`e2e-platform:prove` → `scripts/e2e-platform/prove.mjs`（5 命名守卫）；`e2e-platform:layout:prove` → `scripts/e2e-platform/e2e-platform.proof.mjs`（种植违规）；`e2e-platform:loop` → `scripts/e2e-platform/review-loop.mjs`（`test` 步仍是 `prove`，不是 `layout:prove`）。

可选（`package.json` 有脚本才挂）：`public-text-policy:prove` · `quality:traceability:prove` · `provider-egress:prove` · `public-preview-write:prove` · `public-preview-write-gate:prove` · `interview-answer-submission:prove` · `adaptive-length:prove` · `scor-00-honesty:prove` · `model-op01:prove` · `interview-dispatch:unit:prove` · `privacy-erasure-preview:domain:prove` · `privacy-erasure-preview:contract:prove` · `adaptive-signals:prove` · `adaptive-signals-graph:prove` · `interview-voice-seams:prove` · `native-fail-closed:prove` · `question-generation-fail-closed:prove`。

## 相对最新 main 的叠底（#65 + #68 + #69 + #71 + #70 + #66 + #73 + #74 + #75 + #77 + #82 + #72 + #79 + #83 + #67）

本分支已叠到 `origin/main` @ `3d88cb6`（#68 → #65 → #69 → #71 → #70 `0125` → #66 覆盖驱动软预算 → #73 `SCOR-00H` → #74 `0126` 答题双写互斥 → #75 `0127` 预览 OCR binding → #77 `0128` 面试公平调度 → #82 `0129` 隐私删除预览 → #72 `0130` SIGNAL-01 → #79 预览批量 ASR/TTS → #83 预览 `/resume` 图片入口 → #67 出题/原生 fail-closed）。`package.json` / `run-e2e-isolated.mjs` 自动并集（保留 `tagE2EFailure` / `assertNoFakeServiceFlags` / `VOICE_FAKE`+`ASR_FAKE`+`TTS_FAKE`+`OCR_FAKE`）；`ci.yml` / `check-docs.mjs` / `current-runtime-truth.md` 按并集解。迁移计数仍为经 `0130` 共 130（#67 / #83 / #79 无新迁移）。#67 / #83 / #79 / #72 / #82 / #77 / #75 / #74 / #73 / #66 / #70 是 main 上已合并的独立切片，**不是**本 PR 的 supersede 对象；本 PR 只 supersede #55–#64。

| 来源 | 必须保留 |
| --- | --- |
| 本集成 | `ALWAYS_ON_REQUIRED` 16 项；平台三入口不可对调；parity / static-guards / fail-closed |
| #65 | C 端 `issued_turns`=`status<>'cancelled'`；`Overview.answered`=`iq.status='answered'`；禁止 ScoreCard 空集伪装成 0 |
| #68 | `assertPublicPreviewWritesClosed`；CI `public-preview-write:*`；可选 always-on 挂 `public-preview-write:prove` / `public-preview-write-gate:prove` |
| #69 | 公开 `DELETE /privacy/interview-data/:id` 仍 `503 interview_erasure_authorization_not_available`；无公开 `/answers`；`interview-answer-submission:prove` 冻结 submission/receipt 合同且不进 OpenAPI；签发器/0091 账本 ≠ 删除已开放；预览 `/turn` 503 不是隐私 DELETE 503，也不关闭 `INT-P0-RAW-QUEUE` |
| #71 | `0124_rag_retrieval_acl_fail_closed.sql` 空 principal → `rag_acl_principal_missing`；QBank definer 闭包 31 函数 / 15 表 / 2 视图已密封；域 `rag-retrieval-acl.ts` 是未接线合同，不是 routed serving 或发布证据；不重开公开删除、不新增 `/answers` |
| #70 | `0125_memory_vector_chunk_erasure.sql` 把 `vector_chunk.kind='memory'` 纳入账户回执；sink 盘点在 `privacy-deletion-sink-inventory.md`；一份 request `completed` ≠ 账户删除完成；公开 DELETE 仍 503；不删 `kind='qbank'` |
| #66 | 停续由 `decideNext` 覆盖/证据/空转/加深决定，不是 `turn≥N`；软预算可上调；`absoluteMaxTurns` 默认 120 只防 runaway（60/90/120 档，不是分钟 blueprint）；`MAX_TURN=256` 是 API 刷号护栏；`issued_turns` / `Overview.answered` 谓词不得被长度政策改写；`INT-LONG-INTERVIEW-01` 仍未完成；可选 always-on 挂 `adaptive-length:prove` |
| #73 | `SCOR-00H` 域闸 `isTrustedScoreIdentity` / `requireTrustedPracticeOverall` / `refuseMappedBSideScore`；转写不读 `payload.score`；空评估 `409 no_scorable_cards`；缺 overall career `409 insufficient_evidence`；GET 读路径不重跑该闸；worker 仍可读 event `.score` hint；不伪造 0 分；可选 always-on 挂 `scor-00-honesty:prove`；不得改写 `issued_turns` / `scorelessBound` |
| #74 | `0126_interview_answer_dual_write_fence.sql` 答题双写互斥：同一身份禁止 ledger artifact 与带顶层 `answer` 键的 legacy job 并存；`interview_event` 拒顶层 `answer`；码为 `interview_answer_legacy_plaintext_fenced` / `interview_answer_ledger_dual_write_fenced` / `interview_event_raw_answer_fenced`。`/turn` 无 ledger 时仍写明文；`submitInterviewAnswer` 不是生产 HTTP；**不是** `INT-TRANSCRIPT-01`。隔离 prove `int-answer-dual-write-fence:prove` 需 Docker，**不进** always-on / `OPTIONAL_ALWAYS_ON`。不重开公开删除、不新增生产 `/answers` |
| #75 | `0127_resume_ocr_binding_provenance.sql` 预览 OCR binding：`resume.ocr.v1` typed seam + `SealedOcrProvenance`；精确双旗 `OCR_ENABLED=1` **且** `OCR_PREVIEW=1` 才可 invoke；生产 / enforce / `MEETWISE_PUBLIC_PREVIEW=1` 仍拒；失败不编造转写；面试 `admitInterviewResume` 不解密原文。**不是** `MODEL-OP-01` 关闭，不是视觉质量 SLO。可选 always-on 挂静态 `model-op01:prove`；隔离 `ocr:prove` 需远程/CI Postgres，**不进** always-on |
| #77 | `0128_interview_dispatch_fairness.sql` 面试公平调度：`gateway_dispatch_owners` 按最老等待 owner 排序；tick 量子轮转 `fairDrainInterviewOwners`，不再抽干单 owner；每 owner 未过期 `running` cap 默认 1；进程内 `WORKER_INTERVIEW_GLOBAL_INFLIGHT` 默认 4 **不是**集群锁；`idle`=claim null，隐私归还/丢租约/graph fence/`markDone` CAS=0 为 `retry`。押题/诊断/报告仍抽干。可选 always-on 挂静态 `interview-dispatch:unit:prove`；隔离 `interview-dispatch:prove` 需远程 Postgres，**不进** always-on。不是延迟/容量 SLO |
| #82 | `0129_privacy_erasure_preview_path.sql` 预览删除路径：`POST/GET /privacy/erasure-preview`；登录令牌只开预览账本；回执 `preview_incomplete` / `productionSloClaimed=false`；`completed` 禁止。生产 `DELETE /privacy/interview-data/:id` 与 `DELETE /privacy/resume-data` 仍 503。可选 always-on 挂静态 `privacy-erasure-preview:domain:prove` / `privacy-erasure-preview:contract:prove`；隔离 `privacy-erasure-preview:prove` 需远程 Postgres，**不进** always-on。不是跨存储删除 SLO |
| #72 | `0130_model_invocation_same_key_claim_join.sql` + SIGNAL-01 控制流 hook：`observeInterviewSignals` + `decideNext` 可结论 `early_weak` / `thrashing`；图 `decide` 把 `concludeReason` 写成 write-only `DecisionProvenance`；worker/SSE/report **不读**。不是 ScoreCard、B 端 band、SSE/UI、`INT-LEVEL-01`，也不是产品硬顶 8 轮。可选 always-on 挂静态 `adaptive-signals:prove` / `adaptive-signals-graph:prove`。不把 main 较弱的 runner（无 `tagE2EFailure` / 无假服务列表 / 弱 Key trim）覆盖本集成 |
| #79 | 预览批量 ASR/TTS：`createInterviewVoiceSeams` 仅在 `voice.asr.v1` / `voice.tts.v1` wired **且**独立能力 Key 存在时构造适配器；缺 Key/超时/畸形 fail-closed，不编造转写或音频。`/speak/stream` 在 `streamTts` disabled 时 503。无新迁移。Live E2E 仍拒 `VOICE_FAKE` / `ASR_FAKE` / `TTS_FAKE`。可选 always-on 挂静态 `interview-voice-seams:prove`。不是生产 SLO、全双工或 MODEL-OP-02 |
| #83 | Web `/resume` 预览图片入口：`isOcrPreviewEnabled` 精确双旗 `OCR_ENABLED=1` **且** `OCR_PREVIEW=1`；生产/enforce/公开预览锁定；关闭态 `accept` 不含图片；Server Action 本地 `image_ocr_unavailable`；错误映射忽略 `text`/`transcript`，不编造转写。无新迁移。Live E2E 仍拒 `OCR_FAKE`。隔离 `ocr:prove` **不进** always-on。不是视觉质量 SLO / `MODEL-OP-01` 关闭 |
| #67 | 出题/原生 fail-closed：`QuestionGenerationResult` + registry `generation_unavailable`；缺 Key/超时/畸形/critique/原生 miss 不写 pending、不发明题面；lifecycle `interview_unavailable`。leftover citation 丢弃 ≠ unavailable。无新迁移（不占 `0128`–`0130`）。可选 always-on 挂静态 `native-fail-closed:prove` / `question-generation-fail-closed:prove`。不是发布证据 / 真百炼 SLO |

`check-docs.mjs` / `meta/index.md` / 用例目录是并集，不是二选一。

后续 PR 若往 always-on 加门，必须同步改本表与 [run-gates](../skills/testing/run-gates.md)。

## 文档同步（本分支，非 follow-up）

与代码/脚本不一致的技能页已在本分支改完，禁止再开「文档后补」工单：

| 文件 | 对齐内容 |
| --- | --- |
| `skills/testing/run-gates.md` | always-on 名单 = `ALWAYS_ON_REQUIRED`；假服务完整列表；隔离长码 + `tagE2EFailure` |
| `skills/testing/e2e-platform/README.md` | always-on 含平台三入口 + 静态守卫 + parity；完整名单仍只维护在 run-gates |
| `skills/testing/e2e-platform/00-overview.md` | 假服务：母线三旗标内联 + `e2e-fake-service-flags.mjs` 扩展列表；无 Key 回归指向 run-gates |
| `skills/testing/e2e-platform/02-post-change.md` | 第 3 步 / 完成证据含 `e2e-static-guards:*` 与 `e2e-parity:*` |
| `skills/testing/e2e-platform/05-failure-classification.md` | `classifyFailure` 的 `FAIL_*` 与 runner `E2E_FAILURE` 账本对照指向 run-gates §6；隔离码不得收短 |
| `skills/README.md` / `meta/index.md` / `meta/directory-boundaries.md` | 集成分支、目录契约、parity floors、短流程长度政策各只指向一处 |
| `testing/conventions/e2e-directory-contract.md` | 可执行布局；脚本映射禁止对调 |
| `testing/e2e-parity-baseline.md` + JSON/allowlist | floors 48/367；effective 37/342；allowlist 6 条 |
| `architecture/ai/provider-egress-inventory.{json,md}` | 登记 #62/#63 E2E 引用 + #79 `interview-voice-seams` + #67 `native-fail-closed`；`environmentReferenceCount` = 208；consumer pairs = 32 |

`docs:check` 把本文件列为 required，并要求出现 `#55`、`#64`、`#69`、`#71`、`#70`、`#66`、`#73`、`#74`、`#75`、`#77`、`#82`、`#72`、`#79`、`#83`、`#67`、`feature/e2e-platform-integration`、`fail-closed`、`releaseEvidence`、`supersede`。

## 本轮诚实边界

```text
aiAuthored: yes
aiTrust: untrusted
review: blocked:author_only
verification: commands_ok
commands: pnpm regression
exit: docs:check=0 generation-trust:prove=0 golden-tasks:check=0 golden-tasks:prove=0 e2e-platform:check=0 e2e-platform:prove=0 e2e-platform:layout:prove=0 e2e-helpers:prove=0 e2e-receipt:prove=0 e2e-runner:prove=0 e2e-static-guards:check=0 e2e-static-guards:prove=0 e2e-parity:check=0 e2e-parity:prove=0 arch=0 api:smoke=0 public-text-policy:prove=0 quality:traceability:prove=0 provider-egress:prove=0 public-preview-write:prove=0 public-preview-write-gate:prove=0 interview-answer-submission:prove=0 adaptive-length:prove=0 scor-00-honesty:prove=0 model-op01:prove=0 interview-dispatch:unit:prove=0 privacy-erasure-preview:domain:prove=0 privacy-erasure-preview:contract:prove=0 adaptive-signals:prove=0 adaptive-signals-graph:prove=0 interview-voice-seams:prove=0 native-fail-closed:prove=0 question-generation-fail-closed:prove=0
receipts: none
claimDone: false
ready: NOT_READY
rounds: 17
releaseEvidence: false
liveE2E: not_run:live_provider_key_missing
core: not_requested
secrets: none
```

`pnpm regression` 在叠到 `origin/main` @ `3d88cb6`（#65+#68+#69+#71+#70+#66+#73+#74+#75+#77+#82+#72+#79+#83+#67）后退出 0（`outcome=passed_always_on`）。`docs:check` 现为 73 个 required files。这只证明 always-on + 已接线可选静态门，不是 CI `verify`、不是 `--core`、不是 live E2E。隔离 Docker/remote proves 未跑、不进 always-on。本 PR 只 supersede #55–#64，不 supersede #67 / #83 / #79 / #72 / #82 / #77 / #75 / #74 / #73 / #66 / #70。作者不得自签 `review: passed`。不得 `--claim-done`。不得写「本轮局部验证完成」——审核仍是 `blocked:author_only`。

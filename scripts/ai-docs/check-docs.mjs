import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { scanPublicTextPolicy } from "./public-text-policy.mjs";

const root = new URL("../..", import.meta.url).pathname;


const requiredFiles = [
  "README.md",
  "AGENTS.md",
  "CLAUDE.md",
  "ai-docs/README.md",
  "ai-docs/meta/index.md",
  "ai-docs/meta/directory-boundaries.md",
  "ai-docs/product/vision.md",
  "ai-docs/product/glossary.md",
  "ai-docs/product/domain-models/interview-career-domain.md",
  "ai-docs/product/workflows/core-workflows.md",
  "ai-docs/requirements/epics/mvp-interview-career-platform.md",
  "ai-docs/architecture/system-blueprint.md",
  "ai-docs/architecture/current-runtime-truth.md",
  "ai-docs/architecture/ai/scoring-measurement-runtime.md",
  "ai-docs/architecture/adr/0020-scorecard-authority-and-eligibility.md",
  "ai-docs/requirements/use-cases/interview-scoring-measurement.md",
  "ai-docs/architecture/ai/langgraph-blueprint.md",
  "ai-docs/architecture/ai/privacy-deletion-sink-inventory.md",
  "ai-docs/requirements/use-cases/privacy-erasure-preview-path.md",
  "ai-docs/architecture/ai/agent-runtime.md",
  "ai-docs/architecture/backend/data-model.md",
  "ai-docs/architecture/backend/interview-answer-dual-write-cutover.md",
  "ai-docs/architecture/backend/worker-dispatch-fairness.md",
  "ai-docs/architecture/backend/module-boundaries.md",
  "ai-docs/architecture/backend/rls-isolation.md",
  "ai-docs/architecture/backend/commerce-saga.md",
  "ai-docs/architecture/backend/domain-events-catalog.md",
  "ai-docs/architecture/devops/local-demo-deployment.md",
  "ai-docs/observability/observability-strategy.md",
  "ai-docs/rules/global/status-machine.md",
  "ai-docs/rules/global/production-invariants.md",
  "ai-docs/rules/global/ai-generated-review.md",
  "ai-docs/rules/ai/structured-output-and-safety.md",
  "ai-docs/rules/backend/qbank-control-definer-sealed-manifest.md",
  "ai-docs/testing/strategy/test-strategy.md",
  "ai-docs/requirements/use-cases/cend-overview-progress.md",
  "ai-docs/requirements/use-cases/interview-control-signals.md",
  "ai-docs/requirements/use-cases/interview-answer-preview-submit.md",
  "ai-docs/requirements/use-cases/adaptive-interview-length.md",
  "ai-docs/requirements/use-cases/resume-ocr-binding.md",
  "ai-docs/requirements/use-cases/worker-event-driven-dispatch.md",
  "ai-docs/meta/task-sop.md",
  "ai-docs/testing/conventions/test-authoring.md",
  "ai-docs/testing/conventions/e2e-directory-contract.md",
  "ai-docs/delivery/e2e-platform-integration.md",
  "ai-docs/skills/README.md",
  "ai-docs/skills/testing/SKILL.md",
  "ai-docs/skills/testing/sop.md",
  "ai-docs/skills/testing/post-change-review.md",
  "ai-docs/skills/testing/layer-selection.md",
  "ai-docs/skills/testing/run-gates.md",
  "ai-docs/skills/testing/regression-selection.md",
  "ai-docs/skills/testing/ai-provenance.md",
  "ai-docs/skills/testing/honesty-rules.md",
  "ai-docs/skills/testing/fail-closed-gate.md",
  "ai-docs/skills/testing/e2e-platform/README.md",
  "ai-docs/skills/testing/e2e-platform/00-overview.md",
  "ai-docs/skills/testing/e2e-platform/01-directory-contract.md",
  "ai-docs/skills/testing/e2e-platform/02-post-change.md",
  "ai-docs/skills/testing/e2e-platform/03-provenance.md",
  "ai-docs/skills/testing/e2e-platform/04-evidence-and-redaction.md",
  "ai-docs/skills/testing/e2e-platform/05-failure-classification.md",
  "ai-docs/testing/golden-tasks/README.md",
  "ai-docs/testing/golden-tasks/registry.json",
  "ai-docs/testing/e2e-parity-baseline.md",
  "ai-docs/testing/e2e-parity-baseline.json",
  "ai-docs/testing/e2e-parity-allowlist.json",
  "ai-docs/requirements/use-cases/e2e-parity-baseline.md",
  "ai-docs/delivery/roadmap.md",
  "docker/compose.dev.yml",
  "docker/compose.demo.yml",
  "docker/env/api.env.example",
  "docker/env/web.env.example",
  "docker/env/worker.env.example",
];

const requiredTerms = new Map([
  ["README.md", ["Meetwise", "知面"]],
  ["AGENTS.md", ["文档先行", "契约先行", "测试先行", "skills/testing/sop.md", "fail-closed-gate.md", "不得默认信任", "多轮门禁", "e2e-parity:check", "parity floors"]],
  ["CLAUDE.md", ["skills/testing/sop.md", "fail-closed-gate.md"]],
  ["ai-docs/meta/task-sop.md", ["skills/testing/sop.md", "fail-closed-gate.md"]],
  ["ai-docs/product/vision.md", ["面试", "职业路径"]],
  ["ai-docs/architecture/system-blueprint.md", ["Next.js", "NestJS", "LangGraph", "Postgres"]],
  ["ai-docs/architecture/current-runtime-truth.md", ["已验证", "发布阻断", "LangGraph", "RAG", "Langfuse", "issued_turns", "overview.answered", "interview_erasure_authorization_not_available", "/answers", "RAG-FUNNEL-01A", "0124_rag_retrieval_acl_fail_closed", "0125_memory_vector_chunk_erasure", "绝对杀开关默认 120", "软预算", "boundedAbsoluteMaxTurns", "INT-LONG-INTERVIEW-01", "SCOR-00H", "0126", "答题双写互斥", "0127", "OCR_PREVIEW", "resume.ocr.v1", "WORKER-DISPATCH-002", "0128", "0128_interview_dispatch_fairness", "interview-dispatch:unit:prove", "0129", "预览版", "erasure-preview", "0130", "observeInterviewSignals", "early_weak", "thrashing", "SIGNAL-01", "createInterviewVoiceSeams", "voice.asr.v1", "/speak/stream", "isOcrPreviewEnabled", "预览图片入口", "OCR_FAKE", "出题 fail-closed", "QuestionGenerationResult", "generation_unavailable", "UC-INT-TRANSCRIPT-PREVIEW-SUBMIT", "submitInterviewAnswer", "int-transcript-preview-submit:http:prove"]],
  ["ai-docs/architecture/ai/scoring-measurement-runtime.md", ["SCOR-00H", "insufficient_evidence", "releaseEvidence"]],
  ["ai-docs/architecture/adr/0020-scorecard-authority-and-eligibility.md", ["SCOR-00H", "practice_eligible", "insufficient_evidence"]],
  ["ai-docs/requirements/use-cases/interview-scoring-measurement.md", ["UC-SCOR-00H", "SCOR-00H", "insufficient_evidence", "releaseEvidence"]],
  ["ai-docs/architecture/ai/langgraph-blueprint.md", ["checkpoint", "thread_id"]],
  ["ai-docs/architecture/ai/privacy-deletion-sink-inventory.md", ["memory_vector_chunk", "vector_chunk", "user_memory", "ai_invocation_trace", "fail-closed", "privacy_deletion_target", "erasure-preview", "预览版"]],
  ["ai-docs/requirements/use-cases/privacy-erasure-preview-path.md", ["预览版", "preview_incomplete", "productionSloClaimed", "Idempotency-Key"]],
  ["ai-docs/architecture/devops/local-demo-deployment.md", ["docker compose", "compose.demo.yml"]],
  ["ai-docs/testing/strategy/test-strategy.md", ["contract", "E2E", "golden", "e2e:isolated", "Playwright", "主层", "次层", "不得默认信任", "多轮门禁", "e2e-platform", "e2e-static-guards", "unverified AI path", "e2e-parity:check"]],
  ["ai-docs/rules/global/ai-generated-review.md", ["不得默认信任", "审核", "验证", "多轮门禁", "自动化", "fail-closed-gate.md"]],
  ["ai-docs/testing/conventions/test-authoring.md", ["e2e:isolated", "Playwright", "fetch", "skills/testing", "禁止伪验收"]],
  ["ai-docs/testing/conventions/e2e-directory-contract.md", ["e2e/helpers", "run-e2e", "叙事", "fail-closed", "e2e-platform:check", "e2e-platform:prove", "e2e-platform:layout:prove", "pending_review", "不可信", "多轮"]],
  ["ai-docs/meta/index.md", ["skills/testing/sop.md", "skills/testing/SKILL.md", "skills/README.md", "fail-closed-gate.md", "test-authoring", "e2e:isolated", "ai-generated-review", "e2e-platform-integration.md", "e2e-directory-contract", "e2e-parity-baseline", "privacy-deletion-sink-inventory.md", "adaptive-interview-length.md", "SCOR-00H", "interview-answer-dual-write-cutover.md", "resume-ocr-binding.md", "worker-dispatch-fairness.md", "privacy-erasure-preview-path.md", "interview-control-signals.md", "voice-capability-boundary.md", "cend-resume.md", "generation_unavailable", "interview-answer-preview-submit.md"]],
  ["ai-docs/skills/testing/SKILL.md", ["pnpm regression", "releaseEvidence", "出处", "status: draft", "fail-closed", "生成物默认不可信", "skip-as-pass", "--core", "--live", "always-on", "review/verify", "automation does not trust AI outputs", "multi-round allowed", "e2e-platform", "e2e-static-guards", "unverified AI path", "e2e-parity:check"]],
  ["ai-docs/skills/testing/sop.md", ["审核", "回归", "status: draft", "releaseEvidence", "always-on", "不减免", "fail-closed-gate.md", "生成物默认不可信", "不得声称完成", "skip-as-pass", "e2e-parity:check"]],
  ["ai-docs/skills/testing/fail-closed-gate.md", ["fail-closed", "不可信", "审核", "验证", "多轮", "UNTRUSTED", "releaseEvidence", "secrets", "aiTrust", "文档门", "e2e-parity:check", "parity floors"]],
  ["ai-docs/skills/testing/post-change-review.md", ["pnpm regression", "未查", "自签", "fail-closed", "生成物默认不可信", "skip-as-pass", "不得标 READY", "review/verify", "automation does not trust AI outputs", "multi-round allowed", "e2e-parity:check", "parity floors"]],
  ["ai-docs/skills/testing/honesty-rules.md", ["releaseEvidence", "aiTrust", "passed_adversarial", "secrets", "未审核生成", "不得标 READY", "unverified AI path", "失败即关", "parity floors"]],
  ["ai-docs/skills/testing/e2e-platform/README.md", ["draft", "PASS_WITH_GAPS", "e2e:isolated", "NOT_READY"]],
  ["ai-docs/delivery/e2e-platform-integration.md", ["#55", "#64", "#69", "#71", "#70", "#66", "#73", "#74", "#75", "#77", "#82", "#72", "#79", "#83", "#67", "#80", "feature/e2e-platform-integration", "fail-closed", "releaseEvidence", "supersede"]],
  ["ai-docs/testing/golden-tasks/README.md", ["GT-01", "planned", "mapped", "partial", "uncovered", "ai-output"]],
  ["ai-docs/testing/e2e-parity-baseline.md", ["allowlist", "fail-closed", "releaseEvidence", "e2e-parity:check", "parity floors", "AI diffs", "review"]],
  ["ai-docs/observability/observability-strategy.md", ["SLO", "降级", "恢复", "脱敏", "threadId"]],
  ["ai-docs/rules/backend/qbank-control-definer-sealed-manifest.md", ["qbank_control_definer", "FORCE RLS", "fail-closed", "SECURITY DEFINER", "lane(b)", "撤销", "复活"]],
  ["ai-docs/requirements/use-cases/cend-overview-progress.md", ["题目账本", "Overview.answered", "issued_turns", "status <> 'cancelled'", "ScoreCard"]],
  ["ai-docs/architecture/backend/interview-answer-dual-write-cutover.md", [
    "INT-P0-RAW-QUEUE",
    "INT-TRANSCRIPT-01",
    "interview_job",
    "interview_answer_artifact",
    "interview_answer_legacy_plaintext_fenced",
    "interview_answer_ledger_dual_write_fenced",
    "interview_event_raw_answer_fenced",
    "答题双写互斥",
    "0126",
    "payload-'answer'",
    "submitInterviewAnswer",
    "enqueueInterviewJob",
  ]],
  ["ai-docs/requirements/use-cases/interview-control-signals.md", ["observeInterviewSignals", "early_weak", "thrashing", "safety_ceiling", "不是能力等级校准", "INT-LEVEL-01"]],
  ["ai-docs/requirements/use-cases/interview-answer-preview-submit.md", ["UC-INT-TRANSCRIPT-PREVIEW-SUBMIT", "submitInterviewAnswer", "INT-TRANSCRIPT-01", "0092", "MEETWISE_PUBLIC_PREVIEW"]],
  ["ai-docs/requirements/use-cases/adaptive-interview-length.md", ["UC-INT-LENGTH-01", "absoluteMaxTurns", "软预算", "INT-LONG-INTERVIEW-01", "releaseEvidence"]],
  ["ai-docs/requirements/use-cases/resume-ocr-binding.md", ["MODEL-OP-01", "OCR_PREVIEW", "resume.ocr.v1", "admitInterviewResume", "0127", "releaseEvidence"]],
  ["ai-docs/architecture/backend/worker-dispatch-fairness.md", ["WORKER-DISPATCH-002", "0128", "fairDrainInterviewOwners", "interview-dispatch:unit:prove", "releaseEvidence"]],
  ["ai-docs/requirements/use-cases/worker-event-driven-dispatch.md", ["UC-WORKER-002", "WORKER-DISPATCH-002", "0128", "releaseEvidence"]],
]);

// P0 readability contract: expert-interview materials must not assume the reader already knows acronyms.
// We enforce a visible first-use terminology section; detailed vocabulary lives in product/glossary.md.
const coachDocsWithTerminology = [
  "ai-docs/requirements/use-cases/expert-interview-coach-agent-graph.md",
  "ai-docs/requirements/use-cases/expert-interview-coach-rag-runtime.md",
  "ai-docs/requirements/use-cases/expert-interview-coach-evaluation.md",
  "ai-docs/requirements/use-cases/expert-interview-coach-product-reliability.md",
  "ai-docs/requirements/use-cases/expert-interview-coach-rag-ingestion-finetuning.md",
];

// A question bank is teaching material, not only an interviewer rubric. Each outline-style answer must have at
// least one corresponding speakable answer. This ratio gate prevents later edits from silently reverting to bullets.
const questionBanksWithSpeakableAnswerGate = [
  "ai-docs/requirements/use-cases/interview-question-bank-agent-rag.md",
  "ai-docs/requirements/use-cases/interview-question-bank-product-bend.md",
  "ai-docs/requirements/use-cases/interview-question-bank-reliability-security.md",
];

const errors = [];

// The architecture truth matrix is intentionally small enough to check against
// source. This catches the high-cost failure mode where a target-state document
// silently outlives a security or runtime change.
const runtimeTruthAssertions = [
  {
    source: "apps/worker/src/production-config.ts",
    sourceTerm: "legacy_interview_graph_disabled",
    truthTerm: "旧固定题单不再是生产回退",
  },
  {
    source: "packages/db/migrations/0045_checkpoint_thread_rls.sql",
    sourceTerm: "checkpoint_thread_enrollment",
    truthTerm: "checkpoint 原文删除闭环",
  },
  {
    source: "apps/worker/src/interview-research-skills.ts",
    sourceTerm: "'deep.research'",
    truthTerm: "deep.research",
  },
  {
    source: "packages/ai-runtime/src/langfuse-v5.ts",
    sourceTerm: "LangfuseSpanProcessor",
    truthTerm: "Langfuse 已使用 v5 OpenTelemetry",
  },
  {
    source: "packages/ai-runtime/src/evaluation-manifest.ts",
    sourceTerm: "manifest.cases.length !== 120",
    truthTerm: "120 条**合成合同**",
  },
  {
    source: "apps/api/src/platform/public-preview.ts",
    sourceTerm: "assertPublicPreviewWritesClosed",
    truthTerm: "公开预览写门禁",
  },
  {
    source: "apps/api/src/modules/profile/profile.service.ts",
    sourceTerm: "iq.status='answered'",
    truthTerm: "overview.answered",
  },
  {
    source: "apps/api/src/modules/interview/interview.service.ts",
    sourceTerm: "iq.status <> 'cancelled'",
    truthTerm: "issued_turns",
  },
  {
    source: "apps/api/src/modules/privacy/privacy.service.ts",
    sourceTerm: "interview_erasure_authorization_not_available",
    truthTerm: "interview_erasure_authorization_not_available",
  },
  {
    source: "packages/db/migrations/0124_rag_retrieval_acl_fail_closed.sql",
    sourceTerm: "rag_acl_principal_missing",
    truthTerm: "0124_rag_retrieval_acl_fail_closed",
  },
  {
    source: "packages/db/migrations/0125_memory_vector_chunk_erasure.sql",
    sourceTerm: "memory_vector_chunk",
    truthTerm: "0125_memory_vector_chunk_erasure",
  },
  {
    source: "packages/domain/src/adaptive-interview.ts",
    sourceTerm: "DEFAULT_ABSOLUTE_MAX_TURNS = 120",
    truthTerm: "绝对杀开关默认 120",
  },
  {
    source: "packages/domain/src/scoring-honesty.ts",
    sourceTerm: "export function isTrustedScoreIdentity",
    truthTerm: "SCOR-00H",
  },
  {
    source: "packages/db/migrations/0126_interview_answer_dual_write_fence.sql",
    sourceTerm: "interview_answer_legacy_plaintext_fenced",
    truthTerm: "答题双写互斥",
  },
  {
    source: "packages/db/migrations/0127_resume_ocr_binding_provenance.sql",
    sourceTerm: "resume.ocr.v1",
    truthTerm: "0127_resume_ocr_binding_provenance",
  },
  {
    source: "packages/db/migrations/0128_interview_dispatch_fairness.sql",
    sourceTerm: "gateway_dispatch_owners",
    truthTerm: "0128_interview_dispatch_fairness",
  },
  {
    source: "apps/api/src/modules/privacy/privacy.service.ts",
    sourceTerm: "beginPrivacyPreviewErasure",
    truthTerm: "预览版",
  },
  {
    source: "packages/db/migrations/0129_privacy_erasure_preview_path.sql",
    sourceTerm: "privacy_preview_request",
    truthTerm: "0129_privacy_erasure_preview_path",
  },
  {
    source: "packages/domain/src/interview-control-signals.ts",
    sourceTerm: "export function observeInterviewSignals",
    truthTerm: "observeInterviewSignals",
  },
  {
    source: "packages/db/migrations/0130_model_invocation_same_key_claim_join.sql",
    sourceTerm: "ai_model_claim_invocation_scoped",
    truthTerm: "0130",
  },
  {
    source: "packages/ai-runtime/src/interview-voice-seams.ts",
    sourceTerm: "export function createInterviewVoiceSeams",
    truthTerm: "createInterviewVoiceSeams",
  },
  {
    source: "apps/web/lib/ocr-preview.ts",
    sourceTerm: "export function isOcrPreviewEnabled",
    truthTerm: "isOcrPreviewEnabled",
  },
  {
    source: "packages/domain/src/question-generation.ts",
    sourceTerm: "QuestionGenerationResult",
    truthTerm: "出题 fail-closed",
  },
  {
    source: "packages/ai-runtime/src/model-operation-registry.ts",
    sourceTerm: "generation_unavailable",
    truthTerm: "generation_unavailable",
  },
];

for (const file of requiredFiles) {
  const absolutePath = join(root, file);
  if (!existsSync(absolutePath)) {
    errors.push(`missing required file: ${file}`);
  }
}

for (const [file, terms] of requiredTerms) {
  const absolutePath = join(root, file);
  if (!existsSync(absolutePath)) continue;

  const content = readFileSync(absolutePath, "utf8");
  for (const term of terms) {
    if (!content.includes(term)) {
      errors.push(`${file} should mention "${term}"`);
    }
  }
}

const runtimeTruthPath = join(root, "ai-docs/architecture/current-runtime-truth.md");
if (existsSync(runtimeTruthPath)) {
  const runtimeTruth = readFileSync(runtimeTruthPath, "utf8");
  for (const { source, sourceTerm, truthTerm } of runtimeTruthAssertions) {
    const sourcePath = join(root, source);
    if (!existsSync(sourcePath) || !readFileSync(sourcePath, "utf8").includes(sourceTerm)) {
      errors.push(`runtime truth source assertion drifted: ${source} must contain ${JSON.stringify(sourceTerm)}`);
    }
    if (!runtimeTruth.includes(truthTerm)) {
      errors.push(`runtime truth matrix must state ${JSON.stringify(truthTerm)} for ${source}`);
    }
  }
}

for (const file of coachDocsWithTerminology) {
  const absolutePath = join(root, file);
  if (!existsSync(absolutePath)) continue;
  const content = readFileSync(absolutePath, "utf8");
  if (!/(缩略语阅读卡|缩写与英文术语表|首次术语表)/.test(content)) {
    errors.push(`${file} must contain a first-use acronym terminology section`);
  }
  if (!content.includes("统一术语")) {
    errors.push(`${file} must link readers to the canonical Chinese terminology glossary`);
  }
}

for (const file of questionBanksWithSpeakableAnswerGate) {
  const absolutePath = join(root, file);
  if (!existsSync(absolutePath)) continue;
  const content = readFileSync(absolutePath, "utf8");
  const outlineCount = [...content.matchAll(/\*\*标准(?:答案)?要点\*\*|\*\*标准答案\*\*/g)].length;
  const speakableCount = [...content.matchAll(/\*\*90 秒可口述完整答案\*\*/g)].length;
  if (outlineCount > speakableCount) {
    errors.push(`${file} has ${outlineCount} answer outlines but only ${speakableCount} speakable answers`);
  }
}

const publicTextPolicy = scanPublicTextPolicy({ repoRoot: root });
for (const policyError of publicTextPolicy.errors) errors.push(`public_text_policy:${policyError}`);

if (errors.length > 0) {
  console.error("ai-docs check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`ai-docs check passed: ${requiredFiles.length} required files verified; public text policy scanned ${publicTextPolicy.scannedFiles} managed worktree files`);

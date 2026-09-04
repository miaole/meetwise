import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { scanPublicTextPolicy } from "./public-text-policy.mjs";

const root = new URL("../..", import.meta.url).pathname;


const requiredFiles = [
  "README.md",
  "docs/index.html",
  "AGENTS.md",
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
  "ai-docs/architecture/backend/module-boundaries.md",
  "ai-docs/architecture/backend/rls-isolation.md",
  "ai-docs/architecture/backend/commerce-saga.md",
  "ai-docs/architecture/backend/domain-events-catalog.md",
  "ai-docs/architecture/devops/local-demo-deployment.md",
  "ai-docs/observability/observability-strategy.md",
  "ai-docs/rules/global/status-machine.md",
  "ai-docs/rules/global/production-invariants.md",
  "ai-docs/rules/ai/structured-output-and-safety.md",
  "ai-docs/rules/backend/qbank-control-definer-sealed-manifest.md",
  "ai-docs/testing/strategy/test-strategy.md",
  "ai-docs/requirements/use-cases/cend-overview-progress.md",
  "ai-docs/requirements/use-cases/interview-control-signals.md",
  "ai-docs/requirements/use-cases/interview-signal-sse.md",
  "ai-docs/delivery/roadmap.md",
  "docker/compose.dev.yml",
  "docker/compose.demo.yml",
  "docker/env/api.env.example",
  "docker/env/web.env.example",
  "docker/env/worker.env.example",
];

const requiredTerms = new Map([
  ["README.md", ["Meetwise", "知面"]],
  ["docs/index.html", ["真实经历", "自适应面试", "可复盘成长", "合成截图", "不是已经部署的在线服务"]],
  ["AGENTS.md", ["文档先行", "契约先行", "测试先行"]],
  ["ai-docs/product/vision.md", ["面试", "职业路径"]],
  ["ai-docs/architecture/system-blueprint.md", ["Next.js", "NestJS", "LangGraph", "Postgres"]],
  ["ai-docs/architecture/current-runtime-truth.md", ["已验证", "发布阻断", "LangGraph", "RAG", "Langfuse", "issued_turns", "overview.answered", "SCOR-00H", "软预算", "boundedAbsoluteMaxTurns"]],
  ["ai-docs/architecture/ai/scoring-measurement-runtime.md", ["SCOR-00H", "insufficient_evidence", "releaseEvidence"]],
  ["ai-docs/architecture/adr/0020-scorecard-authority-and-eligibility.md", ["SCOR-00H", "practice_eligible", "insufficient_evidence"]],
  ["ai-docs/requirements/use-cases/interview-scoring-measurement.md", ["UC-SCOR-00H", "SCOR-00H", "insufficient_evidence", "releaseEvidence"]],
  ["ai-docs/architecture/ai/langgraph-blueprint.md", ["checkpoint", "thread_id"]],
  ["ai-docs/architecture/ai/privacy-deletion-sink-inventory.md", ["memory_vector_chunk", "vector_chunk", "user_memory", "ai_invocation_trace", "fail-closed", "privacy_deletion_target", "erasure-preview", "预览版"]],
  ["ai-docs/requirements/use-cases/privacy-erasure-preview-path.md", ["预览版", "preview_incomplete", "productionSloClaimed", "Idempotency-Key"]],
  ["ai-docs/architecture/devops/local-demo-deployment.md", ["docker compose", "compose.demo.yml"]],
  ["ai-docs/testing/strategy/test-strategy.md", ["contract", "E2E", "golden"]],
  ["ai-docs/observability/observability-strategy.md", ["SLO", "降级", "恢复", "脱敏", "threadId"]],
  ["ai-docs/rules/backend/qbank-control-definer-sealed-manifest.md", ["qbank_control_definer", "FORCE RLS", "fail-closed", "SECURITY DEFINER", "lane(b)", "撤销", "复活"]],
  ["ai-docs/requirements/use-cases/cend-overview-progress.md", ["题目账本", "Overview.answered", "issued_turns", "status <> 'cancelled'", "ScoreCard"]],
  ["ai-docs/requirements/use-cases/interview-signal-sse.md", ["session_concluded", "early_weak", "thrashing", "不是能力等级", "releaseEvidence=false", "INT-LEVEL-01"]],
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
    source: "packages/db/migrations/0126_interview_answer_dual_write_fence.sql",
    sourceTerm: "interview_answer_legacy_plaintext_fenced",
    truthTerm: "答题双写互斥",
  },
  {
    source: "apps/api/src/modules/privacy/privacy.service.ts",
    sourceTerm: "beginPrivacyPreviewErasure",
    truthTerm: "预览版",
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

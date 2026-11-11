import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { scanPublicTextPolicy } from "./public-text-policy.mjs";

const root = new URL("../..", import.meta.url).pathname;


function listMarkdownFiles(absDir, acc = []) {
  if (!existsSync(absDir)) return acc;
  for (const entry of readdirSync(absDir, { withFileTypes: true })) {
    const abs = join(absDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".tmp" || entry.name === "receipts") continue;
      listMarkdownFiles(abs, acc);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".md")) acc.push(abs);
  }
  return acc;
}

// Prevent rejected stacks (BullMQ / pg-boss / throttler-storage-redis) from
// being written back as present-tense fact. A mention is allowed only when a
// rejection / unwired / historical marker sits in the same clause (or in the
// 24 characters immediately before the term, so lists like "无 bullmq / pg-boss"
// stay legal). Redis-as-current-queue-or-ratelimiter is checked only in the
// current-architecture documents that are supposed to state runtime fact.
const REJECTED_STACK_PATTERNS = [
  { id: "bullmq", re: /@nestjs\/bullmq|bullmq/gi },
  { id: "pg-boss", re: /pg-boss|pgboss/gi },
  { id: "throttler-storage-redis", re: /throttler-storage-redis/gi },
];
const LOCAL_REJECTION = /无|不是|并非|未采用|未安装|未引用|不在|不以|不把|不要|不得|禁止|已否决|被否|已退役|已删|不再|不换|零码|零 import|仍写|曾写|曾用|原写|旧定论|旧叙事|旧文|历史|草稿|残留|勘误|目标态|仅设计|未接线|已取代|superseded|候选|已砍|砍除|勿把|作废/;
const REDIS_FACT_FILES = new Set([
  "ai-docs/architecture/dependency-footprint.md",
  "ai-docs/architecture/system-blueprint.md",
  "ai-docs/architecture/devops/infra-blueprint.md",
  "ai-docs/architecture/current-runtime-truth.md",
  "ai-docs/architecture/adr/README.md",
  "ai-docs/observability/observability-strategy.md",
  "docker/README.md",
]);
const REDIS_CURRENT_QUEUE_OR_RATELIMIT = /redis[^。；;\n]{0,80}(任务队列|限流)|(任务队列|限流)[^。；;\n]{0,80}redis/gi;
const REDIS_REJECTION = /未接线|不是任务队列|不是耐久|当前落 PG|落 PG 共享|目标态|仅设计|不证明|不能把它|尚非|不承担|不含限流|都不依赖|不要把|不得写成|勘误/;

function clauseOf(line, index) {
  const marks = /[。；;\n]/g;
  let start = 0;
  let end = line.length;
  for (const m of line.matchAll(marks)) {
    if (m.index < index) start = m.index + 1;
    else {
      end = m.index;
      break;
    }
  }
  return line.slice(start, end);
}

function termIsRejectedInLine(line, index) {
  const prefix = line.slice(Math.max(0, index - 24), index);
  if (LOCAL_REJECTION.test(prefix)) return true;
  return LOCAL_REJECTION.test(clauseOf(line, index));
}

function checkRejectedCurrentNarratives() {
  const files = [
    ...listMarkdownFiles(join(root, "ai-docs")),
    join(root, "docker/README.md"),
    join(root, "README.md"),
  ].filter((abs) => existsSync(abs) && statSync(abs).isFile());
  for (const abs of files) {
    const rel = relative(root, abs);
    const lines = readFileSync(abs, "utf8").split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const { id, re } of REJECTED_STACK_PATTERNS) {
        re.lastIndex = 0;
        for (const m of line.matchAll(re)) {
          if (!termIsRejectedInLine(line, m.index)) {
            errors.push(`rejected_stack_narrative:${rel}:${i + 1} mentions ${id} as current without a rejection/unwired marker`);
          }
        }
      }
      if (REDIS_FACT_FILES.has(rel)) {
        REDIS_CURRENT_QUEUE_OR_RATELIMIT.lastIndex = 0;
        for (const m of line.matchAll(REDIS_CURRENT_QUEUE_OR_RATELIMIT)) {
          const clause = clauseOf(line, m.index);
          if (!REDIS_REJECTION.test(clause) && !REDIS_REJECTION.test(line)) {
            errors.push(`rejected_stack_narrative:${rel}:${i + 1} describes Redis as the current queue or rate limiter without an unwired/rejection marker`);
          }
        }
      }
    }
  }
}

const requiredFiles = [
  "README.md",
  "docs/index.html",
  ".github/workflows/pages.yml",
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
  "ai-docs/architecture/ai/voice-capability-boundary.md",
  "ai-docs/architecture/ai/privacy-deletion-sink-inventory.md",
  "ai-docs/requirements/use-cases/privacy-erasure-preview-path.md",
  "ai-docs/architecture/ai/agent-runtime.md",
  "ai-docs/architecture/backend/data-model.md",
  "ai-docs/architecture/backend/interview-answer-dual-write-cutover.md",
  "ai-docs/architecture/backend/high-concurrency-review.md",
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
  "ai-docs/requirements/use-cases/interview-signal-sse.md",
  "ai-docs/requirements/use-cases/bend-recruiter-architecture-surface.md",
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
  ["docs/index.html", ["真实经历", "自适应面试", "可复盘成长", "合成截图", "不是已经部署的在线服务", "招聘功能面向企业账户开放"]],
  [".github/workflows/pages.yml", ["docs/index.html", "refs/heads/main", "apps/web/docs/screenshots"]],
  ["AGENTS.md", ["文档先行", "契约先行", "测试先行", "skills/testing/sop.md", "fail-closed-gate.md", "不得默认信任", "多轮门禁", "e2e-parity:check", "parity floors"]],
  ["CLAUDE.md", ["skills/testing/sop.md", "fail-closed-gate.md"]],
  ["ai-docs/meta/task-sop.md", ["skills/testing/sop.md", "fail-closed-gate.md"]],
  ["ai-docs/product/vision.md", ["面试", "职业路径"]],
  ["ai-docs/architecture/system-blueprint.md", ["Next.js", "NestJS", "LangGraph", "Postgres"]],
  ["ai-docs/architecture/current-runtime-truth.md", ["已验证", "发布阻断", "LangGraph", "RAG", "Langfuse", "issued_turns", "overview.answered", "interview_erasure_authorization_not_available", "/answers", "RAG-FUNNEL-01A", "0124_rag_retrieval_acl_fail_closed", "0125_memory_vector_chunk_erasure", "绝对杀开关默认 120", "软预算", "boundedAbsoluteMaxTurns", "INT-LONG-INTERVIEW-01", "SCOR-00H", "0126", "答题双写互斥", "0127", "OCR_PREVIEW", "resume.ocr.v1", "WORKER-DISPATCH-002", "0128", "0128_interview_dispatch_fairness", "interview-dispatch:unit:prove", "interview-dispatch:prove", "interview-dispatch:gate:prove", "interview-dispatch-receipts", "33867570523", "HC-GAP-012", "0129", "预览版", "erasure-preview", "0130", "observeInterviewSignals", "early_weak", "thrashing", "SIGNAL-01", "createInterviewVoiceSeams", "voice.asr.v1", "/speak/stream", "isOcrPreviewEnabled", "预览图片入口", "OCR_FAKE", "出题 fail-closed", "QuestionGenerationResult", "generation_unavailable", "UC-INT-TRANSCRIPT-PREVIEW-SUBMIT", "submitInterviewAnswer", "int-transcript-preview-submit:http:prove", "session_concluded", "SIGNAL-SSE", "仅面试练习", "preview-controlled-write", "POST /interview/:id/answers", "assertPublicPreviewControlledWriteAllowed", "parseLastEventId", "last-event-id:unit:prove", "high-concurrency-review"]],
  ["ai-docs/architecture/ai/scoring-measurement-runtime.md", ["SCOR-00H", "insufficient_evidence", "releaseEvidence"]],
  ["ai-docs/architecture/adr/0020-scorecard-authority-and-eligibility.md", ["SCOR-00H", "practice_eligible", "insufficient_evidence"]],
  ["ai-docs/requirements/use-cases/interview-scoring-measurement.md", ["UC-SCOR-00H", "SCOR-00H", "insufficient_evidence", "releaseEvidence"]],
  ["ai-docs/architecture/ai/langgraph-blueprint.md", ["checkpoint", "thread_id"]],
  ["ai-docs/architecture/ai/voice-capability-boundary.md", [
    "VOICE_STREAM_ASR_ENABLED",
    "VOICE_STREAM_ASR_PREVIEW",
    "fail-closed",
    "不编造转写",
    "PRD-TEST-006",
    "turn-taking",
    "流式 ASR",
  ]],
  ["ai-docs/architecture/ai/privacy-deletion-sink-inventory.md", ["memory_vector_chunk", "vector_chunk", "user_memory", "ai_invocation_trace", "fail-closed", "privacy_deletion_target", "erasure-preview", "预览版"]],
  ["ai-docs/requirements/use-cases/privacy-erasure-preview-path.md", ["预览版", "preview_incomplete", "productionSloClaimed", "Idempotency-Key"]],
  ["ai-docs/architecture/devops/local-demo-deployment.md", ["docker compose", "compose.demo.yml", "仅面试练习", "招聘功能面向企业账户开放"]],
  ["ai-docs/testing/strategy/test-strategy.md", ["contract", "E2E", "golden", "e2e:isolated", "Playwright", "主层", "次层", "不得默认信任", "多轮门禁", "e2e-platform", "e2e-static-guards", "unverified AI path", "e2e-parity:check"]],
  ["ai-docs/rules/global/ai-generated-review.md", ["不得默认信任", "审核", "验证", "多轮门禁", "自动化", "fail-closed-gate.md"]],
  ["ai-docs/testing/conventions/test-authoring.md", ["e2e:isolated", "Playwright", "fetch", "skills/testing", "禁止伪验收"]],
  ["ai-docs/testing/conventions/e2e-directory-contract.md", ["e2e/helpers", "run-e2e", "叙事", "fail-closed", "e2e-platform:check", "e2e-platform:prove", "e2e-platform:layout:prove", "pending_review", "不可信", "多轮"]],
  ["ai-docs/meta/index.md", ["skills/testing/sop.md", "skills/testing/SKILL.md", "skills/README.md", "fail-closed-gate.md", "test-authoring", "e2e:isolated", "ai-generated-review", "e2e-platform-integration.md", "e2e-directory-contract", "e2e-parity-baseline", "privacy-deletion-sink-inventory.md", "adaptive-interview-length.md", "SCOR-00H", "interview-answer-dual-write-cutover.md", "resume-ocr-binding.md", "worker-dispatch-fairness.md", "privacy-erasure-preview-path.md", "interview-control-signals.md", "voice-capability-boundary.md", "cend-resume.md", "generation_unavailable", "interview-answer-preview-submit.md", "interview-signal-sse.md", "docs/index.html", "high-concurrency-review.md", "bend-recruiter-architecture-surface.md"]],
  ["ai-docs/skills/testing/SKILL.md", ["pnpm regression", "releaseEvidence", "出处", "status: draft", "fail-closed", "生成物默认不可信", "skip-as-pass", "--core", "--live", "always-on", "review/verify", "automation does not trust AI outputs", "multi-round allowed", "e2e-platform", "e2e-static-guards", "unverified AI path", "e2e-parity:check"]],
  ["ai-docs/skills/testing/sop.md", ["审核", "回归", "status: draft", "releaseEvidence", "always-on", "不减免", "fail-closed-gate.md", "生成物默认不可信", "不得声称完成", "skip-as-pass", "e2e-parity:check"]],
  ["ai-docs/skills/testing/fail-closed-gate.md", ["fail-closed", "不可信", "审核", "验证", "多轮", "UNTRUSTED", "releaseEvidence", "secrets", "aiTrust", "文档门", "e2e-parity:check", "parity floors"]],
  ["ai-docs/skills/testing/post-change-review.md", ["pnpm regression", "未查", "自签", "fail-closed", "生成物默认不可信", "skip-as-pass", "不得标 READY", "review/verify", "automation does not trust AI outputs", "multi-round allowed", "e2e-parity:check", "parity floors"]],
  ["ai-docs/skills/testing/honesty-rules.md", ["releaseEvidence", "aiTrust", "passed_adversarial", "secrets", "未审核生成", "不得标 READY", "unverified AI path", "失败即关", "parity floors"]],
  ["ai-docs/skills/testing/e2e-platform/README.md", ["draft", "PASS_WITH_GAPS", "e2e:isolated", "NOT_READY"]],
  ["ai-docs/delivery/e2e-platform-integration.md", ["#55", "#64", "#69", "#71", "#70", "#66", "#73", "#74", "#75", "#77", "#82", "#72", "#79", "#83", "#67", "#80", "#84", "#78", "#88", "#86", "#87", "#81", "#90", "#89", "#95", "#91", "#93", "#92", "#94", "#98", "#96", "#97", "feature/e2e-platform-integration", "fail-closed", "releaseEvidence", "supersede"]],
  ["ai-docs/testing/golden-tasks/README.md", ["GT-01", "planned", "mapped", "partial", "uncovered", "ai-output"]],
  ["ai-docs/testing/e2e-parity-baseline.md", ["allowlist", "fail-closed", "releaseEvidence", "e2e-parity:check", "parity floors", "AI diffs", "review"]],
  ["ai-docs/observability/observability-strategy.md", ["SLO", "降级", "恢复", "脱敏", "threadId"]],
  ["ai-docs/rules/backend/qbank-control-definer-sealed-manifest.md", ["qbank_control_definer", "FORCE RLS", "fail-closed", "SECURITY DEFINER", "lane(b)", "撤销", "复活"]],
  ["ai-docs/requirements/use-cases/cend-overview-progress.md", ["题目账本", "Overview.answered", "issued_turns", "status <> 'cancelled'", "ScoreCard"]],
  ["ai-docs/requirements/use-cases/interview-signal-sse.md", ["session_concluded", "early_weak", "thrashing", "不是能力等级", "releaseEvidence=false", "INT-LEVEL-01"]],
  ["ai-docs/architecture/backend/high-concurrency-review.md", [
    "SKIP LOCKED",
    "fairDrainInterviewOwners",
    "drainOwnersInListedOrder",
    "Last-Event-ID",
    "parseLastEventId",
    "0120",
    "0130",
    "model-op02:prove",
    "model-slot-bypass:static:prove",
    "model-slot-bypass:prove",
    "quiz-dual-claim:unit:prove",
    "quiz-dual-claim:prove",
    "runtime:claim-join:prove",
    "HC-GAP-011-orphan-permit",
    "ai_model_concurrency_lease",
    "releaseEvidence",
    "HC-GAP-",
    "owner-drain-order:unit:prove",
    "sse-slot:prove",
    "interview-dispatch:gate:prove",
    "interview-dispatch-receipts",
    "33867570523",
    "HC-GAP-012",
  ]],
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
  ["ai-docs/requirements/use-cases/bend-recruiter-architecture-surface.md", ["怎么评估", "查看状态", "不提供数值评分", "releaseEvidence=false", "不是高峰容量保证", "内部预览", "招聘方产品没有上线", "不是「求职者 / 面试官」两套对等产品"]],
  ["ai-docs/requirements/use-cases/interview-answer-preview-submit.md", ["UC-INT-TRANSCRIPT-PREVIEW-SUBMIT", "submitInterviewAnswer", "INT-TRANSCRIPT-01", "0092", "MEETWISE_PUBLIC_PREVIEW"]],
  ["ai-docs/requirements/use-cases/adaptive-interview-length.md", ["UC-INT-LENGTH-01", "absoluteMaxTurns", "软预算", "INT-LONG-INTERVIEW-01", "releaseEvidence"]],
  ["ai-docs/requirements/use-cases/resume-ocr-binding.md", ["MODEL-OP-01", "OCR_PREVIEW", "resume.ocr.v1", "admitInterviewResume", "0127", "releaseEvidence"]],
  ["ai-docs/architecture/backend/worker-dispatch-fairness.md", ["WORKER-DISPATCH-002", "0128", "fairDrainInterviewOwners", "interview-dispatch:unit:prove", "interview-dispatch:gate:prove", "interview-dispatch-receipts", "releaseEvidence"]],
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
    source: "apps/api/src/platform/public-preview.ts",
    sourceTerm: "assertPublicPreviewControlledWriteAllowed",
    truthTerm: "assertPublicPreviewControlledWriteAllowed",
  },
  {
    source: "apps/api/src/platform/public-preview.ts",
    sourceTerm: "PREVIEW_CONTROLLED_WRITE",
    truthTerm: "preview-controlled-write",
  },
  {
    source: "docs/index.html",
    sourceTerm: "招聘功能面向企业账户开放",
    truthTerm: "仅面试练习",
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
    source: "apps/api/src/platform/last-event-id.ts",
    sourceTerm: "invalid_last_event_id",
    truthTerm: "parseLastEventId",
  },
  {
    source: "apps/web/lib/stream/sse-cursor.ts",
    sourceTerm: "InvalidLastEventIdError",
    truthTerm: "HC-GAP-014",
  },
  {
    source: "apps/api/test/validate.ts",
    sourceTerm: "/quiz/QZ1/events",
    truthTerm: "三条路径断言",
  },
  {
    source: "packages/ai-runtime/test/model-slot-bypass.static.proof.ts",
    sourceTerm: "admitCallIsGuardedByPartition",
    truthTerm: "model-slot-bypass:static:prove",
  },
  {
    source: "apps/worker/test/quiz-diagnosis-dual-claim.proof.ts",
    sourceTerm: "assertQuizDiagnosisDualClaimRemotePostgres",
    truthTerm: "quiz-dual-claim:unit:prove",
  },
  {
    source: "packages/ai-runtime/test/claim-join-orphan.proof.ts",
    sourceTerm: "HC-GAP-011-orphan-permit",
    truthTerm: "HC-GAP-011",
  },
  {
    source: "apps/worker/test/owner-drain-order.proof.ts",
    sourceTerm: "drainOwnersInListedOrder",
    truthTerm: "owner-drain-order:unit:prove",
  },
  {
    source: "apps/api/test/sse-principal-slot.proof.ts",
    sourceTerm: "too_many_streams",
    truthTerm: "sse-slot:prove",
  },
  {
    source: "scripts/interview-dispatch-prove.proof.mjs",
    sourceTerm: "interview_dispatch_prove_requires_remote_postgres",
    truthTerm: "interview-dispatch:gate:prove",
  },
  {
    source: "package.json",
    sourceTerm: "pnpm quiz:prove",
    truthTerm: "33867570523",
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
  {
    source: "apps/web/lib/recruiter/surface.ts",
    sourceTerm: "applicationScoreVisible",
    truthTerm: "/recruiter/how-it-works",
  },
  {
    source: "packages/ai-runtime/src/voice-stream-preview.ts",
    sourceTerm: "VOICE_STREAM_ASR_ENABLED",
    truthTerm: "流式 ASR",
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

checkRejectedCurrentNarratives();
// PR243 小门A：CI 步骤台账一致性门（ai-docs/architecture/devops/ci-cd.md §8.2 / §8.2.1）。
// 三处执行面 = ci.yml（全部 job）/ nightly-ciw2.yml / package.json `verify:local`（按 && 拆分）；双向对账：
//   ① 执行面里每条受跟踪命令都必须在台账里；
//   ② 台账每条命令必须恰在其「去向」声明的执行面出现，且不得出现在未声明的执行面（基础设施命令除外）。
// 去向词：「保留」→ ci；「仅 nightly」→ nightly；其余含「nightly」→ nightly + verify:local；「本地手跑」→ verify:local。
// 盲区补强（PR243 复审非阻塞 1/2）：
//   - 行首 `VAR=val` / `env VAR=val`、step 级 `env:`、以及 run 块里的 `export VAR=val` / `unset` / `>> $GITHUB_ENV` 纳入比对；
//   - ci/nightly 中非 `!cancelled()` 的 `if:`，或出现 `continue-on-error` 且值不是字面 false / `${{ false }}`，须在台账对应行用反引号显式标记（`if: <expr>` 归一后全等；job 级还须 `job: <id>`），否则报错；
//   - 非 pnpm 开头的受跟踪命令（bash / sh / npx / tsx / npm / yarn / cd … / env … / node scripts/ / docker build）也须登记；
//   - 能简单检测到的弱化（run 首行 exit 0、set +e、step/job/workflow 的 `shell:` 覆盖）须登记；其余 shell 语义（trap / heredoc / if-then 等）是门的边界，见 ci-cd.md §8.2。
//   - `run: >` 折叠标量按 YAML 语义拼成一行再比对。
const CI_LEDGER_DOC = "ai-docs/architecture/devops/ci-cd.md";
const CI_LEDGER_INFRA = new Set(["pnpm install --frozen-lockfile", "pnpm db:up"]);
const TRACKED_COMMAND = /^(pnpm |node scripts\/|docker build|bash |sh |npx |tsx |npm |yarn |cd |env |\/bin\/bash |\/bin\/sh )/;

function unquoteYamlScalar(raw) {
  const v = String(raw).trim().replace(/\s+#.*$/, "").trim();
  if ((v.startsWith("'") && v.endsWith("'") && v.length >= 2) || (v.startsWith('"') && v.endsWith('"') && v.length >= 2)) {
    return v.slice(1, -1);
  }
  return v;
}

function parseEnvPrefix(raw) {
  let cmd = raw.trim().replace(/\s+/g, " ");
  const env = {};
  // `env FOO=1 BAR=2 pnpm …`（env 内建、无 flag）。带 -u/-i/-- 的保持原样，由 isTrackedCommand 当整串登记。
  if (/^env [A-Z][A-Z0-9_]*=/.test(cmd)) cmd = cmd.slice(4);
  while (/^[A-Z][A-Z0-9_]*=\S+ /.test(cmd)) {
    const m = /^([A-Z][A-Z0-9_]*)=(\S+) /.exec(cmd);
    env[m[1]] = unquoteYamlScalar(m[2]);
    cmd = cmd.slice(m[0].length);
  }
  return { env, cmd };
}

function formatWithEnv(env, cmd) {
  const keys = Object.keys(env).sort();
  if (keys.length === 0) return cmd;
  return `${keys.map((k) => `${k}=${env[k]}`).join(" ")} ${cmd}`;
}

function normalizeCoreCommand(cmd) {
  if (/^docker build\b/.test(cmd)) return "docker build";
  return cmd;
}

function isTrackedCommand(cmd) {
  return TRACKED_COMMAND.test(cmd);
}

function commandIdentity(raw, stepEnv = {}) {
  const { env: lineEnv, cmd } = parseEnvPrefix(raw);
  const core = normalizeCoreCommand(cmd);
  if (!isTrackedCommand(core)) return null;
  return formatWithEnv({ ...stepEnv, ...lineEnv }, core);
}


function lineIndent(line) {
  return line.length - line.trimStart().length;
}
function isIgnorable(line) {
  return line.trim() === "" || /^\s*#/.test(line);
}
function collectBlock(lines, startIndex, keyIndent) {
  const body = [];
  let i = startIndex;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;
    if (lineIndent(line) <= keyIndent) break;
    body.push(line);
  }
  return { body, next: i };
}
function applyScalar(lines, i, rest, keyIndent) {
  const trimmed = rest.trim();
  const isLiteral = trimmed === "|" || trimmed === "|-" || trimmed === "|+";
  const isFolded = trimmed === ">" || trimmed === ">-" || trimmed === ">+";
  if (isLiteral || isFolded) {
    const { body, next } = collectBlock(lines, i + 1, keyIndent);
    if (isFolded) {
      const joined = body.map((l) => l.trim()).filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
      return { values: joined ? [joined] : [], next };
    }
    return { values: body.map((l) => l.trim()), next };
  }
  return { values: trimmed ? [trimmed] : [], next: i + 1 };
}
function parseYamlMap(lines, startIndex, mapIndent) {
  const map = {};
  let i = startIndex;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (isIgnorable(line)) continue;
    const indent = lineIndent(line);
    if (indent < mapIndent) break;
    if (indent > mapIndent) continue;
    const m = /^\s*([^:#\s][^:]*)\s*:\s*(.*)$/.exec(line);
    if (!m) break;
    map[m[1].trim()] = unquoteYamlScalar(m[2]);
  }
  return { map, next: i };
}

function isAllowedCancelledIf(value) {
  const norm = String(value ?? "").replace(/\$\{\{|\}\}/g, "").replace(/\s+/g, "");
  return norm === "!cancelled()";
}

function normalizeGuardExpr(value) {
  return String(value ?? "").replace(/\$\{\{|\}\}/g, "").replace(/\s+/g, "");
}

function isLiteralFalse(value) {
  return normalizeGuardExpr(unquoteYamlScalar(value ?? "")).toLowerCase() === "false";
}

/** 出现 continue-on-error 键且值不是字面 false / ${{ false }} 即须登记（含 ${{ true }} / ${{ 1 }}）。 */
function requiresContinueOnErrorRegistration(value) {
  if (value === undefined) return false;
  return !isLiteralFalse(value);
}


function parseDefaultsShell(lines, start, minIndent) {
  let i = start;
  let shell;
  for (; i < lines.length; i++) {
    if (isIgnorable(lines[i])) continue;
    if (lineIndent(lines[i]) < minIndent) break;
    const m = /^\s*shell:\s*(.*)$/.exec(lines[i]);
    if (m) shell = unquoteYamlScalar(m[1]);
  }
  return { shell, next: i };
}

function parseWorkflowDefaultsShell(text) {
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (/^defaults:\s*$/.test(lines[i])) {
      const { shell } = parseDefaultsShell(lines, i + 1, 2);
      return shell;
    }
    if (/^jobs:\s*$/.test(lines[i])) break;
  }
  return undefined;
}

function parseWorkflowDocument(text) {
  const lines = text.split(/\r?\n/);
  const defaultsShell = parseWorkflowDefaultsShell(text);
  const jobs = [];
  const steps = [];
  let i = 0;
  while (i < lines.length) {
    const jobsHeading = /^( *)jobs:\s*$/.exec(lines[i]);
    if (!jobsHeading) { i++; continue; }
    const jobsIndent = jobsHeading[1].length;
    const jobIndent = jobsIndent + 2;
    const jobKeyIndent = jobIndent + 2;
    const itemIndent = jobKeyIndent + 2;
    i++;
    while (i < lines.length) {
      if (isIgnorable(lines[i])) { i++; continue; }
      const indent = lineIndent(lines[i]);
      if (indent <= jobsIndent) break;
      const jobHead = new RegExp(`^ {${jobIndent}}([^\\s:][^:]*):\\s*$`).exec(lines[i]);
      if (!jobHead) { i++; continue; }
      const job = { id: jobHead[1], if: undefined, continueOnError: undefined, shell: undefined };
      i++;
      while (i < lines.length) {
        if (isIgnorable(lines[i])) { i++; continue; }
        const ji = lineIndent(lines[i]);
        if (ji <= jobIndent) break;
        const stepsHead = new RegExp(`^ {${jobKeyIndent}}steps:\\s*$`).exec(lines[i]);
        if (stepsHead) {
          i++;
          const inheritedShell = job.shell ?? defaultsShell;
          while (i < lines.length) {
            if (isIgnorable(lines[i])) { i++; continue; }
            const si = lineIndent(lines[i]);
            if (si <= jobKeyIndent) break;
            const item = new RegExp(`^ {${itemIndent}}-\\s+(.*)$`).exec(lines[i]);
            if (!item) { i++; continue; }
            const step = { name: "", if: undefined, continueOnError: undefined, env: {}, runLines: [], uses: "", shell: undefined, jobId: job.id, inheritedShell };
            const loadKey = (raw, keyLine, keyIndent) => {
              const km = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(raw);
              if (!km) return keyLine + 1;
              const key = km[1];
              const rest = km[2];
              if (key === "name") {
                const { values, next } = applyScalar(lines, keyLine, rest, keyIndent);
                step.name = values.join(" ").trim();
                return next;
              }
              if (key === "uses") {
                step.uses = unquoteYamlScalar(rest);
                return keyLine + 1;
              }
              if (key === "if") {
                const { values, next } = applyScalar(lines, keyLine, rest, keyIndent);
                step.if = values.map(unquoteYamlScalar).join(" ");
                return next;
              }
              if (key === "continue-on-error") {
                step.continueOnError = unquoteYamlScalar(rest);
                return keyLine + 1;
              }
              if (key === "shell") {
                step.shell = unquoteYamlScalar(rest);
                return keyLine + 1;
              }
              if (key === "env") {
                const { map, next } = parseYamlMap(lines, keyLine + 1, keyIndent + 2);
                step.env = map;
                return next;
              }
              if (key === "run") {
                const { values, next } = applyScalar(lines, keyLine, rest, keyIndent);
                step.runLines.push(...values);
                return next;
              }
              if (key === "with") {
                const { next } = parseYamlMap(lines, keyLine + 1, keyIndent + 2);
                return next;
              }
              return keyLine + 1;
            };
            i = loadKey(item[1], i, itemIndent + 2);
            while (i < lines.length) {
              if (isIgnorable(lines[i])) { i++; continue; }
              const ki = lineIndent(lines[i]);
              if (ki <= itemIndent) break;
              const keyLine = new RegExp(`^ {${itemIndent + 2}}([A-Za-z0-9_-]+\\s*:.*)$`).exec(lines[i]);
              if (keyLine) i = loadKey(keyLine[1], i, itemIndent + 2);
              else i++;
            }
            steps.push(step);
          }
          continue;
        }
        const jobKey = new RegExp(`^ {${jobKeyIndent}}([A-Za-z0-9_-]+)\\s*:\\s*(.*)$`).exec(lines[i]);
        if (jobKey) {
          if (jobKey[1] === "if") job.if = unquoteYamlScalar(jobKey[2]);
          if (jobKey[1] === "continue-on-error") job.continueOnError = unquoteYamlScalar(jobKey[2]);
          if (jobKey[1] === "defaults") {
            const { shell, next } = parseDefaultsShell(lines, i + 1, jobKeyIndent + 2);
            job.shell = shell;
            i = next;
            continue;
          }
        }
        i++;
      }
      jobs.push(job);
    }
  }
  return { jobs, steps, defaultsShell };
}


function applyInlineExports(line, env) {
  let rest = line.trim();
  while (true) {
    const exp = /^export\s+([A-Z][A-Z0-9_]*)=(\S+)(?:\s*;\s*|\s+&&\s+|\s*$)/.exec(rest);
    if (!exp) break;
    env[exp[1]] = unquoteYamlScalar(exp[2]);
    rest = rest.slice(exp[0].length).trim();
    if (!rest) return { env, rest: "" };
  }
  const uns = /^unset\s+([A-Z][A-Z0-9_]*)(?:\s*;\s*|\s+&&\s+|\s*$)/.exec(rest);
  if (uns) {
    delete env[uns[1]];
    rest = rest.slice(uns[0].length).trim();
  }
  const ge = /^(?:echo|printf)\s+([A-Z][A-Z0-9_]*)=(\S+)\s*>>\s*"?\$\{?GITHUB_ENV\}?"?\s*$/.exec(rest);
  if (ge) {
    env[ge[1]] = unquoteYamlScalar(ge[2]);
    rest = "";
  }
  return { env, rest };
}

function stepCommandIdentities(step) {
  const env = { ...step.env };
  const out = [];
  for (const line of step.runLines) {
    const { rest } = applyInlineExports(line, env);
    if (!rest) continue;
    const id = commandIdentity(rest, env);
    if (id) out.push(id);
  }
  return out;
}

function workflowTrackedCommands(text) {
  const { steps } = parseWorkflowDocument(text);
  return steps.flatMap(stepCommandIdentities);
}

function extractLedgerMarkers(raw) {
  const markers = { ifs: [], continueOnError: false, jobs: [], setPlusE: false, exitZero: false, shell: false };
  for (const m of String(raw ?? "").matchAll(/`([^`]+)`/g)) {
    const inner = m[1].trim();
    const combo = /^job:\s*(\S+)\s+if:\s*(.+)$/i.exec(inner);
    if (combo) {
      markers.jobs.push(combo[1]);
      markers.ifs.push(normalizeGuardExpr(combo[2]));
      continue;
    }
    const ifm = /^if:\s*(.+)$/i.exec(inner);
    if (ifm) markers.ifs.push(normalizeGuardExpr(ifm[1]));
    if (/^continue-on-error\b/i.test(inner)) markers.continueOnError = true;
    const jobm = /^job:\s*(\S+)$/i.exec(inner) || /^job\s+(\S+)$/i.exec(inner);
    if (jobm) markers.jobs.push(jobm[1]);
    if (/^set\s+\+e$/i.test(inner)) markers.setPlusE = true;
    if (/^exit\s+0$/i.test(inner)) markers.exitZero = true;
    if (/^shell:\s*/i.test(inner) || inner === "shell:") markers.shell = true;
  }
  return markers;
}

function rowRegistersIf(row, ifValue, jobId) {
  const markers = extractLedgerMarkers(row.raw);
  if (!markers.ifs.includes(normalizeGuardExpr(ifValue))) return false;
  if (jobId) return markers.jobs.includes(jobId);
  return markers.jobs.length === 0;
}

function rowRegistersContinueOnError(row, jobId) {
  const markers = extractLedgerMarkers(row.raw);
  if (!markers.continueOnError) return false;
  if (jobId) return markers.jobs.includes(jobId);
  return markers.jobs.length === 0;
}

function rowRegistersSemantic(row, kind, jobId) {
  const markers = extractLedgerMarkers(row.raw);
  const hit = kind === "set +e" ? markers.setPlusE : kind === "exit 0" ? markers.exitZero : kind === "shell" ? markers.shell : false;
  if (!hit) return false;
  if (jobId) return markers.jobs.includes(jobId);
  return markers.jobs.length === 0;
}

function firstSignificantRunLine(step) {
  for (const line of step.runLines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) return trimmed;
  }
  return "";
}

function stepSemanticIssues(step) {
  const issues = [];
  const shell = step.shell ?? step.inheritedShell;
  if (shell !== undefined) issues.push({ kind: "shell", detail: shell });
  const first = firstSignificantRunLine(step);
  if (/^exit(\s+0)?(\s|;|$)/.test(first)) issues.push({ kind: "exit 0", detail: first });
  if (step.runLines.some((l) => /^set\s+\+e\b/.test(l.trim()))) issues.push({ kind: "set +e", detail: "set +e" });
  return issues;
}

function checkCiStepLedger(input = {}) {
  const problems = [];
  const read = (rel) => (existsSync(join(root, rel)) ? readFileSync(join(root, rel), "utf8") : undefined);
  const doc = input.doc ?? read(CI_LEDGER_DOC);
  const ciText = input.ciText ?? read(".github/workflows/ci.yml");
  const nightlyText = input.nightlyText ?? read(".github/workflows/nightly-ciw2.yml");
  const pkgText = input.pkgText ?? read("package.json");
  if (!doc || !ciText || !nightlyText || !pkgText) return ["ci step ledger: missing ci-cd.md / ci.yml / nightly-ciw2.yml / package.json"];
  const start = doc.indexOf("### 8.2");
  const end = doc.indexOf("### 8.3", start + 1);
  if (start < 0 || end < 0) return [`ci step ledger: ${CI_LEDGER_DOC} must contain §8.2 and §8.3 headings`];
  const ledger = new Map();
  const ledgerRows = [];
  for (const line of doc.slice(start, end).split("\n")) {
    if (!line.startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 4 || cells[0] === "#" || /^-+$/.test(cells[0])) continue;
    const [id, , cmdCell, destCell] = cells;
    let dest;
    if (destCell.includes("保留")) dest = ["ci"];
    else if (destCell.includes("仅 nightly")) dest = ["nightly"];
    else if (destCell.includes("nightly")) dest = ["nightly", "local"];
    else if (destCell.includes("本地手跑")) dest = ["local"];
    else { problems.push(`ci step ledger: row ${id} has unknown destination ${JSON.stringify(destCell)}`); continue; }
    const row = { id, dest, raw: line };
    ledgerRows.push(row);
    for (const m of cmdCell.matchAll(/`([^`]+)`/g)) {
      const cmd = commandIdentity(m[1], {});
      if (!cmd) continue;
      if (ledger.has(cmd)) problems.push(`ci step ledger: command ${JSON.stringify(cmd)} listed twice (rows ${ledger.get(cmd).id} and ${id})`);
      ledger.set(cmd, row);
    }
  }
  if (ledger.size === 0) return [`ci step ledger: no commands parsed from ${CI_LEDGER_DOC} §8.2`];
  const verifyLocal = JSON.parse(pkgText).scripts?.["verify:local"] ?? "";
  const surfaces = {
    ci: new Set(workflowTrackedCommands(ciText)),
    nightly: new Set(workflowTrackedCommands(nightlyText)),
    local: new Set(verifyLocal.split("&&").map((part) => commandIdentity(part, {})).filter(Boolean)),
  };
  const surfaceName = { ci: ".github/workflows/ci.yml", nightly: ".github/workflows/nightly-ciw2.yml", local: "package.json verify:local" };
  for (const [surface, cmds] of Object.entries(surfaces)) {
    for (const cmd of cmds) {
      if (!ledger.has(cmd)) problems.push(`ci step ledger: ${surfaceName[surface]} runs ${JSON.stringify(cmd)} but ${CI_LEDGER_DOC} §8.2 has no row for it`);
    }
  }
  for (const [cmd, { id, dest }] of ledger) {
    for (const surface of Object.keys(surfaces)) {
      const present = surfaces[surface].has(cmd);
      if (dest.includes(surface) && !present) problems.push(`ci step ledger: row ${id} ${JSON.stringify(cmd)} declared in ${surfaceName[surface]} but missing there`);
      if (!dest.includes(surface) && present && !CI_LEDGER_INFRA.has(cmd)) problems.push(`ci step ledger: row ${id} ${JSON.stringify(cmd)} also runs in ${surfaceName[surface]} but ledger destination excludes it`);
    }
  }

  const checkWorkflowGuards = (text, surfaceLabel) => {
    const { jobs, steps, defaultsShell } = parseWorkflowDocument(text);
    for (const job of jobs) {
      if (job.if !== undefined && !isAllowedCancelledIf(job.if)) {
        const registered = ledgerRows.some((row) => rowRegistersIf(row, job.if, job.id));
        if (!registered) problems.push(`ci step ledger: ${surfaceLabel} job ${JSON.stringify(job.id)} has if: ${JSON.stringify(job.if)} which is not !cancelled() and is not registered in ${CI_LEDGER_DOC} §8.2`);
      }
      if (requiresContinueOnErrorRegistration(job.continueOnError)) {
        const registered = ledgerRows.some((row) => rowRegistersContinueOnError(row, job.id));
        if (!registered) problems.push(`ci step ledger: ${surfaceLabel} job ${JSON.stringify(job.id)} has continue-on-error: ${JSON.stringify(job.continueOnError)} which is not registered in ${CI_LEDGER_DOC} §8.2`);
      }
      if (job.shell !== undefined) {
        const registered = ledgerRows.some((row) => rowRegistersSemantic(row, "shell", job.id));
        if (!registered) problems.push(`ci step ledger: ${surfaceLabel} job ${JSON.stringify(job.id)} has shell: ${JSON.stringify(job.shell)} which is not registered in ${CI_LEDGER_DOC} §8.2`);
      }
    }
    if (defaultsShell !== undefined) {
      const registered = ledgerRows.some((row) => rowRegistersSemantic(row, "shell"));
      if (!registered) problems.push(`ci step ledger: ${surfaceLabel} workflow defaults.run.shell: ${JSON.stringify(defaultsShell)} which is not registered in ${CI_LEDGER_DOC} §8.2`);
    }
    for (const step of steps) {
      const label = step.name || step.uses || step.runLines[0] || "(unnamed step)";
      const associated = stepCommandIdentities(step).map((cmd) => ledger.get(cmd)).filter(Boolean);
      if (step.if !== undefined && !isAllowedCancelledIf(step.if)) {
        const registered = associated.some((row) => rowRegistersIf(row, step.if)) || (associated.length === 0 && ledgerRows.some((row) => rowRegistersIf(row, step.if)));
        if (!registered) problems.push(`ci step ledger: ${surfaceLabel} step ${JSON.stringify(label)} has if: ${JSON.stringify(step.if)} which is not !cancelled() and is not registered in ${CI_LEDGER_DOC} §8.2`);
      }
      if (requiresContinueOnErrorRegistration(step.continueOnError)) {
        const registered = associated.some((row) => rowRegistersContinueOnError(row)) || (associated.length === 0 && ledgerRows.some((row) => rowRegistersContinueOnError(row)));
        if (!registered) problems.push(`ci step ledger: ${surfaceLabel} step ${JSON.stringify(label)} has continue-on-error: ${JSON.stringify(step.continueOnError)} which is not registered in ${CI_LEDGER_DOC} §8.2`);
      }
      for (const issue of stepSemanticIssues(step)) {
        const registered = associated.some((row) => rowRegistersSemantic(row, issue.kind)) || (associated.length === 0 && ledgerRows.some((row) => rowRegistersSemantic(row, issue.kind)));
        if (!registered) problems.push(`ci step ledger: ${surfaceLabel} step ${JSON.stringify(label)} has ${issue.kind}${issue.detail && issue.kind === "shell" ? `: ${JSON.stringify(issue.detail)}` : ""} which is not registered in ${CI_LEDGER_DOC} §8.2`);
      }
    }
  };
  checkWorkflowGuards(ciText, ".github/workflows/ci.yml");
  checkWorkflowGuards(nightlyText, ".github/workflows/nightly-ciw2.yml");
  return problems;
}


function ledgerFixture() {
  const doc = [
    "### 8.2 原 verify",
    "",
    "| # | 原步骤 | 命令 | 去向 |",
    "|---|---|---|---|",
    "| 1 | docs | `pnpm docs:check` | 保留（PR/main） |",
    "| 2 | upgrade | `MIGRATE_UPGRADE_REQUIRE_GIT_ARM=1 pnpm migrate-upgrade:prove` | 移到 nightly（nightly-ciw2 · verify:local 亦含） |",
    "| 41 | acl | `pnpm db-acl2:prove` ; `pnpm checkpoint-role:prove` | 移到 nightly（nightly-ciw2 · 42501 负门 · verify:local 亦含） |",
    "",
    "### 8.3 nightly",
    "",
  ].join("\n");
  const ciText = [
    "name: ci",
    "jobs:",
    "  verify:",
    "    steps:",
    "      - run: pnpm docs:check",
    "",
  ].join("\n");
  const nightlyText = [
    "name: nightly-ciw2",
    "jobs:",
    "  prove-placement:",
    "    steps:",
    "      - name: upgrade",
    "        env:",
    "          MIGRATE_UPGRADE_REQUIRE_GIT_ARM: '1'",
    "        run: pnpm migrate-upgrade:prove",
    "      - name: 权限 / RLS",
    "        run: |",
    "          pnpm db-acl2:prove",
    "          pnpm checkpoint-role:prove",
    "",
  ].join("\n");
  const pkgText = JSON.stringify({
    scripts: {
      "verify:local": "MIGRATE_UPGRADE_REQUIRE_GIT_ARM=1 pnpm migrate-upgrade:prove && pnpm db-acl2:prove && pnpm checkpoint-role:prove",
    },
  });
  return { doc, ciText, nightlyText, pkgText };
}

function assertLedgerGateBlindspots() {
  const problems = [];
  const expectFail = (name, input, needle) => {
    const found = checkCiStepLedger(input);
    if (found.length === 0) {
      problems.push(`ci step ledger counterexample ${name}: expected EXIT1-class problems, got none`);
      return;
    }
    if (needle && !found.some((p) => p.includes(needle))) {
      problems.push(`ci step ledger counterexample ${name}: expected a problem containing ${JSON.stringify(needle)}, got: ${found.join(" | ")}`);
    }
  };
  const expectPass = (name, input) => {
    const found = checkCiStepLedger(input);
    if (found.length > 0) problems.push(`ci step ledger counterexample ${name}: expected clean, got: ${found.join(" | ")}`);
  };

  const base = ledgerFixture();
  expectPass("baseline", base);

  expectFail("F9-strip-local-env-prefix", {
    ...base,
    pkgText: JSON.stringify({ scripts: { "verify:local": "pnpm migrate-upgrade:prove && pnpm db-acl2:prove && pnpm checkpoint-role:prove" } }),
  }, "MIGRATE_UPGRADE_REQUIRE_GIT_ARM=1 pnpm migrate-upgrade:prove");

  expectFail("F9b-step-env-value-0", {
    ...base,
    nightlyText: base.nightlyText.replace("MIGRATE_UPGRADE_REQUIRE_GIT_ARM: '1'", "MIGRATE_UPGRADE_REQUIRE_GIT_ARM: '0'"),
  }, "MIGRATE_UPGRADE_REQUIRE_GIT_ARM=0");

  expectFail("F9g-export-overrides-env", {
    ...base,
    nightlyText: [
      "name: nightly-ciw2",
      "jobs:",
      "  prove-placement:",
      "    steps:",
      "      - name: upgrade",
      "        env:",
      "          MIGRATE_UPGRADE_REQUIRE_GIT_ARM: '1'",
      "        run: |",
      "          export MIGRATE_UPGRADE_REQUIRE_GIT_ARM=0",
      "          pnpm migrate-upgrade:prove",
      "      - name: 权限 / RLS",
      "        run: |",
      "          pnpm db-acl2:prove",
      "          pnpm checkpoint-role:prove",
      "",
    ].join("\n"),
  }, "MIGRATE_UPGRADE_REQUIRE_GIT_ARM=0");

  expectFail("F11-if-false", {
    ...base,
    ciText: [
      "name: ci",
      "jobs:",
      "  verify:",
      "    steps:",
      "      - name: docs",
      "        if: false",
      "        run: pnpm docs:check",
      "",
    ].join("\n"),
  }, 'if: "false"');

  expectFail("F11g-multiline-step-if-0", {
    ...base,
    nightlyText: base.nightlyText.replace("      - name: 权限 / RLS\n        run: |", "      - name: 权限 / RLS\n        if: 0\n        run: |"),
  }, 'if: "0"');

  expectFail("F11j-nightly-job-if-0", {
    ...base,
    nightlyText: base.nightlyText.replace("  prove-placement:\n    steps:", "  prove-placement:\n    if: 0\n    steps:"),
  }, 'job "prove-placement" has if: "0"');

  expectFail("F12-continue-on-error-true", {
    ...base,
    ciText: [
      "name: ci",
      "jobs:",
      "  verify:",
      "    steps:",
      "      - name: docs",
      "        continue-on-error: true",
      "        run: pnpm docs:check",
      "",
    ].join("\n"),
  }, "continue-on-error");

  expectFail("F12c-continue-on-error-expr-true", {
    ...base,
    nightlyText: base.nightlyText.replace("      - name: upgrade\n        env:", "      - name: upgrade\n        continue-on-error: ${{ true }}\n        env:"),
  }, "continue-on-error");

  expectFail("F12d-job-continue-on-error-expr-true", {
    ...base,
    nightlyText: base.nightlyText.replace("  prove-placement:\n    steps:", "  prove-placement:\n    continue-on-error: ${{ true }}\n    steps:"),
  }, 'job "prove-placement" has continue-on-error');

  expectFail("F12f-continue-on-error-expr-1", {
    ...base,
    ciText: [
      "name: ci",
      "jobs:",
      "  verify:",
      "    steps:",
      "      - name: docs",
      "        continue-on-error: ${{ 1 }}",
      "        run: pnpm docs:check",
      "",
    ].join("\n"),
  }, "continue-on-error");

  expectFail("F13-env-FOO-pnpm-unregistered", {
    ...base,
    ciText: base.ciText + "      - run: env FOO=1 pnpm foo:prove\n",
  }, "FOO=1 pnpm foo:prove");

  expectFail("F14-bash-unregistered", {
    ...base,
    ciText: base.ciText + "      - run: bash scripts/foo.sh\n",
  }, "bash scripts/foo.sh");

  expectFail("F14b-npx-unregistered", {
    ...base,
    ciText: base.ciText + "      - run: npx tsx scripts/foo.ts\n",
  }, "npx tsx scripts/foo.ts");

  expectFail("F15-cd-and-pnpm-unregistered", {
    ...base,
    ciText: base.ciText + "      - run: cd apps/api && pnpm prove:foo\n",
  }, "cd apps/api && pnpm prove:foo");

  expectFail("F15d-folded-run-extra-args", {
    ...base,
    ciText: [
      "name: ci",
      "jobs:",
      "  verify:",
      "    steps:",
      "      - run: >",
      "          pnpm docs:check",
      "          --strict",
      "",
    ].join("\n"),
  }, "pnpm docs:check --strict");

  expectFail("N1-leading-exit-0", {
    ...base,
    ciText: [
      "name: ci",
      "jobs:",
      "  verify:",
      "    steps:",
      "      - name: docs",
      "        run: |",
      "          exit 0",
      "          pnpm docs:check",
      "",
    ].join("\n"),
  }, "exit 0");

  expectFail("N2-set-plus-e", {
    ...base,
    ciText: [
      "name: ci",
      "jobs:",
      "  verify:",
      "    steps:",
      "      - name: docs",
      "        run: |",
      "          set +e",
      "          pnpm docs:check",
      "          echo done",
      "",
    ].join("\n"),
  }, "set +e");

  expectFail("N8-shell-override", {
    ...base,
    nightlyText: base.nightlyText.replace("      - name: 权限 / RLS\n        run: |", "      - name: 权限 / RLS\n        shell: bash {0}\n        run: |"),
  }, "shell:");

  expectPass("allowed-if-cancelled", {
    ...base,
    nightlyText: [
      "name: nightly-ciw2",
      "jobs:",
      "  prove-placement:",
      "    steps:",
      "      - name: upgrade",
      "        if: ${{ !cancelled() }}",
      "        env:",
      "          MIGRATE_UPGRADE_REQUIRE_GIT_ARM: '1'",
      "        run: pnpm migrate-upgrade:prove",
      "      - name: 权限 / RLS",
      "        run: |",
      "          pnpm db-acl2:prove",
      "          pnpm checkpoint-role:prove",
      "",
    ].join("\n"),
  });

  expectPass("registered-if-false", {
    ...base,
    doc: base.doc.replace("| 1 | docs | `pnpm docs:check` | 保留（PR/main） |", "| 1 | docs | `pnpm docs:check` | 保留（PR/main · 登记 `if: false`） |"),
    ciText: [
      "name: ci",
      "jobs:",
      "  verify:",
      "    steps:",
      "      - name: docs",
      "        if: false",
      "        run: pnpm docs:check",
      "",
    ].join("\n"),
  });

  expectPass("registered-continue-on-error", {
    ...base,
    doc: base.doc.replace("| 1 | docs | `pnpm docs:check` | 保留（PR/main） |", "| 1 | docs | `pnpm docs:check` | 保留（PR/main · 登记 `continue-on-error`） |"),
    ciText: [
      "name: ci",
      "jobs:",
      "  verify:",
      "    steps:",
      "      - name: docs",
      "        continue-on-error: true",
      "        run: pnpm docs:check",
      "",
    ].join("\n"),
  });

  expectPass("registered-job-if-0", {
    ...base,
    doc: base.doc.replace(
      "| 2 | upgrade | `MIGRATE_UPGRADE_REQUIRE_GIT_ARM=1 pnpm migrate-upgrade:prove` | 移到 nightly（nightly-ciw2 · verify:local 亦含） |",
      "| 2 | upgrade | `MIGRATE_UPGRADE_REQUIRE_GIT_ARM=1 pnpm migrate-upgrade:prove` | 移到 nightly（nightly-ciw2 · verify:local 亦含 · 登记 `job: prove-placement` `if: 0`） |",
    ),
    nightlyText: base.nightlyText.replace("  prove-placement:\n    steps:", "  prove-placement:\n    if: 0\n    steps:"),
  });

  expectFail("job-if-0-without-job-id-marker", {
    ...base,
    doc: base.doc.replace(
      "| 2 | upgrade | `MIGRATE_UPGRADE_REQUIRE_GIT_ARM=1 pnpm migrate-upgrade:prove` | 移到 nightly（nightly-ciw2 · verify:local 亦含） |",
      "| 2 | upgrade | `MIGRATE_UPGRADE_REQUIRE_GIT_ARM=1 pnpm migrate-upgrade:prove` | 移到 nightly（nightly-ciw2 · verify:local 亦含 · 登记 `if: 0`） |",
    ),
    nightlyText: base.nightlyText.replace("  prove-placement:\n    steps:", "  prove-placement:\n    if: 0\n    steps:"),
  }, 'job "prove-placement" has if: "0"');

  expectPass("literal-false-continue-on-error-ok", {
    ...base,
    ciText: [
      "name: ci",
      "jobs:",
      "  verify:",
      "    steps:",
      "      - name: docs",
      "        continue-on-error: false",
      "        run: pnpm docs:check",
      "",
    ].join("\n"),
  });

  return problems;
}

const LEDGER_BLINDSPOT_CASES = [
  "F9-strip-local-env-prefix", "F9b-step-env-value-0", "F9g-export-overrides-env",
  "F11-if-false", "F11g-multiline-step-if-0", "F11j-nightly-job-if-0",
  "F12-continue-on-error-true", "F12c-continue-on-error-expr-true", "F12d-job-continue-on-error-expr-true", "F12f-continue-on-error-expr-1",
  "F13-env-FOO-pnpm-unregistered", "F14-bash-unregistered", "F14b-npx-unregistered", "F15-cd-and-pnpm-unregistered", "F15d-folded-run-extra-args",
  "N1-leading-exit-0", "N2-set-plus-e", "N8-shell-override",
];

function assertBlindspotHarnessWired() {
  const problems = [];
  const self = readFileSync(new URL(import.meta.url).pathname, "utf8");
  // 必须是 runCiStepLedgerGate 里的展开调用，不能靠源码其它地方（含本函数报错文案）的同名子串蒙混。
  const wired = /function\s+runCiStepLedgerGate\s*\(\s*\)\s*\{[^}]*\.\.\.checkCiStepLedger\s*\(\s*\)\s*,\s*\.\.\.assertLedgerGateBlindspots\s*\(\s*\)\s*,\s*\.\.\.assertBlindspotHarnessWired\s*\(\s*\)/.test(self);
  if (!wired) problems.push("ci step ledger: in-gate counterexample harness is not wired inside runCiStepLedgerGate");
  for (const name of LEDGER_BLINDSPOT_CASES) {
    if (!self.includes(`"${name}"`)) problems.push(`ci step ledger: in-gate counterexample ${name} is missing from the harness`);
  }
  return problems;
}

function runCiStepLedgerGate() {
  return [...checkCiStepLedger(), ...assertLedgerGateBlindspots(), ...assertBlindspotHarnessWired()];
}

for (const problem of runCiStepLedgerGate()) errors.push(problem);

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

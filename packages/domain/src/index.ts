/**
 * @meetwise/domain — 纯领域逻辑（零 IO、零模型、零 db）。可被 ai-graphs 在节点里安全调用。
 * S2 摄取清洗 + factuality 歪曲门。此前住在 kernel/ingest.ts。
 */
export interface ProfileItem { text: string; line: number }
export interface ResumeProfile {
  experience: ProfileItem[];
  skills: ProfileItem[];
  facts: string[];                                  // 接地事实集（factuality 用）
  pii: { field: string; masked: string; line: number }[];
  blocked: { line: number; reason: string; raw: string }[];
}

// 先 NFKC 归一（全角数字 １→1 等），再匹配——否则全角/分隔符 PII 绕过去（审计 P0-3）。
const normalize = (t: string) => t.normalize('NFKC');
const PII = [
  // 手机：两式——带 86 前缀(吃掉前缀,无需 lookbehind) 或 裸 11 位(lookbehind 防黏连)。否则 +86 会被 86 的 '6' 顶掉 lookbehind 漏掉。
  { field: 'phone', re: /(?:\+?86[-\s]?)1[3-9]\d{9}(?!\d)|(?<!\d)1[3-9]\d{9}(?!\d)/g },
  // 邮箱：local-part 容许 unicode（用户@…），否则中文 local 漏（审计 P0-3）
  { field: 'email', re: /[^\s@]+@[^\s@]+\.[^\s@]+/g },
  // 证件：18 位（末位可 X）或 15 位旧号
  { field: 'idcard', re: /(?<!\d)(?:\d{17}[\dXx]|\d{15})(?!\d)/g },
];
const INJECTION = [/忽略.*(指令|以上|前面|上述)/, /ignore (previous|above|all)/i, /给(我)?(满分|高分|100)/, /system\s*[:：]/i, /你现在是/];

const mask = (v: string) => (v.length <= 4 ? '***' : v.slice(0, 2) + '***' + v.slice(-2));
// 兜底（fail-closed）：**任意非字母数字分隔符**（点/顿号/斜杠/下划线/空格/横杠…）拆开的 ≥11 位数字串一律脱敏。
// 只认空格/横杠会被 138.0013.8000、138、0013… 绕过（审计 P0-3 separator-evasion）。分隔符跨度限 0-3 防跨号合并。
// 追踪(低危,审计 round3)：逐行处理,被真换行拆成两半的号码不被本行兜底命中（半截各自非可用 PII;真实仅复制粘贴残片）。
const redactResidualDigits = (s: string) => s.replace(/\d(?:[^0-9A-Za-z]{0,3}\d){10,}/g, '[已脱敏]');
const stripPii = (t: string) => redactResidualDigits(PII.reduce((s, p) => s.replace(p.re, '[已脱敏]'), normalize(t)));

/** 原始简历文本 → 结构化 ResumeProfile。注入即拦（不进结构化、不喂模型）；PII 标记并脱敏，绝不存原文。 */
export function ingestResume(raw: string): ResumeProfile {
  const p: ResumeProfile = { experience: [], skills: [], facts: [], pii: [], blocked: [] };
  let section: 'experience' | 'skills' | 'other' = 'other';
  raw.split('\n').forEach((line, i) => {
    const t = line.trim();
    if (!t) return;
    const ln = i + 1;
    const nt = normalize(t);
    // PII 标记先于注入判定（注入行也可能含 PII，否则计数漏；存脱敏值，绝不存原文）
    for (const pat of PII) { const m = nt.match(pat.re); if (m) for (const v of m) p.pii.push({ field: pat.field, masked: mask(v), line: ln }); }
    // 不可信输入：注入即拦，不进结构化、不喂模型；raw 也脱敏（防被日志带出 PII，审计 P2-10）
    for (const re of INJECTION) if (re.test(nt)) { p.blocked.push({ line: ln, reason: 'suspected_injection', raw: stripPii(t) }); return; }
    if (/(经历|经验|experience)/i.test(t) && t.length < 12) { section = 'experience'; return; }
    if (/(技能|skills)/i.test(t) && t.length < 10) { section = 'skills'; return; }
    if (/(教育|项目|联系|education|project|contact)/i.test(t) && t.length < 12) { section = 'other'; return; }
    const clean = stripPii(t);
    if (section === 'experience') { p.experience.push({ text: clean, line: ln }); p.facts.push(clean); }
    else if (section === 'skills') {
      clean.split(/[、,，/]/).map((s) => s.trim()).filter(Boolean).forEach((s) => { p.skills.push({ text: s, line: ln }); p.facts.push(s); });
    }
  });
  return p;
}

/** factuality 歪曲门：每个 ref 必须是某条 fact 的子串（最小长度防短词误命中），否则判幻觉/歪曲。
 *  护栏只能单向 ref ⊆ fact——反向会放过"精通Redis集群运维三年"这类真词包装的假声明（审计 H11）。 */
export function groundedByFacts(refs: string[], facts: string[]): boolean {
  return refs.every((r) => r.trim().length >= 2 && facts.some((f) => f.includes(r)));
}

// B 端题库安全（反窃取 / 反注入）
export { sampleQuestions, candidateView, containsBankSecret } from './bank-security.ts';
export type { BankQuestion } from './bank-security.ts';

// 认证核心（密码哈希 + 会话令牌）
export { hashPassword, verifyPassword, signToken, verifyToken, verifyTokenFull } from './auth.ts';
export type { VerifiedToken } from './auth.ts';

// 隐私删除授权签发器（ECDSA P-256 / ES256 JWS，与模型网关 Ed25519 刻意分离）
export {
  PRIVACY_AUTHZ_ISSUER, PRIVACY_AUTHZ_AUDIENCE, MAX_PRIVACY_AUTHZ_TTL_SEC, PRIVACY_AUTHZ_PURPOSES,
  PRIVACY_AUTHZ_SINK_KINDS, PRIVACY_AUTHZ_KID_RE, PRIVACY_AUTHZ_DIGEST_RE,
  canonicalTargetSetDigest, generatePrivacyAuthzKeyPair, publicKeyFromJwk,
  signPrivacyAuthorizationSnapshot, verifyPrivacyAuthorizationSnapshot, PrivacyAuthzKeyRegistry,
} from './privacy-authorization.ts';
export type {
  PrivacyAuthzPurpose, PrivacyAuthzTarget, PrivacyAuthorizationClaims, VerifiedPrivacyAuthorization,
  EcJwk, PrivacyAuthzPublicKey, PrivacyAuthzKeyMaterial, SignPrivacyAuthorizationInput, SignedPrivacyAuthorization, VerifyPrivacyAuthorizationInput,
} from './privacy-authorization.ts';

// 记忆治理（MEM-00）纯域原语：MEM 自己的 sink registry + span/digest 规范化（复用 issuer，不重实现）。
export { MEMORY_AUTHZ_SINK_KINDS, canonicalMemorySpan, memoryContentDigest, memorySourceDigest, assertMemoryFactContentSafe } from './memory-governance.ts';
export type { MemorySpanOffsetKind, MemorySpanLocator } from './memory-governance.ts';

// 记忆准入元标签门（MEM-12）纯域原语：spanLocator 单一坐标系(UTF-8 字节) + 六分量分离守护。
export {
  ADMISSION_SPAN_OFFSET_KIND, ADMISSION_MODEL_PRODUCERS,
  utf8ByteLength, canonicalAdmissionSpan,
  deriveAdmissionSourceTrust, assertAdmissionTrustSeparation,
} from './memory-admission.ts';
export type { AdmissionSpanOffsetKind, AdmissionSpanLocator } from './memory-admission.ts';

// 记忆事实裁决（MEM-13）纯域原语：稳定 factKey 派生 + subject 归一化 + 六分量分离守护。
export {
  MEMORY_FACT_NAMESPACES, MEMORY_FACT_CARDINALITIES, FACT_ADJUDICATION_SCOPE,
  normalizeFactSubject, deriveMemoryFactKey, assertFactAdjudicationSeparation,
} from './memory-fact-adjudication.ts';
export type { MemoryFactNamespace, MemoryFactCardinality } from './memory-fact-adjudication.ts';

// 索引 generation 治理（MEM-11）纯域原语：冻结 manifest digest + embedding recipe digest +
// 确定性 embedding 替身（proof 用）。真实 embed 归 MODEL-OP，本域只用 seam。
export {
  MEMORY_INDEX_MANIFEST_STATUSES, MEMORY_INDEX_CACHE_KINDS,
  deriveManifestDigest, deriveEmbeddingRecipeDigest, memoryVectorChecksum, deterministicMemoryEmbedder,
} from './memory-index-generation.ts';
export type {
  MemoryManifestItemDigestInput, MemoryEmbeddingRecipe, MemoryEmbedder,
} from './memory-index-generation.ts';

// 能力评估
export { deriveAssessment, aggregateScores } from './assessment.ts';
export type { AssessTurn, Dimension, Assessment } from './assessment.ts';

// 学习计划
export { deriveLearningPlan } from './learning.ts';
export type { LearnItem, LearningPlan } from './learning.ts';

// 职业路径
export { deriveCareerPath } from './career.ts';
export type { Milestone, CareerPath } from './career.ts';

// 成长档案/能力曲线（读侧聚合,纯逻辑）
export { deriveGrowth, toGrowthRow } from './growth.ts';
export type { GrowthRow, GrowthDim, GrowthPoint, GrowthTrend, GrowthView } from './growth.ts';

export {
  initMind, ingestAssessment, decideNext, withCurrent,
  isSkip, isNonAnswer, stripScoringManipulation, classifyTurn, markClarify, markUnresolved, clarifyHint, MAX_CLARIFY, MAX_PROBE,
  toCompetencySpecs, BEHAVIORAL_COMPETENCY,
  type InterviewMind, type Competency, type CompetencySpec, type NextAction, type QuestionKind, type TurnSignal, type TurnVerdict,
} from './adaptive-interview.ts';

export { isVerbatimCopy, validateGrounded, type SourceDoc, type GroundedQuestion, type GroundResult } from './grounded-questions.ts';

export { gradeRetrieval, cragRetrieve, degradedRetrieval, type ScoredRef, type CragAction, type CragVerdict, type CragDeps } from './crag.ts';
export { classifyInterviewResearchBoundary, type ResearchBoundaryDecision } from './research-policy.ts';

export { critiqueQuestion, type QuestionCritique } from './question-critique.ts';
// 简历多格式提取 + 清洗(PDF/Word/图片→文本)
export { extractResumeText, cleanResumeText, detectResumeFormat, type ResumeFileFormat } from './resume-extract.ts';

export { chunkStructuredDocument, type SourceLocator, type DocumentFormat, type ElementKind, type TextElement, type TableElement, type TranscriptElement, type DocumentElement, type StructuredDocument, type ChunkerRecipe, type RagChunk } from './rag-chunking.ts';

// 检索 ACL fail-closed（RAG-FUNNEL-01A）纯域原语：缺 principal / 跨租户 binding /
// 跨会话 replay / 私有越权 / global 无 provenance / 未知 visibility 一律拒绝。
export {
  RAG_RETRIEVAL_ACL_CODES, decideRagRetrievalAcl, assertRagRetrievalAcl,
} from './rag-retrieval-acl.ts';
export type {
  RagRetrievalAclCode, RagRetrievalAclInput, RagRetrievalAclDecision, RagRetrievalVisibility,
} from './rag-retrieval-acl.ts';

export { isAllowed, isPrivateHost, extractMaterial, webExplore, deepExplore, createSafeFetch, normalizeResearchQuery, formatUntrustedResearchMaterial, type AllowedSource, type FetchFn, type FetchedPage, type RawFetch, type RawResponse, type SafeFetchOpts, type DeepExploreOpts, type DeepExploreResult } from './web-explore.ts';

// 评分测量事实根（SCOR-01）纯域状态机：ScoreCard 证据流转移表 + 可评分判定（与迁移 0100 触发器逐值一致）。
export {
  SCORE_CARD_STATUSES, SCORE_REQUEST_STATUSES, QUESTION_RUBRIC_STATUSES,
  SCORE_CARD_TRANSITIONS, SCORE_CARD_NON_SCORING_STATUSES,
  canTransitionScoreCard, isScoreCardScorable,
} from './scoring-fact-root.ts';
export type { ScoreCardStatus, ScoreRequestStatus, QuestionRubricStatus } from './scoring-fact-root.ts';

// 岗位意图路由（RAG-FUNNEL-03 / ROUTE-01）纯域原语：canonical digest + 冻结校准策略 + rule 分类 +
// 模型输出双重校验 + 图内 planner 校验 + weighted-deficit scheduler。零 IO、零模型、零 db。
export {
  TAXONOMY_V1_LEAVES, JOB_ROUTE_TAXONOMY_VERSION, JOB_ROUTE_POLICY_VERSION,
  JOB_ROUTE_MAX_LEAVES, JOB_ROUTE_MIN_ALLOCATION_BPS, JOB_ROUTE_CONFIDENCE_THRESHOLD_BPS, JOB_ROUTE_MARGIN_THRESHOLD_BPS, JOB_ROUTE_TOTAL_BPS,
  canonicalJobSemanticDigest, classifyJobByRule, validateModelRouteOutput, jobRouteDecisionHash,
  validatePlannerOutput, nextWeightedDeficitLeaf, planWeightedDeficitRounds,
} from './job-route-classifier.ts';
export type {
  TaxonomyLeaf, JobRouteAllocation, JobRouteModelOutput, ValidateJobRouteOutputResult, InterviewPlannerOutput,
} from './job-route-classifier.ts';

// 评分确定性聚合（SCOR-02）纯域原语：确定性总分公式 + span/digest 文本级复验 + C 端 ScoreCard 评估消费面。
export {
  SCORE_SPAN_OFFSET_KIND, DISPOSITION_BANDS, DISPOSITION_BAND_VALUE,
  canonicalScoreSpan, scoreSpanDigest, reverifyScoreEvidenceSpan,
  computeDeterministicTotal, computeCoverage, aggregateScoreCards, deriveScoreCardAssessment,
} from './scoring-aggregation.ts';
export type {
  ScoreSpanOffsetKind, DispositionBand, ScoreSpan, DeterministicCriterion,
  ScoreCardAssessmentInput, ScoreCardAssessment,
} from './scoring-aggregation.ts';

// 评分证据冲突与多来源 uncertainty（SCOR-03）纯域原语：证据集 span/digest 文本级复验 +
// 8 来源分离守护 + 裁决（与 DB scoring_adjudicate_score_card 逐值一致，跨侧 proof pin）。
export {
  SCORE_UNCERTAINTY_SOURCE_COUNT,
  UNCERTAINTY_EVIDENCE_COVERAGE_VALUES, UNCERTAINTY_SOURCE_INTEGRITY_VALUES,
  UNCERTAINTY_VOICE_QUALITY_VALUES, UNCERTAINTY_RUBRIC_DIFFICULTY_VALUES, UNCERTAINTY_HUMAN_REVIEW_VALUES,
  reverifyScoreEvidenceSet, defaultScoreUncertainty, assertScoreUncertaintySeparation,
  resolveScoreCardAdjudication, deriveMissingRequiredCriteria,
} from './scoring-evidence-conflict.ts';
export type {
  ScoreEvidenceReverifyInput, ScoreEvidenceReverifyResult, ScoreUncertainty,
  ScoreCardAdjudicationInput, ScoreCardAdjudicationStatus, MissingRequiredCriterion,
  UncertaintyEvidenceCoverage, UncertaintySourceIntegrity, UncertaintyVoiceQuality,
  UncertaintyRubricDifficulty, UncertaintyHumanReview,
} from './scoring-evidence-conflict.ts';

// 面试输入分流 + 超长作答策略（CTX-01）纯域原语：面试 vs 自由对话显式分流 + reject-only 超长策略。
// 只做判定不建自由对话链路；评分事实不变性由 proof 复用 scoring-aggregation 原语证明（本模块不改评分公式）。
export {
  INTERVIEW_ANSWER_MAX_LENGTH, INPUT_ROUTE_KINDS, OVERLONG_POLICY_KINDS, SEGMENT_POLICIES,
  isInterviewQuestionIdentity, routeInterviewOrFreeConversation, resolveOverlongAnswerPolicy,
} from './input-routing.ts';
export type {
  InputRouteKind, OverlongPolicyKind, SegmentPolicy, OverlongAnswerPolicy, OverlongAnswerDecision,
  InterviewQuestionIdentity, RouteInputDecision,
} from './input-routing.ts';

// 两阶段召回 + 派发前复核（MEM-14）纯域原语：授权/范围版本 digest + 渲染 digest（E1 字节等价）。
export { deriveAuthorizationVersion, deriveRenderDigest } from './memory-two-stage-recall.ts';
export type { MemoryAuthorizationVersionInput, MemoryRenderSourceCard } from './memory-two-stage-recall.ts';

// track-local 检索（RAG-FUNNEL-04）纯域原语：冻结 RetrievalPlan + route scope digest 派生 +
// 幂等 plan key + 服务端校验（复用 RAG-03 validatePlannerOutput）。零 IO、零模型、零 db。
export {
  RETRIEVAL_POLICY_VERSION, RETRIEVAL_PLAN_STATUSES,
  deriveRouteScopeDigest, deriveRetrievalPlanKey, validateRetrievalPlan,
} from './qbank-track-local-retrieval.ts';
export type {
  RetrievalPlan, RetrievalPlanStatus, RetrievalPlanSnapshot, ValidateRetrievalPlanResult,
} from './qbank-track-local-retrieval.ts';

// track-local 无题时 LLM 同桶生成题（RAG-FUNNEL-05）纯域原语：canonical no-eligible verdict digest +
// QuestionPlan 幂等 key + 生成题正文 digest + plan/生成题服务端双重校验。零 IO、零模型、零 db。
export {
  QBANK_MISS_POLICY_VERSION, QUESTION_PLAN_STATUSES, ELIGIBILITY_VERDICTS,
  QBANK_MISS_SCORE_POLICY_VERSION, QBANK_MISS_PROMPT_POLICY_VERSION,
  QBANK_MISS_SCHEMA_POLICY_VERSION, QBANK_MISS_MODEL_POLICY_VERSION,
  GENERATED_QUESTION_MIN_LENGTH, GENERATED_QUESTION_MAX_LENGTH, GENERATED_FOCUS_MAX_LENGTH,
  deriveNoEligibleVerdictDigest, deriveQuestionPlanKey, deriveGeneratedQuestionDigest,
  validateQuestionPlan, validateGeneratedQuestion,
} from './qbank-miss.ts';
export type {
  QuestionPlanStatus, EligibilityVerdict, QuestionBlueprint, QuestionPlan,
  QuestionPlanSnapshot, QbankMissModelOutput, ValidateQuestionPlanResult, ValidateGeneratedQuestionResult,
} from './qbank-miss.ts';

// 记忆管理控制面命令层（MEM-10）纯域原语：显式 status enum + scope/disposition/role 常量。
export {
  MEMORY_DELETION_SCOPES, MEMORY_DELETION_REQUEST_STATUSES, MEMORY_DELETION_TARGET_STATUSES,
  MEMORY_CORRECTION_DISPOSITIONS, MEMORY_COLLECTION_PAUSE_STATUSES, MEMORY_POLICY_PUBLISH_STATUSES,
  MEMORY_REINDEX_TASK_STATUSES, MEMORY_EXPORT_RECEIPT_STATUSES,
  MEMORY_CONTROL_REVIEWER_ROLE, MEMORY_CONTROL_POLICY_RELEASER_ROLE,
} from './memory-control-surface.ts';
export type {
  MemoryDeletionScope, MemoryDeletionRequestStatus, MemoryDeletionTargetStatus,
  MemoryCorrectionDisposition, MemoryCollectionPauseStatus, MemoryPolicyPublishStatus,
  MemoryReindexTaskStatus, MemoryExportReceiptStatus, MemoryDeletionSink,
} from './memory-control-surface.ts';

// 不可变会话事件源（CTX-03）纯域原语：显式 enum + 确定性 event_digest / range_digest 派生。
export {
  CONVERSATION_EVENT_CATEGORIES, CONVERSATION_EVENT_SOURCES, CONVERSATION_RETENTION_CLASSES,
  CONVERSATION_CONSENT_PURPOSES, CONVERSATION_EVENT_STATUSES, CONVERSATION_EVENT_REF_VERSION,
  CONVERSATION_EVENT_SINKS, deriveEventDigest, deriveRangeDigest,
} from './ctx03-event-source.ts';
export type {
  ConversationEventCategory, ConversationEventSource, ConversationRetentionClass,
  ConversationConsentPurpose, ConversationEventStatus, ConversationEventRef,
  ConversationEventSink,
} from './ctx03-event-source.ts';

// 评分 operation 路由与成本（SCOR-04）纯域原语：把 §6 成本/模型/降级路由表编码为评分作用域决策原语
// （seam-before-wiring，尚未被任何生产入口调用；运行时 operation 强制归 MODEL-OP registry + invoke）。
// 评分作用域 operation 路由/attempt/计量（确定性 0 外呼、评分至多一次 attempt、选择性复核独立
// attempt/计量、报告只消费过门 scorecard）；模型调用经 ScoringModelTransport seam 注入（真实 model
// 归 MODEL-OP，本域零 IO、零模型、零 db）。
export {
  SCORING_OPERATION_KINDS, DETERMINISTIC_SCORING_STEPS, MODEL_SCORING_STEPS,
  SCORING_COST_METER, SCORING_CRITERION_EVIDENCE_BUDGET_MICRO_CNY,
  SCORING_SELECTIVE_REVIEW_BUDGET_MICRO_CNY, SCORING_REPORT_NARRATIVE_BUDGET_MICRO_CNY,
  SCORING_OPERATION_POLICIES,
  routeScoringStep, scoringOperationPolicy, degradeScoringOperation,
  freezeScoringDispatch, createScoringAttemptLedger, remainingScoringBudget,
  authorizeScoringAttempt, markScoringDispatched, settleScoringDispatch, runScoringModelOperation,
  reviewTriggered, classifySelectiveReview, reviewIsIndependentVersion,
  canReportConsume, reportNeverProducesScore, validateScoringOperationRouting,
} from './scoring-operation-routing.ts';
export type {
  ScoringOperationKind, ScoringStep, DeterministicScoringStep, ModelScoringStep,
  ScoringCostMeter, ScoringDegradation, ScoringFailureKind,
  ScoringOperationPolicy, ScoringFrozenDispatch, FreezeScoringDispatchInput,
  ScoringAttemptLedger, ScoringAttemptError, ScoringAttemptDecision, ScoringSettleDecision,
  ScoringModelOutcome, ScoringModelTransport, ScoringOperationRun,
  SelectiveReviewTrigger, SelectiveReviewDecision,
} from './scoring-operation-routing.ts';

// route-scope 缓存（RAG-FUNNEL-06）纯域原语：七面绑定 canonical cache 身份（routeScopeDigest /
// leaf / taxonomy / generationId / recipeId / privacyEpoch / aclDigest）+ 服务 ACL digest +
// negative-result 显式状态机。零 IO、零模型、零 db。
export {
  ROUTE_SCOPE_CACHE_POLICY_VERSION, NEGATIVE_RESULT_STATUSES, NEGATIVE_RESULT_VERDICTS,
  SERVING_PURPOSE, SERVING_CONSENT_REVISION,
  deriveServingAclDigest, deriveRouteScopeCacheDigest, validateRouteScopeCacheFacets,
} from './qbank-route-scope-cache.ts';
export type {
  ServingAclInput, RouteScopeCacheFacets, NegativeResultStatus, NegativeResultVerdict,
  ValidateRouteScopeCacheFacetsResult,
} from './qbank-route-scope-cache.ts';

// 单轮与区间摘要（MEM-02）纯域原语：显式 enum + 确定性 content/range digest + claim span 单一坐标系
// （UTF-8 字节）+ 单向状态机白名单 + 写入侧状态分离守护（summarizer 只能 draft）。
export {
  SUMMARY_KINDS, SUMMARY_STATUSES, SUMMARY_PURPOSES, SUMMARY_RETENTION_CLASSES,
  SUMMARY_SOURCE_TYPES, SUMMARY_PRODUCER_CLASSES, SUMMARY_SPAN_OFFSET_KIND, SUMMARY_SINK,
  SUMMARY_LEGAL_TRANSITIONS,
  deriveSummaryContentDigest, deriveSummaryRangeDigest, assertSummaryClaimSpan,
  canonicalSummaryClaimSpan, assertSummaryWriteSeparation, isLegalSummaryTransition,
} from './memory-summary.ts';
export type {
  SummaryKind, SummaryStatus, SummaryPurpose, SummaryRetentionClass, SummarySourceType,
  SummaryProducerClass, SummarySpanOffsetKind, SummaryClaimSpan, SummaryClaim,
} from './memory-summary.ts';

// 可验证压缩快照（CTX-04）纯域原语：显式状态 enum + 单向状态机白名单 + 原文 artifact digest +
// claim→来源 span 回溯校验（零模型补全契约）。零 IO、零模型、零 db。
export {
  COMPRESSION_SNAPSHOT_STATUSES, COMPRESSION_SNAPSHOT_LEGAL_TRANSITIONS,
  isLegalCompressionSnapshotTransition, deriveCompressionSnapshotSourceArtifactDigest,
  traceCompressionSnapshotClaims,
} from './ctx04-compression-snapshot.ts';
export type {
  CompressionSnapshotStatus, CompressionSnapshotClaimTraceInput, CompressionSnapshotClaimTraceResult,
} from './ctx04-compression-snapshot.ts';

// 自由文本自动漏斗（RAG-FUNNEL-07）纯域原语：canonical digest（独立命名空间 free-text-semantic:v1）+
// rule 分类（复用 RAG-03 classifyJobByRule）+ decision 哈希（独立命名空间 free-text-route-decision:v1 +
// scopeId）。与 RAG-03 结构同构但 scope 隔离；不授予读取/工具权限。零 IO、零模型、零 db。
export {
  canonicalFreeTextSemanticDigest, classifyFreeTextByRule, freeTextRouteDecisionHash,
} from './free-text-route.ts';

// 多层会话摘要树（MEM-03）纯域原语：turn→segment→session episode 三层 kind 显式 enum +
// 父子 kind 兼容 + 父节点「子派生」范围/原文 digest 派生（TS↔SQL 逐字节一致）。与 MEM-02 的
// SUMMARY_KINDS 刻意分离（后者被 MEM-02 回归断言冻结）。
export {
  SUMMARY_TREE_KINDS, SUMMARY_TREE_CHILD_KINDS,
  assertSummaryTreeChildKind, deriveSummaryTreeRangeDigest,
  deriveSummaryTreeArtifactDigest, deriveSummaryTreeByteLength,
} from './memory-summary-tree.ts';
export type { SummaryTreeKind } from './memory-summary-tree.ts';

// 并发与故障恢复（CTX-05）纯域原语：压缩边界稳定判定（确定性 turn/tool 结构，0 模型）+ 压缩
// 派发状态机显式 enum（单向白名单）。零 IO、零模型、零 db。
export {
  COMPRESSION_BOUNDARY_REJECT_REASONS, classifyCompressibleRange,
  COMPRESSION_DISPATCH_STATUSES, COMPRESSION_DISPATCH_LEGAL_TRANSITIONS,
  isLegalCompressionDispatchTransition,
} from './ctx05-compression-boundary.ts';
export type {
  CompressibleEventWatermark, CompressibleRange, CompressionBoundaryVerdict,
  CompressionBoundaryRejectReason, CompressionDispatchStatus,
} from './ctx05-compression-boundary.ts';

// 注入防护（MEM-07 前半）纯域原语：原文/摘要/召回片段三类材料统一作为不可信数据围栏（data fence）
// 交付模型，绝不 splice system；随机 nonce + 剥伪造标签 + codepoint-safe 封顶 + 服务端重算 render digest。
// 与 CTX-05（迁移 0117）互补：CTX-05 已实现 MEM-07 后半套 lease/CAS/unknown/重叠拒绝（复用，不重实现）。
// seam-before-wiring：运行时尚未被 model-client.ts 消费（MODEL-OP 接线前，不宣称已构成注入闭环）。
export {
  UNTRUSTED_MATERIAL_KINDS, UNTRUSTED_FENCE_RENDER_VERSION,
  UNTRUSTED_FENCE_DEFAULT_MAX_MATERIAL_LENGTH, UNTRUSTED_DATA_BOUNDARY_RULE,
  UNTRUSTED_FENCE_SECTION_MARKERS, renderUntrustedDataFence,
  deriveUntrustedFenceRenderDigest,
} from './mem07-injection-fence.ts';
export type {
  UntrustedMaterialKind, UntrustedMaterialInput, UntrustedFenceOptions,
  UntrustedFenceSegment, UntrustedFenceRender,
} from './mem07-injection-fence.ts';

// 撤回、过期和删除（CTX-06）纯域原语：压缩轨道删除 sink 注册表（context_compression_snapshot +
// context_compression_dispatch），并入 privacy-authorization.ts 的 ALL_PRIVACY_AUTHZ_SINK_KINDS
// 并集（不触碰签/验密码学）。与 0118 迁移的 privacy_deletion_target.sink CHECK 双向 pin。
export { COMPRESSION_DELETION_SINKS } from './ctx06-deletion-closure.ts';
export type { CompressionDeletionSink } from './ctx06-deletion-closure.ts';
export { MEMORY_VECTOR_CHUNK_DELETION_SINKS } from './memory-vector-chunk-deletion.ts';
export type { MemoryVectorChunkDeletionSink } from './memory-vector-chunk-deletion.ts';

// 生命周期触发策略（MEM-09）纯域原语：六触发器（事件落库/候选摘要/强制压缩/长期事实写入/
// embedding 索引/recall）的「允许触发/必须先满足/不允许触发」显式 enum + 纯函数决策。复用
// CTX-05 classifyCompressibleRange（边界判定）+ 镜像 CTX-02/CTX-05/MEM-13 显式 enum，不重实现
// 任何机制。seam-before-wiring：真实模型调用归 MODEL-OP，本层零 IO、零模型、零 db。
export {
  LIFECYCLE_TRIGGERS, LIFECYCLE_TRIGGER_DECISIONS,
  EVENT_INGEST_ALLOW_REASONS, EVENT_INGEST_PRECONDITIONS, EVENT_INGEST_BLOCK_REASONS, EVENT_INGEST_VALIDATION_STATUSES,
  SUMMARY_CANDIDATE_ALLOW_REASONS, SUMMARY_CANDIDATE_PRECONDITIONS, SUMMARY_CANDIDATE_BLOCK_REASONS,
  FORCE_COMPRESSION_BUDGET_STATUSES, FORCE_COMPRESSION_DISPATCH_PHASES,
  FORCE_COMPRESSION_ALLOW_REASONS, FORCE_COMPRESSION_PRECONDITIONS, FORCE_COMPRESSION_BLOCK_REASONS,
  FACT_WRITE_PRODUCERS, FACT_WRITE_TARGET_STATUSES, FACT_WRITE_SOURCE_TRUSTS,
  FACT_WRITE_ALLOW_REASONS, FACT_WRITE_PRECONDITIONS, FACT_WRITE_BLOCK_REASONS,
  INDEX_GENERATION_SOURCE_KINDS, INDEX_GENERATION_ALLOW_REASONS, INDEX_GENERATION_PRECONDITIONS, INDEX_GENERATION_BLOCK_REASONS,
  MEMORY_RECALL_ALLOW_REASONS, MEMORY_RECALL_PRECONDITIONS, MEMORY_RECALL_BLOCK_REASONS,
  mapCompressionBoundaryToSummaryBlock,
  evaluateEventIngestTrigger, evaluateSummaryCandidateTrigger, evaluateForceCompressionTrigger,
  evaluateFactWriteTrigger, evaluateIndexGenerationTrigger, evaluateMemoryRecallTrigger,
  evaluateLifecycleTrigger,
} from './mem09-lifecycle-triggers.ts';
export type {
  LifecycleTrigger, LifecycleTriggerDecision,
  EventIngestAllowReason, EventIngestPrecondition, EventIngestBlockReason, EventIngestValidationStatus,
  SummaryCandidateAllowReason, SummaryCandidatePrecondition, SummaryCandidateBlockReason,
  ForceCompressionBudgetStatus, ForceCompressionDispatchPhase,
  ForceCompressionAllowReason, ForceCompressionPrecondition, ForceCompressionBlockReason,
  FactWriteProducer, FactWriteTargetStatus, FactWriteSourceTrust,
  FactWriteAllowReason, FactWritePrecondition, FactWriteBlockReason,
  IndexGenerationSourceKind, IndexGenerationAllowReason, IndexGenerationPrecondition, IndexGenerationBlockReason,
  MemoryRecallAllowReason, MemoryRecallPrecondition, MemoryRecallBlockReason,
  EventIngestTriggerInput, SummaryCandidateTriggerInput, ForceCompressionTriggerInput,
  FactWriteTriggerInput, IndexGenerationTriggerInput, MemoryRecallTriggerInput,
  LifecycleTriggerAllowReason, LifecycleTriggerBlockReason, LifecycleTriggerPrecondition,
  LifecycleTriggerVerdict, LifecycleTriggerRequest,
} from './mem09-lifecycle-triggers.ts';

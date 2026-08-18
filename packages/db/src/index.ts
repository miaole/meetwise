/**
 * @meetwise/db — 数据访问层 + 四生产原语（DAG 最底层，零业务、零模型依赖）。
 *
 * 原语①  asPrincipal      RLS principal 绑定：非 owner app_role + set_config 绑定参数（FORCE RLS 生效，无 GUC 注入）
 * 原语②  casTransition    状态机 CAS：条件更新 + version 自增（陈旧落败=0 行）
 * 原语③  appendEvent      durable ordered event log：advisory 事务锁串行 + INSERT…SELECT MAX+1 RETURNING seq（原子分配）
 * 原语④  acquire/releaseLease  租约：防裂脑并发（过期可抢占）
 * idempotency 由 SQL 层 UNIQUE(owner_user_id, idempotency_key) + ON CONFLICT DO NOTHING 表达（见 sql/01_schema.sql）。
 *
 * 这些原语此前散在 kernel/demo.ts 与 apps/api/db.service.ts 两份手抄实现里——现收敛为单一真相。
 */
import type { Client } from './principal.ts';

export {
  createPool, resolveDatabaseConnectionString, rebindDatabaseLogin, asPrincipal, asPrivacyWorkerPrincipal, asPrivacyWorkerExecutor, assertPrivacyWorkerExecutorIdentity, assertPrivacyAuthorizationIssuerIdentity,
  asQbankControlExecutor, assertQbankControlExecutorIdentity, assertQbankControlDefinerOwnership, asRagControlExecutor, assertRagControlExecutorIdentity, assertRagControlDefinerOwnership, assertDistinctProvisionedLoginNames, asOnlineJudgeScheduler, asOnlineJudgeExecutor, asGateway,
  provisionRuntimeLogin, provisionQbankControlLogin, provisionQbankControlDefiner, provisionRagControlLogin, provisionPrivacyWorkerLogin, provisionOnlineJudgeSchedulerLogin, provisionOnlineJudgeExecutorLogin,
  QBANK_CONTROL_DEFINER_ROLE, QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST, QBANK_CONTROL_DEFINER_TABLE_MANIFEST, QBANK_CONTROL_DEFINER_VIEW_MANIFEST,
} from './principal.ts';
export type { Client, DbPool, PoolOverrides, RuntimeLoginInput } from './principal.ts';
export { assertIsolatedTestEnvironment, assertIsolatedTestTarget } from './isolated-test-target.ts';
export { enrollCheckpointThread } from './checkpoint-thread.ts';
export type { CheckpointThreadEnrollment } from './checkpoint-thread.ts';
export { revokeCheckpointThread, assertInterviewPrivacyActive, isInterviewPrivacyActive, beginCheckpointErasure, listClaimableCheckpointErasureTargets, claimCheckpointErasureTarget, purgeCheckpointErasureTarget } from './checkpoint-privacy.ts';
export type { CheckpointErasureRequest, ClaimedCheckpointErasureTarget } from './checkpoint-privacy.ts';
// 隐私删除授权签发器（INT-TRANSCRIPT-00 账本：单次 jti CAS 消费 + 受约束 claim + 逐 sink receipt）
export { issueAuthorizationSnapshot, consumeAuthorizationSnapshot, consumeAuthorizationSnapshotBound, claimAuthorizationTarget, recordDeletionReceipt, resolveDeletionReceipt } from './privacy-authorization.ts';
export type { IssueAuthorizationSnapshotInput, IssuedAuthorizationSnapshot, ConsumedAuthorizationSnapshot, ClaimedAuthorizationTarget, ResolvedDeletionReceipt } from './privacy-authorization.ts';
export { gatewayDispatchOwners, gatewayModelInvocationOwners, gatewayJobGauges, gatewayCostBudgetSnapshot } from './gateway-dispatch.ts';
export type { GatewayDispatchWork, GatewayJobGauge, GatewayCostBudgetSnapshot } from './gateway-dispatch.ts';

/** 原语②：状态机 CAS——仅当当前态 == from 时迁移到 to 并 version+1，返回是否生效（陈旧落败=0 行）。 */
export async function casTransition(c: Client, id: string, from: string, to: string): Promise<boolean> {
  const r = await c.query('UPDATE interview SET status=$3, version=version+1 WHERE id=$1 AND status=$2', [id, from, to]);
  return r.rowCount === 1;
}

/** 原语③ appendEvent：独立成 packages/db/src/interview-event.ts，此处 re-export 防 index→qbank-miss→index 循环。 */
export { appendEvent } from './interview-event.ts';

/** 原语④：抢租约——空或已过期才能抢（防裂脑并发推进）。 */
export async function acquireLease(c: Client, threadId: string, leaseOwner: string): Promise<boolean> {
  const r = await c.query(
    `UPDATE ai_graph_run SET lease_owner=$2, lease_expires_at=now()+interval '30 seconds', version=version+1
       WHERE thread_id=$1 AND (lease_owner IS NULL OR lease_expires_at < now())`, [threadId, leaseOwner]);
  return r.rowCount === 1;
}

export async function releaseLease(c: Client, threadId: string, leaseOwner: string): Promise<void> {
  await c.query('UPDATE ai_graph_run SET lease_owner=NULL WHERE thread_id=$1 AND lease_owner=$2', [threadId, leaseOwner]);
}

// commerce saga（共享权益池 reserve/confirm/release + 租约心跳 + 结算消费者 + 对账）
export {
  reserveEntitlement, confirmConsumption, releaseConsumption, availableUnits,
  completeInterviewAndConfirm, failInterviewAndRelease, abandonInterviewAndRelease,
  renewReservationLease, sweepExpiredReservations, settleOutbox, reconcile,
  MIN_UNIT, DEFAULT_LEASE_SECONDS,
} from './commerce.ts';
export type {
  Allocation, ReserveResult, ConfirmResult, ReleaseResult, SweptReservation,
  CompleteInterviewResult, FailInterviewAndReleaseResult, AbandonInterviewResult,
} from './commerce.ts';

// 招聘方(B 端)岗位仓储(多租户 RLS 隔离)+ 候选人申请闭环(多方 RLS)
export {
  createJob, listJobs, getJob, closeJob, updateJob,
  listOpenJobs, applyToJob, listMyApplications, listJobCandidates, finalizeApplication,
  inviteCandidate, startApplicationInterview, declineInvitation, markApplicationAssessmentUnavailable, markApplicationNoEligibleScore, listTalentPool,
} from './recruiter.ts';
export type { JobPosting, JobApplication, TalentRow, TalentQuery, StartApplicationResult, FinalizeApplicationResult, AssessmentUnavailableMark } from './recruiter.ts';

// resume 存储 ops（S2 摄取存储侧：加密原文 + 状态机 + 脱敏 profile）
export {
  createResumeWithBlob, transitionResume, persistResumeProfile, completeIngestion, failIngestion,
  decryptResumeBlob, decryptActiveResumeBlob, contentDigest, RESUME_KEY_VERSION,
  persistResumeOcrArtifact, decryptResumeOcrArtifact, deleteResumeOcrArtifact,
} from './resume.ts';
export type { ResumeStatus, IngestedProfile } from './resume.ts';

// report job ops（报告子图舱壁：持久 job + 状态机 + 租约 + 重试）
export {
  enqueueReport, claimReport, markReportReady, markReportFailed, requeueFailedReport, sweepReports, getReport,
  MAX_REPORT_ATTEMPTS,
} from './report.ts';
export type { ReportStatus } from './report.ts';

// Commit-delivered, data-free worker wakeup constants.  They are not a queue
// or authorization mechanism; the durable queue and RLS claim path remain
// authoritative.
export { WORKER_JOB_WAKEUP_CHANNEL, WORKER_JOB_WAKEUP_PAYLOAD } from './worker-job-wakeup.ts';

// 面试 job 队列（api 入队 / worker 消费）+ 心跳续租 + reaper 收割孤儿 running
export {
  enqueueInterviewJob, claimNextInterviewJob, loadClaimedInterviewJobRequestId, loadClaimedInterviewAnswerPayload, markJobDone, markJobFailed, enumerateOwnersWithJobs,
  renewInterviewJobLease, sweepStuckInterviewJobs, requeueInterviewJob, MAX_INTERVIEW_JOB_ATTEMPTS, INTERVIEW_RESUME_REFERENCE_VERSION,
} from './interview-jobs.ts';
export type { JobKind, ClaimedInterviewJob, ClaimedInterviewJobRequestId, ClaimedInterviewAnswerPayload } from './interview-jobs.ts';

export { withInterviewGraphFence, assertInterviewGraphFence, renewInterviewGraphFence, releaseInterviewGraphFence } from './interview-graph-lease.ts';
export type { InterviewGraphFence } from './interview-graph-lease.ts';

// server-issued question / answer identity ledger (stale resume 与双标签页的图外 fencing)
export {
  answerHash, persistInterviewQuestion, claimInterviewAnswer, verifyInterviewAnswerClaim,
  markInterviewAnswerApplied, cancelOpenInterviewQuestion,
} from './interview-question.ts';
export type { PersistedInterviewQuestion, AcceptedInterviewAnswer, ClaimAnswerResult } from './interview-question.ts';

// 押题(resume-quiz)生成 job 队列（api 入队 / worker 消费）+ 心跳续租 + reaper 收割
export {
  enqueueQuizJob, claimNextQuizJob, markQuizJobDone, markQuizJobFailed,
  renewQuizJobLease, sweepStuckQuizJobs, MAX_QUIZ_JOB_ATTEMPTS, RESUME_DERIVATIVE_REFERENCE_VERSION,
} from './quiz-jobs.ts';

// 简历诊断(resume-diagnosis)生成 job 队列（api 入队 / worker 消费）+ 心跳续租 + reaper 收割
export {
  enqueueDiagnosisJob, claimNextDiagnosisJob, markDiagnosisJobDone, markDiagnosisJobFailed,
  renewDiagnosisJobLease, sweepStuckDiagnosisJobs, MAX_DIAGNOSIS_JOB_ATTEMPTS,
} from './diagnosis-jobs.ts';

// 生产向量库（pgvector HNSW）
export { upsertVectorChunk, annSearch, annSearchLegacy } from './retrieval-store.ts';
export { activeQbankGeneration, requireActiveQbankGeneration, hybridQbankSearch, qbankEvidenceForRefs, qbankQuestionEvidenceForRefs, qbankQuestionResultsForHits } from './qbank-generation-retrieval.ts';
export type { QbankActiveGeneration, QbankHybridHit, QbankEvidenceExcerpt, QbankQuestionEvidence, QbankQuestionEvidencePart, QbankQuestionRetrievalResult } from './qbank-generation-retrieval.ts';

// qbank ANN 跨实例结果缓存：Redis 热数据面 + PostgreSQL epoch/RLS/外部调用 intent 控制面。
export { cachedQbankSearch, qbankRetrievalCacheKey, RagCacheDependencyError } from './qbank-retrieval-cache.ts';
export type { CachedQbankSearchInput, CachedQbankSearchResult, QbankCacheStatus, QbankRetrievalHit, QbankRetrievalCacheKeyInput, QbankEmbeddingCallContext, QbankRetrievalCacheBackend, QbankRetrievalCacheAddress, QbankRetrievalCacheLock } from './qbank-retrieval-cache.ts';

// 共享题库数据面（策展门 + 灌库/题面 artifact 摄取）。原散在 apps/worker/src，现收敛回 packages/db，
// 与早已在此的检索面 qbank-generation-retrieval 同层——消除 packages→apps 越界（arch 承重边界）。
// 灌库/摄取只依赖 db 控制面身份(asQbankControlExecutor)+本地 Embedder seam，不依赖任何 worker 装配。
export {
  proposeSource, reviewSource, promoteToPool, isApprovedSource, findSourceByHash, listRetrievalCandidates,
} from './qbank-curation.ts';
export type { QbankSourceKind, QbankSourceStatus, ReviewDecision, ProposeInput, ProposeResult } from './qbank-curation.ts';
export {
  ingestQbank, ingestQuestionBankArtifacts, qbankMetadataHash, QBANK_OWNER, QBANK_TAXONOMY_V1,
  QBANK_ANNOTATION_SOURCES, QBANK_QUESTION_CHUNK_ROLES,
} from './qbank-ingest.ts';
export type {
  QbankEmbedder, QbankServingMetadata, QbankAnnotationSource, QbankIngestOptions, QbankItem,
  QbankQuestionChunkRole, QbankQuestionArtifactChunk, QbankQuestionArtifact,
} from './qbank-ingest.ts';

// 外部 AI 调用费用账本：预留/派发/结算/未知结果冻结均由数据库状态机承重。
export { reserveAiCost, reserveAiTextCost, markAiCostDispatched, settleAiCost, settleAiTextCost, releaseAiCost, markAiCostUnknown, markAiCostsUnknownForModelReconcile, markAiTextCostRejected } from './ai-cost-governance.ts';
export type { AiCostDecision, AiCostReservationInput, AiTextCostReservationInput, AiCostReservationDecision } from './ai-cost-governance.ts';

// 模型调用持久 claim：短事务声明意图，网络 I/O 一律在事务外；unknown 禁止自动重发。
export { claimModelInvocation, markModelInvocationDispatched, failModelInvocationClaim, completeModelInvocation, markModelInvocationUnknown, reconcileStaleModelInvocations } from './model-invocation.ts';
export type { ModelInvocationClaim, ClaimModelInvocationInput, CompleteModelInvocationInput, ReconciledModelInvocation } from './model-invocation.ts';

// usage 对账校准因子数据面（MODEL-OP-00 收尾）：estimate↔usage 配对读面 + 版本化因子/观测日志幂等落库。
export {
  listUsageCalibrationPairs, insertUsageCalibrationFactor, insertUsageCalibrationObservation, latestUsageCalibrationFactor,
} from './usage-calibration.ts';
export type {
  UsageCalibrationPair, UsageCalibrationFactorRow,
  InsertUsageCalibrationFactorInput, InsertUsageCalibrationObservationInput,
} from './usage-calibration.ts';

// MODEL-OP-02 共享 provider 准入/费用账本/断路器/并发 数据访问（SECURITY DEFINER 过程真相）。
export { acquireModelAdmission, recordModelAdmission } from './model-operation-admission.ts';
export type {
  ModelAdmissionPartition, ModelAdmissionDecision, ModelBreakerOutcome, ModelFeeStatus,
  ModelAdmissionAcquireInput, ModelAdmissionAcquireResult, ModelAdmissionRecordInput,
} from './model-operation-admission.ts';

// 在线 Judge 控制面：只处理 HMAC 引用和状态机；不持有用户正文或模型 payload。
export {
  registerOnlineJudgeCandidate, revokeOnlineJudgeCandidate, claimNextOnlineJudgeDispatch,
  markOnlineJudgeDispatching, completeOnlineJudgeDispatch,
} from './online-judge-control.ts';
export type {
  OnlineJudgeFeature, OnlineJudgeLanguageGroup, OnlineJudgeModality, OnlineJudgeRiskBucket, OnlineJudgeSourcePolicy,
  OnlineJudgeSelectionState, OnlineJudgeDispatchTerminal, RegisterOnlineJudgeCandidateInput, OnlineJudgeCandidateReceipt,
  ClaimedOnlineJudgeDispatch, CompleteOnlineJudgeDispatchInput,
} from './online-judge-control.ts';

// 泛化全格式 RAG 版本控制面：不可变内容/recipe/generation、评测发布门、灰度 binding、回滚与擦除传播。
export {
  registerRagDocument, registerRagGlobalDocument, publishRagDocumentVersion, publishRagGlobalDocumentVersion, registerRagEmbeddingRecipe, registerRagReleasePolicy,
  startRagGeneration, prepareRagGenerationStorage, insertRagGenerationVector, validateRagGeneration,
  recordRagShadowEvaluation, gateRagGeneration, advanceRagGenerationRollout, promoteRagGeneration,
  rollbackRagGeneration, bindRagQuery, searchRagBinding, ragBindingEvidence, recordRagCitation,
  tombstoneRagDocument, createRagRebuildRun, claimRagRebuildRun, heartbeatRagRebuildRun,
} from './rag-corpus-versioning.ts';
export type {
  RagVisibility, RagSourceKind, RagCorpusChunkInput, RagEmbeddingRecipeInput, RagBinding,
  RagBoundHit, RagBoundEvidence,
} from './rag-corpus-versioning.ts';

// 长期记忆存储 + 跨会话精确判重(normalizeQuestion/episodeSeen) + 历史弱项只读投影(historicalWeakDimensions)
export { insertMemory, getMemoriesByRefIds, episodeSeen, normalizeQuestion, historicalWeakDimensions } from './memory-store.ts';
export type { MemoryKind, MemoryRow } from './memory-store.ts';

// 记忆治理(MEM-00)：事实/同意/召回/生成/快照状态机 + 账户级删除(复用冻结 issuer，仅包 MEM claim/purge)
export {
  recordMemoryFact, grantMemoryConsent, revokeMemoryConsent, confirmMemoryFact, revokeMemoryFact,
  recallMemoryCandidates, hydrateMemoryFacts, startMemoryGeneration, activateMemoryGeneration, retireMemoryGeneration,
  issueMemoryContextSnapshot, consumeMemoryContextSnapshot, voidMemoryContextSnapshot,
  beginMemoryAccountErasure, claimMemoryTarget, purgeMemoryTarget,
} from './memory-governance.ts';
export type {
  RecordedMemoryFact, ConfirmMemoryFactResult, HydratedMemoryFact, MemoryFactKind, MemoryPurpose,
  MemoryAllowedDataClass, MemorySourceType, GenerationResult, SnapshotResult,
  MemoryErasureTarget, BegunMemoryErasure, ClaimedMemoryTarget, PurgedMemoryTarget,
} from './memory-governance.ts';

// 记忆准入元标签门（MEM-12）：服务端授权快照签发 + 准入记录（三身份派生 + 元标签 fail-closed 校验）
export { issueMemoryAdmissionSnapshot, admitMemoryRecord } from './memory-admission.ts';
export type { MemoryAdmissionIssueInput, IssuedMemoryAdmissionSnapshot, AdmittedMemoryRecord } from './memory-admission.ts';

// 记忆事实裁决（MEM-13）：消费 MEM-12 candidate 的长期事实冲突/时效判定状态机
// （稳定 factKey 派生 + 单/多值 + contradicts/supersedes 边 + 六分量分离 + 单值并发不变量）
export {
  materializeAdjudicationFact, confirmAdjudicationFact, correctAdjudicationFact,
  revokeAdjudicationFact, expireAdjudicationFacts,
} from './memory-fact-adjudication.ts';
export type {
  MaterializeAdjudicationFactInput, MaterializedAdjudicationFact, ConfirmedAdjudicationFact,
  CorrectedAdjudicationFact, RevokedAdjudicationFact,
} from './memory-fact-adjudication.ts';

// 索引 generation 生命周期 + 缓存失效治理（MEM-11）：冻结 source manifest → shadow 独立构建
// → 验证后 CAS 切换 → 撤回/删除同步失效。embedding seam 与 RAG-02B qbank compute cache 隔离。
export {
  freezeSourceManifest, readEmbeddableManifestFacts, buildShadowGeneration, validateGeneration,
  switchActiveGeneration, retireGenerationWindow, fenceGeneration, fenceGenerationsForFacts,
  putGenerationCacheEntry, lookupGenerationCache, invalidateGenerationCache, activeGeneration,
  recallActiveGenerationFactIds, buildMemoryGeneration,
} from './memory-index-generation.ts';
export type {
  FreezeSourceManifestInput, EmbeddableManifestFact, GenerationEmbeddingInput,
  BuildShadowGenerationInput, GenerationReceipt, ActiveGeneration, GenerationCacheEntry,
} from './memory-index-generation.ts';

// 两阶段召回 + 派发前复核（MEM-14）：DB 内硬过滤候选召回 → 水合来源重验 → 冻结 ContextSnapshot
// → 派发前复核（围栏先赢/派发先赢）。与 MEM-00 的 recallMemoryCandidates/hydrateMemoryFacts
// 刻意不同名（MEM-14 是候选来源卡片 + 重验 verdict + 冻结/派发，MEM-00 是最小召回）。
export {
  recallHybridCandidates, hydrateRecallFacts, freezeRecallContextSnapshot, dispatchRecallContextSnapshot,
} from './memory-two-stage-recall.ts';
export type {
  RecallHybridCandidatesInput, HydrateRecallFactsInput, FreezeRecallContextSnapshotInput,
} from './memory-two-stage-recall.ts';

// 支付订单（幂等入账）
export { createOrder, getOrder, markOrderPaidAndCredit } from './payment.ts';
export type { CreditResult } from './payment.ts';

// 站内通知
export { insertNotification, listNotifications, markNotificationRead, markAllNotificationsRead, unreadCount } from './notification.ts';

// 版本化迁移运行器
export { runMigrations, loadMigrations } from './migrate.ts';
export type { Migration } from './migrate.ts';

// admin 审计(append-only)
export { appendAudit, listAudit } from './audit.ts';

// 答案事实根（INT-TRANSCRIPT-00 评分前置：加密正文源 + 提交回执 + ref-only job + INT 域删除 resolver）
export {
  submitInterviewAnswer, readbackInterviewAnswerSubmission, viewInterviewAnswerSnapshot,
  assertInterviewAnswerFactActive, beginInterviewAnswerFactErasure,
  listClaimableInterviewAnswerArtifactTargets, purgeInterviewAnswerArtifactTarget,
  answerBodyHmac, INTERVIEW_ANSWER_KEY_VERSION,
} from './int-transcript.ts';
export type {
  SubmitInterviewAnswerInput, InterviewAnswerSubmitResult, InterviewAnswerSubmissionReceipt,
  InterviewAnswerViewItem, InterviewAnswerViewSnapshot, InterviewAnswerFactErasureRequest,
} from './int-transcript.ts';

// 答案事实根之外的剩余 sink（INT-TRANSCRIPT-01）：event + report 的删除 resolver/purge
export {
  beginInterviewProjectionErasure, listClaimableInterviewProjectionTargets, purgeInterviewProjectionTarget,
} from './int-transcript-projection.ts';
export type {
  InterviewProjectionErasureTarget, InterviewProjectionErasureRequest,
} from './int-transcript-projection.ts';

// RAG-FUNNEL-02A 规范投影（generation chunk + serving_scope annotation + question attachment 的 metadata-only 数据面，
// 供 04 做 track-local 过滤；无正文、无模型依赖、无新 SECURITY DEFINER）。
export { readGenerationQuestionChunkProjection } from './qbank-generation-projection.ts';
export type {
  GenerationQuestionChunkProjection, ProjectedQuestionAttachment, ReadGenerationProjectionInput,
} from './qbank-generation-projection.ts';

// RAG-FUNNEL-02A provider-input recipe（投影行 → 模型数据块：typed + serving_scope 维度 + fail-closed 校验 + 稳定 digest）。
// 严格区别于 MODEL-OP 模型目录（which model/region/prompt version）。
export {
  buildQbankProviderInputRecipe, validateQbankProviderInputRecipe, qbankProviderInputDigest,
  QBANK_PROVIDER_INPUT_SCHEMA, QBANK_PROVIDER_INPUT_MAX_EXCERPT,
} from './qbank-provider-input.ts';
export type {
  QbankProviderInputPart, QbankProviderInputRecipe, QbankProviderInputRole, BuildQbankProviderInput,
} from './qbank-provider-input.ts';

// 评分测量事实根（SCOR-01）：版本化 rubric + 两阶段事实根（issue/submission）+ append-only ScoreCard
// + 显式状态机 + 幂等/并发/RLS。只建事实根，不接生产写路径、不调模型（SCOR-02/03/04 边界见迁移 0100）。
export {
  publishQuestionRubric, issueQuestionContract, createScoreRequest,
  claimScoreRequest, markScoreRequestDispatched, fenceScoreRequest,
  recordScoreCard, transitionScoreCard, supersedeScoreCard,
  asScoringWorkerPrincipal,
} from './scoring-fact-root.ts';
export type {
  RubricCriterionInput, PublishQuestionRubricInput, IssueQuestionContractInput,
  CreateScoreRequestInput, ScoreCardCriterionInput, RecordScoreCardInput,
} from './scoring-fact-root.ts';

// 评分确定性聚合（SCOR-02）：专用终态 score-writer（只写 practice_eligible/b_review_eligible）+ C 端只读聚合。
// 复用 SCOR-01 角色/fence/delete-first-wins，不重实现删除根；legacy answer_evaluated.score 整数事件不参与。
export {
  writeFinalScoreCard, aggregateInterviewScores, listScorableScoreCards,
} from './scoring-aggregation.ts';
export type {
  ScoreEvidenceInput, WriteFinalScoreCardInput, WriteFinalScoreCardResult,
  InterviewScoreAggregate, ScorableScoreCardRow,
} from './scoring-aggregation.ts';

// 评分证据冲突与多来源 uncertainty（SCOR-03）：证据裁决 writer（practice_eligible/review_required
// + 8 来源 uncertainty + required coverage + 冲突路由）。复用 SCOR-01 角色/fence/delete-first-wins。
export { adjudicateScoreCard } from './scoring-evidence-conflict.ts';
export type {
  AdjudicateEvidenceInput, ScoreUncertaintyInput, AdjudicateScoreCardInput, AdjudicateScoreCardResult,
} from './scoring-evidence-conflict.ts';

// RAG-FUNNEL-02B / EMBED-CACHE-01 计算缓存（metadata 审核后、projection 前；只复用相同计算的无主 float32 向量，
// 不决定 leaf/可见性/激活）。PG = durable fill intent + 成本预留 + dispatch slot；Redis = 薄 value store + merge lock。
export {
  resolveEmbeddingCompute, sweepStaleEmbeddingFills,
  claimFillIntent, reconcileEmbeddingCompute,
  embeddingComputeCacheKey, embeddingExactRecipeDigest, embeddingProviderInputDigest,
  buildEmbeddingComputeValue, validateEmbeddingComputeValue,
  EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE,
} from './qbank-embedding-compute-cache.ts';
export type {
  ExactEmbeddingRecipe, EmbeddingComputeCostReservation, EmbeddingComputeValue,
  EmbeddingComputeValueStore, EmbeddingComputeLock, EmbeddingComputeLockBackend,
  ResolveEmbeddingComputeInput, EmbeddingComputeResolution,
  ClaimFillIntentInput, FillClaim, FillClaimResult,
  ReconcileEmbeddingComputeInput, ReconcileEmbeddingComputeResult,
} from './qbank-embedding-compute-cache.ts';

// RAG-FUNNEL-03 / ROUTE-01 岗位意图路由：revision/decision/binding/snapshot 状态机 + CAS + RLS + 事务 outbox。
// PG 是 route 决策的权威事实源；真实模型外发是受控 seam（归 MODEL-OP-01）。不改检索函数 ACL。
export {
  JOB_SEMANTIC_REVISION_STATUSES, JOB_ROUTE_ATTEMPT_OUTCOMES,
  createJobSemanticRevision, classifyJobRoute,
  bindApplicationRoute, snapshotInterviewRoute, getInterviewRouteSnapshot,
  TAXONOMY_V1_LEAVES, JOB_ROUTE_TAXONOMY_VERSION, JOB_ROUTE_POLICY_VERSION,
} from './job-route-decision.ts';
export type {
  JobSemanticRevisionStatus, JobRouteAttemptOutcome, JobRouteModelInput, JobRouteModelClassify,
  ClassifyJobRouteResult, BindApplicationRouteResult, SnapshotInterviewRouteResult, InterviewRouteSnapshotView,
} from './job-route-decision.ts';

// RAG-FUNNEL-04 / track-local retrieval dispatch seam（图内 planner 消费）：
// 冻结 RetrievalPlan + 服务端校验属于 snapshot + DB 层 serving_scope 硬过滤检索 + recheck。
// 复用 RAG-03 getInterviewRouteSnapshot / RAG-02A readGenerationQuestionChunkProjection，不改检索函数 ACL。
export { dispatchTrackLocalRetrieval } from './qbank-track-local-retrieval.ts';
export type {
  DispatchTrackLocalRetrievalDeps, DispatchTrackLocalRetrievalResult,
} from './qbank-track-local-retrieval.ts';

// RAG-FUNNEL-05 / LLM 同桶生成题（leaf 无合格题时生成一题）：两阶段 durable 派发 +
// exact-once 投影（interview_question + question_ready + provenance），复用 ① asPrincipal /
// ③ appendEvent；E2 epoch fence 承重「绝不写回 QBank/vector、绝不评分」。
export { dispatchQbankMissGeneration } from './qbank-miss.ts';
export type {
  QbankMissModelInput, QbankMissModelGenerate, DispatchQbankMissGenerationDeps, DispatchQbankMissGenerationResult,
} from './qbank-miss.ts';

// MEM-10 管理控制面命令层：用户命令（owner 作用域）+ 运营命令（受控角色）+ 逐 sink 删除 worker。
export {
  listSourceCards, deletionProgress, correctFact, withdrawFact, beginDeletion,
  pauseCollection, resumeCollection, exportReceipt, recordPolicyPublish, recordReindex,
  reviewSourceCard, switchGeneration, claimDeletionTarget, completeDeletionTarget, failDeletionTarget,
} from './memory-control-surface.ts';
export type {
  MemoryControlSourceCard, MemoryControlDeletionProgressRow, MemoryControlDeletionRow,
  MemoryControlCorrectResult, MemoryControlPauseResult, MemoryControlExportResult,
  MemoryControlPolicyPublishResult, MemoryControlReindexResult, MemoryControlReviewCard,
  MemoryControlSwitchResult, MemoryControlClaimResult, MemoryControlTargetResult,
} from './memory-control-surface.ts';

// CTX-03 不可变会话事件源：owner RLS 加密 append-only 业务事件源 + checkpoint 事件引用。
export {
  appendConversationEvent, replayConversationEvents, conversationEventRangeRef,
  conversationEventBodyHmac, CONVERSATION_EVENT_KEY_VERSION,
  // 0111：账户删除 sink 闭合（复用冻结 issuer，仅包 CTX begin/claim/purge）+ 补偿控制 + version CAS
  beginConversationEventErasure, claimConversationEventTarget, purgeConversationEventTarget,
  dispatchConversationEventReplay, transitionConversationEventStatus,
} from './ctx03-event-source.ts';
export type {
  AppendConversationEventInput, ConversationEventAppendReceipt,
  ReplayedConversationEvent, ConversationEventRangeRef,
  ConversationEventErasureTarget, BegunConversationEventErasure,
  ClaimedConversationEventTarget, PurgedConversationEventTarget,
  ConversationEventDispatchDecision, ConversationEventTransitionReceipt,
} from './ctx03-event-source.ts';

// RAG-FUNNEL-06 / route-scope 缓存 + provenance + 撤销隔离：retrieval-result / singleflight 键
// HMAC 绑定 routeScopeCacheDigest（七面）；durable negative-result cache 权威判定在 PG 行/epoch CAS
// （record 冻结快照 / read 同事务重验 active generation + qbank_cache_epoch + privacy epoch，
//   stale → CAS active→superseded + outbox receipt，旧 negative 绝不 replay）；命中水合重验
// 从 PG evidence 二段可见性重读正文（命中只回 ref/distance）。
export {
  routeScopeRetrievalCacheKey, routeScopeSingleflightKey,
  recordRouteScopeNegativeResult, readRouteScopeNegativeResult,
  supersedeRouteScopeNegativeResults, revalidateRouteScopeCacheHit,
} from './qbank-route-scope-cache.ts';
export type {
  RouteScopeRetrievalCacheKeyInput, RecordRouteScopeNegativeResultDeps, RecordRouteScopeNegativeResultResult,
  RouteScopeNegativeResultLive, ReadRouteScopeNegativeResultResult,
  SupersedeRouteScopeNegativeResultsResult, RouteScopeCacheHitFrozen, RevalidateRouteScopeCacheHitResult,
} from './qbank-route-scope-cache.ts';

// 单轮与区间摘要（MEM-02）：不可变 summary 派生物 append-only + 状态机 + summarizer 只写 draft +
// 受控 verify/activate + 账户删除 sink 闭合（复用冻结 issuer，仅包 MEM begin/claim/purge）。
export {
  draftMemorySummary, verifyMemorySummary, activateMemorySummary, supersedeMemorySummary, invalidateMemorySummary,
  hydrateMemorySummaries, replayMemorySummaries, dispatchMemorySummaryHydrate,
  beginMemorySummaryErasure, claimMemorySummaryTarget, purgeMemorySummaryTarget,
} from './memory-summary.ts';
export type {
  DraftMemorySummaryInput, MemorySummaryDraftReceipt, MemorySummaryTransitionReceipt, MemorySummaryRow,
  MemorySummaryDispatchDecision, MemorySummaryErasureTarget, BegunMemorySummaryErasure,
  ClaimedMemorySummaryTarget, PurgedMemorySummaryTarget,
} from './memory-summary.ts';

// RAG-FUNNEL-07 / 自由文本自动漏斗与成本/unknown：把 RAG-03 岗位意图路由**结构同构但
// scope 隔离**地复用到自由文本（专项训练目标），不扩大权限。revision 只存 digest+HMAC
// （goal 原文不落库）；同一 (scope, revision) 最多 1 次模型外发（FOR UPDATE 串行 + 终态
// sticky）；无 binding/snapshot/plan/检索消费链（分类结果只是「建议 allowlisted track」，
// 无公开读 RLS、无 SECURITY DEFINER 读面）。复用 ① asPrincipal ② CAS ③ append-only outbox，
// ④ lease 有意不用（派发≤1 由 FOR UPDATE + 终态 sticky 承重，对齐 RAG-03）。
export {
  FREE_TEXT_SCOPE_REVISION_STATUSES, FREE_TEXT_ROUTE_ATTEMPT_OUTCOMES,
  createFreeTextScopeRevision, classifyFreeTextScope,
} from './free-text-route-decision.ts';
export type {
  FreeTextScopeRevisionStatus, FreeTextRouteAttemptOutcome, FreeTextRouteModelInput,
  FreeTextRouteModelClassify, ClassifyFreeTextScopeResult,
} from './free-text-route-decision.ts';

// 可验证压缩快照（CTX-04）：压缩边界快照（不是 MEM-14 memory_context_snapshot）——固化事件范围/
// checksum/版本/摘要 hash + claim→span/firstKeptEventId/状态；原事件 append-only；claim 无法回溯→丢弃。
export {
  draftCompressionSnapshot, activateCompressionSnapshot, supersedeCompressionSnapshot,
  hydrateCompressionSnapshots, replayCompressionSnapshots,
} from './context-compression-snapshot.ts';
export type {
  DraftCompressionSnapshotInput, CompressionSnapshotDraftReceipt, CompressionSnapshotTransitionReceipt,
  CompressionSnapshotRow,
} from './context-compression-snapshot.ts';

// 多层会话摘要树（MEM-03）：父只引用 verified/active 子 + 仅追加不覆盖 + supersede/invalidate/fence
// 精确传播 + traceback 沿父链回溯到 turn 叶事件范围。父节点激活复用 MEM-02 verify/activate。
export {
  composeMemorySummary, tracebackMemorySummary,
  invalidateMemorySummaryCascade, fenceMemorySummaryCascade,
} from './memory-summary-tree.ts';
export type {
  SummaryTreeParentKind, ComposeMemorySummaryInput, MemorySummaryComposeReceipt,
  MemorySummaryTraceNode, MemorySummaryCascadeReceipt,
} from './memory-summary-tree.ts';

// 并发与故障恢复（CTX-05）存储侧：压缩派发/提交状态机（lease 抢租约 + CAS 单赢家 + unknown 终态
// sticky）。边界稳定判定由 SQL claim 服务端重验（域侧 classifyCompressibleRange 交叉 pin）。
export {
  claimCompressionDispatch, markCompressionDispatchDispatched, commitCompressionDispatch,
  markCompressionDispatchUnknown, discardCompressionDispatch, recoverCompressionDispatch,
  replayCompressionDispatches,
} from './context-compression-dispatch.ts';
export type {
  ClaimCompressionDispatchInput, CompressionDispatchClaimReceipt,
  CompressionDispatchTransitionReceipt, CompressionDispatchRow,
} from './context-compression-dispatch.ts';

// 撤回、过期和删除（CTX-06）存储侧：压缩轨道删除 sink 闭合（snapshot + dispatch 的 begin/claim/
// purge，复用冻结 PrivacyAuthorizationIssuer 不重实现删除根）。删后 read=0 + 逐 sink receipt。
export {
  beginCompressionErasure, claimCompressionTarget, purgeCompressionTarget,
} from './context-compression-erasure.ts';
export type {
  CompressionErasureTarget, BegunCompressionErasure,
  ClaimedCompressionTarget, PurgedCompressionTarget,
} from './context-compression-erasure.ts';

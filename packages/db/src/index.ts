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
  createPool, resolveDatabaseConnectionString, rebindDatabaseLogin, asPrincipal, asPrivacyWorkerPrincipal, asPrivacyWorkerExecutor, assertPrivacyWorkerExecutorIdentity,
  asQbankControlExecutor, assertQbankControlExecutorIdentity, assertQbankControlDefinerOwnership, asRagControlExecutor, assertRagControlExecutorIdentity, assertRagControlDefinerOwnership, assertDistinctProvisionedLoginNames, asOnlineJudgeScheduler, asOnlineJudgeExecutor, asGateway,
  provisionRuntimeLogin, provisionQbankControlLogin, provisionQbankControlDefiner, provisionRagControlLogin, provisionPrivacyWorkerLogin, provisionOnlineJudgeSchedulerLogin, provisionOnlineJudgeExecutorLogin,
  QBANK_CONTROL_DEFINER_ROLE, QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST, QBANK_CONTROL_DEFINER_TABLE_MANIFEST,
} from './principal.ts';
export type { Client, DbPool, PoolOverrides, RuntimeLoginInput } from './principal.ts';
export { assertIsolatedTestEnvironment, assertIsolatedTestTarget } from './isolated-test-target.ts';
export { enrollCheckpointThread } from './checkpoint-thread.ts';
export type { CheckpointThreadEnrollment } from './checkpoint-thread.ts';
export { revokeCheckpointThread, assertInterviewPrivacyActive, isInterviewPrivacyActive, beginCheckpointErasure, listClaimableCheckpointErasureTargets, claimCheckpointErasureTarget, purgeCheckpointErasureTarget } from './checkpoint-privacy.ts';
export type { CheckpointErasureRequest, ClaimedCheckpointErasureTarget } from './checkpoint-privacy.ts';
export { gatewayDispatchOwners, gatewayModelInvocationOwners, gatewayJobGauges, gatewayCostBudgetSnapshot } from './gateway-dispatch.ts';
export type { GatewayDispatchWork, GatewayJobGauge, GatewayCostBudgetSnapshot } from './gateway-dispatch.ts';

/** 原语②：状态机 CAS——仅当当前态 == from 时迁移到 to 并 version+1，返回是否生效（陈旧落败=0 行）。 */
export async function casTransition(c: Client, id: string, from: string, to: string): Promise<boolean> {
  const r = await c.query('UPDATE interview SET status=$3, version=version+1 WHERE id=$1 AND status=$2', [id, from, to]);
  return r.rowCount === 1;
}

/** 原语③：durable ordered event log——同 stream advisory 事务锁串行 + INSERT…SELECT MAX+1，返回分配到的 seq。 */
export async function appendEvent(c: Client, owner: string, stream: string, kind: string, payload: unknown, eventKey?: string): Promise<number> {
  await c.query('SELECT pg_advisory_xact_lock(hashtext($1))', [stream]);
  if (eventKey) {
    const prior = await c.query('SELECT seq FROM interview_event WHERE stream_key=$1 AND event_key=$2', [stream, eventKey]);
    if (prior.rowCount === 1) return Number(prior.rows[0].seq);
  }
  const r = await c.query(
    `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload,event_key)
     SELECT $1,$2,COALESCE(MAX(seq),0)+1,$3,$4,$5 FROM interview_event WHERE stream_key=$2
     ON CONFLICT (stream_key,event_key) WHERE event_key IS NOT NULL DO NOTHING
     RETURNING seq`, [owner, stream, kind, JSON.stringify(payload), eventKey ?? null]);
  if (r.rowCount === 0 && eventKey) {
    const prior = await c.query('SELECT seq FROM interview_event WHERE stream_key=$1 AND event_key=$2', [stream, eventKey]);
    if (prior.rowCount === 1) return Number(prior.rows[0].seq);
  }
  if (r.rowCount !== 1) throw Object.assign(new Error('append_event_failed'), { code: 'append_event_failed' });
  return Number(r.rows[0].seq);
}

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
  createJob, listJobs, getJob, closeJob,
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

// 外部 AI 调用费用账本：预留/派发/结算/未知结果冻结均由数据库状态机承重。
export { reserveAiCost, reserveAiTextCost, markAiCostDispatched, settleAiCost, settleAiTextCost, releaseAiCost, markAiCostUnknown, markAiCostsUnknownForModelReconcile, markAiTextCostRejected } from './ai-cost-governance.ts';
export type { AiCostDecision, AiCostReservationInput, AiTextCostReservationInput, AiCostReservationDecision } from './ai-cost-governance.ts';

// 模型调用持久 claim：短事务声明意图，网络 I/O 一律在事务外；unknown 禁止自动重发。
export { claimModelInvocation, markModelInvocationDispatched, failModelInvocationClaim, completeModelInvocation, markModelInvocationUnknown, reconcileStaleModelInvocations } from './model-invocation.ts';
export type { ModelInvocationClaim, ClaimModelInvocationInput, CompleteModelInvocationInput, ReconciledModelInvocation } from './model-invocation.ts';

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

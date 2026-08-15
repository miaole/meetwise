/**
 * @meetwise/ai-runtime — AI 运行时关口（公共面）。
 * 外部只许从这里 import；router/validators/catalog 是关口内部件，禁深链（.dependency-cruiser.cjs ai-runtime-chokepoint）。
 * 文本受管调用通过 `invoke`；本入口仍导出原生语音、embedding 与 rerank
 * 适配器，后者尚未完成 MODEL-OP-01 typed binding，不能误称为无旁路网关。
 */
export { invoke, resolveModelDeadlineConfig } from './invoke.ts';
export type { Model, ModelResult, ModelUsage, ModelCostPolicy, ModelCallPlan, ModelAdmission, ModelDeadlineConfig, InvokeSpec, InvokeOutcome } from './invoke.ts';
export { classify } from './router/index.ts';
export type { RouteDecision } from './router/index.ts';
export { resolveBinding } from './catalog/index.ts';
export type { ModelBinding } from './catalog/index.ts';
export type { DoubleValidateResult } from './validators/index.ts';
export { scriptedModelClient, openAICompatibleClient, modelFor, promptedModel, capUserData, CONTEXT_TRUNCATION_MARKER, planContextBudget, requiresBoundModelOperation } from './model-client.ts';
export type { ModelClient, CompletionRequest, ContextBudgetPlan, ContextBudgetDecision } from './model-client.ts';
export { getPrompt, promptVersions } from './prompts.ts';
export type { PromptTemplate } from './prompts.ts';
export { visionOcr, MIN_OCR_CHARS } from './resume-ocr.ts';
export { setTracer, getTracer, recordingTracer } from './trace.ts';
export type { Tracer, ModelCallSpan, ModelCallOutcome } from './trace.ts';
export { resolveLangfuseConnection } from './langfuse-config.ts';
export type { LangfuseConnectionConfig, Environment } from './langfuse-config.ts';
export { createLangfuseV5Runtime, pseudonymizeLangfuseIdentifier, langfuseSafeModelMetadata } from './langfuse-v5.ts';
export type { GraphObserver, GraphRunObservation, GraphNodeObservation, LangfuseV5Runtime } from './langfuse-v5.ts';
export {
  validateEvaluationManifest,
  validateOfflineEvaluationCatalog,
  evaluationManifestDigest,
  LANGFUSE_CONTRACT_REGRESSION_V1,
  OFFLINE_EVALUATION_CATALOG_V1,
  LANGFUSE_DATASET_NAMES,
  langfuseDatasetExpectedOutput,
  langfuseDatasetMetadata,
} from './evaluation-manifest.ts';
export type { EvaluationCase, EvaluationManifest, EvaluationDatasetKind, EvaluationSourcePolicy } from './evaluation-manifest.ts';
export {
  CONTRACT_REGRESSION_GATE_IDS,
  CONTRACT_REGRESSION_ORACLES_V1,
  CONTRACT_REGRESSION_BINDINGS_V1,
  contractRegressionOracle,
  contractRegressionOracleDigest,
  planContractRegressionExecution,
  requireCompleteContractRegressionPlan,
} from './offline-evaluation-execution.ts';
export type { ContractRegressionGateId, ContractRegressionOracle, ContractRegressionBinding, ContractRegressionExecutionPlan } from './offline-evaluation-execution.ts';
export {
  OFFLINE_CONTRACT_GATE_COMMANDS,
  sanitizedOfflineEvaluationEnvironment,
  offlineContractReceiptDigest,
  passedContractOracleIds,
  buildOfflineContractReceipt,
} from './offline-evaluation-runner.ts';
export type { OfflineContractGateCommand, OfflineContractGateResult, OfflineContractCaseResult, OfflineContractReceipt } from './offline-evaluation-runner.ts';
export { onlineJudgeStratum, selectOnlineJudgeLot, sampleOnlineJudgeAttempts } from './online-judge-sampling.ts';
export type { OnlineJudgeEligibleAttempt } from './online-judge-sampling.ts';
export {
  fakeAsr,
  fakeTts,
  disabledAsr,
  disabledTts,
  VOICE_EGRESS_DISABLED_ID,
  dashscopeAsr,
  dashscopeTts,
  ASR_REQUEST_TIMEOUT_MS,
  AsrAbortedError,
  AsrTimeoutError,
  MAX_TTS_AUDIO_BYTES,
  TTS_DOWNLOAD_TIMEOUT_MS,
  TTS_DOWNLOAD_IDLE_TIMEOUT_MS,
  TTS_DOWNLOAD_MAX_CONCURRENT,
  TTS_DOWNLOAD_MAX_QUEUED,
  TtsDownloadCapacityError,
  createTtsDownloadAdmission,
  validateDashscopeTtsAudioUrl,
  isForbiddenTtsDownloadAddress,
  downloadDashscopeTtsAudio,
} from './voice.ts';
export type { Asr, Tts, TtsDownloadAdmission } from './voice.ts';
// 检索 / RAG（向量化 seam + 混合检索 + 召回度量）
export { dashscopeEmbedder, fakeEmbedder, cosine } from './embedder.ts';
export type { Embedder } from './embedder.ts';
export { cachingEmbedder, inMemoryEmbeddingStore } from './embedder-cache.ts';
export type { EmbeddingStore } from './embedder-cache.ts';
export { tokenize, denseRank, buildBm25, rrf, evalRecall } from './retrieval.ts';
export type { Doc, Labeled, RecallReport } from './retrieval.ts';

// 评分官质量 eval 的纯统计度量原语(确定性、可 per-push 证明);见 eval-metrics.proof.ts / scoring-eval:prove。
export { mean, sampleStddev, median, percentile, mad, fractionalRanks, pearson, spearman, kendallTauB, pairwiseOrderAccuracy, icc1, wilsonLowerBound } from './eval-metrics.ts';
export { dashscopeReranker } from './reranker.ts';
export type { Reranker } from './reranker.ts';
export { weightedRrf, buildSearchIndex, expandQuery, multiQuerySearch } from './search.ts';
export type { QueryExpansionInvoker } from './search.ts';
export type { SearchDoc, SearchOpts, SearchIndex } from './search.ts';

export { circuitBreaker } from './circuit-breaker.ts';
export type { BreakerOpts, BreakerPhase } from './circuit-breaker.ts';
export { rateLimitedModel } from './rate-limit-model.ts';
export { failoverModel } from './failover-model.ts';
export { resolveModelRateLimitConfig } from './rate-limit-model.ts';
export type { RateLimitOpts, RateLimitedClient, ModelRateLimitConfig } from './rate-limit-model.ts';

export {
  withTimeout,
  withAbortTimeout,
  timeoutSignal,
  combineAbortSignals,
  fetchWithTimeout,
  fetchJsonWithTimeout,
  ExternalRequestAbortedError,
  ExternalRequestTimeoutError,
  ExternalHttpStatusError,
  ExternalResponseBodyTooLargeError,
  ExternalResponseContentTypeError,
  ExternalResponseJsonError,
} from './timeout.ts';

export { fakeStreamingAsr, fakeStreamingTts, disabledStreamingTts, dashscopeStreamingAsr, dashscopeStreamingTts, streamingVoiceTurn } from './voice-stream.ts';
export type { AsrEvent, StreamingAsr, StreamingTts, StreamTurnHooks } from './voice-stream.ts';

export { createMetrics, setMetrics, getMetrics, registerBaselineMetrics, METRIC, type Metrics } from './metrics.ts';

export { toolRegistry, runToolLoop, type Tool, type ToolRegistry, type ToolStep, type ToolDecision } from './tools.ts';

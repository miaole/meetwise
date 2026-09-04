/**
 * @meetwise/ai-runtime — AI 运行时关口（公共面）。
 * 外部只许从这里 import；router/validators/catalog 是关口内部件，禁深链（.dependency-cruiser.cjs ai-runtime-chokepoint）。
 * 文本受管调用通过 `invoke`。`resume.ocr.v1` 已有 typed binding + 密封 provenance 缝
 * （身份封印，非出站 host pin）。预览版双旗 `OCR_ENABLED=1`+`OCR_PREVIEW=1`
 * 可走通 invoke；生产/enforce/公开只读预览仍拒绝组合根。本入口仍导出原生语音、embedding 与 rerank
 * 适配器，它们尚未完成 MODEL-OP-01 接线，不能误称为无旁路网关。
 */
export { invoke, resolveModelDeadlineConfig } from './invoke.ts';
export type { Model, ModelResult, ModelUsage, ModelCostPolicy, ModelCallPlan, ModelAdmission, ModelDeadlineConfig, InvokeSpec, InvokeOutcome } from './invoke.ts';
export {
  MODEL_OPERATION_REGISTRY, MODEL_OPERATION_REGISTRY_VERSION, DETERMINISTIC_NODE_MATRIX,
  lookupModelOperation, resolveModelOperation, isRegistryLogicalNodeKey, registryLogicalNodeKeyDigest,
  validateModelOperationRegistry,
} from './model-operation-registry.ts';
export type { ModelOperationDefinition, ModelOperationCapability, ModelOperationMeter, ModelOperationResolution } from './model-operation-registry.ts';
export { MODEL_OPERATION_INPUT_SCHEMAS, parseModelOperationInput } from './model-operation-binding.ts';
export type { ModelOperationInputKind, ModelOperationBindingInput, ModelOperationBindingDecision } from './model-operation-binding.ts';
// MODEL-OP-01 typed operation binding：operationId + typed 输入 → 固定 endpoint profile 的绑定快照。
export { resolveModelOperationBinding, validateOperationBindingProfiles, INPUT_KIND_ENDPOINT_PROFILES } from './operation-binding.ts';
export type { BoundModelOperation, BoundOperationEndpoint, OperationBindingDecision } from './operation-binding.ts';
// MODEL-OP-02 共享准入/账本/断路器/并发 的单一权威（取代 per-adapter 限流）。
export { resolveModelAdmissionPartition, admitSharedModelOperation, recordSharedModelOperation } from './model-admission.ts';
export type {
  SharedModelAdmissionLease, AdmitSharedModelOperationInput, AdmitSharedModelOperationResult, SharedModelFeeRecord,
} from './model-admission.ts';
export { classify } from './router/index.ts';
export type { RouteDecision } from './router/index.ts';
export { resolveBinding } from './catalog/index.ts';
export type { ModelBinding } from './catalog/index.ts';
export type { DoubleValidateResult } from './validators/index.ts';
export { scriptedModelClient, openAICompatibleClient, modelFor, promptedModel, capUserData, CONTEXT_TRUNCATION_MARKER, planContextBudget, requiresBoundModelOperation } from './model-client.ts';
export type { ModelClient, CompletionRequest, RenderedContextBudgetPlan, RenderedContextBudgetDecision } from './model-client.ts';
export {
  TEXT_ENDPOINT_REGISTRY_VERSION,
  resolveTextEndpointConfig,
  resolveTextBackupEndpointConfig,
  isTextBackupEnabled,
  rejectLegacyTextUrlOverrides,
  rejectTextTransportOverride,
  assertTextEndpointKeyFingerprints,
} from './text-endpoint-config.ts';
export type { TextEndpointConfig, TextEndpointProfile } from './text-endpoint-config.ts';
export {
  VISION_ENDPOINT_REGISTRY_VERSION,
  resolveVisionEndpointConfig,
  rejectLegacyVisionUrlOverrides,
  assertVisionEndpointKeyFingerprint,
} from './vision-endpoint-config.ts';
export type { VisionEndpointConfig, VisionEndpointProfile } from './vision-endpoint-config.ts';
export { keyFingerprint, parseRevokedFingerprints, assertKeyFingerprint } from './secret-fingerprint.ts';
// M1 fix: worker 启动点显式 resolveDashscopeNativeConfig() 触发 6 把原生 Key 的指纹/撤销校验。
// 过去只在 embedder 构造时顺带解析，rerank/asr/tts/stream 的校验语义隐式耦合于「embedder 恰好被构造」。
export {
  DASHSCOPE_NATIVE_ENDPOINT_REGISTRY_VERSION,
  resolveDashscopeNativeConfig,
  rejectDashscopeNativeTransportOverride,
} from './dashscope-native-config.ts';
export type { DashscopeNativeConfig, DashscopeNativeEndpointProfile, DashscopeNativeCapabilityKeys } from './dashscope-native-config.ts';
export { getPrompt, promptVersions } from './prompts.ts';
export type { PromptTemplate } from './prompts.ts';
// usage 对账与保守估算校准因子(纯 seam,非供应商 tokenizer):异步 reconciler 用它对"派发前保守估算 vs 供应商上报 usage"批量导出上界因子(因子尚未应用回派发)。
export {
  KNOWN_ESTIMATOR_VERSIONS, CALIBRATION_ALGORITHM_VERSION, DEFAULT_SAFETY_MARGIN, MAX_SAFETY_MARGIN,
  isKnownEstimatorVersion, reconcileUsage, refineEstimate,
} from './usage-reconciliation.ts';
export type {
  EstimatorVersion, UsageObservation, UsageObservationVerdict, CalibratedFactor,
  ReconciliationError, ReconciliationOutcome, ReconciliationOptions,
} from './usage-reconciliation.ts';
// CTX-02 派发前预算器（纯、确定性）：8 组件逐项分账 + availableInput 公式 + 确定性降级/拒绝 + 版本化保守估算 + usage 校准。
export {
  CONTEXT_BUDGET_STATUSES, CONTEXT_BUDGET_COMPONENT_IDS, DEFAULT_TRIM_ORDER,
  estimateContextTokens, contextBudgetPolicyFromCostPolicy, planDispatchBudget,
} from './context-budget.ts';
export type {
  ContextBudgetStatus, ContextBudgetComponentId, ContextBudgetComponents,
  ContextBudgetPolicy, ContextBudgetComponentEntry, ContextBudgetPlan,
  ContextBudgetError, ContextBudgetDecision,
} from './context-budget.ts';
// usage 对账校准接线（MODEL-OP-00 收尾）：域级 reconciler（P2）+ 因子读面双校验（P3）。
// 复用纯模块 reconcileUsage/refineEstimate，不重实现因子公式。
export {
  toCalibratedFactor, resolveLatestCalibratedFactor, reconcileUsageCalibration,
} from './usage-calibration-reconciler.ts';
export type {
  ReconcileUsageCalibrationInput, ReconcileUsageCalibrationGroupResult, ReconcileUsageCalibrationResult,
} from './usage-calibration-reconciler.ts';
export {
  visionOcr, bindResumeOcr, bindResumeOcrOperation, resumeOcrMediaDigest,
  MIN_OCR_CHARS, RESUME_OCR_OPERATION_ID,
} from './resume-ocr.ts';
export type { ResumeOcrBindDecision, ResumeOcrBindError, VisionOcrResult } from './resume-ocr.ts';
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
export { createInterviewVoiceSeams } from './interview-voice-seams.ts';
export type { InterviewVoiceSeams } from './interview-voice-seams.ts';
export {
  isProductionVoiceStreamLocked,
  isVoiceStreamAsrPreviewRequested,
  isVoiceStreamAsrPreviewEnabled,
  assertVoiceStreamAsrPreviewComposition,
  refuseVoiceStreamAsrUnlessPreview,
  assertVoiceTurnTakingPreviewAllowed,
  VOICE_STREAM_ASR_UNCONFIGURED,
  VOICE_TURN_TAKING_NOT_CONFIGURED,
  VOICE_TURN_TAKING_UNCONFIGURED,
  STREAMING_ASR_NOT_CONFIGURED,
  STREAMING_TTS_NOT_CONFIGURED,
} from './voice-stream-preview.ts';
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

export { fakeStreamingAsr, fakeStreamingTts, disabledStreamingAsr, disabledStreamingTts, dashscopeStreamingAsr, dashscopeStreamingTts, streamingVoiceTurn } from './voice-stream.ts';
export type { AsrEvent, StreamingAsr, StreamingTts, StreamTurnHooks } from './voice-stream.ts';

export { createMetrics, setMetrics, getMetrics, registerBaselineMetrics, METRIC, type Metrics } from './metrics.ts';

export { toolRegistry, runToolLoop, type Tool, type ToolRegistry, type ToolStep, type ToolDecision } from './tools.ts';

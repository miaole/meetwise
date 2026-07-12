/**
 * @meetwise/ai-runtime — AI 运行时关口（公共面）。
 * 外部只许从这里 import；router/validators/catalog 是关口内部件，禁深链（.dependency-cruiser.cjs ai-runtime-chokepoint）。
 * 这保证一切模型调用都过 invoke 的"重试分类 + 双校验 + 幂等 trace"，无旁路。
 */
export { invoke } from './invoke.ts';
export type { Model, ModelResult, InvokeSpec, InvokeOutcome } from './invoke.ts';
export { classify } from './router/index.ts';
export type { RouteDecision } from './router/index.ts';
export { resolveBinding } from './catalog/index.ts';
export type { ModelBinding } from './catalog/index.ts';
export type { DoubleValidateResult } from './validators/index.ts';
export { scriptedModelClient, openAICompatibleClient, modelFor, promptedModel, capUserData, CONTEXT_TRUNCATION_MARKER } from './model-client.ts';
export type { ModelClient, CompletionRequest } from './model-client.ts';
export { getPrompt, promptVersions } from './prompts.ts';
export type { PromptTemplate } from './prompts.ts';
export { visionOcr, MIN_OCR_CHARS } from './resume-ocr.ts';
export { setTracer, getTracer, recordingTracer } from './trace.ts';
export type { Tracer, ModelCallSpan, ModelCallOutcome } from './trace.ts';
export { langfuseTracer, httpSpanTransport, toLangfuseBatch } from './tracer-langfuse.ts';
export type { SpanEvent, SpanTransport, LangfuseTracer } from './tracer-langfuse.ts';
export { fakeAsr, fakeTts, dashscopeAsr, dashscopeTts } from './voice.ts';
export type { Asr, Tts } from './voice.ts';
// 检索 / RAG（向量化 seam + 混合检索 + 召回度量）
export { dashscopeEmbedder, fakeEmbedder, cosine } from './embedder.ts';
export type { Embedder } from './embedder.ts';
export { cachingEmbedder, inMemoryEmbeddingStore } from './embedder-cache.ts';
export type { EmbeddingStore } from './embedder-cache.ts';
export { tokenize, denseRank, buildBm25, rrf, evalRecall } from './retrieval.ts';
export type { Doc, Labeled, RecallReport } from './retrieval.ts';

// 评分官质量 eval 的纯统计度量原语(确定性、可 per-push 证明);见 eval-metrics.proof.ts / scoring-eval:prove。
export { mean, sampleStddev, median, percentile, mad, fractionalRanks, pearson, spearman, kendallTauB, pairwiseOrderAccuracy, icc1 } from './eval-metrics.ts';
export { dashscopeReranker } from './reranker.ts';
export type { Reranker } from './reranker.ts';
export { weightedRrf, buildSearchIndex, expandQuery, multiQuerySearch } from './search.ts';
export type { SearchDoc, SearchOpts, SearchIndex } from './search.ts';

export { circuitBreaker } from './circuit-breaker.ts';
export type { BreakerOpts, BreakerPhase } from './circuit-breaker.ts';
export { rateLimitedModel } from './rate-limit-model.ts';
export { failoverModel } from './failover-model.ts';
export type { RateLimitOpts, RateLimitedClient } from './rate-limit-model.ts';

export { withTimeout, timeoutSignal, fetchWithTimeout } from './timeout.ts';

export { fakeStreamingAsr, fakeStreamingTts, dashscopeStreamingAsr, dashscopeStreamingTts, streamingVoiceTurn } from './voice-stream.ts';
export type { AsrEvent, StreamingAsr, StreamingTts, StreamTurnHooks } from './voice-stream.ts';

export { createMetrics, setMetrics, getMetrics, type Metrics } from './metrics.ts';

export { toolRegistry, runToolLoop, type Tool, type ToolRegistry, type ToolStep, type ToolDecision } from './tools.ts';

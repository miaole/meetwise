/**
 * Reviewed baseline for the currently known direct model-provider surface.
 *
 * The inventory may describe a migration state, but it cannot remove one of
 * these sources or operations by editing its own JSON.  This is still an
 * observe-only repository policy, not a network enforcement mechanism.
 */
export const REQUIRED_PROVIDER_EGRESS_POLICY = Object.freeze({
  adapters: Object.freeze([
    Object.freeze({
      id: 'openai-compatible-chat',
      source: 'packages/ai-runtime/src/model-client.ts',
      factories: Object.freeze(['openAICompatibleClient']),
      operations: Object.freeze(['chat', 'vision-ocr']),
    }),
    Object.freeze({
      id: 'dashscope-embedding',
      source: 'packages/ai-runtime/src/embedder.ts',
      factories: Object.freeze(['dashscopeEmbedder']),
      operations: Object.freeze(['embedding-build', 'embedding-query']),
    }),
    Object.freeze({
      id: 'dashscope-rerank',
      source: 'packages/ai-runtime/src/reranker.ts',
      factories: Object.freeze(['dashscopeReranker']),
      operations: Object.freeze(['rerank']),
    }),
    Object.freeze({
      id: 'dashscope-http-voice',
      source: 'packages/ai-runtime/src/voice.ts',
      factories: Object.freeze(['dashscopeAsr', 'dashscopeTts']),
      operations: Object.freeze(['asr', 'tts', 'provider-signed-download']),
    }),
    Object.freeze({
      id: 'dashscope-streaming-voice',
      source: 'packages/ai-runtime/src/voice-stream.ts',
      factories: Object.freeze(['dashscopeStreamingAsr', 'dashscopeStreamingTts']),
      operations: Object.freeze(['stream-asr', 'stream-tts']),
    }),
  ]),
  environmentNames: Object.freeze([
    'MODEL_API_KEY',
    'MODEL_BASE_URL',
    'MODEL_BACKUP_BASE_URL',
    'MODEL_BACKUP_API_KEY',
    'DASHSCOPE_API_KEY',
    'DASHSCOPE_TEST_TRANSPORT_OVERRIDES',
    'DASHSCOPE_ENDPOINT_PROFILE',
    'DASHSCOPE_WORKSPACE_ID',
    'DASHSCOPE_COMPAT_BASE_URL',
    'DASHSCOPE_TTS_URL',
    'DASHSCOPE_STREAM_URL',
    'DASHSCOPE_RERANK_URL',
    'DASHSCOPE_ASR_MODEL',
    'DASHSCOPE_TTS_MODEL',
    'DASHSCOPE_EMBED_MODEL',
    'DASHSCOPE_RERANK_MODEL',
    'DASHSCOPE_VISION_MODEL',
    'DASHSCOPE_STREAM_ASR_MODEL',
    'DASHSCOPE_STREAM_TTS_MODEL',
  ]),
  directTransportSources: Object.freeze([
    'packages/ai-runtime/src/timeout.ts',
    'packages/ai-runtime/src/voice-stream.ts',
  ]),
});

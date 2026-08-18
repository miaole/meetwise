/**
 * Typed model-operation input bindings (MODEL-OP-01 contract layer).
 *
 * Every provider capability a future gateway may dispatch must pass one of
 * these strict, per-kind input contracts before any adapter is constructed.
 * The contracts deliberately have no prompt-shaped field: prompts are
 * referenced by immutable renderer/contract ids plus typed object digests,
 * and provider URLs are never accepted from callers — endpoints resolve only
 * from the versioned registry (BAILIAN-04 profile ids).
 *
 * This module is fail-closed static governance: it rejects unknown fields,
 * raw prompt strings, provider URLs, oversized scalars and free-form model
 * names before any transport exists.  Wiring the concrete adapters behind
 * these bindings remains MODEL-OP-01 work and stays blocked.
 */
import { z } from 'zod';

export type ModelOperationInputKind =
  | 'chat'
  | 'vision-ocr'
  | 'embedding-build'
  | 'embedding-query'
  | 'rerank'
  | 'asr'
  | 'asr-stream'
  | 'tts'
  | 'tts-stream'
  | 'signed-download';

const CONTRACT_ID = /^[a-z0-9][a-z0-9._:-]{0,119}$/;
const SHA256_HEX = /^[0-9a-f]{64}$/;
const ENDPOINT_PROFILE_ID = /^[a-z0-9][a-z0-9-]{1,62}$/;
const MODEL_RECIPE_ID = /^[a-z0-9][a-z0-9._:-]{0,159}$/;
const PROVIDER_URL = /(?:^|\s|"|')(?:https?|wss?|ftp):\/\//i;
const BOUNDED_TEXT = z.string().min(1).max(2000);

/** Typed reference to an immutable business object; content itself never travels in the binding. */
const TypedRef = z.strictObject({
  kind: z.string().regex(CONTRACT_ID),
  digest: z.string().regex(SHA256_HEX),
});

/** Bounded, non-prompt scalar payload (titles, locale tags, bounded options). */
const Scalars = z.record(
  z.string().regex(/^[a-z][a-z0-9_]{0,63}$/),
  z.union([BOUNDED_TEXT, z.number().finite(), z.boolean()]),
).refine((entries) => Object.keys(entries).length <= 32, 'model_operation_scalar_count_exceeded');

const ChatInput = z.strictObject({
  inputKind: z.literal('chat'),
  promptContract: z.string().regex(CONTRACT_ID),
  promptVersion: z.string().regex(CONTRACT_ID),
  outputContract: z.string().regex(CONTRACT_ID),
  refs: z.array(TypedRef).min(1).max(64),
  scalars: Scalars.optional(),
});

const VisionOcrInput = z.strictObject({
  inputKind: z.literal('vision-ocr'),
  promptContract: z.string().regex(CONTRACT_ID),
  outputContract: z.string().regex(CONTRACT_ID),
  mediaRefs: z.array(TypedRef).min(1).max(64),
  endpointProfileId: z.string().regex(ENDPOINT_PROFILE_ID),
  maxPages: z.number().int().min(1).max(200),
});

const EmbeddingBuildInput = z.strictObject({
  inputKind: z.literal('embedding-build'),
  recipeId: z.string().regex(MODEL_RECIPE_ID),
  generationRef: TypedRef,
  chunkRefs: z.array(TypedRef).min(1).max(10_000),
});

const EmbeddingQueryInput = z.strictObject({
  inputKind: z.literal('embedding-query'),
  recipeId: z.string().regex(MODEL_RECIPE_ID),
  queryRef: TypedRef,
  topK: z.number().int().min(1).max(100),
  allowCache: z.boolean(),
});

const RerankInput = z.strictObject({
  inputKind: z.literal('rerank'),
  recipeId: z.string().regex(MODEL_RECIPE_ID),
  queryRef: TypedRef,
  candidateRefs: z.array(TypedRef).min(1).max(1000),
});

const AsrInput = z.strictObject({
  inputKind: z.literal('asr'),
  mediaRef: TypedRef,
  maxAudioSeconds: z.number().int().min(1).max(3600),
  locale: z.string().regex(/^[a-z]{2}(-[A-Za-z]{2,4})?$/).optional(),
});

const AsrStreamInput = AsrInput.extend({ inputKind: z.literal('asr-stream'), sessionRef: TypedRef });

const TtsInput = z.strictObject({
  inputKind: z.literal('tts'),
  voiceContract: z.string().regex(CONTRACT_ID),
  textRef: TypedRef,
  maxCharacters: z.number().int().min(1).max(10_000),
});

const TtsStreamInput = TtsInput.extend({ inputKind: z.literal('tts-stream'), sessionRef: TypedRef });

const SignedDownloadInput = z.strictObject({
  inputKind: z.literal('signed-download'),
  artifactRef: TypedRef,
  endpointProfileId: z.string().regex(ENDPOINT_PROFILE_ID),
  maxBytes: z.number().int().min(1).max(100_000_000),
});

export const MODEL_OPERATION_INPUT_SCHEMAS = {
  chat: ChatInput,
  'vision-ocr': VisionOcrInput,
  'embedding-build': EmbeddingBuildInput,
  'embedding-query': EmbeddingQueryInput,
  rerank: RerankInput,
  asr: AsrInput,
  'asr-stream': AsrStreamInput,
  tts: TtsInput,
  'tts-stream': TtsStreamInput,
  'signed-download': SignedDownloadInput,
} as const;

export type ModelOperationBindingInput = z.infer<(typeof MODEL_OPERATION_INPUT_SCHEMAS)[ModelOperationInputKind]>;

function containsProviderUrl(value: unknown): boolean {
  if (typeof value === 'string') return PROVIDER_URL.test(value);
  if (Array.isArray(value)) return value.some(containsProviderUrl);
  if (value && typeof value === 'object')
    return Object.values(value as Record<string, unknown>).some(containsProviderUrl);
  return false;
}

export type ModelOperationBindingDecision =
  | { ok: true; inputKind: ModelOperationInputKind; value: ModelOperationBindingInput }
  | { ok: false; error: 'model_operation_kind_unknown' | 'model_operation_input_invalid' | 'model_operation_provider_url_forbidden' };

/**
 * Parse one typed operation input.  Unknown kinds, unknown fields, raw prompt
 * strings and provider URLs are rejected before any adapter exists.  The
 * parsed value is the only shape a future gateway may turn into a provider
 * request; nothing here is dispatch authority by itself.
 */
export function parseModelOperationInput(inputKind: string, candidate: unknown): ModelOperationBindingDecision {
  const schema = (MODEL_OPERATION_INPUT_SCHEMAS as Record<string, z.ZodType>)[inputKind];
  if (!schema) return { ok: false, error: 'model_operation_kind_unknown' };
  if (containsProviderUrl(candidate)) return { ok: false, error: 'model_operation_provider_url_forbidden' };
  const parsed = schema.safeParse(candidate);
  if (parsed.success === false) return { ok: false, error: 'model_operation_input_invalid' };
  return { ok: true, inputKind: inputKind as ModelOperationInputKind, value: parsed.data as ModelOperationBindingInput };
}

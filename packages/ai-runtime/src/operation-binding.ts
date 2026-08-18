/**
 * operation-binding.ts — MODEL-OP-01 typed operation binding resolver.
 *
 * `parseModelOperationInput` (model-operation-binding.ts) already enforces the
 * *input-shape* contract: strict objects (zero passthrough of unknown fields),
 * no prompt-shaped field, and a deep provider-URL scan.  What it does NOT do is
 * bind an operation to a *fixed endpoint profile* — the `endpointProfileId`
 * field it accepts is only regex-constrained, so a caller could still select an
 * arbitrary (non-URL, but free) profile id.
 *
 * This module closes that gap.  `resolveModelOperationBinding` turns a registry
 * `operationId` + a candidate input into a `BoundModelOperation` whose endpoint
 * profile is **server-derived from a frozen constant map**, never from the
 * caller.  The three MODEL-OP-01 hard rejections are therefore enforced in one
 * place:
 *
 *   1. unknown fields  → strict zod object, no `.passthrough()`/`.catchall()`;
 *   2. raw prompt      → no schema has a prompt/system/messages-shaped field;
 *      content travels as a `TypedRef` (kind + sha256 digest) or bounded
 *      non-prompt scalar text (titles/locale tags/options) — never free-form
 *      prompt/system/messages;
 *   3. provider URL    → (a) `containsProviderUrl` deep-scans the candidate for
 *      any http/https/wss/ftp URL; (b) a caller-supplied `endpointProfileId`
 *      must equal the fixed profile for that input kind, so a free profile
 *      selection is rejected before any transport exists.
 *
 * This is **not** dispatch authority (that stays with `resolveModelOperation`'s
 * `wired` flag and MODEL-OP-02 admission) and it is **not** a gateway: it never
 * makes a network request and never resolves a Key.  Host resolution for the
 * text/vision/native transports remains in the existing frozen
 * `*-endpoint-config.ts` modules — the binding only pins *which* profile an
 * operation may use.
 */
import {
  MODEL_OPERATION_INPUT_SCHEMAS, parseModelOperationInput,
  type ModelOperationBindingInput, type ModelOperationInputKind,
} from './model-operation-binding.ts';
import {
  lookupModelOperation, modelOperationAdmissionKey,
  type ModelOperationCapability, type ModelOperationMeter,
} from './model-operation-registry.ts';

/** Frozen endpoint descriptor. `host: null` means the dedicated `*-endpoint-config` module resolves it. */
export interface BoundOperationEndpoint {
  /** Server-fixed profile id; the caller's `endpointProfileId` must equal this (when the kind carries one). */
  readonly profileId: string;
  readonly region: string;
  /** Frozen host. `null` = resolved by the dedicated text/vision/native endpoint config (never caller-supplied). */
  readonly host: string | null;
  readonly basePath: string;
  readonly scheme: 'https' | 'wss';
}

/** One complete operation binding: registry identity + fixed endpoint + typed input. */
export interface BoundModelOperation {
  readonly operationId: string;
  readonly inputKind: ModelOperationInputKind;
  readonly capability: ModelOperationCapability;
  readonly meter: ModelOperationMeter;
  /** Mirrors the registry `wired` flag: dispatch authorization is a separate concern (MODEL-OP-02). */
  readonly wired: boolean;
  /** Same admission partition key as `resolveModelOperation` (single join helper, no drift). */
  readonly admissionKey: string;
  readonly endpoint: BoundOperationEndpoint;
  /** The strictly parsed, typed input. No prompt-shaped field exists: content here is TypedRef digests or bounded non-prompt scalars. */
  readonly input: ModelOperationBindingInput;
}

export type OperationBindingDecision =
  | { ok: true; binding: BoundModelOperation }
  | {
    ok: false;
    error:
    | 'model_operation_unknown'
    | 'model_operation_kind_unknown'
    | 'model_operation_input_invalid'
    | 'model_operation_provider_url_forbidden'
    | 'model_operation_endpoint_profile_invalid';
  };

const DASHSCOPE_BEIJING_HOST = 'dashscope.aliyuncs.com';
/** Frozen Beijing compatible endpoint (OpenAI-compatible text/vision/embedding/asr). */
const COMPAT_BEIJING = {
  profileId: 'dashscope-cn-beijing', region: 'cn-beijing',
  host: DASHSCOPE_BEIJING_HOST, basePath: '/compatible-mode/v1', scheme: 'https',
} as const satisfies BoundOperationEndpoint;

/**
 * Frozen endpoint profile per input kind.  This is a *constant* allowlist, not
 * an environment lookup: the endpoint a native operation may use is decided
 * here and only here, which is what makes "provider URL reject" mechanical at
 * the binding layer.  The host/basePath values mirror the frozen
 * `dashscope-native-config.ts` Beijing-public endpoints (BAILIAN-04); a new
 * region or provider must change this table through review, never through env.
 */
export const INPUT_KIND_ENDPOINT_PROFILES: Readonly<Record<ModelOperationInputKind, BoundOperationEndpoint>> = Object.freeze({
  // chat 走文本路由；endpoint 具体 host 由 text-endpoint-config.ts 的冻结 profile 决定（MODEL-OP-00 已证），
  // binding 只 pin 文本 profile 家族，绝不在这里重写/复刻 host 解析。
  chat: Object.freeze({
    profileId: 'text-cn-public', region: 'cn', host: null, basePath: '', scheme: 'https',
  }),
  'vision-ocr': Object.freeze({ ...COMPAT_BEIJING }),
  'embedding-build': Object.freeze({ ...COMPAT_BEIJING }),
  'embedding-query': Object.freeze({ ...COMPAT_BEIJING }),
  rerank: Object.freeze({
    profileId: 'dashscope-cn-beijing', region: 'cn-beijing',
    host: DASHSCOPE_BEIJING_HOST, basePath: '/api/v1/services/rerank/text-rerank/text-rerank', scheme: 'https',
  }),
  asr: Object.freeze({ ...COMPAT_BEIJING }),
  'asr-stream': Object.freeze({
    profileId: 'dashscope-cn-beijing', region: 'cn-beijing',
    host: DASHSCOPE_BEIJING_HOST, basePath: '/api-ws/v1/inference', scheme: 'wss',
  }),
  tts: Object.freeze({
    profileId: 'dashscope-cn-beijing', region: 'cn-beijing',
    host: DASHSCOPE_BEIJING_HOST, basePath: '/api/v1/services/aigc/multimodal-generation/generation', scheme: 'https',
  }),
  'tts-stream': Object.freeze({
    profileId: 'dashscope-cn-beijing', region: 'cn-beijing',
    host: DASHSCOPE_BEIJING_HOST, basePath: '/api-ws/v1/inference', scheme: 'wss',
  }),
  // 签名下载：端点是百炼 TTS 结果 OSS host（`dashscope-result-<id>.oss-cn-<region>.aliyuncs.com`）。
  // host 是**固定形态**（provider 分配的 <id>/<region> 占位），精确 host 由 voice.ts 的
  // `validateDashscopeTtsAudioUrl` 冻结 allowlist 校验；binding 只 pin 该 profile，绝不接受 caller URL。
  'signed-download': Object.freeze({
    profileId: 'dashscope-oss-result-cn', region: 'cn-beijing',
    host: 'dashscope-result-<id>.oss-cn-<region>.aliyuncs.com', basePath: '', scheme: 'https',
  }),
});

/**
 * Resolve one operation to a bound, typed operation.
 *
 * Order matters: unknown operation and input-shape violations (unknown fields /
 * raw prompt / provider URL) are rejected by the same fail-closed machinery as
 * the transport, before the endpoint profile is even considered.  A caller
 * `endpointProfileId` that does not equal the fixed profile for the kind is a
 * provider-URL-rejection-adjacent violation: it selects an endpoint, and only
 * the frozen profile is allowed.
 */
export function resolveModelOperationBinding(
  operationId: string,
  candidate: unknown,
): OperationBindingDecision {
  const definition = lookupModelOperation(operationId);
  if (!definition) return { ok: false, error: 'model_operation_unknown' };

  const parsed = parseModelOperationInput(definition.inputKind, candidate);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const endpoint = INPUT_KIND_ENDPOINT_PROFILES[parsed.inputKind]!;

  // vision-ocr / signed-download are the only two kinds whose input carries an
  // `endpointProfileId`.  It is regex-constrained upstream (no URL syntax), but
  // that alone is not authorization: it must equal the fixed profile for the
  // kind, otherwise a caller could still select a free profile.
  const candidateProfileId = (parsed.value as { endpointProfileId?: string }).endpointProfileId;
  if (candidateProfileId !== undefined && candidateProfileId !== endpoint.profileId) {
    return { ok: false, error: 'model_operation_endpoint_profile_invalid' };
  }

  return {
    ok: true,
    binding: Object.freeze({
      operationId: definition.operationId,
      inputKind: parsed.inputKind,
      capability: definition.capability,
      meter: definition.meter,
      wired: definition.wired,
      admissionKey: modelOperationAdmissionKey(definition),
      endpoint,
      input: parsed.value,
    }),
  };
}

/**
 * Static invariant for the binding table itself: every input kind the schemas
 * define must have a fixed endpoint profile, and no profile may expose a raw
 * caller URL (the frozen descriptors never contain userinfo/query/fragment).
 */
export function validateOperationBindingProfiles(): string[] {
  const problems: string[] = [];
  const kinds = Object.keys(MODEL_OPERATION_INPUT_SCHEMAS) as ModelOperationInputKind[];
  for (const kind of kinds) {
    const endpoint = INPUT_KIND_ENDPOINT_PROFILES[kind];
    if (!endpoint) { problems.push(`endpoint_missing:${kind}`); continue; }
    if (!endpoint.profileId || !endpoint.region || !endpoint.scheme)
      problems.push(`endpoint_incomplete:${kind}`);
    if (endpoint.host !== null) {
      if (/[?#@]/.test(endpoint.host) || /\s/.test(endpoint.basePath))
        problems.push(`endpoint_malformed:${kind}`);
    }
  }
  return problems;
}

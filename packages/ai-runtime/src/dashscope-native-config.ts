/**
 * DashScope-native capabilities deliberately do not inherit `MODEL_*`.
 *
 * `MODEL_*` belongs to the Worker text route (for example DeepSeek) and
 * `MODEL_BACKUP_*` belongs to its pre-dispatch text fallback (for example
 * Qwen). ASR, TTS, embeddings, reranking and WebSocket voice use DashScope
 * protocol/model identifiers, so accepting a text-route credential here would
 * silently send a different data class to the wrong provider when text routing
 * changes.
 *
 * 本次新增（BAILIAN-03/04）：原生 Key 也按**能力维度**拆分。过去单一
 * `DASHSCOPE_API_KEY` 一把 key 同时喂给 6 个 operation / 4 个数据等级——任一能力
 * 意外启用即得全套凭据。现在每个适配器只取自己那把 key，缺即 `*_not_configured`，
 * **绝不回退到别的 key 变量**（回退会重新制造「文本 key 换了、语音 key 却没换」的漂移）。
 *
 * Endpoint selection is intentionally *not* an environment URL. A profile is
 * resolved by this versioned registry into an exact host/path set. This keeps a
 * malformed secret injection from turning a bearer-keyed native adapter into an
 * arbitrary outbound HTTP or WebSocket client. It is only a transport boundary:
 * it does not make native operations registry-owned or cost-governed.
 */
import { assertKeyFingerprint, parseRevokedFingerprints } from './secret-fingerprint.ts';

export const DASHSCOPE_NATIVE_ENDPOINT_REGISTRY_VERSION = 'dashscope-cn-beijing-v1' as const;

export type DashscopeNativeEndpointProfile = 'cn-beijing-public' | 'cn-beijing-workspace';

/** 每个能力一把独立 Key（可选：未配置的能力在适配器构造时按 `*_not_configured` fail-closed）。 */
export interface DashscopeNativeCapabilityKeys {
  readonly embed?: string;
  readonly rerank?: string;
  readonly asr?: string;
  readonly tts?: string;
  readonly streamAsr?: string;
  readonly streamTts?: string;
}

export interface DashscopeNativeConfig {
  readonly registryVersion: typeof DASHSCOPE_NATIVE_ENDPOINT_REGISTRY_VERSION;
  readonly profile: DashscopeNativeEndpointProfile;
  readonly region: 'cn-beijing';
  readonly keys: DashscopeNativeCapabilityKeys;
  readonly compatibleBaseUrl: string;
  readonly ttsUrl: string;
  readonly streamUrl: string;
  readonly rerankUrl: string;
}

const LEGACY_URL_VARIABLES = [
  'DASHSCOPE_COMPAT_BASE_URL',
  'DASHSCOPE_TTS_URL',
  'DASHSCOPE_STREAM_URL',
  'DASHSCOPE_RERANK_URL',
] as const;

/** 单一 broad key 是历史形态：出现即拒绝，防止旧部署继续把一把 key 横跨 6 能力。 */
const LEGACY_BROAD_KEY_VARIABLE = 'DASHSCOPE_API_KEY' as const;

/** 每能力 Key 的环境变量名。顺序即适配器取用顺序，缺一不可回退。 */
const CAPABILITY_KEY_VARIABLES = {
  embed: 'DASHSCOPE_EMBED_API_KEY',
  rerank: 'DASHSCOPE_RERANK_API_KEY',
  asr: 'DASHSCOPE_ASR_API_KEY',
  tts: 'DASHSCOPE_TTS_API_KEY',
  streamAsr: 'DASHSCOPE_STREAM_ASR_API_KEY',
  streamTts: 'DASHSCOPE_STREAM_TTS_API_KEY',
} as const;

const workspaceIdPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

function rejectLegacyUrlOverrides(env: NodeJS.ProcessEnv): void {
  for (const name of LEGACY_URL_VARIABLES) {
    if (env[name]?.trim()) throw new Error('dashscope_native_endpoint_env_forbidden');
  }
}

function rejectLegacyBroadKey(env: NodeJS.ProcessEnv): void {
  if (env[LEGACY_BROAD_KEY_VARIABLE]?.trim()) throw new Error('dashscope_native_broad_api_key_forbidden');
}

function resolveHost(env: NodeJS.ProcessEnv): { profile: DashscopeNativeEndpointProfile; host: string } {
  const requested = env.DASHSCOPE_ENDPOINT_PROFILE?.trim() || 'cn-beijing-public';
  if (requested === 'cn-beijing-public') {
    if (env.DASHSCOPE_WORKSPACE_ID?.trim()) throw new Error('dashscope_workspace_id_without_workspace_profile');
    return { profile: requested, host: 'dashscope.aliyuncs.com' };
  }
  if (requested === 'cn-beijing-workspace') {
    const workspaceId = env.DASHSCOPE_WORKSPACE_ID?.trim().toLowerCase();
    if (!workspaceId || !workspaceIdPattern.test(workspaceId)) throw new Error('dashscope_workspace_id_invalid');
    return { profile: requested, host: `${workspaceId}.cn-beijing.maas.aliyuncs.com` };
  }
  throw new Error('dashscope_native_endpoint_profile_invalid');
}

/** 从环境解析每能力 Key 并做启动期指纹/撤销清单校验（B3）。 */
function resolveCapabilityKeys(env: NodeJS.ProcessEnv): DashscopeNativeCapabilityKeys {
  const revoked = parseRevokedFingerprints(env.DASHSCOPE_REVOKED_KEY_FINGERPRINTS);
  const capability = (keyVar: string, fingerprintVar: string, name: string): string | undefined => {
    const key = env[keyVar];
    if (!key) return undefined;
    assertKeyFingerprint({ key, fingerprint: env[fingerprintVar], revoked, name });
    return key;
  };
  return Object.freeze({
    embed: capability(CAPABILITY_KEY_VARIABLES.embed, 'DASHSCOPE_EMBED_API_KEY_FINGERPRINT', 'dashscope_embed_api_key'),
    rerank: capability(CAPABILITY_KEY_VARIABLES.rerank, 'DASHSCOPE_RERANK_API_KEY_FINGERPRINT', 'dashscope_rerank_api_key'),
    asr: capability(CAPABILITY_KEY_VARIABLES.asr, 'DASHSCOPE_ASR_API_KEY_FINGERPRINT', 'dashscope_asr_api_key'),
    tts: capability(CAPABILITY_KEY_VARIABLES.tts, 'DASHSCOPE_TTS_API_KEY_FINGERPRINT', 'dashscope_tts_api_key'),
    streamAsr: capability(CAPABILITY_KEY_VARIABLES.streamAsr, 'DASHSCOPE_STREAM_ASR_API_KEY_FINGERPRINT', 'dashscope_stream_asr_api_key'),
    streamTts: capability(CAPABILITY_KEY_VARIABLES.streamTts, 'DASHSCOPE_STREAM_TTS_API_KEY_FINGERPRINT', 'dashscope_stream_tts_api_key'),
  });
}

/** Resolve a frozen, Beijing-only native endpoint snapshot. */
export function resolveDashscopeNativeConfig(env: NodeJS.ProcessEnv = process.env): DashscopeNativeConfig {
  rejectLegacyUrlOverrides(env);
  rejectLegacyBroadKey(env);
  const { profile, host } = resolveHost(env);
  const httpBase = `https://${host}`;
  return Object.freeze({
    registryVersion: DASHSCOPE_NATIVE_ENDPOINT_REGISTRY_VERSION,
    profile,
    region: 'cn-beijing' as const,
    keys: resolveCapabilityKeys(env),
    compatibleBaseUrl: `${httpBase}/compatible-mode/v1`,
    ttsUrl: `${httpBase}/api/v1/services/aigc/multimodal-generation/generation`,
    streamUrl: `wss://${host}/api-ws/v1/inference`,
    rerankUrl: `${httpBase}/api/v1/services/rerank/text-rerank/text-rerank`,
  });
}

/**
 * Test transports may provide a fake key/endpoint only from a dedicated test
 * process. Application code never sets this escape hatch; production and
 * development compositions reject the override before constructing transport.
 */
export function rejectDashscopeNativeTransportOverride(value: unknown): void {
  if (value === undefined) return;
  if (process.env.NODE_ENV === 'test' && process.env.DASHSCOPE_TEST_TRANSPORT_OVERRIDES === '1') return;
  throw new Error('dashscope_native_transport_override_forbidden');
}

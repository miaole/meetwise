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
 * Endpoint selection is intentionally *not* an environment URL. A profile is
 * resolved by this versioned registry into an exact host/path set. This keeps a
 * malformed secret injection from turning a bearer-keyed native adapter into an
 * arbitrary outbound HTTP or WebSocket client. It is only a transport boundary:
 * it does not make native operations registry-owned or cost-governed.
 */
export const DASHSCOPE_NATIVE_ENDPOINT_REGISTRY_VERSION = 'dashscope-cn-beijing-v1' as const;

export type DashscopeNativeEndpointProfile = 'cn-beijing-public' | 'cn-beijing-workspace';

export interface DashscopeNativeConfig {
  readonly registryVersion: typeof DASHSCOPE_NATIVE_ENDPOINT_REGISTRY_VERSION;
  readonly profile: DashscopeNativeEndpointProfile;
  readonly region: 'cn-beijing';
  readonly apiKey?: string;
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

const workspaceIdPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

function rejectLegacyUrlOverrides(env: NodeJS.ProcessEnv): void {
  for (const name of LEGACY_URL_VARIABLES) {
    if (env[name]?.trim()) throw new Error('dashscope_native_endpoint_env_forbidden');
  }
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

/** Resolve a frozen, Beijing-only native endpoint snapshot. */
export function resolveDashscopeNativeConfig(env: NodeJS.ProcessEnv = process.env): DashscopeNativeConfig {
  rejectLegacyUrlOverrides(env);
  const { profile, host } = resolveHost(env);
  const httpBase = `https://${host}`;
  return Object.freeze({
    registryVersion: DASHSCOPE_NATIVE_ENDPOINT_REGISTRY_VERSION,
    profile,
    region: 'cn-beijing' as const,
    apiKey: env.DASHSCOPE_API_KEY,
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

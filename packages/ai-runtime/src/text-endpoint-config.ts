/**
 * 文本主链路 endpoint 治理（BAILIAN-04 的文本侧修复）。
 *
 * 过去 `MODEL_BASE_URL` / `MODEL_BACKUP_BASE_URL` 是**自由 URL**，`openAICompatibleClient`
 * 直接 `${baseUrl}/chat/completions` 拼接直发。后果：可注入任意 scheme（http 明文）、
 * userinfo、query/fragment、任意 host、跨区域，且默认 fetch 会跟随 3xx 重定向 → SSRF。
 *
 * 本文件把「endpoint 是什么」收口为**版本化 profile id → 精确 https host/path** 的冻结
 * 注册表，对齐 `dashscope-native-config.ts` 的模式：
 *   - 绝不接受 URL 注入：旧 `MODEL_BASE_URL` / `MODEL_BACKUP_BASE_URL` 一律在解析前被拒绝；
 *   - 解析结果 `Object.freeze`，调用方无法在派发前改写 endpoint；
 *   - profile 只有受控 allowlist（DeepSeek 公网 / 百炼兼容北京），跨区域、非 allowlist host
 *     在类型与运行时双重被拒，无法表达。
 *
 * 注意：这只是**transport 边界**，不是 operation registry，也不做费用治理（那是
 * model-cost-governance / MODEL-OP-01 的职责）。它只保证「文本调用只可能打到受控端点」。
 */
import { assertKeyFingerprint, parseRevokedFingerprints } from './secret-fingerprint.ts';

export const TEXT_ENDPOINT_REGISTRY_VERSION = 'text-cn-public-v1' as const;

export type TextEndpointProfile = 'deepseek-cn-public' | 'dashscope-cn-beijing';

export interface TextEndpointConfig {
  readonly registryVersion: typeof TEXT_ENDPOINT_REGISTRY_VERSION;
  readonly profile: TextEndpointProfile;
  readonly region: 'cn';
  readonly baseUrl: string; // 恒为 https，无 userinfo/query/fragment
  readonly apiKey?: string;
  readonly model: string;
}

/** 旧自由 URL 变量：一旦出现即拒绝，绝不当作「可解析的 endpoint」继续使用。 */
const LEGACY_TEXT_URL_VARIABLES = ['MODEL_BASE_URL', 'MODEL_BACKUP_BASE_URL'] as const;

/** profile → 精确 host + basePath。允许集是闭集：新增供应商必须改这里并走评审，不能靠 env 拼出来。 */
const TEXT_ENDPOINT_PROFILES: Record<TextEndpointProfile, { host: string; basePath: string }> = {
  'deepseek-cn-public': { host: 'api.deepseek.com', basePath: '' },
  'dashscope-cn-beijing': { host: 'dashscope.aliyuncs.com', basePath: '/compatible-mode/v1' },
};

export function rejectLegacyTextUrlOverrides(env: NodeJS.ProcessEnv): void {
  for (const name of LEGACY_TEXT_URL_VARIABLES) {
    if (env[name]?.trim()) throw new Error('text_endpoint_env_forbidden');
  }
}

function resolveProfile(env: NodeJS.ProcessEnv, requested: string): TextEndpointProfile {
  // L1 fix: `in` 会沿原型链命中 Object.prototype 的 constructor/toString/__proto__ 等属性，
  // 使 `TEXT_ENDPOINT_PROFILES['constructor']` 解构出 undefined host/basePath → `https://undefinedundefined`。
  // 必须用 Object.hasOwn 只认注册表**自有**键，闭集之外一律 text_endpoint_profile_invalid（fail-closed）。
  if (!Object.hasOwn(TEXT_ENDPOINT_PROFILES, requested)) throw new Error('text_endpoint_profile_invalid');
  return requested as TextEndpointProfile;
}

function buildConfig(env: NodeJS.ProcessEnv, profile: TextEndpointProfile): TextEndpointConfig {
  const { host, basePath } = TEXT_ENDPOINT_PROFILES[profile];
  return {
    registryVersion: TEXT_ENDPOINT_REGISTRY_VERSION,
    profile,
    region: 'cn' as const,
    baseUrl: `https://${host}${basePath}`,
    apiKey: env.MODEL_API_KEY,
    // F4 fix: 缺省模型名统一 qwen-plus（项目实际接入的境内模型），与 model-cost-governance 的
    // `env.MODEL_NAME ?? 'qwen-plus'` 一致。旧默认 gpt-4o-mini 是 OpenAI 模型，本项目未接入，
    // 若某调用方漏配 MODEL_NAME 会静默把文本请求路由到错误/未接入的模型名。
    model: env.MODEL_NAME?.trim() || 'qwen-plus',
  };
}

/**
 * 主文本端点快照。缺省 DeepSeek 公网；`MODEL_ENDPOINT_PROFILE` 可切到百炼兼容北京。
 * 结果冻结。旧 `MODEL_BASE_URL` / `MODEL_BACKUP_BASE_URL` 出现即抛 `text_endpoint_env_forbidden`。
 */
export function resolveTextEndpointConfig(env: NodeJS.ProcessEnv = process.env): TextEndpointConfig {
  rejectLegacyTextUrlOverrides(env);
  const requested = env.MODEL_ENDPOINT_PROFILE?.trim() || 'deepseek-cn-public';
  return Object.freeze(buildConfig(env, resolveProfile(env, requested)));
}

/** 备用端点是否启用：以「备用 Key 已挂载」为准，绝不再用自由 URL 的存在性当开关。 */
export function isTextBackupEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.MODEL_BACKUP_API_KEY?.trim());
}

/**
 * 备用文本端点快照。缺省百炼兼容北京（Qwen backup）；`MODEL_BACKUP_ENDPOINT_PROFILE` 可
 * 显式选择（仍是闭集）。与主端点共享同一套冻结/legacy 拒绝语义，避免备用成为第二个注入面。
 */
export function resolveTextBackupEndpointConfig(env: NodeJS.ProcessEnv = process.env): TextEndpointConfig {
  rejectLegacyTextUrlOverrides(env);
  const requested = env.MODEL_BACKUP_ENDPOINT_PROFILE?.trim() || 'dashscope-cn-beijing';
  const config = Object.freeze(buildConfig(env, resolveProfile(env, requested)));
  // 备用 endpoint 的模型名默认取 MODEL_BACKUP_NAME，其次才是主 MODEL_NAME。
  return Object.freeze({
    ...config,
    apiKey: env.MODEL_BACKUP_API_KEY,
    // F4 fix: 与主链路一致，兜底默认改为 qwen-plus（不再落到未接入的 gpt-4o-mini）。
    model: env.MODEL_BACKUP_NAME?.trim() || env.MODEL_NAME?.trim() || 'qwen-plus',
  });
}

/**
 * 文本主/备用 Key 的启动期指纹与撤销清单校验（B3 fail-closed）。
 * 与 dashscope 侧共用同一套纯函数原语；Key 未挂载时跳过（未配置语义归调用方）。
 */
export function assertTextEndpointKeyFingerprints(env: NodeJS.ProcessEnv = process.env): void {
  const revoked = parseRevokedFingerprints(env.MODEL_REVOKED_KEY_FINGERPRINTS);
  assertKeyFingerprint({ key: env.MODEL_API_KEY, fingerprint: env.MODEL_API_KEY_FINGERPRINT, revoked, name: 'model_api_key' });
  assertKeyFingerprint({ key: env.MODEL_BACKUP_API_KEY, fingerprint: env.MODEL_BACKUP_API_KEY_FINGERPRINT, revoked, name: 'model_backup_api_key' });
}

/**
 * 测试专用 transport override 缝（对齐 `rejectDashscopeNativeTransportOverride`）：
 * 应用代码绝不设置；只有 `NODE_ENV==='test'` 且显式 `MODEL_TEST_TRANSPORT_OVERRIDES==='1'`
 * 才放行 cfg.baseUrl/apiKey 的注入（供 fake echo / 本地 loopback 证明用）。生产/开发一律拒绝。
 */
export function rejectTextTransportOverride(value: unknown): void {
  if (value === undefined) return;
  if (process.env.NODE_ENV === 'test' && process.env.MODEL_TEST_TRANSPORT_OVERRIDES === '1') return;
  throw new Error('text_transport_override_forbidden');
}

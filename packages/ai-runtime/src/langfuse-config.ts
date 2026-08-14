/**
 * Langfuse（模型可观测与评测平台）连接配置的唯一解析点。
 *
 * 观测故障可以 fail-open（不阻断业务），但“启用后静默丢全部数据”不可接受：
 * `enabled=true` 时缺任何认证或地址字段均在组合根启动前显式失败。`HOST` 仅为
 * 历史兼容别名；新配置只写 `BASE_URL`，两者不一致时拒绝猜测。
 */
export interface LangfuseConnectionConfig {
  enabled: boolean;
  baseUrl?: string;
  publicKey?: string;
  secretKey?: string;
  correlationSecret?: string;
}

export type Environment = Record<string, string | undefined>;

function normalizeHttpsUrl(raw: string): string {
  let url: URL;
  try { url = new URL(raw); }
  catch { throw Object.assign(new Error('langfuse_base_url_invalid'), { code: 'langfuse_base_url_invalid' }); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw Object.assign(new Error('langfuse_base_url_invalid'), { code: 'langfuse_base_url_invalid' });
  }
  url.pathname = url.pathname.replace(/\/$/, '');
  return url.toString().replace(/\/$/, '');
}

function enabledFlag(raw: string | undefined): boolean {
  if (raw === undefined || raw === '' || raw === 'false') return false;
  if (raw === 'true') return true;
  throw Object.assign(new Error('langfuse_tracing_enabled_invalid'), { code: 'langfuse_tracing_enabled_invalid' });
}

/** Resolve external credentials without ever returning them in an error message. */
export function resolveLangfuseConnection(
  env: Environment = process.env,
  options: { requireCorrelationSecret?: boolean } = {},
): LangfuseConnectionConfig {
  if (!enabledFlag(env.LANGFUSE_TRACING_ENABLED)) return { enabled: false };
  const baseRaw = env.LANGFUSE_BASE_URL?.trim();
  const hostRaw = env.LANGFUSE_HOST?.trim();
  if (!baseRaw && !hostRaw) throw Object.assign(new Error('langfuse_base_url_missing'), { code: 'langfuse_base_url_missing' });
  const baseUrl = normalizeHttpsUrl(baseRaw ?? hostRaw!);
  if (baseRaw && hostRaw && baseUrl !== normalizeHttpsUrl(hostRaw)) {
    throw Object.assign(new Error('langfuse_base_url_conflict'), { code: 'langfuse_base_url_conflict' });
  }
  const publicKey = env.LANGFUSE_PUBLIC_KEY?.trim();
  const secretKey = env.LANGFUSE_SECRET_KEY?.trim();
  if (!publicKey || !secretKey) throw Object.assign(new Error('langfuse_credentials_missing'), { code: 'langfuse_credentials_missing' });
  const correlationSecret = env.LANGFUSE_CORRELATION_SECRET?.trim();
  if (options.requireCorrelationSecret && !correlationSecret) {
    throw Object.assign(new Error('langfuse_correlation_secret_missing'), { code: 'langfuse_correlation_secret_missing' });
  }
  return { enabled: true, baseUrl, publicKey, secretKey, correlationSecret };
}

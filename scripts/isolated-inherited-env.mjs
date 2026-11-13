/**
 * Isolated runner inherited-env policy: fail-closed allowlist.
 * Operator shells may contain cloud provider keys; disposable proves must
 * not inherit them. Live E2E / scoring:eval:raw may receive MODEL_API_KEY
 * only, after an explicit target check.
 */
export const LIVE_E2E_TARGETS = new Set(['e2e:prove', 'e2e:ui', 'performance:e2e']);

export const INHERITED_ENV_EXACT = new Set([
  'PATH', 'HOME', 'USER', 'LOGNAME', 'SHELL', 'TERM', 'TERMINFO', 'TERMCAP',
  'TMPDIR', 'TMP', 'TEMP', 'PWD', 'INIT_CWD', 'OLDPWD',
  'LANG', 'LANGUAGE', 'TZ', 'CI', 'HOSTNAME', 'HOST', 'HOSTTYPE',
  'NODE_ENV', 'NODE_OPTIONS', 'NODE_PATH', 'NODE_EXTRA_CA_CERTS', 'NODE_DEBUG',
  'PNPM_HOME', 'PNPM_PACKAGE_NAME',
  'FORCE_COLOR', 'NO_COLOR', 'COLOR', 'COLORTERM', 'TERM_PROGRAM', 'TERM_PROGRAM_VERSION',
  'TURBO_DAEMON', 'TURBO_TELEMETRY_DISABLED', 'TURBO_REMOTE_CACHING',
  'DISPLAY', 'WAYLAND_DISPLAY', 'XAUTHORITY',
  'BROWSER',
  'DOCKER_HOST', 'DOCKER_TLS_VERIFY', 'DOCKER_CERT_PATH', 'DOCKER_CONTEXT',
  'XDG_RUNTIME_DIR', 'XDG_CONFIG_HOME', 'XDG_CACHE_HOME', 'XDG_DATA_HOME',
  'G7_FREETIER_REPROVE', 'G7_RUN_COST_LEDGER_PATH', 'G7_PORCELAIN_CLEAN',
  'G7_RUN_COST_CAP_CNY', 'G7_RUNNER_COMMIT_SHA',
  'E2E_ISOLATION_STACK', 'E2E_SOLE_APPROVED_FIXTURE', 'E2E_PG_IMAGE', 'E2E_ISOLATED',
  'npm_execpath', 'npm_node_execpath', 'npm_config_user_agent',
]);

export const INHERITED_ENV_PREFIXES = [
  'npm_', 'NPM_', 'PNPM_', 'pnpm_', 'NODE_', 'LC_', 'XDG_', 'E2E_', 'G7_',
  'PLAYWRIGHT_', 'PW_', 'CHROME_', 'CHROMIUM_', 'FIREFOX_',
  'TURBO_', 'TSX_', 'TS_NODE_', 'COREPACK_', 'DOCKER_',
];

const PROVIDER_KEY_PREFIX = /^(OPENAI|ANTHROPIC|XAI|DASHSCOPE|LANGFUSE|LANGSMITH)(_|$)/i;
const SECRET_SUFFIX = /(_API_KEY|_ACCESS_KEY|_SECRET|_SECRET_KEY|_PRIVATE_KEY|_PASSWORD|_TOKEN)$/i;

// Exact names previously stripped in run-e2e-isolated inheritedEnv. Kept as
// literals so provider-egress inventory can see the moved deny list.
export const STRIPPED_PROVIDER_ENV_EXACT = [
  'MODEL_API_KEY',
  'MODEL_BACKUP_API_KEY',
  'DASHSCOPE_API_KEY',
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
];

export function isSecretShapedEnvKey(key) {
  if (STRIPPED_PROVIDER_ENV_EXACT.includes(key)) return true;
  if (PROVIDER_KEY_PREFIX.test(key)) return true;
  if (SECRET_SUFFIX.test(key)) return true;
  return false;
}

export function isInheritedEnvKeyAllowed(key) {
  if (isSecretShapedEnvKey(key)) return false;
  if (INHERITED_ENV_EXACT.has(key)) return true;
  return INHERITED_ENV_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export function isLiveModelKeyTarget(target, liveTargets = LIVE_E2E_TARGETS) {
  return liveTargets.has(target) || target === 'scoring:eval:raw';
}

export function buildInheritedEnv(sourceEnv, target, liveTargets = LIVE_E2E_TARGETS) {
  const out = {};
  for (const [key, value] of Object.entries(sourceEnv)) {
    if (value === undefined) continue;
    if (!isInheritedEnvKeyAllowed(key)) continue;
    out[key] = value;
  }
  if (isLiveModelKeyTarget(target, liveTargets)) {
    const key = String(sourceEnv.MODEL_API_KEY ?? '').trim();
    if (key) out.MODEL_API_KEY = sourceEnv.MODEL_API_KEY;
  }
  return out;
}

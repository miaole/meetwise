/**
 * Environment contract for the controller-owned database snapshot verifier.
 *
 * The synthetic loader is an API-only actor.  It must never inherit the
 * migration/runtime `DATABASE_URL` (or a generic CA/TLS variable that would
 * let a candidate process accidentally select another database).  The
 * verifier receives one explicitly named, read-only connection contract from
 * the controller instead.
 */

export const VERIFY_DATABASE_URL_ENV = 'PREVIEW_VERIFY_DATABASE_URL';
export const VERIFY_DATABASE_CA_ENV = 'PREVIEW_VERIFY_DATABASE_SSL_CA_PATH';
export const VERIFY_DATABASE_TLS_ENV = 'PREVIEW_VERIFY_PG_TLS_SERVERNAME';
export const VERIFY_EXPECTED_DATABASE_ENV = 'PREVIEW_VERIFY_EXPECTED_DATABASE';
export const VERIFY_EXPECTED_ROLE_ENV = 'PREVIEW_VERIFY_EXPECTED_ROLE';

// These are the only database identity facts accepted by the preview verifier.
// The dedicated audit role is provisioned outside this repository; this module
// deliberately never creates or alters it.
export const EXPECTED_DATABASE = 'meetwise_cloud_test';
export const EXPECTED_ROLE = 'meetwise_preview_audit';

const FORBIDDEN_GENERIC_DATABASE_ENV = Object.freeze([
  'DATABASE_URL',
  'MIGRATION_DATABASE_URL',
  'RUNTIME_DATABASE_URL',
  'QBANK_CONTROL_DATABASE_URL',
  'RAG_CONTROL_DATABASE_URL',
  'DATABASE_SSL_CA_PATH',
  'PG_TLS_SERVERNAME',
]);

function nonEmpty(value) {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Validate the verifier's explicit connection contract without opening a
 * socket.  The caller still binds the URL hostname/role to the root-owned
 * target manifest after connecting.
 */
export function resolveReadOnlyVerifierEnv(env = process.env) {
  if (FORBIDDEN_GENERIC_DATABASE_ENV.some((key) => nonEmpty(env[key]))) {
    throw new Error('preview_verifier_generic_database_env_forbidden');
  }
  const rawUrl = env[VERIFY_DATABASE_URL_ENV];
  const caPath = env[VERIFY_DATABASE_CA_ENV];
  const tlsServername = env[VERIFY_DATABASE_TLS_ENV];
  const expectedDatabase = env[VERIFY_EXPECTED_DATABASE_ENV];
  const expectedRole = env[VERIFY_EXPECTED_ROLE_ENV];
  if (!nonEmpty(rawUrl) || !nonEmpty(caPath) || !nonEmpty(tlsServername)
    || expectedDatabase !== EXPECTED_DATABASE || expectedRole !== EXPECTED_ROLE) {
    throw new Error('preview_verifier_read_only_contract_missing');
  }
  let databaseUrl;
  try { databaseUrl = new URL(rawUrl); }
  catch { throw new Error('preview_verifier_database_url_invalid'); }
  if (!['postgres:', 'postgresql:'].includes(databaseUrl.protocol)
    || databaseUrl.search || databaseUrl.hash || !databaseUrl.hostname
    || databaseUrl.hostname === 'localhost' || databaseUrl.hostname === '127.0.0.1' || databaseUrl.hostname === '::1' || databaseUrl.hostname === '[::1]') {
    throw new Error('preview_verifier_database_url_invalid');
  }
  if (decodeURIComponent(databaseUrl.pathname.replace(/^\//, '')) !== EXPECTED_DATABASE) {
    throw new Error('preview_verifier_database_identity_invalid');
  }
  if (!caPath.startsWith('/') || caPath.includes('\0') || caPath.includes('..') || caPath.startsWith('-') || caPath.length > 4096 || tlsServername.includes('/') || tlsServername.includes('\\') || tlsServername.length > 255) {
    throw new Error('preview_verifier_tls_contract_invalid');
  }
  return Object.freeze({ databaseUrl: rawUrl, caPath, tlsServername, expectedDatabase, expectedRole });
}

/**
 * The candidate loader may pass only this allowlisted environment to the
 * verifier child.  Keeping the check here makes accidental reintroduction of
 * `DATABASE_URL` a local proof failure instead of a deployment-time surprise.
 */
export function buildVerifierProcessEnv(env = process.env) {
  const contract = resolveReadOnlyVerifierEnv(env);
  return {
    PATH: env.PATH ?? '/usr/sbin:/usr/bin:/sbin:/bin',
    HOME: env.HOME ?? '/var/lib/meetwise-preview-synthetic',
    NODE_ENV: 'production',
    [VERIFY_DATABASE_URL_ENV]: contract.databaseUrl,
    [VERIFY_DATABASE_CA_ENV]: contract.caPath,
    [VERIFY_DATABASE_TLS_ENV]: contract.tlsServername,
    [VERIFY_EXPECTED_DATABASE_ENV]: contract.expectedDatabase,
    [VERIFY_EXPECTED_ROLE_ENV]: contract.expectedRole,
  };
}

export const forbiddenGenericDatabaseEnv = FORBIDDEN_GENERIC_DATABASE_ENV;

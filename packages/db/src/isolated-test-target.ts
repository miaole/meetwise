import { isIP } from 'node:net';
import type { DbPool } from './principal.ts';

const CLOUD_RUN_ID = /^[a-z0-9][a-z0-9-]{5,40}$/;
const CLOUD_TOKEN = /^[A-Za-z0-9._-]{16,160}$/;
const CLOUD_ARTIFACT_DIGEST = /^[a-f0-9]{64}$/;

function privateIpv4(address: string | undefined): boolean {
  if (!address || isIP(address) !== 4) return false;
  const [first, second] = address.split('.').map(Number);
  return first === 10 || (first === 172 && second !== undefined && second >= 16 && second <= 31) || (first === 192 && second === 168);
}

function requireCloudValue(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();
  if (!value) throw new Error(`destructive_proof_cloud_${name.toLowerCase()}_missing`);
  return value;
}

function expectedCloudDatabase(runId: string): string {
  return `meetwise_e2e_${runId.replace(/-/g, '_')}`;
}

function assertCloudPrivateTestEnvironment(env: NodeJS.ProcessEnv): void {
  if (env.E2E_ISOLATED) throw new Error('destructive_proof_isolation_profiles_conflict');
  if (env.DATABASE_URL) throw new Error('destructive_proof_database_url_forbidden');
  const runId = requireCloudValue(env, 'E2E_CLOUD_TEST_RUN_ID');
  if (!CLOUD_RUN_ID.test(runId)) throw new Error('destructive_proof_cloud_run_id_invalid');
  const expectedDatabase = expectedCloudDatabase(runId);
  if (requireCloudValue(env, 'E2E_CLOUD_TEST_DATABASE') !== expectedDatabase || env.PGDATABASE !== expectedDatabase)
    throw new Error('destructive_proof_cloud_database_mismatch');
  if (!CLOUD_TOKEN.test(requireCloudValue(env, 'E2E_CLOUD_TEST_TARGET_TOKEN')))
    throw new Error('destructive_proof_cloud_target_token_invalid');
  if (!CLOUD_ARTIFACT_DIGEST.test(requireCloudValue(env, 'E2E_CLOUD_TEST_ARTIFACT_DIGEST')))
    throw new Error('destructive_proof_cloud_artifact_digest_invalid');
  if (!privateIpv4(env.PGHOST)) throw new Error('destructive_proof_cloud_private_ip_required');
  if (!/^[1-9]\d{0,4}$/.test(env.PGPORT ?? '') || Number(env.PGPORT) > 65535)
    throw new Error('destructive_proof_cloud_port_invalid');
  if (!env.PGUSER?.trim() || env.PGPASSWORD === undefined)
    throw new Error('destructive_proof_cloud_database_identity_missing');
  if (env.DATABASE_SSL_MODE !== 'verify-full' || !env.DATABASE_SSL_CA_PATH?.trim() || !env.PG_TLS_SERVERNAME?.trim())
    throw new Error('destructive_proof_cloud_tls_attestation_missing');
  for (const name of ['CLOUD_TEST_SERIAL_DATABASE_URL', 'CLOUD_TEST_RECEIPT_HMAC_KEY', 'CLOUD_TEST_MODE']) {
    if (env[name]?.trim()) throw new Error(`destructive_proof_cloud_control_variable_forbidden:${name.toLowerCase()}`);
  }
}

/**
 * Destructive database proofs are never allowed to infer their target from a
 * developer shell.  The isolated runner creates a fresh loopback PostgreSQL
 * container and injects a server-side custom setting that ordinary local or
 * cloud databases do not have.  Validate the cheap, no-network properties
 * first; only then make one read-only query to verify the container nonce.
 */
export function assertIsolatedTestEnvironment(env: NodeJS.ProcessEnv = process.env): void {
  if (env.E2E_CLOUD_ISOLATED === '1') {
    assertCloudPrivateTestEnvironment(env);
    return;
  }
  if (env.E2E_ISOLATED !== '1') throw new Error('destructive_proof_requires_e2e_isolated');
  if (env.DATABASE_URL) throw new Error('destructive_proof_database_url_forbidden');
  if (env.PGHOST !== '127.0.0.1') throw new Error('destructive_proof_loopback_target_required');
  if (env.DATABASE_SSL_MODE && env.DATABASE_SSL_MODE !== 'disable')
    throw new Error('destructive_proof_tls_mode_must_be_controlled');
  if (!env.E2E_TEST_CONTAINER || !env.E2E_TEST_TARGET_TOKEN)
    throw new Error('destructive_proof_isolated_target_attestation_missing');
}

/** Establishes no DDL/DML: it only verifies the nonce supplied to Postgres at container start. */
export async function assertIsolatedTestTarget(pool: DbPool, env: NodeJS.ProcessEnv = process.env): Promise<void> {
  assertIsolatedTestEnvironment(env);
  const cloud = env.E2E_CLOUD_ISOLATED === '1';
  const result = await pool.query("SELECT current_setting('meetwise.e2e_run_token', true) AS token, current_database() AS database");
  const token = cloud ? env.E2E_CLOUD_TEST_TARGET_TOKEN : env.E2E_TEST_TARGET_TOKEN;
  const database = cloud ? env.E2E_CLOUD_TEST_DATABASE : undefined;
  if (result.rows[0]?.token !== token || (database !== undefined && result.rows[0]?.database !== database))
    throw new Error('destructive_proof_isolated_target_attestation_mismatch');
}

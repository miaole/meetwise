import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cloudSmokeFailure, type CloudSmokeReceipt, runCloudSmoke } from './cloud-smoke-runner.ts';

const FIXED_ACK = 'I_UNDERSTAND_FIXED_TARGET_IS_READ_ONLY';
const RUN_ID = /^[a-z0-9][a-z0-9-]{5,62}$/;
const SECRET_FIELDS = [
  'schemaVersion', 'tlsMode', 'databaseUrl', 'redisUrl', 'databaseCa', 'redisCa', 'receiptHmacKey', 'privateCidrs',
] as const;

export type FixedReadonlySmokeSecret = {
  schemaVersion: 1;
  tlsMode: 'system-root' | 'vpc-test-only-no-verify';
  databaseUrl: string;
  redisUrl: string;
  databaseCa?: string;
  redisCa?: string;
  receiptHmacKey: string;
  privateCidrs: string;
};

export type CloudSmokeFcDeps = {
  loadSecret: () => Promise<string>;
  runSmoke?: (runId: string, env: NodeJS.ProcessEnv) => Promise<CloudSmokeReceipt>;
};

function failure(code: string): never {
  throw new Error(`cloud_smoke_fc_${code}`);
}

function parseInvocation(event: unknown): string {
  let value: unknown = event;
  if (Buffer.isBuffer(event) || event instanceof Uint8Array) value = Buffer.from(event).toString('utf8');
  if (typeof value === 'string') {
    try { value = JSON.parse(value); }
    catch { return failure('event_invalid'); }
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return failure('event_invalid');
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length !== 1 || entries[0]![0] !== 'runId' || typeof entries[0]![1] !== 'string' || !RUN_ID.test(entries[0]![1]))
    return failure('event_invalid');
  return entries[0]![1] as string;
}

export function parseFixedReadonlySmokeSecret(value: string): FixedReadonlySmokeSecret {
  let parsed: unknown;
  try { parsed = JSON.parse(value); }
  catch { return failure('secret_invalid'); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return failure('secret_invalid');
  const record = parsed as Record<string, unknown>;
  if (Object.keys(record).length !== SECRET_FIELDS.length || SECRET_FIELDS.some((key) => !(key in record)))
    return failure('secret_schema_invalid');
  if (record.schemaVersion !== 1
    || (record.tlsMode !== 'system-root' && record.tlsMode !== 'vpc-test-only-no-verify')
    || ['databaseUrl', 'redisUrl', 'receiptHmacKey', 'privateCidrs'].some((key) => typeof record[key] !== 'string' || !(record[key] as string).trim())
    || ['databaseCa', 'redisCa'].some((key) => typeof record[key] !== 'string'))
    return failure('secret_schema_invalid');
  return record as FixedReadonlySmokeSecret;
}

function functionEnvironment(runId: string, secret: FixedReadonlySmokeSecret, directory: string): NodeJS.ProcessEnv {
  return {
    CLOUD_TEST_RUN_ID: runId,
    CLOUD_TEST_TARGET_KIND: 'fixed-readonly',
    CLOUD_TEST_TLS_MODE: secret.tlsMode,
    CLOUD_TEST_FIXED_READONLY_ACK: FIXED_ACK,
    CLOUD_TEST_DATABASE_URL: secret.databaseUrl,
    CLOUD_TEST_REDIS_URL: secret.redisUrl,
    ...(secret.databaseCa ? { CLOUD_TEST_DATABASE_SSL_CA_PATH: join(directory, 'rds-ca.pem') } : {}),
    ...(secret.redisCa ? { CLOUD_TEST_REDIS_TLS_CA_PATH: join(directory, 'tair-ca.pem') } : {}),
    CLOUD_TEST_RECEIPT_HMAC_KEY: secret.receiptHmacKey,
    CLOUD_TEST_PRIVATE_CIDRS: secret.privateCidrs,
  };
}

function fixedFailure(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (message.startsWith('cloud_smoke_fc_')) return message;
  return cloudSmokeFailure(error);
}

/**
 * Builds a FC event handler. The event is intentionally unable to select a
 * target or provide configuration: only the function's private configuration
 * envelope can.
 */
export function createCloudSmokeFcHandler(deps: CloudSmokeFcDeps) {
  const run = deps.runSmoke ?? runCloudSmoke;
  return async (event: unknown): Promise<string> => {
    try {
      const runId = parseInvocation(event);
      let secretValue: string;
      try { secretValue = await deps.loadSecret(); }
      catch (error) {
        if (error instanceof Error && error.message.startsWith('cloud_smoke_fc_')) throw error;
        return failure('secret_unavailable');
      }
      const secret = parseFixedReadonlySmokeSecret(secretValue);
      const directory = await mkdtemp(join(tmpdir(), 'meetwise-cloud-smoke-'));
      try {
        await Promise.all([
          ...(secret.databaseCa ? [writeFile(join(directory, 'rds-ca.pem'), secret.databaseCa, { encoding: 'utf8', mode: 0o600 })] : []),
          ...(secret.redisCa ? [writeFile(join(directory, 'tair-ca.pem'), secret.redisCa, { encoding: 'utf8', mode: 0o600 })] : []),
        ]);
        return JSON.stringify(await run(runId, functionEnvironment(runId, secret, directory)));
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    } catch (error) {
      return JSON.stringify({ kind: 'cloud_connectivity_receipt', status: 'failed', code: fixedFailure(error) });
    }
  };
}

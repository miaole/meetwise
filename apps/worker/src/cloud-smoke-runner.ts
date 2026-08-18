import pkg from 'pg';
import { createClient } from 'redis';
import {
  assertCloudSmokeHostsPrivate,
  assertCloudSmokePeer,
  cloudSmokeFailure,
  cloudSmokePinnedUrl,
  cloudSmokeTarget,
  resolveCloudSmokeConfig,
} from './cloud-readiness.ts';

const { Pool } = pkg;

export type CloudSmokeReceipt = {
  kind: 'cloud_connectivity_receipt';
  runId: string;
  targetKind: 'run-scoped' | 'fixed-readonly';
  status: 'passed';
  databaseFingerprint: string;
  redisFingerprint: string;
  databaseTls: true;
  redisTls: true;
  tlsVerification: 'system-root' | 'vpc-test-only-no-verify';
  writes: { database: 0; redis: 0; oss: 0 };
};

/**
 * Runs the only cloud data-plane preflight permitted for a fixed target.
 * The caller supplies an isolated environment instead of inheriting process
 * state, which keeps runtime and migration credentials out of the smoke path.
 */
export async function runCloudSmoke(
  runId: string | undefined,
  env: NodeJS.ProcessEnv = process.env,
): Promise<CloudSmokeReceipt> {
  const config = resolveCloudSmokeConfig(runId, env);
  const target = cloudSmokeTarget(config);
  let database: InstanceType<typeof Pool> | undefined;
  let redis: ReturnType<typeof createClient> | undefined;
  let databaseAsyncError: unknown;
  try {
    const resolved = await assertCloudSmokeHostsPrivate(config);
    const databaseUrl = new URL(config.databaseUrl);
    const redisUrl = new URL(config.redisUrl);
    const databaseHost = databaseUrl.hostname;
    const redisHost = redisUrl.hostname;
    database = new Pool({
      // Do not pass a connection string to pg: its URL parser accepts query
      // parameters that can override the validated socket and TLS fields.
      host: resolved.databaseAddress,
      port: Number(databaseUrl.port || '5432'),
      user: decodeURIComponent(databaseUrl.username),
      password: decodeURIComponent(databaseUrl.password),
      database: target.databaseName,
      ssl: { rejectUnauthorized: config.tlsMode === 'system-root', ...(config.databaseCa ? { ca: config.databaseCa } : {}), servername: databaseHost },
      max: 1,
      connectionTimeoutMillis: 5_000,
      statement_timeout: 3_000,
    });
    database.on('error', (error) => { databaseAsyncError ??= error; });
    redis = createClient({
      url: cloudSmokePinnedUrl(config.redisUrl, resolved.redisAddress),
      database: 0,
      RESP: 2,
      disableClientInfo: true,
      disableOfflineQueue: true,
      socket: {
        tls: true,
        rejectUnauthorized: config.tlsMode === 'system-root',
        ...(config.redisCa ? { ca: config.redisCa } : {}),
        servername: redisHost,
        connectTimeout: 5_000,
        socketTimeout: 5_000,
        reconnectStrategy: false,
      },
    });
    const client = await database.connect();
    let databaseResult;
    try {
      assertCloudSmokePeer((client as any).connection?.stream?.remoteAddress, config, resolved.databaseAddress);
      if (databaseAsyncError) throw databaseAsyncError;
      await client.query('BEGIN READ ONLY');
      databaseResult = await client.query("SELECT current_database() AS database_name, COALESCE((SELECT ssl FROM pg_stat_ssl WHERE pid = pg_backend_pid()), false) AS tls");
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
    if (databaseResult.rows[0]?.database_name !== target.databaseName || databaseResult.rows[0]?.tls !== true)
      throw new Error('cloud_smoke_database_target_or_tls_mismatch');
    let redisAsyncError: unknown;
    redis.on('error', (error) => { redisAsyncError ??= error; });
    await redis.connect();
    if (redisAsyncError) throw redisAsyncError;
    if (await redis.ping() !== 'PONG') throw new Error('cloud_smoke_redis_ping_failed');
    return {
      kind: 'cloud_connectivity_receipt',
      runId: config.runId,
      targetKind: config.targetKind,
      status: 'passed',
      databaseFingerprint: target.databaseFingerprint,
      redisFingerprint: target.redisFingerprint,
      databaseTls: true,
      redisTls: true,
      tlsVerification: config.tlsMode,
      writes: { database: 0, redis: 0, oss: 0 },
    };
  } finally {
    await redis?.close().catch(() => {});
    await database?.end().catch(() => {});
  }
}

export { cloudSmokeFailure };

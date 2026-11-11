import {
  assertPrivacyWorkerExecutorIdentity,
  createPool,
} from '@meetwise/db';
import { isProductionEnvironment } from './rag-redis-cache.ts';

type PrivacyWorkerPool = ReturnType<typeof createPool>;

export type PrivacyWorkerStartupDeps = {
  /** connectionString + observability purpose label (W2/R-22), never other pool overrides. */
  createPool: (options: { connectionString: string; purpose?: string }) => PrivacyWorkerPool;
  assertIdentity: (pool: PrivacyWorkerPool) => Promise<void>;
};

const productionDeps: PrivacyWorkerStartupDeps = {
  createPool,
  assertIdentity: assertPrivacyWorkerExecutorIdentity,
};

/**
 * Open the optional physical-erasure worker connection only after proving it
 * is the dedicated, least-privilege executor.  A supplied but mis-mounted URL
 * fails the whole worker startup rather than retaining a raw-ledger-capable
 * pool.  In production a missing URL also fails startup (fail-closed): the
 * default production compose must mount PRIVACY_WORKER_DATABASE_URL, and a
 * silently disabled eraser would leave authorized deletions unprocessed.
 * Non-production still leaves the emergency-paused eraser disabled so local
 * work can start without the dedicated login.
 */
export async function initializePrivacyWorkerStartup(
  env: NodeJS.ProcessEnv = process.env,
  deps: PrivacyWorkerStartupDeps = productionDeps,
): Promise<PrivacyWorkerPool | undefined> {
  const connectionString = env.PRIVACY_WORKER_DATABASE_URL?.trim();
  if (!connectionString) {
    if (isProductionEnvironment(env)) {
      throw new Error('privacy_worker_database_url_missing');
    }
    return undefined;
  }

  const pool = deps.createPool({ connectionString, purpose: 'privacy-worker' });
  try {
    await deps.assertIdentity(pool);
    return pool;
  } catch (error) {
    await pool.end().catch(() => undefined);
    throw error;
  }
}

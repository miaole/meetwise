import {
  assertPrivacyWorkerExecutorIdentity,
  createPool,
} from '@meetwise/db';

type PrivacyWorkerPool = ReturnType<typeof createPool>;

export type PrivacyWorkerStartupDeps = {
  createPool: (options: { connectionString: string }) => PrivacyWorkerPool;
  assertIdentity: (pool: PrivacyWorkerPool) => Promise<void>;
};

const productionDeps: PrivacyWorkerStartupDeps = {
  createPool,
  assertIdentity: assertPrivacyWorkerExecutorIdentity,
};

/**
 * Open the optional physical-erasure worker connection only after proving it
 * is the dedicated, least-privilege executor.  A missing URL leaves the
 * emergency-paused eraser disabled; a supplied but mis-mounted URL fails the
 * whole worker startup rather than retaining a raw-ledger-capable pool.
 */
export async function initializePrivacyWorkerStartup(
  env: { PRIVACY_WORKER_DATABASE_URL?: string } = process.env,
  deps: PrivacyWorkerStartupDeps = productionDeps,
): Promise<PrivacyWorkerPool | undefined> {
  const connectionString = env.PRIVACY_WORKER_DATABASE_URL?.trim();
  if (!connectionString) return undefined;

  const pool = deps.createPool({ connectionString });
  try {
    await deps.assertIdentity(pool);
    return pool;
  } catch (error) {
    await pool.end().catch(() => undefined);
    throw error;
  }
}

import {
  assertRagControlDefinerOwnership,
  assertRagControlExecutorIdentity,
  createPool,
} from '@meetwise/db';

type RagControlPool = ReturnType<typeof createPool>;

export type RagControlStartupDeps = {
  createPool: (options: { connectionString: string }) => RagControlPool;
  assertIdentity: (pool: RagControlPool) => Promise<void>;
  assertDefinerOwnership: (pool: RagControlPool) => Promise<void>;
};

const productionDeps: RagControlStartupDeps = {
  createPool,
  assertIdentity: assertRagControlExecutorIdentity,
  assertDefinerOwnership: assertRagControlDefinerOwnership,
};

/**
 * Open the optional generic-RAG control connection only after proving that it
 * is the dedicated low-privilege login and that its reviewed database
 * manifest is intact.  The generic RAG rebuild/outbox worker is deliberately
 * not implemented yet; this is a startup guard, never an implicit fallback
 * to the request-path runtime pool.
 */
export async function initializeRagControlStartup(
  env: { RAG_CONTROL_DATABASE_URL?: string } = process.env,
  deps: RagControlStartupDeps = productionDeps,
): Promise<RagControlPool | undefined> {
  const connectionString = env.RAG_CONTROL_DATABASE_URL?.trim();
  if (!connectionString) return undefined;

  const pool = deps.createPool({ connectionString });
  try {
    await deps.assertIdentity(pool);
    await deps.assertDefinerOwnership(pool);
    return pool;
  } catch (error) {
    // A failed startup check must not leave a privileged connection open for a
    // later code path to accidentally reuse.
    await pool.end().catch(() => undefined);
    throw error;
  }
}

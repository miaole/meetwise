import { AsyncLocalStorage } from 'node:async_hooks';
import type { Pool } from 'pg';
import type { DbPool } from '@meetwise/db';

export interface CheckpointAccess {
  owner: string;
  threadId: string;
  fenceEpoch: number;
}

const checkpointAccess = new AsyncLocalStorage<CheckpointAccess>();

function requireAccess(): CheckpointAccess {
  const access = checkpointAccess.getStore();
  if (!access) throw Object.assign(new Error('checkpoint_access_missing'), { code: 'checkpoint_access_missing' });
  return access;
}

/**
 * Runs one graph operation with its durable business owner.  The Postgres
 * saver API does not expose a per-query principal parameter, so this context
 * is intentionally the only bridge from the job's RLS-bound owner to its
 * internal pg pool.
 */
export function withCheckpointAccess<T>(access: CheckpointAccess, fn: () => Promise<T>): Promise<T> {
  const { owner, threadId, fenceEpoch } = access;
  if (!owner || owner.length > 256) throw Object.assign(new Error('checkpoint_principal_invalid'), { code: 'checkpoint_principal_invalid' });
  if (!threadId || threadId.length > 512 || !Number.isSafeInteger(fenceEpoch) || fenceEpoch < 1)
    throw Object.assign(new Error('checkpoint_access_invalid'), { code: 'checkpoint_access_invalid' });
  return checkpointAccess.run({ owner, threadId, fenceEpoch }, fn);
}

/** @deprecated Runtime saver access must bind owner, thread and epoch. */
export function withCheckpointPrincipal<T>(_owner: string, _fn: () => Promise<T>): Promise<T> {
  return Promise.reject(Object.assign(new Error('checkpoint_access_required'), { code: 'checkpoint_access_required' }));
}

/**
 * Isolated-test only: when set, runs instead of RESET ROLE + GUC clear.
 * Used to prove reset-failure destroys the connection (release(true)).
 * Must remain unset outside E2E_ISOLATED proves.
 */
let testCleanupOverride: ((client: { query: (sql: string, params?: unknown[]) => Promise<unknown> }) => Promise<void>) | undefined;

/** @internal */
export function __setCheckpointPrincipalCleanupOverrideForTest(
  override: typeof testCleanupOverride,
): void {
  if (process.env.E2E_ISOLATED !== '1') {
    throw new Error('checkpoint_principal_cleanup_override_requires_isolated');
  }
  testCleanupOverride = override;
}

const GUC_KEYS = ['app.principal_user', 'app.checkpoint_thread_id', 'app.checkpoint_epoch'] as const;

/**
 * Release-path cleanup (PRIMARY fix for GAP-UC052-POOL-ROLE-LEAK).
 *
 * PostgresSaver mixes autocommit `pool.query` (no BEGIN) with explicit-txn
 * `pool.connect` writes. SET LOCAL / set_config(..., true) alone is therefore
 * an automatic FAIL on the read path. Session SET ROLE + set_config(..., false)
 * must stay; hygiene is SET ROLE NONE + clear the three GUCs before the client
 * returns to the pool. If reset throws, destroy the connection so a privileged
 * session never re-enters the pool.
 */
async function cleanupCheckpointPrincipalSession(
  client: { query: (sql: string, params?: unknown[]) => Promise<unknown> },
): Promise<void> {
  if (testCleanupOverride) {
    await testCleanupOverride(client);
    return;
  }
  // createCheckpointer adds `-c role=app_role` at connect. Empirically on PG16:
  //   RESET ROLE     → NO-OP (current_user stays app_role; startup role GUC sticks)
  //   DISCARD ALL    → RESTORES startup `-c role=app_role` (undoes a prior NONE)
  //   SET ROLE NONE  → current_user = session_user, role GUC = none  ← required
  // Ban DISCARD ALL / RESET ROLE as the sole cleanup for this façade.
  await client.query('SET ROLE NONE');
  for (const key of GUC_KEYS) {
    await client.query('SELECT set_config($1, $2, false)', [key, '']);
  }
}

type ReleaseArg = Error | boolean | undefined;

function installReleaseCleanup(client: any): { releaseAsync: () => Promise<void> } {
  const originalRelease = client.release.bind(client) as (err?: ReleaseArg) => void;
  let releasePromise: Promise<void> | null = null;

  const runRelease = (err?: ReleaseArg): Promise<void> => {
    if (releasePromise) return releasePromise;
    releasePromise = (async () => {
      if (err) {
        originalRelease(err);
        return;
      }
      try {
        await cleanupCheckpointPrincipalSession(client);
        originalRelease();
      } catch (resetErr) {
        // Destroy: never return a still-privileged connection to the pool.
        originalRelease(resetErr instanceof Error ? resetErr : true);
      }
    })();
    return releasePromise;
  };

  // pg.PoolClient.release is sync void; callers (PostgresSaver) do not await.
  // Keep the client checked out until async cleanup finishes, then call the
  // original release — that is the pool-return gate.
  client.release = (err?: ReleaseArg) => {
    void runRelease(err);
  };

  return { releaseAsync: () => runRelease() };
}

/**
 * A minimal pg Pool-compatible façade for PostgresSaver. Every acquired
 * connection first selects app_role and installs the owner as a server-side
 * session setting. The database's FORCE RLS policies then apply to all saver
 * reads, writes and deletes, including its hidden subqueries.
 *
 * On release: SET ROLE NONE + clear principal GUCs (see cleanupCheckpointPrincipalSession).
 * Ban relying on SET LOCAL alone — PostgresSaver autocommit pool.query has no txn.
 */
export class PrincipalBoundCheckpointPool {
  constructor(private readonly pool: DbPool) {}

  /** Underlying createPool instance (prove / diagnostics). */
  get underlyingPool(): DbPool {
    return this.pool;
  }

  async connect(): Promise<any> {
    const client = await this.pool.connect();
    try {
      const access = requireAccess();
      // Session-scoped (not LOCAL): required for PostgresSaver autocommit reads.
      await client.query('SET ROLE app_role');
      await client.query("SELECT set_config('app.principal_user', $1, false)", [access.owner]);
      await client.query("SELECT set_config('app.checkpoint_thread_id', $1, false)", [access.threadId]);
      await client.query("SELECT set_config('app.checkpoint_epoch', $1, false)", [String(access.fenceEpoch)]);
      const { releaseAsync } = installReleaseCleanup(client);
      client.releaseAsync = releaseAsync;
      return client;
    } catch (error) {
      // connect() failed before wrap — destroy rather than return a half-bound client.
      client.release(true);
      throw error;
    }
  }

  async query(...args: any[]): Promise<any> {
    const client = await this.connect();
    try {
      return await client.query(...args);
    } finally {
      await (client as { releaseAsync?: () => Promise<void> }).releaseAsync?.()
        ?? Promise.resolve(client.release());
    }
  }

  async end(): Promise<void> { await this.pool.end(); }

  /** PostgresSaver is typed against pg.Pool; its runtime surface is the three methods above. */
  asPool(): Pool { return this as unknown as Pool; }
}

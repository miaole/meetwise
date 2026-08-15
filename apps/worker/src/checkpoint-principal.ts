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
 * A minimal pg Pool-compatible façade for PostgresSaver. Every acquired
 * connection first selects app_role and installs the owner as a server-side
 * session setting. The database's FORCE RLS policies then apply to all saver
 * reads, writes and deletes, including its hidden subqueries.
 */
export class PrincipalBoundCheckpointPool {
  constructor(private readonly pool: DbPool) {}

  async connect(): Promise<any> {
    const client = await this.pool.connect();
    try {
      const access = requireAccess();
      await client.query('SET ROLE app_role');
      await client.query("SELECT set_config('app.principal_user', $1, false)", [access.owner]);
      await client.query("SELECT set_config('app.checkpoint_thread_id', $1, false)", [access.threadId]);
      await client.query("SELECT set_config('app.checkpoint_epoch', $1, false)", [String(access.fenceEpoch)]);
      return client;
    } catch (error) {
      client.release();
      throw error;
    }
  }

  async query(...args: any[]): Promise<any> {
    const client = await this.connect();
    try { return await client.query(...args); }
    finally { client.release(); }
  }

  async end(): Promise<void> { await this.pool.end(); }

  /** PostgresSaver is typed against pg.Pool; its runtime surface is the three methods above. */
  asPool(): Pool { return this as unknown as Pool; }
}

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
  await client.query(
    `SELECT set_config('${GUC_KEYS[0]}', $1, false),
            set_config('${GUC_KEYS[1]}', $2, false),
            set_config('${GUC_KEYS[2]}', $3, false)`,
    ['', '', ''],
  );
}

type ReleaseArg = Error | boolean | undefined;

const DOUBLE_RELEASE_RE = /already been released to the pool/i;

/**
 * Serialize queries on one PoolClient.  pg@8 allows overlapping client.query()
 * (deprecation warning) but the second query corrupts the session; cleanup's
 * SET ROLE NONE then races the in-flight saver query, and the release catch
 * path can call the raw pg-pool release twice (unhandledRejection → exit).
 */
type ClientQueryFn = (...args: unknown[]) => unknown;
/** pg-pool reuses the same Client object and only resets `release` on checkout.
 *  Mark the client so query serialization is installed once; re-wrapping would
 *  nest promise tails and grow query latency with checkout count squared. */
const QUERY_SERIALIZED = Symbol.for('meetwise.checkpointQuerySerialized');
type QueryMarked = { query: ClientQueryFn; [QUERY_SERIALIZED]?: true };

function serializeClientQueries(client: { query: ClientQueryFn }): void {
  const marked = client as QueryMarked;
  if (marked[QUERY_SERIALIZED]) return; // SERIALIZE_ONCE_GUARD
  marked[QUERY_SERIALIZED] = true;
  const originalQuery: ClientQueryFn = client.query.bind(client);
  let tail: Promise<void> = Promise.resolve();
  client.query = (...args: unknown[]) => {
    const started = tail.then(() => originalQuery(...args), () => originalQuery(...args));
    tail = started.then(() => undefined, () => undefined);
    return started;
  };
}

const SQLSTATE_RE = /^[0-9A-Z]{5}$/;
type ReleaseWarnEvent =
  | 'checkpoint_pg_double_release'
  | 'checkpoint_pg_release_unhandled'
  | 'checkpoint_pg_release_holder_mismatch'
  | 'checkpoint_pg_stale_handle';

function warnReleasePath(event: ReleaseWarnEvent, error?: unknown): void {
  let code: string = event;
  if (error && typeof error === 'object' && 'code' in error) {
    const raw = (error as { code: unknown }).code;
    if (typeof raw === 'string' && SQLSTATE_RE.test(raw)) code = raw;
  }
  console.warn(JSON.stringify({ event, code }));
}

function isDoubleRelease(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return DOUBLE_RELEASE_RE.test(message);
}

function staleHandleError(): Error {
  warnReleasePath('checkpoint_pg_stale_handle');
  return Object.assign(new Error('checkpoint_pg_stale_handle'), { code: 'checkpoint_pg_stale_handle' });
}

/**
 * Each checkout returns a dedicated handle (a proxy), not the shared pg Client.
 * query / release / releaseAsync live only on that handle. After the handle is
 * returned to the pool, a later release or query on it warns and throws; it
 * cannot look up the live client.release property and so cannot release the
 * next holder. The raw once-fn is closed over at checkout, immediately after
 * acquire and before any await.
 *
 * A leftover release on a previous shared-wrapper path used to return early
 * when the holder token did not match, leaving the client checked out forever
 * (pool counts stuck, checkout timeout). That path is gone: stale handles do
 * not touch the live checkout, and the live handle still returns or destroys
 * the client so idle/total/waiting can recover.
 */
type QueryResult = { rows: unknown[]; [key: string]: unknown };
type QueryFn = (...args: unknown[]) => Promise<QueryResult>;

type RawPoolClient = {
  query: QueryFn;
  release: (err?: ReleaseArg) => void;
};

export type CheckpointClientHandle = {
  query: QueryFn;
  release: (err?: ReleaseArg) => void;
  releaseAsync: (err?: ReleaseArg) => Promise<void>;
};

const HANDLE_KEYS = ['query', 'release', 'releaseAsync'] as const;
type HandleKey = (typeof HANDLE_KEYS)[number];

function isHandleKey(prop: string | symbol): prop is HandleKey {
  return typeof prop === 'string' && (HANDLE_KEYS as readonly string[]).includes(prop);
}

/**
 * Each checkout returns a dedicated whitelist handle (plain object, not a
 * Proxy of the shared pg Client). PostgresSaver 1.0.4 and in-repo callers only
 * use query / release / releaseAsync (plus pool.connect, pool.query, pool.end
 * on the facade). The handle does not inherit Client.prototype, does not
 * expose on / once / off / end / connection, and does not hold a reachable
 * reference to the raw Client (the raw client lives only in this closure).
 *
 * After the handle is returned to the pool, any member access throws
 * checkpoint_pg_stale_handle. A leftover release or query therefore cannot
 * touch the next holder.
 */
function installReleaseCleanup(client: RawPoolClient): CheckpointClientHandle {
  serializeClientQueries(client);

  const originalRelease = client.release.bind(client) as (err?: ReleaseArg) => void;
  let releasePromise: Promise<void> | null = null;
  let originalReleased = false; // RELEASE_ONCE_GUARD
  let handleOpen = true;

  const releaseOnce = (err?: ReleaseArg): void => {
    if (originalReleased) return; // RELEASE_ONCE_GUARD
    originalReleased = true;
    try {
      originalRelease(err);
    } catch (error) {
      if (isDoubleRelease(error)) {
        // Fail-closed: this checkout once-fn was already consumed.
        warnReleasePath('checkpoint_pg_double_release', error);
        throw error;
      }
      throw error;
    }
  };

  const runRelease = (err?: ReleaseArg): Promise<void> => {
    if (releasePromise) return releasePromise;
    releasePromise = (async () => {
      if (err) {
        releaseOnce(err);
        return;
      }
      try {
        await cleanupCheckpointPrincipalSession(client); // CLEANUP_BEFORE_RELEASE
        releaseOnce(); // CLEANUP_BEFORE_RELEASE
      } catch (resetErr) {
        if (isDoubleRelease(resetErr)) throw resetErr;
        // Destroy: never return a still-privileged connection to the pool.
        releaseOnce(resetErr instanceof Error ? resetErr : true);
      }
    })();
    return releasePromise;
  };

  const releaseAsync = (err?: ReleaseArg): Promise<void> => {
    if (!handleOpen) throw staleHandleError();
    handleOpen = false;
    return runRelease(err);
  };

  // pg.PoolClient.release is sync void; callers (PostgresSaver) do not await.
  // Keep the client checked out until async cleanup finishes, then call the
  // closed-over original release — that is the pool-return gate.
  const release = (err?: ReleaseArg): void => {
    if (!handleOpen) throw staleHandleError();
    handleOpen = false;
    // Swallow rejection: fire-and-forget must never become unhandledRejection.
    // Fence / privacy errors still propagate through query() callers.
    void runRelease(err).catch((error) => {
      warnReleasePath('checkpoint_pg_release_unhandled', error);
    });
  };

  const query: QueryFn = (...args: unknown[]) => {
    if (!handleOpen) throw staleHandleError();
    // REJECT_SUBMITTABLE: Query.submit(connection) would expose the raw
    // Connection after release (line-level DoS / injection residual).
    if (args.some((arg) => arg !== null && typeof arg === 'object' && typeof (arg as { submit?: unknown }).submit === 'function')) {
      throw Object.assign(new Error('checkpoint_query_submittable_rejected'), { code: 'checkpoint_query_submittable_rejected' });
    }
    return client.query(...args);
  };

  // WHITELIST_HANDLE: null-prototype plain object; do not wrap the shared Client.
  // Define own keys as non-configurable so getOwnPropertyDescriptor matches the
  // target (configurable:false on an assignment-created property is an invariant
  // violation and makes Object.keys(handle) throw TypeError).
  const methods = Object.create(null) as CheckpointClientHandle;
  const defineHandle = <K extends HandleKey>(key: K, value: CheckpointClientHandle[K]): void => {
    Object.defineProperty(methods, key, { value, writable: false, enumerable: true, configurable: false });
  };
  defineHandle('query', query);
  defineHandle('release', release);
  defineHandle('releaseAsync', releaseAsync);
  Object.preventExtensions(methods);

  const assertOpen = (): void => {
    if (!handleOpen) throw staleHandleError();
  };

  // An async function that returns the handle will look up .then to see if the
  // value is thenable. That lookup must not throw and must not be thenable.
  const isThenableProbe = (prop: string | symbol): boolean =>
    prop === 'then' || prop === 'catch' || prop === 'finally';

  const guardedGet = (prop: string | symbol): unknown => {
    if (isThenableProbe(prop)) return undefined;
    assertOpen();
    if (isHandleKey(prop)) return methods[prop];
    throw staleHandleError();
  };

  return new Proxy(methods, {
    get(_target, prop) {
      return guardedGet(prop);
    },
    getOwnPropertyDescriptor(_target, prop) {
      if (isThenableProbe(prop)) return undefined;
      assertOpen();
      if (!isHandleKey(prop)) return undefined;
      return Reflect.getOwnPropertyDescriptor(methods, prop);
    },
    ownKeys() {
      assertOpen();
      return [...HANDLE_KEYS];
    },
    has(_target, prop) {
      if (isThenableProbe(prop)) return false;
      assertOpen();
      return isHandleKey(prop);
    },
    set() {
      return false;
    },
    defineProperty() {
      return false;
    },
    deleteProperty() {
      return false;
    },
    getPrototypeOf() {
      assertOpen();
      return null;
    },
    setPrototypeOf() {
      return false;
    },
  });
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

  async connect(): Promise<CheckpointClientHandle> {
    const acquired = await this.pool.connect();
    // CHECKOUT_HANDLE: return a per-checkout whitelist handle. Do not assign
    // release or query wrappers onto the shared pg Client, and do not Proxy
    // that Client, so leftover or reflected access cannot reach the next holder.
    const client = installReleaseCleanup(acquired);
    try {
      const access = requireAccess();
      // Session-scoped (not LOCAL): required for PostgresSaver autocommit reads.
      await client.query('SET ROLE app_role');
      await client.query(
        `SELECT set_config('app.principal_user', $1, false),
                set_config('app.checkpoint_thread_id', $2, false),
                set_config('app.checkpoint_epoch', $3, false)`,
        [access.owner, access.threadId, String(access.fenceEpoch)],
      );
      return client;
    } catch (error) {
      // connect() failed after wrap — destroy rather than return a half-bound client.
      client.release(true);
      throw error;
    }
  }

  async query(...args: any[]): Promise<any> {
    const client = await this.connect();
    try {
      return await client.query(...args);
    } finally {
      // RELEASE_ASYNC_ONLY: await binds tighter than ??, so an unparenthesized
      // await releaseAsync?.() ?? Promise.resolve(client.release()) would
      // call client.release() again after a successful cleanup+return, handing
      // the next holder checkout back to the pool (cross-tenant share).
      const releasable = client as { releaseAsync?: () => Promise<void>; release: (err?: ReleaseArg) => void };
      if (releasable.releaseAsync) {
        await releasable.releaseAsync(); // RELEASE_ASYNC_ONLY
      } else {
        releasable.release();
      }
    }
  }

  async end(): Promise<void> { await this.pool.end(); }

  /** PostgresSaver is typed against pg.Pool; its runtime surface is the three methods above. */
  asPool(): Pool { return this as unknown as Pool; }
}

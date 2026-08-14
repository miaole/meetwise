/**
 * Dedicated PostgreSQL LISTEN lifecycle for user-visible job queues.
 * Notifications are deliberately lossy, broadcast hints: they contain only a
 * fixed constant and request a coalesced drain.  Queue tables, RLS and leases
 * remain the source of truth; the consumer's periodic reconciliation covers
 * every disconnect and missed-notification window.
 */
import type { PoolClient } from 'pg';
import { WORKER_JOB_WAKEUP_CHANNEL, WORKER_JOB_WAKEUP_PAYLOAD, type DbPool } from '@meetwise/db';

export interface WorkerJobWakeupListener {
  stop(): Promise<void>;
  /** Connected or still within bounded recovery attempts. */
  ready(): boolean;
  snapshot(): { connected: boolean; consecutiveFailures: number };
}

export interface WorkerJobWakeupOptions {
  reconnectBaseMs?: number;
  reconnectMaxMs?: number;
  random?: () => number;
  /** Test seam; production uses the dedicated pool's exclusive client. */
  connect?: () => Promise<PoolClient>;
  /** The dedicated pool is owned by this listener only in production. */
  closePoolOnStop?: boolean;
}

const DEFAULT_BASE_MS = 100;
const DEFAULT_MAX_MS = 5_000;

/**
 * Opens an idle, dedicated session. `onWake` must only edge-trigger loops: it
 * must not query, claim or process a job in the notification callback.
 */
export function startWorkerJobWakeupListener(
  pool: DbPool,
  onWake: () => void,
  options: WorkerJobWakeupOptions = {},
): WorkerJobWakeupListener {
  const reconnectBaseMs = options.reconnectBaseMs ?? DEFAULT_BASE_MS;
  const reconnectMaxMs = options.reconnectMaxMs ?? DEFAULT_MAX_MS;
  const random = options.random ?? Math.random;
  const connect = options.connect ?? (() => pool.connect());
  let stopped = false;
  let connected = false;
  let consecutiveFailures = 0;
  let active: PoolClient | undefined;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let stopPromise: Promise<void> | undefined;
  const lifecycleHandlers = new WeakMap<PoolClient, { onError: (error: Error) => void; onEnd: () => void }>();

  const notification = (message: { channel: string; payload?: string }) => {
    if (!stopped && message.channel === WORKER_JOB_WAKEUP_CHANNEL && message.payload === WORKER_JOB_WAKEUP_PAYLOAD)
      onWake();
  };

  const delayFor = (failures: number) => {
    const cap = Math.min(reconnectMaxMs, reconnectBaseMs * (2 ** Math.min(Math.max(failures - 1, 0), 8)));
    return Math.min(reconnectMaxMs, Math.floor(cap * (0.75 + Math.max(0, Math.min(1, random())) * 0.25)));
  };

  const detachAndRelease = (client: PoolClient, error?: Error) => {
    const handlers = lifecycleHandlers.get(client);
    client.off('notification', notification as any);
    if (handlers) {
      client.off('error', handlers.onError as any);
      client.off('end', handlers.onEnd as any);
      lifecycleHandlers.delete(client);
    }
    try { client.release(error); } catch { /* already released after a connection failure */ }
  };

  const scheduleReconnect = () => {
    if (stopped || retryTimer) return;
    const delay = delayFor(consecutiveFailures);
    retryTimer = setTimeout(() => {
      retryTimer = undefined;
      void establish();
    }, delay);
    (retryTimer as any).unref?.();
  };

  const disconnect = (client: PoolClient, error?: Error) => {
    if (active !== client) return;
    active = undefined;
    connected = false;
    consecutiveFailures++;
    detachAndRelease(client, error);
    scheduleReconnect();
  };

  const establish = async () => {
    if (stopped || active) return;
    let client: PoolClient | undefined;
    try {
      client = await connect();
      if (stopped) { client.release(); return; }
      active = client;
      client.on('notification', notification as any);
      const handlers = {
        onError: (error: Error) => disconnect(client!, error),
        onEnd: () => disconnect(client!),
      };
      lifecycleHandlers.set(client, handlers);
      client.on('error', handlers.onError as any);
      client.on('end', handlers.onEnd as any);
      // The channel name is a source-defined identifier, never user input.
      await client.query(`LISTEN ${WORKER_JOB_WAKEUP_CHANNEL}`);
      if (stopped || active !== client) return;
      connected = true;
      consecutiveFailures = 0;
      // LISTEN first, then reconcile: a commit between an earlier scan and
      // LISTEN cannot be missed, and any old missed work is drained now.
      onWake();
    } catch (error) {
      if (client && active === client) disconnect(client, error instanceof Error ? error : new Error('worker_wakeup_listener_connect_failed'));
      else {
        consecutiveFailures++;
        scheduleReconnect();
      }
    }
  };

  void establish();
  return {
    ready: () => !stopped && (connected || consecutiveFailures < 3),
    snapshot: () => ({ connected, consecutiveFailures }),
    async stop() {
      if (!stopPromise) {
        stopped = true;
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = undefined;
        const client = active;
        active = undefined;
        connected = false;
        stopPromise = (async () => {
          if (client) {
            const handlers = lifecycleHandlers.get(client);
            client.off('notification', notification as any);
            if (handlers) {
              client.off('error', handlers.onError as any);
              client.off('end', handlers.onEnd as any);
              lifecycleHandlers.delete(client);
            }
            // Releasing then ending this dedicated pool closes the session and
            // implicitly UNLISTENs it. Do not issue a shutdown query here: a
            // half-dead socket could otherwise delay SIGTERM until statement
            // timeout while all handlers are already detached.
            try { client.release(); } catch { /* already gone */ }
          }
          if (options.closePoolOnStop) await pool.end();
        })();
      }
      await stopPromise;
    },
  };
}

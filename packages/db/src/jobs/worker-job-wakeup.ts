/**
 * PostgreSQL wakeup is a lossy, commit-delivered hint only.  It intentionally
 * carries no owner, job, request, or user data; queue tables and claim leases
 * remain the sole durable source of work.
 *
 * Redis Streams constants below are for the additive M3 wakeup prototype only.
 * Production still uses LISTEN/NOTIFY until an independent cutover is approved.
 * Feature flag MEETWISE_WAKEUP_REDIS_STREAMS defaults off (0).
 *
 * R2 P-API: `notifyWorkerJobWakeup` is the apps/api combination-root helper after
 * createJob → route_pending. It does NOT classify; sole classify remains Worker.
 */
import type { PoolClient as Client } from 'pg';

export const WORKER_JOB_WAKEUP_CHANNEL = 'meetwise_worker_wakeup_v1';
export const WORKER_JOB_WAKEUP_PAYLOAD = 'wake';

/** Redis Streams key for the additive wakeup prototype (M3 Q1). Not production cutover. */
export const WORKER_JOB_WAKEUP_REDIS_STREAM = 'meetwise:worker:wakeup:v1';
/** Consumer group for Redis Streams wakeup readers. */
export const WORKER_JOB_WAKEUP_REDIS_GROUP = 'meetwise_worker_wakeup';
/** Stream field that carries the fixed wake token (same value as PG NOTIFY payload). */
export const WORKER_JOB_WAKEUP_REDIS_FIELD = 'payload';

/**
 * Emit the fixed wake-only NOTIFY on the shared worker channel.
 * Same payload as migration triggers (0084 queued jobs · 0133 route_pending).
 * Lossy hint only — not a queue, not classifyJobRoute, not HA.
 */
export async function notifyWorkerJobWakeup(c: Client): Promise<void> {
  await c.query('SELECT pg_notify($1::text, $2::text)', [
    WORKER_JOB_WAKEUP_CHANNEL,
    WORKER_JOB_WAKEUP_PAYLOAD,
  ]);
}

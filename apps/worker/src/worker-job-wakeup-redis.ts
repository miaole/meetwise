/**
 * Additive Redis Streams wakeup prototype (M3 Q1 preferred path).
 *
 * HARD: Does not replace or disable the production PostgreSQL LISTEN /
 * pg_notify path in job-wakeup-listener.ts. Gate with
 * MEETWISE_WAKEUP_REDIS_STREAMS (default 0 / off). When off, callers must not
 * connect or publish — zero behavior change to production LISTEN.
 *
 * Payload remains the fixed 'wake' token only — no owner / job / user / PII.
 * Queue tables + claim leases remain the durable source of work; periodic
 * reconcile still covers missed hints.
 */
import { createClient, type RedisClientType } from 'redis';
import {
  WORKER_JOB_WAKEUP_PAYLOAD,
  WORKER_JOB_WAKEUP_REDIS_FIELD,
  WORKER_JOB_WAKEUP_REDIS_GROUP,
  WORKER_JOB_WAKEUP_REDIS_STREAM,
} from '@meetwise/db';

export const MEETWISE_WAKEUP_REDIS_STREAMS_ENV = 'MEETWISE_WAKEUP_REDIS_STREAMS';
export const MEETWISE_WAKEUP_REDIS_URL_ENV = 'MEETWISE_WAKEUP_REDIS_URL';

export type WorkerJobWakeupRedisClient = Pick<
  RedisClientType,
  'xAdd' | 'xReadGroup' | 'xGroupCreate' | 'xAck' | 'connect' | 'close' | 'isOpen' | 'isReady'
>;

export interface WorkerJobWakeupRedisPublishOptions {
  stream?: string;
  /** Approximate MAXLEN trim so a hint stream cannot grow unbounded. */
  maxlenApprox?: number;
}

export interface WorkerJobWakeupRedisReadOptions {
  stream?: string;
  group?: string;
  consumer: string;
  count?: number;
  blockMs?: number;
}

export interface WorkerJobWakeupRedisListener {
  stop(): Promise<void>;
  ready(): boolean;
  snapshot(): { connected: boolean; enabled: boolean };
}

/** Default off. Only '1' / 'true' / 'on' (case-insensitive) enable the Redis path. */
export function isRedisStreamsWakeupEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const raw = env[MEETWISE_WAKEUP_REDIS_STREAMS_ENV]?.trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'on';
}

export function resolveWakeupRedisUrl(env: NodeJS.ProcessEnv = process.env): string | undefined {
  const url = env[MEETWISE_WAKEUP_REDIS_URL_ENV]?.trim();
  return url || undefined;
}

export async function createWakeupRedisClient(url: string): Promise<RedisClientType> {
  const client = createClient({ url }) as RedisClientType;
  client.on('error', () => {
    // Never log Redis errors: libraries may embed credentialed URLs.
  });
  await client.connect();
  return client;
}

/** XADD a single wake token. Callers must already have checked the feature flag. */
export async function publishWorkerJobWakeup(
  client: WorkerJobWakeupRedisClient,
  options: WorkerJobWakeupRedisPublishOptions = {},
): Promise<string> {
  const stream = options.stream ?? WORKER_JOB_WAKEUP_REDIS_STREAM;
  const maxlenApprox = options.maxlenApprox ?? 1_000;
  const id = await client.xAdd(
    stream,
    '*',
    { [WORKER_JOB_WAKEUP_REDIS_FIELD]: WORKER_JOB_WAKEUP_PAYLOAD },
    { TRIM: { strategy: 'MAXLEN', strategyModifier: '~', threshold: maxlenApprox } },
  );
  return String(id);
}

/** Ensure the consumer group exists (MKSTREAM). Idempotent on BUSYGROUP. */
export async function ensureWorkerJobWakeupGroup(
  client: WorkerJobWakeupRedisClient,
  stream: string = WORKER_JOB_WAKEUP_REDIS_STREAM,
  group: string = WORKER_JOB_WAKEUP_REDIS_GROUP,
): Promise<void> {
  try {
    await client.xGroupCreate(stream, group, '0', { MKSTREAM: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/BUSYGROUP/i.test(message)) throw error;
  }
}

function isWakeMessage(message: Record<string, string> | undefined): boolean {
  return message?.[WORKER_JOB_WAKEUP_REDIS_FIELD] === WORKER_JOB_WAKEUP_PAYLOAD;
}

/**
 * One XREADGROUP cycle. Returns how many wake tokens were observed (and ACKed).
 * Ignores non-wake payloads. Callers must already have checked the feature flag.
 */
export async function consumeWorkerJobWakeupOnce(
  client: WorkerJobWakeupRedisClient,
  options: WorkerJobWakeupRedisReadOptions,
): Promise<number> {
  const stream = options.stream ?? WORKER_JOB_WAKEUP_REDIS_STREAM;
  const group = options.group ?? WORKER_JOB_WAKEUP_REDIS_GROUP;
  const reply = await client.xReadGroup(
    group,
    options.consumer,
    { key: stream, id: '>' },
    {
      COUNT: options.count ?? 16,
      BLOCK: options.blockMs ?? 1_000,
    },
  );
  if (!reply) return 0;
  let wakes = 0;
  for (const entry of reply) {
    for (const item of entry.messages) {
      if (!isWakeMessage(item.message as Record<string, string>)) {
        await client.xAck(stream, group, item.id);
        continue;
      }
      wakes++;
      await client.xAck(stream, group, item.id);
    }
  }
  return wakes;
}

/**
 * Background XREADGROUP loop. Additive only — does not touch the PG listener.
 * When `enabled` is false the listener is a no-op (ready=false, stop resolves).
 */
export function startWorkerJobWakeupRedisListener(
  client: WorkerJobWakeupRedisClient | null,
  onWake: () => void,
  options: {
    enabled: boolean;
    consumer: string;
    stream?: string;
    group?: string;
    blockMs?: number;
  },
): WorkerJobWakeupRedisListener {
  if (!options.enabled || !client) {
    return {
      ready: () => false,
      snapshot: () => ({ connected: false, enabled: false }),
      async stop() { /* no-op when flag off */ },
    };
  }

  const redis = client;
  let stopped = false;
  let connected = true;
  let loop: Promise<void> | undefined;
  const stream = options.stream ?? WORKER_JOB_WAKEUP_REDIS_STREAM;
  const group = options.group ?? WORKER_JOB_WAKEUP_REDIS_GROUP;

  loop = (async () => {
    try {
      await ensureWorkerJobWakeupGroup(redis, stream, group);
    } catch {
      connected = false;
      return;
    }
    while (!stopped) {
      try {
        const n = await consumeWorkerJobWakeupOnce(redis, {
          stream,
          group,
          consumer: options.consumer,
          blockMs: options.blockMs ?? 2_000,
          count: 32,
        });
        if (n > 0 && !stopped) onWake();
        connected = true;
      } catch {
        connected = false;
        if (stopped) break;
        await new Promise((r) => setTimeout(r, 250));
      }
    }
  })();

  return {
    ready: () => !stopped && connected,
    snapshot: () => ({ connected, enabled: true }),
    async stop() {
      stopped = true;
      connected = false;
      await loop?.catch(() => undefined);
    },
  };
}

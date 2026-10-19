/**
 * 已投递 commerce_outbox 行的保留期清扫。
 *
 * 一拍最多 40 批，每批走 SECURITY DEFINER `commerce_outbox_relayed_retention_purge`。
 * 只删除 status 为 relayed 且 created_at 早于保留期的行。pending 行不删。
 * app_role 对表没有 DELETE。
 *
 * `COMMERCE_OUTBOX_RETENTION_ENABLED` 缺省 false。天数缺省 30（7..365）。
 * 间隔缺省 3_600_000（60_000..7 天）。批大小缺省 500（1..10000）。
 * 非法环境变量在解析时抛出，不回退到缺省值。
 */
import { purgeExpiredRelayedOutbox, type DbPool } from '@meetwise/db';
import { runDrainLoop } from './drain-loop.ts';

export interface CommerceOutboxRetentionConfig {
  enabled: boolean;
  keepDays: number;
  intervalMs: number;
  batchSize: number;
}

const DEFAULT_KEEP_DAYS = 30;
const MIN_KEEP_DAYS = 7;
const MAX_KEEP_DAYS = 365;
const DEFAULT_RETENTION_INTERVAL_MS = 3_600_000;
const MIN_RETENTION_INTERVAL_MS = 60_000;
const MAX_RETENTION_INTERVAL_MS = 604_800_000;
const DEFAULT_BATCH_SIZE = 500;
const MIN_BATCH_SIZE = 1;
const MAX_BATCH_SIZE = 10_000;
const MAX_BATCHES_PER_TICK = 40;

function boundedInteger(raw: string | undefined, fallback: number, min: number, max: number, code: string): number {
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new Error(code);
  return value;
}

function boundedBoolean(raw: string | undefined, fallback: boolean, code: string): boolean {
  if (raw === undefined || raw === '') return fallback;
  const normalized = raw.trim().toLowerCase();
  if (normalized === '1' || normalized === 'true' || normalized === 'on') return true;
  if (normalized === '0' || normalized === 'false' || normalized === 'off') return false;
  throw new Error(code);
}

/** Invalid retention settings are a startup error, not a silent policy change. */
export function resolveCommerceOutboxRetentionConfig(env: NodeJS.ProcessEnv = process.env): CommerceOutboxRetentionConfig {
  return {
    enabled: boundedBoolean(env.COMMERCE_OUTBOX_RETENTION_ENABLED, false, 'commerce_outbox_retention_enabled_invalid'),
    keepDays: boundedInteger(
      env.COMMERCE_OUTBOX_RETENTION_DAYS, DEFAULT_KEEP_DAYS, MIN_KEEP_DAYS, MAX_KEEP_DAYS,
      'commerce_outbox_retention_days_invalid',
    ),
    intervalMs: boundedInteger(
      env.COMMERCE_OUTBOX_RETENTION_INTERVAL_MS, DEFAULT_RETENTION_INTERVAL_MS,
      MIN_RETENTION_INTERVAL_MS, MAX_RETENTION_INTERVAL_MS, 'commerce_outbox_retention_interval_invalid',
    ),
    batchSize: boundedInteger(
      env.COMMERCE_OUTBOX_RETENTION_BATCH, DEFAULT_BATCH_SIZE, MIN_BATCH_SIZE, MAX_BATCH_SIZE,
      'commerce_outbox_retention_batch_invalid',
    ),
  };
}

/** One tick. Never throws; a failed purge is retried on the next tick. */
export async function commerceOutboxRetentionTick(pool: DbPool, config: CommerceOutboxRetentionConfig): Promise<number> {
  try {
    const client = await pool.connect();
    try {
      let total = 0;
      for (let batch = 0; batch < MAX_BATCHES_PER_TICK; batch += 1) {
        const purged = await purgeExpiredRelayedOutbox(client, config.keepDays, config.batchSize);
        total += purged;
        if (purged < config.batchSize) break;
      }
      return total;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error('commerce outbox retention purge failed', e);
    return 0;
  }
}

/** Resident retention loop. Drains the in-flight tick on stop. */
export function runCommerceOutboxRetention(pool: DbPool, config: CommerceOutboxRetentionConfig) {
  return runDrainLoop(async () => { await commerceOutboxRetentionTick(pool, config); }, config.intervalMs);
}

/**
 * interview_event 保留期清扫（progress-write 件③ TTL 留槽承接·event-ttl 刀件③）。
 *
 * 一拍最多 40 批，每批走 SECURITY DEFINER `interview_event_retention_purge`（0219）。
 * 只删除 kind 为 4 值 ephemeral 进度族（progress/generation_started/model_first_token/
 * generation_progress）且 created_at 早于保留期的行。business 终态 kind 永久划出清扫域。
 * app_role 对 interview_event 没有 DELETE（0096:255 纪律零破坏）。
 *
 * `INTERVIEW_EVENT_RETENTION_ENABLED` 缺省 false（不起循环——清除是生产数据删除·启用=显式后继
 * 运维决策·沿 usage-calibration/commerce-outbox 两保留期先例同纪律）。天数缺省 30
 * （保留期缺省系协调方 P2-2 裁决落值·沿 commerce-outbox DEFAULT_KEEP_DAYS=30 先例·界 30..3650
 * 与 SQL 侧同域）。间隔缺省 86_400_000（按天低频·60_000..7 天）。批大小缺省 500（1..10000）。
 * 非法环境变量在解析时抛出，不回退到缺省值。
 */
import { purgeExpiredInterviewEvents, type DbPool } from '@meetwise/db';
import { runDrainLoop } from './drain-loop.ts';

export interface InterviewEventRetentionConfig {
  enabled: boolean;
  keepDays: number;
  intervalMs: number;
  batchSize: number;
}

const DEFAULT_KEEP_DAYS = 30;
const MIN_KEEP_DAYS = 30;                 // 收窄下界防误删近窗（SQL 侧 0219 界 30..3650 同域）
const MAX_KEEP_DAYS = 3650;
const DEFAULT_RETENTION_INTERVAL_MS = 86_400_000;   // 1d：低频清除
const MIN_RETENTION_INTERVAL_MS = 60_000;
const MAX_RETENTION_INTERVAL_MS = 604_800_000;      // 7d sane 上界
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
export function resolveInterviewEventRetentionConfig(env: NodeJS.ProcessEnv = process.env): InterviewEventRetentionConfig {
  return {
    enabled: boundedBoolean(env.INTERVIEW_EVENT_RETENTION_ENABLED, false, 'interview_event_retention_enabled_invalid'),
    keepDays: boundedInteger(
      env.INTERVIEW_EVENT_RETENTION_DAYS, DEFAULT_KEEP_DAYS, MIN_KEEP_DAYS, MAX_KEEP_DAYS,
      'interview_event_retention_days_invalid',
    ),
    intervalMs: boundedInteger(
      env.INTERVIEW_EVENT_RETENTION_INTERVAL_MS, DEFAULT_RETENTION_INTERVAL_MS,
      MIN_RETENTION_INTERVAL_MS, MAX_RETENTION_INTERVAL_MS, 'interview_event_retention_interval_invalid',
    ),
    batchSize: boundedInteger(
      env.INTERVIEW_EVENT_RETENTION_BATCH, DEFAULT_BATCH_SIZE, MIN_BATCH_SIZE, MAX_BATCH_SIZE,
      'interview_event_retention_batch_invalid',
    ),
  };
}

/** One tick. Never throws; a failed purge is retried on the next tick. */
export async function interviewEventRetentionTick(pool: DbPool, config: InterviewEventRetentionConfig): Promise<number> {
  try {
    const client = await pool.connect();
    try {
      let total = 0;
      for (let batch = 0; batch < MAX_BATCHES_PER_TICK; batch += 1) {
        const purged = await purgeExpiredInterviewEvents(client, config.keepDays, config.batchSize);
        total += purged;
        if (purged < config.batchSize) break;
      }
      return total;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error('interview event retention purge failed', e);
    return 0;
  }
}

/** Resident retention loop. Drains the in-flight tick on stop. */
export function runInterviewEventRetention(pool: DbPool, config: InterviewEventRetentionConfig) {
  return runDrainLoop(async () => { await interviewEventRetentionTick(pool, config); }, config.intervalMs);
}

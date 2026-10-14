/**
 * usage 校准观测 90 天保留期（AG-COST2 裁决项①(a) 本刀含·EXPERT-REVIEWS §七 :67「+90 天保留期」）。
 *
 * 一拍 = SECURITY DEFINER `ai_usage_calibration_observation_retention_purge(keep_days)` 清除
 * created_at 早于保留期的观测行（只触 ai_usage_calibration_observation·绝不触因子表/账本/其他表）。
 * app_role 对观测表保持无 DELETE（0119 :431 SELECT,INSERT GRANT 纪律零破坏）——清除只经 0177 件⑥
 * SECURITY DEFINER 函数到达。
 *
 * 旋钮（沿 AG-COST1 止血旋钮同族纪律）：`USAGE_CALIBRATION_RETENTION_ENABLED` 缺省 `false`
 * （不起循环——本刀=关停态下代码就绪·清除是生产数据删除·启用=显式后继运维决策）；
 * `USAGE_CALIBRATION_RETENTION_DAYS` 缺省 90（裁决基准值·bounded 1..3650）；
 * `USAGE_CALIBRATION_RETENTION_INTERVAL_MS` 缺省 86_400_000（按天低频）。
 * 非法 env=启动失败非静默回退（AG-18 同族纪律·沿 resolveUsageCalibrationReconcileConfig 先例形）。
 *
 * Honesty: 观测保留期系纯膨胀治理（不触钱）·≠ EG-B1 unknown ageing（账本清算·与状态机同批·
 * REQUEST §3-3 范围外）· ≠ 任何 MODEL-OP 收口宣称。
 */
import { purgeExpiredUsageCalibrationObservations, type DbPool } from '@meetwise/db';
import { runDrainLoop } from './drain-loop.ts';

export interface UsageCalibrationRetentionConfig {
  enabled: boolean;
  keepDays: number;
  intervalMs: number;
}

const DEFAULT_KEEP_DAYS = 90;             // 裁决基准值（EXPERT-REVIEWS §七 :67）
const MIN_KEEP_DAYS = 1;
const MAX_KEEP_DAYS = 3650;               // 10 年 sane 上界（SQL 侧 1..3650 fail-closed 同域）
const DEFAULT_RETENTION_INTERVAL_MS = 86_400_000;   // 1d：低频清除
const MIN_RETENTION_INTERVAL_MS = 60_000;
const MAX_RETENTION_INTERVAL_MS = 604_800_000;      // 7d sane 上界

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

/** Invalid retention timing is a startup error, not a silent policy change.（AG-18 纪律·非法 env 启动失败绝不静默回退默认） */
export function resolveUsageCalibrationRetentionConfig(env: NodeJS.ProcessEnv = process.env): UsageCalibrationRetentionConfig {
  return {
    enabled: boundedBoolean(env.USAGE_CALIBRATION_RETENTION_ENABLED, false, 'usage_calibration_retention_enabled_invalid'),
    keepDays: boundedInteger(
      env.USAGE_CALIBRATION_RETENTION_DAYS, DEFAULT_KEEP_DAYS, MIN_KEEP_DAYS, MAX_KEEP_DAYS,
      'usage_calibration_retention_days_invalid',
    ),
    intervalMs: boundedInteger(
      env.USAGE_CALIBRATION_RETENTION_INTERVAL_MS, DEFAULT_RETENTION_INTERVAL_MS,
      MIN_RETENTION_INTERVAL_MS, MAX_RETENTION_INTERVAL_MS, 'usage_calibration_retention_interval_invalid',
    ),
  };
}

/** 一拍：保留期清除。整拍不抛（drain-loop 要求）；清除失败自吞下拍重试（at-least-once）。 */
export async function usageCalibrationRetentionTick(pool: DbPool, keepDays: number): Promise<number> {
  try {
    // 显式借用一条连接再交 Client 形参（池对象直传系类型谎言；运行时语义与池级 query 等价：
    // 同一登录身份、同一 SECURITY DEFINER 函数、用毕归还）。
    const client = await pool.connect();
    try {
      return await purgeExpiredUsageCalibrationObservations(client, keepDays);
    } finally {
      client.release();
    }
  } catch (e) {
    console.error('usage calibration retention purge failed', e);
    return 0;
  }
}

/** 常驻保留期循环（可优雅排空·缺省按天低频）。 */
export function runUsageCalibrationRetention(pool: DbPool, config: UsageCalibrationRetentionConfig) {
  return runDrainLoop(async () => { await usageCalibrationRetentionTick(pool, config.keepDays); }, config.intervalMs);
}

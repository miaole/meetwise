/**
 * usage 对账校准的**生产调度侧**（MODEL-OP-wire / MODEL-OP-00 P2/P3）：把域级
 * `reconcileUsageCalibration` 接进 worker drain-loop，周期按 owner 落观测 + 版本化因子。
 *
 * 一拍 = gateway 枚举有 estimate↔usage 配对的 owner → 每 owner 跑 reconcileUsageCalibration
 * （batch = 小时桶，同小时重跑幂等）。一个 owner 抛不拖垮整拍；整拍不抛（drain-loop 要求）。
 *
 * Honesty pins (MODEL-OP-wire):
 * - Dual reconciler 同列 with model-invocation-reconcile · ≠ MODEL-OP fake green / ≠ SLO
 * - Prod wakeup stays PG LISTEN/NOTIFY provisional · Ban delete PG listener
 * - Redis wake deferred · not STOPPED · ≠ cutover claim
 * - releaseEvidence=false · ≠HA
 */
import { gatewayUsageCalibrationOwners, type DbPool } from '@meetwise/db';
import { reconcileUsageCalibration } from '@meetwise/ai-runtime';
import { runDrainLoop } from './drain-loop.ts';

function hourBatch(now = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const h = String(now.getUTCHours()).padStart(2, '0');
  return `cal-${y}${m}${d}${h}`;
}

export interface UsageCalibrationReconcileOutcome {
  owners: number;
  groups: number;
  factors: number;
}

/**
 * AG-07 止血旋钮（AG-COST1 §1-①）：60s 硬编码默认需发版才能改——本旋钮把间隔与开关交给 env。
 * 裁决项① EXEC 按 REQUEST §8 推荐 (b) 执行（可调）：`USAGE_CALIBRATION_ENABLED` 缺省 `false`
 * （干脆关停——resolveLatestCalibratedFactor 生产零调用=止血零功能代价·②迁移三件套落地后再启）；
 * `USAGE_CALIBRATION_INTERVAL_MS` 缺省 `86_400_000`（专家意见 (a) 降频到每天——重启用时未显式设间隔
 * 即按天跑，绝不回退 60s）。中间档 3_600_000（每小时）合法可选。
 */
export interface UsageCalibrationReconcileConfig {
  enabled: boolean;
  intervalMs: number;
}

const DEFAULT_INTERVAL_MS = 86_400_000;   // 1d（裁决项①(a) 值：重启用缺省按天）
const MIN_INTERVAL_MS = 60_000;           // 60s：batch=小时桶,更快只重复扫同桶（原硬编码默认即此值,留作下界）
const MAX_INTERVAL_MS = 604_800_000;      // 7d：旋钮 sane 上界

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

/** Invalid reconciliation timing is a startup error, not a silent policy change.（沿 model-invocation-reconcile.ts:41 同族纪律·AG-18：非法 env 启动失败,绝不静默回退默认） */
export function resolveUsageCalibrationReconcileConfig(env: NodeJS.ProcessEnv = process.env): UsageCalibrationReconcileConfig {
  return {
    enabled: boundedBoolean(env.USAGE_CALIBRATION_ENABLED, false, 'usage_calibration_reconcile_enabled_invalid'),
    intervalMs: boundedInteger(
      env.USAGE_CALIBRATION_INTERVAL_MS, DEFAULT_INTERVAL_MS, MIN_INTERVAL_MS, MAX_INTERVAL_MS,
      'usage_calibration_reconcile_interval_invalid',
    ),
  };
}

/** 一拍：枚举 → 逐 owner reconcile。整拍不抛。 */
export async function usageCalibrationReconcileTick(pool: DbPool): Promise<UsageCalibrationReconcileOutcome> {
  let owners = 0;
  let groups = 0;
  let factors = 0;
  let list: string[] = [];
  try {
    list = await gatewayUsageCalibrationOwners(pool);
  } catch (e) {
    console.error('usage calibration reconcile enumerate failed', e);
    return { owners, groups, factors };
  }
  const batch = hourBatch();
  for (const owner of list) {
    try {
      const r = await reconcileUsageCalibration(pool, { owner, batch });
      if (!r.ok) {
        console.error('usage calibration reconcile owner failed', owner, r.error);
        continue;
      }
      owners++;
      groups += r.groups.length;
      factors += r.groups.filter((g) => g.factor != null).length;
    } catch (e) {
      console.error('usage calibration reconcile owner failed', owner, e);
    }
  }
  return { owners, groups, factors };
}

/** 常驻校准循环（可优雅排空）。默认 60s——校准是异步后置，远慢于派发热路径即可。 */
export function runUsageCalibrationReconciler(pool: DbPool, intervalMs = 60_000) {
  return runDrainLoop(async () => { await usageCalibrationReconcileTick(pool); }, intervalMs);
}

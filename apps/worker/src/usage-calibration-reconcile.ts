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

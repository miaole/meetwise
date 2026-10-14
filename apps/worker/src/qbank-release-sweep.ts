/**
 * qbank 退役/失败代存储释放的**受控调度侧**（AG-43 调度半·qbank-control-sec 刀）：把 0146 的
 * `qbank_release_retired_generation_storage` 接进 worker drain-loop，周期回收 retired/failed 代的向量分区。
 *
 * 0146:9 原文「例程为手动运维例程（无自动调度·Ban 自动清理调度）」系设计内 Ban；本调度面由协调方本刀派单
 * **明示解除**（裁决项③落值·0146 原文零改）。执行链=asQbankControlExecutor（qbank_control_executor 是
 * 0176 收口后该函数的唯一 EXECUTE 受者——「executable grant is the authorization boundary」0066:90-93）。
 *
 * 一拍 = 经 executor 枚举未释放的终态代（retired/failed·storage_released_at IS NULL）→ 逐代调释放函数。
 * 期望内的拒绝（retired 代 corpus epoch 未前进=回滚窗口未关等）逐代 catch 计入 pending，不拖垮整拍；
 * 整拍不抛（drain-loop 要求）。释放函数自身的五道守卫（0176 镜像 0146）是唯一裁决者——调度只递申请。
 *
 * Honesty pins（qbank-control-sec REQUEST §5/§6）:
 * - 生产 manifest（QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST）不含释放函数：provision 后属主=迁移登录，
 *   非 definer 白名单成员 → 0176 守卫 1 会显式拒绝（fail-closed 提前于 DETACH）。隔离库/迁移身份属主下
 *   守卫恒过，端到端能力可证；manifest 纳管=后继刀面（assertQbankControlDefinerOwnership 的
 *   unexpected_definer_function_count=0 门禁止本卷直接 ALTER 属主）。
 * - est live=0：本模块零模型外呼、零 secrets；触发验证=隔离库 prove + 本地假拍/静态断言。
 * - releaseEvidence=false · ≠HA。
 */
import { asQbankControlExecutor, type DbPool } from '@meetwise/db';
import { runDrainLoop } from './drain-loop.ts';

export interface QbankReleaseSweepOutcome {
  /** 本拍成功释放（DETACH+DROP+落 storage_released_at）的代数。 */
  released: number;
  /** 本拍仍处未释放态的代数（含守卫拒绝：retired 回滚窗口未关、active 指针、幂等门等）。 */
  pending: number;
}

/**
 * AG-43 受控调度旋钮（沿 usage-calibration-reconcile.ts:39-72 ENABLED 先例·成本①已加旋钮先例同形）：
 * `QBANK_RELEASE_SWEEP_ENABLED` 缺省 `false`（0146:9 设计内 Ban 的保守延续——显式 opt-in 才起循环）；
 * `QBANK_RELEASE_SWEEP_INTERVAL_MS` 缺省 `86_400_000`（每天——释放是运维后置面，远慢于热路径即可）。
 */
export interface QbankReleaseSweepConfig {
  enabled: boolean;
  intervalMs: number;
}

const DEFAULT_INTERVAL_MS = 86_400_000;   // 1d：缺省按天
const MIN_INTERVAL_MS = 60_000;           // 60s：DETACH/DROP 是重 DDL，更快只重复扫同批（留作下界）
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

/** 非法 env=启动失败，绝不静默回退默认（沿 model-invocation/usage-calibration resolve 同族纪律·AG-18）。 */
export function resolveQbankReleaseSweepConfig(env: NodeJS.ProcessEnv = process.env): QbankReleaseSweepConfig {
  return {
    enabled: boundedBoolean(env.QBANK_RELEASE_SWEEP_ENABLED, false, 'qbank_release_sweep_enabled_invalid'),
    intervalMs: boundedInteger(
      env.QBANK_RELEASE_SWEEP_INTERVAL_MS, DEFAULT_INTERVAL_MS, MIN_INTERVAL_MS, MAX_INTERVAL_MS,
      'qbank_release_sweep_interval_invalid',
    ),
  };
}

/** 一拍：枚举未释放终态代 → 逐代经 executor 调释放函数。整拍不抛（drain-loop 要求）。 */
export async function qbankReleaseSweepTick(pool: DbPool): Promise<QbankReleaseSweepOutcome> {
  let candidates: Array<{ id: string; state: string }> = [];
  try {
    candidates = await asQbankControlExecutor(pool, (c) => c.query<{ id: string; state: string }>(
      `SELECT id, state FROM qbank_vector_generation
         WHERE state IN ('retired','failed') AND storage_released_at IS NULL
         ORDER BY id`,
    ).then((r) => r.rows.map((row) => ({ id: String(row.id), state: String(row.state) }))));
  } catch (e) {
    console.error('qbank release sweep enumerate failed', e);
    return { released: 0, pending: 0 };
  }
  let released = 0;
  const failures: Array<{ id: string; state: string; reason: string }> = [];
  for (const candidate of candidates) {
    try {
      await asQbankControlExecutor(pool, (c) => c.query('SELECT qbank_release_retired_generation_storage($1)', [candidate.id]));
      released++;
    } catch (e) {
      // 期望内拒绝（回滚窗口未关/幂等门/active 指针）与意外错误同路径：逐代 catch·不拖垮整拍。
      failures.push({ id: candidate.id, state: candidate.state, reason: e instanceof Error ? e.message.split('\n')[0] ?? e.message : 'unknown' });
    }
  }
  const pending = candidates.length - released;
  // 未释放代打点（沿 main.ts:292/:310 结构化 console 形）：每次拍一行，released/pending 双计。
  console.log(`qbank release sweep: candidates=${candidates.length} released=${released} pending=${pending}`);
  for (const failure of failures) {
    console.error(`qbank release sweep skip: generation=${failure.id} state=${failure.state} reason=${failure.reason}`);
  }
  return { released, pending };
}

/** 常驻释放循环（可优雅排空）。入参必须是 qbank 控制面 pool（QBANK_CONTROL_DATABASE_URL）：0176 收口后释放函数 executor-only。 */
export function runQbankReleaseSweep(pool: DbPool, intervalMs = 86_400_000) {
  return runDrainLoop(async () => { await qbankReleaseSweepTick(pool); }, intervalMs);
}

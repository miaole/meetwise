/**
 * 商务对账的**生产调度侧**（C1:把已写好、零生产调用方的 reconcile/sweep/settle 真正接进 worker）。
 * 缺了它 → 中途放弃的面试永远漏额度(reserved 挂死)、结算账本永远不落。北极星:零额度泄漏 / 快速恢复。
 *
 * 一拍 = 枚举有"待回收"的 owner(租约过期的孤儿预留 或 pending 结算 outbox) → 每 owner 各跑 reconcile:
 *   ① sweepExpiredReservations:回收租约已过期(=进程崩/用户弃)的孤儿预留 → 退额度回池(原子 UPDATE 复核 lease,与心跳续约无 TOCTOU)。
 *   ② settleOutbox:把 confirm 投的 settlement_proposed 真实入结算账本(FOR UPDATE SKIP LOCKED + UNIQUE ON CONFLICT → exactly-once)。
 * 被回收的 mock_interview 孤儿预留 → 补发 interview_unavailable 终态事件(无静默死胡同;仅 append 事件账本,不臆造 interview 状态机新值)。
 *
 * 幂等/多实例安全:sweep 的 `WHERE status='reserved' AND lease<now RETURNING` 行锁 + settle 的 SKIP LOCKED 使并发/重叠拍不重复处理;
 * 已 released 的不会二次进 swept → 终态事件 exactly-once。一个 owner 抛不拖垮整拍;整拍从不抛(否则 drain-loop 会停)。
 */
import { asPrincipal, reconcile, appendEvent, type DbPool } from '@meetwise/db';
import { runDrainLoop } from './drain-loop.ts';

/** 枚举有"待回收"的 owner（**调度层基础设施,需越 RLS 看全租户**）：dev 用 superuser 池;
 *  prod 用最小权限 dispatcher 角色(BYPASSRLS,只读 owner_user_id)。逐 owner 处理仍走 RLS 限定的 principal。
 *  两类待办:租约过期的孤儿预留(要回收) ∪ pending 结算 outbox(要入账)。 */
export async function enumerateOwnersWithReclaimWork(pool: DbPool): Promise<string[]> {
  const r = await pool.query(
    `SELECT owner_user_id FROM entitlement_consumption WHERE status='reserved' AND lease_expires_at < now()
     UNION
     SELECT owner_user_id FROM commerce_outbox WHERE status='pending'`);
  return r.rows.map((x) => x.owner_user_id as string);
}

export interface ReconcileOutcome { staleReleased: number; settled: number; abandoned: number }

/** 单 owner 对账（RLS 限定到该 principal）：回收孤儿预留 + 结算入账 + 对被回收的面试补终态事件。 */
export async function reconcileOwner(pool: DbPool, owner: string): Promise<ReconcileOutcome> {
  return asPrincipal(pool, owner, async (c) => {
    const rec = await reconcile(c, owner);
    let abandoned = 0;
    // **无静默死胡同 + 不留半死态(专家审计高-1)**:被回收的面试预留=用户中途弃(waiting_user 没后续 job → job reaper 不触发,唯此对账兜底)。
    //   ① 把 interview 置终态 'abandoned'——**必须**:create() 复用"未终态(非 completed/abandoned/failed)"的既有面试,
    //      只发事件不落终态 → 用户"开始新面试"被塞回这具尸体(begin 又幂等挡住)→ 彻底卡死。'abandoned' 复用 abandon() 同枚举,无新状态。
    //      幂等守卫 status NOT IN(...):万一已 completed(理论不可达,confirm 与 completed 同事务→confirmed 不会被扫)也不误改。
    //   ② 补发 interview_unavailable 终态事件,任何(重)连前端优雅降级不转圈。idempotencyKey=interviewId(begin 预留同键=事件 stream_key)。
    // 仅对 mock_interview 处理(quiz/diagnosis 是单发 job,由各自 reaper 兜;不往其 stream 发面试事件/改面试态)。
    // exactly-once:swept 只含本拍从 reserved 翻 released 的笔(行锁),下拍已 released 不再入 swept → 状态翻转+事件都不重放。
    for (const s of rec.swept) {
      if (s.serviceType === 'mock_interview') {
        await c.query(
          "UPDATE interview SET status='abandoned', version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status NOT IN ('completed','abandoned','failed')",
          [s.idempotencyKey, owner]);
        await appendEvent(c, owner, s.idempotencyKey, 'interview_unavailable', { reason: 'abandoned' });
        abandoned++;
      }
    }
    return { staleReleased: rec.staleReleased, settled: rec.settled, abandoned };
  });
}

/** 一拍对账:枚举待回收 owner → 逐 owner reconcile。**整拍不抛**(一个 owner 抛只记日志继续,枚举失败也吞)——drain-loop 里 tick 抛会停循环。 */
export async function commerceReconcileTick(pool: DbPool): Promise<{ owners: number } & ReconcileOutcome> {
  let owners = 0, staleReleased = 0, settled = 0, abandoned = 0;
  let list: string[] = [];
  try {
    list = await enumerateOwnersWithReclaimWork(pool);
  } catch (e) {
    console.error('commerce reconcile enumerate failed', e);
    return { owners, staleReleased, settled, abandoned };
  }
  for (const owner of list) {
    try {
      const r = await reconcileOwner(pool, owner);
      staleReleased += r.staleReleased; settled += r.settled; abandoned += r.abandoned; owners++;
    } catch (e) {
      console.error('commerce reconcile owner failed', owner, e);   // 一个 owner 抛不拖垮整拍
    }
  }
  return { owners, staleReleased, settled, abandoned };
}

/** 常驻对账循环(可优雅排空):周期 commerceReconcileTick。默认 30s——远短于 1800s 预留租约,孤儿预留过期后一拍内即回收。 */
export function runCommerceReconciler(pool: DbPool, intervalMs = 30000) {
  return runDrainLoop(async () => { await commerceReconcileTick(pool); }, intervalMs);
}

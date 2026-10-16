/**
 * 商务对账的**生产调度侧**（C1:把已写好、零生产调用方的 reconcile/sweep/settle 真正接进 worker）。
 * 缺了它 → 中途放弃的面试永远漏额度(reserved 挂死)、结算账本永远不落。北极星:零额度泄漏 / 快速恢复。
 *
 * 一拍 = 枚举有"待回收"的 owner(租约过期的孤儿预留 或 pending 结算 outbox) → 每 owner 各跑 reconcile:
 *   ① sweepExpiredReservations:回收租约已过期(=进程崩/用户弃)的孤儿预留 → 退额度回池(原子 UPDATE 复核 lease,与心跳续约无 TOCTOU)。
 *   ② settleOutbox:把 confirm 投的 settlement_proposed 真实入结算账本(FOR UPDATE SKIP LOCKED + UNIQUE ON CONFLICT → exactly-once)。
 * 被回收的 mock_interview 孤儿预留 → abandonInterviewAndRelease 同用户放弃终态口径(Interview=abandoned + 已释放额度 + AiGraphRun safely_terminated) + 补发 interview_unavailable(无静默死胡同)。
 * F3(FENCE-REFLOW/#238):已围栏(interview_privacy_active=false)的孤儿预留 → **只释放不写事件**(reconcile→sweep 已在同事务释放),
 * 两终态分支全跳、零 DML、零事件写,围栏跳过计数 fencedSkipped 上报;连续对账失败打 error 级日志并携带连续计数(见 consecutiveReconcileFailureCount)。
 *
 * 幂等/多实例安全:sweep 的 `WHERE status='reserved' AND lease<now RETURNING` 行锁 + settle 的 SKIP LOCKED 使并发/重叠拍不重复处理;
 * 已 released 的不会二次进 swept → 终态事件 exactly-once。一个 owner 抛不拖垮整拍;整拍从不抛(否则 drain-loop 会停)。
 */
import { asPrincipal, gatewayDispatchOwners, reconcile, appendEvent, failInterviewAndRelease, abandonInterviewAndRelease, cancelOpenInterviewQuestion, markApplicationAssessmentUnavailable, listTopicSettlementMismatches, errCode, type DbPool } from '@meetwise/db';
import { runDrainLoop } from './drain-loop.ts';

/** 枚举有"待回收"的 owner：网关只能返回 owner id；每个 owner 的对账仍在 RLS 事务内。
 * 两类待办:租约过期的孤儿预留(要回收) ∪ pending 结算 outbox(要入账)。 */
export async function enumerateOwnersWithReclaimWork(pool: DbPool): Promise<string[]> {
  return gatewayDispatchOwners(pool, 'commerce');
}

/** F3(v)：围栏跳过计数入对账产出（fence-skip=正常出口,非失败,不计连续失败）。 */
export interface ReconcileOutcome { staleReleased: number; settled: number; abandoned: number; fencedSkipped: number }

/** 单 owner 对账（RLS 限定到该 principal）：回收孤儿预留 + 结算入账 + 对被回收的面试补终态事件。
 *  F3(#238) 定谳形 A（五钉）：(i) commerce.ts/index.ts 零改——本文件是唯一改动面;
 *  (ii) 围栏先检=SELECT 布尔 interview_privacy_active($1),**禁 assertInterviewPrivacyActive**（其 RAISE 即毒化整个 owner 事务）;
 *  (iii) 围栏跳过=两分支全跳（B 端 assessment 分支同跳）——围栏行零 DML、零事件写,释放已由 reconcile→sweep 在同事务先行完成;
 *  (iv) 围栏跳过不计连续失败计数（见 commerceReconcileTick）,跳过判据=围栏谓词本身,非 catch-all 吞咽;
 *  (v) fencedSkipped 计数随 ReconcileOutcome 上报。毒化源唯一=围栏行业务写撞 0059 写护栏/0062 RLS RAISE → 整事务回滚;
 *  (ii)+(iii) 落地后围栏行无 RAISE 可达,「一笔失败毒化整批」对围栏行结构不可达。非围栏路径 byte 级不变。 */
export async function reconcileOwner(pool: DbPool, owner: string): Promise<ReconcileOutcome> {
  return asPrincipal(pool, owner, async (c) => {
    const rec = await reconcile(c, owner);
    let abandoned = 0;
    let fencedSkipped = 0;
    // **无静默死胡同 + 不留半死态(专家审计高-1)**:被回收的面试预留=用户中途弃(waiting_user 没后续 job → job reaper 不触发,唯此对账兜底)。
    //   ① 把 interview 置终态 'abandoned'——**必须**:create() 复用"未终态(非 completed/abandoned/failed)"的既有面试,
    //      只发事件不落终态 → 用户"开始新面试"被塞回这具尸体(begin 又幂等挡住)→ 彻底卡死。'abandoned' 复用 abandon() 同枚举,无新状态。
    //      幂等守卫 status NOT IN(...):万一已 completed(理论不可达,confirm 与 completed 同事务→confirmed 不会被扫)也不误改。
    //   ② 补发 interview_unavailable 终态事件,任何(重)连前端优雅降级不转圈。idempotencyKey=interviewId(begin 预留同键=事件 stream_key)。
    // 仅对 mock_interview 处理(quiz/diagnosis 是单发 job,由各自 reaper 兜;不往其 stream 发面试事件/改面试态)。
    // exactly-once:swept 只含本拍从 reserved 翻 released 的笔(行锁),下拍已 released 不再入 swept → 状态翻转+事件都不重放。
    for (const s of rec.swept) {
      if (s.serviceType === 'mock_interview') {
        // F3(ii)：围栏先检=布尔 SELECT（禁 RAISE-able assert——此处 RAISE 即整 owner 事务毒化回滚）。
        // true=privacy-active(未围栏,原路径);false=已围栏 → 两分支全跳。
        const fence = await c.query<{ active: boolean }>('SELECT interview_privacy_active($1) AS active', [s.idempotencyKey]);
        if (fence.rows[0] && fence.rows[0].active === false) {
          // F3(iii)：围栏行零 DML——已围栏面试不 abandon/fail/不改应用态/不发任何事件
          //（interview_event 增量=0;interview 保持非终态;B 端 application 零翻转）。释放已由 sweep 先行完成且不回滚。
          fencedSkipped++;
          continue;   // F3(iv)：正常出口,不计失败
        }
        const iv = await c.query<{ application_id: string | null }>(
          'SELECT application_id FROM interview WHERE id=$1 AND owner_user_id=$2 FOR UPDATE', [s.idempotencyKey, owner]);
        if (iv.rows[0]?.application_id) {
          // `reconcile` already changed reserved→released in this transaction.
          // Reuse the terminal helper so the DB-level failed↔released pairing is
          // checked rather than trusting this dispatcher.  B-bound sessions may
          // not become abandoned: they must expose a scoreless, restartable
          // application terminal state.
          await failInterviewAndRelease(c, owner, s.idempotencyKey);
          const marked = await markApplicationAssessmentUnavailable(c, owner, s.idempotencyKey);
          if (marked !== 'updated' && marked !== 'replayed') throw Object.assign(new Error(`reconcile_application_recovery_${marked}`), { code: 'reconcile_application_recovery_conflict' });
          await appendEvent(c, owner, s.idempotencyKey, 'assessment_unavailable', { reason: 'reservation_expired' }, 'assessment_unavailable:reservation_expired');
        } else {
          // UC-E2E-018 §1b #3 / GAP-UC018-TTL: same terminal口径 as user abandon —
          // Interview=abandoned + entitlement already released by reconcile sweep +
          // AiGraphRun safely_terminated via abandonInterviewAndRelease (not raw UPDATE).
          // Ban wash: commerce-reconcile:prove 旁证 alone ≠ this dedicated path closed.
          try {
            await abandonInterviewAndRelease(c, owner, s.idempotencyKey);
          } catch (e: unknown) {
            // Missing/non-CAS row: keep release (same txn) and soft-set abandoned when possible
            // so create() cannot reuse a half-dead corpse (same terminal口 as abandon).
            if (errCode(e) !== 'interview_abandon_conflict' && errCode(e) !== 'interview_release_failed') throw e;
            await c.query(
              "UPDATE interview SET status='abandoned', version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status NOT IN ('completed','abandoned','failed')",
              [s.idempotencyKey, owner]);
          }
          // #1 soft-set 兜底臂同口径：本臂绕过 abandonInterviewAndRelease（其 finishAbandon 已 cancel），
          // 显式补 cancel open 题——主臂重入为幂等 0 行 no-op，两臂终态口径合一。
          await cancelOpenInterviewQuestion(c, owner, s.idempotencyKey);
          await appendEvent(c, owner, s.idempotencyKey, 'interview_unavailable', { reason: 'abandoned' }, 'interview_unavailable:' + s.idempotencyKey + ':reclaim');
        }
        abandoned++;
      }
    }
    // billing P3 修法⑧：对账巡检（蓝本 §7 对账行·只告警零修复零阻断）——per_topic_capped 已结算场中
    // settled≠round(requested×LEAST(Σ,cap)/cap, 2) 的行（0173 触发器钉死新终态后的两类时序缺口兜底：
    // 触发器上线前已结算存量 / 行值 billing_cap_units 影子期复核改值）。fail-soft：巡检自身失败仅日志。
    try {
      const mismatches = await listTopicSettlementMismatches(c, owner);
      for (const m of mismatches) {
        console.error('topic_settlement_mismatch', { owner, interviewId: m.interviewId, status: m.status, settled: m.settled, expected: m.expected, countedUnits: m.countedUnits });
      }
    } catch (inspectionError) {
      console.error('topic_settlement_inspection_failed', { owner, error: String((inspectionError as Error)?.message ?? inspectionError) });
    }
    return { staleReleased: rec.staleReleased, settled: rec.settled, abandoned, fencedSkipped };
  });
}

/** F3(#238)：连续失败计数（跨拍持久,模块级）——同一拍/连续拍对账失败时,错误日志携带连续计数（告警数据源;
 *  「计数告警」=error 级日志+计数,非告警系统建成,ready() 语义零改）。任一 owner 对账成功即清零。
 *  围栏跳过（fence-skip）=正常出口,永不计入。 */
let consecutiveReconcileFailures = 0;
export function consecutiveReconcileFailureCount(): number { return consecutiveReconcileFailures; }

/** 一拍对账:枚举待回收 owner → 逐 owner reconcile。**整拍不抛**(一个 owner 抛只记日志继续,枚举失败也吞)——drain-loop 里 tick 抛会停循环。 */
export async function commerceReconcileTick(pool: DbPool): Promise<{ owners: number; consecutiveFailures: number } & ReconcileOutcome> {
  let owners = 0, staleReleased = 0, settled = 0, abandoned = 0, fencedSkipped = 0;
  let list: string[] = [];
  try {
    list = await enumerateOwnersWithReclaimWork(pool);
  } catch (e) {
    consecutiveReconcileFailures++;
    console.error(`commerce reconcile enumerate failed (consecutive=${consecutiveReconcileFailures})`, e);
    return { owners, staleReleased, settled, abandoned, fencedSkipped, consecutiveFailures: consecutiveReconcileFailures };
  }
  for (const owner of list) {
    try {
      const r = await reconcileOwner(pool, owner);
      staleReleased += r.staleReleased; settled += r.settled; abandoned += r.abandoned; fencedSkipped += r.fencedSkipped; owners++;
      consecutiveReconcileFailures = 0;   // 健康一拍即清零
    } catch (e) {
      consecutiveReconcileFailures++;
      console.error(`commerce reconcile owner failed (consecutive=${consecutiveReconcileFailures})`, owner, e);   // 一个 owner 抛不拖垮整拍;连续失败计数+error 级日志(F3)
    }
  }
  return { owners, staleReleased, settled, abandoned, fencedSkipped, consecutiveFailures: consecutiveReconcileFailures };
}

/** 常驻对账循环(可优雅排空):周期 commerceReconcileTick。默认 30s——远短于 1800s 预留租约,孤儿预留过期后一拍内即回收。 */
export function runCommerceReconciler(pool: DbPool, intervalMs = 30000) {
  return runDrainLoop(async () => { await commerceReconcileTick(pool); }, intervalMs);
}

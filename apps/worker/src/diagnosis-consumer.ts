/**
 * 简历诊断(resume-diagnosis) job 消费循环(**生产**,worker 侧):drain 队列 → 跑 runDiagnosis(图/模型)。
 * 镜像 quiz-consumer 的三事务式(claim 提交 → 生命周期短事务 → markDone)+ **失败路径(无泄漏)**:
 *   job 失败=终态(诊断不重试到无穷)→ markFailed + 发 diagnosis_unavailable 终态事件(前端不死等)+ release 预留额度(不白扣)。
 */
import { asPrincipal, gatewayDispatchOwners, claimNextDiagnosisJob, markDiagnosisJobDone, markDiagnosisJobFailed, appendEvent, releaseConsumption, renewDiagnosisJobLease, sweepStuckDiagnosisJobs, RESUME_DERIVATIVE_REFERENCE_VERSION, type DbPool } from '@meetwise/db';
import type { ModelClient } from '@meetwise/ai-runtime';
import { runDiagnosis } from './diagnosis-lifecycle.ts';
import { runDrainLoop } from './drain-loop.ts';
import { startHeartbeat } from './job-heartbeat.ts';

export interface DiagnosisConsumerDeps { pool: DbPool; model: ModelClient; leaseOwner: string }
export type DiagnosisDrainResult = 'generate' | 'idle' | 'failed';

function hasCurrentResumeReference(job: { resumeId: string | null; privacyEpoch: number | null; referenceSchemaVersion: number | null }) {
  return job.referenceSchemaVersion === RESUME_DERIVATIVE_REFERENCE_VERSION
    && typeof job.resumeId === 'string'
    && Number.isSafeInteger(job.privacyEpoch)
    && (job.privacyEpoch as number) >= 1;
}

/** 领一个诊断 job 跑完 → markDone;失败 markFailed + 终态事件 + 退还额度。模型/图在生命周期短事务,不与 claim 同事务。 */
export async function drainDiagnosisJobOnce(d: DiagnosisConsumerDeps, owner: string): Promise<DiagnosisDrainResult> {
  const job = await asPrincipal(d.pool, owner, (c) => claimNextDiagnosisJob(c, owner, d.leaseOwner));   // tx1 claim
  if (!job) return 'idle';
  // 心跳:诊断图/模型可能慢(>120s 租约),续租避免被 reaper 误判崩溃而重领(=并发双跑同一诊断)。
  const hb = startHeartbeat(() => asPrincipal(d.pool, owner, (c) => renewDiagnosisJobLease(c, owner, job.id, d.leaseOwner)));
  try {
    // Historical JSON is opaque and untrusted.  A legacy job becomes a
    // normal failed/refunded terminal state without a payload read or egress.
    if (!hasCurrentResumeReference(job)) throw Object.assign(new Error('legacy_resume_reference_unresolved'), { code: 'legacy_resume_reference_unresolved' });
    await runDiagnosis(d.pool, owner, job.diagnosisId, job.resumeId!, job.privacyEpoch!, d.model);
    await asPrincipal(d.pool, owner, (c) => markDiagnosisJobDone(c, owner, job.id, d.leaseOwner));
    return 'generate';
  } catch (e: any) {
    await asPrincipal(d.pool, owner, async (c) => {
      // **租约守卫**:markFailed 的 CAS 含 lease_owner=本机;若已被重领(0 行 → false),本 worker 已不持租约 → 静默退出,
      // 不发终态事件、不退额度(否则会退掉现租约持有者正要 confirm 的预留 = 漏扣)。
      const isLegacyReference = e?.code === 'legacy_resume_reference_unresolved';
      // Never deserialize a historical payload.  Its terminal transition
      // atomically redacts it so future maintenance code cannot recover it.
      const stillMine = isLegacyReference
        ? (await c.query(
          `UPDATE diagnosis_job SET status='failed', payload='{}'::jsonb,
             last_error='legacy_resume_reference_unresolved', lease_owner=NULL, version=version+1
           WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3`,
          [job.id, owner, d.leaseOwner],
        )).rowCount === 1
        : await markDiagnosisJobFailed(c, owner, job.id, d.leaseOwner, e?.message ?? 'err');
      if (!stillMine) return;
      // 不把已 ready 的诊断倒退(confirm 后 markDone 抛错也会落此 catch);仅从非终态置 failed。
      await c.query("UPDATE resume_diagnosis SET status='failed', version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status NOT IN ('ready')", [job.diagnosisId, owner]);
      // **终态事件(北极星:无静默死胡同)**:诊断失败=终态 → 发 diagnosis_unavailable,否则前端死等 section_ready 无限转圈。
      await appendEvent(c, owner, job.diagnosisId, 'diagnosis_unavailable', { reason: isLegacyReference ? 'legacy_reference_unresolved' : 'job_failed' });
      // **失败退款(无泄漏)**:诊断终态失败 → 预留的 1.0 永不会被 confirm,必须释放(幂等,key=diagnosisId)。
      await releaseConsumption(c, owner, job.diagnosisId).catch(() => {});
    });
    return 'failed';
  } finally {
    await hb.stop();   // 停心跳(等在飞续租跑完)
  }
}

export async function drainOwnerDiagnosisJobs(d: DiagnosisConsumerDeps, owner: string): Promise<void> {
  let r: DiagnosisDrainResult = 'generate';
  while (r !== 'idle') r = await drainDiagnosisJobOnce(d, owner);
}

/** Reaper 一拍(镜像 quiz)：收割 owner 名下崩在 running 且租约过期的孤儿诊断 job。
 *  未超上限 → requeue;已达上限 → 终结 failed + resume_diagnosis 标 failed(非 ready 才退) + 发 diagnosis_unavailable + 退预留额度。 */
export async function reapStuckDiagnosisJobs(d: DiagnosisConsumerDeps, owner: string): Promise<{ requeued: number; failed: number }> {
  return asPrincipal(d.pool, owner, async (c) => {
    const res = await sweepStuckDiagnosisJobs(c, owner);
    for (const diagnosisId of res.failedDiagnoses) {
      // 先退款,再据结果决定事件(对齐 quiz reaper):已 confirmed(诊断确实 ready 只是 job 没 markDone 就崩)→ 不发假失败事件、不倒退 ready。
      const rel = await releaseConsumption(c, owner, diagnosisId)
        .catch((err) => { console.error('reap diagnosis release failed', diagnosisId, (err as any)?.code ?? err); return { status: 'error' as const, reason: 'release_threw' }; });
      const alreadySettled = rel.status === 'error' && (rel as any).reason === 'already_confirmed';
      if (!alreadySettled) {
        await c.query("UPDATE resume_diagnosis SET status='failed', version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status NOT IN ('ready')", [diagnosisId, owner]);
        await appendEvent(c, owner, diagnosisId, 'diagnosis_unavailable', { reason: 'worker_died' });
      }
    }
    return { requeued: res.requeued, failed: res.failed };
  });
}

/** 一拍调度:受限网关只枚举 owner id，随后每 owner 立即回到 RLS 事务处理。 */
export async function diagnosisDispatchTick(d: DiagnosisConsumerDeps): Promise<{ owners: number; requeued: number; failed: number }> {
  const owners = await gatewayDispatchOwners(d.pool, 'diagnosis');
  let requeued = 0, failed = 0;
  for (const o of owners) {
    const r = await reapStuckDiagnosisJobs(d, o);
    requeued += r.requeued; failed += r.failed;
    await drainOwnerDiagnosisJobs(d, o);
  }
  return { owners: owners.length, requeued, failed };
}

/** 常驻消费循环(可优雅排空:stop() 等当前 tick 跑完,滚动部署不丢在飞 job)。 */
export function runDiagnosisConsumer(d: DiagnosisConsumerDeps, intervalMs = 5000) {
  return runDrainLoop(async () => { await diagnosisDispatchTick(d); }, intervalMs);
}

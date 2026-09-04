/**
 * 押题(resume-quiz) job 消费循环(**生产**,worker 侧):drain 队列 → 跑 runQuiz(图/模型)。
 * 镜像 interview-consumer 的三事务式(claim 提交 → 生命周期短事务 → markDone)+ **失败路径(无泄漏)**:
 *   job 失败=终态(押题不重试到无穷)→ markFailed + 发 quiz_unavailable 终态事件(前端不死等)+ release 预留额度(不白扣)。
 */
import { asPrincipal, gatewayDispatchOwners, claimNextQuizJob, markQuizJobDone, markQuizJobFailed, appendEvent, releaseConsumption, renewQuizJobLease, sweepStuckQuizJobs, RESUME_DERIVATIVE_REFERENCE_VERSION, type DbPool } from '@meetwise/db';
import type { ModelClient } from '@meetwise/ai-runtime';
import { runQuiz } from './quiz-lifecycle.ts';
import { runDrainLoop } from './drain-loop.ts';
import { startHeartbeat } from './job-heartbeat.ts';
import { drainOwnersInListedOrder } from './owner-queue-drain.ts';

export interface QuizConsumerDeps { pool: DbPool; model: ModelClient; leaseOwner: string }
export type QuizDrainResult = 'generate' | 'idle' | 'failed';

function hasCurrentResumeReference(job: { resumeId: string | null; privacyEpoch: number | null; referenceSchemaVersion: number | null }) {
  return job.referenceSchemaVersion === RESUME_DERIVATIVE_REFERENCE_VERSION
    && typeof job.resumeId === 'string'
    && Number.isSafeInteger(job.privacyEpoch)
    && (job.privacyEpoch as number) >= 1;
}

/** 领一个押题 job 跑完 → markDone;失败 markFailed + 终态事件 + 退还额度。模型/图在生命周期短事务,不与 claim 同事务。 */
export async function drainQuizJobOnce(d: QuizConsumerDeps, owner: string): Promise<QuizDrainResult> {
  const job = await asPrincipal(d.pool, owner, (c) => claimNextQuizJob(c, owner, d.leaseOwner));   // tx1 claim
  if (!job) return 'idle';
  // 心跳:押题图/模型可能慢(>120s 租约),续租避免被 reaper 误判崩溃而重领(=并发双跑同一押题)。
  const hb = startHeartbeat(() => asPrincipal(d.pool, owner, (c) => renewQuizJobLease(c, owner, job.id, d.leaseOwner)));
  try {
    // A historical JSON payload is never selected by `claimNextQuizJob`.
    // Terminalize it before decrypt, graph checkpoint, or model dispatch.
    if (!hasCurrentResumeReference(job)) throw Object.assign(new Error('legacy_resume_reference_unresolved'), { code: 'legacy_resume_reference_unresolved' });
    await runQuiz(d.pool, owner, job.quizId, job.resumeId!, job.privacyEpoch!, d.model);
    await asPrincipal(d.pool, owner, (c) => markQuizJobDone(c, owner, job.id, d.leaseOwner));
    return 'generate';
  } catch (e: any) {
    await asPrincipal(d.pool, owner, async (c) => {
      // **租约守卫(专家审计:丢租约的 worker 不得碰业务态)**:markFailed 的 CAS 含 lease_owner=本机;
      // 若已被重领(0 行 → false),本 worker 已不持租约 → 静默退出,不发终态事件、不退额度(否则会退掉现租约持有者正要 confirm 的预留 = 漏扣)。
      const isLegacyReference = e?.code === 'legacy_resume_reference_unresolved';
      // The job was claimed without selecting payload.  Once classified as
      // legacy, erase its opaque historical JSON in the same terminal CAS so
      // it cannot wait in a failed row for a future accidental reader.
      const stillMine = isLegacyReference
        ? (await c.query(
          `UPDATE quiz_job SET status='failed', payload='{}'::jsonb,
             last_error='legacy_resume_reference_unresolved', lease_owner=NULL, version=version+1
           WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3`,
          [job.id, owner, d.leaseOwner],
        )).rowCount === 1
        : await markQuizJobFailed(c, owner, job.id, d.leaseOwner, e?.message ?? 'err');
      if (!stillMine) return;
      // 不把已 ready 的押题倒退(confirm 后 markDone 抛错也会落此 catch);仅从非终态置 failed。
      await c.query("UPDATE resume_quiz SET status='failed', version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status NOT IN ('ready')", [job.quizId, owner]);
      // **终态事件(北极星:无静默死胡同)**:押题失败=终态 → 发 quiz_unavailable,否则前端死等 question_ready 无限转圈。
      await appendEvent(c, owner, job.quizId, 'quiz_unavailable', { reason: isLegacyReference ? 'legacy_reference_unresolved' : 'job_failed' });
      // **失败退款(无泄漏)**:押题终态失败 → 预留的 1.0 永不会被 confirm,必须释放(幂等,key=quizId)。
      await releaseConsumption(c, owner, job.quizId).catch(() => {});
    });
    return 'failed';
  } finally {
    await hb.stop();   // 停心跳(等在飞续租跑完)
  }
}

export async function drainOwnerQuizJobs(d: QuizConsumerDeps, owner: string): Promise<void> {
  await drainOwnersInListedOrder(d, [owner], drainQuizJobOnce, (result) => result === 'idle');
}

/** Reaper 一拍(镜像 interview)：收割 owner 名下崩在 running 且租约过期的孤儿押题 job。
 *  未超上限 → requeue;已达上限 → 终结 failed + resume_quiz 标 failed(非 ready 才退,不倒退已交付) + 发 quiz_unavailable + 退预留额度。 */
export async function reapStuckQuizJobs(d: QuizConsumerDeps, owner: string): Promise<{ requeued: number; failed: number }> {
  return asPrincipal(d.pool, owner, async (c) => {
    const res = await sweepStuckQuizJobs(c, owner);
    for (const quizId of res.failedQuizzes) {
      // 先退款,再据结果决定事件(对齐 interview reaper):已 confirmed(押题确实 ready 只是 job 没 markDone 就崩)→ 不发假失败事件、不倒退 ready。
      const rel = await releaseConsumption(c, owner, quizId)
        .catch((err) => { console.error('reap quiz release failed', quizId, (err as any)?.code ?? err); return { status: 'error' as const, reason: 'release_threw' }; });
      const alreadySettled = rel.status === 'error' && (rel as any).reason === 'already_confirmed';
      if (!alreadySettled) {
        await c.query("UPDATE resume_quiz SET status='failed', version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status NOT IN ('ready')", [quizId, owner]);
        await appendEvent(c, owner, quizId, 'quiz_unavailable', { reason: 'worker_died' });
      }
    }
    return { requeued: res.requeued, failed: res.failed };
  });
}

/** 一拍调度:受限网关只枚举 owner id，随后按列表顺序把每个 owner 抽干。不是面试量子轮转。 */
export async function quizDispatchTick(d: QuizConsumerDeps): Promise<{ owners: number; requeued: number; failed: number }> {
  const owners = await gatewayDispatchOwners(d.pool, 'quiz');
  let requeued = 0, failed = 0;
  await drainOwnersInListedOrder(d, owners, drainQuizJobOnce, (result) => result === 'idle', {
    beforeOwner: async (owner) => {
      const r = await reapStuckQuizJobs(d, owner);
      requeued += r.requeued;
      failed += r.failed;
    },
  });
  return { owners: owners.length, requeued, failed };
}

/** 常驻消费循环(可优雅排空:stop() 等当前 tick 跑完,滚动部署不丢在飞 job)。 */
export function runQuizConsumer(d: QuizConsumerDeps, intervalMs = 5000) {
  return runDrainLoop(async () => { await quizDispatchTick(d); }, intervalMs);
}

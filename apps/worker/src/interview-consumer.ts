/**
 * 面试 job 消费循环（**生产**,worker 侧）：drain 队列 → 跑生命周期(startInterview/submitAnswer)。
 * 这就是"真请求经队列驱动 agent"的进程接线:api 入队 → 本消费者跑图/模型 → 事件经 SSE 回前端。
 * 三事务式:claim 提交 → 生命周期(模型在各自短事务,经 invoke) → markDone。同面试保序、租约崩溃可重领。
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import { asPrincipal, claimNextInterviewJob, markJobDone, markJobFailed, appendEvent, decryptResumeBlob, releaseConsumption, renewReservationLease, renewInterviewJobLease, sweepStuckInterviewJobs, DEFAULT_LEASE_SECONDS, type DbPool } from '@meetwise/db';
import { getMetrics, METRIC, type ModelClient } from '@meetwise/ai-runtime';
import type { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { ingestResume, type ScoredRef, type SourceDoc } from '@meetwise/domain';
import { startInterview, submitAnswer } from './interview-lifecycle.ts';
import { startAdaptiveInterview, submitAdaptiveAnswer } from './adaptive-lifecycle.ts';
import { runDrainLoop } from './drain-loop.ts';
import { startHeartbeat } from './job-heartbeat.ts';

type Checkpointer = PostgresSaver;     // 直接取类型,不从 main 引(否则 main↔consumer 成环)

// **全链路 request-id 的进程内接力**:出队读 payload.requestId,把整段生命周期处理跑在 ALS 上下文里,
// 深埋在 lifecycle/service 里的每个 invoke 关口自动读到同一 reqId → 落 ai_invocation_trace.request_id(现有 invoke 调用零改动)。
// reqId 的持久真相在 job.payload(Postgres);ALS 只是"本次执行"的进程内传递,崩溃重投按 payload 重放同一 reqId(不依赖内存)。
// 与 ai-runtime 关口经 Symbol 全局注册表共享同一 AsyncLocalStorage 实例(两包不互 import,单例安全)。
const requestIdStore: AsyncLocalStorage<string> =
  ((globalThis as unknown as Record<symbol, AsyncLocalStorage<string> | undefined>)[Symbol.for('meetwise.ai-runtime.requestIdContext')] ??= new AsyncLocalStorage<string>());
export interface ConsumerDeps {
  pool: DbPool; cp: Checkpointer; model: ModelClient; fastModel?: ModelClient; leaseOwner: string;
  // 注入则消费者跑**自适应 agent 图**(生产注真 annSearch/web fetcher;测试注 fake);不注则跑旧固定题单流程。
  // localRetrieve 按 owner 参数化(消费者多 owner;每 job 闭成 owner 专属);webExplore owner 无关(web 抓取)。
  adaptive?: { localRetrieve: (owner: string, q: string) => Promise<ScoredRef[]>; webExplore: (q: string) => Promise<SourceDoc[]>; competencyKeywords?: Record<string, string[]>; role?: string };
}
export type DrainResult = 'start' | 'answer' | 'idle' | 'failed';

/** 领一个 job 跑完(start/answer)→ markDone;失败 markFailed。模型/图在生命周期里的短事务,不与 claim 同事务。 */
export async function drainInterviewJobOnce(d: ConsumerDeps, owner: string): Promise<DrainResult> {
  const job = await asPrincipal(d.pool, owner, (c) => claimNextInterviewJob(c, owner, d.leaseOwner));   // tx1 claim
  if (!job) return 'idle';
  // **预留租约续约(C1;北极星:活会话不被对账误扫)**:本 worker 正推进此面试的 job → 证明 liveness,把预留租约(key=interviewId,与 begin 预留同键)往后推。
  // 长面试跨多轮、用户思考间隔可 >1800s 预留租约 → 每领一 job 续一次,活会话绝不被 commerce reconcile 当孤儿回收。
  // 仅对仍 reserved 有效(已 confirmed/released → 0 行 → false,无害);原子 UPDATE 复核 lease → 与 sweep 无 TOCTOU。续约失败不阻断处理(记日志,对账兜底)。
  await asPrincipal(d.pool, owner, (c) => renewReservationLease(c, owner, job.interviewId, DEFAULT_LEASE_SECONDS))
    .catch((err) => console.error('reservation lease renew failed', job.interviewId, (err as any)?.code ?? err));
  // 心跳:跑图/模型可能慢(>120s 租约),续租避免被 reaper 误判崩溃而重领(=并发双跑同一面试)。
  // **同拍续预留租约(C1 审计中-1)**:单个 job 若处理 >1800s(慢模型/长 start 图),预留租约会在 job 仍在飞时过期 →
  //   被 commerce reconcile 误扫退款 → 收尾 confirm 撞 already_released 免费交付。心跳期间一并续预留租约,活 job 全程护住预留。
  //   续预留返回值不影响心跳存续(以 job 租约为准:job 租约丢了才停);预留仅 reserved 有效(终态 0 行,无害)。
  const hb = startHeartbeat(() => asPrincipal(d.pool, owner, async (c) => {
    const jobAlive = await renewInterviewJobLease(c, owner, job.id, d.leaseOwner);
    await renewReservationLease(c, owner, job.interviewId, DEFAULT_LEASE_SECONDS);
    return jobAlive;
  }));
  // 出队取 reqId(缺失/非串容忍 → undefined,不进 ALS → invoke 落 NULL,不崩;向后兼容旧 job)。
  const requestId: string | undefined = typeof job.payload?.requestId === 'string' && job.payload.requestId ? job.payload.requestId : undefined;
  const inReqCtx = <R>(fn: () => Promise<R>): Promise<R> => (requestId ? requestIdStore.run(requestId, fn) : fn());
  try {
    return await inReqCtx(async () => {   // 整段处理跑在 reqId 上下文:深埋的每个 invoke 自动带上本次请求的 reqId
      if (d.adaptive) {
        const localRetrieve = (q: string) => d.adaptive!.localRetrieve(owner, q);   // 闭成本 owner 专属
        const life = { pool: d.pool, cp: d.cp, owner, interviewId: job.interviewId, model: d.model, fastModel: d.fastModel, localRetrieve, webExplore: d.adaptive.webExplore, competencyKeywords: d.adaptive.competencyKeywords };
        if (job.kind === 'start') {
          const raw = await asPrincipal(d.pool, owner, (c) => decryptResumeBlob(c, owner, job.payload.resumeId));   // PII 在加密 blob,这里解
          await startAdaptiveInterview(life, d.adaptive.role ?? '技术岗', ingestResume(raw).facts);
        } else {
          await submitAdaptiveAnswer(life, job.payload.answer);
        }
      } else if (job.kind === 'start') await startInterview(d.pool, d.cp, owner, job.interviewId, job.payload.resumeId, d.model);
      else await submitAnswer(d.pool, d.cp, owner, job.interviewId, job.payload.turn, job.payload.answer, d.model);
      await asPrincipal(d.pool, owner, (c) => markJobDone(c, owner, job.id, d.leaseOwner));
      return job.kind;
    });
  } catch (e: any) {
    await asPrincipal(d.pool, owner, async (c) => {
      // **租约守卫(对齐 quiz-consumer;专家审计:此前缺失=真泄漏)**:markJobFailed 的 CAS 含 lease_owner=本机。
      // 若本 job 已被 reaper requeue / 他人重领(慢 worker 租约过期),CAS 0 行 → 本 worker 已不持租约 →
      // 静默退出:绝不发终态事件、绝不退额度。否则会(a)对正被他人推进的面试发假 interview_unavailable,
      // (b)退掉现持租者正要 confirm 的预留 → 漏扣/免费交付。
      const stillMine = await markJobFailed(c, owner, job.id, d.leaseOwner, e?.message ?? 'err');
      if (!stillMine) return;
      // **终态事件(北极星:无静默死胡同)**:面试 job 失败=终态(不重试)→ 发 interview_unavailable,
      // 否则前端死等 question_ready/answer_evaluated 无限转圈。对称于报告隔离的 report_unavailable。
      await appendEvent(c, owner, job.interviewId, 'interview_unavailable', { reason: 'job_failed', kind: job.kind });
      // **标终态 failed(修 C1 同源 reuse-trap)**:已发 interview_unavailable 终态事件=面试已死;不标 interview 终态则 create() 复用这具"尸体"(status NOT IN completed/abandoned/failed 就复用)→ 用户开不了新面试。任何 kind 的 job 终态失败都标(answer 死也废本场,前端已收到 unavailable)。
      await c.query("UPDATE interview SET status='failed', version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status NOT IN ('completed','abandoned','failed')", [job.interviewId, owner]);
      // **失败退款**:job 失败=结算 tx 必未提交(confirm 与 completed 同事务,抛则回滚)→ 预留的 1.0 永不会被 confirm,
      // 必须释放,否则用户为失败的面试白扣额度。releaseConsumption 幂等(key=interviewId);释放失败不静默(记日志,租约 sweeper 兜底)。
      await releaseConsumption(c, owner, job.interviewId).catch((err) => { getMetrics().inc(METRIC.refundFailed); console.error('interview release failed', job.interviewId, (err as any)?.code ?? err); });   // 退款失败可观测(告警数据源)
    });
    return 'failed';
  } finally {
    await hb.stop();   // 停心跳(等在飞续租跑完)——markDone/markFailed 已落,租约不再需要续
  }
}

export async function drainOwnerJobs(d: ConsumerDeps, owner: string): Promise<void> {
  let r: DrainResult = 'start';
  while (r !== 'idle') r = await drainInterviewJobOnce(d, owner);
}

/** Reaper 一拍(北极星:无静默死胡同)：收割 owner 名下崩在 running 且租约过期的孤儿 job。
 *  未超上限 → requeue(下次 drain 重领);已达上限 → 终结 failed + 发 interview_unavailable 终态事件(前端降级不死等)+ 退预留额度(不泄漏)。
 *  事件+退款与 sweep 同一 principal 事务,RLS 限定到本 owner。 */
export async function reapStuckInterviewJobs(d: ConsumerDeps, owner: string): Promise<{ requeued: number; failed: number }> {
  return asPrincipal(d.pool, owner, async (c) => {
    const res = await sweepStuckInterviewJobs(c, owner);
    for (const interviewId of res.failedInterviews) {
      // **先退款,再据结果决定事件(专家审计:避免对已交付面试发假终态)**:
      // 退到预留(reserved→released)→ 面试确实失败 → 发 interview_unavailable;
      // 若预留已 confirmed(罕见:确实跑完只是 job 没 markDone 就崩)→ 面试已交付,**不发假失败事件**(报告舱壁自会发 report_*)。
      // 退款抛错不静默(记日志);除"已结算"外一律发终态事件保证前端不死等(liveness 优先,租约 sweeper 兜底泄漏)。
      const rel = await releaseConsumption(c, owner, interviewId)
        .catch((err) => { getMetrics().inc(METRIC.refundFailed); console.error('reap interview release failed', interviewId, (err as any)?.code ?? err); return { status: 'error' as const, reason: 'release_threw' }; });   // 退款失败可观测(告警数据源)
      const alreadySettled = rel.status === 'error' && (rel as any).reason === 'already_confirmed';
      if (!alreadySettled) {
        await appendEvent(c, owner, interviewId, 'interview_unavailable', { reason: 'worker_died' });
        // **标终态 failed(修 C1 同源 reuse-trap)**:worker 死+达上限=面试已死;不标则 create() 复用尸体、用户开不了新面试。已交付(alreadySettled)不标。
        await c.query("UPDATE interview SET status='failed', version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status NOT IN ('completed','abandoned','failed')", [interviewId, owner]);
      }
    }
    return { requeued: res.requeued, failed: res.failed };
  });
}

/** 一拍调度:枚举有待办 job 的 owner(需越 RLS;生产用 BYPASSRLS dispatcher 角色)→ 每 owner 先 reap(收割孤儿) 再 drain。 */
export async function interviewDispatchTick(d: ConsumerDeps): Promise<{ owners: number; requeued: number; failed: number }> {
  const owners = (await d.pool.query("SELECT DISTINCT owner_user_id FROM interview_job WHERE status='queued' OR (status='running' AND lease_expires_at < now())")).rows.map((r) => r.owner_user_id as string);
  let requeued = 0, failed = 0;
  for (const o of owners) {
    const r = await reapStuckInterviewJobs(d, o);   // 先收割:超限终结+发终态事件+退款;未超限 requeue → 同拍被 drain 重领
    requeued += r.requeued; failed += r.failed;
    await drainOwnerJobs(d, o);
  }
  return { owners: owners.length, requeued, failed };
}

/** 常驻消费循环(可优雅排空:stop() 等当前 tick 跑完,滚动部署不丢在飞 job)。 */
export function runInterviewConsumer(d: ConsumerDeps, intervalMs = 1500) {
  return runDrainLoop(async () => { await interviewDispatchTick(d); }, intervalMs);
}

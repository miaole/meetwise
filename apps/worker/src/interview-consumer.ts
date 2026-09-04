/**
 * 面试 job 消费循环（**生产**,worker 侧）：drain 队列 → 跑自适应生命周期。
 * 这就是"真请求经队列驱动 agent"的进程接线:api 入队 → 本消费者跑图/模型 → 事件经 SSE 回前端。
 * 三事务式:claim 提交 → 生命周期(模型在各自短事务,经 invoke) → markDone。同面试保序、租约崩溃可重领。
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import { asPrincipal, assertInterviewPrivacyActive, gatewayDispatchOwners, claimNextInterviewJob, loadClaimedInterviewJobRequestId, loadClaimedInterviewAnswerPayload, markJobDone, markJobFailed, requeueInterviewJob, withInterviewGraphFence, renewInterviewGraphFence, appendEvent, decryptActiveResumeBlob, enrollCheckpointThread, failInterviewAndRelease, markApplicationAssessmentUnavailable, renewReservationLease, renewInterviewJobLease, sweepStuckInterviewJobs, DEFAULT_LEASE_SECONDS, INTERVIEW_RESUME_REFERENCE_VERSION, type DbPool, type InterviewGraphFence } from '@meetwise/db';
import { getMetrics, METRIC, type ModelClient, type GraphObserver } from '@meetwise/ai-runtime';
import type { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { ingestResume, type ScoredRef, type SourceDoc } from '@meetwise/domain';
import { startAdaptiveInterview, submitAdaptiveAnswer } from './adaptive-lifecycle.ts';
import { createInterviewResearchSkills } from './interview-research-skills.ts';
import { runDrainLoop } from './drain-loop.ts';
import { startHeartbeat } from './job-heartbeat.ts';
import { withCheckpointAccess } from './checkpoint-principal.ts';

type Checkpointer = PostgresSaver;     // 直接取类型,不从 main 引(否则 main↔consumer 成环)

// **全链路 request-id 的进程内接力**:v50 gate 后只读 payload.requestId 标量,把整段生命周期处理跑在 ALS 上下文里,
// 深埋在 lifecycle/service 里的每个 invoke 关口自动读到同一 reqId → 落 ai_invocation_trace.request_id(现有 invoke 调用零改动)。
// reqId 的持久真相在 job.payload(Postgres);ALS 只是"本次执行"的进程内传递,崩溃重投按安全标量重放同一 reqId(不依赖内存)。
// 与 ai-runtime 关口经 Symbol 全局注册表共享同一 AsyncLocalStorage 实例(两包不互 import,单例安全)。
const requestIdStore: AsyncLocalStorage<string> =
  ((globalThis as unknown as Record<symbol, AsyncLocalStorage<string> | undefined>)[Symbol.for('meetwise.ai-runtime.requestIdContext')] ??= new AsyncLocalStorage<string>());
export interface ConsumerDeps {
  pool: DbPool; cp: Checkpointer; model: ModelClient; fastModel?: ModelClient; leaseOwner: string;
  /** 测试可注入计数器；生产使用受控的 decryptActiveResumeBlob（简历解密）实现。 */
  decryptResume?: typeof decryptActiveResumeBlob;
  // 注入则消费者跑**自适应 agent 图**(生产注真 annSearch/web fetcher;测试注 fake);不注则跑旧固定题单流程。
  // localRetrieve 按 owner 参数化(消费者多 owner;每 job 闭成 owner 专属);webExplore owner 无关(web 抓取)。
  adaptive?: {
    localRetrieve: (owner: string, q: string) => Promise<ScoredRef[]>;
    webExplore: (q: string) => Promise<SourceDoc[]>;
    /** 有界多源取证；不存在时 CRAG 兼容退回 webExplore。 */
    deepResearch?: (q: string) => Promise<SourceDoc[]>;
    competencyKeywords?: Record<string, string[]>; role?: string;
    /** 软预算初值；由隔离 E2E 显式传入。生产不传则按覆盖计划派生。 */
    maxTurns?: number;
    /** 平台杀开关；E2E 应与软预算一起压低。生产默认 120。 */
    absoluteMaxTurns?: number;
    /** 仅安全标量的图/节点观测，由 worker 组合根创建。 */
    graphObserver?: GraphObserver;
    /** 仅测试观测：回答路径真正查询脱敏简历画像之前触发。 */
    onBeforeResumeProfileHydration?: () => void;
  };
}
export type DrainResult = 'start' | 'answer' | 'idle' | 'failed';

/**
 * Convert a worker-fatal assessment into one transactionally paired terminal
 * state.  `completed + confirmed` is the one benign race: a worker may crash
 * after business settlement but before markJobDone.  It must not be rewritten
 * as failed or emit a false unavailable event.  Every other release failure is
 * rethrown so the surrounding transaction rolls back instead of persisting a
 * failed interview with a reserved charge.
 */
async function terminalizeUnsettledInterview(
  c: Parameters<typeof failInterviewAndRelease>[0], owner: string, interviewId: string, reason: 'job_failed' | 'worker_died', kind?: string,
): Promise<'settled' | 'unavailable'> {
  try {
    await failInterviewAndRelease(c, owner, interviewId);
  } catch (error: any) {
    if (error?.reason === 'already_confirmed' || (error?.code === 'interview_failure_terminal_conflict' && (error?.status === 'completed' || error?.status === 'abandoned'))) {
      return 'settled';
    }
    throw error;
  }
  const applicationMark = await markApplicationAssessmentUnavailable(c, owner, interviewId);
  if (applicationMark === 'stale') return 'unavailable';
  if (applicationMark === 'updated' || applicationMark === 'replayed') {
    await appendEvent(c, owner, interviewId, 'assessment_unavailable', { reason, kind }, `assessment_unavailable:${reason}`);
  } else {
    await appendEvent(c, owner, interviewId, 'interview_unavailable', { reason, kind }, `interview_unavailable:${reason}`);
  }
  return 'unavailable';
}

/**
 * Defense in depth for every job written before the database v50 gate.  It
 * runs after a worker owns the job but before a heartbeat, checkpoint
 * enrollment, graph lease, profile hydration, decrypt, or model invocation.
 * An answer has no resume_id by design, but a v49/NULL answer can still reach
 * profile hydration and Command(resume); it is therefore just as unsafe as a
 * legacy start and must fail closed before any graph-side artifact.
 */
async function hasCurrentResumeReference(
  d: ConsumerDeps, owner: string, job: {
    kind: string; interviewId: string; resumeId: string | null;
    resumePrivacyEpoch: number | null; referenceSchemaVersion: number | null;
  },
): Promise<boolean> {
  // v49/v50/NULL are rows that predate the v64 immutable epoch snapshot.  Do
  // not promote them by inference: both start and answer must fail before a
  // heartbeat, checkpoint, payload, profile/decrypt read, or model call.
  if (job.referenceSchemaVersion !== INTERVIEW_RESUME_REFERENCE_VERSION || job.resumePrivacyEpoch === null)
    return false;
  if (job.kind === 'start' && !job.resumeId) return false;
  if (job.kind === 'answer' && job.resumeId !== null) return false;
  return asPrincipal(d.pool, owner, async (c) => {
    // The start predicate must compare the copied source id; an answer has no
    // source locator and instead compares only its durable epoch.  Both must
    // match the parent and the active resume in this same query.
    const expected = await c.query(
      `SELECT 1
         FROM interview i
         JOIN resume r ON r.id=i.resume_id AND r.owner_user_id=i.owner_user_id
        WHERE i.id=$1
          AND i.owner_user_id=$2
          AND i.resume_id IS NOT NULL
          AND i.resume_privacy_epoch=$3
          AND r.status='ingested'
          AND r.privacy_epoch=i.resume_privacy_epoch
          AND (
            ($4::text='start' AND i.resume_id=$5::uuid)
            OR
            ($4::text='answer' AND $5::uuid IS NULL AND EXISTS (
              SELECT 1
                FROM interview_job s
               WHERE s.owner_user_id=i.owner_user_id
                 AND s.interview_id=i.id
                 AND s.kind='start'
                 AND s.reference_schema_version=$6
                 AND s.resume_id=i.resume_id
                 AND s.resume_privacy_epoch=i.resume_privacy_epoch
                 AND s.status IN ('queued','running','done')
            ))
          )`,
      [job.interviewId, owner, job.resumePrivacyEpoch, job.kind, job.resumeId, INTERVIEW_RESUME_REFERENCE_VERSION],
    );
    return expected.rowCount === 1;
  });
}

/** One paired terminalization path for an early reference rejection or a graph failure. */
async function failClaimedInterviewJob(
  d: ConsumerDeps, owner: string, job: { id: string; interviewId: string; kind: string }, error: unknown,
): Promise<void> {
  await asPrincipal(d.pool, owner, async (c) => {
    const stillMine = await markJobFailed(c, owner, job.id, d.leaseOwner, (error as any)?.message ?? 'err');
    if (!stillMine) return;
    try {
      await terminalizeUnsettledInterview(c, owner, job.interviewId, 'job_failed', job.kind);
    } catch (terminalError: any) {
      getMetrics().inc(METRIC.refundFailed);
      throw terminalError;
    }
  });
}

/** 领一个 job 跑完(start/answer)→ markDone;失败 markFailed。模型/图在生命周期里的短事务,不与 claim 同事务。 */
export async function drainInterviewJobOnce(d: ConsumerDeps, owner: string): Promise<DrainResult> {
  // The legacy fixed-question graph persists raw answers in its own state and
  // has no thread/epoch checkpoint fence.  It is intentionally not a runtime
  // fallback: a misconfigured worker must fail at startup/dispatch instead of
  // silently weakening the privacy contract.
  if (!d.adaptive) throw new Error('legacy_interview_graph_disabled');
  const job = await asPrincipal(d.pool, owner, (c) => claimNextInterviewJob(c, owner, d.leaseOwner));   // tx1 claim
  if (!job) return 'idle';
  try {
    // A claimed row can race with the deletion transaction after its metadata
    // was selected.  Re-check before *any* payload read, heartbeat, checkpoint
    // enrollment, profile hydration, or model call.  The delete transaction
    // has already terminalized/redacted the row, so no compensating business
    // transition or event may be emitted here.
    await asPrincipal(d.pool, owner, (c) => assertInterviewPrivacyActive(c, job.interviewId));
  } catch (error: any) {
    if (error?.message === 'interview_privacy_fenced') return 'idle';
    throw error;
  }
  // This must precede every graph-related side effect.  In particular, do not
  // use payload.resumeId as a fallback: a deletion worker must be able to
  // classify/fence historical jobs without a late graph enrollment appearing.
  if (!await hasCurrentResumeReference(d, owner, job)) {
    await failClaimedInterviewJob(
      d, owner, job,
      Object.assign(new Error('interview_resume_reference_missing_or_mismatched'), { code: 'interview_resume_reference_missing_or_mismatched' }),
    );
    return 'failed';
  }
  // A legacy start may contain resumeRaw in JSON.  Do not even select payload
  // until the version/reference gate above has passed under the current lease.
  const requestContext = await asPrincipal(d.pool, owner, (c) =>
    loadClaimedInterviewJobRequestId(c, owner, job.id, d.leaseOwner));
  if (!requestContext.stillClaimed) return 'idle';
  let answerPayload: unknown;
  if (job.kind === 'answer') {
    const answer = await asPrincipal(d.pool, owner, (c) =>
      loadClaimedInterviewAnswerPayload(c, owner, job.id, d.leaseOwner));
    if (!answer.stillClaimed) return 'idle';
    answerPayload = answer.payload;
  }
  // **预留租约续约(C1;北极星:活会话不被对账误扫)**:本 worker 正推进此面试的 job → 证明 liveness,把预留租约(key=interviewId,与 begin 预留同键)往后推。
  // 长面试跨多轮、用户思考间隔可 >1800s 预留租约 → 每领一 job 续一次,活会话绝不被 commerce reconcile 当孤儿回收。
  // 仅对仍 reserved 有效(已 confirmed/released → 0 行 → false,无害);原子 UPDATE 复核 lease → 与 sweep 无 TOCTOU。续约失败不阻断处理(记日志,对账兜底)。
  await asPrincipal(d.pool, owner, (c) => renewReservationLease(c, owner, job.interviewId, DEFAULT_LEASE_SECONDS))
    .catch((err) => console.error('reservation lease renew failed', job.interviewId, (err as any)?.code ?? err));
  let graphFence: InterviewGraphFence | undefined;
  // 心跳:跑图/模型可能慢(>120s 租约),续租避免被 reaper 误判崩溃而重领(=并发双跑同一面试)。
  // **同拍续预留租约(C1 审计中-1)**:单个 job 若处理 >1800s(慢模型/长 start 图),预留租约会在 job 仍在飞时过期 →
  //   被 commerce reconcile 误扫退款 → 收尾 confirm 撞 already_released 免费交付。心跳期间一并续预留租约,活 job 全程护住预留。
  //   续预留返回值不影响心跳存续(以 job 租约为准:job 租约丢了才停);预留仅 reserved 有效(终态 0 行,无害)。
  const hb = startHeartbeat(() => asPrincipal(d.pool, owner, async (c) => {
    const jobAlive = await renewInterviewJobLease(c, owner, job.id, d.leaseOwner);
    await renewReservationLease(c, owner, job.interviewId, DEFAULT_LEASE_SECONDS);
    // graph lease 与 job lease 同拍续；续 graph 失败会令 heartbeat 停止，业务投影处的
    // requireCurrentFence 会拒绝该 worker 的后续写入。
    const graphAlive = !graphFence || await renewInterviewGraphFence(c, graphFence);
    return jobAlive && graphAlive;
  }));
  // v50 gate 后取得的 reqId 缺失/非串容忍 → undefined,不进 ALS → invoke 落 NULL,不崩。
  const requestId = requestContext.requestId;
  const inReqCtx = <R>(fn: () => Promise<R>): Promise<R> => (requestId ? requestIdStore.run(requestId, fn) : fn());
  try {
    return await inReqCtx(async () => {   // 整段处理跑在 reqId 上下文:深埋的每个 invoke 自动带上本次请求的 reqId
      if (d.adaptive) {
        // 存快照：await/lease callback 后 TypeScript 和运行时都不能假设外层可选配置仍是同一对象。
        const adaptive = d.adaptive;
        const localRetrieve = (q: string) => adaptive.localRetrieve(owner, q);   // 闭成本 owner 专属
        // 每次 claim 都新建固定 skill 目录，因此预算不跨 owner/interview/job 共享；模型没有
        // 可控的“工具名→执行器”旁路。一个 job 只推进一个 pending question，RAG/深检索各至多一次。
        const research = createInterviewResearchSkills({
          localRetrieve,
          webExplore: adaptive.webExplore,
          deepResearch: adaptive.deepResearch,
        }, {
          enabled: adaptive.deepResearch ? ['rag.retrieve', 'deep.research'] : ['rag.retrieve', 'web.explore'],
          maxCallsPerSkill: { 'rag.retrieve': 1, 'web.explore': 1, 'deep.research': 1 },
        });
        // P0: advisory lock 覆盖 invoke 全程，ai_graph_run lease/version 是可审计 fence；第二 worker 不得并发 Command(resume)。
        const checkpointEnrollment = await asPrincipal(d.pool, owner, (c) => enrollCheckpointThread(c, owner, job.interviewId));
        const fenced = await withInterviewGraphFence(d.pool, owner, job.interviewId, `${d.leaseOwner}:${job.id}`, async (fence) => withCheckpointAccess({
          owner, threadId: checkpointEnrollment.threadId, fenceEpoch: checkpointEnrollment.fenceEpoch,
        }, async () => {
          graphFence = fence;
          const life = {
            pool: d.pool, cp: d.cp, owner, interviewId: job.interviewId, model: d.model, fastModel: d.fastModel,
            localRetrieve: research.retrieve, webExplore: research.exploreWeb,
            deepResearch: adaptive.deepResearch ? research.deepResearch : undefined,
            researchBoundary: research.researchBoundary,
            competencyKeywords: adaptive.competencyKeywords, maxTurns: adaptive.maxTurns, absoluteMaxTurns: adaptive.absoluteMaxTurns, graphObserver: adaptive.graphObserver, fence,
            onBeforeResumeProfileHydration: adaptive.onBeforeResumeProfileHydration,
          };
          if (job.kind === 'start') {
            // `resume_id` is the sole source locator. Never revive a
            // historical job by parsing mutable JSON: it could silently
            // re-associate erased or cross-owner content.
            const resumeId = job.resumeId;
            const resumePrivacyEpoch = job.resumePrivacyEpoch;
            if (typeof resumeId !== 'string' || !resumeId || resumePrivacyEpoch === null)
              throw Object.assign(new Error('interview_resume_reference_missing'), { code: 'interview_resume_reference_missing' });
            const decrypt = d.decryptResume ?? decryptActiveResumeBlob;
            const raw = await asPrincipal(d.pool, owner, (c) => decrypt(c, owner, resumeId, resumePrivacyEpoch));
            await startAdaptiveInterview(life, adaptive.role ?? '技术岗', ingestResume(raw).facts);
          } else {
            await submitAdaptiveAnswer(life, answerPayload as any);
          }
        }));
        if (!fenced.acquired) {
          await asPrincipal(d.pool, owner, (c) => requeueInterviewJob(c, owner, job.id, d.leaseOwner));
          return 'idle';
        }
      }
      await asPrincipal(d.pool, owner, (c) => markJobDone(c, owner, job.id, d.leaseOwner));
      return job.kind;
    });
  } catch (e: any) {
    // durable fence 失效时，旧 worker 的 graph checkpoint 可能已经前进、但业务投影事务被
    // requireCurrentFence 整体回滚。此时不能把一次可恢复的 lease 交接误判为业务失败/退款：
    // 归还同一 job，下一持有者会从 checkpoint 识别 alreadyApplied 并只补投影。
    if (e?.code === 'graph_fence_lost') {
      const requeued = await asPrincipal(d.pool, owner, (c) => requeueInterviewJob(c, owner, job.id, d.leaseOwner));
      if (requeued) return 'idle';
    }
    // **租约守卫**在共享 helper 内：若 job 已被重领/终态，CAS=0，绝不发假
    // unavailable 或释放现持有者的预留额度。
    await failClaimedInterviewJob(d, owner, job, e);
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
      try {
        await terminalizeUnsettledInterview(c, owner, interviewId, 'worker_died');
      } catch (terminalError: any) {
        getMetrics().inc(METRIC.refundFailed);
        throw terminalError;
      }
    }
    return { requeued: res.requeued, failed: res.failed };
  });
}

/** 一拍调度:受限网关只枚举 owner id，随后每 owner 立即回到 RLS 事务处理。 */
export async function interviewDispatchTick(d: ConsumerDeps): Promise<{ owners: number; requeued: number; failed: number }> {
  const owners = await gatewayDispatchOwners(d.pool, 'interview');
  let requeued = 0, failed = 0;
  for (const o of owners) {
    const r = await reapStuckInterviewJobs(d, o);   // 先收割:超限终结+发终态事件+退款;未超限 requeue → 同拍被 drain 重领
    requeued += r.requeued; failed += r.failed;
    await drainOwnerJobs(d, o);
  }
  return { owners: owners.length, requeued, failed };
}

/** 常驻消费循环(可优雅排空:stop() 等当前 tick 跑完,滚动部署不丢在飞 job)。 */
export function runInterviewConsumer(d: ConsumerDeps, intervalMs = 5000) {
  return runDrainLoop(async () => { await interviewDispatchTick(d); }, intervalMs);
}

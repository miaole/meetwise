/**
 * RAG-FUNNEL-03 / ROUTE-01 岗位意图路由：持久化状态机 + CAS + RLS + 事务 outbox。
 *
 * PostgreSQL 是 route 决策的权威事实源。真实模型调用是受控确定性 seam（proof 注入 fake
 * 输出），生产由 MODEL-OP-01 的 typed binding 接管；本模块把"外发前持久化 model_prepared
 * 意图 + 外发后 result_validated/known_not_sent/dispatched_unknown/validation_rejected 终态"
 * 这条状态机骨架先落库，模型本身可替换。
 *
 * 安全规则（编码在此）：
 *  - revision 只存 canonical digest + input HMAC（服务端派生），trackId/weight/confidence/
 *    override 结构上无处可写；
 *  - 同一 (job, revision) 最多 1 次模型外发：route_pending 被 FOR UPDATE 锁定后先落
 *    model_prepared，再调用 seam；任何终态都不再重发；
 *  - dispatched_unknown / known_not_sent / validation_rejected 是 sticky 终态，永不自动重试；
 *  - binding 只可绑 route_decided 的版本；snapshot 是 binding 的不可变副本；
 *  - route 事件 (job_id, revision, event_seq) 与消费事件 (candidate_user_id, event_seq)
 *    各自单 owner 单调追加，事务内分配 event_seq，无跨 owner 读 MAX。
 */
import { createHmac, randomUUID } from 'node:crypto';
import type { PoolClient as Client } from 'pg';
import { asPrincipal, type DbPool } from './principal.ts';
import {
  TAXONOMY_V1_LEAVES, JOB_ROUTE_TAXONOMY_VERSION, JOB_ROUTE_POLICY_VERSION,
  canonicalJobSemanticDigest, classifyJobByRule, validateModelRouteOutput,
  jobRouteDecisionHash, type JobRouteAllocation, type JobRouteModelOutput,
} from '@meetwise/domain';

export const JOB_SEMANTIC_REVISION_STATUSES = ['route_pending', 'rule_decided', 'model_prepared', 'result_validated', 'route_decided', 'route_unresolved'] as const;
export type JobSemanticRevisionStatus = (typeof JOB_SEMANTIC_REVISION_STATUSES)[number];

export const JOB_ROUTE_ATTEMPT_OUTCOMES = ['rule_decided', 'result_validated', 'known_not_sent', 'dispatched_unknown', 'validation_rejected'] as const;
export type JobRouteAttemptOutcome = (typeof JOB_ROUTE_ATTEMPT_OUTCOMES)[number];

const INPUT_HMAC_VERSION = 'job-route-input:v1';

function codeError(code: string): Error { return Object.assign(new Error(code), { code }); }

/** 输入 HMAC（独立密钥）：证明 revision 由可信服务派生，调用方伪造 digest 也过不了重校验。 */
function computeJobInputHmac(semanticDigest: string): string {
  const secret = process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY;
  if (!secret || secret.length < 32) throw new Error('job_route_input_hash_key_missing');
  return createHmac('sha256', secret).update(JSON.stringify({ v: INPUT_HMAC_VERSION, semanticDigest })).digest('hex');
}

function toJsonb(allocations: readonly JobRouteAllocation[]): string {
  return JSON.stringify(allocations.map((a) => ({ leafTrackId: a.leafTrackId, allocationBps: a.allocationBps })));
}

/* ─────────────────────────── revision（不可变语义修订） ─────────────────────────── */

/** 计算下一个 revision（= max+1）。调用方必须已持有 job_posting 的行锁（updateJob）或新岗位排他性（createJob）。 */
async function nextJobRevision(c: Client, jobId: string): Promise<number> {
  const r = await c.query('SELECT COALESCE(MAX(revision),0)+1 AS n FROM job_semantic_revision WHERE job_id=$1', [jobId]);
  return Number(r.rows[0]?.n ?? 1);
}

async function appendRouteEvent(c: Client, e: {
  jobId: string; owner: string; revision: number; fromStatus: string | null; toStatus: string;
  reason: string | null; decisionId: string | null;
}): Promise<number> {
  const r = await c.query(
    `INSERT INTO job_route_event(job_id,owner_user_id,revision,event_seq,decision_id,from_status,to_status,reason)
     SELECT $1, $2, $3, COALESCE(MAX(event_seq),0)+1, $4, $5, $6, $7
       FROM job_route_event WHERE job_id=$1 AND revision=$3
     RETURNING event_seq`,
    [e.jobId, e.owner, e.revision, e.decisionId, e.fromStatus, e.toStatus, e.reason],
  );
  return Number(r.rows[0]?.event_seq);
}

/**
 * 岗位创建/编辑时自动写入新 revision（route_pending）。内容只以 canonical digest + HMAC 存，
 * 不含任何路由参数列。
 */
export async function createJobSemanticRevision(c: Client, owner: string, jobId: string, input: {
  title: string; description?: string; competencies?: string[];
}): Promise<{ revision: number; status: JobSemanticRevisionStatus }> {
  const title = input.title.trim();
  const description = input.description ?? '';
  const competencies = input.competencies ?? [];
  const digest = canonicalJobSemanticDigest({ title, description, competencies });
  const hmac = computeJobInputHmac(digest);
  const revision = await nextJobRevision(c, jobId);
  await c.query(
    `INSERT INTO job_semantic_revision(job_id,owner_user_id,revision,semantic_digest,input_hmac,status)
     VALUES($1,$2,$3,$4,$5,'route_pending')
     ON CONFLICT (job_id, revision) DO NOTHING`,
    [jobId, owner, revision, digest, hmac],
  );
  await appendRouteEvent(c, { jobId, owner, revision, fromStatus: null, toStatus: 'route_pending', reason: null, decisionId: null });
  return { revision, status: 'route_pending' };
}

/* ─────────────────────────── 分类漏斗（0 或 1 次模型外发） ─────────────────────────── */

export interface JobRouteModelInput { jobId: string; revision: number; title: string; description: string; competencies: string[] }

/** RAG-03 受控确定性 seam；生产由 MODEL-OP-01 typed binding 提供真实实现。 */
export type JobRouteModelClassify = (input: JobRouteModelInput) => Promise<JobRouteModelOutput>;

export type ClassifyJobRouteResult =
  | { status: 'route_decided'; decisionId: string; attemptOutcome: 'rule_decided' | 'result_validated'; modelCalls: number }
  | { status: 'route_unresolved'; decisionId: string; attemptOutcome: 'known_not_sent' | 'dispatched_unknown' | 'validation_rejected'; reasonCodes: string[]; modelCalls: number }
  | { status: 'noop'; reason: 'revision_not_found' | 'already_decided' | 'already_unresolved' | 'stale_revision' | 'not_pending' };

async function writeRouteUnresolved(c: Client, args: {
  jobId: string; owner: string; revision: number; attemptOutcome: JobRouteAttemptOutcome; reasonCodes: string[];
}): Promise<{ decisionId: string }> {
  const decisionId = 'rd_' + randomUUID();
  const decisionHash = jobRouteDecisionHash({
    jobId: args.jobId, revision: args.revision,
    taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION, policyVersion: JOB_ROUTE_POLICY_VERSION,
    allocations: [], confidenceBps: null, marginBps: null,
    attemptOutcome: args.attemptOutcome, reasonCodes: args.reasonCodes,
  });
  await c.query(
    `INSERT INTO job_route_decision(id,job_id,owner_user_id,revision,route_outcome,attempt_outcome,taxonomy_version,policy_version,allocations,confidence_bps,margin_bps,reason_codes,decision_hash)
     VALUES($1,$2,$3,$4,'route_unresolved',$5,$6,$7,'[]'::jsonb,NULL,NULL,$8,$9)`,
    [decisionId, args.jobId, args.owner, args.revision, args.attemptOutcome,
      JOB_ROUTE_TAXONOMY_VERSION, JOB_ROUTE_POLICY_VERSION, args.reasonCodes, decisionHash],
  );
  await c.query(
    `UPDATE job_semantic_revision SET status='route_unresolved', updated_at=clock_timestamp()
      WHERE job_id=$1 AND revision=$2 AND status='model_prepared'`,
    [args.jobId, args.revision],
  );
  await appendRouteEvent(c, {
    jobId: args.jobId, owner: args.owner, revision: args.revision,
    fromStatus: 'model_prepared', toStatus: 'route_unresolved', reason: args.attemptOutcome, decisionId,
  });
  return { decisionId };
}

async function writeRouteDecided(c: Client, args: {
  jobId: string; owner: string; revision: number; attemptOutcome: 'rule_decided' | 'result_validated';
  allocations: JobRouteAllocation[]; confidenceBps: number; marginBps: number;
  fromStatus: 'rule_decided' | 'result_validated';
}): Promise<{ decisionId: string }> {
  const decisionId = 'rd_' + randomUUID();
  const decisionHash = jobRouteDecisionHash({
    jobId: args.jobId, revision: args.revision,
    taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION, policyVersion: JOB_ROUTE_POLICY_VERSION,
    allocations: args.allocations, confidenceBps: args.confidenceBps, marginBps: args.marginBps,
    attemptOutcome: args.attemptOutcome, reasonCodes: [],
  });
  await c.query(
    `INSERT INTO job_route_decision(id,job_id,owner_user_id,revision,route_outcome,attempt_outcome,taxonomy_version,policy_version,allocations,confidence_bps,margin_bps,reason_codes,decision_hash)
     VALUES($1,$2,$3,$4,'route_decided',$5,$6,$7,$8,$9,$10,'{}',$11)`,
    [decisionId, args.jobId, args.owner, args.revision, args.attemptOutcome,
      JOB_ROUTE_TAXONOMY_VERSION, JOB_ROUTE_POLICY_VERSION, toJsonb(args.allocations),
      args.confidenceBps, args.marginBps, decisionHash],
  );
  await c.query(
    `UPDATE job_semantic_revision SET status='route_decided', updated_at=clock_timestamp()
      WHERE job_id=$1 AND revision=$2 AND status=$3`,
    [args.jobId, args.revision, args.fromStatus],
  );
  await appendRouteEvent(c, {
    jobId: args.jobId, owner: args.owner, revision: args.revision,
    fromStatus: args.fromStatus, toStatus: 'route_decided', reason: null, decisionId,
  });
  return { decisionId };
}

/**
 * 分类漏斗：rules（0 次）→ seam（最多 1 次）→ 服务端双重校验 → 终态。同一 (job, revision)
 * 最多 1 次外发；任何终态或非 route_pending 都 noop，绝不重发。
 */
export async function classifyJobRoute(pool: DbPool, owner: string, jobId: string, revision: number, deps: {
  modelClassify: JobRouteModelClassify;
}): Promise<ClassifyJobRouteResult> {
  return asPrincipal(pool, owner, async (c) => {
    const rev = await c.query(
      'SELECT status, semantic_digest, input_hmac FROM job_semantic_revision WHERE job_id=$1 AND revision=$2 FOR UPDATE',
      [jobId, revision],
    );
    if (rev.rowCount === 0) return { status: 'noop', reason: 'revision_not_found' } as const;
    const r = rev.rows[0] as { status: JobSemanticRevisionStatus; semantic_digest: string; input_hmac: string };
    if (r.status === 'route_decided') return { status: 'noop', reason: 'already_decided' } as const;
    if (r.status === 'route_unresolved') return { status: 'noop', reason: 'already_unresolved' } as const;
    if (r.status !== 'route_pending') return { status: 'noop', reason: 'not_pending' } as const;

    const job = await c.query(
      'SELECT title, description, competencies FROM job_posting WHERE id=$1 AND owner_user_id=$2',
      [jobId, owner],
    );
    if (job.rowCount === 0) return { status: 'noop', reason: 'revision_not_found' } as const;
    const j = job.rows[0] as { title: string; description: string | null; competencies: unknown };
    const competencies: string[] = Array.isArray(j.competencies) ? (j.competencies as unknown[]).map(String) : [];
    const input = { jobId, revision, title: j.title, description: j.description ?? '', competencies };
    const digest = canonicalJobSemanticDigest(input);
    // 岗位内容与 revision 不一致 = 岗位已被编辑成新 revision，本 revision 已过期，fail-closed。
    if (digest !== r.semantic_digest) return { status: 'noop', reason: 'stale_revision' } as const;
    if (computeJobInputHmac(digest) !== r.input_hmac) throw codeError('job_route_input_hmac_mismatch');

    // ── rules 路径：唯一 leaf → route_decided，0 次模型外发 ──
    const ruleLeaf = classifyJobByRule(input);
    if (ruleLeaf) {
      await c.query(
        `UPDATE job_semantic_revision SET status='rule_decided', updated_at=clock_timestamp()
          WHERE job_id=$1 AND revision=$2 AND status='route_pending'`,
        [jobId, revision],
      );
      await appendRouteEvent(c, { jobId, owner, revision, fromStatus: 'route_pending', toStatus: 'rule_decided', reason: 'rule_unique_leaf', decisionId: null });
      const { decisionId } = await writeRouteDecided(c, {
        jobId, owner, revision, attemptOutcome: 'rule_decided',
        allocations: [{ leafTrackId: ruleLeaf, allocationBps: 10000 }],
        confidenceBps: 10000, marginBps: 10000, fromStatus: 'rule_decided',
      });
      return { status: 'route_decided', decisionId, attemptOutcome: 'rule_decided', modelCalls: 0 };
    }

    // ── 模型路径：先持久化 model_prepared 意图，再恰一次外发 ──
    await c.query(
      `UPDATE job_semantic_revision SET status='model_prepared', updated_at=clock_timestamp()
        WHERE job_id=$1 AND revision=$2 AND status='route_pending'`,
      [jobId, revision],
    );
    await appendRouteEvent(c, { jobId, owner, revision, fromStatus: 'route_pending', toStatus: 'model_prepared', reason: 'rule_ambiguous', decisionId: null });

    let output: JobRouteModelOutput;
    try {
      output = await deps.modelClassify(input);
    } catch (err) {
      // 只有 seam 显式报告 dispatched_unknown 才落 unresolved；其余错误 rethrow（回滚，revision 仍 pending 可重试）。
      if ((err as { code?: unknown } | undefined)?.code !== 'dispatched_unknown') throw err;
      const { decisionId } = await writeRouteUnresolved(c, { jobId, owner, revision, attemptOutcome: 'dispatched_unknown', reasonCodes: ['dispatched_unknown'] });
      return { status: 'route_unresolved', decisionId, attemptOutcome: 'dispatched_unknown', reasonCodes: ['dispatched_unknown'], modelCalls: 1 };
    }

    // 模型主动含原因码 = 明确拒分（known_not_sent，未进入评分路径）。
    if (Array.isArray(output?.reasonCodes) && output.reasonCodes.length > 0) {
      const reasonCodes = output.reasonCodes.slice();
      const { decisionId } = await writeRouteUnresolved(c, { jobId, owner, revision, attemptOutcome: 'known_not_sent', reasonCodes });
      return { status: 'route_unresolved', decisionId, attemptOutcome: 'known_not_sent', reasonCodes, modelCalls: 1 };
    }

    const validated = validateModelRouteOutput(output);
    // `ok === false` (not `!ok`) keeps the discriminant narrowed under
    // strictNullChecks:false, which is how apps/api compiles this file.
    if (validated.ok === false) {
      const { decisionId } = await writeRouteUnresolved(c, { jobId, owner, revision, attemptOutcome: 'validation_rejected', reasonCodes: validated.reasons });
      return { status: 'route_unresolved', decisionId, attemptOutcome: 'validation_rejected', reasonCodes: validated.reasons, modelCalls: 1 };
    }

    // ── result_validated → route_decided ──
    await c.query(
      `UPDATE job_semantic_revision SET status='result_validated', updated_at=clock_timestamp()
        WHERE job_id=$1 AND revision=$2 AND status='model_prepared'`,
      [jobId, revision],
    );
    await appendRouteEvent(c, { jobId, owner, revision, fromStatus: 'model_prepared', toStatus: 'result_validated', reason: null, decisionId: null });
    const { decisionId } = await writeRouteDecided(c, {
      jobId, owner, revision, attemptOutcome: 'result_validated',
      allocations: validated.allocations, confidenceBps: validated.confidenceBps, marginBps: validated.marginBps,
      fromStatus: 'result_validated',
    });
    return { status: 'route_decided', decisionId, attemptOutcome: 'result_validated', modelCalls: 1 };
  });
}

/* ─────────────────────────── 绑定 + snapshot（消费链） ─────────────────────────── */

async function appendConsumptionEvent(c: Client, e: {
  candidateUserId: string; kind: 'binding' | 'snapshot'; jobId: string; revision: number;
  applicationId: string | null; interviewId: string | null; fromStatus: string; toStatus: string;
}): Promise<number> {
  const r = await c.query(
    `INSERT INTO route_consumption_event(candidate_user_id,event_seq,kind,job_id,revision,application_id,interview_id,from_status,to_status)
     SELECT $1, COALESCE(MAX(event_seq),0)+1, $2, $3, $4, $5, $6, $7, $8
       FROM route_consumption_event WHERE candidate_user_id=$1
     RETURNING event_seq`,
    [e.candidateUserId, e.kind, e.jobId, e.revision, e.applicationId, e.interviewId, e.fromStatus, e.toStatus],
  );
  return Number(r.rows[0]?.event_seq);
}

export type BindApplicationRouteResult = { status: 'bound' } | { status: 'already_bound' } | { status: 'route_not_decided' };

/**
 * 申请/受邀事务里绑定**最新 route_decided 版本**（只读最新 decided 的 decision，复制其 allocations）。
 * 幂等（application_id 唯一）。emitConsumptionEvent 只对候选人侧（apply）为 true；招聘方（invite）
 * 不能写候选人的消费事件流，其绑定审计由不可变 binding 行 + route 事件承担。
 */
export async function bindApplicationRoute(c: Client, input: {
  candidateUserId: string; recruiterUserId: string; jobId: string; applicationId: string; emitConsumptionEvent: boolean;
}): Promise<BindApplicationRouteResult> {
  const decided = await c.query(
    `SELECT id, revision, decision_hash, allocations
       FROM job_route_decision
      WHERE job_id=$1 AND route_outcome='route_decided'
      ORDER BY revision DESC LIMIT 1`,
    [input.jobId],
  );
  if (decided.rowCount === 0) return { status: 'route_not_decided' };
  const d = decided.rows[0] as { id: string; revision: number; decision_hash: string; allocations: unknown };
  const allocations = JSON.stringify(d.allocations ?? []);
  const ins = await c.query(
    `INSERT INTO application_route_binding(application_id,candidate_user_id,recruiter_user_id,job_id,revision,decision_id,route_digest,allocations,status)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,'application_bound')
     ON CONFLICT (application_id) DO NOTHING
     RETURNING application_id`,
    [input.applicationId, input.candidateUserId, input.recruiterUserId, input.jobId, d.revision, d.id, d.decision_hash, allocations],
  );
  if ((ins.rowCount ?? 0) === 0) return { status: 'already_bound' };
  if (input.emitConsumptionEvent) {
    await appendConsumptionEvent(c, {
      candidateUserId: input.candidateUserId, kind: 'binding', jobId: input.jobId, revision: d.revision,
      applicationId: input.applicationId, interviewId: null, fromStatus: 'route_decided', toStatus: 'application_bound',
    });
  }
  return { status: 'bound' };
}

export type SnapshotInterviewRouteResult = { status: 'snapshotted' } | { status: 'already_snapshotted' } | { status: 'no_binding' };

/**
 * 面试启动事务把 binding 复制到不可变 snapshot。岗位后来编辑（新 revision）不改变此 snapshot。
 * 无 binding → no_binding（调用方必须拒绝启动，避免消费未决路由）。
 */
export async function snapshotInterviewRoute(c: Client, candidate: string, interviewId: string, applicationId: string): Promise<SnapshotInterviewRouteResult> {
  const binding = await c.query(
    `SELECT job_id, revision, decision_id, route_digest, allocations
       FROM application_route_binding
      WHERE application_id=$1 AND candidate_user_id=$2`,
    [applicationId, candidate],
  );
  if (binding.rowCount === 0) return { status: 'no_binding' };
  const b = binding.rows[0] as { job_id: string; revision: number; decision_id: string; route_digest: string; allocations: unknown };
  const allocations = JSON.stringify(b.allocations ?? []);
  const ins = await c.query(
    `INSERT INTO interview_route_snapshot(interview_id,candidate_user_id,application_id,job_id,revision,decision_id,route_digest,allocations,status)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,'interview_snapshotted')
     ON CONFLICT (interview_id) DO NOTHING
     RETURNING interview_id`,
    [interviewId, candidate, applicationId, b.job_id, b.revision, b.decision_id, b.route_digest, allocations],
  );
  if ((ins.rowCount ?? 0) === 0) return { status: 'already_snapshotted' };
  await appendConsumptionEvent(c, {
    candidateUserId: candidate, kind: 'snapshot', jobId: b.job_id, revision: b.revision,
    applicationId, interviewId, fromStatus: 'application_bound', toStatus: 'interview_snapshotted',
  });
  return { status: 'snapshotted' };
}

/* ─────────────────────────── 读侧（图内 planner 消费） ─────────────────────────── */

export interface InterviewRouteSnapshotView {
  interviewId: string; jobId: string; revision: number; decisionId: string;
  routeDigest: string; allocations: JobRouteAllocation[];
}

/** 图内 planner 读取 snapshot 的合法 leaf 集合（服务端校验 planner 输出必须属于它）。 */
export async function getInterviewRouteSnapshot(c: Client, candidate: string, interviewId: string): Promise<InterviewRouteSnapshotView | null> {
  const r = await c.query(
    `SELECT interview_id, job_id, revision, decision_id, route_digest, allocations
       FROM interview_route_snapshot
      WHERE interview_id=$1 AND candidate_user_id=$2`,
    [interviewId, candidate],
  );
  if (r.rowCount === 0) return null;
  const row = r.rows[0] as { interview_id: string; job_id: string; revision: number; decision_id: string; route_digest: string; allocations: unknown };
  const allocations = (Array.isArray(row.allocations) ? row.allocations : []) as unknown as { leafTrackId: string; allocationBps: number }[];
  return {
    interviewId: row.interview_id, jobId: row.job_id, revision: row.revision,
    decisionId: row.decision_id, routeDigest: row.route_digest,
    allocations: allocations.map((a) => ({ leafTrackId: String(a.leafTrackId), allocationBps: Number(a.allocationBps) })),
  };
}

export { TAXONOMY_V1_LEAVES, JOB_ROUTE_TAXONOMY_VERSION, JOB_ROUTE_POLICY_VERSION };

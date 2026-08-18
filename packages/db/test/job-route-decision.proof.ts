/**
 * RAG-FUNNEL-03 / ROUTE-01 岗位意图路由 proof（真隔离 PostgreSQL + 全迁移链）。
 *
 * 把 worker 里硬编码的 `技术岗` 升级为「岗位语义意图自动路由」的持久化事实链：
 *   JobSemanticRevision(不可变) → 分类漏斗(0 或 1 次模型外发) → route_decided/unresolved
 *   → ApplicationRouteBinding(只绑 decided 版本) → InterviewRouteSnapshot(不可变副本)
 *   → 图内 planner/scheduler(只选 snapshot 内的 leaf，按轮 weighted-deficit)。
 *
 * 四条承重原语全部打真 PG 行，绝不用 mock 计数替代：
 *   ① CAS ② principal 作用域幂等 ③ RLS owner/tenant 隔离 ④ 事务 outbox + 单调 eventSeq。
 * 真实模型调用是受控确定性 seam（proof 注入 fake 输出），生产由 MODEL-OP-01 typed binding 接管。
 *
 * pnpm rag03-route:prove   (node scripts/run-e2e-isolated.mjs rag03-route:prove:raw)
 */
import { randomUUID } from 'node:crypto';
import {
  assertIsolatedTestTarget, createPool, asPrincipal,
  createJob, updateJob, applyToJob, inviteCandidate, startApplicationInterview,
  classifyJobRoute, getInterviewRouteSnapshot,
  type StartApplicationResult,
} from '../src/index.ts';
import {
  classifyJobByRule, validatePlannerOutput, planWeightedDeficitRounds,
} from '@meetwise/domain';

// run-e2e-isolated.mjs 会剥离操作者 shell 里的真实 HMAC 密钥；proof 用固定测试键（≥32 字符）。
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY = 'rag03-job-route-input-hmac-proof-key-not-production-01';

const pool = createPool();
let fail = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

type ModelOutput = {
  allocations: { leafTrackId: string; allocationBps: number }[];
  confidenceBps: number;
  marginBps: number;
  reasonCodes: string[];
};

type DecisionRow = {
  route_outcome: string; attempt_outcome: string;
  allocations: { leafTrackId: string; allocationBps: number }[];
  confidence_bps: number | null; margin_bps: number | null; reason_codes: string[];
};

/** 受控确定性 seam：计数外发次数，返回/抛出注入的模型结果。 */
function mkSeam(impl: () => Promise<ModelOutput>): { classify: (input: unknown) => Promise<ModelOutput>; calls: () => number } {
  let n = 0;
  return {
    classify: async (input: unknown) => { n++; void input; return impl(); },
    calls: () => n,
  };
}

async function rev(jobId: string): Promise<number> {
  const r = await pool.query('SELECT COALESCE(MAX(revision),0)::int AS n FROM job_semantic_revision WHERE job_id=$1', [jobId]);
  return r.rows[0]?.n ?? 0;
}

async function decision(jobId: string): Promise<DecisionRow | undefined> {
  const r = await pool.query(
    'SELECT route_outcome, attempt_outcome, allocations, confidence_bps, margin_bps, reason_codes FROM job_route_decision WHERE job_id=$1 ORDER BY revision DESC LIMIT 1',
    [jobId],
  );
  return r.rows[0] as DecisionRow | undefined;
}

function interviewIdOf(r: StartApplicationResult): string | undefined {
  return r.status === 'started' || r.status === 'reused' ? r.interviewId : undefined;
}

const TAG = 'rag03_' + Math.random().toString(36).slice(2, 8);
const recA = `${TAG}_recA`, recB = `${TAG}_recB`, cand = `${TAG}_cand`, cand2 = `${TAG}_cand2`;
const resumeCand = randomUUID(), resumeCand2 = randomUUID();

/** 无任何 leaf 信号的歧义岗位：rule 返回 null，强制走模型路径。 */
const AMBIGUOUS = { title: '资深系统工程师', description: '负责核心系统与基础架构', competencies: ['系统设计', '服务治理'] };
/** 唯一命中 backend/nodejs 的岗位（刻意不含「后端/backend」等 backend/general 信号）。 */
const NODEJS_ONLY = { title: 'Node.js 服务端工程师', description: '使用 NestJS 构建服务', competencies: ['nestjs', 'express', 'koa'] };

async function runModelCase(fields: { title: string; description: string; competencies: string[] }, output: ModelOutput) {
  const job = await asPrincipal(pool, recA, (c) => createJob(c, recA, fields));
  const s = mkSeam(async () => output);
  const result = await classifyJobRoute(pool, recA, job.id, await rev(job.id), { modelClassify: s.classify });
  return { result, calls: s.calls() };
}

/**
 * 绕过 domain 校验、以 owner 身份直插一条 route_decided decision，断言 DB CHECK 的数值 backstop 拒绝。
 * 返回 true = 被拒（通过）；false = 竟然插入成功（失败）。
 */
async function tryRawDecided(
  jobId: string, owner: string, revision: number,
  allocs: { leafTrackId: string; allocationBps: number }[],
  confidenceBps: number, marginBps: number,
): Promise<boolean> {
  try {
    await asPrincipal(pool, owner, (c) => c.query(
      `INSERT INTO job_route_decision(id,job_id,owner_user_id,revision,route_outcome,attempt_outcome,taxonomy_version,policy_version,allocations,confidence_bps,margin_bps,reason_codes,decision_hash)
       VALUES($1,$2,$3,$4,'route_decided','result_validated','v1','calibration-2026-08-frozen:v1',$5::jsonb,$6,$7,'{}',$8)`,
      ['rd_' + randomUUID(), jobId, owner, revision, JSON.stringify(allocs), confidenceBps, marginBps, 'ab'.repeat(32)],
    ));
    return false;
  } catch {
    return true;
  }
}

async function main() {
  await assertIsolatedTestTarget(pool);

  for (const [id, owner] of [[resumeCand, cand], [resumeCand2, cand2]] as const) {
    await pool.query("INSERT INTO resume(id, owner_user_id, status, content_sha) VALUES ($1,$2,'ingested',$3)", [id, owner, `${TAG}:${owner}`]);
  }

  section('① rule 唯一 leaf → route_decided，0 次模型外发；revision 结构上无可写路由参数');
  const jobRule = await asPrincipal(pool, recA, (c) => createJob(c, recA, NODEJS_ONLY));
  const ruleSeam = mkSeam(async () => { throw new Error('rule path must never call model'); });
  const r1 = await classifyJobRoute(pool, recA, jobRule.id, await rev(jobRule.id), { modelClassify: ruleSeam.classify });
  A('规则唯一 leaf → route_decided / rule_decided，seam 0 次外发',
    r1.status === 'route_decided' && r1.attemptOutcome === 'rule_decided' && ruleSeam.calls() === 0);
  const d1 = await decision(jobRule.id);
  A('规则 decision allocations = 单叶 backend/nodejs 10000 bps',
    d1?.route_outcome === 'route_decided' && Array.isArray(d1.allocations) && d1.allocations.length === 1
    && d1.allocations[0]!.leafTrackId === 'backend/nodejs' && d1.allocations[0]!.allocationBps === 10000);
  const revRow = (await pool.query('SELECT semantic_digest, input_hmac FROM job_semantic_revision WHERE job_id=$1 AND revision=1', [jobRule.id])).rows[0];
  A('revision 只存 canonical digest + 输入 HMAC（均为 64 hex，且互异）',
    /^[0-9a-f]{64}$/.test(revRow?.semantic_digest ?? '') && /^[0-9a-f]{64}$/.test(revRow?.input_hmac ?? '')
    && revRow?.semantic_digest !== revRow?.input_hmac);
  const revCols = (await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='job_semantic_revision'")).rows.map((r) => r.column_name as string);
  A('revision 表结构无 trackId/weight/confidence/override 列（用户提交的桶参数无处可写）',
    !revCols.some((c) => /track|weight|confidence|override/i.test(c)));

  section('② fullstack/全栈 rule 不扩散；模型 5 桶 → too_broad');
  const fullstackFields = { title: '全栈工程师', description: '负责全栈交付', competencies: ['nodejs', 'java', 'python', 'react'] };
  const jobFs = await asPrincipal(pool, recA, (c) => createJob(c, recA, fullstackFields));
  A('fullstack rule 返回 null（命中多桶，绝不做多桶推断）', classifyJobByRule(fullstackFields) === null);
  const fsSeam = mkSeam(async () => ({
    allocations: [
      { leafTrackId: 'backend/nodejs', allocationBps: 2000 }, { leafTrackId: 'backend/java', allocationBps: 2000 },
      { leafTrackId: 'backend/python', allocationBps: 2000 }, { leafTrackId: 'backend/go', allocationBps: 2000 },
      { leafTrackId: 'frontend/web', allocationBps: 2000 },
    ], confidenceBps: 9000, marginBps: 0, reasonCodes: [],
  }));
  const r2 = await classifyJobRoute(pool, recA, jobFs.id, await rev(jobFs.id), { modelClassify: fsSeam.classify });
  A('模型 5 桶输出 → too_broad → route_unresolved（不扩散为语言桶）',
    r2.status === 'route_unresolved' && r2.attemptOutcome === 'validation_rejected' && r2.reasonCodes.includes('too_broad') && fsSeam.calls() === 1);

  section('③ 模型路径恰 1 次外发 → result_validated → route_decided；allocations sum=10000');
  const jobModel = await asPrincipal(pool, recA, (c) => createJob(c, recA, AMBIGUOUS));
  const modelSeam = mkSeam(async () => ({
    allocations: [{ leafTrackId: 'backend/nodejs', allocationBps: 7000 }, { leafTrackId: 'frontend/web', allocationBps: 3000 }],
    confidenceBps: 8500, marginBps: 4000, reasonCodes: [],
  }));
  const r3 = await classifyJobRoute(pool, recA, jobModel.id, await rev(jobModel.id), { modelClassify: modelSeam.classify });
  A('模型路径恰 1 次外发 → result_validated → route_decided',
    r3.status === 'route_decided' && r3.attemptOutcome === 'result_validated' && modelSeam.calls() === 1);
  const d3 = await decision(jobModel.id);
  const sum3 = (d3?.allocations ?? []).reduce((s, a) => s + a.allocationBps, 0);
  A('decided allocations sum=10000 且 confidence/margin 落库',
    sum3 === 10000 && d3?.confidence_bps === 8500 && d3?.margin_bps === 4000);

  section('④ 同一 (job, revision) 最多 1 次外发（终态 noop）');
  const r3b = await classifyJobRoute(pool, recA, jobModel.id, await rev(jobModel.id), { modelClassify: modelSeam.classify });
  A('二次 classify → noop already_decided，seam 不再被调', r3b.status === 'noop' && r3b.reason === 'already_decided' && modelSeam.calls() === 1);

  section('⑤ 模型输出非法 → route_unresolved（精确原因码，绝不半合法落库）');
  const badSum = await runModelCase(AMBIGUOUS, {
    allocations: [{ leafTrackId: 'backend/nodejs', allocationBps: 7000 }, { leafTrackId: 'frontend/web', allocationBps: 2000 }],
    confidenceBps: 8500, marginBps: 0, reasonCodes: [],
  });
  A('allocations sum≠10000 → route_unresolved(invalid_schema)',
    badSum.result.status === 'route_unresolved' && badSum.result.reasonCodes.includes('invalid_schema') && badSum.calls === 1);
  const minAlloc = await runModelCase(AMBIGUOUS, {
    allocations: [{ leafTrackId: 'backend/nodejs', allocationBps: 9700 }, { leafTrackId: 'frontend/web', allocationBps: 300 }],
    confidenceBps: 8000, marginBps: 0, reasonCodes: [],
  });
  A('min-allocation 超限(<500) → route_unresolved(calibration_failed)',
    minAlloc.result.status === 'route_unresolved' && minAlloc.result.reasonCodes.includes('calibration_failed'));
  const lowConf = await runModelCase(AMBIGUOUS, {
    allocations: [{ leafTrackId: 'backend/nodejs', allocationBps: 7000 }, { leafTrackId: 'frontend/web', allocationBps: 3000 }],
    confidenceBps: 6000, marginBps: 4000, reasonCodes: [],
  });
  A('low-confidence(<7000) → route_unresolved(low_confidence)',
    lowConf.result.status === 'route_unresolved' && lowConf.result.reasonCodes.includes('low_confidence'));
  const conflict = await runModelCase(AMBIGUOUS, {
    allocations: [{ leafTrackId: 'backend/nodejs', allocationBps: 7000 }, { leafTrackId: 'frontend/web', allocationBps: 3000 }],
    confidenceBps: 8500, marginBps: 9000, reasonCodes: [],
  });
  A('margin 与 top1-top2 实际 gap 不符 → route_unresolved(conflict)',
    conflict.result.status === 'route_unresolved' && conflict.result.reasonCodes.includes('conflict'));
  const taxonomy = await runModelCase(AMBIGUOUS, {
    allocations: [{ leafTrackId: 'backend/ruby', allocationBps: 10000 }],
    confidenceBps: 9000, marginBps: 10000, reasonCodes: [],
  });
  A('leaf 不在 taxonomy v1 → route_unresolved(taxonomy_invalid)',
    taxonomy.result.status === 'route_unresolved' && taxonomy.result.reasonCodes.includes('taxonomy_invalid'));

  section('⑤b DB CHECK 数值 backstop（绕过 domain 校验直插，DB 拒非法 decision）');
  const illegalCases: { label: string; allocs: { leafTrackId: string; allocationBps: number }[]; conf: number; margin: number }[] = [
    { label: 'sum≠10000', allocs: [{ leafTrackId: 'backend/nodejs', allocationBps: 7000 }, { leafTrackId: 'frontend/web', allocationBps: 2000 }], conf: 8500, margin: 4000 },
    { label: 'max-leaf>4', allocs: [
      { leafTrackId: 'backend/nodejs', allocationBps: 6000 }, { leafTrackId: 'backend/java', allocationBps: 1000 },
      { leafTrackId: 'backend/go', allocationBps: 1000 }, { leafTrackId: 'backend/python', allocationBps: 1000 },
      { leafTrackId: 'frontend/web', allocationBps: 1000 },
    ], conf: 8500, margin: 5000 },
    { label: 'min-alloc<500', allocs: [{ leafTrackId: 'backend/nodejs', allocationBps: 9700 }, { leafTrackId: 'frontend/web', allocationBps: 300 }], conf: 8500, margin: 9400 },
    { label: 'confidence<7000', allocs: [{ leafTrackId: 'backend/nodejs', allocationBps: 7000 }, { leafTrackId: 'frontend/web', allocationBps: 3000 }], conf: 6000, margin: 4000 },
    { label: 'margin<1000', allocs: [{ leafTrackId: 'backend/nodejs', allocationBps: 7000 }, { leafTrackId: 'frontend/web', allocationBps: 3000 }], conf: 8500, margin: 900 },
  ];
  for (const c of illegalCases) {
    const jobRaw = await asPrincipal(pool, recA, (cc) => createJob(cc, recA, AMBIGUOUS));
    const rejected = await tryRawDecided(jobRaw.id, recA, await rev(jobRaw.id), c.allocs, c.conf, c.margin);
    A(`DB CHECK 拒非法 decision（${c.label}）`, rejected);
  }

  section('⑥ dispatched_unknown 是 sticky 终态，永不自动重发');
  const jobUnknown = await asPrincipal(pool, recA, (c) => createJob(c, recA, AMBIGUOUS));
  const unknownSeam = mkSeam(async () => { throw Object.assign(new Error('external outcome unknown'), { code: 'dispatched_unknown' }); });
  const r6 = await classifyJobRoute(pool, recA, jobUnknown.id, await rev(jobUnknown.id), { modelClassify: unknownSeam.classify });
  A('dispatched_unknown → route_unresolved，恰 1 次外发',
    r6.status === 'route_unresolved' && r6.attemptOutcome === 'dispatched_unknown' && unknownSeam.calls() === 1);
  const r6b = await classifyJobRoute(pool, recA, jobUnknown.id, await rev(jobUnknown.id), { modelClassify: unknownSeam.classify });
  A('二次 classify → noop already_unresolved，seam 不再被调（永不自动重发）',
    r6b.status === 'noop' && r6b.reason === 'already_unresolved' && unknownSeam.calls() === 1);

  section('⑦ 非 route_decided 岗位优雅降级（不抛、不落 snapshot、不死端）');
  const jobPending = await asPrincipal(pool, recA, (c) => createJob(c, recA, AMBIGUOUS));
  const appPending = await asPrincipal(pool, cand, (c) => applyToJob(c, cand, jobPending.id));
  const pendingBind = (await pool.query('SELECT count(*)::int n FROM application_route_binding WHERE application_id=$1', [appPending!.applicationId])).rows[0].n;
  A('未决岗位申请成功但 binding 行 = 0（route_not_decided 不落）', !!appPending && pendingBind === 0);
  const startPending = await asPrincipal(pool, cand, (c) => startApplicationInterview(c, cand, appPending!.applicationId, resumeCand));
  const pendingIv = interviewIdOf(startPending);
  const pendingSnap = (await pool.query('SELECT count(*)::int n FROM interview_route_snapshot WHERE interview_id=$1', [pendingIv])).rows[0].n;
  A('未决岗位 start 不抛、返回 started，但 interview snapshot 行 = 0（优雅降级）',
    pendingIv !== undefined && pendingSnap === 0);
  const pendingSnapView = await asPrincipal(pool, cand, (c) => getInterviewRouteSnapshot(c, cand, pendingIv!));
  A('未决岗位 getInterviewRouteSnapshot = null（图内无 leaf 可消费，显式可探测）', pendingSnapView === null);

  section('⑧ binding 只绑 route_decided 版本；snapshot 不可变（编辑后旧会话不受影响）');
  const jobBind = await asPrincipal(pool, recA, (c) => createJob(c, recA, NODEJS_ONLY));
  const rb = await classifyJobRoute(pool, recA, jobBind.id, await rev(jobBind.id), { modelClassify: mkSeam(async () => { throw new Error('no model'); }).classify });
  A('绑定岗位 rule 路径 route_decided', rb.status === 'route_decided' && rb.attemptOutcome === 'rule_decided');
  const appBind = await asPrincipal(pool, cand, (c) => applyToJob(c, cand, jobBind.id));
  const bindRow = (await pool.query('SELECT revision, route_digest, allocations FROM application_route_binding WHERE application_id=$1', [appBind!.applicationId])).rows[0];
  A('申请绑定最新 route_decided revision 1（route_digest=64 hex，allocations 副本）',
    !!bindRow && Number(bindRow.revision) === 1 && /^[0-9a-f]{64}$/.test(bindRow.route_digest) && bindRow.allocations.length === 1);
  const startBind = await asPrincipal(pool, cand, (c) => startApplicationInterview(c, cand, appBind!.applicationId, resumeCand));
  const bindIv = interviewIdOf(startBind);
  const snapBefore = await asPrincipal(pool, cand, (c) => getInterviewRouteSnapshot(c, cand, bindIv!));
  A('面试启动落 snapshot（revision 1 + 单叶副本）',
    bindIv !== undefined && Number(snapBefore?.revision) === 1 && snapBefore?.allocations.length === 1 && snapBefore?.allocations[0]?.leafTrackId === 'backend/nodejs');
  const edited = await asPrincipal(pool, recA, (c) => updateJob(c, recA, jobBind.id, { title: 'Python 后端工程师', description: 'Django 服务' }));
  A('编辑岗位 → 新 revision 2（route_pending）', !!edited && await rev(jobBind.id) === 2);
  const snapAfter = await asPrincipal(pool, cand, (c) => getInterviewRouteSnapshot(c, cand, bindIv!));
  A('编辑后旧 interview snapshot 仍 revision 1 + backend/nodejs（不可变，不被新 revision 改写）',
    Number(snapAfter?.revision) === 1 && snapAfter?.allocations.length === 1 && snapAfter?.allocations[0]?.leafTrackId === 'backend/nodejs');

  section('⑧b 招聘方 invite 多方 RLS 可插入 binding（绑定 route_decided）');
  const jobInvite = await asPrincipal(pool, recA, (c) => createJob(c, recA, NODEJS_ONLY));
  await classifyJobRoute(pool, recA, jobInvite.id, await rev(jobInvite.id), { modelClassify: mkSeam(async () => { throw new Error('no model'); }).classify });
  const inv = await asPrincipal(pool, recA, (c) => inviteCandidate(c, recA, jobInvite.id, cand2));
  const invBind = (await pool.query('SELECT revision FROM application_route_binding WHERE application_id=$1', [inv!.applicationId])).rows[0];
  A('招聘方 invite 触发 binding（recruiter 多方 RLS insert，revision 1）', !!inv && Number(invBind?.revision) === 1);

  section('⑨ 图内 planner 输出服务端校验（leaf 必须属于 snapshot）');
  const snapAllocs = [{ leafTrackId: 'backend/nodejs', allocationBps: 10000 }];
  A('leaf 不在 snapshot → 拒', validatePlannerOutput({ leafTrackId: 'frontend/web', competencyId: 'c1', difficulty: 3 }, snapAllocs).ok === false);
  A('difficulty 越界(0/6) → 拒',
    validatePlannerOutput({ leafTrackId: 'backend/nodejs', competencyId: 'c1', difficulty: 0 }, snapAllocs).ok === false
    && validatePlannerOutput({ leafTrackId: 'backend/nodejs', competencyId: 'c1', difficulty: 6 }, snapAllocs).ok === false);
  A('competencyId 含控制字符 → 拒', validatePlannerOutput({ leafTrackId: 'backend/nodejs', competencyId: 'a\u0000b', difficulty: 3 }, snapAllocs).ok === false);
  A('合法 planner 输出 → 通过', validatePlannerOutput({ leafTrackId: 'backend/nodejs', competencyId: 'concurrency', difficulty: 4 }, snapAllocs).ok === true);

  section('⑩ weighted-deficit 确定性按轮配额（多桶 = 按轮，非一次混合检索）');
  const seq = planWeightedDeficitRounds([{ leafTrackId: 'backend/nodejs', allocationBps: 7000 }, { leafTrackId: 'frontend/web', allocationBps: 3000 }], 10);
  const nodejsRounds = seq.filter((i) => i === 0).length, frontendRounds = seq.filter((i) => i === 1).length;
  A('weighted-deficit 10 轮 → 7 nodejs / 3 frontend', nodejsRounds === 7 && frontendRounds === 3);

  section('⑪ RLS owner/tenant 隔离（C/B 边界）');
  const crossRev = await asPrincipal(pool, recB, (c) => c.query('SELECT count(*)::int n FROM job_semantic_revision WHERE job_id=$1', [jobBind.id]));
  const crossEvent = await asPrincipal(pool, recB, (c) => c.query('SELECT count(*)::int n FROM job_route_event WHERE job_id=$1', [jobBind.id]));
  A('跨招聘方读 revision/route-event = 0 行', crossRev.rows[0].n === 0 && crossEvent.rows[0].n === 0);
  const ownConsumption = await asPrincipal(pool, cand, (c) => c.query('SELECT count(*)::int n FROM route_consumption_event WHERE candidate_user_id=$1', [cand]));
  const crossConsumption = await asPrincipal(pool, cand2, (c) => c.query('SELECT count(*)::int n FROM route_consumption_event WHERE candidate_user_id=$1', [cand]));
  A('候选人读自己消费事件 >0、读他人 = 0 行', ownConsumption.rows[0].n > 0 && crossConsumption.rows[0].n === 0);
  let candInsertRevDenied = false;
  try {
    await asPrincipal(pool, cand, (c) => c.query(
      "INSERT INTO job_semantic_revision(job_id, owner_user_id, revision, semantic_digest, input_hmac, status) VALUES ($1,$2,99,$3,$4,'route_pending')",
      [jobBind.id, recA, 'ab'.repeat(32), 'cd'.repeat(32)]));
  } catch { candInsertRevDenied = true; }
  A('候选人不能为招聘方岗位 INSERT revision（C/B 边界，RLS WITH CHECK 拒绝）', candInsertRevDenied);
  let candInsertDecisionDenied = false;
  try {
    await asPrincipal(pool, cand, (c) => c.query(
      "INSERT INTO job_route_decision(id,job_id,owner_user_id,revision,route_outcome,attempt_outcome,taxonomy_version,policy_version,allocations,confidence_bps,margin_bps,reason_codes,decision_hash) VALUES ($1,$2,$3,1,'route_unresolved','validation_rejected','v1','p','[]'::jsonb,NULL,NULL,ARRAY['x'],$4)",
      ['rd_' + randomUUID(), jobBind.id, recA, 'ef'.repeat(32)]));
  } catch { candInsertDecisionDenied = true; }
  A('候选人不能 INSERT decision（owner 非本人，RLS 拒绝）', candInsertDecisionDenied);

  // 公开读只限 route_decided（单表谓词，镜像 job_posting p_read status='open'）：非 owner 候选人
  // 读 route_unresolved = 0（负路径），读 route_decided = 1（正路径，binding 依赖此读）。
  const candReadUnresolved = await asPrincipal(pool, cand, (c) => c.query(
    "SELECT count(*)::int n FROM job_route_decision WHERE job_id=$1 AND route_outcome='route_unresolved'", [jobUnknown.id]));
  A('非 owner 候选人读 route_unresolved decision = 0 行（公开读仅限 route_decided）', candReadUnresolved.rows[0].n === 0);
  const candReadDecided = await asPrincipal(pool, cand, (c) => c.query(
    "SELECT count(*)::int n FROM job_route_decision WHERE job_id=$1 AND route_outcome='route_decided'", [jobBind.id]));
  A('非 owner 候选人读 route_decided decision = 1 行（公开读允许，绑定依赖此读）', candReadDecided.rows[0].n === 1);

  console.log(`\n${fail === 0 ? '✓ rag03-route（真 Postgres）全部通过' : `✗ ${fail} 项失败`}`);
  await pool.end();
  process.exit(fail ? 1 : 0);
}

main().catch(async (err) => {
  console.error(err);
  await pool.end().catch(() => undefined);
  process.exit(1);
});

/**
 * G7FIX-4 · finalize 服务面直证（REQUEST rev3 @ea3e38a7 §2）。
 * 真实 ApplicationsService（NestJS DI 薄封装 · 真 @meetwise/db asPrincipal · 真隔离 PG）：
 *   ① 绑定面试终态 failed 且申请已标 assessment_unavailable 后——finalize 200 正向面：
 *      零 HttpException（=200）+ outcome='assessment_unavailable' + replayed:false
 *      （DB 层命中 recruiter.ts:205 assessment_unavailable 幂等面，≠:204 completed→replayed）；
 *   ② 幂等重放同形（仍 replayed:false）；
 *   ③ in_progress+failed 卡死态仍 409 cannot_finalize（本刀消的死路面在服务层保持 fail-closed）。
 * releaseEvidence=false · Not HA · est live=0（零模型调用）。
 */
import 'reflect-metadata';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { HttpException } from '@nestjs/common';
import {
  createPool, asPrincipal, assertIsolatedTestTarget, loadMigrations, runMigrations,
  createJob, classifyJobRoute, inviteCandidate, startApplicationInterview,
  reserveEntitlement, failInterviewAndRelease, markApplicationAssessmentUnavailable,
} from '@meetwise/db';
import { ApplicationsService } from '../src/modules/jobs/applications.service.ts';

process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'g7fix4-finalize-job-route-input-hmac-proof-key-not-production-01';

const pool = createPool();
let fails = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fails++; };
const TAG = `g7fix4fin${Date.now()}`;
const recruiter = `${TAG}_rec`;
const candidate = `${TAG}_cand`;
const resumeId = randomUUID();
const touchedInterviews: string[] = [];

// 服务脸直调：DbService 只是把 @meetwise/db asPrincipal 包成薄封装（platform/db.service.ts），
// 这里注入同一原语，被测代码路径与生产 DI 完全一致。
const applications = new ApplicationsService({
  asPrincipal: <T>(user: string, fn: (c: any) => Promise<T>): Promise<T> => asPrincipal(pool, user, fn),
} as any);

async function seedBoundFailedMarked(): Promise<{ appId: string; interviewId: string }> {
  const jobRow = await asPrincipal(pool, recruiter, (c) => createJob(c, recruiter, {
    title: '后端工程师',
    description: 'NestJS 服务端',
    competencies: ['nestjs'],
  }));
  const revision = Number((await pool.query(
    'SELECT COALESCE(MAX(revision),0)::int AS n FROM job_semantic_revision WHERE job_id=$1', [jobRow.id],
  )).rows[0].n);
  const classified = await classifyJobRoute(pool, recruiter, jobRow.id, revision, {
    modelClassify: async () => { throw new Error('B-side seed must rule-decide; model path unexpected'); },
  });
  if (classified.status !== 'route_decided') throw new Error(`seed_route_not_decided:${classified.status}`);
  const invited = await asPrincipal(pool, recruiter, (c) => inviteCandidate(c, recruiter, jobRow.id, candidate));
  const started = await asPrincipal(pool, candidate, (c) => startApplicationInterview(c, candidate, invited!.applicationId, resumeId));
  if (started.status !== 'started') throw new Error(`seed_start_not_started:${started.status}`);
  const interviewId = started.interviewId;
  touchedInterviews.push(interviewId);
  await asPrincipal(pool, candidate, (c) => reserveEntitlement(c, candidate, interviewId, 'mock_interview', 1.0));
  await asPrincipal(pool, candidate, async (c) => {
    await failInterviewAndRelease(c, candidate, interviewId);
    const marked = await markApplicationAssessmentUnavailable(c, candidate, interviewId);
    if (marked !== 'updated') throw new Error(`seed_mark_not_updated:${marked}`);
  });
  return { appId: invited!.applicationId, interviewId };
}

type FinalizeBody = { applicationId: string; interviewId: string; replayed: boolean; outcome: string };

async function callFinalize(appId: string): Promise<{ threw: false; body: FinalizeBody } | { threw: true; status: number; error: string }> {
  try {
    return { threw: false, body: await applications.finalize(candidate, appId) as FinalizeBody };
  } catch (error: unknown) {
    if (error instanceof HttpException) {
      const response = error.getResponse() as { error?: string };
      return { threw: true, status: error.getStatus(), error: typeof response === 'object' ? (response.error ?? '') : String(response) };
    }
    throw error;
  }
}

async function main() {
  await assertIsolatedTestTarget(pool);
  await runMigrations(pool, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));
  await pool.query("INSERT INTO resume(id,owner_user_id,status,content_sha) VALUES ($1,$2,'ingested',$3)", [resumeId, candidate, `${TAG}:resume`]);
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0,now()+interval '300 days')", [candidate]);

  const first = await seedBoundFailedMarked();
  const ok = await callFinalize(first.appId);
  A('finalize（assessment_unavailable 面）→ 200 形：零 HttpException', ok.threw === false);
  A('finalize 响应体 = outcome=assessment_unavailable + replayed:false（recruiter.ts:205 · applications.service.ts:82-88）',
    ok.threw === false && ok.body.outcome === 'assessment_unavailable' && ok.body.replayed === false
    && ok.body.applicationId === first.appId && ok.body.interviewId === first.interviewId);
  const replay = await callFinalize(first.appId);
  A('finalize 幂等重放同形：仍 200 + assessment_unavailable + replayed:false',
    replay.threw === false && replay.body.outcome === 'assessment_unavailable' && replay.body.replayed === false);

  // 卡死态：新 attempt 已 started（in_progress）但面试被 fail 且未 mark（本刀前死路遗留面）。
  const retried = await asPrincipal(pool, candidate, (c) => startApplicationInterview(c, candidate, first.appId, resumeId));
  if (retried.status !== 'started') throw new Error(`seed_retry_not_started:${retried.status}`);
  touchedInterviews.push(retried.interviewId);
  await asPrincipal(pool, candidate, (c) => failInterviewAndRelease(c, candidate, retried.interviewId));
  const stuck = (await pool.query('SELECT ja.status AS application_status, i.status AS interview_status FROM job_application ja JOIN interview i ON i.id=ja.interview_id WHERE ja.id=$1', [first.appId])).rows[0];
  A('卡死态复现：application in_progress + interview failed', stuck?.application_status === 'in_progress' && stuck?.interview_status === 'failed');
  const stuckFinalize = await callFinalize(first.appId);
  A('卡死态 finalize → 409 cannot_finalize（fail-closed 不变）',
    stuckFinalize.threw === true && stuckFinalize.status === 409 && stuckFinalize.error === 'cannot_finalize');

  // mark-then-recover 后（startApplicationInterview 单触点恢复）finalize 回到 200 正向面。
  const recovered = await asPrincipal(pool, candidate, (c) => startApplicationInterview(c, candidate, first.appId, resumeId));
  A('mark-then-recover：卡死态同 resume 重启 → started', recovered.status === 'started');
  if (recovered.status === 'started') touchedInterviews.push(recovered.interviewId);
  const afterRecover = await callFinalize(first.appId);
  A('恢复后 finalize → 409 cannot_finalize（新 attempt created/in_progress 未终态，不谎报 200）',
    afterRecover.threw === true && afterRecover.status === 409 && afterRecover.error === 'cannot_finalize');

  console.log(`\n${fails === 0 ? '✓ G7FIX-4 finalize 服务面直证全部通过（200+assessment_unavailable+replayed:false）' : '✗ ' + fails + ' 失败'}`);
}

async function cleanup() {
  await pool.query('DELETE FROM route_consumption_event WHERE job_id IN (SELECT id FROM job_posting WHERE owner_user_id=$1)', [recruiter]);
  await pool.query('DELETE FROM job_route_event WHERE job_id IN (SELECT id FROM job_posting WHERE owner_user_id=$1)', [recruiter]);
  await pool.query('DELETE FROM application_route_binding WHERE recruiter_user_id=$1', [recruiter]);
  await pool.query('DELETE FROM job_route_decision WHERE job_id IN (SELECT id FROM job_posting WHERE owner_user_id=$1)', [recruiter]);
  await pool.query('DELETE FROM job_semantic_revision WHERE job_id IN (SELECT id FROM job_posting WHERE owner_user_id=$1)', [recruiter]);
  await pool.query('DELETE FROM interview_event WHERE stream_key = ANY($1::text[])', [touchedInterviews]);
  await pool.query('DELETE FROM interview WHERE id = ANY($1::text[])', [touchedInterviews]);
  await pool.query('DELETE FROM job_application WHERE recruiter_user_id=$1', [recruiter]);
  await pool.query('DELETE FROM job_posting WHERE owner_user_id=$1', [recruiter]);
  await pool.query('DELETE FROM entitlement_consumption WHERE owner_user_id=$1', [candidate]);
  await pool.query('DELETE FROM entitlement_bucket WHERE owner_user_id=$1', [candidate]);
  await pool.query('DELETE FROM resume WHERE id=$1', [resumeId]);
}

main().catch((e) => { console.error('✗', (e as Error)?.message ?? e); fails++; }).finally(async () => {
  try { await cleanup(); } catch (e) { console.error('cleanup failed:', (e as Error)?.message ?? e); }
  await pool.end(); process.exit(fails === 0 ? 0 : 1);
});

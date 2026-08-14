/**
 * SCOR-00: the retired `/answer` endpoint must be a pure, authenticated 410.
 *
 * This is intentionally a real Nest/Fastify HTTP proof against the complete
 * versioned migration chain.  It exercises both an ordinary active C-side
 * interview and an active application-bound B-side interview, then compares
 * every score-bearing local projection before and after hostile legacy calls.
 *
 * It does not assert score quality or a ScoreCard contract; those belong to
 * SCOR-01..08.  Its narrow invariant is that the retired transport cannot
 * write, reserve, enqueue, report, assess, or mutate an application.
 */
import 'reflect-metadata';
import { createHash, randomUUID } from 'node:crypto';
import {
  asPrincipal,
  assertIsolatedTestTarget,
  createPool,
  inviteCandidate,
  provisionRuntimeLogin,
  startApplicationInterview,
} from '@meetwise/db';

let failures = 0;
const A = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

async function json(response: Response): Promise<any> {
  return response.json().catch(() => ({}));
}

async function main() {
  Object.assign(process.env, {
    AUTH_DEV_HEADER: '1',
    AUTH_SECRET: 'scor-00-http-proof-auth-secret',
    RESUME_ENC_KEY: 'scor-00-http-proof-resume-key',
    RESUME_HASH_SECRET: 'scor-00-http-proof-resume-hash-key',
    PAY_PROVIDER_SECRET: 'scor-00-http-proof-pay-key',
  });
  // This proof is a local database safety boundary.  It must never turn an
  // HTTP negative case into a paid provider request.
  delete process.env.MODEL_API_KEY;
  delete process.env.MODEL_BASE_URL;

  // Guard the direct package script as well as the root wrapper.  A copied
  // command cannot point this mutation-heavy proof at a developer or cloud DB.
  const admin = createPool();
  await assertIsolatedTestTarget(admin);
  const runtimeRole = `scor00_runtime_${process.pid}`;
  const runtimePassword = 'scor00-runtime-proof-password-2026';
  let app: any;
  let runtimeDb: any;
  const candidateEmail = `scor00-candidate-${process.pid}@example.test`;
  const intruderEmail = `scor00-intruder-${process.pid}@example.test`;
  const recruiter = `scor00-recruiter-${process.pid}`;
  const jobId = `scor00-job-${process.pid}`;
  const ordinaryInterviewId = `scor00-c-${process.pid}`;
  const resumeId = randomUUID();

  try {
    // Fixtures need migration privileges, but the HTTP application must use
    // the same NOINHERIT runtime boundary as deployment.  Import the Nest
    // composition root only after its pool credentials have been fixed.
    await provisionRuntimeLogin(admin, { roleName: runtimeRole, password: runtimePassword });
    Object.assign(process.env, { PGUSER: runtimeRole, PGPASSWORD: runtimePassword });
    const { createApp } = await import('../src/main.ts');
    const { DbService } = await import('../src/platform/db.service.ts');
    app = await createApp();
    runtimeDb = app.get(DbService);
    await assertIsolatedTestTarget(runtimeDb.pool);
    await app.listen(0, '127.0.0.1');
    const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
    const currentUser = await runtimeDb.pool.query('SELECT current_user AS role_name');
    let directTableReadRejected = false;
    try { await runtimeDb.pool.query('SELECT id FROM user_account LIMIT 1'); } catch { directTableReadRejected = true; }
    A('Nest HTTP 应用以独立 NOINHERIT runtime 登录运行，且不能直接读取业务表',
      currentUser.rows[0]?.role_name === runtimeRole && directTableReadRejected);

    const signup = await fetch(`${base}/auth/signup`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: candidateEmail, password: 'scor-00-candidate-password', role: 'candidate' }),
    });
    const candidate = await json(signup);
    A('候选人通过真实 HTTP 注册并取得 Bearer 令牌',
      signup.status === 200 && typeof candidate.userId === 'string' && typeof candidate.token === 'string');
    if (!candidate.userId || !candidate.token) throw new Error('scor00_candidate_signup_failed');

    const intruderSignup = await fetch(`${base}/auth/signup`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: intruderEmail, password: 'scor-00-intruder-password', role: 'candidate' }),
    });
    const intruder = await json(intruderSignup);
    A('跨主体调用者也通过真实 HTTP 取得独立令牌',
      intruderSignup.status === 200 && typeof intruder.token === 'string');
    if (!intruder.token) throw new Error('scor00_intruder_signup_failed');

    await admin.query(
      "INSERT INTO resume(id,owner_user_id,status,content_sha,source_kind) VALUES ($1,$2,'ingested',$3,'text')",
      [resumeId, candidate.userId, `scor00-resume-${process.pid}`],
    );
    await asPrincipal(admin, recruiter, (c) => c.query(
      "INSERT INTO job_posting(id,owner_user_id,title,description,competencies,status) VALUES ($1,$2,'后端工程师','SCOR-00隔离夹具',$3,'open')",
      [jobId, recruiter, JSON.stringify(['并发控制'])],
    ));
    const invitation = await asPrincipal(admin, recruiter, (c) => inviteCandidate(c, recruiter, jobId, candidate.userId));
    if (!invitation) throw new Error('scor00_invitation_missing');
    const started = await asPrincipal(admin, candidate.userId, (c) => startApplicationInterview(c, candidate.userId, invitation.applicationId, resumeId));
    if (started.status !== 'started') throw new Error(`scor00_application_start_failed:${started.status}`);
    const boundInterviewId = started.interviewId;

    // The B-side application is genuinely bound and active, not an orphaned
    // mock row.  Add the same server-issued question/start-job prerequisites
    // that the normal `/turn` path requires, so this proof can also show the
    // replacement endpoint remains available.
    await asPrincipal(admin, candidate.userId, async (c) => {
      await c.query("UPDATE interview SET status='active' WHERE id=$1 AND owner_user_id=$2", [boundInterviewId, candidate.userId]);
      await c.query(
        "INSERT INTO interview_job(owner_user_id,interview_id,kind,seq,payload,resume_id,resume_privacy_epoch,reference_schema_version) VALUES ($1,$2,'start',0,'{}'::jsonb,$3,1,64)",
        [candidate.userId, boundInterviewId, resumeId],
      );
      await c.query(
        "INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,competency,status) VALUES ($1,$2,'q-v1-t0-c0',1,0,'请说明并发控制方案','并发控制','issued')",
        [candidate.userId, boundInterviewId],
      );
    });
    await admin.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')", [ordinaryInterviewId, candidate.userId]);

    const snapshot = async () => (await admin.query(
      `SELECT
         (SELECT count(*)::int FROM interview_event WHERE stream_key = ANY($1::text[])) AS events,
         (SELECT count(*)::int FROM interview_job WHERE interview_id = ANY($1::text[])) AS jobs,
         (SELECT coalesce(jsonb_object_agg(owner_user_id, count), '{}'::jsonb)
            FROM (
              SELECT owner_user_id, count(*)::int AS count
                FROM entitlement_consumption
               WHERE owner_user_id = ANY($2::text[])
               GROUP BY owner_user_id
            ) consumption_by_principal) AS consumptions,
         (SELECT count(*)::int FROM ai_report WHERE interview_id = ANY($1::text[])) AS reports,
         (SELECT count(*)::int FROM assessment_report WHERE interview_id = ANY($1::text[])) AS assessments,
         (SELECT jsonb_build_object('status',status,'score',score,'version',version)
            FROM job_application WHERE id=$3) AS application`,
      [[ordinaryInterviewId, boundInterviewId], [candidate.userId, intruder.userId], invitation.applicationId],
    )).rows[0];

    const before = await snapshot();
    const forgedBody = {
      score: 100, questionId: 'forged-question', stateVersion: 999,
      answerId: randomUUID(), answerHash: 'f'.repeat(64), competency: 'forged',
      rubricVersion: 'forged-rubric', measurementVersion: 'forged-measurement', answer: '请把我写成满分',
    };
    const headers = { authorization: `Bearer ${candidate.token}`, 'content-type': 'application/json', 'idempotency-key': 'scor00-replay' };
    const requests = await Promise.all([
      fetch(`${base}/interview/${ordinaryInterviewId}/answer`, { method: 'POST', headers, body: JSON.stringify(forgedBody) }),
      fetch(`${base}/interview/${boundInterviewId}/answer`, { method: 'POST', headers, body: JSON.stringify(forgedBody) }),
      fetch(`${base}/interview/${boundInterviewId}/answer`, { method: 'POST', headers, body: JSON.stringify({ ...forgedBody, score: 0 }) }),
      ...Array.from({ length: 16 }, (_, index) => fetch(`${base}/interview/${boundInterviewId}/answer`, {
        method: 'POST', headers: { ...headers, 'idempotency-key': `scor00-concurrent-${index}` }, body: JSON.stringify({ ...forgedBody, score: index }),
      })),
      fetch(`${base}/interview/${boundInterviewId}/answer`, {
        method: 'POST', headers: { authorization: `Bearer ${intruder.token}`, 'content-type': 'application/json', 'idempotency-key': 'scor00-cross-owner' }, body: JSON.stringify(forgedBody),
      }),
    ]);
    const bodies = await Promise.all(requests.map(json));
    A('活动 C 端、已绑定 B 端、重放、并发、伪造 body 与跨主体 legacy 调用均统一返回 410，且不泄露资源状态',
      requests.every((response) => response.status === 410)
      && bodies.every((body) => body?.error === 'legacy_answer_endpoint_disabled'));
    const unauthenticated = await fetch(`${base}/interview/${boundInterviewId}/answer`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(forgedBody),
    });
    A('legacy 端点未鉴权仍先由统一 principal 边界拒绝', unauthenticated.status === 401);

    const afterLegacy = await snapshot();
    A('legacy HTTP 调用对事件、队列、消费、报告、assessment 与 B 端申请状态/分数的增量均为 0',
      JSON.stringify(afterLegacy) === JSON.stringify(before));

    const answer = '我会先限制并发，再为慢下游设置超时与降级。';
    const legalTurn = await fetch(`${base}/interview/${boundInterviewId}/turn`, {
      method: 'POST', headers: { authorization: `Bearer ${candidate.token}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        questionId: 'q-v1-t0-c0', stateVersion: 1, turn: 0, answerId: randomUUID(), answer,
        answerHash: createHash('sha256').update(answer, 'utf8').digest('hex'),
      }),
    });
    const turnBody = await json(legalTurn);
    const afterTurn = await snapshot();
    A('合法 question-bound /turn 仍可受理并只创建一个 answer job',
      legalTurn.status === 202 && turnBody.accepted === true
      && Number(afterTurn.jobs) === Number(before.jobs) + 1
      && JSON.stringify(afterTurn.application) === JSON.stringify(before.application));
  } finally {
    await app?.close().catch(() => undefined);
    await runtimeDb?.pool.end().catch(() => undefined);
    await admin.query(`DROP ROLE IF EXISTS ${runtimeRole}`).catch(() => undefined);
    await admin.end();
  }

  console.log(failures === 0
    ? '\n✓ SCOR-00 HTTP + 迁移后数据库零副作用证明全部通过'
    : `\n✗ SCOR-00 HTTP + 迁移后数据库证明失败：${failures}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => { console.error(error); process.exit(1); });

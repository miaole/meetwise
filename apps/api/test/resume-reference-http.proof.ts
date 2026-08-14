/**
 * UC-RES-ERASURE-01 foundation: real HTTP proof that a new ordinary C-side
 * interview obtains one typed, owner-checked resume reference before the
 * paid start job is created.  It proves a migration foundation only, not a
 * resume erasure workflow or external deletion receipt.
 */
import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { asPrincipal, createPool, provisionRuntimeLogin } from '@meetwise/db';

const admin = createPool();
const role = `resume_ref_http_${process.pid}`;
const password = 'resume-reference-http-runtime-password-2026';
let runtime: ReturnType<typeof createPool> | undefined;
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

async function main() {
  await provisionRuntimeLogin(admin, { roleName: role, password });
  runtime = createPool({
    host: process.env.PGHOST, port: Number(process.env.PGPORT), database: process.env.PGDATABASE,
    user: role, password, sslMode: 'disable',
  });
  Object.assign(process.env, {
    NODE_ENV: 'test', WEB_ORIGIN: 'https://web.example.test', AUTH_SECRET: 'resume-reference-http-auth-secret',
    PGUSER: role, PGPASSWORD: password,
  });
  const { createApp } = await import('../src/main.ts');
  const app = await createApp();
  await app.listen(0, '127.0.0.1');
  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  const email = `resume-reference-${process.pid}@example.test`;
  const interviewId = `resume-reference-interview-${process.pid}`;
  const resumeId = randomUUID();
  try {
    const signup = await fetch(`${base}/auth/signup`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: 'resume-reference-password-2026', role: 'candidate' }),
    });
    const account = await signup.json() as any;
    A('真实 API 注册候选人', signup.status === 200 && typeof account.userId === 'string' && typeof account.token === 'string');
    if (!account.userId || !account.token) throw new Error('resume_reference_signup_failed');
    await admin.query(
      "INSERT INTO resume(id,owner_user_id,status,content_sha,source_kind) VALUES ($1,$2,'ingested',$3,'text')",
      [resumeId, account.userId, `resume-reference-content-${process.pid}`],
    );
    await admin.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',1.0,now()+interval '7 days')", [account.userId]);
    await admin.query("INSERT INTO interview(id,owner_user_id,status,questions) VALUES ($1,$2,'created','[]'::jsonb)", [interviewId, account.userId]);

    const invalid = await fetch(`${base}/interview/${interviewId}/begin`, {
      method: 'POST', headers: { authorization: `Bearer ${account.token}`, 'resume-id': 'not-a-uuid' },
    });
    A('畸形简历标识在写入前被拒绝', invalid.status === 400 && (await invalid.json() as any).error === 'invalid_resume_id');
    const before = await admin.query('SELECT resume_id FROM interview WHERE id=$1', [interviewId]);
    A('畸形请求没有绑定简历或创建任务', before.rows[0]?.resume_id === null && Number((await admin.query('SELECT count(*)::int AS count FROM interview_job WHERE interview_id=$1', [interviewId])).rows[0]?.count) === 0);

    const begun = await fetch(`${base}/interview/${interviewId}/begin`, {
      method: 'POST', headers: { authorization: `Bearer ${account.token}`, 'resume-id': resumeId, 'x-request-id': 'resume-reference-proof' },
    });
    const body = await begun.json() as any;
    A('开始请求返回 202 并创建单一 start job', begun.status === 202 && body.accepted === true && typeof body.jobId === 'string');
    const bound = await admin.query<{ interview_resume_id: string; interview_epoch: number; job_resume_id: string; job_epoch: number; reference_version: number; has_payload_locator: boolean; request_id: string | null }>(
      `SELECT i.resume_id::text AS interview_resume_id,i.resume_privacy_epoch AS interview_epoch,
              j.resume_id::text AS job_resume_id,j.resume_privacy_epoch AS job_epoch,j.reference_schema_version AS reference_version,
              (j.payload ? 'resumeId') AS has_payload_locator,j.payload->>'requestId' AS request_id
         FROM interview i JOIN interview_job j ON j.interview_id=i.id
        WHERE i.id=$1 AND j.kind='start'`, [interviewId],
    );
    const row = bound.rows[0];
    A('面试与 start job 都绑定同一个 typed resume_id + privacy epoch', bound.rowCount === 1
      && row?.interview_resume_id === resumeId && row?.job_resume_id === resumeId
      && Number(row?.interview_epoch) === 1 && Number(row?.job_epoch) === 1 && Number(row?.reference_version) === 64);
    A('新任务 JSON 不再携带简历 locator，只保留 request-id', row?.has_payload_locator === false && row?.request_id === 'resume-reference-proof');

    const replay = await fetch(`${base}/interview/${interviewId}/begin`, {
      method: 'POST', headers: { authorization: `Bearer ${account.token}`, 'resume-id': resumeId },
    });
    const replayBody = await replay.json() as any;
    A('重复 begin 不重复预留或创建任务', replay.status === 202 && replayBody.alreadyBegun === true && replayBody.jobId === body.jobId
      && Number((await admin.query('SELECT count(*)::int AS count FROM interview_job WHERE interview_id=$1', [interviewId])).rows[0]?.count) === 1);

    // The HTTP path already exercised the real provisioned runtime login.  Now
    // use a separate connection authenticated as that same login to prove the
    // database write gate holds even if a future API path bypasses the helper.
    const guardInterview = `resume-reference-guard-${process.pid}`;
    const alternateResume = randomUUID();
    const foreignOwner = `resume-reference-foreign-${process.pid}`;
    const foreignResume = randomUUID();
    await admin.query("INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,'created',$3,1)", [guardInterview, account.userId, resumeId]);
    await admin.query("INSERT INTO resume(id,owner_user_id,status,content_sha,source_kind) VALUES ($1,$2,'ingested',$3,'text'),($4,$5,'ingested',$6,'text')", [
      alternateResume, account.userId, `resume-reference-alt-${process.pid}`,
      foreignResume, foreignOwner, `resume-reference-foreign-owner-${process.pid}`,
    ]);
    const rawRejects = async (sql: string, values: unknown[], expectedError: string) => {
      try {
        await asPrincipal(runtime!, account.userId, (c) => c.query(sql, values));
        return false;
      } catch (error: any) { return String(error?.message ?? '').includes(expectedError); }
    };
    const nullRejected = await rawRejects(
      "INSERT INTO interview_job(owner_user_id,interview_id,kind,seq,payload,resume_id,resume_privacy_epoch,reference_schema_version) VALUES ($1,$2,'start',0,'{}'::jsonb,NULL,1,64)",
      [account.userId, guardInterview],
      'interview_job_start_resume_epoch_required',
    );
    const v49Rejected = await rawRejects(
      "INSERT INTO interview_job(owner_user_id,interview_id,kind,seq,payload,resume_id,reference_schema_version) VALUES ($1,$2,'start',1,'{}'::jsonb,$3,49)",
      [account.userId, guardInterview, resumeId],
      'interview_job_legacy_reference_insert_forbidden',
    );
    const sameOwnerMismatchRejected = await rawRejects(
      "INSERT INTO interview_job(owner_user_id,interview_id,kind,seq,payload,resume_id,resume_privacy_epoch,reference_schema_version) VALUES ($1,$2,'start',2,'{}'::jsonb,$3,1,64)",
      [account.userId, guardInterview, alternateResume],
      'interview_job_v64_parent_resume_mismatch',
    );
    const foreignOwnerRejected = await rawRejects(
      "INSERT INTO interview_job(owner_user_id,interview_id,kind,seq,payload,resume_id,resume_privacy_epoch,reference_schema_version) VALUES ($1,$2,'start',3,'{}'::jsonb,$3,1,64)",
      [account.userId, guardInterview, foreignResume],
      'interview_job_v64_parent_resume_mismatch',
    );
    const explicitNullNoResumeRejected = await rawRejects(
      "INSERT INTO interview_job(owner_user_id,interview_id,kind,seq,payload,resume_id,reference_schema_version) VALUES ($1,$2,'start',4,'{}'::jsonb,NULL,NULL)",
      [account.userId, guardInterview],
      'interview_job_legacy_reference_insert_forbidden',
    );
    const explicitNullMismatchRejected = await rawRejects(
      "INSERT INTO interview_job(owner_user_id,interview_id,kind,seq,payload,resume_id,reference_schema_version) VALUES ($1,$2,'start',5,'{}'::jsonb,$3,NULL)",
      [account.userId, guardInterview, alternateResume],
      'interview_job_legacy_reference_insert_forbidden',
    );
    // Answer jobs deliberately have no resume locator, but must carry the
    // immutable parent epoch and may exist only after a legal v64 start. Use
    // the real HTTP-begun interview so this exercises the database trigger
    // under the same low-privilege runtime login as production.
    const answerLocatorRejected = await rawRejects(
      "INSERT INTO interview_job(owner_user_id,interview_id,kind,seq,payload,resume_id,resume_privacy_epoch,reference_schema_version) VALUES ($1,$2,'answer',1,'{}'::jsonb,$3,1,64)",
      [account.userId, interviewId, resumeId],
      'interview_job_answer_resume_locator_or_epoch_invalid',
    );
    const answerEpochRejected = await rawRejects(
      "INSERT INTO interview_job(owner_user_id,interview_id,kind,seq,payload,resume_id,resume_privacy_epoch,reference_schema_version) VALUES ($1,$2,'answer',2,'{}'::jsonb,NULL,2,64)",
      [account.userId, interviewId],
      'interview_job_v64_parent_resume_mismatch',
    );
    const answerMissingEpochRejected = await rawRejects(
      "INSERT INTO interview_job(owner_user_id,interview_id,kind,seq,payload,resume_id,resume_privacy_epoch,reference_schema_version) VALUES ($1,$2,'answer',3,'{}'::jsonb,NULL,NULL,64)",
      [account.userId, interviewId],
      'interview_job_answer_resume_locator_or_epoch_invalid',
    );
    const rejectedRows = await admin.query('SELECT count(*)::int AS count FROM interview_job WHERE interview_id=$1', [guardInterview]);
    A('真实低权 runtime login 不能直写 NULL、显式 NULL/v49 版本、同 owner 错绑或跨 owner 简历',
      nullRejected && v49Rejected && sameOwnerMismatchRejected && foreignOwnerRejected
      && explicitNullNoResumeRejected && explicitNullMismatchRejected && Number(rejectedRows.rows[0]?.count) === 0);
    A('真实低权 runtime login 不能为 answer 写 resume locator、错误 epoch 或缺失 epoch',
      answerLocatorRejected && answerEpochRejected && answerMissingEpochRejected
      && Number((await admin.query('SELECT count(*)::int AS count FROM interview_job WHERE interview_id=$1', [interviewId])).rows[0]?.count) === 1);
  } finally {
    await app.close();
    await runtime?.end();
    await admin.query(`DROP ROLE IF EXISTS ${role}`);
    await admin.end();
  }
  console.log(failures === 0 ? '\n✓ 简历稳定引用 HTTP E2E proof 全部通过' : `\n✗ ${failures} 项失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => { console.error(error); await admin.end().catch(() => undefined); process.exit(1); });

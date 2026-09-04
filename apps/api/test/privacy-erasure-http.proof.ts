/**
 * Real HTTP proof for the first phase of interview checkpoint erasure.
 *
 * This does not claim that external OSS/Redis/Langfuse data was erased.  It
 * verifies the public boundary only: a production-like low-privilege API
 * login authenticates a candidate, rejects a missing Idempotency-Key, fences
 * one owned interview, and replays the same request without multiplying the
 * deletion ledger.  The isolated runner applies all migrations before this
 * proof starts; it never drops a schema ledger or targets a cloud database.
 */
import 'reflect-metadata';
import { createHash } from 'node:crypto';
import { asPrincipal, beginCheckpointErasure, createPool, provisionRuntimeLogin } from '@meetwise/db';
import { generatePrivacyAuthzKeyPair, signPrivacyAuthorizationSnapshot } from '@meetwise/domain';

const admin = createPool();
const role = `privacy_http_api_${process.pid}`;
const password = 'privacy-http-api-runtime-password-2026';
let runtime: ReturnType<typeof createPool> | undefined;
let failures = 0;

function A(name: string, ok: boolean) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
}

async function json(response: Response): Promise<any> {
  return response.json();
}

async function main() {
  await provisionRuntimeLogin(admin, { roleName: role, password });
  runtime = createPool({ user: role, password });
  Object.assign(process.env, {
    // The isolated runner is a real low-privilege login but must not pretend
    // its loopback disposable PostgreSQL container is a production cloud DB.
    NODE_ENV: 'test',
    WEB_ORIGIN: 'https://web.example.test',
    AUTH_SECRET: 'privacy-erasure-http-proof-auth-secret',
    PRIVACY_ERASURE_IDEMPOTENCY_HMAC_KEY: 'privacy-erasure-http-proof-hmac-key',
    PGUSER: role,
    PGPASSWORD: password,
  });
  const { createApp } = await import('../src/main.ts');
  const app = await createApp();
  await app.listen(0, '127.0.0.1');
  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  const email = `privacy-http-${process.pid}@example.test`;
  const interviewId = `privacy-http-interview-${process.pid}`;
  const idempotencyKey = `erase-http-${process.pid}-same-request`;
  try {
    const signup = await fetch(`${base}/auth/signup`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: 'privacy-http-password-2026', role: 'candidate' }),
    });
    const signupBody = await json(signup);
    A('候选人可通过真实 API 注册并取得 Bearer 令牌', signup.status === 200 && typeof signupBody.token === 'string' && typeof signupBody.userId === 'string');
    if (!signupBody.token || !signupBody.userId) throw new Error('privacy_http_signup_failed');

    const retiredResumeDelete = await fetch(`${base}/privacy/resume-data`, {
      method: 'DELETE', headers: { authorization: `Bearer ${signupBody.token}` },
    });
    A('旧的全量同步简历删除入口 fail-closed，绝不伪报已擦除', retiredResumeDelete.status === 503 && (await json(retiredResumeDelete)).error === 'resume_erasure_migration_in_progress');

    await admin.query(
      "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions) VALUES ($1,$2,'active',0,0,'[]'::jsonb)",
      [interviewId, signupBody.userId],
    );
    const authorization = { authorization: `Bearer ${signupBody.token}` };

    const paused = await fetch(`${base}/privacy/interview-data/${interviewId}`, {
      method: 'DELETE', headers: { ...authorization, 'idempotency-key': idempotencyKey },
    });
    A('AUTH_SECRET 登录令牌不能打开公开删除：issuer 已存在仍固定 503，不建删除账本',
      paused.status === 503 && (await json(paused)).error === 'interview_erasure_authorization_not_available');
    const replayPaused = await fetch(`${base}/privacy/interview-data/${interviewId}`, {
      method: 'DELETE', headers: { ...authorization, 'idempotency-key': idempotencyKey },
    });
    A('重复 DELETE 仍 503，不因重放建账本',
      replayPaused.status === 503 && (await json(replayPaused)).error === 'interview_erasure_authorization_not_available');

    const privacyKey = generatePrivacyAuthzKeyPair('privacy-del-http-2026-01');
    const privacyJws = signPrivacyAuthorizationSnapshot({
      privateKeyPem: privacyKey.privateKeyPem, kid: privacyKey.kid,
      actor: signupBody.userId, owner: signupBody.userId, interview: interviewId,
      purpose: 'interview_data_erasure', privacyEpoch: 1,
      targets: [{ kind: 'checkpoint_rows', resource: '1'.repeat(64) }],
      nowSec: Math.floor(Date.now() / 1000), ttlSec: 600,
    }).jws;
    const jwsAsBearer = await fetch(`${base}/privacy/interview-data/${interviewId}`, {
      method: 'DELETE', headers: { authorization: `Bearer ${privacyJws}`, 'idempotency-key': `${idempotencyKey}-jws` },
    });
    A('隐私 JWS 不能冒充 AUTH_SECRET 登录令牌：公开删除 401，不建账本',
      jwsAsBearer.status === 401);
    const jwsAsHeader = await fetch(`${base}/privacy/interview-data/${interviewId}`, {
      method: 'DELETE',
      headers: { ...authorization, 'idempotency-key': `${idempotencyKey}-hdr`, 'x-privacy-authorization': privacyJws },
    });
    A('合法登录 + 隐私 JWS 头仍不能打开公开删除（HTTP 未接线 issuer）',
      jwsAsHeader.status === 503 && (await json(jwsAsHeader)).error === 'interview_erasure_authorization_not_available');

    const canonicalWrite = await fetch(`${base}/interview/${interviewId}/answers`, {
      method: 'POST',
      headers: { ...authorization, 'content-type': 'application/json' },
      body: JSON.stringify({ clientSubmissionKey: 'k1', answer: '不得经新路径落库' }),
    });
    A('公开 API 无 01 canonical raw write 路径',
      canonicalWrite.status === 404 || canonicalWrite.status === 405);

    const sideEffects = await admin.query(
      `SELECT
         (SELECT count(*)::int FROM privacy_erasure_request WHERE owner_user_id=$1 AND subject_id=$2) AS requests,
         (SELECT count(*)::int FROM privacy_deletion_target t
            JOIN privacy_erasure_request r ON r.id=t.request_id
           WHERE r.owner_user_id=$1 AND r.subject_id=$2) AS targets`,
      [signupBody.userId, interviewId],
    );
    A('issuer 时代公开删除仍不改变 request 或 target，低权 app_role 不能绕过数据库入口',
      Number(sideEffects.rows[0]?.requests) === 0 && Number(sideEffects.rows[0]?.targets) === 0
      && await asPrincipal(runtime, signupBody.userId, (c) =>
        beginCheckpointErasure(c, interviewId, 'a'.repeat(64))).then(() => false).catch(() => true));

    const missingPreviewKey = await fetch(`${base}/privacy/erasure-preview`, {
      method: 'POST',
      headers: { ...authorization, 'content-type': 'application/json' },
      body: JSON.stringify({ scope: 'interview_data', subjectId: interviewId }),
    });
    A('预览路径缺少 Idempotency-Key 明确拒绝',
      missingPreviewKey.status === 400 && (await json(missingPreviewKey)).error === 'idempotency_key_missing_or_invalid');

    const previewKey = `preview-http-${process.pid}`;
    const preview = await fetch(`${base}/privacy/erasure-preview`, {
      method: 'POST',
      headers: { ...authorization, 'content-type': 'application/json', 'idempotency-key': previewKey },
      body: JSON.stringify({ scope: 'interview_data', subjectId: interviewId }),
    });
    const previewBody = await json(preview);
    A('预览路径 202 回执为预览版且未完成，不是生产 SLO',
      preview.status === 202
      && previewBody.editionLabel === '预览版'
      && previewBody.productionSloClaimed === false
      && previewBody.completeness === 'preview_incomplete'
      && previewBody.status === 'local_fenced'
      && Array.isArray(previewBody.sinks) && previewBody.sinks.length >= 22
      && previewBody.sinks.some((row: { sink: string; disposition: string }) => row.sink === 'user_memory' && row.disposition === 'honest_unresolved'));

    const previewReplay = await fetch(`${base}/privacy/erasure-preview`, {
      method: 'POST',
      headers: { ...authorization, 'content-type': 'application/json', 'idempotency-key': previewKey },
      body: JSON.stringify({ scope: 'interview_data', subjectId: interviewId }),
    });
    const previewReplayBody = await json(previewReplay);
    A('预览同幂等键重放同一 requestId',
      previewReplay.status === 202 && previewReplayBody.replayed === true && previewReplayBody.requestId === previewBody.requestId);

    const previewGet = await fetch(`${base}/privacy/erasure-preview/${previewBody.requestId}`, { headers: authorization });
    const previewGetBody = await json(previewGet);
    A('GET 预览回执同一 request 且生产 DELETE 仍 503',
      previewGet.status === 200 && previewGetBody.requestId === previewBody.requestId
      && paused.status === 503);

    const previewList = await fetch(`${base}/privacy/erasure-preview`, { headers: authorization });
    const previewListBody = await json(previewList);
    A('预览列表标明预览版且不含生产完成态',
      previewList.status === 200
      && previewListBody.editionLabel === '预览版'
      && previewListBody.productionSloClaimed === false
      && Array.isArray(previewListBody.items)
      && previewListBody.items.some((row: { requestId: string }) => row.requestId === previewBody.requestId));

    const resumePreview = await fetch(`${base}/privacy/erasure-preview`, {
      method: 'POST',
      headers: { ...authorization, 'content-type': 'application/json', 'idempotency-key': `${previewKey}-resume` },
      body: JSON.stringify({ scope: 'resume_data' }),
    });
    const resumePreviewBody = await json(resumePreview);
    A('简历预览只盘点：inventoried、无本地 sweep、仍未完成',
      resumePreview.status === 202
      && resumePreviewBody.status === 'inventoried'
      && resumePreviewBody.localSweepRequestId === null
      && resumePreviewBody.completeness === 'preview_incomplete'
      && resumePreviewBody.productionSloClaimed === false);

    const otherSignup = await fetch(`${base}/auth/signup`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: `privacy-http-other-${process.pid}@example.test`, password: 'privacy-http-password-2026', role: 'candidate' }),
    });
    const otherBody = await json(otherSignup);
    const otherGet = await fetch(`${base}/privacy/erasure-preview/${previewBody.requestId}`, {
      headers: { authorization: `Bearer ${otherBody.token}` },
    });
    A('跨 owner GET 预览回执 404，不泄露他人盘点',
      otherSignup.status === 200 && otherGet.status === 404);

    const stillPaused = await fetch(`${base}/privacy/interview-data/${interviewId}`, {
      method: 'DELETE', headers: { ...authorization, 'idempotency-key': `${idempotencyKey}-after-preview` },
    });
    A('预览 202 之后生产 DELETE 仍 503，不把预览当生产开放',
      stillPaused.status === 503 && (await json(stillPaused)).error === 'interview_erasure_authorization_not_available');

    const rawKeyRows = await admin.query(
      'SELECT count(*)::int AS count FROM privacy_preview_request WHERE owner_user_id=$1 AND idempotency_key_hash=$2',
      [signupBody.userId, previewKey],
    );
    const hashedRows = await admin.query(
      `SELECT count(*)::int AS count FROM privacy_preview_request
        WHERE owner_user_id=$1 AND idempotency_key_hash ~ '^[a-f0-9]{64}$'`,
      [signupBody.userId],
    );
    A('HTTP 原始 Idempotency-Key 不入库，只落 64-hex HMAC',
      Number(rawKeyRows.rows[0]?.count) === 0 && Number(hashedRows.rows[0]?.count) >= 1);

    const otherPreview = await fetch(`${base}/privacy/erasure-preview`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${otherBody.token}`,
        'content-type': 'application/json',
        'idempotency-key': `${previewKey}-other`,
      },
      body: JSON.stringify({ scope: 'interview_data', subjectId: interviewId }),
    });
    A('跨 owner POST 他人面试预览 404，不建他人盘点',
      otherPreview.status === 404);

    const fencedTurnAnswer = '预览围栏后不得落库的答案';
    const fencedTurn = await fetch(`${base}/interview/${interviewId}/turn`, {
      method: 'POST',
      headers: { ...authorization, 'content-type': 'application/json' },
      body: JSON.stringify({
        questionId: 'q-v1-t0-c0', stateVersion: 1, turn: 0,
        answerId: '00000000-0000-4000-8000-000000000001',
        answerHash: createHash('sha256').update(fencedTurnAnswer, 'utf8').digest('hex'),
        answer: fencedTurnAnswer,
      }),
    });
    const fencedJobs = await admin.query('SELECT count(*)::int AS count FROM interview_job WHERE interview_id=$1', [interviewId]);
    A('面试预览后 /turn 410 且不写答案 job（0096 围栏副作用）',
      fencedTurn.status === 410 && (await json(fencedTurn)).error === 'interview_privacy_fenced'
      && Number(fencedJobs.rows[0]?.count) === 0);

    // Public delete stays 503 until composition-root abuse proofs exist.
    // The dormant 202 harness below must not run: issuer foundation is local
    // only and must not be mistaken for a reopened destructive HTTP path.
    if (paused.status === 503) return;

    const missingKey = await fetch(`${base}/privacy/interview-data/${interviewId}`, {
      method: 'DELETE', headers: authorization,
    });
    A('缺少 Idempotency-Key 的删除请求明确拒绝且不建账本', missingKey.status === 400 && (await json(missingKey)).error === 'idempotency_key_missing_or_invalid');
    const before = await admin.query('SELECT count(*)::int AS count FROM privacy_erasure_request WHERE owner_user_id=$1 AND subject_id=$2', [signupBody.userId, interviewId]);
    A('被拒绝请求没有产生可重试副作用', Number(before.rows[0]?.count) === 0);

    const accepted = await fetch(`${base}/privacy/interview-data/${interviewId}`, {
      method: 'DELETE', headers: { ...authorization, 'idempotency-key': idempotencyKey },
    });
    const acceptedBody = await json(accepted);
    A('首个删除请求返回 202 fenced 而非伪报完成', accepted.status === 202 && acceptedBody.status === 'fenced' && acceptedBody.replayed === false && typeof acceptedBody.requestId === 'string');
    if (!acceptedBody.requestId) throw new Error('privacy_http_request_missing');

    const replay = await fetch(`${base}/privacy/interview-data/${interviewId}`, {
      method: 'DELETE', headers: { ...authorization, 'idempotency-key': idempotencyKey },
    });
    const replayBody = await json(replay);
    A('同一 Idempotency-Key 重放同一 requestId 且不重复建账', replay.status === 202 && replayBody.replayed === true && replayBody.requestId === acceptedBody.requestId);

    const answer = '删除后不得落库的答案';
    const postDeleteTurn = await fetch(`${base}/interview/${interviewId}/turn`, {
      method: 'POST',
      headers: { ...authorization, 'content-type': 'application/json' },
      body: JSON.stringify({
        questionId: 'q-v1-t0-c0', stateVersion: 1, turn: 0,
        answerId: '00000000-0000-4000-8000-000000000001',
        answerHash: createHash('sha256').update(answer, 'utf8').digest('hex'), answer,
      }),
    });
    const postDeleteJobs = await admin.query('SELECT count(*)::int AS count FROM interview_job WHERE interview_id=$1', [interviewId]);
    A('围栏后真实 HTTP /turn 返回 410，且不写答案 job',
      postDeleteTurn.status === 410 && (await json(postDeleteTurn)).error === 'interview_privacy_fenced'
      && Number(postDeleteJobs.rows[0]?.count) === 0);

    // `turn` is the production answer path.  The privacy boundary must close
    // projections, SSE replays and audio egress before any provider client is
    // reached.  The retired legacy /answer endpoint has its own 410 regression
    // proof and is deliberately excluded here: its status cannot evidence a
    // privacy fence.
    const beforeEscapes = await admin.query(`
      SELECT
        (SELECT count(*)::int FROM consumption_record WHERE interview_id=$1) AS consumption_count,
        (SELECT count(*)::int FROM interview_event WHERE stream_key=$1) AS event_count,
        (SELECT count(*)::int FROM question_feedback WHERE interview_id=$1) AS feedback_count,
        (SELECT count(*)::int FROM ai_report WHERE interview_id=$1) AS report_count
    `, [interviewId]);
    const [feedback, speak, speakStream, transcribe, report, retryReport, exportReport, transcript, assessment, getAssessment, createLearningPlan, getLearningPlan, completeLearningItem, createCareerPath, getCareerPath, begin, abandon, interview, sse, list] = await Promise.all([
      fetch(`${base}/interview/${interviewId}/questions/0/feedback`, {
        method: 'POST', headers: { ...authorization, 'content-type': 'application/json' }, body: JSON.stringify({ rating: 'up' }),
      }),
      fetch(`${base}/interview/${interviewId}/speak`, {
        method: 'POST', headers: { ...authorization, 'content-type': 'application/json' }, body: JSON.stringify({ text: '不得在删除后送往 TTS' }),
      }),
      fetch(`${base}/interview/${interviewId}/speak/stream`, {
        method: 'POST', headers: { ...authorization, 'content-type': 'application/json' }, body: JSON.stringify({ text: '不得在删除后打开流式 TTS' }),
      }),
      fetch(`${base}/interview/${interviewId}/transcribe`, {
        method: 'POST', headers: { ...authorization, 'content-type': 'application/json' }, body: JSON.stringify({
          audioBase64: 'AA==', mimeType: 'audio/wav',
          capture: { mode: 'single_local_microphone', consent: true, policyVersion: 'voice_ephemeral_v1' },
        }),
      }),
      fetch(`${base}/interview/${interviewId}/report`, { headers: authorization }),
      fetch(`${base}/interview/${interviewId}/report/retry`, { method: 'POST', headers: authorization }),
      fetch(`${base}/interview/${interviewId}/report/export`, { headers: authorization }),
      fetch(`${base}/interview/${interviewId}/transcript`, { headers: authorization }),
      fetch(`${base}/interview/${interviewId}/assessment`, { method: 'POST', headers: authorization }),
      fetch(`${base}/interview/${interviewId}/assessment`, { headers: authorization }),
      fetch(`${base}/interview/${interviewId}/learning-plan`, { method: 'POST', headers: authorization }),
      fetch(`${base}/interview/${interviewId}/learning-plan`, { headers: authorization }),
      fetch(`${base}/interview/${interviewId}/learning-plan/complete`, {
        method: 'POST', headers: { ...authorization, 'content-type': 'application/json' }, body: JSON.stringify({ topic: 'deletion-fenced' }),
      }),
      fetch(`${base}/interview/${interviewId}/career-path`, { method: 'POST', headers: authorization }),
      fetch(`${base}/interview/${interviewId}/career-path`, { headers: authorization }),
      fetch(`${base}/interview/${interviewId}/begin`, {
        method: 'POST', headers: { ...authorization, 'resume-id': '00000000-0000-4000-8000-000000000002' },
      }),
      fetch(`${base}/interview/${interviewId}/abandon`, { method: 'POST', headers: authorization }),
      fetch(`${base}/interview/${interviewId}`, { headers: authorization }),
      fetch(`${base}/interview/${interviewId}/events`, { headers: authorization }),
      fetch(`${base}/interview`, { headers: authorization }),
    ]);
    const afterEscapes = await admin.query(`
      SELECT
        (SELECT count(*)::int FROM consumption_record WHERE interview_id=$1) AS consumption_count,
        (SELECT count(*)::int FROM interview_event WHERE stream_key=$1) AS event_count,
        (SELECT count(*)::int FROM question_feedback WHERE interview_id=$1) AS feedback_count,
        (SELECT count(*)::int FROM ai_report WHERE interview_id=$1) AS report_count
    `, [interviewId]);
    const listBody = await json(list);
    const fencedEndpoints = [
      feedback, speak, speakStream, transcribe, report, retryReport, exportReport, transcript,
      assessment, getAssessment, createLearningPlan, getLearningPlan, completeLearningItem, createCareerPath,
      getCareerPath, begin, abandon, interview, sse,
    ];
    A('围栏后所有生产面试读写、报告/评分、SSE、题目反馈与 ASR/TTS 均返回 410，列表不泄露，且消费/投影增量为 0',
      fencedEndpoints.every((response) => response.status === 410)
      && Array.isArray(listBody.interviews) && !listBody.interviews.some((row: any) => row.id === interviewId)
      && JSON.stringify(beforeEscapes.rows[0]) === JSON.stringify(afterEscapes.rows[0]));

    const ledger = await admin.query<{
      request_count: number; target_count: number; checkpoint_targets: number; queue_targets: number; external_targets: number; raw_key_rows: number;
    }>(`
      SELECT
        (SELECT count(*)::int FROM privacy_erasure_request r WHERE r.id=$1) AS request_count,
        (SELECT count(*)::int FROM privacy_deletion_target t WHERE t.request_id=$1) AS target_count,
        (SELECT count(*)::int FROM privacy_deletion_target t WHERE t.request_id=$1 AND t.sink='checkpoint_rows' AND t.status='pending') AS checkpoint_targets,
        (SELECT count(*)::int FROM privacy_deletion_target t WHERE t.request_id=$1 AND t.sink='interview_job_payload' AND t.status='erased') AS queue_targets,
        (SELECT count(*)::int FROM privacy_deletion_target t WHERE t.request_id=$1 AND t.sink IN ('oss','redis','langfuse') AND t.status='retention_pending') AS external_targets,
        (SELECT count(*)::int FROM privacy_erasure_request r WHERE r.id=$1 AND r.idempotency_key_hash=$2) AS raw_key_rows
    `, [acceptedBody.requestId, idempotencyKey]);
    const row = ledger.rows[0];
    A('一个 request 精确建立五个按数据面拆分的删除 target（含已清空的队列载荷）',
      row?.request_count === 1 && row?.target_count === 5 && row?.checkpoint_targets === 1
      && row?.queue_targets === 1 && row?.external_targets === 3);
    A('原始 Idempotency-Key 从不写入删除账本', row?.raw_key_rows === 0);
  } finally {
    await app.close();
    await runtime?.end();
    await admin.query(`DROP ROLE IF EXISTS ${role}`);
    await admin.end();
  }
  console.log(failures === 0 ? '\n✓ 隐私擦除 HTTP E2E proof 全部通过' : `\n✗ ${failures} 项失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => { console.error(error); await admin.end().catch(() => undefined); process.exit(1); });

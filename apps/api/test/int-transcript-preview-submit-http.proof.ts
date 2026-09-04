/**
 * Isolated HTTP proof: preview-path submitInterviewAnswer.
 *
 * Requires the isolated runner (full migrations + disposable PostgreSQL).
 * Proves answers land on the 0092 ledger under MEETWISE_PUBLIC_PREVIEW=1,
 * without plaintext /turn jobs and without claiming INT-TRANSCRIPT-01.
 * releaseEvidence=false.
 */
import 'reflect-metadata';
import { createPool, assertIsolatedTestTarget } from '@meetwise/db';

const ENC_KEY = 'proof_answer_enc_key_v1_16chars';
const HMAC_SECRET = 'proof_answer_hmac_secret_16chars';
const admin = createPool();
const OWNER = `preview-submit-owner-${process.pid}`;
const IID = `iv_preview_submit_${process.pid}`;
const QUESTION = 'q-v1-t0-c0';
const ANSWER = '预览版账本正文-不得进 plaintext job';
const KEY = `preview-sub-${process.pid}`;
let failures = 0;

function A(name: string, ok: boolean) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures += 1;
}

async function json(response: Response): Promise<any> {
  return response.json();
}

async function main() {
  await assertIsolatedTestTarget(admin);
  Object.assign(process.env, {
    NODE_ENV: 'test',
    MEETWISE_PUBLIC_PREVIEW: '1',
    AUTH_DEV_HEADER: '1',
    AUTH_SECRET: 'preview-submit-http-proof-auth-secret',
    WEB_ORIGIN: 'https://web.example.test',
    INTERVIEW_ANSWER_ENC_KEY: ENC_KEY,
    INTERVIEW_ANSWER_HMAC_SECRET: HMAC_SECRET,
    OCR_ENABLED: '0',
  });
  const { createApp } = await import('../src/main.ts');
  const app = await createApp();
  await app.listen(0, '127.0.0.1');
  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  const headers = {
    'x-user-id': OWNER,
    'content-type': 'application/json',
  };
  const body = {
    questionId: QUESTION,
    stateVersion: 1,
    clientSubmissionKey: KEY,
    answer: ANSWER,
  };
  try {
    await admin.query(
      "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions) VALUES ($1,$2,'created',0,0,'[]'::jsonb)",
      [IID, OWNER],
    );
    await admin.query(
      "INSERT INTO interview_job(owner_user_id,interview_id,kind,seq,payload) VALUES ($1,$2,'start',0,'{}')",
      [OWNER, IID],
    );
    await admin.query(
      "INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,status) VALUES ($1,$2,$3,1,0,'预览题','issued')",
      [OWNER, IID, QUESTION],
    );

    const turn = await fetch(`${base}/interview/${IID}/turn`, {
      method: 'POST', headers, body: JSON.stringify({ ...body, answerId: '00000000-0000-4000-8000-000000000001', answerHash: 'a'.repeat(64), turn: 0 }),
    });
    A('预览 /turn 仍 503，不是账本路径', turn.status === 503 && (await json(turn)).error === 'public_preview_read_only');

    const first = await fetch(`${base}/interview/${IID}/answers`, {
      method: 'POST', headers, body: JSON.stringify(body),
    });
    const firstBody = await json(first);
    A('预览提交落 accepted_unscored 且响应无明文',
      first.status === 200 && firstBody.status === 'accepted_unscored' && firstBody.replayed === false
      && firstBody.interviewId === IID && firstBody.questionId === QUESTION
      && firstBody.clientSubmissionKey === KEY && typeof firstBody.canonicalBodyHmac === 'string'
      && firstBody.canonicalBodyHmac.length === 64 && !JSON.stringify(firstBody).includes(ANSWER));

    const replay = await fetch(`${base}/interview/${IID}/answers`, {
      method: 'POST', headers, body: JSON.stringify(body),
    });
    const replayBody = await json(replay);
    A('同键同体回放同一 hmac 且 replayed',
      replay.status === 200 && replayBody.replayed === true
      && replayBody.canonicalBodyHmac === firstBody.canonicalBodyHmac);

    await admin.query(
      "UPDATE interview_question SET status='queued' WHERE interview_id=$1 AND question_id=$2",
      [IID, QUESTION],
    );
    const replayAfterQueued = await fetch(`${base}/interview/${IID}/answers`, {
      method: 'POST', headers, body: JSON.stringify(body),
    });
    const replayAfterQueuedBody = await json(replayAfterQueued);
    A('题目已非 issued 时同 key 仍回放',
      replayAfterQueued.status === 200 && replayAfterQueuedBody.replayed === true
      && replayAfterQueuedBody.canonicalBodyHmac === firstBody.canonicalBodyHmac);

    const conflict = await fetch(`${base}/interview/${IID}/answers`, {
      method: 'POST', headers, body: JSON.stringify({ ...body, answer: '另一份正文' }),
    });
    A('同键异体冲突不落第二份正文',
      conflict.status === 409 && (await json(conflict)).error === 'interview_answer_submission_conflict');

    const other = await fetch(`${base}/interview/${IID}/answers`, {
      method: 'POST',
      headers: { 'x-user-id': `${OWNER}-other`, 'content-type': 'application/json' },
      body: JSON.stringify({ ...body, clientSubmissionKey: `${KEY}-x` }),
    });
    A('跨 owner 提交 404 且不泄露存在性',
      other.status === 404 && (await json(other)).error === 'not_found_or_forbidden');

    const secondKey = await fetch(`${base}/interview/${IID}/answers`, {
      method: 'POST', headers, body: JSON.stringify({ ...body, clientSubmissionKey: `${KEY}-2` }),
    });
    A('同题第二把 key 拒绝，不双写 artifact',
      secondKey.status === 409 && (await json(secondKey)).error === 'stale_question');

    const missingQ = await fetch(`${base}/interview/${IID}/answers`, {
      method: 'POST', headers, body: JSON.stringify({ ...body, questionId: 'q-missing', clientSubmissionKey: `${KEY}-miss` }),
    });
    A('未发题 question_not_ready 且不落新 submission',
      missingQ.status === 409 && (await json(missingQ)).error === 'question_not_ready');

    const epochBody = await fetch(`${base}/interview/${IID}/answers`, {
      method: 'POST', headers, body: JSON.stringify({ ...body, privacyEpoch: 9 }),
    });
    A('客户端自报 privacyEpoch 400', epochBody.status === 400);

    const ivB = `${IID}_b`;
    await admin.query(
      "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions) VALUES ($1,$2,'created',0,0,'[]'::jsonb)",
      [ivB, OWNER],
    );
    await admin.query(
      "INSERT INTO interview_job(owner_user_id,interview_id,kind,seq,payload) VALUES ($1,$2,'start',0,'{}')",
      [OWNER, ivB],
    );
    await admin.query(
      "INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,status) VALUES ($1,$2,$3,1,0,'预览题B','issued')",
      [OWNER, ivB, QUESTION],
    );
    const reused = await fetch(`${base}/interview/${ivB}/answers`, {
      method: 'POST', headers, body: JSON.stringify(body),
    });
    A('同 owner 跨面试复用 key 冲突，B 不落账',
      reused.status === 409 && (await json(reused)).error === 'interview_answer_submission_conflict');

    const ledger = await admin.query<{ submissions: number; artifacts: number; jobs: number; plaintext_jobs: number; ciphertext_plain: number; b_submissions: number }>(
      `SELECT
         (SELECT count(*)::int FROM interview_answer_submission WHERE owner_user_id=$1 AND interview_id=$2) AS submissions,
         (SELECT count(*)::int FROM interview_answer_artifact WHERE owner_user_id=$1 AND interview_id=$2) AS artifacts,
         (SELECT count(*)::int FROM interview_answer_job WHERE owner_user_id=$1 AND interview_id=$2) AS jobs,
         (SELECT count(*)::int FROM interview_job WHERE interview_id=$2 AND kind='answer' AND payload ? 'answer') AS plaintext_jobs,
         (SELECT count(*)::int FROM interview_answer_artifact WHERE owner_user_id=$1 AND interview_id=$2 AND ciphertext = convert_to($3,'utf8')) AS ciphertext_plain,
         (SELECT count(*)::int FROM interview_answer_submission WHERE owner_user_id=$1 AND interview_id=$4) AS b_submissions`,
      [OWNER, IID, ANSWER, ivB],
    );
    A('账本恰一条 submission/artifact/ref-only job，无 plaintext answer job，密文不是原文，B=0',
      Number(ledger.rows[0]?.submissions) === 1 && Number(ledger.rows[0]?.artifacts) === 1
      && Number(ledger.rows[0]?.jobs) === 1 && Number(ledger.rows[0]?.plaintext_jobs) === 0
      && Number(ledger.rows[0]?.ciphertext_plain) === 0 && Number(ledger.rows[0]?.b_submissions) === 0);
  } finally {
    await app.close();
    await admin.end();
  }
  console.log(`${failures === 0 ? '✓' : '✗'} int-transcript-preview-submit-http (${failures === 0 ? 'ok' : `${failures} failed`}; releaseEvidence=false)`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

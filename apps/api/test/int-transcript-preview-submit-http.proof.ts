/**
 * Isolated HTTP proof: preview-path submitInterviewAnswer.
 *
 * Standing: use REMOTE Postgres via env. Never `pnpm db:up` / compose.dev.
 * The isolated runner may wrap a disposable target; this file does not start
 * the local development database. Proves answers land on the 0092 ledger
 * under MEETWISE_PUBLIC_PREVIEW=1, without plaintext /turn jobs and without
 * claiming INT-TRANSCRIPT-01. 0126 dual-write fence must already be applied.
 * releaseEvidence=false.
 */
import 'reflect-metadata';
import { createPool, assertIsolatedTestTarget } from '@meetwise/db';

const ENC_KEY = 'proof_answer_enc_key_v1_16chars';

const SEED_R = '33333333-3333-4333-8333-333333333333';
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
  // GODFN-1c 逐修(预存红根因:本 proof 早于 0058 privacy fence——guardInterviewPrivacy →
  // assert_interview_privacy_active 函数在 sql 镜像 schema 中缺位 → /answers 全链 500)。
  // 最小 stub 与 uc-e2e-018-user-abandon-http.proof.ts 同款(owner-match,无 erasure fence,无
  // write-guard trigger → admin 直插种子不触 fence);断言面零改动。
  await admin.query(`
  DO $wrap$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'assert_interview_privacy_active') THEN RETURN; END IF;
  CREATE OR REPLACE FUNCTION interview_privacy_active(target_interview text)
  RETURNS boolean
  LANGUAGE plpgsql
  SET search_path = pg_catalog, public, pg_temp AS $$
  DECLARE
    principal text := current_setting('app.principal_user', true);
  BEGIN
    IF principal IS NULL OR length(principal)=0 OR target_interview IS NULL OR length(target_interview)=0 THEN
      RETURN false;
    END IF;
    RETURN EXISTS (
      SELECT 1 FROM interview i
       WHERE i.id = target_interview AND i.owner_user_id = principal
    );
  END $$;
  CREATE OR REPLACE FUNCTION assert_interview_privacy_active(target_interview text)
  RETURNS void
  LANGUAGE plpgsql
  SET search_path = pg_catalog, public, pg_temp AS $$
  BEGIN
    IF NOT interview_privacy_active(target_interview) THEN
      RAISE EXCEPTION 'interview_privacy_fenced' USING ERRCODE='P0001';
    END IF;
  END $$;
  GRANT EXECUTE ON FUNCTION interview_privacy_active(text) TO app_role;
  GRANT EXECUTE ON FUNCTION assert_interview_privacy_active(text) TO app_role;
  END $wrap$;
  `);
  // GODFN-1c 逐修(续):0126 dual-write fence 函数(0092 链之后落地)缺位 → /answers 提交 500。
  // 函数体逐字同 migrations/0126(只读 interview_job;fail-closed 语义原样保留,零弱化),GRANT 同 0126。
  await admin.query(`
  DO $wrap2$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'assert_interview_answer_ledger_write_allowed') THEN RETURN; END IF;
  CREATE OR REPLACE FUNCTION assert_interview_answer_ledger_write_allowed(
    p_interview text,
    p_question_id text,
    p_state_version bigint
  ) RETURNS void
  LANGUAGE plpgsql SECURITY DEFINER
  SET search_path = pg_catalog, public, pg_temp AS $$
  DECLARE
    v_question text := NULLIF(btrim(COALESCE(p_question_id, '')), '');
  BEGIN
    IF p_interview IS NULL OR length(p_interview) = 0 OR v_question IS NULL THEN
      RAISE EXCEPTION 'interview_answer_ledger_dual_write_fenced' USING ERRCODE = 'P0001';
    END IF;

    PERFORM pg_advisory_xact_lock(hashtext('meetwise:interview_answer_writer:' || p_interview));

    -- 占用行 = kind=answer（含剥明文）或任意 kind 且带 answer 键。
    -- 无 questionId：不猜测归属，整场面试拒 ledger。
    IF EXISTS (
      SELECT 1 FROM interview_job j
       WHERE j.interview_id = p_interview
         AND (j.kind = 'answer' OR j.payload ? 'answer')
         AND NULLIF(btrim(COALESCE(j.payload->>'questionId', '')), '') IS NULL
    ) THEN
      RAISE EXCEPTION 'interview_answer_ledger_dual_write_fenced' USING ERRCODE = 'P0001';
    END IF;

    -- 同题：缺合法 stateVersion 的占用行对该题所有 version fail-closed；
    -- 能规范成 bigint 则按数值比较（"01" 与 1 视为同一 version）。
    IF EXISTS (
      SELECT 1 FROM interview_job j
       WHERE j.interview_id = p_interview
         AND (j.kind = 'answer' OR j.payload ? 'answer')
         AND NULLIF(btrim(COALESCE(j.payload->>'questionId', '')), '') = v_question
         AND (
           p_state_version IS NULL
           OR NULLIF(btrim(COALESCE(j.payload->>'stateVersion', '')), '') IS NULL
           OR NOT (btrim(COALESCE(j.payload->>'stateVersion', '')) ~ '^[0-9]+$')
           OR btrim(j.payload->>'stateVersion')::bigint = p_state_version
         )
    ) THEN
      RAISE EXCEPTION 'interview_answer_ledger_dual_write_fenced' USING ERRCODE = 'P0001';
    END IF;
  END $$;
  ALTER FUNCTION assert_interview_answer_ledger_write_allowed(text, text, bigint) OWNER TO privacy_api_owner;
  REVOKE ALL ON FUNCTION assert_interview_answer_ledger_write_allowed(text, text, bigint) FROM PUBLIC;
  GRANT EXECUTE ON FUNCTION assert_interview_answer_ledger_write_allowed(text, text, bigint) TO app_role;
  END $wrap2$;
  `);
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
  // GODFN-1c 逐修(协议面):full-migrate 靶上 0058 write-guard trigger 与 FORCE RLS 生效——admin 直插/直改
  // 必须经 principal GUC 事务(行身份=OWNER,与生产 asPrincipal 写路径同形);账本核对读同。
  const adminAs = async <T>(owner: string, fn: (q: (sql: string, params?: unknown[]) => Promise<any>) => Promise<T>): Promise<T> => {
    const cli = await admin.connect();
    try {
      await cli.query('BEGIN');
      await cli.query("SELECT set_config('app.principal_user', $1, true)", [owner]);
      const out = await fn((sql: string, params?: unknown[]) => cli.query(sql, params));
      await cli.query('COMMIT');
      return out;
    } catch (e) { await cli.query('ROLLBACK').catch(() => {}); throw e; } finally { cli.release(); }
  };
  try {
    await adminAs(OWNER, async (q) => {
      // GODFN-1c 逐修(full-migrate 靶 0144 trigger 面):v64 start job 必须携带与父 interview 绑定一致的
      // typed reference(resume_id+resume_privacy_epoch)——简历先插、interview INSERT 时即绑、job 带 v64 引用。
      await q(
        "INSERT INTO resume(id,owner_user_id,status,content_sha,source_kind,privacy_epoch) VALUES ($1,$2,'ingested',$3,'text',1)",
        [SEED_R, OWNER, 'b'.repeat(64)],
      );
      await q(
        "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions,resume_id,resume_privacy_epoch) VALUES ($1,$2,'created',0,0,'[]'::jsonb,$3,1)",
        [IID, OWNER, SEED_R],
      );
      await q(
        "INSERT INTO interview_job(owner_user_id,interview_id,kind,seq,payload,reference_schema_version,resume_id,resume_privacy_epoch) VALUES ($1,$2,'start',0,'{}',64,$3,1)",
        [OWNER, IID, SEED_R],
      );
      await q(
        "INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,status) VALUES ($1,$2,$3,1,0,'预览题','issued')",
        [OWNER, IID, QUESTION],
      );
    });

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

    await adminAs(OWNER, async (q) => {
      await q(
        "UPDATE interview_question SET status='queued' WHERE interview_id=$1 AND question_id=$2",
        [IID, QUESTION],
      );
    });
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
    await adminAs(OWNER, async (q) => {
      await q(
        "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions,resume_id,resume_privacy_epoch) VALUES ($1,$2,'created',0,0,'[]'::jsonb,$3,1)",
        [ivB, OWNER, SEED_R],
      );
      await q(
        "INSERT INTO interview_job(owner_user_id,interview_id,kind,seq,payload,reference_schema_version,resume_id,resume_privacy_epoch) VALUES ($1,$2,'start',0,'{}',64,$3,1)",
        [OWNER, ivB, SEED_R],
      );
      await q(
        "INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,status) VALUES ($1,$2,$3,1,0,'预览题B','issued')",
        [OWNER, ivB, QUESTION],
      );
    });
    const reused = await fetch(`${base}/interview/${ivB}/answers`, {
      method: 'POST', headers, body: JSON.stringify(body),
    });
    A('同 owner 跨面试复用 key 冲突，B 不落账',
      reused.status === 409 && (await json(reused)).error === 'interview_answer_submission_conflict');

    const ledger = await adminAs(OWNER, async (q) => q<{ submissions: number; artifacts: number; jobs: number; plaintext_jobs: number; ciphertext_plain: number; b_submissions: number }>(
      `SELECT
         (SELECT count(*)::int FROM interview_answer_submission WHERE owner_user_id=$1 AND interview_id=$2) AS submissions,
         (SELECT count(*)::int FROM interview_answer_artifact WHERE owner_user_id=$1 AND interview_id=$2) AS artifacts,
         (SELECT count(*)::int FROM interview_answer_job WHERE owner_user_id=$1 AND interview_id=$2) AS jobs,
         (SELECT count(*)::int FROM interview_job WHERE interview_id=$2 AND kind='answer' AND payload ? 'answer') AS plaintext_jobs,
         (SELECT count(*)::int FROM interview_answer_artifact WHERE owner_user_id=$1 AND interview_id=$2 AND ciphertext = convert_to($3,'utf8')) AS ciphertext_plain,
         (SELECT count(*)::int FROM interview_answer_submission WHERE owner_user_id=$1 AND interview_id=$4) AS b_submissions`,
      [OWNER, IID, ANSWER, ivB],
    ));
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

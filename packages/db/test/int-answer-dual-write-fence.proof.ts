/**
 * 答题正文双写互斥（0126 / UC-INT-ANSWER-DUAL-WRITE-FENCE）。
 *
 * 证明：legacy 明文 interview_job.payload.answer 与 ledger artifact 对同一
 * 答题身份不能并存；残缺身份 fail-closed；interview_event 禁止顶层 answer。
 * 不证明 INT-TRANSCRIPT-01、删除授权、删后 read=0 或生产 HTTP 已切 ledger。
 *
 *   pnpm int-answer-dual-write-fence:prove
 */
import { randomUUID } from 'node:crypto';
import {
  createPool, asPrincipal, assertIsolatedTestTarget,
  submitInterviewAnswer, enqueueInterviewJob, appendEvent, markJobDone,
  createResumeWithBlob, completeIngestion, transitionResume,
  INTERVIEW_ANSWER_LEGACY_PLAINTEXT_FENCED, INTERVIEW_ANSWER_LEDGER_DUAL_WRITE_FENCED,
  INTERVIEW_EVENT_RAW_ANSWER_FENCED,
} from '@meetwise/db';
import { ingestResume } from '@meetwise/domain';

process.env.INTERVIEW_ANSWER_ENC_KEY = 'proof_answer_enc_key_v1_16chars';
process.env.INTERVIEW_ANSWER_HMAC_SECRET = 'proof_answer_hmac_secret_16chars';

const admin = createPool();
const owner = `dual-write-owner-${process.pid}`;
const otherOwner = `dual-write-other-${process.pid}`;

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

const errorCode = (error: unknown): string => {
  const e = error as { code?: string; message?: string } | null;
  if (typeof e?.code === 'string' && e.code !== 'P0001') return e.code;
  const message = String(e?.message ?? error);
  for (const code of [
    INTERVIEW_ANSWER_LEGACY_PLAINTEXT_FENCED,
    INTERVIEW_ANSWER_LEDGER_DUAL_WRITE_FENCED,
    INTERVIEW_EVENT_RAW_ANSWER_FENCED,
  ]) {
    if (message.includes(code)) return code;
  }
  return message;
};
const rejected = async (fn: () => Promise<unknown>): Promise<string | null> => {
  try { await fn(); return null; } catch (error) { return errorCode(error); }
};

async function seedResumeInterview(ownerId: string, interviewId: string, text: string, withStart = true): Promise<void> {
  await asPrincipal(admin, ownerId, async (c) => {
    const upload = await createResumeWithBlob(c, ownerId, text);
    await transitionResume(c, ownerId, upload.resumeId, 'uploaded', 'ingesting');
    await completeIngestion(c, ownerId, upload.resumeId, ingestResume(text));
    const epoch = Number((await c.query<{ privacy_epoch: number }>(
      'SELECT privacy_epoch FROM resume WHERE id=$1 AND owner_user_id=$2', [upload.resumeId, ownerId],
    )).rows[0]!.privacy_epoch);
    await c.query(
      `INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch)
       VALUES ($1,$2,'active',$3,$4)`,
      [interviewId, ownerId, upload.resumeId, epoch],
    );
    if (withStart) await enqueueInterviewJob(c, ownerId, interviewId, 'start', { requestId: `start-${interviewId}` }, 0);
  });
}

async function seedBareInterview(ownerId: string, interviewId: string): Promise<void> {
  await admin.query(
    "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions) VALUES ($1,$2,'active',0,0,'[]'::jsonb)",
    [interviewId, ownerId],
  );
}

const submit = (ownerId: string, interviewId: string, questionId: string, key: string, answer = 'ledger-body') =>
  asPrincipal(admin, ownerId, (c) => submitInterviewAnswer(c, {
    interviewId, questionId, stateVersion: 1, clientSubmissionKey: key, answer, privacyEpoch: 1,
  }));

const enqueueAnswer = (ownerId: string, interviewId: string, questionId: string, seq: number, answer = 'legacy-plaintext') =>
  asPrincipal(admin, ownerId, (c) => enqueueInterviewJob(c, ownerId, interviewId, 'answer', {
    questionId, stateVersion: 1, turn: seq - 1, answerId: '11111111-1111-4111-8111-111111111111',
    answerHash: 'a'.repeat(64), answer,
  }, seq));

const countJobs = (interviewId: string, questionId?: string) => admin.query<{ n: number }>(
  questionId
    ? `SELECT count(*)::int AS n FROM interview_job
        WHERE interview_id=$1 AND kind='answer' AND payload->>'questionId'=$2`
    : `SELECT count(*)::int AS n FROM interview_job WHERE interview_id=$1 AND kind='answer'`,
  questionId ? [interviewId, questionId] : [interviewId],
).then((r) => r.rows[0]!.n);

const countPlaintext = (interviewId: string, questionId?: string) => admin.query<{ n: number }>(
  questionId
    ? `SELECT count(*)::int AS n FROM interview_job
        WHERE interview_id=$1 AND payload ? 'answer'
          AND NULLIF(btrim(COALESCE(payload->>'questionId','')), '')=$2`
    : `SELECT count(*)::int AS n FROM interview_job
        WHERE interview_id=$1 AND payload ? 'answer'`,
  questionId ? [interviewId, questionId] : [interviewId],
).then((r) => r.rows[0]!.n);

const countArtifacts = (interviewId: string, questionId?: string) => admin.query<{ n: number }>(
  questionId
    ? 'SELECT count(*)::int AS n FROM interview_answer_artifact WHERE interview_id=$1 AND question_id=$2'
    : 'SELECT count(*)::int AS n FROM interview_answer_artifact WHERE interview_id=$1',
  questionId ? [interviewId, questionId] : [interviewId],
).then((r) => r.rows[0]!.n);

async function main() {
  await assertIsolatedTestTarget(admin);

  /* ── 正常：两族各自可写，不同时存在 ── */
  const ivLegacy = `dw-legacy-${process.pid}`;
  await seedResumeInterview(owner, ivLegacy, `经历：双写围栏 legacy ${process.pid}`);
  const jobId = await enqueueAnswer(owner, ivLegacy, 'q-legacy', 1);
  A('TC-main 无 ledger 时 legacy 明文 job 入队', typeof jobId === 'string' && jobId.length > 0 && (await countPlaintext(ivLegacy, 'q-legacy')) === 1);
  A('TC-main legacy 路径 artifact=0', (await countArtifacts(ivLegacy, 'q-legacy')) === 0);
  A('TC-E1 同 seq 明文重放不新建、不打开 ledger',
    (await enqueueAnswer(owner, ivLegacy, 'q-legacy', 1)) === jobId
    && (await countJobs(ivLegacy, 'q-legacy')) === 1
    && (await countArtifacts(ivLegacy, 'q-legacy')) === 0);

  const ivLedger = `dw-ledger-${process.pid}`;
  await seedBareInterview(owner, ivLedger);
  const submitted = await submit(owner, ivLedger, 'q-ledger', 'sub-ledger');
  A('TC-main 无匹配 job 时 ledger artifact 可插入', submitted.status === 'accepted_unscored' && submitted.replayed === false);
  A('TC-main ledger 路径匹配明文 job=0', (await countJobs(ivLedger, 'q-ledger')) === 0);
  const replayed = await submit(owner, ivLedger, 'q-ledger', 'sub-ledger');
  A('TC-E1 同键 ledger 重放不打开明文 job',
    replayed.replayed === true && replayed.submissionId === submitted.submissionId
    && (await countJobs(ivLedger, 'q-ledger')) === 0);

  /* ── 对向拒绝 + 回滚 ── */
  const ivMutex = `dw-mutex-${process.pid}`;
  await seedResumeInterview(owner, ivMutex, `经历：双写围栏 mutex ${process.pid}`);
  await enqueueAnswer(owner, ivMutex, 'q-mutex', 1);
  A('TC-E1/E4 job 已在时 ledger 拒且 artifact=0',
    (await rejected(() => submit(owner, ivMutex, 'q-mutex', 'sub-mutex'))) === INTERVIEW_ANSWER_LEDGER_DUAL_WRITE_FENCED
    && (await countArtifacts(ivMutex, 'q-mutex')) === 0);

  const ivMutex2 = `dw-mutex2-${process.pid}`;
  await seedResumeInterview(owner, ivMutex2, `经历：双写围栏 mutex2 ${process.pid}`);
  await submit(owner, ivMutex2, 'q-mutex2', 'sub-mutex2');
  A('TC-E1/E4 artifact 已在时明文 job 拒且 plaintext=0',
    (await rejected(() => enqueueAnswer(owner, ivMutex2, 'q-mutex2', 1))) === INTERVIEW_ANSWER_LEGACY_PLAINTEXT_FENCED
    && (await countPlaintext(ivMutex2, 'q-mutex2')) === 0);

  /* ── 特殊：start / 无 answer 键 / 不同题 / 规范 identity ── */
  const ivSpec = `dw-spec-${process.pid}`;
  await seedResumeInterview(owner, ivSpec, `经历：双写围栏 spec ${process.pid}`);
  A('TC-S1 仅 start job 不阻挡 ledger',
    (await submit(owner, ivSpec, 'q-spec', 'sub-spec')).replayed === false
    && (await countArtifacts(ivSpec, 'q-spec')) === 1);

  const ivOtherQ = `dw-otherq-${process.pid}`;
  await seedResumeInterview(owner, ivOtherQ, `经历：双写围栏 otherq ${process.pid}`);
  await enqueueAnswer(owner, ivOtherQ, 'q-a', 1);
  A('TC-S1 不同 question 可走 ledger',
    (await submit(owner, ivOtherQ, 'q-b', 'sub-otherq')).replayed === false
    && (await countArtifacts(ivOtherQ, 'q-b')) === 1
    && (await countPlaintext(ivOtherQ, 'q-a')) === 1);

  const ivNoAnswerKey = `dw-noref-${process.pid}`;
  await seedResumeInterview(owner, ivNoAnswerKey, `经历：双写围栏 noref ${process.pid}`);
  await submit(owner, ivNoAnswerKey, 'q-noref', 'sub-noref');
  const refOnlyJob = await asPrincipal(admin, owner, (c) => enqueueInterviewJob(c, owner, ivNoAnswerKey, 'answer', {
    questionId: 'q-noref', stateVersion: 1, turn: 0, requestId: 'no-body',
  }, 1));
  A('TC-S1 artifact 已在时无 answer 键的 job 仍可入队（非明文双写）',
    typeof refOnlyJob === 'string' && (await countPlaintext(ivNoAnswerKey, 'q-noref')) === 0
    && (await countArtifacts(ivNoAnswerKey, 'q-noref')) === 1);

  const ivPad = `dw-pad-${process.pid}`;
  await seedResumeInterview(owner, ivPad, `经历：双写围栏 pad ${process.pid}`);
  await asPrincipal(admin, owner, (c) => enqueueInterviewJob(c, owner, ivPad, 'answer', {
    questionId: ' q-pad ', stateVersion: '01', turn: 0, answer: 'padded-identity',
  }, 1));
  A('TC-S1 空白 questionId / stateVersion 01 与规范身份重叠，ledger 拒',
    (await rejected(() => submit(owner, ivPad, 'q-pad', 'sub-pad'))) === INTERVIEW_ANSWER_LEDGER_DUAL_WRITE_FENCED
    && (await countArtifacts(ivPad, 'q-pad')) === 0);

  /* ── 复杂：剥明文后仍拒；残缺身份 fail-closed；start+answer ── */
  const ivStrip = `dw-strip-${process.pid}`;
  await seedResumeInterview(owner, ivStrip, `经历：双写围栏 strip ${process.pid}`);
  const stripJob = await enqueueAnswer(owner, ivStrip, 'q-strip', 1);
  await asPrincipal(admin, owner, async (c) => {
    await c.query(
      "UPDATE interview_job SET status='running', lease_owner=$2 WHERE id=$1 AND owner_user_id=$3",
      [stripJob, 'proof-lease', owner],
    );
    A('TC-M1 终态剥离 answer 成功', await markJobDone(c, owner, stripJob, 'proof-lease'));
  });
  A('TC-M1 剥明文后 payload 无 answer 但 ledger 仍拒',
    (await admin.query<{ has_answer: boolean }>(
      "SELECT (payload ? 'answer') AS has_answer FROM interview_job WHERE id=$1", [stripJob],
    )).rows[0]?.has_answer === false
    && (await rejected(() => submit(owner, ivStrip, 'q-strip', 'sub-strip'))) === INTERVIEW_ANSWER_LEDGER_DUAL_WRITE_FENCED);

  const ivUnkeyed = `dw-unkeyed-${process.pid}`;
  await seedResumeInterview(owner, ivUnkeyed, `经历：双写围栏 unkeyed ${process.pid}`);
  await asPrincipal(admin, owner, (c) => enqueueInterviewJob(c, owner, ivUnkeyed, 'answer', {
    answer: '无身份明文',
  }, 1));
  A('TC-M1 无 questionId 的明文 answer job 对整场面试拒 ledger',
    (await rejected(() => submit(owner, ivUnkeyed, 'q-any', 'sub-unkeyed'))) === INTERVIEW_ANSWER_LEDGER_DUAL_WRITE_FENCED
    && (await countArtifacts(ivUnkeyed)) === 0);

  const ivNoSv = `dw-nosv-${process.pid}`;
  await seedResumeInterview(owner, ivNoSv, `经历：双写围栏 nosv ${process.pid}`);
  await asPrincipal(admin, owner, (c) => enqueueInterviewJob(c, owner, ivNoSv, 'answer', {
    questionId: 'q-nosv', answer: '缺 version 明文',
  }, 1));
  A('TC-M1 有 questionId、无 stateVersion 的明文 job 对该题任意 version 拒 ledger',
    (await rejected(() => submit(owner, ivNoSv, 'q-nosv', 'sub-nosv'))) === INTERVIEW_ANSWER_LEDGER_DUAL_WRITE_FENCED
    && (await countArtifacts(ivNoSv, 'q-nosv')) === 0);

  const ivStartAns = `dw-startans-${process.pid}`;
  await seedResumeInterview(owner, ivStartAns, `经历：双写围栏 startans ${process.pid}`, false);
  await asPrincipal(admin, owner, (c) => enqueueInterviewJob(c, owner, ivStartAns, 'start', {
    questionId: 'q-start', stateVersion: 1, answer: 'start-body', requestId: `start-${ivStartAns}`,
  }, 0));
  A('TC-M1 start 带 answer 键占用该身份，ledger 拒',
    (await rejected(() => submit(owner, ivStartAns, 'q-start', 'sub-start'))) === INTERVIEW_ANSWER_LEDGER_DUAL_WRITE_FENCED
    && (await countArtifacts(ivStartAns, 'q-start')) === 0);

  const ivStartFence = `dw-startf-${process.pid}`;
  await seedResumeInterview(owner, ivStartFence, `经历：双写围栏 startf ${process.pid}`, false);
  await submit(owner, ivStartFence, 'q-startf', 'sub-startf');
  A('TC-M1 artifact 已在时 start 带 answer 被拒',
    (await rejected(() => asPrincipal(admin, owner, (c) => enqueueInterviewJob(c, owner, ivStartFence, 'start', {
      questionId: 'q-startf', stateVersion: 1, answer: 'start-after-ledger', requestId: `start-${ivStartFence}`,
    }, 0)))) === INTERVIEW_ANSWER_LEGACY_PLAINTEXT_FENCED
    && (await countPlaintext(ivStartFence, 'q-startf')) === 0);

  const ivEmpty = `dw-empty-${process.pid}`;
  await seedResumeInterview(owner, ivEmpty, `经历：双写围栏 empty ${process.pid}`);
  await submit(owner, ivEmpty, 'q-empty', 'sub-empty');
  A('TC-M1 空串 answer 键仍算明文，被拒',
    (await rejected(() => asPrincipal(admin, owner, (c) => enqueueInterviewJob(c, owner, ivEmpty, 'answer', {
      questionId: 'q-empty', stateVersion: 1, answer: '',
    }, 1)))) === INTERVIEW_ANSWER_LEGACY_PLAINTEXT_FENCED);
  A('TC-M1 JSON null answer 键仍算明文，被拒',
    (await rejected(() => asPrincipal(admin, owner, (c) => enqueueInterviewJob(c, owner, ivEmpty, 'answer', {
      questionId: 'q-empty', stateVersion: 1, answer: null,
    }, 2)))) === INTERVIEW_ANSWER_LEGACY_PLAINTEXT_FENCED);

  const ivTomb = `dw-tomb-${process.pid}`;
  await seedResumeInterview(owner, ivTomb, `经历：双写围栏 tomb ${process.pid}`);
  await submit(owner, ivTomb, 'q-tomb', 'sub-tomb');
  await admin.query("UPDATE interview_answer_artifact SET status='fenced' WHERE interview_id=$1", [ivTomb]);
  A('TC-M1 artifact status=fenced 仍拒明文（禁止按 status 放行）',
    (await rejected(() => enqueueAnswer(owner, ivTomb, 'q-tomb', 1))) === INTERVIEW_ANSWER_LEGACY_PLAINTEXT_FENCED
    && (await countPlaintext(ivTomb, 'q-tomb')) === 0);
  await admin.query("UPDATE interview_answer_artifact SET status='erased' WHERE interview_id=$1", [ivTomb]);
  A('TC-M1 artifact status=erased 仍拒明文（只有物理 DELETE 解除）',
    (await rejected(() => enqueueAnswer(owner, ivTomb, 'q-tomb', 2))) === INTERVIEW_ANSWER_LEGACY_PLAINTEXT_FENCED
    && (await countPlaintext(ivTomb, 'q-tomb')) === 0);

  /* ── 逃逸：raw SQL 触发器；跨 owner 无仓储 oracle；UPDATE 改身份 ── */
  const ivSql = `dw-sql-${process.pid}`;
  await seedResumeInterview(owner, ivSql, `经历：双写围栏 sql ${process.pid}`);
  await enqueueAnswer(owner, ivSql, 'q-sql', 1);
  const sqlSubmissionId = randomUUID();
  const sqlArtifactId = randomUUID();
  A('TC-E3 原始 SQL 插 artifact 被触发器拒',
    (await rejected(() => asPrincipal(admin, owner, async (c) => {
      await c.query(
        `INSERT INTO interview_answer_submission(id,owner_user_id,interview_id,question_id,state_version,client_submission_key,canonical_body_hmac,privacy_epoch)
         VALUES ($1,current_setting('app.principal_user',true),$2,'q-sql',1,'sql-key',$3,1)`,
        [sqlSubmissionId, ivSql, 'b'.repeat(64)],
      );
      // 不 SELECT submission：app_role 对该表无读权限；显式 id 让触发器成为唯一失败点。
      await c.query(
        `INSERT INTO interview_answer_artifact(id,owner_user_id,interview_id,question_id,state_version,submission_id,ciphertext,body_hmac,hmac_key_version,enc_key_version,privacy_epoch)
         VALUES ($1,current_setting('app.principal_user',true),$2,'q-sql',1,$3,pgp_sym_encrypt('x','k'),$4,1,1,1)`,
        [sqlArtifactId, ivSql, sqlSubmissionId, 'b'.repeat(64)],
      );
    }))) === INTERVIEW_ANSWER_LEDGER_DUAL_WRITE_FENCED
    && (await countArtifacts(ivSql, 'q-sql')) === 0);

  await seedBareInterview(otherOwner, `dw-otheriv-${process.pid}`);
  const cross = await rejected(() => enqueueAnswer(otherOwner, ivLegacy, 'q-legacy', 9));
  A('TC-E3 跨 owner 入队失败且不泄露对向 artifact 存在性（错误不是围栏码）',
    cross !== null && cross !== INTERVIEW_ANSWER_LEDGER_DUAL_WRITE_FENCED && cross !== INTERVIEW_ANSWER_LEGACY_PLAINTEXT_FENCED);

  const crossArt = await rejected(() => enqueueAnswer(otherOwner, ivMutex2, 'q-mutex2', 9));
  A('TC-E3 跨 owner 打已有 artifact 的面试仍不是围栏码（仓储路径无存在 oracle）',
    crossArt !== null && crossArt !== INTERVIEW_ANSWER_LEDGER_DUAL_WRITE_FENCED && crossArt !== INTERVIEW_ANSWER_LEGACY_PLAINTEXT_FENCED);

  const ivMoveSrc = `dw-mvsrc-${process.pid}`;
  const ivMoveDst = `dw-mvdst-${process.pid}`;
  await seedResumeInterview(owner, ivMoveSrc, `经历：双写围栏 mvsrc ${process.pid}`);
  await seedResumeInterview(owner, ivMoveDst, `经历：双写围栏 mvdst ${process.pid}`);
  await submit(owner, ivMoveDst, 'q-move', 'sub-move');
  const moveJob = await enqueueAnswer(owner, ivMoveSrc, 'q-move', 1);
  A('TC-E3 UPDATE interview_id 把明文 job 搬到已有 artifact 的面试被拒',
    (await rejected(() => asPrincipal(admin, owner, (c) => c.query(
      'UPDATE interview_job SET interview_id=$2 WHERE id=$1', [moveJob, ivMoveDst],
    )))) === INTERVIEW_ANSWER_LEGACY_PLAINTEXT_FENCED
    && (await admin.query<{ interview_id: string }>('SELECT interview_id FROM interview_job WHERE id=$1', [moveJob])).rows[0]?.interview_id === ivMoveSrc);

  const ivAddKey = `dw-addkey-${process.pid}`;
  await seedResumeInterview(owner, ivAddKey, `经历：双写围栏 addkey ${process.pid}`);
  await submit(owner, ivAddKey, 'q-add', 'sub-add');
  const bareJob = await asPrincipal(admin, owner, (c) => enqueueInterviewJob(c, owner, ivAddKey, 'answer', {
    questionId: 'q-add', stateVersion: 1, requestId: 'later-body',
  }, 1));
  A('TC-E3 UPDATE 给已有 job 补 answer 键被拒',
    (await rejected(() => asPrincipal(admin, owner, (c) => c.query(
      "UPDATE interview_job SET payload=payload||'{\"answer\":\"late-body\"}'::jsonb WHERE id=$1", [bareJob],
    )))) === INTERVIEW_ANSWER_LEGACY_PLAINTEXT_FENCED
    && (await countPlaintext(ivAddKey, 'q-add')) === 0);

  /* ── 事件围栏 ── */
  const ivEv = `dw-event-${process.pid}`;
  await seedBareInterview(owner, ivEv);
  const evSeq = await asPrincipal(admin, owner, (c) => appendEvent(c, owner, ivEv, 'answer_evaluated', {
    questionId: 'q-ev', stateVersion: 1, answerId: '11111111-1111-4111-8111-111111111111',
    answerHash: 'c'.repeat(64), turn: 0, competency: '订单',
  }));
  A('TC-S1/T1 事件可含 answerHash，不可含原文', Number.isInteger(evSeq) && evSeq >= 1);
  A('TC-T1 appendEvent 拒绝顶层 answer',
    (await rejected(() => asPrincipal(admin, owner, (c) => appendEvent(c, owner, ivEv, 'answer_evaluated', {
      questionId: 'q-ev2', answer: 'TurnDto 展开原文',
    })))) === INTERVIEW_EVENT_RAW_ANSWER_FENCED);
  A('TC-T1 原始 SQL 事件带 answer 被触发器拒',
    (await rejected(() => asPrincipal(admin, owner, (c) => c.query(
      `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload)
       SELECT current_setting('app.principal_user',true),$1,COALESCE(MAX(seq),0)+1,'answer_evaluated',$2::jsonb
         FROM interview_event WHERE stream_key=$1`,
      [ivEv, JSON.stringify({ questionId: 'q-ev3', answer: 'raw-sql-answer' })],
    )))) === INTERVIEW_EVENT_RAW_ANSWER_FENCED);
  A('TC-T1 事件数组含 answer 元素被拒（与 jsonb ? 对齐）',
    (await rejected(() => asPrincipal(admin, owner, (c) => appendEvent(c, owner, ivEv, 'answer_evaluated', ['answer']))))
    === INTERVIEW_EVENT_RAW_ANSWER_FENCED);
  A('TC-T1 嵌套 answer 不在本围栏（顶层键才拦）',
    Number.isInteger(await asPrincipal(admin, owner, (c) => appendEvent(c, owner, ivEv, 'answer_evaluated', {
      questionId: 'q-nested', turn: { answer: 'nested-not-top-level' },
    }))));

  /* ── 高并发：完整身份 + 残缺身份，明文与 artifact 不同时 >0 ── */
  const ivRace = `dw-race-${process.pid}`;
  await seedResumeInterview(owner, ivRace, `经历：双写围栏 race ${process.pid}`);
  const race = await Promise.all(Array.from({ length: 20 }, (_, i) => {
    if (i % 2 === 0) {
      return enqueueAnswer(owner, ivRace, 'q-race', i + 1, `plain-${i}`).then(() => 'job' as const, () => 'rejected' as const);
    }
    return submit(owner, ivRace, 'q-race', `sub-race-${i}`, `led-${i}`).then(() => 'ledger' as const, () => 'rejected' as const);
  }));
  const racePlain = await countPlaintext(ivRace, 'q-race');
  const raceArts = await countArtifacts(ivRace, 'q-race');
  A('TC-E2 20 路完整身份对向写入后明文与 artifact 不同时 >0',
    racePlain >= 0 && raceArts >= 0 && !(racePlain > 0 && raceArts > 0)
    && (racePlain > 0 || raceArts > 0)
    && race.filter((x) => x !== 'rejected').length >= 1);

  const ivRaceU = `dw-raceu-${process.pid}`;
  await seedResumeInterview(owner, ivRaceU, `经历：双写围栏 raceu ${process.pid}`);
  const raceU = await Promise.all(Array.from({ length: 20 }, (_, i) => {
    if (i % 2 === 0) {
      return asPrincipal(admin, owner, (c) => enqueueInterviewJob(c, owner, ivRaceU, 'answer', {
        answer: `unkeyed-${i}`,
      }, i + 1)).then(() => 'job' as const, () => 'rejected' as const);
    }
    return submit(owner, ivRaceU, 'q-raceu', `sub-raceu-${i}`, `led-u-${i}`).then(() => 'ledger' as const, () => 'rejected' as const);
  }));
  A('TC-E2 20 路无 questionId job × ledger 后两族不得并存',
    !((await countPlaintext(ivRaceU)) > 0 && (await countArtifacts(ivRaceU)) > 0)
    && ((await countPlaintext(ivRaceU)) > 0 || (await countArtifacts(ivRaceU)) > 0)
    && raceU.filter((x) => x !== 'rejected').length >= 1);

  const ivRaceS = `dw-races-${process.pid}`;
  await seedResumeInterview(owner, ivRaceS, `经历：双写围栏 races ${process.pid}`);
  const raceS = await Promise.all(Array.from({ length: 20 }, (_, i) => {
    if (i % 2 === 0) {
      return asPrincipal(admin, owner, (c) => enqueueInterviewJob(c, owner, ivRaceS, 'answer', {
        questionId: 'q-races', answer: `nosv-${i}`,
      }, i + 1)).then(() => 'job' as const, () => 'rejected' as const);
    }
    return submit(owner, ivRaceS, 'q-races', `sub-races-${i}`, `led-s-${i}`).then(() => 'ledger' as const, () => 'rejected' as const);
  }));
  A('TC-E2 20 路有题无 version job × ledger 后两族不得并存',
    !((await countPlaintext(ivRaceS, 'q-races')) > 0 && (await countArtifacts(ivRaceS, 'q-races')) > 0)
    && ((await countPlaintext(ivRaceS, 'q-races')) > 0 || (await countArtifacts(ivRaceS, 'q-races')) > 0)
    && raceS.filter((x) => x !== 'rejected').length >= 1);

  await admin.end();
  console.log(failures === 0
    ? '\n✓ 答题双写互斥围栏 DB 证明通过（本地隔离证据；不是 INT-TRANSCRIPT-01）'
    : `\n✗ ${failures} 个断言失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => { console.error(e); await admin.end().catch(() => undefined); process.exit(1); });

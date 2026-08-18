/**
 * 答案事实根（INT-TRANSCRIPT-00）DB 证明。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres（完整迁移 + nonce 校验）。证明：
 *   - 加密正文源（pgp_sym_encrypt 密文 + keyed-HMAC 指纹，解密可回环、非明文落库）
 *   - 提交幂等（同键同体回放 / 同键异体冲突）+ 首包 accepted_unscored（副作用 = 0）
 *   - 读侧只吐 watermark（绝无原文/密文）；app_role 无 ciphertext 读权限；跨 owner 读 = 0
 *   - 非破坏 fence（begin-erasure 后 submit/readback/view 全封禁；单向 guard 拒绝回放；
 *     原始 app_role SQL 亦不得在 fence 后重建正文 = 防御纵深）
 *   - **复用冻结 PrivacyAuthorizationIssuer**：sign → issue → consume → claim → purge 全链路，
 *     目标集活 digest 与签名快照逐字节相等（TS↔SQL H1），逐 sink receipt，删后物理 read=0
 *   - submit×delete 竞态（20 并发单 winner，advisory 锁串行）
 */
import {
  createPool, asPrincipal, asPrivacyWorkerPrincipal, asPrivacyWorkerExecutor, assertIsolatedTestTarget,
  issueAuthorizationSnapshot, consumeAuthorizationSnapshot, claimAuthorizationTarget,
  recordDeletionReceipt,
  submitInterviewAnswer, readbackInterviewAnswerSubmission, viewInterviewAnswerSnapshot,
  beginInterviewAnswerFactErasure, listClaimableInterviewAnswerArtifactTargets, purgeInterviewAnswerArtifactTarget,
  answerBodyHmac,
  type Client,
} from '@meetwise/db';
import {
  canonicalTargetSetDigest, generatePrivacyAuthzKeyPair, signPrivacyAuthorizationSnapshot,
  type PrivacyAuthzTarget,
} from '@meetwise/domain';

// 确定性密钥（在调用 submit/answerBodyHmac 前注入；int-transcript.ts 的密钥读取是惰性的）。
// 长度 ≥16 以通过 requireSecret；加密 key 同时用于下方解密回环断言。
const ENC_KEY = 'proof_answer_enc_key_v1_16chars';
process.env.INTERVIEW_ANSWER_ENC_KEY = ENC_KEY;
process.env.INTERVIEW_ANSWER_HMAC_SECRET = 'proof_answer_hmac_secret_16chars';

const admin = createPool();
const owner = `int-transcript-owner-${process.pid}`;
const otherOwner = `int-transcript-other-${process.pid}`;
const worker = `int-transcript-worker-${process.pid}`;
const NOW_SEC = Math.floor(Date.now() / 1000);
const KEY = generatePrivacyAuthzKeyPair('privacy-del-2026-01');

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };

// 签发器专用 principal（SET LOCAL ROLE privacy_issuer + 绑定 owner GUC），模拟未来 issuer 服务。
async function asIssuer<T>(principal: string, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await admin.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE privacy_issuer');
    await c.query("SELECT set_config('app.principal_user', $1, true)", [principal]);
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK').catch(() => undefined); throw e; } finally { c.release(); }
}

let hashCounter = 0;
const nextHash = () => (++hashCounter).toString(16).padStart(64, '0');

async function insertInterview(ownerId: string, interviewId: string): Promise<void> {
  await admin.query(
    "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions) VALUES ($1,$2,'active',0,0,'[]'::jsonb)",
    [interviewId, ownerId],
  );
}

const submit = (ownerId: string, input: Parameters<typeof submitInterviewAnswer>[1]) =>
  asPrincipal(admin, ownerId, (c) => submitInterviewAnswer(c, input));
const readback = (ownerId: string, key: string) =>
  asPrincipal(admin, ownerId, (c) => readbackInterviewAnswerSubmission(c, key));
const view = (ownerId: string, interviewId: string, after = 0) =>
  asPrincipal(admin, ownerId, (c) => viewInterviewAnswerSnapshot(c, interviewId, after));
const beginErasure = (ownerId: string, interviewId: string, keyHash: string, epoch: number) =>
  asPrincipal(admin, ownerId, (c) => beginInterviewAnswerFactErasure(c, interviewId, keyHash, epoch));
const purge = (ownerId: string, targetId: string, token: string) =>
  asPrivacyWorkerPrincipal(admin, ownerId, (c) => purgeInterviewAnswerArtifactTarget(c, targetId, token));

function signSnapshot(ownerId: string, interviewId: string, epoch: number, targets: PrivacyAuthzTarget[]) {
  return signPrivacyAuthorizationSnapshot({
    privateKeyPem: KEY.privateKeyPem, kid: KEY.kid, actor: ownerId, owner: ownerId, interview: interviewId,
    purpose: 'interview_data_erasure', privacyEpoch: epoch, targets, nowSec: NOW_SEC, ttlSec: 600,
  });
}
async function issueSigned(ownerId: string, interviewId: string, epoch: number, targets: PrivacyAuthzTarget[]) {
  const signed = signSnapshot(ownerId, interviewId, epoch, targets);
  await asIssuer(ownerId, (c) => issueAuthorizationSnapshot(c, {
    jti: signed.jti, keyId: KEY.kid, actor: ownerId, interviewId,
    purpose: 'interview_data_erasure', privacyEpoch: epoch, targetSetDigest: signed.targetSetDigest,
    expiresAt: new Date(signed.expiresAtMs),
  }));
  return signed;
}
const consume = (jti: string) => asPrivacyWorkerExecutor(admin, (c) => consumeAuthorizationSnapshot(c, jti, worker));
const claim = (ownerId: string, jti: string, targetId: string) =>
  asPrivacyWorkerPrincipal(admin, ownerId, (c) => claimAuthorizationTarget(c, jti, targetId, worker, 60));

async function main() {
  await assertIsolatedTestTarget(admin);

  /* ── A. 加密正文源 + 首包 accepted_unscored + watermark ─────────────────── */
  const ivA = '00000000-0000-4000-8000-0000000000a1';
  const ANSWER = 'my-secret-answer-body-12345';
  const bodyHmac = answerBodyHmac(ANSWER);
  await insertInterview(owner, ivA);

  const submitted = await submit(owner, {
    interviewId: ivA, questionId: 'q-1', stateVersion: 2, clientSubmissionKey: 'sub-key-1',
    answer: ANSWER, privacyEpoch: 5,
  });
  A('首包提交落 accepted_unscored(replayed=false, 三件套非空)',
    submitted.status === 'accepted_unscored' && submitted.replayed === false
    && submitted.submissionId.length > 0 && submitted.artifactId.length > 0 && submitted.jobId.length > 0);
  A('回执 canonicalBodyHmac == keyed-HMAC(答案)', submitted.canonicalBodyHmac === bodyHmac);

  const atRest = await admin.query<{ roundtrip: boolean; encrypted_at_rest: boolean }>(
    `SELECT (pgp_sym_decrypt(ciphertext, $1) = $2) AS roundtrip,
            (ciphertext <> convert_to($2,'utf8')) AS encrypted_at_rest
       FROM interview_answer_artifact WHERE id = $3`,
    [ENC_KEY, ANSWER, submitted.artifactId],
  );
  A('密文用 key 解密回环 == 原文（加密正文源，非明文落库）',
    atRest.rows[0]?.roundtrip === true && atRest.rows[0]?.encrypted_at_rest === true);

  const receipt = await readback(owner, 'sub-key-1');
  A('读回执返回 watermark（submissionId/bodyHmac/artifactId，无原文/密文）',
    receipt !== null && receipt.submissionId === submitted.submissionId
    && receipt.canonicalBodyHmac === bodyHmac && receipt.artifactId === submitted.artifactId);

  const snap = await view(owner, ivA);
  const snapItem = snap.items[0];
  A('只读视图 watermark（1 item, status=active, 无原文/密文）',
    snap.items.length === 1 && snapItem !== undefined && snapItem.status === 'active' && snapItem.bodyHmac === bodyHmac
    && snap.highWatermark === 2
    && !JSON.stringify(snap).includes(ANSWER) && !JSON.stringify(snap).includes('cipher'));
  A('app_role 无 ciphertext 读权限（原始 SELECT 被拒）',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query('SELECT ciphertext FROM interview_answer_artifact'))));

  /* ── B. 提交幂等（提交恢复：同键回放 / 同键异体冲突）──────────────────── */
  const replayed = await submit(owner, {
    interviewId: ivA, questionId: 'q-1', stateVersion: 2, clientSubmissionKey: 'sub-key-1',
    answer: ANSWER, privacyEpoch: 5,
  });
  A('同键同体重放 → replayed=true 且同 submissionId/artifactId',
    replayed.replayed === true && replayed.submissionId === submitted.submissionId
    && replayed.artifactId === submitted.artifactId);
  A('同键异体 → 冲突 fail-closed',
    await rejects(() => submit(owner, {
      interviewId: ivA, questionId: 'q-1', stateVersion: 2, clientSubmissionKey: 'sub-key-1',
      answer: 'DIFFERENT-ANSWER-BODY', privacyEpoch: 5,
    })));

  /* ── B2. 回放回显落库事实 + job 状态机（单向 guard + 首态 pin）─────────── */
  const ivB = '00000000-0000-4000-8000-0000000000a2';
  await insertInterview(owner, ivB);
  // 同键同体但跨题/跨面试/改 epoch 回放：回放必须回显**落库事实**，绝不回显调用方输入
  // （否则同一 clientSubmissionKey 跨题重放会回报错账元数据）。
  const crossReplay = await submit(owner, {
    interviewId: ivB, questionId: 'q-other', stateVersion: 99, clientSubmissionKey: 'sub-key-1',
    answer: ANSWER, privacyEpoch: 9,
  });
  A('同键同体跨题回放 → 回显落库事实(interviewId/questionId/stateVersion/epoch/jobId)而非输入',
    crossReplay.replayed === true && crossReplay.submissionId === submitted.submissionId
    && crossReplay.artifactId === submitted.artifactId && crossReplay.jobId === submitted.jobId
    && crossReplay.interviewId === ivA && crossReplay.questionId === 'q-1'
    && crossReplay.stateVersion === 2 && crossReplay.privacyEpoch === 5);

  // job 状态机：queued→running 允许，running→queued 回退与 done(终态) 逆移被单向 guard 拒。
  const b = await submit(owner, {
    interviewId: ivB, questionId: 'q-b', stateVersion: 1, clientSubmissionKey: 'sub-key-b',
    answer: 'throwaway-answer-body', privacyEpoch: 5,
  });
  A('job 单向 guard：queued→running 允许',
    (await admin.query("UPDATE interview_answer_job SET status='running', version=version+1 WHERE id=$1 AND status='queued'", [b.jobId])).rowCount === 1);
  A('job 单向 guard：running→queued 回退被拒',
    await rejects(() => admin.query("UPDATE interview_answer_job SET status='queued' WHERE id=$1 AND status='running'", [b.jobId])));
  A('job 单向 guard：running→done 允许',
    (await admin.query("UPDATE interview_answer_job SET status='done', version=version+1 WHERE id=$1 AND status='running'", [b.jobId])).rowCount === 1);
  A('job 单向 guard：done→running 逆终态被拒',
    await rejects(() => admin.query("UPDATE interview_answer_job SET status='running' WHERE id=$1 AND status='done'", [b.jobId])));

  // 首态 pin：原始 app_role SQL 不得直接落 done/failed（只准 queued）。造「无 job」的
  // (submission, artifact) 作 FK 目标，令 UNIQUE(artifact_ref) 不干扰 RLS 判定。必须走
  // app_role（而非 admin）——artifact 的 INSERT guard 需要 app.principal_user 就位，否则
  // assert_interview_answer_fact_active 读不到 principal 会误判 fenced。
  const pinSub = '00000000-0000-4000-8000-0000000000a3';
  const pinArt = '00000000-0000-4000-8000-0000000000a4';
  await asPrincipal(admin, owner, async (c) => {
    await c.query(
      `INSERT INTO interview_answer_submission(id,owner_user_id,interview_id,question_id,state_version,client_submission_key,canonical_body_hmac,privacy_epoch,status)
       VALUES ($1,current_setting('app.principal_user',true),$2,'q-pin',1,'pin-key',$3,5,'accepted_unscored')`,
      [pinSub, ivB, bodyHmac],
    );
    await c.query(
      `INSERT INTO interview_answer_artifact(id,owner_user_id,interview_id,question_id,state_version,submission_id,ciphertext,body_hmac,hmac_key_version,enc_key_version,privacy_epoch,status)
       VALUES ($1,current_setting('app.principal_user',true),$2,'q-pin',1,$3,pgp_sym_encrypt('x',$4),$5,1,1,5,'active')`,
      [pinArt, ivB, pinSub, ENC_KEY, bodyHmac],
    );
  });
  A('job 首态 pin：原始 app_role INSERT done 被 RLS 拒',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query(
      `INSERT INTO interview_answer_job(owner_user_id,interview_id,question_id,state_version,artifact_ref,status)
       VALUES (current_setting('app.principal_user',true),$1,'q-pin',1,$2,'done')`,
      [ivB, pinArt]))));

  /* ── C. 跨 owner 读 = 0 ──────────────────────────────────────────────── */
  A('跨 owner 读回执 = null', (await readback(otherOwner, 'sub-key-1')) === null);
  A('跨 owner 只读视图 = 0 item', (await view(otherOwner, ivA)).items.length === 0);

  /* ── D. 非破坏 fence（begin-erasure 后全封禁 + 单向 guard + 防御纵深）─── */
  const erasureA = await beginErasure(owner, ivA, nextHash(), 5);
  A('begin-erasure 落 fenced + 生成 answer-artifact target(replayed=false)',
    erasureA.status === 'fenced' && erasureA.replayed === false && erasureA.artifactTargetId.length > 0);
  A('fence 后读回执 = null（status 已 fenced）', (await readback(owner, 'sub-key-1')) === null);
  A('fence 后只读视图 = 0 item（artifact 已 fenced）', (await view(owner, ivA)).items.length === 0);
  A('fence 后新提交被拒（interview_answer_fact_fenced）',
    await rejects(() => submit(owner, {
      interviewId: ivA, questionId: 'q-2', stateVersion: 3, clientSubmissionKey: 'sub-key-2',
      answer: ANSWER, privacyEpoch: 5,
    })));
  A('单向 guard：artifact fenced→active 回放被拒',
    await rejects(() => admin.query("UPDATE interview_answer_artifact SET status='active' WHERE id=$1 AND status='fenced'", [submitted.artifactId])));
  A('单向 guard：submission fenced→accepted_unscored 回放被拒',
    await rejects(() => admin.query("UPDATE interview_answer_submission SET status='accepted_unscored' WHERE id=$1 AND status='fenced'", [submitted.submissionId])));
  A('防御纵深：fence 后原始 app_role INSERT 正文被 trigger 拒绝',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query(
      `INSERT INTO interview_answer_artifact(owner_user_id,interview_id,question_id,state_version,submission_id,ciphertext,body_hmac,hmac_key_version,enc_key_version,privacy_epoch,status)
       VALUES (current_setting('app.principal_user',true),$1,'q-9',9,$2,pgp_sym_encrypt('sneak',$3),$4,1,1,5,'active')`,
      [ivA, submitted.submissionId, ENC_KEY, bodyHmac]))));

  /* ── E. 复用冻结 issuer：sign→issue→consume→claim→purge（全链路）──────── */
  const targetRow = await admin.query<{ resource_hmac: string; epoch: string | number; digest: string }>(
    `SELECT t.resource_hmac, r.privacy_epoch AS epoch, r.target_set_digest AS digest
       FROM privacy_deletion_target t JOIN privacy_erasure_request r ON r.id = t.request_id
      WHERE t.id = $1`,
    [erasureA.artifactTargetId],
  );
  const resourceHmac = targetRow.rows[0]?.resource_hmac ?? '';
  const targets: PrivacyAuthzTarget[] = [{ kind: 'interview_answer_artifact', resource: resourceHmac }];
  A('begin-erasure 钉下 epoch + 目标集活 digest（与 TS canonicalTargetSetDigest 逐字节相等, H1）',
    Number(targetRow.rows[0]?.epoch) === 5
    && targetRow.rows[0]?.digest === canonicalTargetSetDigest(targets)
    && /^[a-f0-9]{64}$/.test(resourceHmac));

  const signedE = await issueSigned(owner, ivA, 5, targets);
  await consume(signedE.jti);
  const claimedE = await claim(owner, signedE.jti, erasureA.artifactTargetId);
  A('复用冻结 claim：answer-artifact target 认领成功并签发租约',
    claimedE !== null && claimedE.leaseToken.length > 0 && claimedE.targetId === erasureA.artifactTargetId);
  A('跨 owner claim（伪造 principal）拒绝',
    await rejects(() => claim(otherOwner, signedE.jti, erasureA.artifactTargetId)));

  const purged = await purge(owner, erasureA.artifactTargetId, claimedE!.leaseToken);
  A('复用冻结 purge：job→artifact→submission 物理删（deletedCount=3）+ 请求 completed',
    purged.deletedCount === 3 && purged.requestStatus === 'completed' && purged.targetId === erasureA.artifactTargetId);

  const residual = await admin.query<{ n: string | number }>(
    `SELECT
       (SELECT count(*) FROM interview_answer_job WHERE interview_id=$1)
     + (SELECT count(*) FROM interview_answer_artifact WHERE interview_id=$1)
     + (SELECT count(*) FROM interview_answer_submission WHERE interview_id=$1) AS n`,
    [ivA],
  );
  A('删后物理 read=0（三表 count 归零）', Number(residual.rows[0]?.n) === 0);
  A('删后读回执 = null', (await readback(owner, 'sub-key-1')) === null);

  // 逐 sink receipt：answer-artifact 目标在冻结收据账本里写自己的 local_erased。
  A('逐 sink receipt：worker 为 answer-artifact target 写 local_erased 成功',
    (await asPrivacyWorkerPrincipal(admin, owner, (c) => recordDeletionReceipt(c, erasureA.artifactTargetId, 'local_erased', 'a'.repeat(64), worker))).length > 0);
  A('逐 sink receipt：跨 owner 写被拒',
    await rejects(() => asPrivacyWorkerPrincipal(admin, otherOwner, (c) => recordDeletionReceipt(c, erasureA.artifactTargetId, 'local_erased', 'a'.repeat(64), worker))));

  /* ── F. submit×delete 竞态（20 并发单 winner）─────────────────────────── */
  const ivRace = '00000000-0000-4000-8000-0000000000b1';
  await insertInterview(owner, ivRace);
  const raceKeyHash = nextHash();
  const race = await Promise.all(
    Array.from({ length: 20 }, () =>
      asPrincipal(admin, owner, async (c) => {
        await submitInterviewAnswer(c, {
          interviewId: ivRace, questionId: 'q-r', stateVersion: 1, clientSubmissionKey: 'race-key',
          answer: ANSWER, privacyEpoch: 7,
        });
        await beginInterviewAnswerFactErasure(c, ivRace, raceKeyHash, 7);
      }).then(() => 'ok', () => 'rejected'),
    ),
  );
  A('20 并发 submit×delete 仅一个 winner（advisory 锁串行，其余 19 被 fence 拒）',
    race.filter((r) => r === 'ok').length === 1 && race.filter((r) => r === 'rejected').length === 19);

  /* ── G. 后台 dispatch feed（list-claimable 只吐 INT 自己的 sink）──────── */
  const claimable = await asPrivacyWorkerExecutor(admin, (c) => listClaimableInterviewAnswerArtifactTargets(c));
  A('list-claimable 只吐 pending/可重租的 answer-artifact 目标（不吐已 erased）',
    Array.isArray(claimable) && claimable.every((t) => typeof t.targetId === 'string' && typeof t.ownerUserId === 'string')
    && !claimable.some((t) => t.targetId === erasureA.artifactTargetId));

  await admin.end();
  console.log(failures === 0
    ? '\n✓ 答案事实根（INT-TRANSCRIPT-00）DB 证明通过（本地隔离证据）'
    : `\n✗ ${failures} 个断言失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => { console.error(e); await admin.end().catch(() => undefined); process.exit(1); });

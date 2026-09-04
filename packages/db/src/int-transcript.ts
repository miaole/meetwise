/**
 * @meetwise/db · 答案事实根（INT-TRANSCRIPT-00）存储侧。
 *
 * 这是「评分前置」的纯数据访问层：答案正文的唯一权威持久化（加密 ciphertext + keyed
 * HMAC 指纹 + 提交回执 + ref-only job）+ 提交幂等 + 只读 watermark 视图 + INT-TRANSCRIPT
 * 自己的删除 fence/purge。**绝不重实现 PrivacyAuthorizationIssuer**——签发/验签/consume/
 * claim 全部复用 packages/db/src/privacy-authorization.ts（0091 冻结）；这里只补 INT 域
 * 自己的 sink resolver（0092 的 begin-erasure / list-claimable / purge）。
 *
 * 隐私铁律（对齐 CLAUDE.md）：
 *   - 正文只进 pgp_sym_encrypt 密文，`bodyHmac` 用 **HMAC** 而非裸 sha256（防确认/关联
 *     预言机，同 resume.ts）；app_role 无 ciphertext 读权限，读侧只走 0092 的 SECURITY
 *     DEFINER 函数吐 watermark（body_hmac/key 版本/epoch/status）。
 *   - 首包 `accepted_unscored`：模型/评分/RAG/Web/memory/B 端投影副作用 = 0。
 *   - 提交幂等：同 owner + 同 client_submission_key → 回放既有回执；同键异体（正文不同）
 *     → 冲突抛错（DB 只保证键唯一，正文唯一性由本层比对 canonical_body_hmac 判）。
 */
import type { Client } from './principal.ts';
import { createHmac, randomUUID } from 'node:crypto';
import { assertInterviewPrivacyActive } from './checkpoint-privacy.ts';
import { assertInterviewAnswerLedgerWriteAllowed, remapInterviewAnswerDualWriteError } from './interview-answer-dual-write.ts';

const IS_PROD = process.env.NODE_ENV === 'production';
/** 必需密钥：prod 缺失即 fail-closed 抛错（杜绝静默用 dev 默认 = 加密形同虚设）。 */
function requireSecret(envName: string, devDefault: string): string {
  const v = process.env[envName];
  if (!v) { if (IS_PROD) throw new Error(`${envName} is required in production`); return devDefault; }
  if (v.length < 16) throw new Error(`${envName} too weak (min 16 chars)`);
  return v;
}
/** 答案正文对称加密 key（生产走 KMS/区域密钥；与 resume 的 RESUME_ENC_KEY 刻意分离）。 */
const ANSWER_ENC_KEY = () => requireSecret('INTERVIEW_ANSWER_ENC_KEY', 'dev_answer_key_change_in_prod__x');
/** 正文指纹密钥：HMAC（keyed，非裸 sha256），与 resume 的 RESUME_HASH_SECRET 刻意分离。 */
const ANSWER_HMAC_SECRET = () => requireSecret('INTERVIEW_ANSWER_HMAC_SECRET', 'dev_answer_hmac_secret__change_me');
/**
 * 当前密钥版本（轮转用）：HMAC 与加密目前共用同一把「代际」旋钮（`INTERVIEW_ANSWER_KEY_
 * VERSION`），但列里分开存 hmac_key_version / enc_key_version，未来二者可独立轮转而无需改
 * schema。按 blob 记录的版本取历史钥走 `INTERVIEW_ANSWER_ENC_KEY_V{n}`（同 resume 的 N1）。
 */
export const INTERVIEW_ANSWER_KEY_VERSION = Number(process.env.INTERVIEW_ANSWER_KEY_VERSION ?? 1);
function encKeyForVersion(v: number): string {
  return process.env[`INTERVIEW_ANSWER_ENC_KEY_V${v}`] ?? ANSWER_ENC_KEY();
}

/** 正文指纹（keyed HMAC，64-hex）。与 SQL 侧只落指纹、不落原文。 */
export const answerBodyHmac = (plaintext: string) => createHmac('sha256', ANSWER_HMAC_SECRET()).update(plaintext, 'utf8').digest('hex');

export interface SubmitInterviewAnswerInput {
  interviewId: string;
  questionId: string;
  stateVersion: number;
  /** 客户端提交键（幂等键；同一键重放 → 回放既有回执；同键异体 → 冲突）。 */
  clientSubmissionKey: string;
  /** 答案正文：**未受信输入**，只在同一事务内以绑定参数进 pgp_sym_encrypt，绝不拼接/落明文。 */
  answer: string;
  privacyEpoch: number;
}

export interface InterviewAnswerSubmitResult {
  submissionId: string;
  artifactId: string;
  jobId: string;
  interviewId: string;
  questionId: string;
  stateVersion: number;
  clientSubmissionKey: string;
  canonicalBodyHmac: string;
  privacyEpoch: number;
  status: 'accepted_unscored';
  replayed: boolean;
}

export interface InterviewAnswerSubmissionReceipt {
  submissionId: string;
  clientSubmissionKey: string;
  canonicalBodyHmac: string;
  privacyEpoch: number;
  status: 'accepted_unscored' | 'fenced';
  artifactId: string | null;
  // 落库事实的权威副本（供幂等回放回显，**不**回显调用方的输入，杜绝「同键跨题重放仍
  // 回报新输入元数据」的错账）。job_id 在 job 被物理删后可为 null（LEFT JOIN）。
  interviewId: string | null;
  questionId: string | null;
  stateVersion: number | null;
  jobId: string | null;
}

export interface InterviewAnswerViewItem {
  questionId: string;
  stateVersion: number;
  bodyHmac: string;
  hmacKeyVersion: number;
  privacyEpoch: number;
  status: 'active' | 'fenced' | 'erased';
}

export interface InterviewAnswerViewSnapshot {
  interviewId: string;
  highWatermark: number;
  items: InterviewAnswerViewItem[];
}

// 用函数声明而非 `const fail = (...) : never =>`：TS 的控制流收窄只对「函数声明」的 never
// 返回类型生效（箭头函数 const 不被 CFA 当作必然 throw），否则 `if (!x) fail(...)` 之后
// `x` 仍被当作可空。这里是本文件所有 fail-closed 分支的公共出口。
function fail(code: string): never { throw Object.assign(new Error(code), { code }); }

/**
 * 提交答案（首包落 `accepted_unscored`，副作用 = 0）。同一事务内：
 *   assert 双 fence（checkpoint + answer-artifact，同一把 advisory 锁）→ 落回执（幂等键）
 *   → 落加密正文源 → 落 ref-only job。提交幂等：同键同体回放、同键异体冲突。
 */
export async function submitInterviewAnswer(c: Client, input: SubmitInterviewAnswerInput): Promise<InterviewAnswerSubmitResult> {
  if (!Number.isSafeInteger(input.stateVersion) || input.stateVersion < 0) fail('interview_answer_state_version_invalid');
  if (!Number.isSafeInteger(input.privacyEpoch) || input.privacyEpoch < 1) fail('interview_answer_epoch_invalid');
  if (typeof input.answer !== 'string' || input.answer.length === 0) fail('interview_answer_body_empty');

  await assertInterviewPrivacyActive(c, input.interviewId);   // checkpoint fence（同锁，跨 sink 串行）
  await assertInterviewAnswerFactActive(c, input.interviewId); // answer-artifact fence（本域 resolver）
  // 0126：legacy `/turn` 已为同身份写过 interview_job 时拒 ledger。这不是 01 生产门，
  // 只禁止两条正文家族并行。HTTP `/turn` 仍不走本函数。
  await assertInterviewAnswerLedgerWriteAllowed(c, input.interviewId, input.questionId, input.stateVersion);

  const bodyHmac = answerBodyHmac(input.answer);
  const encKey = encKeyForVersion(INTERVIEW_ANSWER_KEY_VERSION);

  // app_role 只 INSERT 不 SELECT（ciphertext/指纹都不可读），故两处约束：
  //   1) 不用 `INSERT ... RETURNING id`——RETURNING 额外要求被返回列的 SELECT 权限；
  //      三张表的 id 由本层 `randomUUID()` 预生成、以参数显式传入。
  //   2) 不用 `ON CONFLICT DO NOTHING`——PostgreSQL 要求能读冲突行（表级 SELECT + RLS 策略），
  //      而 submission 对 app_role 无 SELECT 策略；且唯一冲突会 abort 整个事务。与 resume.ts
  //      persistResumeProfile 同源：SAVEPOINT 把重试竞态局部化，保持幂等又不削弱读边界。
  const submissionId = randomUUID();
  let inserted = true;
  await c.query('SAVEPOINT answer_submission_insert');
  try {
    await c.query(
      `INSERT INTO interview_answer_submission(id,owner_user_id,interview_id,question_id,state_version,client_submission_key,canonical_body_hmac,privacy_epoch,status)
       VALUES ($1,current_setting('app.principal_user', true),$2,$3,$4,$5,$6,$7,'accepted_unscored')`,
      [submissionId, input.interviewId, input.questionId, input.stateVersion, input.clientSubmissionKey, bodyHmac, input.privacyEpoch],
    );
  } catch (error: unknown) {
    if ((error as { code?: string } | null)?.code !== '23505') {
      await c.query('ROLLBACK TO SAVEPOINT answer_submission_insert');
      throw error;
    }
    await c.query('ROLLBACK TO SAVEPOINT answer_submission_insert');
    inserted = false;
  }
  await c.query('RELEASE SAVEPOINT answer_submission_insert');

  if (inserted) {
    const artifactId = randomUUID();
    try {
      await c.query(
        `INSERT INTO interview_answer_artifact(id,owner_user_id,interview_id,question_id,state_version,submission_id,ciphertext,body_hmac,hmac_key_version,enc_key_version,privacy_epoch,status)
         VALUES ($1,current_setting('app.principal_user', true),$2,$3,$4,$5,pgp_sym_encrypt($6,$7),$8,$9,$10,$11,'active')`,
        [artifactId, input.interviewId, input.questionId, input.stateVersion, submissionId, input.answer, encKey,
          bodyHmac, INTERVIEW_ANSWER_KEY_VERSION, INTERVIEW_ANSWER_KEY_VERSION, input.privacyEpoch],
      );
    } catch (error) {
      remapInterviewAnswerDualWriteError(error);
    }
    const jobId = randomUUID();
    await c.query(
      `INSERT INTO interview_answer_job(id,owner_user_id,interview_id,question_id,state_version,artifact_ref,status)
       VALUES ($1,current_setting('app.principal_user', true),$2,$3,$4,$5,'queued')`,
      [jobId, input.interviewId, input.questionId, input.stateVersion, artifactId],
    );
    return {
      submissionId, artifactId, jobId,
      interviewId: input.interviewId, questionId: input.questionId, stateVersion: input.stateVersion,
      clientSubmissionKey: input.clientSubmissionKey, canonicalBodyHmac: bodyHmac, privacyEpoch: input.privacyEpoch,
      status: 'accepted_unscored', replayed: false,
    };
  }

  // 键冲突：读既有回执（SECURITY DEFINER，owner-scoped + 仅 accepted_unscored 可见）。
  // 若不可见（fence/cross-owner）——但 submit 已在上面过双 fence，故此处不可见即异常，fail-closed。
  const existing = await readbackInterviewAnswerSubmission(c, input.clientSubmissionKey);
  if (!existing) fail('interview_answer_submission_fenced_or_forbidden');
  if (existing.canonicalBodyHmac !== bodyHmac) fail('interview_answer_submission_conflict');
  if (!existing.artifactId) fail('interview_answer_artifact_missing');
  // 回放回显**落库事实**（interviewId/questionId/stateVersion/privacyEpoch/jobId 全取自既有行），
  // 绝不回显调用方输入——否则同一 clientSubmissionKey 跨题/跨面试重放会回报错账元数据。
  if (!existing.interviewId || !existing.questionId || existing.stateVersion === null) fail('interview_answer_receipt_incomplete');
  return {
    submissionId: existing.submissionId, artifactId: existing.artifactId, jobId: existing.jobId ?? '',
    interviewId: existing.interviewId, questionId: existing.questionId, stateVersion: existing.stateVersion,
    clientSubmissionKey: existing.clientSubmissionKey, canonicalBodyHmac: existing.canonicalBodyHmac,
    privacyEpoch: existing.privacyEpoch, status: 'accepted_unscored', replayed: true,
  };
}

/** 读回执（watermark，无正文/密文）。fenced/cross-owner/missing 统一返回 null（不给存在 oracle）。 */
export async function readbackInterviewAnswerSubmission(c: Client, clientSubmissionKey: string): Promise<InterviewAnswerSubmissionReceipt | null> {
  const r = await c.query<{
    submission_id: string; client_submission_key: string; canonical_body_hmac: string;
    privacy_epoch: string | number; status: 'accepted_unscored' | 'fenced'; artifact_id: string | null;
    interview_id: string | null; question_id: string | null; state_version: string | number | null; job_id: string | null;
  }>('SELECT * FROM interview_answer_readback_receipt($1)', [clientSubmissionKey]);
  const row = r.rows[0];
  if (!row?.submission_id) return null;
  const epoch = Number(row.privacy_epoch);
  if (!Number.isSafeInteger(epoch) || epoch < 1) return null;
  const stateVersion = row.state_version == null ? null : Number(row.state_version);
  if (stateVersion !== null && (!Number.isSafeInteger(stateVersion) || stateVersion < 0)) return null;
  return {
    submissionId: row.submission_id, clientSubmissionKey: row.client_submission_key,
    canonicalBodyHmac: row.canonical_body_hmac, privacyEpoch: epoch, status: row.status, artifactId: row.artifact_id,
    interviewId: row.interview_id, questionId: row.question_id, stateVersion, jobId: row.job_id,
  };
}

/** 只读视图（watermark）：只吐 body_hmac/key 版本/epoch/status，绝不吐原文或 ciphertext。 */
export async function viewInterviewAnswerSnapshot(c: Client, interviewId: string, afterStateVersion = 0): Promise<InterviewAnswerViewSnapshot> {
  const r = await c.query<{
    question_id: string; state_version: string | number; body_hmac: string; hmac_key_version: number;
    privacy_epoch: string | number; status: 'active' | 'fenced' | 'erased';
  }>('SELECT * FROM interview_answer_view_snapshot($1,$2)', [interviewId, afterStateVersion]);
  const items: InterviewAnswerViewItem[] = r.rows.map((row) => {
    const stateVersion = Number(row.state_version);
    const privacyEpoch = Number(row.privacy_epoch);
    if (!Number.isSafeInteger(stateVersion) || stateVersion < 0 || !Number.isSafeInteger(privacyEpoch) || privacyEpoch < 1) {
      throw Object.assign(new Error('interview_answer_view_invalid'), { code: 'interview_answer_view_invalid' });
    }
    return {
      questionId: row.question_id, stateVersion, bodyHmac: row.body_hmac,
      hmacKeyVersion: row.hmac_key_version, privacyEpoch, status: row.status,
    };
  });
  return { interviewId, highWatermark: items.reduce((m, i) => Math.max(m, i.stateVersion), 0), items };
}

/** answer-artifact 专用 fence 断言（与 checkpoint 断言取同一把锁）。 */
export async function assertInterviewAnswerFactActive(c: Client, interviewId: string): Promise<void> {
  await c.query('SELECT assert_interview_answer_fact_active($1)', [interviewId]);
}

export interface InterviewAnswerFactErasureRequest {
  requestId: string;
  status: 'fenced' | 'purging' | 'pending_external' | 'completed' | 'partial_failed' | 'authorization_paused';
  artifactTargetId: string;
  replayed: boolean;
}

/** 非破坏 fence（API 阶段）：创建 answer-artifact 目标 + 活 digest + epoch（复用 0091 claim）。 */
export async function beginInterviewAnswerFactErasure(
  c: Client, interviewId: string, idempotencyKeyHash: string, privacyEpoch: number,
): Promise<InterviewAnswerFactErasureRequest> {
  const r = await c.query<{
    request_id: string; request_status: InterviewAnswerFactErasureRequest['status']; artifact_target_id: string; replayed: boolean;
  }>('SELECT * FROM interview_answer_fact_begin_erasure($1,$2,$3)', [interviewId, idempotencyKeyHash, privacyEpoch]);
  const row = r.rows[0];
  if (!row?.request_id || !row.artifact_target_id)
    throw Object.assign(new Error('interview_answer_fact_erasure_unavailable'), { code: 'interview_answer_fact_erasure_unavailable' });
  return { requestId: row.request_id, status: row.request_status, artifactTargetId: row.artifact_target_id, replayed: row.replayed === true };
}

/** 后台可认领目标（answer-artifact 专用 dispatch feed）。 */
export async function listClaimableInterviewAnswerArtifactTargets(
  c: Client, maxItems = 32,
): Promise<Array<{ targetId: string; ownerUserId: string }>> {
  const r = await c.query<{ target_id: string; owner_user_id: string }>(
    'SELECT * FROM interview_answer_artifact_list_claimable_targets($1)', [maxItems],
  );
  return r.rows
    .filter((row) => typeof row.target_id === 'string' && typeof row.owner_user_id === 'string')
    .map((row) => ({ targetId: row.target_id, ownerUserId: row.owner_user_id }));
}

/** 后台物理删除（answer-artifact 专用 purge）。 */
export async function purgeInterviewAnswerArtifactTarget(
  c: Client, targetId: string, leaseToken: string,
): Promise<{ targetId: string; deletedCount: number; requestStatus: InterviewAnswerFactErasureRequest['status'] }> {
  const r = await c.query<{
    target_id: string; status: string; deleted_count: string | number; request_status: InterviewAnswerFactErasureRequest['status'];
  }>('SELECT * FROM privacy_purge_answer_artifact_target($1,$2)', [targetId, leaseToken]);
  const row = r.rows[0];
  const deletedCount = Number(row?.deleted_count);
  if (!row?.target_id || row.status !== 'erased' || !Number.isSafeInteger(deletedCount) || deletedCount < 0)
    throw Object.assign(new Error('interview_answer_fact_purge_invalid'), { code: 'interview_answer_fact_purge_invalid' });
  return { targetId: row.target_id, deletedCount, requestStatus: row.request_status };
}

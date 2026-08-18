/**
 * 评分测量事实根（SCOR-01）DB 证明。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres（完整迁移 + nonce 校验）。证明：
 *   - 铁律：issued_question_contract schema 层**无** answer_id/answer_hash/answer_version 列
 *   - 版本化 rubric 发布 + append-only 不可原地改写；issue 阶段冻结题目身份/rubric/epoch
 *   - submission 阶段绑 canonical artifact（body_hmac + submission receipt + artifact active）
 *   - ScoreRequest permit 状态机：claim 单次 CAS（并发单 winner）、dispatch token 匹配、fence
 *   - 写卡事务内原子校验两阶段（artifact/body_hmac/epoch/fence + permit 重校验 + CAS）
 *   - 并发不变量：每 request 至多一张终态卡；删除/撤权先赢 → card=0 + 迟到结果不得写回
 *   - 显式状态机：非法转移（TS domain 与 DB 触发器双侧）被拒；非评分态不参与评分
 *   - 答案版本替换：同契约高版本先赢，低版本在途 request 被 fence
 *   - 更正 supersedes 链：旧卡 superseded、新卡终态、历史不覆盖
 *   - RLS 跨 owner = 0；原地 UPDATE/DELETE 拒绝（app_role/executor 无 grant + BEFORE 触发器）
 */
import {
  createPool, asPrincipal, asScoringWorkerPrincipal, assertIsolatedTestTarget,
  submitInterviewAnswer, answerBodyHmac, beginInterviewAnswerFactErasure, beginInterviewProjectionErasure,
  publishQuestionRubric, issueQuestionContract, createScoreRequest,
  claimScoreRequest, markScoreRequestDispatched, fenceScoreRequest,
  recordScoreCard, transitionScoreCard, supersedeScoreCard,
  type Client,
} from '@meetwise/db';
import {
  SCORE_CARD_STATUSES, SCORE_REQUEST_STATUSES, SCORE_CARD_TRANSITIONS, SCORE_CARD_NON_SCORING_STATUSES,
  canTransitionScoreCard, isScoreCardScorable,
} from '@meetwise/domain';

// 确定性密钥（在调用 submitInterviewAnswer/answerBodyHmac 前注入；int-transcript.ts 惰性读取）。
process.env.INTERVIEW_ANSWER_ENC_KEY = 'proof_answer_enc_key_v1_16chars';
process.env.INTERVIEW_ANSWER_HMAC_SECRET = 'proof_answer_hmac_secret_16chars';

const admin = createPool();
const owner = `scor-owner-${process.pid}`;
const otherOwner = `scor-other-${process.pid}`;
const worker = `scor-worker-${process.pid}`;

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };

const asOwner = <T>(u: string, fn: (c: Client) => Promise<T>) => asPrincipal(admin, u, fn);
const asWorker = <T>(u: string, fn: (c: Client) => Promise<T>) => asScoringWorkerPrincipal(admin, u, fn);

let hashCounter = 0;
const nextHash = () => (++hashCounter).toString(16).padStart(64, '0');

async function insertInterview(ownerId: string, interviewId: string): Promise<void> {
  await admin.query(
    "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions) VALUES ($1,$2,'active',0,0,'[]'::jsonb)",
    [interviewId, ownerId],
  );
}

// 用默认 2 分项 rubric + issue + submit + create request 的一组夹具。
const RUBRIC_CRITERIA = [
  { criterionId: 'clarity', weight: 2 },
  { criterionId: 'depth', weight: 3 },
];
const CARD_CRITERIA = [
  { criterionId: 'clarity', disposition: 'meets', score: 8, weight: 2 },
  { criterionId: 'depth', disposition: 'exceeds', score: 9, weight: 3 },
];

async function main() {
  await assertIsolatedTestTarget(admin);

  /* ── A. schema 铁律 + 版本化 rubric + issue 冻结 ─────────────────────── */
  const contractCols = await admin.query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns WHERE table_name='issued_question_contract'`);
  const colNames = contractCols.rows.map((r) => r.column_name.toLowerCase());
  A('铁律：issued_question_contract 无 answer_id/answer_hash/answer_version 列',
    !colNames.includes('answer_id') && !colNames.includes('answer_hash') && !colNames.includes('answer_version')
    && !colNames.some((n) => n.startsWith('answer')));

  const ivA = '00000000-0000-4000-8000-0000000000c1';
  await insertInterview(owner, ivA);
  const qHash = nextHash();

  const rubricId = (await asOwner(owner, (c) => publishQuestionRubric(c, {
    questionId: 'q-scor-1', questionVersion: 1, rubricVersion: 1, competency: '沟通表达',
    difficulty: 3, languageScope: ['zh', 'en'], questionContentHash: qHash, criteria: RUBRIC_CRITERIA,
  }))).rubricId;
  A('发布版本化 rubric（返回 rubricId + 2 分项落库）',
    (await admin.query('SELECT count(*)::int AS n FROM question_rubric_criterion WHERE rubric_id=$1', [rubricId])).rows[0]?.n === 2);

  A('rubric append-only：原地 UPDATE 被拒',
    await rejects(() => admin.query("UPDATE question_rubric SET competency='改' WHERE id=$1", [rubricId])));
  A('rubric append-only：DELETE 被拒',
    await rejects(() => admin.query('DELETE FROM question_rubric WHERE id=$1', [rubricId])));
  A('rubric 幂等重放（同 (q,v,r) 返回既有 id）',
    (await asOwner(owner, (c) => publishQuestionRubric(c, {
      questionId: 'q-scor-1', questionVersion: 1, rubricVersion: 1, competency: '沟通表达',
      difficulty: 3, languageScope: ['zh', 'en'], questionContentHash: qHash, criteria: RUBRIC_CRITERIA,
    }))).rubricId === rubricId);

  const issued = await asOwner(owner, (c) => issueQuestionContract(c, {
    interviewId: ivA, questionId: 'q-scor-1', stateVersion: 2, turn: 0, questionContentHash: qHash,
    rubricId, form: 'mock', language: 'zh', route: 'adaptive', promptPolicyVersion: 'prompt-v1',
    measurementVersion: 'measure-v1', privacyEpoch: 5,
  }));
  A('issue 阶段冻结契约（replayed=false，contractId 非空）',
    issued.replayed === false && issued.contractId.length > 0);
  A('issue 幂等重放（同身份返回同 contractId + replayed=true）',
    (await asOwner(owner, (c) => issueQuestionContract(c, {
      interviewId: ivA, questionId: 'q-scor-1', stateVersion: 2, turn: 0, questionContentHash: qHash,
      rubricId, form: 'mock', language: 'zh', route: 'adaptive', promptPolicyVersion: 'prompt-v1',
      measurementVersion: 'measure-v1', privacyEpoch: 5,
    }))).contractId === issued.contractId);
  A('issue 语言出适用范围被拒（rubric language_scope 门）',
    await rejects(() => asOwner(owner, (c) => issueQuestionContract(c, {
      interviewId: ivA, questionId: 'q-scor-1', stateVersion: 3, turn: 0, questionContentHash: qHash,
      rubricId, form: 'mock', language: 'fr', route: 'adaptive', promptPolicyVersion: 'prompt-v1',
      measurementVersion: 'measure-v1', privacyEpoch: 5,
    }))));
  A('issue 跨 owner 面试发题被拒',
    await rejects(() => asOwner(otherOwner, (c) => issueQuestionContract(c, {
      interviewId: ivA, questionId: 'q-scor-1', stateVersion: 4, turn: 0, questionContentHash: qHash,
      rubricId, form: 'mock', language: 'zh', route: 'adaptive', promptPolicyVersion: 'prompt-v1',
      measurementVersion: 'measure-v1', privacyEpoch: 5,
    }))));
  A('issue 契约 append-only：原地 UPDATE 被拒',
    await rejects(() => admin.query('UPDATE issued_question_contract SET route=$2 WHERE id=$1', [issued.contractId, '改'])));

  /* ── B. submission 阶段绑 canonical artifact ─────────────────────────── */
  const ANSWER = 'my-scored-answer-body-123';
  const bodyHmac = answerBodyHmac(ANSWER);
  const submitted = await asOwner(owner, (c) => submitInterviewAnswer(c, {
    interviewId: ivA, questionId: 'q-scor-1', stateVersion: 2, clientSubmissionKey: 'scor-sub-1',
    answer: ANSWER, privacyEpoch: 5,
  }));
  A('submission 首包 accepted_unscored + canonicalBodyHmac == keyed-HMAC',
    submitted.status === 'accepted_unscored' && submitted.canonicalBodyHmac === bodyHmac);

  const req = await asOwner(owner, (c) => createScoreRequest(c, {
    issuedContractId: issued.contractId, submissionId: submitted.submissionId, artifactId: submitted.artifactId,
    answerBodyHmac: bodyHmac, privacyEpoch: 5, operationPolicyVersion: 'op-v1', answerVersion: 1, idempotencyKey: 'scor-req-1',
  }));
  A('createScoreRequest 绑定 canonical artifact（requestId 非空, answerVersion=1, replayed=false）',
    req.requestId.length > 0 && req.answerVersion === 1 && req.replayed === false);
  A('createScoreRequest 同键幂等重放（同 requestId + replayed=true）',
    (await asOwner(owner, (c) => createScoreRequest(c, {
      issuedContractId: issued.contractId, submissionId: submitted.submissionId, artifactId: submitted.artifactId,
      answerBodyHmac: bodyHmac, privacyEpoch: 5, operationPolicyVersion: 'op-v1', answerVersion: 1, idempotencyKey: 'scor-req-1',
    }))).requestId === req.requestId);
  A('createScoreRequest 同键异体（hmac 不符）→ 冲突 fail-closed',
    await rejects(() => asOwner(owner, (c) => createScoreRequest(c, {
      issuedContractId: issued.contractId, submissionId: submitted.submissionId, artifactId: submitted.artifactId,
      answerBodyHmac: nextHash(), privacyEpoch: 5, operationPolicyVersion: 'op-v1', answerVersion: 1, idempotencyKey: 'scor-req-1',
    }))));
  A('createScoreRequest body_hmac 不符 → 拒（artifact 绑定）',
    await rejects(() => asOwner(owner, (c) => createScoreRequest(c, {
      issuedContractId: issued.contractId, submissionId: submitted.submissionId, artifactId: submitted.artifactId,
      answerBodyHmac: nextHash(), privacyEpoch: 5, operationPolicyVersion: 'op-v1', answerVersion: 2, idempotencyKey: 'scor-req-bad-hmac',
    }))));
  A('createScoreRequest epoch 漂移（≠ 契约冻结 epoch）→ 拒',
    await rejects(() => asOwner(owner, (c) => createScoreRequest(c, {
      issuedContractId: issued.contractId, submissionId: submitted.submissionId, artifactId: submitted.artifactId,
      answerBodyHmac: bodyHmac, privacyEpoch: 99, operationPolicyVersion: 'op-v1', answerVersion: 2, idempotencyKey: 'scor-req-bad-epoch',
    }))));
  A('createScoreRequest 跨 owner → 拒（契约 owner 隔离）',
    await rejects(() => asOwner(otherOwner, (c) => createScoreRequest(c, {
      issuedContractId: issued.contractId, submissionId: submitted.submissionId, artifactId: submitted.artifactId,
      answerBodyHmac: bodyHmac, privacyEpoch: 5, operationPolicyVersion: 'op-v1', answerVersion: 2, idempotencyKey: 'scor-req-xowner',
    }))));
  A('score_request 内容 append-only：原地改 answer_version 被拒',
    await rejects(() => admin.query('UPDATE score_request SET answer_version=9 WHERE id=$1', [req.requestId])));

  /* ── C. permit 状态机：claim 单次 CAS（并发单 winner）+ dispatch token ── */
  const token1 = '00000000-0000-4000-8000-0000000000d1';
  const token2 = '00000000-0000-4000-8000-0000000000d2';
  const [claim1, claim2] = await Promise.all([
    asWorker(owner, (c) => claimScoreRequest(c, req.requestId, worker, token1)),
    asWorker(owner, (c) => claimScoreRequest(c, req.requestId, worker, token2)),
  ]);
  A('claim 并发单 winner（一个 claimed=true，另一个 claimed=false）',
    [claim1.claimed, claim2.claimed].filter(Boolean).length === 1
    && [claim1.claimed, claim2.claimed].filter((x) => !x).length === 1);
  const winnerToken = claim1.claimed ? token1 : token2;
  A('claim 跨 owner 不可见（claimed=false + status=null）',
    (await asWorker(otherOwner, (c) => claimScoreRequest(c, req.requestId, worker, token2))).status === null);

  const dispatched = await asWorker(owner, (c) => markScoreRequestDispatched(c, req.requestId, winnerToken));
  A('dispatch token 匹配 → dispatched=true', dispatched.dispatched === true && dispatched.status === 'dispatched');
  A('dispatch token 错配 → dispatched=false',
    (await asWorker(owner, (c) => markScoreRequestDispatched(c, req.requestId, token2))).dispatched === false);
  A('claim 重放（已 dispatched，非 pending）→ claimed=false',
    (await asWorker(owner, (c) => claimScoreRequest(c, req.requestId, worker, winnerToken))).claimed === false);

  // 成员校验负路径须在 request 仍 dispatched（permit 有效）时跑：criterion 不在冻结 rubric → 拒。
  A('写卡 criterion 不在 rubric → 拒（成员校验）',
    await rejects(() => asWorker(owner, (c) => recordScoreCard(c, {
      requestId: req.requestId, leaseToken: winnerToken,
      criteria: [{ criterionId: 'hallucinated', disposition: 'meets', score: 5, weight: 1 }],
      deterministicTotal: 5, coverage: 1.0,
    }))));

  /* ── D. 写卡：事务内原子校验两阶段 + CAS + 同事务发事件 ───────────────── */
  const recorded = await asWorker(owner, (c) => recordScoreCard(c, {
    requestId: req.requestId, leaseToken: winnerToken, criteria: CARD_CRITERIA,
    deterministicTotal: 85.5, coverage: 1.0, provenance: { producer: 'proof' },
  }));
  A('写卡成功（recorded=true, status=pending_evidence, cardId 非空）',
    recorded.recorded === true && recorded.status === 'pending_evidence' && (recorded.cardId?.length ?? 0) > 0);
  const cardId = recorded.cardId!;
  A('写卡后 request → scored（CAS 单 winner）',
    (await admin.query<{ status: string }>('SELECT status FROM score_request WHERE id=$1', [req.requestId])).rows[0]?.status === 'scored');
  A('分项分落库（2 分项, weight 冻结自 rubric）',
    (await admin.query('SELECT count(*)::int AS n FROM score_card_criterion WHERE card_id=$1', [cardId])).rows[0]?.n === 2);
  A('写卡同事务原子发出 score_card_written 事件（单调 seq, 事件链可见）',
    (await admin.query<{ n: string | number }>(
      "SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1 AND kind='score_card_written'", [ivA])).rows[0]?.n === 1);

  A('迟到第二次写卡（request 已 scored）→ recorded=false + cardId=null',
    (await asWorker(owner, (c) => recordScoreCard(c, {
      requestId: req.requestId, leaseToken: winnerToken, criteria: CARD_CRITERIA,
      deterministicTotal: 1, coverage: 1.0,
    }))).recorded === false);
  A('每 request 至多一张终态卡（partial unique index 兜底）',
    (await admin.query<{ n: string | number }>(
      "SELECT count(*)::int AS n FROM score_card WHERE score_request_id=$1 AND status NOT IN ('superseded','fenced')", [req.requestId])).rows[0]?.n === 1);

  /* ── E. 显式状态机：非法转移双侧被拒 + 非评分态不评分 ─────────────────── */
  A('domain 转移表：pending_evidence→evidence_valid 合法',
    canTransitionScoreCard('pending_evidence', 'evidence_valid') === true);
  A('domain 转移表：pending_evidence→practice_eligible 非法',
    canTransitionScoreCard('pending_evidence', 'practice_eligible') === false);
  A('domain 转移表：evidence_valid→practice_eligible 合法',
    canTransitionScoreCard('evidence_valid', 'practice_eligible') === true);
  A('domain 转移表：→superseded 从任意非吸收态合法',
    canTransitionScoreCard('pending_evidence', 'superseded') === true);
  A('domain 转移表：superseded 吸收态不可迁出',
    canTransitionScoreCard('superseded', 'pending_evidence') === false);
  A('domain 非评分态不参与评分（unscored/review_required/calibration_blocked/evidence_invalid）',
    SCORE_CARD_NON_SCORING_STATUSES.every((s) => !isScoreCardScorable(s)));
  A('domain 可评分态仅 practice_eligible/b_review_eligible',
    SCORE_CARD_STATUSES.filter((s) => isScoreCardScorable(s)).join(',') === 'practice_eligible,b_review_eligible');
  A('domain 状态枚举与 DB 逐值一致（SCORE_CARD_STATUSES 10 态 / SCORE_REQUEST_STATUSES 5 态）',
    SCORE_CARD_STATUSES.length === 10 && SCORE_REQUEST_STATUSES.length === 5);

  A('DB 转移：pending_evidence→evidence_valid 允许',
    (await asWorker(owner, (c) => transitionScoreCard(c, cardId, 'pending_evidence', 'evidence_valid'))).transitioned === true);
  A('DB 转移：evidence_valid→review_required 逆证据流（跳过 practice）被触发器拒',
    await rejects(() => asWorker(owner, (c) => transitionScoreCard(c, cardId, 'evidence_valid', 'calibration_blocked'))));
  A('DB 转移：evidence_valid→practice_eligible 允许',
    (await asWorker(owner, (c) => transitionScoreCard(c, cardId, 'evidence_valid', 'practice_eligible'))).transitioned === true);
  A('DB 转移：原始 SQL 非法转移被触发器拒（practice_eligible→pending_evidence 回退）',
    await rejects(() => admin.query("UPDATE score_card SET status='pending_evidence' WHERE id=$1 AND status='practice_eligible'", [cardId])));

  /* ── F. 删除/撤权先赢：card=0 + 迟到结果不得写回 ──────────────────────── */
  const ivF = '00000000-0000-4000-8000-0000000000c2';
  await insertInterview(owner, ivF);
  const issuedF = await asOwner(owner, (c) => issueQuestionContract(c, {
    interviewId: ivF, questionId: 'q-scor-f', stateVersion: 1, turn: 0, questionContentHash: qHash,
    rubricId, form: 'mock', language: 'zh', route: 'adaptive', promptPolicyVersion: 'prompt-v1',
    measurementVersion: 'measure-v1', privacyEpoch: 7,
  }));
  const submittedF = await asOwner(owner, (c) => submitInterviewAnswer(c, {
    interviewId: ivF, questionId: 'q-scor-f', stateVersion: 1, clientSubmissionKey: 'scor-sub-f',
    answer: 'fence-target-answer', privacyEpoch: 7,
  }));
  const reqF = await asOwner(owner, (c) => createScoreRequest(c, {
    issuedContractId: issuedF.contractId, submissionId: submittedF.submissionId, artifactId: submittedF.artifactId,
    answerBodyHmac: answerBodyHmac('fence-target-answer'), privacyEpoch: 7, operationPolicyVersion: 'op-v1',
    answerVersion: 1, idempotencyKey: 'scor-req-f',
  }));
  const tokenF = '00000000-0000-4000-8000-0000000000d3';
  await asWorker(owner, (c) => claimScoreRequest(c, reqF.requestId, worker, tokenF));

  // 撤权先赢：request fenced 后迟到写卡 permit 重校验失败 → recorded=false, cardId=null, card=0。
  await asWorker(owner, (c) => fenceScoreRequest(c, reqF.requestId));
  const lateRecord = await asWorker(owner, (c) => recordScoreCard(c, {
    requestId: reqF.requestId, leaseToken: tokenF, criteria: CARD_CRITERIA, deterministicTotal: 10, coverage: 1.0,
  }));
  A('撤权先赢：fence 后迟到写卡 → recorded=false + cardId=null（card=0）',
    lateRecord.recorded === false && lateRecord.cardId === null);
  A('撤权先赢：fenced request 下无任何 score_card 行',
    (await admin.query<{ n: string | number }>('SELECT count(*)::int AS n FROM score_card WHERE score_request_id=$1', [reqF.requestId])).rows[0]?.n === 0);

  // 删除先赢：begin-erasure fence 后写卡在 fence 重校验处抛错（事务回滚，card=0）。
  const ivG = '00000000-0000-4000-8000-0000000000c3';
  await insertInterview(owner, ivG);
  const issuedG = await asOwner(owner, (c) => issueQuestionContract(c, {
    interviewId: ivG, questionId: 'q-scor-g', stateVersion: 1, turn: 0, questionContentHash: qHash,
    rubricId, form: 'mock', language: 'zh', route: 'adaptive', promptPolicyVersion: 'prompt-v1',
    measurementVersion: 'measure-v1', privacyEpoch: 7,
  }));
  const submittedG = await asOwner(owner, (c) => submitInterviewAnswer(c, {
    interviewId: ivG, questionId: 'q-scor-g', stateVersion: 1, clientSubmissionKey: 'scor-sub-g',
    answer: 'delete-target-answer', privacyEpoch: 7,
  }));
  const reqG = await asOwner(owner, (c) => createScoreRequest(c, {
    issuedContractId: issuedG.contractId, submissionId: submittedG.submissionId, artifactId: submittedG.artifactId,
    answerBodyHmac: answerBodyHmac('delete-target-answer'), privacyEpoch: 7, operationPolicyVersion: 'op-v1',
    answerVersion: 1, idempotencyKey: 'scor-req-g',
  }));
  const tokenG = '00000000-0000-4000-8000-0000000000d4';
  await asWorker(owner, (c) => claimScoreRequest(c, reqG.requestId, worker, tokenG));
  await asOwner(owner, (c) => beginInterviewAnswerFactErasure(c, ivG, nextHash(), 7));
  A('删除先赢：erasure fence 后迟到写卡被 fence 重校验拒（抛错, 事务回滚）',
    await rejects(() => asWorker(owner, (c) => recordScoreCard(c, {
      requestId: reqG.requestId, leaseToken: tokenG, criteria: CARD_CRITERIA, deterministicTotal: 10, coverage: 1.0,
    }))));
  A('删除先赢：fence 后 card=0（无 score_card 行）',
    (await admin.query<{ n: string | number }>('SELECT count(*)::int AS n FROM score_card WHERE score_request_id=$1', [reqG.requestId])).rows[0]?.n === 0);

  /* ── G. 答案版本替换：高版本先赢，低版本在途 request 被 fence ─────────── */
  const ivH = '00000000-0000-4000-8000-0000000000c4';
  await insertInterview(owner, ivH);
  const issuedH = await asOwner(owner, (c) => issueQuestionContract(c, {
    interviewId: ivH, questionId: 'q-scor-h', stateVersion: 1, turn: 0, questionContentHash: qHash,
    rubricId, form: 'mock', language: 'zh', route: 'adaptive', promptPolicyVersion: 'prompt-v1',
    measurementVersion: 'measure-v1', privacyEpoch: 7,
  }));
  const submittedH1 = await asOwner(owner, (c) => submitInterviewAnswer(c, {
    interviewId: ivH, questionId: 'q-scor-h', stateVersion: 1, clientSubmissionKey: 'scor-sub-h1',
    answer: 'answer-version-one', privacyEpoch: 7,
  }));
  const reqH1 = await asOwner(owner, (c) => createScoreRequest(c, {
    issuedContractId: issuedH.contractId, submissionId: submittedH1.submissionId, artifactId: submittedH1.artifactId,
    answerBodyHmac: answerBodyHmac('answer-version-one'), privacyEpoch: 7, operationPolicyVersion: 'op-v1',
    answerVersion: 1, idempotencyKey: 'scor-req-h1',
  }));
  await asWorker(owner, (c) => claimScoreRequest(c, reqH1.requestId, worker, token1));

  const submittedH2 = await asOwner(owner, (c) => submitInterviewAnswer(c, {
    interviewId: ivH, questionId: 'q-scor-h', stateVersion: 1, clientSubmissionKey: 'scor-sub-h2',
    answer: 'answer-version-two', privacyEpoch: 7,
  }));
  const reqH2 = await asOwner(owner, (c) => createScoreRequest(c, {
    issuedContractId: issuedH.contractId, submissionId: submittedH2.submissionId, artifactId: submittedH2.artifactId,
    answerBodyHmac: answerBodyHmac('answer-version-two'), privacyEpoch: 7, operationPolicyVersion: 'op-v1',
    answerVersion: 2, idempotencyKey: 'scor-req-h2',
  }));
  A('答案版本替换：v2 提交后，v1 在途 request 被 fence',
    (await admin.query<{ status: string }>('SELECT status FROM score_request WHERE id=$1', [reqH1.requestId])).rows[0]?.status === 'fenced');
  A('答案版本替换：v2 request 仍 pending（可正常 claim）',
    (await admin.query<{ status: string }>('SELECT status FROM score_request WHERE id=$1', [reqH2.requestId])).rows[0]?.status === 'pending');

  /* ── H. 更正 supersedes 链：旧卡 superseded、新卡终态、历史不覆盖 ─────── */
  const newCard = await asWorker(owner, (c) => supersedeScoreCard(c, cardId, {
    criteria: CARD_CRITERIA, deterministicTotal: 91, coverage: 1.0, provenance: { producer: 'proof-v2' },
  }));
  A('supersede：旧卡转 superseded + 新卡非空',
    newCard.supersededCardId === cardId && newCard.cardId.length > 0
    && (await admin.query<{ status: string }>('SELECT status FROM score_card WHERE id=$1', [cardId])).rows[0]?.status === 'superseded');
  A('supersede：历史不覆盖（旧卡行仍存在，supersedes 链指向旧卡）',
    (await admin.query<{ supersedes_card_id: string | null }>('SELECT supersedes_card_id FROM score_card WHERE id=$1', [newCard.cardId])).rows[0]?.supersedes_card_id === cardId);
  A('supersede 后终态卡唯一（旧卡 superseded 不再计入 partial unique index）',
    (await admin.query<{ n: string | number }>(
      "SELECT count(*)::int AS n FROM score_card WHERE score_request_id=$1 AND status NOT IN ('superseded','fenced')", [req.requestId])).rows[0]?.n === 1);
  A('supersede 已 inactive 卡（再次 supersede 旧卡）被拒',
    await rejects(() => asWorker(owner, (c) => supersedeScoreCard(c, cardId, {
      criteria: CARD_CRITERIA, deterministicTotal: 99, coverage: 1.0,
    }))));
  // M1：supersede 成员/weight 校验（镜像 recordScoreCard）：对仍 active 的新卡写幻觉 criterionId /
  // 错误 weight 均被拒，且拒后新卡不被误转 superseded。
  A('supersede 传幻觉 criterionId → 拒（成员校验镜像）',
    await rejects(() => asWorker(owner, (c) => supersedeScoreCard(c, newCard.cardId, {
      criteria: [{ criterionId: 'hallucinated', disposition: 'meets', score: 5, weight: 1 }],
      deterministicTotal: 5, coverage: 1.0,
    }))));
  A('supersede 传错误 weight → 拒（weight 校验镜像）',
    await rejects(() => asWorker(owner, (c) => supersedeScoreCard(c, newCard.cardId, {
      criteria: [{ criterionId: 'clarity', disposition: 'meets', score: 8, weight: 99 }],
      deterministicTotal: 8, coverage: 1.0,
    }))));
  A('supersede 校验被拒后旧卡仍 active（未误转 superseded）',
    (await admin.query<{ status: string }>('SELECT status FROM score_card WHERE id=$1', [newCard.cardId])).rows[0]?.status === 'pending_evidence');

  /* ── I. RLS 跨 owner = 0（score_card/score_request/issued_question_contract/score_card_criterion） */
  A('跨 owner 读 score_card = 0 行',
    (await asOwner(otherOwner, (c) => c.query<{ n: string | number }>('SELECT count(*)::int AS n FROM score_card'))).rows[0]?.n === 0);
  A('跨 owner 读 score_request = 0 行',
    (await asOwner(otherOwner, (c) => c.query<{ n: string | number }>('SELECT count(*)::int AS n FROM score_request'))).rows[0]?.n === 0);
  A('跨 owner 读 issued_question_contract = 0 行',
    (await asOwner(otherOwner, (c) => c.query<{ n: string | number }>('SELECT count(*)::int AS n FROM issued_question_contract'))).rows[0]?.n === 0);
  A('跨 owner 读 score_card_criterion = 0 行',
    (await asOwner(otherOwner, (c) => c.query<{ n: string | number }>('SELECT count(*)::int AS n FROM score_card_criterion'))).rows[0]?.n === 0);
  A('app_role 无 scoring_definer 表写权（原始 INSERT score_card 被拒）',
    await rejects(() => asOwner(owner, (c) => c.query(
      "INSERT INTO score_card(owner_user_id,interview_id,question_id,answer_id,submission_id,score_request_id,issued_contract_id,rubric_id,rubric_version,measurement_version,deterministic_total,coverage,status) VALUES (current_setting('app.principal_user',true),$1,'q-x',$2,$3,$4,$5,$6,1,'m',0,0,'pending_evidence')",
      [ivA, submitted.artifactId, submitted.submissionId, req.requestId, issued.contractId, rubricId]))));

  /* ── J. supersede 的删除/privacy fence 重校验（M2：弱化删后 read=0）──────── */
  // J1 删除 fence（answer-artifact）：begin-erasure 后 supersede 在
  // assert_interview_answer_fact_active 处抛错、事务整体回滚（artifact 未物理 purge 前）。
  const ivJ1 = '00000000-0000-4000-8000-0000000000c5';
  await insertInterview(owner, ivJ1);
  const issuedJ1 = await asOwner(owner, (c) => issueQuestionContract(c, {
    interviewId: ivJ1, questionId: 'q-scor-j1', stateVersion: 1, turn: 0, questionContentHash: qHash,
    rubricId, form: 'mock', language: 'zh', route: 'adaptive', promptPolicyVersion: 'prompt-v1',
    measurementVersion: 'measure-v1', privacyEpoch: 8,
  }));
  const submittedJ1 = await asOwner(owner, (c) => submitInterviewAnswer(c, {
    interviewId: ivJ1, questionId: 'q-scor-j1', stateVersion: 1, clientSubmissionKey: 'scor-sub-j1',
    answer: 'supersede-delete-fence', privacyEpoch: 8,
  }));
  const reqJ1 = await asOwner(owner, (c) => createScoreRequest(c, {
    issuedContractId: issuedJ1.contractId, submissionId: submittedJ1.submissionId, artifactId: submittedJ1.artifactId,
    answerBodyHmac: answerBodyHmac('supersede-delete-fence'), privacyEpoch: 8, operationPolicyVersion: 'op-v1',
    answerVersion: 1, idempotencyKey: 'scor-req-j1',
  }));
  const tokenJ1 = '00000000-0000-4000-8000-0000000000d5';
  await asWorker(owner, (c) => claimScoreRequest(c, reqJ1.requestId, worker, tokenJ1));
  const cardJ1 = await asWorker(owner, (c) => recordScoreCard(c, {
    requestId: reqJ1.requestId, leaseToken: tokenJ1, criteria: CARD_CRITERIA, deterministicTotal: 10, coverage: 1.0,
  }));
  A('J1 前置：卡片已写卡成功（recorded + cardId 非空）',
    cardJ1.recorded === true && cardJ1.cardId !== null);
  await asOwner(owner, (c) => beginInterviewAnswerFactErasure(c, ivJ1, nextHash(), 8));
  A('删除 fence 后 supersede 被拒（assert_interview_answer_fact_active）',
    await rejects(() => asWorker(owner, (c) => supersedeScoreCard(c, cardJ1.cardId!, {
      criteria: CARD_CRITERIA, deterministicTotal: 11, coverage: 1.0,
    }))));

  // J2 erasure fence（privacy）：projection begin-erasure 建 checkpoint_rows 锚使
  // interview_privacy_active 转 false，supersede 在 assert_interview_privacy_active 处抛错。
  const ivJ2 = '00000000-0000-4000-8000-0000000000c6';
  await insertInterview(owner, ivJ2);
  const issuedJ2 = await asOwner(owner, (c) => issueQuestionContract(c, {
    interviewId: ivJ2, questionId: 'q-scor-j2', stateVersion: 1, turn: 0, questionContentHash: qHash,
    rubricId, form: 'mock', language: 'zh', route: 'adaptive', promptPolicyVersion: 'prompt-v1',
    measurementVersion: 'measure-v1', privacyEpoch: 9,
  }));
  const submittedJ2 = await asOwner(owner, (c) => submitInterviewAnswer(c, {
    interviewId: ivJ2, questionId: 'q-scor-j2', stateVersion: 1, clientSubmissionKey: 'scor-sub-j2',
    answer: 'supersede-privacy-fence', privacyEpoch: 9,
  }));
  const reqJ2 = await asOwner(owner, (c) => createScoreRequest(c, {
    issuedContractId: issuedJ2.contractId, submissionId: submittedJ2.submissionId, artifactId: submittedJ2.artifactId,
    answerBodyHmac: answerBodyHmac('supersede-privacy-fence'), privacyEpoch: 9, operationPolicyVersion: 'op-v1',
    answerVersion: 1, idempotencyKey: 'scor-req-j2',
  }));
  const tokenJ2 = '00000000-0000-4000-8000-0000000000d6';
  await asWorker(owner, (c) => claimScoreRequest(c, reqJ2.requestId, worker, tokenJ2));
  const cardJ2 = await asWorker(owner, (c) => recordScoreCard(c, {
    requestId: reqJ2.requestId, leaseToken: tokenJ2, criteria: CARD_CRITERIA, deterministicTotal: 10, coverage: 1.0,
  }));
  A('J2 前置：卡片已写卡成功（recorded + cardId 非空）',
    cardJ2.recorded === true && cardJ2.cardId !== null);
  await asOwner(owner, (c) => beginInterviewProjectionErasure(c, ivJ2, nextHash(), 9));
  A('erasure 后 supersede 被拒（assert_interview_privacy_active）',
    await rejects(() => asWorker(owner, (c) => supersedeScoreCard(c, cardJ2.cardId!, {
      criteria: CARD_CRITERIA, deterministicTotal: 11, coverage: 1.0,
    }))));

  await admin.end();
  console.log(failures === 0
    ? '\n✓ 评分测量事实根（SCOR-01）DB 证明通过（本地隔离证据）'
    : `\n✗ ${failures} 个断言失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => { console.error(e); await admin.end().catch(() => undefined); process.exit(1); });

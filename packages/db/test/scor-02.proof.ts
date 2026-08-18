/**
 * 评分确定性聚合（SCOR-02）DB 证明。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres（完整迁移 + nonce 校验）。证明：
 *   - 确定性公式：模型不得输出自由总分，总分 = round(Σ(weight×band×50)/Σ(weight))，0..100 整数
 *   - span/digest 文本级复验（domain）：span 在当前答案版本内 + sha256(UTF-8 字节)==digest
 *   - 专用终态 writer：只写 practice_eligible/b_review_eligible；非评分态 fail-closed 拒写
 *   - 绑定级复验（DB）：rubric 成员 / sourceAnswerId==当前 artifact / answerVersion==request 版本 /
 *     span 规范 / offsetKind / digest 格式 / 重复 span / required criterion / 硬上限 capRules.maxBand
 *   - 聚合只消费可评分态卡；非评分态卡与 legacy answer_evaluated.score 整数事件 → 0（结构性排除）
 *   - 四个原语：CAS（单 winner 终态卡）、RLS 跨 owner=0、append-only、事务内单调 eventSeq
 */
import {
  createPool, asPrincipal, asScoringWorkerPrincipal, assertIsolatedTestTarget,
  submitInterviewAnswer, answerBodyHmac,
  publishQuestionRubric, issueQuestionContract, createScoreRequest, claimScoreRequest,
  recordScoreCard, transitionScoreCard, writeFinalScoreCard, aggregateInterviewScores,
  listScorableScoreCards, appendEvent,
  type Client, type ScoreEvidenceInput,
} from '@meetwise/db';
import {
  SCORE_CARD_NON_SCORING_STATUSES, isScoreCardScorable,
  canonicalScoreSpan, scoreSpanDigest, reverifyScoreEvidenceSpan,
  computeDeterministicTotal, aggregateScoreCards, deriveScoreCardAssessment,
  deriveAssessment,
} from '@meetwise/domain';

// 确定性密钥（在调用 submitInterviewAnswer/answerBodyHmac 前注入；int-transcript.ts 惰性读取）。
process.env.INTERVIEW_ANSWER_ENC_KEY = 'proof_answer_enc_key_v1_16chars';
process.env.INTERVIEW_ANSWER_HMAC_SECRET = 'proof_answer_hmac_secret_16chars';

const admin = createPool();
const owner = `scor2-owner-${process.pid}`;
const otherOwner = `scor2-other-${process.pid}`;
const worker = `scor2-worker-${process.pid}`;

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };

const asOwner = <T>(u: string, fn: (c: Client) => Promise<T>) => asPrincipal(admin, u, fn);
const asWorker = <T>(u: string, fn: (c: Client) => Promise<T>) => asScoringWorkerPrincipal(admin, u, fn);

let hashCounter = 0;
const nextHash = () => (++hashCounter).toString(16).padStart(64, '0');
let tokenCounter = 0;
const nextToken = () => `00000000-0000-4000-8000-${(++tokenCounter).toString(16).padStart(12, '0')}`;
let ivCounter = 0;
const nextIv = () => `00000000-0000-4000-8000-${(++ivCounter).toString(16).padStart(12, '0')}`;

async function insertInterview(ownerId: string, interviewId: string): Promise<void> {
  await admin.query(
    "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions) VALUES ($1,$2,'active',0,0,'[]'::jsonb)",
    [interviewId, ownerId],
  );
}

// 确定性公式的答案 + span（UTF-8 字节）：ANSWER='my-scored-answer-body-123'。
// 'my-scored' = 0..9；'answer-body' = 10..21。
const ANSWER = 'my-scored-answer-body-123';
const SPAN_CLARITY = { offsetKind: 'utf8_byte' as const, start: 0, end: 9 };
const SPAN_DEPTH = { offsetKind: 'utf8_byte' as const, start: 10, end: 21 };
const validEvidence = (artifact: string, version: number): [ScoreEvidenceInput, ScoreEvidenceInput] => [
  { criterionId: 'clarity', sourceAnswerId: artifact, answerVersion: version, span: SPAN_CLARITY, spanDigest: scoreSpanDigest(ANSWER, SPAN_CLARITY), disposition: 'meets' as const },
  { criterionId: 'depth', sourceAnswerId: artifact, answerVersion: version, span: SPAN_DEPTH, spanDigest: scoreSpanDigest(ANSWER, SPAN_DEPTH), disposition: 'exceeds' as const },
];
// meets+exceeds, w[clarity:2,depth:3] → (2×50 + 3×100)/5 = 80。
const EXPECT_TOTAL = 80;

const RUBRIC_CRITERIA = [
  { criterionId: 'clarity', weight: 2 },
  { criterionId: 'depth', weight: 3 },
];

async function main() {
  await assertIsolatedTestTarget(admin);

  /* ── A. domain 确定性公式（纯逻辑，无 DB）────────────────────────────── */
  A('公式：meets+exceeds w[2,3] → 80',
    computeDeterministicTotal([
      { criterionId: 'clarity', disposition: 'meets', weight: 2 },
      { criterionId: 'depth', disposition: 'exceeds', weight: 3 },
    ]) === 80);
  A('公式：exceeds+exceeds w[2,3] → 100',
    computeDeterministicTotal([
      { criterionId: 'clarity', disposition: 'exceeds', weight: 2 },
      { criterionId: 'depth', disposition: 'exceeds', weight: 3 },
    ]) === 100);
  A('公式：below+below w[2,3] → 0',
    computeDeterministicTotal([
      { criterionId: 'clarity', disposition: 'below', weight: 2 },
      { criterionId: 'depth', disposition: 'below', weight: 3 },
    ]) === 0);
  A('公式：重放字节级一致（确定性，非模型随机）',
    computeDeterministicTotal([
      { criterionId: 'clarity', disposition: 'meets', weight: 2 },
      { criterionId: 'depth', disposition: 'exceeds', weight: 3 },
    ]) === computeDeterministicTotal([
      { criterionId: 'clarity', disposition: 'meets', weight: 2 },
      { criterionId: 'depth', disposition: 'exceeds', weight: 3 },
    ]));
  A('公式：空集抛错（无分 ≠ 0 分）',
    await rejects(async () => computeDeterministicTotal([])));
  A('公式：重复 criterionId 抛错',
    await rejects(async () => computeDeterministicTotal([
      { criterionId: 'clarity', disposition: 'meets', weight: 2 },
      { criterionId: 'clarity', disposition: 'exceeds', weight: 2 },
    ])));
  A('聚合：aggregateScoreCards([80,100]) → 90', aggregateScoreCards([80, 100]) === 90);
  A('聚合：aggregateScoreCards([]) 抛错', await rejects(async () => aggregateScoreCards([])));
  A('C 端评估消费面：非评分态卡不进入 overall（null）+ nonScorableCount=1',
    (() => {
      const a = deriveScoreCardAssessment([
        { questionId: 'q', competency: '沟通表达', deterministicTotal: 80, status: 'practice_eligible' },
        { questionId: 'q2', competency: '沟通表达', deterministicTotal: 80, status: 'unscored' },
      ]);
      return a.overall === 80 && a.eligibleCount === 1 && a.nonScorableCount === 1 && a.dimensions.length === 1;
    })());
  A('C 端评估消费面：两张可评分卡 → overall 90',
    deriveScoreCardAssessment([
      { questionId: 'q', competency: '沟通表达', deterministicTotal: 80, status: 'practice_eligible' },
      { questionId: 'q2', competency: '沟通表达', deterministicTotal: 100, status: 'b_review_eligible' },
    ]).overall === 90);
  A('非评分态不参与评分（unscored/review_required/calibration_blocked/evidence_invalid）',
    SCORE_CARD_NON_SCORING_STATUSES.every((s) => !isScoreCardScorable(s)));

  /* ── B. span/digest 文本级复验（domain）──────────────────────────────── */
  A('span 规范化：utf8_byte 合法', canonicalScoreSpan(SPAN_CLARITY) === 'utf8_byte:0:9');
  A('span 规范化：非 utf8_byte 坐标系抛错',
    await rejects(async () => canonicalScoreSpan({ offsetKind: 'unicode_codepoint' as never, start: 0, end: 9 })));
  A('span 复验：正确 digest + 界内 → true',
    reverifyScoreEvidenceSpan(ANSWER, SPAN_CLARITY, scoreSpanDigest(ANSWER, SPAN_CLARITY)) === true);
  A('span 复验：错误 digest → false',
    reverifyScoreEvidenceSpan(ANSWER, SPAN_CLARITY, nextHash()) === false);
  A('span 复验：span.end 越界 → false',
    reverifyScoreEvidenceSpan(ANSWER, { offsetKind: 'utf8_byte', start: 0, end: 9999 }, nextHash()) === false);

  /* ── C. DB 终态写卡成功 + 四原语落点 ─────────────────────────────────── */
  const ivC = nextIv();
  await insertInterview(owner, ivC);
  const rubricId = (await asOwner(owner, (c) => publishQuestionRubric(c, {
    questionId: 'q-scor2', questionVersion: 1, rubricVersion: 1, competency: '沟通表达',
    difficulty: 3, languageScope: ['zh', 'en'], questionContentHash: nextHash(), criteria: RUBRIC_CRITERIA,
  }))).rubricId;
  A('发布版本化 rubric（返回 rubricId + 2 分项落库）',
    (await admin.query('SELECT count(*)::int AS n FROM question_rubric_criterion WHERE rubric_id=$1', [rubricId])).rows[0]?.n === 2);

  const issued = await asOwner(owner, (c) => issueQuestionContract(c, {
    interviewId: ivC, questionId: 'q-scor2', stateVersion: 2, turn: 0, questionContentHash: nextHash(),
    rubricId, form: 'mock', language: 'zh', route: 'adaptive', promptPolicyVersion: 'prompt-v1',
    measurementVersion: 'measure-v1', privacyEpoch: 5,
  }));
  const submitted = await asOwner(owner, (c) => submitInterviewAnswer(c, {
    interviewId: ivC, questionId: 'q-scor2', stateVersion: 2, clientSubmissionKey: 'scor2-sub-c',
    answer: ANSWER, privacyEpoch: 5,
  }));
  const req = await asOwner(owner, (c) => createScoreRequest(c, {
    issuedContractId: issued.contractId, submissionId: submitted.submissionId, artifactId: submitted.artifactId,
    answerBodyHmac: answerBodyHmac(ANSWER), privacyEpoch: 5, operationPolicyVersion: 'op-v1',
    answerVersion: 1, idempotencyKey: 'scor2-req-c',
  }));
  const tokenC = nextToken();
  await asWorker(owner, (c) => claimScoreRequest(c, req.requestId, worker, tokenC));

  const written = await asWorker(owner, (c) => writeFinalScoreCard(c, {
    requestId: req.requestId, leaseToken: tokenC,
    evidence: validEvidence(submitted.artifactId, 1), targetStatus: 'practice_eligible',
  }));
  A('终态写卡成功（recorded=true, status=practice_eligible, total=80, coverage=1.0）',
    written.recorded === true && written.status === 'practice_eligible'
    && written.deterministicTotal === 80 && written.coverage === 1.0 && (written.cardId?.length ?? 0) > 0);
  const cardId = written.cardId!;
  A('DB 确定性总分与 domain 公式逐值一致（跨侧 pin）',
    written.deterministicTotal === computeDeterministicTotal([
      { criterionId: 'clarity', disposition: 'meets', weight: 2 },
      { criterionId: 'depth', disposition: 'exceeds', weight: 3 },
    ]));
  A('写卡后 request → scored（原语① CAS 单 winner）',
    (await admin.query<{ status: string }>('SELECT status FROM score_request WHERE id=$1', [req.requestId])).rows[0]?.status === 'scored');
  A('score_evidence 落库 2 条（append-only）',
    (await admin.query('SELECT count(*)::int AS n FROM score_evidence WHERE card_id=$1', [cardId])).rows[0]?.n === 2);
  A('score_evidence 坐标系 = utf8_byte + 有限档（below/meets/exceeds）',
    (await admin.query<{ n: string | number }>(
      "SELECT count(*)::int AS n FROM score_evidence WHERE card_id=$1 AND span_offset_kind='utf8_byte' AND disposition IN ('below','meets','exceeds')", [cardId])).rows[0]?.n === 2);
  A('score_card_criterion 落库（per-criterion score = 50×band：clarity=50, depth=100）',
    (await admin.query<{ criterion_id: string; score: string }>(
      'SELECT criterion_id, score FROM score_card_criterion WHERE card_id=$1', [cardId])).rows
      .sort((a, b) => a.criterion_id.localeCompare(b.criterion_id))
      .every((r, i) => (i === 0 ? r.criterion_id === 'clarity' && Number(r.score) === 50
        : r.criterion_id === 'depth' && Number(r.score) === 100)));
  A('写卡同事务原子发出 score_card_written 事件（原语④ 单调 seq）',
    (await admin.query<{ n: string | number }>(
      "SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1 AND kind='score_card_written'", [ivC])).rows[0]?.n === 1);
  A('迟到第二次写卡（request 已 scored）→ recorded=false + cardId=null',
    (await asWorker(owner, (c) => writeFinalScoreCard(c, {
      requestId: req.requestId, leaseToken: tokenC,
      evidence: validEvidence(submitted.artifactId, 1), targetStatus: 'practice_eligible',
    }))).recorded === false);
  A('每 request 至多一张终态卡（partial unique index 兜底）',
    (await admin.query<{ n: string | number }>(
      "SELECT count(*)::int AS n FROM score_card WHERE score_request_id=$1 AND status NOT IN ('superseded','fenced')", [req.requestId])).rows[0]?.n === 1);

  /* ── D. 非评分态目标态 fail-closed（只写可评分终态卡）────────────────── */
  const ivD = nextIv();
  await insertInterview(owner, ivD);
  const issuedD = await asOwner(owner, (c) => issueQuestionContract(c, {
    interviewId: ivD, questionId: 'q-scor2-d', stateVersion: 2, turn: 0, questionContentHash: nextHash(),
    rubricId, form: 'mock', language: 'zh', route: 'adaptive', promptPolicyVersion: 'prompt-v1',
    measurementVersion: 'measure-v1', privacyEpoch: 5,
  }));
  const submittedD = await asOwner(owner, (c) => submitInterviewAnswer(c, {
    interviewId: ivD, questionId: 'q-scor2-d', stateVersion: 2, clientSubmissionKey: 'scor2-sub-d',
    answer: ANSWER, privacyEpoch: 5,
  }));
  const reqD = await asOwner(owner, (c) => createScoreRequest(c, {
    issuedContractId: issuedD.contractId, submissionId: submittedD.submissionId, artifactId: submittedD.artifactId,
    answerBodyHmac: answerBodyHmac(ANSWER), privacyEpoch: 5, operationPolicyVersion: 'op-v1',
    answerVersion: 1, idempotencyKey: 'scor2-req-d',
  }));
  const tokenD = nextToken();
  await asWorker(owner, (c) => claimScoreRequest(c, reqD.requestId, worker, tokenD));
  for (const bad of ['unscored', 'review_required', 'calibration_blocked', 'evidence_invalid']) {
    A(`非评分态目标态 ${bad} → 拒写（fail-closed）`,
      await rejects(() => asWorker(owner, (c) => writeFinalScoreCard(c, {
        requestId: reqD.requestId, leaseToken: tokenD,
        evidence: validEvidence(submittedD.artifactId, 1), targetStatus: bad as unknown as 'practice_eligible',
      }))));
  }
  A('非评分态拒写后 request 仍 claimed（未误 scored）',
    (await admin.query<{ status: string }>('SELECT status FROM score_request WHERE id=$1', [reqD.requestId])).rows[0]?.status === 'claimed');
  A('非评分态拒写后 card=0',
    (await admin.query<{ n: string | number }>('SELECT count(*)::int AS n FROM score_card WHERE score_request_id=$1', [reqD.requestId])).rows[0]?.n === 0);

  /* ── E. 绑定级复验负路径（rubric 成员/答案版本/span/重复/required/硬上限）── */
  const ivE = nextIv();
  await insertInterview(owner, ivE);
  const issuedE = await asOwner(owner, (c) => issueQuestionContract(c, {
    interviewId: ivE, questionId: 'q-scor2-e', stateVersion: 2, turn: 0, questionContentHash: nextHash(),
    rubricId, form: 'mock', language: 'zh', route: 'adaptive', promptPolicyVersion: 'prompt-v1',
    measurementVersion: 'measure-v1', privacyEpoch: 5,
  }));
  const submittedE = await asOwner(owner, (c) => submitInterviewAnswer(c, {
    interviewId: ivE, questionId: 'q-scor2-e', stateVersion: 2, clientSubmissionKey: 'scor2-sub-e',
    answer: ANSWER, privacyEpoch: 5,
  }));
  const reqE = await asOwner(owner, (c) => createScoreRequest(c, {
    issuedContractId: issuedE.contractId, submissionId: submittedE.submissionId, artifactId: submittedE.artifactId,
    answerBodyHmac: answerBodyHmac(ANSWER), privacyEpoch: 5, operationPolicyVersion: 'op-v1',
    answerVersion: 1, idempotencyKey: 'scor2-req-e',
  }));
  const tokenE = nextToken();
  await asWorker(owner, (c) => claimScoreRequest(c, reqE.requestId, worker, tokenE));

  const base = validEvidence(submittedE.artifactId, 1);
  A('幻觉 criterionId → 拒（成员校验）',
    await rejects(() => asWorker(owner, (c) => writeFinalScoreCard(c, {
      requestId: reqE.requestId, leaseToken: tokenE,
      evidence: [base[0], { ...base[1], criterionId: 'hallucinated' }], targetStatus: 'practice_eligible',
    }))));
  A('陈旧 sourceAnswerId → 拒（当前答案版本绑定）',
    await rejects(() => asWorker(owner, (c) => writeFinalScoreCard(c, {
      requestId: reqE.requestId, leaseToken: tokenE,
      evidence: [base[0], { ...base[1], sourceAnswerId: '00000000-0000-4000-8000-0000000000ff' }], targetStatus: 'practice_eligible',
    }))));
  A('错误 answerVersion → 拒',
    await rejects(() => asWorker(owner, (c) => writeFinalScoreCard(c, {
      requestId: reqE.requestId, leaseToken: tokenE,
      evidence: [base[0], { ...base[1], answerVersion: 99 }], targetStatus: 'practice_eligible',
    }))));
  A('span start>end → 拒',
    await rejects(() => asWorker(owner, (c) => writeFinalScoreCard(c, {
      requestId: reqE.requestId, leaseToken: tokenE,
      evidence: [base[0], { ...base[1], span: { offsetKind: 'utf8_byte' as const, start: 5, end: 2 } }], targetStatus: 'practice_eligible',
    }))));
  A('span offsetKind 非 utf8_byte → 拒',
    await rejects(() => asWorker(owner, (c) => writeFinalScoreCard(c, {
      requestId: reqE.requestId, leaseToken: tokenE,
      evidence: [base[0], { ...base[1], span: { offsetKind: 'unicode_codepoint' as never, start: 10, end: 21 } }], targetStatus: 'practice_eligible',
    }))));
  A('spanDigest 格式非法 → 拒',
    await rejects(() => asWorker(owner, (c) => writeFinalScoreCard(c, {
      requestId: reqE.requestId, leaseToken: tokenE,
      evidence: [base[0], { ...base[1], spanDigest: 'not-hex' }], targetStatus: 'practice_eligible',
    }))));
  A('重复 span（两 criterion 引用同一 span）→ 拒',
    await rejects(() => asWorker(owner, (c) => writeFinalScoreCard(c, {
      requestId: reqE.requestId, leaseToken: tokenE,
      evidence: [base[0], { ...base[1], span: SPAN_CLARITY, spanDigest: scoreSpanDigest(ANSWER, SPAN_CLARITY) }], targetStatus: 'practice_eligible',
    }))));
  A('required criterion 缺失（只给 1/2 分项）→ 拒',
    await rejects(() => asWorker(owner, (c) => writeFinalScoreCard(c, {
      requestId: reqE.requestId, leaseToken: tokenE,
      evidence: [base[0]], targetStatus: 'practice_eligible',
    }))));
  A('负路径全部拒后 request 仍 claimed + card=0（未误写）',
    (await admin.query<{ status: string }>('SELECT status FROM score_request WHERE id=$1', [reqE.requestId])).rows[0]?.status === 'claimed'
    && (await admin.query<{ n: string | number }>('SELECT count(*)::int AS n FROM score_card WHERE score_request_id=$1', [reqE.requestId])).rows[0]?.n === 0);

  // 负路径后同请求仍可成功写卡（permit 未被消耗）。
  const writtenE = await asWorker(owner, (c) => writeFinalScoreCard(c, {
    requestId: reqE.requestId, leaseToken: tokenE,
    evidence: base, targetStatus: 'practice_eligible',
  }));
  A('负路径后同请求成功写卡（total=80）', writtenE.recorded === true && writtenE.deterministicTotal === EXPECT_TOTAL);

  // 硬上限 capRules.maxBand：depth 上限 meets → exceeds 越上限拒；meets 通过。
  const cappedRubricId = (await asOwner(owner, (c) => publishQuestionRubric(c, {
    questionId: 'q-scor2-cap', questionVersion: 1, rubricVersion: 1, competency: '沟通表达',
    difficulty: 3, languageScope: ['zh', 'en'], questionContentHash: nextHash(),
    criteria: [
      { criterionId: 'clarity', weight: 2 },
      { criterionId: 'depth', weight: 3, capRules: { maxBand: 'meets' } },
    ],
  }))).rubricId;
  const ivCap = nextIv();
  await insertInterview(owner, ivCap);
  const issuedCap = await asOwner(owner, (c) => issueQuestionContract(c, {
    interviewId: ivCap, questionId: 'q-scor2-cap', stateVersion: 2, turn: 0, questionContentHash: nextHash(),
    rubricId: cappedRubricId, form: 'mock', language: 'zh', route: 'adaptive', promptPolicyVersion: 'prompt-v1',
    measurementVersion: 'measure-v1', privacyEpoch: 5,
  }));
  const submittedCap = await asOwner(owner, (c) => submitInterviewAnswer(c, {
    interviewId: ivCap, questionId: 'q-scor2-cap', stateVersion: 2, clientSubmissionKey: 'scor2-sub-cap',
    answer: ANSWER, privacyEpoch: 5,
  }));
  const reqCap = await asOwner(owner, (c) => createScoreRequest(c, {
    issuedContractId: issuedCap.contractId, submissionId: submittedCap.submissionId, artifactId: submittedCap.artifactId,
    answerBodyHmac: answerBodyHmac(ANSWER), privacyEpoch: 5, operationPolicyVersion: 'op-v1',
    answerVersion: 1, idempotencyKey: 'scor2-req-cap',
  }));
  const tokenCap = nextToken();
  await asWorker(owner, (c) => claimScoreRequest(c, reqCap.requestId, worker, tokenCap));
  A('硬上限 capRules.maxBand=meets：depth exceeds → 越上限拒',
    await rejects(() => asWorker(owner, (c) => writeFinalScoreCard(c, {
      requestId: reqCap.requestId, leaseToken: tokenCap,
      evidence: validEvidence(submittedCap.artifactId, 1), targetStatus: 'practice_eligible',
    }))));
  A('硬上限内：depth meets → 通过（total=(2×50+3×50)/5=50）',
    (await asWorker(owner, (c) => writeFinalScoreCard(c, {
      requestId: reqCap.requestId, leaseToken: tokenCap,
      evidence: [
        { criterionId: 'clarity', sourceAnswerId: submittedCap.artifactId, answerVersion: 1, span: SPAN_CLARITY, spanDigest: scoreSpanDigest(ANSWER, SPAN_CLARITY), disposition: 'meets' as const },
        { criterionId: 'depth', sourceAnswerId: submittedCap.artifactId, answerVersion: 1, span: SPAN_DEPTH, spanDigest: scoreSpanDigest(ANSWER, SPAN_DEPTH), disposition: 'meets' as const },
      ], targetStatus: 'practice_eligible',
    }))).deterministicTotal === 50);

  /* ── F. 聚合只消费可评分态卡 + legacy 事件结构性排除 ─────────────────── */
  // F1：两张可评分卡（80 + 100）→ eligible=2, overall=90, non_scoring=0。
  const ivAgg = nextIv();
  await insertInterview(owner, ivAgg);
  for (const [qi, tot] of [['agg-1', 80], ['agg-2', 100]] as const) {
    const issuedAgg = await asOwner(owner, (c) => issueQuestionContract(c, {
      interviewId: ivAgg, questionId: qi, stateVersion: 2, turn: 0, questionContentHash: nextHash(),
      rubricId, form: 'mock', language: 'zh', route: 'adaptive', promptPolicyVersion: 'prompt-v1',
      measurementVersion: 'measure-v1', privacyEpoch: 5,
    }));
    const subAgg = await asOwner(owner, (c) => submitInterviewAnswer(c, {
      interviewId: ivAgg, questionId: qi, stateVersion: 2, clientSubmissionKey: `scor2-sub-${qi}`,
      answer: ANSWER, privacyEpoch: 5,
    }));
    const reqAgg = await asOwner(owner, (c) => createScoreRequest(c, {
      issuedContractId: issuedAgg.contractId, submissionId: subAgg.submissionId, artifactId: subAgg.artifactId,
      answerBodyHmac: answerBodyHmac(ANSWER), privacyEpoch: 5, operationPolicyVersion: 'op-v1',
      answerVersion: 1, idempotencyKey: `scor2-req-${qi}`,
    }));
    const tokenAgg = nextToken();
    await asWorker(owner, (c) => claimScoreRequest(c, reqAgg.requestId, worker, tokenAgg));
    const w = await asWorker(owner, (c) => writeFinalScoreCard(c, {
      requestId: reqAgg.requestId, leaseToken: tokenAgg,
      evidence: tot === 80 ? validEvidence(subAgg.artifactId, 1)
        : [
          { criterionId: 'clarity', sourceAnswerId: subAgg.artifactId, answerVersion: 1, span: SPAN_CLARITY, spanDigest: scoreSpanDigest(ANSWER, SPAN_CLARITY), disposition: 'exceeds' as const },
          { criterionId: 'depth', sourceAnswerId: subAgg.artifactId, answerVersion: 1, span: SPAN_DEPTH, spanDigest: scoreSpanDigest(ANSWER, SPAN_DEPTH), disposition: 'exceeds' as const },
        ],
      targetStatus: 'practice_eligible',
    }));
    A(`聚合前置：写卡 ${qi} 成功（total=${tot}）`, w.recorded === true && w.deterministicTotal === tot);
  }
  const agg2 = await asOwner(owner, (c) => aggregateInterviewScores(c, ivAgg));
  A('聚合：2 张可评分卡 → eligible=2, overall=90, non_scoring=0',
    agg2.eligibleCardCount === 2 && agg2.deterministicOverall === 90 && agg2.nonScoringCardCount === 0);
  A('DB 聚合与 domain 均值一致（round((80+100)/2)=90）',
    agg2.deterministicOverall === aggregateScoreCards([80, 100]));
  A('C 端逐题读面：只返回 2 张可评分卡',
    (await asOwner(owner, (c) => listScorableScoreCards(c, ivAgg))).length === 2);

  // F1b：跨包 e2e 正向链——db 读面（listScorableScoreCards）→ domain 消费面（deriveAssessment，
  // 与 apps/api generateAssessment 同链）→ 确定性 overall + 按 competency 分组维度。这证明
  // 「读面→消费面」整链真的吃 ScoreCard，而非靠 aggregateInterviewScores 单独证明。
  const f1Cards = await asOwner(owner, (c) => listScorableScoreCards(c, ivAgg));
  const f1Turns = f1Cards.map((card) => ({ question: card.questionId, competency: card.competency, score: card.deterministicTotal }));
  const f1Assess = deriveAssessment(f1Turns);
  A('跨包 e2e：2 张卡经读面→deriveAssessment → overall=90 + competency 单维度 + score=90',
    f1Assess.overall === 90 && f1Assess.dimensions.length === 1
    && f1Assess.dimensions[0]?.dimension === '沟通表达' && f1Assess.dimensions[0]?.score === 90);

  // F2：非评分态卡（unscored）→ eligible=0, overall=null, non_scoring=1。
  const ivNon = nextIv();
  await insertInterview(owner, ivNon);
  const issuedNon = await asOwner(owner, (c) => issueQuestionContract(c, {
    interviewId: ivNon, questionId: 'q-scor2-non', stateVersion: 2, turn: 0, questionContentHash: nextHash(),
    rubricId, form: 'mock', language: 'zh', route: 'adaptive', promptPolicyVersion: 'prompt-v1',
    measurementVersion: 'measure-v1', privacyEpoch: 5,
  }));
  const subNon = await asOwner(owner, (c) => submitInterviewAnswer(c, {
    interviewId: ivNon, questionId: 'q-scor2-non', stateVersion: 2, clientSubmissionKey: 'scor2-sub-non',
    answer: ANSWER, privacyEpoch: 5,
  }));
  const reqNon = await asOwner(owner, (c) => createScoreRequest(c, {
    issuedContractId: issuedNon.contractId, submissionId: subNon.submissionId, artifactId: subNon.artifactId,
    answerBodyHmac: answerBodyHmac(ANSWER), privacyEpoch: 5, operationPolicyVersion: 'op-v1',
    answerVersion: 1, idempotencyKey: 'scor2-req-non',
  }));
  const tokenNon = nextToken();
  await asWorker(owner, (c) => claimScoreRequest(c, reqNon.requestId, worker, tokenNon));
  const recNon = await asWorker(owner, (c) => recordScoreCard(c, {
    requestId: reqNon.requestId, leaseToken: tokenNon,
    criteria: [
      { criterionId: 'clarity', disposition: 'meets', score: 8, weight: 2 },
      { criterionId: 'depth', disposition: 'exceeds', score: 9, weight: 3 },
    ],
    deterministicTotal: 85, coverage: 1.0,
  }));
  const nonCardId = recNon.cardId!;
  await asWorker(owner, (c) => transitionScoreCard(c, nonCardId, 'pending_evidence', 'evidence_invalid'));
  await asWorker(owner, (c) => transitionScoreCard(c, nonCardId, 'evidence_invalid', 'unscored'));
  const aggNon = await asOwner(owner, (c) => aggregateInterviewScores(c, ivNon));
  A('聚合：非评分态卡（unscored）→ eligible=0, overall=null, non_scoring=1',
    aggNon.eligibleCardCount === 0 && aggNon.deterministicOverall === null && aggNon.nonScoringCardCount === 1);
  A('C 端逐题读面：非评分态卡不返回',
    (await asOwner(owner, (c) => listScorableScoreCards(c, ivNon))).length === 0);

  // F3：legacy answer_evaluated.score 整数事件存在，C 端消费链仍 fail-closed 无分（跨包 e2e）。
  // 旧版「结构性排除」只测 aggregateInterviewScores 不读事件（该函数本就只读 score_card），是假绿：
  // 它不证明 C 端消费入口（generateAssessment/transcript/overview/loadSummary）真的不再读事件分数。
  // 这里改为跑真实消费链：db 读面 listScorableScoreCards → domain 消费面 deriveScoreCardAssessment，
  // 并断言 legacy 事件存在时 eligible=0、overall=null、无维度（无数值，绝不回退 legacy 分数）。
  const ivLegacy = nextIv();
  await insertInterview(owner, ivLegacy);
  await asOwner(owner, (c) => appendEvent(c, owner, ivLegacy, 'answer_evaluated', {
    questionId: 'q-legacy', stateVersion: 1, answerId: '00000000-0000-4000-8000-0000000000aa',
    answerHash: nextHash(), competency: '沟通表达', score: 95,
  }, 'answer_evaluated:q-legacy'));
  // (a) DB 读面（所有 5 个 C 端消费点现在都走这里）：legacy 事件 → 0 张可评分卡。
  const legacyCards = await asOwner(owner, (c) => listScorableScoreCards(c, ivLegacy));
  A('跨包 e2e：legacy answer_evaluated.score=95 事件 → 读面 listScorableScoreCards=0',
    legacyCards.length === 0);
  // (b) domain 消费面 fail-closed：空卡 → overall=null（无分 ≠ 0 分），不产生任何维度。
  const legacyAssess = deriveScoreCardAssessment(legacyCards.map((card) => ({
    questionId: card.questionId, competency: card.competency,
    deterministicTotal: card.deterministicTotal, status: card.status,
  })));
  A('跨包 e2e：空卡消费 → overall=null + eligibleCount=0 + dimensions=[]（无数值）',
    legacyAssess.overall === null && legacyAssess.eligibleCount === 0 && legacyAssess.dimensions.length === 0);
  // (c) 反向对照：DB 聚合读面同样 fail-closed（与消费链一致，保留既有断言）。
  const aggLegacy = await asOwner(owner, (c) => aggregateInterviewScores(c, ivLegacy));
  A('legacy answer_evaluated.score=95 事件 → 聚合 eligible=0 + overall=null',
    aggLegacy.eligibleCardCount === 0 && aggLegacy.deterministicOverall === null && aggLegacy.nonScoringCardCount === 0);

  /* ── G. RLS + append-only（原语③ + 纵深）─────────────────────────────── */
  A('跨 owner 读 score_evidence = 0 行',
    (await asOwner(otherOwner, (c) => c.query<{ n: string | number }>('SELECT count(*)::int AS n FROM score_evidence'))).rows[0]?.n === 0);
  A('app_role 无 score_evidence 写权（原始 INSERT 被拒）',
    await rejects(() => asOwner(owner, (c) => c.query(
      "INSERT INTO score_evidence(owner_user_id,card_id,criterion_id,source_answer_id,answer_version,span_offset_kind,span_start,span_end,span_digest,disposition) VALUES (current_setting('app.principal_user',true),$1,'clarity',$2,1,'utf8_byte',0,9,$3,'meets')",
      [cardId, submitted.artifactId, nextHash()]))));
  A('score_evidence append-only：UPDATE 被拒',
    await rejects(() => admin.query('UPDATE score_evidence SET disposition=$2 WHERE card_id=$1', [cardId, 'below'])));
  A('score_evidence append-only：DELETE 被拒',
    await rejects(() => admin.query('DELETE FROM score_evidence WHERE card_id=$1', [cardId])));

  await admin.end();
  console.log(failures === 0
    ? '\n✓ 评分确定性聚合（SCOR-02）DB 证明通过（本地隔离证据）'
    : `\n✗ ${failures} 个断言失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => { console.error(e); await admin.end().catch(() => undefined); process.exit(1); });

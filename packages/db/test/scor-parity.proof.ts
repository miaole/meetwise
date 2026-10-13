/**
 * G1 SCORE-S3 #42 · TS↔SQL 评分状态机/确定性总分公式对拍（对拍基准 = SQL live 真相）。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres（完整迁移至 0158 + nonce 校验）。断言面：
 *   §0 0158 守门在位：触发器/OWNER/REVOKE 四件套 live 对象面断言。
 *   §A 枚举值级对拍：TS SCORE_CARD_STATUSES(10)/SCORE_REQUEST_STATUSES(5) ↔ live DB CHECK 约束
 *      （pg_constraint 现值，非文本解析迁移文件）双向逐值（替 scor-01:242-243 长度级）。
 *   §B card 10×10 全矩阵逐值互推：TS canTransitionScoreCard(from,to) ↔ live UPDATE 实测
 *      （SAVEPOINT 包裹真实 UPDATE 施于 0109 重挂触发器，观察通/23514 后回滚保位）。
 *   §C request 5×5 单向门矩阵：live UPDATE 实测 ↔ 单向链期望表（自 domain SCORE_REQUEST_STATUSES
 *      次序导出钉定；live DB 为真相，漂移即 FAIL 逐值披露）。
 *   §D 公式值级对拍：TS computeDeterministicTotal ↔ SQL write_final(0103 副本) + adjudicate(0109 副本)
 *      两 SQL 副本互拍；round 边界对拍向量全部选「可证一致」权重（.5 精确命中向量分母必为 2 的幂
 *      ⇒ binary64 商精确；非精确向量距最近 .5 边界有理距离 ≥ 1e-6 ⇒ float64 误差 ~2.2e-14 不可能翻转），
 *      逐向量以精确整数运算机器断言其可证类，Ban 碰运气向量。
 *   §D' 拒绝路径算术可达面：TS fail 分支 ↔ SQL 拒行为对齐（reject-vs-reject，不伪造错误码；
 *      SQL 侧非法档位白名单=0103:197 亲证 · 权重面=rubric publish CHECK 0100:77 weight>0；不虚构函数调用路径）。
 *   §E #43 INSERT 守门（0158）：负测白名单外 6 态裸 INSERT 逐个 23514 拒（SQLSTATE 精确断言）；
 *      正测硬门（不可削弱）= 四处 INSERT 面逐个经真实 writer 函数行使全通（①record ②supersede
 *      ③write_final×2 目标值 ④adjudicate×2 状态值——SECURITY DEFINER 函数同样触发守门触发器）。
 *
 * 评分语义零变：本 proof 只观测，不改任何迁移/SQL；漂移检出即 FAIL 上报（TS 向 SQL 对齐须逐值披露）。
 */
import {
  createPool, asPrincipal, asScoringWorkerPrincipal, assertIsolatedTestTarget,
  submitInterviewAnswer, answerBodyHmac,
  publishQuestionRubric, issueQuestionContract, createScoreRequest,
  claimScoreRequest, markScoreRequestDispatched, fenceScoreRequest,
  recordScoreCard, transitionScoreCard, supersedeScoreCard,
  writeFinalScoreCard, adjudicateScoreCard,
  type Client, type ScoreEvidenceInput,
} from '@meetwise/db';
import {
  SCORE_CARD_STATUSES, SCORE_REQUEST_STATUSES,
  canTransitionScoreCard, computeDeterministicTotal, scoreSpanDigest,
  type DispositionBand, type ScoreCardStatus, type ScoreRequestStatus,
} from '@meetwise/domain';

// 确定性密钥（submitInterviewAnswer/answerBodyHmac 前注入；int-transcript.ts 惰性读取）。
process.env.INTERVIEW_ANSWER_ENC_KEY = 'proof_answer_enc_key_v1_16chars';
process.env.INTERVIEW_ANSWER_HMAC_SECRET = 'proof_answer_hmac_secret_16chars';

const admin = createPool();
const owner = `scor-parity-owner-${process.pid}`;
const worker = `scor-parity-worker-${process.pid}`;

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
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

// 答案 + span（UTF-8 字节）：'my-scored-answer-body-123'（25 字节）。
// 'my-scored'=0..9；'answer-body'=10..21；'body-123'=17..24（与 scor-02/03 夹具同源）。
const ANSWER = 'my-scored-answer-body-123';
const SPAN_0 = { offsetKind: 'utf8_byte' as const, start: 0, end: 9 };
const SPAN_1 = { offsetKind: 'utf8_byte' as const, start: 10, end: 21 };
const SPAN_2 = { offsetKind: 'utf8_byte' as const, start: 17, end: 24 };
const SPANS = [SPAN_0, SPAN_1, SPAN_2] as const;

/* ── round 边界可证一致性（精确整数运算，零浮点参与判定）─────────────────────────
 * 商 = num/den（num=Σ w×band×50，den=Σ w，全整数）。到最近 x.5 点的有理距离
 * = min_odd |2num − m·den| / (2den)。距=0（商恰为 x.5）⇒ 要求 den 为 2 的幂：
 * binary64 下「整数/2 的幂」精确可表，TS Math.round 与 PG round(numeric) 对正值半点
 * 同为向上（away-from-zero）舍入 ⇒ 可证一致。距>0 ⇒ 要求 ≥ 1e-6：
 * num,den < 10^4 时 float64 除法绝对误差 ≤ 100×2^-52 ≈ 2.2e-14 ≪ 1e-6 ⇒ 不可能翻转。 */
function halfPointNumeratorDistance(num: number, den: number): number {
  const twice = 2 * num;
  const near = Math.round(twice / den);
  let best = Number.MAX_SAFE_INTEGER;
  for (let m = near - 1; m <= near + 1; m++) {
    if (m % 2 === 0) continue;
    best = Math.min(best, Math.abs(twice - m * den));
  }
  return best; // 精确整数距离 |2num − m·den|；有理距离 = 该值/(2den)
}
const isPow2 = (n: number) => Number.isInteger(n) && n > 0 && (n & (n - 1)) === 0;
function roundClassIsProvable(num: number, den: number): boolean {
  if (num % den === 0) return true; // 整商：binary64 精确，无舍入边界
  const d = halfPointNumeratorDistance(num, den);
  if (d === 0) return isPow2(den); // .5 精确命中 ⇒ 必须二进制精确可表
  return d / (2 * den) >= 1e-6; // 远离边界 ⇒ float64 误差不可能翻转
}

const bandOf = (d: DispositionBand): 0 | 1 | 2 => (d === 'below' ? 0 : d === 'meets' ? 1 : 2);

// 公式向量（weights × dispositions；期望值随行注记）。全部权重=正整数（rubric CHECK 面内）。
interface FormulaVector {
  id: string;
  weights: number[];
  dispositions: DispositionBand[];
  expected: number; // 手算期望（= 精确有理数舍入值）
  target: 'practice_eligible' | 'b_review_eligible';
}
const F1: FormulaVector = { id: 'F1', weights: [2, 3], dispositions: ['meets', 'exceeds'], expected: 80, target: 'practice_eligible' };   // 400/5=80 整商
const FORMULA_VECTORS: FormulaVector[] = [
  F1,
  { id: 'F2', weights: [2, 3], dispositions: ['exceeds', 'meets'], expected: 70, target: 'b_review_eligible' },     // 350/5=70 整商（③'面 b_review_eligible）
  { id: 'F3', weights: [2, 3], dispositions: ['below', 'below'], expected: 0, target: 'practice_eligible' },         // 0/5=0 整商
  { id: 'F4', weights: [1, 3], dispositions: ['below', 'meets'], expected: 38, target: 'practice_eligible' },        // 150/4=37.5 精确半点·den=2²
  { id: 'F5', weights: [1, 3], dispositions: ['meets', 'below'], expected: 13, target: 'practice_eligible' },        // 50/4=12.5 精确半点·den=2²
  { id: 'F6', weights: [2, 2, 4], dispositions: ['exceeds', 'meets', 'meets'], expected: 63, target: 'practice_eligible' }, // 500/8=62.5 精确半点·den=2³
  { id: 'F7', weights: [1, 1, 2], dispositions: ['meets', 'below', 'exceeds'], expected: 63, target: 'practice_eligible' }, // 250/4=62.5 精确半点·den=2²
  { id: 'F8', weights: [1, 2], dispositions: ['meets', 'below'], expected: 17, target: 'practice_eligible' },        // 50/3≈16.67·距 16.5=1/6
  { id: 'F9', weights: [1, 2], dispositions: ['below', 'exceeds'], expected: 67, target: 'practice_eligible' },      // 200/3≈66.67·距 66.5=1/6
  { id: 'F10', weights: [7], dispositions: ['exceeds'], expected: 100, target: 'practice_eligible' },                // 350/7=50 整商·单分项
  { id: 'F11', weights: [7], dispositions: ['meets'], expected: 50, target: 'practice_eligible' },                   // 350/7=50 整商·单分项
  { id: 'F12', weights: [2, 4], dispositions: ['exceeds', 'meets'], expected: 67, target: 'practice_eligible' },     // 400/6≈66.67·距 66.5=1/6
];
// adjudicate（0109 副本）抽面向量：覆盖整商/精确半点/远界三类可证向量（与 write_final 同向量互拍）。
const ADJUDICATE_VECTOR_IDS = ['F1', 'F4', 'F6', 'F8'] as const;

const vectorCriteria = (v: FormulaVector) => v.weights.map((w, i) => ({ criterionId: `c${i}`, weight: w }));
const vectorItems = (v: FormulaVector) => v.weights.map((w, i) => ({
  criterionId: `c${i}`, disposition: v.dispositions[i]!, weight: w,
}));
const vectorEvidence = (v: FormulaVector, artifactId: string, version: number): ScoreEvidenceInput[] =>
  v.weights.map((_, i) => {
    const span = SPANS[i]!;
    return {
      criterionId: `c${i}`, sourceAnswerId: artifactId, answerVersion: version,
      span, spanDigest: scoreSpanDigest(ANSWER, span), disposition: v.dispositions[i]!,
    };
  });

let chainCounter = 0;
interface CardChain { iv: string; rubricId: string; requestId: string; token: string; artifactId: string; cardId: string | null; }
/** 一条请求链：rubric→contract→submission→request→claim(可选)→record(可选)。 */
async function makeCardChain(tag: string, opts: { record: boolean; claim: boolean }): Promise<CardChain> {
  const n = ++chainCounter;
  const qid = `q-par-${tag}-${n}`;
  const iv = nextIv();
  await insertInterview(owner, iv);
  const rubricId = (await asOwner(owner, (c) => publishQuestionRubric(c, {
    questionId: qid, questionVersion: 1, rubricVersion: 1, competency: '沟通表达',
    difficulty: 3, languageScope: ['zh', 'en'], questionContentHash: nextHash(),
    criteria: [{ criterionId: 'c0', weight: 2 }, { criterionId: 'c1', weight: 3 }],
  }))).rubricId;
  const issued = await asOwner(owner, (c) => issueQuestionContract(c, {
    interviewId: iv, questionId: qid, stateVersion: 2, turn: 0, questionContentHash: nextHash(),
    rubricId, form: 'mock', language: 'zh', route: 'adaptive', promptPolicyVersion: 'prompt-v1',
    measurementVersion: 'measure-v1', privacyEpoch: 5,
  }));
  const submitted = await asOwner(owner, (c) => submitInterviewAnswer(c, {
    interviewId: iv, questionId: qid, stateVersion: 2, clientSubmissionKey: `par-sub-${tag}-${n}`,
    answer: ANSWER, privacyEpoch: 5,
  }));
  const req = await asOwner(owner, (c) => createScoreRequest(c, {
    issuedContractId: issued.contractId, submissionId: submitted.submissionId, artifactId: submitted.artifactId,
    answerBodyHmac: answerBodyHmac(ANSWER), privacyEpoch: 5, operationPolicyVersion: 'op-v1',
    answerVersion: 1, idempotencyKey: `par-req-${tag}-${n}`,
  }));
  const token = nextToken();
  if (opts.claim) await asWorker(owner, (c) => claimScoreRequest(c, req.requestId, worker, token));
  let cardId: string | null = null;
  if (opts.record) {
    const card = await asWorker(owner, (c) => recordScoreCard(c, {
      requestId: req.requestId, leaseToken: token,
      criteria: [
        { criterionId: 'c0', disposition: 'meets', score: 8, weight: 2 },
        { criterionId: 'c1', disposition: 'exceeds', score: 9, weight: 3 },
      ],
      deterministicTotal: 80, coverage: 1.0,
    }));
    if (card.recorded !== true || card.cardId === null) throw new Error(`parity_walk_record_failed:${tag}`);
    cardId = card.cardId;
  }
  return { iv, rubricId, requestId: req.requestId, token, artifactId: submitted.artifactId, cardId };
}

/** 向量链：rubric(向量权重)→contract→submission→request→claim。 */
async function makeVectorChain(tag: string, v: FormulaVector): Promise<{ requestId: string; token: string; artifactId: string; version: number }> {
  const n = ++chainCounter;
  const qid = `q-par-vec-${tag}-${n}`;
  const iv = nextIv();
  await insertInterview(owner, iv);
  const rubricId = (await asOwner(owner, (c) => publishQuestionRubric(c, {
    questionId: qid, questionVersion: 1, rubricVersion: 1, competency: '沟通表达',
    difficulty: 3, languageScope: ['zh', 'en'], questionContentHash: nextHash(),
    criteria: vectorCriteria(v),
  }))).rubricId;
  const issued = await asOwner(owner, (c) => issueQuestionContract(c, {
    interviewId: iv, questionId: qid, stateVersion: 2, turn: 0, questionContentHash: nextHash(),
    rubricId, form: 'mock', language: 'zh', route: 'adaptive', promptPolicyVersion: 'prompt-v1',
    measurementVersion: 'measure-v1', privacyEpoch: 5,
  }));
  const submitted = await asOwner(owner, (c) => submitInterviewAnswer(c, {
    interviewId: iv, questionId: qid, stateVersion: 2, clientSubmissionKey: `par-vec-sub-${tag}-${n}`,
    answer: ANSWER, privacyEpoch: 5,
  }));
  const req = await asOwner(owner, (c) => createScoreRequest(c, {
    issuedContractId: issued.contractId, submissionId: submitted.submissionId, artifactId: submitted.artifactId,
    answerBodyHmac: answerBodyHmac(ANSWER), privacyEpoch: 5, operationPolicyVersion: 'op-v1',
    answerVersion: 1, idempotencyKey: `par-vec-req-${tag}-${n}`,
  }));
  const token = nextToken();
  await asWorker(owner, (c) => claimScoreRequest(c, req.requestId, worker, token));
  return { requestId: req.requestId, token, artifactId: submitted.artifactId, version: 1 };
}

/** walk：沿合法转移路径把卡推到目标态（每步真实 transitionScoreCard，walk 失败即硬错误）。 */
async function walkCard(cardId: string, path: readonly ScoreCardStatus[]): Promise<void> {
  let from: ScoreCardStatus = 'pending_evidence';
  for (const to of path) {
    const r = await asWorker(owner, (c) => transitionScoreCard(c, cardId, from, to));
    if (r.transitioned !== true) throw new Error(`parity_walk_failed:${from}->${to}`);
    from = to;
  }
}

/** live UPDATE 探针：SAVEPOINT 包裹真实 UPDATE 施于触发器，观察通/23514 后回滚保位。 */
async function probeUpdate(table: 'score_card' | 'score_request', id: string, to: string): Promise<{ ok: boolean; code?: string }> {
  const c = await admin.connect();
  try {
    await c.query('BEGIN');
    await c.query('SAVEPOINT parity_probe');
    try {
      await c.query(`UPDATE ${table} SET status=$2 WHERE id=$1`, [id, to]);
      return { ok: true };
    } catch (e) {
      const code = (e as { code?: string }).code;
      await c.query('ROLLBACK TO SAVEPOINT parity_probe');
      return { ok: false, code };
    } finally {
      await c.query('ROLLBACK');
    }
  } finally { c.release(); }
}

/** live 裸 INSERT 探针（#43 负测）：克隆真实行 + 换 status + 无卡 request_id，观察守门 23514。 */
async function probeBadInsert(donorCardId: string, emptyRequestId: string, status: string): Promise<{ ok: boolean; code?: string }> {
  const c = await admin.connect();
  try {
    await c.query('BEGIN');
    await c.query('SAVEPOINT parity_neg');
    try {
      await c.query(
        `INSERT INTO score_card(owner_user_id, interview_id, question_id, answer_id, submission_id,
           score_request_id, issued_contract_id, rubric_id, rubric_version, measurement_version,
           deterministic_total, coverage, uncertainty, status, provenance)
         SELECT owner_user_id, interview_id, question_id, answer_id, submission_id,
           $2, issued_contract_id, rubric_id, rubric_version, measurement_version,
           deterministic_total, coverage, uncertainty, $3, provenance
         FROM score_card WHERE id = $1`,
        [donorCardId, emptyRequestId, status],
      );
      return { ok: true };
    } catch (e) {
      const code = (e as { code?: string }).code;
      await c.query('ROLLBACK TO SAVEPOINT parity_neg');
      return { ok: false, code };
    } finally {
      await c.query('ROLLBACK');
    }
  } finally { c.release(); }
}

/** live CHECK 约束枚举值抽取（live DB 现值，非迁移文件文本）。 */
async function liveCheckValues(table: string): Promise<string[]> {
  const r = await admin.query<{ def: string }>(
    `SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint
      WHERE conrelid = $1::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%status%'`,
    [table],
  );
  const values = new Set<string>();
  for (const row of r.rows) {
    for (const m of row.def.matchAll(/'([a-z_]+)'/g)) values.add(m[1]!);
  }
  return [...values];
}

/** TS 侧 request 单向门期望表（自 domain SCORE_REQUEST_STATUSES 次序 + 0100 live 单向语义钉定；
 *  live DB 为真相：任何一侧漂移都会在本矩阵 FAIL 显形）。 */
function expectRequestOneway(f: ScoreRequestStatus, t: ScoreRequestStatus): boolean {
  if (f === t) return true; // 幂等
  if (f === 'scored' || f === 'fenced') return false; // 吸收态
  if (t === 'fenced') return f === 'pending' || f === 'claimed' || f === 'dispatched'; // 删除/撤权先赢
  if (f === 'pending' && t === 'claimed') return true;
  if (f === 'claimed' && (t === 'dispatched' || t === 'scored')) return true;
  if (f === 'dispatched' && t === 'scored') return true;
  return false;
}

async function main() {
  await assertIsolatedTestTarget(admin);

  /* ── §0 0158 守门在位（live DB 对象面）────────────────────────────────── */
  const trig = await admin.query<{ def: string }>(
    `SELECT pg_get_triggerdef(t.oid) AS def FROM pg_trigger t
      WHERE t.tgrelid = 'score_card'::regclass AND t.tgname = 'score_card_insert_guard' AND NOT t.tgisinternal`);
  const trigDef = trig.rows[0]?.def ?? '';
  A('§0 0158 守门触发器在位（score_card_insert_guard · BEFORE INSERT · FOR EACH ROW）',
    trigDef.includes('BEFORE INSERT') && trigDef.includes('assert_score_card_insert_initial_status') && trigDef.includes('FOR EACH ROW'));
  const fnPriv = await admin.query<{ owner: string; app_role: boolean; public: boolean }>(
    `SELECT pg_get_userbyid(p.proowner) AS owner,
            has_function_privilege('app_role', p.oid, 'EXECUTE') AS app_role,
            has_function_privilege('public', p.oid, 'EXECUTE') AS public
       FROM pg_proc p WHERE p.proname = 'assert_score_card_insert_initial_status'`);
  const fp = fnPriv.rows[0];
  A('§0 守门函数四件套同族（OWNER=scoring_definer_owner · EXECUTE 对 app_role/PUBLIC 双 REVOKE）',
    fp?.owner === 'scoring_definer_owner' && fp?.app_role === false && fp?.public === false);
  const trigCount = await admin.query<{ n: string | number }>(
    `SELECT count(*)::int AS n FROM pg_trigger
      WHERE tgrelid='score_card'::regclass AND tgname='score_card_insert_guard' AND NOT tgisinternal`);
  A('§0 守门触发器单实例（无重复挂载）', Number(trigCount.rows[0]?.n ?? 0) === 1);

  /* ── §A 枚举值级对拍（TS ↔ live DB CHECK，双向逐值）────────────────────── */
  const liveCard = await liveCheckValues('score_card');
  const liveReq = await liveCheckValues('score_request');
  A('§A card 枚举值级双向一致（TS 10 态 ↔ DB 逐值·替 scor-01 长度级）',
    SCORE_CARD_STATUSES.every((s) => liveCard.includes(s)) && liveCard.every((s) => (SCORE_CARD_STATUSES as readonly string[]).includes(s))
    && SCORE_CARD_STATUSES.length === 10 && liveCard.length === 10);
  A('§A request 枚举值级双向一致（TS 5 态 ↔ DB 逐值）',
    SCORE_REQUEST_STATUSES.every((s) => liveReq.includes(s)) && liveReq.every((s) => (SCORE_REQUEST_STATUSES as readonly string[]).includes(s))
    && SCORE_REQUEST_STATUSES.length === 5 && liveReq.length === 5);

  /* ── §B card 10×10 全矩阵逐值互推 ──────────────────────────────────────── */
  // 建 10 张卡，每态一张（全部经合法路径/writer 行使建态，无伪造直插）。
  const cardIds = {} as Record<ScoreCardStatus, string>;
  {
    const c1 = await makeCardChain('pending', { record: true, claim: true });
    cardIds['pending_evidence'] = c1.cardId!;
    const c2 = await makeCardChain('valid', { record: true, claim: true });
    await walkCard(c2.cardId!, ['evidence_valid']);
    cardIds['evidence_valid'] = c2.cardId!;
    const c3 = await makeCardChain('invalid', { record: true, claim: true });
    await walkCard(c3.cardId!, ['evidence_invalid']);
    cardIds['evidence_invalid'] = c3.cardId!;
    const c4 = await makeCardChain('unscored', { record: true, claim: true });
    await walkCard(c4.cardId!, ['evidence_invalid', 'unscored']);
    cardIds['unscored'] = c4.cardId!;
    const c5 = await makeCardChain('practice', { record: true, claim: true });
    await walkCard(c5.cardId!, ['evidence_valid', 'practice_eligible']);
    cardIds['practice_eligible'] = c5.cardId!;
    const c6 = await makeCardChain('review', { record: true, claim: true });
    await walkCard(c6.cardId!, ['evidence_valid', 'review_required']);
    cardIds['review_required'] = c6.cardId!;
    const c7 = await makeCardChain('calib', { record: true, claim: true });
    await walkCard(c7.cardId!, ['evidence_valid', 'practice_eligible', 'calibration_blocked']);
    cardIds['calibration_blocked'] = c7.cardId!;
    const c8 = await makeCardChain('brev', { record: true, claim: true });
    await walkCard(c8.cardId!, ['evidence_valid', 'review_required', 'b_review_eligible']);
    cardIds['b_review_eligible'] = c8.cardId!;
    const c9 = await makeCardChain('superseded', { record: true, claim: true });
    const sup = await asWorker(owner, (c) => supersedeScoreCard(c, c9.cardId!, {
      criteria: [
        { criterionId: 'c0', disposition: 'meets', score: 8, weight: 2 },
        { criterionId: 'c1', disposition: 'exceeds', score: 9, weight: 3 },
      ],
      deterministicTotal: 80, coverage: 1.0,
    }));
    cardIds['superseded'] = sup.supersededCardId; // 旧卡转 superseded（②面新卡 INSERT 见 §E 正测②）
    const c10 = await makeCardChain('fenced', { record: true, claim: true });
    await walkCard(c10.cardId!, ['fenced']);
    cardIds['fenced'] = c10.cardId!;
  }
  A('§B 前置：10 态卡全部就位（合法路径建态，无伪造直插）',
    SCORE_CARD_STATUSES.every((s) => typeof cardIds[s] === 'string' && cardIds[s].length > 0));

  let cardCells = 0;
  const cardMismatches: string[] = [];
  for (const from of SCORE_CARD_STATUSES) {
    for (const to of SCORE_CARD_STATUSES) {
      const ts = canTransitionScoreCard(from, to);
      const db = await probeUpdate('score_card', cardIds[from], to);
      const agree = ts === db.ok && (db.ok || db.code === '23514');
      if (!agree) cardMismatches.push(`${from}->${to}: ts=${ts} db=${db.ok ? 'pass' : `reject(${db.code ?? '?'})`}`);
      cardCells++;
    }
  }
  A(`§B card 全矩阵逐值互推一致（10×10=${cardCells} 格·每格 TS 判定=live UPDATE 行为·吸收/幂等/生命周期边全覆盖）`,
    cardMismatches.length === 0 && cardCells === 100);
  if (cardMismatches.length > 0) console.log(`  card 矩阵漂移逐值：${cardMismatches.join(' · ')}`);
  // 抽样行显值（含 SCOR-03 边与终态行，便于收据引证）：
  A('§B 抽样显值：review_required→unscored 通（SCOR-03 出边·0109 live 版 :184-185）',
    (await probeUpdate('score_card', cardIds['review_required'], 'unscored')).ok === true);
  A('§B 抽样显值：unscored→evidence_valid 拒 23514 · unscored→superseded 通（生命周期边）',
    (await probeUpdate('score_card', cardIds['unscored'], 'evidence_valid')).code === '23514'
    && (await probeUpdate('score_card', cardIds['unscored'], 'superseded')).ok === true);

  /* ── §C request 5×5 单向门矩阵 ─────────────────────────────────────────── */
  const reqIds = {} as Record<ScoreRequestStatus, string>;
  {
    const pending = await makeCardChain('reqpending', { record: false, claim: false }); // 纯 pending（不 claim）
    reqIds['pending'] = pending.requestId;
    const claimed = await makeCardChain('reqclaimed', { record: false, claim: true });
    reqIds['claimed'] = claimed.requestId;
    const dispatched = await makeCardChain('reqdisp', { record: false, claim: true });
    await asWorker(owner, (c) => markScoreRequestDispatched(c, dispatched.requestId, dispatched.token));
    reqIds['dispatched'] = dispatched.requestId;
    const scored = await makeCardChain('reqscored', { record: false, claim: true });
    {
      const w = await asWorker(owner, (c) => writeFinalScoreCard(c, {
        requestId: scored.requestId, leaseToken: scored.token,
        evidence: vectorEvidence(F1, scored.artifactId, 1),
        targetStatus: 'practice_eligible',
      }));
      if (w.recorded !== true) throw new Error('parity_reqscored_write_failed');
    }
    reqIds['scored'] = scored.requestId; // 真实 writer CAS claimed→scored
    const fenced = await makeCardChain('reqfenced', { record: false, claim: true });
    await asWorker(owner, (c) => fenceScoreRequest(c, fenced.requestId));
    reqIds['fenced'] = fenced.requestId;
  }
  let reqCells = 0;
  const reqMismatches: string[] = [];
  for (const from of SCORE_REQUEST_STATUSES) {
    for (const to of SCORE_REQUEST_STATUSES) {
      const ts = expectRequestOneway(from, to);
      const db = await probeUpdate('score_request', reqIds[from], to);
      const agree = ts === db.ok && (db.ok || db.code === '23514');
      if (!agree) reqMismatches.push(`${from}->${to}: ts=${ts} db=${db.ok ? 'pass' : `reject(${db.code ?? '?'})`}`);
      reqCells++;
    }
  }
  A(`§C request 全矩阵逐值一致（5×5=${reqCells} 格·单向门/吸收/幂等/fence 先赢全覆盖）`,
    reqMismatches.length === 0 && reqCells === 25);
  if (reqMismatches.length > 0) console.log(`  request 矩阵漂移逐值：${reqMismatches.join(' · ')}`);
  A('§C TS 枚举次序与 live 单向链交叉一致（pending→claimed→dispatched→scored→fenced 次序钉定）',
    SCORE_REQUEST_STATUSES.join(',') === 'pending,claimed,dispatched,scored,fenced');

  /* ── §D 公式值级对拍（write_final=0103 副本 · adjudicate=0109 副本 · 两副本互拍）── */
  const writeTotals = new Map<string, number>();
  const writeStatuses = new Map<string, string>();
  const adjStatuses = new Map<string, string>();
  for (const v of FORMULA_VECTORS) {
    const items = vectorItems(v);
    const num = items.reduce((acc, it) => acc + it.weight * bandOf(it.disposition) * 50, 0);
    const den = items.reduce((acc, it) => acc + it.weight, 0);
    A(`§D.${v.id} round 边界向量可证类机器断言（num=${num} den=${den} · 整商|.5 精确命中 den=2 的幂|远界≥1e-6 三类之一）`,
      roundClassIsProvable(num, den));
    const tsTotal = computeDeterministicTotal(items);
    const chain = await makeVectorChain(v.id, v);
    const w = await asWorker(owner, (c) => writeFinalScoreCard(c, {
      requestId: chain.requestId, leaseToken: chain.token,
      evidence: vectorEvidence(v, chain.artifactId, chain.version),
      targetStatus: v.target,
    }));
    const sqlTotal = w.deterministicTotal === null ? Number.NaN : Number(w.deterministicTotal);
    writeTotals.set(v.id, sqlTotal);
    writeStatuses.set(v.id, w.status ?? '');
    A(`§D.${v.id} write_final(0103 副本) ↔ TS 公式逐值一致（期望 ${v.expected}·SQL=${sqlTotal}·TS=${tsTotal}·status=${w.status}）`,
      w.recorded === true && sqlTotal === tsTotal && tsTotal === v.expected && w.status === v.target);
  }
  const cleanUncertainty = {
    evidenceCoverage: 'complete', sourceIntegrity: 'verified', voiceQuality: 'ok',
    modelDisagreement: false, languageApplicable: true, rubricDifficulty: 'mid',
    calibrationRelease: false, humanReview: 'none',
  } as const;
  for (const id of ADJUDICATE_VECTOR_IDS) {
    const v = FORMULA_VECTORS.find((x) => x.id === id);
    if (!v) throw new Error(`parity_vector_missing:${id}`);
    const chain = await makeVectorChain(`adj-${v.id}`, v);
    const tsTotal = computeDeterministicTotal(vectorItems(v));
    const a = await asWorker(owner, (c) => adjudicateScoreCard(c, {
      requestId: chain.requestId, leaseToken: chain.token,
      evidence: vectorEvidence(v, chain.artifactId, chain.version).map((e) => ({ ...e, reverified: true })),
      uncertainty: cleanUncertainty, highImpact: false,
    }));
    const sqlTotal = a.deterministicTotal === null ? Number.NaN : Number(a.deterministicTotal);
    const mirror = writeTotals.get(v.id);
    adjStatuses.set(v.id, a.status ?? '');
    A(`§D.adj-${v.id} adjudicate(0109 副本) ↔ TS ↔ write_final(0103 副本) 三方逐值互拍（SQL0109=${sqlTotal}·TS=${tsTotal}·SQL0103=${mirror}）`,
      a.recorded === true && a.status === 'practice_eligible' && sqlTotal === tsTotal && sqlTotal === mirror);
  }
  // ④' 面：adjudicate highImpact → review_required（白名单初始态·总分同式照算）。
  {
    const chain = await makeVectorChain('adj-review', F1);
    const a = await asWorker(owner, (c) => adjudicateScoreCard(c, {
      requestId: chain.requestId, leaseToken: chain.token,
      evidence: vectorEvidence(F1, chain.artifactId, chain.version).map((e) => ({ ...e, reverified: true })),
      uncertainty: cleanUncertainty, highImpact: true,
    }));
    const sqlTotal = a.deterministicTotal === null ? Number.NaN : Number(a.deterministicTotal);
    adjStatuses.set('adj-review', a.status ?? '');
    A('§D.adj-review highImpact → review_required（④\' 面初始态在白名单·总分同式 80）',
      a.recorded === true && a.status === 'review_required' && sqlTotal === 80);
  }

  /* ── §D' 拒绝路径算术可达面（TS fail ↔ SQL 拒·reject-vs-reject 不伪造错误码）── */
  {
    let tsEmptyFail = false;
    try { computeDeterministicTotal([]); } catch { tsEmptyFail = true; }
    const chain = await makeCardChain('rej-empty', { record: false, claim: true });
    const sqlReject = await asWorker(owner, async (c) => {
      try {
        await writeFinalScoreCard(c, { requestId: chain.requestId, leaseToken: chain.token, evidence: [], targetStatus: 'practice_eligible' });
        return false;
      } catch { return true; }
    });
    A('§D\' TS 空集 fail ↔ SQL write_final 空证据拒（算术可达面）', tsEmptyFail && sqlReject);
  }
  {
    let tsDupFail = false;
    try {
      computeDeterministicTotal([
        { criterionId: 'c0', disposition: 'meets', weight: 2 },
        { criterionId: 'c0', disposition: 'exceeds', weight: 2 },
      ]);
    } catch { tsDupFail = true; }
    const chain = await makeCardChain('rej-dup', { record: false, claim: true });
    const dupEvidence: ScoreEvidenceInput[] = [
      { criterionId: 'c0', sourceAnswerId: chain.artifactId, answerVersion: 1, span: SPAN_0, spanDigest: scoreSpanDigest(ANSWER, SPAN_0), disposition: 'meets' },
      { criterionId: 'c0', sourceAnswerId: chain.artifactId, answerVersion: 1, span: SPAN_1, spanDigest: scoreSpanDigest(ANSWER, SPAN_1), disposition: 'exceeds' },
    ];
    const sqlReject = await asWorker(owner, async (c) => {
      try {
        await writeFinalScoreCard(c, {
          requestId: chain.requestId, leaseToken: chain.token, evidence: dupEvidence, targetStatus: 'practice_eligible',
        });
        return false;
      } catch { return true; }
    });
    A('§D\' TS 重复 criterionId fail ↔ SQL write_final 重复证据拒（算术可达面）', tsDupFail && sqlReject);
  }
  {
    let tsBandFail = false;
    try { computeDeterministicTotal([{ criterionId: 'c0', disposition: 'invalid_band' as never, weight: 2 }]); } catch { tsBandFail = true; }
    const chain = await makeCardChain('rej-band', { record: false, claim: true });
    const sqlReject = await asWorker(owner, async (c) => {
      try {
        await writeFinalScoreCard(c, {
          requestId: chain.requestId, leaseToken: chain.token,
          evidence: [{
            criterionId: 'c0', sourceAnswerId: chain.artifactId, answerVersion: 1,
            span: SPAN_0, spanDigest: scoreSpanDigest(ANSWER, SPAN_0), disposition: 'invalid_band' as never,
          }],
          targetStatus: 'practice_eligible',
        });
        return false;
      } catch { return true; }
    });
    A('§D\' TS 非法档位 fail ↔ SQL write_final 非法 disposition 拒（0103:197 白名单·算术可达面）', tsBandFail && sqlReject);
  }
  {
    let tsWeightFail = false;
    try { computeDeterministicTotal([{ criterionId: 'c0', disposition: 'meets', weight: 0 }]); } catch { tsWeightFail = true; }
    try { computeDeterministicTotal([{ criterionId: 'c0', disposition: 'meets', weight: -1 }]); } catch { tsWeightFail = tsWeightFail && true; }
    const iv = nextIv();
    await insertInterview(owner, iv);
    const sqlReject = await asOwner(owner, async (c) => {
      try {
        await publishQuestionRubric(c, {
          questionId: 'q-par-rej-weight', questionVersion: 1, rubricVersion: 1, competency: '沟通表达',
          difficulty: 3, languageScope: ['zh', 'en'], questionContentHash: nextHash(),
          criteria: [{ criterionId: 'c0', weight: 0 }],
        });
        return false;
      } catch { return true; }
    });
    A('§D\' TS 非法权重(≤0) fail ↔ SQL rubric publish CHECK 拒（0100:77 weight>0·算术可达 SQL 面）', tsWeightFail && sqlReject);
  }

  /* ── §E #43 INSERT 守门（0158）：正测硬门（不可削弱）+ 负测 23514 ────────── */
  // 正测①②：record → pending_evidence + supersede → pending_evidence（真实函数·definer 路径）。
  {
    const chain = await makeCardChain('guard-pos', { record: true, claim: true });
    A('§E 正测① scoring_record_score_card → pending_evidence 直插全通（INSERT 面①）',
      chain.cardId !== null
      && (await admin.query<{ status: string }>('SELECT status FROM score_card WHERE id=$1', [chain.cardId])).rows[0]?.status === 'pending_evidence');
    const sup = await asWorker(owner, (c) => supersedeScoreCard(c, chain.cardId!, {
      criteria: [
        { criterionId: 'c0', disposition: 'meets', score: 8, weight: 2 },
        { criterionId: 'c1', disposition: 'exceeds', score: 9, weight: 3 },
      ],
      deterministicTotal: 80, coverage: 1.0,
    }));
    A('§E 正测② scoring_supersede_score_card → 新卡 pending_evidence 全通（INSERT 面②·旧卡 superseded）',
      (await admin.query<{ status: string }>('SELECT status FROM score_card WHERE id=$1', [sup.cardId])).rows[0]?.status === 'pending_evidence'
      && (await admin.query<{ status: string }>('SELECT status FROM score_card WHERE id=$1', [sup.supersededCardId])).rows[0]?.status === 'superseded');
  }
  // 正测③③'④④'：write_final 双目标值 + adjudicate 双状态值（§D 真实 writer 行使结果逐面点名；
  // 删除 §D 任一行使面即本组断言失据——守门正测与对拍行使互为锚）。
  A('§E 正测③ scoring_write_final_score_card → practice_eligible 直插全通（INSERT 面③·值1/2·§D.F1）',
    writeStatuses.get('F1') === 'practice_eligible');
  A('§E 正测③\' scoring_write_final_score_card → b_review_eligible 直插全通（INSERT 面③·值2/2·§D.F2）',
    writeStatuses.get('F2') === 'b_review_eligible');
  A('§E 正测④ scoring_adjudicate_score_card → practice_eligible 直插全通（INSERT 面④·值1/2·§D.adj-F1）',
    adjStatuses.get('F1') === 'practice_eligible');
  A('§E 正测④\' scoring_adjudicate_score_card → review_required 直插全通（INSERT 面④·值2/2·§D.adj-review）',
    adjStatuses.get('adj-review') === 'review_required');
  // 负测：白名单外 6 态裸 INSERT（克隆真实行 + 换态 + 无卡 request）逐个 23514（SQLSTATE 精确断言）。
  {
    const donor = await makeCardChain('guard-neg-donor', { record: true, claim: true });
    const empty = await makeCardChain('guard-neg-req', { record: false, claim: true }); // 无卡 request：排除 partial-unique 23505 干扰
    for (const bad of ['evidence_valid', 'evidence_invalid', 'unscored', 'calibration_blocked', 'superseded', 'fenced']) {
      const r = await probeBadInsert(donor.cardId!, empty.requestId, bad);
      A(`§E 负测：白名单外 ${bad} 裸 INSERT → 23514 拒（SQLSTATE 精确）`, r.ok === false && r.code === '23514');
    }
    const wl = await probeBadInsert(donor.cardId!, empty.requestId, 'review_required');
    A('§E 负测对照组：白名单内 review_required 同形直插全通（守门恰四值·不误伤）', wl.ok === true);
  }

  // 对拍计数如实宣布（REQUEST §3：全矩阵断言计数）。
  console.log(`PARITY_COUNTS card_matrix=${cardCells} request_matrix=${reqCells} formula_write_final=${FORMULA_VECTORS.length} formula_adjudicate=${ADJUDICATE_VECTOR_IDS.length + 1} formula_reject=4 enum_face=2 guard_positive=6 guard_negative=6`);

  await admin.end();
  console.log(failures === 0
    ? '\n✓ G1 SCORE-S3 #42 TS↔SQL 对拍 + #43 INSERT 守门证明通过（本地隔离证据）'
    : `\n✗ ${failures} 个断言失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => { console.error(e); await admin.end().catch(() => undefined); process.exit(1); });

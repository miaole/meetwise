/**
 * SCOR-00 消费面诚实闸。`pnpm scor-00-honesty:prove`
 *
 * 七类（能失败的断言，非空泛分类）：
 *   正  可评分 ScoreCard → 确定性练习 overall；practice hint 绑可信 identity
 *   异  空卡 / 空评估 → insufficient_evidence，overall 不是 0
 *   特  unresolved / 缺 identity → 无 hint，不展示惩罚分
 *   逃  event/report/progress 映射 B 端分一律失败
 *   并  同一 identity 重放 hint 字节等价；换 identity 映射失败
 *   复  非评分态卡不进入 overall；career 拒 null overall
 *   刁  弱绑定 q-ready、version/turn 漂移、伪造 answerId/hash → 拒
 */
import {
  deriveAssessment, aggregateScores, deriveCareerPath,
  trustedQuestionIdentity, trustedScoreIdentity, isTrustedScoreIdentity,
  practiceHintFromEvaluated, mapPracticeHintToIdentity, sameQuestionIdentity,
  refuseMappedBSideScore, insufficientEvidenceVerdict, isInsufficientEvidence,
  requireTrustedPracticeOverall, practiceOverallFromScoreCards, finiteScore,
} from '../src/index.ts';

let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const throws = (fn: () => unknown, code?: string) => {
  try { fn(); return false; }
  catch (e) { return code ? (e as { code?: string }).code === code : true; }
};

const ANSWER_ID = '11111111-1111-4111-8111-111111111111';
const ANSWER_HASH = 'a'.repeat(64);
const issued = { questionId: 'q-v1-t0-c0', stateVersion: 1, turn: 0 };
const bound = { ...issued, answerId: ANSWER_ID, answerHash: ANSWER_HASH, competency: '限流', score: 80 };

A('正：canonical identity 交叉字段一致',
  trustedQuestionIdentity(issued).questionId === 'q-v1-t0-c0' && sameQuestionIdentity(trustedQuestionIdentity(issued), issued));
A('正：ledger identity 不读 score',
  trustedScoreIdentity(bound).answerId === ANSWER_ID && !('score' in trustedScoreIdentity(bound) && false));
A('正：practice hint 绑 identity 且 role=practice_hint', (() => {
  const hint = practiceHintFromEvaluated(bound);
  return hint.role === 'practice_hint' && hint.source === 'answer_evaluated' && hint.value === 80
    && hint.questionId === 'q-v1-t0-c0' && hint.competency === '限流';
})());
A('正：可评分卡聚合 overall=90，不走 event 均分',
  practiceOverallFromScoreCards([
    { questionId: 'q-v1-t0-c0', deterministicTotal: 80, status: 'practice_eligible' },
    { questionId: 'q-v2-t1-c0', deterministicTotal: 100, status: 'b_review_eligible' },
  ]) === 90);
A('正：deriveAssessment 有卡 → overall=80',
  deriveAssessment([{ question: 'q-v1-t0-c0', competency: '限流', score: 80 }]).overall === 80);

A('异：空评估不是 0 分（抛 score_aggregate_empty）',
  throws(() => deriveAssessment([]), 'score_aggregate_empty')
  && throws(() => aggregateScores([]), 'score_aggregate_empty'));
A('异：空 ScoreCard 集 → overall=null（insufficient_evidence）',
  practiceOverallFromScoreCards([]) === null
  && isInsufficientEvidence(practiceOverallFromScoreCards([])));
A('异：insufficient verdict 是 assessment_unavailable + null，trustedBSideScore 恒 null', (() => {
  const v = insufficientEvidenceVerdict();
  return v.status === 'assessment_unavailable' && v.reason === 'insufficient_evidence'
    && v.overall === null && v.trustedBSideScore === null;
})());
A('异：career / 消费面拒 null overall，不把缺证据当 junior=0',
  throws(() => requireTrustedPracticeOverall(null), 'insufficient_evidence')
  && throws(() => requireTrustedPracticeOverall(undefined), 'insufficient_evidence')
  && throws(() => requireTrustedPracticeOverall(Number.NaN), 'insufficient_evidence'));

A('特：缺 identity 的 event 分不是 trusted，也不产 hint',
  isTrustedScoreIdentity({ score: 88 }) === false
  && throws(() => practiceHintFromEvaluated({ score: 88 }), 'score_question_identity_missing'));
A('特：score 缺 / 非整数 / 越界不是分',
  throws(() => practiceHintFromEvaluated({ ...bound, score: undefined }), 'score_value_invalid')
  && throws(() => practiceHintFromEvaluated({ ...bound, score: 80.5 }), 'score_value_invalid')
  && throws(() => practiceHintFromEvaluated({ ...bound, score: 101 }), 'score_value_invalid')
  && throws(() => finiteScore(Number.POSITIVE_INFINITY), 'score_value_invalid'));

A('逃：practice hint / event / progress / report 升格 B 端分必失败',
  throws(() => refuseMappedBSideScore({ from: 'practice_hint', value: 80 }), 'forged_mapped_score:practice_hint')
  && throws(() => refuseMappedBSideScore({ from: 'answer_evaluated', value: 80 }), 'forged_mapped_score:answer_evaluated')
  && throws(() => refuseMappedBSideScore({ from: 'progress', value: 80 }), 'forged_mapped_score:progress')
  && throws(() => refuseMappedBSideScore({ from: 'report_ready', value: 99 }), 'forged_mapped_score:report_ready')
  && throws(() => refuseMappedBSideScore({ from: 'event_average', value: 60 }), 'forged_mapped_score:event_average'));

A('并：同 identity 重放 hint 字节等价', (() => {
  const a = practiceHintFromEvaluated(bound);
  const b = practiceHintFromEvaluated({ ...bound });
  return a.value === b.value && sameQuestionIdentity(a, b) && a.answerHash === b.answerHash;
})());
A('并：hint 映射到另一题 identity → forged_mapped_score（禁止错题贴分）',
  throws(() => mapPracticeHintToIdentity(
    practiceHintFromEvaluated(bound),
    { questionId: 'q-v2-t1-c0', stateVersion: 2, turn: 1 },
  ), 'forged_mapped_score'));
A('并：hint 映射到本发题 identity 成功',
  mapPracticeHintToIdentity(practiceHintFromEvaluated(bound), issued).value === 80);

A('复：非评分态卡不进 overall（review/unscored 不是 0）',
  practiceOverallFromScoreCards([
    { questionId: 'q-v1-t0-c0', deterministicTotal: 10, status: 'unscored' },
    { questionId: 'q-v2-t1-c0', deterministicTotal: 20, status: 'review_required' },
    { questionId: 'q-v3-t2-c0', deterministicTotal: 30, status: 'evidence_invalid' },
  ]) === null);
A('复：合法 overall 才允许 career 分层，0 是真 0 不是缺证据', (() => {
  const zero = deriveCareerPath(requireTrustedPracticeOverall(0), ['限流']);
  const mid = deriveCareerPath(requireTrustedPracticeOverall(60), []);
  return zero.level === 'junior' && mid.level === 'mid';
})());

A('刁：q-ready / 裸 id 视为伪造 identity',
  throws(() => trustedQuestionIdentity({ questionId: 'q-ready', stateVersion: 3, turn: 2 }), 'score_question_identity_forged')
  && throws(() => trustedQuestionIdentity({ questionId: 'q1', stateVersion: 1, turn: 0 }), 'score_question_identity_forged'));
A('刁：canonical id 与 stateVersion/turn 漂移视为伪造映射',
  throws(() => trustedQuestionIdentity({ questionId: 'q-v1-t0-c0', stateVersion: 5, turn: 0 }), 'score_question_identity_forged')
  && throws(() => trustedQuestionIdentity({ questionId: 'q-v1-t0-c0', stateVersion: 1, turn: 3 }), 'score_question_identity_forged'));
A('刁：缺 answerId/hash/competency 不能当评分出处',
  throws(() => trustedScoreIdentity({ ...issued, competency: '限流' }), 'score_answer_identity_missing')
  && throws(() => trustedScoreIdentity({ ...issued, answerId: 'not-a-uuid', answerHash: ANSWER_HASH, competency: '限流' }), 'score_answer_identity_missing')
  && throws(() => trustedScoreIdentity({ ...issued, answerId: ANSWER_ID, answerHash: 'zz', competency: '限流' }), 'score_answer_identity_missing')
  && throws(() => trustedScoreIdentity({ ...issued, answerId: ANSWER_ID, answerHash: ANSWER_HASH, competency: '' }), 'score_answer_identity_missing'));
A('刁：isTrustedScoreIdentity 对伪造/半截 payload 为 false（消费面 fail-closed）',
  isTrustedScoreIdentity({ score: 99 }) === false
  && isTrustedScoreIdentity({ questionId: 'q-v1-t0-c0', stateVersion: 5, turn: 0, answerId: ANSWER_ID, answerHash: ANSWER_HASH, competency: '限流' }) === false
  && isTrustedScoreIdentity(bound) === true);

if (fail) {
  console.error(`FAIL scoring-honesty proof: ${fail} assertion(s)`);
  process.exit(1);
}
console.log('PASS scoring-honesty proof: 21 scenarios; releaseEvidence=false; forgedScores=domain_gate_only; httpHonesty=not_run');

/**
 * Fast, no-network proofs for the HTTP E2E helpers.
 * These check identity / hash / SSE parse contracts. They do not prove live
 * providers, scoring quality, or releaseEvidence.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash, createHmac } from 'node:crypto';
import { paidWebhookSignature } from './commerce.ts';
import {
  AI_SYSTEM_TERMINAL_REVIEWS,
  E2E_FAILURE_CLASSES,
  E2E_FAILURE_RECORD_SCHEMA,
  classifyE2EFailure,
  collectE2EReviews,
  createE2EReviewLedger,
  evaluateIsolatedHttpE2E,
  formatE2EReviewCodes,
  formatE2EFailure,
  formatE2EReview,
  parseE2EFailure,
  parseE2EFailureRecord,
  parseE2EReviewSummaryCount,
  reviewAiSystemTerminal,
  tagE2EFailure,
} from './failure.ts';
import { INTERVIEW_TERMINALS, STALE_QUESTION_ERROR, answerBody, questionIdentity } from './interview.ts';
import { parseSseBuffer } from './sse.ts';
import { uidFromToken } from './auth.ts';
import { liveOcrResumePngBase64 } from '../ocr-fixture.ts';

let passed = 0;
const test = (name: string, fn: () => void) => {
  fn();
  passed++;
  console.log(`PASS e2e-helpers: ${name}`);
};

test('question identity 拒绝缺失字段，不接受客户端伪造半截身份', () => {
  assert.throws(() => questionIdentity({}), (error) => {
    assert.deepEqual(parseE2EFailure(error), { class: 'data_or_permission', code: 'question_identity_missing' });
    return true;
  });
  assert.throws(() => questionIdentity({ questionId: 'q1', stateVersion: 1 }), /question_identity_missing/);
  assert.throws(() => questionIdentity({ questionId: 'q1', stateVersion: 1.5, turn: 0 }), /question_identity_missing/);
  assert.deepEqual(questionIdentity({ questionId: 'q-ready', stateVersion: 3, turn: 2 }), {
    questionId: 'q-ready', stateVersion: 3, turn: 2,
  });
});

test('answerBody 绑定服务端身份 + 答案哈希，不另造 questionId', () => {
  const identity = { questionId: 'q-ready', stateVersion: 3, turn: 2 };
  const body = answerBody(identity, '令牌桶');
  assert.equal(body.questionId, 'q-ready');
  assert.equal(body.stateVersion, 3);
  assert.equal(body.turn, 2);
  assert.equal(body.answer, '令牌桶');
  assert.equal(body.answerHash, createHash('sha256').update('令牌桶').digest('hex'));
  assert.match(body.answerId, /^[0-9a-f-]{36}$/i);
});

test('SSE 解析只接受 id/event/data 三行，坏 JSON 变成空对象而不是抛穿', () => {
  const events = parseSseBuffer([
    'id: 1',
    'event: question_ready',
    'data: {"questionId":"q1","stateVersion":1,"turn":0}',
    '',
    'id: 2',
    'event: report_ready',
    'data: not-json',
    '',
  ].join('\n'));
  assert.equal(events.length, 2);
  assert.equal(events[0]?.kind, 'question_ready');
  assert.equal(events[0]?.payload.questionId, 'q1');
  assert.equal(events[1]?.kind, 'report_ready');
  assert.deepEqual(events[1]?.payload, {});
});

test('终态集合包含成功报告与舱壁失败，不能只认任意非空事件', () => {
  assert.deepEqual([...INTERVIEW_TERMINALS], [
    'report_ready', 'report_unavailable', 'assessment_unavailable', 'interview_unavailable', 'error',
  ]);
  assert.equal(STALE_QUESTION_ERROR, 'stale_question');
});

test('支付 webhook HMAC 绑定 orderId:txn:paid，不能换载荷复用签名', () => {
  const secret = 'e2e-pay-secret';
  const sig = paidWebhookSignature('ord-1', 'txn-1', secret);
  assert.equal(sig, createHmac('sha256', secret).update('ord-1:txn-1:paid').digest('hex'));
  assert.notEqual(sig, paidWebhookSignature('ord-1', 'txn-2', secret));
});

test('OCR fixture 是可读 PNG 且源码含合成手机号哨兵，不是任意字节贴 image/png', () => {
  const png = Buffer.from(liveOcrResumePngBase64(), 'base64');
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.ok(png.byteLength > 200);
  assert.match(readFileSync(new URL('../ocr-fixture.ts', import.meta.url), 'utf8'), /13800138000/);
});

test('uidFromToken 读取当前 API 嵌入在第一段的 uid，缺 uid 失败', () => {
  const token = `${Buffer.from(JSON.stringify({ uid: 'user-a', alg: 'HS256' })).toString('base64')}.payload.sig`;
  assert.equal(uidFromToken(token), 'user-a');
  assert.throws(() => uidFromToken(`${Buffer.from('{}').toString('base64')}.x.y`), (error) => {
    assert.deepEqual(parseE2EFailure(error), { class: 'data_or_permission', code: 'token_uid_missing' });
    return true;
  });
});

test('failure ledger 只有 7 个封闭 class，schema 拒绝未知 class / 多余字段 / 不透明 code', () => {
  assert.deepEqual([...E2E_FAILURE_CLASSES], [
    'api', 'worker', 'db', 'provider', 'capability', 'data_or_permission', 'frontend',
  ]);
  assert.deepEqual(E2E_FAILURE_RECORD_SCHEMA.properties.class.enum, [...E2E_FAILURE_CLASSES]);
  assert.deepEqual(parseE2EFailureRecord({ class: 'worker', code: 'interview_terminal_timeout' }), {
    class: 'worker', code: 'interview_terminal_timeout',
  });
  assert.throws(() => parseE2EFailureRecord({ class: 'e2e', code: 'assertion' }), /e2e_failure_class_invalid/);
  assert.throws(() => parseE2EFailureRecord({ class: 'api', code: 'e2e_failed' }), /e2e_failure_code_opaque/);
  assert.throws(() => parseE2EFailureRecord({ class: 'api', code: 'failed' }), /e2e_failure_code_opaque/);
  assert.throws(() => parseE2EFailureRecord({ class: 'api', code: 'MODEL_API_KEY' }), /e2e_failure_code_invalid/);
  assert.throws(() => parseE2EFailureRecord({ class: 'api', code: 'assertion', token: 'secret' }), /e2e_failure_record_invalid/);
  const tagged = tagE2EFailure('frontend', 'web_not_ready');
  assert.equal(formatE2EFailure(parseE2EFailure(tagged)!), 'E2E_FAILURE class=frontend code=web_not_ready');
  assert.equal(formatE2EFailure({ class: 'capability', code: 'isolation_required' }).includes('secret'), false);
});

test('classify 识别已知 runner/helper code，拒绝只写 E2E 失败', () => {
  assert.deepEqual(classifyE2EFailure(tagE2EFailure('provider', 'live_provider_key_missing')), {
    class: 'provider', code: 'live_provider_key_missing',
  });
  assert.deepEqual(classifyE2EFailure(new Error('e2e_worker_not_ready_before_test')), {
    class: 'worker', code: 'worker_not_ready_before_test',
  });
  assert.deepEqual(classifyE2EFailure(new Error('isolated_postgres_database_not_ready')), {
    class: 'db', code: 'isolated_postgres_database_not_ready',
  });
  assert.deepEqual(classifyE2EFailure(new Error('e2e_isolation_required:use_pnpm_e2e:isolated')), {
    class: 'capability', code: 'isolation_required',
  });
  assert.deepEqual(classifyE2EFailure(tagE2EFailure('capability', 'success_with_failure_class')), {
    class: 'capability', code: 'success_with_failure_class',
  });
  assert.deepEqual(classifyE2EFailure(new Error('e2e_dependency_exited_during_test:worker_exit:1')), {
    class: 'worker', code: 'worker_exited_during_test',
  });
  assert.equal(classifyE2EFailure(new Error('E2E 失败: boom')), null);
  assert.equal(classifyE2EFailure(new Error('e2e failed')), null);
});

test('AI/system 终态必须入账，未分类终态与空 review 不能当通过', () => {
  assert.deepEqual(reviewAiSystemTerminal('report_unavailable'), { class: 'worker', code: 'report_unavailable' });
  assert.deepEqual(reviewAiSystemTerminal('report_ready'), { class: 'worker', code: 'report_ready' });
  assert.deepEqual(reviewAiSystemTerminal('assessment_unavailable'), { class: 'worker', code: 'assessment_unavailable' });
  assert.equal(reviewAiSystemTerminal('not_a_terminal'), null);
  assert.deepEqual(Object.keys(AI_SYSTEM_TERMINAL_REVIEWS).sort(), [
    'assessment_unavailable', 'diagnosis_ready', 'diagnosis_unavailable', 'error',
    'interview_unavailable', 'quiz_ready', 'quiz_unavailable', 'report_ready', 'report_unavailable',
  ]);
  const ledger = createE2EReviewLedger();
  assert.throws(() => ledger.emitSummary(), (error) => {
    assert.deepEqual(parseE2EFailure(error), { class: 'capability', code: 'opaque_pass' });
    return true;
  });
  ledger.recordTerminal('report_unavailable');
  ledger.recordTerminal('quiz_ready');
  assert.throws(() => ledger.recordTerminal('mystery_event'), (error) => {
    assert.deepEqual(parseE2EFailure(error), { class: 'worker', code: 'unclassified_ai_system_terminal' });
    return true;
  });
  const summary = ledger.emitSummary();
  assert.equal(summary, 'E2E_REVIEW_SUMMARY count=2');
  assert.equal(parseE2EReviewSummaryCount(summary), 2);
  const output = [
    formatE2EReview({ class: 'worker', code: 'report_unavailable' }),
    formatE2EReview({ class: 'provider', code: 'voice_transient' }),
    'E2E_REVIEW_SUMMARY count=2',
    'token=fixture-token-should-never-be-classified',
  ].join('\n');
  const collected = collectE2EReviews(output);
  assert.deepEqual(collected, [
    { class: 'worker', code: 'report_unavailable' },
    { class: 'provider', code: 'voice_transient' },
  ]);
  assert.equal(String(JSON.stringify(collected)).includes('fixture-token'), false);
  assert.equal(parseE2EReviewSummaryCount('E2E_REVIEW_SUMMARY count=0'), null);
  assert.equal(parseE2EReviewSummaryCount(''), null);
});

test('隔离 HTTP 绿结果必须有可复核 AI/system ledger，opaque pass 不得 accept', () => {
  const greenBody = [
    'E2E_REVIEW class=worker code=report_unavailable',
    'E2E_REVIEW class=worker code=quiz_ready',
    'E2E_REVIEW_SUMMARY count=2',
    '✓ E2E 全栈跑通(83 断言,含异常/特殊/兜底/状态机):鉴权→简历',
  ].join('\n');
  const accepted = evaluateIsolatedHttpE2E({ exitCode: 0, stdout: greenBody });
  assert.equal(accepted.accept, true);
  assert.equal(accepted.reject, null);
  assert.equal(accepted.assertionCount, 83);
  assert.deepEqual(accepted.reviewLedger.map((item) => item.code), ['report_unavailable', 'quiz_ready']);
  assert.equal(formatE2EReviewCodes(accepted.reviewLedger), 'E2E_REVIEW_CODES codes=report_unavailable,quiz_ready');
  const opaque = evaluateIsolatedHttpE2E({
    exitCode: 0,
    stdout: '✓ E2E 全栈跑通(83 断言,含异常/特殊/兜底/状态机):鉴权→简历',
  });
  assert.equal(opaque.accept, false);
  assert.deepEqual(opaque.reject, { class: 'capability', code: 'opaque_pass' });
  const noSummary = evaluateIsolatedHttpE2E({
    exitCode: 0,
    stdout: 'E2E_REVIEW class=worker code=report_unavailable\n✓ E2E 全栈跑通(1 断言,x)',
  });
  assert.deepEqual(noSummary.reject, { class: 'capability', code: 'opaque_pass' });
  const mismatch = evaluateIsolatedHttpE2E({
    exitCode: 0,
    stdout: 'E2E_REVIEW class=worker code=report_unavailable\nE2E_REVIEW_SUMMARY count=2\n✓ E2E 全栈跑通(1 断言,x)',
  });
  assert.deepEqual(mismatch.reject, { class: 'capability', code: 'review_summary_mismatch' });
  const mixed = evaluateIsolatedHttpE2E({
    exitCode: 0,
    stdout: 'E2E_FAILURE class=api code=assertion\nE2E_REVIEW class=worker code=report_unavailable\nE2E_REVIEW_SUMMARY count=1\n✓ E2E 全栈跑通(1 断言,x)',
  });
  assert.deepEqual(mixed.reject, { class: 'capability', code: 'success_with_failure_class' });
  const noAssert = evaluateIsolatedHttpE2E({
    exitCode: 0,
    stdout: 'E2E_REVIEW class=worker code=report_unavailable\nE2E_REVIEW_SUMMARY count=1',
  });
  assert.deepEqual(noAssert.reject, { class: 'capability', code: 'success_without_assertion_summary' });
  const failed = evaluateIsolatedHttpE2E({
    exitCode: 1,
    stdout: 'E2E_REVIEW class=worker code=report_unavailable\nE2E_FAILURE class=worker code=assertion',
  });
  assert.equal(failed.accept, false);
  assert.equal(failed.reject, null);
  assert.equal(failed.failureClass, 'worker');
  assert.equal(failed.reviewLedger.length, 1);
});

console.log(`PASS e2e-helpers proof: ${passed} scenarios; releaseEvidence=false`);

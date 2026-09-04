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
  INTERVIEW_TERMINALS, STALE_QUESTION_ERROR, answerBody, attributableAsk, attributableConclude,
  inspectInterviewProvenance, practiceHintFromEvaluated, questionIdentity, unscoredReason,
} from './interview.ts';
import { parseSseBuffer, payloadHasNumericScore, rejectForgedProgressScores } from './sse.ts';
import { uidFromToken } from './auth.ts';
import { liveOcrResumePngBase64 } from '../ocr-fixture.ts';

let passed = 0;
const test = (name: string, fn: () => void) => {
  fn();
  passed++;
  console.log(`PASS e2e-helpers: ${name}`);
};

test('question identity 拒绝缺失字段，不接受客户端伪造半截身份', () => {
  assert.throws(() => questionIdentity({}), /e2e_question_identity_missing/);
  assert.throws(() => questionIdentity({ questionId: 'q-v1-t0-c0', stateVersion: 1 }), /e2e_question_identity_missing/);
  assert.throws(() => questionIdentity({ questionId: 'q-v1-t0-c0', stateVersion: 1.5, turn: 0 }), /e2e_question_identity_missing/);
  assert.throws(() => questionIdentity({ questionId: 'q-v1-t0-c0', stateVersion: 1, turn: -1 }), /e2e_question_identity_missing/);
  assert.deepEqual(questionIdentity({ questionId: 'q-v3-t2-c0', stateVersion: 3, turn: 2 }), {
    questionId: 'q-v3-t2-c0', stateVersion: 3, turn: 2,
  });
});

test('question identity 拒绝非规范 id 与内嵌字段漂移（伪造/弱绑定）', () => {
  assert.throws(() => questionIdentity({ questionId: 'q-ready', stateVersion: 3, turn: 2 }), /e2e_question_identity_forged/);
  assert.throws(() => questionIdentity({ questionId: 'q1', stateVersion: 1, turn: 0 }), /e2e_question_identity_forged/);
  assert.throws(() => questionIdentity({ questionId: 'q-v1-t0-c0', stateVersion: 5, turn: 0 }), /e2e_question_identity_forged/);
  assert.throws(() => questionIdentity({ questionId: 'q-v1-t0-c0', stateVersion: 1, turn: 3 }), /e2e_question_identity_forged/);
  assert.deepEqual(questionIdentity({ questionId: 'q-v12-t9-c1', stateVersion: 12, turn: 9 }), {
    questionId: 'q-v12-t9-c1', stateVersion: 12, turn: 9,
  });
});

test('answerBody 绑定服务端身份 + 答案哈希，不另造 questionId', () => {
  const identity = { questionId: 'q-v3-t2-c0', stateVersion: 3, turn: 2 };
  const body = answerBody(identity, '令牌桶');
  assert.equal(body.questionId, 'q-v3-t2-c0');
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
    'report_ready', 'report_unavailable', 'assessment_unavailable', 'interview_unavailable',
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
  assert.throws(() => uidFromToken(`${Buffer.from('{}').toString('base64')}.x.y`), /e2e_token_uid_missing/);
});

test('progress 不得携带 numeric score/overall，否则视为伪造分数', () => {
  assert.equal(payloadHasNumericScore({ stage: 'generating' }), false);
  assert.equal(payloadHasNumericScore({ score: 80 }), true);
  rejectForgedProgressScores([{ seq: 1, kind: 'progress', payload: { stage: 'generating' } }]);
  assert.throws(
    () => rejectForgedProgressScores([{ seq: 1, kind: 'progress', payload: { score: 80 } }]),
    /e2e_forged_progress_score/,
  );
  assert.throws(
    () => rejectForgedProgressScores([{ seq: 1, kind: 'progress', payload: { overall: 90 } }]),
    /e2e_forged_progress_score/,
  );
});

test('answer_evaluated.score 只作 practice_hint，缺身份则失败，不升格 B 端分', () => {
  assert.throws(() => practiceHintFromEvaluated({ score: 88 }), /e2e_question_identity_missing/);
  const hint = practiceHintFromEvaluated({
    questionId: 'q-v1-t0-c0', stateVersion: 1, turn: 0, score: 88,
  });
  assert.equal(hint.role, 'practice_hint');
  assert.equal(hint.source, 'answer_evaluated');
  assert.equal(hint.value, 88);
  assert.equal(hint.questionId, 'q-v1-t0-c0');
});

test('conclude/probe 只接受服务端枚举；缺出处不发明，伪造 reason/mode 失败', () => {
  assert.equal(attributableAsk({ competency: '并发' }), null);
  assert.deepEqual(attributableAsk({ mode: 'probe', competency: '并发' }), {
    kind: 'ask', mode: 'probe', competency: '并发', source: 'server_payload',
  });
  assert.throws(() => attributableAsk({ mode: 'deeper', competency: '并发' }), /e2e_ask_attribution_forged/);
  assert.throws(() => attributableAsk({ mode: 'probe' }), /e2e_ask_attribution_missing/);
  assert.equal(attributableConclude({ kind: 'assessment_unavailable', payload: { reason: 'no_eligible_scored_answer' } }), null);
  assert.deepEqual(attributableConclude({ kind: 'conclude', payload: { reason: 'all_resolved' } }), {
    kind: 'conclude', reason: 'all_resolved', source: 'server_payload',
  });
  assert.deepEqual(attributableConclude({ kind: 'progress', payload: { route: 'conclude', concludeReason: 'budget_exhausted' } }), {
    kind: 'conclude', reason: 'budget_exhausted', source: 'server_payload',
  });
  assert.throws(
    () => attributableConclude({ kind: 'conclude', payload: { reason: 'timeout' } }),
    /e2e_conclude_attribution_forged/,
  );
  assert.throws(
    () => attributableConclude({ kind: 'conclude', payload: {} }),
    /e2e_conclude_attribution_missing/,
  );
});

test('inspectInterviewProvenance 聚合服务端出处，拒绝 progress 伪造分与无身份评分', () => {
  const ok = inspectInterviewProvenance([
    { seq: 1, kind: 'progress', payload: { stage: 'generating' } },
    { seq: 2, kind: 'question_ready', payload: { questionId: 'q-v1-t0-c0', stateVersion: 1, turn: 0, competency: '限流', mode: 'pivot' } },
    { seq: 3, kind: 'answer_evaluated', payload: { questionId: 'q-v1-t0-c0', stateVersion: 1, turn: 0, score: 70 } },
    { seq: 4, kind: 'answer_unscored', payload: { questionId: 'q-v2-t1-c0', stateVersion: 2, turn: 1, reason: 'evaluation_unavailable' } },
    { seq: 5, kind: 'report_unavailable', payload: { reason: 'max_attempts_exceeded' } },
  ]);
  assert.equal(ok.practiceHints.length, 1);
  assert.equal(ok.practiceHints[0]?.role, 'practice_hint');
  assert.deepEqual(ok.attributions, [{ kind: 'ask', mode: 'pivot', competency: '限流', source: 'server_payload' }]);
  assert.deepEqual(unscoredReason({ questionId: 'q-v2-t1-c0', stateVersion: 2, turn: 1, reason: 'evaluation_unavailable' }).source, 'server_payload');
  assert.throws(
    () => inspectInterviewProvenance([{ seq: 1, kind: 'progress', payload: { score: 99 } }]),
    /e2e_forged_progress_score/,
  );
  assert.throws(
    () => inspectInterviewProvenance([{ seq: 1, kind: 'answer_evaluated', payload: { score: 99 } }]),
    /e2e_question_identity_missing/,
  );
});

console.log(`PASS e2e-helpers proof: ${passed} scenarios; releaseEvidence=false`);

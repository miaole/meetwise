/**
 * Fast, no-network proofs for the HTTP E2E helpers.
 * These check identity / hash / SSE parse contracts. They do not prove live
 * providers, scoring quality, or releaseEvidence.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { answerBody, questionIdentity } from './interview.ts';
import { parseSseBuffer } from './sse.ts';
import { uidFromToken } from './auth.ts';

let passed = 0;
const test = (name: string, fn: () => void) => {
  fn();
  passed++;
  console.log(`PASS e2e-helpers: ${name}`);
};

test('question identity 拒绝缺失字段，不接受客户端伪造半截身份', () => {
  assert.throws(() => questionIdentity({}), /e2e_question_identity_missing/);
  assert.throws(() => questionIdentity({ questionId: 'q1', stateVersion: 1 }), /e2e_question_identity_missing/);
  assert.throws(() => questionIdentity({ questionId: 'q1', stateVersion: 1.5, turn: 0 }), /e2e_question_identity_missing/);
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

test('uidFromToken 读取当前 API 嵌入在第一段的 uid，缺 uid 失败', () => {
  const token = `${Buffer.from(JSON.stringify({ uid: 'user-a', alg: 'HS256' })).toString('base64')}.payload.sig`;
  assert.equal(uidFromToken(token), 'user-a');
  assert.throws(() => uidFromToken(`${Buffer.from('{}').toString('base64')}.x.y`), /e2e_token_uid_missing/);
});

console.log(`PASS e2e-helpers proof: ${passed} scenarios; releaseEvidence=false`);

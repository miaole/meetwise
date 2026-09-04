/**
 * Fast, no-network proofs for the HTTP E2E helpers.
 * These check identity / hash / SSE parse contracts. They do not prove live
 * providers, scoring quality, or releaseEvidence.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash, createHmac } from 'node:crypto';
import { isWebhookCreditResult, paidWebhookCanonical, paidWebhookSignature, PAID_WEBHOOK_EVENT, WEBHOOK_CREDIT_RESULTS } from './commerce.ts';
import { INTERVIEW_TERMINALS, STALE_QUESTION_ERROR, answerBody, questionIdentity } from './interview.ts';
import { parseSseBuffer } from './sse.ts';
import { signupOrLogin, uidFromToken } from './auth.ts';
import { liveOcrResumePngBase64 } from '../ocr-fixture.ts';

let passed = 0;
const test = async (name: string, fn: () => void | Promise<void>) => {
  await fn();
  passed++;
  console.log(`PASS e2e-helpers: ${name}`);
};

await test('signupOrLogin 拒绝空凭据，不发明令牌、不打登录接口', async () => {
  await assert.rejects(() => signupOrLogin('', 'strongpw123'), /e2e_auth_failed:status=invalid_input/);
  await assert.rejects(() => signupOrLogin('e2e@x.com', ''), /e2e_auth_failed:status=invalid_input/);
});

await test('question identity 拒绝缺失字段，不接受客户端伪造半截身份', () => {
  assert.throws(() => questionIdentity({}), /e2e_question_identity_missing/);
  assert.throws(() => questionIdentity({ questionId: 'q1', stateVersion: 1 }), /e2e_question_identity_missing/);
  assert.throws(() => questionIdentity({ questionId: 'q1', stateVersion: 1.5, turn: 0 }), /e2e_question_identity_missing/);
  assert.deepEqual(questionIdentity({ questionId: 'q-ready', stateVersion: 3, turn: 2 }), {
    questionId: 'q-ready', stateVersion: 3, turn: 2,
  });
});

await test('answerBody 绑定服务端身份 + 答案哈希，不另造 questionId', () => {
  const identity = { questionId: 'q-ready', stateVersion: 3, turn: 2 };
  const body = answerBody(identity, '令牌桶');
  assert.equal(body.questionId, 'q-ready');
  assert.equal(body.stateVersion, 3);
  assert.equal(body.turn, 2);
  assert.equal(body.answer, '令牌桶');
  assert.equal(body.answerHash, createHash('sha256').update('令牌桶').digest('hex'));
  assert.match(body.answerId, /^[0-9a-f-]{36}$/i);
});

await test('SSE 解析只接受 id/event/data 三行，坏 JSON 变成空对象而不是抛穿', () => {
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

await test('终态集合包含成功报告与舱壁失败，不能只认任意非空事件', () => {
  assert.deepEqual([...INTERVIEW_TERMINALS], [
    'report_ready', 'report_unavailable', 'assessment_unavailable', 'interview_unavailable',
  ]);
  assert.equal(STALE_QUESTION_ERROR, 'stale_question');
});

await test('支付 webhook HMAC 绑定 orderId:txn:paid，换单/换流水/换事件都不能复用签名', () => {
  const secret = 'e2e-pay-secret';
  assert.equal(PAID_WEBHOOK_EVENT, 'paid');
  assert.equal(paidWebhookCanonical('ord-1', 'txn-1'), 'ord-1:txn-1:paid');
  assert.throws(() => paidWebhookCanonical('', 'txn-1'), /e2e_webhook_canonical_missing/);
  assert.throws(() => paidWebhookCanonical('ord-1', ''), /e2e_webhook_canonical_missing/);
  const sig = paidWebhookSignature('ord-1', 'txn-1', secret);
  assert.equal(sig, createHmac('sha256', secret).update('ord-1:txn-1:paid').digest('hex'));
  assert.notEqual(sig, paidWebhookSignature('ord-1', 'txn-2', secret));
  assert.notEqual(sig, paidWebhookSignature('ord-2', 'txn-1', secret));
  assert.notEqual(sig, createHmac('sha256', secret).update('ord-1:txn-1:refunded').digest('hex'));
  assert.deepEqual([...WEBHOOK_CREDIT_RESULTS], ['credited', 'already']);
  assert.equal(isWebhookCreditResult('credited'), true);
  assert.equal(isWebhookCreditResult('already'), true);
  assert.equal(isWebhookCreditResult('conflict'), false);
  assert.equal(isWebhookCreditResult('paid'), false);
});

await test('OCR fixture 是可读 PNG 且源码含合成手机号哨兵，不是任意字节贴 image/png', () => {
  const png = Buffer.from(liveOcrResumePngBase64(), 'base64');
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.ok(png.byteLength > 200);
  assert.match(readFileSync(new URL('../ocr-fixture.ts', import.meta.url), 'utf8'), /13800138000/);
});

await test('uidFromToken 读 payload.sig 的 base64url 载荷，不把 JWT header 或空 uid 当身份', () => {
  const encode = (payload: object) => Buffer.from(JSON.stringify(payload)).toString('base64url');
  assert.equal(uidFromToken(`${encode({ uid: 'user-a', exp: 9_999_999_999, pe: 0 })}.sig`), 'user-a');
  assert.equal(uidFromToken(`${encode({ uid: 'user_id-1', exp: 1, pe: 0 })}.sig`), 'user_id-1');
  assert.throws(() => uidFromToken(''), /e2e_token_uid_missing/);
  assert.throws(() => uidFromToken(`${encode({})}.sig`), /e2e_token_uid_missing/);
  assert.throws(() => uidFromToken(`${encode({ uid: '' })}.sig`), /e2e_token_uid_missing/);
  assert.throws(() => uidFromToken(`${encode({ uid: 12 })}.sig`), /e2e_token_uid_missing/);
  assert.throws(() => uidFromToken('not-json.sig'), /e2e_token_uid_missing/);
  const jwtHeader = encode({ alg: 'HS256', typ: 'JWT' });
  assert.throws(() => uidFromToken(`${jwtHeader}.payload.sig`), /e2e_token_uid_missing/);
});

await test('auth/commerce helpers 源码走真 HTTP 边界：不发明令牌、不下发客户端价、不伪造入账', () => {
  const auth = readFileSync(new URL('./auth.ts', import.meta.url), 'utf8');
  const commerce = readFileSync(new URL('./commerce.ts', import.meta.url), 'utf8');
  const scenario = readFileSync(new URL('../full.e2e.ts', import.meta.url), 'utf8');
  assert.match(auth, /\/auth\/signup/);
  assert.match(auth, /\/auth\/login/);
  assert.match(auth, /if \(status !== 200\)/);
  assert.doesNotMatch(auth, /E2E_FAKE|skipAuth|inventedToken/);
  assert.match(auth, /base64url/);
  assert.match(commerce, /JSON\.stringify\(\{ productId \}\)/);
  assert.match(commerce, /\/commerce\/webhook\/pay\//);
  assert.match(commerce, /PAID_WEBHOOK_EVENT/);
  assert.doesNotMatch(commerce, /forceCredit|skipPayment|E2E_FAKE_PAY/);
  assert.match(scenario, /isWebhookCreditResult\(paid\.body\.result\)/);
  assert.match(scenario, /postPayWebhook\(ord\.orderId, 't', 'deadbeef'\)/);
  assert.match(scenario, /postPayWebhook\('nope', 't', paidWebhookSignature\('nope', 't'\)\)/);
  assert.match(scenario, /badSig\.response\.status === 403/);
  assert.match(scenario, /unknownOrder\.response\.status === 404/);
});

console.log(`PASS e2e-helpers proof: ${passed} scenarios; releaseEvidence=false`);

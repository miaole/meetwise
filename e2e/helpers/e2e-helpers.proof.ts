/**
 * Fast, no-network proofs for the HTTP E2E helpers.
 * These check identity / hash / SSE parse contracts. They do not prove live
 * providers, scoring quality, or releaseEvidence.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash, createHmac } from 'node:crypto';
import { createOrder, entitlement, isWebhookCreditResult, paidWebhookCanonical, paidWebhookSignature, payWebhook, postPayWebhook, PAID_WEBHOOK_EVENT, WEBHOOK_CREDIT_RESULTS } from './commerce.ts';
import { INTERVIEW_TERMINALS, STALE_QUESTION_ERROR, answerBody, questionIdentity } from './interview.ts';
import { parseSseBuffer } from './sse.ts';
import { signupOrLogin, uidFromToken } from './auth.ts';
import { liveOcrResumePngBase64 } from '../ocr-fixture.ts';
import { signToken, verifyTokenFull } from '../../packages/domain/src/auth.ts';

let passed = 0;
const test = async (name: string, fn: () => void | Promise<void>) => {
  await fn();
  passed++;
  console.log(`PASS e2e-helpers: ${name}`);
};

const encodePayload = (payload: object) => Buffer.from(JSON.stringify(payload)).toString('base64url');
/** Unsigned dummy — negative cases only. Positive uid decode must use signToken. */
const unsignedToken = (uid: string) => `${encodePayload({ uid, exp: 9_999_999_999, pe: 0 })}.sig`;
const PROOF_AUTH_SECRET = 'e2e-auth-proof-secret';
const PROOF_NOW = 1_700_000_000;
const issuedToken = (uid: string, pwdEpoch = 0) => signToken(uid, PROOF_AUTH_SECRET, 3600, PROOF_NOW, pwdEpoch);

type FetchCall = { method: string; url: string; body: any; headers: Record<string, string> };

function headerRecord(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  if (Array.isArray(headers)) return Object.fromEntries(headers.map(([k, v]) => [k, String(v)]));
  return Object.fromEntries(Object.entries(headers).map(([k, v]) => [k, String(v)]));
}

function jsonRes(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

async function withMockFetch(
  handler: (call: FetchCall) => Response | Promise<Response>,
  fn: () => Promise<void>,
): Promise<void> {
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    let body: any;
    if (init?.body !== undefined) {
      try { body = JSON.parse(String(init.body)); } catch { body = String(init.body); }
    }
    return handler({
      method: String(init?.method ?? 'GET').toUpperCase(),
      url: String(input),
      body,
      headers: headerRecord(init?.headers),
    });
  }) as typeof fetch;
  try {
    await fn();
  } finally {
    globalThis.fetch = original;
  }
}

async function main() {
await test('signupOrLogin 空凭据只做输入守卫，不发明令牌', async () => {
  let fetches = 0;
  await withMockFetch(async () => {
    fetches++;
    return jsonRes(200, { token: issuedToken('should-not-run') });
  }, async () => {
    await assert.rejects(() => signupOrLogin('', 'strongpw123'), /e2e_auth_failed:status=invalid_input/);
    await assert.rejects(() => signupOrLogin('e2e@x.com', ''), /e2e_auth_failed:status=invalid_input/);
  });
  assert.equal(fetches, 0);
});

await test('signup 200 无 token 不回落到 login，也不用 body.userId', async () => {
  const calls: FetchCall[] = [];
  await withMockFetch(async (call) => {
    calls.push(call);
    return jsonRes(200, { userId: 'forged-user', token: '' });
  }, async () => {
    await assert.rejects(() => signupOrLogin('e2e@x.com', 'strongpw123'), /e2e_auth_failed:status=200/);
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.method, 'POST');
  assert.match(calls[0]?.url ?? '', /\/auth\/signup$/);
  assert.deepEqual(calls[0]?.body, { email: 'e2e@x.com', password: 'strongpw123' });
});

await test('signup 非 200 才 login，令牌只取自 login JSON', async () => {
  const token = issuedToken('user-login', 3);
  const calls: FetchCall[] = [];
  await withMockFetch(async (call) => {
    calls.push(call);
    if (call.url.endsWith('/auth/signup')) return jsonRes(409, { error: 'email_taken', token: issuedToken('from-signup') });
    return jsonRes(200, { token });
  }, async () => {
    const session = await signupOrLogin('e2e@x.com', 'strongpw123');
    assert.equal(session.response.status, 200);
    assert.equal(session.status, 200);
    assert.equal(session.token, token);
    assert.equal(uidFromToken(session.token), 'user-login');
  });
  assert.equal(calls.length, 2);
  assert.equal(calls[0]?.method, 'POST');
  assert.match(calls[0]?.url ?? '', /\/auth\/signup$/);
  assert.deepEqual(calls[0]?.body, { email: 'e2e@x.com', password: 'strongpw123' });
  assert.equal(calls[1]?.method, 'POST');
  assert.match(calls[1]?.url ?? '', /\/auth\/login$/);
  assert.deepEqual(calls[1]?.body, { email: 'e2e@x.com', password: 'strongpw123' });
  assert.equal('role' in (calls[1]?.body ?? {}), false);
});

await test('signup 200 非空 token 原样返回，零次 login，role 只在注册体', async () => {
  const token = issuedToken('user-signup');
  const calls: FetchCall[] = [];
  await withMockFetch(async (call) => {
    calls.push(call);
    return jsonRes(200, { token, userId: 'ignore-me' });
  }, async () => {
    const session = await signupOrLogin('e2e@x.com', 'strongpw123', 'recruiter');
    assert.equal(session.response.status, 200);
    assert.equal(session.status, 200);
    assert.equal(session.token, token);
    assert.equal(uidFromToken(session.token), 'user-signup');
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.method, 'POST');
  assert.match(calls[0]?.url ?? '', /\/auth\/signup$/);
  assert.deepEqual(calls[0]?.body, { email: 'e2e@x.com', password: 'strongpw123', role: 'recruiter' });
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

await test('uidFromToken 正例走 domain signToken，三节 JWT 即使 header/payload 都带 uid 也不认', () => {
  const token = issuedToken('user-a', 2);
  assert.equal(verifyTokenFull(token, PROOF_AUTH_SECRET, PROOF_NOW)?.uid, 'user-a');
  assert.equal(verifyTokenFull(token, PROOF_AUTH_SECRET, PROOF_NOW)?.pwdEpoch, 2);
  assert.equal(uidFromToken(token), 'user-a');
  assert.equal(uidFromToken(issuedToken('user_id-1')), 'user_id-1');
  assert.throws(() => uidFromToken(''), /e2e_token_uid_missing/);
  assert.throws(() => uidFromToken(unsignedToken('')), /e2e_token_uid_missing/);
  assert.throws(() => uidFromToken(`${encodePayload({})}.sig`), /e2e_token_uid_missing/);
  assert.throws(() => uidFromToken(`${encodePayload({ uid: 12 })}.sig`), /e2e_token_uid_missing/);
  assert.throws(() => uidFromToken('not-json.sig'), /e2e_token_uid_missing/);
  const forgedJwt = `${encodePayload({ uid: 'evil', alg: 'HS256' })}.${encodePayload({ uid: 'victim', exp: PROOF_NOW + 3600, pe: 0 })}.sig`;
  assert.throws(() => uidFromToken(forgedJwt), /e2e_token_uid_missing/);
});

await test('createOrder/payWebhook/entitlement 走对应 path+method，HMAC 用独立 createHmac 核对，错签不代签', async () => {
  const secret = 'e2e-pay-secret';
  const expectedPaidSig = createHmac('sha256', secret).update('ord-1:txn-1:paid').digest('hex');
  const seen: FetchCall[] = [];
  await withMockFetch(async (call) => {
    seen.push(call);
    if (call.url.endsWith('/commerce/orders')) {
      return jsonRes(200, { orderId: 'ord-1', amountCents: 9900, status: 'created' });
    }
    if (call.url.endsWith('/commerce/webhook/pay/ord-1')) {
      return jsonRes(200, { result: 'credited' });
    }
    if (call.url.endsWith('/commerce/entitlement')) {
      return jsonRes(200, { availableUnits: 4 });
    }
    throw new Error(`unexpected_fetch:${call.method}:${call.url}`);
  }, async () => {
    const ordered = await createOrder({ authorization: 'Bearer t' }, 'pack_10', 'idem-1');
    assert.equal(ordered.response.status, 200);
    assert.equal(ordered.body.orderId, 'ord-1');
    const paid = await payWebhook('ord-1', 'txn-1', secret);
    assert.equal(paid.response.status, 200);
    assert.equal(isWebhookCreditResult(paid.body.result), true);
    await postPayWebhook('ord-1', 't', 'deadbeef');
    const units = await entitlement({ authorization: 'Bearer t' });
    assert.equal(units.availableUnits, 4);
  });
  assert.equal(seen.length, 4);
  assert.equal(seen[0]?.method, 'POST');
  assert.match(seen[0]?.url ?? '', /\/commerce\/orders$/);
  assert.equal(seen[0]?.headers.authorization, 'Bearer t');
  assert.equal(seen[0]?.headers['idempotency-key'], 'idem-1');
  assert.deepEqual(seen[0]?.body, { productId: 'pack_10' });
  assert.equal(seen[1]?.method, 'POST');
  assert.match(seen[1]?.url ?? '', /\/commerce\/webhook\/pay\/ord-1$/);
  assert.equal(seen[1]?.body.providerTxn, 'txn-1');
  assert.equal(seen[1]?.body.sig, expectedPaidSig);
  assert.notEqual(seen[1]?.body.sig, createHmac('sha256', secret).update('ord-1:txn-1:refunded').digest('hex'));
  assert.equal(seen[2]?.method, 'POST');
  assert.equal(seen[2]?.body.sig, 'deadbeef');
  assert.notEqual(seen[2]?.body.sig, expectedPaidSig);
  assert.equal(seen[3]?.method, 'GET');
  assert.match(seen[3]?.url ?? '', /\/commerce\/entitlement$/);
  assert.equal(seen[3]?.headers.authorization, 'Bearer t');
  assert.equal(seen[3]?.body, undefined);
});

await test('full.e2e 源码锁：入账必须 200 且 credited|already，错签 403，未知单 404', () => {
  const scenario = readFileSync(new URL('../full.e2e.ts', import.meta.url), 'utf8');
  assert.match(scenario, /session\.response\.status === 200 && session\.status === 200 && typeof session\.token === 'string' && session\.token\.length > 0/);
  assert.match(scenario, /ordered\.response\.status === 200 && typeof ordered\.body\.orderId === 'string'/);
  assert.match(scenario, /paid\.response\.status === 200 && isWebhookCreditResult\(paid\.body\.result\)/);
  assert.match(scenario, /\(units\.availableUnits \?\? 0\) >= 1/);
  assert.match(scenario, /postPayWebhook\(ord\.orderId, 't', 'deadbeef'\)/);
  assert.match(scenario, /postPayWebhook\('nope', 't', paidWebhookSignature\('nope', 't'\)\)/);
  assert.match(scenario, /badSig\.response\.status === 403/);
  assert.match(scenario, /unknownOrder\.response\.status === 404/);
});

console.log(`PASS e2e-helpers proof: ${passed} scenarios; releaseEvidence=false`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

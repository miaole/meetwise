/**
 * Fast, no-network proofs for the HTTP E2E helpers.
 * These check identity / hash / SSE parse contracts. They do not prove live
 * providers, scoring quality, or releaseEvidence.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash, createHmac } from 'node:crypto';
import { createOrder, entitlement, isWebhookCreditResult, paidWebhookCanonical, paidWebhookSignature, payWebhook, postPayWebhook, PAID_WEBHOOK_EVENT, WEBHOOK_CREDIT_RESULTS } from './commerce.ts';
import {
  INTERVIEW_TERMINALS, STALE_QUESTION_ERROR, answerBody, attributableAsk, attributableConclude,
  inspectInterviewProvenance, practiceHintFromEvaluated, questionIdentity, questionIdentityFromEvent,
  refuseBSideScoreFromInterviewStream, reviewInterviewProvenance, unscoredReason,
} from './interview.ts';
import { parseSseBuffer, payloadHasNumericScore, rejectForgedProgressScores } from './sse.ts';
import { signupOrLogin, uidFromToken } from './auth.ts';
import { classifyFailure } from './classify-failure.ts';
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
  assert.throws(() => questionIdentity({ questionId: 'q-v1-t0-c0', stateVersion: 1 }), /e2e_question_identity_missing/);
  assert.throws(() => questionIdentity({ questionId: 'q-v1-t0-c0', stateVersion: 1.5, turn: 0 }), /e2e_question_identity_missing/);
  assert.throws(() => questionIdentity({ questionId: 'q-v1-t0-c0', stateVersion: 1, turn: -1 }), /e2e_question_identity_missing/);
  assert.deepEqual(questionIdentity({ questionId: 'q-v3-t2-c0', stateVersion: 3, turn: 2 }), {
    questionId: 'q-v3-t2-c0', stateVersion: 3, turn: 2,
  });
});

await test('question identity 拒绝非规范 id 与内嵌字段漂移（伪造/弱绑定）', () => {
  assert.throws(() => questionIdentity({ questionId: 'q-ready', stateVersion: 3, turn: 2 }), /e2e_question_identity_forged/);
  assert.throws(() => questionIdentity({ questionId: 'q1', stateVersion: 1, turn: 0 }), /e2e_question_identity_forged/);
  assert.throws(() => questionIdentity({ questionId: 'q-v1-t0-c0', stateVersion: 5, turn: 0 }), /e2e_question_identity_forged/);
  assert.throws(() => questionIdentity({ questionId: 'q-v1-t0-c0', stateVersion: 1, turn: 3 }), /e2e_question_identity_forged/);
  assert.deepEqual(questionIdentity({ questionId: 'q-v12-t9-c1', stateVersion: 12, turn: 9 }), {
    questionId: 'q-v12-t9-c1', stateVersion: 12, turn: 9,
  });
});

await test('answerBody 绑定服务端身份 + 答案哈希，不另造 questionId', () => {
  const identity = { questionId: 'q-v3-t2-c0', stateVersion: 3, turn: 2 };
  const body = answerBody(identity, '令牌桶');
  assert.equal(body.questionId, 'q-v3-t2-c0');
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

await test('resume helper 只封装同意/文本/图片/画像，不打日志、不引用 apps/web', () => {
  const src = readFileSync(new URL('./resume.ts', import.meta.url), 'utf8');
  assert.match(src, /privacy\/consent/);
  assert.match(src, /\/resume\/file/);
  assert.match(src, /\/resume\/\$\{resumeId\}\/profile/);
  assert.equal(src.includes('console.'), false);
  assert.equal(src.includes('apps/web'), false);
});

await test('失败分类区分缺 Key、假服务、越权、供应商，未知 5xx 与裸 403 不洗成 BLOCKED', () => {
  assert.equal(classifyFailure({ runnerCode: 'live_provider_key_missing:MODEL_API_KEY' }), 'BLOCKED_LIVE_KEY');
  assert.equal(classifyFailure({ error: 'fake_service_mode_forbidden:VOICE_FAKE' }), 'FAIL_CAPABILITY');
  assert.equal(classifyFailure({ error: 'e2e_isolation_required:use_pnpm_e2e:isolated' }), 'FAIL_CAPABILITY');
  assert.equal(classifyFailure({ error: 'image_ocr_unavailable' }), 'FAIL_CAPABILITY');
  assert.equal(classifyFailure({ status: 401 }), 'BLOCKED_DATA_OR_PERMISSION');
  assert.equal(classifyFailure({ status: 402 }), 'BLOCKED_DATA_OR_PERMISSION');
  assert.equal(classifyFailure({ status: 403, error: 'RecruiterGuard' }), 'BLOCKED_DATA_OR_PERMISSION');
  assert.equal(classifyFailure({ status: 403 }), 'FAIL_API');
  assert.equal(classifyFailure({ status: 429 }), 'FAIL_PROVIDER');
  assert.equal(classifyFailure({ status: 500 }), 'FAIL_API');
  assert.equal(classifyFailure({ error: 'providerTxn missing' }), 'FAIL_API');
});

await test('progress 不得携带 numeric score/overall，否则视为伪造分数', () => {
  assert.equal(payloadHasNumericScore({ stage: 'generating' }), false);
  assert.equal(payloadHasNumericScore({ question: '限流到 80' }), false);
  assert.equal(payloadHasNumericScore({ score: 80 }), true);
  assert.equal(payloadHasNumericScore({ score: '80' }), true);
  assert.equal(payloadHasNumericScore({ overallScore: 90 }), true);
  assert.equal(payloadHasNumericScore({ metrics: { score: 80 } }), true);
  rejectForgedProgressScores([{ seq: 1, kind: 'progress', payload: { stage: 'generating' } }]);
  assert.throws(
    () => rejectForgedProgressScores([{ seq: 1, kind: 'progress', payload: { score: 80 } }]),
    /e2e_forged_progress_score/,
  );
  assert.throws(
    () => rejectForgedProgressScores([{ seq: 1, kind: 'progress', payload: { overall: '90' } }]),
    /e2e_forged_progress_score/,
  );
  assert.throws(
    () => rejectForgedProgressScores([{
      seq: 1, kind: 'question_ready',
      payload: { questionId: 'q-v1-t0-c0', stateVersion: 1, turn: 0, score: 99 },
    }]),
    /e2e_forged_score/,
  );
});

await test('answer_evaluated.score 只作 practice_hint，缺身份则失败，不升格 B 端分', () => {
  assert.throws(() => practiceHintFromEvaluated({ score: 88 }), /e2e_question_identity_missing/);
  const hint = practiceHintFromEvaluated({
    questionId: 'q-v1-t0-c0', stateVersion: 1, turn: 0, score: 88,
  });
  assert.equal(hint.role, 'practice_hint');
  assert.equal(hint.source, 'answer_evaluated');
  assert.equal(hint.value, 88);
  assert.equal(hint.questionId, 'q-v1-t0-c0');
});

await test('conclude/probe 只接受服务端枚举；缺出处不发明，伪造 reason/mode 失败', () => {
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
  assert.equal(attributableConclude({ kind: 'progress', payload: { route: 'conclude', concludeReason: 'budget_exhausted' } }), null);
  assert.equal(attributableConclude({ kind: 'report_ready', payload: { concludeReason: 'all_resolved', overall: 99 } }), null);
  assert.throws(
    () => attributableConclude({ kind: 'conclude', payload: { reason: 'timeout' } }),
    /e2e_conclude_attribution_forged/,
  );
  assert.throws(
    () => attributableConclude({ kind: 'conclude', payload: {} }),
    /e2e_conclude_attribution_missing/,
  );
});

await test('inspectInterviewProvenance 聚合服务端出处，拒绝 progress 伪造分与无身份评分', () => {
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

await test('P0 review: 不信任 AI 题面/分数/progress；progress 不能当 identity 或 conclude', () => {
  assert.throws(
    () => questionIdentityFromEvent({ kind: 'progress', payload: { questionId: 'q-v1-t0-c0', stateVersion: 1, turn: 0 } }),
    /e2e_progress_not_identity/,
  );
  assert.throws(
    () => reviewInterviewProvenance([{ seq: 1, kind: 'progress', payload: { questionId: 'q-v1-t0-c0' } }]),
    /e2e_progress_not_identity/,
  );
  const reviewed = reviewInterviewProvenance([
    { seq: 1, kind: 'progress', payload: { stage: 'generating' } },
    { seq: 2, kind: 'question_ready', payload: { questionId: 'q-v1-t0-c0', stateVersion: 1, turn: 0, question: '请说明限流', competency: '限流' } },
    { seq: 3, kind: 'answer_evaluated', payload: { questionId: 'q-v1-t0-c0', stateVersion: 1, turn: 0, score: 88 } },
    { seq: 4, kind: 'report_ready', payload: { overall: 99 } },
  ]);
  assert.equal(reviewed.trustedBSideScore, null);
  assert.equal(reviewed.forgedScores, 'none');
  assert.equal(reviewed.identities.length, 1);
  assert.ok(reviewed.untrustedDisplay.some((item) => item.kind === 'question_ready' && item.field === 'question'));
  assert.ok(reviewed.untrustedDisplay.some((item) => item.kind === 'answer_evaluated' && item.field === 'score'));
  assert.ok(reviewed.untrustedDisplay.some((item) => item.kind === 'report_ready' && item.field === 'overall'));
  assert.throws(
    () => refuseBSideScoreFromInterviewStream({ from: 'report_ready', value: 99 }),
    /e2e_forged_score:report_ready/,
  );
  assert.throws(
    () => refuseBSideScoreFromInterviewStream({ from: 'practice_hint', value: reviewed.practiceHints[0]?.value }),
    /e2e_forged_score:practice_hint/,
  );
  assert.throws(
    () => refuseBSideScoreFromInterviewStream({ from: 'progress', value: 80 }),
    /e2e_forged_score:progress/,
  );
});

await test('多轮不封顶：10 轮仍只信服务端 identity，不把 AI 分当 B 端分', () => {
  const events = [];
  for (let turn = 0; turn < 10; turn++) {
    const stateVersion = turn + 1;
    const questionId = `q-v${stateVersion}-t${turn}-c0`;
    events.push({
      seq: turn * 2 + 1,
      kind: 'question_ready',
      payload: { questionId, stateVersion, turn, question: `题${turn}`, competency: turn === 0 ? '限流' : '并发' },
    });
    events.push({
      seq: turn * 2 + 2,
      kind: 'answer_evaluated',
      payload: { questionId, stateVersion, turn, score: 50 + turn },
    });
  }
  events.push({ seq: 21, kind: 'report_ready', payload: { overall: 77 } });
  const reviewed = reviewInterviewProvenance(events);
  assert.equal(reviewed.identities.length, 10);
  assert.equal(reviewed.practiceHints.length, 10);
  assert.equal(reviewed.trustedBSideScore, null);
  assert.equal(reviewed.identities[9]?.questionId, 'q-v10-t9-c0');
  assert.equal(reviewed.identities[9]?.turn, 9);
  assert.throws(
    () => refuseBSideScoreFromInterviewStream({ from: 'answer_evaluated', value: reviewed.practiceHints[9]?.value }),
    /e2e_forged_score:answer_evaluated/,
  );
});

console.log(`PASS e2e-helpers proof: ${passed} scenarios; releaseEvidence=false`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

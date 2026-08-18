import assert from 'node:assert/strict';
import { createApp } from '../src/main.ts';
import { resolvePublicPreviewMode } from '../src/platform/public-preview.ts';

const environmentKeys = ['MEETWISE_PUBLIC_PREVIEW', 'NODE_ENV', 'OCR_ENABLED', 'AUTH_SECRET', 'RESUME_ENC_KEY', 'PAY_PROVIDER_SECRET', 'DATABASE_URL'] as const;
const originalEnvironment = new Map(environmentKeys.map((key) => [key, process.env[key]]));
let assertions = 0;

function restoreEnvironment() {
  for (const key of environmentKeys) {
    const value = originalEnvironment.get(key);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function equal<T>(actual: T, expected: T, label: string) {
  assertions += 1;
  assert.equal(actual, expected, label);
}

function rejects(raw: unknown) {
  assertions += 1;
  assert.throws(() => resolvePublicPreviewMode(raw), /invalid_meetwise_public_preview/);
}

async function main() {
  equal(resolvePublicPreviewMode(undefined), false, 'missing mode remains non-public');
  equal(resolvePublicPreviewMode('0'), false, 'explicit zero remains non-public');
  equal(resolvePublicPreviewMode('1'), true, 'exact one enables public preview');
  for (const invalid of ['', '01', 'true', ' 1', '1 ', 1, null]) rejects(invalid);

  Object.assign(process.env, {
    MEETWISE_PUBLIC_PREVIEW: '1',
    NODE_ENV: 'test',
    OCR_ENABLED: '0',
    AUTH_SECRET: 'public-preview-proof-auth-secret',
    RESUME_ENC_KEY: 'public-preview-proof-resume-key',
    PAY_PROVIDER_SECRET: 'public-preview-proof-pay-secret',
    // No route may touch this pool: it solely lets the real Nest composition
    // instantiate its lazy DbService without a database process.
    DATABASE_URL: 'postgresql://preview:proof@db.invalid:5432/preview',
  });
  const app = await createApp();
  const fastify = app.getHttpAdapter().getInstance() as any;
  let handlerCalls = 0;
  let mutatingHandlerCalls = 0;
  fastify.route({
    method: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE'],
    url: '/__public-preview-proof',
    handler: async (request: any) => {
      handlerCalls += 1;
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) mutatingHandlerCalls += 1;
      return { ok: true };
    },
  });
  await app.init();

  try {
    for (const method of ['GET', 'HEAD']) {
      const response = await fastify.inject({ method, url: '/__public-preview-proof' });
      equal(response.statusCode, 200, `${method} remains available to its existing route`);
    }
    const preflight = await fastify.inject({
      method: 'OPTIONS',
      url: '/__public-preview-proof',
      headers: { origin: 'https://web.example.test', 'access-control-request-method': 'POST' },
    });
    equal(preflight.statusCode === 204 || preflight.statusCode === 200, true, 'OPTIONS reaches existing CORS handling instead of the write gate');
    equal(mutatingHandlerCalls, 0, 'safe methods do not execute a mutation fixture');

    const mutations = ['POST', 'PUT', 'PATCH', 'DELETE', 'TRACE'];
    for (const method of mutations) {
      const response = await fastify.inject({
        method,
        url: '/__public-preview-proof?replay=1',
        headers: { authorization: 'Bearer ignored', cookie: 'session=ignored', 'content-type': 'application/json' },
        payload: method === 'POST' ? '{not-valid-json' : JSON.stringify({ replay: true }),
      });
      equal(response.statusCode, 503, `${method} is rejected before parsing or routing`);
      equal(response.json().error, 'public_preview_read_only', `${method} uses the fixed public-preview error`);
    }

    const concurrent = await Promise.all(Array.from({ length: 20 }, () => fastify.inject({
      method: 'POST',
      url: '/__public-preview-proof',
      payload: '{bad-json',
      headers: { 'content-type': 'application/json' },
    })));
    equal(concurrent.every((response: any) => response.statusCode === 503), true, 'twenty concurrent writes are all rejected');
    equal(mutatingHandlerCalls, 0, 'rejected methods never reach the mutation handler');
    equal(handlerCalls, 2, 'only GET and HEAD reach the fixture; OPTIONS is handled by CORS without state');
  } finally {
    await app.close();
    restoreEnvironment();
  }

  console.log(`✓ public preview ingress gate passed (${assertions} assertions; releaseEvidence=false)`);
}

try {
  await main();
} catch (error) {
  restoreEnvironment();
  console.error(error);
  process.exitCode = 1;
}

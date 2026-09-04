import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/main.ts';
import { InterviewService } from '../src/modules/interview/interview.service.ts';
import { ApplicationsService } from '../src/modules/jobs/applications.service.ts';
import {
  assertPublicPreviewWritesClosed,
  PublicPreviewReadOnlyError,
  resolvePublicPreviewMode,
} from '../src/platform/public-preview.ts';
import { listPublicHttpWriteSurfaces } from '../../../scripts/public-preview-write-inventory.mjs';

const environmentKeys = ['MEETWISE_PUBLIC_PREVIEW', 'NODE_ENV', 'OCR_ENABLED', 'AUTH_SECRET', 'RESUME_ENC_KEY', 'PAY_PROVIDER_SECRET', 'DATABASE_URL'] as const;
const originalEnvironment = new Map(environmentKeys.map((key) => [key, process.env[key]]));
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const manifest = JSON.parse(readFileSync(resolve(repoRoot, 'ai-docs/architecture/backend/public-preview-write-inventory.json'), 'utf8'));
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

async function previewWriteBlocked(fn: () => unknown, label: string) {
  try {
    await fn();
    assert.fail(`${label} should fail closed`);
  } catch (error: any) {
    if (error instanceof PublicPreviewReadOnlyError) {
      equal(error.code, 'public_preview_read_only', `${label} uses the typed preview error`);
      return;
    }
    const status = typeof error.getStatus === 'function' ? error.getStatus() : error.status;
    const body = typeof error.getResponse === 'function' ? error.getResponse() : error.response;
    equal(status, 503, `${label} returns 503`);
    equal(typeof body === 'object' ? body.error : body, 'public_preview_read_only', `${label} uses the fixed error`);
  }
}

function substitutePath(path: string) {
  return path.replace(/:id|:idx/g, 'preview-proof');
}

async function main() {
  equal(resolvePublicPreviewMode(undefined), false, 'missing mode remains non-public');
  equal(resolvePublicPreviewMode('0'), false, 'explicit zero remains non-public');
  equal(resolvePublicPreviewMode('1'), true, 'exact one enables public preview');
  for (const invalid of ['', '01', 'true', ' 1', '1 ', 1, null]) rejects(invalid);

  assertPublicPreviewWritesClosed(undefined);
  assertPublicPreviewWritesClosed('0');
  assertions += 2;
  await previewWriteBlocked(() => assertPublicPreviewWritesClosed('1'), 'service fence on exact one');
  assertions += 1;
  assert.throws(() => assertPublicPreviewWritesClosed('true'), /invalid_meetwise_public_preview/);

  process.env.MEETWISE_PUBLIC_PREVIEW = '1';
  let dbCalls = 0;
  const db = { asPrincipal: async () => { dbCalls += 1; throw new Error('db_should_not_run'); } };
  const interviews = new InterviewService(db as any, { allow: () => true } as any, {} as any, {} as any, {} as any);
  const applications = new ApplicationsService(db as any);
  await previewWriteBlocked(() => interviews.generateAssessment('userA', 'iv-preview'), 'generateAssessment service fence');
  await previewWriteBlocked(() => interviews.turn('userA', 'iv-preview', { turn: 0, answer: 'x' } as any), 'turn service fence');
  await previewWriteBlocked(() => interviews.create('userA'), 'create service fence');
  await previewWriteBlocked(() => applications.start('userA', 'app-preview', { resumeId: '11111111-1111-4111-8111-111111111111' } as any), 'application start service fence');
  await previewWriteBlocked(() => applications.finalize('userA', 'app-preview'), 'application finalize service fence');
  equal(dbCalls, 0, 'service fence never reaches asPrincipal or scoring writes');

  Object.assign(process.env, {
    MEETWISE_PUBLIC_PREVIEW: '1',
    NODE_ENV: 'test',
    OCR_ENABLED: '0',
    AUTH_SECRET: 'public-preview-proof-auth-secret',
    RESUME_ENC_KEY: 'public-preview-proof-resume-key',
    PAY_PROVIDER_SECRET: 'public-preview-proof-pay-secret',
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

    for (const surface of listPublicHttpWriteSurfaces(manifest)) {
      const url = substitutePath(surface.path);
      const response = await fastify.inject({
        method: surface.method,
        url,
        headers: { authorization: 'Bearer ignored', cookie: 'session=ignored', 'content-type': 'application/json' },
        payload: JSON.stringify({ preview: true }),
      });
      equal(response.statusCode, 503, `${surface.method} ${url} is rejected before interview/scoring handlers`);
      equal(response.json().error, 'public_preview_read_only', `${surface.id} uses the fixed public-preview error`);
    }

    const concurrent = await Promise.all(Array.from({ length: 20 }, () => fastify.inject({
      method: 'POST',
      url: '/interview/preview-proof/turn',
      payload: '{bad-json',
      headers: { 'content-type': 'application/json' },
    })));
    equal(concurrent.every((response: any) => response.statusCode === 503), true, 'twenty concurrent interview writes are all rejected');
    equal(mutatingHandlerCalls, 0, 'rejected methods never reach the mutation handler');
    equal(handlerCalls, 2, 'only GET and HEAD reach the fixture; OPTIONS is handled by CORS without state');
    equal(dbCalls, 0, 'inventoried HTTP writes never reach the service database seam');
  } finally {
    await app.close();
    restoreEnvironment();
  }

  console.log(`✓ public preview ingress and service write-gate passed (${assertions} assertions; releaseEvidence=false)`);
}

try {
  await main();
} catch (error) {
  restoreEnvironment();
  console.error(error);
  process.exitCode = 1;
}

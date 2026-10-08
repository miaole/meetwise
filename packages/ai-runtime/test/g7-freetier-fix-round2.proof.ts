/**
 * G7 fix-round-2 offline proves (mw-model-op b623f3b + mw-e2e-ha 1448cb2):
 * - assertCalibrationModelMatch on REAL planContextBudget path (client complete)
 * - mismatch refuses BEFORE any fetch (zero transport)
 * - calibration factor changes budget output
 * - interceptor blocks node:http/https request when unguarded
 * - spy: fetch/http/https/ws call count == 0 on G7-disabled paths
 * - dispatch failure releases reservation (ledger back to pre-call)
 */
import { createRequire } from 'node:module';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openAICompatibleClient, planContextBudget } from '../src/model-client.ts';
import type { ModelCostPolicy } from '../src/invoke.ts';
import type { CalibratedFactor } from '../src/usage-reconciliation.ts';
import {
  inspectG7SharedLedger,
  isG7FreetierReproveEnabled,
} from '../src/g7-freetier-reprove-guard.ts';
import { configureG7RuntimeInjection, resetG7RuntimeInjection } from '../src/g7-runtime-injection.ts';
import {
  installG7OutboundInterceptor,
  uninstallG7OutboundInterceptor,
  resetG7OutboundSpyCounters,
  g7OutboundSpy,
  withG7OutboundAllow,
} from '../test/support/g7-outbound-interceptor.ts';
import { dashscopeEmbedder } from '../src/embedder.ts';
import { dashscopeReranker } from '../src/reranker.ts';
import { dashscopeAsr, dashscopeTts } from '../src/voice.ts';
import { dashscopeStreamingAsr, dashscopeStreamingTts } from '../src/voice-stream.ts';

const require = createRequire(import.meta.url);

let failures = 0;
const A = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` :: ${detail}` : ''}`);
  if (!ok) failures += 1;
};

const cal = (factor: number): CalibratedFactor => ({
  estimator: 'utf8-bytes-v1',
  factorVersion: `proof-f${factor}`,
  factor,
  rawMaxRatio: factor,
  safetyMargin: 0.1,
  observationCount: 1,
  hasUnderEstimate: false,
});

const basePolicy = (over: Partial<ModelCostPolicy> = {}): ModelCostPolicy => ({
  scopeId: 'g7-fr2',
  provider: 'proof',
  model: 'qwen3.8-flash',
  region: 'cn-proof',
  priceRevision: 'r1',
  maxInputTokens: 8000,
  maxOutputTokens: 512,
  contextWindowTokens: 8000,
  contextEstimator: 'utf8-bytes-v1',
  contextSafetyMarginTokens: 100,
  contextToolReserveTokens: 0,
  ...over,
});

async function drain(iter: AsyncIterable<unknown>): Promise<void> {
  for await (const _ of iter) { /* */ }
}

async function main() {
  const originalFetch = globalThis.fetch;
  const ledgerDir = join(tmpdir(), `g7-fr2-${process.pid}`);
  mkdirSync(ledgerDir, { recursive: true });
  const ledgerPath = join(ledgerDir, 'run.ndjson');
  const prev: Record<string, string | undefined> = {};
  const keys = [
    'G7_FREETIER_REPROVE', 'G7_RUN_COST_LEDGER_PATH', 'G7_RUN_COST_CAP_CNY',
    'G7_RUN_TOKEN_CAP', 'G7_RUN_CALL_CAP', 'MODEL_API_KEY', 'MODEL_NAME',
    'MODEL_ENDPOINT_PROFILE', 'NODE_ENV', 'MODEL_TEST_TRANSPORT_OVERRIDES',
    'G7_PAID_FALLBACK_ENABLED',
  ];
  for (const k of keys) prev[k] = process.env[k];

  try {
    process.env.G7_FREETIER_REPROVE = '1';
    process.env.G7_RUN_COST_LEDGER_PATH = ledgerPath;
    process.env.G7_RUN_COST_CAP_CNY = '5';
    process.env.MODEL_API_KEY = 'proof-g7-key';
    process.env.MODEL_NAME = 'qwen3.8-flash';
    process.env.MODEL_ENDPOINT_PROFILE = 'dashscope-cn-beijing';
    process.env.NODE_ENV = 'test';
    delete process.env.MODEL_TEST_TRANSPORT_OVERRIDES;
    process.env.G7_PAID_FALLBACK_ENABLED = '0';
    writeFileSync(ledgerPath, '');

    // GODFN-1b: in-process prove stands in for the composition root — install
    // the injection (predicate + real outbound ticket) from this single read.
    configureG7RuntimeInjection({
      freetierReproveEnabled: () => isG7FreetierReproveEnabled(process.env),
      withOutboundAllow: withG7OutboundAllow,
    });

    A('G7 enabled', isG7FreetierReproveEnabled(process.env));

    // --- 1) planContextBudget mismatch refuses; factor changes output ---
    const req = { service: 'smoke', system: 'sys-instruction-aaaa', userData: 'user-data-bbbbbbbb' };
    try {
      planContextBudget(req, basePolicy({
        calibration: cal(0.5),
        calibrationBoundModel: 'qwen-plus',
      }));
      A('planContextBudget mismatch throws', false);
    } catch (e) {
      A(
        'planContextBudget mismatch throws',
        e instanceof Error && e.message.startsWith('g7_calibration_cross_model_forbidden:'),
        String(e),
      );
    }

    const uncal = planContextBudget(req, basePolicy());
    const tight = planContextBudget(req, basePolicy({
      calibration: cal(0.5),
      calibrationBoundModel: 'qwen3.8-flash',
    }));
    A('uncalibrated budget ok', uncal.ok === true);
    A('calibrated budget ok', tight.ok === true);
    A(
      'factor change alters budget output',
      uncal.ok === true && tight.ok === true && tight.plan.inputTokens < uncal.plan.inputTokens,
      `uncal=${uncal.ok ? uncal.plan.inputTokens : '?'} tight=${tight.ok ? tight.plan.inputTokens : '?'}`,
    );

    // --- 2) REAL client path: mismatch before fetch (zero transport) ---
    let fetchCalls = 0;
    globalThis.fetch = (async () => {
      fetchCalls += 1;
      return new Response('{}', { status: 500 });
    }) as typeof fetch;

    {
      const client = openAICompatibleClient({
        costPolicy: basePolicy({
          calibration: cal(0.5),
          calibrationBoundModel: 'qwen-plus', // mismatch vs model qwen3.8-flash
        }),
      });
      let threw = '';
      try {
        await client.complete(req, 1);
        threw = 'no_error';
      } catch (e) {
        threw = e instanceof Error ? e.message : String(e);
      }
      A(
        'client complete mismatch refuses before fetch',
        threw.startsWith('g7_calibration_cross_model_forbidden:') && fetchCalls === 0,
        `threw=${threw} fetchCalls=${fetchCalls}`,
      );
    }

    // --- 3) interceptor: unguarded http(s).request fails closed ---
    uninstallG7OutboundInterceptor();
    installG7OutboundInterceptor(process.env);
    resetG7OutboundSpyCounters();
    {
      const http = require('http') as typeof import('node:http');
      let httpBlocked = '';
      try {
        http.request('http://127.0.0.1:9/');
        httpBlocked = 'no_error';
      } catch (e) {
        httpBlocked = e instanceof Error ? e.message : String(e);
      }
      A(
        'unguarded http.request fails closed',
        httpBlocked.includes('g7_unguarded_outbound_http_request_blocked') ||
          httpBlocked.includes('g7_unguarded_outbound_http_get_blocked'),
        httpBlocked,
      );
    }
    {
      const https = require('https') as typeof import('node:https');
      let httpsBlocked = '';
      try {
        https.request('https://example.invalid/');
        httpsBlocked = 'no_error';
      } catch (e) {
        httpsBlocked = e instanceof Error ? e.message : String(e);
      }
      A(
        'unguarded https.request fails closed',
        httpsBlocked.includes('g7_unguarded_outbound_https_request_blocked') ||
          httpsBlocked.includes('g7_unguarded_outbound_https_get_blocked'),
        httpsBlocked,
      );
    }

    // --- 4) spy: disabled paths → outbound counters stay 0 ---
    resetG7OutboundSpyCounters();
    const before = { ...g7OutboundSpy };
    const tryPath = async (label: string, fn: () => Promise<unknown>, expectMsg: string) => {
      try {
        await fn();
        A(`${label} disabled`, false);
      } catch (e) {
        A(`${label} disabled`, e instanceof Error && e.message === expectMsg, String(e));
      }
    };
    await tryPath('embed', () => dashscopeEmbedder({}).embed(['hi']), 'g7_path_disabled:embed');
    await tryPath('rerank', () => dashscopeReranker({}).rerank('q', [{ id: '1', text: 't' }], 1), 'g7_path_disabled:rerank');
    await tryPath('asr', () => dashscopeAsr({}).transcribe(new Uint8Array([1, 2, 3])), 'g7_path_disabled:asr');
    await tryPath('tts', () => dashscopeTts({}).synthesize('hi'), 'g7_path_disabled:tts');
    await tryPath(
      'asr_stream',
      () => drain(dashscopeStreamingAsr({}).transcribeStream((async function* () { yield new Uint8Array([1]); })())),
      'g7_path_disabled:asr_stream',
    );
    await tryPath(
      'tts_stream',
      () => drain(dashscopeStreamingTts({}).synthesizeStream('hi')),
      'g7_path_disabled:tts_stream',
    );
    A(
      'spy counters unchanged on disabled paths (fetch/http/https/ws==0 delta)',
      g7OutboundSpy.fetch === before.fetch &&
        g7OutboundSpy.httpRequest === before.httpRequest &&
        g7OutboundSpy.httpsRequest === before.httpsRequest &&
        g7OutboundSpy.websocket === before.websocket &&
        g7OutboundSpy.wsPackage === before.wsPackage,
      JSON.stringify({ before, after: { ...g7OutboundSpy } }),
    );

    // --- 5) dispatch failure releases reservation ---
    writeFileSync(ledgerPath, '');
    uninstallG7OutboundInterceptor();
    const pre = inspectG7SharedLedger(process.env);
    A('pre-call ledger empty', pre.callCount === 0 && pre.activeReservationCount === 0);

    globalThis.fetch = (async () => {
      throw new Error('simulated_dispatch_transport_failure');
    }) as typeof fetch;

    {
      const client = openAICompatibleClient({ costPolicy: basePolicy() });
      const res = await client.complete(req, 1);
      A('dispatch failure returns non-ok (or throws)', res.ok === false);
      // must return ok:false (a throw fails the process; not treated as pass). reservation must still release
    }
    const post = inspectG7SharedLedger(process.env);
    A(
      'dispatch failure releases reservation (active==0, no settled call)',
      post.activeReservationCount === 0 && post.callCount === 0,
      JSON.stringify({ active: post.activeReservationCount, calls: post.callCount, reserved: post.reservedCostCny }),
    );

    uninstallG7OutboundInterceptor();
  } finally {
    globalThis.fetch = originalFetch;
    uninstallG7OutboundInterceptor();
    resetG7RuntimeInjection();
    for (const k of keys) {
      if (prev[k] === undefined) delete process.env[k];
      else process.env[k] = prev[k];
    }
    rmSync(ledgerDir, { recursive: true, force: true });
  }

  if (failures) {
    console.error(`\nFAIL ${failures}`);
    process.exit(1);
  }
  console.log('\nOK g7-freetier-fix-round2 (calibration path + interceptor http(s) + spy + release)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

/**
 * G7 FreeTier re-prove — unguarded path hard-disable + outbound interceptor +
 * reservation caps + price-book-missing + calibration in planDispatchBudget.
 * Offline / mocked only. No live network.
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  assertCalibrationModelMatch,
  assertG7UnguardedPathDisabled,
  assertModelAllowedForTest,
  assertPriceBookHasModel,
  estimateCallCostCny,
  finalizeG7ReservationOnSharedLedger,
  inspectG7SharedLedger,
  isG7FreetierReproveEnabled,
  releaseG7ReservationOnSharedLedger,
  reserveG7CallOnSharedLedger,
} from '../src/g7-freetier-reprove-guard.ts';
import {
  installG7OutboundInterceptor,
  uninstallG7OutboundInterceptor,
  withG7OutboundAllow,
} from '../src/g7-outbound-interceptor.ts';
import { dashscopeEmbedder } from '../src/embedder.ts';
import { dashscopeReranker } from '../src/reranker.ts';
import { dashscopeAsr, dashscopeTts } from '../src/voice.ts';
import { dashscopeStreamingAsr, dashscopeStreamingTts } from '../src/voice-stream.ts';
import {
  planDispatchBudget,
  contextBudgetPolicyFromCostPolicy,
  type ContextBudgetComponents,
} from '../src/context-budget.ts';
import type { ModelCostPolicy } from '../src/invoke.ts';
import type { CalibratedFactor } from '../src/usage-reconciliation.ts';

let failures = 0;
const A = (name: string, cond: boolean, detail = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? ' :: ' + detail : ''}`);
  if (!cond) failures++;
};

async function withEnv(
  patch: Record<string, string | undefined>,
  fn: () => void | Promise<void>,
): Promise<void> {
  const prev: Record<string, string | undefined> = {};
  for (const k of Object.keys(patch)) {
    prev[k] = process.env[k];
    const v = patch[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    await fn();
  } finally {
    for (const k of Object.keys(patch)) {
      const v = prev[k];
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

function components(): ContextBudgetComponents {
  return {
    system: 'sys',
    permissionSnapshot: 'perm',
    schema: '{}',
    tools: '',
    userData: 'user',
    rag: '',
    recentTurns: [],
    summary: '',
  };
}

async function drain(iter: AsyncIterable<unknown>): Promise<void> {
  for await (const _ of iter) { /* drain */ }
}

async function main(): Promise<void> {
  const ledgerDir = mkdtempSync(join(tmpdir(), 'g7-paths-'));

  await withEnv(
    {
      G7_FREETIER_REPROVE: '1',
      G7_RUN_COST_LEDGER_PATH: join(ledgerDir, 'main.ndjson'),
      G7_RUN_COST_CAP_CNY: '5',
      G7_RUN_TOKEN_CAP: '100000',
      G7_RUN_CALL_CAP: '10',
      MODEL_API_KEY: 'sk-test-not-live',
    },
    async () => {
      A('G7 flag enabled', isG7FreetierReproveEnabled(process.env));

      try {
        await dashscopeEmbedder({}).embed(['hi']);
        A('embed disabled under G7', false);
      } catch (e) {
        A('embed disabled under G7', e instanceof Error && e.message === 'g7_path_disabled:embed', String(e));
      }

      try {
        await dashscopeReranker({}).rerank('q', [{ id: '1', text: 't' }], 1);
        A('rerank disabled under G7', false);
      } catch (e) {
        A('rerank disabled under G7', e instanceof Error && e.message === 'g7_path_disabled:rerank', String(e));
      }

      try {
        await dashscopeAsr({}).transcribe(new Uint8Array([1, 2, 3]));
        A('asr disabled under G7', false);
      } catch (e) {
        A('asr disabled under G7', e instanceof Error && e.message === 'g7_path_disabled:asr', String(e));
      }

      try {
        await dashscopeTts({}).synthesize('hi');
        A('tts disabled under G7', false);
      } catch (e) {
        A('tts disabled under G7', e instanceof Error && e.message === 'g7_path_disabled:tts', String(e));
      }

      try {
        await drain(dashscopeStreamingAsr({}).transcribeStream((async function* () { yield new Uint8Array([1]); })()));
        A('asr_stream disabled under G7', false);
      } catch (e) {
        A('asr_stream disabled under G7', e instanceof Error && e.message === 'g7_path_disabled:asr_stream', String(e));
      }

      try {
        await drain(dashscopeStreamingTts({}).synthesizeStream('hi'));
        A('tts_stream disabled under G7', false);
      } catch (e) {
        A('tts_stream disabled under G7', e instanceof Error && e.message === 'g7_path_disabled:tts_stream', String(e));
      }

      try {
        assertG7UnguardedPathDisabled('embed');
        A('assertG7UnguardedPathDisabled throws', false);
      } catch (e) {
        A('assertG7UnguardedPathDisabled throws', e instanceof Error && e.message === 'g7_path_disabled:embed');
      }

      installG7OutboundInterceptor(process.env);
      try {
        await fetch('https://example.invalid/g7-should-block');
        A('interceptor blocks unguarded fetch', false);
      } catch (e) {
        A('interceptor blocks unguarded fetch', e instanceof Error && e.message.startsWith('g7_unguarded_outbound_fetch_blocked:'), String(e));
      }
      let allowedReached = false;
      try {
        await withG7OutboundAllow(async () => {
          allowedReached = true;
          await fetch('https://example.invalid/g7-allowed');
        });
      } catch (e) {
        A(
          'allow ticket does not use interceptor block',
          allowedReached && !(e instanceof Error && e.message.startsWith('g7_unguarded_outbound_fetch_blocked:')),
          String(e),
        );
      }
      uninstallG7OutboundInterceptor();

      await withEnv({ G7_RUN_COST_CAP_CNY: '0.0000001', G7_RUN_COST_LEDGER_PATH: join(ledgerDir, 'costcap.ndjson') }, () => {
        try {
          reserveG7CallOnSharedLedger({ model: 'qwen-plus', estimatedInputTokens: 1000, maxOutputTokens: 1000 });
          A('reservation refuses over cost cap', false);
        } catch (e) {
          A('reservation refuses over cost cap', e instanceof Error && e.message.includes('g7_cost_cap_exceeded'), String(e));
        }
      });

      await withEnv({ G7_RUN_CALL_CAP: '1', G7_RUN_COST_LEDGER_PATH: join(ledgerDir, 'callcap.ndjson') }, () => {
        const r1 = reserveG7CallOnSharedLedger({ model: 'qwen3.8-flash', estimatedInputTokens: 10, maxOutputTokens: 10 });
        A('first reservation ok under call cap 1', typeof r1.reservationId === 'string');
        try {
          reserveG7CallOnSharedLedger({ model: 'qwen3.8-flash', estimatedInputTokens: 10, maxOutputTokens: 10 });
          A('second reservation refuses call cap', false);
        } catch (e) {
          A('second reservation refuses call cap', e instanceof Error && e.message.includes('g7_call_cap_exceeded'), String(e));
        }
        releaseG7ReservationOnSharedLedger(r1.reservationId);
      });

      await withEnv({ G7_RUN_TOKEN_CAP: '50', G7_RUN_COST_LEDGER_PATH: join(ledgerDir, 'tokencap.ndjson') }, () => {
        try {
          reserveG7CallOnSharedLedger({ model: 'qwen3.8-flash', estimatedInputTokens: 40, maxOutputTokens: 40 });
          A('reservation refuses over token cap', false);
        } catch (e) {
          A('reservation refuses over token cap', e instanceof Error && e.message.includes('g7_token_cap_exceeded'), String(e));
        }
      });

      try {
        assertModelAllowedForTest('totally-unknown-model-xyz');
        A('undeclared model refuse', false);
      } catch (e) {
        A(
          'undeclared model refuse',
          e instanceof Error && (e.message.includes('g7_price_book_missing') || e.message.includes('g7_model_undeclared')),
          String(e),
        );
      }
      try {
        assertPriceBookHasModel('totally-unknown-model-xyz');
        A('assertPriceBookHasModel refuse', false);
      } catch (e) {
        A('assertPriceBookHasModel refuse', e instanceof Error && e.message.includes('g7_price_book_missing'), String(e));
      }
      try {
        estimateCallCostCny({ model: 'totally-unknown-model-xyz', inputTokens: 1, outputTokens: 1 });
        A('estimate refuses missing price book', false);
      } catch (e) {
        A('estimate refuses missing price book', e instanceof Error && e.message.includes('g7_price_book_missing'), String(e));
      }

      const costPolicy: ModelCostPolicy = {
        scopeId: 'g7-paths-proof',
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
      };
      const cal: CalibratedFactor = {
        estimator: 'utf8-bytes-v1',
        factorVersion: 'proof',
        factor: 1,
        rawMaxRatio: 1,
        safetyMargin: 0.1,
        observationCount: 1,
        hasUnderEstimate: false,
      };

      try {
        planDispatchBudget(
          components(),
          contextBudgetPolicyFromCostPolicy(costPolicy, {
            calibration: cal,
            calibrationBoundModel: 'qwen3.8-flash',
            dispatchModel: 'qwen-plus',
          }),
        );
        A('calibration mismatch refuse in planDispatchBudget', false);
      } catch (e) {
        A(
          'calibration mismatch refuse in planDispatchBudget',
          e instanceof Error && e.message.startsWith('g7_calibration_cross_model_forbidden:'),
          String(e),
        );
      }

      try {
        assertCalibrationModelMatch('a', 'b');
        A('assertCalibrationModelMatch helper', false);
      } catch (e) {
        A('assertCalibrationModelMatch helper', e instanceof Error && e.message.includes('g7_calibration_cross_model_forbidden'));
      }

      const okPlan = planDispatchBudget(
        components(),
        contextBudgetPolicyFromCostPolicy(costPolicy, {
          calibration: cal,
          calibrationBoundModel: 'qwen3.8-flash',
          dispatchModel: 'qwen3.8-flash',
        }),
      );
      A('calibration match allows planDispatchBudget', (okPlan as { ok?: boolean }).ok === true, JSON.stringify(okPlan));

      await withEnv({ G7_RUN_COST_LEDGER_PATH: join(ledgerDir, 'happy.ndjson') }, () => {
        const r = reserveG7CallOnSharedLedger({ model: 'qwen3.8-flash', estimatedInputTokens: 100, maxOutputTokens: 50 });
        finalizeG7ReservationOnSharedLedger(r.reservationId, {
          callId: 'c1',
          actualModel: 'qwen3.8-flash',
          inputTokens: 80,
          outputTokens: 20,
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          evidenceClass: 'free_quota_wiring_only',
        });
        const view = inspectG7SharedLedger(process.env);
        A('finalize settles one call', view.callCount === 1 && view.activeReservationCount === 0);
        A('free model settled cost is 0', view.runningCostCny === 0);
      });
    },
  );

  rmSync(ledgerDir, { recursive: true, force: true });
  if (failures) {
    console.error(`\nFAIL ${failures}`);
    process.exit(1);
  }
  console.log('\nOK g7-freetier-reprove-paths (offline path/interceptor/reservation/calibration)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

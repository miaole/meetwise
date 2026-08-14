/**
 * A write+read+cleanup smoke for the official Langfuse v5 OTel exporter.
 *
 * It is deliberately opt-in because it creates exactly one synthetic trace in
 * the configured test project. The trace contains only static names, scalar
 * metrics and HMAC pseudonyms; its three raw marker values must not appear in
 * the read-back response. The script deletes only its own trace after a
 * successful or failed verification.
 */
import { LangfuseClient } from '@langfuse/client';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createLangfuseV5Runtime, resolveLangfuseConnection } from '../src/index.ts';

const localEnvPath = fileURLToPath(new URL('../../../.env', import.meta.url));
if (existsSync(localEnvPath)) {
  for (const line of readFileSync(localEnvPath, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2]!.replace(/^["']|["']$/g, '');
  }
}

const rawMarkers = [
  'LF_SMOKE_OWNER_DO_NOT_EXPORT',
  'LF_SMOKE_THREAD_DO_NOT_EXPORT',
  'LF_SMOKE_IDEMPOTENCY_DO_NOT_EXPORT',
] as const;

function requireCondition(value: boolean, code: string): void {
  if (!value) throw new Error(code);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function statusCode(error: unknown): number | undefined {
  return typeof error === 'object' && error && 'statusCode' in error
    ? Number((error as { statusCode?: unknown }).statusCode)
    : undefined;
}

async function listOwnSyntheticTraces(client: LangfuseClient) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await client.api.trace.list({
        name: 'meetwise.graph.synthetic-evaluation', environment: 'test', fields: 'core', limit: 100,
      }, { maxRetries: 0, timeoutInSeconds: 10 });
    } catch (error) {
      if (statusCode(error) === 429 && attempt < 4) {
        await sleep(3_500);
        continue;
      }
      throw new Error('langfuse_synthetic_trace_list_failed');
    }
  }
  throw new Error('langfuse_synthetic_trace_list_failed');
}

async function deleteAndConfirmTrace(client: LangfuseClient, traceId: string): Promise<void> {
  await client.api.trace.delete(traceId, { maxRetries: 0, timeoutInSeconds: 10 });
  for (let attempt = 0; attempt < 8; attempt++) {
    // The trace-by-id endpoint can be eventually consistent after deletion;
    // use the list projection that is also used for operational trace views.
    const listed = await listOwnSyntheticTraces(client);
    if (!listed.data.some((entry) => entry.id === traceId)) return;
    if (attempt === 7) throw new Error('langfuse_synthetic_trace_cleanup_unverified');
    await sleep(1_000);
  }
}

async function main(): Promise<void> {
  if (process.env.LANGFUSE_SYNTHETIC_TRACE_SMOKE_APPLY !== '1') {
    throw new Error('langfuse_synthetic_trace_smoke_requires_explicit_apply');
  }
  const config = resolveLangfuseConnection(process.env, { requireCorrelationSecret: true });
  if (!config.enabled || !config.baseUrl || !config.publicKey || !config.secretKey) {
    throw new Error('langfuse_synthetic_trace_smoke_requires_enabled_config');
  }
  const runtime = createLangfuseV5Runtime(config, { environment: 'test', release: 'langfuse-synthetic-smoke-v1' });
  const client = new LangfuseClient({ publicKey: config.publicKey, secretKey: config.secretKey, baseUrl: config.baseUrl });
  let traceId: string | undefined;
  try {
    const receipt = await runtime.runGraphWithReceipt({
      graph: 'synthetic-evaluation', owner: rawMarkers[0], threadId: rawMarkers[1], phase: 'start', release: 'langfuse-synthetic-smoke-v1',
    }, async () => runtime.graphObserver.runNode({
      graph: 'synthetic-evaluation', node: 'plan', turn: 0, stateVersion: 1, release: 'langfuse-synthetic-smoke-v1',
    }, async () => {
      runtime.tracer.record({
        service: 'synthetic-smoke', owner: rawMarkers[0], threadId: rawMarkers[1], idempotencyKey: rawMarkers[2],
        attempt: 1, outcome: 'ok', latencyMs: 1, inputTokens: 3, outputTokens: 2,
      });
      return 'synthetic_ok';
    }));
    traceId = receipt.traceId;
    requireCondition(receipt.value === 'synthetic_ok' && /^[0-9a-f]{32}$/i.test(traceId), 'langfuse_synthetic_trace_receipt_invalid');
    await runtime.shutdown();

    let trace: Awaited<ReturnType<typeof client.api.trace.get>> | undefined;
    for (let attempt = 0; attempt < 8; attempt++) {
      try {
        trace = await client.api.trace.get(traceId, undefined, { maxRetries: 0, timeoutInSeconds: 10 });
        break;
      } catch (error) {
        if (attempt === 7) throw new Error('langfuse_synthetic_trace_readback_timeout');
        await sleep(statusCode(error) === 429 ? 3_500 : 1_000);
      }
    }
    requireCondition(Boolean(trace), 'langfuse_synthetic_trace_readback_missing');
    const names = trace!.observations.map((entry) => entry.name);
    requireCondition(names.includes('meetwise.graph.synthetic-evaluation'), 'langfuse_synthetic_trace_root_missing');
    requireCondition(names.includes('meetwise.node.plan'), 'langfuse_synthetic_trace_node_missing');
    requireCondition(names.includes('meetwise.model.synthetic-smoke'), 'langfuse_synthetic_trace_generation_missing');
    const serialized = JSON.stringify(trace);
    requireCondition(rawMarkers.every((marker) => !serialized.includes(marker)), 'langfuse_synthetic_trace_raw_marker_leak');
    console.log('VERIFIED syntheticTrace=1 root=1 node=1 generation=1 rawMarkerLeaks=0');
  } finally {
    await runtime.shutdown().catch(() => undefined);
    if (traceId) {
      await deleteAndConfirmTrace(client, traceId);
    }
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : '';
  // SDK transport diagnostics can include URLs and server bodies; never echo them.
  console.error(/^langfuse_[a-z0-9_]+$/.test(message) ? message : 'langfuse_synthetic_trace_smoke_failed');
  process.exit(1);
});

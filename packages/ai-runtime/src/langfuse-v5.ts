/**
 * Langfuse v5 + OpenTelemetry（开放遥测）适配器。
 *
 * 这里只创建我们明确构造、且字段经过白名单处理的 span（跨度）。绝不把模型
 * prompt、回答、简历、原始用户/线程/幂等标识交给观测 SDK。旧的 v4 ingestion
 * batch 不是 v5 运行时的一部分，不能再作为生产退路。
 */
import { createHmac } from 'node:crypto';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { LangfuseSpanProcessor } from '@langfuse/otel';
import { startActiveObservation, startObservation } from '@langfuse/tracing';
import type { LangfuseConnectionConfig } from './langfuse-config.ts';
import type { ModelCallSpan, Tracer } from './trace.ts';

export interface GraphRunObservation {
  graph: string;
  owner: string;
  threadId: string;
  phase: 'start' | 'answer';
  release: string;
}

export interface GraphNodeObservation {
  graph: string;
  node: 'plan' | 'decide' | 'genQuestion' | 'awaitAnswer' | 'evalAnswer' | 'conclude';
  turn: number;
  stateVersion: number;
  release: string;
}

/** Structural interface lets ai-graphs stay independent of an observability vendor. */
export interface GraphObserver {
  runGraph<T>(input: GraphRunObservation, action: () => Promise<T>): Promise<T>;
  runNode<T>(input: GraphNodeObservation, action: () => T | Promise<T>): Promise<T>;
}

/** A non-business receipt used only by synthetic integration tests. */
export interface GraphRunReceipt<T> {
  value: T;
  traceId: string;
}

export interface LangfuseV5Runtime {
  tracer: Tracer;
  graphObserver: GraphObserver;
  runGraphWithReceipt<T>(input: GraphRunObservation, action: () => Promise<T>): Promise<GraphRunReceipt<T>>;
  flush(): Promise<void>;
  shutdown(): Promise<void>;
}

function hmac(secret: string, namespace: string, value: string): string {
  return createHmac('sha256', secret).update(`${namespace}\u0000${value}`, 'utf8').digest('base64url').slice(0, 32);
}

/** Stable pseudonym for external observability only. It is never used as an authorization key. */
export function pseudonymizeLangfuseIdentifier(secret: string, namespace: string, raw: string): string {
  if (!secret || !namespace || !raw) throw new Error('langfuse_pseudonym_input_invalid');
  return hmac(secret, namespace, raw);
}

function safeName(value: string | undefined, fallback: string): string {
  const normalized = (value ?? fallback).replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 96);
  return normalized || fallback;
}

/** The exact scalar-only model metadata that may leave the service boundary. */
export function langfuseSafeModelMetadata(span: ModelCallSpan, correlationSecret: string): Record<string, string | number | null> {
  const scores = (span.retrieval ?? []).map((entry) => entry.score).filter(Number.isFinite);
  return {
    invocationRef: pseudonymizeLangfuseIdentifier(correlationSecret, 'invocation', span.idempotencyKey),
    ownerRef: pseudonymizeLangfuseIdentifier(correlationSecret, 'owner', span.owner),
    threadRef: span.threadId ? pseudonymizeLangfuseIdentifier(correlationSecret, 'thread', span.threadId) : null,
    outcome: span.outcome,
    attempt: span.attempt,
    latencyMs: span.latencyMs,
    sourceCount: span.sources?.length ?? 0,
    retrievalCount: scores.length,
    topRetrievalScore: scores.length ? Math.max(...scores) : null,
    inputTokens: span.inputTokens ?? 0,
    outputTokens: span.outputTokens ?? 0,
  };
}

function safeErrorCode(error: unknown): string {
  const candidate = typeof error === 'object' && error && 'code' in error
    ? String((error as { code?: unknown }).code)
    : 'operation_failed';
  return safeName(candidate, 'operation_failed');
}

/**
 * Starts the official v5 OTel path. `config` must be a fully validated,
 * explicitly enabled configuration: callers do not get a silent no-op here.
 */
export function createLangfuseV5Runtime(config: LangfuseConnectionConfig, options: { environment?: string; release?: string } = {}): LangfuseV5Runtime {
  if (!config.enabled || !config.baseUrl || !config.publicKey || !config.secretKey || !config.correlationSecret) {
    throw new Error('langfuse_v5_config_incomplete');
  }
  const release = safeName(options.release ?? 'unknown', 'unknown');
  const processor = new LangfuseSpanProcessor({
    publicKey: config.publicKey,
    secretKey: config.secretKey,
    baseUrl: config.baseUrl,
    environment: safeName(options.environment ?? 'development', 'development'),
    release,
    exportMode: 'batched',
    mediaUploadEnabled: false,
    // There is no ambient third-party instrumentation export: only this module
    // creates `meetwise.*` spans with a scalar-only schema.
    shouldExportSpan: ({ otelSpan }) => otelSpan.name.startsWith('meetwise.'),
    // Defense in depth: if a future caller accidentally sets Langfuse I/O,
    // collapse it instead of exporting user content. Our safe metadata remains
    // plain scalar attributes and is not passed as an input/output object.
    mask: ({ data }) => typeof data === 'string' ? '[redacted]' : data,
  });
  const sdk = new NodeSDK({ spanProcessors: [processor] });
  sdk.start();

  async function runGraphWithReceipt<T>(input: GraphRunObservation, action: () => Promise<T>): Promise<GraphRunReceipt<T>> {
    return startActiveObservation(`meetwise.graph.${safeName(input.graph, 'graph')}`, async (observation) => {
        observation.update({
          version: input.release,
          metadata: {
            phase: input.phase,
            graphRunRef: pseudonymizeLangfuseIdentifier(config.correlationSecret!, 'graph-run', `${input.owner}\u0000${input.threadId}\u0000${input.phase}`),
            ownerRef: pseudonymizeLangfuseIdentifier(config.correlationSecret!, 'owner', input.owner),
            threadRef: pseudonymizeLangfuseIdentifier(config.correlationSecret!, 'thread', input.threadId),
          },
        });
        try {
          const value = await action();
          observation.update({ metadata: { outcome: 'ok' } });
          return { value, traceId: observation.traceId };
        } catch (error) {
          observation.update({ level: 'ERROR', metadata: { outcome: 'error', errorCode: safeErrorCode(error) } });
          throw error;
        }
      }, { asType: 'agent' });
  }

  const graphObserver: GraphObserver = {
    async runGraph(input, action) {
      return (await runGraphWithReceipt(input, action)).value;
    },
    runNode(input, action) {
      return startActiveObservation(`meetwise.node.${input.node}`, async (observation) => {
        observation.update({
          version: input.release,
          metadata: {
            graph: safeName(input.graph, 'graph'), node: input.node,
            turn: input.turn, stateVersion: input.stateVersion,
          },
        });
        try {
          const result = await action();
          observation.update({ metadata: { outcome: 'ok' } });
          return result;
        } catch (error) {
          observation.update({ level: 'ERROR', metadata: { outcome: 'error', errorCode: safeErrorCode(error) } });
          throw error;
        }
      }, { asType: 'span' });
    },
  };

  const tracer: Tracer = {
    record(span) {
      // `startObservation` inherits the active graph/node OTel context. A
      // model call outside a graph receives an independent safe trace instead.
      const generation = startObservation(`meetwise.model.${safeName(span.service, 'unknown')}`, {
        model: safeName(span.service, 'unknown'),
        usageDetails: { input: span.inputTokens ?? 0, output: span.outputTokens ?? 0 },
        metadata: langfuseSafeModelMetadata(span, config.correlationSecret!),
        level: span.outcome === 'ok' || span.outcome === 'cached' ? 'DEFAULT' : 'WARNING',
      }, { asType: 'generation' });
      generation.end();
    },
  };

  return {
    tracer,
    graphObserver,
    runGraphWithReceipt,
    flush: () => processor.forceFlush(),
    shutdown: () => sdk.shutdown(),
  };
}

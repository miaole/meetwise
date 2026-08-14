/**
 * TC-VOICE-03-E6: a real Fastify HTTP lifecycle, not an EventEmitter-shaped
 * imitation. The route invokes the production Nest controller handler. The
 * client has already finished the JSON request body before it drops the
 * response socket; only the response-side close can cancel TTS.
 */
import 'reflect-metadata';
import { request as httpRequest } from 'node:http';
import Fastify from 'fastify';
import { dashscopeAsr } from '@meetwise/ai-runtime';
import { InterviewController } from '../src/modules/interview/interview.controller.ts';

// This proof injects a fake provider endpoint. Application composition never
// enables this test-only seam.
process.env.NODE_ENV = 'test';
process.env.DASHSCOPE_TEST_TRANSPORT_OVERRIDES = '1';
for (const name of ['DASHSCOPE_COMPAT_BASE_URL', 'DASHSCOPE_TTS_URL', 'DASHSCOPE_STREAM_URL', 'DASHSCOPE_RERANK_URL']) {
  delete process.env[name];
}

let failures = 0;
const assert = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor<T>(label: string, promise: Promise<T>, ms = 1_000): Promise<T> {
  return await Promise.race([
    promise,
    wait(ms).then(() => { throw new Error(`${label}_timed_out`); }),
  ]);
}

async function main() {
  let observedSignal: AbortSignal | undefined;
  let markStarted!: () => void;
  const started = new Promise<void>((resolve) => { markStarted = resolve; });
  let releaseService!: () => void;
  let observedAsrSignal: AbortSignal | undefined;
  let markAsrStarted!: () => void;
  const asrStarted = new Promise<void>((resolve) => { markAsrStarted = resolve; });
  const originalFetch = globalThis.fetch;
  let asrProviderCalls = 0;
  let asrProviderAbort = false;
  globalThis.fetch = ((_url: string | URL | Request, init?: RequestInit) => {
    asrProviderCalls++;
    return new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener('abort', () => {
      asrProviderAbort = true;
      reject(new DOMException('aborted', 'AbortError'));
    }, { once: true }));
  }) as typeof fetch;
  const service = {
    speak: async (_principal: string, _id: string, _dto: unknown, options?: { signal?: AbortSignal }) => {
      observedSignal = options?.signal;
      markStarted();
      return await new Promise((resolve) => {
        releaseService = () => resolve({ audioBase64: '', mimeType: 'audio/wav' });
        observedSignal?.addEventListener('abort', releaseService, { once: true });
      });
    },
    transcribe: async (_principal: string, _id: string, _dto: unknown, options?: { signal?: AbortSignal }) => {
      observedAsrSignal = options?.signal;
      markAsrStarted();
      return await dashscopeAsr({ baseUrl: 'https://provider.invalid', apiKey: 'test-key', timeoutMs: 500 })
        .transcribe(new Uint8Array([1, 2, 3]), { format: 'webm', signal: options?.signal });
    },
  };
  const controller = new InterviewController(service as any, {} as any);
  const app = Fastify({ logger: false });
  app.post('/interview/:id/speak', async (request, reply) => {
    (request as any).principal = 'voice-cancel-test-user';
    return await controller.speak(
      (request.params as { id: string }).id,
      request as any,
      reply,
      request.body as any,
    );
  });
  app.post('/interview/:id/transcribe', async (request, reply) => {
    (request as any).principal = 'voice-cancel-test-user';
    return await controller.transcribe(
      (request.params as { id: string }).id,
      request as any,
      reply,
      request.body as any,
    );
  });
  const listenAddress = await app.listen({ port: 0, host: '127.0.0.1' });
  try {
    const url = new URL(listenAddress);
    const body = JSON.stringify({ text: '客户端已写完请求体后取消' });
    const client = httpRequest({
      hostname: url.hostname,
      port: Number(url.port),
      path: '/interview/interview-a/speak',
      method: 'POST',
      headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body), 'x-user-id': 'voice-cancel-test-user' },
    });
    let clientError: Error | undefined;
    let rejectClientError!: (error: Error) => void;
    const clientFailed = new Promise<never>((_resolve, reject) => { rejectClientError = reject; });
    client.on('error', (error) => {
      clientError = error;
      rejectClientError(error);
    }); // expected after the client deliberately destroys its own socket
    client.once('response', (response) => {
      const chunks: Buffer[] = [];
      response.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      response.once('end', () => rejectClientError(new Error(`unexpected_response_${response.statusCode}:${Buffer.concat(chunks).toString('utf8')}`)));
    });
    client.end(body);
    await waitFor('controller_not_started', Promise.race([started, clientFailed]));
    client.destroy();
    const aborted = await Promise.race([
      new Promise<boolean>((resolve) => observedSignal?.addEventListener('abort', () => resolve(true), { once: true })),
      wait(500).then(() => false),
    ]);
    assert('完整 POST body 后客户端断开 response socket，Nest/Fastify 仍把取消传到 TTS 服务', aborted === true && observedSignal?.aborted === true && clientError !== undefined);
    releaseService();

    const asrBody = JSON.stringify({ audioBase64: 'AQID', mimeType: 'audio/webm' });
    const asrClient = httpRequest({
      hostname: url.hostname,
      port: Number(url.port),
      path: '/interview/interview-a/transcribe',
      method: 'POST',
      headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(asrBody) },
    });
    let asrClientError: Error | undefined;
    let rejectAsrClientError!: (error: Error) => void;
    const asrClientFailed = new Promise<never>((_resolve, reject) => { rejectAsrClientError = reject; });
    asrClient.on('error', (error) => { asrClientError = error; rejectAsrClientError(error); });
    asrClient.once('response', (response) => {
      const chunks: Buffer[] = [];
      response.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      response.once('end', () => rejectAsrClientError(new Error(`unexpected_asr_response_${response.statusCode}:${Buffer.concat(chunks).toString('utf8')}`)));
    });
    asrClient.end(asrBody);
    await waitFor('asr_controller_not_started', Promise.race([asrStarted, asrClientFailed]));
    asrClient.destroy();
    const asrAborted = await Promise.race([
      new Promise<boolean>((resolve) => observedAsrSignal?.addEventListener('abort', () => resolve(true), { once: true })),
      wait(500).then(() => false),
    ]);
    assert('完整 POST body 后客户端断开 response socket，Nest/Fastify 会经 service seam（服务边界）中止唯一 ASR 供应商连接',
      asrAborted === true && observedAsrSignal?.aborted === true && asrProviderAbort && asrProviderCalls === 1 && asrClientError !== undefined);
  } finally {
    try { releaseService?.(); } catch { /* test cleanup */ }
    globalThis.fetch = originalFetch;
    await app.close();
  }
  console.log(`\n${failures === 0 ? '✓ 非流式语音真实 HTTP 取消合同全部通过' : `✗ ${failures} 个失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}
void main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});

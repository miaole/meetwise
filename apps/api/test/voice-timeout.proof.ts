/** TC-VOICE-01-E3：ASR 超时必须是可恢复的 504，不能被误报成泛化 502。 */
import { HttpException } from '@nestjs/common';
import { EventEmitter } from 'node:events';
import { AsrAbortedError, AsrTimeoutError } from '@meetwise/ai-runtime';
import { InterviewController } from '../src/modules/interview/interview.controller.ts';
import { InterviewService } from '../src/modules/interview/interview.service.ts';

let failures = 0;
const assert = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

async function main() {
  let queries = 0;
  const statements: string[] = [];
  const service = new InterviewService(
    { asPrincipal: async (_principal: string, fn: (c: { query: (sql: string) => Promise<unknown> }) => unknown) => fn({ query: async (sql: string) => { queries++; statements.push(sql); return { rowCount: 1, rows: [] }; } }) } as any,
    { allow: () => true } as any,
    { transcribe: async () => { throw new AsrTimeoutError(35); } },
    { synthesize: async () => new Uint8Array() },
    { id: 'test-streaming-tts', synthesizeStream: async function* () { /* not reached */ } },
  );

  let status = 0;
  let payload: any;
  try {
    await service.transcribe('candidate-a', 'interview-a', {
      audioBase64: Buffer.from([1, 2, 3]).toString('base64'),
      mimeType: 'audio/webm',
      capture: { mode: 'single_local_microphone', consent: true, policyVersion: 'voice_ephemeral_v1' },
    } as any);
  } catch (error: any) {
    if (error instanceof HttpException) {
      status = error.getStatus();
      payload = error.getResponse();
    }
  }
  assert('provider 超时映射为 504 asr_timeout，前端可切文字作答', status === 504 && payload?.error === 'asr_timeout');
  assert('超时只做归属和隐私围栏读取，不写音频、转写或业务状态', queries === 2 && statements.every((sql) => /^\s*SELECT\b/i.test(sql)));

  const cancelledService = new InterviewService(
    { asPrincipal: async (_principal: string, fn: (c: { query: () => Promise<unknown> }) => unknown) => fn({ query: async () => ({ rowCount: 1, rows: [] }) }) } as any,
    { allow: () => true } as any,
    { transcribe: async () => { throw new AsrAbortedError(); } },
    { synthesize: async () => new Uint8Array() },
    { id: 'test-streaming-tts', synthesizeStream: async function* () { /* not reached */ } },
  );
  status = 0;
  payload = undefined;
  try {
    await cancelledService.transcribe('candidate-a', 'interview-a', {
      audioBase64: Buffer.from([1, 2, 3]).toString('base64'),
      mimeType: 'audio/webm',
      capture: { mode: 'single_local_microphone', consent: true, policyVersion: 'voice_ephemeral_v1' },
    } as any);
  } catch (error: any) {
    if (error instanceof HttpException) { status = error.getStatus(); payload = error.getResponse(); }
  }
  assert('客户端取消保持 asr_cancelled，不混入 504 supplier timeout（供应商超时）', status === 499 && payload?.error === 'asr_cancelled');

  const providerAbortService = new InterviewService(
    { asPrincipal: async (_principal: string, fn: (c: { query: () => Promise<unknown> }) => unknown) => fn({ query: async () => ({ rowCount: 1, rows: [] }) }) } as any,
    { allow: () => true } as any,
    { transcribe: async () => { throw new DOMException('provider_reset', 'AbortError'); } },
    { synthesize: async () => new Uint8Array() },
    { id: 'test-streaming-tts', synthesizeStream: async function* () { /* not reached */ } },
  );
  status = 0;
  payload = undefined;
  try {
    await providerAbortService.transcribe('candidate-a', 'interview-a', {
      audioBase64: Buffer.from([1, 2, 3]).toString('base64'),
      mimeType: 'audio/webm',
      capture: { mode: 'single_local_microphone', consent: true, policyVersion: 'voice_ephemeral_v1' },
    } as any);
  } catch (error: any) {
    if (error instanceof HttpException) { status = error.getStatus(); payload = error.getResponse(); }
  }
  assert('未收到调用方取消的供应商 AbortError 映射为 502 asr_failed，绝不伪造成 499', status === 502 && payload?.error === 'asr_failed');

  const busyService = new InterviewService(
    { asPrincipal: async (_principal: string, fn: (c: { query: () => Promise<unknown> }) => unknown) => fn({ query: async () => ({ rowCount: 1, rows: [] }) }) } as any,
    { allow: () => true } as any,
    { transcribe: async () => '' },
    { synthesize: async () => { throw new Error('tts_download_capacity_exceeded'); } },
    { id: 'test-streaming-tts', synthesizeStream: async function* () { /* not reached */ } },
  );
  status = 0;
  payload = undefined;
  try {
    await busyService.speak('candidate-a', 'interview-a', { text: '请介绍一下你自己' });
  } catch (error: any) {
    if (error instanceof HttpException) {
      status = error.getStatus();
      payload = error.getResponse();
    }
  }
  assert('TTS 下载舱壁满载映射为可区分的 503 tts_busy，并提供受控重试提示', status === 503 && payload?.error === 'tts_busy' && payload?.retryAfterSeconds === 1);

  const requestRaw = new EventEmitter();
  const responseRaw = new EventEmitter();
  let receivedSignal: AbortSignal | undefined;
  let abortObserved = false;
  const controller = new InterviewController({
    speak: async (_principal: string, _id: string, _dto: unknown, options?: { signal?: AbortSignal }) => {
      receivedSignal = options?.signal;
      return await new Promise((resolve) => {
        receivedSignal?.addEventListener('abort', () => { abortObserved = true; resolve({ cancelled: true }); }, { once: true });
        setTimeout(() => resolve({ cancelled: false }), 20);
      });
    },
  } as any, {} as any);
  const cancellingSpeak = controller.speak(
    'interview-a',
    { principal: 'candidate-a', raw: requestRaw } as any,
    { raw: responseRaw } as any,
    { text: '停止' } as any,
  );
  await new Promise((resolve) => setTimeout(resolve, 0));
  responseRaw.emit('close');
  await cancellingSpeak;
  assert('客户端关闭连接会把非流式 TTS 取消信号交给应用服务', receivedSignal?.aborted === true && abortObserved);

  let serviceSignal: AbortSignal | undefined;
  const forwardingService = new InterviewService(
    { asPrincipal: async (_principal: string, fn: (c: { query: () => Promise<unknown> }) => unknown) => fn({ query: async () => ({ rowCount: 1, rows: [] }) }) } as any,
    { allow: () => true } as any,
    { transcribe: async () => '' },
    { synthesize: async (_text: string, options?: { signal?: AbortSignal }) => { serviceSignal = options?.signal; return new Uint8Array([1]); } },
    { id: 'test-streaming-tts', synthesizeStream: async function* () { /* not reached */ } },
  );
  const serviceAbort = new AbortController();
  await forwardingService.speak('candidate-a', 'interview-a', { text: '停止' }, { signal: serviceAbort.signal });
  assert('应用服务不吞掉取消信号，会把它传给 TTS 适配器', serviceSignal === serviceAbort.signal);

  console.log(`\n${failures === 0 ? '✓ 语音超时 HTTP 合同全部通过' : `✗ ${failures} 个失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}
void main();

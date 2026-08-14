/** TC-VOICE-03-E6 (Next proxy component): browser abort must reach API fetch. */
import { proxyInterviewSpeak } from '../lib/api/speak-proxy.ts';

let failures = 0;
const assert = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

async function main() {
  const controller = new AbortController();
  let observedSignal: AbortSignal | undefined;
  let abortObserved = false;
  const pending = proxyInterviewSpeak({
    apiBase: 'http://api.internal',
    interviewId: 'interview-a',
    bearerToken: 'test-token',
    body: '{"text":"停止"}',
    signal: controller.signal,
    fetchImpl: ((_url: string | URL | Request, init?: RequestInit) => {
      observedSignal = init?.signal ?? undefined;
      return new Promise<Response>((_resolve, reject) => observedSignal?.addEventListener('abort', () => {
        abortObserved = true;
        reject(new DOMException('aborted', 'AbortError'));
      }, { once: true }));
    }) as typeof fetch,
  });
  await new Promise((resolve) => setTimeout(resolve, 0));
  controller.abort();
  let rejected = false;
  try { await pending; } catch (error: any) { rejected = error?.name === 'AbortError'; }
  assert('同源代理把浏览器请求的同一 AbortSignal 传给 API fetch，并原样终止', observedSignal === controller.signal && observedSignal?.aborted === true && abortObserved && rejected);
  console.log(`\n${failures === 0 ? '✓ 非流式语音代理取消合同全部通过' : `✗ ${failures} 个失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}
void main();

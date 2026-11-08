/** TC-VOICE-01-E6: browser cancellation reaches the ASR API request. */
import { proxyInterviewTranscribe } from '../lib/api/transcribe-proxy.ts';

let failures = 0;
const assert = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

async function main() {
  const controller = new AbortController();
  let observedSignal: AbortSignal | undefined;
  let abortObserved = false;
  const pending = proxyInterviewTranscribe({
    apiBase: 'http://api.internal',
    interviewId: 'interview-a',
    bearerToken: 'test-token',
    body: '{"audioBase64":"AQID","mimeType":"audio/webm"}',
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
  assert('同源 ASR 代理把浏览器请求的同一 AbortSignal 传给 API fetch，并原样终止', observedSignal === controller.signal && observedSignal?.aborted === true && abortObserved && rejected);

  // ── #66/API-HARDEN-A 韧性臂 ──
  // ⑥ 上游网络抛错 → 502 upstream_unavailable JSON(修前:fetch 抛错穿透 route → Next 500)。
  const down = await proxyInterviewTranscribe({
    apiBase: 'http://api.internal', interviewId: 'interview-a', bearerToken: 'tok',
    body: '{}', signal: new AbortController().signal,
    fetchImpl: (async () => { throw new TypeError('fetch failed'); }) as typeof fetch,
  });
  const bDown = await down.json().catch(() => ({}));
  assert('ASR 代理上游网络抛错 → 502 upstream_unavailable JSON', down.status === 502 && bDown?.error === 'upstream_unavailable');

  // ⑦ 首包超时 → 502 upstream_unavailable(TimeoutError 收敛;组合信号转发给 fetch)。
  {
    let observed: AbortSignal | undefined;
    const t0 = Date.now();
    const timed = await proxyInterviewTranscribe({
      apiBase: 'http://api.internal', interviewId: 'interview-a', bearerToken: 'tok',
      body: '{}', signal: new AbortController().signal, timeoutMs: 20,
      fetchImpl: ((_url: string | URL | Request, init?: RequestInit) => {
        observed = init?.signal ?? undefined;
        // 模拟真 fetch 中止语义 + keep-alive 占住事件循环(AbortSignal.timeout 内计时器不保活)。
        const s = init?.signal;
        const keep = setInterval(() => {}, 1000);
        return new Promise<Response>((_res, reject) => {
          const die = () => { clearInterval(keep); reject(s!.reason); };
          if (s?.aborted) die();
          else s?.addEventListener('abort', die, { once: true });
        });
      }) as typeof fetch,
    });
    const bTimed = await timed.json().catch(() => ({}));
    assert('ASR 代理首包超时 → 502 upstream_unavailable(组合信号转发)',
      timed.status === 502 && bTimed?.error === 'upstream_unavailable' && Date.now() - t0 < 2000 && observed?.aborted === true);
  }

  // ⑧ 未传 timeoutMs 时取消合同不变:转发信号与入参同一实例(身份断言与首臂逐字同形)。
  {
    const c2 = new AbortController();
    let observed2: AbortSignal | undefined;
    const p2 = proxyInterviewTranscribe({
      apiBase: 'http://api.internal', interviewId: 'interview-a', bearerToken: 'tok',
      body: '{}', signal: c2.signal,
      fetchImpl: ((_url: string | URL | Request, init?: RequestInit) => {
        observed2 = init?.signal ?? undefined;
        return new Promise<Response>((_res, reject) => observed2?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true }));
      }) as typeof fetch,
    });
    await new Promise((r) => setTimeout(r, 0));
    c2.abort();
    let rejected2 = false;
    try { await p2; } catch (e) { rejected2 = (e as { name?: string })?.name === 'AbortError'; }
    assert('ASR 代理无 timeoutMs → 信号同一性取消合同零变化', observed2 === c2.signal && rejected2);
  }

  console.log(`\n${failures === 0 ? '✓ ASR 代理取消合同全部通过' : `✗ ${failures} 个失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}
void main();

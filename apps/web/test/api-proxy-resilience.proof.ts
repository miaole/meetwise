/**
 * #66/API-HARDEN-A 同源代理韧性合同证明(离线·注入 fetchImpl·沿 transcribe-proxy.proof 形):
 *   turn/events 两个 Next 同源代理把「上游网络失败/超时」收敛成确定性 502 信封,不再把
 *   fetch 抛错漏成 Next 500;上游 HTTP 应答(含 4xx/429/5xx)仍原样透传(合法请求行为零变化);
 *   客户端取消(AbortError)保持既有拒绝语义(TC-VOICE-01-E6 同族合同)。
 *   pnpm -C apps/web prove:api-proxy-resilience
 */
import { proxyInterviewTurn } from '../lib/api/turn-proxy.ts';
import { openInterviewEventsUpstream } from '../lib/api/events-proxy.ts';

let failures = 0;
const assert = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

const never = () => new Promise<Response>(() => {});
/** 模拟真 fetch 的中止语义:组合信号一旦 abort 即按 abort reason 拒绝(undici 同形)。
 *  keep-alive 定时器仅为本进程占住事件循环(AbortSignal.timeout 的内计时器不保活事件循环,
 *  真服务端由在途 HTTP 请求天然保活——离线证明需要替身)。 */
const hangOnSignal = (_url: string | URL | Request, init?: RequestInit) =>
  new Promise<Response>((_res, reject) => {
    const s = init?.signal;
    const keep = setInterval(() => {}, 1000);
    if (s?.aborted) { clearInterval(keep); reject(s.reason); return; }
    s?.addEventListener('abort', () => { clearInterval(keep); reject(s.reason); }, { once: true });
  });

async function main() {
  // ── turn 代理 ──
  // ① 上游 200 → 原样透传(status/body/content-type)。
  const up200 = await proxyInterviewTurn({
    apiBase: 'http://api.internal', interviewId: 'iv-1', bearerToken: 'tok',
    body: '{"turn":0,"answer":"答案"}', idempotencyKey: 'idem-1', signal: new AbortController().signal,
    fetchImpl: (async () => new Response('{"accepted":true}', { status: 202, headers: { 'content-type': 'application/json' } })) as typeof fetch,
  });
  assert('turn/上游202 → 透传 202 + JSON 体 + content-type',
    up200.status === 202 && (await up200.text()) === '{"accepted":true}' && up200.headers.get('content-type') === 'application/json');

  // ② 上游 429 JSON(限流具名词)→ 原样透传,不吞不改写(客户端按既有 429 分支消费)。
  const up429 = await proxyInterviewTurn({
    apiBase: 'http://api.internal', interviewId: 'iv-1', bearerToken: 'tok',
    body: '{}', idempotencyKey: 'idem-2', signal: new AbortController().signal,
    fetchImpl: (async () => Response.json({ error: 'too_many_requests' }, { status: 429 })) as typeof fetch,
  });
  const b429 = await up429.json().catch(() => ({}));
  assert('turn/上游429 → 原样透传 429 too_many_requests', up429.status === 429 && b429?.error === 'too_many_requests');

  // ③ 上游网络抛错(API 不可达)→ 确定性 502 upstream_unavailable JSON(修前:fetch 抛错漏成 Next 500)。
  const down = await proxyInterviewTurn({
    apiBase: 'http://api.internal', interviewId: 'iv-1', bearerToken: 'tok',
    body: '{}', idempotencyKey: 'idem-3', signal: new AbortController().signal,
    fetchImpl: (async () => { throw new TypeError('fetch failed'); }) as typeof fetch,
  });
  const bDown = await down.json().catch(() => ({}));
  assert('turn/上游网络抛错 → 502 upstream_unavailable JSON', down.status === 502 && bDown?.error === 'upstream_unavailable');

  // ④ 超时:上游首包挂死 → 502 upstream_unavailable(TimeoutError 收敛),且 fetch 收到组合信号。
  {
    let observed: AbortSignal | undefined;
    const t0 = Date.now();
    const timed = await proxyInterviewTurn({
      apiBase: 'http://api.internal', interviewId: 'iv-1', bearerToken: 'tok',
      body: '{}', idempotencyKey: 'idem-4', signal: new AbortController().signal, timeoutMs: 20,
      fetchImpl: ((_url: string | URL | Request, init?: RequestInit) => {
        observed = init?.signal ?? undefined;
        return hangOnSignal(_url, init);
      }) as typeof fetch,
    });
    const elapsed = Date.now() - t0;
    const bTimed = await timed.json().catch(() => ({}));
    assert('turn/首包超时 → 502 upstream_unavailable(快速返回,不等死等)',
      timed.status === 502 && bTimed?.error === 'upstream_unavailable' && elapsed < 2000 && observed?.aborted === true);
  }

  // ⑤ 客户端取消 → AbortError 原样抛(同族取消合同;上游被组合信号终止)。
  {
    const client = new AbortController();
    let observed: AbortSignal | undefined;
    const pending = proxyInterviewTurn({
      apiBase: 'http://api.internal', interviewId: 'iv-1', bearerToken: 'tok',
      body: '{}', idempotencyKey: 'idem-5', signal: client.signal,
      fetchImpl: ((_url: string | URL | Request, init?: RequestInit) => {
        observed = init?.signal ?? undefined;
        return new Promise<Response>((_res, reject) => observed?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true }));
      }) as typeof fetch,
    });
    await new Promise((r) => setTimeout(r, 0));
    client.abort();
    let aborted = false;
    try { await pending; } catch (e: any) { aborted = e?.name === 'AbortError'; }
    assert('turn/客户端取消 → AbortError 原样抛 + 组合信号转发', aborted && observed?.aborted === true);
  }

  // ── events 代理(上游打开缝)──
  // ⑥ 上游 200 SSE → 原样透传 Response(流体不因 TTFB 计时器被误杀)。
  {
    const upstream = await openInterviewEventsUpstream({
      apiBase: 'http://api.internal', interviewId: 'iv-1', bearerToken: 'tok',
      clientSignal: new AbortController().signal, ttfbTimeoutMs: 20,
      fetchImpl: (async () => new Response('data: {"kind":"question_ready"}\n\n', { status: 200, headers: { 'content-type': 'text/event-stream' } })) as typeof fetch,
    });
    assert('events/上游200 → 原样透传 SSE Response', upstream.status === 200 && upstream.headers.get('content-type') === 'text/event-stream');
    assert('events/头到达后计时器已清(体可完整读取)', (await upstream.text()).includes('question_ready'));
  }

  // ⑦ 上游 401 → 原样透传(sseProxyFailureResponse 的 non-OK 映射仍在 route,缝只透传)。
  const up401 = await openInterviewEventsUpstream({
    apiBase: 'http://api.internal', interviewId: 'iv-1', bearerToken: 'tok',
    clientSignal: new AbortController().signal, ttfbTimeoutMs: 1000,
    fetchImpl: (async () => new Response('unauthorized', { status: 401 })) as typeof fetch,
  });
  assert('events/上游401 → 原样透传 401(非 OK 映射留 route)', up401.status === 401);

  // ⑧ 上游网络抛错 → 502 stream_unavailable 文本信封(修前:fetch 抛错未接 → Next 500)。
  const evDown = await openInterviewEventsUpstream({
    apiBase: 'http://api.internal', interviewId: 'iv-1', bearerToken: 'tok',
    clientSignal: new AbortController().signal, ttfbTimeoutMs: 1000,
    fetchImpl: (async () => { throw new TypeError('fetch failed'); }) as typeof fetch,
  });
  assert('events/网络抛错 → 502 stream_unavailable 文本', evDown.status === 502 && (await evDown.text()) === 'stream_unavailable');

  // ⑨ 首包超时(TTFB)→ 502 stream_unavailable;头到达慢于超时即判死,计时器不杀已建立的流(⑥对照)。
  {
    const t0 = Date.now();
    const evTimed = await openInterviewEventsUpstream({
      apiBase: 'http://api.internal', interviewId: 'iv-1', bearerToken: 'tok',
      clientSignal: new AbortController().signal, ttfbTimeoutMs: 20,
      fetchImpl: ((_url: string | URL | Request, init?: RequestInit) => hangOnSignal(_url, init)) as typeof fetch,
    });
    assert('events/首包超时 → 502 stream_unavailable(快速返回)',
      evTimed.status === 502 && (await evTimed.text()) === 'stream_unavailable' && Date.now() - t0 < 2000);
  }

  // ⑩ 客户端取消 → AbortError 原样抛(修前语义:客户端断开终止上游 fetch;零变化)。
  {
    const client = new AbortController();
    const pending = openInterviewEventsUpstream({
      apiBase: 'http://api.internal', interviewId: 'iv-1', bearerToken: 'tok',
      clientSignal: client.signal, ttfbTimeoutMs: 5000,
      fetchImpl: ((_url: string | URL | Request, init?: RequestInit) => {
        const s = init?.signal;
        return new Promise<Response>((_res, reject) => s?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true }));
      }) as typeof fetch,
    });
    await new Promise((r) => setTimeout(r, 0));
    client.abort();
    let aborted = false;
    try { await pending; } catch (e: any) { aborted = e?.name === 'AbortError'; }
    assert('events/客户端取消 → AbortError 原样抛(取消语义零变化)', aborted);
  }

  console.log(`\n${failures === 0 ? '✓ 同源代理韧性合同全部通过' : `✗ ${failures} 个失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}
void main();

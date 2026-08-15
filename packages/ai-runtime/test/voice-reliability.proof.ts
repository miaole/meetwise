/**
 * TC-VOICE-01-main / E3 / E5 / E6.
 * 确定性适配器合同，不冒充真实供应商、云网络或浏览器端到端测试证据。
 */
import { EventEmitter } from 'node:events';
import {
  ASR_REQUEST_TIMEOUT_MS,
  AsrAbortedError,
  MAX_TTS_AUDIO_BYTES,
  createTtsDownloadAdmission,
  dashscopeAsr,
  dashscopeTts,
  downloadDashscopeTtsAudio,
  isForbiddenTtsDownloadAddress,
  validateDashscopeTtsAudioUrl,
} from '../src/index.ts';

// This proof deliberately injects fake provider transports. The production and
// development factories reject such key/endpoint overrides; the seam exists
// only for this isolated Node test process.
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
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const NOW = 1_800_000_000_000;
const safeAudioUrl = (host = 'dashscope-result-bj.oss-cn-beijing.aliyuncs.com') =>
  `http://${host}/audio.wav?Expires=${Math.floor(NOW / 1000) + 600}&OSSAccessKeyId=test-key&Signature=test-signature`;

async function messageOf(action: () => Promise<unknown>): Promise<string> {
  try { await action(); return 'no_error'; }
  catch (error: any) { return String(error?.message); }
}

function fakeTtsRequest(options: {
  status?: number;
  headers?: Record<string, string>;
  chunks?: Uint8Array[];
  onRequest?: (url: URL, requestOptions: any) => void;
}) {
  return ((url: URL, requestOptions: any, onResponse: (response: any) => void) => {
    options.onRequest?.(url, requestOptions);
    const request = new EventEmitter() as any;
    request.setTimeout = () => request;
    request.destroy = () => request;
    request.end = () => queueMicrotask(() => {
      const response = new EventEmitter() as any;
      response.statusCode = options.status ?? 200;
      response.headers = options.headers ?? { 'content-type': 'audio/wav', 'content-length': String((options.chunks ?? [new Uint8Array([1, 2, 3])]).reduce((total, chunk) => total + chunk.byteLength, 0)) };
      response.resume = () => undefined;
      response.destroy = () => undefined;
      onResponse(response);
      for (const chunk of options.chunks ?? [new Uint8Array([1, 2, 3])]) response.emit('data', chunk);
      response.emit('end');
    });
    return request;
  }) as any;
}

function firstByteStallingRequest(onDestroy: () => void) {
  return ((_url: URL, _requestOptions: any, _onResponse: (response: any) => void) => {
    const request = new EventEmitter() as any;
    request.setTimeout = () => request;
    request.destroy = () => { onDestroy(); return request; };
    request.end = () => undefined;
    return request;
  }) as any;
}

function slowStreamingRequest(onDestroy: () => void) {
  return ((_url: URL, _requestOptions: any, onResponse: (response: any) => void) => {
    const request = new EventEmitter() as any;
    let interval: ReturnType<typeof setInterval> | undefined;
    let response: any;
    request.setTimeout = () => request;
    request.destroy = () => {
      if (interval !== undefined) clearInterval(interval);
      onDestroy();
      response?.emit('error', new Error('closed'));
      return request;
    };
    request.end = () => queueMicrotask(() => {
      response = new EventEmitter() as any;
      response.statusCode = 200;
      response.headers = { 'content-type': 'audio/wav' };
      response.resume = () => undefined;
      response.destroy = () => undefined;
      onResponse(response);
      interval = setInterval(() => response.emit('data', new Uint8Array([1])), 5);
    });
    return request;
  }) as any;
}

function idleTimeoutRequest(onDestroy: () => void) {
  return ((_url: URL, _requestOptions: any, _onResponse: (response: any) => void) => {
    const request = new EventEmitter() as any;
    request.setTimeout = (timeoutMs: number, callback: () => void) => {
      setTimeout(callback, timeoutMs);
      return request;
    };
    request.destroy = () => { onDestroy(); return request; };
    request.end = () => undefined;
    return request;
  }) as any;
}

function headersThenNeverEndingJson(stats: { fetchSignalsAborted: number }) {
  return ((_url: string | URL | Request, init?: RequestInit) => {
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        init?.signal?.addEventListener('abort', () => {
          stats.fetchSignalsAborted++;
          controller.error(init.signal?.reason ?? new DOMException('aborted', 'AbortError'));
        }, { once: true });
      },
    });
    return Promise.resolve(new Response(body, { status: 200, headers: { 'content-type': 'application/json' } }));
  }) as typeof fetch;
}

async function settleWithin(action: Promise<unknown>, ms: number): Promise<string> {
  return await Promise.race([
    action.then(() => 'resolved', (error: any) => String(error?.message)),
    new Promise<string>((resolve) => setTimeout(() => resolve('still_pending'), ms)),
  ]);
}

async function main() {
  assert('默认 ASR 单次预算为 75 秒，而非全局 HTTP 30 秒', ASR_REQUEST_TIMEOUT_MS === 75_000);

  const originalFetch = globalThis.fetch;
  let calls = 0;
  let aborted = false;
  try {
    globalThis.fetch = ((_: string | URL | Request, init?: RequestInit) => {
      calls++;
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          aborted = true;
          reject(init.signal?.reason ?? new DOMException('aborted', 'AbortError'));
        }, { once: true });
      });
    }) as typeof fetch;

    let timedOut = false;
    const started = Date.now();
    try {
      await dashscopeAsr({ baseUrl: 'https://provider.invalid', apiKey: 'test-key', timeoutMs: 35 })
        .transcribe(new Uint8Array([1, 2, 3]), { format: 'webm' });
    } catch (error: any) {
      timedOut = error?.message === 'asr_timeout' && error?.timeoutMs === 35;
    }
    const elapsed = Date.now() - started;
    assert('测试预算会真实 abort 外部连接并归类为 asr_timeout', timedOut && aborted && elapsed >= 25 && elapsed < 500);
    assert('超时路径不盲重试，供应商调用数恰为 1', calls === 1);
  } finally {
    globalThis.fetch = originalFetch;
  }

  const asrBodyStall = { fetchSignalsAborted: 0 };
  try {
    globalThis.fetch = headersThenNeverEndingJson(asrBodyStall);
    const asrError = await settleWithin(
      dashscopeAsr({ baseUrl: 'https://provider.invalid', apiKey: 'test-key', timeoutMs: 25 })
        .transcribe(new Uint8Array([1, 2, 3]), { format: 'webm' }),
      500,
    );
    assert('ASR 响应头已到但 JSON 正文卡住时，75 秒路径同样由单次预算中止', asrError === 'asr_timeout' && asrBodyStall.fetchSignalsAborted === 1);
  } finally {
    globalThis.fetch = originalFetch;
  }

  let asrCancelCalls = 0;
  let asrCancelSignalSeen = false;
  try {
    globalThis.fetch = ((_url: string | URL | Request, init?: RequestInit) => {
      asrCancelCalls++;
      return new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener('abort', () => {
        asrCancelSignalSeen = true;
        reject(init.signal?.reason ?? new DOMException('aborted', 'AbortError'));
      }, { once: true }));
    }) as typeof fetch;
    const caller = new AbortController();
    const pending = dashscopeAsr({ baseUrl: 'https://provider.invalid', apiKey: 'test-key', timeoutMs: 500 })
      .transcribe(new Uint8Array([1, 2, 3]), { format: 'webm', signal: caller.signal });
    await wait(10);
    caller.abort();
    let classified = false;
    try { await pending; } catch (error) { classified = error instanceof AsrAbortedError && error.message === 'asr_aborted'; }
    assert('客户端取消 ASR 会终止唯一供应商请求并保持 asr_aborted，不伪装为超时', classified && asrCancelSignalSeen && asrCancelCalls === 1);
  } finally {
    globalThis.fetch = originalFetch;
  }

  const providerFirstAbort = new AbortController();
  try {
    globalThis.fetch = ((_url: string | URL | Request, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      queueMicrotask(() => {
        reject(new DOMException('provider_reset', 'AbortError'));
        providerFirstAbort.abort();
      });
      // Deliberately do not replace the provider rejection with the caller's
      // signal.  The provider failure happened first in this same turn.
      init?.signal?.addEventListener('abort', () => undefined, { once: true });
    })) as typeof fetch;
    const providerFirst = await messageOf(() => dashscopeAsr({ baseUrl: 'https://provider.invalid', apiKey: 'test-key', timeoutMs: 500 })
      .transcribe(new Uint8Array([1, 2, 3]), { format: 'webm', signal: providerFirstAbort.signal }));
    assert('供应商 AbortError 先发生、同一轮随后用户取消时仍保留供应商首因，不误报 asr_aborted', providerFirst === 'provider_reset');
  } finally {
    globalThis.fetch = originalFetch;
  }

  try {
    globalThis.fetch = (() => Promise.reject(new DOMException('provider_reset', 'AbortError'))) as typeof fetch;
    const providerAsrAbort = await messageOf(() => dashscopeAsr({ baseUrl: 'https://provider.invalid', apiKey: 'test-key', timeoutMs: 500 })
      .transcribe(new Uint8Array([1, 2, 3]), { format: 'webm' }));
    const providerTtsAbort = await messageOf(() => dashscopeTts({ apiKey: 'test-key', admission: createTtsDownloadAdmission({ maxConcurrent: 1, maxQueued: 0 }) })
      .synthesize('供应商连接被重置'));
    assert('未收到调用方取消时，供应商 AbortError 不会伪装为 ASR/TTS 用户取消或 HTTP 499', providerAsrAbort === 'provider_reset' && providerTtsAbort === 'provider_reset');
  } finally {
    globalThis.fetch = originalFetch;
  }

  const jsonAdmission = createTtsDownloadAdmission({ maxConcurrent: 1, maxQueued: 0 });
  let errorResponseCancelled = 0;
  try {
    globalThis.fetch = (() => {
      const body = new ReadableStream<Uint8Array>({ cancel() { errorResponseCancelled++; } });
      return Promise.resolve(new Response(body, { status: 503, headers: { 'content-type': 'application/json' } }));
    }) as typeof fetch;
    const httpError = await messageOf(() => dashscopeTts({ apiKey: 'test-key', admission: jsonAdmission }).synthesize('固定测试文本'));
    const released = await Promise.race([jsonAdmission.acquire(), wait(100).then(() => undefined)]);
    released?.();
    assert('首次 TTS 非 2xx JSON 响应会取消正文、保留状态语义并释放准入槽', httpError === 'tts_http_503' && errorResponseCancelled === 1 && typeof released === 'function');
  } finally {
    globalThis.fetch = originalFetch;
  }

  const jsonNegativeAdmission = createTtsDownloadAdmission({ maxConcurrent: 1, maxQueued: 0 });
  let wrongMimeCancelled = 0;
  let chunkedCancelled = 0;
  const unhandled: unknown[] = [];
  const onUnhandled = (error: unknown) => unhandled.push(error);
  process.on('unhandledRejection', onUnhandled);
  try {
    globalThis.fetch = (() => {
      const body = new ReadableStream<Uint8Array>({ cancel() { wrongMimeCancelled++; } });
      return Promise.resolve(new Response(body, { status: 200, headers: { 'content-type': 'text/html' } }));
    }) as typeof fetch;
    const wrongMime = await messageOf(() => dashscopeTts({ apiKey: 'test-key', admission: jsonNegativeAdmission }).synthesize('固定测试文本'));
    const afterWrongMime = await jsonNegativeAdmission.acquire(); afterWrongMime();

    globalThis.fetch = (() => {
      const body = new ReadableStream<Uint8Array>({
        start(controller) { controller.enqueue(new Uint8Array(256 * 1024 + 1)); },
        cancel() { chunkedCancelled++; },
      });
      return Promise.resolve(new Response(body, { status: 200, headers: { 'content-type': 'application/json' } }));
    }) as typeof fetch;
    const chunkedOversize = await messageOf(() => dashscopeTts({ apiKey: 'test-key', admission: jsonNegativeAdmission }).synthesize('固定测试文本'));
    const afterChunkedOversize = await jsonNegativeAdmission.acquire(); afterChunkedOversize();

    globalThis.fetch = (() => Promise.resolve(new Response('{', { status: 200, headers: { 'content-type': 'application/json' } }))) as typeof fetch;
    const malformed = await messageOf(() => dashscopeTts({ apiKey: 'test-key', admission: jsonNegativeAdmission }).synthesize('固定测试文本'));
    const afterMalformed = await jsonNegativeAdmission.acquire(); afterMalformed();

    globalThis.fetch = (() => {
      const body = new ReadableStream<Uint8Array>({ start(controller) { controller.error(new Error('provider_reader_failed')); } });
      return Promise.resolve(new Response(body, { status: 200, headers: { 'content-type': 'application/json' } }));
    }) as typeof fetch;
    const readerError = await messageOf(() => dashscopeTts({ apiKey: 'test-key', admission: jsonNegativeAdmission }).synthesize('固定测试文本'));
    const afterReaderError = await jsonNegativeAdmission.acquire(); afterReaderError();
    let hangingBodyCancelCalls = 0;
    globalThis.fetch = (() => {
      const body = new ReadableStream<Uint8Array>({ cancel() { hangingBodyCancelCalls++; return new Promise<void>(() => undefined); } });
      return Promise.resolve(new Response(body, { status: 200, headers: { 'content-type': 'text/html' } }));
    }) as typeof fetch;
    const hangingBodyCancel = await settleWithin(
      dashscopeTts({ apiKey: 'test-key', admission: jsonNegativeAdmission }).synthesize('固定测试文本'),
      100,
    );
    const afterHangingBodyCancel = await Promise.race([jsonNegativeAdmission.acquire(), wait(100).then(() => undefined)]);
    afterHangingBodyCancel?.();

    let hangingReaderCancelCalls = 0;
    globalThis.fetch = (() => {
      const body = new ReadableStream<Uint8Array>({
        start(controller) { controller.enqueue(new Uint8Array(256 * 1024 + 1)); },
        cancel() { hangingReaderCancelCalls++; return new Promise<void>(() => undefined); },
      });
      return Promise.resolve(new Response(body, { status: 200, headers: { 'content-type': 'application/json' } }));
    }) as typeof fetch;
    const hangingReaderCancel = await settleWithin(
      dashscopeTts({ apiKey: 'test-key', admission: jsonNegativeAdmission }).synthesize('固定测试文本'),
      100,
    );
    const afterHangingReaderCancel = await Promise.race([jsonNegativeAdmission.acquire(), wait(100).then(() => undefined)]);
    afterHangingReaderCancel?.();
    await wait(10);
    assert('首次供应商 JSON 的错误 MIME、分块超限、畸形正文、reader 异常与永不结束清理均快速收口且无未处理拒绝',
      wrongMime === 'external_response_content_type_invalid' && wrongMimeCancelled === 1
      && chunkedOversize === 'external_response_body_too_large' && chunkedCancelled === 1
      && malformed === 'external_response_json_invalid' && readerError === 'provider_reader_failed'
      && hangingBodyCancel === 'external_response_content_type_invalid' && hangingBodyCancelCalls === 1 && typeof afterHangingBodyCancel === 'function'
      && hangingReaderCancel === 'external_response_body_too_large' && hangingReaderCancelCalls === 1 && typeof afterHangingReaderCancel === 'function'
      && unhandled.length === 0);
  } finally {
    process.off('unhandledRejection', onUnhandled);
    globalThis.fetch = originalFetch;
  }

  try {
    globalThis.fetch = (() => Promise.resolve(new Response('{}', {
      status: 200,
      headers: { 'content-type': 'application/json', 'content-length': String(256 * 1024 + 1) },
    }))) as typeof fetch;
    const tooLarge = await messageOf(() => dashscopeTts({ apiKey: 'test-key', admission: jsonAdmission }).synthesize('固定测试文本'));
    const released = await Promise.race([jsonAdmission.acquire(), wait(100).then(() => undefined)]);
    released?.();
    assert('首次 TTS JSON 声明长度超过 256 KiB（千字节）在下载前拒绝并释放槽位', tooLarge === 'external_response_body_too_large' && typeof released === 'function');
  } finally {
    globalThis.fetch = originalFetch;
  }

  let invalidRejected = false;
  try { dashscopeAsr({ baseUrl: 'x', apiKey: 'y', timeoutMs: 0 }); } catch (error: any) { invalidRejected = error?.message === 'invalid_asr_timeout'; }
  assert('无效预算 fail-closed，不会退化为无限等待', invalidRejected);

  const normalized = validateDashscopeTtsAudioUrl(safeAudioUrl(), Math.floor(NOW / 1000) + 600, NOW);
  assert('TTS 仅把精确允许 host 的旧 HTTP 结果 URL 升级为 HTTPS', normalized.protocol === 'https:' && normalized.hostname === 'dashscope-result-bj.oss-cn-beijing.aliyuncs.com');

  let validRequests = 0;
  let pinnedAddress = '';
  const validAudio = await downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
    now: () => NOW,
    lookup: async () => [{ address: '8.8.8.8', family: 4 }],
    request: fakeTtsRequest({
      chunks: [new Uint8Array([7, 8]), new Uint8Array([9])],
      onRequest: (url, requestOptions) => {
        validRequests++;
        requestOptions.lookup(url.hostname, {}, (_error: Error | null, address: string) => { pinnedAddress = address; });
        pinnedAddress = requestOptions.rejectUnauthorized === true ? pinnedAddress : 'tls_verification_missing';
      },
    }),
  });
  assert('合法 TTS 音频只经一次 HTTPS 固定公网地址连接、显式验证 TLS 并完整返回', validRequests === 1 && pinnedAddress === '8.8.8.8' && Buffer.from(validAudio).equals(Buffer.from([7, 8, 9])));

  let rejectedConnections = 0;
  const noConnectionRequest = fakeTtsRequest({ onRequest: () => { rejectedConnections++; } });
  const maliciousHost = await messageOf(() => downloadDashscopeTtsAudio(safeAudioUrl('169.254.169.254'), Math.floor(NOW / 1000) + 600, { now: () => NOW, request: noConnectionRequest }));
  const userInfo = await messageOf(() => downloadDashscopeTtsAudio(`https://attacker@dashscope-result-bj.oss-cn-beijing.aliyuncs.com/audio.wav?Expires=${Math.floor(NOW / 1000) + 600}&OSSAccessKeyId=x&Signature=y`, Math.floor(NOW / 1000) + 600, { now: () => NOW, request: noConnectionRequest }));
  const expired = await messageOf(() => downloadDashscopeTtsAudio(`https://dashscope-result-bj.oss-cn-beijing.aliyuncs.com/audio.wav?Expires=${Math.floor(NOW / 1000) - 1}&OSSAccessKeyId=x&Signature=y`, Math.floor(NOW / 1000) - 1, { now: () => NOW, request: noConnectionRequest }));
  assert('恶意 host、userinfo、过期签名均在连接前拒绝且错误不泄露 URL', rejectedConnections === 0 && maliciousHost === 'tts_download_host_rejected' && userInfo === 'tts_download_userinfo_rejected' && expired === 'tts_download_signature_or_expiry_rejected');

  const nonCanonicalPrivateAddresses = ['0:0:0:0:0:0:0:1', '0:0:0:0:0:ffff:127.0.0.1', '::127.0.0.1', '::192.168.1.1'];
  const privateDns = await Promise.all(nonCanonicalPrivateAddresses.map((address) => messageOf(() => downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
    now: () => NOW,
    lookup: async () => [{ address, family: 6 }],
    request: noConnectionRequest,
  }))));
  assert('DNS 私网、IPv4-mapped 与非规范 IPv6 写法均在 request 前失败关闭', nonCanonicalPrivateAddresses.every(isForbiddenTtsDownloadAddress) && privateDns.every((error) => error === 'tts_download_dns_address_rejected') && rejectedConnections === 0);

  let dnsDeadlineConnections = 0;
  const dnsDeadline = await messageOf(() => downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
    now: () => NOW,
    lookup: async () => await new Promise<any>(() => undefined),
    request: fakeTtsRequest({ onRequest: () => { dnsDeadlineConnections++; } }),
    deadlineMs: 25,
    idleTimeoutMs: 10,
  }));
  let firstByteDestroyed = 0;
  const firstByteDeadline = await messageOf(() => downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
    now: () => NOW,
    lookup: async () => [{ address: '8.8.8.8', family: 4 }],
    request: firstByteStallingRequest(() => { firstByteDestroyed++; }),
    deadlineMs: 25,
    idleTimeoutMs: 100,
  }));
  let slowDestroyed = 0;
  const slowStarted = Date.now();
  const slowDeadline = await messageOf(() => downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
    now: () => NOW,
    lookup: async () => [{ address: '8.8.8.8', family: 4 }],
    request: slowStreamingRequest(() => { slowDestroyed++; }),
    deadlineMs: 35,
    idleTimeoutMs: 100,
  }));
  const slowElapsed = Date.now() - slowStarted;
  assert('DNS、首字节和持续慢分块共享不可续期总截止时间，已启动连接恰好销毁一次', dnsDeadline === 'tts_download_deadline_exceeded' && dnsDeadlineConnections === 0 && firstByteDeadline === 'tts_download_deadline_exceeded' && firstByteDestroyed === 1 && slowDeadline === 'tts_download_deadline_exceeded' && slowDestroyed === 1 && slowElapsed >= 20 && slowElapsed < 500);

  let idleDestroyed = 0;
  const idleTimeout = await messageOf(() => downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
    now: () => NOW,
    lookup: async () => [{ address: '8.8.8.8', family: 4 }],
    request: idleTimeoutRequest(() => { idleDestroyed++; }),
    deadlineMs: 100,
    idleTimeoutMs: 15,
  }));
  await new Promise((resolve) => setTimeout(resolve, 110));
  assert('空闲超时主动销毁连接且已清除总截止时间', idleTimeout === 'tts_download_idle_timeout' && idleDestroyed === 1);

  const cancellationAdmission = createTtsDownloadAdmission({ maxConcurrent: 1, maxQueued: 0 });
  const cancellation = new AbortController();
  let cancellationDestroyed = 0;
  const cancelledDownload = downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
    now: () => NOW,
    lookup: async () => [{ address: '8.8.8.8', family: 4 }],
    request: firstByteStallingRequest(() => { cancellationDestroyed++; }),
    deadlineMs: 100,
    idleTimeoutMs: 100,
    admission: cancellationAdmission,
    signal: cancellation.signal,
  } as any);
  await new Promise((resolve) => setTimeout(resolve, 0));
  cancellation.abort();
  const cancellationError = await messageOf(() => cancelledDownload);
  const afterCancellation = await downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
    now: () => NOW,
    lookup: async () => [{ address: '8.8.8.8', family: 4 }],
    request: fakeTtsRequest({}),
    admission: cancellationAdmission,
  });
  assert('客户端取消会销毁下载连接、不返回迟到字节并立即释放准入租约', cancellationError === 'tts_download_aborted' && cancellationDestroyed === 1 && afterCancellation.byteLength === 3);

  let redirectRequests = 0;
  const redirected = await messageOf(() => downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
    now: () => NOW,
    lookup: async () => [{ address: '8.8.8.8', family: 4 }],
    request: fakeTtsRequest({ status: 302, onRequest: () => { redirectRequests++; } }),
  }));
  assert('TTS 下载不跟随重定向，只有一跳连接', redirected === 'tts_download_redirect_rejected' && redirectRequests === 1);

  const mimeRejected = await messageOf(() => downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
    now: () => NOW,
    lookup: async () => [{ address: '8.8.8.8', family: 4 }],
    request: fakeTtsRequest({ headers: { 'content-type': 'text/html', 'content-length': '3' } }),
  }));
  const lengthRejected = await messageOf(() => downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
    now: () => NOW,
    lookup: async () => [{ address: '8.8.8.8', family: 4 }],
    request: fakeTtsRequest({ headers: { 'content-type': 'audio/wav', 'content-length': String(MAX_TTS_AUDIO_BYTES + 1) } }),
  }));
  const streamedLengthRejected = await messageOf(() => downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
    now: () => NOW,
    lookup: async () => [{ address: '8.8.8.8', family: 4 }],
    request: fakeTtsRequest({ headers: { 'content-type': 'audio/wav' }, chunks: [new Uint8Array(MAX_TTS_AUDIO_BYTES + 1)] }),
  }));
  assert('错误 MIME、超大声明长度或无长度的超大分块均不返回部分音频', mimeRejected === 'tts_download_content_type_rejected' && lengthRejected === 'tts_download_content_length_exceeded' && streamedLengthRejected === 'tts_download_body_exceeded');

  let concurrentConnections = 0;
  const concurrent = await Promise.all(Array.from({ length: 20 }, () => downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
    now: () => NOW,
    lookup: async () => [{ address: '8.8.8.8', family: 4 }],
    request: fakeTtsRequest({ onRequest: () => { concurrentConnections++; } }),
    admission: createTtsDownloadAdmission({ maxConcurrent: 20, maxQueued: 0 }),
  })));
  assert('20 个合法下载在显式测试预算下各自独立受限，恰有 20 次连接且无共享状态', concurrentConnections === 20 && concurrent.every((audio) => audio.byteLength === 3));

  const fullAdmission = createTtsDownloadAdmission({ maxConcurrent: 1, maxQueued: 0 });
  const heldLease = await fullAdmission.acquire();
  let capacityConnections = 0;
  const capacityError = await messageOf(() => downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
    now: () => NOW,
    lookup: async () => [{ address: '8.8.8.8', family: 4 }],
    request: fakeTtsRequest({ onRequest: () => { capacityConnections++; } }),
    admission: fullAdmission,
  }));
  heldLease();
  const recovered = await downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
    now: () => NOW,
    lookup: async () => [{ address: '8.8.8.8', family: 4 }],
    request: fakeTtsRequest({ onRequest: () => { capacityConnections++; } }),
    admission: fullAdmission,
  });
  assert('下载 bulkhead（舱壁）满载时零连接拒绝，释放后可恢复', capacityError === 'tts_download_capacity_exceeded' && capacityConnections === 1 && recovered.byteLength === 3);

  const defaultShapeAdmission = createTtsDownloadAdmission({ maxConcurrent: 4, maxQueued: 0 });
  let stalledRequests = 0;
  let stalledDestroyed = 0;
  const stalls = Array.from({ length: 4 }, () => {
    const controller = new AbortController();
    return {
      controller,
      request: downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
        now: () => NOW,
        lookup: async () => [{ address: '8.8.8.8', family: 4 }],
        request: firstByteStallingRequest(() => { stalledDestroyed++; }),
        deadlineMs: 500,
        idleTimeoutMs: 500,
        admission: defaultShapeAdmission,
        signal: controller.signal,
      }),
    };
  });
  await new Promise((resolve) => setTimeout(resolve, 0));
  const fifthAtCapacity = await messageOf(() => downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
    now: () => NOW,
    lookup: async () => [{ address: '8.8.8.8', family: 4 }],
    request: fakeTtsRequest({ onRequest: () => { stalledRequests++; } }),
    admission: defaultShapeAdmission,
  }));
  stalls.forEach(({ controller }) => controller.abort());
  const stallErrors = await Promise.all(stalls.map(({ request }) => messageOf(() => request)));
  const afterFourCancellations = await downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
    now: () => NOW,
    lookup: async () => [{ address: '8.8.8.8', family: 4 }],
    request: fakeTtsRequest({ onRequest: () => { stalledRequests++; } }),
    admission: defaultShapeAdmission,
  });
  assert('4 路阻塞下载取消后全部归还默认形状的槽位，第 5 路此前零连接拒绝', fifthAtCapacity === 'tts_download_capacity_exceeded' && stalledRequests === 1 && stalledDestroyed === 4 && stallErrors.every((error) => error === 'tts_download_aborted') && afterFourCancellations.byteLength === 3);

  const twentyCancelAdmission = createTtsDownloadAdmission({ maxConcurrent: 20, maxQueued: 0 });
  const twentyDestroyCounts = Array.from({ length: 20 }, () => 0);
  const twentyCancellations = twentyDestroyCounts.map((_, index) => {
    const controller = new AbortController();
    return {
      controller,
      request: downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
        now: () => NOW,
        lookup: async () => [{ address: '8.8.8.8', family: 4 }],
        request: firstByteStallingRequest(() => { twentyDestroyCounts[index]!++; }),
        deadlineMs: 500,
        idleTimeoutMs: 500,
        admission: twentyCancelAdmission,
        signal: controller.signal,
      }),
    };
  });
  await wait(10);
  let twentyFirstConnections = 0;
  const twentyFirst = await messageOf(() => downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
    now: () => NOW,
    lookup: async () => [{ address: '8.8.8.8', family: 4 }],
    request: fakeTtsRequest({ onRequest: () => { twentyFirstConnections++; } }),
    admission: twentyCancelAdmission,
  }));
  for (const { controller } of twentyCancellations) { controller.abort(); controller.abort(); }
  const twentyErrors = await Promise.all(twentyCancellations.map(({ request }) => messageOf(() => request)));
  const twentyRecovery = await Promise.all(Array.from({ length: 20 }, () => twentyCancelAdmission.acquire()));
  for (const release of twentyRecovery) release();
  const postRecoveryFull = await Promise.all(Array.from({ length: 20 }, () => twentyCancelAdmission.acquire()));
  const postRecoveryTwentyFirst = await messageOf(() => twentyCancelAdmission.acquire());
  for (const release of postRecoveryFull) release();
  assert('20 路阻塞下载重复取消时，21st 零连接拒绝、每条连接/租约恰好收口一次且恢复后再次满载仍拒绝第 21 条', twentyFirst === 'tts_download_capacity_exceeded' && twentyFirstConnections === 0 && twentyErrors.every((error) => error === 'tts_download_aborted') && twentyDestroyCounts.every((count) => count === 1) && twentyRecovery.length === 20 && postRecoveryTwentyFirst === 'tts_download_capacity_exceeded');

  const completionRaceAdmission = createTtsDownloadAdmission({ maxConcurrent: 1, maxQueued: 0 });
  const completionRaceAbort = new AbortController();
  let completionRaceDestroyed = 0;
  const completionRaceRequest = ((_url: URL, _options: any, onResponse: (response: any) => void) => {
    const request = new EventEmitter() as any;
    request.setTimeout = () => request;
    request.destroy = () => { completionRaceDestroyed++; return request; };
    request.end = () => queueMicrotask(() => {
      const response = new EventEmitter() as any;
      response.statusCode = 200;
      response.headers = { 'content-type': 'audio/wav', 'content-length': '3' };
      response.resume = () => undefined;
      response.destroy = () => undefined;
      onResponse(response);
      response.emit('data', new Uint8Array([1, 2, 3]));
      response.emit('end');
      completionRaceAbort.abort();
    });
    return request;
  }) as any;
  const completionRaceAudio = await downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
    now: () => NOW,
    lookup: async () => [{ address: '8.8.8.8', family: 4 }],
    request: completionRaceRequest,
    admission: completionRaceAdmission,
    signal: completionRaceAbort.signal,
  });
  const completionRaceRecovery = await completionRaceAdmission.acquire();
  completionRaceRecovery();
  assert('下载完成与取消同一微任务竞态时，完成先赢且没有迟到 destroy 或租约泄漏', completionRaceAudio.byteLength === 3 && completionRaceDestroyed === 0);

  const cancellationWinsAdmission = createTtsDownloadAdmission({ maxConcurrent: 1, maxQueued: 0 });
  const cancellationWinsAbort = new AbortController();
  let cancellationWinsDestroyed = 0;
  const cancellationWinsRequest = ((_url: URL, _options: any, onResponse: (response: any) => void) => {
    const request = new EventEmitter() as any;
    request.setTimeout = () => request;
    request.destroy = () => { cancellationWinsDestroyed++; return request; };
    request.end = () => queueMicrotask(() => {
      const response = new EventEmitter() as any;
      response.statusCode = 200;
      response.headers = { 'content-type': 'audio/wav' };
      response.resume = () => undefined;
      response.destroy = () => undefined;
      onResponse(response);
      response.emit('data', new Uint8Array([1]));
      cancellationWinsAbort.abort();
      response.emit('end');
    });
    return request;
  }) as any;
  const cancellationWins = await messageOf(() => downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
    now: () => NOW,
    lookup: async () => [{ address: '8.8.8.8', family: 4 }],
    request: cancellationWinsRequest,
    admission: cancellationWinsAdmission,
    signal: cancellationWinsAbort.signal,
  }));
  const cancellationWinsRecovery = await cancellationWinsAdmission.acquire();
  cancellationWinsRecovery();
  assert('响应已开始但取消先赢时不返回部分音频、连接恰好销毁一次且租约可复用', cancellationWins === 'tts_download_aborted' && cancellationWinsDestroyed === 1);

  const remoteAbortAdmission = createTtsDownloadAdmission({ maxConcurrent: 1, maxQueued: 0 });
  const remoteAbortRequest = ((_url: URL, _options: any, onResponse: (response: any) => void) => {
    const request = new EventEmitter() as any;
    request.setTimeout = () => request;
    request.destroy = () => request;
    request.end = () => queueMicrotask(() => {
      const response = new EventEmitter() as any;
      response.statusCode = 200;
      response.headers = { 'content-type': 'audio/wav' };
      response.resume = () => undefined;
      response.destroy = () => undefined;
      onResponse(response);
      response.emit('aborted');
    });
    return request;
  }) as any;
  const remoteAbort = await messageOf(() => downloadDashscopeTtsAudio(safeAudioUrl(), Math.floor(NOW / 1000) + 600, {
    now: () => NOW,
    lookup: async () => [{ address: '8.8.8.8', family: 4 }],
    request: remoteAbortRequest,
    admission: remoteAbortAdmission,
  }));
  const remoteAbortRecovered = await remoteAbortAdmission.acquire();
  remoteAbortRecovered();
  assert('供应商下载流远端中止不是用户取消，且租约仍立即归还', remoteAbort === 'tts_download_stream_failed');

  const originalTtsFetch = globalThis.fetch;
  let ttsFetchCalls = 0;
  try {
    globalThis.fetch = (async () => {
      ttsFetchCalls++;
      return new Response(JSON.stringify({ output: { audio: { url: 'http://169.254.169.254/latest/meta-data', expires_at: Math.floor(NOW / 1000) + 600 } } }), { status: 200, headers: { 'content-type': 'application/json' } });
    }) as typeof fetch;
    const providerAdmission = createTtsDownloadAdmission({ maxConcurrent: 1, maxQueued: 0 });
    const heldProviderLease = await providerAdmission.acquire();
    const capacityBeforeProvider = await messageOf(() => dashscopeTts({ apiKey: 'test', admission: providerAdmission }).synthesize('安全测试'));
    heldProviderLease();
    const integrationError = await messageOf(() => dashscopeTts({ apiKey: 'test', ttsUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation' }).synthesize('安全测试'));
    assert('TTS 操作级 bulkhead（舱壁）在供应商请求前拒绝满载，恶意响应也绝不发第二次 fetch', capacityBeforeProvider === 'tts_download_capacity_exceeded' && integrationError === 'tts_download_host_rejected' && ttsFetchCalls === 1);
  } finally {
    globalThis.fetch = originalTtsFetch;
  }

  let providerAbortSeen = false;
  let providerAbortCalls = 0;
  try {
    globalThis.fetch = ((_input: string | URL | Request, init?: RequestInit) => {
      providerAbortCalls++;
      return new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener('abort', () => {
        providerAbortSeen = true;
        reject(init.signal?.reason ?? new DOMException('aborted', 'AbortError'));
      }, { once: true }));
    }) as typeof fetch;
    const providerCancel = new AbortController();
    const pendingProviderTts = dashscopeTts({ apiKey: 'test', admission: createTtsDownloadAdmission({ maxConcurrent: 1, maxQueued: 0 }) })
      .synthesize('取消供应商合成', { signal: providerCancel.signal });
    await new Promise((resolve) => setTimeout(resolve, 0));
    providerCancel.abort();
    const providerCancelError = await messageOf(() => pendingProviderTts);
    assert('客户端取消会中止首次供应商 TTS 请求，且不会重试或进入下载', providerAbortSeen && providerAbortCalls === 1 && providerCancelError === 'tts_download_aborted');
  } finally {
    globalThis.fetch = originalTtsFetch;
  }

  const originalBodyFetch = globalThis.fetch;
  try {
    const callerBodyStats = { fetchSignalsAborted: 0 };
    globalThis.fetch = headersThenNeverEndingJson(callerBodyStats);
    const callerBodyAdmission = createTtsDownloadAdmission({ maxConcurrent: 1, maxQueued: 0 });
    const callerBodyAbort = new AbortController();
    const callerBodyPending = dashscopeTts({ apiKey: 'test', admission: callerBodyAdmission, timeoutMs: 500 } as any)
      .synthesize('响应头后取消', { signal: callerBodyAbort.signal });
    await new Promise((resolve) => setTimeout(resolve, 0));
    callerBodyAbort.abort();
    const callerBodyOutcome = await settleWithin(callerBodyPending, 80);
    let callerBodyLeaseReleased = false;
    try { (await callerBodyAdmission.acquire())(); callerBodyLeaseReleased = true; } catch { /* assertion below */ }
    assert('JSON 响应头已到但正文卡住时，用户取消仍中止读取并立即归还 TTS 槽位', callerBodyOutcome === 'tts_download_aborted' && callerBodyStats.fetchSignalsAborted === 1 && callerBodyLeaseReleased);

    const deadlineBodyStats = { fetchSignalsAborted: 0 };
    globalThis.fetch = headersThenNeverEndingJson(deadlineBodyStats);
    const deadlineBodyAdmission = createTtsDownloadAdmission({ maxConcurrent: 1, maxQueued: 0 });
    const deadlineBodyPending = dashscopeTts({ apiKey: 'test', admission: deadlineBodyAdmission, timeoutMs: 25 } as any)
      .synthesize('响应头后超时');
    const deadlineBodyOutcome = await settleWithin(deadlineBodyPending, 120);
    let deadlineBodyLeaseReleased = false;
    try { (await deadlineBodyAdmission.acquire())(); deadlineBodyLeaseReleased = true; } catch { /* assertion below */ }
    assert('JSON 响应头已到但正文卡住时，绝对截止时间仍终止读取并归还 TTS 槽位', deadlineBodyOutcome === 'tts_download_deadline_exceeded' && deadlineBodyStats.fetchSignalsAborted === 1 && deadlineBodyLeaseReleased);
  } finally {
    globalThis.fetch = originalBodyFetch;
  }

  const concurrentOperationAdmission = createTtsDownloadAdmission({ maxConcurrent: 20, maxQueued: 0 });
  const concurrentOperationStats = { fetchSignalsAborted: 0 };
  const concurrentOperationUnhandled: unknown[] = [];
  const captureOperationUnhandled = (error: unknown) => concurrentOperationUnhandled.push(error);
  process.on('unhandledRejection', captureOperationUnhandled);
  try {
    globalThis.fetch = headersThenNeverEndingJson(concurrentOperationStats);
    const operations = Array.from({ length: 20 }, () => {
      const controller = new AbortController();
      return {
        controller,
        request: dashscopeTts({ apiKey: 'test', admission: concurrentOperationAdmission, timeoutMs: 500 })
          .synthesize('并发正文卡住取消', { signal: controller.signal }),
      };
    });
    await wait(10);
    let twentyFirstOperationFetches = 0;
    const twentyFirstOperation = await messageOf(() => {
      const original = globalThis.fetch;
      globalThis.fetch = ((...args: Parameters<typeof fetch>) => {
        twentyFirstOperationFetches++;
        return original(...args);
      }) as typeof fetch;
      return dashscopeTts({ apiKey: 'test', admission: concurrentOperationAdmission, timeoutMs: 500 }).synthesize('容量拒绝');
    });
    for (const { controller } of operations) { controller.abort(); controller.abort(); }
    const outcomes = await Promise.all(operations.map(({ request }) => messageOf(() => request)));
    const recovered = await Promise.all(Array.from({ length: 20 }, () => concurrentOperationAdmission.acquire()));
    const postRecoveryTwentyFirst = await messageOf(() => concurrentOperationAdmission.acquire());
    for (const release of recovered) release();
    await wait(0);
    assert('20 路真实 TTS 首段 JSON 正文卡住时重复取消会中止全部供应商请求、零额外请求、归还全部槽位且恢复后仍拒绝第 21 路',
      twentyFirstOperation === 'tts_download_capacity_exceeded'
      && twentyFirstOperationFetches === 0
      && concurrentOperationStats.fetchSignalsAborted === 20
      && outcomes.every((outcome) => outcome === 'tts_download_aborted')
      && postRecoveryTwentyFirst === 'tts_download_capacity_exceeded'
      && concurrentOperationUnhandled.length === 0);
  } finally {
    process.off('unhandledRejection', captureOperationUnhandled);
    globalThis.fetch = originalBodyFetch;
  }

  console.log(`\n${failures === 0 ? '✓ 语音转写可靠性合同全部通过' : `✗ ${failures} 个失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}
void main();

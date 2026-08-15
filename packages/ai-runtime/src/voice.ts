import { lookup as dnsLookup } from 'node:dns/promises';
import { request as httpsRequest, type RequestOptions } from 'node:https';
import type { ClientRequest, IncomingMessage } from 'node:http';
import ipaddr from 'ipaddr.js';
import { ExternalHttpStatusError, ExternalRequestAbortedError, ExternalRequestTimeoutError, fetchJsonWithTimeout } from './timeout.ts';
import { rejectDashscopeNativeTransportOverride, resolveDashscopeNativeConfig } from './dashscope-native-config.ts';

/**
 * 语音 I/O seam（边缘适配器）——核心洞察:**面试 agent 图是 modality-agnostic 的**,它只收"文本答案"、出"文本问题",
 * 不关心答案是打字还是语音转写。所以语音 = 把 ASR/TTS 包在图外圈,agent 内核(graph/invoke/factuality/eval)一行不动。
 * 易变技术(ASR/TTS/实时模型)藏在本 seam 后(10 年):换 paraformer→qwen3-asr、cosyvoice→别的,业务不动。
 * 隐私:转写文本落 interview_event(已建),**原始录音默认不存**(需单独同意)——见 rules 隐私铁律。
 */
export interface Asr { transcribe(audio: Uint8Array, opts?: { lang?: string; format?: string; signal?: AbortSignal }): Promise<string>; }
export interface Tts { synthesize(text: string, opts?: { voice?: string; signal?: AbortSignal }): Promise<Uint8Array>; }

/**
 * API composition uses this sentinel until ASR/TTS have a typed operation
 * binding, durable attempt handling, and deletion receipts. It is a local
 * availability seam, not a replacement for those controls.
 */
export const VOICE_EGRESS_DISABLED_ID = 'voice-egress-disabled';

/** A fail-closed voice seam for product composition roots. */
export function disabledAsr(): Asr {
  return Object.freeze({
    async transcribe() { throw new Error('asr_not_configured'); },
  });
}

/** A fail-closed voice seam for product composition roots. */
export function disabledTts(): Tts {
  return Object.freeze({
    async synthesize() { throw new Error('tts_not_configured'); },
  });
}

/** A TTS result URL is untrusted provider response data, never a generic fetch target. */
export const MAX_TTS_AUDIO_BYTES = 8 * 1024 * 1024;
/** Absolute deadline from DNS lookup through the last response byte. */
export const TTS_DOWNLOAD_TIMEOUT_MS = 30_000;
/** Socket inactivity is a second, shorter guard; it never extends the deadline. */
export const TTS_DOWNLOAD_IDLE_TIMEOUT_MS = 10_000;
/** Per-process containment for direct-download buffers until the gateway owns TTS egress. */
export const TTS_DOWNLOAD_MAX_CONCURRENT = 4;
export const TTS_DOWNLOAD_MAX_QUEUED = 0;
const MAX_TTS_RESULT_URL_TTL_MS = 24 * 60 * 60 * 1000 + 5 * 60 * 1000;
const DASHSCOPE_TTS_RESULT_HOST = /^dashscope-result-[a-z0-9-]+\.oss-cn-[a-z0-9-]+\.aliyuncs\.com$/;

type LookupAddress = { address: string; family: number };
type TtsDnsLookup = (hostname: string) => Promise<LookupAddress[]>;
type TtsHttpsRequest = (url: URL, options: RequestOptions, onResponse: (response: IncomingMessage) => void) => ClientRequest;

export interface TtsDownloadAdmission {
  acquire(): Promise<() => void>;
}

export class TtsDownloadCapacityError extends Error {
  constructor() {
    super('tts_download_capacity_exceeded');
    this.name = 'TtsDownloadCapacityError';
  }
}

/**
 * A small in-process bulkhead for buffered WAV downloads. It intentionally
 * rejects when full instead of letting unbounded callers retain 8 MiB bodies.
 * Multi-instance coordination belongs to the cloud Redis/model-gateway gate;
 * callers must not mistake this local guard for a distributed quota.
 */
export function createTtsDownloadAdmission(options: { maxConcurrent?: number; maxQueued?: number } = {}): TtsDownloadAdmission {
  const maxConcurrent = options.maxConcurrent ?? TTS_DOWNLOAD_MAX_CONCURRENT;
  const maxQueued = options.maxQueued ?? TTS_DOWNLOAD_MAX_QUEUED;
  if (!Number.isSafeInteger(maxConcurrent) || maxConcurrent < 1 || !Number.isSafeInteger(maxQueued) || maxQueued < 0)
    throw new Error('tts_download_admission_config_invalid');
  let active = 0;
  const waiting: Array<(lease: () => void) => void> = [];
  const lease = () => {
    let released = false;
    return () => {
      if (released) return;
      released = true;
      active--;
      const next = waiting.shift();
      if (next) {
        active++;
        next(lease());
      }
    };
  };
  return {
    async acquire() {
      if (active < maxConcurrent) {
        active++;
        return lease();
      }
      if (waiting.length >= maxQueued) throw new TtsDownloadCapacityError();
      return await new Promise<() => void>((resolve) => waiting.push(resolve));
    },
  };
}

const defaultTtsDownloadAdmission = createTtsDownloadAdmission();

export interface TrustedTtsDownloadDeps {
  now?: () => number;
  lookup?: TtsDnsLookup;
  request?: TtsHttpsRequest;
  /** Test seam only: production always uses TTS_DOWNLOAD_TIMEOUT_MS. */
  deadlineMs?: number;
  /** Test seam only: production always uses TTS_DOWNLOAD_IDLE_TIMEOUT_MS. */
  idleTimeoutMs?: number;
  /** Test seam only: production uses the module-scoped bounded bulkhead. */
  admission?: TtsDownloadAdmission;
  /** The caller's one-request lifetime; it is never persisted or logged. */
  signal?: AbortSignal;
}

function ttsDownloadError(code: string): Error {
  return new Error(`tts_download_${code}`);
}

/**
 * An admission wait must not keep a cancelled request alive.  The default
 * production policy has no queue, but custom/test policies may; a lease that
 * arrives after cancellation is immediately returned so it cannot leak a
 * future slot.
 */
async function acquireTtsAdmission(admission: TtsDownloadAdmission, signal?: AbortSignal): Promise<() => void> {
  if (!signal) return await admission.acquire();
  if (signal.aborted) throw ttsDownloadError('aborted');
  return await new Promise<() => void>((resolve, reject) => {
    let settled = false;
    const abort = () => {
      if (settled) return;
      settled = true;
      signal.removeEventListener('abort', abort);
      reject(ttsDownloadError('aborted'));
    };
    signal.addEventListener('abort', abort, { once: true });
    void admission.acquire().then(
      (lease) => {
        if (settled || signal.aborted) {
          lease();
          abort();
          return;
        }
        settled = true;
        signal.removeEventListener('abort', abort);
        resolve(lease);
      },
      (error) => {
        if (settled) return;
        settled = true;
        signal.removeEventListener('abort', abort);
        reject(error);
      },
    );
  });
}

export function isForbiddenTtsDownloadAddress(address: string): boolean {
  try {
    const parsed = ipaddr.parse(address);
    // IPv4-compatible forms such as ::127.0.0.1 normalize to IPv4-mapped.
    // Classify their embedded IPv4 address with the same policy instead of
    // relying on textual IPv6 prefixes.
    if (parsed.kind() === 'ipv6') {
      const ipv6 = parsed as ipaddr.IPv6;
      if (ipv6.isIPv4MappedAddress()) return ipv6.toIPv4Address().range() !== 'unicast';
    }
    // `unicast` is the only accepted range. This rejects unspecified,
    // loopback, RFC1918/private, link-local, carrier-NAT, documentation,
    // benchmark, multicast, reserved and IPv6 transition ranges alike.
    return parsed.range() !== 'unicast';
  } catch {
    return true;
  }
}

function allowedDashscopeTtsResultHost(hostname: string): boolean {
  return DASHSCOPE_TTS_RESULT_HOST.test(hostname);
}

/**
 * Validate the complete response locator before any second network connection.
 * DashScope documentation has historically returned an `http` OSS URL.  We
 * only upgrade that exact approved host to HTTPS; every other plaintext URL is
 * rejected rather than being fetched as-is.
 */
export function validateDashscopeTtsAudioUrl(rawUrl: string, expiresAt: unknown, now = Date.now()): URL {
  let url: URL;
  try { url = new URL(rawUrl); }
  catch { throw ttsDownloadError('url_invalid'); }
  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
  if (!allowedDashscopeTtsResultHost(hostname)) throw ttsDownloadError('host_rejected');
  if (url.username || url.password) throw ttsDownloadError('userinfo_rejected');
  if (url.protocol === 'http:' && (url.port === '' || url.port === '80')) {
    url.protocol = 'https:';
    url.port = '';
  }
  if (url.protocol !== 'https:' || (url.port !== '' && url.port !== '443')) throw ttsDownloadError('scheme_or_port_rejected');
  url.hostname = hostname;
  const expires = Number(url.searchParams.get('Expires'));
  const responseExpires = Number(expiresAt);
  if (!Number.isSafeInteger(expires) || !Number.isSafeInteger(responseExpires)
    || expires !== responseExpires
    || expires * 1000 <= now
    || expires * 1000 > now + MAX_TTS_RESULT_URL_TTL_MS
    || !url.searchParams.get('OSSAccessKeyId')
    || !url.searchParams.get('Signature')) throw ttsDownloadError('signature_or_expiry_rejected');
  return url;
}

function audioContentTypeAllowed(value: string | string[] | undefined, url: URL): boolean {
  const raw = Array.isArray(value) ? value[0] : value;
  const contentType = (raw ?? '').split(';', 1)[0]?.trim().toLowerCase() ?? '';
  return contentType === 'audio/wav'
    || contentType === 'audio/x-wav'
    || contentType === 'audio/wave'
    || (contentType === 'application/octet-stream' && url.pathname.toLowerCase().endsWith('.wav'));
}

function contentLength(headers: IncomingMessage['headers']): number | undefined {
  const raw = headers['content-length'];
  if (raw === undefined) return undefined;
  const parsed = Number(Array.isArray(raw) ? raw[0] : raw);
  if (!Number.isSafeInteger(parsed) || parsed < 0) throw ttsDownloadError('content_length_invalid');
  return parsed;
}

async function lookupPublicTtsAddress(hostname: string, lookup: TtsDnsLookup): Promise<LookupAddress> {
  let records: LookupAddress[];
  try { records = await lookup(hostname); }
  catch { throw ttsDownloadError('dns_failed'); }
  if (!Array.isArray(records) || records.length === 0 || records.some((record) => isForbiddenTtsDownloadAddress(record.address)))
    throw ttsDownloadError('dns_address_rejected');
  const selected = records[0]!;
  if ((selected.family !== 4 && selected.family !== 6) || isForbiddenTtsDownloadAddress(selected.address))
    throw ttsDownloadError('dns_address_rejected');
  return selected;
}

/**
 * Download a DashScope-generated WAV over a DNS-pinned TLS connection.
 * No redirects are followed and a response URL can never turn this process
 * into a generic server-side fetch primitive.
 */
async function downloadDashscopeTtsAudioWithinAdmission(rawUrl: string, expiresAt: unknown, deps: TrustedTtsDownloadDeps = {}): Promise<Uint8Array> {
  if (deps.signal?.aborted) throw ttsDownloadError('aborted');
  const url = validateDashscopeTtsAudioUrl(rawUrl, expiresAt, deps.now?.() ?? Date.now());
  const lookup = deps.lookup ?? ((hostname: string) => dnsLookup(hostname, { all: true, verbatim: true }));
  const request = deps.request ?? httpsRequest;
  const deadlineMs = deps.deadlineMs ?? TTS_DOWNLOAD_TIMEOUT_MS;
  const idleTimeoutMs = deps.idleTimeoutMs ?? TTS_DOWNLOAD_IDLE_TIMEOUT_MS;
  if (!Number.isSafeInteger(deadlineMs) || deadlineMs < 1 || !Number.isSafeInteger(idleTimeoutMs) || idleTimeoutMs < 1)
    throw ttsDownloadError('timeout_config_invalid');

  let requestHandle: ClientRequest | undefined;
  let terminateTransfer: (error: Error) => void = () => undefined;
  let transferStarted = false;
  let deadlineTimer: ReturnType<typeof setTimeout> | undefined;
  let removeAbortListener: (() => void) | undefined;
  const deadline = new Promise<never>((_resolve, reject) => {
    deadlineTimer = setTimeout(() => {
      const error = ttsDownloadError('deadline_exceeded');
      terminateTransfer(error);
      reject(error);
    }, deadlineMs);
  });

  try {
    const callerAbort = new Promise<never>((_resolve, reject) => {
      const abort = () => {
        const error = ttsDownloadError('aborted');
        terminateTransfer(error);
        // Once transfer starts, terminateTransfer is rejectOnce and already
        // destroys the request.  Before it starts no handle exists yet; this
        // branch is only defensive against future refactors.
        if (!transferStarted) {
          try { requestHandle?.destroy(error); } catch { /* best-effort socket close */ }
        }
        reject(error);
      };
      if (!deps.signal) return;
      if (deps.signal.aborted) { abort(); return; }
      deps.signal.addEventListener('abort', abort, { once: true });
      removeAbortListener = () => deps.signal?.removeEventListener('abort', abort);
    });
    const selected = await Promise.race([lookupPublicTtsAddress(url.hostname, lookup), deadline, callerAbort]);
    const transfer = new Promise<Uint8Array>((resolveResult, rejectResult) => {
      let settled = false;
      const rejectOnce = (error: Error) => {
        if (settled) return;
        settled = true;
        try { requestHandle?.destroy(error); } catch { /* best-effort socket close */ }
        rejectResult(error);
      };
      const resolveOnce = (value: Uint8Array) => {
        if (settled) return;
        settled = true;
        resolveResult(value);
      };
      terminateTransfer = rejectOnce;
      transferStarted = true;
      try {
        requestHandle = request(url, {
          protocol: 'https:',
          hostname: url.hostname,
          port: 443,
          method: 'GET',
          servername: url.hostname,
          rejectUnauthorized: true,
          headers: { accept: 'audio/wav' },
          lookup: (_hostname, _options, callback) => callback(null, selected.address, selected.family),
        }, (response) => {
          const status = response.statusCode ?? 0;
          if (status >= 300 && status < 400) {
            response.resume();
            rejectOnce(ttsDownloadError('redirect_rejected'));
            return;
          }
          if (status !== 200) {
            response.resume();
            rejectOnce(ttsDownloadError(`http_${status}`));
            return;
          }
          if (!audioContentTypeAllowed(response.headers['content-type'], url)) {
            response.resume();
            rejectOnce(ttsDownloadError('content_type_rejected'));
            return;
          }
          let declaredLength: number | undefined;
          try { declaredLength = contentLength(response.headers); }
          catch (error) { response.resume(); rejectOnce(error as Error); return; }
          if (declaredLength !== undefined && declaredLength > MAX_TTS_AUDIO_BYTES) {
            response.resume();
            rejectOnce(ttsDownloadError('content_length_exceeded'));
            return;
          }
          const chunks: Buffer[] = [];
          let bytes = 0;
          response.on('data', (chunk: Uint8Array | Buffer) => {
            if (settled) return;
            const copy = Buffer.from(chunk);
            bytes += copy.length;
            if (bytes > MAX_TTS_AUDIO_BYTES) {
              response.destroy(ttsDownloadError('body_exceeded'));
              rejectOnce(ttsDownloadError('body_exceeded'));
              return;
            }
            chunks.push(copy);
          });
          // IncomingMessage#aborted is emitted when the remote response
          // stream dies too.  It is not evidence that the browser cancelled
          // its request; only the caller AbortSignal path above may use the
          // user-cancellation error code.
          response.once('aborted', () => rejectOnce(ttsDownloadError('stream_failed')));
          response.once('error', () => rejectOnce(ttsDownloadError('stream_failed')));
          response.once('end', () => resolveOnce(Buffer.concat(chunks)));
        });
        requestHandle.once('error', () => rejectOnce(ttsDownloadError('transport_failed')));
        requestHandle.setTimeout(idleTimeoutMs, () => rejectOnce(ttsDownloadError('idle_timeout')));
        requestHandle.end();
      } catch { rejectOnce(ttsDownloadError('transport_failed')); }
    });
    return await Promise.race([transfer, deadline, callerAbort]);
  } finally {
    removeAbortListener?.();
    if (deadlineTimer !== undefined) clearTimeout(deadlineTimer);
  }
}

export async function downloadDashscopeTtsAudio(rawUrl: string, expiresAt: unknown, deps: TrustedTtsDownloadDeps = {}): Promise<Uint8Array> {
  const releaseAdmission = await acquireTtsAdmission(deps.admission ?? defaultTtsDownloadAdmission, deps.signal);
  try {
    return await downloadDashscopeTtsAudioWithinAdmission(rawUrl, expiresAt, deps);
  } finally {
    releaseAdmission();
  }
}

/** 测试/CI 用:确定性 fake,不联网。 */
export function fakeAsr(transcript: string): Asr { return { async transcribe() { return transcript; } }; }
export function fakeTts(): Tts { return { async synthesize(t) { return new TextEncoder().encode('AUDIO:' + t); } }; }

/**
 * 单段浏览器 WebM（Web 媒体封装格式）上传后，百炼 ASR（自动语音识别）的
 * 尾延迟会明显高于普通 JSON 模型/检索请求。这里保留有限上界而不沿用全局
 * HTTP 30 秒默认值：后者在真实移动端录音中会在第 30 秒中断尚在处理的转写。
 *
 * 不在适配器内自动重试：上游兼容接口没有可验证的幂等回执，响应丢失时重发
 * 可能产生两次供应商费用。调用失败交给产品的文字输入逃逸路径处理。
 */
export const ASR_REQUEST_TIMEOUT_MS = 75_000;

export class AsrTimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super('asr_timeout');
    this.name = 'AsrTimeoutError';
  }
}

/** The caller ended its own request; this is not a provider timeout or retryable failure. */
export class AsrAbortedError extends Error {
  constructor() {
    super('asr_aborted');
    this.name = 'AsrAbortedError';
  }
}

/**
 * 真 ASR（DashScope 百炼 qwen-audio,经 OpenAI 兼容 chat 端点的 input_audio content——与视觉 image_url 同机制,已实测逐字转写准确）。
 * 非流式(整段音频→文本);流式实时识别(逐字回显/打断)是下一步换 qwen3-asr WebSocket。未配置即抛,由上层降级。
 */
export function dashscopeAsr(cfg: { baseUrl?: string; apiKey?: string; model?: string; timeoutMs?: number } = {}): Asr {
  rejectDashscopeNativeTransportOverride(cfg.baseUrl);
  rejectDashscopeNativeTransportOverride(cfg.apiKey);
  const native = resolveDashscopeNativeConfig();
  const baseUrl = cfg.baseUrl ?? native.compatibleBaseUrl;
  const apiKey = cfg.apiKey ?? native.apiKey;
  const model = cfg.model ?? process.env.DASHSCOPE_ASR_MODEL ?? 'qwen-audio-turbo-latest';
  const timeoutMs = cfg.timeoutMs ?? ASR_REQUEST_TIMEOUT_MS;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1)
    throw new Error('invalid_asr_timeout');
  return {
    async transcribe(audio, opts) {
      if (!baseUrl || !apiKey) throw new Error('asr_not_configured');
      const fmt = opts?.format ?? 'mp3';
      const b64 = Buffer.from(audio).toString('base64');
      try {
        const j = await fetchJsonWithTimeout<{ choices?: { message?: { content?: string } }[] }>(`${baseUrl}/chat/completions`, {
          method: 'POST', redirect: 'error', headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model, messages: [{ role: 'user', content: [
            { type: 'input_audio', input_audio: { data: `data:audio/${fmt};base64,${b64}`, format: fmt } },
            { type: 'text', text: '请把这段语音逐字转写成文字，只输出转写出的文字，不要任何解释。' },
          ] }] }),
          signal: opts?.signal,
        }, { timeoutMs, maxBytes: 256 * 1024 });
        return (j.choices?.[0]?.message?.content ?? '').trim();
      } catch (error: any) {
        // A caller disconnect must remain distinct from a provider deadline:
        // both stop transport work, but only the latter is a 504/retryable
        // dependency failure in product metrics.
        if (error instanceof ExternalRequestAbortedError) throw new AsrAbortedError();
        if (error instanceof ExternalRequestTimeoutError) throw new AsrTimeoutError(timeoutMs);
        if (error instanceof ExternalHttpStatusError) throw new Error('asr_http_' + error.status);
        throw error;
      }
    },
  };
}

/** 真 TTS（DashScope qwen-tts,**native multimodal-generation 端点**——兼容模式无 /audio/speech,已实测返回 wav）。
 *  非流式(整句合成→下载 wav);流式低延迟(边出边播)是下一步换 WebSocket。未配置即抛,由上层降级。 */
export function dashscopeTts(cfg: { apiKey?: string; model?: string; voice?: string; ttsUrl?: string; timeoutMs?: number; admission?: TtsDownloadAdmission } = {}): Tts {
  rejectDashscopeNativeTransportOverride(cfg.apiKey);
  rejectDashscopeNativeTransportOverride(cfg.ttsUrl);
  const native = resolveDashscopeNativeConfig();
  const apiKey = cfg.apiKey ?? native.apiKey;
  const model = cfg.model ?? process.env.DASHSCOPE_TTS_MODEL ?? 'qwen-tts';
  const defVoice = cfg.voice ?? process.env.TTS_VOICE ?? 'Cherry';
  const ttsUrl = cfg.ttsUrl ?? native.ttsUrl;
  const timeoutMs = cfg.timeoutMs ?? Number(process.env.HTTP_TIMEOUT_MS ?? 30_000);
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1) throw new Error('invalid_tts_timeout');
  return {
    async synthesize(text, opts) {
      if (!apiKey) throw new Error('tts_not_configured');
      const releaseAdmission = await acquireTtsAdmission(cfg.admission ?? defaultTtsDownloadAdmission, opts?.signal);
      try {
        try {
          const j = await fetchJsonWithTimeout<{ output?: { audio?: { url?: string; expires_at?: number } } }>(ttsUrl, {
            method: 'POST', redirect: 'error', headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
            body: JSON.stringify({ model, input: { text, voice: opts?.voice ?? defVoice } }), signal: opts?.signal,
          }, { timeoutMs, maxBytes: 256 * 1024 });
          const url = j.output?.audio?.url;
          if (!url) throw new Error('tts_no_audio_url');
          return await downloadDashscopeTtsAudioWithinAdmission(url, j.output?.audio?.expires_at, { signal: opts?.signal });
        } catch (error: any) {
          if (error instanceof ExternalRequestAbortedError) throw ttsDownloadError('aborted');
          if (error instanceof ExternalRequestTimeoutError) throw ttsDownloadError('deadline_exceeded');
          if (error instanceof ExternalHttpStatusError) throw new Error('tts_http_' + error.status);
          throw error;
        }
      } finally {
        releaseAdmission();
      }
    },
  };
}

/**
 * Stream ASR product receipt (L10-p1 voice slice 2 · capability-gated live proof).
 *
 * The only honest claim this file can make: with the user-authorized provider
 * key mounted (read from the repo root .env at runtime, never printed, never
 * persisted), the REAL speech→transcript loop closes over the REAL product
 * pipeline — real cosyvoice PCM speech synthesized through the stream TTS
 * transport (format=pcm), linearly resampled 22050→16000 Hz, streamed as the
 * request body of the REAL Nest/Fastify `/interview/:id/listen/stream` pipe
 * (composition-root stream ASR wiring → octet-stream passthrough parser →
 * dual preview flag gate → paraformer-realtime-v2 WebSocket) → NDJSON
 * partial/final events whose joined final transcript hits 你好/世界 at
 * character level, and a mid-stream client abort terminates the pipe without
 * hanging.
 *
 * Capability gate: no key in .env → honest SKIP (skip is not pass). Key
 * present but not under the isolated runner → hard fail (never boot against a
 * developer database). CI runs keyless, so CI sees the SKIP arm only; the
 * green receipt below is a local run receipt and is NOT releaseEvidence and
 * NOT a production SLO. Server turn-taking is not exercised here. The raw
 * key never appears in any output below (only byte counts, event counts and
 * transcript text are printed).
 *
 *   pnpm voice-stream-asr-live:prove        (isolated runner wrapper)
 *   pnpm -C apps/api prove:voice-stream-asr-live   (raw; needs isolated DATABASE target)
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dashscopeStreamingTts } from '@meetwise/ai-runtime';
import { boot } from './_neg-harness';

// 能力钥从仓根 .env 运行时解析（用户 2026-11-16 授权该钥用于语音真实验证）。
// 任何输出/回执/日志只允许出现字节数/事件数/转写文本，绝不落钥字面量。
function readDotEnvValue(name: string): string | undefined {
  try {
    const envFile = resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env');
    const text = readFileSync(envFile, 'utf8');
    for (const line of text.split('\n')) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      const keyName = match?.[1];
      const rawValue = match?.[2];
      if (!match || keyName !== name || rawValue === undefined) continue;
      let value = rawValue.trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      return value.trim() === '' ? undefined : value;
    }
  } catch { /* unreadable .env = capability absent */ }
  return undefined;
}

// 语音语句含目标命中词「你好/世界」:真 cosyvoice 语音 → 真 paraformer 转写必须字符级还原。
const SPEAK_TEXT = '你好，世界。请用一段真实项目经历，讲讲你如何排查线上性能问题。';
const ASR_TTS_SAMPLE_RATE = 22050;   // dashscopeStreamingTts run-task 固定 sample_rate(适配器内常量)
const ASR_TARGET_RATE = 16000;       // 产品管道 paraformer 适配器固定输入采样率
const PCM_CHUNK_BYTES = 3200;        // 3200B = 100ms@16k/16bit mono

let failures = 0;
const check = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 线性插值重采样(纯函数·零依赖):22050Hz int16 mono → 16000Hz int16 mono。 */
function resampleTo16k(pcm: Int16Array, fromRate: number): Int16Array {
  const outLength = Math.floor(pcm.length * ASR_TARGET_RATE / fromRate);
  const out = new Int16Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const src = i * fromRate / ASR_TARGET_RATE;
    const i0 = Math.min(Math.floor(src), pcm.length - 1);
    const i1 = Math.min(i0 + 1, pcm.length - 1);
    const frac = src - i0;
    const a = pcm[i0] ?? 0;
    const b = pcm[i1] ?? 0;
    out[i] = Math.round(a * (1 - frac) + b * frac);
  }
  return out;
}

/** 把 16k PCM 按 PCM_CHUNK_BYTES 切块做成流式请求体(fetch duplex half)。 */
function pcmBodyStream(bytes: Uint8Array): ReadableStream<Uint8Array> {
  let offset = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (offset >= bytes.byteLength) { controller.close(); return; }
      const end = Math.min(offset + PCM_CHUNK_BYTES, bytes.byteLength);
      controller.enqueue(bytes.subarray(offset, end));
      offset = end;
    },
  });
}

interface ListenEvent { type: 'partial' | 'final' | 'error'; text?: string; error?: string }

async function readNdjsonEvents(body: ReadableStream<Uint8Array>, onEvent?: (ev: ListenEvent) => 'stop' | void): Promise<{ events: ListenEvent[]; settled: boolean }> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const events: ListenEvent[] = [];
  let buffered = '';
  let settled = false;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) { settled = true; break; }
      buffered += decoder.decode(value, { stream: true });
      for (;;) {
        const idx = buffered.indexOf('\n');
        if (idx < 0) break;
        const line = buffered.slice(0, idx).trim();
        buffered = buffered.slice(idx + 1);
        if (!line) continue;
        let ev: ListenEvent;
        try { ev = JSON.parse(line) as ListenEvent; } catch { continue; }
        events.push(ev);
        if (onEvent?.(ev) === 'stop') return { events, settled };
      }
    }
  } catch { /* abort / connection teardown: caller inspects `settled` */ }
  return { events, settled };
}

async function main() {
  const providerKey = readDotEnvValue('MODEL_API_KEY');
  if (!providerKey) {
    console.log('SKIP  voice-stream-asr-live: provider key absent in .env — capability gate closed.');
    console.log('SKIP  skip is NOT pass: this run proves nothing about the product stream pipe.');
    console.log('static_capability_skipped: voice-stream-asr-live; releaseEvidence=false');
    process.exit(0);
  }
  if (process.env.E2E_ISOLATED !== '1') {
    console.error('FAIL  voice-stream-asr-live requires the isolated runner (E2E_ISOLATED!=1 would touch a non-disposable database).');
    process.exit(1);
  }
  // 门面 env：双旗预览解锁 + 流式 ASR/TTS 能力钥挂载；生产锁三件全部摘除（隔离子进程显式构造，非继承）。
  // 文本路由钥一律剥除：本证明只花流式语音的钱，不花大模型文本的钱。
  process.env.NODE_ENV = 'test';
  process.env.DASHSCOPE_TEST_TRANSPORT_OVERRIDES = '1';   // 进程内直连流式 TTS 运输(format=pcm 合成真语音)·仅隔离测试进程
  delete process.env.MODEL_COST_ENFORCEMENT;
  delete process.env.MEETWISE_PUBLIC_PREVIEW;
  delete process.env.MODEL_API_KEY;
  delete process.env.DASHSCOPE_API_KEY;
  process.env.VOICE_STREAM_ASR_ENABLED = '1';
  process.env.VOICE_STREAM_ASR_PREVIEW = '1';
  process.env.DASHSCOPE_STREAM_TTS_API_KEY = providerKey;
  process.env.DASHSCOPE_STREAM_ASR_API_KEY = providerKey;

  const h = await boot();
  const asrModel = process.env.DASHSCOPE_STREAM_ASR_MODEL ?? 'paraformer-realtime-v2';
  const ttsModel = process.env.DASHSCOPE_STREAM_TTS_MODEL ?? 'cosyvoice-v2';
  // CONSENT-MIN(#69) 夹具:产品 /listen/stream 与批量 /transcribe 同款 voice_capture 同意门。
  await h.pool.query("INSERT INTO consent_record(id, owner_user_id, purpose, policy_version) VALUES ('c_voice_live', 'userA', 'voice_capture', 'voice_ephemeral_v1') ON CONFLICT DO NOTHING");

  const postListen = (body: ReadableStream<Uint8Array> | Uint8Array, signal: AbortSignal) => fetch(`${h.base}/interview/IV_ACT/listen/stream`, {
    method: 'POST',
    headers: { 'content-type': 'application/octet-stream', 'x-user-id': 'userA', 'x-request-id': `vstream-asr-live-${Date.now()}` },
    body,
    duplex: 'half',
    signal,
  } as unknown as RequestInit);

  // ── 臂 0(端点双旗门 fail-closed):无旗(仅 Key + wired 组合根)→ hijack 前 503 streaming_asr_not_configured。 ──
  delete process.env.VOICE_STREAM_ASR_ENABLED;
  delete process.env.VOICE_STREAM_ASR_PREVIEW;
  const closed = await postListen(new Uint8Array(PCM_CHUNK_BYTES), new AbortController().signal);
  const closedBody = await closed.json().catch(() => ({})) as { error?: string };
  check('product /listen/stream without dual preview flags refuses 503 streaming_asr_not_configured before hijack',
    closed.status === 503 && closedBody.error === 'streaming_asr_not_configured');
  try { await closed.body?.cancel(); } catch { /* already drained */ }
  process.env.VOICE_STREAM_ASR_ENABLED = '1';
  process.env.VOICE_STREAM_ASR_PREVIEW = '1';

  // ── 臂 A(真语音→真转写闭环):真 cosyvoice PCM 语音 → 16k 重采样 → 产品管道 → partial/final 事件流 + 字符级命中。 ──
  const tts = dashscopeStreamingTts({ format: 'pcm' });
  const ttsChunks: Uint8Array[] = [];
  for await (const chunk of tts.synthesizeStream(SPEAK_TEXT)) ttsChunks.push(chunk);
  const rawBytes = ttsChunks.reduce((n, c) => n + c.byteLength, 0);
  const raw = new Uint8Array(rawBytes);
  let offset = 0;
  for (const chunk of ttsChunks) { raw.set(chunk, offset); offset += chunk.byteLength; }
  const pcm16k = resampleTo16k(new Int16Array(raw.buffer, raw.byteOffset, raw.byteLength >> 1), ASR_TTS_SAMPLE_RATE);
  const pcmBytes = new Uint8Array(pcm16k.buffer, 0, pcm16k.byteLength);
  check('in-proof real speech synthesis produced enough PCM (cosyvoice pcm → 16k resample)',
    ttsChunks.length >= 2 && pcmBytes.byteLength >= 16000);

  const startedAt = Date.now();
  const response = await postListen(pcmBodyStream(pcmBytes), new AbortController().signal);
  check('product /listen/stream returns 200 application/x-ndjson on the real speech stream',
    response.status === 200 && String(response.headers.get('content-type') ?? '').startsWith('application/x-ndjson'));
  const { events } = await readNdjsonEvents(response.body as ReadableStream<Uint8Array>);
  const partials = events.filter((ev) => ev.type === 'partial');
  const finals = events.filter((ev) => ev.type === 'final' && (ev.text ?? '').trim());
  const transcript = finals.map((ev) => ev.text ?? '').join('');
  check('real provider events stream through the product pipe (partials then final transcript)',
    partials.length >= 1 && finals.length >= 1);
  check('joined final transcript hits 你好/世界 at character level (real speech → real transcript closed loop)',
    transcript.includes('你好') && transcript.includes('世界'));
  check('no error event on the happy path', !events.some((ev) => ev.type === 'error'));

  // ── 臂 B(抢话/断连 abort):事件中途 abort → 产品管道收尾、上游 WS 关闭、不悬挂。 ──
  const barge = new AbortController();
  const bargeResponse = await postListen(pcmBodyStream(pcmBytes), barge.signal);
  check('barge-in arm reaches the streaming phase (200 application/x-ndjson)',
    bargeResponse.status === 200 && String(bargeResponse.headers.get('content-type') ?? '').startsWith('application/x-ndjson'));
  let bargeEvents = 0;
  const bargeRead = readNdjsonEvents(bargeResponse.body as ReadableStream<Uint8Array>, () => {
    bargeEvents += 1;
    if (bargeEvents >= 1) { barge.abort(); return 'stop' as const; }   // 抢话:首事件即中止 → req.raw close → ac.abort → 上游 WS finally 关闭
    return undefined;
  });
  const deadline = Date.now() + 15_000;
  const bargeResult = await Promise.race([
    bargeRead.then((r) => ({ ...r, timedOut: false })),
    wait(Math.max(deadline - Date.now(), 0)).then(() => ({ events: [], settled: false, timedOut: true })),
  ]);
  check('barge-in abort terminates the product pipe with no hang (read loop settled before deadline)',
    !bargeResult.timedOut && Date.now() < deadline);

  console.log(`ASR_STREAM_LIVE_RECEIPT ${JSON.stringify({
    requestBytes: pcmBytes.byteLength, ttsBytes: rawBytes, partials: partials.length, finals: finals.length,
    finalTranscript: transcript.slice(0, 60), elapsedMs: Date.now() - startedAt,
    asrModel, ttsModel,
    endpoint: '/interview/:id/listen/stream',
    interview: 'IV_ACT(isolated seed)',
    keySource: 'repo .env (user-authorized 2026-11-16), never persisted',
    releaseEvidence: false, notHa: true,
  })}`);
  check('receipt records real transport facts without key material',
    pcmBytes.byteLength > 0 && finals.length >= 1 && !JSON.stringify({ asrModel, ttsModel, transcript: transcript.slice(0, 60) }).includes(providerKey));

  console.log(`\n${failures === 0
    ? '✓ stream ASR product pipe live receipt recorded (local receipt; releaseEvidence=false; skip≠pass preserved for keyless runs)'
    : `✗ ${failures} assertion(s) failed`}`);
  process.exit(failures === 0 ? 0 : 1);
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});

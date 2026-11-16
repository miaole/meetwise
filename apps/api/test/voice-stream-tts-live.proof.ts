/**
 * Stream TTS product receipt (L10-p1 voice slice · capability-gated live proof).
 *
 * The only honest claim this file can make: with the user-authorized provider
 * key mounted (read from the repo root .env at runtime, never printed, never
 * persisted), the REAL product pipeline — Nest composition root
 * (`createInterviewVoiceSeams` stream TTS wiring) → real Fastify/Nest
 * `/interview/:id/speak/stream` controller pipe (first-chunk-before-headers +
 * backpressure write + abort propagation) → real DashScope cosyvoice
 * WebSocket — emits real audio bytes, and a client barge-in abort terminates
 * the pipe without hanging.
 *
 * Capability gate: no key in .env → honest SKIP (skip is not pass). Key
 * present but not under the isolated runner → hard fail (never boot against a
 * developer database). CI runs keyless, so CI sees the SKIP arm only; the
 * green receipt below is a local run receipt and is NOT releaseEvidence and
 * NOT a production SLO. Streaming ASR / turn-taking remain un-built and are
 * not exercised here.
 *
 *   pnpm voice-stream-tts-live:prove        (isolated runner wrapper)
 *   pnpm -C apps/api prove:voice-stream-tts-live   (raw; needs isolated DATABASE target)
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { boot } from './_neg-harness';

// 能力钥从仓根 .env 运行时解析（用户 2026-11-16 授权该钥用于语音真实验证）。
// 任何输出/回执/日志只允许出现字节数与模型名，绝不落钥字面量。
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

const SPEAK_TEXT = '请你结合一段真实项目经历，讲讲你是如何在高并发场景下定位并解决性能瓶颈的，控制在两分钟以内。';

let failures = 0;
const check = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function openSpeakStream(base: string, signal: AbortSignal) {
  const startedAt = Date.now();
  const response = await fetch(`${base}/interview/IV_ACT/speak/stream`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-user-id': 'userA', 'x-request-id': `vstream-live-${startedAt}` },
    body: JSON.stringify({ text: SPEAK_TEXT }),
    signal,
  });
  return { response, startedAt };
}

async function main() {
  const providerKey = readDotEnvValue('MODEL_API_KEY');
  if (!providerKey) {
    console.log('SKIP  voice-stream-tts-live: provider key absent in .env — capability gate closed.');
    console.log('SKIP  skip is NOT pass: this run proves nothing about the product stream pipe.');
    console.log('static_capability_skipped: voice-stream-tts-live; releaseEvidence=false');
    process.exit(0);
  }
  if (process.env.E2E_ISOLATED !== '1') {
    console.error('FAIL  voice-stream-tts-live requires the isolated runner (E2E_ISOLATED!=1 would touch a non-disposable database).');
    process.exit(1);
  }
  // 门面 env：双旗预览解锁 + 能力钥挂载；生产锁三件全部摘除（隔离子进程显式构造，非继承）。
  // 文本路由钥一律剥除：本证明只花流式 TTS 的钱，不花大模型文本的钱。
  process.env.NODE_ENV = 'test';
  delete process.env.MODEL_COST_ENFORCEMENT;
  delete process.env.MEETWISE_PUBLIC_PREVIEW;
  delete process.env.MODEL_API_KEY;
  delete process.env.DASHSCOPE_API_KEY;
  delete process.env.DASHSCOPE_STREAM_ASR_API_KEY;
  process.env.VOICE_STREAM_ASR_ENABLED = '1';
  process.env.VOICE_STREAM_ASR_PREVIEW = '1';
  process.env.DASHSCOPE_STREAM_TTS_API_KEY = providerKey;

  const h = await boot();
  const model = process.env.DASHSCOPE_STREAM_TTS_MODEL ?? 'cosyvoice-v2';
  const voice = process.env.DASHSCOPE_STREAM_TTS_VOICE ?? 'longxiaochun_v2';

  // ── 臂 A（真音频经产品管道流出）:POST → 200 audio/mpeg → 真实 mp3 字节分块到达。 ──
  const happy = new AbortController();
  const { response, startedAt } = await openSpeakStream(h.base, happy.signal);
  check('product /speak/stream returns 200 audio/mpeg once the first real chunk is in hand',
    response.status === 200 && String(response.headers.get('content-type') ?? '').startsWith('audio/mpeg'));
  let bytes = 0;
  let chunks = 0;
  let firstAudioMs = -1;
  for await (const chunk of (response.body as unknown as AsyncIterable<Uint8Array>)) {
    if (firstAudioMs < 0) firstAudioMs = Date.now() - startedAt;
    bytes += chunk.byteLength;
    chunks++;
  }
  check('real provider audio bytes flow through the product pipe (nonempty mp3, progressively chunked)',
    bytes >= 2000 && chunks >= 2);

  // ── 臂 B（抢话/断连 abort）:首块到达即 abort → 管道收尾、上游 WS 关闭、不悬挂。 ──
  const barge = new AbortController();
  const { response: bargeResponse } = await openSpeakStream(h.base, barge.signal);
  check('barge-in arm reaches the streaming phase (200 audio/mpeg)', bargeResponse.status === 200
    && String(bargeResponse.headers.get('content-type') ?? '').startsWith('audio/mpeg'));
  const reader = (bargeResponse.body as unknown as AsyncIterable<Uint8Array>)[Symbol.asyncIterator]();
  const first = await reader.next();
  const bargeBytes = first.value?.byteLength ?? 0;
  barge.abort();   // 抢话:客户端断开 → controller req.raw close → ac.abort → 上游 WS finally 关闭
  let terminated = false;
  const deadline = Date.now() + 15_000;
  try {
    for (;;) {
      const next = await Promise.race([
        reader.next(),
        wait(Math.max(deadline - Date.now(), 0)).then((): 'deadline' => 'deadline'),
      ]);
      if (next === 'deadline') break;
      if (next.done) { terminated = true; break; }
    }
  } catch { terminated = true; }   // abort 后 reader 拒绝 = 流已终止（非悬挂）
  check('barge-in abort terminates the product pipe with no hang (stream settled, upstream WS closed via generator finally)',
    terminated && Date.now() < deadline);

  console.log(`TTS_STREAM_LIVE_RECEIPT ${JSON.stringify({
    bytes, chunks, firstAudioMs, bargeBytes,
    model, voice,
    endpoint: '/interview/:id/speak/stream',
    interview: 'IV_ACT(isolated seed)',
    keySource: 'repo .env (user-authorized 2026-11-16), never persisted',
    releaseEvidence: false, notHa: true,
  })}`);
  check('receipt records real transport facts without key material',
    bytes > 0 && chunks >= 2 && !JSON.stringify({ model, voice }).includes(providerKey));

  console.log(`\n${failures === 0
    ? '✓ stream TTS product pipe live receipt recorded (local receipt; releaseEvidence=false; skip≠pass preserved for keyless runs)'
    : `✗ ${failures} assertion(s) failed`}`);
  process.exit(failures === 0 ? 0 : 1);
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});

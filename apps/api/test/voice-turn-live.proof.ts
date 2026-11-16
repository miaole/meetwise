/**
 * Server turn-taking product receipt (L10-p1 voice slice 3 · capability-gated live proof).
 *
 * The only honest claim this file can make: with the user-authorized provider
 * key mounted (read from the repo root .env at runtime, never printed, never
 * persisted) and the isolated runner up, the REAL turn loop closes over the
 * REAL composition root — `createInterviewVoiceSeams` wires live stream TTS
 * (cosyvoice-v2) + live stream ASR (paraformer-realtime-v2) under the triple
 * gate (per-capability Keys + exact dual preview flags + not production
 * locked), `turnTakingConfigured` is honestly true, and
 * `runVoiceAdaptiveInterview` advances turns on real audio: real AI speech
 * synthesized through the composition stream TTS seam, the answer spoken as
 * real cosyvoice PCM (echo of "what the user side picked up"), deterministic
 * RMS endpointing (voice-endpointing.ts, zero model) closing each turn at the
 * same frame as the pure proof predicts, final transcripts hitting 你好/世界
 * at character level, a mid-turn barge-in cleanly switching to listening while
 * the answer still lands, and a silence-only turn refusing closed
 * (streaming_asr_malformed) instead of inventing an answer.
 *
 * Capability gate: no key in .env → honest SKIP (skip is not pass). Key
 * present but not under the isolated runner → hard fail (never boot against a
 * developer database). CI runs keyless, so CI sees the SKIP arm only; the
 * green receipt below is a local run receipt and is NOT releaseEvidence, NOT a
 * production SLO, and says nothing about real-microphone acoustics or a
 * browser→API hop (真机矩阵另走). The raw key never appears in any output
 * below (only byte counts, frame numbers and transcript text are printed).
 *
 *   pnpm voice-turn-live:prove        (isolated runner wrapper)
 *   pnpm -C apps/api prove:voice-turn-live   (raw; needs isolated DATABASE target)
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRmsEndpointer, dashscopeStreamingTts, createInterviewVoiceSeams, createInterviewVoiceTurnRunner } from '@meetwise/ai-runtime';
import { runVoiceAdaptiveInterview } from '../../worker/src/voice-adaptive.ts';
import { boot } from './_neg-harness';

// 能力钥从仓根 .env 运行时解析（用户 2026-11-16 授权该钥用于语音真实验证）。
// 任何输出/回执/日志只允许出现字节数/帧数/转写文本，绝不落钥字面量。
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

// 回声答句含目标命中词「你好/世界」:真 cosyvoice 语音 → 真 paraformer 转写必须字符级还原。
const ANSWER_TEXT = '你好，我先从一次线上排查讲起。去年大促世界切换高峰时网关限流抖动，我先用监控定位到线程池排队，再压测复现，最后用滑动窗口把限流收敛住。';
const QUESTION_1 = '请讲一段你排查线上问题的真实经历。';
const QUESTION_2 = '请继续展开讲讲当时限流阈值是怎么定的，压测指标如何验证，灰度与回滚策略是什么，以及事后复盘沉淀了哪些长期机制与告警规则，越具体越好，不要遗漏任何一步。';
const ASR_TTS_SAMPLE_RATE = 22050;   // dashscopeStreamingTts run-task 固定 sample_rate(适配器内常量)
const ASR_TARGET_RATE = 16000;       // 产品管道 paraformer 适配器固定输入采样率
const PCM_CHUNK_BYTES = 3200;        // 3200B = 100ms@16k/16bit mono
const LEADING_SILENCE_MS = 8000;     // 回合 1:实时 paced 静音垫(盖过短问题 TTS 全程→AI 真说完不被打断)
const TRAILING_SILENCE_MS = 800;     // 端点检测尾静音(>N 帧 510ms 才切回合)
const PACED_CHUNK_MS = 100;          // 回合 1 按 100ms/块实时 pace(模拟真人拾音节奏)

let failures = 0;
const check = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

/** 16k PCM 切 3200B 块的流(与产品管道同块形;paced=true 时按 100ms/块实时 pace)。 */
function pcmChunks(bytes: Uint8Array, paced = false): AsyncIterable<Uint8Array> {
  return (async function* () {
    for (let offset = 0; offset < bytes.byteLength; offset += PCM_CHUNK_BYTES) {
      yield bytes.subarray(offset, Math.min(offset + PCM_CHUNK_BYTES, bytes.byteLength));
      if (paced) await wait(PACED_CHUNK_MS);
    }
  })();
}

/** 端点检测回执(确定性·与纯 prove 同一函数):同音频同切块 → 同帧号。 */
function endpointReceipt(bytes: Uint8Array): { endFrame: number; speechFrames: number; silenceFrames: number } | undefined {
  const ep = createRmsEndpointer();
  for (const ev of ep.feed(bytes)) {
    if (ev.type === 'end_of_turn') return { endFrame: ev.frame, speechFrames: ev.speechFrames, silenceFrames: ev.silenceFrames };
  }
  return undefined;
}

async function main() {
  const providerKey = readDotEnvValue('MODEL_API_KEY');
  if (!providerKey) {
    console.log('SKIP  voice-turn-live: provider key absent in .env — capability gate closed.');
    console.log('SKIP  skip is NOT pass: this run proves nothing about the server turn loop.');
    console.log('static_capability_skipped: voice-turn-live; releaseEvidence=false');
    process.exit(0);
  }
  if (process.env.E2E_ISOLATED !== '1') {
    console.error('FAIL  voice-turn-live requires the isolated runner (E2E_ISOLATED!=1 would touch a non-disposable database).');
    process.exit(1);
  }
  // 门面 env：双旗预览解锁 + 流式双能力钥挂载；生产锁三件全部摘除（隔离子进程显式构造，非继承）。
  // 文本路由钥一律剥除：本证明只花流式语音的钱，不花大模型文本的钱。
  process.env.NODE_ENV = 'test';
  process.env.DASHSCOPE_TEST_TRANSPORT_OVERRIDES = '1';   // 进程内直连流式 TTS 运输(format=pcm 合成回声真语音)·仅隔离测试进程
  delete process.env.MODEL_COST_ENFORCEMENT;
  delete process.env.MEETWISE_PUBLIC_PREVIEW;
  delete process.env.MODEL_API_KEY;
  delete process.env.DASHSCOPE_API_KEY;
  process.env.VOICE_STREAM_ASR_ENABLED = '1';
  process.env.VOICE_STREAM_ASR_PREVIEW = '1';
  process.env.DASHSCOPE_STREAM_TTS_API_KEY = providerKey;
  process.env.DASHSCOPE_STREAM_ASR_API_KEY = providerKey;

  await boot();                                          // 真组合根起真 Nest 进程(隔离库):模块 DI 工厂同缝构造零炸
  const asrModel = process.env.DASHSCOPE_STREAM_ASR_MODEL ?? 'paraformer-realtime-v2';
  const ttsModel = process.env.DASHSCOPE_STREAM_TTS_MODEL ?? 'cosyvoice-v2';

  // ── 臂 0(三重门组合根 fail-closed/true 如实):撤旗/生产锁下 runner 拒;门齐下如实翻 true。 ──
  delete process.env.VOICE_STREAM_ASR_ENABLED;
  delete process.env.VOICE_STREAM_ASR_PREVIEW;
  const closedSeams = createInterviewVoiceSeams();
  const closedRunner = createInterviewVoiceTurnRunner();
  let closedErr = 'no_error';
  try { await closedRunner.runTurn('q', pcmChunks(new Uint8Array(PCM_CHUNK_BYTES))); } catch (e) { closedErr = e instanceof Error ? e.message : String(e); }
  check('composition root without dual flags refuses turn-taking (turnTakingConfigured=false, runTurn fails closed before any WebSocket)',
    closedSeams.turnTakingConfigured === false && closedRunner.configured === false && closedErr === 'voice_turn_taking_not_configured');
  process.env.VOICE_STREAM_ASR_ENABLED = '1';
  process.env.VOICE_STREAM_ASR_PREVIEW = '1';
  process.env.NODE_ENV = 'production';
  let lockedErr = 'no_error';
  try { await createInterviewVoiceTurnRunner().runTurn('q', pcmChunks(new Uint8Array(PCM_CHUNK_BYTES))); } catch (e) { lockedErr = e instanceof Error ? e.message : String(e); }
  process.env.NODE_ENV = 'test';
  check('production lock refuses turn-taking even with flags and Keys',
    lockedErr === 'voice_turn_taking_unconfigured');

  const seams = createInterviewVoiceSeams();
  const runner = createInterviewVoiceTurnRunner();
  check('triple gate satisfied: seams + runner honestly wired (real cosyvoice-v2 + paraformer-realtime-v2, turnTakingConfigured=true)',
    seams.turnTakingConfigured === true && seams.streamTtsConfigured === true && seams.streamAsrConfigured === true
    && seams.streamTts.id === ttsModel && seams.streamAsr.id === asrModel && runner.configured === true);

  // ── 臂 1(真语音回声料):真 cosyvoice PCM 语音 → 16k 重采样 → 静音垫 → 确定性端点帧预读。 ──
  const echoTts = dashscopeStreamingTts({ format: 'pcm' });
  const echoChunks: Uint8Array[] = [];
  for await (const chunk of echoTts.synthesizeStream(ANSWER_TEXT)) echoChunks.push(chunk);
  const echoRawBytes = echoChunks.reduce((n, c) => n + c.byteLength, 0);
  const echoRaw = new Uint8Array(echoRawBytes);
  let echoOffset = 0;
  for (const chunk of echoChunks) { echoRaw.set(chunk, echoOffset); echoOffset += chunk.byteLength; }
  const speech16k = resampleTo16k(new Int16Array(echoRaw.buffer, echoRaw.byteOffset, echoRaw.byteLength >> 1), ASR_TTS_SAMPLE_RATE);
  const silencePad = (ms: number) => new Int16Array(Math.floor(ASR_TARGET_RATE * ms / 1000));
  const turn1Audio = new Uint8Array((silencePad(LEADING_SILENCE_MS).length + speech16k.length + silencePad(TRAILING_SILENCE_MS).length) * 2);
  new Int16Array(turn1Audio.buffer).set(silencePad(LEADING_SILENCE_MS), 0);
  new Int16Array(turn1Audio.buffer).set(speech16k, silencePad(LEADING_SILENCE_MS).length);
  new Int16Array(turn1Audio.buffer).set(silencePad(TRAILING_SILENCE_MS), silencePad(LEADING_SILENCE_MS).length + speech16k.length);
  const turn2Audio = (() => {   // 回合 2:无前垫(开口即说话)→真抢话面;尾静音同垫供端点检测收流
    const out = new Uint8Array((speech16k.length + silencePad(TRAILING_SILENCE_MS).length) * 2);
    new Int16Array(out.buffer).set(speech16k, 0);
    new Int16Array(out.buffer).set(silencePad(TRAILING_SILENCE_MS), speech16k.length);
    return out;
  })();
  const predicted = endpointReceipt(turn1Audio);
  check('in-proof real echo speech produced enough PCM and deterministic endpoint frame (cosyvoice pcm → 16k → RMS end_of_turn)',
    echoChunks.length >= 2 && turn1Audio.byteLength >= 16000 && !!predicted && predicted.endFrame > 0 && predicted.speechFrames >= 3);

  // ── 臂 2(turn 循环全环):真组合根双流缝 + RMS 端点 → 真转写推进两回合;回合 2 开口即抢话。 ──
  let ttsChunkCount = 0;
  let ttsByteCount = 0;
  const endReceipts: { frame: number; speechFrames: number; silenceFrames: number }[] = [];
  const scriptedQuestions: string[] = [];
  const startedAt = Date.now();
  const result = await runVoiceAdaptiveInterview({
    asr: seams.streamAsr,                                                  // 真组合根 paraformer 缝
    tts: seams.streamTts,                                                  // 真组合根 cosyvoice 缝(mp3 真音频字节)
    endpointing: {},                                                       // RMS 端点检测(纯确定性·零模型)
    start: async () => { scriptedQuestions.push(QUESTION_1); return { question: QUESTION_1 }; },
    submit: async (_answer: string) => {
      scriptedQuestions.push(QUESTION_2);
      return scriptedQuestions.length === 2 ? { nextQuestion: QUESTION_2, done: false } : { done: true };
    },
    userAudioFor: () => { const t = scriptedQuestions.length; return pcmChunks(t === 1 ? turn1Audio : turn2Audio, t === 1); },
    onTtsChunk: (c) => { ttsChunkCount++; ttsByteCount += c.byteLength; },
    onEndOfTurn: (info) => endReceipts.push({ frame: info.frame, speechFrames: info.speechFrames, silenceFrames: info.silenceFrames }),
  });
  const transcripts = result.turns.map((t) => t.transcript);
  check('turn loop advanced two turns on real audio and concluded (real composition seams end-to-end; question actually switched)',
    result.turns.length === 2 && result.concluded === true
    && result.turns[0]?.question === QUESTION_1 && result.turns[1]?.question === QUESTION_2
    && scriptedQuestions.length === 3);
  check('joined final transcripts hit 你好/世界 at character level (real speech → real transcript → real turn advance)',
    transcripts.every((t) => t.includes('你好') && t.includes('世界')));
  check('RMS endpointing closed BOTH turns at the deterministic predicted frame (server-side, zero model)',
    result.turns.every((t) => t.endedByEndpointing === true)
    && endReceipts.length === 2
    && endReceipts.every((r) => r.speechFrames >= 3 && r.silenceFrames >= 1)
    && !!predicted && endReceipts[0]?.frame === predicted.endFrame
    && endReceipts[1]?.frame === endpointReceipt(turn2Audio)?.endFrame);
  check('AI really spoke through the composition stream TTS seam (progressive real mp3 chunks)',
    ttsChunkCount >= 2 && ttsByteCount >= 2000);
  check('mid-turn barge-in: user speech interrupted still-playing TTS (turn 2 opens on speech) and the answer still landed (clean switch, no hang)',
    result.turns[1]?.ttsInterrupted === true && result.turns[1]?.endedByEndpointing === true && Date.now() - startedAt < 120_000);

  // ── 臂 3(纯静音回合 refuse-closed):零语音 → 端点不切·无 final → 不编造答案。 ──
  const silence2s = new Uint8Array(ASR_TARGET_RATE * 2 * 2);
  let silenceSubmits = 0;
  let silenceErr = 'no_error';
  try {
    await runVoiceAdaptiveInterview({
      asr: seams.streamAsr, tts: seams.streamTts, endpointing: {},
      start: async () => ({ question: QUESTION_1 }),
      submit: async () => { silenceSubmits++; return { done: true }; },
      userAudioFor: () => pcmChunks(silence2s),
    });
  } catch (e) { silenceErr = e instanceof Error ? e.message : String(e); }
  check('silence-only turn stays refuse-closed (no end_of_turn without speech, empty final refuses streaming_asr_malformed, zero invented answer)',
    silenceErr === 'streaming_asr_malformed' && silenceSubmits === 0);

  console.log(`VOICE_TURN_LIVE_RECEIPT ${JSON.stringify({
    turns: result.turns.length, concluded: result.concluded,
    turn1EndpointFrame: endReceipts[0]?.frame ?? null, turn2EndpointFrame: endReceipts[1]?.frame ?? null,
    predictedEndpointFrame: predicted?.endFrame ?? null,
    turn2TtsInterrupted: result.turns[1]?.ttsInterrupted ?? null,
    transcriptHead: transcripts.map((t) => t.slice(0, 24)),
    ttsChunks: ttsChunkCount, ttsBytes: ttsByteCount, echoPcmBytes: turn1Audio.byteLength,
    elapsedMs: Date.now() - startedAt,
    asrModel, ttsModel,
    loop: 'runVoiceAdaptiveInterview(real composition seams, scripted start/submit closure)',
    endpointing: 'RMS energy (voice-endpointing.ts, deterministic, zero model)',
    notExercised: 'product HTTP pipes (slice-1/2 receipts), real microphone, browser→API hop, production SLO',
    keySource: 'repo .env (user-authorized 2026-11-16), never persisted',
    releaseEvidence: false, notHa: true,
  })}`);
  check('receipt records real transport facts without key material',
    ttsByteCount > 0 && endReceipts.length === 2
    && !JSON.stringify({ asrModel, ttsModel, transcripts: transcripts.map((t) => t.slice(0, 24)) }).includes(providerKey));

  console.log(`\n${failures === 0
    ? '✓ server turn-taking product loop live receipt recorded (local receipt; releaseEvidence=false; skip≠pass preserved for keyless runs)'
    : `✗ ${failures} assertion(s) failed`}`);
  process.exit(failures === 0 ? 0 : 1);
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});

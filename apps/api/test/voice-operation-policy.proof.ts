/**
 * TC-MODEL-ROUTE-03-E3: inspect the actual Nest module provider factories.
 * This is intentionally transport-free: no Key, audio or provider endpoint is
 * loaded, and every default API voice seam must reject before `fetch`.
 */
import 'reflect-metadata';
import assert from 'node:assert/strict';
import { MODULE_METADATA } from '@nestjs/common/constants';
import { InterviewModule } from '../src/modules/interview/interview.module.ts';
import { VOICE_ASR, VOICE_STREAM_ASR, VOICE_STREAM_TTS, VOICE_TTS } from '../src/modules/interview/interview.service.ts';
import { createInterviewVoiceSeams, type Asr, type StreamingAsr, type StreamingTts, type Tts } from '@meetwise/ai-runtime';

let failures = 0;
const check = (name: string, condition: boolean) => {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`);
  if (!condition) failures++;
};

async function errorOf(action: () => Promise<unknown>): Promise<string> {
  try { await action(); return 'no_error'; }
  catch (error) { return error instanceof Error ? error.message : String(error); }
}

function providerFactory(token: symbol): () => unknown {
  const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, InterviewModule) as Array<{ provide?: symbol; useFactory?: () => unknown }>;
  const provider = providers.find((candidate) => candidate.provide === token);
  if (!provider || typeof provider.useFactory !== 'function') assert.fail(`missing voice provider:${String(token)}`);
  return provider.useFactory;
}

async function main() {
  const keyVars = [
    'DASHSCOPE_ASR_API_KEY', 'DASHSCOPE_TTS_API_KEY', 'DASHSCOPE_API_KEY',
    'DASHSCOPE_STREAM_ASR_API_KEY', 'DASHSCOPE_STREAM_TTS_API_KEY',
    'VOICE_STREAM_ASR_ENABLED', 'VOICE_STREAM_ASR_PREVIEW',
    'DASHSCOPE_STREAM_TTS_MODEL', 'DASHSCOPE_STREAM_TTS_VOICE',
    // 生产锁三件一并摘除:回归 runner 会把仓根 .env 注入子进程 env,不摘则三重门臂会因继承锁而如实 false。
    'NODE_ENV', 'MODEL_COST_ENFORCEMENT', 'MEETWISE_PUBLIC_PREVIEW',
  ] as const;
  const saved = new Map<string, string | undefined>();
  for (const name of keyVars) saved.set(name, process.env[name]);
  for (const name of keyVars) delete process.env[name];
  const originalFetch = globalThis.fetch;
  let fetches = 0;
  globalThis.fetch = (async () => {
    fetches++;
    throw new Error('unexpected_provider_fetch');
  }) as typeof fetch;
  try {
    const asr = providerFactory(VOICE_ASR)() as Asr;
    const tts = providerFactory(VOICE_TTS)() as Tts;
    const stream = providerFactory(VOICE_STREAM_TTS)() as StreamingTts;
    const streamAsr = providerFactory(VOICE_STREAM_ASR)() as StreamingAsr;
    check('default API ASR provider is fail-closed before transport',
      await errorOf(() => asr.transcribe(new Uint8Array([1]))) === 'asr_not_configured');
    check('default API TTS provider is fail-closed before transport',
      await errorOf(() => tts.synthesize('synthetic text')) === 'tts_not_configured');
    check('default API streaming TTS provider is fail-closed before transport',
      await errorOf(() => stream.synthesizeStream('synthetic text')[Symbol.asyncIterator]().next()) === 'streaming_tts_not_configured');
    check('default API streaming ASR provider is fail-closed before transport',
      await errorOf(() => streamAsr.transcribeStream((async function* () { yield new Uint8Array([1]); })())[Symbol.asyncIterator]().next()) === 'streaming_asr_not_configured');
    check('default API voice providers make zero provider fetches', fetches === 0);
    const seams = createInterviewVoiceSeams();
    check('composition factory without Keys stays unconfigured (turn-taking triple gate closed)',
      seams.asrConfigured === false && seams.ttsConfigured === false
      && seams.streamTtsConfigured === false
      && seams.streamAsrConfigured === false && seams.turnTakingConfigured === false);
    // 服务端 turn-taking（第三刀·预览组合）honest 面：三重门齐（双流缝 Key+wired ∧ 精确双旗 ∧ 非生产锁）
    // → turnTakingConfigured 如实翻 true；这是组合位不是新模型操作，零外呼零 socket。
    process.env.DASHSCOPE_STREAM_TTS_API_KEY = 'preview-stream-tts-key';
    process.env.DASHSCOPE_STREAM_ASR_API_KEY = 'preview-stream-asr-key';
    process.env.VOICE_STREAM_ASR_ENABLED = '1';
    process.env.VOICE_STREAM_ASR_PREVIEW = '1';
    const tripleSeams = createInterviewVoiceSeams();
    check('triple gate satisfied (both stream seams wired + dual flags + not locked) flips turnTakingConfigured true',
      tripleSeams.streamTtsConfigured === true && tripleSeams.streamAsrConfigured === true
      && tripleSeams.turnTakingConfigured === true && fetches === 0);
    delete process.env.DASHSCOPE_STREAM_TTS_API_KEY;
    delete process.env.DASHSCOPE_STREAM_ASR_API_KEY;
    delete process.env.VOICE_STREAM_ASR_ENABLED;
    delete process.env.VOICE_STREAM_ASR_PREVIEW;
    check('composition stream ASR stays fail-closed before transport',
      await errorOf(() => seams.streamAsr.transcribeStream((async function* () { yield new Uint8Array([1]); })())[Symbol.asyncIterator]().next()) === 'streaming_asr_not_configured');
    process.env.DASHSCOPE_API_KEY = 'legacy-broad-key';
    const poisonedAsr = providerFactory(VOICE_ASR)() as Asr;
    const poisonedTts = providerFactory(VOICE_TTS)() as Tts;
    check('legacy broad key does not crash InterviewModule factories',
      await errorOf(() => poisonedAsr.transcribe(new Uint8Array([1]))) === 'asr_not_configured'
      && await errorOf(() => poisonedTts.synthesize('synthetic text')) === 'tts_not_configured'
      && fetches === 0);
    delete process.env.DASHSCOPE_API_KEY;
    // 流式 TTS 产品接线（预览）honest 面：Key 在 → 模块工厂给出 live 缝（id=cosyvoice-v2）；
    // 双旗门仍在 synthesizeStream 内 → 无旗照旧 streaming_tts_not_configured，零外呼。
    process.env.DASHSCOPE_STREAM_TTS_API_KEY = 'preview-stream-tts-key';
    const wiredStream = providerFactory(VOICE_STREAM_TTS)() as StreamingTts;
    check('stream TTS Key wires the module factory to the cosyvoice adapter (id reflects default model)',
      wiredStream.id === 'cosyvoice-v2');
    check('composed stream TTS without dual preview flags still refuses before transport',
      await errorOf(() => wiredStream.synthesizeStream('synthetic text')[Symbol.asyncIterator]().next()) === 'streaming_tts_not_configured'
      && fetches === 0);
    delete process.env.DASHSCOPE_STREAM_TTS_API_KEY;
    // 流式 ASR 产品接线（预览）honest 面：Key 在 → 模块工厂给出 live 缝（id=paraformer-realtime-v2）；
    // 双旗门仍在 transcribeStream 内 → 无旗照旧 streaming_asr_not_configured，零外呼。
    process.env.DASHSCOPE_STREAM_ASR_API_KEY = 'preview-stream-asr-key';
    const wiredAsrStream = providerFactory(VOICE_STREAM_ASR)() as StreamingAsr;
    check('stream ASR Key wires the module factory to the paraformer adapter (id reflects default model)',
      wiredAsrStream.id === 'paraformer-realtime-v2');
    check('composed stream ASR without dual preview flags still refuses before transport',
      await errorOf(() => wiredAsrStream.transcribeStream((async function* () { yield new Uint8Array([1]); })())[Symbol.asyncIterator]().next()) === 'streaming_asr_not_configured'
      && fetches === 0);
    delete process.env.DASHSCOPE_STREAM_ASR_API_KEY;
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of saved) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
  console.log(`\n${failures === 0 ? '✓ API voice operation policy passed' : `✗ ${failures} assertion(s) failed`}`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();

/**
 * TC-MODEL-ROUTE-03-E3: inspect the actual Nest module provider factories.
 * This is intentionally transport-free: no Key, audio or provider endpoint is
 * loaded, and every default API voice seam must reject before `fetch`.
 */
import 'reflect-metadata';
import assert from 'node:assert/strict';
import { MODULE_METADATA } from '@nestjs/common/constants';
import { InterviewModule } from '../src/modules/interview/interview.module.ts';
import { VOICE_ASR, VOICE_STREAM_TTS, VOICE_TTS } from '../src/modules/interview/interview.service.ts';
import type { Asr, StreamingTts, Tts } from '@meetwise/ai-runtime';

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
    check('default API ASR provider is fail-closed before transport',
      await errorOf(() => asr.transcribe(new Uint8Array([1]))) === 'asr_not_configured');
    check('default API TTS provider is fail-closed before transport',
      await errorOf(() => tts.synthesize('synthetic text')) === 'tts_not_configured');
    check('default API streaming TTS provider is fail-closed before transport',
      await errorOf(() => stream.synthesizeStream('synthetic text')[Symbol.asyncIterator]().next()) === 'streaming_tts_not_configured');
    check('default API voice providers make zero provider fetches', fetches === 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
  console.log(`\n${failures === 0 ? '✓ API voice operation policy passed' : `✗ ${failures} assertion(s) failed`}`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();

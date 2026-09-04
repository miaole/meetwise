/** Fake-seam voice-adaptive contract. Not product E2E. pnpm voice-adaptive:prove */
import { fakeStreamingAsr, fakeStreamingTts } from '@meetwise/ai-runtime';
import { runVoiceAdaptiveInterview } from '../src/voice-adaptive.ts';
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
async function* audio(n: number) { for (let i = 0; i < n; i++) yield new Uint8Array([i]); }

async function errorOf(action: () => Promise<unknown>): Promise<string> {
  try { await action(); return 'no_error'; }
  catch (error) { return error instanceof Error ? error.message : String(error); }
}

async function main() {
  const saved = {
    NODE_ENV: process.env.NODE_ENV,
    VOICE_STREAM_ASR_ENABLED: process.env.VOICE_STREAM_ASR_ENABLED,
    VOICE_STREAM_ASR_PREVIEW: process.env.VOICE_STREAM_ASR_PREVIEW,
    MODEL_COST_ENFORCEMENT: process.env.MODEL_COST_ENFORCEMENT,
    MEETWISE_PUBLIC_PREVIEW: process.env.MEETWISE_PUBLIC_PREVIEW,
  };
  const ANS = '我用滑动窗口加令牌桶做限流';
  const submitted: string[] = [];
  let q = 0;
  const deps = {
    asr: fakeStreamingAsr(ANS), tts: fakeStreamingTts(4),
    start: async () => ({ question: '第1题:谈谈限流' }),
    submit: async (answer: string) => { submitted.push(answer); q++; return q < 2 ? { nextQuestion: `第${q + 1}题:谈谈降级`, done: false } : { done: true }; },
    userAudioFor: () => audio(5),
  };

  try {
    delete process.env.VOICE_STREAM_ASR_ENABLED;
    delete process.env.VOICE_STREAM_ASR_PREVIEW;
    delete process.env.MODEL_COST_ENFORCEMENT;
    delete process.env.MEETWISE_PUBLIC_PREVIEW;
    process.env.NODE_ENV = 'test';
    A('default (no preview flags) refuses turn-taking and does not submit an invented answer',
      await errorOf(() => runVoiceAdaptiveInterview(deps)) === 'voice_turn_taking_not_configured'
      && submitted.length === 0);

    process.env.VOICE_STREAM_ASR_ENABLED = '1';
    A('ENABLED=1 without PREVIEW is unconfigured, submit increment stays 0',
      await errorOf(() => runVoiceAdaptiveInterview(deps)) === 'voice_turn_taking_unconfigured'
      && submitted.length === 0);

    process.env.VOICE_STREAM_ASR_PREVIEW = '1';
    process.env.NODE_ENV = 'production';
    A('production + dual flags still refuses turn-taking',
      await errorOf(() => runVoiceAdaptiveInterview(deps)) === 'voice_turn_taking_unconfigured'
      && submitted.length === 0);

    process.env.NODE_ENV = 'test';
    process.env.MODEL_COST_ENFORCEMENT = 'enforce';
    A('enforce + dual flags still refuses turn-taking',
      await errorOf(() => runVoiceAdaptiveInterview(deps)) === 'voice_turn_taking_unconfigured'
      && submitted.length === 0);
    delete process.env.MODEL_COST_ENFORCEMENT;

    process.env.MEETWISE_PUBLIC_PREVIEW = '1';
    A('public preview + dual flags still refuses turn-taking',
      await errorOf(() => runVoiceAdaptiveInterview(deps)) === 'voice_turn_taking_unconfigured'
      && submitted.length === 0);
    delete process.env.MEETWISE_PUBLIC_PREVIEW;

    let ttsChunks = 0;
    const r = await runVoiceAdaptiveInterview({ ...deps, onTtsChunk: () => ttsChunks++ });
    A('preview flags + fake seams run 2 turns (isolated contract, not product E2E)', r.turns.length === 2 && r.concluded === true);
    A('each turn streamed TTS chunks', ttsChunks > 1);
    A('ASR transcript is the submitted answer (modality-agnostic ≡ text)', submitted.length === 2 && submitted.every((a) => a === ANS));
    A('lifecycle supplies the next question', r.turns[1]?.question.includes('第2题') ?? false);

    const emptySubmitted: string[] = [];
    const emptyDeps = {
      asr: fakeStreamingAsr('   '), tts: fakeStreamingTts(4),
      start: async () => ({ question: '第1题' }),
      submit: async (answer: string) => { emptySubmitted.push(answer); return { done: true }; },
      userAudioFor: () => audio(2),
    };
    A('empty/whitespace transcript is refuse-closed and is not submitted as an invented answer',
      await errorOf(() => runVoiceAdaptiveInterview(emptyDeps)) === 'streaming_asr_malformed'
      && emptySubmitted.length === 0);
  } finally {
    for (const [name, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }

  console.log(`\n${fail === 0 ? '✓ voice-adaptive fake-seam contract passed (not product stream ASR / E2E)' : '✗ ' + fail + ' failed'}`);
  process.exit(fail === 0 ? 0 : 1);
}
main();

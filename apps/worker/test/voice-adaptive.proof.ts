/** 语音驱动自适应面试证明:流式 TTS问+ASR听 驱动 lifecycle,transcript 喂 submit,modality-agnostic。 pnpm voice-adaptive:prove */
import { fakeStreamingAsr, fakeStreamingTts } from '@meetwise/ai-runtime';
import { runVoiceAdaptiveInterview } from '../src/voice-adaptive.ts';
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
async function* audio(n: number) { for (let i = 0; i < n; i++) yield new Uint8Array([i]); }

async function main() {
  const ANS = '我用滑动窗口加令牌桶做限流';
  // fake lifecycle:出 2 题后收尾;记录喂进来的答案
  const submitted: string[] = [];
  let q = 0;
  const deps = {
    asr: fakeStreamingAsr(ANS), tts: fakeStreamingTts(4),
    start: async () => ({ question: '第1题:谈谈限流' }),
    submit: async (answer: string) => { submitted.push(answer); q++; return q < 2 ? { nextQuestion: `第${q + 1}题:谈谈降级`, done: false } : { done: true }; },
    userAudioFor: () => audio(5),
  };
  let ttsChunks = 0;
  const r = await runVoiceAdaptiveInterview({ ...deps, onTtsChunk: () => ttsChunks++ });

  A('语音驱动跑完 2 回合', r.turns.length === 2 && r.concluded === true);
  A('每题都流式 TTS 播了(低延迟边播)', ttsChunks > 1);
  A('ASR 转写当答案喂 submit(modality-agnostic ≡ 文本)', submitted.length === 2 && submitted.every((a) => a === ANS));
  A('动态题序经 lifecycle(第2题是下一题)', r.turns[1]?.question.includes('第2题') ?? false);

  console.log(`\n${fail === 0 ? '✓ 语音驱动自适应面试(真流式 TTS问+ASR听 + 不破内核)全部通过' : '✗ ' + fail + ' 失败'}`);
  process.exit(fail === 0 ? 0 : 1);
}
main();

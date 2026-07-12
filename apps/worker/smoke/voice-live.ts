/**
 * 真语音答题实测:真音频 → 真 ASR(qwen-audio) → 推进真面试图(PostgresSaver checkpointer)。
 * 证明语音答案端到端驱动 agent 内核(与文本完全同一条图路径)。手动,需 .env + scratchpad/answer.mp3。
 *   pnpm voice:live   (需 pnpm db:up)
 */
import { readFileSync } from 'node:fs';
import { buildMockInterviewGraph } from '@meetwise/ai-graphs';
import { dashscopeAsr, dashscopeTts } from '@meetwise/ai-runtime';
import { createCheckpointer } from '../src/main.ts';
import { voiceAnswerTurn } from '../src/voice-turn.ts';

for (const line of readFileSync(new URL('../../../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^(MODEL_[A-Z_]+|ASR_MODEL)=(.*)$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const AUDIO = '/private/tmp/claude-501/-Users-miaole-Desktop-golucky-meetwise/de307e7b-b845-4c8d-8fbd-f683c5b922eb/scratchpad/answer.mp3';

async function main() {
  const cp = createCheckpointer(); await cp.setup();
  const QS = ['谈谈你订单系统的限流方案', '滑动窗口和固定窗口的区别'];
  const g = buildMockInterviewGraph(cp, QS);
  const cfg = { configurable: { thread_id: 'voicelive-' + Date.now() } };
  await g.invoke({}, cfg);                                    // → interrupt 第1题
  console.log('问题1(可 TTS 播):', QS[0]);

  const audio = new Uint8Array(readFileSync(AUDIO));
  console.log('用户语音作答(', audio.length, 'bytes)→ 真 ASR 转写 → 喂同一图');
  const turn = await voiceAnswerTurn({ asr: dashscopeAsr(), tts: dashscopeTts(), graph: g, cfg }, audio);
  console.log('ASR 转写:', turn.transcript);
  console.log('下一题(真 TTS 合成):', turn.nextQuestion, '→', turn.questionAudio?.length, 'bytes wav');

  const snap = await g.getState(cfg);
  const ok = snap.values.answers.length === 1 && snap.values.answers[0] === turn.transcript
    && turn.nextQuestion === QS[1] && (turn.questionAudio?.length ?? 0) > 1000;
  console.log(ok ? '✓ 真语音答案经 ASR 端到端推进了真面试图(语音=文本,内核不变)' : '✗ 未贯通');
  process.exit(ok ? 0 : 1);
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });

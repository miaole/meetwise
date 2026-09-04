/**
 * 语音面试证明（对真 Postgres checkpointer）：证明**同一面试图经语音(ASR/TTS)推进,与纯文本路径行为完全一致**(modality-agnostic)。
 * 语音只是边缘适配器:转写当答案、下一题合成音频,checkpointer/续会话/状态机一行不动。CI 用 fake ASR/TTS(不联网)。
 *   pnpm voice:prove   (需 pnpm db:up)
 */
import { buildMockInterviewGraph } from '@meetwise/ai-graphs';
import { fakeAsr, fakeTts } from '@meetwise/ai-runtime';
import { Command } from '@langchain/langgraph';
import { createCheckpointer } from '../src/main.ts';
import { previewVoiceAnswerTurn } from '../src/interview-voice.ts';

let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };
const QUESTIONS = ['如何设计高并发限流器?', '滑动窗口和固定窗口的区别?'];
const ANSWERS = ['用 Redis 计数器加滑动窗口', '滑动窗口更平滑,固定窗口有临界突刺'];

async function main() {
  const cp = createCheckpointer(); await cp.setup();
  const run = String(Date.now());

  console.log('\n──────── 语音路径:ASR 转写当答案、TTS 合成下一题,同一图推进 ────────');
  const gV = buildMockInterviewGraph(cp, QUESTIONS);
  const cfgV = { configurable: { thread_id: `voice-${run}` } };
  await gV.invoke({}, cfgV);                                          // → interrupt 第1题
  const t1 = await previewVoiceAnswerTurn({ asr: fakeAsr(ANSWERS[0]!), tts: fakeTts(), graph: gV, cfg: cfgV }, new Uint8Array([1, 2, 3]));
  A('第1轮:语音答案被 ASR 转写并推进图', t1.transcript === ANSWERS[0]);
  A('第1轮:下一题被 TTS 合成出音频', !!t1.questionAudio && t1.nextQuestion === QUESTIONS[1]);
  const t2 = await previewVoiceAnswerTurn({ asr: fakeAsr(ANSWERS[1]!), tts: fakeTts(), graph: gV, cfg: cfgV }, new Uint8Array([4, 5, 6]));
  A('第2轮:答完,会话完成(done)', t2.done && !t2.nextQuestion);
  const snapV = await gV.getState(cfgV);

  console.log('──────── 文本路径:同样的答案,纯文本 resume ────────');
  const gT = buildMockInterviewGraph(cp, QUESTIONS);
  const cfgT = { configurable: { thread_id: `text-${run}` } };
  await gT.invoke({}, cfgT);
  for (const a of ANSWERS) await gT.invoke(new Command({ resume: a }), cfgT);
  const snapT = await gT.getState(cfgT);

  console.log('──────── 对比:语音路径 ≡ 文本路径(modality-agnostic) ────────');
  A('语音路径持久 2 问 2 答', snapV.values.questions.length === 2 && snapV.values.answers.length === 2);
  A('语音转写即答案,与文本路径逐字相同', JSON.stringify(snapV.values.answers) === JSON.stringify(ANSWERS) && JSON.stringify(snapV.values.answers) === JSON.stringify(snapT.values.answers));
  A('两条路径最终图状态完全一致(agent 内核不区分语音/文本)', JSON.stringify(snapV.values) === JSON.stringify(snapT.values));
  A('两路径均无残留 interrupt(都正常完成)', snapV.next.length === 0 && snapT.next.length === 0);

  console.log(`\n${failures === 0 ? '✓ 语音面试 modality-agnostic 全部通过(ASR/TTS 边缘,图不变)' : '✗ ' + failures + ' 项失败'}`);
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });

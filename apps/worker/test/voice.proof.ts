/**
 * 语音面试证明（对真 Postgres checkpointer）：证明**同一面试图经语音(ASR/TTS)推进,与纯文本路径行为完全一致**(modality-agnostic)。
 * 语音只是边缘适配器:转写留在适配器返回值,图状态作答固定为 answer_omitted;下一题合成音频,checkpointer/续会话/状态机一行不动。CI 用 fake ASR/TTS(不联网)。
 *   pnpm voice:prove   (需 pnpm db:up)
 *
 * 世界口径（AG-32 rev r1 注记·证伪外席2 P2）：本 proof 在隔离 runner 的 boot 世界跑
 * （预迁移名单不含 0047 checkpoint 隐私栅栏等业务迁移——本证面是 mock 图边缘契约,零业务表依赖,
 * boot 世界自足）；其断言不涉及 0047 管辖面（守卫不绕面/同意门/内容安全/计费/隐私栅栏）。
 * AG-32 守卫不绕面与生产接线形由 voice-adaptive.proof 在全量真迁移链（loadMigrations+runMigrations）
 * 的隔离 PG 世界承载——本门（runner voice:prove）绿不得读成产品世界证据。
 */
import { buildMockInterviewGraph } from '@meetwise/ai-graphs';
import { fakeAsr, fakeTts } from '@meetwise/ai-runtime/test-support';   // #74: fake 族经 test-support 子路径
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

  console.log('\n──────── 语音路径:ASR 转写留在适配器,TTS 合成下一题,同一图推进 ────────');
  const gV = buildMockInterviewGraph(cp, QUESTIONS);
  const cfgV = { configurable: { thread_id: `voice-${run}` } };
  await gV.invoke({}, cfgV);                                          // → interrupt 第1题
  // AG-32: voice-turn 不再直触图——resume 形归提交闭包（mock 图的契约是字符串 resume,
  // adaptive 图的 { answerId } 契约由 voice-adaptive.proof 的真 submitAdaptiveAnswer 覆盖）。
  const submitV = async (answer: string) => {
    await gV.invoke(new Command({ resume: answer }), cfgV);
    const snap = await gV.getState(cfgV) as unknown as {
      tasks?: Array<{ interrupts?: Array<{ value?: { question?: string } }> }>;
      next: unknown[];
    };
    return { nextQuestion: snap.tasks?.[0]?.interrupts?.[0]?.value?.question, done: snap.next.length === 0 };
  };
  const t1 = await previewVoiceAnswerTurn({ asr: fakeAsr(ANSWERS[0]!), tts: fakeTts(), submit: submitV }, new Uint8Array([1, 2, 3]));
  A('第1轮:语音答案被 ASR 转写并推进图', t1.transcript === ANSWERS[0]);
  A('第1轮:下一题被 TTS 合成出音频', !!t1.questionAudio && t1.nextQuestion === QUESTIONS[1]);
  const t2 = await previewVoiceAnswerTurn({ asr: fakeAsr(ANSWERS[1]!), tts: fakeTts(), submit: submitV }, new Uint8Array([4, 5, 6]));
  A('第2轮:答完,会话完成(done)', t2.done && !t2.nextQuestion);
  const snapV = await gV.getState(cfgV);

  console.log('──────── 文本路径:同样的答案,纯文本 resume ────────');
  const gT = buildMockInterviewGraph(cp, QUESTIONS);
  const cfgT = { configurable: { thread_id: `text-${run}` } };
  await gT.invoke({}, cfgT);
  for (const a of ANSWERS) await gT.invoke(new Command({ resume: a }), cfgT);
  const snapT = await gT.getState(cfgT);

  const answersOmitted = (answers: string[], n: number) =>
    answers.length === n && answers.every((item) => item === 'answer_omitted');
  const rawAbsent = (values: { questions: string[]; answers: string[] }) => {
    const blob = JSON.stringify(values);
    return ANSWERS.every((raw) => !blob.includes(raw));
  };
  console.log('──────── 对比:语音路径 ≡ 文本路径(modality-agnostic) ────────');
  A('语音路径题目顺序仍是 QUESTIONS，作答条数与轮数一致且每项为 answer_omitted',
    JSON.stringify(snapV.values.questions) === JSON.stringify(QUESTIONS)
    && answersOmitted(snapV.values.answers, ANSWERS.length)
    && rawAbsent(snapV.values));
  A('文本路径题目顺序与作答标记相同，原文不进 values',
    JSON.stringify(snapT.values.questions) === JSON.stringify(QUESTIONS)
    && answersOmitted(snapT.values.answers, ANSWERS.length)
    && rawAbsent(snapT.values));
  A('两条路径最终图状态完全一致(agent 内核不区分语音/文本)', JSON.stringify(snapV.values) === JSON.stringify(snapT.values));
  A('两路径均无残留 interrupt(都正常完成)', snapV.next.length === 0 && snapT.next.length === 0);

  console.log(`\n${failures === 0 ? '✓ 语音面试 modality-agnostic 全部通过(ASR/TTS 边缘,图不变)' : '✗ ' + failures + ' 项失败'}`);
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });

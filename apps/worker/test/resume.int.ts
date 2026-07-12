/**
 * worker 集成证明（对真 Postgres）：mock-interview 纯图 + PostgresSaver checkpointer
 * 证明头号差异化在真框架上成立：interrupt 持久化等待用户，换新图实例（模拟进程重启）
 * 后凭 thread_id 从 Postgres 续上同一会话——无内存 session。
 *   pnpm graph:prove   (需 pnpm db:up)
 */
import { Command } from '@langchain/langgraph';
import { buildMockInterviewGraph } from '@meetwise/ai-graphs';
import { createCheckpointer } from '../src/main.ts';

const QUESTIONS = ['如何设计一个高并发限流器？', '滑动窗口和固定窗口的区别？'];

let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };
const pendingQuestion = (snap: any) => snap.tasks?.[0]?.interrupts?.[0]?.value?.question;
const build = (cp: any) => buildMockInterviewGraph(cp, QUESTIONS);

async function main() {
  const checkpointer = createCheckpointer();
  await checkpointer.setup();

  const run = String(Date.now());
  const cfg = { configurable: { thread_id: `R-${run}-1` } };

  console.log('\n──────── 第 1 轮：interrupt 持久化等待 ────────');
  let g = build(checkpointer);
  await g.invoke({}, cfg);
  let snap = await g.getState(cfg);
  A('真 LangGraph：首问触发 interrupt 且会话被持久化', pendingQuestion(snap) === QUESTIONS[0] && snap.next.length > 0);

  console.log('──────── 模拟进程重启：新图实例从 Postgres 恢复 ────────');
  g = build(checkpointer); // 全新实例，无内存延续
  await g.invoke(new Command({ resume: '用 Redis 计数器，每请求 +1 超阈拒绝' }), cfg);
  snap = await g.getState(cfg);
  A('新实例凭 thread_id 从 checkpointer 续上，问第 2 题', pendingQuestion(snap) === QUESTIONS[1]);
  A('第 1 题答案已持久（questions/answers 各 1）', snap.values.questions.length === 1 && snap.values.answers.length === 1);

  console.log('──────── 第 2 轮答完：会话完成 ────────');
  g = build(checkpointer);
  await g.invoke(new Command({ resume: '滑动窗口更平滑，固定窗口有临界突刺' }), cfg);
  snap = await g.getState(cfg);
  A('两轮答完，持久状态含 2 问 2 答', snap.values.questions.length === 2 && snap.values.answers.length === 2);
  A('无残留 interrupt（会话完成）', snap.next.length === 0);

  console.log('──────── 多会话隔离 ────────');
  const cfg2 = { configurable: { thread_id: `R-${run}-2` } };
  g = build(checkpointer);
  await g.invoke({}, cfg2);
  const snap2 = await g.getState(cfg2);
  A('另一 thread 独立、互不串（停在各自第 1 题）',
    pendingQuestion(snap2) === QUESTIONS[0] && snap2.values.questions.length === 0);

  console.log(`\n${failures === 0 ? '✓ 全部通过' : '✗ ' + failures + ' 项失败'}`);
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });

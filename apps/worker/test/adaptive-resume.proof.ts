/** AG 修复轨刀 A 确定性 proof：AG-05 alreadyApplied invoke(null) 续跑 + AG-26 start 续跑。
 *  蓝本=ai-docs/delivery/harness/ag-a-resume-REQUEST.md §2-1/§2-4（裁决项②双形都做）。
 *  两个崩溃窗口（两形×两面·全部确定性进程内注入）：
 *  形①两段驱动——lifecycle 起跑→绕过业务投影直驱图 Command(resume)，模型 seam 注入抛错
 *  （generate-question.ts:65 无 try/catch，seam 抛错=genQuestion 中途 worker 死·任务 writes 未落）：
 *  坠点形态=「transcript 已含本题答案·next=[genQuestion]·无 pending interrupt」→ alreadyApplied
 *  续跑守卫走 invoke(null) 执行面（ask+1·evaluate 零重评·推进到下一 interrupt）。
 *  形②MemorySaver+checkpoint 边界注入抛错——genQuestion 已完成、下一 checkpoint 落盘前坠
 *  （壳内 freeze 修正 MemorySaver 按引用存对象的别名泄漏，对齐 PostgresSaver 字节冻结语义）：
 *  任务 writes 已 putWrites 持久化、checkpoint 未推进 → getState pending 已见下一题·next 空 →
 *  alreadyApplied 守卫不误触，走既有纯投影重放路径（零图执行·同题 identity·零模型重调）。
 *  AG-26 两面同构：a 面（decide 后 genQuestion 前坠·pending 空 next 非空）=invoke(null) 执行面
 *  （plan 节点零重执行·不从 START 重开）；b 面（genQuestion writes 已持久化后坠）=纯投影面。
 *  脚本模型(CI)；MemorySaver；真实 PG 隔离库投影面。 pnpm adaptive-resume:prove */
import { fileURLToPath } from 'node:url';
import { MemorySaver, Command } from '@langchain/langgraph';
import { randomUUID } from 'node:crypto';
import { createPool, asPrincipal, reserveEntitlement, answerHash, claimInterviewAnswer, loadMigrations, runMigrations } from '@meetwise/db';
import { scriptedModelClient, type GraphObserver, type GraphNodeObservation, type GraphRunObservation, type ModelClient } from '@meetwise/ai-runtime';
import { buildAdaptiveInterviewGraph } from '@meetwise/ai-graphs';
import { startAdaptiveInterview, submitAdaptiveAnswer, type AdaptiveLifecycleDeps } from '../src/adaptive-lifecycle.ts';
import { buildAdaptiveDeps } from '../src/adaptive-interview-service.ts';

// Test-only HMAC key for job route input hashing (same pattern as adaptive-lifecycle.proof.ts; not production).
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'adaptive-resume-job-route-input-hmac-proof-key-not-production-01';

const pool = createPool();
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const OWNER = 'lifeA-RESUME';
const CRASH_MSG = 'E2E_CRASH_INJECTED_WORKER_DEATH';

let askSeq = 0;
const base = scriptedModelClient({
  // planner 输出条数硬闸 PLANNER_COMPETENCY_MIN_COUNT=3（#201）——脚本给满 3 条，planner invocation settle 成功不污染断言面。
  'planner.competencies': () => ({ ok: true, raw: { competencies: ['并发', '缓存', '事务边界'] } }),
  'interviewer.ask': () => ({
    ok: true,
    raw: { q: `结合你的限流经历聊聊高并发下怎么兼顾吞吐与一致，并说明第 ${++askSeq} 轮验证方法`, refs: [] },
  }),
  'mock-interview.evaluate': () => ({ ok: true, raw: { relevant: true, hasHook: false, dispositions: [{ criterionId: 'answer_quality', disposition: 'exceeds', quote: '滑动窗口' }] } }),
});
const modelCounts: Record<string, number> = {};
const model: ModelClient = {
  async complete(req, attempt) {
    modelCounts[req.service] = (modelCounts[req.service] ?? 0) + 1;
    return base.complete(req, attempt);
  },
};

/** 节点级观测计数：断言「从断点续跑非 START 重开」（plan/evalAnswer 重执行即红）。 */
const nodeCounter = (): { observer: GraphObserver; counts: Record<string, number> } => {
  const counts: Record<string, number> = {};
  const observer: GraphObserver = {
    async runGraph<T>(_input: GraphRunObservation, action: () => Promise<T>): Promise<T> { return action(); },
    async runNode<T>(input: GraphNodeObservation, action: () => T | Promise<T>): Promise<T> {
      counts[input.node] = (counts[input.node] ?? 0) + 1;
      return await action();
    },
  };
  return { observer, counts };
};

/**
 * checkpoint 注入体（形②/AG-26 b 面）：MemorySaver 子类，存储委托既有 inner cp（同 thread 数据
 * 连续），仅对「下一题 pending 即将落盘」的 checkpoint put 抛错一次（latch）：channel_values.pending
 * 出现 questionId !== answeredQuestionId 的新题、transcript 为空（start 首题）或末条恰为已答题
 * （answer 下一题）→ 下一 checkpoint 推进前坠。
 * 注：真「执行面续跑」窗口（pending 空·next=[genQuestion]·writes 未落）不在此复现——decide→
 * genQuestion 边界的 put 拒绝在 durability-async 下走 fire-and-forget 链、loop 半续跑致坠点态不
 * 确定（run7/run8 实证）；该窗口以形① 的 seam 注入直驱法确定复现（形① 与 AG-26 a 面）。
 * Durability 语义修正：MemorySaver 缺省按引用存 checkpoint 对象，LangGraph 随后原对象就地写（run5
 * 实证：坠后 getState 泄漏后至 superstep 的状态）；真实 durable checkpointer（PostgresSaver）在 put
 * 时即字节冻结。壳内 structuredClone（仅 put/putWrites 入库侧·getTuple 侧保持原样交还 loop）修正。
 */
const freeze = <T>(x: T): T => (x == null ? x : (structuredClone(x) as T));
class CrashCheckpoint extends MemorySaver {
  private crashed = false;
  constructor(private readonly inner: MemorySaver, private readonly answeredQuestionId: string | null) { super(); }
  override async getTuple(config: any) { return this.inner.getTuple(config); }
  override list(config: any, ...rest: any[]): any { return ((this.inner as any).list as (...a: any[]) => any)(config, ...rest); }
  private hit(checkpoint: any): boolean {
    const values = checkpoint?.channel_values ?? {};
    const pendingQid: string | undefined = values?.pending?.questionId;
    const transcript: Array<{ questionId?: string }> = values?.transcript ?? [];
    const lastIsAnswered = transcript[transcript.length - 1]?.questionId === this.answeredQuestionId;
    return !!pendingQid && pendingQid !== this.answeredQuestionId && (transcript.length === 0 || lastIsAnswered);
  }
  override async put(config: any, checkpoint: any, metadata: any, ...rest: any[]) {
    if (!this.crashed && this.hit(checkpoint)) {
      this.crashed = true;
      throw new Error(CRASH_MSG);
    }
    return await ((this.inner as any).put as (...a: any[]) => any)(config, freeze(checkpoint), freeze(metadata), ...rest);
  }
  override async putWrites(config: any, writes: any, taskId: any) { return this.inner.putWrites(config, freeze(writes), taskId); }
  override async deleteThread(threadId: any) { return this.inner.deleteThread(threadId); }
}

/** 只读检查图（节点永不执行）：直读同 cp 同 thread 的 checkpoint 形态。 */
const inspect = async (cp: MemorySaver, threadId: string) => {
  const g = buildAdaptiveInterviewGraph(cp, {
    competencies: [],
    retrieveAndGenerate: async () => { throw new Error('inspect-only'); },
    assess: async () => { throw new Error('inspect-only'); },
    loadAnswer: async () => { throw new Error('inspect-only'); },
  } as any);
  return g.getState({ configurable: { thread_id: threadId } });
};

/** 直驱图（绕过 lifecycle 投影）：与 lifecycle 同源 buildAdaptiveDeps（真账本 seam），可覆写 retrieveAndGenerate 注入 seam 崩溃。 */
const directGraph = (cp: any, iid: string, input: { answerId: string; answer: string }, observer: GraphObserver, seamOverride?: (...a: any[]) => Promise<never>) => {
  const deps = buildAdaptiveDeps({
    pool, owner: OWNER, threadId: iid, model,
    competencies: ['并发', '缓存', '事务边界'],
    resumeProfileAvailable: false,
    localRetrieve: async () => [{ ref: 'qbank:a', score: 0.9 }],
    webExplore: async () => [],
    graphObserver: observer,
    loadAnswer: async (reference) => {
      if (reference.answerId !== input.answerId)
        throw Object.assign(new Error('answer_artifact_unavailable'), { code: 'answer_artifact_unavailable' });
      return input.answer;
    },
  });
  return buildAdaptiveInterviewGraph(cp, seamOverride ? { ...deps, retrieveAndGenerate: seamOverride } : deps);
};

const seedInterview = async (iid: string) => {
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')", [iid, OWNER]);
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, iid, 'mock_interview', 1.0));
};
const eventCount = async (iid: string, kind: string, eventKey?: string) => {
  const r: any = await asPrincipal(pool, OWNER, (c) => c.query(
    `SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind=$2 ${eventKey ? 'AND event_key=$3' : ''}`,
    eventKey ? [iid, kind, eventKey] : [iid, kind],
  ));
  return Number(r?.rows?.[0]?.n ?? -1);
};
const failedAskInvocationCount = async (iid: string) => {
  const r: any = await asPrincipal(pool, OWNER, (c) => c.query(
    "SELECT idempotency_key, error_code FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key LIKE $2 AND status='failed'", [OWNER, `${iid}:ask:%`],
  ));
  if ((r?.rows?.length ?? 0) > 0) console.log('DIAG failed ask invocations:', JSON.stringify(r.rows));
  return Number(r?.rows?.length ?? -1);
};
// durability async 下 checkpoint put 的拒绝可能不经 awaited invoke 链传播（fire-and-forget 写）——
// 真实世界=进程死亡本身;进程内模拟以 unhandledRejection 捕获等价替代。非本刀注入的意外拒绝大声退出。
let unhandledCrash: any = null;
process.on('unhandledRejection', (reason: any) => {
  if (reason?.message === CRASH_MSG) { unhandledCrash = reason; return; }
  console.error('✗ unexpected unhandledRejection', reason?.stack ?? reason);
  process.exit(1);
});

const baseLifecycleDeps = (cp: any, iid: string, observer?: GraphObserver): AdaptiveLifecycleDeps => ({
  pool, cp, owner: OWNER, interviewId: iid, model,
  localRetrieve: async () => [{ ref: 'qbank:a', score: 0.9 }], webExplore: async () => [],
  ...(observer ? { graphObserver: observer } : {}),
});

async function main() {
  await runMigrations(pool, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));
  // 五场场景各 reserve 1.0（对照+形①+形②+AG-26a+AG-26b）——桶容量 20.0 充足（沿 adaptive-lifecycle.proof.ts :30 同形）。
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',20.0, now()+interval '300 days')", [OWNER]);

  // ── 对照面：全新 thread start（invoke({}) START 起跑·AG-26 边界④「仅全新 thread」零回归）──
  const iid0 = 'life-resume-s0-' + Date.now();
  await seedInterview(iid0);
  const freshCounts = nodeCounter();
  const s0 = await startAdaptiveInterview(baseLifecycleDeps(new MemorySaver(), iid0, freshCounts.observer), '后端工程师', ['限流改造']);
  A('对照:全新 thread start → invoke({}) START 起跑出首题（plan 恰 1）', !!s0.questionId && s0.stateVersion === 1 && freshCounts.counts['plan'] === 1);

  // ══ 形①：两段驱动（lifecycle 起跑 → 绕过投影直驱图 Command(resume)·模型 seam 注入抛错）══
  // 窗口=genQuestion 执行中 worker 死：任务 writes 未落 → 坠点形态即 AG-05 红事实态 → invoke(null) 执行面续跑。
  console.log('\n──── 形① 两段驱动:genQuestion 中途 worker 死（模型 seam 注入抛错·执行面续跑）────');
  const iid1 = 'life-resume-s1-' + Date.now();
  await seedInterview(iid1);
  const cp1 = new MemorySaver();
  const drive1 = nodeCounter();
  const d1 = baseLifecycleDeps(cp1, iid1, drive1.observer);
  const s1 = await startAdaptiveInterview(d1, '后端工程师', ['限流改造']);
  A('形① phase1:start → 首题 identity', !!s1.questionId && s1.stateVersion === 1);
  const answer1 = '我用 Redis 计数器+滑动窗口扛高并发';
  const input1 = { questionId: s1.questionId!, stateVersion: s1.stateVersion!, answerId: randomUUID(), answerHash: answerHash(answer1), turn: 0, answer: answer1 };
  A('形① phase1:answer identity 被 API/DB ledger 接受', (await asPrincipal(pool, OWNER, (c) => claimInterviewAnswer(c, OWNER, iid1, input1))).status === 'accepted');

  const g1 = directGraph(cp1, iid1, input1, drive1.observer, async () => { throw new Error(CRASH_MSG); });
  let crashed1: any = null;
  try { await g1.invoke(new Command({ resume: { answerId: input1.answerId } }), { configurable: { thread_id: iid1 } }); } catch (e: any) { crashed1 = e; }
  A('形① phase2:注入抛错使 resume invoke 坠于 genQuestion（进程内 worker 死模拟）', crashed1?.message === CRASH_MSG);
  const snapCrash1: any = await inspect(cp1, iid1);
  const transcript1 = (snapCrash1.values?.transcript ?? []) as Array<{ questionId?: string }>;
  A('形① 坠点形态=AG-05 红事实:transcript 已含本题答案·next 非空·无 pending interrupt',
    transcript1[transcript1.length - 1]?.questionId === input1.questionId
    && (snapCrash1.next?.length ?? 0) > 0 && snapCrash1.values?.pending == null);

  // phase3:reaper 重排重入——同 answer identity 再调 submitAdaptiveAnswer（alreadyApplied=true）。
  // 基线在坠后重入前取：坠点驱动的 evalAnswer 评分是合法首评（transcript 已含），重入零「重」评。
  const askBefore1 = modelCounts['interviewer.ask'] ?? 0;
  const evalBefore1 = modelCounts['mock-interview.evaluate'] ?? 0;
  const resume1 = nodeCounter();
  const r1 = await submitAdaptiveAnswer({ ...d1, graphObserver: resume1.observer }, input1);
  A('形① alreadyApplied 续跑:返回下一题 identity 且 score=100（非旧形 done:false+undefined 挂死）', !!r1.nextQuestionId && r1.done === false && r1.score === 100);
  const snapAfter1: any = await inspect(cp1, iid1);
  A('形① 续跑推进到下一 interrupt（新快照 pending=下一题·next=[awaitAnswer]）', (snapAfter1.values as any)?.pending?.questionId === r1.nextQuestionId && snapAfter1.next?.[0] === 'awaitAnswer');
  A('形① question_ready 发射（投影 :394-399 面·事件键 question_ready:<nextQuestionId>）', await eventCount(iid1, 'question_ready', `question_ready:${r1.nextQuestionId}`) === 1);
  A('形① evaluate 零重评（评分模型调用计数不变·本题 transcript 恰 1 条不重复投影）', (modelCounts['mock-interview.evaluate'] ?? 0) === evalBefore1
    && ((snapAfter1.values?.transcript ?? []) as Array<{ questionId?: string }>).filter((t) => t.questionId === input1.questionId).length === 1);
  A('形① ask +1（genQuestion 续跑重入属预期·AG-25 披露面）', (modelCounts['interviewer.ask'] ?? 0) === askBefore1 + 1);
  A('形① 重入零 plan/decide/evalAnswer 重执行（断点续跑非 START 重开）', (resume1.counts['plan'] ?? 0) === 0 && (resume1.counts['decide'] ?? 0) === 0 && (resume1.counts['evalAnswer'] ?? 0) === 0);
  A('形① 出题链零 failed ask invocation（seam 抛错发生在 dispatch 前·不撞账本）', await failedAskInvocationCount(iid1) === 0);

  // ══ 形②：MemorySaver+checkpoint 边界注入抛错（genQuestion 已完成·writes 已 putWrites 持久化·
  // 下一 checkpoint 未推进即坠）→ 纯投影重放窗口：同题 identity 补投影·零图执行·零模型重调。══
  console.log('\n──── 形② checkpoint 边界注入:下一题 writes 已持久化·checkpoint 未推进即坠（投影面）────');
  const iid2 = 'life-resume-s2-' + Date.now();
  await seedInterview(iid2);
  const cp2 = new MemorySaver();
  const drive2 = nodeCounter();
  const d2 = baseLifecycleDeps(cp2, iid2, drive2.observer);
  const s2 = await startAdaptiveInterview(d2, '后端工程师', ['限流改造']);
  A('形② phase1:start → 首题 identity', !!s2.questionId && s2.stateVersion === 1);
  const answer2 = '我用 Redis 计数器+滑动窗口扛高并发，超阈值快速失败并对非核心链路降级保住下单主路径';
  const input2 = { questionId: s2.questionId!, stateVersion: s2.stateVersion!, answerId: randomUUID(), answerHash: answerHash(answer2), turn: 0, answer: answer2 };
  A('形② phase1:answer identity 被 API/DB ledger 接受', (await asPrincipal(pool, OWNER, (c) => claimInterviewAnswer(c, OWNER, iid2, input2))).status === 'accepted');

  const crashCp2 = new CrashCheckpoint(cp2, s2.questionId!);
  const g2 = directGraph(crashCp2, iid2, input2, drive2.observer);
  let crashed2: any = null;
  try { await g2.invoke(new Command({ resume: { answerId: input2.answerId } }), { configurable: { thread_id: iid2 } }); } catch (e: any) { crashed2 = e; }
  A('形② phase2:checkpoint 注入坠于下一题 checkpoint 推进前（provider 调用已完成）', crashed2?.message === CRASH_MSG);
  const snapCrash2: any = await inspect(cp2, iid2);
  const crashPending2 = (snapCrash2.values as any)?.pending;
  const transcript2 = (snapCrash2.values?.transcript ?? []) as Array<{ questionId?: string }>;
  A('形② 坠点形态=真 durable 语义:transcript 已含本题答案·genQuestion 任务 writes 已持久化（getState pending=下一题）',
    transcript2[transcript2.length - 1]?.questionId === input2.questionId
    && !!crashPending2?.questionId && crashPending2.questionId !== input2.questionId);

  const askBefore2 = modelCounts['interviewer.ask'] ?? 0;
  const evalBefore2 = modelCounts['mock-interview.evaluate'] ?? 0;
  const resume2 = nodeCounter();
  const r2 = await submitAdaptiveAnswer({ ...d2, graphObserver: resume2.observer }, input2);
  A('形② alreadyApplied 且 pending 已在 → 纯投影重放:返回同题 identity 且 score=100', !!r2.nextQuestionId && r2.nextQuestionId === crashPending2.questionId && r2.score === 100);
  // 既有重放语义如实钉住（本刀零改·Ban 纯重放路径语义变更）：该窗口 next=[]（interrupt 尚未登记）
  // → done=true → 既有 done 块收口 interview=completed。「先投影下一题再收口」的既有窗口语义归
  // 后继刀评估;本刀续跑守卫恰以 next 非空为准不越此界。
  const r2InterviewStatus = (await asPrincipal(pool, OWNER, (c) => c.query('SELECT status FROM interview WHERE id=$1', [iid2]))).rows[0]?.status;
  A('形② 既有重放收口语义:done=true → interview completed（零图执行·零模型重调下的既有面）',
    r2.done === true && r2InterviewStatus === 'completed');
  A('形② question_ready 发射（事件键 question_ready:<nextQuestionId>）', await eventCount(iid2, 'question_ready', `question_ready:${r2.nextQuestionId}`) === 1);
  A('形② evaluate 零重评（评分模型调用计数不变）', (modelCounts['mock-interview.evaluate'] ?? 0) === evalBefore2);
  A('形② 下一题模型零重调（ask 计数零增:writes 已持久化=exactly-once·不重跑 genQuestion）', (modelCounts['interviewer.ask'] ?? 0) === askBefore2);
  A('形② 重入零 plan/evalAnswer/genQuestion 重执行（纯投影·断点续跑非 START 重开）', (resume2.counts['plan'] ?? 0) === 0 && (resume2.counts['evalAnswer'] ?? 0) === 0 && (resume2.counts['genQuestion'] ?? 0) === 0);
  A('形② 出题链零 failed ask invocation', await failedAskInvocationCount(iid2) === 0);

  // ══ AG-26 a 面：start 崩溃于 genQuestion 执行中（执行面续跑窗口·裁决项③「无 interrupt·next
  // 非空」）——直驱图 invoke({}) 起跑+ask seam 注入抛错确定复现坠点态（decide→genQuestion 边界的
  // put 注入在 durability-async 下不确定·run7/run8 实证已弃），再经 lifecycle 重投断言 invoke(null)
  // 续跑而非从 START 重开（plan 零重执行·turn 不归零·出题键不撞旧 failed）。══
  console.log('\n──── AG-26 a 面:start 直驱坠于 genQuestion 执行中 → 重投 invoke(null) 续跑（非 START 重开）────');
  const iid3 = 'life-resume-ag26a-' + Date.now();
  await seedInterview(iid3);
  const inner3 = new MemorySaver();
  const drive3 = nodeCounter();
  const g3 = directGraph(inner3, iid3, { answerId: 'unused-start-crash', answer: '' }, drive3.observer, async () => { throw new Error(CRASH_MSG); });
  let crashed3: any = null;
  try { await g3.invoke({}, { configurable: { thread_id: iid3 } }); } catch (e: any) { crashed3 = e; }
  A('AG-26 a phase1:直驱 seam 注入坠于首题 genQuestion 执行中（writes 未落）', crashed3?.message === CRASH_MSG);
  const snapCrash3: any = await inspect(inner3, iid3);
  A('AG-26 a 坠点形态:无 pending interrupt·next 非空·transcript 空（genQuestion 待执行）',
    snapCrash3.values?.pending == null && (snapCrash3.next?.length ?? 0) > 0 && ((snapCrash3.values?.transcript ?? []) as any[]).length === 0);

  const resume3 = nodeCounter();
  const s3 = await startAdaptiveInterview(baseLifecycleDeps(inner3, iid3, resume3.observer), '后端工程师', []);
  A('AG-26 a start 重投 → invoke(null) 续跑出首题（非 unavailable 终态·stateVersion 不翻倍）', !!s3.questionId && !s3.unavailable && s3.stateVersion === 1);
  A('AG-26 a plan 节点零重执行（initMind turn 归零面不复现）', (resume3.counts['plan'] ?? 0) === 0 && (drive3.counts['plan'] ?? 0) === 1);
  A('AG-26 a question_ready 恰一发射（SSE 首题投影）', await eventCount(iid3, 'question_ready', `question_ready:${s3.questionId}`) === 1);
  A('AG-26 a 出题键不撞旧 failed:全 thread ask 链零 failed invocation（坠点 ask 未 dispatch·续跑全新 claim）', await failedAskInvocationCount(iid3) === 0);
  A('AG-26 a 续跑后 checkpoint 到 awaitAnswer interrupt（下一答可入）', (await inspect(inner3, iid3)).next?.[0] === 'awaitAnswer');

  // ══ AG-26 b 面：start 崩溃于首题 genQuestion writes 已持久化后（投影面窗口）══
  console.log('\n──── AG-26 b 面:首题 writes 已持久化·checkpoint 未推进即坠 → 重投纯投影出题────');
  const iid4 = 'life-resume-ag26b-' + Date.now();
  await seedInterview(iid4);
  const inner4 = new MemorySaver();
  const cp4 = new CrashCheckpoint(inner4, null);
  const drive4 = nodeCounter();
  const d4 = baseLifecycleDeps(cp4, iid4, drive4.observer);
  let crashed4: any = null;
  try { await startAdaptiveInterview(d4, '后端工程师', []); } catch (e: any) { crashed4 = e; }
  A('AG-26 b phase1:start 崩溃注入坠于首题 checkpoint 推进前（genQuestion 已完成）', crashed4?.message === CRASH_MSG);
  const snapCrash4: any = await inspect(inner4, iid4);
  const crashPending4 = (snapCrash4.values as any)?.pending;
  A('AG-26 b 坠点形态=真 durable 语义:首题 pending 已持久化（identity 在案）', !!crashPending4?.questionId && crashPending4.stateVersion === 1);

  const resume4 = nodeCounter();
  const s4 = await startAdaptiveInterview({ ...d4, graphObserver: resume4.observer }, '后端工程师', []);
  A('AG-26 b start 重投 → 纯投影出同题（identity=坠点已持久化首题·非重生成）', !!s4.questionId && s4.questionId === crashPending4.questionId && s4.stateVersion === 1);
  A('AG-26 b plan/genQuestion 节点零重执行（不 START 重开·零模型重调）', (resume4.counts['plan'] ?? 0) === 0 && (resume4.counts['genQuestion'] ?? 0) === 0);
  A('AG-26 b question_ready 恰一发射', await eventCount(iid4, 'question_ready', `question_ready:${s4.questionId}`) === 1);
  A('AG-26 b 出题键零 failed ask invocation', await failedAskInvocationCount(iid4) === 0);

  console.log(`\n${fail === 0 ? '✓ AG-05 alreadyApplied 续跑（形①执行面+形②投影面）+ AG-26 start 续跑（a 执行面+b 投影面）全部通过' : '✗ ' + fail + ' 失败'}`);
  await pool.end(); process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('✗', e?.stack ?? e?.message ?? e); process.exit(1); });

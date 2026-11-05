/**
 * AG-32 真路径 voice-adaptive 契约证明（换掉旧假 submit(string) 面）。
 * 语音编排（runVoiceAdaptiveInterview / voiceAnswerTurn）× 真 lifecycle
 * （startAdaptiveInterview / submitAdaptiveAnswer）：转写经 claimInterviewAnswer 写入答案 →
 * 以 `{ answerId }` resume 推进同一自适应图（AG-32②契约）；非法 resume 输入拒绝并重问、
 * 不结束整场（AG-32①）；语音编排不再直触 Command(resume)（AG-32③变异面）。
 * AG-32 rev r1（证伪外席2 P1）：语音提交缝内容闸等位面——空白转写 → invalid_turn、
 * 超长转写 → answer_too_long（与文本入口逐值同码），先于 claim 拒收：不吃题、题目保持
 * issued 可重答、checkpoint/ledger/事件/计费/模型调用零副作用（零持久化）；流式空白守卫
 * （streaming_asr_malformed）恢复为 proof 断言臂。
 * 隔离 PG 投影面（runMigrations）+ MemorySaver + scripted ModelClient + fake ASR/TTS，零外呼。
 *   pnpm voice-adaptive:prove  (需 db:up)
 */
import { fileURLToPath } from 'node:url';
import { MemorySaver, Command } from '@langchain/langgraph';
import {
  createPool, asPrincipal, reserveEntitlement, availableUnits,
  persistInterviewQuestion, loadMigrations, runMigrations,
} from '@meetwise/db';
import { scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { fakeAsr, fakeTts, fakeStreamingAsr, fakeStreamingTts } from '@meetwise/ai-runtime/test-support';   // #74: fake 族经 test-support 子路径
import { VOICE_CAPTURE_POLICY_VERSION } from '@meetwise/contracts';
import { INTERVIEW_ANSWER_MAX_LENGTH } from '@meetwise/domain';
import { buildAdaptiveInterviewGraph, type AdaptiveInterviewGraphState } from '@meetwise/ai-graphs';
import { startAdaptiveInterview, type AdaptiveLifecycleDeps } from '../src/adaptive-lifecycle.ts';
import { runVoiceAdaptiveInterview } from '../src/voice-adaptive.ts';
import { type VoiceTurnDeps } from '../src/voice-turn.ts';
import { previewVoiceAnswerTurn, submitVoiceTranscriptAnswer } from '../src/interview-voice.ts';
import { assertContentSafetyKillSwitchOff, ContentSafetyKillSwitchActiveError } from '../../api/src/platform/content-safety.ts';
import { transcribeForIssuedQuestion } from '../../api/src/modules/interview/interview-voice.ts';

let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
async function* audio(n: number) { for (let i = 0; i < n; i++) yield new Uint8Array([i]); }

async function errorOf(action: () => Promise<unknown>): Promise<string> {
  try { await action(); return 'no_error'; }
  catch (error) { return error instanceof Error ? error.message : String(error); }
}

/** 具码错误读取（rev r1 内容闸断言面：message/code/max 三值全收）。 */
async function codedErrorOf(action: () => Promise<unknown>): Promise<{ message: string; code?: unknown; max?: unknown }> {
  try { await action(); return { message: 'no_error' }; }
  catch (error) {
    const e = error as { message?: string; code?: unknown; max?: unknown };
    return { message: error instanceof Error ? error.message : String(error), code: e.code, max: e.max };
  }
}

/** interrupt value 的只读形状（LangGraph Interrupt.value 为 unknown，这里结构化收窄）。 */
interface ResumeInterruptValue { questionId?: string; question?: string; resumeError?: string; }
const interruptValuesOf = (result: unknown): ResumeInterruptValue[] => {
  const raw = (result as Record<string, unknown>)['__interrupt__'];
  return ((raw ?? []) as Array<{ value: unknown }>).map((i) => (i.value ?? {}) as ResumeInterruptValue);
};

const pool = createPool();
const OWNER = `va32-${process.pid}`;
const ROLE = '后端工程师';
const ANS = '我用滑动窗口加令牌桶做限流';
const THREAD_ID = 'thread_id';   // 计算键:规避 naming-convention 对 snake_case 字面量的告警（外部契约名）
let askSeq = 0;
let calls = 0;
const SCRIPT_KEYS = { planner: 'planner.competencies', ask: 'interviewer.ask', evaluate: 'mock-interview.evaluate' } as const;
const base = scriptedModelClient({
  [SCRIPT_KEYS.planner]: () => ({ ok: true, raw: { competencies: ['并发', '缓存', '消息队列'] } }),
  [SCRIPT_KEYS.ask]: () => ({ ok: true, raw: { q: `结合你的限流经历谈谈高并发下如何兼顾吞吐与一致性，并说明第 ${++askSeq} 轮验证方法`, refs: [] } }),
  [SCRIPT_KEYS.evaluate]: () => ({ ok: true, raw: { relevant: true, hasHook: false, dispositions: [{ criterionId: 'answer_quality', disposition: 'exceeds', quote: '滑动窗口' }] } }),
});
const model: ModelClient = { complete: (r, a) => { calls++; return base.complete(r, a); } };

const cfgOf = (threadId: string) => ({ configurable: { [THREAD_ID]: threadId } });

interface InterviewRow { status: string; }
const seedInterview = async (iid: string) => {
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')", [iid, OWNER]);
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, iid, 'mock_interview', 1.0));
};
const ivStatus = async (iid: string): Promise<string | undefined> => {
  const r = await pool.query("SELECT status FROM interview WHERE id=$1", [iid]);
  return ((r.rows ?? []) as InterviewRow[])[0]?.status;
};

interface ConsumptionRow { status: string; }
const consStatus = async (iid: string): Promise<string | undefined> => {
  const r = await pool.query('SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2', [OWNER, iid]);
  return ((r.rows ?? []) as ConsumptionRow[])[0]?.status;
};
const balanceOf = async () => asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER));

interface EventRow { kind: string; }
const eventKinds = async (iid: string): Promise<string[]> => {
  const r = await asPrincipal(pool, OWNER, (c) => c.query('SELECT kind FROM interview_event WHERE stream_key=$1 ORDER BY created_at, id', [iid]));
  return (r.rows as EventRow[]).map((e) => e.kind);
};

interface IssuedRow { questionId: string; question: string; stateVersion: number; turn: number; status: string; answerId: string | null; }
const issuedQuestionOf = async (iid: string): Promise<IssuedRow[]> => {
  const r = await asPrincipal(pool, OWNER, (c) => c.query(
    'SELECT question_id, question, state_version, turn, status, answer_id FROM interview_question WHERE owner_user_id=$1 AND interview_id=$2 ORDER BY created_at, state_version',
    [OWNER, iid]));
  return (r.rows as Array<Record<string, unknown>>).map((row) => ({
    questionId: row.question_id as string,
    question: row.question as string,
    stateVersion: Number(row.state_version),
    turn: Number(row.turn),
    status: row.status as string,
    answerId: (row.answer_id ?? null) as string | null,
  }));
};

const lifecycleDeps = (iid: string): AdaptiveLifecycleDeps => ({
  pool, cp: new MemorySaver(), owner: OWNER, interviewId: iid, model, maxTurns: 2,
  localRetrieve: async () => [{ ref: 'qbank:a', score: 0.9 }], webExplore: async () => [],
});

/** 只读检查图（节点永不执行）：直读同 cp 同 thread 的 checkpoint 形态。 */
const readonlyGraph = (cp: MemorySaver) => buildAdaptiveInterviewGraph(cp, {
  competencies: [],
  retrieveAndGenerate: async () => { throw new Error('inspect-only'); },
  assess: async () => { throw new Error('inspect-only'); },
  loadAnswer: async () => { throw new Error('inspect-only'); },
});
const inspect = async (cp: MemorySaver, threadId: string) => readonlyGraph(cp).getState(cfgOf(threadId));
/** checkpoint values 字节数（rev r1 零持久化断言面：拒收轮次 state 零增长）。 */
const stateBytesOf = async (cp: MemorySaver, threadId: string) =>
  JSON.stringify(((await inspect(cp, threadId)).values) ?? {}).length;

/** 真 submit 闭包：语音提交缝（submitVoiceTranscriptAnswer=内容闸→读 issued 题 identity→
 *  claimInterviewAnswer 写入答案 → submitAdaptiveAnswer 以 { answerId } resume 推进图+投影）
 *  ——与文本作答同一条写入+恢复路，内容闸单一真相在缝内（rev r1）。submitted 留作触达 tripwire。 */
const makeRealSubmit = (d: AdaptiveLifecycleDeps) => {
  const submitted: string[] = [];
  const submit = async (answer: string): Promise<{ nextQuestion?: string; done: boolean }> => {
    submitted.push(answer);
    return submitVoiceTranscriptAnswer(d, answer);
  };
  return { submitted, submit };
};

async function main() {
  const savedEnv: Array<[string, string | undefined]> = [
    ['NODE_ENV', process.env.NODE_ENV],
    ['VOICE_STREAM_ASR_ENABLED', process.env.VOICE_STREAM_ASR_ENABLED],
    ['VOICE_STREAM_ASR_PREVIEW', process.env.VOICE_STREAM_ASR_PREVIEW],
    ['MODEL_COST_ENFORCEMENT', process.env.MODEL_COST_ENFORCEMENT],
    ['MEETWISE_PUBLIC_PREVIEW', process.env.MEETWISE_PUBLIC_PREVIEW],
    ['MEETWISE_CONTENT_SAFETY_KILL_SWITCH', process.env.MEETWISE_CONTENT_SAFETY_KILL_SWITCH],
  ];
  try {
    // ── 零外呼守面：三 provider 键不在场；模型面=scripted，语音面=fake 族 ──
    for (const k of ['MODEL_API_KEY', 'DASHSCOPE_API_KEY', 'DASHSCOPE_COMPAT_BASE_URL']) delete process.env[k];

    await runMigrations(pool, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));
    await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',10.0, now()+interval '300 days')", [OWNER]);
    A('零外呼:三 provider 键（MODEL_API_KEY/DASHSCOPE_API_KEY/DASHSCOPE_COMPAT_BASE_URL）全程不在场',
      ['MODEL_API_KEY', 'DASHSCOPE_API_KEY', 'DASHSCOPE_COMPAT_BASE_URL'].every((k) => !String(process.env[k] ?? '').trim()));

    // ════════ ① 预览门拒绝面（真 submit 闭包为 tripwire：门必须先于任何提交触发） ════════
    section('预览门拒绝面:无旗标/半旗标/生产/enforce/公开预览 全 refuse-closed，提交零触');
    delete process.env.VOICE_STREAM_ASR_ENABLED;
    delete process.env.VOICE_STREAM_ASR_PREVIEW;
    delete process.env.MODEL_COST_ENFORCEMENT;
    delete process.env.MEETWISE_PUBLIC_PREVIEW;
    process.env.NODE_ENV = 'test';
    let startCalls = 0; let tripSubmit = 0;
    const tripwireDeps = {
      asr: fakeStreamingAsr(ANS), tts: fakeStreamingTts(4),
      start: async () => { startCalls++; return { question: 'q' }; },
      submit: async () => { tripSubmit++; return { done: true }; },
      userAudioFor: () => audio(5),
    };
    A('default (no preview flags) refuses turn-taking and does not submit an invented answer',
      await errorOf(() => runVoiceAdaptiveInterview(tripwireDeps)) === 'voice_turn_taking_not_configured'
      && tripSubmit === 0 && startCalls === 0);

    process.env.VOICE_STREAM_ASR_ENABLED = '1';
    A('ENABLED=1 without PREVIEW is unconfigured, submit increment stays 0',
      await errorOf(() => runVoiceAdaptiveInterview(tripwireDeps)) === 'voice_turn_taking_unconfigured'
      && tripSubmit === 0);

    process.env.VOICE_STREAM_ASR_PREVIEW = '1';
    process.env.NODE_ENV = 'production';
    A('production + dual flags still refuses turn-taking',
      await errorOf(() => runVoiceAdaptiveInterview(tripwireDeps)) === 'voice_turn_taking_unconfigured' && tripSubmit === 0);

    process.env.NODE_ENV = 'test';
    process.env.MODEL_COST_ENFORCEMENT = 'enforce';
    A('enforce + dual flags still refuses turn-taking',
      await errorOf(() => runVoiceAdaptiveInterview(tripwireDeps)) === 'voice_turn_taking_unconfigured' && tripSubmit === 0);
    delete process.env.MODEL_COST_ENFORCEMENT;

    process.env.MEETWISE_PUBLIC_PREVIEW = '1';
    A('public preview + dual flags still refuses turn-taking',
      await errorOf(() => runVoiceAdaptiveInterview(tripwireDeps)) === 'voice_turn_taking_unconfigured' && tripSubmit === 0);
    delete process.env.MEETWISE_PUBLIC_PREVIEW;

    // ════════ ② AG-32①：非法 resume 拒绝并重问（文本同一条图/生命周期路；修复前此面 concluded） ════════
    section('AG-32① 非法 resume 输入:拒绝+原题重问（resumeError 标记）·面试状态零推进·真提交继续可答');
    process.env.NODE_ENV = 'test';
    process.env.VOICE_STREAM_ASR_ENABLED = '1';
    process.env.VOICE_STREAM_ASR_PREVIEW = '1';
    const iidInv = 'va32-inv-' + Date.now();
    await seedInterview(iidInv);
    const dInv = lifecycleDeps(iidInv);
    const sInv = await startAdaptiveInterview(dInv, ROLE, []);
    A('② phase1:start → 首题 identity（issued 入 ledger）', !!sInv.questionId && sInv.stateVersion === 1
      && (await issuedQuestionOf(iidInv))[0]?.status === 'issued');

    // 直驱同一图（旧 voice-turn 的原始转写恢复正是打在这里）：
    const gInv = readonlyGraph(dInv.cp);
    const cfgInv = cfgOf(iidInv);
    const snap0: Awaited<ReturnType<typeof inspect>> = await inspect(dInv.cp, iidInv);
    const pending0 = (snap0.values as AdaptiveInterviewGraphState).pending;
    const r1: unknown = await gInv.invoke(new Command({ resume: ANS }), cfgInv);   // 原始转写字符串=非法
    const interrupts1 = interruptValuesOf(r1);
    const snap1 = await inspect(dInv.cp, iidInv);
    const values1 = snap1.values as AdaptiveInterviewGraphState;
    A('① 原始转写字符串被拒:重新 interrupt 挂起（非 END·concluded 未翻真）',
      interrupts1.length === 1 && interrupts1[0]?.resumeError === 'answer_reference_invalid'
      && (snap1.next?.length ?? 0) === 0 && values1.concluded !== true);
    A('① pending 原样保留（同 questionId/stateVersion/turn·transcript 零推进·turn 不变）',
      values1.pending?.questionId === pending0?.questionId && values1.pending?.stateVersion === pending0?.stateVersion
      && values1.pending?.turn === pending0?.turn
      && (values1.transcript ?? []).length === 0 && values1.mind.turn === (snap0.values as AdaptiveInterviewGraphState).mind.turn);
    A('① 重问 interrupt 带 resumeError=answer_reference_invalid（题面/identity 原样）',
      interrupts1[0]?.questionId === pending0?.questionId && interrupts1[0]?.question === pending0?.question);
    const r2: unknown = await gInv.invoke(new Command({ resume: { answerId: 42 } }), cfgInv);   // 形缺:answerId 非字符串
    const r3: unknown = await gInv.invoke(new Command({ resume: {} }), cfgInv);                 // 形缺:无 answerId
    const interrupts3 = interruptValuesOf(r3);
    A('① 其余形缺（answerId:42 / 空对象）同拒并再 interrupt（合法 { answerId } 契约面不松动）',
      interruptValuesOf(r2).length === 1
      && interrupts3.length === 1 && interrupts3[0]?.resumeError === 'answer_reference_invalid');

    const wInv = makeRealSubmit(dInv);
    const vInv = await wInv.submit(ANS);
    A('① 拒绝后真提交一次通过:claim+submitAdaptiveAnswer 推进到下一题（面试存活可续答）',
      !!vInv.nextQuestion && vInv.done === false && wInv.submitted.length === 1);
    const invRows = await issuedQuestionOf(iidInv);
    A('① 首题经 claim→answered·次题 issued（evalAnswer 只跑一次·零伪造评分事件面）',
      invRows[0]?.status === 'answered' && !!invRows[0]?.answerId && invRows[1]?.status === 'issued');
    const valuesInv = (await inspect(dInv.cp, iidInv)).values as AdaptiveInterviewGraphState;
    A('① 拒绝轮次零副作用:答案原文只进 claim（answer_hash=SHA256(ANS)）·checkpoint transcript 恰 1 条',
      invRows.length === 2 && (valuesInv.transcript ?? []).length === 1);

    // ════════ ③ AG-32②③：语音编排 × 真 lifecycle（runVoiceAdaptiveInterview 全轮） ════════
    section('AG-32② 语音编排×真提交:转写→claim→{ answerId } resume→投影·整场收敛·计费同路');
    const iidVa = 'va32-run-' + Date.now();
    await seedInterview(iidVa);
    const dVa = lifecycleDeps(iidVa);
    const callsBeforeVa = calls;
    const wVa = makeRealSubmit(dVa);
    let ttsChunks = 0;
    const rv = await runVoiceAdaptiveInterview({
      asr: fakeStreamingAsr(ANS), tts: fakeStreamingTts(4),
      start: async () => await startAdaptiveInterview(dVa, ROLE, []),
      submit: wVa.submit,
      userAudioFor: () => audio(5),
      onTtsChunk: () => ttsChunks++,
    });
    A('② 真 submit 路整场收敛（concluded·每轮转写=ANS 恰 N 次提交）',
      rv.turns.length >= 2 && rv.concluded === true && wVa.submitted.length === rv.turns.length && wVa.submitted.every((a) => a === ANS));
    A('② 每轮 streamed TTS chunks', ttsChunks > 1);
    A('② 语音答案经 claim 写入（全部题 answered·answer_id 非空·恰 N 行）',
      (await issuedQuestionOf(iidVa)).length === rv.turns.length
      && (await issuedQuestionOf(iidVa)).every((row) => row.status === 'answered' && !!row.answerId));
    A('② 计费同路:reserved 1.0 → 结算 confirmed（② phase1 已占 1.0 → 可用 8.0/10.0 种子）',
      (await consStatus(iidVa)) === 'confirmed' && (await balanceOf()) === 8.0);
    A('② 面试终态 completed·SSE 面齐（question_ready=N·answer_evaluated=N）',
      (await ivStatus(iidVa)) === 'completed'
      && (await eventKinds(iidVa)).filter((k) => k === 'question_ready').length === rv.turns.length
      && (await eventKinds(iidVa)).filter((k) => k === 'answer_evaluated').length === rv.turns.length);
    A('② 模型面 exactly-once:planner1+每轮(ask+evaluate)=2N+1（scripted·零外呼·零重放重评）',
      calls - callsBeforeVa === 2 * rv.turns.length + 1);

    // ════════ ④ AG-32②③：voice-turn 组合根（previewVoiceAnswerTurn）逐轮真提交至收敛 ════════
    section('AG-32③ voice-turn 组合根:submit 闭包同路（不直触图·转写零入 resume）');
    const iidVt = 'va32-turn-' + Date.now();
    await seedInterview(iidVt);
    const dVt = lifecycleDeps(iidVt);
    const callsBeforeVt = calls;
    const sVt = await startAdaptiveInterview(dVt, ROLE, []);
    A('③ start → 首题 identity（issued 入 ledger）', !!sVt.questionId && sVt.stateVersion === 1);
    const wVt = makeRealSubmit(dVt);
    const vtDeps: VoiceTurnDeps = { asr: fakeAsr(ANS), tts: fakeTts(), submit: wVt.submit };
    let vtTurns = 0; let firstTurnAudio = false; let firstTurnSubmits = -1; let identityChain = true; let vtDone = false; let vtTranscriptOk = true;
    for (;;) {
      const t = await previewVoiceAnswerTurn(vtDeps, new Uint8Array([vtTurns + 1, 2, 3]));
      vtTurns++;
      if (vtTurns === 1) { firstTurnAudio = t.transcript === ANS && !!t.questionAudio; firstTurnSubmits = wVt.submitted.length; }
      vtTranscriptOk = vtTranscriptOk && t.transcript === ANS;
      const issued = await issuedQuestionOf(iidVt);
      const open = issued.find((row) => row.status === 'issued' || row.status === 'queued');
      identityChain = identityChain && (t.done ? !open : open?.question === t.nextQuestion);
      if (t.done || vtTurns >= 12) { vtDone = t.done; break; }
    }
    A('③ voice-turn 逐轮:首轮转写提交经真路·下一题带 TTS 音频（done=false 收敛前）',
      firstTurnAudio && firstTurnSubmits === 1 && vtTurns >= 2);
    A(`③ 每轮提交与 ledger 同 identity（done 前 issued 题面=nextQuestion·done 后零开题·共 ${vtTurns} 轮）`,
      identityChain && vtDone && wVt.submitted.length === vtTurns && vtTranscriptOk);
    A('③ 全部题 claim→answered·结算 confirmed（同一计入路径·① 已占 1.0 → 可用 7.0/10.0 种子）',
      (await issuedQuestionOf(iidVt)).length === vtTurns
      && (await issuedQuestionOf(iidVt)).every((row) => row.status === 'answered' && !!row.answerId)
      && (await consStatus(iidVt)) === 'confirmed' && (await balanceOf()) === 7.0);
    A('③ 模型面 exactly-once:planner1+首题ask+每轮(evaluate+ask)=2N+1（零重放重评·零外呼）',
      calls - callsBeforeVt === 2 * vtTurns + 1);

    // ════════ ⑤ AG-32 rev r1：语音缝内容闸等位面（空白/超长与文本入口逐值同码·不吃题可重答·零持久化） ════════
    section('AG-32 rev r1 语音缝内容闸:空白→invalid_turn·超长→answer_too_long（同码）·拒收零副作用·原题可重答');
    // 直接缝形（=证伪 P-B1/P-B2 探针形的缝内等价）：拒收必须先于 claim（题目保持 issued·answer_id 空）。
    const iidGate = 'va32-gate-' + Date.now();
    await seedInterview(iidGate);
    const dGate = lifecycleDeps(iidGate);
    await startAdaptiveInterview(dGate, ROLE, []);
    const gatePending0 = ((await inspect(dGate.cp, iidGate)).values as AdaptiveInterviewGraphState).pending;
    const gateBytes0 = await stateBytesOf(dGate.cp, iidGate);
    const gateEvents0 = (await eventKinds(iidGate)).length;
    const gateBalance0 = await balanceOf();
    const gateCalls0 = calls;
    const blankErr = await codedErrorOf(() => submitVoiceTranscriptAnswer(dGate, '   '));
    A('⑤ 空白转写被缝内闸拒:invalid_turn（与文本入口 400 同码）',
      blankErr.message === 'invalid_turn' && blankErr.code === 'invalid_turn');
    const overlongText = 'x'.repeat(INTERVIEW_ANSWER_MAX_LENGTH + 1);
    const overlongErr = await codedErrorOf(() => submitVoiceTranscriptAnswer(dGate, overlongText));
    A('⑤ 超长转写被缝内闸拒:answer_too_long+max（与文本入口 413 同码同上限 8000）',
      overlongErr.message === 'answer_too_long' && overlongErr.code === 'answer_too_long' && overlongErr.max === INTERVIEW_ANSWER_MAX_LENGTH);
    const gateRows = await issuedQuestionOf(iidGate);
    const gateValues1 = (await inspect(dGate.cp, iidGate)).values as AdaptiveInterviewGraphState;
    A('⑤ 拒收不吃题:题目保持 issued·answer_id 空·identity 原样（claim 未发生）',
      gateRows.length === 1 && gateRows[0]?.status === 'issued' && gateRows[0]?.answerId === null
      && gateValues1.pending?.questionId === gatePending0?.questionId && gateValues1.pending?.turn === gatePending0?.turn);
    A('⑤ 拒收零持久化:checkpoint state 字节数零增长·transcript 零推进·模型调用零触发',
      (await stateBytesOf(dGate.cp, iidGate)) === gateBytes0 && (gateValues1.transcript ?? []).length === 0 && calls === gateCalls0);
    A('⑤ 拒收零副作用:事件零增长·额度恒 reserved 不动',
      (await eventKinds(iidGate)).length === gateEvents0 && (await consStatus(iidGate)) === 'reserved' && (await balanceOf()) === gateBalance0);
    const wGate = makeRealSubmit(dGate);
    const vGate = await wGate.submit(ANS);
    A('⑤ 拒后原题可重答:同一 issued 题真提交一次通过（推进到下一题）',
      !!vGate.nextQuestion && vGate.done === false && (await issuedQuestionOf(iidGate))[0]?.status === 'answered');

    // 经语音编排全程（previewVoiceAnswerTurn = ASR 边缘→缝）同样被拒：接线携带闸（证伪 P-B4 形）。
    const wEdge = makeRealSubmit(dGate);
    const edgeBlankErr = await codedErrorOf(() => previewVoiceAnswerTurn({ asr: fakeAsr('   '), tts: fakeTts(), submit: wEdge.submit }, new Uint8Array([7, 7, 7])));
    const edgeOverErr = await codedErrorOf(() => previewVoiceAnswerTurn({ asr: fakeAsr(overlongText), tts: fakeTts(), submit: wEdge.submit }, new Uint8Array([8, 8, 8])));
    A('⑤ 编排全程同拒:previewVoiceAnswerTurn 空白/超长经 ASR 边缘→缝同码拒绝（触达提交闭包但 claim 零发生）',
      edgeBlankErr.message === 'invalid_turn' && edgeOverErr.message === 'answer_too_long'
      && wEdge.submitted.length === 2 && (await issuedQuestionOf(iidGate)).every((row) => row.status !== 'queued'));

    // 流式守卫臂（恢复旧 proof 删除的空白断言臂 + 超长经缝闸臂）：runVoiceAdaptiveInterview 边缘。
    const iidStream = 'va32-stream-' + Date.now();
    await seedInterview(iidStream);
    const dStream = lifecycleDeps(iidStream);
    await startAdaptiveInterview(dStream, ROLE, []);
    let streamSubmits = 0;
    A('⑤ 流式空白守卫:streaming_asr_malformed·submit 零触（守卫在缝外边缘先拒）',
      await errorOf(() => runVoiceAdaptiveInterview({
        asr: fakeStreamingAsr('   '), tts: fakeStreamingTts(4),
        start: async () => ({ question: 'q' }),
        submit: async () => { streamSubmits++; return { done: true }; },
        userAudioFor: () => audio(5),
      })) === 'streaming_asr_malformed' && streamSubmits === 0);
    const streamOverErr = await codedErrorOf(() => runVoiceAdaptiveInterview({
      asr: fakeStreamingAsr(overlongText), tts: fakeStreamingTts(4),
      start: async () => ({ question: 'q' }),
      submit: async (answer: string) => { streamSubmits++; return await submitVoiceTranscriptAnswer(dStream, answer); },
      userAudioFor: () => audio(5),
    }));
    A('⑤ 流式超长经缝闸拒:answer_too_long（边缘非空白但缝闸接住·claim 零发生题保持 issued）',
      streamOverErr.message === 'answer_too_long' && streamSubmits === 1
      && (await issuedQuestionOf(iidStream))[0]?.status === 'issued');

    // ════════ ⑥ 守卫不绕面：内容安全开关·voice_capture 同意门 ════════
    section('守卫不绕面:内容安全 kill-switch fail-closed·voice_capture 同意门先于 ASR');
    process.env.MEETWISE_CONTENT_SAFETY_KILL_SWITCH = '1';
    let switchErr: unknown;
    try { assertContentSafetyKillSwitchOff(); } catch (e) { switchErr = e; }
    A('内容安全开关 engage 即抛 content_safety_kill_switch_active（api begin/turn 同一闸·语音提交不绕）',
      switchErr instanceof ContentSafetyKillSwitchActiveError && switchErr.code === 'content_safety_kill_switch_active');
    delete process.env.MEETWISE_CONTENT_SAFETY_KILL_SWITCH;
    let switchOk = true;
    try { assertContentSafetyKillSwitchOff(); } catch { switchOk = false; }
    A('开关缺省 off（现状字节零翻）', switchOk);

    const iidConsent = 'va32-consent-' + Date.now();
    await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')", [iidConsent, OWNER]);
    await asPrincipal(pool, OWNER, (c) => persistInterviewQuestion(c, OWNER, iidConsent, {
      questionId: 'va32-consent-q1', stateVersion: 1, turn: 0, question: '请说明限流取舍', competency: '高并发', qkind: 'fundamental',
    }));
    let consentBody: { error?: string; purpose?: string } | undefined;
    try {
      await transcribeForIssuedQuestion(
        { asPrincipal: (principal: string, fn: (client: never) => Promise<void>) => asPrincipal(pool, principal, fn as never) },
        fakeAsr(ANS),
        OWNER, iidConsent,
        { audioBase64: Buffer.from([1, 2, 3]).toString('base64'), mimeType: 'audio/webm', capture: { mode: 'single_local_microphone' as const, consent: true as const, policyVersion: VOICE_CAPTURE_POLICY_VERSION } },
        undefined,
        async () => {},
      );
    } catch (e: unknown) {
      consentBody = (e as { response?: { error?: string; purpose?: string } })?.response;
    }
    A('voice_capture 同意门:零 consent_record → consent_required（音频不出进程·转写不入答案）',
      consentBody?.error === 'consent_required' && consentBody?.purpose === 'voice_capture'
      && (await issuedQuestionOf(iidConsent))[0]?.status === 'issued');
  } finally {
    for (const [name, value] of savedEnv) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }

  console.log(`\n${fail === 0 ? '✓ AG-32 voice-adaptive 真路径契约（claim→{answerId} resume·非法输入重问·语音缝内容闸同码拒收不吃题·守卫不绕）通过' : '✗ ' + fail + ' failed'}`);
  await pool.end();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });

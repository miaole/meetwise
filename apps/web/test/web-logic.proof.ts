/**
 * 前端承重逻辑证明（纯函数,无浏览器）：SSE 解码(含 CRLF/心跳/分块)、契约客户端(状态分流+幂等键)、视图归约的优雅降级与无静默死胡同。
 *   pnpm web:prove
 */
import { decodeSSE, toBusinessEvent } from '../lib/stream/business-events.ts';
import {
  reduceInterview, applyEvent, initialView, onStreamClosed, onReconnectExhausted, isTerminal,
} from '../lib/stream/interview-state.ts';
import { interviewDisplay, isDeadEnd } from '../lib/view-model.ts';
import { makeInterviewApi, type FetchLike, type FetchResponse } from '../lib/api/client.ts';
import { runInterviewStream, type StreamOpener } from '../lib/stream/interview-stream.ts';
import type { InterviewView } from '../lib/stream/interview-state.ts';
import { makeFrameCoalescer } from '../lib/stream/frame-coalescer.ts';
import { interviewTurnWindow } from '../lib/stream/turn-window.ts';
import { buildTurnSubmission } from '../lib/interview/turn-submission.ts';
import { interviewActionLabel, interviewDisplayStatus, interviewProgressLabel } from '../lib/interview/progress.ts';

/** 把若干 chunk 串成异步流(模拟 ReadableStream 分块)。 */
async function* streamOf(...chunks: string[]) { for (const c of chunks) yield c; }
const ev = (id: number, kind: string, data: object) => `id: ${id}\nevent: ${kind}\ndata: ${JSON.stringify(data)}\n\n`;

let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
/** 假 fetch：带 status,记录最后一次请求(校验 header/幂等键)。 */
function fakeFetchWith() {
  const calls: { url: string; headers?: Record<string, string>; body?: string }[] = [];
  const make = (status: number, body: unknown, throwNetwork = false, nonJson = false): FetchLike =>
    async (url, init) => {
      calls.push({ url, headers: init?.headers, body: init?.body });
      if (throwNetwork) throw new Error('network down');
      const res: FetchResponse = { status, json: async () => { if (nonJson) throw new Error('not json'); return body; } };
      return res;
    };
  return { calls, make };
}

async function main() {
  section('面试列表进度：以问题账本投影为准，不再把空会话伪装成第 1 题');
  A('零轮 abandoned 显示尚未出题', interviewProgressLabel({ status: 'abandoned', issued_turns: 0, answered_turns: 0, current_turn: null }) === '尚未出题');
  A('active 的 turn=3 显示第 4 题待答', interviewProgressLabel({ status: 'active', issued_turns: 4, answered_turns: 3, current_turn: 3 }) === '第 4 题待答');
  A('queued 的 turn=3 显示处理中', interviewProgressLabel({ status: 'created', issued_turns: 4, answered_turns: 3, processing_turn: 3 }) === '第 4 题处理中');
  A('completed 显示实际总题数', interviewProgressLabel({ status: 'completed', issued_turns: 8, answered_turns: 8 }) === '共 8 题');
  A('终态已出题但零回答不伪装成尚未出题', interviewProgressLabel({ status: 'abandoned', issued_turns: 1, answered_turns: 0, current_turn: 0 }) === '已出 1 题，未作答');
  A('终态残留 open turn 仍只显示已答题数', interviewProgressLabel({ status: 'abandoned', issued_turns: 4, answered_turns: 3, current_turn: 3 }) === '已作答 3 题');
  A('已放弃不再提供继续作答 CTA', interviewActionLabel('abandoned') === '已结束');
  A('有题的 created 派生为进行中展示态', interviewDisplayStatus({ status: 'created', issued_turns: 1, current_turn: 0 }) === 'active');

  section('渲染背压：同一动画帧内合并为最后一个视图，取消后绝不提交');
  const animationFrames: Array<() => void> = [];
  const rendered: number[] = [];
  const coalescer = makeFrameCoalescer<number>(
    (view) => rendered.push(view),
    (flush) => { animationFrames.push(flush); return animationFrames.length - 1; },
  );
  coalescer.offer(1);
  coalescer.offer(2);
  coalescer.offer(3);
  A('同一帧的 3 次业务更新只调度 1 次渲染', animationFrames.length === 1 && rendered.length === 0);
  animationFrames.shift()?.();
  A('帧回调只提交最新快照（中间状态不触发 React commit）', rendered.length === 1 && rendered[0] === 3);
  coalescer.offer(4);
  coalescer.cancel();
  animationFrames.shift()?.();
  A('组件卸载取消待渲染帧后，不会向已卸载组件提交状态', rendered.length === 1);

  section('超长会话窗口：1 万轮只挂载 80 轮，翻页不累积 DOM');
  const newestTurns = interviewTurnWindow(10_000, 0);
  A('最新窗口精确为第 9,921–10,000 轮（80 条）', newestTurns.start === 9_920 && newestTurns.end === 10_000 && newestTurns.size === 80);
  const oldestTurns = interviewTurnWindow(10_000, 9_999);
  A('越界历史页会钳制到最早窗口，不产生空白或超量渲染', oldestTurns.page === 124 && oldestTurns.start === 0 && oldestTurns.end === 80 && oldestTurns.size === 80);

  section('作答身份：question/answer/hash 三元组稳定且服务端可复算');
  const submitted = await buildTurnSubmission(
    { questionId: 'q-v1-t7-c3', stateVersion: 9, turn: 7 },
    '原始回答，不经 trim 或规范化',
    '0d2e58d1-5c6b-4c0a-9a75-8b67f2251d1c',
  );
  A('提交体保留服务端发放 questionId/stateVersion/turn 与稳定 answerId', submitted.questionId === 'q-v1-t7-c3' && submitted.stateVersion === 9 && submitted.turn === 7 && submitted.answerId === '0d2e58d1-5c6b-4c0a-9a75-8b67f2251d1c');
  A('answerHash 为原始 UTF-8 文本 SHA-256（不因 UI trim 而漂移）', submitted.answerHash === 'fe069d0a6a303fec24317692bc6bab6708b651bd517fe8a63a0f9f9b13bb6fb2');

  section('SSE 解码：多帧 + 分块累积 + CRLF + 心跳/注释帧');
  const wire =
    'id: 1\nevent: question_ready\ndata: {"question":"限流器怎么设计?"}\n\n' +
    'id: 2\nevent: answer_evaluated\ndata: {"score":80}\n\n' +
    'id: 3\nevent: report_ready\ndata: {"overall"';
  const d1 = decodeSSE(wire);
  A('切出 2 完整帧,第 3 不完整留 rest', d1.frames.length === 2 && d1.rest.startsWith('id: 3'));
  A('rest 拼后续分块解出第 3 帧', decodeSSE(d1.rest + ':74}\n\n').frames[0]?.event === 'report_ready');
  const crlf = 'id: 9\r\nevent: waiting_user\r\ndata: {}\r\n\r\n';        // CRLF 行尾(审计 MEDIUM)
  A('CRLF 行尾也能解出帧(不再永久转圈)', decodeSSE(crlf).frames.length === 1 && decodeSSE(crlf).frames[0].event === 'waiting_user');
  const hb = ': keepalive\n\nid: 5\nevent: progress\ndata: {}\n\n';      // 心跳/注释帧
  const dhb = decodeSSE(hb);
  A('心跳/注释帧被忽略,只产出真事件帧', dhb.frames.length === 1 && dhb.frames[0].event === 'progress');

  section('帧 → 强类型事件(契约内才认)');
  A('合法 → 类型化', toBusinessEvent(d1.frames[0])?.event === 'question_ready');
  A('坏 JSON → null', toBusinessEvent({ event: 'question_ready', id: 9, data: '{bad' }) === null);
  A('payload 不符 → null', toBusinessEvent({ event: 'question_ready', id: 9, data: '{}' }) === null);
  A('未知事件 → null', toBusinessEvent({ event: 'nope', id: 9, data: '{}' }) === null);
  A('NaN id(缺 id) → null,不污染 lastEventId', toBusinessEvent({ event: 'waiting_user', data: '{}' }) === null);

  section('视图归约 + 无静默死胡同');
  const v = reduceInterview([
    toBusinessEvent({ event: 'question_ready', id: 1, data: '{"question":"Q1"}' })!,
    toBusinessEvent({ event: 'waiting_user', id: 2, data: '{}' })!,
    toBusinessEvent({ event: 'answer_evaluated', id: 3, data: '{"score":80}' })!,
  ]);
  A('answer_evaluated → phase=answered(settled 显示分数,非"评估中"转圈)', v.phase === 'answered' && v.lastScore === 80);
  A('lastEventId=3(断线重连用)', v.lastEventId === 3);
  const identityView = reduceInterview([
    toBusinessEvent({ event: 'question_ready', id: 1, data: '{"question":"Q1","questionId":"q-v1-t0-c0","stateVersion":4,"turn":0,"qkind":"grounded"}' })!,
  ]);
  A('question_ready 身份令牌进入视图（提交不再依赖本地 turn）', identityView.questionIdentity?.questionId === 'q-v1-t0-c0' && identityView.questionIdentity.stateVersion === 4 && identityView.questionIdentity.turn === 0);
  A('真实图题型 grounded 被消费（不能因枚举漂移卡在 connecting）', identityView.phase === 'question' && identityView.turns[0]?.qkind === 'grounded');

  // 答非所问/没答:clarification_needed = **非终态**,回到可作答态 + 挂引导(不新增历史 turn、可跳过),
  // 但提交必须换成后端新发的 identity，不能复用已经 consumed 的旧题令牌。
  const clar = reduceInterview([
    toBusinessEvent({ event: 'question_ready', id: 1, data: '{"question":"Q1","competency":"并发","questionId":"q-v1-t0-c0","stateVersion":4,"turn":0}' })!,
    toBusinessEvent({ event: 'clarification_needed', id: 2, data: '{"hint":"想了解你在并发方面的真实经历,可重答或回复跳过","question":"Q1","competency":"并发","questionId":"q-v2-t1-c0","stateVersion":5,"turn":1}' })!,
  ]);
  A('clarification_needed → 非终态(phase=question)+ 挂引导 + 不新增历史 turn', clar.phase === 'question' && !isTerminal(clar.phase) && !!clar.guidance && clar.guidance!.hint.includes('跳过') && clar.turns.length === 1);
  A('clarification_needed 用新 identity 替换已消费令牌，重答不会 stale', clar.questionIdentity?.questionId === 'q-v2-t1-c0' && clar.questionIdentity.stateVersion === 5 && clar.questionIdentity.turn === 1);
  const clarDisplay = interviewDisplay(clar);
  A('clarification → 显式引导文案 + 可作答出口(非死胡同、非转圈)', !isDeadEnd(clarDisplay) && clarDisplay.action.kind === 'answer' && clarDisplay.message.includes('跳过') && !clarDisplay.spinner);
  const clarResolved = applyEvent(clar, toBusinessEvent({ event: 'answer_evaluated', id: 3, data: '{"score":75}' })!);
  A('引导态 → 重答评分后引导自动清除(消解,不残留)', clarResolved.guidance === undefined && clarResolved.phase === 'answered');
  // 跳过/探尽未决:answer_evaluated{outcome:'unresolved'} → 该题标 skipped、**不展示惩罚分**(lastScore 不落 0),对齐"跳过不罚";仍是可前进的非死胡同。
  const skipReflect = reduceInterview([
    toBusinessEvent({ event: 'question_ready', id: 1, data: '{"question":"Q1","competency":"并发"}' })!,
    toBusinessEvent({ event: 'answer_evaluated', id: 2, data: '{"score":0,"outcome":"unresolved"}' })!,
  ]);
  A('unresolved(跳过/探尽)→ 题标 skipped 且不展示惩罚分(lastScore 非0)', skipReflect.turns[0].skipped === true && skipReflect.turns[0].score === undefined && skipReflect.lastScore === undefined && skipReflect.phase === 'answered');
  A('普通 answered(无 outcome)仍正常回填分数', applyEvent(reduceInterview([toBusinessEvent({ event: 'question_ready', id: 1, data: '{"question":"Q"}' })!]), toBusinessEvent({ event: 'answer_evaluated', id: 2, data: '{"score":80}' })!).turns[0].score === 80);
  const deg = applyEvent(reduceInterview([toBusinessEvent({ event: 'waiting_user', id: 5, data: '{}' })!]),
    toBusinessEvent({ event: 'report_unavailable', id: 6, data: '{"reason":"max_attempts_exceeded"}' })!);
  A('report_unavailable → degraded 且退出等待(无限转圈防护)', deg.degraded && deg.phase === 'report_unavailable');
  const scoreless = applyEvent(reduceInterview([toBusinessEvent({ event: 'waiting_user', id: 7, data: '{}' })!]),
    toBusinessEvent({ event: 'assessment_unavailable', id: 8, data: '{"reason":"evaluation_unscored"}' })!);
  const scorelessDisplay = interviewDisplay(scoreless);
  A('assessment_unavailable → 独立终态、额度已释放提示并导向我的投递（不冒充报告不可用）',
    scoreless.degraded && scoreless.phase === 'assessment_unavailable' && isTerminal(scoreless.phase)
    && scorelessDisplay.action.kind === 'view_applications' && scorelessDisplay.message.includes('额度已释放'));
  A('error 事件 → phase=error(终态)', reduceInterview([toBusinessEvent({ event: 'error', id: 7, data: '{}' })!]).phase === 'error');
  // reaper 终态:worker 崩在跑 → interview_unavailable → degraded 终态(无静默转圈;承接 worker reaper:prove。quiz_unavailable→degraded 见下方押题段)。
  const ivUnavail = reduceInterview([toBusinessEvent({ event: 'interview_unavailable', id: 8, data: '{"reason":"worker_died"}' })!]);
  A('interview_unavailable(reaper 终态) → degraded 且 isTerminal(不死等)', ivUnavail.degraded && ivUnavail.phase === 'interview_unavailable' && isTerminal(ivUnavail.phase));

  section('流断/重连：非终态断流→reconnecting(不干等);重连耗尽→degraded 出口');
  const closedMid = onStreamClosed(reduceInterview([toBusinessEvent({ event: 'answer_evaluated', id: 1, data: '{"score":70}' })!]));
  A('answered 时断流 → connection=reconnecting(自动重连,非卡死)', closedMid.connection === 'reconnecting' && !isTerminal(closedMid.phase));
  const closedDone = onStreamClosed(reduceInterview([toBusinessEvent({ event: 'report_ready', id: 1, data: '{"overall":74}' })!]));
  A('终态(report_ready)断流 → connection=closed(正常结束)', closedDone.connection === 'closed');
  const exhausted = onReconnectExhausted(closedMid);
  A('重连耗尽 → degraded=true 给出口(不无限重连)', exhausted.degraded && exhausted.connection === 'closed');
  A('从没连上(connecting)重连耗尽 → phase=error', onReconnectExhausted(initialView).phase === 'error');

  section('契约客户端：HTTP 状态分流(business/transport/drift)+ 强制幂等键');
  let f = fakeFetchWith();
  let api = makeInterviewApi('http://x', f.make(200, { id: 'R1', status: 'active', current_question_index: 0, issued_turns: 1, answered_turns: 0, current_turn: 0, processing_turn: null }));
  const okr = await api.getInterview('R1');
  A('2xx 合法 → ok+类型化', okr.ok && okr.value.id === 'R1');
  api = makeInterviewApi('http://x', fakeFetchWith().make(404, { error: 'not_found_or_forbidden' }));
  const nf = await api.getInterview('R1');
  A('404 → business 错(可降级,非不透明抛)', !nf.ok && nf.kind === 'business' && nf.status === 404 && nf.error === 'not_found_or_forbidden');
  api = makeInterviewApi('http://x', fakeFetchWith().make(500, {}));
  A('500 → transport 错(可重试)', await api.getInterview('R1').then((r) => !r.ok && r.kind === 'transport'));
  api = makeInterviewApi('http://x', fakeFetchWith().make(500, null, false, true));
  A('500 非JSON(HTML) → transport,不崩', await api.getInterview('R1').then((r) => !r.ok && r.kind === 'transport'));
  api = makeInterviewApi('http://x', fakeFetchWith().make(0, {}, true));
  A('网络抛错 → transport', await api.getInterview('R1').then((r) => !r.ok && r.kind === 'transport'));
  api = makeInterviewApi('http://x', fakeFetchWith().make(200, { id: 'R1' /* 缺字段 */ }));
  A('2xx 但形不符 → drift(告警,不裸用)', await api.getInterview('R1').then((r) => !r.ok && r.kind === 'drift'));

  f = fakeFetchWith();
  const turnBody = { questionId: 'q-v1-t0-c0', stateVersion: 2, turn: 0, answer: 'hi', answerId: '0d2e58d1-5c6b-4c0a-9a75-8b67f2251d1c', answerHash: '8f434346648f6b96df89dda901c5176b10a6d5f2b0f3e7f75f1e3e2b2d3e1f62' };
  api = makeInterviewApi('http://x', f.make(200, { accepted: true, replayed: false, jobId: 'J1' }));
  const ar = await api.submitAnswer('R1', turnBody, 'idem-key-1');
  A('submitAnswer 带幂等键 → ok+判别联合', ar.ok && ar.value.accepted === true && ar.value.replayed === false);
  A('请求确实带上 idempotency-key 头(后端必需)', f.calls.at(-1)?.headers?.['idempotency-key'] === 'idem-key-1');
  A('提交走 /turn 且请求体含服务端 questionId', f.calls.at(-1)?.url.endsWith('/interview/R1/turn') === true && f.calls.at(-1)?.body?.includes('q-v1-t0-c0') === true);
  const noKey = await makeInterviewApi('http://x', fakeFetchWith().make(200, {})).submitAnswer('R1', turnBody, '');
  A('缺幂等键 → 本地拦为 business 错(不发无效请求)', !noKey.ok && (noKey as any).error === 'missing_idempotency_key');
  const badReq = await makeInterviewApi('http://x', fakeFetchWith().make(200, {})).submitAnswer('R1', { ...turnBody, answerHash: 'bad' }, 'k');
  A('非法 question/answer 身份契约 → 本地 invalid_request,不发请求', !badReq.ok && badReq.kind === 'invalid_request');

  section('SSE 驱动：读流→续状态→终态收尾（端到端,无浏览器）');
  const noSleep = async () => {};
  const happy = await runInterviewStream({
    open: () => streamOf(ev(1, 'question_ready', { question: 'Q1' }), ev(2, 'waiting_user', {}), ev(3, 'report_ready', { overall: 74 })),
    onView: () => {}, sleep: noSleep,
  });
  A('驱动跑到 report_ready 终态收尾(connection=closed)', happy.phase === 'report_ready' && happy.connection === 'closed' && happy.report?.overall === 74);
  const duplicateInterview = await runInterviewStream({
    open: () => streamOf(ev(1, 'question_ready', { question: 'Q1' }), ev(1, 'question_ready', { question: 'Q1 重放' }), ev(2, 'report_ready', { overall: 74 })),
    onView: () => {}, sleep: noSleep,
  });
  A('重复 SSE id 不会重复归约/重复渲染题目', duplicateInterview.turns.length === 1 && duplicateInterview.turns[0]?.q === 'Q1');

  section('SSE 驱动：断线自动重连,凭 Last-Event-ID 续(不丢不重)');
  const seenLastIds: number[] = [];
  const reconnect: StreamOpener = (lastEventId) => {
    seenLastIds.push(lastEventId);
    return lastEventId === 0
      ? streamOf(ev(1, 'question_ready', { question: 'Q1' }), ev(2, 'waiting_user', {}))   // 首连:到 waiting 后断
      : streamOf(ev(3, 'report_ready', { overall: 88 }));                                   // 重连:续到报告
  };
  const resumed = await runInterviewStream({ open: reconnect, onView: () => {}, sleep: noSleep });
  A('断流后自动重连(open 被调 2 次)', seenLastIds.length === 2);
  A('重连凭 Last-Event-ID=2 续(seq>2 重放,不丢不重)', seenLastIds[1] === 2);
  A('续上报告 → report_ready', resumed.phase === 'report_ready' && resumed.report?.overall === 88);

  section('SSE 驱动：重连耗尽 → degraded 出口(不无限重连)');
  let opens = 0;
  const exhaustedRun = await runInterviewStream({
    open: () => { opens++; return streamOf(ev(1, 'waiting_user', {})); },   // 每次都只到 waiting 就断,永不出报告
    onView: () => {}, sleep: noSleep, maxRetries: 2,
  });
  A('重连耗尽(≤maxRetries+1 次)后 degraded 收尾', exhaustedRun.degraded && exhaustedRun.connection === 'closed');
  A('确实有界,不无限重连', opens <= 3);

  section('SSE 驱动：终态 report_unavailable 不再重连(优雅降级)');
  let opens2 = 0;
  const unavail = await runInterviewStream({
    open: () => { opens2++; return streamOf(ev(1, 'waiting_user', {}), ev(2, 'report_unavailable', { reason: 'max_attempts_exceeded' })); },
    onView: () => {}, sleep: noSleep,
  });
  A('收到 report_unavailable → 终态收尾,不重连', unavail.phase === 'report_unavailable' && unavail.degraded && opens2 === 1);

  section('SSE 驱动：传输错(open 抛)→ 重连耗尽降级(审计:catch 路径)');
  const transportFail = await runInterviewStream({
    open: () => { throw new Error('connection refused'); }, onView: () => {}, sleep: noSleep, maxRetries: 2,
  });
  A('open 每次抛 → 有界重连后 degraded(不崩,不无限)', transportFail.degraded && transportFail.connection === 'closed');

  section('SSE 驱动：error 终态事件 → phase=error 收尾(不重连)');
  let opensE = 0;
  const errEnd = await runInterviewStream({
    open: () => { opensE++; return streamOf(ev(1, 'error', {})); }, onView: () => {}, sleep: noSleep,
  });
  A('error 事件 → 终态收尾,不重连', errEnd.phase === 'error' && opensE === 1);

  section('SSE 驱动：dribble 绝对上限(每次都有进展也封顶,审计 A 防 DoS)');
  let dribbleN = 0;
  const dribble = await runInterviewStream({
    open: (lastId) => { dribbleN++; return streamOf(ev(lastId + 1, 'progress', {})); }, // 每次推进 1 个 id,永不出终态
    onView: () => {}, sleep: noSleep, maxRetries: 1000, maxTotalReconnects: 5,            // 连续重试很大,但绝对上限封顶
  });
  A('即便每次有进展,触绝对上限后 degraded(有界,防 dribble-DoS)', dribble.degraded && dribbleN <= 6);

  section('SSE 驱动：取消(AbortSignal)→ 立即停,不再 onView(审计 C 卸载)');
  const ac = new AbortController();
  let viewCalls = 0;
  ac.abort();                                                          // 已取消
  const aborted = await runInterviewStream({
    open: () => streamOf(ev(1, 'question_ready', { question: 'Q' })), onView: () => { viewCalls++; }, sleep: noSleep, signal: ac.signal,
  });
  A('已 abort → 立即返回,onView 零调用(不在卸载组件上渲染)', viewCalls === 0 && aborted.phase === 'connecting');

  section('SSE 驱动：mid-frame 断流 → lastEventId 未推进,重连重放完整帧(不丢事件,审计 3)');
  const seenIds: number[] = [];
  let midCall = 0;
  const midFrame = await runInterviewStream({
    open: (lastId) => { seenIds.push(lastId); midCall++; return midCall === 1
      ? streamOf('id: 1\nevent: question_ready\ndata: {"question"')          // 首连:半截帧(无 \n\n)就断
      : streamOf(ev(1, 'question_ready', { question: 'Q1' }), ev(2, 'report_ready', { overall: 60 })); }, // 重连:server 从 seq>0 重放完整
    onView: () => {}, sleep: noSleep,
  });
  A('半截帧断流 → lastEventId 未推进(=0),重连仍从 0(未丢未提前确认)', seenIds[0] === 0 && seenIds[1] === 0);
  A('重连重放完整帧 → 续到终态(半截事件没丢)', midFrame.phase === 'report_ready' && midFrame.report?.overall === 60);

  section('视图模型:任何状态都不死胡同(UX-HA:不无限转圈、永远有出路)');
  const baseV = (over: Partial<InterviewView>): InterviewView => ({ phase: 'connecting', degraded: false, connection: 'live', lastEventId: 0, turns: [], ...over });
  const { ALL_PHASES } = await import('../lib/stream/interview-state.ts');
  const phases = ALL_PHASES;   // 单一真相,自动覆盖未来新 phase(防漏)
  const allDisplays = phases.map((p) => interviewDisplay(baseV({ phase: p, question: 'Q', lastScore: 80, report: { overall: 74 } })));
  A(`所有 ${phases.length} 个 phase 都不是死胡同(遍历 ALL_PHASES 单一真相,加 phase 自动覆盖)`, allDisplays.every((d) => !isDeadEnd(d)) && phases.includes('interview_unavailable'));
  A('interview_unavailable → degraded + 重试出口 + 不转圈(面试失败终态,不死等)', (() => { const d = interviewDisplay(baseV({ phase: 'interview_unavailable' })); return d.degraded && d.action.kind === 'retry' && !d.spinner; })());
  A('report_unavailable → degraded + 重试操作 + 不转圈(优雅降级,非无限等)', (() => { const d = interviewDisplay(baseV({ phase: 'report_unavailable' })); return d.degraded && d.action.kind === 'retry' && !d.spinner; })());
  A('断线重连态 → 显式"重连中"+手动重试出口(不冻结)', (() => { const d = interviewDisplay(baseV({ phase: 'waiting_user', connection: 'reconnecting' })); return d.action.kind === 'retry' && d.message.includes('重连'); })());
  A('report_ready → 看报告操作 + 含评分', (() => { const d = interviewDisplay(baseV({ phase: 'report_ready', report: { overall: 74 } })); return d.action.kind === 'view_report' && d.report?.overall === 74; })());
  A('每个状态要么有可读内容、要么有可点操作(都给得出路)', allDisplays.every((d) => d.message.trim().length > 0 || d.action.kind !== 'none'));

  // ───────────────────────── 押题(resume-quiz)前端逻辑:同样的无死胡同 + 终态健壮性门禁 ─────────────────────────
  const { runQuizStream } = await import('../lib/stream/quiz-stream.ts');
  const {
    applyQuizEvent, initialQuizView, quizDisplay, isQuizDeadEnd, ALL_QUIZ_PHASES,
    onQuizStreamClosed, onQuizReconnectExhausted, isQuizTerminal,
  } = await import('../lib/stream/quiz-state.ts');
  const qreduce = (evs: Array<{ event: string; id: number; data: any }>) => evs.reduce((v, e) => applyQuizEvent(v, e as any), initialQuizView);

  section('押题视图归约:progress/question_ready 累题 + quiz_ready 终态(report 漂移不击沉终态)');
  const qv = qreduce([
    { event: 'progress', id: 1, data: { stage: 'generating' } },
    { event: 'question_ready', id: 2, data: { question: '限流怎么做?', refs: ['限流'] } },
    { event: 'question_ready', id: 3, data: { question: 'Redis 原子性?', refs: ['Redis'] } },
    { event: 'quiz_ready', id: 4, data: { count: 2, report: { score: 80, grounded: 2, summary: '接地 2 题' } } },
  ]);
  A('quiz_ready → phase=ready + 2 题 + report 接上', qv.phase === 'ready' && qv.questions.length === 2 && qv.report?.grounded === 2 && qv.total === 2);
  // 关键回归:report 字段类型漂移(score 给字符串)绝不能让唯一成功终态被丢 → 否则"成功翻降级/出错"
  const qvDrift = qreduce([{ event: 'quiz_ready', id: 1, data: { count: 3, report: { score: 'oops', grounded: null } } }]);
  A('quiz_ready 即便 report 字段漂移仍到达 ready(终态不被装饰字段击沉)', qvDrift.phase === 'ready' && qvDrift.total === 3 && qvDrift.report === undefined);
  const qvNoReport = qreduce([{ event: 'quiz_ready', id: 1, data: {} }]);
  A('quiz_ready 无 report/无 count 也到达 ready(不卡生成态)', qvNoReport.phase === 'ready');
  const qUnavail = qreduce([{ event: 'progress', id: 1, data: {} }, { event: 'quiz_unavailable', id: 2, data: { reason: 'job_failed' } }]);
  A('quiz_unavailable → degraded + 退出等待(优雅降级,不无限转圈)', qUnavail.degraded && qUnavail.phase === 'quiz_unavailable');

  section('押题流断/重连:非终态→reconnecting;终态→closed;耗尽→degraded 出口');
  const qClosedMid = onQuizStreamClosed(qreduce([{ event: 'question_ready', id: 1, data: { question: 'Q', refs: [] } }]));
  A('生成中断流 → reconnecting(自动重连,非卡死)', qClosedMid.connection === 'reconnecting' && !isQuizTerminal(qClosedMid.phase));
  A('终态(ready)断流 → closed(正常结束)', onQuizStreamClosed(qreduce([{ event: 'quiz_ready', id: 1, data: { count: 1 } }])).connection === 'closed');
  A('重连耗尽 → degraded 出口;从未连上则 error', onQuizReconnectExhausted(qClosedMid).degraded && onQuizReconnectExhausted(initialQuizView).phase === 'error');

  section('押题 SSE 驱动:端到端(happy/重连续传/耗尽/已就绪重放/坏帧)');
  const qHappy = await runQuizStream({
    open: () => streamOf(ev(1, 'progress', {}), ev(2, 'question_ready', { question: 'Q1', refs: ['限流'] }), ev(3, 'quiz_ready', { count: 1, report: { score: 60, grounded: 1, summary: 's' } })),
    onView: () => {}, sleep: noSleep,
  });
  A('驱动跑到 quiz_ready 终态收尾(closed)', qHappy.phase === 'ready' && qHappy.connection === 'closed' && qHappy.questions.length === 1);
  const qSeen: number[] = [];
  const qResumed = await runQuizStream({
    open: (lastId) => { qSeen.push(lastId); return lastId === 0
      ? streamOf(ev(1, 'question_ready', { question: 'Q1', refs: [] }))                  // 首连:一题后断
      : streamOf(ev(2, 'quiz_ready', { count: 1, report: null })); },                     // 重连:续到终态(report=null 也行)
    onView: () => {}, sleep: noSleep,
  });
  A('断流自动重连凭 Last-Event-ID=1 续 → ready', qSeen.length === 2 && qSeen[1] === 1 && qResumed.phase === 'ready');
  let qOpens = 0;
  const qExhaust = await runQuizStream({ open: () => { qOpens++; return streamOf(ev(1, 'progress', {})); }, onView: () => {}, sleep: noSleep, maxRetries: 2 });
  A('永不出终态 → 有界重连后 degraded(不无限转圈)', qExhaust.degraded && qExhaust.connection === 'closed' && qOpens <= 3);
  const qReplay = await runQuizStream({   // 用户打开一个已完成押题:服务端一次性重放全部事件含终态
    open: () => streamOf(ev(1, 'question_ready', { question: 'Q1', refs: [] }), ev(2, 'question_ready', { question: 'Q2', refs: [] }), ev(2, 'question_ready', { question: 'Q2 重放', refs: [] }), ev(3, 'quiz_ready', { count: 2, report: { score: 80, grounded: 2, summary: 's' } })),
    onView: () => {}, sleep: noSleep,
  });
  A('已就绪押题重放 → 一次到 ready,题目齐(无重连)', qReplay.phase === 'ready' && qReplay.questions.length === 2);

  section('押题视图模型:任何状态都不死胡同(P0:无死胡同可确定性 gate)');
  const qDisplays = ALL_QUIZ_PHASES.map((p) => quizDisplay({ phase: p, questions: [], degraded: false, connection: 'live', lastEventId: 0 }));
  A(`所有 ${ALL_QUIZ_PHASES.length} 个押题 phase 都不是死胡同(遍历 ALL_QUIZ_PHASES,加 phase 自动覆盖)`, qDisplays.every((d) => !isQuizDeadEnd(d)));
  A('quiz_unavailable → degraded + 重试出口 + 不转圈', (() => { const d = quizDisplay({ phase: 'quiz_unavailable', questions: [], degraded: true, connection: 'live', lastEventId: 0 }); return d.degraded && d.action.kind === 'retry' && !d.spinner; })());
  A('断线重连态 → 显式"重连中"+手动重试出口(不冻结)', (() => { const d = quizDisplay({ phase: 'generating', questions: [], degraded: false, connection: 'reconnecting', lastEventId: 0 }); return d.action.kind === 'retry' && d.message.includes('重连'); })());
  A('每个押题状态要么有可读内容、要么有可点操作(都给得出路)', qDisplays.every((d) => d.message.trim().length > 0 || d.action.kind !== 'none'));

  // ───────────────────────── 简历诊断(resume-diagnosis)前端逻辑:同样的无死胡同 + 终态健壮性门禁 ─────────────────────────
  const { runDiagnosisStream } = await import('../lib/stream/diagnosis-stream.ts');
  const {
    applyDiagnosisEvent, initialDiagnosisView, diagnosisDisplay, isDiagnosisDeadEnd, ALL_DIAGNOSIS_PHASES,
    onDiagnosisStreamClosed, onDiagnosisReconnectExhausted, isDiagnosisTerminal,
  } = await import('../lib/stream/diagnosis-state.ts');
  const dreduce = (evs: Array<{ event: string; id: number; data: any }>) => evs.reduce((v, e) => applyDiagnosisEvent(v, e as any), initialDiagnosisView);

  section('诊断视图归约:progress/section_ready 累维度 + rewrite_ready 累改写 + diagnosis_ready 终态(摘要漂移不击沉终态)');
  const dv = dreduce([
    { event: 'progress', id: 1, data: { stage: 'generating' } },
    { event: 'section_ready', id: 2, data: { kind: 'highlight', title: '亮点', score: 85, findings: [{ text: '有限流实战', refs: ['限流'] }] } },
    { event: 'section_ready', id: 3, data: { kind: 'risk', title: '风险', findings: [{ text: '缺量化', refs: [] }] } },
    { event: 'rewrite_ready', id: 4, data: { before: 'a', after: 'b', refs: ['限流'] } },
    { event: 'diagnosis_ready', id: 5, data: { overall: 72, summary: '总体不错', sectionCount: 2, rewriteCount: 1 } },
  ]);
  A('diagnosis_ready → phase=ready + 2 维度 + 1 改写(逐条流式)+ overall 接上', dv.phase === 'ready' && dv.sections.length === 2 && dv.overall === 72 && dv.rewrites.length === 1 && dv.total === 2);
  // 关键回归:摘要字段漂移(overall 给字符串)绝不能让唯一成功终态被丢 → 否则"成功翻降级/出错"
  const dvDrift = dreduce([{ event: 'diagnosis_ready', id: 1, data: { overall: 'oops', sectionCount: 3, rewriteCount: 'nope' } }]);
  A('diagnosis_ready 即便摘要字段漂移仍到达 ready(终态不被装饰字段击沉)', dvDrift.phase === 'ready' && dvDrift.total === 3 && dvDrift.overall === undefined);
  const dvNoReport = dreduce([{ event: 'diagnosis_ready', id: 1, data: {} }]);
  A('diagnosis_ready 无 overall/无计数也到达 ready(不卡生成态)', dvNoReport.phase === 'ready');
  const dUnavail = dreduce([{ event: 'progress', id: 1, data: {} }, { event: 'diagnosis_unavailable', id: 2, data: { reason: 'job_failed' } }]);
  A('diagnosis_unavailable → degraded + 退出等待(优雅降级,不无限转圈)', dUnavail.degraded && dUnavail.phase === 'diagnosis_unavailable');

  section('诊断流断/重连:非终态→reconnecting;终态→closed;耗尽→degraded 出口');
  const dClosedMid = onDiagnosisStreamClosed(dreduce([{ event: 'section_ready', id: 1, data: { kind: 'highlight', title: 'h', findings: [] } }]));
  A('生成中断流 → reconnecting(自动重连,非卡死)', dClosedMid.connection === 'reconnecting' && !isDiagnosisTerminal(dClosedMid.phase));
  A('终态(ready)断流 → closed(正常结束)', onDiagnosisStreamClosed(dreduce([{ event: 'diagnosis_ready', id: 1, data: { sectionCount: 1 } }])).connection === 'closed');
  A('重连耗尽 → degraded 出口;从未连上则 error', onDiagnosisReconnectExhausted(dClosedMid).degraded && onDiagnosisReconnectExhausted(initialDiagnosisView).phase === 'error');

  section('诊断 SSE 驱动:端到端(happy/重连续传/耗尽/已就绪重放)');
  const dHappy = await runDiagnosisStream({
    open: () => streamOf(ev(1, 'progress', {}), ev(2, 'section_ready', { kind: 'highlight', title: 'h', findings: [{ text: 't', refs: ['限流'] }] }), ev(3, 'diagnosis_ready', { overall: 60, summary: 's', sectionCount: 1, rewrites: [] })),
    onView: () => {}, sleep: noSleep,
  });
  A('驱动跑到 diagnosis_ready 终态收尾(closed)', dHappy.phase === 'ready' && dHappy.connection === 'closed' && dHappy.sections.length === 1);
  const dDuplicate = await runDiagnosisStream({
    open: () => streamOf(ev(1, 'section_ready', { kind: 'highlight', title: 'h', findings: [] }), ev(1, 'section_ready', { kind: 'risk', title: '重放', findings: [] }), ev(2, 'diagnosis_ready', { sectionCount: 1, rewrites: [] })),
    onView: () => {}, sleep: noSleep,
  });
  A('诊断流重复 SSE id 不会重复追加区块', dDuplicate.sections.length === 1 && dDuplicate.sections[0]?.title === 'h');
  const dSeen: number[] = [];
  const dResumed = await runDiagnosisStream({
    open: (lastId) => { dSeen.push(lastId); return lastId === 0
      ? streamOf(ev(1, 'section_ready', { kind: 'risk', title: 'r', findings: [] }))       // 首连:一维度后断
      : streamOf(ev(2, 'diagnosis_ready', { sectionCount: 1, rewrites: [] })); },           // 重连:续到终态
    onView: () => {}, sleep: noSleep,
  });
  A('断流自动重连凭 Last-Event-ID=1 续 → ready', dSeen.length === 2 && dSeen[1] === 1 && dResumed.phase === 'ready');
  let dOpens = 0;
  const dExhaust = await runDiagnosisStream({ open: () => { dOpens++; return streamOf(ev(1, 'progress', {})); }, onView: () => {}, sleep: noSleep, maxRetries: 2 });
  A('永不出终态 → 有界重连后 degraded(不无限转圈)', dExhaust.degraded && dExhaust.connection === 'closed' && dOpens <= 3);

  section('诊断视图模型:任何状态都不死胡同(P0:无死胡同可确定性 gate)');
  const dDisplays = ALL_DIAGNOSIS_PHASES.map((p) => diagnosisDisplay({ phase: p, sections: [], rewrites: [], degraded: false, connection: 'live', lastEventId: 0 }));
  A(`所有 ${ALL_DIAGNOSIS_PHASES.length} 个诊断 phase 都不是死胡同(遍历 ALL_DIAGNOSIS_PHASES,加 phase 自动覆盖)`, dDisplays.every((d) => !isDiagnosisDeadEnd(d)));
  A('diagnosis_unavailable → degraded + 重试出口 + 不转圈', (() => { const d = diagnosisDisplay({ phase: 'diagnosis_unavailable', sections: [], rewrites: [], degraded: true, connection: 'live', lastEventId: 0 }); return d.degraded && d.action.kind === 'retry' && !d.spinner; })());
  A('断线重连态 → 显式"重连中"+手动重试出口(不冻结)', (() => { const d = diagnosisDisplay({ phase: 'generating', sections: [], rewrites: [], degraded: false, connection: 'reconnecting', lastEventId: 0 }); return d.action.kind === 'retry' && d.message.includes('重连'); })());
  A('每个诊断状态要么有可读内容、要么有可点操作(都给得出路)', dDisplays.every((d) => d.message.trim().length > 0 || d.action.kind !== 'none'));

  console.log(`\n${failures === 0 ? '✓ 全部通过' : '✗ ' + failures + ' 项失败'}`);
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });

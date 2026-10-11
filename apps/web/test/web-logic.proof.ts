/**
 * 前端承重逻辑证明（纯函数,无浏览器）：SSE 解码(含 CRLF/心跳/分块)、契约客户端(状态分流+幂等键)、视图归约的优雅降级与无静默死胡同。
 *   pnpm web:prove
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodeSSE, toBusinessEvent } from '../lib/stream/business-events.ts';
import {
  reduceInterview, applyEvent, applyEvents, initialView, onStreamClosed, onReconnectExhausted, isTerminal,
} from '../lib/stream/interview-state.ts';
import { interviewDisplay, isDeadEnd, signalConcludePracticeCopy } from '../lib/view-model.ts';
import { makeInterviewApi, type FetchLike, type FetchResponse } from '../lib/api/client.ts';
import { runInterviewStream, type StreamOpener } from '../lib/stream/interview-stream.ts';
import type { InterviewView } from '../lib/stream/interview-state.ts';
import {
  InvalidLastEventIdError, isInvalidLastEventIdError, lastEventIdHeaderValue,
  throwIfInvalidLastEventIdStatus, sseProxyFailureResponse,
} from '../lib/stream/sse-cursor.ts';
import { makeFrameCoalescer } from '../lib/stream/frame-coalescer.ts';
import { interviewTurnWindow } from '../lib/stream/turn-window.ts';
import { buildTurnSubmission } from '../lib/interview/turn-submission.ts';
import { interviewActionLabel, interviewDisplayStatus, interviewProgressLabel, isInterviewEnterable, overviewAnsweredLabel } from '../lib/interview/progress.ts';
import { resumeOptionLabel, resumeStatusLabel } from '../lib/resume/display.ts';
import { isOcrPreviewEnabled, isOcrPreviewRequested, isProductionOcrLocked } from '../lib/ocr-preview.ts';
import {
  isProductionVoiceStreamLocked,
  isVoiceStreamAsrPreviewEnabled,
  isVoiceStreamAsrPreviewRequested,
} from '../lib/voice-stream-preview.ts';
import {
  RESUME_OCR_PREVIEW_TIMEOUT_MS,
  isPreviewOcrImage,
  isResumeImageUpload,
  isUploadTimeoutError,
  mapResumeUploadAbort,
  mapResumeUploadError,
  resumeFileAccept,
  resumeFileHelpText,
  resumeImageRefusedLocally,
  resumePreviewFormatRefused,
  resumeOcrPreviewBanner,
  resumeUploadCardDescription,
} from '../lib/resume/ocr-preview-ui.ts';
import { interviewContextTitle, interviewResumeLabel, interviewTimeLabel } from '../lib/interview/context.ts';
import { practiceHintScore, webTrustedQuestionIdentity } from '../lib/stream/scoring-honesty.ts';
import {
  applicationScoreVisible,
  applicationStatusLabel,
  findOwnedApplication,
  isRecruiterApplicationId,
  recruiterAssessmentLabel,
  RECRUITER_ARCHITECTURE_HIGHLIGHTS,
  RECRUITER_ARCHITECTURE_IDS,
} from '../lib/recruiter/surface.ts';
import { actionErrorMessage, INTERVIEW_PRIVACY_FENCED_TEXT } from '../lib/errors/action-error.ts';
import { turnSubmitFeedback } from '../lib/errors/turn-submit-error.ts';
import { isEligibleResume, resumeEmptyState } from '../lib/resume/display.ts';
import { parseEntitlement, entitlementLineView } from '../lib/commerce/display.ts';
import { interviewProgressBadge } from '../lib/interview/progress-badge.ts';
import {
  InterviewPrivacyFencedError, isInterviewPrivacyFencedError, iterateInterviewSseBody, iterateSseBody,
  throwIfPrivacyFencedStatus,
} from '../lib/stream/sse-cursor.ts';
import { projectTurnAnnotations, type TranscriptTurn } from '../lib/report/turn-annotations.ts';
import { growthDeltaComparable, growthDeltaView } from '../lib/growth/comparable.ts';
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
/** 静态 lineOf（沿 uc-e2e-001-nhp-bound.proof.ts 先例·F2 源断言用）。 */
function lineOf(src: string, re: RegExp, from = 0): number {
  const lines = src.split('\n');
  for (let i = from; i < lines.length; i++) if (re.test(lines[i]!)) return i + 1;
  return -1;
}

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
  section('中文业务名称：内部 id 只作 value，不进入可见文案');
  const resume = { id: '44444444-4444-4444-8444-444444444444', status: 'ingested', display_name: '简历 · 后端工程师 · 2026年08月20日 10:00' };
  A('简历选项显示中文业务名和中文状态', resumeOptionLabel(resume) === '简历 · 后端工程师 · 2026年08月20日 10:00（解析完成）');
  A('未知状态不回显英文状态键', resumeStatusLabel('unexpected_internal_state') === '状态未知');
  A('可见简历名称不包含内部 UUID', !resumeOptionLabel(resume).includes(resume.id));
  A('岗位上下文避免重复拼接面试字样', interviewContextTitle('算法工程师面试') === '面试岗位：算法工程师面试');
  A('旧 API 缺字段与确实未绑定保持不同中文语义', interviewContextTitle(undefined) === '面试岗位信息同步中' && interviewResumeLabel(undefined) === '简历信息同步中' && interviewResumeLabel(null) === '未绑定简历');
  A('面试时间按中文时区显示且缺失安全降级', interviewTimeLabel('2026-08-20T10:00:00.000Z').includes('18:00') && interviewTimeLabel(null) === '时间待同步');

  section('面试列表进度：以问题账本投影为准，不再把空会话伪装成第 1 题');
  A('零轮 abandoned 显示尚未出题', interviewProgressLabel({ status: 'abandoned', issued_turns: 0, answered_turns: 0, current_turn: null }) === '尚未出题');
  A('active 的 turn=3 显示第 4 题待答', interviewProgressLabel({ status: 'active', issued_turns: 4, answered_turns: 3, current_turn: 3 }) === '第 4 题待答');
  A('queued 的 turn=3 显示处理中', interviewProgressLabel({ status: 'created', issued_turns: 4, answered_turns: 3, processing_turn: 3 }) === '第 4 题处理中');
  A('completed 显示实际总题数', interviewProgressLabel({ status: 'completed', issued_turns: 8, answered_turns: 8 }) === '共 8 题');
  A('终态已出题但零回答不伪装成尚未出题', interviewProgressLabel({ status: 'abandoned', issued_turns: 1, answered_turns: 0, current_turn: 0 }) === '已出 1 题，未作答');
  A('终态残留 open turn 仍只显示已答题数', interviewProgressLabel({ status: 'abandoned', issued_turns: 4, answered_turns: 3, current_turn: 3 }) === '已作答 3 题');
  A('已放弃不再提供继续作答 CTA', interviewActionLabel('abandoned') === '已结束');
  A('未知状态 fail-closed，不提供作答入口', interviewActionLabel('future_terminal') === '状态待同步' && !isInterviewEnterable('future_terminal'));
  A('未知状态不伪装成进行中或待答', interviewDisplayStatus({ status: 'future_terminal', issued_turns: 1, current_turn: 0 }) === 'future_terminal' && interviewProgressLabel({ status: 'future_terminal', issued_turns: 1, current_turn: 0 }) === '进度待同步');
  A('有题的 created 派生为进行中展示态', interviewDisplayStatus({ status: 'created', issued_turns: 1, current_turn: 0 }) === 'active');
  A('总览缺失不把已答题数伪装成 0', overviewAnsweredLabel(null) === '—' && overviewAnsweredLabel(undefined) === '—');
  A('总览非法 answered 不渲染伪造进度', overviewAnsweredLabel({ answered: -1 }) === '—' && overviewAnsweredLabel({}) === '—');
  A('总览真实 0 与正数分别可区分', overviewAnsweredLabel({ answered: 0 }) === '0' && overviewAnsweredLabel({ answered: 3 }) === '3');

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
  A('answer_evaluated 无可信 identity → phase=answered 但不展示伪造分', v.phase === 'answered' && v.lastScore === undefined);
  const hinted = reduceInterview([
    toBusinessEvent({ event: 'question_ready', id: 1, data: '{"question":"Q1","questionId":"q-v1-t0-c0","stateVersion":1,"turn":0}' })!,
    toBusinessEvent({ event: 'answer_evaluated', id: 2, data: '{"score":80,"questionId":"q-v1-t0-c0","stateVersion":1,"turn":0,"answerId":"11111111-1111-4111-8111-111111111111","answerHash":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","competency":"限流"}' })!,
  ]);
  A('answer_evaluated 绑 canonical identity + answer claim → practice hint 可展示', hinted.phase === 'answered' && hinted.lastScore === 80 && hinted.turns[0]?.score === 80);
  const questionOnly = reduceInterview([
    toBusinessEvent({ event: 'question_ready', id: 1, data: '{"question":"Q1","questionId":"q-v1-t0-c0","stateVersion":1,"turn":0}' })!,
    toBusinessEvent({ event: 'answer_evaluated', id: 2, data: '{"score":80,"questionId":"q-v1-t0-c0","stateVersion":1,"turn":0}' })!,
  ]);
  A('仅有 question identity、缺 answer claim → 不展示 hint', questionOnly.lastScore === undefined);
  const forgedMap = reduceInterview([
    toBusinessEvent({ event: 'question_ready', id: 1, data: '{"question":"Q1","questionId":"q-v1-t0-c0","stateVersion":1,"turn":0}' })!,
    toBusinessEvent({ event: 'answer_evaluated', id: 2, data: '{"score":99,"questionId":"q-v2-t1-c0","stateVersion":2,"turn":1}' })!,
  ]);
  A('错题 identity 不得把分数贴到当前题（无 fake mapped score）', forgedMap.phase === 'answered' && forgedMap.lastScore === undefined && forgedMap.turns[0]?.score === undefined);
  const drifted = reduceInterview([
    toBusinessEvent({ event: 'question_ready', id: 1, data: '{"question":"Q1","questionId":"q-v1-t0-c0","stateVersion":4,"turn":0}' })!,
    toBusinessEvent({ event: 'answer_evaluated', id: 2, data: '{"score":88,"questionId":"q-v1-t0-c0","stateVersion":4,"turn":0}' })!,
  ]);
  A('canonical id 与 stateVersion 漂移 → 不展示分数', drifted.lastScore === undefined);
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
  A('无 identity 的 answered 不回填分数（缺出处 ≠ 80）', applyEvent(reduceInterview([toBusinessEvent({ event: 'question_ready', id: 1, data: '{"question":"Q"}' })!]), toBusinessEvent({ event: 'answer_evaluated', id: 2, data: '{"score":80}' })!).turns[0].score === undefined);
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
  let api = makeInterviewApi('http://x', f.make(200, { id: 'R1', status: 'active', job_title: '高级后端工程师', resume_display_name: '简历 · 后端工程师 · 2026年08月20日 10:00', current_question_index: 0, issued_turns: 1, answered_turns: 0, current_turn: 0, processing_turn: null }));
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

  section('SSE 驱动：重连耗尽 → 慢速永续不降级;绝对上限仍有界 degraded(#53 W1② 基线更新:旧「≤maxRetries+1 即 degraded」语义废除,见 REQUEST C9×W1 调和披露)');
  let opens = 0;
  const exhaustedRun = await runInterviewStream({
    open: () => { opens++; return streamOf(ev(1, 'waiting_user', {})); },   // 每次都只到 waiting 就断,永不出报告
    onView: () => {}, sleep: noSleep, maxRetries: 2,
  });
  A('maxRetries 耗尽后不即时 degraded;绝对上限(缺省 100)兜底仍有界 degraded 收尾', exhaustedRun.degraded && exhaustedRun.connection === 'closed');
  A('确实有界,不无限重连(无进展宽限5+失败预算+永续至绝对上限,opens=101;不再钉 ≤3)', opens > 3 && opens <= 105);

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

  section('HC-GAP-014：HTTP 400 invalid_last_event_id 必须停转/degraded，不得用同一游标重试');
  A('合法整数才编码 Last-Event-ID；0 不带头',
    lastEventIdHeaderValue(0) === undefined && lastEventIdHeaderValue(2) === '2');
  A('Infinity/小数/负数/NaN 本地失败关闭，绝不写成 Last-Event-ID',
    (() => {
      const bad = [Number.POSITIVE_INFINITY, 1.5, -1, Number.NaN];
      return bad.every((id) => {
        try { lastEventIdHeaderValue(id); return false; } catch (err) { return isInvalidLastEventIdError(err); }
      });
    })());
  A('HTTP 400 → 抛 InvalidLastEventIdError；502/401 不抛',
    (() => {
      try { throwIfInvalidLastEventIdStatus(400); return false; } catch (err) {
        if (!isInvalidLastEventIdError(err)) return false;
      }
      throwIfInvalidLastEventIdStatus(502);
      throwIfInvalidLastEventIdStatus(401);
      return true;
    })());
  const proxied400 = await sseProxyFailureResponse(new Response(JSON.stringify({ error: 'invalid_last_event_id' }), { status: 400 }));
  const proxied502 = await sseProxyFailureResponse(new Response('', { status: 502 }));
  A('SSE 代理 400 保持 400 且不伪装成 stream_unavailable',
    proxied400.status === 400 && (await proxied400.text()).includes('invalid_last_event_id'));
  A('SSE 代理 502 仍是不可用断线语义', proxied502.status === 502 && (await proxied502.text()) === 'stream_unavailable');
  const illegalCursorIds: number[] = [];
  const illegalCursor = await runInterviewStream({
    open: (lastId) => { illegalCursorIds.push(lastId); throw new InvalidLastEventIdError(); },
    onView: () => {}, sleep: noSleep, maxRetries: 5,
  });
  const illegalDisp = interviewDisplay(illegalCursor);
  A('首连 400 → open 恰好 1 次（不得用同一游标重试）', illegalCursorIds.length === 1 && illegalCursorIds[0] === 0);
  A('首连 400 → degraded + connection=closed + phase=error',
    illegalCursor.degraded && illegalCursor.connection === 'closed' && illegalCursor.phase === 'error');
  A('首连 400 fail-closed 展示：不转圈 + 重试出口',
    illegalDisp.degraded && !illegalDisp.spinner && illegalDisp.action.kind === 'retry' && illegalDisp.message.trim().length > 0);
  const midCursorIds: number[] = [];
  const midIllegal = await runInterviewStream({
    open: (lastId) => {
      midCursorIds.push(lastId);
      if (lastId === 0) return streamOf(ev(1, 'question_ready', { question: 'Q1' }), ev(2, 'waiting_user', {}));
      throw new InvalidLastEventIdError();
    },
    onView: () => {}, sleep: noSleep, maxRetries: 5,
  });
  const midDisp = interviewDisplay(midIllegal);
  A('重连 400 → 第二次 open 带 lastEventId=2 后立即停，不再第三次用 2 重试',
    midCursorIds.length === 2 && midCursorIds[1] === 2 && midIllegal.degraded && midIllegal.connection === 'closed' && midIllegal.lastEventId === 2);
  A('中途非法游标 fail-closed：不转圈、不当成仍可作答',
    midDisp.degraded && !midDisp.spinner && midDisp.action.kind === 'retry' && midDisp.message.includes('不会再用同一续传编号') && !midDisp.message.includes('请回答'));
  let emptyOpens = 0;
  const emptyThenOk = await runInterviewStream({
    open: () => {
      emptyOpens++;
      return emptyOpens === 1 ? streamOf() : streamOf(ev(1, 'report_ready', { overall: 70 }));
    },
    onView: () => {}, sleep: noSleep,
  });
  A('空结束(502/401 语义)仍按断线重连，不是 400 停转',
    emptyOpens === 2 && emptyThenOk.phase === 'report_ready' && !emptyThenOk.degraded);

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

  // ───────────────────────── TOKSTREAM 阶段1(TS-P3 前端渲染断言 @REQUEST a31a7bbe) ─────────────────────────
  section('TOKSTREAM 生成进度:白名单解析 + 归约(幂等覆盖写/业务事件清除/缺帧不死胡同) + loading→真实进度');
  // b0 解析面:三类新 kind 必须经 decodeSSE+toBusinessEvent 进契约(漏注册=前端静默丢=白写)。
  const tsFrames = decodeSSE([
    ev(1, 'generation_started', { jobKind: 'next_question', operationId: 'interview.question-generation.v1', attemptKey: 'i1:ask:t0:0', segments: ['retrieve', 'generate', 'validate'], startedAt: '2026-10-07T00:00:00.000Z' }),
    ev(2, 'model_first_token', { attemptKey: 'i1:ask:t0:0', firstTokenMs: 1234, tokensSoFar: 1 }),
    ev(3, 'generation_progress', { attemptKey: 'i1:ask:t0:0', stage: 'generate', elapsedMs: 4200, tokensSoFar: 87 }),
  ].join('')).frames.map(toBusinessEvent);
  A('TS-P3 三类 generation_* 帧全部解析进契约(白名单双端注册)', tsFrames.length === 3 && tsFrames.every((e) => e !== null));
  // b1 进度不改 phase(interview 流红线:进度帧不发明阶段)。
  const tsV1 = applyEvents(initialView, [tsFrames[0]!, tsFrames[2]!]);
  A('TS-P3 进度帧只挂进度态,不改 phase/lastScore', tsV1.phase === 'connecting' && tsV1.generationProgress?.attemptKey === 'i1:ask:t0:0' && tsV1.generationProgress?.stage === 'generate' && tsV1.generationProgress?.elapsedMs === 4200);
  // b2 断线重放幂等覆盖写:同 attempt 旧帧(elapsedMs 更小)重复到达不回退计数(取 max)。
  const tsV2 = applyEvents(tsV1, [tsFrames[2]!, { ...tsFrames[2]!, id: 4, data: { attemptKey: 'i1:ask:t0:0', stage: 'generate', elapsedMs: 2100 } } as any]);
  A('TS-P3 重放旧进度帧不回退计数(同 attempt 数值取 max)', tsV2.generationProgress?.elapsedMs === 4200);
  // b3 新 attempt 直接替换(新一轮生成)。
  const tsV3 = applyEvents(tsV2, [{ ...tsFrames[0]!, id: 5, data: { attemptKey: 'i1:ask:t1:0', segments: ['retrieve', 'generate', 'validate'] } } as any]);
  A('TS-P3 新 attemptKey 替换旧进度态', tsV3.generationProgress?.attemptKey === 'i1:ask:t1:0' && tsV3.generationProgress?.elapsedMs === undefined);
  // b4 业务事件清除(断线重放防"已完成题重新显示生成中")。
  const tsV4 = applyEvents(tsV3, [{ event: 'question_ready', id: 6, data: { question: 'Q2' } } as any]);
  A('TS-P3 权威业务事件(question_ready)清除进度态', tsV4.phase === 'question' && tsV4.generationProgress === undefined);
  // b5 缺帧不死胡同:全程零进度帧(断线跳过)→ 视图照常推进,无 degraded/卡死。
  const tsV5 = applyEvents(initialView, [{ event: 'question_ready', id: 1, data: { question: 'Q1' } } as any]);
  A('TS-P3 进度帧全丢(模拟断线跳过)不死胡同(照常出题,不 degraded)', tsV5.phase === 'question' && !tsV5.degraded && tsV5.generationProgress === undefined);
  // b6 题间 loading→真实进度:interviewDisplay(answered+进度态)文案含 AI 生成中;无进度回既有文案(缺帧兜底)。
  const tsAns = applyEvents(baseV({ phase: 'answered' }), [tsFrames[0]!, tsFrames[2]!]);
  const tsDisp = interviewDisplay(tsAns);
  const tsDispNoProgress = interviewDisplay(baseV({ phase: 'answered' }));
  A('TS-P3 answered+进度态 display 文案含真实进度(AI 生成中·已 N 秒)', tsDisp.spinner && tsDisp.message.includes('AI 生成中') && tsDisp.message.includes('已 4 秒'));
  A('TS-P3 answered 无进度态回既有文案(缺帧兜底,不死等)', tsDispNoProgress.message.includes('正在出下一题') && !tsDispNoProgress.message.includes('AI 生成中'));
  // b7 押题流同构:generation_started 置 generating + 进度;quizDisplay 文案带进度;question_ready 清进度。
  const tsq1 = qreduce([
    { event: 'generation_started', id: 1, data: { jobKind: 'quiz', operationId: 'interview.quiz-generation.v1', attemptKey: 'tsq:quiz', segments: ['generate'] } },
    { event: 'generation_progress', id: 2, data: { attemptKey: 'tsq:quiz', stage: 'generate', elapsedMs: 4000 } },
  ]);
  const tsqDisp = quizDisplay(tsq1);
  A('TS-P3 quiz generation_started 置 generating + 进度态挂上(与既有 progress kind 同语义)', tsq1.phase === 'generating' && tsq1.generationProgress?.elapsedMs === 4000);
  A('TS-P3 quiz generating+进度态文案含真实进度', tsqDisp.spinner && tsqDisp.message.includes('AI 生成中') && tsqDisp.message.includes('已 4 秒'));
  const tsq2 = applyQuizEvent(tsq1, { event: 'question_ready', id: 3, data: { question: 'Q', refs: [] } } as any);
  A('TS-P3 quiz question_ready 清除进度态', tsq2.generationProgress === undefined && tsq2.questions.length === 1);


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
  A('永不出终态 → 慢速永续不即时降级;绝对上限仍有界 degraded(不无限转圈,#53 W1② 基线更新:不再钉 ≤3)', qExhaust.degraded && qExhaust.connection === 'closed' && qOpens > 3 && qOpens <= 105);
  const qBadIds: number[] = [];
  const qBad = await runQuizStream({
    open: (lastId) => { qBadIds.push(lastId); throw new InvalidLastEventIdError(); },
    onView: () => {}, sleep: noSleep, maxRetries: 5,
  });
  A('押题 400 非法游标 → open=1 + degraded/closed，不得同游标重试',
    qBadIds.length === 1 && qBad.degraded && qBad.connection === 'closed');
  A('押题 400 fail-closed 展示不转圈', (() => { const d = quizDisplay(qBad); return d.degraded && !d.spinner && d.action.kind === 'retry'; })());
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
  A('永不出终态 → 慢速永续不即时降级;绝对上限仍有界 degraded(不无限转圈,#53 W1② 基线更新:不再钉 ≤3)', dExhaust.degraded && dExhaust.connection === 'closed' && dOpens > 3 && dOpens <= 105);
  const dBadIds: number[] = [];
  const dBad = await runDiagnosisStream({
    open: (lastId) => { dBadIds.push(lastId); throw new InvalidLastEventIdError(); },
    onView: () => {}, sleep: noSleep, maxRetries: 5,
  });
  A('诊断 400 非法游标 → open=1 + degraded/closed，不得同游标重试',
    dBadIds.length === 1 && dBad.degraded && dBad.connection === 'closed');
  A('诊断 400 fail-closed 展示不转圈', (() => { const d = diagnosisDisplay(dBad); return d.degraded && !d.spinner && d.action.kind === 'retry'; })());

  section('诊断视图模型:任何状态都不死胡同(P0:无死胡同可确定性 gate)');
  const dDisplays = ALL_DIAGNOSIS_PHASES.map((p) => diagnosisDisplay({ phase: p, sections: [], rewrites: [], degraded: false, connection: 'live', lastEventId: 0 }));
  A(`所有 ${ALL_DIAGNOSIS_PHASES.length} 个诊断 phase 都不是死胡同(遍历 ALL_DIAGNOSIS_PHASES,加 phase 自动覆盖)`, dDisplays.every((d) => !isDiagnosisDeadEnd(d)));
  A('diagnosis_unavailable → degraded + 重试出口 + 不转圈', (() => { const d = diagnosisDisplay({ phase: 'diagnosis_unavailable', sections: [], rewrites: [], degraded: true, connection: 'live', lastEventId: 0 }); return d.degraded && d.action.kind === 'retry' && !d.spinner; })());
  A('断线重连态 → 显式"重连中"+手动重试出口(不冻结)', (() => { const d = diagnosisDisplay({ phase: 'generating', sections: [], rewrites: [], degraded: false, connection: 'reconnecting', lastEventId: 0 }); return d.action.kind === 'retry' && d.message.includes('重连'); })());
  A('每个诊断状态要么有可读内容、要么有可点操作(都给得出路)', dDisplays.every((d) => d.message.trim().length > 0 || d.action.kind !== 'none'));

  section('SCOR-00H SSE 练习分：只信 canonical identity，缺出处不是 0');
  A('web identity 拒 q-ready / 漂移',
    webTrustedQuestionIdentity({ questionId: 'q-ready', stateVersion: 3, turn: 2 }) === undefined
    && webTrustedQuestionIdentity({ questionId: 'q-v1-t0-c0', stateVersion: 5, turn: 0 }) === undefined
    && webTrustedQuestionIdentity({ questionId: 'q-v1-t0-c0', stateVersion: 1, turn: 0 })?.questionId === 'q-v1-t0-c0');
  const boundHint = {
    score: 0, questionId: 'q-v1-t0-c0', stateVersion: 1, turn: 0,
    answerId: '11111111-1111-4111-8111-111111111111',
    answerHash: 'a'.repeat(64), competency: '限流',
  };
  A('practice hint 无身份 / 缺 answer claim / 非整数 → undefined（不是 0）',
    practiceHintScore({ score: 80 }) === undefined
    && practiceHintScore({ score: 80, questionId: 'q-v1-t0-c0', stateVersion: 1, turn: 0 }) === undefined
    && practiceHintScore({ ...boundHint, score: 80.5 }) === undefined
    && practiceHintScore(boundHint) === 0);
  A('practice hint 贴到另一题 identity → undefined',
    practiceHintScore(
      { score: 99, questionId: 'q-v2-t1-c0', stateVersion: 2, turn: 1 },
      { questionId: 'q-v1-t0-c0', stateVersion: 1, turn: 0 },
    ) === undefined);
  A('report_ready 非 0..100 整数不写入视图 report（不是伪造 0）',
    reduceInterview([toBusinessEvent({ event: 'report_ready', id: 1, data: '{"overall":80.5}' })!]).report === undefined
    && reduceInterview([toBusinessEvent({ event: 'report_ready', id: 1, data: '{"overall":101}' })!]).report === undefined
    && reduceInterview([toBusinessEvent({ event: 'report_ready', id: 1, data: '{"overall":-1}' })!]).report === undefined
    && reduceInterview([toBusinessEvent({ event: 'report_ready', id: 1, data: '{"overall":74}' })!]).report?.overall === 74);

  section('UC-RES-081 简历页预览 OCR：双旗精确、生产/公开预览拒绝、失败不编造转写');
  const previewEnv = { OCR_ENABLED: '1', OCR_PREVIEW: '1' };
  A('TC-RES-081-main 仅精确双旗 1+1 才请求预览',
    isOcrPreviewRequested(previewEnv)
    && !isOcrPreviewRequested({ OCR_ENABLED: '1' })
    && !isOcrPreviewRequested({ OCR_ENABLED: 'true', OCR_PREVIEW: '1' })
    && !isOcrPreviewRequested({ OCR_ENABLED: '1', OCR_PREVIEW: 'true' })
    && !isOcrPreviewRequested({}));
  A('TC-RES-081-escape 生产 / enforce / 公开预览即使双旗也锁定',
    isProductionOcrLocked({ NODE_ENV: 'production' })
    && isProductionOcrLocked({ MODEL_COST_ENFORCEMENT: 'enforce' })
    && isProductionOcrLocked({ MEETWISE_PUBLIC_PREVIEW: '1' })
    && !isOcrPreviewEnabled({ ...previewEnv, NODE_ENV: 'production' })
    && !isOcrPreviewEnabled({ ...previewEnv, MODEL_COST_ENFORCEMENT: 'enforce' })
    && !isOcrPreviewEnabled({ ...previewEnv, MEETWISE_PUBLIC_PREVIEW: '1' })
    && isOcrPreviewEnabled({ ...previewEnv, NODE_ENV: 'development', MEETWISE_PUBLIC_PREVIEW: '0' }));
  A('TC-RES-081-main 预览才接受图片；关闭态 accept 不含 image',
    resumeFileAccept(true).includes('image/png')
    && !resumeFileAccept(false).includes('image')
    && resumeFileAccept(false).includes('.pdf'));
  A('TC-RES-081-main 预览文案声明非生产视觉承诺；关闭态不假装可识别',
    resumeFileHelpText(true).includes('不是生产视觉质量承诺')
    && resumeFileHelpText(true).includes('不会编造文字')
    && resumeUploadCardDescription(false).includes('图片识别未在本环境开放')
    && resumeOcrPreviewBanner().includes('不会编造简历文字')
    && !resumeFileHelpText(false).includes('求职者')
    && !resumeFileHelpText(true).includes('面试官'));
  A('TC-RES-081-special 图片判定看 mime 或扩展名，不以空 mime 放行',
    isResumeImageUpload('scan.png', '')
    && isResumeImageUpload('x', 'image/jpeg')
    && !isResumeImageUpload('cv.pdf', 'application/pdf')
    && !isResumeImageUpload('cv.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'));
  A('TC-RES-081-special 预览 accept 与 POST allowlist 同为 png/jpeg/webp，gif/bmp 关闭态仍当图片拒绝',
    !resumeFileAccept(true).includes('gif')
    && !resumeFileAccept(true).includes('bmp')
    && isPreviewOcrImage('scan.png', '')
    && isPreviewOcrImage('x', 'image/jpeg')
    && !isPreviewOcrImage('scan.gif', 'image/gif')
    && !isPreviewOcrImage('scan.bmp', '')
    && isResumeImageUpload('scan.gif', 'image/gif')
    && isResumeImageUpload('scan.bmp', ''));
  A('TC-RES-081-escape 扫描型 PDF 空文本不承诺未接线的逐页 OCR',
    mapResumeUploadError(400, { error: 'extracted_too_short' }).message.includes('带文字层的 PDF')
    && !mapResumeUploadError(400, { error: 'extracted_too_short' }).message.includes('仅预览环境'));
  A('TC-RES-081-escape 关闭态本地拒绝图片，不把本地拒绝写成成功',
    resumeImageRefusedLocally().ok === false
    && resumeImageRefusedLocally().error === 'image_ocr_unavailable'
    && !resumeImageRefusedLocally().message.includes('已识别'));
  A('TC-RES-081-special 预览态非 png/jpeg/webp 本地拒格式，不编造转写',
    resumePreviewFormatRefused().ok === false
    && resumePreviewFormatRefused().error === 'ocr_preview_format'
    && !resumePreviewFormatRefused().message.includes('已识别'));
  const invented = { error: 'ocr_failed', text: '伪造的北大博士经历', transcript: '完整转写', ocrText: '手机号13800138000' };
  const failed = mapResumeUploadError(422, invented);
  A('TC-RES-081-adversarial ocr_failed 带 text/transcript 也不当成功、不回显转写',
    failed.ok === false
    && failed.error === 'ocr_failed'
    && !failed.message.includes('伪造的北大博士')
    && !failed.message.includes('完整转写')
    && !failed.message.includes('13800138000')
    && failed.message.includes('不会编造识别结果'));
  A('TC-RES-081-empty 空信封与缺 error 不伪装成功',
    mapResumeUploadError(500, null).ok === false
    && mapResumeUploadError(422, {}).ok === false
    && mapResumeUploadError(422, { text: '空转写也不是成功' }).ok === false
    && !mapResumeUploadError(422, { text: '空转写也不是成功' }).message.includes('空转写'));
  A('TC-RES-081-drift API 仍 422 image_ocr_unavailable 时诚实不可用',
    mapResumeUploadError(422, { error: 'image_ocr_unavailable', hint: 'OCR_ENABLED=1' }).error === 'image_ocr_unavailable'
    && mapResumeUploadError(422, { error: 'image_ocr_unavailable' }).ok === false
    && !mapResumeUploadError(422, { error: 'ocr_no_content', text: ' ' }).message.includes('已保存'));
  A('TC-RES-081-timeout 预览图片超时窗口长于文本提取，仍不是无限等',
    RESUME_OCR_PREVIEW_TIMEOUT_MS === 35_000
    && RESUME_OCR_PREVIEW_TIMEOUT_MS > 8_000);
  A('TC-RES-081-timeout Abort/Timeout 都映射为失败、不编造成功',
    isUploadTimeoutError(Object.assign(new Error('aborted'), { name: 'AbortError' }))
    && isUploadTimeoutError(Object.assign(new Error('timed out'), { name: 'TimeoutError' }))
    && !isUploadTimeoutError(new Error('network'))
    && mapResumeUploadAbort().ok === false
    && mapResumeUploadAbort().error === 'upload_timeout'
    && !mapResumeUploadAbort().message.includes('已识别'));

  section('PRD-TEST-006 流式 ASR 预览旗：精确双旗、生产锁定、不发明转写入口');
  const voicePreviewEnv = { VOICE_STREAM_ASR_ENABLED: '1', VOICE_STREAM_ASR_PREVIEW: '1' };
  A('仅精确双旗 1+1 才请求流式 ASR 预览',
    isVoiceStreamAsrPreviewRequested(voicePreviewEnv)
    && !isVoiceStreamAsrPreviewRequested({ VOICE_STREAM_ASR_ENABLED: '1' })
    && !isVoiceStreamAsrPreviewRequested({ VOICE_STREAM_ASR_ENABLED: 'true', VOICE_STREAM_ASR_PREVIEW: '1' })
    && !isVoiceStreamAsrPreviewRequested({ VOICE_STREAM_ASR_ENABLED: '1', VOICE_STREAM_ASR_PREVIEW: 'true' })
    && !isVoiceStreamAsrPreviewRequested({}));
  A('生产 / enforce / 公开预览即使双旗也锁定流式 ASR',
    isProductionVoiceStreamLocked({ NODE_ENV: 'production' })
    && isProductionVoiceStreamLocked({ MODEL_COST_ENFORCEMENT: 'enforce' })
    && isProductionVoiceStreamLocked({ MEETWISE_PUBLIC_PREVIEW: '1' })
    && !isVoiceStreamAsrPreviewEnabled({ ...voicePreviewEnv, NODE_ENV: 'production' })
    && !isVoiceStreamAsrPreviewEnabled({ ...voicePreviewEnv, MODEL_COST_ENFORCEMENT: 'enforce' })
    && !isVoiceStreamAsrPreviewEnabled({ ...voicePreviewEnv, MEETWISE_PUBLIC_PREVIEW: '1' })
    && isVoiceStreamAsrPreviewEnabled({ ...voicePreviewEnv, NODE_ENV: 'development', MEETWISE_PUBLIC_PREVIEW: '0' }));

  section('SIGNAL-SSE：session_concluded 非终态、不发明分、不改 phase');
  const signalPayload = '{"concludeReason":{"code":"early_weak","turn":4,"citedCompetencies":["并发"]}}';
  const signalOnly = reduceInterview([toBusinessEvent({ event: 'session_concluded', id: 2, data: signalPayload })!]);
  A('session_concluded → 写入理由且 phase 仍 connecting（不是新终态）',
    signalOnly.signalConcludeReason?.code === 'early_weak' && signalOnly.signalConcludeReason.turn === 4
    && signalOnly.phase === 'connecting' && !isTerminal(signalOnly.phase)
    && signalOnly.lastScore === undefined && signalOnly.report === undefined);
  A('畸形 score/band/overall 载荷 → 丢弃事件（strict）',
    toBusinessEvent({ event: 'session_concluded', id: 3, data: '{"concludeReason":{"code":"early_weak","turn":4,"citedCompetencies":[],"score":0}}' }) === null
    && toBusinessEvent({ event: 'session_concluded', id: 3, data: '{"concludeReason":{"code":"early_weak","turn":4,"citedCompetencies":[]},"overall":88}' }) === null
    && toBusinessEvent({ event: 'session_concluded', id: 3, data: '{"concludeReason":{"code":"coverage_met","turn":8,"citedCompetencies":[]}}' }) === null);
  const signalThenReport = reduceInterview([
    toBusinessEvent({ event: 'session_concluded', id: 2, data: signalPayload })!,
    toBusinessEvent({ event: 'report_ready', id: 3, data: '{"overall":74}' })!,
  ]);
  A('先理由后报告：理由保留，overall 只由报告事件写入',
    signalThenReport.signalConcludeReason?.code === 'early_weak' && signalThenReport.phase === 'report_ready'
    && signalThenReport.report?.overall === 74);
  const reportThenSignal = reduceInterview([
    toBusinessEvent({ event: 'report_ready', id: 3, data: '{"overall":74}' })!,
    toBusinessEvent({ event: 'session_concluded', id: 4, data: '{"concludeReason":{"code":"thrashing","turn":6,"citedCompetencies":["缓存"]}}' })!,
  ]);
  A('先报告后理由：overall 不被 reason 改写',
    reportThenSignal.report?.overall === 74 && reportThenSignal.signalConcludeReason?.code === 'thrashing'
    && reportThenSignal.phase === 'report_ready');
  const signalDisp = interviewDisplay(signalThenReport);
  A('展示含练习控制流、不含等级；report.overall 仍是 74',
    signalDisp.signalConclude?.code === 'early_weak'
    && signalDisp.signalConclude.message.includes('练习') && signalDisp.signalConclude.message.includes('控制流')
    && signalDisp.signalConclude.message.includes('不是能力等级') && signalDisp.signalConclude.message.includes('招聘结论')
    && signalDisp.report?.overall === 74
    && signalConcludePracticeCopy('thrashing').includes('换题'));
  A('session_concluded 后断流：若尚未终态则重连（不把理由当收尾）',
    onStreamClosed(signalOnly).connection === 'reconnecting');
  const scoredThenSignal = reduceInterview([
    toBusinessEvent({ event: 'question_ready', id: 1, data: '{"question":"Q1","competency":"限流","questionId":"q-v1-t0-c0","stateVersion":1,"turn":0}' })!,
    toBusinessEvent({ event: 'answer_evaluated', id: 2, data: '{"score":80,"questionId":"q-v1-t0-c0","stateVersion":1,"turn":0,"answerId":"11111111-1111-4111-8111-111111111111","answerHash":"' + 'a'.repeat(64) + '","competency":"限流"}' })!,
    toBusinessEvent({ event: 'session_concluded', id: 3, data: signalPayload })!,
  ]);
  const scoredDisp = interviewDisplay(scoredThenSignal);
  A('已有练习 hint 后再收理由：lastScore 保持 80（不是 0），文案不再承诺下一题',
    scoredThenSignal.lastScore === 80 && scoredThenSignal.turns[0].score === 80
    && scoredThenSignal.phase === 'answered' && !isTerminal(scoredThenSignal.phase)
    && scoredDisp.signalConclude?.code === 'early_weak'
    && scoredDisp.message.includes('练习反馈') && !scoredDisp.message.includes('下一题')
    && !scoredDisp.message.includes('本题得分'));

  section('B 端申请状态：只命中自有 app_ 投影，分数恒不可见');
  const owned = [
    { id: 'app_alpha', status: 'assessment_unavailable', score: 68 },
    { id: 'app_beta', status: 'invited', score: null },
  ];
  A('合法自有申请命中', findOwnedApplication(owned, 'app_alpha')?.status === 'assessment_unavailable');
  A('他岗/未知 id 不命中', findOwnedApplication(owned, 'app_other') === null);
  A('非 app_ 前缀不命中', findOwnedApplication(owned, 'iv_legacy') === null && !isRecruiterApplicationId('../jobs'));
  A('注入型 applicationId 不命中', findOwnedApplication(owned, 'app_alpha/../talent') === null && findOwnedApplication(owned, 'app_alpha?x=1') === null);
  A('超长 applicationId 不命中', !isRecruiterApplicationId(`app_${'a'.repeat(80)}`));
  A('空列表与非法集不命中', findOwnedApplication(null, 'app_alpha') === null && findOwnedApplication(undefined, 'app_alpha') === null);
  A('评分暂不可用不是 0 分文案', recruiterAssessmentLabel('assessment_unavailable', 68) === '评分暂不可用' && !recruiterAssessmentLabel('assessment_unavailable', 68).includes('68'));
  A('历史 completed 仍不提供数值评分', recruiterAssessmentLabel('completed', 90) === '流程已结束 · 不提供数值评分');
  A('未知状态 fail-closed 为不提供数值评分', recruiterAssessmentLabel('future_terminal') === '不提供数值评分');
  A('申请分数消费门恒关闭', applicationScoreVisible(68) === false && applicationScoreVisible(null) === false);
  A('状态标签无死胡同', applicationStatusLabel('declined').text === '已婉拒' && applicationStatusLabel('missing').text === '状态未知');
  A('架构说明七项 id 固定且不含发布承诺', RECRUITER_ARCHITECTURE_IDS.join(',') === 'adaptive,checkpoint,prove,scoring,fence,fairness,acl'
    && RECRUITER_ARCHITECTURE_HIGHLIGHTS.length === 7
    && RECRUITER_ARCHITECTURE_HIGHLIGHTS.every((card) => card.title.length > 0 && !card.body.includes('生产级可靠')));
  A('公平卡片标题不宣称已经分开领', RECRUITER_ARCHITECTURE_HIGHLIGHTS.find((card) => card.id === 'fairness')?.title === '面试排队会轮着领');
  A('公平卡片写明不是高峰容量保证', RECRUITER_ARCHITECTURE_HIGHLIGHTS.find((card) => card.id === 'fairness')?.body.includes('不是高峰容量保证') === true);
  A('公平卡片不再写按账号串行领取', RECRUITER_ARCHITECTURE_HIGHLIGHTS.find((card) => card.id === 'fairness')?.body.includes('仍按账号串行领取') === false);
  A('公平卡片写明押题诊断报告仍抽干', RECRUITER_ARCHITECTURE_HIGHLIGHTS.find((card) => card.id === 'fairness')?.body.includes('押题、诊断、报告还是按账号抽干') === true);
  A('ACL 卡片不把检索权限写成已交付', RECRUITER_ARCHITECTURE_HIGHLIGHTS.find((card) => card.id === 'acl')?.body.includes('生产接线还没完成') === true);
  A('评分卡片写明不用 0 分凑数', RECRUITER_ARCHITECTURE_HIGHLIGHTS.find((card) => card.id === 'scoring')?.body.includes('不会用 0 分凑数') === true);
  A('分开记账卡片不把 0126 写成完整档案', RECRUITER_ARCHITECTURE_HIGHLIGHTS.find((card) => card.id === 'fence')?.body.includes('生产作答仍可能写明文任务') === true);

  section('ERRMSG-MAP #250/#251/#224 actionErrorMessage：四页×码集×兜底×未知码（纯函数输出断言·非浏览器 DOM 证明）');
  const pages = ['interviews', 'quiz', 'diagnosis', 'jobs'] as const;
  const credits402 = ['insufficient_entitlement', 'credits_unavailable', 'apply_credits_unavailable', 'interview_credits_unavailable'];
  A('402 四码×四页同落额度行：蓝本定稿文案+『额度说明』+/pricing+如实注记（无购买承诺）',
    credits402.every((c) => pages.every((p) => {
      const m = actionErrorMessage(p, 0, c);
      return m !== null
        && m.text === '额度不足，请前往『额度说明』查看获取方式'
        && m.text.includes('额度说明')
        && m.href === '/pricing'
        && m.note === '预览环境暂未开放购买';
    })));
  A('interviews 409 mapped 两码逐字蓝本：无链接出口（E1：继续/放弃=列表/会话两跳既有按钮面）',
    actionErrorMessage('interviews', 0, 'candidate_route_undecided')?.text === '暂时无法判断岗位方向'
    && actionErrorMessage('interviews', 0, 'candidate_route_undecided')?.href === undefined
    && actionErrorMessage('interviews', 0, 'interview_resume_binding_conflict')?.text === '你有一场未结束的面试：继续/放弃后重来'
    && actionErrorMessage('interviews', 0, 'interview_resume_binding_conflict')?.href === undefined);
  A('409 两码为 interviews 页域专属：quiz/diagnosis/jobs → null（rev2 E2 不跨页）',
    (['quiz', 'diagnosis', 'jobs'] as const).every((p) =>
      actionErrorMessage(p, 0, 'candidate_route_undecided') === null
      && actionErrorMessage(p, 0, 'interview_resume_binding_conflict') === null));
  A('503：码通道 public_preview_read_only 与 status 通道（含无码/未知码）→ 服务暂不可用',
    pages.every((p) => actionErrorMessage(p, 0, 'public_preview_read_only')?.text === '服务暂不可用')
    && actionErrorMessage('interviews', 503, null)?.text === '服务暂不可用'
    && actionErrorMessage('jobs', 503, 'interview_resume_binding_conflict')?.text === '服务暂不可用'
    && actionErrorMessage('quiz', 503, 'some_future_code')?.text === '服务暂不可用');
  A('create_failed 兜底三页原文一字不改（jobs 无 create 渲染面 → null）',
    actionErrorMessage('interviews', 0, 'create_failed')?.text === '创建面试失败,请稍后重试;若反复出现请确认额度与网络。'
    && actionErrorMessage('quiz', 0, 'create_failed')?.text === '创建押题失败,请稍后重试;若反复出现请确认额度与网络。'
    && actionErrorMessage('diagnosis', 0, 'create_failed')?.text === '创建诊断失败,请稍后重试;若反复出现请确认额度与网络。'
    && actionErrorMessage('jobs', 0, 'create_failed') === null);
  A('begin_failed 原文一字不改且不跨页（rev2 E2：quiz/diag 归一各页 create_failed 原文·jobs → null）',
    actionErrorMessage('interviews', 0, 'begin_failed')?.text === '启动面试失败（未预留额度）,请稍后重试;不会进入空会话。'
    && actionErrorMessage('quiz', 0, 'begin_failed')?.text === '创建押题失败,请稍后重试;若反复出现请确认额度与网络。'
    && actionErrorMessage('diagnosis', 0, 'begin_failed')?.text === '创建诊断失败,请稍后重试;若反复出现请确认额度与网络。'
    && actionErrorMessage('jobs', 0, 'begin_failed') === null);
  A('防御码七枚透传不折叠丢失：interviews 四码→begin_failed 原文；quiz/diag 三类→各页 create_failed 原文',
    ['interview_resume_binding_unavailable', 'legacy_resume_reference_unavailable', 'resume_version_mismatch', 'interview_not_active'].every((c) =>
      actionErrorMessage('interviews', 0, c)?.text === '启动面试失败（未预留额度）,请稍后重试;不会进入空会话。')
    && actionErrorMessage('quiz', 0, 'resume_not_found_or_not_ready')?.text === '创建押题失败,请稍后重试;若反复出现请确认额度与网络。'
    && actionErrorMessage('quiz', 0, 'quiz_resume_reference_conflict')?.text === '创建押题失败,请稍后重试;若反复出现请确认额度与网络。'
    && actionErrorMessage('diagnosis', 0, 'resume_not_found_or_not_ready')?.text === '创建诊断失败,请稍后重试;若反复出现请确认额度与网络。'
    && actionErrorMessage('diagnosis', 0, 'diagnosis_resume_reference_conflict')?.text === '创建诊断失败,请稍后重试;若反复出现请确认额度与网络。');
  A('未知码/空码/无码（非 503）→ null：四页不渲染空壳',
    pages.every((p) => actionErrorMessage(p, 0, 'totally_unknown_code') === null)
    && pages.every((p) => actionErrorMessage(p, 0, '') === null)
    && pages.every((p) => actionErrorMessage(p, 0, null) === null));
  A('status 通道只认 503：status=409/402 + 未知码 → null（不发明渲染面）',
    actionErrorMessage('interviews', 409, 'not_a_mapped_code') === null
    && actionErrorMessage('interviews', 402, 'not_a_mapped_code') === null
    && actionErrorMessage('jobs', 402, 'not_a_mapped_code') === null);

  section('ROLE-INPUT #259 表单→begin 传输：目标岗位空串不发头（静态源面断言）');
  // server action('use server' + next/navigation redirect)无法在无浏览器纯函数 proof 内行使;
  // 沿 godfn-1c S 层形制断言源面形制:trim 归一 + 真值门(空/缺省 → falsy → 不发 target-role 头=现状字节)。
  const webTestRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const readSrc = (rel: string) => {
    const p = resolve(webTestRoot, rel);
    if (!existsSync(p)) return '';
    return readFileSync(p, 'utf8');
  };
  const ivActions = readSrc('app/interviews/actions.ts');
  A('#259 action 读取 targetRole 且 trim 归一',
    /const targetRole = String\(formData\.get\('targetRole'\) \?\? ''\)\.trim\(\);/.test(ivActions));
  A('#259 begin 头基座仅 resume-id(现状字节)', /const headers: Record<string, string> = \{ 'resume-id': resumeId \};/.test(ivActions));
  A('#259 target-role 头走真值门(空串/缺省 falsy → 不发头)', /if \(targetRole\) headers\['target-role'\] = targetRole;/.test(ivActions));
  A('#259 begin 调用传 headers 变量(不再内联 resume-id 单键对象)',
    /serverFetch\('\/interview\/' \+ interviewId \+ '\/begin', \{ method: 'POST', headers \}\)/.test(ivActions));
  A('#259 表单含目标岗位可选输入(name=targetRole·maxLength=100·镜像 diagnosis 形制)',
    /<Input id="targetRole" name="targetRole" maxLength=\{100\}/.test(readSrc('app/interviews/page.tsx')));
  // ───────────────────────── SSE-RESILIENCE 批1 波A(#53/#54/#55/#56+#61 · rev2 dual_pass)新增六组证明 ─────────────────────────
  const {
    iterateSseBody, isSseOpenStatusError, SseOpenStatusError, classifySseOpenStatus,
  } = await import('../lib/stream/sse-cursor.ts');
  const { jitteredBackoff, capJitterBackoff, SSE_BACKOFF_BASE_MS, SSE_BACKOFF_CAP_MS } = await import('../lib/stream/backoff.ts');
  const { makeDraftStore, draftKeyExact, draftKeyFallback, restoreDraftIfEmpty, sessionDraftStorage } = await import('../lib/interview/draft-store.ts');
  const { ensureOk } = await import('../lib/jobs/ensure-ok.ts');
  const { redirect } = await import('next/navigation');
  const flushMicro = async (n = 25) => { for (let i = 0; i < n; i++) await Promise.resolve(); };
  /** 非 OK Response → iterateSseBody 首次 next() 应抛的错(生成器体惰性执行,首 next 才跑)。 */
  const openErr = async (status: number): Promise<unknown> => {
    try { await iterateSseBody(new Response(null, { status })).next(); return null; } catch (e) { return e; }
  };

  section('SSE-RESILIENCE 1/6(#53):断网 30s 不 degraded(新旧对照)+C1 full-jitter 钉值');
  {
    // 新旧对照:旧退避 200+400+800=1400ms≈1.4s 三连败即 degraded;新钉值 full-jitter base=500/cap=30s,连续耗尽转慢速永续。
    A('新旧对照锚:旧退避 200+400+800=1400ms(≈1.4s 即 degraded);新生产钉值 base=500ms/cap=30000ms',
      200 + 400 + 800 === 1400 && SSE_BACKOFF_BASE_MS === 500 && SSE_BACKOFF_CAP_MS === 30_000);
    A('C1 full-jitter 包络 [0,min(cap,base·factor^(n-1))] 封顶 cap;注入 rand 确定性', (() => {
      const det = jitteredBackoff(500, 2, 30_000, () => 1);
      const zero = jitteredBackoff(500, 2, 30_000, () => 0);
      const cap = capJitterBackoff(30_000, () => 1);
      return det(1) === 500 && det(2) === 1000 && det(3) === 2000 && det(7) === 30_000 && det(99) === 30_000
        && zero(1) === 0 && zero(99) === 0 && cap() === 30_000;
    })());
    // 恒抛传输错 + 虚拟时钟推进 ≥30s(确定性包络 rand=0.5;cap 档注入定值 30s):全程 reconnecting、degraded=false。
    const ac30 = new AbortController();
    let vclock = 0;
    let dropOpens = 0;
    const r30 = await runInterviewStream({
      open: () => { dropOpens++; throw new Error('net down'); },
      onView: () => {},
      signal: ac30.signal,
      backoffMs: jitteredBackoff(500, 2, 30_000, () => 0.5),
      capBackoffMs: () => 30_000,
      sleep: (ms) => { vclock += ms; if (vclock >= 30_000) ac30.abort(); return Promise.resolve(); },
    });
    A('恒抛传输错+虚拟时钟 ≥30s:全程 reconnecting、degraded=false(旧实现 ≈1.4s 已 degraded——同一时钟下 4 拍内即死)',
      r30.connection === 'reconnecting' && !r30.degraded && r30.phase === 'connecting' && vclock >= 30_000);
    A('30s 内有界推进:恰好 4 次 open(250+500+1000 + 永续cap档 30000 = 31750ms;耗尽后进入 cap 档永续,不再 degraded)',
      dropOpens === 4 && vclock === 31_750);
  }

  section('SSE-RESILIENCE 2/6(#53+注记B):online/visible→立即唤醒+重置退避;retry 同缝;监听随退出路径 dispose');
  {
    const registered: Array<{ kind: string; disposed: boolean }> = [];
    const stubSignals = {
      onOnline: (cb: () => void) => { const r = { kind: 'online', disposed: false }; registered.push(r); void cb; return () => { r.disposed = true; }; },
      onVisible: (cb: () => void) => { const r = { kind: 'visible', disposed: false }; registered.push(r); void cb; return () => { r.disposed = true; }; },
      onRetry: (cb: () => void) => { const r = { kind: 'retry', disposed: false }; registered.push(r); void cb; return () => { r.disposed = true; }; },
    };
    const triggers: Array<() => void> = [];
    const captureSignals = {
      onOnline: (cb: () => void) => { triggers.push(cb); return stubSignals.onOnline(cb); },
      onVisible: (cb: () => void) => { triggers.push(cb); return stubSignals.onVisible(cb); },
      onRetry: (cb: () => void) => { triggers.push(cb); return stubSignals.onRetry(cb); },
    };
    const pending: Array<() => void> = [];
    let mode: 'fail' | 'done' = 'fail';
    const ladderCalls: number[] = [];
    const run = runInterviewStream({
      open: () => { if (mode === 'done') return streamOf(ev(1, 'report_ready', { overall: 50 })); throw new Error('offline'); },
      onView: () => {},
      sleep: () => new Promise<void>((r) => { pending.push(r); }),
      backoffMs: (a) => { ladderCalls.push(a); return 1000; },
      capBackoffMs: () => 1000,
      maxRetries: 1,
      resumeSignals: captureSignals,
    });
    await flushMicro();
    A('传输错断流 → 进入退避等待(阶梯请求 attempt=1,每个失败恰对应 1 个待唤醒 sleep)', ladderCalls.length === 1 && ladderCalls[0] === 1 && pending.length === ladderCalls.length);
    triggers[0]();   // online → 立即重连+重置退避
    await flushMicro();
    A('online → 跳过剩余退避等待立即重连;退避重置(下一失败仍从 attempt=1 爬坡)', ladderCalls.length === 2 && ladderCalls[1] === 1 && pending.length === ladderCalls.length);
    triggers[1]();   // visible → 若在退避等待立即唤醒
    await flushMicro();
    A('visible → 剩余退避等待被跳过(立即重连,阶梯仍重置)', ladderCalls.length === 3 && ladderCalls[2] === 1 && pending.length === ladderCalls.length);
    triggers[2]();   // 手动重试(W2 去 reload 出口)→ 同一 resume 缝
    await flushMicro();
    A('retry → 同一 resume 缝(立即重连+重置退避)——面板 :489 去 reload 的驱动面', ladderCalls.length === 4 && ladderCalls[3] === 1 && pending.length === ladderCalls.length);
    mode = 'done';
    pending.splice(0).forEach((r) => r());   // 放行全部等待 → 下一连接送达终态
    const doneView = await run;
    A('resume 后驱动照常消费业务流到终态收尾;resumeSignals 监听随退出路径全部 dispose(注记B:online/visible/retry 三缝)',
      doneView.phase === 'report_ready' && doneView.connection === 'closed' && registered.length === 3 && registered.every((r) => r.disposed));
  }

  section('SSE-RESILIENCE 3/6(#55+补钉1+C10):干净 end 不计失败;超宽限入预算(禁1Hz轮询);抛错对照组绝对上限;sawTraffic 心跳重置');
  {
    let cleanOpens = 0;
    const cleanRun = await runInterviewStream({
      open: () => { cleanOpens++; return cleanOpens <= 5 ? streamOf() : streamOf(ev(1, 'report_ready', { overall: 66 })); },
      onView: () => {}, sleep: async () => {}, cleanEndReconnectMs: 0,
    });
    A('干净 end(空流,模拟 10min 轮换压缩)连打 5 轮(宽限内)不计失败,第 6 连接续到终态且不降级',
      cleanOpens === 6 && cleanRun.phase === 'report_ready' && !cleanRun.degraded);
    let errOpens = 0;
    const errRun = await runInterviewStream({
      open: () => { errOpens++; throw new Error('transport'); },
      onView: () => {}, sleep: async () => {}, maxTotalReconnects: 3, backoffMs: () => 0, capBackoffMs: () => 0,
    });
    A('对照组:抛错流仍计失败并可按绝对上限 degraded(既有语义保留,opens=4 有界)', errRun.degraded && errOpens === 4);
    let npOpens = 0;
    const npRun = await runInterviewStream({
      open: () => { npOpens++; return streamOf(); },   // 恒空流=DB 取数失败第三种 clean-end 的客户端观感
      onView: () => {}, sleep: async () => {}, maxRetries: 2, maxTotalReconnects: 8, backoffMs: () => 0, capBackoffMs: () => 0, cleanEndReconnectMs: 0,
    });
    A('补钉1:连续 >5 次无进展 clean end 重新计入失败预算走退避,绝对上限(8)处有界 degraded(禁 1Hz 永续轮询退化向量)',
      npRun.degraded && npOpens === 9);
    let hbOpens = 0;
    const hbRun = await runInterviewStream({
      open: () => { hbOpens++; return hbOpens <= 8 ? streamOf(': ping\n\n') : streamOf(ev(1, 'report_ready', { overall: 70 })); },
      onView: () => {}, sleep: async () => {}, cleanEndReconnectMs: 0,
    });
    let silentOpens = 0;
    const silentRun = await runInterviewStream({
      open: () => { silentOpens++; return silentOpens <= 11 ? streamOf() : streamOf(ev(1, 'report_ready', { overall: 70 })); },
      onView: () => {}, sleep: async () => {}, maxRetries: 2, maxTotalReconnects: 8, backoffMs: () => 0, capBackoffMs: () => 0, cleanEndReconnectMs: 0,
    });
    A('C10 sawTraffic:带心跳字节(`: ping`)的无进展流重置预算,8 轮后仍续到终态不降级(心跳盲区修复)',
      hbOpens === 9 && hbRun.phase === 'report_ready' && !hbRun.degraded);
    A('对照组:同起步的无字节空流在第 9 连接即按预算+绝对上限 degraded(心跳旗的差分对照面;终态被推到第 12 连接以暴露预算差异)',
      silentRun.degraded && silentOpens === 9 && silentRun.streamStopReason === undefined);
  }

  section('SSE-RESILIENCE 4/6(#54+注记A):draft-store 写读/跨题隔离/成功清除/换场前缀不误清/空框恢复前提/SSR 守卫');
  {
    const backing = new Map<string, string>();
    const store = makeDraftStore({
      getItem: (k) => backing.get(k) ?? null,
      setItem: (k, v) => { backing.set(k, v); },
      removeItem: (k) => { backing.delete(k); },
      get length() { return backing.size; },
      key: (i) => Array.from(backing.keys())[i] ?? null,
    });
    const k1 = draftKeyExact('r1', 'q-v1-t0-c0');
    const k2 = draftKeyExact('r1', 'q-v1-t1-c1');
    store.save(k1, '长答案草稿A');
    store.save(k2, '草稿B');
    A('写入/读取回显(纯函数+注入 stub;防抖由面板层负责)', store.load(k1) === '长答案草稿A' && store.load(k2) === '草稿B');
    A('跨题隔离:不同 questionId 键互不串扰', k1 !== k2 && store.load(k1) !== store.load(k2));
    store.save(k2, '');
    A('空白文本 save=清除(不存空草稿——提交成功/清空路径不残留)', store.load(k2) === null);
    store.save(k2, '草稿B');
    store.clear(k1);
    A('成功提交清除面:clear 精确删本键(:210 同拍;面板在 setAnswer("") 同事务语义先清草稿)', store.load(k1) === null && store.load(k2) === '草稿B');
    A('换 resultId:前缀清除只删本场(r1)全部键,不误伤他场 r2(:96 面)', (() => {
      store.save(k1, 'A');
      const other = draftKeyExact('r2', 'q-v1-t0-c0');
      store.save(other, '他场草稿');
      const rm = store.clearByPrefix('r1:');
      return rm.length === 2 && rm.includes(k1) && store.load(k1) === null && store.load(k2) === null && store.load(other) === '他场草稿';
    })());
    A('降级键形状 `${resultId}:${turns.length}`(questionId 缺失兜底;与精确键不碰撞;只写不自动恢复防跨题误复用)',
      draftKeyFallback('r1', 3) === 'r1:3' && draftKeyFallback('r1', 3) !== draftKeyExact('r1', 'q-v1-t0-c0'));
    A('注记A:恢复以「当前输入框为空」为前提——非空框不砸活内存;空框才落存储值;空/空白存储值不恢复',
      restoreDraftIfEmpty('正在打字', '旧草稿') === '正在打字'
      && restoreDraftIfEmpty('', '旧草稿') === '旧草稿'
      && restoreDraftIfEmpty('', null) === ''
      && restoreDraftIfEmpty('', '   ') === '');
    A('SSR 守卫:无 sessionStorage 环境回退内存实现,构造/读写不抛', (() => {
      try { const s = makeDraftStore(sessionDraftStorage()); s.save('x', 'y'); return s.load('x') === 'y' && s.clearByPrefix('x').length === 1; } catch { return false; }
    })());
  }

  section('SSE-RESILIENCE 5/6(#56+#61):401/429/5xx/404 分类消费+iterateSseBody 抛分类+三面板文案分臂+ensureOk 401→NEXT_REDIRECT');
  {
    A('守卫函数:isSseOpenStatusError 对实例/同名 Error 为真;对 InvalidLastEventIdError/普通错为假;classify 钉值 401/404/429/5xx/其余4xx', (() => {
      const e = new SseOpenStatusError(429);
      const shadow = Object.assign(new Error('sse_open_status_429'), { name: 'SseOpenStatusError' });
      return isSseOpenStatusError(e) && e.status === 429 && isSseOpenStatusError(shadow)
        && !isSseOpenStatusError(new InvalidLastEventIdError()) && !isSseOpenStatusError(new Error('x'))
        && classifySseOpenStatus(401) === 'auth' && classifySseOpenStatus(404) === 'not_found'
        && classifySseOpenStatus(429) === 'rate_limited' && classifySseOpenStatus(500) === 'server'
        && classifySseOpenStatus(403) === 'transport';
    })());
    A('iterateSseBody 非 OK(401/404/429/500/503)→ SseOpenStatusError(status);400 仍 InvalidLastEventIdError(既有语义零改)', await (async () => {
      for (const s of [401, 404, 429, 500, 503]) {
        const e = await openErr(s);
        if (!isSseOpenStatusError(e) || e.status !== s) return false;
      }
      return isInvalidLastEventIdError(await openErr(400));
    })());
    let authOpens = 0;
    const authRun = await runInterviewStream({
      open: () => { authOpens++; return iterateSseBody(new Response(null, { status: 401 })); },
      onView: () => {}, sleep: async () => {},
    });
    A('401 → 停转零重连(open 恰 1 次)+degraded+streamStopReason=auth(不再空流假断线;跳转由 hooks 层执行)',
      authOpens === 1 && authRun.streamStopReason === 'auth' && authRun.degraded && authRun.connection === 'closed');
    let nfOpens = 0;
    const nfRun = await runInterviewStream({
      open: () => { nfOpens++; return iterateSseBody(new Response(null, { status: 404 })); },
      onView: () => {}, sleep: async () => {},
    });
    A('404 → fail-closed degraded+not_found,不无限重连(open 恰 1 次)',
      nfOpens === 1 && nfRun.streamStopReason === 'not_found' && nfRun.degraded);
    let rlOpens = 0;
    const rlLadder: number[] = [];
    const rlCap: number[] = [];
    const rlReasons: Array<string | undefined> = [];
    const rlRun = await runInterviewStream({
      open: () => { rlOpens++; return iterateSseBody(new Response(null, { status: 429 })); },
      onView: (v) => { rlReasons.push(v.streamStopReason); },
      sleep: async () => {}, maxRetries: 0, maxTotalReconnects: 3,
      backoffMs: (a) => { rlLadder.push(a); return 0; },
      capBackoffMs: () => { rlCap.push(1); return 0; },
    });
    A('429 → rate_limited 停升级慢速重试(不走失败阶梯,走 cap 档;reconnecting 态透出原因),绝对上限 3 封顶 degraded(opens=4)',
      rlOpens === 4 && rlRun.streamStopReason === 'rate_limited' && rlRun.degraded && rlReasons.includes('rate_limited') && rlLadder.length === 0 && rlCap.length >= 3);
    let svOpens = 0;
    const svLadder: number[] = [];
    const svRun = await runInterviewStream({
      open: () => { svOpens++; return iterateSseBody(new Response(null, { status: 500 })); },
      onView: () => {}, sleep: async () => {}, maxTotalReconnects: 3,
      backoffMs: (a) => { svLadder.push(a); return 0; }, capBackoffMs: () => 0,
    });
    A('5xx → 计失败走 W1 退避(阶梯 1,2,3 爬坡),绝对上限 degraded+server',
      svOpens === 4 && svRun.streamStopReason === 'server' && svRun.degraded && svLadder.join(',') === '1,2,3');
    A('interview 文案分臂:rate_limited→连接过多+多标签提示;server→服务恢复中;干净 end→软措辞(注记C);缺省→原文案逐字', (() => {
      const rl = interviewDisplay(baseV({ connection: 'reconnecting', streamStopReason: 'rate_limited' }));
      const sv = interviewDisplay(baseV({ connection: 'reconnecting', streamStopReason: 'server' }));
      const ce = interviewDisplay(baseV({ connection: 'reconnecting', cleanEndReconnect: true }));
      const df = interviewDisplay(baseV({ connection: 'reconnecting' }));
      return rl.heading === '连接过多' && rl.message.includes('标签') && !isDeadEnd(rl)
        && sv.heading === '服务恢复中' && !isDeadEnd(sv)
        && ce.heading === '正在切换连接' && !ce.message.includes('网络中断') && !isDeadEnd(ce)
        && df.heading === '网络中断' && df.message === '正在用同一面试重连,已答内容不会丢失…';
    })());
    A('interview 停转臂:auth→登录已过期+重新登录;not_found→fail-closed;server→已暂停重连;缺省/游标→原文案逐字', (() => {
      const au = interviewDisplay(baseV({ connection: 'closed', degraded: true, streamStopReason: 'auth' }));
      const nf = interviewDisplay(baseV({ connection: 'closed', degraded: true, streamStopReason: 'not_found' }));
      const sv = interviewDisplay(baseV({ connection: 'closed', degraded: true, streamStopReason: 'server' }));
      const cu = interviewDisplay(baseV({ connection: 'closed', degraded: true, streamStopReason: 'cursor' }));
      const df = interviewDisplay(baseV({ connection: 'closed', degraded: true }));
      return au.heading === '登录已过期' && au.action.label === '重新登录' && !isDeadEnd(au)
        && nf.heading === '练习不存在或无权访问' && !isDeadEnd(nf)
        && sv.message.includes('已暂停自动重连') && !isDeadEnd(sv)
        && cu.message.includes('不会再用同一续传编号') && df.message === cu.message;
    })());
    A('quiz/diagnosis 文案分臂同构:rate_limited/server/软措辞 reconnecting + auth 停转(无死胡同不变量保持)', (() => {
      const qr = quizDisplay({ phase: 'generating', questions: [], degraded: false, connection: 'reconnecting', lastEventId: 0, streamStopReason: 'rate_limited' });
      const qs = quizDisplay({ phase: 'generating', questions: [], degraded: false, connection: 'reconnecting', lastEventId: 0, streamStopReason: 'server' });
      const qce = quizDisplay({ phase: 'generating', questions: [], degraded: false, connection: 'reconnecting', lastEventId: 0, cleanEndReconnect: true });
      const qa = quizDisplay({ phase: 'generating', questions: [], degraded: true, connection: 'closed', lastEventId: 0, streamStopReason: 'auth' });
      const dr = diagnosisDisplay({ phase: 'generating', sections: [], rewrites: [], degraded: false, connection: 'reconnecting', lastEventId: 0, streamStopReason: 'rate_limited' });
      const dce = diagnosisDisplay({ phase: 'generating', sections: [], rewrites: [], degraded: false, connection: 'reconnecting', lastEventId: 0, cleanEndReconnect: true });
      const da = diagnosisDisplay({ phase: 'generating', sections: [], rewrites: [], degraded: true, connection: 'closed', lastEventId: 0, streamStopReason: 'auth' });
      return qr.heading === '连接过多' && !isQuizDeadEnd(qr) && qs.heading === '服务恢复中' && qce.heading === '正在切换连接'
        && qa.heading === '登录已过期' && !isQuizDeadEnd(qa)
        && dr.heading === '连接过多' && dce.heading === '正在切换连接' && da.heading === '登录已过期' && !isDiagnosisDeadEnd(da);
    })());
    A('ensureOk:401 → redirect(/login?expired=1) 抛 NEXT_REDIRECT(digest 含目标路径);402 既有分支零改;409 容忍集不抛不跳;其余非 ok 仍抛 action_failed_<status>', await (async () => {
      try { ensureOk(new Response(null, { status: 401 }), 'apply', [409]); return false; } catch (e) {
        const err = e as { message?: string; digest?: string };
        if (err.message !== 'NEXT_REDIRECT' || !(err.digest ?? '').includes('/login?expired=1')) return false;
      }
      try { ensureOk(new Response(null, { status: 402 }), 'apply'); return false; } catch (e) {
        if (!((e as { digest?: string }).digest ?? '').includes('apply_credits_unavailable')) return false;
      }
      try { ensureOk(new Response(null, { status: 409 }), 'apply', [409]); } catch { return false; }
      try { ensureOk(new Response(null, { status: 500 }), 'apply'); return false; } catch (e) {
        return (e as { message?: string }).message === 'action_failed_500';
      }
    })());
  }

  section('SSE-RESILIENCE 6/6:集成回归锚——耗尽转永续后仍可恢复到终态(三驱动);绝对上限缺省文案逐字;retry 唤醒后终态收尾');
  {
    // W1② 回归钉:连续失败超过 maxRetries(缺省 3)后驱动仍活着,后续连接续到终态(旧实现第 4 拍已 degraded 死亡)。
    let pOpens = 0;
    const pRun = await runInterviewStream({
      open: (lastId) => { pOpens++; if (pOpens <= 4) throw new Error('down'); return lastId === 0 ? streamOf(ev(1, 'question_ready', { question: 'Q' })) : streamOf(ev(2, 'report_ready', { overall: 81 })); },
      onView: () => {}, sleep: async () => {}, backoffMs: () => 0, capBackoffMs: () => 0,
    });
    A('interview:耗尽(4>3)转慢速永续不降级,第 5/6 连接续到 report_ready(旧实现第 4 拍即 degraded)',
      pOpens === 6 && pRun.phase === 'report_ready' && !pRun.degraded);
    let qPins = 0;
    const qPin = await runQuizStream({
      open: () => { qPins++; return qPins <= 4 ? Promise.reject(new Error('down')) : streamOf(ev(1, 'quiz_ready', { count: 0 })); },
      onView: () => {}, sleep: async () => {}, backoffMs: () => 0, capBackoffMs: () => 0,
    });
    A('quiz 同构:耗尽转永续不降级,第 5 连接续到 ready', qPins === 5 && qPin.phase === 'ready' && !qPin.degraded);
    let dPins = 0;
    const dPin = await runDiagnosisStream({
      open: () => { dPins++; return dPins <= 4 ? Promise.reject(new Error('down')) : streamOf(ev(1, 'diagnosis_ready', { sectionCount: 0 })); },
      onView: () => {}, sleep: async () => {}, backoffMs: () => 0, capBackoffMs: () => 0,
    });
    A('diagnosis 同构:耗尽转永续不降级,第 5 连接续到 ready', dPins === 5 && dPin.phase === 'ready' && !dPin.degraded);
    let capOpens = 0;
    const capRun = await runInterviewStream({
      open: () => { capOpens++; throw new Error('x'); },
      onView: () => {}, sleep: async () => {}, backoffMs: () => 0, capBackoffMs: () => 0, maxTotalReconnects: 5,
    });
    A('绝对上限(cap 档,opens=6)degraded:从未连上(connecting)耗尽 → phase=error 终态收尾(既有语义零改)',
      capOpens === 6 && capRun.degraded && capRun.phase === 'error' && capRun.streamStopReason === undefined);
    // 绝对上限缺省文案逐字(非终态中途耗尽面):先拿到题面再断,耗尽不落在 error 终态 → 走缺省停转文案(游标同臂,既有断言锚不被本刀改写)。
    let cap2Opens = 0;
    const cap2Run = await runInterviewStream({
      open: (lastId) => { cap2Opens++; return lastId === 0 ? streamOf(ev(1, 'question_ready', { question: 'Q' })) : Promise.reject(new Error('x')); },
      onView: () => {}, sleep: async () => {}, backoffMs: () => 0, capBackoffMs: () => 0, maxTotalReconnects: 4,
    });
    const cap2Disp = interviewDisplay(cap2Run);
    A('绝对上限缺省文案逐字保留(degraded+closed+非终态+无分类 → 原文)',
      cap2Opens === 5 && cap2Run.degraded && cap2Run.connection === 'closed' && cap2Run.phase === 'question'
      && cap2Run.streamStopReason === undefined
      && cap2Disp.message === '练习连接已停止，不会再用同一续传编号自动重连。可重试本场练习或返回列表。');
  }

  section('FENCE-REFLOW F6(#243)：SSE 410 围栏 → 停转不重连直接出口（判据=status 状态基·非 body 码基）');
  A('actionErrorMessage("interviews",410,"interview_privacy_fenced") 文案逐字=「该面试已进入数据删除流程，请新建面试」（审计 §5.2-3 原文·§4-3①）',
    actionErrorMessage('interviews', 410, 'interview_privacy_fenced')?.text === '该面试已进入数据删除流程，请新建面试');
  A('410 映射命中 → 不再落 begin_failed 兜底（≠「稍后重试」家族·§4-3②）',
    actionErrorMessage('interviews', 410, 'interview_privacy_fenced')?.text !== actionErrorMessage('interviews', 410, 'begin_failed')?.text
    && actionErrorMessage('interviews', 410, 'begin_failed')?.text === actionErrorMessage('interviews', 0, 'begin_failed')?.text);
  A('410 → 抛 InterviewPrivacyFencedError；400/502/401 不走围栏通道',
    (() => {
      try { throwIfPrivacyFencedStatus(410); return false; } catch (err) {
        if (!isInterviewPrivacyFencedError(err)) return false;
      }
      throwIfPrivacyFencedStatus(400);
      throwIfPrivacyFencedStatus(502);
      throwIfPrivacyFencedStatus(401);
      return true;
    })());
  {
    // 代理 :60-69 对 410 换 body（stream_unavailable）→ 围栏判据只能 status 基（§4 标题承诺②）。
    const proxied410 = await sseProxyFailureResponse(new Response('', { status: 410 }));
    A('SSE 代理 410 原样透传且换 body（status=410·body=stream_unavailable → 判据必须 status 基）',
      proxied410.status === 410 && (await proxied410.text()) === 'stream_unavailable');
    // quiz/diagnosis 同款 iterateSseBody：410 走 SSE-RESILIENCE 既有 SseOpenStatusError 分类通道（transport→有界退避重连），
    // 绝不入围栏停转通道（#243 审计域=interview 流·他流零 FENCE 语义新增;旧基"非 OK=空结束"已被 #56 分类臂取代,行为等价面=不停转不围栏）。
    const quiz410Err = await (async () => { try { await iterateSseBody(new Response('stream_unavailable', { status: 410 })).next(); return null; } catch (e) { return e; } })();
    A('iterateSseBody（quiz/diagnosis 同款）410 → SseOpenStatusError 既有分类（transport 有界重连·不入围栏停转,他流零 FENCE 语义新增）',
      isSseOpenStatusError(quiz410Err) && quiz410Err.status === 410 && !isInterviewPrivacyFencedError(quiz410Err));
    let interview410Threw = false;
    try {
      for await (const frame of iterateInterviewSseBody(new Response('stream_unavailable', { status: 410 }))) void frame;
    } catch (err) {
      interview410Threw = isInterviewPrivacyFencedError(err);
    }
    A('iterateInterviewSseBody 410 → 抛围栏错（interview 流 fence 停转通道）', interview410Threw);
  }
  {
    const fenceOpenIds: number[] = [];
    const fencedRun = await runInterviewStream({
      open: (lastId) => { fenceOpenIds.push(lastId); throw new InterviewPrivacyFencedError(); },
      onView: () => {}, sleep: noSleep, maxRetries: 5,
    });
    const fencedDisp = interviewDisplay(fencedRun);
    A('SSE 410 围栏 → open 恰 1 次·0 次重连（重连/耗尽路径均不触达）', fenceOpenIds.length === 1);
    A('围栏出口 view：privacyFenced=true + degraded + connection=closed',
      fencedRun.privacyFenced === true && fencedRun.degraded === true && fencedRun.connection === 'closed');
    A('围栏出口一句话=「该面试已进入数据删除流程，请新建面试」（审计 §5.2-3 原文逐字）',
      fencedDisp.message === '该面试已进入数据删除流程，请新建面试');
    A('围栏出口复用 :40 degraded 出口形（不转圈+retry 出口·非死胡同）',
      fencedDisp.degraded && !fencedDisp.spinner && fencedDisp.action.kind === 'retry' && !isDeadEnd(fencedDisp));
  }

  section('FENCE-REFLOW F2(#238 C 面)：选择面契约——reused 必达页面 + 两出口可达（静态源断言+纯函数文案·沿 :793 先例）');
  {
    const actionsSrc = readFileSync(resolve(repoRoot, 'apps/web/app/interviews/actions.ts'), 'utf8');
    const pageSrc = readFileSync(resolve(repoRoot, 'apps/web/app/interviews/page.tsx'), 'utf8');
    // ① reused=true → 信号透传必达 /interviews 页；选择面仅由 ?reused 门控（reused=false 页面 byte 级不变）。
    const reusedPassthrough = lineOf(actionsSrc, /createdBody\.reused === true\) redirect\(`\/interviews\?reused=/);
    const bannerGate = lineOf(pageSrc, /\{reused && \(\(\) => \{/);
    A('F2① create reused=true → ?reused=<id> 透传回列表页（选择面必达）·页面仅 ?reused 门控',
      reusedPassthrough > 0 && bannerGate > 0);
    // ② 两出口：继续=进既有会话；放弃后重来=POST :id/abandon 后重跑 create+begin。
    const continueExit = lineOf(pageSrc, /href=\{`\/interview\/\$\{reusedId\}`\}/);
    const restartForm = lineOf(pageSrc, /action=\{restartInterviewAction\}/);
    const restartAbandon = lineOf(actionsSrc, /abandon', \{ method: 'POST' \}/);
    const restartRerun = lineOf(actionsSrc, /await startInterviewAction\(formData\)/);
    A('F2② 出口一「继续」=进既有会话（Link /interview/:id）', continueExit > 0);
    A('F2② 出口二「放弃后重来」=restartInterviewAction（abandon 后重跑 create+begin·两路径各自可达）',
      restartForm > 0 && restartAbandon > 0 && restartRerun > 0);
    // ③ 文案=BINDING_CONFLICT 家族（不新增第三文案；caption 取自 errmsg-map 映射）。
    const captionMap = actionErrorMessage('interviews', 0, 'interview_resume_binding_conflict');
    const captionUse = lineOf(pageSrc, /actionErrorMessage\('interviews', 0, 'interview_resume_binding_conflict'\)/);
    A('F2③ 选择面文案=BINDING_CONFLICT 家族「你有一场未结束的面试：继续/放弃后重来」（不新增第三文案）',
      captionMap?.text === '你有一场未结束的面试：继续/放弃后重来' && captionUse > 0);
    // ④ 无未结束面试（reused=false）→ 主链不变：create→begin 顺序与 402/401/码解析面原样（静态在位）。
    const beginCall = lineOf(actionsSrc, /serverFetch\('\/interview\/' \+ interviewId \+ '\/begin'/);
    const codeFallback = lineOf(actionsSrc, /actionErrorMessage\('interviews', 0, raw\) \? raw : 'begin_failed'/);
    const branch402 = lineOf(actionsSrc, /begin\.status === 402/);
    const branch401 = lineOf(actionsSrc, /begin\.status === 401/);
    A('F2④ reused=false 主链逐字段不变（begin 调用/402/401 分支/begin_failed 码解析兜底原样在位）',
      beginCall > 0 && branch402 > 0 && branch401 > 0 && codeFallback > 0 && beginCall > reusedPassthrough);
  }

  section('EVIDENCE-DELIVERY(S1+S2)：evidence 随事件/转写带出+报告页冒充退役（P2 四串零出现·P3 投影纯函数·无 React harness）');
  {
    // ① SSE wire（S1 出①）：带 evidence 帧解析保真；历史形状（无 evidence 键）仍解析成功（optional·断线 catch-up 重放不杀）。
    const withEvidence = toBusinessEvent({ event: 'answer_evaluated', id: 2, data: '{"score":80,"questionId":"q-v1-t0-c0","stateVersion":1,"turn":0,"answerId":"11111111-1111-4111-8111-111111111111","answerHash":"' + 'a'.repeat(64) + '","competency":"限流","evidence":["answer_quality"]}' })!;
    A('answer_evaluated 带 evidence 帧解析保真（zod 双端同刀·上限 max(6)）',
      withEvidence.event === 'answer_evaluated' && withEvidence.data.evidence?.length === 1 && withEvidence.data.evidence![0] === 'answer_quality');
    const withoutEvidence = toBusinessEvent({ event: 'answer_evaluated', id: 2, data: '{"score":80,"questionId":"q-v1-t0-c0","stateVersion":1,"turn":0}' })!;
    A('无 evidence 键的历史形状帧仍解析成功（optional 兼容·重放不杀）', withoutEvidence.event === 'answer_evaluated' && withoutEvidence.data.evidence === undefined);
    const overlong = toBusinessEvent({ event: 'answer_evaluated', id: 2, data: '{"score":80,"evidence":["a","b","c","d","e","f","g"]}' })!;
    A('evidence 超 max(6) 的帧被 schema 闸拒绝（fail-closed 非 strip）', overlong === null);

    // ② 投影纯函数（S2 出④·P3）：question=真题目文本（非维度名冒充形状）·note=evidence 判据·score null⇒undefined。
    const turns: TranscriptTurn[] = [
      { index: 0, question: '请设计一个高并发限流方案', competency: '系统设计', score: 75, evidence: ['answer_quality'] },
      { index: 1, question: '请说明 Redis 持久化机制', competency: '存储', score: null, evidence: [] },
      { index: 2, question: '旧数据回合（无 evidence 键）', competency: '遗留能力', score: null },
    ];
    const projected = projectTurnAnnotations(turns);
    A('投影 question=真题目文本（非维度名/competency 冒充形状）',
      projected[0]!.question === '请设计一个高并发限流方案' && projected[0]!.question !== turns[0]!.competency);
    A('投影 note=evidence 模型判据列表（固定串退役）', projected[0]!.note === 'answer_quality');
    A('空 evidence⇒note 不渲染（undefined·AnnotationCard note?…:null 天然隐藏·零回退文案）',
      projected[1]!.note === undefined);
    A('evidence 键缺失（旧行/未评分回合）⇒note 同样隐藏（P2 回退隐藏）', projected[2]!.note === undefined);
    A('无 ScoreCard（score=null）⇒无数值呈现（SCOR-02 分数权威纪律·无卡无数值）',
      projected[1]!.score === undefined && projected[2]!.score === undefined);
    A('有卡回合分数透传（数值权威仍=ScoreCard deterministic_total）', projected[0]!.score === 75);

    // ③ P2 四串零出现：投影渲染路径零出现 + 两退役源文件（assessment.ts 两串·page.tsx 两回退串）字面退役。
    const rendered = JSON.stringify(projected);
    const fourStrings = ['低于达标线，需加强', '达标', '该维度低于达标线(60),建议优先补强。', '该维度表现达标。'];
    A('P2 四固定串在任何渲染路径零出现（投影输出全量 JSON 不含四串）',
      fourStrings.every((s) => !rendered.includes(s)));
    const assessmentSrc = readFileSync(resolve(repoRoot, 'packages/domain/src/assessment.ts'), 'utf8');
    const reportPageSrc = readFileSync(resolve(repoRoot, 'apps/web/app/report/[id]/page.tsx'), 'utf8');
    A('assessment.ts 冒充串退役（deriveAssessment 停写·D5 冻结面归 scoring-aggregation 零触）',
      !assessmentSrc.includes('低于达标线，需加强') && lineOf(assessmentSrc, /evidence:\s*r\.score < GAP/) === -1);
    A('page.tsx 两回退串退役+维度名冒充退役（逐题点评改吃 transcript 投影）',
      !reportPageSrc.includes('该维度低于达标线(60),建议优先补强。') && !reportPageSrc.includes('该维度表现达标。')
      && lineOf(reportPageSrc, /question=\{d\.dimension\}/) === -1 && lineOf(reportPageSrc, /note=\{d\.evidence/) === -1);
    A('page.tsx 薄消费在位（projectTurnAnnotations import+调用·P3 形态钉死）',
      lineOf(reportPageSrc, /projectTurnAnnotations/) > 0 && lineOf(reportPageSrc, /from '@\/lib\/report\/turn-annotations'/) > 0);
  }

  section('G3 #260 简历下拉可用性过滤：isEligibleResume 六态表 + 空态三臂（纯函数级·R3 落槽写死）');
  {
    const r = (id: string, status: string) => ({ id, status, display_name: `简历 ${id}` });
    // 六态逐态：唯一可用=ingested（服务端 begin/bind 同语义；Ban 第二谓词）。
    for (const s of ['uploaded', 'ingesting', 'ingested', 'failed', 'erasure_fenced', 'erased']) {
      A(`isEligibleResume 六态 ${s} → ${s === 'ingested'}`, isEligibleResume(r(`id-${s}`, s)) === (s === 'ingested'));
    }
    // RSC 组合面纯函数级：混合列表过滤后仅含 ingested、默认值=首 ingested id（§4.1）。
    const mixed = [r('a-failed', 'failed'), r('b-ingested', 'ingested'), r('c-fenced', 'erasure_fenced'), r('d-ingested', 'ingested')];
    const eligible = mixed.filter(isEligibleResume);
    A('混合列表过滤后仅含 ingested 且默认值=首 ingested id',
      eligible.length === 2 && eligible[0].id === 'b-ingested' && eligible[0].id === mixed.filter(isEligibleResume)[0]!.id);
    // 空态三臂（三页同一纯函数单源）。
    const emptyNone = resumeEmptyState([]);
    A('空态三臂① resumes=0 →「还没有简历」逐字不变（既有文案零字污染）',
      emptyNone !== null && emptyNone.text === '还没有简历。' && emptyNone.linkHref === '/resume' && emptyNone.linkText === '先去上传简历 →');
    const emptyStuck = resumeEmptyState([r('a', 'failed'), r('b', 'erasure_fenced'), r('c', 'ingesting')]);
    A('空态三臂② resumes>0 且可用=0 → 新「暂不可用」臂（只述状态不解释围栏细节·带 /resume 链）',
      emptyStuck !== null
      && emptyStuck.text === '简历暂不可用（解析中/失败/删除处理中），先去简历页处理。'
      && emptyStuck.linkHref === '/resume');
    A('空态三臂③ ingested≥1 → null（表单照旧）', resumeEmptyState([r('a', 'ingested'), r('b', 'failed')]) === null);
    // 页面组合层（RSC 数据面/表单门/下拉渲染）= proof 盲区 → 缺口登记 coverage-matrix（nail 时）；
    // 此处仅静态源锚（沿 F2 :1237 先例）：三页过滤面/门/默认值全切 eligible，零 resumes 全量渲染残留。
    const interviewsSrc = readFileSync(resolve(repoRoot, 'apps/web/app/interviews/page.tsx'), 'utf8');
    const quizSrc = readFileSync(resolve(repoRoot, 'apps/web/app/quiz/page.tsx'), 'utf8');
    const diagnosisSrc = readFileSync(resolve(repoRoot, 'apps/web/app/diagnosis/page.tsx'), 'utf8');
    const eligibleLine = (src: string) => lineOf(src, /const eligibleResumes = resumes\.filter\(isEligibleResume\)/) > 0;
    A('三页同源过滤在位（静态源锚）且零 resumes 全量下拉/全量默认值残留',
      eligibleLine(interviewsSrc) && eligibleLine(quizSrc) && eligibleLine(diagnosisSrc)
      && (interviewsSrc.match(/eligibleResumes\.map/g) ?? []).length === 2
      && !/resumes\.map\(/.test(interviewsSrc) && !/resumes\.map\(/.test(quizSrc) && !/resumes\.map\(/.test(diagnosisSrc)
      && !/defaultValue=\{resumes\[0\]/.test(interviewsSrc) && !/defaultValue=\{resumes\[0\]/.test(quizSrc) && !/defaultValue=\{resumes\[0\]/.test(diagnosisSrc));
    A('interviews 重来表单门切 eligible 面（静态源锚）', lineOf(interviewsSrc, /\{eligibleResumes\.length > 0 && \(/) > 0);
  }

  section('G3 #261 余额行：entitlement 三形状 {3}/{0}/null（纯函数级·降级零伪读数）');
  {
    // 形状① {availableUnits:3} → 「余额 3 · 本次消耗 1 次额度」+预览注记、无不足提示。
    const v3 = entitlementLineView(parseEntitlement({ availableUnits: 3 }));
    A('entitlement {availableUnits:3} → 余额行逐字+预览口径注记+无不足提示',
      parseEntitlement({ availableUnits: 3 }) === 3
      && v3?.balanceLine === '余额 3 · 本次消耗 1 次额度'
      && v3.previewNote === '预览环境额度仅展示，不构成购买'
      && v3.insufficientHint === null);
    // 形状② {availableUnits:0} → 中性不足提示（不拦提交、不给购买入口、不恐吓——服务端 402 才是权威）。
    const v0 = entitlementLineView(parseEntitlement({ availableUnits: 0 }));
    A('entitlement {availableUnits:0} → 「余额 0」行+中性不足提示',
      v0?.balanceLine === '余额 0 · 本次消耗 1 次额度' && v0?.insufficientHint === '余额不足，开始将无法预留');
    // 形状③ null/形状漂移 → 整行不渲染（降级零假数，禁「余额 —」类伪读数）。
    A('entitlement null/网络失败/形状漂移/非整数 → 整行不渲染（null）',
      entitlementLineView(null) === null
      && parseEntitlement(null) === null
      && parseEntitlement({ foo: 1 }) === null
      && parseEntitlement({ availableUnits: 2.5 }) === null
      && parseEntitlement({ availableUnits: '3' }) === null);
    // 静态源锚：RSC 消费在位（serverGet 形沿 :38 同鉴权；testid 行挂开始按钮前）。
    const interviewsSrc = readFileSync(resolve(repoRoot, 'apps/web/app/interviews/page.tsx'), 'utf8');
    A('interviews RSC 消费 /commerce/entitlement + 余额行挂载（静态源锚）',
      lineOf(interviewsSrc, /parseEntitlement\(await serverGet<unknown>\('\/commerce\/entitlement'\)\)/) > 0
      && lineOf(interviewsSrc, /data-testid="entitlement-line"/) > 0
      && lineOf(interviewsSrc, /entitlementLineView\(availableUnits\)/) > 0);
  }

  section('G3 #161 connecting 真进度：三臂（有帧拼文案/进题清除/零帧逐字兜底）+ isDeadEnd 零违例');
  {
    // 臂1：connecting 期 generation_progress 帧（retrieve/已 3 秒）→ 静态文案拼真实进度（沿 answered 臂同形）。
    const progressFrame = toBusinessEvent({ event: 'generation_progress', id: 1, data: JSON.stringify({ attemptKey: 'e2e-progress', stage: 'retrieve', elapsedMs: 3000 }) })!;
    const withProgress = interviewDisplay(reduceInterview([progressFrame]));
    A('臂1 connecting 期进度帧 → 「正在建立连接…（AI 生成中 · 检索素材 · 已 3 秒）」',
      withProgress.message === '正在建立连接…（AI 生成中 · 检索素材 · 已 3 秒）');
    A('臂1 isDeadEnd 零违例（spinner+非空 message+取消出口）', !isDeadEnd(withProgress) && withProgress.spinner && withProgress.action.kind === 'reconnecting');
    // 臂2：question_ready 到达 → 进度态清除+题面渲染（业务事件清除红线，进度帧不改 phase）。
    const questionFrame = toBusinessEvent({ event: 'question_ready', id: 2, data: JSON.stringify({ question: 'Q1', questionId: 'q-v2-t0-c0', stateVersion: 2, turn: 0, plannedTurns: 5 }) })!;
    const afterQuestion = reduceInterview([progressFrame, questionFrame]);
    A('臂2 question_ready 到达 → 进度清除+phase=question（进度帧不改 phase 红线）',
      afterQuestion.phase === 'question' && afterQuestion.generationProgress === undefined && afterQuestion.plannedTurns === 5);
    // 臂3：零进度帧 → 静态文案逐字兜底（不空转不编造）。
    const silent = interviewDisplay(initialView);
    A('臂3 零进度帧 → 「正在建立连接…」逐字+isDeadEnd 零违例',
      silent.message === '正在建立连接…' && !isDeadEnd(silent));
    // 降级细臂：未知段名/无数值不崩、缺 elapsedMs 无时长尾。
    const bareFrame = toBusinessEvent({ event: 'generation_progress', id: 3, data: JSON.stringify({ attemptKey: 'k' }) })!;
    A('connecting 缺数值帧 → 只有「AI 生成中」段头（无编造时长）',
      interviewDisplay(reduceInterview([bareFrame])).message === '正在建立连接…（AI 生成中）');
  }

  section('G3 #256 进度徽标（形制 A）：N 派生（1 基勘误口径·微漂⑥）+ M 约数可调 + 缺失降级');
  {
    const idv = (turn: number) => ({ questionId: `q-v2-t${turn}-c0`, stateVersion: 2, turn });
    // §4.4 示例（勘误口径：服务端 turn 0 基→显示 1 基，微漂⑥全录）：turn=2+plannedTurns=5 → 第 3 题 / 预计约 5 题。
    A('turn=2+plannedTurns=5 → 「第 3 题 / 预计约 5 题」勘误口径（0 基 turn→1 基显示·微漂⑥）',
      interviewProgressBadge({ questionIdentity: idv(2), turns: [], plannedTurns: 5 })?.label === '第 3 题 / 预计约 5 题（自适应，可能调整）');
    A('首题 turn=0 → 「第 1 题」（防 0 基漏显「第 0 题」）',
      interviewProgressBadge({ questionIdentity: idv(0), turns: [], plannedTurns: 5 })?.label === '第 1 题 / 预计约 5 题（自适应，可能调整）');
    // identity 缺失（旧流）→ 降级 turns.length（本身 1 基）。
    A('identity 缺失 → 降级 turns.length（3 题 → 第 3 题，与 identity 臂同口径）',
      interviewProgressBadge({ questionIdentity: undefined, turns: [{ q: 'a', followUp: false }, { q: 'b', followUp: false }, { q: 'c', followUp: false }], plannedTurns: undefined })?.label === '第 3 题');
    // plannedTurns 缺失/非法 → 只显「第 N 题」。
    A('plannedTurns 缺失 → 只显「第 N 题」',
      interviewProgressBadge({ questionIdentity: idv(0), turns: [], plannedTurns: undefined })?.label === '第 1 题'
      && interviewProgressBadge({ questionIdentity: idv(0), turns: [], plannedTurns: undefined })?.planned === null);
    A('plannedTurns 非法（0/负/非整数）→ 同降级（只显第 N 题）',
      [0, -2, 2.5].every((m) => interviewProgressBadge({ questionIdentity: idv(0), turns: [], plannedTurns: m })?.planned === null));
    // 追问不增 N 口径：N 只由 identity.turn（或 turns.length）派生，绝不数 followUp 旗。
    const probeHist = (followUp: boolean) => [{ q: 'a', followUp }, { q: 'b', followUp }];
    A('追问（followUp）不增 N：同 identity.turn、追问旗不同 → 同一 N',
      interviewProgressBadge({ questionIdentity: idv(3), turns: probeHist(true), plannedTurns: 8 })?.current === 4
      && interviewProgressBadge({ questionIdentity: idv(3), turns: probeHist(false), plannedTurns: 8 })?.current === 4);
    // 无任何题 → 不渲染（防「第 0 题」幻影）。
    A('空视图（无 identity/零轮）→ null 不渲染', interviewProgressBadge(initialView) === null);
    // 旧流 question_ready 缺 plannedTurns 字段零破坏：schema 宽容+投影 undefined。
    const legacyQ = toBusinessEvent({ event: 'question_ready', id: 4, data: JSON.stringify({ question: '旧流题' }) })!;
    const legacyView = reduceInterview([legacyQ]);
    A('旧流缺 plannedTurns → schema 零破坏+投影 undefined（显示面降级）',
      legacyView.phase === 'question' && legacyView.plannedTurns === undefined);
  }

  section('G4 #59 提交失败分码映射：turnSubmitFeedback 纯函数输出断言（形制 A·mock res 仅输入叙述）+ 组件源码静态接线（read-file 四件）');
  {
    // ── 纯函数输出断言（REQUEST rev2 §4.2 洞A·形制 A 本意——不做组件端到端 mock 执行）──
    A('401/unauthorized → 「登录已过期，请重新登录」+action=login（组件跳 /login?expired=1·沿 server.ts:30 同参形）',
      turnSubmitFeedback(401, 'unauthorized').text === '登录已过期，请重新登录'
      && turnSubmitFeedback(401, 'unauthorized').action === 'login');
    A('409/interview_not_active → 「该面试已结束」+action=back_to_interviews（回列表出路）',
      turnSubmitFeedback(409, 'interview_not_active').text === '该面试已结束'
      && turnSubmitFeedback(409, 'interview_not_active').action === 'back_to_interviews');
    A('409/interview_answer_submission_conflict → 中性防重文案+无导航（作答保留、既有回滚行为零改）',
      turnSubmitFeedback(409, 'interview_answer_submission_conflict').text === '该作答已提交，请勿重复提交'
      && turnSubmitFeedback(409, 'interview_answer_submission_conflict').action === undefined);
    A('410/interview_privacy_fenced → #243 文案常量同一性（import 单源：proof 与实现引同一常量）+action=back_to_interviews',
      turnSubmitFeedback(410, 'interview_privacy_fenced').text === INTERVIEW_PRIVACY_FENCED_TEXT
      && INTERVIEW_PRIVACY_FENCED_TEXT === '该面试已进入数据删除流程，请新建面试'
      && turnSubmitFeedback(410, 'interview_privacy_fenced').action === 'back_to_interviews');
    A('503（码通道 public_preview_read_only/status 通道含无码/未知码）→ 与 actionErrorMessage 503 行同文「服务暂不可用」',
      turnSubmitFeedback(503, 'public_preview_read_only').text === '服务暂不可用'
      && turnSubmitFeedback(503, null).text === actionErrorMessage('interviews', 503, null)?.text
      && turnSubmitFeedback(503, 'some_future_code').text === '服务暂不可用');
    A('未知码/无码/空串码 → 既有兜底逐字「提交失败,请重试」+无 action（原文一字不改）',
      turnSubmitFeedback(400, 'missing_idempotency_key').text === '提交失败,请重试'
      && turnSubmitFeedback(400, 'missing_idempotency_key').action === undefined
      && turnSubmitFeedback(500, null).text === '提交失败,请重试' && turnSubmitFeedback(500, null).action === undefined
      && turnSubmitFeedback(403, '').text === '提交失败,请重试' && turnSubmitFeedback(403, '').action === undefined
      && turnSubmitFeedback(402, 'insufficient_entitlement').text === '提交失败,请重试');
    // ── 组件源码静态接线四件（rev2 洞A·沿 :863 readSrc read-file 先例）──
    const panelSrc = readSrc('components/InterviewPanel.tsx');
    A('静态接线①:提交失败臂接线 turnSubmitFeedback（判定在纯函数·执行在组件:toast+login/back 薄执行）',
      /const fb = turnSubmitFeedback\(res\.status, typeof j\?\.error === 'string' \? j\.error : null\);/.test(panelSrc)
      && /toast\.error\(fb\.text\);/.test(panelSrc)
      && /if \(fb\.action === 'login'\) router\.push\('\/login\?expired=1'\);/.test(panelSrc)
      && /router\.push\('\/interviews'\)/.test(panelSrc));
    A('静态接线②:j?.message 全文件零残留（提交臂+voice 臂双撤·Ban 裸透传）', !panelSrc.includes('j?.message'));
    A('静态接线③:失败臂回滚三行形仍在（回滚回显+clearSubmitBridge+return·作答保留零回归）',
      /toast\.error\(fb\.text\);[\s\S]*?setAnswers\(\(m\) => \{ const n = \{ \.\.\.m \}; delete n\[lastIdx\]; return n; \}\);\s*\/\/ 回滚回显\s*[\r\n]\s*clearSubmitBridge\(\);\s*\/\/ 回到作答态,保留输入框内容\s*[\r\n]\s*return;/.test(panelSrc));
    A('静态接线④:网络层 catch 文案逐字零改「提交未成功，请重试」', panelSrc.includes("toast.error('提交未成功，请重试');"));
    A('记账:组件行为面无 DOM 载体·静态+人工对账（上四件为源面接线断言,非浏览器 DOM 证明）', true);
  }

  // ══ B271 片3（entpay-slice3-REQUEST rev2 §4·RX-1/RX-2 载体·read-file 静态断言·est live=0）══════════
  {
    section('B271 片3 §4-1 修法③链既有复验+新增 read-file（RX-2：既有面=entpay:s2 28/28+上 ERRMSG-MAP 段复跑·以下两件=本刀新增断言）');
    const startErrSrc = readSrc('lib/jobs/application-start-error.ts');
    A('片3-1a 注册表分码文案逐字（application-start-error.ts :21-23·application_enterprise_pay_unavailable→稳定拒因）',
      startErrSrc.includes("application_enterprise_pay_unavailable: '该岗位面试暂不可用，请联系招聘方'"));
    const jobsPageSrc = readSrc('app/jobs/page.tsx');
    A('片3-1b jobs 页 402 渲染块静态接线（page.tsx :60-72 区·actionErrorMessage(\'jobs\',0,error)+role=alert·既有零改面）',
      /const actionError = actionErrorMessage\('jobs', 0, error \?\? null\);/.test(jobsPageSrc)
      && /role="alert"/.test(jobsPageSrc)
      && /actionError\.text/.test(jobsPageSrc));

    section('B271 片3 §4-2 P1-a 修法⑥字面+P1-b 招聘方卡（RX-1：文案与裁定⑤定稿逐字绑定+卡区既有四行零字节锚）');
    A('片3-2a 修法⑥知情行逐字在 /jobs 渲染面（「本场由企业支付，不消耗你的额度」·startable 婉拒按钮邻位）',
      jobsPageSrc.includes('本场由企业支付，不消耗你的额度')
      && jobsPageSrc.indexOf('declineApplicationAction.bind(null, app.id)') < jobsPageSrc.indexOf('本场由企业支付，不消耗你的额度'));
    const appCardSrc = readSrc('app/recruiter/jobs/[id]/applications/[applicationId]/page.tsx');
    A('片3-2b P1-b 知情行逐字（「候选人开始本场面试由贵司企业额度支付；额度不足时候选人将无法开始」）',
      appCardSrc.includes('候选人开始本场面试由贵司企业额度支付；额度不足时候选人将无法开始'));
    A('片3-2c P1-b 充值链接逐字绑定（「企业额度不足，请充值」→ href /recruiter/billing·目标面已存在）',
      appCardSrc.includes('企业额度不足，请充值')
      && /href="\/recruiter\/billing"[^>]*>企业额度不足，请充值<\/Link>/.test(appCardSrc));
    A('片3-2d 卡区既有 dl 四行零字节锚（候选人/来源/状态/评估·P1 改动不触既有面）',
      ['候选人', '来源', '状态', '评估'].every((label) => appCardSrc.includes(`<dt className="text-muted-foreground">${label}</dt>`)));

    section('B271 片3 §4-4 P3 余额挂件（裁定②形 A·零参调用读并列值·读时快照非实时承诺）');
    const billingSrc = readSrc('app/recruiter/billing/page.tsx');
    A('片3-3a 挂件零参调用读并列 enterpriseAvailableUnits（一次调用双算·响应只增）',
      billingSrc.includes("serverGet<{ availableUnits: number; enterpriseAvailableUnits: number }>('/commerce/entitlement')")
      && billingSrc.includes('enterpriseAvailableUnits'));
    A('片3-3b 挂件语境行（「候选人岗位面试由企业额度支付」+快照非实时注记·首屏套餐卡之上）',
      billingSrc.includes('候选人岗位面试由企业额度支付（读时快照，非实时余额承诺）。')
      && billingSrc.indexOf('<BalanceSection /></Suspense>') < billingSrc.indexOf('<ProductsSection /></Suspense>'));

    section('B271 片3 §4-5 P4 开票 paid 下拉（裁定③：禁用不保留手填·仅 paid 行）');
    const formsSrc = readSrc('app/recruiter/billing/RechargeForms.tsx');
    A('片3-4a 手填 Input 零残留（<Input id="inv-order" 撤除·orderId 只落 select）',
      !formsSrc.includes('<Input id="inv-order"') && /<select[^>]*name="orderId"/.test(formsSrc));
    A('片3-4b 空表回退=下拉禁用+「暂无已支付订单」逐字（不保留手填口）',
      /disabled=\{orders\.length === 0\}/.test(formsSrc) && formsSrc.includes('暂无已支付订单'));
    A('片3-4c 数据源仅 paid（billing 页 filter status===\'paid\'·>50 窗外老 paid 单不可选=如实边界）',
      /paidOrders = ordersRes\?\.orders\?\.filter\(\(o\) => o\.status === 'paid'\)/.test(billingSrc));
    A('片3-4d submitInvoiceRequestAction 既有 409/403 面零改（actions.ts·DB 仅-paid 触发器双层承）',
      /if \(res\.status === 409\) return \{ ok: false, error: '仅已支付订单可申请开票（或该订单已申请过）。' \};/.test(readSrc('app/billing/actions.ts'))
      && readSrc('app/billing/actions.ts').includes("if (res.status === 403) return { ok: false, error: '开票申请需审核通过的招聘方账户。' };"));

    section('B271 片3 §4-3 web 面 P2 对公订单卡（只读无操作口·三态徽标）');
    A('片3-5a offline-orders 只读卡在位（零参 serverGet·本人台账）',
      billingSrc.includes("serverGet<{ orders: OfflineOrder[] }>('/commerce/offline-orders')"));
    A('片3-5b 三态徽标（remit_status NULL=created→entered→confirmed·failed=destructive·无操作口）',
      billingSrc.includes('remitBadge[o.remit_status ?? \'created\']')
      && billingSrc.includes("failed: { text: 'failed', variant: 'destructive' }")
      && !/OfflineOrdersSection[\s\S]*?(SubmitButton|<form action=)/.test(billingSrc));
  }

  // ───────── H4 WEAKNESS-LOOP（R1/R4/R8·复审处方①② read-file 静态接线·沿 :1307-1313 先例形制） ─────────
  section('H4 处方①:报告页「再练这 N 个弱项」入口+action 携 focus(read-file 静态接线)');
  {
    const reportPageSrc = readFileSync(resolve(repoRoot, 'apps/web/app/report/[id]/page.tsx'), 'utf8');
    const interviewsActionsSrc = readFileSync(resolve(repoRoot, 'apps/web/app/interviews/actions.ts'), 'utf8');
    A('H4-1a 报告页 src 含再练入口(「再练这 {gapCount} 个弱项」·N=本场 gap 数运行时派生非硬编码)',
      reportPageSrc.includes('再练这 {gapCount} 个弱项')
      && lineOf(reportPageSrc, /const gapDims = dims\.filter/) > 0
      && lineOf(reportPageSrc, /const gapCount = gapDims\.length/) > 0);
    A('H4-1b 报告页接 startFocusRetrainAction(走既有 create+begin 链·零新导航模式)',
      lineOf(reportPageSrc, /import \{ startFocusRetrainAction \} from '\.\.\/\.\.\/interviews\/actions'/) > 0);
    A('H4-1c action 携 focus(begin headers focus=JSON 数组文本·api 侧 normalizeFocusHeader 白名单消费)',
      lineOf(interviewsActionsSrc, /export async function startFocusRetrainAction\(/) > 0
      && lineOf(interviewsActionsSrc, /focus: JSON\.stringify\(labels\)/) > 0);
    A('H4-1d 表单 hidden focus=gap 维度名数组(上限=本 gap 数)',
      lineOf(reportPageSrc, /name="focus" value=\{JSON\.stringify\(gapDims\.map\(\(d\) => d\.dimension\)\)\}/) > 0);
  }

  section('H4 处方②:LearningSection 静态图标→「去练」真入口(携 topic=focus)');
  {
    const reportPageSrc = readFileSync(resolve(repoRoot, 'apps/web/app/report/[id]/page.tsx'), 'utf8');
    A('H4-2a 学习项「去练」按钮在位(未完成项渲染)', reportPageSrc.includes('去练') && lineOf(reportPageSrc, /!\w+\.done && resumeId \? \(/) > 0);
    A('H4-2b 去练表单携 topic=focus(单项数组·复用同一 action)',
      lineOf(reportPageSrc, /name="focus" value=\{JSON\.stringify\(\[it\.topic\]\)\}/) > 0);
  }

  section('H4 R8:成长曲线可比性(维度名交集约束+delta 可比标注·#269+新-#277 实现面锚)');
  {
    const growthSrc = readFileSync(resolve(repoRoot, 'apps/web/app/growth/page.tsx'), 'utf8');
    // 纯函数矩阵:交集非空+双分→可比;交集空→不可比;缺分→不可比。
    A('H4-8a 可比:双分+维度交集非空 → delta 数值',
      growthDeltaView({ overall: 70, dims: { 高并发: 60 } }, { overall: 80, dims: { 高并发: 75, 算法: 50 } }).comparable === true
      && (growthDeltaView({ overall: 70, dims: { 高并发: 60 } }, { overall: 80, dims: { 高并发: 75, 算法: 50 } }) as { delta: number }).delta === 10);
    A('H4-8b 不可比:双分但维度名交集空 → comparable=false(delta 不渲染)',
      growthDeltaComparable({ overall: 70, dims: { 高并发: 60 } }, { overall: 80, dims: { 算法: 50 } }) === false);
    A('H4-8c 缺分不可比(null overall 恒不可比·与现状零 delta 一致)',
      growthDeltaComparable({ overall: null, dims: { 高并发: 60 } }, { overall: 80, dims: { 高并发: 75 } }) === false);
    A('H4-8d 页面接 growthDeltaView+不可比中性标注(data-testid=delta-not-comparable)',
      lineOf(growthSrc, /import \{ growthDeltaView \} from '@\/lib\/growth\/comparable'/) > 0
      && growthSrc.includes('delta-not-comparable') && growthSrc.includes('维度口径不同 · 不可比'));
  // ══ I2 B-DELIVERABLE（i2-b-deliverable-REQUEST §4-3·两态徽/startable 收窄/同意触面/定性区·纯函数+read-file 静态·est live=0）══
  {
    section('I2 B-DELIVERABLE §4-3：W1 两态徽+startable 收窄+拒因并列+W3 同意触面+W2 定性区（纯函数输出+read-file 静态·组件行为面无 DOM 载体如实记账）');
    // 纯函数：两态徽（E3 派生口径）+ 招聘方评估列三态（裁定⑤文案逐字）。
    A('I2-1a held 徽（绑定面试 completed）→「已面完 · 待校准」outline（neutral·destructive 转 neutral）',
      applicationStatusLabel('assessment_unavailable', 'held').text === '已面完 · 待校准'
        && applicationStatusLabel('assessment_unavailable', 'held').variant === 'outline');
    A('I2-1b failed 徽（绑定面试 failed）→「面试失败 · 可重试」destructive',
      applicationStatusLabel('assessment_unavailable', 'failed').text === '面试失败 · 可重试'
        && applicationStatusLabel('assessment_unavailable', 'failed').variant === 'destructive');
    A('I2-1c 无派生信号 fail-closed →「评分暂不可用」（不臆测终态·不承诺可重试）',
      applicationStatusLabel('assessment_unavailable', null).text === '评分暂不可用'
        && applicationStatusLabel('assessment_unavailable').text === '评分暂不可用');
    A('I2-1d 招聘方评估列三态（held/failed/无派生·recruiterAssessmentLabel 扩参向后兼容）',
      recruiterAssessmentLabel('assessment_unavailable', null, 'held') === '已面完 · 评分待校准'
        && recruiterAssessmentLabel('assessment_unavailable', 68, 'failed') === '面试失败 · 可重试'
        && recruiterAssessmentLabel('assessment_unavailable', 68) === '评分暂不可用');
    // jobs 页：startable 收窄 + held 注记 + W3③ 同意触面接线（read-file 静态）。
    const jobsSrcI2 = readSrc('app/jobs/page.tsx');
    A('I2-2a startable 收窄（修法④）：assessment_unavailable 仅 terminalKind===\'failed\' 可重试·旧无条件入口撤除',
      /app\.status === 'assessment_unavailable' && app\.terminalKind === 'failed'/.test(jobsSrcI2)
        && !jobsSrcI2.includes("|| app.status === 'assessment_unavailable';"));
    A('I2-2b held 中性注记逐字（W3①·非时间承诺）',
      jobsSrcI2.includes('本场面试已完成；评分校准完成后与结果一起提供，不提供重试。'));
    A('I2-2c W3③ 同意触面接线（consent/withdraw 双 action 绑定在 isHeld 行区·per-user consent 态读取）',
      jobsSrcI2.includes('consentQualitativeShareAction') && jobsSrcI2.includes('withdrawQualitativeShareAction')
        && /serverGet<\{ consented: boolean \}>\('\/privacy\/consent\?purpose=b_qualitative_share'\)/.test(jobsSrcI2));
    A('I2-2d 同意触面现场语境文案逐字（「招聘方将看到什么」）',
      jobsSrcI2.includes('同意后招聘方仅可见能力维度与强/中/弱/证据不足档位，不含数字评分、答题内容与证据摘录原文；可随时撤回，撤回后立即停止展示。'));
    A('I2-2e 修法⑥ 知情行仍随 startable 块收敛（W3② 渲染条件核对·零语义改动）',
      jobsSrcI2.includes('本场由企业支付，不消耗你的额度'));
    // actions：同意/撤回走 #82 既有三入口（POST body + DELETE query·purpose=b_qualitative_share）。
    const jobsActionsSrc = readSrc('app/jobs/actions.ts');
    A('I2-2f 同意触面 API 形（POST /privacy/consent {purpose} + DELETE /privacy/consent?purpose·零新协议）',
      /body: JSON\.stringify\(\{ purpose: 'b_qualitative_share' \}\)/.test(jobsActionsSrc)
        && jobsActionsSrc.includes("serverFetch('/privacy/consent?purpose=b_qualitative_share', { method: 'DELETE' })"));
    // 拒因并列表（裁定⑥·既有四行零改）。
    const startErrSrcI2 = readSrc('lib/jobs/application-start-error.ts');
    A('I2-2g 新拒因 application_held_not_retryable 并列 subclasses（既有四行零改·409 服务侧守卫面）',
      startErrSrcI2.includes("'application_held_not_retryable',")
        && startErrSrcI2.indexOf("'application_held_not_retryable',") > startErrSrcI2.indexOf("'application_start_unexpected',"));
    // 招聘方两页：列表行零触（interview RLS 隔离墙 by-design——候选人面试元数据对招聘方会话
    // 不可读，列表行 join 派生不可达·i2b:prove attempt3 实证全 null）→ 列表恒既有兜底文案；
    // 两态信号经详情页 0160 受控函数 terminalKind 承接（裁定③落点 A 的详情页半区全兑）。
    const candListSrc = readSrc('app/recruiter/jobs/[id]/page.tsx');
    A('I2-3a 列表行零触（隔离墙 by-design·原 applicationStatusLabel(c.status)/recruiterAssessmentLabel(c.status,c.score) 逐字节零改·fail-closed 不臆测终态）',
      /applicationStatusLabel\(c\.status\)/.test(candListSrc)
        && /recruiterAssessmentLabel\(c\.status, c\.score\)/.test(candListSrc)
        && !candListSrc.includes('terminalKind'));
    const detailSrc = readSrc('app/recruiter/jobs/[id]/applications/[applicationId]/page.tsx');
    A('I2-3b 定性区端点消费（仅 assessment_unavailable 读取·契约 zod safeParse·失败中性）',
      /serverGet<unknown>\(`\/recruiter\/jobs\/\$\{id\}\/applications\/\$\{applicationId\}\/qualitative`\)/.test(detailSrc)
        && /BQualitativeProjection\.safeParse\(qualRes\)/.test(detailSrc));
    A('I2-3b2 两态信号经 0160 函数承接（terminalKind = 候选列表缺位回落 qual.terminalKind·状态徽/评估行/免责卡同源分流）',
      /const terminalKind = application\.terminalKind \?\? qual\?\.terminalKind \?\? null;/.test(detailSrc)
        && /applicationStatusLabel\(application\.status, terminalKind\)/.test(detailSrc)
        && /recruiterAssessmentLabel\(application\.status, undefined, terminalKind\)/.test(detailSrc)
        && detailSrc.includes('{terminalKind === \'held\''));
    A('I2-3c 定性区三态如实（未同意/暂无可复核的评估记录/档位徽·Ban 假定性输出）',
      detailSrc.includes('候选人未同意披露能力概要。候选人同意后，这里显示能力维度与强/中/弱/证据不足档位。')
        && detailSrc.includes('暂无可复核的评估记录。')
        && detailSrc.includes('能力概要暂不可用，请稍后重试。'));
    A('I2-3d 档位徽表（rubric disposition 三值映射 Ban 自造档位·强/中/弱/证据不足·不出数字）',
      detailSrc.includes("strong: { text: '强', variant: 'success' }")
        && detailSrc.includes("mid: { text: '中', variant: 'secondary' }")
        && detailSrc.includes("weak: { text: '弱', variant: 'outline' }")
        && detailSrc.includes("insufficient: { text: '证据不足', variant: 'outline' }"));
    A('I2-3e 排序红线注记（fix-roadmap:117 承接·Ban 排序比较叙事在页面）',
      detailSrc.includes('单申请人评估事实投影：不可用于候选人之间排序比较，不含数字评分、答题内容与证据摘录原文。'));
    A('I2-3f 免责卡两态分流+主句零改（W3④·held=待校准语义/failed=失败语义/主句「证据不够就不给分」零字节）',
      detailSrc.includes('「已面完 · 待校准」表示这场面试已完成、还没有可比较的校准分')
        && detailSrc.includes('「面试失败」表示这场面试因系统原因未完成评估；候选人可重试，已预留的额度已释放。')
        && detailSrc.includes('校准完成前，申请分数不会出现在这里。证据不够就不给分，也不会用 0 分凑数。'));
    A('I2-3g B 端定性页面零计数渲染（Ban 数字分列：页面源零 strong_count/mid_count/weak_count/insufficient_count）',
      !detailSrc.includes('strong_count') && !detailSrc.includes('mid_count')
        && !detailSrc.includes('weak_count') && !detailSrc.includes('insufficient_count'));
    A('记账:组件行为面无 DOM 载体·静态+人工对账（I2-2/I2-3 为源面接线断言·纯函数断言为 I2-1·非浏览器 DOM 证明）', true);
  }

  console.log(`\n${failures === 0 ? '✓ 全部通过' : '✗ ' + failures + ' 项失败'}`);
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });

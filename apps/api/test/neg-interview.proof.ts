import { boot, mkAssert, tokenFor } from './_neg-harness';
import { createHash, randomUUID } from 'node:crypto';

/**
 * neg:interview —— 面试状态机/begin/turn/legacy-answer-stop/abandon/report/assessment/events/transcript 的**纯负路径**证明。
 * 铁律:本文件**一条 happy-path 都不承载**。每条断言目标都是拒绝面:
 *   非法状态转移 / 终态再操作 / 越权(RLS) / 缺幂等键 / 乱序·越界 / 重放去重 / 不存在资源 /
 *   无额度(402) / 报告不可用兜底(不 500 死转) / 无内容评估(409) / 未鉴权(401) / 逃逸通道(保留主体).
 *
 * 状态机不变量段（见下）必须精确返回约定错误码；不能用“某个 4xx”掩盖守卫回退。
 *
 * 真源码依据(Read 于本次任务):
 *   - interview.controller.ts:begin(202,读 resume-id 头)/turn(202,ZodValidationPipe TurnDto)/legacy answer(410)/
 *     abandon(200)/report·retry·export/assessment·learning-plan·career-path/events(SSE)/transcript。
 *   - interview.service.ts:begin 对终态拒绝且对已有 start/active 幂等；turn 仅允许已 begin 的非终态会话；
 *     abandon 拒绝已完成/失败且对已放弃幂等；RLS 越权→0 行→404;report 无行→(interview_unavailable?→200 interview_failed : 404);
 *     generateAssessment 无有效评估轮→409 no_evaluated_turns;learning/career 无评估→409 assessment_required。
 *   - principal.guard.ts:无/坏令牌→401;账户非 active/不存在→401;__system* 保留主体→401。
 *   - contracts TurnDto = {questionId,answerId,answerHash,turn:int≥0,answer:string 1..8000}；旧无身份 body 均 400。
 */
const h = await boot();
const { A, done } = mkAssert('neg:interview');

// 额外边界种子(与 harness 固定种子并存,避免与"IV_ACT 事件为空"的断言相互耦合)
await h.pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ('IV_DUP','userA','active'),('IV_DUP2','userA','active'),('IV_UBC','userB','created')");
// API 拒绝路径也必须带真实 server-issued identity，不能用少字段 body 把业务守卫遮住。
await h.pool.query("INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,status) VALUES ('userA','IV_ACT','q-v1-t0-c0',1,0,'当前题','issued'),('userA','IV_ACT','q-v2-t1-c0',2,1,'已撤销旧题','cancelled')");

const A_ = h.U('userA');            // dev-header 主体 userA(有额度)
const B_ = h.U('userB');            // userB(无额度)
const rid = { 'resume-id': 'r1' };  // begin 必需头
const turnAnswer = '我用 Redis 令牌桶做了限流';
const VALID_TURN = { questionId: 'q-v1-t0-c0', stateVersion: 1, answerId: randomUUID(), answerHash: createHash('sha256').update(turnAnswer).digest('hex'), turn: 0, answer: turnAnswer };
const VALID_SINGLE_TRACK_CAPTURE = { mode: 'single_local_microphone', consent: true, policyVersion: 'voice_ephemeral_v1' };
const turnBody = (turn: number, answer: string, stateVersion = 1) => ({ questionId: `q-v1-t${turn}-c0`, stateVersion, answerId: randomUUID(), answerHash: createHash('sha256').update(answer).digest('hex'), turn, answer });

// 断言小工具:状态码 + 可选 error 码
const is = (r: { status: number; body: any }, code: number, err?: string) =>
  r.status === code && (err === undefined || r.body?.error === err);
const oneOf = (r: { status: number }, codes: number[]) => codes.includes(r.status);

// ─────────────────────────────────────────────────────────────────────────
// 1) begin —— 越权 / 不存在 / 缺资源头 / 无额度(402) / 未鉴权
// ─────────────────────────────────────────────────────────────────────────
A('begin 缺 resume-id 头 → 400 missing_resume_id',
  is(await h.post('/interview/IV_CREATED/begin', A_, {}), 400, 'missing_resume_id'));
A('begin 不存在的面试 → 404 not_found_or_forbidden',
  is(await h.post('/interview/IV_NOPE/begin', { ...A_, ...rid }, {}), 404, 'not_found_or_forbidden'));
A('begin 越权:userB begin userA 的 IV_ACT → 404(RLS 只见己)',
  is(await h.post('/interview/IV_ACT/begin', { ...B_, ...rid }, {}), 404, 'not_found_or_forbidden'));
A('begin 越权:userA begin userB 的 IV_OTHER → 404(RLS)',
  is(await h.post('/interview/IV_OTHER/begin', { ...A_, ...rid }, {}), 404, 'not_found_or_forbidden'));
// 无额度 402 需从 created 态 begin(IV_OTHER 是 active → begin 幂等短路 alreadyBegun,不触发扣额)。用 userB 自己的 created IV_UBC。
A('begin 无额度:userB begin 自己的 created 面试(IV_UBC)→ 402 insufficient_entitlement',
  is(await h.post('/interview/IV_UBC/begin', { ...B_, ...rid }, {}), 402, 'insufficient_entitlement'));
A('begin 未鉴权(无任何主体头)→ 401',
  is(await h.post('/interview/IV_CREATED/begin', rid, {}), 401));
A('begin 坏令牌 → 401 invalid_token',
  is(await h.post('/interview/IV_CREATED/begin', { authorization: 'Bearer garbage.token', ...rid }, {}), 401, 'invalid_token'));
A('begin 幽灵账户令牌(账户不存在)→ 401(fail-closed)',
  is(await h.post('/interview/IV_CREATED/begin', { authorization: `Bearer ${tokenFor('ghostUser')}`, ...rid }, {}), 401));
A('begin 逃逸通道:x-user-id=__system_qbank__ 保留主体 → 401 reserved_principal',
  is(await h.post('/interview/IV_CREATED/begin', { 'x-user-id': '__system_qbank__', ...rid }, {}), 401, 'reserved_principal'));

// ─────────────────────────────────────────────────────────────────────────
// 2) turn —— 契约畸形(zod 400) / 越界 / 空答 / 超长 / 终态(409) / 越权 / 不存在
// ─────────────────────────────────────────────────────────────────────────
A('turn 空 body → 400 invalid(zod:turn/answer 必填)',
  is(await h.post('/interview/IV_ACT/turn', A_, {}), 400, 'invalid'));
A('turn 缺 answer → 400 invalid(zod)',
  is(await h.post('/interview/IV_ACT/turn', A_, { turn: 0 }), 400, 'invalid'));
A('turn 缺 turn → 400 invalid(zod)',
  is(await h.post('/interview/IV_ACT/turn', A_, { answer: 'x' }), 400, 'invalid'));
A('turn 负 turn → 400 invalid(zod:int≥0)',
  is(await h.post('/interview/IV_ACT/turn', A_, { turn: -1, answer: 'x' }), 400, 'invalid'));
A('turn 非整数 turn → 400 invalid(zod)',
  is(await h.post('/interview/IV_ACT/turn', A_, { turn: 1.5, answer: 'x' }), 400, 'invalid'));
A('turn 空字符串答案 → 400 invalid(zod:min 1)',
  is(await h.post('/interview/IV_ACT/turn', A_, { turn: 0, answer: '' }), 400, 'invalid'));
A('turn 超长答案(>8000)→ 400 invalid(zod max 先于 service 413 拦下,纵深第一线)',
  is(await h.post('/interview/IV_ACT/turn', A_, { turn: 0, answer: 'x'.repeat(8001) }), 400, 'invalid'));
A('turn 纯空白答案(过 zod min1,service trim 为空)→ 400 invalid_turn',
  is(await h.post('/interview/IV_ACT/turn', A_, turnBody(0, '   ')), 400, 'invalid_turn'));
A('turn 越界 turn 号(>MAX_TURN 64,刷无限 job)→ 400 invalid_turn',
  is(await h.post('/interview/IV_ACT/turn', A_, turnBody(65, 'x')), 400, 'invalid_turn'));
A('turn answerHash 与 UTF-8 原文不一致 → 422(服务端重算,不信客户端)',
  is(await h.post('/interview/IV_ACT/turn', A_, { ...VALID_TURN, answerHash: '0'.repeat(64) }), 422, 'answer_hash_mismatch'));
A('turn stateVersion 不匹配 ledger → 409 stale_question(旧渲染批次不能覆盖当前题)',
  is(await h.post('/interview/IV_ACT/turn', A_, { ...VALID_TURN, stateVersion: 0 }), 409, 'stale_question'));
A('turn 已撤销 questionId → 409 stale_question(旧 tab 不能唤醒新 interrupt)',
  is(await h.post('/interview/IV_ACT/turn', A_, { ...turnBody(1, '旧题答案'), questionId: 'q-v2-t1-c0' }), 409, 'stale_question'));
// 模拟另一标签已将当前题领取；本请求 identity 已消费，必须作为 stale 拒绝而非覆盖先到答案。
await h.pool.query("UPDATE interview_question SET status='queued',answer_id='11111111-1111-4111-8111-111111111111',answer_hash=$1 WHERE interview_id='IV_ACT' AND question_id='q-v1-t0-c0'", [createHash('sha256').update('先到答案').digest('hex')]);
A('turn 同题不同 answerId/hash → 409 stale_question(双标签页不覆盖)',
  is(await h.post('/interview/IV_ACT/turn', A_, VALID_TURN), 409, 'stale_question'));
A('turn 畸形 JSON 正文 → 400(解析/校验失败,不落库不入队)',
  oneOf(await h.raw('POST', '/interview/IV_ACT/turn', { ...A_, 'content-type': 'application/json' }, '{"turn":'), [400]));
A('turn 终态 completed(IV_DONE)→ 409 interview_not_active',
  is(await h.post('/interview/IV_DONE/turn', A_, VALID_TURN), 409, 'interview_not_active'));
A('turn 终态 failed(IV_FAIL)→ 409 interview_not_active',
  is(await h.post('/interview/IV_FAIL/turn', A_, VALID_TURN), 409, 'interview_not_active'));
A('turn 终态 abandoned(IV_ABND)→ 409 interview_not_active',
  is(await h.post('/interview/IV_ABND/turn', A_, VALID_TURN), 409, 'interview_not_active'));
A('turn 越权:userB 答 userA 的 IV_ACT → 404(RLS)',
  is(await h.post('/interview/IV_ACT/turn', B_, VALID_TURN), 404, 'not_found_or_forbidden'));
A('turn 不存在的面试 → 404',
  is(await h.post('/interview/IV_NOPE/turn', A_, VALID_TURN), 404, 'not_found_or_forbidden'));
A('turn 未鉴权 → 401',
  is(await h.post('/interview/IV_ACT/turn', {}, VALID_TURN), 401));

// ─────────────────────────────────────────────────────────────────────────
// 3) answer(legacy 固定题单端点)——全量 410，绝不写 answer_evaluated
// ─────────────────────────────────────────────────────────────────────────
const legacyBefore = await h.pool.query("SELECT count(*)::int n FROM interview_event WHERE kind='answer_evaluated'");
const legacyResponses = await Promise.all([
  h.post('/interview/IV_ACT/answer', { ...A_, 'idempotency-key': 'k-active' }, {}),
  h.post('/interview/IV_DONE/answer', { ...A_, 'idempotency-key': 'k-done' }, {}),
  h.post('/interview/IV_ACT/answer', { ...B_, 'idempotency-key': 'k-cross-owner' }, {}),
  h.post('/interview/IV_NOPE/answer', { ...A_, 'idempotency-key': 'k-missing' }, {}),
]);
A('legacy answer 对有效/终态/跨主体/不存在 id 均返回统一 410，避免资源探测',
  legacyResponses.every((r) => is(r, 410, 'legacy_answer_endpoint_disabled')));
A('legacy answer 未鉴权仍由 guard 拒绝 401',
  is(await h.post('/interview/IV_ACT/answer', { 'idempotency-key': 'k-u' }, {}), 401));
const legacyAfter = await h.pool.query("SELECT count(*)::int n FROM interview_event WHERE kind='answer_evaluated'");
A('legacy answer 绝不写入 answer_evaluated（杜绝 B 端评分污染）', Number(legacyAfter.rows[0].n) === Number(legacyBefore.rows[0].n));

// ─────────────────────────────────────────────────────────────────────────
// 4) abandon —— 越权 / 不存在 / 未鉴权
// ─────────────────────────────────────────────────────────────────────────
A('abandon 越权:userB 放弃 userA 的 IV_ACT → 404(RLS)',
  is(await h.post('/interview/IV_ACT/abandon', B_, {}), 404, 'not_found_or_forbidden'));
A('abandon 越权:userA 放弃 userB 的 IV_OTHER → 404(RLS)',
  is(await h.post('/interview/IV_OTHER/abandon', A_, {}), 404, 'not_found_or_forbidden'));
A('abandon 不存在的面试 → 404',
  is(await h.post('/interview/IV_NOPE/abandon', A_, {}), 404, 'not_found_or_forbidden'));
A('abandon 未鉴权 → 401',
  is(await h.post('/interview/IV_ACT/abandon', {}, {}), 401));

// ─────────────────────────────────────────────────────────────────────────
// 5) report(查看/重试/导出)—— 兜底不 500 死转 / 越权 / 不存在 / ready 不可重试
// ─────────────────────────────────────────────────────────────────────────
A('report GET 进行中(IV_ACT 无报告行/无 interview_unavailable)→ 404 not_found(不 500,不假装"继续答题")',
  is(await h.req('GET', '/interview/IV_ACT/report', A_), 404, 'not_found'));
A('report GET created(IV_CREATED 无报告)→ 404 not_found',
  is(await h.req('GET', '/interview/IV_CREATED/report', A_), 404, 'not_found'));
A('report GET 越权:userB 读 userA 的 IV_ASMT 报告 → 404(RLS,不泄露他人报告)',
  is(await h.req('GET', '/interview/IV_ASMT/report', B_), 404, 'not_found'));
A('report GET 不存在 → 404',
  is(await h.req('GET', '/interview/IV_NOPE/report', A_), 404, 'not_found'));
A('report GET 未鉴权 → 401',
  is(await h.req('GET', '/interview/IV_ASMT/report', {}), 401));
A('report/retry 报告已 ready(IV_ASMT)不可重试 → 404 no_retriable_report(仅 failed/quarantined 可重试)',
  is(await h.post('/interview/IV_ASMT/report/retry', A_, {}), 404, 'no_retriable_report'));
A('report/retry 无任何报告(IV_ACT)→ 404 no_retriable_report',
  is(await h.post('/interview/IV_ACT/report/retry', A_, {}), 404, 'no_retriable_report'));
A('report/retry 越权:userB retry IV_ASMT → 404(RLS)',
  is(await h.post('/interview/IV_ASMT/report/retry', B_, {}), 404, 'no_retriable_report'));
A('report/retry 不存在 → 404',
  is(await h.post('/interview/IV_NOPE/report/retry', A_, {}), 404, 'no_retriable_report'));
A('report/retry 未鉴权 → 401',
  is(await h.post('/interview/IV_ASMT/report/retry', {}, {}), 401));
A('report/export 未就绪(IV_ACT)→ 404 report_not_ready',
  is(await h.req('GET', '/interview/IV_ACT/report/export', A_), 404, 'report_not_ready'));
A('report/export 越权:userB 导出 IV_ASMT → 404(RLS,拿不到就绪报告)',
  is(await h.req('GET', '/interview/IV_ASMT/report/export', B_), 404, 'report_not_ready'));
A('report/export 不存在 → 404',
  is(await h.req('GET', '/interview/IV_NOPE/report/export', A_), 404, 'report_not_ready'));
A('report/export 未鉴权 → 401',
  is(await h.req('GET', '/interview/IV_ASMT/report/export', {}), 401));

// ─────────────────────────────────────────────────────────────────────────
// 6) assessment —— 无评估轮(409) / 越权 / 无评估行(404) / 未鉴权
// ─────────────────────────────────────────────────────────────────────────
A('assessment POST 无 answer_evaluated 轮(IV_ACT 仅 question_ready)→ 409 no_evaluated_turns(不落 overall=0 假报告)',
  is(await h.post('/interview/IV_ACT/assessment', A_, {}), 409, 'no_evaluated_turns'));
A('assessment POST created(IV_CREATED 无事件)→ 409 no_evaluated_turns',
  is(await h.post('/interview/IV_CREATED/assessment', A_, {}), 409, 'no_evaluated_turns'));
A('assessment POST completed 但无评估事件(IV_DONE)→ 409 no_evaluated_turns',
  is(await h.post('/interview/IV_DONE/assessment', A_, {}), 409, 'no_evaluated_turns'));
A('assessment POST 越权:userB 生成 IV_ASMT 评估 → 404(RLS)',
  is(await h.post('/interview/IV_ASMT/assessment', B_, {}), 404, 'not_found_or_forbidden'));
A('assessment POST 不存在 → 404',
  is(await h.post('/interview/IV_NOPE/assessment', A_, {}), 404, 'not_found_or_forbidden'));
A('assessment POST 未鉴权 → 401',
  is(await h.post('/interview/IV_ASMT/assessment', {}, {}), 401));
A('assessment GET 未生成(IV_ASMT 无 assessment_report 行)→ 404 not_found',
  is(await h.req('GET', '/interview/IV_ASMT/assessment', A_), 404, 'not_found'));
A('assessment GET 越权:userB 读 IV_ASMT 评估 → 404(RLS)',
  is(await h.req('GET', '/interview/IV_ASMT/assessment', B_), 404, 'not_found'));
A('assessment GET 不存在 → 404',
  is(await h.req('GET', '/interview/IV_NOPE/assessment', A_), 404, 'not_found'));
A('assessment GET 未鉴权 → 401',
  is(await h.req('GET', '/interview/IV_ASMT/assessment', {}), 401));

// ─────────────────────────────────────────────────────────────────────────
// 7) learning-plan / career-path —— 无评估前置(409) / 无行(404) / 缺 topic(400) / 未鉴权
// ─────────────────────────────────────────────────────────────────────────
A('learning-plan POST 无评估前置(IV_ASMT 未生成评估)→ 409 assessment_required',
  is(await h.post('/interview/IV_ASMT/learning-plan', A_, {}), 409, 'assessment_required'));
A('learning-plan POST 无评估(IV_ACT)→ 409 assessment_required',
  is(await h.post('/interview/IV_ACT/learning-plan', A_, {}), 409, 'assessment_required'));
A('learning-plan GET 未生成 → 404 not_found',
  is(await h.req('GET', '/interview/IV_ASMT/learning-plan', A_), 404, 'not_found'));
A('learning-plan GET 越权:userB → 404(RLS)',
  is(await h.req('GET', '/interview/IV_ASMT/learning-plan', B_), 404, 'not_found'));
A('learning-plan/complete 缺 topic → 400(契约 zod 拒:error=invalid)',
  is(await h.post('/interview/IV_ASMT/learning-plan/complete', A_, {}), 400, 'invalid'));
A('learning-plan POST 未鉴权 → 401',
  is(await h.post('/interview/IV_ASMT/learning-plan', {}, {}), 401));
A('career-path POST 无评估前置 → 409 assessment_required',
  is(await h.post('/interview/IV_ASMT/career-path', A_, {}), 409, 'assessment_required'));
A('career-path POST 无评估(IV_ACT)→ 409 assessment_required',
  is(await h.post('/interview/IV_ACT/career-path', A_, {}), 409, 'assessment_required'));
A('career-path GET 未生成 → 404 not_found',
  is(await h.req('GET', '/interview/IV_ASMT/career-path', A_), 404, 'not_found'));
A('career-path GET 越权:userB → 404(RLS)',
  is(await h.req('GET', '/interview/IV_ASMT/career-path', B_), 404, 'not_found'));
A('career-path POST 未鉴权 → 401',
  is(await h.post('/interview/IV_ASMT/career-path', {}, {}), 401));

// ─────────────────────────────────────────────────────────────────────────
// 8) events(SSE) / transcript —— 越权 / 不存在 / 未鉴权(404/401 在 hijack 前返 JSON)
// ─────────────────────────────────────────────────────────────────────────
A('events 越权:userB 订阅 userA 的 IV_ACT 事件流 → 404 not_found_or_forbidden(不泄露他人事件)',
  is(await h.req('GET', '/interview/IV_ACT/events', B_), 404, 'not_found_or_forbidden'));
A('events 不存在的面试 → 404 not_found_or_forbidden',
  is(await h.req('GET', '/interview/IV_NOPE/events', A_), 404, 'not_found_or_forbidden'));
A('events 未鉴权 → 401',
  is(await h.req('GET', '/interview/IV_ACT/events', {}), 401));
A('transcript 越权:userB 读 IV_ACT 转写 → 404(RLS)',
  is(await h.req('GET', '/interview/IV_ACT/transcript', B_), 404, 'not_found_or_forbidden'));
A('transcript 不存在 → 404',
  is(await h.req('GET', '/interview/IV_NOPE/transcript', A_), 404, 'not_found_or_forbidden'));
A('transcript 未鉴权 → 401',
  is(await h.req('GET', '/interview/IV_ACT/transcript', {}), 401));

// ─────────────────────────────────────────────────────────────────────────
// 9) 题目反馈 / 语音端点 —— 畸形评分/索引(400) / 空文本(400) / 越权(404)
// ─────────────────────────────────────────────────────────────────────────
A('questionFeedback 非法 rating(非 up/down)→ 400(契约 zod enum 拒:error=invalid)',
  is(await h.post('/interview/IV_ACT/questions/0/feedback', A_, { rating: 'meh' }), 400, 'invalid'));
A('questionFeedback 负 index → 400 invalid_index',
  is(await h.post('/interview/IV_ACT/questions/-1/feedback', A_, { rating: 'up' }), 400, 'invalid_index'));
A('questionFeedback 非数字 index → 400 invalid_index',
  is(await h.post('/interview/IV_ACT/questions/abc/feedback', A_, { rating: 'up' }), 400, 'invalid_index'));
A('speak 空白文本(trim 后空)→ 400 empty_text',
  is(await h.post('/interview/IV_ACT/speak', A_, { text: '   ' }), 400, 'empty_text'));
A('speak 越权:userB 对 IV_ACT 合成 → 404(先校归属再花 TTS)',
  is(await h.post('/interview/IV_ACT/speak', B_, { text: '你好' }), 404, 'not_found_or_forbidden'));
A('speak 不存在 → 404',
  is(await h.post('/interview/IV_NOPE/speak', A_, { text: '你好' }), 404, 'not_found_or_forbidden'));
A('transcribe 缺显式同意 → 400 invalid（在 ASR 前 fail-closed）',
  is(await h.post('/interview/IV_ACT/transcribe', A_, { audioBase64: 'AAAA', mimeType: 'audio/webm' }), 400, 'invalid'));
A('transcribe 伪称双人电话/远端轨 → 400 invalid（能力未接入不得绕过）',
  is(await h.post('/interview/IV_ACT/transcribe', A_, { audioBase64: 'AAAA', mimeType: 'audio/webm', capture: { ...VALID_SINGLE_TRACK_CAPTURE, mode: 'two_participant_call' } }), 400, 'invalid'));
A('transcribe 畸形 base64 → 400 invalid（模型调用前拒绝）',
  is(await h.post('/interview/IV_ACT/transcribe', A_, { audioBase64: 'not base64!', mimeType: 'audio/webm', capture: VALID_SINGLE_TRACK_CAPTURE }), 400, 'invalid'));
A('transcribe 越权:userB 对 IV_ACT 转写 → 404',
  is(await h.post('/interview/IV_ACT/transcribe', B_, { audioBase64: 'AAAA', mimeType: 'audio/webm', capture: VALID_SINGLE_TRACK_CAPTURE }), 404, 'not_found_or_forbidden'));
A('transcribe 不存在 → 404',
  is(await h.post('/interview/IV_NOPE/transcribe', A_, { audioBase64: 'AAAA', mimeType: 'audio/webm', capture: VALID_SINGLE_TRACK_CAPTURE }), 404, 'not_found_or_forbidden'));

// ═════════════════════════════════════════════════════════════════════════
// 状态机硬不变量：这里的精确 409 是消费/图恢复安全契约，不能降级成任意 4xx。
// ═════════════════════════════════════════════════════════════════════════
A('begin 终态 completed(IV_DONE)→409 interview_not_active（不可复活/不可二次扣额）',
  is(await h.post('/interview/IV_DONE/begin', { ...A_, ...rid }, {}), 409, 'interview_not_active'));
A('begin 终态 failed(IV_FAIL)→409 interview_not_active',
  is(await h.post('/interview/IV_FAIL/begin', { ...A_, ...rid }, {}), 409, 'interview_not_active'));
A('begin 终态 abandoned(IV_ABND)→409 interview_not_active',
  is(await h.post('/interview/IV_ABND/begin', { ...A_, ...rid }, {}), 409, 'interview_not_active'));
{
  // active 即便异常缺少历史 start job，也必须短路：不重新 reserve、不再入队第二个 start。
  const r = await h.post('/interview/IV_ACT/begin', { ...A_, ...rid }, {});
  A('begin 已 active(IV_ACT)→202 alreadyBegun=true（不二次预留/入队）',
    r.status === 202 && r.body?.alreadyBegun === true);
}
A('turn created(IV_CREATED 尚未 begin)→409 interview_not_started（不制造付费 answer job）',
  is(await h.post('/interview/IV_CREATED/turn', A_, VALID_TURN), 409, 'interview_not_started'));
A('legacy answer created(IV_CREATED 尚未 begin)也统一 410（端点不再读写面试）',
  is(await h.post('/interview/IV_CREATED/answer', { ...A_, 'idempotency-key': 'k-created' }, {}), 410, 'legacy_answer_endpoint_disabled'));
A('abandon 终态 completed(IV_DONE)→409 interview_not_active（不可退款覆盖已确认消费）',
  is(await h.post('/interview/IV_DONE/abandon', A_, {}), 409, 'interview_not_active'));
A('abandon 终态 failed(IV_FAIL)→409 interview_not_active',
  is(await h.post('/interview/IV_FAIL/abandon', A_, {}), 409, 'interview_not_active'));
{
  const r = await h.post('/interview/IV_ABND/abandon', A_, {});
  A('abandon 重复放弃(IV_ABND)→200 alreadyAbandoned + noop（不二次退款）',
    r.status === 200 && r.body?.alreadyAbandoned === true && r.body?.released === 'noop');
}

// 用例统计:
//   §1 begin ........... 9
//   §2 turn ............ 17
//   §3 answer .......... 10
//   §4 abandon ......... 4
//   §5 report .......... 14
//   §6 assessment ...... 10
//   §7 learning/career . 10
//   §8 events/transcript 6
//   §9 feedback/voice .. 8
//   状态机硬不变量 .... 9
//   ── 合计:97 条纯负路径断言（所有状态守卫均为精确码断言）
await done();

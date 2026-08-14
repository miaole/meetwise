/**
 * 全栈 E2E(真 HTTP 打真 api + 真 worker + 真 DB):
 * signup → consent → 上传简历 → 建面试 → begin → 轮询 SSE 事件 → 每出题就答 → 直到终态(无死胡同)。
 * 真鉴权(Bearer)、真队列、真 worker 图执行。降级模型模式也必须跑到终态。
 */
import { createHash, createHmac, randomUUID } from 'node:crypto';
import { liveOcrResumePngBase64 } from './ocr-fixture.ts';
const BASE = process.env.E2E_BASE ?? 'http://127.0.0.1:8787';
const PAY_SECRET = process.env.PAY_PROVIDER_SECRET ?? 'e2e-pay-secret';
// 一场真实模型面试最多会经历 6 个题面、评分、澄清和报告任务。实跑表明单轮语音已可超过
// 120 秒；90 秒只能测到“任务尚在正常收口”而非无死胡同。该值仅是 E2E 完整性预算，
// 不是任何 API（应用程序接口）或模型的延迟目标；性能阈值由独立性能门负责。
const INTERVIEW_TERMINAL_DEADLINE_MS = 420_000;
let pass = 0;
const A = (cond: boolean, msg: string) => { if (!cond) { console.error('✗', msg); process.exit(1); } pass++; console.log('✓', msg); };
const j = async (r: Response) => { try { return await r.json(); } catch { return {}; } };
type QuestionIdentity = { questionId: string; stateVersion: number; turn: number };
type LiveGatewayResult = { response: Response; body: any; attempts: number };

/**
 * 真实第三方语音服务偶发 429/5xx 时，E2E 只能在已经明确失败后作一次有界重试。
 * 生产 API 不在未知写入结果后盲目重试，以免供应商没有幂等键时出现重复计费；这里
 * 仅验证真实服务可用性，默认总调用上限为两次，失败响应只打印错误码而不打印音频。
 */
async function callLiveVoiceGateway(label: string, operation: () => Promise<Response>): Promise<LiveGatewayResult> {
  const maxAttempts = Math.min(2, Math.max(1, Number(process.env.E2E_VOICE_MAX_ATTEMPTS ?? 2) || 2));
  let last: LiveGatewayResult | undefined;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await operation();
      const body = await j(response);
      last = { response, body, attempts: attempt };
      const retryable = response.status === 429 || response.status === 408 || response.status >= 500;
      if (response.status === 200 || !retryable || attempt === maxAttempts) return last;
      console.warn(`[E2E] ${label} 暂态失败，第 ${attempt}/${maxAttempts} 次: status=${response.status}, error=${String(body?.error ?? body?.message ?? 'unknown').slice(0, 120)}`);
    } catch (error: any) {
      if (attempt === maxAttempts) throw error;
      console.warn(`[E2E] ${label} 网络异常，第 ${attempt}/${maxAttempts} 次: ${String(error?.message ?? error).slice(0, 120)}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000 * attempt));
  }
  throw new Error(`e2e_live_voice_gateway_exhausted:${label}:${last?.response.status ?? 'network'}`);
}
/** E2E 与浏览器同样使用 question_ready 发放的身份，不再用本地计数器伪造当前题。 */
const questionIdentity = (payload: any): QuestionIdentity => {
  if (typeof payload?.questionId !== 'string' || !Number.isInteger(payload?.stateVersion) || !Number.isInteger(payload?.turn))
    throw new Error('e2e_question_identity_missing');
  return { questionId: payload.questionId, stateVersion: payload.stateVersion, turn: payload.turn };
};
const answerBody = (identity: QuestionIdentity, answer: string) => ({
  ...identity,
  answer,
  answerId: randomUUID(),
  answerHash: createHash('sha256').update(answer).digest('hex'),
});

async function main() {
  const email = `e2e_${process.env.E2E_TAG ?? 'run'}@x.com`;
  const password = 'strongpw123';

  // 1. 注册(或已存在则登录)→ 真 Bearer 令牌
  let r = await fetch(`${BASE}/auth/signup`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password }) });
  let b: any = await j(r);
  if (r.status !== 200) { r = await fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password }) }); b = await j(r); }
  A(r.status === 200 && typeof b.token === 'string', '注册/登录 → 真 Bearer 令牌');
  const token = b.token;
  const H = { 'content-type': 'application/json', authorization: `Bearer ${token}` };

  // 2. PIPL 采集同意(上传简历前置)
  r = await fetch(`${BASE}/privacy/consent`, { method: 'POST', headers: H, body: JSON.stringify({ purpose: 'resume_processing' }) });
  A(r.status === 200, 'PIPL 采集同意 → 200');

  // 3. 上传简历(加密落库 + 结构化 + PII 脱敏)
  r = await fetch(`${BASE}/resume`, { method: 'POST', headers: H, body: JSON.stringify({ text: '后端工程师 3 年。负责高并发订单系统,用 Redis 做分布式锁与限流,MySQL 分库分表,消息队列削峰。' }) });
  b = await j(r);
  A(r.status === 200 && typeof b.resumeId === 'string', `上传简历 → resumeId(${b.status})`);
  const resumeId = b.resumeId;

  // 3b. 买面试包(真 commerce:下单 → HMAC 验签 webhook 入账 → 额度)
  r = await fetch(`${BASE}/commerce/orders`, { method: 'POST', headers: { ...H, 'idempotency-key': `${email}:order` }, body: JSON.stringify({ productId: 'pack_10' }) });
  b = await j(r);
  A(r.status === 200 && typeof b.orderId === 'string', `下单 pack_10 → orderId(${b.amountCents}分)`);
  // PSP 流水全局唯一；E2E 可重复执行，不能用常量 txn 否则上一轮成功会让下一轮误报支付冲突。
  const orderId = b.orderId, txn = `txn_e2e_${process.env.E2E_TAG ?? 'run'}_${Date.now()}`;
  const sig = createHmac('sha256', PAY_SECRET).update(`${orderId}:${txn}:paid`).digest('hex');
  r = await fetch(`${BASE}/commerce/webhook/pay/${orderId}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ providerTxn: txn, sig }) });
  b = await j(r);
  A(r.status === 200 && (b.result === 'credited' || b.result === 'already'), `支付 webhook 验签入账 → ${b.result}`);
  r = await fetch(`${BASE}/commerce/entitlement`, { headers: H });
  b = await j(r);
  A((b.availableUnits ?? 0) >= 1, `额度到账(${b.availableUnits} 次)`);

  // 3c. 图片简历 OCR 全栈：真 HTTP → 真百炼视觉模型 → 计费状态机 → 真 DB。
  // 图片为本文件生成的、肉眼可读的有效 PNG（不是把任意字节伪装成 image/png）。包含
  // 合成手机号，以验证下游 PII（个人身份信息）脱敏；不记录模型转写原文。
  const beforeOcr = await j(await fetch(`${BASE}/commerce/entitlement`, { headers: H }));
  const pngB64 = liveOcrResumePngBase64();
  r = await fetch(`${BASE}/resume/file`, { method: 'POST', headers: H, body: JSON.stringify({ filename: 'r.png', mimeType: 'image/png', contentBase64: pngB64 }) });
  b = await j(r);
  A(r.status === 200 && b.ocr === true && b.format === 'image' && typeof b.resumeId === 'string',
    `图片简历 OCR 全栈 → 摄取(status=${r.status}, outcome=${b.error ?? b.reason ?? 'ok'})`);
  const ocrProfile = await j(await fetch(`${BASE}/resume/${b.resumeId}/profile`, { headers: H }));
  const structuredOcr = JSON.stringify(ocrProfile.structured ?? {});
  // Real vision OCR can vary capitalization/line wrapping.  E2E asserts the
  // safety and usable-output contract; exact token recall belongs to the
  // versioned OCR evaluation corpus, not a single paid online sample.
  A(Number.isInteger(b.chars) && b.chars >= 20 && ocrProfile.status === 'needs_review' && !structuredOcr.includes('13800138000')
    && /redis|postgresql|typescript|backend/i.test(structuredOcr),
  `OCR 来源产出可复核画像(${b.chars} chars)、识别至少 1 个非敏感技能且 PII 脱敏(不含明文手机号)`);
  const afterOcr = await j(await fetch(`${BASE}/commerce/entitlement`, { headers: H }));
  A(afterOcr.availableUnits === beforeOcr.availableUnits - 1, 'OCR 成功只确认扣减 1 个额度');
  const duplicateOcr = await fetch(`${BASE}/resume/file`, { method: 'POST', headers: H, body: JSON.stringify({ filename: 'r-repeat.png', mimeType: 'image/png', contentBase64: pngB64 }) });
  const duplicateOcrBody = await j(duplicateOcr);
  const afterDuplicateOcr = await j(await fetch(`${BASE}/commerce/entitlement`, { headers: H }));
  A(duplicateOcr.status === 409 && duplicateOcrBody.error === 'ocr_duplicate' && afterDuplicateOcr.availableUnits === afterOcr.availableUnits,
    '同图重传 → 409 且额度不再扣减');

  // 4. 建面试
  r = await fetch(`${BASE}/interview`, { method: 'POST', headers: H, body: '{}' });
  b = await j(r);
  const interviewId = b.interviewId ?? b.id ?? b.resultId;
  A(r.status === 200 || r.status === 201, `建面试 → interviewId(${interviewId})`);
  A(typeof interviewId === 'string', '拿到 interviewId');

  // 4a. 真实双向语音闭环：百炼 TTS 先播报一条题目，再将返回的 WAV 原样交给百炼
  // ASR。这里不使用本地假音频或假识别结果；断言的是可理解的转写、明确的采集能力声明，
  // 而非把单轨输入伪装成电话双人分离。
  const voicePrompt = '请用中文回答，如何设计 Redis 令牌桶限流？';
  const spoken = await callLiveVoiceGateway('TTS', () => fetch(`${BASE}/interview/${interviewId}/speak`, {
    method: 'POST', headers: H, body: JSON.stringify({ text: voicePrompt }),
  }));
  const spokenBody: any = spoken.body;
  A(spoken.response.status === 200 && spokenBody.mimeType === 'audio/wav'
    && typeof spokenBody.audioBase64 === 'string' && Buffer.from(spokenBody.audioBase64, 'base64').byteLength > 1_000,
  `真实 TTS → 有效 WAV 音频（非本地假实现，${spoken.attempts} 次请求）`);
  const transcribed = await callLiveVoiceGateway('ASR', () => fetch(`${BASE}/interview/${interviewId}/transcribe`, {
    method: 'POST', headers: H,
    body: JSON.stringify({
      audioBase64: spokenBody.audioBase64,
      mimeType: spokenBody.mimeType,
      capture: { mode: 'single_local_microphone', consent: true, policyVersion: 'voice_ephemeral_v1' },
    }),
  }));
  const transcribedBody: any = transcribed.body;
  A(transcribed.response.status === 200 && typeof transcribedBody.text === 'string'
    && /redis|令牌桶|限流/i.test(transcribedBody.text)
    && transcribedBody.capture?.mode === 'single_local_microphone'
    && transcribedBody.capture?.speakerAttribution === 'not_diarized'
    && transcribedBody.capture?.wordTimestamps === 'not_available',
  `真实 ASR 回转 TTS 音频 → 可理解转写（${String(transcribedBody.text ?? '').slice(0, 40)}；${transcribed.attempts} 次请求）`);

  // 5. begin(入队 start job;worker 规划 + 出首题)
  r = await fetch(`${BASE}/interview/${interviewId}/begin`, { method: 'POST', headers: { ...H, 'resume-id': resumeId }, body: '{}' });
  A(r.status === 202, `begin → 202 受理(${JSON.stringify(await j(r)).slice(0, 60)})`);

  // 6. 轮询 SSE 事件:每出一道题就答;直到终态。SSE 是 hold-and-tail,短读 abort 拿 catch-up。
  const TERMINAL = ['report_ready', 'report_unavailable', 'assessment_unavailable', 'interview_unavailable'];
  const readEvents = async (lastSeq: number): Promise<Array<{ seq: number; kind: string; payload: any }>> => {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 1200);
    let buf = '';
    try {
      const res = await fetch(`${BASE}/interview/${interviewId}/events`, { headers: { authorization: `Bearer ${token}`, ...(lastSeq ? { 'last-event-id': String(lastSeq) } : {}) }, signal: ac.signal });
      if (res.status === 200 && res.body) {
        const rd = res.body.getReader(); const dec = new TextDecoder();
        for (;;) { const { done, value } = await rd.read(); if (done) break; buf += dec.decode(value, { stream: true }); }
      }
    } catch { /* abort = 预期(hold-and-tail) */ } finally { clearTimeout(t); }
    const out: Array<{ seq: number; kind: string; payload: any }> = [];
    for (const m of buf.matchAll(/^id: (\d+)\nevent: (\w+)\ndata: (.*)$/gm)) {
      out.push({ seq: Number(m[1]), kind: m[2], payload: (() => { try { return JSON.parse(m[3]); } catch { return {}; } })() });
    }
    return out;
  };

  let lastSeq = 0, turn = 0, questions = 0, evaluated = 0, terminal = '', kinds = new Set<string>();
  let currentQuestion: QuestionIdentity | null = null;
  const start = Date.now();
  while (Date.now() - start < INTERVIEW_TERMINAL_DEADLINE_MS) {
    const evs = await readEvents(lastSeq);
    for (const e of evs) {
      if (e.seq <= lastSeq) continue;
      lastSeq = e.seq; kinds.add(e.kind);
      if (e.kind === 'question_ready') {
        questions++;
        currentQuestion = questionIdentity(e.payload);
        // 答题(稳定幂等键 + 服务端发放 question identity)
        const answer = '我会用 Redis SETNX 加随机值做分布式锁,配合 Lua 原子释放和看门狗续期,限流用令牌桶。';
        const tr = await fetch(`${BASE}/interview/${interviewId}/turn`, { method: 'POST', headers: { ...H, 'idempotency-key': `${interviewId}:question:${currentQuestion.questionId}:answer:${turn}` }, body: JSON.stringify(answerBody(currentQuestion, answer)) });
        A(tr.status === 202, `第 ${turn + 1} 题 canonical /turn → 202`);
        turn++;
      } else if (e.kind === 'answer_evaluated') {
        evaluated++;
      } else if (e.kind === 'clarification_needed') {
        // 澄清事件携带新 pending question identity。上一题的 identity 已被消费；
        // 使用旧令牌重答应被拒绝为 stale_question，E2E 必须模拟浏览器更新令牌。
        const staleQuestion = currentQuestion;
        currentQuestion = questionIdentity(e.payload);
        if (staleQuestion) {
          const stale = await fetch(`${BASE}/interview/${interviewId}/turn`, {
            method: 'POST', headers: { ...H, 'idempotency-key': `${interviewId}:stale:${staleQuestion.questionId}` },
            body: JSON.stringify(answerBody(staleQuestion, '这是一条已消费身份的重放答案')),
          });
          const staleBody = await j(stale);
          A(stale.status === 409 && staleBody.error === 'stale_question', '澄清后重放旧 question identity → 409 stale_question（不双写/不二次扣费）');
        }
        const answer = '跳过';
        const tr = await fetch(`${BASE}/interview/${interviewId}/turn`, { method: 'POST', headers: { ...H, 'idempotency-key': `${interviewId}:question:${currentQuestion.questionId}:answer:${turn}` }, body: JSON.stringify(answerBody(currentQuestion, answer)) });
        A(tr.status === 202, `澄清后的 canonical /turn → 202`);
        turn++;
      } else if (TERMINAL.includes(e.kind)) {
        terminal = e.kind;
      }
    }
    if (terminal) break;
    await new Promise((r) => setTimeout(r, 1000));
  }

  A(questions >= 1, `至少出了 1 道题(实际 ${questions} 道;事件:${[...kinds].join(',')})`);
  A(turn >= 1, `至少答了 1 题(${turn} 次)`);
  if (!terminal) {
    const diagnostic = await j(await fetch(`${BASE}/interview/${interviewId}/report`, { headers: H }));
    console.error(`E2E_INTERVIEW_TERMINAL_TIMEOUT interview=${interviewId} elapsedMs=${Date.now() - start} lastSeq=${lastSeq} questions=${questions} turns=${turn} events=${[...kinds].join(',')} reportStatus=${String(diagnostic.status ?? 'unknown')}`);
  }
  A(terminal !== '', `面试跑到终态事件(${terminal})——无死胡同 ✅`);

  // 7. 报告端点可查,且 **status 与终态一致**(修假覆盖:不能只断 200——卡在 queued 也会过)
  r = await fetch(`${BASE}/interview/${interviewId}/report`, { headers: H });
  b = await j(r);
  A(r.status === 200, `报告端点可查 → status=${b.status}`);
  A(terminal === 'report_ready' ? b.status === 'ready' : b.status !== 'ready', `状态机:报告 status 与终态自洽(终态 ${terminal} → status=${b.status})`);

  // 7a. [兜底/逃逸·跨进程] **报告失败隔离**:报告生成失败 → 舱壁 quarantine → **report_unavailable**(非无限转圈死胡同);
  // 面试本身已完成(entitlement 已扣,报告失败不退面试费——失败隔离铁律)。isolated worker 在
  // 第二份报告每次取得真实模型响应后注入一次故障；不是本地模型/语音/OCR 假实现。
  {
    const cr = await j(await fetch(`${BASE}/interview`, { method: 'POST', headers: H, body: '{}' }));
    const failIv = cr.interviewId ?? cr.id ?? cr.resultId;
    A(typeof failIv === 'string', `[兜底] 建失败测试面试 → id(${failIv})`);
    const bg = await fetch(`${BASE}/interview/${failIv}/begin`, { method: 'POST', headers: { ...H, 'resume-id': resumeId }, body: '{}' });
    A(bg.status === 202, '[兜底] 失败测试面试 begin → 202');
    let fSeq = 0, fTurn = 0, fTerm = '';
    let fQuestion: QuestionIdentity | null = null;
    const fStart = Date.now();
    while (Date.now() - fStart < INTERVIEW_TERMINAL_DEADLINE_MS) {
      // 内联读 failIv 事件(readEvents 闭包绑定了主 interviewId,故此处独立实现)
      const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 1200); let buf = '';
      try {
        const res = await fetch(`${BASE}/interview/${failIv}/events`, { headers: { authorization: `Bearer ${token}`, ...(fSeq ? { 'last-event-id': String(fSeq) } : {}) }, signal: ac.signal });
        if (res.status === 200 && res.body) { const rd = res.body.getReader(); const dec = new TextDecoder(); for (;;) { const { done, value } = await rd.read(); if (done) break; buf += dec.decode(value, { stream: true }); } }
      } catch { /* abort 预期 */ } finally { clearTimeout(t); }
      for (const m of buf.matchAll(/^id: (\d+)\nevent: (\w+)\ndata: (.*)$/gm)) {
        const seq = Number(m[1]), kind = m[2];
        if (seq <= fSeq) continue; fSeq = seq;
        if (kind === 'question_ready') {
          fQuestion = questionIdentity(JSON.parse(m[3]));
          const answer = '我用 Redis 令牌桶限流，Lua 原子释放锁。';
          const tr = await fetch(`${BASE}/interview/${failIv}/turn`, { method: 'POST', headers: { ...H, 'idempotency-key': `${failIv}:question:${fQuestion.questionId}:answer:${fTurn}` }, body: JSON.stringify(answerBody(fQuestion, answer)) });
          A(tr.status === 202, '[兜底] canonical /turn → 202'); fTurn++;
        } else if (kind === 'clarification_needed') {
          fQuestion = questionIdentity(JSON.parse(m[3]));
          const answer = '跳过';
          const tr = await fetch(`${BASE}/interview/${failIv}/turn`, { method: 'POST', headers: { ...H, 'idempotency-key': `${failIv}:question:${fQuestion.questionId}:answer:${fTurn}` }, body: JSON.stringify(answerBody(fQuestion, answer)) });
          A(tr.status === 202, '[兜底] 澄清 canonical /turn → 202'); fTurn++;
        }
        else if (['report_ready', 'report_unavailable', 'assessment_unavailable', 'interview_unavailable'].includes(kind)) fTerm = kind;
      }
      if (fTerm) break;
      await new Promise((rr) => setTimeout(rr, 1000));
    }
    const rep = await j(await fetch(`${BASE}/interview/${failIv}/report`, { headers: H }));
    // 终态 SSE 和持久状态必须成对验证；以前先断言终态会在失败时掩盖 report 实际卡在 queued/running/failed 的证据。
    A(fTerm === 'report_unavailable' && rep.status === 'quarantined',
      `[兜底] 报告失败 → report_unavailable + quarantined(无死胡同;终态=${fTerm || 'none'}, status=${rep.status ?? 'none'})`);
  }

  // 7b. 押题 + 诊断全栈(真 HTTP → worker 消费 → 图执行 → 终态,无死胡同)。通用终态轮询(SSE hold-and-tail)。
  const pollTerminal = async (base: string, terminals: string[]): Promise<string> => {
    let seq = 0, term = '';
    const start2 = Date.now();
    while (Date.now() - start2 < 60_000) {
      const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 1200); let buf = '';
      try {
        const res = await fetch(`${BASE}${base}/events`, { headers: { authorization: `Bearer ${token}`, ...(seq ? { 'last-event-id': String(seq) } : {}) }, signal: ac.signal });
        if (res.status === 200 && res.body) { const rd = res.body.getReader(); const dec = new TextDecoder(); for (;;) { const { done, value } = await rd.read(); if (done) break; buf += dec.decode(value, { stream: true }); } }
      } catch { /* abort 预期 */ } finally { clearTimeout(t); }
      for (const m of buf.matchAll(/^id: (\d+)\nevent: (\w+)\ndata: (.*)$/gm)) { seq = Math.max(seq, Number(m[1])); if (terminals.includes(m[2])) term = m[2]; }
      if (term) break;
      await new Promise((rr) => setTimeout(rr, 1000));
    }
    return term;
  };
  // 押题
  let qz: any = await j(await fetch(`${BASE}/quiz`, { method: 'POST', headers: H, body: '{}' }));
  const quizId = qz.id ?? qz.quizId;
  A(typeof quizId === 'string', `押题:建 → id(${quizId})`);
  r = await fetch(`${BASE}/quiz/${quizId}/begin`, { method: 'POST', headers: { ...H, 'resume-id': resumeId }, body: '{}' });
  A(r.status === 202, '押题:begin → 202 受理');
  const quizTerm = await pollTerminal(`/quiz/${quizId}`, ['quiz_ready', 'quiz_unavailable', 'error']);
  A(quizTerm !== '', `押题:跑到终态(${quizTerm})——无死胡同 ✅`);
  // 诊断
  let dg: any = await j(await fetch(`${BASE}/diagnosis`, { method: 'POST', headers: H, body: '{}' }));
  const diagId = dg.id ?? dg.diagnosisId;
  A(typeof diagId === 'string', `诊断:建 → id(${diagId})`);
  r = await fetch(`${BASE}/diagnosis/${diagId}/begin`, { method: 'POST', headers: { ...H, 'resume-id': resumeId }, body: '{}' });
  A(r.status === 202, '诊断:begin → 202 受理');
  const diagTerm = await pollTerminal(`/diagnosis/${diagId}`, ['diagnosis_ready', 'diagnosis_unavailable', 'error']);
  A(diagTerm !== '', `诊断:跑到终态(${diagTerm})——无死胡同 ✅`);

  // 8. B 端(招聘方)+ 多租户 RLS 隔离:发岗位 → 自己可见 → 他人不可见
  // 招聘方是**独立角色用户**(RecruiterGuard 按 role 门禁:候选人 user1 不能发岗位 → 403)。
  const recTok = (await j(await fetch(`${BASE}/auth/signup`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: `e2e_rec_${process.env.E2E_TAG ?? 'run'}@x.com`, password, role: 'recruiter' }) }))).token;
  const HR = { 'content-type': 'application/json', authorization: `Bearer ${recTok}` };
  r = await fetch(`${BASE}/recruiter/jobs`, { method: 'POST', headers: HR, body: JSON.stringify({ title: '后端工程师', competencies: ['高并发', '分布式锁', '限流'] }) });
  b = await j(r);
  A(r.status === 200 && typeof b.id === 'string', `B端:招聘方发岗位 → jobId(${b.id})`);
  const jobId = b.id;
  // [幂等] 网络边界不确定时用同一 key 重试，必须复用岗位；同 key 换语义载荷必须显式冲突，不能静默创建第二个岗位。
  const createJobKey = `e2e-job-${process.env.E2E_TAG ?? 'run'}-${randomUUID()}`;
  const createJobBody = { title: '幂等岗位', competencies: ['幂等', 'outbox'] };
  const idempotentOne = await j(await fetch(`${BASE}/recruiter/jobs`, { method: 'POST', headers: { ...HR, 'idempotency-key': createJobKey }, body: JSON.stringify(createJobBody) }));
  const duplicateJob = await j(await fetch(`${BASE}/recruiter/jobs`, { method: 'POST', headers: { ...HR, 'idempotency-key': createJobKey }, body: JSON.stringify(createJobBody) }));
  A(typeof idempotentOne.id === 'string' && duplicateJob.id === idempotentOne.id, 'B端:同 idempotency-key 重试复用同一岗位(不重复创建)');
  r = await fetch(`${BASE}/recruiter/jobs`, { method: 'POST', headers: { ...HR, 'idempotency-key': createJobKey }, body: JSON.stringify({ ...createJobBody, title: '冲突岗位' }) });
  A(r.status === 409, 'B端:同 idempotency-key 换载荷 → 409(不静默覆盖/重复创建)');
  // [异常] 候选人(user1,非招聘方)发岗位 → 403(RecruiterGuard 角色门禁)
  r = await fetch(`${BASE}/recruiter/jobs`, { method: 'POST', headers: H, body: JSON.stringify({ title: 'x', competencies: [] }) });
  A(r.status === 403, `B端门禁:候选人发岗位 → 403(role=candidate 被 RecruiterGuard 拦)`);
  r = await fetch(`${BASE}/recruiter/jobs`, { headers: HR });
  b = await j(r);
  A(r.status === 200 && (b.jobs ?? []).some((x: any) => x.id === jobId), 'B端:招聘方看到自己的岗位');
  // 另一招聘方(RLS 租户隔离):看不到上面的岗位
  const recTok2 = (await j(await fetch(`${BASE}/auth/signup`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: `e2e_rec2_${process.env.E2E_TAG ?? 'run'}@x.com`, password, role: 'recruiter' }) }))).token;
  r = await fetch(`${BASE}/recruiter/jobs`, { headers: { authorization: `Bearer ${recTok2}` } });
  b = await j(r);
  A(r.status === 200 && !(b.jobs ?? []).some((x: any) => x.id === jobId), 'B端 RLS:另一招聘方看不到他人岗位(租户隔离 ✅)');
  r = await fetch(`${BASE}/recruiter/jobs/${jobId}`, { headers: { authorization: `Bearer ${recTok2}` } });
  A(r.status === 404, 'B端 RLS:越权取他人岗位 → 404');

  // 9. 候选人闭环(多方 RLS):候选人 user2 浏览开放岗位 → 投递 → 招聘方(rec)看到该候选人
  const r2 = await fetch(`${BASE}/auth/signup`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: `e2e2_${process.env.E2E_TAG ?? 'run'}@x.com`, password }) });
  const b2: any = await j(r2);
  const token2 = b2.token ?? (await j(await fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: `e2e2_${process.env.E2E_TAG ?? 'run'}@x.com`, password }) }))).token;
  const user2Id = JSON.parse(Buffer.from(token2.split('.')[0], 'base64').toString()).uid;   // 候选人 uid(跨方断言)
  const H2 = { 'content-type': 'application/json', authorization: `Bearer ${token2}` };
  r = await fetch(`${BASE}/jobs`, { headers: H2 });
  b = await j(r);
  A(r.status === 200 && (b.jobs ?? []).some((x: any) => x.id === jobId), '候选人:浏览开放岗位(公开可读)看到岗位');
  r = await fetch(`${BASE}/jobs/${jobId}/apply`, { method: 'POST', headers: H2, body: '{}' });
  b = await j(r);
  A(r.status === 200 && typeof b.applicationId === 'string', `候选人:投递岗位 → applicationId(${b.applicationId})`);
  const applicationId = b.applicationId;
  r = await fetch(`${BASE}/applications`, { headers: H2 });
  b = await j(r);
  A(r.status === 200 && (b.applications ?? []).some((x: any) => x.id === applicationId && x.status === 'invited'), '候选人:看到自己的投递(status=invited,非仅长度)');
  // 招聘方看到申请人(多方 RLS:**断言含 user2 本人**,非仅长度——修假覆盖)
  r = await fetch(`${BASE}/recruiter/jobs/${jobId}/candidates`, { headers: HR });
  b = await j(r);
  A(r.status === 200 && (b.candidates ?? []).some((x: any) => x.candidate_user_id === user2Id), `招聘方:看到该候选人本人(多方 RLS,candidate=${String(user2Id).slice(0, 8)})`);

  /* ════════ 专家评审全维度用例:异常 / 特殊 / 兜底 / 状态机 ════════ */
  // [异常] 额度不足 begin → 402(回归:曾被异常过滤 mask 成 500)
  const t3 = (await j(await fetch(`${BASE}/auth/signup`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: `e2e3_${process.env.E2E_TAG ?? 'run'}@x.com`, password }) }))).token;
  const H3 = { 'content-type': 'application/json', authorization: `Bearer ${t3}` };
  // Use a real, owner-bound UUID resume.  A placeholder such as `res-x` is
  // correctly rejected by the source-binding guard with 400 and therefore
  // cannot test the later entitlement boundary.
  r = await fetch(`${BASE}/privacy/consent`, { method: 'POST', headers: H3, body: JSON.stringify({ purpose: 'resume_processing' }) });
  A(r.status === 200, '[异常前置] 无额度用户仍可完成简历处理同意');
  r = await fetch(`${BASE}/resume`, { method: 'POST', headers: H3, body: JSON.stringify({ text: '合成后端工程师简历：三年分布式系统经验，熟悉 PostgreSQL、Redis、限流与消息队列。' }) });
  const noEntitlementResume = await j(r);
  A(r.status === 200 && typeof noEntitlementResume.resumeId === 'string', '[异常前置] 无额度用户持有合法且本人所属的 resumeId');
  const iv3 = (await j(await fetch(`${BASE}/interview`, { method: 'POST', headers: H3, body: '{}' }))).interviewId;
  r = await fetch(`${BASE}/interview/${iv3}/begin`, { method: 'POST', headers: { ...H3, 'resume-id': noEntitlementResume.resumeId }, body: '{}' });
  b = await j(r);
  A(r.status === 402 && b.error === 'insufficient_entitlement', '[异常] 额度不足 begin → 402 insufficient_entitlement（不再被 mask 成 500）');

  // [异常] 支付 webhook 错签 → 403;未知订单 → 404(验签 fail-closed + 不信调用方)
  const ord = await j(await fetch(`${BASE}/commerce/orders`, { method: 'POST', headers: { ...H, 'idempotency-key': `${email}:order2` }, body: JSON.stringify({ productId: 'pack_10' }) }));
  r = await fetch(`${BASE}/commerce/webhook/pay/${ord.orderId}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ providerTxn: 't', sig: 'deadbeef' }) });
  A(r.status === 403, '[异常] webhook 错误签名 → 403(验签 fail-closed)');
  const usig = createHmac('sha256', PAY_SECRET).update('nope:t:paid').digest('hex');
  r = await fetch(`${BASE}/commerce/webhook/pay/nope`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ providerTxn: 't', sig: usig }) });
  A(r.status === 404, '[异常] webhook 未知订单 → 404(查不到单不入账)');

  // [特殊] 重复投递 → 同 applicationId(幂等,UNIQUE(job_id,candidate))
  const apply2 = await j(await fetch(`${BASE}/jobs/${jobId}/apply`, { method: 'POST', headers: H2, body: '{}' }));
  A(apply2.applicationId === applicationId, '[特殊] 重复投递 → 同 applicationId(幂等不重复建)');
  // [B端可信] 岗位申请必须启动**新建且一对一绑定**的面试；历史练习面试不得拿来回填岗位。
  // user1(H)上面跑过一场真面试(interviewId,有真实 answer_evaluated 轮次)，这里特意验证它不能被复用。
  const user1Id = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString()).uid;
  const app1 = (await j(await fetch(`${BASE}/jobs/${jobId}/apply`, { method: 'POST', headers: H, body: '{}' }))).applicationId;
  // finalize 在没有绑定且没有完成前失败；客户端夹带历史 interviewId 则在 strict DTO 层被拒。
  r = await fetch(`${BASE}/applications/${app1}/finalize`, { method: 'POST', headers: H, body: '{}' });
  A(r.status === 409, '[防伪造] 未开始岗位绑定面试 finalize → 409(历史面试不可移花接木)');
  r = await fetch(`${BASE}/applications/${app1}/finalize`, { method: 'POST', headers: H, body: JSON.stringify({ interviewId }) });
  A(r.status === 400, '[防伪造] finalize 夹带历史 interviewId → 400(strict DTO 拒绝)');

  // 开始接口以 application + owned ingested resume 为唯一来源；返回的 ID 必须不同于历史练习会话。
  r = await fetch(`${BASE}/applications/${app1}/start`, { method: 'POST', headers: H, body: JSON.stringify({ resumeId }) });
  const started = await j(r);
  const boundInterviewId = started.interviewId;
  A(r.status === 200 && started.status === 'started' && typeof boundInterviewId === 'string' && boundInterviewId !== interviewId &&
    typeof started.redirectTo === 'string' && started.redirectTo.includes(boundInterviewId),
    `[状态机] start 原子创建岗位专属会话(${String(boundInterviewId).slice(0, 12)})并返回可信跳转`);
  // 重试 start 复用同一 binding，不能再创建会话。
  r = await fetch(`${BASE}/applications/${app1}/start`, { method: 'POST', headers: H, body: JSON.stringify({ resumeId }) });
  const reused = await j(r);
  A(r.status === 200 && reused.status === 'reused' && reused.interviewId === boundInterviewId,
    '[幂等] 重试岗位 start → reused 同一 interviewId(不重复建会话)');

  // 真 worker 跑岗位绑定会话至终态；答题只走服务端 canonical question 身份，不能靠客户端伪造评分。
  r = await fetch(`${BASE}/interview/${boundInterviewId}/begin`, { method: 'POST', headers: { ...H, 'resume-id': resumeId }, body: '{}' });
  A(r.status === 202, '[状态机] 岗位绑定会话 begin → 202');
  let bSeq = 0, bTurn = 0, bTerm = '', bQuestions = 0;
  let bQuestion: QuestionIdentity | null = null;
  const bStartedAt = Date.now();
  while (Date.now() - bStartedAt < INTERVIEW_TERMINAL_DEADLINE_MS) {
    const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 1200); let buf = '';
    try {
      const ev = await fetch(`${BASE}/interview/${boundInterviewId}/events`, { headers: { authorization: `Bearer ${token}`, ...(bSeq ? { 'last-event-id': String(bSeq) } : {}) }, signal: ac.signal });
      if (ev.status === 200 && ev.body) { const rd = ev.body.getReader(); const dec = new TextDecoder(); for (;;) { const { done, value } = await rd.read(); if (done) break; buf += dec.decode(value, { stream: true }); } }
    } catch { /* hold-and-tail abort is expected */ } finally { clearTimeout(t); }
    for (const m of buf.matchAll(/^id: (\d+)\nevent: (\w+)\ndata: (.*)$/gm)) {
      const seq = Number(m[1]), kind = m[2]; if (seq <= bSeq) continue; bSeq = seq;
      if (kind === 'question_ready') {
        bQuestions++;
        bQuestion = questionIdentity(JSON.parse(m[3]));
        const answer = '我会以幂等键、事务性 outbox、指数退避和可观测性保证分布式订单链路可恢复。';
        const tr = await fetch(`${BASE}/interview/${boundInterviewId}/turn`, { method: 'POST', headers: { ...H, 'idempotency-key': `${boundInterviewId}:question:${bQuestion.questionId}:answer:${bTurn}` }, body: JSON.stringify(answerBody(bQuestion, answer)) });
        A(tr.status === 202, '[状态机] 岗位 canonical /turn → 202');
        bTurn++;
      } else if (kind === 'clarification_needed') {
        bQuestion = questionIdentity(JSON.parse(m[3]));
        const answer = '跳过';
        const tr = await fetch(`${BASE}/interview/${boundInterviewId}/turn`, { method: 'POST', headers: { ...H, 'idempotency-key': `${boundInterviewId}:question:${bQuestion.questionId}:answer:${bTurn}` }, body: JSON.stringify(answerBody(bQuestion, answer)) });
        A(tr.status === 202, '[状态机] 岗位澄清 canonical /turn → 202'); bTurn++;
      } else if (['report_ready', 'report_unavailable', 'assessment_unavailable', 'interview_unavailable'].includes(kind)) bTerm = kind;
    }
    if (bTerm) break;
    await new Promise((rr) => setTimeout(rr, 1000));
  }
  A(bQuestions >= 1 && bTurn >= 1 && bTerm !== '', `[状态机] 岗位绑定会话经真 worker 到终态(${bTerm}; ${bQuestions} 题/${bTurn} 答)`);
  // 正常 UI 终态会调用这条同源 finalize；此处用真实 API 同样证明不带 interviewId 的幂等确认。
  r = await fetch(`${BASE}/applications/${app1}/finalize`, { method: 'POST', headers: H, body: '{}' });
  const finalized = await j(r);
  const scorelessBound = bTerm === 'assessment_unavailable';
  A(r.status === 200 && finalized.applicationId === app1 && finalized.interviewId === boundInterviewId
    && finalized.outcome === (scorelessBound ? 'assessment_unavailable' : 'completed'),
    `[状态机] 岗位终态后 {} finalize → 200，服务端仅认已绑定 interview(term=${bTerm}, outcome=${finalized.outcome ?? 'none'}, status=${r.status}, error=${finalized.error ?? 'none'})`);
  r = await fetch(`${BASE}/recruiter/jobs/${jobId}/candidates`, { headers: HR });
  b = await j(r);
  const cand = (b.candidates ?? []).find((x: any) => x.candidate_user_id === user1Id);
  if (scorelessBound) {
    A(cand?.status === 'assessment_unavailable' && cand.score === null,
      '[状态机·可信] 无评分证据时招聘方只见 assessment_unavailable + score=NULL（不伪造 0 分）');
    const retry = await fetch(`${BASE}/applications/${app1}/start`, { method: 'POST', headers: H, body: JSON.stringify({ resumeId }) });
    const retried = await j(retry);
    A(retry.status === 200 && retried.status === 'started' && typeof retried.interviewId === 'string' && retried.interviewId !== boundInterviewId,
      '[状态机·恢复] 评分不可用后显式重试创建新 attempt（旧会话不复活）');
  } else {
    A(cand?.status === 'completed' && Number.isInteger(cand?.score) && cand.score >= 0 && cand.score <= 100,
      `[状态机·可信] 招聘方看到 completed + **服务端推导**分数=${cand?.score}(非自报,跨方 RLS 可读)`);
  }

  console.log(`\n✓ E2E 全栈跑通(${pass} 断言,含异常/特殊/兜底/状态机):鉴权→简历→交易→面试(真agent)→报告→B端多租户→候选人多方RLS闭环 · 终态 ${terminal}`);
}
main().catch((e) => { console.error('E2E 失败:', e); process.exit(1); });

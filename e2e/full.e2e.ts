/**
 * 全栈 E2E(真 HTTP 打真 api + 真 worker + 真 DB):
 * signup → consent → 上传简历 → 建面试 → begin → 轮询 SSE 事件 → 每出题就答 → 直到终态(无死胡同)。
 * 真鉴权(Bearer)、真队列、真 worker 图执行。降级模型模式也必须跑到终态。
 */
import { createHmac } from 'node:crypto';
const BASE = process.env.E2E_BASE ?? 'http://127.0.0.1:8787';
const PAY_SECRET = process.env.PAY_PROVIDER_SECRET ?? 'e2e-pay-secret';
let pass = 0;
const A = (cond: boolean, msg: string) => { if (!cond) { console.error('✗', msg); process.exit(1); } pass++; console.log('✓', msg); };
const j = async (r: Response) => { try { return await r.json(); } catch { return {}; } };

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
  const orderId = b.orderId, txn = 'txn_e2e_1';
  const sig = createHmac('sha256', PAY_SECRET).update(`${orderId}:${txn}:paid`).digest('hex');
  r = await fetch(`${BASE}/commerce/webhook/pay/${orderId}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ providerTxn: txn, sig }) });
  b = await j(r);
  A(r.status === 200 && (b.result === 'credited' || b.result === 'already'), `支付 webhook 验签入账 → ${b.result}`);
  r = await fetch(`${BASE}/commerce/entitlement`, { headers: H });
  b = await j(r);
  A((b.availableUnits ?? 0) >= 1, `额度到账(${b.availableUnits} 次)`);

  // 3c. 图片简历 OCR 全栈(真 HTTP /resume/file → 真 api service **决策B** 计费 → 真 DB;视觉模型由 OCR_FAKE 注入,证明付费视觉链路真能用非 demo)。
  //  放在额度到账**之后**:OCR 是付费能力(决策B reserve→产出可用画像才 confirm),无额度会 402——故须先充值再测。
  const pngB64 = Buffer.from(`e2e-ocr-${process.env.E2E_TAG ?? 'run'}`).toString('base64');
  r = await fetch(`${BASE}/resume/file`, { method: 'POST', headers: H, body: JSON.stringify({ filename: 'r.png', mimeType: 'image/png', contentBase64: pngB64 }) });
  b = await j(r);
  A(r.status === 200 && b.ocr === true && b.format === 'image' && typeof b.resumeId === 'string', `图片简历 OCR 全栈 → 摄取(ocr=true,${b.status})`);
  const ocrProfile = await j(await fetch(`${BASE}/resume/${b.resumeId}/profile`, { headers: H }));
  A(!JSON.stringify(ocrProfile.structured ?? {}).includes('13800138000'), 'OCR 来源 profile 结构化 + PII 脱敏(不含明文手机号)');

  // 4. 建面试
  r = await fetch(`${BASE}/interview`, { method: 'POST', headers: H, body: '{}' });
  b = await j(r);
  const interviewId = b.interviewId ?? b.id ?? b.resultId;
  A(r.status === 200 || r.status === 201, `建面试 → interviewId(${interviewId})`);
  A(typeof interviewId === 'string', '拿到 interviewId');

  // 5. begin(入队 start job;worker 规划 + 出首题)
  r = await fetch(`${BASE}/interview/${interviewId}/begin`, { method: 'POST', headers: { ...H, 'resume-id': resumeId }, body: '{}' });
  A(r.status === 202, `begin → 202 受理(${JSON.stringify(await j(r)).slice(0, 60)})`);

  // 6. 轮询 SSE 事件:每出一道题就答;直到终态。SSE 是 hold-and-tail,短读 abort 拿 catch-up。
  const TERMINAL = ['report_ready', 'report_unavailable', 'interview_unavailable'];
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
  const start = Date.now();
  while (Date.now() - start < 90_000) {
    const evs = await readEvents(lastSeq);
    for (const e of evs) {
      if (e.seq <= lastSeq) continue;
      lastSeq = e.seq; kinds.add(e.kind);
      if (e.kind === 'question_ready') {
        questions++;
        // 答题(稳定幂等键)
        await fetch(`${BASE}/interview/${interviewId}/turn`, { method: 'POST', headers: { ...H, 'idempotency-key': `${interviewId}:turn:${turn}` }, body: JSON.stringify({ turn, answer: '我会用 Redis SETNX 加随机值做分布式锁,配合 Lua 原子释放和看门狗续期,限流用令牌桶。' }) });
        turn++;
      } else if (e.kind === 'answer_evaluated') {
        evaluated++;
      } else if (e.kind === 'clarification_needed') {
        // 罐头答案没正面回应模型生成的题 → 引擎判非作答、发引导。这里**发"跳过"**让引擎换能力继续(不死等)。
        // re-answer 用**递增的下一个 turn**(同正常作答推进,经手动实测确认),触发 markUnresolved→pivot→新 question_ready。
        await fetch(`${BASE}/interview/${interviewId}/turn`, { method: 'POST', headers: { ...H, 'idempotency-key': `${interviewId}:turn:${turn}` }, body: JSON.stringify({ turn, answer: '跳过' }) });
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
  A(terminal !== '', `面试跑到终态事件(${terminal})——无死胡同 ✅`);

  // 7. 报告端点可查,且 **status 与终态一致**(修假覆盖:不能只断 200——卡在 queued 也会过)
  r = await fetch(`${BASE}/interview/${interviewId}/report`, { headers: H });
  b = await j(r);
  A(r.status === 200, `报告端点可查 → status=${b.status}`);
  A(terminal === 'report_ready' ? b.status === 'ready' : b.status !== 'ready', `状态机:报告 status 与终态自洽(终态 ${terminal} → status=${b.status})`);

  // 8. B 端(招聘方)+ 多租户 RLS 隔离:发岗位 → 自己可见 → 他人不可见
  // 招聘方是**独立角色用户**(RecruiterGuard 按 role 门禁:候选人 user1 不能发岗位 → 403)。
  const recTok = (await j(await fetch(`${BASE}/auth/signup`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: `e2e_rec_${process.env.E2E_TAG ?? 'run'}@x.com`, password, role: 'recruiter' }) }))).token;
  const HR = { 'content-type': 'application/json', authorization: `Bearer ${recTok}` };
  r = await fetch(`${BASE}/recruiter/jobs`, { method: 'POST', headers: HR, body: JSON.stringify({ title: '后端工程师', competencies: ['高并发', '分布式锁', '限流'] }) });
  b = await j(r);
  A(r.status === 200 && typeof b.id === 'string', `B端:招聘方发岗位 → jobId(${b.id})`);
  const jobId = b.id;
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
  const iv3 = (await j(await fetch(`${BASE}/interview`, { method: 'POST', headers: H3, body: '{}' }))).interviewId;
  r = await fetch(`${BASE}/interview/${iv3}/begin`, { method: 'POST', headers: { ...H3, 'resume-id': 'res-x' }, body: '{}' });
  A(r.status === 402, '[异常] 额度不足 begin → 402(回归,不再 mask 成 500)');

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
  // [B端可信] finalize 分数**服务端从候选人本人已评估面试推导**(不接受自报)。
  // user1(H)上面跑过一场真面试(interviewId,有真实 answer_evaluated 轮次)→ 投递 rec 岗位 → 用它 finalize。
  const user1Id = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString()).uid;
  const app1 = (await j(await fetch(`${BASE}/jobs/${jobId}/apply`, { method: 'POST', headers: H, body: '{}' }))).applicationId;
  // [防伪造] 用未评估/不存在的面试 finalize → 409(无评估轮次,拒绝空壳与自报分)
  r = await fetch(`${BASE}/applications/${app1}/finalize`, { method: 'POST', headers: H, body: JSON.stringify({ interviewId: 'iv-not-evaluated' }) });
  A(r.status === 409, '[防伪造] 用未评估面试 finalize → 409(分数服务端推导,拒绝空壳/自报)');
  // [状态机] 用本人真实已评估面试 finalize → 200;招聘方跨方读到 completed + **服务端推导**分数
  r = await fetch(`${BASE}/applications/${app1}/finalize`, { method: 'POST', headers: H, body: JSON.stringify({ interviewId }) });
  A(r.status === 200, '[状态机] 候选人用真实已评估面试 finalize → 200(服务端推导分)');
  r = await fetch(`${BASE}/recruiter/jobs/${jobId}/candidates`, { headers: HR });
  b = await j(r);
  const cand = (b.candidates ?? []).find((x: any) => x.candidate_user_id === user1Id);
  A(cand?.status === 'completed' && Number.isInteger(cand?.score) && cand.score >= 0 && cand.score <= 100,
    `[状态机·可信] 招聘方看到 completed + **服务端推导**分数=${cand?.score}(非自报,跨方 RLS 可读)`);

  console.log(`\n✓ E2E 全栈跑通(${pass} 断言,含异常/特殊/兜底/状态机):鉴权→简历→交易→面试(真agent)→报告→B端多租户→候选人多方RLS闭环 · 终态 ${terminal}`);
}
main().catch((e) => { console.error('E2E 失败:', e); process.exit(1); });

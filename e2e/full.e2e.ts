/**
 * 全栈 E2E(真 HTTP 打真 api + 真 worker + 真 DB):
 * signup → consent → 上传简历 → 建面试 → begin → 轮询 SSE 事件 → 每出题就答 → 直到终态(无死胡同)。
 * 真鉴权(Bearer)、真队列、真 worker 图执行。假模型/假语音/假 OCR 开关会使 runner 失败。
 *
 * 场景编排在本文件；HTTP / 鉴权 / 交易 / SSE / 面试循环 / 语音网关在 e2e/helpers。
 * 运行器仍由 scripts/run-e2e.mjs 强制隔离 + 真实供应商 Key，禁止 VOICE_FAKE/OCR_FAKE/E2E_FAKE_MODEL。
 */
import { createHmac, randomUUID } from 'node:crypto';
import { liveOcrResumePngBase64 } from './ocr-fixture.ts';
import { createAssert } from './helpers/assert.ts';
import { signupOrLogin, uidFromToken } from './helpers/auth.ts';
import { createOrder, entitlement, payWebhook } from './helpers/commerce.ts';
import { BASE, PAY_SECRET, readJson } from './helpers/http.ts';
import { driveInterviewToTerminal } from './helpers/interview.ts';
import { pollTerminal } from './helpers/sse.ts';
import { callLiveVoiceGateway } from './helpers/voice.ts';

const { A, passed } = createAssert();

async function main() {
  const tag = process.env.E2E_TAG ?? 'run';
  const email = `e2e_${tag}@x.com`;
  const password = 'strongpw123';

  // 1. 注册(或已存在则登录)→ 真 Bearer 令牌
  const session = await signupOrLogin(email, password);
  A(typeof session.token === 'string', '注册/登录 → 真 Bearer 令牌');
  const { token, headers: H } = session;

  // 2. PIPL 采集同意(上传简历前置)
  let r = await fetch(`${BASE}/privacy/consent`, { method: 'POST', headers: H, body: JSON.stringify({ purpose: 'resume_processing' }) });
  A(r.status === 200, 'PIPL 采集同意 → 200');

  // 3. 上传简历(加密落库 + 结构化 + PII 脱敏)
  r = await fetch(`${BASE}/resume`, { method: 'POST', headers: H, body: JSON.stringify({ text: '后端工程师 3 年。负责高并发订单系统,用 Redis 做分布式锁与限流,MySQL 分库分表,消息队列削峰。' }) });
  let b: any = await readJson(r);
  A(r.status === 200 && typeof b.resumeId === 'string', `上传简历 → resumeId(${b.status})`);
  const resumeId = b.resumeId;

  // 3b. 买面试包(真 commerce:下单 → HMAC 验签 webhook 入账 → 额度)
  const ordered = await createOrder(H, 'pack_10', `${email}:order`);
  A(ordered.response.status === 200 && typeof ordered.body.orderId === 'string', `下单 pack_10 → orderId(${ordered.body.amountCents}分)`);
  const txn = `txn_e2e_${tag}_${Date.now()}`;
  const paid = await payWebhook(ordered.body.orderId, txn);
  A(paid.response.status === 200 && (paid.body.result === 'credited' || paid.body.result === 'already'), `支付 webhook 验签入账 → ${paid.body.result}`);
  const units = await entitlement(H);
  A((units.availableUnits ?? 0) >= 1, `额度到账(${units.availableUnits} 次)`);

  // 3c. 图片简历 OCR 全栈：真 HTTP → 真百炼视觉模型 → 计费状态机 → 真 DB。
  const beforeOcr = await entitlement(H);
  const pngB64 = liveOcrResumePngBase64();
  r = await fetch(`${BASE}/resume/file`, { method: 'POST', headers: H, body: JSON.stringify({ filename: 'r.png', mimeType: 'image/png', contentBase64: pngB64 }) });
  b = await readJson(r);
  A(r.status === 200 && b.ocr === true && b.format === 'image' && typeof b.resumeId === 'string',
    `图片简历 OCR 全栈 → 摄取(status=${r.status}, outcome=${b.error ?? b.reason ?? 'ok'})`);
  const ocrProfile = await readJson(await fetch(`${BASE}/resume/${b.resumeId}/profile`, { headers: H }));
  const structuredOcr = JSON.stringify(ocrProfile.structured ?? {});
  A(Number.isInteger(b.chars) && b.chars >= 20 && ocrProfile.status === 'needs_review' && !structuredOcr.includes('13800138000')
    && /redis|postgresql|typescript|backend/i.test(structuredOcr),
  `OCR 来源产出可复核画像(${b.chars} chars)、识别至少 1 个非敏感技能且 PII 脱敏(不含明文手机号)`);
  const afterOcr = await entitlement(H);
  A(afterOcr.availableUnits === beforeOcr.availableUnits - 1, 'OCR 成功只确认扣减 1 个额度');
  const duplicateOcr = await fetch(`${BASE}/resume/file`, { method: 'POST', headers: H, body: JSON.stringify({ filename: 'r-repeat.png', mimeType: 'image/png', contentBase64: pngB64 }) });
  const duplicateOcrBody = await readJson(duplicateOcr);
  const afterDuplicateOcr = await entitlement(H);
  A(duplicateOcr.status === 409 && duplicateOcrBody.error === 'ocr_duplicate' && afterDuplicateOcr.availableUnits === afterOcr.availableUnits,
    '同图重传 → 409 且额度不再扣减');

  // 4. 建面试
  r = await fetch(`${BASE}/interview`, { method: 'POST', headers: H, body: '{}' });
  b = await readJson(r);
  const interviewId = b.interviewId ?? b.id ?? b.resultId;
  A(r.status === 200 || r.status === 201, `建面试 → interviewId(${interviewId})`);
  A(typeof interviewId === 'string', '拿到 interviewId');

  // 4a. 真实双向语音闭环：百炼 TTS 先播报一条题目，再将返回的 WAV 原样交给百炼 ASR。
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
  A(r.status === 202, `begin → 202 受理(${JSON.stringify(await readJson(r)).slice(0, 60)})`);

  // 6. 轮询 SSE：每出一道题就答；直到终态。答题只走服务端发放的 question identity。
  const interviewStartedAt = Date.now();
  const mainLoop = await driveInterviewToTerminal({
    interviewId,
    token,
    headers: H,
    assert: A,
    questionAnswer: '我会用 Redis SETNX 加随机值做分布式锁,配合 Lua 原子释放和看门狗续期,限流用令牌桶。',
    questionAcceptedLabel: (n) => `第 ${n} 题 canonical /turn → 202`,
    clarificationAcceptedLabel: '澄清后的 canonical /turn → 202',
    staleReplayLabel: '已消费 question identity 重放 → 409 stale_question（不双写/不二次扣费）',
    replayConsumedAfterFirstTurn: true,
  });
  const { terminal, questions, turns: turn, lastSeq, kinds } = mainLoop;
  A(questions >= 1, `至少出了 1 道题(实际 ${questions} 道;事件:${[...kinds].join(',')})`);
  A(turn >= 1, `至少答了 1 题(${turn} 次)`);
  if (!terminal) {
    const diagnostic = await readJson(await fetch(`${BASE}/interview/${interviewId}/report`, { headers: H }));
    console.error(`E2E_INTERVIEW_TERMINAL_TIMEOUT interview=${interviewId} elapsedMs=${Date.now() - interviewStartedAt} lastSeq=${lastSeq} questions=${questions} turns=${turn} events=${[...kinds].join(',')} reportStatus=${String(diagnostic.status ?? 'unknown')}`);
  }
  A(terminal !== '', `面试跑到终态事件(${terminal})——无死胡同 ✅`);

  // 7. 报告端点可查,且 status 与终态一致(不能只断 200——卡在 queued 也会过)
  r = await fetch(`${BASE}/interview/${interviewId}/report`, { headers: H });
  b = await readJson(r);
  A(r.status === 200, `报告端点可查 → status=${b.status}`);
  A(terminal === 'report_ready' ? b.status === 'ready' : b.status !== 'ready', `状态机:报告 status 与终态自洽(终态 ${terminal} → status=${b.status})`);

  // 7a. 报告失败隔离: isolated worker 在第二份报告注入故障后必须落到 report_unavailable。
  {
    const cr = await readJson(await fetch(`${BASE}/interview`, { method: 'POST', headers: H, body: '{}' }));
    const failIv = cr.interviewId ?? cr.id ?? cr.resultId;
    A(typeof failIv === 'string', `[兜底] 建失败测试面试 → id(${failIv})`);
    const bg = await fetch(`${BASE}/interview/${failIv}/begin`, { method: 'POST', headers: { ...H, 'resume-id': resumeId }, body: '{}' });
    A(bg.status === 202, '[兜底] 失败测试面试 begin → 202');
    const failLoop = await driveInterviewToTerminal({
      interviewId: failIv,
      token,
      headers: H,
      assert: A,
      questionAnswer: '我用 Redis 令牌桶限流，Lua 原子释放锁。',
      questionAcceptedLabel: () => '[兜底] canonical /turn → 202',
      clarificationAcceptedLabel: '[兜底] 澄清 canonical /turn → 202',
    });
    const rep = await readJson(await fetch(`${BASE}/interview/${failIv}/report`, { headers: H }));
    A(failLoop.terminal === 'report_unavailable' && rep.status === 'quarantined',
      `[兜底] 报告失败 → report_unavailable + quarantined(无死胡同;终态=${failLoop.terminal || 'none'}, status=${rep.status ?? 'none'})`);
  }

  // 7b. 押题 + 诊断全栈(真 HTTP → worker 消费 → 图执行 → 终态,无死胡同)。
  let qz: any = await readJson(await fetch(`${BASE}/quiz`, { method: 'POST', headers: H, body: '{}' }));
  const quizId = qz.id ?? qz.quizId;
  A(typeof quizId === 'string', `押题:建 → id(${quizId})`);
  r = await fetch(`${BASE}/quiz/${quizId}/begin`, { method: 'POST', headers: { ...H, 'resume-id': resumeId }, body: '{}' });
  A(r.status === 202, '押题:begin → 202 受理');
  const quizTerm = await pollTerminal(`/quiz/${quizId}`, token, ['quiz_ready', 'quiz_unavailable', 'error']);
  A(quizTerm !== '', `押题:跑到终态(${quizTerm})——无死胡同 ✅`);
  let dg: any = await readJson(await fetch(`${BASE}/diagnosis`, { method: 'POST', headers: H, body: '{}' }));
  const diagId = dg.id ?? dg.diagnosisId;
  A(typeof diagId === 'string', `诊断:建 → id(${diagId})`);
  r = await fetch(`${BASE}/diagnosis/${diagId}/begin`, { method: 'POST', headers: { ...H, 'resume-id': resumeId }, body: '{}' });
  A(r.status === 202, '诊断:begin → 202 受理');
  const diagTerm = await pollTerminal(`/diagnosis/${diagId}`, token, ['diagnosis_ready', 'diagnosis_unavailable', 'error']);
  A(diagTerm !== '', `诊断:跑到终态(${diagTerm})——无死胡同 ✅`);

  // 8. B 端(招聘方)+ 多租户 RLS 隔离:发岗位 → 自己可见 → 他人不可见
  const recruiter = await signupOrLogin(`e2e_rec_${tag}@x.com`, password, 'recruiter');
  const HR = recruiter.headers;
  r = await fetch(`${BASE}/recruiter/jobs`, { method: 'POST', headers: HR, body: JSON.stringify({ title: '后端工程师', competencies: ['高并发', '分布式锁', '限流'] }) });
  b = await readJson(r);
  A(r.status === 200 && typeof b.id === 'string', `B端:招聘方发岗位 → jobId(${b.id})`);
  const jobId = b.id;
  const createJobKey = `e2e-job-${tag}-${randomUUID()}`;
  const createJobBody = { title: '幂等岗位', competencies: ['幂等', 'outbox'] };
  const idempotentOne = await readJson(await fetch(`${BASE}/recruiter/jobs`, { method: 'POST', headers: { ...HR, 'idempotency-key': createJobKey }, body: JSON.stringify(createJobBody) }));
  const duplicateJob = await readJson(await fetch(`${BASE}/recruiter/jobs`, { method: 'POST', headers: { ...HR, 'idempotency-key': createJobKey }, body: JSON.stringify(createJobBody) }));
  A(typeof idempotentOne.id === 'string' && duplicateJob.id === idempotentOne.id, 'B端:同 idempotency-key 重试复用同一岗位(不重复创建)');
  r = await fetch(`${BASE}/recruiter/jobs`, { method: 'POST', headers: { ...HR, 'idempotency-key': createJobKey }, body: JSON.stringify({ ...createJobBody, title: '冲突岗位' }) });
  A(r.status === 409, 'B端:同 idempotency-key 换载荷 → 409(不静默覆盖/重复创建)');
  r = await fetch(`${BASE}/recruiter/jobs`, { method: 'POST', headers: H, body: JSON.stringify({ title: 'x', competencies: [] }) });
  A(r.status === 403, `B端门禁:候选人发岗位 → 403(role=candidate 被 RecruiterGuard 拦)`);
  r = await fetch(`${BASE}/recruiter/jobs`, { headers: HR });
  b = await readJson(r);
  A(r.status === 200 && (b.jobs ?? []).some((x: any) => x.id === jobId), 'B端:招聘方看到自己的岗位');
  const recruiter2 = await signupOrLogin(`e2e_rec2_${tag}@x.com`, password, 'recruiter');
  r = await fetch(`${BASE}/recruiter/jobs`, { headers: { authorization: `Bearer ${recruiter2.token}` } });
  b = await readJson(r);
  A(r.status === 200 && !(b.jobs ?? []).some((x: any) => x.id === jobId), 'B端 RLS:另一招聘方看不到他人岗位(租户隔离 ✅)');
  r = await fetch(`${BASE}/recruiter/jobs/${jobId}`, { headers: { authorization: `Bearer ${recruiter2.token}` } });
  A(r.status === 404, 'B端 RLS:越权取他人岗位 → 404');

  // 9. 候选人闭环(多方 RLS)
  const candidate2 = await signupOrLogin(`e2e2_${tag}@x.com`, password);
  const token2 = candidate2.token;
  const user2Id = uidFromToken(token2);
  const H2 = candidate2.headers;
  r = await fetch(`${BASE}/jobs`, { headers: H2 });
  b = await readJson(r);
  A(r.status === 200 && (b.jobs ?? []).some((x: any) => x.id === jobId), '候选人:浏览开放岗位(公开可读)看到岗位');
  r = await fetch(`${BASE}/jobs/${jobId}/apply`, { method: 'POST', headers: H2, body: '{}' });
  b = await readJson(r);
  A(r.status === 200 && typeof b.applicationId === 'string', `候选人:投递岗位 → applicationId(${b.applicationId})`);
  const applicationId = b.applicationId;
  r = await fetch(`${BASE}/applications`, { headers: H2 });
  b = await readJson(r);
  A(r.status === 200 && (b.applications ?? []).some((x: any) => x.id === applicationId && x.status === 'invited'), '候选人:看到自己的投递(status=invited,非仅长度)');
  r = await fetch(`${BASE}/recruiter/jobs/${jobId}/candidates`, { headers: HR });
  b = await readJson(r);
  A(r.status === 200 && (b.candidates ?? []).some((x: any) => x.candidate_user_id === user2Id), `招聘方:看到该候选人本人(多方 RLS,candidate=${String(user2Id).slice(0, 8)})`);

  /* ════════ 专家评审全维度用例:异常 / 特殊 / 兜底 / 状态机 ════════ */
  const noEntitlement = await signupOrLogin(`e2e3_${tag}@x.com`, password);
  const H3 = noEntitlement.headers;
  r = await fetch(`${BASE}/privacy/consent`, { method: 'POST', headers: H3, body: JSON.stringify({ purpose: 'resume_processing' }) });
  A(r.status === 200, '[异常前置] 无额度用户仍可完成简历处理同意');
  r = await fetch(`${BASE}/resume`, { method: 'POST', headers: H3, body: JSON.stringify({ text: '合成后端工程师简历：三年分布式系统经验，熟悉 PostgreSQL、Redis、限流与消息队列。' }) });
  const noEntitlementResume = await readJson(r);
  A(r.status === 200 && typeof noEntitlementResume.resumeId === 'string', '[异常前置] 无额度用户持有合法且本人所属的 resumeId');
  const iv3 = (await readJson(await fetch(`${BASE}/interview`, { method: 'POST', headers: H3, body: '{}' }))).interviewId;
  r = await fetch(`${BASE}/interview/${iv3}/begin`, { method: 'POST', headers: { ...H3, 'resume-id': noEntitlementResume.resumeId }, body: '{}' });
  b = await readJson(r);
  A(r.status === 402 && b.error === 'insufficient_entitlement', '[异常] 额度不足 begin → 402 insufficient_entitlement（不再被 mask 成 500）');

  const { response: order2Res, body: ord } = await createOrder(H, 'pack_10', `${email}:order2`);
  A(order2Res.status === 200 && typeof ord.orderId === 'string', '[异常前置] 第二笔订单可用于错签断言');
  r = await fetch(`${BASE}/commerce/webhook/pay/${ord.orderId}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ providerTxn: 't', sig: 'deadbeef' }) });
  A(r.status === 403, '[异常] webhook 错误签名 → 403(验签 fail-closed)');
  const usig = createHmac('sha256', PAY_SECRET).update('nope:t:paid').digest('hex');
  r = await fetch(`${BASE}/commerce/webhook/pay/nope`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ providerTxn: 't', sig: usig }) });
  A(r.status === 404, '[异常] webhook 未知订单 → 404(查不到单不入账)');

  const apply2 = await readJson(await fetch(`${BASE}/jobs/${jobId}/apply`, { method: 'POST', headers: H2, body: '{}' }));
  A(apply2.applicationId === applicationId, '[特殊] 重复投递 → 同 applicationId(幂等不重复建)');
  const user1Id = uidFromToken(token);
  const app1 = (await readJson(await fetch(`${BASE}/jobs/${jobId}/apply`, { method: 'POST', headers: H, body: '{}' }))).applicationId;
  r = await fetch(`${BASE}/applications/${app1}/finalize`, { method: 'POST', headers: H, body: '{}' });
  A(r.status === 409, '[防伪造] 未开始岗位绑定面试 finalize → 409(历史面试不可移花接木)');
  r = await fetch(`${BASE}/applications/${app1}/finalize`, { method: 'POST', headers: H, body: JSON.stringify({ interviewId }) });
  A(r.status === 400, '[防伪造] finalize 夹带历史 interviewId → 400(strict DTO 拒绝)');

  r = await fetch(`${BASE}/applications/${app1}/start`, { method: 'POST', headers: H, body: JSON.stringify({ resumeId }) });
  const started = await readJson(r);
  const boundInterviewId = started.interviewId;
  A(r.status === 200 && started.status === 'started' && typeof boundInterviewId === 'string' && boundInterviewId !== interviewId &&
    typeof started.redirectTo === 'string' && started.redirectTo.includes(boundInterviewId),
    `[状态机] start 原子创建岗位专属会话(${String(boundInterviewId).slice(0, 12)})并返回可信跳转`);
  r = await fetch(`${BASE}/applications/${app1}/start`, { method: 'POST', headers: H, body: JSON.stringify({ resumeId }) });
  const reused = await readJson(r);
  A(r.status === 200 && reused.status === 'reused' && reused.interviewId === boundInterviewId,
    '[幂等] 重试岗位 start → reused 同一 interviewId(不重复建会话)');

  r = await fetch(`${BASE}/interview/${boundInterviewId}/begin`, { method: 'POST', headers: { ...H, 'resume-id': resumeId }, body: '{}' });
  A(r.status === 202, '[状态机] 岗位绑定会话 begin → 202');
  const boundLoop = await driveInterviewToTerminal({
    interviewId: boundInterviewId,
    token,
    headers: H,
    assert: A,
    questionAnswer: '我会以幂等键、事务性 outbox、指数退避和可观测性保证分布式订单链路可恢复。',
    questionAcceptedLabel: () => '[状态机] 岗位 canonical /turn → 202',
    clarificationAcceptedLabel: '[状态机] 岗位澄清 canonical /turn → 202',
  });
  A(boundLoop.questions >= 1 && boundLoop.turns >= 1 && boundLoop.terminal !== '', `[状态机] 岗位绑定会话经真 worker 到终态(${boundLoop.terminal}; ${boundLoop.questions} 题/${boundLoop.turns} 答)`);
  r = await fetch(`${BASE}/applications/${app1}/finalize`, { method: 'POST', headers: H, body: '{}' });
  const finalized = await readJson(r);
  const scorelessBound = boundLoop.terminal === 'assessment_unavailable';
  A(r.status === 200 && finalized.applicationId === app1 && finalized.interviewId === boundInterviewId
    && finalized.outcome === (scorelessBound ? 'assessment_unavailable' : 'completed'),
    `[状态机] 岗位终态后 {} finalize → 200，服务端仅认已绑定 interview(term=${boundLoop.terminal}, outcome=${finalized.outcome ?? 'none'}, status=${r.status}, error=${finalized.error ?? 'none'})`);
  r = await fetch(`${BASE}/recruiter/jobs/${jobId}/candidates`, { headers: HR });
  b = await readJson(r);
  const cand = (b.candidates ?? []).find((x: any) => x.candidate_user_id === user1Id);
  if (scorelessBound) {
    A(cand?.status === 'assessment_unavailable' && cand.score === null,
      '[状态机·可信] 无评分证据时招聘方只见 assessment_unavailable + score=NULL（不伪造 0 分）');
    const retry = await fetch(`${BASE}/applications/${app1}/start`, { method: 'POST', headers: H, body: JSON.stringify({ resumeId }) });
    const retried = await readJson(retry);
    A(retry.status === 200 && retried.status === 'started' && typeof retried.interviewId === 'string' && retried.interviewId !== boundInterviewId,
      '[状态机·恢复] 评分不可用后显式重试创建新 attempt（旧会话不复活）');
  } else {
    A(cand?.status === 'completed' && Number.isInteger(cand?.score) && cand.score >= 0 && cand.score <= 100,
      `[状态机·可信] 招聘方看到 completed + **服务端推导**分数=${cand?.score}(非自报,跨方 RLS 可读)`);
  }

  console.log(`\n✓ E2E 全栈跑通(${passed()} 断言,含异常/特殊/兜底/状态机):鉴权→简历→交易→面试(真agent)→报告→B端多租户→候选人多方RLS闭环 · 终态 ${terminal}`);
}
main().catch((e) => { console.error('E2E 失败:', e); process.exit(1); });

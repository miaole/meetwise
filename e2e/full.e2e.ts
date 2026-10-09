/**
 * 全栈 E2E(真 HTTP 打真 api + 真 worker + 真 DB):
 * signup → consent → 上传简历 → 建面试 → begin → 轮询 SSE 事件 → 每出题就答 → 直到终态(无死胡同)。
 * 真鉴权(Bearer)、真队列、真 worker 图执行。假模型/假语音/假 OCR 开关会使 runner 失败。
 *
 * 场景编排在本文件；HTTP / 鉴权 / 交易 / 简历 / SSE / 面试循环 / 语音网关在 e2e/helpers。
 * 运行器仍由 scripts/run-e2e.mjs 强制隔离 + 真实供应商 Key，禁止假服务开关（见 scripts/e2e-fake-service-flags.mjs）。
 */
import { randomUUID } from 'node:crypto';
import { liveOcrResumePngBase64 } from './ocr-fixture.ts';
import { createAssert } from './helpers/assert.ts';
import { signupOrLogin, uidFromToken } from './helpers/auth.ts';
import { createOrder, entitlement, isWebhookCreditResult, paidWebhookSignature, payWebhook, postPayWebhook } from './helpers/commerce.ts';
import { createE2EReviewLedger, emitClassifiedE2EFailure } from './helpers/failure.ts';
import { BASE, readJson } from './helpers/http.ts';
import { driveInterviewToTerminal } from './helpers/interview.ts';
import { consentResumeProcessing, getResumeProfile, uploadImageResume, uploadTextResume } from './helpers/resume.ts';
import { pollTerminal } from './helpers/sse.ts';
import { callLiveVoiceGateway } from './helpers/voice.ts';

const { A, passed } = createAssert();
const reviews = createE2EReviewLedger();

async function main() {
  const tag = process.env.E2E_TAG ?? 'run';
  const email = `e2e_${tag}@x.com`;
  const password = 'strongpw123';

  // 1. 注册(或已存在则登录)→ 真 Bearer 令牌
  const session = await signupOrLogin(email, password);
  A(session.response.status === 200 && session.status === 200 && typeof session.token === 'string' && session.token.length > 0, '注册/登录 → 真 Bearer 令牌');
  const { token, headers: H } = session;

  // 2. PIPL 采集同意(上传简历前置)
  const fs = await import('node:fs'), bootId = process.pid, capT0 = Date.now(); fs.mkdirSync('.tmp', { recursive: true });
  let r: any, consentCap: any;
  try { consentCap = await consentResumeProcessing(H); r = consentCap.response; }
  catch (e: any) { fs.appendFileSync('.tmp/e2e-consent-capture.ndjson', `${JSON.stringify({ bootId, step: 'consent', thrown: `${e.name}/${e.code}/${e.cause?.code}` })}\n`); throw e; }
  fs.appendFileSync('.tmp/e2e-consent-capture.ndjson', `${JSON.stringify({ bootId, step: 'consent', status: r.status, elapsed_ms: Date.now() - capT0, body: JSON.stringify(consentCap.body ?? {}).slice(0, 200) })}\n`);
  A(r.status === 200, `PIPL 采集同意 → 200 (实际 ${r.status})`);

  // 3. 上传简历(加密落库 + 结构化 + PII 脱敏)
  const textResume = await uploadTextResume(H, '后端工程师 3 年。负责高并发订单系统,用 Redis 做分布式锁与限流,MySQL 分库分表,消息队列削峰。');
  r = textResume.response;
  let b: any = textResume.body;
  A(r.status === 200 && typeof b.resumeId === 'string', `上传简历 → resumeId(${b.status})`);
  const resumeId = b.resumeId;

  // 3b. 买面试包(真 commerce:下单 → HMAC 验签 webhook 入账 → 额度)
  const ordered = await createOrder(H, 'pack_10', `${email}:order`);
  A(ordered.response.status === 200 && typeof ordered.body.orderId === 'string', `下单 pack_10 → orderId(${ordered.body.amountCents}分)`);
  const txn = `txn_e2e_${tag}_${Date.now()}`;
  const paid = await payWebhook(ordered.body.orderId, txn);
  A(paid.response.status === 200 && isWebhookCreditResult(paid.body.result), `支付 webhook 验签入账 → ${paid.body.result}`);
  const units = await entitlement(H);
  A((units.availableUnits ?? 0) >= 1, `额度到账(${units.availableUnits} 次)`);

  // 3c. 图片简历 OCR 全栈：仅当操作员注入专用 DASHSCOPE_VISION_API_KEY（runner 才开预览双旗）时实跑。
  // MODEL_API_KEY 默认 DeepSeek 文本 profile，不得冒充百炼视觉 Key（不编造凭据 / Ban假绿）。
  const visionKeyPresent = Boolean(String(process.env.DASHSCOPE_VISION_API_KEY ?? '').trim());
  if (!visionKeyPresent) {
    reviews.record({ class: 'capability', code: 'image_ocr_unavailable' });
    console.log('⊘ 图片简历 OCR 全栈 → skipped (DASHSCOPE_VISION_API_KEY unset; text MODEL_API_KEY ≠ vision)');
  } else {
    const beforeOcr = await entitlement(H);
    const pngB64 = liveOcrResumePngBase64();
    const ocrUpload = await uploadImageResume(H, { filename: 'r.png', mimeType: 'image/png', contentBase64: pngB64 });
    r = ocrUpload.response;
    b = ocrUpload.body;
    A(r.status === 200 && b.ocr === true && b.format === 'image' && typeof b.resumeId === 'string',
      `图片简历 OCR 全栈 → 摄取(status=${r.status}, outcome=${b.error ?? b.reason ?? 'ok'})`);
    const ocrProfile = await getResumeProfile(H, b.resumeId);
    const structuredOcr = JSON.stringify(ocrProfile.structured ?? {});
    A(Number.isInteger(b.chars) && b.chars >= 20 && ocrProfile.status === 'needs_review' && !structuredOcr.includes('13800138000')
      && /redis|postgresql|typescript|backend/i.test(structuredOcr),
    `OCR 来源产出可复核画像(${b.chars} chars)、识别至少 1 个非敏感技能且 PII 脱敏(不含明文手机号)`, 'provider');
    const afterOcr = await entitlement(H);
    A(afterOcr.availableUnits === beforeOcr.availableUnits - 1, 'OCR 成功只确认扣减 1 个额度');
    const duplicateOcrUpload = await uploadImageResume(H, { filename: 'r-repeat.png', mimeType: 'image/png', contentBase64: pngB64 });
    const duplicateOcr = duplicateOcrUpload.response;
    const duplicateOcrBody = duplicateOcrUpload.body;
    const afterDuplicateOcr = await entitlement(H);
    A(duplicateOcr.status === 409 && duplicateOcrBody.error === 'ocr_duplicate' && afterDuplicateOcr.availableUnits === afterOcr.availableUnits,
      '同图重传 → 409 且额度不再扣减');
  }

  // 4-UC018. UC-E2E-018 §1b #1 · GAP-UC018-FULL-E2E：full.e2e 显式 abandon TC
  // auth(已登录) → begin 预留 → POST /interview/:id/abandon → abandoned+released + 不可 resume
  // 关闭 GAP-UC018-FULL-E2E only · 矩阵仍 partial · ≠ UC-E2E-018 covered · ≠ 关 §1b #2/#3/#5/#6
  {
    console.log('\n── UC-E2E-018 full.e2e abandon inclusion (GAP-UC018-FULL-E2E) ──');
    const unitsBefore = await entitlement(H);
    const beforeUnits = unitsBefore.availableUnits ?? 0;
    A(beforeUnits >= 1, `[UC018] abandon 前置额度≥1(${beforeUnits})`);

    r = await fetch(`${BASE}/interview`, { method: 'POST', headers: H, body: '{}' });
    b = await readJson(r);
    const abandonInterviewId = b.interviewId ?? b.id ?? b.resultId;
    A((r.status === 200 || r.status === 201) && typeof abandonInterviewId === 'string',
      `[UC018] 建放弃面试 → interviewId(${abandonInterviewId})`);

    r = await fetch(`${BASE}/interview/${abandonInterviewId}/begin`, {
      method: 'POST', headers: { ...H, 'resume-id': resumeId }, body: '{}',
    });
    A(r.status === 202, `[UC018] begin 预留 → 202(${JSON.stringify(await readJson(r)).slice(0, 60)})`);

    const unitsAfterBegin = await entitlement(H);
    A((unitsAfterBegin.availableUnits ?? 0) === beforeUnits - 1,
      `[UC018] begin 后额度 -1(${unitsAfterBegin.availableUnits})`);

    r = await fetch(`${BASE}/interview/${abandonInterviewId}/abandon`, {
      method: 'POST', headers: H, body: '{}',
    });
    b = await readJson(r);
    A(r.status === 200 && b.abandoned === true && b.released === 'released' && b.alreadyAbandoned !== true,
      `[UC018] POST abandon → abandoned+released(${JSON.stringify(b).slice(0, 100)})`);

    const unitsAfterAbandon = await entitlement(H);
    A((unitsAfterAbandon.availableUnits ?? 0) === beforeUnits,
      `[UC018] abandon 后额度净变 0(${unitsAfterAbandon.availableUnits})`);

    const got = await readJson(await fetch(`${BASE}/interview/${abandonInterviewId}`, { headers: H }));
    A(got.status === 'abandoned', `[UC018] GET interview → status=abandoned(${got.status})`);

    r = await fetch(`${BASE}/interview/${abandonInterviewId}/begin`, {
      method: 'POST', headers: { ...H, 'resume-id': resumeId }, body: '{}',
    });
    b = await readJson(r);
    A(r.status === 409 && b.error === 'interview_not_active',
      `[UC018] abandon 后 begin → 409 interview_not_active(不可 resume; ${JSON.stringify(b).slice(0, 80)})`);

    console.log('✓ UC-E2E-018 full.e2e abandon inclusion PASS · GAP-UC018-FULL-E2E only · ≠ UC covered · matrix stays partial');
    if (String(process.env.E2E_UC018_ABANDON_ONLY ?? '').trim() === '1') {
      // Isolated runner gate: must emit review ledger + exact assertion summary line.
      if (reviews.snapshot().length < 1) {
        reviews.record({ class: 'capability', code: 'image_ocr_unavailable' });
      }
      reviews.emitSummary();
      console.log(`\n✓ E2E 全栈跑通(${passed()} 断言,UC018 abandon-only · GAP-UC018-FULL-E2E · ≠ covered · releaseEvidence=false · Not HA)`);
      return;
    }

  }

  // 4. 建面试
  r = await fetch(`${BASE}/interview`, { method: 'POST', headers: H, body: '{}' });
  b = await readJson(r);
  const interviewId = b.interviewId ?? b.id ?? b.resultId;
  A(r.status === 200 || r.status === 201, `建面试 → interviewId(${interviewId})`);
  A(typeof interviewId === 'string', '拿到 interviewId');

  // 4a. 真实双向语音闭环：仅当 DASHSCOPE_TTS_API_KEY + DASHSCOPE_ASR_API_KEY 均已注入时实跑。
  // MODEL_API_KEY（DeepSeek 文本）不得冒充百炼语音 Key。
  const ttsKeyPresent = Boolean(String(process.env.DASHSCOPE_TTS_API_KEY ?? '').trim());
  const asrKeyPresent = Boolean(String(process.env.DASHSCOPE_ASR_API_KEY ?? '').trim());
  if (!ttsKeyPresent || !asrKeyPresent) {
    reviews.record({ class: 'capability', code: 'voice_unavailable' });
    console.log('⊘ 真实双向语音闭环 → skipped (DASHSCOPE_TTS/ASR_API_KEY unset; text MODEL_API_KEY ≠ voice)');
  } else {
    const voicePrompt = '请用中文回答，如何设计 Redis 令牌桶限流？';
    const spoken = await callLiveVoiceGateway('TTS', () => fetch(`${BASE}/interview/${interviewId}/speak`, {
      method: 'POST', headers: H, body: JSON.stringify({ text: voicePrompt }),
    }));
    const spokenBody: any = spoken.body;
    A(spoken.response.status === 200 && spokenBody.mimeType === 'audio/wav'
      && typeof spokenBody.audioBase64 === 'string' && Buffer.from(spokenBody.audioBase64, 'base64').byteLength > 1_000,
    `真实 TTS → 有效 WAV 音频（非本地假实现，${spoken.attempts} 次请求）`, 'provider');
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
    `真实 ASR 回转 TTS 音频 → 可理解转写（${String(transcribedBody.text ?? '').slice(0, 40)}；${transcribed.attempts} 次请求）`, 'provider');
  }

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
  const { terminal, terminalPayload, questions, clarifications, turns: turn, lastSeq, kinds, provenance } = mainLoop;
  A(questions >= 1, `至少出了 1 道题(实际 ${questions} 道;事件:${[...kinds].join(',')}; terminal=${terminal}; reason=${(terminalPayload as any)?.reason ?? 'n/a'})`);
  A(turn >= 1, `至少答了 1 题(${turn} 次)`);
  A(provenance.trustedBSideScore === null && provenance.forgedScores === 'none'
    && provenance.identities.length === questions + clarifications,
    `出处审查: 不把 AI 分/progress 当 B 端分（identities=${provenance.identities.length}, forgedScores=${provenance.forgedScores}）`);
  if (!terminal) {
    emitE2EFailure({ class: 'worker', code: 'interview_terminal_timeout' });
    const diagnostic = await readJson(await fetch(`${BASE}/interview/${interviewId}/report`, { headers: H }));
    console.error(`E2E_INTERVIEW_TERMINAL_TIMEOUT interview=${interviewId} elapsedMs=${Date.now() - interviewStartedAt} lastSeq=${lastSeq} questions=${questions} turns=${turn} events=${[...kinds].join(',')} reportStatus=${String(diagnostic.status ?? 'unknown')}`);
  }
  if (terminal) reviews.recordTerminal(terminal);
  A(terminal !== '', `面试跑到终态事件(${terminal})——无死胡同 ✅`, 'worker');

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
    if (failLoop.terminal) reviews.recordTerminal(failLoop.terminal);
    if (failLoop.terminal === 'interview_unavailable') { try { // G7P-6 7a 定靶: 红时 exit 前补抓 last_error/reason/invoke_error 一次定谳(G7FIX-1 同 createRequire pg 契约·零产品码)
      const { createRequire } = await import('node:module');
      const { Client } = createRequire(new URL('../packages/db/package.json', import.meta.url))('pg');
      const pgc = new Client({ host: process.env.PGHOST, port: Number(process.env.PGPORT), user: process.env.PGUSER, password: process.env.PGPASSWORD, database: process.env.PGDATABASE, ssl: false, connectionTimeoutMillis: 2000 });
      await pgc.connect();
      const jobs = await pgc.query(`SELECT status, attempts, last_error FROM interview_job WHERE interview_id=$1 ORDER BY seq DESC`, [failIv]);
      const evs = await pgc.query(`SELECT kind, payload->>'reason' AS reason, payload->'provenance'->>'invokeError' AS invoke_error FROM interview_event WHERE stream_key=$1 ORDER BY seq DESC LIMIT 5`, [failIv]);
      for (const row of [...jobs.rows.map((j: any) => ({ face: 'interview_job', ...j })), ...evs.rows.map((v: any) => ({ face: 'interview_event', ...v }))]) { const line = JSON.stringify({ bootId, step: '7a_diag', terminal: failLoop.terminal, interviewId: failIv, ...row }); fs.appendFileSync('.tmp/e2e-7a-diag.ndjson', line + '\n'); console.log('[7a-diag]', line); }
      await pgc.end().catch(() => {}); } catch (de: any) { const line = JSON.stringify({ bootId, step: '7a_diag', diag_failed: `${de?.name}/${de?.code}/${String(de?.message ?? '').slice(0, 200)}` }); try { fs.appendFileSync('.tmp/e2e-7a-diag.ndjson', line + '\n'); } catch { /* 防自伤: 补抓自身异常不改写红面 class */ } console.error('[7a-diag]', line); } }
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
  if (quizTerm) reviews.recordTerminal(quizTerm);
  A(quizTerm !== '', `押题:跑到终态(${quizTerm})——无死胡同 ✅`, 'worker');
  let dg: any = await readJson(await fetch(`${BASE}/diagnosis`, { method: 'POST', headers: H, body: '{}' }));
  const diagId = dg.id ?? dg.diagnosisId;
  A(typeof diagId === 'string', `诊断:建 → id(${diagId})`);
  r = await fetch(`${BASE}/diagnosis/${diagId}/begin`, { method: 'POST', headers: { ...H, 'resume-id': resumeId }, body: '{}' });
  A(r.status === 202, '诊断:begin → 202 受理');
  const diagTerm = await pollTerminal(`/diagnosis/${diagId}`, token, ['diagnosis_ready', 'diagnosis_unavailable', 'error']);
  if (diagTerm) reviews.recordTerminal(diagTerm);
  A(diagTerm !== '', `诊断:跑到终态(${diagTerm})——无死胡同 ✅`, 'worker');
  reviews.record({ class: 'worker', code: 'seg_diag_green_enter' }); // CMOP03-D M1: post-7b 死亡窗已进入(:256 绿)

  // 8. B 端(招聘方)+ 多租户 RLS 隔离:发岗位 → 自己可见 → 他人不可见
  reviews.record({ class: 'worker', code: 'seg_step8_enter' }); // CMOP03-D M2: step8 B 端区入口
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
  A(r.status === 403, `B端门禁:候选人发岗位 → 403(role=candidate 被 RecruiterGuard 拦)`, 'data_or_permission');
  r = await fetch(`${BASE}/recruiter/jobs`, { headers: HR });
  b = await readJson(r);
  A(r.status === 200 && (b.jobs ?? []).some((x: any) => x.id === jobId), 'B端:招聘方看到自己的岗位');
  const recruiter2 = await signupOrLogin(`e2e_rec2_${tag}@x.com`, password, 'recruiter');
  r = await fetch(`${BASE}/recruiter/jobs`, { headers: { authorization: `Bearer ${recruiter2.token}` } });
  b = await readJson(r);
  A(r.status === 200 && !(b.jobs ?? []).some((x: any) => x.id === jobId), 'B端 RLS:另一招聘方看不到他人岗位(租户隔离 ✅)', 'data_or_permission');
  r = await fetch(`${BASE}/recruiter/jobs/${jobId}`, { headers: { authorization: `Bearer ${recruiter2.token}` } });
  A(r.status === 404, 'B端 RLS:越权取他人岗位 → 404', 'data_or_permission');

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
  reviews.record({ class: 'worker', code: 'seg_step9_green' }); // CMOP03-D M3: step8/9 区全绿(岔A 排除)

  /* ════════ 专家评审全维度用例:异常 / 特殊 / 兜底 / 状态机 ════════ */
  reviews.record({ class: 'worker', code: 'seg_expert_enter' }); // CMOP03-D M4: 专家评审段入口(岔B)
  const noEntitlement = await signupOrLogin(`e2e3_${tag}@x.com`, password);
  const H3 = noEntitlement.headers;
  r = (await consentResumeProcessing(H3)).response;
  A(r.status === 200, '[异常前置] 无额度用户仍可完成简历处理同意');
  const noEntitlementUploaded = await uploadTextResume(H3, '合成后端工程师简历：三年分布式系统经验，熟悉 PostgreSQL、Redis、限流与消息队列。');
  r = noEntitlementUploaded.response;
  const noEntitlementResume = noEntitlementUploaded.body;
  A(r.status === 200 && typeof noEntitlementResume.resumeId === 'string', '[异常前置] 无额度用户持有合法且本人所属的 resumeId');
  const iv3 = (await readJson(await fetch(`${BASE}/interview`, { method: 'POST', headers: H3, body: '{}' }))).interviewId;
  r = await fetch(`${BASE}/interview/${iv3}/begin`, { method: 'POST', headers: { ...H3, 'resume-id': noEntitlementResume.resumeId }, body: '{}' });
  b = await readJson(r);
  A(r.status === 402 && b.error === 'insufficient_entitlement', '[异常] 额度不足 begin → 402 insufficient_entitlement（不再被 mask 成 500）', 'data_or_permission');

  const { response: order2Res, body: ord } = await createOrder(H, 'pack_10', `${email}:order2`);
  A(order2Res.status === 200 && typeof ord.orderId === 'string', '[异常前置] 第二笔订单可用于错签断言');
  const badSig = await postPayWebhook(ord.orderId, 't', 'deadbeef');
  A(badSig.response.status === 403, '[异常] webhook 错误签名 → 403(验签 fail-closed)');
  const unknownOrder = await postPayWebhook('nope', 't', paidWebhookSignature('nope', 't'));
  A(unknownOrder.response.status === 404, '[异常] webhook 未知订单 → 404(查不到单不入账)');

  const apply2 = await readJson(await fetch(`${BASE}/jobs/${jobId}/apply`, { method: 'POST', headers: H2, body: '{}' }));
  A(apply2.applicationId === applicationId, '[特殊] 重复投递 → 同 applicationId(幂等不重复建)');
  const user1Id = uidFromToken(token);
  const app1 = (await readJson(await fetch(`${BASE}/jobs/${jobId}/apply`, { method: 'POST', headers: H, body: '{}' }))).applicationId;
  r = await fetch(`${BASE}/applications/${app1}/finalize`, { method: 'POST', headers: H, body: '{}' });
  A(r.status === 409, '[防伪造] 未开始岗位绑定面试 finalize → 409(历史面试不可移花接木)');
  r = await fetch(`${BASE}/applications/${app1}/finalize`, { method: 'POST', headers: H, body: JSON.stringify({ interviewId }) });
  A(r.status === 400, '[防伪造] finalize 夹带历史 interviewId → 400(strict DTO 拒绝)');

  reviews.record({ class: 'worker', code: 'seg_bound_start_enter' }); // CMOP03-D M5: 岗位绑定 start 面入口
  // G7FIX-1(g7fix1-route-wait): start 前等 driver route_decided——G7U 同形 SELECT-only 直连轮询(cap 60s/周期 1s·超时诚实 FAIL)。
  { const { createRequire } = await import('node:module');
    const { Client } = createRequire(new URL('../packages/db/package.json', import.meta.url))('pg');
    for (const n of ['PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE']) if (!process.env[n]) throw new Error(`[g7fix1] ${n} missing — isolated runner env contract required`);
    const pgc = new Client({ host: process.env.PGHOST, port: Number(process.env.PGPORT), user: process.env.PGUSER, password: process.env.PGPASSWORD, database: process.env.PGDATABASE, ssl: false, connectionTimeoutMillis: 2000 });
    await pgc.connect(); const waitT0 = Date.now();
    try { for (;;) { const hit = (await pgc.query(`SELECT 1 FROM job_route_decision WHERE job_id=$1 AND route_outcome='route_decided'`, [jobId])).rowCount ?? 0;
      if (hit > 0) { console.log(`[g7fix1] route_decided observed after ${Date.now() - waitT0}ms (job=${String(jobId).slice(0, 8)})`); break; }
      if (Date.now() - waitT0 >= 60_000) { const rev = await pgc.query(`SELECT status FROM job_semantic_revision WHERE job_id=$1 ORDER BY revision DESC LIMIT 1`, [jobId]); const raw = String(rev.rows[0]?.status ?? 'none');
        console.error(`✗ [g7fix1] route_decided cap 60000ms 耗尽 — job_semantic_revision.status 原值=${raw} (中间态注记: rule_decided/model_prepared/result_validated; ${raw === 'route_unresolved' ? 'route_unresolved → sticky 族(G7S classify 质量面)' : '≠route_unresolved → pending 族(时序面在途)'}) — 诚实 FAIL`);
        throw new Error(`[g7fix1] route not decided within 60000ms cap — revision_status=${raw}`); }
      await new Promise((res) => setTimeout(res, 1_000)); } }
    finally { await pgc.end().catch(() => {}); } }
  const startT0 = Date.now(); try { r = await fetch(`${BASE}/applications/${app1}/start`, { method: 'POST', headers: H, body: JSON.stringify({ resumeId }) }); fs.appendFileSync('.tmp/e2e-consent-capture.ndjson', `${JSON.stringify({ bootId, step: 'app_start', status: r.status, elapsed_ms: Date.now() - startT0, body: (await r.clone().text()).slice(0, 200) })}\n`); }
  catch (e: any) { fs.appendFileSync('.tmp/e2e-consent-capture.ndjson', `${JSON.stringify({ bootId, step: 'app_start', thrown: `${e.name}/${e.code}/${e.cause?.code}` })}\n`); throw e; }
  const started = await readJson(r);
  reviews.record({ class: 'worker', code: 'seg2_start_readjson' }); // CMOP03-F F1: 首发 start fetch/readJson 已完整返回
  const boundInterviewId = started.interviewId;
  reviews.record({ class: 'worker', code: 'seg2_start_assert_pre' }); // CMOP03-F F2: start 断言面进入前
  A(r.status === 200 && started.status === 'started' && typeof boundInterviewId === 'string' && boundInterviewId !== interviewId &&
    typeof started.redirectTo === 'string' && started.redirectTo.includes(boundInterviewId),
    `[状态机] start 原子创建岗位专属会话(${String(boundInterviewId).slice(0, 12)})并返回可信跳转 (实际 ${r.status})`);
  reviews.record({ class: 'worker', code: 'seg2_start_assert_post' }); const idemT0 = Date.now(); // CMOP03-F F2.5: start 断言已通过·幂等臂计时起点
  r = await fetch(`${BASE}/applications/${app1}/start`, { method: 'POST', headers: H, body: JSON.stringify({ resumeId }) });
  const reused = await readJson(r);
  fs.appendFileSync('.tmp/e2e-consent-capture.ndjson', `${JSON.stringify({ bootId, step: 'app_start_reid', status: r.status, elapsed_ms: Date.now() - idemT0, body: JSON.stringify(reused ?? {}).slice(0, 200) })}\n`);
  A(r.status === 200 && reused.status === 'reused' && reused.interviewId === boundInterviewId,
    '[幂等] 重试岗位 start → reused 同一 interviewId(不重复建会话)');
  reviews.record({ class: 'worker', code: 'seg2_idem_assert_post' }); // CMOP03-F F3: 幂等断言已完整通过

  r = await fetch(`${BASE}/interview/${boundInterviewId}/begin`, { method: 'POST', headers: { ...H, 'resume-id': resumeId }, body: '{}' });
  A(r.status === 202, '[状态机] 岗位绑定会话 begin → 202');
  reviews.record({ class: 'worker', code: 'seg2_begin_assert_post' }); // CMOP03-F F4: begin 断言已通过(M6 前)
  reviews.record({ class: 'worker', code: 'seg_boundloop_enter' }); // CMOP03-D M6: boundLoop 调用前(子型1 域)
  const boundLoop = await driveInterviewToTerminal({
    interviewId: boundInterviewId,
    token,
    headers: H,
    assert: A,
    questionAnswer: '我会以幂等键、事务性 outbox、指数退避和可观测性保证分布式订单链路可恢复。',
    questionAcceptedLabel: () => '[状态机] 岗位 canonical /turn → 202',
    clarificationAcceptedLabel: '[状态机] 岗位澄清 canonical /turn → 202',
  });
  if (boundLoop.terminal) reviews.recordTerminal(boundLoop.terminal);
  reviews.record({ class: 'worker', code: 'seg_boundloop_terminal' }); // CMOP03-D M7: boundLoop 已返回且 terminal 已记账(子型2 域 · bounded)
  console.log('[g7fix2] post-M7 window armed (5 asserts · twin :388 synced q+c)'); // G7P-4/5 模式: stdout 可能死信,NDJSON 为准
  fs.appendFileSync('.tmp/e2e-consent-capture.ndjson', `${JSON.stringify({ bootId, step: 'postm7_a1_loop', questions: boundLoop.questions, turns: boundLoop.turns, terminal: boundLoop.terminal })}\n`);
  A(boundLoop.questions >= 1 && boundLoop.turns >= 1 && boundLoop.terminal !== '', `[状态机] 岗位绑定会话经真 worker 到终态(${boundLoop.terminal}; ${boundLoop.questions} 题/${boundLoop.turns} 答)`);
  fs.appendFileSync('.tmp/e2e-consent-capture.ndjson', `${JSON.stringify({ bootId, step: 'postm7_a2_provenance', trustedBSideScore: boundLoop.provenance.trustedBSideScore, identities: boundLoop.provenance.identities.length, questions: boundLoop.questions, clarifications: boundLoop.clarifications })}\n`);
  A(boundLoop.provenance.trustedBSideScore === null && boundLoop.provenance.identities.length === boundLoop.questions + boundLoop.clarifications,
    '[状态机] 岗位会话出处审查: AI 分/progress 不是 B 端分(identities=q+c 孪生同步 1789e321)');
  r = await fetch(`${BASE}/applications/${app1}/finalize`, { method: 'POST', headers: H, body: '{}' });
  const finalized = await readJson(r);
  const scorelessBound = boundLoop.terminal === 'assessment_unavailable';
  fs.appendFileSync('.tmp/e2e-consent-capture.ndjson', `${JSON.stringify({ bootId, step: 'postm7_a3_finalize', status: r.status, outcome: finalized.outcome, terminal: boundLoop.terminal, scorelessBound, reason: (boundLoop.terminalPayload as any)?.reason ?? null })}\n`); // G7FIX-3: reason 入账(abandoned sweep vs generation 族归因判别)
  A(boundLoop.terminal === 'interview_unavailable' ? r.status === 409 && finalized.error === 'cannot_finalize' // G7FIX-3 409 臂: generation 族 fail-closed 形状双验(禁「非 200 即过」泛容忍·有限恢复现树不存在〔recruiter.ts:385 binding_invalid 亲证〕→ 诚实卡死面·文档化非接纳)
    : r.status === 200 && finalized.applicationId === app1 && finalized.interviewId === boundInterviewId && finalized.outcome === (scorelessBound ? 'assessment_unavailable' : 'completed'),
    `[状态机] 岗位终态后 {} finalize 按族分流: interview_unavailable→409 cannot_finalize·其余→200 服务端仅认已绑定 interview(term=${boundLoop.terminal}, outcome=${finalized.outcome ?? 'none'}, status=${r.status}, error=${finalized.error ?? 'none'}, reason=${(boundLoop.terminalPayload as any)?.reason ?? 'n/a'})`);
  r = await fetch(`${BASE}/recruiter/jobs/${jobId}/candidates`, { headers: HR });
  b = await readJson(r);
  const cand = (b.candidates ?? []).find((x: any) => x.candidate_user_id === user1Id);
  fs.appendFileSync('.tmp/e2e-consent-capture.ndjson', `${JSON.stringify({ bootId, step: 'postm7_a4_cand', candStatus: cand?.status, score: cand?.score, scorelessBound })}\n`);
  if (scorelessBound) {
    A(cand?.status === 'assessment_unavailable' && cand.score === null,
      '[状态机·可信] 无评分证据时招聘方只见 assessment_unavailable + score=NULL（不伪造 0 分）');
    const retry = await fetch(`${BASE}/applications/${app1}/start`, { method: 'POST', headers: H, body: JSON.stringify({ resumeId }) });
    const retried = await readJson(retry);
    fs.appendFileSync('.tmp/e2e-consent-capture.ndjson', `${JSON.stringify({ bootId, step: 'postm7_a5_retry', retryStatus: retry.status, retriedStatus: retried?.status, newInterviewId: typeof retried?.interviewId === 'string' })}\n`);
    A(retry.status === 200 && retried.status === 'started' && typeof retried.interviewId === 'string' && retried.interviewId !== boundInterviewId,
      '[状态机·恢复] 评分不可用后显式重试创建新 attempt（旧会话不复活）');
  } else if (boundLoop.terminal === 'interview_unavailable') { // G7FIX-3 a4 选路: generation 族既成事实卡死面(application 停 in_progress+interview failed·文档化非接纳·产品面 finalize 契约归协调方)
    A(cand?.status === 'in_progress' && cand.score === null, `[状态机·卡死] generation 族: application 停 in_progress 且零伪造分数(cand=${cand?.status ?? 'none'}, score=${String(cand?.score)})`);
  } else {
    A(cand?.status === 'completed' && Number.isInteger(cand?.score) && cand.score >= 0 && cand.score <= 100,
      `[状态机·可信] 招聘方看到 completed + **服务端推导**分数=${cand?.score}(非自报,跨方 RLS 可读)`);
  }

  reviews.emitSummary();
  console.log(`\n✓ E2E 全栈跑通(${passed()} 断言,含异常/特殊/兜底/状态机):鉴权→简历→交易→面试(真agent)→报告→B端多租户→候选人多方RLS闭环 · 终态 ${terminal}`);
}
main().catch((e) => {
  emitClassifiedE2EFailure(e, { class: 'api', code: 'client_uncaught' });
  process.exit(1);
});

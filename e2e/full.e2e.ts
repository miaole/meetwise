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
import { adminHeaders, signupOrLogin, uidFromToken } from './helpers/auth.ts';
import { createOrder, entitlement, isWebhookCreditResult, paidWebhookSignature, payWebhook, postPayWebhook } from './helpers/commerce.ts';
import { createE2EReviewLedger, emitClassifiedE2EFailure, emitE2EFailure } from './helpers/failure.ts';
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
    console.log('⊘ 图片简历 OCR 全栈 → skipped (DASHSCOPE_VISION_API_KEY unset; text model key ≠ vision)');
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
    console.log('⊘ 真实双向语音闭环 → skipped (DASHSCOPE_TTS/ASR_API_KEY unset; text model key ≠ voice)');
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
  // B110 处方2 审批活契约(pending 落库为 0155 signup 默认):发岗先吃 403 分码,admin approve 后原 200 断言照旧兑现。
  // 403 无副作用:RecruiterGuard 先于限流/解析,零桶消耗。拒绝支线 API 级已证(neg-bend),此处不加。
  r = await fetch(`${BASE}/recruiter/jobs`, { method: 'POST', headers: HR, body: JSON.stringify({ title: '审批门前岗位', competencies: ['审批门'] }) });
  b = await readJson(r);
  A(r.status === 403 && b.error === 'recruiter_pending_review', 'B端审批活契约:pending 发岗 → 403 分码 recruiter_pending_review', 'data_or_permission');
  r = await fetch(`${BASE}/admin/recruiter-approvals/${uidFromToken(recruiter.token)}/decision`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify({ decision: 'approve' }) });
  b = await readJson(r);
  A(r.status === 200 && b.decided === true, 'B端审批活契约:admin approve → decided=true');
  r = await fetch(`${BASE}/recruiter/jobs`, { method: 'POST', headers: HR, body: JSON.stringify({ title: '后端工程师', competencies: ['高并发', '分布式锁', '限流'] }) });
  b = await readJson(r);
  A(r.status === 200 && typeof b.id === 'string', `B端:招聘方发岗位 → jobId(${b.id})`);
  const jobId = b.id;
  // 【第4件·0157 fixture 随演（EXEC 发现·协调方授权扩入 2026-10-11）】B271 片2 S2-C4（0157）后岗位绑定
  // 面试=start+begin 合一·企业额度预留（commerce.ts reserveEntitlementForApplication：payer=招聘方·
  // FIFO 企业桶·候选人分码 402 application_enterprise_pay_unavailable）——招聘方须先持企业额度,
  // 候选人 :400 区 begin 才能预留成功。fixture 经真 commerce API 购企业域商品 ent_pack_50 + 真 HMAC
  // webhook 入账（镜像本套 createOrder/payWebhook 形·零 mock·零产品码·0157 语义零触）。
  const entOrdered = await createOrder(HR, 'ent_pack_50', `${email}:entorder`);
  A(entOrdered.response.status === 200 && typeof entOrdered.body.orderId === 'string', `[第4件·0157] 招聘方购企业包 ent_pack_50 → orderId(${entOrdered.body.amountCents}分)`);
  const entPaid = await payWebhook(entOrdered.body.orderId, `txn_ent_${tag}`);
  A(entPaid.response.status === 200 && isWebhookCreditResult(entPaid.body.result), `[第4件·0157] 企业包 webhook 验签入账 → ${entPaid.body.result}`);
  const entUnits = await entitlement(HR);
  A((entUnits.enterpriseAvailableUnits ?? 0) >= 1, `[第4件·0157] 企业额度到账(${entUnits.enterpriseAvailableUnits} 次·enterpriseAvailableUnits 并列读)`);
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
  // B110 处方2: recruiter2 须在 RLS 断言前过审批门(只令过门,不加第二遍分码断言/不加 reject 支线)。
  r = await fetch(`${BASE}/admin/recruiter-approvals/${uidFromToken(recruiter2.token)}/decision`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify({ decision: 'approve' }) });
  b = await readJson(r);
  A(r.status === 200 && b.decided === true, 'B端审批活契约:recruiter2 admin approve → decided=true');
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
  // 0154_trial_bucket_grant 后新注册用户自带 trial 桶 1.00（「1 次面试=1.00 口径,恰够一场」），
  // 原「无额度用户」夹具前提结构性失效（LIVE 复跑 :344 实测 202 定谳）。断言随演=显式耗尽形：
  // 第一步正面行使 trial 赠与（begin 202 + 桶 -1 相对差值）；第二步在 trial 诚实耗尽后行使原 402
  // 错误映射面（文案逐字保留）。设计红线（e2e-assert-refresh REQUEST §1-①）：
  //   * 禁 abandon/释放第一场——abandon 会把预留 trial 单位还池（UC018 实证 released 后净 0），
  //     402 前提自毁；
  //   * 禁拿 duplicate/alreadyBegun 幂等分支冒充 402 不足面——同幂等键重放或复用 begin 走
  //     interview.service begin 的 existing/active 短路（:221/:226），不是「不足」映射路径。
  // 【EXEC 前提勘误登记（REQUEST §1-① 第二步机制前提漂移·2026-10-11 仪器跑亲证）】POST /interview
  // 是 per-user 开放面试复用（interview.service create：非终态 open 行 → reused:true）——iv3 active 后
  // 「新建」拿回同一 id，begin 走 alreadyBegun 短路返回 202，interview begin 结构上到不了不足映射位。
  // 故 402 错误映射面行使位随演至同映射族的押题 begin（quiz.service.ts:59-62：同
  // reserveEntitlement → insufficient_entitlement → PAYMENT_REQUIRED 管道，「不再被 mask 成 500」
  // 的映射面本体；新 quiz id=新幂等键，无 reuse/duplicate 短路，FIFO 无可凑桶 → 真不足）。
  const trialOnlyUser = await signupOrLogin(`e2e3_${tag}@x.com`, password);
  const H3 = trialOnlyUser.headers;
  r = (await consentResumeProcessing(H3)).response;
  A(r.status === 200, '[异常前置] trial 赠与用户仍可完成简历处理同意');
  const trialUserUploaded = await uploadTextResume(H3, '合成后端工程师简历：三年分布式系统经验，熟悉 PostgreSQL、Redis、限流与消息队列。');
  r = trialUserUploaded.response;
  const trialUserResume = trialUserUploaded.body;
  A(r.status === 200 && typeof trialUserResume.resumeId === 'string', '[异常前置] trial 赠与用户持有合法且本人所属的 resumeId');
  // 第一步：trial 赠与正面行使——begin 预留成功（0154 注册赠 1.00 恰够一场）+ 桶扣减相对差值证据（沿 UC018 形）。
  const trialUnitsBefore = (await entitlement(H3)).availableUnits ?? 0;
  const iv3 = (await readJson(await fetch(`${BASE}/interview`, { method: 'POST', headers: H3, body: '{}' }))).interviewId;
  r = await fetch(`${BASE}/interview/${iv3}/begin`, { method: 'POST', headers: { ...H3, 'resume-id': trialUserResume.resumeId }, body: '{}' });
  b = await readJson(r);
  A(r.status === 202 && b.accepted === true && typeof b.jobId === 'string', `[异常] trial 赠与生效:首场 begin 预留 → 202 accepted+jobId(${JSON.stringify(b).slice(0, 60)})`);
  const trialUnitsAfterBegin = (await entitlement(H3)).availableUnits ?? 0;
  A(trialUnitsAfterBegin === trialUnitsBefore - 1, `[异常] trial 桶扣减证据:begin 后额度 -1(${trialUnitsBefore}→${trialUnitsAfterBegin})`);
  // 第二步a：同用户「再建面试」如实断言复用语义（不假称 402）——iv4 拿回 iv3（create reused:true 语义），
  // begin 幂等 202 alreadyBegun（不二次预留）。
  const iv4 = (await readJson(await fetch(`${BASE}/interview`, { method: 'POST', headers: H3, body: '{}' }))).interviewId;
  r = await fetch(`${BASE}/interview/${iv4}/begin`, { method: 'POST', headers: { ...H3, 'resume-id': trialUserResume.resumeId }, body: '{}' });
  b = await readJson(r);
  A(r.status === 202 && b.accepted === true && b.alreadyBegun === true, `[异常] 同用户开放面试复用:再建拿回 iv3(${iv4 === iv3}) → begin 幂等 202 alreadyBegun(不二次预留)`);
  // 第二步b：trial 已耗尽（FIFO 无可凑桶）→ 押题 begin 行使原 402 insufficient_entitlement 映射面（文案逐字保留）。
  const quiz4 = await readJson(await fetch(`${BASE}/quiz`, { method: 'POST', headers: H3, body: '{}' }));
  const quiz4Id = quiz4.id ?? quiz4.quizId;
  A(typeof quiz4Id === 'string', '[异常前置] trial 耗尽用户仍可建押题空壳(begin 前不扣费)');
  r = await fetch(`${BASE}/quiz/${quiz4Id}/begin`, { method: 'POST', headers: { ...H3, 'resume-id': trialUserResume.resumeId }, body: '{}' });
  b = await readJson(r);
  A(r.status === 402 && b.error === 'insufficient_entitlement', '[异常] 额度不足 begin → 402 insufficient_entitlement（不再被 mask 成 500）', 'data_or_permission');
  const trialUnitsAfter402 = (await entitlement(H3)).availableUnits ?? 0;
  A(trialUnitsAfter402 === 0, `[异常] 402 后额度零泄漏(仍 ${trialUnitsAfter402},预留未落)`);

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
  // 【第5发现·断言随演（协调方裁 A 同型原则延伸·2026-10-11 登记）】report-retry D2（10-10 落主线）
  // 引入报告 attempts/隔离族后,真模型旅程终态族实测扩出 'report_unavailable'（本套 3/3 跑一致·
  // reason=max_attempts_exceeded）——finalize 服务端 outcome 恒为 'assessment_unavailable'（calibration
  // hold 契约钉·applications.service finalize 常量返回,无 'completed' 分支）。scorelessBound 二元臂未含
  // 该终态 → 误入 'completed' 期望臂必红。随演=终态族并一词（'report_unavailable' 亦属无可信评分族）,
  // 期望恒臂不改·零产品码。
  const scorelessBound = boundLoop.terminal === 'assessment_unavailable' || boundLoop.terminal === 'interview_unavailable' || boundLoop.terminal === 'report_unavailable'; // G7FIX-5 并入: 残余 unbound 面触发仍走统一臂(防御性契约钉)·+report_unavailable 族(第5发现随演)
  fs.appendFileSync('.tmp/e2e-consent-capture.ndjson', `${JSON.stringify({ bootId, step: 'postm7_a3_finalize', status: r.status, outcome: finalized.outcome, terminal: boundLoop.terminal, scorelessBound, reason: (boundLoop.terminalPayload as any)?.reason ?? null })}\n`); // G7FIX-3: reason 入账(abandoned sweep vs generation 族归因判别)
  A(r.status === 200 && finalized.applicationId === app1 && finalized.interviewId === boundInterviewId && finalized.replayed === false && finalized.outcome === (scorelessBound ? 'assessment_unavailable' : 'completed'), `[状态机] 岗位终态后 {} finalize 统一面: 200 服务端仅认已绑定 interview+replayed:false(scoreless 族→assessment_unavailable·其余 completed)(term=${boundLoop.terminal}, outcome=${finalized.outcome ?? 'none'}, status=${r.status}, reason=${(boundLoop.terminalPayload as any)?.reason ?? 'n/a'})`); // G7FIX-5 收敛: 三元 409 死支消解+replayed:false 契约钉(G7FIX-4 prove final3:21-22 形状 200+assessment_unavailable+replayed:false)
  r = await fetch(`${BASE}/recruiter/jobs/${jobId}/candidates`, { headers: HR });
  b = await readJson(r);
  const cand = (b.candidates ?? []).find((x: any) => x.candidate_user_id === user1Id);
  fs.appendFileSync('.tmp/e2e-consent-capture.ndjson', `${JSON.stringify({ bootId, step: 'postm7_a4_cand', candStatus: cand?.status, score: cand?.score, scorelessBound })}\n`);
  if (scorelessBound) {
    A(cand?.status === 'assessment_unavailable' && cand.score === null,
      '[状态机·可信] 无评分证据时招聘方只见 assessment_unavailable + score=NULL（不伪造 0 分）');
    const retry = await fetch(`${BASE}/applications/${app1}/start`, { method: 'POST', headers: H, body: JSON.stringify({ resumeId }) });
    const retried = await readJson(retry);
    fs.appendFileSync('.tmp/e2e-consent-capture.ndjson', `${JSON.stringify({ bootId, step: 'postm7_a5_retry', retryStatus: retry.status, retriedStatus: retried?.status, retriedError: retried?.error ?? null, newInterviewId: typeof retried?.interviewId === 'string' })}\n`);
    // 【第6发现·断言随演（I2 W1 修法④ d4e51105 2026-10-11 落线·裁定⑥）】held（绑定面试 completed 的
    // hold 终态）不可重试=有意产品语义（UI startable 收窄仅 failed 可重试+API 同源拒·防拦 UI 不拦 API 穿）。
    // 旧「重试创建新 attempt」面退役 → 契约钉随演为 409 application_held_not_retryable fail-closed
    // （不开新 attempt·不暴露分·message「本场面试已完成，评分待校准；无需重新开始」）。
    A(retry.status === 409 && retried.error === 'application_held_not_retryable',
      `[状态机·held] 评分待校准 hold 后显式重试 start → 409 application_held_not_retryable(不可重试 fail-closed·I2 W1 随演)(实际 ${retry.status}/${retried.error ?? 'n/a'})`);
  } else {
    A(cand?.status === 'completed' && Number.isInteger(cand?.score) && cand.score >= 0 && cand.score <= 100,
      `[状态机·可信] 招聘方看到 completed + **服务端推导**分数=${cand?.score}(非自报,跨方 RLS 可读)`);
  }

  /* ════════ 第 10 段 · e2e-scene-batch2:R4 隐私升 LIVE(A/B 两臂)+ R5 同意撤回九步 ════════
   * 卷尾追加落点(§1):既有全部简历/面试依赖断言已完成,擦除面后置零扰动。产品码+scripts 零字节。
   * est live=0 场量级:R4 零 begin 零模型(空壳不 begin/围栏 410 扫/DB SELECT-only),R5 同意三态+文本上传纯本地摄取。
   * 如实边界:软删受理≠物理清除(purgePending 恒真直至 S2·响应永不携带完成态字段);interview-data
   * 公开 DELETE 503 冻结面正面行使(pin 值不翻·resume-data 202 升面不在 pin 立法域·两分读法)。
   * EXEC 重 pin(2026-10-11 实读更正):privacy.service deleteResumeData :81-99 / HMAC 回落 AUTH_SECRET
   * :101-108 / interview-data 恒 throw :67-71;privacy.controller DELETE resume-data=202 :67-71;
   * resume.service 文本同意门 403 :203 / list 过滤 :226 / profile RLS 0 行 404 :312 / deduped :205;
   * interview.service 围栏先判序 :521;四表=0001_baseline:38(interview_event)/:224(ai_report)/
   * :253(interview_job)+0019_schema_drift_reconcile:19(question_feedback)。
   * 0152 笔误更正(备查登记):仓内双 0152 重号=0152_consent_revoke_grant+0152_resume_soft_delete_fence;
   * 墓碑=privacy_begin_resume_soft_delete(后者)·resume.erasure_requested_at 同文件补列。
   */
  console.log('\n── e2e-scene-batch2 · R4-A resume-data 全量软删(202 两态·过滤≠物理删除如实) ──');
  // 无体请求剥 content-type:JSON 头+零长体会被 body-parser 400 拒(「Body cannot be empty when
  // content-type is set to application/json」)——无体 DELETE/POST 沿 proof 蓝本纯 authorization 头形。
  const noCT = (h: Record<string, string>): Record<string, string> => Object.fromEntries(Object.entries(h).filter(([k]) => k !== 'content-type'));
  {
    // R4-A-1 前置读:主旅程既有 resumeId 在册(软删前证据·resume.service list 过滤 :226 尚未排除)。
    const listBefore = await readJson(await fetch(`${BASE}/resume`, { headers: H }));
    A(Array.isArray(listBefore.resumes) && listBefore.resumes.some((x: any) => x.id === resumeId),
      `[R4-A-1] 软删前 GET /resume 在册:resumes 含主旅程 resumeId(${String(resumeId).slice(0, 8)})`);

    // R4-A-2 DELETE → 202 软删受理:mode=logical+purgePending(恒真)+resumesFenced≥1+requestId 在场。
    const eraseRes = await fetch(`${BASE}/privacy/resume-data`, { method: 'DELETE', headers: noCT(H) });
    const eraseBody = await readJson(eraseRes);
    A(eraseRes.status === 202 && eraseBody.mode === 'logical' && eraseBody.purgePending === true
      && Number(eraseBody.resumesFenced) >= 1 && typeof eraseBody.requestId === 'string',
      `[R4-A-2] DELETE /privacy/resume-data → 202 软删受理(mode=logical+purgePending=true·S2 前 residual 非完成态)+resumesFenced=${eraseBody.resumesFenced}≥1+requestId 在场`);

    // R4-A-3 重放 → 202 ∧ resumesFenced=0(空集同形幂等·不建第二份账)。
    const eraseReplayRes = await fetch(`${BASE}/privacy/resume-data`, { method: 'DELETE', headers: noCT(H) });
    const eraseReplay = await readJson(eraseReplayRes);
    A(eraseReplayRes.status === 202 && eraseReplay.mode === 'logical' && eraseReplay.purgePending === true
      && eraseReplay.resumesFenced === 0,
      `[R4-A-3] 重放 DELETE → 202 ∧ resumesFenced=0(空集同形幂等·202 形如实)`);

    // R4-A-4 list 重读:resumes 零含 resumeId(S1 即时可见面)。
    const listAfter = await readJson(await fetch(`${BASE}/resume`, { headers: H }));
    A(Array.isArray(listAfter.resumes) && !listAfter.resumes.some((x: any) => x.id === resumeId),
      `[R4-A-4] 软删后 list 零含:resumes 不再含 resumeId(即时可见面)`);

    // R4-A-5 profile → 404(0063 active-read RLS 0 行链·父行非 ingested)。直 fetch 取 Response(helper 丢 status 面·席2 登记3)。
    const profileRes = await fetch(`${BASE}/resume/${resumeId}/profile`, { headers: H });
    const profileBody = await readJson(profileRes);
    A(profileRes.status === 404 && profileBody.error === 'not_found_or_forbidden',
      `[R4-A-5] 软删后 profile → 404 not_found_or_forbidden(0063 active-read RLS 0 行→404)`, 'data_or_permission');

    // R4-A-6 数据可携导出排除已删(privacy.service export :52 NOT IN erasure_fenced,erased)。
    const exportBody = await readJson(await fetch(`${BASE}/privacy/export`, { headers: H }));
    A(Array.isArray(exportBody.resumes) && !exportBody.resumes.some((x: any) => x.id === resumeId),
      `[R4-A-6] GET /privacy/export 零含 resumeId(数据可携不含已删数据)`);

    console.log('✓ R4-A resume-data 全量软删面 PASS(202 两态+读门+导出·物理行证在下 DB 直连段)');
  }

  console.log('\n── e2e-scene-batch2 · R4-B interview 预览围栏(零 begin 零 live·503 pin 正面行使) ──');
  {
    const fenceTag = randomUUID();
    // R4-B-1 新建空壳:主用户既有面试全终态(completed/failed/abandoned 均被 create 复用过滤排除)→ reused=false。
    const createRes = await fetch(`${BASE}/interview`, { method: 'POST', headers: H, body: '{}' });
    const created = await readJson(createRes);
    const fencedIv = created.interviewId ?? created.id ?? created.resultId;
    A((createRes.status === 200 || createRes.status === 201) && created.reused === false && typeof fencedIv === 'string',
      `[R4-B-1] 新建空壳面试 → 新 id(${String(fencedIv).slice(0, 8)}) ∧ reused=false(全终态不复用·零 begin 零 live)`);

    // R4-B-2 公开 DELETE → 503 正面行使(冻结面·privacy.service :67-71 恒 throw·重放同形)。
    const fenceKey = `e2e-erase-${tag}-${fenceTag}`;
    const delRes = await fetch(`${BASE}/privacy/interview-data/${fencedIv}`, { method: 'DELETE', headers: { ...noCT(H), 'idempotency-key': fenceKey } });
    const delBody = await readJson(delRes);
    A(delRes.status === 503 && delBody.error === 'interview_erasure_authorization_not_available',
      `[R4-B-2] 公开 DELETE interview-data → 503 interview_erasure_authorization_not_available(503 pin 正面行使·冻结面不开闸)`);

    // R4-B-2b 同键重放仍 503(不因重放建账·proof 同形)。
    const delReplayRes = await fetch(`${BASE}/privacy/interview-data/${fencedIv}`, { method: 'DELETE', headers: { ...noCT(H), 'idempotency-key': fenceKey } });
    const delReplayBody = await readJson(delReplayRes);
    A(delReplayRes.status === 503 && delReplayBody.error === 'interview_erasure_authorization_not_available',
      `[R4-B-2b] 同键重放 DELETE 仍 503(不建账本)`);

    // R4-B-3 预览 → 202 local_fenced+预览版+sinks≥22(user_memory=honest_unresolved)。
    const previewKey = `e2e-preview-${tag}-${fenceTag}`;
    const previewRes = await fetch(`${BASE}/privacy/erasure-preview`, {
      method: 'POST', headers: { ...H, 'idempotency-key': previewKey },
      body: JSON.stringify({ scope: 'interview_data', subjectId: fencedIv }),
    });
    const previewBody = await readJson(previewRes);
    const sinkLines: any[] = Array.isArray(previewBody.sinks) ? previewBody.sinks : [];
    A(previewRes.status === 202 && previewBody.status === 'local_fenced' && previewBody.editionLabel === '预览版'
      && previewBody.productionSloClaimed === false && previewBody.completeness === 'preview_incomplete'
      && sinkLines.length >= 22 && sinkLines.some((s: any) => s.sink === 'user_memory' && s.disposition === 'honest_unresolved'),
      `[R4-B-3] 预览擦除 → 202 local_fenced:预览版+productionSloClaimed=false+preview_incomplete+sinks=${sinkLines.length}≥22(user_memory=honest_unresolved 如实)`);

    // R4-B-4 GET 回执同 requestId。
    const receiptRes = await fetch(`${BASE}/privacy/erasure-preview/${previewBody.requestId}`, { headers: H });
    const receiptBody = await readJson(receiptRes);
    A(receiptRes.status === 200 && receiptBody.requestId === previewBody.requestId,
      `[R4-B-4] GET 预览回执 → 200 ∧ 同 requestId(${String(previewBody.requestId ?? '').slice(0, 8)})`);

    // ── DB 直连 SELECT-only(g7fix1 同契约·缺 env 即 throw fail-closed·连接 finally 释放)──
    const { createRequire } = await import('node:module');
    const { Client } = createRequire(new URL('../packages/db/package.json', import.meta.url))('pg');
    for (const n of ['PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE']) if (!process.env[n]) throw new Error(`[privacy-db] ${n} missing — isolated runner env contract required`);
    const pgc = new Client({ host: process.env.PGHOST, port: Number(process.env.PGPORT), user: process.env.PGUSER, password: process.env.PGPASSWORD, database: process.env.PGDATABASE, ssl: false, connectionTimeoutMillis: 2000 });
    await pgc.connect();
    try {
      // R4-A-7 物理行如实记账:列表过滤 ≠ 物理删除(0152 墓碑 status+erasure_requested_at·purge 归 S2)。
      const tomb = await pgc.query('SELECT status, erasure_requested_at FROM resume WHERE id=$1', [resumeId]);
      A(tomb.rowCount === 1 && tomb.rows[0]?.status === 'erasure_fenced' && tomb.rows[0]?.erasure_requested_at !== null,
        `[R4-A-7] DB 直连:resume 物理行仍在(恰 1 行)∧ status=erasure_fenced ∧ erasure_requested_at 非空(过滤≠物理删除·purgePending 恒真直至 S2)`);

      // R4-B-6 前读:四表按该 id 计数全 0(0001:38/:224/:253+0019:19·begin 写面反证:preview begin 只写预览两表+账本族)。
      const fourTables = `SELECT
        (SELECT count(*)::int FROM interview_event WHERE stream_key=$1) AS events,
        (SELECT count(*)::int FROM ai_report WHERE interview_id=$1) AS reports,
        (SELECT count(*)::int FROM question_feedback WHERE interview_id=$1) AS feedback,
        (SELECT count(*)::int FROM interview_job WHERE interview_id=$1) AS jobs`;
      const beforeScan = await pgc.query(fourTables, [fencedIv]);
      A(Number(beforeScan.rows[0]?.events) === 0 && Number(beforeScan.rows[0]?.reports) === 0
        && Number(beforeScan.rows[0]?.feedback) === 0 && Number(beforeScan.rows[0]?.jobs) === 0,
        `[R4-B-6a] 围栏后四表前读全 0:interview_event/ai_report/question_feedback/interview_job 按 id 计数=0(围栏零写证)`);

      // R4-B-5 围栏后十端点扫 → 全 410(合法 DTO 体抵达 guard·围栏先判序 interview.service :521·Ban 400 冒充 410)。
      const { createHash } = await import('node:crypto');
      const turnAnswer = '预览围栏后不得落库的答案';
      const legalTurn = {
        questionId: 'q-v1-t0-c0', stateVersion: 1, turn: 0,
        answerId: '00000000-0000-4000-8000-000000000001',
        answerHash: createHash('sha256').update(turnAnswer, 'utf8').digest('hex'),
        answer: turnAnswer,
      };
      const scan: Array<[string, Response]> = [];
      scan.push(['GET interview', await fetch(`${BASE}/interview/${fencedIv}`, { headers: H })]);
      scan.push(['POST begin', await fetch(`${BASE}/interview/${fencedIv}/begin`, { method: 'POST', headers: { ...H, 'resume-id': '00000000-0000-4000-8000-000000000002' }, body: '{}' })]);
      scan.push(['POST abandon', await fetch(`${BASE}/interview/${fencedIv}/abandon`, { method: 'POST', headers: H, body: '{}' })]);
      scan.push(['GET events', await fetch(`${BASE}/interview/${fencedIv}/events`, { headers: H })]);
      scan.push(['GET report', await fetch(`${BASE}/interview/${fencedIv}/report`, { headers: H })]);
      scan.push(['POST report/retry', await fetch(`${BASE}/interview/${fencedIv}/report/retry`, { method: 'POST', headers: noCT(H) })]);
      scan.push(['GET report/export', await fetch(`${BASE}/interview/${fencedIv}/report/export`, { headers: H })]);
      scan.push(['GET transcript', await fetch(`${BASE}/interview/${fencedIv}/transcript`, { headers: H })]);
      const turnFenceRes = await fetch(`${BASE}/interview/${fencedIv}/turn`, { method: 'POST', headers: H, body: JSON.stringify(legalTurn) });
      scan.push(['POST turn', turnFenceRes]);
      scan.push(['POST feedback', await fetch(`${BASE}/interview/${fencedIv}/questions/0/feedback`, { method: 'POST', headers: H, body: JSON.stringify({ rating: 'up' }) })]);
      const offList = await readJson(await fetch(`${BASE}/interview`, { headers: H }));
      A(scan.length === 10 && scan.every(([, res]) => res.status === 410),
        `[R4-B-5] 围栏后十端点扫 → 全 410(GET interview/begin/abandon/events/report/report.retry/report.export/transcript/turn[合法 TurnDto]/feedback)`);
      const turnFenceBody = await readJson(turnFenceRes);
      A(turnFenceBody.error === 'interview_privacy_fenced',
        `[R4-B-5b] /turn 围栏体核:error=interview_privacy_fenced(合法体抵达 guard·410 非 400)`);
      A(Array.isArray(offList.interviews) && !offList.interviews.some((x: any) => x.id === fencedIv),
        `[R4-B-5c] C 端 list 不含围栏 id(interviews 零泄露)`);

      // R4-B-6 后读:410 扫后仍全 0=零增长定谳面。
      const afterScan = await pgc.query(fourTables, [fencedIv]);
      A(Number(afterScan.rows[0]?.events) === 0 && Number(afterScan.rows[0]?.reports) === 0
        && Number(afterScan.rows[0]?.feedback) === 0 && Number(afterScan.rows[0]?.jobs) === 0,
        `[R4-B-6b] 410 扫后四表后读仍全 0(零增长·前后读零定谳)`);
    } finally {
      await pgc.end().catch(() => {});
    }

    console.log('✓ R4-B interview 预览围栏面 PASS(503 pin 正面行使+preview 202+410 扫+四表读零)');
  }

  console.log('\n── e2e-scene-batch2 · R5 同意撤回九步(独立用户 e2e7_·零 live) ──');
  {
    const withdrawer = await signupOrLogin(`e2e7_${tag}@x.com`, password);
    const WH = withdrawer.headers;
    A(withdrawer.response.status === 200 && typeof withdrawer.token === 'string',
      `[R5-0] 独立用户 e2e7_ 注册 → 真 Bearer(撤回面独立主用户·零额度依赖)`);

    // R5-1 授予(POST consent 幂等面:已同意不重插行·回 policyVersion)。
    const grant = await consentResumeProcessing(WH);
    A(grant.response.status === 200 && grant.body.recorded === true && typeof grant.body.policyVersion === 'string' && grant.body.policyVersion.length > 0,
      `[R5-1] POST /privacy/consent → 200 ∧ recorded=true ∧ policyVersion 非空(${grant.body.policyVersion})`);

    // R5-2 状态读。
    const st1 = await readJson(await fetch(`${BASE}/privacy/consent?purpose=resume_processing`, { headers: WH }));
    A(st1.consented === true, `[R5-2] GET consent 状态 → consented=true`);

    // R5-3 文本上传(纯本地摄取·零模型零额度)。
    const resumeText7 = '合成后端工程师简历:五年 Java/Go 后端,熟悉 PostgreSQL 索引与查询优化、Redis 缓存、Kafka 消息队列与 Kubernetes 部署运维。';
    const up1 = await uploadTextResume(WH, resumeText7);
    A(up1.response.status === 200 && typeof up1.body.resumeId === 'string',
      `[R5-3] 文本简历上传 → 200 ∧ resumeId(${up1.body.status})`);
    const resumeId7: string = up1.body.resumeId;

    // R5-4 撤回(G4:撤回=停止后续使用·已落 checkpoint/事件不回溯)。
    const wdRes = await fetch(`${BASE}/privacy/consent?purpose=resume_processing`, { method: 'DELETE', headers: noCT(WH) });
    const wdBody = await readJson(wdRes);
    A(wdRes.status === 200 && wdBody.withdrawn === true,
      `[R5-4] DELETE /privacy/consent 撤回 → 200 ∧ withdrawn=true`);

    // R5-5 状态翻 false。
    const st2 = await readJson(await fetch(`${BASE}/privacy/consent?purpose=resume_processing`, { headers: WH }));
    A(st2.consented === false, `[R5-5] 撤回后 GET 状态 → consented=false`);

    // R5-6 重上传 → 403 consent_required(resume.service :203 硬门·先于扣费预留)。
    const unitsBefore403 = (await entitlement(WH)).availableUnits ?? 0;
    const up2 = await uploadTextResume(WH, resumeText7);
    const unitsAfter403 = (await entitlement(WH)).availableUnits ?? 0;
    A(up2.response.status === 403 && up2.body.error === 'consent_required' && up2.body.purpose === 'resume_processing',
      `[R5-6] 撤回后重上传 → 403 consent_required+purpose=resume_processing(硬门如实·:203)`, 'data_or_permission');
    A(unitsAfter403 === unitsBefore403,
      `[R5-6b] 403 后额度零泄漏(同意门先于扣费预留:${unitsBefore403}→${unitsAfter403})`);

    // R5-7 撤回≠擦除定谳面(Non-claims 行为证:已落数据不回溯清除)。
    const prof7Res = await fetch(`${BASE}/resume/${resumeId7}/profile`, { headers: WH });
    const prof7 = await readJson(prof7Res);
    A(prof7Res.status === 200 && prof7.structured && typeof prof7.structured === 'object' && Object.keys(prof7.structured).length >= 1,
      `[R5-7] 撤回≠擦除:既有 profile 仍 200 ∧ structured 非空(不回溯清除·Non-claims 行为证)`);

    // R5-8 重授予。
    const regrant = await consentResumeProcessing(WH);
    const st3 = await readJson(await fetch(`${BASE}/privacy/consent?purpose=resume_processing`, { headers: WH }));
    A(regrant.response.status === 200 && regrant.body.recorded === true && st3.consented === true,
      `[R5-8] 重授予 POST consent → 200 ∧ 状态翻回 consented=true`);

    // R5-9 恢复上传:deduped 复用同 id(部分唯一索引 WHERE status 子句命中·撤回不触 resume 行核·如实不假称新建)。
    const up3 = await uploadTextResume(WH, resumeText7);
    A(up3.response.status === 200 && up3.body.resumeId === resumeId7 && up3.body.status === 'deduped',
      `[R5-9] 恢复后重上传 → 200 ∧ deduped 复用同 resumeId(${String(resumeId7).slice(0, 8)})(撤回不触行核·如实复用非新建)`);

    console.log('✓ R5 同意撤回九步 PASS(授予→撤回→403 门→撤回≠擦除→重授予→deduped 恢复)');
  }

  reviews.emitSummary();
  console.log(`\n✓ E2E 全栈跑通(${passed()} 断言,含异常/特殊/兜底/状态机):鉴权→简历→交易→面试(真agent)→报告→B端多租户→候选人多方RLS闭环 · 终态 ${terminal}`);
}
main().catch((e) => {
  emitClassifiedE2EFailure(e, { class: 'api', code: 'client_uncaught' });
  process.exit(1);
});

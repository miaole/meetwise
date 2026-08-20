import 'reflect-metadata';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHmac, createHash, randomUUID } from 'node:crypto';
import { hashPassword } from '@meetwise/domain';
import { assertIsolatedTestTarget } from '@meetwise/db';
import { createApp } from '../src/main';
import { DbService } from '../src/platform/db.service';
import { RateLimitService } from '../src/platform/rate-limit.service';

/** 真 NestJS 结构下的请求路径自检（principal 注入 / RLS / 幂等 / SSE 重放 / 真鉴权）。 */
async function validate() {
  process.env.AUTH_DEV_HEADER = '1';                 // 测试启用 x-user-id 回退
  process.env.AUTH_SECRET = 'test-secret-key';       // 真令牌签名密钥(测试)
  process.env.RESUME_ENC_KEY = 'test-resume-enc-key';
  process.env.RESUME_HASH_SECRET = 'test-resume-hash-secret';
  process.env.PAY_PROVIDER_SECRET = 'test-pay-secret';
  // Contract tests intentionally exercise the unconfigured-provider failure
  // path.  They never inject a local fake or spend an external-model request;
  // the isolated live E2E exercises DashScope OCR/ASR/TTS separately.
  delete process.env.MODEL_API_KEY;
  delete process.env.MODEL_BASE_URL;
  const app = await createApp();
  const db = app.get(DbService);
  // The isolated runner migrates the full versioned chain, so the privacy-fence
  // triggers (0058/0059/0062) are live.  This harness seeds and reads owner-scoped
  // interview projections with bare db.pool.query() as the runtime owner, which
  // bypasses RLS but NOT the SECURITY DEFINER fence predicates that read
  // app.principal_user.  Bind a session principal on every pooled connection so
  // the seeding passes interview_privacy_active()/stream-scope checks; real HTTP
  // requests still override it per-request via DbService.asPrincipal().
  db.pool.on('connect', (client) => {
    client.query("SELECT set_config('app.principal_user', 'userA', false)").catch(() => {});
  });
  // This harness creates roles and schema objects.  It must never be runnable
  // against a developer database, RDS, or any target without the one-time
  // token injected by scripts/run-e2e-isolated.mjs.
  await assertIsolatedTestTarget(db.pool);
  await app.init();

  // The isolated runner must apply the same versioned migration chain used by
  // every other E2E target.  Rebuilding selected sql/ snapshots here used to
  // test an obsolete schema and hid migrations 0028–0049.  Keep the fallback
  // only for an explicitly isolated legacy harness, never for the public gate.
  if (process.env.E2E_PREMIGRATED !== '1') {
    for (const f of ['01_schema', '02_commerce', '03_resume', '04_report', '05_interview_jobs', '08_assessment', '09_auth', '10_learning', '11_commerce', '12_career', '13_privacy', '14_notification','15_audit','16_feedback','10_learning']) await db.pool.query(readFileSync(fileURLToPath(new URL(`../../../packages/db/sql/${f}.sql`, import.meta.url)), 'utf8'));
    await db.pool.query(readFileSync(fileURLToPath(new URL(`../../../packages/db/migrations/0015_pwd_epoch.sql`, import.meta.url)), 'utf8'));
    await db.pool.query(readFileSync(fileURLToPath(new URL(`../../../packages/db/migrations/0037_ai_model_invocation_durable_claim.sql`, import.meta.url)), 'utf8'));
    await db.pool.query(readFileSync(fileURLToPath(new URL(`../../../packages/db/migrations/0038_resume_ocr_artifact.sql`, import.meta.url)), 'utf8'));
    await db.pool.query(readFileSync(fileURLToPath(new URL(`../../../packages/db/migrations/0039_resume_derivative_erasure.sql`, import.meta.url)), 'utf8'));
    await db.pool.query(readFileSync(fileURLToPath(new URL(`../../../packages/db/sql/23_api_gateway.sql`, import.meta.url)), 'utf8'));
  }
  await db.pool.query(`INSERT INTO interview(id,owner_user_id,status) VALUES ('ABND','userA','created')`);
  await db.pool.query(`INSERT INTO interview(id,owner_user_id,status,questions) VALUES ('ASMT','userA','completed','["订单限流方案","分布式锁可靠性"]')`);
  // 图内 issueQuestionId 编码 q-v{stateVersion}-t{turn}-c{clarifyAttempts}，stateVersion 从 0 起、每题 +1：
  // turn 0 → stateVersion 1（q-v1-t0-c0），turn 1 → stateVersion 2（q-v2-t1-c0）。0021 的
  // UNIQUE(owner_user_id,interview_id,state_version) 要求同场两题 state_version 不同，故第二题用 2。
  await db.pool.query(`INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES ('userA','ASMT',1,'answer_evaluated','{"questionId":"q-v1-t0-c0","stateVersion":1,"answerId":"11111111-1111-4111-8111-111111111111","answerHash":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","turn":0,"competency":"订单","score":80}'),('userA','ASMT',2,'answer_evaluated','{"questionId":"q-v2-t1-c0","stateVersion":2,"answerId":"22222222-2222-4222-8222-222222222222","answerHash":"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb","turn":1,"competency":"并发","score":40}')`);
  await db.pool.query(`INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,competency,status,answer_id,answer_hash)
    VALUES ('userA','ASMT','q-v1-t0-c0',1,0,'订单限流方案','订单','answered','11111111-1111-4111-8111-111111111111','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'),
           ('userA','ASMT','q-v2-t1-c0',2,1,'分布式锁可靠性','并发','answered','22222222-2222-4222-8222-222222222222','bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')`);
  await db.pool.query(`INSERT INTO ai_report(owner_user_id,interview_id,status,content) VALUES ('userA','ASMT','ready','{"overall":60,"sections":[]}')`);
  // SCOR-02:generateAssessment 只读 scoring_list_scorable_score_cards(score_card),不再读 legacy
  // answer_evaluated.score 整数。按 0092/0100/0103 契约种两条合法可评分卡(订单=80/并发=40),使
  // deriveAssessment([80,40]) → overall=round((80+40)/2)=60 + 并发 gap=true + weaknesses=['并发']。
  // 逐列对齐 0100 的 NOT NULL/FK/CHECK:rubric(question_id+version 唯一)、submission(64-hex hmac)、
  // artifact(privacy_epoch>=1 + ciphertext NOT NULL)、contract(state_version 与 interview_question 对齐)、
  // score_request(status='scored' 表示 worker 已终态)、score_card(rubric_version/measurement_version/coverage)。
  const asmtRubric1 = '55555555-5555-4555-8555-555555555551';
  const asmtRubric2 = '55555555-5555-4555-8555-555555555552';
  const asmtSub1 = '66666666-6666-4666-8666-666666666661';
  const asmtSub2 = '66666666-6666-4666-8666-666666666662';
  const asmtArtifact1 = '77777777-7777-4777-8777-777777777771';
  const asmtArtifact2 = '77777777-7777-4777-8777-777777777772';
  const asmtContract1 = '88888888-8888-4888-8888-888888888881';
  const asmtContract2 = '88888888-8888-4888-8888-888888888882';
  const asmtReq1 = '99999999-9999-4999-8999-999999999991';
  const asmtReq2 = '99999999-9999-4999-8999-999999999992';
  const asmtCard1 = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
  const asmtCard2 = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2';
  const asmtHash1 = '0000000000000000000000000000000000000000000000000000000000000001';
  const asmtHash2 = '0000000000000000000000000000000000000000000000000000000000000002';
  await db.pool.query(`INSERT INTO question_rubric(id,question_id,question_version,rubric_version,competency,difficulty,language_scope,question_content_hash,status)
    VALUES ($1,'q-v1-t0-c0',1,1,'订单',3,'["zh","en"]',$3,'published'),($2,'q-v2-t1-c0',1,1,'并发',3,'["zh","en"]',$4,'published')`,
    [asmtRubric1, asmtRubric2, asmtHash1, asmtHash2]);
  await db.pool.query(`INSERT INTO interview_answer_submission(id,owner_user_id,interview_id,question_id,state_version,client_submission_key,canonical_body_hmac,privacy_epoch)
    VALUES ($1,'userA','ASMT','q-v1-t0-c0',1,'asmt-sub-1',$3,1),($2,'userA','ASMT','q-v2-t1-c0',2,'asmt-sub-2',$4,1)`,
    [asmtSub1, asmtSub2, asmtHash1, asmtHash2]);
  await db.pool.query(`INSERT INTO interview_answer_artifact(id,owner_user_id,interview_id,question_id,state_version,submission_id,ciphertext,body_hmac,hmac_key_version,enc_key_version,privacy_epoch)
    VALUES ($1,'userA','ASMT','q-v1-t0-c0',1,$3,decode('00','hex'),$5,1,1,1),($2,'userA','ASMT','q-v2-t1-c0',2,$4,decode('00','hex'),$6,1,1,1)`,
    [asmtArtifact1, asmtArtifact2, asmtSub1, asmtSub2, asmtHash1, asmtHash2]);
  await db.pool.query(`INSERT INTO issued_question_contract(id,owner_user_id,interview_id,question_id,state_version,turn,question_content_hash,rubric_id,difficulty,form,language,route,prompt_policy_version,measurement_version,privacy_epoch,status)
    VALUES ($1,'userA','ASMT','q-v1-t0-c0',1,0,$3,$5,3,'mock','zh','adaptive','prompt-v1','measure-v1',1,'issued'),
           ($2,'userA','ASMT','q-v2-t1-c0',2,1,$4,$6,3,'mock','zh','adaptive','prompt-v1','measure-v1',1,'issued')`,
    [asmtContract1, asmtContract2, asmtHash1, asmtHash2, asmtRubric1, asmtRubric2]);
  await db.pool.query(`INSERT INTO score_request(id,owner_user_id,interview_id,issued_contract_id,submission_id,artifact_id,answer_version,answer_body_hmac,privacy_epoch,operation_policy_version,idempotency_key,status)
    VALUES ($1,'userA','ASMT',$3,$5,$7,1,$9,1,'op-v1','asmt-req-1','scored'),($2,'userA','ASMT',$4,$6,$8,1,$10,1,'op-v1','asmt-req-2','scored')`,
    [asmtReq1, asmtReq2, asmtContract1, asmtContract2, asmtSub1, asmtSub2, asmtArtifact1, asmtArtifact2, asmtHash1, asmtHash2]);
  await db.pool.query(`INSERT INTO score_card(id,owner_user_id,interview_id,question_id,answer_id,submission_id,score_request_id,issued_contract_id,rubric_id,rubric_version,measurement_version,deterministic_total,coverage,status)
    VALUES ($1,'userA','ASMT','q-v1-t0-c0',$3,$5,$7,$9,$11,1,'measure-v1',80,1.0,'practice_eligible'),
           ($2,'userA','ASMT','q-v2-t1-c0',$4,$6,$8,$10,$12,1,'measure-v1',40,1.0,'practice_eligible')`,
    [asmtCard1, asmtCard2, asmtArtifact1, asmtArtifact2, asmtSub1, asmtSub2, asmtReq1, asmtReq2, asmtContract1, asmtContract2, asmtRubric1, asmtRubric2]);
  const beginResumeId = '11111111-1111-4111-8111-111111111111';
  const raceResumeId = '22222222-2222-4222-8222-222222222222';
  const abandonResumeId = '33333333-3333-4333-8333-333333333333';
  const r1ResumeId = '44444444-4444-4444-8444-444444444444';
  await db.pool.query("INSERT INTO resume(id,owner_user_id,status,content_sha,source_kind) VALUES ($1,'userA','ingested','validate-begin-reference','text'),($2,'userA','ingested','validate-race-reference','text'),($3,'userA','ingested','validate-abandon-reference','text'),($4,'userA','ingested','validate-r1-reference','text')", [beginResumeId, raceResumeId, abandonResumeId, r1ResumeId]);
  await db.pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ('R9','userB','active'),('RACE','userA','created'),('BEG1','userA','created')");
  // R1 是 active(已开面)。v64 契约要求 enqueueInterviewJob(answer) 读到 parent 的
  // (resume_id, resume_privacy_epoch) 与一条 matching v64 start job(0064 的 answer job 触发器
  // 也要求先存在 v64 start)。补全两者,使 /turn 入队 answer job 不再抛 interview_resume_reference_unavailable。
  await db.pool.query("INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ('R1','userA','active',$1,1)", [r1ResumeId]);
  await db.pool.query("INSERT INTO interview_job(owner_user_id,interview_id,kind,seq,payload,resume_id,resume_privacy_epoch,reference_schema_version,status) VALUES ('userA','R1','start',0,'{}'::jsonb,$1,1,64,'done')", [r1ResumeId]);
  // The 0059 ai_report projection fence requires its parent interview row to
  // already exist; seed the failed R1 report only after the R1 interview.
  await db.pool.query(`INSERT INTO ai_report(owner_user_id,interview_id,status) VALUES ('userA','R1','failed')`);
  await db.pool.query("INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,status) VALUES ('userA','R1','q-v1-t0-c0',1,0,'R1 current question','issued')");
  await db.pool.query("INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES ('userA','R1',1,'question_ready','{}')");
  await db.pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ('userA','paid',5.0, now()+interval '300 days')");
  await db.pool.query("INSERT INTO consent_record(id,owner_user_id,purpose,policy_version) VALUES ('c1','userA','resume_processing','v1'),('c2','userB','resume_processing','v1')");
  await db.pool.query('INSERT INTO user_account(id,email,password_hash) VALUES ($1,$2,$3)', ['cpUser','cp@x.com', hashPassword('oldpass12')]);
  await db.pool.query("INSERT INTO user_account(id,email,password_hash,is_admin) VALUES ('userA','ua@x.com','scrypt$x$y',false),('adminU','admin@x.com','scrypt$a$b',true),('victimU','v@x.com','scrypt$v$w',false)");
  await db.pool.query("INSERT INTO payment_order(id,owner_user_id,product_id,amount_cents,units,status) VALUES ('o1','userB','pack_10',9900,10,'paid')");
  await db.pool.query("INSERT INTO notification(id,owner_user_id,kind,payload) VALUES ('n1','userA','report_ready','{\"overall\":76}'),('n2','userA','report_ready','{}')");

  await app.listen(0, '127.0.0.1');
  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  const req = async (method: string, path: string, headers: Record<string, string> = {}) => {
    const res = await fetch(base + path, { method, headers });
    return { status: res.status, body: await res.json().catch(() => ({})) as any };
  };
  let fails = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fails++; };
  let r;
  const probePool = db.pool as unknown as { query: (...args: any[]) => Promise<any> };
  const originalProbeQuery = probePool.query.bind(probePool);
  let readinessQueryCount = 0;
  probePool.query = async (...args: any[]) => { readinessQueryCount++; return originalProbeQuery(...args); };
  r = await req('GET', '/livez'); A('存活探针公开且不读 DB → 200 + 固定 ok', r.status === 200 && r.body.status === 'ok' && readinessQueryCount === 0);
  r = await req('GET', '/readyz/api'); A('API 就绪探针 → 200 + 仅 SELECT 1', r.status === 200 && r.body.status === 'ok' && readinessQueryCount === 1);
  r = await req('GET', '/health'); A('旧 /health 兼容映射 API 就绪探针', r.status === 200 && r.body.status === 'ok' && readinessQueryCount === 2);
  probePool.query = async () => { readinessQueryCount++; throw new Error('simulated_probe_dependency_failure'); };
  r = await req('GET', '/readyz/api'); A('DB 失败时 readyz/api → 503 最小降级体', r.status === 503 && r.body.status === 'degraded' && r.body.error === undefined);
  r = await req('GET', '/livez'); A('DB 失败不误杀 livez，且不额外读 DB', r.status === 200 && r.body.status === 'ok' && readinessQueryCount === 3);
  r = await req('GET', '/health'); A('DB 失败时旧 /health 同样 fail-closed → 503', r.status === 503 && r.body.status === 'degraded' && r.body.error === undefined);
  probePool.query = originalProbeQuery;
  const corsRes = await fetch(base + '/livez', { headers: { origin: 'http://localhost:3000' } });
  A('CORS:跨域请求返回 Access-Control-Allow-Origin(浏览器前端可调)', !!corsRes.headers.get('access-control-allow-origin'));
  r = await req('GET', '/interview/R1'); A('无 principal → 401（fail-closed）', r.status === 401);
  r = await req('GET', '/interview/R1', { 'x-user-id': 'userB' }); A('userB 越权 GET R1 → 404（RLS 0 行）', r.status === 404);
  r = await req('GET', '/interview/R1', { 'x-user-id': 'userA' });
  A('userA GET 自己的零轮 R1 → 权威题目账本投影全为零/空', r.status === 200 && r.body.id === 'R1'
    && r.body.issued_turns === 0 && r.body.answered_turns === 0 && r.body.current_turn === null && r.body.processing_turn === null);
  r = await req('GET', '/interview', { 'x-user-id': 'userA' });
  A('面试列表同样携带 required 进度投影', r.status === 200 && r.body.interviews?.some((item: any) => item.id === 'R1'
    && item.issued_turns === 0 && item.answered_turns === 0 && item.current_turn === null && item.processing_turn === null));
  const legacyBefore = await db.pool.query("SELECT count(*)::int n FROM interview_event WHERE stream_key='R1' AND kind='answer_evaluated'");
  r = await req('POST', '/interview/R1/answer', { 'x-user-id': 'userA', 'idempotency-key': 'k1' }); A('legacy /answer → 410，必须改用 question-bound /turn', r.status === 410 && r.body.error === 'legacy_answer_endpoint_disabled');
  r = await req('POST', '/interview/R1/answer', { 'x-user-id': 'userB', 'idempotency-key': 'k2' }); A('legacy /answer 对跨主体同样统一 410，不作资源 oracle', r.status === 410 && r.body.error === 'legacy_answer_endpoint_disabled');
  const legacyAfter = await db.pool.query("SELECT count(*)::int n FROM interview_event WHERE stream_key='R1' AND kind='answer_evaluated'");
  A('legacy /answer 不新增 answer_evaluated', legacyAfter.rows[0].n === legacyBefore.rows[0].n);

  // 生产端点:begin(扣额度+入队 start)/ turn(入队 answer)——真请求经队列驱动 worker
  const postJson = async (path: string, headers: Record<string, string>, body: any) => {
    const res = await fetch(base + path, { method: 'POST', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    return { status: res.status, body: await res.json().catch(() => ({})) as any };
  };
  const patchJson = async (path: string, headers: Record<string, string>, body: any) => {
    const res = await fetch(base + path, { method: 'PATCH', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    return { status: res.status, body: await res.json().catch(() => ({})) as any };
  };
  // begin 系列打 BEG1(created 态)——begin 只对 created 生效;R1 是 active(已开面)专供下方 /turn。
  r = await req('POST', '/interview/BEG1/begin', { 'x-user-id': 'userA' }); A('begin 缺 resume-id → 400', r.status === 400);
  r = await req('POST', '/interview/BEG1/begin', { 'x-user-id': 'userA', 'resume-id': beginResumeId }); A('begin → 202 受理 + 入队 start job', r.status === 202 && r.body.accepted === true);
  let q = await db.pool.query("SELECT count(*)::int n FROM interview_job WHERE interview_id='BEG1' AND kind='start'"); A('start job 已落队列', q.rows[0].n === 1);
  const balPreBegin = (await (async()=>{const x=await fetch(base+'/commerce/entitlement',{headers:{'x-user-id':'userA'}});return ((await x.json()) as { availableUnits: number }).availableUnits;})());
  r = await req('POST', '/interview/BEG1/begin', { 'x-user-id': 'userA', 'resume-id': beginResumeId }); A('重复 begin → 幂等(alreadyBegun)', r.status === 202 && r.body.alreadyBegun === true);
  q = await db.pool.query("SELECT count(*)::int n FROM interview_job WHERE interview_id='BEG1' AND kind='start'"); A('重复 begin 不再入第二个 start job', q.rows[0].n === 1);
  const balPostBegin = (await (async()=>{const x=await fetch(base+'/commerce/entitlement',{headers:{'x-user-id':'userA'}});return ((await x.json()) as { availableUnits: number }).availableUnits;})());
  A('重复 begin 不再二次扣额度', balPostBegin === balPreBegin);
  // 并发竞态:同时 2 个 begin(Promise.all)→ advisory 锁串行化 → 只 1 个 start job(不双开)
  await Promise.all([
    fetch(base + '/interview/RACE/begin', { method: 'POST', headers: { 'x-user-id': 'userA', 'resume-id': raceResumeId } }),
    fetch(base + '/interview/RACE/begin', { method: 'POST', headers: { 'x-user-id': 'userA', 'resume-id': raceResumeId } }),
  ]);
  const raceJobs = (await db.pool.query("SELECT count(*)::int n FROM interview_job WHERE interview_id='RACE' AND kind='start'")).rows[0].n;
  A('并发 begin 竞态安全:只 1 个 start job(advisory 锁串行)', raceJobs === 1);
  r = await req('POST', '/interview/R9/begin', { 'x-user-id': 'userA', 'resume-id': beginResumeId }); A('userA 对 userB 的 R9 begin → 404(RLS)', r.status === 404);
  const answer = '我的答案';
  const turnBody = (turn: number, text: string, questionId = `q-v1-t${turn}-c0`, stateVersion = 1) => ({ questionId, stateVersion, answerId: randomUUID(), answerHash: createHash('sha256').update(text).digest('hex'), turn, answer: text });
  const validTurn = turnBody(0, answer);
  r = await postJson('/interview/R1/turn', { 'x-user-id': 'userA' }, validTurn); A('turn → 202 + 入队 answer job', r.status === 202 && r.body.accepted === true && r.body.replayed === false);
  r = await postJson('/interview/R1/turn', { 'x-user-id': 'userA' }, validTurn); A('网络重试同一 answer identity → 202 replayed,不二次领取题', r.status === 202 && r.body.accepted === false && r.body.replayed === true);
  r = await postJson('/interview/R1/turn', { 'x-user-id': 'userA' }, { turn: 0, answer: '' }); A('turn 空答案 → 400', r.status === 400);
  // [安全审计 F1] turn 号无上界 → 每个不同 turn 刷一条付费评分 job(成本 DoS)。断言超上界被拒。
  r = await postJson('/interview/R1/turn', { 'x-user-id': 'userA' }, turnBody(99999, 'x')); A('[F1] 超大 turn 号(>MAX_TURN)→ 400(防刷无限付费 job)', r.status === 400 && r.body.error === 'invalid_turn');
  r = await postJson('/interview/R1/turn', { 'x-user-id': 'userA' }, turnBody(1, 'a'.repeat(9000))); A('[F1] 超长作答(>8000字)→ 400(契约 zod 上限先拦;service resolveOverlongAnswerPolicy 为纵深兜底)', r.status === 400);
  // [安全审计 F1/F7] 状态机守卫:对已终态(completed)面试提交 → 409,绝不制造新付费 job / 注入伪造事件。
  r = await postJson('/interview/ASMT/turn', { 'x-user-id': 'userA' }, turnBody(0, '事后补答')); A('[F1] 对 completed 面试 turn → 409 interview_not_active(状态机守卫)', r.status === 409 && r.body.error === 'interview_not_active');
  r = await req('POST', '/interview/ASMT/answer', { 'x-user-id': 'userA', 'idempotency-key': 'ka-terminal' }); A('[F7] 对 completed 面试 legacy /answer → 410（端点无条件停用）', r.status === 410 && r.body.error === 'legacy_answer_endpoint_disabled');
  // [qbank 审计 #1] 守卫拒绝 __system* 保留 sentinel 作绑定主体(防 dev-header 冒充受信 qbank 写入方)。
  r = await req('GET', '/interview/R1', { 'x-user-id': '__system_qbank__' }); A('[qbank] x-user-id 冒充系统 sentinel → 401 reserved_principal(投毒门端到端)', r.status === 401 && r.body.error === 'reserved_principal');
  // [安全审计 F1/F5/F8 共享执行原语] 限流/并发槽是 turn 成本闸(F1)、SSE 并发上限(F5)、招聘邀请枚举闸(F8)的共同实现,确定性单测它=证明三者的拦截逻辑。
  {
    const rl = app.get(RateLimitService);
    let allowed = 0; const t0 = 1_000_000;
    for (let i = 0; i < 5; i++) if (rl.allow('rl-test', 3, 0.1, t0)) allowed++;   // 突发容量 3 → 前 3 个放行、后 2 个拒
    A('[F1/F8] 令牌桶:突发容量 3 → 恰放行 3 个(第4/5被限流)', allowed === 3);
    A('[F1/F8] 令牌桶补充:10 秒后按 0.1/秒补 1 个令牌 → 再放行 1', rl.allow('rl-test', 3, 0.1, t0 + 10_000) === true);
    A('[F5] 并发槽 acquireSlot:上限 2 → 前 2 占用成功、第 3 拒', rl.acquireSlot('sse-test', 2) && rl.acquireSlot('sse-test', 2) && rl.acquireSlot('sse-test', 2) === false);
    rl.releaseSlot('sse-test');
    A('[F5] release 后腾出一槽 → 可再 acquire(长连接断开释放,不永久占用)', rl.acquireSlot('sse-test', 2) === true);
  }
  q = await db.pool.query("SELECT count(*)::int n FROM interview_job WHERE interview_id='R1' AND kind='answer'"); A('answer job 已落队列', q.rows[0].n === 1);
  // 放弃面试:退还预留额度(不漏扣)
  const balBefore = (await req('GET', '/commerce/entitlement', { 'x-user-id': 'userA' })).body?.availableUnits ?? (await (async()=>{const r2=await fetch(base+'/commerce/entitlement',{headers:{'x-user-id':'userA'}});return ((await r2.json()) as { availableUnits: number }).availableUnits;})());
  r = await req('POST', '/interview/ABND/begin', { 'x-user-id': 'userA', 'resume-id': abandonResumeId }); A('ABND begin → 202(预留 1.0)', r.status === 202);
  const balReserved = (await (async()=>{const r2=await fetch(base+'/commerce/entitlement',{headers:{'x-user-id':'userA'}});return ((await r2.json()) as { availableUnits: number }).availableUnits;})());
  A('预留后额度 -1.0', balReserved === balBefore - 1.0);
  r = await postJson('/interview/ABND/abandon', { 'x-user-id': 'userA' }, {}); A('放弃面试 → 200 + released', r.status === 200 && r.body.abandoned === true);
  const balAfter = (await (async()=>{const r2=await fetch(base+'/commerce/entitlement',{headers:{'x-user-id':'userA'}});return ((await r2.json()) as { availableUnits: number }).availableUnits;})());
  A('放弃后额度退还(不漏扣,回到 begin 前)', balAfter === balBefore);
  r = await postJson('/interview/ABND/abandon', { 'x-user-id': 'userB' }, {}); A('userB 越权放弃 → 404', r.status === 404);

  // 真鉴权:注册/登录签发会话令牌 → Bearer 校验经守卫
  r = await postJson('/auth/signup', {}, { email: 'a@x.com', password: 'short' }); A('注册弱密码(<8) → 400', r.status === 400);
  r = await postJson('/auth/signup', {}, { email: 'a@x.com', password: 'strongpw123' }); A('注册 → 200 + 签发令牌', r.status === 200 && typeof r.body.token === 'string');
  const token = r.body.token;
  r = await postJson('/auth/signup', {}, { email: 'a@x.com', password: 'strongpw123' }); A('邮箱重复 → 409', r.status === 409);
  r = await postJson('/auth/login', {}, { email: 'a@x.com', password: 'wrongpw99' }); A('登录错密码 → 401', r.status === 401);
  r = await postJson('/auth/login', {}, { email: 'a@x.com', password: 'strongpw123' }); A('登录 → 200 + 令牌', r.status === 200 && typeof r.body.token === 'string');
  r = await req('GET', '/interview/R1', { authorization: `Bearer ${token}` }); A('合法 Bearer → 过守卫(非401;非owner则404)', r.status !== 401);
  r = await req('GET', '/interview/R1', { authorization: 'Bearer garbage.sig' }); A('伪造 Bearer → 401 fail-closed', r.status === 401);
  // 登录限流(防爆破):同邮箱连续错密码,超 5 次突发 → 429
  let got429 = false;
  for (let i = 0; i < 8; i++) { const lr = await postJson('/auth/login', {}, { email: 'brute@x.com', password: 'wrong' + i }); if (lr.status === 429) { got429 = true; break; } }
  A('登录爆破超限 → 429(防暴力破解)', got429);

  // 简历摄取 HTTP:上传加密+结构化,profile 永不含明文 PII,RLS 隔离
  r = await postJson('/resume', { 'x-user-id': 'userA' }, { text: '短' }); A('简历过短 → 400', r.status === 400);
  r = await postJson('/resume', { 'x-user-id': 'noConsentUser' }, { text: '工作经历\n负责限流\n技能 Redis、限流、分布式锁' }); A('PIPL门槛:无同意上传简历 → 403(不偷偷处理 PII)', r.status === 403 && r.body.error === 'consent_required');
  let lr = await req('GET', '/legal/policy', { 'x-user-id': 'userA' }); A('法务政策(公开)→ version + 采集目的 + 数据权利', lr.status === 200 && lr.body.version === 'preview-v1' && lr.body.purposes.length >= 2 && lr.body.dataRights.length >= 1);
  // 运营 admin:特权跨用户只读 + 非 admin 403(承重授权)
  r = await req('GET', '/admin/users', { 'x-user-id': 'userA' }); A('非 admin 访问 → 403 fail-closed', r.status === 403);
  r = await req('GET', '/admin/users', { 'x-user-id': 'adminU' }); A('admin 看全量用户(跨用户特权,不含密码)', r.status === 200 && r.body.users.length >= 2 && r.body.users.every((u: any) => u.password_hash === undefined));
  r = await req('GET', '/admin/orders', { 'x-user-id': 'adminU' }); A('admin 看全量订单(跨用户)', r.status === 200 && r.body.orders.some((o: any) => o.owner_user_id === 'userB'));
  r = await req('GET', '/admin/stats', { 'x-user-id': 'adminU' }); A('admin 看统计(用户数/订单/已付额)', r.status === 200 && r.body.users >= 2 && r.body.paidCents === 9900);
  // 题目反馈(AI 质量信号)+ admin 聚合。反馈原文是用户内容：当前路径只能
  // 入本业务表，绝不能触发模型调用、写入 trace 或被随后外送到 Langfuse。
  const feedbackSentinel = 'feedback-comment-must-never-enter-ai-trace-v1';
  const feedbackTraceBefore = Number((await db.pool.query('SELECT count(*)::int n FROM ai_invocation_trace')).rows[0]?.n ?? 0);
  const feedbackInvocationBefore = Number((await db.pool.query('SELECT count(*)::int n FROM ai_model_invocation')).rows[0]?.n ?? 0);
  r = await postJson('/interview/ASMT/questions/0/feedback', { 'x-user-id': 'userA' }, { rating: 'down', comment: feedbackSentinel });
  const feedbackTraceAfter = Number((await db.pool.query('SELECT count(*)::int n FROM ai_invocation_trace')).rows[0]?.n ?? 0);
  const feedbackInvocationAfter = Number((await db.pool.query('SELECT count(*)::int n FROM ai_model_invocation')).rows[0]?.n ?? 0);
  const feedbackTraceLeak = Number((await db.pool.query("SELECT count(*)::int n FROM ai_invocation_trace WHERE output::text LIKE '%' || $1 || '%'", [feedbackSentinel])).rows[0]?.n ?? 0);
  const feedbackInvocationLeak = Number((await db.pool.query("SELECT count(*)::int n FROM ai_model_invocation WHERE output::text LIKE '%' || $1 || '%'", [feedbackSentinel])).rows[0]?.n ?? 0);
  A('反馈原文只入业务反馈表，不触发模型/trace，因而不能经 Langfuse 外送', r.status === 200 && r.body.recorded === true
    && feedbackTraceAfter === feedbackTraceBefore && feedbackInvocationAfter === feedbackInvocationBefore
    && feedbackTraceLeak === 0 && feedbackInvocationLeak === 0);
  r = await postJson('/interview/ASMT/questions/1/feedback', { 'x-user-id': 'userA' }, { rating: 'up' }); A('赞题反馈 → 200', r.status === 200);
  r = await postJson('/interview/ASMT/questions/0/feedback', { 'x-user-id': 'userA' }, { rating: 'up' }); A('改反馈(UPSERT)→ 200', r.status === 200);
  r = await postJson('/interview/ASMT/questions/0/feedback', { 'x-user-id': 'userA' }, { rating: 'meh' }); A('非法 rating → 400', r.status === 400);
  const fb = (await db.pool.query("SELECT rating FROM question_feedback WHERE owner_user_id='userA' AND interview_id='ASMT' AND question_index=0")).rows[0]; A('反馈 UPSERT 后只一条且已更新为 up', fb.rating === 'up');
  r = await req('GET', '/admin/question-feedback', { 'x-user-id': 'adminU' }); A('admin 聚合题目质量(up/down/踩率)', r.status === 200 && r.body.total >= 2 && typeof r.body.downRate === 'number');
  r = await req('GET', '/admin/question-feedback', { 'x-user-id': 'userA' }); A('非 admin 看质量聚合 → 403', r.status === 403);
  // admin 写操作 + 审计(问责)
  r = await postJson('/admin/users/victimU/disable', { 'x-user-id': 'adminU' }, {}); A('admin 停用用户 → 200', r.status === 200 && r.body.disabled === true);
  const dis = await db.pool.query("SELECT status FROM user_account WHERE id='victimU'"); A('用户真被停用', dis.rows[0].status === 'disabled');
  r = await req('GET', '/admin/audit', { 'x-user-id': 'adminU' }); A('审计记下该操作(actor/action/target)', r.status === 200 && r.body.audit.some((a: any) => a.action === 'disable_user' && a.actor === 'adminU' && a.target === 'victimU'));
  r = await postJson('/admin/users/victimU/disable', { 'x-user-id': 'userA' }, {}); A('非 admin 写操作 → 403', r.status === 403);
  // 审计不可篡改:无 UPDATE/DELETE 权限
  let immutable = false; try { await db.pool.query('SET ROLE app_role'); await db.pool.query("DELETE FROM admin_audit"); } catch { immutable = true; } finally { await db.pool.query('RESET ROLE'); }
  A('审计不可篡改(app_role 无 DELETE 权限)', immutable);
  r = await postJson('/resume', { 'x-user-id': 'userA' }, { text: '工作经历\n负责订单系统限流改造,用 Redis 计数器扛高并发\n技能 Redis、限流\n手机 13800138000' });
  A('上传简历 → 200 + 摄取', r.status === 200 && (r.body.status === 'ingested' || r.body.status === 'deduped') && typeof r.body.resumeId === 'string');
  const resumeId = r.body.resumeId;
  r = await req('GET', '/resume', { 'x-user-id': 'userA' }); A('列出自己的简历(含刚传)', r.status === 200 && r.body.resumes.some((x: any) => x.id === resumeId));
  r = await req('GET', `/resume/${resumeId}/profile`, { 'x-user-id': 'userA' });
  A('取结构化 profile → 200 且**不含明文手机号**(PII 脱敏)', r.status === 200 && !JSON.stringify(r.body.structured).includes('13800138000'));
  r = await req('GET', `/resume/${resumeId}/profile`, { 'x-user-id': 'userB' }); A('userB 看不到 userA 简历 profile → 404(RLS)', r.status === 404);
  // 岗位库 + 简历岗位匹配(据 Redis/限流简历 → 后端岗位匹配最高)
  r = await req('GET', '/roles', { 'x-user-id': 'userA' }); A('岗位库列表(≥3)', r.status === 200 && r.body.roles.length >= 3);
  r = await postJson('/roles/match', { 'x-user-id': 'userA' }, { resumeId }); A('简历匹配岗位 → 后端工程师 top(技能重叠)', r.status === 200 && r.body.matches.length >= 1 && r.body.matches[0].id === 'backend');
  r = await postJson('/roles/match', { 'x-user-id': 'userB' }, { resumeId }); A('userB 拿 userA 简历匹配 → 404(RLS)', r.status === 404);

  // OCR 在 MODEL-OP-01 typed binding 前必须在入口前 fail-closed；这里绝不
  // 注入本地假模型、创建工件、预留额度或派发视觉请求。
  const pngB64 = Buffer.from('fake-png-bytes-for-ocr-e2e-001').toString('base64');
  const ocrBefore = {
    consumption: Number((await db.pool.query("SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id='userA' AND service_type='ocr'")).rows[0]?.n ?? 0),
    artifact: Number((await db.pool.query("SELECT count(*)::int n FROM resume_ocr_artifact WHERE owner_user_id='userA'")).rows[0]?.n ?? 0),
    invocation: Number((await db.pool.query("SELECT count(*)::int n FROM ai_model_invocation WHERE owner_user_id='userA'")).rows[0]?.n ?? 0),
  };
  r = await postJson('/resume/file', { 'x-user-id': 'userA' }, { filename: 'resume.png', mimeType: 'image/png', contentBase64: pngB64 });
  const ocrAfter = {
    consumption: Number((await db.pool.query("SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id='userA' AND service_type='ocr'")).rows[0]?.n ?? 0),
    artifact: Number((await db.pool.query("SELECT count(*)::int n FROM resume_ocr_artifact WHERE owner_user_id='userA'")).rows[0]?.n ?? 0),
    invocation: Number((await db.pool.query("SELECT count(*)::int n FROM ai_model_invocation WHERE owner_user_id='userA'")).rows[0]?.n ?? 0),
  };
  A('OCR 未绑定 → 422 image_ocr_unavailable（不伪造识别结果）', r.status === 422 && r.body.error === 'image_ocr_unavailable');
  A('OCR 入口拒绝 → consumption/artifact/invocation 增量均为 0',
    ocrAfter.consumption === ocrBefore.consumption && ocrAfter.artifact === ocrBefore.artifact && ocrAfter.invocation === ocrBefore.invocation);

  // 语音未配置时 API 给可恢复的显式降级；真实双向语音由 live E2E 用百炼完成。
  r = await postJson('/interview/R1/transcribe', { 'x-user-id': 'userA' }, { audioBase64: Buffer.from([1, 2, 3, 4]).toString('base64'), mimeType: 'audio/webm', capture: { mode: 'single_local_microphone', consent: true, policyVersion: 'voice_ephemeral_v1' } });
  A('未配置 ASR → 503 asr_unavailable（前端可回落文字）', r.status === 503 && r.body.error === 'asr_unavailable');
  r = await postJson('/interview/R1/speak', { 'x-user-id': 'userA' }, { text: '请介绍一下你自己' });
  A('未配置 TTS → 503 tts_unavailable（前端可回落文字）', r.status === 503 && r.body.error === 'tts_unavailable');
  r = await postJson('/interview/R9/transcribe', { 'x-user-id': 'userA' }, { audioBase64: Buffer.from([1, 2, 3]).toString('base64'), mimeType: 'audio/webm', capture: { mode: 'single_local_microphone', consent: true, policyVersion: 'voice_ephemeral_v1' } });
  A('语音归属校验:userA 转写 userB 的 R9 → 404(RLS,越权不花 ASR)', r.status === 404);
  // 成本 DoS 真断言:专用用户连打超令牌桶 capacity(40)→ 至少 1 次 429(把"语音成本 DoS 限流"从纸面变可证伪)
  let voice429 = false;
  for (let i = 0; i < 46; i++) { const vr = await postJson('/interview/R1/speak', { 'x-user-id': 'voiceDoS' }, { text: 'x' }); if (vr.status === 429) { voice429 = true; break; } }
  A('语音成本限流:连打超令牌桶 → 429(防成本 DoS,承重安全项)', voice429);

  // 面试 CRUD 补全:create / list / transcript
  r = await postJson('/interview', { 'x-user-id': 'userA' }, {}); A('新建面试 → 200 + id(RLS WITH CHECK)', r.status === 200 && typeof r.body.interviewId === 'string');
  const newIv = r.body.interviewId;
  r = await req('GET', '/interview', { 'x-user-id': 'userA' }); A('列出自己的面试(含新建)', r.status === 200 && r.body.interviews.some((x: any) => x.id === newIv));
  r = await req('GET', '/interview', { 'x-user-id': 'userB' }); A('userB 列表看不到 userA 的面试(RLS)', r.status === 200 && !r.body.interviews.some((x: any) => x.id === newIv));
  r = await req('GET', `/interview/${newIv}/transcript`, { 'x-user-id': 'userA' }); A('转写(空题目→空 turns)', r.status === 200 && Array.isArray(r.body.turns) && r.body.turns.length === 0);
  r = await req('GET', `/interview/${newIv}/transcript`, { 'x-user-id': 'userB' }); A('userB 越权取转写 → 404', r.status === 404);
  // 面试列表过滤 + 简历重解析
  r = await req('GET', '/interview?status=completed', { 'x-user-id': 'userA' }); A('按 status 过滤面试列表', r.status === 200 && r.body.interviews.every((x: any) => x.status === 'completed') && r.body.interviews.some((x: any) => x.id === 'ASMT'));
  r = await postJson('/resume/' + resumeId + '/reparse', { 'x-user-id': 'userA' }, {}); A('简历重解析 → 200(解密重结构化)', r.status === 200 && r.body.reparsed === true);
  r = await postJson('/resume/nonexist/reparse', { 'x-user-id': 'userA' }, {}); A('重解析不存在简历 → 404', r.status === 404);

  // 能力评估:面试结果 → 维度+差距,落库
  r = await postJson('/interview/ASMT/assessment', { 'x-user-id': 'userA' }, {});
  A('生成评估 → 200 + overall=60(80/40 均值)', r.status === 200 && r.body.overall === 60);
  A('低分维度标记 gap(分布式锁 40<60)', r.body.dimensions.some((d: any) => d.gap === true) && r.body.weaknesses.length === 1);
  r = await req('GET', '/interview/ASMT/assessment', { 'x-user-id': 'userA' }); A('取评估 → ready', r.status === 200 && r.body.status === 'ready' && r.body.overall === 60);
  r = await req('GET', '/interview/ASMT/assessment', { 'x-user-id': 'userB' }); A('userB 越权取评估 → 404(RLS)', r.status === 404);

  // 学习计划:评估差距 → 学习项
  // 无评估先生成学习计划 → 409。用真实存在的 R1(active,无 assessment_report)而非 NOPE:
  // generateLearningPlan 先 guardInterviewPrivacy(不存在→404),再查 assessment_report(0 行→409)。
  // 用 NOPE 会把「无评估」误测成「不存在→404」,盖不住 assessment_required 分支。
  r = await postJson('/interview/R1/learning-plan', { 'x-user-id': 'userA' }, {}); A('无评估先生成学习计划 → 409', r.status === 409);
  r = await postJson('/interview/ASMT/learning-plan', { 'x-user-id': 'userA' }, {}); A('据评估差距生成学习计划 → 200 + 含弱项学习项', r.status === 200 && r.body.items.length === 1 && r.body.items[0].priority === 'medium');
  r = await req('GET', '/interview/ASMT/learning-plan', { 'x-user-id': 'userA' }); A('取学习计划 → active', r.status === 200 && r.body.status === 'active');
  r = await req('GET', '/interview/ASMT/learning-plan', { 'x-user-id': 'userB' }); A('userB 越权取学习计划 → 404(RLS)', r.status === 404);
  // 学习进度打卡(留存):标记生成计划里的第一项 → 进度反映(动态取 topic)
  const lp0 = (await req('GET', '/interview/ASMT/learning-plan', { 'x-user-id': 'userA' })).body;
  A('学习计划带完成度(progress.total≥1,初始 completed=0)', lp0.progress.total >= 1 && lp0.progress.completed === 0 && lp0.items.every((it: any) => it.done === false));
  const topic0 = lp0.items[0].topic;
  r = await postJson('/interview/ASMT/learning-plan/complete', { 'x-user-id': 'userA' }, { topic: topic0 }); A('标记学习项完成 → 200', r.status === 200 && r.body.done === true);
  const lp2 = (await req('GET', '/interview/ASMT/learning-plan', { 'x-user-id': 'userA' })).body;
  A('反映完成度(该项 done=true,progress.completed=1)', lp2.items.find((x: any) => x.topic === topic0).done === true && lp2.progress.completed === 1);
  r = await postJson('/interview/ASMT/learning-plan/complete', { 'x-user-id': 'userA' }, { topic: topic0 }); A('重复打卡幂等 → 仍 200', r.status === 200);
  r = await postJson('/interview/ASMT/learning-plan/complete', { 'x-user-id': 'userA' }, {}); A('缺 topic → 400', r.status === 400);
  // 交易:下单 → 验签幂等入账 → 余额。承重:重复回调不双入。
  r = await req('GET', '/commerce/products', { 'x-user-id': 'userA' }); A('商品列表 → 2 个面试包', r.status === 200 && r.body.products.length === 2);
  const balB = (await req('GET', '/commerce/entitlement', { 'x-user-id': 'userA' })).body.availableUnits;
  r = await postJson('/commerce/orders', { 'x-user-id': 'userA' }, { productId: 'pack_10' }); A('下单 pack_10 → 200 + orderId', r.status === 200 && typeof r.body.orderId === 'string');
  // 订单创建幂等:同 idempotency-key 重试不重复下单
  const oA = (await postJson('/commerce/orders', { 'x-user-id': 'userA', 'idempotency-key': 'idem-1' }, { productId: 'pack_10' })).body.orderId;
  const oB = (await postJson('/commerce/orders', { 'x-user-id': 'userA', 'idempotency-key': 'idem-1' }, { productId: 'pack_10' })).body.orderId;
  A('同幂等键重试 → 同一订单(不重复下单)', oA === oB);
  const cnt = (await db.pool.query("SELECT count(*)::int n FROM payment_order WHERE idempotency_key='idem-1'")).rows[0].n; A('幂等键只一条订单', cnt === 1);
  const ordId = r.body.orderId;
  const sig = createHmac('sha256','test-pay-secret').update(ordId+':txn-001:paid').digest('hex');
  r = await postJson('/commerce/orders/'+ordId+'/pay-callback', { 'x-user-id': 'userA' }, { providerTxn: 'txn-001', sig: 'deadbeef' }); A('伪造签名回调 → 403', r.status === 403);
  r = await postJson('/commerce/orders/'+ordId+'/pay-callback', { 'x-user-id': 'userA' }, { providerTxn: 'txn-001', sig }); A('验签通过回调 → credited', r.status === 200 && r.body.result === 'credited');
  const balA = (await req('GET', '/commerce/entitlement', { 'x-user-id': 'userA' })).body.availableUnits; A('入账 +10 额度', balA === balB + 10);
  r = await postJson('/commerce/orders/'+ordId+'/pay-callback', { 'x-user-id': 'userA' }, { providerTxn: 'txn-001', sig }); A('重复回调 → already(幂等)', r.status === 200 && r.body.result === 'already');
  const balA2 = (await req('GET', '/commerce/entitlement', { 'x-user-id': 'userA' })).body.availableUnits; A('重复回调不二次入账(余额不变)', balA2 === balA);
  r = await req('GET', '/commerce/orders/'+ordId, { 'x-user-id': 'userB' }); A('userB 越权看订单 → 404(RLS)', r.status === 404);
  // 职业路径:成长链终点(评估→学习→职业路径)
  r = await postJson('/interview/ASMT/career-path', { 'x-user-id': 'userA' }, {}); A('生成职业路径 → 200(overall=60→mid)', r.status === 200 && r.body.level === 'mid' && r.body.milestones.length >= 1);
  r = await req('GET', '/interview/ASMT/career-path', { 'x-user-id': 'userA' }); A('取职业路径 → 含里程碑', r.status === 200 && Array.isArray(r.body.milestones));
  r = await req('GET', '/interview/ASMT/career-path', { 'x-user-id': 'userB' }); A('userB 越权取职业路径 → 404(RLS)', r.status === 404);
  // 报告查看(主线最后一环:用户看报告)
  r = await req('GET', '/interview/ASMT/report', { 'x-user-id': 'userA' }); A('查看报告 → ready + 内容(overall=60)', r.status === 200 && r.body.status === 'ready' && r.body.content.overall === 60);
  r = await req('GET', '/interview/ASMT/report', { 'x-user-id': 'userB' }); A('userB 越权看报告 → 404(RLS)', r.status === 404);
  r = await req('GET', '/interview/RACE/report', { 'x-user-id': 'userA' }); A('无报告的面试 → 404', r.status === 404);
  // 报告导出 markdown + 账户注销
  let er = await fetch(base + '/interview/ASMT/report/export', { headers: { 'x-user-id': 'userA' } });
  const md = await er.text(); A('报告导出 markdown(含评分标题)', er.status === 200 && (er.headers.get('content-type')?.includes('markdown') ?? false) && md.includes('# 面试报告') && md.includes('综合评分'));
  r = await postJson('/profile/deactivate', { 'x-user-id': 'userA' }, {}); A('账户注销 → 200', r.status === 200 && r.body.deactivated === true);
  // 修改密码(安全自助):验旧→换新
  r = await postJson('/profile/change-password', { 'x-user-id': 'cpUser' }, { oldPassword: 'wrongold', newPassword: 'newpass34' }); A('旧密码错 → 401', r.status === 401);
  r = await postJson('/profile/change-password', { 'x-user-id': 'cpUser' }, { oldPassword: 'oldpass12', newPassword: 'short' }); A('新密码过短 → 400', r.status === 400);
  r = await postJson('/profile/change-password', { 'x-user-id': 'cpUser' }, { oldPassword: 'oldpass12', newPassword: 'newpass34' }); A('改密码 → 200', r.status === 200 && r.body.changed === true);
  r = await postJson('/auth/login', {}, { email: 'cp@x.com', password: 'oldpass12' }); A('旧密码登录 → 401(已失效)', r.status === 401);
  r = await postJson('/auth/login', {}, { email: 'cp@x.com', password: 'newpass34' }); A('新密码登录 → 200(签发令牌)', r.status === 200 && typeof r.body.token === 'string');
  // F4:改密即时吊销会话(旧/被盗 Bearer 令牌失效)。必须走真 Bearer(x-user-id 回退绕过令牌代次,证不了)。
  r = await postJson('/auth/signup', {}, { email: 'f4@x.com', password: 'initpass12' }); A('F4 造号 → 签发令牌 T0', r.status === 200 && typeof r.body.token === 'string');
  const f4tok0 = r.body.token;
  r = await req('GET', '/profile', { authorization: `Bearer ${f4tok0}` }); A('F4 旧令牌 T0 初始有效 → 200', r.status === 200 && r.body.email === 'f4@x.com');
  r = await postJson('/profile/change-password', { authorization: `Bearer ${f4tok0}` }, { oldPassword: 'initpass12', newPassword: 'newpass99' });
  A('F4 改密 → 200 + 回签新代次令牌 T1(当前会话不被踢)', r.status === 200 && r.body.changed === true && typeof r.body.token === 'string');
  const f4tok1 = r.body.token;
  r = await req('GET', '/profile', { authorization: `Bearer ${f4tok0}` }); A('F4 改密后旧令牌 T0 → 401(会话吊销,核心洞已堵)', r.status === 401);
  r = await req('GET', '/profile', { authorization: `Bearer ${f4tok1}` }); A('F4 改密回签的新令牌 T1 → 200(无死胡同)', r.status === 200 && r.body.email === 'f4@x.com');
  r = await postJson('/auth/login', {}, { email: 'f4@x.com', password: 'newpass99' }); A('F4 新密码重登 → 200 + 令牌 T2', r.status === 200 && typeof r.body.token === 'string');
  const f4tok2 = r.body.token;
  r = await req('GET', '/profile', { authorization: `Bearer ${f4tok2}` }); A('F4 重登令牌 T2 内嵌新代次 → 200(不被自锁死,防登录后即失效回归)', r.status === 200 && r.body.email === 'f4@x.com');
  r = await postJson('/auth/login', {}, { email: 'f4@x.com', password: 'initpass12' }); A('F4 旧密码登录 → 401', r.status === 401);
  const st = await db.pool.query("SELECT status FROM user_account WHERE id='userA'"); A('账户真停用(disabled)', st.rows[0].status === 'disabled');
  // profile/设置 + 简历单删
  r = await req('GET', '/profile', { 'x-user-id': 'userA' }); A('看自己档案(含 email,不含密码)', r.status === 200 && r.body.email === 'ua@x.com' && r.body.password_hash === undefined);
  // 个人总览/仪表盘(首屏聚合):平均分来自 ASMT 的 80/40 → 60
  r = await req('GET', '/profile/overview', { 'x-user-id': 'userA' }); A('个人总览:平均分∈[0,100]+答题数≥2+报告就绪≥1+面试分布', r.status === 200 && r.body.avgScore >= 0 && r.body.avgScore <= 100 && r.body.answered >= 2 && r.body.reportsReady >= 1 && typeof r.body.interviewsByStatus === 'object' && Object.keys(r.body.interviewsByStatus).length >= 1);
  r = await req('GET', '/profile/overview', { 'x-user-id': 'userNoData' }); A('无数据用户总览:avgScore=null 不报错', r.status === 200 && r.body.avgScore === null && r.body.answered === 0);
  // F6 回归:模拟旧无校验代码残留的**超大脏 preferences 行**(>4KB),证明白名单投影既不锁死也自愈清洗(审计高危项)。
  await db.pool.query("UPDATE user_account SET preferences=$2::jsonb WHERE id=$1", ['cpUser', JSON.stringify({ junkKey: 'x'.repeat(6000), theme: 'light' })]);
  r = await patchJson('/profile/settings', { 'x-user-id': 'cpUser' }, { preferences: { locale: 'zh' } });
  A('F6 遗留超大行(>4KB 脏 key)仍可改设置 → 200(不锁死)', r.status === 200 && r.body.preferences.locale === 'zh');
  A('F6 落库投影清洗:白名单外脏 key 被移除 + 体积回落 <4KB', r.body.preferences.junkKey === undefined && r.body.preferences.theme === 'light' && Buffer.byteLength(JSON.stringify(r.body.preferences), 'utf8') < 4096);
  // F6:settings 白名单校验(此前裸 @Body 无校验 → jsonb 无界膨胀)
  r = await patchJson('/profile/settings', { 'x-user-id': 'userA' }, { preferences: { locale: 'zh' } });
  A('改设置(白名单 locale)→ 200 + 合并', r.status === 200 && r.body.preferences.locale === 'zh');
  r = await patchJson('/profile/settings', { 'x-user-id': 'userA' }, { preferences: { theme: 'dark' } });
  A('再改设置(theme)→ 合并不覆盖(locale 仍在)', r.status === 200 && r.body.preferences.locale === 'zh' && r.body.preferences.theme === 'dark');
  r = await req('GET', '/profile', { 'x-user-id': 'userA' });
  A('设置可读回(/profile.preferences 含 locale+theme)', r.status === 200 && r.body.preferences?.locale === 'zh' && r.body.preferences?.theme === 'dark');
  r = await patchJson('/profile/settings', { 'x-user-id': 'userA' }, { preferences: { hacker: 'x' } });
  A('未知 key → 400(拒绝无界膨胀)', r.status === 400);
  r = await patchJson('/profile/settings', { 'x-user-id': 'userA' }, { preferences: { locale: 'fr' } });
  A('非法值(locale 非枚举)→ 400', r.status === 400);
  r = await patchJson('/profile/settings', { 'x-user-id': 'userA' }, { preferences: { notifications: { deep: { a: 1 } } } });
  A('深嵌绕过(notifications 下塞未知嵌套)→ 400', r.status === 400);
  r = await patchJson('/profile/settings', { 'x-user-id': 'userA' }, { extra: 1, preferences: { locale: 'en' } });
  A('顶层未知 key(extra)→ 400', r.status === 400);
  r = await patchJson('/profile/settings', { 'x-user-id': 'userA' }, { preferences: { notifications: { email: true, push: false } } });
  A('合法 notifications(布尔)→ 200', r.status === 200 && r.body.preferences.notifications.email === true);
  // 设置多次 PATCH 后 preferences 体积仍被钉死(白名单只 3 个 key,无累积膨胀)
  const prefSize = Buffer.byteLength(JSON.stringify((await req('GET', '/profile', { 'x-user-id': 'userA' })).body.preferences), 'utf8');
  A('多次改设置后 preferences 体积仍 < 4KB(无 jsonb 膨胀)', prefSize < 4096);
  // 单份硬删除已 fail-closed，不能绕过异步擦除状态机。
  r = await postJson('/resume', { 'x-user-id': 'userB' }, { text: '工作经历\n负责支付系统对账\n技能 对账、分布式事务' });
  const rid2 = r.body.resumeId;
  r = await (async () => { const res = await fetch(base + '/resume/' + rid2, { method: 'DELETE', headers: { 'x-user-id': 'userB' } }); return { status: res.status, body: await res.json().catch(()=>({})) as any }; })();
  A('旧单份简历硬删除 fail-closed，避免绕过关联/围栏/回执', r.status === 503 && r.body.error === 'resume_erasure_migration_in_progress');
  r = await (async () => { const res = await fetch(base + '/resume/' + rid2, { method: 'DELETE', headers: { 'x-user-id': 'userA' } }); return { status: res.status }; })();
  A('旧单份删除不按资源存在性分叉，避免泄漏且保持 fail-closed', r.status === 503);
  // PIPL 合规:同意 / 导出 / 删除权
  r = await postJson('/privacy/consent', { 'x-user-id': 'userA' }, { purpose: 'resume_processing' }); A('记录采集同意 → 200 + 政策版本', r.status === 200 && r.body.recorded === true && typeof r.body.policyVersion === 'string');
  r = await req('GET', '/privacy/export', { 'x-user-id': 'userA' }); A('数据可携:导出自己数据', r.status === 200 && Array.isArray(r.body.resumes) && Array.isArray(r.body.consents));
  const beforeDel = (await req('GET', '/resume', { 'x-user-id': 'userA' })).body.resumes.length;
  r = await req('DELETE', '/privacy/resume-data', { 'x-user-id': 'userA' }); A('旧全量简历删除 fail-closed，等待异步状态机', r.status === 503 && r.body.error === 'resume_erasure_migration_in_progress');
  const afterDel = (await req('GET', '/resume', { 'x-user-id': 'userA' })).body.resumes.length;
  A('fail-closed 不改变简历数据，避免伪造删除成功', beforeDel > 0 && afterDel === beforeDel);
  // 通知:列表 / 未读数 / 标已读
  r = await req('GET', '/notifications', { 'x-user-id': 'userA' }); A('通知列表(2 条)', r.status === 200 && r.body.notifications.length === 2);
  r = await req('GET', '/notifications/unread-count', { 'x-user-id': 'userA' }); A('未读数=2', r.status === 200 && r.body.unread === 2);
  r = await postJson('/notifications/n1/read', { 'x-user-id': 'userA' }, {}); A('标已读 → 200', r.status === 200 && r.body.read === true);
  r = await req('GET', '/notifications/unread-count', { 'x-user-id': 'userA' }); A('标读后未读数=1', r.status === 200 && r.body.unread === 1);
  r = await req('GET', '/notifications', { 'x-user-id': 'userB' }); A('userB 看不到 userA 通知(RLS)', r.status === 200 && r.body.notifications.length === 0);

  // F5:SSE 现在是 hold-and-tail(连接不再重放即关),所以读到 catch-up 块即短超时中断,不能 await 整个 body。
  const sse = async (lastId?: number) => {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 700);   // 重放是同步写,700ms 足够收齐 catch-up
    let status = 0, buf = '';
    try {
      const res = await fetch(base + '/interview/R1/events',
        { headers: { 'x-user-id': 'userA', ...(lastId ? { 'last-event-id': String(lastId) } : {}) }, signal: ac.signal });
      status = res.status;
      if (status === 200 && res.body) {
        const reader = res.body.getReader(); const dec = new TextDecoder();
        for (;;) { const { done, value } = await reader.read(); if (done) break; buf += dec.decode(value, { stream: true }); }
      }
    } catch { /* abort 是 hold-and-tail 的预期中断,catch-up 已收 */ } finally { clearTimeout(timer); }
    return { status, ids: [...buf.matchAll(/^id: (\d+)$/gm)].map((x) => Number(x[1])) };
  };
  // R1 只种 1 条事件(seq=1 question_ready);/turn 只入队不写事件、legacy /answer 410 不写
  // answer_evaluated(见下方 evc 断言),worker 未跑。故全量重放=[1]、游标=1 后无更多事件(空)。
  let s = await sse(); A('SSE 全量重放事件 seq=[1]', s.ids.join(',') === '1');
  s = await sse(1); A('Last-Event-ID=1 只重放 seq>1（无更多事件，空）', s.ids.join(',') === '');
  // HTTP parsers normalize leading/trailing optional whitespace before Nest
  // receives a header, so test a preserved non-canonical representation (+1)
  // rather than asserting on bytes that Fastify correctly removed per RFC.
  for (const badCursor of ['-1', '1.5', 'Infinity', '+1', '9007199254740992', 'x'.repeat(17)]) {
    const bad = await fetch(base + '/interview/R1/events', { headers: { 'x-user-id': 'userA', 'last-event-id': badCursor } });
    A(`Last-Event-ID=${JSON.stringify(badCursor)} 非法 → 400（不降级为全量重放）`, bad.status === 400);
  }
  const f = await fetch(base + '/interview/R1/events', { headers: { 'x-user-id': 'userB' } });
  A('userB 越权订阅 R1 事件 → 404', f.status === 404);
  const evc = await db.pool.query("SELECT count(*)::int n FROM interview_event WHERE stream_key='R1' AND kind='answer_evaluated'");
  A('API 受理 /turn 只入队；legacy /answer 不写 answer_evaluated，worker 未执行前事件数为 0', evc.rows[0].n === 0);

  // 系统指标:打几个请求后 /metrics 出 Prometheus 文本(HTTP 请求数/延迟/含错误码系列)
  await req('GET', '/health', {});
  await req('GET', '/interview/NOPE', { 'x-user-id': 'userA' }); // 产生一个 4xx
  const mr = await fetch(base + '/metrics');
  const mtxt = await mr.text();
  A('/metrics 出 Prometheus 文本(text/plain)', mr.status === 200 && (mr.headers.get('content-type') || '').includes('text/plain'));
  A('含 http_requests_total counter(按 route/status)', /http_requests_total\{[^}]*status="/.test(mtxt) && mtxt.includes('# TYPE http_requests_total counter'));
  A('含延迟直方图 http_request_duration_ms(_bucket/_sum/_count)', mtxt.includes('http_request_duration_ms_bucket') && mtxt.includes('http_request_duration_ms_count'));
  A('错误码也计入(有 4xx/5xx 系列,错误率可算)', /http_requests_total\{[^}]*status="4\d\d"/.test(mtxt) || /status="404"/.test(mtxt));

  console.log(`\n${fails === 0 ? '✓ 全部通过（真 NestJS+Fastify+类型DI 结构）' : '✗ ' + fails + ' 项失败'}`);
  await app.close(); await db.pool.end(); process.exit(fails ? 1 : 0);
}
validate().catch((e) => { console.error(e); process.exit(1); });

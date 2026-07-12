import 'reflect-metadata';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHmac } from 'node:crypto';
import { hashPassword } from '@meetwise/domain';
import { createApp } from '../src/main';
import { DbService } from '../src/platform/db.service';

/** 真 NestJS 结构下的请求路径自检（principal 注入 / RLS / 幂等 / SSE 重放 / 真鉴权）。 */
async function validate() {
  process.env.AUTH_DEV_HEADER = '1';                 // 测试启用 x-user-id 回退
  process.env.AUTH_SECRET = 'test-secret-key';       // 真令牌签名密钥(测试)
  process.env.RESUME_ENC_KEY = 'test-resume-enc-key';
  process.env.RESUME_HASH_SECRET = 'test-resume-hash-secret';
  process.env.PAY_PROVIDER_SECRET = 'test-pay-secret';
  process.env.OCR_FAKE = '1';                        // 注入确定性视觉模型(不依赖真 qwen-vl key),让 /resume/file OCR 走真栈可端到端测
  process.env.OCR_FAKE_TEXT = '工作经历\n负责订单系统限流改造,用 Redis 计数器扛高并发\n技能 Redis、限流、Kubernetes\n联系电话 13800138000';
  process.env.VOICE_FAKE = '1';                      // 注入确定性 ASR/TTS(不依赖真 qwen key),让语音端点走真栈可端到端测
  const app = await createApp();
  await app.init();
  const db = app.get(DbService);

  for (const f of ['01_schema', '02_commerce', '03_resume', '04_report', '05_interview_jobs', '08_assessment', '09_auth', '10_learning', '11_commerce', '12_career', '13_privacy', '14_notification','15_audit','16_feedback','10_learning']) await db.pool.query(readFileSync(fileURLToPath(new URL(`../../../packages/db/sql/${f}.sql`, import.meta.url)), 'utf8'));
  // 本自检从 sql/ 引导全量 schema(不跑 migrations 运行器);增量迁移 0015 的 pwd_epoch 列需在此显式应用(幂等 ADD COLUMN),
  // 让改密吊销(F4)守卫查询 pwd_epoch 可用。生产/e2e 由 worker 迁移运行器应用同一文件。
  await db.pool.query(readFileSync(fileURLToPath(new URL(`../../../packages/db/migrations/0015_pwd_epoch.sql`, import.meta.url)), 'utf8'));
  await db.pool.query(`INSERT INTO interview(id,owner_user_id,status) VALUES ('ABND','userA','created')`);
  await db.pool.query(`INSERT INTO interview(id,owner_user_id,status,questions) VALUES ('ASMT','userA','completed','["订单限流方案","分布式锁可靠性"]')`);
  await db.pool.query(`INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES ('userA','ASMT',1,'answer_evaluated','{"turn":0,"score":80}'),('userA','ASMT',2,'answer_evaluated','{"turn":1,"score":40}')`);
  await db.pool.query(`INSERT INTO ai_report(owner_user_id,interview_id,status,content) VALUES ('userA','ASMT','ready','{"overall":60,"sections":[]}')`);
  await db.pool.query(`INSERT INTO ai_report(owner_user_id,interview_id,status) VALUES ('userA','R1','failed')`);
  await db.pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ('R1','userA','active'),('R9','userB','active'),('RACE','userA','created')");
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
  r = await req('GET', '/health'); A('健康检查公开端点 → 200 + db up（容器探活）', r.status === 200 && r.body.status === 'ok' && r.body.db === 'up');
  const corsRes = await fetch(base + '/health', { headers: { origin: 'http://localhost:3000' } });
  A('CORS:跨域请求返回 Access-Control-Allow-Origin(浏览器前端可调)', !!corsRes.headers.get('access-control-allow-origin'));
  r = await req('GET', '/interview/R1'); A('无 principal → 401（fail-closed）', r.status === 401);
  r = await req('GET', '/interview/R1', { 'x-user-id': 'userB' }); A('userB 越权 GET R1 → 404（RLS 0 行）', r.status === 404);
  r = await req('GET', '/interview/R1', { 'x-user-id': 'userA' }); A('userA GET 自己的 R1 → 200', r.status === 200 && r.body.id === 'R1');
  r = await req('POST', '/interview/R1/answer', { 'x-user-id': 'userA', 'idempotency-key': 'k1' }); A('userA 提交答案 → evaluated', r.status === 200 && r.body.result === 'evaluated');
  r = await req('POST', '/interview/R1/answer', { 'x-user-id': 'userA', 'idempotency-key': 'k1' }); A('重复幂等键 → duplicate_ignored', r.status === 200 && r.body.result === 'duplicate_ignored');
  r = await req('POST', '/interview/R1/answer', { 'x-user-id': 'userB', 'idempotency-key': 'k2' }); A('userB 越权提交 R1 → 404', r.status === 404);

  // 生产端点:begin(扣额度+入队 start)/ turn(入队 answer)——真请求经队列驱动 worker
  const postJson = async (path: string, headers: Record<string, string>, body: any) => {
    const res = await fetch(base + path, { method: 'POST', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    return { status: res.status, body: await res.json().catch(() => ({})) as any };
  };
  const patchJson = async (path: string, headers: Record<string, string>, body: any) => {
    const res = await fetch(base + path, { method: 'PATCH', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    return { status: res.status, body: await res.json().catch(() => ({})) as any };
  };
  r = await req('POST', '/interview/R1/begin', { 'x-user-id': 'userA' }); A('begin 缺 resume-id → 400', r.status === 400);
  r = await req('POST', '/interview/R1/begin', { 'x-user-id': 'userA', 'resume-id': 'res-1' }); A('begin → 202 受理 + 入队 start job', r.status === 202 && r.body.accepted === true);
  let q = await db.pool.query("SELECT count(*)::int n FROM interview_job WHERE interview_id='R1' AND kind='start'"); A('start job 已落队列', q.rows[0].n === 1);
  const balPreBegin = (await (async()=>{const x=await fetch(base+'/commerce/entitlement',{headers:{'x-user-id':'userA'}});return (await x.json()).availableUnits;})());
  r = await req('POST', '/interview/R1/begin', { 'x-user-id': 'userA', 'resume-id': 'res-1' }); A('重复 begin → 幂等(alreadyBegun)', r.status === 202 && r.body.alreadyBegun === true);
  q = await db.pool.query("SELECT count(*)::int n FROM interview_job WHERE interview_id='R1' AND kind='start'"); A('重复 begin 不再入第二个 start job', q.rows[0].n === 1);
  const balPostBegin = (await (async()=>{const x=await fetch(base+'/commerce/entitlement',{headers:{'x-user-id':'userA'}});return (await x.json()).availableUnits;})());
  A('重复 begin 不再二次扣额度', balPostBegin === balPreBegin);
  // 并发竞态:同时 2 个 begin(Promise.all)→ advisory 锁串行化 → 只 1 个 start job(不双开)
  await Promise.all([
    fetch(base + '/interview/RACE/begin', { method: 'POST', headers: { 'x-user-id': 'userA', 'resume-id': 'res-r' } }),
    fetch(base + '/interview/RACE/begin', { method: 'POST', headers: { 'x-user-id': 'userA', 'resume-id': 'res-r' } }),
  ]);
  const raceJobs = (await db.pool.query("SELECT count(*)::int n FROM interview_job WHERE interview_id='RACE' AND kind='start'")).rows[0].n;
  A('并发 begin 竞态安全:只 1 个 start job(advisory 锁串行)', raceJobs === 1);
  r = await req('POST', '/interview/R9/begin', { 'x-user-id': 'userA', 'resume-id': 'res-1' }); A('userA 对 userB 的 R9 begin → 404(RLS)', r.status === 404);
  r = await postJson('/interview/R1/turn', { 'x-user-id': 'userA' }, { turn: 0, answer: '我的答案' }); A('turn → 202 + 入队 answer job', r.status === 202 && r.body.accepted === true);
  r = await postJson('/interview/R1/turn', { 'x-user-id': 'userA' }, { turn: 0, answer: '' }); A('turn 空答案 → 400', r.status === 400);
  q = await db.pool.query("SELECT count(*)::int n FROM interview_job WHERE interview_id='R1' AND kind='answer'"); A('answer job 已落队列', q.rows[0].n === 1);
  // 放弃面试:退还预留额度(不漏扣)
  const balBefore = (await req('GET', '/commerce/entitlement', { 'x-user-id': 'userA' })).body?.availableUnits ?? (await (async()=>{const r2=await fetch(base+'/commerce/entitlement',{headers:{'x-user-id':'userA'}});return (await r2.json()).availableUnits;})());
  r = await req('POST', '/interview/ABND/begin', { 'x-user-id': 'userA', 'resume-id': 'res-x' }); A('ABND begin → 202(预留 1.0)', r.status === 202);
  const balReserved = (await (async()=>{const r2=await fetch(base+'/commerce/entitlement',{headers:{'x-user-id':'userA'}});return (await r2.json()).availableUnits;})());
  A('预留后额度 -1.0', balReserved === balBefore - 1.0);
  r = await postJson('/interview/ABND/abandon', { 'x-user-id': 'userA' }, {}); A('放弃面试 → 200 + released', r.status === 200 && r.body.abandoned === true);
  const balAfter = (await (async()=>{const r2=await fetch(base+'/commerce/entitlement',{headers:{'x-user-id':'userA'}});return (await r2.json()).availableUnits;})());
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
  let lr = await req('GET', '/legal/policy', { 'x-user-id': 'userA' }); A('法务政策(公开)→ version + 采集目的 + 数据权利', lr.status === 200 && lr.body.version === 'v1' && lr.body.purposes.length >= 2 && lr.body.dataRights.length >= 1);
  // 运营 admin:特权跨用户只读 + 非 admin 403(承重授权)
  r = await req('GET', '/admin/users', { 'x-user-id': 'userA' }); A('非 admin 访问 → 403 fail-closed', r.status === 403);
  r = await req('GET', '/admin/users', { 'x-user-id': 'adminU' }); A('admin 看全量用户(跨用户特权,不含密码)', r.status === 200 && r.body.users.length >= 2 && r.body.users.every((u: any) => u.password_hash === undefined));
  r = await req('GET', '/admin/orders', { 'x-user-id': 'adminU' }); A('admin 看全量订单(跨用户)', r.status === 200 && r.body.orders.some((o: any) => o.owner_user_id === 'userB'));
  r = await req('GET', '/admin/stats', { 'x-user-id': 'adminU' }); A('admin 看统计(用户数/订单/已付额)', r.status === 200 && r.body.users >= 2 && r.body.paidCents === 9900);
  // 题目反馈(AI 质量信号)+ admin 聚合
  r = await postJson('/interview/ASMT/questions/0/feedback', { 'x-user-id': 'userA' }, { rating: 'down', comment: '太泛' }); A('踩题反馈 → 200', r.status === 200 && r.body.recorded === true);
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

  // 图片简历 OCR 端到端(真 HTTP /resume/file → 真 service 决策B → 真 DB;视觉模型注入 fake=OCR_FAKE,证明真链路可用非 demo)
  const pngB64 = Buffer.from('fake-png-bytes-for-ocr-e2e-001').toString('base64');
  r = await postJson('/resume/file', { 'x-user-id': 'userA' }, { filename: 'resume.png', mimeType: 'image/png', contentBase64: pngB64 });
  A('图片简历 OCR → 200 + 摄取(ocr=true,format=image)', r.status === 200 && (r.body.status === 'ingested' || r.body.status === 'deduped') && r.body.ocr === true && r.body.format === 'image' && typeof r.body.resumeId === 'string');
  const ocrResumeId = r.body.resumeId;
  const ocrCons = (await db.pool.query("SELECT status FROM entitlement_consumption WHERE owner_user_id='userA' AND service_type='ocr'")).rows;
  A('OCR 按次计费:产出可用画像 → service_type=ocr 恰 1 笔且 confirmed(决策B:可用画像才扣)', ocrCons.length === 1 && ocrCons[0].status === 'confirmed');
  r = await req('GET', `/resume/${ocrResumeId}/profile`, { 'x-user-id': 'userA' });
  A('OCR 来源 profile 结构化 + PII 脱敏(不含明文手机号,与文本路径同保证)', r.status === 200 && !JSON.stringify(r.body.structured).includes('13800138000'));
  A('OCR 来源 profile 恒 status=needs_review(系统不冒充判真伪,给人工复核落地位)', r.body.status === 'needs_review');
  r = await req('GET', `/resume/${ocrResumeId}/profile`, { 'x-user-id': 'userB' });
  A('OCR 简历 RLS 隔离:userB 看不到 → 404', r.status === 404);
  r = await postJson('/resume/file', { 'x-user-id': 'userA' }, { filename: 'resume-again.png', mimeType: 'image/png', contentBase64: pngB64 });
  A('同图字节重传 → 409 ocr_duplicate(图字节 HMAC 幂等,不重复调用/扣费)', r.status === 409 && r.body.error === 'ocr_duplicate');
  const ocrCnt = (await db.pool.query("SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id='userA' AND service_type='ocr'")).rows[0].n;
  A('同图只一笔 OCR 消费(幂等锚=图字节,非易变 docId)', ocrCnt === 1);
  // [决策B 区分用例·防又假绿] 转写成功但**无可用简历内容**(ingestResume facts=0)→ 退还 OCR 费(released),这是决策B与决策A的关键差异。
  process.env.OCR_FAKE_TEXT = '这是一张很模糊的照片,没有可识别的简历文字内容啦啦啦';   // 无 section/无 experience/skills → ingestResume facts=0
  const pngB64b = Buffer.from('fake-png-bytes-no-usable-content-002').toString('base64');
  r = await postJson('/resume/file', { 'x-user-id': 'userA' }, { filename: 'blur.png', mimeType: 'image/png', contentBase64: pngB64b });
  A('决策B:转写成功但无可用画像 → 422 ocr_no_content(不静默死胡同)', r.status === 422 && r.body.error === 'ocr_no_content');
  const ocrRel = (await db.pool.query("SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id='userA' AND service_type='ocr' AND status='released'")).rows[0].n;
  A('决策B:无可用画像那笔 OCR 费已退还(released 恰 1 笔,未白扣)', ocrRel === 1);
  const ocrConf = (await db.pool.query("SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id='userA' AND service_type='ocr' AND status='confirmed'")).rows[0].n;
  A('决策B:仅可用画像那笔仍 confirmed(恰 1 笔,退费不误伤成功笔)', ocrConf === 1);
  process.env.OCR_FAKE_TEXT = '工作经历\n负责订单系统限流改造,用 Redis 计数器扛高并发\n技能 Redis、限流、Kubernetes\n联系电话 13800138000';   // 复原,不影响后续用例

  // 语音端点端到端(真 HTTP → 真 api service → fake ASR/TTS 注入 VOICE_FAKE):证明语音链路可用非 demo + 成本限流真生效
  r = await postJson('/interview/R1/transcribe', { 'x-user-id': 'userA' }, { audioBase64: Buffer.from([1, 2, 3, 4]).toString('base64'), mimeType: 'audio/webm' });
  A('语音 ASR 转写 → 200 + 确定性文本(fake 注入,含"限流")', r.status === 200 && typeof r.body.text === 'string' && r.body.text.includes('限流'));
  r = await postJson('/interview/R1/speak', { 'x-user-id': 'userA' }, { text: '请介绍一下你自己' });
  A('语音 TTS 合成 → 200 + wav(fake AUDIO: 前缀)', r.status === 200 && r.body.mimeType === 'audio/wav' && Buffer.from(r.body.audioBase64, 'base64').toString().startsWith('AUDIO:'));
  r = await postJson('/interview/R9/transcribe', { 'x-user-id': 'userA' }, { audioBase64: Buffer.from([1, 2, 3]).toString('base64'), mimeType: 'audio/webm' });
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
  r = await postJson('/interview/NOPE/learning-plan', { 'x-user-id': 'userA' }, {}); A('无评估先生成学习计划 → 409', r.status === 409);
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
  const md = await er.text(); A('报告导出 markdown(含评分标题)', er.status === 200 && er.headers.get('content-type')?.includes('markdown') && md.includes('# 面试报告') && md.includes('综合评分'));
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
  // 简历单删:先传一份再删
  r = await postJson('/resume', { 'x-user-id': 'userB' }, { text: '工作经历\n负责支付系统对账\n技能 对账、分布式事务' });
  const rid2 = r.body.resumeId;
  r = await (async () => { const res = await fetch(base + '/resume/' + rid2, { method: 'DELETE', headers: { 'x-user-id': 'userB' } }); return { status: res.status, body: await res.json().catch(()=>({})) }; })();
  A('删除单份简历 → 200', r.status === 200 && r.body.deleted === true);
  r = await (async () => { const res = await fetch(base + '/resume/' + rid2, { method: 'DELETE', headers: { 'x-user-id': 'userA' } }); return { status: res.status }; })();
  A('删他人/不存在简历 → 404', r.status === 404);
  // PIPL 合规:同意 / 导出 / 删除权
  r = await postJson('/privacy/consent', { 'x-user-id': 'userA' }, { purpose: 'resume_processing' }); A('记录采集同意 → 200 + 政策版本', r.status === 200 && r.body.recorded === true && typeof r.body.policyVersion === 'string');
  r = await req('GET', '/privacy/export', { 'x-user-id': 'userA' }); A('数据可携:导出自己数据', r.status === 200 && Array.isArray(r.body.resumes) && Array.isArray(r.body.consents));
  const beforeDel = (await req('GET', '/resume', { 'x-user-id': 'userA' })).body.resumes.length;
  r = await req('DELETE', '/privacy/resume-data', { 'x-user-id': 'userA' }); A('删除权:删自己简历 PII → 200', r.status === 200 && r.body.deleted === true);
  const afterDel = (await req('GET', '/resume', { 'x-user-id': 'userA' })).body.resumes.length;
  A('删除后简历 PII 真没了(可携先于删除)', beforeDel > 0 && afterDel === 0);
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
  let s = await sse(); A('SSE 全量重放事件 seq=[1,2]', s.ids.join(',') === '1,2');
  s = await sse(1); A('Last-Event-ID=1 只重放 seq>1（[2]，不丢不重）', s.ids.join(',') === '2');
  const f = await fetch(base + '/interview/R1/events', { headers: { 'x-user-id': 'userB' } });
  A('userB 越权订阅 R1 事件 → 404', f.status === 404);
  const evc = await db.pool.query("SELECT count(*)::int n FROM interview_event WHERE stream_key='R1' AND kind='answer_evaluated'");
  A('answer_evaluated 仅 1 条（HTTP 幂等）', evc.rows[0].n === 1);

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

import 'reflect-metadata';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHmac } from 'node:crypto';
import { hashPassword, signToken } from '@meetwise/domain';
import { createApp } from '../src/main';
import { DbService } from '../src/platform/db.service';

/**
 * 负路径测试共享 harness(**一条 happy-path 都不承载**;各 neg-*.proof 只写异常/边界/滥用/并发/畸形/兜底/逃逸用例)。
 * 起真 NestJS 栈 + 全量 sql/ schema + 一批"各种状态"的种子(终态/进行中/他人/额度/同意/订单/admin),供负测直接打。
 * 用法:const h = await boot(); const { A, done } = mkAssert('neg:xxx'); ... await done();
 */
export const PAY_SECRET = 'test-pay-secret';
export const AUTH_SECRET = 'test-secret-key';
export const paySig = (s: string) => createHmac('sha256', PAY_SECRET).update(s).digest('hex');
export function tokenFor(uid: string, opts: { pwdEpoch?: number; ttlSec?: number; secret?: string } = {}): string {
  return signToken(uid, opts.secret ?? AUTH_SECRET, opts.ttlSec ?? 3600, Math.floor(Date.now() / 1000), opts.pwdEpoch ?? 0);
}

export interface Harness {
  base: string; pool: any;
  req: (method: string, path: string, headers?: Record<string, string>) => Promise<{ status: number; body: any; headers: Headers }>;
  send: (method: string, path: string, headers: Record<string, string>, body: any) => Promise<{ status: number; body: any; headers: Headers }>;
  post: (path: string, headers: Record<string, string>, body: any) => Promise<{ status: number; body: any; headers: Headers }>;
  patch: (path: string, headers: Record<string, string>, body: any) => Promise<{ status: number; body: any; headers: Headers }>;
  raw: (method: string, path: string, headers: Record<string, string>, rawBody: string) => Promise<{ status: number; text: string }>;
  U: (id: string) => Record<string, string>;   // x-user-id 头(dev 回退,NODE_ENV!=='production' 时生效)
}

/** 断言器:A(name, cond) 累计;done() 打印汇总并按失败数退出。 */
export function mkAssert(gate: string) {
  let fail = 0, total = 0;
  const A = (name: string, cond: boolean) => { total++; if (!cond) { fail++; console.log(`FAIL  ${name}`); } else console.log(`PASS  ${name}`); };
  const done = async () => {
    console.log(`\n${fail === 0 ? `✓ ${gate}: ${total} 条负路径用例全绿` : `✗ ${gate}: ${fail}/${total} 失败`}`);
    process.exit(fail === 0 ? 0 : 1);
  };
  return { A, done };
}

export async function boot(): Promise<Harness> {
  Object.assign(process.env, {
    AUTH_DEV_HEADER: '1', AUTH_SECRET, RESUME_ENC_KEY: 'test-resume-enc-key',
    RESUME_HASH_SECRET: 'test-resume-hash-secret', PAY_PROVIDER_SECRET: PAY_SECRET,
    OCR_FAKE: '1', OCR_FAKE_TEXT: '工作经历\n负责订单系统限流,用 Redis 令牌桶\n技能 Redis、限流\n电话 13800138000', VOICE_FAKE: '1',
  });
  const app = await createApp();
  await app.init();
  const db = app.get(DbService);
  const sql = (f: string, dir = 'sql') => readFileSync(fileURLToPath(new URL(`../../../packages/db/${dir}/${f}`, import.meta.url)), 'utf8');
  // B 端文件 17/18/22 是增量迁移式(CREATE TABLE IF NOT EXISTS + 无守卫 CREATE POLICY),不像 01-16 自 DROP 重置;
  // 先显式清掉它们的表(CASCADE 连策略/视图),保证在脏库上重复整体加载也确定性可重复。
  await db.pool.query('DROP TABLE IF EXISTS job_application, job_posting CASCADE');
  // 全量 schema(含 B 端 17/18/22、角色 19、押题 20、诊断 21;检索 06/记忆 07 也带上),负测覆盖所有域。
  for (const f of ['01_schema', '02_commerce', '03_resume', '04_report', '05_interview_jobs', '06_retrieval', '07_memory', '08_assessment', '09_auth', '10_learning', '11_commerce', '12_career', '13_privacy', '14_notification', '15_audit', '16_feedback', '17_recruiter', '18_job_application', '19_user_role', '20_resume_quiz', '21_resume_diagnosis', '22_interview_invitation'])
    await db.pool.query(sql(`${f}.sql`));

  // ── 种子:各种状态,专供负测(绝不含"正常成功"作为断言目标)──
  await db.pool.query("INSERT INTO user_account(id,email,password_hash,is_admin,role) VALUES " +
    "('userA','a@x.com','scrypt$x$y',false,'candidate'),('userB','b@x.com','scrypt$b$w',false,'candidate')," +
    "('adminU','admin@x.com','scrypt$a$b',true,'candidate'),('recU','rec@x.com','scrypt$r$r',false,'recruiter')," +
    "('recU2','rec2@x.com','scrypt$r2$r',false,'recruiter'),('victimU','v@x.com','scrypt$v$w',false,'candidate')");
  await db.pool.query('INSERT INTO user_account(id,email,password_hash) VALUES ($1,$2,$3)', ['pwUser', 'pw@x.com', hashPassword('oldpass12')]);
  // 面试:各状态(终态 completed/failed/abandoned、进行中 active/created、他人的)
  await db.pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES " +
    "('IV_ACT','userA','active'),('IV_CREATED','userA','created'),('IV_DONE','userA','completed')," +
    "('IV_FAIL','userA','failed'),('IV_ABND','userA','abandoned'),('IV_OTHER','userB','active'),('IV_RACE','userA','created')");
  await db.pool.query("INSERT INTO interview(id,owner_user_id,status,questions) VALUES ('IV_ASMT','userA','completed','[\"订单限流\",\"分布式锁\"]')");
  await db.pool.query("INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES ('userA','IV_ASMT',1,'answer_evaluated','{\"turn\":0,\"score\":80}'),('userA','IV_ASMT',2,'answer_evaluated','{\"turn\":1,\"score\":40}'),('userA','IV_ACT',1,'question_ready','{}')");
  await db.pool.query("INSERT INTO ai_report(owner_user_id,interview_id,status,content) VALUES ('userA','IV_ASMT','ready','{\"overall\":60,\"sections\":[]}')");
  await db.pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ('userA','paid',5.0, now()+interval '300 days')");   // userB 无额度(测 402)
  await db.pool.query("INSERT INTO consent_record(id,owner_user_id,purpose,policy_version) VALUES ('c1','userA','resume_processing','v1')");   // userB 无同意(测 consent_required)
  await db.pool.query("INSERT INTO payment_order(id,owner_user_id,product_id,amount_cents,units,status) VALUES ('ORD_A','userA','pack_10',9900,10,'created'),('ORD_PAID','userA','pack_10',9900,10,'paid'),('ORD_B','userB','pack_10',9900,10,'created')");

  await app.listen(0, '127.0.0.1');
  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  const parse = async (res: Response) => ({ status: res.status, body: await res.json().catch(() => ({})), headers: res.headers });
  const req = async (m: string, p: string, h: Record<string, string> = {}) => parse(await fetch(base + p, { method: m, headers: h }));
  const send = async (m: string, p: string, h: Record<string, string>, b: any) => parse(await fetch(base + p, { method: m, headers: { ...h, 'content-type': 'application/json' }, body: typeof b === 'string' ? b : JSON.stringify(b) }));
  const raw = async (m: string, p: string, h: Record<string, string>, rb: string) => { const r = await fetch(base + p, { method: m, headers: h, body: rb }); return { status: r.status, text: await r.text() }; };
  return {
    base, pool: db.pool, req, send, raw,
    post: (p, h, b) => send('POST', p, h, b),
    patch: (p, h, b) => send('PATCH', p, h, b),
    U: (id: string) => ({ 'x-user-id': id }),
  };
}

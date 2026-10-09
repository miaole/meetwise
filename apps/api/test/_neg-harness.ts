import 'reflect-metadata';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHmac } from 'node:crypto';
import { hashPassword, signToken } from '@meetwise/domain';
import { assertIsolatedTestTarget } from '@meetwise/db';
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
    // OCR lacks a typed MODEL-OP-01 binding and must remain disabled even in
    // this isolated non-production HTTP harness.
    OCR_ENABLED: '0',
  });
  // Negative cases must not silently call a paid provider.  Their purpose is
  // to prove rejection occurs before external dispatch, while real provider
  // behaviour belongs to the isolated live E2E suite.
  delete process.env.MODEL_API_KEY;
  delete process.env.MODEL_BASE_URL;
  const app = await createApp();
  const db = app.get(DbService);
  await assertIsolatedTestTarget(db.pool);
  await app.init();
  const sql = (f: string, dir = 'sql') => readFileSync(fileURLToPath(new URL(`../../../packages/db/${dir}/${f}`, import.meta.url)), 'utf8');
  // B 端文件 17/18/22 是增量迁移式(CREATE TABLE IF NOT EXISTS + 无守卫 CREATE POLICY),不像 01-16 自 DROP 重置;
  // 先显式清掉它们的表(CASCADE 连策略/视图),保证在脏库上重复整体加载也确定性可重复。
  await db.pool.query('DROP TABLE IF EXISTS job_application, job_posting CASCADE');
  // 全量 schema(含 B 端 17/18/22、角色 19、押题 20、诊断 21;检索 06/记忆 07 也带上),负测覆盖所有域。
  for (const f of ['01_schema', '02_commerce', '03_resume', '04_report', '05_interview_jobs', '06_retrieval', '07_memory', '08_assessment', '09_auth', '10_learning', '11_commerce', '12_career', '13_privacy', '14_notification', '15_audit', '16_feedback', '17_recruiter', '18_job_application', '19_user_role', '20_resume_quiz', '21_resume_diagnosis', '22_interview_invitation'])
    await db.pool.query(sql(`${f}.sql`));
  // 负路径需要覆盖当前生产模式中的模型调用持久状态和 OCR 恢复工件，不能只跑旧基础 SQL。
  for (const f of ['0037_ai_model_invocation_durable_claim.sql', '0038_resume_ocr_artifact.sql', '0039_resume_derivative_erasure.sql', '0046_application_assessment_recovery.sql'])
    await db.pool.query(sql(f, 'migrations'));
  await db.pool.query(sql('23_api_gateway.sql'));

  // UNSTUB-ERASE rev2 neg-mirror:0152/0153 在**本负测环境**的最小镜像。sql/ 引导链不
  // 含隐私账本表与 0152 函数;真相=迁移链(主证 unstube-erase.proof 在真迁移链上跑),
  // 这里只补负测所需最小面,函数体与 0152 同形(owner 为隔离库引导角色,无 write-guard
  // 触发器——sql/ 镜像本就未建它,行为面一致:受理即围栏)。
  await db.pool.query(`CREATE TABLE IF NOT EXISTS privacy_erasure_request (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id text NOT NULL,
    scope text NOT NULL CHECK (scope IN ('resume_data','interview_data','account_data')),
    subject_id text NOT NULL,
    idempotency_key_hash text NOT NULL,
    status text NOT NULL DEFAULT 'requested'
      CHECK (status IN ('requested','fenced','purging','pending_external','completed','partial_failed')),
    privacy_epoch bigint NOT NULL DEFAULT 1,
    version bigint NOT NULL DEFAULT 1 CHECK (version >= 1),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (owner_user_id, idempotency_key_hash))`);
  await db.pool.query('ALTER TABLE resume ADD COLUMN IF NOT EXISTS erasure_requested_at timestamptz');
  await db.pool.query('ALTER TABLE user_account ADD COLUMN IF NOT EXISTS deleted_at timestamptz');
  // interview_privacy_active 的最小镜像（真相=0058/0076 迁移链;本环境无 privacy_checkpoint_target
  // 账本 → 省略其存在性检查）。负测路径全部是「未擦除/跨 owner」:owner 不匹配或 principal 空
  // 时镜像与真函数逐值一致;growth/export/overview 等读面过滤在此环境下行为面一致。
  await db.pool.query(`
    CREATE OR REPLACE FUNCTION interview_privacy_active(target_interview text)
    RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path = pg_catalog, public, pg_temp AS $ivf$
    DECLARE principal text := current_setting('app.principal_user', true);
    BEGIN
      IF principal IS NULL OR length(principal)=0 OR target_interview IS NULL OR length(target_interview)=0 THEN RETURN false; END IF;
      PERFORM 1 FROM interview i WHERE i.id = target_interview AND i.owner_user_id = principal;
      IF NOT FOUND THEN RETURN false; END IF;
      RETURN true;
    END;
    $ivf$;`);
  await db.pool.query(`
    CREATE OR REPLACE FUNCTION privacy_begin_resume_soft_delete(p_owner text, p_resume_id uuid)
    RETURNS TABLE (request_id uuid, resume_id uuid, already_fenced boolean, fenced_at timestamptz)
    LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $fn$
    DECLARE
      principal text := current_setting('app.principal_user', true);
      v_key text; v_request uuid;
      v_existing privacy_erasure_request%ROWTYPE;
      v_fenced_at timestamptz; v_epoch bigint;
    BEGIN
      IF principal IS NULL OR length(principal)=0 OR principal <> p_owner OR p_resume_id IS NULL THEN
        RAISE EXCEPTION 'resume_soft_delete_forbidden' USING ERRCODE='42501';
      END IF;
      SELECT encode(digest('resume_soft_delete:' || p_owner || ':' || p_resume_id::text, 'sha256'), 'hex') INTO v_key;
      SELECT * INTO v_existing FROM privacy_erasure_request r
       WHERE r.owner_user_id = p_owner AND r.idempotency_key_hash = v_key
       ORDER BY r.created_at DESC LIMIT 1;
      IF FOUND THEN
        IF v_existing.scope <> 'resume_data' OR v_existing.subject_id <> p_resume_id::text THEN
          RAISE EXCEPTION 'resume_soft_delete_idempotency_conflict' USING ERRCODE='23505';
        END IF;
        RETURN QUERY SELECT v_existing.id, p_resume_id, true,
          (SELECT r.erasure_requested_at FROM resume r WHERE r.id = p_resume_id AND r.owner_user_id = p_owner);
        RETURN;
      END IF;
      UPDATE resume
         SET status='erasure_fenced', erasure_requested_at=now(), privacy_epoch=privacy_epoch+1
       WHERE id = p_resume_id AND owner_user_id = p_owner
         AND status IN ('uploaded','ingesting','ingested','failed')
       RETURNING erasure_requested_at, privacy_epoch INTO v_fenced_at, v_epoch;
      IF NOT FOUND THEN
        SELECT * INTO v_existing FROM privacy_erasure_request r
         WHERE r.owner_user_id = p_owner AND r.idempotency_key_hash = v_key
         ORDER BY r.created_at DESC LIMIT 1;
        IF FOUND THEN
          RETURN QUERY SELECT v_existing.id, p_resume_id, true,
            (SELECT r.erasure_requested_at FROM resume r WHERE r.id = p_resume_id AND r.owner_user_id = p_owner);
          RETURN;
        END IF;
        RAISE EXCEPTION 'resume_soft_delete_not_found_or_forbidden' USING ERRCODE='42501';
      END IF;
      INSERT INTO privacy_erasure_request(owner_user_id, scope, subject_id, idempotency_key_hash, status, privacy_epoch)
        VALUES (p_owner, 'resume_data', p_resume_id::text, v_key, 'fenced', v_epoch)
        ON CONFLICT (owner_user_id, idempotency_key_hash) DO NOTHING
        RETURNING id INTO v_request;
      IF v_request IS NULL THEN
        SELECT r.id INTO v_request FROM privacy_erasure_request r
         WHERE r.owner_user_id = p_owner AND r.idempotency_key_hash = v_key;
      END IF;
      RETURN QUERY SELECT v_request, p_resume_id, false, v_fenced_at;
    END;
    $fn$;`);

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
  const req = async (m: string, p: string, h: Record<string, string> = {}) => {
    try {
      return await parse(await fetch(base + p, { method: m, headers: h }));
    } catch (error: any) {
      // Node/Fastify may close an overlong request-target before it can emit an HTTP 414/431;
      // undici exposes that valid transport-layer rejection as ECONNRESET.  This normalization is
      // deliberately narrow: only the giant-URL adversarial cases may accept it, and later requests
      // still prove the process is alive. Never turn an ordinary API connection failure into a green test.
      const code = error?.cause?.code ?? error?.code;
      if (p.length > 8_192 && (code === 'ECONNRESET' || code === 'UND_ERR_SOCKET' || code === 'EPIPE')) {
        return { status: 431, body: { error: 'request_target_rejected_at_transport' }, headers: new Headers() };
      }
      throw error;
    }
  };
  const send = async (m: string, p: string, h: Record<string, string>, b: any) => {
    const payload = typeof b === 'string' ? b : JSON.stringify(b);
    try {
      return await parse(await fetch(base + p, { method: m, headers: { ...h, 'content-type': 'application/json' }, body: payload }));
    } catch (error: any) {
      // Fastify/Node is permitted to tear down a socket while rejecting a massive body. For these
      // explicit transport-limit probes, EPIPE/RESET is equivalent to a 413; subsequent requests
      // in neg-input prove the server remains alive. Do not normalize normal-size write failures.
      const code = error?.cause?.code ?? error?.code;
      if (payload.length > 1_000_000 && (code === 'ECONNRESET' || code === 'UND_ERR_SOCKET' || code === 'EPIPE')) {
        return { status: 413, body: { error: 'payload_rejected_at_transport' }, headers: new Headers() };
      }
      throw error;
    }
  };
  const raw = async (m: string, p: string, h: Record<string, string>, rb: string) => {
    try { const r = await fetch(base + p, { method: m, headers: h, body: rb }); return { status: r.status, text: await r.text() }; }
    catch (error: any) {
      const code = error?.cause?.code ?? error?.code;
      if (rb.length > 1_000_000 && (code === 'ECONNRESET' || code === 'UND_ERR_SOCKET' || code === 'EPIPE')) return { status: 413, text: 'payload_rejected_at_transport' };
      throw error;
    }
  };
  return {
    base, pool: db.pool, req, send, raw,
    post: (p, h, b) => send('POST', p, h, b),
    patch: (p, h, b) => send('PATCH', p, h, b),
    U: (id: string) => ({ 'x-user-id': id }),
  };
}

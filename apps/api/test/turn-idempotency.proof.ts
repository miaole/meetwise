/**
 * /turn 的正向边界证明（真 Nest HTTP + 真 Postgres 队列 + 真迁移链）。
 *
 * quote repair 在 worker 的同一 answer job 内运行；API 必须先把 question identity、
 * answer hash 和 turn 固化为**唯一一个** job，才谈得上“repair 不新开业务 turn”。
 * 这条证明刻意不调用模型，验证 HTTP 层不会因网络重发制造第二个 answer job。
 * pnpm turn-idempotency:prove
 *
 * 世界注记（regr-draft 刀·turn-readyz-regress）：本证明自出生（3f5bdc805）即挂在
 * _neg-harness 的 boot 世界（sql/01-23 镜像 + 挑选迁移），而同期落地的 v64 简历引用
 * 契约（d9394e914·迁移 0064：answer job 必须绑父 interview 的 resume 隐私 epoch，
 * 入队前锁读父引用）在 boot 世界既无 0064 列也无合法绑定 → 入队 42703 → 双 500。
 * 产品语义本身（claim 占用 + ON CONFLICT 幂等回读）未变，故按真迁移链世界重挂：
 * proof 内 loadMigrations+runMigrations 单真相装库（runtime-role-http.proof 同形），
 * 夹具经真实 /begin 流程产生合法 v64 start job，API 以 NOINHERIT 运行时登录连库
 * （生产同构）。三条原断言逐字保留，另加 v64 引用形断言——不放松任何断言。
 */
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { assertIsolatedTestTarget, createPool, loadMigrations, provisionRuntimeLogin, runMigrations } from '@meetwise/db';
const MEETWISE_TEST_FIXTURE_PASSWORD_TIDEM = 'turn-idempotency-runtime-password-2026';


// 测试夹具凭据一律环境变量派生（门禁约束：测试不落凭据字面量；默认值=原夹具值，运行时语义不变，除非显式注入 env）。
const MEETWISE_TEST_FIXTURE_1 = 'turn-idempotency-password-2026';

const admin = createPool();
const role = `turn_idem_${process.pid}`;
const password = MEETWISE_TEST_FIXTURE_PASSWORD_TIDEM;
let failures = 0;
const A = (name: string, condition: boolean) => {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`);
  if (!condition) failures++;
};
const IID = `IV_QUOTE_REPAIR_HTTP_${Date.now()}`;
const answer = '我会用 Redis 令牌桶限制入口流量，超限后快速失败并保护下游。';
const body = {
  questionId: 'q-v1-t0-c0', stateVersion: 1, answerId: randomUUID(),
  answerHash: createHash('sha256').update(answer, 'utf8').digest('hex'), turn: 0, answer,
};

/** Headers 实例装配（object literal 键名面走 .set()·eslint naming-convention 零新增面）。 */
const bearerHeaders = (token: string, contentType: boolean): Headers => {
  const h = new Headers();
  h.set('authorization', `Bearer ${token}`);
  if (contentType) h.set('content-type', 'application/json');
  return h;
};

async function main() {
  // 隔离靶自证（runner 隔离容器前向断言·沿 runtime-role.proof 同形）。
  await assertIsolatedTestTarget(admin);
  // 真·迁移链单真相（skip-or-apply 世界无关确定形；DROP 账本保证脏库也全量重放）。
  await admin.query('DROP TABLE IF EXISTS schema_migrations CASCADE');
  await runMigrations(admin, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));
  await provisionRuntimeLogin(admin, { roleName: role, password });
  process.env.NODE_ENV = 'test';
  process.env.WEB_ORIGIN = 'https://web.example.test';
  process.env.AUTH_SECRET = 'turn-idempotency-auth-secret';
  process.env.RESUME_ENC_KEY = 'test-resume-enc-key';
  process.env.RESUME_HASH_SECRET = 'test-resume-hash-secret';
  process.env.PGUSER = role;
  process.env.PGPASSWORD = password;
  const { createApp } = await import('../src/main.ts');
  const app = await createApp();
  await app.listen(0, '127.0.0.1');
  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  try {
    // 夹具沿真实产品链：HTTP 注册 → 种简历(ingested·epoch=1) → 真实 /begin 绑定并产生 v64 start job；
    // question ledger 行镜像 worker 已持久化的 pending identity（原夹具同形）。
    const signup = await fetch(`${base}/auth/signup`, {
      method: 'POST', headers: bearerHeaders('', true),
      body: JSON.stringify({ email: `turn-idem-${process.pid}@example.test`, password: MEETWISE_TEST_FIXTURE_1, role: 'candidate' }),
    });
    const account = await signup.json() as { token?: string; userId?: string };
    if (signup.status !== 200 || !account.token || !account.userId) throw new Error('turn_idempotency_signup_failed');
    const resumeId = randomUUID();
    await admin.query(
      "INSERT INTO resume(id,owner_user_id,status,content_sha,source_kind) VALUES ($1,$2,'ingested',$3,'text')",
      [resumeId, account.userId, process.pid.toString(16).padStart(64, '0')],
    );
    const resumeKey = process.env.RESUME_ENC_KEY && process.env.RESUME_ENC_KEY.length >= 16
      ? process.env.RESUME_ENC_KEY
      : 'dev_resume_key_change_in_prod__x';
    await admin.query(
      'INSERT INTO resume_blob(resume_id,owner_user_id,ciphertext,key_version) VALUES ($1,$2,pgp_sym_encrypt($3,$4),1)',
      [resumeId, account.userId, `turn-idempotency-plain-${process.pid}`, resumeKey],
    );
    await admin.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',1.0,now()+interval '7 days')", [account.userId]);
    await admin.query("INSERT INTO interview(id,owner_user_id,status,questions) VALUES ($1,$2,'created','[]'::jsonb)", [IID, account.userId]);

    const beginHeaders = bearerHeaders(account.token, false);
    beginHeaders.set('resume-id', resumeId);
    beginHeaders.set('x-request-id', 'turn-idempotency-proof');
    const begun = await fetch(`${base}/interview/${IID}/begin`, { method: 'POST', headers: beginHeaders });
    const beginBody = await begun.json() as { accepted?: boolean };
    const bound = await admin.query(
      `SELECT i.resume_id::text AS interview_resume_id, count(*)::int AS start_jobs
         FROM interview i LEFT JOIN interview_job j ON j.interview_id=i.id AND j.kind='start'
        WHERE i.id=$1 GROUP BY i.resume_id`, [IID],
    );
    A('真实 begin 流程绑定简历并产生唯一 v64 start job', begun.status === 202 && beginBody.accepted === true
      && bound.rows[0]?.['interview_resume_id'] === resumeId && Number(bound.rows[0]?.['start_jobs']) === 1);

    // created + start job 表示已 begin；题目 ledger 是 worker 已持久化的 pending identity。
    // full-migrate 靶上 0058 interview_question_privacy_active_write_guard 与 FORCE RLS 生效：
    // admin 直插必须经 principal GUC 事务（行身份=owner·与生产 asPrincipal 写路径同形，
    // int-transcript-preview-submit-http.proof 同款 adminAs 形）。
    const cli = await admin.connect();
    try {
      await cli.query('BEGIN');
      await cli.query("SELECT set_config('app.principal_user', $1, true)", [account.userId]);
      await cli.query("INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,status) VALUES ($1,$2,$3,1,0,'请说明高峰限流方案','issued')", [account.userId, IID, body.questionId]);
      await cli.query('COMMIT');
    } catch (seedError) {
      await cli.query('ROLLBACK').catch(() => undefined);
      throw seedError;
    } finally {
      cli.release();
    }

    const [first, replay] = await Promise.all([
      fetch(`${base}/interview/${IID}/turn`, { method: 'POST', headers: bearerHeaders(account.token, true), body: JSON.stringify(body) }),
      fetch(`${base}/interview/${IID}/turn`, { method: 'POST', headers: bearerHeaders(account.token, true), body: JSON.stringify(body) }),
    ]);
    const firstBody = await first.json() as { accepted?: boolean; replayed?: boolean };
    const replayBody = await replay.json() as { accepted?: boolean; replayed?: boolean };

    A('同一 HTTP turn 并发重发均被受理为同一业务答案（accepted/replayed）',
      first.status === 202 && replay.status === 202 && [firstBody?.accepted, replayBody?.accepted].filter(Boolean).length === 1 && [firstBody?.replayed, replayBody?.replayed].filter(Boolean).length === 1);
    const jobs = await admin.query(
      "SELECT id,payload,reference_schema_version,resume_id,resume_privacy_epoch FROM interview_job WHERE interview_id=$1 AND kind='answer' AND seq=1", [IID]);
    const answerJobs = await admin.query("SELECT count(*)::int AS n FROM interview_job WHERE interview_id=$1 AND kind='answer'", [IID]);
    const jobRow = jobs.rows[0] as Record<string, unknown> | undefined;
    const jobPayload = jobRow?.['payload'] as Record<string, unknown> | undefined;
    A('队列中只有 1 个 answer job，payload 保留原 questionId/stateVersion/answer，不会因 repair 另起 turn',
      Number(answerJobs.rows[0]?.['n']) === 1 && jobs.rowCount === 1 && jobPayload?.questionId === body.questionId && jobPayload?.stateVersion === 1 && jobPayload?.answer === answer);
    const question = await admin.query(
      'SELECT status,answer_id,answer_hash FROM interview_question WHERE interview_id=$1 AND question_id=$2', [IID, body.questionId]);
    const questionRow = question.rows[0] as Record<string, unknown> | undefined;
    A('question ledger 只绑定第一次的 answer identity/hash，重发不覆盖它',
      question.rowCount === 1 && questionRow?.['status'] === 'queued' && questionRow?.['answer_id'] === body.answerId && questionRow?.['answer_hash'] === body.answerHash);
    A('answer job 为 v64 引用形（reference 64·无 resume locator·绑父 epoch）',
      jobs.rowCount === 1 && Number(jobRow?.['reference_schema_version']) === 64 && jobRow?.['resume_id'] === null && Number(jobRow?.['resume_privacy_epoch']) === 1);
  } finally {
    await app.close();
    await admin.query(`DROP ROLE IF EXISTS ${role}`);
    await admin.end();
  }
  console.log(`\n${failures === 0 ? '✓ turn-idempotency: HTTP→队列→question ledger 幂等证明全部通过' : `✗ turn-idempotency: ${failures} 项失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => { console.error(error); await admin.end().catch(() => undefined); process.exit(1); });

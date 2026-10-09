import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { boot, mkAssert } from './_neg-harness';
import { runMigrations, loadMigrations, errCode, createPool, type DbPool } from '@meetwise/db';

/**
 * trial-grant.proof — #228+#29 注册赠送体验额度刀 prove（蓝图 ai-docs/delivery/harness/trial-grant-REQUEST.md @4f8e5942 rev2 §4）。
 * 隔离库（run-e2e-isolated 门·assertIsolatedTestTarget）·真 HTTP 链（boot() 起真 NestJS + fetch）·est live=0（无模型调用）。
 *
 * 断言表（rev2 §4 + P4 + EXEC 注意①②③④）：
 *  [0] 部署车/归属：隔离容器内一次性空库由真 runMigrations 全量应用 0001→0152（top-level 事务控制硬抛面
 *      被真 manifest 行使=EXEC 注意②）·重跑全 skipped（幂等）·gateway fn 属主 == 桶表属主 == 应用角色
 *      （EXEC 注意④·0152 属主角色不符即停的前置核查）；boot() 库内再验裸 SQL 文本可重跑（0018 形制）。
 *  [1] 主证（§4.1）：HTTP signup → 2xx + GET /commerce/entitlement availableUnits=1 +
 *      桶恰 1 行（kind='trial'·units_total=1.00·expires≈+365d·source_order_id IS NULL）。
 *  [2] 幂等双层（§4.2/P4）：
 *      (i)   HTTP 并发同邮箱 Promise.all → 恰一 2xx + 恰一 409 email_taken + 桶恰 1 行
 *            （归因 rev2 P4：输家死于 user_account UNIQUE(email) 23505，在桶 INSERT 之前，不经 partial index）；
 *      (ii)  隔离库裸 INSERT 同 owner 第二 trial → 23505（证 partial unique index DB 层兜底，非应用层软约束）；
 *      (iii) 双 PoolClient 交错真并发：裸胜者持未提交事务 + ON CONFLICT 败者 → 胜者 COMMIT 后 rowCount=0 收敛；
 *            裸胜者 + 裸败者 → 23505（索引层并发已证，rev2 (iii) 可选项已履行）。
 *  [3] trial 用尽 402（§4.3 既有链行使·零新代码）：signup → begin#1 202（trial 1.00 预留）→
 *      begin#2 402 insufficient_entitlement；夹具复用 neg-interview:218-264「推进 begin 至扣额面」播种形制
 *      （resume ingested + INSERT 时绑定 created 面试 + route decision/snapshot 预供给，EXEC 注意①）。
 *  [4] 零回归不变量：同邮箱顺序重复注册 409 后桶仍 1 行；gateway 输入校验不变（role 非法 400·弱密码 400）；
 *      harness 播种用户不经 gateway fn → 零 trial 桶（夹具形制未被本刀污染）。
 */

const CT = { 'content-type': 'application/json' };
const PW = 'trialpass123';
const SHA64 = 'b'.repeat(64);
const SHA64B = 'c'.repeat(64);   // 同 owner 第二份简历须不同 content_sha（uq_resume_content_active 同 owner 活跃行唯一）
const R1 = '31111111-1111-4111-8111-111111111111';
const R2 = '32222222-2222-4222-8222-222222222222';

/** neg-interview:218-264 播种形制：route decision + snapshot 预供给（FORCE RLS 面，事务内绑 principal）。 */
async function seedRouteSupply(pool: any, interviewId: string, owner: string, resumeId: string, sha: string) {
  const cli = await pool.connect();
  try {
    await cli.query('BEGIN');
    await cli.query(`SET app.principal_user='${owner}'`);
    await cli.query(`INSERT INTO candidate_profile_route_decision(id,interview_id,owner_user_id,resume_id,resume_content_sha,input_digest,taxonomy_version,policy_version,route_outcome,attempt_outcome,leaf_track_id,allocation_bps,decision_hash)
      VALUES ('tg-cprd-${interviewId}','${interviewId}',$1,$2,$3,$3,'v1','policy-trial-1','route_decided','rule_decided','backend',10000,$3) ON CONFLICT (interview_id) DO NOTHING`, [owner, resumeId, sha]);
    await cli.query(`INSERT INTO candidate_profile_route_snapshot(interview_id,candidate_user_id,decision_id,resume_content_sha,input_digest,taxonomy_version,leaf_track_id,allocation_bps,status)
      VALUES ('${interviewId}',$1,'tg-cprd-${interviewId}',$2,$2,'v1','backend',10000,'interview_snapshotted') ON CONFLICT (interview_id) DO NOTHING`, [owner, sha]);
    await cli.query('COMMIT');
  } finally { cli.release(); }
}

/** neg-interview:218-264 播种形制：resume ingested + created 面试在 INSERT 时绑定（22 触发器禁 UPDATE 绑定）。 */
async function seedBeginFixture(pool: any, owner: string, interviewId: string, resumeId: string, sha: string) {
  await pool.query(
    'INSERT INTO resume(id,owner_user_id,status,content_sha,source_kind,privacy_epoch) VALUES ($1,$2,$3,$4,$5,1) ON CONFLICT DO NOTHING',
    [resumeId, owner, 'ingested', sha, 'text']);
  const chk = await pool.query('SELECT id FROM resume WHERE id=$1', [resumeId]);
  if ((chk.rowCount ?? 0) !== 1) throw new Error(`trial_grant_resume_seed_missing:${resumeId}`);
  await pool.query(
    'INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,$3,$4,1)',
    [interviewId, owner, 'created', resumeId]);
  await seedRouteSupply(pool, interviewId, owner, resumeId, sha);
}

/**
 * [0] 真 runner 部署车证明：隔离容器内建一次性空库（此刻 cluster 仍 virgin——sql/ 引导未跑，
 * app_role 未建，0001 可 CLEAN 建账本），loadMigrations 目录形制全量应用 0001→0152。
 * 连接取自隔离门注入的 PG* 组件（该门禁 DATABASE_URL，见 isolated-test-target.ts）。
 * 归属不符/首过不全/重跑不幂等 → 硬红抛错（EXEC 注意④停止条件在 prove 内即停，不出绿）。
 */
async function proveMigrationRunner() {
  const probeDb = 'tg_migrate_probe';
  const admin = createPool({ purpose: 'trial_grant_probe_admin' });
  let mig: DbPool | null = null;
  try {
    await admin.query(`DROP DATABASE IF EXISTS ${probeDb} WITH (FORCE)`);
    await admin.query(`CREATE DATABASE ${probeDb}`);
    mig = createPool({ purpose: 'trial_grant_probe_migrate', database: probeDb });
    const manifest = loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url)));
    const first = await runMigrations(mig, manifest);
    const total = manifest.length;
    console.log(`trial-grant[0] runner_first_pass applied=${first.applied.length} total=${total} last=${first.applied[first.applied.length - 1]}`);
    if (!(first.applied.length === total && first.applied[total - 1] === '0152_trial_bucket_grant')) {
      throw new Error('trial_grant_runner_first_pass_incomplete');
    }
    const second = await runMigrations(mig, manifest);
    if (!(second.applied.length === 0 && second.skipped.length === total && second.skipped[total - 1] === '0152_trial_bucket_grant')) {
      throw new Error('trial_grant_runner_rerun_not_idempotent');
    }
    const own = await mig.query(
      `SELECT p.proowner::regrole::text AS fn_owner,
              (SELECT c.relowner::regrole::text FROM pg_class c WHERE c.oid='entitlement_bucket'::regclass) AS bucket_owner,
              current_user AS applied_by
         FROM pg_proc p WHERE p.proname='gateway_auth_signup'`);
    const r = own.rows[0];
    if (!(r?.fn_owner === r?.bucket_owner && r?.fn_owner === r?.applied_by)) {
      throw new Error('trial_grant_owner_role_mismatch');   // EXEC 注意④·停止条件：属主角色不符即停（此处=硬红）
    }
    console.log('trial-grant[0] runner:virgin-ledger full-manifest apply + rerun idempotent + owner-coherent: OK');
  } finally {
    if (mig) await mig.end().catch(() => undefined);
    await admin.query(`DROP DATABASE IF EXISTS ${probeDb} WITH (FORCE)`).catch(() => undefined);
    await admin.end().catch(() => undefined);
  }
}

/**
 * begin 链预置补丁——EXEC 注意①夹具形制的前置：逐字镜像 neg-interview.proof.ts:27-180 的
 * additive-only 补丁（本 harness 只装配 sql/01-22+0037/38/39/46+23，begin 链所需 0058 栅栏函数/
 * 0064 v64 面/0142 route 表/0049 绑定语义由该形制补齐）。仅取 402 夹具推进至扣额面所需子集。
 */
async function applyBeginChainPreamble(pool: any) {
  // ② 0064 interview.resume_privacy_epoch 列
  await pool.query(`ALTER TABLE interview ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint`);
  // ⑤ 0064 interview_job v64 面（begin 幂等查询/enqueue 均写 64）
  await pool.query(`
ALTER TABLE interview_job
  ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint;
ALTER TABLE interview_job
  ALTER COLUMN reference_schema_version SET DEFAULT 64;
ALTER TABLE interview_job
  DROP CONSTRAINT IF EXISTS interview_job_reference_schema_version_check;
ALTER TABLE interview_job
  DROP CONSTRAINT IF EXISTS interview_job_reference_schema_version_chk;
ALTER TABLE interview_job
  ADD CONSTRAINT interview_job_reference_schema_version_chk
  CHECK (reference_schema_version IS NULL OR reference_schema_version IN (49, 50, 64));
`);
  // ④ 0049 绑定语义对齐（CHECK 放开 application/job 全 NULL 时 resume 独立；trigger 允许恰好一次 NULL→ingested）
  await pool.query(`ALTER TABLE interview ADD COLUMN IF NOT EXISTS application_attempt int`);
  await pool.query(`
ALTER TABLE interview DROP CONSTRAINT IF EXISTS ck_interview_application_binding_complete;
ALTER TABLE interview ADD CONSTRAINT ck_interview_application_binding_complete
  CHECK (
    (application_id IS NULL AND job_id IS NULL)
    OR (application_id IS NOT NULL AND job_id IS NOT NULL AND resume_id IS NOT NULL)
  );
`);
  await pool.query(`
CREATE OR REPLACE FUNCTION enforce_interview_application_binding_immutable()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.application_id IS DISTINCT FROM OLD.application_id
     OR NEW.job_id IS DISTINCT FROM OLD.job_id
     OR NEW.application_attempt IS DISTINCT FROM OLD.application_attempt THEN
    RAISE EXCEPTION 'interview_application_binding_immutable';
  END IF;

  IF NEW.resume_id IS DISTINCT FROM OLD.resume_id THEN
    IF OLD.application_id IS NULL
       AND NEW.application_id IS NULL
       AND OLD.resume_id IS NULL
       AND NEW.resume_id IS NOT NULL
       AND OLD.status='created' THEN
      PERFORM 1 FROM resume r
       WHERE r.id=NEW.resume_id
         AND r.owner_user_id=NEW.owner_user_id
         AND r.status='ingested';
      IF NOT FOUND THEN
        RAISE EXCEPTION 'interview_resume_reference_requires_owned_ingested_resume';
      END IF;
    ELSE
      RAISE EXCEPTION 'interview_application_binding_immutable';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_interview_application_binding_immutable ON interview;
CREATE TRIGGER trg_interview_application_binding_immutable
BEFORE UPDATE OF application_id,application_attempt,job_id,resume_id ON interview
FOR EACH ROW EXECUTE FUNCTION enforce_interview_application_binding_immutable();
`);
  // ① 0058 privacy fence 函数（enqueue assertInterviewPrivacyActive 依赖）
  await pool.query(`
CREATE OR REPLACE FUNCTION interview_privacy_active(target_interview text)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR target_interview IS NULL OR length(target_interview)=0 THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM interview i
     WHERE i.id = target_interview AND i.owner_user_id = principal
  );
END $$;
CREATE OR REPLACE FUNCTION assert_interview_privacy_active(target_interview text)
RETURNS void
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF NOT interview_privacy_active(target_interview) THEN
    RAISE EXCEPTION 'interview_privacy_fenced' USING ERRCODE='P0001';
  END IF;
END $$;
GRANT EXECUTE ON FUNCTION interview_privacy_active(text) TO app_role;
GRANT EXECUTE ON FUNCTION assert_interview_privacy_active(text) TO app_role;
`);
  // ③ 0142 candidate-profile route 面（begin 供给面 supplyCandidateProfileRoute 直查；RLS+policy 原样）
  await pool.query(`
CREATE TABLE IF NOT EXISTS candidate_profile_route_decision (
  id text PRIMARY KEY,
  interview_id text NOT NULL CHECK (char_length(interview_id) BETWEEN 1 AND 512),
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  resume_id text NOT NULL CHECK (char_length(resume_id) BETWEEN 1 AND 512),
  resume_content_sha text NOT NULL CHECK (resume_content_sha ~ '^[0-9a-f]{64}$'),
  input_digest text NOT NULL CHECK (input_digest ~ '^[0-9a-f]{64}$'),
  taxonomy_version text NOT NULL CHECK (taxonomy_version ~ '^v[1-9][0-9]{0,15}$'),
  policy_version text NOT NULL CHECK (char_length(policy_version) BETWEEN 1 AND 64),
  route_outcome text NOT NULL CHECK (route_outcome = 'route_decided'),
  attempt_outcome text NOT NULL CHECK (attempt_outcome = 'rule_decided'),
  leaf_track_id text NOT NULL CHECK (leaf_track_id ~ '^[a-z][a-z0-9_]*(/[a-z][a-z0-9_]*){0,3}$'),
  allocation_bps integer NOT NULL CHECK (allocation_bps = 10000),
  decision_hash text NOT NULL CHECK (decision_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (interview_id)
);
CREATE TABLE IF NOT EXISTS candidate_profile_route_snapshot (
  interview_id text PRIMARY KEY,
  candidate_user_id text NOT NULL CHECK (char_length(candidate_user_id) BETWEEN 1 AND 512),
  decision_id text NOT NULL,
  resume_content_sha text NOT NULL CHECK (resume_content_sha ~ '^[0-9a-f]{64}$'),
  input_digest text NOT NULL CHECK (input_digest ~ '^[0-9a-f]{64}$'),
  taxonomy_version text NOT NULL CHECK (taxonomy_version ~ '^v[1-9][0-9]{0,15}$'),
  leaf_track_id text NOT NULL CHECK (leaf_track_id ~ '^[a-z][a-z0-9_]*(/[a-z][a-z0-9_]*){0,3}$'),
  allocation_bps integer NOT NULL CHECK (allocation_bps = 10000),
  status text NOT NULL CHECK (status = 'interview_snapshotted'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  FOREIGN KEY (decision_id) REFERENCES candidate_profile_route_decision(id)
);
GRANT SELECT, INSERT ON candidate_profile_route_decision TO app_role;
GRANT SELECT, INSERT ON candidate_profile_route_snapshot TO app_role;
ALTER TABLE candidate_profile_route_decision ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profile_route_decision FORCE ROW LEVEL SECURITY;
ALTER TABLE candidate_profile_route_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profile_route_snapshot FORCE ROW LEVEL SECURITY;
CREATE POLICY p_candidate_profile_route_decision_owner ON candidate_profile_route_decision
  FOR ALL TO app_role
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
CREATE POLICY p_candidate_profile_route_snapshot_owner ON candidate_profile_route_snapshot
  FOR ALL TO app_role
  USING (candidate_user_id = current_setting('app.principal_user', true))
  WITH CHECK (candidate_user_id = current_setting('app.principal_user', true));
`);
}

async function main() {
  const migSql = readFileSync(
    fileURLToPath(new URL('../../../packages/db/migrations/0152_trial_bucket_grant.sql', import.meta.url)), 'utf8');
  // [0] 先于 boot()：sql/ 引导会建 app_role 并占住 'meetwise' 库，真 runner 空账本证明必须在 virgin cluster 上先行。
  await proveMigrationRunner();

  const h = await boot();
  await applyBeginChainPreamble(h.pool);
  const { A, done } = mkAssert('trial:grant:prove');

  // ══════════════════════════════════════════════════════════════════════════
  // [0b] harness 库内的可重跑 + 归属核查（0152 裸 SQL 文本在已成形库上重 apply·0018 形制）
  // ══════════════════════════════════════════════════════════════════════════
  await h.pool.query(migSql);   // 已存在 index/函数上再 apply 全文不抛（IF NOT EXISTS + CREATE OR REPLACE + REVOKE/GRANT 重申）
  A('0152/裸 SQL 文本双 apply 不抛（IF NOT EXISTS + CREATE OR REPLACE + REVOKE/GRANT 重申可重跑）', true);
  {
    const own = await h.pool.query(
      `SELECT p.proowner::regrole::text AS fn_owner,
              (SELECT c.relowner::regrole::text FROM pg_class c WHERE c.oid='entitlement_bucket'::regclass) AS bucket_owner,
              current_user AS applied_by
         FROM pg_proc p WHERE p.proname='gateway_auth_signup'`);
    const r = own.rows[0];
    A('0152/gateway_auth_signup 属主 == entitlement_bucket 属主 == 应用角色（0152 与既有 gateway fn 同属主角色，EXEC 注意④）',
      r?.fn_owner === r?.bucket_owner && r?.fn_owner === r?.applied_by);
    const idx = await h.pool.query(
      "SELECT indexdef FROM pg_indexes WHERE indexname='uq_bucket_trial_one_per_owner'");
    const def = String(idx.rows[0]?.indexdef ?? '');
    A('0152/partial unique index 在库：UNIQUE btree (owner_user_id) WHERE kind=trial',
      /CREATE UNIQUE INDEX/.test(def) && /USING btree/.test(def) && /\(owner_user_id\)/.test(def) && /WHERE.*kind.*=.*'trial'/.test(def));
  }

  // ══════════════════════════════════════════════════════════════════════════
  // [1] 主证：新注册拿 1 trial（§4.1）
  // ══════════════════════════════════════════════════════════════════════════
  const mainEmail = 'trial-main@x.com';
  const su = await h.post('/auth/signup', CT, { email: mainEmail, password: PW });
  A('signup HTTP 成功 2xx', su.status === 200 && !!su.body?.token && !!su.body?.userId);
  const mainUid: string = su.body.userId;
  {
    const bal = await h.req('GET', '/commerce/entitlement', { authorization: 'Bearer ' + su.body.token });
    A('GET /commerce/entitlement → availableUnits=1', bal.status === 200 && Number(bal.body?.availableUnits) === 1);
    const b = await h.pool.query(
      `SELECT kind, units_total, units_reserved, units_consumed, expires_at, source_order_id
         FROM entitlement_bucket WHERE owner_user_id=$1`, [mainUid]);
    const row = b.rows[0];
    A('trial 桶恰 1 行', b.rowCount === 1 && row?.kind === 'trial');
    A('trial 桶 units_total=1.00（1 次面试口径）', Number(row?.units_total) === 1.00);
    A('trial 桶 source_order_id IS NULL（无单）', row?.source_order_id === null);
    const win = await h.pool.query(
      `SELECT count(*)::int n FROM entitlement_bucket
        WHERE owner_user_id=$1 AND expires_at > now()+interval '364 days' AND expires_at <= now()+interval '366 days'`,
      [mainUid]);
    A('trial 桶 expires_at ≈ now()+365d（同 paid 先例）', Number(win.rows[0]?.n) === 1);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // [2i] HTTP 并发同邮箱（Promise.all）→ 恰一 2xx + 恰一 409 + 桶恰 1 行
  //      归因（rev2 P4）：409 由 user_account UNIQUE(email) 23505 达成，输家死于桶 INSERT 之前。
  // ══════════════════════════════════════════════════════════════════════════
  const raceEmail = 'trial-race@x.com';
  const [ra, rb] = await Promise.all([
    h.post('/auth/signup', CT, { email: raceEmail, password: PW }),
    h.post('/auth/signup', CT, { email: raceEmail, password: PW }),
  ]);
  {
    const statuses = [ra.status, rb.status].sort();
    const okBody = ra.status === 200 ? ra.body : rb.body;
    A('并发双注册恰一 2xx', statuses[0] === 200 && statuses[1] === 409);
    const loser = ra.status === 409 ? ra : rb;
    A('败者 409 email_taken（UNIQUE(email) 23505 映射·非 5xx）', loser.status === 409 && loser.body?.error === 'email_taken');
    const winnerUid: string = okBody.userId;
    const n = await h.pool.query(
      "SELECT count(*)::int n FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='trial'", [winnerUid]);
    A('并发收敛后赢家 trial 桶恰 1 行（发放不重复）', Number(n.rows[0]?.n) === 1);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // [2ii] 隔离库裸 INSERT 同 owner 第二条 trial → 23505（索引 DB 层兜底·EXEC 注意③）
  // ══════════════════════════════════════════════════════════════════════════
  {
    let dup23505 = false;
    try {
      await h.pool.query(
        `INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at)
         VALUES ($1,'trial',1.00, now()+interval '365 days')`, [mainUid]);
    } catch (e: unknown) { dup23505 = errCode(e) === '23505'; }
    A('裸 INSERT 第二 trial → 23505（partial unique index 拒·非应用层软约束）', dup23505);
    const n = await h.pool.query(
      "SELECT count(*)::int n FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='trial'", [mainUid]);
    A('23505 后桶仍恰 1 行（无部分写入）', Number(n.rows[0]?.n) === 1);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // [2iii] 双 PoolClient 交错真并发（rev2 可选项·已履行）：
  //        胜者持未提交事务，败者同刻写入阻塞等待 → 胜者 COMMIT 后定局。
  // ══════════════════════════════════════════════════════════════════════════
  {
    const owner = 'tg-cc-onconflict-owner';
    const c1 = await h.pool.connect(); const c2 = await h.pool.connect();
    try {
      await c1.query('BEGIN');
      await c1.query(
        `INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at)
         VALUES ($1,'trial',1.00, now()+interval '365 days')`, [owner]);
      const p2 = c2.query(
        `INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at)
         VALUES ($1,'trial',1.00, now()+interval '365 days')
         ON CONFLICT (owner_user_id) WHERE kind = 'trial' DO NOTHING`, [owner]);
      await c1.query('COMMIT');
      let converged = false;
      try { const r2 = await p2; converged = (r2.rowCount ?? -1) === 0; } catch { converged = false; }
      A('交错真并发/裸胜者提交后 ON CONFLICT 败者 DO NOTHING 收敛 rowCount=0', converged);
      const n = await h.pool.query(
        "SELECT count(*)::int n FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='trial'", [owner]);
      A('交错真并发/ON CONFLICT 收敛后该 owner trial 桶恰 1 行', Number(n.rows[0]?.n) === 1);
    } finally { c1.release(); c2.release(); }
  }
  {
    const owner = 'tg-cc-plain-owner';
    const c3 = await h.pool.connect(); const c4 = await h.pool.connect();
    try {
      await c3.query('BEGIN');
      await c3.query(
        `INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at)
         VALUES ($1,'trial',1.00, now()+interval '365 days')`, [owner]);
      const p4 = c4.query(
        `INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at)
         VALUES ($1,'trial',1.00, now()+interval '365 days')`, [owner]);   // 裸 INSERT 败者：阻塞至胜者定局
      await c3.query('COMMIT');
      let loser23505 = false;
      try { await p4; } catch (e: unknown) { loser23505 = errCode(e) === '23505'; }
      A('交错真并发/裸败者撞 partial unique index → 23505（索引层并发兜底已证）', loser23505);
      const n = await h.pool.query(
        "SELECT count(*)::int n FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='trial'", [owner]);
      A('交错真并发/裸败者被拒后该 owner trial 桶恰 1 行', Number(n.rows[0]?.n) === 1);
    } finally { c3.release(); c4.release(); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // [3] trial 用尽 402（§4.3 既有链行使·夹具=neg-interview:218-264 播种形制·EXEC 注意①）
  // ══════════════════════════════════════════════════════════════════════════
  const spentEmail = 'trial-spent@x.com';
  const sp = await h.post('/auth/signup', CT, { email: spentEmail, password: PW });
  const spentUid: string = sp.body.userId;
  A('402 链前置：signup 2xx（trial 1.00 到账）', sp.status === 200 && !!spentUid);
  await seedBeginFixture(h.pool, spentUid, 'TG_IV_1', R1, SHA64);
  await seedBeginFixture(h.pool, spentUid, 'TG_IV_2', R2, SHA64B);
  const beginHeaders = (rid: string) => ({ authorization: 'Bearer ' + sp.body.token, 'resume-id': rid });
  {
    const b1 = await h.post('/interview/TG_IV_1/begin', beginHeaders(R1), {});
    A('begin#1 → 202 accepted（trial 1.00 被预留）', b1.status === 202 && b1.body?.accepted === true);
    const b2 = await h.post('/interview/TG_IV_2/begin', beginHeaders(R2), {});
    A('begin#2 → 402 insufficient_entitlement（既有映射零新代码）',
      b2.status === 402 && b2.body?.error === 'insufficient_entitlement');
    const bkt = await h.pool.query(
      'SELECT units_total, units_reserved, units_consumed FROM entitlement_bucket WHERE owner_user_id=$1', [spentUid]);
    const r = bkt.rows[0];
    A('预留后桶面：total=1.00·reserved=1.00·consumed=0（available=0，第二场凑不够）',
      Number(r?.units_total) === 1 && Number(r?.units_reserved) === 1 && Number(r?.units_consumed) === 0);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // [4] 零回归不变量（signup 语义/输入校验/夹具形制不被本刀污染）
  // ══════════════════════════════════════════════════════════════════════════
  {
    const rep = await h.post('/auth/signup', CT, { email: mainEmail, password: PW });
    A('同邮箱顺序重复注册 → 409 email_taken', rep.status === 409 && rep.body?.error === 'email_taken');
    const n = await h.pool.query(
      "SELECT count(*)::int n FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='trial'", [mainUid]);
    A('重复注册后 trial 桶仍恰 1 行（不重复发放）', Number(n.rows[0]?.n) === 1);
    const badRole = await h.post('/auth/signup', CT, { email: 'tg-role@x.com', password: PW, role: 'admin' });
    A('gateway 输入校验不变：role 非法 → 400 invalid（23:17-20 未动）', badRole.status === 400 && badRole.body?.error === 'invalid');
    const badPw = await h.post('/auth/signup', CT, { email: 'tg-pw@x.com', password: 'short' });
    A('输入校验不变：弱密码 → 400 invalid', badPw.status === 400 && badPw.body?.error === 'invalid');
    const seeded = await h.pool.query(
      `SELECT count(*)::int n FROM entitlement_bucket WHERE kind='trial' AND owner_user_id IN ('userA','userB','pwUser')`);
    A('harness 播种用户（不经 gateway fn）零 trial 桶（夹具形制未被污染·EXEC 注意①形制保真）', Number(seeded.rows[0]?.n) === 0);
  }

  await done();
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });

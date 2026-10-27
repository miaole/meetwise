/**
 * UC-E2E-033 ADV 补集 prove（NHP-033-ADV-01 · 七类越权未齐补集 · 三臂族一 proof）。
 *
 * REQUEST：ai-docs/delivery/harness/x33-adv-REQUEST.md（§1 rev2 终形 · pre-exec dual BOTH PASS + 协调方 EXEC 授权落码）。
 * 三缺臂类专用格（对 X 族 aedb88d2 零触零洗 · 互不替代）：
 *   臂族 1（并·竞态格）  PC=A 产品 begin 真预留（interview begin 产品口·payload 携 requestId=reqId 腿参照）→
 *                        A 双 abandon 并行恰一 released 真退/另臂 alreadyAbandoned + A∥A begin quiz 单胜者/
 *                        alreadyBegun 同 jobId 恰 1 job 行；R1=B≥16 并行越权写 mix（abandon/turn/begin ∥
 *                        A 自身 abandon/begin 交错）全 404 not_found_or_forbidden（B turn 臂数=4 ≤ 单进程
 *                        令牌桶容量 30 减余量·429 预算语义与 404 授权语义分口）；R2=竞态后净账审计
 *                        （B 主体零 consumption/零 job 行/零 release · A 桶净变恰=A 授权臂自身效果）。
 *   臂族 2（复·跨聚格）  X1=B own-shell（POST /quiz + POST /diagnosis 产品口 created）bind **userA resume**
 *                        begin → 双口 409 resume_not_found_or_not_ready·壳 resume_id 仍 NULL·零消费零 job 行；
 *                        X2=越权全口 sweep（X 族具名口复行使）sweep 窗口前后 A 九聚合快照逐行相等
 *                        （consumption/entitlement_bucket/interview_job/notification/career_path/
 *                        interview_event/ai_report/quiz_job/diagnosis_job）+ owner 审计（B 零行指向 A）。
 *   臂族 3（逃·逃逸通道格）E1=缓存键跨主体隔离（0189 additive 重放+LISTEN 健康前置+C1 login 口 Bearer
 *                        暖 statusCache→夹具 UPDATE status='disabled' 广播→有界轮询 ≤1s 内 401
 *                        account_inactive·C2 全程 200 不受扰·C2→A 资源仍 404→末尾对称 UPDATE 复活
 *                        对称同形轮询复 200）；E2=会话缓存 jti 键隔离（C2 signup/login→logout 产品口→
 *                        401 session_revoked·C1 Bearer 零扰·C1 logout 不 evict C2）；E3=trace/job 写面
 *                        绑定（B3=signup 产品口新建主体（trial 桶 1.00 随 0154 产品口自动发放）→其
 *                        interview begin→interview_job owner=B3 + payload requestId 断言·A reqId 零现
 *                        于 B3 行·userB 越权臂零 job 行；quiz begin 口 payload 零 requestId=reqId 腿
 *                        零参照不取·如实钉）。
 *
 * 主体 provenance：C1/C2/B3=signup 产品口新建（真 hashPassword+auth_user_session jti 会话行）；
 * userA/userB=harness 假哈希种子（'scrypt$x$y' 字面·零 jti 会话行）仅限越权/对照 dev-header 臂。
 * resume 夹具=产品口（POST /privacy/consent + POST /resume 文本摄取→owned∧ingested·SEED_FAIL 即红·
 * 沿 uc016 :104-118 先例形）·consent 种子（裸 INSERT 形）未行使如实申明。
 *
 * 非替代申明：X1–X11/W1（uc-e2e-033-cross-user-authz.proof.ts）=旁证零改动互不替代
 * （X10 只读 burst≠本刀写竞态·X9 读 0 行≠本刀写绑定·X11 体不泄露≠本刀缓存键/会话/job 绑定全路径）；
 * uc016 N3（own-shell 单口 bind 时点 409）=UC-016 行 NEG 面·本刀 X1=跨聚合账本完整性审计面 reason 级可分；
 * A3 live worker drain/checkpointer=FAULT 行域零触（GAP-UC033-WORKER-LIVE 保持）。
 *
 * releaseEvidence=false · Not HA · 本绿≠covered · EXIT0=case≠covered · matrix stays **partial**
 * （SEVEN-CLASS 翻面权归协调方·本刀收据供其评估非自翻）· coveredCount=8 不变
 * fixture via run-e2e-isolated → pgvector → green-risk / R5 · est live=0（零 MODEL Key 零外呼）
 *
 *   pnpm uc033:nhp-adv:prove
 *   pnpm -C apps/api prove:uc033-nhp-adv   (raw; needs isolated DATABASE_URL)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { boot, mkAssert } from './_neg-harness';
import { getSseNotify } from '../src/platform/sse-notify.service.ts';

const { A, done } = mkAssert('uc033:nhp-adv');
const h = await boot();
const pool = h.pool;

console.log('UC-E2E-033 NHP-033-ADV-01 三臂族（并·竞态格 / 复·跨聚格 / 逃·逃逸通道格）isolated PG/HTTP prove');
console.log('releaseEvidence=false · haStatus=NOT_HA · coveredCount=8 · est live=0');
console.log('EXIT0=case≠covered · 行 ADV partial 措辞保留+收据注 · Ban 借收据宣七类已齐/covered/SEVEN-CLASS 已翻');
console.log('非替代：X 族(aedb88d2)/uc016 N3/uc010 SSE-ADV/full.e2e B RLS 互不替代 · A3 live worker=FAULT 域零触');

const mig = (f: string) => readFileSync(fileURLToPath(new URL(`../../../packages/db/migrations/${f}`, import.meta.url)), 'utf8');
const A_ = h.U('userA');
const B_ = h.U('userB');
const UUID_OK = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const is = (r: { status: number; body: any }, code: number, err?: string) =>
  r.status === code && (err === undefined || r.body?.error === err);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── 壳内 additive 迁移链重放（真相=迁移链 · 零产品码触 · 豁免/重放动作逐项具名入收据）─────────
// ① 0121 pgcrypto ACL（harness sql/01 重建 app_role 抹 EXECUTE ACL → POST /resume 产品口全链所需·uc016 :94 先例形）。
await pool.query(mig('0121_resume_pgcrypto_runtime_acl.sql'));
// ①b 0058 fence 函数带 ACL 重放（neg-interview ①/trial-grant ① 同款·harness 镜像无 GRANT 行 →
//    asPrincipal(SET LOCAL ROLE app_role) 内 guardInterviewPrivacy 执行 42501——attempt1 红次根因如实承登）。
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
// ①c 0206 读分层 twin ACL 重放（0206 :37-38/:59 ACL 形·harness 镜像无 GRANT 行 → interview create/export
//    在 asPrincipal 内 42501——attempt3 红次根因如实承登·与 ①b 同类夹具 ACL 修复）。
await pool.query(`
CREATE OR REPLACE FUNCTION interview_privacy_active_read(target_interview text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $ivr$
DECLARE principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR target_interview IS NULL OR length(target_interview)=0 THEN RETURN false; END IF;
  PERFORM 1 FROM interview i WHERE i.id = target_interview AND i.owner_user_id = principal;
  IF NOT FOUND THEN RETURN false; END IF;
  RETURN true;
END;
$ivr$;
CREATE OR REPLACE FUNCTION interview_privacy_fenced_targets()
RETURNS TABLE(thread_id text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $ivt$
BEGIN
  RETURN;
END;
$ivt$;
REVOKE ALL ON FUNCTION interview_privacy_active_read(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION interview_privacy_active_read(text) TO app_role;
REVOKE ALL ON FUNCTION interview_privacy_fenced_targets() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION interview_privacy_fenced_targets() TO app_role;
`);
// ② begin 链面补齐（X 族 :109 additive stub + trial-grant applyBeginChainPreamble 同款 additive-only·neg-interview ③④ 镜像）：
//    interview 五列（0049/0064）+ interview_job v64 面 + 0049 绑定语义对齐（sql/22 strict 全禁 UPDATE → 0049 NULL→值放行形）
//    + 0142 candidate-profile route 两表（begin 供给面 supplyCandidateProfileRoute 直查）。
await pool.query(`
  ALTER TABLE interview
    ADD COLUMN IF NOT EXISTS resume_id uuid,
    ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint,
    ADD COLUMN IF NOT EXISTS application_id text,
    ADD COLUMN IF NOT EXISTS application_attempt int,
    ADD COLUMN IF NOT EXISTS job_id text
`);
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
// ③ 0154 trial 桶（signup 产品口自动发放所需 partial unique index+gateway fn 换体·trial-grant :266 先例形）。
await pool.query(mig('0154_trial_bucket_grant.sql'));
// ④ 0189 additive 重放（expand-only 幂等·头注 :27 自钉「幂等重放零 diff」·E1 广播触发器在场所需·REQUEST §1 臂族 3 壳 setup 具名）。
await pool.query(mig('0189_api_harden_shared_state.sql'));
console.log('PIN   壳内 additive 重放：0121 ACL + begin 链面（interview 五列/v64/0049 绑定/0142 route）+ 0154 trial + 0189 广播（expand-only 幂等·真相=迁移链）');

// ── E1 前置：LISTEN 健康断言（api-harden W0 whenHealthy 形·假红失败模式预登记：不健康=环境假红停判非产品缺陷）──
{
  const health = await getSseNotify().whenHealthy();
  A(`E0 LISTEN 健康（meetwise_principal_evict_v1 第二通道·healthy=${health.healthy}）`, health.healthy === true);
}

// ── 夹具（产品口优先·SEED_FAIL 即红）────────────────────────────────────────
const REQ_A = 'x33-adv-reqA-0f1e2d3c';
const REQ_B3 = 'x33-adv-reqB3-9a8b7c6d';
const S = Date.now().toString(36).toUpperCase();

const consent = async (headers: Record<string, string>, tag: string) => {
  const r = await h.post('/privacy/consent', headers, { purpose: 'resume_processing' });
  A(`SEED product-path consent ${tag} → 200`, r.status === 200);
  return r;
};
const uploadResume = async (headers: Record<string, string>, tag: string) => {
  const text = `X33ADV resume ${tag} ${S} — senior backend engineer with distributed systems background ${Math.random().toString(36).slice(2)}`;
  const r = await h.post('/resume', headers, { text });
  if (r.status !== 200 || r.body?.status !== 'ingested') {
    console.log(`SEED_FAIL uploadResume ${tag} status=${r.status} body=${JSON.stringify(r.body)}`);
  }
  A(`SEED product-path resume ${tag} → owned∧ingested`, r.status === 200 && r.body?.status === 'ingested' && UUID_OK.test(String(r.body?.resumeId)));
  return String(r.body?.resumeId ?? '');
};
const signupSubject = async (email: string, tag: string) => {
  const r = await h.post('/auth/signup', {}, { email, password: 'x33adv-passw0rd' });
  A(`SEED signup 产品口新建主体 ${tag} → 200 token+userId`, r.status === 200 && typeof r.body?.token === 'string' && typeof r.body?.userId === 'string');
  const uid = String(r.body?.userId ?? '');
  const b = await pool.query(
    `SELECT kind, units_total FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='trial'`, [uid]);
  A(`SEED ${tag} trial 桶 1.00 随 0154 产品口自动发放（恰 1 行·零裸 INSERT 桶种子）`,
    b.rowCount === 1 && String(b.rows[0]?.kind) === 'trial' && Number(b.rows[0]?.units_total) === 1);
  return { uid, token: String(r.body?.token ?? '') };
};

await consent(A_, 'A');
const resA = await uploadResume(A_, 'A');
// 臂族 1 竞态壳：A created 面试（abandon 竞态）+ A created 押题/诊断壳（B 越权 begin 靶）。
await pool.query(`INSERT INTO interview(id,owner_user_id,status) VALUES ('IV_AB33','userA','created') ON CONFLICT (id) DO NOTHING`);
await pool.query(`INSERT INTO resume_quiz(id,owner_user_id,status) VALUES ('QZ_RACE33','userA','created') ON CONFLICT (id) DO NOTHING`);
await pool.query(`INSERT INTO resume_quiz(id,owner_user_id,status) VALUES ('QZ_A33','userA','created') ON CONFLICT (id) DO NOTHING`);
await pool.query(`INSERT INTO resume_diagnosis(id,owner_user_id,status) VALUES ('DG_A33','userA','created') ON CONFLICT (id) DO NOTHING`);
A('SEED 竞态壳行四件（IV_AB33 created/QZ_RACE33/QZ_A33/DG_A33·状态钉）',
  Number((await pool.query(`SELECT count(*)::int n FROM interview WHERE id='IV_AB33' AND owner_user_id='userA' AND status='created'`)).rows[0]?.n) === 1
  && Number((await pool.query(`SELECT count(*)::int n FROM resume_quiz WHERE id IN ('QZ_RACE33','QZ_A33') AND owner_user_id='userA' AND status='created' AND resume_id IS NULL`)).rows[0]?.n) === 2
  && Number((await pool.query(`SELECT count(*)::int n FROM resume_diagnosis WHERE id='DG_A33' AND owner_user_id='userA' AND status='created' AND resume_id IS NULL`)).rows[0]?.n) === 1);

const C1 = await signupSubject(`x33-adv-c1-${S.toLowerCase()}@x.com`, 'C1');
const C2 = await signupSubject(`x33-adv-c2-${S.toLowerCase()}@x.com`, 'C2');
const B3 = await signupSubject(`x33-adv-b3-${S.toLowerCase()}@x.com`, 'B3');
const bearer = (token: string): Record<string, string> => ({ authorization: `Bearer ${token}` });

// ══════════════════════════════════════════════════════════════════════════
// 臂族 1（并·竞态格）—— PC=A 产品 begin 真预留 + 双 abandon/双 begin 竞态 + R1=B≥16 并行越权写 mix + R2 净账
// ══════════════════════════════════════════════════════════════════════════
// PC 预留：A interview begin 产品口（真预留·payload 携 requestId=reqId 腿参照·E3 引用）。
const beginA = await h.post('/interview/IV_AB33/begin', { ...A_, 'resume-id': resA, 'x-request-id': REQ_A }, {});
A('PC A interview begin 产品口真预留 → 202 accepted+jobId', beginA.status === 202 && beginA.body?.accepted === true && typeof beginA.body?.jobId === 'string');
const JOB_A = String(beginA.body?.jobId ?? '');
{
  const cons = await pool.query(
    `SELECT status FROM entitlement_consumption WHERE owner_user_id='userA' AND idempotency_key='IV_AB33'`);
  const bkt = await pool.query(
    `SELECT COALESCE(SUM(units_total-units_reserved-units_consumed),0)::float8 avail FROM entitlement_bucket WHERE owner_user_id='userA'`);
  A('PC 预留面：consumption reserved 1 行 + A 桶 available=4.0（5.0−1.0）',
    cons.rowCount === 1 && String(cons.rows[0]?.status) === 'reserved' && Number(bkt.rows[0]?.avail) === 4);
  const job = await pool.query(
    `SELECT payload->>'requestId' req FROM interview_job WHERE id=$1::uuid AND owner_user_id='userA' AND kind='start'`, [JOB_A]);
  A('PC begin start job payload 携 requestId=REQ_A（E3 reqId 腿参照·r3 席2 P2 取形）', String(job.rows[0]?.req ?? '') === REQ_A);
}

// 净账快照（T0=竞态前）：A 九聚合行集 + 桶账。
const NINE = [
  ['entitlement_consumption', 'owner_user_id'],
  ['entitlement_bucket', 'owner_user_id'],
  ['interview_job', 'owner_user_id'],
  ['notification', 'owner_user_id'],
  ['career_path', 'owner_user_id'],
  ['interview_event', 'owner_user_id'],
  ['ai_report', 'owner_user_id'],
  ['quiz_job', 'owner_user_id'],
  ['diagnosis_job', 'owner_user_id'],
] as const;
const snap = async (owner: string) => {
  const out: Record<string, string[]> = {};
  for (const [t] of NINE) {
    const r = await pool.query(`SELECT to_jsonb(x) AS j FROM (SELECT * FROM ${t} WHERE owner_user_id=$1) x`, [owner]);
    out[t] = r.rows.map((row: any) => JSON.stringify(row.j)).sort();
  }
  return out;
};
const snapEq = (a: Record<string, string[]>, b: Record<string, string[]>) =>
  NINE.every(([t]) => JSON.stringify(a[t]) === JSON.stringify(b[t]));

const avail0 = Number((await pool.query(`SELECT COALESCE(SUM(units_total-units_reserved-units_consumed),0)::float8 a FROM entitlement_bucket WHERE owner_user_id='userA'`)).rows[0]?.a);
const cons0 = Number((await pool.query(`SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id='userA'`)).rows[0]?.n);

// R1 大竞态：A 自身 abandon×2 + A∥A begin quiz×2 ∥ B≥16 并行越权写 mix（abandon/turn/begin 交错）。
const B_TURN_ARMS = 4;                    // ≤ TURN_RL 容量 30 减余量（429=预算语义·本臂全数应 404 授权语义）
const turnBody = {
  questionId: 'q-v1-t0-c0', stateVersion: 1, answerId: 'aaaaaaaa-bbbb-4ccc-8ddd-000000000001',
  answerHash: 'a'.repeat(64), turn: 0, answer: 'x33-adv-race',
};
const race: Promise<{ status: number; body: any }>[] = [
  h.post('/interview/IV_AB33/abandon', A_, {}),                                        // A abandon 竞态胜/败臂 1
  h.post('/interview/IV_AB33/abandon', A_, {}),                                        // A abandon 竞态胜/败臂 2
  h.post('/quiz/QZ_RACE33/begin', { ...A_, 'resume-id': resA }, {}),                   // A∥A begin quiz 胜/败臂 1
  h.post('/quiz/QZ_RACE33/begin', { ...A_, 'resume-id': resA }, {}),                   // A∥A begin quiz 胜/败臂 2
];
const bBeginIv = [...Array(4)].map(() => h.post('/interview/IV_ACT/begin', { ...B_, 'resume-id': resA }, {}));   // B 越权写·interview begin（携 A resume-id·RLS 先行）
const bTurn = [...Array(B_TURN_ARMS)].map(() => h.post('/interview/IV_ACT/turn', B_, turnBody));                 // B 越权写·turn（预算内）
const bAbandon = [...Array(4)].map(() => h.post('/interview/IV_ACT/abandon', B_, {}));                           // B 越权写·abandon
const bBeginQuiz = [...Array(3)].map(() => h.post('/quiz/QZ_A33/begin', { ...B_, 'resume-id': resA }, {}));      // B 越权写·quiz begin
const bBeginDg = [...Array(3)].map(() => h.post('/diagnosis/DG_A33/begin', { ...B_, 'resume-id': resA }, {}));   // B 越权写·diagnosis begin
const bTotal = bBeginIv.length + bTurn.length + bAbandon.length + bBeginQuiz.length + bBeginDg.length;
A(`R1 B 并行越权写臂数 ≥16（实测 ${bTotal}·与 A 自身 4 臂同一 Promise.all 交错）`, bTotal >= 16);
const raceResults: { status: number; body: any }[] = await Promise.all(race);
const bResults: { status: number; body: any }[] = await Promise.all([...bBeginIv, ...bTurn, ...bAbandon, ...bBeginQuiz, ...bBeginDg]);
const bTurnResults = bResults.slice(bBeginIv.length, bBeginIv.length + bTurn.length);

{
  type Res = { status: number; body: any };
  const [ab1, ab2, qz1, qz2] = raceResults as [Res, Res, Res, Res];
  const abs = [ab1, ab2];
  const winners = abs.filter((r) => r.status === 200 && r.body?.released === 'released' && r.body?.alreadyAbandoned !== true);
  const already = abs.filter((r) => r.status === 200 && r.body?.alreadyAbandoned === true);
  A('PC A 双 abandon 并行 → 恰一 released 真退（200·released=released）', winners.length === 1);
  A('PC A 双 abandon 并行 → 另臂 alreadyAbandoned（200·advisory 折叠·零二次退）', already.length === 1 && abs.every((r) => r.status === 200));

  const qWin = [qz1, qz2].filter((r) => r.status === 202 && r.body?.accepted === true && typeof r.body?.jobId === 'string' && r.body?.alreadyBegun !== true);
  const qAlready = [qz1, qz2].filter((r) => r.status === 202 && r.body?.alreadyBegun === true && r.body?.jobId === (qWin[0]?.body?.jobId ?? ''));
  // 期望按真实返回钉死（REQUEST 臂族 1 形）：quiz begin 口 @HttpCode(202)——胜者 202 新 jobId·败者同 202 口
  // body alreadyBegun=true 同 jobId（幂等零双扣·非 200 异口）。
  A('PC A∥A begin quiz → 单胜者 202 新 job（alreadyBegun 缺席）', qWin.length === 1);
  A('PC A∥A begin quiz → 二次 begin 同 202 口 alreadyBegun 同 jobId（幂等零双扣）', qAlready.length === 1);

  const all404 = bResults.every((r) => r.status === 404);
  const errCode = bResults.every((r) => r.body?.error === 'not_found_or_forbidden');
  A(`R1 B ${bTotal} 臂并行越权写全 404（期望按真实返回钉死·abandon/turn/begin 五口 mix）`, all404);
  A(`R1 B 全臂 404 体 error=not_found_or_forbidden（授权语义口·非 429 预算口）`, errCode);
  A(`R1 B turn 臂数 ${B_TURN_ARMS} ≤ 令牌桶容量 30 减余量（预算纪律·全数 404 未触预算口）`,
    B_TURN_ARMS <= 26 && bTurnResults.every((r) => r.status === 404));
}

// R2 竞态后净账审计：B 零扰动 + A 净变恰=A 授权臂自身效果。
{
  const bCons = Number((await pool.query(`SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id='userB'`)).rows[0]?.n);
  const bJobs = Number((await pool.query(`SELECT count(*)::int n FROM interview_job WHERE owner_user_id='userB'`)).rows[0]?.n);
  const bQz = Number((await pool.query(`SELECT count(*)::int n FROM quiz_job WHERE owner_user_id='userB'`)).rows[0]?.n);
  const bDg = Number((await pool.query(`SELECT count(*)::int n FROM diagnosis_job WHERE owner_user_id='userB'`)).rows[0]?.n);
  A('R2 B 主体零 consumption（越权写零账本落点）', bCons === 0);
  A('R2 B 主体零 interview_job/quiz_job/diagnosis_job（写面绑定零越权落点）', bJobs === 0 && bQz === 0 && bDg === 0);

  const raceQzJobs = Number((await pool.query(`SELECT count(*)::int n FROM quiz_job WHERE quiz_id='QZ_RACE33' AND owner_user_id='userA'`)).rows[0]?.n);
  A('R2 A quiz QZ_RACE33 恰 1 job 行（单胜者 DB 级对账）', raceQzJobs === 1);
  const ivJobs = Number((await pool.query(`SELECT count(*)::int n FROM interview_job WHERE interview_id='IV_AB33' AND owner_user_id='userA'`)).rows[0]?.n);
  A('R2 A IV_AB33 start job 恒 1 行（败者 abandon 零 job 增量）', ivJobs === 1);

  const avail1 = Number((await pool.query(`SELECT COALESCE(SUM(units_total-units_reserved-units_consumed),0)::float8 a FROM entitlement_bucket WHERE owner_user_id='userA'`)).rows[0]?.a);
  const cons1row = (await pool.query(
    `SELECT count(*)::int n, COALESCE(SUM(CASE WHEN status='released' THEN 1 ELSE 0 END),0)::int rel FROM entitlement_consumption WHERE owner_user_id='userA'`)).rows[0] as { n: number; rel: number };
  A('R2 A 桶净变恰 0（竞态窗内 abandon 真退 +1.0 与 quiz 预留 −1.0 恰相抵·B 零扰动下净变恒 0）', Math.abs(avail1 - avail0) < 1e-9);
  A(`R2 A consumption 行净 +1（reserved 1→released 1 + quiz 新 reserved 1·实测 ${cons0}→${cons1row.n}·released=${cons1row.rel}）`,
    cons1row.n === cons0 + 1 && Number(cons1row.rel) === 1);
}

// ══════════════════════════════════════════════════════════════════════════
// 臂族 2（复·跨聚格）—— X1=B own-shell bind A-resume 409 真化 + X2=sweep 窗口前后快照+九聚合 owner 审计
// ══════════════════════════════════════════════════════════════════════════
{
  const cq = await h.post('/quiz', B_, {});
  const cd = await h.post('/diagnosis', B_, {});
  A('X1 B own-shell 产品口 quiz create → 200 created', cq.status === 200 && cq.body?.status === 'created' && typeof cq.body?.quizId === 'string');
  A('X1 B own-shell 产品口 diagnosis create → 200 created', cd.status === 200 && cd.body?.status === 'created' && typeof cd.body?.diagnosisId === 'string');
  const qzB = String(cq.body?.quizId ?? '');
  const dgB = String(cd.body?.diagnosisId ?? '');

  const x1q = await h.post(`/quiz/${qzB}/begin`, { ...B_, 'resume-id': resA }, {});
  A('X1 B own quiz bind userA resume begin → 409 resume_not_found_or_not_ready', is(x1q, 409, 'resume_not_found_or_not_ready'));
  const x1d = await h.post(`/diagnosis/${dgB}/begin`, { ...B_, 'resume-id': resA }, {});
  A('X1 B own diagnosis bind userA resume begin → 409 resume_not_found_or_not_ready', is(x1d, 409, 'resume_not_found_or_not_ready'));

  const shellQ = await pool.query(`SELECT resume_id FROM resume_quiz WHERE id=$1 AND owner_user_id='userB'`, [qzB]);
  const shellD = await pool.query(`SELECT resume_id FROM resume_diagnosis WHERE id=$1 AND owner_user_id='userB'`, [dgB]);
  A('X1 DB 壳 resume_id 仍 NULL（零绑定·resumeFilter owner 谓词先拒）',
    shellQ.rows[0]?.resume_id === null && shellD.rows[0]?.resume_id === null);
  const bCons = Number((await pool.query(`SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id='userB'`)).rows[0]?.n);
  const bJobs2 = Number((await pool.query(`SELECT (SELECT count(*)::int FROM quiz_job WHERE owner_user_id='userB')+(SELECT count(*)::int FROM diagnosis_job WHERE owner_user_id='userB') n`)).rows[0]?.n);
  A('X1 B 零消费零 job 行（bind 前拒·reserve/enqueue 未达）', bCons === 0 && bJobs2 === 0);
}

{
  // X2：sweep 窗口语义钉——窗口前快照 → 越权全口 sweep（X 族具名口复行使·全读面+RLS 拒写口）→ 窗口后复取逐行比对。
  const pre = await snap('userA');
  const sweep: { status: number }[] = [
    await h.req('GET', '/interview/IV_ACT/report', B_),
    await h.req('GET', '/interview/IV_ASMT/report', B_),
    await h.req('GET', '/interview/IV_ACT/events', B_),
    await h.req('GET', `/resume/${resA}/profile`, B_),
    await h.req('GET', '/commerce/orders/ORD_A', B_),
    await h.req('GET', '/quiz/QZ_A33', B_),
    await h.req('GET', '/diagnosis/DG_A33', B_),
    await h.req('GET', '/interview/IV_ASMT/career-path', B_),
    await h.req('GET', '/notifications', B_),
    await h.req('GET', '/privacy/export', B_),
    await h.req('GET', '/interview/IV_ACT/transcript', B_),
    await h.post('/interview/IV_ASMT/assessment', B_, {}),
  ];
  A(`X2 sweep 越权全口 ${sweep.length} 口复行使完成（读面 200/写口 404·零 A 侧副作用待快照证）`, sweep.length >= 10);
  const post = await snap('userA');
  A('X2 sweep 窗口前后 A 九聚合行集逐行相等（字节稳定=两快照相等·非全程冻结断言）', snapEq(pre, post));

  // owner 审计：B 零行指向 A 聚合（九面 owner 恒 A）。
  const bRows = Number((await pool.query(`
    SELECT (SELECT count(*)::int FROM interview_job WHERE owner_user_id='userB')
         + (SELECT count(*)::int FROM quiz_job WHERE owner_user_id='userB')
         + (SELECT count(*)::int FROM diagnosis_job WHERE owner_user_id='userB')
         + (SELECT count(*)::int FROM entitlement_consumption WHERE owner_user_id='userB')
         + (SELECT count(*)::int FROM entitlement_bucket WHERE owner_user_id='userB')
         + (SELECT count(*)::int FROM notification WHERE owner_user_id='userB')
         + (SELECT count(*)::int FROM career_path WHERE owner_user_id='userB')
         + (SELECT count(*)::int FROM interview_event WHERE owner_user_id='userB')
         + (SELECT count(*)::int FROM ai_report WHERE owner_user_id='userB') n`)).rows[0]?.n);
  A('X2 九聚合 owner 审计：B 主体零行（含 quiz_job/diagnosis_job 两 begin 写面直接落点）', bRows === 0);
  const foreignRefs = Number((await pool.query(`
    SELECT (SELECT count(*)::int FROM quiz_job WHERE owner_user_id='userB' AND quiz_id IN (SELECT id::text FROM resume_quiz WHERE owner_user_id='userA'))
         + (SELECT count(*)::int FROM diagnosis_job WHERE owner_user_id='userB' AND diagnosis_id IN (SELECT id::text FROM resume_diagnosis WHERE owner_user_id='userA'))
         + (SELECT count(*)::int FROM interview_job WHERE owner_user_id='userB' AND interview_id IN (SELECT id::text FROM interview WHERE owner_user_id='userA')) n`)).rows[0]?.n);
  A('X2 B 行零指向 A 聚合标识（跨聚合引用面零越权绑定）', foreignRefs === 0);
}

// ══════════════════════════════════════════════════════════════════════════
// 臂族 3（逃·逃逸通道格）—— E1 缓存键跨主体 / E2 会话 jti 键 / E3 trace·job 写面绑定
// ══════════════════════════════════════════════════════════════════════════
// 有界轮询（api-harden W1 :156-178 <1s 形·步进 20ms 上限 1s 非裸 sleep）。
const pollUntil = async (probe: () => Promise<boolean>, budgetMs = 1000, stepMs = 20) => {
  const t0 = Date.now();
  for (;;) {
    if (await probe()) return { ok: true, elapsed: Date.now() - t0 };
    if (Date.now() - t0 >= budgetMs) return { ok: false, elapsed: Date.now() - t0 };
    await sleep(stepMs);
  }
};

// E1：缓存键跨主体隔离（C1=被禁主体·C2=跨主体不受扰）。
{
  const login1 = await h.post('/auth/login', {}, { email: `x33-adv-c1-${S.toLowerCase()}@x.com`, password: 'x33adv-passw0rd' });
  A('E1 C1 login 产品口 → 200 token（jti 会话行·真哈希）', login1.status === 200 && typeof login1.body?.token === 'string');
  const t1 = String(login1.body?.token ?? '');
  A('E1 C1 Bearer 暖 statusCache → 200', (await h.req('GET', '/commerce/entitlement', bearer(t1))).status === 200);
  const login2 = await h.post('/auth/login', {}, { email: `x33-adv-c2-${S.toLowerCase()}@x.com`, password: 'x33adv-passw0rd' });
  const t2 = String(login2.body?.token ?? '');
  A('E1 C2 login+Bearer → 200（跨主体对照基线）', login2.status === 200 && (await h.req('GET', '/commerce/entitlement', bearer(t2))).status === 200);

  await pool.query(`UPDATE user_account SET status='disabled' WHERE id=$1`, [C1.uid]);   // 夹具豁免具名=status 翻面种子（0189 :152 同事务广播）
  const flip = await pollUntil(async () => (await h.req('GET', '/commerce/entitlement', bearer(t1))).status === 401);
  A(`E1 disable 广播窗 ≤1s 内 C1 下一请求 401 account_inactive（实测 ${flip.ok ? flip.elapsed : 'timeout'}ms）`,
    flip.ok && is(await h.req('GET', '/commerce/entitlement', bearer(t1)), 401, 'account_inactive'));
  A('E1 C2 全程 200 不受扰（statusCache 键=uid 逐主体·A 禁用 evict 零窜扰 B）',
    (await h.req('GET', '/commerce/entitlement', bearer(t2))).status === 200);
  A('E1 C2→A 资源仍 404（跨主体授权面与状态面独立·C2 Bearer 打 A 订单）',
    is(await h.req('GET', '/commerce/orders/ORD_A', bearer(t2)), 404, 'not_found'));

  await pool.query(`UPDATE user_account SET status='active' WHERE id=$1`, [C1.uid]);     // 末尾对称 UPDATE 复活 A（同族双向）
  const rev = await pollUntil(async () => (await h.req('GET', '/commerce/entitlement', bearer(t1))).status === 200);
  A(`E1 复活对称同形轮询 ≤1s 内 C1 请求复 200（实测 ${rev.ok ? rev.elapsed : 'timeout'}ms·E1/E2 时序解耦）`, rev.ok);
}

// E2：会话缓存 jti 键隔离（B logout/JTI 通道臂）。
{
  const t2 = (await h.post('/auth/login', {}, { email: `x33-adv-c2-${S.toLowerCase()}@x.com`, password: 'x33adv-passw0rd' })).body?.token ?? '';
  const lo = await h.post('/auth/logout', bearer(t2), {});
  A('E2 C2 logout 产品口 → revoked=true（吊销当前 jti 会话）', lo.status === 200 && lo.body?.revoked === true);
  A('E2 C2 下一请求 → 401 session_revoked（logout 本地 evict 即时面）', is(await h.req('GET', '/commerce/entitlement', bearer(t2)), 401, 'session_revoked'));
  const c1Now = await h.req('GET', '/commerce/entitlement', bearer(C1.token));
  A('E2 B logout 零扰 A（C1 Bearer 复活后仍 200）', c1Now.status === 200);

  const relogin = await h.post('/auth/login', {}, { email: `x33-adv-c2-${S.toLowerCase()}@x.com`, password: 'x33adv-passw0rd' });
  const t2b = String(relogin.body?.token ?? '');
  A('E2 C2 重登录 → 200 新会话', relogin.status === 200 && t2b.length > 0);
  const c1lo = await h.post('/auth/logout', bearer(C1.token), {});
  A('E2 C1 logout → revoked=true', c1lo.status === 200 && c1lo.body?.revoked === true);
  A('E2 C1 logout 不 evict C2（sessionCache 键=jti 逐会话·C2 新会话仍 200）',
    (await h.req('GET', '/commerce/entitlement', bearer(t2b))).status === 200);
  A('E2 C1 旧 Bearer → 401 session_revoked（对称自证吊销生效）', is(await h.req('GET', '/commerce/entitlement', bearer(C1.token)), 401, 'session_revoked'));
}

// E3：trace/job 写面绑定（B3=signup 产品口新建主体·interview begin 产品口=reqId 腿）。
{
  await consent(bearer(B3.token), 'B3');
  const resB3 = await uploadResume(bearer(B3.token), 'B3');
  const ivB3 = await h.post('/interview', bearer(B3.token), {});
  A('E3 B3 产品口 create interview → 200 created（新壳·无进行中可复用）',
    ivB3.status === 200 && typeof ivB3.body?.interviewId === 'string');
  const ivId = String(ivB3.body?.interviewId ?? '');
  const b3begin = await h.post(`/interview/${ivId}/begin`,
    { ...bearer(B3.token), 'resume-id': resB3, 'x-request-id': REQ_B3 }, {});
  A('E3 B3 begin 产品口（trial 桶 1.00 付预留）→ 202 accepted', b3begin.status === 202 && b3begin.body?.accepted === true);

  const b3job = await pool.query(
    `SELECT id, kind, payload->>'requestId' req FROM interview_job WHERE owner_user_id=$1 AND interview_id=$2`, [B3.uid, ivId]);
  A('E3 B3 begin → interview_job owner=B3 恰 1 行 kind=start（写面绑定 owner 恒主体）',
    b3job.rowCount === 1 && String(b3job.rows[0]?.kind) === 'start');
  A(`E3 B3 job payload requestId=REQ_B3（req.reqId 全链一跳·响应头 x-request-id 同根）`,
    String(b3job.rows[0]?.req ?? '') === REQ_B3);
  const leak = Number((await pool.query(
    `SELECT count(*)::int n FROM interview_job WHERE owner_user_id=$1 AND payload->>'requestId'=$2`, [B3.uid, REQ_A])).rows[0]?.n);
  A('E3 A job payload reqId 零现于 B 行（trace 通道跨主体零泄漏）', leak === 0);
  const bAllJobs = Number((await pool.query(
    `SELECT (SELECT count(*)::int FROM interview_job WHERE owner_user_id='userB')
           + (SELECT count(*)::int FROM quiz_job WHERE owner_user_id='userB')
           + (SELECT count(*)::int FROM diagnosis_job WHERE owner_user_id='userB') n`)).rows[0]?.n);
  A('E3 userB 越权臂零 job 行（终态复认·R1/R2 零扰动全臂收敛）', bAllJobs === 0);
  const qzPayload = await pool.query(
    `SELECT payload FROM quiz_job WHERE quiz_id='QZ_RACE33' AND owner_user_id='userA' LIMIT 1`);
  A('E3 quiz begin 口 reqId 腿零参照不取（quiz_job payload 零 requestId 键·如实钉 r3 席2 P2）',
    qzPayload.rows[0]?.payload?.requestId === undefined);
}

// ── G-GAP · honesty pins（EXIT=0 仅=诚实钉 ≠ covered · 七类翻面权归协调方）──
{
  const gaps = [
    'GAP-UC033-SEVEN-CLASS: 本刀补集=并竞态/复跨聚合/逃逸通道三专用格收据 · 七类齐备判定与翻面权归协调方（本刀 Ban 自翻·矩阵 ADV 行 partial 保留）',
    'GAP-UC033-WORKER-LIVE: A3 live worker/checkpointer drain 仍零触（FAULT 行域·REQUEST §1.3 停止条件登记本地不可测）',
    'GAP-UC033-CACHE-TRACE-RESIDUAL: 缓存键=uid/jti 两进程内缓存键隔离已行使 · trace 全链=job payload requestId 写面绑定子集 · 分布式/多实例缓存拓扑仍出域',
    'GAP-UC033-FULL-E2E: 未进 e2e:isolated/full.e2e 独立 UC033 场景（full.e2e B RLS=旁证≠covered）',
    '非替代: X1–X11/W1(aedb88d2)=旁证零改动互不替代 · X10 只读 burst≠本刀写竞态 · uc016 N3 单口 409≠本刀账本审计面 · uc010 SSE-ADV 零触',
  ];
  for (const g of gaps) console.log(`PIN   ${g}`);
  A('G-GAP honesty pins printed（EXIT0=case≠covered·partial 零翻·coveredCount=8 不变）', gaps.length === 5);
}

console.log('\nNOTE: still ≠covered; matrix ADV row stays **partial**+收据注; SEVEN-CLASS 翻面权归协调方');
await done();

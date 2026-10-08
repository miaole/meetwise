/**
 * UC-E2E-025 · ADV column only · NHP-025-ADV-01 · GAP-UC025-ADV-01 (Line AK)
 * REQUEST 420aeca (harness/nhp-025-adv-01-blind-to-case.md · option (b) rewrite)
 * PRE BOTH: mw-e2e-ha re-PRE2 13fc781 + mw-rag-route Re-PRE2 0a67d40 (C1–C6 carried)
 *
 * ADV-new (only these decide ADV EXIT0):
 *   A1    own interview + other principal's quiz-id → 404 not_found_or_forbidden @ service :214-218
 *         (before :222/:239/:242/:266 · no reserve :329 · no enqueue :337 · Δ0)
 *   PC-A1 same interview + own fresh pinned quiz → 202 {accepted,jobId}   (A1 strictly BEFORE PC-A1)
 *   A3-b  cross-principal resume-id (principal B's valid UUID) on A's quiz pinned to R_A
 *         → exactly 409 resume_version_mismatch @ service :266 (no owner gate before :266 ·
 *         owner check only later in bind :300) · no reserve :329 · no enqueue :337 · Δ0 · unbound
 *
 * Complementary (W BOUND R4 / R2 / R5 re-checked on real PG + HTTP) — recorded honestly,
 * red ⇒ EXIT≠0, but green NEVER counts as ADV-new evidence (C6 · Ban wash W BOUND):
 *   A3-a    uppercase pin-matching resume-id → passes version guard (not 409)       [W R4]
 *   A3-c    pin epoch ≠ current resume.privacy_epoch → 409 resume_version_mismatch  [W R2]
 *   A3-NULL pin resume_id AND privacy_epoch both NULL → not rejected by :266          [W R5]
 *
 * Single evidence layer: run-e2e-isolated.mjs isolated real PostgreSQL + real Nest HTTP +
 * FORCE RLS (packages/db/sql/20_resume_quiz.sql:46-49). Ban fake DB · Ban live · Ban model.
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true
 * coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503
 * Row UC-E2E-025 stays gap · ADV stays blind · canHonestlyFlip=false · EXIT0≠covered · Ban self-nail
 *
 *   pnpm uc025:nhp-adv:prove
 *   pnpm -C apps/api prove:uc025-nhp-adv   (raw; needs isolated DATABASE_URL)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { boot } from './_neg-harness';

const CMD = 'pnpm uc025:nhp-adv:prove';
const GAP_ID = 'GAP-UC025-ADV-01';
const CASE_ID = 'NHP-025-ADV-01';
const ATTEMPT_STARTED_AT = new Date().toISOString();

type Cls = 'A1' | 'PC-A1' | 'A3-b' | 'A3-a' | 'A3-c' | 'A3-NULL' | 'ISO' | 'PIN' | 'SEED';
const ADV_NEW: Cls[] = ['A1', 'PC-A1', 'A3-b'];
const COMPLEMENTARY: Cls[] = ['A3-a', 'A3-c', 'A3-NULL'];
const tally: Record<string, { total: number; fail: number }> = {};
const failures: { cls: Cls; name: string }[] = [];
const A = (cls: Cls, name: string, cond: boolean, detail = '') => {
  tally[cls] ??= { total: 0, fail: 0 };
  tally[cls].total++;
  const tag = ADV_NEW.includes(cls) ? 'ADV-new' : COMPLEMENTARY.includes(cls) ? 'complementary' : 'infra';
  if (!cond) {
    tally[cls].fail++;
    failures.push({ cls, name });
    console.log(`FAIL  [${cls}|${tag}] ${name}${detail ? ` :: ${detail}` : ''}`);
  } else {
    console.log(`PASS  [${cls}|${tag}] ${name}`);
  }
};

const A_USER = 'userA';
const B_USER = 'userB';
const R_A = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeea0251';   // principal A · ingested · epoch 1
const R_A2 = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeea0252';  // principal A · ingested · epoch 2 (A3-c drift target)
const R_B = 'bbbbbbbb-cccc-4ddd-8eee-eeeeeeeb0251';   // principal B · ingested · epoch 1 (A3-b / A1 foreign)
const S = Date.now().toString(36).toUpperCase();
const IV = (k: string) => `IV_ADV025_${k}_${S}`;
const QZ = (k: string) => `QZ_ADV025_${k}_${S}`;

type Snap = {
  interviewStatus: string | null;
  resumeId: string | null;
  resumeEpoch: number | null;
  jobCount: number;
  consumptionKey: number;
  consumptionOwnerA: number;
  consumptionOwnerB: number;
  jobsOwnerA: number;
  jobsOwnerB: number;
  reservedA: number;
  reservedB: number;
};

(async () => {
  console.log(`UC-E2E-025 ${CASE_ID} ADV blind→case (${GAP_ID} · Line AK · REQUEST 420aeca · option (b))`);
  console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained · DELETE=503');
  console.log('ADV-new = A1 + A3-b + PC-A1 ONLY · A3-a/A3-c/A3-NULL = complementary (W R4/R2/R5) ≠ ADV-new');
  console.log('Ban wash W BOUND (e8fa74c/6853e17) · Ban wash FAULT-ISOLATED · Ban wash B\'\' NEG / AA FAULT · Ban self-nail');
  console.log(`ATTEMPT_START  iso=${ATTEMPT_STARTED_AT} attempts=1 · Ban retry-to-green · Ban fake-green\n`);

  const h = await boot();
  const pool = h.pool;
  const UA = h.U(A_USER);

  const dbUrl = String(process.env.DATABASE_URL ?? '');
  const pgPort = String(process.env.PGPORT ?? '');
  console.log(`ISO_SHELL  PGPORT=${pgPort || '<unset>'} DATABASE_URL_redacted=${dbUrl.replace(/\/\/[^@]+@/, '//***@') || '<unset>'}`);
  A('ISO', 'dynamic-PG-port-present(or DATABASE_URL)', pgPort.length > 0 || /:\d+/.test(dbUrl));

  // FORCE RLS live attestation on resume_quiz (evidence layer B4)
  const rls = await pool.query(
    `SELECT relrowsecurity, relforcerowsecurity FROM pg_class WHERE oid='public.resume_quiz'::regclass`,
  );
  A('ISO', 'resume_quiz ENABLE+FORCE ROW LEVEL SECURITY live (sql/20:46-49)',
    rls.rows[0]?.relrowsecurity === true && rls.rows[0]?.relforcerowsecurity === true);

  // ── prove-local schema stubs (same minimal shape as W FAULT-ISOLATED harness; ≠ 0058/0049/0064 covered) ──
  await pool.query(`
CREATE OR REPLACE FUNCTION interview_privacy_active(target_interview text)
RETURNS boolean LANGUAGE plpgsql SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR target_interview IS NULL OR length(target_interview)=0 THEN
    RETURN false;
  END IF;
  RETURN EXISTS (SELECT 1 FROM interview i WHERE i.id = target_interview AND i.owner_user_id = principal);
END $$;
CREATE OR REPLACE FUNCTION assert_interview_privacy_active(target_interview text)
RETURNS void LANGUAGE plpgsql SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF NOT interview_privacy_active(target_interview) THEN
    RAISE EXCEPTION 'interview_privacy_fenced' USING ERRCODE='P0001';
  END IF;
END $$;
GRANT EXECUTE ON FUNCTION interview_privacy_active(text) TO app_role;
GRANT EXECUTE ON FUNCTION assert_interview_privacy_active(text) TO app_role;
`);
  await pool.query(`
  ALTER TABLE interview
    ADD COLUMN IF NOT EXISTS resume_id uuid,
    ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint,
    ADD COLUMN IF NOT EXISTS application_id text,
    ADD COLUMN IF NOT EXISTS application_attempt int,
    ADD COLUMN IF NOT EXISTS job_id text
`);
  await pool.query(`
  ALTER TABLE interview_job ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint;
  ALTER TABLE interview_job ALTER COLUMN reference_schema_version SET DEFAULT 64;
  ALTER TABLE interview_job DROP CONSTRAINT IF EXISTS interview_job_reference_schema_version_check;
  ALTER TABLE interview_job DROP CONSTRAINT IF EXISTS interview_job_reference_schema_version_chk;
  ALTER TABLE interview_job ADD CONSTRAINT interview_job_reference_schema_version_chk
    CHECK (reference_schema_version IS NULL OR reference_schema_version IN (49, 50, 64));
`);
  await pool.query(`
  ALTER TABLE interview DROP CONSTRAINT IF EXISTS ck_interview_application_binding_complete;
  ALTER TABLE interview ADD CONSTRAINT ck_interview_application_binding_complete
    CHECK ((application_id IS NULL AND job_id IS NULL)
      OR (application_id IS NOT NULL AND job_id IS NOT NULL AND resume_id IS NOT NULL));
  CREATE OR REPLACE FUNCTION enforce_interview_application_binding_immutable()
  RETURNS trigger LANGUAGE plpgsql AS $$
  BEGIN
    IF NEW.application_id IS DISTINCT FROM OLD.application_id
       OR NEW.job_id IS DISTINCT FROM OLD.job_id
       OR NEW.application_attempt IS DISTINCT FROM OLD.application_attempt THEN
      RAISE EXCEPTION 'interview_application_binding_immutable';
    END IF;
    IF NEW.resume_id IS DISTINCT FROM OLD.resume_id THEN
      IF OLD.application_id IS NULL AND NEW.application_id IS NULL AND OLD.resume_id IS NULL
         AND NEW.resume_id IS NOT NULL AND OLD.status='created' THEN
        PERFORM 1 FROM resume r WHERE r.id=NEW.resume_id AND r.owner_user_id=NEW.owner_user_id AND r.status='ingested';
        IF NOT FOUND THEN RAISE EXCEPTION 'interview_resume_reference_requires_owned_ingested_resume'; END IF;
      ELSE
        RAISE EXCEPTION 'interview_application_binding_immutable';
      END IF;
    END IF;
    RETURN NEW;
  END; $$;
  DROP TRIGGER IF EXISTS trg_interview_application_binding_immutable ON interview;
  CREATE TRIGGER trg_interview_application_binding_immutable
  BEFORE UPDATE OF application_id,application_attempt,job_id,resume_id ON interview
  FOR EACH ROW EXECUTE FUNCTION enforce_interview_application_binding_immutable();
`);
  console.log('PIN   GAP-UC025-ADV-SCHEMA-STUB: privacy-active owner stub + interview v64 cols + 0049 allow-once bind stub (≠ 0058/0049/0064 covered)');

  // C3/C4: mirror the resume_quiz slice of 0061 so seeds face the real pin constraints
  // (owner composite FK · pair chk · UPDATE-only immutability trigger). Verbatim semantics of 0061:52-54/68-70/96-124.
  await pool.query(`
  ALTER TABLE resume_quiz DROP CONSTRAINT IF EXISTS fk_resume_quiz_resume_owner_reference;
  ALTER TABLE resume_quiz ADD CONSTRAINT fk_resume_quiz_resume_owner_reference
    FOREIGN KEY (resume_id, owner_user_id) REFERENCES resume(id, owner_user_id);
  ALTER TABLE resume_quiz DROP CONSTRAINT IF EXISTS resume_quiz_reference_pair_chk;
  ALTER TABLE resume_quiz ADD CONSTRAINT resume_quiz_reference_pair_chk
    CHECK ((resume_id IS NULL) = (privacy_epoch IS NULL));
  CREATE OR REPLACE FUNCTION enforce_resume_derivative_reference()
  RETURNS trigger LANGUAGE plpgsql AS $$
  BEGIN
    IF NEW.resume_id IS DISTINCT FROM OLD.resume_id OR NEW.privacy_epoch IS DISTINCT FROM OLD.privacy_epoch THEN
      IF OLD.resume_id IS NOT NULL OR OLD.privacy_epoch IS NOT NULL
         OR NEW.resume_id IS NULL OR NEW.privacy_epoch IS NULL OR OLD.status <> 'created' THEN
        RAISE EXCEPTION 'resume_derivative_reference_immutable' USING ERRCODE='P0001';
      END IF;
      PERFORM 1 FROM resume r WHERE r.id=NEW.resume_id AND r.owner_user_id=NEW.owner_user_id
        AND r.status='ingested' AND r.privacy_epoch=NEW.privacy_epoch;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'resume_derivative_reference_requires_active_owned_resume' USING ERRCODE='P0001';
      END IF;
    END IF;
    RETURN NEW;
  END $$;
  DROP TRIGGER IF EXISTS trg_resume_quiz_reference ON resume_quiz;
  CREATE TRIGGER trg_resume_quiz_reference BEFORE UPDATE OF resume_id, privacy_epoch ON resume_quiz
    FOR EACH ROW EXECUTE FUNCTION enforce_resume_derivative_reference();
`);
  console.log('PIN   GAP-UC025-ADV-0061-QUIZ-MIRROR: resume_quiz FK(resume_id,owner)+pair_chk+UPDATE-pin trigger (C3/C4 live · ≠ 0061 covered)');

  // GODFN-1c 逐修(预存红根因②:0142 candidate-profile route 供给面落地后,本 shell 未建对应表 → 202 目标
  // 案例(PC-A1/A3-a/A3-NULL)的 begin supplyCandidateProfileRoute 直查 500)。additive-only 同款 DDL +
  // GRANT/RLS(mirror migrations/0142),断言面零改动。
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
  console.log('PIN   GAP-UC025-ADV-0142-SUPPLY-STUB: candidate-route supply face tables (≠ 0142 RLS/trigger full covered)');

  // GODFN-1c 逐修辅面:202 目标面试(PC-A1 的 IV_A1 / A3A / A3NULL)预供给 0142 route snapshot(幂等复用
  // 路径),使 begin 推进至 bind/reserve/enqueue;拒因面(A1/A3-b/A3-c 在 supply 前抛出)不受影响。
  const preSupplyRoute = async (iv: string, owner: string, resume: string) => {
    const cli = await pool.connect();
    try {
      await cli.query('BEGIN');
      await cli.query('SET app.principal_user = ' + `'${owner}'`);
      const hex64 = 'a'.repeat(64);
      await cli.query(
        `INSERT INTO candidate_profile_route_decision(id,interview_id,owner_user_id,resume_id,resume_content_sha,input_digest,taxonomy_version,policy_version,route_outcome,attempt_outcome,leaf_track_id,allocation_bps,decision_hash)
         VALUES ($1,$2,$3,$4,$5,$5,'v1','policy-adv025-1','route_decided','rule_decided','backend',10000,$5)
         ON CONFLICT (interview_id) DO NOTHING`,
        [`cprd-${iv}`, iv, owner, resume, hex64],
      );
      await cli.query(
        `INSERT INTO candidate_profile_route_snapshot(interview_id,candidate_user_id,decision_id,resume_content_sha,input_digest,taxonomy_version,leaf_track_id,allocation_bps,status)
         VALUES ($1,$2,$3,$4,$4,'v1','backend',10000,'interview_snapshotted')
         ON CONFLICT (interview_id) DO NOTHING`,
        [iv, owner, `cprd-${iv}`, hex64],
      );
      await cli.query('COMMIT');
    } finally { cli.release(); }
  };

  // ── Static anchors @ tip (product source read-only · line numbers pinned by REQUEST) ──
  const svcPath = fileURLToPath(new URL('../src/modules/interview/interview.service.ts', import.meta.url));
  const svc = readFileSync(svcPath, 'utf8');
  const L = svc.split('\n');
  const at = (n: number) => L[n - 1] ?? '';
  // GODFN-1c 逐修(预存红根因①:行锚随 priv01-C owner 改名与 begin 三守卫合并漂移):重钉至合并后现行行号,
  // 各锚语义目标不变(owner-scoped 单查 / 404 / stale_quiz / toLowerCase / resume_version_mismatch / bind owner
  // 谓词 / reserve / enqueue)。
  A('PIN', 'anchor :196 owner-scoped merged quiz SELECT(3→1)', /SELECT q\.status, q\.expires_at,/.test(at(196)));
  A('PIN', 'anchor :206 404 not_found_or_forbidden', /not_found_or_forbidden/.test(at(206)) && /NOT_FOUND/.test(at(206)));
  A('PIN', 'anchor :212 stale_quiz', /'stale_quiz'/.test(at(212)));
  A('PIN', 'anchor :227 toLowerCase compare', /toLowerCase\(\)\s*!==\s*resumeId\.toLowerCase\(\)/.test(at(227)));
  A('PIN', 'anchor :230 409 resume_version_mismatch', /'resume_version_mismatch'/.test(at(230)) && /CONFLICT/.test(at(230)));
  A('PIN', 'anchor :264 resume owner check in bind', /r\.owner_user_id=\$2/.test(at(264)));
  A('PIN', 'anchor :304 reserveEntitlement', /reserveEntitlement\(c, owner, id, 'mock_interview', 1\.0\)/.test(at(304)));
  A('PIN', 'anchor :312 enqueueInterviewJob', /enqueueInterviewJob\(/.test(at(312)));
  // A3-b premise: no query binds the header resume-id before :266 (owner gate only at bind :288-301)
  const bStart = svc.indexOf('begin(principal');
  const boundAt = svc.indexOf("error: 'resume_version_mismatch'", bStart);
  const preBound = bStart >= 0 && boundAt > bStart ? svc.slice(bStart, boundAt) : '';
  A('PIN', 'no header resume-id SQL param (owner gate) before :266 (A3-b premise)',
    preBound.length > 0 && !/\[[^\]]*\bresumeId\b[^\]]*\]/.test(preBound));

  // ── Seeds (offline · admin pool · non-product) ──
  await pool.query(
    `INSERT INTO resume(id, owner_user_id, status, content_sha, source_kind, privacy_epoch) VALUES
       ($1::uuid, $4, 'ingested', $6, 'text', 1),
       ($2::uuid, $4, 'ingested', $7, 'text', 2),
       ($3::uuid, $5, 'ingested', $8, 'text', 1)`,
    [R_A, R_A2, R_B, A_USER, B_USER, `sha-adv025-a-${S}`, `sha-adv025-a2-${S}`, `sha-adv025-b-${S}`],
  );
  // C1 + C2: dedicated principal-A bucket · kind ∈ gift/trial/paid · units_total=3.0 for the three
  // expected 202 cases (PC-A1 / A3-a / A3-NULL) · earliest expiry → FIFO drains it first.
  const bucket = await pool.query(
    `INSERT INTO entitlement_bucket(owner_user_id, kind, units_total, expires_at)
     VALUES ($1, 'paid', 3.0, now() + interval '30 days') RETURNING id::text AS id, kind, units_total::float8 AS total`,
    [A_USER],
  );
  const BUCKET_ID = bucket.rows[0].id as string;
  A('SEED', `C1 bucket kind='${bucket.rows[0].kind}' ∈ {gift,trial,paid} (not service_type mock_interview)`,
    ['gift', 'trial', 'paid'].includes(bucket.rows[0].kind));
  A('SEED', `C2 dedicated bucket units_total=${bucket.rows[0].total} ≥ 3.0 (PC-A1+A3-a+A3-NULL each reserve 1.0)`,
    Number(bucket.rows[0].total) >= 3.0);
  const fifo = await pool.query(
    `SELECT id::text FROM entitlement_bucket WHERE owner_user_id=$1 AND expires_at>now()
       AND (units_total-units_reserved-units_consumed)>0 ORDER BY expires_at ASC, id ASC LIMIT 1`, [A_USER]);
  A('SEED', 'C2 dedicated bucket is FIFO-first for principal A', fifo.rows[0]?.id === BUCKET_ID);

  const seedInterview = async (id: string, owner = A_USER) => {
    await pool.query(`INSERT INTO interview(id, owner_user_id, status) VALUES ($1, $2, 'created')`, [id, owner]);
  };
  const seedQuiz = async (id: string, owner: string, pinResume: string | null, pinEpoch: number | null,
    expiresSql = `now() + interval '2 days'`, status = 'ready') => {
    await pool.query(
      `INSERT INTO resume_quiz(id, owner_user_id, status, resume_id, privacy_epoch, expires_at)
       VALUES ($1, $2, $3, $4::uuid, $5, ${expiresSql})`,
      [id, owner, status, pinResume, pinEpoch],
    );
    const r = (await pool.query(
      `SELECT q.owner_user_id, q.status, q.resume_id::text AS pin, q.privacy_epoch AS pin_epoch,
              r.privacy_epoch AS cur_epoch, q.expires_at > now() AS fresh
         FROM resume_quiz q LEFT JOIN resume r ON r.id=q.resume_id AND r.owner_user_id=q.owner_user_id WHERE q.id=$1`, [id])).rows[0];
    console.log(`SEED_QUIZ  id=${id} owner=${r.owner_user_id} status=${r.status} pin=${r.pin ?? 'NULL'} pin_epoch=${r.pin_epoch ?? 'NULL'} cur_epoch=${r.cur_epoch ?? 'NULL'} fresh=${r.fresh}`);
    return r;
  };

  // C3/C4 seed-integrity probes against the live mirror (expect refusals)
  {
    let pairErr = '';
    try { await pool.query(`INSERT INTO resume_quiz(id, owner_user_id, status, resume_id, privacy_epoch) VALUES ($1,$2,'ready',$3::uuid,NULL)`, [QZ('PAIRPROBE'), A_USER, R_A]); }
    catch (e: any) { pairErr = String(e?.constraint ?? e?.message ?? e); }
    A('SEED', 'C3 pair chk live: resume_id set + epoch NULL refused', /resume_quiz_reference_pair_chk/.test(pairErr), pairErr);
    let fkErr = '';
    try { await pool.query(`INSERT INTO resume_quiz(id, owner_user_id, status, resume_id, privacy_epoch) VALUES ($1,$2,'ready',$3::uuid,1)`, [QZ('FKPROBE'), A_USER, R_B]); }
    catch (e: any) { fkErr = String(e?.constraint ?? e?.message ?? e); }
    A('SEED', 'C4 owner FK live: A quiz pinned to B resume refused', /fk_resume_quiz_resume_owner_reference/.test(fkErr), fkErr);
    await seedQuiz(QZ('UPDPROBE'), A_USER, R_A, 1);
    let updErr = '';
    try { await pool.query(`UPDATE resume_quiz SET privacy_epoch=2 WHERE id=$1`, [QZ('UPDPROBE')]); }
    catch (e: any) { updErr = String(e?.message ?? e); }
    A('SEED', 'C4 0061 UPDATE-pin trigger live: pin epoch UPDATE refused (drift must be seeded via INSERT)',
      /resume_derivative_reference_immutable/.test(updErr), updErr);
  }

  const snapOf = async (interviewId: string): Promise<Snap> => {
    const q = async (sql: string, p: unknown[]) => (await pool.query(sql, p)).rows[0];
    const iv = await q('SELECT status, resume_id::text AS resume_id, resume_privacy_epoch FROM interview WHERE id=$1', [interviewId]);
    return {
      interviewStatus: iv?.status ?? null,
      resumeId: iv?.resume_id ?? null,
      resumeEpoch: iv?.resume_privacy_epoch == null ? null : Number(iv.resume_privacy_epoch),
      jobCount: Number((await q('SELECT count(*)::int n FROM interview_job WHERE interview_id=$1', [interviewId])).n),
      consumptionKey: Number((await q('SELECT count(*)::int n FROM entitlement_consumption WHERE idempotency_key=$1', [interviewId])).n),
      consumptionOwnerA: Number((await q('SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id=$1', [A_USER])).n),
      consumptionOwnerB: Number((await q('SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id=$1', [B_USER])).n),
      jobsOwnerA: Number((await q('SELECT count(*)::int n FROM interview_job WHERE owner_user_id=$1', [A_USER])).n),
      jobsOwnerB: Number((await q('SELECT count(*)::int n FROM interview_job WHERE owner_user_id=$1', [B_USER])).n),
      reservedA: Number((await q('SELECT COALESCE(SUM(units_reserved+units_consumed),0)::float8 s FROM entitlement_bucket WHERE owner_user_id=$1', [A_USER])).s),
      reservedB: Number((await q('SELECT COALESCE(SUM(units_reserved+units_consumed),0)::float8 s FROM entitlement_bucket WHERE owner_user_id=$1', [B_USER])).s),
    };
  };
  const same = (a: Snap, b: Snap) => JSON.stringify(a) === JSON.stringify(b);
  const begin = (interviewId: string, resumeId: string, quizId: string) =>
    h.post(`/interview/${interviewId}/begin`, { ...UA, 'resume-id': resumeId, 'quiz-id': quizId }, {});
  const results: Record<string, string> = {};

  // ── A1 (ADV-new) · own interview + principal B's quiz → 404 @ :214-218 · FIRST ──
  const IV_A1 = IV('A1');
  const QZ_A1_OWN = QZ('PC_A1');
  const QZ_B = QZ('B_FOREIGN');
  await seedInterview(IV_A1);
  const qb = await seedQuiz(QZ_B, B_USER, R_B, 1);       // B's quiz is itself fresh/ready/pinned → only owner differs
  await seedQuiz(QZ_A1_OWN, A_USER, R_A, 1);
  {
    const before = await snapOf(IV_A1);
    A('A1', 'baseline empty: principal A consumption=0 & jobs=0 before A1 (A1-first)', before.consumptionOwnerA === 0 && before.jobsOwnerA === 0,
      JSON.stringify(before));
    A('A1', 'fixture: foreign quiz exists, ready, fresh, owned by B (only owner differs)', qb.owner_user_id === B_USER && qb.status === 'ready' && qb.fresh === true);
    const r = await begin(IV_A1, R_A, QZ_B);
    const after = await snapOf(IV_A1);
    console.log(`A1_HTTP  status=${r.status} body=${JSON.stringify(r.body)}`);
    console.log(`A1_SNAP  before=${JSON.stringify(before)} after=${JSON.stringify(after)}`);
    A('A1', 'HTTP 404 {error:not_found_or_forbidden} (@ :214-218)', r.status === 404 && r.body?.error === 'not_found_or_forbidden');
    A('A1', 'not stale_quiz/missing_quiz_expiry/resume_version_mismatch (thrown before :222/:239/:242/:266)',
      !['stale_quiz', 'missing_quiz_expiry', 'resume_version_mismatch'].includes(r.body?.error));
    A('A1', 'distinct from :200 (own interview row visible to A · status created)', after.interviewStatus === 'created');
    A('A1', 'no reserveEntitlement :329 (consumption Δ0 · bucket reserved Δ0 · A and B)',
      after.consumptionKey === 0 && after.consumptionOwnerA === before.consumptionOwnerA && after.reservedA === before.reservedA
      && after.consumptionOwnerB === before.consumptionOwnerB && after.reservedB === before.reservedB);
    A('A1', 'no enqueueInterviewJob :337 (interview_job Δ0 · A and B)', after.jobCount === 0 && after.jobsOwnerA === before.jobsOwnerA && after.jobsOwnerB === before.jobsOwnerB);
    A('A1', 'interview unbound (resume_id NULL) · full snapshot unchanged', after.resumeId === null && same(before, after));
    results.A1 = `${r.status} ${JSON.stringify(r.body)}`;
  }

  // ── PC-A1 (ADV-new positive control) · same interview + own fresh pinned quiz → 202 ──
  {
    await preSupplyRoute(IV_A1, A_USER, R_A);   // GODFN-1c 逐修:0142 供给面预置(幂等复用)
    const before = await snapOf(IV_A1);
    const r = await begin(IV_A1, R_A, QZ_A1_OWN);
    const after = await snapOf(IV_A1);
    const b = (await pool.query('SELECT units_reserved::float8 r FROM entitlement_bucket WHERE id=$1::uuid', [BUCKET_ID])).rows[0];
    console.log(`PC-A1_HTTP  status=${r.status} body=${JSON.stringify(r.body)}`);
    console.log(`PC-A1_SNAP  before=${JSON.stringify(before)} after=${JSON.stringify(after)} dedicatedBucketReserved=${b?.r}`);
    A('PC-A1', 'HTTP 202 {accepted:true, jobId} fresh begin (not alreadyBegun)',
      r.status === 202 && r.body?.accepted === true && typeof r.body?.jobId === 'string' && r.body?.alreadyBegun !== true);
    A('PC-A1', 'interview bound to own R_A @ current epoch 1', after.resumeId === R_A && after.resumeEpoch === 1);
    A('PC-A1', 'reserve 1.0 happened (consumption +1 for this interview · dedicated bucket reserved=1.0)',
      after.consumptionKey === 1 && b?.r === 1);
    A('PC-A1', 'start job enqueued (+1 job for this interview)', after.jobCount === 1);
    results['PC-A1'] = `${r.status} ${JSON.stringify(r.body)}`;
  }

  // ── A3-b (ADV-new) · cross-principal resume-id → 409 resume_version_mismatch @ :266 ──
  {
    const iv = IV('A3B');
    const qz = QZ('A3B');
    await seedInterview(iv);
    const q = await seedQuiz(qz, A_USER, R_A, 1);
    A('A3-b', 'fixture: A quiz pinned to A resume R_A (fresh/ready) · header = B resume R_B (valid UUID, owner B)',
      q.pin === R_A && q.fresh === true && q.status === 'ready');
    const before = await snapOf(iv);
    const r = await begin(iv, R_B, qz);
    const after = await snapOf(iv);
    console.log(`A3-b_HTTP  status=${r.status} body=${JSON.stringify(r.body)}`);
    console.log(`A3-b_SNAP  before=${JSON.stringify(before)} after=${JSON.stringify(after)}`);
    A('A3-b', 'exactly HTTP 409 {error:resume_version_mismatch} (@ :266)',
      r.status === 409 && r.body?.error === 'resume_version_mismatch' && Object.keys(r.body ?? {}).length === 1);
    A('A3-b', 'not 404/400 (no resume owner gate before :266; owner check only at bind :300)',
      r.status !== 404 && r.status !== 400 && !['not_found_or_forbidden', 'invalid_resume_id', 'interview_resume_binding_unavailable'].includes(r.body?.error));
    A('A3-b', 'no reserveEntitlement :329 (consumption Δ0 · reserved Δ0 · A and B)',
      after.consumptionKey === 0 && after.consumptionOwnerA === before.consumptionOwnerA && after.reservedA === before.reservedA
      && after.consumptionOwnerB === before.consumptionOwnerB && after.reservedB === before.reservedB);
    A('A3-b', 'no enqueueInterviewJob :337 (jobs Δ0 · A and B)', after.jobCount === 0 && after.jobsOwnerA === before.jobsOwnerA && after.jobsOwnerB === before.jobsOwnerB);
    A('A3-b', 'interview not bound (resume_id NULL · status created) · snapshot unchanged',
      after.resumeId === null && after.interviewStatus === 'created' && same(before, after));
    results['A3-b'] = `${r.status} ${JSON.stringify(r.body)}`;
  }

  // ── Complementary (W R4/R2/R5 on real PG+HTTP) · recorded · NEVER ADV-new ──
  {
    const iv = IV('A3A');
    const qz = QZ('A3A');
    await seedInterview(iv);
    await seedQuiz(qz, A_USER, R_A, 1);
    await preSupplyRoute(iv, A_USER, R_A);   // GODFN-1c 逐修:0142 供给面预置(幂等复用)
    const r = await begin(iv, R_A.toUpperCase(), qz);
    const after = await snapOf(iv);
    console.log(`A3-a_HTTP  status=${r.status} body=${JSON.stringify(r.body)} header=${R_A.toUpperCase()} [complementary · W R4]`);
    A('A3-a', 'uppercase pin-matching resume-id passes version guard (not 409 resume_version_mismatch)', r.body?.error !== 'resume_version_mismatch');
    A('A3-a', 'downstream recorded: seeds complete → 202 accepted + bound R_A', r.status === 202 && r.body?.accepted === true && after.resumeId === R_A);
    results['A3-a'] = `${r.status} ${JSON.stringify(r.body)}`;
  }
  {
    const iv = IV('A3C');
    const qz = QZ('A3C');
    await seedInterview(iv);
    const q = await seedQuiz(qz, A_USER, R_A2, 1);   // C4: INSERT with foreign (stale) epoch 1 vs current 2 · FK ok
    A('A3-c', 'fixture: pin epoch 1 ≠ current resume.privacy_epoch 2 (INSERT, FK satisfied)', Number(q.pin_epoch) === 1 && Number(q.cur_epoch) === 2);
    const before = await snapOf(iv);
    const r = await begin(iv, R_A2, qz);
    const after = await snapOf(iv);
    console.log(`A3-c_HTTP  status=${r.status} body=${JSON.stringify(r.body)} [complementary · W R2]`);
    A('A3-c', 'HTTP 409 resume_version_mismatch (@ :266)', r.status === 409 && r.body?.error === 'resume_version_mismatch');
    A('A3-c', 'no reserve/enqueue/bind (snapshot unchanged)', same(before, after) && after.jobCount === 0 && after.consumptionKey === 0);
    results['A3-c'] = `${r.status} ${JSON.stringify(r.body)}`;
  }
  {
    const iv = IV('A3NULL');
    const qz = QZ('A3NULL');
    await seedInterview(iv);
    const q = await seedQuiz(qz, A_USER, null, null);   // C3: resume_id AND privacy_epoch both NULL (legacy admin-INSERT shape)
    A('A3-NULL', 'fixture: pin resume_id NULL AND privacy_epoch NULL (pair chk satisfied · legacy admin INSERT shape)', q.pin == null && q.pin_epoch == null);
    await preSupplyRoute(iv, A_USER, R_A);   // GODFN-1c 逐修:0142 供给面预置(幂等复用)
    const r = await begin(iv, R_A, qz);
    const after = await snapOf(iv);
    console.log(`A3-NULL_HTTP  status=${r.status} body=${JSON.stringify(r.body)} [complementary · W R5 · :260 intended pass ≠ red ≠ bypass]`);
    A('A3-NULL', 'NULL pin not rejected by :266 (not 409 resume_version_mismatch)', r.body?.error !== 'resume_version_mismatch');
    A('A3-NULL', 'downstream recorded: 202 accepted + bound R_A', r.status === 202 && r.body?.accepted === true && after.resumeId === R_A);
    results['A3-NULL'] = `${r.status} ${JSON.stringify(r.body)}`;
  }
  {
    const b = (await pool.query('SELECT units_total::float8 t, units_reserved::float8 r, units_consumed::float8 c FROM entitlement_bucket WHERE id=$1::uuid', [BUCKET_ID])).rows[0];
    console.log(`C2_BUCKET  dedicated id=${BUCKET_ID} total=${b.t} reserved=${b.r} consumed=${b.c} (expected 3 reserves: PC-A1 + A3-a + A3-NULL)`);
    A('SEED', 'C2 capacity sufficient: no 402 insufficient_entitlement in any case',
      !Object.values(results).some((s) => /insufficient_entitlement/.test(s)));
  }

  // ── Summary ──
  const attemptEndedAt = new Date().toISOString();
  const sumOf = (cs: Cls[]) => cs.reduce((acc, c) => ({ total: acc.total + (tally[c]?.total ?? 0), fail: acc.fail + (tally[c]?.fail ?? 0) }), { total: 0, fail: 0 });
  const adv = sumOf(ADV_NEW);
  const comp = sumOf(COMPLEMENTARY);
  const infra = sumOf(['ISO', 'PIN', 'SEED']);
  const exit = failures.length === 0 ? 0 : 1;
  console.log('');
  for (const [k, v] of Object.entries(results)) {
    const tag = ADV_NEW.includes(k as Cls) ? 'ADV-new' : 'complementary(≠ADV-new · W BOUND re-check)';
    console.log(`RESULT  ${k.padEnd(8)} ${tag.padEnd(44)} ${v}`);
  }
  console.log(`ADV_NEW_SUMMARY        A1+PC-A1+A3-b asserts=${adv.total} failed=${adv.fail}`);
  console.log(`COMPLEMENTARY_SUMMARY  A3-a+A3-c+A3-NULL asserts=${comp.total} failed=${comp.fail} (recorded · never counted as ADV-new)`);
  console.log(`INFRA_SUMMARY          ISO+PIN+SEED asserts=${infra.total} failed=${infra.fail}`);
  console.log(`ATTEMPT_END  iso=${attemptEndedAt} EXIT=${exit} total=${adv.total + comp.total + infra.total} fail=${failures.length}`);
  if (failures.length) {
    console.log(`GAP  ${GAP_ID}  ${failures.length} assertion(s) failed:`);
    for (const f of failures) console.log(`GAP_DETAIL  [${f.cls}] ${f.name}`);
  } else {
    console.log(`PASS  ${CASE_ID}  ADV-new A1 404 not_found_or_forbidden · PC-A1 202 · A3-b 409 resume_version_mismatch (isolated PG + HTTP + FORCE RLS)`);
  }
  console.log('ROW_STILL_GAP  UC-E2E-025 row stays gap · ADV column stays blind (case evidence only) · canHonestlyFlip=false · coveredCount=8');
  console.log('NOTE  EXIT0≠covered≠nail≠HA · complementary≠ADV-new · Ban wash W BOUND · Ban self-nail · POST dual required');
  console.log(`\nCMD=${CMD} EXIT=${exit}`);
  process.exit(exit);
})().catch((e) => {
  console.error(e);
  console.log(`\nGAP  ${GAP_ID}  harness/runtime failure: ${e?.message ?? e}`);
  console.log(`ATTEMPT_END  iso=${new Date().toISOString()} EXIT=1 (crash)`);
  console.log(`\nCMD=${CMD} EXIT=1`);
  process.exit(1);
});

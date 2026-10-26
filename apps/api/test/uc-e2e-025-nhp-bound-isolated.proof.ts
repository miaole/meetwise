/**
 * UC-E2E-025 · BOUND isolated PG/HTTP evidence · NHP-025-BOUND-01 criteria
 * GAP-UC025-BOUND-ISOLATED-01 (evidence-layer upgrade · uc025-e2e-REQUEST.md 件①)
 *
 * Same case NHP-025-BOUND-01 · NOT a rename of GAP-UC025-BOUND-01 (W in-process nail:
 * code 6853e17 · prove tip e8fa74c · post dual 9aad765/c048533). Mirrors the
 * fault-isolated family shape (964b6b0b · GAP-UC025-FAULT-ISOLATED-01):
 *   W in-process = InterviewService.begin + recording fake DB (no PG · no network · no real HTTP)
 *   THIS         = isolated three-layer shell + real Nest HTTP + real PostgreSQL pin columns
 * Complementary ≠ substitute · Ban wash W in-process as sufficient · Ban narrate EXIT0 as covered.
 *
 * Criteria pins (frozen, unchanged from W):
 *   HTTP 409 · { error: 'resume_version_mismatch' }
 *   order NEG(stale_quiz)→FAULT(missing_quiz_expiry)→BOUND(resume_version_mismatch)
 *   pin NULL (0061-前 legacy artifact) NOT false-rejected
 *   no quiz-id → whole guard block skipped
 *   throw strictly before resume bind / entitlement reserve / queue enqueue
 *
 * B1–B5 injection table (uc025-e2e-REQUEST.md §1-修法 件①):
 *   B1 resume mismatch (pin.resume_id ≠ begin resume-id) → 409 resume_version_mismatch
 *      + zero-side-effect snapshot (interview unbound · jobs 0 · consumption 0 · bucket unchanged)
 *   B2 epoch drift (pin.privacy_epoch ≠ resume current epoch · resume_id equal) → same 409
 *      (B2b sub-probe: pinned resume gone → current epoch NULL ≠ pin → same 409 · W R3 frozen)
 *   B3 pin NULL legacy artifact positive control → past BOUND (bind/reserve/enqueue 202 path,
 *      no false reject)
 *   B4 past-freshness order control → NEG stale_quiz precedes BOUND (NEG frozen order ·
 *      stale_quiz observed only, NOT this knife's assertion object)
 *   B5 no quiz-id → BOUND block skipped · behaviour unchanged (202 baseline path)
 *
 * Live-key isolation (REQUEST §1.3(b) 否决二 · §9-rev R6):
 *   scripts/run-e2e-isolated.mjs credential strip list does NOT include MODEL_API_KEY
 *   (live full-chain E2E explicitly keeps it) → THIS proof deletes MODEL_API_KEY and
 *   MODEL_BASE_URL in-process FIRST, then asserts unset before and after boot
 *   (UC-016 envModelApiKeyUnset fail-closed form, uc-e2e-016-nhp-fault.proof.ts:147).
 *   Zero provider egress · est live=0.
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false
 * gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false
 * PG-retained · row/BOUND stay gap · canHonestlyFlip=false · Ban self-nail
 *
 *   pnpm uc025:nhp-bound-isolated:prove
 *   pnpm -C apps/api prove:uc025-nhp-bound-isolated   (raw; needs isolated DATABASE_URL)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { boot } from './_neg-harness';

const CMD = 'pnpm uc025:nhp-bound-isolated:prove';
const GAP_ID = 'GAP-UC025-BOUND-ISOLATED-01';
const ATTEMPT_STARTED_AT = new Date().toISOString();

type Cls = 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'ISO' | 'PIN';
let total = 0;
const failures: { cls: Cls; name: string }[] = [];
const A = (cls: Cls, name: string, cond: boolean) => {
  total++;
  if (!cond) {
    failures.push({ cls, name });
    console.log(`FAIL  [${cls}] ${name}`);
  } else {
    console.log(`PASS  [${cls}] ${name}`);
  }
};

const OWNER = 'userA';
const RID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee0251';
const RID_OTHER = 'bbbbbbbb-cccc-4ddd-8eee-eeeeeeee0252';
const RID_EPOCH2 = 'cccccccc-dddd-4eee-8fff-eeeeeeee0253';
const S = Date.now().toString(36).toUpperCase();
const IV = (k: string) => `IV_B025_${k}_${S}`;
const QZ = (k: string) => `QZ_B025_${k}_${S}`;

type Snap = {
  interviewStatus: string | null;
  resumeId: string | null;
  jobCount: number;
  consumptionCount: number;
  bucketSum: number;
};

(async () => {
  console.log('UC-E2E-025 NHP-025-BOUND-01 isolated PG/HTTP evidence (GAP-UC025-BOUND-ISOLATED-01 · 件①)');
  console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained');
  console.log('Complementary to W in-process bound nail (6853e17/e8fa74c) · Ban wash W · Ban replace W · EXIT0≠covered≠nail');
  console.log('Not NEG (frozen) · Not FAULT wash · Not ADV · row/BOUND stay gap · canHonestlyFlip=false · Ban self-nail');
  console.log(`ATTEMPT_START  iso=${ATTEMPT_STARTED_AT} · Ban retry-to-green · Ban fake-green\n`);

  // §9-rev R6: shell strip list does NOT include MODEL_API_KEY → in-process self-delete, then
  // assert unset (UC-016 fail-closed form). Must run BEFORE boot() imports api modules.
  delete process.env.MODEL_API_KEY;
  delete process.env.MODEL_BASE_URL;
  A('ISO', 'model-key-unset-in-process(self-deleted pre-boot · shell strip list lacks MODEL_API_KEY)',
    process.env.MODEL_API_KEY === undefined && process.env.MODEL_BASE_URL === undefined);

  const h = await boot();
  const pool = h.pool;
  const U = h.U(OWNER);

  // Re-print after boot() mutates env (boot sets AUTH_DEV_HEADER='1'); keys must stay unset.
  A('ISO', 'model-key-still-unset-after-boot(no re-import regression)',
    process.env.MODEL_API_KEY === undefined && process.env.MODEL_BASE_URL === undefined);
  console.log(`PRIVACY_NOTE_AFTER_BOOT  AUTH_DEV_HEADER=${JSON.stringify(process.env.AUTH_DEV_HEADER ?? '<unset>')} NODE_ENV=${JSON.stringify(process.env.NODE_ENV ?? '<unset>')} (dual-gate: AUTH_DEV_HEADER==='1' && NODE_ENV!=='production')`);

  // Isolation attestation + dynamic port evidence (three-layer shell outer layers are run-e2e-isolated)
  const dbUrl = String(process.env.DATABASE_URL ?? process.env.PGHOST ?? '');
  const pgPort = String(process.env.PGPORT ?? '');
  console.log(`ISO_SHELL  PGPORT=${pgPort || '<unset>'} DATABASE_URL_host_port_redacted=${dbUrl.replace(/:[^:@/]+@/, ':***@').replace(/\/\/[^@]+@/, '//***@') || '<unset>'}`);
  A('ISO', 'dynamic-PG-port-present(or DATABASE_URL)', pgPort.length > 0 || /:\d+/.test(dbUrl));

  // Minimal privacy-active stubs (0058 not in _neg-harness). Owner match only; ≠ full fence covered.
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
  console.log('PIN   GAP-UC025-BOUND-ISO-PRIVACY-STUB: minimal privacy-active stub (≠ 0058 fence covered)');

  // begin() SELECT needs resume_privacy_epoch (0064); sql/22 adds resume_id/application_id only.
  await pool.query(`
  ALTER TABLE interview
    ADD COLUMN IF NOT EXISTS resume_id uuid,
    ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint,
    ADD COLUMN IF NOT EXISTS application_id text,
    ADD COLUMN IF NOT EXISTS application_attempt int,
    ADD COLUMN IF NOT EXISTS job_id text
`);

  // interview_job v64 surface (0064 deltas) — sql/05 still pins CHECK=50; enqueue uses version 64.
  // Stub columns/constraint only (≠ full 0064 trigger covered). Required so B3/B5 can reach 202.
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
  console.log('PIN   GAP-UC025-BOUND-ISO-JOB-SCHEMA-STUB: interview_job resume_privacy_epoch + v64 check (≠ 0064 triggers covered)');

  // sql/22 CHECK+immutable trigger block C-side NULL→resume bind; production 0049 supersedes.
  // Apply 0049-compatible CHECK + allow-once bind trigger (≠ full 0049/0064 covered).
  await pool.query(`
  ALTER TABLE interview DROP CONSTRAINT IF EXISTS ck_interview_application_binding_complete;
  ALTER TABLE interview ADD CONSTRAINT ck_interview_application_binding_complete
    CHECK (
      (application_id IS NULL AND job_id IS NULL)
      OR (application_id IS NOT NULL AND job_id IS NOT NULL AND resume_id IS NOT NULL)
    );
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
  console.log('PIN   GAP-UC025-BOUND-ISO-0049-BIND-STUB: C-side allow-once resume bind (≠ full 0049 covered)');

  // GODFN-1c 逐修(同 fault-isolated 形):0142 candidate-profile route 供给面表,additive-only DDL + GRANT/RLS。
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
  console.log('PIN   GAP-UC025-BOUND-ISO-0142-SUPPLY-STUB: candidate-route supply face tables (≠ 0142 RLS/trigger full covered)');

  // C-side: live pin-column evidence from isolated schema (0061 typed reference + sql/20 mirror)
  const pinCols = await pool.query(`
    SELECT column_name, data_type
      FROM information_schema.columns
     WHERE table_schema='public' AND table_name='resume_quiz'
       AND column_name IN ('resume_id', 'privacy_epoch', 'expires_at')
  `);
  const pinColNames = new Set(pinCols.rows.map((r) => String(r.column_name)));
  const resumeIdType = String(pinCols.rows.find((r) => r.column_name === 'resume_id')?.data_type ?? 'missing');
  const epochType = String(pinCols.rows.find((r) => r.column_name === 'privacy_epoch')?.data_type ?? 'missing');
  console.log(`PIN_COLS  resume_quiz resume_id=${resumeIdType} privacy_epoch=${epochType} expires_at_present=${pinColNames.has('expires_at')} (0061 typed reference + sql/20 mirror)`);
  A('ISO', 'pin-columns-resume_id-uuid+privacy_epoch-bigint-on-real-PG', resumeIdType === 'uuid' && epochType === 'bigint');
  const col = await pool.query(`
    SELECT column_name, data_type, udt_name
      FROM information_schema.columns
     WHERE table_schema='public' AND table_name='resume_quiz' AND column_name='expires_at'
  `);
  // information_schema snake_case columns read via Record (dot-access on index signature → no
  // naming-convention member declaration, keeps this file at zero lint warnings against the 1423 cap)
  const colRow = (col.rows ?? [])[0] as Record<string, string> | undefined;
  console.log(`ANCHOR_COL  resume_quiz.expires_at present=${!!colRow} data_type=${colRow?.data_type ?? 'missing'} udt=${colRow?.udt_name ?? 'missing'} (sql/20 mirror · 0135 ADD IF NOT EXISTS)`);
  A('ISO', 'anchor-column-expires_at-timestamptz', !!colRow && (colRow.data_type === 'timestamp with time zone' || colRow.udt_name === 'timestamptz'));

  // Static orthogonality pin (product code unchanged this turn — inventory only · 判据=W 钉死口径冻结)
  const svc = readFileSync(fileURLToPath(new URL('../src/modules/interview/interview.service.ts', import.meta.url)), 'utf8');
  // B271 片2 后 begin 事务体=beginInterviewCore 模块体(REG-FIX 组4d 区域锚随演):核心函数起·InterviewService 类止。
  const bStart = svc.indexOf('export async function beginInterviewCore(');
  const bEnd = svc.indexOf('export class InterviewService', bStart);
  const region = bStart >= 0 && bEnd > bStart ? svc.slice(bStart, bEnd) : '';
  const faultAt = region.search(/error:\s*'missing_quiz_expiry'/);
  const staleAt = region.search(/error:\s*'stale_quiz'/);
  const boundAt = region.search(/error:\s*'resume_version_mismatch'/);
  A('PIN', 'order-NEG-before-FAULT-before-BOUND(static)', staleAt >= 0 && faultAt > staleAt && boundAt > faultAt);
  A('PIN', 'bound-throw-409-resume_version_mismatch(static)',
    /HttpException\s*\(\s*\{\s*error:\s*'resume_version_mismatch'\s*\}\s*,\s*HttpStatus\.CONFLICT\s*\)/.test(region));
  const pinReadAt = region.search(/q\.resume_id[\s\S]{0,120}q\.privacy_epoch[\s\S]{0,200}FROM\s+resume_quiz\s+q/);
  A('PIN', 'reads-quiz-pin-before-throw(resume_id+privacy_epoch·single merged query)', pinReadAt >= 0 && (!Number.isNaN(boundAt) ? pinReadAt < boundAt : pinReadAt >= 0));

  // Shared resume seeds (ingested): RID/RID_OTHER epoch 1 · RID_EPOCH2 epoch 2 (B2 drift source)
  await pool.query(
    `INSERT INTO resume(id, owner_user_id, status, content_sha, source_kind, privacy_epoch)
     VALUES ($1::uuid, $2, 'ingested', $3, 'text', 1),
            ($4::uuid, $2, 'ingested', $5, 'text', 1),
            ($6::uuid, $2, 'ingested', $7, 'text', 2)
     ON CONFLICT (id) DO NOTHING`,
    [RID, OWNER, `sha-b025-a-${S}`, RID_OTHER, `sha-b025-b-${S}`, RID_EPOCH2, `sha-b025-c-${S}`],
  );

  const snapOf = async (interviewId: string): Promise<Snap> => {
    const iv = await pool.query(
      'SELECT status, resume_id::text AS resume_id FROM interview WHERE id=$1',
      [interviewId],
    );
    const jobs = await pool.query(
      'SELECT count(*)::int n FROM interview_job WHERE interview_id=$1',
      [interviewId],
    );
    const cons = await pool.query(
      'SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2',
      [OWNER, interviewId],
    );
    const bucket = await pool.query(
      'SELECT COALESCE(SUM(units_total),0)::float8 s FROM entitlement_bucket WHERE owner_user_id=$1',
      [OWNER],
    );
    return {
      interviewStatus: (iv.rows[0]?.status as string | undefined) ?? null,
      resumeId: (iv.rows[0]?.resume_id as string | undefined) ?? null,
      jobCount: Number(jobs.rows[0]?.n ?? 0),
      consumptionCount: Number(cons.rows[0]?.n ?? 0),
      bucketSum: Number(bucket.rows[0]?.s ?? 0),
    };
  };
  const sameSnap = (a: Snap, b: Snap) =>
    a.interviewStatus === b.interviewStatus
    && a.resumeId === b.resumeId
    && a.jobCount === b.jobCount
    && a.consumptionCount === b.consumptionCount
    && a.bucketSum === b.bucketSum;

  const begin = async (interviewId: string, resumeId: string, quizId?: string) => {
    const headers: Record<string, string> = { ...U };
    headers['resume-id'] = resumeId;   // bracket write on index signature (mirror fault-isolated begin 形)
    if (quizId !== undefined) headers['quiz-id'] = quizId;
    return h.post(`/interview/${interviewId}/begin`, headers, {});
  };

  const seedInterview = async (id: string) => {
    await pool.query(
      `INSERT INTO interview(id, owner_user_id, status) VALUES ($1, $2, 'created')
       ON CONFLICT (id) DO NOTHING`,
      [id, OWNER],
    );
  };

  const seedQuiz = async (
    id: string,
    opts: { status?: string; expiresSql: string; resumeId?: string | null; privacyEpoch?: number | null },
  ) => {
    const status = opts.status ?? 'ready';
    const resumeId = opts.resumeId === undefined ? null : opts.resumeId;
    const epoch = opts.privacyEpoch === undefined ? null : opts.privacyEpoch;
    // expiresSql is a SQL expression fragment for expires_at (trusted local literals only)
    await pool.query(
      `INSERT INTO resume_quiz(id, owner_user_id, status, resume_id, privacy_epoch, expires_at)
       VALUES ($1, $2, $3, $4::uuid, $5, ${opts.expiresSql})`,
      [id, OWNER, status, resumeId, epoch],
    );
    const row = await pool.query(
      'SELECT id, status, resume_id::text AS pinned_resume_id, privacy_epoch AS pinned_epoch, expires_at FROM resume_quiz WHERE id=$1',
      [id],
    );
    const r = row.rows[0];
    console.log(
      `SEED_QUIZ  id=${id} status=${r?.status} pinned_resume_id=${r?.pinned_resume_id ?? 'NULL'} pinned_epoch=${r?.pinned_epoch ?? 'NULL'} expires_at=${r?.expires_at === null ? 'NULL' : JSON.stringify(r?.expires_at)}`,
    );
    return r;
  };

  // 0142 route pre-supply (idempotent reuse path) so B3/B5 begin advances to bind/reserve/enqueue;
  // refusal arms (B1/B2/B4) throw before supply and are unaffected.
  const supplyRoute = async (interviewId: string, resumeId: string) => {
    const cli = await pool.connect();
    try {
      await cli.query('BEGIN');
      await cli.query("SET app.principal_user='userfault'");
      const HEX64 = 'f'.repeat(64);
      await cli.query(
        `INSERT INTO candidate_profile_route_decision(id,interview_id,owner_user_id,resume_id,resume_content_sha,input_digest,taxonomy_version,policy_version,route_outcome,attempt_outcome,leaf_track_id,allocation_bps,decision_hash)
         VALUES ($1,$2,$3,$4,$5,$5,'v1','policy-b025-1','route_decided','rule_decided','backend',10000,$5)
         ON CONFLICT (interview_id) DO NOTHING`,
        [`cprd-b025-${interviewId}`, interviewId, OWNER, resumeId, HEX64],
      );
      await cli.query(
        `INSERT INTO candidate_profile_route_snapshot(interview_id,candidate_user_id,decision_id,resume_content_sha,input_digest,taxonomy_version,leaf_track_id,allocation_bps,status)
         VALUES ($1,$2,$3,$4,$4,'v1','backend',10000,'interview_snapshotted')
         ON CONFLICT (interview_id) DO NOTHING`,
        [interviewId, OWNER, `cprd-b025-${interviewId}`, HEX64],
      );
      await cli.query('COMMIT');
    } finally { cli.release(); }
  };

  // ── B1: resume mismatch — pin.resume_id(RID_OTHER) ≠ begin resume-id(RID) ──
  {
    const iv = IV('B1');
    const qz = QZ('B1');
    await seedInterview(iv);
    await seedQuiz(qz, { expiresSql: `now() + interval '2 days'`, resumeId: RID_OTHER, privacyEpoch: 1 });
    const before = await snapOf(iv);
    const r = await begin(iv, RID, qz);
    const after = await snapOf(iv);
    console.log(`B1_HTTP  status=${r.status} body=${JSON.stringify(r.body)}`);
    A('B1', 'ready-fresh-seed-not-stale_quiz/not-missing_quiz_expiry(anti-fake-green)',
      r.body?.error !== 'stale_quiz' && r.body?.error !== 'missing_quiz_expiry');
    A('B1', 'HTTP-409-resume_version_mismatch(pin.resume_id≠begin resume-id)',
      r.status === 409 && r.body?.error === 'resume_version_mismatch');
    A('B1', 'zero-side-effect-snapshot(interview/jobs/consumption/bucket)', sameSnap(before, after));
    A('B1', 'interview-stays-created-unbound(throw before bind)',
      after.interviewStatus === 'created' && after.resumeId == null && after.jobCount === 0);
  }

  // ── B2: epoch drift — pin.privacy_epoch(1) ≠ resume current epoch(2) · resume_id equal ──
  {
    const iv = IV('B2');
    const qz = QZ('B2');
    await seedInterview(iv);
    await seedQuiz(qz, { expiresSql: `now() + interval '2 days'`, resumeId: RID_EPOCH2, privacyEpoch: 1 });
    const before = await snapOf(iv);
    const r = await begin(iv, RID_EPOCH2, qz);
    const after = await snapOf(iv);
    console.log(`B2_HTTP  status=${r.status} body=${JSON.stringify(r.body)} (pin epoch=1 · resume current epoch=2)`);
    A('B2', 'HTTP-409-resume_version_mismatch(pin epoch≠current epoch·resume_id equal)',
      r.status === 409 && r.body?.error === 'resume_version_mismatch');
    A('B2', 'zero-side-effect-snapshot', sameSnap(before, after));

    // B2b sub-probe (W R3 frozen): pinned resume gone → current epoch NULL ≠ pin → same 409
    const qzGone = QZ('B2GONE');
    await seedQuiz(qzGone, {
      expiresSql: `now() + interval '2 days'`,
      resumeId: 'dddddddd-eeee-4fff-8aaa-eeeeeeee0254', // no resume row → LEFT JOIN current_epoch NULL
      privacyEpoch: 1,
    });
    const beforeGone = await snapOf(iv);
    const rGone = await begin(iv, RID, qzGone);
    const afterGone = await snapOf(iv);
    console.log(`B2B_HTTP  status=${rGone.status} body=${JSON.stringify(rGone.body)} (pinned resume gone · current epoch NULL)`);
    A('B2', 'pinned-resume-gone(current NULL) → 409 resume_version_mismatch(W R3 frozen)',
      rGone.status === 409 && rGone.body?.error === 'resume_version_mismatch');
    A('B2', 'pinned-resume-gone zero-side-effect-snapshot', sameSnap(beforeGone, afterGone));
  }

  // ── B3: pin NULL legacy artifact positive control → past BOUND, no false reject ──
  {
    const iv = IV('B3');
    const qz = QZ('B3');
    await seedInterview(iv);
    await seedQuiz(qz, { expiresSql: `now() + interval '2 days'`, resumeId: null, privacyEpoch: null });
    await supplyRoute(iv, RID);
    const before = await snapOf(iv);
    const r = await begin(iv, RID, qz);
    const after = await snapOf(iv);
    console.log(`B3_HTTP  status=${r.status} body=${JSON.stringify(r.body)} (pin NULL · begin resume-id=${RID})`);
    A('B3', 'pin-NULL-not-false-rejected(not resume_version_mismatch·0061-前 legacy artifact)',
      r.body?.error !== 'resume_version_mismatch');
    A('B3', 'past-BOUND-to-bind/reserve/enqueue(202 accepted baseline path)',
      r.status === 202 && (r.body?.accepted === true || r.body?.alreadyBegun === true));
    A('B3', 'side-effects-observed(bind+job)', after.resumeId === RID && after.jobCount >= 1);
    A('B3', 'snapshot-changed-vs-refusal-paths(B1/B2 contrast)', !sameSnap(before, after));
  }

  // ── B4: past-freshness order control → NEG precedes BOUND (stale_quiz observed, not asserted) ──
  {
    const iv = IV('B4');
    const qz = QZ('B4');
    await seedInterview(iv);
    // pin matches begin resume-id (RID epoch 1 = pin epoch 1) so the ONLY failing guard is NEG.
    await seedQuiz(qz, { expiresSql: `now() - interval '2 days'`, resumeId: RID, privacyEpoch: 1 });
    const before = await snapOf(iv);
    const r = await begin(iv, RID, qz);
    const after = await snapOf(iv);
    console.log(`B4_HTTP  status=${r.status} body=${JSON.stringify(r.body)} (past expiry · pin matches · OBSERVE-only per REQUEST B4)`);
    A('B4', 'NEG-precedes-BOUND(not resume_version_mismatch·frozen order)',
      r.status === 409 && r.body?.error !== 'resume_version_mismatch');
    A('B4', 'not-missing_quiz_expiry(orthogonal)', r.body?.error !== 'missing_quiz_expiry');
    A('B4', 'zero-side-effect-snapshot', sameSnap(before, after));
  }

  // ── B5: no quiz-id → BOUND block skipped; behaviour unchanged (202 baseline path) ──
  {
    const iv = IV('B5');
    await seedInterview(iv);
    await supplyRoute(iv, RID);
    const before = await snapOf(iv);
    const r = await begin(iv, RID); // no quiz-id header
    const after = await snapOf(iv);
    console.log(`B5_HTTP  status=${r.status} body=${JSON.stringify(r.body)}`);
    console.log(`B5_SNAP  before=${JSON.stringify(before)} after=${JSON.stringify(after)}`);
    A('B5', 'no-quiz-id-not-resume_version_mismatch(BOUND block skipped)',
      r.body?.error !== 'resume_version_mismatch');
    A('B5', 'no-quiz-id-begin-202-accepted(baseline-path)',
      r.status === 202 && (r.body?.accepted === true || r.body?.alreadyBegun === true));
    A('B5', 'no-quiz-id-side-effects-observed(bind+job)', after.resumeId === RID && after.jobCount >= 1);
    A('B5', 'snapshot-changed-vs-refusal-paths(B1/B2 contrast)', !sameSnap(before, after));
  }

  const attemptEndedAt = new Date().toISOString();
  const exit = failures.length === 0 ? 0 : 1;
  console.log('');
  console.log(`ATTEMPT_END  iso=${attemptEndedAt} EXIT=${exit} total=${total} fail=${failures.length}`);
  if (failures.length) {
    console.log(`GAP  ${GAP_ID}  ${failures.length} assertion(s) failed:`);
    for (const f of failures) console.log(`GAP_DETAIL  [${f.cls}] ${f.name}`);
  } else {
    console.log('PASS  GAP-UC025-BOUND-ISOLATED-01  isolated PG+HTTP BOUND evidence for 409 resume_version_mismatch (B1–B5)');
    console.log('HTTP_ERROR_PIN  status=409 CONFLICT · error=resume_version_mismatch');
    console.log('EVIDENCE_SHAPE  isolated three-layer shell + real HTTP + real PG pin columns (0061 resume_id/privacy_epoch) · complementary to W in-process · ≠ W wash');
  }
  console.log('ROW_STILL_GAP  UC-E2E-025 BOUND column not flipped. NEG frozen · FAULT gap · ADV blind. coveredCount=8.');
  console.log('NOTE  EXIT0≠covered≠nail≠HA · Ban self-nail · post dual e2e+privacy still required');
  console.log(`\nCMD=${CMD} EXIT=${exit}`);
  process.exit(exit);
})().catch((e) => {
  console.error(e);
  console.log(`\nGAP  ${GAP_ID}  harness/runtime failure: ${e?.message ?? e}`);
  console.log(`ATTEMPT_END  iso=${new Date().toISOString()} EXIT=1 (crash)`);
  console.log(`\nCMD=${CMD} EXIT=1`);
  process.exit(1);
});

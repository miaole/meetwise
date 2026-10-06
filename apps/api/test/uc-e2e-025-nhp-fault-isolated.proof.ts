/**
 * UC-E2E-025 · FAULT isolated PG/HTTP evidence · NHP-025-FAULT-01 criteria
 * GAP-UC025-FAULT-ISOLATED-01 (Line W)
 *
 * Complementary to AA in-process nail 15eedd6 (code a8b98fc · prove tip 3a6ec52):
 *   AA = InterviewService.begin + recording fake DB (no PG · no network · no real HTTP)
 *   THIS = isolated three-layer shell + real Nest HTTP + real PostgreSQL timestamptz column
 * Ban wash AA as sufficient · Ban claim this knife replaces AA · Ban narrate EXIT0 as covered
 *
 * Criteria pins (unchanged from AA):
 *   HTTP 409 · { error: 'missing_quiz_expiry' }
 *   NULL/NaN fail-closed · order NEG→FAULT→BOUND · no quiz-id skip
 *   C-1 supersede (NULL≠stale_quiz; missing anchor→409)
 *
 * F1–F5 injection table (harness gap-uc025-fault-isolated.md):
 *   F1 NULL expires_at → 409 missing_quiz_expiry + zero side-effect snapshot
 *   F2 NaN-reachable timestamptz (probe) → same 409 · honest EXIT1 if unreachable on real PG
 *   F3 fresh valid expiry positive control → past FAULT (sentinel ≠ missing_quiz_expiry/stale_quiz)
 *   F4 past expiry → 409 stale_quiz (NEG order control · Ban wash NEG)
 *   F5 no quiz-id → FAULT block skipped · concrete before/after path
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false
 * gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false
 * PG-retained · public DELETE stays 503 · row/FAULT stay gap · Ban self-nail
 *
 *   pnpm uc025:nhp-fault-isolated:prove
 *   pnpm -C apps/api prove:uc025-nhp-fault-isolated   (raw; needs isolated DATABASE_URL)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { boot } from './_neg-harness';

const CMD = 'pnpm uc025:nhp-fault-isolated:prove';
const GAP_ID = 'GAP-UC025-FAULT-ISOLATED-01';
const ATTEMPT_STARTED_AT = new Date().toISOString();

type Cls = 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'ISO' | 'PIN';
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
const S = Date.now().toString(36).toUpperCase();
const IV = (k: string) => `IV_F025_${k}_${S}`;
const QZ = (k: string) => `QZ_F025_${k}_${S}`;

type Snap = {
  interviewStatus: string | null;
  resumeId: string | null;
  jobCount: number;
  consumptionCount: number;
  bucketSum: number;
};

(async () => {
  console.log('UC-E2E-025 NHP-025-FAULT-01 isolated PG/HTTP evidence (GAP-UC025-FAULT-ISOLATED-01 · Line W)');
  console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained · DELETE=503');
  console.log('Complementary to AA in-process (a8b98fc/3a6ec52) · Ban wash AA · Ban replace AA · EXIT0≠covered≠nail');
  console.log('Not NEG (frozen) · Not BOUND wash · Not ADV · row/FAULT stay gap · Ban self-nail');
  console.log(`ATTEMPT_START  iso=${ATTEMPT_STARTED_AT} · Ban retry-to-green · Ban fake-green\n`);

  // Privacy note (non-blocking): dual-gate surface for x-user-id
  console.log(`PRIVACY_NOTE  _neg-harness AUTH_DEV_HEADER=${JSON.stringify(process.env.AUTH_DEV_HEADER ?? '<unset>')} NODE_ENV=${JSON.stringify(process.env.NODE_ENV ?? '<unset>')} (dual-gate: AUTH_DEV_HEADER==='1' && NODE_ENV!=='production')`);

  const h = await boot();
  const pool = h.pool;
  const U = h.U(OWNER);

  // Re-print after boot() mutates env (boot sets AUTH_DEV_HEADER='1')
  console.log(`PRIVACY_NOTE_AFTER_BOOT  AUTH_DEV_HEADER=${JSON.stringify(process.env.AUTH_DEV_HEADER ?? '<unset>')} NODE_ENV=${JSON.stringify(process.env.NODE_ENV ?? '<unset>')}`);

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
  console.log('PIN   GAP-UC025-FAULT-ISO-PRIVACY-STUB: minimal privacy-active stub (≠ 0058 fence covered)');

  // begin() SELECT needs resume_privacy_epoch (0064); sql/22 adds resume_id/application_id only.
  await pool.query(`
  ALTER TABLE interview
    ADD COLUMN IF NOT EXISTS resume_id uuid,
    ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint,
    ADD COLUMN IF NOT EXISTS application_id text,
    ADD COLUMN IF NOT EXISTS application_attempt int,
    ADD COLUMN IF NOT EXISTS job_id text
`);

  // C-3: print live anchor column evidence from isolated schema (sql/20 mirror carries expires_at)
  const col = await pool.query(`
    SELECT column_name, data_type, udt_name
      FROM information_schema.columns
     WHERE table_schema='public' AND table_name='resume_quiz' AND column_name='expires_at'
  `);
  const colRow = col.rows[0] as { column_name: string; data_type: string; udt_name: string } | undefined;
  console.log(`ANCHOR_COL  resume_quiz.expires_at present=${!!colRow} data_type=${colRow?.data_type ?? 'missing'} udt=${colRow?.udt_name ?? 'missing'} (sql/20 mirror · 0135 ADD IF NOT EXISTS)`);
  A('ISO', 'anchor-column-expires_at-timestamptz', !!colRow && (colRow.data_type === 'timestamp with time zone' || colRow.udt_name === 'timestamptz'));

  // Static orthogonality pin (product code unchanged this turn — inventory only)
  const svc = readFileSync(fileURLToPath(new URL('../src/modules/interview/interview.service.ts', import.meta.url)), 'utf8');
  const bStart = svc.indexOf('begin(principal');
  const bEnd = svc.indexOf('turn(principal', bStart);
  const region = bStart >= 0 && bEnd > bStart ? svc.slice(bStart, bEnd) : '';
  const faultAt = region.search(/error:\s*'missing_quiz_expiry'/);
  const staleAt = region.search(/error:\s*'stale_quiz'/);
  const boundAt = region.search(/error:\s*'resume_version_mismatch'/);
  A('PIN', 'order-NEG-before-FAULT-before-BOUND(static)', staleAt >= 0 && faultAt > staleAt && boundAt > faultAt);
  A('PIN', 'fault-throw-409-missing_quiz_expiry(static)', /HttpException\s*\(\s*\{\s*error:\s*'missing_quiz_expiry'\s*\}\s*,\s*HttpStatus\.CONFLICT\s*\)/.test(region));

  // Shared resume seeds (ingested) for begin binding / BOUND pin
  await pool.query(
    `INSERT INTO resume(id, owner_user_id, status, content_sha, source_kind, privacy_epoch)
     VALUES ($1::uuid, $2, 'ingested', $3, 'text', 1),
            ($4::uuid, $2, 'ingested', $5, 'text', 1)
     ON CONFLICT (id) DO NOTHING`,
    [RID, OWNER, `sha-f025-a-${S}`, RID_OTHER, `sha-f025-b-${S}`],
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
      'SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id=$1 AND interview_id=$2',
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

  const begin = async (interviewId: string, quizId?: string) => {
    const headers: Record<string, string> = { ...U, 'resume-id': RID };
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
      'SELECT id, status, expires_at, pg_typeof(expires_at)::text AS expires_typeof FROM resume_quiz WHERE id=$1',
      [id],
    );
    const r = row.rows[0];
    console.log(
      `SEED_QUIZ  id=${id} status=${r?.status} expires_at=${r?.expires_at === null ? 'NULL' : JSON.stringify(r?.expires_at)} typeof=${r?.expires_typeof} jsType=${r?.expires_at == null ? 'null' : typeof r.expires_at}`,
    );
    return r;
  };

  // ── F1: NULL expires_at (primary) ─────────────────────────────────────
  {
    const iv = IV('F1');
    const qz = QZ('F1');
    await seedInterview(iv);
    await seedQuiz(qz, { expiresSql: 'NULL', resumeId: null, privacyEpoch: null });
    const before = await snapOf(iv);
    const r = await begin(iv, qz);
    const after = await snapOf(iv);
    console.log(`F1_HTTP  status=${r.status} body=${JSON.stringify(r.body)}`);
    A('F1', 'ready-seed-not-stale_quiz(anti-fake-green)', r.body?.error !== 'stale_quiz');
    A('F1', 'HTTP-409-missing_quiz_expiry', r.status === 409 && r.body?.error === 'missing_quiz_expiry');
    A('F1', 'zero-side-effect-snapshot(interview/jobs/consumption/bucket)', sameSnap(before, after));
    A('F1', 'interview-stays-created-unbound', after.interviewStatus === 'created' && after.resumeId == null && after.jobCount === 0);
  }

  // ── F2: NaN-reachable value on real timestamptz (C-2 honest probe) ────
  {
    const iv = IV('F2');
    const qz = QZ('F2');
    await seedInterview(iv);

    // Probe candidates that PG can store; measure Date(...).getTime() NaN after driver round-trip.
    const candidates: { label: string; sql: string }[] = [
      { label: 'infinity', sql: `'infinity'::timestamptz` },
      { label: '-infinity', sql: `'-infinity'::timestamptz` },
    ];
    let chosen: { label: string; sql: string; raw: unknown; expiryMs: number } | null = null;
    for (const c of candidates) {
      const probeId = `${qz}_probe_${c.label.replace(/[^a-z]/gi, '')}`;
      try {
        await pool.query(
          `INSERT INTO resume_quiz(id, owner_user_id, status, expires_at)
           VALUES ($1, $2, 'ready', ${c.sql})`,
          [probeId, OWNER],
        );
        const got = await pool.query('SELECT expires_at FROM resume_quiz WHERE id=$1', [probeId]);
        const raw = got.rows[0]?.expires_at;
        const expiryMs = new Date(raw as string | Date).getTime();
        console.log(
          `F2_PROBE  label=${c.label} stored_ok=true raw=${JSON.stringify(raw)} jsType=${raw == null ? 'null' : typeof raw} ` +
          `dateGetTime=${expiryMs} isNaN=${Number.isNaN(expiryMs)}`,
        );
        if (Number.isNaN(expiryMs) && chosen == null) {
          chosen = { label: c.label, sql: c.sql, raw, expiryMs };
        }
      } catch (e: any) {
        console.log(`F2_PROBE  label=${c.label} stored_ok=false err=${e?.message ?? e}`);
      }
    }

    if (!chosen) {
      console.log(`GAP  ${GAP_ID}  F2 NaN unreachable on real timestamptz via driver round-trip (C-2 honest retain)`);
      A('F2', 'NaN-reachable-on-real-PG-timestamptz', false);
    } else {
      await seedQuiz(qz, { expiresSql: chosen.sql, resumeId: null, privacyEpoch: null });
      console.log(`F2_CHOSEN  label=${chosen.label} expiryMs=${chosen.expiryMs}`);
      const before = await snapOf(iv);
      const r = await begin(iv, qz);
      const after = await snapOf(iv);
      console.log(`F2_HTTP  status=${r.status} body=${JSON.stringify(r.body)}`);
      A('F2', 'ready-seed-not-stale_quiz(anti-fake-green)', r.body?.error !== 'stale_quiz');
      A('F2', 'HTTP-409-missing_quiz_expiry(NaN-fold)', r.status === 409 && r.body?.error === 'missing_quiz_expiry');
      A('F2', 'zero-side-effect-snapshot', sameSnap(before, after));
    }
  }

  // ── F3: positive control — fresh valid expiry past FAULT (BOUND sentinel) ─
  {
    const iv = IV('F3');
    const qz = QZ('F3');
    await seedInterview(iv);
    // Future expiry + pin mismatch → must pass FAULT and hit BOUND resume_version_mismatch
    await seedQuiz(qz, {
      expiresSql: `now() + interval '2 days'`,
      resumeId: RID_OTHER,
      privacyEpoch: 1,
    });
    const r = await begin(iv, qz);
    console.log(`F3_HTTP  status=${r.status} body=${JSON.stringify(r.body)} sentinel=resume_version_mismatch`);
    A('F3', 'not-missing_quiz_expiry(anti-overwide)', r.body?.error !== 'missing_quiz_expiry');
    A('F3', 'not-stale_quiz(anti-fake-green)', r.body?.error !== 'stale_quiz');
    A('F3', 'BOUND-sentinel-409-resume_version_mismatch', r.status === 409 && r.body?.error === 'resume_version_mismatch');
  }

  // ── F4: past expiry → stale_quiz (NEG order control) ──────────────────
  {
    const iv = IV('F4');
    const qz = QZ('F4');
    await seedInterview(iv);
    await seedQuiz(qz, {
      expiresSql: `now() - interval '2 days'`,
      resumeId: null,
      privacyEpoch: null,
    });
    const r = await begin(iv, qz);
    console.log(`F4_HTTP  status=${r.status} body=${JSON.stringify(r.body)}`);
    A('F4', 'HTTP-409-stale_quiz(NEG-order-control)', r.status === 409 && r.body?.error === 'stale_quiz');
    A('F4', 'not-missing_quiz_expiry(orthogonal)', r.body?.error !== 'missing_quiz_expiry');
  }

  // ── F5: no quiz-id → FAULT skipped; concrete path + snapshot ───────────
  {
    const iv = IV('F5');
    await seedInterview(iv);
    const before = await snapOf(iv);
    const r = await begin(iv); // no quiz-id header
    const after = await snapOf(iv);
    console.log(`F5_HTTP  status=${r.status} body=${JSON.stringify(r.body)}`);
    console.log(`F5_SNAP  before=${JSON.stringify(before)} after=${JSON.stringify(after)}`);
    A('F5', 'no-quiz-id-not-missing_quiz_expiry', r.body?.error !== 'missing_quiz_expiry');
    A('F5', 'no-quiz-id-not-stale_quiz', r.body?.error !== 'stale_quiz');
    // Concrete behaviour-unchanged path: begin accepts and enqueues start (202) with resume bound
    A('F5', 'no-quiz-id-begin-202-accepted(baseline-path)', r.status === 202 && (r.body?.accepted === true || r.body?.alreadyBegun === true));
    A('F5', 'no-quiz-id-side-effects-observed(bind+job)', after.resumeId === RID && after.jobCount >= 1);
    A('F5', 'snapshot-changed-vs-refusal-paths(F1-contrast)', !sameSnap(before, after));
  }

  const attemptEndedAt = new Date().toISOString();
  const exit = failures.length === 0 ? 0 : 1;
  console.log('');
  console.log(`ATTEMPT_END  iso=${attemptEndedAt} EXIT=${exit} total=${total} fail=${failures.length}`);
  if (failures.length) {
    console.log(`GAP  ${GAP_ID}  ${failures.length} assertion(s) failed:`);
    for (const f of failures) console.log(`GAP_DETAIL  [${f.cls}] ${f.name}`);
  } else {
    console.log('PASS  GAP-UC025-FAULT-ISOLATED-01  isolated PG+HTTP FAULT evidence for 409 missing_quiz_expiry (F1–F5)');
    console.log('HTTP_ERROR_PIN  status=409 CONFLICT · error=missing_quiz_expiry');
    console.log('EVIDENCE_SHAPE  isolated three-layer shell + real HTTP + real PG timestamptz · complementary to AA in-process · ≠ AA wash');
  }
  console.log('ROW_STILL_GAP  UC-E2E-025 FAULT column not flipped. NEG frozen · BOUND gap · ADV blind. coveredCount=8.');
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

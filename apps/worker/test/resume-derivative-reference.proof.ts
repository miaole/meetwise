/**
 * Isolated PostgreSQL proof for typed quiz/diagnosis resume references.
 * It proves only the reference and legacy-terminalization gate; it does not
 * claim a completed resume-erasure workflow or external provider deletion.
 */
import { fileURLToPath } from 'node:url';
import {
  asPrincipal, assertIsolatedTestTarget, availableUnits, claimNextDiagnosisJob,
  claimNextQuizJob, createPool, createResumeWithBlob, enqueueDiagnosisJob,
  enqueueQuizJob, loadMigrations, provisionRuntimeLogin, reserveEntitlement,
  runMigrations, transitionResume, completeIngestion,
} from '@meetwise/db';
import { ingestResume } from '@meetwise/domain';
import type { ModelClient } from '@meetwise/ai-runtime';
import { drainDiagnosisJobOnce } from '../src/diagnosis-consumer.ts';
import { drainQuizJobOnce } from '../src/quiz-consumer.ts';

const admin = createPool();
const runtimeRole = `resume_derivative_ref_${process.pid}`;
const runtimePassword = 'resume-derivative-reference-proof-password-2026';
let failures = 0;
let phase = 'PRES007';
const A = (id: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };

async function seedIngestedResume(runtime: ReturnType<typeof createPool>, owner: string) {
  return asPrincipal(runtime, owner, async (c) => {
    const created = await createResumeWithBlob(c, owner, `resume-derivative-fixture-${process.pid}`);
    await transitionResume(c, owner, created.resumeId, 'uploaded', 'ingesting');
    const complete = await completeIngestion(c, owner, created.resumeId, ingestResume('经历：Redis 限流'));
    if (!complete) throw new Error('resume_ingest_seed_failed');
    return created.resumeId;
  });
}

async function main() {
  await assertIsolatedTestTarget(admin);
  await runMigrations(admin, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));
  await provisionRuntimeLogin(admin, { roleName: runtimeRole, password: runtimePassword });
  const runtime = createPool({ user: runtimeRole, password: runtimePassword, max: 12 });
  const owner = `resume-derivative-owner-${process.pid}`;
  const marker = `resume-derivative-legacy-marker-${process.pid}`;
  let modelCalls = 0;
  const noCallModel = {
    complete: async () => { modelCalls++; throw new Error('model_must_not_run_for_legacy_reference'); },
  } as unknown as ModelClient;
  try {
    const resumeId = await seedIngestedResume(runtime, owner);
    const epoch = 1;
    const typedQuiz = `typed-quiz-${process.pid}`;
    const typedDiagnosis = `typed-diagnosis-${process.pid}`;
    await asPrincipal(runtime, owner, async (c) => {
      await c.query("INSERT INTO resume_quiz(id,owner_user_id,status) VALUES ($1,$2,'created')", [typedQuiz, owner]);
      await c.query("INSERT INTO resume_diagnosis(id,owner_user_id,status,target_role) VALUES ($1,$2,'created','backend')", [typedDiagnosis, owner]);
      await c.query('UPDATE resume_quiz SET resume_id=$3,privacy_epoch=$4 WHERE id=$1 AND owner_user_id=$2', [typedQuiz, owner, resumeId, epoch]);
      await c.query('UPDATE resume_diagnosis SET resume_id=$3,privacy_epoch=$4 WHERE id=$1 AND owner_user_id=$2', [typedDiagnosis, owner, resumeId, epoch]);
      await enqueueQuizJob(c, owner, typedQuiz, resumeId, epoch);
      await enqueueDiagnosisJob(c, owner, typedDiagnosis, resumeId, epoch);
    });
    const typedQuizClaim = await asPrincipal(runtime, owner, (c) => claimNextQuizJob(c, owner, 'typed-quiz-worker'));
    const typedDiagnosisClaim = await asPrincipal(runtime, owner, (c) => claimNextDiagnosisJob(c, owner, 'typed-diagnosis-worker'));
    A('PRES004', typedQuizClaim?.resumeId === resumeId && typedQuizClaim.privacyEpoch === epoch
      && typedQuizClaim.referenceSchemaVersion === 61 && !Object.hasOwn(typedQuizClaim ?? {}, 'payload')
      && typedDiagnosisClaim?.resumeId === resumeId && typedDiagnosisClaim.privacyEpoch === epoch
      && typedDiagnosisClaim.referenceSchemaVersion === 61 && !Object.hasOwn(typedDiagnosisClaim ?? {}, 'payload'));

    const rawInsertBlocked = await asPrincipal(runtime, owner, async (c) => {
      const legacy = rejects(() => c.query(
        "INSERT INTO quiz_job(owner_user_id,quiz_id,payload,reference_schema_version) VALUES ($1,$2,'{}'::jsonb,NULL)",
        [owner, `forged-legacy-quiz-${process.pid}`],
      ));
      const missingReference = rejects(() => c.query(
        "INSERT INTO diagnosis_job(owner_user_id,diagnosis_id,payload,reference_schema_version) VALUES ($1,$2,'{}'::jsonb,61)",
        [owner, `forged-missing-diagnosis-${process.pid}`],
      ));
      const parentMismatch = rejects(() => c.query(
        `INSERT INTO quiz_job(owner_user_id,quiz_id,resume_id,privacy_epoch,reference_schema_version,payload)
         VALUES ($1,$2,$3,$4,61,'{}'::jsonb)`,
        [owner, typedQuiz, resumeId, epoch + 1],
      ));
      return (await Promise.all([legacy, missingReference, parentMismatch])).every(Boolean);
    });
    A('PRES005', rawInsertBlocked);

    phase = 'PRES007';
    const legacyQuiz = `legacy-quiz-${process.pid}`;
    const legacyDiagnosis = `legacy-diagnosis-${process.pid}`;
    await asPrincipal(runtime, owner, async (c) => {
      await c.query("INSERT INTO resume_quiz(id,owner_user_id,status) VALUES ($1,$2,'created')", [legacyQuiz, owner]);
      await c.query("INSERT INTO resume_diagnosis(id,owner_user_id,status) VALUES ($1,$2,'created')", [legacyDiagnosis, owner]);
      await c.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',2,now()+interval '1 day')", [owner]);
      await reserveEntitlement(c, owner, legacyQuiz, 'resume_quiz', 1);
      await reserveEntitlement(c, owner, legacyDiagnosis, 'resume_diagnosis', 1);
    });
    // This is the only privileged fixture mutation.  It creates a historical
    // row as it existed before 0061; the runtime role cannot create one.
    phase = 'PRES008';
    await admin.query('ALTER TABLE quiz_job DISABLE TRIGGER trg_quiz_job_reference');
    await admin.query('ALTER TABLE diagnosis_job DISABLE TRIGGER trg_diagnosis_job_reference');
    try {
      phase = 'PRES009';
      await admin.query(
        "INSERT INTO quiz_job(owner_user_id,quiz_id,payload,status) VALUES ($1,$2,jsonb_build_object('resumeRaw',$3::text),'queued')",
        [owner, legacyQuiz, marker],
      );
      await admin.query(
        "INSERT INTO diagnosis_job(owner_user_id,diagnosis_id,payload,status) VALUES ($1,$2,jsonb_build_object('resumeRaw',$3::text),'queued')",
        [owner, legacyDiagnosis, marker],
      );
    } finally {
      await admin.query('ALTER TABLE quiz_job ENABLE TRIGGER trg_quiz_job_reference');
      await admin.query('ALTER TABLE diagnosis_job ENABLE TRIGGER trg_diagnosis_job_reference');
    }
    phase = 'PRES010';
    const beforeRelease = await asPrincipal(runtime, owner, (c) => availableUnits(c, owner));
    phase = 'PRES011';
    const quizLegacyResult = await drainQuizJobOnce({ pool: runtime, model: noCallModel, leaseOwner: 'legacy-quiz-worker' }, owner);
    phase = 'PRES012';
    const diagnosisLegacyResult = await drainDiagnosisJobOnce({ pool: runtime, model: noCallModel, leaseOwner: 'legacy-diagnosis-worker' }, owner);
    phase = 'PRES013';
    const after = await admin.query<{ job_rows: number; raw_rows: number; failed_entities: number; terminal_events: number }>(`
      SELECT
        (SELECT count(*)::int FROM quiz_job WHERE quiz_id=$1 AND status='failed')
          + (SELECT count(*)::int FROM diagnosis_job WHERE diagnosis_id=$2 AND status='failed') AS job_rows,
        (SELECT count(*)::int FROM quiz_job WHERE quiz_id=$1 AND payload::text LIKE '%' || $3 || '%')
          + (SELECT count(*)::int FROM diagnosis_job WHERE diagnosis_id=$2 AND payload::text LIKE '%' || $3 || '%') AS raw_rows,
        (SELECT count(*)::int FROM resume_quiz WHERE id=$1 AND status='failed')
          + (SELECT count(*)::int FROM resume_diagnosis WHERE id=$2 AND status='failed') AS failed_entities,
        (SELECT count(*)::int FROM interview_event WHERE stream_key IN ($1,$2) AND kind IN ('quiz_unavailable','diagnosis_unavailable')) AS terminal_events
    `, [legacyQuiz, legacyDiagnosis, marker]);
    const afterRelease = await asPrincipal(runtime, owner, (c) => availableUnits(c, owner));
    A('PRES006', quizLegacyResult === 'failed' && diagnosisLegacyResult === 'failed'
      && modelCalls === 0 && Number(after.rows[0]?.job_rows) === 2
      && Number(after.rows[0]?.raw_rows) === 0 && Number(after.rows[0]?.failed_entities) === 2
      && Number(after.rows[0]?.terminal_events) === 2 && afterRelease === beforeRelease + 2);
  } finally {
    await runtime.end();
    await admin.query(`DROP ROLE IF EXISTS ${runtimeRole}`);
    await admin.end();
  }
  console.log(failures === 0 ? '\n✓ resume derivative typed-reference proof passed' : `\n✗ ${failures} resume derivative checks failed`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error: any) => {
  // A database/Node error code is a closed, non-content diagnostic.  Never
  // print the message: it could include a future raw queue payload.
  const code = String(error?.code ?? 'UNKNOWN').toUpperCase();
  const suffix = /^[A-Z0-9_]{1,64}$/.test(code) ? `_${code}` : '_UNKNOWN';
  console.log(`FAIL  ${phase}${suffix}`);
  await admin.end().catch(() => undefined);
  process.exit(1);
});

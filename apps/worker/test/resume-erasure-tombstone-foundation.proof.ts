/**
 * Isolated PostgreSQL proof for the *non-exposed* resume-erasure foundation.
 * It contains no user fixture text in output and deliberately does not call a
 * resume delete API: that API must stay fail-closed until every reference and
 * sink has a receipt-backed executor.
 */
import { fileURLToPath } from 'node:url';
import {
  asPrincipal, assertIsolatedTestTarget, createPool, createResumeWithBlob, decryptResumeBlob,
  loadMigrations, provisionRuntimeLogin, runMigrations,
} from '@meetwise/db';

const admin = createPool();
const runtimeRole = `resume_tombstone_api_${process.pid}`;
const runtimePassword = 'resume-tombstone-api-proof-password-2026';
let failures = 0;
const A = (id: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };

async function main() {
  await assertIsolatedTestTarget(admin);
  await runMigrations(admin, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));
  await provisionRuntimeLogin(admin, { roleName: runtimeRole, password: runtimePassword });
  const runtime = createPool({ user: runtimeRole, password: runtimePassword, max: 4 });
  const owner = `resume-tombstone-owner-${process.pid}`;
  try {
    const first = await asPrincipal(runtime, owner, (c) => createResumeWithBlob(c, owner, 'foundation dedup payload'));
    const dedup = await asPrincipal(runtime, owner, (c) => createResumeWithBlob(c, owner, 'foundation dedup payload'));
    A('PRES001', first.dedup === false && dedup.dedup === true && first.resumeId === dedup.resumeId);

    const directDeleteBlocked = await asPrincipal(runtime, owner, async (c) =>
      (await Promise.all([
        rejects(() => c.query('DELETE FROM resume WHERE id=$1', [first.resumeId])),
        rejects(() => c.query('DELETE FROM resume_blob WHERE resume_id=$1', [first.resumeId])),
        rejects(() => c.query('DELETE FROM resume_profile WHERE resume_id=$1', [first.resumeId])),
      ])).every(Boolean));
    const directLifecycleBlocked = await asPrincipal(runtime, owner, async (c) =>
      (await Promise.all([
        rejects(() => c.query("UPDATE resume SET status='erasure_fenced' WHERE id=$1", [first.resumeId])),
        rejects(() => c.query('UPDATE resume SET privacy_epoch=privacy_epoch+1 WHERE id=$1', [first.resumeId])),
        rejects(() => c.query('UPDATE resume SET content_sha=NULL WHERE id=$1', [first.resumeId])),
        rejects(() => c.query("INSERT INTO resume(owner_user_id,status,content_sha,source_kind) VALUES ($1,'erased',NULL,'text')", [owner])),
      ])).every(Boolean));
    const directRows = await admin.query<{ resume_rows: number; blob_rows: number; request_rows: number }>(`
      SELECT
        (SELECT count(*)::int FROM resume WHERE id=$1) AS resume_rows,
        (SELECT count(*)::int FROM resume_blob WHERE resume_id=$1) AS blob_rows,
        (SELECT count(*)::int FROM privacy_erasure_request WHERE owner_user_id=$2 AND scope='resume_data') AS request_rows
    `, [first.resumeId, owner]);
    A('PRES002', directDeleteBlocked && directLifecycleBlocked
      && Number(directRows.rows[0]?.resume_rows) === 1 && Number(directRows.rows[0]?.blob_rows) === 1
      && Number(directRows.rows[0]?.request_rows) === 0);

    // Simulate only a pre-existing, privileged final tombstone.  The trigger
    // is disabled in this disposable test database solely to prove the new
    // partial unique index: runtime code itself cannot create this state yet.
    await admin.query('ALTER TABLE resume DISABLE TRIGGER resume_tombstone_foundation_write_guard');
    try {
      await admin.query(
        "UPDATE resume SET status='erased',content_sha=NULL,privacy_epoch=2 WHERE id=$1 AND owner_user_id=$2",
        [first.resumeId, owner],
      );
    } finally {
      await admin.query('ALTER TABLE resume ENABLE TRIGGER resume_tombstone_foundation_write_guard');
    }
    // A tombstone must be unreadable even before the future physical erasure
    // worker exists.  This is a database guard, not a controller convention:
    // raw SQL and the legacy decrypt helper both see no owner-visible blob.
    const fencedRead = await asPrincipal(runtime, owner, async (c) => {
      const [blob, profile] = await Promise.all([
        c.query('SELECT count(*)::int AS n FROM resume_blob WHERE resume_id=$1', [first.resumeId]),
        c.query('SELECT count(*)::int AS n FROM resume_profile WHERE resume_id=$1', [first.resumeId]),
      ]);
      return {
        blobRows: Number(blob.rows[0]?.n ?? -1),
        profileRows: Number(profile.rows[0]?.n ?? -1),
        decryptRejected: await rejects(() => decryptResumeBlob(c, owner, first.resumeId)),
      };
    });
    A('PRES003', fencedRead.blobRows === 0 && fencedRead.profileRows === 0 && fencedRead.decryptRejected);

    const reupload = await asPrincipal(runtime, owner, (c) => createResumeWithBlob(c, owner, 'foundation dedup payload'));
    const tombstone = await admin.query<{ status: string; content_sha: string | null; privacy_epoch: number }>(
      'SELECT status,content_sha,privacy_epoch FROM resume WHERE id=$1', [first.resumeId]);
    A('PRES004', reupload.dedup === false && reupload.resumeId !== first.resumeId
      && tombstone.rows[0]?.status === 'erased' && tombstone.rows[0]?.content_sha === null
      && Number(tombstone.rows[0]?.privacy_epoch) === 2);
  } finally {
    await runtime.end();
    await admin.query(`DROP ROLE IF EXISTS ${runtimeRole}`);
    await admin.end();
  }
  console.log(failures === 0 ? '\n✓ resume tombstone foundation proof passed' : `\n✗ ${failures} resume tombstone foundation checks failed`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => { console.error(error); await admin.end().catch(() => undefined); process.exit(1); });

/**
 * Test-first prefix-upgrade contract for the generic RAG control plane.
 *
 * The fixture starts at the vulnerable 0032 prefix, inserts legacy global
 * corpus data through the historical system-GUC path, then applies all
 * available forward migrations.  It must stay red until 0073 quarantines the
 * old control plane and creates the new provenance boundary.
 */
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  assertIsolatedTestTarget, asPrincipal, createPool, loadMigrations, runMigrations,
} from '../src/index.ts';

const pool = createPool();
const SYSTEM = '__system_rag__';
const expectedMigration = '0073_rag_control_plane_identity_isolation';
let failures = 0;
const check = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};
const hash = (value: string) => createHash('sha256').update(value).digest('hex');

async function main(): Promise<void> {
  await assertIsolatedTestTarget(pool);
  const migrations = loadMigrations(fileURLToPath(new URL('../migrations', import.meta.url)));
  const prefix = migrations.filter((migration) => migration.version <= '0032_rag_corpus_version_control');
  check('test fixture has the vulnerable 0032 prefix and the reviewed forward identity-isolation migration',
    prefix.at(-1)?.version === '0032_rag_corpus_version_control'
    && migrations.some((migration) => migration.version === expectedMigration));
  await runMigrations(pool, prefix);

  const documentId = 'ragdoc-legacy-global';
  const chunkId = 'rchunk-legacy-global-v1';
  // This deliberately uses the vulnerable prefix functions directly.  The
  // forward upgrade must be able to quarantine data that already entered via
  // the old, forgeable system-GUC boundary.
  await asPrincipal(pool, SYSTEM, async (client) => {
    await client.query('SELECT public.rag_register_document($1,$2,$3)', [documentId, 'knowledge', 'global']);
    await client.query(
      'SELECT public.rag_publish_document_version($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb)',
      [documentId, hash('legacy-global-content'), hash('legacy-parser'), hash('legacy-cleaning'), hash('legacy-chunker'),
        JSON.stringify({ legacy: true }), JSON.stringify([{
          id: chunkId, ordinal: 0, content: '0032 legacy global corpus data must never survive as trusted.',
          content_hash: hash('legacy-global-chunk'), locator: { legacy: true },
        }])],
    );
  });
  // 0032 generated physical vector relations in `public` and granted app_role
  // direct SELECT.  This orphaned legacy-shaped table simulates an already
  // retired generation whose metadata no longer gives a safe serving path;
  // the forward upgrade must still discover and quarantine the data plane.
  const legacyVectorTable = 'rag_vector_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  await pool.query(`CREATE TABLE public.${legacyVectorTable} (chunk_id text PRIMARY KEY, embedding public.vector(3) NOT NULL)`);
  await pool.query(`INSERT INTO public.${legacyVectorTable}(chunk_id,embedding) VALUES ('legacy-vector-row','[1,0,0]'::public.vector)`);
  await pool.query(`CREATE POLICY p_legacy_vector_read ON public.${legacyVectorTable} FOR SELECT TO app_role USING (true)`);
  await pool.query(`GRANT SELECT ON public.${legacyVectorTable} TO app_role`);
  // The migration runner validates the applied ledger against the complete
  // ordered manifest.  Replaying that full manifest applies only the suffix
  // after the 0032 fixture; passing only the suffix would itself be rejected
  // before this test can exercise the upgrade contract.
  await runMigrations(pool, migrations);

  const provenance = await pool.query<{ trust_state: string }>(
    `SELECT trust_state
       FROM rag_global_document_provenance
      WHERE document_id=$1 AND content_version=1`,
    [documentId],
  ).catch(() => ({ rows: [] as { trust_state: string }[] }));
  const active = await pool.query<{ generation_id: string | null }>(
    'SELECT generation_id FROM rag_active_generation WHERE singleton',
  );
  const legacyFunctionExecute = await pool.query<{ allowed: boolean }>(
    "SELECT has_function_privilege('app_role', 'public.rag_register_document(text,text,text)', 'EXECUTE') AS allowed",
  );
  const legacyVectorControlPlane = await pool.query<{ public_exists: boolean; quarantined_exists: boolean; app_select: boolean }>(
    `SELECT to_regclass($1) IS NOT NULL AS public_exists,
            to_regclass($2) IS NOT NULL AS quarantined_exists,
            has_table_privilege('app_role', $2, 'SELECT') AS app_select`,
    [`public.${legacyVectorTable}`, `rag_control.${legacyVectorTable}`],
  );
  const legacyVectorRuntimeDenied = await asPrincipal(pool, 'legacy-runtime', (client) =>
    client.query(`SELECT * FROM rag_control.${legacyVectorTable}`),
  ).then(() => false, (error) => (error as { code?: string }).code === '42501');
  check('0032 legacy global data receives immutable legacy_untrusted provenance after the forward upgrade',
    provenance.rows[0]?.trust_state === 'legacy_untrusted');
  check('forward upgrade clears any legacy active pointer and disables the old GUC-authorized global entrypoint',
    active.rows[0]?.generation_id === null && legacyFunctionExecute.rows[0]?.allowed === false);
  check('forward upgrade discovers every 0032-shaped physical vector table, moves it out of public, and denies runtime direct reads',
    legacyVectorControlPlane.rows[0]?.public_exists === false
      && legacyVectorControlPlane.rows[0]?.quarantined_exists === true
      && legacyVectorControlPlane.rows[0]?.app_select === false
      && legacyVectorRuntimeDenied);

  console.log(failures === 0
    ? '\n✓ generic RAG control prefix-upgrade contract passed (local isolated evidence only)'
    : `\n✗ ${failures} generic RAG control prefix-upgrade contract assertions failed`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => {
  console.error(error);
  await pool.end().catch(() => undefined);
  process.exit(1);
});

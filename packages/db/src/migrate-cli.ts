/** Dedicated production migration entrypoint. It is intentionally separate from API/worker startup. */
import { fileURLToPath } from 'node:url';
import { assertDistinctProvisionedLoginNames, assertQbankControlDefinerOwnership, assertQbankControlExecutorIdentity, assertRagControlDefinerOwnership, assertRagControlExecutorIdentity, createPool, loadMigrations, provisionPrivacyWorkerLogin, provisionQbankControlDefiner, provisionQbankControlLogin, provisionRagControlLogin, provisionRuntimeLogin, rebindDatabaseLogin, resolveDatabaseConnectionString, runMigrations } from './index.ts';

async function main(): Promise<void> {
  const pool = createPool();
  try {
    const migrationDir = fileURLToPath(new URL('../migrations', import.meta.url));
    const migrations = loadMigrations(migrationDir);
    const result = await runMigrations(pool, migrations);
    const runtimeUser = process.env.APP_RUNTIME_DB_USER;
    const runtimePassword = process.env.APP_RUNTIME_DB_PASSWORD;
    const qbankControlUser = process.env.QBANK_CONTROL_DB_USER;
    const qbankControlPassword = process.env.QBANK_CONTROL_DB_PASSWORD;
    const privacyWorkerUser = process.env.PRIVACY_WORKER_DB_USER;
    const privacyWorkerPassword = process.env.PRIVACY_WORKER_DB_PASSWORD;
    const ragControlUser = process.env.RAG_CONTROL_DB_USER;
    const ragControlPassword = process.env.RAG_CONTROL_DB_PASSWORD;
    if ((runtimeUser === undefined) !== (runtimePassword === undefined))
      throw new Error('runtime_login_credentials_must_be_provided_together');
    if ((qbankControlUser === undefined) !== (qbankControlPassword === undefined))
      throw new Error('qbank_control_login_credentials_must_be_provided_together');
    if ((privacyWorkerUser === undefined) !== (privacyWorkerPassword === undefined))
      throw new Error('privacy_worker_login_credentials_must_be_provided_together');
    if ((ragControlUser === undefined) !== (ragControlPassword === undefined))
      throw new Error('rag_control_login_credentials_must_be_provided_together');
    assertDistinctProvisionedLoginNames([
      { service: 'runtime', roleName: runtimeUser },
      { service: 'qbank_control', roleName: qbankControlUser },
      { service: 'privacy_worker', roleName: privacyWorkerUser },
      { service: 'rag_control', roleName: ragControlUser },
    ]);
    if (runtimeUser !== undefined && runtimePassword !== undefined)
      await provisionRuntimeLogin(pool, { roleName: runtimeUser, password: runtimePassword });
    if (qbankControlUser !== undefined && qbankControlPassword !== undefined) {
      // The migration account is never allowed to remain the owner of the
      // taxonomy/artifact/generation guard chain.  Handoff is transactional
      // and the resulting catalog is checked through the separate executor
      // login below before this migration job can report success.
      await provisionQbankControlDefiner(pool);
      await provisionQbankControlLogin(pool, { roleName: qbankControlUser, password: qbankControlPassword });
      const qbankControlPool = createPool({
        connectionString: rebindDatabaseLogin(resolveDatabaseConnectionString(), {
          roleName: qbankControlUser,
          password: qbankControlPassword,
        }),
      });
      try {
        await assertQbankControlExecutorIdentity(qbankControlPool);
        await assertQbankControlDefinerOwnership(qbankControlPool);
      } finally {
        await qbankControlPool.end();
      }
    }
    if (privacyWorkerUser !== undefined && privacyWorkerPassword !== undefined)
      await provisionPrivacyWorkerLogin(pool, { roleName: privacyWorkerUser, password: privacyWorkerPassword });
    if (ragControlUser !== undefined && ragControlPassword !== undefined) {
      await provisionRagControlLogin(pool, { roleName: ragControlUser, password: ragControlPassword });
      // 0073–0074's post-flight check must execute as the exact low-privilege
      // control identity.  Do not grant the migration account executor
      // membership merely to inspect the manifest.
      const ragControlPool = createPool({
        connectionString: rebindDatabaseLogin(resolveDatabaseConnectionString(), {
          roleName: ragControlUser,
          password: ragControlPassword,
        }),
      });
      try {
        await assertRagControlExecutorIdentity(ragControlPool);
        await assertRagControlDefinerOwnership(ragControlPool);
      } finally {
        await ragControlPool.end();
      }
    }
    console.log(`migrations: applied=${result.applied.length} skipped=${result.skipped.length} rag_control_manifest=${ragControlUser !== undefined ? 'verified' : 'not_requested'} qbank_control_manifest=${qbankControlUser !== undefined ? 'verified' : 'not_requested'} runtime_login=${runtimeUser !== undefined ? 'provisioned' : 'not_requested'} qbank_control_login=${qbankControlUser !== undefined ? 'provisioned' : 'not_requested'} privacy_worker_login=${privacyWorkerUser !== undefined ? 'provisioned' : 'not_requested'}`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'migration_bootstrap_failed');
  process.exit(1);
});

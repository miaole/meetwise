/**
 * Test-first contract for generic RAG control-plane identity isolation.
 *
 * This proof intentionally fails until the forward-only 0073 migration and
 * its catalog/provisioning helpers exist.  It is isolated PostgreSQL only:
 * passing it will still be local evidence, never cloud release evidence.
 */
import { fileURLToPath } from 'node:url';
import {
  assertDistinctProvisionedLoginNames, assertIsolatedTestTarget, assertRagControlDefinerOwnership,
  assertRagControlExecutorIdentity, asGateway, asPrincipal, asRagControlExecutor, createPool, loadMigrations,
  provisionRagControlLogin, provisionRuntimeLogin, runMigrations,
} from '../src/index.ts';

const admin = createPool();
const runtimeRole = `rag_runtime_${process.pid}`;
const controlRole = `rag_control_${process.pid}`;
const extraRole = `rag_extra_${process.pid}`;
const password = 'rag-control-role-proof-2026';
const expectedMigrations = [
  '0073_rag_control_plane_identity_isolation',
  '0079_rag_control_acl_allowlist',
  '0080_rag_control_executor_membership_allowlist',
  '0081_rag_control_dispatch_concurrent_replay',
];
let failures = 0;
const check = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};
const denied = async (fn: () => Promise<unknown>) => {
  try { await fn(); return false; } catch (error) { return String(error).includes('permission denied'); }
};

async function main(): Promise<void> {
  await assertIsolatedTestTarget(admin);
  const migrations = loadMigrations(fileURLToPath(new URL('../migrations', import.meta.url)));
  check('forward-only RAG control identity and ACL-allowlist migrations are present before this security proof can pass',
    expectedMigrations.every((version) => migrations.some((migration) => migration.version === version)));
  await runMigrations(admin, migrations);

  await provisionRuntimeLogin(admin, { roleName: runtimeRole, password });
  await provisionRagControlLogin(admin, { roleName: controlRole, password });
  const runtime = createPool({ user: runtimeRole, password, max: 2 });
  const control = createPool({ user: controlRole, password, max: 2 });
  try {

  const roles = await admin.query<{ rolname: string; rolcanlogin: boolean; rolinherit: boolean; rolsuper: boolean; rolbypassrls: boolean }>(
    `SELECT rolname,rolcanlogin,rolinherit,rolsuper,rolbypassrls
       FROM pg_roles
      WHERE rolname = ANY($1::text[])
      ORDER BY rolname`,
    [['rag_control_login', 'rag_control_executor', 'rag_control_definer', 'rag_runtime_definer']],
  );
  const role = new Map(roles.rows.map((row) => [row.rolname, row]));
  check('reserved control capability group and two isolated NOLOGIN definers are provisioned in the catalog',
    role.get('rag_control_login')?.rolcanlogin === false
    && role.get('rag_control_login')?.rolinherit === false
    && role.get('rag_control_login')?.rolsuper === false
    && role.get('rag_control_login')?.rolbypassrls === false
    && role.get('rag_control_executor')?.rolcanlogin === false
    && role.get('rag_control_executor')?.rolinherit === false
    && role.get('rag_control_definer')?.rolcanlogin === false
    && role.get('rag_control_definer')?.rolbypassrls === false
    && role.get('rag_runtime_definer')?.rolcanlogin === false
    && role.get('rag_runtime_definer')?.rolbypassrls === false);

  const schemas = await admin.query<{ schema_name: string; owner_name: string }>(
    `SELECT n.nspname AS schema_name, r.rolname AS owner_name
       FROM pg_namespace n JOIN pg_roles r ON r.oid=n.nspowner
      WHERE n.nspname = ANY($1::text[])`,
    [['rag_runtime', 'rag_control']],
  );
  const schema = new Map(schemas.rows.map((row) => [row.schema_name, row.owner_name]));
  const publicCreate = await admin.query<{ allowed: boolean }>(
    "SELECT has_schema_privilege('app_role', 'public', 'CREATE') AS allowed",
  );
  check('security definer schemas have the reviewed owners and app_role cannot create in public',
    schema.get('rag_runtime') === 'rag_runtime_definer'
    && schema.get('rag_control') === 'rag_control_definer'
    && publicCreate.rows[0]?.allowed === false);

  const requiredFunctions = [
    'rag_control.rag_control_begin_request(text,text,text,bigint)',
    'rag_control.rag_mark_request_dispatching(text,text,text)',
    'rag_control.rag_settle_request_dispatch(text,text,text)',
    'rag_control.rag_control_publish_global_document_version(text,text,text,text,text,text,jsonb,jsonb)',
    'rag_runtime.rag_register_private_document(text,text)',
  ];
  const functionRows = await admin.query<{ signature: string; present: boolean }>(
    `SELECT signature, to_regprocedure(signature) IS NOT NULL AS present
       FROM unnest($1::text[]) AS signature`,
    [requiredFunctions],
  );
  check('manifest v1 request, dispatch, global and runtime regprocedures all exist',
    functionRows.rows.every((row) => row.present));

  const publicFunctionExecute = await admin.query<{ allowed: boolean }>(
    `SELECT bool_or(EXISTS (
         SELECT 1
           FROM aclexplode(coalesce(proc.proacl, acldefault('f', proc.proowner))) AS acl
          WHERE acl.grantee = 0 AND acl.privilege_type = 'EXECUTE'
       )) AS allowed
       FROM unnest($1::text[]) AS signature
       JOIN pg_proc proc ON proc.oid = to_regprocedure(signature)`,
    [[
      ...requiredFunctions,
      'rag_runtime.rag_tombstone_private_document(text,text)',
    ]],
  );
  check('isolated RAG schemas do not retain PostgreSQL default PUBLIC function execution',
    publicFunctionExecute.rows[0]?.allowed === false);

  const requiredRelations = [
    'rag_global_document_provenance', 'rag_control_request', 'rag_control_request_input_binding', 'rag_control_dispatch_attempt', 'rag_control_dispatch_subject',
    'rag_generation_integrity_quarantine', 'rag_cache_invalidation_outbox',
  ];
  const relations = await admin.query<{ name: string; present: boolean }>(
    `SELECT name, to_regclass('public.' || name) IS NOT NULL AS present
       FROM unnest($1::text[]) AS name`,
    [requiredRelations],
  );
  check('global provenance, idempotency, dispatch, quarantine and cache-outbox relations exist',
    relations.rows.every((row) => row.present));

  const legacyControlExecute = await admin.query<{ allowed: boolean }>(
    "SELECT has_function_privilege('app_role', 'public.rag_start_generation(text,text,text)', 'EXECUTE') AS allowed",
  );
  const legacyRawGeneration = await admin.query<{ allowed: boolean }>(
    "SELECT has_table_privilege('app_role', 'public.rag_embedding_generation', 'SELECT,INSERT,UPDATE,DELETE') AS allowed",
  );
  check('request runtime has neither legacy control EXECUTE nor direct generation-table data privileges',
    legacyControlExecute.rows[0]?.allowed === false && legacyRawGeneration.rows[0]?.allowed === false);

  const forgedLegacy = await denied(() => asPrincipal(runtime, '__system_rag__', (client) =>
    client.query("SELECT public.rag_start_generation('rgen-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','rrecipe-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','rpolicy-forged')")));
  const forgedRaw = await denied(() => asPrincipal(runtime, '__system_rag__', (client) =>
    client.query("INSERT INTO public.rag_embedding_generation(id,recipe_id,release_policy_id,source_epoch,expected_chunk_count,physical_table,state) VALUES ('rgen-bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','rrecipe-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','rpolicy-forged',1,0,'rag_vector_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb','building')")));
  const controlRaw = await denied(() => asRagControlExecutor(control, (client) => client.query('SELECT * FROM public.rag_embedding_generation')));
  check('forging the historical system GUC cannot execute legacy control, write a control table, or grant raw control-table reads',
    forgedLegacy && forgedRaw && controlRaw);

  const ownershipGate = await (async () => {
    try { await assertRagControlDefinerOwnership(control); return true; } catch { return false; }
  })();
  const dynamicVector = 'rag_vector_aaaaaaaaaaaa4aaa8aaaaaaaaaaaaaaa';
  await admin.query(`CREATE TABLE rag_control.${dynamicVector}(chunk_id text PRIMARY KEY)`);
  await admin.query(`ALTER TABLE rag_control.${dynamicVector} OWNER TO rag_control_definer`);
  await admin.query(`ALTER TABLE rag_control.${dynamicVector} ENABLE ROW LEVEL SECURITY`);
  await admin.query(`ALTER TABLE rag_control.${dynamicVector} FORCE ROW LEVEL SECURITY`);
  const dynamicVectorDriftRejected = await assertRagControlDefinerOwnership(control)
    .then(() => false, (error) => error instanceof Error && error.message === 'rag_control_definer_ownership_invalid');
  await admin.query(`DROP TABLE rag_control.${dynamicVector}`);
  await admin.query(`CREATE FUNCTION rag_control.rag_unreviewed_control_probe() RETURNS boolean LANGUAGE sql SECURITY DEFINER AS 'SELECT true'`);
  const unreviewedDefinerRejected = await assertRagControlDefinerOwnership(control)
    .then(() => false, (error) => error instanceof Error && error.message === 'rag_control_definer_ownership_invalid');
  await admin.query('DROP FUNCTION rag_control.rag_unreviewed_control_probe()');
  // Real migrations CREATE with their migration owner and only then transfer
  // to a NOLOGIN definer.  Verify the migration owner's default ACL is also
  // closed; definer-role defaults alone do not protect this handoff.
  await admin.query(`CREATE FUNCTION rag_runtime.rag_unreviewed_runtime_probe() RETURNS name LANGUAGE sql SECURITY DEFINER AS 'SELECT current_user'`);
  await admin.query('ALTER FUNCTION rag_runtime.rag_unreviewed_runtime_probe() OWNER TO rag_runtime_definer');
  const migrationOwnerTransferPublicDenied = await admin.query<{ allowed: boolean }>(
    "SELECT has_function_privilege('app_role','rag_runtime.rag_unreviewed_runtime_probe()','EXECUTE') AS allowed",
  ).then((result) => result.rows[0]?.allowed === false, () => false);
  const unreviewedRuntimeDefinerRejected = await assertRagControlDefinerOwnership(control)
    .then(() => false, (error) => error instanceof Error && error.message === 'rag_control_definer_ownership_invalid');
  await admin.query('DROP FUNCTION rag_runtime.rag_unreviewed_runtime_probe()');
  await admin.query('BEGIN');
  await admin.query('SET LOCAL ROLE rag_runtime_definer');
  await admin.query(`CREATE FUNCTION rag_runtime.rag_runtime_default_acl_probe() RETURNS boolean LANGUAGE sql SECURITY DEFINER AS 'SELECT true'`);
  await admin.query('COMMIT');
  const defaultRuntimeDefinerPublicDenied = await admin.query<{ allowed: boolean }>(
    "SELECT has_function_privilege('app_role','rag_runtime.rag_runtime_default_acl_probe()','EXECUTE') AS allowed",
  ).then((result) => result.rows[0]?.allowed === false, () => false);
  await admin.query('DROP FUNCTION rag_runtime.rag_runtime_default_acl_probe()');
  check('catalog gate accepts the reviewed dual-definer/FORCE-RLS manifest', ownershipGate);
  await admin.query("ALTER FUNCTION rag_control.rag_start_generation(text,text,text,text) SET search_path TO pg_catalog, public, pg_temp");
  const unsafeSearchPathRejected = await assertRagControlDefinerOwnership(control)
    .then(() => false, (error) => error instanceof Error && error.message === 'rag_control_definer_ownership_invalid');
  await admin.query("ALTER FUNCTION rag_control.rag_start_generation(text,text,text,text) SET search_path TO pg_catalog, rag_control, pg_temp");
  await admin.query('GRANT EXECUTE ON FUNCTION rag_runtime.rag_register_private_document(text,text) TO PUBLIC');
  const expectedRuntimePublicExecuteRejected = await assertRagControlDefinerOwnership(control)
    .then(() => false, (error) => error instanceof Error && error.message === 'rag_control_definer_ownership_invalid');
  await admin.query('REVOKE EXECUTE ON FUNCTION rag_runtime.rag_register_private_document(text,text) FROM PUBLIC');
  await admin.query('GRANT USAGE ON SCHEMA rag_control TO app_role');
  await admin.query('GRANT EXECUTE ON FUNCTION rag_control.rag_control_begin_request(text,text,text,bigint) TO app_role');
  const appRoleControlCallable = await asPrincipal(runtime, 'owner-rag-control-acl-probe', (client) =>
    client.query("SELECT rag_control.rag_control_begin_request('acl_probe','acl-probe',repeat('a',64),1)"))
    .then(() => true, () => false);
  const expectedControlAppRoleRejected = await assertRagControlDefinerOwnership(control)
    .then(() => false, (error) => error instanceof Error && error.message === 'rag_control_definer_ownership_invalid');
  await admin.query('REVOKE EXECUTE ON FUNCTION rag_control.rag_control_begin_request(text,text,text,bigint) FROM app_role');
  await admin.query('REVOKE USAGE ON SCHEMA rag_control FROM app_role');
  await admin.query('GRANT USAGE ON SCHEMA rag_control TO app_gateway_role');
  await admin.query('GRANT EXECUTE ON FUNCTION rag_control.rag_control_begin_request(text,text,text,bigint) TO app_gateway_role');
  const gatewayControlCallable = await asGateway(runtime, (client) =>
    client.query("SELECT rag_control.rag_control_begin_request('gateway_acl_probe','gateway-acl-probe',repeat('b',64),1)"))
    .then(() => true, () => false);
  const expectedControlGatewayRejected = await assertRagControlDefinerOwnership(control)
    .then(() => false, (error) => error instanceof Error && error.message === 'rag_control_definer_ownership_invalid');
  await admin.query('REVOKE EXECUTE ON FUNCTION rag_control.rag_control_begin_request(text,text,text,bigint) FROM app_gateway_role');
  await admin.query('REVOKE USAGE ON SCHEMA rag_control FROM app_gateway_role');
  check('catalog gate rejects reviewed-function search_path, PUBLIC EXECUTE, app_role or gateway control-ACL drift',
    unsafeSearchPathRejected && expectedRuntimePublicExecuteRejected && appRoleControlCallable && expectedControlAppRoleRejected);
  check('gateway direct control invocation is possible only after injected drift and startup gate then rejects it',
    gatewayControlCallable && expectedControlGatewayRejected);
  await admin.query('GRANT rag_control_executor TO app_gateway_role');
  const gatewayExecutorEscalation = await asGateway(runtime, (client) =>
    client.query("SELECT rag_control.rag_control_begin_request('gateway_executor_probe','gateway-executor-probe',repeat('c',64),1)"))
    .then(() => true, () => false);
  const expectedExecutorMembershipRejected = await assertRagControlExecutorIdentity(control)
    .then(() => false, (error) => error instanceof Error && error.message === 'rag_control_identity_invalid');
  await admin.query('REVOKE rag_control_executor FROM app_gateway_role');
  const executorMembershipRestored = await assertRagControlExecutorIdentity(control).then(() => true, () => false);
  const reservedControlLoginRejected = await provisionRagControlLogin(admin, { roleName: 'rag_control_login', password })
    .then(() => false, (error) => error instanceof Error && error.message === 'rag_control_login_reserved_role_name');
  check('gateway cannot inherit the control executor; membership drift and reserved-login reuse fail closed',
    gatewayExecutorEscalation && expectedExecutorMembershipRejected && executorMembershipRestored && reservedControlLoginRejected);
  check('catalog gate rejects dynamic vector owner/FORCE-RLS/policy-shape drift', dynamicVectorDriftRejected);
  check('catalog gate rejects an unreviewed control SECURITY DEFINER', unreviewedDefinerRejected);
  check('migration-owner-to-runtime-definer handoff does not retain PUBLIC EXECUTE', migrationOwnerTransferPublicDenied);
  check('catalog gate rejects an unreviewed runtime SECURITY DEFINER', unreviewedRuntimeDefinerRejected);
  check('functions newly created by the runtime definer deny PUBLIC EXECUTE by default', defaultRuntimeDefinerPublicDenied);

  const runtimeIdentityRejected = await assertRagControlExecutorIdentity(runtime)
    .then(() => false, (error) => error instanceof Error && error.message === 'rag_control_identity_invalid');
  const adminIdentityRejected = await assertRagControlExecutorIdentity(admin)
    .then(() => false, (error) => error instanceof Error && error.message === 'rag_control_identity_invalid');
  const controlIdentityAccepted = await assertRagControlExecutorIdentity(control).then(() => true, () => false);
  const controlProcedureSucceeded = await asRagControlExecutor(control, async (client) => {
    const row = await client.query<{ request_id: string }>(
      "SELECT rag_control.rag_control_begin_request('identity_probe','identity-probe',repeat('a',64),1) AS request_id",
    );
    return typeof row.rows[0]?.request_id === 'string';
  }).catch(() => false);
  check('真实低权限 RAG control 登录拒绝 runtime/管理员凭据，并且只能经 executor 调用受审控制函数',
    runtimeIdentityRejected && adminIdentityRejected && controlIdentityAccepted && controlProcedureSucceeded);

  await admin.query(`CREATE ROLE ${extraRole} NOLOGIN`);
  await admin.query(`GRANT ${extraRole} TO ${controlRole}`);
  const pollutedRejected = await assertRagControlExecutorIdentity(control)
    .then(() => false, (error) => error instanceof Error && error.message === 'rag_control_identity_invalid');
  await provisionRagControlLogin(admin, { roleName: controlRole, password });
  const reprovisionedAccepted = await assertRagControlExecutorIdentity(control).then(() => true, () => false);
  const sharedCredentialRejected = (() => {
    try {
      assertDistinctProvisionedLoginNames([
        { service: 'runtime', roleName: runtimeRole },
        { service: 'rag_control', roleName: runtimeRole },
      ]);
      return false;
    } catch (error) {
      return error instanceof Error && error.message === 'provisioned_login_role_reused:runtime:rag_control';
    }
  })();
  check('受污染的 control 登录会阻断启动；重新 provision 后仅保留允许成员且禁止复用 runtime 凭据',
    pollutedRejected && reprovisionedAccepted && sharedCredentialRejected);

  } finally {
    await Promise.all([runtime.end(), control.end()]);
    await admin.query(`REVOKE ${extraRole} FROM ${controlRole}`).catch(() => undefined);
    await admin.query(`DROP ROLE IF EXISTS ${extraRole}`).catch(() => undefined);
    await admin.query(`DROP ROLE IF EXISTS ${runtimeRole}`).catch(() => undefined);
    await admin.query(`DROP ROLE IF EXISTS ${controlRole}`).catch(() => undefined);
  }

  console.log(failures === 0
    ? '\n✓ generic RAG control role contract passed (local isolated evidence only)'
    : `\n✗ ${failures} generic RAG control role contract assertions failed`);
  await admin.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => {
  console.error(error);
  await admin.end().catch(() => undefined);
  process.exit(1);
});

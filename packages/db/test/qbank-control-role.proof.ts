/**
 * Qbank control-plane database identity proof.
 *
 * This runs only on an isolated PostgreSQL target after all migrations.  It
 * proves a request runtime can forge app.principal_user yet still cannot
 * ingest, create a generation, or activate one; the separately provisioned
 * NOINHERIT qbank login can enter exactly the reviewed executor role.
 */
import {
  assertIsolatedTestTarget, asQbankControlExecutor, assertQbankControlExecutorIdentity, assertQbankControlDefinerOwnership, createPool,
  assertDistinctProvisionedLoginNames, provisionQbankControlDefiner, provisionQbankControlLogin, provisionRuntimeLogin,
  QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST, QBANK_CONTROL_DEFINER_ROLE, QBANK_CONTROL_DEFINER_TABLE_MANIFEST,
} from '../src/index.ts';
import { ingestQuestionBankArtifacts } from '../../../apps/worker/src/qbank-ingest.ts';

const admin = createPool();
const runtimeRole = `qbank_runtime_${process.pid}`;
const controlRole = `qbank_control_${process.pid}`;
const extraRole = `qbank_extra_${process.pid}`;
const definerRole = QBANK_CONTROL_DEFINER_ROLE;
const readerDriftRole = `qbank_reader_drift_${process.pid}`;
const password = 'qbank-control-role-proof-2026';
const proofEmbedder = {
  id: 'qbank-control-role-proof', dim: 512,
  async embed(texts: string[]) { return texts.map(() => new Array<number>(512).fill(0)); },
};
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

async function rejectsCode(fn: () => Promise<unknown>, code = '42501'): Promise<boolean> {
  try { await fn(); return false; } catch (error) { return (error as { code?: string }).code === code; }
}

async function rejectsMessage(fn: () => Promise<unknown>, message: string): Promise<boolean> {
  try { await fn(); return false; } catch (error) { return error instanceof Error && error.message === message; }
}

async function asForgedRuntime<T>(pool: ReturnType<typeof createPool>, fn: () => Promise<T>): Promise<T> {
  await pool.query('BEGIN');
  try {
    await pool.query('SET LOCAL ROLE app_role');
    await pool.query("SELECT set_config('app.principal_user', '__system_qbank__', true)");
    const value = await fn();
    await pool.query('COMMIT');
    return value;
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
}

async function main() {
  await assertIsolatedTestTarget(admin);
  A('QBank definer manifest includes taxonomy integrity helpers and protected relations',
    QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST.length === 18
    && QBANK_CONTROL_DEFINER_TABLE_MANIFEST.length === 14
    && QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST.some((entry) => entry.signature === 'qbank_taxonomy_release_guard()')
    && QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST.some((entry) => entry.signature === 'qbank_chunk_serving_scope_guard()'));
  await provisionRuntimeLogin(admin, { roleName: runtimeRole, password });
  await provisionQbankControlLogin(admin, { roleName: controlRole, password });
  const runtime = createPool({ user: runtimeRole, password, max: 2 });
  const control = createPool({ user: controlRole, password, max: 2 });
  try {
    const attrs = (await admin.query(
      `SELECT
         pg_has_role($1, 'app_role', 'member') AS runtime_app_member,
         pg_has_role($1, 'qbank_control_executor', 'member') AS runtime_qbank_member,
         pg_has_role($2, 'app_role', 'member') AS control_app_member,
         pg_has_role($2, 'qbank_control_executor', 'member') AS control_qbank_member,
         (SELECT rolinherit FROM pg_roles WHERE rolname=$2) AS control_inherit`,
      [runtimeRole, controlRole],
    )).rows[0];
    A('运行时登录与 qbank 控制登录互斥，控制登录为 NOINHERIT executor 成员',
      attrs?.runtime_app_member === true && attrs?.runtime_qbank_member === false
      && attrs?.control_app_member === false && attrs?.control_qbank_member === true
      && attrs?.control_inherit === false);
    const runtimeIdentityRejected = await rejectsMessage(() => assertQbankControlExecutorIdentity(runtime), 'qbank_control_identity_invalid');
    const adminIdentityRejected = await rejectsMessage(() => assertQbankControlExecutorIdentity(admin), 'qbank_control_identity_invalid');
    const controlIdentityAccepted = await assertQbankControlExecutorIdentity(control).then(() => true, () => false);
    A('控制连接拒绝 runtime/管理员形状，只接受独立无表所有权的 executor 登录',
      runtimeIdentityRejected && adminIdentityRejected && controlIdentityAccepted);

    const forgedSourceDenied = await rejectsCode(() => asForgedRuntime(runtime, () => runtime.query(
      `INSERT INTO qbank_source(id,kind,content_hash,status,added_by)
       VALUES ('forged-source','manual','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','pending','__system_qbank__')`,
    )));
    const forgedRecipeDenied = await rejectsCode(() => asForgedRuntime(runtime, () => runtime.query(
      `INSERT INTO qbank_embedding_recipe(
          id,recipe_hash,provider,model,provider_revision,dimensions,chunker_version,normalization_version,
          document_prefix_version,query_prefix_version,manifest
        ) VALUES (
          'qrecipe-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',repeat('a',64),'proof','proof','r1',512,'whole','nfc','none','none','{}'::jsonb
        )`,
    )));
    const forgedPartitionDenied = await rejectsCode(() => asForgedRuntime(runtime, () => runtime.query(
      "SELECT qbank_prepare_generation_partition('qgen-00000000-0000-0000-0000-000000000000')",
    )));
    const forgedActivateDenied = await rejectsCode(() => asForgedRuntime(runtime, () => runtime.query(
      "SELECT qbank_activate_generation('qgen-00000000-0000-0000-0000-000000000000')",
    )));
    // A permissive RLS policy is not a table grant.  The bounded
    // SECURITY DEFINER retrieval functions need row visibility under FORCE
    // RLS, but a forged request runtime must still have neither direct SELECT
    // privilege nor a raw read path for the pool, vector rows, or candidate
    // view those functions compose internally.
    const rawRelations = [
      'qbank_source', 'qbank_pool_entry', 'qbank_chunk', 'qbank_embedding_recipe',
      'qbank_vector_generation', 'qbank_generation_chunk', 'qbank_question',
      'qbank_question_chunk', 'qbank_taxonomy_release', 'qbank_taxonomy_scope',
      'qbank_chunk_serving_scope', 'qbank_retrieval_candidate',
    ] as const;
    const forgedRawReadDenied = (await Promise.all(rawRelations.map((relation) =>
      rejectsCode(() => asForgedRuntime(runtime, () => runtime.query(`SELECT * FROM ${relation} LIMIT 1`))),
    ))).every(Boolean);
    const forgedRawPrivilegeAbsent = (await Promise.all(rawRelations.map(async (relation) => {
      const result = await admin.query<{ allowed: boolean }>(
        "SELECT has_table_privilege($1,$2,'SELECT') AS allowed", [runtimeRole, relation],
      );
      return result.rows[0]?.allowed === false;
    }))).every(Boolean);
    A('伪造 __system_qbank__ GUC 后，运行时仍不能写来源、recipe 或创建 generation 分区',
      forgedSourceDenied && forgedRecipeDenied && forgedPartitionDenied && forgedActivateDenied);
    A('伪造 curator 会话变量后，运行时对所有原始题库关系均没有 SELECT 授权且直接读取一律拒绝',
      forgedRawReadDenied && forgedRawPrivilegeAbsent);

    const controlRoleSeen = await asQbankControlExecutor(control, async (c) => {
      const actor = await c.query('SELECT current_user AS role');
      await c.query(
        `INSERT INTO qbank_embedding_recipe(
            id,recipe_hash,provider,model,provider_revision,dimensions,chunker_version,normalization_version,
            document_prefix_version,query_prefix_version,manifest
          ) VALUES (
            'qrecipe-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',repeat('b',64),'proof','proof','r1',512,'whole','nfc','none','none','{}'::jsonb
          )`,
      );
      await c.query(
        `INSERT INTO qbank_source(id,kind,content_hash,status,added_by)
         VALUES ('control-source','manual','bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb','pending','__system_qbank__')`,
      );
      return actor.rows[0]?.role;
    });
    A('独立控制登录只能经 qbank_control_executor 写入审核题库控制面', controlRoleSeen === 'qbank_control_executor');

    // Create a physical partition while the migration principal still owns
    // the SECURITY DEFINER writer.  PostgreSQL does not recursively change a
    // child partition/index owner when its parent changes owner, so this is
    // the concrete pre-handoff shape the provisioner must repair.
    const preHandoffGenerationId = 'qgen-00000000-0000-4000-8000-000000000086';
    const preHandoffPartitionCreated = await asQbankControlExecutor(control, async (c) => {
      const epoch = await c.query<{ epoch: string }>('SELECT epoch::text AS epoch FROM qbank_corpus_epoch WHERE singleton');
      await c.query(
        `INSERT INTO qbank_vector_generation(id,recipe_id,source_epoch,expected_chunk_count,state)
         VALUES ($1,'qrecipe-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',$2::bigint,0,'building')`,
        [preHandoffGenerationId, epoch.rows[0]?.epoch],
      );
      await c.query('SELECT qbank_prepare_generation_partition($1)', [preHandoffGenerationId]);
      return true;
    }).then(() => true, () => false);

    // The executor login is deliberately not the SECURITY DEFINER owner.  A
    // superuser/function owner would pass local tests while bypassing FORCE
    // RLS in production, so startup must reject it until every protected
    // function/table has the same isolated, non-login owner.
    const defaultDefinerRejected = await rejectsMessage(
      () => assertQbankControlDefinerOwnership(control),
      'qbank_control_definer_ownership_invalid',
    );
    await provisionQbankControlDefiner(admin);
    const isolatedDefinerAccepted = await assertQbankControlDefinerOwnership(control).then(() => true, () => false);
    const handedOffPartition = await admin.query<{ relation_count: number; owner_count: number; index_count: number; index_owner_count: number }>(
      `WITH RECURSIVE descendants(oid) AS (
         SELECT inhrelid FROM pg_inherits WHERE inhparent='qbank_generation_chunk'::regclass
         UNION
         SELECT inheritance.inhrelid
           FROM pg_inherits inheritance
           JOIN descendants parent ON parent.oid=inheritance.inhparent
       )
       SELECT count(DISTINCT partition_relation.oid)::int AS relation_count,
              count(DISTINCT partition_relation.oid) FILTER (WHERE owner.rolname=$1)::int AS owner_count,
              count(index_relation.oid)::int AS index_count,
              count(*) FILTER (WHERE index_owner.rolname=$1)::int AS index_owner_count
         FROM descendants descendant
         JOIN pg_class partition_relation ON partition_relation.oid=descendant.oid
         JOIN pg_roles owner ON owner.oid=partition_relation.relowner
         LEFT JOIN pg_index index_definition ON index_definition.indrelid=partition_relation.oid
         LEFT JOIN pg_class index_relation ON index_relation.oid=index_definition.indexrelid
         LEFT JOIN pg_roles index_owner ON index_owner.oid=index_relation.relowner`,
      [definerRole],
    );
    const partitionOwnershipTransferred = handedOffPartition.rows[0]?.relation_count === 1
      && handedOffPartition.rows[0]?.owner_count === 1
      && (handedOffPartition.rows[0]?.index_count ?? 0) > 0
      && handedOffPartition.rows[0]?.index_count === handedOffPartition.rows[0]?.index_owner_count;
    let isolatedDefinerIngested = false;
    try {
      const ingest = await ingestQuestionBankArtifacts(control, [{
        id: `question:qbank-definer-${process.pid}`,
        competency: '隔离 definer metadata 写入',
        difficulty: 3,
        taxonomyVersion: 'v1',
        servingScopeId: 'backend/general',
        annotationSource: 'curator_reviewed',
        chunks: [
          { refId: `qbank-definer:${process.pid}:prompt`, role: 'prompt', ordinal: 0, required: true, text: '隔离 definer 必须能验证 metadata 并写入题目。' },
          { refId: `qbank-definer:${process.pid}:rubric`, role: 'rubric', ordinal: 0, required: true, text: '评分锚点：helper owner、RLS 与控制登录必须一致。' },
          { refId: `qbank-definer:${process.pid}:anti`, role: 'anti_pattern', ordinal: 0, text: '反例：触发器 helper 漏转 owner 导致生产写入权限失败。' },
        ],
      }], proofEmbedder);
      isolatedDefinerIngested = ingest.questionCount === 1 && ingest.chunkCount === 3;
    } catch (error) {
      const databaseError = error as { message?: unknown; detail?: unknown; hint?: unknown; where?: unknown; routine?: unknown };
      console.error('qbank_definer_ingest_error', JSON.stringify({
        message: databaseError.message, detail: databaseError.detail, hint: databaseError.hint,
        where: databaseError.where, routine: databaseError.routine,
      }));
      isolatedDefinerIngested = false;
    }
    await admin.query(`CREATE ROLE ${extraRole} NOLOGIN`);
    await admin.query(`GRANT ${extraRole} TO ${definerRole}`);
    const parentMembershipRejected = await rejectsMessage(
      () => assertQbankControlDefinerOwnership(control),
      'qbank_control_definer_ownership_invalid',
    );
    await admin.query(`REVOKE ${extraRole} FROM ${definerRole}`);
    await admin.query(`GRANT ${definerRole} TO ${extraRole}`);
    const childMembershipRejected = await rejectsMessage(
      () => assertQbankControlDefinerOwnership(control),
      'qbank_control_definer_ownership_invalid',
    );
    await admin.query(`REVOKE ${definerRole} FROM ${extraRole}`);
    await admin.query(
      `CREATE ROLE ${readerDriftRole} NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS`,
    );
    await admin.query(`ALTER FUNCTION qbank_generation_question_evidence(text,text[],integer) OWNER TO ${readerDriftRole}`);
    const readerOwnerDriftRejected = await rejectsMessage(
      () => assertQbankControlDefinerOwnership(control),
      'qbank_control_definer_ownership_invalid',
    );
    await admin.query(`ALTER FUNCTION qbank_generation_question_evidence(text,text[],integer) OWNER TO ${definerRole}`);
    await admin.query(`ALTER TABLE qbank_source OWNER TO ${readerDriftRole}`);
    const sourceOwnerDriftRejected = await rejectsMessage(
      () => assertQbankControlDefinerOwnership(control),
      'qbank_control_definer_ownership_invalid',
    );
    await admin.query(`ALTER TABLE qbank_source OWNER TO ${definerRole}`);
    await admin.query(`ALTER TABLE qbank_pool_entry OWNER TO ${readerDriftRole}`);
    const poolOwnerDriftRejected = await rejectsMessage(
      () => assertQbankControlDefinerOwnership(control),
      'qbank_control_definer_ownership_invalid',
    );
    await admin.query(`ALTER TABLE qbank_pool_entry OWNER TO ${definerRole}`);
    await admin.query(`ALTER FUNCTION qbank_pool_requires_approved() OWNER TO ${readerDriftRole}`);
    const poolTriggerOwnerDriftRejected = await rejectsMessage(
      () => assertQbankControlDefinerOwnership(control),
      'qbank_control_definer_ownership_invalid',
    );
    await admin.query(`ALTER FUNCTION qbank_pool_requires_approved() OWNER TO ${definerRole}`);
    let taxonomyOwnerDriftRejected = true;
    for (const signature of [
      'qbank_taxonomy_release_guard()',
      'qbank_taxonomy_scope_guard()',
      'qbank_taxonomy_manifest_hash(text)',
      'qbank_chunk_serving_scope_guard()',
    ]) {
      await admin.query(`ALTER FUNCTION ${signature} OWNER TO ${readerDriftRole}`);
      const rejected = await rejectsMessage(
        () => assertQbankControlDefinerOwnership(control),
        'qbank_control_definer_ownership_invalid',
      );
      await admin.query(`ALTER FUNCTION ${signature} OWNER TO ${definerRole}`);
      taxonomyOwnerDriftRejected = taxonomyOwnerDriftRejected && rejected;
    }
    await admin.query('GRANT EXECUTE ON FUNCTION qbank_activate_generation(text) TO app_role');
    const writerFunctionAclDriftRejected = await rejectsMessage(
      () => assertQbankControlDefinerOwnership(control),
      'qbank_control_definer_ownership_invalid',
    );
    const runtimeWriterExecutable = await asForgedRuntime(runtime, () => runtime.query(
      "SELECT qbank_activate_generation('qgen-00000000-0000-0000-0000-000000000000')",
    )).then(() => true, (error: { code?: string }) => error.code !== '42501');
    await admin.query('REVOKE ALL ON FUNCTION qbank_activate_generation(text) FROM app_role');
    await admin.query('GRANT SELECT ON qbank_source TO app_role');
    const tableAclDriftRejected = await rejectsMessage(
      () => assertQbankControlDefinerOwnership(control),
      'qbank_control_definer_ownership_invalid',
    );
    await admin.query('REVOKE ALL ON qbank_source FROM app_role');
    await admin.query('GRANT SELECT (content) ON qbank_chunk TO app_role');
    const columnAclDriftRejected = await rejectsMessage(
      () => assertQbankControlDefinerOwnership(control),
      'qbank_control_definer_ownership_invalid',
    );
    const runtimeColumnReadSucceeded = await asForgedRuntime(runtime, () => runtime.query(
      'SELECT content FROM qbank_chunk LIMIT 1',
    )).then((result) => result.rowCount === 1, () => false);
    await admin.query('REVOKE ALL (content) ON qbank_chunk FROM app_role');
    await admin.query('GRANT UPDATE ON qbank_corpus_epoch TO PUBLIC');
    const publicWriterAclDriftRejected = await rejectsMessage(
      () => assertQbankControlDefinerOwnership(control),
      'qbank_control_definer_ownership_invalid',
    );
    const publicWriterPrivilegeEffective = (await admin.query<{ allowed: boolean }>(
      "SELECT has_table_privilege('app_role','qbank_corpus_epoch','UPDATE') AS allowed",
    )).rows[0]?.allowed === true;
    await admin.query('REVOKE ALL ON qbank_corpus_epoch FROM PUBLIC');
    await admin.query(`ALTER DEFAULT PRIVILEGES FOR ROLE ${definerRole} GRANT EXECUTE ON FUNCTIONS TO PUBLIC`);
    const defaultAclDriftRejected = await rejectsMessage(
      () => assertQbankControlDefinerOwnership(control),
      'qbank_control_definer_ownership_invalid',
    );
    await admin.query(`ALTER DEFAULT PRIVILEGES FOR ROLE ${definerRole} REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC`);
    await admin.query(`ALTER DEFAULT PRIVILEGES FOR ROLE ${definerRole} IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO PUBLIC`);
    const schemaFunctionDefaultAclDriftRejected = await rejectsMessage(
      () => assertQbankControlDefinerOwnership(control),
      'qbank_control_definer_ownership_invalid',
    );
    await admin.query(`ALTER DEFAULT PRIVILEGES FOR ROLE ${definerRole} IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC`);
    await admin.query(`ALTER DEFAULT PRIVILEGES FOR ROLE ${definerRole} IN SCHEMA public GRANT SELECT ON TABLES TO app_role`);
    const schemaTableDefaultAclDriftRejected = await rejectsMessage(
      () => assertQbankControlDefinerOwnership(control),
      'qbank_control_definer_ownership_invalid',
    );
    await admin.query(`ALTER DEFAULT PRIVILEGES FOR ROLE ${definerRole} IN SCHEMA public REVOKE ALL ON TABLES FROM app_role`);
    // Migrations normally CREATE under the migration owner and then transfer
    // ownership.  The creator's default PUBLIC EXECUTE survives that transfer,
    // so a default ACL set only for the fixed definer is insufficient on its
    // own.  A rogue SECURITY DEFINER function must make the startup gate fail
    // before any request runtime can retain that callable surface.
    await admin.query(
      `CREATE FUNCTION qbank_rogue_owner_transfer_probe() RETURNS integer
         LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,public,pg_temp
         AS $$ SELECT 1 $$`,
    );
    await admin.query(`ALTER FUNCTION qbank_rogue_owner_transfer_probe() OWNER TO ${definerRole}`);
    const transferredRogueWasPublic = (await admin.query<{ allowed: boolean }>(
      "SELECT has_function_privilege('app_role','qbank_rogue_owner_transfer_probe()'::regprocedure,'EXECUTE') AS allowed",
    )).rows[0]?.allowed === true;
    const unexpectedDefinerRejected = await rejectsMessage(
      () => assertQbankControlDefinerOwnership(control),
      'qbank_control_definer_ownership_invalid',
    );
    await admin.query('DROP FUNCTION qbank_rogue_owner_transfer_probe()');
    const restoredDefinerAccepted = await assertQbankControlDefinerOwnership(control).then(() => true, () => false);
    A('启动期拒绝超级用户/可 SET ROLE 的 qbank definer，仅接受统一的无登录无成员 FORCE RLS owner',
      defaultDefinerRejected && isolatedDefinerAccepted
      && parentMembershipRejected && childMembershipRejected && readerOwnerDriftRejected
      && sourceOwnerDriftRejected && poolOwnerDriftRejected && poolTriggerOwnerDriftRejected
      && taxonomyOwnerDriftRejected && restoredDefinerAccepted);
    A('启动期拒绝公开 writer、表级/列级原始数据和所有 default-ACL 漂移',
      writerFunctionAclDriftRejected && runtimeWriterExecutable && tableAclDriftRejected
      && columnAclDriftRejected && runtimeColumnReadSucceeded
      && publicWriterAclDriftRejected && publicWriterPrivilegeEffective
      && defaultAclDriftRejected && schemaFunctionDefaultAclDriftRejected && schemaTableDefaultAclDriftRejected
      && transferredRogueWasPublic && unexpectedDefinerRejected);
    A('handoff 递归转移既有 generation 分区与物理索引，目录门禁同时复核其 owner/ACL',
      preHandoffPartitionCreated && partitionOwnershipTransferred && restoredDefinerAccepted);
    A('实际 qbank 控制登录在隔离 definer + FORCE RLS 形态下可写入完整 reviewed metadata artifact',
      isolatedDefinerIngested);

    // A pre-existing login/role can be polluted by a manual GRANT after the
    // migration.  Startup identity validation must fail closed, and the
    // provisioner must restore the one-role allowlist rather than merely add
    // another NOINHERIT membership.
    await admin.query(`GRANT ${extraRole} TO ${controlRole}`);
    const pollutedLoginRejected = await rejectsMessage(() => assertQbankControlExecutorIdentity(control), 'qbank_control_identity_invalid');
    await provisionQbankControlLogin(admin, { roleName: controlRole, password });
    const reprovisionedLoginAccepted = await assertQbankControlExecutorIdentity(control).then(() => true, () => false);
    await admin.query(`GRANT ${extraRole} TO qbank_control_executor`);
    const pollutedExecutorRejected = await rejectsMessage(() => assertQbankControlExecutorIdentity(control), 'qbank_control_identity_invalid');
    await admin.query(`REVOKE ${extraRole} FROM qbank_control_executor`);
    A('残留登录/执行器成员关系会阻断启动，重新 provision 后仅保留允许角色',
      pollutedLoginRejected && reprovisionedLoginAccepted && pollutedExecutorRejected);
    const sameCredentialRejected = (() => {
      try {
        assertDistinctProvisionedLoginNames([
          { service: 'runtime', roleName: runtimeRole },
          { service: 'qbank_control', roleName: runtimeRole },
        ]);
        return false;
      } catch (error) { return error instanceof Error && error.message === 'provisioned_login_role_reused:runtime:qbank_control'; }
    })();
    A('运行时、题库控制和隐私 worker 配置禁止复用同一数据库登录', sameCredentialRejected);
  } finally {
    await Promise.all([runtime.end(), control.end()]);
    await admin.query(`REVOKE ${extraRole} FROM ${controlRole}`).catch(() => undefined);
    await admin.query(`REVOKE ${extraRole} FROM qbank_control_executor`).catch(() => undefined);
    await admin.query(`REVOKE ${extraRole} FROM ${definerRole}`).catch(() => undefined);
    await admin.query(`REVOKE ${definerRole} FROM ${extraRole}`).catch(() => undefined);
    await admin.query(`DROP ROLE IF EXISTS ${readerDriftRole}`).catch(() => undefined);
    await admin.query(`DROP ROLE IF EXISTS ${extraRole}`).catch(() => undefined);
    await admin.query(`DROP ROLE IF EXISTS ${runtimeRole}`);
    await admin.query(`DROP ROLE IF EXISTS ${controlRole}`);
    await admin.end();
  }
  console.log(failures === 0 ? '\n✓ qbank control-plane role proof passed' : `\n✗ ${failures} failures`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => { console.error(error); await admin.end(); process.exit(1); });

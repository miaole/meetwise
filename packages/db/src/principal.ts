/**
 * PostgreSQL connection and principal-scoped transaction primitive.
 *
 * This module intentionally has no business imports: repositories can depend on it directly without importing
 * the `index.ts` public barrel back into the database DAG.
 */
import { readFileSync } from 'node:fs';
import pkg from 'pg';

const { Pool } = pkg;
export type Client = pkg.PoolClient;
export type DbPool = pkg.Pool;

export interface PoolOverrides {
  connectionString?: string;
  host?: string; port?: number; user?: string; password?: string; database?: string; max?: number;
  sslMode?: 'disable' | 'verify-full';
  sslCaPath?: string;
  /** Required when a cloud test runner pins PGHOST to a verified IP address. */
  tlsServerName?: string;
}

export interface RuntimeLoginInput {
  /** PostgreSQL identifier, not an arbitrary SQL fragment. */
  roleName: string;
  /** Never logged; supplied only to PostgreSQL's server-side formatter. */
  password: string;
}

export interface ProvisionedLoginName {
  service: 'runtime' | 'qbank_control' | 'rag_control' | 'privacy_worker';
  roleName?: string;
}

const RUNTIME_ROLE_NAME = /^[a-z][a-z0-9_]{0,62}$/;
/**
 * This role never receives a password or a member.  It owns the fixed QBank
 * control manifest so SECURITY DEFINER code remains subject to FORCE RLS
 * instead of silently executing as the migration login.
 */
export const QBANK_CONTROL_DEFINER_ROLE = 'qbank_control_definer';

export const QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST = [
  { signature: 'qbank_generation_chunk_only_building()', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: false },
  { signature: 'qbank_prepare_generation_partition(text)', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: true },
  { signature: 'qbank_validate_generation(text)', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: true },
  { signature: 'qbank_activate_generation(text)', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: true },
  { signature: 'qbank_mark_generation_failed(text,text)', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: true },
  { signature: 'qbank_question_chunk_requires_visible_source()', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: false },
  { signature: 'qbank_question_artifact_guard()', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: false },
  { signature: 'qbank_question_chunk_artifact_guard()', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: false },
  { signature: 'qbank_generation_question_evidence(text,text[],integer)', requiresSecurityDefiner: true, allowAppRoleExecute: true, allowExecutorExecute: false },
  { signature: 'qbank_pool_requires_approved()', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: false },
  { signature: 'qbank_chunk_requires_approved_pool()', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: false },
  { signature: 'qbank_is_generation_control_definer()', requiresSecurityDefiner: false, allowAppRoleExecute: true, allowExecutorExecute: true },
  { signature: 'qbank_metadata_hash(text,text,text,text)', requiresSecurityDefiner: false, allowAppRoleExecute: false, allowExecutorExecute: true },
  { signature: 'qbank_is_curator()', requiresSecurityDefiner: false, allowAppRoleExecute: true, allowExecutorExecute: true },
  { signature: 'qbank_taxonomy_release_guard()', requiresSecurityDefiner: false, allowAppRoleExecute: false, allowExecutorExecute: false },
  { signature: 'qbank_taxonomy_scope_guard()', requiresSecurityDefiner: false, allowAppRoleExecute: false, allowExecutorExecute: false },
  { signature: 'qbank_taxonomy_manifest_hash(text)', requiresSecurityDefiner: false, allowAppRoleExecute: false, allowExecutorExecute: true },
  { signature: 'qbank_chunk_serving_scope_guard()', requiresSecurityDefiner: false, allowAppRoleExecute: false, allowExecutorExecute: false },
] as const;

/**
 * This is a privilege contract, not merely a list of protected relations.
 * `qbank_curator` and `qbank_cache_epoch` are intentionally non-sensitive
 * read models for the request role; every other relation stays raw-control
 * only.  The executor list is likewise exact so a missing control grant is a
 * startup failure rather than a delayed ingest/rebuild outage.
 */
export const QBANK_CONTROL_DEFINER_TABLE_MANIFEST = [
  { name: 'public.qbank_vector_generation', appRolePrivileges: [], executorPrivileges: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] },
  { name: 'public.qbank_generation_chunk', appRolePrivileges: [], executorPrivileges: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] },
  { name: 'public.qbank_corpus_epoch', appRolePrivileges: [], executorPrivileges: ['SELECT', 'UPDATE'] },
  { name: 'public.qbank_active_generation', appRolePrivileges: [], executorPrivileges: ['SELECT'] },
  { name: 'public.qbank_cache_epoch', appRolePrivileges: ['SELECT'], executorPrivileges: ['SELECT', 'UPDATE'] },
  { name: 'public.qbank_question', appRolePrivileges: [], executorPrivileges: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] },
  { name: 'public.qbank_question_chunk', appRolePrivileges: [], executorPrivileges: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] },
  { name: 'public.qbank_curator', appRolePrivileges: ['SELECT'], executorPrivileges: ['SELECT'] },
  { name: 'public.qbank_source', appRolePrivileges: [], executorPrivileges: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] },
  { name: 'public.qbank_pool_entry', appRolePrivileges: [], executorPrivileges: ['SELECT', 'INSERT'] },
  { name: 'public.qbank_chunk', appRolePrivileges: [], executorPrivileges: ['SELECT', 'INSERT'] },
  { name: 'public.qbank_taxonomy_release', appRolePrivileges: [], executorPrivileges: ['SELECT', 'INSERT', 'UPDATE'] },
  { name: 'public.qbank_taxonomy_scope', appRolePrivileges: [], executorPrivileges: ['SELECT', 'INSERT'] },
  { name: 'public.qbank_chunk_serving_scope', appRolePrivileges: [], executorPrivileges: ['SELECT', 'INSERT'] },
] as const;
const RESERVED_RAG_CONTROL_ROLE_NAMES = new Set([
  'rag_control_login',
  'rag_control_executor',
  'rag_control_definer',
  'rag_runtime_definer',
]);

/** A service credential may have exactly one capability class. */
export function assertDistinctProvisionedLoginNames(names: readonly ProvisionedLoginName[]): void {
  const seen = new Map<string, string>();
  for (const entry of names) {
    const roleName = entry.roleName?.trim();
    if (!roleName) continue;
    const prior = seen.get(roleName);
    if (prior !== undefined && prior !== entry.service) {
      throw new Error(`provisioned_login_role_reused:${prior}:${entry.service}`);
    }
    seen.set(roleName, entry.service);
  }
}

/**
 * A dedicated login has a closed membership allowlist.  PostgreSQL's
 * NOINHERIT only stops implicit privilege use; a login can still SET ROLE to
 * any role it remains a member of.  Remove stale/manual grants before adding
 * this service's one reviewed capability.
 */
async function revokeDirectRoleMemberships(c: Client, memberRole: string): Promise<void> {
  const memberships = await c.query<{ role_name: string }>(
    `SELECT parent.rolname AS role_name
       FROM pg_auth_members membership
       JOIN pg_roles parent ON parent.oid=membership.roleid
       JOIN pg_roles member ON member.oid=membership.member
      WHERE member.rolname=$1`,
    [memberRole],
  );
  for (const membership of memberships.rows) {
    const statement = await c.query<{ statement: string }>(
      "SELECT format('REVOKE %I FROM %I', $1::text, $2::text) AS statement",
      [membership.role_name, memberRole],
    );
    await c.query(String(statement.rows[0]?.statement));
  }
}

/** Remove every direct member of a sealed NOLOGIN capability role. */
async function revokeDirectRoleMembers(c: Client, parentRole: string): Promise<void> {
  const members = await c.query<{ role_name: string }>(
    `SELECT member.rolname AS role_name
       FROM pg_auth_members membership
       JOIN pg_roles parent ON parent.oid=membership.roleid
       JOIN pg_roles member ON member.oid=membership.member
      WHERE parent.rolname=$1`,
    [parentRole],
  );
  for (const member of members.rows) {
    const statement = await c.query<{ statement: string }>(
      "SELECT format('REVOKE %I FROM %I', $1::text, $2::text) AS statement",
      [parentRole, member.role_name],
    );
    await c.query(String(statement.rows[0]?.statement));
  }
}

/**
 * Ownership transfer preserves relation ACLs.  Rebuild them from the reviewed
 * manifest instead of carrying a historical, manually granted writer or a
 * column-read bypass into the fixed definer shape.
 */
async function normalizeQbankRelationAcl(
  c: Client,
  relation: string,
  appRolePrivileges: readonly string[],
  executorPrivileges: readonly string[],
): Promise<void> {
  const grantees = await c.query<{ role_name: string }>(
    `SELECT DISTINCT coalesce(role.rolname, 'PUBLIC') AS role_name
       FROM pg_class class
       CROSS JOIN LATERAL aclexplode(coalesce(class.relacl, acldefault('r', class.relowner))) AS privilege
       LEFT JOIN pg_roles role ON role.oid=privilege.grantee
      WHERE class.oid=$1::regclass
        AND privilege.grantee <> class.relowner
      ORDER BY role_name`,
    [relation],
  );
  for (const { role_name: roleName } of grantees.rows) {
    const revoke = await c.query<{ statement: string }>(
      `SELECT format(
          'REVOKE ALL PRIVILEGES ON TABLE %s FROM %s',
          $1::regclass,
          CASE WHEN $2::text='PUBLIC' THEN 'PUBLIC' ELSE format('%I', $2::text) END
        ) AS statement`,
      [relation, roleName],
    );
    await c.query(String(revoke.rows[0]?.statement));
  }
  const columnGrantees = await c.query<{ column_name: string; role_name: string }>(
    `SELECT attribute.attname AS column_name,
            coalesce(role.rolname, 'PUBLIC') AS role_name
       FROM pg_class class
       JOIN pg_attribute attribute
         ON attribute.attrelid=class.oid
        AND attribute.attnum > 0 AND NOT attribute.attisdropped
       CROSS JOIN LATERAL aclexplode(attribute.attacl) AS privilege
       LEFT JOIN pg_roles role ON role.oid=privilege.grantee
      WHERE class.oid=$1::regclass
        AND attribute.attacl IS NOT NULL
        AND privilege.grantee <> class.relowner
      GROUP BY attribute.attname, role.rolname
      ORDER BY attribute.attname, role_name`,
    [relation],
  );
  for (const { column_name: columnName, role_name: roleName } of columnGrantees.rows) {
    const revoke = await c.query<{ statement: string }>(
      `SELECT format(
          'REVOKE ALL PRIVILEGES (%I) ON TABLE %s FROM %s',
          $2::text,
          $1::regclass,
          CASE WHEN $3::text='PUBLIC' THEN 'PUBLIC' ELSE format('%I', $3::text) END
        ) AS statement`,
      [relation, columnName, roleName],
    );
    await c.query(String(revoke.rows[0]?.statement));
  }
  for (const [roleName, privileges] of [
    ['app_role', appRolePrivileges],
    ['qbank_control_executor', executorPrivileges],
  ] as const) {
    if (privileges.length === 0) continue;
    const grant = await c.query<{ statement: string }>(
      "SELECT format('GRANT %s ON TABLE %s TO %I', $2::text, $1::regclass, $3::text) AS statement",
      [relation, privileges.join(', '), roleName],
    );
    await c.query(String(grant.rows[0]?.statement));
  }
}

/**
 * Create or repair the one fixed QBank NOLOGIN owner and transfer every
 * function/table in the reviewed manifest.  The migrator receives a temporary
 * direct membership solely inside this transaction because PostgreSQL requires
 * membership in the destination role for ALTER ... OWNER.  It is revoked
 * before commit; any failure rolls the complete handoff back.
 */
export async function provisionQbankControlDefiner(pool: DbPool): Promise<void> {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    const identity = await c.query<{ current_user: string }>('SELECT current_user AS current_user');
    const migrationRole = String(identity.rows[0]?.current_user ?? '');
    if (!RUNTIME_ROLE_NAME.test(migrationRole) || migrationRole === QBANK_CONTROL_DEFINER_ROLE)
      throw new Error('qbank_control_definer_migration_identity_invalid');

    const exists = await c.query('SELECT 1 FROM pg_roles WHERE rolname=$1', [QBANK_CONTROL_DEFINER_ROLE]);
    if ((exists.rowCount ?? 0) === 0) {
      const create = await c.query<{ statement: string }>(
        "SELECT format('CREATE ROLE %I NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS', $1::text) AS statement",
        [QBANK_CONTROL_DEFINER_ROLE],
      );
      await c.query(String(create.rows[0]?.statement));
    }
    const harden = await c.query<{ statement: string }>(
      "SELECT format('ALTER ROLE %I NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS', $1::text) AS statement",
      [QBANK_CONTROL_DEFINER_ROLE],
    );
    await c.query(String(harden.rows[0]?.statement));
    await revokeDirectRoleMemberships(c, QBANK_CONTROL_DEFINER_ROLE);
    await revokeDirectRoleMembers(c, QBANK_CONTROL_DEFINER_ROLE);

    const temporaryGrant = await c.query<{ statement: string }>(
      "SELECT format('GRANT %I TO %I', $1::text, $2::text) AS statement",
      [QBANK_CONTROL_DEFINER_ROLE, migrationRole],
    );
    await c.query(String(temporaryGrant.rows[0]?.statement));
    try {
      const schemaGrant = await c.query<{ statement: string }>(
        "SELECT format('GRANT USAGE, CREATE ON SCHEMA public TO %I', $1::text) AS statement",
        [QBANK_CONTROL_DEFINER_ROLE],
      );
      await c.query(String(schemaGrant.rows[0]?.statement));
      for (const relation of QBANK_CONTROL_DEFINER_TABLE_MANIFEST) {
        const relationOwner = await c.query<{ owner_name: string }>(
          `SELECT role.rolname AS owner_name
             FROM pg_class relation
             JOIN pg_roles role ON role.oid=relation.relowner
            WHERE relation.oid=$1::regclass`,
          [relation.name],
        );
        const ownerName = relationOwner.rows[0]?.owner_name;
        // A rerun must not try to ALTER an object that the ordinary migration
        // login no longer owns.  It also must never silently adopt an object
        // from another role: that would make the handoff a broad privilege
        // repair primitive rather than a precise deployment action.
        if (ownerName !== QBANK_CONTROL_DEFINER_ROLE) {
          if (ownerName !== migrationRole)
            throw new Error(`qbank_control_definer_relation_owner_invalid:${relation.name}`);
          const statement = await c.query<{ statement: string }>(
            "SELECT format('ALTER TABLE %s OWNER TO %I', $1::regclass, $2::text) AS statement",
            [relation.name, QBANK_CONTROL_DEFINER_ROLE],
          );
          await c.query(String(statement.rows[0]?.statement));
        }
      }
      // PostgreSQL does not recursively transfer a partition's owner when a
      // parent table changes owner.  An old generation partition therefore
      // remains a migration-login write bypass unless it is handled here.
      // Include its physical indexes as well: a former migration owner must
      // not retain the ability to alter or drop the active serving structure.
      const partitionObjects = await c.query<{
        relation_name: string;
        relation_kind: 'table' | 'index';
        owner_name: string;
      }>(
        `WITH RECURSIVE descendants(oid) AS (
           SELECT inheritance.inhrelid
             FROM pg_inherits inheritance
            WHERE inheritance.inhparent='qbank_generation_chunk'::regclass
           UNION
           SELECT inheritance.inhrelid
             FROM pg_inherits inheritance
             JOIN descendants parent ON parent.oid=inheritance.inhparent
         ), protected_objects AS (
           SELECT descendant.oid, 'table'::text AS relation_kind
             FROM descendants descendant
           UNION
           SELECT index_relation.indexrelid, 'index'::text AS relation_kind
             FROM pg_index index_relation
             JOIN descendants descendant ON descendant.oid=index_relation.indrelid
         )
         SELECT object.oid::regclass::text AS relation_name,
                object.relation_kind,
                owner.rolname AS owner_name
           FROM protected_objects object
           JOIN pg_class relation ON relation.oid=object.oid
           JOIN pg_roles owner ON owner.oid=relation.relowner
          ORDER BY object.relation_kind, object.oid::regclass::text`,
      );
      for (const object of partitionObjects.rows) {
        if (object.owner_name !== QBANK_CONTROL_DEFINER_ROLE) {
          if (object.owner_name !== migrationRole) {
            throw new Error(`qbank_control_definer_partition_owner_invalid:${object.relation_name}`);
          }
          const objectType = object.relation_kind === 'index' ? 'INDEX' : 'TABLE';
          const statement = await c.query<{ statement: string }>(
            `SELECT format('ALTER ${objectType} %s OWNER TO %I', $1::regclass, $2::text) AS statement`,
            [object.relation_name, QBANK_CONTROL_DEFINER_ROLE],
          );
          await c.query(String(statement.rows[0]?.statement));
        }
      }
      for (const fn of QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST) {
        const functionOwner = await c.query<{ owner_name: string }>(
          `SELECT role.rolname AS owner_name
             FROM pg_proc procedure
             JOIN pg_roles role ON role.oid=procedure.proowner
            WHERE procedure.oid=$1::regprocedure`,
          [fn.signature],
        );
        const ownerName = functionOwner.rows[0]?.owner_name;
        if (ownerName === QBANK_CONTROL_DEFINER_ROLE) continue;
        if (ownerName !== migrationRole)
          throw new Error(`qbank_control_definer_function_owner_invalid:${fn.signature}`);
        const statement = await c.query<{ statement: string }>(
          "SELECT format('ALTER FUNCTION %s OWNER TO %I', $1::regprocedure, $2::text) AS statement",
          [fn.signature, QBANK_CONTROL_DEFINER_ROLE],
        );
        await c.query(String(statement.rows[0]?.statement));
      }
      // Newly transferred objects now belong to the fixed role.  Enter it
      // explicitly for ACL/default-ACL normalization: temporary membership is
      // sufficient for owner transfer but is not an assumption about the
      // migration login's inherited object privileges on a rerun.
      await c.query(`SET LOCAL ROLE ${QBANK_CONTROL_DEFINER_ROLE}`);
      for (const relation of QBANK_CONTROL_DEFINER_TABLE_MANIFEST) {
        await normalizeQbankRelationAcl(c, relation.name, relation.appRolePrivileges, relation.executorPrivileges);
      }
      for (const object of partitionObjects.rows) {
        if (object.relation_kind !== 'table') continue;
        // The parent grants are evaluated for ordinary partitioned-table
        // access.  Physical partitions receive no standalone request or
        // executor grants, so a direct partition name cannot become a second
        // raw-data surface.
        await normalizeQbankRelationAcl(c, object.relation_name, [], []);
      }
      // Function ownership alone is not a callable-surface boundary: a
      // later GRANT EXECUTE to app_role would let a request runtime invoke a
      // SECURITY DEFINER writer.  Normalize every manifest ACL after the
      // owner transfer, including any historical/default PUBLIC grant, and
      // make the fixed owner create future functions non-public by default.
      // PostgreSQL combines global and schema-specific default ACLs.  Both
      // must be empty of callable/data privileges before the definer creates
      // another function or dynamic generation partition in public.
      for (const [objectType, grantee, privileges] of [
        ['FUNCTIONS', 'PUBLIC', 'EXECUTE'],
        ['FUNCTIONS', 'app_role', 'ALL PRIVILEGES'],
        ['FUNCTIONS', 'qbank_control_executor', 'ALL PRIVILEGES'],
        ['TABLES', 'PUBLIC', 'ALL PRIVILEGES'],
        ['TABLES', 'app_role', 'ALL PRIVILEGES'],
        ['TABLES', 'qbank_control_executor', 'ALL PRIVILEGES'],
      ] as const) {
        for (const schemaClause of ['', ' IN SCHEMA public']) {
          const defaultAcl = await c.query<{ statement: string }>(
            `SELECT format(
                'ALTER DEFAULT PRIVILEGES FOR ROLE %I${schemaClause} REVOKE ${privileges} ON ${objectType} FROM %s',
                $1::text,
                CASE WHEN $2::text='PUBLIC' THEN 'PUBLIC' ELSE format('%I', $2::text) END
              ) AS statement`,
            [QBANK_CONTROL_DEFINER_ROLE, grantee],
          );
          await c.query(String(defaultAcl.rows[0]?.statement));
        }
      }
      for (const fn of QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST) {
        const executableGrantees = await c.query<{ role_name: string }>(
          `SELECT DISTINCT coalesce(role.rolname, 'PUBLIC') AS role_name
             FROM pg_proc procedure
             CROSS JOIN LATERAL aclexplode(coalesce(procedure.proacl, acldefault('f', procedure.proowner))) AS privilege
             LEFT JOIN pg_roles role ON role.oid=privilege.grantee
            WHERE procedure.oid=$1::regprocedure
              AND privilege.privilege_type='EXECUTE'
              AND privilege.grantee <> procedure.proowner
             ORDER BY role_name`,
          [fn.signature],
        );
        for (const { role_name: roleName } of executableGrantees.rows) {
          const revoke = await c.query<{ statement: string }>(
            `SELECT format(
                'REVOKE ALL ON FUNCTION %s FROM %s',
                $1::regprocedure,
                CASE WHEN $2::text='PUBLIC' THEN 'PUBLIC' ELSE format('%I', $2::text) END
              ) AS statement`,
            [fn.signature, roleName],
          );
          await c.query(String(revoke.rows[0]?.statement));
        }
        for (const [roleName, allowed] of [
          ['app_role', fn.allowAppRoleExecute],
          ['qbank_control_executor', fn.allowExecutorExecute],
        ] as const) {
          if (!allowed) continue;
          const grant = await c.query<{ statement: string }>(
            "SELECT format('GRANT EXECUTE ON FUNCTION %s TO %I', $1::regprocedure, $2::text) AS statement",
            [fn.signature, roleName],
          );
          await c.query(String(grant.rows[0]?.statement));
        }
      }
    } finally {
      await c.query('RESET ROLE');
      const revoke = await c.query<{ statement: string }>(
        "SELECT format('REVOKE %I FROM %I', $1::text, $2::text) AS statement",
        [QBANK_CONTROL_DEFINER_ROLE, migrationRole],
      );
      await c.query(String(revoke.rows[0]?.statement));
    }
    await c.query('COMMIT');
  } catch (error) {
    await c.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally { c.release(); }
}

/**
 * Provision the runtime database login after versioned migrations have created
 * `app_role`. The migration connection is privileged; the resulting login is
 * deliberately not. `NOINHERIT` forces request code through `asPrincipal()`
 * before it gains application-table privileges.
 */
export async function provisionRuntimeLogin(pool: DbPool, input: RuntimeLoginInput): Promise<void> {
  if (!RUNTIME_ROLE_NAME.test(input.roleName)) throw new Error('runtime_login_invalid_role_name');
  if (input.password.length < 16 || input.password.length > 1024 || /[\u0000\r\n]/.test(input.password))
    throw new Error('runtime_login_invalid_password');
  const c = await pool.connect();
  try {
    const ddl = await c.query(
      `SELECT format(
        'CREATE ROLE %I LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L',
        $1::text, $2::text
      ) AS statement`,
      [input.roleName, input.password],
    );
    const alter = await c.query(
      `SELECT format(
        'ALTER ROLE %I LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L',
        $1::text, $2::text
      ) AS statement`,
      [input.roleName, input.password],
    );
    const exists = await c.query('SELECT 1 FROM pg_roles WHERE rolname=$1', [input.roleName]);
    await c.query((exists.rowCount ?? 0) === 0 ? String(ddl.rows[0]?.statement) : String(alter.rows[0]?.statement));
    await revokeDirectRoleMemberships(c, input.roleName);
    const grant = await c.query("SELECT format('GRANT app_role TO %I', $1::text) AS statement", [input.roleName]);
    await c.query(String(grant.rows[0]?.statement));
    // The gateway role receives no table grants. It may execute only reviewed,
    // fixed SECURITY DEFINER functions for dispatch metadata.
    const gatewayExists = await c.query("SELECT 1 FROM pg_roles WHERE rolname='app_gateway_role'");
    if ((gatewayExists.rowCount ?? 0) > 0) {
      const gatewayGrant = await c.query("SELECT format('GRANT app_gateway_role TO %I', $1::text) AS statement", [input.roleName]);
      await c.query(String(gatewayGrant.rows[0]?.statement));
    }
    // A runtime login must never accumulate a control-plane capability through
    // an old/manual grant.  RLS principal GUCs are routing context, not an
    // authorization root, so qbank rebuild/activation is deliberately held by
    // a separate NOINHERIT executor login.
    const qbankControlExists = await c.query("SELECT 1 FROM pg_roles WHERE rolname='qbank_control_executor'");
    if ((qbankControlExists.rowCount ?? 0) > 0) {
      const revoke = await c.query("SELECT format('REVOKE qbank_control_executor FROM %I', $1::text) AS statement", [input.roleName]);
      await c.query(String(revoke.rows[0]?.statement));
    }
  } finally { c.release(); }
}

/**
 * Provision the dedicated qbank control-plane login.  It has no app_role
 * membership: approved-source ingestion, immutable generation construction
 * and active-pointer flips are operational capabilities, not request-path
 * actions.  The credential belongs only to a controlled build job/worker.
 */
export async function provisionQbankControlLogin(pool: DbPool, input: RuntimeLoginInput): Promise<void> {
  if (!RUNTIME_ROLE_NAME.test(input.roleName)) throw new Error('qbank_control_login_invalid_role_name');
  if (input.password.length < 16 || input.password.length > 1024 || /[\u0000\r\n]/.test(input.password))
    throw new Error('qbank_control_login_invalid_password');
  const c = await pool.connect();
  try {
    const exists = await c.query('SELECT 1 FROM pg_roles WHERE rolname=$1', [input.roleName]);
    const createOrAlter = (exists.rowCount ?? 0) === 0
      ? await c.query("SELECT format('CREATE ROLE %I LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L', $1::text, $2::text) AS statement", [input.roleName, input.password])
      : await c.query("SELECT format('ALTER ROLE %I LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L', $1::text, $2::text) AS statement", [input.roleName, input.password]);
    await c.query(String(createOrAlter.rows[0]?.statement));
    await revokeDirectRoleMemberships(c, input.roleName);
    const grant = await c.query("SELECT format('GRANT qbank_control_executor TO %I', $1::text) AS statement", [input.roleName]);
    await c.query(String(grant.rows[0]?.statement));
    // Keep this login incapable of serving an HTTP request or gateway task if
    // its secret is accidentally mounted into the wrong container.
    for (const role of ['app_role', 'app_gateway_role']) {
      const revoke = await c.query(`SELECT format('REVOKE ${role} FROM %I', $1::text) AS statement`, [input.roleName]);
      await c.query(String(revoke.rows[0]?.statement));
    }
  } finally { c.release(); }
}

/**
 * Provision the generic RAG control login.  It is deliberately distinct from
 * the request runtime: a caller holding app_role can route private rows, but
 * can never enter the generation/global-corpus control capability.
 */
export async function provisionRagControlLogin(pool: DbPool, input: RuntimeLoginInput): Promise<void> {
  if (!RUNTIME_ROLE_NAME.test(input.roleName)) throw new Error('rag_control_login_invalid_role_name');
  if (RESERVED_RAG_CONTROL_ROLE_NAMES.has(input.roleName)) throw new Error('rag_control_login_reserved_role_name');
  if (input.password.length < 16 || input.password.length > 1024 || /[\u0000\r\n]/.test(input.password))
    throw new Error('rag_control_login_invalid_password');
  const c = await pool.connect();
  try {
    const exists = await c.query('SELECT 1 FROM pg_roles WHERE rolname=$1', [input.roleName]);
    const createOrAlter = (exists.rowCount ?? 0) === 0
      ? await c.query("SELECT format('CREATE ROLE %I LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L', $1::text, $2::text) AS statement", [input.roleName, input.password])
      : await c.query("SELECT format('ALTER ROLE %I LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L', $1::text, $2::text) AS statement", [input.roleName, input.password]);
    await c.query(String(createOrAlter.rows[0]?.statement));
    await revokeDirectRoleMemberships(c, input.roleName);
    const grant = await c.query("SELECT format('GRANT rag_control_executor TO %I', $1::text) AS statement", [input.roleName]);
    await c.query(String(grant.rows[0]?.statement));
    for (const role of ['app_role', 'app_gateway_role', 'privacy_worker_executor', 'qbank_control_executor']) {
      const revoke = await c.query(`SELECT format('REVOKE ${role} FROM %I', $1::text) AS statement`, [input.roleName]);
      await c.query(String(revoke.rows[0]?.statement));
    }
  } finally { c.release(); }
}

/**
 * Provision the *separate* background erasure login.  It deliberately does
 * not inherit app_role: it can only enter privacy_worker_executor and execute
 * the reviewed claim/purge procedures.  API pods must never receive this
 * password or this role membership.
 */
export async function provisionPrivacyWorkerLogin(pool: DbPool, input: RuntimeLoginInput): Promise<void> {
  if (!RUNTIME_ROLE_NAME.test(input.roleName)) throw new Error('privacy_worker_login_invalid_role_name');
  if (input.password.length < 16 || input.password.length > 1024 || /[\u0000\r\n]/.test(input.password))
    throw new Error('privacy_worker_login_invalid_password');
  const c = await pool.connect();
  try {
    const ddl = await c.query(
      `SELECT format(
        'CREATE ROLE %I LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L',
        $1::text, $2::text
      ) AS statement`,
      [input.roleName, input.password],
    );
    const alter = await c.query(
      `SELECT format(
        'ALTER ROLE %I LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L',
        $1::text, $2::text
      ) AS statement`,
      [input.roleName, input.password],
    );
    const exists = await c.query('SELECT 1 FROM pg_roles WHERE rolname=$1', [input.roleName]);
    await c.query((exists.rowCount ?? 0) === 0 ? String(ddl.rows[0]?.statement) : String(alter.rows[0]?.statement));
    await revokeDirectRoleMemberships(c, input.roleName);
    const grant = await c.query("SELECT format('GRANT privacy_worker_executor TO %I', $1::text) AS statement", [input.roleName]);
    await c.query(String(grant.rows[0]?.statement));
  } finally { c.release(); }
}

/**
 * Provision the scheduler that alone holds the online-Judge HMAC sampling
 * secret.  It cannot read/write Judge tables directly and has no app_role;
 * its only capability is registering opaque, already-authorized candidates
 * through a reviewed database procedure.
 */
export async function provisionOnlineJudgeSchedulerLogin(pool: DbPool, input: RuntimeLoginInput): Promise<void> {
  if (!RUNTIME_ROLE_NAME.test(input.roleName)) throw new Error('online_judge_scheduler_login_invalid_role_name');
  if (input.password.length < 16 || input.password.length > 1024 || /[\u0000\r\n]/.test(input.password))
    throw new Error('online_judge_scheduler_login_invalid_password');
  const c = await pool.connect();
  try {
    const exists = await c.query('SELECT 1 FROM pg_roles WHERE rolname=$1', [input.roleName]);
    // PostgreSQL does not allow a parameterized role identifier; format() is
    // evaluated server-side and RUNTIME_ROLE_NAME constrains the role name.
    const createOrAlter = (exists.rowCount ?? 0) === 0
      ? await c.query("SELECT format('CREATE ROLE %I LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L', $1::text, $2::text) AS statement", [input.roleName, input.password])
      : await c.query("SELECT format('ALTER ROLE %I LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L', $1::text, $2::text) AS statement", [input.roleName, input.password]);
    await c.query(String(createOrAlter.rows[0]?.statement));
    const grant = await c.query("SELECT format('GRANT online_judge_scheduler TO %I', $1::text) AS statement", [input.roleName]);
    await c.query(String(grant.rows[0]?.statement));
  } finally { c.release(); }
}

/** Dedicated online-Judge dispatcher; it cannot register or inspect raw candidate material. */
export async function provisionOnlineJudgeExecutorLogin(pool: DbPool, input: RuntimeLoginInput): Promise<void> {
  if (!RUNTIME_ROLE_NAME.test(input.roleName)) throw new Error('online_judge_executor_login_invalid_role_name');
  if (input.password.length < 16 || input.password.length > 1024 || /[\u0000\r\n]/.test(input.password))
    throw new Error('online_judge_executor_login_invalid_password');
  const c = await pool.connect();
  try {
    const exists = await c.query('SELECT 1 FROM pg_roles WHERE rolname=$1', [input.roleName]);
    const createOrAlter = (exists.rowCount ?? 0) === 0
      ? await c.query("SELECT format('CREATE ROLE %I LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L', $1::text, $2::text) AS statement", [input.roleName, input.password])
      : await c.query("SELECT format('ALTER ROLE %I LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L', $1::text, $2::text) AS statement", [input.roleName, input.password]);
    await c.query(String(createOrAlter.rows[0]?.statement));
    const grant = await c.query("SELECT format('GRANT online_judge_executor TO %I', $1::text) AS statement", [input.roleName]);
    await c.query(String(grant.rows[0]?.statement));
  } finally { c.release(); }
}

const DB_COMPONENT_ENV = ['PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE'] as const;

function nonEmpty(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function invalidDatabaseConfig(code: string): never {
  throw new Error(`database_config_invalid:${code}`);
}

/**
 * Resolves exactly one database target. There are deliberately no localhost or
 * development-password defaults: every test runner must opt in explicitly.
 * Keeping this parser shared prevents pool/checkpointer split-brain.
 */
export function resolveDatabaseConnectionString(o: PoolOverrides = {}): string {
  const explicitUrl = nonEmpty(o.connectionString);
  const url = explicitUrl ?? nonEmpty(process.env.DATABASE_URL);
  const components = {
    host: nonEmpty(o.host) ?? nonEmpty(process.env.PGHOST),
    port: o.port ?? (nonEmpty(process.env.PGPORT) ? Number(process.env.PGPORT) : undefined),
    user: nonEmpty(o.user) ?? nonEmpty(process.env.PGUSER),
    password: o.password ?? process.env.PGPASSWORD,
    database: nonEmpty(o.database) ?? nonEmpty(process.env.PGDATABASE),
  };
  const hasComponents = DB_COMPONENT_ENV.some((name) => nonEmpty(process.env[name]) !== undefined)
    || o.host !== undefined || o.port !== undefined || o.user !== undefined || o.password !== undefined || o.database !== undefined;

  if (url && !explicitUrl && hasComponents) invalidDatabaseConfig('database_url_conflicts_with_pg_components');
  if (url) {
    let parsed: URL;
    try { parsed = new URL(url); } catch { return invalidDatabaseConfig('database_url_malformed'); }
    if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') invalidDatabaseConfig('database_url_protocol');
    if (!parsed.hostname) invalidDatabaseConfig('database_url_host_missing');
    if ((process.env.NODE_ENV ?? '').toLowerCase() === 'production' && isLocalDatabaseHost(parsed.hostname))
      invalidDatabaseConfig('production_local_database_host');
    // TLS policy is expressed through DATABASE_SSL_MODE, never a hidden URL query parameter.
    if (parsed.searchParams.has('sslmode')) invalidDatabaseConfig('database_url_sslmode_not_allowed');
    return parsed.toString();
  }

  if (!components.host || !components.port || !components.user || components.password === undefined || !components.database)
    invalidDatabaseConfig('database_target_missing');
  if (!Number.isInteger(components.port) || components.port < 1 || components.port > 65535)
    invalidDatabaseConfig('database_port_invalid');
  if ((process.env.NODE_ENV ?? '').toLowerCase() === 'production' && isLocalDatabaseHost(components.host))
    invalidDatabaseConfig('production_local_database_host');
  return `postgresql://${encodeURIComponent(components.user)}:${encodeURIComponent(components.password)}@${components.host}:${components.port}/${encodeURIComponent(components.database)}`;
}

/**
 * Rebind a resolved migration target to one narrowly scoped service login.
 *
 * Production migrations deliberately use DATABASE_URL for the privileged
 * migrator and provision separate low-privilege accounts afterwards. Passing
 * `user`/`password` as PoolOverrides would be rejected as URL/component
 * split-brain, so the post-flight verifier must derive an explicit new URL
 * from the already validated target instead. This preserves the host,
 * database, port and approved query parameters while never consulting ambient
 * PGUSER/PGPASSWORD for the service identity.
 */
export function rebindDatabaseLogin(connectionString: string, input: RuntimeLoginInput): string {
  if (!RUNTIME_ROLE_NAME.test(input.roleName)) throw new Error('database_login_rebind_invalid_role_name');
  if (input.password.length < 16 || input.password.length > 1024 || /[\u0000\r\n]/.test(input.password))
    throw new Error('database_login_rebind_invalid_password');
  const resolved = resolveDatabaseConnectionString({ connectionString });
  const target = new URL(resolved);
  target.username = input.roleName;
  target.password = input.password;
  return target.toString();
}

function isLocalDatabaseHost(host: string): boolean {
  const normalized = host.replace(/^\[|\]$/g, '').replace(/\.$/, '').toLowerCase();
  // Production must not silently turn a cloud configuration error into a
  // loopback or link-local data-plane connection. DNS resolution/allowlisting
  // is a deployment concern; literal unsafe targets are rejected here before
  // opening a socket.
  return normalized === 'localhost' || normalized === 'postgres'
    || normalized === '::1' || normalized === '0:0:0:0:0:0:0:1'
    || /^127(?:\.\d{1,3}){3}$/.test(normalized)
    || /^::ffff:127(?:\.\d{1,3}){3}$/.test(normalized)
    || /^169\.254(?:\.\d{1,3}){2}$/.test(normalized)
    || /^fe[89ab][0-9a-f]*:/i.test(normalized);
}

function resolveSsl(o: PoolOverrides): false | { rejectUnauthorized: true; ca?: string; servername?: string } {
  const mode = o.sslMode ?? nonEmpty(process.env.DATABASE_SSL_MODE)
    ?? ((process.env.NODE_ENV ?? '').toLowerCase() === 'production' ? 'verify-full' : 'disable');
  if (mode !== 'disable' && mode !== 'verify-full') invalidDatabaseConfig('database_ssl_mode_invalid');
  if ((process.env.NODE_ENV ?? '').toLowerCase() === 'production' && mode !== 'verify-full')
    invalidDatabaseConfig('production_tls_verify_full_required');
  if (mode === 'disable') return false;
  const caPath = o.sslCaPath ?? nonEmpty(process.env.DATABASE_SSL_CA_PATH);
  if (!caPath) invalidDatabaseConfig('database_ssl_ca_path_missing');
  const servername = o.tlsServerName ?? nonEmpty(process.env.PG_TLS_SERVERNAME);
  if (servername && (/\s/.test(servername) || isLocalDatabaseHost(servername)))
    invalidDatabaseConfig('database_tls_servername_invalid');
  try { return { rejectUnauthorized: true, ca: readFileSync(caPath, 'utf8'), ...(servername ? { servername } : {}) }; }
  catch { return invalidDatabaseConfig('database_ssl_ca_unreadable'); }
}

/** Connection pool factory with explicit, cloud-safe target and TLS resolution. */
export function createPool(o: PoolOverrides = {}): DbPool {
  return new Pool({
    connectionString: resolveDatabaseConnectionString(o),
    ssl: resolveSsl(o),
    // An explicit caller cap is required for singleton resources such as a
    // LISTEN session.  Ambient tuning remains the default for ordinary pools.
    max: Number(o.max ?? process.env.PGPOOL_MAX ?? 20),
    statement_timeout: Number(process.env.PG_STATEMENT_TIMEOUT_MS ?? 15000),
    idle_in_transaction_session_timeout: Number(process.env.PG_IDLE_TX_TIMEOUT_MS ?? 15000),
    connectionTimeoutMillis: Number(process.env.PG_CONN_TIMEOUT_MS ?? 5000),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS ?? 30000),
  });
}

/**
 * Request-path transaction: bind the principal trusted by this application
 * process through `SET LOCAL`.
 *
 * This GUC is a tenant-routing context, not a cryptographic identity root:
 * a party that can run arbitrary SQL with the runtime login can set it too.
 * Destructive SECURITY DEFINER capabilities must therefore use a separately
 * provisioned executor plus a verified authorization assertion, never treat
 * `app.principal_user` alone as proof of user authorization.
 */
export async function asPrincipal<T>(pool: DbPool, user: string, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE app_role');
    await c.query("SELECT set_config('app.principal_user', $1, true)", [user]);
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
}

/**
 * Narrow principal scope for the background privacy eraser.  This cannot be
 * substituted with asPrincipal(): the dedicated login has no app_role grant,
 * and the API login has no privacy_worker_executor grant.
 */
export async function asPrivacyWorkerPrincipal<T>(pool: DbPool, user: string, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE privacy_worker_executor');
    await c.query("SELECT set_config('app.principal_user', $1, true)", [user]);
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
}

/** Execute a reviewed cross-owner dispatch procedure without exposing tables. */
export async function asPrivacyWorkerExecutor<T>(pool: DbPool, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE privacy_worker_executor');
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
}

/**
 * Reject a privacy-erasure worker URL that mounts a migration, runtime, or
 * privacy-owner credential.  The executor can receive only opaque dispatch
 * identifiers through reviewed procedures; direct ledger reads would expose
 * target metadata and collapse the API/worker separation.
 */
export async function assertPrivacyWorkerExecutorIdentity(pool: DbPool): Promise<void> {
  const c = await pool.connect();
  try {
    const result = await c.query(
      `WITH session_role AS (
         SELECT oid,rolsuper,rolbypassrls,rolcreaterole,rolcreatedb,rolinherit,rolreplication
           FROM pg_roles WHERE rolname=session_user
       ), executor_role AS (
         SELECT oid,rolsuper,rolbypassrls,rolcreaterole,rolcreatedb,rolinherit,rolreplication
           FROM pg_roles WHERE rolname='privacy_worker_executor'
       ), expected_worker_function(signature) AS (
         VALUES
           ('privacy_list_claimable_checkpoint_targets(integer)'::text),
           ('privacy_claim_checkpoint_target(uuid,text,integer)'::text),
           ('privacy_purge_checkpoint_target(uuid,uuid)'::text)
       ), forbidden_worker_function(signature) AS (
         VALUES
           ('revoke_checkpoint_thread(text)'::text),
           ('privacy_begin_checkpoint_erasure(text,text)'::text)
       ), expected_function_fact AS (
         SELECT count(proc.oid)::int AS found,
                count(*) FILTER (WHERE has_function_privilege('privacy_worker_executor',proc.oid,'EXECUTE'))::int AS executor_allowed,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1 FROM aclexplode(coalesce(proc.proacl,acldefault('f',proc.proowner))) AS acl
                   WHERE acl.grantee=0 AND acl.privilege_type='EXECUTE'
                ))::int AS public_denied
           FROM expected_worker_function expected
           LEFT JOIN pg_proc proc ON proc.oid=to_regprocedure(expected.signature)
       ), forbidden_function_fact AS (
         SELECT count(proc.oid)::int AS found,
                count(*) FILTER (WHERE NOT has_function_privilege('privacy_worker_executor',proc.oid,'EXECUTE'))::int AS executor_denied,
                count(*) FILTER (WHERE NOT has_function_privilege(session_user,proc.oid,'EXECUTE'))::int AS session_denied,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1 FROM aclexplode(coalesce(proc.proacl,acldefault('f',proc.proowner))) AS acl
                   WHERE acl.grantee=0 AND acl.privilege_type='EXECUTE'
                ))::int AS public_denied
           FROM forbidden_worker_function forbidden
           LEFT JOIN pg_proc proc ON proc.oid=to_regprocedure(forbidden.signature)
       )
       SELECT session_role.rolsuper,session_role.rolbypassrls,session_role.rolcreaterole,session_role.rolcreatedb,session_role.rolinherit,
              executor_role.rolsuper AS executor_super,executor_role.rolbypassrls AS executor_bypass,
              executor_role.rolcreaterole AS executor_createrole,executor_role.rolcreatedb AS executor_createdb,executor_role.rolinherit AS executor_inherit,
              session_role.rolreplication,executor_role.rolreplication AS executor_replication,
              pg_has_role(session_user,'privacy_worker_executor','member') AS executor_member,
              pg_has_role(session_user,'app_role','member') AS app_member,
              pg_has_role(session_user,'app_gateway_role','member') AS gateway_member,
              pg_has_role(session_user,'privacy_worker_owner','member') AS owner_member,
              pg_has_role(session_user,'privacy_api_owner','member') AS api_owner_member,
              pg_has_role(session_user,'qbank_control_executor','member') AS qbank_member,
              pg_has_role(session_user,'rag_control_executor','member') AS rag_member,
              coalesce((SELECT array_agg(parent.rolname ORDER BY parent.rolname)
                FROM pg_auth_members membership JOIN pg_roles parent ON parent.oid=membership.roleid
               WHERE membership.member=session_role.oid), ARRAY[]::text[]) AS session_members,
              coalesce((SELECT array_agg(parent.rolname ORDER BY parent.rolname)
                FROM pg_auth_members membership JOIN pg_roles parent ON parent.oid=membership.roleid
               WHERE membership.member=executor_role.oid), ARRAY[]::text[]) AS executor_members,
              EXISTS (SELECT 1 FROM pg_class cls WHERE cls.relnamespace='public'::regnamespace AND cls.relowner=session_role.oid) AS owns_public_relation,
              EXISTS (SELECT 1 FROM pg_namespace n WHERE n.nspowner=session_role.oid) AS owns_schema,
              EXISTS (SELECT 1 FROM pg_database d WHERE d.datdba=session_role.oid) AS owns_database,
              has_schema_privilege(session_user,'public','CREATE') AS public_create,
              has_database_privilege(session_user,current_database(),'CREATE') AS database_create,
              EXISTS (
                SELECT 1
                  FROM (VALUES
                    ('privacy_erasure_request'::text,'SELECT'::text),
                    ('privacy_erasure_request'::text,'INSERT'::text),
                    ('privacy_erasure_request'::text,'UPDATE'::text),
                    ('privacy_erasure_request'::text,'DELETE'::text),
                    ('privacy_deletion_target'::text,'SELECT'::text),
                    ('privacy_deletion_target'::text,'INSERT'::text),
                    ('privacy_deletion_target'::text,'UPDATE'::text),
                    ('privacy_deletion_target'::text,'DELETE'::text),
                    ('privacy_checkpoint_target'::text,'SELECT'::text),
                    ('privacy_checkpoint_target'::text,'INSERT'::text),
                    ('privacy_checkpoint_target'::text,'UPDATE'::text),
                    ('privacy_checkpoint_target'::text,'DELETE'::text)
                  ) AS privilege_fact(relation_name,privilege_name)
                 WHERE has_table_privilege(session_user,privilege_fact.relation_name,privilege_fact.privilege_name)
              ) AS raw_ledger_privilege,
              expected_function_fact.found AS expected_function_found,
              expected_function_fact.executor_allowed AS expected_function_executor_allowed,
              expected_function_fact.public_denied AS expected_function_public_denied,
              forbidden_function_fact.found AS forbidden_function_found,
              forbidden_function_fact.executor_denied AS forbidden_function_executor_denied,
              forbidden_function_fact.session_denied AS forbidden_function_session_denied,
              forbidden_function_fact.public_denied AS forbidden_function_public_denied
         FROM session_role CROSS JOIN executor_role CROSS JOIN expected_function_fact CROSS JOIN forbidden_function_fact`,
    );
    const row = result.rows[0];
    const roleNames = (value: unknown): string[] => {
      if (Array.isArray(value) && value.every((item) => typeof item === 'string' && /^[a-z][a-z0-9_]{0,62}$/.test(item))) return value;
      if (typeof value === 'string' && /^\{(?:[a-z][a-z0-9_]{0,62}(?:,[a-z][a-z0-9_]{0,62})*)?\}$/.test(value))
        return value === '{}' ? [] : value.slice(1, -1).split(',');
      return ['__invalid_role_membership_shape__'];
    };
    const sessionMembers = roleNames(row?.session_members);
    const executorMembers = roleNames(row?.executor_members);
    if (result.rowCount !== 1 || row?.rolsuper !== false || row?.rolbypassrls !== false
      || row?.rolcreaterole !== false || row?.rolcreatedb !== false || row?.rolinherit !== false
      || row?.executor_super !== false || row?.executor_bypass !== false || row?.executor_createrole !== false
      || row?.executor_createdb !== false || row?.executor_inherit !== false || row?.rolreplication !== false
      || row?.executor_replication !== false || row?.executor_member !== true
      || row?.app_member !== false || row?.gateway_member !== false || row?.owner_member !== false
      || row?.api_owner_member !== false || row?.qbank_member !== false || row?.rag_member !== false
      || sessionMembers.length !== 1 || sessionMembers[0] !== 'privacy_worker_executor'
      || executorMembers.length !== 0 || row?.owns_public_relation !== false || row?.owns_schema !== false
      || row?.owns_database !== false || row?.public_create !== false || row?.database_create !== false
      || row?.raw_ledger_privilege !== false || row?.expected_function_found !== 3
      || row?.expected_function_executor_allowed !== 3 || row?.expected_function_public_denied !== 3
      || row?.forbidden_function_found !== 2 || row?.forbidden_function_executor_denied !== 2
      || row?.forbidden_function_session_denied !== 2 || row?.forbidden_function_public_denied !== 2) {
      throw new Error('privacy_worker_identity_invalid');
    }
  } finally { c.release(); }
}

/**
 * Narrow qbank control scope.  This is intentionally separate from
 * `asPrincipal`: no writable application GUC is consulted to decide whether
 * an operation may ingest approved corpus material, build a generation, or
 * flip the active generation pointer.
 */
export async function asQbankControlExecutor<T>(pool: DbPool, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE qbank_control_executor');
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
}

/**
 * Execute a reviewed generic-RAG control action.  Unlike asPrincipal(), this
 * scope never installs a user-controlled authorization GUC.
 */
export async function asRagControlExecutor<T>(pool: DbPool, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE rag_control_executor');
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
}

/**
 * Fail closed when the RAG control connection is accidentally mounted from a
 * runtime, gateway, privacy, or migration credential.  This checks the live
 * catalog rather than trusting a URL or environment label.
 */
export async function assertRagControlExecutorIdentity(pool: DbPool): Promise<void> {
  const c = await pool.connect();
  try {
    const result = await c.query(
      `WITH RECURSIVE session_role AS (
         SELECT oid,rolsuper,rolbypassrls,rolcreaterole,rolcreatedb,rolinherit,rolreplication
           FROM pg_roles WHERE rolname=session_user
       ), executor_role AS (
         SELECT oid,rolsuper,rolbypassrls,rolcreaterole,rolcreatedb,rolinherit,rolreplication
           FROM pg_roles WHERE rolname='rag_control_executor'
       ), executor_member_closure(oid) AS (
         SELECT membership.member
           FROM pg_auth_members AS membership
          WHERE membership.roleid='rag_control_executor'::regrole
         UNION
         SELECT membership.member
           FROM pg_auth_members AS membership
           JOIN executor_member_closure AS parent ON parent.oid=membership.roleid
       )
       SELECT session_role.rolsuper,session_role.rolbypassrls,session_role.rolcreaterole,session_role.rolcreatedb,session_role.rolinherit,session_role.rolreplication,
              executor_role.rolsuper AS executor_super,executor_role.rolbypassrls AS executor_bypass,
              executor_role.rolcreaterole AS executor_createrole,executor_role.rolcreatedb AS executor_createdb,executor_role.rolinherit AS executor_inherit,executor_role.rolreplication AS executor_replication,
              pg_has_role(session_user,'rag_control_executor','member') AS executor_member,
              pg_has_role(session_user,'app_role','member') AS app_member,
              pg_has_role(session_user,'app_gateway_role','member') AS gateway_member,
              pg_has_role(session_user,'privacy_worker_executor','member') AS privacy_member,
              EXISTS (SELECT 1 FROM pg_auth_members m WHERE m.member=session_role.oid AND m.roleid<>'rag_control_executor'::regrole) AS extra_membership,
              EXISTS (SELECT 1 FROM pg_auth_members m WHERE m.member=executor_role.oid) AS executor_parent_membership,
              (SELECT count(*)::int FROM executor_member_closure closure WHERE closure.oid=session_role.oid) AS executor_session_member_count,
              (SELECT count(*)::int FROM executor_member_closure closure WHERE closure.oid='rag_control_login'::regrole) AS executor_compatibility_member_count,
              (SELECT count(*)::int
                 FROM executor_member_closure closure
                 JOIN pg_roles member_role ON member_role.oid=closure.oid
                WHERE member_role.oid<>session_role.oid AND member_role.rolname<>'rag_control_login') AS executor_unexpected_member_count,
              EXISTS (SELECT 1 FROM pg_class cls WHERE cls.relnamespace='public'::regnamespace AND cls.relowner=session_role.oid) AS owns_public_relation,
              EXISTS (SELECT 1 FROM pg_namespace n WHERE n.nspowner=session_role.oid) AS owns_schema,
              has_schema_privilege(session_user,'public','CREATE') AS public_create
         FROM session_role CROSS JOIN executor_role`,
    );
    const row = result.rows[0];
    if (result.rowCount !== 1 || row?.rolsuper !== false || row?.rolbypassrls !== false || row?.rolcreaterole !== false
      || row?.rolcreatedb !== false || row?.rolinherit !== false || row?.executor_super !== false || row?.executor_bypass !== false
      || row?.rolreplication !== false || row?.executor_createrole !== false || row?.executor_createdb !== false || row?.executor_inherit !== false || row?.executor_replication !== false
      || row?.executor_member !== true || row?.app_member !== false || row?.gateway_member !== false || row?.privacy_member !== false
      || row?.extra_membership !== false || row?.executor_parent_membership !== false
      || row?.executor_session_member_count !== 1 || row?.executor_compatibility_member_count !== 1 || row?.executor_unexpected_member_count !== 0
      || row?.owns_public_relation !== false || row?.owns_schema !== false || row?.public_create !== false) {
      throw new Error('rag_control_identity_invalid');
    }
  } finally { c.release(); }
}

/**
 * Verify the two immutable RAG function manifests and their data owners.
 * A request process must never silently continue when a migration owner or a
 * login role owns a SECURITY DEFINER function under FORCE RLS.
 */
export async function assertRagControlDefinerOwnership(pool: DbPool): Promise<void> {
  const c = await pool.connect();
  try {
    // The control login is NOINHERIT.  Entering only the reviewed executor
    // role lets this catalog gate resolve the isolated schemas without
    // granting the login direct table/function privileges.  The migration CLI
    // performs this same check through a freshly provisioned control login,
    // never by granting the migration identity this capability.
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE rag_control_executor');
    const result = await c.query(
      `WITH expected_control(signature) AS (VALUES
           ('rag_control.rag_control_begin_request(text,text,text,bigint)'::text),
           ('rag_control.rag_mark_request_dispatching(text,text,text)'::text),
           ('rag_control.rag_bind_generation_dispatch_request(text,text)'::text),
           ('rag_control.rag_bind_rebuild_dispatch_request(text,text)'::text),
           ('rag_control.rag_settle_request_dispatch(text,text,text)'::text),
           ('rag_control.rag_record_reconciliation_receipt(text,text,text,text,text,text)'::text),
           ('rag_control.rag_terminalize_unknown_generation(text,text,text)'::text),
           ('rag_control.rag_terminalize_unknown_rebuild_run(text,text,text)'::text),
           ('rag_control.rag_control_input_digest(text,jsonb)'::text),
           ('rag_control.rag_claim_request_input(text,text,text)'::text),
           ('rag_control.rag_succeed_request(text,text,text)'::text),
           ('rag_control.rag_register_global_document(text,text,text)'::text),
           ('rag_control.rag_control_publish_global_document_version(text,text,text,text,text,text,jsonb,jsonb)'::text),
           ('rag_control.rag_register_embedding_recipe(text,text,text,text,text,text,integer,text,text,text,text,jsonb)'::text),
           ('rag_control.rag_register_release_policy(text,text,integer,integer,integer,integer)'::text),
           ('rag_control.rag_start_generation(text,text,text,text)'::text),
           ('rag_control.rag_prepare_generation_storage(text,text)'::text),
           ('rag_control.rag_insert_generation_vector(text,text,text,public.vector)'::text),
           ('rag_control.rag_validate_generation(text,text)'::text),
           ('rag_control.rag_record_shadow_evaluation(text,text,text,integer,numeric,numeric,numeric,numeric,numeric,numeric)'::text),
           ('rag_control.rag_gate_generation(text,text,text)'::text),
           ('rag_control.rag_advance_rollout(text,text,integer)'::text),
           ('rag_control.rag_promote_generation(text,text,text)'::text),
           ('rag_control.rag_rollback_generation(text,text,text)'::text),
           ('rag_control.rag_create_rebuild_run(text,text,text,timestamptz,integer)'::text),
           ('rag_control.rag_claim_rebuild_run(text,text,integer)'::text),
           ('rag_control.rag_heartbeat_rebuild_run(text,text,integer,jsonb)'::text)
       ), control_fact AS (
         SELECT count(proc.oid)::int AS found,count(*) FILTER (WHERE proc.prosecdef AND ns.nspname='rag_control')::int AS secured,
                count(DISTINCT proc.proowner)::int AS owners,min(proc.proowner)::oid AS owner_oid,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1 FROM aclexplode(coalesce(proc.proacl, acldefault('f', proc.proowner))) AS acl
                   WHERE acl.grantee=0 AND acl.privilege_type='EXECUTE'
                ))::int AS public_denied,
                count(*) FILTER (WHERE NOT has_function_privilege('app_role',proc.oid,'EXECUTE'))::int AS app_role_denied,
                count(*) FILTER (WHERE proc.proconfig=ARRAY['search_path=pg_catalog, rag_control, pg_temp'])::int AS safe_search_path
           FROM expected_control e LEFT JOIN pg_proc proc ON proc.oid=to_regprocedure(e.signature)
           LEFT JOIN pg_namespace ns ON ns.oid=proc.pronamespace
       ), control_acl_fact AS (
         SELECT count(*) FILTER (WHERE EXISTS (
                  SELECT 1
                    FROM aclexplode(coalesce(proc.proacl, acldefault('f',proc.proowner))) AS acl
                   WHERE acl.privilege_type='EXECUTE'
                     AND acl.grantee NOT IN (proc.proowner, 'rag_control_executor'::regrole::oid)
                ))::int AS unexpected_execute_grants
           FROM expected_control e
           JOIN pg_proc proc ON proc.oid=to_regprocedure(e.signature)
       ), control_schema_acl_fact AS (
         SELECT bool_or(acl.grantee='rag_control_executor'::regrole::oid) AS executor_usage,
                bool_or(acl.grantee='rag_runtime_definer'::regrole::oid) AS runtime_definer_usage,
                count(*) FILTER (WHERE acl.grantee NOT IN (
                  control_schema.nspowner,
                  'rag_control_executor'::regrole::oid,
                  'rag_runtime_definer'::regrole::oid
                ))::int AS unexpected_usage_grants
           FROM pg_namespace AS control_schema
           CROSS JOIN LATERAL aclexplode(coalesce(control_schema.nspacl, acldefault('n',control_schema.nspowner))) AS acl
          WHERE control_schema.nspname='rag_control' AND acl.privilege_type='USAGE'
       ), expected_runtime(signature) AS (VALUES
           ('rag_runtime.rag_register_private_document(text,text)'::text),
           ('rag_runtime.rag_publish_private_document_version(text,text,text,text,text,jsonb,jsonb)'::text),
           ('rag_runtime.rag_bind_query(text,text,integer)'::text),
           ('rag_runtime.rag_resolve_query_binding(text)'::text),
           ('rag_runtime.rag_search_bound(text,public.vector,integer)'::text),
           ('rag_runtime.rag_evidence_bound(text,text[],integer)'::text),
           ('rag_runtime.rag_record_citation(text,text,text)'::text),
           ('rag_runtime.rag_tombstone_private_document(text,text)'::text)
       ), runtime_fact AS (
         SELECT count(proc.oid)::int AS found,count(*) FILTER (WHERE proc.prosecdef AND ns.nspname='rag_runtime')::int AS secured,
                count(DISTINCT proc.proowner)::int AS owners,min(proc.proowner)::oid AS owner_oid,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1 FROM aclexplode(coalesce(proc.proacl, acldefault('f', proc.proowner))) AS acl
                   WHERE acl.grantee=0 AND acl.privilege_type='EXECUTE'
                ))::int AS public_denied,
                count(*) FILTER (WHERE has_function_privilege('app_role',proc.oid,'EXECUTE'))::int AS app_role_allowed,
                count(*) FILTER (WHERE proc.proconfig=ARRAY['search_path=pg_catalog, rag_runtime, pg_temp'])::int AS safe_search_path
           FROM expected_runtime e LEFT JOIN pg_proc proc ON proc.oid=to_regprocedure(e.signature)
           LEFT JOIN pg_namespace ns ON ns.oid=proc.pronamespace
       ), expected_table(name) AS (VALUES
           ('public.rag_corpus_epoch'::text),('public.rag_corpus_document'::text),('public.rag_corpus_content_version'::text),
           ('public.rag_corpus_chunk'::text),('public.rag_corpus_tombstone'::text),('public.rag_embedding_recipe'::text),
           ('public.rag_release_policy'::text),('public.rag_embedding_generation'::text),('public.rag_generation_member'::text),
           ('public.rag_active_generation'::text),('public.rag_rebuild_run'::text),('public.rag_shadow_evaluation'::text),
           ('public.rag_generation_rollout'::text),('public.rag_query_binding'::text),('public.rag_citation'::text),
           ('public.rag_control_request'::text),('public.rag_control_dispatch_attempt'::text),('public.rag_control_dispatch_subject'::text),('public.rag_global_document_provenance'::text),
           ('public.rag_reconciliation_receipt'::text),('public.rag_control_request_input_binding'::text),
           ('public.rag_generation_integrity_quarantine'::text),('public.rag_cache_epoch'::text),('public.rag_cache_invalidation_outbox'::text),
           ('public.rag_generation_release_event'::text)
       ), table_fact AS (
         SELECT count(cls.oid)::int AS found,count(*) FILTER (WHERE cls.relrowsecurity AND cls.relforcerowsecurity)::int AS forced,
                count(DISTINCT cls.relowner)::int AS owners,min(cls.relowner)::oid AS owner_oid
           FROM expected_table e LEFT JOIN pg_class cls ON cls.oid=to_regclass(e.name)
       ), dynamic_vector_fact AS (
         SELECT count(cls.oid)::int AS found,
                count(*) FILTER (WHERE cls.relowner='rag_control_definer'::regrole AND cls.relrowsecurity AND cls.relforcerowsecurity)::int AS hardened,
                count(*) FILTER (WHERE NOT has_table_privilege('app_role',cls.oid,'SELECT,INSERT,UPDATE,DELETE'))::int AS app_denied,
                count(*) FILTER (WHERE
                  (
                    (SELECT count(*) FROM pg_policy policy WHERE policy.polrelid=cls.oid)=1
                    AND EXISTS (
                      SELECT 1 FROM pg_policy policy
                       WHERE policy.polrelid=cls.oid
                         AND policy.polname='p073_legacy_quarantined_control'
                         AND policy.polcmd='*'
                         AND policy.polroles=ARRAY['rag_control_definer'::regrole::oid]
                         AND pg_get_expr(policy.polqual,policy.polrelid)='true'
                         AND pg_get_expr(policy.polwithcheck,policy.polrelid)='true'
                    )
                  )
                  OR (
                    (SELECT count(*) FROM pg_policy policy WHERE policy.polrelid=cls.oid)=3
                    AND EXISTS (
                      SELECT 1 FROM pg_policy policy
                       WHERE policy.polrelid=cls.oid
                         AND policy.polname=format('p_%s_control_all',cls.relname)
                         AND policy.polcmd='*'
                         AND policy.polroles=ARRAY['rag_control_definer'::regrole::oid]
                         AND pg_get_expr(policy.polqual,policy.polrelid)='true'
                         AND pg_get_expr(policy.polwithcheck,policy.polrelid)='true'
                    )
                    AND EXISTS (
                      SELECT 1 FROM pg_policy policy
                       WHERE policy.polrelid=cls.oid
                         AND policy.polname=format('p_%s_runtime_read',cls.relname)
                         AND policy.polcmd='r'
                         AND policy.polroles=ARRAY['rag_runtime_definer'::regrole::oid]
                         AND policy.polqual IS NOT NULL AND policy.polwithcheck IS NULL
                    )
                    AND EXISTS (
                      SELECT 1 FROM pg_policy policy
                       WHERE policy.polrelid=cls.oid
                         AND policy.polname=format('p_%s_runtime_delete',cls.relname)
                         AND policy.polcmd='d'
                         AND policy.polroles=ARRAY['rag_runtime_definer'::regrole::oid]
                         AND policy.polqual IS NOT NULL AND policy.polwithcheck IS NULL
                    )
                  )
                )::int AS policy_hardened
           FROM pg_class cls
           JOIN pg_namespace ns ON ns.oid=cls.relnamespace
          WHERE ns.nspname='rag_control' AND cls.relkind='r' AND cls.relname ~ '^rag_vector_[0-9a-f]{32}$'
       ), unexpected_control_definer AS (
         SELECT count(proc.oid)::int AS found
           FROM pg_proc proc JOIN pg_namespace ns ON ns.oid=proc.pronamespace
          WHERE ns.nspname='rag_control' AND proc.prosecdef
            AND NOT EXISTS (SELECT 1 FROM expected_control e WHERE proc.oid=to_regprocedure(e.signature))
       ), unexpected_runtime_definer AS (
         SELECT count(proc.oid)::int AS found
           FROM pg_proc proc JOIN pg_namespace ns ON ns.oid=proc.pronamespace
          WHERE ns.nspname='rag_runtime' AND proc.prosecdef
            AND NOT EXISTS (SELECT 1 FROM expected_runtime e WHERE proc.oid=to_regprocedure(e.signature))
       ), default_function_acl AS (
         SELECT count(role_name)::int AS found,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1 FROM aclexplode(coalesce(acl.defaclacl,acldefault('f',role.oid))) AS item
                   WHERE item.grantee=0 AND item.privilege_type='EXECUTE'
                ))::int AS public_denied
           FROM (VALUES ('rag_control_definer'::name),('rag_runtime_definer'::name)) AS expected(role_name)
           JOIN pg_roles role ON role.rolname=expected.role_name
           LEFT JOIN pg_default_acl acl ON acl.defaclrole=role.oid AND acl.defaclnamespace=0 AND acl.defaclobjtype='f'
       )
       SELECT control_fact.found AS control_found,control_fact.secured AS control_secured,control_fact.owners AS control_owners,control_fact.public_denied AS control_public_denied,control_fact.app_role_denied AS control_app_role_denied,control_fact.safe_search_path AS control_safe_search_path,
              control_acl_fact.unexpected_execute_grants AS control_unexpected_execute_grants,
              control_schema_acl_fact.executor_usage AS control_executor_schema_usage,control_schema_acl_fact.runtime_definer_usage AS control_runtime_definer_schema_usage,control_schema_acl_fact.unexpected_usage_grants AS control_unexpected_schema_usage_grants,
              runtime_fact.found AS runtime_found,runtime_fact.secured AS runtime_secured,runtime_fact.owners AS runtime_owners,runtime_fact.public_denied AS runtime_public_denied,runtime_fact.app_role_allowed AS runtime_app_role_allowed,runtime_fact.safe_search_path AS runtime_safe_search_path,
              table_fact.found AS table_found,table_fact.forced AS table_forced,table_fact.owners AS table_owners,
              dynamic_vector_fact.found AS dynamic_vector_found,dynamic_vector_fact.hardened AS dynamic_vector_hardened,dynamic_vector_fact.app_denied AS dynamic_vector_app_denied,dynamic_vector_fact.policy_hardened AS dynamic_vector_policy_hardened,
              unexpected_control_definer.found AS unexpected_control_definer_count,unexpected_runtime_definer.found AS unexpected_runtime_definer_count,
              default_function_acl.found AS default_function_acl_found,default_function_acl.public_denied AS default_function_acl_public_denied,
              cowner.rolname AS control_owner_name,cowner.rolcanlogin AS control_login,cowner.rolsuper AS control_super,cowner.rolbypassrls AS control_bypass,
              cowner.rolinherit AS control_inherit,cowner.rolcreaterole AS control_createrole,cowner.rolcreatedb AS control_createdb,
              EXISTS (SELECT 1 FROM pg_auth_members m WHERE m.member=cowner.oid) AS control_member,
              rowner.rolname AS runtime_owner_name,rowner.rolcanlogin AS runtime_login,rowner.rolsuper AS runtime_super,rowner.rolbypassrls AS runtime_bypass,
              rowner.rolinherit AS runtime_inherit,rowner.rolcreaterole AS runtime_createrole,rowner.rolcreatedb AS runtime_createdb,
              EXISTS (SELECT 1 FROM pg_auth_members m WHERE m.member=rowner.oid) AS runtime_member,
              has_schema_privilege('rag_control_definer','rag_control','CREATE') AS control_schema_create,
              has_schema_privilege('rag_runtime_definer','rag_control','CREATE') AS runtime_control_create,
              has_schema_privilege('rag_control_executor','rag_control','CREATE') AS executor_control_create,
              has_schema_privilege('app_role','rag_control','USAGE') AS app_control_schema_usage,
              has_schema_privilege('app_role','rag_runtime','USAGE') AS app_runtime_schema_usage
         FROM control_fact CROSS JOIN control_acl_fact CROSS JOIN control_schema_acl_fact CROSS JOIN runtime_fact CROSS JOIN table_fact CROSS JOIN dynamic_vector_fact CROSS JOIN unexpected_control_definer CROSS JOIN unexpected_runtime_definer CROSS JOIN default_function_acl
         LEFT JOIN pg_roles cowner ON cowner.oid=control_fact.owner_oid
         LEFT JOIN pg_roles rowner ON rowner.oid=runtime_fact.owner_oid
        WHERE table_fact.owner_oid=control_fact.owner_oid`,
    );
    const row = result.rows[0];
    if (result.rowCount !== 1 || row?.control_found !== 27 || row?.control_secured !== 27 || row?.control_owners !== 1 || row?.control_public_denied !== 27 || row?.control_app_role_denied !== 27 || row?.control_safe_search_path !== 27
      || row?.control_unexpected_execute_grants !== 0 || row?.control_executor_schema_usage !== true || row?.control_runtime_definer_schema_usage !== true || row?.control_unexpected_schema_usage_grants !== 0
      || row?.runtime_found !== 8 || row?.runtime_secured !== 8 || row?.runtime_owners !== 1 || row?.runtime_public_denied !== 8 || row?.runtime_app_role_allowed !== 8 || row?.runtime_safe_search_path !== 8
      || row?.table_found !== 25 || row?.table_forced !== 25 || row?.table_owners !== 1
      || row?.dynamic_vector_found !== row?.dynamic_vector_hardened || row?.dynamic_vector_found !== row?.dynamic_vector_app_denied || row?.dynamic_vector_found !== row?.dynamic_vector_policy_hardened
      || row?.unexpected_control_definer_count !== 0 || row?.unexpected_runtime_definer_count !== 0
      || row?.default_function_acl_found !== 2 || row?.default_function_acl_public_denied !== 2
      || row?.control_owner_name !== 'rag_control_definer' || row?.control_login !== false || row?.control_super !== false || row?.control_bypass !== false
      || row?.control_inherit !== false || row?.control_createrole !== false || row?.control_createdb !== false || row?.control_member !== false
      || row?.runtime_owner_name !== 'rag_runtime_definer' || row?.runtime_login !== false || row?.runtime_super !== false || row?.runtime_bypass !== false
      || row?.runtime_inherit !== false || row?.runtime_createrole !== false || row?.runtime_createdb !== false || row?.runtime_member !== false
      || row?.control_schema_create !== true || row?.runtime_control_create !== false || row?.executor_control_create !== false
      || row?.app_control_schema_usage !== false || row?.app_runtime_schema_usage !== true) {
      throw new Error('rag_control_definer_ownership_invalid');
    }
    await c.query('COMMIT');
  } catch (error) {
    await c.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally { c.release(); }
}

/**
 * Reject a mis-mounted qbank control URL before a worker can perform any
 * rebuild.  A migration owner/superuser could SET ROLE to the executor too,
 * which would silently collapse the control-plane boundary if an operator put
 * the wrong secret in QBANK_CONTROL_DATABASE_URL.
 */
export async function assertQbankControlExecutorIdentity(pool: DbPool): Promise<void> {
  const c = await pool.connect();
  try {
    const result = await c.query(
      `WITH session_role AS (
         SELECT oid, rolsuper, rolbypassrls, rolcreaterole, rolcreatedb, rolinherit
           FROM pg_roles WHERE rolname=session_user
       ), executor_role AS (
         SELECT oid, rolsuper, rolbypassrls, rolcreaterole, rolcreatedb, rolinherit
           FROM pg_roles WHERE rolname='qbank_control_executor'
       )
       SELECT session_role.rolsuper, session_role.rolbypassrls, session_role.rolcreaterole, session_role.rolcreatedb, session_role.rolinherit,
              executor_role.rolsuper AS executor_super, executor_role.rolbypassrls AS executor_bypassrls,
              executor_role.rolcreaterole AS executor_createrole, executor_role.rolcreatedb AS executor_createdb,
              executor_role.rolinherit AS executor_inherit,
              pg_has_role(session_user, 'qbank_control_executor', 'member') AS control_member,
              pg_has_role(session_user, 'app_role', 'member') AS app_member,
              pg_has_role(session_user, 'app_gateway_role', 'member') AS gateway_member,
              coalesce((SELECT array_agg(parent.rolname ORDER BY parent.rolname)
                FROM pg_auth_members membership JOIN pg_roles parent ON parent.oid=membership.roleid
               WHERE membership.member=session_role.oid), ARRAY[]::text[]) AS session_members,
              coalesce((SELECT array_agg(parent.rolname ORDER BY parent.rolname)
                FROM pg_auth_members membership JOIN pg_roles parent ON parent.oid=membership.roleid
               WHERE membership.member=executor_role.oid), ARRAY[]::text[]) AS executor_members,
              EXISTS (
                SELECT 1 FROM pg_class cls
                 WHERE cls.relnamespace='public'::regnamespace AND cls.relowner=session_role.oid
              ) AS owns_public_relation,
              EXISTS (SELECT 1 FROM pg_namespace n WHERE n.nspowner=session_role.oid) AS owns_schema,
              EXISTS (SELECT 1 FROM pg_database d WHERE d.datdba=session_role.oid) AS owns_database,
              has_schema_privilege(session_user, 'public', 'CREATE') AS can_create_public,
              has_database_privilege(session_user, current_database(), 'CREATE') AS can_create_database
         FROM session_role CROSS JOIN executor_role`,
    );
    const row = result.rows[0];
    // node-postgres normally parses text[] as string[], but an aggregate may
    // arrive as PostgreSQL's `{role}` wire text depending on server/type
    // settings. Role names are constrained identifiers here, so this small
    // parser is deliberately fail-closed for any unexpected representation.
    const roleNames = (value: unknown): string[] => {
      if (Array.isArray(value) && value.every((item) => typeof item === 'string' && /^[a-z][a-z0-9_]{0,62}$/.test(item))) return value;
      if (typeof value === 'string' && /^\{(?:[a-z][a-z0-9_]{0,62}(?:,[a-z][a-z0-9_]{0,62})*)?\}$/.test(value)) {
        return value === '{}' ? [] : value.slice(1, -1).split(',');
      }
      return ['__invalid_role_membership_shape__'];
    };
    const sessionMembers = roleNames(row?.session_members);
    const executorMembers = roleNames(row?.executor_members);
    if (result.rowCount !== 1 || row?.rolsuper !== false || row?.rolbypassrls !== false
      || row?.rolcreaterole !== false || row?.rolcreatedb !== false || row?.rolinherit !== false
      || row?.executor_super !== false || row?.executor_bypassrls !== false
      || row?.executor_createrole !== false || row?.executor_createdb !== false || row?.executor_inherit !== false
      || row?.control_member !== true || row?.app_member !== false || row?.gateway_member !== false
      || sessionMembers.length !== 1 || sessionMembers[0] !== 'qbank_control_executor'
      || executorMembers.length !== 0 || row?.owns_public_relation !== false || row?.owns_schema !== false
      || row?.owns_database !== false || row?.can_create_public !== false || row?.can_create_database !== false) {
      throw new Error('qbank_control_identity_invalid');
    }
  } finally { c.release(); }
}

/**
 * The generation/artifact transition functions and the bounded complete
 * question reader run as SECURITY DEFINER so the control executor never
 * receives CREATE or raw table ownership.  That only
 * remains safe when their shared definer is an isolated, non-login role: a
 * migration superuser, a runtime login, or a role that another login can
 * SET ROLE into would silently turn the RLS policy in migration 0070 into a
 * privilege bypass.
 *
 * This is intentionally a catalog-only startup gate.  It neither repairs
 * ownership nor trusts a configuration string; an operator must provision a
 * dedicated owner and transfer the exact functions/tables before enabling a
 * governed QBank rebuild.
 */
export async function assertQbankControlDefinerOwnership(pool: DbPool): Promise<void> {
  const c = await pool.connect();
  try {
    const result = await c.query(
      `WITH expected_function(signature, requires_security_definer, allow_app_role_execute, allow_executor_execute) AS (
         SELECT manifest.signature, manifest.requires_security_definer,
                manifest.allow_app_role_execute, manifest.allow_executor_execute
           FROM jsonb_to_recordset($1::jsonb) AS manifest(
             signature text,
             requires_security_definer boolean,
             allow_app_role_execute boolean,
             allow_executor_execute boolean
           )
       ), function_fact AS (
         SELECT count(proc.oid)::int AS found_count,
                count(*) FILTER (WHERE expected.requires_security_definer AND proc.prosecdef AND namespace.nspname='public')::int AS security_definer_count,
                count(*) FILTER (WHERE NOT expected.requires_security_definer AND NOT proc.prosecdef AND namespace.nspname='public')::int AS invoker_helper_count,
                count(DISTINCT proc.proowner)::int AS owner_count,
                min(proc.proowner)::oid AS owner_oid
           FROM expected_function expected
           LEFT JOIN pg_proc proc ON proc.oid=to_regprocedure(expected.signature)
           LEFT JOIN pg_namespace namespace ON namespace.oid=proc.pronamespace
       ), function_acl_fact AS (
         SELECT count(proc.oid)::int AS found_count,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1
                    FROM aclexplode(coalesce(proc.proacl, acldefault('f', proc.proowner))) AS privilege
                   WHERE privilege.grantee=0 AND privilege.privilege_type='EXECUTE'
                ))::int AS public_denied_count,
                count(*) FILTER (WHERE has_function_privilege('app_role'::regrole, proc.oid, 'EXECUTE')=expected.allow_app_role_execute)::int AS app_role_match_count,
                count(*) FILTER (WHERE has_function_privilege('qbank_control_executor'::regrole, proc.oid, 'EXECUTE')=expected.allow_executor_execute)::int AS executor_match_count,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1
                    FROM aclexplode(coalesce(proc.proacl, acldefault('f', proc.proowner))) AS privilege
                   WHERE privilege.privilege_type='EXECUTE'
                     AND privilege.grantee NOT IN (0, proc.proowner, 'app_role'::regrole::oid, 'qbank_control_executor'::regrole::oid)
                ))::int AS grantee_allowlist_count
           FROM expected_function expected
           LEFT JOIN pg_proc proc ON proc.oid=to_regprocedure(expected.signature)
       ), expected_table(name, app_privileges, executor_privileges) AS (
         SELECT manifest.name, manifest.app_privileges, manifest.executor_privileges
           FROM jsonb_to_recordset($2::jsonb) AS manifest(
             name text,
             app_privileges text[],
             executor_privileges text[]
           )
       ), table_fact AS (
         SELECT count(cls.oid)::int AS found_count,
                count(*) FILTER (WHERE cls.relkind IN ('r','p') AND cls.relrowsecurity AND cls.relforcerowsecurity)::int AS forced_rls_count,
                count(DISTINCT cls.relowner)::int AS owner_count,
                min(cls.relowner)::oid AS owner_oid
           FROM expected_table expected
           LEFT JOIN pg_class cls ON cls.oid=to_regclass(expected.name)
       ), table_acl_fact AS (
         SELECT count(cls.oid)::int AS found_count,
                count(*) FILTER (WHERE
                  has_table_privilege('app_role'::regrole, cls.oid, 'SELECT')=('SELECT'=ANY(expected.app_privileges))
                  AND has_table_privilege('app_role'::regrole, cls.oid, 'INSERT')=('INSERT'=ANY(expected.app_privileges))
                  AND has_table_privilege('app_role'::regrole, cls.oid, 'UPDATE')=('UPDATE'=ANY(expected.app_privileges))
                  AND has_table_privilege('app_role'::regrole, cls.oid, 'DELETE')=('DELETE'=ANY(expected.app_privileges))
                  AND has_table_privilege('app_role'::regrole, cls.oid, 'TRUNCATE')=('TRUNCATE'=ANY(expected.app_privileges))
                  AND has_table_privilege('app_role'::regrole, cls.oid, 'REFERENCES')=('REFERENCES'=ANY(expected.app_privileges))
                  AND has_table_privilege('app_role'::regrole, cls.oid, 'TRIGGER')=('TRIGGER'=ANY(expected.app_privileges))
                )::int AS app_role_match_count,
                count(*) FILTER (WHERE
                  has_table_privilege('qbank_control_executor'::regrole, cls.oid, 'SELECT')=('SELECT'=ANY(expected.executor_privileges))
                  AND has_table_privilege('qbank_control_executor'::regrole, cls.oid, 'INSERT')=('INSERT'=ANY(expected.executor_privileges))
                  AND has_table_privilege('qbank_control_executor'::regrole, cls.oid, 'UPDATE')=('UPDATE'=ANY(expected.executor_privileges))
                  AND has_table_privilege('qbank_control_executor'::regrole, cls.oid, 'DELETE')=('DELETE'=ANY(expected.executor_privileges))
                  AND has_table_privilege('qbank_control_executor'::regrole, cls.oid, 'TRUNCATE')=('TRUNCATE'=ANY(expected.executor_privileges))
                  AND has_table_privilege('qbank_control_executor'::regrole, cls.oid, 'REFERENCES')=('REFERENCES'=ANY(expected.executor_privileges))
                  AND has_table_privilege('qbank_control_executor'::regrole, cls.oid, 'TRIGGER')=('TRIGGER'=ANY(expected.executor_privileges))
                )::int AS executor_match_count,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1
                    FROM aclexplode(coalesce(cls.relacl, acldefault('r', cls.relowner))) AS privilege
                   WHERE privilege.grantee=0
                ))::int AS public_denied_count,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1
                    FROM aclexplode(coalesce(cls.relacl, acldefault('r', cls.relowner))) AS privilege
                   WHERE privilege.grantee NOT IN (cls.relowner, 'app_role'::regrole::oid, 'qbank_control_executor'::regrole::oid)
                ))::int AS grantee_allowlist_count
           FROM expected_table expected
           LEFT JOIN pg_class cls ON cls.oid=to_regclass(expected.name)
       ), table_column_acl_fact AS (
         SELECT count(cls.oid)::int AS found_count,
                count(*) FILTER (WHERE
                  has_any_column_privilege('app_role'::regrole, cls.oid, 'SELECT')=('SELECT'=ANY(expected.app_privileges))
                  AND has_any_column_privilege('app_role'::regrole, cls.oid, 'INSERT')=('INSERT'=ANY(expected.app_privileges))
                  AND has_any_column_privilege('app_role'::regrole, cls.oid, 'UPDATE')=('UPDATE'=ANY(expected.app_privileges))
                  AND has_any_column_privilege('app_role'::regrole, cls.oid, 'REFERENCES')=('REFERENCES'=ANY(expected.app_privileges))
                )::int AS app_role_match_count,
                count(*) FILTER (WHERE
                  has_any_column_privilege('qbank_control_executor'::regrole, cls.oid, 'SELECT')=('SELECT'=ANY(expected.executor_privileges))
                  AND has_any_column_privilege('qbank_control_executor'::regrole, cls.oid, 'INSERT')=('INSERT'=ANY(expected.executor_privileges))
                  AND has_any_column_privilege('qbank_control_executor'::regrole, cls.oid, 'UPDATE')=('UPDATE'=ANY(expected.executor_privileges))
                  AND has_any_column_privilege('qbank_control_executor'::regrole, cls.oid, 'REFERENCES')=('REFERENCES'=ANY(expected.executor_privileges))
                )::int AS executor_match_count,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1
                    FROM pg_attribute attribute
                    CROSS JOIN LATERAL aclexplode(attribute.attacl) AS privilege
                   WHERE attribute.attrelid=cls.oid
                     AND attribute.attnum > 0 AND NOT attribute.attisdropped
                     AND attribute.attacl IS NOT NULL
                     AND privilege.grantee=0
                ))::int AS public_denied_count,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1
                    FROM pg_attribute attribute
                    CROSS JOIN LATERAL aclexplode(attribute.attacl) AS privilege
                   WHERE attribute.attrelid=cls.oid
                     AND attribute.attnum > 0 AND NOT attribute.attisdropped
                     AND attribute.attacl IS NOT NULL
                     AND privilege.grantee <> cls.relowner
                ))::int AS owner_only_count
           FROM expected_table expected
           LEFT JOIN pg_class cls ON cls.oid=to_regclass(expected.name)
       ), partition_descendant(oid) AS (
         SELECT inheritance.inhrelid
           FROM pg_inherits inheritance
          WHERE inheritance.inhparent='qbank_generation_chunk'::regclass
         UNION
         SELECT inheritance.inhrelid
           FROM pg_inherits inheritance
           JOIN partition_descendant parent ON parent.oid=inheritance.inhparent
       ), partition_fact AS (
         SELECT count(partition_relation.oid)::int AS found_count,
                count(*) FILTER (WHERE partition_relation.relowner=$3::regrole)::int AS owner_count,
                count(*) FILTER (WHERE NOT has_table_privilege('app_role'::regrole, partition_relation.oid, 'SELECT')
                  AND NOT has_table_privilege('app_role'::regrole, partition_relation.oid, 'INSERT')
                  AND NOT has_table_privilege('app_role'::regrole, partition_relation.oid, 'UPDATE')
                  AND NOT has_table_privilege('app_role'::regrole, partition_relation.oid, 'DELETE')
                  AND NOT has_table_privilege('app_role'::regrole, partition_relation.oid, 'TRUNCATE')
                  AND NOT has_table_privilege('app_role'::regrole, partition_relation.oid, 'REFERENCES')
                  AND NOT has_table_privilege('app_role'::regrole, partition_relation.oid, 'TRIGGER'))::int AS app_role_denied_count,
                count(*) FILTER (WHERE NOT has_table_privilege('qbank_control_executor'::regrole, partition_relation.oid, 'SELECT')
                  AND NOT has_table_privilege('qbank_control_executor'::regrole, partition_relation.oid, 'INSERT')
                  AND NOT has_table_privilege('qbank_control_executor'::regrole, partition_relation.oid, 'UPDATE')
                  AND NOT has_table_privilege('qbank_control_executor'::regrole, partition_relation.oid, 'DELETE')
                  AND NOT has_table_privilege('qbank_control_executor'::regrole, partition_relation.oid, 'TRUNCATE')
                  AND NOT has_table_privilege('qbank_control_executor'::regrole, partition_relation.oid, 'REFERENCES')
                  AND NOT has_table_privilege('qbank_control_executor'::regrole, partition_relation.oid, 'TRIGGER'))::int AS executor_denied_count,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1
                    FROM aclexplode(coalesce(partition_relation.relacl, acldefault('r', partition_relation.relowner))) AS privilege
                   WHERE privilege.grantee=0
                ))::int AS public_denied_count,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1
                    FROM aclexplode(coalesce(partition_relation.relacl, acldefault('r', partition_relation.relowner))) AS privilege
                   WHERE privilege.grantee <> partition_relation.relowner
                ))::int AS grantee_allowlist_count
           FROM partition_descendant descendant
           JOIN pg_class partition_relation ON partition_relation.oid=descendant.oid
       ), partition_column_acl_fact AS (
         SELECT count(partition_relation.oid)::int AS found_count,
                count(*) FILTER (WHERE NOT has_any_column_privilege('app_role'::regrole, partition_relation.oid, 'SELECT')
                  AND NOT has_any_column_privilege('app_role'::regrole, partition_relation.oid, 'INSERT')
                  AND NOT has_any_column_privilege('app_role'::regrole, partition_relation.oid, 'UPDATE')
                  AND NOT has_any_column_privilege('app_role'::regrole, partition_relation.oid, 'REFERENCES'))::int AS app_role_denied_count,
                count(*) FILTER (WHERE NOT has_any_column_privilege('qbank_control_executor'::regrole, partition_relation.oid, 'SELECT')
                  AND NOT has_any_column_privilege('qbank_control_executor'::regrole, partition_relation.oid, 'INSERT')
                  AND NOT has_any_column_privilege('qbank_control_executor'::regrole, partition_relation.oid, 'UPDATE')
                  AND NOT has_any_column_privilege('qbank_control_executor'::regrole, partition_relation.oid, 'REFERENCES'))::int AS executor_denied_count,
                count(*) FILTER (WHERE NOT EXISTS (
                  SELECT 1
                    FROM pg_attribute attribute
                    CROSS JOIN LATERAL aclexplode(attribute.attacl) AS privilege
                   WHERE attribute.attrelid=partition_relation.oid
                     AND attribute.attnum > 0 AND NOT attribute.attisdropped
                     AND attribute.attacl IS NOT NULL
                     AND privilege.grantee <> partition_relation.relowner
                ))::int AS owner_only_count
           FROM partition_descendant descendant
           JOIN pg_class partition_relation ON partition_relation.oid=descendant.oid
       ), partition_index_fact AS (
         SELECT count(index_relation.oid)::int AS found_count,
                count(*) FILTER (WHERE index_relation.relowner=$3::regrole)::int AS owner_count
           FROM partition_descendant descendant
           JOIN pg_index index_definition ON index_definition.indrelid=descendant.oid
           JOIN pg_class index_relation ON index_relation.oid=index_definition.indexrelid
       ), unexpected_definer_function AS (
         SELECT count(procedure.oid)::int AS found_count
           FROM pg_proc procedure
           JOIN pg_namespace namespace ON namespace.oid=procedure.pronamespace
          WHERE namespace.nspname='public'
            AND procedure.proowner=$3::regrole
            AND procedure.prosecdef
            AND NOT EXISTS (
              SELECT 1 FROM expected_function expected
               WHERE procedure.oid=to_regprocedure(expected.signature)
            )
       ), default_acl_fact AS (
         SELECT count(*) FILTER (
                  WHERE default_acl.defaclobjtype='f' AND default_acl.defaclnamespace=0
                )::int AS global_function_acl_count,
                count(*) FILTER (
                  WHERE default_acl.defaclobjtype='f'
                    AND (default_acl.defaclnamespace=0 OR namespace.nspname='public')
                    AND NOT EXISTS (
                      SELECT 1
                        FROM aclexplode(coalesce(default_acl.defaclacl, acldefault('f', role.oid))) AS privilege
                       WHERE privilege.grantee <> role.oid
                    )
                )::int AS function_allowlist_count,
                count(*) FILTER (
                  WHERE default_acl.defaclobjtype='r'
                    AND (default_acl.defaclnamespace=0 OR namespace.nspname='public')
                    AND NOT EXISTS (
                      SELECT 1
                        FROM aclexplode(coalesce(default_acl.defaclacl, acldefault('r', role.oid))) AS privilege
                       WHERE privilege.grantee <> role.oid
                    )
                )::int AS table_allowlist_count,
                count(*) FILTER (
                  WHERE default_acl.defaclobjtype='f'
                    AND (default_acl.defaclnamespace=0 OR namespace.nspname='public')
                )::int AS function_scoped_acl_count,
                count(*) FILTER (
                  WHERE default_acl.defaclobjtype='r'
                    AND (default_acl.defaclnamespace=0 OR namespace.nspname='public')
                )::int AS table_scoped_acl_count
           FROM pg_roles role
           LEFT JOIN pg_default_acl default_acl ON default_acl.defaclrole=role.oid
           LEFT JOIN pg_namespace namespace ON namespace.oid=default_acl.defaclnamespace
          WHERE role.rolname=$3
       )
       SELECT function_fact.found_count AS function_count,
              function_fact.security_definer_count,
              function_fact.invoker_helper_count,
              function_fact.owner_count AS function_owner_count,
              function_acl_fact.public_denied_count AS function_public_denied_count,
              function_acl_fact.app_role_match_count AS function_app_role_match_count,
              function_acl_fact.executor_match_count AS function_executor_match_count,
              function_acl_fact.grantee_allowlist_count AS function_grantee_allowlist_count,
              table_fact.found_count AS table_count,
              table_fact.forced_rls_count,
              table_fact.owner_count AS table_owner_count,
              table_acl_fact.app_role_match_count AS table_app_role_match_count,
              table_acl_fact.executor_match_count AS table_executor_match_count,
              table_acl_fact.public_denied_count AS table_public_denied_count,
              table_acl_fact.grantee_allowlist_count AS table_grantee_allowlist_count,
              table_column_acl_fact.app_role_match_count AS table_column_app_role_match_count,
              table_column_acl_fact.executor_match_count AS table_column_executor_match_count,
              table_column_acl_fact.public_denied_count AS table_column_public_denied_count,
              table_column_acl_fact.owner_only_count AS table_column_owner_only_count,
              partition_fact.found_count AS partition_count,
              partition_fact.owner_count AS partition_owner_count,
              partition_fact.app_role_denied_count AS partition_app_role_denied_count,
              partition_fact.executor_denied_count AS partition_executor_denied_count,
              partition_fact.public_denied_count AS partition_public_denied_count,
              partition_fact.grantee_allowlist_count AS partition_grantee_allowlist_count,
              partition_column_acl_fact.app_role_denied_count AS partition_column_app_role_denied_count,
              partition_column_acl_fact.executor_denied_count AS partition_column_executor_denied_count,
              partition_column_acl_fact.owner_only_count AS partition_column_owner_only_count,
              partition_index_fact.found_count AS partition_index_count,
              partition_index_fact.owner_count AS partition_index_owner_count,
              unexpected_definer_function.found_count AS unexpected_definer_function_count,
              default_acl_fact.global_function_acl_count,
              default_acl_fact.function_allowlist_count,
              default_acl_fact.table_allowlist_count,
              default_acl_fact.function_scoped_acl_count,
              default_acl_fact.table_scoped_acl_count,
              owner_role.rolname AS owner_name,
              owner_role.rolcanlogin AS owner_can_login,
              owner_role.rolinherit AS owner_inherit,
              owner_role.rolsuper AS owner_super,
              owner_role.rolbypassrls AS owner_bypass_rls,
              owner_role.rolcreaterole AS owner_create_role,
              owner_role.rolcreatedb AS owner_create_database,
              owner_role.rolreplication AS owner_replication,
              has_schema_privilege(owner_role.oid, 'public', 'USAGE') AS owner_public_usage,
              has_schema_privilege(owner_role.oid, 'public', 'CREATE') AS owner_public_create,
              EXISTS (
                SELECT 1 FROM pg_auth_members membership
                 WHERE membership.member=owner_role.oid
              ) AS owner_has_parent_role,
              EXISTS (
                SELECT 1 FROM pg_auth_members membership
                 WHERE membership.roleid=owner_role.oid
              ) AS owner_has_member_role
         FROM function_fact
         CROSS JOIN function_acl_fact
         CROSS JOIN table_fact
         CROSS JOIN table_acl_fact
         CROSS JOIN table_column_acl_fact
         CROSS JOIN partition_fact
         CROSS JOIN partition_column_acl_fact
         CROSS JOIN partition_index_fact
         CROSS JOIN unexpected_definer_function
         CROSS JOIN default_acl_fact
         LEFT JOIN pg_roles owner_role ON owner_role.oid=function_fact.owner_oid
        WHERE function_fact.owner_oid=table_fact.owner_oid`,
      [
        JSON.stringify(QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST.map((fn) => ({
          signature: fn.signature,
          requires_security_definer: fn.requiresSecurityDefiner,
          allow_app_role_execute: fn.allowAppRoleExecute,
          allow_executor_execute: fn.allowExecutorExecute,
        }))),
        JSON.stringify(QBANK_CONTROL_DEFINER_TABLE_MANIFEST.map((table) => ({
          name: table.name,
          app_privileges: table.appRolePrivileges,
          executor_privileges: table.executorPrivileges,
        }))),
        QBANK_CONTROL_DEFINER_ROLE,
      ],
    );
    const row = result.rows[0];
    if (result.rowCount !== 1
      || row?.function_count !== QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST.length
      || row?.security_definer_count !== QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST.filter((fn) => fn.requiresSecurityDefiner).length
      || row?.invoker_helper_count !== QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST.filter((fn) => !fn.requiresSecurityDefiner).length
      || row?.function_owner_count !== 1
      || row?.function_public_denied_count !== QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST.length
      || row?.function_app_role_match_count !== QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST.length
      || row?.function_executor_match_count !== QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST.length
      || row?.function_grantee_allowlist_count !== QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST.length
      || row?.table_count !== QBANK_CONTROL_DEFINER_TABLE_MANIFEST.length
      || row?.forced_rls_count !== QBANK_CONTROL_DEFINER_TABLE_MANIFEST.length || row?.table_owner_count !== 1
      || row?.table_app_role_match_count !== QBANK_CONTROL_DEFINER_TABLE_MANIFEST.length
      || row?.table_executor_match_count !== QBANK_CONTROL_DEFINER_TABLE_MANIFEST.length
      || row?.table_public_denied_count !== QBANK_CONTROL_DEFINER_TABLE_MANIFEST.length
      || row?.table_grantee_allowlist_count !== QBANK_CONTROL_DEFINER_TABLE_MANIFEST.length
      || row?.table_column_app_role_match_count !== QBANK_CONTROL_DEFINER_TABLE_MANIFEST.length
      || row?.table_column_executor_match_count !== QBANK_CONTROL_DEFINER_TABLE_MANIFEST.length
      || row?.table_column_public_denied_count !== QBANK_CONTROL_DEFINER_TABLE_MANIFEST.length
      || row?.table_column_owner_only_count !== QBANK_CONTROL_DEFINER_TABLE_MANIFEST.length
      || row?.partition_count !== row?.partition_owner_count
      || row?.partition_count !== row?.partition_app_role_denied_count
      || row?.partition_count !== row?.partition_executor_denied_count
      || row?.partition_count !== row?.partition_public_denied_count
      || row?.partition_count !== row?.partition_grantee_allowlist_count
      || row?.partition_count !== row?.partition_column_app_role_denied_count
      || row?.partition_count !== row?.partition_column_executor_denied_count
      || row?.partition_count !== row?.partition_column_owner_only_count
      || row?.partition_index_count !== row?.partition_index_owner_count
      || row?.unexpected_definer_function_count !== 0
      || row?.global_function_acl_count !== 1
      || row?.function_allowlist_count !== row?.function_scoped_acl_count
      || row?.table_allowlist_count !== row?.table_scoped_acl_count
      || typeof row?.owner_name !== 'string'
      || row?.owner_name !== QBANK_CONTROL_DEFINER_ROLE
      || row?.owner_can_login !== false || row?.owner_inherit !== false || row?.owner_super !== false
      || row?.owner_bypass_rls !== false || row?.owner_create_role !== false || row?.owner_create_database !== false
      || row?.owner_replication !== false || row?.owner_has_parent_role !== false || row?.owner_has_member_role !== false) {
      throw new Error('qbank_control_definer_ownership_invalid');
    }
    if (row?.owner_public_usage !== true || row?.owner_public_create !== true) {
      throw new Error('qbank_control_definer_ownership_invalid');
    }
  } finally { c.release(); }
}

/** Scheduler scope has one capability: register/revoke opaque online-Judge candidates. */
export async function asOnlineJudgeScheduler<T>(pool: DbPool, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE online_judge_scheduler');
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
}

/** Dispatcher scope cannot see Judge tables; it can only claim/terminalize opaque jobs. */
export async function asOnlineJudgeExecutor<T>(pool: DbPool, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE online_judge_executor');
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
}

/**
 * Executes one reviewed gateway function. This is not a generic privileged SQL
 * escape hatch: the role has no table privileges and callers can only invoke
 * versioned SECURITY DEFINER functions with fixed SQL/output contracts.
 */
export async function asGateway<T>(pool: DbPool, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE app_gateway_role');
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
}

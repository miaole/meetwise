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
  /** Required when a cloud test runner pins PGHOST to a verified IP address. */
  tlsServerName?: string;
  /**
   * Observability-only label for the pool-error log/metric dimension (for
   * example 'api', 'worker', 'listen', 'migrate').  Never forwarded to pg and
   * never consulted for connection or TLS resolution; validated so a malformed
   * label cannot smuggle arbitrary text into structured logs.  Principal,
   * tenant, connection-string and SQL-shape values are forbidden as labels.
   */
  purpose?: string;
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

/**
 * 服务端 format() 生成 DDL 后的形状护栏：只放行白名单动词开头的单条语句（多语句、注释、
 * 未知动词一律 fail-closed）。标识符无法参数化（REVOKE/GRANT 语法限制），此护栏在执行前
 * 把可执行面收窄到「单动词管理语句」，即使结果行被篡改也无法携带任意 SQL。
 */
const DDL_STATEMENT_RE = /^\s*(?:REVOKE|GRANT|ALTER|CREATE|COMMENT|SET)\s[^;]*;?\s*$/i;

let adminDdlExecutorReady = false;
async function execFormatDdl(c: Client, statement: unknown): Promise<void> {
  const sql = typeof statement === 'string' ? statement : '';
  if (!DDL_STATEMENT_RE.test(sql)) throw new Error(`ddl_statement_shape_rejected:${sql.slice(0, 60)}`);
  if (!adminDdlExecutorReady) {
    // 服务端 DDL 执行器自举（幂等）：REVOKE/GRANT 标识符无法参数化，动态面整体移入服务端
    // 白名单函数（与客户端 DDL_STATEMENT_RE 双层校验）；客户端只以参数化字面量调用，不拼接。
    await c.query(`CREATE OR REPLACE FUNCTION mw_admin_exec_ddl(stmt text) RETURNS void LANGUAGE plpgsql AS $fn$ BEGIN IF stmt !~ '^[[:space:]]*(REVOKE|GRANT|ALTER|CREATE|COMMENT|SET)[[:space:]][^;]*$' THEN RAISE EXCEPTION 'ddl_statement_shape_rejected'; END IF; EXECUTE stmt; END $fn$;`);
    await c.query('REVOKE ALL ON FUNCTION public.mw_admin_exec_ddl(text) FROM PUBLIC');
    // 部署交接窗（provisionQbankControlDefiner 的 SET LOCAL ROLE qbank_control_definer 段）以
    // 交接身份继续跑 ACL 归一/默认特权白名单语句——此窗正是历史客户端直执行的同语义面。
    // 显式授 EXECUTE 给唯一合法交接身份（NOLOGIN·仅迁移账户可 SET ROLE 进入）；PUBLIC 保持全撤。
    await c.query('GRANT EXECUTE ON FUNCTION public.mw_admin_exec_ddl(text) TO qbank_control_definer');
    adminDdlExecutorReady = true;
  }
  await c.query('SELECT public.mw_admin_exec_ddl($1)', [sql]);
}

export const QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST = [
  // Generation/artifact/taxonomy guards (0086/0087/0089 sealed anchors).  All
  // SECURITY DEFINER writers pin `public, pg_temp`; the pure invoker helpers pin
  // `pg_catalog, public, pg_temp`; the invoker trigger guards pin `public, pg_temp`.
  { signature: 'qbank_generation_chunk_only_building()', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: false, requiredSearchPath: 'public, pg_temp' },
  { signature: 'qbank_prepare_generation_partition(text)', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: true, requiredSearchPath: 'public, pg_temp' },
  { signature: 'qbank_validate_generation(text)', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: true, requiredSearchPath: 'public, pg_temp' },
  { signature: 'qbank_activate_generation(text)', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: true, requiredSearchPath: 'public, pg_temp' },
  { signature: 'qbank_mark_generation_failed(text,text)', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: true, requiredSearchPath: 'public, pg_temp' },
  // AG-43 release terminal (0146 body, guard 1 rewritten to the definer-whitelist
  // assertion by 0176).  Registered so provisionQbankControlDefiner transfers its
  // owner to qbank_control_definer — the successor face logged at 0176:16-21.
  { signature: 'qbank_release_retired_generation_storage(text)', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: true, requiredSearchPath: 'public, pg_temp' },
  { signature: 'qbank_question_chunk_requires_visible_source()', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: false, requiredSearchPath: 'public, pg_temp' },
  { signature: 'qbank_question_artifact_guard()', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: false, requiredSearchPath: 'public, pg_temp' },
  { signature: 'qbank_question_chunk_artifact_guard()', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: false, requiredSearchPath: 'public, pg_temp' },
  { signature: 'qbank_generation_question_evidence(text,text[],integer)', requiresSecurityDefiner: true, allowAppRoleExecute: true, allowExecutorExecute: false, requiredSearchPath: 'public, pg_temp' },
  { signature: 'qbank_pool_requires_approved()', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: false, requiredSearchPath: 'public, pg_temp' },
  { signature: 'qbank_chunk_requires_approved_pool()', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: false, requiredSearchPath: 'public, pg_temp' },
  { signature: 'qbank_is_generation_control_definer()', requiresSecurityDefiner: false, allowAppRoleExecute: true, allowExecutorExecute: true, requiredSearchPath: 'pg_catalog, public, pg_temp' },
  { signature: 'qbank_metadata_hash(text,text,text,text)', requiresSecurityDefiner: false, allowAppRoleExecute: false, allowExecutorExecute: true, requiredSearchPath: 'pg_catalog, public, pg_temp' },
  { signature: 'qbank_is_curator()', requiresSecurityDefiner: false, allowAppRoleExecute: true, allowExecutorExecute: true, requiredSearchPath: 'pg_catalog, public, pg_temp' },
  { signature: 'qbank_taxonomy_release_guard()', requiresSecurityDefiner: false, allowAppRoleExecute: false, allowExecutorExecute: false, requiredSearchPath: 'public, pg_temp' },
  { signature: 'qbank_taxonomy_scope_guard()', requiresSecurityDefiner: false, allowAppRoleExecute: false, allowExecutorExecute: false, requiredSearchPath: 'public, pg_temp' },
  { signature: 'qbank_taxonomy_manifest_hash(text)', requiresSecurityDefiner: false, allowAppRoleExecute: false, allowExecutorExecute: true, requiredSearchPath: 'pg_catalog, public, pg_temp' },
  { signature: 'qbank_chunk_serving_scope_guard()', requiresSecurityDefiner: false, allowAppRoleExecute: false, allowExecutorExecute: false, requiredSearchPath: 'public, pg_temp' },
  // §6.1 bounded retrieval readers — the only public request-side read API for
  // the controlled corpus.  SECURITY DEFINER so FORCE RLS still applies to the
  // isolated owner; EXECUTE granted only to app_role.
  { signature: 'qbank_generation_ann_search(text,vector,integer)', requiresSecurityDefiner: true, allowAppRoleExecute: true, allowExecutorExecute: false, requiredSearchPath: 'public, pg_temp' },
  { signature: 'qbank_generation_lexical_search(text,text,integer)', requiresSecurityDefiner: true, allowAppRoleExecute: true, allowExecutorExecute: false, requiredSearchPath: 'public, pg_temp' },
  { signature: 'qbank_generation_distances(text,vector,text[])', requiresSecurityDefiner: true, allowAppRoleExecute: true, allowExecutorExecute: false, requiredSearchPath: 'public, pg_temp' },
  { signature: 'qbank_generation_evidence(text,text[],integer)', requiresSecurityDefiner: true, allowAppRoleExecute: true, allowExecutorExecute: false, requiredSearchPath: 'public, pg_temp' },
  { signature: 'qbank_active_generation_metadata()', requiresSecurityDefiner: true, allowAppRoleExecute: true, allowExecutorExecute: false, requiredSearchPath: 'public, pg_temp' },
  // §6.1 dedupe reader (0013): SECURITY DEFINER reverse-lookup of an opaque
  // source id for a known exact hash.  This is a *curation dedup* read, not a
  // pure request-side retrieval reader: proposeSource resolves an already-active
  // source id for a known exact hash under asQbankControlExecutor, so the trusted
  // executor legitimately needs EXECUTE.  It returns only an opaque id for a known
  // exact hash (0013 header) and the executor already holds ALL PRIVILEGES on
  // qbank_source (0066) with an RLS policy of `true`, so this grant adds no data
  // plane — it gives the dedup path the same RLS-bypass read app_role already has.
  { signature: 'qbank_active_source_id(text)', requiresSecurityDefiner: true, allowAppRoleExecute: true, allowExecutorExecute: true, requiredSearchPath: 'public, pg_temp' },
  // §6.3 lexical helper (0029): pure IMMUTABLE invoker builtin helper, executor
  // only — a request runtime never needs to tokenize outside the bounded reader.
  { signature: 'qbank_search_terms(text)', requiresSecurityDefiner: false, allowAppRoleExecute: false, allowExecutorExecute: true, requiredSearchPath: 'pg_catalog, public, pg_temp' },
  // §6.4 pool/cache/epoch triggers.  bump/lock/sync are SECURITY DEFINER and
  // never request-callable; source_visible_epoch_sync was redefined as INVOKER
  // in 0069 so it runs under the executor's explicit grants, not a superuser.
  { signature: 'qbank_bump_retrieval_cache_epoch()', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: false, requiredSearchPath: 'public, pg_temp' },
  { signature: 'qbank_lock_retrieval_cache_epoch()', requiresSecurityDefiner: true, allowAppRoleExecute: true, allowExecutorExecute: false, requiredSearchPath: 'public, pg_temp' },
  { signature: 'qbank_pool_visible_epoch_sync()', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: false, requiredSearchPath: 'public, pg_temp' },
  { signature: 'qbank_source_visible_epoch_sync()', requiresSecurityDefiner: false, allowAppRoleExecute: false, allowExecutorExecute: false, requiredSearchPath: 'public, pg_temp' },
  // §6.5 quarantine immutability + source update guard (INVOKER trigger).
  { signature: 'qbank_integrity_quarantine_immutable()', requiresSecurityDefiner: true, allowAppRoleExecute: false, allowExecutorExecute: false, requiredSearchPath: 'public, pg_temp' },
  { signature: 'qbank_source_guard_update()', requiresSecurityDefiner: false, allowAppRoleExecute: false, allowExecutorExecute: false, requiredSearchPath: 'public, pg_temp' },
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
  { name: 'public.qbank_metadata_review_receipt', appRolePrivileges: [], executorPrivileges: ['SELECT', 'INSERT'] },
] as const;

/**
 * The two SECURITY DEFINER views (§6.2) are projections, not base relations,
 * so they are tracked in their own manifest.  Both must remain definer
 * semantics (`security_invoker=false`): flipping one to invoker semantics
 * would re-execute it as the request role and reopen the raw-corpus read
 * bypass that 0067/0068 closed.  `qbank_visible_ref` is the one request-side
 * SELECT surface (lane (a)+(b) union); `qbank_retrieval_candidate` is
 * definer-internal only and carries no request/executor grant.
 */
export const QBANK_CONTROL_DEFINER_VIEW_MANIFEST = [
  { name: 'public.qbank_retrieval_candidate', securityInvoker: false, appRolePrivileges: [], executorPrivileges: [] },
  { name: 'public.qbank_visible_ref', securityInvoker: false, appRolePrivileges: ['SELECT'], executorPrivileges: [] },
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
    await execFormatDdl(c, statement.rows[0]?.statement);
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
    await execFormatDdl(c, statement.rows[0]?.statement);
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
    await execFormatDdl(c, revoke.rows[0]?.statement);
  }
  const columnGrantees = await c.query<{ column_name: string; role_name: string }>(
    'SELECT * FROM mw_qbank_column_grantees($1)',
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
    await execFormatDdl(c, revoke.rows[0]?.statement);
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
    await execFormatDdl(c, grant.rows[0]?.statement);
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
    // Deployment single-flight: two concurrent provisioners race on CREATE ROLE
    // (42710 duplicate_object) and ALTER ... OWNER (ACCESS EXCLUSIVE) and can
    // deadlock.  Serialize the whole handoff behind one session-level advisory
    // lock, released in the finally below even when the transaction rolls back.
    await c.query('SELECT pg_advisory_lock(hashtext($1))', ['meetwise:qbank_control_definer_provision']);
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
      await execFormatDdl(c, create.rows[0]?.statement);
    }
    const harden = await c.query<{ statement: string }>(
      "SELECT format('ALTER ROLE %I NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS', $1::text) AS statement",
      [QBANK_CONTROL_DEFINER_ROLE],
    );
    await execFormatDdl(c, harden.rows[0]?.statement);
    await revokeDirectRoleMemberships(c, QBANK_CONTROL_DEFINER_ROLE);
    await revokeDirectRoleMembers(c, QBANK_CONTROL_DEFINER_ROLE);

    const temporaryGrant = await c.query<{ statement: string }>(
      "SELECT format('GRANT %I TO %I', $1::text, $2::text) AS statement",
      [QBANK_CONTROL_DEFINER_ROLE, migrationRole],
    );
    await execFormatDdl(c, temporaryGrant.rows[0]?.statement);
    try {
      const schemaGrant = await c.query<{ statement: string }>(
        "SELECT format('GRANT USAGE, CREATE ON SCHEMA public TO %I', $1::text) AS statement",
        [QBANK_CONTROL_DEFINER_ROLE],
      );
      await execFormatDdl(c, schemaGrant.rows[0]?.statement);
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
          await execFormatDdl(c, statement.rows[0]?.statement);
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
      }>('SELECT * FROM mw_qbank_partition_objects()', []);
      for (const object of partitionObjects.rows) {
        if (object.owner_name !== QBANK_CONTROL_DEFINER_ROLE) {
          if (object.owner_name !== migrationRole) {
            throw new Error(`qbank_control_definer_partition_owner_invalid:${object.relation_name}`);
          }
          const objectType = object.relation_kind === 'index' ? 'INDEX' : 'TABLE';
          const statement = await c.query<{ statement: string }>(
            "SELECT format('ALTER %s %s OWNER TO %I', $1::text, $2::regclass, $3::text) AS statement",
            [objectType, object.relation_name, QBANK_CONTROL_DEFINER_ROLE],
          );
          await execFormatDdl(c, statement.rows[0]?.statement);
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
        await execFormatDdl(c, statement.rows[0]?.statement);
      }
      // The two SECURITY DEFINER views share the same fixed owner so the
      // candidate-view RLS predicate (which names the view owner dynamically)
      // and lane (b) of qbank_visible_ref resolve to the isolated role, not a
      // migration account.  Reject any non-migration owner exactly like the
      // function/table loops: never adopt a view from an undisclosed role.
      //
      // Load-bearing revocation invariant (sealed-manifest §6.2): lane (b) of
      // qbank_visible_ref excludes a revoked chunk via `NOT EXISTS (SELECT 1
      // FROM qbank_pool_entry ...)`.  With the owner NOSUPERUSER/NOBYPASSRLS,
      // that subquery is still FORCE RLS, so it can only see the *revoked*
      // pool row because p_qbank_pool_candidate_view (0068) grants the owner
      // of qbank_retrieval_candidate a full read of qbank_pool_entry.  The
      // shared owner below is therefore what keeps approved→rejected from
      // silently resurrecting the chunk through the legacy annSearchLegacy
      // path; split these two views and the startup gate's view_owner_count
      // check is the only thing left to catch it, while the runtime leak would
      // go unobserved.  Verified end-to-end by qbank-handoff-closure.proof.ts.
      for (const view of QBANK_CONTROL_DEFINER_VIEW_MANIFEST) {
        const viewOwner = await c.query<{ owner_name: string }>(
          `SELECT role.rolname AS owner_name
             FROM pg_class relation
             JOIN pg_roles role ON role.oid=relation.relowner
            WHERE relation.oid=$1::regclass AND relation.relkind='v'`,
          [view.name],
        );
        const ownerName = viewOwner.rows[0]?.owner_name;
        if (ownerName === QBANK_CONTROL_DEFINER_ROLE) continue;
        if (ownerName !== migrationRole)
          throw new Error(`qbank_control_definer_view_owner_invalid:${view.name}`);
        const statement = await c.query<{ statement: string }>(
          "SELECT format('ALTER VIEW %s OWNER TO %I', $1::regclass, $2::text) AS statement",
          [view.name, QBANK_CONTROL_DEFINER_ROLE],
        );
        await execFormatDdl(c, statement.rows[0]?.statement);
      }
      // Lane (b) of qbank_visible_ref reads system-owned qbank vector_chunk
      // rows.  The definer owns the view but not vector_chunk, so it needs an
      // explicit read grant; FORCE RLS still filters through p_vchunk_read, so
      // this is a bounded read, not a raw-corpus bypass.
      const vectorChunkGrant = await c.query<{ statement: string }>(
        "SELECT format('GRANT SELECT ON TABLE %s TO %I', $1::regclass, $2::text) AS statement",
        ['public.vector_chunk', QBANK_CONTROL_DEFINER_ROLE],
      );
      await execFormatDdl(c, vectorChunkGrant.rows[0]?.statement);
      // Newly transferred objects now belong to the fixed role.  Enter it
      // explicitly for ACL/default-ACL normalization: temporary membership is
      // sufficient for owner transfer but is not an assumption about the
      // migration login's inherited object privileges on a rerun.
      await c.query('SET LOCAL ROLE qbank_control_definer');
      for (const relation of QBANK_CONTROL_DEFINER_TABLE_MANIFEST) {
        await normalizeQbankRelationAcl(c, relation.name, relation.appRolePrivileges, relation.executorPrivileges);
      }
      for (const view of QBANK_CONTROL_DEFINER_VIEW_MANIFEST) {
        await normalizeQbankRelationAcl(c, view.name, view.appRolePrivileges, view.executorPrivileges);
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
                'ALTER DEFAULT PRIVILEGES FOR ROLE %I%s REVOKE %s ON %s FROM %s',
                $1::text,
                $2::text,
                $3::text,
                $4::text,
                CASE WHEN $5::text='PUBLIC' THEN 'PUBLIC' ELSE format('%I', $5::text) END
              ) AS statement`,
            [QBANK_CONTROL_DEFINER_ROLE, schemaClause, privileges, objectType, grantee],
          );
          await execFormatDdl(c, defaultAcl.rows[0]?.statement);
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
          await execFormatDdl(c, revoke.rows[0]?.statement);
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
          await execFormatDdl(c, grant.rows[0]?.statement);
        }
      }
    } finally {
      await c.query('RESET ROLE');
      const revoke = await c.query<{ statement: string }>(
        "SELECT format('REVOKE %I FROM %I', $1::text, $2::text) AS statement",
        [QBANK_CONTROL_DEFINER_ROLE, migrationRole],
      );
      await execFormatDdl(c, revoke.rows[0]?.statement);
    }
    await c.query('COMMIT');
  } catch (error) {
    await c.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    // A failed unlock leaves the session advisory lock on this connection.
    // Discard that client instead of returning the locked session to the idle list.
    let unlocked = false;
    try {
      await c.query('SELECT pg_advisory_unlock(hashtext($1))', ['meetwise:qbank_control_definer_provision']);
      unlocked = true;
    } catch (unlockError: unknown) {
      if (unlockError instanceof Error) c.release(unlockError);
      else c.release(true);
    }
    if (unlocked) c.release();
  }
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
    await execFormatDdl(c, (exists.rowCount ?? 0) === 0 ? ddl.rows[0]?.statement : alter.rows[0]?.statement);
    await revokeDirectRoleMemberships(c, input.roleName);
    const grant = await c.query("SELECT format('GRANT app_role TO %I', $1::text) AS statement", [input.roleName]);
    await execFormatDdl(c, grant.rows[0]?.statement);
    // The gateway role receives no table grants. It may execute only reviewed,
    // fixed SECURITY DEFINER functions for dispatch metadata.
    const gatewayExists = await c.query("SELECT 1 FROM pg_roles WHERE rolname='app_gateway_role'");
    if ((gatewayExists.rowCount ?? 0) > 0) {
      const gatewayGrant = await c.query("SELECT format('GRANT app_gateway_role TO %I', $1::text) AS statement", [input.roleName]);
      await execFormatDdl(c, gatewayGrant.rows[0]?.statement);
    }
    // A runtime login must never accumulate a control-plane capability through
    // an old/manual grant.  RLS principal GUCs are routing context, not an
    // authorization root, so qbank rebuild/activation is deliberately held by
    // a separate NOINHERIT executor login.
    const qbankControlExists = await c.query("SELECT 1 FROM pg_roles WHERE rolname='qbank_control_executor'");
    if ((qbankControlExists.rowCount ?? 0) > 0) {
      const revoke = await c.query("SELECT format('REVOKE qbank_control_executor FROM %I', $1::text) AS statement", [input.roleName]);
      await execFormatDdl(c, revoke.rows[0]?.statement);
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
    await execFormatDdl(c, createOrAlter.rows[0]?.statement);
    await revokeDirectRoleMemberships(c, input.roleName);
    const grant = await c.query("SELECT format('GRANT qbank_control_executor TO %I', $1::text) AS statement", [input.roleName]);
    await execFormatDdl(c, grant.rows[0]?.statement);
    // Keep this login incapable of serving an HTTP request or gateway task if
    // its secret is accidentally mounted into the wrong container.
    for (const role of ['app_role', 'app_gateway_role']) {
      const revoke = await c.query(`SELECT format('REVOKE %s FROM %I', $1::text, $2::text) AS statement`, [role, input.roleName]);
      await execFormatDdl(c, revoke.rows[0]?.statement);
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
    await execFormatDdl(c, createOrAlter.rows[0]?.statement);
    await revokeDirectRoleMemberships(c, input.roleName);
    const grant = await c.query("SELECT format('GRANT rag_control_executor TO %I', $1::text) AS statement", [input.roleName]);
    await execFormatDdl(c, grant.rows[0]?.statement);
    for (const role of ['app_role', 'app_gateway_role', 'privacy_worker_executor', 'qbank_control_executor']) {
      const revoke = await c.query(`SELECT format('REVOKE %s FROM %I', $1::text, $2::text) AS statement`, [role, input.roleName]);
      await execFormatDdl(c, revoke.rows[0]?.statement);
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
    await execFormatDdl(c, (exists.rowCount ?? 0) === 0 ? ddl.rows[0]?.statement : alter.rows[0]?.statement);
    await revokeDirectRoleMemberships(c, input.roleName);
    const grant = await c.query("SELECT format('GRANT privacy_worker_executor TO %I', $1::text) AS statement", [input.roleName]);
    await execFormatDdl(c, grant.rows[0]?.statement);
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
    await execFormatDdl(c, createOrAlter.rows[0]?.statement);
    const grant = await c.query("SELECT format('GRANT online_judge_scheduler TO %I', $1::text) AS statement", [input.roleName]);
    await execFormatDdl(c, grant.rows[0]?.statement);
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
    await execFormatDdl(c, createOrAlter.rows[0]?.statement);
    const grant = await c.query("SELECT format('GRANT online_judge_executor TO %I', $1::text) AS statement", [input.roleName]);
    await execFormatDdl(c, grant.rows[0]?.statement);
  } finally { c.release(); }
}

const DB_COMPONENT_ENV = ['PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE'] as const;

function nonEmpty(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function invalidDatabaseConfig(code: string, hint?: string): never {
  throw new Error(hint === undefined ? `database_config_invalid:${code}` : `database_config_invalid:${code}（${hint}）`);
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
      invalidDatabaseConfig('production_local_database_host', '生产环境数据库主机不得为本机/回环/链路本地地址，请将数据库地址指向云数据库后重启');
    // TLS policy is expressed through DATABASE_SSL_MODE, never a hidden URL query parameter.
    if (parsed.searchParams.has('sslmode')) invalidDatabaseConfig('database_url_sslmode_not_allowed');
    return parsed.toString();
  }

  if (!components.host || !components.port || !components.user || components.password === undefined || !components.database)
    invalidDatabaseConfig('database_target_missing');
  if (!Number.isInteger(components.port) || components.port < 1 || components.port > 65535)
    invalidDatabaseConfig('database_port_invalid');
  if ((process.env.NODE_ENV ?? '').toLowerCase() === 'production' && isLocalDatabaseHost(components.host))
    invalidDatabaseConfig('production_local_database_host', '生产环境数据库主机不得为本机/回环/链路本地地址，请将数据库地址指向云数据库后重启');
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
  const caEnv = process.env.DATABASE_SSL_CA_PATH;
  const caPath = typeof caEnv === 'string' && caEnv.length > 0 ? caEnv : undefined;
  if (!caPath) invalidDatabaseConfig('database_ssl_ca_path_missing');
  const servername = o.tlsServerName ?? nonEmpty(process.env.PG_TLS_SERVERNAME);
  if (servername && (/\s/.test(servername) || isLocalDatabaseHost(servername)))
    invalidDatabaseConfig('database_tls_servername_invalid');
  try { return { rejectUnauthorized: true, ca: readFileSync(caPath, 'utf8'), ...(servername ? { servername } : {}) }; }
  catch { return invalidDatabaseConfig('database_ssl_ca_unreadable'); }
}

/** Pool-error labels are infrastructure tags, never free-form text (log-injection guard). */
const POOL_PURPOSE = /^[a-z0-9_-]{1,64}$/;

/**
 * Process-local pool-error counter (GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER,
 * dual-adjudicated candidate B).  Keyed by pool purpose only; never by
 * principal, tenant, connection target or SQL shape.  It is an observability
 * gauge, not a health signal: a rising count records faults, it does not
 * describe recovery.
 */
const poolErrorTotal = new Map<string, number>();

/** Read-only counter view for tests and operations (values are never reset). */
export function readPoolErrorTotal(purpose: string): number {
  return poolErrorTotal.get(purpose) ?? 0;
}

/**
 * Purposes of pools created in this process, deduped, in creation order.  The
 * /metrics exposition renders one 0-prefilled series per registered purpose
 * so a scrape sees the counter from process start, not from the first fault.
 */
const registeredPoolPurposes: string[] = [];

/** Read-only registered-purpose view for the /metrics exposition. */
export function readRegisteredPoolPurposes(): readonly string[] {
  return registeredPoolPurposes;
}

/**
 * Prometheus text lines for the pool-error counter (R-22 observability
 * surface, rendered after the shared registry output on BOTH existing scrape
 * faces — worker /metrics and api GET /metrics; no new endpoint).  One line
 * per registered purpose.  The counter is an observability gauge, not a
 * health signal: a rising count records faults, it does not describe
 * recovery.  Labels are POOL_PURPOSE-validated infrastructure tags only;
 * never principal/tenant/connection/SQL values.  /readyz never consults any
 * of this (candidate-B boundary unchanged).
 */
export function renderPoolErrorsTotalLines(): string {
  if (registeredPoolPurposes.length === 0) return '';
  const lines = ['# TYPE meetwise_db_pool_errors_total counter'];
  for (const purpose of registeredPoolPurposes) {
    lines.push(`meetwise_db_pool_errors_total{purpose=${JSON.stringify(purpose)}} ${poolErrorTotal.get(purpose) ?? 0}`);
  }
  return lines.join('\n') + '\n';
}

/**
 * GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER: pg surfaces one connection break
 * through up to two EventEmitter emissions (pg@8.22.0 `Client
 * ._handleErrorEvent` always `emit('error')` on the client after rejecting the
 * in-flight queries; pg-pool@3.14.0 `makeIdleListener` re-emits the same error
 * object on the pool for idle clients).  One break must be recorded exactly
 * once, so observers dedupe on error-object identity.
 */
const observedPoolErrors = new WeakSet<object>();

/**
 * Fail-closed observability, not recovery (candidate B; candidate C
 * reconstruction/degrade linkage rejected by both pre-exec reviewers):
 *   - it exists solely to keep pool/client error emissions observed instead of
 *     escalating to uncaughtException and killing the whole process (the C''
 *     prove FI-1 crash);
 *   - it never swallows or converts errors — in-flight queries are rejected by
 *     pg itself before this runs and future request-path failures still reject
 *     their own queries (unified `internal_error` 500);
 *   - it never reconnects, rebuilds the pool, retries, or flips any
 *     health/degraded flag;
 *   - the log line carries only the purpose label, a counter and the pg error
 *     name/message — never connection strings, credentials, SQL text, or
 *     principal/tenant identifiers.
 */
function observePoolError(purpose: string, error: unknown): void {
  try {
    if (error instanceof Error) {
      if (observedPoolErrors.has(error)) return;
      observedPoolErrors.add(error);
    }
    const count = (poolErrorTotal.get(purpose) ?? 0) + 1;
    poolErrorTotal.set(purpose, count);
    const errorName = error instanceof Error ? error.name : 'non_error';
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(JSON.stringify({ event: 'db_pool_error', purpose, count, error_name: errorName, error_message: errorMessage }));
  } catch {
    // The observer itself must never become the crash it exists to prevent.
    // The pool error has already been routed/re-emitted by pg above; this only
    // keeps the observer from adding a second uncaughtException on top of it.
    console.error('db_pool_error_observer_failed');
  }
}

/** Connection pool factory with explicit, cloud-safe target and TLS resolution. */
export function createPool(o: PoolOverrides = {}): DbPool {
  if (o.purpose !== undefined && !POOL_PURPOSE.test(o.purpose)) invalidDatabaseConfig('database_pool_purpose_invalid');
  const purpose = o.purpose ?? 'default';
  if (!registeredPoolPurposes.includes(purpose)) registeredPoolPurposes.push(purpose);
  const pool = new Pool({
    connectionString: resolveDatabaseConnectionString(o),
    ssl: resolveSsl(o),
    // An explicit caller cap is required for singleton resources such as a
    // LISTEN session.  Ambient tuning remains the default for ordinary pools.
    max: Number(o.max ?? process.env.PGPOOL_MAX ?? 20),
    statement_timeout: Number(process.env.PG_STATEMENT_TIMEOUT_MS ?? 15000),
    idle_in_transaction_session_timeout: Number(process.env.PG_IDLE_TX_TIMEOUT_MS ?? 15000),
    connectionTimeoutMillis: Number(process.env.PG_CONN_TIMEOUT_MS ?? 5000),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS ?? 30000),
    // R-22: TCP keepalive hard-pinned on. The pg driver defaults it to false
    // (pg@8.22.0 client.js:95 `c.keepAlive || false`), so behind cloud LBs /
    // NAT a silently dropped idle socket stays half-open inside the pool until
    // first use.  keepAliveInitialDelayMillis bounds only the FIRST probe;
    // the subsequent per-probe interval is kernel `tcp_keepalive_*` and is
    // not reachable from this process (honest boundary, out of scope here).
    keepAlive: true,
    keepAliveInitialDelayMillis: Number(process.env.PG_KEEPALIVE_INITIAL_DELAY_MS ?? 10000),
    // R-22: driver-level query timer (pg@8.22.0 client.js:660
    // `config.query_timeout || this.connectionParameters.query_timeout`).
    // Two distinct timeout layers coexist: this one is the client-side socket
    // deadline per query; `statement_timeout` above is the server-side GUC.
    // Each covers what the other cannot see; defaults are kept aligned.
    query_timeout: Number(process.env.PG_QUERY_TIMEOUT_MS ?? 15000),
  });
  // pg-pool removes its idle error listener while a client is checked out
  // (`_acquireClient` → `client.removeListener('error', idleListener)`), so a
  // connection break on a checked-out client leaves the client 'error'
  // emission unobserved — that is the exact C'' FI-1 crash path.  Attach one
  // permanent observer per client at creation ('connect' fires exactly once
  // per client); the pool-level listener below guards the idle re-emission
  // path (`makeIdleListener` → `pool.emit('error')`).  Dedup keeps the count
  // at exactly one record per underlying connection break.
  pool.on('connect', (client) => {
    client.on('error', (error) => observePoolError(purpose, error));
  });
  pool.on('error', (error) => observePoolError(purpose, error));
  return pool;
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
    const result = await c.query('SELECT * FROM mw_assert_privacy_worker_identity()', []);
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
 * Catalog gate for the issuer/guard definer roles (L11, mirrors
 * assertPrivacyWorkerExecutorIdentity for the two NOLOGIN roles introduced by
 * 0091).  Verifies both roles are non-login, non-inheriting, non-superuser,
 * non-replication, non-bypass-RLS, and membership-closed: no login can drift
 * into them and they inherit nothing from any parent.  Also asserts app_role
 * (the runtime login) has not drifted into issuer/guard/worker-executor.
 */
export async function assertPrivacyAuthorizationIssuerIdentity(pool: DbPool): Promise<void> {
  const c = await pool.connect();
  try {
    const result = await c.query('SELECT * FROM mw_assert_privacy_authorization_issuer_identity()', []);
    const row = result.rows[0];
    if (result.rowCount !== 1
      || row?.issuer_found !== 1 || row?.guard_found !== 1
      || row?.issuer_canlogin !== false || row?.issuer_inherit !== false || row?.issuer_super !== false
      || row?.issuer_createdb !== false || row?.issuer_createrole !== false || row?.issuer_replication !== false
      || row?.issuer_bypass !== false
      || row?.guard_canlogin !== false || row?.guard_inherit !== false || row?.guard_super !== false
      || row?.guard_createdb !== false || row?.guard_createrole !== false || row?.guard_replication !== false
      || row?.guard_bypass !== false
      || Number(row?.issuer_members) !== 0 || Number(row?.issuer_parents) !== 0
      || Number(row?.guard_members) !== 0 || Number(row?.guard_parents) !== 0
      || row?.app_has_issuer !== false || row?.app_has_guard !== false || row?.app_has_worker !== false) {
      throw new Error('privacy_authorization_role_identity_invalid');
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
    const result = await c.query('SELECT * FROM mw_assert_rag_control_executor_identity()', []);
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
    const result = await c.query('SELECT * FROM mw_assert_rag_control_definer_ownership()', []);
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
    const result = await c.query('SELECT * FROM mw_assert_qbank_control_executor_identity()', []);
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
      'SELECT * FROM mw_assert_qbank_control_definer_ownership($1,$2,$3,$4)',
      [
        JSON.stringify(QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST.map((fn) => ({
          signature: fn.signature,
          requires_security_definer: fn.requiresSecurityDefiner,
          allow_app_role_execute: fn.allowAppRoleExecute,
          allow_executor_execute: fn.allowExecutorExecute,
          required_search_path: fn.requiredSearchPath,
        }))),
        JSON.stringify(QBANK_CONTROL_DEFINER_TABLE_MANIFEST.map((table) => ({
          name: table.name,
          app_privileges: table.appRolePrivileges,
          executor_privileges: table.executorPrivileges,
        }))),
        QBANK_CONTROL_DEFINER_ROLE,
        JSON.stringify(QBANK_CONTROL_DEFINER_VIEW_MANIFEST.map((view) => ({
          name: view.name,
          security_invoker: view.securityInvoker,
          app_privileges: view.appRolePrivileges,
          executor_privileges: view.executorPrivileges,
        }))),
      ],
    );
    const row = result.rows[0];
    if (result.rowCount !== 1
      || row?.function_count !== QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST.length
      || row?.security_definer_count !== QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST.filter((fn) => fn.requiresSecurityDefiner).length
      || row?.invoker_helper_count !== QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST.filter((fn) => !fn.requiresSecurityDefiner).length
      || row?.safe_search_path_count !== QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST.length
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
      || row?.view_count !== QBANK_CONTROL_DEFINER_VIEW_MANIFEST.length
      || row?.explicit_definer_count !== QBANK_CONTROL_DEFINER_VIEW_MANIFEST.length
      || row?.invoker_count !== 0
      || row?.view_owner_count !== 1
      || row?.view_app_role_match_count !== QBANK_CONTROL_DEFINER_VIEW_MANIFEST.length
      || row?.view_executor_match_count !== QBANK_CONTROL_DEFINER_VIEW_MANIFEST.length
      || row?.view_public_denied_count !== QBANK_CONTROL_DEFINER_VIEW_MANIFEST.length
      || row?.view_grantee_allowlist_count !== QBANK_CONTROL_DEFINER_VIEW_MANIFEST.length
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
      || row?.definer_vector_chunk_select !== true
      || typeof row?.owner_name !== 'string'
      || row?.owner_name !== QBANK_CONTROL_DEFINER_ROLE
      || row?.owner_can_login !== false || row?.owner_inherit !== false || row?.owner_super !== false
      || row?.owner_bypass_rls !== false || row?.owner_create_role !== false || row?.owner_create_database !== false
      || row?.owner_replication !== false || row?.owner_has_parent_role !== false || row?.owner_has_unsafe_member !== false) {
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

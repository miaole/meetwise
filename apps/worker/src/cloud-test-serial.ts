/**
 * Project-only, serial cloud database test runner.
 *
 * This is intentionally separate from the fixed-readonly smoke profile and
 * from release/migration paths. It may create only a database and NOLOGIN
 * role derived from a validated run ID, then must prove their removal.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pkg from 'pg';
import {
  assertCloudSmokePrivatePeer,
  cloudSmokeFailure,
  parseCloudSmokePrivateCidrs,
  resolveCloudSmokePrivateHost,
} from './cloud-readiness.ts';
import {
  beginCloudTestRun,
  completeCloudTestRun,
  recordCloudTestOwnedResource,
  recordCloudTestResourceIntent,
  type CloudTestLedgerReceipt,
  type CloudTestOwnedResource,
} from './cloud-test-run-ledger.ts';

const { Pool } = pkg;

const RUN_ID = /^[a-z0-9][a-z0-9-]{5,40}$/;
const SERIAL_MODE = 'serial-test-only';
export const CLOUD_TEST_SERIAL_CASES = [
  'TC-CLOUD-TEST-001-main',
  'TC-CLOUD-TEST-002-main',
  'TC-CLOUD-TEST-003-main',
] as const;
export type CloudTestSerialCase = typeof CLOUD_TEST_SERIAL_CASES[number];
const SERIAL_CASE = CLOUD_TEST_SERIAL_CASES[0];
const SERIAL_ADMIN = 'mw_e2e_admin';
const CONTROL_DATABASE = 'postgres';
// `postgres` is a bootstrap connection only. Managed RDS commonly denies
// CREATE in its public schema, so durable test-control state lives in this
// project-only database owned by the test administrator, never in the fixed
// readonly smoke database.
const CONTROL_LEDGER_DATABASE = 'meetwise_cloud_test_control';
const FORBIDDEN_VARIABLES = [
  'DATABASE_URL', 'RUNTIME_DATABASE_URL', 'MIGRATION_DATABASE_URL', 'RAG_REDIS_URL',
  'REDIS_URL', 'REDISCLI_AUTH', 'CLOUD_TEST_DATABASE_URL', 'CLOUD_TEST_REDIS_URL',
] as const;

export type CloudTestSerialConfig = {
  runId: string;
  caseId: CloudTestSerialCase;
  tlsMode: 'system-root';
  controlDatabaseUrl: string;
  receiptHmacKey: string;
  privateCidrs: string[];
  targetCertificateSha256: string;
  targetInstanceId: string;
  targetVpcId: string;
  allowedCaseId: 'TC-CLOUD-TEST-001-main';
  suiteArtifactSha256: string;
  tlsCa?: string;
};

export type CloudTestSerialReceipt = Omit<CloudTestLedgerReceipt, 'caseId'> & {
  caseId: CloudTestSerialCase;
};

function failure(code: string): never {
  throw new Error(`cloud_test_serial_${code}`);
}

function required(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();
  if (!value) failure(`${name.toLowerCase()}_missing`);
  return value;
}

function exactRunResource(runId: string, artifactDigest: string): { database: string; role: string } {
  if (!RUN_ID.test(runId)) failure('run_id_invalid');
  if (!/^[0-9a-f]{64}$/.test(artifactDigest)) failure('artifact_digest_invalid');
  // The planned names are durable before the execution lease is committed.
  // A recovery can therefore terminate even an attempt that crashed before
  // the first CREATE statement. OID matching remains mandatory for DELETE.
  const suffix = createHash('sha256').update(`${runId}\u0000${artifactDigest}`).digest('hex').slice(0, 32);
  return { database: `meetwise_e2e_${suffix}`, role: `mw_e2e_${suffix}` };
}

function isSerialCase(value: string): value is CloudTestSerialCase {
  return (CLOUD_TEST_SERIAL_CASES as readonly string[]).includes(value);
}

function quotedIdentifier(value: string): string {
  // Identifiers are generated solely by exactRunResource(), but retain this
  // guard so a future caller cannot turn an identifier into SQL text.
  if (!/^[a-z][a-z0-9_]{0,62}$/.test(value)) failure('generated_identifier_invalid');
  return `"${value}"`;
}

function parseControlUrl(raw: string): URL {
  let url: URL;
  try { url = new URL(raw); }
  catch { return failure('control_database_url_invalid'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || url.search || url.hash)
    failure('control_database_url_invalid');
  if (decodeURIComponent(url.username) !== SERIAL_ADMIN || !decodeURIComponent(url.password))
    failure('control_database_credential_invalid');
  if (decodeURIComponent(url.pathname.replace(/^\//, '')) !== CONTROL_DATABASE)
    failure('control_database_not_postgres');
  return url;
}

/** Pure validation: it deliberately opens no socket and creates no resource. */
export function resolveCloudTestSerialConfig(
  argv: { runId?: string; caseId?: string },
  env: NodeJS.ProcessEnv = process.env,
): CloudTestSerialConfig {
  if (required(env, 'CLOUD_TEST_MODE') !== SERIAL_MODE) failure('mode_invalid');
  for (const name of FORBIDDEN_VARIABLES) {
    if (env[name]?.trim()) failure(`variable_forbidden:${name.toLowerCase()}`);
  }
  for (const name of Object.keys(env)) {
    if (name.startsWith('PG') && env[name]?.trim()) failure(`variable_forbidden:${name.toLowerCase()}`);
  }
  const runId = required(env, 'CLOUD_TEST_RUN_ID');
  if (!RUN_ID.test(runId) || argv.runId !== runId) failure('run_id_invalid_or_mismatch');
  const caseId = required(env, 'CLOUD_TEST_CASE_ID');
  if (!isSerialCase(caseId) || argv.caseId !== caseId) failure('case_id_invalid_or_mismatch');
  const tlsMode = required(env, 'CLOUD_TEST_TLS_MODE');
  if (tlsMode !== 'system-root') failure('tls_mode_invalid');
  const controlDatabaseUrl = parseControlUrl(required(env, 'CLOUD_TEST_SERIAL_DATABASE_URL')).toString();
  const receiptHmacKey = required(env, 'CLOUD_TEST_RECEIPT_HMAC_KEY');
  if (Buffer.byteLength(receiptHmacKey, 'utf8') < 32) failure('receipt_hmac_key_invalid');
  const targetCertificateSha256 = required(env, 'CLOUD_TEST_TARGET_CERTIFICATE_SHA256').toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(targetCertificateSha256)) failure('target_certificate_sha256_invalid');
  const targetInstanceId = required(env, 'CLOUD_TEST_TARGET_INSTANCE_ID');
  const targetVpcId = required(env, 'CLOUD_TEST_TARGET_VPC_ID');
  if (!/^[a-z0-9][a-z0-9-]{2,127}$/i.test(targetInstanceId) || !/^[a-z0-9][a-z0-9-]{2,127}$/i.test(targetVpcId)) {
    failure('target_profile_identity_invalid');
  }
  const allowedCaseId = required(env, 'CLOUD_TEST_ALLOWED_CASE_ID');
  if (allowedCaseId !== SERIAL_CASE) failure('target_profile_case_invalid');
  const suiteArtifactSha256 = required(env, 'CLOUD_TEST_SUITE_ARTIFACT_SHA256').toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(suiteArtifactSha256)) failure('target_profile_artifact_invalid');
  const tlsCaPath = env.CLOUD_TEST_SERIAL_DATABASE_SSL_CA_PATH?.trim();
  const tlsCa = tlsCaPath ? (() => {
    try { return readFileSync(tlsCaPath, 'utf8'); }
    catch { return failure('tls_ca_unreadable'); }
  })() : undefined;
  return {
    runId,
    caseId,
    tlsMode,
    controlDatabaseUrl,
    receiptHmacKey,
    privateCidrs: parseCloudSmokePrivateCidrs(required(env, 'CLOUD_TEST_PRIVATE_CIDRS')),
    targetCertificateSha256,
    targetInstanceId,
    targetVpcId,
    allowedCaseId,
    suiteArtifactSha256,
    tlsCa,
  };
}

function targetFingerprint(config: CloudTestSerialConfig): string {
  return createHash('sha256')
    .update(`${config.targetInstanceId}\u0000${config.targetVpcId}\u0000${new URL(config.controlDatabaseUrl).host}\u0000${config.targetCertificateSha256}`)
    .digest('hex').slice(0, 20);
}

function childPoolOptions(config: CloudTestSerialConfig, address: string, database: string, startupToken?: string) {
  const url = new URL(config.controlDatabaseUrl);
  return {
    host: address,
    port: Number(url.port || '5432'),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
    ssl: { rejectUnauthorized: true, servername: url.hostname, ...(config.tlsCa ? { ca: config.tlsCa } : {}) },
    ...(startupToken ? { options: `-c meetwise.e2e_run_token=${startupToken}` } : {}),
    max: 1,
    connectionTimeoutMillis: 10_000,
    statement_timeout: 10_000,
  };
}

async function resourceAbsent(client: any, resources: { database: string; role: string }) {
  const result = await client.query(
    'SELECT NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = $1) AS database_absent, NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = $2) AS role_absent',
    [resources.database, resources.role],
  );
  return {
    databaseAbsent: result.rows[0]?.database_absent === true,
    roleAbsent: result.rows[0]?.role_absent === true,
  };
}

/**
 * A private CIDR prevents an accidental public endpoint, but it is not an
 * instance identity. Verify the live TLS peer against the pre-provisioned
 * target profile before creating even the control-ledger database.
 */
function assertCloudTestTargetCertificate(client: any, config: CloudTestSerialConfig): void {
  const stream = client?.connection?.stream as {
    encrypted?: boolean;
    authorized?: boolean;
    getPeerCertificate?: (detailed?: boolean) => { raw?: Buffer };
  } | undefined;
  if (!stream?.encrypted || stream.authorized !== true || typeof stream.getPeerCertificate !== 'function') {
    failure('target_tls_identity_invalid');
  }
  const certificate = stream.getPeerCertificate(true);
  if (!certificate?.raw) failure('target_tls_certificate_missing');
  const actual = createHash('sha256').update(certificate.raw).digest('hex');
  if (actual !== config.targetCertificateSha256) failure('target_certificate_mismatch');
}

async function resourceOid(client: any, resourceKey: 'database' | 'role', name: string): Promise<string | undefined> {
  const result = resourceKey === 'database'
    ? await client.query('SELECT oid::text AS oid FROM pg_database WHERE datname = $1', [name])
    : await client.query('SELECT oid::text AS oid FROM pg_roles WHERE rolname = $1', [name]);
  const oid = result.rows[0]?.oid;
  return typeof oid === 'string' && /^\d+$/.test(oid) ? oid : undefined;
}

async function recordOwnedResource(
  ledgerClient: any,
  input: { runId: string; caseId: string; attemptId: string; fenceToken: string },
  resourceKey: 'database' | 'role',
  name: string,
  controlClient: any,
): Promise<CloudTestOwnedResource> {
  const oid = await resourceOid(controlClient, resourceKey, name);
  if (!oid) failure(`owned_${resourceKey}_oid_missing`);
  await recordCloudTestOwnedResource(ledgerClient, { ...input, resourceKey, name, oid });
  return { name, oid };
}

function resourcesFromManifest(manifest: Record<string, unknown>): { database: string; role: string } {
  const database = (manifest.database as { name?: unknown } | undefined)?.name;
  const role = (manifest.role as { name?: unknown } | undefined)?.name;
  if (typeof database !== 'string' || typeof role !== 'string'
    || !/^meetwise_e2e_[0-9a-f]{32}$/.test(database)
    || !/^mw_e2e_[0-9a-f]{32}$/.test(role)) {
    failure('recovery_manifest_invalid');
  }
  return { database, role };
}

/**
 * Never infer ownership from a familiar name. A cleanup call receives only
 * ledger records produced by the current fenced attempt and checks the OID
 * again before destructive DDL. A missing/changed object stays for manual
 * remediation rather than risking a foreign resource.
 */
async function cleanupOwnedResources(
  client: any,
  resources: { database: string; role: string },
  ownedResources: Record<string, CloudTestOwnedResource>,
): Promise<{ databaseAbsent: boolean; roleAbsent: boolean }> {
  const expectedDatabase = ownedResources.database;
  if (expectedDatabase?.name === resources.database && expectedDatabase.oid) {
    const oid = await resourceOid(client, 'database', resources.database);
    if (oid === expectedDatabase.oid) {
      const owner = await client.query('SELECT pg_get_userbyid(datdba) AS owner FROM pg_database WHERE datname = $1', [resources.database]);
      if (owner.rows[0]?.owner === SERIAL_ADMIN) {
        await client.query(`DROP DATABASE ${quotedIdentifier(resources.database)} WITH (FORCE)`);
      }
    }
  }
  const expectedRole = ownedResources.role;
  if (expectedRole?.name === resources.role && expectedRole.oid) {
    const oid = await resourceOid(client, 'role', resources.role);
    if (oid === expectedRole.oid) {
      await client.query(`DROP ROLE ${quotedIdentifier(resources.role)}`);
    }
  }
  return resourceAbsent(client, resources);
}

async function ensureControlLedgerDatabase(client: any): Promise<void> {
  const existing = await client.query(
    `SELECT pg_get_userbyid(datdba) AS owner
       FROM pg_database
      WHERE datname = $1`,
    [CONTROL_LEDGER_DATABASE],
  );
  if ((existing.rowCount ?? 0) === 0) {
    await client.query(`CREATE DATABASE ${quotedIdentifier(CONTROL_LEDGER_DATABASE)} OWNER ${quotedIdentifier(SERIAL_ADMIN)}`);
    return;
  }
  if (existing.rows[0]?.owner !== SERIAL_ADMIN) failure('control_ledger_database_owner_invalid');
}

async function assertCapabilities(client: any): Promise<void> {
  const roles = await client.query('SELECT rolcreatedb, rolcreaterole FROM pg_roles WHERE rolname = current_user');
  if (roles.rows[0]?.rolcreatedb !== true || roles.rows[0]?.rolcreaterole !== true)
    failure('admin_capability_missing');
  const extensions = await client.query("SELECT name FROM pg_available_extensions WHERE name IN ('pgcrypto', 'vector')");
  if (new Set(extensions.rows.map((row: { name: string }) => row.name)).size !== 2)
    failure('extension_capability_missing');
}

/**
 * The FC build writes this manifest after bundling exact runner code and the
 * source-controlled suite fixtures. It is not supplied by the event or an
 * ambient environment value. A direct local invocation has no cloud target
 * and deliberately fails rather than inventing a digest.
 */
function suiteArtifactDigest(): string {
  const manifestPath = resolve(process.cwd(), 'suite-manifest.json');
  try {
    const parsed = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
    if (parsed.schemaVersion === 1 && typeof parsed.suiteArtifactSha256 === 'string'
      && /^[0-9a-f]{64}$/.test(parsed.suiteArtifactSha256))
      return parsed.suiteArtifactSha256;
  } catch {
    // The bounded failure below intentionally discloses no filesystem path.
  }
  failure('suite_artifact_manifest_invalid');
}

function assertCloudTestTargetProfile(config: CloudTestSerialConfig, artifactDigest: string): void {
  if (config.caseId !== config.allowedCaseId) failure('target_profile_case_denied');
  if (artifactDigest !== config.suiteArtifactSha256) failure('target_profile_artifact_mismatch');
}

/**
 * Executes the only currently safe database-local cloud case. Full migration,
 * RLS and pgvector proof suites remain blocked until a resettable dedicated
 * cluster can supply cluster-global role isolation and recovery evidence.
 */
export async function runCloudTestSerial(
  argv: { runId?: string; caseId?: string },
  env: NodeJS.ProcessEnv = process.env,
): Promise<CloudTestSerialReceipt> {
  const config = resolveCloudTestSerialConfig(argv, env);
  // Fixed role/default-ACL migrations are cluster-scoped. They cannot share
  // this first database-local runner until the project provisions a resettable
  // exclusive RDS cluster with a separately reviewed role lifecycle.
  if (config.caseId !== SERIAL_CASE) failure('case_requires_resettable_cluster');
  const artifactDigest = suiteArtifactDigest();
  // This is intentionally before DNS, socket creation and all writable DDL.
  assertCloudTestTargetProfile(config, artifactDigest);
  const plannedResources = exactRunResource(config.runId, artifactDigest);
  const address = await resolveCloudSmokePrivateHost(config.controlDatabaseUrl, config.privateCidrs);
  const control = new Pool(childPoolOptions(config, address, CONTROL_DATABASE));
  let ledgerPool: any | undefined;
  let ledgerClient: any | undefined;
  let lockHeld = false;
  let stage = 'connect_control';
  try {
    const client = await control.connect();
    let activeAttempt: { runId: string; caseId: string; attemptId: string; fenceToken: string } | undefined;
    let activeResources: { database: string; role: string } | undefined;
    let activeOwnedResources: Record<string, CloudTestOwnedResource> = {};
    try {
      stage = 'verify_control_peer';
      assertCloudSmokePrivatePeer((client as any).connection?.stream?.remoteAddress, config.privateCidrs, address);
      stage = 'verify_target_certificate';
      assertCloudTestTargetCertificate(client, config);
      stage = 'acquire_instance_lock';
      const lock = await client.query("SELECT pg_try_advisory_lock(hashtextextended('meetwise:cloud-test:serial', 0)) AS acquired");
      if (lock.rows[0]?.acquired !== true) failure('lock_unavailable');
      lockHeld = true;
      stage = 'verify_capabilities';
      await assertCapabilities(client);
      stage = 'ensure_control_ledger_database';
      await ensureControlLedgerDatabase(client);
      ledgerPool = new Pool(childPoolOptions(config, address, CONTROL_LEDGER_DATABASE));
      ledgerClient = await ledgerPool.connect();
      assertCloudSmokePrivatePeer((ledgerClient as any).connection?.stream?.remoteAddress, config.privateCidrs, address);
      assertCloudTestTargetCertificate(ledgerClient, config);
      stage = 'begin_run_ledger';
      const ledger = await beginCloudTestRun(ledgerClient, {
        runId: config.runId,
        caseId: config.caseId,
        artifactDigest,
        resourceManifest: {
          resourceClass: 'database_local',
          runAttemptScoped: true,
          database: { name: plannedResources.database },
          role: { name: plannedResources.role },
        },
        receiptHmacKey: config.receiptHmacKey,
      });
      if (ledger.kind === 'replay') return ledger.receipt as CloudTestSerialReceipt;
      if (ledger.kind === 'recover') {
        stage = 'recover_expired_attempt';
        const resources = resourcesFromManifest(ledger.resourceManifest);
        const cleanup = await cleanupOwnedResources(client, resources, ledger.ownedResources);
        const receipt: CloudTestSerialReceipt = {
          kind: 'cloud_test_serial_receipt', runId: config.runId, caseId: config.caseId,
          status: cleanup.databaseAbsent && cleanup.roleAbsent ? 'failed' : 'failed_cleanup',
          testOnly: true, releaseEvidence: false, tlsVerification: 'system-root',
          targetFingerprint: targetFingerprint(config), cleanup,
          failureCode: cleanup.databaseAbsent && cleanup.roleAbsent
            ? 'expired_attempt_recovered'
            : 'expired_attempt_cleanup_incomplete',
        };
        await completeCloudTestRun(ledgerClient, {
          runId: config.runId, caseId: config.caseId, attemptId: ledger.attemptId,
          fenceToken: ledger.fenceToken, receipt, receiptHmacKey: config.receiptHmacKey,
        });
        return receipt;
      }
      const resources = plannedResources;
      const ledgerAttempt = {
        runId: config.runId,
        caseId: config.caseId,
        attemptId: ledger.attemptId,
        fenceToken: ledger.fenceToken,
      };
      activeAttempt = ledgerAttempt;
      activeResources = resources;
      stage = 'create_run_role';
      await recordCloudTestResourceIntent(ledgerClient, { ...ledgerAttempt, resourceKey: 'role', name: resources.role });
      await client.query(`CREATE ROLE ${quotedIdentifier(resources.role)} NOLOGIN`);
      activeOwnedResources = { ...activeOwnedResources, role: await recordOwnedResource(ledgerClient, ledgerAttempt, 'role', resources.role, client) };
      // The executor must remain database owner to create the extension/index
      // capability probe. The generated role is still created and removed to
      // prove CREATEROLE without becoming a reusable database owner.
      stage = 'create_run_database';
      await recordCloudTestResourceIntent(ledgerClient, { ...ledgerAttempt, resourceKey: 'database', name: resources.database });
      await client.query(`CREATE DATABASE ${quotedIdentifier(resources.database)} OWNER ${quotedIdentifier(SERIAL_ADMIN)}`);
      activeOwnedResources = { ...activeOwnedResources, database: await recordOwnedResource(ledgerClient, ledgerAttempt, 'database', resources.database, client) };
      const child = new Pool(childPoolOptions(config, address, resources.database));
      try {
        stage = 'connect_run_database';
        const childClient: any = await child.connect();
        try {
          stage = 'verify_run_database_peer';
          assertCloudSmokePrivatePeer((childClient as any).connection?.stream?.remoteAddress, config.privateCidrs, address);
          assertCloudTestTargetCertificate(childClient, config);
          stage = 'probe_extensions';
          await childClient.query('CREATE EXTENSION pgcrypto');
          await childClient.query('CREATE EXTENSION vector');
          await childClient.query('CREATE TABLE mw_e2e_vector_probe (id integer PRIMARY KEY, embedding vector(3) NOT NULL)');
          await childClient.query('CREATE INDEX mw_e2e_vector_probe_hnsw ON mw_e2e_vector_probe USING hnsw (embedding vector_l2_ops)');
        } finally {
          childClient.release();
        }
      } finally {
        // A checked-out migration client has already committed or rolled back
        // before `runMigrations` releases it. A late socket-close emitted by
        // the pool during shutdown must not mask that outcome or prevent the
        // exact database/role cleanup below.
        await child.end().catch(() => {});
      }
      stage = 'cleanup_owned_resources';
      const cleanup = await cleanupOwnedResources(client, resources, activeOwnedResources);
      stage = 'verify_cleanup';
      const receipt: CloudTestSerialReceipt = !cleanup.databaseAbsent || !cleanup.roleAbsent
        ? { kind: 'cloud_test_serial_receipt', runId: config.runId, caseId: config.caseId, status: 'failed_cleanup', testOnly: true, releaseEvidence: false, tlsVerification: 'system-root', targetFingerprint: targetFingerprint(config), cleanup, failureCode: 'cleanup_incomplete' }
        : { kind: 'cloud_test_serial_receipt', runId: config.runId, caseId: config.caseId, status: 'passed', testOnly: true, releaseEvidence: false, tlsVerification: 'system-root', targetFingerprint: targetFingerprint(config), cleanup };
      stage = 'complete_run_ledger';
      await completeCloudTestRun(ledgerClient, { ...ledgerAttempt, receipt, receiptHmacKey: config.receiptHmacKey });
      activeAttempt = undefined;
      return receipt;
    } catch (error) {
      // Once an attempt holds a ledger fence, every controlled failure records
      // a terminal receipt.  Cleanup is intentionally limited to resources
      // whose OID was written by this attempt; an intent without ownership
      // proof becomes failed_cleanup for a human, never a blind DROP.
      if (ledgerClient && activeAttempt && activeResources) {
        let cleanup = { databaseAbsent: false, roleAbsent: false };
        try {
          cleanup = await cleanupOwnedResources(client, activeResources, activeOwnedResources);
        } catch {
          // The terminal receipt below records this bounded cleanup failure.
        }
        const serialCode = cloudTestSerialFailure(error).replace(/^cloud_test_serial_/, '');
        const receipt: CloudTestSerialReceipt = {
          kind: 'cloud_test_serial_receipt', runId: config.runId, caseId: config.caseId,
          status: cleanup.databaseAbsent && cleanup.roleAbsent ? 'failed' : 'failed_cleanup',
          testOnly: true, releaseEvidence: false, tlsVerification: 'system-root',
          targetFingerprint: targetFingerprint(config), cleanup,
          failureCode: cleanup.databaseAbsent && cleanup.roleAbsent
            ? `stage_${stage}_${serialCode}`.slice(0, 120)
            : 'cleanup_incomplete',
        };
        try {
          await completeCloudTestRun(ledgerClient, { ...activeAttempt, receipt, receiptHmacKey: config.receiptHmacKey });
          activeAttempt = undefined;
          return receipt;
        } catch {
          // A successor can take over only after the persisted lease expires.
        }
      }
      const known = cloudTestSerialFailure(error);
      throw new Error(known);
    } finally {
      if (lockHeld) await client.query("SELECT pg_advisory_unlock(hashtextextended('meetwise:cloud-test:serial', 0))").catch(() => {});
      ledgerClient?.release();
      ledgerClient = undefined;
      await ledgerPool?.end().catch(() => {});
      ledgerPool = undefined;
      client.release();
    }
  } finally {
    await control.end().catch(() => {});
  }
  return failure('control_execution_ended');
}

export function cloudTestSerialFailure(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (message.startsWith('cloud_test_serial_')) return message;
  // Reuse the smoke classifier so a cloud receipt stays diagnosable without
  // exposing a hostname, SQL text, or credential-bearing driver message.
  const cloudCode = cloudSmokeFailure(error);
  if (cloudCode.startsWith('cloud_smoke_'))
    return `cloud_test_serial_${cloudCode.slice('cloud_smoke_'.length)}`;
  return 'cloud_test_serial_unexpected_failure';
}

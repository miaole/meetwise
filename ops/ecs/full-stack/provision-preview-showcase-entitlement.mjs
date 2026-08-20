#!/usr/bin/env node
/**
 * Root/controller-only finite preview entitlement grant and read-only verifier.
 *
 * This tool deliberately has no payment path.  The deterministic source label
 * is only an idempotency identity for the preview gift bucket.  It reads the
 * migration connection file directly (never process.env) and emits only a
 * redacted receipt on success.
 */
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdir, open, readFile, rename, rm, lstat } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export const MIGRATION_ENV_PATH = '/etc/meetwise/full-stack-migrate.env';
export const TARGET_PATH = '/etc/meetwise/preview-synthetic-target.json';
export const APPROVAL_PATH = '/etc/meetwise/full-stack-release.json';
export const RECEIPT_PATH = '/var/lib/meetwise-preview-controller/preview-showcase-entitlement.json';
export const OWNER_EMAIL = 'previewc@meetwise.com';
export const GIFT_UNITS = 6;
export const GIFT_TTL_SECONDS = 86_400;
export const LOCK_KEY = 'meetwise:preview-showcase-entitlement:v1';
const CONTROLLER_ACTOR = 'preview-entitlement-controller';
const MIGRATION_ROLE = 'meetwise_migrate';

export function grantIdentity(now = new Date()) {
  const epoch = now.toISOString().slice(0, 10);
  const sourceOrderId = `preview-showcase-gift:v2:${epoch}:${OWNER_EMAIL}`;
  const hex = digest(sourceOrderId).slice(0, 32).split('');
  hex[12] = '4';
  hex[16] = ['8', '9', 'a', 'b'][Number.parseInt(hex[16], 16) % 4];
  const raw = hex.join('');
  return { epoch, sourceOrderId, bucketId: `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}` };
}

export function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
}

export function digest(value) {
  return createHash('sha256').update(typeof value === 'string' ? value : canonicalJson(value)).digest('hex');
}

export function assertRoot(uid = process.getuid?.()) {
  if (uid !== 0) throw new Error('preview_entitlement_controller_root_required');
}

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

export function validateTarget(target) {
  if (!target || target.database !== 'meetwise_cloud_test') fail('preview_entitlement_target_database_invalid');
  if (target.expectedDbRole !== 'meetwise_preview_audit') fail('preview_entitlement_target_role_invalid');
  for (const key of ['schemaHead', 'schemaLedgerDigest', 'releaseTreeDigest']) {
    if (typeof target[key] !== 'string' || !target[key]) fail(`preview_entitlement_target_${key}_missing`);
  }
  return target;
}

export function buildBinding(target, approval = null) {
  validateTarget(target);
  const targetDigest = digest(target);
  if (approval && (approval.targetDigest !== targetDigest || !/^[a-f0-9]{40}$/.test(approval.commit ?? '') || !/^[a-f0-9]{40}$/.test(approval.tree ?? ''))) fail('preview_entitlement_approval_binding_invalid');
  const releaseIdentity = approval ? `${approval.commit}:${approval.tree}` : (target.releaseIdentity || `tree:${target.releaseTreeDigest}`);
  return {
    targetDigest,
    releaseIdentity,
    schemaHead: target.schemaHead,
    schemaLedgerDigest: target.schemaLedgerDigest,
  };
}

export function validateAccount(row) {
  if (!row || row.email !== OWNER_EMAIL) fail('preview_entitlement_owner_email_invalid');
  if (row.role !== 'candidate') fail('preview_entitlement_owner_role_invalid');
  if (row.status !== 'active') fail('preview_entitlement_owner_status_invalid');
  if (!row.id) fail('preview_entitlement_owner_id_missing');
  return row;
}

export function classifyBucket({ bucket, now = new Date() }) {
  if (!bucket) return { operation: 'create' };
  if (bucket.owner_user_id !== undefined && !bucket.owner_user_id) fail('preview_entitlement_bucket_owner_missing');
  if (bucket.owner_user_id !== undefined && bucket.owner_user_id !== bucket.expected_owner_user_id) fail('preview_entitlement_bucket_wrong_owner');
  if (bucket.kind !== 'gift' || Number(bucket.units_total) !== GIFT_UNITS) fail('preview_entitlement_bucket_shape_invalid');
  if (Number(bucket.units_reserved || 0) + Number(bucket.units_consumed || 0) > GIFT_UNITS) fail('preview_entitlement_bucket_capacity_invalid');
  if (!bucket.expires_at || new Date(bucket.expires_at).getTime() <= now.getTime()) fail('preview_entitlement_existing_bucket_expired');
  return { operation: 'replayed', bucket };
}

export function decideGrant({ accountRows, sourceRows, bucketIdRows, now = new Date() }) {
  if (!Array.isArray(accountRows) || accountRows.length !== 1) fail('preview_entitlement_owner_cardinality_invalid');
  const account = validateAccount(accountRows[0]);
  if (!Array.isArray(sourceRows) || sourceRows.length > 1) fail('preview_entitlement_existing_source_bucket_conflict');
  if (sourceRows.length === 1) {
    const bucket = { ...sourceRows[0], expected_owner_user_id: account.id };
    classifyBucket({ bucket, now });
    return { account, operation: 'replayed', bucket };
  }
  if (!Array.isArray(bucketIdRows) || bucketIdRows.length > 1) fail('preview_entitlement_bucket_identity_conflict');
  if (bucketIdRows.length === 1) fail('preview_entitlement_bucket_identity_conflict');
  return { account, operation: 'create' };
}

export function assertActiveEpochLimit(activeCount, operation) {
  if (!Number.isSafeInteger(activeCount) || activeCount < 0) fail('preview_entitlement_active_epoch_count_invalid');
  // A UTC-day grant can overlap the preceding 24-hour grant.  A third live
  // epoch is never needed and would turn the preview allowance into an
  // unbounded mint.  Same-epoch replay remains available at the limit.
  if (operation === 'create' && activeCount >= 2) fail('preview_entitlement_active_epoch_limit_exceeded');
}

export function isExpired(expiresAt, now = new Date()) {
  return new Date(expiresAt).getTime() <= now.getTime();
}

export function schemaBindingFromLedger(rows) {
  if (!Array.isArray(rows) || rows.length === 0) fail('preview_entitlement_schema_ledger_empty');
  const ordered = [...rows].sort((a, b) => String(a.version).localeCompare(String(b.version)));
  return { schemaHead: `${ordered.at(-1).version}.sql`, schemaLedgerDigest: digest(ordered.map((row) => ({ version: row.version, checksum: row.checksum }))) };
}

export function buildReceipt({ account, bucket, operation, binding, identity, expiresAt, verifiedAt = new Date().toISOString() }) {
  const unitsReserved = Number(bucket.units_reserved ?? 0);
  const unitsConsumed = Number(bucket.units_consumed ?? 0);
  const unitsAvailable = GIFT_UNITS - unitsReserved - unitsConsumed;
  if (![unitsReserved, unitsConsumed, unitsAvailable].every(Number.isFinite) || unitsReserved < 0 || unitsConsumed < 0 || unitsAvailable < 0) fail('preview_entitlement_receipt_balance_invalid');
  const unsigned = {
    schemaVersion: 1,
    receiptKind: 'preview-showcase-entitlement',
    phase: 'granted',
    operation,
    ownerUserId: account.id,
    ownerEmail: OWNER_EMAIL,
    ownerRole: 'candidate',
    bucketId: bucket.id || identity.bucketId,
    kind: 'gift',
    unitsTotal: GIFT_UNITS,
    unitsReserved,
    unitsConsumed,
    unitsAvailable,
    expiresAt,
    sourceOrderId: identity.sourceOrderId,
    grantEpoch: identity.epoch,
    ...binding,
    verifiedAt,
    paymentOrderTouched: false,
  };
  return { ...unsigned, receiptDigest: digest(unsigned) };
}

function parseEnv(text) {
  const result = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const match = /^(?:export\s+)?([A-Z][A-Z0-9_]*)=(.*)$/.exec(line);
    if (!match || /[`;$]|\$\(/.test(match[2])) fail('preview_entitlement_migration_env_invalid');
    let value = match[2].trim();
    if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) value = value.slice(1, -1);
    result[match[1]] = value;
  }
  return result;
}

async function assertOwnedFile(path, modeMask = 0o022) {
  const stat = await lstat(path);
  if (!stat.isFile() || stat.uid !== 0 || (stat.mode & modeMask) !== 0) fail('preview_entitlement_controller_file_unsafe');
  return stat;
}

async function readMigrationConfig() {
  const stat = await assertOwnedFile(MIGRATION_ENV_PATH, 0o077);
  if ((stat.mode & 0o077) !== 0) fail('preview_entitlement_migration_env_mode_invalid');
  const env = parseEnv(await readFile(MIGRATION_ENV_PATH, 'utf8'));
  const keys = ['DATABASE_URL', 'MIGRATION_DATABASE_URL'].filter((key) => env[key]);
  if (keys.length !== 1) fail('preview_entitlement_migration_database_url_missing');
  const url = env[keys[0]];
  if (!/^postgres(?:ql)?:\/\//.test(url) || /\s/.test(url)) fail('preview_entitlement_migration_database_url_invalid');
  const parsed = new URL(url);
  if (decodeURIComponent(parsed.pathname.replace(/^\//, '')) !== 'meetwise_cloud_test') fail('preview_entitlement_migration_database_invalid');
  const sslPath = env.DATABASE_SSL_CA_PATH;
  let ssl;
  if (sslPath) {
    if (!sslPath.startsWith('/')) fail('preview_entitlement_migration_ca_invalid');
    await assertOwnedFile(sslPath, 0o022);
    ssl = { ca: await readFile(sslPath, 'utf8'), rejectUnauthorized: true, ...(env.PG_TLS_SERVERNAME ? { servername: env.PG_TLS_SERVERNAME } : {}) };
  }
  return { url, ...(ssl ? { ssl } : {}) };
}

async function readTarget() {
  await assertOwnedFile(TARGET_PATH, 0o022);
  return validateTarget(JSON.parse(await readFile(TARGET_PATH, 'utf8')));
}

async function readApproval() {
  await assertOwnedFile(APPROVAL_PATH, 0o077);
  return JSON.parse(await readFile(APPROVAL_PATH, 'utf8'));
}

function pgPool(config) {
  const require = createRequire('/srv/meetwise-full-stack/current/packages/db/package.json');
  const { Pool } = require('pg');
  return new Pool({ connectionString: config.url, ...(config.ssl ? { ssl: config.ssl } : {}) });
}

async function writeReceipt(receipt) {
  await mkdir(dirname(RECEIPT_PATH), { recursive: true, mode: 0o700 });
  const temp = `${RECEIPT_PATH}.tmp-${process.pid}`;
  let file;
  try {
    file = await open(temp, 'wx', 0o600);
    await file.writeFile(`${JSON.stringify(receipt)}\n`);
    await file.sync();
    await file.close(); file = null;
    await rename(temp, RECEIPT_PATH);
    const directory = await open(dirname(RECEIPT_PATH), 'r');
    try { await directory.sync(); } finally { await directory.close(); }
  } catch (error) {
    if (file) await file.close().catch(() => {});
    await rm(temp, { force: true }).catch(() => {});
    throw error;
  }
}

function printReceipt(receipt) {
  process.stdout.write(`${JSON.stringify(receipt)}\n`);
}

async function run(mode) {
  assertRoot();
  if (!['write', 'verify'].includes(mode)) fail('preview_entitlement_mode_required');
  const target = await readTarget();
  const approval = await readApproval();
  const binding = buildBinding(target, approval);
  const grant = grantIdentity();
  const config = await readMigrationConfig();
  const pool = pgPool(config);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [LOCK_KEY]);
    const identity = await client.query('SELECT current_database() AS database, current_user AS role');
    // This is the only controller mutation and therefore deliberately uses
    // the separately protected migration identity.  The target's
    // meetwise_preview_audit identity remains the read-only receipt verifier;
    // conflating the two would make the grant impossible or over-privilege the
    // verifier.
    if (identity.rows[0]?.database !== target.database || identity.rows[0]?.role !== MIGRATION_ROLE) fail('preview_entitlement_database_identity_invalid');
    const ledger = (await client.query('SELECT version, checksum FROM public.schema_migrations ORDER BY version')).rows;
    const liveSchema = schemaBindingFromLedger(ledger);
    if (liveSchema.schemaHead !== target.schemaHead || liveSchema.schemaLedgerDigest !== target.schemaLedgerDigest) fail('preview_entitlement_schema_binding_invalid');
    const accountResult = await client.query('SELECT id,email,role,status FROM public.user_account WHERE email=$1 FOR UPDATE', [OWNER_EMAIL]);
    const account = validateAccount(accountResult.rows[0]);
    const activeEpochs = await client.query("SELECT id FROM public.entitlement_bucket WHERE owner_user_id=$1 AND (source_order_id LIKE 'preview-showcase-gift:v2:%:previewc@meetwise.com' OR source_order_id='preview-showcase-gift:v1:previewc@meetwise.com') AND expires_at > now() FOR UPDATE", [account.id]);
    const sourceResult = await client.query('SELECT id,owner_user_id,kind,units_total,units_reserved,units_consumed,expires_at,source_order_id,version FROM public.entitlement_bucket WHERE source_order_id=$1 FOR UPDATE', [grant.sourceOrderId]);
    if (sourceResult.rows.some((row) => row.owner_user_id !== account.id)) fail('preview_entitlement_bucket_wrong_owner');
    const idResult = await client.query('SELECT id,owner_user_id,kind,units_total,units_reserved,units_consumed,expires_at,source_order_id,version FROM public.entitlement_bucket WHERE id=$1 FOR UPDATE', [grant.bucketId]);
    const decision = decideGrant({ accountRows: [account], sourceRows: sourceResult.rows, bucketIdRows: idResult.rows });
    assertActiveEpochLimit(activeEpochs.rows.length, decision.operation);
    if (mode === 'verify') {
      if (decision.operation !== 'replayed') fail('preview_entitlement_missing');
      if (isExpired(decision.bucket.expires_at)) fail('preview_entitlement_expired');
      await client.query('ROLLBACK');
      const receipt = buildReceipt({ account, bucket: decision.bucket, operation: 'verified', binding, identity: grant, expiresAt: new Date(decision.bucket.expires_at).toISOString() });
      printReceipt({ ...receipt, phase: 'verified' });
      return;
    }
    let bucket = decision.bucket;
    let expiresAt = bucket?.expires_at;
    if (decision.operation === 'create') {
      expiresAt = new Date(Date.now() + GIFT_TTL_SECONDS * 1000).toISOString();
      const inserted = await client.query('INSERT INTO public.entitlement_bucket (id,owner_user_id,kind,units_total,expires_at,source_order_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id,owner_user_id,kind,units_total,units_reserved,units_consumed,expires_at,source_order_id,version', [grant.bucketId, account.id, 'gift', GIFT_UNITS, expiresAt, grant.sourceOrderId]);
      bucket = inserted.rows[0];
      await client.query('INSERT INTO public.admin_audit (id,actor,action,target,detail) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING', [`preview-showcase-gift-v2:${grant.epoch}:${account.id}`, CONTROLLER_ACTOR, 'grant_entitlement', account.id, JSON.stringify({ sourceOrderId: grant.sourceOrderId, grantEpoch: grant.epoch, unitsTotal: GIFT_UNITS, expiresAt, ...binding })]);
    }
    await client.query('COMMIT');
    const receipt = buildReceipt({ account, bucket, operation: decision.operation, binding, identity: grant, expiresAt });
    await writeReceipt(receipt);
    printReceipt(receipt);
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const modeIndex = process.argv.indexOf('--mode');
  run(modeIndex >= 0 ? process.argv[modeIndex + 1] : undefined).catch((error) => {
    process.stderr.write(`${error.code || 'preview_entitlement_failed'}\n`);
    process.exitCode = 1;
  });
}

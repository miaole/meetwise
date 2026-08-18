/**
 * Read-only cloud data-plane readiness probe.
 *
 * This is intentionally not a migration or a destructive E2E entrypoint.  It
 * accepts only a separately provisioned `CLOUD_TEST_*` target and refuses any
 * runtime/migration connection variable before it opens a socket.  A positive
 * result proves only private test-target reachability; it never promotes a
 * release and never substitutes for a TargetGrant-protected cloud E2E run.
 */
import { createHmac } from 'node:crypto';
import { lookup as dnsLookup } from 'node:dns/promises';
import { readFileSync } from 'node:fs';

const RUN_ID = /^[a-z0-9][a-z0-9-]{5,62}$/;
const TEST_DATABASE_PREFIX = 'meetwise_e2e_';
const FIXED_READONLY_DATABASE = 'meetwise_cloud_test';
const FIXED_READONLY_ACK = 'I_UNDERSTAND_FIXED_TARGET_IS_READ_ONLY';
const CLOUD_SMOKE_DATABASE_ROLE = 'meetwise_cloud_smoke_reader';
// Tair custom-account names are limited to 16 characters.  Keep this
// distinct from the PostgreSQL role instead of asking the provider to accept
// an invalid, longer cross-product name.
const CLOUD_SMOKE_REDIS_USER = 'mw_cloud_smoke';
const FORBIDDEN_RUNTIME_VARIABLES = [
  'DATABASE_URL', 'RUNTIME_DATABASE_URL', 'MIGRATION_DATABASE_URL', 'RAG_REDIS_URL',
] as const;
const FORBIDDEN_AMBIENT_VARIABLES = ['REDIS_URL', 'REDISCLI_AUTH'] as const;

export type CloudSmokeConfig = {
  runId: string;
  targetKind: 'run-scoped' | 'fixed-readonly';
  tlsMode: 'system-root' | 'vpc-test-only-no-verify';
  databaseUrl: string;
  /** Optional private CA. When absent, TLS uses Node's trusted roots. */
  databaseCa?: string;
  redisUrl: string;
  /** Optional private CA. When absent, TLS uses Node's trusted roots. */
  redisCa?: string;
  receiptHmacKey: string;
  privateCidrs: string[];
};

export type CloudSmokeTarget = {
  targetKind: CloudSmokeConfig['targetKind'];
  databaseName: string;
  databaseFingerprint: string;
  redisFingerprint: string;
};

function nonEmpty(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function smokeError(code: string): never {
  throw new Error(`cloud_smoke_${code}`);
}

function isLoopbackHost(host: string): boolean {
  const normalized = host.replace(/\.$/, '').replace(/^\[|\]$/g, '').toLowerCase();
  return normalized === 'localhost' || normalized === '::1' || normalized === '0:0:0:0:0:0:0:1'
    || /^127(?:\.\d{1,3}){3}$/.test(normalized) || /^::ffff:127(?:\.\d{1,3}){3}$/.test(normalized)
    || /^169\.254(?:\.\d{1,3}){2}$/.test(normalized) || /^fe[89ab][0-9a-f]*:/i.test(normalized);
}

function ipv4AsInt(value: string): number | undefined {
  const parts = value.split('.');
  if (parts.length !== 4) return undefined;
  let result = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return undefined;
    const octet = Number(part);
    if (octet > 255) return undefined;
    result = (result << 8) | octet;
  }
  return result >>> 0;
}

function isRfc1918Ipv4(value: number): boolean {
  return ((value & 0xff000000) >>> 0) === 0x0a000000
    || ((value & 0xfff00000) >>> 0) === 0xac100000
    || ((value & 0xffff0000) >>> 0) === 0xc0a80000;
}

export function parseCloudSmokePrivateCidrs(raw: string | undefined): string[] {
  const parts = raw?.split(',').map((value) => value.trim()).filter(Boolean) ?? [];
  if (parts.length === 0) smokeError('private_cidrs_missing');
  for (const cidr of parts) {
    const [address, prefix, extra] = cidr.split('/');
    if (extra !== undefined || ipv4AsInt(address ?? '') === undefined || !/^\d{1,2}$/.test(prefix ?? '') || Number(prefix) > 32)
      smokeError('private_cidrs_invalid');
    const network = ipv4AsInt(address!);
    const prefixNumber = Number(prefix);
    const mask = prefixNumber === 0 ? 0 : (0xffffffff << (32 - prefixNumber)) >>> 0;
    const first = network! & mask;
    const last = (first | (~mask >>> 0)) >>> 0;
    // An allowlist such as 0.0.0.0/0 or 10.0.0.0/7 would let a DNS answer
    // escape the VPC despite having a syntactically valid CIDR.  Accept only a
    // range wholly contained in an RFC1918 private allocation.
    if (!isRfc1918Ipv4(first) || !isRfc1918Ipv4(last)) smokeError('private_cidrs_not_rfc1918');
  }
  return parts;
}

function ipv4InCidrs(address: string, cidrs: readonly string[]): boolean {
  const value = ipv4AsInt(address);
  if (value === undefined) return false;
  return cidrs.some((cidr) => {
    const [network, prefixRaw] = cidr.split('/');
    const prefix = Number(prefixRaw);
    const networkInt = ipv4AsInt(network ?? '');
    if (networkInt === undefined) return false;
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    return (value & mask) === (networkInt & mask);
  });
}

function readOptionalCa(path: string | undefined, code: string): string | undefined {
  if (!path) return undefined;
  try { return readFileSync(path, 'utf8'); }
  catch { return smokeError(`${code}_unreadable`); }
}

function parseUrl(raw: string | undefined, allowedProtocols: readonly string[], code: string): URL {
  if (!raw) smokeError(`${code}_missing`);
  let parsed: URL;
  try { parsed = new URL(raw); } catch { return smokeError(`${code}_invalid`); }
  if (!allowedProtocols.includes(parsed.protocol) || !parsed.hostname || isLoopbackHost(parsed.hostname))
    smokeError(`${code}_invalid`);
  // `pg` and node-redis parse URL search parameters after supplied options.
  // Allowing even a harmless-looking query could therefore replace the pinned
  // host, port, TLS mode, database, or dedicated credential after our checks.
  if (parsed.search || parsed.hash) smokeError(`${code}_query_or_fragment_forbidden`);
  return parsed;
}

function requireDedicatedCredential(url: URL, expectedUser: string, code: string): void {
  const user = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  if (user !== expectedUser || !password) smokeError(`${code}_credential_invalid`);
}

function expectedDatabaseName(runId: string): string {
  return `${TEST_DATABASE_PREFIX}${runId.replace(/-/g, '_')}`;
}

function targetKind(env: NodeJS.ProcessEnv): CloudSmokeConfig['targetKind'] {
  const raw = nonEmpty(env.CLOUD_TEST_TARGET_KIND) ?? 'run-scoped';
  if (raw === 'run-scoped' || raw === 'fixed-readonly') return raw;
  return smokeError('target_kind_invalid');
}

function tlsMode(env: NodeJS.ProcessEnv): CloudSmokeConfig['tlsMode'] {
  const raw = nonEmpty(env.CLOUD_TEST_TLS_MODE) ?? 'system-root';
  if (raw === 'system-root' || raw === 'vpc-test-only-no-verify') return raw;
  return smokeError('tls_mode_invalid');
}

function expectedTargetDatabase(
  kind: CloudSmokeConfig['targetKind'],
  runId: string,
  env: NodeJS.ProcessEnv,
): string {
  if (kind === 'run-scoped') return expectedDatabaseName(runId);
  if (nonEmpty(env.CLOUD_TEST_FIXED_READONLY_ACK) !== FIXED_READONLY_ACK)
    smokeError('fixed_readonly_ack_missing');
  return FIXED_READONLY_DATABASE;
}

/** Pure validation: deliberately performs no network I/O. */
export function resolveCloudSmokeConfig(
  argvRunId: string | undefined,
  env: NodeJS.ProcessEnv = process.env,
): CloudSmokeConfig {
  for (const name of FORBIDDEN_RUNTIME_VARIABLES) {
    if (nonEmpty(env[name])) smokeError(`runtime_variable_forbidden:${name.toLowerCase()}`);
  }
  for (const name of FORBIDDEN_AMBIENT_VARIABLES) {
    if (nonEmpty(env[name])) smokeError(`ambient_variable_forbidden:${name.toLowerCase()}`);
  }
  for (const name of Object.keys(env)) {
    if (name.startsWith('PG') && nonEmpty(env[name])) smokeError(`ambient_variable_forbidden:${name.toLowerCase()}`);
  }
  const runId = nonEmpty(env.CLOUD_TEST_RUN_ID);
  if (!runId || !RUN_ID.test(runId)) smokeError('run_id_invalid');
  if (!argvRunId || argvRunId !== runId) smokeError('run_id_mismatch');
  const kind = targetKind(env);
  const resolvedTlsMode = tlsMode(env);
  if (resolvedTlsMode === 'vpc-test-only-no-verify' && kind !== 'fixed-readonly')
    smokeError('tls_mode_not_allowed_for_run_scoped');
  const database = parseUrl(nonEmpty(env.CLOUD_TEST_DATABASE_URL), ['postgres:', 'postgresql:'], 'database_url');
  requireDedicatedCredential(database, CLOUD_SMOKE_DATABASE_ROLE, 'database_url');
  const databaseName = decodeURIComponent(database.pathname.replace(/^\//, ''));
  if (databaseName !== expectedTargetDatabase(kind, runId, env))
    smokeError(kind === 'run-scoped' ? 'database_name_not_bound_to_run' : 'fixed_readonly_database_mismatch');
  const redis = parseUrl(nonEmpty(env.CLOUD_TEST_REDIS_URL), ['rediss:'], 'redis_url');
  requireDedicatedCredential(redis, CLOUD_SMOKE_REDIS_USER, 'redis_url');
  if (redis.pathname !== '/0') smokeError('redis_url_database_invalid');
  const receiptHmacKey = nonEmpty(env.CLOUD_TEST_RECEIPT_HMAC_KEY);
  if (!receiptHmacKey || Buffer.byteLength(receiptHmacKey, 'utf8') < 32) smokeError('receipt_hmac_key_invalid');
  return {
    runId,
    targetKind: kind,
    tlsMode: resolvedTlsMode,
    databaseUrl: database.toString(),
    databaseCa: readOptionalCa(nonEmpty(env.CLOUD_TEST_DATABASE_SSL_CA_PATH), 'database_ca'),
    redisUrl: redis.toString(),
    redisCa: readOptionalCa(nonEmpty(env.CLOUD_TEST_REDIS_TLS_CA_PATH), 'redis_ca'),
    receiptHmacKey,
    privateCidrs: parseCloudSmokePrivateCidrs(nonEmpty(env.CLOUD_TEST_PRIVATE_CIDRS)),
  };
}

/**
 * Resolve both service hostnames immediately before opening sockets.  This is
 * not a cloud identity attestation, but it blocks accidental public/loopback
 * endpoints and DNS answers outside the explicitly supplied VPC CIDR set.
 * The caller must still verify its actual PostgreSQL peer before issuing SQL.
 */
export type CloudSmokeDnsLookup = (host: string) => Promise<Array<{ address: string; family: number }>>;

export type CloudSmokeResolvedHosts = { databaseAddress: string; redisAddress: string };

/** Resolve one validated private target and retain the exact address for socket pinning. */
export async function resolveCloudSmokePrivateHost(
  rawUrl: string,
  privateCidrs: readonly string[],
  lookup: CloudSmokeDnsLookup = (host) => dnsLookup(host, { all: true, verbatim: true }),
): Promise<string> {
  const host = new URL(rawUrl).hostname;
  const answers = await lookup(host);
  if (answers.length === 0 || answers.some((answer) => answer.family !== 4 || !ipv4InCidrs(answer.address, privateCidrs)))
    smokeError('dns_target_not_private');
  return answers[0]!.address;
}

export async function assertCloudSmokeHostsPrivate(
  config: CloudSmokeConfig,
  lookup: CloudSmokeDnsLookup = (host) => dnsLookup(host, { all: true, verbatim: true }),
): Promise<CloudSmokeResolvedHosts> {
  const [databaseAddress, redisAddress] = await Promise.all([
    resolveCloudSmokePrivateHost(config.databaseUrl, config.privateCidrs, lookup),
    resolveCloudSmokePrivateHost(config.redisUrl, config.privateCidrs, lookup),
  ]);
  return { databaseAddress, redisAddress };
}

/** A post-connect peer check closes the DNS-rebinding window before any SQL. */
export function assertCloudSmokePrivatePeer(peerAddress: string | undefined, privateCidrs: readonly string[], expectedAddress?: string): void {
  if (!peerAddress || !ipv4InCidrs(peerAddress, privateCidrs) || (expectedAddress !== undefined && peerAddress !== expectedAddress))
    smokeError('peer_not_private');
}

export function assertCloudSmokePeer(peerAddress: string | undefined, config: CloudSmokeConfig, expectedAddress?: string): void {
  assertCloudSmokePrivatePeer(peerAddress, config.privateCidrs, expectedAddress);
}

/** Preserve user info and port while removing a second socket-layer DNS lookup. */
export function cloudSmokePinnedUrl(raw: string, address: string): string {
  const url = new URL(raw);
  if (ipv4AsInt(address) === undefined) smokeError('pinned_address_invalid');
  url.hostname = address;
  return url.toString();
}

/** The HMAC prevents a receipt from revealing a cloud DNS name or database name. */
export function cloudSmokeTarget(config: CloudSmokeConfig): CloudSmokeTarget {
  const database = new URL(config.databaseUrl);
  const redis = new URL(config.redisUrl);
  const fingerprint = (target: string) => createHmac('sha256', config.receiptHmacKey).update(target).digest('hex').slice(0, 20);
  return {
    targetKind: config.targetKind,
    databaseName: decodeURIComponent(database.pathname.replace(/^\//, '')),
    databaseFingerprint: fingerprint(`${database.hostname}:${database.port}/${database.pathname}`),
    redisFingerprint: fingerprint(`${redis.hostname}:${redis.port}/${redis.pathname}`),
  };
}

/** Convert library errors to a fixed vocabulary: neither a URL nor a credential reaches logs. */
export function cloudSmokeFailure(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (message.startsWith('cloud_smoke_')) return message;
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code ?? '')
    : '';
  if (/CERT|TLS|SSL/i.test(code) || /certificate|tls|ssl/i.test(message))
    return 'cloud_smoke_tls_validation_failed';
  if (/28P01|AUTH|WRONGPASS|NOAUTH/i.test(code) || /authentication|password|auth/i.test(message))
    return 'cloud_smoke_dependency_auth_failed';
  return 'cloud_smoke_dependency_unreachable';
}

/**
 * Redis/Tair implementation of the qbank hot-cache port.
 *
 * It deliberately has no PostgreSQL fallback. A Redis dependency error is a
 * controlled no-local-RAG outcome; treating it as a miss would issue a new
 * paid embedding request exactly when the singleflight guarantee is absent.
 */
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createClient, createCluster } from 'redis';
import {
  RagCacheDependencyError, type QbankRetrievalCacheAddress, type QbankRetrievalCacheBackend,
  type QbankRetrievalCacheLock, type QbankRetrievalHit,
} from '@meetwise/db';
import { getMetrics, METRIC } from '@meetwise/ai-runtime';

const VALUE_SCHEMA = 1;
const MAX_VALUE_BYTES = 32 * 1024;
const RELEASE_SCRIPT = `
  if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('DEL', KEYS[1])
  end
  return 0
`;
const RENEW_SCRIPT = `
  if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('PEXPIRE', KEYS[1], ARGV[2])
  end
  return 0
`;
// KEYS[1] and KEYS[2] have the same opaque hash tag; this works unchanged on Redis Cluster/Tair Cluster.
const PUBLISH_SCRIPT = `
  if redis.call('GET', KEYS[2]) ~= ARGV[1] then
    return 0
  end
  redis.call('SET', KEYS[1], ARGV[2], 'PX', ARGV[3])
  redis.call('DEL', KEYS[2])
  return 1
`;

interface RedisCommandClient {
  isReady: boolean;
  connect(): Promise<void>;
  close(): void | Promise<void>;
  on(event: string, listener: (...args: unknown[]) => void): unknown;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options: { expiration: { type: 'PX'; value: number }; condition: 'NX' }): Promise<string | null>;
  eval(script: string, options: { keys: string[]; arguments: string[] }): Promise<unknown>;
}

export interface RagRedisCacheConfig {
  url: string;
  topology: 'standalone' | 'cluster';
  connectTimeoutMs: number;
  commandTimeoutMs: number;
  tls: boolean;
  tlsCa?: string;
  tlsServerName?: string;
}

/** Keep production classification identical across bootstrap and cache parsing. */
export function isProductionEnvironment(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV?.trim().toLowerCase() === 'production';
}

function isLoopbackHost(host: string): boolean {
  const normalized = host.replace(/\.$/, '').replace(/^\[|\]$/g, '').toLowerCase();
  return normalized === 'localhost' || normalized === '::1' || normalized === '0:0:0:0:0:0:0:1'
    || /^127(?:\.\d{1,3}){3}$/.test(normalized) || /^::ffff:127(?:\.\d{1,3}){3}$/.test(normalized);
}

/**
 * Explicit unavailable implementation for non-production test/development
 * processes that have no Redis endpoint.  It never fabricates a cache hit and
 * never falls back to PostgreSQL; callers receive the same fail-closed result
 * as an unreachable Tair dependency, so the agent can take its bounded
 * no-local-RAG path while command consumers remain live.
 */
export class UnavailableQbankRetrievalCache implements QbankRetrievalCacheBackend {
  readonly available = false;
  async close(): Promise<void> {}
  async read(): Promise<never> { throw new RagCacheDependencyError(); }
  async acquire(): Promise<never> { throw new RagCacheDependencyError(); }
  async renew(): Promise<never> { throw new RagCacheDependencyError(); }
  async publish(): Promise<never> { throw new RagCacheDependencyError(); }
  async release(): Promise<never> { throw new RagCacheDependencyError(); }
}

export class RagCacheValueError extends Error {
  readonly code = 'rag_cache_value_invalid';
  constructor() { super('rag_cache_value_invalid'); this.name = 'RagCacheValueError'; }
}

function bounded(raw: string | undefined, name: string, fallback: number, min: number, max: number): number {
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`rag_redis_invalid_${name}`);
  return value;
}

/** Production requires a separate, TLS-protected endpoint. Generic REDIS_URL is intentionally not inherited. */
export function resolveRagRedisCacheConfig(env: NodeJS.ProcessEnv = process.env): RagRedisCacheConfig {
  const url = env.RAG_REDIS_URL?.trim();
  if (!url) throw new Error('rag_redis_url_missing');
  let parsed: URL;
  try { parsed = new URL(url); } catch { throw new Error('rag_redis_url_invalid'); }
  if (parsed.protocol !== 'redis:' && parsed.protocol !== 'rediss:') throw new Error('rag_redis_url_invalid_scheme');
  if (!parsed.hostname) throw new Error('rag_redis_url_host_missing');
  const production = isProductionEnvironment(env);
  if (production && parsed.protocol !== 'rediss:') throw new Error('rag_redis_tls_required_in_production');
  if (production && isLoopbackHost(parsed.hostname)) throw new Error('rag_redis_production_loopback_forbidden');
  const caPath = env.RAG_REDIS_TLS_CA_PATH?.trim();
  let tlsCa: string | undefined;
  if (caPath) {
    try { tlsCa = readFileSync(caPath, 'utf8'); }
    catch { throw new Error('rag_redis_tls_ca_unreadable'); }
  }
  const topology = env.RAG_REDIS_TOPOLOGY ?? 'standalone';
  if (topology !== 'standalone' && topology !== 'cluster') throw new Error('rag_redis_invalid_topology');
  return {
    url, topology, tls: parsed.protocol === 'rediss:', tlsCa,
    tlsServerName: env.RAG_REDIS_TLS_SERVER_NAME?.trim() || parsed.hostname,
    connectTimeoutMs: bounded(env.RAG_REDIS_CONNECT_TIMEOUT_MS, 'connect_timeout_ms', 1_000, 100, 10_000),
    commandTimeoutMs: bounded(env.RAG_REDIS_COMMAND_TIMEOUT_MS, 'command_timeout_ms', 1_000, 100, 10_000),
  };
}

function valueKey(address: QbankRetrievalCacheAddress): string { return `rag:qcache:v3:{${address.cacheKey}:${address.corpusEpoch}}:value`; }
function lockKey(address: QbankRetrievalCacheAddress): string { return `rag:qcache:v3:{${address.cacheKey}:${address.corpusEpoch}}:lock`; }

function asNumber(reply: unknown): number { return typeof reply === 'number' ? reply : Number(reply); }
function validHits(raw: unknown, k: number): QbankRetrievalHit[] | undefined {
  if (!Array.isArray(raw) || raw.length > k) return undefined;
  const hits: QbankRetrievalHit[] = [];
  for (const value of raw) {
    const hit = value as { refId?: unknown; distance?: unknown };
    if (!hit || typeof hit.refId !== 'string' || hit.refId.length < 1 || hit.refId.length > 512 || !Number.isFinite(hit.distance)) return undefined;
    hits.push({ refId: hit.refId, distance: Number(hit.distance) });
  }
  return hits;
}

type StoredValue = { schema: number; epoch: string; hits: QbankRetrievalHit[] };

export class RedisQbankRetrievalCache implements QbankRetrievalCacheBackend {
  private constructor(private readonly client: RedisCommandClient, private readonly cfg: RagRedisCacheConfig, readonly initialState: 'connected' | 'unavailable') {}

  /** Bootstrap may build vectors only when singleflight is actually available. */
  get available(): boolean { return this.client.isReady; }

  static async connect(cfg: RagRedisCacheConfig): Promise<RedisQbankRetrievalCache> {
    const reconnectStrategy = (retries: number): number | Error => retries < 3 ? Math.min(500, 50 * (2 ** retries)) : new Error('rag_redis_reconnect_exhausted');
    const socket = cfg.tls
      ? {
        tls: true as const, rejectUnauthorized: true, servername: cfg.tlsServerName,
        ca: cfg.tlsCa, connectTimeout: cfg.connectTimeoutMs, socketTimeout: cfg.commandTimeoutMs, reconnectStrategy,
      }
      : { connectTimeout: cfg.connectTimeoutMs, socketTimeout: cfg.commandTimeoutMs, reconnectStrategy };
    const common = {
      url: cfg.url,
      disableOfflineQueue: true,
      commandsQueueMaxLength: 32,
      socket,
    };
    const client = (cfg.topology === 'cluster'
      ? createCluster({ rootNodes: [{ url: cfg.url }], defaults: common })
      : createClient(common)) as unknown as RedisCommandClient;
    // Never log the event error: Redis libraries may include a URL with credentials in it.
    client.on('error', () => {
      getMetrics().setGauge(METRIC.ragCacheDependencyState, 0, { dependency: 'redis' });
    });
    let initialState: 'connected' | 'unavailable' = 'unavailable';
    try {
      await client.connect();
      initialState = 'connected';
      getMetrics().setGauge(METRIC.ragCacheDependencyState, 1, { dependency: 'redis' });
    } catch {
      // The worker remains alive; every retrieval call will fail closed until the dependency recovers/restarts.
      getMetrics().setGauge(METRIC.ragCacheDependencyState, 0, { dependency: 'redis' });
    }
    return new RedisQbankRetrievalCache(client, cfg, initialState);
  }

  async close(): Promise<void> { await this.client.close(); }

  private async command<T>(operation: 'get' | 'lock' | 'renew' | 'publish' | 'release', fn: () => Promise<T>): Promise<T> {
    const started = performance.now();
    try {
      if (!this.client.isReady) throw new Error('not_ready');
      const output = await fn();
      getMetrics().setGauge(METRIC.ragCacheDependencyState, 1, { dependency: 'redis' });
      return output;
    } catch {
      getMetrics().inc(METRIC.ragCacheDependencyFailures, { operation });
      getMetrics().setGauge(METRIC.ragCacheDependencyState, 0, { dependency: 'redis' });
      throw new RagCacheDependencyError();
    } finally {
      getMetrics().observe(METRIC.ragRedisCommandLatencyMs, Math.round(performance.now() - started), { operation });
    }
  }

  async read(address: QbankRetrievalCacheAddress, k: number): Promise<QbankRetrievalHit[] | undefined> {
    const raw = await this.command('get', () => this.client.get(valueKey(address)));
    if (raw === null) return undefined;
    if (Buffer.byteLength(raw, 'utf8') > MAX_VALUE_BYTES) throw new RagCacheValueError();
    let stored: StoredValue;
    try { stored = JSON.parse(raw) as StoredValue; } catch { throw new RagCacheValueError(); }
    const hits = stored.schema === VALUE_SCHEMA && stored.epoch === address.corpusEpoch ? validHits(stored.hits, k) : undefined;
    if (!hits) throw new RagCacheValueError();
    return hits;
  }

  async acquire(address: QbankRetrievalCacheAddress, leaseMs: number): Promise<QbankRetrievalCacheLock | undefined> {
    const token = randomUUID();
    const reply = await this.command('lock', () => this.client.set(lockKey(address), token, {
      expiration: { type: 'PX', value: leaseMs }, condition: 'NX',
    }));
    return reply === 'OK' ? { token } : undefined;
  }

  async renew(address: QbankRetrievalCacheAddress, lock: QbankRetrievalCacheLock, leaseMs: number): Promise<boolean> {
    return asNumber(await this.command('renew', () => this.client.eval(RENEW_SCRIPT, {
      keys: [lockKey(address)], arguments: [lock.token, String(leaseMs)],
    }))) === 1;
  }

  async publish(address: QbankRetrievalCacheAddress, lock: QbankRetrievalCacheLock, hits: QbankRetrievalHit[], ttlMs: number): Promise<boolean> {
    const value = JSON.stringify({ schema: VALUE_SCHEMA, epoch: address.corpusEpoch, hits } satisfies StoredValue);
    if (Buffer.byteLength(value, 'utf8') > MAX_VALUE_BYTES) throw new RagCacheValueError();
    return asNumber(await this.command('publish', () => this.client.eval(PUBLISH_SCRIPT, {
      keys: [valueKey(address), lockKey(address)], arguments: [lock.token, value, String(ttlMs)],
    }))) === 1;
  }

  async release(address: QbankRetrievalCacheAddress, lock: QbankRetrievalCacheLock): Promise<void> {
    await this.command('release', () => this.client.eval(RELEASE_SCRIPT, { keys: [lockKey(address)], arguments: [lock.token] }));
  }
}

/**
 * RAG-FUNNEL-02B production seams for durable embedding compute cache.
 *
 * Builds ExactEmbeddingRecipe + Redis value/lock backends only when every
 * required pin is present (fail-closed). Missing HMAC keys / deployment /
 * verified revision / Redis → returns undefined so generation keeps the
 * direct-embed path (never invent durable hits / never invent vectors).
 *
 * Distinct from retrieval-result Redis cache (`rag-redis-cache.ts`).
 */
import { randomUUID } from 'node:crypto';
import { createClient, createCluster } from 'redis';
import type {
  ExactEmbeddingRecipe,
  EmbeddingComputeCostReservation,
  EmbeddingComputeValue,
  EmbeddingComputeValueStore,
  EmbeddingComputeLock,
  EmbeddingComputeLockBackend,
} from '@meetwise/db';
import type { QbankEmbeddingRecipe, QbankEmbeddingComputeCacheSeams } from './qbank-generation.ts';
import { isProductionEnvironment, resolveRagRedisCacheConfig, type RagRedisCacheConfig } from './rag-redis-cache.ts';

const VALUE_KEY_PREFIX = 'rag:embed-compute:v1:';
const LOCK_KEY_PREFIX = 'rag:embed-compute-lock:v1:';
const VALUE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface RedisCommandClient {
  isReady: boolean;
  connect(): Promise<void>;
  close(): void | Promise<void>;
  on(event: string, listener: (...args: unknown[]) => void): unknown;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options: { expiration: { type: 'PX'; value: number }; condition?: 'NX' }): Promise<string | null>;
  del(key: string): Promise<number>;
  eval(script: string, options: { keys: string[]; arguments: string[] }): Promise<unknown>;
}

const RELEASE_SCRIPT = `
  if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('DEL', KEYS[1])
  end
  return 0
`;

function envTrim(name: string): string | undefined {
  const v = process.env[name]?.trim();
  return v && v.length > 0 ? v : undefined;
}

/**
 * Exact recipe for compute-cache identity. Legacy qbankEmbeddingRecipe alone is
 * insufficient (no deployment bind). Require verified revision + deployment.
 */
export function tryExactEmbeddingRecipe(qbankRecipe: QbankEmbeddingRecipe): ExactEmbeddingRecipe | undefined {
  const deployment = envTrim('EMBED_DEPLOYMENT');
  const revision = qbankRecipe.providerRevision?.trim();
  if (!deployment || !revision || revision === 'unverified') return undefined;
  const normalization = envTrim('EMBED_VECTOR_NORMALIZATION') ?? 'l2';
  const metadataInputProfile = envTrim('EMBED_METADATA_INPUT_PROFILE') ?? 'qbank-prompt-v1';
  const codec = envTrim('EMBED_CODEC') ?? 'utf8';
  return {
    schema: 'qbank-embedding:v1',
    provider: qbankRecipe.provider,
    deployment,
    model: qbankRecipe.model,
    revision,
    dimension: qbankRecipe.dimensions,
    normalization,
    documentTransform: qbankRecipe.documentPrefixVersion,
    metadataInputProfile,
    codec,
  };
}

function tryCostReservation(qbankRecipe: QbankEmbeddingRecipe, exact: ExactEmbeddingRecipe): EmbeddingComputeCostReservation | undefined {
  const region = envTrim('EMBED_COST_REGION') ?? exact.deployment;
  const reservedRaw = envTrim('EMBED_COMPUTE_RESERVED_MICRO_CNY') ?? '0';
  const reservedMicroCny = Number(reservedRaw);
  if (!Number.isInteger(reservedMicroCny) || reservedMicroCny < 0) return undefined;
  return {
    provider: exact.provider,
    model: qbankRecipe.model,
    region,
    reservedMicroCny,
  };
}

function hmacKeysPresent(): boolean {
  const hashKey = envTrim('RAG_QBANK_COMPUTE_CACHE_HASH_KEY');
  const valueKey = envTrim('RAG_QBANK_COMPUTE_CACHE_VALUE_HASH_KEY');
  return !!hashKey && hashKey.length >= 32 && !!valueKey && valueKey.length >= 32;
}

class RedisEmbeddingComputeValueStore implements EmbeddingComputeValueStore {
  constructor(private readonly client: RedisCommandClient) {}
  async get(cacheKey: string): Promise<EmbeddingComputeValue | null> {
    if (!this.client.isReady) return null;
    const raw = await this.client.get(VALUE_KEY_PREFIX + cacheKey);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as EmbeddingComputeValue;
      if (!parsed || typeof parsed !== 'object') return null;
      return parsed;
    } catch {
      return null;
    }
  }
  async put(cacheKey: string, value: EmbeddingComputeValue): Promise<boolean> {
    if (!this.client.isReady) return false;
    try {
      await this.client.set(VALUE_KEY_PREFIX + cacheKey, JSON.stringify(value), {
        expiration: { type: 'PX', value: VALUE_TTL_MS },
      });
      return true;
    } catch {
      return false;
    }
  }
}

class RedisEmbeddingComputeLockBackend implements EmbeddingComputeLockBackend {
  constructor(private readonly client: RedisCommandClient) {}
  async acquire(cacheKey: string, leaseMs: number): Promise<EmbeddingComputeLock | null> {
    if (!this.client.isReady) return null;
    const token = randomUUID();
    try {
      const ok = await this.client.set(LOCK_KEY_PREFIX + cacheKey, token, {
        expiration: { type: 'PX', value: leaseMs },
        condition: 'NX',
      });
      return ok ? { token } : null;
    } catch {
      return null;
    }
  }
  async release(cacheKey: string, lock: EmbeddingComputeLock): Promise<void> {
    if (!this.client.isReady) return;
    try {
      await this.client.eval(RELEASE_SCRIPT, { keys: [LOCK_KEY_PREFIX + cacheKey], arguments: [lock.token] });
    } catch {
      // best-effort release
    }
  }
}

async function connectComputeRedis(cfg: RagRedisCacheConfig): Promise<RedisCommandClient | undefined> {
  const reconnectStrategy = (retries: number): number | Error =>
    retries < 3 ? Math.min(500, 50 * (2 ** retries)) : new Error('embed_compute_redis_reconnect_exhausted');
  const socket = cfg.tls
    ? {
      tls: true as const,
      rejectUnauthorized: true,
      servername: cfg.tlsServerName,
      ca: cfg.tlsCa,
      connectTimeout: cfg.connectTimeoutMs,
      socketTimeout: cfg.commandTimeoutMs,
      reconnectStrategy,
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
  client.on('error', () => {});
  try {
    await client.connect();
    return client;
  } catch {
    await Promise.resolve(client.close()).catch(() => undefined);
    return undefined;
  }
}

export type ResolvedEmbeddingComputeSeams = {
  seams: QbankEmbeddingComputeCacheSeams;
  close: () => Promise<void>;
};

/**
 * Resolve production compute-cache seams for qbank generation.
 * Fail-closed: any missing pin → undefined (caller keeps direct embed).
 */
export async function resolveQbankEmbeddingComputeSeams(
  qbankRecipe: QbankEmbeddingRecipe,
): Promise<ResolvedEmbeddingComputeSeams | undefined> {
  if (!hmacKeysPresent()) return undefined;
  const exact = tryExactEmbeddingRecipe(qbankRecipe);
  if (!exact) return undefined;
  const costReservation = tryCostReservation(qbankRecipe, exact);
  if (!costReservation) return undefined;
  if (!process.env.RAG_REDIS_URL?.trim()) return undefined;
  // Production forbids loopback / non-TLS via resolveRagRedisCacheConfig.
  let cfg: RagRedisCacheConfig;
  try {
    cfg = resolveRagRedisCacheConfig();
  } catch {
    return undefined;
  }
  if (isProductionEnvironment() && !cfg.tls) return undefined;
  const client = await connectComputeRedis(cfg);
  if (!client?.isReady) return undefined;
  const valueStore = new RedisEmbeddingComputeValueStore(client);
  const lockBackend = new RedisEmbeddingComputeLockBackend(client);
  return {
    seams: { recipe: exact, costReservation, valueStore, lockBackend },
    close: async () => { await Promise.resolve(client.close()).catch(() => undefined); },
  };
}

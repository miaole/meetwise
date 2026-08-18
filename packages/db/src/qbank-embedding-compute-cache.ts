/**
 * RAG-FUNNEL-02B / EMBED-CACHE-01: the embedding *compute* cache.
 *
 * This is deliberately NOT the retrieval-hit cache (`qbank-retrieval-cache.ts`).
 * The retrieval cache serves query-time ANN hits scoped by owner/epoch/k and is
 * invalidated by corpus epoch bumps; this compute cache reuses the *unowned
 * float32 vector* for an identical provider computation (scope + exact recipe +
 * exact canonical provider input), sits after metadata review and before the
 * caller's projection write, and never decides leaf/visibility/activation.
 *
 * PostgreSQL is the authoritative truth for the durable fill intent + cost
 * reservation + dispatch slot.  Redis is only two thin seams — the value store
 * and the merge lock — supplied by the caller (production uses real Redis; the
 * proof uses an in-process substitute).  The seams are intentionally free of
 * business state so the whole proof can run against real PG assertions while
 * Redis is unavailable.
 *
 * Safety rules encoded here:
 *  - cache identity = HMAC(scope + exactRecipeDigest + SHA-256(canonical input
 *    bytes)); generationId/route/owner/tenant/raw content never enter it.
 *  - a value that fails schema/recipe/input digest/dimension/finite/checksum/
 *    HMAC validation is *pollution*, not a miss: no projection write, no
 *    generation activation, no second provider send.
 *  - a miss first writes the durable fill intent + cost reservation + dispatch
 *    slot, and only the fenced owner performs one controlled provider send.
 *  - `dispatching` response-loss/timeout -> `unknown`; provider success but
 *    value-store write failure -> `succeeded_uncached`.  Both are sticky and
 *    never auto-create a new fill or re-charge.
 */
import { createHash, createHmac, randomUUID } from 'node:crypto';
import { Buffer } from 'node:buffer';
import type { PoolClient as Client } from 'pg';
import { asQbankControlExecutor, type DbPool } from './principal.ts';
import { QBANK_OWNER } from './qbank-ingest.ts';

const CACHE_KEY_VERSION = 'embedding-compute-cache:v1';
const VALUE_SCHEMA = 'embedding-compute-value:v1';
export const EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE = 'global-approved-qbank';
const DEFAULT_WAIT_MS = 10_000;
const DEFAULT_LEASE_SECONDS = 20;
const DEFAULT_DISPATCH_LEASE_SECONDS = 300;
const MAX_VECTOR_DIM = 65_536;
const MAX_FIELD_CHARS = 256;

/** The immutable recipe receipt whose digest is part of the cache identity. */
export interface ExactEmbeddingRecipe {
  schema: string;
  provider: string;
  deployment: string;
  model: string;
  revision: string;
  dimension: number;
  normalization: string;
  documentTransform: string;
  metadataInputProfile: string;
  codec: string;
}

/**
 * Cost reservation facts recorded atomically with the durable fill.  The amount
 * is frozen by the caller (model-op pricing is a separate surface); this module
 * only makes the reserved→dispatched→settled/unknown transition monotonic.
 */
export interface EmbeddingComputeCostReservation {
  provider: string;
  model: string;
  region: string;
  reservedMicroCny: number;
}

/** Redis value shape: only schema/digests/dimension/vector/checksum/independent HMAC. */
export interface EmbeddingComputeValue {
  schema: string;
  recipeDigest: string;
  inputDigest: string;
  dimension: number;
  vector: number[];
  checksum: string;
  valueHmac: string;
}

/**
 * Production seam for the Redis value store.  `put` returns false when the
 * value could not be durably written (which must become `succeeded_uncached`,
 * never a silent success or a re-send).
 */
export interface EmbeddingComputeValueStore {
  get(cacheKey: string): Promise<EmbeddingComputeValue | null>;
  put(cacheKey: string, value: EmbeddingComputeValue): Promise<boolean>;
}

/** Opaque merge lock token; callers must never invent or reuse it. */
export interface EmbeddingComputeLock { readonly token: string }
export interface EmbeddingComputeLockBackend {
  acquire(cacheKey: string, leaseMs: number): Promise<EmbeddingComputeLock | null>;
  release(cacheKey: string, lock: EmbeddingComputeLock): Promise<void>;
}

export interface ResolveEmbeddingComputeInput {
  scope: string;
  recipe: ExactEmbeddingRecipe;
  canonicalProviderInputBytes: Uint8Array;
  costReservation: EmbeddingComputeCostReservation;
  valueStore: EmbeddingComputeValueStore;
  lockBackend: EmbeddingComputeLockBackend;
  /** Only the fenced fill owner may invoke this; it receives the exact canonical bytes. */
  embed: (canonicalProviderInputBytes: Uint8Array) => Promise<number[]>;
  waitMs?: number;
  leaseSeconds?: number;
  /** Dispatch lease (worker-alive) for the in-flight provider send; the real worker renews it via heartbeat. */
  dispatchLeaseSeconds?: number;
}

export type EmbeddingComputeResolution =
  | { status: 'hit'; vector: number[] }
  | { status: 'filled'; vector: number[] };

function codeError(code: string): Error { return Object.assign(new Error(code), { code }); }

function clampInteger(value: number | undefined, fallback: number, min: number, max: number): number {
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`embedding_compute_invalid_option:${min}-${max}`);
  return value;
}

function assertDimension(dimension: number): void {
  if (!Number.isInteger(dimension) || dimension < 1 || dimension > MAX_VECTOR_DIM) throw new Error('embedding_compute_invalid_dimension');
}

function validateRecipe(recipe: ExactEmbeddingRecipe): void {
  const textFields = ['schema', 'provider', 'deployment', 'model', 'revision', 'normalization', 'documentTransform', 'metadataInputProfile', 'codec'] as const;
  for (const key of textFields) {
    const value = recipe[key];
    if (typeof value !== 'string' || value.length < 1 || value.length > MAX_FIELD_CHARS) throw new Error(`embedding_compute_invalid_recipe_${key}`);
  }
  assertDimension(recipe.dimension);
}

function validateCostReservation(cost: EmbeddingComputeCostReservation): void {
  if (typeof cost.provider !== 'string' || cost.provider.length < 1 || cost.provider.length > MAX_FIELD_CHARS) throw new Error('embedding_compute_invalid_cost_provider');
  if (typeof cost.model !== 'string' || cost.model.length < 1 || cost.model.length > MAX_FIELD_CHARS) throw new Error('embedding_compute_invalid_cost_model');
  if (typeof cost.region !== 'string' || cost.region.length < 1 || cost.region.length > MAX_FIELD_CHARS) throw new Error('embedding_compute_invalid_cost_region');
  if (!Number.isInteger(cost.reservedMicroCny) || cost.reservedMicroCny < 0) throw new Error('embedding_compute_invalid_cost_amount');
}

/**
 * The exact-recipe digest.  It is the SHA-256 of a fixed, closed field list —
 * nothing else may change it, which is what makes generationId/route/owner/
 * tenant/raw content structurally incapable of being cache identity.
 */
export function embeddingExactRecipeDigest(recipe: ExactEmbeddingRecipe): string {
  validateRecipe(recipe);
  return createHash('sha256').update(JSON.stringify({
    schema: recipe.schema,
    provider: recipe.provider,
    deployment: recipe.deployment,
    model: recipe.model,
    revision: recipe.revision,
    dimension: recipe.dimension,
    normalization: recipe.normalization,
    documentTransform: recipe.documentTransform,
    metadataInputProfile: recipe.metadataInputProfile,
    codec: recipe.codec,
  })).digest('hex');
}

/** SHA-256 of the actual canonical provider-input bytes (never a truncated hash). */
export function embeddingProviderInputDigest(bytes: Uint8Array): string {
  if (!bytes || bytes.byteLength < 1) throw new Error('embedding_compute_invalid_input');
  return createHash('sha256').update(bytes).digest('hex');
}

/**
 * The iron-rule cache key: HMAC(scope + exactRecipeDigest + SHA-256(input bytes)).
 * Only a dedicated HMAC key is permitted — reusing an auth/model secret would
 * couple credential rotation to cache invalidation and widen blast radius.
 * Non-'global-approved-qbank' scope is rejected before any read/write.
 */
export function embeddingComputeCacheKey(scope: string, exactRecipeDigest: string, inputDigest: string): string {
  if (scope !== EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE) throw new Error('embedding_compute_scope_not_allowed');
  if (!/^[0-9a-f]{64}$/.test(exactRecipeDigest)) throw new Error('embedding_compute_invalid_recipe_digest');
  if (!/^[0-9a-f]{64}$/.test(inputDigest)) throw new Error('embedding_compute_invalid_input_digest');
  const secret = process.env.RAG_QBANK_COMPUTE_CACHE_HASH_KEY;
  if (!secret || secret.length < 32) throw new Error('embedding_compute_cache_hash_key_missing');
  return createHmac('sha256', secret).update(JSON.stringify({
    v: CACHE_KEY_VERSION,
    scope,
    exactRecipeDigest,
    inputDigest,
  })).digest('hex');
}

/** Canonical little-endian float32 serialization so checksum/HMAC are byte-stable. */
function float32Bytes(vector: number[]): Buffer {
  const out = Buffer.allocUnsafe(vector.length * 4);
  for (let i = 0; i < vector.length; i++) out.writeFloatLE(Math.fround(vector[i]!), i * 4);
  return out;
}

/** Independent value HMAC (separate key from the cache-key HMAC) over the value body. */
function computeValueHmac(fields: {
  schema: string; recipeDigest: string; inputDigest: string; dimension: number; checksum: string; vector: number[];
}): string {
  const secret = process.env.RAG_QBANK_COMPUTE_CACHE_VALUE_HASH_KEY;
  if (!secret || secret.length < 32) throw new Error('embedding_compute_cache_value_hash_key_missing');
  return createHmac('sha256', secret).update(JSON.stringify({
    schema: fields.schema,
    recipeDigest: fields.recipeDigest,
    inputDigest: fields.inputDigest,
    dimension: fields.dimension,
    checksum: fields.checksum,
    vectorF32Hex: float32Bytes(fields.vector).toString('hex'),
  })).digest('hex');
}

export function buildEmbeddingComputeValue(input: {
  recipeDigest: string;
  inputDigest: string;
  dimension: number;
  vector: number[];
}): EmbeddingComputeValue {
  if (!/^[0-9a-f]{64}$/.test(input.recipeDigest)) throw new Error('embedding_compute_invalid_recipe_digest');
  if (!/^[0-9a-f]{64}$/.test(input.inputDigest)) throw new Error('embedding_compute_invalid_input_digest');
  assertDimension(input.dimension);
  if (!Array.isArray(input.vector) || input.vector.length !== input.dimension
    || !input.vector.every((x) => typeof x === 'number' && Number.isFinite(x))) {
    throw new Error('embedding_compute_invalid_vector');
  }
  const vector = input.vector.map((x) => Math.fround(x));
  const checksum = createHash('sha256').update(float32Bytes(vector)).digest('hex');
  const body = { schema: VALUE_SCHEMA, recipeDigest: input.recipeDigest, inputDigest: input.inputDigest, dimension: input.dimension, vector, checksum };
  return { ...body, valueHmac: computeValueHmac(body) };
}

/**
 * Untrusted-infrastructure validation.  Any mismatch is pollution, never a miss:
 * the caller must fail closed and must not re-send.
 */
export function validateEmbeddingComputeValue(
  value: EmbeddingComputeValue,
  expected: { recipeDigest: string; inputDigest: string; dimension: number },
): { ok: true; vector: number[] } | { ok: false; reason: string } {
  if (!value || typeof value !== 'object') return { ok: false, reason: 'shape' };
  if (value.schema !== VALUE_SCHEMA) return { ok: false, reason: 'schema' };
  if (value.recipeDigest !== expected.recipeDigest) return { ok: false, reason: 'recipe_digest' };
  if (value.inputDigest !== expected.inputDigest) return { ok: false, reason: 'input_digest' };
  if (value.dimension !== expected.dimension) return { ok: false, reason: 'dimension' };
  if (!Array.isArray(value.vector) || value.vector.length !== expected.dimension) return { ok: false, reason: 'vector_length' };
  if (!value.vector.every((x) => typeof x === 'number' && Number.isFinite(x))) return { ok: false, reason: 'vector_non_finite' };
  if (typeof value.checksum !== 'string' || value.checksum !== createHash('sha256').update(float32Bytes(value.vector)).digest('hex')) return { ok: false, reason: 'checksum' };
  if (typeof value.valueHmac !== 'string') return { ok: false, reason: 'hmac' };
  const expectedHmac = computeValueHmac({ schema: value.schema, recipeDigest: value.recipeDigest, inputDigest: value.inputDigest, dimension: value.dimension, checksum: value.checksum, vector: value.vector });
  if (value.valueHmac !== expectedHmac) return { ok: false, reason: 'hmac' };
  return { ok: true, vector: value.vector.map((x) => Math.fround(x)) };
}

export interface FillClaim { fillId: string; token: string }
export type FillClaimResult =
  | { action: 'execute'; claim: FillClaim }
  | { action: 'wait' }
  | { action: 'terminal'; terminalStatus: 'succeeded' | 'succeeded_uncached' | 'unknown' };

export interface ClaimFillIntentInput {
  cacheKey: string; scope: string; recipeDigest: string; inputDigest: string; dimension: number;
  costReservation: EmbeddingComputeCostReservation; leaseSeconds: number;
}

/** Append one monotonic event; the caller must already hold the fill row lock. */
async function appendFillEvent(c: Client, e: {
  cacheKey: string; fillId: string; fromStatus: string | null; toStatus: string; costState: string; reason: string | null;
}): Promise<number> {
  const r = await c.query(
    `INSERT INTO embedding_fill_event(cache_key,event_seq,fill_id,from_status,to_status,cost_state,reason)
     SELECT $1, COALESCE(MAX(event_seq),0)+1, $2::uuid, $3, $4, $5, $6
       FROM embedding_fill_event WHERE cache_key=$1
     RETURNING event_seq`,
    [e.cacheKey, e.fillId, e.fromStatus, e.toStatus, e.costState, e.reason],
  );
  return Number(r.rows[0]?.event_seq);
}

export async function claimFillIntent(c: Client, input: ClaimFillIntentInput): Promise<FillClaimResult> {
  const token = randomUUID();
  const fillId = randomUUID();
  const inserted = await c.query(
    `INSERT INTO embedding_fill_intent(cache_key,owner_user_id,scope,fill_id,lease_token,lease_expires_at,status,cost_state,reserved_micro_cny,provider,model,region,recipe_digest,input_digest,dimension)
     VALUES($1,$2,$3,$4::uuid,$5::uuid,clock_timestamp()+($6::text || ' seconds')::interval,'claimed','reserved',$7::bigint,$8,$9,$10,$11,$12,$13)
     ON CONFLICT(cache_key) DO NOTHING
     RETURNING fill_id::text`,
    [input.cacheKey, QBANK_OWNER, input.scope, fillId, token, input.leaseSeconds,
      input.costReservation.reservedMicroCny, input.costReservation.provider, input.costReservation.model, input.costReservation.region,
      input.recipeDigest, input.inputDigest, input.dimension],
  );
  if (inserted.rowCount === 1) {
    await appendFillEvent(c, { cacheKey: input.cacheKey, fillId, fromStatus: null, toStatus: 'claimed', costState: 'reserved', reason: null });
    return { action: 'execute', claim: { fillId, token } };
  }
  const existing = await c.query(
    `SELECT fill_id::text,status,lease_expires_at < clock_timestamp() AS expired
       FROM embedding_fill_intent WHERE cache_key=$1 FOR UPDATE`,
    [input.cacheKey],
  );
  const row = existing.rows[0];
  if (!row) throw new Error('embedding_fill_intent_missing_after_conflict');
  if (row.status === 'succeeded' || row.status === 'succeeded_uncached' || row.status === 'unknown') {
    return { action: 'terminal', terminalStatus: row.status };
  }
  if (row.status === 'dispatching') return { action: 'wait' };
  // status === 'claimed': only reclaim a provably-expired lease; keep the same
  // durable fill_id so a reclaim never manufactures a second billable id.
  if (row.expired !== true) return { action: 'wait' };
  const reclaimed = await c.query(
    `UPDATE embedding_fill_intent
        SET lease_token=$2::uuid, lease_expires_at=clock_timestamp()+($3::text || ' seconds')::interval, updated_at=clock_timestamp()
      WHERE cache_key=$1 AND status='claimed' AND lease_expires_at < clock_timestamp()
      RETURNING fill_id::text`,
    [input.cacheKey, token, input.leaseSeconds],
  );
  if (reclaimed.rowCount !== 1) return { action: 'wait' };
  const reclaimedFillId = String(reclaimed.rows[0]?.fill_id);
  await appendFillEvent(c, { cacheKey: input.cacheKey, fillId: reclaimedFillId, fromStatus: 'claimed', toStatus: 'claimed', costState: 'reserved', reason: 'reclaimed' });
  return { action: 'execute', claim: { fillId: reclaimedFillId, token } };
}

/** Atomic durable boundary immediately before the one controlled provider send. */
async function markFillDispatched(c: Client, input: { cacheKey: string; fillId: string; token: string; dispatchLeaseSeconds: number }): Promise<boolean> {
  const r = await c.query(
    `UPDATE embedding_fill_intent
        SET status='dispatching', cost_state='dispatched', lease_expires_at=clock_timestamp()+($4::text || ' seconds')::interval, updated_at=clock_timestamp()
      WHERE cache_key=$1 AND fill_id=$2::uuid AND lease_token=$3::uuid AND status='claimed' AND lease_expires_at > clock_timestamp()
      RETURNING cache_key`,
    [input.cacheKey, input.fillId, input.token, input.dispatchLeaseSeconds],
  );
  if (r.rowCount !== 1) return false;
  await appendFillEvent(c, { cacheKey: input.cacheKey, fillId: input.fillId, fromStatus: 'claimed', toStatus: 'dispatching', costState: 'dispatched', reason: null });
  return true;
}

async function settleSucceeded(c: Client, input: { cacheKey: string; fillId: string }): Promise<void> {
  const r = await c.query(
    `UPDATE embedding_fill_intent
        SET status='succeeded', cost_state='settled', lease_token=NULL, lease_expires_at=NULL, error_code=NULL, updated_at=clock_timestamp()
      WHERE cache_key=$1 AND fill_id=$2::uuid AND status='dispatching'
      RETURNING cache_key`,
    [input.cacheKey, input.fillId],
  );
  if (r.rowCount !== 1) return; // already swept/terminal: conservative, no rewrite
  await appendFillEvent(c, { cacheKey: input.cacheKey, fillId: input.fillId, fromStatus: 'dispatching', toStatus: 'succeeded', costState: 'settled', reason: null });
}

async function settleSucceededUncached(c: Client, input: { cacheKey: string; fillId: string; reason: string }): Promise<void> {
  const r = await c.query(
    `UPDATE embedding_fill_intent
        SET status='succeeded_uncached', cost_state='settled', lease_token=NULL, lease_expires_at=NULL, error_code=$3, updated_at=clock_timestamp()
      WHERE cache_key=$1 AND fill_id=$2::uuid AND status='dispatching'
      RETURNING cache_key`,
    [input.cacheKey, input.fillId, input.reason],
  );
  if (r.rowCount !== 1) return;
  await appendFillEvent(c, { cacheKey: input.cacheKey, fillId: input.fillId, fromStatus: 'dispatching', toStatus: 'succeeded_uncached', costState: 'settled', reason: input.reason });
}

async function markFillUnknown(c: Client, input: { cacheKey: string; fillId: string; reason: string }): Promise<void> {
  const r = await c.query(
    `UPDATE embedding_fill_intent
        SET status='unknown', cost_state='unknown', lease_token=NULL, lease_expires_at=NULL, error_code=$3, updated_at=clock_timestamp()
      WHERE cache_key=$1 AND fill_id=$2::uuid AND status='dispatching'
      RETURNING cache_key`,
    [input.cacheKey, input.fillId, input.reason],
  );
  if (r.rowCount !== 1) return;
  await appendFillEvent(c, { cacheKey: input.cacheKey, fillId: input.fillId, fromStatus: 'dispatching', toStatus: 'unknown', costState: 'unknown', reason: input.reason });
}

function sleep(ms: number): Promise<void> { return new Promise((resolve) => setTimeout(resolve, ms)); }

/**
 * Resolve an embedding through the compute cache.  A hit returns the reused
 * vector (the caller still performs its own projection + governance); a miss
 * writes the durable fill + cost reservation + dispatch slot, then performs
 * exactly one controlled provider send.
 */
export async function resolveEmbeddingCompute(pool: DbPool, input: ResolveEmbeddingComputeInput): Promise<EmbeddingComputeResolution> {
  if (input.scope !== EMBEDDING_COMPUTE_GLOBAL_QBANK_SCOPE) throw codeError('embedding_compute_scope_not_allowed');
  const recipeDigest = embeddingExactRecipeDigest(input.recipe);
  const inputDigest = embeddingProviderInputDigest(input.canonicalProviderInputBytes);
  const dimension = input.recipe.dimension;
  assertDimension(dimension);
  validateCostReservation(input.costReservation);
  const cacheKey = embeddingComputeCacheKey(input.scope, recipeDigest, inputDigest);
  const waitMs = clampInteger(input.waitMs, DEFAULT_WAIT_MS, 100, 30_000);
  const leaseSeconds = clampInteger(input.leaseSeconds, DEFAULT_LEASE_SECONDS, 5, 60);
  const dispatchLeaseSeconds = clampInteger(input.dispatchLeaseSeconds, DEFAULT_DISPATCH_LEASE_SECONDS, 30, 3600);
  const deadline = Date.now() + waitMs;

  while (Date.now() <= deadline) {
    const cached = await input.valueStore.get(cacheKey);
    if (cached != null) {
      const valid = validateEmbeddingComputeValue(cached, { recipeDigest, inputDigest, dimension });
      if (valid.ok) return { status: 'hit', vector: valid.vector };
      throw codeError('embedding_compute_cache_pollution');
    }
    const lock = await input.lockBackend.acquire(cacheKey, leaseSeconds * 1000);
    if (!lock) {
      await sleep(Math.min(50, Math.max(10, deadline - Date.now())));
      continue;
    }
    try {
      const afterLock = await input.valueStore.get(cacheKey);
      if (afterLock != null) {
        const valid = validateEmbeddingComputeValue(afterLock, { recipeDigest, inputDigest, dimension });
        if (valid.ok) return { status: 'hit', vector: valid.vector };
        throw codeError('embedding_compute_cache_pollution');
      }
      const claimResult = await asQbankControlExecutor(pool, (c) => claimFillIntent(c, {
        cacheKey, scope: input.scope, recipeDigest, inputDigest, dimension,
        costReservation: input.costReservation, leaseSeconds,
      }));
      if (claimResult.action === 'terminal') {
        throw codeError(claimResult.terminalStatus === 'unknown' ? 'embedding_compute_fill_unknown' : 'embedding_compute_value_unavailable');
      }
      if (claimResult.action === 'wait') continue;
      const claim = claimResult.claim;
      if (!await asQbankControlExecutor(pool, (c) => markFillDispatched(c, { cacheKey, fillId: claim.fillId, token: claim.token, dispatchLeaseSeconds }))) {
        throw codeError('embedding_compute_fill_lost');
      }
      try {
        const vector = await input.embed(input.canonicalProviderInputBytes);
        if (!Array.isArray(vector) || vector.length !== dimension || !vector.every((x) => typeof x === 'number' && Number.isFinite(x))) {
          throw codeError('embedding_compute_invalid_embedding');
        }
        const value = buildEmbeddingComputeValue({ recipeDigest, inputDigest, dimension, vector });
        const putOk = await input.valueStore.put(cacheKey, value);
        if (putOk) {
          await asQbankControlExecutor(pool, (c) => settleSucceeded(c, { cacheKey, fillId: claim.fillId }));
        } else {
          await asQbankControlExecutor(pool, (c) => settleSucceededUncached(c, { cacheKey, fillId: claim.fillId, reason: 'value_store_write_failed' }));
        }
        return { status: 'filled', vector: value.vector };
      } catch (error) {
        const rawCode = (error as { code?: unknown } | undefined)?.code;
        const reason = typeof rawCode === 'string' && /^[A-Za-z0-9._:-]{1,120}$/.test(rawCode) ? rawCode : 'fill_owner_error';
        await asQbankControlExecutor(pool, (c) => markFillUnknown(c, { cacheKey, fillId: claim.fillId, reason })).catch(() => undefined);
        throw error;
      }
    } finally {
      await input.lockBackend.release(cacheKey, lock).catch(() => undefined);
    }
  }
  throw codeError('embedding_compute_claim_timeout');
}

/**
 * Operational sweeper: a `dispatching` fill whose *dispatch lease* has expired
 * (worker died after dispatch, before settle) is frozen to `unknown`.  An
 * in-flight provider call with a live (unexpired) lease is never touched — the
 * lease is the worker-alive signal, so `staleAfterMs` is a grace period on top
 * of lease expiry rather than a wall-clock `updated_at` heuristic.  It never
 * silently resets to claimable, because that would risk a second provider
 * charge for an outcome we can no longer prove was not dispatched.  Manual
 * operator tool only — no automatic scheduling is wired here.
 */
export async function sweepStaleEmbeddingFills(pool: DbPool, staleAfterMs: number): Promise<number> {
  if (!Number.isInteger(staleAfterMs) || staleAfterMs < 0) throw new Error('embedding_compute_invalid_stale_after');
  return asQbankControlExecutor(pool, async (c) => {
    const r = await c.query(
      `WITH swept AS (
         UPDATE embedding_fill_intent
            SET status='unknown', cost_state='unknown', lease_token=NULL, lease_expires_at=NULL, error_code='swept_stale_dispatching', updated_at=clock_timestamp()
          WHERE status='dispatching' AND lease_expires_at < clock_timestamp() - ($1::text || ' milliseconds')::interval
          RETURNING cache_key, fill_id
       )
       INSERT INTO embedding_fill_event(cache_key,event_seq,fill_id,from_status,to_status,cost_state,reason)
       SELECT s.cache_key, COALESCE((SELECT MAX(e.event_seq) FROM embedding_fill_event e WHERE e.cache_key=s.cache_key),0)+1,
              s.fill_id, 'dispatching', 'unknown', 'unknown', 'swept_stale_dispatching'
         FROM swept s
       RETURNING cache_key`,
      [staleAfterMs],
    );
    return r.rowCount ?? 0;
  });
}

/**
 * Explicit, versioned reconciliation primitive for a terminal fill whose Redis
 * value was lost (evicted) or never written (`succeeded`/`succeeded_uncached`).
 *
 * This is an operator/controlled path, NOT an automatic edge: it is never
 * called by resolveEmbeddingCompute, and it refuses `unknown` (whose dispatch
 * outcome is unprovable and would risk a second charge) as well as
 * `claimed`/`dispatching` (which are not dead ends).  It fails closed unless
 * the caller proves the value is absent from Redis at the moment of
 * reconciliation; with a value still present it returns `value_present` and
 * rebuilds nothing.
 *
 * When reconciliation is valid it re-opens the row to `claimed` with
 * refill_version+1 and an already-expired lease, so the *next normal resolve*
 * reclaims and performs exactly one new provider send.  Reconcile itself never
 * sends, re-reserves the new cost atomically, and never silently re-charges.
 */
export interface ReconcileEmbeddingComputeInput {
  cacheKey: string;
  /** Re-proves eviction: a no-op when a value is still present. */
  valueStore: EmbeddingComputeValueStore;
  costReservation: EmbeddingComputeCostReservation;
  leaseSeconds: number;
}
export type ReconcileEmbeddingComputeResult =
  | { status: 'reconciled'; fillId: string; refillVersion: number }
  | { status: 'value_present' }
  | { status: 'not_reconcilable'; reason: string };

export async function reconcileEmbeddingCompute(pool: DbPool, input: ReconcileEmbeddingComputeInput): Promise<ReconcileEmbeddingComputeResult> {
  if (!/^[0-9a-f]{64}$/.test(input.cacheKey)) throw new Error('embedding_compute_invalid_cache_key');
  validateCostReservation(input.costReservation);
  const leaseSeconds = clampInteger(input.leaseSeconds, DEFAULT_LEASE_SECONDS, 5, 60);
  // Fail closed on the eviction proof *outside* the transaction: a value still
  // present means there is nothing to rebuild and a rebuild would double-send.
  const present = await input.valueStore.get(input.cacheKey);
  if (present != null) return { status: 'value_present' };
  return asQbankControlExecutor(pool, async (c) => {
    const existing = await c.query(
      `SELECT fill_id::text AS fill_id, status FROM embedding_fill_intent WHERE cache_key=$1 FOR UPDATE`,
      [input.cacheKey],
    );
    const row = existing.rows[0] as { fill_id: string; status: string } | undefined;
    if (!row) return { status: 'not_reconcilable', reason: 'no_fill' } as const;
    if (row.status !== 'succeeded' && row.status !== 'succeeded_uncached') {
      return { status: 'not_reconcilable', reason: row.status } as const;
    }
    const fromStatus = row.status;
    const token = randomUUID();
    const updated = await c.query(
      `UPDATE embedding_fill_intent
          SET status='claimed', lease_token=$2::uuid, lease_expires_at=clock_timestamp()-interval '1 second',
              cost_state='reserved', reserved_micro_cny=$3::bigint, provider=$4, model=$5, region=$6,
              error_code=NULL, refill_version=refill_version+1, updated_at=clock_timestamp()
        WHERE cache_key=$1 AND status IN ('succeeded','succeeded_uncached')
        RETURNING fill_id::text AS fill_id, refill_version`,
      [input.cacheKey, token, input.costReservation.reservedMicroCny,
       input.costReservation.provider, input.costReservation.model, input.costReservation.region],
    );
    if (updated.rowCount !== 1) return { status: 'not_reconcilable', reason: fromStatus } as const;
    const fillId = String(updated.rows[0]?.fill_id);
    const refillVersion = Number(updated.rows[0]?.refill_version);
    await appendFillEvent(c, { cacheKey: input.cacheKey, fillId, fromStatus, toStatus: 'claimed', costState: 'reserved', reason: 'reconciled_value_evicted' });
    return { status: 'reconciled', fillId, refillVersion } as const;
  });
}

/**
 * Generic corpus RAG version-control repository.
 *
 * All writes are routed through database state-machine functions.  Runtime
 * callers use `asPrincipal` only for their private corpus.  Recipe,
 * generation, release-gate and rebuild operations require the separate
 * `asRagControlExecutor` scope; the historic `__system_rag__` session value
 * is deliberately not an authorization root.  No caller may alter a
 * generation table or active pointer directly.
 */
import { createHash } from 'node:crypto';
import type { PoolClient as Client } from 'pg';

export type RagVisibility = 'private' | 'global';
export type RagSourceKind = 'resume' | 'job_description' | 'knowledge' | 'manual' | 'pdf' | 'spreadsheet' | 'presentation' | 'image' | 'audio' | 'video';

export interface RagCorpusChunkInput {
  id: string;
  ordinal: number;
  contentHash: string;
  content: string;
  locator?: Record<string, unknown>;
}

export interface RagEmbeddingRecipeInput {
  id: string;
  recipeHash: string;
  provider: string;
  model: string;
  providerRevision: string;
  dimensions: number;
  normalizationVersion: string;
  chunkerRecipeHash: string;
  documentTransformVersion: string;
  queryTransformVersion: string;
  manifest: Record<string, unknown>;
}

export interface RagBinding {
  generationId: string;
  recipeId: string;
}

export interface RagBoundHit {
  chunkId: string;
  documentId: string;
  contentVersion: number;
  distance: number;
}

export interface RagBoundEvidence {
  chunkId: string;
  documentId: string;
  contentVersion: number;
  snapshotHash: string;
  locator: Record<string, unknown>;
  excerpt: string;
}

const vector = (values: number[]) => {
  if (!Array.isArray(values) || values.length === 0 || !values.every(Number.isFinite)) throw new Error('rag_invalid_embedding');
  return `[${values.join(',')}]`;
};

/**
 * The request-opening digest is deliberately a stable operation/key hint, not
 * a serialization of caller input.  PostgreSQL binds and compares the actual
 * typed jsonb arguments before a control mutation; using `JSON.stringify`
 * here would reject a semantically identical retry merely because object keys
 * arrived in a different order.
 */
const controlRequestHint = (operation: string, logicalKey: string) =>
  createHash('sha256').update(`rag-control-request-hint:v1\u0000${operation}\u0000${logicalKey}`).digest('hex');

async function controlRequest(c: Client, operation: string, logicalKey: string): Promise<string> {
  const result = await c.query<{ request_id: string }>(
    'SELECT rag_control.rag_control_begin_request($1,$2,$3,1) AS request_id',
    [operation, logicalKey, controlRequestHint(operation, logicalKey)],
  );
  const requestId = result.rows[0]?.request_id;
  if (!requestId) throw new Error('rag_control_request_unavailable');
  return requestId;
}

/** Creates an owner-scoped private document. Global corpus registration is control-plane only. */
export async function registerRagDocument(c: Client, id: string, sourceKind: RagSourceKind, visibility: RagVisibility): Promise<void> {
  if (visibility !== 'private') throw new Error('rag_global_requires_control_executor');
  await c.query('SELECT rag_runtime.rag_register_private_document($1,$2)', [id, sourceKind]);
}

/** Control-plane-only global registration. Call inside `asRagControlExecutor`. */
export async function registerRagGlobalDocument(c: Client, id: string, sourceKind: RagSourceKind): Promise<void> {
  const requestId = await controlRequest(c, 'global_publish', `global-register:${id}`);
  await c.query('SELECT rag_control.rag_register_global_document($1,$2,$3)', [requestId, id, sourceKind]);
}

/** Atomically publishes a new immutable content version and supersedes the previous version. */
export async function publishRagDocumentVersion(
  c: Client,
  input: {
    documentId: string; contentHash: string; parserRecipeHash: string; cleaningRecipeHash: string;
    chunkerRecipeHash: string; sourceLocator?: Record<string, unknown>; chunks: RagCorpusChunkInput[];
  },
): Promise<number> {
  const chunks = input.chunks.map((chunk) => ({
    id: chunk.id, ordinal: chunk.ordinal, content_hash: chunk.contentHash, content: chunk.content, locator: chunk.locator ?? {},
  }));
  const r = await c.query(
    'SELECT rag_runtime.rag_publish_private_document_version($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb) AS content_version',
    [input.documentId, input.contentHash, input.parserRecipeHash, input.cleaningRecipeHash, input.chunkerRecipeHash,
      JSON.stringify(input.sourceLocator ?? {}), JSON.stringify(chunks)],
  );
  return Number(r.rows[0]?.content_version);
}

/** Control-plane-only global publication with immutable approved provenance. */
export async function publishRagGlobalDocumentVersion(
  c: Client,
  input: {
    documentId: string; contentHash: string; parserRecipeHash: string; cleaningRecipeHash: string;
    chunkerRecipeHash: string; sourceLocator?: Record<string, unknown>; chunks: RagCorpusChunkInput[];
  },
): Promise<number> {
  const chunks = input.chunks.map((chunk) => ({
    id: chunk.id, ordinal: chunk.ordinal, content_hash: chunk.contentHash, content: chunk.content, locator: chunk.locator ?? {},
  }));
  const requestId = await controlRequest(c, 'global_publish', `global-publish:${input.documentId}:${input.contentHash}`);
  const r = await c.query(
    'SELECT rag_control.rag_control_publish_global_document_version($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb) AS content_version',
    [requestId, input.documentId, input.contentHash, input.parserRecipeHash, input.cleaningRecipeHash, input.chunkerRecipeHash,
      JSON.stringify(input.sourceLocator ?? {}), JSON.stringify(chunks)],
  );
  return Number(r.rows[0]?.content_version);
}

export async function registerRagEmbeddingRecipe(c: Client, recipe: RagEmbeddingRecipeInput): Promise<void> {
  const requestId = await controlRequest(c, 'recipe_register', `recipe:${recipe.recipeHash}`);
  await c.query(
    'SELECT rag_control.rag_register_embedding_recipe($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb)',
    [requestId, recipe.id, recipe.recipeHash, recipe.provider, recipe.model, recipe.providerRevision, recipe.dimensions,
      recipe.normalizationVersion, recipe.chunkerRecipeHash, recipe.documentTransformVersion, recipe.queryTransformVersion,
      JSON.stringify(recipe.manifest)],
  );
}

export async function registerRagReleasePolicy(
  c: Client, input: { id: string; minLabeledQueries: number; maxRecallDropBp: number; maxP95RegressionBp: number; maxCostRegressionBp: number },
): Promise<void> {
  const requestId = await controlRequest(c, 'policy_register', `policy:${input.id}`);
  await c.query('SELECT rag_control.rag_register_release_policy($1,$2,$3,$4,$5,$6)', [requestId, input.id, input.minLabeledQueries, input.maxRecallDropBp, input.maxP95RegressionBp, input.maxCostRegressionBp]);
}

/** Takes an immutable member snapshot. It does not change serving traffic. */
export async function startRagGeneration(c: Client, generationId: string, recipeId: string, releasePolicyId: string): Promise<number> {
  const requestId = await controlRequest(c, 'generation_start', `generation:${generationId}`);
  const r = await c.query('SELECT rag_control.rag_start_generation($1,$2,$3,$4) AS expected_chunk_count', [requestId, generationId, recipeId, releasePolicyId]);
  return Number(r.rows[0]?.expected_chunk_count);
}

export async function prepareRagGenerationStorage(c: Client, generationId: string): Promise<void> {
  const requestId = await controlRequest(c, 'generation_prepare', `generation:${generationId}`);
  await c.query('SELECT rag_control.rag_prepare_generation_storage($1,$2)', [requestId, generationId]);
}

/** The database checks member snapshot, tombstones and exact vector dimension before accepting every row. */
export async function insertRagGenerationVector(c: Client, generationId: string, chunkId: string, embedding: number[]): Promise<void> {
  const requestId = await controlRequest(c, 'generation_vector', `generation:${generationId}:chunk:${chunkId}`);
  await c.query('SELECT rag_control.rag_insert_generation_vector($1,$2,$3,$4::public.vector)', [requestId, generationId, chunkId, vector(embedding)]);
}

/** building → shadow; stale corpus epochs or incomplete/revived rows fail closed. */
export async function validateRagGeneration(c: Client, generationId: string): Promise<void> {
  const requestId = await controlRequest(c, 'generation_validate', `generation:${generationId}`);
  await c.query('SELECT rag_control.rag_validate_generation($1,$2)', [requestId, generationId]);
}

export async function recordRagShadowEvaluation(
  c: Client,
  input: {
    generationId: string; datasetRevision: string; labeledQueryCount: number; baselineRecall: number; candidateRecall: number;
    baselineP95Ms: number; candidateP95Ms: number; baselineCostPerQuery: number; candidateCostPerQuery: number;
  },
): Promise<'passed' | 'failed'> {
  const requestId = await controlRequest(c, 'generation_evaluate', `generation:${input.generationId}`);
  const r = await c.query(
    'SELECT rag_control.rag_record_shadow_evaluation($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) AS verdict',
    [requestId, input.generationId, input.datasetRevision, input.labeledQueryCount, input.baselineRecall, input.candidateRecall,
      input.baselineP95Ms, input.candidateP95Ms, input.baselineCostPerQuery, input.candidateCostPerQuery],
  );
  return String(r.rows[0]?.verdict) as 'passed' | 'failed';
}

export async function gateRagGeneration(c: Client, generationId: string, approvalReference: string): Promise<void> {
  const requestId = await controlRequest(c, 'generation_gate', `generation:${generationId}`);
  await c.query('SELECT rag_control.rag_gate_generation($1,$2,$3)', [requestId, generationId, approvalReference]);
}

export async function advanceRagGenerationRollout(c: Client, generationId: string, percent: 1 | 10 | 50 | 100): Promise<void> {
  const requestId = await controlRequest(c, 'generation_rollout', `generation:${generationId}:step:${percent}`);
  await c.query('SELECT rag_control.rag_advance_rollout($1,$2,$3)', [requestId, generationId, percent]);
}

/** Atomic pointer CAS. The expected previous generation is mandatory even when it is null (pass an empty string). */
export async function promoteRagGeneration(c: Client, generationId: string, expectedPreviousGenerationId?: string): Promise<void> {
  const requestId = await controlRequest(c, 'generation_promote', `generation:${generationId}`);
  await c.query('SELECT rag_control.rag_promote_generation($1,$2,$3)', [requestId, generationId, expectedPreviousGenerationId ?? '']);
}

export async function rollbackRagGeneration(c: Client, targetGenerationId: string, expectedActiveGenerationId: string): Promise<void> {
  const requestId = await controlRequest(c, 'generation_rollback', `generation:${targetGenerationId}`);
  await c.query('SELECT rag_control.rag_rollback_generation($1,$2,$3)', [requestId, targetGenerationId, expectedActiveGenerationId]);
}

/** Pins a request/session to either the active generation or the deterministic canary generation. */
export async function bindRagQuery(c: Client, bindingId: string, stickyKey: string, ttlSeconds: number): Promise<RagBinding> {
  const r = await c.query('SELECT generation_id,recipe_id FROM rag_runtime.rag_bind_query($1,$2,$3)', [bindingId, stickyKey, ttlSeconds]);
  if (r.rowCount !== 1) throw new Error('rag_binding_unavailable');
  return { generationId: String(r.rows[0].generation_id), recipeId: String(r.rows[0].recipe_id) };
}

export async function searchRagBinding(c: Client, bindingId: string, embedding: number[], k: number): Promise<RagBoundHit[]> {
  const r = await c.query('SELECT chunk_id,document_id,content_version,distance FROM rag_runtime.rag_search_bound($1,$2::public.vector,$3)', [bindingId, vector(embedding), k]);
  return r.rows.map((row) => ({ chunkId: String(row.chunk_id), documentId: String(row.document_id), contentVersion: Number(row.content_version), distance: Number(row.distance) }));
}

/** Evidence is re-authorized against the frozen binding and never trusts cache ref IDs alone. */
export async function ragBindingEvidence(c: Client, bindingId: string, chunkIds: string[], maxChars = 600): Promise<RagBoundEvidence[]> {
  const r = await c.query('SELECT chunk_id,document_id,content_version,snapshot_hash,locator,excerpt FROM rag_runtime.rag_evidence_bound($1,$2::text[],$3)', [bindingId, chunkIds, maxChars]);
  return r.rows.map((row) => ({
    chunkId: String(row.chunk_id), documentId: String(row.document_id), contentVersion: Number(row.content_version),
    snapshotHash: String(row.snapshot_hash), locator: (row.locator ?? {}) as Record<string, unknown>, excerpt: String(row.excerpt),
  }));
}

export async function recordRagCitation(c: Client, citationId: string, bindingId: string, chunkId: string): Promise<void> {
  await c.query('SELECT rag_runtime.rag_record_citation($1,$2,$3)', [citationId, bindingId, chunkId]);
}

/** delete/erasure propagates through every retained physical generation and invalidates citations. */
export async function tombstoneRagDocument(c: Client, documentId: string, reason: 'delete' | 'erasure'): Promise<void> {
  await c.query('SELECT rag_runtime.rag_tombstone_private_document($1,$2)', [documentId, reason]);
}

export async function createRagRebuildRun(c: Client, runId: string, generationId: string, deadlineAt: Date | null, pauseBudgetSeconds: number): Promise<void> {
  const requestId = await controlRequest(c, 'rebuild_create', `rebuild:${runId}`);
  await c.query('SELECT rag_control.rag_create_rebuild_run($1,$2,$3,$4,$5)', [requestId, runId, generationId, deadlineAt, pauseBudgetSeconds]);
}

export async function claimRagRebuildRun(c: Client, runId: string, workerId: string, leaseSeconds: number): Promise<boolean> {
  const r = await c.query('SELECT rag_control.rag_claim_rebuild_run($1,$2,$3) AS claimed', [runId, workerId, leaseSeconds]);
  return r.rows[0]?.claimed === true;
}

export async function heartbeatRagRebuildRun(c: Client, runId: string, workerId: string, leaseSeconds: number, cursor: Record<string, unknown>): Promise<boolean> {
  const r = await c.query('SELECT rag_control.rag_heartbeat_rebuild_run($1,$2,$3,$4::jsonb) AS ok', [runId, workerId, leaseSeconds, JSON.stringify(cursor)]);
  return r.rows[0]?.ok === true;
}

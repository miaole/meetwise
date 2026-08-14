/**
 * Isolated PostgreSQL proof for the generic RAG version-control plane.
 * Fake three-dimensional vectors prove state/authorization/replay semantics only; they do not claim semantic recall
 * or production HNSW latency.
 */
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  advanceRagGenerationRollout, assertIsolatedTestTarget, asPrincipal, asRagControlExecutor, bindRagQuery, claimRagRebuildRun, createPool, createRagRebuildRun,
  gateRagGeneration, heartbeatRagRebuildRun, insertRagGenerationVector, loadMigrations, prepareRagGenerationStorage,
  promoteRagGeneration, publishRagDocumentVersion, publishRagGlobalDocumentVersion, ragBindingEvidence, recordRagCitation, recordRagShadowEvaluation,
  registerRagDocument, registerRagGlobalDocument, registerRagEmbeddingRecipe, registerRagReleasePolicy, rollbackRagGeneration, runMigrations,
  searchRagBinding, startRagGeneration, tombstoneRagDocument, validateRagGeneration,
} from '@meetwise/db';
import type { Client } from '@meetwise/db';

const pool = createPool();
const A = 'rag-owner-a';
const B = 'rag-owner-b';
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const recipeHash = hash('recipe:proof:3d:v1');
const recipeId = `rrecipe-${recipeHash.slice(0, 32)}`;
const policyId = 'rpolicy-proof-v1';
let failures = 0;
const check = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const failed = async (fn: () => Promise<unknown>, signal: string) => {
  try { await fn(); return false; } catch (error) { return String(error).includes(signal); }
};

function versionInput(documentId: string, suffix: string, chunks: { id: string; content: string; ordinal: number }[]) {
  return {
    documentId,
    contentHash: hash(`${documentId}:content:${suffix}`), parserRecipeHash: hash('parser:v1'),
    cleaningRecipeHash: hash('clean:v1'), chunkerRecipeHash: hash('chunker:v1'),
    sourceLocator: { sourceVersion: suffix },
    chunks: chunks.map((chunk) => ({ ...chunk, contentHash: hash(`${chunk.id}:${chunk.content}`), locator: { page: chunk.ordinal + 1 } })),
  };
}

async function buildAndPromote(generationId: string, vectors: [string, number[]][], expectedPrevious?: string) {
  const expected = await asRagControlExecutor(pool, (c) => startRagGeneration(c, generationId, recipeId, policyId));
  await asRagControlExecutor(pool, (c) => prepareRagGenerationStorage(c, generationId));
  for (const [chunkId, embedding] of vectors) await asRagControlExecutor(pool, (c) => insertRagGenerationVector(c, generationId, chunkId, embedding));
  await asRagControlExecutor(pool, (c) => validateRagGeneration(c, generationId));
  const verdict = await asRagControlExecutor(pool, (c) => recordRagShadowEvaluation(c, {
    generationId, datasetRevision: 'rag-proof-holdout-r1', labeledQueryCount: 20,
    baselineRecall: 0.80, candidateRecall: 0.80, baselineP95Ms: 50, candidateP95Ms: 51,
    baselineCostPerQuery: 0.01, candidateCostPerQuery: 0.0102,
  }));
  await asRagControlExecutor(pool, (c) => gateRagGeneration(c, generationId, 'approval-proof-001'));
  for (const step of [1, 10, 50, 100] as const) await asRagControlExecutor(pool, (c) => advanceRagGenerationRollout(c, generationId, step));
  await asRagControlExecutor(pool, (c) => promoteRagGeneration(c, generationId, expectedPrevious));
  return { expected, verdict };
}

/**
 * This represents the restricted SECURITY DEFINER data plane itself, rather
 * than a superuser test connection.  It proves the FORCE RLS predicates do
 * not accidentally correlate an approved global version for document B with
 * a revoked global row for document A.
 */
async function asRagRuntimeDefiner<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET LOCAL ROLE rag_runtime_definer');
    await client.query("SELECT set_config('app.principal_user', $1, true)", [A]);
    const value = await fn(client);
    await client.query('COMMIT');
    return value;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally { client.release(); }
}

async function main() {
  await assertIsolatedTestTarget(pool);
  await runMigrations(pool, loadMigrations(fileURLToPath(new URL('../migrations', import.meta.url))));

  await asPrincipal(pool, A, (c) => registerRagDocument(c, 'ragdoc-a', 'pdf', 'private'));
  await asPrincipal(pool, B, (c) => registerRagDocument(c, 'ragdoc-b', 'spreadsheet', 'private'));
  await asRagControlExecutor(pool, (c) => registerRagGlobalDocument(c, 'ragdoc-global', 'knowledge'));
  const globalDenied = await failed(() => asPrincipal(pool, A, (c) => registerRagDocument(c, 'ragdoc-illegal-global', 'knowledge', 'global')), 'rag_global_requires_control_executor');
  check('only the dedicated RAG control executor can create global corpus documents', globalDenied);

  await asPrincipal(pool, A, (c) => publishRagDocumentVersion(c, versionInput('ragdoc-a', 'v1', [
    { id: 'rchunk-a-v1', ordinal: 0, content: 'A private vector version one' },
  ])));
  await asPrincipal(pool, B, (c) => publishRagDocumentVersion(c, versionInput('ragdoc-b', 'v1', [
    { id: 'rchunk-b-v1', ordinal: 0, content: 'B private spreadsheet evidence' },
  ])));
  await asRagControlExecutor(pool, (c) => publishRagGlobalDocumentVersion(c, versionInput('ragdoc-global', 'v1', [
    { id: 'rchunk-global-v1', ordinal: 0, content: 'Global policy knowledge' },
  ])));
  check('three immutable corpus documents publish as one epoch-consistent source snapshot',
    Number((await pool.query("SELECT count(*) n FROM rag_corpus_chunk WHERE state='active'")).rows[0].n) === 3);

  await asRagControlExecutor(pool, (c) => registerRagEmbeddingRecipe(c, {
    id: recipeId, recipeHash, provider: 'deterministic-proof', model: 'proof-3d', providerRevision: 'r1', dimensions: 3,
    normalizationVersion: 'nfc-trim:v1', chunkerRecipeHash: hash('chunker:v1'), documentTransformVersion: 'doc-prefix:v1',
    queryTransformVersion: 'query-prefix:v1', manifest: { schema: 'rag-recipe:v1', dimensions: 3 },
  }));
  const reorderedRecipeReplay = await asRagControlExecutor(pool, (c) => registerRagEmbeddingRecipe(c, {
    id: recipeId, recipeHash, provider: 'deterministic-proof', model: 'proof-3d', providerRevision: 'r1', dimensions: 3,
    normalizationVersion: 'nfc-trim:v1', chunkerRecipeHash: hash('chunker:v1'), documentTransformVersion: 'doc-prefix:v1',
    queryTransformVersion: 'query-prefix:v1', manifest: { dimensions: 3, schema: 'rag-recipe:v1' },
  })).then(() => true, () => false);
  check('a semantically identical control retry with reordered JavaScript object keys reuses the typed database binding', reorderedRecipeReplay);
  await asRagControlExecutor(pool, (c) => registerRagReleasePolicy(c, {
    id: policyId, minLabeledQueries: 20, maxRecallDropBp: 100, maxP95RegressionBp: 500, maxCostRegressionBp: 500,
  }));
  const immutableRecipe = await failed(() => asPrincipal(pool, A, (c) => c.query("UPDATE rag_embedding_recipe SET model='mutated' WHERE id=$1", [recipeId])), 'permission denied');
  check('embedding recipe receipt is immutable after registration', immutableRecipe
    && (await pool.query('SELECT model FROM rag_embedding_recipe WHERE id=$1', [recipeId])).rows[0]?.model === 'proof-3d');

  const g1 = 'rgen-11111111-1111-4111-8111-111111111111';
  const first = await buildAndPromote(g1, [
    ['rchunk-a-v1', [1, 0, 0]], ['rchunk-b-v1', [0, 1, 0]], ['rchunk-global-v1', [0, 0, 1]],
  ]);
  check('candidate generation snapshots exactly three chunks and passes a policy-based shadow gate', first.expected === 3 && first.verdict === 'passed');
  check('only a 1→10→50→100 rollout can atomically promote the first active generation',
    (await pool.query('SELECT generation_id FROM rag_active_generation WHERE singleton')).rows[0].generation_id === g1);

  const aBinding = await asPrincipal(pool, A, (c) => bindRagQuery(c, 'rbind-a-v1', 'interview-a-session-v1', 3600));
  const bBinding = await asPrincipal(pool, B, (c) => bindRagQuery(c, 'rbind-b-v1', 'interview-b-session-v1', 3600));
  const aHits = await asPrincipal(pool, A, (c) => searchRagBinding(c, 'rbind-a-v1', [1, 0, 0], 10));
  const bHits = await asPrincipal(pool, B, (c) => searchRagBinding(c, 'rbind-b-v1', [1, 0, 0], 10));
  check('new sessions bind to the active generation with an auditable recipe receipt', aBinding.generationId === g1 && aBinding.recipeId === recipeId && bBinding.generationId === g1);
  check('RLS search returns owner + global evidence, never another tenant private evidence',
    aHits.some((x) => x.chunkId === 'rchunk-a-v1') && aHits.some((x) => x.chunkId === 'rchunk-global-v1')
      && !aHits.some((x) => x.chunkId === 'rchunk-b-v1')
      && bHits.some((x) => x.chunkId === 'rchunk-global-v1') && !bHits.some((x) => x.chunkId === 'rchunk-a-v1'));
  const bindingTheft = await failed(() => asPrincipal(pool, B, (c) => searchRagBinding(c, 'rbind-a-v1', [1, 0, 0], 5)), 'rag_binding_unavailable');
  check('a binding cannot be replayed by another principal', bindingTheft);
  const aEvidence = await asPrincipal(pool, A, (c) => ragBindingEvidence(c, 'rbind-a-v1', ['rchunk-a-v1'], 40));
  await asPrincipal(pool, A, (c) => recordRagCitation(c, 'rcite-a-v1', 'rbind-a-v1', 'rchunk-a-v1'));
  check('evidence returns frozen chunk/content version/hash/locator rather than a ref-only citation',
    aEvidence.length === 1 && aEvidence[0]?.contentVersion === 1 && aEvidence[0]?.snapshotHash.length === 64 && aEvidence[0]?.excerpt.length <= 40);

  await asPrincipal(pool, A, (c) => publishRagDocumentVersion(c, versionInput('ragdoc-a', 'v2', [
    { id: 'rchunk-a-v2', ordinal: 0, content: 'A private vector version two' },
  ])));
  const newBindingBlocked = await failed(() => asPrincipal(pool, A, (c) => bindRagQuery(c, 'rbind-a-stale', 'new-session-after-update', 3600)), 'rag_active_generation_stale');
  const frozenOld = await asPrincipal(pool, A, (c) => searchRagBinding(c, 'rbind-a-v1', [1, 0, 0], 10));
  check('content update blocks new bindings until rebuild while existing frozen sessions retain their old generation',
    newBindingBlocked && frozenOld.some((x) => x.chunkId === 'rchunk-a-v1'));

  const g2 = 'rgen-22222222-2222-4222-8222-222222222222';
  const second = await buildAndPromote(g2, [
    ['rchunk-a-v2', [1, 0, 0]], ['rchunk-b-v1', [0, 1, 0]], ['rchunk-global-v1', [0, 0, 1]],
  ], g1);
  const aBindingV2 = await asPrincipal(pool, A, (c) => bindRagQuery(c, 'rbind-a-v2', 'interview-a-session-v2', 3600));
  const v2Hits = await asPrincipal(pool, A, (c) => searchRagBinding(c, 'rbind-a-v2', [1, 0, 0], 10));
  check('new full snapshot promotes through the same gate and new sessions see v2', second.expected === 3 && aBindingV2.generationId === g2 && v2Hits.some((x) => x.chunkId === 'rchunk-a-v2'));
  const staleRollback = await failed(() => asRagControlExecutor(pool, (c) => rollbackRagGeneration(c, g1, g2)), 'stale');
  check('rollback to an older content epoch is rejected instead of serving a mixed corpus', staleRollback);

  const runId = 'rrun-33333333-3333-4333-8333-333333333333';
  await asRagControlExecutor(pool, (c) => createRagRebuildRun(c, runId, g2, new Date(Date.now() + 60_000), 60));
  const claimed = await asRagControlExecutor(pool, (c) => claimRagRebuildRun(c, runId, 'worker-a', 30));
  const splitBrain = await asRagControlExecutor(pool, (c) => claimRagRebuildRun(c, runId, 'worker-b', 30));
  const heartbeated = await asRagControlExecutor(pool, (c) => heartbeatRagRebuildRun(c, runId, 'worker-a', 30, { offset: 3 }));
  check('rebuild run lease prevents a second live worker and permits owner heartbeat/cursor checkpoint', claimed && !splitBrain && heartbeated);
  const unboundRunId = 'rrun-44444444-4444-4444-8444-444444444444';
  await pool.query(
    `INSERT INTO rag_rebuild_run(id,generation_id,deadline_at,pause_budget_seconds,control_request_id)
     VALUES ($1,$2,clock_timestamp()+interval '1 minute',0,NULL)`,
    [unboundRunId, g1],
  );
  const unboundClaimed = await asRagControlExecutor(pool, (c) => claimRagRebuildRun(c, unboundRunId, 'worker-legacy', 30));
  const unboundHeartbeated = await asRagControlExecutor(pool, (c) => heartbeatRagRebuildRun(c, unboundRunId, 'worker-legacy', 30, { offset: 0 }));
  check('legacy or manually injected rebuild runs without a succeeded rebuild request cannot claim or heartbeat',
    !unboundClaimed && !unboundHeartbeated);

  await asPrincipal(pool, A, (c) => tombstoneRagDocument(c, 'ragdoc-a', 'erasure'));
  const afterEraseOld = await asPrincipal(pool, A, (c) => searchRagBinding(c, 'rbind-a-v1', [1, 0, 0], 10));
  const afterEraseNew = await asPrincipal(pool, A, (c) => searchRagBinding(c, 'rbind-a-v2', [1, 0, 0], 10));
  // The runtime no longer receives raw table SELECT; the isolated harness
  // reads the ledger with its migration owner solely to verify the side effect.
  const citationState = (await pool.query("SELECT status FROM rag_citation WHERE id='rcite-a-v1'")) .rows[0]?.status;
  check('erasure removes private chunks from every retained generation and invalidates historical citations',
    !afterEraseOld.some((x) => x.chunkId.startsWith('rchunk-a-')) && !afterEraseNew.some((x) => x.chunkId.startsWith('rchunk-a-')) && citationState === 'invalidated');

  // A global row must be authorized by its *own* immutable provenance.  This
  // intentionally leaves a different approved global version in the corpus:
  // an unqualified RLS predicate such as p.document_id=document_id would
  // otherwise resolve both sides to the subquery alias and leak the revoked
  // primary row.
  await asRagControlExecutor(pool, (c) => registerRagGlobalDocument(c, 'ragdoc-global-other', 'knowledge'));
  await asRagControlExecutor(pool, (c) => publishRagGlobalDocumentVersion(c, versionInput('ragdoc-global-other', 'v1', [
    { id: 'rchunk-global-other-v1', ordinal: 0, content: 'Separate still-approved global evidence' },
  ])));
  await pool.query("UPDATE rag_global_document_provenance SET trust_state='revoked', control_request_id=NULL WHERE document_id='ragdoc-global'");
  const runtimeVisibleAfterRevoke = await asRagRuntimeDefiner(async (c) => {
    const content = await c.query<{ n: string }>(
      "SELECT count(*)::text AS n FROM rag_corpus_content_version WHERE document_id='ragdoc-global'",
    );
    const chunks = await c.query<{ n: string }>(
      "SELECT count(*)::text AS n FROM rag_corpus_chunk WHERE document_id='ragdoc-global'",
    );
    const vectors = await c.query<{ n: string }>(
      "SELECT count(*)::text AS n FROM rag_control.rag_vector_11111111111141118111111111111111 WHERE document_id='ragdoc-global'",
    );
    return [Number(content.rows[0]?.n), Number(chunks.rows[0]?.n), Number(vectors.rows[0]?.n)];
  });
  check('one approved global version cannot authorize a different revoked global document in runtime RLS or a physical vector partition',
    runtimeVisibleAfterRevoke.every((count) => count === 0));

  // A generation can be controlled while still `building`, before its
  // partition exists.  A privacy tombstone must skip that missing partition
  // and still remove all retained vectors for the affected document.
  const g3 = 'rgen-33333333-3333-4333-8333-333333333333';
  await asRagControlExecutor(pool, (c) => startRagGeneration(c, g3, recipeId, policyId));
  const tombstoneWithUnpreparedGeneration = await asPrincipal(pool, B, (c) => tombstoneRagDocument(c, 'ragdoc-b', 'erasure'))
    .then(() => true, () => false);
  const g3State = (await pool.query<{ state: string }>('SELECT state FROM rag_embedding_generation WHERE id=$1', [g3])).rows[0]?.state;
  check('erasure remains available when a controlled building generation has no physical partition yet',
    tombstoneWithUnpreparedGeneration && g3State === 'building');

  // The caller-side request digest is only a dedupe hint.  The actual typed
  // generation arguments are bound in the database before the first write,
  // so a response-lost replay reads the original result while a substituted
  // generation id is rejected even if it reuses the same request id.
  const replayedG3Expected = await asRagControlExecutor(pool, (c) => startRagGeneration(c, g3, recipeId, policyId));
  const g3Request = await pool.query<{ control_request_id: string; expected_chunk_count: number }>(
    'SELECT control_request_id,expected_chunk_count FROM rag_embedding_generation WHERE id=$1', [g3],
  );
  const g3RequestId = String(g3Request.rows[0]?.control_request_id ?? '');
  const substitutionRejected = await failed(() => asRagControlExecutor(pool, (c) => c.query(
    'SELECT rag_control.rag_start_generation($1,$2,$3,$4)',
    [g3RequestId, 'rgen-44444444-4444-4444-8444-444444444444', recipeId, policyId],
  )), 'rag_control_request_input_mismatch');
  check('generation start binds actual typed arguments, returns the prior result on replay, and rejects request-id substitution',
    replayedG3Expected === Number(g3Request.rows[0]?.expected_chunk_count) && substitutionRejected);

  const validateReplay = await asRagControlExecutor(pool, (c) => validateRagGeneration(c, g2)).then(() => true, () => false);
  const validateRequest = await pool.query<{ outcome: string; count: string }>(
    `SELECT r.outcome,count(b.request_id)::text AS count
       FROM rag_control_request r
       LEFT JOIN rag_control_request_input_binding b ON b.request_id=r.request_id
      WHERE r.operation='generation_validate' AND r.logical_request_key=$1
      GROUP BY r.outcome`,
    [`generation:${g2}`],
  );
  check('a completed validation is terminalized atomically and a response-lost replay reads its prior success instead of revalidating',
    validateReplay && validateRequest.rows.length === 1 && validateRequest.rows[0]?.outcome === 'succeeded'
      && validateRequest.rows[0]?.count === '1');

  console.log(`\n${failures === 0 ? '✓ generic RAG version control proof passed' : `✗ ${failures} assertions failed`}`);
  await pool.end();
  process.exit(failures ? 1 : 0);
}
main().catch(async (error) => { console.error('✗', error?.stack ?? error); await pool.end().catch(() => undefined); process.exit(1); });

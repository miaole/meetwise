/**
 * Durable pre-provider dispatch contract for generic RAG control work.
 *
 * This is a PostgreSQL state-machine proof, not a paid embedding test.  Its
 * admission boolean is the seam a future control worker must check before it
 * sends its first provider byte; false means another worker owns the same
 * durable request and this caller must not send.
 */
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  assertIsolatedTestTarget, asRagControlExecutor, createPool, createRagRebuildRun, loadMigrations,
  registerRagEmbeddingRecipe, registerRagReleasePolicy, runMigrations, startRagGeneration,
} from '../src/index.ts';

const pool = createPool();
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
let failures = 0;
const check = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};
const fails = async (fn: () => Promise<unknown>, marker: string) => {
  try { await fn(); return false; } catch (error) { return String(error).includes(marker); }
};

async function begin(operation: string, key: string, digest: string, revision: number): Promise<string> {
  return asRagControlExecutor(pool, async (client) => {
    const result = await client.query<{ request_id: string }>(
      'SELECT rag_control.rag_control_begin_request($1,$2,$3,$4) AS request_id',
      [operation, key, digest, revision],
    );
    return String(result.rows[0]?.request_id);
  });
}

async function main(): Promise<void> {
  await assertIsolatedTestTarget(pool);
  await runMigrations(pool, loadMigrations(fileURLToPath(new URL('../migrations', import.meta.url))));

  const recipeId = `rrecipe-${hash('terminalizer recipe').slice(0, 32)}`;
  const policyId = 'rpolicy-terminalizer-v1';
  const dispatchGenerationId = 'rgen-66666666-6666-4666-8666-666666666666';
  await asRagControlExecutor(pool, (client) => registerRagEmbeddingRecipe(client, {
    id: recipeId, recipeHash: hash('terminalizer recipe'), provider: 'deterministic-proof', model: 'proof-3d', providerRevision: 'r1',
    dimensions: 3, normalizationVersion: 'nfc:v1', chunkerRecipeHash: hash('chunker:v1'),
    documentTransformVersion: 'doc:v1', queryTransformVersion: 'query:v1', manifest: { dimensions: 3 },
  }));
  await asRagControlExecutor(pool, (client) => registerRagReleasePolicy(client, {
    id: policyId, minLabeledQueries: 1, maxRecallDropBp: 100, maxP95RegressionBp: 100, maxCostRegressionBp: 100,
  }));
  await asRagControlExecutor(pool, (client) => startRagGeneration(client, dispatchGenerationId, recipeId, policyId));

  const operation = 'generation_embedding_batch';
  const key = 'rebuild:alpha:batch:0';
  const input = hash('alpha batch canonical input');
  const requestId = await begin(operation, key, input, 1);
  const replayId = await begin(operation, key, input, 1);
  const conflictingReplayRejected = await fails(() => begin(operation, key, hash('different input'), 1), 'rag_control_idempotency_conflict');
  check('same root/revision/input reads back exactly one immutable request while a conflicting replay is rejected',
    requestId === replayId && conflictingReplayRejected);
  await asRagControlExecutor(pool, (client) => client.query(
    'SELECT rag_control.rag_bind_generation_dispatch_request($1,$2)', [requestId, dispatchGenerationId],
  ));

  const policyRevision = 'embedding-provider-policy-v1';
  const providerKey = hash(`provider:${requestId}:v1`);
  const admitted = await Promise.all(Array.from({ length: 20 }, () => asRagControlExecutor(pool, async (client) => {
    const result = await client.query<{ admitted: boolean }>(
      'SELECT rag_control.rag_mark_request_dispatching($1,$2,$3) AS admitted',
      [requestId, policyRevision, providerKey],
    );
    return result.rows[0]?.admitted === true;
  })));
  const attempt = await pool.query<{ count: string; state: string }>(
    `SELECT count(*)::text AS count, max(state) AS state
       FROM rag_control_dispatch_attempt WHERE request_id=$1`,
    [requestId],
  );
  check('twenty concurrent recoveries elect exactly one pre-dispatch provider sender and persist exactly one attempt',
    admitted.filter(Boolean).length === 1 && attempt.rows[0]?.count === '1' && attempt.rows[0]?.state === 'dispatching');

  await asRagControlExecutor(pool, (client) => client.query(
    'SELECT rag_control.rag_settle_request_dispatch($1,$2,$3)',
    [requestId, 'known_not_sent', hash('pre-send-crash')],
  ));
  const successorId = await begin(operation, key, hash('same logical work revised after known-not-sent'), 2);
  const predecessor = await pool.query<{ predecessor_request_id: string; workflow_root_id: string; business_revision: number }>(
    'SELECT predecessor_request_id,workflow_root_id,business_revision FROM rag_control_request WHERE request_id=$1',
    [successorId],
  );
  check('only a known-not-sent predecessor may create revision two under the same immutable workflow root',
    predecessor.rows[0]?.predecessor_request_id === requestId
      && predecessor.rows[0]?.workflow_root_id === requestId
      && Number(predecessor.rows[0]?.business_revision) === 2);

  const unknownKey = 'rebuild:beta:batch:0';
  const unknownRequestId = await begin(operation, unknownKey, hash('beta canonical input'), 1);
  await asRagControlExecutor(pool, (client) => client.query(
    'SELECT rag_control.rag_bind_generation_dispatch_request($1,$2)', [unknownRequestId, dispatchGenerationId],
  ));
  await asRagControlExecutor(pool, (client) => client.query(
    'SELECT rag_control.rag_mark_request_dispatching($1,$2,$3)',
    [unknownRequestId, policyRevision, hash(`provider:${unknownRequestId}:v1`)],
  ));
  await asRagControlExecutor(pool, (client) => client.query(
    'SELECT rag_control.rag_settle_request_dispatch($1,$2,$3)',
    [unknownRequestId, 'unknown', hash('response-lost')],
  ));
  const unknownSuccessorRejected = await fails(
    () => begin(operation, unknownKey, hash('must-not-retry-unknown'), 2),
    'rag_control_successor_requires_reconciliation',
  );
  check('an unknown dispatch never creates an automatic successor or another provider idempotency key', unknownSuccessorRejected);

  // Fault-injection seam: a provider dispatch can become unknown after its
  // domain row was durably associated but before a result was received.
  // Association is itself a reviewed low-privilege API; no test writes a
  // foreign request id into the business row to create this shape.
  const generationId = 'rgen-77777777-7777-4777-8777-777777777777';
  const rebuildRunId = 'rrun-88888888-8888-4888-8888-888888888888';
  await asRagControlExecutor(pool, (client) => startRagGeneration(client, generationId, recipeId, policyId));
  await asRagControlExecutor(pool, (client) => createRagRebuildRun(client, rebuildRunId, generationId, null, 0));

  const generationUnknownId = await begin('generation_embedding_batch', 'terminalizer:generation', hash('generation provider command'), 1);
  await asRagControlExecutor(pool, (client) => client.query(
    'SELECT rag_control.rag_bind_generation_dispatch_request($1,$2)', [generationUnknownId, generationId],
  ));
  await asRagControlExecutor(pool, (client) => client.query(
    'SELECT rag_control.rag_mark_request_dispatching($1,$2,$3)',
    [generationUnknownId, policyRevision, hash(`provider:${generationUnknownId}`)],
  ));
  await asRagControlExecutor(pool, (client) => client.query(
    'SELECT rag_control.rag_settle_request_dispatch($1,$2,$3)',
    [generationUnknownId, 'unknown', hash('generation response lost')],
  ));
  const generationReceiptId = 'rrec-generation-terminalizer';
  await asRagControlExecutor(pool, (client) => client.query(
    'SELECT rag_control.rag_record_reconciliation_receipt($1,$2,$3,$4,$5,$6)',
    [generationUnknownId, generationReceiptId, 'generation', generationId, 'failed', hash('generation reconciliation')],
  ));
  const wrongGenerationRejected = await fails(() => asRagControlExecutor(pool, (client) => client.query(
    'SELECT rag_control.rag_terminalize_unknown_generation($1,$2,$3)',
    [generationUnknownId, 'rgen-99999999-9999-4999-8999-999999999999', generationReceiptId],
  )), 'rag_reconciliation_receipt_missing');
  await asRagControlExecutor(pool, (client) => client.query(
    'SELECT rag_control.rag_terminalize_unknown_generation($1,$2,$3)',
    [generationUnknownId, generationId, generationReceiptId],
  ));
  const generationTerminal = await pool.query<{ state: string; outcome: string }>(
    `SELECT g.state,r.outcome FROM rag_embedding_generation g
       JOIN rag_control_dispatch_subject s ON s.subject_kind='generation' AND s.subject_id=g.id
       JOIN rag_control_request r ON r.request_id=s.request_id
      WHERE g.id=$1 AND r.request_id=$2`, [generationId, generationUnknownId],
  );
  const reconciledSuccessor = await begin('generation_embedding_batch', 'terminalizer:generation', hash('generation replacement command'), 2)
    .then(() => true, () => false);
  check('an exact reconciliation receipt terminalizes unknown generation work once and only then permits a new business revision',
    wrongGenerationRejected && generationTerminal.rows[0]?.state === 'failed'
      && generationTerminal.rows[0]?.outcome === 'failed' && reconciledSuccessor);

  const rebuildUnknownId = await begin('rebuild_external_step', 'terminalizer:rebuild', hash('rebuild provider command'), 1);
  await asRagControlExecutor(pool, (client) => client.query(
    'SELECT rag_control.rag_bind_rebuild_dispatch_request($1,$2)', [rebuildUnknownId, rebuildRunId],
  ));
  await asRagControlExecutor(pool, (client) => client.query(
    'SELECT rag_control.rag_mark_request_dispatching($1,$2,$3)',
    [rebuildUnknownId, policyRevision, hash(`provider:${rebuildUnknownId}`)],
  ));
  await asRagControlExecutor(pool, (client) => client.query(
    'SELECT rag_control.rag_settle_request_dispatch($1,$2,$3)',
    [rebuildUnknownId, 'unknown', hash('rebuild response lost')],
  ));
  const rebuildReceiptId = 'rrec-rebuild-terminalizer';
  await asRagControlExecutor(pool, (client) => client.query(
    'SELECT rag_control.rag_record_reconciliation_receipt($1,$2,$3,$4,$5,$6)',
    [rebuildUnknownId, rebuildReceiptId, 'rebuild_run', rebuildRunId, 'failed', hash('rebuild reconciliation')],
  ));
  await asRagControlExecutor(pool, (client) => client.query(
    'SELECT rag_control.rag_terminalize_unknown_rebuild_run($1,$2,$3)',
    [rebuildUnknownId, rebuildRunId, rebuildReceiptId],
  ));
  const rebuildTerminal = await pool.query<{ status: string; outcome: string }>(
    `SELECT r.status,q.outcome FROM rag_rebuild_run r
       JOIN rag_control_dispatch_subject s ON s.subject_kind='rebuild_run' AND s.subject_id=r.id
       JOIN rag_control_request q ON q.request_id=s.request_id
      WHERE r.id=$1 AND q.request_id=$2`, [rebuildRunId, rebuildUnknownId],
  );
  check('an exact reconciliation receipt terminalizes unknown rebuild work once without reviving its lease',
    rebuildTerminal.rows[0]?.status === 'failed' && rebuildTerminal.rows[0]?.outcome === 'failed');

  console.log(failures === 0
    ? '\n✓ generic RAG dispatch state-machine proof passed (local isolated evidence only)'
    : `\n✗ ${failures} generic RAG dispatch state-machine assertions failed`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => {
  console.error(error);
  await pool.end().catch(() => undefined);
  process.exit(1);
});

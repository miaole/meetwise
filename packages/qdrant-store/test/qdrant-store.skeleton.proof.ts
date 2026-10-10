/**
 * M4 Qdrant store skeleton prove — live against compose.mysql-local qdrant :6333.
 * Prints CMD= … EXIT= …
 * releaseEvidence=false · Not HA · 本绿 ≠ 已迁 · 不切向量真相
 *
 * Harness: ai-docs/delivery/harness/qdrant-store.prototype.md
 * Root script: pnpm qdrant-store:skeleton:prove
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import {
  QDRANT_VECTOR_SIZE,
  assertErasureReceiptShape,
  createQdrantStore,
} from '../src/index.ts';

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, '..');
const repoRoot = join(pkgRoot, '..', '..');
const scriptLabel = 'pnpm qdrant-store:skeleton:prove';

const retrievalPath = join(repoRoot, 'packages/db/src/retrieval-store.ts');
const vectorstoreProofPath = join(repoRoot, 'packages/db/test/vectorstore.proof.ts');
const e2eIsolatedPath = join(repoRoot, 'scripts/run-e2e-isolated.mjs');
const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/qdrant-store.prototype.md');
const implDocPath = join(repoRoot, 'ai-docs/delivery/m4-qdrant-prototype-impl.md');

let exitCode = 0;
const lines: string[] = [];

function fail(msg: string) {
  lines.push(`FAIL  ${msg}`);
  exitCode = 1;
}
function pass(msg: string) {
  lines.push(`PASS  ${msg}`);
}

function unit(i: number): number[] {
  const v = new Array(QDRANT_VECTOR_SIZE).fill(0);
  v[i % QDRANT_VECTOR_SIZE] = 1;
  return v;
}

async function main() {
  // --- static: harness + docs + pgvector paths intact ---
  if (existsSync(harnessPath)) {
    const h = readFileSync(harnessPath, 'utf8');
    if (/pnpm qdrant-store:skeleton:prove/.test(h)) pass('harness pins pnpm qdrant-store:skeleton:prove');
    else fail('harness must pin pnpm qdrant-store:skeleton:prove');
    if (/不切生产向量真相|不删 pgvector/.test(h)) pass('harness pins 不切/不删 pgvector 活路径');
    else fail('harness must forbid cutting pgvector live paths');
    if (/releaseEvidence\s*=\s*false/i.test(h)) pass('harness releaseEvidence=false');
    else fail('harness must pin releaseEvidence=false');
  } else {
    fail(`harness missing: ${harnessPath}`);
  }

  if (existsSync(implDocPath)) pass(`impl doc present: ${implDocPath}`);
  else fail(`impl doc missing: ${implDocPath}`);

  const erasureSrcPath = join(pkgRoot, 'src/erasure.ts');
  if (existsSync(erasureSrcPath)) {
    const src = readFileSync(erasureSrcPath, 'utf8');
    if (/deleted_count\s*:\s*ids\.length/.test(src)) fail('erasure.ts must not blindly set deleted_count: ids.length');
    else pass('erasure.ts deleted_count not blind ids.length (count honesty)');
  } else fail(`erasure.ts missing: ${erasureSrcPath}`);

  if (existsSync(retrievalPath)) {
    const t = readFileSync(retrievalPath, 'utf8');
    if (/export async function annSearch/.test(t)) pass('retrieval-store.ts annSearch intact (不切向量真相)');
    else fail('retrieval-store.ts must keep export async function annSearch');
  } else fail(`retrieval-store.ts missing: ${retrievalPath}`);

  if (existsSync(vectorstoreProofPath)) {
    const t = readFileSync(vectorstoreProofPath, 'utf8');
    if (/pgvector/.test(t)) pass('vectorstore.proof.ts still bound to pgvector');
    else fail('vectorstore.proof.ts must still evidence pgvector');
  } else fail(`vectorstore.proof.ts missing: ${vectorstoreProofPath}`);

  if (existsSync(e2eIsolatedPath)) {
    const t = readFileSync(e2eIsolatedPath, 'utf8');
    if (/E2E_PG_IMAGE|pgvector\/pgvector/.test(t)) pass('run-e2e-isolated.mjs E2E_PG_IMAGE / pgvector intact');
    else fail('run-e2e-isolated.mjs must keep E2E_PG_IMAGE / pgvector');
  } else fail(`run-e2e-isolated.mjs missing: ${e2eIsolatedPath}`);

  // --- live qdrant ---
  const store = createQdrantStore({
    collection: `meetwise_m4_proto_v512_${process.pid}`,
  });

  try {
    const ready = await store.readyz();
    if (ready) pass(`qdrant readyz OK @ ${store.url}`);
    else fail(`qdrant readyz failed @ ${store.url}`);
  } catch (e) {
    fail(`qdrant readyz error: ${(e as Error).message}`);
  }

  if (exitCode !== 0) {
    finish();
    return;
  }

  try {
    const ensured = await store.ensureCollection();
    pass(`ensureCollection collection=${ensured.collection} created=${ensured.created} size=${QDRANT_VECTOR_SIZE} Cosine`);
  } catch (e) {
    fail(`ensureCollection failed: ${(e as Error).message}`);
    finish();
    return;
  }

  const pointId = randomUUID();
  const vec = unit(7);

  try {
    await store.upsert([{ id: pointId, vector: vec, payload: { proto: true, kind: 'm4_skeleton' } }]);
    pass(`upsert point id=${pointId}`);
  } catch (e) {
    fail(`upsert failed: ${(e as Error).message}`);
    finish();
    return;
  }

  try {
    const hits = await store.search(vec, 5);
    const found = hits.some((h) => String(h.id) === pointId);
    if (found) pass(`search recall>0 for upserted id (hits=${hits.length})`);
    else fail(`search did not recall upserted id; hits=${JSON.stringify(hits.map((h) => h.id))}`);
  } catch (e) {
    fail(`search failed: ${(e as Error).message}`);
    finish();
    return;
  }

  let receipt;
  try {
    receipt = await store.erasePoints([pointId]);
    assertErasureReceiptShape(receipt);
    if (receipt.id !== pointId) fail(`receipt.id expected ${pointId}, got ${receipt.id}`);
    else if (receipt.collection !== store.collection) fail('receipt.collection mismatch');
    else if (receipt.deleted_count !== 1) fail(`receipt.deleted_count expected 1, got ${receipt.deleted_count}`);
    else pass(`erasure receipt ok id=${receipt.id} collection=${receipt.collection} deleted_count=${receipt.deleted_count} at=${receipt.at}`);
  } catch (e) {
    fail(`erase/receipt failed: ${(e as Error).message}`);
    finish();
    return;
  }

  try {
    const hits = await store.search(vec, 5);
    const found = hits.some((h) => String(h.id) === pointId);
    if (!found) pass('post-erase search recall=0 for deleted id');
    else fail(`post-erase search still recalled deleted id; hits=${JSON.stringify(hits.map((h) => h.id))}`);
  } catch (e) {
    fail(`post-erase search failed: ${(e as Error).message}`);
  }

  lines.push('NOTE  releaseEvidence=false; Not HA; 本绿≠已迁; 不切向量真相 / pgvector 活路径 intact');
  finish();
}

function finish() {
  for (const line of lines) console.log(line);
  console.log(`CMD=${scriptLabel} EXIT=${exitCode}`);
  process.exit(exitCode);
}

main().catch((e) => {
  fail(`unhandled: ${(e as Error).message}`);
  finish();
});

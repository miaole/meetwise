/**
 * Qdrant erase deleted_count honesty prove — live against compose.mysql-local qdrant :6333.
 * Prints CMD= … EXIT= …
 * releaseEvidence=false · Not HA · 本绿 ≠ 已迁 · ≠ 0091 ledger aligned · 不切向量真相
 *
 * Harness: ai-docs/delivery/harness/qdrant-erase-count-honesty.md
 * Root script: pnpm qdrant-store:erase-honesty:prove
 *
 * Pins: 假闭环风险 mitigated for count only; still ≠ 0091 ledger.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import {
  QDRANT_VECTOR_SIZE,
  assertErasureReceiptShape,
  batchDigestForIds,
  createQdrantStore,
} from '../src/index.ts';

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, '..');
const repoRoot = join(pkgRoot, '..', '..');
const scriptLabel = 'pnpm qdrant-store:erase-honesty:prove';

const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/qdrant-erase-count-honesty.md');
const erasureSrcPath = join(pkgRoot, 'src/erasure.ts');
const retrievalPath = join(repoRoot, 'packages/db/src/retrieval-store.ts');
const vectorstoreProofPath = join(repoRoot, 'packages/db/test/vectorstore.proof.ts');
const e2eIsolatedPath = join(repoRoot, 'scripts/run-e2e-isolated.mjs');

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
  // --- static: harness pins ---
  if (!existsSync(harnessPath)) {
    fail(`harness missing: ${harnessPath}`);
  } else {
    const h = readFileSync(harnessPath, 'utf8');
    if (/pnpm qdrant-store:erase-honesty:prove/.test(h)) pass('harness pins pnpm qdrant-store:erase-honesty:prove');
    else fail('harness must pin pnpm qdrant-store:erase-honesty:prove');
    if (/期望 EXIT[\s\S]*?\*\*0\*\*/.test(h) || /\|\s*`pnpm qdrant-store:erase-honesty:prove`\s*\|\s*\*\*0\*\*/.test(h)) {
      pass('harness pins erase-honesty EXIT=0');
    } else fail('harness must pin erase-honesty expected EXIT=0');
    if (/假闭环风险/.test(h) && /mitigated/.test(h) && /count only|count only|诚实性/.test(h)) {
      pass('harness pins 假闭环风险 mitigated for count only');
    } else fail('harness must pin 假闭环风险 mitigated for count only');
    if (/≠\s*0091|仍 ≠.*0091|≠ 0091 ledger|仍 open/.test(h)) {
      pass('harness pins still ≠ 0091 ledger');
    } else fail('harness must pin still ≠ 0091 ledger (no false ledger alignment claim)');
    if (/releaseEvidence\s*=\s*false/i.test(h)) pass('harness releaseEvidence=false');
    else fail('harness must pin releaseEvidence=false');
    if (/不切生产向量真相|不删 pgvector/.test(h)) pass('harness pins 不切/不删 pgvector 活路径');
    else fail('harness must forbid cutting pgvector live paths');
  }

  // --- static: source must not blindly assign deleted_count: ids.length ---
  if (!existsSync(erasureSrcPath)) {
    fail(`erasure.ts missing: ${erasureSrcPath}`);
  } else {
    const src = readFileSync(erasureSrcPath, 'utf8');
    if (/deleted_count\s*:\s*ids\.length/.test(src)) {
      fail('erasure.ts must not blindly set deleted_count: ids.length');
    } else {
      pass('erasure.ts does not blindly assign deleted_count: ids.length');
    }
    if (/retrieveIds/.test(src) && /presentBefore|before/.test(src)) {
      pass('erasure.ts derives deleted_count via retrieve pre/post verification');
    } else {
      fail('erasure.ts must derive deleted_count from retrieve pre/post verification');
    }
    if (/batch_digest|batchDigestForIds/.test(src)) pass('erasure.ts documents/emits batch_digest for multi-id');
    else fail('erasure.ts must emit batch_digest for multi-id batches');
    if (/≠ 0091|0091/.test(src)) pass('erasure.ts notes ≠ 0091 ledger aligned');
    else fail('erasure.ts must note prototype ≠ 0091 ledger aligned');
  }

  // --- pgvector live paths intact ---
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

  if (exitCode !== 0) {
    finish();
    return;
  }

  const store = createQdrantStore({
    collection: `meetwise_m4_erase_honesty_${process.pid}`,
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
    pass(`ensureCollection collection=${ensured.collection} created=${ensured.created}`);
  } catch (e) {
    fail(`ensureCollection failed: ${(e as Error).message}`);
    finish();
    return;
  }

  const idA = randomUUID();
  const idB = randomUUID();
  const idC = randomUUID();
  const phantom = randomUUID();

  try {
    await store.upsert([
      { id: idA, vector: unit(1), payload: { k: 'a' } },
      { id: idB, vector: unit(2), payload: { k: 'b' } },
      { id: idC, vector: unit(3), payload: { k: 'c' } },
    ]);
    pass(`upsert 3 points a/b/c`);
  } catch (e) {
    fail(`upsert failed: ${(e as Error).message}`);
    finish();
    return;
  }

  // Batch erase: 2 real + 1 phantom → deleted_count must be 2 (not ids.length=3)
  const batchIds = [idA, idB, phantom];
  let batchReceipt;
  try {
    batchReceipt = await store.erasePoints(batchIds);
    assertErasureReceiptShape(batchReceipt);
    const expectedDigest = batchDigestForIds(batchIds);
    if (batchReceipt.deleted_count !== 2) {
      fail(`batch deleted_count expected 2 (actual removals), got ${batchReceipt.deleted_count} (must not equal ids.length=${batchIds.length})`);
    } else {
      pass(`batch deleted_count=2 matches actual removals (not ids.length=${batchIds.length})`);
    }
    if (!batchReceipt.batch_digest) {
      fail('batch receipt must include batch_digest (勿只写 ids[0] 丢其余)');
    } else if (batchReceipt.batch_digest !== expectedDigest) {
      fail(`batch_digest mismatch: got ${batchReceipt.batch_digest}, expected ${expectedDigest}`);
    } else {
      pass(`batch_digest covers all target ids sha256=${batchReceipt.batch_digest.slice(0, 12)}…`);
    }
    if (batchReceipt.id === idA || batchReceipt.id === batchIds[0]) {
      fail('batch receipt.id must not be bare ids[0] alone; use batch:<digest16> key');
    } else if (!String(batchReceipt.id).startsWith('batch:')) {
      fail(`batch receipt.id expected batch:<digest16>, got ${batchReceipt.id}`);
    } else {
      pass(`batch receipt.id=${batchReceipt.id} (not bare ids[0])`);
    }
  } catch (e) {
    fail(`batch erase/receipt failed: ${(e as Error).message}`);
    finish();
    return;
  }

  // Verify A/B gone, C remains via retrieve
  try {
    const present = await store.client.retrieveIds([idA, idB, idC, phantom]);
    const set = new Set(present);
    if (set.has(idA) || set.has(idB)) fail(`post-batch retrieve still has erased ids: ${present.join(',')}`);
    else if (!set.has(idC)) fail('post-batch retrieve missing survivor idC');
    else pass('post-batch retrieve: A/B gone, C remains (actual removals=2)');
  } catch (e) {
    fail(`post-batch retrieve failed: ${(e as Error).message}`);
  }

  // Re-erase already-gone A → deleted_count must be 0 (honesty vs ids.length=1)
  try {
    const again = await store.erasePoints([idA]);
    assertErasureReceiptShape(again);
    if (again.deleted_count !== 0) {
      fail(`re-erase deleted_count expected 0, got ${again.deleted_count}`);
    } else {
      pass('re-erase already-absent id → deleted_count=0 (honest)');
    }
    if (again.id !== idA) fail(`single re-erase receipt.id expected ${idA}`);
    else pass('single-id receipt.id is the point id');
    if (again.batch_digest) fail('single-id receipt must not set batch_digest');
    else pass('single-id receipt omits batch_digest');
  } catch (e) {
    fail(`re-erase failed: ${(e as Error).message}`);
  }

  // Single erase of surviving C → deleted_count=1
  try {
    const one = await store.erasePoints([idC]);
    assertErasureReceiptShape(one);
    if (one.deleted_count !== 1) fail(`single erase deleted_count expected 1, got ${one.deleted_count}`);
    else pass('single erase deleted_count=1 matches actual removal');
    const left = await store.client.retrieveIds([idC]);
    if (left.length !== 0) fail(`idC still present after erase: ${left.join(',')}`);
    else pass('post-single retrieve confirms removal');
  } catch (e) {
    fail(`single erase failed: ${(e as Error).message}`);
  }

  lines.push('NOTE  releaseEvidence=false; Not HA; 本绿≠已迁; count-honesty mitigated only; still ≠ 0091 ledger; 不切向量真相 / pgvector intact');
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

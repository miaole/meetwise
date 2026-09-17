/**
 * G5 Qdrant erasure ledger honesty prove (subject erase · countable receipt).
 *
 * Live against compose.mysql-local qdrant :6333 when available.
 * Fail-closed EXIT=3 when /readyz missing.
 *
 * HARD:
 *   - recall=0 + receipt ≠ 0091 ledger aligned (G5 still GAP)
 *   - ≠ fake public DELETE 200/202 (product path still 503)
 *   - releaseEvidence=false · Not HA · 本绿 ≠ 已迁 · 不切向量真相
 *
 * Harness: ai-docs/delivery/harness/qdrant-g5-erasure-ledger.md
 * Root: pnpm qdrant-store:g5-erasure:prove
 *
 * EXIT=0 → inventory + subject erase + recall=0 + G5 GAP pins
 * EXIT=1 → honesty / assertion failure
 * EXIT=3 → Qdrant PREREQ missing
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  QDRANT_VECTOR_SIZE,
  assertErasureReceiptShape,
  batchDigestForIds,
  createQdrantVectorStoreAdapter,
} from '../src/index.ts';

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, '..');
const repoRoot = join(pkgRoot, '..', '..');
const scriptLabel = 'pnpm qdrant-store:g5-erasure:prove';

const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/qdrant-g5-erasure-ledger.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r5-retirement-sole-stack-status.md');
const countHonestyHarness = join(repoRoot, 'ai-docs/delivery/harness/qdrant-erase-count-honesty.md');
const privacy503Harness = join(repoRoot, 'ai-docs/delivery/harness/privacy-erasure-http-503-pin.md');
const erasureSrcPath = join(pkgRoot, 'src/erasure.ts');
const adapterSrcPath = join(pkgRoot, 'src/vectorstore-adapter.ts');
const privacyServicePath = join(repoRoot, 'apps/api/src/modules/privacy/privacy.service.ts');
const retrievalPath = join(repoRoot, 'packages/db/src/retrieval-store.ts');
const vectorstoreProofPath = join(repoRoot, 'packages/db/test/vectorstore.proof.ts');
const e2eIsolatedPath = join(repoRoot, 'scripts/run-e2e-isolated.mjs');
const rootPkgPath = join(repoRoot, 'package.json');

let exitCode = 0;
const lines: string[] = [];

function fail(msg: string) {
  lines.push(`FAIL  ${msg}`);
  if (exitCode === 0) exitCode = 1;
}
function pass(msg: string) {
  lines.push(`PASS  ${msg}`);
}
function note(msg: string) {
  lines.push(`NOTE  ${msg}`);
}
function prereq(msg: string) {
  lines.push(`PREREQ ${msg}`);
  if (exitCode === 0 || exitCode === 1) exitCode = 3;
}

const DIM = QDRANT_VECTOR_SIZE;
function embed(seed: number): number[] {
  let s = (seed * 2654435761) >>> 0;
  const v: number[] = [];
  for (let i = 0; i < DIM; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    v.push(s / 2 ** 32 - 0.5);
  }
  const nrm = Math.hypot(...v) || 1;
  return v.map((x) => x / nrm);
}

function finish() {
  for (const line of lines) console.log(line);
  console.log(`CMD=${scriptLabel} EXIT=${exitCode}`);
  process.exit(exitCode);
}

async function main() {
  // --- inventory + honesty pins ---
  if (!existsSync(harnessPath)) {
    fail(`harness missing: ${harnessPath}`);
  } else {
    const h = readFileSync(harnessPath, 'utf8');
    if (/pnpm qdrant-store:g5-erasure:prove/.test(h)) pass('harness pins pnpm qdrant-store:g5-erasure:prove');
    else fail('harness must pin pnpm qdrant-store:g5-erasure:prove');
    if (/releaseEvidence\s*=\s*false/i.test(h)) pass('harness releaseEvidence=false');
    else fail('harness must pin releaseEvidence=false');
    if (/Not HA/i.test(h)) pass('harness Not HA');
    else fail('harness must pin Not HA');
    if (/recall=0.*≠\s*0091|≠\s*0091 ledger|仍 GAP.*G5|G5.*仍 GAP/i.test(h)) {
      pass('harness pins G5 still GAP (recall=0+receipt ≠ 0091)');
    } else fail('harness must pin G5 still GAP: recall=0+receipt ≠ 0091');
    if (/503/.test(h) && (/DELETE/.test(h) || /公开/.test(h))) {
      pass('harness pins public DELETE still 503 (no invented success)');
    } else fail('harness must pin public DELETE still 503');
    if (/Inventory|inventory/.test(h) && /erase-honesty/.test(h) && /skeleton/.test(h)) {
      pass('harness inventories skeleton + erase-honesty proves');
    } else fail('harness must inventory existing erase proves');
    if (/Proven vs GAP|Proven.*GAP/.test(h)) pass('harness has Proven vs GAP');
    else fail('harness must summarize Proven vs GAP');
    if (/P15|subject/.test(h)) pass('harness cites P15 / subject erase');
    else fail('harness must cite P15 / subject erase');
    if (/mw-privacy-int/.test(h)) pass('harness requires mw-privacy-int review');
    else fail('harness must require mw-privacy-int');
  }

  if (existsSync(countHonestyHarness)) pass('count-honesty harness present (inventory)');
  else fail(`count-honesty harness missing: ${countHonestyHarness}`);
  if (existsSync(privacy503Harness)) pass('privacy-erasure-http-503-pin harness present (inventory)');
  else fail(`privacy 503 harness missing: ${privacy503Harness}`);

  if (!existsSync(statusPath)) {
    fail(`status missing: ${statusPath}`);
  } else {
    const st = readFileSync(statusPath, 'utf8');
    if (/G5/.test(st) && (/0091/.test(st) || /ledger/.test(st))) {
      pass('status cites G5 erasure ledger GAP');
    } else fail('status must cite G5 erasure ledger GAP');
    if (/P15/.test(st) && /g5-erasure:prove|eraseSubject|subject-scoped/.test(st)) {
      pass('status Proven-pins P15 / g5-erasure');
    } else fail('status must Proven-pin P15 g5-erasure subject erase');
    if (/releaseEvidence\s*=\s*false/i.test(st)) pass('status releaseEvidence=false');
    else fail('status must pin releaseEvidence=false');
  }

  if (!existsSync(erasureSrcPath)) {
    fail(`erasure.ts missing: ${erasureSrcPath}`);
  } else {
    const src = readFileSync(erasureSrcPath, 'utf8');
    if (/eraseSubjectPoints/.test(src)) pass('erasure.ts exports eraseSubjectPoints');
    else fail('erasure.ts must implement eraseSubjectPoints');
    if (/deleted_count\s*:\s*ids\.length/.test(src)) {
      fail('erasure.ts must not blindly set deleted_count: ids.length');
    } else pass('erasure.ts deleted_count not blind ids.length');
    if (/≠ 0091|0091/.test(src)) pass('erasure.ts notes ≠ 0091 ledger');
    else fail('erasure.ts must note ≠ 0091');
    if (/scrollPointIds|owner_user_id/.test(src)) pass('erasure.ts subject filter via owner_user_id');
    else fail('erasure.ts must filter subject via owner_user_id');
  }

  if (!existsSync(adapterSrcPath)) {
    fail(`adapter missing: ${adapterSrcPath}`);
  } else {
    const a = readFileSync(adapterSrcPath, 'utf8');
    if (/eraseSubjectMemoryVectors/.test(a)) pass('adapter exposes eraseSubjectMemoryVectors');
    else fail('adapter must expose eraseSubjectMemoryVectors');
  }

  // Product DELETE still 503 — never invent success
  if (!existsSync(privacyServicePath)) {
    fail(`privacy.service missing: ${privacyServicePath}`);
  } else {
    const ps = readFileSync(privacyServicePath, 'utf8');
    if (
      /eraseInterviewData/.test(ps) &&
      /SERVICE_UNAVAILABLE|HttpStatus\.SERVICE_UNAVAILABLE/.test(ps) &&
      /interview_erasure_authorization_not_available/.test(ps)
    ) {
      pass('privacy.service eraseInterviewData still 503 fail-closed (≠ DELETE success)');
    } else {
      fail('privacy.service must keep eraseInterviewData 503 (interview_erasure_authorization_not_available)');
    }
    if (
      /deleteResumeData/.test(ps) &&
      /SERVICE_UNAVAILABLE|HttpStatus\.SERVICE_UNAVAILABLE/.test(ps) &&
      /resume_erasure_migration_in_progress/.test(ps)
    ) {
      pass('privacy.service deleteResumeData still 503 fail-closed');
    } else {
      fail('privacy.service must keep deleteResumeData 503');
    }
  }

  // pgvector live paths intact
  if (existsSync(retrievalPath)) {
    const t = readFileSync(retrievalPath, 'utf8');
    if (/export async function annSearch/.test(t)) pass('retrieval-store.ts annSearch intact');
    else fail('retrieval-store.ts must keep annSearch');
  } else fail(`retrieval-store missing: ${retrievalPath}`);

  if (existsSync(vectorstoreProofPath)) {
    const t = readFileSync(vectorstoreProofPath, 'utf8');
    if (/pgvector/.test(t)) pass('vectorstore.proof.ts still pgvector-bound');
    else fail('vectorstore.proof.ts must evidence pgvector');
  } else fail(`vectorstore.proof missing: ${vectorstoreProofPath}`);

  if (existsSync(e2eIsolatedPath)) {
    const t = readFileSync(e2eIsolatedPath, 'utf8');
    if (/E2E_PG_IMAGE|pgvector\/pgvector/.test(t)) pass('run-e2e-isolated E2E_PG_IMAGE intact');
    else fail('run-e2e-isolated must keep E2E_PG_IMAGE');
  } else fail(`run-e2e-isolated missing: ${e2eIsolatedPath}`);

  if (existsSync(rootPkgPath)) {
    const pkg = JSON.parse(readFileSync(rootPkgPath, 'utf8')) as { scripts?: Record<string, string> };
    if (pkg.scripts?.['qdrant-store:g5-erasure:prove']) pass('root package.json wires qdrant-store:g5-erasure:prove');
    else fail('root package.json must wire qdrant-store:g5-erasure:prove');
    if (pkg.scripts?.['e2e-isolation:sole-g5-erasure:prove']) {
      fail('g5-erasure must NOT be on sole allowlist scripts');
    } else pass('g5-erasure NOT on sole allowlist (standalone)');
  } else fail('root package.json missing');

  if (exitCode !== 0 && exitCode !== 3) {
    finish();
    return;
  }

  // --- live Qdrant ---
  const adapter = createQdrantVectorStoreAdapter({
    collection: `meetwise_g5_erasure_${process.pid}`,
  });

  try {
    await adapter.requireReadyz();
    pass(`qdrant readyz OK @ ${adapter.url}`);
  } catch (e) {
    prereq(`qdrant readyz failed: ${(e as Error).message}`);
    note('STILL-GAP: G5 erasure ledger (0091) — live prove skipped (PREREQ)');
    note('releaseEvidence=false; Not HA; ≠ privacy covered; ≠ DELETE 200');
    finish();
    return;
  }

  try {
    await adapter.ensureCollection();
    pass(`ensureCollection collection=${adapter.collection}`);
  } catch (e) {
    fail(`ensureCollection failed: ${(e as Error).message}`);
    finish();
    return;
  }

  const ownerA = `sub-a-${process.pid}`;
  const ownerB = `sub-b-${process.pid}`;

  try {
    await adapter.upsertVectorChunk(ownerA, {
      id: 'la1',
      kind: 'memory',
      refId: 'mem-a1',
      contentHash: 'hash-a1',
      embedding: embed(11),
    });
    await adapter.upsertVectorChunk(ownerA, {
      id: 'la2',
      kind: 'memory',
      refId: 'mem-a2',
      contentHash: 'hash-a2',
      embedding: embed(12),
    });
    await adapter.upsertVectorChunk(ownerB, {
      id: 'lb1',
      kind: 'memory',
      refId: 'mem-b1',
      contentHash: 'hash-b1',
      embedding: embed(21),
    });
    pass('upsert memory chunks: subject A×2 + subject B×1');
  } catch (e) {
    fail(`upsert failed: ${(e as Error).message}`);
    finish();
    return;
  }

  // Pre-erase: A recalls own
  try {
    const preA = await adapter.annSearch(ownerA, 'memory', embed(11), 5);
    if (preA.some((h) => h.refId === 'mem-a1')) pass('pre-erase: subject A recalls mem-a1');
    else fail(`pre-erase A recall failed: ${JSON.stringify(preA)}`);
    const preB = await adapter.annSearch(ownerB, 'memory', embed(21), 5);
    if (preB.some((h) => h.refId === 'mem-b1')) pass('pre-erase: subject B recalls mem-b1');
    else fail(`pre-erase B recall failed: ${JSON.stringify(preB)}`);
  } catch (e) {
    fail(`pre-erase search failed: ${(e as Error).message}`);
  }

  // Subject erase A
  let receipt;
  try {
    receipt = await adapter.eraseSubjectMemoryVectors(ownerA);
    assertErasureReceiptShape(receipt);
    if (receipt.subject_id !== ownerA) fail(`receipt.subject_id expected ${ownerA}, got ${receipt.subject_id}`);
    else pass(`receipt.subject_id=${receipt.subject_id}`);
    if (receipt.id !== `subject:${ownerA}`) fail(`receipt.id expected subject:${ownerA}, got ${receipt.id}`);
    else pass(`receipt.id=subject:<owner>`);
    if (receipt.deleted_count !== 2) {
      fail(`subject A deleted_count expected 2, got ${receipt.deleted_count} (must be countable actual removals)`);
    } else {
      pass('subject A deleted_count=2 matches actual removals (countable receipt)');
    }
    if (!receipt.batch_digest || !/^[a-f0-9]{64}$/.test(receipt.batch_digest)) {
      fail('subject receipt must include verifiable batch_digest');
    } else {
      pass(`subject batch_digest=${receipt.batch_digest.slice(0, 12)}…`);
    }
  } catch (e) {
    fail(`eraseSubjectMemoryVectors failed: ${(e as Error).message}`);
    finish();
    return;
  }

  // Post-erase recall=0 for A; B intact
  try {
    const postA = await adapter.annSearch(ownerA, 'memory', embed(11), 5);
    if (postA.length === 0) pass('post-erase: subject A memory ANN recall=0');
    else fail(`post-erase A still has hits (recall≠0): ${JSON.stringify(postA)}`);
    const postB = await adapter.annSearch(ownerB, 'memory', embed(21), 5);
    if (postB.some((h) => h.refId === 'mem-b1')) pass('post-erase: subject B intact (cross-subject safe)');
    else fail(`post-erase B lost vectors: ${JSON.stringify(postB)}`);
  } catch (e) {
    fail(`post-erase search failed: ${(e as Error).message}`);
  }

  // Idempotent re-erase A → deleted_count=0
  try {
    const again = await adapter.eraseSubjectMemoryVectors(ownerA);
    assertErasureReceiptShape(again);
    if (again.deleted_count !== 0) fail(`re-erase deleted_count expected 0, got ${again.deleted_count}`);
    else pass('re-erase subject A → deleted_count=0 (honest idempotent)');
    if (again.subject_id !== ownerA) fail('re-erase receipt must keep subject_id');
    else pass('re-erase receipt.subject_id preserved');
  } catch (e) {
    fail(`re-erase failed: ${(e as Error).message}`);
  }

  // Digest sanity: empty subject digest path — erase unknown subject
  try {
    const phantom = await adapter.eraseSubjectMemoryVectors(`nobody-${process.pid}`);
    if (phantom.deleted_count !== 0) fail(`phantom subject deleted_count expected 0, got ${phantom.deleted_count}`);
    else pass('phantom subject erase → deleted_count=0');
  } catch (e) {
    fail(`phantom erase failed: ${(e as Error).message}`);
  }

  // batchDigestForIds smoke (inventory honesty tool still exported)
  const d = batchDigestForIds(['b', 'a']);
  if (/^[a-f0-9]{64}$/.test(d) && d === batchDigestForIds(['a', 'b'])) {
    pass('batchDigestForIds stable sorted unique');
  } else fail('batchDigestForIds must be sorted-unique stable sha256');

  note('COVERED (this prove): subject-scoped Qdrant erase + countable receipt + recall=0 when EXIT=0');
  note('STILL-GAP G5: recall=0+receipt ≠ 0091 privacy_deletion_receipt / ledger; public DELETE still 503');
  note('releaseEvidence=false; Not HA; ≠ privacy covered; ≠ DELETE 200/202; ≠ cutover; 不切向量真相');
  finish();
}

main().catch((e) => {
  fail(`unhandled: ${(e as Error).message}`);
  finish();
});

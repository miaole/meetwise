/**
 * G5 P16 — P15 prototype receipt → 0091 ledger schema/mapping prove
 * (or fail-closed PREREQ list when product ledger not writable).
 *
 * HARD:
 *   - Schema/mapping + PREREQ honesty ONLY — does NOT write privacy_deletion_receipt
 *   - ≠ 0091 ledger aligned / ≠ G5 closed / ≠ privacy covered
 *   - Public DELETE still 503 — never invent 200/202
 *   - releaseEvidence=false · Not HA · ≠ cutover · 不切向量真相
 *   - ≠ P15 (subject erase / recall=0) — that remains g5-erasure:prove
 *
 * Harness: ai-docs/delivery/harness/qdrant-g5-ledger-map.md
 * Root: pnpm qdrant-store:g5-ledger-map:prove
 *
 * EXIT=0 → mapping + non-empty PREREQ list + G5≠0091 pins + DELETE 503 pins
 * EXIT=1 → honesty / assertion failure
 * (No Qdrant live PREREQ — this knife is schema/PREREQ static.)
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LEDGER_0091_RECEIPT_COLUMNS,
  LEDGER_WRITE_PREREQS,
  P15_PROTOTYPE_RECEIPT_FIELDS,
  RECEIPT_FIELD_MAP,
  assertQdrantLedgerNotWritable,
  deriveCandidateReceiptHash,
  mapPrototypeReceiptToward0091,
  summarizeReceiptFieldMap,
  type QdrantErasureReceipt,
} from '../src/index.ts';

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, '..');
const repoRoot = join(pkgRoot, '..', '..');
const scriptLabel = 'pnpm qdrant-store:g5-ledger-map:prove';

const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/qdrant-g5-ledger-map.md');
const g5HarnessPath = join(repoRoot, 'ai-docs/delivery/harness/qdrant-g5-erasure-ledger.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r5-retirement-sole-stack-status.md');
const mapSrcPath = join(pkgRoot, 'src/ledger-receipt-map.ts');
const erasureSrcPath = join(pkgRoot, 'src/erasure.ts');
const privacyServicePath = join(repoRoot, 'apps/api/src/modules/privacy/privacy.service.ts');
const migration0091 = join(repoRoot, 'packages/db/migrations/0091_privacy_authorization_issuer.sql');
const migration0125 = join(repoRoot, 'packages/db/migrations/0125_memory_vector_chunk_erasure.sql');
const contractsPath = join(repoRoot, 'packages/contracts/src/index.ts');
const rootPkgPath = join(repoRoot, 'package.json');
const retrievalPath = join(repoRoot, 'packages/db/src/retrieval-store.ts');

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

function finish() {
  for (const line of lines) console.log(line);
  console.log(`CMD=${scriptLabel} EXIT=${exitCode}`);
  process.exit(exitCode);
}

function main() {
  // --- harness / status honesty ---
  if (!existsSync(harnessPath)) {
    fail(`harness missing: ${harnessPath}`);
  } else {
    const h = readFileSync(harnessPath, 'utf8');
    if (/pnpm qdrant-store:g5-ledger-map:prove/.test(h)) pass('harness pins pnpm qdrant-store:g5-ledger-map:prove');
    else fail('harness must pin pnpm qdrant-store:g5-ledger-map:prove');
    if (/releaseEvidence\s*=\s*false/i.test(h)) pass('harness releaseEvidence=false');
    else fail('harness must pin releaseEvidence=false');
    if (/Not HA/i.test(h)) pass('harness Not HA');
    else fail('harness must pin Not HA');
    if (/P16/.test(h) && (/schema|mapping|map/i.test(h))) pass('harness cites P16 schema/mapping');
    else fail('harness must cite P16 schema/mapping');
    if (/P15/.test(h)) pass('harness cites P15 predecessor');
    else fail('harness must cite P15');
    if (/PREREQ/i.test(h) && (/not writable|不可写|fail-closed/i.test(h))) {
      pass('harness pins fail-closed PREREQ when ledger not writable');
    } else fail('harness must pin fail-closed PREREQ / ledger not writable');
    if (/≠\s*0091|仍 GAP.*G5|G5.*仍 GAP|仍 ≠.*0091/i.test(h)) {
      pass('harness pins G5 still GAP (≠ 0091)');
    } else fail('harness must pin G5 still GAP ≠ 0091');
    if (/503/.test(h) && (/DELETE/.test(h) || /公开/.test(h))) {
      pass('harness pins public DELETE still 503');
    } else fail('harness must pin public DELETE still 503');
    if (/mw-privacy-int/.test(h)) pass('harness requires mw-privacy-int review');
    else fail('harness must require mw-privacy-int');
    if (/mw-rag-route|mw-e2e-ha/.test(h)) pass('harness requires second-domain review');
    else fail('harness must require mw-rag-route or mw-e2e-ha');
    if (/privacy_deletion_receipt/.test(h)) pass('harness names privacy_deletion_receipt');
    else fail('harness must name privacy_deletion_receipt');
  }

  if (existsSync(g5HarnessPath)) {
    const g5 = readFileSync(g5HarnessPath, 'utf8');
    if (/P16|g5-ledger-map|ledger-map/.test(g5)) pass('P15 harness cross-links P16 / ledger-map');
    else fail('qdrant-g5-erasure-ledger.md must cross-link P16 / ledger-map');
  } else fail(`P15 harness missing: ${g5HarnessPath}`);

  if (!existsSync(statusPath)) {
    fail(`status missing: ${statusPath}`);
  } else {
    const st = readFileSync(statusPath, 'utf8');
    if (/P16/.test(st) && (/g5-ledger-map|schema\/mapping|ledger-map|PREREQ/.test(st))) {
      pass('status Proven-pins P16 ledger-map / PREREQ');
    } else fail('status must Proven-pin P16 g5-ledger-map');
    if (/P15/.test(st) && /g5-erasure:prove|eraseSubject|subject-scoped/.test(st)) {
      pass('status still Proven-pins P15');
    } else fail('status must keep P15 Proven pin');
    if (/G5/.test(st) && (/0091/.test(st) || /ledger/.test(st))) {
      pass('status cites G5 erasure ledger GAP');
    } else fail('status must cite G5 erasure ledger GAP');
    if (/P16/.test(st) && (/≠\s*\*?\*?G5|≠ G5|仍 GAP|仍开|未对齐/.test(st))) {
      pass('status pins P16 ≠ close G5');
    } else {
      // softer: G5 row still open with P16 mention
      if (/G5[\s\S]{0,400}P16|P16[\s\S]{0,200}G5/.test(st) && /仍|≠ 0091|未对齐/.test(st)) {
        pass('status ties P16 to open G5');
      } else fail('status must pin P16 does not close G5');
    }
    if (/releaseEvidence\s*=\s*false/i.test(st)) pass('status releaseEvidence=false');
    else fail('status must pin releaseEvidence=false');
  }

  // --- source pins ---
  if (!existsSync(mapSrcPath)) {
    fail(`ledger-receipt-map.ts missing: ${mapSrcPath}`);
  } else {
    const src = readFileSync(mapSrcPath, 'utf8');
    if (/assertQdrantLedgerNotWritable/.test(src)) pass('map exports assertQdrantLedgerNotWritable');
    else fail('map must export assertQdrantLedgerNotWritable');
    if (/mapPrototypeReceiptToward0091/.test(src)) pass('map exports mapPrototypeReceiptToward0091');
    else fail('map must export mapPrototypeReceiptToward0091');
    if (/LEDGER_WRITE_PREREQS/.test(src)) pass('map defines LEDGER_WRITE_PREREQS');
    else fail('map must define LEDGER_WRITE_PREREQS');
    if (/≠ 0091|0091/.test(src) && /NOT write|Does NOT write|not writable/i.test(src)) {
      pass('map documents ≠ 0091 / does not write');
    } else fail('map must document ≠ 0091 and no write');
    if (/503/.test(src)) pass('map mentions DELETE 503');
    else fail('map must mention 503');
    if (/writable:\s*true/.test(src)) fail('map must not claim writable:true');
    else pass('map does not claim writable:true');
  }

  if (existsSync(erasureSrcPath)) {
    const e = readFileSync(erasureSrcPath, 'utf8');
    if (/eraseSubjectPoints/.test(e) && /≠ 0091/.test(e)) pass('P15 erasure.ts still ≠ 0091 (not replaced by P16)');
    else fail('erasure.ts must remain P15 subject erase ≠ 0091');
  } else fail('erasure.ts missing');

  // 0091 schema present
  if (!existsSync(migration0091)) {
    fail(`0091 migration missing: ${migration0091}`);
  } else {
    const m = readFileSync(migration0091, 'utf8');
    if (/CREATE TABLE IF NOT EXISTS privacy_deletion_receipt/.test(m)) {
      pass('0091 defines privacy_deletion_receipt');
    } else fail('0091 must define privacy_deletion_receipt');
    for (const col of ['request_id', 'target_id', 'receipt_kind', 'receipt_hash', 'recorded_by']) {
      if (m.includes(col)) pass(`0091 receipt column ${col} present`);
      else fail(`0091 must include column ${col}`);
    }
    if (/privacy_record_deletion_receipt/.test(m)) pass('0091 has privacy_record_deletion_receipt');
    else fail('0091 must define privacy_record_deletion_receipt');
  }

  // 0125 sink CHECK — no qdrant
  if (!existsSync(migration0125)) {
    fail(`0125 migration missing: ${migration0125}`);
  } else {
    const m = readFileSync(migration0125, 'utf8');
    if (/memory_vector_chunk/.test(m)) pass('0125 registers memory_vector_chunk sink');
    else fail('0125 must register memory_vector_chunk');
    if (/\bqdrant\b/i.test(m) && /sink IN/i.test(m)) {
      // allow mention in comments? fail if sink value
      if (/'\s*qdrant/.test(m) || /qdrant_memory/.test(m)) {
        fail('0125 must NOT yet register qdrant as privacy_deletion_target.sink (PREREQ)');
      } else pass('0125 has no qdrant sink value (PREREQ intact)');
    } else pass('0125 has no qdrant sink (PREREQ intact)');
  }

  // contracts PrivacyDeletionReceipt
  if (existsSync(contractsPath)) {
    const c = readFileSync(contractsPath, 'utf8');
    if (/PrivacyDeletionReceipt\s*=\s*z\.object/.test(c)
      && /targetId/.test(c)
      && /receiptKind/.test(c)
      && /receiptHash/.test(c)) {
      pass('contracts PrivacyDeletionReceipt = {targetId,receiptKind,receiptHash}');
    } else fail('contracts must define PrivacyDeletionReceipt shape');
  } else fail('contracts index missing');

  // Product DELETE still 503
  if (!existsSync(privacyServicePath)) {
    fail(`privacy.service missing: ${privacyServicePath}`);
  } else {
    const ps = readFileSync(privacyServicePath, 'utf8');
    if (
      /eraseInterviewData/.test(ps)
      && /SERVICE_UNAVAILABLE|HttpStatus\.SERVICE_UNAVAILABLE/.test(ps)
      && /interview_erasure_authorization_not_available/.test(ps)
    ) {
      pass('privacy.service eraseInterviewData still 503 (≠ DELETE success)');
    } else {
      fail('privacy.service must keep eraseInterviewData 503');
    }
    if (
      /deleteResumeData/.test(ps)
      && /SERVICE_UNAVAILABLE|HttpStatus\.SERVICE_UNAVAILABLE/.test(ps)
      && /resume_erasure_migration_in_progress/.test(ps)
    ) {
      pass('privacy.service deleteResumeData still 503');
    } else {
      fail('privacy.service must keep deleteResumeData 503');
    }
  }

  // pgvector intact
  if (existsSync(retrievalPath)) {
    const t = readFileSync(retrievalPath, 'utf8');
    if (/export async function annSearch/.test(t)) pass('retrieval-store.ts annSearch intact');
    else fail('retrieval-store.ts must keep annSearch');
  } else fail(`retrieval-store missing: ${retrievalPath}`);

  // package wiring + NOT sole allowlist
  if (existsSync(rootPkgPath)) {
    const pkg = JSON.parse(readFileSync(rootPkgPath, 'utf8')) as { scripts?: Record<string, string> };
    if (pkg.scripts?.['qdrant-store:g5-ledger-map:prove']) pass('root package.json wires qdrant-store:g5-ledger-map:prove');
    else fail('root package.json must wire qdrant-store:g5-ledger-map:prove');
    if (pkg.scripts?.['qdrant-store:g5-erasure:prove']) pass('root still wires qdrant-store:g5-erasure:prove (P15)');
    else fail('root must keep qdrant-store:g5-erasure:prove');
    if (pkg.scripts?.['e2e-isolation:sole-g5-ledger-map:prove']) {
      fail('g5-ledger-map must NOT be on sole allowlist scripts');
    } else pass('g5-ledger-map NOT on sole allowlist (standalone)');
  } else fail('root package.json missing');

  // --- runtime mapping prove ---
  const summary = summarizeReceiptFieldMap();
  if (summary.total !== RECEIPT_FIELD_MAP.length) fail('summarizeReceiptFieldMap total mismatch');
  else pass(`field map entries=${summary.total} (mapped=${summary.mapped} partial=${summary.partial} unmapped=${summary.unmapped} blocked=${summary.blocked})`);
  if (summary.blocked < 1) fail('map must include blocked ledger FK fields');
  else pass(`map has blocked=${summary.blocked} (≥1)`);
  if (summary.partial < 1) fail('map must include partial receipt_hash mapping');
  else pass(`map has partial=${summary.partial} (≥1)`);

  // every 0091 column appears in map
  for (const col of LEDGER_0091_RECEIPT_COLUMNS) {
    if (RECEIPT_FIELD_MAP.some((e) => e.ledgerField === col)) pass(`map covers 0091 column ${col}`);
    else fail(`map missing 0091 column ${col}`);
  }

  // prototype fields listed
  for (const f of P15_PROTOTYPE_RECEIPT_FIELDS) {
    if (P15_PROTOTYPE_RECEIPT_FIELDS.includes(f)) { /* ok */ }
  }
  if (P15_PROTOTYPE_RECEIPT_FIELDS.length >= 4) pass(`P15 prototype fields pinned (${P15_PROTOTYPE_RECEIPT_FIELDS.length})`);
  else fail('P15 prototype field list too short');

  const readiness = assertQdrantLedgerNotWritable();
  if (readiness.writable !== false) fail('assertQdrantLedgerNotWritable must return writable:false');
  else pass('assertQdrantLedgerNotWritable → writable:false');
  if (readiness.alignedWith0091 !== false) fail('must pin alignedWith0091:false');
  else pass('alignedWith0091:false');
  if (readiness.publicDeleteOpen !== false) fail('must pin publicDeleteOpen:false');
  else pass('publicDeleteOpen:false');
  if (readiness.releaseEvidence !== false) fail('must pin releaseEvidence:false');
  else pass('readiness.releaseEvidence=false');
  if (!Array.isArray(readiness.prereqs) || readiness.prereqs.length === 0) {
    fail('PREREQ list must be non-empty (fail-closed)');
  } else {
    pass(`PREREQ list length=${readiness.prereqs.length} (fail-closed)`);
    for (const p of readiness.prereqs) {
      note(`PREREQ ${p.id}: ${p.detail}`);
    }
  }
  if (LEDGER_WRITE_PREREQS.some((p) => p.id === 'SINK_CHECK_NO_QDRANT')) pass('PREREQ includes SINK_CHECK_NO_QDRANT');
  else fail('PREREQ must include SINK_CHECK_NO_QDRANT');
  if (LEDGER_WRITE_PREREQS.some((p) => p.id === 'PUBLIC_DELETE_STILL_503')) pass('PREREQ includes PUBLIC_DELETE_STILL_503');
  else fail('PREREQ must include PUBLIC_DELETE_STILL_503');
  if (LEDGER_WRITE_PREREQS.some((p) => p.id === 'AUTHZ_ROOT_UNWIRED')) pass('PREREQ includes AUTHZ_ROOT_UNWIRED');
  else fail('PREREQ must include AUTHZ_ROOT_UNWIRED');

  const sample: QdrantErasureReceipt = {
    id: 'subject:user-demo',
    collection: 'meetwise_map_prove',
    deleted_count: 2,
    at: '2026-09-10T11:00:00.000Z',
    batch_digest: 'a'.repeat(64),
    subject_id: 'user-demo',
  };
  const mapped = mapPrototypeReceiptToward0091(sample);
  if (mapped.mapped !== true || mapped.writeBlocked !== true) {
    fail('mapPrototypeReceiptToward0091 must be mapped:true + writeBlocked:true');
  } else pass('mapPrototype → mapped:true writeBlocked:true');
  if (mapped.claims.isPrivacyDeletionReceipt !== false) fail('must claim isPrivacyDeletionReceipt:false');
  else pass('claims.isPrivacyDeletionReceipt=false');
  if (mapped.claims.is0091LedgerAligned !== false) fail('must claim is0091LedgerAligned:false');
  else pass('claims.is0091LedgerAligned=false');
  if (mapped.claims.publicDeleteStatus !== 503) fail('must claim publicDeleteStatus:503');
  else pass('claims.publicDeleteStatus=503');
  if (mapped.claims.releaseEvidence !== false) fail('must claim releaseEvidence:false');
  else pass('claims.releaseEvidence=false');
  if (!/^[a-f0-9]{64}$/.test(mapped.candidateReceiptHash)) {
    fail('candidateReceiptHash must be sha256 hex');
  } else {
    const again = deriveCandidateReceiptHash(sample);
    if (again !== mapped.candidateReceiptHash) fail('candidateReceiptHash unstable');
    else pass(`candidateReceiptHash=${mapped.candidateReceiptHash.slice(0, 12)}… (stable partial map)`);
  }
  if (!mapped.missingLedgerFields.includes('request_id') || !mapped.missingLedgerFields.includes('target_id')) {
    fail('missingLedgerFields must include request_id + target_id');
  } else pass('missingLedgerFields includes request_id + target_id');
  // never invent ledger FKs on the result object
  const asRec = mapped as unknown as Record<string, unknown>;
  if ('request_id' in asRec || 'target_id' in asRec || 'receipt_kind' in asRec) {
    fail('map result must NOT invent request_id/target_id/receipt_kind properties');
  } else pass('map result does not invent request_id/target_id/receipt_kind');

  note('COVERED (this prove): P15→0091 receipt schema/mapping table + fail-closed PREREQ list (ledger not writable)');
  note('STILL-GAP G5: mapping ≠ 0091 privacy_deletion_receipt write; public DELETE still 503; ≠ authz/sink/worker');
  note('releaseEvidence=false; Not HA; ≠ privacy covered; ≠ DELETE 200/202; ≠ cutover; P16 ≠ close G5');
  note('Ready for mw-privacy-int + mw-rag-route (or mw-e2e-ha) — do not self-approve ledger alignment');
  finish();
}

try {
  main();
} catch (e) {
  fail(`unhandled: ${(e as Error).message}`);
  finish();
}

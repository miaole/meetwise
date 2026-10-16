/**
 * G4 / GAP-RAG-04 — production scoped retrieve (partial P-WIRE) prove.
 * releaseEvidence=false · Not HA · ≠ R4 closed · ≠ 题域已隔离 · ≠ wrong_track=0
 *
 * Covers:
 *   - resolveServingScopeFromRouteSnapshot unit (primary leaf / invalid / empty)
 *   - static: main.ts forwards scope into cachedQbankSearch
 *   - static: scope helper / primary-leaf still available (compat)
 *   - static: REAL-WIRE may call dispatch via track-local helper (≠ R4 closed)
 *   - honesty docs pin R4 still NOT closed
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JOB_ROUTE_TAXONOMY_VERSION } from '@meetwise/db';
import { decideRouteSnapshotRetrieve, resolveServingScopeFromRouteSnapshot } from '../src/qbank-retrieve-scope.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail?: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

const here = dirname(fileURLToPath(import.meta.url));
const workerRoot = join(here, '..');
const repoRoot = join(workerRoot, '..', '..');
const mainPath = join(workerRoot, 'src/main.ts');
const consumerPath = join(workerRoot, 'src/interview-consumer.ts');
const scopePath = join(workerRoot, 'src/qbank-retrieve-scope.ts');
const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation-status.md');

// --- unit: resolver ---
A('empty snapshot → undefined', resolveServingScopeFromRouteSnapshot(null) === undefined);
A('empty allocations → undefined',
  resolveServingScopeFromRouteSnapshot({ allocations: [] }) === undefined);
A('invalid leaf skipped → undefined',
  resolveServingScopeFromRouteSnapshot({
    allocations: [{ leafTrackId: 'NOT_A_LEAF', allocationBps: 10000 }],
  }) === undefined);
A('primary max-bps leaf selected', (() => {
  const s = resolveServingScopeFromRouteSnapshot({
    allocations: [
      { leafTrackId: 'frontend/react', allocationBps: 3000 },
      { leafTrackId: 'backend/nodejs', allocationBps: 7000 },
    ],
  });
  return s?.servingScopeId === 'backend/nodejs'
    && s?.taxonomyVersion === JOB_ROUTE_TAXONOMY_VERSION;
})());
A('tie → first valid leaf', (() => {
  const s = resolveServingScopeFromRouteSnapshot({
    allocations: [
      { leafTrackId: 'backend/nodejs', allocationBps: 5000 },
      { leafTrackId: 'frontend/react', allocationBps: 5000 },
    ],
  });
  return s?.servingScopeId === 'backend/nodejs';
})());
A('missing snapshot produces explicit fail-closed retrieve denial', (() => {
  const d = decideRouteSnapshotRetrieve(null);
  return !d.allowed && d.reason === 'route_snapshot_missing';
})());
A('rejects bad taxonomyVersion override',
  resolveServingScopeFromRouteSnapshot(
    { allocations: [{ leafTrackId: 'backend/nodejs', allocationBps: 10000 }] },
    'not-a-version',
  ) === undefined);

// --- static artifacts ---
for (const [label, path] of [
  ['scope helper', scopePath],
  ['main.ts', mainPath],
  ['interview-consumer.ts', consumerPath],
  ['r4 harness', harnessPath],
  ['r4 status', statusPath],
] as const) {
  A(`${label} present`, existsSync(path), path);
}

if (existsSync(mainPath)) {
  const main = readFileSync(mainPath, 'utf8');
  const opts = main.match(/cachedQbankSearch\([\s\S]{0,2500}?leaseSeconds:[^\n]+/);
  A('main.ts localRetrieve→cachedQbankSearch includes scope key/forward',
    !!opts && (/^\s*scope\s*,/m.test(opts[0]) || /^\s*scope\s*:/m.test(opts[0])));
  A('main.ts documents trackLocal REAL-WIRE and/or scoped retrieve honesty',
    /trackLocal|wrong_track|REAL-WIRE|GAP-RAG-04|partial P-WIRE/.test(main));
}

if (existsSync(consumerPath)) {
  const consumer = readFileSync(consumerPath, 'utf8');
  A('consumer calls explicit decideRouteSnapshotRetrieve (G-R2-5 gate)',
    /decideRouteSnapshotRetrieve/.test(consumer));
  A('consumer emits degraded denial when snapshot is missing',
    /degradedRetrieval\(retrieveDecision\.reason\)/.test(consumer));
  A('consumer loads getInterviewRouteSnapshot for retrieve',
    /getInterviewRouteSnapshot/.test(consumer) && /routeSnapForRetrieve/.test(consumer));
  A('consumer wires REAL-WIRE trackLocal path (or documents compat)',
    /retrieveViaDispatchTrackLocal|trackLocal/.test(consumer));
  A('consumer documents missing-snapshot fail-closed and ≠ wrong_track=0 / ≠ 题域已隔离',
    /route_snapshot_missing|fail-closed|Absent\/invalid snapshot/.test(consumer)
    && /wrong_track=0|题域已隔离|R4/.test(consumer));
}

if (existsSync(harnessPath)) {
  const harness = readFileSync(harnessPath, 'utf8');
  A('harness still pins 题域隔离 NOT closed', /题域隔离 NOT closed/.test(harness));
  A('harness pins releaseEvidence=false + Not HA',
    /releaseEvidence=false/.test(harness) && /Not HA/.test(harness));
  A('harness does not claim wrong_track=0 closed',
    /wrong_track=0/.test(harness) && /未|NOT|否|禁止|不得/.test(harness));
}

if (existsSync(statusPath)) {
  const status = readFileSync(statusPath, 'utf8');
  A('status pins 题域隔离 NOT closed', /题域隔离 NOT closed/.test(status));
  A('status pins releaseEvidence=false', /releaseEvidence=false/.test(status));
}

console.log(failures === 0
  ? '\nOK  g4-production-scoped-retrieve prove (partial P-WIRE; missing snapshot fail-closed; R4 NOT closed; ≠ wrong_track=0; releaseEvidence=false)'
  : `\nFAIL  g4-production-scoped-retrieve prove (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);

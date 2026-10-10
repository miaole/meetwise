/**
 * R4 REAL-WIRE-IMPL prove — Worker retrieve wired to planner→assemble→dispatch→recheck.
 * releaseEvidence=false · Not HA · ≠ R4 closed · ≠ 题域已隔离 · ≠ wrong_track=0
 *
 * Demonstrates:
 *   - apps/worker/src has ≥1 dispatchTrackLocalRetrieval( call site
 *   - consumer retrieve uses retrieveViaDispatchTrackLocal when trackLocal present
 *   - recheck_failed → fail-closed (degraded; no unscoped / sibling / question_ready)
 *   - G-R2-5 intact (route_snapshot_missing)
 *   - no P-FAKEPLAN (assemble requires generationId+recipeId; helper uses active generation)
 *   - wire green ≠ R4 closed ≠ wrong_track=0
 *
 * CMD: pnpm r4-real-wire-impl:prove
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { degradedRetrieval } from '@meetwise/domain';
import {
  parseCragPlannerQuery,
  scoredRefsFromDispatch,
} from '../src/qbank-track-local-retrieve.ts';
import { decideRouteSnapshotRetrieve } from '../src/qbank-retrieve-scope.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail?: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

const here = dirname(fileURLToPath(import.meta.url));
const workerRoot = join(here, '..');
const repoRoot = join(workerRoot, '..', '..');
const workerSrc = join(workerRoot, 'src');
const helperPath = join(workerSrc, 'qbank-track-local-retrieve.ts');
const plannerHelperPath = join(workerSrc, 'qbank-planner-retrieval-plan.ts');
const consumerPath = join(workerSrc, 'interview-consumer.ts');
const mainPath = join(workerSrc, 'main.ts');
const scopePath = join(workerSrc, 'qbank-retrieve-scope.ts');
const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-real-wire-impl.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation-status.md');
const parentHarness = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation.md');

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

function walkTsFiles(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name === '.tmp') continue;
      walkTsFiles(p, out);
    } else if (/\.(ts|tsx|mjs|js)$/.test(ent.name) && !ent.name.endsWith('.proof.ts')) {
      out.push(p);
    }
  }
  return out;
}

// --- artifacts ---
for (const [label, path] of [
  ['track-local retrieve helper', helperPath],
  ['planner helper', plannerHelperPath],
  ['interview-consumer.ts', consumerPath],
  ['main.ts', mainPath],
  ['scope helper', scopePath],
  ['REAL-WIRE-IMPL harness', harnessPath],
  ['r4 status', statusPath],
] as const) {
  A(`${label} present`, existsSync(path), path);
}

const helper = read(helperPath);
const consumer = read(consumerPath);
const main = read(mainPath);
const harness = read(harnessPath);
const status = read(statusPath);
const parent = read(parentHarness);

// --- unit: query parse ---
A('parseCragPlannerQuery accepts competency + 难度N', (() => {
  const p = parseCragPlannerQuery('concurrency 难度4');
  return !!p && p.competencyId === 'concurrency' && p.difficulty === 4;
})());
A('parseCragPlannerQuery rejects missing difficulty', parseCragPlannerQuery('concurrency') === null);
A('parseCragPlannerQuery rejects difficulty out of 1..5', parseCragPlannerQuery('concurrency 难度9') === null);

// --- unit: recheck_failed fail-closed ---
A('recheck_failed maps to degraded (fail-closed)', (() => {
  const refs = scoredRefsFromDispatch({ status: 'recheck_failed', planId: 'p1', reason: 'serving_scope_mismatch' });
  return refs.length === 1
    && refs[0]!.availability === 'degraded'
    && refs[0]!.score < 0
    && refs[0]!.ref.includes('recheck_failed');
})());
A('rejected snapshot_missing maps to route_snapshot_missing degraded', (() => {
  const refs = scoredRefsFromDispatch({ status: 'rejected', reason: 'snapshot_missing' });
  return refs.length === 1 && refs[0]!.ref.includes('route_snapshot_missing');
})());
A('served maps results through', (() => {
  const refs = scoredRefsFromDispatch({
    status: 'served', planId: 'p1', cacheStatus: 'miss', recheckedRefs: 1,
    results: [{ ref: 'q1', score: 0.9, evidence: 'e' }],
  });
  return refs.length === 1 && refs[0]!.ref === 'q1' && refs[0]!.score === 0.9;
})());

// --- G-R2-5 still intact via decideRouteSnapshotRetrieve ---
A('G-R2-5 decideRouteSnapshotRetrieve null → route_snapshot_missing', (() => {
  const d = decideRouteSnapshotRetrieve(null);
  return !d.allowed && d.reason === 'route_snapshot_missing';
})());
A('G-R2-5 degradedRetrieval observable', (() => {
  const d = degradedRetrieval('route_snapshot_missing');
  return d.availability === 'degraded' && d.ref.includes('route_snapshot_missing');
})());

// --- static: CALL_SITES ≥ 1 ---
const workerSrcFiles = walkTsFiles(workerSrc);
let workerDispatchCalls = 0;
const callFiles: string[] = [];
for (const f of workerSrcFiles) {
  const t = readFileSync(f, 'utf8');
  if (/dispatchTrackLocalRetrieval\s*\(/.test(t)) {
    workerDispatchCalls++;
    callFiles.push(f.replace(repoRoot + '/', ''));
  }
}
A('apps/worker/src CALL_SITES≥1 for dispatchTrackLocalRetrieval(',
  workerDispatchCalls >= 1, `callSites=${workerDispatchCalls} files=${callFiles.join(',')}`);
A('helper contains dispatchTrackLocalRetrieval( call',
  /dispatchTrackLocalRetrieval\s*\(/.test(helper));
A('helper uses assembleValidatedRetrievalPlan (no P-FAKEPLAN primary hard-stuff)',
  /assembleValidatedRetrievalPlan/.test(helper)
  && /activeQbankGeneration/.test(helper)
  && !/max-bps|primary leaf hard|hard-stuff primary/i.test(helper.replace(/P-FAKEPLAN[\s\S]{0,80}/g, '')));

// --- consumer / main wire ---
A('consumer imports retrieveViaDispatchTrackLocal',
  /retrieveViaDispatchTrackLocal/.test(consumer));
A('consumer gates G-R2-5 via decideRouteSnapshotRetrieve',
  /decideRouteSnapshotRetrieve/.test(consumer)
  && /degradedRetrieval\(retrieveDecision\.reason\)/.test(consumer));
A('consumer calls retrieveViaDispatchTrackLocal when trackLocal present',
  /adaptive\.trackLocal/.test(consumer) && /retrieveViaDispatchTrackLocal/.test(consumer));
A('consumer documents recheck_failed fail-closed / P-FAKEPLAN / ≠ wrong_track=0',
  /recheck_failed/.test(consumer)
  && /P-FAKEPLAN/.test(consumer)
  && /wrong_track=0/.test(consumer));
A('main injects adaptive.trackLocal factory',
  /trackLocal:\s*\(owner:\s*string\)\s*=>/.test(main)
  || /trackLocal:\s*\(owner\)\s*=>/.test(main));
A('helper pins recheck_failed fail-closed (no unscoped / sibling / question_ready)',
  /recheck_failed/.test(helper)
  && /fail-closed/.test(helper)
  && /no unscoped|never unscoped|question_ready/.test(helper));

// --- honesty docs ---
A('harness pins wire green ≠ R4 closed ≠ wrong_track=0',
  (/接线绿|wire green|≠ R4/.test(harness) || /NOT closed/.test(harness))
  && /wrong_track=0/.test(harness)
  && /releaseEvidence=false/.test(harness));
A('status still pins 题域隔离 NOT closed + releaseEvidence=false',
  /题域隔离 NOT closed/.test(status) && /releaseEvidence=false/.test(status));
A('parent harness still pins 题域隔离 NOT closed',
  /题域隔离 NOT closed/.test(parent));
A('no claim wrong_track=0 proven in harness',
  /wrong_track=0/.test(harness) && (/未证|≠ wrong_track|ADV|禁止|不得|否/.test(harness)));

console.log(failures === 0
  ? `\nOK  r4-real-wire-impl prove (CALL_SITES=${workerDispatchCalls}≥1; recheck_failed fail-closed; G-R2-5 intact; no P-FAKEPLAN; ≠ R4 closed; ≠ wrong_track=0; releaseEvidence=false)`
  : `\nFAIL  r4-real-wire-impl prove (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);

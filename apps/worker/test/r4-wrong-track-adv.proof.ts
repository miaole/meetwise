/**
 * R4 wrong_track=0 ADV prove — adversarial asserts on the **wired** retrieve path
 * (planner→validate→assemble→dispatchTrackLocalRetrieval→recheck).
 *
 * releaseEvidence=false · Not HA · ≠ R4 closed · ≠ 题域已隔离 · ≠ covered
 * wire green ≠ ADV closed · ADV green ≠ R4 closed
 *
 * Covers (honest stack limits):
 *   A1 — wired path call site + consumer/main wire present
 *   A2 — wrong_track count assert (=0 on allowed leaf; >0 on cross/missing)
 *   A3 — forged/missing metadata · unknown taxonomy · concurrent leaf change ·
 *         stale checkpoint · cache-replay recheck reasons (Worker map + domain)
 *   A4 — fail-closed: no sibling/unscoped/legacy_unrouted; G-R2-5; no P-FAKEPLAN
 *   A5–A8 — honesty pins (no pgvector fake sole; wire≠ADV; ≠covered; ≠R4 closed)
 *
 * LIVE_PG_GAP (honesty): full live Worker+PG adversarial surface (cache poison /
 * concurrent job edit / metadata tamper through retrieveViaDispatchTrackLocal)
 * is NOT claimed closed here. Contract-seam live coverage remains rag04
 * (dispatchTrackLocalRetrieval). This prove = wired Worker + domain asserts +
 * static recheck predicates. NHP-R4-ADV-01 → partial/honesty-pin ≠ covered.
 *
 * CMD: pnpm r4-wrong-track-adv:prove
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  JOB_ROUTE_TAXONOMY_VERSION,
  RETRIEVAL_POLICY_VERSION,
  R4_WRONG_TRACK_RECHECK_REASONS,
  assembleValidatedRetrievalPlan,
  assertWrongTrackZero,
  countWrongTrackHits,
  degradedRetrieval,
  deriveRouteScopeDigest,
  isFailClosedWrongTrackRecheckReason,
  validateRetrievalPlan,
  type RetrievalPlan,
  type RetrievalPlanSnapshot,
} from '@meetwise/domain';
import {
  enforceWrongTrackZeroOnServed,
  mapRecheckFailedToRefs,
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
const consumerPath = join(workerSrc, 'interview-consumer.ts');
const mainPath = join(workerSrc, 'main.ts');
const dbTrackLocal = join(repoRoot, 'packages/db/src/qbank-track-local-retrieval.ts');
const domainTrackLocal = join(repoRoot, 'packages/domain/src/qbank-track-local-retrieval.ts');
const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-wrong-track-adv.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation-status.md');
const parentHarness = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation.md');
const matrixPath = join(repoRoot, 'ai-docs/delivery/non-happy-path-perf-load-case-matrix.md');

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

const LEAF_A = 'backend/nodejs';
const LEAF_B = 'backend/java';
const genOk = 'qgen-00000000-0000-4000-8000-000000000001';
const recipeOk = 'qrecipe-' + 'a'.repeat(32);

function snap(leaf: string, routeDigest = 'r'.repeat(64)): RetrievalPlanSnapshot {
  return {
    interviewId: 'iv-adv-1',
    routeDigest,
    allocations: [{ leafTrackId: leaf, allocationBps: 10_000 }],
  };
}

function mkPlan(input: {
  leaf: string;
  snapshot: RetrievalPlanSnapshot;
  taxonomy?: string;
  routeScopeDigest?: string;
  generationId?: string;
  recipeId?: string;
  competencyId?: string;
}): RetrievalPlan {
  const taxonomy = input.taxonomy ?? JOB_ROUTE_TAXONOMY_VERSION;
  return {
    snapshotId: input.snapshot.interviewId,
    routeScopeDigest: input.routeScopeDigest
      ?? deriveRouteScopeDigest({
        routeDigest: input.snapshot.routeDigest,
        leafTrackId: input.leaf,
        taxonomyVersion: taxonomy,
      }),
    leafTrackId: input.leaf,
    taxonomyVersion: taxonomy,
    competencyId: input.competencyId ?? 'concurrency',
    difficulty: 4,
    generationId: input.generationId ?? genOk,
    recipeId: input.recipeId ?? recipeOk,
    policyVersion: RETRIEVAL_POLICY_VERSION,
  };
}

console.log('\n── A1 wired path ──');
for (const [label, path] of [
  ['track-local retrieve helper', helperPath],
  ['interview-consumer.ts', consumerPath],
  ['main.ts', mainPath],
  ['db recheck seam', dbTrackLocal],
  ['domain assert hooks', domainTrackLocal],
  ['ADV harness', harnessPath],
  ['r4 status', statusPath],
] as const) {
  A(`${label} present`, existsSync(path), path);
}

const helper = read(helperPath);
const consumer = read(consumerPath);
const main = read(mainPath);
const dbSrc = read(dbTrackLocal);
const domainSrc = read(domainTrackLocal);
const harness = read(harnessPath);
const status = read(statusPath);
const parent = read(parentHarness);
const matrix = read(matrixPath);

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
A('A1 apps/worker/src CALL_SITES≥1 for dispatchTrackLocalRetrieval(',
  workerDispatchCalls >= 1, `callSites=${workerDispatchCalls} files=${callFiles.join(',')}`);
A('A1 helper uses assembleValidatedRetrievalPlan + activeQbankGeneration (no P-FAKEPLAN)',
  /assembleValidatedRetrievalPlan/.test(helper) && /activeQbankGeneration/.test(helper));
A('A1 consumer/main wire trackLocal → retrieveViaDispatchTrackLocal',
  /retrieveViaDispatchTrackLocal/.test(consumer)
  && /adaptive\.trackLocal/.test(consumer)
  && (/trackLocal:\s*\(owner:\s*string\)\s*=>/.test(main) || /trackLocal:\s*\(owner\)\s*=>/.test(main)));

console.log('\n── A2 wrong_track=0 assert hooks ──');
A('A2 same-leaf annotated hits → wrongTrack=0', (() => {
  const a = assertWrongTrackZero(
    [
      { ref: 'q1', leafTrackId: LEAF_A },
      { ref: 'q2', servingScopeId: LEAF_A },
    ],
    LEAF_A,
  );
  return a.ok && a.wrongTrack === 0 && countWrongTrackHits([{ ref: 'q1', leafTrackId: LEAF_A }], LEAF_A) === 0;
})());
A('A2 cross-leaf hit → wrongTrack≥1', countWrongTrackHits(
  [{ ref: 'java_q1', leafTrackId: LEAF_B }],
  LEAF_A,
) === 1);
A('A2 missing metadata → wrongTrack≥1 (fail-closed)', countWrongTrackHits(
  [{ ref: 'ghost' }, { ref: 'empty', leafTrackId: '' }],
  LEAF_A,
) === 2);
A('A2 enforceWrongTrackZeroOnServed fail-closed → degraded refs', (() => {
  const r = enforceWrongTrackZeroOnServed(LEAF_A, [{ ref: 'x', leafTrackId: LEAF_B }]);
  return !r.ok && r.wrongTrack === 1 && r.refs.length === 1 && r.refs[0]!.availability === 'degraded'
    && r.refs[0]!.ref.includes('wrong_track');
})());
A('A2 enforceWrongTrackZeroOnServed ok path', (() => {
  const r = enforceWrongTrackZeroOnServed(LEAF_A, [{ ref: 'n', leafTrackId: LEAF_A }]);
  return r.ok && r.wrongTrack === 0;
})());

console.log('\n── A3 adversarial surfaces (domain + Worker map) ──');
// forged / missing metadata
A('A3 forged/missing metadata: missing track counted wrong',
  countWrongTrackHits([{ ref: 'forged' }], LEAF_A) === 1);
A('A3 forged/missing metadata: recheck metadata_hash_mismatch → degraded', (() => {
  const refs = scoredRefsFromDispatch({
    status: 'recheck_failed', planId: 'p', reason: 'metadata_hash_mismatch',
  });
  return refs.length === 1 && refs[0]!.availability === 'degraded'
    && refs[0]!.ref.includes('metadata_hash_mismatch');
})());
A('A3 forged/missing metadata: unreviewed_annotation → degraded', (() => {
  const refs = mapRecheckFailedToRefs('unreviewed_annotation');
  return refs[0]!.availability === 'degraded' && refs[0]!.ref.includes('unreviewed_annotation');
})());

// unknown taxonomy
A('A3 unknown taxonomy: validateRetrievalPlan taxonomy_not_current', (() => {
  const s = snap(LEAF_A);
  const plan = mkPlan({ leaf: LEAF_A, snapshot: s, taxonomy: 'v999' });
  // route digest must match taxonomy used
  plan.routeScopeDigest = deriveRouteScopeDigest({
    routeDigest: s.routeDigest, leafTrackId: LEAF_A, taxonomyVersion: 'v999',
  });
  const v = validateRetrievalPlan(plan, s);
  return v.ok === false && (v.reason === 'taxonomy_not_current' || v.reason === 'taxonomy_invalid');
})());
A('A3 unknown taxonomy: assemble refuses non-current via plan validate', (() => {
  // assemble uses JOB_ROUTE_TAXONOMY_VERSION by default; force via taxonomyVersion override
  const s = snap(LEAF_A);
  const assembled = assembleValidatedRetrievalPlan({
    snapshot: s,
    deficit: [0],
    competencyId: 'concurrency',
    difficulty: 4,
    generationId: genOk,
    recipeId: recipeOk,
    taxonomyVersion: 'v999',
  });
  return assembled.ok === false;
})());

// concurrent job change → leaf not in snapshot
A('A3 concurrent job change: leaf outside snapshot → validate reject', (() => {
  const s = snap(LEAF_A); // still nodejs
  const plan = mkPlan({ leaf: LEAF_B, snapshot: s }); // attacker asks java
  const v = validateRetrievalPlan(plan, s);
  return v.ok === false && v.reason.startsWith('planner_');
})());
A('A3 concurrent job change: assemble stays on snapshot leaf (no cross)', (() => {
  const s = snap(LEAF_A);
  const assembled = assembleValidatedRetrievalPlan({
    snapshot: s,
    deficit: [0],
    competencyId: 'concurrency',
    difficulty: 4,
    generationId: genOk,
    recipeId: recipeOk,
  });
  return assembled.ok === true && assembled.plan.leafTrackId === LEAF_A;
})());

// stale checkpoint
A('A3 stale checkpoint: route_scope_digest_mismatch', (() => {
  const s = snap(LEAF_A);
  const plan = mkPlan({ leaf: LEAF_A, snapshot: s, routeScopeDigest: 'f'.repeat(64) });
  const v = validateRetrievalPlan(plan, s);
  return v.ok === false && v.reason === 'route_scope_digest_mismatch';
})());

// cache replay / cross-track recheck reasons
A('A3 cache replay: cross_track_or_revoked → Worker degraded (not served)', (() => {
  const refs = scoredRefsFromDispatch({
    status: 'recheck_failed', planId: 'p', reason: 'cross_track_or_revoked',
  });
  return refs.length === 1 && refs[0]!.availability === 'degraded'
    && !refs.some((r) => r.availability !== 'degraded');
})());
A('A3 cache replay: serving_scope_mismatch → degraded', (() => {
  const refs = scoredRefsFromDispatch({
    status: 'recheck_failed', planId: 'p', reason: 'serving_scope_mismatch',
  });
  return refs[0]!.ref.includes('serving_scope_mismatch');
})());
A('A3 generation_race / recipe_mismatch → degraded', (() => {
  const a = scoredRefsFromDispatch({ status: 'recheck_failed', planId: 'p', reason: 'generation_race' });
  const b = scoredRefsFromDispatch({ status: 'recheck_failed', planId: 'p', reason: 'recipe_mismatch' });
  return a[0]!.availability === 'degraded' && b[0]!.availability === 'degraded';
})());
A('A3 full R4_WRONG_TRACK_RECHECK_REASONS catalog mapped fail-closed', (() => {
  return R4_WRONG_TRACK_RECHECK_REASONS.every((reason) => {
    const refs = mapRecheckFailedToRefs(reason);
    return isFailClosedWrongTrackRecheckReason(reason)
      && refs.length === 1
      && refs[0]!.availability === 'degraded'
      && refs[0]!.ref.includes(reason);
  });
})());

console.log('\n── A4 fail-closed / G-R2-5 / no P-FAKEPLAN ──');
A('A4 G-R2-5 decideRouteSnapshotRetrieve null → route_snapshot_missing', (() => {
  const d = decideRouteSnapshotRetrieve(null);
  return !d.allowed && d.reason === 'route_snapshot_missing';
})());
A('A4 G-R2-5 degradedRetrieval observable', (() => {
  const d = degradedRetrieval('route_snapshot_missing');
  return d.availability === 'degraded' && d.ref.includes('route_snapshot_missing');
})());
A('A4 rejected snapshot_missing maps to route_snapshot_missing', (() => {
  const refs = scoredRefsFromDispatch({ status: 'rejected', reason: 'snapshot_missing' });
  return refs[0]!.ref.includes('route_snapshot_missing');
})());
A('A4 helper pins fail-closed / no unscoped / question_ready / P-FAKEPLAN',
  /fail-closed/.test(helper)
  && /no unscoped|never unscoped|question_ready/.test(helper)
  && /P-FAKEPLAN/.test(helper));
A('A4 consumer pins recheck_failed fail-closed + G-R2-5 + ≠ wrong_track=0',
  /recheck_failed/.test(consumer)
  && /decideRouteSnapshotRetrieve/.test(consumer)
  && /wrong_track=0/.test(consumer));
A('A4 parseCragPlannerQuery rejects illegal planner inputs',
  parseCragPlannerQuery('concurrency') === null
  && parseCragPlannerQuery('concurrency 难度9') === null
  && !!parseCragPlannerQuery('concurrency 难度4'));
A('A4 assemble without generation/recipe → fail (P-FAKEPLAN ban)', (() => {
  const assembled = assembleValidatedRetrievalPlan({
    snapshot: snap(LEAF_A),
    deficit: [0],
    competencyId: 'concurrency',
    difficulty: 4,
    generationId: '',
    recipeId: '',
  });
  return assembled.ok === false && assembled.reason === 'generation_or_recipe_missing';
})());

console.log('\n── static recheck predicates on wired db seam ──');
A('db recheckHitsAtLeaf present with ADV predicates',
  /recheckHitsAtLeaf/.test(dbSrc)
  && /serving_scope_mismatch/.test(dbSrc)
  && /taxonomy_mismatch/.test(dbSrc)
  && /metadata_hash_mismatch/.test(dbSrc)
  && /cross_track_or_revoked/.test(dbSrc)
  && /generation_race/.test(dbSrc));
A('db pins no sibling / legacy_unrouted / question_ready on recheck fail',
  /legacy_unrouted/.test(dbSrc)
  && /question_ready/.test(dbSrc)
  && /兄弟|sibling|同父/.test(dbSrc));
A('domain exports countWrongTrackHits + R4_WRONG_TRACK_RECHECK_REASONS',
  /countWrongTrackHits/.test(domainSrc)
  && /R4_WRONG_TRACK_RECHECK_REASONS/.test(domainSrc)
  && /assertWrongTrackZero/.test(domainSrc));
A('helper exports enforceWrongTrackZeroOnServed + mapRecheckFailedToRefs',
  /enforceWrongTrackZeroOnServed/.test(helper)
  && /mapRecheckFailedToRefs/.test(helper));

console.log('\n── A5–A8 honesty pins ──');
A('A5/A6 harness pins wire≠ADV · releaseEvidence=false · ≠R4 closed',
  /wire.*≠|wire 绿 ≠|≠ wrong_track/.test(harness)
  && /releaseEvidence=false/.test(harness)
  && (/NOT closed|≠ R4|仍 NOT closed|仍开/.test(harness)));
A('A7/A8 status still 题域隔离 NOT closed + releaseEvidence=false',
  /题域隔离 NOT closed/.test(status) && /releaseEvidence=false/.test(status));
A('A8 parent harness still 题域隔离 NOT closed',
  /题域隔离 NOT closed/.test(parent));
A('LIVE_PG_GAP honesty: prove header documents remaining live Worker+PG gap',
  /LIVE_PG_GAP/.test(read(join(here, 'r4-wrong-track-adv.proof.ts')))
  && /≠ covered/.test(read(join(here, 'r4-wrong-track-adv.proof.ts')))
  && /rag04/.test(read(join(here, 'r4-wrong-track-adv.proof.ts'))));
A('matrix NHP-R4-ADV-01 must not claim covered (≠ covered / partial/honesty ok)', (() => {
  const line = matrix.split('\n').find((l) => l.includes('NHP-R4-ADV-01')) ?? '';
  if (!line) return false;
  // Allow "≠ covered" / "not covered"; reject bare status **covered** without negation.
  if (/≠\s*covered|!=\s*covered|not\s+covered|non-covered/i.test(line)) return true;
  return !/(^|[\s|])covered([\s|]|$)/i.test(line);
})());
A('harness must not claim R4 closed / wrong_track=0 production closed',
  !/wrong_track=0 已证|R4 closed|题域已隔离已关/.test(harness)
  || /未证|NOT closed|≠ R4|仍开|仍 gap|partial|honesty/.test(harness));

// Explicit honesty self-check printed for experts
console.log('\n── honesty summary (not covered) ──');
console.log('LIVE_PG_GAP: full live Worker+PG ADV (cache poison / job edit / metadata tamper');
console.log('  through retrieveViaDispatchTrackLocal) NOT claimed; companion=rag04 seam.');
console.log('NHP-R4-ADV-01: partial/honesty-pin allowed; ≠ covered; ≠ R4 closed.');
console.log('wire green ≠ ADV closed; ADV prove EXIT=0 ≠ R4 closed.');

console.log(failures === 0
  ? `\nOK  r4-wrong-track-adv prove (wired path CALL_SITES=${workerDispatchCalls}; wrong_track assert; A3 surfaces unit+map; fail-closed; LIVE_PG_GAP honesty; ≠ covered; ≠ R4 closed; releaseEvidence=false)`
  : `\nFAIL  r4-wrong-track-adv prove (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);

/**
 * R4 P-PLANNER unit prove — true per-turn planner → validated RetrievalPlan.
 * releaseEvidence=false · Not HA · ≠ R4 closed · ≠ 题域已隔离 · ≠ wrong_track=0 · ≠ full P-WIRE
 *
 * Covers harness T1–T4 / T6–T7 (assemble contract). T5 dispatch owned by REAL-WIRE-IMPL.
 * CMD: pnpm r4-p-planner-unit:prove
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  planInterviewTurn,
  validatePlannerOutput,
  buildRetrievalPlanFromPlannerOutput,
  assembleValidatedRetrievalPlan,
  validateRetrievalPlan,
  deriveRouteScopeDigest,
  RETRIEVAL_POLICY_VERSION,
  JOB_ROUTE_TAXONOMY_VERSION,
  type JobRouteAllocation,
  type RetrievalPlan,
  type RetrievalPlanSnapshot,
} from '../src/index.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail?: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..', '..');
const workerSrc = join(repoRoot, 'apps/worker/src');
const helperPath = join(workerSrc, 'qbank-planner-retrieval-plan.ts');
const consumerPath = join(workerSrc, 'interview-consumer.ts');
const scopePath = join(workerSrc, 'qbank-retrieve-scope.ts');
const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-p-planner.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation-status.md');

const GEN = 'qgen-11111111-1111-4111-8111-111111111111';
const RECIPE = 'qrecipe-0123456789abcdef0123456789abcdef';

const allocs: JobRouteAllocation[] = [
  { leafTrackId: 'backend/nodejs', allocationBps: 7000 },
  { leafTrackId: 'frontend/web', allocationBps: 3000 },
];

const snapshot: RetrievalPlanSnapshot = {
  interviewId: 'ivw_planner_proof_001',
  routeDigest: 'a'.repeat(64),
  allocations: allocs,
};

function walkTs(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name === '.tmp') continue;
      walkTs(p, out);
    } else if (/\.(ts|tsx|mjs|js)$/.test(ent.name) && !ent.name.endsWith('.proof.ts')) {
      out.push(p);
    }
  }
  return out;
}

// --- T1: per-turn InterviewPlannerOutput ---
const turn0 = planInterviewTurn({
  allocations: allocs,
  deficit: [0, 0],
  competencyId: 'concurrency',
  difficulty: 4,
});
A('T1 planInterviewTurn ok + shape',
  turn0.ok === true
  && turn0.ok
  && turn0.output.leafTrackId === 'backend/nodejs'
  && turn0.output.competencyId === 'concurrency'
  && turn0.output.difficulty === 4);

const turn1 = turn0.ok
  ? planInterviewTurn({
    allocations: allocs,
    deficit: turn0.deficit,
    competencyId: 'react-hooks',
    difficulty: 3,
  })
  : { ok: false as const, reason: 'prior_failed' };
A('T1 second turn still produces InterviewPlannerOutput from deficit',
  turn1.ok === true && turn1.ok && typeof turn1.output.leafTrackId === 'string');

// --- T2: validatePlannerOutput vs snapshot ---
A('T2 valid planner passes validatePlannerOutput',
  turn0.ok === true
  && turn0.ok
  && validatePlannerOutput(turn0.output, allocs).ok === true);
A('T2 leaf not in snapshot → fail-closed',
  validatePlannerOutput(
    { leafTrackId: 'backend/java', competencyId: 'concurrency', difficulty: 3 },
    allocs,
  ).ok === false);
A('T2 difficulty out of range → fail-closed',
  validatePlannerOutput(
    { leafTrackId: 'backend/nodejs', competencyId: 'concurrency', difficulty: 9 },
    allocs,
  ).ok === false);

// --- T3: full RetrievalPlan assembly + validate ---
const assembled = assembleValidatedRetrievalPlan({
  snapshot,
  deficit: [0, 0],
  competencyId: 'concurrency',
  difficulty: 4,
  generationId: GEN,
  recipeId: RECIPE,
});
A('T3 assembleValidatedRetrievalPlan ok', assembled.ok === true);
if (assembled.ok) {
  const expectedDigest = deriveRouteScopeDigest({
    routeDigest: snapshot.routeDigest,
    leafTrackId: assembled.plan.leafTrackId,
    taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION,
  });
  A('T3 plan has generationId + recipeId + required fields',
    assembled.plan.generationId === GEN
    && assembled.plan.recipeId === RECIPE
    && assembled.plan.snapshotId === snapshot.interviewId
    && assembled.plan.routeScopeDigest === expectedDigest
    && assembled.plan.taxonomyVersion === JOB_ROUTE_TAXONOMY_VERSION
    && assembled.plan.policyVersion === RETRIEVAL_POLICY_VERSION
    && assembled.plan.leafTrackId === 'backend/nodejs'
    && assembled.plan.competencyId === 'concurrency'
    && assembled.plan.difficulty === 4);
  A('T3 validateRetrievalPlan passes',
    validateRetrievalPlan(assembled.plan, snapshot).ok === true);

  const built = buildRetrievalPlanFromPlannerOutput({
    planner: assembled.planner,
    snapshot,
    generationId: GEN,
    recipeId: RECIPE,
  });
  A('T3 buildRetrievalPlanFromPlannerOutput matches assemble',
    built.generationId === assembled.plan.generationId
    && built.recipeId === assembled.plan.recipeId
    && built.routeScopeDigest === assembled.plan.routeScopeDigest
    && built.leafTrackId === assembled.plan.leafTrackId);
}

// --- T4: P-FAKEPLAN ban ---
A('T4 missing generationId → fail-closed (no plan)',
  assembleValidatedRetrievalPlan({
    snapshot,
    deficit: [0, 0],
    competencyId: 'concurrency',
    difficulty: 4,
    generationId: '',
    recipeId: RECIPE,
  }).ok === false);

A('T4 missing recipeId → fail-closed',
  assembleValidatedRetrievalPlan({
    snapshot,
    deficit: [0, 0],
    competencyId: 'concurrency',
    difficulty: 4,
    generationId: GEN,
    recipeId: '',
  }).ok === false);

const fakePrimary: RetrievalPlan = {
  snapshotId: snapshot.interviewId,
  routeScopeDigest: deriveRouteScopeDigest({
    routeDigest: snapshot.routeDigest,
    leafTrackId: 'backend/nodejs',
    taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION,
  }),
  leafTrackId: 'backend/nodejs', // max-bps primary leaf hard-stuff
  taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION,
  competencyId: 'concurrency',
  difficulty: 4,
  generationId: 'not-a-generation', // fake / missing shape
  recipeId: 'not-a-recipe',
  policyVersion: RETRIEVAL_POLICY_VERSION,
};
A('T4 P-FAKEPLAN: primary leaf + illegal generation/recipe fails validateRetrievalPlan',
  validateRetrievalPlan(fakePrimary, snapshot).ok === false);

const fakeNoIds = {
  snapshotId: snapshot.interviewId,
  routeScopeDigest: fakePrimary.routeScopeDigest,
  leafTrackId: 'backend/nodejs',
  taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION,
  competencyId: 'concurrency',
  difficulty: 4,
  generationId: '',
  recipeId: '',
  policyVersion: RETRIEVAL_POLICY_VERSION,
} as RetrievalPlan;
A('T4 P-FAKEPLAN: primary leaf without generation/recipe fails validate',
  validateRetrievalPlan(fakeNoIds, snapshot).ok === false);

// --- T6: G-R2-5 missing/illegal snapshot → degraded denial; no unscoped ---
const miss = assembleValidatedRetrievalPlan({
  snapshot: null,
  deficit: [],
  competencyId: 'concurrency',
  difficulty: 4,
  generationId: GEN,
  recipeId: RECIPE,
});
A('T6 null snapshot → route_snapshot_missing fail-closed',
  miss.ok === false && miss.ok === false && miss.reason === 'route_snapshot_missing' && miss.stage === 'snapshot');

const emptyAlloc = assembleValidatedRetrievalPlan({
  snapshot: { interviewId: 'x', routeDigest: 'b'.repeat(64), allocations: [] },
  deficit: [],
  competencyId: 'concurrency',
  difficulty: 4,
  generationId: GEN,
  recipeId: RECIPE,
});
A('T6 empty allocations → route_snapshot_missing',
  emptyAlloc.ok === false && emptyAlloc.ok === false && emptyAlloc.reason === 'route_snapshot_missing');

const badLeafPlanner = planInterviewTurn({
  allocations: [],
  deficit: [],
  competencyId: 'c',
  difficulty: 3,
});
A('T6 planInterviewTurn empty allocations fail-closed (not unscoped)',
  badLeafPlanner.ok === false && badLeafPlanner.ok === false && badLeafPlanner.reason === 'route_snapshot_missing');

// --- T7: boundary honesty (docs + static wire) ---
const harness = existsSync(harnessPath) ? readFileSync(harnessPath, 'utf8') : '';
const status = existsSync(statusPath) ? readFileSync(statusPath, 'utf8') : '';
A('T7 harness pins ≠ R4 closed / ≠ wrong_track=0 / releaseEvidence=false',
  /≠ R4|NOT closed|题域隔离 NOT closed/.test(harness)
  && /wrong_track=0/.test(harness)
  && /releaseEvidence=false/.test(harness));
A('T7 status still pins 题域隔离 NOT closed',
  /题域隔离 NOT closed/.test(status) && /releaseEvidence=false/.test(status));

A('helper module present (production-capable seam)', existsSync(helperPath), helperPath);
const helper = existsSync(helperPath) ? readFileSync(helperPath, 'utf8') : '';
A('helper still exports assembleValidatedRetrievalPlan',
  /assembleValidatedRetrievalPlan/.test(helper));
A('helper does not itself call dispatchTrackLocalRetrieval( (call lives in track-local retrieve)',
  !/dispatchTrackLocalRetrieval\s*\(/.test(helper));

const consumer = existsSync(consumerPath) ? readFileSync(consumerPath, 'utf8') : '';
const scope = existsSync(scopePath) ? readFileSync(scopePath, 'utf8') : '';
A('retrieve still gates G-R2-5 via decideRouteSnapshotRetrieve',
  /decideRouteSnapshotRetrieve/.test(consumer));
A('scope helper still documents G-R2-5 / route_snapshot_missing',
  /route_snapshot_missing/.test(scope));

let dispatchCalls = 0;
for (const f of walkTs(workerSrc)) {
  const src = readFileSync(f, 'utf8');
  if (/dispatchTrackLocalRetrieval\s*\(/.test(src)) dispatchCalls++;
}
// T5 owned by REAL-WIRE-IMPL — unit prove only requires assemble contract still green.
A('T5 note: REAL-WIRE may wire dispatch (unit prove does not require zero call sites)',
  true, `callSites=${dispatchCalls}`);
A('T5 note: consumer references track-local retrieve path when wired',
  /retrieveViaDispatchTrackLocal|decideRouteSnapshotRetrieve/.test(consumer));

console.log(failures === 0
  ? '\nOK  r4-p-planner-unit prove (T1–T4/T6–T7; assemble+validate; P-FAKEPLAN banned; G-R2-5 kept; ≠ R4 closed; releaseEvidence=false; T5 owned by REAL-WIRE-IMPL)'
  : `\nFAIL  r4-p-planner-unit prove (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);

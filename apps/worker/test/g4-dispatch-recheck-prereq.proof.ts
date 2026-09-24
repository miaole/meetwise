/**
 * G4 / GAP-RAG-04 — dispatchTrackLocalRetrieval + recheck prove (FLIPPED for REAL-WIRE-IMPL).
 * releaseEvidence=false · Not HA · ≠ R4 closed · ≠ 题域已隔离 · ≠ wrong_track=0
 *
 * Historical PREREQ pinned CALL_SITES=0. REAL-WIRE-IMPL (2026-09-16) wires Worker retrieve:
 * prefer `pnpm r4-real-wire-impl:prove`. This prove now asserts CALL_SITES≥1 + fail-closed +
 * R4 still NOT closed. Wire green ≠ R4 closed ≠ wrong_track=0.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

let failures = 0;
const A = (name: string, ok: boolean, detail?: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

const here = dirname(fileURLToPath(import.meta.url));
const workerRoot = join(here, '..');
const repoRoot = join(workerRoot, '..', '..');
const workerSrc = join(workerRoot, 'src');
const mainPath = join(workerSrc, 'main.ts');
const consumerPath = join(workerSrc, 'interview-consumer.ts');
const scopePath = join(workerSrc, 'qbank-retrieve-scope.ts');
const retrieveHelperPath = join(workerSrc, 'qbank-track-local-retrieve.ts');
const trackLocalPath = join(repoRoot, 'packages/db/src/qbank-track-local-retrieval.ts');
const domainPlanPath = join(repoRoot, 'packages/domain/src/qbank-track-local-retrieval.ts');
const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation-status.md');
const evalPath = join(repoRoot, 'ai-docs/delivery/eval/r4-domain-isolation.eval.md');
const backlogPath = join(repoRoot, 'ai-docs/delivery/gap-bug-backlog.md');
const requestRag = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-g4-dispatch-recheck-prereq-mw-rag-route.md');
const requestE2e = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-g4-dispatch-recheck-prereq-mw-e2e-ha.md');
const appsRoot = join(repoRoot, 'apps');

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

for (const [label, path] of [
  ['main.ts', mainPath],
  ['interview-consumer.ts', consumerPath],
  ['qbank-retrieve-scope.ts', scopePath],
  ['qbank-track-local-retrieve.ts', retrieveHelperPath],
  ['db track-local seam', trackLocalPath],
  ['domain RetrievalPlan', domainPlanPath],
  ['r4 harness', harnessPath],
  ['r4 status', statusPath],
  ['r4 eval', evalPath],
  ['gap backlog', backlogPath],
  ['REQUEST mw-rag-route', requestRag],
  ['REQUEST mw-e2e-ha', requestE2e],
] as const) {
  A(`${label} present`, existsSync(path), path);
}

const trackLocal = read(trackLocalPath);
const domainPlan = read(domainPlanPath);
const main = read(mainPath);
const consumer = read(consumerPath);
const scope = read(scopePath);
const retrieveHelper = read(retrieveHelperPath);
const harness = read(harnessPath);
const status = read(statusPath);
const evalDoc = read(evalPath);
const backlog = read(backlogPath);

A('exports dispatchTrackLocalRetrieval',
  /export async function dispatchTrackLocalRetrieval\s*\(/.test(trackLocal));
A('seam documents recheck path',
  /recheckHitsAtLeaf|recheck_failed|权威重验|权威投影/.test(trackLocal));
A('seam returns recheck_failed status',
  /status:\s*'recheck_failed'/.test(trackLocal));
A('domain validates RetrievalPlan / planner leaf',
  /validateRetrievalPlan/.test(domainPlan) && /leafTrackId/.test(domainPlan));

A('scope helper does NOT call dispatchTrackLocalRetrieval(',
  !/dispatchTrackLocalRetrieval\s*\(/.test(scope));

const workerSrcFiles = walkTsFiles(workerSrc);
let workerDispatchCalls = 0;
for (const f of workerSrcFiles) {
  if (/dispatchTrackLocalRetrieval\s*\(/.test(readFileSync(f, 'utf8'))) workerDispatchCalls++;
}
A('apps/worker/src CALL_SITES≥1 for dispatchTrackLocalRetrieval(',
  workerDispatchCalls >= 1, `callSites=${workerDispatchCalls}`);
A('retrieve helper calls dispatchTrackLocalRetrieval(',
  /dispatchTrackLocalRetrieval\s*\(/.test(retrieveHelper));
A('consumer wires retrieveViaDispatchTrackLocal / trackLocal',
  /retrieveViaDispatchTrackLocal/.test(consumer) && /trackLocal/.test(consumer));
A('main injects trackLocal factory',
  /trackLocal:\s*\(owner/.test(main));

A('partial scope path documents missing-snapshot fail-closed (G-R2-5)',
  /route_snapshot_missing|fail-closed/.test(scope));
A('consumer pins REAL-WIRE + G-R2-5 + ≠ wrong_track=0',
  /retrieveViaDispatchTrackLocal|dispatchTrackLocalRetrieval/.test(consumer)
  && /route_snapshot_missing|decideRouteSnapshotRetrieve/.test(consumer)
  && /wrong_track=0|题域已隔离/.test(consumer));
A('retrieve helper pins recheck_failed fail-closed',
  /recheck_failed/.test(retrieveHelper) && /fail-closed/.test(retrieveHelper));

const apiFiles = walkTsFiles(join(appsRoot, 'api', 'src'));
const workerClassifyFiles = walkTsFiles(join(appsRoot, 'worker', 'src'));
let apiClassifyCalls = 0;
let workerClassifyCalls = 0;
for (const f of apiFiles) {
  if (/classifyJobRoute\s*\(/.test(readFileSync(f, 'utf8'))) apiClassifyCalls++;
}
for (const f of workerClassifyFiles) {
  if (/classifyJobRoute\s*\(/.test(readFileSync(f, 'utf8'))) workerClassifyCalls++;
}
A('R2 honesty: apps/api/src zero classifyJobRoute( (Worker sole; wakeup-only P-API allowed)',
  apiClassifyCalls === 0, `apiCalls=${apiClassifyCalls}`);
const r2StatusDoc = read(join(repoRoot, 'ai-docs/delivery/harness/r2-classify-job-route-status.md'));
A('R2 still NOT closed documented',
  /R2 NOT closed/.test(r2StatusDoc) && (/闭环|G-R2-1|G-R2-3|G-R2-4|P-LOOP|P-START|P-API/.test(r2StatusDoc)),
  `workerCalls=${workerClassifyCalls}`);

let plannerToRetrieve = false;
for (const f of workerSrcFiles) {
  const t = readFileSync(f, 'utf8');
  if ((/assembleValidatedRetrievalPlan|planInterviewTurn|InterviewPlannerOutput/.test(t))
    && /dispatchTrackLocalRetrieval|retrieveViaDispatchTrackLocal|localRetrieve/.test(t)) {
    plannerToRetrieve = true;
  }
}
A('worker src has planner→retrieve/dispatch path (REAL-WIRE)',
  plannerToRetrieve);

A('harness pins 题域隔离 NOT closed', /题域隔离 NOT closed/.test(harness));
A('harness mentions dispatchTrackLocalRetrieval / recheck',
  /dispatchTrackLocalRetrieval/.test(harness) && /recheck/.test(harness));
A('harness releaseEvidence=false + Not HA',
  /releaseEvidence=false/.test(harness) && /Not HA/.test(harness));
A('status still pins 题域隔离 NOT closed (wire ≠ R4 closed)',
  /题域隔离 NOT closed/.test(status) && /releaseEvidence=false/.test(status));
A('status documents G-R4-1 / dispatch',
  /G-R4-1/.test(status) && /dispatch/.test(status));
A('eval pins ≠ R4 closed / ≠ 题域已隔离',
  /pass ≠ R4|≠ 题域已隔离|NOT closed/.test(evalDoc));
const gap04 = (backlog.match(/\| GAP-RAG-04 \|[\s\S]*?(?=\n\| GAP-|$)/) || [''])[0];
A('GAP-RAG-04 still NOT closed as R4/topic isolation',
  /GAP-RAG-04/.test(gap04) && /题域隔离 NOT closed|R4/.test(gap04));
A('REQUEST docs self-pin not a pass / releaseEvidence=false',
  /releaseEvidence=false/.test(read(requestRag))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestRag))
  && /releaseEvidence=false/.test(read(requestE2e)));

console.log(failures === 0
  ? `\nOK  g4-dispatch-recheck-prereq prove (FLIPPED: CALL_SITES=${workerDispatchCalls}≥1; REAL-WIRE consume; R4 NOT closed; ≠ wrong_track=0; releaseEvidence=false)`
  : `\nFAIL  g4-dispatch-recheck-prereq prove (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);

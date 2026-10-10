/**
 * G-R2-5 — Worker retrieve must deny local RAG when InterviewRouteSnapshot is missing.
 * releaseEvidence=false · Not HA · this is retrieve-side only; P-START is separate.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { degradedRetrieval } from '@meetwise/domain';
import { decideRouteSnapshotRetrieve } from '../src/qbank-retrieve-scope.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail?: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

const here = dirname(fileURLToPath(import.meta.url));
const workerRoot = join(here, '..');
const repoRoot = join(workerRoot, '..', '..');
const consumerPath = join(workerRoot, 'src/interview-consumer.ts');
const scopePath = join(workerRoot, 'src/qbank-retrieve-scope.ts');
const r2StatusPath = join(repoRoot, 'ai-docs/delivery/harness/r2-classify-job-route-status.md');
const r4StatusPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation-status.md');
const requestRag = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-g-r2-5-retrieve-fail-closed-mw-rag-route.md');
const requestE2e = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-g-r2-5-retrieve-fail-closed-mw-e2e-ha.md');
const read = (p: string) => existsSync(p) ? readFileSync(p, 'utf8') : '';

const missing = decideRouteSnapshotRetrieve(null);
A('missing snapshot is denied', !missing.allowed && missing.reason === 'route_snapshot_missing');
A('empty allocations are denied', !decideRouteSnapshotRetrieve({ allocations: [] }).allowed);
A('invalid snapshot leaf is denied', !decideRouteSnapshotRetrieve({ allocations: [{ leafTrackId: 'NOT_A_LEAF', allocationBps: 10000 }] }).allowed);
const valid = decideRouteSnapshotRetrieve({
  allocations: [{ leafTrackId: 'backend/nodejs', allocationBps: 10000 }],
});
A('valid snapshot produces scoped retrieve decision', valid.allowed && valid.scope.servingScopeId === 'backend/nodejs');
const deniedEvidence = degradedRetrieval('route_snapshot_missing');
A('denial is observable as degraded retrieval', deniedEvidence.availability === 'degraded' && deniedEvidence.score < 0
  && deniedEvidence.ref.includes('route_snapshot_missing'));

for (const [label, path] of [
  ['consumer', consumerPath], ['scope helper', scopePath], ['R2 status', r2StatusPath],
  ['R4 status', r4StatusPath], ['REQUEST mw-rag-route', requestRag], ['REQUEST mw-e2e-ha', requestE2e],
] as const) A(`${label} present`, existsSync(path), path);

const consumer = read(consumerPath);
A('consumer makes explicit retrieve decision', /decideRouteSnapshotRetrieve/.test(consumer));
A('consumer emits route_snapshot_missing degraded retrieval', /degradedRetrieval\(retrieveDecision\.reason\)/.test(consumer));
A('consumer fail-closed when decision denied; allowed path uses trackLocal or scoped localRetrieve',
  /degradedRetrieval\(retrieveDecision\.reason\)/.test(consumer)
  && (/retrieveViaDispatchTrackLocal/.test(consumer) || /adaptive\.localRetrieve\(owner, q, retrieveDecision\.scope\)/.test(consumer)));
A('consumer documents retrieve-side only / P-START separate', /retrieve-side only/.test(consumer) && /P-START/.test(consumer));
A('R2 status records G-R2-5 retrieve-side closure without closing R2', /G-R2-5/.test(read(r2StatusPath)) && /retrieve-side/.test(read(r2StatusPath)) && /R2 NOT closed/.test(read(r2StatusPath)));
A('R4 remains NOT closed', /题域隔离 NOT closed/.test(read(r4StatusPath)) && /G-R4-1/.test(read(r4StatusPath)));
A('both REQUESTs prohibit self-approval and release claims', /REQUEST/.test(read(requestRag)) && /禁止自批/.test(read(requestRag)) && /releaseEvidence=false/.test(read(requestE2e)));

console.log(failures === 0
  ? '\nOK  G-R2-5 retrieve missing snapshot fail-closed (retrieve-side only; R2 NOT closed; R4 NOT closed; releaseEvidence=false)'
  : `\nFAIL  G-R2-5 retrieve fail-closed (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);

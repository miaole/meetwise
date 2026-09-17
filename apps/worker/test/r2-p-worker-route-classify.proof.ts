/**
 * R2 P-WORKER — sole Worker classify / job_route for route_pending.
 * releaseEvidence=false · Not HA · closing P-WORKER ≠ R2 fully closed (P-API may remain)
 * ≠ 路由已生效 · ≠ R4 / HA / G6 · no flip default · no open DELETE
 * No fake rule-only classifier that claims R2 green.
 *
 * Prefer fail-closed without Key for structural proves.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import {
  bindJobRouteClassify, JOB_ROUTE_CLASSIFY_OPERATION_ID, JOB_ROUTE_CLASSIFY_PROMPT_SERVICE,
} from '@meetwise/ai-runtime';

let failures = 0;
const A = (name: string, ok: boolean, detail?: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

const here = dirname(fileURLToPath(import.meta.url));
const workerRoot = join(here, '..');
const repoRoot = join(workerRoot, '..', '..');
const appsRoot = join(repoRoot, 'apps');
const consumerPath = join(appsRoot, 'worker', 'src', 'route-classify-consumer.ts');
const mainPath = join(appsRoot, 'worker', 'src', 'main.ts');
const bindPath = join(repoRoot, 'packages/ai-runtime/src/job-route-classify.ts');
const promptPath = join(repoRoot, 'packages/ai-runtime/src/prompts.ts');
const routePath = join(repoRoot, 'packages/db/src/job-route-decision.ts');
const gatewayPath = join(repoRoot, 'packages/db/src/gateway-dispatch.ts');
const migratePath = join(repoRoot, 'packages/db/migrations/0132_job_route_classify_worker_dispatch.sql');
const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/r2-classify-job-route.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r2-classify-job-route-status.md');
const backlogPath = join(repoRoot, 'ai-docs/delivery/gap-bug-backlog.md');
const m4Path = join(repoRoot, 'ai-docs/delivery/m4-rag-hard-gates.md');
const requestModelOp = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-worker-route-classify-mw-model-op.md');
const requestRag = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-worker-route-classify-mw-rag-route.md');

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
  ['route-classify-consumer.ts', consumerPath],
  ['worker main.ts', mainPath],
  ['job-route-classify.ts', bindPath],
  ['prompts.ts', promptPath],
  ['job-route-decision.ts', routePath],
  ['gateway-dispatch.ts', gatewayPath],
  ['0132 migration', migratePath],
  ['r2 harness', harnessPath],
  ['r2 status', statusPath],
  ['gap backlog', backlogPath],
  ['m4 hard gates', m4Path],
  ['REQUEST P-WORKER mw-model-op', requestModelOp],
  ['REQUEST P-WORKER mw-rag-route', requestRag],
] as const) {
  A(`${label} present`, existsSync(path), path);
}

const consumer = read(consumerPath);
const main = read(mainPath);
const bindSrc = read(bindPath);
const prompts = read(promptPath);
const route = read(routePath);
const gateway = read(gatewayPath);
const migrate = read(migratePath);
const harness = read(harnessPath);
const status = read(statusPath);
const backlog = read(backlogPath);
const m4 = read(m4Path);

A('consumer calls classifyJobRoute(', /classifyJobRoute\s*\(/.test(consumer));
A('consumer uses createJobRouteModelClassify (honest MODEL-OP, not fake rules)',
  /createJobRouteModelClassify/.test(consumer)
  && /listNextJobRoutePending/.test(consumer)
  && /gatewayDispatchOwners/.test(consumer)
  && /job_route/.test(consumer));
A('consumer forbids fake-green claims in header',
  /≠ R2 closed|NOT closed|P-API/.test(consumer)
  && /releaseEvidence=false/.test(consumer)
  && /Not HA/.test(consumer));

A('main wires runRouteClassifyConsumer + wake/stop/ready',
  /runRouteClassifyConsumer/.test(main)
  && /routeClassifyLoop/.test(main)
  && /routeClassifyLoop\.wake\(\)/.test(main)
  && /routeClassifyLoop\.stop\(\)/.test(main)
  && /routeClassifyLoop\.ready\(\)/.test(main));

A('createJobRouteModelClassify + bindJobRouteClassify present in ai-runtime',
  /export function createJobRouteModelClassify\s*\(/.test(bindSrc)
  && /export function bindJobRouteClassify\s*\(/.test(bindSrc)
  && /invoke\(/.test(bindSrc)
  && /known_not_sent|reasonCodes/.test(bindSrc)
  && /dispatched_unknown/.test(bindSrc));

A('prompt registry has job.route-classify.v1 (p.v1)',
  /'job\.route-classify\.v1'/.test(prompts)
  && /version:\s*'p\.v1'/.test(prompts)
  && JOB_ROUTE_CLASSIFY_PROMPT_SERVICE === 'job.route-classify.v1');

A('db listNextJobRoutePending + classifyJobRoute exported',
  /export async function listNextJobRoutePending\s*\(/.test(route)
  && /export async function classifyJobRoute\s*\(/.test(route)
  && /FOR UPDATE SKIP LOCKED/.test(route));

A('gateway DispatchWork includes job_route',
  /'job_route'/.test(gateway));
A('0132 migration seeds job_route gateway + pending index',
  /job_route/.test(migrate)
  && /ix_job_semantic_revision_route_pending/.test(migrate)
  && /gateway_dispatch_owners/.test(migrate));

// Sole Worker path: worker has classify; API must remain zero (P-API open).
const workerFiles = walkTsFiles(join(appsRoot, 'worker', 'src'));
const apiFiles = walkTsFiles(join(appsRoot, 'api', 'src'));
const workerHits: string[] = [];
const apiHits: string[] = [];
for (const f of workerFiles) {
  if (/classifyJobRoute\s*\(/.test(readFileSync(f, 'utf8'))) workerHits.push(f);
}
for (const f of apiFiles) {
  if (/classifyJobRoute\s*\(/.test(readFileSync(f, 'utf8'))) apiHits.push(f);
}
A('P-WORKER: apps/worker/src has classifyJobRoute( (sole consumer)',
  workerHits.length >= 1
  && workerHits.some((f) => f.replace(/\\/g, '/').endsWith('/route-classify-consumer.ts')),
  `workerCalls=${workerHits.length}`);
A('Worker sole preserved: apps/api/src zero classifyJobRoute( (wakeup-only P-API allowed)',
  apiHits.length === 0, `apiCalls=${apiHits.length}`);

// Structural fail-closed without Key: binding still works; no network.
const digest = createHash('sha256').update('p-worker-route-classify-proof', 'utf8').digest('hex');
const bound = bindJobRouteClassify(digest);
A('bindJobRouteClassify fail-closed-ready without Key (structural)',
  bound.ok === true
  && bound.ok
  && bound.provenance.operationId === JOB_ROUTE_CLASSIFY_OPERATION_ID
  && bound.provenance.semanticDigest === digest);

A('harness/status pin P-WORKER CLOSED + R2 NOT closed (P-API may be closed via wakeup)',
  /P-WORKER/.test(harness) && /CLOSED|已关|已接线/.test(harness)
  && /P-API/.test(harness + status)
  && /R2 NOT closed/.test(status)
  && /releaseEvidence=false/.test(status)
  && /Not HA/.test(status));

A('status does NOT claim 路由已生效 / R4 closed / HA',
  !/路由已生效/.test(status.replace(/≠ 路由已生效/g, '').replace(/不得宣称路由生效/g, ''))
  && /≠ 路由已生效|不得宣称路由生效/.test(status + harness)
  && /Not HA/.test(status));

const gap02 = (backlog.match(/\| GAP-RAG-02 \|[\s\S]*?(?=\n\| GAP-|$)/) || [''])[0];
A('GAP-RAG-02 still open overall; cites P-WORKER / sole / 闭环',
  /GAP-RAG-02/.test(gap02)
  && /R2 NOT closed|仍 NOT closed|仍未/.test(gap02)
  && (/P-WORKER|route-classify-consumer|sole|闭环/.test(gap02)));

A('m4 §R2 still forbids claiming 路由已生效',
  /## 3\. R2/.test(m4)
  && /无生产接线不得宣称路由生效|无生产闭环不得宣称路由生效|不得宣称路由生效/.test(m4));

A('REQUEST docs self-pin not a pass / releaseEvidence=false / 禁止自批',
  /releaseEvidence=false/.test(read(requestModelOp))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestModelOp))
  && /releaseEvidence=false/.test(read(requestRag))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestRag)));

console.log(failures === 0
  ? '\nOK  r2-p-worker-route-classify prove (P-WORKER closed via sole route-classify consumer + MODEL-OP modelClassify; R2 NOT closed; ≠ 路由已生效; releaseEvidence=false; Not HA)'
  : `\nFAIL  r2-p-worker-route-classify prove (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);

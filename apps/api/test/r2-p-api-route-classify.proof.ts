/**
 * R2 P-API — createJob (and semantic revision) → enqueue/wakeup sole route-classify Worker.
 * releaseEvidence=false · Not HA · closing P-API ≠ R2 fully closed (bind/snapshot closed-loop)
 * ≠ 路由已生效 · ≠ R4 / HA · no flip default · no open DELETE · no fake-green
 *
 * Prefer fail-closed without Key for structural proves.
 * Worker remains sole classifyJobRoute( caller; API wakes only.
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
const apiRoot = join(here, '..');
const repoRoot = join(apiRoot, '..', '..');
const appsRoot = join(repoRoot, 'apps');
const servicePath = join(appsRoot, 'api', 'src', 'modules', 'recruiter', 'recruiter.service.ts');
const wakeupPath = join(repoRoot, 'packages/db/src/worker-job-wakeup.ts');
const dbIndexPath = join(repoRoot, 'packages/db/src/index.ts');
const migratePath = join(repoRoot, 'packages/db/migrations/0133_job_route_pending_worker_wakeup.sql');
const migrate0132 = join(repoRoot, 'packages/db/migrations/0132_job_route_classify_worker_dispatch.sql');
const consumerPath = join(appsRoot, 'worker', 'src', 'route-classify-consumer.ts');
const recruiterDbPath = join(repoRoot, 'packages/db/src/recruiter.ts');
const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/r2-classify-job-route.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r2-classify-job-route-status.md');
const backlogPath = join(repoRoot, 'ai-docs/delivery/gap-bug-backlog.md');
const m4Path = join(repoRoot, 'ai-docs/delivery/m4-rag-hard-gates.md');
const requestModelOp = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-api-route-classify-mw-model-op.md');
const requestRag = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-api-route-classify-mw-rag-route.md');
const rootPkg = join(repoRoot, 'package.json');

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
  ['recruiter.service.ts', servicePath],
  ['worker-job-wakeup.ts', wakeupPath],
  ['db index', dbIndexPath],
  ['0133 migration', migratePath],
  ['0132 job_route gateway', migrate0132],
  ['route-classify-consumer.ts', consumerPath],
  ['recruiter.ts', recruiterDbPath],
  ['r2 harness', harnessPath],
  ['r2 status', statusPath],
  ['gap backlog', backlogPath],
  ['m4 hard gates', m4Path],
  ['REQUEST P-API mw-model-op', requestModelOp],
  ['REQUEST P-API mw-rag-route', requestRag],
] as const) {
  A(`${label} present`, existsSync(path), path);
}

const service = read(servicePath);
const wakeup = read(wakeupPath);
const dbIndex = read(dbIndexPath);
const migrate = read(migratePath);
const consumer = read(consumerPath);
const recruiterDb = read(recruiterDbPath);
const harness = read(harnessPath);
const status = read(statusPath);
const backlog = read(backlogPath);
const m4 = read(m4Path);
const pkg = read(rootPkg);

A('API RecruiterService.create calls createJob + notifyWorkerJobWakeup (combination root I3)',
  /createJob\s*\(/.test(service)
  && /notifyWorkerJobWakeup\s*\(/.test(service)
  && /asPrincipal/.test(service));

A('API does NOT call classifyJobRoute( (Worker remains sole)',
  !/classifyJobRoute\s*\(/.test(service));

A('notifyWorkerJobWakeup exported from @meetwise/db helper + index',
  /export async function notifyWorkerJobWakeup\s*\(/.test(wakeup)
  && /pg_notify/.test(wakeup)
  && /WORKER_JOB_WAKEUP_CHANNEL/.test(wakeup)
  && /notifyWorkerJobWakeup/.test(dbIndex));

A('0133 migration: route_pending → pg_notify wake-only (no job/tenant payload)',
  /job_semantic_revision/.test(migrate)
  && /route_pending/.test(migrate)
  && /pg_notify\('meetwise_worker_wakeup_v1',\s*'wake'\)/.test(migrate)
  && /worker_job_wakeup_after_route_pending/.test(migrate)
  && /job_semantic_revision_worker_wakeup_after_route_pending/.test(migrate));

A('db createJob/updateJob still write createJobSemanticRevision (revision face)',
  /createJobSemanticRevision/.test(recruiterDb)
  && /export async function createJob\s*\(/.test(recruiterDb)
  && /export async function updateJob\s*\(/.test(recruiterDb)
  && !/classifyJobRoute\s*\(/.test(recruiterDb));

A('Worker sole consumer still calls classifyJobRoute( + MODEL-OP',
  /classifyJobRoute\s*\(/.test(consumer)
  && /createJobRouteModelClassify/.test(consumer)
  && /gatewayDispatchOwners/.test(consumer)
  && /job_route/.test(consumer));

const workerFiles = walkTsFiles(join(appsRoot, 'worker', 'src'));
const apiFiles = walkTsFiles(join(appsRoot, 'api', 'src'));
const workerHits: string[] = [];
const apiHits: string[] = [];
let apiWakeHits = 0;
for (const f of workerFiles) {
  if (/classifyJobRoute\s*\(/.test(readFileSync(f, 'utf8'))) workerHits.push(f);
}
for (const f of apiFiles) {
  const t = readFileSync(f, 'utf8');
  if (/classifyJobRoute\s*\(/.test(t)) apiHits.push(f);
  if (/notifyWorkerJobWakeup\s*\(/.test(t)) apiWakeHits++;
}
A('Worker sole: apps/worker has classifyJobRoute( via route-classify-consumer',
  workerHits.length >= 1
  && workerHits.some((f) => f.replace(/\\/g, '/').endsWith('/route-classify-consumer.ts')),
  `workerCalls=${workerHits.length}`);
A('P-API closed via wakeup: apps/api zero classifyJobRoute( + has notifyWorkerJobWakeup',
  apiHits.length === 0 && apiWakeHits >= 1,
  `apiClassify=${apiHits.length} apiWake=${apiWakeHits}`);

A('harness/status pin P-API CLOSED + R2 NOT closed + ≠ 路由已生效',
  /P-API/.test(harness) && /CLOSED|已关|已接线|wakeup|enqueue/.test(harness + status)
  && /R2 NOT closed/.test(status)
  && /releaseEvidence=false/.test(status)
  && /Not HA/.test(status)
  && /≠ 路由已生效|不得宣称路由生效/.test(status + harness));

A('status does NOT claim 路由已生效 / R4 closed / HA / releaseEvidence=true',
  !/路由已生效/.test(status.replace(/≠ 路由已生效/g, '').replace(/不得宣称路由生效/g, ''))
  && /Not HA/.test(status)
  && /releaseEvidence=false/.test(status));

A('status pins closed-loop / bind/snapshot still needed for full R2 (honesty)',
  /闭环|bind|snapshot|G-R2-1|G-R2-3/.test(status));

const gap02 = (backlog.match(/\| GAP-RAG-02 \|[\s\S]*?(?=\n\| GAP-|$)/) || [''])[0];
A('GAP-RAG-02 still open overall; cites P-API closed OR wakeup + closed-loop',
  /GAP-RAG-02/.test(gap02)
  && /R2 NOT closed|仍 NOT closed|仍未/.test(gap02)
  && (/P-API|wakeup|notifyWorkerJobWakeup|闭环/.test(gap02)));

A('m4 §R2 still forbids claiming 路由已生效',
  /## 3\. R2/.test(m4)
  && /无生产接线不得宣称路由生效|不得宣称路由生效/.test(m4));

A('root package.json has r2-p-api-route-classify:prove script',
  /"r2-p-api-route-classify:prove"/.test(pkg));

A('REQUEST docs self-pin not a pass / releaseEvidence=false / 禁止自批',
  /releaseEvidence=false/.test(read(requestModelOp))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestModelOp))
  && /releaseEvidence=false/.test(read(requestRag))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestRag)));

console.log(failures === 0
  ? '\nOK  r2-p-api-route-classify prove (P-API closed via createJob→notifyWorkerJobWakeup + 0133 route_pending trigger; Worker sole classify; R2 NOT closed pending closed-loop; ≠ 路由已生效; releaseEvidence=false; Not HA)'
  : `\nFAIL  r2-p-api-route-classify prove (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);

/**
 * R2 / GAP-RAG-02 — classifyJobRoute production wiring honesty PREREQ prove.
 * releaseEvidence=false · Not HA · ≠ R2 closed · ≠ 路由已生效 · ≠ R4 / 题域已隔离
 *
 * Product blockers:
 *   - P-MODEL: CLOSED — job.route-classify.v1 (UC job_route_classify) MODEL-OP-01 typed binding published
 *   - P-WORKER: CLOSED — sole route-classify-consumer → classifyJobRoute via MODEL-OP
 *   - P-API: CLOSED via notifyWorkerJobWakeup + 0133 (api still zero classifyJobRoute)
 *   - P-LOOP: CLOSED via start lazy re-bind → snapshot (dual-passed)
 *   - P-START: real refuse-start wire (interview_ineligible_route); CLOSED (dual-passed)
 *   - P-FAKE: CLOSED (dual-passed) -- rule-only fake Worker claiming R2 closed banned; sole must use createJobRouteModelClassify
 *   - P-LIVE: CLOSED pending dual-review -- measurable classify→bind→snapshot→refuse/allow Key-unset receipt (G-R2-7)
 *
 * This prove pins: inventory · contract intact · Worker sole classify · API wakeup ·
 * P-MODEL…P-FAKE dual-passed · P-LIVE pending dual · R2 remains NOT closed (P-LIVE dual + harness gates).
 * closing P-* != R2 fully closed.
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
const appsRoot = join(repoRoot, 'apps');
const routePath = join(repoRoot, 'packages/db/src/job-route-decision.ts');
const recruiterPath = join(repoRoot, 'packages/db/src/recruiter.ts');
const dbIndexPath = join(repoRoot, 'packages/db/src/index.ts');
const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/r2-classify-job-route.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r2-classify-job-route-status.md');
const evalPath = join(repoRoot, 'ai-docs/delivery/eval/r2-classify-job-route.eval.md');
const backlogPath = join(repoRoot, 'ai-docs/delivery/gap-bug-backlog.md');
const m4Path = join(repoRoot, 'ai-docs/delivery/m4-rag-hard-gates.md');
const r4StatusPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation-status.md');
const reqUseCasePath = join(repoRoot, 'ai-docs/requirements/use-cases/rag-funnel-intent-routing.md');
const requestRag = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-classify-job-route-mw-rag-route.md');
const requestE2e = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-classify-job-route-mw-e2e-ha.md');
const requestModelOp = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-model-job-route-classify-mw-model-op.md');
const requestRagPmodel = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-model-job-route-classify-mw-rag-route.md');
const requestPworkerModelOp = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-worker-route-classify-mw-model-op.md');
const requestPworkerRag = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-worker-route-classify-mw-rag-route.md');
const requestPapiModelOp = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-api-route-classify-mw-model-op.md');
const requestPapiRag = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-api-route-classify-mw-rag-route.md');
const requestPloopModelOp = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-loop-route-classify-mw-model-op.md');
const requestPloopRag = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-loop-route-classify-mw-rag-route.md');
const requestPstartModelOp = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-start-route-classify-mw-model-op.md');
const requestPstartRag = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-start-route-classify-mw-rag-route.md');
const requestPfakeModelOp = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-fake-route-classify-mw-model-op.md');
const requestPfakeRag = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-fake-route-classify-mw-rag-route.md');
const requestPliveModelOp = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-live-route-effective-mw-model-op.md');
const requestPliveRag = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-live-route-effective-mw-rag-route.md');
const consumerPath = join(appsRoot, 'worker', 'src', 'route-classify-consumer.ts');
const apiServicePath = join(appsRoot, 'api', 'src', 'modules', 'recruiter', 'recruiter.service.ts');
const wakeupHelperPath = join(repoRoot, 'packages/db/src/worker-job-wakeup.ts');
const migrate0133Path = join(repoRoot, 'packages/db/migrations/0133_job_route_pending_worker_wakeup.sql');
const workerEnvExample = join(repoRoot, 'docker/env/worker.env.example');
const registryPath = join(repoRoot, 'packages/ai-runtime/src/model-operation-registry.ts');
const bindPath = join(repoRoot, 'packages/ai-runtime/src/job-route-classify.ts');
const sealedPath = join(repoRoot, 'packages/domain/src/sealed-job-route-classify-binding.ts');
const migratePath = join(repoRoot, 'packages/db/migrations/0131_job_route_classify_admission.sql');

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
  ['job-route-decision.ts', routePath],
  ['recruiter.ts', recruiterPath],
  ['db index', dbIndexPath],
  ['r2 harness', harnessPath],
  ['r2 status', statusPath],
  ['r2 eval', evalPath],
  ['gap backlog', backlogPath],
  ['m4 hard gates', m4Path],
  ['r4 status', r4StatusPath],
  ['UC rag-funnel-intent-routing', reqUseCasePath],
  ['REQUEST mw-rag-route', requestRag],
  ['REQUEST mw-e2e-ha', requestE2e],
  ['REQUEST P-MODEL mw-model-op', requestModelOp],
  ['REQUEST P-MODEL mw-rag-route', requestRagPmodel],
  ['REQUEST P-WORKER mw-model-op', requestPworkerModelOp],
  ['REQUEST P-WORKER mw-rag-route', requestPworkerRag],
  ['REQUEST P-API mw-model-op', requestPapiModelOp],
  ['REQUEST P-API mw-rag-route', requestPapiRag],
  ['REQUEST P-LOOP mw-model-op', requestPloopModelOp],
  ['REQUEST P-LOOP mw-rag-route', requestPloopRag],
  ['REQUEST P-START mw-model-op', requestPstartModelOp],
  ['REQUEST P-START mw-rag-route', requestPstartRag],
  ['REQUEST P-FAKE mw-model-op', requestPfakeModelOp],
  ['REQUEST P-FAKE mw-rag-route', requestPfakeRag],
  ['REQUEST P-LIVE mw-model-op', requestPliveModelOp],
  ['REQUEST P-LIVE mw-rag-route', requestPliveRag],
  ['route-classify-consumer.ts', consumerPath],
  ['recruiter.service.ts', apiServicePath],
  ['worker-job-wakeup.ts', wakeupHelperPath],
  ['0133 route_pending wakeup', migrate0133Path],
  ['worker.env.example', workerEnvExample],
  ['model-operation-registry.ts', registryPath],
  ['job-route-classify.ts binding', bindPath],
  ['sealed-job-route-classify-binding.ts', sealedPath],
  ['0131 admission migration', migratePath],
] as const) {
  A(`${label} present`, existsSync(path), path);
}

const route = read(routePath);
const recruiter = read(recruiterPath);
const dbIndex = read(dbIndexPath);
const harness = read(harnessPath);
const status = read(statusPath);
const evalDoc = read(evalPath);
const backlog = read(backlogPath);
const m4 = read(m4Path);
const r4Status = read(r4StatusPath);
const uc = read(reqUseCasePath);

// --- contract intact (NOT production wire) ---
A('exports classifyJobRoute',
  /export async function classifyJobRoute\s*\(/.test(route));
A('exports bindApplicationRoute + snapshotInterviewRoute + getInterviewRouteSnapshot',
  /export async function bindApplicationRoute\s*\(/.test(route)
  && /export async function snapshotInterviewRoute\s*\(/.test(route)
  && /export async function getInterviewRouteSnapshot\s*\(/.test(route));
A('db index re-exports classifyJobRoute + getInterviewRouteSnapshot',
  /classifyJobRoute/.test(dbIndex) && /getInterviewRouteSnapshot/.test(dbIndex));

// --- recruiter write faces without classify ---
A('recruiter createJob/updateJob write createJobSemanticRevision',
  /createJobSemanticRevision/.test(recruiter)
  && /export async function createJob\s*\(/.test(recruiter)
  && /export async function updateJob\s*\(/.test(recruiter));
A('recruiter bindApplicationRoute + snapshotInterviewRoute present',
  /bindApplicationRoute/.test(recruiter) && /snapshotInterviewRoute/.test(recruiter));
A('recruiter does NOT call classifyJobRoute(',
  !/classifyJobRoute\s*\(/.test(recruiter));
A('startApplicationInterview refuse-start on missing binding (interview_ineligible_route)',
  /interview_ineligible_route/.test(recruiter)
  && /return \{ status: 'interview_ineligible_route'/.test(recruiter)
  && /snapshotInterviewRoute/.test(recruiter));
A('P-LOOP wire: startApplicationInterview binds before snapshot (lazy re-bind)',
  /bindApplicationRoute/.test(recruiter)
  && recruiter.indexOf('bindApplicationRoute') < recruiter.lastIndexOf('snapshotInterviewRoute')
  && /lazy|再试 bind|P-LOOP|P-START/.test(recruiter));

// --- apps production: Worker sole classify; API wakeup (P-API closed); zero inline classify ---
const workerFiles = walkTsFiles(join(appsRoot, 'worker', 'src'));
const apiFiles = walkTsFiles(join(appsRoot, 'api', 'src'));
const workerHits: string[] = [];
const apiHits: string[] = [];
let apiWakeHits = 0;
for (const f of workerFiles) {
  if (/classifyJobRoute\s*\(/.test(readFileSync(f, 'utf8'))) workerHits.push(f);
}
for (const f of apiFiles) {
  const src = readFileSync(f, 'utf8');
  if (/classifyJobRoute\s*\(/.test(src)) apiHits.push(f);
  if (/notifyWorkerJobWakeup\s*\(/.test(src)) apiWakeHits++;
}
A('P-WORKER CLOSED: apps/worker/src has classifyJobRoute( via route-classify-consumer',
  workerHits.length >= 1
  && workerHits.some((f) => f.replace(/\\/g, '/').endsWith('/route-classify-consumer.ts'))
  && /createJobRouteModelClassify/.test(read(consumerPath)),
  `workerCalls=${workerHits.length}`);
A('P-API CLOSED: apps/api zero classifyJobRoute( + notifyWorkerJobWakeup present',
  apiHits.length === 0 && apiWakeHits >= 1
  && /notifyWorkerJobWakeup/.test(read(apiServicePath))
  && /createJob/.test(read(apiServicePath))
  && /pg_notify/.test(read(wakeupHelperPath))
  && /route_pending/.test(read(migrate0133Path)),
  `apiClassify=${apiHits.length} apiWake=${apiWakeHits}`);

// --- product blockers in docs ---
A('harness inventories classify Worker / API / bind / snapshot call sites',
  /分类 Worker|I2|createJobSemanticRevision|bindApplicationRoute|snapshotInterviewRoute/.test(harness)
  && /classifyJobRoute/.test(harness));
A('harness pins product blockers P-MODEL / P-WORKER / P-API',
  /P-MODEL/.test(harness) && /P-WORKER/.test(harness) && /P-API/.test(harness)
  && (/job_route_classify/.test(harness) || /MODEL-OP/.test(harness)));
A('harness pins R2 NOT closed + releaseEvidence=false + Not HA',
  /R2 NOT closed|R2 是否已关[\s\S]*否/.test(harness)
  && /releaseEvidence=false/.test(harness)
  && /Not HA/.test(harness));
A('harness pins 不假接线 / fail-closed',
  /不假接线|fail-closed|不接线/.test(harness));
A('status pins R2 NOT closed + G-R2 gaps + releaseEvidence=false',
  /R2 NOT closed/.test(status)
  && /G-R2-1/.test(status)
  && /releaseEvidence=false/.test(status)
  && /Not HA/.test(status));
A('eval pins pass ≠ R2 / ≠ 路由已生效',
  /pass ≠ R2|≠ R2 已关/.test(evalDoc) && /≠ 路由已生效/.test(evalDoc));

const gap02 = (backlog.match(/\| GAP-RAG-02 \|[\s\S]*?(?=\n\| GAP-|$)/) || [''])[0];
A('GAP-RAG-02 still open overall; cites classify / P-LOOP / P-START',
  /GAP-RAG-02/.test(gap02)
  && /classifyJobRoute|R2/.test(gap02)
  && (/有合同无生产接线|生产接线|生产闭环|闭环|P-LOOP|P-START/.test(gap02))
  && /R2 NOT closed|仍 NOT closed|仍未/.test(gap02));
A('m4 §R2 still pins 无生产接线不得宣称路由生效',
  /## 3\. R2/.test(m4) && /无生产接线不得宣称路由生效|classifyJobRoute/.test(m4));
A('G4 status still lists R2 PREREQ / G-R4-4 open',
  /G-R4-4|P-R2|R2 PREREQ/.test(r4Status)
  && (/classifyJobRoute|无生产调用|apps\/.*classify/.test(r4Status) || /R2/.test(r4Status)));

A('requirements pin job_route_classify / job.route-classify.v1 MODEL-OP binding',
  (/job_route_classify/.test(uc) || /job\.route-classify\.v1/.test(uc))
  && /MODEL-OP/.test(uc));

const registry = read(registryPath);
const bindSrc = read(bindPath);
const sealed = read(sealedPath);
const migrate = read(migratePath);
A('P-MODEL CLOSED: registry wires job.route-classify.v1',
  /operationId:\s*'job\.route-classify\.v1'/.test(registry)
  && /wired:\s*true/.test(registry));
A('P-MODEL CLOSED: bindJobRouteClassify + sealed provenance present',
  /export function bindJobRouteClassify\s*\(/.test(bindSrc)
  && /SEALED_JOB_ROUTE_CLASSIFY_OPERATION_ID\s*=\s*'job\.route-classify\.v1'/.test(sealed)
  && /JOB_ROUTE_CLASSIFY_UC_ALIAS\s*=\s*'job_route_classify'/.test(sealed));
A('P-MODEL CLOSED: admission seed migration 0131 for job.route-classify.v1',
  /job\.route-classify\.v1/.test(migrate) && /allowed/.test(migrate));
A('P-WORKER + P-API + P-LOOP CLOSED documented; R2 NOT closed overall',
  /P-WORKER/.test(harness) && (/CLOSED|已关/.test(harness) || /P-WORKER.*CLOSED/.test(status))
  && /P-API/.test(harness) && (/CLOSED|wakeup|notifyWorkerJobWakeup/.test(harness + status))
  && /P-LOOP/.test(harness + status) && (/CLOSED|lazy|再试 bind/.test(harness + status))
  && /R2 NOT closed/.test(status)
  && (/P-START|G-R2-4|G-R2-5|G-R2-7|P-FAKE|P-LIVE|dual-review|双审/.test(harness + status)));
A('status pins P-MODEL/P-LOOP closed; R2 NOT closed via dual-review / remainder',
  /R2 NOT closed/.test(status)
  && (/P-LOOP.*CLOSED|CLOSED.*P-LOOP|G-R2-1.*CLOSED|G-R2-3.*CLOSED/.test(status.replace(/\s+/g, ' '))
    || (/P-LOOP/.test(status) && /CLOSED/.test(status) && /lazy|再试 bind|P12/.test(status)))
  && (/P-MODEL.*CLOSED|G-R2-2.*CLOSED|job\.route-classify\.v1/.test(status)
    || /P-MODEL.*已/.test(status))
  && (/P-START|G-R2-4|G-R2-5|G-R2-7|P-FAKE|P-LIVE|dual-review|双审/.test(status)));

A('worker.env.example documents RAG_JOB_ROUTE_INPUT_HASH_KEY + classifyJobRoute',
  /RAG_JOB_ROUTE_INPUT_HASH_KEY/.test(read(workerEnvExample))
  && /classifyJobRoute/.test(read(workerEnvExample)));

A('REQUEST docs self-pin not a pass / releaseEvidence=false / 禁止自批',
  /releaseEvidence=false/.test(read(requestRag))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestRag))
  && /releaseEvidence=false/.test(read(requestE2e))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestE2e))
  && /releaseEvidence=false/.test(read(requestModelOp))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestModelOp))
  && /releaseEvidence=false/.test(read(requestRagPmodel))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestRagPmodel))
  && /releaseEvidence=false/.test(read(requestPworkerModelOp))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestPworkerModelOp))
  && /releaseEvidence=false/.test(read(requestPworkerRag))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestPworkerRag))
  && /releaseEvidence=false/.test(read(requestPapiModelOp))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestPapiModelOp))
  && /releaseEvidence=false/.test(read(requestPapiRag))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestPapiRag))
  && /releaseEvidence=false/.test(read(requestPloopModelOp))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestPloopModelOp))
  && /releaseEvidence=false/.test(read(requestPloopRag))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestPloopRag))
  && /releaseEvidence=false/.test(read(requestPstartModelOp))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestPstartModelOp))
  && /releaseEvidence=false/.test(read(requestPstartRag))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestPstartRag))
  && /releaseEvidence=false/.test(read(requestPfakeModelOp))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestPfakeModelOp))
  && /releaseEvidence=false/.test(read(requestPfakeRag))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestPfakeRag))
  && /releaseEvidence=false/.test(read(requestPliveModelOp))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestPliveModelOp))
  && /releaseEvidence=false/.test(read(requestPliveRag))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestPliveRag)));

console.log(failures === 0
  ? '\nOK  r2-classify-job-route-prereq prove (P-MODEL…P-FAKE dual-passed; Worker sole classify; API wakeup; R2 NOT closed overall (P-LIVE pending dual + harness gates); ≠ 路由已生效; releaseEvidence=false)'
  : `\nFAIL  r2-classify-job-route-prereq prove (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);

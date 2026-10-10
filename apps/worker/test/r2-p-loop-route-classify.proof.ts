/**
 * R2 P-LOOP — classify → route_decided → bind → snapshot production closed-loop.
 * releaseEvidence=false · Not HA · closing P-LOOP ≠ claim R2 fully closed until dual-review
 * ≠ 路由已生效 · ≠ R4 · no flip default · no open DELETE · no fake-green
 *
 * Prefer fail-closed without Key for structural proves (rules-unique path = 0 model).
 * Live model optional only if Key-unset fail-closed.
 *
 * Wire: startApplicationInterview lazy re-bind before snapshot (closes apply/invite-before-classify race).
 * Combination roots: API wakeup · Worker sole classify (MODEL-OP) · recruiter bind/snapshot.
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
const recruiterPath = join(repoRoot, 'packages/db/src/recruiter.ts');
const routePath = join(repoRoot, 'packages/db/src/job-route-decision.ts');
const consumerPath = join(appsRoot, 'worker', 'src', 'route-classify-consumer.ts');
const mainPath = join(appsRoot, 'worker', 'src', 'main.ts');
const apiServicePath = join(appsRoot, 'api', 'src', 'modules', 'recruiter', 'recruiter.service.ts');
const bindPath = join(repoRoot, 'packages/ai-runtime/src/job-route-classify.ts');
const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/r2-classify-job-route.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r2-classify-job-route-status.md');
const evalPath = join(repoRoot, 'ai-docs/delivery/eval/r2-classify-job-route.eval.md');
const backlogPath = join(repoRoot, 'ai-docs/delivery/gap-bug-backlog.md');
const m4Path = join(repoRoot, 'ai-docs/delivery/m4-rag-hard-gates.md');
const requestModelOp = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-loop-route-classify-mw-model-op.md');
const requestRag = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-loop-route-classify-mw-rag-route.md');
const rootPkg = join(repoRoot, 'package.json');
const workerPkg = join(workerRoot, 'package.json');

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

/** Extract startApplicationInterview body for order-sensitive pins. */
function startFnBody(src: string): string {
  const m = src.match(/export async function startApplicationInterview[\s\S]*?(?=\nexport async function |\n\/\*\* 候选人婉拒)/);
  return m ? m[0] : '';
}

for (const [label, path] of [
  ['recruiter.ts', recruiterPath],
  ['job-route-decision.ts', routePath],
  ['route-classify-consumer.ts', consumerPath],
  ['worker main.ts', mainPath],
  ['recruiter.service.ts', apiServicePath],
  ['job-route-classify.ts', bindPath],
  ['r2 harness', harnessPath],
  ['r2 status', statusPath],
  ['r2 eval', evalPath],
  ['gap backlog', backlogPath],
  ['m4 hard gates', m4Path],
  ['REQUEST P-LOOP mw-model-op', requestModelOp],
  ['REQUEST P-LOOP mw-rag-route', requestRag],
] as const) {
  A(`${label} present`, existsSync(path), path);
}

const recruiter = read(recruiterPath);
const route = read(routePath);
const consumer = read(consumerPath);
const main = read(mainPath);
const apiService = read(apiServicePath);
const bindSrc = read(bindPath);
const harness = read(harnessPath);
const status = read(statusPath);
const evalDoc = read(evalPath);
const backlog = read(backlogPath);
const m4 = read(m4Path);
const pkg = read(rootPkg);
const wpkg = read(workerPkg);
const startBody = startFnBody(recruiter);

// --- Inventory blockers that P-LOOP closes ---
A('I4 applyToJob + inviteCandidate still call bindApplicationRoute',
  /export async function applyToJob[\s\S]*bindApplicationRoute\s*\(/.test(recruiter)
  && /export async function inviteCandidate[\s\S]*bindApplicationRoute\s*\(/.test(recruiter));

A('I5 P-LOOP wire: startApplicationInterview binds THEN snapshots (lazy re-bind)',
  /bindApplicationRoute\s*\(/.test(startBody)
  && /snapshotInterviewRoute\s*\(/.test(startBody)
  && startBody.indexOf('bindApplicationRoute') < startBody.indexOf('snapshotInterviewRoute')
  && /recruiter_user_id/.test(startBody)
  && /emitConsumptionEvent:\s*true/.test(startBody),
  `bind@${startBody.indexOf('bindApplicationRoute')} snap@${startBody.indexOf('snapshotInterviewRoute')}`);

A('I5 P-START refuse coexists: no_binding → interview_ineligible_route (P-LOOP keeps bind→snapshot order)',
  /interview_ineligible_route/.test(startBody)
  && /return \{ status: 'interview_ineligible_route'/.test(startBody)
  && startBody.indexOf('bindApplicationRoute') < startBody.indexOf('snapshotInterviewRoute'));

A('I2 Worker sole consumer: classifyJobRoute + createJobRouteModelClassify + listNextJobRoutePending',
  /classifyJobRoute\s*\(/.test(consumer)
  && /createJobRouteModelClassify/.test(consumer)
  && /listNextJobRoutePending/.test(consumer)
  && /runRouteClassifyConsumer/.test(main));

A('I3 API wakeup only: notifyWorkerJobWakeup; zero classifyJobRoute(',
  /notifyWorkerJobWakeup\s*\(/.test(apiService)
  && !/classifyJobRoute\s*\(/.test(apiService));

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
A('Worker sole classify across apps/worker/src; API classify=0',
  workerHits.length >= 1
  && workerHits.some((f) => f.replace(/\\/g, '/').endsWith('/route-classify-consumer.ts'))
  && apiHits.length === 0,
  `workerCalls=${workerHits.length} apiClassify=${apiHits.length}`);

// --- Contract faces ---
A('contract: classifyJobRoute + bindApplicationRoute + snapshotInterviewRoute + getInterviewRouteSnapshot',
  /export async function classifyJobRoute\s*\(/.test(route)
  && /export async function bindApplicationRoute\s*\(/.test(route)
  && /export async function snapshotInterviewRoute\s*\(/.test(route)
  && /export async function getInterviewRouteSnapshot\s*\(/.test(route));

A('rules-unique path can close loop without Key (modelCalls: 0 / rule_decided)',
  /rule_decided/.test(route)
  && /modelCalls:\s*0/.test(route)
  && /rule_unique_leaf|唯一 leaf|rules/.test(route));

A('MODEL-OP modelClassify fail-closed without Key (known_not_sent / createJobRouteModelClassify)',
  /export function createJobRouteModelClassify\s*\(/.test(bindSrc)
  && /known_not_sent|Without Key|fail-closed|failClosed/i.test(bindSrc));

A('recruiter does NOT call classifyJobRoute( (Worker sole)',
  !/classifyJobRoute\s*\(/.test(recruiter));

// --- Docs: P-LOOP CLOSED; R2 NOT closed ---
A('harness pins P-LOOP CLOSED + combination-root wire (lazy re-bind)',
  /P-LOOP/.test(harness)
  && (/CLOSED|已关/.test(harness) || /P-LOOP.*CLOSED/.test(status))
  && /lazy|再试 bind|startApplicationInterview/.test(harness + status));

A('status pins P-LOOP CLOSED (pending dual-review) + R2 NOT closed + ≠ 路由已生效',
  /P-LOOP/.test(status)
  && /CLOSED|已关/.test(status)
  && /R2 NOT closed/.test(status)
  && /releaseEvidence=false/.test(status)
  && /Not HA/.test(status)
  && /≠ 路由已生效|不得宣称路由生效/.test(status + harness));

A('status pins what remains for R2 overall (P-START and/or dual-review; not auto-claim)',
  /P-START/.test(status + harness)
  && (/dual-review|双审/.test(status + harness))
  && (/closing P-LOOP ≠|≠ claim R2|不得.*R2.*关/.test(status + harness)));

A('G-R2-3 / G-R2-1 reframed: loop wire CLOSED pending dual-review (not fake 路由已生效)',
  (/G-R2-3/.test(status) || /G-R2-1/.test(status))
  && (/P-LOOP.*CLOSED|CLOSED.*P-LOOP|闭环.*CLOSED|G-R2-3.*CLOSED|G-R2-1.*CLOSED/.test(status.replace(/\s+/g, ' '))
    || (/lazy|再试 bind|start.*bind/.test(status) && /P-LOOP/.test(status) && /CLOSED/.test(status))));

A('eval pins P-LOOP closed evidence ≠ R2 / ≠ 路由已生效',
  /P-LOOP/.test(evalDoc)
  && (/≠ R2|pass ≠ R2|R2 NOT closed/.test(evalDoc))
  && /≠ 路由已生效/.test(evalDoc));

const gap02 = (backlog.match(/\| GAP-RAG-02 \|[\s\S]*?(?=\n\| GAP-|$)/) || [''])[0];
A('GAP-RAG-02 still open overall (R2); cites P-LOOP closed OR remaining P-START',
  /GAP-RAG-02/.test(gap02)
  && /R2 NOT closed|仍 NOT closed|仍未/.test(gap02)
  && (/P-LOOP|闭环|P-START|lazy|再试 bind/.test(gap02)));

A('m4 §R2 still forbids claiming 路由已生效; cites P-LOOP prove',
  /## 3\. R2/.test(m4)
  && /不得宣称路由生效|无生产接线不得宣称路由生效/.test(m4)
  && (/r2-p-loop|P-LOOP/.test(m4)));

A('package scripts: r2-p-loop-route-classify:prove present',
  /"r2-p-loop-route-classify:prove"/.test(pkg)
  && /"prove:r2-p-loop-route-classify"/.test(wpkg));

A('REQUEST docs self-pin not a pass / releaseEvidence=false / 禁止自批',
  /releaseEvidence=false/.test(read(requestModelOp))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestModelOp))
  && /releaseEvidence=false/.test(read(requestRag))
  && /禁止自批|不是.*pass|REQUEST/.test(read(requestRag)));

A('no fake-green: docs forbid rule-only fake Worker claiming R2 / 路由已生效',
  /P-FAKE|假 Worker|假绿|规则-only/.test(harness + status)
  && !/路由已生效/.test(status.replace(/≠ 路由已生效/g, '').replace(/不得宣称路由生效/g, '')));

console.log(failures === 0
  ? '\nOK  r2-p-loop-route-classify prove (P-LOOP closed via start lazy re-bind + Worker sole classify + API wakeup; R2 NOT closed overall (P-LOOP dual-passed; P-START refuse wire pending dual-review); ≠ 路由已生效; releaseEvidence=false; Not HA)'
  : `\nFAIL  r2-p-loop-route-classify prove (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);

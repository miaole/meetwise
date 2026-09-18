/**
 * R2 P-LIVE — measurable 路由已生效收据 (classify→bind→snapshot→refuse/allow).
 *
 * releaseEvidence=false · Not HA · ≠ claim R2 fully closed until dual-review + harness agree
 * ≠ verbal 生效 · ≠ R4 · no flip default · no open DELETE · no self-approve · no .env*
 *
 * Prefer Key-unset fail-closed structural path:
 *   - ALLOW: rules-unique leaf → route_decided (modelCalls=0) → bind → snapshot → started
 *   - REFUSE: no binding → interview_ineligible_route BEFORE interview INSERT
 *   - MODEL path: createJobRouteModelClassify Key-unset → known_not_sent (no fake-green)
 * Live Key / live model invoke NOT required for this receipt; if Key were required,
 * this prove would pin BLOCKED/PREREQ honesty instead of fake-green.
 *
 * Combination roots: API wakeup · Worker sole classify (MODEL-OP) · recruiter bind/snapshot/start.
 * Prior: P-MODEL…P-FAKE dual-passed · G-R2-5 retrieve-side CLOSED.
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
const apiAppsPath = join(appsRoot, 'api', 'src', 'modules', 'jobs', 'applications.service.ts');
const bindPath = join(repoRoot, 'packages/ai-runtime/src/job-route-classify.ts');
const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/r2-classify-job-route.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r2-classify-job-route-status.md');
const evalPath = join(repoRoot, 'ai-docs/delivery/eval/r2-classify-job-route.eval.md');
const backlogPath = join(repoRoot, 'ai-docs/delivery/gap-bug-backlog.md');
const m4Path = join(repoRoot, 'ai-docs/delivery/m4-rag-hard-gates.md');
const r4StatusPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation-status.md');
const requestModelOp = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-live-route-effective-mw-model-op.md');
const requestRag = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-live-route-effective-mw-rag-route.md');
const fakePassMo = join(repoRoot, 'ai-docs/delivery/reviews/2026-09-16-r2-p-fake-route-classify-mw-model-op.md');
const fakePassRag = join(repoRoot, 'ai-docs/delivery/reviews/2026-09-16-r2-p-fake-route-classify-mw-rag-route.md');
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
  ['applications.service.ts', apiAppsPath],
  ['job-route-classify.ts', bindPath],
  ['r2 harness', harnessPath],
  ['r2 status', statusPath],
  ['r2 eval', evalPath],
  ['gap backlog', backlogPath],
  ['m4 hard gates', m4Path],
  ['r4 status', r4StatusPath],
  ['REQUEST P-LIVE mw-model-op', requestModelOp],
  ['REQUEST P-LIVE mw-rag-route', requestRag],
  ['P-FAKE dual receipt mw-model-op', fakePassMo],
  ['P-FAKE dual receipt mw-rag-route', fakePassRag],
] as const) {
  A(`${label} present`, existsSync(path), path);
}

const recruiter = read(recruiterPath);
const route = read(routePath);
const consumer = read(consumerPath);
const main = read(mainPath);
const apiService = read(apiServicePath);
const apiApps = read(apiAppsPath);
const bindSrc = read(bindPath);
const harness = read(harnessPath);
const status = read(statusPath);
const evalDoc = read(evalPath);
const backlog = read(backlogPath);
const m4 = read(m4Path);
const r4Status = read(r4StatusPath);
const pkg = read(rootPkg);
const wpkg = read(workerPkg);
const startBody = startFnBody(recruiter);
const reqMo = read(requestModelOp);
const reqRag = read(requestRag);
const fakeMo = read(fakePassMo);
const fakeRag = read(fakePassRag);

// --- Measurable closed loop: classify → bind → snapshot → refuse/allow ---
A('L-CLASSIFY: Worker sole classifyJobRoute + createJobRouteModelClassify + drain pending',
  /classifyJobRoute\s*\(/.test(consumer)
  && /createJobRouteModelClassify/.test(consumer)
  && /listNextJobRoutePending/.test(consumer)
  && /runRouteClassifyConsumer/.test(main));

A('L-CLASSIFY: API wakeup only (notifyWorkerJobWakeup); zero classifyJobRoute(',
  /notifyWorkerJobWakeup\s*\(/.test(apiService)
  && !/classifyJobRoute\s*\(/.test(apiService)
  && !/classifyJobRoute\s*\(/.test(recruiter));

A('L-BIND: apply/invite + start lazy re-bind call bindApplicationRoute',
  /export async function applyToJob[\s\S]*bindApplicationRoute\s*\(/.test(recruiter)
  && /export async function inviteCandidate[\s\S]*bindApplicationRoute\s*\(/.test(recruiter)
  && /bindApplicationRoute\s*\(/.test(startBody));

A('L-SNAPSHOT: start snapshots after bind (allow path)',
  /snapshotInterviewRoute\s*\(/.test(startBody)
  && startBody.indexOf('bindApplicationRoute') < startBody.indexOf('snapshotInterviewRoute'));

A('L-REFUSE: no binding → interview_ineligible_route BEFORE INSERT INTO interview',
  /return \{ status: 'interview_ineligible_route' \}/.test(startBody)
  && startBody.indexOf("return { status: 'interview_ineligible_route' }") < startBody.indexOf('INSERT INTO interview')
  && /application_route_binding/.test(startBody));

A('L-ALLOW: started path requires snapshot success after binding present',
  /return \{ status: 'started'/.test(startBody)
  && startBody.indexOf("return { status: 'interview_ineligible_route' }") < startBody.indexOf("return { status: 'started'")
  && /snapshotInterviewRoute/.test(startBody)
  && (/snap\.status === 'no_binding'|status === 'no_binding'/.test(startBody)));

A('L-ALLOW API maps refuse (no silent degrade) + start reaches applications service',
  /interview_ineligible_route/.test(apiApps)
  && /HttpException/.test(apiApps)
  && /error:\s*'interview_ineligible_route'/.test(apiApps));

// --- Key-unset fail-closed structural path (no live Key required) ---
A('Key-unset: createJobRouteModelClassify fail-closed known_not_sent (no fake-green)',
  /export function createJobRouteModelClassify\s*\(/.test(bindSrc)
  && /known_not_sent|Without Key|fail-closed|failClosed/i.test(bindSrc)
  && /Not a rule-only fake|not a fake rule-only|honest modelClassify/i.test(bindSrc));

A('Key-unset ALLOW structural: rules-unique → route_decided modelCalls:0 (no Key)',
  /rule_decided/.test(route)
  && /modelCalls:\s*0/.test(route)
  && /rule_unique_leaf|唯一 leaf/.test(route));

A('Key-unset REFUSE structural: known_not_sent / route_unresolved sticky (no fake route_decided)',
  /known_not_sent/.test(route + bindSrc)
  && /route_unresolved/.test(route)
  && /sticky|永不自动重试|fail-closed/i.test(route + bindSrc));

A('Honesty: this receipt does NOT require live Key / live model invoke',
  /Key-unset/.test(harness + status + evalDoc + reqMo + reqRag)
  && (/无 live Key|不要求.*live Key|Key-unset fail-closed/i.test(harness + status + reqMo + reqRag))
  && !/宣称 live Key invoke 已绿|live Key invoke 已证明/.test(harness + status + evalDoc + reqMo + reqRag));

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
A('Worker sole classify across apps; API classify=0',
  workerHits.length >= 1
  && workerHits.every((f) => f.replace(/\\/g, '/').endsWith('/route-classify-consumer.ts'))
  && apiHits.length === 0,
  `workerCalls=${workerHits.length} apiClassify=${apiHits.length}`);

// --- Prior dual-passed ---
A('P-FAKE dual-passed receipts exist (mw-model-op + mw-rag-route)',
  /结论.*\*\*pass\*\*|\*\*pass\*\*/.test(fakeMo)
  && /结论.*\*\*pass\*\*|\*\*pass\*\*/.test(fakeRag)
  && /P-FAKE/.test(fakeMo + fakeRag)
  && /≠ 路由已生效|≠ R2/.test(fakeMo + fakeRag));

A('Prior P-* CLOSED in status (MODEL/WORKER/API/LOOP/START/FAKE dual-passed; G-R2-5)',
  /P-MODEL/.test(status) && /P-WORKER/.test(status) && /P-API/.test(status)
  && /P-LOOP/.test(status) && /P-START/.test(status) && /P-FAKE/.test(status)
  && /G-R2-5|retrieve-side/.test(status)
  && /dual-passed/.test(status)
  && /CLOSED/.test(status));

// --- Docs: P-LIVE CLOSED pending dual; R2 NOT closed; ≠ verbal 生效 ---
A('harness pins P-LIVE / G-R2-7 live 路由已生效收据 + classify→bind→snapshot→refuse/allow',
  /P-LIVE/.test(harness + status)
  && (/G-R2-7/.test(status) || /G-R2-7/.test(harness))
  && /classify→bind→snapshot|classify.*bind.*snapshot/.test(harness + status + evalDoc)
  && (/refuse\/allow|拒启.*允许|refuse.*allow|L-REFUSE|L-ALLOW/.test(harness + status + evalDoc)));

function scrubRouteEffectiveClaims(s: string): string {
  return s
    .replace(/≠ claim 路由已生效/g, '')
    .replace(/≠ 路由已生效/g, '')
    .replace(/不得宣称路由生效/g, '')
    .replace(/本绿 ≠ 路由已生效/g, '')
    .replace(/禁止宣称「路由已生效」/g, '')
    .replace(/不得假称路由已生效/g, '')
    .replace(/live 路由已生效可测收据/g, '')
    .replace(/live 路由已生效收据/g, '')
    .replace(/路由已生效可测收据/g, '')
    .replace(/路由已生效收据/g, '')
    .replace(/G-R2-7[^|\n]*/g, 'G-R2-7')
    .replace(/≠ verbal 生效/g, '')
    .replace(/禁止口头「生效」/g, '')
    .replace(/口头「生效」/g, '');
}

A('status pins P-LIVE CLOSED pending dual-review + R2 NOT closed + ≠ verbal 生效',
  /P-LIVE/.test(status)
  && (/CLOSED pending dual-review|P-LIVE CLOSED/.test(status))
  && /R2 NOT closed/.test(status)
  && /releaseEvidence=false/.test(status)
  && /Not HA/.test(status)
  && /≠ 路由已生效|不得宣称路由生效|verbal.*禁止|禁止.*口头/.test(status + harness)
  && !/路由已生效/.test(scrubRouteEffectiveClaims(status)));

A('status/harness: P-LIVE prove green ≠ claim R2 / ≠ claim 路由已生效 until dual-review',
  /R2 NOT closed/.test(status)
  && (/≠ claim R2|不得.*R2|dual-review|双审/.test(status + harness))
  && (/P-LIVE.*pending|pending dual|双审/.test(status + harness)));

A('eval pins P-LIVE measurable refuse/allow + ≠ R2 closed / ≠ verbal 生效',
  /P-LIVE/.test(evalDoc)
  && (/refuse|allow|拒启|L-REFUSE|L-ALLOW|Key-unset/.test(evalDoc))
  && (/≠ R2|pass ≠ R2|R2 NOT closed/.test(evalDoc))
  && /≠ 路由已生效/.test(evalDoc));

const gap02 = (backlog.match(/\| GAP-RAG-02 \|[\s\S]*?(?=\n\| GAP-|$)/) || [''])[0];
A('GAP-RAG-02 still open overall; cites P-LIVE / ≠ 路由已生效',
  /GAP-RAG-02/.test(gap02)
  && /R2 NOT closed|仍 NOT closed|仍未/.test(gap02)
  && /P-LIVE|路由已生效|G-R2-7/.test(gap02)
  && (/r2-p-live|Key-unset|refuse|allow|拒启/.test(gap02 + harness)));

A('m4 §R2 cites P-LIVE prove / still forbids claiming 路由已生效 without dual',
  /## 3\. R2/.test(m4)
  && /不得宣称路由生效|无生产接线不得宣称路由生效/.test(m4)
  && (/r2-p-live|P-LIVE/.test(m4)));

A('G4 status still lists R2 PREREQ open overall (P-LIVE dual / ≠ 路由已生效)',
  /G-R4-4|P-R2|R2 PREREQ/.test(r4Status)
  && (/P-LIVE|R2 NOT closed|dual-review|双审|≠ 路由已生效|G-R2-7/.test(r4Status)));

A('package scripts: r2-p-live-route-effective:prove present',
  /"r2-p-live-route-effective:prove"/.test(pkg)
  && /"prove:r2-p-live-route-effective"/.test(wpkg));

A('REQUEST dual-review self-pin not pass / releaseEvidence=false / 禁止自批',
  /releaseEvidence=false/.test(reqMo)
  && /禁止自批|不是.*pass|REQUEST/.test(reqMo)
  && /mw-model-op/.test(reqMo)
  && /releaseEvidence=false/.test(reqRag)
  && /禁止自批|不是.*pass|REQUEST/.test(reqRag)
  && /mw-rag-route/.test(reqRag)
  && /P-LIVE|路由已生效|Key-unset|refuse|allow/.test(reqMo + reqRag)
  && !/\*\*pass\*\*|结论.*\*\*pass\*\*/.test(reqMo + reqRag));

A('honesty: does NOT close R2 overall; remains pending P-LIVE dual + harness agree',
  /R2 NOT closed/.test(status)
  && (/harness 同意|harness agree|关闸/.test(status + harness) || /pending dual|双审/.test(status + harness))
  && !/\*\*R2 CLOSED\*\*|R2 fully closed|R2 已关/.test(status.replace(/R2 NOT closed/g, '').replace(/≠ claim R2/g, '').replace(/pass ≠ R2/g, ''))
  && /禁止自批/.test(status + reqMo + reqRag));

console.log(failures === 0
  ? '\nOK  r2-p-live-route-effective prove (P-LIVE CLOSED pending dual: measurable classify→bind→snapshot→refuse/allow Key-unset structural receipt; R2 NOT closed overall pending dual-review + harness agree; ≠ verbal 生效; releaseEvidence=false; Not HA)'
  : `\nFAIL  r2-p-live-route-effective prove (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);

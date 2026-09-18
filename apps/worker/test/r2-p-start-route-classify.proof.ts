/**
 * R2 P-START — real refuse-start wire (unresolved route at interview start).
 * releaseEvidence=false · Not HA · ≠ claim R2 fully closed until dual-review + receipts
 * ≠ 路由已生效 · ≠ R4 · no flip default · no open DELETE · no self-approve
 *
 * Wire: startApplicationInterview bind → no binding ⇒ interview_ineligible_route (fail-closed).
 * Measurable equivalent of unresolved_route_start_count=0: started path requires snapshot success;
 * unresolved never returns started / never creates interview without binding.
 * Prior honesty PREREQ superseded by this real wire (P-START CLOSED pending dual-review only).
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
const apiServicePath = join(appsRoot, 'api', 'src', 'modules', 'jobs', 'applications.service.ts');
const consumerPath = join(appsRoot, 'worker', 'src', 'route-classify-consumer.ts');
const bindPath = join(repoRoot, 'packages/ai-runtime/src/job-route-classify.ts');
const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/r2-classify-job-route.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r2-classify-job-route-status.md');
const evalPath = join(repoRoot, 'ai-docs/delivery/eval/r2-classify-job-route.eval.md');
const backlogPath = join(repoRoot, 'ai-docs/delivery/gap-bug-backlog.md');
const m4Path = join(repoRoot, 'ai-docs/delivery/m4-rag-hard-gates.md');
const r4StatusPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation-status.md');
const ucPath = join(repoRoot, 'ai-docs/requirements/use-cases/rag-funnel-intent-routing.md');
const archPath = join(repoRoot, 'ai-docs/architecture/ai/rag-funnel-routing.md');
const requestModelOp = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-start-route-classify-mw-model-op.md');
const requestRag = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-start-route-classify-mw-rag-route.md');
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
  ['applications.service.ts', apiServicePath],
  ['route-classify-consumer.ts', consumerPath],
  ['job-route-classify.ts', bindPath],
  ['r2 harness', harnessPath],
  ['r2 status', statusPath],
  ['r2 eval', evalPath],
  ['gap backlog', backlogPath],
  ['m4 hard gates', m4Path],
  ['r4 status', r4StatusPath],
  ['UC rag-funnel-intent-routing', ucPath],
  ['arch rag-funnel-routing', archPath],
  ['REQUEST P-START mw-model-op', requestModelOp],
  ['REQUEST P-START mw-rag-route', requestRag],
] as const) {
  A(`${label} present`, existsSync(path), path);
}

const recruiter = read(recruiterPath);
const route = read(routePath);
const apiSvc = read(apiServicePath);
const consumer = read(consumerPath);
const bindSrc = read(bindPath);
const harness = read(harnessPath);
const status = read(statusPath);
const evalDoc = read(evalPath);
const backlog = read(backlogPath);
const m4 = read(m4Path);
const r4Status = read(r4StatusPath);
const uc = read(ucPath);
const arch = read(archPath);
const pkg = read(rootPkg);
const wpkg = read(workerPkg);
const startBody = startFnBody(recruiter);
const reqMo = read(requestModelOp);
const reqRag = read(requestRag);
const startResultType = (() => {
  const m = recruiter.match(/export type StartApplicationResult\s*=[\s\S]*?interview_ineligible_route[\s\S]*?;/);
  return m ? m[0] : '';
})();

// --- UC / contract ---
A('UC/arch pin interview_ineligible_route for unresolved route',
  /interview_ineligible_route/.test(uc + arch));
A('arch/UC pin unresolved_route_start_count = 0 (never start unresolved)',
  /unresolved_route_start_count\s*=\s*0|unresolved_route_start_count = 0/.test(arch)
  || /unresolved_route_start_count/.test(uc + arch + harness + status));
A('snapshotInterviewRoute contract: no_binding → caller MUST refuse start',
  /no_binding/.test(route)
  && /必须拒绝启动|refuse|拒启动|避免消费未决/.test(route));

// --- Real P-START wire ---
A('P-LOOP order retained: start binds THEN snapshots',
  /bindApplicationRoute\s*\(/.test(startBody)
  && /snapshotInterviewRoute\s*\(/.test(startBody)
  && startBody.indexOf('bindApplicationRoute') < startBody.indexOf('snapshotInterviewRoute'));
A('P-START wire: StartApplicationResult includes interview_ineligible_route',
  /export type StartApplicationResult\s*=/.test(recruiter)
  && /interview_ineligible_route/.test(startResultType));
A('P-START wire: no binding → return interview_ineligible_route (fail-closed)',
  /return \{ status: 'interview_ineligible_route' \}/.test(startBody)
  && /application_route_binding/.test(startBody)
  && startBody.indexOf('bindApplicationRoute') < startBody.indexOf("return { status: 'interview_ineligible_route' }")
  && startBody.indexOf("return { status: 'interview_ineligible_route' }") < startBody.indexOf('INSERT INTO interview'));
A('P-START wire: refuse before interview insert (unresolved_route_start_count=0 equivalent)',
  startBody.indexOf("return { status: 'interview_ineligible_route' }") < startBody.indexOf('INSERT INTO interview')
  && /真拒启|fail-closed|interview_ineligible_route/.test(startBody)
  && !/优雅降级/.test(startBody));
A('P-START wire: snapshot no_binding aborts (belt-and-suspenders rollback)',
  /snap\.status === 'no_binding'|status === 'no_binding'/.test(startBody)
  && /throw/.test(startBody));
A('API maps interview_ineligible_route → HttpException (no silent degrade)',
  /interview_ineligible_route/.test(apiSvc)
  && /HttpException/.test(apiSvc)
  && /error:\s*'interview_ineligible_route'/.test(apiSvc));
A('recruiter never inline classifyJobRoute( (Worker sole)',
  !/classifyJobRoute\s*\(/.test(recruiter));

// --- Prior closed PREREQs still hold ---
A('P-WORKER sole consumer still classifyJobRoute + MODEL-OP',
  /classifyJobRoute\s*\(/.test(consumer) && /createJobRouteModelClassify/.test(consumer));
A('MODEL-OP Key-unset fail-closed still on model path',
  /export function createJobRouteModelClassify\s*\(/.test(bindSrc)
  && /known_not_sent|Without Key|fail-closed|failClosed/i.test(bindSrc));

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
A('Worker sole classify; API classify=0',
  workerHits.length >= 1
  && workerHits.some((f) => f.replace(/\\/g, '/').endsWith('/route-classify-consumer.ts'))
  && apiHits.length === 0,
  `workerCalls=${workerHits.length} apiClassify=${apiHits.length}`);

// --- Docs: P-START CLOSED pending dual-review; R2 NOT closed overall ---
A('harness pins P-START real refuse wire / CLOSED (dual-passed or pending dual)',
  /P-START/.test(harness)
  && (/真拒启|interview_ineligible_route|fail-closed|拒启/.test(harness + status))
  && (/P-START CLOSED|P-START.*CLOSED|dual-passed|pending dual-review|待双审/.test(harness + status))
  && /unresolved_route_start_count/.test(harness + status + arch));
A('status pins G-R2-4 CLOSED (wire) + R2 NOT closed overall + ≠ 路由已生效',
  /G-R2-4/.test(status)
  && /P-START/.test(status)
  && /R2 NOT closed/.test(status)
  && /releaseEvidence=false/.test(status)
  && /Not HA/.test(status)
  && /≠ 路由已生效|不得宣称路由生效/.test(status + harness)
  && (/CLOSED|已关|真拒启/.test(status)));
A('status/harness pin R2 overall remains open (P-LIVE / P-FAKE / dual-review / ≠ 路由已生效)',
  (/P-FAKE|P-LIVE|G-R2-5|G-R2-7|dual-review|双审/.test(harness + status))
  && /R2 NOT closed/.test(status)
  && (/≠ claim R2|不得.*R2.*关|≠ 路由已生效/.test(status + harness)));
A('eval pins P-START refuse wire + ≠ R2 / ≠ 路由已生效',
  /P-START/.test(evalDoc)
  && (/interview_ineligible_route|真拒启|fail-closed/.test(evalDoc))
  && (/≠ R2|pass ≠ R2|R2 NOT closed/.test(evalDoc))
  && /≠ 路由已生效/.test(evalDoc));

const gap02 = (backlog.match(/\| GAP-RAG-02 \|[\s\S]*?(?=\n\| GAP-|$)/) || [''])[0];
A('GAP-RAG-02 still open overall; cites P-START wire + R2 remainder',
  /GAP-RAG-02/.test(gap02)
  && /R2 NOT closed|仍 NOT closed|仍未/.test(gap02)
  && /P-START/.test(gap02)
  && (/interview_ineligible|真拒启|fail-closed|P-FAKE|dual-review|双审/.test(gap02)));
A('m4 §R2 cites P-START prove / still forbids 路由已生效',
  /## 3\. R2/.test(m4)
  && /不得宣称路由生效|无生产接线不得宣称路由生效/.test(m4)
  && (/r2-p-start|P-START/.test(m4)));
A('G4 status still lists R2 PREREQ open overall (dual-review / remainder)',
  /G-R4-4|P-R2|R2 PREREQ/.test(r4Status)
  && (/P-START|R2 NOT closed|dual-review|双审|G-R2-5|P-FAKE/.test(r4Status)));

A('package scripts: r2-p-start-route-classify:prove present',
  /"r2-p-start-route-classify:prove"/.test(pkg)
  && /"prove:r2-p-start-route-classify"/.test(wpkg));

A('REQUEST dual-review self-pin not pass / releaseEvidence=false / 禁止自批',
  /releaseEvidence=false/.test(reqMo)
  && /禁止自批|不是.*pass|REQUEST/.test(reqMo)
  && /mw-model-op/.test(reqMo)
  && /releaseEvidence=false/.test(reqRag)
  && /禁止自批|不是.*pass|REQUEST/.test(reqRag)
  && /mw-rag-route/.test(reqRag)
  && /真拒启|interview_ineligible_route|fail-closed/.test(reqMo + reqRag)
  && !/\*\*pass\*\*|结论.*\*\*pass\*\*/.test(reqMo + reqRag));

A('no fake-green: forbid claiming R2 closed / 路由已生效; P-START dual-passed ok when receipts exist',
  /P-FAKE|假绿|禁止.*路由已生效|≠ 路由已生效/.test(harness + status)
  && /R2 NOT closed/.test(status)
  && !/路由已生效/.test(status
    .replace(/≠ claim 路由已生效/g, '')
    .replace(/≠ claim route-effective/g, '')
    .replace(/≠ 路由已生效/g, '')
    .replace(/不得宣称路由生效/g, '')
    .replace(/本绿 ≠ 路由已生效/g, '')
    .replace(/禁止宣称「路由已生效」/g, '')
    .replace(/不得假称路由已生效/g, '')
    .replace(/候选「路由已生效收据」/g, '')
    .replace(/候选 live-effective 收据/g, '')
    .replace(/live 路由已生效收据/g, '')
    .replace(/路由已生效收据/g, ''))
  && /禁止自批/.test(status + reqMo + reqRag)
  && (/dual-passed|P-FAKE CLOSED|P-LIVE|≠ 路由已生效/.test(status)));

A('prior P-MODEL/P-WORKER/P-API/P-LOOP remain CLOSED; R2 held by remainder not missing refuse',
  /P-MODEL/.test(status) && /P-WORKER/.test(status) && /P-API/.test(status) && /P-LOOP/.test(status)
  && /CLOSED/.test(status)
  && /R2 NOT closed/.test(status)
  && /P-START/.test(status));

console.log(failures === 0
  ? '\nOK  r2-p-start-route-classify prove (P-START real refuse-start: interview_ineligible_route; unresolved never starts; R2 NOT closed overall pending P-LIVE dual + ≠路由已生效/harness gates; releaseEvidence=false; Not HA)'
  : `\nFAIL  r2-p-start-route-classify prove (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);

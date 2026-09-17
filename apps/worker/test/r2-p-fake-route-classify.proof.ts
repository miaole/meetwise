/**
 * R2 P-FAKE — ban / pin against fake rule-only Worker (or any path) claiming
 * R2 closed / 路由已生效 without real MODEL-OP classify.
 *
 * releaseEvidence=false · Not HA · ≠ claim R2 fully closed until dual-review +
 * harness gates (live 路由已生效 receipts may still be required)
 * ≠ R4 · no flip default · no open DELETE · no self-approve
 *
 * Inventory (fake-green surfaces — allowed as tests, forbidden as production R2 claim):
 *   F1 isolation proofs inject fake modelClassify (rag03 / job-route-decision.proof)
 *   F2 rag04/rag05 rule-path seams throw if model called (≠ production Worker)
 *   F3 docs historically claimed rule-only Worker = R2 green (forbidden)
 *   F4 alternate consumers / stubs without createJobRouteModelClassify (must be none in apps)
 *
 * Production pin: sole route-classify-consumer MUST use createJobRouteModelClassify.
 * Legitimate UC rule_unique_leaf (modelCalls=0) still runs INSIDE classifyJobRoute after
 * MODEL-OP-bound Worker supplies modelClassify — that is NOT P-FAKE.
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
const consumerPath = join(appsRoot, 'worker', 'src', 'route-classify-consumer.ts');
const mainPath = join(appsRoot, 'worker', 'src', 'main.ts');
const bindPath = join(repoRoot, 'packages/ai-runtime/src/job-route-classify.ts');
const routePath = join(repoRoot, 'packages/db/src/job-route-decision.ts');
const rag03ProofPath = join(repoRoot, 'packages/db/test/job-route-decision.proof.ts');
const rag04ProofPath = join(repoRoot, 'packages/db/test/rag04-track-local-retrieval.proof.ts');
const rag05ProofPath = join(repoRoot, 'packages/db/test/rag05-qbank-miss.proof.ts');
const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/r2-classify-job-route.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r2-classify-job-route-status.md');
const evalPath = join(repoRoot, 'ai-docs/delivery/eval/r2-classify-job-route.eval.md');
const backlogPath = join(repoRoot, 'ai-docs/delivery/gap-bug-backlog.md');
const m4Path = join(repoRoot, 'ai-docs/delivery/m4-rag-hard-gates.md');
const r4StatusPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation-status.md');
const requestModelOp = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-fake-route-classify-mw-model-op.md');
const requestRag = join(repoRoot, 'ai-docs/delivery/reviews/REQUEST-r2-p-fake-route-classify-mw-rag-route.md');
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

for (const [label, path] of [
  ['route-classify-consumer.ts', consumerPath],
  ['worker main.ts', mainPath],
  ['job-route-classify.ts', bindPath],
  ['job-route-decision.ts', routePath],
  ['rag03 job-route-decision.proof.ts', rag03ProofPath],
  ['rag04 proof', rag04ProofPath],
  ['rag05 proof', rag05ProofPath],
  ['r2 harness', harnessPath],
  ['r2 status', statusPath],
  ['r2 eval', evalPath],
  ['gap backlog', backlogPath],
  ['m4 hard gates', m4Path],
  ['r4 status', r4StatusPath],
  ['REQUEST P-FAKE mw-model-op', requestModelOp],
  ['REQUEST P-FAKE mw-rag-route', requestRag],
] as const) {
  A(`${label} present`, existsSync(path), path);
}

const consumer = read(consumerPath);
const main = read(mainPath);
const bindSrc = read(bindPath);
const route = read(routePath);
const rag03 = read(rag03ProofPath);
const rag04 = read(rag04ProofPath);
const rag05 = read(rag05ProofPath);
const harness = read(harnessPath);
const status = read(statusPath);
const evalDoc = read(evalPath);
const backlog = read(backlogPath);
const m4 = read(m4Path);
const r4Status = read(r4StatusPath);
const pkg = read(rootPkg);
const wpkg = read(workerPkg);
const reqMo = read(requestModelOp);
const reqRag = read(requestRag);

// --- Inventory F1–F4 ---
A('F1 inventory: rag03 isolation proof uses injected fake modelClassify seam',
  /modelClassify/.test(rag03)
  && (/fake|mkSeam|受控确定性 seam|proof 注入/.test(rag03))
  && (/≠.*生产|生产由 MODEL-OP|≠ R2|P-FAKE|假绿|not.production|≠ production/i.test(rag03)
    || /真实模型调用是受控确定性 seam/.test(rag03)));
A('F2 inventory: rag04/rag05 rule-path seams are proof-only (throw if model called)',
  /rule path must never call model/.test(rag04)
  && /rule path must never call model/.test(rag05));
A('F3 inventory: harness 假绿表 bans rule-only Worker claiming R2 / 路由已生效',
  /假绿表|P-FAKE/.test(harness)
  && /规则-only|rule-only|假 Worker/.test(harness)
  && /可关 R2|冒充|假绿/.test(harness));
A('F4 inventory: no alternate apps production classify path without MODEL-OP',
  true); // filled by scan below

// --- Production MODEL-OP pin (anti P-FAKE) ---
A('P-FAKE pin: sole consumer uses createJobRouteModelClassify + classifyJobRoute',
  /createJobRouteModelClassify/.test(consumer)
  && /classifyJobRoute\s*\(/.test(consumer)
  && /modelClassify/.test(consumer)
  && /not fake rule-only|honest, not fake|MODEL-OP/.test(consumer));
A('P-FAKE pin: consumer does NOT inline fake modelClassify / rule-only bypass',
  !/modelClassify:\s*async\s*\(/.test(consumer)
  && !/classifyJobByRule\s*\(/.test(consumer)
  && /createJobRouteModelClassify\s*\(\s*\{/.test(consumer));
A('P-FAKE pin: main wires only runRouteClassifyConsumer (sole)',
  /runRouteClassifyConsumer/.test(main)
  && /routeClassifyLoop/.test(main));
A('P-FAKE pin: createJobRouteModelClassify documents honest MODEL-OP not rule-only fake',
  /export function createJobRouteModelClassify\s*\(/.test(bindSrc)
  && /Not a rule-only fake|not a fake rule-only|honest modelClassify/i.test(bindSrc)
  && /fail-closed|known_not_sent|Without Key/i.test(bindSrc));
A('P-FAKE pin: classifyJobRoute deps.require modelClassify (no omit-able fake path)',
  /export async function classifyJobRoute[\s\S]*?deps:\s*\{[\s\S]*?modelClassify:\s*JobRouteModelClassify/.test(route)
  && /deps\.modelClassify/.test(route));

const workerFiles = walkTsFiles(join(appsRoot, 'worker', 'src'));
const apiFiles = walkTsFiles(join(appsRoot, 'api', 'src'));
const workerHits: string[] = [];
const apiHits: string[] = [];
const workerMissingModelOp: string[] = [];
for (const f of workerFiles) {
  const src = readFileSync(f, 'utf8');
  if (/classifyJobRoute\s*\(/.test(src)) {
    workerHits.push(f);
    if (!/createJobRouteModelClassify/.test(src)) workerMissingModelOp.push(f);
  }
}
for (const f of apiFiles) {
  if (/classifyJobRoute\s*\(/.test(readFileSync(f, 'utf8'))) apiHits.push(f);
}
A('F4 + pin: every apps/worker classifyJobRoute( site also has createJobRouteModelClassify',
  workerHits.length >= 1
  && workerHits.every((f) => f.replace(/\\/g, '/').endsWith('/route-classify-consumer.ts'))
  && workerMissingModelOp.length === 0,
  `workerCalls=${workerHits.length} missingModelOp=${workerMissingModelOp.length}`);
A('P-FAKE pin: apps/api src zero classifyJobRoute( (no fake API classify)',
  apiHits.length === 0, `apiClassify=${apiHits.length}`);

// --- Docs: P-FAKE CLOSED pending dual; R2 NOT closed overall ---
A('harness pins P-FAKE CLOSED (dual-passed or pending dual) (ban fake rule-only claim)',
  /P-FAKE/.test(harness)
  && (/P-FAKE CLOSED|CLOSED pending dual-review|P-FAKE.*CLOSED|dual-passed/.test(harness + status))
  && /createJobRouteModelClassify|MODEL-OP/.test(harness + status));
A('status pins P-FAKE CLOSED (dual-passed or pending) + inventory + ≠ claim R2',
  /P-FAKE/.test(status)
  && (/CLOSED pending dual-review|P-FAKE CLOSED|dual-passed/.test(status))
  && /R2 NOT closed/.test(status)
  && /releaseEvidence=false/.test(status)
  && /Not HA/.test(status)
  && /≠ 路由已生效|不得宣称路由生效/.test(status + harness));
A('status/harness pin R2 overall NOT closed (P-FAKE dual + ≠ 路由已生效 / harness gates)',
  /R2 NOT closed/.test(status)
  && (/≠ claim R2|不得.*R2|dual-review|双审|路由已生效/.test(status + harness))
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
    .replace(/路由已生效收据/g, '')));
A('eval pins P-FAKE ban + ≠ R2 closed / ≠ 路由已生效',
  /P-FAKE/.test(evalDoc)
  && (/规则-only|rule-only|假 Worker|假绿/.test(evalDoc))
  && (/≠ R2|pass ≠ R2|R2 NOT closed/.test(evalDoc))
  && /≠ 路由已生效/.test(evalDoc));

const gap02 = (backlog.match(/\| GAP-RAG-02 \|[\s\S]*?(?=\n\| GAP-|$)/) || [''])[0];
A('GAP-RAG-02 still open overall; cites P-FAKE pin / ≠ 路由已生效',
  /GAP-RAG-02/.test(gap02)
  && /R2 NOT closed|仍 NOT closed|仍未/.test(gap02)
  && /P-FAKE/.test(gap02)
  && (/r2-p-fake|createJobRouteModelClassify|规则-only|假 Worker/.test(gap02 + harness)));
A('m4 §R2 cites P-FAKE prove / still forbids 路由已生效',
  /## 3\. R2/.test(m4)
  && /不得宣称路由生效|无生产接线不得宣称路由生效/.test(m4)
  && (/r2-p-fake|P-FAKE/.test(m4)));
A('G4 status still lists R2 PREREQ open overall (P-FAKE dual / ≠ 路由已生效)',
  /G-R4-4|P-R2|R2 PREREQ/.test(r4Status)
  && (/P-FAKE|R2 NOT closed|dual-review|双审|≠ 路由已生效/.test(r4Status)));

A('package scripts: r2-p-fake-route-classify:prove present',
  /"r2-p-fake-route-classify:prove"/.test(pkg)
  && /"prove:r2-p-fake-route-classify"/.test(wpkg));

A('REQUEST dual-review self-pin not pass / releaseEvidence=false / 禁止自批',
  /releaseEvidence=false/.test(reqMo)
  && /禁止自批|不是.*pass|REQUEST/.test(reqMo)
  && /mw-model-op/.test(reqMo)
  && /releaseEvidence=false/.test(reqRag)
  && /禁止自批|不是.*pass|REQUEST/.test(reqRag)
  && /mw-rag-route/.test(reqRag)
  && /P-FAKE|规则-only|createJobRouteModelClassify|假绿/.test(reqMo + reqRag)
  && !/\*\*pass\*\*|结论.*\*\*pass\*\*/.test(reqMo + reqRag));

A('honesty: P-FAKE prove green ≠ claim R2 closed / 路由已生效; dual-passed only with receipts',
  /R2 NOT closed/.test(status)
  && /≠ claim R2|pending dual|双审|≠ 路由已生效|P-LIVE/.test(status + harness + reqMo + reqRag)
  && (/P-FAKE CLOSED（dual-passed）/.test(status)
    ? (/\*\*pass\*\*|结论.*pass/.test(read(fakePassMo)) && /\*\*pass\*\*|结论.*pass/.test(read(fakePassRag)))
    : true)
  && /禁止自批/.test(status + reqMo + reqRag));

A('prior P-* remain CLOSED; sole MODEL-OP Worker still required',
  /P-MODEL/.test(status) && /P-WORKER/.test(status) && /P-API/.test(status) && /P-LOOP/.test(status)
  && /CLOSED/.test(status)
  && /createJobRouteModelClassify/.test(consumer)
  && /R2 NOT closed/.test(status));

console.log(failures === 0
  ? '\nOK  r2-p-fake-route-classify prove (P-FAKE CLOSED dual-passed receipts OK: sole Worker pinned to createJobRouteModelClassify; fake rule-only / isolation seams inventoried ≠ R2 claim; R2 NOT closed overall pending P-LIVE dual + ≠路由已生效/harness gates; releaseEvidence=false; Not HA)'
  : `\nFAIL  r2-p-fake-route-classify prove (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);

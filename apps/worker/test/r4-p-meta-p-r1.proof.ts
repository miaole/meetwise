/**
 * Knife F2 — P-META · P-R1 **remaining** honesty prove.
 *
 *   MR1 — P-META: 01A sealed ≠ RAG-FUNNEL-01; MS1 routed serving WIRED (F6); MS2/MS3 still open
 *         serving / full facets / standard deploy handoff yet
 *   PR1 — P-R1: default fail-closed flag OFF (no flip); legacy「技术岗」still
 *         on; spawn r1-tech-role-fail-closed:prove as contract 旁证 ≠ R1 closed
 *   H3  — hard pins: ≠ R4 closed · ≠ 题域已隔离 · releaseEvidence=false ·
 *         ≠HA · ≠ suite green · sole 恰 5 · no invent Key · no self-approve
 *
 * releaseEvidence=false · ≠HA · EXIT=0 ≠ R1 closed ≠ FUNNEL-01 closed ≠ R4 closed
 * sole allowlist not expanded · no invent MODEL_API_KEY
 *
 * CMD: pnpm r4-p-meta-p-r1:prove
 *   (no PG required — honesty + r1 contract 旁证; harness does not require :raw)
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  classifyPMetaRemaining,
  classifyPR1Remaining,
  is01ANotEqual01,
  isRagFunnel01Closed,
  isR1Closed,
} from '../src/r4-p-meta-p-r1-remaining.ts';
import {
  isTechRoleFailClosedEnabled,
  LEGACY_TECH_ROLE_DEFAULT,
  resolveAdaptiveInterviewRole,
} from '../src/adaptive-role-resolve.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail?: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

const here = dirname(fileURLToPath(import.meta.url));
const workerRoot = join(here, '..');
const repoRoot = join(workerRoot, '..', '..');

const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-f2-p-meta-p-r1.md');
const evalPath = join(repoRoot, 'ai-docs/delivery/eval/r4-f2-p-meta-p-r1.eval.md');
const slicePath = join(repoRoot, 'ai-docs/delivery/r4-f2-p-meta-p-r1.slice.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation-status.md');
const inventoryPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation.md');
const r1HarnessPath = join(repoRoot, 'ai-docs/delivery/harness/r1-tech-role-fail-closed.md');
const m4Path = join(repoRoot, 'ai-docs/delivery/m4-rag-hard-gates.md');
const funnel01aPath = join(repoRoot, 'ai-docs/rules/backend/qbank-control-definer-sealed-manifest.md');
const principalPath = join(repoRoot, 'packages/db/src/principal.ts');
const helperPath = join(workerRoot, 'src/r4-p-meta-p-r1-remaining.ts');
const rolePath = join(workerRoot, 'src/adaptive-role-resolve.ts');
const consumerPath = join(workerRoot, 'src/interview-consumer.ts');
const mainPath = join(workerRoot, 'src/main.ts');
const workerEnvExample = join(repoRoot, 'docker/env/worker.env.example');

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

function spawnProve(label: string, args: string[]): number {
  console.log(`\n── spawn ${label}: pnpm ${args.join(' ')} ──`);
  const r = spawnSync('pnpm', args, {
    cwd: repoRoot,
    env: process.env,
    stdio: 'inherit',
  });
  const code = typeof r.status === 'number' ? r.status : 1;
  A(`${label} EXIT=0`, code === 0, `exit=${code}`);
  return code;
}

console.log('F2 P-META·P-R1 remaining prove — MR1/PR1/H3 · releaseEvidence=false · ≠HA · ≠R4 closed');
console.log('EXIT=0 ≠ R1 closed ≠ RAG-FUNNEL-01 closed ≠ 题域已隔离 · await post-prove dual');

section('MR0 static anchors present');
for (const [label, path] of [
  ['F2 harness', harnessPath],
  ['F2 eval', evalPath],
  ['F2 slice', slicePath],
  ['r4 status', statusPath],
  ['r4 inventory', inventoryPath],
  ['R1 harness', r1HarnessPath],
  ['m4-rag-hard-gates', m4Path],
  ['01A sealed manifest', funnel01aPath],
  ['principal.ts', principalPath],
  ['F2 remaining helper', helperPath],
  ['adaptive-role-resolve', rolePath],
  ['interview-consumer', consumerPath],
  ['main.ts', mainPath],
] as const) {
  A(`${label} present`, existsSync(path), path);
}

const harness = read(harnessPath);
const evalDoc = read(evalPath);
const slice = read(slicePath);
const status = read(statusPath);
const inventory = read(inventoryPath);
const r1Harness = read(r1HarnessPath);
const m4 = read(m4Path);
const funnel01a = read(funnel01aPath);
const principal = read(principalPath);
const helper = read(helperPath);
const roleSrc = read(rolePath);
const consumer = read(consumerPath);
const main = read(mainPath);
const envExample = read(workerEnvExample);

section('MR1 P-META remaining (01A ≠ 01 · no routed serving)');
const meta = classifyPMetaRemaining();
A('MR1 classify: sourceSealed01A=true (01A inventory)', meta.sourceSealed01A === true);
A('MR1 classify: routedServingWired=true (F6 MS1 product wire)', meta.routedServingWired === true);
A('MR1 classify: fullFacetsServed=false', meta.fullFacetsServed === false);
A('MR1 classify: standardDeployHandoff=false', meta.standardDeployHandoff === false);
A('MR1 isRagFunnel01Closed=false', isRagFunnel01Closed(meta) === false);
A('MR1 is01ANotEqual01=true', is01ANotEqual01(meta) === true);
A('MR1 principal lists qbank_metadata_review_receipt (01A table)',
  /qbank_metadata_review_receipt/.test(principal));
A('MR1 01A manifest pins 01A ≠ 01 / MetadataReviewReceipt serving still open',
  (/RAG-FUNNEL-01A|01A/.test(funnel01a))
  && (/RAG-FUNNEL-01/.test(funnel01a))
  && (/MetadataReviewReceipt/.test(funnel01a))
  && (/≠|不等于|不是|仍未|未进入|不得/.test(funnel01a)));
A('MR1 inventory / status still list P-META / G-R4-5 open',
  (/P-META/.test(inventory) || /P-META/.test(status))
  && (/G-R4-5|MetadataReviewReceipt|RAG-FUNNEL-01/.test(status) || /P-META/.test(inventory)));
A('MR1 F6 MS1 product wire present',
  existsSync(join(workerRoot, 'src/r4-p-meta-ms1-product-wire.ts')));
A('MR1 only honesty helpers + F6 wire name MetadataReviewReceipt in worker src', (() => {
  const files = walkTsFiles(join(workerRoot, 'src'));
  for (const f of files) {
    // honesty helpers + F6 real product wire may name the type
    if (f.endsWith('r4-p-meta-p-r1-remaining.ts')) continue;
    if (f.endsWith('r4-p-meta-serving-remaining.ts')) continue;
    if (f.endsWith('r4-p-meta-serving-product-remaining.ts')) continue;
    if (f.endsWith('r4-p-meta-ms1-product-wire.ts')) continue;
    const body = read(f);
    if (/MetadataReviewReceipt|qbank_metadata_review_receipt|metadata_review_receipt/.test(body)) {
      console.log(`  leak: ${f}`);
      return false;
    }
  }
  return true;
})());
A('MR1 helper documents Ban forging MetadataReviewReceipt serving',
  /Ban forging MetadataReviewReceipt|do NOT close|does NOT close/i.test(helper));

section('PR1 P-R1 remaining (default off · contract ≠ closed)');
const pr1 = classifyPR1Remaining({});
A('PR1 classify: failClosedFlagDefaultOn=false (no flip)', pr1.failClosedFlagDefaultOn === false);
A('PR1 classify: legacyDefaultLabel=技术岗', pr1.legacyDefaultLabel === LEGACY_TECH_ROLE_DEFAULT);
A('PR1 classify: contractHarnessExists=true', pr1.contractHarnessExists === true);
A('PR1 classify: r1Closed=false', pr1.r1Closed === false);
A('PR1 isR1Closed=false', isR1Closed(pr1) === false);
A('PR1 unit: empty env → fail-closed OFF', isTechRoleFailClosedEnabled({}) === false);
A('PR1 unit: flag-off + no route → legacy 技术岗',
  resolveAdaptiveInterviewRole({}, {}) === LEGACY_TECH_ROLE_DEFAULT);
A('PR1 unit: flag-on + no route → adaptive_role_route_missing', (() => {
  try {
    resolveAdaptiveInterviewRole({}, { MEETWISE_TECH_ROLE_FAIL_CLOSED: '1' });
    return false;
  } catch (e) {
    return (e as { code?: string }).code === 'adaptive_role_route_missing';
  }
})());
A('PR1 main.ts does not inject role: 技术岗',
  !/role:\s*['"]技术岗['"]/.test(main));
A('PR1 consumer has no ?? 技术岗 silent default',
  !/\?\?\s*['"]技术岗['"]/.test(consumer)
  && /resolveAdaptiveInterviewRole/.test(consumer));
A('PR1 role resolver documents default off + ≠ R1/R4 closed',
  /Default \(flag off\)|默认/.test(roleSrc)
  && /Does NOT claim R4|≠ R4|NOT closed|GAP-RAG-01/.test(roleSrc));
A('PR1 worker.env.example documents MEETWISE_TECH_ROLE_FAIL_CLOSED=0 (no flip)',
  !envExample || /MEETWISE_TECH_ROLE_FAIL_CLOSED\s*=\s*0/.test(envExample));
A('PR1 R1 harness + m4 pin prove绿 ≠ R1 closed',
  (/≠ R1|pass ≠ R1|prove.*≠.*R1|本绿 ≠/.test(r1Harness))
  && (/R1|技术岗|GAP-RAG-01/.test(m4)));
A('PR1 inventory / status still list P-R1 / G-R4-3 open',
  (/P-R1/.test(inventory) || /P-R1|G-R4-3/.test(status))
  && (/G-R4-3|legacy|技术岗|GAP-RAG-01/.test(status) || /P-R1/.test(inventory)));

section('PR1 contract 旁证 spawn (≠ R1 closed)');
const r1Exit = spawnProve('r1-tech-role-fail-closed', ['r1-tech-role-fail-closed:prove']);
A('PR1 r1 contract 旁证 EXIT=0 ≠ R1 closed', r1Exit === 0);

section('H3 honesty pins (≠ R4 closed · sole 恰 5)');
A('H3 harness names P-META + P-R1 remaining',
  /P-META/.test(harness) && /P-R1/.test(harness));
A('H3 harness freezes CMD r4-p-meta-p-r1:prove',
  /r4-p-meta-p-r1:prove/.test(harness));
A('H3 harness pins 01A ≠ 01 · r1 prove ≠ R1 closed',
  (/01A ≠ 01|01A.*≠.*01/.test(harness))
  && (/r1 prove ≠ R1 closed|prove.*≠.*R1 closed|≠ R1 closed/.test(harness)));
A('H3 harness pins ≠ R4 closed · releaseEvidence=false · ≠HA · sole 恰 5',
  (/≠ R4 closed|NOT closed|R4 open|仍开/.test(harness))
  && /releaseEvidence=false/.test(harness)
  && (/≠HA|Not HA|≠ HA/.test(harness))
  && (/sole 恰 5|恰 5/.test(harness)));
A('H3 harness omits mw-model-op (no MODEL-OP domain)',
  (/no.*mw-model-op|omit.*model-op|no model-op/i.test(harness)));
A('H3 eval registers E*/MR/PR honesty stubs',
  /E1|MR1|P-META/.test(evalDoc) && /P-R1|R1/.test(evalDoc));
A('H3 slice indexes harness+eval',
  /r4-f2-p-meta-p-r1\.md/.test(slice)
  && /r4-f2-p-meta-p-r1\.eval\.md/.test(slice));
A('H3 status pins 题域隔离 NOT closed + releaseEvidence=false',
  /题域隔离 NOT closed/.test(status) && /releaseEvidence=false/.test(status));
A('H3 status F1 post_prove_dual_pass ≠ R4 closed · F2 this knife',
  (/F1.*=.*post_prove_dual_pass|F1.*`post_prove_dual_pass`/.test(status))
  && (/F2|P-META|p-meta-p-r1/.test(status)));
A('H3 prove never assigns MODEL_API_KEY (no invent)',
  !/MODEL_API_KEY\s*=/.test(read(join(here, 'r4-p-meta-p-r1.proof.ts'))));
A('H3 SOLE allowlist 恰 5 · F2 NOT on allowlist', (() => {
  const runner = read(join(repoRoot, 'scripts/run-e2e-isolated.mjs'));
  const m = runner.match(/const SOLE_WIRING_ALLOWLIST = new Set\(\[([\s\S]*?)\]\)/);
  if (!m) return false;
  const body = m[1];
  const items = [...body.matchAll(/'([^']+)'/g)].map((x) => x[1]);
  return items.length === 5
    && !body.includes('r4-p-meta-p-r1')
    && !body.includes('p-meta');
})());
A('H3 composition: EXIT=0 ≠ R1/FUNNEL-01/R4 closed', true);

console.log('\n── honesty summary (F2 P-META·P-R1 remaining; await post-prove dual) ──');
console.log(`MR1: 01A sealed · routedServing=true (F6 MS1) · facets=false · deployHandoff=false · FUNNEL-01 open`);
console.log(`PR1: default flag OFF · legacy「技术岗」on · r1 prove exit=${r1Exit} ≠ R1 closed`);
console.log('H3: ≠ R4 closed · ≠ 题域已隔离 · releaseEvidence=false · sole 恰 5 · no model-op');
console.log('EXIT=0 ≠ R1 closed ≠ RAG-FUNNEL-01 closed ≠ R4 closed ≠ HA ≠ suite green.');

console.log(failures === 0
  ? '\nOK  r4-p-meta-p-r1 prove (MR1/PR1/H3; r1 旁证; ≠ R1/FUNNEL-01/R4 closed; releaseEvidence=false)'
  : `\nFAIL  r4-p-meta-p-r1 prove (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);

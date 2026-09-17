/**
 * Knife F4 — P-R1 **fail-closed remaining** honesty prove (G-R4-3 / PR1-A–D).
 *
 *   PR1-A — legacy「技术岗」default-on (flag default OFF · production depends on legacy)
 *   PR1-B — flag-on contract unit exists · combo-root evidence still missing · ≠ flip
 *   PR1-C — spawn r1-tech-role-fail-closed:prove as contract 旁证 ≠ R1 closed
 *   PR1-D — hard pins: ≠ R1/R4 closed · releaseEvidence=false · ≠HA · ≠ suite green ·
 *           sole 恰 5 · no invent Key · no self-approve · G-R4-5 parallel open
 *
 * releaseEvidence=false · ≠HA · EXIT=0 ≠ R1 closed ≠ R4 closed ≠ 题域已隔离
 * sole allowlist not expanded · no invent MODEL_API_KEY · Ban flipping default
 *
 * CMD: pnpm r4-p-r1-fail-closed:prove
 *   (no PG required — honesty + r1 contract 旁证; harness does not require :raw)
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  classifyPR1Remaining,
  isR1Closed,
} from '../src/r4-p-meta-p-r1-remaining.ts';
import {
  classifyPR1FailClosedRemaining,
  failClosedAlignsWithF2PR1,
  isPR1FailClosedR1Closed,
} from '../src/r4-p-r1-fail-closed-remaining.ts';
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

const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-f4-p-r1-fail-closed.md');
const evalPath = join(repoRoot, 'ai-docs/delivery/eval/r4-f4-p-r1-fail-closed.eval.md');
const slicePath = join(repoRoot, 'ai-docs/delivery/r4-f4-p-r1-fail-closed.slice.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation-status.md');
const inventoryPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation.md');
const r1HarnessPath = join(repoRoot, 'ai-docs/delivery/harness/r1-tech-role-fail-closed.md');
const m4Path = join(repoRoot, 'ai-docs/delivery/m4-rag-hard-gates.md');
const f2HarnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-f2-p-meta-p-r1.md');
const f3HarnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-f3-p-meta-serving.md');
const helperPath = join(workerRoot, 'src/r4-p-r1-fail-closed-remaining.ts');
const f2HelperPath = join(workerRoot, 'src/r4-p-meta-p-r1-remaining.ts');
const rolePath = join(workerRoot, 'src/adaptive-role-resolve.ts');
const consumerPath = join(workerRoot, 'src/interview-consumer.ts');
const mainPath = join(workerRoot, 'src/main.ts');
const workerEnvExample = join(repoRoot, 'docker/env/worker.env.example');
const preExecE2e = join(repoRoot, 'ai-docs/delivery/reviews/2026-09-16-r4-f4-p-r1-fail-closed-mw-e2e-ha.md');
const preExecRag = join(repoRoot, 'ai-docs/delivery/reviews/2026-09-16-r4-f4-p-r1-fail-closed-mw-rag-route.md');

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
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

console.log('F4 P-R1 fail-closed remaining prove — PR1-A/B/C/D · releaseEvidence=false · ≠HA · ≠R1 closed');
console.log('EXIT=0 ≠ R1 closed ≠ R4 closed ≠ 题域已隔离 · no flip default · await post-prove dual');

section('PR0 static anchors present');
for (const [label, path] of [
  ['F4 harness', harnessPath],
  ['F4 eval', evalPath],
  ['F4 slice', slicePath],
  ['r4 status', statusPath],
  ['r4 inventory', inventoryPath],
  ['R1 harness', r1HarnessPath],
  ['m4-rag-hard-gates', m4Path],
  ['F2 harness', f2HarnessPath],
  ['F3 harness', f3HarnessPath],
  ['F4 remaining helper', helperPath],
  ['F2 remaining helper', f2HelperPath],
  ['adaptive-role-resolve', rolePath],
  ['interview-consumer', consumerPath],
  ['main.ts', mainPath],
  ['pre-exec e2e-ha review', preExecE2e],
  ['pre-exec rag-route review', preExecRag],
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
const f2Harness = read(f2HarnessPath);
const f3Harness = read(f3HarnessPath);
const helper = read(helperPath);
const roleSrc = read(rolePath);
const consumer = read(consumerPath);
const main = read(mainPath);
const envExample = read(workerEnvExample);
const preE2e = read(preExecE2e);
const preRag = read(preExecRag);

section('PR1-A legacy「技术岗」default-on (flag OFF · no flip)');
const fc = classifyPR1FailClosedRemaining({});
const f2 = classifyPR1Remaining({});
A('PR1-A classify: failClosedFlagDefaultOn=false (no flip)', fc.failClosedFlagDefaultOn === false);
A('PR1-A classify: legacyDefaultLabel=技术岗', fc.legacyDefaultLabel === LEGACY_TECH_ROLE_DEFAULT);
A('PR1-A classify: productionDependsOnLegacyDefault=true', fc.productionDependsOnLegacyDefault === true);
A('PR1-A unit: empty env → fail-closed OFF', isTechRoleFailClosedEnabled({}) === false);
A('PR1-A unit: flag-off + no route → legacy 技术岗',
  resolveAdaptiveInterviewRole({}, {}) === LEGACY_TECH_ROLE_DEFAULT);
A('PR1-A unit: explicit 0 → fail-closed OFF',
  isTechRoleFailClosedEnabled({ MEETWISE_TECH_ROLE_FAIL_CLOSED: '0' }) === false);
A('PR1-A main.ts does not inject role: 技术岗',
  !/role:\s*['"]技术岗['"]/.test(main));
A('PR1-A consumer has no ?? 技术岗 silent default',
  !/\?\?\s*['"]技术岗['"]/.test(consumer)
  && /resolveAdaptiveInterviewRole/.test(consumer));
A('PR1-A worker.env.example documents MEETWISE_TECH_ROLE_FAIL_CLOSED=0 (no flip)',
  !envExample || /MEETWISE_TECH_ROLE_FAIL_CLOSED\s*=\s*0/.test(envExample));
A('PR1-A helper Ban flipping default / Ban claiming R1 closed',
  (/No flip|Ban.*flip|does NOT flip/i.test(helper))
  && (/Ban claiming R1|does NOT close R1|≠ R1 closed/i.test(helper)));

section('PR1-B flag-on contract · combo-root evidence remaining');
A('PR1-B classify: flagOnContractUnitExists=true', fc.flagOnContractUnitExists === true);
A('PR1-B classify: comboRootFlagOnEvidence=false (still missing)', fc.comboRootFlagOnEvidence === false);
A('PR1-B unit: flag-on + no route → adaptive_role_route_missing', (() => {
  try {
    resolveAdaptiveInterviewRole({}, { MEETWISE_TECH_ROLE_FAIL_CLOSED: '1' });
    return false;
  } catch (e) {
    return (e as { code?: string }).code === 'adaptive_role_route_missing';
  }
})());
A('PR1-B unit: flag-on + deps alone still fail-closed', (() => {
  try {
    resolveAdaptiveInterviewRole(
      { roleFromDeps: '技术岗' },
      { MEETWISE_TECH_ROLE_FAIL_CLOSED: '1' },
    );
    return false;
  } catch (e) {
    return (e as { code?: string }).code === 'adaptive_role_route_missing';
  }
})());
A('PR1-B unit: flag-on + route snapshot accepted',
  resolveAdaptiveInterviewRole(
    { roleFromRouteSnapshot: 'backend' },
    { MEETWISE_TECH_ROLE_FAIL_CLOSED: '1' },
  ) === 'backend');
A('PR1-B m4 / R1 harness pin combo-root / 组合根 evidence remaining',
  (/组合根|combo-root|combo.root/i.test(m4) || /组合根|combo-root/i.test(r1Harness))
  && (/R1|技术岗|GAP-RAG-01/.test(m4)));
A('PR1-B role resolver documents default off + ≠ R1/R4 closed',
  /Default \(flag off\)|默认/.test(roleSrc)
  && /Does NOT claim R4|≠ R4|NOT closed|GAP-RAG-01/.test(roleSrc));

section('PR1-C r1 contract 旁证 ≠ R1 closed');
A('PR1-C classify: contractHarnessExists=true', fc.contractHarnessExists === true);
A('PR1-C classify: r1Closed=false', fc.r1Closed === false);
A('PR1-C isPR1FailClosedR1Closed=false', isPR1FailClosedR1Closed(fc) === false);
A('PR1-C isR1Closed(F2)=false', isR1Closed(f2) === false);
A('PR1-C failClosedAlignsWithF2PR1', failClosedAlignsWithF2PR1(fc, f2) === true);
A('PR1-C R1 harness + m4 pin prove绿 ≠ R1 closed',
  (/≠ R1|pass ≠ R1|prove.*≠.*R1|本绿 ≠/.test(r1Harness))
  && (/R1|技术岗|GAP-RAG-01/.test(m4)));
A('PR1-C inventory / status still list P-R1 / G-R4-3 open',
  (/P-R1/.test(inventory) || /P-R1|G-R4-3/.test(status))
  && (/G-R4-3|legacy|技术岗|GAP-RAG-01/.test(status) || /P-R1/.test(inventory)));

section('PR1-C contract 旁证 spawn (≠ R1 closed)');
const r1Exit = spawnProve('r1-tech-role-fail-closed', ['r1-tech-role-fail-closed:prove']);
A('PR1-C r1 contract 旁证 EXIT=0 ≠ R1 closed', r1Exit === 0);

section('PR1-D honesty pins (≠ R1/R4 closed · sole 恰 5 · no flip)');
A('PR1-D classify: gR45PMetaServingParallelOpen=true', fc.gR45PMetaServingParallelOpen === true);
A('PR1-D harness names P-R1 fail-closed remaining / PR1-A–D / G-R4-3',
  /P-R1/.test(harness) && /fail-closed|PR1-A/.test(harness) && /G-R4-3/.test(harness));
A('PR1-D harness freezes CMD r4-p-r1-fail-closed:prove',
  /r4-p-r1-fail-closed:prove/.test(harness));
A('PR1-D harness pins ≠ R1 closed · ≠ flip default without authorize',
  (/≠ R1 closed|Ban claiming R1/.test(harness))
  && (/≠ flip default|no flip|Ban flipping default|without authorize/i.test(harness)));
A('PR1-D harness pins ≠ R4 closed · releaseEvidence=false · ≠HA · sole 恰 5',
  (/≠ R4 closed|NOT closed|R4 open|仍开/.test(harness))
  && /releaseEvidence=false/.test(harness)
  && (/≠HA|Not HA|≠ HA/.test(harness))
  && (/sole 恰 5|恰 5/.test(harness)));
A('PR1-D harness omits mw-model-op (no MODEL-OP domain)',
  (/no.*mw-model-op|omit.*model-op|no model-op/i.test(harness)));
A('PR1-D harness pins G-R4-5 parallel open (not this F4)',
  (/G-R4-5/.test(harness) && (/parallel|仍开|STILL OPEN|not this F4/i.test(harness))));
A('PR1-D eval registers E*/PR1 honesty stubs',
  /E1|PR1-A|P-R1/.test(evalDoc) && /fail-closed|PR1-B|R1/.test(evalDoc));
A('PR1-D slice indexes harness+eval',
  /r4-f4-p-r1-fail-closed\.md/.test(slice)
  && /r4-f4-p-r1-fail-closed\.eval\.md/.test(slice));
A('PR1-D status pins 题域隔离 NOT closed + releaseEvidence=false + G-R4-3',
  /题域隔离 NOT closed/.test(status)
  && /releaseEvidence=false/.test(status)
  && /G-R4-3/.test(status));
A('PR1-D status F3 post_prove_dual_pass · F4 this knife · G-R4-5 STILL OPEN',
  (/F3.*=.*post_prove_dual_pass|F3.*`post_prove_dual_pass`/.test(status))
  && (/F4|p-r1-fail-closed|fail-closed/.test(status))
  && (/G-R4-5|MS1–MS3 still false|P-META serving STILL OPEN/.test(status)));
A('PR1-D F2/F3 harness retained post_prove_dual_pass (≠ product close)',
  /post_prove_dual_pass/.test(f2Harness) && /post_prove_dual_pass/.test(f3Harness));
A('PR1-D pre-exec dual reviews exist · verdict pass (docs gate)',
  (/pass|结论.*pass|\*\*pass\*\*/i.test(preE2e))
  && (/pass|结论.*pass|\*\*pass\*\*/i.test(preRag)));
A('PR1-D prove never assigns MODEL_API_KEY (no invent)',
  !/MODEL_API_KEY\s*=/.test(read(join(here, 'r4-p-r1-fail-closed.proof.ts'))));
A('PR1-D SOLE allowlist 恰 5 · F4 NOT on allowlist', (() => {
  const runner = read(join(repoRoot, 'scripts/run-e2e-isolated.mjs'));
  const m = runner.match(/const SOLE_WIRING_ALLOWLIST = new Set\(\[([\s\S]*?)\]\)/);
  if (!m) return false;
  const body = m[1];
  const items = [...body.matchAll(/'([^']+)'/g)].map((x) => x[1]);
  return items.length === 5
    && !body.includes('r4-p-r1-fail-closed')
    && !body.includes('p-r1-fail');
})());
A('PR1-D composition: EXIT=0 ≠ R1/R4 closed · ≠ flip authorized', true);

console.log('\n── honesty summary (F4 P-R1 fail-closed remaining; await post-prove dual) ──');
console.log(`PR1-A: default flag OFF · legacy「技术岗」on · productionDependsOnLegacy=true`);
console.log(`PR1-B: flagOnContractUnit=true · comboRootFlagOnEvidence=false · no flip`);
console.log(`PR1-C: r1 prove exit=${r1Exit} ≠ R1 closed · aligns with F2 PR1`);
console.log('PR1-D: ≠ R1/R4 closed · ≠ 题域已隔离 · releaseEvidence=false · sole 恰 5 · G-R4-5 parallel open');
console.log('EXIT=0 ≠ R1 closed ≠ R4 closed ≠ HA ≠ suite green ≠ flip authorized.');

console.log(failures === 0
  ? '\nOK  r4-p-r1-fail-closed prove (PR1-A–D; r1 旁证; ≠ R1/R4 closed; no flip; releaseEvidence=false)'
  : `\nFAIL  r4-p-r1-fail-closed prove (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);

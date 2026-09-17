/**
 * Knife F3 — P-META **serving remaining** honesty prove (G-R4-5 / MS1–MS4).
 *
 *   MS1 — routed MetadataReviewReceipt serving consumer WIRED by F6 (≠ forge · MS2/MS3 open)
 *   MS2 — full secondary facets inventory named · served-on-path empty
 *   MS3 — standard deploy handoff still open (local 01A prove ≠ 01)
 *   MS4 — hard pins: 01A ≠ 01 · ≠ FUNNEL-01/R4 closed · releaseEvidence=false ·
 *         ≠HA · ≠ suite green · sole 恰 5 · no invent Key · no P-R1 flip
 *
 * releaseEvidence=false · ≠HA · EXIT=0 ≠ FUNNEL-01 closed ≠ R4 closed
 * sole allowlist not expanded · no invent MODEL_API_KEY · Ban claiming R4 closed
 *
 * CMD: pnpm r4-p-meta-serving:prove
 *   (no PG required — serving honesty; harness does not require :raw)
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  classifyPMetaRemaining,
  is01ANotEqual01,
  isRagFunnel01Closed,
} from '../src/r4-p-meta-p-r1-remaining.ts';
import {
  REQUIRED_SECONDARY_FACETS,
  classifyPMetaServingRemaining,
  isServing01ANotEqual01,
  isServingFunnel01Closed,
  servingAlignsWithF2Remaining,
} from '../src/r4-p-meta-serving-remaining.ts';
import { isTechRoleFailClosedEnabled } from '../src/adaptive-role-resolve.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail?: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

const here = dirname(fileURLToPath(import.meta.url));
const workerRoot = join(here, '..');
const repoRoot = join(workerRoot, '..', '..');

const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-f3-p-meta-serving.md');
const evalPath = join(repoRoot, 'ai-docs/delivery/eval/r4-f3-p-meta-serving.eval.md');
const slicePath = join(repoRoot, 'ai-docs/delivery/r4-f3-p-meta-serving.slice.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation-status.md');
const inventoryPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation.md');
const f2HarnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-f2-p-meta-p-r1.md');
const funnel01aPath = join(repoRoot, 'ai-docs/rules/backend/qbank-control-definer-sealed-manifest.md');
const principalPath = join(repoRoot, 'packages/db/src/principal.ts');
const funnelArchPath = join(repoRoot, 'ai-docs/architecture/ai/rag-funnel-routing.md');
const helperPath = join(workerRoot, 'src/r4-p-meta-serving-remaining.ts');
const f2HelperPath = join(workerRoot, 'src/r4-p-meta-p-r1-remaining.ts');
const handoffProvePath = join(repoRoot, 'packages/db/test/qbank-handoff-closure.proof.ts');
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

/** Honesty helpers may name receipt types; product consumers must not pretend serving. */
function isHonestyHelper(f: string): boolean {
  return (
    f.endsWith('r4-p-meta-p-r1-remaining.ts')
    || f.endsWith('r4-p-meta-serving-remaining.ts')
    || f.endsWith('r4-p-meta-serving-product-remaining.ts')
    || f.endsWith('r4-p-meta-ms1-product-wire.ts')
  );
}

console.log('F3 P-META serving remaining prove — MS1/MS2/MS3/MS4 · releaseEvidence=false · ≠HA · ≠R4 closed');
console.log('EXIT=0 ≠ RAG-FUNNEL-01 closed ≠ 题域已隔离 · await post-prove dual · Ban claiming R4 closed');

section('MS0 static anchors present');
for (const [label, path] of [
  ['F3 harness', harnessPath],
  ['F3 eval', evalPath],
  ['F3 slice', slicePath],
  ['r4 status', statusPath],
  ['r4 inventory', inventoryPath],
  ['F2 harness', f2HarnessPath],
  ['01A sealed manifest', funnel01aPath],
  ['principal.ts', principalPath],
  ['rag-funnel architecture', funnelArchPath],
  ['F3 serving helper', helperPath],
  ['F2 remaining helper', f2HelperPath],
  ['01A handoff prove', handoffProvePath],
] as const) {
  A(`${label} present`, existsSync(path), path);
}

const harness = read(harnessPath);
const evalDoc = read(evalPath);
const slice = read(slicePath);
const status = read(statusPath);
const inventory = read(inventoryPath);
const f2Harness = read(f2HarnessPath);
const funnel01a = read(funnel01aPath);
const principal = read(principalPath);
const funnelArch = read(funnelArchPath);
const helper = read(helperPath);
const envExample = read(workerEnvExample);

section('MS1 routed MetadataReviewReceipt serving (still open · ≠ forge)');
const serving = classifyPMetaServingRemaining();
const f2 = classifyPMetaRemaining();
A('MS1 classify: sourceSealed01A=true', serving.sourceSealed01A === true);
A('MS1 classify: routedServingConsumerWired=true (F6 MS1 product wire)', serving.routedServingConsumerWired === true);
A('MS1 F2 align: routedServingWired=true', f2.routedServingWired === true);
A('MS1 principal lists qbank_metadata_review_receipt (01A table)',
  /qbank_metadata_review_receipt/.test(principal));
A('MS1 01A manifest pins table ≠ routed serving / 01 still open',
  (/RAG-FUNNEL-01A|01A/.test(funnel01a))
  && (/RAG-FUNNEL-01/.test(funnel01a))
  && (/MetadataReviewReceipt/.test(funnel01a))
  && (/routed serving|进入 serving|不等于 routed|≠.*01|不是.*01/.test(funnel01a)));
A('MS1 F6 product wire present',
  existsSync(join(workerRoot, 'src/r4-p-meta-ms1-product-wire.ts')));
A('MS1 only honesty helpers + F6 wire name MetadataReviewReceipt in worker src', (() => {
  const files = walkTsFiles(join(workerRoot, 'src'));
  for (const f of files) {
    if (isHonestyHelper(f)) continue;
    const body = read(f);
    if (/MetadataReviewReceipt|qbank_metadata_review_receipt|metadata_review_receipt/.test(body)) {
      console.log(`  leak: ${f}`);
      return false;
    }
  }
  return true;
})());
A('MS1 helper Ban forging MetadataReviewReceipt serving',
  /Ban forging MetadataReviewReceipt|does NOT close|do NOT close/i.test(helper));
A('MS1 inventory / status still list P-META / G-R4-5 open',
  (/P-META/.test(inventory) || /P-META/.test(status))
  && (/G-R4-5|MetadataReviewReceipt|RAG-FUNNEL-01/.test(status) || /P-META/.test(inventory)));

section('MS2 full facets served (inventory named · path empty)');
A('MS2 classify: fullFacetsServed=false', serving.fullFacetsServed === false);
A('MS2 requiredFacets = architecture secondary set (6)',
  serving.requiredFacets.length === 6
  && REQUIRED_SECONDARY_FACETS.every((f, i) => serving.requiredFacets[i] === f));
A('MS2 facetsServedOnRoutedPath empty (still open)',
  serving.facetsServedOnRoutedPath.length === 0);
A('MS2 architecture names secondary facets set',
  /competency/.test(funnelArch)
  && /technology/.test(funnelArch)
  && /difficulty/.test(funnelArch)
  && /seniority/.test(funnelArch)
  && (/secondary facets|受控 secondary/.test(funnelArch) || /kind/.test(funnelArch))
  && /language/.test(funnelArch));
A('MS2 harness names MS2 / full facets remaining',
  /MS2/.test(harness) && (/full facets|Full facets|完整 facets/i.test(harness)));

section('MS3 standard deploy handoff (local 01A ≠ standard deploy)');
A('MS3 classify: standardDeployHandoff=false', serving.standardDeployHandoff === false);
A('MS3 classify: local01AHandoffProveExists=true', serving.local01AHandoffProveExists === true);
A('MS3 local handoff prove file present (旁证 ≠ 01)', existsSync(handoffProvePath));
A('MS3 01A manifest pins local prove ≠ cloud/standard deploy receipt',
  (/releaseEvidence=false/.test(funnel01a) || /releaseEvidence=false/.test(harness))
  && (/云|标准部署|组合根|deploy|handoff/.test(funnel01a)));
A('MS3 harness names MS3 / deploy handoff remaining',
  /MS3/.test(harness) && (/deploy|handoff|部署/.test(harness)));

section('MS4 hard pins (01A ≠ 01 · ≠ R4 · sole 恰 5)');
A('MS4 isServingFunnel01Closed=false', isServingFunnel01Closed(serving) === false);
A('MS4 isServing01ANotEqual01=true', isServing01ANotEqual01(serving) === true);
A('MS4 servingAlignsWithF2Remaining=true', servingAlignsWithF2Remaining(serving, f2) === true);
A('MS4 F2 isRagFunnel01Closed=false · is01ANotEqual01=true',
  isRagFunnel01Closed(f2) === false && is01ANotEqual01(f2) === true);
A('MS4 harness freezes CMD r4-p-meta-serving:prove',
  /r4-p-meta-serving:prove/.test(harness));
A('MS4 harness pins ≠ R4 closed · ≠ FUNNEL-01 closed · 01A ≠ 01 · releaseEvidence=false · ≠HA · sole 恰 5',
  (/≠ R4 closed|NOT closed|R4 open|仍开/.test(harness))
  && (/≠ RAG-FUNNEL-01|≠ FUNNEL-01|FUNNEL-01 closed/.test(harness))
  && (/01A ≠ 01|01A.*≠.*01/.test(harness))
  && /releaseEvidence=false/.test(harness)
  && (/≠HA|Not HA|≠ HA/.test(harness))
  && (/sole 恰 5|恰 5/.test(harness)));
A('MS4 harness omits mw-model-op · excludes P-R1 flip from this knife',
  (/no.*mw-model-op|omit.*model-op|no model-op/i.test(harness))
  && (/P-R1|not this F3|不并入|Out of scope/.test(harness)));
A('MS4 F2 harness still post_prove_dual_pass / honesty (prior gate)',
  /post_prove_dual_pass/.test(f2Harness) || /P-META/.test(f2Harness));
A('MS4 eval registers MS1–MS4 / E* serving stubs',
  /MS1|E1/.test(evalDoc) && /MS2|E2/.test(evalDoc) && /MS3|E3/.test(evalDoc));
A('MS4 slice indexes harness+eval',
  /r4-f3-p-meta-serving\.md/.test(slice)
  && /r4-f3-p-meta-serving\.eval\.md/.test(slice));
A('MS4 status pins 题域隔离 NOT closed + releaseEvidence=false',
  /题域隔离 NOT closed/.test(status) && /releaseEvidence=false/.test(status));
A('MS4 status F2 post_prove_dual_pass · F3 this knife · G-R4-5',
  (/F2.*=.*post_prove_dual_pass|F2.*`post_prove_dual_pass`/.test(status))
  && (/F3|p-meta-serving|G-R4-5/.test(status)));
A('MS4 P-R1 default fail-closed still OFF (no flip this knife)',
  isTechRoleFailClosedEnabled({}) === false);
A('MS4 worker.env.example still documents MEETWISE_TECH_ROLE_FAIL_CLOSED=0 (or absent)',
  !envExample || /MEETWISE_TECH_ROLE_FAIL_CLOSED\s*=\s*0/.test(envExample));
A('MS4 prove never assigns MODEL_API_KEY (no invent)',
  !/MODEL_API_KEY\s*=/.test(read(join(here, 'r4-p-meta-serving.proof.ts'))));
A('MS4 SOLE allowlist 恰 5 · F3 NOT on allowlist', (() => {
  const runner = read(join(repoRoot, 'scripts/run-e2e-isolated.mjs'));
  const m = runner.match(/const SOLE_WIRING_ALLOWLIST = new Set\(\[([\s\S]*?)\]\)/);
  if (!m) return false;
  const body = m[1];
  const items = [...body.matchAll(/'([^']+)'/g)].map((x) => x[1]);
  return items.length === 5
    && !body.includes('r4-p-meta-serving')
    && !body.includes('p-meta-serving');
})());
A('MS4 composition: EXIT=0 ≠ FUNNEL-01/R4 closed ≠ HA', true);

console.log('\n── honesty summary (F3 P-META serving remaining; await post-prove dual) ──');
console.log(`MS1: routedServingConsumerWired=true (F6 product wire) · ≠ forge`);
console.log(`MS2: fullFacetsServed=false · required=[${REQUIRED_SECONDARY_FACETS.join(',')}] · served=[]`);
console.log(`MS3: standardDeployHandoff=false · local01A prove exists ≠ 01`);
console.log('MS4: 01A ≠ 01 · ≠ R4 closed · ≠ 题域已隔离 · releaseEvidence=false · sole 恰 5 · no P-R1 flip');
console.log('EXIT=0 ≠ RAG-FUNNEL-01 closed ≠ R4 closed ≠ HA ≠ suite green.');

console.log(failures === 0
  ? '\nOK  r4-p-meta-serving prove (MS1/MS2/MS3/MS4; ≠ FUNNEL-01/R4 closed; releaseEvidence=false)'
  : `\nFAIL  r4-p-meta-serving prove (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);

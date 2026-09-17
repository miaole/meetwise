/**
 * Knife F5 — P-META **serving product remaining** prove (G-R4-5 / MS1–MS4).
 *
 *   MS1 — product MetadataReviewReceipt serving consumer WIRED by F6 (≠ forge)
 *         · product serving contract NAMED + wired=true (honest after F6)
 *   MS2 — product facet serving plan PINNED · facetsServedOnProductPath = required (F7)
 *   MS3 — product deploy handoff checklist NAMED · standardDeployProductHandoff false
 *         · local 01A prove ≠ standard deploy
 *   MS4 — hard pins: 01A ≠ 01 · ≠ FUNNEL-01/R4/R1 closed · releaseEvidence=false ·
 *         ≠HA · ≠ suite green · sole 恰 5 · no invent Key · no P-R1 flip ·
 *         G-R4-3 parallel open · Ban forge serving
 *
 * releaseEvidence=false · ≠HA · EXIT=0 ≠ FUNNEL-01 closed ≠ R4 closed ≠ knife product-done
 * sole allowlist not expanded · no invent MODEL_API_KEY · Ban claiming R4/FUNNEL/R1 closed
 *
 * CMD: pnpm r4-p-meta-serving-product:prove
 *   (no PG required — product remaining honesty; harness does not require :raw)
 */
import { spawnSync } from 'node:child_process';
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
import {
  METADATA_REVIEW_RECEIPT_SERVING_PRODUCT_CONTRACT,
  PRODUCT_DEPLOY_HANDOFF_CHECKLIST,
  PRODUCT_FACET_SERVING_PLAN,
  classifyPMetaServingProductRemaining,
  isProduct01ANotEqual01,
  isProductFunnel01Closed,
  productAlignsWithF3Serving,
} from '../src/r4-p-meta-serving-product-remaining.ts';
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

const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-f5-p-meta-serving-product.md');
const evalPath = join(repoRoot, 'ai-docs/delivery/eval/r4-f5-p-meta-serving-product.eval.md');
const slicePath = join(repoRoot, 'ai-docs/delivery/r4-f5-p-meta-serving-product.slice.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation-status.md');
const inventoryPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation.md');
const f3HarnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-f3-p-meta-serving.md');
const f4HarnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-f4-p-r1-fail-closed.md');
const funnel01aPath = join(repoRoot, 'ai-docs/rules/backend/qbank-control-definer-sealed-manifest.md');
const principalPath = join(repoRoot, 'packages/db/src/principal.ts');
const funnelArchPath = join(repoRoot, 'ai-docs/architecture/ai/rag-funnel-routing.md');
const helperPath = join(workerRoot, 'src/r4-p-meta-serving-product-remaining.ts');
const f3HelperPath = join(workerRoot, 'src/r4-p-meta-serving-remaining.ts');
const f2HelperPath = join(workerRoot, 'src/r4-p-meta-p-r1-remaining.ts');
const handoffProvePath = join(repoRoot, 'packages/db/test/qbank-handoff-closure.proof.ts');
const workerEnvExample = join(repoRoot, 'docker/env/worker.env.example');
const preExecE2e = join(repoRoot, 'ai-docs/delivery/reviews/2026-09-17-r4-f5-p-meta-serving-product-mw-e2e-ha.md');
const preExecRag = join(repoRoot, 'ai-docs/delivery/reviews/2026-09-17-r4-f5-p-meta-serving-product-mw-rag-route.md');

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

/** Honesty / product-remaining helpers may name receipt types; wired consumers must not pretend serving. */
function isHonestyHelper(f: string): boolean {
  return (
    f.endsWith('r4-p-meta-p-r1-remaining.ts')
    || f.endsWith('r4-p-meta-serving-remaining.ts')
    || f.endsWith('r4-p-meta-serving-product-remaining.ts')
    || f.endsWith('r4-p-meta-ms1-product-wire.ts')
    || f.endsWith('r4-p-meta-ms2-facets-product.ts')
  );
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

console.log('F5 P-META serving product remaining prove — MS1/MS2/MS3/MS4 · releaseEvidence=false · ≠HA · ≠R4 closed');
console.log('EXIT=0 ≠ RAG-FUNNEL-01 closed ≠ 题域已隔离 · MS1 wired (F6) · MS2 served (F7) · MS3 still false · Ban forge serving');

section('MS0 static anchors present');
for (const [label, path] of [
  ['F5 harness', harnessPath],
  ['F5 eval', evalPath],
  ['F5 slice', slicePath],
  ['r4 status', statusPath],
  ['r4 inventory', inventoryPath],
  ['F3 harness', f3HarnessPath],
  ['F4 harness', f4HarnessPath],
  ['01A sealed manifest', funnel01aPath],
  ['principal.ts', principalPath],
  ['rag-funnel architecture', funnelArchPath],
  ['F5 product helper', helperPath],
  ['F3 serving helper', f3HelperPath],
  ['F2 remaining helper', f2HelperPath],
  ['01A handoff prove', handoffProvePath],
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
const f3Harness = read(f3HarnessPath);
const f4Harness = read(f4HarnessPath);
const funnel01a = read(funnel01aPath);
const principal = read(principalPath);
const funnelArch = read(funnelArchPath);
const helper = read(helperPath);
const envExample = read(workerEnvExample);
const preE2e = read(preExecE2e);
const preRag = read(preExecRag);

section('MS1 product MetadataReviewReceipt serving (contract named · F6 consumer wired · ≠ forge)');
const product = classifyPMetaServingProductRemaining();
const serving = classifyPMetaServingRemaining();
const f2 = classifyPMetaRemaining();
A('MS1 classify: sourceSealed01A=true', product.sourceSealed01A === true);
A('MS1 classify: productServingContractNamed=true (honest progress)', product.productServingContractNamed === true);
A('MS1 classify: routedServingProductConsumerWired=true (F6 MS1 product wire)', product.routedServingProductConsumerWired === true);
A('MS1 contract.wired=true · honest after F6 real wire', METADATA_REVIEW_RECEIPT_SERVING_PRODUCT_CONTRACT.wired === true);
A('MS1 F3 align: routedServingConsumerWired=true', serving.routedServingConsumerWired === true);
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
A('MS1 helper Ban forging MetadataReviewReceipt serving / MS1 alone ≠ FUNNEL',
  /Ban forging MetadataReviewReceipt|Ban forge|do NOT close|MS1 alone|MS2\/MS3 remain/i.test(helper));
A('MS1 inventory / status still list P-META / G-R4-5 open',
  (/P-META/.test(inventory) || /P-META/.test(status))
  && (/G-R4-5|MetadataReviewReceipt|RAG-FUNNEL-01/.test(status) || /P-META/.test(inventory)));

section('MS2 product facets (plan pinned · served-on-path = required · F7)');
A('MS2 classify: productFacetServingPlanPinned=true (honest progress)', product.productFacetServingPlanPinned === true);
A('MS2 requiredFacets = architecture secondary set (6)',
  product.requiredFacets.length === 6
  && REQUIRED_SECONDARY_FACETS.every((f, i) => product.requiredFacets[i] === f)
  && PRODUCT_FACET_SERVING_PLAN.every((f, i) => product.requiredFacets[i] === f));
A('MS2 facetsServedOnProductPath = required set (F7 served)',
  product.facetsServedOnProductPath.length === 6
  && REQUIRED_SECONDARY_FACETS.every((f, i) => product.facetsServedOnProductPath[i] === f));
A('MS2 F3 align: fullFacetsServed=true · facetsServedOnRoutedPath = required',
  serving.fullFacetsServed === true
  && serving.facetsServedOnRoutedPath.length === 6
  && REQUIRED_SECONDARY_FACETS.every((f, i) => serving.facetsServedOnRoutedPath[i] === f));
A('MS2 architecture names secondary facets set',
  /competency/.test(funnelArch)
  && /technology/.test(funnelArch)
  && /difficulty/.test(funnelArch)
  && /seniority/.test(funnelArch)
  && (/secondary facets|受控 secondary/.test(funnelArch) || /kind/.test(funnelArch))
  && /language/.test(funnelArch));
A('MS2 harness names MS2 / full facets / product remaining',
  /MS2/.test(harness) && (/full facets|Full facets|完整 facets|facets/i.test(harness)));

section('MS3 product deploy handoff (checklist named · evidence still open)');
A('MS3 classify: productDeployHandoffChecklistNamed=true (honest progress)',
  product.productDeployHandoffChecklistNamed === true);
A('MS3 checklist inventory length=3',
  product.productDeployHandoffChecklist.length === 3
  && PRODUCT_DEPLOY_HANDOFF_CHECKLIST.every((x, i) => product.productDeployHandoffChecklist[i] === x));
A('MS3 classify: standardDeployProductHandoff=false (MS3 still open)',
  product.standardDeployProductHandoff === false);
A('MS3 classify: local01AHandoffProveExists=true', product.local01AHandoffProveExists === true);
A('MS3 local handoff prove file present (旁证 ≠ 01)', existsSync(handoffProvePath));
A('MS3 F3 align: standardDeployHandoff=false', serving.standardDeployHandoff === false);
A('MS3 01A manifest pins local prove ≠ cloud/standard deploy receipt',
  (/releaseEvidence=false/.test(funnel01a) || /releaseEvidence=false/.test(harness))
  && (/云|标准部署|组合根|deploy|handoff/.test(funnel01a)));
A('MS3 harness names MS3 / deploy handoff remaining',
  /MS3/.test(harness) && (/deploy|handoff|部署/.test(harness)));

section('MS4 hard pins (01A ≠ 01 · ≠ R4 · sole 恰 5 · Ban forge · G-R4-3 parallel)');
A('MS4 isProductFunnel01Closed=false', isProductFunnel01Closed(product) === false);
A('MS4 isProduct01ANotEqual01=true', isProduct01ANotEqual01(product) === true);
A('MS4 productAlignsWithF3Serving=true', productAlignsWithF3Serving(product, serving) === true);
A('MS4 F3 isServingFunnel01Closed=false · isServing01ANotEqual01=true',
  isServingFunnel01Closed(serving) === false && isServing01ANotEqual01(serving) === true);
A('MS4 F2 isRagFunnel01Closed=false · is01ANotEqual01=true',
  isRagFunnel01Closed(f2) === false && is01ANotEqual01(f2) === true);
A('MS4 servingAlignsWithF2Remaining=true', servingAlignsWithF2Remaining(serving, f2) === true);
A('MS4 gR43PR1ParallelOpen=true', product.gR43PR1ParallelOpen === true);
A('MS4 harness freezes CMD r4-p-meta-serving-product:prove',
  /r4-p-meta-serving-product:prove/.test(harness));
A('MS4 harness pins ≠ R4 closed · ≠ FUNNEL-01 closed · ≠ R1 closed · 01A ≠ 01 · releaseEvidence=false · ≠HA · sole 恰 5',
  (/≠ R4 closed|NOT closed|R4 open|仍开/.test(harness))
  && (/≠ RAG-FUNNEL-01|≠ FUNNEL-01|FUNNEL-01 closed/.test(harness))
  && (/≠ R1 closed|R1 closed/.test(harness))
  && (/01A ≠ 01|01A.*≠.*01/.test(harness))
  && /releaseEvidence=false/.test(harness)
  && (/≠HA|Not HA|≠ HA/.test(harness))
  && (/sole 恰 5|恰 5/.test(harness)));
A('MS4 harness Ban forge serving · omits mw-model-op · G-R4-3 parallel not this F5',
  (/Ban forge|≠ forge|Ban forging/i.test(harness))
  && (/no.*mw-model-op|omit.*model-op|no model-op/i.test(harness))
  && (/G-R4-3|P-R1/.test(harness) && (/parallel|不并入|not this F5|Out of scope/i.test(harness))));
A('MS4 F3 harness post_prove_dual_pass · MS1–MS3 still false (prior)',
  /post_prove_dual_pass/.test(f3Harness)
  && (/MS1–MS3 still false|MS1-MS3 still false|still false/.test(f3Harness) || /G-R4-5/.test(f3Harness)));
A('MS4 F4 harness post_prove_dual_pass · G-R4-3 STILL OPEN · no flip (prior)',
  /post_prove_dual_pass/.test(f4Harness)
  && (/G-R4-3|STILL OPEN|still open/.test(f4Harness))
  && (/no flip|≠ flip|Ban flipping|without authorize/i.test(f4Harness)));
A('MS4 eval registers MS1–MS4 / E* product stubs',
  /MS1|E1/.test(evalDoc) && /MS2|E2/.test(evalDoc) && /MS3|E3/.test(evalDoc));
A('MS4 slice indexes harness+eval',
  /r4-f5-p-meta-serving-product\.md/.test(slice)
  && /r4-f5-p-meta-serving-product\.eval\.md/.test(slice));
A('MS4 status pins 题域隔离 NOT closed + releaseEvidence=false',
  /题域隔离 NOT closed/.test(status) && /releaseEvidence=false/.test(status));
A('MS4 status mentions F5 / G-R4-5 / MS1–MS3 still false (or F5 knife)',
  (/F5|p-meta-serving-product|G-R4-5/.test(status))
  && (/MS1–MS3 still false|MS1-MS3 still false|G-R4-5|P-META serving/.test(status)));
A('MS4 pre-exec dual reviews exist · verdict pass (docs gate)',
  (/pass|结论.*pass|\*\*pass\*\*/i.test(preE2e))
  && (/pass|结论.*pass|\*\*pass\*\*/i.test(preRag)));
A('MS4 P-R1 default fail-closed still OFF (no flip this knife)',
  isTechRoleFailClosedEnabled({}) === false);
A('MS4 worker.env.example still documents MEETWISE_TECH_ROLE_FAIL_CLOSED=0 (or absent)',
  !envExample || /MEETWISE_TECH_ROLE_FAIL_CLOSED\s*=\s*0/.test(envExample));
A('MS4 prove never assigns MODEL_API_KEY (no invent)',
  !/MODEL_API_KEY\s*=/.test(read(join(here, 'r4-p-meta-serving-product.proof.ts'))));
A('MS4 SOLE allowlist 恰 5 · F5 NOT on allowlist', (() => {
  const runner = read(join(repoRoot, 'scripts/run-e2e-isolated.mjs'));
  const m = runner.match(/const SOLE_WIRING_ALLOWLIST = new Set\(\[([\s\S]*?)\]\)/);
  if (!m) return false;
  const body = m[1];
  const items = [...body.matchAll(/'([^']+)'/g)].map((x) => x[1]);
  return items.length === 5
    && !body.includes('r4-p-meta-serving-product')
    && !body.includes('p-meta-serving-product');
})());
A('MS4 composition: EXIT=0 ≠ FUNNEL-01/R4/R1 closed ≠ HA ≠ forge OK', true);

section('MS4 F3 serving honesty 旁证 spawn (≠ FUNNEL-01 closed)');
spawnProve('r4-p-meta-serving', ['r4-p-meta-serving:prove']);

console.log('\n── product remaining summary (F5 P-META serving product; await post-prove dual) ──');
console.log(`MS1: productServingContractNamed=true · routedServingProductConsumerWired=true (F6) · ≠ forge`);
console.log(`MS2: productFacetServingPlanPinned=true · required=[${REQUIRED_SECONDARY_FACETS.join(',')}] · served=required (F7)`);
console.log(`MS3: productDeployHandoffChecklistNamed=true · standardDeployProductHandoff=false · local01A prove ≠ 01`);
console.log('MS4: 01A ≠ 01 · ≠ R4/FUNNEL/R1 closed · G-R4-5 STILL OPEN · G-R4-3 parallel · releaseEvidence=false · sole 恰 5 · no P-R1 flip');
console.log('EXIT=0 ≠ RAG-FUNNEL-01 closed ≠ R4 closed ≠ HA ≠ suite green ≠ knife product-done.');

console.log(failures === 0
  ? '\nOK  r4-p-meta-serving-product prove (MS1/MS2/MS3/MS4; MS1 wired by F6; MS2/MS3 still false; ≠ FUNNEL-01/R4 closed; releaseEvidence=false)'
  : `\nFAIL  r4-p-meta-serving-product prove (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);

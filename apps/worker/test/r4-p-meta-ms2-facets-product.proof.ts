/**
 * Knife F7 — MS2 **facets on product path** prove (G-R4-5 / MS2).
 *
 *   MS1 — routed product serving consumer stays WIRED (F6 pin · ≠ flip back)
 *   MS2 — required secondary facets SERVED on product path (real serve · ≠ forge)
 *         · facetsServedOnProductPath = required set · fullFacetsServed=true
 *   MS3 — standardDeployProductHandoff still false (still open)
 *   MS4 — hard pins: 01A ≠ 01 · MS2 alone ≠ FUNNEL-01/R4/R1/G-R4-5 closed ·
 *         releaseEvidence=false · ≠HA · ≠ suite green · sole 恰 5 ·
 *         no invent Key · no P-R1 flip · G-R4-3 parallel open · Ban forge
 *
 * releaseEvidence=false · ≠HA · EXIT=0 ≠ FUNNEL-01 closed ≠ R4 closed ≠ G-R4-5 closed
 * sole allowlist not expanded · no invent MODEL_API_KEY · Ban claiming R4/FUNNEL/R1 closed
 *
 * CMD: pnpm r4-p-meta-ms2-facets-product:prove
 *   (no PG required — product facet serve unit + classifier honesty; harness does not require :raw)
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
  classifyPMetaServingProductRemaining,
  isProduct01ANotEqual01,
  isProductFunnel01Closed,
  productAlignsWithF3Serving,
} from '../src/r4-p-meta-serving-product-remaining.ts';
import {
  MS1_METADATA_REVIEW_RECEIPT_PRODUCT_SERVING_CONSUMER_WIRED,
  admitMetadataReviewReceiptToProductServing,
  type MetadataReviewReceipt,
} from '../src/r4-p-meta-ms1-product-wire.ts';
import {
  MS2_FACETS_SERVED_ON_PRODUCT_PATH,
  MS2_PRODUCT_FACETS_SERVED_ON_PRODUCT_PATH_WIRED,
  MS2_PRODUCT_FACETS_SERVE_ID,
  MS2_PRODUCT_PATH_FACETS,
  isValidProductSecondaryFacetPayload,
  serveRequiredSecondaryFacetsOnProductPath,
  type ProductSecondaryFacetPayload,
} from '../src/r4-p-meta-ms2-facets-product.ts';
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

const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-f7-p-meta-ms2-facets-product.md');
const evalPath = join(repoRoot, 'ai-docs/delivery/eval/r4-f7-p-meta-ms2-facets-product.eval.md');
const slicePath = join(repoRoot, 'ai-docs/delivery/r4-f7-p-meta-ms2-facets-product.slice.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation-status.md');
const inventoryPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation.md');
const f6HarnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-f6-p-meta-ms1-product-wire.md');
const f5HarnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-f5-p-meta-serving-product.md');
const f4HarnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-f4-p-r1-fail-closed.md');
const funnel01aPath = join(repoRoot, 'ai-docs/rules/backend/qbank-control-definer-sealed-manifest.md');
const principalPath = join(repoRoot, 'packages/db/src/principal.ts');
const funnelArchPath = join(repoRoot, 'ai-docs/architecture/ai/rag-funnel-routing.md');
const ms2Path = join(workerRoot, 'src/r4-p-meta-ms2-facets-product.ts');
const ms1Path = join(workerRoot, 'src/r4-p-meta-ms1-product-wire.ts');
const f5HelperPath = join(workerRoot, 'src/r4-p-meta-serving-product-remaining.ts');
const f3HelperPath = join(workerRoot, 'src/r4-p-meta-serving-remaining.ts');
const f2HelperPath = join(workerRoot, 'src/r4-p-meta-p-r1-remaining.ts');
const handoffProvePath = join(repoRoot, 'packages/db/test/qbank-handoff-closure.proof.ts');
const workerEnvExample = join(repoRoot, 'docker/env/worker.env.example');
const preExecE2e = join(repoRoot, 'ai-docs/delivery/reviews/2026-09-17-r4-f7-p-meta-ms2-facets-product-mw-e2e-ha.md');
const preExecRag = join(repoRoot, 'ai-docs/delivery/reviews/2026-09-17-r4-f7-p-meta-ms2-facets-product-mw-rag-route.md');

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

function isAllowedReceiptMention(f: string): boolean {
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

const FIXTURE_APPROVED: MetadataReviewReceipt = {
  receiptId: 'receipt:ms2-facets-product:fixture-1',
  refId: 'chunk:fixture-ref-ms2-1',
  sourceId: 'source:fixture-ms2-1',
  taxonomyVersion: 'v1',
  servingScopeId: 'backend/nodejs',
  competency: 'api-design',
  difficulty: 3,
  annotationSource: 'curator_reviewed',
  metadataHash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  reviewResult: 'approved',
  status: 'recorded',
  reviewer: 'f7-ms2-facets-product-prove',
};

const FIXTURE_FACETS: ProductSecondaryFacetPayload = {
  competency: 'api-design',
  technology: 'nodejs',
  difficulty: 3,
  seniority: 'mid',
  kind: 'coding',
  language: 'en',
};

console.log('F7 MS2 facets on product path prove — MS1 true · MS2 served · MS3 still false · releaseEvidence=false · ≠HA · ≠R4 closed');
console.log('EXIT=0 ≠ RAG-FUNNEL-01 closed ≠ G-R4-5 closed ≠ 题域已隔离 · await post-prove dual · Ban forge serving');

section('MS0 static anchors present');
for (const [label, path] of [
  ['F7 harness', harnessPath],
  ['F7 eval', evalPath],
  ['F7 slice', slicePath],
  ['r4 status', statusPath],
  ['r4 inventory', inventoryPath],
  ['F6 harness', f6HarnessPath],
  ['F5 harness', f5HarnessPath],
  ['F4 harness', f4HarnessPath],
  ['01A sealed manifest', funnel01aPath],
  ['principal.ts', principalPath],
  ['rag-funnel architecture', funnelArchPath],
  ['F7 MS2 facets product', ms2Path],
  ['F6 MS1 product wire', ms1Path],
  ['F5 product helper', f5HelperPath],
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
const f6Harness = read(f6HarnessPath);
const f5Harness = read(f5HarnessPath);
const f4Harness = read(f4HarnessPath);
const funnel01a = read(funnel01aPath);
const principal = read(principalPath);
const funnelArch = read(funnelArchPath);
const ms2Src = read(ms2Path);
const envExample = read(workerEnvExample);
const preE2e = read(preExecE2e);
const preRag = read(preExecRag);

section('MS1 pin stays true (F6 dual-closed · ≠ flip back)');
const product = classifyPMetaServingProductRemaining();
const serving = classifyPMetaServingRemaining();
const f2 = classifyPMetaRemaining();
A('MS1 marker: MS1_METADATA_REVIEW_RECEIPT_PRODUCT_SERVING_CONSUMER_WIRED=true',
  MS1_METADATA_REVIEW_RECEIPT_PRODUCT_SERVING_CONSUMER_WIRED === true);
A('MS1 classify: routedServingProductConsumerWired=true',
  product.routedServingProductConsumerWired === true);
A('MS1 contract.wired=true', METADATA_REVIEW_RECEIPT_SERVING_PRODUCT_CONTRACT.wired === true);
A('MS1 F3/F2 align wired=true',
  serving.routedServingConsumerWired === true && f2.routedServingWired === true);
A('MS1 F6 harness post_prove_dual_pass (prior)',
  /post_prove_dual_pass/.test(f6Harness));

section('MS2 required secondary facets SERVED on product path (≠ forge)');
A('MS2 marker: MS2_PRODUCT_FACETS_SERVED_ON_PRODUCT_PATH_WIRED=true',
  MS2_PRODUCT_FACETS_SERVED_ON_PRODUCT_PATH_WIRED === true);
A('MS2 serve id pinned',
  MS2_PRODUCT_FACETS_SERVE_ID.includes('serveRequiredSecondaryFacetsOnProductPath'));
A('MS2 plan facets = architecture secondary set (6)',
  MS2_PRODUCT_PATH_FACETS.length === 6
  && REQUIRED_SECONDARY_FACETS.every((f, i) => MS2_PRODUCT_PATH_FACETS[i] === f)
  && MS2_FACETS_SERVED_ON_PRODUCT_PATH.every((f, i) => REQUIRED_SECONDARY_FACETS[i] === f));
A('MS2 classify: productFacetServingPlanPinned=true', product.productFacetServingPlanPinned === true);
A('MS2 classify: facetsServedOnProductPath = required set',
  product.facetsServedOnProductPath.length === 6
  && REQUIRED_SECONDARY_FACETS.every((f, i) => product.facetsServedOnProductPath[i] === f));
A('MS2 F3 align: fullFacetsServed=true · facetsServedOnRoutedPath = required',
  serving.fullFacetsServed === true
  && serving.facetsServedOnRoutedPath.length === 6
  && REQUIRED_SECONDARY_FACETS.every((f, i) => serving.facetsServedOnRoutedPath[i] === f));
A('MS2 F2 align: fullFacetsServed=true', f2.fullFacetsServed === true);
A('MS2 serve: admitted+valid facets → served · deploy=false', (() => {
  const adm = admitMetadataReviewReceiptToProductServing(FIXTURE_APPROVED);
  if (!adm.admitted) return false;
  const r = serveRequiredSecondaryFacetsOnProductPath(adm, FIXTURE_FACETS);
  return r.served === true
    && r.kind === 'ProductFacetsServingAdmission'
    && r.facetsServed.length === 6
    && REQUIRED_SECONDARY_FACETS.every((f, i) => r.facetsServed[i] === f)
    && r.standardDeployHandoff === false
    && r.facetValues.competency === 'api-design'
    && r.servingScopeId === 'backend/nodejs';
})());
A('MS2 serve: non-admitted → fail-closed', (() => {
  const r = serveRequiredSecondaryFacetsOnProductPath({ admitted: false }, FIXTURE_FACETS);
  return r.served === false && r.reason === 'admission_not_admitted';
})());
A('MS2 serve: invalid facet payload → fail-closed', (() => {
  const adm = admitMetadataReviewReceiptToProductServing(FIXTURE_APPROVED);
  if (!adm.admitted) return false;
  const r = serveRequiredSecondaryFacetsOnProductPath(adm, { competency: 'x' });
  return r.served === false && r.reason === 'facet_payload_invalid';
})());
A('MS2 fixture facet payload validates', isValidProductSecondaryFacetPayload(FIXTURE_FACETS) === true);
A('MS2 architecture names secondary facets set',
  /competency/.test(funnelArch)
  && /technology/.test(funnelArch)
  && /difficulty/.test(funnelArch)
  && /seniority/.test(funnelArch)
  && (/secondary facets|受控 secondary/.test(funnelArch) || /kind/.test(funnelArch))
  && /language/.test(funnelArch));
A('MS2 module exports serveRequiredSecondaryFacetsOnProductPath (real serve)',
  /export function serveRequiredSecondaryFacetsOnProductPath/.test(ms2Src)
  && /MS2_PRODUCT_FACETS_SERVED_ON_PRODUCT_PATH_WIRED/.test(ms2Src)
  && (/Ban forge|≠ forge|does NOT invent|Ban forging/i.test(ms2Src)));
A('MS2 only allowed worker src files name MetadataReviewReceipt', (() => {
  const files = walkTsFiles(join(workerRoot, 'src'));
  for (const f of files) {
    if (isAllowedReceiptMention(f)) continue;
    const body = read(f);
    if (/MetadataReviewReceipt|qbank_metadata_review_receipt|metadata_review_receipt/.test(body)) {
      console.log(`  leak: ${f}`);
      return false;
    }
  }
  return true;
})());
A('MS2 inventory / status still list P-META / G-R4-5 open',
  (/P-META/.test(inventory) || /P-META/.test(status))
  && (/G-R4-5|MetadataReviewReceipt|RAG-FUNNEL-01/.test(status) || /P-META/.test(inventory)));

section('MS3 product deploy handoff still open');
A('MS3 classify: productDeployHandoffChecklistNamed=true',
  product.productDeployHandoffChecklistNamed === true);
A('MS3 classify: standardDeployProductHandoff=false (MS3 still open)',
  product.standardDeployProductHandoff === false);
A('MS3 classify: local01AHandoffProveExists=true', product.local01AHandoffProveExists === true);
A('MS3 local handoff prove file present (旁证 ≠ 01)', existsSync(handoffProvePath));
A('MS3 F3 align: standardDeployHandoff=false', serving.standardDeployHandoff === false);
A('MS3 F2 align: standardDeployHandoff=false', f2.standardDeployHandoff === false);

section('MS4 hard pins (MS2 alone ≠ FUNNEL · ≠ R4 · sole 恰 5 · Ban forge · G-R4-3 parallel)');
A('MS4 isProductFunnel01Closed=false (MS3 remain)', isProductFunnel01Closed(product) === false);
A('MS4 isProduct01ANotEqual01=true', isProduct01ANotEqual01(product) === true);
A('MS4 productAlignsWithF3Serving=true', productAlignsWithF3Serving(product, serving) === true);
A('MS4 F3 isServingFunnel01Closed=false · isServing01ANotEqual01=true',
  isServingFunnel01Closed(serving) === false && isServing01ANotEqual01(serving) === true);
A('MS4 F2 isRagFunnel01Closed=false · is01ANotEqual01=true',
  isRagFunnel01Closed(f2) === false && is01ANotEqual01(f2) === true);
A('MS4 servingAlignsWithF2Remaining=true', servingAlignsWithF2Remaining(serving, f2) === true);
A('MS4 gR43PR1ParallelOpen=true', product.gR43PR1ParallelOpen === true);
A('MS4 harness freezes CMD r4-p-meta-ms2-facets-product:prove',
  /r4-p-meta-ms2-facets-product:prove/.test(harness));
A('MS4 harness pins ≠ R4 closed · ≠ FUNNEL-01 closed · ≠ R1 closed · 01A ≠ 01 · releaseEvidence=false · ≠HA · sole 恰 5',
  (/≠ R4 closed|NOT closed|R4 open|仍开/.test(harness))
  && (/≠ RAG-FUNNEL-01|≠ FUNNEL-01|FUNNEL-01 closed/.test(harness))
  && (/≠ R1 closed|R1 closed/.test(harness))
  && (/01A ≠ 01|01A.*≠.*01/.test(harness))
  && /releaseEvidence=false/.test(harness)
  && (/≠HA|Not HA|≠ HA/.test(harness))
  && (/sole 恰 5|恰 5/.test(harness)));
A('MS4 harness Ban forge · MS2 alone ≠ FUNNEL · omits mw-model-op · G-R4-3 parallel',
  (/Ban forge|≠ forge|Ban forging/i.test(harness))
  && (/MS2 alone|wiring MS2 alone|MS3 remain/i.test(harness))
  && (/no.*mw-model-op|omit.*model-op|no model-op/i.test(harness))
  && (/G-R4-3|P-R1/.test(harness) && (/parallel|not preferred|Ban flip/i.test(harness))));
A('MS4 F6 harness post_prove_dual_pass (prior MS1 wire)',
  /post_prove_dual_pass/.test(f6Harness));
A('MS4 F5 harness post_prove_dual_pass (prior)',
  /post_prove_dual_pass/.test(f5Harness));
A('MS4 F4 harness post_prove_dual_pass · G-R4-3 STILL OPEN · no flip (prior)',
  /post_prove_dual_pass/.test(f4Harness)
  && (/G-R4-3|STILL OPEN|still open/.test(f4Harness))
  && (/no flip|≠ flip|Ban flipping|without authorize/i.test(f4Harness)));
A('MS4 eval registers MS2 / E* facets stubs',
  /MS2|E1/.test(evalDoc) && (/MS3|E2/.test(evalDoc) || /MS2-P|E5/.test(evalDoc)));
A('MS4 slice indexes harness+eval',
  /r4-f7-p-meta-ms2-facets-product\.md/.test(slice)
  && /r4-f7-p-meta-ms2-facets-product\.eval\.md/.test(slice));
A('MS4 status pins 题域隔离 NOT closed + releaseEvidence=false',
  /题域隔离 NOT closed/.test(status) && /releaseEvidence=false/.test(status));
A('MS4 status mentions F7 / G-R4-5 / MS2 facets',
  (/F7|p-meta-ms2-facets-product|G-R4-5/.test(status))
  && (/MS2|facets|G-R4-5|P-META/.test(status)));
A('MS4 status / harness: G-R4-5 STILL OPEN · MS3 remain',
  (/G-R4-5 STILL OPEN|G-R4-5.*STILL OPEN|STILL OPEN/.test(status) || /G-R4-5 STILL OPEN/.test(harness))
  && (/MS3/.test(harness) || /MS3/.test(status)));
A('MS4 pre-exec dual reviews exist · verdict pass (docs gate)',
  (/pass|结论.*pass|\*\*pass\*\*/i.test(preE2e))
  && (/pass|结论.*pass|\*\*pass\*\*/i.test(preRag)));
A('MS4 P-R1 default fail-closed still OFF (no flip this knife)',
  isTechRoleFailClosedEnabled({}) === false);
A('MS4 worker.env.example still documents MEETWISE_TECH_ROLE_FAIL_CLOSED=0 (or absent)',
  !envExample || /MEETWISE_TECH_ROLE_FAIL_CLOSED\s*=\s*0/.test(envExample));
A('MS4 prove never assigns MODEL_API_KEY (no invent)',
  !/MODEL_API_KEY\s*=/.test(read(join(here, 'r4-p-meta-ms2-facets-product.proof.ts'))));
A('MS4 SOLE allowlist 恰 5 · F7 NOT on allowlist', (() => {
  const runner = read(join(repoRoot, 'scripts/run-e2e-isolated.mjs'));
  const m = runner.match(/const SOLE_WIRING_ALLOWLIST = new Set\(\[([\s\S]*?)\]\)/);
  if (!m) return false;
  const body = m[1];
  const items = [...body.matchAll(/'([^']+)'/g)].map((x) => x[1]);
  return items.length === 5
    && !body.includes('r4-p-meta-ms2-facets-product')
    && !body.includes('p-meta-ms2');
})());
A('MS4 principal lists qbank_metadata_review_receipt (01A table)',
  /qbank_metadata_review_receipt/.test(principal));
A('MS4 01A ≠ 01 still pinned in manifest',
  (/RAG-FUNNEL-01A|01A/.test(funnel01a))
  && (/RAG-FUNNEL-01/.test(funnel01a))
  && (/≠|不等于|不是|仍未|未进入/.test(funnel01a)));
A('MS4 composition: EXIT=0 ≠ FUNNEL-01/R4/R1/G-R4-5 closed ≠ HA ≠ forge OK', true);

section('MS4 F6 MS1 product wire 旁证 spawn (≠ FUNNEL-01 closed · MS2 now true)');
spawnProve('r4-p-meta-ms1-product-wire', ['r4-p-meta-ms1-product-wire:prove']);

console.log('\n── MS2 facets product summary (F7; await post-prove dual) ──');
console.log(`MS1: routedServingProductConsumerWired=true · contract.wired=true (pin stays)`);
console.log(`MS2: served · required=[${REQUIRED_SECONDARY_FACETS.join(',')}] · serveId=${MS2_PRODUCT_FACETS_SERVE_ID}`);
console.log('MS3: productDeployHandoffChecklistNamed=true · standardDeployProductHandoff=false · local01A prove ≠ 01');
console.log('MS4: 01A ≠ 01 · MS2 alone ≠ FUNNEL/R4/G-R4-5 closed · G-R4-3 parallel · releaseEvidence=false · sole 恰 5 · no P-R1 flip');
console.log('EXIT=0 ≠ RAG-FUNNEL-01 closed ≠ R4 closed ≠ HA ≠ suite green ≠ G-R4-5 closed.');

console.log(failures === 0
  ? '\nOK  r4-p-meta-ms2-facets-product prove (MS2 served; MS1 true; MS3 still false; ≠ FUNNEL-01/R4/G-R4-5 closed; releaseEvidence=false)'
  : `\nFAIL  r4-p-meta-ms2-facets-product prove (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);

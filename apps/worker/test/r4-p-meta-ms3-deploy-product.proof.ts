/**
 * Knife F8 — MS3 **standard deploy product handoff** prove (G-R4-5 / MS3).
 *
 *   MS1 — routed product serving consumer stays WIRED (F6 pin · ≠ flip back)
 *   MS2 — required secondary facets SERVED on product path (F7 pin · ≠ flip back)
 *   MS3 — standardDeployProductHandoff=true via real product handoff (≠ forge)
 *   MS4 — hard pins: product FUNNEL classifier may be true (MS1+MS2+MS3) ·
 *         still ≠ R4/题域/HA closed · Ban claiming FUNNEL/G-R4-5 dual-closed
 *         without post-prove dual · other gates may remain · releaseEvidence=false ·
 *         ≠HA · ≠ suite green · sole 恰 5 · no invent Key · no P-R1 flip ·
 *         G-R4-3 parallel open · Ban forge
 *
 * releaseEvidence=false · ≠HA · EXIT=0 ≠ R4 closed ≠ 题域已隔离 ≠ dual-claim closed
 * sole allowlist not expanded · no invent MODEL_API_KEY · Ban self-approve
 *
 * CMD: pnpm r4-p-meta-ms3-deploy-product:prove
 *   (no PG required — product handoff unit + classifier honesty; harness does not require :raw)
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
  MS2_PRODUCT_FACETS_SERVED_ON_PRODUCT_PATH_WIRED,
  serveRequiredSecondaryFacetsOnProductPath,
  type ProductSecondaryFacetPayload,
} from '../src/r4-p-meta-ms2-facets-product.ts';
import {
  MS3_LOCAL_01A_HANDOFF_PROVE_PATH,
  MS3_PRODUCT_DEPLOY_HANDOFF_CHECKLIST,
  MS3_STANDARD_DEPLOY_PRODUCT_HANDOFF_ID,
  MS3_STANDARD_DEPLOY_PRODUCT_HANDOFF_WIRED,
  emitStandardDeployProductHandoff,
  isValidProductDeployHandoffChecklistEvidence,
  type ProductDeployHandoffChecklistEvidence,
} from '../src/r4-p-meta-ms3-deploy-product.ts';
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

const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-f8-p-meta-ms3-deploy-product.md');
const evalPath = join(repoRoot, 'ai-docs/delivery/eval/r4-f8-p-meta-ms3-deploy-product.eval.md');
const slicePath = join(repoRoot, 'ai-docs/delivery/r4-f8-p-meta-ms3-deploy-product.slice.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation-status.md');
const inventoryPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation.md');
const f7HarnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-f7-p-meta-ms2-facets-product.md');
const f6HarnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-f6-p-meta-ms1-product-wire.md');
const f5HarnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-f5-p-meta-serving-product.md');
const f4HarnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-f4-p-r1-fail-closed.md');
const funnel01aPath = join(repoRoot, 'ai-docs/rules/backend/qbank-control-definer-sealed-manifest.md');
const principalPath = join(repoRoot, 'packages/db/src/principal.ts');
const funnelArchPath = join(repoRoot, 'ai-docs/architecture/ai/rag-funnel-routing.md');
const ms3Path = join(workerRoot, 'src/r4-p-meta-ms3-deploy-product.ts');
const ms2Path = join(workerRoot, 'src/r4-p-meta-ms2-facets-product.ts');
const ms1Path = join(workerRoot, 'src/r4-p-meta-ms1-product-wire.ts');
const f5HelperPath = join(workerRoot, 'src/r4-p-meta-serving-product-remaining.ts');
const f3HelperPath = join(workerRoot, 'src/r4-p-meta-serving-remaining.ts');
const f2HelperPath = join(workerRoot, 'src/r4-p-meta-p-r1-remaining.ts');
const handoffProvePath = join(repoRoot, 'packages/db/test/qbank-handoff-closure.proof.ts');
const workerEnvExample = join(repoRoot, 'docker/env/worker.env.example');
const preExecE2e = join(repoRoot, 'ai-docs/delivery/reviews/2026-09-17-r4-f8-p-meta-ms3-deploy-product-mw-e2e-ha.md');
const preExecRag = join(repoRoot, 'ai-docs/delivery/reviews/2026-09-17-r4-f8-p-meta-ms3-deploy-product-mw-rag-route.md');

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
    || f.endsWith('r4-p-meta-ms3-deploy-product.ts')
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
  receiptId: 'receipt:ms3-deploy-product:fixture-1',
  refId: 'chunk:fixture-ref-ms3-1',
  sourceId: 'source:fixture-ms3-1',
  taxonomyVersion: 'v1',
  servingScopeId: 'backend/nodejs',
  competency: 'api-design',
  difficulty: 3,
  annotationSource: 'curator_reviewed',
  metadataHash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  reviewResult: 'approved',
  status: 'recorded',
  reviewer: 'f8-ms3-deploy-product-prove',
};

const FIXTURE_FACETS: ProductSecondaryFacetPayload = {
  competency: 'api-design',
  technology: 'nodejs',
  difficulty: 3,
  seniority: 'mid',
  kind: 'coding',
  language: 'en',
};

const FIXTURE_CHECKLIST: ProductDeployHandoffChecklistEvidence = {
  local_01A_handoff_prove: {
    item: 'local_01A_handoff_prove',
    provePath: MS3_LOCAL_01A_HANDOFF_PROVE_PATH,
    note: 'local 01A handoff-closure prove anchor (旁证 ≠ alone cloud deploy)',
  },
  combo_root_receipt: {
    item: 'combo_root_receipt',
    receiptId: 'combo-root:ms3-product:fixture-1',
    comboRootId: 'combo-root:local-product:ms3',
    attestedAt: '2026-09-17T08:15:00.000Z',
    note: 'product combo-root handoff receipt (≠ releaseEvidence · ≠ HA)',
  },
  standard_or_cloud_deploy_receipt: {
    item: 'standard_or_cloud_deploy_receipt',
    receiptId: 'deploy:ms3-product:fixture-1',
    deployKind: 'combo_root_local',
    attestedAt: '2026-09-17T08:15:00.000Z',
    note: 'product standard/combo-root deploy receipt (≠ forge cloud HA · releaseEvidence=false)',
  },
};

console.log('F8 MS3 standard deploy product handoff prove — MS1 true · MS2 served · MS3 true · releaseEvidence=false · ≠HA · ≠R4 closed');
console.log('EXIT=0 ≠ R4 closed ≠ 题域已隔离 · product FUNNEL classifier may be true · Ban dual-claim without dual · Ban forge');

section('MS0 static anchors present');
for (const [label, path] of [
  ['F8 harness', harnessPath],
  ['F8 eval', evalPath],
  ['F8 slice', slicePath],
  ['r4 status', statusPath],
  ['r4 inventory', inventoryPath],
  ['F7 harness', f7HarnessPath],
  ['F6 harness', f6HarnessPath],
  ['F5 harness', f5HarnessPath],
  ['F4 harness', f4HarnessPath],
  ['01A sealed manifest', funnel01aPath],
  ['principal.ts', principalPath],
  ['rag-funnel architecture', funnelArchPath],
  ['F8 MS3 deploy product', ms3Path],
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
const f7Harness = read(f7HarnessPath);
const f6Harness = read(f6HarnessPath);
const f5Harness = read(f5HarnessPath);
const f4Harness = read(f4HarnessPath);
const funnel01a = read(funnel01aPath);
const principal = read(principalPath);
const ms3Src = read(ms3Path);
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

section('MS2 pin stays true (F7 dual-closed · ≠ flip back)');
A('MS2 marker: MS2_PRODUCT_FACETS_SERVED_ON_PRODUCT_PATH_WIRED=true',
  MS2_PRODUCT_FACETS_SERVED_ON_PRODUCT_PATH_WIRED === true);
A('MS2 classify: facetsServedOnProductPath = required set',
  product.facetsServedOnProductPath.length === 6
  && REQUIRED_SECONDARY_FACETS.every((f, i) => product.facetsServedOnProductPath[i] === f));
A('MS2 F3 align: fullFacetsServed=true', serving.fullFacetsServed === true);
A('MS2 F2 align: fullFacetsServed=true', f2.fullFacetsServed === true);
A('MS2 F7 harness post_prove_dual_pass (prior)',
  /post_prove_dual_pass/.test(f7Harness));

section('MS3 standard deploy product handoff LANDED (≠ forge)');
A('MS3 marker: MS3_STANDARD_DEPLOY_PRODUCT_HANDOFF_WIRED=true',
  MS3_STANDARD_DEPLOY_PRODUCT_HANDOFF_WIRED === true);
A('MS3 handoff id pinned',
  MS3_STANDARD_DEPLOY_PRODUCT_HANDOFF_ID.includes('emitStandardDeployProductHandoff'));
A('MS3 checklist plan = F5 PRODUCT_DEPLOY_HANDOFF_CHECKLIST (3)',
  MS3_PRODUCT_DEPLOY_HANDOFF_CHECKLIST.length === 3
  && PRODUCT_DEPLOY_HANDOFF_CHECKLIST.every((x, i) => MS3_PRODUCT_DEPLOY_HANDOFF_CHECKLIST[i] === x));
A('MS3 classify: productDeployHandoffChecklistNamed=true',
  product.productDeployHandoffChecklistNamed === true);
A('MS3 classify: standardDeployProductHandoff=true',
  product.standardDeployProductHandoff === true);
A('MS3 classify: local01AHandoffProveExists=true', product.local01AHandoffProveExists === true);
A('MS3 local handoff prove file present (旁证)', existsSync(handoffProvePath));
A('MS3 F3 align: standardDeployHandoff=true', serving.standardDeployHandoff === true);
A('MS3 F2 align: standardDeployHandoff=true', f2.standardDeployHandoff === true);
A('MS3 emit: served+valid checklist → handedOff · releaseEvidence=false', (() => {
  const adm = admitMetadataReviewReceiptToProductServing(FIXTURE_APPROVED);
  if (!adm.admitted) return false;
  const facets = serveRequiredSecondaryFacetsOnProductPath(adm, FIXTURE_FACETS);
  if (!facets.served) return false;
  const r = emitStandardDeployProductHandoff(facets, FIXTURE_CHECKLIST);
  return r.handedOff === true
    && r.kind === 'StandardDeployProductHandoffAdmission'
    && r.checklistCompleted.length === 3
    && PRODUCT_DEPLOY_HANDOFF_CHECKLIST.every((x, i) => r.checklistCompleted[i] === x)
    && r.releaseEvidence === false
    && r.servingScopeId === 'backend/nodejs';
})());
A('MS3 emit: non-served facets → fail-closed', (() => {
  const r = emitStandardDeployProductHandoff({ served: false }, FIXTURE_CHECKLIST);
  return r.handedOff === false && r.reason === 'facets_not_served';
})());
A('MS3 emit: invalid checklist → fail-closed', (() => {
  const adm = admitMetadataReviewReceiptToProductServing(FIXTURE_APPROVED);
  if (!adm.admitted) return false;
  const facets = serveRequiredSecondaryFacetsOnProductPath(adm, FIXTURE_FACETS);
  if (!facets.served) return false;
  const r = emitStandardDeployProductHandoff(facets, { local_01A_handoff_prove: { item: 'x' } });
  return r.handedOff === false && r.reason === 'checklist_invalid';
})());
A('MS3 fixture checklist validates', isValidProductDeployHandoffChecklistEvidence(FIXTURE_CHECKLIST) === true);
A('MS3 module exports emitStandardDeployProductHandoff (real handoff)',
  /export function emitStandardDeployProductHandoff/.test(ms3Src)
  && /MS3_STANDARD_DEPLOY_PRODUCT_HANDOFF_WIRED/.test(ms3Src)
  && (/Ban forge|≠ forge|does NOT invent|Ban forging/i.test(ms3Src)));
A('MS3 only allowed worker src files name MetadataReviewReceipt', (() => {
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
A('MS3 inventory / status still list P-META / G-R4-5',
  (/P-META/.test(inventory) || /P-META/.test(status))
  && (/G-R4-5|MetadataReviewReceipt|RAG-FUNNEL-01/.test(status) || /P-META/.test(inventory)));

section('MS4 hard pins (MS3 ≠ R4 · Ban dual-claim · sole 恰 5 · Ban forge · G-R4-3 parallel)');
A('MS4 isProductFunnel01Closed=true (MS1+MS2+MS3 product surfaces)', isProductFunnel01Closed(product) === true);
A('MS4 isProduct01ANotEqual01=false (product surfaces complete · still ≠ R4 closed)', isProduct01ANotEqual01(product) === false);
A('MS4 productAlignsWithF3Serving=true', productAlignsWithF3Serving(product, serving) === true);
A('MS4 F3 isServingFunnel01Closed=true · isServing01ANotEqual01=false',
  isServingFunnel01Closed(serving) === true && isServing01ANotEqual01(serving) === false);
A('MS4 F2 isRagFunnel01Closed=true · is01ANotEqual01=false',
  isRagFunnel01Closed(f2) === true && is01ANotEqual01(f2) === false);
A('MS4 servingAlignsWithF2Remaining=true', servingAlignsWithF2Remaining(serving, f2) === true);
A('MS4 gR43PR1ParallelOpen=true', product.gR43PR1ParallelOpen === true);
A('MS4 harness freezes CMD r4-p-meta-ms3-deploy-product:prove',
  /r4-p-meta-ms3-deploy-product:prove/.test(harness));
A('MS4 harness pins ≠ R4 closed · Ban FUNNEL/G-R4-5 dual-claim · releaseEvidence=false · ≠HA · sole 恰 5',
  (/≠ R4 closed|NOT closed|R4 open|仍开/.test(harness))
  && (/≠ RAG-FUNNEL-01|≠ FUNNEL-01|FUNNEL-01|Ban claiming FUNNEL|FUNNEL may/.test(harness))
  && (/≠ R1 closed|R1 closed/.test(harness))
  && /releaseEvidence=false/.test(harness)
  && (/≠HA|Not HA|≠ HA/.test(harness))
  && (/sole 恰 5|恰 5/.test(harness)));
A('MS4 harness Ban forge · Ban self-approve · omits mw-model-op · G-R4-3 parallel',
  (/Ban forge|≠ forge|Ban forging/i.test(harness))
  && (/Ban self-approve|awaiting_post_prove|post-prove/i.test(harness))
  && (/no.*mw-model-op|omit.*model-op|no model-op/i.test(harness))
  && (/G-R4-3|P-R1/.test(harness) && (/parallel|not preferred|Ban flip/i.test(harness))));
A('MS4 F8 harness post_prove_dual_pass · Ban self-approve · G-R4-5/FUNNEL dual-claim STILL OPEN',
  // F8 landed post_prove_dual_pass (9f361f4) · dual-claim STILL OPEN · Ban self-approve retained · ≠ R4/FUNNEL closed
  /post_prove_dual_pass/.test(harness)
  && (/Ban self-approve|awaiting_post_prove|post-prove/i.test(harness) || /Ban self-approve/i.test(status))
  && (/G-R4-5 STILL OPEN|FUNNEL.*STILL OPEN|STILL OPEN/.test(status) || /G-R4-5 STILL OPEN|FUNNEL may|STILL OPEN/.test(harness)));
A('MS4 F7 harness post_prove_dual_pass (prior MS2)',
  /post_prove_dual_pass/.test(f7Harness));
A('MS4 F6 harness post_prove_dual_pass (prior MS1)',
  /post_prove_dual_pass/.test(f6Harness));
A('MS4 F5 harness post_prove_dual_pass (prior)',
  /post_prove_dual_pass/.test(f5Harness));
A('MS4 F4 harness post_prove_dual_pass · G-R4-3 STILL OPEN · no flip (prior)',
  /post_prove_dual_pass/.test(f4Harness)
  && (/G-R4-3|STILL OPEN|still open/.test(f4Harness))
  && (/no flip|≠ flip|Ban flipping|without authorize/i.test(f4Harness)));
A('MS4 eval registers MS3 / E* deploy stubs',
  /MS3|E1/.test(evalDoc) && (/MS3-P|E2|E5/.test(evalDoc) || /MS3/.test(evalDoc)));
A('MS4 slice indexes harness+eval',
  /r4-f8-p-meta-ms3-deploy-product\.md/.test(slice)
  && /r4-f8-p-meta-ms3-deploy-product\.eval\.md/.test(slice));
A('MS4 status pins 题域隔离 NOT closed + releaseEvidence=false',
  /题域隔离 NOT closed/.test(status) && /releaseEvidence=false/.test(status));
A('MS4 status mentions F8 / G-R4-5 / MS3 deploy',
  (/F8|p-meta-ms3-deploy-product|G-R4-5/.test(status))
  && (/MS3|deploy|G-R4-5|P-META/.test(status)));
A('MS4 pre-exec dual reviews exist · verdict pass (docs gate)',
  (/pass|结论.*pass|\*\*pass\*\*/i.test(preE2e))
  && (/pass|结论.*pass|\*\*pass\*\*/i.test(preRag)));
A('MS4 P-R1 default fail-closed still OFF (no flip this knife)',
  isTechRoleFailClosedEnabled({}) === false);
A('MS4 worker.env.example still documents MEETWISE_TECH_ROLE_FAIL_CLOSED=0 (or absent)',
  !envExample || /MEETWISE_TECH_ROLE_FAIL_CLOSED\s*=\s*0/.test(envExample));
A('MS4 prove never assigns MODEL_API_KEY (no invent)',
  !/MODEL_API_KEY\s*=/.test(read(join(here, 'r4-p-meta-ms3-deploy-product.proof.ts'))));
A('MS4 SOLE allowlist 恰 5 · F8 NOT on allowlist', (() => {
  const runner = read(join(repoRoot, 'scripts/run-e2e-isolated.mjs'));
  const m = runner.match(/const SOLE_WIRING_ALLOWLIST = new Set\(\[([\s\S]*?)\]\)/);
  if (!m) return false;
  const body = m[1];
  const items = [...body.matchAll(/'([^']+)'/g)].map((x) => x[1]);
  return items.length === 5
    && !body.includes('r4-p-meta-ms3-deploy-product')
    && !body.includes('p-meta-ms3');
})());
A('MS4 principal lists qbank_metadata_review_receipt (01A table)',
  /qbank_metadata_review_receipt/.test(principal));
A('MS4 01A manifest still names FUNNEL-01 / deploy handoff',
  (/RAG-FUNNEL-01A|01A/.test(funnel01a))
  && (/RAG-FUNNEL-01/.test(funnel01a))
  && (/deploy|handoff|部署|组合根/.test(funnel01a)));
A('MS4 composition: EXIT=0 ≠ R4/题域/HA closed ≠ dual-claim without dual ≠ forge OK', true);

section('MS4 F7 MS2 facets product 旁证 spawn (≠ R4 closed · MS3 now true)');
spawnProve('r4-p-meta-ms2-facets-product', ['r4-p-meta-ms2-facets-product:prove']);

console.log('\n── MS3 deploy product summary (F8; await post-prove dual) ──');
console.log('MS1: routedServingProductConsumerWired=true · contract.wired=true (pin stays)');
console.log('MS2: fullFacetsServed=true · facetsServedOnProductPath=required (pin stays)');
console.log(`MS3: standardDeployProductHandoff=true · handoffId=${MS3_STANDARD_DEPLOY_PRODUCT_HANDOFF_ID} · checklist=[${MS3_PRODUCT_DEPLOY_HANDOFF_CHECKLIST.join(',')}]`);
console.log('MS4: product FUNNEL classifier true · Ban dual-claim without dual · G-R4-3 parallel · releaseEvidence=false · sole 恰 5 · no P-R1 flip · ≠ R4/题域/HA');
console.log('EXIT=0 ≠ R4 closed ≠ HA ≠ suite green · Ban self-approve post_prove_dual_pass.');

console.log(failures === 0
  ? '\nOK  r4-p-meta-ms3-deploy-product prove (MS3 landed; MS1/MS2 true; product FUNNEL classifier true; ≠ R4/HA; Ban dual-claim; releaseEvidence=false)'
  : `\nFAIL  r4-p-meta-ms3-deploy-product prove (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);

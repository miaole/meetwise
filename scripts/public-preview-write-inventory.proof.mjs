import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  extractMutatingHttpRoutes,
  inventoryPath,
  listPublicHttpWriteSurfaces,
  validatePublicPreviewWriteInventory,
} from './public-preview-write-inventory.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(inventoryPath(repoRoot), 'utf8'));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validate(candidate) {
  return validatePublicPreviewWriteInventory(candidate, { repoRoot });
}

function expectError(candidate, prefix) {
  const result = validate(candidate);
  assert.equal(result.valid, false, `expected ${prefix} to fail: ${result.errors.join(', ')}`);
  assert.ok(result.errors.some((error) => error.startsWith(prefix)), `missing ${prefix}: ${result.errors.join(', ')}`);
}

const checks = {
  'TC-public-preview-01-main-inventory': () => {
    const result = validate(manifest);
    assert.equal(result.valid, true, result.errors.join('\n'));
    assert.equal(result.stats.releaseEvidence, false);
    assert.ok(result.stats.publicHttpWriteCount >= 1, 'at least one public HTTP write surface');
    assert.ok(result.stats.serviceFenceCount >= 1, 'at least one service fence');
    const scoring = manifest.surfaces.find((surface) => surface.id === 'api-interview-assessment');
    assert.equal(scoring?.disposition, 'fenced');
    assert.ok(scoring?.fences.includes('service-write-fence'));
  },
  'TC-public-preview-01-E3-unregistered-route': () => {
    const candidate = clone(manifest);
    candidate.surfaces = candidate.surfaces.filter((surface) => surface.id !== 'api-interview-turn');
    expectError(candidate, 'http_route_unregistered:POST:/interview/:id/turn:turn');
  },
  'TC-public-preview-01-E1-unfenced-public': () => {
    const candidate = clone(manifest);
    const assessment = candidate.surfaces.find((surface) => surface.id === 'api-interview-assessment');
    assessment.fences = [];
    assessment.disposition = 'not-public';
    expectError(candidate, 'surface_unfenced:api-interview-assessment');
    expectError(candidate, 'public_surface_not_fenced:api-interview-assessment');
  },
  'TC-public-preview-01-E6-service-fence-required': () => {
    const candidate = clone(manifest);
    const assessment = candidate.surfaces.find((surface) => surface.id === 'api-interview-assessment');
    assessment.handler = 'notARealMethod';
    expectError(candidate, 'service_fence_missing:api-interview-assessment:notARealMethod');
  },
  'TC-public-preview-01-E6-no-release-overclaim': () => {
    const candidate = clone(manifest);
    candidate.mode = 'enforce';
    candidate.releaseEvidence = true;
    expectError(candidate, 'mode_must_be_observe_and_fence');
    expectError(candidate, 'release_evidence_must_be_false');
  },
  'TC-public-preview-01-E5-get-must-stay-readonly': () => {
    const interviewController = readFileSync(resolve(repoRoot, 'apps/api/src/modules/interview/interview.controller.ts'), 'utf8');
    const routes = extractMutatingHttpRoutes(interviewController, 'apps/api/src/modules/interview/interview.controller.ts');
    assert.ok(routes.some((route) => route.path === '/interview/:id/turn'));
    const publicHttp = listPublicHttpWriteSurfaces(manifest);
    assert.equal(publicHttp.every((surface) => ['POST', 'PUT', 'PATCH', 'DELETE'].includes(surface.method)), true);
  },
};

for (const [id, check] of Object.entries(checks)) {
  check();
  console.log(`✓ ${id}`);
}
console.log(`static_public_preview_write_inventory_proof_valid: selected=${Object.keys(checks).length}/${Object.keys(checks).length}; releaseEvidence=false`);

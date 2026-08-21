import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProviderEgressInventory } from './provider-egress-inventory.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = resolve(repoRoot, 'ai-docs/architecture/ai/provider-egress-inventory.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validate(candidate) {
  return validateProviderEgressInventory(candidate, { repoRoot });
}

function expectError(candidate, prefix) {
  const result = validate(candidate);
  assert.equal(result.valid, false, `expected ${prefix} to fail`);
  assert.ok(result.errors.some((error) => error.startsWith(prefix)), `missing ${prefix}: ${result.errors.join(', ')}`);
}

const checks = {
  'TC-MODEL-002-E3-inventory-main': () => {
    const result = validate(manifest);
    assert.equal(result.valid, true, result.errors.join('\n'));
    assert.equal(result.stats.adapterCount, 5);
    assert.equal(result.stats.operationCount, 10);
    assert.equal(result.stats.registeredConsumerSourcePairCount, 28);
    assert.equal(result.stats.environmentReferenceCount, 175);
    assert.equal(result.stats.releaseEvidence, false);
  },
  'TC-MODEL-002-E3-inventory-missing-operation': () => {
    const candidate = clone(manifest);
    candidate.operations = candidate.operations.filter((operation) => operation.id !== 'provider-signed-download');
    expectError(candidate, 'required_operation_missing:provider-signed-download');
  },
  'TC-MODEL-002-E3-inventory-policy-cannot-self-shrink': () => {
    const candidate = clone(manifest);
    candidate.requiredOperationIds = candidate.requiredOperationIds.filter((id) => id !== 'chat' && id !== 'vision-ocr');
    candidate.operations = candidate.operations.filter((operation) => operation.id !== 'chat' && operation.id !== 'vision-ocr');
    candidate.adapters = candidate.adapters.filter((adapter) => adapter.id !== 'openai-compatible-chat');
    expectError(candidate, 'policy_adapter_missing:openai-compatible-chat');
    expectError(candidate, 'policy_operation_missing:chat');
    expectError(candidate, 'policy_operation_missing:vision-ocr');
  },
  'TC-MODEL-002-E3-inventory-unregistered-adapter-consumer': () => {
    const candidate = clone(manifest);
    candidate.adapters.find((adapter) => adapter.id === 'openai-compatible-chat').consumers = candidate.adapters
      .find((adapter) => adapter.id === 'openai-compatible-chat').consumers
      .filter((consumer) => consumer.source !== 'apps/worker/src/interview-service.ts');
    expectError(candidate, 'adapter_consumer_unregistered:openai-compatible-chat:apps/worker/src/interview-service.ts');
  },
  'TC-MODEL-002-E3-inventory-unregistered-environment': () => {
    const candidate = clone(manifest);
    candidate.environmentReferences = candidate.environmentReferences.filter((entry) => !(entry.name === 'MODEL_BACKUP_API_KEY' && entry.source === 'apps/worker/src/interview-service.ts'));
    expectError(candidate, 'environment_reference_unregistered:MODEL_BACKUP_API_KEY:apps/worker/src/interview-service.ts');
  },
  'TC-MODEL-002-E3-inventory-unregistered-transport': () => {
    const candidate = clone(manifest);
    candidate.transportSources = candidate.transportSources.filter((source) => source !== 'packages/ai-runtime/src/voice-stream.ts');
    expectError(candidate, 'transport_source_unregistered:packages/ai-runtime/src/voice-stream.ts');
  },
  'TC-MODEL-002-E3-inventory-no-release-overclaim': () => {
    const candidate = clone(manifest);
    candidate.mode = 'enforce';
    candidate.releaseEvidence = true;
    expectError(candidate, 'mode_must_be_observe_only');
    expectError(candidate, 'release_evidence_must_be_false');
  },
};

for (const [id, check] of Object.entries(checks)) {
  check();
  console.log(`✓ ${id}`);
}
console.log(`static_provider_egress_inventory_proof_valid: selected=${Object.keys(checks).length}/${Object.keys(checks).length}; releaseEvidence=false`);

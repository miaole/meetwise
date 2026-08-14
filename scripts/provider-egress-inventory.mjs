/**
 * Observe-only provider-egress inventory.
 *
 * This deliberately does not start services, read environment variables, call a
 * provider, upload an artifact, or claim that a network policy is enforced.
 * It makes the current direct-model egress surface explicit and fails when a
 * known adapter call, model configuration reference, or direct transport source
 * is not represented by the versioned inventory.
 */
import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REQUIRED_PROVIDER_EGRESS_POLICY } from './provider-egress-policy.mjs';

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts', '.mjs', '.cjs', '.js']);
const SKIPPED_DIRECTORIES = new Set(['.git', '.next', 'dist', 'build', 'coverage', 'node_modules']);
const TRANSPORT_SOURCE_PATTERN = /\bfetch\s*\(|\bnew\s+WebSocket\s*\(/;
const PROVIDER_LITERAL_PATTERN = /(?:https?|wss?):\/\/[^\s"'`]*dashscope\.aliyuncs\.com/i;
const ALLOWED_TRANSPORTS = new Set(['https', 'websocket', 'provider-signed-download']);
const ALLOWED_MODES = new Set(['observe-only']);
const REQUIRED_CLASSES = new Set(['production-runtime', 'manual-live-smoke', 'manual-evaluation', 'local-adapter-test']);
const INVENTORY_TOOL_SOURCES = new Set([
  'scripts/provider-egress-inventory.mjs',
  'scripts/provider-egress-inventory.proof.mjs',
  'scripts/provider-egress-policy.mjs',
]);

function stable(values) {
  return [...new Set(values)].sort();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function fileInside(repoRoot, file) {
  if (!nonEmptyString(file) || file.startsWith('/') || file.includes('\0') || file.includes('..')) return false;
  const resolved = resolve(repoRoot, file);
  if (!existsSync(resolved)) return false;
  try {
    const stat = lstatSync(resolved);
    if (!stat.isFile() || stat.isSymbolicLink()) return false;
    const realRoot = realpathSync(repoRoot);
    const realFile = realpathSync(resolved);
    const normalized = relative(realRoot, realFile).split(sep).join('/');
    return !normalized.startsWith('../') && !normalized.includes('/node_modules/');
  } catch { return false; }
}

function walkFiles(root, current = root, output = []) {
  if (!existsSync(current)) return output;
  for (const entry of readdirSync(current)) {
    if (SKIPPED_DIRECTORIES.has(entry)) continue;
    const full = resolve(current, entry);
    const stat = lstatSync(full);
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) {
      walkFiles(root, full, output);
    } else if (stat.isFile() && SOURCE_EXTENSIONS.has(extname(full))) {
      output.push(full);
    }
  }
  return output;
}

function sourceMap(repoRoot, roots) {
  const entries = new Map();
  for (const root of roots) {
    for (const absolute of walkFiles(resolve(repoRoot, root))) {
      const source = relative(repoRoot, absolute).split(sep).join('/');
      entries.set(source, readFileSync(absolute, 'utf8'));
    }
  }
  return entries;
}

function allFactoryNames(adapter) {
  return adapter.factory.split('|').map((value) => value.trim()).filter(Boolean);
}

function policyAdapterById(id) {
  return REQUIRED_PROVIDER_EGRESS_POLICY.adapters.find((adapter) => adapter.id === id);
}

function directCallSources(sources, adapter) {
  const source = adapter.source;
  const patterns = allFactoryNames(adapter).map((factory) => new RegExp(`\\b${escapeRegExp(factory)}\\s*\\(`));
  return stable([...sources.entries()]
    .filter(([path, text]) => path !== source && patterns.some((pattern) => pattern.test(text)))
    .map(([path]) => path));
}

function append(errors, condition, error) {
  if (!condition) errors.push(error);
}

function sourceSet(items, field = 'source') {
  return new Set(items.map((item) => item[field]));
}

export function validateProviderEgressInventory(manifest, { repoRoot } = {}) {
  const errors = [];
  append(errors, isObject(manifest), 'manifest_not_object');
  if (!isObject(manifest)) return { valid: false, errors, stats: {} };
  append(errors, manifest.schemaVersion === 1, 'schema_version_invalid');
  append(errors, ALLOWED_MODES.has(manifest.mode), 'mode_must_be_observe_only');
  append(errors, manifest.releaseEvidence === false, 'release_evidence_must_be_false');
  append(errors, Array.isArray(manifest.requiredOperationIds), 'required_operation_ids_invalid');
  append(errors, Array.isArray(manifest.operations), 'operations_invalid');
  append(errors, Array.isArray(manifest.adapters), 'adapters_invalid');
  append(errors, Array.isArray(manifest.transportSources), 'transport_sources_invalid');
  append(errors, Array.isArray(manifest.providerLiteralFixtureSources), 'provider_literal_fixture_sources_invalid');
  append(errors, Array.isArray(manifest.environmentReferences), 'environment_references_invalid');
  append(errors, Array.isArray(manifest.deploymentReferences), 'deployment_references_invalid');
  if (errors.length > 0) return { valid: false, errors: stable(errors), stats: {} };

  const directSources = sourceMap(repoRoot, ['apps', 'packages']);
  const configSources = sourceMap(repoRoot, ['apps', 'packages', 'scripts']);
  const aiRuntimeSources = sourceMap(repoRoot, ['packages/ai-runtime/src']);
  const deploymentSources = new Map();
  for (const source of ['docker/compose.prod.yml', 'docker/env/worker.env.example']) {
    if (fileInside(repoRoot, source)) deploymentSources.set(source, readFileSync(resolve(repoRoot, source), 'utf8'));
  }

  const adapterIds = new Set();
  const declaredAdapterSources = new Set();
  for (const adapter of manifest.adapters) {
    append(errors, isObject(adapter), 'adapter_invalid');
    if (!isObject(adapter)) continue;
    append(errors, nonEmptyString(adapter.id), 'adapter_id_invalid');
    append(errors, !adapterIds.has(adapter.id), `adapter_duplicate:${adapter.id}`);
    adapterIds.add(adapter.id);
    const policyAdapter = policyAdapterById(adapter.id);
    append(errors, Boolean(policyAdapter), `adapter_not_in_policy:${adapter.id}`);
    append(errors, fileInside(repoRoot, adapter.source), `adapter_source_invalid:${adapter.id}`);
    append(errors, nonEmptyString(adapter.factory), `adapter_factory_invalid:${adapter.id}`);
    append(errors, Array.isArray(adapter.transports) && adapter.transports.length > 0 && adapter.transports.every((transport) => ALLOWED_TRANSPORTS.has(transport)), `adapter_transports_invalid:${adapter.id}`);
    append(errors, Array.isArray(adapter.credentialEnv), `adapter_credential_env_invalid:${adapter.id}`);
    append(errors, Array.isArray(adapter.endpointEnv), `adapter_endpoint_env_invalid:${adapter.id}`);
    append(errors, Array.isArray(adapter.dataClasses) && adapter.dataClasses.length > 0, `adapter_data_classes_invalid:${adapter.id}`);
    append(errors, Array.isArray(adapter.consumers), `adapter_consumers_invalid:${adapter.id}`);
    if (!fileInside(repoRoot, adapter.source) || !nonEmptyString(adapter.factory) || !Array.isArray(adapter.consumers)) continue;
    if (policyAdapter) {
      append(errors, adapter.source === policyAdapter.source, `policy_adapter_source_mismatch:${adapter.id}`);
      append(errors, JSON.stringify(allFactoryNames(adapter)) === JSON.stringify(policyAdapter.factories), `policy_adapter_factories_mismatch:${adapter.id}`);
    }
    declaredAdapterSources.add(adapter.source);
    const adapterText = readFileSync(resolve(repoRoot, adapter.source), 'utf8');
    for (const factory of allFactoryNames(adapter)) {
      append(errors, new RegExp(`export\\s+function\\s+${escapeRegExp(factory)}\\b`).test(adapterText), `adapter_factory_missing:${adapter.id}:${factory}`);
    }
    const consumers = adapter.consumers;
    const declaredConsumers = sourceSet(consumers);
    append(errors, declaredConsumers.size === consumers.length, `adapter_consumer_duplicate:${adapter.id}`);
    for (const consumer of consumers) {
      append(errors, isObject(consumer) && fileInside(repoRoot, consumer.source), `adapter_consumer_source_invalid:${adapter.id}:${consumer?.source}`);
      append(errors, isObject(consumer) && REQUIRED_CLASSES.has(consumer.class), `adapter_consumer_class_invalid:${adapter.id}:${consumer?.source}`);
    }
    const actualConsumers = new Set(directCallSources(directSources, adapter));
    for (const source of stable([...actualConsumers].filter((path) => !declaredConsumers.has(path)))) errors.push(`adapter_consumer_unregistered:${adapter.id}:${source}`);
    for (const source of stable([...declaredConsumers].filter((path) => !actualConsumers.has(path)))) errors.push(`adapter_consumer_not_direct_call:${adapter.id}:${source}`);
  }
  for (const policyAdapter of REQUIRED_PROVIDER_EGRESS_POLICY.adapters)
    append(errors, adapterIds.has(policyAdapter.id), `policy_adapter_missing:${policyAdapter.id}`);

  const operationIds = new Set();
  for (const operation of manifest.operations) {
    append(errors, isObject(operation) && nonEmptyString(operation.id), 'operation_invalid');
    if (!isObject(operation) || !nonEmptyString(operation.id)) continue;
    append(errors, !operationIds.has(operation.id), `operation_duplicate:${operation.id}`);
    operationIds.add(operation.id);
    append(errors, adapterIds.has(operation.adapterId), `operation_adapter_unknown:${operation.id}:${operation.adapterId}`);
    append(errors, nonEmptyString(operation.currentAvailability), `operation_availability_invalid:${operation.id}`);
  }
  const requiredOperations = new Set(manifest.requiredOperationIds);
  for (const operation of requiredOperations) append(errors, operationIds.has(operation), `required_operation_missing:${operation}`);
  for (const operation of operationIds) append(errors, requiredOperations.has(operation), `operation_not_required:${operation}`);
  const policyOperations = new Set(REQUIRED_PROVIDER_EGRESS_POLICY.adapters.flatMap((adapter) => adapter.operations));
  for (const operation of policyOperations) append(errors, operationIds.has(operation), `policy_operation_missing:${operation}`);
  for (const operation of operationIds) append(errors, policyOperations.has(operation), `operation_not_in_policy:${operation}`);
  for (const policyAdapter of REQUIRED_PROVIDER_EGRESS_POLICY.adapters) {
    const declaredOperations = new Set(manifest.operations.filter((operation) => operation?.adapterId === policyAdapter.id).map((operation) => operation.id));
    for (const operation of policyAdapter.operations) append(errors, declaredOperations.has(operation), `policy_operation_adapter_mismatch:${policyAdapter.id}:${operation}`);
  }

  const actualTransportSources = new Set([...aiRuntimeSources.entries()]
    .filter(([, text]) => TRANSPORT_SOURCE_PATTERN.test(text))
    .map(([source]) => source));
  const declaredTransportSources = new Set(manifest.transportSources);
  const policyTransportSources = new Set(REQUIRED_PROVIDER_EGRESS_POLICY.directTransportSources);
  for (const source of declaredTransportSources) append(errors, fileInside(repoRoot, source), `transport_source_invalid:${source}`);
  for (const source of stable([...actualTransportSources].filter((path) => !declaredTransportSources.has(path)))) errors.push(`transport_source_unregistered:${source}`);
  for (const source of stable([...declaredTransportSources].filter((path) => !actualTransportSources.has(path)))) errors.push(`transport_source_not_direct:${source}`);
  for (const source of policyTransportSources) append(errors, declaredTransportSources.has(source), `policy_transport_source_missing:${source}`);
  for (const source of declaredTransportSources) append(errors, policyTransportSources.has(source), `transport_source_not_in_policy:${source}`);

  const actualProviderLiteralSources = new Set([...directSources.entries()]
    .filter(([, text]) => PROVIDER_LITERAL_PATTERN.test(text))
    .map(([source]) => source));
  const providerLiteralFixtures = new Set(manifest.providerLiteralFixtureSources);
  for (const source of providerLiteralFixtures) append(errors, fileInside(repoRoot, source), `provider_literal_fixture_source_invalid:${source}`);
  for (const source of stable([...actualProviderLiteralSources].filter((path) => !declaredAdapterSources.has(path) && !providerLiteralFixtures.has(path)))) errors.push(`provider_literal_source_unregistered:${source}`);
  for (const source of stable([...providerLiteralFixtures].filter((path) => !actualProviderLiteralSources.has(path)))) errors.push(`provider_literal_fixture_source_not_found:${source}`);

  const envNames = stable([...new Set([...REQUIRED_PROVIDER_EGRESS_POLICY.environmentNames, ...manifest.environmentReferences.map((entry) => entry?.name)])]);
  for (const envName of envNames) {
    append(errors, nonEmptyString(envName), 'environment_name_invalid');
    const directPattern = new RegExp(`\\b${escapeRegExp(envName)}\\b`);
    const actualSources = new Set([...configSources.entries()]
      .filter(([source]) => !INVENTORY_TOOL_SOURCES.has(source))
      .filter(([, text]) => directPattern.test(text))
      .map(([source]) => source));
    const declaredSources = new Set(manifest.environmentReferences.filter((entry) => entry?.name === envName).map((entry) => entry.source));
    for (const entry of manifest.environmentReferences.filter((item) => item?.name === envName)) {
      append(errors, isObject(entry) && fileInside(repoRoot, entry.source), `environment_reference_source_invalid:${envName}:${entry?.source}`);
      append(errors, isObject(entry) && nonEmptyString(entry.class), `environment_reference_class_invalid:${envName}:${entry?.source}`);
    }
    for (const source of stable([...actualSources].filter((path) => !declaredSources.has(path)))) errors.push(`environment_reference_unregistered:${envName}:${source}`);
    for (const source of stable([...declaredSources].filter((path) => !actualSources.has(path)))) errors.push(`environment_reference_not_found:${envName}:${source}`);
  }

  const actualDeploymentReferences = new Map();
  for (const [source, text] of deploymentSources) {
    for (const envName of envNames) {
      if (new RegExp(`\\b${escapeRegExp(envName)}\\b`).test(text)) {
        if (!actualDeploymentReferences.has(source)) actualDeploymentReferences.set(source, new Set());
        actualDeploymentReferences.get(source).add(envName);
      }
    }
  }
  const declaredDeploymentReferences = new Map();
  for (const entry of manifest.deploymentReferences) {
    append(errors, isObject(entry) && fileInside(repoRoot, entry.source), `deployment_reference_source_invalid:${entry?.source}`);
    append(errors, isObject(entry) && Array.isArray(entry.keys), `deployment_reference_keys_invalid:${entry?.source}`);
    if (!isObject(entry) || !Array.isArray(entry.keys)) continue;
    append(errors, !declaredDeploymentReferences.has(entry.source), `deployment_reference_duplicate:${entry.source}`);
    declaredDeploymentReferences.set(entry.source, new Set(entry.keys));
  }
  for (const [source, keys] of actualDeploymentReferences) {
    const declared = declaredDeploymentReferences.get(source) ?? new Set();
    for (const key of stable([...keys].filter((key) => !declared.has(key)))) errors.push(`deployment_reference_unregistered:${source}:${key}`);
  }
  for (const [source, keys] of declaredDeploymentReferences) {
    const actual = actualDeploymentReferences.get(source) ?? new Set();
    for (const key of stable([...keys].filter((key) => !actual.has(key)))) errors.push(`deployment_reference_not_found:${source}:${key}`);
  }

  const uniqueErrors = stable(errors);
  return {
    valid: uniqueErrors.length === 0,
    errors: uniqueErrors,
    stats: {
      adapterCount: manifest.adapters.length,
      operationCount: manifest.operations.length,
      registeredConsumerSourcePairCount: manifest.adapters.reduce((total, adapter) => total + (Array.isArray(adapter.consumers) ? adapter.consumers.length : 0), 0),
      environmentReferenceCount: manifest.environmentReferences.length,
      transportSourceCount: manifest.transportSources.length,
      releaseEvidence: false,
    },
  };
}

function main() {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const inventoryPath = resolve(repoRoot, 'ai-docs/architecture/ai/provider-egress-inventory.json');
  const manifest = JSON.parse(readFileSync(inventoryPath, 'utf8'));
  const result = validateProviderEgressInventory(manifest, { repoRoot });
  if (!result.valid) throw new Error(`provider_egress_inventory_invalid:\n${result.errors.join('\n')}`);
  console.log(`static_provider_egress_inventory_valid: adapters=${result.stats.adapterCount}; operations=${result.stats.operationCount}; registered_consumer_source_pairs=${result.stats.registeredConsumerSourcePairCount}; environment_references=${result.stats.environmentReferenceCount}; releaseEvidence=false`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();

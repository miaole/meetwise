/**
 * Read-only receipt verifier for the hosted synthetic Langfuse datasets.
 *
 * This is deliberately not an Experiment (实验) or a quality claim. It proves
 * only that every checked-in, non-sensitive catalog item was read back from
 * the configured test project unchanged after a sync.
 */
import { LangfuseClient } from '@langfuse/client';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  LANGFUSE_DATASET_NAMES,
  OFFLINE_EVALUATION_CATALOG_V1,
  evaluationManifestDigest,
  langfuseDatasetExpectedOutput,
  langfuseDatasetMetadata,
  resolveLangfuseConnection,
  validateOfflineEvaluationCatalog,
  type EvaluationCase,
  type EvaluationDatasetKind,
} from '../src/index.ts';

const localEnvPath = fileURLToPath(new URL('../../../.env', import.meta.url));
if (existsSync(localEnvPath)) {
  for (const line of readFileSync(localEnvPath, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2]!.replace(/^["']|["']$/g, '');
  }
}

function canonical(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  const row = value as Record<string, unknown>;
  return `{${Object.keys(row).sort().map((key) => `${JSON.stringify(key)}:${canonical(row[key])}`).join(',')}}`;
}

function same(a: unknown, b: unknown): boolean {
  return canonical(a) === canonical(b);
}

function requireReceipt(condition: boolean, code: string): void {
  if (!condition) throw new Error(code);
}

function groupedCases(): Map<EvaluationDatasetKind, EvaluationCase[]> {
  const groups = new Map<EvaluationDatasetKind, EvaluationCase[]>();
  for (const entry of OFFLINE_EVALUATION_CATALOG_V1.cases) {
    const entries = groups.get(entry.dataset) ?? [];
    entries.push(entry);
    groups.set(entry.dataset, entries);
  }
  return groups;
}

async function main(): Promise<void> {
  validateOfflineEvaluationCatalog(OFFLINE_EVALUATION_CATALOG_V1);
  const config = resolveLangfuseConnection(process.env);
  if (!config.enabled || !config.baseUrl || !config.publicKey || !config.secretKey) {
    throw new Error('langfuse_dataset_verify_requires_enabled_config');
  }
  const digest = evaluationManifestDigest(OFFLINE_EVALUATION_CATALOG_V1);
  const client = new LangfuseClient({ publicKey: config.publicKey, secretKey: config.secretKey, baseUrl: config.baseUrl });
  const groups = groupedCases();

  for (const kind of Object.keys(LANGFUSE_DATASET_NAMES) as EvaluationDatasetKind[]) {
    const datasetName = LANGFUSE_DATASET_NAMES[kind];
    const expected = groups.get(kind) ?? [];
    requireReceipt(expected.length > 0, 'langfuse_dataset_verify_partition_empty');
    const dataset = await client.dataset.get(datasetName, { fetchItemsPageSize: 100 });
    requireReceipt(same(dataset.metadata?.catalogRevision, OFFLINE_EVALUATION_CATALOG_V1.revision), 'langfuse_dataset_verify_revision_mismatch');
    requireReceipt(same(dataset.metadata?.catalogDigest, digest), 'langfuse_dataset_verify_digest_mismatch');
    requireReceipt(same(dataset.metadata?.sourcePolicy, 'synthetic_only'), 'langfuse_dataset_verify_source_policy_mismatch');

    const actualById = new Map(dataset.items.map((item) => [item.id, item]));
    const expectedIds = new Set(expected.map((entry) => `${entry.caseId}@${entry.caseVersion}`));
    requireReceipt(actualById.size === expectedIds.size, 'langfuse_dataset_verify_item_count_mismatch');
    for (const entry of expected) {
      const id = `${entry.caseId}@${entry.caseVersion}`;
      const item = actualById.get(id);
      requireReceipt(Boolean(item), 'langfuse_dataset_verify_item_missing');
      requireReceipt(same(item!.input, entry.input), 'langfuse_dataset_verify_input_mismatch');
      requireReceipt(same(item!.expectedOutput, langfuseDatasetExpectedOutput(entry)), 'langfuse_dataset_verify_expected_output_mismatch');
      requireReceipt(same(item!.metadata, langfuseDatasetMetadata(entry)), 'langfuse_dataset_verify_metadata_mismatch');
    }
    requireReceipt([...actualById.keys()].every((id) => expectedIds.has(id)), 'langfuse_dataset_verify_unexpected_item');
    console.log(`VERIFIED dataset=${datasetName} syntheticItems=${expected.length} catalogDigest=${digest}`);
  }
}

main().catch((error: unknown) => {
  // Never render SDK payloads: they can contain endpoints or diagnostics.
  console.error(error instanceof Error ? error.message : 'langfuse_dataset_verify_failed');
  process.exit(1);
});

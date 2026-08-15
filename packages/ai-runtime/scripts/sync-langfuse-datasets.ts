/**
 * Uploads only the checked-in synthetic offline catalog to the configured
 * Langfuse test project. It never reads a trace, database row, or user input.
 * Set LANGFUSE_DATASET_SYNC_APPLY=1 deliberately; dry runs perform no writes.
 */
import { LangfuseClient } from '@langfuse/client';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  OFFLINE_EVALUATION_CATALOG_V1,
  evaluationManifestDigest,
  LANGFUSE_DATASET_NAMES,
  langfuseDatasetExpectedOutput,
  langfuseDatasetMetadata,
  resolveLangfuseConnection,
  validateOfflineEvaluationCatalog,
  type EvaluationCase,
  type EvaluationDatasetKind,
} from '../src/index.ts';

// Match the manual smoke convention without overriding shell/CI credentials.
const localEnvPath = fileURLToPath(new URL('../../../.env', import.meta.url));
if (existsSync(localEnvPath)) {
  for (const line of readFileSync(localEnvPath, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2]!.replace(/^["']|["']$/g, '');
  }
}

async function hasDataset(client: LangfuseClient, name: string): Promise<boolean> {
  try {
    await client.api.datasets.get(name, { maxRetries: 0, timeoutInSeconds: 15 });
    return true;
  } catch (error: unknown) {
    const status = typeof error === 'object' && error && 'statusCode' in error
      ? Number((error as { statusCode?: unknown }).statusCode)
      : undefined;
    if (status === 404) return false;
    throw new Error('langfuse_dataset_lookup_failed');
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

/**
 * A frozen partition is append-only from this runner's perspective.  Updating
 * an existing item in place would make a successful sync look like a
 * reproducible dataset revision while silently changing a dev/holdout sample.
 */
async function assertExactFrozenPartition(
  client: LangfuseClient,
  name: string,
  entries: readonly EvaluationCase[],
  digest: string,
): Promise<void> {
  const dataset = await client.dataset.get(name, { fetchItemsPageSize: 100 });
  if (!same(dataset.metadata?.catalogRevision, OFFLINE_EVALUATION_CATALOG_V1.revision)
    || !same(dataset.metadata?.catalogDigest, digest)
    || !same(dataset.metadata?.sourcePolicy, 'synthetic_only')) {
    throw new Error('langfuse_dataset_sync_immutable_metadata_mismatch');
  }
  const expectedById = new Map(entries.map((entry) => [`${entry.caseId}@${entry.caseVersion}`, entry]));
  const actualById = new Map(dataset.items.map((item) => [item.id, item]));
  if (actualById.size !== expectedById.size) throw new Error('langfuse_dataset_sync_immutable_item_count_mismatch');
  for (const [id, entry] of expectedById) {
    const item = actualById.get(id);
    if (!item
      || !same(item.input, entry.input)
      || !same(item.expectedOutput, langfuseDatasetExpectedOutput(entry))
      || !same(item.metadata, langfuseDatasetMetadata(entry))) {
      throw new Error('langfuse_dataset_sync_immutable_item_mismatch');
    }
  }
  if (![...actualById.keys()].every((id) => expectedById.has(id))) {
    throw new Error('langfuse_dataset_sync_immutable_unexpected_item');
  }
}

async function main(): Promise<void> {
  validateOfflineEvaluationCatalog(OFFLINE_EVALUATION_CATALOG_V1);
  const config = resolveLangfuseConnection(process.env);
  if (!config.enabled || !config.baseUrl || !config.publicKey || !config.secretKey) {
    throw new Error('langfuse_dataset_sync_requires_enabled_config');
  }
  const apply = process.env.LANGFUSE_DATASET_SYNC_APPLY === '1';
  const digest = evaluationManifestDigest(OFFLINE_EVALUATION_CATALOG_V1);
  const client = new LangfuseClient({ publicKey: config.publicKey, secretKey: config.secretKey, baseUrl: config.baseUrl });
  const groups = new Map<EvaluationDatasetKind, EvaluationCase[]>();
  for (const entry of OFFLINE_EVALUATION_CATALOG_V1.cases) {
    const values = groups.get(entry.dataset) ?? [];
    values.push(entry);
    groups.set(entry.dataset, values);
  }

  for (const kind of Object.keys(LANGFUSE_DATASET_NAMES) as EvaluationDatasetKind[]) {
    const name = LANGFUSE_DATASET_NAMES[kind];
    const entries = groups.get(kind) ?? [];
    if (!entries.length) throw new Error('langfuse_dataset_partition_empty');
    const exists = await hasDataset(client, name);
    if (!apply) {
      console.log(`DRY_RUN dataset=${name} exists=${exists} syntheticItems=${entries.length} catalogDigest=${digest}`);
      continue;
    }
    if (exists) {
      await assertExactFrozenPartition(client, name, entries, digest);
      console.log(`UNCHANGED dataset=${name} syntheticItems=${entries.length} catalogDigest=${digest}`);
      continue;
    }
    await client.api.datasets.create({
      name,
      description: `Meetwise synthetic offline ${kind} partition. No production user content.`,
      metadata: { catalogRevision: OFFLINE_EVALUATION_CATALOG_V1.revision, catalogDigest: digest, sourcePolicy: 'synthetic_only' },
    }, { maxRetries: 0, timeoutInSeconds: 15 });
    for (const entry of entries) {
      await client.dataset.createItem({
        id: `${entry.caseId}@${entry.caseVersion}`,
        datasetName: name,
        input: entry.input,
        expectedOutput: langfuseDatasetExpectedOutput(entry),
        metadata: langfuseDatasetMetadata(entry),
      });
    }
    // Hosted API caps a dataset page at 100; exact readback also rejects a
    // duplicate/partial partition rather than accepting a mere ID subset.
    await assertExactFrozenPartition(client, name, entries, digest);
    console.log(`SYNCED dataset=${name} syntheticItems=${entries.length} catalogDigest=${digest}`);
  }
}

main().catch((error: unknown) => {
  // Do not render transport errors: SDK messages can include request URLs and
  // diagnostics. The stable code remains sufficient for CI and runbooks.
  console.error(error instanceof Error ? error.message : 'langfuse_dataset_sync_failed');
  process.exit(1);
});

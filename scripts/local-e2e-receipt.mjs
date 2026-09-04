/**
 * Local E2E（端到端）运行回执：只保存可复核的元数据，绝不保存 stdout、stderr、
 * prompt（提示词）、answer（回答）、令牌或连接串。它刻意不是 release evidence
 * （发布证据）：没有受信任 runner（运行器）身份、不可变对象存储或独立验签。
 */
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const SOURCE_PATHS = Object.freeze([
  'e2e/full.e2e.ts',
  'e2e/helpers/assert.ts',
  'e2e/helpers/auth.ts',
  'e2e/helpers/commerce.ts',
  'e2e/helpers/http.ts',
  'e2e/helpers/interview.ts',
  'e2e/helpers/sse.ts',
  'e2e/helpers/voice.ts',
  'e2e/ocr-fixture.ts',
  'scripts/run-e2e.mjs',
  'scripts/run-e2e-isolated.mjs',
]);

const sha256 = (value) => `sha256:${createHash('sha256').update(value).digest('hex')}`;

function assertReceiptInput({ target, outcome, exitCode, startedAt, finishedAt, assertionCount }) {
  if (target !== 'e2e:prove') throw new Error('local_e2e_receipt_target_invalid');
  if (!['passed', 'failed'].includes(outcome)) throw new Error('local_e2e_receipt_outcome_invalid');
  if (!Number.isInteger(exitCode) || exitCode < 0 || exitCode > 255) throw new Error('local_e2e_receipt_exit_code_invalid');
  if ((outcome === 'passed') !== (exitCode === 0)) throw new Error('local_e2e_receipt_outcome_exit_code_mismatch');
  if (!(startedAt instanceof Date) || Number.isNaN(startedAt.getTime()) || !(finishedAt instanceof Date) || Number.isNaN(finishedAt.getTime()) || finishedAt < startedAt)
    throw new Error('local_e2e_receipt_time_invalid');
  if (assertionCount !== null && (!Number.isInteger(assertionCount) || assertionCount < 0 || assertionCount > 100_000))
    throw new Error('local_e2e_receipt_assertion_count_invalid');
}

async function sourceDigests(repoRoot, paths = SOURCE_PATHS) {
  return Object.fromEntries(await Promise.all(paths.map(async (sourcePath) => [
    sourcePath,
    sha256(await readFile(resolve(repoRoot, sourcePath))),
  ])));
}

function assertRelativeSourcePaths(paths) {
  if (!Array.isArray(paths) || paths.length < 1 || paths.length > 32)
    throw new Error('local_isolated_receipt_source_paths_invalid');
  for (const sourcePath of paths) {
    if (typeof sourcePath !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._/-]{0,240}$/.test(sourcePath)
      || sourcePath.includes('..') || sourcePath.startsWith('/'))
      throw new Error('local_isolated_receipt_source_path_invalid');
  }
}

/**
 * The HTTP suite applies every versioned migration before it executes.  Bind
 * the receipt to the reviewed manifest without persisting SQL bodies, target
 * credentials, or catalog contents.  This is still local/untrusted evidence;
 * it only prevents a later reader from silently attributing a result to a
 * different schema revision.
 */
async function schemaMigrationManifest(repoRoot) {
  const migrationRoot = resolve(repoRoot, 'packages', 'db', 'migrations');
  const files = (await readdir(migrationRoot)).filter((name) => name.endsWith('.sql')).sort();
  if (files.length === 0) throw new Error('local_e2e_receipt_migration_manifest_empty');
  const entries = await Promise.all(files.map(async (name) => ({
    name,
    digest: sha256(await readFile(join(migrationRoot, name))),
  })));
  return {
    count: entries.length,
    latest: entries.at(-1)?.name ?? null,
    digest: sha256(JSON.stringify(entries)),
  };
}

/**
 * Atomically writes one local-only receipt.  `assertionCount` is optional: a
 * missing final summary is explicit rather than guessed from source text.
 */
export async function writeLocalE2EReceipt({
  repoRoot,
  receiptRoot,
  target,
  outcome,
  exitCode,
  startedAt,
  finishedAt,
  assertionCount = null,
}) {
  assertReceiptInput({ target, outcome, exitCode, startedAt, finishedAt, assertionCount });
  const root = resolve(repoRoot);
  const outputRoot = resolve(receiptRoot);
  await mkdir(outputRoot, { recursive: true, mode: 0o700 });
  const receiptId = `${finishedAt.toISOString().replace(/[:.]/g, '-')}-${process.pid}-${randomUUID()}`;
  const finalPath = resolve(outputRoot, `${receiptId}.json`);
  const temporaryPath = resolve(outputRoot, `${receiptId}.partial.json`);
  const receipt = {
    schemaVersion: 1,
    class: 'local_untrusted_e2e_receipt',
    target,
    outcome,
    exitCode,
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    assertionCount,
    sourceDigests: await sourceDigests(root),
    schemaMigrationManifest: await schemaMigrationManifest(root),
    dataHandling: 'no_output_prompt_answer_token_endpoint_or_connection_string_persisted',
    releaseEvidence: false,
  };
  await writeFile(temporaryPath, `${JSON.stringify(receipt, null, 2)}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
  await rename(temporaryPath, finalPath);
  return { receipt, relativePath: relative(root, finalPath), finalPath };
}

/**
 * A target-specific isolated-proof receipt.  Unlike a release receipt it
 * contains no runner identity, immutable storage proof, or child output; it
 * only prevents a local shell's exit code from being lost after its disposable
 * container has been removed.
 */
export async function writeLocalIsolatedReceipt({
  repoRoot,
  receiptRoot,
  target,
  outcome,
  exitCode,
  startedAt,
  finishedAt,
  sourcePaths,
  proofSummary,
  embedderReal,
}) {
  if (typeof target !== 'string' || !/^[a-z][a-z0-9:_-]{0,120}$/.test(target))
    throw new Error('local_isolated_receipt_target_invalid');
  if (!['passed', 'failed'].includes(outcome) || !Number.isInteger(exitCode) || exitCode < 0 || exitCode > 255
    || (outcome === 'passed') !== (exitCode === 0))
    throw new Error('local_isolated_receipt_outcome_invalid');
  if (!(startedAt instanceof Date) || Number.isNaN(startedAt.getTime()) || !(finishedAt instanceof Date)
    || Number.isNaN(finishedAt.getTime()) || finishedAt < startedAt)
    throw new Error('local_isolated_receipt_time_invalid');
  assertRelativeSourcePaths(sourcePaths);
  if (proofSummary !== undefined && (!proofSummary || !Number.isInteger(proofSummary.passCount) || proofSummary.passCount < 0
    || !Number.isInteger(proofSummary.failCount) || proofSummary.failCount < 0
    || typeof proofSummary.failureClass !== 'string' || !/^[a-z0-9_]{1,80}$/.test(proofSummary.failureClass)
    || (proofSummary.failedCheckIds !== undefined && (!Array.isArray(proofSummary.failedCheckIds)
      || proofSummary.failedCheckIds.length !== proofSummary.failCount
      || proofSummary.failedCheckIds.length > 64
      || new Set(proofSummary.failedCheckIds).size !== proofSummary.failedCheckIds.length
      || proofSummary.failedCheckIds.some((id) => typeof id !== 'string' || !/^P(?:PRIV|RES)\d{3}(?:_[A-Z0-9_]{1,64})?$/.test(id))))))
    throw new Error('local_isolated_receipt_proof_summary_invalid');
  if (embedderReal !== undefined && typeof embedderReal !== 'boolean')
    throw new Error('local_isolated_receipt_embedder_real_invalid');
  const root = resolve(repoRoot);
  const outputRoot = resolve(receiptRoot);
  await mkdir(outputRoot, { recursive: true, mode: 0o700 });
  const receiptId = `${finishedAt.toISOString().replace(/[:.]/g, '-')}-${process.pid}-${randomUUID()}`;
  const finalPath = resolve(outputRoot, `${receiptId}.json`);
  const temporaryPath = resolve(outputRoot, `${receiptId}.partial.json`);
  if (!finalPath.startsWith(`${outputRoot}/`) || !temporaryPath.startsWith(`${outputRoot}/`))
    throw new Error('local_isolated_receipt_path_escape');
  const receipt = {
    schemaVersion: 1,
    class: 'local_untrusted_isolated_proof_receipt',
    target,
    outcome,
    exitCode,
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    sourceDigests: await sourceDigests(root, sourcePaths),
    schemaMigrationManifest: await schemaMigrationManifest(root),
    ...(proofSummary ? { proofSummary } : {}),
    ...(embedderReal === undefined ? {} : { embedderReal }),
    dataHandling: 'no_output_prompt_answer_token_endpoint_or_connection_string_persisted',
    releaseEvidence: false,
  };
  await writeFile(temporaryPath, `${JSON.stringify(receipt, null, 2)}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
  await rename(temporaryPath, finalPath);
  return { receipt, relativePath: relative(root, finalPath), finalPath };
}

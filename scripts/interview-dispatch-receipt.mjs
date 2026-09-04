/**
 * Optional remote-Postgres receipt for interview-dispatch:prove.
 *
 * Written only after the remote SQL proof exits 0. Gitignored under
 * `.tmp/interview-dispatch-receipts/`. Not release evidence. Never stores
 * stdout, connection strings, hosts, users, passwords, or user content.
 */
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const SOURCE_PATHS = Object.freeze([
  'scripts/run-interview-dispatch-prove.mjs',
  'scripts/interview-dispatch-remote-gate.mjs',
  'scripts/interview-dispatch-receipt.mjs',
  'apps/worker/src/interview-dispatch-fairness.ts',
  'apps/worker/test/interview-dispatch-fairness-pg.proof.ts',
  'packages/db/migrations/0128_interview_dispatch_fairness.sql',
]);

const sha256 = (value) => `sha256:${createHash('sha256').update(value).digest('hex')}`;

async function sourceDigests(repoRoot) {
  return Object.fromEntries(await Promise.all(SOURCE_PATHS.map(async (sourcePath) => [
    sourcePath,
    sha256(await readFile(resolve(repoRoot, sourcePath))),
  ])));
}

async function schemaMigrationManifest(repoRoot) {
  const migrationRoot = resolve(repoRoot, 'packages', 'db', 'migrations');
  const files = (await readdir(migrationRoot)).filter((name) => name.endsWith('.sql')).sort();
  if (files.length === 0) throw new Error('interview_dispatch_receipt_migration_manifest_empty');
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

export async function writeInterviewDispatchRemoteReceipt({
  repoRoot,
  receiptRoot,
  outcome,
  exitCode,
  startedAt,
  finishedAt,
}) {
  if (outcome !== 'passed' || exitCode !== 0) {
    throw new Error('interview_dispatch_receipt_pass_only');
  }
  if (!(startedAt instanceof Date) || Number.isNaN(startedAt.getTime())
    || !(finishedAt instanceof Date) || Number.isNaN(finishedAt.getTime())
    || finishedAt < startedAt) {
    throw new Error('interview_dispatch_receipt_time_invalid');
  }
  const root = resolve(repoRoot);
  const outputRoot = resolve(receiptRoot);
  await mkdir(outputRoot, { recursive: true, mode: 0o700 });
  const receiptId = `${finishedAt.toISOString().replace(/[:.]/g, '-')}-${process.pid}-${randomUUID()}`;
  const finalPath = resolve(outputRoot, `${receiptId}.json`);
  const temporaryPath = resolve(outputRoot, `${receiptId}.partial.json`);
  if (!finalPath.startsWith(`${outputRoot}/`) || !temporaryPath.startsWith(`${outputRoot}/`)) {
    throw new Error('interview_dispatch_receipt_path_escape');
  }
  const receipt = {
    schemaVersion: 1,
    class: 'remote_untrusted_interview_dispatch_receipt',
    target: 'interview-dispatch:prove',
    outcome,
    exitCode,
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    profile: 'E2E_CLOUD_ISOLATED',
    inventedLocalDocker: false,
    sourceDigests: await sourceDigests(root),
    schemaMigrationManifest: await schemaMigrationManifest(root),
    dataHandling: 'no_output_prompt_answer_token_host_user_password_or_connection_string_persisted',
    releaseEvidence: false,
    perPushCi: false,
    citeIn: 'ai-docs/architecture/current-runtime-truth.md',
  };
  await writeFile(temporaryPath, `${JSON.stringify(receipt, null, 2)}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
  await rename(temporaryPath, finalPath);
  return { receipt, relativePath: relative(root, finalPath), finalPath };
}

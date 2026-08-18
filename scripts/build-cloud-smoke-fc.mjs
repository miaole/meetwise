/**
 * Produces the self-contained, Node.js 20 Function Compute archive for the
 * fixed-readonly cloud smoke. Output stays under .tmp and contains no target
 * address, credential, CA, or secret material.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = resolve(repositoryRoot, '.tmp/cloud-smoke-fc-artifact');
const outputFile = resolve(outputDirectory, 'index.js');
const archiveFile = resolve(outputDirectory, 'meetwise-cloud-smoke-fc.zip');

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true, mode: 0o700 });
await build({
  entryPoints: [resolve(repositoryRoot, 'apps/worker/fc/cloud-smoke-handler.ts')],
  outfile: outputFile,
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  sourcemap: false,
  legalComments: 'none',
  logLevel: 'silent',
});
execFileSync('zip', ['-X', '-q', archiveFile, 'index.js'], { cwd: outputDirectory, stdio: 'inherit' });
const archive = await readFile(archiveFile);
const manifest = {
  kind: 'meetwise_cloud_smoke_fc_artifact',
  schemaVersion: 1,
  runtime: 'nodejs20',
  handler: 'index.handler',
  archive: 'meetwise-cloud-smoke-fc.zip',
  archiveBytes: archive.byteLength,
  archiveSha256: createHash('sha256').update(archive).digest('hex'),
};
await writeFile(resolve(outputDirectory, 'artifact-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
process.stdout.write(`${JSON.stringify(manifest)}\n`);

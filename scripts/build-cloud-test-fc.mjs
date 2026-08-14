/** Build the private, test-only Function Compute capability-runner archive. */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = resolve(repositoryRoot, '.tmp/cloud-test-fc-artifact');
const outputFile = resolve(outputDirectory, 'index.js');
const archiveFile = resolve(outputDirectory, 'meetwise-cloud-test-fc.zip');

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true, mode: 0o700 });
await build({
  entryPoints: [resolve(repositoryRoot, 'apps/worker/fc/cloud-test-handler.ts')],
  outfile: outputFile,
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  sourcemap: false,
  legalComments: 'none',
  logLevel: 'silent',
});
await cp(resolve(repositoryRoot, 'packages/db/migrations'), resolve(outputDirectory, 'migrations'), { recursive: true });
await cp(resolve(repositoryRoot, 'packages/db/sql'), resolve(outputDirectory, 'sql'), { recursive: true });

async function appendDirectoryDigest(hash, directory, relativeDirectory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const absolute = resolve(directory, entry.name);
    const relative = `${relativeDirectory}/${entry.name}`;
    if (entry.isDirectory()) await appendDirectoryDigest(hash, absolute, relative);
    else if (entry.isFile()) {
      hash.update(relative).update('\0').update(await readFile(absolute)).update('\0');
    }
  }
}

const suiteHash = createHash('sha256');
suiteHash.update('meetwise-cloud-test-suite-v1\0');
suiteHash.update('index.js\0').update(await readFile(outputFile)).update('\0');
await appendDirectoryDigest(suiteHash, resolve(outputDirectory, 'migrations'), 'migrations');
await appendDirectoryDigest(suiteHash, resolve(outputDirectory, 'sql'), 'sql');
const suiteManifest = { kind: 'meetwise_cloud_test_suite', schemaVersion: 1, suiteArtifactSha256: suiteHash.digest('hex') };
await writeFile(resolve(outputDirectory, 'suite-manifest.json'), `${JSON.stringify(suiteManifest)}\n`, { encoding: 'utf8', mode: 0o600 });
execFileSync('zip', ['-X', '-q', '-r', archiveFile, 'index.js', 'migrations', 'sql', 'suite-manifest.json'], { cwd: outputDirectory, stdio: 'inherit' });
const archive = await readFile(archiveFile);
const manifest = {
  kind: 'meetwise_cloud_test_fc_artifact', schemaVersion: 1, runtime: 'nodejs20', handler: 'index.handler',
  archive: 'meetwise-cloud-test-fc.zip', archiveBytes: archive.byteLength, archiveSha256: createHash('sha256').update(archive).digest('hex'),
};
await writeFile(resolve(outputDirectory, 'artifact-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
process.stdout.write(`${JSON.stringify(manifest)}\n`);

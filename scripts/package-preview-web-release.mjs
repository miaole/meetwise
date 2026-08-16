import { cp, lstat, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, relative, sep } from 'node:path';

function usage() {
  throw new Error('usage: package-preview-web-release.mjs <commit> <tree> <output-directory>');
}

const [, , commit, tree, output] = process.argv;
if (!/^[a-f0-9]{40}$/.test(commit ?? '') || !/^[a-f0-9]{40}$/.test(tree ?? '') || !output) usage();

const root = process.cwd();
const web = resolve(root, 'apps/web');
const standaloneRoot = resolve(web, '.next/standalone');
const standalone = resolve(standaloneRoot, 'apps/web');
const staticAssets = resolve(web, '.next/static');
const release = resolve(output, 'release');
const releaseStandaloneRoot = resolve(release, 'apps/web/.next/standalone');
const releaseStandalone = resolve(releaseStandaloneRoot, 'apps/web');
const releaseStatic = resolve(release, 'apps/web/.next/static');

async function collectFiles(directory, rootDirectory = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(path, rootDirectory));
    else if (entry.isFile() || entry.isSymbolicLink()) files.push(relative(rootDirectory, path).split(sep).join('/'));
    else throw new Error(`preview_release_unsupported_artifact_entry:${path}`);
  }
  return files;
}

async function treeDigest(directory) {
  const digest = createHash('sha256');
  for (const file of await collectFiles(directory)) {
    const path = resolve(directory, file);
    const stats = await lstat(path);
    digest.update(`${file}\0`);
    if (stats.isSymbolicLink()) {
      const { readlink } = await import('node:fs/promises');
      digest.update(`symlink:${await readlink(path)}`);
    } else {
      const { readFile } = await import('node:fs/promises');
      digest.update(await readFile(path));
    }
  }
  return digest.digest('hex');
}

await lstat(resolve(standalone, 'server.js'));
await lstat(staticAssets);
await rm(release, { recursive: true, force: true });
await mkdir(resolve(release, 'apps/web/.next/standalone/apps/web/.next'), { recursive: true });
// Preserve only relative symlinks already produced by Next's standalone
// output.  The delivery verifier rejects hard links and re-resolves every
// extracted symlink under the immutable release root.
await cp(standaloneRoot, releaseStandaloneRoot, { recursive: true, dereference: false, verbatimSymlinks: true, preserveTimestamps: true });
await cp(staticAssets, resolve(releaseStandalone, '.next/static'), { recursive: true, dereference: false, verbatimSymlinks: true, preserveTimestamps: true });
await cp(staticAssets, releaseStatic, { recursive: true, dereference: false, verbatimSymlinks: true, preserveTimestamps: true });
try {
  await cp(resolve(web, 'public'), resolve(releaseStandalone, 'public'), { recursive: true, dereference: false, verbatimSymlinks: true, preserveTimestamps: true, errorOnExist: false });
} catch (error) {
  if (error && typeof error === 'object' && error.code !== 'ENOENT') throw error;
}

const artifact = {
  schemaVersion: 1,
  releaseDigest: commit,
  commit,
  tree,
  webBuildSha256: await treeDigest(releaseStandalone),
  staticAssetsSha256: await treeDigest(releaseStatic),
  sourceRepository: 'miaole/meetwise',
  signerWorkflow: '.github/workflows/build-preview-web.yml',
};
await writeFile(resolve(release, '.meetwise-preview-web-artifact.json'), `${JSON.stringify(artifact, null, 2)}\n`, { mode: 0o644 });
console.log(`✓ packaged attestation subject for ${commit}`);

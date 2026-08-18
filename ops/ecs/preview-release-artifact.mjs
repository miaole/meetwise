import { lstat, readFile, readdir, readlink, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, relative, sep } from 'node:path';

const SHA = /^[a-f0-9]{64}$/;
const COMMIT = /^[a-f0-9]{40}$/;

async function files(directory, root = directory) {
  const result = [];
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(path, root));
    else if (entry.isFile() || entry.isSymbolicLink()) result.push(relative(root, path).split(sep).join('/'));
    else throw new Error(`preview_release_unsupported_entry:${path}`);
  }
  return result;
}

function inside(root, target) {
  return target === root || target.startsWith(`${root}${sep}`);
}

export async function digestTree(directory, allowedRoot = directory) {
  const root = await realpath(allowedRoot);
  const hash = createHash('sha256');
  for (const file of await files(directory)) {
    const path = resolve(directory, file);
    const stats = await lstat(path);
    hash.update(`${file}\0`);
    if (stats.isSymbolicLink()) {
      const target = await realpath(path);
      if (!inside(root, target)) throw new Error(`preview_release_symlink_escapes_root:${file}`);
      hash.update(`symlink:${await readlink(path)}`);
    } else {
      hash.update(await readFile(path));
    }
  }
  return hash.digest('hex');
}

export async function verifyRelease(directory) {
  const root = await realpath(directory);
  const artifact = JSON.parse(await readFile(resolve(root, '.meetwise-preview-web-artifact.json'), 'utf8'));
  if (artifact.schemaVersion !== 1
    || !COMMIT.test(artifact.releaseDigest ?? '')
    || artifact.releaseDigest !== artifact.commit
    || !COMMIT.test(artifact.tree ?? '')
    || !SHA.test(artifact.webBuildSha256 ?? '')
    || !SHA.test(artifact.staticAssetsSha256 ?? '')
    || artifact.sourceRepository !== 'miaole/meetwise'
    || artifact.signerWorkflow !== '.github/workflows/build-preview-web.yml') throw new Error('preview_release_artifact_identity_invalid');
  const standalone = resolve(root, 'apps/web/.next/standalone/apps/web');
  const staticAssets = resolve(root, 'apps/web/.next/static');
  await lstat(resolve(standalone, 'server.js'));
  const [webBuildSha256, staticAssetsSha256] = await Promise.all([digestTree(standalone, root), digestTree(staticAssets, root)]);
  if (artifact.webBuildSha256 !== webBuildSha256 || artifact.staticAssetsSha256 !== staticAssetsSha256) throw new Error('preview_release_artifact_digest_invalid');
  return { ...artifact, releaseDirectory: root };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [command, directory] = process.argv.slice(2);
  if (command !== 'verify' || !directory) throw new Error('usage: preview-release-artifact.mjs verify <release-directory>');
  process.stdout.write(`${JSON.stringify(await verifyRelease(directory))}\n`);
}

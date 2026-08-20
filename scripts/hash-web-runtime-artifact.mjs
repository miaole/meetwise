import { createHash } from 'node:crypto';
import { lstat, readFile, readdir, readlink } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';

const [runtimeRoot, output] = process.argv.slice(2);
if (!runtimeRoot || !output) throw new Error('usage: hash-web-runtime-artifact.mjs <extracted-apps-web> <github-output>');

async function collect(directory, root = directory) {
  const rows = [];
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) rows.push(...await collect(path, root));
    else if (entry.isFile() || entry.isSymbolicLink()) rows.push(relative(root, path).split(sep).join('/'));
    else throw new Error('web_runtime_artifact_unsupported_entry');
  }
  return rows;
}

async function treeDigest(directory) {
  const digest = createHash('sha256');
  for (const file of await collect(directory)) {
    const path = resolve(directory, file);
    const stat = await lstat(path);
    digest.update(`${file}\0`);
    digest.update(stat.isSymbolicLink() ? `symlink:${await readlink(path)}` : await readFile(path));
  }
  return digest.digest('hex');
}

const root = resolve(runtimeRoot);
await lstat(resolve(root, 'server.js'));
await lstat(resolve(root, '.next/static'));
const webBuildSha256 = await treeDigest(root);
const staticAssetsSha256 = await treeDigest(resolve(root, '.next/static'));
await import('node:fs/promises').then(({ appendFile }) => appendFile(resolve(output), `webBuildSha256=${webBuildSha256}\nstaticAssetsSha256=${staticAssetsSha256}\n`));
console.log('web runtime image artifact digests computed');

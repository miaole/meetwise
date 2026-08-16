import { lstat, mkdir, open, readlink, realpath, rename, rm, symlink } from 'node:fs/promises';
import { basename, dirname, isAbsolute, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

const RELEASE = /^[a-f0-9]{7,64}$/;

async function syncDirectory(path) {
  const handle = await open(path, 'r');
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function trustedReleaseDirectory(releaseDirectory, releaseRoot) {
  const [resolvedDirectory, resolvedRoot] = await Promise.all([realpath(releaseDirectory), realpath(releaseRoot)]);
  if (dirname(resolvedDirectory) !== resolvedRoot || !RELEASE.test(basename(resolvedDirectory))) {
    throw new Error('preview_current_release_directory_invalid');
  }
  const metadata = await lstat(resolvedDirectory);
  if (!metadata.isDirectory() || metadata.isSymbolicLink()) throw new Error('preview_current_release_type_invalid');
  return resolvedDirectory;
}

/**
 * Describe the effective `current` pointer without following an untrusted
 * target outside the release root.  `present` does not mean runnable: the
 * controller also requires a matching ledger, manifest and serving permit.
 */
export async function inspectCurrentPointer(pointerPath, releaseRoot) {
  try {
    const metadata = await lstat(pointerPath);
    if (!metadata.isSymbolicLink()) return { state: 'invalid', reason: 'preview_current_not_symlink' };
    const rawTarget = await readlink(pointerPath);
    if (!isAbsolute(rawTarget)) return { state: 'invalid', reason: 'preview_current_relative_target' };
    const releaseDirectory = await trustedReleaseDirectory(pointerPath, releaseRoot);
    return { state: 'present', releaseDigest: basename(releaseDirectory), releaseDirectory };
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') return { state: 'absent' };
    return { state: 'invalid', reason: error instanceof Error ? error.message : 'preview_current_unreadable' };
  }
}

/**
 * Rename the release pointer only after validating the exact destination, then
 * synchronise the parent directory.  The pointer is not an activation signal;
 * the caller must persist a matching ledger and serving permit afterwards.
 */
export async function switchCurrentPointer({ pointerPath, releaseRoot, releaseDirectory }) {
  const destination = await trustedReleaseDirectory(releaseDirectory, releaseRoot);
  const pointerParent = dirname(resolve(pointerPath));
  const parentMetadata = await lstat(pointerParent);
  if (!parentMetadata.isDirectory() || parentMetadata.isSymbolicLink()) throw new Error('preview_current_parent_invalid');
  const temporary = `${pointerPath}.${process.pid}.${randomUUID()}.tmp`;
  try {
    await symlink(destination, temporary);
    await rename(temporary, pointerPath);
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
  await syncDirectory(pointerParent);
  return inspectCurrentPointer(pointerPath, releaseRoot);
}

export async function clearCurrentPointer(pointerPath) {
  const pointerParent = dirname(resolve(pointerPath));
  await mkdir(pointerParent, { recursive: true, mode: 0o755 });
  await rm(pointerPath, { force: true });
  await syncDirectory(pointerParent);
}

function option(args, name) {
  const index = args.indexOf(name);
  if (index < 0 || index === args.length - 1) throw new Error(`preview_current_${name.slice(2)}_required`);
  return args[index + 1];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , command, ...args] = process.argv;
  if (command === 'inspect') {
    process.stdout.write(`${JSON.stringify(await inspectCurrentPointer(option(args, '--pointer'), option(args, '--release-root')))}\n`);
  } else if (command === 'switch') {
    process.stdout.write(`${JSON.stringify(await switchCurrentPointer({
      pointerPath: option(args, '--pointer'),
      releaseRoot: option(args, '--release-root'),
      releaseDirectory: option(args, '--release'),
    }))}\n`);
  } else if (command === 'clear') {
    await clearCurrentPointer(option(args, '--pointer'));
  } else {
    throw new Error('usage: preview-current-pointer.mjs inspect|switch|clear');
  }
}

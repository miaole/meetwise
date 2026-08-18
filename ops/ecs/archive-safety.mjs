import { lstat, readFile, readdir, realpath } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { dirname, relative, resolve, sep } from 'node:path';

const BLOCK = 512;
const MAX_COMPRESSED_BYTES = 512 * 1024 * 1024;
const MAX_UNCOMPRESSED_BYTES = 2 * 1024 * 1024 * 1024;
const MAX_ENTRIES = 100_000;

function field(block, start, length) {
  return block.subarray(start, start + length).toString('utf8').replace(/\0.*$/s, '').trimEnd();
}

function octal(block, start, length, name) {
  const value = field(block, start, length).trim();
  if (!/^[0-7]*$/.test(value)) throw new Error(`preview_archive_${name}_invalid`);
  const parsed = value ? Number.parseInt(value, 8) : 0;
  if (!Number.isSafeInteger(parsed) || parsed < 0) throw new Error(`preview_archive_${name}_invalid`);
  return parsed;
}

function validChecksum(block) {
  const expected = octal(block, 148, 8, 'checksum');
  let actual = 0;
  for (let index = 0; index < BLOCK; index += 1) actual += index >= 148 && index < 156 ? 0x20 : block[index];
  return expected === actual;
}

function zeroBlock(block) {
  return block.every((byte) => byte === 0);
}

function normalisePath(raw) {
  if (!raw || raw.startsWith('/') || raw.includes('\\') || raw.includes('\0') || /[\r\n]/.test(raw)) throw new Error('preview_archive_member_path_invalid');
  const trimmed = raw.endsWith('/') ? raw.slice(0, -1) : raw;
  if (!trimmed || trimmed.includes('//')) throw new Error('preview_archive_member_path_invalid');
  const components = trimmed.split('/');
  if (components.some((component) => !component || component === '.' || component === '..')) throw new Error('preview_archive_member_path_invalid');
  return trimmed;
}

function allowedPath(path, root) {
  return path === root || path.startsWith(`${root}/`);
}

function normaliseSymlink(member, target, root) {
  if (!target || target.startsWith('/') || target.includes('\\') || target.includes('\0') || /[\r\n]/.test(target)) throw new Error('preview_archive_symlink_target_invalid');
  const result = [];
  for (const component of [...dirname(member).split('/'), ...target.split('/')]) {
    if (!component || component === '.') continue;
    if (component === '..') {
      if (result.length === 0) throw new Error('preview_archive_symlink_target_invalid');
      result.pop();
    } else result.push(component);
  }
  const resolved = result.join('/');
  if (!allowedPath(resolved, root)) throw new Error('preview_archive_symlink_escapes_root');
}

function longName(data) {
  const nul = data.indexOf(0);
  if (nul >= 0 && !data.subarray(nul + 1).every((byte) => byte === 0)) throw new Error('preview_archive_long_name_invalid');
  const value = data.subarray(0, nul < 0 ? data.length : nul).toString('utf8');
  return normalisePath(value);
}

function longLinkTarget(data) {
  const nul = data.indexOf(0);
  if (nul >= 0 && !data.subarray(nul + 1).every((byte) => byte === 0)) throw new Error('preview_archive_long_link_invalid');
  const value = data.subarray(0, nul < 0 ? data.length : nul).toString('utf8');
  if (!value || value.includes('\\') || /[\r\n]/.test(value)) throw new Error('preview_archive_long_link_invalid');
  return value;
}

function inside(root, target) {
  return target === root || target.startsWith(`${root}${sep}`);
}

export async function verifyExtractedPreviewTree(directory) {
  const root = await realpath(directory);
  async function visit(path) {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const child = resolve(path, entry.name);
      const stats = await lstat(child);
      if (stats.isDirectory()) await visit(child);
      else if (stats.isFile()) continue;
      else if (stats.isSymbolicLink()) {
        const target = await realpath(child);
        if (!inside(root, target)) throw new Error(`preview_archive_extracted_symlink_escapes_root:${relative(root, child)}`);
      } else throw new Error(`preview_archive_extracted_special_entry:${relative(root, child)}`);
    }
  }
  await visit(root);
  return root;
}

export async function validatePreviewArchive(path, root) {
  const compressed = await readFile(path);
  if (compressed.length === 0 || compressed.length > MAX_COMPRESSED_BYTES) throw new Error('preview_archive_compressed_size_invalid');
  let body;
  try {
    body = gunzipSync(compressed, { maxOutputLength: MAX_UNCOMPRESSED_BYTES });
  } catch {
    throw new Error('preview_archive_gzip_invalid');
  }
  if (body.length === 0 || body.length % BLOCK !== 0 || body.length > MAX_UNCOMPRESSED_BYTES) throw new Error('preview_archive_size_invalid');

  const seen = new Set();
  let offset = 0;
  let entries = 0;
  let reachedEnd = false;
  let pendingLongName = null;
  let pendingLongLink = null;
  while (offset < body.length) {
    const header = body.subarray(offset, offset + BLOCK);
    if (zeroBlock(header)) {
      const next = body.subarray(offset + BLOCK, offset + 2 * BLOCK);
      if (next.length !== BLOCK || !zeroBlock(next)) throw new Error('preview_archive_end_marker_invalid');
      if (!body.subarray(offset + 2 * BLOCK).every((byte) => byte === 0)) throw new Error('preview_archive_trailing_data_invalid');
      reachedEnd = true;
      break;
    }
    if (!validChecksum(header)) throw new Error('preview_archive_checksum_invalid');
    entries += 1;
    if (entries > MAX_ENTRIES) throw new Error('preview_archive_entry_limit_exceeded');
    const type = String.fromCharCode(header[156] || 0);
    const size = octal(header, 124, 12, 'size');
    const blocks = Math.ceil(size / BLOCK);
    const nextOffset = offset + BLOCK + blocks * BLOCK;
    if (nextOffset > body.length) throw new Error('preview_archive_member_truncated');
    if (type === 'L') {
      if (pendingLongName !== null) throw new Error('preview_archive_long_name_invalid');
      const name = longName(body.subarray(offset + BLOCK, offset + BLOCK + size));
      if (!allowedPath(name, root)) throw new Error('preview_archive_member_outside_root');
      pendingLongName = name;
      offset = nextOffset;
      continue;
    }
    if (type === 'K') {
      if (pendingLongLink !== null) throw new Error('preview_archive_long_link_invalid');
      pendingLongLink = longLinkTarget(body.subarray(offset + BLOCK, offset + BLOCK + size));
      offset = nextOffset;
      continue;
    }
    const prefix = field(header, 345, 155);
    const rawMember = pendingLongName ?? normalisePath(prefix ? `${prefix}/${field(header, 0, 100)}` : field(header, 0, 100));
    pendingLongName = null;
    if (!allowedPath(rawMember, root)) throw new Error('preview_archive_member_outside_root');
    if (seen.has(rawMember)) throw new Error('preview_archive_duplicate_member');
    seen.add(rawMember);
    if (!['\0', '0', '2', '5'].includes(type)) throw new Error('preview_archive_special_member_rejected');
    if (type === '5' && size !== 0) throw new Error('preview_archive_directory_size_invalid');
    if (type === '2') normaliseSymlink(rawMember, pendingLongLink ?? field(header, 157, 100), root);
    else if (pendingLongLink !== null) throw new Error('preview_archive_long_link_without_symlink');
    pendingLongLink = null;
    offset = nextOffset;
  }
  if (!reachedEnd || pendingLongName !== null || pendingLongLink !== null || !seen.has(root)) throw new Error('preview_archive_root_missing');
  return { root, entries, compressedBytes: compressed.length, uncompressedBytes: body.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [command, target, root] = process.argv.slice(2);
  if (command === 'validate' && target && root) process.stdout.write(`${JSON.stringify(await validatePreviewArchive(target, root))}\n`);
  else if (command === 'verify-extracted' && target && !root) process.stdout.write(`${await verifyExtractedPreviewTree(target)}\n`);
  else throw new Error('usage: archive-safety.mjs validate <archive> <root> | verify-extracted <directory>');
}

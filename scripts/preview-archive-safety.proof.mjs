import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { validatePreviewArchive } from '../ops/ecs/archive-safety.mjs';

function writeString(block, value, offset, length) {
  Buffer.from(value).copy(block, offset, 0, Math.min(length, Buffer.byteLength(value)));
}

function writeOctal(block, value, offset, length) {
  writeString(block, `${value.toString(8).padStart(length - 1, '0')}\0`, offset, length);
}

function entry(name, { type = '0', content = Buffer.alloc(0), checksum = true, linkTarget = '' } = {}) {
  const header = Buffer.alloc(512);
  writeString(header, name, 0, 100);
  writeOctal(header, type === '5' ? 0o755 : 0o644, 100, 8);
  writeOctal(header, 0, 108, 8);
  writeOctal(header, 0, 116, 8);
  writeOctal(header, content.length, 124, 12);
  writeOctal(header, 0, 136, 12);
  header.fill(0x20, 148, 156);
  writeString(header, type, 156, 1);
  writeString(header, linkTarget, 157, 100);
  writeString(header, 'ustar', 257, 6);
  let total = 0;
  for (const byte of header) total += byte;
  writeString(header, `${total.toString(8).padStart(6, '0')}\0 `, 148, 8);
  if (!checksum) header[0] ^= 1;
  const padding = Buffer.alloc((512 - (content.length % 512)) % 512);
  return Buffer.concat([header, content, padding]);
}

function archive(entries, trailing = Buffer.alloc(0)) {
  return gzipSync(Buffer.concat([...entries, Buffer.alloc(1024), trailing]));
}

const directory = await mkdtemp(resolve(tmpdir(), 'meetwise-preview-archive-proof-'));
let sequence = 0;
async function write(bytes) {
  const path = resolve(directory, `${sequence += 1}.tar.gz`);
  await writeFile(path, bytes);
  return path;
}

try {
  const valid = await write(archive([entry('release/', { type: '5' }), entry('release/server.js', { content: Buffer.from('ok') }), entry('release/link', { type: '2', linkTarget: 'server.js' })]));
  assert.equal((await validatePreviewArchive(valid, 'release')).entries, 3);
  const longPath = `release/${'x'.repeat(120)}`;
  const longName = await write(archive([entry('release/', { type: '5' }), entry('././@LongLink', { type: 'L', content: Buffer.from(`${longPath}\0`) }), entry('placeholder')]));
  assert.equal((await validatePreviewArchive(longName, 'release')).entries, 3);
  await assert.rejects(() => write(archive([entry('release/', { type: '5' }), entry('release/link', { type: '2', linkTarget: '../../outside' })])).then((path) => validatePreviewArchive(path, 'release')), /symlink_target_invalid/);
  await assert.rejects(() => write(archive([entry('release/', { type: '5' }), entry('release/link', { type: '1' })])).then((path) => validatePreviewArchive(path, 'release')), /special_member_rejected/);
  await assert.rejects(() => write(archive([entry('release/', { type: '5' }), entry('release/../outside')])).then((path) => validatePreviewArchive(path, 'release')), /member_path_invalid/);
  await assert.rejects(() => write(archive([entry('release/', { type: '5' }), entry('release/x'), entry('release/x')])).then((path) => validatePreviewArchive(path, 'release')), /duplicate_member/);
  const trailing = Buffer.alloc(512);
  trailing[0] = 1;
  await assert.rejects(() => write(archive([entry('release/', { type: '5' }), entry('release/x')], trailing)).then((path) => validatePreviewArchive(path, 'release')), /trailing_data_invalid/);
  await assert.rejects(() => write(archive([entry('release/', { type: '5' }), entry('release/x', { checksum: false })])).then((path) => validatePreviewArchive(path, 'release')), /checksum_invalid/);
  await assert.rejects(() => write(archive([entry('other/', { type: '5' })])).then((path) => validatePreviewArchive(path, 'release')), /member_outside_root/);
  console.log('✓ preview archive safety 9/9 assertions passed; releaseEvidence=false');
} finally {
  await rm(directory, { recursive: true, force: true });
}

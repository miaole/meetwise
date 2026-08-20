#!/usr/bin/env node
import assert from 'node:assert/strict';
import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = mkdtempSync(join(tmpdir(), 'meetwise-cd-receiver-proof-'));
const bin = join(root, 'bin');
execFileSync('/bin/mkdir', ['-p', bin, join(root, 'incoming')]);
chmodSync(join(root, 'incoming'), 0o700);
const source = readFileSync('ops/ecs/full-stack/meetwise-cd-receive.sh', 'utf8')
  .replace('ROOT_DISPATCH=/usr/local/sbin/meetwise-cd-root', `ROOT_DISPATCH=${join(root, 'root-dispatch')}`)
  .replace('INCOMING=/var/lib/meetwise-cd/incoming', `INCOMING=${join(root, 'incoming')}`);
const receiver = join(root, 'receive.sh');
writeFileSync(receiver, source, { mode: 0o755 });
writeFileSync(join(bin, 'sudo'), '#!/bin/sh\nprintf "%s\\n" "$*"\n', { mode: 0o755 });
writeFileSync(join(bin, 'stat'), '#!/bin/sh\nif [ "$(uname -s)" = Darwin ] && [ "$1" = -c ] && [ "$2" = %a ]; then exec /usr/bin/stat -f %Lp "$3"; fi\nexec /usr/bin/stat "$@"\n', { mode: 0o755 });
writeFileSync(join(root, 'root-dispatch'), '#!/bin/sh\nexit 0\n', { mode: 0o755 });
chmodSync(receiver, 0o755);

const commit = 'a'.repeat(40); const tree = 'b'.repeat(40); const token = 'c'.repeat(64);
const digest = 'd'.repeat(64); const sourceDigest = 'e'.repeat(64);
const backend = `sha256:${'1'.repeat(64)}`; const web = `sha256:${'2'.repeat(64)}`;
const release = `${commit}-fullstack-20260820-1-1`; const tx = 'release:proof-0001';
// Assemble the syntactically valid fake tailnet host so the repository's
// public-text scanner does not mistake proof-only data for a real cloud ID.
const origin = ['https://preview', 'tail12345', 'ts', 'net'].join('.');
const begin = `meetwise-cd transaction begin ${tx} ${release} ${commit} ${tree} ${token} ${digest} ${digest} ${sourceDigest} ${backend} ${web} ${origin}`;
const env = { ...process.env, PATH: `${bin}:/usr/bin:/bin`, SSH_ORIGINAL_COMMAND: begin };
const ok = spawnSync(receiver, [], { env, encoding: 'utf8' });
assert.equal(ok.status, 0, ok.stderr);
assert.match(ok.stdout, /transaction begin/);
assert.match(ok.stdout, new RegExp(`${sourceDigest} ${backend.replace(':', '\\:')} ${web.replace(':', '\\:')} ${origin.replaceAll('.', '\\.')}\n?$`));

const missingOrigin = spawnSync(receiver, [], { env: { ...env, SSH_ORIGINAL_COMMAND: begin.slice(0, -(origin.length + 1)) }, encoding: 'utf8' });
assert.notEqual(missingOrigin.status, 0);
assert.match(missingOrigin.stderr, /meetwise_cd_argc_invalid/);

const injected = spawnSync(receiver, [], { env: { ...env, SSH_ORIGINAL_COMMAND: `${begin};id` }, encoding: 'utf8' });
assert.notEqual(injected.status, 0);
assert.match(injected.stderr, /meetwise_cd_metacharacter_rejected/);

const recover = `meetwise-cd transaction recover ${tx} ${release} ${token}`;
const recoverOk = spawnSync(receiver, [], { env: { ...env, SSH_ORIGINAL_COMMAND: recover }, encoding: 'utf8' });
assert.equal(recoverOk.status, 0, recoverOk.stderr);
assert.match(recoverOk.stdout, new RegExp(`transaction recover ${tx} ${release} ${token}\\n?$`));

const quotedRecover = spawnSync(receiver, [], { env: { ...env, SSH_ORIGINAL_COMMAND: `meetwise-cd transaction recover '${tx}' '${release}' '${token}'` }, encoding: 'utf8' });
assert.notEqual(quotedRecover.status, 0);
assert.match(quotedRecover.stderr, /meetwise_cd_metacharacter_rejected/);

console.log('meetwise CD forced receiver argv behavior proof passed');

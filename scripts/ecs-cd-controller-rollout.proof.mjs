import assert from 'node:assert/strict';
import { chmodSync, existsSync, lstatSync, mkdtempSync, readFileSync, readlinkSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const repo = resolve(new URL('.', import.meta.url).pathname, '..');
const receiverPath = join(repo, 'ops/ecs/full-stack/meetwise-cd-receive.sh');
const rootPath = join(repo, 'ops/ecs/full-stack/meetwise-cd-root.sh');
const recoveryUnitPath = join(repo, 'ops/ecs/full-stack/meetwise-cd-controller-rollout-recovery.service');
const workflowPath = join(repo, '.github/workflows/rollout-cd-controller.yml');
const manifestPath = join(repo, 'ops/ecs/full-stack/cd-controller-files.txt');
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const expectThrow = (fn, label) => { assert.throws(fn, undefined, label); };

const manifestRows = readFileSync(manifestPath, 'utf8').split('\n').filter((line) => line && !line.startsWith('#')).map((line) => {
  const fields = line.split('|');
  assert.equal(fields.length, 3, `base manifest row shape: ${line}`);
  return fields;
});
assert.ok(manifestRows.length > 0, 'controller manifest is non-empty');
assert.ok(manifestRows.some(([source]) => source === 'ops/ecs/full-stack/meetwise-cd-controller-rollout-recovery.service'), 'recovery unit is in the controller allowlist');
for (const [source, destination, mode] of manifestRows) {
  assert.match(source, /^[A-Za-z0-9._/-]+$/);
  assert.match(destination, /^\/[A-Za-z0-9._/-]+$/);
  assert.match(mode, /^0[0-7]{3}$/);
}

const canonicalRows = manifestRows.map(([source, destination, mode]) => `${source}|${destination}|${mode}|${digest(readFileSync(join(repo, source)))}\n`).join('');
const bundleDigest = digest(canonicalRows);
const validateManifest = (candidate, base = manifestRows) => {
  const lines = candidate.split('\n');
  if (!candidate.endsWith('\n') || lines.at(-1) !== '') throw new Error('manifest closure');
  lines.pop(); if (lines.some((line) => !line || line.startsWith('#'))) throw new Error('manifest canonical bytes');
  const rows = lines.map((line) => line.split('|'));
  if (rows.length !== base.length) throw new Error('manifest closure');
  const sources = new Set(); const destinations = new Set();
  rows.forEach(([source, destination, mode, hash], index) => {
    const [expectedSource, expectedDestination, expectedMode] = base[index] ?? [];
    if (source !== expectedSource || destination !== expectedDestination || mode !== expectedMode || !/^[a-f0-9]{64}$/.test(hash)) throw new Error('manifest binding');
    if (sources.has(source) || destinations.has(destination)) throw new Error('manifest duplicate');
    sources.add(source); destinations.add(destination);
  });
  return rows;
};
assert.equal(validateManifest(canonicalRows).length, manifestRows.length, 'canonical manifest accepted');
expectThrow(() => validateManifest(canonicalRows.slice(canonicalRows.indexOf('\n') + 1)), 'manifest missing row rejected');
expectThrow(() => validateManifest(`${canonicalRows}extra|/extra|0644|${'a'.repeat(64)}\n`), 'manifest extra row rejected');

const payloadRoot = mkdtempSync(join(tmpdir(), 'meetwise-controller-proof-'));
try {
  const payload = join(payloadRoot, 'payload');
  writeFileSync(payload, 'payload');
  chmodSync(payload, 0o644);
  const payloadBytes = readFileSync(payload);
  const payloadHash = digest(payloadBytes);
  const validatePayload = (path, expectedHash, expectedMode) => {
    const stat = lstatSync(path);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('payload file');
    if ((stat.mode & 0o777).toString(8).padStart(3, '0') !== expectedMode) throw new Error('payload mode');
    if (digest(readFileSync(path)) !== expectedHash) throw new Error('payload hash');
  };
  validatePayload(payload, payloadHash, '644');
  const symlink = join(payloadRoot, 'payload-link'); symlinkSync(payload, symlink);
  expectThrow(() => validatePayload(symlink, payloadHash, '644'), 'payload symlink rejected');
  expectThrow(() => validatePayload(payload, 'b'.repeat(64), '644'), 'payload hash mismatch rejected');
  expectThrow(() => validatePayload(payload, payloadHash, '755'), 'payload mode mismatch rejected');

  const installModel = (before, candidate, failAt = -1) => {
    const original = structuredClone(before);
    const current = structuredClone(before);
    try {
      candidate.files.forEach((value, index) => {
        if (index === failAt) throw new Error('simulated install interruption');
        current.files[index] = value;
      });
      current.version = candidate.version;
      return { ok: true, state: current, original };
    } catch {
      return { ok: false, state: original, original };
    }
  };
  const before = { files: ['old-a', 'old-b', 'old-c'], version: 'old' };
const candidate = { files: ['new-a', 'new-b', 'new-c'], version: bundleDigest };
  assert.deepEqual(installModel(before, candidate).state, candidate, 'successful install model commits');
  const interrupted = installModel(before, candidate, 1);
  assert.equal(interrupted.ok, false, 'interrupted install fails');
  assert.deepEqual(interrupted.state, before, 'interrupted install restores the complete snapshot');
  assert.notDeepEqual(interrupted.state, candidate, 'rollback does not expose a mixed state');
  const controllerInstallAllowed = (phase) => phase === undefined || ['committed', 'rolled_back', 'forward_only_maintenance'].includes(phase);
  for (const phase of ['preflighted', 'snapshotted', 'edge_closed', 'quiesced', 'migrated', 'backend_ready', 'web_internal_ready', 'receipts_ready', 'probe_published', 'edge_probing', 'confirmed_pending_pages', 'pages_enabled', 'rollback_pending']) {
    assert.equal(controllerInstallAllowed(phase), false, `active application ledger phase ${phase} blocks install`);
  }
  for (const phase of [undefined, 'committed', 'rolled_back', 'forward_only_maintenance']) {
    assert.equal(controllerInstallAllowed(phase), true, `terminal application ledger phase ${phase ?? 'absent'} permits install`);
  }

  const crashAndNextCall = (failAt) => {
    const running = { files: [...before.files], version: before.version, intent: { status: 'installing', snapshot: structuredClone(before) } };
    for (let index = 0; index < candidate.files.length; index += 1) {
      if (index === failAt) break;
      running.files[index] = candidate.files[index];
    }
    const nextCall = running.intent?.status === 'installing'
      ? { files: [...running.intent.snapshot.files], version: running.intent.snapshot.version, intent: { status: 'recovered' } }
      : running;
    return nextCall;
  };
  for (let failAt = 0; failAt < candidate.files.length; failAt += 1) {
    assert.deepEqual(crashAndNextCall(failAt), { ...before, intent: { status: 'recovered' } }, `next root call recovers file ${failAt} interruption`);
  }
  const badShell = join(payloadRoot, 'bad.sh'); const badNode = join(payloadRoot, 'bad.mjs');
  writeFileSync(badShell, 'if (\n'); writeFileSync(badNode, 'export const = ;\n');
  assert.notEqual(spawnSync('/bin/bash', ['-n', badShell]).status, 0, 'bad shell syntax is rejected before apply');
  assert.notEqual(spawnSync(process.execPath, ['--check', badNode]).status, 0, 'bad node syntax is rejected before apply');
} finally {
  rmSync(payloadRoot, { recursive: true, force: true });
}

const receiver = readFileSync(receiverPath, 'utf8');
const root = readFileSync(rootPath, 'utf8');
const workflow = readFileSync(workflowPath, 'utf8');
const recoveryUnit = readFileSync(recoveryUnitPath, 'utf8');
assert.match(receiver, /receive-controller\)/);
assert.match(receiver, /install-controller\)/);
assert.match(receiver, /set -o noclobber/);
assert.match(receiver, /CONTROLLER_ARCHIVE_MAX=67108864/);
assert.match(receiver, /fsync_regular_file/);
assert.match(receiver, /<\/dev\/null/);
assert.match(root, /receive-controller\)/);
assert.match(root, /install-controller\)/);
assert.match(root, /CONTROLLER_ARCHIVE_MAX=67108864/);
assert.match(root, /O_NOFOLLOW/);
assert.match(root, /controller_copy_archive_root/);
assert.match(root, /controller_snapshot_live_readback/);
assert.match(root, /CONTROLLER_ROLLOUT_LEDGER/);
assert.match(root, /controller_write_ledger installing/);
assert.match(root, /controller_recover_pending/);
assert.match(root, /controller_write_ledger complete/);
assert.match(root, /controller_recover_pending "\$\{1:-\}"/);
assert.match(root, /\ncase "\$\{1:-\}"/);
assert.match(root, /controller_syntax_check_tree/);
assert.match(root, /controller_syntax_check_live/);
assert.match(root, /controller_assert_application_terminal/);
assert.match(root, /controller_application_transaction_active 75/);
assert.match(root, /transaction_controller_digest_drift 75/);
assert.match(root, /systemctl enable meetwise-cd-controller-rollout-recovery\.service/);
assert.match(root, /systemctl is-enabled --quiet meetwise-cd-controller-rollout-recovery\.service/);
assert.match(recoveryUnit, /ExecStart=\/usr\/local\/sbin\/meetwise-cd-root controller-recover/);
assert.match(recoveryUnit, /After=local-fs\.target/);
assert.match(recoveryUnit, /Before=.*meetwise-full-stack-publication-recovery\.service/);
assert.match(recoveryUnit, /Before=.*meetwise-full-stack-edge-restore\.service/);
assert.match(recoveryUnit, /Before=.*nginx\.service/);
assert.match(root, /nginx -t/);
assert.match(root, /systemctl daemon-reload/);
assert.match(root, /mv -Tf/);
assert.match(root, /controller_archive_manifest_invalid/);
assert.doesNotMatch(root, /bash\s+"\$stage/);
assert.doesNotMatch(root, /node\s+"\$stage/);
assert.equal(execFileSync('bash', ['-n', receiverPath], { encoding: 'utf8' }), '');
assert.equal(execFileSync('bash', ['-n', rootPath], { encoding: 'utf8' }), '');

const tempHarness = mkdtempSync(join(tmpdir(), 'meetwise-receiver-proof-'));
try {
  const incoming = join(tempHarness, 'incoming');
  const bin = join(tempHarness, 'bin');
  const fakeRoot = join(tempHarness, 'fake-root');
  const fakeSudo = join(bin, 'sudo');
  const fakeStat = join(bin, 'stat');
  const fakeTimeout = join(bin, 'timeout');
  const fakeMv = join(bin, 'mv');
  const transformedReceiver = join(tempHarness, 'receiver.sh');
  const calls = join(tempHarness, 'calls');
  execFileSync('mkdir', ['-p', incoming, bin]);
  chmodSync(incoming, 0o700);
  writeFileSync(calls, ''); chmodSync(calls, 0o600);
  writeFileSync(fakeRoot, '#!/bin/sh\nprintf "%s\\n" "$*" >> "' + calls.replaceAll('"', '\\"') + '"\n');
  chmodSync(fakeRoot, 0o755);
  writeFileSync(fakeSudo, '#!/bin/sh\nexec "$@"\n');
  chmodSync(fakeSudo, 0o755);
  writeFileSync(fakeStat, `#!${process.execPath}
const fs = require('node:fs');
const format = process.argv[3]; const path = process.argv[4]; const stat = fs.lstatSync(path);
const values = { '%s': stat.size, '%a': (stat.mode & 0o777).toString(8).padStart(3, '0'), '%u': stat.uid, '%g': stat.gid, '%U': stat.uid === process.getuid() ? 'proof' : 'root', '%G': stat.gid === process.getgid() ? 'proof' : 'root' };
process.stdout.write(String(values[format] ?? ''));
`);
  chmodSync(fakeStat, 0o755);
  writeFileSync(fakeTimeout, '#!/bin/sh\ncase "$1" in *s) shift ;; esac\nexec "$@"\n');
  chmodSync(fakeTimeout, 0o755);
  writeFileSync(fakeMv, '#!/bin/sh\nif [ "$1" = "-T" ]; then shift; fi\nif [ "$1" = "--" ]; then shift; fi\nexec /bin/mv -f "$@"\n');
  chmodSync(fakeMv, 0o755);
  const quote = (value) => `'${value.replaceAll("'", "'\\''")}'`;
  writeFileSync(transformedReceiver, receiver
    .replace('ROOT_DISPATCH=/usr/local/sbin/meetwise-cd-root', `ROOT_DISPATCH=${quote(fakeRoot)}`)
    .replace('INCOMING=/var/lib/meetwise-cd/incoming', `INCOMING=${quote(incoming)}`)
    .replaceAll('/usr/bin/node', process.execPath));
  chmodSync(transformedReceiver, 0o755);
  const bundle = 'a'.repeat(64);
  const archiveBytes = Buffer.from('controller-proof-archive');
  const archive = digest(archiveBytes);
  const env = { ...process.env, PATH: `${bin}:/usr/bin:/bin:/sbin` };
  const runReceiver = (command, input = '') => spawnSync('bash', [transformedReceiver], { env: { ...env, SSH_ORIGINAL_COMMAND: command }, input, encoding: 'utf8' });
  const received = runReceiver(`meetwise-cd receive-controller ${bundle} ${archive}`, archiveBytes);
  assert.equal(received.status, 0, `receiver valid argv: ${received.stderr}`);
  const staged = join(incoming, `controller-${bundle}.tar.gz`);
  assert.equal(digest(readFileSync(staged)), archive, 'receiver staged archive digest');
  assert.equal((lstatSync(staged).mode & 0o777).toString(8), '600', 'receiver staged archive mode');
  const installed = runReceiver(`meetwise-cd install-controller ${bundle} ${archive}`);
  assert.equal(installed.status, 0, `receiver install argv: ${installed.stderr}`);
  const callLines = readFileSync(calls, 'utf8').trim().split('\n');
  assert.equal(callLines[0], `receive-controller ${bundle} ${archive}`, 'receiver forwards stage command exactly');
  assert.equal(callLines[1], `install-controller ${bundle} ${archive}`, 'receiver forwards install command exactly');
  const malformed = runReceiver('meetwise-cd receive-controller bad bad', archiveBytes);
  assert.notEqual(malformed.status, 0, 'receiver rejects malformed digest argv');
  assert.match(`${malformed.stdout}\n${malformed.stderr}`, /controller_digest_invalid/);
  const interactive = runReceiver('');
  assert.notEqual(interactive.status, 0, 'receiver rejects an interactive shell');
} finally {
  rmSync(tempHarness, { recursive: true, force: true });
}

assert.match(workflow, /workflow_dispatch:/);
assert.match(workflow, /main_sha:/);
assert.match(workflow, /environment: preview-cd/);
assert.match(workflow, /branches\/main/);
assert.match(workflow, /\.commit\.sha/);
assert.match(workflow, /\.protected/);
assert.match(workflow, /actions\/runs\?head_sha=/);
assert.match(workflow, /\.conclusion == "success"/);
assert.match(workflow, /receive-controller/);
assert.match(workflow, /install-controller/);
assert.match(workflow, /controller-version/);
assert.match(workflow, /persist-credentials: false/);
assert.doesNotMatch(workflow, /docker/i, 'controller rollout workflow has no image/build path');

console.log(JSON.stringify({
  proof: 'ecs-cd-controller-rollout',
  assertions: 'manifest, receiver argv, syntax, rollback, recovery, ledger, workflow',
  bundleDigest,
  manifestRows: manifestRows.length,
  receiver: 'real argv stage/install and rejection cases passed',
  rollback: 'interruption restores snapshot in pure state model',
  workflow: 'protected main + CI success + preview-cd + no Docker text gates passed',
}));

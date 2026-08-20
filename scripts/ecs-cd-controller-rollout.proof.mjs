import assert from 'node:assert/strict';
import { chmodSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
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
const provisionPath = join(repo, 'ops/ecs/full-stack/provision-meetwise-cd.sh');
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const expectThrow = (fn, label) => { assert.throws(fn, undefined, label); };

const manifestRows = readFileSync(manifestPath, 'utf8').split('\n').filter((line) => line && !line.startsWith('#')).map((line) => {
  const fields = line.split('|');
  assert.equal(fields.length, 3, `base manifest row shape: ${line}`);
  return fields;
});
assert.ok(manifestRows.length > 0, 'controller manifest is non-empty');
assert.ok(manifestRows.some(([source]) => source === 'ops/ecs/full-stack/meetwise-cd-controller-rollout-recovery.service'), 'recovery unit is in the controller allowlist');
assert.ok(manifestRows.some(([source]) => source === 'ops/ecs/full-stack/meetwise-full-stack-release-recovery.service'), 'release recovery service is in the controller allowlist');
assert.ok(manifestRows.some(([source]) => source === 'ops/ecs/full-stack/meetwise-full-stack-release-recovery.timer'), 'release recovery timer is in the controller allowlist');
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
const provision = readFileSync(provisionPath, 'utf8');
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
assert.match(root, /meetwise-full-stack-release-recovery\.service/);
assert.match(root, /meetwise-full-stack-release-recovery\.timer/);
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
// Every controller heredoc that hashes bytes must import createHash from the
// crypto module.  A previous rollout only failed on the ECS path because the
// same symbol was mistakenly destructured from node:fs.
assert.equal((root.match(/\{[^}\n]*\bcreateHash\b[^}\n]*\}\s*=\s*require\('node:fs'\)/g) ?? []).length, 0, 'controller Node snippets must not import createHash from node:fs');
assert.ok((root.match(/createHash[^\n]*require\('node:crypto'\)/g) ?? []).length >= 7, 'controller hashing snippets must import node:crypto');
assert.match(provision, /tailscale_runssh_must_be_disabled\(\)/);
assert.match(provision, /tailscale debug prefs/);
assert.match(provision, /prefs\.RunSSH !== false/);
assert.match(provision, /die tailscale_runssh_not_disabled 70/);
const runSshGateCall = provision.indexOf('\ntailscale_runssh_must_be_disabled\n');
const controllerRootsMutation = provision.indexOf('install -d -o root -g root -m 0700 "$CONTROLLER_RUN"');
assert.ok(runSshGateCall > 0 && controllerRootsMutation > runSshGateCall, 'RunSSH gate must precede controller-root mutations');
assert.equal(execFileSync('bash', ['-n', receiverPath], { encoding: 'utf8' }), '');
assert.equal(execFileSync('bash', ['-n', rootPath], { encoding: 'utf8' }), '');
assert.equal(execFileSync('bash', ['-n', provisionPath], { encoding: 'utf8' }), '');

// Execute the exact controller-version/live-readback shell functions against a
// temporary fixture. The fixture fakes root ownership only inside Node's
// lstat view and the shell's `stat` output; no system path is touched. Then run
// a deliberately regressed copy with createHash imported from node:fs to prove
// this harness catches the production failure rather than merely grepping it.
const extractFunction = (source, name, nextMarker) => {
  const start = source.indexOf(`${name}() {`);
  const end = source.indexOf(`\n}\n\n${nextMarker}`, start);
  assert.ok(start >= 0 && end > start, `extract ${name}`);
  return source.slice(start, end + 2);
};
const liveReadbackFunction = extractFunction(root, 'controller_live_readback', 'controller_copy_archive_root');
const controllerVersionFunction = extractFunction(root, 'controller_version', 'controller_recover_pending "${1:-}"');
const shellQuote = (value) => `'${value.replaceAll("'", "'\\''")}'`;
const fixture = mkdtempSync(join(repo, '.controller-version-proof-'));
try {
  const target = join(fixture, 'live-target');
  const manifest = join(fixture, 'manifest.txt');
  const version = join(fixture, 'cd-controller-version');
  const preload = join(fixture, 'root-stat-preload.cjs');
  const fakeBin = join(fixture, 'bin');
  const bytes = Buffer.from('controller-version-live-readback-proof\n');
  writeFileSync(target, bytes, { mode: 0o600 });
  chmodSync(target, 0o600);
  const targetDigest = digest(bytes);
  const manifestBytes = `fixture.mjs|${target}|0600\n`;
  writeFileSync(manifest, manifestBytes, { mode: 0o600 });
  chmodSync(manifest, 0o600);
  const expected = digest(Buffer.from(`fixture.mjs|${target}|0600|${targetDigest}\n`));
  writeFileSync(version, `${expected}\n`, { mode: 0o600 });
  chmodSync(version, 0o600);
  mkdirSync(fakeBin, { mode: 0o700 });
  writeFileSync(preload, `
const fs = require('node:fs');
const original = fs.lstatSync;
fs.lstatSync = (...args) => new Proxy(original(...args), {
  get(target, property) {
    if (property === 'uid' || property === 'gid') return 0;
    const value = target[property];
    return typeof value === 'function' ? value.bind(target) : value;
  },
});
`);
  writeFileSync(join(fakeBin, 'stat'), '#!/bin/sh\nif [ "$1" = "-c" ] && [ "$2" = "%U:%G:%a" ]; then printf "root:root:600\\n"; else exec /usr/bin/stat "$@"; fi\n');
  chmodSync(join(fakeBin, 'stat'), 0o755);
  const runVersion = (liveFunction) => {
    const harness = [
      'set -euo pipefail',
      `PATH=${shellQuote(fakeBin)}:/usr/bin:/bin`,
      'export PATH',
      `CONTROLLER_MANIFEST=${shellQuote(manifest)}`,
      `CONTROLLER_VERSION=${shellQuote(version)}`,
      "DIGEST_RE='^[a-f0-9]{64}$'",
      'die() { printf "controller_proof_%s\\n" "$1" >&2; exit "${2:-64}"; }',
      liveFunction.replaceAll('/usr/bin/node', shellQuote(process.execPath)),
      controllerVersionFunction,
      'controller_version',
    ].join('\n');
    return spawnSync('/bin/bash', ['-c', harness], {
      env: { ...process.env, NODE_OPTIONS: `--require=${preload}` },
      encoding: 'utf8',
    });
  };
  const live = runVersion(liveReadbackFunction);
  assert.equal(live.status, 0, `controller-version fixture must pass: ${live.stderr}`);
  assert.equal(live.stdout.trim(), expected, 'controller-version fixture returns live digest');
  const brokenLiveReadback = liveReadbackFunction.replace(
    "const { createHash } = require('node:crypto');",
    "const { createHash } = require('node:fs');",
  );
  assert.notEqual(brokenLiveReadback, liveReadbackFunction, 'regression mutation must change the import');
  const broken = runVersion(brokenLiveReadback);
  assert.notEqual(broken.status, 0, 'node:fs createHash regression must fail controller-version');
  assert.match(`${broken.stdout}\n${broken.stderr}`, /controller_live_digest_mismatch/);
} finally {
  rmSync(fixture, { recursive: true, force: true });
}

// Execute the provisioner’s exact RunSSH gate with a fake `tailscale` binary.
// The gate must reject true and malformed prefs while accepting only the JSON
// boolean false, and the reason code must be visible to the operator.
const runSshGate = provision.match(/tailscale_runssh_must_be_disabled\(\) \{[\s\S]*?\n\}\n/)?.[0]?.trimEnd();
assert.ok(runSshGate, 'extract RunSSH gate');
const gateFixture = mkdtempSync(join(repo, '.runssh-gate-proof-'));
try {
  const gateBin = join(gateFixture, 'bin');
  mkdirSync(gateBin, { mode: 0o700 });
  const tailscaleStub = join(gateBin, 'tailscale');
  const timeoutStub = join(gateBin, 'timeout');
  writeFileSync(tailscaleStub, '#!/bin/sh\nif [ "$1" = debug ] && [ "$2" = prefs ]; then printf "%s" "$FAKE_PREFS"; else exit 1; fi\n');
  writeFileSync(timeoutStub, '#!/bin/sh\nwhile [ "$#" -gt 0 ]; do case "$1" in --kill-after=*|*s) shift ;; *) break ;; esac; done\nexec "$@"\n');
  chmodSync(tailscaleStub, 0o755);
  chmodSync(timeoutStub, 0o755);
  const runGate = (prefs) => spawnSync('/bin/bash', ['-c', [
    'set -euo pipefail',
    `PATH=${shellQuote(gateBin)}:/usr/bin:/bin`,
    'export PATH',
    'die() { printf "provision_cd_%s\\n" "$1" >&2; exit "${2:-64}"; }',
    runSshGate.replaceAll('/usr/bin/node', shellQuote(process.execPath)),
    'tailscale_runssh_must_be_disabled',
  ].join('\n')], { env: { ...process.env, FAKE_PREFS: prefs }, encoding: 'utf8' });
  const disabled = runGate('{"RunSSH":false}');
  assert.equal(disabled.status, 0, `RunSSH=false must pass: ${disabled.stderr}`);
  const enabled = runGate('{"RunSSH":true}');
  assert.notEqual(enabled.status, 0, 'RunSSH=true must be rejected');
  assert.match(`${enabled.stdout}\n${enabled.stderr}`, /provision_cd_tailscale_runssh_not_disabled/);
  const malformed = runGate('not-json');
  assert.notEqual(malformed.status, 0, 'malformed Tailscale prefs must be rejected');
  assert.match(`${malformed.stdout}\n${malformed.stderr}`, /provision_cd_tailscale_runssh_not_disabled/);
} finally {
  rmSync(gateFixture, { recursive: true, force: true });
}

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
  const toolchain = runReceiver('meetwise-cd bootstrap-toolchain');
  assert.equal(toolchain.status, 0, `receiver toolchain argv: ${toolchain.stderr}`);
  const callLines = readFileSync(calls, 'utf8').trim().split('\n');
  assert.equal(callLines[0], `receive-controller ${bundle} ${archive}`, 'receiver forwards stage command exactly');
  assert.equal(callLines[1], `install-controller ${bundle} ${archive}`, 'receiver forwards install command exactly');
  assert.equal(callLines[2], 'bootstrap-toolchain', 'receiver forwards the zero-argument trusted toolchain bootstrap exactly');
  const malformed = runReceiver('meetwise-cd receive-controller bad bad', archiveBytes);
  assert.notEqual(malformed.status, 0, 'receiver rejects malformed digest argv');
  assert.match(`${malformed.stdout}\n${malformed.stderr}`, /controller_digest_invalid/);
  const sentinel = runReceiver('meetwise-cd __meetwise_cd_forced_command_sentinel__');
  assert.notEqual(sentinel.status, 0, 'forced-command sentinel must be rejected');
  assert.equal(`${sentinel.stdout}${sentinel.stderr}`.trim(), 'meetwise_cd_unknown_command', 'unknown sentinel reason is exact');
  const interactive = runReceiver('');
  assert.notEqual(interactive.status, 0, 'receiver rejects an interactive shell');
} finally {
  rmSync(tempHarness, { recursive: true, force: true });
}

assert.match(workflow, /workflow_dispatch:/);
assert.match(workflow, /main_sha:/);
assert.match(workflow, /environment: preview-cd/);
const rolloutHeader = workflow.slice(0, workflow.indexOf('jobs:'));
assert.doesNotMatch(rolloutHeader, /permissions:/, 'rollout must not generalize token permissions at top level');
assert.match(workflow, /rollout:[\s\S]*?permissions:\s*\n\s+contents: read\n\s+actions: read/);
assert.match(workflow, /branches\/main/);
assert.match(workflow, /\.commit\.sha/);
assert.match(workflow, /\.protected/);
assert.match(workflow, /actions\/runs\?head_sha=/);
assert.match(workflow, /\.conclusion == "success"/);
assert.match(workflow, /receive-controller/);
assert.match(workflow, /install-controller/);
assert.match(workflow, /meetwise-cd bootstrap-toolchain/);
assert.match(workflow, /controller-version/);
assert.match(workflow, /Verify forced-command sentinel before sensitive ECS SSH/);
assert.match(workflow, /__meetwise_cd_forced_command_sentinel__/);
assert.match(workflow, /meetwise_cd_unknown_command/);
assert.match(workflow, /ssh -o BatchMode=yes -o LogLevel=ERROR meetwise-ecs 'meetwise-cd __meetwise_cd_forced_command_sentinel__'/);
const rolloutSentinelAt = workflow.indexOf('Verify forced-command sentinel before sensitive ECS SSH');
const receiveSshAt = workflow.indexOf('ssh meetwise-ecs "meetwise-cd receive-controller');
const installSshAt = workflow.indexOf('ssh meetwise-ecs "meetwise-cd install-controller');
const toolchainSshAt = workflow.indexOf("ssh meetwise-ecs 'meetwise-cd bootstrap-toolchain'");
const versionReadbackAt = workflow.indexOf("ssh meetwise-ecs 'meetwise-cd controller-version'", toolchainSshAt);
assert.ok(rolloutSentinelAt > 0 && rolloutSentinelAt < receiveSshAt, 'rollout sentinel must precede first receiver SSH');
assert.ok(installSshAt > receiveSshAt, 'install must remain after stage-only receive');
assert.ok(toolchainSshAt > installSshAt, 'trusted pnpm bootstrap must run through the newly installed forced-command controller');
assert.ok(versionReadbackAt > toolchainSshAt, 'controller version readback must happen only after the pinned toolchain is ready');
assert.match(workflow, /controller_main_sha_stale_before_install_stage_left_uninstalled/);
assert.match(workflow, /controller_ci_success_missing_before_install_stage_left_uninstalled/);
assert.match(workflow, /\.head_branch == \"main\"/);
const installStepAt = workflow.indexOf('- name: Install the candidate bundle atomically with rollback');
const installRevalidationAt = workflow.indexOf('controller_main_sha_stale_before_install_stage_left_uninstalled', installStepAt);
assert.ok(installStepAt > 0 && installRevalidationAt > installStepAt && installRevalidationAt < installSshAt, 'exact main/CI revalidation must precede controller install');
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

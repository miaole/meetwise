import assert from 'node:assert/strict';
import {
  chmodSync,
  chownSync,
  linkSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  acceptedSyntheticStateOwner,
  ensureSyntheticStateLock,
} from '../ops/ecs/full-stack/full-stack-preview-publisher.mjs';

const GLOBAL_LOCK_NAME = 'global.apply.lock';
const uid = process.getuid();
const gid = process.getgid();
const identity = { rootUid: uid, rootGid: gid, syntheticUid: uid, syntheticGid: gid };
const expectCode = (fn, code) => assert.throws(fn, (error) => error?.message === code, code);
const sameInode = (left, right) => left.dev === right.dev && left.ino === right.ino;
const roots = [];
const repo = resolve(new URL('.', import.meta.url).pathname, '..');
const fixture = () => {
  const root = mkdtempSync(join(tmpdir(), 'meetwise-synthetic-lock-'));
  roots.push(root);
  const state = join(root, 'state');
  mkdirSync(state, { mode: 0o700 });
  chmodSync(state, 0o700);
  return { root, state, lock: join(state, GLOBAL_LOCK_NAME) };
};

try {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--root-cross-owner'));
  {
    const { state, lock } = fixture();
    ensureSyntheticStateLock({ statePath: state, lockPath: lock, ...identity });
    const created = lstatSync(lock);
    assert.ok(created.isFile() && !created.isSymbolicLink());
    assert.equal(created.nlink, 1);
    assert.equal(created.mode & 0o777, 0o600);
  }

  {
    const { state, lock } = fixture();
    writeFileSync(lock, 'legacy'); chmodSync(lock, 0o644);
    const before = lstatSync(lock);
    ensureSyntheticStateLock({ statePath: state, lockPath: lock, ...identity });
    const after = lstatSync(lock);
    assert.ok(sameInode(before, after), 'legacy lock is repaired in place');
    assert.equal(after.mode & 0o777, 0o600);
    ensureSyntheticStateLock({ statePath: state, lockPath: lock, ...identity });
    assert.ok(sameInode(after, lstatSync(lock)), 'correct lock replay is idempotent');
  }

  {
    const { state, lock } = fixture();
    writeFileSync(lock, 'hardlink');
    linkSync(lock, `${lock}.other`);
    expectCode(() => ensureSyntheticStateLock({ statePath: state, lockPath: lock, ...identity }), 'synthetic_global_lock_invalid');
  }

  {
    const { state, lock } = fixture();
    writeFileSync(`${lock}.target`, 'target'); symlinkSync(`${lock}.target`, lock);
    expectCode(() => ensureSyntheticStateLock({ statePath: state, lockPath: lock, ...identity }), 'synthetic_global_lock_invalid');
  }

  if (process.platform !== 'win32') {
    const { state, lock } = fixture();
    execFileSync('mkfifo', [lock]);
    expectCode(() => ensureSyntheticStateLock({ statePath: state, lockPath: lock, ...identity }), 'synthetic_global_lock_invalid');
  }

  {
    const { state, lock } = fixture();
    writeFileSync(lock, 'race');
    const original = lstatSync(lock);
    expectCode(() => ensureSyntheticStateLock({
      statePath: state,
      lockPath: lock,
      ...identity,
      afterLockOpen: () => {
        renameSync(lock, `${lock}.moved`);
        writeFileSync(lock, 'replacement');
      },
    }), 'synthetic_global_lock_binding_invalid');
    assert.ok(sameInode(original, lstatSync(`${lock}.moved`)), 'race does not replace or unlink opened inode');
  }

  {
    const root = mkdtempSync(join(tmpdir(), 'meetwise-synthetic-lock-link-'));
    roots.push(root);
    const target = join(root, 'target'); mkdirSync(target, { mode: 0o700 });
    const state = join(root, 'state'); symlinkSync(target, state);
    expectCode(() => ensureSyntheticStateLock({ statePath: state, lockPath: join(state, GLOBAL_LOCK_NAME), ...identity, repairState: true }), 'synthetic_state_root_invalid');
  }

  assert.equal(acceptedSyntheticStateOwner({ uid: 0, gid: 0 }, { rootUid: 0, rootGid: 0, syntheticUid: 2001, syntheticGid: 2001 }), true);
  assert.equal(acceptedSyntheticStateOwner({ uid: 2001, gid: 2001 }, { rootUid: 0, rootGid: 0, syntheticUid: 2001, syntheticGid: 2001 }), true);
  assert.equal(acceptedSyntheticStateOwner({ uid: 2002, gid: 2002 }, { rootUid: 0, rootGid: 0, syntheticUid: 2001, syntheticGid: 2001 }), false);

  const rootDispatch = readFileSync(join(repo, 'ops/ecs/full-stack/meetwise-cd-root.sh'), 'utf8');
  const syntheticVerify = rootDispatch.slice(rootDispatch.indexOf('synthetic_verify() {'), rootDispatch.indexOf('\n}\n\nprobe_nonce()', rootDispatch.indexOf('synthetic_verify() {')));
  assert.ok(syntheticVerify.indexOf('ensure_synthetic_state_lock') >= 0
    && syntheticVerify.indexOf('ensure_synthetic_state_lock') < syntheticVerify.indexOf('/usr/sbin/runuser'), 'lock repair precedes the first loader runuser boundary');
  assert.match(rootDispatch, /\/usr\/bin\/node "\$PUBLISHER" synthetic-lock-repair \|\| die synthetic_state_lock_invalid 70/);
  const provision = readFileSync(join(repo, 'ops/ecs/full-stack/provision-meetwise-synthetic.sh'), 'utf8');
  assert.match(provision, /\/usr\/bin\/node "\$STATE_LOCK_HELPER" synthetic-lock-repair --repair-state/);
  const manifest = readFileSync(join(repo, 'ops/ecs/full-stack/cd-controller-files.txt'), 'utf8');
  assert.equal(manifest.split('\n').filter(Boolean).length, 32, 'existing controller closure stays self-rollout compatible');
  assert.match(manifest, /ops\/ecs\/full-stack\/full-stack-preview-publisher\.mjs\|\/usr\/local\/lib\/meetwise-preview-controller\/full-stack\/full-stack-preview-publisher\.mjs\|0755/);

  if (process.argv[2] === '--root-cross-owner') {
    assert.equal(process.getuid(), 0, 'cross-owner behavior proof requires root');
    const { state, lock } = fixture();
    writeFileSync(lock, 'legacy-root-lock'); chmodSync(lock, 0o600); chownSync(lock, 0, 0);
    const before = lstatSync(lock);
    ensureSyntheticStateLock({ statePath: state, lockPath: lock, repairState: true });
    const after = lstatSync(lock);
    assert.ok(sameInode(before, after), 'root-owned lock keeps its inode across fchown');
    assert.equal(`${after.uid}:${after.gid}:${(after.mode & 0o777).toString(8)}`, '2001:2001:600');

    assert.equal(spawnSync('sh', ['-c', 'command -v flock >/dev/null']).status, 0, 'Linux runner provides flock');
    const holder = spawn('flock', ['--exclusive', lock, 'sleep', '5'], { stdio: 'ignore' });
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 150));
    ensureSyntheticStateLock({ statePath: state, lockPath: lock });
    assert.notEqual(spawnSync('flock', ['--nonblock', '--exclusive', lock, 'true']).status, 0, 'normalization does not break an active flock');
    holder.kill('SIGTERM');
    await new Promise((resolvePromise) => holder.once('exit', resolvePromise));
  }

  process.stdout.write(`PASS synthetic state lock proof (${process.argv[2] ? 14 : 12} cases)\n`);
} finally {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
}

import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import {
  armEdgeProbeFence,
  clearEdgeProbeFence,
  completeEdgeProbeFence,
  readEdgeProbeFence,
  timeoutEdgeProbeFence,
} from '../ops/ecs/preview-edge-probe-fence.mjs';

const root = await mkdtemp(resolve(tmpdir(), 'meetwise-preview-edge-fence-'));
const path = resolve(root, 'edge-probe-fence.json');
const release = 'a'.repeat(40);

try {
  assert.deepEqual(await readEdgeProbeFence(path), { state: 'absent' });
  await armEdgeProbeFence(path, { releaseDigest: release, deadlineMonotonicMs: 60_000 });
  await assert.rejects(armEdgeProbeFence(path, { releaseDigest: release, deadlineMonotonicMs: 60_000 }), /already_present/);
  await assert.rejects(completeEdgeProbeFence(path, { releaseDigest: release, nowMonotonicMs: 60_000 }), /deadline_elapsed/);
  await assert.rejects(timeoutEdgeProbeFence(path, { nowMonotonicMs: 59_999 }), /deadline_not_elapsed/);
  assert.equal((await timeoutEdgeProbeFence(path, { nowMonotonicMs: 60_001 })).state, 'timed_out');
  assert.equal((await timeoutEdgeProbeFence(path, { nowMonotonicMs: 60_002 })).timeoutWon, true);
  await assert.rejects(completeEdgeProbeFence(path, { releaseDigest: release, nowMonotonicMs: 59_000 }), /not_armed_for_release/);
  await clearEdgeProbeFence(path);
  await armEdgeProbeFence(path, { releaseDigest: release, deadlineMonotonicMs: 120_000 });
  const completed = await completeEdgeProbeFence(path, { releaseDigest: release, nowMonotonicMs: 119_999 });
  assert.equal(completed.state, 'completed');
  const lateTimeout = await timeoutEdgeProbeFence(path, { nowMonotonicMs: 120_000 });
  assert.equal(lateTimeout.state, 'completed');
  assert.equal(lateTimeout.timeoutWon, false);
  await writeFile(path, JSON.stringify({ schemaVersion: 1, state: 'completed', releaseDigest: release }));
  await assert.rejects(readEdgeProbeFence(path), /deadline_invalid/);
  await writeFile(path, JSON.stringify({
    schemaVersion: 1,
    state: 'completed',
    releaseDigest: release,
    deadlineMonotonicMs: 140_000,
    completedMonotonicMs: 140_000,
  }));
  await assert.rejects(readEdgeProbeFence(path), /completed_after_deadline/);
  console.log('✓ preview edge-probe fence 12/12 assertions passed; ECS watchdog fault evidence remains pending');
} finally {
  await rm(root, { recursive: true, force: true });
}

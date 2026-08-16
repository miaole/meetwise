#!/usr/bin/env node
import assert from 'node:assert/strict';
import { chmod, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const controller = await readFile(join(root, 'ops/ecs/controller-lib.sh'), 'utf8');
const edgeProbe = await readFile(join(root, 'ops/ecs/prepare-preview-edge-probe.sh'), 'utf8');
const match = controller.match(/controller_require_edge_probe_units_loaded\(\) \{[\s\S]*?\n\}\n\n(?=controller_unit_is_inactive)/);
assert.ok(match, 'the installed controller must define the edge-probe recovery-unit gate');

const sandbox = await mkdtemp(join(tmpdir(), 'meetwise-edge-probe-unit-load-'));
await writeFile(join(sandbox, 'timeout'), `#!/bin/sh
shift
exec "$@"
`);
await writeFile(join(sandbox, 'systemctl'), `#!/bin/sh
unit=''
for value in "$@"; do unit="$value"; done
case "$unit" in
  meetwise-preview-edge-probe-watchdog.service) state="\${WATCHDOG_STATE:-loaded}" ;;
  meetwise-preview-edge-probe-expiry.service) state="\${EXPIRY_SERVICE_STATE:-loaded}" ;;
  meetwise-preview-edge-probe-expiry.timer) state="\${EXPIRY_TIMER_STATE:-loaded}" ;;
  *) exit 64 ;;
esac
case "$state" in
  __timeout__) exit 124 ;;
  __error__) exit 1 ;;
  *) printf '%s\\n' "$state" ;;
esac
`);
await chmod(join(sandbox, 'timeout'), 0o755);
await chmod(join(sandbox, 'systemctl'), 0o755);

function run(states = {}) {
  return spawnSync('/bin/bash', ['-c', `
set -euo pipefail
PATH=${JSON.stringify(`${sandbox}:$PATH`)}
controller_fail() { exit "\${2:-70}"; }
${match[0]}
controller_require_edge_probe_units_loaded
`], {
    encoding: 'utf8',
    env: { ...process.env, ...states, PATH: `${sandbox}:${process.env.PATH}` },
  });
}

try {
  assert.equal(run().status, 0, 'all three recovery units loaded through PID 1 must permit probe preparation');
  assert.equal(run({ WATCHDOG_STATE: 'not-found' }).status, 70, 'a missing watchdog blocks preparation before a permit can be issued');
  assert.equal(run({ EXPIRY_SERVICE_STATE: 'activating' }).status, 70, 'an unknown expiry-service state blocks preparation');
  assert.equal(run({ EXPIRY_TIMER_STATE: '__timeout__' }).status, 70, 'a bounded PID 1 query timeout blocks preparation');

  const reset = edgeProbe.indexOf('systemctl reset-failed');
  const unitGate = edgeProbe.indexOf('controller_require_edge_probe_units_loaded');
  const fenceClear = edgeProbe.indexOf('controller_clear_edge_fence');
  const transition = edgeProbe.indexOf('controller_ledger_transition active_unpublished edge_probing');
  const permit = edgeProbe.indexOf('controller_issue_serving_permit');
  const watchdogStart = edgeProbe.indexOf('systemctl start meetwise-preview-edge-probe-watchdog.service');
  const watchdogActive = edgeProbe.indexOf('systemctl is-active --quiet meetwise-preview-edge-probe-watchdog.service');
  assert.ok(reset >= 0 && reset < unitGate, 'reset-failed is cleanup before the positive recovery-unit gate');
  assert.ok(unitGate < fenceClear && unitGate < transition && unitGate < permit, 'missing recovery units cannot clear a fence, transition state or issue a permit');
  assert.ok(permit < watchdogStart && watchdogStart < watchdogActive, 'the watchdog must still start and become active after the permit is issued');

  console.log('✓ edge-probe recovery-unit gate 8/8 assertions passed; releaseEvidence=false');
} finally {
  await rm(sandbox, { recursive: true, force: true });
}

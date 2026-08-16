import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmod, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const controller = resolve('ops/ecs/controller-lib.sh');
const root = await mkdtemp(resolve(tmpdir(), 'meetwise-preview-monotonic-clock-'));
const fakeAwk = resolve(root, 'awk');
const program = [
  'source "$1"',
  'PATH="$2:$PATH"',
  'value="$(controller_monotonic_milliseconds)"',
  '[[ "$value" =~ ^[0-9]+$ ]]',
  '(( value > 0 ))',
  'printf "%s\\n" "$value"',
].join('\n');
try {
  await writeFile(fakeAwk, [
    '#!/bin/bash',
    'set -euo pipefail',
    '[[ "$1" == *\'%.0f\\n\'* ]]',
    '[[ "$1" != *\'%.0f\\\\n\'* ]]',
    'printf "67476210\\n"',
  ].join('\n'));
  await chmod(fakeAwk, 0o755);
  const result = spawnSync('/bin/bash', ['-ceu', program, 'preview-monotonic-clock', controller, root], {
    encoding: 'utf8',
    env: { ...process.env, PATH: [root, process.env.PATH].join(':') },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '67476210\n');
  console.log('✓ preview monotonic clock emits a decimal integer usable by the edge-probe deadline arithmetic');
} finally {
  await rm(root, { recursive: true, force: true });
}

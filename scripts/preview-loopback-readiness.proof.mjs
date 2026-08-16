import assert from 'node:assert/strict';
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = process.cwd();
const deploy = readFileSync(resolve(root, 'ops/ecs/deploy-preview-web.sh'), 'utf8');
const match = deploy.match(/loopback_ready=0\n([\s\S]*?)\n\[\[ "\$loopback_ready" == 1 \]\] \|\| deploy_fail 'loopback preview did not become ready after Nginx reload' 70/);
assert.ok(match, 'the bounded loopback readiness fragment is present');

const runReadiness = (responses) => {
  const sandbox = mkdtempSync(join(tmpdir(), 'meetwise-loopback-ready-'));
  const bin = join(sandbox, 'bin');
  const state = join(sandbox, 'state');
  const body = join(sandbox, 'loopback.html');
  const curl = join(bin, 'curl');
  const sleep = join(bin, 'sleep');
  try {
    spawnSync('/bin/mkdir', ['-p', bin], { stdio: 'inherit' });
    writeFileSync(join(sandbox, 'responses'), `${responses.join('\n')}\n`, 'utf8');
    writeFileSync(curl, `#!/bin/sh
set -eu
count=0
[ -f "$MOCK_STATE" ] && count=$(cat "$MOCK_STATE")
count=$((count + 1))
printf '%s' "$count" > "$MOCK_STATE"
destination=''
while [ "$#" -gt 0 ]; do
  if [ "$1" = '-o' ]; then destination=$2; shift 2; continue; fi
  shift
done
line=$(sed -n "\${count}p" "$MOCK_RESPONSES" || true)
case "$line" in
  FAIL) exit 7 ;;
  *) printf '%s\\n' "$line" > "$destination" ;;
esac
`, 'utf8');
    writeFileSync(sleep, '#!/bin/sh\nexit 0\n', 'utf8');
    chmodSync(curl, 0o755);
    chmodSync(sleep, 0o755);
    const script = `set -u
scratch=${JSON.stringify(sandbox)}
preview_host=preview.example.test
marker=${JSON.stringify('<meta name="meetwise-preview-release" content="new"')}
loopback_body=${JSON.stringify(body)}
deploy_fail() { return "$2"; }
loopback_ready=0
${match[1]}
[[ "$loopback_ready" == 1 ]] || deploy_fail 'loopback preview did not become ready after Nginx reload' 70
`;
    const result = spawnSync('/bin/bash', ['-c', script], {
      env: {
        PATH: `${bin}:/usr/bin:/bin`,
        MOCK_RESPONSES: join(sandbox, 'responses'),
        MOCK_STATE: state,
      },
      encoding: 'utf8',
    });
    return { status: result.status, calls: Number(readFileSync(state, 'utf8')) };
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
};

const oldThenNew = runReadiness([
  '<meta name="meetwise-preview-release" content="old">',
  '<meta name="meetwise-preview-release" content="new">',
]);
assert.equal(oldThenNew.status, 0, 'a stale 200 response is retried until the new marker arrives');
assert.equal(oldThenNew.calls, 2, 'the new marker ends the bounded retry immediately');

const neverCurrent = runReadiness(Array.from({ length: 20 }, () => '<meta name="meetwise-preview-release" content="old">'));
assert.equal(neverCurrent.status, 70, 'twenty stale responses fail closed');
assert.equal(neverCurrent.calls, 20, 'the retry budget is finite');

console.log('preview loopback readiness 2/2 assertions passed');

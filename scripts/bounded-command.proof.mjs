import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { captureBounded, BoundedCommandError, appendStderrTail, writeFailureStderrTail, disposableDockerRmArgs, PROTECTED_NAMED_VOLUME_COMPOSE } from './bounded-command.mjs';

const minimalEnv = { PATH: process.env.PATH ?? '', LANG: 'C', LC_ALL: 'C', TZ: 'UTC' };

async function expectCode(action, code) {
  await assert.rejects(action, (error) => error instanceof BoundedCommandError && error.code === code);
}

const startedAt = performance.now();
await expectCode(
  () => captureBounded(process.execPath, ['--eval', 'setInterval(() => {}, 1_000)'], {
    cwd: process.cwd(), env: minimalEnv, timeoutMs: 120,
  }),
  'bounded_command_timeout',
);
assert.ok(performance.now() - startedAt < 2_500, 'timed-out child must not make the runner hang');
console.log('PASS  隔离运行器的永久阻塞子进程在硬时限内被终止并收敛为固定失败');

const temporaryRoot = await mkdtemp(join(tmpdir(), 'meetwise-bounded-command-'));
try {
  const descendantPidFile = join(temporaryRoot, 'descendant.pid');
  const program = [
    "const { spawn } = require('node:child_process');",
    "const { writeFileSync } = require('node:fs');",
    `const child = spawn(process.execPath, ['--eval', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });`,
    `writeFileSync(${JSON.stringify(descendantPidFile)}, String(child.pid));`,
    'setInterval(() => {}, 1000);',
  ].join(' ');
  await expectCode(
    () => captureBounded(process.execPath, ['--eval', program], {
      cwd: process.cwd(), env: minimalEnv, timeoutMs: 120,
    }),
    'bounded_command_timeout',
  );
  const descendantPid = Number(await readFile(descendantPidFile, 'utf8'));
  await new Promise((resolve) => setTimeout(resolve, 80));
  let descendantAlive = true;
  try { process.kill(descendantPid, 0); } catch { descendantAlive = false; }
  assert.equal(descendantAlive, false, 'the timed-out command group must not leave its descendant running');
  console.log('PASS  隔离运行器终止超时命令的整个进程组，不遗留子孙进程');
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}

const output = await captureBounded(process.execPath, ['--eval', "process.stdout.write('ready')"], {
  cwd: process.cwd(), env: minimalEnv, timeoutMs: 2_000,
});
assert.equal(output, 'ready');
console.log('PASS  隔离运行器保留正常短探针输出，不因硬时限误判');

await expectCode(
  () => captureBounded(process.execPath, ['--eval', "process.stdout.write('x'.repeat(64))"], {
    cwd: process.cwd(), env: minimalEnv, timeoutMs: 2_000, maxOutputBytes: 32,
  }),
  'bounded_command_output_exceeded',
);
console.log('PASS  隔离运行器拒绝超出受限缓冲区的输出且不回显原文');

await expectCode(
  () => captureBounded(process.execPath, ['--eval', 'process.exit(7)'], {
    cwd: process.cwd(), env: minimalEnv, timeoutMs: 2_000,
  }),
  'bounded_command_exit_nonzero',
);
console.log('PASS  隔离运行器把非零探针统一收敛为固定错误码，Error 不携带子进程内容');


const failureSinkChunks = [];
const failureSink = { write(chunk) { failureSinkChunks.push(String(chunk)); return true; } };
try {
  await captureBounded(process.execPath, ['--eval', "process.stderr.write('VISIBLE_ISOLATED_STDERR_MARKER\\n'); process.exit(7)"], {
    cwd: process.cwd(), env: minimalEnv, timeoutMs: 2_000, stderrSink: failureSink,
  });
  assert.equal('reached', 'rejected', 'failing child must reject');
} catch (error) {
  assert.equal(error instanceof BoundedCommandError, true, 'failure stays BoundedCommandError');
  assert.equal(error.code, 'bounded_command_exit_nonzero', 'failure error code stays fixed');
  assert.equal(error.message, 'bounded_command_exit_nonzero', 'error must not carry child stderr');
  assert.equal(String(error).includes('VISIBLE_ISOLATED_STDERR_MARKER'), false, 'error text must omit stderr tail');
}
assert.match(failureSinkChunks.join(''), /VISIBLE_ISOLATED_STDERR_MARKER/, 'failure must print child stderr tail');
assert.match(failureSinkChunks.join(''), /ISOLATED_CHILD_STDERR_TAIL/, 'failure tail uses the isolated marker');
console.log('PASS  失败用例的子进程 stderr 尾部对操作者可见，且不写入 Error');

const successSinkChunks = [];
const successSink = { write(chunk) { successSinkChunks.push(String(chunk)); return true; } };
const quiet = await captureBounded(process.execPath, ['--eval', "process.stderr.write('SUCCESS_STDERR_SHOULD_STAY_QUIET\\n'); process.stdout.write('ready-quiet')"], {
  cwd: process.cwd(), env: minimalEnv, timeoutMs: 2_000, stderrSink: successSink,
});
assert.equal(quiet, 'ready-quiet');
assert.equal(successSinkChunks.join(''), '', 'success must not print stderr tail');
console.log('PASS  成功探针不打印 stderr 尾部');

assert.equal(appendStderrTail('abc', 'defghi', 5), 'efghi', 'stderr tail keeps only the trailing bytes');
const helperChunks = [];
writeFailureStderrTail('TAIL-ONLY', { exitCode: 3, command: 'node --eval' }, { write(chunk) { helperChunks.push(String(chunk)); return true; } });
assert.match(helperChunks.join(''), /TAIL-ONLY/, 'writeFailureStderrTail prints the provided tail');
assert.deepEqual(disposableDockerRmArgs(['meetwise-e2e-demo']), ['rm', '-f', '-v', 'meetwise-e2e-demo'], 'rm args are docker rm -f -v plus container names');
assert.equal(PROTECTED_NAMED_VOLUME_COMPOSE.includes('docker/compose.mysql-local.yml'), true, 'mysql-local named volumes stay protected');
assert.throws(() => disposableDockerRmArgs(['-f']), (error) => error instanceof BoundedCommandError && error.code === 'disposable_docker_rm_name_invalid', 'flag-like names are rejected');
console.log('PASS  docker rm -fv 参数只清匿名卷，不把命名数据卷列入删除目标');

const isolatedSource = await readFile(new URL('./run-e2e-isolated.mjs', import.meta.url), 'utf8');
assert.equal(/child\.stderr\.on\('data',\s*\(\)\s*=>\s*\{\}\)/.test(isolatedSource), false, 'run-e2e-isolated must not swallow stderr');
assert.equal(/writeFailureStderrTail\(/.test(isolatedSource), true, 'run-e2e-isolated prints stderr tail on failure');
assert.equal(/\[\s*'rm'\s*,\s*'-f'\s*,(?!\s*'-v')/.test(isolatedSource), false, 'isolated docker rm must include -v');
assert.equal(/disposableDockerRmArgs\(/.test(isolatedSource), true, 'disposable PG cleanup uses docker rm -fv helper');
assert.equal(/down\s+-v[\s\S]{0,240}mysql-local|compose\.mysql-local[\s\S]{0,240}down[^\n]{0,80}-v/.test(isolatedSource), false, 'runner must not compose down -v mysql-local named volumes');
console.log('PASS  isolated runner 源码钉住失败 stderr 可见且 docker rm -v');

function listAnonymousVolumes() {
  const listed = spawnSync('docker', ['volume', 'ls', '-q'], { encoding: 'utf8' });
  assert.equal(listed.status, 0, 'docker volume ls must succeed');
  return new Set((listed.stdout || '').trim().split('\n').filter((name) => /^[a-f0-9]{64}$/.test(name)));
}

const dockerInfo = spawnSync('docker', ['info'], { stdio: 'ignore' });
assert.equal(dockerInfo.status, 0, 'volume prove requires docker');
const stamp = `${process.pid}-${Date.now()}`;
const namedVolume = `meetwise-isorunner-prove-keep-${stamp}`;
const disposable = `meetwise-isorunner-prove-ctr-${stamp}`;
const beforeAnonymous = listAnonymousVolumes();
try {
  const createdVol = spawnSync('docker', ['volume', 'create', namedVolume], { encoding: 'utf8' });
  assert.equal(createdVol.status, 0, 'named volume create must succeed');
  const started = spawnSync('docker', [
    'run', '-d', '--name', disposable,
    '-v', `${namedVolume}:/keep`,
    '--mount', 'type=volume,target=/anon',
    'redis:7-alpine', 'sleep', '30',
  ], { encoding: 'utf8' });
  assert.equal(started.status, 0, 'container with anonymous volume must start');
  const midAnonymous = listAnonymousVolumes();
  assert.ok([...midAnonymous].some((name) => !beforeAnonymous.has(name)), 'fixture must create a new anonymous volume');
  const removed = spawnSync('docker', disposableDockerRmArgs([disposable]), { encoding: 'utf8' });
  assert.equal(removed.status, 0, 'docker rm -fv must succeed');
  const afterAnonymous = listAnonymousVolumes();
  assert.deepEqual([...afterAnonymous].filter((name) => !beforeAnonymous.has(name)), [], 'docker rm -fv must leave no new anonymous volume');
  const namedStill = spawnSync('docker', ['volume', 'inspect', namedVolume], { stdio: 'ignore' });
  assert.equal(namedStill.status, 0, 'named data volume must survive docker rm -fv');
  console.log(`PASS  清理后匿名卷无新增（前=${beforeAnonymous.size} 后=${afterAnonymous.size}），命名卷保留`);
} finally {
  spawnSync('docker', ['rm', '-f', '-v', disposable], { stdio: 'ignore' });
  spawnSync('docker', ['volume', 'rm', '-f', namedVolume], { stdio: 'ignore' });
}

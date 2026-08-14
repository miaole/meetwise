import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { captureBounded, BoundedCommandError } from './bounded-command.mjs';

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
console.log('PASS  隔离运行器把非零探针统一收敛为固定错误码，不回显子进程内容');

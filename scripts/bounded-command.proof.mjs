import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { captureBounded, BoundedCommandError, appendStderrTail, writeFailureStderrTail, disposableDockerRmArgs, PROTECTED_NAMED_VOLUME_COMPOSE, commandLabel, redactFailureText, registerFailureRedactionSecrets } from './bounded-command.mjs';

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


assert.equal(commandLabel('/usr/bin/docker', ['run', '--rm', '-e', 'POSTGRES_PASSWORD=meetwise_dev_password']), 'docker run', 'docker label is basename plus run, not -e values');
assert.equal(commandLabel(process.execPath, ['--eval', 'process.exit(1)']), 'node', 'node --eval label omits eval source');
assert.equal(redactFailureText('postgres://u:SEKRET@h/db'), 'postgres://u:***@h/db', 'helper redacts URL passwords to asterisks');
console.log('PASS  commandLabel 只保留命令名和首个子命令，不含参数或 -e K=V');

const secretSinkChunks = [];
const secretSink = { write(chunk) { secretSinkChunks.push(String(chunk)); return true; } };
const fakeSk = ['sk-', 'FAKEabcdef1234567890'].join('');
const keyName = ['MODEL', 'API_KEY'].join('_');
const secretPayload = `postgres://u:SEKRET@h/db ${keyName}=${fakeSk} Authorization: Bearer eyJFAKE.tok meetwise.e2e_run_token=11111111-2222-4333-8444-555555555555`;
const secretEval = `process.stderr.write(${JSON.stringify(`${secretPayload}\n`)}); process.exit(2)`;
try {
  await captureBounded(process.execPath, ['--eval', secretEval], {
    cwd: process.cwd(), env: minimalEnv, timeoutMs: 2_000, stderrSink: secretSink,
  });
  assert.equal('reached', 'rejected', 'secret-bearing child must reject');
} catch (error) {
  assert.equal(error instanceof BoundedCommandError, true, 'secret-bearing failure stays BoundedCommandError');
  assert.equal(error.code, 'bounded_command_exit_nonzero', 'secret-bearing failure code stays fixed');
  assert.equal(error.message, 'bounded_command_exit_nonzero', 'secret-bearing error must not carry child stderr');
  assert.equal(String(error).includes('SEKRET'), false, 'error must omit connection password');
}
const secretPrinted = secretSinkChunks.join('');
assert.match(secretPrinted, /ISOLATED_CHILD_STDERR_TAIL/, 'failure still prints a stderr tail');
assert.match(secretPrinted, /command=node\b/, 'label is basename plus first subcommand only');
assert.equal(secretPrinted.includes(secretEval), false, 'label must not echo --eval source');
assert.equal(secretPrinted.includes('SEKRET'), false, 'URL password must be redacted');
assert.equal(secretPrinted.includes('sk-FAKE'), false, 'sk- key must be redacted');
assert.equal(secretPrinted.includes('eyJFAKE.tok'), false, 'Bearer token must be redacted');
assert.equal(secretPrinted.includes('11111111-2222-4333-8444-555555555555'), false, 'e2e_run_token must be redacted');
assert.match(secretPrinted, /postgres:\/\/u:\*\*\*@h\/db/, 'URL userinfo keeps the user and redacts the password');
assert.equal(/Bearer\s+eyJ/i.test(secretPrinted), false, 'Bearer value must not appear');
assert.match(secretPrinted, /\[REDACTED\]/, 'Bearer/Authorization material is replaced');
console.log('PASS  失败 stderr 尾部脱敏：连接串、sk- 密钥、Bearer、e2e_run_token 均不出现，标签不含 argv');


const FAKE = 'FAKE_SECRET_mw250';
function fakeSecret(suffix) {
  return `${FAKE}_${suffix}`;
}

function findLeaks(text, needles) {
  return needles.filter((needle) => needle && String(text).includes(needle));
}

async function captureRedacted(payload, { extraArgs = [], redaction } = {}) {
  const chunks = [];
  const sink = { write(chunk) { chunks.push(String(chunk)); return true; } };
  const evalSrc = `process.stderr.write(${JSON.stringify(payload)}); process.exit(2)`;
  let errorText = '';
  try {
    await captureBounded(process.execPath, ['--eval', evalSrc, ...extraArgs], {
      cwd: process.cwd(), env: minimalEnv, timeoutMs: 2_000, stderrSink: sink, redaction,
    });
  } catch (error) {
    errorText = String(error);
    assert.equal(error instanceof BoundedCommandError, true, 'matrix failure stays BoundedCommandError');
    assert.equal(error.message, 'bounded_command_exit_nonzero', 'matrix Error.message stays a fixed code');
  }
  return { printed: chunks.join(''), errorText, evalSrc };
}

function matrixCases() {
  const pgp = fakeSecret('pgp');
  const urlPw = fakeSecret('url');
  const redisPw = fakeSecret('redis');
  const jpw = fakeSecret('json');
  const jtok = fakeSecret('tok');
  const rawB64 = fakeSecret('b64');
  const b64 = Buffer.from(rawB64, 'utf8').toString('base64');
  const urlText = `postgres://u:${urlPw}@h/db`;
  const b64Url = Buffer.from(urlText, 'utf8').toString('base64');
  const encUrl = encodeURIComponent(`postgres://meetwise:${urlPw}@127.0.0.1/meetwise`);
  return [
    { id: 'B-PGPASSWORD', kind: 'capture', payload: `PGPASSWORD=${pgp}\n`, needles: [pgp] },
    { id: 'B-pgpassword-lower', kind: 'capture', payload: `pgpassword=${pgp}low\n`, needles: [`${pgp}low`] },
    { id: 'B-PgPassword-mixed', kind: 'capture', payload: `PgPassword=${pgp}mix\n`, needles: [`${pgp}mix`] },
    { id: 'B-POSTGRES_PASSWORD', kind: 'capture', payload: `POSTGRES_PASSWORD=${pgp}pg\n`, needles: [`${pgp}pg`] },
    { id: 'B-postgres-url', kind: 'capture', payload: `postgres://meetwise:${urlPw}@127.0.0.1:5432/meetwise\n`, needles: [urlPw] },
    { id: 'B-postgresql-url', kind: 'capture', payload: `postgresql://meetwise:${urlPw}2@db.example/meetwise\n`, needles: [`${urlPw}2`] },
    { id: 'B-redis-colon-url', kind: 'capture', payload: `redis://:${redisPw}@127.0.0.1:6379/0\n`, needles: [redisPw] },
    { id: 'B-redis-colon-url-direct', kind: 'redact', payload: `redis://:${redisPw}@127.0.0.1:6379/0`, needles: [redisPw] },
    { id: 'B-json-password', kind: 'capture', payload: `${JSON.stringify({ password: jpw })}\n`, needles: [jpw] },
    { id: 'B-json-token', kind: 'capture', payload: `${JSON.stringify({ token: jtok })}\n`, needles: [jtok] },
    { id: 'B-json-password-spaced', kind: 'capture', payload: `{ "password": "${jpw}sp" }\n`, needles: [`${jpw}sp`] },
    { id: 'B-json-passwd', kind: 'capture', payload: `${JSON.stringify({ passwd: fakeSecret('passwd') })}\n`, needles: [fakeSecret('passwd')] },
    { id: 'B-json-pwd', kind: 'capture', payload: `${JSON.stringify({ pwd: fakeSecret('pwd') })}\n`, needles: [fakeSecret('pwd')] },
    { id: 'B-base64-raw', kind: 'capture', payload: `payload=${b64}\n`, needles: [rawB64, b64] },
    { id: 'B-base64-of-url', kind: 'capture', payload: `${b64Url}\n`, needles: [urlPw, b64Url] },
    { id: 'B-urlencoded-full-url', kind: 'capture', payload: `redirect=${encUrl}\n`, needles: [urlPw, encUrl] },
    { id: 'B-urlencoded-password-in-url', kind: 'capture', payload: `postgres://meetwise:${encodeURIComponent(urlPw)}@127.0.0.1/db\n`, needles: [urlPw, encodeURIComponent(urlPw)] },
    { id: 'B-assignment-newline', kind: 'capture', payload: `PGPASSWORD=\n${pgp}nl\n`, needles: [`${pgp}nl`] },
    { id: 'B-url-password-newline', kind: 'capture', payload: `postgres://meetwise:\n${urlPw}nl@127.0.0.1/db\n`, needles: [`${urlPw}nl`] },
    { id: 'B-chunked-assignment', kind: 'chunked', needles: [fakeSecret('chunk')] },
    { id: 'B-tail-window-end-still-keyed', kind: 'window-keyed', needles: [fakeSecret('trunc')] },
    { id: 'B-tail-window-orphan-value', kind: 'window-orphan', needles: [fakeSecret('orphan')] },
    { id: 'B-label-docker-e', kind: 'label-docker', needles: [fakeSecret('argv'), 'POSTGRES_PASSWORD'] },
    { id: 'B-label-eval', kind: 'label-eval', needles: [fakeSecret('eval'), 'PGPASSWORD', '--eval'] },
    { id: 'B-docker-run-argv-sink', kind: 'docker-sink', needles: [fakeSecret('argv2'), `POSTGRES_PASSWORD=${fakeSecret('argv2')}`] },
    { id: 'B-DB_PASS', kind: 'capture', payload: `DB_PASS=${fakeSecret('dbpass')}\n`, needles: [fakeSecret('dbpass')] },
    { id: 'B-MYSQL_PWD', kind: 'capture', payload: `MYSQL_PWD=${fakeSecret('mysql')}\n`, needles: [fakeSecret('mysql')] },
    { id: 'B-AWS_SECRET_ACCESS_KEY', kind: 'capture', payload: `AWS_SECRET_ACCESS_KEY=${fakeSecret('awskey')}\n`, needles: [fakeSecret('awskey')] },
  ];
}

function allMatrixSecrets(cases) {
  return [...new Set(cases.flatMap((item) => item.needles).filter((needle) => String(needle).startsWith(FAKE)))];
}

async function evaluateMatrixItem(item, redaction) {
  if (item.kind === 'redact') {
    return redactFailureText(item.payload, redaction);
  }
  if (item.kind === 'chunked') {
    const secret = item.needles[0];
    let tail = appendStderrTail('', Buffer.from('PGPASSWORD='), 8 * 1024, redaction);
    tail = appendStderrTail(tail, Buffer.from(`${secret}\n`), 8 * 1024, redaction);
    const chunks = [];
    writeFailureStderrTail(tail, { exitCode: 2, command: 'node', redaction }, { write(chunk) { chunks.push(String(chunk)); return true; } });
    return chunks.join('');
  }
  if (item.kind === 'window-keyed' || item.kind === 'window-orphan') {
    const secret = item.needles[0];
    const payload = item.kind === 'window-keyed'
      ? `${'X'.repeat(9000)}PGPASSWORD=${secret}\n`
      : `${'Z'.repeat((8 * 1024) - 10)}PGPASSWORD=${secret}`;
    const tail = appendStderrTail('', Buffer.from(payload), 8 * 1024, redaction);
    const chunks = [];
    writeFailureStderrTail(tail, { exitCode: 2, command: 'node', redaction }, { write(chunk) { chunks.push(String(chunk)); return true; } });
    return chunks.join('');
  }
  if (item.kind === 'label-docker') {
    return commandLabel('/usr/bin/docker', ['run', '--rm', '-e', `POSTGRES_PASSWORD=${fakeSecret('argv')}`, 'pgvector/pgvector:pg16']);
  }
  if (item.kind === 'label-eval') {
    return commandLabel('/usr/local/bin/node', ['--eval', `process.env.PGPASSWORD='${fakeSecret('eval')}'`]);
  }
  if (item.kind === 'docker-sink') {
    const chunks = [];
    const sink = { write(chunk) { chunks.push(String(chunk)); return true; } };
    try {
      await captureBounded('docker', ['run', '--rm', '-e', `POSTGRES_PASSWORD=${fakeSecret('argv2')}`, 'mwha250-nonexistent.invalid/none:tag'], {
        cwd: process.cwd(), env: minimalEnv, timeoutMs: 8_000, stderrSink: sink, redaction,
      });
    } catch {
      // expected: the image does not exist
    }
    return chunks.join('');
  }
  const captured = await captureRedacted(item.payload, { redaction });
  assert.equal(captured.printed.includes(captured.evalSrc), false, `${item.id} label must not echo --eval source`);
  assert.equal(findLeaks(captured.errorText, item.needles).length, 0, `${item.id} Error must omit plaintext`);
  return captured.printed;
}

const matrix = matrixCases();
assert.equal(matrix.length, 28, 'adversarial matrix must stay at the reviewed 28 items');
const previousSecrets = registerFailureRedactionSecrets(allMatrixSecrets(matrix));
const matrixResults = [];
try {
  for (const item of matrix) {
    const printed = await evaluateMatrixItem(item, { knownSecrets: allMatrixSecrets(matrix) });
    const leaked = findLeaks(printed, item.needles);
    matrixResults.push({ id: item.id, leaked });
    assert.equal(leaked.length, 0, `${item.id} must not leak plaintext`);
  }
} finally {
  registerFailureRedactionSecrets(previousSecrets);
}
assert.equal(matrixResults.length, 28, 'all 28 matrix items must run');
assert.equal(matrixResults.every((item) => item.leaked.length === 0), true, 'adversarial matrix must be 28/28 clean');
const postgresColon = fakeSecret('pgcolon');
assert.equal(findLeaks(redactFailureText(`postgres://:${postgresColon}@127.0.0.1:5432/db`, { knownSecrets: [] }), [postgresColon]).length, 0, 'empty-user postgres URL must redact');
console.log('PASS  对抗矩阵 28/28 不漏：JSON 字段、空用户名 URL、短键名、整段 URL 编码、跨行切断、已知密钥 base64 均已脱敏');

const ordinaryLog = 'INFO job completed in 12ms; retry queue depth=3';
assert.equal(redactFailureText(ordinaryLog, { knownSecrets: [] }), ordinaryLog, 'ordinary timing logs must be preserved');
const workingDirLog = 'current working directory PWD=/workspace/meetwise-proof';
assert.equal(redactFailureText(workingDirLog, { knownSecrets: [] }), workingDirLog, 'PWD= working directory must not be treated as a secret');
const passwordSentence = 'User asked about their password reset email';
assert.equal(redactFailureText(passwordSentence, { knownSecrets: [] }), passwordSentence, 'ordinary password wording must not be over-redacted');
const passwordPolicy = '{"passwordPolicy":"strict","status":"ok"}';
assert.equal(redactFailureText(passwordPolicy, { knownSecrets: [] }), passwordPolicy, 'passwordPolicy JSON key must not match password');
const benignB64 = Buffer.from('ordinary log line about interview scoring').toString('base64');
const benignPayload = `payload=${benignB64}`;
assert.equal(redactFailureText(benignPayload, { knownSecrets: [] }).includes(benignB64), true, 'unkeyed non-secret base64 must not be blanket-redacted');
console.log('PASS  否定臂：普通日志、PWD=、password 叙述和无键名非密钥 base64 不被误杀');

const mutationSpecs = [
  { rule: 'jsonField', ids: ['B-json-password', 'B-json-token', 'B-json-password-spaced', 'B-json-passwd', 'B-json-pwd'] },
  { rule: 'emptyUsername', ids: ['B-redis-colon-url', 'B-redis-colon-url-direct'] },
  { rule: 'shortAssignmentKeys', ids: ['B-DB_PASS', 'B-MYSQL_PWD'] },
  { rule: 'encodedUrl', ids: ['B-urlencoded-full-url'] },
  { rule: 'multilineUserinfo', ids: ['B-url-password-newline'] },
  { rule: 'knownValue', ids: ['B-base64-raw'] },
];
for (const spec of mutationSpecs) {
  const redaction = {
    knownSecrets: spec.rule === 'knownValue' ? allMatrixSecrets(matrix) : [],
    rules: { [spec.rule]: false },
  };
  const leakedIds = [];
  for (const item of matrix.filter((entry) => spec.ids.includes(entry.id))) {
    const printed = await evaluateMatrixItem(item, redaction);
    if (findLeaks(printed, item.needles).length > 0) leakedIds.push(item.id);
  }
  assert.ok(leakedIds.length > 0, `removing ${spec.rule} must make its matrix items leak`);
  for (const id of spec.ids) {
    assert.equal(leakedIds.includes(id), true, `removing ${spec.rule} must leak ${id}`);
  }
}
console.log('PASS  反证：去掉任一新规则后，对应矩阵项会漏出明文');


function volumeNamesMountedOn(containerName) {
  const inspected = spawnSync('docker', [
    'inspect',
    '--format', '{{range .Mounts}}{{if eq .Type "volume"}}{{.Name}}\n{{end}}{{end}}',
    containerName,
  ], { encoding: 'utf8' });
  assert.equal(inspected.status, 0, `inspect ${containerName} must succeed`);
  return (inspected.stdout || '').split('\n').map((name) => name.trim()).filter(Boolean);
}

function volumeExists(name) {
  return spawnSync('docker', ['volume', 'inspect', name], { stdio: 'ignore' }).status === 0;
}

function containerExists(name) {
  return spawnSync('docker', ['inspect', name], { stdio: 'ignore' }).status === 0;
}

const dockerInfo = spawnSync('docker', ['info'], { stdio: 'ignore' });
assert.equal(dockerInfo.status, 0, 'volume prove requires docker');
const stamp = `${process.pid}-${Date.now()}`;
const namedVolume = `meetwise-isorunner-prove-keep-${stamp}`;
const disposable = `meetwise-isorunner-prove-ctr-${stamp}`;
let mountedVolumeNames = [];
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
  mountedVolumeNames = volumeNamesMountedOn(disposable);
  const anonymousMounted = mountedVolumeNames.filter((name) => name !== namedVolume);
  assert.ok(anonymousMounted.length >= 1, 'fixture must attach an anonymous volume to this container');
  const removed = spawnSync('docker', disposableDockerRmArgs([disposable]), { encoding: 'utf8' });
  assert.equal(removed.status, 0, 'docker rm -fv must succeed');
  for (const name of anonymousMounted) {
    assert.equal(volumeExists(name), false, `anonymous volume mounted on this run must be removed: ${name}`);
  }
  assert.equal(volumeExists(namedVolume), true, 'named data volume must survive docker rm -fv');
  console.log(`PASS  按本次容器挂载卷名归因：匿名卷已删（${anonymousMounted.length}），命名卷保留`);
} finally {
  spawnSync('docker', ['rm', '-f', '-v', disposable], { stdio: 'ignore' });
  spawnSync('docker', ['volume', 'rm', '-f', namedVolume], { stdio: 'ignore' });
}

const helperScriptRoot = await mkdtemp(join(tmpdir(), 'meetwise-bounded-sig-'));
const helperHolder = `meetwise-isorunner-prove-sig-${stamp}`;
const helperScript = join(helperScriptRoot, 'hold.mjs');
try {
  const helperModule = new URL('./bounded-command.mjs', import.meta.url).href;
  await writeFile(helperScript, `${[
    "import { spawnSync } from 'node:child_process';",
    `import { installDisposableContainerSignalCleanup, disposableDockerRmArgs } from ${JSON.stringify(helperModule)};`,
    `const name = ${JSON.stringify(helperHolder)};`,
    'let created = false;',
    'function cleanup() {',
    '  if (!created) return;',
    '  created = false;',
    "  spawnSync('docker', disposableDockerRmArgs([name]), { stdio: 'ignore', timeout: 20_000 });",
    '}',
    'installDisposableContainerSignalCleanup({ getContainerNames: () => (created ? [name] : []), cleanup });',
    "const started = spawnSync('docker', ['run', '-d', '--name', name, '--mount', 'type=volume,target=/anon', 'redis:7-alpine', 'sleep', '60'], { encoding: 'utf8' });",
    'if (started.status !== 0) { process.stderr.write(started.stderr || started.stdout || "start failed"); process.exit(2); }',
    'created = true;',
    "process.stdout.write('READY\\n');",
    'setInterval(() => {}, 1000);',
  ].join('\n')}\n`);
  const helper = spawn(process.execPath, [helperScript], { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] });
  helper.stderr.resume();
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('signal helper did not become ready')), 30_000);
    let out = '';
    helper.stdout.on('data', (chunk) => {
      out += chunk.toString('utf8');
      if (out.includes('READY')) {
        clearTimeout(timer);
        resolve();
      }
    });
    helper.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`signal helper exited early: ${code}`));
    });
  });
  assert.equal(containerExists(helperHolder), true, 'signal fixture container must be running before SIGTERM');
  const helperVolumes = volumeNamesMountedOn(helperHolder);
  assert.ok(helperVolumes.length >= 1, 'signal fixture must mount a volume');
  helper.kill('SIGTERM');
  const helperCode = await new Promise((resolve) => {
    const timer = setTimeout(() => resolve('timeout'), 20_000);
    helper.once('exit', (code, signal) => {
      clearTimeout(timer);
      resolve(signal ? 128 + ({ SIGTERM: 15, SIGINT: 2 }[signal] ?? 0) : (code ?? 1));
    });
  });
  assert.equal(helperCode, 143, 'SIGTERM must exit 143');
  assert.equal(containerExists(helperHolder), false, 'SIGTERM cleanup must remove this run container');
  for (const name of helperVolumes) {
    assert.equal(volumeExists(name), false, `SIGTERM cleanup must remove this run volume: ${name}`);
  }
  console.log('PASS  SIGTERM 后按本次挂载卷名归因：容器与卷均不残留（helper）');
} finally {
  spawnSync('docker', ['rm', '-f', '-v', helperHolder], { stdio: 'ignore' });
  await rm(helperScriptRoot, { recursive: true, force: true });
}

assert.equal(/installDisposableContainerSignalCleanup\s*\(/.test(isolatedSource), true, 'isolated runner must install SIGINT/SIGTERM cleanup');
assert.equal(/cleanupOwnIsolatedContainer/.test(isolatedSource), true, 'isolated runner finally and signal handlers share cleanupOwnIsolatedContainer');

const runnerHolderPrefix = `meetwise-e2e-`;
const runnerEnv = {
  PATH: process.env.PATH ?? '',
  LANG: 'C',
  LC_ALL: 'C',
  TZ: 'UTC',
  E2E_PG_IMAGE: 'pgvector/pgvector:pg16',
};
const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const runner = spawn(process.execPath, [fileURLToPath(new URL('./run-e2e-isolated.mjs', import.meta.url)), 'isolated-env:prove'], {
  cwd: repoRoot,
  env: runnerEnv,
  stdio: ['ignore', 'pipe', 'pipe'],
});
runner.stdout.resume();
runner.stderr.resume();
let runnerContainer = '';
let runnerVolumes = [];
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('isolated runner container did not appear')), 45_000);
    const poll = setInterval(() => {
      if (!runner.pid) return;
      const listed = spawnSync('docker', ['ps', '-a', '--filter', `name=${runnerHolderPrefix}${runner.pid}-`, '--format', '{{.Names}}'], { encoding: 'utf8' });
      const names = (listed.stdout || '').trim().split('\n').filter(Boolean);
      if (names.length === 1) {
        runnerContainer = names[0];
        if (containerExists(runnerContainer)) {
          try {
            runnerVolumes = volumeNamesMountedOn(runnerContainer);
          } catch {
            return;
          }
          if (runnerVolumes.length >= 1) {
            clearTimeout(timer);
            clearInterval(poll);
            resolve();
          }
        }
      }
    }, 250);
    runner.once('exit', (code) => {
      clearTimeout(timer);
      clearInterval(poll);
      reject(new Error(`isolated runner exited early: ${code}`));
    });
  });
  runner.kill('SIGTERM');
  const runnerCode = await new Promise((resolve) => {
    const timer = setTimeout(() => resolve('timeout'), 20_000);
    runner.once('exit', (code, signal) => {
      clearTimeout(timer);
      resolve(signal ? 128 + ({ SIGTERM: 15, SIGINT: 2 }[signal] ?? 0) : (code ?? 1));
    });
  });
  assert.equal(runnerCode, 143, 'isolated runner SIGTERM must exit 143');
  assert.equal(containerExists(runnerContainer), false, 'isolated runner SIGTERM must remove this run container');
  for (const name of runnerVolumes) {
    assert.equal(volumeExists(name), false, `isolated runner SIGTERM must remove this run volume: ${name}`);
  }
  console.log('PASS  isolated runner 收到 SIGTERM 后本次容器与挂载卷均不残留');
} finally {
  if (runner.pid) {
    try { process.kill(runner.pid, 'SIGKILL'); } catch { /* already exited */ }
  }
  if (runnerContainer) spawnSync('docker', ['rm', '-f', '-v', runnerContainer], { stdio: 'ignore' });
}

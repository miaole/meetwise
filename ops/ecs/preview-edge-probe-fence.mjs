import { mkdir, open, readFile, rename, rm, unlink } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

const RELEASE = /^[a-f0-9]{7,64}$/;
const STATES = new Set(['armed', 'timed_out', 'completed']);

function invalid(code) {
  throw new Error(`preview_edge_probe_fence_${code}`);
}

function assertRelease(value) {
  if (!RELEASE.test(value ?? '')) invalid('release_invalid');
}

function assertMonotonicMilliseconds(value, name) {
  if (!Number.isSafeInteger(value) || value < 0) invalid(`${name}_invalid`);
}

function normalize(value) {
  if (value === null) return { state: 'absent' };
  if (!value || value.schemaVersion !== 1 || !STATES.has(value.state)) invalid('invalid');
  if (value.state === 'armed') {
    assertRelease(value.releaseDigest);
    assertMonotonicMilliseconds(value.deadlineMonotonicMs, 'deadline');
  } else if (value.state === 'completed') {
    assertRelease(value.releaseDigest);
    assertMonotonicMilliseconds(value.deadlineMonotonicMs, 'deadline');
    assertMonotonicMilliseconds(value.completedMonotonicMs, 'completed');
    if (value.completedMonotonicMs >= value.deadlineMonotonicMs) invalid('completed_after_deadline');
  } else {
    if (value.releaseDigest !== null && value.releaseDigest !== undefined) assertRelease(value.releaseDigest);
    if (value.deadlineMonotonicMs !== null && value.deadlineMonotonicMs !== undefined) {
      assertMonotonicMilliseconds(value.deadlineMonotonicMs, 'deadline');
    }
    assertMonotonicMilliseconds(value.timedOutMonotonicMs, 'timed_out');
  }
  return value;
}

async function load(path) {
  try {
    return normalize(JSON.parse(await readFile(path, 'utf8')));
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') return { state: 'absent' };
    throw error;
  }
}

async function syncDirectory(path) {
  const handle = await open(path, 'r');
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function writeAtomic(path, value) {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const temporary = `${path}.${process.pid}.${randomUUID()}.tmp`;
  const handle = await open(temporary, 'wx', 0o600);
  try {
    await handle.writeFile(`${JSON.stringify(value)}\n`);
    await handle.sync();
  } finally {
    await handle.close();
  }
  try {
    await rename(temporary, path);
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
  await syncDirectory(dirname(path));
}

export async function readEdgeProbeFence(path) {
  return load(path);
}

export async function armEdgeProbeFence(path, { releaseDigest, deadlineMonotonicMs }) {
  assertRelease(releaseDigest);
  assertMonotonicMilliseconds(deadlineMonotonicMs, 'deadline');
  const prior = await load(path);
  if (prior.state !== 'absent') invalid('already_present');
  const value = { schemaVersion: 1, state: 'armed', releaseDigest, deadlineMonotonicMs };
  await writeAtomic(path, value);
  return value;
}

export async function completeEdgeProbeFence(path, { releaseDigest, nowMonotonicMs }) {
  assertRelease(releaseDigest);
  assertMonotonicMilliseconds(nowMonotonicMs, 'now');
  const prior = await load(path);
  if (prior.state !== 'armed' || prior.releaseDigest !== releaseDigest) invalid('not_armed_for_release');
  if (nowMonotonicMs >= prior.deadlineMonotonicMs) invalid('deadline_elapsed');
  const value = {
    schemaVersion: 1,
    state: 'completed',
    releaseDigest,
    deadlineMonotonicMs: prior.deadlineMonotonicMs,
    completedMonotonicMs: nowMonotonicMs,
  };
  await writeAtomic(path, value);
  return value;
}

export async function timeoutEdgeProbeFence(path, { nowMonotonicMs }) {
  assertMonotonicMilliseconds(nowMonotonicMs, 'now');
  const prior = await load(path);
  if (prior.state === 'completed') return { ...prior, timeoutWon: false };
  if (prior.state === 'timed_out') return { ...prior, timeoutWon: true };
  if (prior.state !== 'armed') invalid('not_armed');
  if (nowMonotonicMs < prior.deadlineMonotonicMs) invalid('deadline_not_elapsed');
  const value = {
    schemaVersion: 1,
    state: 'timed_out',
    releaseDigest: prior.releaseDigest,
    deadlineMonotonicMs: prior.deadlineMonotonicMs,
    timedOutMonotonicMs: nowMonotonicMs,
  };
  await writeAtomic(path, value);
  return { ...value, timeoutWon: true };
}

export async function clearEdgeProbeFence(path) {
  try {
    await unlink(path);
  } catch (error) {
    if (!error || typeof error !== 'object' || error.code !== 'ENOENT') throw error;
  }
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  await syncDirectory(dirname(path));
}

function option(args, name) {
  const index = args.indexOf(name);
  if (index < 0 || index === args.length - 1) invalid(`${name.slice(2)}_required`);
  return args[index + 1];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , command, ...args] = process.argv;
  const path = resolve(option(args, '--path'));
  if (command === 'read') {
    process.stdout.write(`${JSON.stringify(await readEdgeProbeFence(path))}\n`);
  } else if (command === 'arm') {
    process.stdout.write(`${JSON.stringify(await armEdgeProbeFence(path, {
      releaseDigest: option(args, '--release'),
      deadlineMonotonicMs: Number(option(args, '--deadline-ms')),
    }))}\n`);
  } else if (command === 'complete') {
    process.stdout.write(`${JSON.stringify(await completeEdgeProbeFence(path, {
      releaseDigest: option(args, '--release'),
      nowMonotonicMs: Number(option(args, '--now-ms')),
    }))}\n`);
  } else if (command === 'timeout') {
    process.stdout.write(`${JSON.stringify(await timeoutEdgeProbeFence(path, {
      nowMonotonicMs: Number(option(args, '--now-ms')),
    }))}\n`);
  } else if (command === 'clear') {
    await clearEdgeProbeFence(path);
  } else {
    invalid('command_invalid');
  }
}

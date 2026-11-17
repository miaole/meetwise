#!/usr/bin/env node
/**
 * R3 / PR-D：新负载失败或未完成时，不得消费另一轮的成功文件。
 * 不启动沙箱，不证明 HA。releaseEvidence=false。
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V7_CLOCK_SKEW_MS,
  V7_LOAD_COUNT,
  V7_LOAD_PATH,
  V7_MIN_SUCCESSES,
  acceptLoadArtifact,
  acceptV7Attempt,
  loadArtifactName,
} from './v7-load-attribution.mjs';

const failures = [];
const A = (name, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
  if (!cond) failures.push(name);
};

const runId = '11111111-1111-4111-8111-111111111111';
const otherId = '22222222-2222-4222-8222-222222222222';
const t0 = Date.parse('2026-11-17T00:00:00.000Z');
const base = {
  runId,
  count: V7_LOAD_COUNT,
  path: V7_LOAD_PATH,
  minSuccesses: V7_MIN_SUCCESSES,
  attemptStartedAtMs: t0,
  readAtMs: t0 + 60_000,
  clockSkewMs: V7_CLOCK_SKEW_MS,
};

function artifact(overrides = {}) {
  return {
    runId,
    count: V7_LOAD_COUNT,
    path: V7_LOAD_PATH,
    failures: 2,
    statuses: { 200: 38 },
    startedAt: new Date(t0 + 100).toISOString(),
    finishedAt: new Date(t0 + 5_000).toISOString(),
    complete: true,
    ...overrides,
  };
}

const good = artifact();
A('正常：本轮 run-id、完成标记、次数、路径、时间窗和至少一个成功', acceptLoadArtifact(good, base).ok);
A('正常：文件名绑本轮 run-id', loadArtifactName(1, runId) === `out-load1-${runId}.json`);

const old = artifact({
  runId: otherId,
  startedAt: '2000-01-01T00:00:00.000Z',
  finishedAt: '2000-01-01T00:00:01.000Z',
});
A('异常：预置的旧成功文件 run-id 不符必须红', acceptLoadArtifact(old, base).ok === false);

A('异常：未写完（complete 不是 true）必须红', acceptLoadArtifact(artifact({ complete: false }), base).ok === false);
A('异常：不是 JSON 对象必须红', acceptLoadArtifact(null, base).ok === false);
A('异常：零成功即使没有 5xx 也必须红', acceptLoadArtifact(artifact({ failures: V7_LOAD_COUNT, statuses: {} }), base).ok === false);
A('异常：出现 5xx 必须红', acceptLoadArtifact(artifact({ statuses: { 200: 39, 503: 1 }, failures: 0 }), base).ok === false);
A('异常：早于本轮开始的完成文件必须红', acceptLoadArtifact(artifact({
  startedAt: new Date(t0 - 60_000).toISOString(),
  finishedAt: new Date(t0 - 50_000).toISOString(),
}), base).ok === false);

const killedAt = t0 + 1_000;
const wave = artifact();
const later = artifact({
  startedAt: new Date(t0 + 6_000).toISOString(),
  finishedAt: new Date(t0 + 8_000).toISOString(),
});
const attempt = {
  runId,
  count: V7_LOAD_COUNT,
  path: V7_LOAD_PATH,
  minSuccesses: V7_MIN_SUCCESSES,
  attemptStartedAtMs: t0,
  readAtMs: t0 + 60_000,
  killedAtMs: killedAt,
  startups: [true, true, true],
  loads: [wave, later, later],
};
A('正常：第一波的 kill 落在开始和结束之间，后两波不要求同一窗口', acceptV7Attempt(attempt).ok);
A('这是本地失败终态演练，不是业务恢复，也不是生产 HA',
  acceptV7Attempt(attempt).notBusinessRecovery === true && acceptV7Attempt(attempt).notProductionHa === true);

A('异常：启动失败时，即便三份看起来成功也必须红',
  acceptV7Attempt({ ...attempt, startups: [false, true, true] }).ok === false);
A('异常：kill 发生在第一波结束之后，不能算负载中故障',
  acceptV7Attempt({ ...attempt, killedAtMs: t0 + 9_000 }).reasons.some((reason) => reason.includes('overlap')));

const sandbox = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'ha-sandbox.mjs'), 'utf8');
const v7 = sandbox.slice(sandbox.indexOf('async function cmdV7'));
A('变异：cmdV7 不再读取固定的 out-load1/2/3.json',
  !v7.includes('out-load1.json') && !v7.includes('out-load2.json') && !v7.includes('out-load3.json'));
A('变异：cmdV7 必须把启动结果交给 acceptV7Attempt',
  v7.includes('acceptV7Attempt') && v7.includes('startups'));

const exit = failures.length === 0 ? 0 : 1;
console.log(`ATTEMPT_END EXIT=${exit} fail=${failures.length}`);
process.exit(exit);

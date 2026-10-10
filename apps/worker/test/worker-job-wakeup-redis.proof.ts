/**
 * Live Redis Streams wakeup helper prove against compose.mysql-local :63809.
 * releaseEvidence=false. Not HA. Does not disable PG LISTEN path.
 */
import {
  WORKER_JOB_WAKEUP_PAYLOAD,
  WORKER_JOB_WAKEUP_REDIS_FIELD,
  WORKER_JOB_WAKEUP_REDIS_GROUP,
  WORKER_JOB_WAKEUP_REDIS_STREAM,
} from '@meetwise/db';
import {
  consumeWorkerJobWakeupOnce,
  createWakeupRedisClient,
  ensureWorkerJobWakeupGroup,
  isRedisStreamsWakeupEnabled,
  publishWorkerJobWakeup,
} from '../src/worker-job-wakeup-redis.ts';

let failures = 0;
const check = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

async function main() {
  check('flag default off (empty env)', isRedisStreamsWakeupEnabled({}) === false);
  check('flag 0 off', isRedisStreamsWakeupEnabled({ MEETWISE_WAKEUP_REDIS_STREAMS: '0' }) === false);
  check('flag 1 on', isRedisStreamsWakeupEnabled({ MEETWISE_WAKEUP_REDIS_STREAMS: '1' }) === true);

  const url = process.env.MEETWISE_WAKEUP_REDIS_URL?.trim() || 'redis://127.0.0.1:63809';
  const stream = `${WORKER_JOB_WAKEUP_REDIS_STREAM}:prove:${Date.now()}`;
  const group = `${WORKER_JOB_WAKEUP_REDIS_GROUP}_prove`;
  const consumer = `prove-${process.pid}`;

  const client = await createWakeupRedisClient(url);
  try {
    await ensureWorkerJobWakeupGroup(client, stream, group);
    const id = await publishWorkerJobWakeup(client, { stream, maxlenApprox: 64 });
    check('XADD returned stream id', typeof id === 'string' && id.length > 0);

    const wakes = await consumeWorkerJobWakeupOnce(client, {
      stream,
      group,
      consumer,
      blockMs: 2_000,
      count: 8,
    });
    check('XREADGROUP consumed exactly one wake', wakes === 1);
    check('wake payload constant is wake-only token', WORKER_JOB_WAKEUP_PAYLOAD === 'wake');
    check('stream field carries payload key', WORKER_JOB_WAKEUP_REDIS_FIELD === 'payload');

    // Second read should see nothing new
    const second = await consumeWorkerJobWakeupOnce(client, {
      stream, group, consumer, blockMs: 200, count: 8,
    });
    check('no duplicate wake on empty PEL window', second === 0);
  } finally {
    try { await (client as any).del?.(stream); } catch { /* best-effort cleanup */ }
    await client.close().catch(() => undefined);
  }

  console.log(failures === 0
    ? '✓ Redis Streams wakeup helper proof passed (PG LISTEN path not exercised/disabled)'
    : `✗ ${failures} failures`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();

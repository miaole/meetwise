/**
 * Deterministic lifecycle contract for the dedicated LISTEN session.
 * This deliberately does not claim PostgreSQL trigger semantics: the true-PG
 * commit/rollback and multi-worker cases require the isolated DB harness.
 */
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { WORKER_JOB_WAKEUP_CHANNEL, WORKER_JOB_WAKEUP_PAYLOAD } from '@meetwise/db';
import { startWorkerJobWakeupListener } from '../src/job-wakeup-listener.ts';

let failures = 0;
const check = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitFor(predicate: () => boolean, timeoutMs = 300): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) return true;
    await sleep(2);
  }
  return predicate();
}

class FakeClient extends EventEmitter {
  readonly queries: string[] = [];
  releases = 0;
  async query(sql: string) { this.queries.push(sql); return { rows: [], rowCount: 0 }; }
  release() { this.releases++; }
}

async function main() {
  const first = new FakeClient();
  const second = new FakeClient();
  const clients = [first, second];
  let connects = 0;
  let wakes = 0;
  const listener = startWorkerJobWakeupListener({ end: async () => undefined } as any, () => { wakes++; }, {
    connect: async () => clients[connects++] as any,
    reconnectBaseMs: 1,
    reconnectMaxMs: 1,
    random: () => 0,
  });

  check('LISTEN 成功后立即请求一次 reconcile', await waitFor(() => first.queries.includes(`LISTEN ${WORKER_JOB_WAKEUP_CHANNEL}`) && wakes === 1));
  first.emit('notification', { channel: 'wrong_channel', payload: WORKER_JOB_WAKEUP_PAYLOAD });
  first.emit('notification', { channel: WORKER_JOB_WAKEUP_CHANNEL, payload: 'wrong_payload' });
  await sleep(5);
  check('错误 channel 或 payload 不唤醒 worker', wakes === 1);
  first.emit('notification', { channel: WORKER_JOB_WAKEUP_CHANNEL, payload: WORKER_JOB_WAKEUP_PAYLOAD });
  check('固定、无数据 payload 才唤醒 worker', await waitFor(() => wakes === 2));

  first.emit('error', new Error('injected_listener_disconnect'));
  check('断线后使用新的独占 session 重连并 reconcile', await waitFor(() => second.queries.includes(`LISTEN ${WORKER_JOB_WAKEUP_CHANNEL}`) && wakes === 3));
  check('断线 client 已释放', first.releases === 1);
  await listener.stop();
  const wakesAfterStop = wakes;
  second.emit('notification', { channel: WORKER_JOB_WAKEUP_CHANNEL, payload: WORKER_JOB_WAKEUP_PAYLOAD });
  await sleep(5);
  check('stop 后的迟到通知不会再唤醒 drain', wakes === wakesAfterStop && second.releases === 1);

  let failingConnects = 0;
  const retrying = startWorkerJobWakeupListener({ end: async () => undefined } as any, () => {}, {
    connect: async () => { failingConnects++; throw new Error('injected_connect_failure'); },
    reconnectBaseMs: 40,
    reconnectMaxMs: 40,
    random: () => 0,
  });
  check('失败连接已开始一次', await waitFor(() => failingConnects === 1));
  await retrying.stop();
  await sleep(60);
  check('stop 取消 listener 的重连 timer', failingConnects === 1);

  const migration = readFileSync(fileURLToPath(new URL('../../../packages/db/migrations/0084_worker_job_wakeup_notifications.sql', import.meta.url)), 'utf8');
  check('迁移对四个持久队列安装 queued transition trigger', ['interview_job', 'quiz_job', 'diagnosis_job', 'ai_report'].every((table) => migration.includes(`CREATE TRIGGER ${table}_worker_wakeup_after_queued`)));
  check('迁移只发送固定 wake payload，不携带作业或租户数据', migration.includes("pg_notify('meetwise_worker_wakeup_v1', 'wake')"));

  console.log(`\n${failures === 0 ? '✓ worker listener lifecycle proof passed' : `✗ ${failures} failures`}`);
  process.exit(failures === 0 ? 0 : 1);
}
void main();

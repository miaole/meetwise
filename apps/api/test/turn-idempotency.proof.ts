/**
 * /turn 的正向边界证明（真 Nest HTTP + 真 Postgres 队列）。
 *
 * quote repair 在 worker 的同一 answer job 内运行；API 必须先把 question identity、
 * answer hash 和 turn 固化为**唯一一个** job，才谈得上“repair 不新开业务 turn”。
 * 这条证明刻意不调用模型，验证 HTTP 层不会因网络重发制造第二个 answer job。
 * pnpm turn-idempotency:prove
 */
import { createHash, randomUUID } from 'node:crypto';
import { boot } from './_neg-harness';

const h = await boot();
let failures = 0;
const A = (name: string, condition: boolean) => {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`);
  if (!condition) failures++;
};
const OWNER = 'userA';
const IID = `IV_QUOTE_REPAIR_HTTP_${Date.now()}`;
const answer = '我会用 Redis 令牌桶限制入口流量，超限后快速失败并保护下游。';
const body = {
  questionId: 'q-v1-t0-c0', stateVersion: 1, answerId: randomUUID(),
  answerHash: createHash('sha256').update(answer, 'utf8').digest('hex'), turn: 0, answer,
};

// created + start job 表示已 begin；题目 ledger 是 worker 已持久化的 pending identity。
await h.pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')", [IID, OWNER]);
await h.pool.query("INSERT INTO interview_job(owner_user_id,interview_id,kind,seq,payload) VALUES ($1,$2,'start',0,'{}')", [OWNER, IID]);
await h.pool.query("INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,status) VALUES ($1,$2,$3,1,0,'请说明高峰限流方案','issued')", [OWNER, IID, body.questionId]);

const headers = h.U(OWNER);
const [first, replay] = await Promise.all([
  h.post(`/interview/${IID}/turn`, headers, body),
  h.post(`/interview/${IID}/turn`, headers, body),
]);

A('同一 HTTP turn 并发重发均被受理为同一业务答案（accepted/replayed）',
  first.status === 202 && replay.status === 202 && [first.body?.accepted, replay.body?.accepted].filter(Boolean).length === 1 && [first.body?.replayed, replay.body?.replayed].filter(Boolean).length === 1);
const jobs = await h.pool.query("SELECT id,payload FROM interview_job WHERE interview_id=$1 AND kind='answer' AND seq=1", [IID]);
const question = await h.pool.query('SELECT status,answer_id,answer_hash FROM interview_question WHERE interview_id=$1 AND question_id=$2', [IID, body.questionId]);
A('队列中只有 1 个 answer job，payload 保留原 questionId/stateVersion/answer，不会因 repair 另起 turn',
  jobs.rowCount === 1 && jobs.rows[0]?.payload?.questionId === body.questionId && jobs.rows[0]?.payload?.stateVersion === 1 && jobs.rows[0]?.payload?.answer === answer);
A('question ledger 只绑定第一次的 answer identity/hash，重发不覆盖它',
  question.rowCount === 1 && question.rows[0]?.status === 'queued' && question.rows[0]?.answer_id === body.answerId && question.rows[0]?.answer_hash === body.answerHash);

console.log(`\n${failures === 0 ? '✓ turn-idempotency: HTTP→队列→question ledger 幂等证明全部通过' : `✗ turn-idempotency: ${failures} 项失败`}`);
process.exit(failures === 0 ? 0 : 1);
